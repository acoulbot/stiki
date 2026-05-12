import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Возврат и обмен — hittabak",
  description: "Условия возврата и обмена товаров в интернет-магазине hittabak. Возврат в течение 14 дней без лишних вопросов.",
  alternates: { canonical: "https://hittabak.ru/returns" },
};

export default function ReturnsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
