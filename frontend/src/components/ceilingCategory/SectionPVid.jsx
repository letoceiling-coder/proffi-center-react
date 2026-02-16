/**
 * Секция вида потолков (s_p_vid): заголовок, текст, сетка изображений p_img.
 * Разметка и классы — как в шаблоне (matovye-potolki.html и аналогах).
 */

export default function SectionPVid({ title = '', intro = '', images = [], rell = false }) {
  return (
    <div className="section s_p_vid">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 clearfix">
            {title && <h1 className="">{title}</h1>}
            {intro && <p className="light">{intro}</p>}
            <div className="row">
              {(images || []).map((img, i) => (
                <div key={i} className="col-md-6 clearfix">
                  <div
                    className={`p_img${rell ? ' rell' : ''}`}
                    itemScope
                    itemType="http://schema.org/ImageObject"
                  >
                    <div className="red_lenta" />
                    {img.name && <meta itemProp="name" content={img.name} />}
                    {img.description && <meta itemProp="description" content={img.description} />}
                    <img
                      itemProp="contentUrl"
                      src={img.src}
                      alt={img.alt || title}
                    />
                    {img.caption && (
                      <p data-text={img.caption}>{img.caption}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
