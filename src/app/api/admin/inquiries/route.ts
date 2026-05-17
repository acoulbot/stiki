import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "hittabak-secret-key-2025";

function checkAdmin(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth) return false;
  try {
    jwt.verify(auth.replace("Bearer ", ""), SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!checkAdmin(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
  });
  return Response.json(inquiries);
}

export async function PATCH(req: NextRequest) {
  if (!checkAdmin(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id, status } = await req.json();
  const updated = await prisma.inquiry.update({
    where: { id },
    data: { status },
  });
  return Response.json(updated);
}

export async function DELETE(req: NextRequest) {
  if (!checkAdmin(req)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  await prisma.inquiry.delete({ where: { id } });
  return Response.json({ success: true });
}
