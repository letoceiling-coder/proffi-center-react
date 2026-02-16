import { useState } from 'react';
import { popupCallbackData } from '../data/mockPageData';

export default function PopupCallback({ isOpen, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    onSuccess?.();
    setName('');
    setPhone('');
    onClose();
  };

  const openLegal = (e) => {
    e.preventDefault();
    window.open(popupCallbackData.legalLink, '_blank', 'scrollbars=1,width=500,height=500');
  };

  return (
    <div id="popup1" className="popup1" style={{ display: 'block' }}>
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
          <a href="#" id="callback-send1" onClick={(e) => { e.preventDefault(); handleSubmit(e); }}>Жду звонка</a>
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
