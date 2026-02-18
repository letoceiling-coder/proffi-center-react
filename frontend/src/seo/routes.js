/**
 * Карта мета для статических роутов (без slug из API).
 * Ключ — pathname (без ведущего слэша для корня — '' или '/').
 * Используется Seo-компонентом для статических страниц.
 */
export const STATIC_ROUTE_META = {
  '': {
    title: 'Натяжные потолки в Анапе — Proffi Center',
    description: 'Установка натяжных потолков в Анапе. Собственное производство, низкие цены, гарантия качества. Закажите замер бесплатно.',
  },
  '/': {
    title: 'Натяжные потолки в Анапе — Proffi Center',
    description: 'Установка натяжных потолков в Анапе. Собственное производство, низкие цены, гарантия качества. Закажите замер бесплатно.',
  },
  '/gotovye-potolki': {
    title: 'Готовые натяжные потолки — Proffi Center',
    description: 'Каталог готовых натяжных потолков. Матовые, глянцевые, тканевые. Цены и фото.',
  },
  '/natjazhnye-potolki-kalkuljator': {
    title: 'Калькулятор натяжных потолков — расчёт стоимости',
    description: 'Онлайн-калькулятор стоимости натяжного потолка. Узнайте цену за 1 минуту.',
  },
  '/skidki-na-potolki': {
    title: 'Скидки на натяжные потолки — Proffi Center',
    description: 'Акции и скидки на установку натяжных потолков.',
  },
  '/aktsiya': {
    title: 'Акции и подарки — Proffi Center',
    description: 'Специальные предложения и подарки при заказе натяжных потолков.',
  },
  '/o-kompanii': {
    title: 'О компании Proffi Center',
    description: 'Proffi Center — установка натяжных потолков с 2013 года. Собственное производство, гарантия качества.',
  },
  '/natyazhnyye-potolki-otzyvy': {
    title: 'Отзывы о натяжных потолках — Proffi Center',
    description: 'Отзывы клиентов о качестве установки натяжных потолков и работе компании.',
  },
  '/gde-zakazat-potolki': {
    title: 'Где заказать натяжные потолки — контакты',
    description: 'Адрес, телефон, карта. Закажите замер натяжных потолков в вашем городе.',
  },
  '/dogovor': {
    title: 'Договор и документы — Proffi Center',
    description: 'Условия договора на установку натяжных потолков.',
  },
  '/dolyami': {
    title: 'Оплата Долями от Т-Банка — Proffi Center',
    description: 'Долями — сервис оплаты покупок частями: 4 платежа за 6 недель. Первый сразу, остальные каждые 2 недели. Подробности и тарифы на dolyame.ru.',
  },
  '/vozvrat': {
    title: 'Возврат и обмен — Proffi Center',
    description: 'Условия возврата и обмена товаров.',
  },
  '/catalog': {
    title: 'Каталог натяжных потолков — Proffi Center',
    description: 'Каталог товаров: натяжные потолки, комплектующие, освещение.',
  },
  '/potolki-v-prihozhuju': {
    title: 'Натяжные потолки в прихожую — Proffi Center',
    description: 'Идеи и цены на натяжные потолки для прихожей. Фото, варианты освещения.',
  },
  '/potolki-v-gostinuju': {
    title: 'Натяжные потолки в гостиную — Proffi Center',
    description: 'Натяжные потолки в гостиную: дизайн, цены, фото готовых работ.',
  },
  '/potolki-v-spalnju': {
    title: 'Натяжные потолки в спальню — Proffi Center',
    description: 'Натяжные потолки для спальни: матовые, с подсветкой. Каталог и цены.',
  },
  '/potolki-na-kuhnju': {
    title: 'Натяжные потолки на кухню — Proffi Center',
    description: 'Натяжные потолки для кухни: влагостойкие, глянцевые. Цены и монтаж.',
  },
  '/potolki-v-detskuju': {
    title: 'Натяжные потолки в детскую — Proffi Center',
    description: 'Натяжные потолки в детскую комнату: безопасные материалы, дизайн.',
  },
  '/potolki-v-vannuju': {
    title: 'Натяжные потолки в ванную — Proffi Center',
    description: 'Влагостойкие натяжные потолки для ванной. Установка под ключ.',
  },
};

/**
 * Получить статическую мету по pathname (нормализованному: без utm, без trailing slash для корня).
 * Для вложенных путей (например /gotovye-potolki/list/2) возвращает мету базового пути.
 * @param {string} pathname
 * @returns {{ title?: string, description?: string } | null}
 */
export function getStaticMeta(pathname) {
  const normalized = pathname === '/' ? '' : pathname.replace(/\/$/, '') || '';
  if (STATIC_ROUTE_META[normalized]) return STATIC_ROUTE_META[normalized];
  if (STATIC_ROUTE_META[pathname]) return STATIC_ROUTE_META[pathname];
  if (normalized.startsWith('/gotovye-potolki')) return STATIC_ROUTE_META['/gotovye-potolki'] || null;
  return null;
}
