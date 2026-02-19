<template>
  <Teleport to="body">
    <div
      id="popup_client"
      class="client-popup-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="client-popup-title"
    >
      <div class="client-popup-box">
        <div v-if="step === 1">
          <div class="pcp-header">
            <span id="client-popup-title" class="pcp-title">Выбор клиента</span>
          </div>

          <div v-if="newClientMode" class="pcp-section">
            <div class="pcp-back-row">
              <button type="button" class="pcp-back-btn" @click="newClientMode = false">← К списку</button>
            </div>
            <div class="pcp-field">
              <label class="pcp-label">Имя клиента <span class="pcp-required">*</span></label>
              <input v-model="client.name" type="text" class="pcp-input" placeholder="Иванов Иван Иванович" @keyup.enter="confirmStep1">
            </div>
            <div class="pcp-field">
              <label class="pcp-label">Телефон</label>
              <input v-model="client.phone" type="text" class="pcp-input" v-mask="'+7 (999) 999-99-99'" placeholder="+7 (___) ___-__-__">
            </div>
            <div class="pcp-field">
              <label class="pcp-label">Адрес объекта</label>
              <input v-model="client.address" type="text" class="pcp-input" placeholder="ул. Ленина 1, кв. 10">
            </div>
            <div class="pcp-actions">
              <button type="button" class="pcp-btn pcp-btn-primary" :disabled="!client.name.trim()" @click="confirmStep1">Далее →</button>
            </div>
          </div>

          <div v-else class="pcp-section">
            <div class="pcp-tabs">
              <button type="button" class="pcp-tab" :class="{ active: searchTab === 'client' }" @click="switchTab('client')">По клиенту</button>
              <button type="button" class="pcp-tab" :class="{ active: searchTab === 'address' }" @click="switchTab('address')">По адресу</button>
            </div>

            <div v-if="searchTab === 'client'">
              <div class="pcp-search-row">
                <input v-model="clientSearch" type="text" class="pcp-input" placeholder="Поиск по имени или телефону..." @input="selectedClientId = ''">
              </div>
              <div v-if="store.clientsLoading" class="pcp-loading">Загрузка...</div>
              <div v-else-if="filteredClients.length === 0" class="pcp-empty">{{ clientSearch ? 'Ничего не найдено' : 'Клиентов ещё нет' }}</div>
              <div v-else class="pcp-list">
                <div
                  v-for="c in filteredClients"
                  :key="c.id"
                  class="pcp-list-item"
                  :class="{ selected: selectedClientId == c.id }"
                  @click="selectedClientId = c.id"
                >
                  <span class="pcp-item-name">{{ c.name }}</span>
                  <span class="pcp-item-sub">{{ c.phone || '' }}</span>
                  <span v-if="c.drawings_count" class="pcp-item-badge">{{ c.drawings_count }} чертежей</span>
                </div>
              </div>
            </div>

            <div v-if="searchTab === 'address'">
              <div class="pcp-search-row">
                <input v-model="addressSearch" type="text" class="pcp-input" placeholder="Поиск по адресу..." @input="onAddressSearch">
              </div>
              <div v-if="addressSearchLoading" class="pcp-loading">Поиск...</div>
              <div v-else-if="addressResults.length === 0" class="pcp-empty">{{ addressSearch ? 'Ничего не найдено' : 'Введите адрес для поиска' }}</div>
              <div v-else class="pcp-list">
                <div
                  v-for="a in addressResults"
                  :key="a.address_id"
                  class="pcp-list-item"
                  :class="{ selected: selectedAddressResult?.address_id === a.address_id }"
                  @click="selectFromAddressResult(a)"
                >
                  <span class="pcp-item-name">{{ a.address }}</span>
                  <span class="pcp-item-sub">{{ a.client_name }}{{ a.client_phone ? ' · ' + a.client_phone : '' }}</span>
                </div>
              </div>
            </div>

            <div class="pcp-actions pcp-actions-split">
              <button type="button" class="pcp-btn pcp-btn-primary" :disabled="!selectedClientId && !selectedAddressResult" @click="confirmStep1">Далее →</button>
              <button type="button" class="pcp-btn pcp-btn-secondary" @click="startNewClient">+ Новый клиент</button>
            </div>
          </div>
        </div>

        <div v-if="step === 2">
          <div class="pcp-header">
            <button type="button" class="pcp-back-btn" @click="step = 1">← Назад</button>
            <span class="pcp-title">Адрес и помещение</span>
          </div>
          <div class="pcp-client-badge">
            <span class="pcp-client-icon">👤</span>
            <span><strong>{{ selectedClientObj?.name }}</strong><em v-if="selectedClientObj?.phone"> · {{ selectedClientObj.phone }}</em></span>
          </div>

          <div class="pcp-field">
            <label class="pcp-label">Адрес объекта</label>
            <div v-if="clientAddresses.length" class="pcp-address-list">
              <div
                v-for="a in clientAddresses"
                :key="a.id"
                class="pcp-address-item"
                :class="{ selected: selectedAddressId == a.id }"
                @click="selectedAddressId = a.id"
              >
                <span class="pcp-address-radio">{{ selectedAddressId == a.id ? '●' : '○' }}</span>{{ a.address }}
              </div>
              <div class="pcp-address-item pcp-address-none" :class="{ selected: selectedAddressId === null }" @click="selectedAddressId = null">
                <span class="pcp-address-radio">{{ selectedAddressId === null ? '●' : '○' }}</span>— без адреса —
              </div>
            </div>
            <div v-else class="pcp-empty" style="margin:6px 0;">Адресов нет</div>
            <div v-if="!showNewAddressForm" class="pcp-add-link" @click="showNewAddressForm = true">+ Добавить адрес</div>
            <div v-else class="pcp-add-form">
              <input v-model="newAddressText" type="text" class="pcp-input" placeholder="Новый адрес объекта" @keyup.enter="confirmAddAddress">
              <div style="display:flex;gap:6px;margin-top:6px;">
                <button type="button" class="pcp-btn pcp-btn-sm pcp-btn-primary" @click="confirmAddAddress">Сохранить</button>
                <button type="button" class="pcp-btn pcp-btn-sm pcp-btn-secondary" @click="showNewAddressForm = false">Отмена</button>
              </div>
            </div>
          </div>

          <div class="pcp-field">
            <label class="pcp-label">Тип помещения</label>
            <div class="pcp-room-grid">
              <div
                v-for="r in rooms"
                :key="r.id"
                class="pcp-room-item"
                :class="{ selected: selectedRoomId == r.id }"
                @click="selectedRoomId = r.id"
              >{{ r.name }}</div>
            </div>
          </div>
          <div class="pcp-field">
            <label class="pcp-label">Уточнение <em>(необязательно)</em></label>
            <input v-model="roomNote" type="text" class="pcp-input" placeholder="Спальня хозяев, кабинет 2...">
          </div>
          <div class="pcp-actions">
            <button type="button" class="pcp-btn pcp-btn-primary pcp-btn-full" @click="confirmStep2">✓ Начать чертёж</button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useAppStore } from '../stores/appStore'
import { useClients } from '../composables/useClients'
import { noty } from '../utils/noty'

const store = useAppStore()
const { createClient, fetchAddresses, addAddress } = useClients()

const step = ref(1)
const newClientMode = ref(false)
const client = ref({ name: '', phone: '', address: '' })
const searchTab = ref('client')
const clientSearch = ref('')
const addressSearch = ref('')
const addressResults = ref([])
const addressSearchLoading = ref(false)
const selectedClientId = ref('')
const selectedAddressResult = ref(null)
const selectedClientObj = ref(null)
const clientAddresses = ref([])
const selectedAddressId = ref(null)
const showNewAddressForm = ref(false)
const newAddressText = ref('')
const selectedRoomId = ref(null)
const roomNote = ref('')

let addressSearchTimer = null

const rooms = computed(() => store.rooms || [])
const availableClients = computed(() => store.clientsList || [])
const filteredClients = computed(() => {
  const q = clientSearch.value.trim().toLowerCase()
  if (!q) return availableClients.value
  return availableClients.value.filter(c =>
    (c.name || '').toLowerCase().includes(q) || (c.phone || '').toLowerCase().includes(q))
})

function switchTab(tab) {
  searchTab.value = tab
  selectedClientId.value = ''
  selectedAddressResult.value = null
  clientSearch.value = ''
  addressSearch.value = ''
  addressResults.value = []
}

function onAddressSearch() {
  selectedAddressResult.value = null
  clearTimeout(addressSearchTimer)
  const q = addressSearch.value.trim()
  if (!q) {
    addressResults.value = []
    return
  }
  addressSearchTimer = setTimeout(async () => {
    addressSearchLoading.value = true
    try {
      const base = window.location.origin || ''
      const { data } = await axios.get(`${base}/api/calc/addresses`, { params: { search: q }, withCredentials: true })
      addressResults.value = data
    } catch (e) {
      addressResults.value = []
    } finally {
      addressSearchLoading.value = false
    }
  }, 350)
}

function selectFromAddressResult(a) {
  selectedAddressResult.value = a
  selectedClientId.value = a.client_id
}

function startNewClient() {
  newClientMode.value = true
  client.value = { name: '', phone: '', address: '' }
}

async function confirmStep1() {
  if (newClientMode.value) {
    if (!client.value.name.trim()) {
      noty('warning', 'Заполните имя клиента')
      return
    }
    const result = await createClient({ name: client.value.name, phone: client.value.phone, address: client.value.address })
    if (!result) return
    selectedClientObj.value = result.client
    clientAddresses.value = result.client.addresses || []
    selectedAddressId.value = result.address?.id ?? clientAddresses.value[0]?.id ?? null
    await store.fetchClients()
  } else if (selectedAddressResult.value) {
    const ar = selectedAddressResult.value
    const found = availableClients.value.find(c => c.id === ar.client_id)
    selectedClientObj.value = found || { id: ar.client_id, name: ar.client_name, phone: ar.client_phone }
    clientAddresses.value = await fetchAddresses(ar.client_id)
    selectedAddressId.value = ar.address_id
  } else {
    const id = Number(selectedClientId.value)
    if (!id) {
      noty('warning', 'Выберите клиента из списка')
      return
    }
    const found = availableClients.value.find(c => c.id === id)
    if (!found) {
      noty('warning', 'Клиент не найден')
      return
    }
    selectedClientObj.value = found
    clientAddresses.value = await fetchAddresses(found.id)
    const keep = clientAddresses.value.find(a => a.id === Number(selectedAddressId.value))
    selectedAddressId.value = keep ? selectedAddressId.value : (clientAddresses.value[0]?.id ?? null)
  }
  step.value = 2
  if (!selectedRoomId.value && rooms.value?.length) {
    const gost = rooms.value.find(r => r.name === 'Гостиная')
    selectedRoomId.value = gost?.id ?? rooms.value[0]?.id
  }
}

async function confirmAddAddress() {
  if (!newAddressText.value.trim()) {
    noty('warning', 'Введите адрес')
    return
  }
  const addr = await addAddress(selectedClientObj.value.id, newAddressText.value)
  if (addr) {
    clientAddresses.value.push(addr)
    selectedAddressId.value = addr.id
    newAddressText.value = ''
    showNewAddressForm.value = false
  }
}

function confirmStep2() {
  const addr = clientAddresses.value.find(a => a.id === Number(selectedAddressId.value)) ?? null
  store.setCurrentClient(selectedClientObj.value, addr?.id ?? null)
  let roomId = selectedRoomId.value
  if (!roomId && rooms.value?.length) {
    const gost = rooms.value.find(r => r.name === 'Гостиная')
    roomId = gost?.id ?? rooms.value[0]?.id
  }
  store.currentRoomId = roomId
  store.currentRoomNote = roomNote.value
  store.saveDraftClient()
  store.showClientPopup = false
  noty('success', `Клиент: ${selectedClientObj.value.name}`)
}

onMounted(async () => {
  await store.fetchClients()
  if (store.currentClient?.id) {
    selectedClientId.value = store.currentClient.id
    selectedClientObj.value = store.currentClient
    clientAddresses.value = await fetchAddresses(store.currentClient.id)
    selectedAddressId.value = store.currentAddress?.id ?? clientAddresses.value[0]?.id ?? null
    selectedRoomId.value = store.currentRoomId ?? null
    roomNote.value = store.currentRoomNote ?? ''
    if (!selectedRoomId.value && rooms.value?.length) {
      const gost = rooms.value.find(r => r.name === 'Гостиная')
      selectedRoomId.value = gost?.id ?? rooms.value[0]?.id
    }
  }
})
</script>

<style scoped>
.client-popup-overlay {
  position: fixed !important;
  inset: 0 !important;
  z-index: 2147483647 !important;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  box-sizing: border-box;
}
.client-popup-box {
  background: #fff;
  border-radius: 12px;
  min-width: 340px;
  max-width: 460px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 12px 40px rgba(0,0,0,0.25);
  position: relative;
  z-index: 1;
}
.pcp-header { display: flex; align-items: center; gap: 10px; padding: 16px 20px 12px; border-bottom: 1px solid #eee; }
.pcp-title { font-size: 1.1rem; font-weight: 700; color: #1a1a1a; flex: 1; }
.pcp-back-btn { background: none; border: none; color: #4c80f1; font-size: 0.88rem; cursor: pointer; padding: 0; }
.pcp-back-btn:hover { text-decoration: underline; }
.pcp-back-row { margin-bottom: 10px; }
.pcp-section { padding: 16px 20px 20px; }
.pcp-tabs { display: flex; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; margin-bottom: 12px; }
.pcp-tab { flex: 1; border: none; background: #f5f5f5; color: #555; font-size: 0.88rem; padding: 8px 4px; cursor: pointer; }
.pcp-tab.active { background: #4c80f1; color: #fff; font-weight: 600; }
.pcp-tab:first-child { border-right: 1px solid #ddd; }
.pcp-search-row { margin-bottom: 8px; }
.pcp-input { display: block; width: 100%; padding: 8px 10px; border: 1px solid #d0d7e3; border-radius: 7px; font-size: 0.9rem; outline: none; box-sizing: border-box; }
.pcp-input:focus { border-color: #4c80f1; box-shadow: 0 0 0 2px rgba(76,128,241,0.12); }
.pcp-label { display: block; font-size: 0.8rem; color: #666; margin-bottom: 4px; }
.pcp-required { color: #e55; }
.pcp-field { margin-bottom: 14px; }
.pcp-list { max-height: 200px; overflow-y: auto; border: 1px solid #e4e8f0; border-radius: 8px; }
.pcp-list-item { display: flex; flex-direction: column; padding: 9px 12px; cursor: pointer; border-bottom: 1px solid #f0f0f0; }
.pcp-list-item:last-child { border-bottom: none; }
.pcp-list-item:hover { background: #f4f7ff; }
.pcp-list-item.selected { background: #eef2ff; }
.pcp-item-name { font-size: 0.92rem; font-weight: 600; color: #1a1a1a; }
.pcp-item-sub { font-size: 0.8rem; color: #888; margin-top: 1px; }
.pcp-item-badge { font-size: 0.74rem; color: #4c80f1; margin-top: 2px; }
.pcp-loading { text-align: center; color: #888; padding: 14px; font-size: 0.88rem; }
.pcp-empty { text-align: center; color: #aaa; padding: 14px; font-size: 0.85rem; }
.pcp-actions { margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap; }
.pcp-actions-split { justify-content: space-between; }
.pcp-btn { padding: 9px 18px; border: none; border-radius: 7px; font-size: 0.9rem; cursor: pointer; font-weight: 600; }
.pcp-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pcp-btn-primary { background: #4c80f1; color: #fff; }
.pcp-btn-primary:hover:not(:disabled) { background: #3a6de0; }
.pcp-btn-secondary { background: #f0f2f7; color: #333; }
.pcp-btn-secondary:hover { background: #e3e7f0; }
.pcp-btn-sm { padding: 6px 12px; font-size: 0.82rem; }
.pcp-btn-full { width: 100%; text-align: center; }
.pcp-client-badge { display: flex; align-items: center; gap: 8px; background: #f4f7ff; border: 1px solid #d5e0ff; border-radius: 8px; padding: 8px 12px; margin-bottom: 14px; font-size: 0.9rem; }
.pcp-client-icon { font-size: 1.1rem; }
.pcp-address-list { border: 1px solid #e4e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 8px; }
.pcp-address-item { display: flex; align-items: center; gap: 8px; padding: 9px 12px; cursor: pointer; border-bottom: 1px solid #f0f0f0; }
.pcp-address-item:last-child { border-bottom: none; }
.pcp-address-item:hover { background: #f4f7ff; }
.pcp-address-item.selected { background: #eef2ff; font-weight: 600; }
.pcp-address-none { color: #999; font-style: italic; }
.pcp-address-radio { color: #4c80f1; width: 14px; flex-shrink: 0; }
.pcp-add-link { color: #4c80f1; font-size: 0.85rem; cursor: pointer; margin-bottom: 4px; }
.pcp-add-link:hover { text-decoration: underline; }
.pcp-add-form { margin-top: 6px; }
.pcp-room-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.pcp-room-item { padding: 6px 12px; border: 1px solid #d0d7e3; border-radius: 20px; font-size: 0.82rem; cursor: pointer; background: #fafafa; color: #333; }
.pcp-room-item:hover { border-color: #4c80f1; color: #4c80f1; }
.pcp-room-item.selected { background: #4c80f1; border-color: #4c80f1; color: #fff; font-weight: 600; }
</style>
