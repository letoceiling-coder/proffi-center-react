/**
 * Форма «Оставьте отзыв» (s24 .zakaz_vp).
 * Валидация: имя и текст обязательны. Отправка в API с опциональными фото, в Telegram приходят фото для модерации.
 */
import { useState, useRef } from 'react';
import { useSite } from '../../context/SiteContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';
import { submitReview } from '../../api/public.js';
import { isPhoneValid, normalizePhone } from '../../utils/formValidation.js';
import { formatPhoneInput } from '../../utils/phoneFormat.js';

const ACCEPT_IMAGES = '.gif,.jpg,.jpeg,.png,.webp';

export default function SectionOtzyvyForm({ legalLink }) {
  const { site, selectedCitySlug } = useSite();
  const { show } = useNotification();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const trimmedName = name?.trim() || '';
    const trimmedText = text?.trim() || '';
    if (!trimmedName) {
      show('Укажите имя', 'error');
      return;
    }
    if (!trimmedText) {
      show('Напишите отзыв', 'error');
      return;
    }
    if (trimmedText.length < 100) {
      show('Текст отзыва должен быть не менее 100 символов', 'error');
      return;
    }
    const trimmedPhone = phone?.trim() || '';
    if (!trimmedPhone) {
      show('Укажите телефон', 'error');
      return;
    }
    if (!isPhoneValid(phone)) {
      show('Введите корректный номер телефона (не менее 10 цифр)', 'error');
      return;
    }
    if (sending) return;
    setSending(true);
    try {
      const files = fileInputRef.current?.files;
      const photos = files && files.length > 0 ? Array.from(files) : undefined;
      await submitReview({
        author_name: trimmedName,
        text: trimmedText,
        phone: normalizePhone(phone) || trimmedPhone,
        city_slug: site?.city?.slug ?? selectedCitySlug ?? undefined,
        photos,
      });
      show('Спасибо! Отзыв отправлен на модерацию.', 'success');
      setName('');
      setPhone('');
      setText('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      show(err?.message || 'Не удалось отправить', 'error');
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
            <input className="v_tel" type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(formatPhoneInput(e.target.value))} placeholder="8 (999) 123-45-67" />
          </div>
        </div>
        <div className="razmetka1">
          <div className="low_text">
            <textarea className="v_text" placeholder="Отзыв (не менее 100 символов)" value={text} onChange={(e) => setText(e.target.value)} minLength={100} />
          </div>
        </div>
        <div className="box">
          <input ref={fileInputRef} type="file" name="photos[]" id="file-1" accept={ACCEPT_IMAGES} className="inputfile inputfile-1" data-multiple-caption="{count} загружено" multiple />
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
