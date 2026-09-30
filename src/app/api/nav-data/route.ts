import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildChildrenMap, findCatalogRoot, getCategoryHref, getDescendantIds, loadAllCategories } from "@/lib/catalogCategories";

export const dynamic = "force-dynamic";

interface NavProduct { name: string; slug: string; color: string; image: string }
interface NavModel { name: string; slug: string; href?: string; products: NavProduct[] }
interface NavBrand { name: string; href?: string; models: NavModel[] }
interface NavStickBrand { name: string; slug: string; href?: string; count: number }

export async function GET() {
  const categories = await loadAllCategories();
  const children = buildChildrenMap(categories);
  const deviceRoot = findCatalogRoot(categories, "device");
  const stickRoot = findCatalogRoot(categories, "stick");
  const deviceBrands: NavBrand[] = [];
  const stickBrands: NavStickBrand[] = [];

  if (deviceRoot) {
    const products = await prisma.product.findMany({
      where: { categoryId: { in: getDescendantIds(deviceRoot.id, categories) } },
      select: { name: true, slug: true, color: true, image: true, categoryId: true, brand: true, productType: true },
      orderBy: { name: "asc" },
    });
    for (const brand of children.get(deviceRoot.id) || []) {
      const models: NavModel[] = [];
      const brandModels = children.get(brand.id) || [];
      for (const model of brandModels) {
        const ids = new Set(getDescendantIds(model.id, categories));
        models.push({
          name: model.name,
          slug: model.slug,
          href: getCategoryHref(model.id, categories),
          products: products.filter((product) => ids.has(product.categoryId)).map(({ name, slug, color, image }) => ({ name, slug, color, image })),
        });
      }
      // Compatibility with the old two-level catalog: products may be assigned directly to a model.
      if (brandModels.length === 0) {
        const direct = products.filter((product) => product.categoryId === brand.id);
        models.push({ name: brand.name, slug: brand.slug, href: getCategoryHref(brand.id, categories), products: direct.map(({ name, slug, color, image }) => ({ name, slug, color, image })) });
      }
      deviceBrands.push({ name: brand.name, href: getCategoryHref(brand.id, categories), models });
    }
  }

  if (stickRoot) {
    for (const brand of children.get(stickRoot.id) || []) {
      const ids = getDescendantIds(brand.id, categories);
      const count = await prisma.product.count({ where: { categoryId: { in: ids } } });
      stickBrands.push({ name: brand.name.replace(/^Стики\s+/i, "").replace(/\s+для\s.+$/i, ""), slug: brand.slug, href: getCategoryHref(brand.id, categories), count });
    }
    stickBrands.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "ru"));
  }

  return NextResponse.json({
    devices: deviceBrands, sticks: stickBrands,
    deviceRootHref: deviceRoot ? getCategoryHref(deviceRoot.id, categories) : "/catalog/devices",
    stickRootHref: stickRoot ? getCategoryHref(stickRoot.id, categories) : "/catalog/sticks",
  });
}
