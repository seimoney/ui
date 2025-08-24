<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import type { GatedFile } from '../../types';
import { useWalletStore } from '../../stores/wallet';
import { useWeb3Modal } from '@web3modal/wagmi/vue';
import { getWalletClient } from '@wagmi/core';
import { config } from '../../utils/wallet-config';
import { createSeiMoneySDK } from '@seimoney/sdk/src/sdk';


const route = useRoute();
const fileId = route.params.id as string;
const sdk = createSeiMoneySDK({ apiUrl: import.meta.env.VITE_API_URL });

const gatedFile = ref<GatedFile | null>(null);
const downloadRes = ref<{ url: string; transaction: string; } | null>(null);
const isLoading = ref(true);
const isSigning = ref(false);
const isCompleted = ref(false);
const error = ref('');
const modal = useWeb3Modal();

const walletStore = useWalletStore();

onMounted(async () => {
    try {
        gatedFile.value = await sdk.files.getFile(fileId);
    } catch (err) {
        error.value = 'Failed to load file details';
    } finally {
        isLoading.value = false;
    }
});

const downloadFile = () => {
    if (!downloadRes.value?.url) return;
    window.open(downloadRes.value.url, '_blank');
};

const handleSignToPay = async () => {
    if (!gatedFile.value) return;

    isSigning.value = true;
    error.value = '';

    try {
        const walletClient = await getWalletClient(config);

        downloadRes.value = await sdk.files.fulfillFile({ fileId }, walletClient as any);

        if (!downloadRes.value) return;

        isCompleted.value = true;
    } catch (err) {
        console.log(err);

        error.value = 'Payment failed. Please try again.';
    } finally {
        isSigning.value = false;
    }
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
</script>

<template>
    <div class="file-payment-container">
        <div class="file-payment-card">
            <!-- Loading State -->
            <div v-if="isLoading" class="loading-state">
                <div class="loading-spinner"></div>
                <p>Loading file details...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error && !gatedFile" class="error-state">
                <div class="error-icon">❌</div>
                <h3>File Not Found</h3>
                <p>{{ error }}</p>
            </div>

            <!-- Success State -->
            <div v-else-if="isCompleted && downloadRes" class="success-state">
                <div class="success-icon">✅</div>
                <h3>Payment Successful!</h3>
                <p>You now have access to this premium content.</p>
                <div class="file-access">
                    <div class="file-preview">
                        <img :src="gatedFile?.previewURL || '/images/file-placeholder.png'" :alt="gatedFile?.name" />
                    </div>
                    <div class="file-info">
                        <h4>{{ gatedFile?.name }}</h4>
                        <p>{{ gatedFile?.description }}</p>
                        <p>Ref: {{ downloadRes.transaction }}</p>
                        <p>Download expires in 24hours.</p>
                    </div>
                    <button @click="downloadFile" class="btn btn-primary">
                        📥 Download
                    </button>
                </div>
            </div>

            <!-- Payment Form -->
            <div v-else-if="gatedFile" class="file-payment-form">
                <div class="file-header">
                    <div class="file-preview-section">
                        <img :src="gatedFile.previewURL || '/images/file-placeholder-lock.png'" :alt="gatedFile.name"
                            class="file-preview-image" />
                        <div class="file-type-badge">
                            <span class="file-icon">{{ getFileTypeIcon(gatedFile.metadata.fileType) }}</span>
                            <span class="file-type">{{ gatedFile.metadata.fileType?.toUpperCase() }}</span>
                        </div>
                    </div>

                    <div class="file-info-section">
                        <h2>{{ gatedFile.name }}</h2>
                        <p class="file-description">{{ gatedFile.description }}</p>

                        <div class="file-price">
                            <span class="amount">{{ gatedFile.amount.amount }} {{ gatedFile.amount.token.symbol
                                }}</span>
                            <img :src="gatedFile.amount.token.icon" :alt="gatedFile.amount.token.symbol"
                                class="token-icon" />
                        </div>
                    </div>
                </div>

                <div class="file-details">
                    <div class="detail-section">
                        <h4>File Information</h4>
                        <div class="metadata-grid">
                            <div v-for="(value, key) in gatedFile.metadata" :key="key" class="metadata-item">
                                <span class="metadata-key">{{ key }}:</span>
                                <span class="metadata-value">{{ value }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h4>Payment Details</h4>
                        <div class="detail-item">
                            <span class="label">Price:</span>
                            <span class="value">{{ gatedFile.amount.amount }} {{ gatedFile.amount.token.symbol }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Token:</span>
                            <span class="value">{{ gatedFile.amount.token.name }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="label">Downloads:</span>
                            <span class="value">{{ gatedFile.downloads }} people have purchased this</span>
                        </div>
                    </div>
                </div>

                <div v-if="error" class="error-message">
                    {{ error }}
                </div>

                <div class="payment-actions">
                    <button @click="modal.open()" class="btn btn-primary" v-if="!walletStore.address">
                        <span>Connect Wallet</span>
                    </button>

                    <button @click="handleSignToPay" class="btn btn-primary" :disabled="isSigning" v-else>
                        <span v-if="isSigning">Processing Payment...</span>
                        <span v-else>Sign to Purchase & Download</span>
                    </button>
                </div>

                <div class="payment-info">
                    <p>🔒 Secure payment powered by Sei Network</p>
                    <p>Instant access after payment confirmation</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.file-payment-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
}

.file-payment-card {
    background: var(--bg-primary);
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 600px;
    border: 1px solid var(--border-color);
}

.loading-state,
.error-state,
.success-state {
    text-align: center;
    padding: 40px 20px;
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

.error-icon,
.success-icon {
    font-size: 3rem;
    margin-bottom: 16px;
}

.error-state h3,
.success-state h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.error-state p,
.success-state p {
    color: var(--text-secondary);
    margin-bottom: 16px;
}

.file-access {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
    text-align: left;
}

.file-access .file-preview {
    margin-bottom: 16px;
}

.file-access .file-preview img {
    width: 100%;
    max-width: 200px;
    height: 200px;
    object-fit: contain;
    border-radius: 8px;
    border: 1px solid var(--border-color);
}

.file-access .file-info h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.file-access .file-info p {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 16px;
}

.file-header {
    display: flex;
    gap: 24px;
    margin-bottom: 32px;
}

.file-preview-section {
    position: relative;
    flex-shrink: 0;
}

.file-preview-image {
    width: 150px;
    height: 150px;
    object-fit: contain;
    border-radius: 8px;
    border: 1px solid var(--border-color);
}

.file-type-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 6px;
    font-size: 0.7rem;
    font-weight: 500;
}

.file-icon {
    font-size: 0.9rem;
}

.file-info-section {
    flex: 1;
}

.file-info-section h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
    line-height: 1.3;
}

.file-description {
    color: var(--text-secondary);
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 16px;
}

.file-price {
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

.file-details {
    margin-bottom: 24px;
}

.detail-section {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 16px;
}

.detail-section:last-child {
    margin-bottom: 0;
}

.detail-section h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border-color);
}

.metadata-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
}

.metadata-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.metadata-key {
    color: var(--text-secondary);
    font-size: 0.8rem;
    text-transform: capitalize;
}

.metadata-value {
    color: var(--text-primary);
    font-weight: 500;
    font-size: 0.9rem;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.detail-item:last-child {
    margin-bottom: 0;
}

.label {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.value {
    color: var(--text-primary);
    font-weight: 500;
    font-size: 0.9rem;
}

.error-message {
    color: #ef4444;
    font-size: 0.9rem;
    text-align: center;
    padding: 12px;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 6px;
    border: 1px solid rgba(239, 68, 68, 0.2);
    margin-bottom: 24px;
}

.payment-actions {
    margin-bottom: 24px;
}

.payment-actions .or {
    margin: 20px 0;
    text-align: center;
    color: var(--text-primary);
}

.btn {
    width: 100%;
    padding: 16px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.2s ease;
}

.btn-outline {
    background: transparent;
    color: #667eea;
    border: 1px solid #667eea;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

.btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
}

.payment-info {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
}

.payment-info p {
    color: var(--text-secondary);
    font-size: 0.8rem;
    margin-bottom: 4px;
}

.payment-info p:last-child {
    margin-bottom: 0;
}

@media (max-width: 640px) {
    .file-payment-card {
        padding: 24px;
    }

    .file-header {
        flex-direction: column;
        gap: 16px;
    }

    .file-preview-image {
        width: 100%;
        height: 150px;
    }

    .file-info-section h2 {
        font-size: 1.25rem;
    }

    .amount {
        font-size: 1.25rem;
    }

    .token-icon {
        font-size: 1.25rem;
    }

    .metadata-grid {
        grid-template-columns: 1fr;
    }
}
</style>