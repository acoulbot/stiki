import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollReveal from "@/components/ScrollReveal";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export default async function HomePage() {
  const [heroBlocks, deviceBlocks, stickBlocks, newsBlocks, devices, sticks, news] = await Promise.all([
    prisma.homeBlock.findMany({ where: { active: true, blockType: "hero" }, orderBy: { order: "asc" }, take: 1 }),
    prisma.homeBlock.findMany({ where: { active: true, blockType: "device" }, orderBy: { order: "asc" }, take: 4 }),
    prisma.homeBlock.findMany({ where: { active: true, blockType: "stick" }, orderBy: { order: "asc" }, take: 3 }),
    prisma.homeBlock.findMany({ where: { active: true, blockType: "news" }, orderBy: { order: "asc" }, take: 4 }),
    prisma.product.findMany({
      take: 4,
      where: { productType: "device" },
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
    prisma.product.findMany({
      take: 3,
      where: { productType: "stick" },
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
    prisma.news.findMany({
      take: 4,
      where: { published: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const hero = heroBlocks[0] || null;

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

  function getImageSrc(image: string) {
    if (!image) return "/placeholder.jpg";
    if (image.startsWith("http")) return image;
    if (image.startsWith("/api/")) return image;
    if (image.startsWith("/uploads/")) return `/api${image}`;
    if (image.startsWith("/")) return `/api/static${image}`;
    return image;
  }

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
      <main className="flex-1 pb-16 lg:pb-0">

        {/* 1. Hero Block — neon diamond gradient */}
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

        {/* 2. Products Grid — 1 big + 1 medium + 2 small */}
        <ScrollReveal>
          <section className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-dark">Все продукты hittabak</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[280px] md:auto-rows-[340px]">
              {(deviceBlocks.length > 0 ? deviceBlocks : devices.slice(0, 4)).map((item, idx) => {
                const isBlock = "blockType" in item;
                const title = isBlock ? item.title : item.name;
                const subtitle = isBlock ? item.subtitle : item.brand;
                const image = isBlock ? item.image : item.image;
                const link = isBlock ? item.buttonLink : `/product/${item.slug}`;
                const isBig = idx === 0;
                const isMedium = idx === 1;

                return (
                  <Link
                    key={item.id}
                    href={link || "/catalog/devices"}
                    className={`group relative overflow-hidden rounded-2xl transition-transform duration-300 hover:scale-[1.02] ${isBig ? "col-span-2 row-span-2" : isMedium ? "col-span-2 row-span-1" : "col-span-1 row-span-1"}`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d0d] via-[#1a1a1a] to-[#251015]" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rotate-45 border border-[#E8403A]/40 rounded-[15px]" />
                    </div>
                    <div className="relative h-full flex flex-col justify-between p-5 z-10">
                      <div>
                        <h3 className={`font-bold text-white ${isBig ? "text-xl md:text-2xl" : "text-sm md:text-base"} mb-1`}>
                          {title}
                        </h3>
                        {subtitle && (
                          <p className={`text-gray-400 ${isBig ? "text-sm" : "text-xs"}`}>{subtitle}</p>
                        )}
                      </div>
                      <div className="flex justify-center items-end flex-1 pt-4">
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={getImageSrc(image)}
                            alt={title}
                            className={`object-contain transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_20px_rgba(232,64,58,0.25)] ${isBig ? "max-h-[300px]" : isMedium ? "max-h-[180px]" : "max-h-[140px]"}`}
                            loading="lazy"
                          />
                        ) : (
                          <div className={`bg-[#222] rounded-xl flex items-center justify-center ${isBig ? "w-40 h-40" : "w-20 h-20"}`}>
                            <span className="text-gray-500 text-xs">Фото</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#E8403A] transition-all duration-300 group-hover:scale-110 z-10">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-6">
              <Link
                href="/catalog/devices"
                className="inline-block bg-[#1A1A1A] hover:bg-[#333] text-white font-bold px-8 py-3 rounded-lg transition-colors text-sm uppercase tracking-wider"
              >
                Весь каталог устройств
              </Link>
            </div>
          </section>
        </ScrollReveal>

        {/* 3. Sticks Grid — 3 cards + full catalog link */}
        <ScrollReveal>
          <section className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-dark">Все стики</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {(stickBlocks.length > 0 ? stickBlocks : sticks.slice(0, 3)).map((item) => {
                const isBlock = "blockType" in item;
                const title = isBlock ? item.title : item.name;
                const subtitle = isBlock ? item.subtitle : item.description;
                const image = isBlock ? item.image : item.image;
                const link = isBlock ? item.buttonLink : `/product/${item.slug}`;

                return (
                  <Link
                    key={item.id}
                    href={link || "/catalog/sticks"}
                    className="group relative overflow-hidden rounded-2xl aspect-[4/5] transition-transform duration-300 hover:scale-[1.02]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d0d] via-[#1a1a1a] to-[#1a1020]" />
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180px] h-[180px] rotate-45 border border-[#E8403A]/30 rounded-[12px]" />
                    </div>
                    <div className="relative h-full flex flex-col p-5 z-10">
                      <div>
                        <h3 className="font-bold text-white text-base md:text-lg mb-1">{title}</h3>
                        {subtitle && <p className="text-gray-400 text-xs line-clamp-2">{subtitle}</p>}
                      </div>
                      <div className="flex-1 flex items-center justify-center pt-4">
                        {image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={getImageSrc(image)}
                            alt={title}
                            className="max-h-[220px] object-contain transition-all duration-500 group-hover:scale-110 group-hover:drop-shadow-[0_0_15px_rgba(232,64,58,0.2)]"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-24 h-32 bg-[#222] rounded-xl flex items-center justify-center">
                            <span className="text-gray-500 text-xs">Фото</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#E8403A] transition-all duration-300 group-hover:scale-110 z-10">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
            <div className="text-center mt-6">
              <Link
                href="/catalog/sticks"
                className="inline-block bg-[#1A1A1A] hover:bg-[#333] text-white font-bold px-8 py-3 rounded-lg transition-colors text-sm uppercase tracking-wider"
              >
                Весь каталог стиков
              </Link>
            </div>
          </section>
        </ScrollReveal>

        {/* 4. News Block — 4 cards */}
        <ScrollReveal>
          <section className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-dark">Наши новости</h2>
              <Link href="/news" className="text-accent hover:text-accent-dark text-sm font-medium transition-colors">
                Все новости &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(newsBlocks.length > 0 ? newsBlocks : news).map((item) => {
                const isBlock = "blockType" in item;
                const title = isBlock ? item.title : item.title;
                const desc = isBlock ? item.subtitle : item.excerpt;
                const image = isBlock ? item.image : item.image;
                const link = isBlock ? (item.buttonLink || "/news") : `/news/${item.slug}`;

                return (
                  <Link
                    key={item.id}
                    href={link}
                    className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="aspect-video bg-bg-light overflow-hidden">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getImageSrc(image)}
                          alt={title}
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
                        {title}
                      </h3>
                      {desc && (
                        <p className="text-xs text-text-gray mt-2 line-clamp-2">{desc}</p>
                      )}
                    </div>
                  </Link>
                );
              })}
              {newsBlocks.length === 0 && news.length === 0 && (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-border overflow-hidden">
                      <div className="aspect-video bg-gradient-to-br from-[#1a1a1a] to-[#2a1015] flex items-center justify-center">
                        <span className="text-[#E8403A]/30 text-xl font-bold">hit</span>
                      </div>
                      <div className="p-4">
                        <div className="h-4 bg-bg-light rounded w-3/4 mb-2" />
                        <div className="h-3 bg-bg-light rounded w-full" />
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </section>
        </ScrollReveal>
      </main>
      <Footer />
    </>
  );
}
