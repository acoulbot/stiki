import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Стики — hittabak",
  description: "Каталог табачных стиков hittabak. Разнообразие вкусов и интенсивности.",
};

export const revalidate = 60;

export default async function SticksPage() {
  const products = await prisma.product.findMany({
    where: { productType: "stick" },
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
            <span className="text-text-dark">Стики</span>
          </nav>

          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-text-dark mb-8">Стики</h1>

          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
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
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-text-gray text-lg">Каталог стиков обновляется</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
