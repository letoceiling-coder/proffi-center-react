import { useState } from 'react';
import { popupPozdrData } from '../data/mockPageData';

export default function PopupPozdr({ isOpen, onClose, onSuccess }) {
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    onSuccess?.();
    setPhone('');
    onClose();
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
          <a href="#" id="callback-pozdr" onClick={(e) => { e.preventDefault(); handleSubmit(e); }}>Отправить</a>
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
