/**
 * Секция «Сроки и условия возврата» (s_standart).
 * Разметка и классы — как в шаблоне vozvrat.html.
 */

export default function SectionVozvrat({ data = {} }) {
  const { title = '', blocks = [] } = data;

  return (
    <div className="section s_standart">
      <div className="container">
        <div className="row">
          <div className="col-md-12 clearfix">
            {title && <h1>{title}</h1>}
            {blocks.map((block, i) => {
              if (block.type === 'h3') {
                return <h3 key={i}>{block.text}</h3>;
              }
              if (block.type === 'p') {
                const className = block.className ? ` ${block.className}` : '';
                return block.html ? (
                  <p key={i} className={className.trim() || undefined} dangerouslySetInnerHTML={{ __html: block.html }} />
                ) : (
                  <p key={i} className={className.trim() || undefined}>{block.text}</p>
                );
              }
              if (block.type === 'ul') {
                const className = block.className ? ` ${block.className}` : '';
                return (
                  <ul key={i} className={className.trim() || undefined}>
                    {(block.items || []).map((item, j) => (
                      <li key={j} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                  </ul>
                );
              }
              if (block.type === 'hr') {
                return <hr key={i} />;
              }
              if (block.type === 'br') {
                return <br key={i} />;
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
