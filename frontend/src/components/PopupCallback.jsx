import { useState } from 'react';
import { popupCallbackData } from '../data/mockPageData';
import { useSite } from '../context/SiteContext.jsx';
import { useNotification } from '../context/NotificationContext.jsx';
import { submitLead } from '../api/public.js';
import { isPhoneValid, normalizePhone } from '../utils/formValidation.js';
import { formatPhoneInput } from '../utils/phoneFormat.js';

export default function PopupCallback({ isOpen, onClose, onSuccess }) {
  const { site, selectedCitySlug } = useSite();
  const { show } = useNotification();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

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
      show('Введите корректный номер (не менее 10 цифр)', 'error');
      return;
    }
    setSending(true);
    try {
      await submitLead({ type: 'callback', phone: normalizePhone(phone) || phone.trim(), name: name.trim(), city_slug: site?.city?.slug ?? selectedCitySlug ?? undefined });
      show('Заявка отправлена. Мы перезвоним вам.', 'success');
      setName('');
      setPhone('');
      onClose();
    } catch (err) {
      show(err?.message || 'Не удалось отправить. Попробуйте позже.', 'error');
    }
    setSending(false);
  };

  const openLegal = (e) => {
    e.preventDefault();
    window.open(popupCallbackData.legalLink, '_blank', 'scrollbars=1,width=500,height=500');
  };

  return (
    <div id="popup1" className="popup1" style={{ display: 'block', zIndex: 10001, position: 'fixed' }}>
      <div className="f-close" onClick={onClose} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClose()} aria-label="Закрыть" />
      <div className="header">{popupCallbackData.title}</div>
      <div className="header_sub" />
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(e); }}>
        <div className="razmetka1">
          <div className="low_name">
            <input className="pop_name" type="text" placeholder="Ваше имя" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>
        <div className="razmetka1">
          <div className="low_tel">
            <input className="pop_tel" type="tel" inputMode="numeric" placeholder="8 (999) 123-45-67" value={phone} onChange={(e) => setPhone(formatPhoneInput(e.target.value))} />
          </div>
        </div>
        <div className="blue_btn">
          <a href="#" id="callback-send1" onClick={(e) => { e.preventDefault(); handleSubmit(e); }}>{sending ? 'Отправка…' : 'Жду звонка'}</a>
        </div>
      </form>
      <div className="prav-info clearfix">
        Вписывая телефон, вы подтверждаете свое совершеннолетие, соглашаетесь на обработку персональных данных в соответствии с{' '}
        <a href={popupCallbackData.legalLink} className="b-link" onClick={openLegal}>
          Правовой информацией
        </a>
      </div>
    </div>
  );
}
