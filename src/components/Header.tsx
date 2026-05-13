"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    label: "Устройства",
    href: "/catalog/devices",
    children: [
      { label: "Все устройства", href: "/catalog/devices" },
      { label: "Обзор новинки", href: "/catalog/devices?tag=new" },
      { label: "Как пользоваться", href: "/blog/how-to-use" },
      { label: "Как чистить", href: "/blog/how-to-clean" },
    ],
  },
  {
    label: "Стики",
    href: "/catalog/sticks",
    children: [
      { label: "Все стики", href: "/catalog/sticks" },
      { label: "Подобрать вкус", href: "/catalog/sticks?filter=taste" },
      { label: "Больше о стиках", href: "/blog/about-sticks" },
      { label: "О производстве", href: "/blog/production" },
    ],
  },
  { label: "Где купить", href: "/stores" },
  { label: "Новости", href: "/news" },
  {
    label: "О нас",
    href: "/about",
    children: [
      { label: "О компании", href: "/about" },
      { label: "История бренда", href: "/about/history" },
      { label: "Наука и технологии", href: "/science" },
    ],
  },
  {
    label: "Поддержка",
    href: "/support",
    children: [
      { label: "Контакты", href: "/contacts" },
      { label: "Онлайн-диагностика", href: "/support/diagnostics" },
      { label: "Техподдержка", href: "/support" },
      { label: "Обмен и возврат", href: "/returns" },
      { label: "FAQ", href: "/faq" },
    ],
  },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [cartSwing, setCartSwing] = useState(false);
  const prevCartCount = useRef(0);
  const [city, setCity] = useState("Москва");
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const saved = localStorage.getItem("selectedCity");
    if (saved) {
      requestAnimationFrame(() => setCity(saved));
    }
  }, []);

  useEffect(() => {
    const fetchCart = async () => {
      const token = localStorage.getItem("userToken");
      if (!token) return;
      try {
        const res = await fetch("/api/user/cart", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const items = await res.json();
          setCartCount(items.reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0));
        }
      } catch {}
    };
    fetchCart();
    const interval = setInterval(fetchCart, 10000);
    const handleCartUpdate = () => fetchCart();
    window.addEventListener("cart-updated", handleCartUpdate);
    return () => { clearInterval(interval); window.removeEventListener("cart-updated", handleCartUpdate); };
  }, []);

  useEffect(() => {
    if (cartCount > prevCartCount.current && prevCartCount.current >= 0) {
      setCartSwing(true);
      setTimeout(() => setCartSwing(false), 800);
    }
    prevCartCount.current = cartCount;
  }, [cartCount]);

  const handleMouseEnter = (label: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setOpenDropdown(label);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 200);
  };

  return (
    <header className="bg-bg-dark text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
          <Image src="/logo.png" alt="hittabak" width={36} height={36} className="rounded" />
          <span className="font-heading text-xl sm:text-2xl font-extrabold tracking-tight">
            hit<span className="text-accent">tabak</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => handleMouseEnter(item.label)}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href={item.href}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-white/10 ${
                  openDropdown === item.label ? "bg-white/10" : ""
                }`}
              >
                {item.label}
                {item.children && (
                  <svg className="inline-block w-3.5 h-3.5 ml-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </Link>
              {item.children && openDropdown === item.label && (
                <div className="absolute top-full left-0 mt-1 bg-white text-text-dark rounded-xl shadow-xl border border-border py-2 min-w-[220px] animate-scale-in z-50">
                  {item.children.map((child) => (
                    <Link
                      key={child.href + child.label}
                      href={child.href}
                      className="block px-4 py-2.5 text-sm hover:bg-bg-light transition-colors"
                      onClick={() => setOpenDropdown(null)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* City selector */}
          <button
            onClick={() => {
              const newCity = prompt("Введите ваш город:", city);
              if (newCity) {
                setCity(newCity);
                localStorage.setItem("selectedCity", newCity);
              }
            }}
            className="hidden sm:flex items-center gap-1 text-xs text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {city}
          </button>

          {/* Cart */}
          <Link href="/cart" className="relative p-2 hover:bg-white/10 rounded-lg transition-colors">
            <svg className={`w-5 h-5 ${cartSwing ? "animate-cart-swing" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Account */}
          <Link href="/account" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>

          {/* Mobile burger */}
          <button
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Меню"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-bg-dark border-t border-white/10 animate-fade-in">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <div key={item.label}>
                <Link
                  href={item.href}
                  className="block px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
                  onClick={() => { setMenuOpen(false); }}
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="ml-4 space-y-0.5">
                    {item.children.map((child) => (
                      <Link
                        key={child.href + child.label}
                        href={child.href}
                        className="block px-3 py-2 text-xs text-white/70 hover:text-white transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
