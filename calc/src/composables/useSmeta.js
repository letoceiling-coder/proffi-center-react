import { ref } from 'vue'

export function useSmeta() {
  const exitInSmeta = (ceilingId) => {
    // Реализация функции exitInSmeta
    // Замените на вашу реальную логику
    console.log('exitInSmeta', ceilingId)
  }

  const exitInSmetaAll = () => {
    // Реализация функции exitInSmetaAll
    console.log('exitInSmetaAll')
  }

  const listGroop = (type = 0) => {
    // Реализация функции listGroop
    console.log('listGroop', type)
  }

  const listGroopRedactor = () => {
    // Реализация функции listGroopRedactor
    console.log('listGroopRedactor')
  }

  return {
    exitInSmeta,
    exitInSmetaAll,
    listGroop,
    listGroopRedactor
  }
}

