<template>
  <div class="content" :class="{ 'main-2-active': activeSection === 'main-2' }">
    <!-- Telegram auth: быстрый вход (всегда виден) -->
    <div class="calc-auth container">
      <template v-if="telegramUser">
        <span class="calc-auth-user">Вход: {{ telegramUser.first_name }}{{ telegramUser.username ? ' @' + telegramUser.username : '' }}</span>
        <button type="button" class="btn btn-sm btn-outline-secondary calc-auth-logout" @click="logout">Выйти</button>
      </template>
      <template v-else-if="telegramBotUsername">
        <div id="telegram-login-root"></div>
      </template>
    </div>
    <!-- Header Navigation -->
    <div class="header-block container" v-show="activeSection !== 'main-2'">
      <div 
        v-for="icon in headerIcons" 
        :key="icon.id"
        class="icons" 
        :class="{ active: activeSection === icon.id }"
        :data-includes="icon.id"
        @click="handleIconClick(icon.id)"
      >
        <img :src="icon.src" :title="icon.title">
      </div>
    </div>

    <!-- Main Sections -->
    <Main1Section v-if="activeSection === 'main-1'" />
    <Main2Section v-if="activeSection === 'main-2'" />
    <Main3Section v-if="activeSection === 'main-3'" />
    <Main4Section v-if="activeSection === 'main-4'" />
    <Main5Section v-if="activeSection === 'main-5'" />
    <Main6Section v-if="activeSection === 'main-6'" />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useAppStore } from './stores/appStore'
import Main1Section from './components/Main1Section.vue'
import Main2Section from './components/Main2Section.vue'
import Main3Section from './components/Main3Section.vue'
import Main4Section from './components/Main4Section.vue'
import Main5Section from './components/Main5Section.vue'
import Main6Section from './components/Main6Section.vue'

const store = useAppStore()
const activeSection = ref('main-2')

const headerIcons = [
  { id: 'main-1', src: '/images/icon/blueprint.png', title: '' },
  { id: 'main-2', src: '/images/icon/add.png', title: 'Новый чертеж' },
  { id: 'main-3', src: '/images/icon/listing.png', title: '' },
  { id: 'main-4', src: '/images/icon/project-management.png', title: '' },
  { id: 'main-5', src: '/images/icon/document.png', title: '' },
  { id: 'main-6', src: '/images/icon/user.png', title: '' }
]

const handleIconClick = (sectionId) => {
  activeSection.value = sectionId
  
  if (sectionId === 'main-2') {
    store.clearElems()
  }
  
  if (['main-1', 'main-3', 'main-4', 'main-5'].includes(sectionId)) {
    store.setCeilingOne(true)
  }
  
  if (sectionId === 'main-6') {
    store.listGroopRedactor()
  }
}

onMounted(async () => {
  store.getRooms()
  if (localStorage.getItem('newClient') != null) {
    store.getStorageReturn()
  }
  await fetchMe()
  if (!telegramUser.value) {
    await loadConfig()
    if (telegramBotUsername.value) {
      loadTelegramWidget()
    }
  }
  const err = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('telegram_error')
  if (err === 'invalid') {
    console.warn('Telegram login: неверная подпись или устаревшие данные')
  } else if (err === 'config') {
    console.warn('Telegram login: бот не настроен (TELEGRAM_BOT_TOKEN)')
  }
})

watch(telegramBotUsername, (username) => {
  if (username) {
    setTimeout(loadTelegramWidget, 100)
  }
})
</script>

<style scoped>
.calc-auth {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 0;
  min-height: 36px;
}
.calc-auth-user {
  font-size: 0.9rem;
  color: #333;
}
.calc-auth-logout {
  margin-left: auto;
}
#telegram-login-root :deep(iframe) {
  vertical-align: middle;
}
.header-block .icons {
  cursor: pointer;
  padding: 10px;
  border: 2px solid transparent;
}

.header-block .icons.active {
  border-color: blue;
}

/* Скрываем скролл и делаем content на всю высоту когда main-2 активен */
.content.main-2-active {
  height: 100vh;
  overflow: hidden;
}
</style>

