import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationCode } from "@/lib/mail";

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Укажите корректный email" }, { status: 400 });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.emailVerification.deleteMany({ where: { email } });

  await prisma.emailVerification.create({
    data: { email, code, expiresAt },
  });

  const result = await sendVerificationCode(email, code);

  if (!result.success) {
    return NextResponse.json({ error: "Не удалось отправить код. Попробуйте позже." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
