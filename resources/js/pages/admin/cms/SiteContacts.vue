<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-semibold text-foreground">Контакты сайта</h1>
                <p class="text-muted-foreground mt-1">Управление контактами сайтов</p>
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
                    v-model="filters.search"
                    @input="debouncedFetch"
                    type="text"
                    placeholder="Поиск по компании, телефону, email..."
                    class="flex-1 min-w-[200px] h-10 px-3 border border-border rounded-lg bg-background"
                />
                <select v-model="filters.site_id" @change="fetchList" class="h-10 px-3 border border-border rounded-lg bg-background">
                    <option value="">Все сайты</option>
                    <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.domain }}</option>
                </select>
            </div>
            <div v-if="loading" class="py-8 text-center text-muted-foreground">Загрузка...</div>
            <div v-else-if="error" class="p-4 bg-destructive/10 text-destructive rounded-lg">{{ error }}</div>
            <table v-else class="w-full">
                <thead class="bg-muted/30 border-b border-border">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Сайт</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Компания</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Телефон / Email</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Действия</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border">
                    <tr v-for="c in items" :key="c.id" class="hover:bg-muted/10">
                        <td class="px-4 py-3 text-sm">{{ c.id }}</td>
                        <td class="px-4 py-3 text-sm">{{ c.site ? c.site.domain : '—' }}</td>
                        <td class="px-4 py-3 font-medium">{{ c.company_name || '—' }}</td>
                        <td class="px-4 py-3 text-sm">{{ c.phone || c.email || '—' }}</td>
                        <td class="px-4 py-3 text-right">
                            <button @click="editItem(c)" class="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded mr-1">Изменить</button>
                            <button @click="remove(c)" class="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded">Удалить</button>
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

        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 overflow-y-auto py-8">
            <div class="bg-background border border-border rounded-lg shadow-xl w-full max-w-lg p-6 my-auto">
                <h3 class="text-lg font-semibold mb-4">{{ editingId ? 'Редактировать контакт' : 'Новый контакт' }}</h3>
                <form @submit.prevent="save" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Сайт *</label>
                        <select v-model="form.site_id" required class="w-full h-10 px-3 border border-border rounded bg-background">
                            <option value="">Выберите сайт</option>
                            <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.domain }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Компания</label>
                        <input v-model="form.company_name" maxlength="255" class="w-full h-10 px-3 border border-border rounded bg-background" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Телефон</label>
                        <input v-model="form.phone" maxlength="50" class="w-full h-10 px-3 border border-border rounded bg-background" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Email</label>
                        <input v-model="form.email" type="email" maxlength="255" class="w-full h-10 px-3 border border-border rounded bg-background" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Улица</label>
                        <input v-model="form.address_street" maxlength="255" class="w-full h-10 px-3 border border-border rounded bg-background" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Населённый пункт</label>
                        <input v-model="form.address_locality" maxlength="255" class="w-full h-10 px-3 border border-border rounded bg-background" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Индекс</label>
                        <input v-model="form.address_postal_code" maxlength="20" class="w-full h-10 px-3 border border-border rounded bg-background" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Время работы</label>
                        <textarea v-model="form.work_time" rows="2" class="w-full px-3 py-2 border border-border rounded bg-background"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Цена от (текст)</label>
                        <input v-model="form.price_display_from" maxlength="50" class="w-full h-10 px-3 border border-border rounded bg-background" placeholder="от 99 руб." />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Ссылка на правовую информацию</label>
                        <input v-model="form.legal_link" maxlength="500" class="w-full h-10 px-3 border border-border rounded bg-background" />
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
    name: 'CmsSiteContacts',
    setup() {
        const loading = ref(false);
        const saving = ref(false);
        const error = ref(null);
        const items = ref([]);
        const sites = ref([]);
        const pagination = ref(null);
        const showModal = ref(false);
        const editingId = ref(null);
        const filters = ref({ search: '', site_id: '', page: 1, per_page: 15 });
        const form = ref({
            site_id: '', company_name: '', phone: '', email: '', address_street: '', address_locality: '', address_postal_code: '',
            work_time: '', logo_media_id: '', price_display_from: '', legal_link: '',
        });
        let searchTimeout = null;

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
                if (filters.value.search) params.search = filters.value.search;
                if (filters.value.site_id) params.site_id = filters.value.site_id;
                const qs = new URLSearchParams(params).toString();
                const res = await apiGet(`/cms/site-contacts?${qs}`);
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
            form.value = { site_id: filters.value.site_id || '', company_name: '', phone: '', email: '', address_street: '', address_locality: '', address_postal_code: '', work_time: '', logo_media_id: '', price_display_from: '', legal_link: '' };
            showModal.value = true;
        };

        const editItem = (c) => {
            editingId.value = c.id;
            form.value = {
                site_id: String(c.site_id),
                company_name: c.company_name || '',
                phone: c.phone || '',
                email: c.email || '',
                address_street: c.address_street || '',
                address_locality: c.address_locality || '',
                address_postal_code: c.address_postal_code || '',
                work_time: c.work_time || '',
                logo_media_id: c.logo_media_id || '',
                price_display_from: c.price_display_from || '',
                legal_link: c.legal_link || '',
            };
            showModal.value = true;
        };

        const save = async () => {
            saving.value = true;
            try {
                const payload = {
                    site_id: Number(form.value.site_id),
                    company_name: form.value.company_name?.trim() || null,
                    phone: form.value.phone?.trim() || null,
                    email: form.value.email?.trim() || null,
                    address_street: form.value.address_street?.trim() || null,
                    address_locality: form.value.address_locality?.trim() || null,
                    address_postal_code: form.value.address_postal_code?.trim() || null,
                    work_time: form.value.work_time?.trim() || null,
                    price_display_from: form.value.price_display_from?.trim() || null,
                    legal_link: form.value.legal_link?.trim() || null,
                };
                const res = editingId.value
                    ? await apiPut(`/cms/site-contacts/${editingId.value}`, payload)
                    : await apiPost('/cms/site-contacts', payload);
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || (data.errors && Object.values(data.errors).flat().join(', ')) || 'Ошибка');
                await Swal.fire({ title: 'Сохранено', icon: 'success', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
                showModal.value = false;
                fetchList();
            } catch (e) {
                Swal.fire({ title: 'Ошибка', text: e.message || 'Ошибка сохранения', icon: 'error' });
            } finally {
                saving.value = false;
            }
        };

        const remove = async (c) => {
            const ok = await Swal.fire({ title: 'Удалить контакт?', text: c.company_name || c.site?.domain, icon: 'warning', showCancelButton: true, confirmButtonText: 'Удалить', cancelButtonText: 'Отмена', confirmButtonColor: '#dc2626' });
            if (!ok.isConfirmed) return;
            try {
                const res = await apiDelete(`/cms/site-contacts/${c.id}`);
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
        return { loading, saving, error, items, sites, pagination, showModal, editingId, filters, form, debouncedFetch, setPage, openCreate, editItem, save, remove };
    },
};
</script>
