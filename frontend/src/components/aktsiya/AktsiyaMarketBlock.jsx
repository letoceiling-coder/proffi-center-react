/**
 * Карточка подарка на странице акции (s_market .market_block).
 * Разметка 1 в 1 как в шаблоне aktsiya.html.
 */
export default function AktsiyaMarketBlock({ item }) {
  const { title, description, image, oldPrice } = item;
  const podarokImg = '/images/podarok.png';

  return (
    <div className="col-sm-6 clearfix" itemScope itemType="http://schema.org/Product">
      <div className="market_block clearfix">
        <h3 itemProp="name">{title}</h3>
        <meta itemProp="description" content={description} />
        <div className="col-lg-6">
          <div className="c_border">
            <div className="red_lenta" />
            <img itemProp="image" src={image} alt="" />
          </div>
        </div>
        <div className="col-lg-6">
          <div className="m_sub">
            <div className="razmer">{description}</div>
            <div itemProp="offers" itemScope itemType="http://schema.org/Offer" className="old_price">
              <span itemProp="price">
                <div className="red_line" />
                {oldPrice}
              </span>
              <span><i className="rub2" /></span>
              <meta itemProp="priceCurrency" content="RUB" />
            </div>
            <div className="current_price">
              <img itemProp="image" src={podarokImg} alt="" />
            </div>
            <div className="yellow_btn">
              <a href="/aktsiya#aktsiya">Получить</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
