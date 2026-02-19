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

    <!-- ===================== POPUP КЛИЕНТА ===================== -->
    <div id="popup_client" v-show="showClientPopup" class="popup-client-overlay">
      <div class="popup-client-box">

        <!-- ══════════════ ШАГ 1: Выбор / создание клиента ══════════════ -->
        <div v-if="clientPopupStep === 1">

          <!-- Заголовок -->
          <div class="pcp-header">
            <span class="pcp-title">Выбор клиента</span>
          </div>

          <!-- ── Режим: создание нового клиента ── -->
          <div v-if="newClientMode" class="pcp-section">
            <div class="pcp-back-row">
              <button class="pcp-back-btn" @click="newClientMode = false">← К списку</button>
            </div>
            <div class="pcp-field">
              <label class="pcp-label">Имя клиента <span class="pcp-required">*</span></label>
              <input
                type="text"
                class="pcp-input"
                v-model="client.name"
                placeholder="Иванов Иван Иванович"
                @keyup.enter="confirmStep1"
                autofocus
              >
            </div>
            <div class="pcp-field">
              <label class="pcp-label">Телефон</label>
              <input
                type="text"
                class="pcp-input"
                v-model="client.phone"
                v-mask="'+7 (999) 999-99-99'"
                placeholder="+7 (___) ___-__-__"
              >
            </div>
            <div class="pcp-field">
              <label class="pcp-label">Адрес объекта</label>
              <input
                type="text"
                class="pcp-input"
                v-model="client.address"
                placeholder="ул. Ленина 1, кв. 10"
              >
            </div>
            <div class="pcp-actions">
              <button class="pcp-btn pcp-btn-primary" @click="confirmStep1" :disabled="!client.name.trim()">
                Далее →
              </button>
            </div>
          </div>

          <!-- ── Режим: поиск и выбор существующего клиента ── -->
          <div v-else class="pcp-section">

            <!-- Табы: По клиенту / По адресу -->
            <div class="pcp-tabs">
              <button
                class="pcp-tab"
                :class="{ active: searchTab === 'client' }"
                @click="switchTab('client')"
              >По клиенту</button>
              <button
                class="pcp-tab"
                :class="{ active: searchTab === 'address' }"
                @click="switchTab('address')"
              >По адресу</button>
            </div>

            <!-- Поиск по клиенту -->
            <div v-if="searchTab === 'client'">
              <div class="pcp-search-row">
                <input
                  type="text"
                  class="pcp-input"
                  v-model="clientSearch"
                  placeholder="Поиск по имени или телефону..."
                  @input="onClientSearch"
                >
              </div>

              <div v-if="store.clientsLoading" class="pcp-loading">Загрузка...</div>

              <div v-else-if="filteredClients.length === 0" class="pcp-empty">
                {{ clientSearch ? 'Ничего не найдено' : 'Клиентов ещё нет' }}
              </div>

              <div v-else class="pcp-list">
                <div
                  v-for="c in filteredClients"
                  :key="c.id"
                  class="pcp-list-item"
                  :class="{ selected: selectedClientId == c.id }"
                  @click="selectClientFromList(c)"
                >
                  <span class="pcp-item-name">{{ c.name }}</span>
                  <span class="pcp-item-sub">{{ c.phone || '' }}</span>
                  <span class="pcp-item-badge" v-if="c.drawings_count">{{ c.drawings_count }} чертежей</span>
                </div>
              </div>
            </div>

            <!-- Поиск по адресу -->
            <div v-if="searchTab === 'address'">
              <div class="pcp-search-row">
                <input
                  type="text"
                  class="pcp-input"
                  v-model="addressSearch"
                  placeholder="Поиск по адресу..."
                  @input="onAddressSearch"
                >
              </div>

              <div v-if="addressSearchLoading" class="pcp-loading">Поиск...</div>

              <div v-else-if="addressResults.length === 0" class="pcp-empty">
                {{ addressSearch ? 'Ничего не найдено' : 'Введите адрес для поиска' }}
              </div>

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

            <!-- Действия -->
            <div class="pcp-actions pcp-actions-split">
              <button
                class="pcp-btn pcp-btn-primary"
                @click="confirmStep1"
                :disabled="!selectedClientId && !selectedAddressResult"
              >
                Далее →
              </button>
              <button class="pcp-btn pcp-btn-secondary" @click="startNewClient">
                + Новый клиент
              </button>
            </div>
          </div>
        </div>

        <!-- ══════════════ ШАГ 2: Адрес + помещение ══════════════ -->
        <div v-if="clientPopupStep === 2">
          <div class="pcp-header">
            <button class="pcp-back-btn" @click="backToStep1">← Назад</button>
            <span class="pcp-title">Адрес и помещение</span>
          </div>

          <!-- Клиент -->
          <div class="pcp-client-badge">
            <span class="pcp-client-icon">👤</span>
            <span>
              <strong>{{ selectedClientObj?.name }}</strong>
              <em v-if="selectedClientObj?.phone"> · {{ selectedClientObj.phone }}</em>
            </span>
          </div>

          <!-- Адрес -->
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
                <span class="pcp-address-radio">{{ selectedAddressId == a.id ? '●' : '○' }}</span>
                {{ a.address }}
              </div>
              <div
                class="pcp-address-item pcp-address-none"
                :class="{ selected: selectedAddressId === null }"
                @click="selectedAddressId = null"
              >
                <span class="pcp-address-radio">{{ selectedAddressId === null ? '●' : '○' }}</span>
                — без адреса —
              </div>
            </div>

            <!-- Если адресов нет -->
            <div v-else class="pcp-empty" style="margin:6px 0;">Адресов нет</div>

            <!-- Добавить адрес -->
            <div v-if="!showNewAddressForm" class="pcp-add-link" @click="showNewAddressForm = true">
              + Добавить адрес
            </div>
            <div v-else class="pcp-add-form">
              <input
                type="text"
                class="pcp-input"
                v-model="newAddressText"
                placeholder="Новый адрес объекта"
                @keyup.enter="confirmAddAddress"
              >
              <div style="display:flex;gap:6px;margin-top:6px;">
                <button class="pcp-btn pcp-btn-sm pcp-btn-primary" @click="confirmAddAddress">Сохранить</button>
                <button class="pcp-btn pcp-btn-sm pcp-btn-secondary" @click="showNewAddressForm = false">Отмена</button>
              </div>
            </div>
          </div>

          <!-- Тип помещения -->
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

          <!-- Уточнение -->
          <div class="pcp-field">
            <label class="pcp-label">Уточнение <em>(необязательно)</em></label>
            <input
              type="text"
              class="pcp-input"
              v-model="roomNote"
              placeholder="Спальня хозяев, кабинет 2..."
            >
          </div>

          <div class="pcp-actions">
            <button class="pcp-btn pcp-btn-primary pcp-btn-full" @click="confirmStep2">
              ✓ Начать чертёж
            </button>
          </div>
        </div>

      </div>
    </div>
    <!-- ===================== / POPUP КЛИЕНТА ===================== -->

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

// ──── Popup: всегда показывать при входе в раздел чертежа (перед созданием чертежа обязателен клиент) ────
const showClientPopup = ref(true)
const showGetRoomsPopup = ref(false)
const showClientSelectPopup = ref(false)
const showPreloader = ref(false)

// ──── Popup шаги: 1=выбор/создание клиента, 2=адрес+комната ────
const clientPopupStep = ref(1)
const newClientMode   = ref(false)   // создаём нового или выбираем

// Поиск клиента / адреса
const searchTab          = ref('client')   // 'client' | 'address'
const clientSearch       = ref('')
const addressSearch      = ref('')
const addressResults     = ref([])
const addressSearchLoading = ref(false)
const selectedAddressResult = ref(null)   // результат выбора из "по адресу"

let addressSearchTimer = null
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

const filteredClients = computed(() => {
  const q = clientSearch.value.trim().toLowerCase()
  if (!q) return availableClients.value
  return availableClients.value.filter(c =>
    (c.name  || '').toLowerCase().includes(q) ||
    (c.phone || '').toLowerCase().includes(q)
  )
})

// Всегда тот же origin, без внешних URL
const formDataAction = computed(() => {
  if (typeof window === 'undefined') return '/api/calc/sketch'
  return (window.location.origin || '') + '/api/calc/sketch'
})

const canvas = ref(null)

// ──── Методы popup_client ────

/** Переключить таб поиска */
const switchTab = (tab) => {
  searchTab.value      = tab
  selectedClientId.value   = ''
  selectedAddressResult.value = null
  clientSearch.value   = ''
  addressSearch.value  = ''
  addressResults.value = []
}

/** Живой поиск по клиентам (фильтр через filteredClients computed) */
const onClientSearch = () => {
  selectedClientId.value = ''
}

/** Живой поиск по адресам (debounce 350 мс) */
const onAddressSearch = () => {
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
      const { data } = await axios.get(`${base}/api/calc/addresses`, {
        params: { search: q },
        withCredentials: true,
      })
      addressResults.value = data
    } catch (e) {
      console.warn('Address search error:', e)
      addressResults.value = []
    } finally {
      addressSearchLoading.value = false
    }
  }, 350)
}

/** Выбрать клиента из списка (кликом по карточке) */
const selectClientFromList = (c) => {
  selectedClientId.value = c.id
}

/** Выбрать адрес из результатов поиска по адресу */
const selectFromAddressResult = (a) => {
  selectedAddressResult.value = a
  selectedClientId.value      = a.client_id
}

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

    if (result.address) {
      selectedAddressId.value = result.address.id
    } else {
      selectedAddressId.value = clientAddresses.value[0]?.id ?? null
    }

    await store.fetchClients()

  } else if (selectedAddressResult.value) {
    // Выбор через таб «По адресу»
    const ar = selectedAddressResult.value
    const found = availableClients.value.find(c => c.id === ar.client_id)
    selectedClientObj.value = found || {
      id: ar.client_id, name: ar.client_name, phone: ar.client_phone,
    }
    clientAddresses.value   = await fetchAddresses(ar.client_id)
    selectedAddressId.value = ar.address_id

  } else {
    // Выбор через таб «По клиенту»
    const clientIdNum = Number(selectedClientId.value)
    if (!clientIdNum) {
      noty('warning', 'Выберите клиента из списка')
      return
    }
    const found = availableClients.value.find(c => c.id === clientIdNum)
    if (!found) {
      noty('warning', 'Клиент не найден')
      return
    }
    selectedClientObj.value = found
    clientAddresses.value   = await fetchAddresses(found.id)
    const keepAddr = clientAddresses.value.find(a => a.id === Number(selectedAddressId.value))
    selectedAddressId.value = keepAddr ? selectedAddressId.value : (clientAddresses.value[0]?.id ?? null)
  }

  clientPopupStep.value = 2
  // По умолчанию помещение — Гостиная
  if (!selectedRoomId.value && rooms.value?.length) {
    const gost = rooms.value.find(r => r.name === 'Гостиная')
    selectedRoomId.value = gost?.id ?? rooms.value[0]?.id
  }
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
  // Помещение: по умолчанию «Гостиная», если не выбрано
  let roomId = selectedRoomId.value
  if (!roomId && rooms.value?.length) {
    const gost = rooms.value.find(r => r.name === 'Гостиная')
    roomId = gost?.id ?? rooms.value[0]?.id
  }
  store.currentRoomId   = roomId
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

  // Всегда показываем попап при открытии раздела чертежа: у каждого чертежа должен быть клиент с адресом и помещением
  showClientPopup.value = true

  // Если уже есть клиент (например из прошлого сеанса) — предзаполняем попап, чтобы можно было просто нажать «Далее» → «Начать чертёж»
  if (store.currentClient?.id) {
    selectedClientId.value   = store.currentClient.id
    selectedClientObj.value  = store.currentClient
    clientAddresses.value    = await fetchAddresses(store.currentClient.id)
    selectedAddressId.value  = store.currentAddress?.id ?? clientAddresses.value[0]?.id ?? null
    selectedRoomId.value     = store.currentRoomId ?? null
    roomNote.value           = store.currentRoomNote ?? ''
    const gost = rooms.value?.find(r => r.name === 'Гостиная')
    if (!selectedRoomId.value && rooms.value?.length) {
      selectedRoomId.value = gost?.id ?? rooms.value[0]?.id
    }
  }

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
/* ─── Overlay ─── */
.popup-client-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}
.popup-client-box {
  background: #fff;
  border-radius: 12px;
  padding: 0;
  min-width: 340px;
  max-width: 460px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 12px 40px rgba(0,0,0,0.22);
}

/* ─── Header ─── */
.pcp-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px 12px;
  border-bottom: 1px solid #eee;
}
.pcp-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a1a;
  flex: 1;
}
.pcp-back-btn {
  background: none;
  border: none;
  color: #4c80f1;
  font-size: 0.88rem;
  cursor: pointer;
  padding: 0;
}
.pcp-back-btn:hover { text-decoration: underline; }
.pcp-back-row { margin-bottom: 10px; }

/* ─── Section ─── */
.pcp-section { padding: 16px 20px 20px; }

/* ─── Tabs ─── */
.pcp-tabs {
  display: flex;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;
}
.pcp-tab {
  flex: 1;
  border: none;
  background: #f5f5f5;
  color: #555;
  font-size: 0.88rem;
  padding: 8px 4px;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.pcp-tab.active {
  background: #4c80f1;
  color: #fff;
  font-weight: 600;
}
.pcp-tab:first-child { border-right: 1px solid #ddd; }

/* ─── Search ─── */
.pcp-search-row { margin-bottom: 8px; }

/* ─── Input ─── */
.pcp-input {
  display: block;
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #d0d7e3;
  border-radius: 7px;
  font-size: 0.9rem;
  outline: none;
  box-sizing: border-box;
}
.pcp-input:focus { border-color: #4c80f1; box-shadow: 0 0 0 2px rgba(76,128,241,0.12); }

/* ─── Label ─── */
.pcp-label {
  display: block;
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 4px;
}
.pcp-required { color: #e55; }

/* ─── Field ─── */
.pcp-field { margin-bottom: 14px; }

/* ─── List ─── */
.pcp-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #e4e8f0;
  border-radius: 8px;
}
.pcp-list-item {
  display: flex;
  flex-direction: column;
  padding: 9px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.12s;
}
.pcp-list-item:last-child { border-bottom: none; }
.pcp-list-item:hover { background: #f4f7ff; }
.pcp-list-item.selected { background: #eef2ff; }
.pcp-item-name { font-size: 0.92rem; font-weight: 600; color: #1a1a1a; }
.pcp-item-sub  { font-size: 0.8rem; color: #888; margin-top: 1px; }
.pcp-item-badge {
  font-size: 0.74rem;
  color: #4c80f1;
  margin-top: 2px;
}

/* ─── Loading / Empty ─── */
.pcp-loading { text-align: center; color: #888; padding: 14px; font-size: 0.88rem; }
.pcp-empty   { text-align: center; color: #aaa; padding: 14px; font-size: 0.85rem; }

/* ─── Actions ─── */
.pcp-actions { margin-top: 16px; display: flex; gap: 8px; flex-wrap: wrap; }
.pcp-actions-split { justify-content: space-between; }

/* ─── Buttons ─── */
.pcp-btn {
  padding: 9px 18px;
  border: none;
  border-radius: 7px;
  font-size: 0.9rem;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.15s;
}
.pcp-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.pcp-btn-primary   { background: #4c80f1; color: #fff; }
.pcp-btn-primary:hover:not(:disabled) { background: #3a6de0; }
.pcp-btn-secondary { background: #f0f2f7; color: #333; }
.pcp-btn-secondary:hover { background: #e3e7f0; }
.pcp-btn-sm { padding: 6px 12px; font-size: 0.82rem; }
.pcp-btn-full { width: 100%; text-align: center; }

/* ─── Client badge (step 2) ─── */
.pcp-client-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f4f7ff;
  border: 1px solid #d5e0ff;
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 14px;
  font-size: 0.9rem;
  color: #1a1a1a;
}
.pcp-client-icon { font-size: 1.1rem; }

/* ─── Address list (step 2) ─── */
.pcp-address-list {
  border: 1px solid #e4e8f0;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
}
.pcp-address-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  font-size: 0.88rem;
  transition: background 0.12s;
}
.pcp-address-item:last-child { border-bottom: none; }
.pcp-address-item:hover { background: #f4f7ff; }
.pcp-address-item.selected { background: #eef2ff; font-weight: 600; }
.pcp-address-none { color: #999; font-style: italic; }
.pcp-address-radio { color: #4c80f1; width: 14px; flex-shrink: 0; }

/* ─── Add address link / form ─── */
.pcp-add-link {
  color: #4c80f1;
  font-size: 0.85rem;
  cursor: pointer;
  margin-bottom: 4px;
}
.pcp-add-link:hover { text-decoration: underline; }
.pcp-add-form { margin-top: 6px; }

/* ─── Room grid (step 2) ─── */
.pcp-room-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.pcp-room-item {
  padding: 6px 12px;
  border: 1px solid #d0d7e3;
  border-radius: 20px;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.12s, border-color 0.12s;
  color: #333;
  background: #fafafa;
}
.pcp-room-item:hover { border-color: #4c80f1; color: #4c80f1; }
.pcp-room-item.selected { background: #4c80f1; border-color: #4c80f1; color: #fff; font-weight: 600; }

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

