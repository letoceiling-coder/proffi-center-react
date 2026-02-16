<template>
    <div class="space-y-2">
        <div class="flex items-center gap-2">
            <input
                type="number"
                min="0"
                :value="modelValue"
                @input="onInput"
                placeholder="ID медиа (или выберите ниже)"
                class="h-10 px-3 border border-border rounded bg-background w-32"
            />
            <button type="button" @click="showModal = true" class="h-10 px-4 border border-border rounded-lg hover:bg-muted/50 text-sm">Выбрать из медиатеки</button>
            <button v-if="modelValue" type="button" @click="clear" class="h-10 px-3 text-muted-foreground hover:text-foreground text-sm">Сбросить</button>
        </div>
        <p v-if="selectedName" class="text-sm text-muted-foreground">Выбрано: {{ selectedName }}</p>
        <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80" @click.self="showModal = false">
            <div class="bg-background border border-border rounded-lg shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div class="p-4 border-b border-border flex justify-between items-center">
                    <h3 class="text-lg font-semibold">Выбор медиа (OG-изображение)</h3>
                    <button type="button" @click="showModal = false" class="text-muted-foreground hover:text-foreground">&times;</button>
                </div>
                <div class="p-4 overflow-auto flex-1">
                    <input
                        v-model="search"
                        @input="debouncedLoad"
                        type="text"
                        placeholder="Поиск..."
                        class="w-full h-10 px-3 border border-border rounded mb-4"
                    />
                    <div v-if="loading" class="py-8 text-center text-muted-foreground">Загрузка...</div>
                    <ul v-else class="divide-y divide-border">
                        <li
                            v-for="m in mediaList"
                            :key="m.id"
                            @click="select(m)"
                            class="py-2 px-3 cursor-pointer hover:bg-muted/50 rounded flex items-center gap-3"
                        >
                            <span class="font-medium">#{{ m.id }}</span>
                            <span class="text-muted-foreground">{{ m.name || '—' }}</span>
                        </li>
                    </ul>
                    <p v-if="!loading && mediaList.length === 0" class="text-muted-foreground py-4">Нет медиа. Загрузите файлы в разделе Медиатека CMS.</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { ref, watch } from 'vue';
import { apiGet } from '../../../utils/api';

export default {
    name: 'CmsMediaPicker',
    props: {
        modelValue: { type: Number, default: null },
    },
    emits: ['update:modelValue'],
    setup(props, { emit }) {
        const showModal = ref(false);
        const search = ref('');
        const loading = ref(false);
        const mediaList = ref([]);
        const selectedName = ref('');

        const load = async () => {
            loading.value = true;
            try {
                const qs = new URLSearchParams({ per_page: 50 });
                if (search.value && search.value.trim()) qs.set('search', search.value.trim());
                const res = await apiGet(`/cms/cms-media?${qs}`);
                const data = await res.json();
                mediaList.value = data.data || [];
            } finally {
                loading.value = false;
            }
        };

        let debounceTimer = null;
        const debouncedLoad = () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(load, 300);
        };

        const select = (m) => {
            emit('update:modelValue', m.id);
            selectedName.value = m.name || `#${m.id}`;
            showModal.value = false;
        };

        const clear = () => {
            emit('update:modelValue', null);
            selectedName.value = '';
        };

        const onInput = (e) => {
            const v = e.target.value ? parseInt(e.target.value, 10) : null;
            emit('update:modelValue', Number.isNaN(v) ? null : v);
        };

        watch(() => props.modelValue, async (id) => {
            selectedName.value = '';
            if (id) {
                try {
                    const res = await apiGet(`/cms/cms-media/${id}`);
                    if (res.ok) {
                        const data = await res.json();
                        selectedName.value = data.data?.name || `#${id}`;
                    }
                } catch (_) {}
            }
        }, { immediate: true });

        watch(showModal, (open) => { if (open) load(); });

        return { showModal, search, loading, mediaList, selectedName, debouncedLoad, select, clear, onInput };
    },
};
</script>
