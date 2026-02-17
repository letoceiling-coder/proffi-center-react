/**
 * Попап выбора города при первом заходе на основной сайт (proffi-center.ru).
 * По умолчанию данные Анапы; пользователь может выбрать другой город.
 */
import { useState, useEffect } from 'react';
import { useSite } from '../context/SiteContext.jsx';
import { getCitySites } from '../api/public.js';

const POPUP_SEEN_KEY = 'city_popup_seen';

export default function CitySelectPopup() {
  const { isMain, setSelectedCitySlug } = useSite();
  const [show, setShow] = useState(false);
  const [cities, setCities] = useState([
    { name: 'Анапа', slug: 'anapa' },
    { name: 'Ставрополь', slug: 'stavropol' },
    { name: 'Москва', slug: 'moscow' },
  ]);

  useEffect(() => {
    if (!isMain || typeof window === 'undefined') return;
    if (window.localStorage?.getItem(POPUP_SEEN_KEY)) return;
    setShow(true);
    getCitySites().then((res) => {
      const list = res?.data?.cities;
      if (Array.isArray(list) && list.length > 0) {
        setCities(list.map((c) => ({ name: c.name, slug: c.slug })));
      }
    }).catch(() => {});
  }, [isMain]);

  const handleSelect = (slug) => {
    setSelectedCitySlug(slug);
    try {
      window.localStorage?.setItem(POPUP_SEEN_KEY, '1');
    } catch (_) {}
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="city-select-popup-overlay" style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 10000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div className="city-select-popup" style={{
        background: '#fff',
        padding: '24px 32px',
        borderRadius: 8,
        maxWidth: 360,
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      }}>
        <p style={{ margin: '0 0 16px', fontSize: 18 }}>Выберите город</p>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: '#666' }}>По умолчанию: Анапа. Телефоны и адреса будут подставлены для выбранного города.</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cities.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => handleSelect(c.slug)}
              style={{
                padding: '12px 16px',
                fontSize: 16,
                border: '1px solid #2861dc',
                borderRadius: 6,
                background: '#fff',
                color: '#2861dc',
                cursor: 'pointer',
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
