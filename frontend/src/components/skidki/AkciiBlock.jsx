/**
 * Блок одной акции (ak_block): разметка 1 в 1 как в шаблоне skidki-na-potolki.html
 * layout 'left' → akb_img_left + akb_txt_right + badger_r
 * layout 'right' → akb_img_right + akb_txt_left + badger_l
 */
export default function AkciiBlock({ item }) {
  const { image, title, text, layout } = item;
  const isLeft = layout === 'left';

  return (
    <div className="ak_block clearfix">
      {isLeft ? (
        <>
          <div className="akb_img_left">
            <img src={image} alt="" />
          </div>
          <div className="akb_txt_right">
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
          <div className="badger_r" />
        </>
      ) : (
        <>
          <div className="akb_img_right">
            <img src={image} alt="" />
          </div>
          <div className="akb_txt_left">
            <h3>{title}</h3>
            <p>{text}</p>
          </div>
          <div className="badger_l" />
        </>
      )}
    </div>
  );
}
