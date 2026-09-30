"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";

/* ── static nav items (non-catalog) ── */
interface SimpleNavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

const staticNavItems: SimpleNavItem[] = [
  { label: "Где купить", href: "/stores" },
  { label: "Новости", href: "/news" },
  { label: "О нас", href: "/about" },
  { label: "Контакты", href: "/contacts" },
];

/* ── nav data types from API ── */
interface NavProduct {
  name: string;
  slug: string;
  color: string;
  image: string;
}

interface NavModel {
  name: string;
  slug: string;
  href?: string;
  products: NavProduct[];
}

interface NavBrand {
  name: string;
  href?: string;
  models: NavModel[];
}

interface NavStickBrand {
  name: string;
  slug: string;
  href?: string;
  count: number;
}

interface NavData {
  devices: NavBrand[];
  sticks: NavStickBrand[];
  deviceRootHref?: string;
  stickRootHref?: string;
}

function getImageSrc(image: string) {
  if (!image) return "";
  if (image.startsWith("http")) return image;
  if (image.startsWith("/api/")) return image;
  if (image.startsWith("/uploads/")) return `/api${image}`;
  if (image.startsWith("/")) return `/api/static${image}`;
  return image;
}

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [cartSwing, setCartSwing] = useState(false);
  const prevCartCount = useRef(0);
  const [city, setCity] = useState("Москва");
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Mega-menu state
  const [navData, setNavData] = useState<NavData | null>(null);
  const [activeBrand, setActiveBrand] = useState<string | null>(null);
  const [activeModel, setActiveModel] = useState<string | null>(null);

  // Mobile accordion state
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const [mobileBrand, setMobileBrand] = useState<string | null>(null);
  const [mobileModel, setMobileModel] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("selectedCity");
    if (saved) {
      requestAnimationFrame(() => setCity(saved));
    }
  }, []);

  useEffect(() => {
    fetch("/api/nav-data")
      .then((r) => r.json())
      .then((d: NavData) => setNavData(d))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem("hittabak_cart") || "[]");
        setCartCount(cart.reduce((sum: number, i: { quantity: number }) => sum + i.quantity, 0));
      } catch {
        setCartCount(0);
      }
    };
    updateCartCount();
    window.addEventListener("cart-updated", updateCartCount);
    return () => { window.removeEventListener("cart-updated", updateCartCount); };
  }, []);

  useEffect(() => {
    if (cartCount > prevCartCount.current && prevCartCount.current >= 0) {
      setCartSwing(true);
      setTimeout(() => setCartSwing(false), 800);
    }
    prevCartCount.current = cartCount;
  }, [cartCount]);

  const handleMouseEnter = useCallback((label: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setOpenDropdown(label);
    setActiveBrand(null);
    setActiveModel(null);
  }, []);

  const handleMouseLeave = useCallback(() => {
    dropdownTimeout.current = setTimeout(() => {
      setOpenDropdown(null);
      setActiveBrand(null);
      setActiveModel(null);
    }, 200);
  }, []);

  const handleBrandEnter = useCallback((brandName: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setActiveBrand(brandName);
    setActiveModel(null);
  }, []);

  const handleModelEnter = useCallback((modelName: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setActiveModel(modelName);
  }, []);

  const closeAll = useCallback(() => {
    setOpenDropdown(null);
    setActiveBrand(null);
    setActiveModel(null);
    setMenuOpen(false);
  }, []);

  /* ── find active data ── */
  const deviceBrands = navData?.devices || [];
  const stickBrands = navData?.sticks || [];
  const deviceRootHref = navData?.deviceRootHref || "/catalog/devices";
  const stickRootHref = navData?.stickRootHref || "/catalog/sticks";
  const currentDeviceBrand = deviceBrands.find((b) => b.name === activeBrand);
  const currentModel = currentDeviceBrand?.models.find((m) => m.name === activeModel);

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

          {/* ── Устройства (mega-menu) ── */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("Устройства")}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              href={deviceRootHref}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-white/10 ${openDropdown === "Устройства" ? "bg-white/10" : ""}`}
            >
              Устройства
              <svg className="inline-block w-3.5 h-3.5 ml-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>

            {openDropdown === "Устройства" && (
              <div className="absolute top-full left-0 mt-1 bg-white text-text-dark rounded-xl shadow-2xl border border-border animate-scale-in z-50 flex">
                {/* Column 1: Brands */}
                <div className="py-2 min-w-[180px] border-r border-border">
                  <Link
                    href={deviceRootHref}
                    className="block px-4 py-2 text-sm font-semibold text-accent hover:bg-bg-light transition-colors"
                    onClick={closeAll}
                  >
                    Все устройства
                  </Link>
                  {deviceBrands.map((brand) => (
                    <Link
                      key={brand.name}
                      href={brand.href || `${deviceRootHref}?brands=${encodeURIComponent(brand.name)}`}
                      className={`px-4 py-2 text-sm cursor-pointer transition-colors flex items-center justify-between ${activeBrand === brand.name ? "bg-bg-light font-semibold" : "hover:bg-bg-light"}`}
                      onMouseEnter={() => handleBrandEnter(brand.name)}
                      onClick={closeAll}
                    >
                      {brand.name}
                      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  ))}
                </div>

                {/* Column 2: Models */}
                {currentDeviceBrand && (
                  <div className="py-2 min-w-[200px] border-r border-border">
                    {currentDeviceBrand.models.map((model) => (
                      <Link
                        key={model.name}
                        href={model.href || `${deviceRootHref}/${model.slug}`}
                        className={`px-4 py-2 text-sm cursor-pointer transition-colors flex items-center justify-between ${activeModel === model.name ? "bg-bg-light font-semibold" : "hover:bg-bg-light"}`}
                        onMouseEnter={() => handleModelEnter(model.name)}
                        onClick={closeAll}
                      >
                        <span className="truncate">{model.name}</span>
                        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{model.products.length}</span>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Column 3: Products (colors) */}
                {currentModel && (
                  <div className="py-2 min-w-[250px] max-h-[400px] overflow-y-auto">
                    {currentModel.products.map((product) => (
                      <Link
                        key={product.slug}
                        href={`/product/${product.slug}`}
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-bg-light transition-colors"
                        onClick={closeAll}
                      >
                        {product.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={getImageSrc(product.image)}
                            alt={product.name}
                            className="w-10 h-10 object-contain rounded flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-bg-light rounded flex-shrink-0 flex items-center justify-center">
                            <span className="text-[8px] text-gray-400">Фото</span>
                          </div>
                        )}
                        <span className="truncate">{product.color || product.name}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Стики (mega-menu) ── */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("Стики")}
            onMouseLeave={handleMouseLeave}
          >
            <Link
              href={stickRootHref}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-white/10 ${openDropdown === "Стики" ? "bg-white/10" : ""}`}
            >
              Стики
              <svg className="inline-block w-3.5 h-3.5 ml-1 -mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </Link>

            {openDropdown === "Стики" && (
              <div className="absolute top-full left-0 mt-1 bg-white text-text-dark rounded-xl shadow-2xl border border-border py-2 min-w-[240px] max-h-[500px] overflow-y-auto animate-scale-in z-50">
                <Link
                  href={stickRootHref}
                  className="block px-4 py-2 text-sm font-semibold text-accent hover:bg-bg-light transition-colors"
                  onClick={closeAll}
                >
                  Все стики
                </Link>
                {stickBrands.map((brand) => (
                  <Link
                    key={brand.slug}
                    href={brand.href || `${stickRootHref}/${brand.slug}`}
                    className="flex items-center justify-between px-4 py-2 text-sm hover:bg-bg-light transition-colors"
                    onClick={closeAll}
                  >
                    <span>{brand.name}</span>
                    <span className="text-xs text-gray-400">{brand.count}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* ── Static nav items ── */}
          {staticNavItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => handleMouseEnter(item.label)}
              onMouseLeave={handleMouseLeave}
            >
              <Link
                href={item.href}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-white/10 ${openDropdown === item.label ? "bg-white/10" : ""}`}
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
                      onClick={closeAll}
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
        <div className="lg:hidden bg-bg-dark border-t border-white/10 animate-fade-in max-h-[80vh] overflow-y-auto">
          <nav className="max-w-7xl mx-auto px-4 py-4 space-y-1">

            {/* Mobile: Устройства */}
            <div>
              <button
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
                onClick={() => { setMobileExpanded(mobileExpanded === "devices" ? null : "devices"); setMobileBrand(null); setMobileModel(null); }}
              >
                Устройства
                <svg className={`w-4 h-4 transition-transform ${mobileExpanded === "devices" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileExpanded === "devices" && (
                <div className="ml-3 space-y-0.5">
                  <Link href={deviceRootHref} className="block px-3 py-2 text-xs text-accent font-semibold" onClick={closeAll}>
                    Все устройства
                  </Link>
                  {deviceBrands.map((brand) => (
                    <div key={brand.name}>
                      <div className="flex items-center gap-1">
                        <Link
                          href={brand.href || `${deviceRootHref}?brands=${encodeURIComponent(brand.name)}`}
                          className={`flex-1 px-3 py-2 text-xs rounded transition-colors ${mobileBrand === brand.name ? "bg-white/10 text-white" : "text-white/70 hover:text-white"}`}
                          onClick={closeAll}
                        >
                          {brand.name}
                        </Link>
                        <button
                          className="px-2 py-2 text-white/50 hover:text-white"
                          onClick={() => { setMobileBrand(mobileBrand === brand.name ? null : brand.name); setMobileModel(null); }}
                        >
                          <svg className={`w-3 h-3 transition-transform ${mobileBrand === brand.name ? "rotate-90" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                      {mobileBrand === brand.name && (
                        <div className="ml-3 space-y-0.5">
                          {brand.models.map((model) => (
                            <div key={model.name}>
                              <div className="flex items-center gap-1">
                                <Link
                                  href={model.href || `${deviceRootHref}/${model.slug}`}
                                  className={`flex-1 px-3 py-1.5 text-xs rounded transition-colors truncate ${mobileModel === model.name ? "bg-white/5 text-white" : "text-white/60 hover:text-white"}`}
                                  onClick={closeAll}
                                >
                                  {model.name}
                                </Link>
                                <button
                                  className="px-2 py-1.5 text-white/30 hover:text-white"
                                  onClick={() => setMobileModel(mobileModel === model.name ? null : model.name)}
                                >
                                  <span className="text-white/30 text-xs">{model.products.length}</span>
                                </button>
                              </div>
                              {mobileModel === model.name && (
                                <div className="ml-3 space-y-0.5">
                                  {model.products.map((p) => (
                                    <Link
                                      key={p.slug}
                                      href={`/product/${p.slug}`}
                                      className="block px-3 py-1.5 text-xs text-white/50 hover:text-white transition-colors truncate"
                                      onClick={closeAll}
                                    >
                                      {p.color || p.name}
                                    </Link>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile: Стики */}
            <div>
              <button
                className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
                onClick={() => { setMobileExpanded(mobileExpanded === "sticks" ? null : "sticks"); setMobileBrand(null); }}
              >
                Стики
                <svg className={`w-4 h-4 transition-transform ${mobileExpanded === "sticks" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileExpanded === "sticks" && (
                <div className="ml-3 space-y-0.5">
                  <Link href={stickRootHref} className="block px-3 py-2 text-xs text-accent font-semibold" onClick={closeAll}>
                    Все стики
                  </Link>
                  {stickBrands.map((brand) => (
                    <Link
                      key={brand.slug}
                      href={brand.href || `${stickRootHref}/${brand.slug}`}
                      className="flex items-center justify-between px-3 py-2 text-xs text-white/70 hover:text-white transition-colors"
                      onClick={closeAll}
                    >
                      <span>{brand.name}</span>
                      <span className="text-white/30">{brand.count}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile: static nav items */}
            {staticNavItems.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <>
                    <button
                      className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
                      onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                    >
                      {item.label}
                      <svg className={`w-4 h-4 transition-transform ${mobileExpanded === item.label ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {mobileExpanded === item.label && (
                      <div className="ml-4 space-y-0.5">
                        {item.children.map((child) => (
                          <Link
                            key={child.href + child.label}
                            href={child.href}
                            className="block px-3 py-2 text-xs text-white/70 hover:text-white transition-colors"
                            onClick={closeAll}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="block px-3 py-2.5 text-sm font-medium rounded-lg hover:bg-white/10 transition-colors"
                    onClick={closeAll}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
