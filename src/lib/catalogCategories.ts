import { prisma } from "@/lib/prisma";

export type CategoryNode = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  order: number;
  parentId: string | null;
};

const DEVICE_ROOT_NAMES = ["устройства", "нагреватели табака", "девайсы"];
const STICK_ROOT_NAMES = ["стики", "стики для нагревателей"];

function normalized(value: string) {
  return value.trim().toLocaleLowerCase("ru");
}

export function isDeviceRoot(name: string) {
  return DEVICE_ROOT_NAMES.includes(normalized(name));
}

export function isStickRoot(name: string) {
  return STICK_ROOT_NAMES.includes(normalized(name));
}

export function buildChildrenMap(categories: CategoryNode[]) {
  const children = new Map<string | null, CategoryNode[]>();
  for (const category of categories) {
    const list = children.get(category.parentId) || [];
    list.push(category);
    children.set(category.parentId, list);
  }
  for (const list of children.values()) {
    list.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "ru"));
  }
  return children;
}

export function getDescendantIds(rootId: string, categories: CategoryNode[]) {
  const children = buildChildrenMap(categories);
  const ids: string[] = [];
  const visit = (id: string) => {
    ids.push(id);
    for (const child of children.get(id) || []) visit(child.id);
  };
  visit(rootId);
  return ids;
}

export function getCategoryPathNodes(categoryId: string, categories: CategoryNode[]) {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const path: CategoryNode[] = [];
  const seen = new Set<string>();
  let current = byId.get(categoryId);
  while (current && !seen.has(current.id)) {
    path.unshift(current);
    seen.add(current.id);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return path;
}

export function getCategoryHref(categoryId: string, categories: CategoryNode[]) {
  const path = getCategoryPathNodes(categoryId, categories);
  return `/catalog/${path.map((item) => item.slug).join("/")}`;
}

export function findCatalogRoot(categories: CategoryNode[], type: "device" | "stick") {
  return categories.find((category) =>
    !category.parentId && (type === "device" ? isDeviceRoot(category.name) : isStickRoot(category.name)),
  );
}

export async function loadAllCategories(): Promise<CategoryNode[]> {
  return prisma.category.findMany({
    select: { id: true, name: true, slug: true, icon: true, order: true, parentId: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
}

export function classificationFromPath(path: CategoryNode[]) {
  const root = path[0];
  return {
    productType: root ? (isDeviceRoot(root.name) ? "device" : isStickRoot(root.name) ? "stick" : "") : "",
    brand: path[1]?.name || "",
    model: path[2]?.name || "",
    color: path[3]?.name || "",
  };
}
