/**
 * Данные страницы «Потолки в рассрочку».
 * В дальнейшем — получение из API. Структура та же.
 */

const BASE_IMG = '/images';

/** Блоки «0 руб. / 0% / 36 мес.» */
const USL_PARTS = [
  { max: '0', med: 'руб.', small: 'первый взнос', extraStyle: null },
  { max: '0', med: '%', small: 'переплата', extraStyle: null },
  { max: '36', med: 'мес.', small: 'срок кредита', extraStyle: { paddingLeft: '25px' }, smallStyle: { paddingLeft: '30px' } },
];

/** Шаги «Оформите рассрочку» (block1–block6) */
const BUY_NOW_STEPS = [
  {
    blockClass: 'block1',
    image: `${BASE_IMG}/buy_b1.png`,
    content: 'Вам нужно оставить заявку на сайте<br>или позвонить по телефону<br><span class="comagic_phone">{{phone}}</span><br>для вызова специалиста',
    usePhone: true,
  },
  {
    blockClass: 'block2',
    image: `${BASE_IMG}/buy_b2.png`,
    content: 'Для оформления рассрочки нужен только <span>паспорт</span>',
    usePhone: false,
  },
  {
    blockClass: 'block3',
    image: `${BASE_IMG}/buy_b3.png`,
    content: 'Вы выбираете удобный период<br><span>до 36 месяцев</span>',
    usePhone: false,
  },
  {
    blockClass: 'block4',
    image: `${BASE_IMG}/buy_b4.png`,
    content: 'Для заключения договора требуется<br>всего лишь <span>25 минут</span>',
    usePhone: false,
  },
  {
    blockClass: 'block5',
    image: `${BASE_IMG}/buy_b5.png`,
    content: 'Наслаждайтесь вашими<br><span>новыми потолками</span>',
    usePhone: false,
  },
  {
    blockClass: 'block6',
    image: `${BASE_IMG}/tinkoff-bank.png`,
    imageStyle: { width: '250px' },
    label: 'Банк партнер:',
    content: null,
    usePhone: false,
  },
];

/**
 * Все данные страницы «Потолки в рассрочку».
 * @param {object} [config] — siteConfig для подстановки телефона и т.д.
 */
export function getPotolkiVRassrochkuPageData(config) {
  const phone = config?.phone || '8 (999) 637-11-82';
  const steps = BUY_NOW_STEPS.map((step) => ({
    ...step,
    content: step.usePhone && step.content ? step.content.replace('{{phone}}', phone) : step.content,
  }));

  return {
    rassr: {
      title: 'Закажи сейчас, плати потом!',
      intro: 'У нас Вы можете заказать натяжные потолки, как по предоплате, так и в рассрочку. При этом Вы заплатите ни на копейку больше предварительно оговоренной суммы заказа! Никаких переплат!!! Мы помогаем сделать быт каждого человека лучше и комфортнее.',
      uslParts: USL_PARTS,
    },
    buyNow: {
      title: 'Оформите рассрочку',
      steps,
    },
    formRassr: {
      title: 'Оформите рассрочку уже сегодня!',
      buttonText: 'Отправить заявку',
    },
  };
}
