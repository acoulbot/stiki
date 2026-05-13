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

/** Normalize a string for fuzzy matching: lowercase, replace separators with spaces, collapse whitespace, trim */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[_\-–—.,()\[\]{}]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Remove all non-alphanumeric (keeping cyrillic) for strict comparison */
function strictNormalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]/g, "")
    .trim();
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
  const normalizedMap = new Map<string, { id: string; name: string }>();
  const strictMap = new Map<string, { id: string; name: string }>();
  const colorMap = new Map<string, { id: string; name: string }>();
  for (const p of products) {
    const norm = normalize(p.name);
    const strict = strictNormalize(p.name);
    if (!normalizedMap.has(norm)) normalizedMap.set(norm, { id: p.id, name: p.name });
    if (!strictMap.has(strict)) strictMap.set(strict, { id: p.id, name: p.name });
    // Also index by "name - color" pattern for files like "IQOS Iluma - синий.jpg"
    if (p.color) {
      const nameColor = normalize(`${p.name} ${p.color}`);
      if (!colorMap.has(nameColor)) colorMap.set(nameColor, { id: p.id, name: p.name });
    }
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "products");
  await mkdir(uploadDir, { recursive: true });

  const results: { fileName: string; matched: boolean; productName?: string; error?: string }[] = [];
  let matchedCount = 0;
  let unmatchedCount = 0;

  for (const file of files) {
    const ext = path.extname(file.name).toLowerCase();
    const baseName = path.basename(file.name, ext);

    // Try matching: first normalized, then strict
    const normName = normalize(baseName);
    const strictName = strictNormalize(baseName);

    let matched = normalizedMap.get(normName) || strictMap.get(strictName) || colorMap.get(normName);

    // If no match, try partial match (file name contains product name or vice versa)
    if (!matched) {
      let bestScore = 0;
      for (const p of products) {
        const pNorm = normalize(p.name);
        const pStrict = strictNormalize(p.name);
        if (normName === pNorm || normName.includes(pNorm) || pNorm.includes(normName)) {
          const score = pNorm.length;
          if (score > bestScore) {
            matched = { id: p.id, name: p.name };
            bestScore = score;
          }
        } else if (strictName.includes(pStrict) || pStrict.includes(strictName)) {
          const score = pStrict.length;
          if (score > bestScore) {
            matched = { id: p.id, name: p.name };
            bestScore = score;
          }
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
