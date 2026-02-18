import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ceilingTypes,
  manufacturers,
  areaRange,
  otherPriceMultiplier,
} from '../../data/kalkuljatorData';

export default function SectionCalc() {
  const [typeId, setTypeId] = useState('mat');
  const [madeId, setMadeId] = useState('made1');
  const [areaM2, setAreaM2] = useState(areaRange.default);
  const [subOpen, setSubOpen] = useState(false);

  const type = ceilingTypes.find((t) => t.id === typeId) || ceilingTypes[0];
  const made = manufacturers.find((m) => m.id === madeId) || manufacturers[0];

  const { ourPrice, otherPrice } = useMemo(() => {
    const our = Math.floor(areaM2 * type.pricePerM2 * made.multiplier);
    return { ourPrice: our, otherPrice: Math.floor(our * otherPriceMultiplier) };
  }, [areaM2, type.pricePerM2, made.multiplier]);

  const percent = areaRange.max > areaRange.min
    ? ((areaM2 - areaRange.min) / (areaRange.max - areaRange.min)) * 100
    : 0;

  const handleTypeSelect = (t) => {
    setTypeId(t.id);
    setSubOpen(false);
  };

  return (
    <div className="section s_calc">
      <div className="container">
        <div className="row">
          <div className="col-md-12  clearfix padding0">
            <div className="potplok_calc clearfix ">
              <div className="discount" />
              <div className="p_calc_left col-lg-7">
                <div className="p_type">
                  <div className="hh">Тип потолка:</div>
                  <div className="ul_menu" onClick={() => setSubOpen(!subOpen)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setSubOpen(!subOpen)}>
                    <ul className="calc_menu">
                      <li id="o1" className="active">
                        {type.label}
                      </li>
                    </ul>
                  </div>
                  <div className={`o1 calc_sub ${subOpen ? '' : 'hide'}`}>
                    {ceilingTypes.map((t, idx) => (
                      <div
                        key={t.id}
                        id={t.id}
                        className="o1"
                        style={idx === 0 ? { borderTop: 'none' } : undefined}
                        onClick={() => handleTypeSelect(t)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => e.key === 'Enter' && handleTypeSelect(t)}
                      >
                        {t.label}
                      </div>
                    ))}
                  </div>
                  {ceilingTypes.map((t) => (
                    <div
                      key={'room-' + t.id}
                      className={`room room_${t.id}`}
                      style={typeId === t.id ? undefined : { display: 'none' }}
                    >
                      <img src={t.roomImage} alt={t.label} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="p_calc_right col-lg-5">
                <div className="p_made">
                  <div className="hh ec">Эконом</div>
                  <div className="hh pr">Премиум</div>
                  <div id="made1" className={`flag ${madeId === 'made1' ? 'selected' : ''}`} onClick={() => setMadeId('made1')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setMadeId('made1')}><img src={manufacturers[0].flag} alt="" />Россия</div>
                  <div id="made2" className={`flag ${madeId === 'made2' ? 'selected' : ''}`} onClick={() => setMadeId('made2')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setMadeId('made2')}><img src={manufacturers[1].flag} alt="" />Китай</div>
                  <div id="made3" className={`flag ${madeId === 'made3' ? 'selected' : ''}`} style={{ marginLeft: '30px' }} onClick={() => setMadeId('made3')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setMadeId('made3')}><img src={manufacturers[2].flag} alt="" />Германия</div>
                  <div id="made4" className={`flag ${madeId === 'made4' ? 'selected' : ''}`} onClick={() => setMadeId('made4')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setMadeId('made4')}><img src={manufacturers[3].flag} alt="" />Франция</div>
                  <div id="made5" className={`flag ${madeId === 'made5' ? 'selected' : ''}`} onClick={() => setMadeId('made5')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setMadeId('made5')}><img src={manufacturers[4].flag} alt="" />Бельгия</div>
                </div>
                <div className="square">
                  <div className="hh">Площадь помещения:</div>
                  <div className="p_m2_txt" style={{ float: 'right' }}>М<sup>2</sup> </div>
                  <div className="slider_cont">
                    <div className="p_m2">{areaM2}</div>
                    <div id="slider-horizontal" className="ui-slider ui-slider-horizontal ui-widget ui-widget-content ui-corner-all" style={{ position: 'relative' }}>
                      <div className="ui-slider-range ui-widget-header ui-corner-all ui-slider-range-min" style={{ width: `${percent}%` }} />
                      <span className="ui-slider-handle ui-state-default ui-corner-all" tabIndex={0} style={{ left: `${percent}%` }} />
                      <input
                        type="range"
                        min={areaRange.min}
                        max={areaRange.max}
                        value={areaM2}
                        onChange={(e) => setAreaM2(Number(e.target.value))}
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          width: '100%',
                          height: '100%',
                          margin: 0,
                          opacity: 0,
                          cursor: 'pointer',
                          zIndex: 2,
                        }}
                        aria-label="Площадь м²"
                      />
                    </div>
                  </div>
                </div>
                <div className="itogo_block">
                  <h3>Стоимость потолка:</h3>
                  <div className="all_pr_txt">Цена у всех:</div>
                  <div className="all_pr">{otherPrice}<span> руб.</span><div className="red_line" /></div>
                  <div className="counter_itog_txt">Наша цена:</div>
                  <div className="counter_itog"> <span>{ourPrice}</span> руб.</div>
                  <div className="buy_rassr">
                    <Link to="/dolyami">купить<br />в рассрочку</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
