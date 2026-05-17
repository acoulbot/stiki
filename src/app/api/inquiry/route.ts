import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { name, email, phone, items, comment, address, total } = await req.json();

  if (!name || !email || !phone || !items || items.length === 0) {
    return NextResponse.json({ error: "Заполните все обязательные поля" }, { status: 400 });
  }

  const nameRegex = /^[a-zA-Zа-яА-ЯёЁ\s-]+$/;
  if (!nameRegex.test(name)) {
    return NextResponse.json({ error: "Имя должно содержать только буквы" }, { status: 400 });
  }

  if (!email.includes("@")) {
    return NextResponse.json({ error: "Укажите корректный email" }, { status: 400 });
  }

  if (!phone.startsWith("+7") || phone.replace(/\D/g, "").length < 11) {
    return NextResponse.json({ error: "Телефон должен начинаться с +7 и содержать 11 цифр" }, { status: 400 });
  }

  const inquiry = await prisma.inquiry.create({
    data: {
      name,
      email,
      phone,
      items: JSON.stringify(items),
      comment: comment || "",
      address: address || "",
      total: total || 0,
    },
  });

  return NextResponse.json({ success: true, inquiryId: inquiry.id });
}
