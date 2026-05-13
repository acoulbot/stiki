import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

function checkAdmin(request: Request): boolean {
  const token = getTokenFromRequest(request);
  if (!token) return false;
  const payload = verifyToken(token);
  return !!payload && payload.role === "admin";
}

/** Normalize a string for fuzzy matching */
function normalize(s: string): string {
  return s
    .normalize("NFC")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[_\-–—.,()\[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Remove all non-alphanumeric (keeping cyrillic) for strict comparison */
function strictNormalize(s: string): string {
  return s
    .normalize("NFC")
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-яе0-9]/g, "")
    .trim();
}

/** Strip trailing Latin-only slug suffix from a normalized filename.
 *  Image files often have a transliterated category slug appended,
 *  e.g. "iqos iluma prime синий nagrevateli tabaka" → "iqos iluma prime синий" */
function stripSlugSuffix(normalized: string): string {
  const words = normalized.split(" ");
  let lastCyrIdx = -1;
  for (let i = words.length - 1; i >= 0; i--) {
    if (/[а-яе]/.test(words[i])) {
      lastCyrIdx = i;
      break;
    }
  }
  if (lastCyrIdx >= 0 && lastCyrIdx < words.length - 1) {
    return words.slice(0, lastCyrIdx + 1).join(" ");
  }
  return normalized;
}

/** Calculate token (word) overlap ratio between two normalized strings */
function tokenScore(a: string, b: string): number {
  const tokA = a.split(" ").filter((w) => w.length > 1);
  const tokB = new Set(b.split(" ").filter((w) => w.length > 1));
  if (tokA.length === 0 || tokB.size === 0) return 0;
  let overlap = 0;
  for (const t of tokA) {
    if (tokB.has(t)) overlap++;
  }
  return overlap / Math.max(tokA.length, tokB.size);
}

const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB per file
const MAX_TOTAL_SIZE = 600 * 1024 * 1024; // 600 MB total

export const maxDuration = 300;

export async function POST(request: Request) {
  if (!checkAdmin(request)) {
    return Response.json({ error: "Нет доступа" }, { status: 401 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Ошибка загрузки. Возможно, файлы слишком большие." }, { status: 413 });
  }

  const files = formData.getAll("files") as File[];
  if (files.length === 0) {
    return Response.json({ error: "Файлы не выбраны" }, { status: 400 });
  }

  // Validate files
  let totalSize = 0;
  for (const file of files) {
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      return Response.json({ error: `Неподдерживаемый формат: ${file.name}` }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ error: `Файл слишком большой: ${file.name} (макс 20 МБ)` }, { status: 400 });
    }
    totalSize += file.size;
    if (totalSize > MAX_TOTAL_SIZE) {
      return Response.json({ error: "Общий размер файлов превышает 600 МБ" }, { status: 413 });
    }
  }

  // Load all products for matching
  const products = await prisma.product.findMany({
    select: { id: true, name: true, color: true, image: true },
  });

  // Build lookup maps
  type Ref = { id: string; name: string };
  const normalizedMap = new Map<string, Ref>();
  const strictMap = new Map<string, Ref>();
  for (const p of products) {
    const norm = normalize(p.name);
    const strict = strictNormalize(p.name);
    const ref: Ref = { id: p.id, name: p.name };
    if (!normalizedMap.has(norm)) normalizedMap.set(norm, ref);
    if (!strictMap.has(strict)) strictMap.set(strict, ref);
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(uploadDir, { recursive: true });

  const results: { fileName: string; matched: boolean; productName?: string; error?: string }[] = [];
  let matchedCount = 0;
  let unmatchedCount = 0;

  for (const file of files) {
    const ext = path.extname(file.name).toLowerCase();
    const baseName = path.basename(file.name, ext);

    const normName = normalize(baseName);
    const strictName = strictNormalize(baseName);
    const strippedName = stripSlugSuffix(normName);

    // 1) Exact maps (normalized / strict / suffix-stripped)
    let matched: Ref | undefined =
      normalizedMap.get(normName) ??
      normalizedMap.get(strippedName) ??
      strictMap.get(strictName);

    // 2) Substring match — filename contains product name or vice-versa
    if (!matched) {
      let bestLen = 0;
      for (const p of products) {
        const pNorm = normalize(p.name);
        if (
          strippedName === pNorm ||
          strippedName.includes(pNorm) ||
          pNorm.includes(strippedName) ||
          normName.includes(pNorm) ||
          pNorm.includes(normName)
        ) {
          if (pNorm.length > bestLen) {
            matched = { id: p.id, name: p.name };
            bestLen = pNorm.length;
          }
        }
      }
    }

    // 3) Strict substring match
    if (!matched) {
      let bestLen = 0;
      for (const p of products) {
        const pStrict = strictNormalize(p.name);
        if (strictName.includes(pStrict) || pStrict.includes(strictName)) {
          if (pStrict.length > bestLen) {
            matched = { id: p.id, name: p.name };
            bestLen = pStrict.length;
          }
        }
      }
    }

    // 4) Prefix match — for truncated filenames where the name got cut off
    if (!matched) {
      let bestLen = 0;
      for (const p of products) {
        const pNorm = normalize(p.name);
        if (pNorm.startsWith(strippedName) || strippedName.startsWith(pNorm)) {
          if (pNorm.length > bestLen) {
            matched = { id: p.id, name: p.name };
            bestLen = pNorm.length;
          }
        }
      }
    }

    // 5) Token overlap — fuzzy fallback (≥70% word overlap)
    if (!matched) {
      let bestTs = 0;
      for (const p of products) {
        const pNorm = normalize(p.name);
        const ts = tokenScore(strippedName, pNorm);
        if (ts >= 0.7 && ts > bestTs) {
          matched = { id: p.id, name: p.name };
          bestTs = ts;
        }
      }
    }

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const safeFileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
      await writeFile(path.join(uploadDir, safeFileName), buffer);
      const imageUrl = `/api/uploads/products/${safeFileName}`;

      if (matched) {
        await prisma.product.update({
          where: { id: matched.id },
          data: { image: imageUrl },
        });
        results.push({ fileName: file.name, matched: true, productName: matched.name });
        matchedCount++;
      } else {
        results.push({ fileName: file.name, matched: false });
        unmatchedCount++;
      }
    } catch (err) {
      results.push({ fileName: file.name, matched: false, error: String(err) });
      unmatchedCount++;
    }
  }

  return Response.json({
    total: files.length,
    matched: matchedCount,
    unmatched: unmatchedCount,
    results,
  });
}
