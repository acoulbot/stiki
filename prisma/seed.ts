import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, "..", "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

interface SeedProduct {
  name: string;
  color: string;
  price: number;
  category: string;
  subcategory: string;
}

interface SeedData {
  categories: Record<string, string[]>;
  products: SeedProduct[];
}

function slug(name: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "zh",
    з: "z", и: "i", й: "j", к: "k", л: "l", м: "m", н: "n", о: "o",
    п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c",
    ч: "ch", ш: "sh", щ: "shch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
  };
  return name.toLowerCase().split("").map(c => map[c] || c).join("")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function main() {
  // Admin — create default only if no admins exist (first install)
  const existingAdmins = await prisma.admin.count();
  if (existingAdmins === 0) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.admin.create({
      data: { username: "admin", password: hashedPassword },
    });
    console.log("Default admin created (login: admin). Change password after first login!");
  } else {
    console.log(`Skipping admin seed — ${existingAdmins} admin(s) already exist.`);
  }

  // Load product data from JSON
  const seedDataPath = path.join(__dirname, "seed-data.json");
  const seedData: SeedData = JSON.parse(readFileSync(seedDataPath, "utf-8"));

  // Top-level categories
  const catIcons: Record<string, string> = {
    "Нагреватели табака": "🔥",
    "Стики для нагревателей": "🚬",
  };

  const topCats: Record<string, string> = {};
  let catOrder = 1;
  for (const catName of Object.keys(seedData.categories)) {
    const s = slug(catName);
    const cat = await prisma.category.upsert({
      where: { slug: s },
      update: {},
      create: { name: catName, slug: s, icon: catIcons[catName] || "", order: catOrder++ },
    });
    topCats[catName] = cat.id;
  }

  // Subcategories
  const allCats: Record<string, string> = { ...topCats };
  for (const [parentName, subs] of Object.entries(seedData.categories)) {
    let order = 1;
    for (const subName of subs) {
      const s = slug(subName);
      const cat = await prisma.category.upsert({
        where: { slug: s },
        update: {},
        create: { name: subName, slug: s, order: order++, parentId: topCats[parentName] },
      });
      allCats[subName] = cat.id;
    }
  }

  // Products
  for (const p of seedData.products) {
    const s = slug(p.name);
    const catId = allCats[p.subcategory] || allCats[p.category];
    if (!catId) { console.log(`Category not found: ${p.subcategory || p.category}`); continue; }
    await prisma.product.upsert({
      where: { slug: s },
      update: {},
      create: {
        name: p.name,
        slug: s,
        price: p.price,
        inStock: 50,
        color: p.color,
        categoryId: catId,
        productType: p.subcategory !== p.category ? p.subcategory : p.category,
        description: p.name,
      },
    });
  }

  // Slider images
  const existingSlides = await prisma.sliderImage.findMany();
  if (existingSlides.length === 0) {
    const slidesData = [
      { title: "Нагреватели табака", subtitle: "IQOS, Glo, lil и другие устройства", imageUrl: "/slider/slide1.svg", link: "/catalog/nagrevateli-tabaka", order: 1 },
      { title: "Стики для нагревателей", subtitle: "Terea, Neo, Heets и другие бренды", imageUrl: "/slider/slide2.svg", link: "/catalog/stiki-dlya-nagrevatelej", order: 2 },
      { title: "Бесплатная доставка", subtitle: "При заказе от 3 000 руб.", imageUrl: "/slider/slide3.svg", link: "/catalog", order: 3 },
    ];
    for (const slide of slidesData) {
      await prisma.sliderImage.create({ data: slide });
    }
  }

  // Sample news
  const newsItems = [
    {
      title: "Новое поступление стиков Terea",
      content: "<p>В нашем магазине появились новые вкусы стиков <strong>Terea</strong> для IQOS Iluma!</p><p>Спешите попробовать новинки в <a href='/catalog/stiki-terea-dlya-iqos-iluma'>каталоге</a>.</p>",
      published: true,
    },
    {
      title: "Специальное предложение: выгодные цены на нагреватели",
      content: "<p>Только на этой неделе — выгодные цены на все нагреватели табака.</p><p>Успейте воспользоваться предложением!</p><p><a href='/catalog/nagrevateli-tabaka'>Смотреть товары →</a></p>",
      published: true,
    },
    {
      title: "Расширение ассортимента",
      content: "<p>Мы добавили новые бренды стиков: Ashima, COO, Farstar и другие.</p><p><a href='/catalog/stiki-dlya-nagrevatelej'>Перейти в каталог →</a></p>",
      published: true,
    },
  ];

  for (const n of newsItems) {
    const s = slug(n.title);
    await prisma.news.upsert({
      where: { slug: s },
      update: {},
      create: { title: n.title, slug: s, content: n.content, published: n.published },
    });
  }

  // HomeBlocks — default blocks for homepage constructor
  const existingBlocks = await prisma.homeBlock.count();
  if (existingBlocks === 0) {
    await prisma.homeBlock.createMany({
      data: [
        { blockType: "hero", title: "hittabak", subtitle: "Устройства нагревания табака нового поколения", buttonText: "Смотреть каталог", buttonLink: "/catalog/nagrevateli-tabaka", order: 0, active: true },
        { blockType: "device", title: "IQOS Iluma", subtitle: "Современные технологии нагревания", buttonLink: "/catalog/nagrevateli-tabaka", order: 1, active: true },
        { blockType: "device", title: "Glo Hyper Pro", subtitle: "Компактный и мощный", buttonLink: "/catalog/nagrevateli-tabaka", order: 2, active: true },
        { blockType: "device", title: "lil SOLID", subtitle: "Надёжность и стиль", buttonLink: "/catalog/nagrevateli-tabaka", order: 3, active: true },
        { blockType: "stick", title: "Стики Terea", subtitle: "Премиальные вкусы для IQOS Iluma", buttonLink: "/catalog/stiki-dlya-nagrevatelej", order: 4, active: true },
        { blockType: "stick", title: "Стики Neo Demi", subtitle: "Классические табаки для Glo", buttonLink: "/catalog/stiki-dlya-nagrevatelej", order: 5, active: true },
      ],
    });
    console.log("Default home blocks created");
  }

  console.log("Seed completed successfully");
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
