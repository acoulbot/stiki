import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

function getImageSrc(image: string) {
  if (!image) return "";
  if (image.startsWith("http")) return image;
  if (image.startsWith("/api/")) return image;
  if (image.startsWith("/uploads/")) return `/api${image}`;
  if (image.startsWith("/")) return `/api/static${image}`;
  return image;
}

/** Extract brand display name from subcategory name */
function extractBrand(subcategoryName: string): string {
  // "Стики Terea для IQOS Iluma" → "Terea"
  const stickMatch = subcategoryName.match(/^Стики\s+(.+?)\s+для\s/i);
  if (stickMatch) return stickMatch[1];
  return subcategoryName;
}

/** Group device subcategories by top-level brand */
function getDeviceBrandKey(name: string): string {
  if (name.startsWith("IQOS")) return "IQOS";
  if (name.toLowerCase().startsWith("lil")) return "lil SOLID";
  if (name.startsWith("MOK")) return "MOK";
  if (name.startsWith("Glo")) return "Glo";
  if (name.startsWith("TEO")) return "TEO";
  return name;
}

interface BrandGroup {
  name: string;
  count: number;
  image: string;
  slug: string;
}

export default async function HomePage() {
  const [heroBlocks, newsItems] = await Promise.all([
    prisma.homeBlock.findMany({ where: { active: true, blockType: "hero" }, orderBy: { order: "asc" }, take: 1 }),
    prisma.news.findMany({ where: { published: true }, orderBy: { createdAt: "desc" }, take: 4 }),
  ]);

  const hero = heroBlocks[0] || null;

  // Get top-level categories
  const topCategories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
  });

  const deviceCat = topCategories.find((c) => c.name === "Нагреватели табака");
  const stickCat = topCategories.find((c) => c.name === "Стики для нагревателей");

  // Get subcategories with product counts and representative images
  const deviceSubcats = deviceCat
    ? await prisma.category.findMany({
        where: { parentId: deviceCat.id },
        include: {
          products: { take: 1, where: { image: { not: "" } }, orderBy: { createdAt: "desc" }, select: { image: true } },
          _count: { select: { products: true } },
        },
        orderBy: { order: "asc" },
      })
    : [];

  const stickSubcats = stickCat
    ? await prisma.category.findMany({
        where: { parentId: stickCat.id },
        include: {
          products: { take: 1, where: { image: { not: "" } }, orderBy: { createdAt: "desc" }, select: { image: true } },
          _count: { select: { products: true } },
        },
        orderBy: { order: "asc" },
      })
    : [];

  // Also get products directly under top-level device category (no subcategory)
  const directDeviceCount = deviceCat
    ? await prisma.product.count({ where: { categoryId: deviceCat.id } })
    : 0;

  // Group device subcategories by brand
  const deviceBrandsMap = new Map<string, BrandGroup>();

  // Add direct-category products (subcategory == parent category) grouped by brand
  if (directDeviceCount > 0) {
    // These are products in the top-level "Нагреватели табака" — we'll distribute them to brand groups
    const directProducts = await prisma.product.findMany({
      where: { categoryId: deviceCat!.id },
      select: { name: true, image: true },
    });
    for (const dp of directProducts) {
      const brandKey = getDeviceBrandKey(dp.name);
      const existing = deviceBrandsMap.get(brandKey);
      if (existing) {
        existing.count++;
        if (!existing.image && dp.image) existing.image = dp.image;
      } else {
        deviceBrandsMap.set(brandKey, {
          name: brandKey,
          count: 1,
          image: dp.image || "",
          slug: deviceCat!.slug,
        });
      }
    }
  }

  for (const sc of deviceSubcats) {
    const brandKey = getDeviceBrandKey(sc.name);
    const existing = deviceBrandsMap.get(brandKey);
    const img = sc.products[0]?.image || "";
    if (existing) {
      existing.count += sc._count.products;
      if (!existing.image && img) existing.image = img;
    } else {
      deviceBrandsMap.set(brandKey, {
        name: brandKey,
        count: sc._count.products,
        image: img,
        slug: sc.slug,
      });
    }
  }

  const deviceBrands = Array.from(deviceBrandsMap.values())
    .filter((b) => b.count > 0)
    .sort((a, b) => b.count - a.count);

  // For sticks, show subcategories directly (each is already a brand)
  const stickBrands: BrandGroup[] = stickSubcats
    .filter((sc) => sc._count.products > 0)
    .map((sc) => ({
      name: extractBrand(sc.name),
      count: sc._count.products,
      image: sc.products[0]?.image || "",
      slug: sc.slug,
    }))
    .sort((a, b) => b.count - a.count);

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "hittabak",
    url: process.env.NEXT_PUBLIC_BASE_URL || "https://hittabak.ru",
    potentialAction: {
      "@type": "SearchAction",
      target: `${process.env.NEXT_PUBLIC_BASE_URL || "https://hittabak.ru"}/catalog?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
      <main className="flex-1 pb-16 lg:pb-0">

        {/* 1. Hero */}
        <section className="relative overflow-hidden" style={{ minHeight: "580px" }}>
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#2a1015]" />
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] animate-float-slow border border-[#E8403A]/20 rounded-[40px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rotate-45 border border-[#E8403A]/15 rounded-[30px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] animate-float-slow border border-[#E8403A]/30 rounded-[20px] shadow-[0_0_80px_rgba(232,64,58,0.15)]" style={{ animationDelay: "-3s" }} />
          </div>
          <div className="absolute top-[10%] left-[5%] w-40 h-40 bg-[#E8403A]/5 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-[10%] right-[10%] w-56 h-56 bg-[#E8403A]/8 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "-2s" }} />

          <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left z-10">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
                {hero?.title || "hittabak"}
              </h1>
              <p className="text-lg sm:text-xl text-gray-300 mb-8 max-w-lg">
                {hero?.subtitle || "Устройства нагревания табака нового поколения"}
              </p>
              {(hero?.buttonText || true) && (
                <Link
                  href={hero?.buttonLink || "/catalog/devices"}
                  className="inline-block bg-[#E8403A] hover:bg-[#d63530] text-white font-bold px-8 py-3.5 rounded-lg transition-all hover:shadow-[0_0_20px_rgba(232,64,58,0.4)] text-sm uppercase tracking-wider"
                >
                  {hero?.buttonText || "Смотреть каталог"}
                </Link>
              )}
            </div>
            <div className="flex-1 flex justify-center z-10">
              {hero?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getImageSrc(hero.image)}
                  alt={hero.title}
                  className="max-h-[420px] object-contain drop-shadow-[0_0_40px_rgba(232,64,58,0.3)] animate-fade-in-up"
                />
              ) : (
                <div className="w-64 h-80 rounded-2xl bg-gradient-to-b from-[#333] to-[#1a1a1a] border border-[#E8403A]/20 flex items-center justify-center shadow-[0_0_40px_rgba(232,64,58,0.2)]">
                  <span className="text-[#E8403A] text-4xl font-bold">hit</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 2. Нагреватели табака — brand cards */}
        <ScrollReveal>
          <section className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-dark">Нагреватели табака</h2>
              <Link href="/catalog/devices" className="text-accent hover:text-accent-dark text-sm font-medium transition-colors">
                Все устройства &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {deviceBrands.map((brand) => (
                <Link
                  key={brand.name}
                  href={`/catalog/devices`}
                  className="group relative overflow-hidden rounded-2xl aspect-[3/4] transition-transform duration-300 hover:scale-[1.02]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d0d] via-[#1a1a1a] to-[#251015]" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[160px] h-[160px] rotate-45 border border-[#E8403A]/40 rounded-[12px]" />
                  </div>
                  <div className="relative h-full flex flex-col justify-between p-4 z-10">
                    <div>
                      <h3 className="font-bold text-white text-base md:text-lg">{brand.name}</h3>
                      <p className="text-gray-400 text-xs mt-1">{brand.count} {brand.count === 1 ? "товар" : brand.count < 5 ? "товара" : "товаров"}</p>
                    </div>
                    <div className="flex justify-center items-end flex-1 pt-3">
                      {brand.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getImageSrc(brand.image)}
                          alt={brand.name}
                          className="max-h-[140px] object-contain transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_20px_rgba(232,64,58,0.25)]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-[#222] rounded-xl flex items-center justify-center">
                          <span className="text-gray-500 text-xs">Фото</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#E8403A] transition-all duration-300 z-10">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* 3. Стики — brand cards */}
        <ScrollReveal>
          <section className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-dark">Стики для нагревателей</h2>
              <Link href="/catalog/sticks" className="text-accent hover:text-accent-dark text-sm font-medium transition-colors">
                Все стики &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {stickBrands.map((brand) => (
                <Link
                  key={brand.name}
                  href={`/catalog/${brand.slug}`}
                  className="group relative overflow-hidden rounded-2xl aspect-[3/4] transition-transform duration-300 hover:scale-[1.02]"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d0d] via-[#1a1a1a] to-[#1a1020]" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] rotate-45 border border-[#E8403A]/30 rounded-[10px]" />
                  </div>
                  <div className="relative h-full flex flex-col justify-between p-3 z-10">
                    <div>
                      <h3 className="font-bold text-white text-sm md:text-base">{brand.name}</h3>
                      <p className="text-gray-400 text-[10px] mt-0.5">{brand.count} {brand.count === 1 ? "вкус" : brand.count < 5 ? "вкуса" : "вкусов"}</p>
                    </div>
                    <div className="flex justify-center items-end flex-1 pt-2">
                      {brand.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getImageSrc(brand.image)}
                          alt={brand.name}
                          className="max-h-[110px] object-contain transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(232,64,58,0.2)]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-[#222] rounded-lg flex items-center justify-center">
                          <span className="text-gray-500 text-[10px]">Фото</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#E8403A] transition-all duration-300 z-10">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* 4. Новости */}
        <ScrollReveal>
          <section className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-dark">Новости</h2>
              <Link href="/news" className="text-accent hover:text-accent-dark text-sm font-medium transition-colors">
                Все новости &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {newsItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.slug}`}
                  className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                >
                  <div className="aspect-video bg-bg-light overflow-hidden">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getImageSrc(item.image)}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#2a1015] flex items-center justify-center">
                        <span className="text-[#E8403A]/40 text-2xl font-bold">hit</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-text-dark line-clamp-2 group-hover:text-accent transition-colors">
                      {item.title}
                    </h3>
                    {item.excerpt && (
                      <p className="text-xs text-text-gray mt-2 line-clamp-2">{item.excerpt}</p>
                    )}
                  </div>
                </Link>
              ))}
              {newsItems.length === 0 && (
                <div className="col-span-full text-center py-10">
                  <p className="text-text-gray">Новости скоро появятся</p>
                </div>
              )}
            </div>
          </section>
        </ScrollReveal>
      </main>
      <Footer />
    </>
  );
}
