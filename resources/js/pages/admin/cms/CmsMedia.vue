<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-semibold text-foreground">Медиатека CMS</h1>
                <p class="text-muted-foreground mt-1">cms_media + cms_media_files. Привязка к страницам/услугам/товарам — в формах редактирования.</p>
            </div>
            <label class="h-11 px-6 bg-accent/10 text-accent border border-accent/40 hover:bg-accent/20 rounded-2xl inline-flex items-center gap-2 cursor-pointer">
                <input type="file" ref="fileInput" @change="onFileSelect" class="hidden" accept="image/*,.pdf" />
                Загрузить файл
            </label>
        </div>

        <div class="bg-card rounded-lg border border-border p-4">
            <div class="flex gap-4 mb-4">
                <input
                    v-model="filters.search"
                    @input="debouncedFetch"
                    type="text"
                    placeholder="Поиск по названию, alt, caption..."
                    class="flex-1 h-10 px-3 border border-border rounded-lg bg-background"
                />
            </div>
            <div v-if="uploading" class="py-4 text-muted-foreground">Загрузка файла...</div>
            <div v-if="loading" class="py-8 text-center text-muted-foreground">Загрузка списка...</div>
            <div v-else-if="error" class="p-4 bg-destructive/10 text-destructive rounded-lg">{{ error }}</div>
            <table v-else class="w-full">
                <thead class="bg-muted/30 border-b border-border">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Название / Alt</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Файлов</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Действия</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border">
                    <tr v-for="m in items" :key="m.id" class="hover:bg-muted/10">
                        <td class="px-4 py-3 text-sm">{{ m.id }}</td>
                        <td class="px-4 py-3">
                            <span class="font-medium">{{ m.name || '—' }}</span>
                            <span v-if="m.alt" class="text-muted-foreground text-sm block">{{ m.alt }}</span>
                        </td>
                        <td class="px-4 py-3 text-sm">{{ m.files_count ?? 0 }}</td>
                        <td class="px-4 py-3 text-right">
                            <button @click="editItem(m)" class="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded mr-1">Изменить</button>
                            <button @click="remove(m)" class="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded">Удалить</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="!loading && items.length === 0" class="py-8 text-center text-muted-foreground">Нет записей. Загрузите файл.</div>
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
                <h3 class="text-lg font-semibold mb-4">Редактировать медиа</h3>
                <form @submit.prevent="save" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Название</label>
                        <input v-model="form.name" maxlength="255" class="w-full h-10 px-3 border border-border rounded bg-background" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Alt</label>
                        <input v-model="form.alt" maxlength="255" class="w-full h-10 px-3 border border-border rounded bg-background" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Caption</label>
                        <input v-model="form.caption" maxlength="500" class="w-full h-10 px-3 border border-border rounded bg-background" />
                    </div>
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
    name: 'CmsMediaLibrary',
    setup() {
        const loading = ref(false);
        const uploading = ref(false);
        const saving = ref(false);
        const error = ref(null);
        const items = ref([]);
        const pagination = ref(null);
        const showModal = ref(false);
        const editingId = ref(null);
        const fileInput = ref(null);
        const filters = ref({ search: '', page: 1, per_page: 20 });
        const form = ref({ name: '', alt: '', caption: '' });
        let searchTimeout = null;

        const debouncedFetch = () => {
            if (searchTimeout) clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => { filters.value.page = 1; fetchList(); }, 400);
        };

        const fetchList = async () => {
            loading.value = true;
            error.value = null;
            try {
                const params = { page: filters.value.page, per_page: filters.value.per_page };
                if (filters.value.search) params.search = filters.value.search;
                const qs = new URLSearchParams(params).toString();
                const res = await apiGet(`/cms/cms-media?${qs}`);
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

        const onFileSelect = async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            uploading.value = true;
            try {
                const fd = new FormData();
                fd.append('file', file);
                const res = await apiPost('/cms/cms-media/upload', fd);
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || (data.errors && Object.values(data.errors).flat().join(', ')) || 'Ошибка загрузки');
                await Swal.fire({ title: 'Файл загружен', icon: 'success', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
                e.target.value = '';
                fetchList();
            } catch (err) {
                Swal.fire({ title: 'Ошибка', text: err.message || 'Ошибка загрузки', icon: 'error' });
            } finally {
                uploading.value = false;
            }
        };

        const editItem = (m) => {
            editingId.value = m.id;
            form.value = { name: m.name || '', alt: m.alt || '', caption: m.caption || '' };
            showModal.value = true;
        };

        const save = async () => {
            saving.value = true;
            try {
                const res = await apiPut(`/cms/cms-media/${editingId.value}`, { name: form.value.name || null, alt: form.value.alt || null, caption: form.value.caption || null });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Ошибка');
                await Swal.fire({ title: 'Сохранено', icon: 'success', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
                showModal.value = false;
                fetchList();
            } catch (e) {
                Swal.fire({ title: 'Ошибка', text: e.message, icon: 'error' });
            } finally {
                saving.value = false;
            }
        };

        const remove = async (m) => {
            const ok = await Swal.fire({ title: 'Удалить медиа?', text: m.name || 'ID ' + m.id, icon: 'warning', showCancelButton: true, confirmButtonText: 'Удалить', cancelButtonText: 'Отмена', confirmButtonColor: '#dc2626' });
            if (!ok.isConfirmed) return;
            try {
                const res = await apiDelete(`/cms/cms-media/${m.id}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Ошибка удаления');
                await Swal.fire({ title: 'Удалено', icon: 'success', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
                fetchList();
            } catch (e) {
                Swal.fire({ title: 'Ошибка', text: e.message, icon: 'error' });
            }
        };

        onMounted(fetchList);
        return { loading, uploading, saving, error, items, pagination, showModal, editingId, fileInput, filters, form, debouncedFetch, setPage, onFileSelect, editItem, save, remove };
    },
};
</script>
