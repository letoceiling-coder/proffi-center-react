import { ref } from 'vue'
import { noty } from '../utils/noty'

export function useClients() {
  const newClient = ref([])
  const userClient = ref(false)
  const userClientAdress = ref([])
  const maxClient = ref(1)
  const max = ref(1)

  const clearElems = () => {
    // Очистка элементов формы
    // Реализация зависит от вашей логики
  }

  const getStorageReturn = () => {
    const stored = localStorage.getItem('newClient')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        newClient.value = parsed.newClient || []
        userClient.value = parsed.userClient || false
        userClientAdress.value = parsed.userClientAdress || []
      } catch (e) {
        console.error('Error parsing stored data:', e)
      }
    }
  }

  const saveClient = (clientData) => {
    const error = ref(false)
    
    if (!clientData.name) {
      noty('warning', 'Заполните Имя')
      error.value = true
    }
    
    if (!clientData.phone) {
      noty('warning', 'Заполните телефон')
      error.value = true
    } else if (clientData.phone.indexOf('_') !== -1) {
      noty('warning', 'Номер телефона заполнен не полностью')
      error.value = true
    }
    
    if (!clientData.adress) {
      noty('warning', 'Заполните адрес')
      error.value = true
    }
    
    if (error.value) return false

    // Логика сохранения клиента (аналогично оригинальному коду)
    if (userClient.value === false) {
      userClient.value = []
      maxClient.value = 1

      userClient.value.push({
        id: maxClient.value,
        user_id: window.user_id,
        name: clientData.name,
        phone: clientData.phone
      })
      
      max.value = 1
      userClientAdress.value.push({
        id: max.value,
        user_id: window.user_id,
        client_id: maxClient.value,
        adress: clientData.adress
      })
      
      newClient.value.push({
        room_id: clientData.room_id,
        client_id: maxClient.value,
        id_user: window.user_id,
        name: clientData.name,
        phone: clientData.phone,
        adress: clientData.adress,
        adress_id: max.value,
        newCeiling: true,
        newClient: true,
        newAdress: true
      })
      
      if (window.showNoty) {
        noty('success', 'Создан новый клиент')
        noty('success', 'Добавлен новый адрес')
        noty('success', 'Создан новый чертеж')
      }
    } else {
      // Логика для существующего клиента
      const existingClient = userClient.value.find(
        item => item.name === clientData.name && item.phone === clientData.phone
      )
      
      if (existingClient) {
        // Обработка существующего клиента
        // ... (полная логика из оригинального кода)
      } else {
        // Создание нового клиента
        // ... (полная логика из оригинального кода)
      }
    }

    return true
  }

  return {
    newClient,
    userClient,
    userClientAdress,
    maxClient,
    max,
    clearElems,
    getStorageReturn,
    saveClient
  }
}

