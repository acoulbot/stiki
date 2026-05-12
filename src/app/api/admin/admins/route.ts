import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";
import bcrypt from "bcryptjs";

function checkSuperAdmin(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== "admin") return null;
  return payload;
}

export async function GET(request: Request) {
  const payload = checkSuperAdmin(request);
  if (!payload) return Response.json({ error: "Не авторизован" }, { status: 401 });

  const caller = await prisma.admin.findUnique({ where: { id: payload.id } });
  if (!caller || caller.role !== "admin") {
    return Response.json({ error: "Нет прав" }, { status: 403 });
  }

  const admins = await prisma.admin.findMany({
    select: { id: true, username: true, role: true },
    orderBy: { username: "asc" },
  });
  return Response.json(admins);
}

export async function POST(request: Request) {
  const payload = checkSuperAdmin(request);
  if (!payload) return Response.json({ error: "Не авторизован" }, { status: 401 });

  const caller = await prisma.admin.findUnique({ where: { id: payload.id } });
  if (!caller || caller.role !== "admin") {
    return Response.json({ error: "Только главный админ может создавать пользователей" }, { status: 403 });
  }

  const { username, password, role } = await request.json();
  if (!username || !password) {
    return Response.json({ error: "Логин и пароль обязательны" }, { status: 400 });
  }
  if (password.length < 6) {
    return Response.json({ error: "Пароль должен быть минимум 6 символов" }, { status: 400 });
  }

  const existing = await prisma.admin.findUnique({ where: { username } });
  if (existing) {
    return Response.json({ error: "Этот логин уже занят" }, { status: 400 });
  }

  const validRoles = ["admin", "editor"];
  const adminRole = validRoles.includes(role) ? role : "editor";
  const hashed = await bcrypt.hash(password, 10);

  const admin = await prisma.admin.create({
    data: { username, password: hashed, role: adminRole },
    select: { id: true, username: true, role: true },
  });

  return Response.json(admin);
}

export async function PUT(request: Request) {
  const payload = checkSuperAdmin(request);
  if (!payload) return Response.json({ error: "Не авторизован" }, { status: 401 });

  const caller = await prisma.admin.findUnique({ where: { id: payload.id } });
  if (!caller || caller.role !== "admin") {
    return Response.json({ error: "Нет прав" }, { status: 403 });
  }

  const { id, role, password } = await request.json();
  if (!id) return Response.json({ error: "ID обязателен" }, { status: 400 });

  const data: Record<string, string> = {};
  if (role && ["admin", "editor"].includes(role)) data.role = role;
  if (password && password.length >= 6) data.password = await bcrypt.hash(password, 10);

  if (Object.keys(data).length === 0) {
    return Response.json({ error: "Нечего обновлять" }, { status: 400 });
  }

  const admin = await prisma.admin.update({
    where: { id },
    data,
    select: { id: true, username: true, role: true },
  });
  return Response.json(admin);
}

export async function DELETE(request: Request) {
  const payload = checkSuperAdmin(request);
  if (!payload) return Response.json({ error: "Не авторизован" }, { status: 401 });

  const caller = await prisma.admin.findUnique({ where: { id: payload.id } });
  if (!caller || caller.role !== "admin") {
    return Response.json({ error: "Нет прав" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "ID обязателен" }, { status: 400 });

  if (id === payload.id) {
    return Response.json({ error: "Нельзя удалить себя" }, { status: 400 });
  }

  await prisma.admin.delete({ where: { id } });
  return Response.json({ success: true });
}
