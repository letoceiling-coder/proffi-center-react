<template>
  <div id="main-4" style="display: block;">
    <div class="container btn-block btn-block-ceiling">
      <button 
        id="ceiling-one" 
        type="button" 
        class="btn"
        :class="ceilingOne ? 'btn-success' : 'btn-info'"
        @click="handleCeilingOne"
      >
        Текущий потолок
      </button>
      <button 
        id="ceiling-all" 
        type="button" 
        class="btn"
        :class="ceilingAll ? 'btn-success' : 'btn-info'"
        @click="handleCeilingAll"
      >
        Все потолки в заказе
      </button>
    </div>
    
    <div class="container btn-block btn-block-client">
      <button 
        id="smata-client" 
        type="button" 
        class="btn"
        :class="smataClient ? 'btn-success' : 'btn-info'"
        @click="handleSmataClient"
      >
        Клиент
      </button>
      <button 
        id="smata-montaj" 
        type="button" 
        class="btn"
        :class="smataMontaj ? 'btn-success' : 'btn-info'"
        @click="handleSmataMontaj"
      >
        Монтаж
      </button>
      <button 
        id="smata-material" 
        type="button" 
        class="btn"
        :class="smataMaterial ? 'btn-success' : 'btn-info'"
        @click="handleSmataMaterial"
      >
        Материал
      </button>
    </div>
    
    <div class="container select-block selectRoomBlock">
      <div class="row">
        <div class="col-xs-9 h-30">
          <select class="form-control selectRoom" v-model="selectedRoom" @change="handleRoomChange">
            <option value="0">Выберите помещение</option>
            <option v-for="room in rooms" :key="room.id" :value="room.id">{{ room.name }}</option>
          </select>
        </div>
        <div class="col-xs-3 flex-block h-30">
          <span class="deliteCeiling" @click="handleDelete">
            <img src="/images/icon/delite.png" style="width: 30px;">
          </span>
          <span class="renameCeiling" @click="handleRename">
            <img src="/images/icon/Rename.png" style="width: 30px;">
          </span>
        </div>
      </div>
    </div>
    
    <div class="contener-smeta">
      <div class="container">
        <div class="row table-smeta">
          <div class="col-xs-6 left flex-block h-50">
            <img id="logoImg" :src="companyLogo" alt="">
          </div>
          <div class="col-xs-6">
            <div class="row right flex-block h-50">
              <div class="col-xs-12 fz-10">
                <span>Компания: <span id="name-company">{{ companyName }}</span></span>
              </div>
              <div class="col-xs-12 fz-10">
                <span>Адрес:<span id="name-company-adress">{{ companyAddress }}</span></span>
              </div>
              <div class="col-xs-12 fz-10">
                <span>Телефон:<span id="name-company-phone">{{ companyPhone }}</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="container-fluid hr"></div>
      
      <div class="container">
        <div class="row table-smeta">
          <div class="col-xs-6 left flex-block h-50">
            <div class="row left flex-block">
              <div class="col-xs-12 fz-10">
                <span>Номер заказа № <span id="number_order">{{ orderNumber }}</span></span>
              </div>
              <div class="col-xs-12 fz-10">
                <span>Клиент: <span id="client-smeta">{{ clientName }}</span></span>
              </div>
              <div class="col-xs-12 fz-10">
                <span>Адрес: <span id="client-adress-smeta">{{ clientAddress }}</span></span>
              </div>
              <div class="col-xs-12 fz-10">
                <span>Телефон: <span id="client-phone-smeta">{{ clientPhone }}</span></span>
              </div>
            </div>
          </div>
          <div class="col-xs-6">
            <div class="row right flex-block h-50">
              <div class="col-xs-12 fz-10">
                <span>Дата заказа:</span>
              </div>
              <div class="col-xs-12 fz-10">
                <span id="days">{{ orderDate }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="container table-smeta-one">
        <table class="table-bordered" id="smeta-table">
          <!-- Таблица будет заполняться динамически -->
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAppStore } from '../stores/appStore'
import { useSmeta } from '../composables/useSmeta'

const store = useAppStore()
const { exitInSmeta, exitInSmetaAll } = useSmeta()

const selectedRoom = ref(0)
const companyLogo = ref('/images/logoCompany/logo.png')
const companyName = ref('')
const companyAddress = ref('')
const companyPhone = ref('')
const orderNumber = ref('')
const clientName = ref('')
const clientAddress = ref('')
const clientPhone = ref('')
const orderDate = ref('')

const ceilingOne = computed(() => store.ceilingOne)
const ceilingAll = computed(() => store.ceilingAll)
const smataClient = computed(() => store.smataClient)
const smataMontaj = computed(() => store.smataMontaj)
const smataMaterial = computed(() => store.smataMaterial)
const rooms = computed(() => store.rooms)

const handleCeilingOne = () => {
  store.setCeilingOne(true)
}

const handleCeilingAll = () => {
  store.setCeilingOne(false)
}

const handleSmataClient = () => {
  store.setSmataClient(true)
}

const handleSmataMontaj = () => {
  store.setSmataMontaj(true)
}

const handleSmataMaterial = () => {
  store.setSmataMaterial(true)
}

const handleRoomChange = (event) => {
  const roomId = event.target.value
  store.ceilingId = roomId
  exitInSmeta(roomId)
}

const handleDelete = () => {
  // Логика удаления
}

const handleRename = () => {
  // Логика переименования
}

onMounted(() => {
  // Загрузка данных сметы
})
</script>

