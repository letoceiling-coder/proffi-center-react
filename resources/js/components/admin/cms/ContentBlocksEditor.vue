<template>
    <div class="space-y-4">
        <div class="flex items-center justify-between">
            <h4 class="font-medium">Блоки контента</h4>
            <div class="flex gap-2">
                <select v-model="newBlockType" class="h-9 px-3 border border-border rounded bg-background text-sm">
                    <option value="">Тип блока</option>
                    <option v-for="t in blockTypes" :key="t" :value="t">{{ t }}</option>
                </select>
                <button @click="addBlock" :disabled="!newBlockType" class="h-9 px-4 bg-accent/10 text-accent border border-accent/40 rounded text-sm disabled:opacity-50">Добавить</button>
            </div>
        </div>
        <div v-if="loading" class="py-4 text-muted-foreground">Загрузка блоков...</div>
        <div v-else class="space-y-2">
            <div v-for="(block, idx) in blocks" :key="block.id" class="border border-border rounded-lg p-4 bg-muted/10">
                <div class="flex items-center justify-between mb-2">
                    <span class="font-mono text-sm">{{ block.type }} (order: {{ block.order }})</span>
                    <div class="flex gap-1">
                        <button @click="moveBlock(block, 'up')" :disabled="idx === 0" class="px-2 py-1 text-xs border rounded disabled:opacity-50">↑</button>
                        <button @click="moveBlock(block, 'down')" :disabled="idx === blocks.length - 1" class="px-2 py-1 text-xs border rounded disabled:opacity-50">↓</button>
                        <button @click="editBlock(block)" class="px-2 py-1 text-xs bg-blue-500 text-white rounded">Изменить</button>
                        <button @click="deleteBlock(block)" class="px-2 py-1 text-xs bg-red-500 text-white rounded">Удалить</button>
                    </div>
                </div>
                <pre class="text-xs text-muted-foreground overflow-x-auto">{{ JSON.stringify(block.data, null, 2) }}</pre>
            </div>
            <div v-if="blocks.length === 0" class="py-6 text-center text-muted-foreground">Нет блоков. Добавьте блок.</div>
        </div>
        <div v-if="showEditModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
            <div class="bg-background border border-border rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                <h4 class="font-semibold mb-2">Редактировать блок ({{ editingBlock?.type }})</h4>
                <div class="space-y-2">
                    <label class="block text-sm font-medium">Data (JSON)</label>
                    <textarea v-model="editDataJson" rows="10" class="w-full px-3 py-2 border border-border rounded bg-background font-mono text-sm"></textarea>
                    <p v-if="editError" class="text-sm text-destructive">{{ editError }}</p>
                </div>
                <div class="flex gap-2 mt-4">
                    <button type="button" @click="showEditModal = false" class="flex-1 h-10 border border-border rounded-lg">Отмена</button>
                    <button @click="saveBlockData" :disabled="saving" class="flex-1 h-10 bg-accent/10 text-accent border border-accent/40 rounded-lg disabled:opacity-50">{{ saving ? 'Сохранение...' : 'Сохранить' }}</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { apiGet, apiPut, apiPost, apiDelete } from '../../../utils/api';
import Swal from 'sweetalert2';

export default {
    name: 'ContentBlocksEditor',
    props: {
        entityType: { type: String, required: true },
        entityId: { type: [Number, String], required: true },
    },
    setup(props) {
        const blocks = ref([]);
        const loading = ref(false);
        const saving = ref(false);
        const newBlockType = ref('');
        const showEditModal = ref(false);
        const editingBlock = ref(null);
        const editDataJson = ref('{}');
        const editError = ref('');
        const blockTypes = ['hero', 'simple_text', 'gallery', 'pr_table', 'form_low_price', 'zamer'];

        const blocksUrl = () => `/cms/${props.entityType}/${props.entityId}/blocks`;

        const fetchBlocks = async () => {
            if (!props.entityId) return;
            loading.value = true;
            try {
                const res = await apiGet(blocksUrl());
                if (!res.ok) throw new Error('Ошибка загрузки блоков');
                const data = await res.json();
                blocks.value = data.data || [];
            } catch (e) {
                blocks.value = [];
            } finally {
                loading.value = false;
            }
        };

        const addBlock = async () => {
            if (!newBlockType.value) return;
            saving.value = true;
            try {
                const defaultData = newBlockType.value === 'hero' ? { title: '', subtitle: '', cta_text: '', cta_url: '' }
                    : newBlockType.value === 'simple_text' ? { html: '', text: '' }
                    : newBlockType.value === 'gallery' ? { media_ids: [] }
                    : newBlockType.value === 'form_low_price' || newBlockType.value === 'zamer' ? { enabled: false }
                    : newBlockType.value === 'pr_table' ? { rows: [] } : {};
                const res = await apiPost(blocksUrl(), { type: newBlockType.value, data: defaultData });
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || (data.errors && Object.values(data.errors).flat().join(', ')) || 'Ошибка');
                await fetchBlocks();
                newBlockType.value = '';
            } catch (e) {
                Swal.fire({ title: 'Ошибка', text: e.message, icon: 'error' });
            } finally {
                saving.value = false;
            }
        };

        const editBlock = (block) => {
            editingBlock.value = block;
            editDataJson.value = JSON.stringify(block.data || {}, null, 2);
            editError.value = '';
            showEditModal.value = true;
        };

        const saveBlockData = async () => {
            let data;
            try {
                data = JSON.parse(editDataJson.value);
            } catch (e) {
                editError.value = 'Невалидный JSON';
                return;
            }
            editError.value = '';
            saving.value = true;
            try {
                const res = await apiPut(`/cms/blocks/${editingBlock.value.id}`, { data });
                const resp = await res.json();
                if (!res.ok) throw new Error(resp.message || (resp.errors && Object.values(resp.errors).flat().join(', ')) || 'Ошибка');
                await fetchBlocks();
                showEditModal.value = false;
            } catch (e) {
                editError.value = e.message;
            } finally {
                saving.value = false;
            }
        };

        const moveBlock = async (block, direction) => {
            try {
                const res = await apiPost(`/cms/blocks/${block.id}/move`, { direction });
                if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Ошибка'); }
                await fetchBlocks();
            } catch (e) {
                Swal.fire({ title: 'Ошибка', text: e.message, icon: 'error' });
            }
        };

        const deleteBlock = async (block) => {
            const ok = await Swal.fire({ title: 'Удалить блок?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Удалить', cancelButtonText: 'Отмена', confirmButtonColor: '#dc2626' });
            if (!ok.isConfirmed) return;
            try {
                const res = await apiDelete(`/cms/blocks/${block.id}`);
                if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Ошибка'); }
                await fetchBlocks();
            } catch (e) {
                Swal.fire({ title: 'Ошибка', text: e.message, icon: 'error' });
            }
        };

        watch([() => props.entityId, () => props.entityType], fetchBlocks, { immediate: true });
        onMounted(fetchBlocks);
        return { blocks, loading, saving, newBlockType, blockTypes, showEditModal, editingBlock, editDataJson, editError, addBlock, editBlock, saveBlockData, moveBlock, deleteBlock };
    },
};
</script>
