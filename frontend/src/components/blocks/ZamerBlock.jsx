export default function ZamerBlock({ data }) {
  const { enabled } = data;
  if (enabled === false) return null;
  return (
    <div className="section block-zamer">
      <div className="container">
        <div className="row">
          <div className="col-sm-12">
            <p className="block-zamer__title">Бесплатный замер</p>
            <p>Инженер компании произведет точный замер и расчет стоимости заказа.</p>
            <button type="button" className="btn-zamer">
              Заказать замер
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
