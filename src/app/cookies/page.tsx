import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie-политика — hittabak",
  description: "Политика использования файлов cookie на сайте hittabak.",
  alternates: { canonical: "https://hittabak.ru/cookies" },
};

export default function CookiesPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="font-heading text-3xl font-extrabold text-text-dark mb-6">Cookie-политика</h1>

          <div className="prose max-w-none text-text-gray space-y-6">
            <section>
              <h2 className="text-lg font-bold text-text-dark">Что такое cookies?</h2>
              <p className="text-sm leading-relaxed">
                Cookies — это небольшие текстовые файлы, которые сохраняются на вашем устройстве при посещении сайта. Они помогают нам обеспечить корректную работу сайта и улучшить ваш пользовательский опыт.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-dark">Какие cookies мы используем</h2>
              <ul className="text-sm space-y-2 list-disc pl-5">
                <li><strong>Обязательные:</strong> необходимы для работы сайта (авторизация, корзина, верификация возраста)</li>
                <li><strong>Аналитические:</strong> Яндекс.Метрика и Google Analytics для анализа посещаемости</li>
                <li><strong>Функциональные:</strong> запоминание выбранного города и пользовательских настроек</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-dark">Управление cookies</h2>
              <p className="text-sm leading-relaxed">
                Вы можете отключить cookies в настройках вашего браузера. Обратите внимание, что это может повлиять на функциональность сайта.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
