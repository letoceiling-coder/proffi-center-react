export default function SectionWhyUs({ items = [] }) {
  if (!items.length) return null;
  return (
    <div className="section s_why_us">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 clearfix">
            <h2 className="s_why_us_title">Почему нас выбирают 13 лет подряд</h2>
            <p className="s_why_us_sub">Факты, а не обещания — то, что отличает Proffi Center от остальных</p>
          </div>
        </div>
        <div className="row s_why_us_grid">
          {items.map((item, i) => (
            <div key={i} className="col-sm-6 col-md-4">
              <div className="s_why_us_card">
                <div className="s_why_us_num">{item.value}</div>
                <div className="s_why_us_label">{item.label}</div>
                <p className="s_why_us_text">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
