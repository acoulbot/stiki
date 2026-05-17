"use client";

import { useState } from "react";
import { showToast } from "@/components/Toast";

interface QuickOrderButtonProps {
  productId: string;
  productName: string;
}

export default function QuickOrderButton({ productId, productName }: QuickOrderButtonProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+7");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s-]+$/;
    if (!name.trim()) errs.name = "Укажите имя";
    else if (!nameRegex.test(name.trim())) errs.name = "Только буквы";
    if (!email.trim()) errs.email = "Укажите email";
    else if (!email.includes("@")) errs.email = "Нужен @";
    if (!phone.trim()) errs.phone = "Укажите телефон";
    else if (!phone.startsWith("+7")) errs.phone = "Начните с +7";
    else if (phone.replace(/\D/g, "").length < 11) errs.phone = "11 цифр";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/quick-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), phone: phone.trim(), productId, productName }),
      });
      if (res.ok) {
        setDone(true);
        showToast("Заявка отправлена! Мы свяжемся с вами.");
        setTimeout(() => { setOpen(false); setDone(false); setName(""); setEmail(""); setPhone("+7"); setErrors({}); }, 3000);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full sm:w-auto px-5 py-2.5 bg-accent hover:bg-accent-dark text-white font-medium rounded-lg transition-colors text-sm"
      >
        Купить в 1 клик
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !loading && setOpen(false)}>
          <div className="bg-white rounded-xl p-5 sm:p-6 max-w-sm w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-bold text-text-dark">Быстрый заказ</h3>
              <button onClick={() => setOpen(false)} className="text-text-gray hover:text-text-dark">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-text-gray mb-4 line-clamp-2">{productName}</p>
            {done ? (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">✓</div>
                <p className="text-success font-medium">Заявка принята!</p>
                <p className="text-sm text-text-gray">Мы свяжемся с вами в ближайшее время</p>
              </div>
            ) : (
              <>
                <div className="mb-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: "" })); }}
                    placeholder="Имя и фамилия *"
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${errors.name ? "border-danger" : "border-border"}`}
                  />
                  {errors.name && <p className="text-danger text-xs mt-1">{errors.name}</p>}
                </div>
                <div className="mb-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: "" })); }}
                    placeholder="Email *"
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${errors.email ? "border-danger" : "border-border"}`}
                  />
                  {errors.email && <p className="text-danger text-xs mt-1">{errors.email}</p>}
                </div>
                <div className="mb-4">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setErrors((p) => ({ ...p, phone: "" })); }}
                    placeholder="+7 (999) 123-45-67 *"
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${errors.phone ? "border-danger" : "border-border"}`}
                  />
                  {errors.phone && <p className="text-danger text-xs mt-1">{errors.phone}</p>}
                </div>
                <button
                  onClick={submit}
                  disabled={loading}
                  className="w-full py-2.5 bg-accent hover:bg-accent-dark text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50"
                >
                  {loading ? "Отправка..." : "Оставить заявку"}
                </button>
                <p className="text-[10px] text-text-light text-center mt-2">Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности</p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
