export default function SectionSimpleText({ h1, h2, h3, content, paragraphs = [], list = [], list2 = [], paragraphs2 = [] }) {
  return (
    <div className="section s_simple_text">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 clearfix">
            <div className="s_simple_text_inner">
              {h1 && <h1 className="s_simple_text_h1">{h1}</h1>}
              {h2 && <h2 className="s_simple_text_h2">{h2}</h2>}
              {h3 && <h3 className="s_simple_text_h3">{h3}</h3>}
              {content && (
                <div className="s_simple_text_content">
                  {content.split(/\n\n+/).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              )}
              {paragraphs?.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {list?.length > 0 && (
                <ul className="s_simple_text_list ulli">
                  {list.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
              {paragraphs2?.map((p, i) => (
                <p key={`p2-${i}`}>{p}</p>
              ))}
              {list2?.length > 0 && (
                <ul className="s_simple_text_list ulli">
                  {list2.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
