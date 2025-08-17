<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Activity, GatedFile } from '../../../../types';
import SignatureMsg from '../../../../types/signature';
import { signMessage } from '@wagmi/core';
import { config } from '../../../../utils/wallet-config';
import { createSeiMoneySDK } from '@seimoney/sdk/src/sdk/sei-money-sdk';
const route = useRoute();
const router = useRouter();

const isLoading = ref(true);
const file = ref<GatedFile | null>(null);
const activities = ref<Activity[]>([]);
const isDownloading = ref(false);
const isDeleting = ref(false);
const sdk = createSeiMoneySDK({ apiUrl: "https://api.seimoney.link" });

const fileId = route.params.id as string;

const getFile = async () => {
    isLoading.value = true;
    try {
        file.value = await sdk.files.getFile(fileId);
        activities.value = await sdk.analytics.getActivitiesFor(fileId);
    } catch (error) {
        console.error('Error fetching file:', error);
    }
    isLoading.value = false;
};


const downloadFile = async () => {
    if (!file.value) return;

    isDownloading.value = true;
    try {
        const expiresAt = Date.now() + SignatureMsg.SIGNATURE_TTL;
        const message = `${SignatureMsg.DOWNLOAD_FILE}:${fileId}:${expiresAt}`;

        const signature = await signMessage(config, { message });

        const { url } = await sdk.files.downloadFile({ fileId, signature, expiresAt });

        console.log(url);


        window.open(url, '_blank');
    } catch (error) {
        console.error('Error downloading file:', error);
    }
    isDownloading.value = false;
};

const deleteFile = async () => {
    if (!file.value) return;

    isDeleting.value = false;
    try {
        const expiresAt = Date.now() + SignatureMsg.SIGNATURE_TTL;
        const message = `${SignatureMsg.DELETE_FILE}:${fileId}:${expiresAt}`;

        const signature = await signMessage(config, { message });

        const deleted = await sdk.files.deleteFile({ fileId, signature, expiresAt });

        if (!deleted) return;

        router.push('/dashboard/files');
    } catch (error) {
        console.error('Error deleting file:', error);

    } isDeleting.value = false;

};


const getActivityStatusColor = (status: string) => {
    switch (status) {
        case 'success': return '#10b981';
        case 'failed': return '#ef4444';
        default: return '#6b7280';
    }
};

const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
    }
};

const copyFileLink = () => {
    if (!file.value) return;
    const url = `${window.location.origin}/pay/file/${file.value.fileId}`;
    copyToClipboard(url);
};

const getFileTypeIcon = (fileType: string) => {
    switch (fileType?.toLowerCase()) {
        case 'pdf': return '📄';
        case 'video': return '🎥';
        case 'zip': return '📦';
        case 'image': return '🖼️';
        case 'audio': return '🎵';
        default: return '📁';
    }
};

onMounted(() => {
    getFile();
});
</script>

<template>
    <div class="file-detail-container">
        <!-- Back Navigation -->
        <div class="back-nav">
            <button @click="router.back()" class="back-btn">
                <span class="back-icon">←</span>
                Back to Files
            </button>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading file details...</p>
        </div>

        <div v-else-if="file" class="file-detail-content">
            <!-- File Header -->
            <div class="file-header">
                <div class="header-info">
                    <div class="file-title-section">
                        <div class="file-type-icon">
                            {{ getFileTypeIcon(file.metadata.fileType) }}
                        </div>
                        <div>
                            <h1>{{ file.name }}</h1>
                            <p class="file-description">{{ file.description }}</p>
                        </div>
                    </div>
                    <div class="file-amount">
                        <span class="amount">{{ file.amount.amount }} {{ file.amount.token.symbol }}</span>
                        <img :src="file.amount.token.icon" :alt="file.amount.token.symbol" class="token-icon" />
                    </div>
                </div>

                <div class="header-actions">
                    <button @click="copyFileLink" class="btn btn-primary">
                        📋 Copy Link
                    </button>
                    <button @click="downloadFile" :disabled="isDownloading" class="btn btn-outline">
                        <span v-if="isDownloading">Downloading...</span>
                        <span v-else>⬇️ Download</span>
                    </button>
                    <button @click="deleteFile" :disabled="isDeleting" class="btn btn-outline">
                        <span v-if="isDeleting">Deleting...</span>
                        <span v-else>🗑️ Delete</span>
                    </button>
                </div>
            </div>

            <!-- File Preview -->
            <div class="file-preview-section" v-if="file.previewURL">
                <div class="preview-card">
                    <h3>Preview</h3>
                    <div class="preview-container">
                        <img :src="file.previewURL" :alt="file.name" class="preview-image" />
                    </div>
                </div>
            </div>

            <!-- File Details Grid -->
            <div class="details-grid">
                <!-- Basic Information -->
                <div class="detail-card">
                    <h3>Basic Information</h3>
                    <div class="detail-rows">
                        <div class="detail-row">
                            <span class="label">File ID:</span>
                            <span class="value monospace">{{ file.fileId }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Downloads:</span>
                            <span class="value">{{ file.downloads }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Created:</span>
                            <span class="value">{{ formatDate(file.createdAt) }}</span>
                        </div>
                        <div class="detail-row" v-if="file.updatedAt">
                            <span class="label">Last Updated:</span>
                            <span class="value">{{ formatDate(file.updatedAt) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Payment Information -->
                <div class="detail-card">
                    <h3>Payment Details</h3>
                    <div class="detail-rows">
                        <div class="detail-row">
                            <span class="label">Amount:</span>
                            <span class="value payment-amount">
                                {{ file.amount.amount }} {{ file.amount.token.symbol }}
                            </span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Token Address:</span>
                            <div class="address-field">
                                <span class="value monospace">{{ formatAddress(file.amount.token.address) }}</span>
                                <button @click="copyToClipboard(file.amount.token.address)" class="copy-btn"
                                    title="Copy token address">
                                    📋
                                </button>
                            </div>
                        </div>
                        <div class="detail-row">
                            <span class="label">Owner:</span>
                            <div class="address-field">
                                <span class="value monospace">{{ formatAddress(file.owner) }}</span>
                                <button @click="copyToClipboard(file.owner)" class="copy-btn"
                                    title="Copy owner address">
                                    📋
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- File Information -->
                <div class="detail-card">
                    <h3>File Information</h3>
                    <div class="detail-rows">
                        <div class="detail-row">
                            <span class="label">Payment URL:</span>
                            <div class="url-field">
                                <span class="value url-text">{{ `https://seimoney.link/pay/file/${file.fileId}`
                                }}</span>
                                <button @click="copyFileLink" class="copy-btn" title="Copy payment link">
                                    📋
                                </button>
                            </div>
                        </div>
                        <div class="detail-row" v-if="file.previewURL">
                            <span class="label">Preview:</span>
                            <a :href="file.previewURL" target="_blank" class="value link">View Preview</a>
                        </div>
                    </div>
                </div>

                <!-- Metadata -->
                <div class="detail-card" v-if="Object.keys(file.metadata).length > 0">
                    <h3>Metadata</h3>
                    <div class="detail-rows">
                        <div class="detail-row" v-for="(value, key) in file.metadata" :key="key">
                            <span class="label">{{ key }}:</span>
                            <span class="value">{{ value }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Transaction History -->
            <div class="activity-section">
                <h3>Transaction History</h3>
                <div v-if="activities.length === 0" class="empty-activities">
                    <p>No transactions yet</p>
                </div>
                <div v-else class="activities-list">
                    <div v-for="activity in activities" :key="activity.id" class="activity-item"
                        :class="{ 'failed': activity.status === 'failed' }">
                        <div class="activity-info">
                            <div class="activity-header">
                                <div class="activity-type">
                                    <span class="type-icon">
                                        📄 Ref: {{ activity.transaction }}
                                    </span>
                                    <!-- <span class="type-text">{{ activity.type }}</span> -->
                                </div>
                                <div class="activity-status"
                                    :style="{ color: getActivityStatusColor(activity.status) }">
                                    <span class="status-dot"
                                        :style="{ background: getActivityStatusColor(activity.status) }"></span>
                                    {{ activity.status }}
                                </div>
                            </div>

                            <p class="activity-description">{{ activity.description }}</p>

                            <div class="activity-details">
                                <div class="activity-amount">
                                    {{ activity.amount.amount }} {{ activity.amount.token.symbol }}
                                </div>
                                <div class="activity-date" v-if="activity.createdAt">
                                    {{ formatDate(activity.createdAt) }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="error-state">
            <h2>File not found</h2>
            <p>The requested file could not be found.</p>
            <button @click="router.push('/dashboard/files')" class="btn btn-primary">
                Back to Files
            </button>
        </div>
    </div>
</template>

<style scoped>
.file-detail-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.back-nav {
    margin-bottom: 24px;
}

.back-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 8px 0;
    transition: color 0.2s ease;
}

.back-btn:hover {
    color: var(--text-primary);
}

.back-icon {
    font-size: 1.2rem;
}

.loading-state,
.error-state {
    text-align: center;
    padding: 80px 20px;
}

.loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border-color);
    border-top: 3px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px;
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.file-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
    padding: 24px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
}

.file-title-section {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 12px;
}

.file-type-icon {
    font-size: 3rem;
    opacity: 0.8;
}

.header-info h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.file-description {
    color: var(--text-secondary);
    font-size: 1rem;
    line-height: 1.5;
    margin-bottom: 16px;
}

.file-amount {
    display: flex;
    align-items: center;
    gap: 8px;
}

.amount {
    font-size: 1.5rem;
    font-weight: 700;
    color: #10b981;
}

.token-icon {
    width: 24px;
    height: 24px;
    border-radius: 12px;
    object-fit: cover;
}

.header-actions {
    display: flex;
    gap: 12px;
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    transition: all 0.2s ease;
    white-space: nowrap;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.btn-outline {
    background: transparent;
    color: #667eea;
    border: 1px solid #667eea;
}

.btn-outline:hover:not(:disabled) {
    background: #667eea;
    color: white;
}

.btn-small {
    padding: 8px 16px;
    font-size: 0.8rem;
}

.file-preview-section {
    margin-bottom: 32px;
}

.preview-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
}

.preview-card h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 8px;
}

.preview-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    background: var(--bg-primary);
    border-radius: 8px;
    overflow: hidden;
}

.preview-image {
    max-width: 100%;
    max-height: 400px;
    object-fit: contain;
}

.details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    margin-bottom: 32px;
}

.detail-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
}

.detail-card h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 8px;
}

.detail-rows {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.detail-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
}

.label {
    color: var(--text-secondary);
    font-size: 0.9rem;
    font-weight: 500;
    min-width: 120px;
}

.value {
    color: var(--text-primary);
    font-weight: 500;
    text-align: right;
    word-break: break-all;
}

.monospace {
    font-family: 'Courier New', monospace;
    background: var(--bg-primary);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.8rem;
}

.payment-amount {
    font-size: 1.1rem;
    font-weight: 600;
    color: #10b981;
}

.address-field,
.url-field {
    display: flex;
    align-items: center;
    gap: 8px;
}

.url-text {
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    word-break: break-all;
}

.link {
    color: #667eea;
    text-decoration: none;
}

.link:hover {
    text-decoration: underline;
}

.copy-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    opacity: 0.6;
    transition: opacity 0.2s ease;
}

.copy-btn:hover {
    opacity: 1;
}

.activity-section {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
}

.activity-section h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 20px;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 8px;
}

.empty-activities {
    text-align: center;
    padding: 40px 20px;
    color: var(--text-secondary);
}

.activities-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.activity-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding: 16px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-primary);
}

.activity-item.failed {
    border-color: #ef444430;
    background: #ef444405;
}

.activity-info {
    flex: 1;
}

.activity-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.activity-type {
    display: flex;
    align-items: center;
    gap: 6px;
}

.type-icon {
    font-size: 1rem;
}

.type-text {
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    color: var(--text-secondary);
}

.activity-status {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
}

.activity-description {
    color: var(--text-primary);
    margin-bottom: 12px;
    font-size: 0.9rem;
}

.activity-details {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
}

.activity-amount {
    font-weight: 600;
    color: var(--text-primary);
}

.activity-date {
    font-size: 0.8rem;
    color: var(--text-secondary);
}

.activity-transaction {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
}

.activity-transaction .label {
    font-size: 0.8rem;
    min-width: auto;
}

.activity-actions {
    margin-left: 16px;
}

@media (max-width: 768px) {
    .file-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
    }

    .file-title-section {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .header-actions {
        flex-direction: column;
    }

    .details-grid {
        grid-template-columns: 1fr;
    }

    .detail-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 4px;
    }

    .label {
        min-width: auto;
    }

    .value {
        text-align: left;
    }

    .activity-item {
        flex-direction: column;
        gap: 12px;
    }

    .activity-actions {
        margin-left: 0;
        align-self: stretch;
    }
}
</style>