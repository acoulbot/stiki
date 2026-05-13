import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "О нас — hittabak",
  description: "Узнайте о компании hittabak. Наша миссия, ценности и подход к созданию устройств нагревания табака.",
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
              <h2 className="text-xl font-bold text-text-dark mb-3">Наша миссия</h2>
              <p className="text-text-gray leading-relaxed">
                hittabak создаёт продукты нагревания табака нового поколения. Мы стремимся предоставить совершеннолетним пользователям качественную альтернативу традиционным сигаретам, инвестируя в исследования и инновационные технологии.
              </p>
            </section>

            <section className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-xl font-bold text-text-dark mb-3">Что такое нагревание табака?</h2>
              <p className="text-text-gray leading-relaxed">
                В отличие от обычных сигарет, наши устройства нагревают табак, а не сжигают его. Это означает отсутствие дыма, пепла и значительно меньшее количество вредных веществ по сравнению с горением.
              </p>
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-bg-beige rounded-xl p-6 text-center">
                <span className="text-3xl font-bold text-accent">350°C</span>
                <p className="text-sm text-text-gray mt-2">Температура нагрева</p>
              </div>
              <div className="bg-bg-beige rounded-xl p-6 text-center">
                <span className="text-3xl font-bold text-accent">20+</span>
                <p className="text-sm text-text-gray mt-2">Вкусов стиков</p>
              </div>
              <div className="bg-bg-beige rounded-xl p-6 text-center">
                <span className="text-3xl font-bold text-accent">100K+</span>
                <p className="text-sm text-text-gray mt-2">Пользователей</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/about/history" className="flex-1 bg-white rounded-xl border border-border p-5 hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-text-dark mb-1">История бренда</h3>
                <p className="text-sm text-text-gray">От идеи до реализации &rarr;</p>
              </Link>
              <Link href="/science" className="flex-1 bg-white rounded-xl border border-border p-5 hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-text-dark mb-1">Наука и технологии</h3>
                <p className="text-sm text-text-gray">Как это работает &rarr;</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
