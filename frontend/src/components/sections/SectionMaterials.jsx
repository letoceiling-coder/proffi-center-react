import { Link } from 'react-router-dom';

/**
 * Блок «Материалы от мировых брендов» (s_simple_text с materials и dop_links).
 */
export default function SectionMaterials({ title, images = [], text, linksIntro, links = [] }) {
  return (
    <div className="section s_simple_text">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 clearfix">
            {title && <div className="ttl">{title}</div>}
            {images?.length > 0 && (
              <div className="materials clearfix">
                {images.map((src, i) => (
                  <img key={i} src={src} alt="" />
                ))}
              </div>
            )}
            {text && <p>{text}</p>}
            {links?.length > 0 && (
              <div className="dop_links">
                {linksIntro}
                <ul itemScope itemType="http://schema.org/BreadcrumbList">
                  {links.map((item, i) => (
                    <li key={i} itemProp="itemListElement" itemScope itemType="http://schema.org/ListItem">
                      <Link to={item.href} title={item.title} itemProp="item">
                        <span itemProp="name">{item.name}</span>
                        <meta itemProp="position" content={String(i)} />
                      </Link>
                      {i < links.length - 1 ? ', ' : ''}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
