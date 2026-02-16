/**
 * Секция «Оформите рассрочку» (s_buy_now): шаги с картинками.
 * Разметка и классы — как в шаблоне potolki-v-rassrochku.html.
 */

export default function SectionBuyNow({ data = {} }) {
  const { title = '', steps = [] } = data;

  return (
    <div className="section s_buy_now">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 clearfix">
            {title && <h1 className="">{title}</h1>}

            <div className="buy_now">
              {steps.map((step, i) => (
                <div
                  key={i}
                  className={`${step.blockClass} now_blocks`}
                >
                  {step.label && <p>{step.label}</p>}
                  {step.image && (
                    <img
                      src={step.image}
                      alt=""
                      style={step.imageStyle || undefined}
                    />
                  )}
                  {step.content && (
                    <div dangerouslySetInnerHTML={{ __html: step.content }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
