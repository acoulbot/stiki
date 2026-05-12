"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "sent") {
    return (
      <div className="bg-success/10 text-success rounded-xl p-6 text-center">
        <p className="font-bold">Сообщение отправлено!</p>
        <p className="text-sm mt-1">Мы свяжемся с вами в ближайшее время</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        placeholder="Ваше имя"
        required
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:border-accent focus:outline-none"
      />
      <input
        type="email"
        placeholder="Email"
        required
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:border-accent focus:outline-none"
      />
      <input
        type="tel"
        placeholder="Телефон"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
        className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:border-accent focus:outline-none"
      />
      <input
        type="text"
        placeholder="Тема обращения"
        value={form.subject}
        onChange={(e) => setForm({ ...form, subject: e.target.value })}
        className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:border-accent focus:outline-none"
      />
      <textarea
        placeholder="Сообщение"
        required
        rows={4}
        value={form.message}
        onChange={(e) => setForm({ ...form, message: e.target.value })}
        className="w-full px-4 py-3 border border-border rounded-xl text-sm focus:border-accent focus:outline-none resize-none"
      />
      {status === "error" && <p className="text-danger text-xs">Ошибка отправки. Попробуйте ещё раз.</p>}
      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full bg-accent hover:bg-accent-dark text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
      >
        {status === "sending" ? "Отправка..." : "Отправить"}
      </button>
    </form>
  );
}
