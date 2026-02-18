import { Link } from 'react-router-dom';

/** Обязательный юридический дисклеймер по требованиям Т-Банка / Долями для партнёров */
const LEGAL_DISCLAIMER = 'Кредитный продукт «Долями» предоставляется АО «Тинькофф Банк». Подробная информация на dolyame.ru. Не является офертой.';

export default function SectionDolyamiInformer() {
  const points = [
    'Первый платёж — сразу',
    'Остальные — каждые 2 недели',
    'Оформление быстро',
  ];

  return (
    <div className="section section-dolyami-informer">
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <div className="dolyami-informer-card">
              <div className="dolyami-informer-content">
                <h2 className="dolyami-informer-title">Оплата Долями от Т-Банка</h2>
                <p className="dolyami-informer-subtitle">Разделите сумму на 4 платежа</p>
                <ul className="dolyami-informer-list">
                  {points.map((text, i) => (
                    <li key={i}>{text}</li>
                  ))}
                </ul>
                <Link to="/dolyami" className="dolyami-informer-btn">
                  Подробнее
                </Link>
                <p className="dolyami-informer-legal">{LEGAL_DISCLAIMER}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
