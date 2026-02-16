<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-semibold text-foreground">Меню</h1>
                <p class="text-muted-foreground mt-1">Меню по сайтам (site_id). slug: header, footer и т.д.</p>
            </div>
            <button
                @click="openCreate"
                class="h-11 px-6 bg-accent/10 text-accent border border-accent/40 hover:bg-accent/20 rounded-2xl inline-flex items-center gap-2"
            >
                + Создать
            </button>
        </div>

        <div class="bg-card rounded-lg border border-border p-4">
            <div class="flex gap-4 mb-4 flex-wrap">
                <div>
                    <label class="block text-sm font-medium mb-1">Сайт *</label>
                    <select v-model="filters.site_id" @change="fetch" class="h-10 px-3 border border-border rounded bg-background w-56">
                        <option value="">— Выберите сайт —</option>
                        <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.domain }}</option>
                    </select>
                </div>
                <div class="flex-1 min-w-[200px]">
                    <label class="block text-sm font-medium mb-1">Поиск</label>
                    <input v-model="filters.q" @input="debouncedFetch" type="text" placeholder="slug, title..." class="w-full h-10 px-3 border border-border rounded bg-background" />
                </div>
            </div>
            <div v-if="loading" class="py-8 text-center text-muted-foreground">Загрузка...</div>
            <div v-else-if="!filters.site_id" class="py-8 text-center text-muted-foreground">Выберите сайт для просмотра меню</div>
            <div v-else-if="error" class="p-4 bg-destructive/10 text-destructive rounded-lg">{{ error }}</div>
            <table v-else class="w-full">
                <thead class="bg-muted/30 border-b border-border">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Slug</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Название</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Действия</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border">
                    <tr v-for="m in items" :key="m.id" class="hover:bg-muted/10">
                        <td class="px-4 py-3 text-sm">{{ m.id }}</td>
                        <td class="px-4 py-3 font-mono">{{ m.slug }}</td>
                        <td class="px-4 py-3">{{ m.title || '—' }}</td>
                        <td class="px-4 py-3 text-right">
                            <router-link :to="{ name: 'admin.cms.menus.edit-items', params: { id: m.id } }" class="px-3 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded mr-1">Редактировать пункты</router-link>
                            <button @click="editItem(m)" class="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded mr-1">Изменить</button>
                            <button @click="remove(m)" class="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded">Удалить</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="filters.site_id && !loading && items.length === 0" class="py-8 text-center text-muted-foreground">Нет меню. Создайте меню для выбранного сайта.</div>
            <div v-if="pagination && pagination.last_page > 1" class="flex justify-between items-center mt-4 pt-4 border-t border-border">
                <span class="text-sm text-muted-foreground">Страница {{ pagination.current_page }} из {{ pagination.last_page }}</span>
                <div class="flex gap-2">
                    <button @click="setPage(pagination.current_page - 1)" :disabled="pagination.current_page <= 1" class="px-3 py-1 border rounded disabled:opacity-50">Назад</button>
                    <button @click="setPage(pagination.current_page + 1)" :disabled="pagination.current_page >= pagination.last_page" class="px-3 py-1 border rounded disabled:opacity-50">Вперёд</button>
                </div>
            </div>
        </div>

        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80" @click.self="showModal = false">
            <div class="bg-background border border-border rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 class="text-lg font-semibold mb-4">{{ editingId ? 'Редактировать меню' : 'Новое меню' }}</h3>
                <form @submit.prevent="save" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Сайт *</label>
                        <select v-model="form.site_id" required class="w-full h-10 px-3 border border-border rounded bg-background">
                            <option value="">— Выберите сайт —</option>
                            <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.domain }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Slug *</label>
                        <input v-model="form.slug" required maxlength="50" pattern="[a-z0-9_-]+" class="w-full h-10 px-3 border border-border rounded bg-background" placeholder="header, footer" />
                        <p class="text-xs text-muted-foreground mt-1">Только латиница, цифры, дефис, подчёркивание</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Название</label>
                        <input v-model="form.title" maxlength="255" class="w-full h-10 px-3 border border-border rounded bg-background" />
                    </div>
                    <p v-if="formError" class="text-sm text-destructive">{{ formError }}</p>
                    <div class="flex gap-2 pt-2">
                        <button type="button" @click="showModal = false" class="flex-1 h-10 border border-border rounded-lg">Отмена</button>
                        <button type="submit" :disabled="saving" class="flex-1 h-10 bg-accent/10 text-accent border border-accent/40 rounded-lg disabled:opacity-50">{{ saving ? 'Сохранение...' : 'Сохранить' }}</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { apiGet, apiPost, apiPut, apiDelete } from '../../../utils/api';
import Swal from 'sweetalert2';

export default {
    name: 'Menus',
    setup() {
        const items = ref([]);
        const pagination = ref(null);
        const sites = ref([]);
        const filters = ref({ site_id: '', q: '' });
        const loading = ref(false);
        const error = ref('');
        const showModal = ref(false);
        const editingId = ref(null);
        const saving = ref(false);
        const formError = ref('');
        const form = ref({ site_id: '', slug: '', title: '' });

        const fetch = async () => {
            if (!filters.value.site_id) {
                items.value = [];
                return;
            }
            loading.value = true;
            error.value = '';
            try {
                const qs = new URLSearchParams({ site_id: filters.value.site_id });
                if (filters.value.q) qs.set('q', filters.value.q);
                if (pagination.value) qs.set('page', pagination.value.current_page);
                const res = await apiGet('/cms/menus?' + qs.toString());
                const data = await res.json();
                items.value = data.data || [];
                pagination.value = { current_page: data.current_page, last_page: data.last_page };
            } catch (e) {
                error.value = e.message;
            } finally {
                loading.value = false;
            }
        };

        let debounceTimer = null;
        const debouncedFetch = () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(fetch, 300);
        };

        const setPage = (p) => {
            if (!pagination.value) return;
            pagination.value.current_page = p;
            fetch();
        };

        const openCreate = () => {
            editingId.value = null;
            form.value = { site_id: filters.value.site_id || '', slug: '', title: '' };
            formError.value = '';
            showModal.value = true;
        };

        const editItem = (m) => {
            editingId.value = m.id;
            form.value = { site_id: m.site_id, slug: m.slug, title: m.title ?? '' };
            formError.value = '';
            showModal.value = true;
        };

        const save = async () => {
            saving.value = true;
            formError.value = '';
            try {
                if (editingId.value) {
                    const res = await apiPut('/cms/menus/' + editingId.value, form.value);
                    const data = await res.json();
                    if (!res.ok) {
                        formError.value = data.message || (data.errors && Object.values(data.errors).flat().join(', ')) || 'Ошибка';
                        return;
                    }
                    await Swal.fire({ title: 'Сохранено', icon: 'success', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
                } else {
                    const res = await apiPost('/cms/menus', form.value);
                    const data = await res.json();
                    if (!res.ok) {
                        formError.value = data.message || (data.errors && Object.values(data.errors).flat().join(', ')) || 'Ошибка';
                        return;
                    }
                    await Swal.fire({ title: 'Создано', icon: 'success', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
                }
                showModal.value = false;
                fetch();
            } catch (e) {
                formError.value = e.message;
            } finally {
                saving.value = false;
            }
        };

        const remove = async (m) => {
            const ok = await Swal.fire({ title: 'Удалить меню?', text: m.slug + (m.title ? ' — ' + m.title : ''), icon: 'warning', showCancelButton: true, confirmButtonText: 'Удалить', cancelButtonText: 'Отмена' });
            if (!ok.isConfirmed) return;
            try {
                await apiDelete('/cms/menus/' + m.id);
                await Swal.fire({ title: 'Удалено', icon: 'success', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
                fetch();
            } catch (_) {}
        };

        onMounted(async () => {
            try {
                const res = await apiGet('/cms/sites', { per_page: 100 });
                const d = await res.json();
                sites.value = d.data || [];
            } catch (_) {}
        });

        return { items, pagination, sites, filters, loading, error, showModal, editingId, saving, formError, form, fetch, debouncedFetch, setPage, openCreate, editItem, save, remove };
    },
};
</script>
