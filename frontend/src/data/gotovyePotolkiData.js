/**
 * Данные для страницы «Готовые потолки». В дальнейшем — из API (Laravel).
 * Пагинация в формате Laravel: current_page, last_page, path, links: [{ url, label, active }]
 */

const BASE_IMG = '/images';

/** Картинка таба: image — неактивный, imageActive — активный (_current). */
export const gotovyeCategories = [
  { slug: '', label: 'Все', image: BASE_IMG + '/cat_menu/all.png', imageActive: BASE_IMG + '/cat_menu/all_current.png' },
  { slug: 'matovyye', label: 'Матовые', image: BASE_IMG + '/cat_menu/mat.png', imageActive: BASE_IMG + '/cat_menu/mat_current.png' },
  { slug: 'glyantsevyye', label: 'Глянцевые', image: BASE_IMG + '/cat_menu/gl.png', imageActive: BASE_IMG + '/cat_menu/gl_current.png' },
  { slug: 'tkanevyye', label: 'Тканевые', image: BASE_IMG + '/cat_menu/tk.png', imageActive: BASE_IMG + '/cat_menu/tk_current.png' },
  { slug: 'mnogourovnevyye', label: 'Многоуровневые', image: BASE_IMG + '/cat_menu/ur.png', imageActive: BASE_IMG + '/cat_menu/ur_current.png' },
  { slug: 'fotopechat', label: 'Фотопечать', image: BASE_IMG + '/cat_menu/foto.png', imageActive: BASE_IMG + '/cat_menu/foto_current.png' },
  { slug: 'zvezdnoye-nebo', label: 'Звездное небо', image: BASE_IMG + '/cat_menu/stars.png', imageActive: BASE_IMG + '/cat_menu/stars_current.png' },
];

const PRODUCT_PATH = '/product';

const gotovyeProductsBase = [
  { name: 'Матовые натяжные потолки', categorySlug: 'matovyye', size: '100x100 см', oldPrice: 236, price: 205, image: 'img1.png', hrefSlug: 'matovye-natyazhnye-potolki-msd-evolution-1207' },
  { name: 'Натяжные потолки для ванной', categorySlug: 'matovyye', size: '100x100 см', oldPrice: 310, price: 130, image: 'img56.png', hrefSlug: 'natyazhnye-potolki-dlya-vannoy-msd-evolution-1208' },
  { name: 'Натяжные потолки для комнаты', categorySlug: 'matovyye', size: '100x100 см', oldPrice: 286, price: 125, image: 'img62.png', hrefSlug: 'natyazhnye-potolki-dlya-komnaty-msd-evolution-1209' },
  { name: 'Натяжные потолки 1 м2', categorySlug: 'matovyye', size: '100x100 см', oldPrice: 286, price: 120, image: 'img68.png', hrefSlug: 'natyazhnye-potolki-1-m2-msd-evolution-1210' },
  { name: 'Бесшовные натяжные потолки', categorySlug: 'tkanevyye', size: '100x100 см', oldPrice: 286, price: 120, image: 'img78.png', hrefSlug: 'besshovnye-natyazhnye-potolki-msd-evolution-1211' },
  { name: 'Сатиновые натяжные потолки', categorySlug: 'matovyye', size: '100x100 см', oldPrice: 286, price: 120, image: 'img5.png', hrefSlug: 'satinovye-natyazhnye-potolki-msd-evolution-1212' },
];

/** Развернутый массив карточек для теста пагинации (25 шт. = 5 страниц по 6). */
function buildGotovyeProductsMock() {
  const list = [];
  const count = 25;
  for (let i = 0; i < count; i++) {
    const base = gotovyeProductsBase[i % gotovyeProductsBase.length];
    list.push({
      id: i + 1,
      name: i < gotovyeProductsBase.length ? base.name : `${base.name} (${i + 1})`,
      categorySlug: base.categorySlug,
      size: base.size,
      oldPrice: base.oldPrice,
      price: base.price,
      image: BASE_IMG + '/market/' + base.image,
      href: PRODUCT_PATH + '/' + base.hrefSlug,
    });
  }
  return list;
}

export const gotovyeProductsMock = buildGotovyeProductsMock();

export function buildPagination(opts) {
  const current_page = opts.current_page || 1;
  const last_page = opts.last_page || 1;
  const path = (opts.path || '/gotovye-potolki').replace(/\/$/, '');
  if (last_page <= 1) return { current_page: 1, last_page: 1, path, links: [] };
  const links = [];
  for (let i = 1; i <= last_page; i++) {
    links.push({
      url: i === 1 ? path : path + '/list/' + i,
      label: String(i),
      active: i === current_page,
    });
  }
  links.push({
    url: current_page >= last_page ? null : (current_page === 1 ? path + '/list/2' : path + '/list/' + (current_page + 1)),
    label: 'next',
    active: false,
  });
  return { current_page, last_page, path, links };
}
