<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-semibold text-foreground">Страницы</h1>
                <p class="text-muted-foreground mt-1">Управление страницами сайта</p>
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
                <input
                    v-model="filters.q"
                    @input="debouncedFetch"
                    type="text"
                    placeholder="Поиск по title/slug..."
                    class="flex-1 min-w-[180px] h-10 px-3 border border-border rounded-lg bg-background"
                />
                <select v-model="filters.site_id" @change="fetchList" class="h-10 px-3 border border-border rounded-lg bg-background">
                    <option value="">Все сайты</option>
                    <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.domain }}</option>
                </select>
                <select v-model="filters.status" @change="fetchList" class="h-10 px-3 border border-border rounded-lg bg-background">
                    <option value="">Все статусы</option>
                    <option value="draft">Черновик</option>
                    <option value="published">Опубликовано</option>
                    <option value="archived">Архив</option>
                </select>
            </div>
            <div v-if="loading" class="py-8 text-center text-muted-foreground">Загрузка...</div>
            <div v-else-if="error" class="p-4 bg-destructive/10 text-destructive rounded-lg">{{ error }}</div>
            <table v-else class="w-full">
                <thead class="bg-muted/30 border-b border-border">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Сайт</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Title / Slug</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Статус</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Действия</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border">
                    <tr v-for="p in items" :key="p.id" class="hover:bg-muted/10">
                        <td class="px-4 py-3 text-sm">{{ p.id }}</td>
                        <td class="px-4 py-3 text-sm">{{ p.site ? p.site.domain : '—' }}</td>
                        <td class="px-4 py-3">
                            <span class="font-medium">{{ p.title }}</span>
                            <span class="text-muted-foreground text-sm block">{{ p.slug }}</span>
                        </td>
                        <td class="px-4 py-3 text-sm">{{ p.status }}</td>
                        <td class="px-4 py-3 text-right">
                            <router-link :to="{ name: 'admin.cms.pages.edit', params: { id: p.id } }" class="px-3 py-1 text-xs bg-gray-500 hover:bg-gray-600 text-white rounded mr-1">Блоки</router-link>
                            <button @click="editItem(p)" class="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded mr-1">Изменить</button>
                            <button @click="remove(p)" class="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded">Удалить</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="!loading && items.length === 0" class="py-8 text-center text-muted-foreground">Нет записей</div>
            <div v-if="pagination && pagination.last_page > 1" class="flex justify-between items-center mt-4 pt-4 border-t border-border">
                <span class="text-sm text-muted-foreground">Страница {{ pagination.current_page }} из {{ pagination.last_page }}</span>
                <div class="flex gap-2">
                    <button @click="setPage(pagination.current_page - 1)" :disabled="pagination.current_page <= 1" class="px-3 py-1 border rounded disabled:opacity-50">Назад</button>
                    <button @click="setPage(pagination.current_page + 1)" :disabled="pagination.current_page >= pagination.last_page" class="px-3 py-1 border rounded disabled:opacity-50">Вперёд</button>
                </div>
            </div>
        </div>

        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div class="bg-background border border-border rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 class="text-lg font-semibold mb-4">{{ editingId ? 'Редактировать страницу' : 'Новая страница' }}</h3>
                <form @submit.prevent="save" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Сайт *</label>
                        <select v-model="form.site_id" required class="w-full h-10 px-3 border border-border rounded bg-background">
                            <option value="">Выберите сайт</option>
                            <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.domain }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Title *</label>
                        <input v-model="form.title" required maxlength="255" class="w-full h-10 px-3 border border-border rounded bg-background" @blur="slugFromTitle" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Slug *</label>
                        <input v-model="form.slug" required maxlength="255" class="w-full h-10 px-3 border border-border rounded bg-background" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Статус</label>
                        <select v-model="form.status" class="w-full h-10 px-3 border border-border rounded bg-background">
                            <option value="draft">Черновик</option>
                            <option value="published">Опубликовано</option>
                            <option value="archived">Архив</option>
                        </select>
                    </div>
                    <div v-if="form.status === 'published'">
                        <label class="block text-sm font-medium mb-1">Дата публикации</label>
                        <input v-model="form.published_at" type="datetime-local" class="w-full h-10 px-3 border border-border rounded bg-background" />
                    </div>
                    <p v-if="validationErrors" class="text-sm text-destructive">{{ validationErrors }}</p>
                    <div class="flex gap-2 pt-4">
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
    name: 'CmsPages',
    setup() {
        const loading = ref(false);
        const saving = ref(false);
        const error = ref(null);
        const validationErrors = ref('');
        const items = ref([]);
        const sites = ref([]);
        const pagination = ref(null);
        const showModal = ref(false);
        const editingId = ref(null);
        const filters = ref({ q: '', site_id: '', status: '', page: 1, per_page: 15 });
        const form = ref({ site_id: '', slug: '', title: '', status: 'draft', published_at: '' });
        let searchTimeout = null;

        const slugFromTitle = () => {
            if (!form.value.slug && form.value.title) {
                form.value.slug = form.value.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/gi, '');
            }
        };

        const debouncedFetch = () => {
            if (searchTimeout) clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => { filters.value.page = 1; fetchList(); }, 400);
        };

        const fetchSites = async () => {
            try {
                const res = await apiGet('/cms/sites?per_page=500');
                if (res.ok) {
                    const d = await res.json();
                    sites.value = d.data || [];
                }
            } catch (e) {}
        };

        const fetchList = async () => {
            loading.value = true;
            error.value = null;
            try {
                const params = { page: filters.value.page, per_page: filters.value.per_page };
                if (filters.value.q) params.q = filters.value.q;
                if (filters.value.site_id) params.site_id = filters.value.site_id;
                if (filters.value.status) params.status = filters.value.status;
                const qs = new URLSearchParams(params).toString();
                const res = await apiGet(`/cms/pages?${qs}`);
                if (!res.ok) throw new Error('Ошибка загрузки');
                const data = await res.json();
                items.value = data.data || [];
                pagination.value = data.last_page ? { current_page: data.current_page, last_page: data.last_page, total: data.total, from: data.from, to: data.to } : null;
            } catch (e) {
                error.value = e.message || 'Ошибка';
            } finally {
                loading.value = false;
            }
        };

        const setPage = (p) => {
            if (p >= 1 && p <= (pagination.value?.last_page || 1)) {
                filters.value.page = p;
                fetchList();
            }
        };

        const openCreate = () => {
            editingId.value = null;
            form.value = { site_id: filters.value.site_id || '', slug: '', title: '', status: 'draft', published_at: '' };
            validationErrors.value = '';
            showModal.value = true;
        };

        const editItem = (p) => {
            editingId.value = p.id;
            form.value = {
                site_id: String(p.site_id),
                slug: p.slug,
                title: p.title,
                status: p.status || 'draft',
                published_at: p.published_at ? p.published_at.slice(0, 16) : '',
            };
            validationErrors.value = '';
            showModal.value = true;
        };

        const save = async () => {
            saving.value = true;
            validationErrors.value = '';
            try {
                const payload = {
                    site_id: Number(form.value.site_id),
                    slug: form.value.slug.trim(),
                    title: form.value.title.trim(),
                    status: form.value.status,
                    published_at: form.value.published_at || null,
                };
                const res = editingId.value
                    ? await apiPut(`/cms/pages/${editingId.value}`, payload)
                    : await apiPost('/cms/pages', payload);
                const data = await res.json();
                if (!res.ok) {
                    const msg = data.message || (data.errors && Object.values(data.errors).flat().join(', ')) || 'Ошибка';
                    validationErrors.value = msg;
                    return;
                }
                await Swal.fire({ title: 'Сохранено', icon: 'success', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
                showModal.value = false;
                fetchList();
            } catch (e) {
                validationErrors.value = e.message || 'Ошибка';
            } finally {
                saving.value = false;
            }
        };

        const remove = async (p) => {
            const ok = await Swal.fire({ title: 'Удалить страницу?', text: p.title, icon: 'warning', showCancelButton: true, confirmButtonText: 'Удалить', cancelButtonText: 'Отмена', confirmButtonColor: '#dc2626' });
            if (!ok.isConfirmed) return;
            try {
                const res = await apiDelete(`/cms/pages/${p.id}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Ошибка удаления');
                await Swal.fire({ title: 'Удалено', icon: 'success', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
                fetchList();
            } catch (e) {
                Swal.fire({ title: 'Ошибка', text: e.message, icon: 'error' });
            }
        };

        onMounted(() => {
            fetchSites();
            fetchList();
        });
        return { loading, saving, error, validationErrors, items, sites, pagination, showModal, editingId, filters, form, slugFromTitle, debouncedFetch, setPage, openCreate, editItem, save, remove };
    },
};
</script>
