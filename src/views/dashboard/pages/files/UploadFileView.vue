<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { UploadFile } from '../../../../types';
import { tokens } from '../../../../utils/constants';
import { createSeiMoneySDK } from '@seimoney/sdk/src/sdk';


const router = useRouter();
const sdk = createSeiMoneySDK({ apiUrl: "https://api.seimoney.link" });


const form = ref<UploadFile & { file: File | null; }>({
    name: '',
    description: '',
    previewURL: null,
    amount: {
        amount: '',
        token: tokens[0]
    },
    metadata: {},
    file: null,
    network: 'sei-testnet'
});

const isLoading = ref(false);
const errors = ref<Record<string, string>>({});
const dragOver = ref(false);

const metadataKey = ref('');
const metadataValue = ref('');

const validateForm = () => {
    errors.value = {};

    if (!form.value.name.trim()) {
        errors.value.name = 'File name is required';
    }

    if (!form.value.description.trim()) {
        errors.value.description = 'Description is required';
    }

    if (!form.value.amount.amount || parseFloat(form.value.amount.amount) <= 0) {
        errors.value.amount = 'Valid amount is required';
    }

    if (!form.value.file) {
        errors.value.file = 'Please select a file to upload';
    }

    return Object.keys(errors.value).length === 0;
};

const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
        handleFile(target.files[0]);
    }
};

const handleFileDrop = (event: DragEvent) => {
    event.preventDefault();
    dragOver.value = false;

    if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
        handleFile(event.dataTransfer.files[0]);
    }
};

const handleFile = (file: File) => {
    form.value.file = file;

    if (!form.value.name) {
        form.value.name = file.name;
    }

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            form.value.previewURL = e.target?.result as string;
        };
        reader.readAsDataURL(file);
    } else {
        form.value.previewURL = '/images/file-placeholder.png';
    }

    form.value.metadata = {
        ...form.value.metadata,
        fileType: file.type,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`
    };
};

const handleSubmit = async () => {
    if (!validateForm()) return;

    isLoading.value = true;

    try {
        form.value.previewURL = null;

        const uploaded = await sdk.files.uploadFile(form.value, form.value.file as File);

        if (!uploaded) return;

        router.push('/dashboard/files');
    } catch (error) {
        console.error('Failed to upload file:', error);
    } finally {
        isLoading.value = false;
    }
};

const selectToken = (token: any) => {
    form.value.amount.token = token;
};

const addMetadata = () => {
    if (metadataKey.value.trim() && metadataValue.value.trim()) {
        form.value.metadata[metadataKey.value.trim()] = metadataValue.value.trim();
        metadataKey.value = '';
        metadataValue.value = '';
    }
};

const removeMetadata = (key: string) => {
    delete form.value.metadata[key];
};

const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
</script>

<template>
    <div class="upload-file-container">
        <div class="upload-file-header">
            <div>
                <h1>Upload Gated File</h1>
                <p>Upload premium content and set access pricing</p>
            </div>
            <button @click="router.go(-1)" class="btn btn-secondary">
                ← Back
            </button>
        </div>

        <form @submit.prevent="handleSubmit" class="upload-form">
            <div class="form-section">
                <h3>File Upload</h3>

                <div class="file-upload-area" :class="{ 'drag-over': dragOver, 'has-file': form.file }"
                    @dragover.prevent="dragOver = true" @dragleave.prevent="dragOver = false"
                    @drop.prevent="handleFileDrop">

                    <div v-if="!form.file" class="upload-placeholder">
                        <div class="upload-icon">📁</div>
                        <h4>Drop your file here or click to browse</h4>
                        <p>Supports all file types up to 10MB</p>
                        <input type="file" @change="handleFileSelect" class="file-input" accept="*/*" />
                    </div>

                    <div v-else class="file-preview">
                        <div class="preview-content">
                            <img v-if="form.previewURL" :src="form.previewURL" alt="Preview" class="preview-image" />
                            <div class="file-info">
                                <h4>{{ form.file.name }}</h4>
                                <p>{{ formatFileSize(form.file.size) }}</p>
                                <p>{{ form.file.type || 'Unknown type' }}</p>
                            </div>
                        </div>
                        <button type="button" @click="form.file = null; form.previewURL = ''" class="remove-file">
                            ✕
                        </button>
                    </div>
                </div>

                <span v-if="errors.file" class="error-message">{{ errors.file }}</span>
            </div>

            <div class="form-section">
                <h3>File Details</h3>

                <div class="form-group">
                    <label for="name">File Name *</label>
                    <input id="name" v-model="form.name" type="text" placeholder="e.g., Advanced Web3 Guide"
                        :class="{ error: errors.name }" />
                    <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
                </div>

                <div class="form-group">
                    <label for="description">Description *</label>
                    <textarea id="description" v-model="form.description" placeholder="Describe what buyers will get..."
                        rows="4" :class="{ error: errors.description }"></textarea>
                    <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
                </div>
            </div>

            <div class="form-section">
                <h3>Pricing</h3>

                <div class="form-row">
                    <div class="form-group">
                        <label for="amount">Price *</label>
                        <input id="amount" v-model="form.amount.amount" type="number" step="0.01" min="0"
                            placeholder="0.00" :class="{ error: errors.amount }" />
                        <span v-if="errors.amount" class="error-message">{{ errors.amount }}</span>
                    </div>

                    <div class="form-group">
                        <label>Token</label>
                        <div class="token-selector">
                            <div class="selected-token">
                                <img :src="form.amount.token.icon" :alt="form.amount.token.symbol" class="token-icon" />
                                <span class="token-symbol">{{ form.amount.token.symbol }}</span>
                            </div>
                            <div class="token-dropdown">
                                <div v-for="token in tokens" :key="token.address" @click="selectToken(token)"
                                    class="token-option"
                                    :class="{ active: token.address === form.amount.token.address }">
                                    <img :src="token.icon" :alt="token.symbol" class="token-icon" />
                                    <span class="token-info">
                                        <span class="token-symbol">{{ token.symbol }}</span>
                                        <span class="token-name">{{ token.name }}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h3>Metadata</h3>
                <p class="section-description">Add additional information about your file</p>

                <div class="metadata-input">
                    <div class="form-row">
                        <div class="form-group">
                            <input v-model="metadataKey" type="text" placeholder="Key (e.g., category)" />
                        </div>
                        <div class="form-group">
                            <input v-model="metadataValue" type="text" placeholder="Value (e.g., education)" />
                        </div>
                        <button type="button" @click="addMetadata" class="btn btn-outline">
                            Add
                        </button>
                    </div>
                </div>

                <div v-if="Object.keys(form.metadata).length > 0" class="metadata-list">
                    <div v-for="(value, key) in form.metadata" :key="key" class="metadata-item">
                        <span class="metadata-key">{{ key }}:</span>
                        <span class="metadata-value">{{ value }}</span>
                        <button type="button" @click="removeMetadata(key)" class="remove-btn">
                            ✕
                        </button>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h3>Network</h3>

                <div class="type-selector">
                    <div class="selected-type">
                        <span class="type-name">{{ form.network }}</span>
                    </div>
                    <div class="type-dropdown">
                        <div class="type-option" :class="{ active: form.network == 'sei-testnet' }"
                            @click=" form.network = 'sei-testnet'">
                            <span class="type-info">
                                <span class="type-symbol">Sei Testnet</span>
                                <span class="type-name">Testnet.</span>
                            </span>
                        </div>
                        <div class="type-option" :class="{ active: form.network == 'sei' }"
                            @click="form.network = 'sei'">
                            <span class="type-info">
                                <span class="type-symbol">Sei</span>
                                <span class="type-name">Mainnet.</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-actions">
                <button type="button" @click="router.go(-1)" class="btn btn-secondary">
                    Cancel
                </button>
                <button type="submit" class="btn btn-primary" :disabled="isLoading">
                    <span v-if="isLoading">Uploading File...</span>
                    <span v-else>Upload & Gate File</span>
                </button>
            </div>
        </form>
    </div>
</template>

<style scoped>
.upload-file-container {
    max-width: 800px;
    margin: 0 auto;
}

.upload-file-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
}

.upload-file-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.upload-file-header p {
    color: var(--text-secondary);
    font-size: 1.1rem;
}

.upload-form {
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.type-selector {
    position: relative;
    margin-top: 20px;
}

.selected-type {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-primary);
    cursor: pointer;
    transition: all 0.2s ease;
}

.selected-type:hover {
    border-color: #667eea;
}

.type-symbol {
    font-weight: 600;
    color: var(--text-primary);
}

.type-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    z-index: 10;
    max-height: 200px;
    overflow-y: auto;
    display: none;
}

.type-selector:hover .type-dropdown {
    display: block;
}

.type-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.2s ease;
}

.type-option:hover {
    background: var(--bg-secondary);
}

.type-option.active {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
}

.type-info {
    display: flex;
    flex-direction: column;
}

.type-name {
    font-size: 0.8rem;
    color: var(--text-secondary);
}

.form-section {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
}

.form-section h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.section-description {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 20px;
}

.file-upload-area {
    border: 2px dashed var(--border-color);
    border-radius: 12px;
    padding: 40px 20px;
    text-align: center;
    transition: all 0.3s ease;
    position: relative;
    background: var(--bg-primary);
}

.file-upload-area.drag-over {
    border-color: #667eea;
    background: rgba(102, 126, 234, 0.05);
}

.file-upload-area.has-file {
    border-style: solid;
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.05);
}

.upload-placeholder {
    cursor: pointer;
}

.upload-icon {
    font-size: 3rem;
    margin-bottom: 16px;
    opacity: 0.6;
}

.upload-placeholder h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.upload-placeholder p {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.file-input {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
}

.file-preview {
    display: flex;
    align-items: center;
    gap: 20px;
    text-align: left;
}

.preview-content {
    display: flex;
    align-items: center;
    gap: 16px;
    flex: 1;
}

.preview-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid var(--border-color);
}

.file-info h4 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
}

.file-info p {
    color: var(--text-secondary);
    font-size: 0.8rem;
    margin-bottom: 2px;
}

.remove-file {
    background: #ef4444;
    color: white;
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s ease;
}

.remove-file:hover {
    background: #dc2626;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 20px;
}

.form-group:last-child {
    margin-bottom: 0;
}

.form-group label {
    font-weight: 500;
    color: var(--text-primary);
    font-size: 0.9rem;
}

.form-group input,
.form-group textarea {
    padding: 12px 16px;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 1rem;
    transition: all 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input.error,
.form-group textarea.error {
    border-color: #ef4444;
}

.form-group textarea {
    resize: vertical;
    min-height: 100px;
}

.error-message {
    color: #ef4444;
    font-size: 0.8rem;
    margin-top: 4px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 16px;
}

.token-selector {
    position: relative;
}

.selected-token {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-primary);
    cursor: pointer;
    transition: all 0.2s ease;
}

.selected-token:hover {
    border-color: #667eea;
}

.token-icon {
    width: 24px;
    height: 24px;
    border-radius: 12px;
    object-fit: cover;
}

.token-symbol {
    font-weight: 600;
    color: var(--text-primary);
}

.token-dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    z-index: 10;
    max-height: 200px;
    overflow-y: auto;
    display: none;
}

.token-selector:hover .token-dropdown {
    display: block;
}

.token-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.2s ease;
}

.token-option:hover {
    background: var(--bg-secondary);
}

.token-option.active {
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
}

.token-info {
    display: flex;
    flex-direction: column;
}

.token-name {
    font-size: 0.8rem;
    color: var(--text-secondary);
}

.metadata-input {
    margin-bottom: 20px;
}

.metadata-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.metadata-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
}

.metadata-key {
    font-weight: 500;
    color: var(--text-primary);
}

.metadata-value {
    flex: 1;
    color: var(--text-secondary);
}

.remove-btn {
    background: none;
    border: none;
    color: #ef4444;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: background 0.2s ease;
}

.remove-btn:hover {
    background: rgba(239, 68, 68, 0.1);
}

.form-actions {
    display: flex;
    gap: 16px;
    justify-content: flex-end;
    padding-top: 24px;
    border-top: 1px solid var(--border-color);
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 120px;
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
    padding: 8px 16px;
    font-size: 0.9rem;
}

.btn-outline:hover {
    background: #667eea;
    color: white;
}

@media (max-width: 768px) {
    .upload-file-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
    }

    .form-row {
        grid-template-columns: 1fr;
    }

    .form-actions {
        flex-direction: column;
    }

    .file-preview {
        flex-direction: column;
        text-align: center;
    }
}
</style>