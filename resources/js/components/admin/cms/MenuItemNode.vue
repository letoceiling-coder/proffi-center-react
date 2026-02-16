<template>
    <div class="border border-border rounded-lg overflow-hidden">
        <div class="flex items-center gap-2 px-3 py-2 bg-muted/20 hover:bg-muted/30">
            <span class="font-medium flex-1">{{ node.title }}</span>
            <span class="text-xs text-muted-foreground">({{ node.link_type }}: {{ node.link_value }})</span>
            <button type="button" @click="$emit('add-child', node.id)" class="px-2 py-1 text-xs border rounded hover:bg-muted/50">+ Вложенный</button>
            <button type="button" @click="$emit('edit', node)" class="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded">Изменить</button>
            <button type="button" @click="$emit('move-up', node, 'up')" class="px-2 py-1 text-xs border rounded" :disabled="!canMoveUp">↑</button>
            <button type="button" @click="$emit('move-down', node, 'down')" class="px-2 py-1 text-xs border rounded" :disabled="!canMoveDown">↓</button>
            <button type="button" @click="$emit('delete', node)" class="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded">Удалить</button>
        </div>
        <div v-if="node.children && node.children.length" class="pl-4 border-l-2 border-border ml-3 mt-1 space-y-1">
            <MenuItemNode
                v-for="child in node.children"
                :key="child.id"
                :node="child"
                :menu-id="menuId"
                :site-id="siteId"
                :pages="pages"
                :services="services"
                :categories="categories"
                :products="products"
                :sibling-count="(node.children && node.children.length) || 0"
                :sibling-index="getChildIndex(child)"
                @add-child="$emit('add-child', $event)"
                @edit="$emit('edit', $event)"
                @delete="$emit('delete', $event)"
                @move-up="(n, d) => $emit('move-up', n, d)"
                @move-down="(n, d) => $emit('move-down', n, d)"
                @reload="$emit('reload')"
            />
        </div>
    </div>
</template>

<script>
export default {
    name: 'MenuItemNode',
    props: {
        node: { type: Object, required: true },
        menuId: { type: [Number, String], required: true },
        siteId: { type: [Number, String], required: true },
        pages: { type: Array, default: () => [] },
        services: { type: Array, default: () => [] },
        categories: { type: Array, default: () => [] },
        products: { type: Array, default: () => [] },
        siblingCount: { type: Number, default: 0 },
        siblingIndex: { type: Number, default: 0 },
    },
    emits: ['add-child', 'edit', 'delete', 'move-up', 'move-down', 'reload'],
    computed: {
        canMoveUp() {
            return this.siblingIndex > 0;
        },
        canMoveDown() {
            return this.siblingCount > 0 && this.siblingIndex < this.siblingCount - 1;
        },
    },
    methods: {
        getChildIndex(child) {
            const ch = this.node.children || [];
            const i = ch.findIndex(c => c.id === child.id);
            return i >= 0 ? i : 0;
        },
    },
};
</script>
