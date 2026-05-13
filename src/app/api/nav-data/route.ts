import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const revalidate = 120;

interface NavProduct {
  name: string;
  slug: string;
  color: string;
  image: string;
}

interface NavModel {
  name: string;
  slug: string;
  products: NavProduct[];
}

interface NavBrand {
  name: string;
  models: NavModel[];
}

interface NavStickBrand {
  name: string;
  slug: string;
  count: number;
}

const DEVICE_MODELS = [
  "IQOS Iluma i Prime",
  "IQOS Iluma i One",
  "IQOS Iluma i",
  "IQOS Iluma Prime",
  "IQOS Iluma One",
  "IQOS Iluma",
  "IQOS 3 Duos",
  "lil Solid Dual",
  "lil Solid EZ",
  "lil SOLID 3.0",
  "lil SOLID 2.0 Plus",
  "lil SOLID 2.0",
  "MOK FWRD",
  "MOK Sensio",
  "Glo Hyper Pro",
  "TEO",
];

function getBrandKey(name: string): string {
  if (name.startsWith("IQOS")) return "IQOS";
  if (name.toLowerCase().startsWith("lil")) return "lil SOLID";
  if (name.startsWith("MOK")) return "MOK";
  if (name.startsWith("Glo")) return "Glo";
  if (name.startsWith("TEO")) return "TEO";
  return name;
}

function getModelKey(productName: string): string {
  for (const m of DEVICE_MODELS) {
    if (productName.toLowerCase().startsWith(m.toLowerCase())) return m;
  }
  return productName.split(" - ")[0];
}

function slugify(s: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
    з: "z", и: "i", й: "j", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c",
    ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  return s
    .toLowerCase()
    .split("")
    .map((c) => map[c] || c)
    .join("")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function extractStickBrand(subcategoryName: string): string {
  const m = subcategoryName.match(/^Стики\s+(.+?)\s+для\s/i);
  if (m) return m[1];
  return subcategoryName;
}

export async function GET() {
  const topCategories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
  });

  const deviceCat = topCategories.find((c) => c.name === "Нагреватели табака");
  const stickCat = topCategories.find((c) => c.name === "Стики для нагревателей");

  // ---- DEVICES ----
  const deviceBrands: NavBrand[] = [];

  if (deviceCat) {
    const allDeviceProducts = await prisma.product.findMany({
      where: {
        category: {
          OR: [{ id: deviceCat.id }, { parentId: deviceCat.id }],
        },
      },
      select: { name: true, slug: true, color: true, image: true },
      orderBy: { name: "asc" },
    });

    const brandModelMap = new Map<string, Map<string, NavProduct[]>>();
    const brandOrder = ["IQOS", "lil SOLID", "MOK", "Glo", "TEO"];

    for (const p of allDeviceProducts) {
      const brand = getBrandKey(p.name);
      const model = getModelKey(p.name);

      if (!brandModelMap.has(brand)) brandModelMap.set(brand, new Map());
      const models = brandModelMap.get(brand)!;
      if (!models.has(model)) models.set(model, []);
      models.get(model)!.push({
        name: p.name,
        slug: p.slug,
        color: p.color || "",
        image: p.image || "",
      });
    }

    for (const brandName of brandOrder) {
      const models = brandModelMap.get(brandName);
      if (!models) continue;

      const navModels: NavModel[] = [];
      for (const [modelName, products] of models) {
        navModels.push({
          name: modelName,
          slug: slugify(modelName),
          products,
        });
      }
      deviceBrands.push({ name: brandName, models: navModels });
    }
  }

  // ---- STICKS ----
  const stickBrands: NavStickBrand[] = [];

  if (stickCat) {
    const stickSubcats = await prisma.category.findMany({
      where: { parentId: stickCat.id },
      include: { _count: { select: { products: true } } },
      orderBy: { order: "asc" },
    });

    for (const sc of stickSubcats) {
      if (sc._count.products === 0) continue;
      stickBrands.push({
        name: extractStickBrand(sc.name),
        slug: sc.slug,
        count: sc._count.products,
      });
    }

    stickBrands.sort((a, b) => b.count - a.count);
  }

  return NextResponse.json({ devices: deviceBrands, sticks: stickBrands });
}
