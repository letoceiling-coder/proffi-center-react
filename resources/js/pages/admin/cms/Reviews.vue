<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-semibold text-foreground">Отзывы</h1>
                <p class="text-muted-foreground mt-1">Отзывы по сайтам, медиа из медиатеки CMS</p>
            </div>
            <button
                @click="openCreate"
                class="h-11 px-6 bg-accent/10 text-accent border border-accent/40 hover:bg-accent/20 rounded-2xl"
            >
                + Создать
            </button>
        </div>

        <div class="bg-card rounded-lg border border-border p-4">
            <div class="flex gap-4 mb-4 flex-wrap">
                <div>
                    <label class="block text-sm font-medium mb-1">Сайт</label>
                    <select v-model="filters.site_id" @change="fetch" class="h-10 px-3 border border-border rounded bg-background w-48">
                        <option value="">Все</option>
                        <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.domain }}</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Статус</label>
                    <select v-model="filters.status" @change="fetch" class="h-10 px-3 border border-border rounded bg-background w-32">
                        <option value="">Все</option>
                        <option value="draft">Черновик</option>
                        <option value="published">Опубликован</option>
                        <option value="hidden">Скрыт</option>
                    </select>
                </div>
                <div class="flex-1 min-w-[200px]">
                    <label class="block text-sm font-medium mb-1">Поиск</label>
                    <input v-model="filters.q" @input="debouncedFetch" type="text" placeholder="Автор, текст..." class="w-full h-10 px-3 border border-border rounded bg-background" />
                </div>
            </div>
            <div v-if="loading" class="py-8 text-center text-muted-foreground">Загрузка...</div>
            <table v-else class="w-full">
                <thead class="bg-muted/30 border-b border-border">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Автор</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Сайт</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Статус</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Действия</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border">
                    <tr v-for="r in items" :key="r.id" class="hover:bg-muted/10">
                        <td class="px-4 py-3 text-sm">{{ r.id }}</td>
                        <td class="px-4 py-3">{{ r.author_name }}</td>
                        <td class="px-4 py-3 text-sm">{{ r.site ? r.site.domain : r.site_id }}</td>
                        <td class="px-4 py-3 text-sm">{{ r.status }}</td>
                        <td class="px-4 py-3 text-right">
                            <button @click="editItem(r)" class="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded mr-1">Изменить</button>
                            <button @click="remove(r)" class="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded">Удалить</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="!loading && items.length === 0" class="py-8 text-center text-muted-foreground">Нет отзывов</div>
            <div v-if="pagination && pagination.last_page > 1" class="flex justify-between items-center mt-4 pt-4 border-t border-border">
                <span class="text-sm text-muted-foreground">Страница {{ pagination.current_page }} из {{ pagination.last_page }}</span>
                <div class="flex gap-2">
                    <button @click="setPage(pagination.current_page - 1)" :disabled="pagination.current_page <= 1" class="px-3 py-1 border rounded disabled:opacity-50">Назад</button>
                    <button @click="setPage(pagination.current_page + 1)" :disabled="pagination.current_page >= pagination.last_page" class="px-3 py-1 border rounded disabled:opacity-50">Вперёд</button>
                </div>
            </div>
        </div>

        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80" @click.self="showModal = false">
            <div class="bg-background border border-border rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-auto">
                <h3 class="text-lg font-semibold mb-4">{{ editingId ? 'Редактировать отзыв' : 'Новый отзыв' }}</h3>
                <form @submit.prevent="save" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Сайт *</label>
                        <select v-model="form.site_id" required class="w-full h-10 px-3 border border-border rounded bg-background">
                            <option value="">— Выберите —</option>
                            <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.domain }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Автор *</label>
                        <input v-model="form.author_name" required maxlength="255" class="w-full h-10 px-3 border border-border rounded bg-background" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Текст *</label>
                        <textarea v-model="form.text" required rows="4" class="w-full px-3 py-2 border border-border rounded bg-background"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Телефон</label>
                        <input v-model="form.phone" maxlength="50" class="w-full h-10 px-3 border border-border rounded bg-background" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Статус</label>
                        <select v-model="form.status" class="w-full h-10 px-3 border border-border rounded bg-background">
                            <option value="draft">Черновик</option>
                            <option value="published">Опубликован</option>
                            <option value="hidden">Скрыт</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Дата публикации</label>
                        <input v-model="form.published_at" type="datetime-local" class="w-full h-10 px-3 border border-border rounded bg-background" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Медиа (порядок сохраняется)</label>
                        <div class="flex items-center gap-2 mb-2">
                            <button type="button" @click="showMediaPicker = true" class="h-10 px-4 border border-border rounded-lg text-sm">+ Добавить из медиатеки</button>
                        </div>
                        <ul class="space-y-1">
                            <li v-for="(mid, idx) in mediaIds" :key="mid" class="flex items-center gap-2 py-1">
                                <span class="text-sm">#{{ mid }}</span>
                                <button type="button" @click="moveMedia(idx, -1)" :disabled="idx === 0" class="px-2 py-0.5 text-xs border rounded disabled:opacity-50">↑</button>
                                <button type="button" @click="moveMedia(idx, 1)" :disabled="idx === mediaIds.length - 1" class="px-2 py-0.5 text-xs border rounded disabled:opacity-50">↓</button>
                                <button type="button" @click="mediaIds.splice(idx, 1)" class="px-2 py-0.5 text-xs bg-red-500 text-white rounded">Удалить</button>
                            </li>
                        </ul>
                        <p v-if="mediaIds.length === 0" class="text-sm text-muted-foreground">Нет прикреплённых медиа</p>
                    </div>
                    <p v-if="formError" class="text-sm text-destructive">{{ formError }}</p>
                    <div class="flex gap-2 pt-2">
                        <button type="button" @click="showModal = false" class="flex-1 h-10 border border-border rounded-lg">Отмена</button>
                        <button type="submit" :disabled="saving" class="flex-1 h-10 bg-accent/10 text-accent border border-accent/40 rounded-lg disabled:opacity-50">{{ saving ? 'Сохранение...' : 'Сохранить' }}</button>
                    </div>
                </form>
            </div>
        </div>

        <div v-if="showMediaPicker" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/80" @click.self="showMediaPicker = false">
            <div class="bg-background border border-border rounded-lg p-4 max-w-md">
                <p class="mb-2 text-sm">Выберите медиа для прикрепления к отзыву</p>
                <CmsMediaPicker v-model="pickedMediaId" @update:modelValue="onMediaPicked" />
                <button type="button" @click="showMediaPicker = false" class="mt-2 h-10 px-4 border border-border rounded-lg">Закрыть</button>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { apiGet, apiPost, apiPut, apiDelete } from '../../../utils/api';
import Swal from 'sweetalert2';
import CmsMediaPicker from '../../../components/admin/cms/CmsMediaPicker.vue';

export default {
    name: 'Reviews',
    components: { CmsMediaPicker },
    setup() {
        const items = ref([]);
        const pagination = ref(null);
        const sites = ref([]);
        const filters = ref({ site_id: '', status: '', q: '' });
        const loading = ref(false);
        const formError = ref('');
        const showModal = ref(false);
        const showMediaPicker = ref(false);
        const pickedMediaId = ref(null);
        const editingId = ref(null);
        const saving = ref(false);
        const mediaIds = ref([]);
        const form = ref({
            site_id: '',
            author_name: '',
            text: '',
            phone: '',
            status: 'draft',
            published_at: '',
        });

        const fetch = async () => {
            loading.value = true;
            try {
                const qs = new URLSearchParams();
                if (filters.value.site_id) qs.set('site_id', filters.value.site_id);
                if (filters.value.status) qs.set('status', filters.value.status);
                if (filters.value.q) qs.set('q', filters.value.q);
                if (pagination.value) qs.set('page', pagination.value.current_page);
                const res = await apiGet('/cms/reviews?' + qs.toString());
                const data = await res.json();
                items.value = data.data || [];
                pagination.value = { current_page: data.current_page, last_page: data.last_page };
            } catch (_) {
                items.value = [];
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
            mediaIds.value = [];
            form.value = {
                site_id: filters.value.site_id || sites.value[0]?.id || '',
                author_name: '',
                text: '',
                phone: '',
                status: 'draft',
                published_at: '',
            };
            formError.value = '';
            showModal.value = true;
        };

        const editItem = async (r) => {
            editingId.value = r.id;
            try {
                const res = await apiGet('/cms/reviews/' + r.id);
                const data = await res.json();
                const rev = data.data || r;
                form.value = {
                    site_id: rev.site_id,
                    author_name: rev.author_name,
                    text: rev.text,
                    phone: rev.phone ?? '',
                    status: rev.status || 'draft',
                    published_at: rev.published_at ? rev.published_at.slice(0, 16) : '',
                };
                mediaIds.value = (rev.media || []).map(m => m.id);
            } catch (_) {
                mediaIds.value = [];
            }
            formError.value = '';
            showModal.value = true;
        };

        const onMediaPicked = (id) => {
            if (id && !mediaIds.value.includes(id)) {
                mediaIds.value.push(id);
                pickedMediaId.value = null;
            }
        };

        const moveMedia = (idx, delta) => {
            const newIdx = idx + delta;
            if (newIdx < 0 || newIdx >= mediaIds.value.length) return;
            const arr = [...mediaIds.value];
            [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
            mediaIds.value = arr;
        };

        const save = async () => {
            saving.value = true;
            formError.value = '';
            const payload = { ...form.value };
            if (payload.published_at === '') payload.published_at = null;
            try {
                if (editingId.value) {
                    const res = await apiPut('/cms/reviews/' + editingId.value, payload);
                    const data = await res.json();
                    if (!res.ok) {
                        formError.value = data.message || (data.errors && Object.values(data.errors).flat().join(', ')) || 'Ошибка';
                        return;
                    }
                    await apiPost('/cms/reviews/' + editingId.value + '/media', { media_ids: mediaIds.value });
                    await Swal.fire({ title: 'Сохранено', icon: 'success', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
                } else {
                    const res = await apiPost('/cms/reviews', payload);
                    const data = await res.json();
                    if (!res.ok) {
                        formError.value = data.message || (data.errors && Object.values(data.errors).flat().join(', ')) || 'Ошибка';
                        return;
                    }
                    const newId = data.data?.id;
                    if (newId && mediaIds.value.length) {
                        await apiPost('/cms/reviews/' + newId + '/media', { media_ids: mediaIds.value });
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

        const remove = async (r) => {
            const ok = await Swal.fire({ title: 'Удалить отзыв?', text: r.author_name, icon: 'warning', showCancelButton: true, confirmButtonText: 'Удалить', cancelButtonText: 'Отмена' });
            if (!ok.isConfirmed) return;
            try {
                await apiDelete('/cms/reviews/' + r.id);
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
            await fetch();
        });

        return { items, pagination, sites, filters, loading, formError, showModal, showMediaPicker, pickedMediaId, editingId, saving, mediaIds, form, fetch, debouncedFetch, setPage, openCreate, editItem, onMediaPicked, moveMedia, save, remove };
    },
};
</script>
