import { useState } from 'react';
import { popupCallbackData } from '../data/mockPageData';
import { useSite } from '../context/SiteContext.jsx';
import { submitLead } from '../api/public.js';
import { isPhoneValid } from '../utils/formValidation.js';

export default function PopupCallback({ isOpen, onClose, onSuccess }) {
  const { site, selectedCitySlug } = useSite();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError('');
    if (sending) return;
    if (!phone?.trim()) {
      setError('Укажите телефон');
      return;
    }
    if (!isPhoneValid(phone)) {
      setError('Введите корректный номер (не менее 10 цифр)');
      return;
    }
    setSending(true);
    try {
      await submitLead({ type: 'callback', phone: phone.trim(), name: name?.trim() || undefined, city_slug: site?.city?.slug ?? selectedCitySlug ?? undefined });
      onSuccess?.();
      setName('');
      setPhone('');
      onClose();
    } catch (err) {
      setError(err?.message || 'Не удалось отправить. Попробуйте позже.');
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
            <input className="pop_tel" type="text" placeholder="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} />
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
