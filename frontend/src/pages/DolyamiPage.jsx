import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Seo, JsonLd, getBaseUrl } from '../seo';
import { breadcrumbList } from '../seo/jsonld';
import Header from '../components/Header';
import NavMobile from '../components/NavMobile';
import PopupCallback from '../components/PopupCallback';
import PopupSpasibo from '../components/PopupSpasibo';
import PreLoader from '../components/PreLoader';
import SectionFormRassr from '../components/potolkiVRassrochku/SectionFormRassr';
import FooterMenu from '../components/FooterMenu';
import Footer from '../components/Footer';
import {
  DOLYAMI_LEGAL_DISCLAIMER,
  dolyamiHowItWorks,
  dolyamiAdvantages,
  dolyamiFaq,
} from '../data/dolyamiData';
import { footerMenuData, footerData } from '../data/mockPageData';

const FORM_TITLE = 'Узнать об оплате Долями';

export default function DolyamiPage() {
  const [popupCallback, setPopupCallback] = useState(false);
  const [popupSpasibo, setPopupSpasibo] = useState(false);
  const [navMobileOpen, setNavMobileOpen] = useState(false);
  const [faqOpenIndex, setFaqOpenIndex] = useState(null);

  const pathname = useLocation().pathname;
  const staticMeta = getStaticMeta(pathname);
  const breadcrumb = breadcrumbList(getBaseUrl(), [
    { name: 'Главная', url: '/' },
    { name: 'Оплата Долями', url: '/dolyami' },
  ]);

  const openCallback = () => setPopupCallback(true);
  const closeCallback = () => setPopupCallback(false);
  const onCallbackSuccess = () => setPopupSpasibo(true);

  const handleFormSubmit = () => onCallbackSuccess();

  const toggleFaq = (index) => {
    setFaqOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <PreLoader>
      <Seo pathname={pathname} />
      <JsonLd scripts={[breadcrumb]} />
      <div className="toptop" />
      <Header onCallClick={openCallback} onZamerClick={openCallback} />
      <NavMobile isOpen={navMobileOpen} onClose={() => setNavMobileOpen(false)} />

      {(popupCallback || popupSpasibo) && (
        <div
          className="hide-layout"
          id="hide-layout"
          style={{ display: 'block', zIndex: 10000 }}
          onClick={() => { closeCallback(); setPopupSpasibo(false); }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && (closeCallback(), setPopupSpasibo(false))}
          aria-label="Закрыть"
        />
      )}
      <PopupCallback isOpen={popupCallback} onClose={closeCallback} onSuccess={onCallbackSuccess} />
      <PopupSpasibo isOpen={popupSpasibo} onClose={() => setPopupSpasibo(false)} />

      <div className="probel" />

      {/* A) Hero */}
      <section className="section dolyami-hero">
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <h1 className="dolyami-hero-h1">Оплата Долями от Т-Банка</h1>
              <p className="dolyami-hero-desc">
                Разделите сумму заказа на 4 платежа без переплат. Первый платёж — сразу, остальные каждые 2 недели. Оформление за несколько минут.
              </p>
              <Link to="/natjazhnye-potolki-kalkuljator" className="dolyami-hero-cta">
                Рассчитать стоимость
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* B) Как работает — 4 платежа */}
      <section className="section dolyami-how">
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <h2 className="dolyami-section-title">Как работает</h2>
              <div className="dolyami-stepper">
                {dolyamiHowItWorks.map((item, i) => (
                  <div key={i} className="dolyami-stepper-item">
                    <div className="dolyami-stepper-num">{item.step}</div>
                    <div className="dolyami-stepper-body">
                      <h3 className="dolyami-stepper-title">{item.title}</h3>
                      <p className="dolyami-stepper-desc">{item.desc}</p>
                    </div>
                    {i < dolyamiHowItWorks.length - 1 && <div className="dolyami-stepper-line" aria-hidden="true" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* C) Преимущества — 3 карточки */}
      <section className="section dolyami-advantages">
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <h2 className="dolyami-section-title">Преимущества</h2>
              <div className="dolyami-adv-cards">
                {dolyamiAdvantages.map((card, i) => (
                  <div key={i} className="dolyami-adv-card">
                    <h3 className="dolyami-adv-card-title">{card.title}</h3>
                    <p className="dolyami-adv-card-text">{card.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* D) FAQ */}
      <section className="section dolyami-faq">
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <h2 className="dolyami-section-title">Частые вопросы</h2>
              <div className="dolyami-accordion">
                {dolyamiFaq.map((item, i) => (
                  <div key={i} className="dolyami-accordion-item">
                    <button
                      type="button"
                      className="dolyami-accordion-head"
                      onClick={() => toggleFaq(i)}
                      aria-expanded={faqOpenIndex === i}
                      aria-controls={`dolyami-faq-${i}`}
                      id={`dolyami-faq-head-${i}`}
                    >
                      <span>{item.q}</span>
                      <span className="dolyami-accordion-icon" aria-hidden="true">{faqOpenIndex === i ? '−' : '+'}</span>
                    </button>
                    <div
                      id={`dolyami-faq-${i}`}
                      role="region"
                      aria-labelledby={`dolyami-faq-head-${i}`}
                      className="dolyami-accordion-body"
                      hidden={faqOpenIndex !== i}
                    >
                      <p>{item.a}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* E) Официальные материалы */}
      <section className="section dolyami-official">
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <h2 className="dolyami-section-title">Официальные материалы</h2>
              <div className="dolyami-official-block">
                <p className="dolyami-official-text">
                  Подробная информация о сервисе «Долями», условиях и тарифах — на официальном сайте Т-Банка.
                </p>
                <a
                  href="https://dolyame.ru"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="dolyami-official-link"
                >
                  dolyame.ru
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* F) Юридическая информация */}
      <section className="section dolyami-legal">
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <h2 className="dolyami-section-title">Юридическая информация</h2>
              <div className="dolyami-legal-block">
                <p>{DOLYAMI_LEGAL_DISCLAIMER}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* G) Форма заявки */}
      <SectionFormRassr data={{ title: FORM_TITLE, buttonText: 'Отправить заявку' }} onSubmit={handleFormSubmit} />

      <FooterMenu items={footerMenuData} />
      <Footer data={footerData} />
    </PreLoader>
  );
}
