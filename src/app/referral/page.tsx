import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Реферальная программа — hittabak",
  description: "Приглашайте друзей и получайте бонусы от hittabak. Узнайте условия реферальной программы.",
};

export default function ReferralPage() {
  const steps = [
    { step: "1", title: "Зарегистрируйтесь", desc: "Создайте аккаунт на сайте hittabak" },
    { step: "2", title: "Получите ссылку", desc: "Персональная реферальная ссылка в личном кабинете" },
    { step: "3", title: "Пригласите друга", desc: "Отправьте ссылку друзьям или поделитесь в соцсетях" },
    { step: "4", title: "Получите бонус", desc: "Вы и ваш друг получаете бонусы на покупку" },
  ];

  return (
    <>
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-text-dark mb-4">
              Приглашай друзей — получай бонусы
            </h1>
            <p className="text-text-gray text-lg max-w-2xl mx-auto">
              Поделитесь опытом использования hittabak с друзьями и получите приятные бонусы для обоих
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {steps.map((s) => (
              <div key={s.step} className="bg-white rounded-xl border border-border p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xl">
                  {s.step}
                </div>
                <h3 className="text-sm font-bold text-text-dark mb-1">{s.title}</h3>
                <p className="text-xs text-text-gray">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-bg-beige rounded-2xl p-8 text-center">
            <h2 className="text-xl font-bold text-text-dark mb-4">Готовы начать?</h2>
            <p className="text-text-gray mb-6">Зарегистрируйтесь или войдите в аккаунт, чтобы получить реферальную ссылку</p>
            <a href="/account" className="inline-block bg-accent hover:bg-accent-dark text-white font-bold px-8 py-3 rounded-xl transition-colors">
              Войти в аккаунт
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
