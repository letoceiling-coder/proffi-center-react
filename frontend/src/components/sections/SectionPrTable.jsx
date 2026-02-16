export default function SectionPrTable({ data }) {
  if (!data) return null;
  const { title, subtitle, ourPriceLabel, ourPriceFrom, otherPriceLabel, otherPriceFrom, rows, starFull, starEmpty } = data;

  const renderCell = (row, key) => {
    if (row.isHeader) {
      if (key === 'us') return row.us != null ? <>{String(row.us).split('\n').map((s, i) => i === 0 ? <span key={i}>{s}</span> : <span key={i}><br />{s}</span>)}</> : <>{ourPriceLabel}<br /><span>{ourPriceFrom}</span></>;
      if (key === 'other') return row.other != null ? <>{String(row.other).split('\n').map((s, i) => i === 0 ? <span key={i}>{s}</span> : <span key={i}><br />{s}</span>)}</> : <>{otherPriceLabel}<br /><span>{otherPriceFrom}</span></>;
      return row.characteristic;
    }
    if (row.filledStarsUs != null && key === 'us' && row.characteristic !== 'Экологичность') {
      return (
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <img key={i} src={i < row.filledStarsUs ? starFull : starEmpty} alt="" />
          ))}
        </>
      );
    }
    if (row.filledStarsOther != null && key === 'other' && row.characteristic !== 'Экологичность') {
      return (
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <img key={i} src={i < row.filledStarsOther ? starFull : starEmpty} alt="" />
          ))}
        </>
      );
    }
    if (key === 'us') return row.us ?? '';
    if (key === 'other') return row.other ?? '';
    return row.characteristic;
  };

  return (
    <div className="section s_pr_table">
      <div className="container">
        <div className="row">
          <div className="col-md-12 clearfix">
            {title && <h2>{title}</h2>}
            {subtitle && <p className="light">{subtitle}</p>}
            <table className="pr_table">
              <tbody>
                {rows?.map((row, i) => {
                  const Tag = row.isHeader ? 'th' : 'td';
                  return (
                    <tr key={i}>
                      <Tag className="t_grey">{row.characteristic}</Tag>
                      <Tag className="t_yellow center">{renderCell(row, 'us')}</Tag>
                      <Tag className="t_grey center t_hide">{renderCell(row, 'other')}</Tag>
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
