import { useState } from 'react';
import { JsonLd } from '../../seo';
import { faqPage } from '../../seo/jsonld';

export default function SectionFAQ({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (!items.length) return null;

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="section s_faq">
      <JsonLd scripts={[faqPage(items.map((it) => ({ question: it.q, answer: it.a })))]} />
      <div className="container">
        <div className="row">
          <div className="col-sm-12 clearfix">
            <h2 className="s_faq_title">Ответы на частые вопросы о натяжных потолках</h2>
            <p className="s_faq_sub">Всё, что важно знать перед заказом — собрали в одном месте</p>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 col-md-10 col-md-offset-1 clearfix">
            <div className="s_faq_list">
              {items.map((item, i) => (
                <div
                  key={i}
                  className={`s_faq_item${openIndex === i ? ' s_faq_item--open' : ''}`}
                  itemScope
                  itemType="https://schema.org/Question"
                >
                  <button
                    type="button"
                    className="s_faq_q"
                    onClick={() => toggle(i)}
                    aria-expanded={openIndex === i}
                    itemProp="name"
                  >
                    <span>{item.q}</span>
                    <span className="s_faq_icon" aria-hidden="true">{openIndex === i ? '−' : '+'}</span>
                  </button>
                  {openIndex === i && (
                    <div
                      className="s_faq_a"
                      itemScope
                      itemType="https://schema.org/Answer"
                      itemProp="acceptedAnswer"
                    >
                      <p itemProp="text">{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
