// Wrapper для Noty библиотеки
export function noty(type, text) {
  if (window.Noty) {
    new window.Noty({
      theme: 'relax',
      timeout: 2000,
      layout: 'topCenter',
      type: type,
      text: text
    }).show()
  } else {
    console.log(`[${type}] ${text}`)
  }
}

