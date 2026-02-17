export default function PriceTableBlock({ data }) {
  const { title, subtitle, rows } = data;
  if (!rows?.length) return null;
  return (
    <div className="section block-pr-table">
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            {title && <h2>{title}</h2>}
            {subtitle && <p className="light">{subtitle}</p>}
            <table className="pr_table">
              <tbody>
                {rows.map((row, i) => {
                  const Tag = row.isHeader ? 'th' : 'td';
                  return (
                    <tr key={i}>
                      <Tag className="t_grey">{row.characteristic}</Tag>
                      <Tag className="t_yellow center">{row.us ?? ''}</Tag>
                      <Tag className="t_grey center t_hide">{row.other ?? ''}</Tag>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
