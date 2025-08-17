<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { GatedFile } from '../../../../types';
import { createSeiMoneySDK } from '@seimoney/sdk/src/sdk';

const isLoading = ref(true);
const files = ref<GatedFile[]>([]);
const sdk = createSeiMoneySDK({ apiUrl: "https://api.seimoney.link" });

const getFiles = async () => {
    isLoading.value = true;
    files.value = await sdk.files.getFiles();
    isLoading.value = false;
};


const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const getFileTypeIcon = (fileType: string) => {
    switch (fileType?.toLowerCase()) {
        case 'pdf': return 'mdi mdi-file-pdf-box';
        case 'video': return 'mdi mdi-video';
        case 'zip': return 'mdi mdi-folder-zip';
        case 'image': return 'mdi mdi-image';
        case 'audio': return 'mdi mdi-music';
        default: return 'mdi mdi-file';
    }
};

const copyFileLink = (fileId: string) => {
    const url = `${window.location.origin}/pay/file/${fileId}`;
    navigator.clipboard.writeText(url);
    console.log('File link copied:', url);
};

onMounted(() => {
    getFiles();
});
</script>

<template>
    <div class="files-container">
        <div class="files-header">
            <div>
                <h1>Files</h1>
                <p>Manage your premium content and digital products</p>
            </div>
            <router-link to="/dashboard/files/upload" class="btn btn-primary">
                + Upload File
            </router-link>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading your files...</p>
        </div>

        <div class="files-content" v-else>
            <div v-if="files.length === 0" class="empty-state">
                <div class="empty-icon">
                    <i class="mdi mdi-folder-open"></i>
                </div>
                <h3>No gated files yet</h3>
                <p>Upload your first premium content to start monetizing</p>
                <router-link to="/dashboard/files/upload" class="btn btn-primary">
                    Upload File
                </router-link>
            </div>

            <div v-else class="files-grid">
                <div v-for="file in files" :key="file.fileId" class="file-card">
                    <div class="file-preview">
                        <img src="/images/file-placeholder.png" :alt="file.name" class="preview-image" />
                        <div class="file-type-badge">
                            <span class="file-icon">
                                <i :class="getFileTypeIcon(file.metadata.fileType)"></i>
                            </span>
                            <span class="file-type">{{ file.metadata.fileType?.toUpperCase() }}</span>
                        </div>
                    </div>

                    <div class="file-content">
                        <div class="file-header">
                            <h3 class="file-name">{{ file.name }}</h3>
                            <div class="file-price">
                                <span class="amount">{{ file.amount.amount }} {{ file.amount.token.symbol }}</span>
                                <img :src="file.amount.token.icon" :alt="file.amount.token.symbol" class="token-icon" />
                            </div>
                        </div>

                        <p class="file-description">{{ file.description }}</p>

                        <div class="file-metadata">
                            <div v-for="(value, key) in file.metadata" :key="key" class="metadata-item">
                                <span class="metadata-key">{{ key }}:</span>
                                <span class="metadata-value">{{ value }}</span>
                            </div>
                        </div>

                        <div class="file-stats">
                            <div class="stat-item">
                                <span class="stat-icon">
                                    <i class="mdi mdi-calendar"></i>
                                </span>
                                <span class="stat-text">{{ formatDate(new Date(file.createdAt)) }}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-icon">
                                    <i class="mdi mdi-download"></i>
                                </span>
                                <span class="stat-text">{{ file.downloads }} downloads</span>
                            </div>
                        </div>

                        <div class="file-actions">
                            <RouterLink :to="`files/${file.fileId}`">
                                <button class="btn btn-secondary">
                                    View Details
                                </button>
                            </RouterLink>
                            <button @click="copyFileLink(file.fileId)" class="btn btn-outline">
                                Copy Link
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.files-container {
    max-width: 1200px;
    margin: 0 auto;
}

.files-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
}

.files-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.files-header p {
    color: var(--text-secondary);
    font-size: 1.1rem;
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    text-align: center;
    transition: all 0.2s ease;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

.btn-secondary:hover {
    background: var(--bg-tertiary);
}

.btn-outline {
    background: transparent;
    color: #667eea;
    border: 1px solid #667eea;
}

.btn-outline:hover {
    background: #667eea;
    color: white;
}

.empty-state {
    text-align: center;
    padding: 80px 20px;
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: 16px;
    opacity: 0.5;
    color: var(--text-secondary);
}

.empty-state h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.empty-state p {
    color: var(--text-secondary);
    margin-bottom: 24px;
}

.files-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 24px;
}

.file-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    overflow: hidden;
    transition: all 0.2s ease;
}

.file-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.file-preview {
    position: relative;
    height: 200px;
    overflow: hidden;
}

.preview-image {
    width: 100%;
    height: 100%;
    object-fit: contain;
}

.file-type-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 500;
}

.file-icon {
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.file-content {
    padding: 20px;
}

.file-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
}

.file-name {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.3;
    flex: 1;
    margin-right: 12px;
}

.file-price {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
}

.amount {
    font-size: 1rem;
    font-weight: 700;
    color: #10b981;
}

.token-icon {
    width: 20px;
    height: 20px;
    border-radius: 12px;
    object-fit: cover;
}

.file-description {
    color: var(--text-secondary);
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 16px;
}

.file-metadata {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
}

.metadata-item {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 8px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    font-size: 0.8rem;
}

.metadata-key {
    color: var(--text-secondary);
    font-weight: 500;
}

.metadata-value {
    color: var(--text-primary);
}

.file-stats {
    display: flex;
    gap: 16px;
    margin-bottom: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 6px;
}

.stat-icon {
    font-size: 0.8rem;
    color: var(--text-secondary);
}

.stat-text {
    color: var(--text-secondary);
    font-size: 0.8rem;
}

.file-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.file-actions .btn {
    flex: 1;
    min-width: 80px;
    font-size: 0.8rem;
    padding: 8px 12px;
}

@media (max-width: 768px) {
    .files-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
    }

    .files-grid {
        grid-template-columns: 1fr;
    }

    .file-header {
        flex-direction: column;
        gap: 8px;
        align-items: flex-start;
    }

    .file-actions {
        flex-direction: column;
    }

    .file-actions .btn {
        flex: none;
    }
}
</style>