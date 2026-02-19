import { ref } from 'vue'
import axios from 'axios'

export function useRooms() {
  const rooms = ref([])

  const getRooms = async () => {
    try {
      // GET /api/calc/rooms — справочник типов помещений
      const base = typeof window !== 'undefined' ? (window.location.origin || '') : ''
      const url = base ? `${base}/api/calc/rooms` : '/api/calc/rooms'
      const response = await axios.get(url, { withCredentials: true })
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

