import { Link } from 'react-router-dom';

/**
 * Карточка товара (market_block) для страницы «Готовые потолки».
 */
export default function ProductCard({ item }) {
  const { name, size, oldPrice, price, image, href } = item;

  return (
    <div className="col-sm-6 clearfix" itemScope itemProp="itemListElement" itemType="http://schema.org/Product">
      <div className="market_block clearfix">
        <h3 itemProp="name">{name}</h3>
        <meta itemProp="description" content={name} />
        <div className="col-lg-6">
          <div className="c_border">
            <div className="red_lenta" />
            <img itemProp="image" alt={name} src={image} />
          </div>
        </div>
        <div className="col-lg-6">
          <div className="m_sub">
            <div className="razmer">Размер: {size}</div>
            {oldPrice != null && (
              <div itemProp="offers" itemScope itemType="http://schema.org/Offer" className="old_price">
                <span itemProp="price">
                  <div className="red_line" />
                  {oldPrice}
                </span>
                <span><i className="rub2" /></span>
                <meta itemProp="priceCurrency" content="RUB" />
              </div>
            )}
            <div className="current_price">
              <span>{price}</span>
              <span><i className="rub" /></span>
            </div>
            <div className="yellow_btn">
              <Link to={href || '#'}>Купить</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
