import Header from "@/components/Header";
import Footer from "@/components/Footer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "История бренда — hittabak",
  description: "История создания и развития бренда hittabak. От идеи до реализации.",
};

export default function HistoryPage() {
  const timeline = [
    { year: "2020", title: "Идея", desc: "Зарождение концепции бренда и начало исследований" },
    { year: "2021", title: "Разработка", desc: "Создание прототипов устройств и тестирование составов стиков" },
    { year: "2022", title: "Запуск", desc: "Выход первого устройства на рынок. Открытие онлайн-магазина" },
    { year: "2023", title: "Расширение", desc: "Расширение линейки стиков, новые вкусы и партнёрства" },
    { year: "2024", title: "Рост", desc: "Открытие фирменных точек продаж, программа лояльности" },
    { year: "2025", title: "Инновации", desc: "Новое поколение устройств, улучшенная технология нагрева" },
  ];

  return (
    <>
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-text-dark mb-8">История бренда</h1>

          <div className="space-y-0">
            {timeline.map((item, i) => (
              <div key={item.year} className="flex gap-4 pb-8 relative">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {item.year}
                  </div>
                  {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-border mt-2" />}
                </div>
                <div className="pt-2">
                  <h3 className="text-base font-bold text-text-dark">{item.title}</h3>
                  <p className="text-sm text-text-gray mt-1">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
