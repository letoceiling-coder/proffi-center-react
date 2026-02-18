import { popupSpasiboData } from '../data/mockPageData';

export default function PopupSpasibo({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      id="spasibo"
      className="spasibo"
      style={{ display: 'block', zIndex: 10001 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="spasibo-title"
    >
      <div id="spasibo-title" className="header">{popupSpasiboData.title}</div>
      <div className="p1_msg">{popupSpasiboData.message}</div>
      <button type="button" className="btn b_red" onClick={onClose}>
        ЗАКРЫТЬ
      </button>
    </div>
  );
}
