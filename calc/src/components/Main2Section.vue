<template>
  <div id="main-2" style="display: block;">
    <!-- Popup для выбора фактуры и производителя (нужно для sketch.js) -->
    <!-- Всегда присутствует в DOM для sketch.js, даже если скрыт -->
    <div id="popup_canvas" :style="{ display: showCanvasPopup ? 'block' : 'none', position: 'fixed', zIndex: showCanvasPopup ? 10000 : -1 }">
      <div style="text-align: center">
        Выберите фактуру:<br>
        <select id="select_facture" class="form-control inputbox"></select><br>
        Выберите производителя:<br>
        <select id="select_manufacturer" class="form-control inputbox"></select><br>
        <button id="btn_okSelectCanvas" class="sketch_hud btn btn-gm">Ок</button>
        <button id="btn_cancelSelectCanvas" class="sketch_hud btn btn-gm">Отмена</button>
      </div>
    </div>
    
    <!-- Popup для выбора цвета (нужно для sketch.js) -->
    <!-- Всегда присутствует в DOM для sketch.js, даже если скрыт -->
    <div id="popup_canvasColor" :style="{ display: showCanvasColorPopup ? 'block' : 'none', position: 'fixed', zIndex: showCanvasColorPopup ? 10000 : -1 }">
      <div style="text-align: center">
        Выберите цвет:<br>
        <div class="container-colors" id="container_colors"></div>
        <button id="btn_okSelectColor" class="sketch_hud btn btn-gm">Ок</button>
        <button id="btn_cancelSelectColor" class="sketch_hud btn btn-gm">Отмена</button>
      </div>
    </div>
    
    <!-- Форма для чертежа -->
    <form method="POST" action="/" style="display: none" id="form_url">
      <input type="hidden" value="0" id="changes">
      <input type="hidden" value="1" id="internet">
      <input type="hidden" value="" id="id_table">
      <input type="hidden" value="" id="manufacturer_id">
      <input type="hidden" value="" id="texture_id">
      <input type="hidden" value="" id="color_id">
      <input name="texturesData" id="texturesData" value="" type="hidden">
      <input name="texture" id="texture" value="" type="hidden">
      <input name="color" id="color" value="" type="hidden">
      <input name="manufacturer" id="manufacturer" value="" type="hidden">
      <input name="walls" id="walls" value="" type="hidden">
      <input name="width" id="width" :value="widthData" type="hidden">
      <input name="calc_id" id="calc_id" value="208331" type="hidden">
      <input name="n4" id="n4" value="" type="hidden">
      <input name="n5" id="n5" value="" type="hidden">
      <input name="n9" id="n9" value="" type="hidden">
      <input name="triangulator_pro" id="triangulator_pro" value="0" type="hidden">
      <input name="type_url" id="type_url" value="&type=calculator" type="hidden">
      <input name="subtype_url" id="subtype_url" value="&subtype=precalc" type="hidden">
      <input name="precalculation" id="precalculation" value="" type="hidden">
      <input name="addition" id="addition" value="" type="hidden">
      <input name="device" id="device" value="" type="hidden">
      <input name="api" id="api" value="" type="hidden">
      <input name="latitude" id="latitude" value="" type="hidden">
      <input name="longitude" id="longitude" value="" type="hidden">
      <input name="advt" id="advt" value="" type="hidden">
      <input name="user_url" id="user_url" value="" type="hidden">
    </form>

    <!-- Popup клиента: 2-шаговый -->
    <div id="popup_client" v-show="showClientPopup" class="popup-client-overlay">
      <div class="popup-client-box">

        <!-- ШАГ 1: Выбор или создание клиента -->
        <div v-if="clientPopupStep === 1">
          <h3 class="popup-client-title">Клиент</h3>

          <!-- Режим создания нового клиента -->
          <div v-if="newClientMode">
            <label>Имя клиента *</label>
            <input type="text" class="form-control inputbox" v-model="client.name" placeholder="Иванов Иван">
            <label>Телефон</label>
            <input type="text" class="form-control inputbox" v-model="client.phone" v-mask="'+7 (999) 999-99-99'" placeholder="+7 (___) ___-__-__">
            <label>Адрес объекта</label>
            <input type="text" class="form-control inputbox" v-model="client.address" placeholder="ул. Ленина 1, кв. 10">
            <div class="popup-client-actions">
              <button class="sketch_hud btn btn-gm" @click="confirmStep1">Далее →</button>
              <button class="sketch_hud btn btn-gm" @click="newClientMode = false">← Список</button>
            </div>
          </div>

          <!-- Режим выбора из списка -->
          <div v-else>
            <div v-if="store.clientsLoading" style="text-align:center;padding:10px;">Загрузка...</div>
            <div v-else-if="availableClients.length === 0" style="text-align:center;color:#888;padding:10px;">
              Клиентов нет
            </div>
            <div v-else>
              <label>Выберите клиента:</label>
              <select class="form-control inputbox" v-model="selectedClientId">
                <option value="">— выберите —</option>
                <option v-for="c in availableClients" :key="c.id" :value="c.id">
                  {{ c.name }}{{ c.phone ? ' · ' + c.phone : '' }}
                </option>
              </select>
            </div>
            <div class="popup-client-actions">
              <button class="sketch_hud btn btn-gm" @click="confirmStep1" :disabled="!selectedClientId">Далее →</button>
              <button class="sketch_hud btn btn-gm" @click="startNewClient">+ Новый клиент</button>
            </div>
          </div>
        </div>

        <!-- ШАГ 2: Адрес + тип помещения -->
        <div v-if="clientPopupStep === 2">
          <h3 class="popup-client-title">Адрес и помещение</h3>
          <p style="color:#555;font-size:0.9em;">Клиент: <strong>{{ selectedClientObj?.name }}</strong></p>

          <!-- Адреса клиента -->
          <label>Адрес объекта:</label>
          <div v-if="clientAddresses.length">
            <select class="form-control inputbox" v-model="selectedAddressId">
              <option :value="null">— без адреса —</option>
              <option v-for="a in clientAddresses" :key="a.id" :value="a.id">{{ a.address }}</option>
            </select>
          </div>
          <div v-else style="color:#888;font-size:0.85em;margin:4px 0;">Адресов нет</div>

          <!-- Добавить новый адрес -->
          <div v-if="!showNewAddressForm" style="margin:6px 0;">
            <button class="sketch_hud btn btn-sm btn-gm" @click="showNewAddressForm = true">+ Добавить адрес</button>
          </div>
          <div v-else style="margin:6px 0;">
            <input type="text" class="form-control inputbox" v-model="newAddressText" placeholder="Новый адрес">
            <button class="sketch_hud btn btn-sm btn-gm" @click="confirmAddAddress">Сохранить</button>
            <button class="sketch_hud btn btn-sm btn-gm" @click="showNewAddressForm = false">Отмена</button>
          </div>

          <!-- Тип помещения -->
          <label>Тип помещения:</label>
          <select class="form-control inputbox" v-model="selectedRoomId">
            <option :value="null">— не указан —</option>
            <option v-for="r in rooms" :key="r.id" :value="r.id">{{ r.name }}</option>
          </select>

          <label>Уточнение (необязательно):</label>
          <input type="text" class="form-control inputbox" v-model="roomNote" placeholder="Спальня хозяев, кабинет 2...">

          <div class="popup-client-actions">
            <button class="sketch_hud btn btn-gm" @click="confirmStep2">✓ Начать чертёж</button>
            <button class="sketch_hud btn btn-gm" @click="backToStep1">← Назад</button>
          </div>
        </div>

      </div>
    </div>

    <!-- Popup выбора комнат (legacy) -->
    <div id="popup_get_rooms" v-show="showGetRoomsPopup">
      <div style="text-align: center">
        <input type="text" id="input_get_rooms" v-model="newRoomName">
        <br><br>
        <button id="btn_get_rooms" class="sketch_hud btn btn-gm" @click="handleGetRooms">Ок</button>
        <button id="btn_cancel_get_rooms" class="sketch_hud btn btn-gm" @click="showGetRoomsPopup = false">Отмена</button>
      </div>
    </div>

    <!-- Popup выбора клиента (legacy, скрыт) -->
    <div id="popup_client_select" v-show="false">
      <div style="text-align: center">
        <span class="selectClient">Выберите клиента:</span><br>
        <select id="get_select_client" class="form-control inputbox" v-model="selectedClientId">
          <option v-for="c in availableClients" :key="c.id" :value="c.id">
            {{ c.name }} - {{ c.phone }}
          </option>
        </select>
        <br>
        <button id="btn_select_client_adress" class="sketch_hud btn btn-gm" @click="toggleClientSelectMode">По адресу</button>
        <button id="btn_select_client" class="sketch_hud btn btn-gm" @click="handleSelectClient">Ок</button>
        <button id="btn_cancel_select_client" class="sketch_hud btn btn-gm" @click="showClientSelectPopup = false">Отмена</button>
      </div>
    </div>

    <!-- Preloader -->
    <div id="preloader" v-show="showPreloader" style="z-index: 99999" class="PRELOADER_GM PRELOADER_GM_OPACITY">
      <div class="PRELOADER_BLOCK"></div>
      <img src="/images/GM_R_HD.png" class="PRELOADER_IMG">
    </div>

    <!-- Форма данных: только текущий origin -->
    <form method="POST" :action="formDataAction" style="display: none" id="form_data">
      <input name="n4" id="input_n4" value="0.00" placeholder="Площадь" type="hidden">
      <input name="n5" id="input_n5" value="0.00" placeholder="Периметр" type="hidden">
      <input name="n9" id="input_n9" value="" placeholder="Углы" type="hidden">
    </form>

    <!-- Popup выбора режима диагоналей -->
    <!-- Всегда в DOM для sketch.js -->
    <div id="popup2" :style="{ display: showTriangulatePopup ? 'block' : 'none', position: 'fixed', zIndex: showTriangulatePopup ? 10000 : -1 }">
      <div style="text-align: center">
        <p>Выберите режим построения диагоналей.</p>
        <button id="triangulate_auto" class="sketch_hud btn btn-gm" @click="handleTriangulateAuto">Автоматический</button>
        <button id="triangulate_manual" class="sketch_hud btn btn-gm" @click="handleTriangulateManual">Ручной</button>
      </div>
    </div>

    <!-- Popup координат -->
    <!-- Всегда в DOM для sketch.js -->
    <div id="popup_coordinates" :style="{ display: showCoordinatesPopup ? 'block' : 'none', position: 'absolute', zIndex: showCoordinatesPopup ? 1000 : -1 }">
      <div style="text-align: center">
        <p>Вставить координаты чертежа:</p>
        <p><textarea id="textarea_coordinates" v-model="coordinatesText"></textarea></p>
        <button id="coordinates_ok" class="sketch_hud btn btn-gm" @click="handleCoordinatesOk">Ок</button>
        <button id="coordinates_cancel" class="sketch_hud btn btn-gm" @click="showCoordinatesPopup = false">Отмена</button>
      </div>
    </div>

    <!-- Popup построения -->
    <!-- Всегда в DOM для sketch.js -->
    <div id="popup_build" :style="{ display: showBuildPopup ? 'block' : 'none', position: 'absolute', zIndex: showBuildPopup ? 1000 : -1 }">
      <div style="text-align: center">
        <div class="row" style="text-align: right;">
          <div class="col-md-8 col-xs-8" style="padding-right: 0px; margin-top: 6px;">
            <label>Введите кол-во стен:</label>
          </div>
          <div class="col-md-3 col-xs-3">
            <input id="input_walls_count" class="form-control" maxlength="3" v-model.number="wallsCount">
          </div>
        </div>
        <div style="max-height: 300px; overflow-y: auto; margin-top: 6px;">
          <table class="table-build">
            <thead><tr><th>Стена</th><th>Длина</th><th>Крив. Лин.</th></tr></thead>
            <tbody id="tbody_build_walls"></tbody>
          </table>
          <hr>
          <table class="table-build">
            <thead><tr><th>Диагональ</th><th>Длина</th></tr></thead>
            <tbody id="tbody_build_diags"></tbody>
          </table>
        </div>
        <button id="btn_build_ok" class="sketch_hud btn btn-gm" @click="handleBuildOk">Ок</button>
        <button id="btn_build_cancel" class="sketch_hud btn btn-gm" @click="showBuildPopup = false">Отмена</button>
      </div>
    </div>

    <!-- Popup внутреннего выреза -->
    <!-- Всегда в DOM для sketch.js -->
    <div id="popup_innerCutout" :style="{ display: showInnerCutoutPopup ? 'block' : 'none', position: 'absolute', zIndex: showInnerCutoutPopup ? 1000 : -1 }">
      <div style="text-align: center">
        <p>Выберите фигуру для внутреннего выреза.</p>
        <button class="sketch_hud btn btn-gm" id="ellipse" style="width: 200px;" @click="handleInnerCutout('ellipse')">Овал/Круг</button><br>
        <button class="sketch_hud btn btn-gm" id="rectangle" style="margin-top: 10px; width: 200px;" @click="handleInnerCutout('rectangle')">Прямоугольник/Квадрат</button><br>
        <button class="sketch_hud btn btn-gm" id="rhomb" style="margin-top: 10px; width: 200px;" @click="handleInnerCutout('rhomb')">Ромб</button><br>
        <button id="btn_figure_cancel" class="sketch_hud btn btn-danger" style="margin-top: 10px; width: 200px;" @click="showInnerCutoutPopup = false">Отмена</button>
      </div>
    </div>

    <!-- Popup уровня -->
    <!-- Всегда в DOM для sketch.js -->
    <div id="popup_level" :style="{ display: showLevelPopup ? 'block' : 'none', position: 'absolute', zIndex: showLevelPopup ? 1000 : -1 }">
      <div style="text-align: center">
        <p>Выберите вид потолка.</p>
        <button id="btn_level1" class="sketch_hud btn btn-gm" @click="handleLevel(1)">Простой</button>
        <button id="btn_level2" class="sketch_hud btn btn-gm" @click="handleLevel(2)">Двухуровневый</button>
      </div>
    </div>

    <!-- Индикатор текущего клиента + кнопка смены -->
    <div v-if="store.currentClient && !showClientPopup" class="current-client-bar">
      <span>
        <strong>{{ store.currentClient.name }}</strong>
        <template v-if="store.currentAddress"> · {{ store.currentAddress.address }}</template>
        <template v-if="store.currentRoomId">
           · {{ rooms.find(r => r.id === store.currentRoomId)?.name ?? '' }}
        </template>
        <template v-if="store.currentRoomNote"> ({{ store.currentRoomNote }})</template>
      </span>
      <button class="sketch_hud btn btn-sm btn-gm" @click="changeClient">Сменить</button>
    </div>

    <!-- Canvas редактор -->
    <div class="tar">
      <div id="sketch_editor" class="sketch_window">
        <button class="sketch_hud btn btn-gm" id="hamburger" style="margin-left: 10px;" @click="toggleMenu">
          <i class="fas fa-bars" aria-hidden="true"></i>
        </button>
        <label class="line_check btn btn-gm">
          <input id="useLine" type="checkbox" class="check" v-model="useLine"><span></span>
        </label>
        <button class="sketch_hud btn btn-gm" id="cancelLastAction" @click="cancelLastAction">
          <i class="fas fa-undo" aria-hidden="true"></i>
        </button>
        <button class="sketch_hud btn btn-gm" id="reset" @click="resetCanvas">
          <i class="fas fa-eraser" aria-hidden="true"></i>
        </button>
        <button class="sketch_hud btn btn-gm" id="back" @click="closeSketch">
          <i class="fas fa-times" aria-hidden="true"></i>
        </button>
      </div>

      <div class="div_canvas" style="width: calc(100% - 190px);">
        <div id="menu" v-show="showMenu">
          <label class="curve_check btn btn-gm">
            <input type="checkbox" id="curve" v-model="curve"><span></span>
          </label><br>
          <label class="arc_check btn btn-gm">
            <input type="checkbox" id="arc" v-model="arc"><span></span>
          </label><br>
          <button class="sketch_hud btn btn-gm" id="btn_inner_cutout" @click="showInnerCutoutPopup = true">
            <i class="fas fa-cut" aria-hidden="true"></i>
          </button><br>
          <button class="sketch_hud btn btn-gm" id="btn_build_by_lengths" @click="showBuildPopup = true">
            <i class="fas fa-drafting-compass"></i>
          </button><br>
          <button class="sketch_hud btn btn-gm" id="btn_paste_coordinates" @click="showCoordinatesPopup = true">
            <i class="fas fa-ruler-combined"></i>
          </button>
        </div>
        <canvas 
          id="myCanvas" 
          ref="canvas"
          resize 
          width="1166" 
          height="495"
          style="-webkit-user-drag: none; user-select: none; -webkit-tap-highlight-color: rgba(0, 0, 0, 0); height: 495px; width: 1166px; resize: both; touch-action: none; pointer-events: auto;"
        ></canvas>
      </div>

      <div id="sketch_editor2" class="sketch_window" style="width: 180px;">
        <div style="text-align: center">
          <label class="btn btn-gm line_check">
            <input id="useLine2" type="checkbox" v-model="useLine"><span></span>
          </label>
          <label class="btn btn-gm curve_check">
            <input type="checkbox" id="curve2" v-model="curve"><span></span>
          </label>
          <label class="btn btn-gm arc_check">
            <input type="checkbox" id="arc2" v-model="arc"><span></span>
          </label>
          <button class="sketch_hud btn btn-gm" id="back2" @click="closeSketch">
            <i class="fas fa-times" aria-hidden="true"></i>
          </button>
          <br>
          <button class="sketch_hud btn btn-gm" id="btn_inner_cutout2" @click="showInnerCutoutPopup = true">
            <i class="fas fa-cut" aria-hidden="true"></i>
          </button>
          <button class="sketch_hud btn btn-gm" id="cancelLastAction2" @click="cancelLastAction">
            <i class="fas fa-undo" aria-hidden="true"></i> Отмена
          </button>
          <br>
          <button class="sketch_hud btn btn-gm" id="reset2" @click="resetCanvas">
            <i class="fas fa-eraser" aria-hidden="true"></i> Очистить
          </button>
          <button class="sketch_hud btn btn-gm" id="btn_build_by_lengths2" @click="showBuildPopup = true">
            <i class="fas fa-drafting-compass"></i>
          </button>
          <button class="sketch_hud btn btn-gm" id="btn_paste_coordinates2" @click="showCoordinatesPopup = true">
            <i class="fas fa-ruler-combined"></i>
          </button><br>
          <button id="close_sketch2" class="sketch_hud btn btn-gm" @click="saveAndClose">
            <i class="far fa-save" aria-hidden="true"></i> Сохранить и закрыть
          </button>
        </div>
      </div>
    </div>

    <!-- NumPad для мобильных -->
    <!-- Всегда в DOM для sketch.js -->
    <div id="window" :style="{ display: showNumPad ? 'block' : 'none', position: 'fixed', zIndex: showNumPad ? 10000 : -1 }">
      <div style="text-align: center">
        <table col="5" id="numpadMobile" class="numpad">
          <tbody>
            <tr>
              <td><button class="but_num" id="num1" @click="numPadInput('1')">1</button></td>
              <td><button class="but_num" id="num2" @click="numPadInput('2')">2</button></td>
              <td><button class="but_num" id="num3" @click="numPadInput('3')">3</button></td>
              <td colspan="2">
                <input name="newLength" id="newLength" v-model="newLength" placeholder="Длина" type="text" readonly>
              </td>
            </tr>
            <tr>
              <td><button class="but_num" id="num4" @click="numPadInput('4')">4</button></td>
              <td><button class="but_num" id="num5" @click="numPadInput('5')">5</button></td>
              <td><button class="but_num" id="num6" @click="numPadInput('6')">6</button></td>
              <td><button class="but_num" id="numback" @click="numPadBack"><i class="fas fa-arrow-left"></i></button></td>
              <td><button class="but_num" id="ok" @click="numPadOk"><i class="fas fa-check"></i></button></td>
            </tr>
            <tr>
              <td><button class="but_num" id="num7" @click="numPadInput('7')">7</button></td>
              <td><button class="but_num" id="num8" @click="numPadInput('8')">8</button></td>
              <td><button class="but_num" id="num9" @click="numPadInput('9')">9</button></td>
              <td><button class="but_num" id="num0" @click="numPadInput('0')">0</button></td>
              <td><button class="but_num" id="comma" @click="numPadInput('.')">.</button></td>
            </tr>
          </tbody>
        </table>
        <!-- NumPad для монитора -->
        <table col="3" id="numpadMonitor" class="numpad">
          <tbody>
            <tr>
              <td colspan="2">
                <input name="newLength" id="newLength2" v-model="newLength" placeholder="Длина" type="text" readonly>
              </td>
              <td>
                <button class="but_num" id="ok2" @click="numPadOk"><i class="fas fa-check"></i></button>
              </td>
            </tr>
            <tr>
              <td><button class="but_num" id="num12" @click="numPadInput('1')">1</button></td>
              <td><button class="but_num" id="num22" @click="numPadInput('2')">2</button></td>
              <td><button class="but_num" id="num32" @click="numPadInput('3')">3</button></td>
            </tr>
            <tr>
              <td><button class="but_num" id="num42" @click="numPadInput('4')">4</button></td>
              <td><button class="but_num" id="num52" @click="numPadInput('5')">5</button></td>
              <td><button class="but_num" id="num62" @click="numPadInput('6')">6</button></td>
            </tr>
            <tr>
              <td><button class="but_num" id="num72" @click="numPadInput('7')">7</button></td>
              <td><button class="but_num" id="num82" @click="numPadInput('8')">8</button></td>
              <td><button class="but_num" id="num92" @click="numPadInput('9')">9</button></td>
            </tr>
            <tr>
              <td><button class="but_num" id="comma2" @click="numPadInput('.')">.</button></td>
              <td><button class="but_num" id="num02" @click="numPadInput('0')">0</button></td>
              <td><button class="but_num" id="numback2" @click="numPadBack"><i class="fas fa-arrow-left"></i></button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div style="text-align: center">
      <button id="close_sketch" class="sketch_hud btn btn-gm" @click="saveAndClose">
        <i class="far fa-save" aria-hidden="true"></i> Сохранить и закрыть
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import axios from 'axios'
import { useAppStore } from '../stores/appStore'
import { useClients } from '../composables/useClients'
import { noty } from '../utils/noty'
import { initSketch } from '../utils/sketchInit'

const store = useAppStore()
const { fetchClients, createClient, fetchAddresses, addAddress } = useClients()

// ──── Popup: показывать только если клиент не выбран ────
const showClientPopup = ref(!store.currentClient)
const showGetRoomsPopup = ref(false)
const showClientSelectPopup = ref(false)
const showPreloader = ref(false)

// ──── Popup шаги: 1=выбор/создание клиента, 2=адрес+комната ────
const clientPopupStep = ref(1)
const newClientMode   = ref(false)   // создаём нового или выбираем
const showTriangulatePopup = ref(false)
const showCoordinatesPopup = ref(false)
const showBuildPopup = ref(false)
const showInnerCutoutPopup = ref(false)
const showLevelPopup = ref(false)
const showCanvasPopup = ref(false)
const showCanvasColorPopup = ref(false)
const showMenu = ref(false)
const showMobileMenu = ref(false)
const showNumPad = ref(false)

// ──── Форма нового клиента ────
const client = ref({ name: '', phone: '', address: '' })

// ──── Форма выбора адреса (шаг 2) ────
const selectedAddressId = ref(null)
const newAddressText    = ref('')
const showNewAddressForm = ref(false)
const selectedRoomId    = ref(null)
const roomNote          = ref('')

// ──── Список для выбора клиента ────
const clientId      = ref('')
const selectedClientId = ref('')
const selectedClientObj = ref(null)   // клиент, выбранный в списке шага 1
const clientAddresses   = ref([])     // адреса выбранного клиента
const newRoomName = ref('')
const coordinatesText = ref('')
const wallsCount = ref(0)
const newLength = ref('')
const useLine = ref(true)
const curve = ref(false)
const arc = ref(false)

const widthData = ref('[{"id":"146","width":"500","price":"165.00"},{"id":"143","width":"450","price":"165.00"},{"id":"140","width":"400","price":"165.00"},{"id":"137","width":"360","price":"110.00"},{"id":"1477","width":"340","price":"110.00"},{"id":"132","width":"320","price":"110.00"},{"id":"951","width":"300","price":"110.00"},{"id":"129","width":"270","price":"110.00"},{"id":"125","width":"240","price":"110.00"},{"id":"921","width":"220","price":"110.00"},{"id":"120","width":"200","price":"110.00"},{"id":"115","width":"150","price":"110.00"}]')

const rooms           = computed(() => store.rooms || [])
const availableClients = computed(() => store.clientsList || [])

// Всегда тот же origin, без внешних URL
const formDataAction = computed(() => {
  if (typeof window === 'undefined') return '/api/calc/sketch'
  return (window.location.origin || '') + '/api/calc/sketch'
})

const canvas = ref(null)

// ──── Методы popup_client ────

/** Шаг 1 → «Создать нового» */
const startNewClient = () => {
  newClientMode.value = true
  client.value = { name: '', phone: '', address: '' }
}

/** Шаг 1 → «Выбрать из списка» */
const startSelectClient = async () => {
  newClientMode.value = false
  await store.fetchClients()
}

/** Шаг 1: подтвердить выбор/создание → перейти к шагу 2 */
const confirmStep1 = async () => {
  if (newClientMode.value) {
    // Создаём нового клиента
    if (!client.value.name.trim()) {
      noty('warning', 'Заполните имя клиента')
      return
    }
    const result = await createClient({
      name:    client.value.name,
      phone:   client.value.phone,
      address: client.value.address,
    })
    if (!result) return

    selectedClientObj.value = result.client
    clientAddresses.value   = result.client.addresses || []

    // Если при создании был указан адрес — предвыбрать его
    if (result.address) {
      selectedAddressId.value = result.address.id
    }

    // Обновляем список клиентов
    await store.fetchClients()
  } else {
    // Выбираем существующего
    const found = availableClients.value.find(c => c.id === Number(selectedClientId.value))
    if (!found) {
      noty('warning', 'Выберите клиента из списка')
      return
    }
    selectedClientObj.value = found
    clientAddresses.value   = await fetchAddresses(found.id)
    selectedAddressId.value = clientAddresses.value[0]?.id ?? null
  }

  clientPopupStep.value = 2
}

/** Шаг 2: назад */
const backToStep1 = () => {
  clientPopupStep.value = 1
}

/** Шаг 2: добавить новый адрес */
const confirmAddAddress = async () => {
  if (!newAddressText.value.trim()) {
    noty('warning', 'Введите адрес')
    return
  }
  const addr = await addAddress(selectedClientObj.value.id, newAddressText.value)
  if (addr) {
    clientAddresses.value.push(addr)
    selectedAddressId.value  = addr.id
    newAddressText.value     = ''
    showNewAddressForm.value = false
  }
}

/** Шаг 2: подтвердить → установить клиента в store и закрыть попап */
const confirmStep2 = () => {
  const addr = clientAddresses.value.find(a => a.id === Number(selectedAddressId.value)) ?? null

  store.setCurrentClient(selectedClientObj.value, addr?.id ?? null)
  store.currentRoomId   = selectedRoomId.value
  store.currentRoomNote = roomNote.value
  store.saveDraftClient()

  showClientPopup.value = false
  noty('success', `Клиент: ${selectedClientObj.value.name}`)
}

/** Кнопка «Сменить клиента» */
const changeClient = () => {
  clientPopupStep.value = 1
  newClientMode.value   = false
  showClientPopup.value = true
}

const showClientSelect = () => {
  showClientSelectPopup.value = true
  showClientPopup.value = false
}

const handleSelectClient = () => {
  showClientSelectPopup.value = false
  showClientPopup.value = true
}

const toggleClientSelectMode = () => {}

const handleGetRooms = () => {
  showGetRoomsPopup.value = false
}

const handleTriangulateAuto = () => {
  showTriangulatePopup.value = false
  // Вызываем оригинальный обработчик из sketch.js если он установлен
  const triangulateAutoBtn = document.getElementById('triangulate_auto')
  if (triangulateAutoBtn && triangulateAutoBtn.onclick) {
    triangulateAutoBtn.onclick()
  } else {
    // Если обработчик еще не установлен, устанавливаем значения напрямую
    if (window.elem_popup2) {
      window.elem_popup2.style.display = 'none'
    }
    if (window.elem_window) {
      window.elem_window.style.display = 'block'
    }
    if (typeof window.triangulate_rezhim !== 'undefined') {
      window.triangulate_rezhim = 1
    }
    if (typeof window.ok_enter_all === 'function') {
      try {
        window.ok_enter_all()
      } catch (e) {
        console.error('Ошибка в ok_enter_all:', e)
      }
    }
  }
}

const handleTriangulateManual = () => {
  showTriangulatePopup.value = false
  // Логика ручной триангуляции
}

const handleCoordinatesOk = () => {
  showCoordinatesPopup.value = false
  // Логика вставки координат
}

const handleBuildOk = () => {
  showBuildPopup.value = false
  // Логика построения по длинам
}

const handleInnerCutout = (type) => {
  showInnerCutoutPopup.value = false
  // Логика внутреннего выреза
}

const handleLevel = (level) => {
  showLevelPopup.value = false
  // Логика выбора уровня
}

const toggleMenu = () => {
  showMenu.value = !showMenu.value
}

const cancelLastAction = () => {
  // Отмена последнего действия
}

const resetCanvas = () => {
  // Очистка canvas
}

const closeSketch = () => {
  // Закрытие редактора
}

const saveAndClose = async () => {
  if (!store.currentClient) {
    noty('warning', 'Сначала выберите клиента')
    showClientPopup.value = true
    return
  }

  const drawingData = window.optimized_drawing_data
  if (!drawingData) {
    noty('warning', 'Нет данных чертежа. Постройте чертёж.')
    return
  }

  showPreloader.value = true

  try {
    const base   = window.location.origin || ''
    const client = store.currentClient
    const addr   = store.currentAddress

    // Собираем SVG (текст)
    const cutImgSvg  = window.cut_img  || null
    const calcImgSvg = window.calc_img || null

    // Сохраняем чертёж
    const { data: drawing } = await axios.post(`${base}/api/calc/drawings`, {
      client_id:        client.id,
      address_id:       addr?.id ?? null,
      room_id:          store.currentRoomId || null,
      room_note:        store.currentRoomNote || null,
      title:            null,
      drawing_data:     drawingData,
      raw_drawing_data: window.drawing_data_parsed ?? null,
      raw_cuts_json:    window.cuts_json            ?? null,
      cut_img_svg:      cutImgSvg,
      calc_img_svg:     calcImgSvg,
      goods_data:       drawingData.goods_and_jobs?.goods ?? null,
      works_data:       drawingData.goods_and_jobs?.jobs  ?? null,
    }, { withCredentials: true })

    // Обновляем #calc_id в форме sketch.js
    const calcIdEl = document.getElementById('calc_id')
    if (calcIdEl) calcIdEl.value = drawing.id

    // Загружаем PNG изображения отдельно (не в теле основного запроса)
    await uploadPng(base, drawing.id, 'png',     window.png_img)
    await uploadPng(base, drawing.id, 'png_alt', window.png__img)

    noty('success', 'Чертёж сохранён')

    // Обновляем список чертежей
    await store.fetchDrawings(client.id)
  } catch (e) {
    console.error('saveAndClose error:', e)
    const msg = e?.response?.data?.message || 'Ошибка сохранения чертежа'
    noty('error', msg)
  } finally {
    showPreloader.value = false
  }
}

/** Загрузить одно PNG изображение как base64. */
async function uploadPng(base, drawingId, type, source) {
  if (!source) return
  try {
    let base64 = null
    if (typeof source === 'string' && source.startsWith('data:')) {
      base64 = source
    } else if (source?.canvas?.toDataURL) {
      base64 = source.canvas.toDataURL('image/png')
    } else if (source?.toDataURL) {
      base64 = source.toDataURL('image/png')
    }
    if (!base64) return

    await axios.post(`${base}/api/calc/drawings/${drawingId}/images`, {
      type,
      image_base64: base64,
    }, { withCredentials: true })
  } catch (e) {
    console.warn(`uploadPng [${type}] error:`, e)
  }
}

const placeLights = () => {
  // Размещение светильников
}

const numPadInput = (value) => {
  newLength.value += value
}

const numPadBack = () => {
  newLength.value = newLength.value.slice(0, -1)
}

const numPadOk = () => {
  showNumPad.value = false
  // Обработка введенной длины
}

onMounted(async () => {
  // Загружаем список клиентов для попапа
  await store.fetchClients()

  // Показываем попап только если клиент не выбран
  showClientPopup.value = !store.currentClient

  // Показываем прелоадер при загрузке
  showPreloader.value = true
  
  // Ждем, пока DOM полностью загрузится и Paper.js будет доступен
  const initCanvas = () => {
    if (canvas.value) {
      // Передаем callback для скрытия прелоадера после успешной инициализации
      initSketch(canvas.value, () => {
        showPreloader.value = false
      })
      setupCanvasEvents(canvas.value)
      setupPopupSync()
    } else {
      // Пробуем найти canvas по ID
      const canvasElement = document.getElementById('myCanvas')
      if (canvasElement) {
        // Передаем callback для скрытия прелоадера после успешной инициализации
        initSketch(canvasElement, () => {
          showPreloader.value = false
        })
        setupCanvasEvents(canvasElement)
        setupPopupSync()
      } else {
        // Если canvas еще не создан, ждем еще
        setTimeout(initCanvas, 100)
      }
    }
  }
  
  // Настройка событий canvas для предотвращения блокировки рисования
  const setupCanvasEvents = (canvasEl) => {
    if (!canvasEl) return
    
    // Обработчик wheel для восстановления фокуса canvas
    canvasEl.addEventListener('wheel', (e) => {
      // Убеждаемся, что canvas получает фокус при zoom
      canvasEl.focus()
      // Предотвращаем скролл страницы при zoom на canvas
      if (e.target === canvasEl || canvasEl.contains(e.target)) {
        e.stopPropagation()
      }
    }, { passive: false })
    
    // Обработчик клика для восстановления фокуса
    canvasEl.addEventListener('mousedown', (e) => {
      canvasEl.focus()
    }, { passive: true })
    
    // Убеждаемся, что canvas может получать фокус
    canvasEl.setAttribute('tabindex', '0')
  }
  
  // Синхронизация popup2, popup_canvas и popup_canvasColor с Vue реактивностью
  const setupPopupSync = () => {
    // Ждем, пока все popup будут в DOM
    setTimeout(() => {
      const popup2Element = document.getElementById('popup2')
      const popupCanvasElement = document.getElementById('popup_canvas')
      const popupCanvasColorElement = document.getElementById('popup_canvasColor')
      
      if (!popup2Element || !popupCanvasElement || !popupCanvasColorElement) {
        // Пробуем еще раз
        setTimeout(setupPopupSync, 200)
        return
      }
      
      // Функция для создания синхронизации popup
      const syncPopup = (element, refValue) => {
        // Отслеживаем изменения style.display через MutationObserver
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
              const display = element.style.display
              if (display === 'block' && !refValue.value) {
                refValue.value = true
              } else if (display === 'none' && refValue.value) {
                refValue.value = false
              }
            }
          })
        })
        
        observer.observe(element, {
          attributes: true,
          attributeFilter: ['style']
        })
        
        // Перехватываем изменения через CSSStyleDeclaration
        const originalStyle = element.style
        const styleProxy = new Proxy(originalStyle, {
          set: function(target, property, value) {
            if (property === 'display') {
              // Синхронизируем с Vue
              if (value === 'block') {
                refValue.value = true
              } else if (value === 'none') {
                refValue.value = false
              }
            }
            return Reflect.set(target, property, value)
          }
        })
        
        // Заменяем style на прокси
        try {
          Object.defineProperty(element, 'style', {
            get: function() {
              return styleProxy
            },
            configurable: true
          })
        } catch (e) {
          console.warn(`Не удалось перехватить style для ${element.id}:`, e)
        }
      }
      
      // Синхронизируем все popup
      syncPopup(popup2Element, showTriangulatePopup)
      syncPopup(popupCanvasElement, showCanvasPopup)
      syncPopup(popupCanvasColorElement, showCanvasColorPopup)
    }, 500)
  }
  
  // Ждем загрузки Paper.js и полной готовности DOM
  const waitForReady = () => {
    if (typeof window.paper === 'undefined') {
      const checkPaper = setInterval(() => {
        if (typeof window.paper !== 'undefined') {
          clearInterval(checkPaper)
          // Ждем еще немного, чтобы все элементы были в DOM
          setTimeout(initCanvas, 800)
        }
      }, 100)
    } else {
      // Ждем, чтобы все элементы Vue компонента были отрендерены
      setTimeout(initCanvas, 800)
    }
  }
  
  // Используем nextTick для ожидания рендеринга Vue
  nextTick(() => {
    waitForReady()
  })
})
</script>

<style scoped>
/* main-2 на всю высоту без скролла */
#main-2 {
  height: 100vh;
  overflow: hidden;
  position: relative;
}

/* Убеждаемся, что canvas получает события мыши */
#myCanvas {
  touch-action: none;
  pointer-events: auto;
  -webkit-user-select: none;
  user-select: none;
}

/* Popup клиента — оверлей поверх всего */
.popup-client-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.popup-client-box {
  background: #fff;
  border-radius: 10px;
  padding: 24px 28px;
  min-width: 320px;
  max-width: 420px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
}
.popup-client-title {
  margin: 0 0 16px;
  font-size: 1.15rem;
  font-weight: 600;
  color: #1a1a1a;
}
.popup-client-box label {
  display: block;
  font-size: 0.85rem;
  color: #555;
  margin: 10px 0 3px;
}
.popup-client-box .form-control {
  width: 100%;
  margin-bottom: 4px;
}
.popup-client-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  flex-wrap: wrap;
}

/* Строка текущего клиента над canvas */
.current-client-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 10px;
  background: #f0f4ff;
  border-bottom: 1px solid #dde4f5;
  font-size: 0.85rem;
  color: #333;
}
.current-client-bar span { flex: 1; }

/* NumPad (window) должен быть поверх sketch_editor2 */
#window {
  z-index: 10000 !important;
  position: fixed !important;
}

/* sketch_editor2 должен быть ниже NumPad */
#sketch_editor2 {
  z-index: 10;
  position: absolute;
}
</style>

