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
              <li><Link href="/catalog/devices" className="hover:text-white transition-colors">Устройства</Link></li>
              <li><Link href="/catalog/sticks" className="hover:text-white transition-colors">Стики</Link></li>
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

          {/* Social */}
          <div>
            <h3 className="font-bold mb-4 text-sm">Мы в соцсетях</h3>
            <div className="flex items-center gap-3 mb-4">
              <a href="https://t.me/hittabak" target="_blank" rel="nofollow noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-accent rounded-lg flex items-center justify-center transition-colors" title="Telegram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                </svg>
              </a>
              <a href="https://vk.com/hittabak" target="_blank" rel="nofollow noopener noreferrer"
                className="w-10 h-10 bg-white/10 hover:bg-accent rounded-lg flex items-center justify-center transition-colors" title="VK">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.864-.525-2.05-1.727-1.033-1-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.118-5.335-3.202C4.624 10.857 4.03 8.57 4.03 8.096c0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.847 2.49 2.27 4.674 2.862 4.674.22 0 .322-.102.322-.66V9.72c-.068-1.186-.695-1.287-.695-1.71 0-.203.17-.407.44-.407h2.744c.373 0 .508.203.508.644v3.049c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.15-3.574 2.15-3.574.119-.254.322-.491.762-.491h1.744c.525 0 .644.27.525.644-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.05.17.49-.085.744-.576.744z" />
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
