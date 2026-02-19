import { ref } from 'vue'
import axios from 'axios'
import { noty } from '../utils/noty'

function getBaseUrl() {
  return typeof window !== 'undefined' ? (window.location.origin || '') : ''
}

export function useClients() {
  const loading = ref(false)
  const error   = ref(null)

  /**
   * Загрузить список клиентов оператора.
   * @param {string} search — строка поиска (имя / телефон)
   */
  async function fetchClients(search = '') {
    loading.value = true
    error.value   = null
    try {
      const params = search ? { search } : {}
      const { data } = await axios.get(`${getBaseUrl()}/api/calc/clients`, {
        params,
        withCredentials: true,
      })
      return data
    } catch (e) {
      error.value = e?.response?.data?.error || 'Ошибка загрузки клиентов'
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Создать нового клиента (+ первый адрес).
   * @param {{ name, phone, address }} clientData
   * @returns {{ client, address } | null}
   */
  async function createClient(clientData) {
    if (!clientData.name?.trim()) {
      noty('warning', 'Заполните имя клиента')
      return null
    }

    loading.value = true
    error.value   = null
    try {
      const { data } = await axios.post(`${getBaseUrl()}/api/calc/clients`, {
        name:    clientData.name.trim(),
        phone:   clientData.phone?.trim() || null,
        address: clientData.address?.trim() || null,
      }, { withCredentials: true })

      noty('success', 'Клиент создан')
      return data  // { client, address }
    } catch (e) {
      const msg = e?.response?.data?.message || 'Ошибка создания клиента'
      noty('error', msg)
      error.value = msg
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Обновить клиента.
   */
  async function updateClient(id, data) {
    loading.value = true
    try {
      const { data: updated } = await axios.put(
        `${getBaseUrl()}/api/calc/clients/${id}`,
        data,
        { withCredentials: true }
      )
      return updated
    } catch (e) {
      noty('error', 'Ошибка обновления клиента')
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Загрузить адреса клиента.
   */
  async function fetchAddresses(clientId) {
    try {
      const { data } = await axios.get(
        `${getBaseUrl()}/api/calc/clients/${clientId}/addresses`,
        { withCredentials: true }
      )
      return data
    } catch (e) {
      noty('error', 'Ошибка загрузки адресов')
      return []
    }
  }

  /**
   * Добавить адрес клиенту.
   */
  async function addAddress(clientId, address) {
    if (!address?.trim()) {
      noty('warning', 'Заполните адрес')
      return null
    }
    loading.value = true
    try {
      const { data } = await axios.post(
        `${getBaseUrl()}/api/calc/clients/${clientId}/addresses`,
        { address: address.trim() },
        { withCredentials: true }
      )
      noty('success', 'Адрес добавлен')
      return data
    } catch (e) {
      noty('error', 'Ошибка добавления адреса')
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    fetchClients,
    createClient,
    updateClient,
    fetchAddresses,
    addAddress,
  }
}
