<template>
    <div class="space-y-6">
        <div class="flex items-center gap-4">
            <router-link :to="{ name: 'admin.cms.menus' }" class="text-muted-foreground hover:text-foreground">← Меню</router-link>
            <h1 class="text-2xl font-semibold">Пункты меню: {{ menu ? (menu.slug + (menu.title ? ' — ' + menu.title : '')) : '' }}</h1>
        </div>
        <div v-if="loadingMenu" class="py-8 text-muted-foreground">Загрузка...</div>
        <template v-else-if="menu">
            <div class="bg-card rounded-lg border border-border p-6">
                <div class="flex justify-between items-center mb-4">
                    <span class="text-muted-foreground">Дерево пунктов (порядок по order)</span>
                    <button
                        @click="openAddItem(null)"
                        class="h-10 px-4 bg-accent/10 text-accent border border-accent/40 rounded-lg text-sm"
                    >
                        + Добавить пункт (корневой)
                    </button>
                </div>
                <div v-if="loadingItems" class="py-4 text-muted-foreground">Загрузка пунктов...</div>
                <div v-else class="space-y-1">
                    <MenuItemNode
                        v-for="(node, index) in tree"
                        :key="node.id"
                        :node="node"
                        :menu-id="menu.id"
                        :sibling-count="tree.length"
                        :sibling-index="index"
                        :site-id="menu.site_id"
                        :pages="pages"
                        :services="services"
                        :categories="categories"
                        :products="products"
                        @add-child="openAddItem"
                        @edit="openEditItem"
                        @delete="deleteItem"
                        @move-up="moveItem"
                        @move-down="moveItem"
                        @reload="loadItems"
                    />
                </div>
                <p v-if="!loadingItems && tree.length === 0" class="text-muted-foreground py-4">Нет пунктов. Добавьте корневой пункт.</p>
            </div>
        </template>
        <div v-else class="text-destructive">Меню не найдено</div>

        <div v-if="itemModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80" @click.self="itemModal = false">
            <div class="bg-background border border-border rounded-lg shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-auto">
                <h3 class="text-lg font-semibold mb-4">{{ editingItemId ? 'Редактировать пункт' : 'Новый пункт' }}</h3>
                <form @submit.prevent="saveItem" class="space-y-4">
                    <div v-if="itemForm.parent_id !== null && itemForm.parent_id !== ''">
                        <label class="block text-sm font-medium mb-1">Родитель</label>
                        <input :value="parentTitle" class="w-full h-10 px-3 border border-border rounded bg-muted/30" disabled />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Название *</label>
                        <input v-model="itemForm.title" required maxlength="255" class="w-full h-10 px-3 border border-border rounded bg-background" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Тип ссылки *</label>
                        <select v-model="itemForm.link_type" class="w-full h-10 px-3 border border-border rounded bg-background">
                            <option value="url">URL (или путь)</option>
                            <option value="page">Страница</option>
                            <option value="service">Услуга</option>
                            <option value="category">Категория товара</option>
                            <option value="product">Товар</option>
                        </select>
                    </div>
                    <div v-if="itemForm.link_type === 'url'">
                        <label class="block text-sm font-medium mb-1">URL / путь *</label>
                        <input v-model="itemForm.link_value" required class="w-full h-10 px-3 border border-border rounded bg-background" placeholder="/ или https://..." />
                    </div>
                    <div v-else>
                        <label class="block text-sm font-medium mb-1">Slug сущности *</label>
                        <select v-if="itemForm.link_type === 'page'" v-model="itemForm.link_value" required class="w-full h-10 px-3 border border-border rounded bg-background">
                            <option value="">— Выберите страницу —</option>
                            <option v-for="p in pages" :key="p.id" :value="p.slug">{{ p.title }} ({{ p.slug }})</option>
                        </select>
                        <select v-else-if="itemForm.link_type === 'service'" v-model="itemForm.link_value" required class="w-full h-10 px-3 border border-border rounded bg-background">
                            <option value="">— Выберите услугу —</option>
                            <option v-for="s in services" :key="s.id" :value="s.slug">{{ s.title }} ({{ s.slug }})</option>
                        </select>
                        <select v-else-if="itemForm.link_type === 'category'" v-model="itemForm.link_value" required class="w-full h-10 px-3 border border-border rounded bg-background">
                            <option value="">— Выберите категорию —</option>
                            <option v-for="c in categories" :key="c.id" :value="c.slug">{{ c.title }} ({{ c.slug }})</option>
                        </select>
                        <select v-else-if="itemForm.link_type === 'product'" v-model="itemForm.link_value" required class="w-full h-10 px-3 border border-border rounded bg-background">
                            <option value="">— Выберите товар —</option>
                            <option v-for="p in products" :key="p.id" :value="p.slug">{{ p.name }} ({{ p.slug }})</option>
                        </select>
                    </div>
                    <div>
                        <label class="flex items-center gap-2 cursor-pointer">
                            <input v-model="itemForm.open_new_tab" type="checkbox" class="w-4 h-4" />
                            <span class="text-sm font-medium">Открывать в новой вкладке</span>
                        </label>
                    </div>
                    <div>
                        <label class="block text-sm font-medium mb-1">Порядок (order)</label>
                        <input v-model.number="itemForm.order" type="number" min="0" class="w-full h-10 px-3 border border-border rounded bg-background" />
                    </div>
                    <p v-if="itemError" class="text-sm text-destructive">{{ itemError }}</p>
                    <div class="flex gap-2 pt-2">
                        <button type="button" @click="itemModal = false" class="flex-1 h-10 border border-border rounded-lg">Отмена</button>
                        <button type="submit" :disabled="savingItem" class="flex-1 h-10 bg-accent/10 text-accent border border-accent/40 rounded-lg disabled:opacity-50">{{ savingItem ? 'Сохранение...' : 'Сохранить' }}</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { apiGet, apiPost, apiPut, apiDelete } from '../../../utils/api';
import Swal from 'sweetalert2';
import MenuItemNode from '../../../components/admin/cms/MenuItemNode.vue';

export default {
    name: 'MenuEditor',
    components: { MenuItemNode },
    setup() {
        const route = useRoute();
        const menu = ref(null);
        const loadingMenu = ref(true);
        const tree = ref([]);
        const loadingItems = ref(false);
        const pages = ref([]);
        const services = ref([]);
        const categories = ref([]);
        const products = ref([]);
        const itemModal = ref(false);
        const editingItemId = ref(null);
        const itemForm = ref({
            parent_id: null,
            title: '',
            link_type: 'url',
            link_value: '/',
            open_new_tab: false,
            order: 0,
        });
        const savingItem = ref(false);
        const itemError = ref('');

        const parentTitle = computed(() => {
            if (!itemForm.value.parent_id) return '';
            const find = (nodes) => {
                for (const n of nodes) {
                    if (n.id == itemForm.value.parent_id) return n.title;
                    const inChild = find(n.children || []);
                    if (inChild) return inChild;
                }
                return '';
            };
            return find(tree.value) || '';
        });

        const loadMenu = async () => {
            loadingMenu.value = true;
            try {
                const res = await apiGet('/cms/menus/' + route.params.id);
                const data = await res.json();
                menu.value = data.data || null;
            } catch (_) {
                menu.value = null;
            } finally {
                loadingMenu.value = false;
            }
        };

        const loadItems = async () => {
            if (!menu.value) return;
            loadingItems.value = true;
            try {
                const res = await apiGet('/cms/menus/' + menu.value.id + '/items');
                const data = await res.json();
                tree.value = (data.data && data.data.items) || [];
            } catch (_) {
                tree.value = [];
            } finally {
                loadingItems.value = false;
            }
        };

        const loadSiteContent = async () => {
            if (!menu.value || !menu.value.site_id) return;
            const siteId = menu.value.site_id;
            try {
                const [pRes, sRes, cRes, prodRes] = await Promise.all([
                    apiGet('/cms/pages', { site_id: siteId, per_page: 100 }),
                    apiGet('/cms/services', { site_id: siteId, per_page: 100 }),
                    apiGet('/cms/product-categories', { site_id: siteId, per_page: 100 }),
                    apiGet('/cms/products', { site_id: siteId, per_page: 100 }),
                ]);
                pages.value = (await pRes.json()).data || [];
                services.value = (await sRes.json()).data || [];
                categories.value = (await cRes.json()).data || [];
                products.value = (await prodRes.json()).data || [];
            } catch (_) {}
        };

        const openAddItem = (parentId) => {
            editingItemId.value = null;
            itemForm.value = {
                parent_id: parentId ?? null,
                title: '',
                link_type: 'url',
                link_value: '/',
                open_new_tab: false,
                order: tree.value.length,
            };
            itemError.value = '';
            itemModal.value = true;
        };

        const openEditItem = (node) => {
            editingItemId.value = node.id;
            itemForm.value = {
                parent_id: node.parent_id,
                title: node.title,
                link_type: node.link_type,
                link_value: node.link_value || '/',
                open_new_tab: !!node.open_new_tab,
                order: node.order ?? 0,
            };
            itemError.value = '';
            itemModal.value = true;
        };

        const saveItem = async () => {
            if (!menu.value) return;
            savingItem.value = true;
            itemError.value = '';
            try {
                const payload = { ...itemForm.value };
                if (payload.link_type !== 'url' && !payload.link_value && itemForm.value.link_type === 'page') {
                    const first = pages.value[0];
                    if (first) payload.link_value = first.slug;
                }
                if (editingItemId.value) {
                    const res = await apiPut('/cms/menu-items/' + editingItemId.value, payload);
                    const data = await res.json();
                    if (!res.ok) {
                        itemError.value = data.message || (data.errors && Object.values(data.errors).flat().join(', ')) || 'Ошибка';
                        return;
                    }
                    await Swal.fire({ title: 'Сохранено', icon: 'success', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
                } else {
                    const res = await apiPost('/cms/menus/' + menu.value.id + '/items', payload);
                    const data = await res.json();
                    if (!res.ok) {
                        itemError.value = data.message || (data.errors && Object.values(data.errors).flat().join(', ')) || 'Ошибка';
                        return;
                    }
                    await Swal.fire({ title: 'Добавлено', icon: 'success', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
                }
                itemModal.value = false;
                loadItems();
            } catch (e) {
                itemError.value = e.message;
            } finally {
                savingItem.value = false;
            }
        };

        const deleteItem = async (node) => {
            const ok = await Swal.fire({ title: 'Удалить пункт?', text: node.title + ' (и вложенные)', icon: 'warning', showCancelButton: true, confirmButtonText: 'Удалить', cancelButtonText: 'Отмена' });
            if (!ok.isConfirmed) return;
            try {
                await apiDelete('/cms/menu-items/' + node.id);
                await Swal.fire({ title: 'Удалено', icon: 'success', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
                loadItems();
            } catch (_) {}
        };

        const moveItem = async (node, direction) => {
            try {
                await apiPost('/cms/menu-items/' + node.id + '/move', { direction });
                loadItems();
            } catch (_) {}
        };

        onMounted(async () => {
            await loadMenu();
            if (menu.value) {
                await loadItems();
                await loadSiteContent();
            }
        });

        watch(() => route.params.id, () => { loadMenu().then(() => menu.value && loadItems()); });

        return {
            menu, loadingMenu, tree, loadingItems, pages, services, categories, products,
            itemModal, editingItemId, itemForm, parentTitle, savingItem, itemError,
            openAddItem, openEditItem, saveItem, deleteItem, moveItem, loadItems,
        };
    },
};
</script>
