import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post) return { title: "Статья не найдена" };
  return {
    title: `${post.title} — Блог hittabak`,
    description: post.excerpt || post.title,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });
  if (!post || !post.published) notFound();

  const relatedPosts = await prisma.blogPost.findMany({
    where: { published: true, id: { not: post.id } },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  return (
    <>
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">
        <article className="max-w-3xl mx-auto px-4 py-8">
          <nav className="text-sm text-text-gray mb-6">
            <Link href="/" className="hover:text-accent">Главная</Link>
            <span className="mx-2">/</span>
            <Link href="/blog" className="hover:text-accent">Блог</Link>
            <span className="mx-2">/</span>
            <span className="text-text-dark">{post.title}</span>
          </nav>

          {post.image && (
            <div className="aspect-video rounded-xl overflow-hidden mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.image.startsWith("http") ? post.image : `/api/static${post.image}`} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-text-dark mb-4">{post.title}</h1>
          <time className="text-sm text-text-gray block mb-8">
            {new Date(post.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
          </time>

          <div className="prose prose-lg max-w-none text-text-dark" dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>

        {relatedPosts.length > 0 && (
          <section className="max-w-7xl mx-auto px-4 py-8 border-t border-border mt-8">
            <h2 className="font-heading text-xl font-bold text-text-dark mb-4">Похожие статьи</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {relatedPosts.map((rp) => (
                <Link key={rp.id} href={`/blog/${rp.slug}`} className="bg-white rounded-xl border border-border p-4 hover:shadow-lg transition-shadow">
                  <h3 className="text-sm font-semibold text-text-dark hover:text-accent transition-colors">{rp.title}</h3>
                  {rp.excerpt && <p className="text-xs text-text-gray mt-1 line-clamp-2">{rp.excerpt}</p>}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
