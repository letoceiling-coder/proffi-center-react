/**
 * Hero-блок детальной страницы товара (s_p_vid): заголовок и краткое описание.
 */
export default function SectionProductHero({ title, subtitle }) {
  return (
    <div className="section s_p_vid">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 clearfix">
            {title && <h1 className="">{title}</h1>}
            {subtitle && <p className="light">{subtitle}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
