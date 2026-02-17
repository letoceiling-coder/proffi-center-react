/**
 * Форма «Оставьте отзыв» (s24 .zakaz_vp).
 * Валидация: имя и текст обязательны. Отправка в API, отзыв на модерации (Telegram).
 */
import { useState } from 'react';
import { useSite } from '../../context/SiteContext.jsx';
import { submitReview } from '../../api/public.js';

export default function SectionOtzyvyForm({ legalLink }) {
  const { site } = useSite();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError('');
    const trimmedName = name?.trim() || '';
    const trimmedText = text?.trim() || '';
    if (!trimmedName) {
      setError('Укажите имя');
      return;
    }
    if (!trimmedText) {
      setError('Напишите отзыв');
      return;
    }
    if (sending) return;
    setSending(true);
    try {
      await submitReview({
        author_name: trimmedName,
        text: trimmedText,
        phone: phone?.trim() || undefined,
        city_slug: site?.city?.slug ?? selectedCitySlug ?? undefined,
      });
      setSent(true);
      setName('');
      setPhone('');
      setText('');
    } catch (err) {
      setError(err?.message || 'Не удалось отправить');
    }
    setSending(false);
  };

  const openLegal = (e) => {
    e?.preventDefault?.();
    if (legalLink) window.open(legalLink, '_blank', 'width=500,height=500');
  };

  return (
    <div className="zakaz_vp" id="callback3otz">
      <div className="zagl-otz">Оставьте отзыв</div>
      <form id="my_form" method="post" onSubmit={handleSubmit}>
        <div className="razmetka1">
          <div className="low_name">
            <input className="v_name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ваше имя" />
          </div>
        </div>
        <div className="razmetka1">
          <div className="low_tel">
            <input className="v_tel" type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Телефон" />
          </div>
        </div>
        <div className="razmetka1">
          <div className="low_text">
            <textarea className="v_text" placeholder="Отзыв" value={text} onChange={(e) => setText(e.target.value)} />
          </div>
        </div>
        <div className="box">
          <input type="file" name="multi_img_file[]" id="file-1" accept=".gif,.jpg,.jpeg,.png,.svg" className="inputfile inputfile-1" data-multiple-caption="{count} Загруженых файлов" multiple />
          <label htmlFor="file-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="17" viewBox="0 0 20 17">
              <path d="M10 0l-5.2 4.9h3.3v5.1h3.8v-5.1h3.3l-5.2-4.9zm9.3 11.5l-3.2-2.1h-2l3.4 2.6h-3.5c-.1 0-.2.1-.2.1l-.8 2.3h-6l-.8-2.2c-.1-.1-.1-.2-.2-.2h-3.6l3.4-2.6h-2l-3.2 2.1c-.4.3-.7 1-.6 1.5l.6 3.1c.1.5.7.9 1.2.9h16.3c.6 0 1.1-.4 1.3-.9l.6-3.1c.1-.5-.2-1.2-.7-1.5z" />
            </svg>{' '}
            <span>Загрузить файл&hellip;</span>
          </label>
        </div>
        <div className="blue_btn">
          <a href="#" onClick={handleSubmit}>{sending ? 'Отправка…' : 'Отправить'}</a>
        </div>
      </form>
      <div className="prav-info">
        Вписывая телефон, вы подтверждаете свое совершеннолетие, соглашаетесь на обработку персональных данных в соответствии с{' '}
        <a href={legalLink} className="b-link" onClick={openLegal}>Правовой информацией</a>
      </div>
    </div>
  );
}
