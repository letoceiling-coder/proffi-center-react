export default function SimpleTextBlock({ data }) {
  const { html, text } = data;
  if (html) {
    return (
      <div className="section block-simple-text">
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <div className="block-simple-text__content" dangerouslySetInnerHTML={{ __html: html }} />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (text) {
    return (
      <div className="section block-simple-text">
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <div className="block-simple-text__content">
                {text.split(/\n\n+/).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
