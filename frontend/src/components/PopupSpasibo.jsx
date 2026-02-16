import { popupSpasiboData } from '../data/mockPageData';

export default function PopupSpasibo({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div id="spasibo" className="spasibo">
      <div className="header">{popupSpasiboData.title}</div>
      <div className="p1_msg">{popupSpasiboData.message}</div>
      <a href="#" className="btn b_red" onClick={(e) => { e.preventDefault(); onClose(); }}>
        ЗАКРЫТЬ
      </a>
    </div>
  );
}
