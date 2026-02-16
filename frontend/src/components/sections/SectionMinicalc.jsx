import { useState, useMemo } from 'react';

/**
 * Мини-калькулятор стоимости натяжного потолка (s_minicalc): слайдер площади, цена за м², итог.
 */
export default function SectionMinicalc({ title, label, min = 1, max = 100, value: initialValue, pricePerM2 = 99, cenaByType, phone, phoneLabel }) {
  const price = cenaByType != null ? cenaByType : pricePerM2;
  const [area, setArea] = useState(initialValue != null ? Number(initialValue) : 10);
  const total = useMemo(() => Math.round(area * price), [area, price]);

  return (
    <div className="section s_minicalc">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 clearfix">
            {title && <h5>{title}</h5>}
            <div className="mc_block clearfix">
              <div className="mc_input_place clearfix">
                {label && <div className="mc_label">{label}</div>}
                <input
                  type="number"
                  min={min}
                  max={max}
                  value={area}
                  onChange={(e) => setArea(Math.min(max, Math.max(min, Number(e.target.value) || min)))}
                />
              </div>
              <div className="mc_slider_place clearfix">
                <div className="txt t1">{min}</div>
                <input
                  type="range"
                  className="mc_slider_range"
                  min={min}
                  max={max}
                  value={area}
                  onChange={(e) => setArea(Number(e.target.value))}
                />
                <div className="txt t2">{max}</div>
              </div>
              <div className="mc_price_place">
                <div className="mc_price" id="mc_price">
                  {total}<span> руб.</span>
                </div>
              </div>
            </div>
            {phoneLabel && (
              <p>
                {phoneLabel}
                {phone && (
                  <> <span className="comagic_phone">{phone}</span></>
                )}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
