import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Пользовательское соглашение — hittabak",
  description: "Пользовательское соглашение сайта hittabak.",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="font-heading text-3xl font-extrabold text-text-dark mb-6">Пользовательское соглашение</h1>

          <div className="prose max-w-none text-text-gray space-y-6">
            <section>
              <h2 className="text-lg font-bold text-text-dark">1. Общие положения</h2>
              <p className="text-sm leading-relaxed">
                Настоящее Пользовательское соглашение регулирует отношения между администрацией сайта hittabak (далее — Сайт) и пользователями Сайта. Используя Сайт, вы подтверждаете своё согласие с условиями настоящего Соглашения.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-dark">2. Возрастные ограничения</h2>
              <p className="text-sm leading-relaxed">
                Сайт предназначен исключительно для лиц, достигших 18-летнего возраста. Используя Сайт, вы подтверждаете, что вам исполнилось 18 лет.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-dark">3. Интеллектуальная собственность</h2>
              <p className="text-sm leading-relaxed">
                Все материалы, размещённые на Сайте, включая тексты, изображения, дизайн и программное обеспечение, являются интеллектуальной собственностью hittabak и защищены законодательством РФ.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-text-dark">4. Ответственность</h2>
              <p className="text-sm leading-relaxed">
                Администрация Сайта не несёт ответственности за возможные убытки, связанные с использованием информации, размещённой на Сайте.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
