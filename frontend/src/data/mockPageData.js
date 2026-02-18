/**
 * Mock data for main page. All data will be replaced by API.
 *
 * Региональные данные: один раз меняем siteConfig — телефоны, город, район,
 * адреса и отображаемые цены подставляются во все компоненты главной страницы.
 *
 * Из siteConfig автоматически берут:
 * - Header: phone, address (locality, street, postalCode)
 * - Footer: phone, email, siteUrl, legalLink
 * - Баннер: bannerPrice, priceUnit
 * - Текст «Натяжные потолки в …»: cityPrepositional, region
 * - Таблица сравнения цен: ourPriceFrom, otherPriceFrom
 * - Блок «Хотите сравнить?»: phone
 * - Формы и попапы: legalLink
 */

const BASE_IMG = '/images';

/** Региональный конфиг сайта. Меняется под город/регион (или подставляется с API). */
export const siteConfig = {
  phone: '8 (999) 637-11-82',
  email: 'info@proffi-center.ru',
  siteUrl: 'https://proffi-center.ru',
  city: 'Анапа',
  /** Город в предложном падеже (в Анапе) */
  cityPrepositional: 'Анапе',
  /** Район/регион в предложном падеже (в Анапском районе) */
  region: 'Анапском районе',
  citySuffix: '+20 км от Анапы',
  logo: `${BASE_IMG}/logo.png`,
  logoAlt: 'Логотип компании Proffi Center',
  promo: {
    title: 'Подарки',
    comment: 'до конца недели',
    href: '/aktsiya',
  },
  address: {
    locality: 'Анапа',
    street: 'Омелькова, 20 к1',
    postalCode: '353440',
  },
  /** Режим работы (страница «Где заказать», маркер на карте). По региону может отличаться. */
  workTime: 'Работаем без выходных\n8:00-23:00',
  /** Название для баллуна маркера на карте. По региону может отличаться. */
  companyName: 'Proffi Center',
  legalLink: '/images/prav-info.pdf',
  priceUnit: 'руб.',
  /** Отображаемые цены «от X руб.» (регион может отличаться) */
  ourPriceFrom: 'от 99 руб.',
  otherPriceFrom: 'от 200 руб.',
  bannerPrice: 205,
};

/** Города с поддоменами (только Анапа, Ставрополь, Москва). Можно заменить на данные из API /api/v1/city-sites */
export const cities = [
  { name: 'Анапа', slug: 'anapa', href: 'https://anapa.proffi-center.ru' },
  { name: 'Ставрополь', slug: 'stavropol', href: 'https://stavropol.proffi-center.ru' },
  { name: 'Москва', slug: 'moscow', href: 'https://moscow.proffi-center.ru' },
];

export const menuItems = [
  {
    title: 'Матовые потолки',
    href: '/matovye-potolki',
    children: [
      { title: 'Матовые потолки', href: '/matovye-potolki' },
      { title: 'Глянцевые потолки', href: '/glyancevye-potolki' },
      { title: 'Тканевые потолки', href: '/tkanevye-potolki' },
      { title: 'Многоуровневые потолки', href: '/mnogourovnevye-potolki' },
      { title: 'Потолки с фотопечатью', href: '/potolki-fotopechat' },
      { title: 'Потолки "Звездное небо"', href: '/potolki-zvezdnoe-nebo' },
      { title: 'Контурные потолки', href: '/konturnyye-potolki' },
      { title: 'Парящие потолки', href: '/paryashchiye-potolki' },
      { title: 'Освещение', href: '/osveshcheniye-dlya-natyazhnykh-potolkov' },
      { title: 'Виды гардин, карнизов', href: '/gardiny-dlya-shtor-pod-natyazhnoj-potolok' },
      { title: 'Double Vision', href: '/natyazhnye-potolki-double-vision' },
      { title: 'Светопрозрачные потолки', href: '/svetoprozrachnyye-natyazhnyye-potolki' },
    ],
  },
  {
    title: 'Готовые потолки',
    href: '/gotovye-potolki',
    children: [
      { title: 'Готовые потолки', href: '/gotovye-potolki' },
      { title: 'Цены на потолки', href: '/natjazhnye-potolki-kalkuljator' },
      { title: 'Подарки', href: '/aktsiya' },
    ],
  },
  {
    title: 'О компании',
    href: '/o-kompanii',
    children: [
      { title: 'О компании', href: '/o-kompanii' },
      { title: 'Отзывы о потолках', href: '/natyazhnyye-potolki-otzyvy' },
      { title: 'Где заказать?', href: '/gde-zakazat-potolki' },
      { title: 'Договор', href: '/dogovor' },
    ],
  },
  { title: 'Контакты', href: '/gde-zakazat-potolki', children: null },
];

export const bannerData = {
  bgImage: `${BASE_IMG}/index_banner.jpg`,
  title: 'Натяжной потолок',
  titleSuffix: 'за',
  price: siteConfig.bannerPrice,
  priceUnit: siteConfig.priceUnit,
  saleLabel: 'Распродажа до 21 декабря',
  ctaText: 'бесплатный\nвыезд замерщика',
  ctaSubtext: 'выезд замерщика',
};

/** Тексты главного блока с подстановкой города/района из siteConfig */
export const simpleTextIntro = (() => {
  const { cityPrepositional, region } = siteConfig;
  return {
    h1: `Натяжные потолки в ${cityPrepositional}`,
    content: `«Proffi Center» – это компания, которая устанавливает натяжные потолки в ${cityPrepositional} с 2013 года! Собственное производство позволяет обеспечить выгодные условия покупки по самым низким ценам. Использование только лучших материалов, комплектующих и профессиональный монтаж потолков гарантируют высокое качество предоставляемых услуг и срок службы более 20 лет!

Основанная в 2013 году компания Proffi Center осуществляет деятельность в сфере ремонтно-отделочных работ вот уже более 13 лет. Ключевым направлением организации является установка натяжных потолков в ${cityPrepositional} и ${region}, услуги по дополнительным работам, розничная и оптовая продажа сопутствующих материалов. Постоянно развиваясь, улучшая обслуживание и качество на всех этапах работ, мы готовы Вам предложить лучшие варианты стилистической концепции, оптимальные отделочные материалы для Вашего помещения, монтаж натяжных потолков с гарантией качества и самой доступной ценой в ${cityPrepositional} и ${region}. Используемый нами материал соответствует всем санитарным требованиям, правилам пожарной безопасности, безопасен для здоровья человека и имеет все необходимые сертификаты. Собственное производство позволяет минимизировать издержки, тем самым гарантировать самые привлекательные цены. Натяжные потолки напрямую от производителя всегда дешевле!`,
  };
})();

export const linkBlocks = [
  { id: 1, title: 'Матовые потолки', href: '/matovye-potolki', image: `${BASE_IMG}/l1.jpg`, price: 205, rating: 4.5, reviewCount: 12 },
  { id: 2, title: 'Глянцевые потолки', href: '/glyancevye-potolki', image: `${BASE_IMG}/l2.jpg`, price: 225, rating: 4.6, reviewCount: 41 },
  { id: 3, title: 'Тканевые потолки', href: '/tkanevye-potolki', image: `${BASE_IMG}/l3.jpg`, price: 950, rating: 4.9, reviewCount: 7 },
  { id: 4, title: 'Многоуровневые потолки', href: '/mnogourovnevye-potolki', image: `${BASE_IMG}/l4.jpg`, price: 1990, rating: 4.2, reviewCount: 21 },
  { id: 5, title: 'Потолки с фотопечатью', href: '/potolki-fotopechat', image: `${BASE_IMG}/l5.jpg`, price: 980, rating: 4.8, reviewCount: 7 },
  { id: 6, title: 'Потолки Звездное небо', href: '/potolki-zvezdnoe-nebo', image: `${BASE_IMG}/l6.jpg`, price: 3750, rating: 5, reviewCount: 2 },
  { id: 7, title: 'Контурные потолки', href: '/konturnyye-potolki', image: `${BASE_IMG}/cont.jpg`, price: 1300, rating: 4.8, reviewCount: 7 },
  { id: 8, title: 'Парящие потолки', href: '/paryashchiye-potolki', image: `${BASE_IMG}/par.jpg`, price: 1350, rating: 4.9, reviewCount: 12 },
  { id: 9, title: 'Освещение', href: '/osveshcheniye-dlya-natyazhnykh-potolkov', image: `${BASE_IMG}/to(1).jpg`, price: 240, rating: 4.8, reviewCount: 7 },
  { id: 10, title: 'Виды гардин, карнизов', href: '/gardiny-dlya-shtor-pod-natyazhnoj-potolok', image: `${BASE_IMG}/pk-5.jpg`, price: 1950, rating: 4.9, reviewCount: 7 },
  { id: 11, title: 'Double Vision', href: '/natyazhnye-potolki-double-vision', image: `${BASE_IMG}/dv.jpg`, price: 3250, rating: 4.9, reviewCount: 11 },
  { id: 12, title: 'Светопрозрачные потолки', href: '/svetoprozrachnyye-natyazhnyye-potolki', image: `${BASE_IMG}/sp8.jpg`, price: 1625, rating: 4.9, reviewCount: 9 },
  { id: 13, title: 'Потолки в прихожую', href: '/potolki-v-prihozhuju', image: `${BASE_IMG}/potolok2_1.jpg`, price: 225, rating: 4.9, reviewCount: 9 },
  { id: 14, title: 'Потолки в гостиную', href: '/potolki-v-gostinuju', image: `${BASE_IMG}/potolok2_2.jpg`, price: 225, rating: 4.9, reviewCount: 9 },
  { id: 15, title: 'Потолки в спальню', href: '/potolki-v-spalnju', image: `${BASE_IMG}/potolok2_3.jpg`, price: 225, rating: 4.9, reviewCount: 9 },
  { id: 16, title: 'Потолки на кухню', href: '/potolki-na-kuhnju', image: `${BASE_IMG}/potolok2_4.jpg`, price: 225, rating: 4.9, reviewCount: 9 },
  { id: 17, title: 'Потолки в детскую', href: '/potolki-v-detskuju', image: `${BASE_IMG}/potolok2_5.jpg`, price: 225, rating: 4.9, reviewCount: 9 },
  { id: 18, title: 'Потолки в ванную', href: '/potolki-v-vannuju', image: `${BASE_IMG}/potolok2_6.jpg`, price: 225, rating: 4.9, reviewCount: 9 },
];

export const simpleTextBlocks = [
  {
    h3: 'Когда и как лучше заказывать монтаж натяжного потолка',
    paragraphs: [
      'Когда речь заходит об установке натяжного потолка, однозначно, всех заказчиков должен волновать вопрос, в какой последовательности отделочных работ во время ремонта лучше устанавливать натяжные потолки. Монтаж натяжного потолка, зависит от многих факторов и строительных нюансов. Монтаж потолка производят путем закрепления его на алюминиевом или ПВХ стеновом профиль для натяжных потолков, смонтированной на плоскости потолка. Работа проводится достаточно быстро, не требует особенно тщательной подготовки потолочной поверхности.',
      'Перед тем, как устанавливать стеновой профиль, нужно определиться и закончить все работы, связанные с электричеством, вентиляцией или возможно нужно установить закладную планку для установки шкафа купе, чтобы потом не пришлось её переустанавливать. Конечно, процесс монтажа достаточно простой, однако, нельзя полностью согласиться с мнением, что её нужно монтировать на завершающем этапе проведения отделочных работ.',
      'До момента монтажа, стен должны быть подготовлены, а также проведены все черновые работы в помещении. Выравнивание стен, шпатлевка, зачистка предполагает грязную и пыльную работу, вся пыль может осесть на полотне и испортить вид нового натяжного потолка.',
    ],
  },
  {
    h3: 'Наши услуги по установке натяжных потолков',
    paragraphs: [
      'Обратившись в компанию «Proffi Center», вы мгновенно делаете шаг к устранению любой проблемой с Вашими потолками и установка всех осветительных приборов, гардин и т.д. Мы специализируемся на квалифицированный монтаж натяжных потолков любой сложности, матовые, глянцевые, тканевые, фотопечать, многоуровневые, звездное небо. Услуги предоставляемые нашей организацией «Proffi Center» это высокое качество и гарантия безопасности Ваших потолков.',
      'Перед тем, как устанавливать стеновой профиль, нужно определиться и закончить все работы, связанные с электричеством, вентиляцией или возможно нужно установить закладную планку для установки шкафа купе, чтобы потом не пришлось её переустанавливать.',
      'До момента монтажа, стен должны быть подготовлены, а также проведены все черновые работы в помещении. Выравнивание стен, шпатлевка, зачистка предполагает грязную и пыльную работу, вся пыль может осесть на полотне и испортить вид нового натяжного потолка.',
    ],
  },
];

export const formLowPriceData = {
  title: 'Заказать по самой низкой цене',
  countdownLabel: 'До конца распродажи осталось:',
  countdownEnd: '2026-12-31T23:59:59',
  legalLink: siteConfig.legalLink,
};

export const simpleTextQuality = {
  h3: 'Фирменное качество и профессиональный монтаж',
  paragraphs: [
    'Компания Proffi Center предлагает колоссальный выбор и лучшие цены на натяжные потолки любых фактур. Принципы нашей работы станут залогом успешных результатов:',
  ],
  list: [
    'использование фирменного сырья;',
    'работа на лучшем оборудовании;',
    'инновационные технологии производства;',
    'профессиональные приемы установки.',
  ],
  h2: 'Фирменные натяжные потолки от всемирно известных производителей',
  paragraphs2: [
    'Наша компания Proffi Center – динамично развивающийся производственный комплекс, оборудованный первоклассной техникой. Мы воплотим самые сложные идеи быстро и максимально точно, чтобы каждый клиент смог наслаждаться новой поверхностью долгие годы. Мы готовы предложить:',
  ],
  list2: [
    'высококачественные полотна и изготовление бесшовных конструкций;',
    'широкий спектр услуг по фотопечати, которая сделает потолки натяжные матовые эксклюзивной частью интерьера;',
    'разработку индивидуальных дизайнерских проектов;',
    'лучшие расценки на натяжные потолки по акциям позволят существенно сэкономить на ремонте и при этом установить конструкции отличного качества.',
  ],
};

export const zamerBlocks = [
  {
    image: `${BASE_IMG}/meter2.jpg`,
    title: 'Бесплатный замер',
    text: 'Инженер компании произведет точный замер и расчет стоимости заказа с учетом Ваших пожеланий. Возможно заключение договора на дому.',
  },
  {
    image: `${BASE_IMG}/opr.jpg`,
    title: 'Рассрочка 0%',
    text: 'Разместите заказ уже сейчас! Воспользуйтесь беспроцентной рассрочкой сроком от 6 месяцев до 3 лет без первоначального взноса и переплаты.',
  },
];

export const prTableData = (() => {
  const our = siteConfig.ourPriceFrom;
  const other = siteConfig.otherPriceFrom;
  return {
    title: 'Натяжные потолки для вашего дома',
    subtitle: 'Огромный ассортимент дает возможность подобрать оптимальное решение для всех помещения Вашей квартиры или загородного дома. В каталоге представлены сотни видов натяжных потолков, которые помогут создать неповторимый стиль, реализовать любые дизайнерские задумки.',
    ourPriceLabel: 'Цена у нас',
    ourPriceFrom: our,
    otherPriceLabel: 'Цена у других',
    otherPriceFrom: other,
    rows: [
      { characteristic: 'Характеристики потолков', us: `Цена у нас\n${our}`, other: `Цена у других\n${other}`, isHeader: true },
      { characteristic: 'Экологичность', us: 'класс А+', other: 'класс В', filledStarsUs: 5, filledStarsOther: 0 },
      { characteristic: 'Качество полотна', us: null, other: null, filledStarsUs: 5, filledStarsOther: 3 },
      { characteristic: 'Удобство в уходе', us: null, other: null, filledStarsUs: 5, filledStarsOther: 5 },
      { characteristic: 'Водонепронициаемость', us: null, other: null, filledStarsUs: 5, filledStarsOther: 5 },
      { characteristic: 'Стойкость цвета', us: null, other: null, filledStarsUs: 5, filledStarsOther: 3 },
      { characteristic: 'Простота монтажа', us: null, other: null, filledStarsUs: 5, filledStarsOther: 4 },
      { characteristic: 'Прочность на разрыв', us: '280%', other: '175%', filledStarsUs: 0, filledStarsOther: 0 },
    ],
    starFull: `${BASE_IMG}/f_star.png`,
    starEmpty: `${BASE_IMG}/t_star.png`,
  };
})();

export const potolki2Data = [
  { title: 'Потолки в прихожую', description: 'Позволяют сделать ее визуально больше, а потолок – безукоризненно гладким. С помощью такой конструкции удается скрыть практически все недостатки, устранение которых другими способами является более затратным и проблематичным.', image: `${BASE_IMG}/potolki/potolok2_1.jpg`, href: '/potolki-v-prihozhuju', align: 'left' },
  { title: 'Потолки в гостиную', description: 'Позволяет скрыть все недостатки натурального, обеспечивая идеально ровную поверхность. Разнообразие текстур, цветовых решений и комбинаций позволяет реализовывать самые смелые дизайнерские задумки.', image: `${BASE_IMG}/potolki/potolok2_2.jpg`, href: '/potolki-v-gostinuju', align: 'right' },
  { title: 'Потолки в спальню', description: 'В спальной комнате человеку необходимо чувствовать себя максимально спокойно, комфортно и уютно и настраивать его на такой лад должен дизайн помещения. Натяжной потолок в спальне позволяет добиться в интерьере идеальной гармонии и завершенности, делая отдых максимально приятным.', image: `${BASE_IMG}/potolki/potolok2_3.jpg`, href: '/potolki-v-spalnju', align: 'left' },
  { title: 'Потолки на кухню', description: 'Благодаря антистатическим свойствам на кухонных натяжных потолках скапливается минимальное количество грязи, копоти и жирных испарений. Их можно легко помыть любым средством для мытья окон на спиртосодержащей основе. ПВХ-пленка отлично справляется с нагрузкой до 100 л/м².', image: `${BASE_IMG}/potolki/potolok2_4.jpg`, href: '/potolki-na-kuhnju', align: 'right' },
  { title: 'Потолки в детскую', description: 'В детской комнате может быть создана атмосфера безудержного веселья, или спокойной тишины, доброй сказки или фантастических приключений. Эффект «Звездного неба», а также многоуровневые конструкции позволяют добиться необходимого эффекта.', image: `${BASE_IMG}/potolki/potolok2_5.jpg`, href: '/potolki-v-detskuju', align: 'left' },
  { title: 'Потолки в ванную', description: 'В ванной комнате в силу повышенной влажности высок риск появления на потолке плесени или грибка. Полимерный материал позволяет легко предупредить возникновение данных проблем. Требуя минимального ухода, помогает создать в помещении максимально комфортную обстановку.', image: `${BASE_IMG}/potolki/potolok2_6.jpg`, href: '/potolki-v-vannuju', align: 'right' },
];

export const form5minData = {
  title: 'Рассчитаем ваш заказ за 5 минут!',
  legalLink: siteConfig.legalLink,
};

export const s25Data = {
  title: 'Держим цены 2018 года',
  columns: [
    { value: 140, class: 'col1' },
    { value: 99, class: 'col2', highlight: true },
    { value: 160, class: 'col3' },
    { value: 195, class: 'col4' },
    { value: 230, class: 'col5' },
    { value: 245, class: 'col6' },
  ],
  subtitle: 'Цены растут, а в компании «Proffi Center» стоимость остается неизменной!',
  phoneLabel: 'Хотите сравнить?',
  phone: siteConfig.phone,
};

export const s30Data = {
  title: 'Потолки без предоплаты',
  list: [
    'Первый взнос мы платим за Вас',
    'Переплата по кредиту 0%',
    '100% одобрение кредита банком',
  ],
  btnText: 'Узнать подробности',
  btnHref: '/dolyami',
};

export const galleryData = [
  { image: `${BASE_IMG}/1.jpg`, title: 'Глянцевый потолок на кухне', price: 1560 },
  { image: `${BASE_IMG}/2.jpg`, title: 'Матовый потолок на балконе', price: 660 },
  { image: `${BASE_IMG}/3.jpg`, title: 'Натяжной потолок в прихожей', price: 1080 },
  { image: `${BASE_IMG}/4.jpg`, title: 'Многоуровневый натяжной потолок', price: 17700 },
  { image: `${BASE_IMG}/5.jpg`, title: 'Глянцевый потолок в гостиной', price: 2080 },
  { image: `${BASE_IMG}/6.jpg`, title: 'Натяжной потолок в спальной комнате', price: 2340 },
  { image: `${BASE_IMG}/7.jpg`, title: 'Многоуровневый потолок', price: 9440 },
  { image: `${BASE_IMG}/8.jpg`, title: 'Натяжной потолок на кухне', price: 1200 },
  { image: `${BASE_IMG}/9.jpg`, title: 'Глянцевый натяжной потолок', price: 2860 },
  { image: `${BASE_IMG}/10.jpg`, title: 'Многоуровневый потолок в студии', price: 10620 },
  { image: `${BASE_IMG}/11.jpg`, title: 'Многоуровневый потолок', price: 9440 },
  { image: `${BASE_IMG}/12.jpg`, title: 'Матовый натяжной потолок', price: 840 },
  { image: `${BASE_IMG}/13.jpg`, title: 'Натяжной потолок в гостиной', price: 2160 },
];

export const reviewsData = [
  { name: 'Григорий', profession: 'Заказал потолок в Proffi Center', text: 'Хочу выразить огромную благодарность ребятам монтажникам. Большое спасибо за выполненую работу за все общение с вами. Все СУПЕР.', avatar: `${BASE_IMG}/otz/otz.png` },
  { name: 'Иван', profession: 'Заказал потолок в Proffi Center', text: 'Подарил Жене на День Рождения ремонт нашей спальни, пока она в отпуске была. Сразу чувствуется экспертность сотрудников', avatar: `${BASE_IMG}/otz/otz.png` },
  { name: 'Ульяна', profession: 'Заказал потолок в Proffi Center', text: 'Хочу выразить благодарность вашей компании и пожелать вам успехов и дальнейшего развития! Натяжные потолки в 2х комнатах меня очень радуют, сотрудники компании не только установили их очень быстро и аккуратно, но еще и рассказали о правильном уходе! Побольше бы таких ответственных работников!', avatar: `${BASE_IMG}/otz/otz.png` },
  { name: 'Лилия', profession: 'Заказал потолок в Proffi Center', text: 'Увидела у знакомых в доме натяжные потолки. Мне очень понравилось, как они выглядят, и я захотела сделать нечто подобное. Обратилась в фирму Профи центр. Мне показали разные варианты. Даже представить не могла, что можно сделать настолько оригинальные и красивые потолки. К тому же менеджер пообещал, что всё будет выполнено очень быстро, аккуратно, и потолки будут ровненькие, без каких-либо дефектов. Да и цена вполне подходящая. Из всего многообразия для спальни выбрала потолок в виде звёздного неба, а в детскую - потолок с фотопечатью, на которой изображены солнце, облака и голубое небо. Мастера приехали в точно назначенный час и за день выполнили заказ. Получилось очень здорово! Квартира реально преобразилась! Решила попозже заказать потолки в кухню и гостиную.', avatar: `${BASE_IMG}/otz/otz.png` },
  { name: 'Светлана', profession: 'Заказал потолок в Proffi Center', text: 'Совершенно не разбираясь в том, какие натяжные потолки есть, какие лучше, столкнулась с мучительным выбором нужного потолка. Благодарю за помощь сотрудников компании: помогли подобрать отличный глянцевый потолок в гостиную, а в детскую заказала потолок с фотопечатью, такого потолка точно ни у кого больше нет! Отдельное спасибо монтажникам Игорю и Олегу', avatar: `${BASE_IMG}/otz/otz.png` },
  { name: 'Олег', profession: 'Заказал потолок в Proffi Center', text: 'Остались очень довольны работой: заказывали потолок в гостиную, специалист помог подобрать и полотно, и светильники, все было установлено качественно а смотрится просто великолепно. Очень доволен выбором. Рекомендую', avatar: `${BASE_IMG}/otz/otz.png` },
  { name: 'Яна', profession: 'Заказал потолок в Proffi Center', text: 'Боялись устанавливать натяжные потолки, т.к. в квартире потолки очень низкие, а это ведь урезать еще больше. Но и красить каждый раз потолок надоело. В итоге решили проконсультироваться, нашли в интернете несколько компаний, после общения с менеджером компании Профи поняли, что низкий потолок не такая уж проблема, ведь можно зрительно увеличить высоту потолков за счет правильно подобранного полотна. В итоге, установили везде глянец, помещение и правда смотрится больше и теперь никакой возни с потолками, их можно просто протирать время от времени и все. Большое спасибо менеджеру за консультацию при выборе потолков.', avatar: `${BASE_IMG}/otz/otz.png` },
  { name: 'Александр', profession: 'Заказал потолок в Proffi Center', text: 'Отличный сайт: указаны и цены, и калькулятор есть. прежде чем оставлять заявку на заказ смог подсчитать примерную стоимость потолка со всей фурнитурой и установкой и она практически не отличалась от итоговой.', avatar: `${BASE_IMG}/otz/otz.png` },
  { name: 'Ольга', profession: 'Заказал потолок в Proffi Center', text: 'Заказывала потолок первый раз, установили все за один день без каких-либо переделок, цена вполне устроила.', avatar: `${BASE_IMG}/otz/otz.png` },
  { name: 'Алина', profession: 'Заказал потолок в Proffi Center', text: 'Сомневалась, можно ли устанавливать потолки в маленькие помещения (ванна, туалет). Проконсультировалась со специалистом компании - так все подробно и хорошо объяснил, что тут же сделала заявку на замер) через неделю уже любовалась новыми потолками)', avatar: `${BASE_IMG}/otz/otz.png` },
  { name: 'Сергей', profession: 'Заказал потолок в Proffi Center', text: 'Перелистал множество сайтов, на каждом полно отзывов, красивые картинки и обещания, цены примерно одинаковые. В итоге выбрал фирмы с бесплатным выездом замерщика и стал ждать: из трех фирм приехали только от двух, во время - только из компании "Proffi center" - там и решил заказывать и остался вполне доволен. Работу выполнили очень хорошо.', avatar: `${BASE_IMG}/otz/otz.png` },
];

export const footerMenuData = [
  { title: 'Расчет онлайн', href: '/natjazhnye-potolki-kalkuljator' },
  { title: 'Как сэкономить', href: '/skidki-na-potolki' },
  { title: 'Оплата Долями', href: '/dolyami' },
  { title: 'Возврат товара', href: '/vozvrat' },
];

export const footerData = {
  discountText: 'Узнайте больше о скидках компании:',
  phone: siteConfig.phone,
  email: siteConfig.email,
  siteUrl: siteConfig.siteUrl,
  copyright: 'Proffi Center',
  copyrightYear: 2021,
  legalLink: siteConfig.legalLink,
};

export const popupCallbackData = {
  title: 'ЗАКАЗАТЬ ЗВОНОК',
  legalLink: siteConfig.legalLink,
};

export const popupPozdrData = {
  title: 'Внимание !!!',
  content: 'Наша компания работает <strong>без предоплат и авансов!!!</strong> Оплата производиться только по факту выполненных работ.<br>Оплата производится как <strong>наличными, так и безналичным расчетом</strong>.<br>Так же имеется раcсрочка до одного года.<br>Чтобы узнать подробности, заполните форму.',
  legalLink: siteConfig.legalLink,
};

export const popupSpasiboData = {
  title: 'СПАСИБО!',
  message: 'Ваша заявка отправлена успешно.',
};

export const popupGetTownData = {
  title: 'Ваш город',
};
