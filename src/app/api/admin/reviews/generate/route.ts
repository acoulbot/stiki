import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import { generateReview, hasGeminiKey, type ReviewProductInput } from "@/lib/reviewGen";

function checkAdmin(request: Request): boolean {
  const token = getTokenFromRequest(request);
  if (!token) return false;
  const payload = verifyToken(token);
  return !!payload && payload.role === "admin";
}

export const maxDuration = 60;

interface ProductRow {
  id: string;
  name: string;
  brand: string;
  productType: string;
  category: { name: string } | null;
}

function toInput(p: ProductRow): ReviewProductInput {
  return { name: p.name, brand: p.brand, productType: p.productType, category: p.category?.name };
}

// POST — сгенерировать отзыв(ы)
//  Черновик для одного товара:  { productId, rating?, authorName? }  -> не сохраняется
//  Массовая генерация:          { bulk: true, onlyMissing?, perProduct?, publish? } -> сохраняется
export async function POST(request: Request) {
  if (!checkAdmin(request)) return Response.json({ error: "Нет доступа" }, { status: 401 });

  const body = await request.json().catch(() => ({}));

  // --- Массовая генерация для всех товаров ---
  if (body.bulk) {
    const onlyMissing = body.onlyMissing !== false; // по умолчанию только без отзывов
    const perProduct = Math.min(Math.max(Number(body.perProduct) || 1, 1), 5);
    const publish = body.publish === undefined ? true : Boolean(body.publish);

    const products = await prisma.product.findMany({
      include: {
        category: { select: { name: true } },
        _count: { select: { reviews: true } },
      },
    });

    const targets = onlyMissing ? products.filter((p) => p._count.reviews === 0) : products;

    let created = 0;
    let usedGemini = false;
    for (const p of targets) {
      for (let i = 0; i < perProduct; i++) {
        const gen = await generateReview(toInput(p));
        if (gen.engine === "gemini") usedGemini = true;
        await prisma.review.create({
          data: {
            productId: p.id,
            authorName: gen.authorName,
            rating: gen.rating,
            text: gen.text,
            published: publish,
            source: "ai",
          },
        });
        created++;
      }
    }

    return Response.json({
      created,
      productsProcessed: targets.length,
      engine: usedGemini ? "gemini" : "local",
      skipped: products.length - targets.length,
    });
  }

  // --- Черновик для одного товара (без сохранения) ---
  const { productId, rating, authorName } = body;
  if (!productId) return Response.json({ error: "Не указан товар" }, { status: 400 });

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: { select: { name: true } } },
  });
  if (!product) return Response.json({ error: "Товар не найден" }, { status: 404 });

  const gen = await generateReview(toInput(product), {
    rating: rating ? Number(rating) : undefined,
    authorName: authorName || undefined,
  });

  return Response.json({
    authorName: gen.authorName,
    rating: gen.rating,
    text: gen.text,
    engine: gen.engine,
  });
}

// GET — статус: доступна ли реальная нейросеть Google
export async function GET(request: Request) {
  if (!checkAdmin(request)) return Response.json({ error: "Нет доступа" }, { status: 401 });
  return Response.json({ gemini: hasGeminiKey() });
}
