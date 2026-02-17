/**
 * Форматирование телефона для отображения.
 * Для каждого города можно задать свою маску (в БД или здесь по префиксу).
 * По умолчанию: российский номер 8 (XXX) XXX-XX-XX
 * @param {string} raw - сырой номер, например "89263383279" или "8 926 338 32 79"
 * @returns {string} отформатированный для отображения, например "8 (926) 338-32-79"
 */
export function formatPhoneDisplay(raw) {
  if (!raw || typeof raw !== 'string') return '';
  const digits = raw.replace(/\D/g, '');
  if (digits.length >= 11 && (digits[0] === '8' || digits[0] === '7')) {
    const code = digits.length === 11 ? digits.slice(1, 4) : digits.slice(0, 3);
    const a = digits.length === 11 ? digits.slice(4, 7) : digits.slice(3, 6);
    const b = digits.length === 11 ? digits.slice(7, 9) : digits.slice(6, 8);
    const c = digits.length === 11 ? digits.slice(9, 11) : digits.slice(8, 10);
    return `8 (${code}) ${a}-${b}-${c}`;
  }
  if (digits.length >= 10) {
    return `8 (${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 8)}-${digits.slice(8, 10)}`;
  }
  return raw;
}

/**
 * Телефон для атрибута href="tel:..." (только цифры, без пробелов)
 */
export function formatPhoneHref(raw) {
  if (!raw || typeof raw !== 'string') return '';
  return raw.replace(/\D/g, '');
}

/**
 * Маска для поля ввода телефона: при вводе форматирует как 8 (XXX) XXX-XX-XX.
 * Передавать в onChange: setPhone(formatPhoneInput(e.target.value))
 * Для отправки на сервер использовать значение как есть или normalizePhone(phone).
 */
export function formatPhoneInput(value) {
  if (value == null) return '';
  const digits = String(value).replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits[0] === '7') {
    // +7... → оставляем 10 цифр после 7
    const rest = digits.slice(1, 11);
    if (rest.length <= 3) return `8 (${rest}`;
    if (rest.length <= 6) return `8 (${rest.slice(0, 3)}) ${rest.slice(3)}`;
    return `8 (${rest.slice(0, 3)}) ${rest.slice(3, 6)}-${rest.slice(6, 8)}-${rest.slice(8, 10)}`;
  }
  // 8 или 9 в начале
  if (digits.length <= 1) return digits;
  if (digits.length <= 4) return `8 (${digits.slice(1)}`;
  if (digits.length <= 7) return `8 (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  return `8 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9, 11)}`;
}
