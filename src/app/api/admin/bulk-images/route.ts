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
    .replace(/[_\-–—.,()\[\]{}'"`«»]/g, " ")
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

/** Strip trailing Latin-only slug suffix from a normalized filename */
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

/** Length of common prefix between two strings */
function commonPrefixLen(a: string, b: string): number {
  const len = Math.min(a.length, b.length);
  let i = 0;
  while (i < len && a[i] === b[i]) i++;
  return i;
}

/** Extract leaf filename — handle both / and \ separators */
function leafName(fileName: string): string {
  const slashIdx = fileName.lastIndexOf("/");
  const backIdx = fileName.lastIndexOf("\\");
  const idx = Math.max(slashIdx, backIdx);
  return idx >= 0 ? fileName.slice(idx + 1) : fileName;
}

const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_TOTAL_SIZE = 600 * 1024 * 1024;

export const maxDuration = 300;

type Ref = { id: string; name: string };
type IndexedProduct = Ref & { norm: string; strict: string };

export async function POST(request: Request) {
  if (!checkAdmin(request)) {
    return Response.json({ error: "Нет доступа" }, { status: 401 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json(
      { error: "Ошибка загрузки. Возможно, файлы слишком большие." },
      { status: 413 },
    );
  }

  const files = formData.getAll("files") as File[];
  if (files.length === 0) {
    return Response.json({ error: "Файлы не выбраны" }, { status: 400 });
  }

  let totalSize = 0;
  for (const file of files) {
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXT.includes(ext)) {
      return Response.json(
        { error: `Неподдерживаемый формат: ${file.name}` },
        { status: 400 },
      );
    }
    if (file.size > MAX_FILE_SIZE) {
      return Response.json(
        { error: `Файл слишком большой: ${file.name} (макс 20 МБ)` },
        { status: 400 },
      );
    }
    totalSize += file.size;
    if (totalSize > MAX_TOTAL_SIZE) {
      return Response.json(
        { error: "Общий размер файлов превышает 600 МБ" },
        { status: 413 },
      );
    }
  }

  const products = await prisma.product.findMany({
    select: { id: true, name: true, color: true, image: true },
  });

  // Precompute normalized forms for all products
  const indexed: IndexedProduct[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    norm: normalize(p.name),
    strict: strictNormalize(p.name),
  }));

  const normalizedMap = new Map<string, Ref>();
  const strictMap = new Map<string, Ref>();
  for (const p of indexed) {
    const ref: Ref = { id: p.id, name: p.name };
    if (!normalizedMap.has(p.norm)) normalizedMap.set(p.norm, ref);
    if (!strictMap.has(p.strict)) strictMap.set(p.strict, ref);
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(uploadDir, { recursive: true });

  const results: {
    fileName: string;
    matched: boolean;
    productName?: string;
    error?: string;
  }[] = [];
  let matchedCount = 0;
  let unmatchedCount = 0;

  for (const file of files) {
    const leaf = leafName(file.name);
    const ext = path.extname(leaf).toLowerCase();
    const baseName = ext ? leaf.slice(0, -ext.length) : leaf;

    const normName = normalize(baseName);
    const strictName = strictNormalize(baseName);
    const strippedName = stripSlugSuffix(normName);

    let matched: Ref | undefined;

    // 1) Exact map lookup
    matched =
      normalizedMap.get(normName) ??
      normalizedMap.get(strippedName) ??
      strictMap.get(strictName) ??
      strictMap.get(strictNormalize(strippedName));

    // 2) Substring match — filename contains product name or vice-versa
    if (!matched) {
      let bestLen = 0;
      for (const p of indexed) {
        if (
          strippedName.includes(p.norm) ||
          p.norm.includes(strippedName) ||
          normName.includes(p.norm) ||
          p.norm.includes(normName)
        ) {
          if (p.norm.length > bestLen) {
            matched = { id: p.id, name: p.name };
            bestLen = p.norm.length;
          }
        }
      }
    }

    // 3) Strict substring match
    if (!matched) {
      let bestLen = 0;
      for (const p of indexed) {
        if (strictName.includes(p.strict) || p.strict.includes(strictName)) {
          if (p.strict.length > bestLen) {
            matched = { id: p.id, name: p.name };
            bestLen = p.strict.length;
          }
        }
      }
    }

    // 4) Character-level prefix match — for truncated filenames
    if (!matched) {
      let bestPrefixLen = 0;
      for (const p of indexed) {
        const prefixLen = commonPrefixLen(normName, p.norm);
        const minRequired = Math.min(normName.length, p.norm.length) * 0.6;
        if (prefixLen >= 15 && prefixLen >= minRequired && prefixLen > bestPrefixLen) {
          matched = { id: p.id, name: p.name };
          bestPrefixLen = prefixLen;
        }
      }
    }

    // 5) Token overlap — fuzzy fallback (≥50% word overlap)
    if (!matched) {
      let bestTs = 0;
      for (const p of indexed) {
        const ts = Math.max(
          tokenScore(strippedName, p.norm),
          tokenScore(normName, p.norm),
        );
        if (ts >= 0.5 && ts > bestTs) {
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
        results.push({
          fileName: file.name,
          matched: true,
          productName: matched.name,
        });
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
