// Директива для маски ввода телефона
export const inputMask = {
  mounted(el, binding) {
    if (binding.value && window.Inputmask) {
      window.Inputmask(binding.value).mask(el)
    }
  },
  updated(el, binding) {
    if (binding.value && window.Inputmask) {
      window.Inputmask(binding.value).mask(el)
    }
  }
}

