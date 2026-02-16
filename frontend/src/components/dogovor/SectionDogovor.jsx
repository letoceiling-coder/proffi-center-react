/**
 * Секция «Договор» (s_akcii): заголовок, текст, блок с картинкой и ссылкой на документ.
 * Разметка и классы — как в шаблоне dogovor.html.
 */

export default function SectionDogovor({ data = {} }) {
  const {
    title = '',
    introParagraphs = [],
    blockTitle = '',
    blockParagraphs = [],
    contractBlock = {},
  } = data;

  const {
    image = '',
    imageAlt = '',
    docLink = '',
    docTitle = '',
    descriptionBefore = '',
    linkText = '',
  } = contractBlock;

  return (
    <div className="section s_akcii">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 clearfix">
            {title && <h1 className="">{title}</h1>}
            {introParagraphs.map((html, i) => (
              <p key={i} className="light" dangerouslySetInnerHTML={{ __html: html }} />
            ))}
            {blockTitle && <h2>{blockTitle}</h2>}
            {blockParagraphs.map((html, i) => (
              <p key={i} className="light" dangerouslySetInnerHTML={{ __html: html }} />
            ))}

            <div className="row ak_marg" id="ak_marg">
              <div className="col-sm-12 clearfix">
                <div className="ak_block clearfix">
                  <div className="akb_img_left">
                    <a href={docLink}>
                      <img src={image} alt={imageAlt || docTitle} />
                    </a>
                  </div>
                  <div className="akb_txt_right">
                    <h3>{docTitle}</h3>
                    <p>
                      {descriptionBefore}
                      <br />
                      {docLink && linkText && (
                        <a href={docLink}>{linkText}</a>
                      )}
                    </p>
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
