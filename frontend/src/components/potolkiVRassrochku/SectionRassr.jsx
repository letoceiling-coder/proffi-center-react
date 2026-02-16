/**
 * Секция «Закажи сейчас, плати потом» (s_rassr): заголовок, текст, три блока usl_part.
 * Разметка и классы — как в шаблоне potolki-v-rassrochku.html.
 */

export default function SectionRassr({ data = {} }) {
  const { title = '', intro = '', uslParts = [] } = data;

  return (
    <div className="section s_rassr">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 clearfix">
            {title && <h1 className="">{title}</h1>}
            {intro && <p className="light">{intro}</p>}

            {uslParts.map((part, i) => (
              <div key={i} className="col-md-4 clearfix">
                <div
                  className="usl_part"
                  style={part.extraStyle || undefined}
                >
                  <span className="max">{part.max}</span>
                  <span className="med">{part.med}</span>
                  <br />
                  <span className="small" style={part.smallStyle || undefined}>
                    {part.small}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
