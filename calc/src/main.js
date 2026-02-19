import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { inputMask } from './directives/inputMask'

const app = createApp(App)

// Регистрируем директиву для маски ввода
app.directive('mask', inputMask)

app.mount('#app')

