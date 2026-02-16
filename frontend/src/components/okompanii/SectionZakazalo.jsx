/**
 * Секция «В Январе потолки заказали N человек» (s_zakazalo).
 * Разметка 1 в 1 как в шаблоне o-kompanii.html.
 */
export default function SectionZakazalo({ data }) {
  const { yLabelLines, blocks } = data;
  return (
    <section className="section s_zakazalo">
      <div className="container">
        <div className="row">
          <div className="col-md-12 clearfix">
            <div className="y_label">
              {yLabelLines.map((line, i) => (
                <span key={i}>{line}<br /></span>
              ))}
            </div>
            <div className="z_blocks">
              {blocks.map((block, i) => (
                <div key={i} className="z_block">
                  {block.text.map((t, j) => (
                    <span key={j}>{t}<br /></span>
                  ))}
                  <img src={block.image} alt="" />
                  <br />
                  <span>{block.percent}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
