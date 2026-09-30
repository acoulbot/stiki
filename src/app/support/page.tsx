import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Поддержка — hittabak",
  description: "Центр поддержки hittabak. Техподдержка, FAQ, онлайн-диагностика, обмен и возврат.",
};

export default function SupportPage() {
  const sections = [
    {
      title: "Контакты",
      desc: "Свяжитесь с нами любым удобным способом",
      href: "/contacts",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
    },
    {
      title: "Онлайн-диагностика",
      desc: "Пройдите быстрый тест для выявления проблемы",
      href: "/support/diagnostics",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: "FAQ",
      desc: "Ответы на часто задаваемые вопросы",
      href: "/faq",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: "Обмен и возврат",
      desc: "Условия обмена и возврата продукции",
      href: "/returns",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-text-dark mb-4">Поддержка</h1>
          <p className="text-text-gray mb-8">Мы готовы помочь вам с любым вопросом о нашей продукции</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="bg-white rounded-xl border border-border p-6 hover:shadow-lg hover:border-accent/30 transition-all group"
              >
                <div className="text-text-gray group-hover:text-accent transition-colors mb-4">{section.icon}</div>
                <h2 className="text-base font-bold text-text-dark mb-1">{section.title}</h2>
                <p className="text-sm text-text-gray">{section.desc}</p>
              </Link>
            ))}
          </div>

          <div className="mt-10 bg-bg-blue rounded-xl p-6 text-center">
            <h2 className="text-lg font-bold text-text-dark mb-2">Нужна срочная помощь?</h2>
            <p className="text-sm text-text-gray mb-4">Напишите нам в Telegram и получите ответ в течение нескольких минут</p>
            <a
              href="https://t.me/hittabak_zakaz"
              target="_blank"
              rel="nofollow noopener noreferrer"
              className="inline-flex items-center gap-2 bg-accent hover:bg-accent-dark text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              Написать в Telegram
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
