<template>
  <div id="main-3" style="display: block;">
    <div class="container">
      <div class="row">
        <div class="col-xs-8">
          <input 
            id="addCategories" 
            class="form-control form-control-sm" 
            type="text" 
            placeholder="добавить категорию"
            v-model="newCategory"
            @keyup.enter="addCategory"
          >
        </div>
        <div class="col-xs-4">
          <button id="btn_categories" type="submit" class="btn btn-primary" @click="addCategory">Добавить</button>
        </div>
      </div>
    </div>
    <div class="container-fluid hr"></div>

    <div class="container formGroops">
      <div class="row">
        <div class="col-xs-8">
          <select id="groops" class="form-control" v-model="selectedGroup">
            <option v-for="group in groups" :key="group.id" :value="group.id">
              {{ group.name }}
            </option>
          </select>
        </div>
        <div class="col-xs-4">
          <button id="btn_categories_delete" type="submit" class="btn btn-danger" @click="deleteCategory">Удалить</button>
        </div>
      </div>
      
      <div class="row">
        <div class="col-xs-12 ta-center">
          <label for="name" class="form-label">Наименование</label>
          <input 
            id="name" 
            class="form-control form-control-sm" 
            type="text" 
            placeholder="Наименование"
            v-model="form.name"
          >
        </div>
      </div>

      <div class="row">
        <div class="col-xs-12 ta-center">
          <label for="unit" class="form-label">Ед.измерения</label>
        </div>
        <div class="col-xs-12">
          <select id="unit" class="form-control" v-model="form.unit">
            <option v-for="u in units" :key="u.id" :value="u.id">{{ u.name }}</option>
          </select>
        </div>
        <div class="col-xs-12">
          <div class="col-xs-12 ta-center price-multiple">
            <label for="price-multiple" class="form-label">Кратность ед.</label>
            <input 
              id="price-multiple" 
              class="form-control form-control-sm" 
              type="number" 
              placeholder="0.01"
              v-model.number="form.priceMultiple"
            >
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-xs-12 ta-center form-check">
          <input 
            class="form-check-input" 
            type="checkbox" 
            id="priceCheckChecked"
            v-model="form.isMaterial"
            @change="toggleMaterialFields"
          >
          <label class="form-check-label" for="priceCheckChecked">
            Отметить если это материал
          </label>
        </div>
      </div>

      <div class="row">
        <div class="col-xs-12 ta-center price-client">
          <label for="price-client" class="form-label">Стоимость для клиента</label>
          <input 
            id="price-client" 
            class="form-control form-control-sm" 
            type="number" 
            placeholder="Стоимость"
            v-model.number="form.priceClient"
          >
        </div>
        <div class="col-xs-12 ta-center price-montaj">
          <label for="price-montaj" class="form-label">Стоимость для монтажника</label>
          <input 
            id="price-montaj" 
            class="form-control form-control-sm" 
            type="number" 
            placeholder="Стоимость"
            v-model.number="form.priceMontaj"
          >
        </div>
        <div class="col-xs-12 ta-center price-materiall" v-show="form.isMaterial">
          <label for="price-materiall" class="form-label">Стоимость материала</label>
          <input 
            id="price-materiall" 
            class="form-control form-control-sm" 
            type="number" 
            placeholder="Стоимость"
            v-model.number="form.priceMaterial"
          >
        </div>
        <div class="col-xs-12 ta-center formFileMultiple" v-show="form.isMaterial">
          <label for="formFileMultiple" class="form-label">Загрузить фото товара</label>
          <input 
            class="form-control" 
            type="file" 
            id="formFileMultiple" 
            multiple
            @change="handleFileUpload"
          >
        </div>
      </div>

      <div class="row">
        <div class="col-xs-12 ta-center">
          <label for="communications" class="form-label">Тип значения</label>
        </div>
        <div class="col-xs-12">
          <select id="communications" class="form-control" v-model="form.communication">
            <option value="0">Default</option>
            <option v-for="comm in communications" :key="comm.id" :value="comm.id">
              {{ comm.placeholder }}
            </option>
          </select>
        </div>
      </div>

      <div class="row">
        <div class="col-xs-12 ta-center" style="margin-top: 25px;">
          <button id="btn-new-price" type="submit" class="btn btn-primary" @click="createPrice">Создать</button>
        </div>
      </div>
    </div>

    <div class="container-fluid hr"></div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useCategories } from '../composables/useCategories'
import { noty } from '../utils/noty'

const { groups, units, communications, loadData, addCategory: addCategoryToStore, deleteCategory: deleteCategoryFromStore } = useCategories()

const newCategory = ref('')
const selectedGroup = ref('')
const form = reactive({
  name: '',
  unit: '',
  priceMultiple: 0.01,
  isMaterial: false,
  priceClient: '',
  priceMontaj: '',
  priceMaterial: '',
  communication: '0',
  files: []
})

const addCategory = () => {
  if (!newCategory.value.trim()) {
    noty('warning', 'Введите название категории')
    return
  }
  addCategoryToStore(newCategory.value)
  newCategory.value = ''
  noty('success', 'Категория добавлена')
}

const deleteCategory = () => {
  if (!selectedGroup.value) {
    noty('warning', 'Выберите категорию для удаления')
    return
  }
  deleteCategoryFromStore(selectedGroup.value)
  selectedGroup.value = ''
  noty('success', 'Категория удалена')
}

const toggleMaterialFields = () => {
  // Поля уже управляются через v-show
}

const handleFileUpload = (event) => {
  form.files = Array.from(event.target.files)
}

const createPrice = () => {
  if (!form.name) {
    noty('warning', 'Введите наименование')
    return
  }
  // Логика создания цены
  noty('success', 'Цена создана')
  // Сброс формы
  Object.assign(form, {
    name: '',
    unit: '',
    priceMultiple: 0.01,
    isMaterial: false,
    priceClient: '',
    priceMontaj: '',
    priceMaterial: '',
    communication: '0',
    files: []
  })
}

onMounted(() => {
  loadData()
})
</script>

