import { useState } from 'react';

export default function SectionForm5min({ data, onSubmit, id: sectionId }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    onSubmit?.({ name, phone });
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
                  <input className="v_tel" type="text" placeholder="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} />
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
