import { Link } from 'react-router-dom';

export default function LinkBlock({ title, href, image, price, rating, reviewCount }) {
  return (
    <div className="col-md-6 clearfix" itemScope itemType="http://schema.org/Product">
      <meta itemProp="brand" content="MSD" />
      <meta itemProp="name" content={title} />
      <meta itemProp="manufacturer" content="MSD-PREMIUM" />
      <div className="link_block">
        <Link to={href}>{title}</Link>
        <meta itemProp="description" content="MSD" />
        <div className="ramka">
          <Link to={href}>
            <img itemProp="image" src={image} alt={title} />
          </Link>
        </div>
        <div className="l_label" itemProp="offers" itemScope itemType="http://schema.org/Offer">
          <div className="flex2">
            <span itemProp="price">{price}</span>
            <span><i className="rub5" /></span>
          </div>
          <meta itemProp="priceCurrency" content="RUB" />
        </div>
      </div>
      {(rating != null || reviewCount != null) && (
        <div itemProp="aggregateRating" itemScope itemType="https://schema.org/AggregateRating">
          {rating != null && <meta itemProp="ratingValue" content={String(rating)} />}
          {reviewCount != null && <meta itemProp="reviewCount" content={String(reviewCount)} />}
        </div>
      )}
    </div>
  );
}
