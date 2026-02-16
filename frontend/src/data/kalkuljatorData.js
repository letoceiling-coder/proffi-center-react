/**
 * Данные страницы «Калькулятор натяжных потолков» (/natjazhnye-potolki-kalkuljator).
 * В дальнейшем — из API.
 */

const BASE_IMG = '/images';

/** Типы потолков: id (ключ), label, цена за м², картинка помещения */
export const ceilingTypes = [
  { id: 'mat', label: 'Матовые', pricePerM2: 99, roomImage: BASE_IMG + '/p_calc/room_mat.jpg' },
  { id: 'gl', label: 'Глянцевые', pricePerM2: 130, roomImage: BASE_IMG + '/p_calc/room_gl.jpg' },
  { id: 'tkan', label: 'Тканевые', pricePerM2: 590, roomImage: BASE_IMG + '/p_calc/room_tk.jpg' },
  { id: 'ur', label: 'Многоуровневые', pricePerM2: 590, roomImage: BASE_IMG + '/p_calc/room_ur.jpg' },
  { id: 'ft', label: 'Фотопечать', pricePerM2: 700, roomImage: BASE_IMG + '/p_calc/room_ft.jpg' },
  { id: 'st', label: 'Звездное небо', pricePerM2: 750, roomImage: BASE_IMG + '/p_calc/room_st.jpg' },
];

/** Производители: id, label, множитель цены, флаг */
export const manufacturers = [
  { id: 'made1', label: 'Россия', multiplier: 1, flag: BASE_IMG + '/p_calc/1.png' },
  { id: 'made2', label: 'Китай', multiplier: 1.1, flag: BASE_IMG + '/p_calc/2.png' },
  { id: 'made3', label: 'Германия', multiplier: 1, flag: BASE_IMG + '/p_calc/3.png' },
  { id: 'made4', label: 'Франция', multiplier: 1.6, flag: BASE_IMG + '/p_calc/4.png' },
  { id: 'made5', label: 'Бельгия', multiplier: 1.5, flag: BASE_IMG + '/p_calc/5.png' },
];

/** Строки таблицы цен */
export const priceTableRows = [
  { type: 'Матовый', term: 'от 1 дня', priceFrom: 99, warranty: BASE_IMG + '/7let.png', producer: BASE_IMG + '/mat_pro.png' },
  { type: 'Глянцевый', term: 'от 1 дня', priceFrom: 130, warranty: BASE_IMG + '/7let.png', producer: BASE_IMG + '/gl_pro.png' },
  { type: 'Сатиновый', term: 'от 1 дня', priceFrom: 130, warranty: BASE_IMG + '/7let.png', producer: BASE_IMG + '/satin_pro.png' },
  { type: 'Тканевый', term: 'от 1 дня', priceFrom: 590, warranty: BASE_IMG + '/12let.png', producer: BASE_IMG + '/tkan_pro.png' },
  { type: 'С фотопечатью', term: 'от 1 дня', priceFrom: 700, warranty: BASE_IMG + '/20let.png', producer: BASE_IMG + '/foto_pro.png' },
  { type: 'Звездное небо', term: 'от 3 дней', priceFrom: 750, warranty: BASE_IMG + '/20let.png', producer: BASE_IMG + '/zn_pro.png' },
];

/** Блок «Расчет стоимости онлайн» (s_rsto) */
export const calcIntroData = {
  title: 'Расчет стоимости онлайн',
  description: 'Калькулятор натяжных потолков позволит рассчитать стоимость материалов по своим размерам. Цены являются приблизительными. Для получения более точного расчета потолка, пожалуйста, обратитесь к менеджеру по телефону.',
  promoLine1: 'Немецкое полотно по цене российского',
  promoDateLabel: 'До', // дата подставляется скриптом или оставить пусто
  promoPrice: '99',
  promoPriceUnit: 'руб.',
  promoButtonText: 'Смотреть все акции',
  promoButtonHref: '/skidki-na-potolki',
};

/** Площадь: мин, макс, по умолчанию */
export const areaRange = { min: 1, max: 100, default: 4 };

/** Множитель «Цена у всех» (для отображения зачёркнутой цены) */
export const otherPriceMultiplier = 1.5;
