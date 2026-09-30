import "dotenv/config";
import { copyFileSync, existsSync } from "fs";
import path from "path";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const apply = process.argv.includes("--apply");
const rawUrl = process.env.DATABASE_URL || "file:./dev.db";
if (!rawUrl.startsWith("file:")) throw new Error("Мигратор поддерживает только SQLite (DATABASE_URL=file:...)");
const rawPath = rawUrl.slice(5);
const dbPath = path.isAbsolute(rawPath) ? rawPath : path.resolve(process.cwd(), rawPath);
if (!existsSync(dbPath)) throw new Error(`База не найдена: ${dbPath}`);

if (apply) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = `${dbPath}.backup-before-catalog-${stamp}`;
  copyFileSync(dbPath, backupPath);
  console.log(`Резервная копия: ${backupPath}`);
}

const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });
const normalized = (value: string) => value.trim().toLocaleLowerCase("ru");
const rootAliases = {
  device: new Set(["устройства", "нагреватели табака", "девайсы"]),
  stick: new Set(["стики", "стики для нагревателей"]),
};

function slugBase(value: string) {
  const map: Record<string, string> = { а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"yo",ж:"zh",з:"z",и:"i",й:"j",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",у:"u",ф:"f",х:"h",ц:"c",ч:"ch",ш:"sh",щ:"shch",ъ:"",ы:"y",ь:"",э:"e",ю:"yu",я:"ya" };
  return value.toLocaleLowerCase("ru").split("").map((char) => map[char] ?? char).join("").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "category";
}

async function uniqueSlug(name: string) {
  const base = slugBase(name); let slug = base; let index = 2;
  while (await prisma.category.findUnique({ where: { slug } })) slug = `${base}-${index++}`;
  return slug;
}

function inferredBrand(type: "device" | "stick", categoryName: string, productName: string, storedBrand: string) {
  if (storedBrand.trim()) return storedBrand.trim();
  if (type === "stick") {
    const match = categoryName.match(/^Стики\s+(.+?)\s+для\s/i);
    return match?.[1]?.trim() || productName.split(/[\s-]/)[0] || "Без бренда";
  }
  const source = `${categoryName} ${productName}`.trim();
  if (/^iqos/i.test(source)) return "IQOS";
  if (/^lil/i.test(source)) return "lil SOLID";
  if (/^glo/i.test(source)) return "Glo";
  if (/^mok/i.test(source)) return "MOK";
  if (/^teo/i.test(source)) return "TEO";
  return source.split(/[\s-]/)[0] || "Без бренда";
}

async function getOrCreate(name: string, parentId: string, order: number) {
  const existing = await prisma.category.findFirst({ where: { parentId, name } });
  if (existing) return existing;
  if (!apply) return { id: `dry:${parentId}:${name}`, name, parentId, slug: slugBase(name), icon: "", order, metaTitle: "", metaDescription: "", seoText: "" };
  return prisma.category.create({ data: { name, parentId, order, slug: await uniqueSlug(name) } });
}

async function main() {
  const categories = await prisma.category.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] });
  let created = 0, movedCategories = 0, movedProducts = 0;

  for (const type of ["device", "stick"] as const) {
    const root = categories.find((category) => !category.parentId && rootAliases[type].has(normalized(category.name)));
    if (!root) { console.log(`${type}: корневая категория не найдена, пропуск`); continue; }
    if (apply && root.name !== (type === "device" ? "Устройства" : "Стики")) {
      await prisma.category.update({ where: { id: root.id }, data: { name: type === "device" ? "Устройства" : "Стики" } });
    }
    const models = categories.filter((category) => category.parentId === root.id);
    let brandOrder = 0;
    for (const model of models) {
      const products = await prisma.product.findMany({ where: { categoryId: model.id }, orderBy: { name: "asc" } });
      if (!products.length) continue;
      const brandName = inferredBrand(type, model.name, products[0].name, products[0].brand);
      const beforeBrand = await prisma.category.findFirst({ where: { parentId: root.id, name: brandName } });
      const brand = await getOrCreate(brandName, root.id, brandOrder++);
      if (!beforeBrand) created++;
      if (model.parentId !== brand.id && model.id !== brand.id) {
        if (apply) await prisma.category.update({ where: { id: model.id }, data: { parentId: brand.id } });
        movedCategories++;
      }
      let colorOrder = 0;
      for (const product of products) {
        const colorName = product.color.trim() || "Без цвета";
        const beforeColor = apply ? await prisma.category.findFirst({ where: { parentId: model.id, name: colorName } }) : null;
        const color = await getOrCreate(colorName, model.id, colorOrder++);
        if (!beforeColor) created++;
        if (apply) {
          await prisma.product.update({
            where: { id: product.id },
            data: { categoryId: color.id, productType: type, brand: brandName, color: product.color.trim() || colorName },
          });
        }
        movedProducts++;
      }
    }
  }
  console.log(`${apply ? "Готово" : "Предпросмотр"}: новых категорий ${created}, перемещений категорий ${movedCategories}, товаров ${movedProducts}.`);
  if (!apply) console.log("Изменений нет. Для применения: npm run catalog:migrate -- --apply");
}

main().finally(() => prisma.$disconnect());
