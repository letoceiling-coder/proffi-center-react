import { priceTableRows } from '../../data/kalkuljatorData';

export default function SectionCalcTable() {
  return (
    <div className="section s_otable">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 clearfix">
            <table>
              <tbody>
                <tr>
                  <th>Тип натяжного<br />потолка</th>
                  <th>Срок<br />изготовления</th>
                  <th>Цена за 1м<sup>2</sup></th>
                  <th>Гарантия</th>
                  <th className="small_hide" style={{ border: 'none' }}>Производитель</th>
                </tr>
                {priceTableRows.map((row, i) => (
                  <tr key={i} style={i === priceTableRows.length - 1 ? { border: 'none' } : undefined}>
                    <td>{row.type}</td>
                    <td>{row.term}</td>
                    <td>
                      {i === 0 && <div className="o_best_price" />}
                      <div className="price">
                        <span>от {row.priceFrom} </span>
                        <span><i className="rub3" /></span>
                      </div>
                    </td>
                    <td><img src={row.warranty} alt="" /></td>
                    <td className="small_hide" style={{ border: 'none' }}><img src={row.producer} alt="" /></td>
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
