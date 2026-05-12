"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState } from "react";
import Link from "next/link";

interface Step {
  question: string;
  options: { label: string; next: number | "result"; result?: string }[];
}

const steps: Step[] = [
  {
    question: "Какая у вас проблема с устройством?",
    options: [
      { label: "Устройство не включается", next: 1 },
      { label: "Устройство не нагревает стик", next: 2 },
      { label: "Индикатор мигает красным", next: 3 },
      { label: "Другая проблема", next: 4 },
    ],
  },
  {
    question: "Попробуйте зарядить устройство минимум 2 часа. Помогло?",
    options: [
      { label: "Да, устройство заработало", next: "result", result: "resolved" },
      { label: "Нет, не помогло", next: "result", result: "contact" },
    ],
  },
  {
    question: "Вы чистили устройство за последнюю неделю?",
    options: [
      { label: "Нет", next: "result", result: "clean" },
      { label: "Да, чистил(а)", next: "result", result: "contact" },
    ],
  },
  {
    question: "Сколько раз мигает индикатор?",
    options: [
      { label: "1-2 раза", next: "result", result: "charge" },
      { label: "3 и более раз", next: "result", result: "contact" },
    ],
  },
  {
    question: "Опишите вашу проблему подробнее. Свяжитесь с нашей поддержкой для решения.",
    options: [
      { label: "Перейти в поддержку", next: "result", result: "contact" },
    ],
  },
];

const results: Record<string, { title: string; desc: string }> = {
  resolved: {
    title: "Проблема решена!",
    desc: "Рады, что вам удалось решить проблему. Если она повторится, обратитесь в поддержку.",
  },
  clean: {
    title: "Рекомендуем почистить устройство",
    desc: "Регулярная чистка — ключ к долгой работе устройства. Ознакомьтесь с инструкцией по чистке в нашем блоге.",
  },
  charge: {
    title: "Устройство разряжено",
    desc: "Поставьте устройство на зарядку минимум на 2 часа. Используйте только оригинальный кабель.",
  },
  contact: {
    title: "Свяжитесь с поддержкой",
    desc: "Наши специалисты помогут вам решить проблему. Напишите нам или позвоните.",
  },
};

export default function DiagnosticsPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [resultKey, setResultKey] = useState<string | null>(null);

  const handleOption = (option: Step["options"][0]) => {
    if (option.next === "result" && option.result) {
      setResultKey(option.result);
    } else if (typeof option.next === "number") {
      setCurrentStep(option.next);
    }
  };

  const restart = () => {
    setCurrentStep(0);
    setResultKey(null);
  };

  const step = steps[currentStep];
  const result = resultKey ? results[resultKey] : null;

  return (
    <>
      <Header />
      <main className="flex-1 pb-16 lg:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="font-heading text-3xl font-extrabold text-text-dark mb-8">Онлайн-диагностика</h1>

          {result ? (
            <div className="bg-white rounded-xl border border-border p-8 text-center animate-fade-in">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-bg-blue flex items-center justify-center">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-text-dark mb-2">{result.title}</h2>
              <p className="text-text-gray mb-6">{result.desc}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button onClick={restart} className="px-6 py-2.5 border-2 border-border text-text-dark font-medium rounded-lg hover:border-accent transition-colors">
                  Начать заново
                </button>
                <Link href="/contacts" className="px-6 py-2.5 bg-accent text-white font-medium rounded-lg hover:bg-accent-dark transition-colors">
                  Связаться с поддержкой
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-border p-8 animate-fade-in">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-xs text-text-light">Шаг {currentStep + 1} из {steps.length}</span>
                <div className="flex-1 h-1 bg-bg-light rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }} />
                </div>
              </div>
              <h2 className="text-lg font-bold text-text-dark mb-6">{step.question}</h2>
              <div className="space-y-3">
                {step.options.map((option, i) => (
                  <button
                    key={i}
                    onClick={() => handleOption(option)}
                    className="w-full text-left px-5 py-3.5 border border-border rounded-xl text-sm hover:border-accent hover:bg-accent/5 transition-all"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
