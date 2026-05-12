import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Блог — hittabak",
  description: "Статьи, обзоры и новости от hittabak. Узнайте больше об устройствах нагревания табака и стиках.",
};

export const revalidate = 60;

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  function getImageSrc(image: string) {
    if (!image) return "";
    if (image.startsWith("http")) return image;
    if (image.startsWith("/uploads/")) return `/api${image}`;
    if (image.startsWith("/")) return `/api/static${image}`;
    return image;
  }

  return (
    <>
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-text-dark mb-8">Блог hittabak</h1>
          {posts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-video bg-bg-light overflow-hidden">
                    {post.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={getImageSrc(post.image)} alt={post.title} className="w-full h-full object-cover img-zoom" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-light">Блог</div>
                    )}
                  </div>
                  <div className="p-5">
                    {post.category && (
                      <span className="text-[10px] font-semibold uppercase text-accent">{post.category}</span>
                    )}
                    <h2 className="text-base font-bold text-text-dark mt-1 group-hover:text-accent transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-sm text-text-gray mt-2 line-clamp-3">{post.excerpt}</p>
                    )}
                    <span className="inline-block mt-3 text-sm text-accent font-medium">Подробнее &rarr;</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-text-gray text-lg">Статьи скоро появятся</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
