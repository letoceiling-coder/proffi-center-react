<template>
  <!-- Страница входа: только после успешной авторизации показываем калькулятор -->
  <div v-if="!telegramUser" class="calc-login-page">
    <div class="calc-login-card">
      <h1 class="calc-login-title">Калькулятор натяжных потолков</h1>
      <p class="calc-login-subtitle">Войдите через Telegram для доступа</p>
      <template v-if="authChecked">
        <template v-if="telegramBotUsername">
          <div id="telegram-login-root" class="calc-login-widget"></div>
        </template>
        <template v-else>
          <p class="calc-login-error">Вход временно недоступен. Настройте бота в админ-панели.</p>
        </template>
      </template>
      <template v-else>
        <p class="calc-login-loading">Загрузка…</p>
      </template>
    </div>
  </div>

  <!-- Калькулятор: только для авторизованных -->
  <div v-else class="content" :class="{ 'main-2-active': activeSection === 'main-2' }">
    <!-- Попап выбора клиента — на уровне App, показывается при входе в раздел чертежа (main-2) без клиента или по кнопке «Сменить» -->
    <ClientPopup v-if="activeSection === 'main-2' && (!store.currentClient || store.showClientPopup)" />

    <div class="calc-auth container">
      <span class="calc-auth-user">Вход: {{ telegramUser.first_name }}{{ telegramUser.username ? ' @' + telegramUser.username : '' }}</span>
      <button type="button" class="btn btn-sm btn-outline-secondary calc-auth-logout" @click="logout">Выйти</button>
    </div>
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

    <Main1Section v-if="activeSection === 'main-1'" />
    <Main2Section v-if="activeSection === 'main-2'" />
    <Main3Section v-if="activeSection === 'main-3'" />
    <Main4Section v-if="activeSection === 'main-4'" />
    <Main5Section v-if="activeSection === 'main-5'" />
    <Main6Section v-if="activeSection === 'main-6'" />
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useAppStore } from './stores/appStore'
import Main1Section from './components/Main1Section.vue'
import Main2Section from './components/Main2Section.vue'
import Main3Section from './components/Main3Section.vue'
import Main4Section from './components/Main4Section.vue'
import Main5Section from './components/Main5Section.vue'
import Main6Section from './components/Main6Section.vue'

const store = useAppStore()
const activeSection = ref('main-2')
const telegramUser = ref(null)
const telegramBotUsername = ref('')
const authChecked = ref(false)

function getBaseUrl () {
  if (typeof window === 'undefined') return ''
  return window.location.origin || ''
}

async function fetchMe () {
  const base = getBaseUrl()
  try {
    const r = await fetch(base + '/api/calc/me', { credentials: 'include' })
    if (r.ok) telegramUser.value = await r.json()
    else telegramUser.value = null
  } catch (_) {
    telegramUser.value = null
  }
}

async function loadConfig () {
  const base = getBaseUrl()
  try {
    const r = await fetch(base + '/api/calc/config', { credentials: 'include' })
    if (r.ok) {
      const data = await r.json()
      telegramBotUsername.value = (data.telegram_bot_username || '').replace(/^@/, '') || ''
    }
  } catch (_) {}
}

function loadTelegramWidget () {
  if (!telegramBotUsername.value) return
  const root = document.getElementById('telegram-login-root')
  if (!root || root.querySelector('script')) return
  const authUrl = getBaseUrl() + '/auth/telegram-callback'
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://telegram.org/js/telegram-widget.js?22'
  script.setAttribute('data-telegram-login', telegramBotUsername.value)
  script.setAttribute('data-size', 'medium')
  script.setAttribute('data-auth-url', authUrl)
  script.setAttribute('data-request-access', 'write')
  root.appendChild(script)
}

async function logout () {
  const base = getBaseUrl()
  try {
    await fetch(base + '/api/calc/logout', { method: 'POST', credentials: 'include' })
  } catch (_) {}
  telegramUser.value = null
}

const headerIcons = [
  { id: 'main-1', src: 'images/icon/blueprint.png', title: '' },
  { id: 'main-2', src: 'images/icon/add.png', title: 'Новый чертеж' },
  { id: 'main-3', src: 'images/icon/listing.png', title: '' },
  { id: 'main-4', src: 'images/icon/project-management.png', title: '' },
  { id: 'main-5', src: 'images/icon/document.png', title: '' },
  { id: 'main-6', src: 'images/icon/user.png', title: '' }
]

const handleIconClick = (sectionId) => {
  activeSection.value = sectionId

  if (sectionId === 'main-2') {
    store.clearElems()
    if (!store.currentClient) store.showClientPopup = true
  }
  
  if (['main-1', 'main-3', 'main-4', 'main-5'].includes(sectionId)) {
    store.setCeilingOne(true)
  }
  
  if (sectionId === 'main-6') {
    store.listGroopRedactor()
  }
}

onMounted(async () => {
  await fetchMe()
  if (telegramUser.value) {
    authChecked.value = true
    store.getRooms()
    store.getStorageReturn()
    return
  }
  await loadConfig()
  authChecked.value = true
  if (telegramBotUsername.value) {
    await nextTick()
    loadTelegramWidget()
  }
  const err = typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('telegram_error') : null
  if (err === 'invalid') console.warn('Telegram login: неверная подпись или устаревшие данные')
  else if (err === 'config') console.warn('Telegram login: бот не настроен (TELEGRAM_BOT_TOKEN)')
})

watch(telegramBotUsername, (username) => {
  if (username && !telegramUser.value) setTimeout(loadTelegramWidget, 100)
})

watch(telegramUser, (user) => {
  if (user) {
    store.getRooms()
    store.getStorageReturn()
  }
})
</script>

<style scoped>
/* Страница входа — отдельный экран до авторизации */
.calc-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  padding: 1rem;
}
.calc-login-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  padding: 2rem 2.5rem;
  text-align: center;
  max-width: 380px;
  width: 100%;
}
.calc-login-title {
  font-size: 1.35rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}
.calc-login-subtitle {
  font-size: 0.95rem;
  color: #666;
  margin: 0 0 1.5rem 0;
}
.calc-login-widget {
  display: flex;
  justify-content: center;
  min-height: 44px;
}
.calc-login-widget :deep(iframe) {
  vertical-align: middle;
}
.calc-login-loading,
.calc-login-error {
  font-size: 0.9rem;
  color: #888;
  margin: 0;
}
.calc-login-error {
  color: #c00;
}

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
.header-block .icons {
  cursor: pointer;
  padding: 10px;
  border: 2px solid transparent;
}
.header-block .icons.active {
  border-color: blue;
}
.content.main-2-active {
  height: 100vh;
  overflow: hidden;
}
</style>

