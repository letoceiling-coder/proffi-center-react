<template>
  <div id="main-5" style="display: block;">
    <div class="container select-block">
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
    
    <div class="container btn-block btn-block-client" style="margin-top: 20px">
      <button 
        id="smata-works" 
        type="button" 
        class="btn"
        :class="smataWorks ? 'btn-success' : 'btn-info'"
        @click="handleSmataWorks"
      >
        Работы
      </button>
      <button 
        id="smata-materials" 
        type="button" 
        class="btn"
        :class="smataMaterials ? 'btn-success' : 'btn-info'"
        @click="handleSmataMaterials"
      >
        Материалы
      </button>
    </div>
    
    <div class="container">
      <div class="row">
        <div class="col-xs-12">
          <ul id="navs">
            <!-- Навигация будет заполняться динамически -->
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/appStore'

const store = useAppStore()

const selectedRoom = ref(0)
const smataWorks = computed(() => store.smataWorks)
const smataMaterials = computed(() => store.smataMaterials)
const rooms = computed(() => store.rooms)

const handleSmataWorks = () => {
  store.setSmataWorks(true)
}

const handleSmataMaterials = () => {
  store.setSmataWorks(false)
}

const handleRoomChange = (event) => {
  const roomId = event.target.value
  store.ceilingId = roomId
  // Логика загрузки данных
}

const handleDelete = () => {
  // Логика удаления
}

const handleRename = () => {
  // Логика переименования
}
</script>

