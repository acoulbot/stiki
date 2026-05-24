import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();

  if (!email || !code) {
    return NextResponse.json({ error: "Email и код обязательны" }, { status: 400 });
  }

  const verification = await prisma.emailVerification.findFirst({
    where: { email, code },
    orderBy: { createdAt: "desc" },
  });

  if (!verification) {
    return NextResponse.json({ error: "Неверный код" }, { status: 400 });
  }

  if (verification.expiresAt < new Date()) {
    await prisma.emailVerification.delete({ where: { id: verification.id } });
    return NextResponse.json({ error: "Код истёк. Запросите новый." }, { status: 400 });
  }

  await prisma.emailVerification.delete({ where: { id: verification.id } });

  return NextResponse.json({ success: true, verified: true });
}
