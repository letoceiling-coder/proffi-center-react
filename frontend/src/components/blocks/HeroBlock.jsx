import { Link } from 'react-router-dom';

export default function HeroBlock({ data }) {
  const { title, subtitle, cta_text, cta_url } = data;
  if (!title) return null;
  return (
    <div className="section block-hero">
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <h1 className="block-hero__title">{title}</h1>
            {subtitle && <p className="block-hero__subtitle">{subtitle}</p>}
            {cta_text && (
              cta_url ? (
                <Link to={cta_url} className="block-hero__cta">{cta_text}</Link>
              ) : (
                <span className="block-hero__cta">{cta_text}</span>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
