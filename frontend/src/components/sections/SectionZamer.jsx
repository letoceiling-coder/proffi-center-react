export default function SectionZamer({ items = [] }) {
  return (
    <div className="section s_zamer">
      <div className="container">
        <div className="row">
          {items.map((item, i) => (
            <div key={i} className="col-sm-6 clearfix">
              <div className="z_block_img">
                <img src={item.image} alt="" />
              </div>
              <div className="z_block_txt" style={{ width: '293px', margin: '0 auto' }}>
                <p className="ph">{item.title}</p>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
