import LinkBlock from './LinkBlock';

export default function SectionLinks({ items = [] }) {
  const rows = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }

  return (
    <div className="section s_links">
      <div className="container">
        {rows.map((row, rowIndex) => (
          <div className="row" key={rowIndex}>
            {row.map((item) => (
              <LinkBlock
                key={item.id}
                title={item.title}
                href={item.href}
                image={item.image}
                price={item.price}
                rating={item.rating}
                reviewCount={item.reviewCount}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
