export default function Footer({ data }) {
  if (!data) return null;
  const { discountText, phone, email, siteUrl, copyright, legalLink } = data;

  const openLegal = (e) => {
    e?.preventDefault?.();
    window.open(legalLink, '_blank', 'width=500,height=500');
  };

  return (
    <div className="section s8">
      <div className="container">
        <div className="row">
          <div className="col-md-12 clearfix">
            <div className="footer black center">
              <div className="black d1">
                {discountText} <span className="comagic_phone">{phone}</span>
              </div>
              <div className="black d2">
                <div itemProp="email">{email}</div>
                <link itemProp="url" href={siteUrl} />
              </div>
              <div className="d3">© {new Date().getFullYear()} {copyright}</div>
              <div className="d4">
                <a href={legalLink} className="b-link" onClick={openLegal}>Правовая информация</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
