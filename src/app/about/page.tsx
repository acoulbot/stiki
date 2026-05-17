import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "О нас — hittabak | Официальный реселлер устройств нагревания табака",
  description: "hittabak — официальный реселлер устройств нагревания табака и аксессуаров. Широкий ассортимент IQOS, Glo, lil SOLID и стиков.",
  keywords: "hittabak, о нас, официальный реселлер, устройства нагревания табака, IQOS, Glo, lil SOLID",
  alternates: { canonical: "https://hittabak.ru/about" },
  openGraph: {
    title: "О нас — hittabak | Официальный реселлер",
    description: "hittabak — официальный реселлер устройств нагревания табака и аксессуаров.",
    locale: "ru_RU",
    type: "website",
    url: "https://hittabak.ru/about",
    images: [{ url: "https://hittabak.ru/opengraph-image" }],
  },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-text-dark mb-6">О нас</h1>

          <div className="space-y-8">
            <section className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-xl font-bold text-text-dark mb-3">Официальный реселлер</h2>
              <p className="text-text-gray leading-relaxed">
                <strong>hittabak</strong> — официальный реселлер продукции ведущих мировых брендов устройств нагревания табака и аксессуаров к ним. Мы сотрудничаем напрямую с производителями и авторизованными дистрибьюторами, что гарантирует подлинность и качество каждого товара, представленного на нашем сайте.
              </p>
            </section>

            <section className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-xl font-bold text-text-dark mb-3">Наш ассортимент</h2>
              <p className="text-text-gray leading-relaxed mb-4">
                В каталоге hittabak представлен полный модельный ряд устройств нагревания табака и расходных материалов от ведущих брендов:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {["IQOS", "Glo", "lil SOLID", "MOK", "TEO", "Terea", "Ashima", "Neo Demi", "COO", "Kent sticks", "Mofee", "Farstar"].map((brand) => (
                  <div key={brand} className="bg-bg-beige rounded-lg px-3 py-2 text-center text-sm font-medium text-text-dark">
                    {brand}
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-xl font-bold text-text-dark mb-3">Почему выбирают нас</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-dark">Гарантия подлинности</h3>
                    <p className="text-xs text-text-gray mt-1">Только оригинальная продукция от официальных поставщиков</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-dark">Быстрая доставка</h3>
                    <p className="text-xs text-text-gray mt-1">Оперативная доставка по всей России</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-dark">Консультации</h3>
                    <p className="text-xs text-text-gray mt-1">Поможем подобрать устройство и вкус стиков</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-text-dark">Выгодные цены</h3>
                    <p className="text-xs text-text-gray mt-1">Конкурентные цены и выгодные предложения</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-xl font-bold text-text-dark mb-3">Что такое нагревание табака?</h2>
              <p className="text-text-gray leading-relaxed">
                В отличие от обычных сигарет, устройства нагревания табака нагревают табак, а не сжигают его. Это означает отсутствие дыма, пепла и значительно меньшее количество вредных веществ по сравнению с горением. Технология нагревания позволяет сохранить вкус табака без продуктов горения.
              </p>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-bg-beige rounded-xl p-6 text-center">
                <span className="text-3xl font-bold text-accent">350°C</span>
                <p className="text-sm text-text-gray mt-2">Температура нагрева вместо 800°C при горении</p>
              </div>
              <div className="bg-bg-beige rounded-xl p-6 text-center">
                <span className="text-3xl font-bold text-accent">380+</span>
                <p className="text-sm text-text-gray mt-2">Товаров в каталоге</p>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-border p-6 text-center">
              <p className="text-text-gray text-sm mb-4">Остались вопросы? Свяжитесь с нами!</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/contacts" className="inline-block bg-accent hover:bg-accent-dark text-white font-bold px-6 py-3 rounded-lg transition-colors text-sm">
                  Контакты
                </Link>
                <a href="https://t.me/tophit_new" target="_blank" rel="nofollow noopener noreferrer" className="inline-block bg-[#229ED9] hover:bg-[#1a8bc2] text-white font-bold px-6 py-3 rounded-lg transition-colors text-sm">
                  Telegram
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
