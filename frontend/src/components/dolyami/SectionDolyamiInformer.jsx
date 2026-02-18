import { Link } from 'react-router-dom';

/** Логотип Долями: заменить на официальный из dolyame.ru/brand/ при наличии */
const DOLYAMI_LOGO = '/images/dolyami/logo.svg';

/** Юридический текст по официальной механике Долями 6 недель (не кредит). Источник: помощь dolyame.ru. */
const LEGAL_DISCLAIMER = 'Долями — сервис оплаты покупок частями. Платёж делится на 4 части: первая списывается сразу, остальные — каждые 2 недели. Возможен сервисный сбор. Подробности — на dolyame.ru. Не является офертой.';

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
              <div className="dolyami-informer-brand">
                <img src={DOLYAMI_LOGO} alt="Долями от Т-Банка" className="dolyami-informer-logo" width="160" height="48" loading="lazy" />
              </div>
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
