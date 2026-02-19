export default function SectionHowItWorks({ items = [], cta, onZamerClick }) {
  if (!items.length) return null;
  return (
    <div className="section s_how_it_works">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 clearfix">
            <h2 className="s_hiw_title">Как проходит установка натяжного потолка</h2>
            <p className="s_hiw_sub">От заявки до готового потолка — за 1 рабочий день</p>
          </div>
        </div>
        <div className="row">
          <div className="col-sm-12 clearfix">
            <div className="s_hiw_steps">
              {items.map((item, i) => (
                <div key={i} className="s_hiw_step">
                  <div className="s_hiw_step_num">{i + 1}</div>
                  <div className="s_hiw_step_body">
                    <div className="s_hiw_step_title">{item.title}</div>
                    <p className="s_hiw_step_text">{item.text}</p>
                  </div>
                  {i < items.length - 1 && <div className="s_hiw_step_arrow" aria-hidden="true" />}
                </div>
              ))}
            </div>
          </div>
        </div>
        {cta && (
          <div className="row">
            <div className="col-sm-12 clearfix s_hiw_cta_wrap">
              <div className="blue_btn">
                <a href="#" onClick={(e) => { e.preventDefault(); onZamerClick?.(); }}>{cta.text}</a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
