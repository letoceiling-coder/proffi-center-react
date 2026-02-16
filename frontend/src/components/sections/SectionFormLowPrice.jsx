import { useState } from 'react';
import FlipClockCountdown from '@leenguyen/react-flip-clock-countdown';
import '@leenguyen/react-flip-clock-countdown/dist/index.css';

export default function SectionFormLowPrice({ data, onSubmit }) {
  const { title, countdownLabel, countdownEnd, legalLink } = data || {};
  const [phone, setPhone] = useState('');

  const openLegal = (e) => {
    e.preventDefault();
    window.open(legalLink, '_blank', 'width=500,height=500');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({ phone });
  };

  const targetTime = countdownEnd ? new Date(countdownEnd).getTime() : null;

  return (
    <div className="section s_form_lowprice">
      <div className="container">
        <div className="row">
          <div className="col-sm-12  clearfix">
            <h3 style={{ color: '#000' }} className="">{title}</h3>

            <div className="cont_section">
              <div className="zagl">{countdownLabel}</div>
              <div className="dd s_form_lowprice_flip_wrap">
                {targetTime != null && targetTime > Date.now() ? (
                  <FlipClockCountdown
                    to={targetTime}
                    renderMap={[false, true, true, true]}
                    labels={['', 'ЧАСОВ', 'МИНУТ', 'СЕКУНД']}
                    showLabels={true}
                    showSeparators={true}
                    digitBlockStyle={{
                      background: '#2861dc',
                      color: '#fff',
                      width: '80px',
                      height: '108px',
                      fontSize: '88px',
                      fontWeight: 700,
                      borderRadius: '10px',
                    }}
                    labelStyle={{
                      color: '#333',
                      fontSize: '18px',
                      textTransform: 'uppercase',
                      fontFamily: 'RobotoCondensedRegular, Roboto, sans-serif',
                    }}
                    separatorStyle={{
                      size: '8px',
                      color: '#1a237e',
                    }}
                    duration={0.5}
                  />
                ) : (
                  <div className="digits s_form_lowprice_flip_placeholder" style={{ width: 527, height: 108 }} />
                )}
              </div>
            </div>
            <div className="clearfix"></div>
            <div className="col-md-2  clearfix">
            </div>
            <div className="col-md-5  clearfix">
              <div className="low_tel">
                <input id="low_tel" type="text" placeholder="Телефон" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>

            <div className="col-md-3  clearfix">
              <div className="blue_btn">
                <a id="low_sand" href="#" onClick={handleSubmit}>
                  Отправить заявку
                </a>
              </div>
            </div>

          </div>

        </div>
        <div className="prav-info">Вписывая телефон, вы подтверждаете свое совершеннолетие, соглашаетесь на обработку персональных данных в&nbsp;соответствии с
          <a href={legalLink} className="b-link" onClick={openLegal}>Правовой&nbsp;информацией</a>
        </div>
      </div>
    </div>
  );
}
