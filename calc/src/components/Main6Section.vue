<template>
  <div id="main-6" style="display: block;">
    <div class="container btn-block btn-block-ceiling">
      <div class="container btn-block btn-block-client">
        <button 
          id="files-admin" 
          type="button" 
          class="btn"
          :class="activeTab === 'files' ? 'btn-success' : 'btn-info'"
          @click="activeTab = 'files'"
        >
          Формирование файлов
        </button>
        <button 
          id="smeta-admin" 
          type="button" 
          class="btn"
          :class="activeTab === 'smeta' ? 'btn-success' : 'btn-info'"
          @click="activeTab = 'smeta'"
        >
          Редактор Наменклатуры Сметы
        </button>
        <button 
          type="button" 
          class="btn btn-info"
          @click="activeTab = 'settings'"
        >
          Настройки компании
        </button>
      </div>
      
      <div class="block-admins">
        <div class="admin files-admin" v-show="activeTab === 'files'">
          <button 
            id="form-smeta-client" 
            type="button" 
            class="btn btn-success active btn-info"
            @click="generateSmeta('client')"
          >
            Сформировать смету клиента
          </button>
          <button 
            id="form-smeta-montaj" 
            type="button" 
            class="btn btn-success active btn-info"
            @click="generateSmeta('montaj')"
          >
            Сформировать смету монтажника
          </button>
          <div id="resultHREF"></div>
          <div class="container-fluid hr"></div>
        </div>
        
        <div class="admin smeta-admin" v-show="activeTab === 'smeta'">
          <div class="container btn-block btn-block-client" style="margin-top: 20px">
            <button 
              id="smata-works-redactor" 
              type="button" 
              class="btn"
              :class="redactorType === 'works' ? 'btn-success' : 'btn-info'"
              @click="redactorType = 'works'"
            >
              Работы
            </button>
            <button 
              id="smata-materials-redactor" 
              type="button" 
              class="btn"
              :class="redactorType === 'materials' ? 'btn-success' : 'btn-info'"
              @click="redactorType = 'materials'"
            >
              Материалы
            </button>
          </div>

          <div class="container">
            <div class="row">
              <div class="col-12">
                <div id="navsRedactor"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAppStore } from '../stores/appStore'
import { noty } from '../utils/noty'

const store = useAppStore()

const activeTab = ref('files')
const redactorType = ref('works')

const generateSmeta = (type) => {
  // Логика генерации сметы
  noty('success', `Смета ${type === 'client' ? 'клиента' : 'монтажника'} сформирована`)
}

onMounted(() => {
  store.listGroopRedactor()
})
</script>

