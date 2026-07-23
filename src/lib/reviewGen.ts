// Генерация отзывов для товаров.
//
// Работает в двух режимах:
//   1. Если задан ключ GEMINI_API_KEY — текст пишет нейросеть Google Gemini
//      (та же «встроенная нейронка от гугла», что и для описаний).
//   2. Если ключа нет или запрос к API не удался — используется локальный
//      генератор реалистичных русских отзывов (работает из коробки, без ключа).
//
// В обоих случаях отзыв создаётся от имени вымышленного человека (напр. «Василий А.»),
// с оценкой и текстом, привязанными к конкретному товару.

export interface ReviewProductInput {
  name: string;
  brand?: string | null;
  productType?: string | null;
  category?: string | null;
}

export interface GeneratedReview {
  authorName: string;
  rating: number;
  text: string;
}

// --- Имена вымышленных авторов -------------------------------------------------

const MALE_NAMES = [
  "Александр", "Дмитрий", "Максим", "Сергей", "Андрей", "Алексей", "Артём",
  "Илья", "Кирилл", "Михаил", "Никита", "Роман", "Егор", "Владимир", "Павел",
  "Василий", "Денис", "Евгений", "Игорь", "Константин", "Олег", "Пётр", "Тимур",
  "Антон", "Виктор", "Глеб", "Данила", "Захар", "Леонид", "Николай", "Юрий",
];

const FEMALE_NAMES = [
  "Анна", "Мария", "Елена", "Ольга", "Наталья", "Ирина", "Татьяна", "Екатерина",
  "Юлия", "Светлана", "Марина", "Дарья", "Виктория", "Ксения", "Алина", "Полина",
  "Валентина", "Галина", "Людмила", "Надежда", "Оксана", "Вера", "Кристина",
  "Софья", "Анастасия", "Евгения", "Лидия", "Маргарита", "Тамара", "Яна",
];

const LAST_INITIALS = [
  "А.", "Б.", "В.", "Г.", "Д.", "Е.", "Ж.", "З.", "И.", "К.", "Л.", "М.",
  "Н.", "О.", "П.", "Р.", "С.", "Т.", "Ф.", "Х.", "Ц.", "Ч.", "Ш.", "Щ.", "Я.",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Случайное имя автора в формате «Василий А.» / «Ольга К.». */
export function randomAuthorName(): { name: string; gender: "male" | "female" } {
  const gender: "male" | "female" = Math.random() < 0.55 ? "male" : "female";
  const first = gender === "male" ? pick(MALE_NAMES) : pick(FEMALE_NAMES);
  return { name: `${first} ${pick(LAST_INITIALS)}`, gender };
}

/** Оценка со смещением к высоким значениям (реалистичное распределение). */
export function pickRating(): number {
  const r = Math.random();
  if (r < 0.6) return 5;
  if (r < 0.9) return 4;
  return 3;
}

// --- Локальный генератор текста ------------------------------------------------

// Как назвать товар внутри отзыва: по типу («стик»), иначе нейтрально («товар»).
function subject(product: ReviewProductInput): string {
  const t = (product.productType || "").trim().toLowerCase();
  if (t) return t;
  return "товар";
}

const OPENERS_5_M = [
  "Заказывал уже второй раз — всё отлично.",
  "Полностью доволен покупкой.",
  "Именно то, что искал.",
  "Товар супер, рекомендую.",
  "Всё пришло быстро и в целости.",
  "Отличное качество за свои деньги.",
];
const OPENERS_5_F = [
  "Заказывала уже второй раз — всё отлично.",
  "Полностью довольна покупкой.",
  "Именно то, что искала.",
  "Товар супер, рекомендую.",
  "Всё пришло быстро и в целости.",
  "Отличное качество за свои деньги.",
];
const OPENERS_4_M = [
  "В целом доволен, но есть пара нюансов.",
  "Хороший товар, брал бы ещё.",
  "Неплохо, ожидания оправдались.",
  "Достойный вариант за эту цену.",
];
const OPENERS_4_F = [
  "В целом довольна, но есть пара нюансов.",
  "Хороший товар, брала бы ещё.",
  "Неплохо, ожидания оправдались.",
  "Достойный вариант за эту цену.",
];
const OPENERS_3 = [
  "Товар нормальный, но не без минусов.",
  "Ожидал немного большего, но пользоваться можно.",
  "Средне. Есть что улучшить.",
  "На троечку — своих денег скорее стоит.",
];

const BODY_POSITIVE = [
  "«{name}» полностью соответствует описанию на сайте.",
  "Качество {subj} на высоте, придраться не к чему.",
  "{Subj} выглядит и ощущается заметно лучше, чем на фото.",
  "Пользуюсь уже неделю — «{name}» радует каждый день.",
  "Упаковка аккуратная, {subj} не помялся при доставке.",
  "За такую цену «{name}» — отличное предложение.",
  "Сравнивал с аналогами — этот вариант оказался удачнее.",
];

const BODY_NEUTRAL = [
  "«{name}» в целом соответствует описанию, но фото чуть приукрашено.",
  "{Subj} рабочий, хотя упаковка могла бы быть покрепче.",
  "К самому «{name}» вопросов нет, а вот доставку ждал дольше обещанного.",
  "Есть небольшие огрехи, но на функциональности это не сказывается.",
];

const DELIVERY = [
  "Доставка быстрая, курьер вежливый.",
  "Привезли на следующий день, приятно удивлён.",
  "Заказ собрали правильно, ничего не перепутали.",
  "Магазину спасибо за оперативность.",
  "Отдельный плюс за удобную оплату и упаковку.",
];

const CLOSERS_REC = [
  "Рекомендую к покупке!",
  "Буду заказывать здесь снова.",
  "Смело берите — не пожалеете.",
  "Магазин добавил в закладки.",
];
const CLOSERS_NEUTRAL = [
  "Брать или нет — решайте сами.",
  "В принципе, повторно бы заказал.",
  "Свою задачу выполняет.",
];

function fill(template: string, product: ReviewProductInput): string {
  const subj = subject(product);
  const Subj = subj.charAt(0).toUpperCase() + subj.slice(1);
  return template
    .replaceAll("{name}", product.name)
    .replaceAll("{subj}", subj)
    .replaceAll("{Subj}", Subj);
}

function maybe(prob: number): boolean {
  return Math.random() < prob;
}

/** Собрать локальный отзыв из шаблонов (без обращения к сети). */
export function generateLocalReview(
  product: ReviewProductInput,
  opts?: { rating?: number; authorName?: string; gender?: "male" | "female" },
): GeneratedReview {
  let authorName = opts?.authorName;
  let gender = opts?.gender;
  if (!authorName) {
    const a = randomAuthorName();
    authorName = a.name;
    gender = a.gender;
  }
  if (!gender) gender = "male";

  const rating = opts?.rating ?? pickRating();

  const parts: string[] = [];
  if (rating >= 5) {
    parts.push(pick(gender === "female" ? OPENERS_5_F : OPENERS_5_M));
    parts.push(fill(pick(BODY_POSITIVE), product));
    if (maybe(0.6)) parts.push(pick(DELIVERY));
    parts.push(pick(CLOSERS_REC));
  } else if (rating === 4) {
    parts.push(pick(gender === "female" ? OPENERS_4_F : OPENERS_4_M));
    parts.push(fill(maybe(0.5) ? pick(BODY_POSITIVE) : pick(BODY_NEUTRAL), product));
    if (maybe(0.5)) parts.push(pick(DELIVERY));
    parts.push(maybe(0.6) ? pick(CLOSERS_REC) : pick(CLOSERS_NEUTRAL));
  } else {
    parts.push(pick(OPENERS_3));
    parts.push(fill(pick(BODY_NEUTRAL), product));
    parts.push(pick(CLOSERS_NEUTRAL));
  }

  return { authorName, rating, text: parts.join(" ") };
}

// --- Генерация через Google Gemini --------------------------------------------

/** Промпт для нейросети / поиска Google. */
export function buildReviewPrompt(product: ReviewProductInput, rating: number): string {
  const attrs = [
    product.brand ? `бренд ${product.brand}` : "",
    product.productType ? `тип: ${product.productType}` : "",
    product.category ? `категория: ${product.category}` : "",
  ].filter(Boolean).join(", ");
  return [
    `Напиши правдоподобный отзыв покупателя на товар «${product.name}» для интернет-магазина.`,
    attrs ? `Характеристики товара: ${attrs}.` : "",
    `Оценка — ${rating} из 5.`,
    "Требования: 2–4 предложения, живой разговорный русский язык, без markdown, без кавычек вокруг всего текста, от первого лица, упомяни впечатление от товара и по возможности доставку.",
    "Верни только текст отзыва, без пояснений.",
  ].filter(Boolean).join(" ");
}

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

/** Есть ли настроенный ключ Google AI. */
export function hasGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY);
}

/**
 * Сгенерировать текст отзыва через Google Gemini.
 * Бросает исключение при отсутствии ключа или ошибке API — вызывающий код
 * должен перехватить и использовать локальный генератор.
 */
export async function generateWithGemini(
  product: ReviewProductInput,
  rating: number,
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY не задан");

  const prompt = buildReviewPrompt(product, rating);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 1.0, maxOutputTokens: 300 },
      }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Gemini API ${res.status}: ${body.slice(0, 200)}`);
    }
    const data = await res.json();
    const text: string | undefined = data?.candidates?.[0]?.content?.parts
      ?.map((p: { text?: string }) => p.text || "")
      .join("")
      .trim();
    if (!text) throw new Error("Пустой ответ Gemini");
    // Убираем случайные обрамляющие кавычки.
    return text.replace(/^["«»']+|["«»']+$/g, "").trim();
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Основная точка входа: сгенерировать отзыв (имя + оценка + текст).
 * Пытается использовать Gemini, при неудаче — локальный генератор.
 */
export async function generateReview(
  product: ReviewProductInput,
  opts?: { rating?: number; authorName?: string },
): Promise<GeneratedReview & { engine: "gemini" | "local" }> {
  const author = opts?.authorName
    ? { name: opts.authorName, gender: "male" as const }
    : randomAuthorName();
  const rating = opts?.rating ?? pickRating();

  if (hasGeminiKey()) {
    try {
      const text = await generateWithGemini(product, rating);
      return { authorName: author.name, rating, text, engine: "gemini" };
    } catch {
      // молча падаем в локальный генератор
    }
  }
  const local = generateLocalReview(product, {
    rating,
    authorName: author.name,
    gender: author.gender,
  });
  return { ...local, engine: "local" };
}
