import './bootstrap';
import { createApp } from 'vue';
import { createStore } from 'vuex';
import { createRouter, createWebHistory } from 'vue-router';
import axios from 'axios';
import App from './App.vue';

const API_BASE = '/api/v1';
axios.defaults.baseURL = API_BASE;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

const store = createStore({
    state: {
        user: null,
        token: localStorage.getItem('token') || null,
        menu: [],
        notifications: [],
        theme: localStorage.getItem('theme') || 'light',
    },
    mutations: {
        SET_USER(state, user) { state.user = user; },
        SET_TOKEN(state, token) {
            state.token = token;
            if (token) {
                localStorage.setItem('token', token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            } else {
                localStorage.removeItem('token');
                delete axios.defaults.headers.common['Authorization'];
            }
        },
        SET_MENU(state, menu) { state.menu = menu; },
        SET_NOTIFICATIONS(state, notifications) { state.notifications = notifications; },
        LOGOUT(state) {
            state.user = null;
            state.token = null;
            state.menu = [];
            state.notifications = [];
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        },
        SET_THEME(state, theme) {
            state.theme = theme;
            localStorage.setItem('theme', theme);
            const html = document.documentElement;
            if (theme === 'dark') {
                html.classList.add('dark');
                html.setAttribute('data-theme', 'dark');
                html.style.colorScheme = 'dark';
            } else {
                html.classList.remove('dark');
                html.setAttribute('data-theme', 'light');
                html.style.colorScheme = 'light';
            }
        },
    },
    actions: {
        async login({ commit, dispatch }, credentials) {
            try {
                const response = await axios.post('/login', credentials);
                if (response.data && response.data.token && response.data.user) {
                    commit('SET_TOKEN', response.data.token);
                    commit('SET_USER', response.data.user);
                    await dispatch('fetchMenu');
                    await dispatch('fetchNotifications');
                    return { success: true };
                }
                throw new Error('Неверный формат ответа от сервера');
            } catch (error) {
                if (!error.response) return { success: false, error: 'Нет соединения с сервером.' };
                if (error.response?.status === 422) {
                    const errors = error.response?.data?.errors;
                    if (errors && typeof errors === 'object') {
                        const tr = (t) => ({ 'The email field is required.': 'Поле email обязательно.', 'The email field must be a valid email address.': 'Некорректный email.', 'The password field is required.': 'Поле пароль обязательно.', 'The password field must be at least 8 characters.': 'Пароль минимум 8 символов.' }[t] || t);
                        const errorMessages = Object.values(errors).flat().map(tr).join(', ');
                        const fieldErrors = {};
                        Object.keys(errors).forEach(key => { fieldErrors[key] = tr(Array.isArray(errors[key]) ? errors[key][0] : errors[key]); });
                        return { success: false, error: errorMessages || 'Ошибка валидации', fieldErrors };
                    }
                }
                if (error.response?.status === 401) return { success: false, error: 'Неверные email или пароль.' };
                if (error.response?.status >= 500) return { success: false, error: 'Ошибка сервера.' };
                return { success: false, error: (error.response?.data?.message) || error.message || 'Ошибка авторизации' };
            }
        },
        async logout({ commit }) {
            try { await axios.post('/logout'); } catch (e) {}
            commit('LOGOUT');
        },
        async fetchUser({ commit, state }) {
            if (!state.token) return;
            try {
                const response = await axios.get('/user');
                const user = response.data?.user ?? response.data;
                if (user) commit('SET_USER', user);
                else throw new Error('Неверный формат ответа');
            } catch (error) {
                if (error.response?.status === 401) commit('LOGOUT');
            }
        },
        async fetchMenu({ commit, state }) {
            if (!state.token) return;
            try {
                const response = await axios.get('/admin/menu');
                commit('SET_MENU', response.data.menu || []);
            } catch (error) {}
        },
        async fetchNotifications({ commit, state }) {
            if (!state.token) return;
            try {
                const response = await axios.get('/notifications');
                commit('SET_NOTIFICATIONS', response.data.notifications || []);
            } catch (error) {
                if (error.response?.status !== 401) {}
            }
        },
        toggleTheme({ commit, state }) {
            commit('SET_THEME', state.theme === 'dark' ? 'light' : 'dark');
        },
    },
    getters: {
        isAuthenticated: (state) => !!state.token,
        user: (state) => state.user,
        menu: (state) => state.menu,
        notifications: (state) => state.notifications,
        theme: (state) => state.theme,
        isDarkMode: (state) => state.theme === 'dark',
        unreadNotificationsCount: (state) => (state.notifications || []).filter(n => !n.read).length,
        hasRole: (state) => (roleSlug) => (state.user?.roles || []).some(r => r.slug === roleSlug),
        hasAnyRole: (state) => (roleSlugs) => (state.user?.roles || []).some(r => roleSlugs.includes(r.slug)),
    },
});

const routes = [
    { path: '/login', name: 'login', component: () => import('./pages/auth/Login.vue'), meta: { requiresAuth: false } },
    {
        path: '/',
        component: () => import('./layouts/AdminLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            { path: '', name: 'admin.dashboard', component: () => import('./pages/admin/Dashboard.vue'), meta: { title: 'Главная' } },
            { path: 'cms/regions', name: 'admin.cms.regions', component: () => import('./pages/admin/cms/Regions.vue'), meta: { title: 'Регионы' } },
            { path: 'cms/cities', name: 'admin.cms.cities', component: () => import('./pages/admin/cms/Cities.vue'), meta: { title: 'Города' } },
            { path: 'cms/sites', name: 'admin.cms.sites', component: () => import('./pages/admin/cms/Sites.vue'), meta: { title: 'Сайты' } },
            { path: 'cms/site-contacts', name: 'admin.cms.site-contacts', component: () => import('./pages/admin/cms/SiteContacts.vue'), meta: { title: 'Контакты сайта' } },
            { path: 'cms/pages', name: 'admin.cms.pages', component: () => import('./pages/admin/cms/Pages.vue'), meta: { title: 'Страницы' } },
            { path: 'cms/pages/:id/edit', name: 'admin.cms.pages.edit', component: () => import('./pages/admin/cms/PageEdit.vue'), meta: { title: 'Редактирование страницы' } },
            { path: 'cms/services', name: 'admin.cms.services', component: () => import('./pages/admin/cms/Services.vue'), meta: { title: 'Услуги' } },
            { path: 'cms/product-categories', name: 'admin.cms.product-categories', component: () => import('./pages/admin/cms/ProductCategories.vue'), meta: { title: 'Категории товаров' } },
            { path: 'cms/products', name: 'admin.cms.products', component: () => import('./pages/admin/cms/Products.vue'), meta: { title: 'Товары' } },
            { path: 'cms/media', name: 'admin.cms.media', component: () => import('./pages/admin/cms/CmsMedia.vue'), meta: { title: 'Медиатека CMS' } },
            { path: 'cms/seo-settings', name: 'admin.cms.seo-settings', component: () => import('./pages/admin/cms/SeoSettings.vue'), meta: { title: 'SEO Настройки' } },
            { path: 'cms/redirects', name: 'admin.cms.redirects', component: () => import('./pages/admin/cms/Redirects.vue'), meta: { title: 'Редиректы' } },
            { path: 'cms/menus', name: 'admin.cms.menus', component: () => import('./pages/admin/cms/Menus.vue'), meta: { title: 'Меню' } },
            { path: 'cms/menus/:id/items', name: 'admin.cms.menus.edit-items', component: () => import('./pages/admin/cms/MenuEditor.vue'), meta: { title: 'Пункты меню' } },
            { path: 'cms/schema-blocks', name: 'admin.cms.schema-blocks', component: () => import('./pages/admin/cms/SchemaBlocks.vue'), meta: { title: 'Микроразметка (Schema)' } },
            { path: 'cms/reviews', name: 'admin.cms.reviews', component: () => import('./pages/admin/cms/Reviews.vue'), meta: { title: 'Отзывы' } },
            { path: 'media', name: 'admin.media', component: () => import('./pages/admin/Media.vue'), meta: { title: 'Медиа' } },
            { path: 'notifications', name: 'admin.notifications', component: () => import('./pages/admin/Notifications.vue'), meta: { title: 'Уведомления' } },
            { path: 'users', name: 'admin.users', component: () => import('./pages/admin/Users.vue'), meta: { title: 'Пользователи' } },
            { path: 'roles', name: 'admin.roles', component: () => import('./pages/admin/Roles.vue'), meta: { title: 'Роли' } },
            { path: 'bots', name: 'admin.bots', component: () => import('./pages/admin/Bots.vue'), meta: { title: 'Боты' } },
        ],
    },
];

const router = createRouter({ history: createWebHistory('/admin'), routes });

router.beforeEach(async (to, from, next) => {
    const isAuth = store.getters.isAuthenticated;
    if ((to.meta.requiresAuth) && isAuth && !store.state.user) {
        try { await store.dispatch('fetchUser'); } catch (e) { next('/login'); return; }
    }
    if (to.meta.requiresAuth && !isAuth) { next('/login'); return; }
    if ((to.path === '/login') && isAuth) { next('/'); return; }
    if (to.meta.requiresRole) {
        const roles = Array.isArray(to.meta.requiresRole) ? to.meta.requiresRole : [to.meta.requiresRole];
        if (!store.getters.hasAnyRole(roles)) { store.commit('LOGOUT'); next('/login'); return; }
    }
    next();
});

if (store.state.token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${store.state.token}`;
}
axios.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});
axios.interceptors.response.use(
    (r) => r,
    (error) => {
        if (error.response?.status === 401 && store.state.token) store.commit('LOGOUT');
        return Promise.reject(error);
    }
);

if (store.state.token) {
    store.dispatch('fetchUser').then(() => {
        store.dispatch('fetchMenu');
        store.dispatch('fetchNotifications');
    }).catch(() => {});
}
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
document.documentElement.style.colorScheme = savedTheme === 'dark' ? 'dark' : 'light';
if (savedTheme === 'dark') document.documentElement.classList.add('dark');
store.state.theme = savedTheme;

const app = createApp(App);
app.use(store);
app.use(router);

function mountApp() {
    const el = document.getElementById('admin-app');
    if (el) app.mount('#admin-app');
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountApp);
else mountApp();
