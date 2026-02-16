/**
 * Данные страниц категорий потолков (Матовые, Глянцевые и т.д.).
 * Основной источник: ceilingCategoriesFetchedLocal.json (после npm run fetch-ceiling и download-ceiling-images).
 * Пока в JSON пустые sections — используются заглушки ниже.
 */

import fetchedLocal from './ceilingCategoriesFetchedLocal.json';

const BASE_IMG = '/images';

/** Список slug'ов категорий из меню (для маршрутизации). */
export const CEILING_CATEGORY_SLUGS = [
  'matovye-potolki',
  'glyancevye-potolki',
  'tkanevye-potolki',
  'mnogourovnevye-potolki',
  'potolki-fotopechat',
  'potolki-zvezdnoe-nebo',
  'konturnyye-potolki',
  'paryashchiye-potolki',
  'osveshcheniye-dlya-natyazhnykh-potolkov',
  'gardiny-dlya-shtor-pod-natyazhnoj-potolok',
  'natyazhnye-potolki-double-vision',
  'svetoprozrachnyye-natyazhnyye-potolki',
];

const categoryTitles = {
  'matovye-potolki': 'Матовые потолки',
  'glyancevye-potolki': 'Глянцевые потолки',
  'tkanevye-potolki': 'Тканевые потолки',
  'mnogourovnevye-potolki': 'Многоуровневые потолки',
  'potolki-fotopechat': 'Потолки с фотопечатью',
  'potolki-zvezdnoe-nebo': 'Потолки "Звездное небо"',
  'konturnyye-potolki': 'Контурные потолки',
  'paryashchiye-potolki': 'Парящие потолки',
  'osveshcheniye-dlya-natyazhnykh-potolkov': 'Освещение для натяжных потолков',
  'gardiny-dlya-shtor-pod-natyazhnoj-potolok': 'Виды гардин, карнизов для штор под натяжной потолок',
  'natyazhnye-potolki-double-vision': 'Double Vision',
  'svetoprozrachnyye-natyazhnyye-potolki': 'Светопрозрачные натяжные потолки',
};

const categoryImages = {
  'matovye-potolki': [`${BASE_IMG}/l1.jpg`],
  'glyancevye-potolki': [`${BASE_IMG}/l2.jpg`],
  'tkanevye-potolki': [`${BASE_IMG}/l3.jpg`],
  'mnogourovnevye-potolki': [`${BASE_IMG}/l4.jpg`],
  'potolki-fotopechat': [`${BASE_IMG}/l5.jpg`],
  'potolki-zvezdnoe-nebo': [`${BASE_IMG}/l6.jpg`],
  'konturnyye-potolki': [`${BASE_IMG}/cont.jpg`],
  'paryashchiye-potolki': [`${BASE_IMG}/par.jpg`],
  'osveshcheniye-dlya-natyazhnykh-potolkov': [`${BASE_IMG}/to(1).jpg`],
  'gardiny-dlya-shtor-pod-natyazhnoj-potolok': [`${BASE_IMG}/pk-5.jpg`],
  'natyazhnye-potolki-double-vision': [`${BASE_IMG}/dv.jpg`],
  'svetoprozrachnyye-natyazhnyye-potolki': [`${BASE_IMG}/sp8.jpg`],
};

const defaultIntro = 'Компания Proffi Center предлагает натяжные потолки с установкой. Собственное производство, доступные цены, гарантия качества.';

function buildStubCategory(slug) {
  const title = categoryTitles[slug] || slug;
  const imgList = categoryImages[slug] || [`${BASE_IMG}/l1.jpg`];
  const images = imgList.map((src, i) => ({ src, alt: title, caption: i === 0 ? title : undefined }));
  return {
    slug,
    title,
    metaDescription: defaultIntro.slice(0, 160),
    sections: [
      { type: 'p_vid', title, intro: defaultIntro, images, rell: false },
      { type: 'minicalc', label: 'Площадь (м²)', min: 1, max: 100, value: 10, pricePerM2: 99 },
      { type: 'gallery', items: [] },
    ],
  };
}

/** Карта категорий: приоритет у данных из ceilingCategoriesFetchedLocal.json (если есть sections). */
const categoriesMap = {};
CEILING_CATEGORY_SLUGS.forEach((slug) => {
  const fetched = fetchedLocal[slug];
  const hasFetchedSections = fetched?.sections?.length > 0;
  categoriesMap[slug] = hasFetchedSections
    ? { slug: fetched.slug, title: fetched.title, metaDescription: fetched.metaDescription || '', sections: fetched.sections }
    : buildStubCategory(slug);
});

export const ceilingCategoriesBySlug = categoriesMap;

export function getCeilingCategoryBySlug(slug) {
  return ceilingCategoriesBySlug[slug] || null;
}

export function setCeilingCategoryData(slug, data) {
  if (ceilingCategoriesBySlug[slug]) {
    Object.assign(ceilingCategoriesBySlug[slug], data);
  } else {
    ceilingCategoriesBySlug[slug] = { slug, ...data };
  }
}
