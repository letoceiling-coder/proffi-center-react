import { ref } from 'vue'
import axios from 'axios'

export function useCategories() {
  const groups = ref([])
  const units = ref([])
  const communications = ref([])

  const loadData = async () => {
    try {
      // Загрузка данных категорий, единиц измерения и коммуникаций
      // Замените на ваши реальные API endpoints
      const [groupsRes, unitsRes, commRes] = await Promise.all([
        axios.post('/', { success: 'getGroups' }),
        axios.post('/', { success: 'getUnits' }),
        axios.post('/', { success: 'getCommunications' })
      ])
      
      if (groupsRes.data) groups.value = groupsRes.data
      if (unitsRes.data) units.value = unitsRes.data
      if (commRes.data) communications.value = commRes.data
    } catch (error) {
      console.error('Error loading categories data:', error)
    }
  }

  const addCategory = async (name) => {
    try {
      const response = await axios.post('/', {
        success: 'addCategory',
        name: name
      })
      if (response.data) {
        groups.value.push(response.data)
      }
    } catch (error) {
      console.error('Error adding category:', error)
    }
  }

  const deleteCategory = async (id) => {
    try {
      await axios.post('/', {
        success: 'deleteCategory',
        id: id
      })
      groups.value = groups.value.filter(g => g.id !== id)
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  return {
    groups,
    units,
    communications,
    loadData,
    addCategory,
    deleteCategory
  }
}

