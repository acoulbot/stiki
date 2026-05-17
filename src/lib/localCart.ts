export interface LocalCartItem {
  productId: string;
  quantity: number;
  isPack: boolean;
}

const CART_KEY = "hittabak_cart";

export function getCart(): LocalCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveCart(items: LocalCartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(productId: string, quantity: number, isPack = false) {
  const items = getCart();
  const existing = items.find((i) => i.productId === productId && i.isPack === isPack);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({ productId, quantity, isPack });
  }
  saveCart(items);
}

export function updateCartItem(productId: string, quantity: number, isPack: boolean) {
  let items = getCart();
  if (quantity < 1) {
    items = items.filter((i) => !(i.productId === productId && i.isPack === isPack));
  } else {
    const existing = items.find((i) => i.productId === productId && i.isPack === isPack);
    if (existing) existing.quantity = quantity;
  }
  saveCart(items);
}

export function removeFromCart(productId: string, isPack: boolean) {
  const items = getCart().filter((i) => !(i.productId === productId && i.isPack === isPack));
  saveCart(items);
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
  window.dispatchEvent(new Event("cart-updated"));
}

export function getCartCount(): number {
  return getCart().reduce((sum, i) => sum + i.quantity, 0);
}
