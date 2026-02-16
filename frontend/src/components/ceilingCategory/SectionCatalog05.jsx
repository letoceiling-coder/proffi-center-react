/**
 * Блок таблицы цен на странице категории (catalog-05).
 */

export default function SectionCatalog05({ title = '', rows = [] }) {
  if (!rows.length) return null;
  return (
    <div className="catalog-05">
      <div className="container">
        <div className="row">
          <div className="col-xs-12">
            {title && <h2 itemProp="about">{title}</h2>}
          </div>
        </div>
        <div className="row">
          <div className="col-xs-12">
            <table className="table">
              <thead>
                <tr>
                  <th>Наименование</th>
                  <th width="120">Ед. изм.</th>
                  <th width="164">Цена</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i}>
                    <td>{row.name}</td>
                    <td>{row.unit}</td>
                    <td>{row.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
