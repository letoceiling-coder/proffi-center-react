<template>
    <div class="space-y-6">
        <div class="flex items-center gap-4">
            <router-link :to="{ name: 'admin.cms.pages' }" class="text-muted-foreground hover:text-foreground">← Страницы</router-link>
            <h1 class="text-2xl font-semibold">Редактирование страницы</h1>
        </div>
        <div v-if="loadingPage" class="py-8 text-muted-foreground">Загрузка...</div>
        <template v-else-if="page">
            <div class="border-b border-border mb-4">
                <nav class="flex gap-4">
                    <button @click="tab = 'main'" :class="['pb-3 px-1 border-b-2', tab === 'main' ? 'border-accent text-accent' : 'border-transparent']">Основное</button>
                    <button @click="tab = 'blocks'" :class="['pb-3 px-1 border-b-2', tab === 'blocks' ? 'border-accent text-accent' : 'border-transparent']">Блоки</button>
                    <button @click="tab = 'media'" :class="['pb-3 px-1 border-b-2', tab === 'media' ? 'border-accent text-accent' : 'border-transparent']">Медиа</button>
                    <button @click="tab = 'seo'" :class="['pb-3 px-1 border-b-2', tab === 'seo' ? 'border-accent text-accent' : 'border-transparent']">SEO</button>
                </nav>
            </div>
            <div v-if="tab === 'main'" class="bg-card rounded-lg border border-border p-6 max-w-md">
                <form @submit.prevent="saveMain" class="space-y-4">
                    <div><label class="block text-sm font-medium mb-1">Title *</label>
                        <input v-model="form.title" required class="w-full h-10 px-3 border border-border rounded bg-background" />
                    </div>
                    <div><label class="block text-sm font-medium mb-1">Slug *</label>
                        <input v-model="form.slug" required class="w-full h-10 px-3 border border-border rounded bg-background" />
                    </div>
                    <div><label class="block text-sm font-medium mb-1">Статус</label>
                        <select v-model="form.status" class="w-full h-10 px-3 border border-border rounded bg-background">
                            <option value="draft">Черновик</option>
                            <option value="published">Опубликовано</option>
                            <option value="archived">Архив</option>
                        </select>
                    </div>
                    <p v-if="mainError" class="text-sm text-destructive">{{ mainError }}</p>
                    <button type="submit" :disabled="saving" class="h-10 px-6 bg-accent/10 text-accent border border-accent/40 rounded-lg disabled:opacity-50">{{ saving ? 'Сохранение...' : 'Сохранить' }}</button>
                </form>
            </div>
            <div v-if="tab === 'blocks'" class="bg-card rounded-lg border border-border p-6">
                <ContentBlocksEditor entity-type="pages" :entity-id="page.id" />
            </div>
            <div v-if="tab === 'media'" class="bg-card rounded-lg border border-border p-6">
                <p class="text-muted-foreground">Привязка медиа к странице: используйте Медиатеку CMS и эндпоинт attach (mediable_type=Page, mediable_id={{ page.id }}).</p>
            </div>
            <div v-if="tab === 'seo'" class="bg-card rounded-lg border border-border p-6 max-w-2xl">
                <form @submit.prevent="saveSeo" class="space-y-4">
                    <div><label class="block text-sm font-medium mb-1">SEO Title</label>
                        <input v-model="seoForm.title" maxlength="255" class="w-full h-10 px-3 border border-border rounded bg-background" placeholder="Мета title" />
                    </div>
                    <div><label class="block text-sm font-medium mb-1">Meta description</label>
                        <textarea v-model="seoForm.description" rows="2" maxlength="5000" class="w-full px-3 py-2 border border-border rounded bg-background" placeholder="Описание для поисковиков"></textarea>
                    </div>
                    <div><label class="block text-sm font-medium mb-1">H1</label>
                        <input v-model="seoForm.h1" maxlength="255" class="w-full h-10 px-3 border border-border rounded bg-background" placeholder="Заголовок H1" />
                    </div>
                    <div><label class="block text-sm font-medium mb-1">Canonical URL</label>
                        <input v-model="seoForm.canonical_url" maxlength="500" type="url" class="w-full h-10 px-3 border border-border rounded bg-background" placeholder="https://..." />
                    </div>
                    <div><label class="block text-sm font-medium mb-1">Robots</label>
                        <input v-model="seoForm.robots" maxlength="100" class="w-full h-10 px-3 border border-border rounded bg-background" placeholder="index,follow" />
                    </div>
                    <div><label class="block text-sm font-medium mb-1">OG Title</label>
                        <input v-model="seoForm.og_title" maxlength="255" class="w-full h-10 px-3 border border-border rounded bg-background" />
                    </div>
                    <div><label class="block text-sm font-medium mb-1">OG Description</label>
                        <textarea v-model="seoForm.og_description" rows="2" maxlength="5000" class="w-full px-3 py-2 border border-border rounded bg-background"></textarea>
                    </div>
                    <div><label class="block text-sm font-medium mb-1">OG Image (медиа)</label>
                        <CmsMediaPicker v-model="seoForm.og_image_media_id" />
                    </div>
                    <div><label class="block text-sm font-medium mb-1">Twitter card</label>
                        <input v-model="seoForm.twitter_card" maxlength="50" class="w-full h-10 px-3 border border-border rounded bg-background" placeholder="summary_large_image" />
                    </div>
                    <div><label class="block text-sm font-medium mb-1">Twitter title</label>
                        <input v-model="seoForm.twitter_title" maxlength="255" class="w-full h-10 px-3 border border-border rounded bg-background" />
                    </div>
                    <p v-if="seoError" class="text-sm text-destructive">{{ seoError }}</p>
                    <button type="submit" :disabled="savingSeo" class="h-10 px-6 bg-accent/10 text-accent border border-accent/40 rounded-lg disabled:opacity-50">{{ savingSeo ? 'Сохранение...' : 'Сохранить SEO' }}</button>
                </form>
            </div>
        </template>
        <div v-else class="text-destructive">Страница не найдена</div>
    </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { apiGet, apiPut } from '../../../utils/api';
import ContentBlocksEditor from '../../../components/admin/cms/ContentBlocksEditor.vue';
import Swal from 'sweetalert2';

export default {
    name: 'PageEdit',
    components: { ContentBlocksEditor },
    setup() {
        const route = useRoute();
        const page = ref(null);
        const loadingPage = ref(true);
        const saving = ref(false);
        const mainError = ref('');
        const tab = ref('main');
        const form = ref({ title: '', slug: '', status: 'draft' });
        const seoForm = ref({
            title: '', description: '', h1: '', canonical_url: '', robots: '',
            og_title: '', og_description: '', og_image_media_id: null,
            twitter_card: '', twitter_title: '',
        });
        const savingSeo = ref(false);
        const seoError = ref('');

        const fetchPage = async () => {
            loadingPage.value = true;
            try {
                const res = await apiGet(`/cms/pages/${route.params.id}`);
                if (!res.ok) { page.value = null; return; }
                const data = await res.json();
                page.value = data.data;
                form.value = { title: data.data.title, slug: data.data.slug, status: data.data.status || 'draft' };
                await loadSeoMeta();
            } catch (e) {
                page.value = null;
            } finally {
                loadingPage.value = false;
            }
        };

        const saveMain = async () => {
            if (!page.value) return;
            saving.value = true;
            mainError.value = '';
            try {
                const res = await apiPut(`/cms/pages/${page.value.id}`, { site_id: page.value.site_id, slug: form.value.slug, title: form.value.title, status: form.value.status });
                const data = await res.json();
                if (!res.ok) { mainError.value = data.message || (data.errors && Object.values(data.errors).flat().join(', ')) || 'Ошибка'; return; }
                await Swal.fire({ title: 'Сохранено', icon: 'success', timer: 1500, showConfirmButton: false, toast: true, position: 'top-end' });
                page.value = { ...page.value, ...form.value };
            } catch (e) {
                mainError.value = e.message;
            } finally {
                saving.value = false;
            }
        };

        onMounted(fetchPage);
        return { page, loadingPage, saving, mainError, tab, form, saveMain, seoForm, savingSeo, seoError, saveSeo };
    },
};
</script>
