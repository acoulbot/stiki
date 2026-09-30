import { prisma } from "@/lib/prisma";

type PublicCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
  parentId: string | null;
  _count: { products: number };
  children: PublicCategory[];
};

export async function GET() {
  const rows = await prisma.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });
  const nodes = new Map<string, PublicCategory>();
  for (const row of rows) nodes.set(row.id, { ...row, children: [] });
  const roots: PublicCategory[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    if (parent) parent.children.push(node); else roots.push(node);
  }
  return Response.json(roots);
}
