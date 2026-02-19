<template>
  <div id="main-1" style="display: block;">
    <div class="container select-block">
      <div class="row">
        <div class="col-xs-9 h-30">
          <select 
            class="form-control selectRoom"
            v-model="selectedRoom"
            @change="handleRoomChange"
          >
            <option value="0">Выберите помещение</option>
            <option 
              v-for="room in rooms" 
              :key="room.id" 
              :value="room.id"
            >
              {{ room.name }}
            </option>
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
    
    <div style="display: none" id="calc_img"></div>
    <input type="hidden" id="img_hidden" :value="imgHidden">
    
    <div class="container images-block">
      <img id="slides" style="max-width: 100%;" :src="slidesImage">
    </div>

    <div class="container-fluid hr"></div>

    <div class="container specification-block">
      <div>
        Стороны:
        <table class="table-striped">
          <tbody id="table-walls"></tbody>
        </table>
      </div>
      <div>
        Диагонали:
        <table class="table-striped">
          <tbody id="table-diags"></tbody>
        </table>
      </div>
    </div>
    
    <div class="container-fluid hr"></div>

    <div class="container specification-block">
      <div style="width: 90%;">
        Спецификация:
        <table class="table-striped">
          <tbody>
            <tr>
              <td>Кол-во углов (шт.):</td>
              <td><span id="angles_result" readonly tabindex="-1">{{ anglesResult }}</span></td>
            </tr>
            <tr>
              <td>Периметр (м.):</td>
              <td><span id="perimeter_result" readonly tabindex="-1">{{ perimeterResult }}</span></td>
            </tr>
            <tr>
              <td>Площадь (м<sup>2</sup>.):</td>
              <td><span id="area_result" readonly tabindex="-1">{{ areaResult }}</span></td>
            </tr>
            <tr>
              <td>Криволинейность (м.):</td>
              <td><span id="curvilinear_result" readonly tabindex="-1">{{ curvilinearResult }}</span></td>
            </tr>
            <tr>
              <td>Внутренний вырез (м.):</td>
              <td><span id="inner_cutout_length" readonly tabindex="-1">{{ innerCutoutLength }}</span></td>
            </tr>
            <tr>
              <td>Цвет:</td>
              <td><span id="color_id" readonly tabindex="-1">{{ colorId }}</span></td>
            </tr>
            <tr>
              <td>Производитель:</td>
              <td><span id="manufacturer_id" readonly tabindex="-1">{{ manufacturerId }}</span></td>
            </tr>
            <tr>
              <td>Фактура:</td>
              <td><span id="texture_id" readonly tabindex="-1">{{ textureId }}</span></td>
            </tr>
            <tr>
              <td>Ширина материала:</td>
              <td><span id="width_final" readonly tabindex="-1">{{ widthFinal }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppStore } from '../stores/appStore'

const store = useAppStore()

const selectedRoom = ref(0)
const imgHidden = ref('')
const slidesImage = ref('')
const anglesResult = ref('')
const perimeterResult = ref('')
const areaResult = ref('')
const curvilinearResult = ref('')
const innerCutoutLength = ref('')
const colorId = ref('')
const manufacturerId = ref('')
const textureId = ref('')
const widthFinal = ref('')

const rooms = computed(() => store.rooms)

const handleRoomChange = (event) => {
  const roomId = event.target.value
  if (roomId == 0) {
    // Переход к созданию нового чертежа
    return
  }
  store.ceilingId = roomId
  store.exitInSmeta(roomId)
}

const handleDelete = () => {
  // Логика удаления
  console.log('Delete ceiling')
}

const handleRename = () => {
  // Логика переименования
  console.log('Rename ceiling')
}
</script>

