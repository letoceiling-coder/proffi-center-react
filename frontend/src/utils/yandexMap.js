/**
 * Подключение API Яндекс.Карт и инициализация карты по адресу.
 * API key можно задать через VITE_YANDEX_MAPS_API_KEY в .env.
 */

const YANDEX_MAPS_API_KEY = import.meta.env?.VITE_YANDEX_MAPS_API_KEY || 'a79c56f4-efea-471e-bee5-fe9226cd53fd';
const API_URL = `https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=${YANDEX_MAPS_API_KEY}`;

let scriptLoadPromise = null;

/** Загрузить скрипт API Яндекс.Карт один раз */
export function loadYandexMapsScript() {
  if (typeof window !== 'undefined' && window.ymaps) {
    return Promise.resolve(window.ymaps);
  }
  if (scriptLoadPromise) return scriptLoadPromise;
  scriptLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="api-maps.yandex.ru"]');
    if (existing) {
      const check = () => (window.ymaps ? resolve(window.ymaps) : setTimeout(check, 100));
      check();
      return;
    }
    const script = document.createElement('script');
    script.src = API_URL;
    script.async = true;
    script.onload = () => resolve(window.ymaps);
    script.onerror = () => reject(new Error('Yandex Maps API failed to load'));
    document.head.appendChild(script);
  });
  return scriptLoadPromise;
}

/**
 * Собрать HTML баллуна маркера из региональных данных
 */
function buildBalloonContent(marker = {}) {
  const { companyName = '', address = '', phone = '', workTime = '' } = marker;
  const parts = [];
  if (companyName) parts.push(`<strong>${escapeHtml(companyName)}</strong>`);
  if (address) parts.push(escapeHtml(address));
  if (phone) parts.push(`Тел.: <a href="tel:${phone.replace(/\s/g, '')}">${escapeHtml(phone)}</a>`);
  if (workTime) parts.push(escapeHtml(workTime));
  return parts.join('<br/>');
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

/**
 * Инициализировать карту в контейнере по адресу.
 * @param {string} containerId - id элемента (например 'map')
 * @param {string} address - адрес для геокодирования (например "Анапа ул.Омелькова 20 к1")
 * @param {object} markerData - данные для баллуна: companyName, address, phone, workTime
 * @returns {Promise<object|null>} - экземпляр карты или null (для очистки при unmount)
 */
export function initYandexMap(containerId, address, markerData = {}) {
  if (!containerId || !address) return Promise.resolve(null);

  return loadYandexMapsScript().then((ymaps) => {
    return new Promise((resolve) => {
      ymaps.ready(() => {
        const container = document.getElementById(containerId);
        if (!container) {
          resolve(null);
          return;
        }

        ymaps.geocode(address, { results: 1 }).then((res) => {
          const first = res.geoObjects.get(0);
          if (!first) {
            resolve(null);
            return;
          }

          const coords = first.geometry.getCoordinates();
          const map = new ymaps.Map(containerId, {
            center: coords,
            zoom: 17,
            controls: ['zoomControl', 'typeSelector', 'fullscreenControl'],
          });

          const balloonContent = buildBalloonContent(markerData);
          const placemark = new ymaps.Placemark(
            coords,
            { balloonContent },
            { preset: 'islands#redIcon' }
          );
          map.geoObjects.add(placemark);

          resolve(map);
        }).catch(() => resolve(null));
      });
    });
  });
}

/**
 * Уничтожить карту (освободить ресурсы при размонтировании)
 */
export function destroyYandexMap(mapInstance) {
  if (mapInstance && typeof mapInstance.destroy === 'function') {
    mapInstance.destroy();
  }
}
