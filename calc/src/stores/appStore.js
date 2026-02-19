import { ref, reactive } from 'vue'
import axios from 'axios'
import { useRooms } from '../composables/useRooms'
import { useSmeta } from '../composables/useSmeta'

function createAppStore() {
  // ──── Секции ────
  const activeSection = ref('main-1')

  // ──── Комнаты (справочник) ────
  const { getRooms, rooms } = useRooms()

  // ──── Смета ────
  const { exitInSmeta, exitInSmetaAll, listGroop, listGroopRedactor } = useSmeta()

  // ──── Выбранный потолок (для сметы) ────
  const ceilingId   = ref(null)
  const ceilingOne  = ref(true)
  const ceilingAll  = ref(false)

  // ──── Флаги сметы ────
  const smataClient    = ref(true)
  const smataMontaj    = ref(false)
  const smataMaterial  = ref(false)
  const smataWorks     = ref(true)
  const smataMaterials = ref(false)

  // ──── Клиент / адрес / помещение (текущий сеанс работы) ────
  const currentClient  = ref(null)   // { id, name, phone, addresses: [...] }
  const currentAddress = ref(null)   // { id, address }
  const currentRoomId  = ref(null)   // id из calc_rooms
  const currentRoomNote = ref('')    // произвольное уточнение

  // ──── Список клиентов оператора ────
  const clientsList    = ref([])
  const clientsLoading = ref(false)

  // ──── Чертежи текущего клиента ────
  const drawings        = ref([])
  const drawingsLoading = ref(false)

  // ──── Вспомогательные ────
  function getBaseUrl() {
    return typeof window !== 'undefined' ? (window.location.origin || '') : ''
  }

  // ──── Загрузить список клиентов ────
  async function fetchClients(search = '') {
    clientsLoading.value = true
    try {
      const base = getBaseUrl()
      const params = search ? { search } : {}
      const { data } = await axios.get(`${base}/api/calc/clients`, { params, withCredentials: true })
      clientsList.value = data
    } catch (e) {
      console.error('fetchClients error:', e)
      clientsList.value = []
    } finally {
      clientsLoading.value = false
    }
  }

  // ──── Загрузить чертежи клиента ────
  async function fetchDrawings(clientId) {
    drawingsLoading.value = true
    try {
      const base = getBaseUrl()
      const url  = clientId
        ? `${base}/api/calc/clients/${clientId}/drawings`
        : `${base}/api/calc/drawings`
      const { data } = await axios.get(url, { withCredentials: true })
      drawings.value = data
    } catch (e) {
      console.error('fetchDrawings error:', e)
      drawings.value = []
    } finally {
      drawingsLoading.value = false
    }
  }

  // ──── Установить текущего клиента + адрес ────
  function setCurrentClient(client, addressId = null) {
    currentClient.value = client
    if (client && addressId) {
      currentAddress.value = (client.addresses || []).find(a => a.id === addressId) ?? null
    } else {
      currentAddress.value = null
    }
  }

  function setCurrentAddress(address) {
    currentAddress.value = address
  }

  function clearCurrentClient() {
    currentClient.value  = null
    currentAddress.value = null
    currentRoomId.value  = null
    currentRoomNote.value = ''
  }

  // ──── Старые методы (совместимость) ────
  function clearElems() {
    // Сброс состояния при открытии нового чертежа
  }

  function getStorageReturn() {
    const stored = localStorage.getItem('calc_draft_client')
    if (!stored) return
    try {
      const parsed = JSON.parse(stored)
      if (parsed.client)  currentClient.value  = parsed.client
      if (parsed.address) currentAddress.value = parsed.address
      if (parsed.room_id) currentRoomId.value  = parsed.room_id
    } catch (e) {
      console.error('getStorageReturn error:', e)
    }
  }

  function saveDraftClient() {
    localStorage.setItem('calc_draft_client', JSON.stringify({
      client:  currentClient.value,
      address: currentAddress.value,
      room_id: currentRoomId.value,
    }))
  }

  const setCeilingOne = (value) => {
    ceilingOne.value = value
    ceilingAll.value = !value
    if (value) exitInSmeta(ceilingId.value)
    else       exitInSmetaAll()
  }

  const setSmataClient = (value) => {
    smataClient.value   = value
    smataMontaj.value   = false
    smataMaterial.value = false
    exitInSmeta(ceilingId.value)
  }

  const setSmataMontaj = (value) => {
    smataClient.value   = false
    smataMontaj.value   = value
    smataMaterial.value = false
    exitInSmeta(ceilingId.value)
  }

  const setSmataMaterial = (value) => {
    smataClient.value   = false
    smataMontaj.value   = false
    smataMaterial.value = value
    exitInSmeta(ceilingId.value)
  }

  const setSmataWorks = (value) => {
    smataWorks.value    = value
    smataMaterials.value = !value
    listGroop(value ? 0 : 1)
  }

  return {
    // Секции
    activeSection,

    // Справочник комнат
    rooms,
    getRooms,

    // Потолок / смета
    ceilingId,
    ceilingOne,
    ceilingAll,
    smataClient,
    smataMontaj,
    smataMaterial,
    smataWorks,
    smataMaterials,

    // Клиент сеанса
    currentClient,
    currentAddress,
    currentRoomId,
    currentRoomNote,
    setCurrentClient,
    setCurrentAddress,
    clearCurrentClient,
    saveDraftClient,

    // Список клиентов
    clientsList,
    clientsLoading,
    fetchClients,

    // Чертежи
    drawings,
    drawingsLoading,
    fetchDrawings,

    // Совместимость
    clearElems,
    getStorageReturn,

    // Смета
    setCeilingOne,
    setSmataClient,
    setSmataMontaj,
    setSmataMaterial,
    setSmataWorks,
    exitInSmeta,
    exitInSmetaAll,
    listGroop,
    listGroopRedactor,
  }
}

// ──── Singleton: один экземпляр на всё приложение ────
// reactive() автоматически разворачивает вложенные refs:
// store.rooms вернёт массив, store.currentClient вернёт объект/null, и т.д.
let _instance = null

export function useAppStore() {
  if (!_instance) _instance = reactive(createAppStore())
  return _instance
}
