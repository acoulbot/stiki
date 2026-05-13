import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Устройства — hittabak",
  description: "Каталог устройств нагревания табака hittabak. Выбирайте идеальное устройство для себя.",
};

export const revalidate = 60;

export default async function DevicesPage() {
  const products = await prisma.product.findMany({
    where: { productType: "device" },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    include: { category: true, reviews: { select: { rating: true } } },
  });

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
      <main className="flex-1 pb-16 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="text-sm text-text-gray mb-6">
            <Link href="/" className="hover:text-accent">Главная</Link>
            <span className="mx-2">/</span>
            <span className="text-text-dark">Устройства</span>
          </nav>

          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-text-dark mb-8">Устройства</h1>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => {
                const avgRating = product.reviews.length > 0
                  ? Math.round(product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length)
                  : 0;

                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square bg-bg-light p-4 flex items-center justify-center relative overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={getImageSrc(product.image)} alt={product.name} className="max-h-full max-w-full object-contain img-zoom" loading="lazy" />
                      {product.tags?.includes("new") && (
                        <span className="absolute top-2 left-2 bg-accent text-white text-[10px] font-bold px-2 py-0.5 rounded">НОВИНКА</span>
                      )}
                      {product.inStock === 0 && (
                        <span className="absolute top-2 right-2 bg-text-gray text-white text-[10px] font-bold px-2 py-0.5 rounded">Нет в наличии</span>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-text-dark line-clamp-2">{product.name}</h3>
                      {avgRating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className={`w-3 h-3 ${star <= avgRating ? "text-warning" : "text-border"}`} fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="text-[10px] text-text-light">({product.reviews.length})</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div>
                          {product.oldPrice && (
                            <span className="text-xs text-text-light line-through mr-2">{product.oldPrice.toLocaleString("ru-RU")} &#8381;</span>
                          )}
                          <span className="font-bold text-text-dark">{product.price.toLocaleString("ru-RU")} &#8381;</span>
                        </div>
                        <svg className="w-5 h-5 text-text-light group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-text-gray text-lg">Каталог устройств обновляется</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
