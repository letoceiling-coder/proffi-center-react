/**
 * Данные детальных страниц товаров (готовые потолки, матовые и т.д.).
 * В дальнейшем — получение по slug из API.
 */

const BASE_IMG = '/images';
import {
  formLowPriceData,
  zamerBlocks,
  form5minData,
  s25Data,
  s30Data,
  galleryData,
  reviewsData,
} from './mockPageData';

/** Материалы: картинки и ссылки «Натяжные потолки для: прихожей, гостиной...» */
const materialsImages = [
  `${BASE_IMG}/materials/m1.jpg`,
  `${BASE_IMG}/materials/m2.jpg`,
  `${BASE_IMG}/materials/m3.jpg`,
  `${BASE_IMG}/materials/m4.jpg`,
  `${BASE_IMG}/materials/m5.jpg`,
];

const materialsLinks = [
  { name: 'прихожей', href: '/potolki-v-prihozhuju', title: 'прихожей' },
  { name: 'гостиной', href: '/potolki-v-gostinuju', title: 'гостиной' },
  { name: 'спальни', href: '/potolki-v-spalnju', title: 'спальни' },
  { name: 'кухни', href: '/potolki-na-kuhnju', title: 'кухни' },
  { name: 'детской', href: '/potolki-v-detskuju', title: 'детской' },
  { name: 'с ванной', href: '/potolki-v-vannuju', title: 'ванной' },
];

/** Базовые поля детальной страницы товара (общие секции подставляются). */
function buildProductDetail(slug, title, subtitle, pricePerM2 = 99) {
  return {
    slug,
    title,
    subtitle,
    pricePerM2,
    calcMin: 1,
    calcMax: 100,
    calcLabel: '',
    calcTitle: 'Онлайн расчет стоимости натяжного потолка:',
    calcPhoneLabel: 'Данный расчет представлен для ознакомительных целей. Для получения подробной информации Вы можете связаться с нами по телефону:',
    formLowPrice: formLowPriceData,
    zamer: zamerBlocks,
    materials: {
      title: 'Материалы от мировых брендов',
      images: materialsImages,
      text: 'В своей работе компания «Proffi Center» использует только качественные материалы и комплектующие известных мировых брендов. Среди партнеров компании можно выделить: Pongs, Descor, Cerutti, Clipso, MSD и др.',
      linksIntro: 'Натяжные потолки для: ',
      links: materialsLinks,
    },
    form5min: form5minData,
    s25: s25Data,
    s30: s30Data,
    gallery: galleryData,
    reviews: reviewsData,
  };
}

/**
 * Данные детальных страниц товаров. Slug = путь без ведущего слэша (например из href карточки).
 */
export const productDetailBySlug = {
  'matovye-natyazhnye-potolki-msd-evolution-1207': buildProductDetail(
    'matovye-natyazhnye-potolki-msd-evolution-1207',
    'Матовые натяжные потолки MSD Evolution 1207',
    'У нас вы можете приобрести матовые натяжные потолки на заказ с установкой и без, большой ассортимент полотен, фактур и цветов. Мы работаем с мировыми брендами MSD. Материалы и комплектующие всегда в наличии.',
    99
  ),
  'natyazhnye-potolki-dlya-vannoy-msd-evolution-1208': buildProductDetail(
    'natyazhnye-potolki-dlya-vannoy-msd-evolution-1208',
    'Натяжные потолки для ванной MSD Evolution 1208',
    'Натяжные потолки для ванной комнаты: влагостойкие полотна, быстрый монтаж. Большой выбор цветов и фактур. Материалы и комплектующие в наличии.',
    130
  ),
  'natyazhnye-potolki-dlya-komnaty-msd-evolution-1209': buildProductDetail(
    'natyazhnye-potolki-dlya-komnaty-msd-evolution-1209',
    'Натяжные потолки для комнаты MSD Evolution 1209',
    'Натяжные потолки для жилых комнат: матовые, глянцевые, сатиновые. Установка под ключ. Работаем с брендами MSD и др.',
    125
  ),
  'natyazhnye-potolki-1-m2-msd-evolution-1210': buildProductDetail(
    'natyazhnye-potolki-1-m2-msd-evolution-1210',
    'Натяжные потолки 1 м² MSD Evolution 1210',
    'Готовые натяжные потолки от 1 м². Фиксированные размеры и цены. Заказ с установкой и без.',
    120
  ),
  'besshovnye-natyazhnye-potolki-msd-evolution-1211': buildProductDetail(
    'besshovnye-natyazhnye-potolki-msd-evolution-1211',
    'Бесшовные натяжные потолки MSD Evolution 1211',
    'Бесшовные тканевые натяжные потолки для больших помещений. Ширина полотна до 5 м. Качество и гарантия.',
    120
  ),
  'satinovye-natyazhnye-potolki-msd-evolution-1212': buildProductDetail(
    'satinovye-natyazhnye-potolki-msd-evolution-1212',
    'Сатиновые натяжные потолки MSD Evolution 1212',
    'Сатиновые натяжные потолки: матовая поверхность с мягким блеском. Идеально для спален и гостиных.',
    120
  ),
};

/**
 * Возвращает данные товара по slug. В дальнейшем — запрос к API.
 */
export function getProductBySlug(slug) {
  return productDetailBySlug[slug] || null;
}

/**
 * Список slug'ов существующих товаров (для 404 или ссылок).
 */
export function getProductSlugs() {
  return Object.keys(productDetailBySlug);
}
