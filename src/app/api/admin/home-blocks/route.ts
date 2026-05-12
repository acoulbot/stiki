import { prisma } from "@/lib/prisma";
import { verifyToken, getTokenFromRequest } from "@/lib/auth";

function checkAdmin(request: Request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload || payload.role !== "admin") return null;
  return payload;
}

export async function GET(request: Request) {
  const payload = checkAdmin(request);
  if (!payload) return Response.json({ error: "Не авторизован" }, { status: 401 });

  const blocks = await prisma.homeBlock.findMany({ orderBy: { order: "asc" } });
  return Response.json(blocks);
}

export async function POST(request: Request) {
  const payload = checkAdmin(request);
  if (!payload) return Response.json({ error: "Не авторизован" }, { status: 401 });

  const data = await request.json();
  const block = await prisma.homeBlock.create({
    data: {
      blockType: data.blockType || "hero",
      title: data.title || "",
      subtitle: data.subtitle || "",
      buttonText: data.buttonText || "",
      buttonLink: data.buttonLink || "",
      image: data.image || "",
      bgImage: data.bgImage || "",
      order: data.order ?? 0,
      active: data.active ?? true,
      config: data.config || "{}",
    },
  });
  return Response.json(block);
}

export async function PUT(request: Request) {
  const payload = checkAdmin(request);
  if (!payload) return Response.json({ error: "Не авторизован" }, { status: 401 });

  const data = await request.json();
  if (!data.id) return Response.json({ error: "ID обязателен" }, { status: 400 });

  const block = await prisma.homeBlock.update({
    where: { id: data.id },
    data: {
      ...(data.blockType !== undefined && { blockType: data.blockType }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.subtitle !== undefined && { subtitle: data.subtitle }),
      ...(data.buttonText !== undefined && { buttonText: data.buttonText }),
      ...(data.buttonLink !== undefined && { buttonLink: data.buttonLink }),
      ...(data.image !== undefined && { image: data.image }),
      ...(data.bgImage !== undefined && { bgImage: data.bgImage }),
      ...(data.order !== undefined && { order: data.order }),
      ...(data.active !== undefined && { active: data.active }),
      ...(data.config !== undefined && { config: data.config }),
    },
  });
  return Response.json(block);
}

export async function DELETE(request: Request) {
  const payload = checkAdmin(request);
  if (!payload) return Response.json({ error: "Не авторизован" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return Response.json({ error: "ID обязателен" }, { status: 400 });

  await prisma.homeBlock.delete({ where: { id } });
  return Response.json({ success: true });
}
