import { useState } from 'react';
import { popupPozdrData } from '../data/mockPageData';
import { useSite } from '../context/SiteContext.jsx';
import { submitLead } from '../api/public.js';
import { isPhoneValid } from '../utils/formValidation.js';

export default function PopupPozdr({ isOpen, onClose, onSuccess }) {
  const { site, selectedCitySlug } = useSite();
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
      await submitLead({ type: 'pozdravlenie', phone: phone.trim(), city_slug: site?.city?.slug ?? selectedCitySlug ?? undefined });
      onSuccess?.();
      setPhone('');
      onClose();
    } catch (err) {
      setError(err?.message || 'Не удалось отправить. Попробуйте позже.');
    }
    setSending(false);
  };

  const openLegal = (e) => {
    e.preventDefault();
    window.open(popupPozdrData.legalLink, '_blank', 'scrollbars=1,width=500,height=500');
  };

  return (
    <div id="pozdr" className="pozdr">
      <div className="f-close" onClick={onClose} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClose()} aria-label="Закрыть" />
      <div className="header">{popupPozdrData.title}</div>
      <div className="header_sub" dangerouslySetInnerHTML={{ __html: popupPozdrData.content }} />
      <form onSubmit={handleSubmit}>
        <div className="razmetka1">
          <div className="low_tel">
            <input className="pozdr_tel" type="text" placeholder="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>
        <div className="blue_btn">
          <a href="#" id="callback-pozdr" onClick={(e) => { e.preventDefault(); handleSubmit(e); }}>{sending ? 'Отправка…' : 'Отправить'}</a>
        </div>
      </form>
      <div className="prav-info clearfix">
        Вписывая телефон, вы подтверждаете свое совершеннолетие, соглашаетесь на обработку персональных данных в соответствии с{' '}
        <a href={popupPozdrData.legalLink} className="b-link" onClick={openLegal}>
          Правовой информацией
        </a>
      </div>
    </div>
  );
}
