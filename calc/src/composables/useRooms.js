import { ref } from 'vue'
import axios from 'axios'

export function useRooms() {
  const rooms = ref([])

  const getRooms = async () => {
    try {
      // Используем прокси через Vite или прямой URL к backend
      // В режиме разработки используем прокси, в production - прямой URL
      const apiUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://calc.gm-vrn.ru/')
      const response = await axios.post(apiUrl, {
        success: 'getRooms'
      })
      if (response.data) {
        rooms.value = response.data
      }
    } catch (error) {
      console.error('Error fetching rooms:', error)
      // В режиме разработки просто логируем ошибку и используем пустой массив
      console.warn('API недоступен, используем пустой массив')
      rooms.value = []
    }
  }

  return {
    rooms,
    getRooms
  }
}

