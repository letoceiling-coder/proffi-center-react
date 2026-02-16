<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-semibold text-foreground">Регионы</h1>
                <p class="text-muted-foreground mt-1">Управление регионами</p>
            </div>
            <button
                @click="openCreate"
                class="h-11 px-6 bg-accent/10 text-accent border border-accent/40 hover:bg-accent/20 rounded-2xl inline-flex items-center gap-2"
            >
                + Создать
            </button>
        </div>

        <div class="bg-card rounded-lg border border-border p-4">
            <div class="flex gap-4 mb-4">
                <input
                    v-model="filters.search"
                    @input="debouncedFetch"
                    type="text"
                    placeholder="Поиск по названию или коду..."
                    class="flex-1 h-10 px-3 border border-border rounded-lg bg-background"
                />
            </div>
            <div v-if="loading" class="py-8 text-center text-muted-foreground">Загрузка...</div>
            <div v-else-if="error" class="p-4 bg-destructive/10 text-destructive rounded-lg">{{ error }}</div>
            <table v-else class="w-full">
                <thead class="bg-muted/30 border-b border-border">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Название</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Код страны</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Городов</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Действия</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border">
                    <tr v-for="r in items" :key="r.id" class="hover:bg-muted/10">
                        <td class="px-4 py-3 text-sm">{{ r.id }}</td>
                        <td class="px-4 py-3 font-medium">{{ r.name }}</td>
                        <td class="px-4 py-3 text-sm">{{ r.country_code || '—' }}</td>
                        <td class="px-4 py-3 text-sm">{{ r.cities_count ?? 0 }}</td>
                        <td class="px-4 py-3 text-right">
                            <button @click="editItem(r)" class="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded mr-1">Изменить</button>
                            <button @click="remove(r)" class="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded">Удалить</button>
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
                <h3 class="text-lg font-semibold mb-4">{{ editingId ? 'Редактировать регион' : 'Новый регион' }}</h3>
                <form @submit.prevent="save" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Название *</label>
                        <input v-model="form.name" required maxlength="255" class="w-full h-10 px-3 border border-border rounded bg-background" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Код страны (2 буквы)</label>
                        <input v-model="form.country_code" maxlength="2" class="w-full h-10 px-3 border border-border rounded bg-background" placeholder="RU" />
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
    name: 'CmsRegions',
    setup() {
        const loading = ref(false);
        const saving = ref(false);
        const error = ref(null);
        const items = ref([]);
        const pagination = ref(null);
        const showModal = ref(false);
        const editingId = ref(null);
        const filters = ref({ search: '', page: 1, per_page: 15 });
        const form = ref({ name: '', country_code: '' });
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
                const res = await apiGet(`/cms/regions?${qs}`);
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
            form.value = { name: '', country_code: '' };
            showModal.value = true;
        };

        const editItem = (r) => {
            editingId.value = r.id;
            form.value = { name: r.name, country_code: r.country_code || '' };
            showModal.value = true;
        };

        const save = async () => {
            saving.value = true;
            try {
                const payload = { name: form.value.name.trim(), country_code: form.value.country_code?.trim() || null };
                const res = editingId.value
                    ? await apiPut(`/cms/regions/${editingId.value}`, payload)
                    : await apiPost('/cms/regions', payload);
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || data.errors ? Object.values(data.errors).flat().join(', ') : 'Ошибка');
                await Swal.fire({ title: 'Сохранено', icon: 'success', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
                showModal.value = false;
                fetchList();
            } catch (e) {
                Swal.fire({ title: 'Ошибка', text: e.message || 'Ошибка сохранения', icon: 'error' });
            } finally {
                saving.value = false;
            }
        };

        const remove = async (r) => {
            const ok = await Swal.fire({ title: 'Удалить регион?', text: r.name, icon: 'warning', showCancelButton: true, confirmButtonText: 'Удалить', cancelButtonText: 'Отмена', confirmButtonColor: '#dc2626' });
            if (!ok.isConfirmed) return;
            try {
                const res = await apiDelete(`/cms/regions/${r.id}`);
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || 'Ошибка удаления');
                await Swal.fire({ title: 'Удалено', icon: 'success', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
                fetchList();
            } catch (e) {
                Swal.fire({ title: 'Ошибка', text: e.message, icon: 'error' });
            }
        };

        onMounted(fetchList);
        return { loading, saving, error, items, pagination, showModal, editingId, filters, form, debouncedFetch, setPage, openCreate, editItem, save, remove };
    },
};
</script>
