<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-semibold text-foreground">Микроразметка (Schema)</h1>
                <p class="text-muted-foreground mt-1">JSON-LD блоки: Organization, LocalBusiness, Service, BreadcrumbList, FAQPage</p>
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
                    <label class="block text-sm font-medium mb-1">Тип</label>
                    <select v-model="filters.type" @change="fetch" class="h-10 px-3 border border-border rounded bg-background w-48">
                        <option value="">Все</option>
                        <option v-for="t in schemaTypes" :key="t" :value="t">{{ t }}</option>
                    </select>
                </div>
                <div class="flex-1 min-w-[200px]">
                    <label class="block text-sm font-medium mb-1">Поиск</label>
                    <input v-model="filters.q" @input="debouncedFetch" type="text" placeholder="В data..." class="w-full h-10 px-3 border border-border rounded bg-background" />
                </div>
            </div>
            <div v-if="loading" class="py-8 text-center text-muted-foreground">Загрузка...</div>
            <table v-else class="w-full">
                <thead class="bg-muted/30 border-b border-border">
                    <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">ID</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Тип</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Привязка</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Вкл</th>
                        <th class="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Действия</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-border">
                    <tr v-for="b in items" :key="b.id" class="hover:bg-muted/10">
                        <td class="px-4 py-3 text-sm">{{ b.id }}</td>
                        <td class="px-4 py-3 font-mono text-sm">{{ b.type }}</td>
                        <td class="px-4 py-3 text-sm">{{ schemaableLabel(b) }}</td>
                        <td class="px-4 py-3 text-sm">{{ b.is_enabled ? 'Да' : 'Нет' }}</td>
                        <td class="px-4 py-3 text-right">
                            <button @click="editItem(b)" class="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded mr-1">Изменить</button>
                            <button @click="remove(b)" class="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded">Удалить</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div v-if="!loading && items.length === 0" class="py-8 text-center text-muted-foreground">Нет блоков</div>
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
                <h3 class="text-lg font-semibold mb-4">{{ editingId ? 'Редактировать блок' : 'Новый блок' }}</h3>
                <form @submit.prevent="save" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Привязка к *</label>
                        <select v-model="form.schemaableKind" @change="onSchemaableKindChange" class="w-full h-10 px-3 border border-border rounded bg-background">
                            <option value="site">Сайт (site-level)</option>
                            <option value="page">Страница</option>
                            <option value="service">Услуга</option>
                        </select>
                    </div>
                    <div v-if="form.schemaableKind === 'site'">
                        <label class="block text-sm font-medium mb-1">Сайт *</label>
                        <select v-model="form.schemaable_id" class="w-full h-10 px-3 border border-border rounded bg-background">
                            <option value="">— Выберите —</option>
                            <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.domain }}</option>
                        </select>
                    </div>
                    <div v-else>
                        <label class="block text-sm font-medium mb-1">Сайт (для списка)</label>
                        <select v-model="entitySiteId" @change="loadEntities" class="w-full h-10 px-3 border border-border rounded bg-background">
                            <option value="">— Выберите сайт —</option>
                            <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.domain }}</option>
                        </select>
                        <label class="block text-sm font-medium mb-1 mt-2">Сущность *</label>
                        <select v-model="form.schemaable_id" class="w-full h-10 px-3 border border-border rounded bg-background">
                            <option value="">— Выберите —</option>
                            <option v-for="e in entityList" :key="e.id" :value="e.id">{{ entityLabel(e) }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Тип схемы *</label>
                        <select v-model="form.type" class="w-full h-10 px-3 border border-border rounded bg-background">
                            <option v-for="t in schemaTypes" :key="t" :value="t">{{ t }}</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Data (JSON) *</label>
                        <textarea v-model="form.dataJson" rows="12" class="w-full px-3 py-2 border border-border rounded bg-background font-mono text-sm"></textarea>
                        <p class="text-xs text-muted-foreground mt-1">Валидный JSON. Для Organization: @type, name. Для FAQPage: @type, mainEntity и т.д.</p>
                    </div>
                    <div>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input v-model="form.is_enabled" type="checkbox" class="w-4 h-4" />
                            <span class="text-sm font-medium">Включён (не более одного включённого блока данного типа на сущность)</span>
                        </label>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Порядок (order)</label>
                        <input v-model.number="form.order" type="number" min="0" class="w-full h-10 px-3 border border-border rounded bg-background" />
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
import { ref, computed, onMounted } from 'vue';
import { apiGet, apiPost, apiPut, apiDelete } from '../../../utils/api';
import Swal from 'sweetalert2';

const SCHEMAABLE_TYPES = { site: 'App\\Models\\Site', page: 'App\\Models\\Page', service: 'App\\Models\\Service' };
const SCHEMA_TYPES = ['Organization', 'LocalBusiness', 'Service', 'BreadcrumbList', 'FAQPage'];

export default {
    name: 'SchemaBlocks',
    setup() {
        const items = ref([]);
        const pagination = ref(null);
        const sites = ref([]);
        const entityList = ref([]);
        const entitySiteId = ref('');
        const filters = ref({ site_id: '', type: '', q: '' });
        const loading = ref(false);
        const formError = ref('');
        const showModal = ref(false);
        const editingId = ref(null);
        const saving = ref(false);
        const form = ref({
            schemaableKind: 'site',
            schemaable_type: 'App\\Models\\Site',
            schemaable_id: '',
            type: 'Organization',
            dataJson: '{\n  "@type": "Organization",\n  "name": ""\n}',
            is_enabled: true,
            order: 0,
        });

        const schemaTypes = ref(SCHEMA_TYPES);

        const schemaableLabel = (b) => {
            if (!b.schemaable_type) return b.schemaable_id;
            if (b.schemaable_type.includes('Site')) return 'Сайт #' + b.schemaable_id;
            if (b.schemaable_type.includes('Page')) return 'Страница #' + b.schemaable_id;
            if (b.schemaable_type.includes('Service')) return 'Услуга #' + b.schemaable_id;
            return b.schemaable_type + ' #' + b.schemaable_id;
        };

        const entityLabel = (e) => (e.title || e.name || e.slug || '#' + e.id);

        const fetch = async () => {
            loading.value = true;
            try {
                const qs = new URLSearchParams();
                if (filters.value.site_id) qs.set('site_id', filters.value.site_id);
                if (filters.value.type) qs.set('type', filters.value.type);
                if (filters.value.q) qs.set('q', filters.value.q);
                if (pagination.value) qs.set('page', pagination.value.current_page);
                const res = await apiGet('/cms/schema-blocks?' + qs.toString());
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

        const onSchemaableKindChange = () => {
            form.value.schemaable_type = SCHEMAABLE_TYPES[form.value.schemaableKind] || SCHEMAABLE_TYPES.site;
            form.value.schemaable_id = form.value.schemaableKind === 'site' && sites.value.length ? sites.value[0].id : '';
            if (form.value.schemaableKind !== 'site') entitySiteId.value = sites.value[0]?.id || '';
            loadEntities();
        };

        const loadEntities = async () => {
            if (!entitySiteId.value) { entityList.value = []; return; }
            const path = form.value.schemaableKind === 'page' ? '/cms/pages' : '/cms/services';
            try {
                const res = await apiGet(path, { site_id: entitySiteId.value, per_page: 100 });
                const data = await res.json();
                entityList.value = data.data || [];
            } catch (_) {
                entityList.value = [];
            }
        };

        const openCreate = () => {
            editingId.value = null;
            form.value = {
                schemaableKind: 'site',
                schemaable_type: 'App\\Models\\Site',
                schemaable_id: sites.value[0]?.id || '',
                type: 'Organization',
                dataJson: '{\n  "@type": "Organization",\n  "name": ""\n}',
                is_enabled: true,
                order: 0,
            };
            entitySiteId.value = '';
            formError.value = '';
            showModal.value = true;
        };

        const editItem = async (b) => {
            editingId.value = b.id;
            let kind = 'site';
            if (b.schemaable_type && b.schemaable_type.includes('Page')) kind = 'page';
            else if (b.schemaable_type && b.schemaable_type.includes('Service')) kind = 'service';
            form.value = {
                schemaableKind: kind,
                schemaable_type: b.schemaable_type,
                schemaable_id: b.schemaable_id,
                type: b.type,
                dataJson: typeof b.data === 'string' ? b.data : JSON.stringify(b.data || {}, null, 2),
                is_enabled: !!b.is_enabled,
                order: b.order ?? 0,
            };
            entitySiteId.value = (b.schemaable && b.schemaable.site_id) ? b.schemaable.site_id : '';
            formError.value = '';
            showModal.value = true;
            if (kind !== 'site') await loadEntities();
        };

        const save = async () => {
            let dataObj = {};
            try {
                dataObj = JSON.parse(form.value.dataJson);
            } catch (e) {
                formError.value = 'Некорректный JSON: ' + e.message;
                return;
            }
            saving.value = true;
            formError.value = '';
            const payload = {
                schemaable_type: form.value.schemaableKind === 'site' ? 'App\\Models\\Site' : form.value.schemaable_type,
                schemaable_id: parseInt(form.value.schemaable_id, 10),
                type: form.value.type,
                data: dataObj,
                is_enabled: form.value.is_enabled,
                order: form.value.order,
            };
            try {
                if (editingId.value) {
                    const res = await apiPut('/cms/schema-blocks/' + editingId.value, payload);
                    const data = await res.json();
                    if (!res.ok) {
                        formError.value = data.message || (data.errors && Object.values(data.errors).flat().join(', ')) || 'Ошибка';
                        return;
                    }
                    await Swal.fire({ title: 'Сохранено', icon: 'success', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
                } else {
                    const res = await apiPost('/cms/schema-blocks', payload);
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

        const remove = async (b) => {
            const ok = await Swal.fire({ title: 'Удалить блок?', text: b.type, icon: 'warning', showCancelButton: true, confirmButtonText: 'Удалить', cancelButtonText: 'Отмена' });
            if (!ok.isConfirmed) return;
            try {
                await apiDelete('/cms/schema-blocks/' + b.id);
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

        return { items, pagination, sites, entityList, entitySiteId, filters, loading, formError, showModal, editingId, saving, form, schemaTypes, schemaableLabel, entityLabel, fetch, debouncedFetch, setPage, onSchemaableKindChange, loadEntities, openCreate, editItem, save, remove };
    },
};
</script>
