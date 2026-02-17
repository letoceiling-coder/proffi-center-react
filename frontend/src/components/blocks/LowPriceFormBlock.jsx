import { useState } from 'react';
import { useSite } from '../../context/SiteContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';
import { submitLead } from '../../api/public.js';
import { isPhoneValid } from '../../utils/formValidation.js';

export default function LowPriceFormBlock({ data }) {
  const { enabled } = data;
  const { site, selectedCitySlug } = useSite();
  const { show } = useNotification();
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const legalLink = '/images/prav-info.pdf';

  if (enabled === false) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;
    if (!phone?.trim()) {
      show('Укажите телефон', 'error');
      return;
    }
    if (!isPhoneValid(phone)) {
      show('Введите корректный номер телефона (не менее 10 цифр)', 'error');
      return;
    }
    setSending(true);
    try {
      await submitLead({ type: 'low_price', phone: phone.trim(), city_slug: site?.city?.slug ?? selectedCitySlug ?? undefined });
      setPhone('');
      show('Заявка отправлена.', 'success');
    } catch (err) {
      show(err?.message || 'Не удалось отправить. Попробуйте позже.', 'error');
    }
    setSending(false);
  };

  return (
    <div className="section block-form-low-price">
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <h3 style={{ color: '#000' }}>Заказать по самой низкой цене</h3>
            <form onSubmit={handleSubmit} className="form_low_price">
              <input
                type="tel"
                placeholder="Телефон"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <button type="submit">{sending ? 'Отправка…' : 'Отправить'}</button>
            </form>
            <a href={legalLink} target="_blank" rel="noopener noreferrer" className="legal-link">
              Правовая информация
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
