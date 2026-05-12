"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function AgeGate() {
  const [visible, setVisible] = useState(false);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const verified = document.cookie.includes("age_verified=true");
    if (!verified) {
      requestAnimationFrame(() => setVisible(true));
    }
  }, []);

  const handleConfirm = () => {
    const d = parseInt(day);
    const m = parseInt(month);
    const y = parseInt(year);

    if (!d || !m || !y || d < 1 || d > 31 || m < 1 || m > 12 || y < 1900 || y > 2100) {
      setError("Введите корректную дату рождения");
      return;
    }

    const birthDate = new Date(y, m - 1, d);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      window.location.href = "https://google.com";
      return;
    }

    document.cookie = "age_verified=true; max-age=2592000; path=/; SameSite=Lax";
    setVisible(false);
  };

  const handleQuickYes = () => {
    document.cookie = "age_verified=true; max-age=2592000; path=/; SameSite=Lax";
    setVisible(false);
  };

  const handleQuickNo = () => {
    window.location.href = "https://google.com";
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 age-gate-blur flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 text-center animate-scale-in">
        <div className="mb-6">
          <span className="font-heading text-2xl font-extrabold text-text-dark">
            hit<span className="text-accent">tabak</span>
          </span>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-bold text-text-dark mb-2">Подтверждение возраста</h2>
          <p className="text-sm text-text-gray">
            Данный сайт содержит информацию о табачной продукции, предназначенной исключительно для совершеннолетних пользователей.
          </p>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-text-dark mb-3">Вам есть 18 лет?</p>
          <div className="flex gap-3 justify-center mb-4">
            <button
              onClick={handleQuickYes}
              className="px-8 py-2.5 bg-accent hover:bg-accent-dark text-white font-bold rounded-lg transition-colors"
            >
              Да
            </button>
            <button
              onClick={handleQuickNo}
              className="px-8 py-2.5 border-2 border-border text-text-gray hover:border-text-dark hover:text-text-dark font-bold rounded-lg transition-colors"
            >
              Нет
            </button>
          </div>
        </div>

        <div className="border-t border-border pt-4 mb-4">
          <p className="text-xs text-text-gray mb-3">Или введите дату рождения:</p>
          <div className="flex gap-2 justify-center">
            <input
              type="text"
              placeholder="ДД"
              maxLength={2}
              value={day}
              onChange={(e) => setDay(e.target.value.replace(/\D/g, ""))}
              className="w-16 px-3 py-2 border border-border rounded-lg text-center text-sm focus:border-accent focus:outline-none"
            />
            <input
              type="text"
              placeholder="ММ"
              maxLength={2}
              value={month}
              onChange={(e) => setMonth(e.target.value.replace(/\D/g, ""))}
              className="w-16 px-3 py-2 border border-border rounded-lg text-center text-sm focus:border-accent focus:outline-none"
            />
            <input
              type="text"
              placeholder="ГГГГ"
              maxLength={4}
              value={year}
              onChange={(e) => setYear(e.target.value.replace(/\D/g, ""))}
              className="w-20 px-3 py-2 border border-border rounded-lg text-center text-sm focus:border-accent focus:outline-none"
            />
          </div>
          {error && <p className="text-danger text-xs mt-2">{error}</p>}
          <button
            onClick={handleConfirm}
            className="mt-3 px-6 py-2 bg-text-dark text-white text-sm font-medium rounded-lg hover:bg-black transition-colors"
          >
            Подтвердить
          </button>
        </div>

        <p className="text-[10px] text-text-light">
          Продолжая, вы соглашаетесь с{" "}
          <Link href="/cookies" className="underline hover:text-text-gray">Cookie-политикой</Link>
        </p>
      </div>
    </div>
  );
}
