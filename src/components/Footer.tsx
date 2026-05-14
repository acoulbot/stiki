import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-bg-dark text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Products */}
          <div>
            <h3 className="font-bold mb-4 text-sm">Продукты</h3>
            <ul className="space-y-2 text-xs text-white/70">
              <li><Link href="/catalog/nagrevateli-tabaka" className="hover:text-white transition-colors">Устройства</Link></li>
              <li><Link href="/catalog/stiki-dlya-nagrevatelej" className="hover:text-white transition-colors">Стики</Link></li>
              <li><Link href="/catalog" className="hover:text-white transition-colors">Весь каталог</Link></li>
            </ul>
          </div>

          {/* Useful links */}
          <div>
            <h3 className="font-bold mb-4 text-sm">Полезные ссылки</h3>
            <ul className="space-y-2 text-xs text-white/70">
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/referral" className="hover:text-white transition-colors">Программа лояльности</Link></li>
              <li><Link href="/returns" className="hover:text-white transition-colors">Обмен и возврат</Link></li>
              <li><Link href="/contacts" className="hover:text-white transition-colors">Контакты</Link></li>
              <li><Link href="/stores" className="hover:text-white transition-colors">Где купить</Link></li>
              <li><Link href="/news" className="hover:text-white transition-colors">Новости</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">О нас</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold mb-4 text-sm">Юридическая информация</h3>
            <ul className="space-y-2 text-xs text-white/70">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Политика конфиденциальности</Link></li>
              <li><Link href="/cookies" className="hover:text-white transition-colors">Cookie-политика</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Пользовательское соглашение</Link></li>
            </ul>
          </div>

          {/* Contacts & Social */}
          <div>
            <h3 className="font-bold mb-4 text-sm">Контакты</h3>
            <ul className="space-y-1 text-xs text-white/70 mb-4">
              <li>ИП Атаманова Н.О.</li>
              <li>ИНН 720302151142</li>
              <li>ОГРНИП 323508100551579</li>
            </ul>
            <div className="flex items-center gap-3 mb-3">
              <a href="https://t.me/tophit_new" target="_blank" rel="nofollow noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-accent rounded-lg flex items-center justify-center transition-colors" title="Telegram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>
            </div>
            <p className="text-xs text-white/50">
              Подписывайтесь и будьте<br/>в курсе новостей бренда
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="hittabak" width={24} height={24} className="rounded opacity-70" />
            <p className="text-xs text-white/50">&copy; {new Date().getFullYear()} hittabak. Все права защищены.</p>
          </div>
          <p className="text-[10px] text-white/30 max-w-xl text-center sm:text-right">
            Данный сайт содержит информацию о продукции, предназначенной для совершеннолетних пользователей.
            Продукция не является безрисковой и содержит никотин, вызывающий зависимость.
          </p>
        </div>
      </div>
    </footer>
  );
}
