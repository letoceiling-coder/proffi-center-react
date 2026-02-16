import { Link } from 'react-router-dom';

export default function SectionPotolki2({ items = [] }) {
  return (
    <div className="section s_potolki2">
      <div className="container">
        {items.map((item, i) => (
          <div key={i} className="row" itemScope itemType="http://schema.org/Product">
            <meta itemProp="brand" content="MSD" />
            <meta itemProp="manufacturer" content="MSD-PREMIUM" />
            {item.align === 'left' ? (
              <>
                <div className="col-md-12 clearfix">
                  <div className="p2_img center">
                    <img itemProp="image" src={item.image} alt={item.title} />
                  </div>
                  <div className="p2_txt">
                    <h5 itemProp="name">{item.title}</h5>
                    <p itemProp="description">{item.description}</p>
                    <div className="yellow_btn" itemProp="offers" itemScope itemType="http://schema.org/Offer">
                      <meta itemProp="price" content="99.00" />
                      <meta itemProp="priceCurrency" content="RUB" />
                      <Link to={item.href}>Подробнее</Link>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="col-md-12 clearfix">
                  <div className="p2_img_r center">
                    <img src={item.image} alt={item.title} />
                  </div>
                  <div className="p2_txt_r">
                    <h5 itemProp="name">{item.title}</h5>
                    <p itemProp="description">{item.description}</p>
                    <div className="yellow_btn" itemProp="offers" itemScope itemType="http://schema.org/Offer">
                      <meta itemProp="price" content="99.00" />
                      <meta itemProp="priceCurrency" content="RUB" />
                      <Link to={item.href}>Подробнее</Link>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
