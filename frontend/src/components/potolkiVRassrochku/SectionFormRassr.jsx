/**
 * Форма «Оформите рассрочку уже сегодня» (s_form_rassr).
 * Разметка и классы — как в шаблоне potolki-v-rassrochku.html.
 */

import { useState } from 'react';

export default function SectionFormRassr({ data = {}, onSubmit }) {
  const { title = '', buttonText = 'Отправить заявку' } = data;
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    onSubmit?.({ name, phone });
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
                    {buttonText}
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
