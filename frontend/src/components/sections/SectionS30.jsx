import { Link } from 'react-router-dom';

export default function SectionS30({ data }) {
  if (!data) return null;
  const { title, list, btnText, btnHref } = data;

  return (
    <div className="section s30">
      <div className="content">
        <div className="txt">
          <h4>{title}</h4>
          <ul>
            {list?.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          <Link className="btn b_blue" to={btnHref || '#'}>{btnText}</Link>
        </div>
      </div>
    </div>
  );
}
