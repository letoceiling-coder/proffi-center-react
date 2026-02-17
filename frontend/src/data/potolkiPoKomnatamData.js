/**
 * Данные страниц «Натяжные потолки в прихожую / гостиную / спальню / на кухню / в детскую / в ванную».
 * Контент и фото по образцу proffi-center.ru.
 * Используется для карточек на главной (SectionPotolki2), ссылок и при необходимости fallback.
 * Основной контент страниц — из API (Page по slug).
 */

const BASE_IMG = '/images';

export const potolkiPoKomnatamSlugs = [
  'potolki-v-prihozhuju',
  'potolki-v-gostinuju',
  'potolki-v-spalnju',
  'potolki-na-kuhnju',
  'potolki-v-detskuju',
  'potolki-v-vannuju',
];

export const potolkiPoKomnatamData = [
  {
    slug: 'potolki-v-prihozhuju',
    title: 'Натяжные потолки в прихожую',
    description: 'Позволяют сделать ее визуально больше, а потолок – безукоризненно гладким. С помощью такой конструкции удается скрыть практически все недостатки, устранение которых другими способами является более затратным и проблематичным.',
    image: `${BASE_IMG}/potolki/potolok2_1.jpg`,
    href: '/potolki-v-prihozhuju',
    price: 225,
    align: 'left',
  },
  {
    slug: 'potolki-v-gostinuju',
    title: 'Натяжные потолки в гостиную',
    description: 'Позволяет скрыть все недостатки натурального, обеспечивая идеально ровную поверхность. Разнообразие текстур, цветовых решений и комбинаций позволяет реализовывать самые смелые дизайнерские задумки.',
    image: `${BASE_IMG}/potolki/potolok2_2.jpg`,
    href: '/potolki-v-gostinuju',
    price: 225,
    align: 'right',
  },
  {
    slug: 'potolki-v-spalnju',
    title: 'Натяжные потолки в спальню',
    description: 'В спальной комнате человеку необходимо чувствовать себя максимально спокойно, комфортно и уютно и настраивать его на такой лад должен дизайн помещения. Натяжной потолок в спальне позволяет добиться в интерьере идеальной гармонии и завершенности, делая отдых максимально приятным.',
    image: `${BASE_IMG}/potolki/potolok2_3.jpg`,
    href: '/potolki-v-spalnju',
    price: 225,
    align: 'left',
  },
  {
    slug: 'potolki-na-kuhnju',
    title: 'Натяжные потолки на кухню',
    description: 'Благодаря антистатическим свойствам на кухонных натяжных потолках скапливается минимальное количество грязи, копоти и жирных испарений. Их можно легко помыть любым средством для мытья окон на спиртосодержащей основе. ПВХ-пленка отлично справляется с нагрузкой до 100 л/м².',
    image: `${BASE_IMG}/potolki/potolok2_4.jpg`,
    href: '/potolki-na-kuhnju',
    price: 225,
    align: 'right',
  },
  {
    slug: 'potolki-v-detskuju',
    title: 'Натяжные потолки в детскую',
    description: 'В детской комнате может быть создана атмосфера безудержного веселья, или спокойной тишины, доброй сказки или фантастических приключений. Эффект «Звездного неба», а также многоуровневые конструкции позволяют добиться необходимого эффекта.',
    image: `${BASE_IMG}/potolki/potolok2_5.jpg`,
    href: '/potolki-v-detskuju',
    price: 225,
    align: 'left',
  },
  {
    slug: 'potolki-v-vannuju',
    title: 'Натяжные потолки в ванную',
    description: 'В ванной комнате в силу повышенной влажности высок риск появления на потолке плесени или грибка. Полимерный материал позволяет легко предупредить возникновение данных проблем. Требуя минимального ухода, помогает создать в помещении максимально комфортную обстановку.',
    image: `${BASE_IMG}/potolki/potolok2_6.jpg`,
    href: '/potolki-v-vannuju',
    price: 225,
    align: 'right',
  },
];

/**
 * Получить данные по slug.
 */
export function getPotolkiPoKomnatamBySlug(slug) {
  return potolkiPoKomnatamData.find((p) => p.slug === slug) ?? null;
}
