import { prisma } from "@/lib/prisma";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

async function requireAdmin(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || payload.role !== "admin") return null;

  return payload;
}

export async function GET(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return Response.json({ error: "Не авторизован" }, { status: 401 });

  const settings = await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default" },
  });

  return Response.json(settings);
}

export async function PUT(request: Request) {
  const admin = await requireAdmin(request);
  if (!admin) return Response.json({ error: "Не авторизован" }, { status: 401 });

  const { disableUserEmailVerification, disableCheckoutEmailVerification } = await request.json();

  const settings = await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {
      disableUserEmailVerification: Boolean(disableUserEmailVerification),
      disableCheckoutEmailVerification: Boolean(disableCheckoutEmailVerification),
    },
    create: {
      id: "default",
      disableUserEmailVerification: Boolean(disableUserEmailVerification),
      disableCheckoutEmailVerification: Boolean(disableCheckoutEmailVerification),
    },
  });

  return Response.json({ success: true, settings });
}
