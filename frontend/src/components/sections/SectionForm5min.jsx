import { useState } from 'react';
import { useSite } from '../../context/SiteContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';
import { submitLead } from '../../api/public.js';
import { isPhoneValid, normalizePhone } from '../../utils/formValidation.js';
import { formatPhoneInput } from '../../utils/phoneFormat.js';

export default function SectionForm5min({ data, onSubmit, id: sectionId }) {
  const { site, selectedCitySlug } = useSite();
  const { show } = useNotification();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (sending) return;
    if (!name?.trim()) {
      show('Укажите имя', 'error');
      return;
    }
    if (!phone?.trim()) {
      show('Укажите телефон', 'error');
      return;
    }
    if (!isPhoneValid(phone)) {
      show('Введите корректный номер телефона (не менее 10 цифр)', 'error');
      return;
    }
    const payload = { type: 'form_5min', phone: normalizePhone(phone) || phone.trim(), name: name.trim(), city_slug: site?.city?.slug ?? selectedCitySlug ?? undefined };
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

  const openLegal = (e) => {
    e?.preventDefault?.();
    if (data?.legalLink) window.open(data.legalLink, '_blank', 'width=500,height=500');
  };

  return (
    <div className={`section s_form5min${sectionId ? ' anchor' : ''}`} id={sectionId || undefined}>
      <div className="container">
        <div className="row">
          <div className="col-md-12 clearfix">
            <div className="ttl">{data?.title}</div>
            <div className="col-md-12 zakaz_5min clearfix">
              <div className="razmetka1">
                <div className="low_name">
                  <input className="v_name" type="text" placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              </div>
              <div className="razmetka1">
                <div className="low_tel">
                  <input className="v_tel" type="tel" inputMode="numeric" placeholder="8 (999) 123-45-67" value={phone} onChange={(e) => setPhone(formatPhoneInput(e.target.value))} />
                </div>
              </div>
              <div className="razmetka1_1">
                <div className="blue_btn">
                  <a href="#" id="zakaz_5min" onClick={handleSubmit}>{data?.buttonText || 'Отправить заявку'}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="prav-info clearfix">
          Вписывая телефон, вы подтверждаете свое совершеннолетие, соглашаетесь на обработку персональных данных в соответствии с{' '}
          <a href={data?.legalLink} className="b-link" onClick={openLegal}>Правовой информацией</a>
        </div>
      </div>
    </div>
  );
}
