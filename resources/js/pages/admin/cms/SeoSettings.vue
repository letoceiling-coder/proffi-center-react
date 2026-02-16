<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <h1 class="text-3xl font-semibold text-foreground">SEO Настройки</h1>
        </div>
        <div class="bg-card rounded-lg border border-border p-6 max-w-2xl">
            <div class="mb-4">
                <label class="block text-sm font-medium mb-1">Сайт</label>
                <select v-model="selectedSiteId" @change="loadSettings" class="w-full max-w-xs h-10 px-3 border border-border rounded bg-background">
                    <option value="">— Выберите сайт —</option>
                    <option v-for="s in sites" :key="s.id" :value="s.id">{{ s.domain }}</option>
                </select>
            </div>
            <div v-if="loading" class="py-8 text-muted-foreground">Загрузка...</div>
            <form v-else-if="setting" @submit.prevent="save" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Суффикс title (default_title_suffix)</label>
                    <input v-model="form.default_title_suffix" maxlength="255" class="w-full h-10 px-3 border border-border rounded bg-background" placeholder=" | Сайт" />
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Описание по умолчанию (default_description)</label>
                    <textarea v-model="form.default_description" rows="3" maxlength="5000" class="w-full px-3 py-2 border border-border rounded bg-background"></textarea>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Верификация Google (verification_google)</label>
                    <input v-model="form.verification_google" maxlength="500" class="w-full h-10 px-3 border border-border rounded bg-background" />
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Верификация Yandex (verification_yandex)</label>
                    <input v-model="form.verification_yandex" maxlength="500" class="w-full h-10 px-3 border border-border rounded bg-background" />
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Дополнение robots.txt (robots_txt_append)</label>
                    <textarea v-model="form.robots_txt_append" rows="4" maxlength="10000" class="w-full px-3 py-2 border border-border rounded bg-background font-mono text-sm"></textarea>
                </div>
                <p v-if="error" class="text-sm text-destructive">{{ error }}</p>
                <button type="submit" :disabled="saving" class="h-10 px-6 bg-accent/10 text-accent border border-accent/40 rounded-lg disabled:opacity-50">{{ saving ? 'Сохранение...' : 'Сохранить' }}</button>
            </form>
            <p v-else-if="selectedSiteId && !loading" class="text-muted-foreground">Выберите сайт для редактирования SEO-настроек.</p>
        </div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { apiGet, apiPut } from '../../../utils/api';
import Swal from 'sweetalert2';

export default {
    name: 'SeoSettings',
    setup() {
        const sites = ref([]);
        const selectedSiteId = ref('');
        const setting = ref(null);
        const form = ref({
            default_title_suffix: '',
            default_description: '',
            verification_google: '',
            verification_yandex: '',
            robots_txt_append: '',
        });
        const loading = ref(false);
        const saving = ref(false);
        const error = ref('');

        const loadSites = async () => {
            try {
                const res = await apiGet('/cms/sites', { per_page: 100 });
                const data = await res.json();
                sites.value = data.data || [];
            } catch (_) {}
        };

        const loadSettings = async () => {
            if (!selectedSiteId.value) { setting.value = null; return; }
            loading.value = true;
            error.value = '';
            try {
                const res = await apiGet('/cms/seo-settings?site_id=' + selectedSiteId.value);
                const data = await res.json();
                setting.value = data.data;
                if (data.data) {
                    form.value = {
                        default_title_suffix: data.data.default_title_suffix ?? '',
                        default_description: data.data.default_description ?? '',
                        verification_google: data.data.verification_google ?? '',
                        verification_yandex: data.data.verification_yandex ?? '',
                        robots_txt_append: data.data.robots_txt_append ?? '',
                    };
                }
            } catch (_) {
                setting.value = null;
            } finally {
                loading.value = false;
            }
        };

        const save = async () => {
            if (!setting.value) return;
            saving.value = true;
            error.value = '';
            try {
                const res = await apiPut('/cms/seo-settings/' + setting.value.id, form.value);
                const data = await res.json();
                if (!res.ok) {
                    error.value = data.message || (data.errors && Object.values(data.errors).flat().join(', ')) || 'Ошибка';
                    return;
                }
                setting.value = data.data;
                await Swal.fire({ title: 'Сохранено', icon: 'success', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
            } catch (e) {
                error.value = e.message;
            } finally {
                saving.value = false;
            }
        };

        onMounted(async () => {
            await loadSites();
        });

        return { sites, selectedSiteId, setting, form, loading, saving, error, loadSettings, save };
    },
};
</script>
