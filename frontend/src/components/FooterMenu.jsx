import { Link } from 'react-router-dom';
import { useMenu } from '../context/MenuContext.jsx';
import { footerMenuData as defaultItems } from '../data/mockPageData';

export default function FooterMenu({ items: itemsProp }) {
  const { footerMenu } = useMenu();
  const items = itemsProp ?? (footerMenu?.length ? footerMenu : defaultItems);
  return (
    <div className="section s23">
      <div className="container">
        <div className="row">
          <div className="col-md-12 clearfix">
            <div className="footer_menu">
              {items.map((item, i) => (
                <div key={i} className="col-sm-3 col-xs-6">
                  <div className={`f_block fm${i + 1}`}>
                    <Link to={item.href}>{item.title}</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
