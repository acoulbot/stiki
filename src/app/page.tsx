import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSlider from "@/components/HeroSlider";
import ScrollReveal from "@/components/ScrollReveal";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export default async function HomePage() {
  const [slides, devices, sticks, blogPosts] = await Promise.all([
    prisma.sliderImage.findMany({ where: { active: true }, orderBy: { order: "asc" } }),
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
    prisma.blogPost.findMany({
      take: 4,
      where: { published: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

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
    if (image.startsWith("/uploads/")) return `/api${image}`;
    if (image.startsWith("/")) return `/api/static${image}`;
    return image;
  }

  return (
    <>
      <Header />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
      <main className="flex-1 pb-16 lg:pb-0">
        {/* Hero Slider */}
        <section className="max-w-7xl mx-auto px-4 py-6">
          <HeroSlider slides={slides} />
        </section>

        {/* Devices catalog */}
        <ScrollReveal>
          <section className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-dark">Все устройства</h2>
              <Link href="/catalog/devices" className="text-accent hover:text-accent-dark text-sm font-medium transition-colors">
                Весь каталог &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {devices.length > 0 ? devices.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-bg-light p-4 flex items-center justify-center relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getImageSrc(product.image)}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain img-zoom"
                      loading="lazy"
                    />
                    {product.tags?.includes("new") && (
                      <span className="absolute top-2 left-2 bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        НОВИНКА
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-text-dark line-clamp-2">{product.name}</h3>
                    <p className="text-xs text-text-gray mt-1">{product.brand}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-text-dark">{product.price.toLocaleString("ru-RU")} &#8381;</span>
                      <svg className="w-5 h-5 text-text-light group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              )) : (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-border overflow-hidden">
                      <div className="aspect-square bg-bg-light flex items-center justify-center">
                        <span className="text-text-light text-sm">Устройство {i}</span>
                      </div>
                      <div className="p-3">
                        <div className="h-4 skeleton w-3/4 mb-2" />
                        <div className="h-3 skeleton w-1/2" />
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </section>
        </ScrollReveal>

        {/* Sticks catalog */}
        <ScrollReveal>
          <section className="max-w-7xl mx-auto px-4 py-8 bg-bg-beige rounded-2xl mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-dark">Стики</h2>
              <Link href="/catalog/sticks" className="text-accent hover:text-accent-dark text-sm font-medium transition-colors">
                Весь каталог &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {sticks.length > 0 ? sticks.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-[4/3] bg-white p-4 flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getImageSrc(product.image)}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain img-zoom"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-text-dark">{product.name}</h3>
                    <p className="text-xs text-text-gray mt-1 line-clamp-2">{product.description}</p>
                  </div>
                </Link>
              )) : (
                <>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-border overflow-hidden">
                      <div className="aspect-[4/3] bg-bg-light flex items-center justify-center">
                        <span className="text-text-light text-sm">Стики {i}</span>
                      </div>
                      <div className="p-4">
                        <div className="h-4 skeleton w-3/4 mb-2" />
                        <div className="h-3 skeleton w-1/2" />
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </section>
        </ScrollReveal>

        {/* Services grid */}
        <ScrollReveal>
          <section className="max-w-7xl mx-auto px-4 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: "📍", title: "Найти точку продаж", desc: "Ближайший магазин рядом", href: "/stores" },
                { icon: "🛡️", title: "Продление гарантии", desc: "Зарегистрируйте устройство", href: "/support" },
                { icon: "💬", title: "Поддержка 24/7", desc: "Мы всегда на связи", href: "/support" },
                { icon: "🎁", title: "Приглашай друзей", desc: "Получай бонусы", href: "/referral" },
              ].map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="bg-white rounded-xl border border-border p-5 hover:shadow-lg hover:border-accent/30 transition-all text-center group"
                >
                  <span className="text-3xl block mb-3">{item.icon}</span>
                  <h3 className="text-sm font-bold text-text-dark mb-1">{item.title}</h3>
                  <p className="text-xs text-text-gray">{item.desc}</p>
                </Link>
              ))}
            </div>
          </section>
        </ScrollReveal>

        {/* Social block */}
        <ScrollReveal>
          <section className="max-w-7xl mx-auto px-4 py-8">
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-dark text-center mb-6">Подписывайся!</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a
                href="https://t.me/hittabak"
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="flex items-center gap-4 bg-white rounded-xl border border-border p-5 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-[#229ED9]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#229ED9]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-dark">Telegram-бот</h3>
                  <p className="text-xs text-text-gray">Новости и акции</p>
                </div>
              </a>
              <a
                href="https://vk.com/hittabak"
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="flex items-center gap-4 bg-white rounded-xl border border-border p-5 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-[#4C75A3]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#4C75A3]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.847 2.49 2.27 4.674 2.862 4.674.22 0 .322-.102.322-.66V9.72c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.644v3.049c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.15-3.574 2.15-3.574.119-.254.322-.491.762-.491h1.744c.525 0 .644.27.525.644-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-dark">ВКонтакте</h3>
                  <p className="text-xs text-text-gray">Сообщество бренда</p>
                </div>
              </a>
              <a
                href="https://dzen.ru/hittabak"
                target="_blank"
                rel="nofollow noopener noreferrer"
                className="flex items-center gap-4 bg-white rounded-xl border border-border p-5 hover:shadow-lg transition-shadow"
              >
                <div className="w-12 h-12 bg-[#FF6600]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-[#FF6600]">Я</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-text-dark">Дзен</h3>
                  <p className="text-xs text-text-gray">Статьи и обзоры</p>
                </div>
              </a>
            </div>
          </section>
        </ScrollReveal>

        {/* Blog preview */}
        <ScrollReveal>
          <section className="max-w-7xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-dark">Блог hittabak</h2>
              <Link href="/blog" className="text-accent hover:text-accent-dark text-sm font-medium transition-colors">
                Все статьи &rarr;
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {blogPosts.length > 0 ? blogPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video bg-bg-light overflow-hidden">
                    {post.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getImageSrc(post.image)}
                        alt={post.title}
                        className="w-full h-full object-cover img-zoom"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-light text-sm">Блог</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-text-dark line-clamp-2 group-hover:text-accent transition-colors">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-xs text-text-gray mt-2 line-clamp-2">{post.excerpt}</p>
                    )}
                  </div>
                </Link>
              )) : (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-xl border border-border overflow-hidden">
                      <div className="aspect-video bg-bg-light flex items-center justify-center">
                        <span className="text-text-light text-sm">Статья {i}</span>
                      </div>
                      <div className="p-4">
                        <div className="h-4 skeleton w-3/4 mb-2" />
                        <div className="h-3 skeleton w-full" />
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
