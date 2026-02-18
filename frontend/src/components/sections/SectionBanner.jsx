import { useMemo } from 'react';
import { bannerData } from '../../data/mockPageData';

const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

function formatSaleLabel() {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return `Распродажа до ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export default function SectionBanner({ data = bannerData, onZamerClick }) {
  const saleLabel = useMemo(() => formatSaleLabel(), []);

  return (
    <div className="section s_ind_banner">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 clearfix">
            <div className="wooman" />
            <div className="i_banner" style={{ backgroundImage: `url(${data.bgImage})` }}>
              <div className="i_act">
                <div className="np">
                  <strong>{data.title}</strong>
                </div>
                <div className="za">{data.titleSuffix}</div>
                <div className="r99">
                  {data.price}
                  <span>{data.priceUnit}</span>
                </div>
                <div className="tolko" id="tolko">{saleLabel}</div>
              </div>
              <div className="i_zamer">
                <a href="#" onClick={(e) => { e.preventDefault(); onZamerClick?.(); }} role="button">
                  бесплатный<br />
                  <span>{data.ctaSubtext}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
