/**
 * Данные страницы «Где заказать потолки» (контакты).
 * Всё берётся из регионального конфига (siteConfig или ответ API).
 * В дальнейшем — полное получение из API с той же структурой.
 */

/** Адрес одной строкой для карты/скрипта (как в шаблоне: town = 'Анапа ул.Омелькова 20 к1') */
export function getMapAddress(config) {
  if (!config?.address) return '';
  const { locality, street } = config.address;
  if (!locality && !street) return '';
  const streetPart = street ? ` ул.${String(street).replace(/,/g, ' ')}` : '';
  return `${locality || ''}${streetPart}`.trim();
}

/** Полный адрес строкой для баллуна маркера (город, улица, индекс) */
export function getAddressLine(config) {
  if (!config?.address) return '';
  const { locality, street, postalCode } = config.address;
  const parts = [locality, street].filter(Boolean);
  if (postalCode) parts.push(postalCode);
  return parts.join(', ');
}

/** Данные блока контактов (s_contacts): h1 и режим работы из конфига региона */
export function getContactsData(config) {
  if (!config) return { h1: '', workTime: '' };
  return {
    h1: `Устанавливаем потолки в ${config.city || ''}\n и ${config.region || ''}!`,
    workTime: config.workTime ?? 'Работаем без выходных\n8:00-23:00',
  };
}

/** Данные блока «Позвоните нам» под картой */
export function getMapPhoneData(config) {
  if (!config) return { text: 'Позвоните Нам по телефону', phone: '' };
  return {
    text: 'Позвоните Нам по телефону',
    phone: config.phone || '',
  };
}

/** Данные для маркера на карте (адрес, телефон, режим, название). Скрипт карты может читать data-атрибуты контейнера #map. */
export function getMapMarkerData(config) {
  if (!config) return { address: '', phone: '', workTime: '', companyName: '' };
  return {
    address: getAddressLine(config),
    phone: config.phone || '',
    workTime: (config.workTime ?? 'Работаем без выходных\n8:00-23:00').replace(/\n/g, ', '),
    companyName: config.companyName ?? 'Proffi Center',
  };
}

/** Все данные страницы «Где заказать» из регионального конфига (один источник для подстановки из API). */
export function getGdeZakazatPageData(config) {
  if (!config) {
    return {
      contacts: { h1: '', workTime: '' },
      mapAddress: '',
      mapPhone: { text: 'Позвоните Нам по телефону', phone: '' },
      mapMarker: { address: '', phone: '', workTime: '', companyName: '' },
    };
  }
  return {
    contacts: getContactsData(config),
    mapAddress: getMapAddress(config),
    mapPhone: getMapPhoneData(config),
    mapMarker: getMapMarkerData(config),
  };
}
