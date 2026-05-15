import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Наука — hittabak",
  description: "Научный подход hittabak. Технология нагревания табака, исследования, преимущества перед горением.",
  alternates: { canonical: "https://hittabak.ru/science" },
};

export default function SciencePage() {
  return (
    <>
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-text-dark mb-6">Наука и технологии</h1>

          <div className="space-y-8">
            <section className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-xl font-bold text-text-dark mb-3">Технология нагревания</h2>
              <p className="text-text-gray leading-relaxed">
                В основе наших устройств лежит технология нагревания табака до температуры до 350°C, что значительно ниже температуры горения обычной сигареты (~800°C). Это позволяет выделять никотинсодержащий аэрозоль без образования дыма и пепла.
              </p>
            </section>

            <section className="bg-white rounded-xl border border-border p-6">
              <h2 className="text-xl font-bold text-text-dark mb-3">Исследования</h2>
              <p className="text-text-gray leading-relaxed">
                Мы постоянно проводим исследования для улучшения качества продукции и снижения уровня вредных веществ. Наша команда учёных работает над совершенствованием технологии нагревания.
              </p>
            </section>

            <section className="bg-bg-blue rounded-xl p-6">
              <h2 className="text-xl font-bold text-text-dark mb-3">Важно понимать</h2>
              <p className="text-text-gray leading-relaxed">
                Продукция hittabak не является безрисковой. Она содержит никотин, который вызывает зависимость. Лучшее решение — полностью отказаться от употребления табака и никотина.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
