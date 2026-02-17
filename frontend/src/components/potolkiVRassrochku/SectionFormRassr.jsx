/**
 * Форма «Оформите рассрочку уже сегодня» (s_form_rassr).
 * Разметка и классы — как в шаблоне potolki-v-rassrochku.html.
 */

import { useState } from 'react';
import { useSite } from '../../context/SiteContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';
import { submitLead } from '../../api/public.js';
import { isPhoneValid } from '../../utils/formValidation.js';

export default function SectionFormRassr({ data = {}, onSubmit }) {
  const { site, selectedCitySlug } = useSite();
  const { show } = useNotification();
  const { title = '', buttonText = 'Отправить заявку' } = data;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (sending) return;
    if (!phone?.trim()) {
      show('Укажите телефон', 'error');
      return;
    }
    if (!isPhoneValid(phone)) {
      show('Введите корректный номер телефона (не менее 10 цифр)', 'error');
      return;
    }
    const payload = { type: 'rassrochka', phone: phone.trim(), name: name?.trim() || undefined, city_slug: site?.city?.slug ?? selectedCitySlug ?? undefined };
    if (onSubmit) {
      onSubmit({ name, phone });
      return;
    }
    setSending(true);
    try {
      await submitLead(payload);
      setName('');
      setPhone('');
      show('Заявка отправлена. Мы перезвоним вам.', 'success');
    } catch (err) {
      show(err?.message || 'Не удалось отправить. Попробуйте позже.', 'error');
    }
    setSending(false);
  };

  return (
    <div className="section s_form_rassr">
      <div className="container">
        <div className="row">
          <div className="col-md-12 clearfix">
            {title && <h1 className="">{title}</h1>}

            <div className="col-md-12 zakaz_rassr clearfix">
              <div className="razmetka1">
                <div className="low_name">
                  <input
                    className="r_name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ваше имя"
                  />
                </div>
              </div>
              <div className="razmetka1">
                <div className="low_tel">
                  <input
                    className="r_tel"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Телефон"
                  />
                </div>
              </div>
              <div className="razmetka1_1">
                <div className="blue_btn">
                  <a href="#" id="zakaz_rassr" onClick={handleSubmit}>
                    {sending ? 'Отправка…' : buttonText}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
