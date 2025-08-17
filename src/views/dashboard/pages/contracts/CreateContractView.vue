<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { CreateContract } from '../../../../types';
import { tokens } from '../../../../utils/constants';
import { createSeiMoneySDK } from '@seimoney/sdk/src/sdk';

const router = useRouter();
const sdk = createSeiMoneySDK({ apiUrl: import.meta.env.VITE_API_URL });

const form = ref<CreateContract & { file: File | undefined; }>({
    name: '',
    role: {
        title: '',
        description: ''
    },
    recipientAddress: undefined,
    payroll: {
        frequency: 'monthly',
        amount: {
            amount: '',
            token: tokens[0]
        }
    },
    company: '',
    metadata: {},
    file: undefined,
    network: 'sei-testnet'
});

const isLoading = ref(false);
const errors = ref<Record<string, string>>({});
const dragOver = ref(false);
const isExtracting = ref(false);

const validateForm = () => {
    errors.value = {};

    if (!form.value.name.trim()) {
        errors.value.name = 'Contract name is required';
    }

    if (!form.value.role.title.trim()) {
        errors.value.roleTitle = 'Role title is required';
    }

    if (!form.value.role.description.trim()) {
        errors.value.roleDescription = 'Role description is required';
    }

    if (!form.value.recipientAddress?.trim()) {
        errors.value.recipientAddress = 'Recipient address is required';
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(form.value.recipientAddress)) {
        errors.value.recipientAddress = 'Invalid Ethereum address';
    }

    if (!form.value.payroll.amount.amount || parseFloat(form.value.payroll.amount.amount) <= 0) {
        errors.value.amount = 'Valid amount is required';
    }

    if (!form.value.company.trim()) {
        errors.value.company = 'Company name is required';
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

const handleFile = async (file: File) => {
    form.value.file = file;

    try {
        isExtracting.value = true;
        const extract = await sdk.contracts.extractContract(file);

        if (extract.name && !form.value.name) {
            form.value.name = extract.name;
        }

        if (extract.role.title && !form.value.role.title) {
            form.value.role.title = extract.role.title;
        }

        if (extract.role.description && !form.value.role.description) {
            form.value.role.description = extract.role.description;
        }

        if (extract.payroll.frequency && !form.value.payroll.frequency) {
            form.value.payroll.frequency = extract.payroll.frequency;
        }

        if (extract.recipientAddress && !form.value.recipientAddress) {
            form.value.recipientAddress = extract.recipientAddress;
        }

        if (extract.payroll.amount.amount && !form.value.payroll.amount.amount) {
            form.value.payroll.amount.amount = extract.payroll.amount.amount;
        }

        if (extract.metadata) {
            Object.keys(extract.metadata).forEach(key => {
                if (extract.metadata?.[key] && !form.value.metadata[key]) {
                    form.value.metadata[key] = extract.metadata[key];
                }
            });
        }

        if (extract.company && !form.value.company) {
            form.value.company = extract.company;
        }
    } catch (error) { } finally {
        isExtracting.value = false;
    }
};

const handleSubmit = async () => {
    if (!validateForm()) return;

    isLoading.value = true;

    try {
        const created = await sdk.contracts.createContract(form.value, form.value.file);

        if (!created) return;

        router.push('/dashboard/contracts');
    } catch (error) {
        console.error('Failed to create contract:', error);
    } finally {
        isLoading.value = false;
    }
};

const selectToken = (token: any) => {
    form.value.payroll.amount.token = token;
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
    <div class="create-contract-container">
        <div class="create-contract-header">
            <div>
                <h1>Create New Contract</h1>
                <p>Set up a new payroll contract with automated payments</p>
            </div>
            <button @click="router.go(-1)" class="btn btn-secondary">
                ← Back
            </button>
        </div>

        <form @submit.prevent="handleSubmit" class="contract-form">
            <div class="form-section">
                <h3>Upload Document (Optional)</h3>

                <div class="file-upload-area" :class="{ 'drag-over': dragOver, 'has-file': form.file }"
                    @dragover.prevent="dragOver = true" @dragleave.prevent="dragOver = false"
                    @drop.prevent="handleFileDrop">

                    <div v-if="!form.file" class="upload-placeholder">
                        <div class="upload-icon">📁</div>
                        <h4>Drop your file here or click to browse</h4>
                        <p>Supports PDFs only up to 10MB</p>
                        <input type="file" @change="handleFileSelect" class="file-input" accept="application/pdf" />
                    </div>

                    <div v-else class="file-preview">
                        <div class="preview-content">
                            <img src="/images/file-placeholder.png" alt="Preview" class="preview-image" />
                            <div class="file-info">
                                <h4>{{ form.file.name }}</h4>
                                <p>{{ formatFileSize(form.file.size) }}</p>
                                <p>{{ form.file.type || 'Unknown type' }}</p>
                                <p v-if="isExtracting">AI: Extracting form fields from document.</p>
                            </div>
                        </div>
                        <button type="button" @click="form.file = undefined;" class="remove-file">
                            ✕
                        </button>
                    </div>
                </div>

                <span v-if="errors.file" class="error-message">{{ errors.file }}</span>
            </div>

            <div class="form-section">
                <h3>Contract Details</h3>

                <div class="form-group">
                    <label for="name">Contract Name *</label>
                    <input id="name" v-model="form.name" type="text" placeholder="e.g., Senior Developer Contract"
                        :class="{ error: errors.name }" />
                    <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
                </div>

                <div class="form-group">
                    <label for="company">Company *</label>
                    <input id="company" v-model="form.company" type="text" placeholder="e.g., TechCorp Inc."
                        :class="{ error: errors.company }" />
                    <span v-if="errors.company" class="error-message">{{ errors.company }}</span>
                </div>
            </div>

            <div class="form-section">
                <h3>Role Information</h3>

                <div class="form-group">
                    <label for="roleTitle">Role Title *</label>
                    <input id="roleTitle" v-model="form.role.title" type="text"
                        placeholder="e.g., Senior Full Stack Developer" :class="{ error: errors.roleTitle }" />
                    <span v-if="errors.roleTitle" class="error-message">{{ errors.roleTitle }}</span>
                </div>

                <div class="form-group">
                    <label for="roleDescription">Role Description *</label>
                    <textarea id="roleDescription" v-model="form.role.description"
                        placeholder="Describe the role responsibilities and requirements..." rows="4"
                        :class="{ error: errors.roleDescription }"></textarea>
                    <span v-if="errors.roleDescription" class="error-message">{{ errors.roleDescription }}</span>
                </div>
            </div>

            <div class="form-section">
                <h3>Payment Details</h3>

                <div class="form-group">
                    <label for="recipientAddress">Recipient Address *</label>
                    <input id="recipientAddress" v-model="form.recipientAddress" type="text" placeholder="0x..."
                        :class="{ error: errors.recipientAddress }" />
                    <span v-if="errors.recipientAddress" class="error-message">{{ errors.recipientAddress }}</span>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="amount">Amount *</label>
                        <input id="amount" v-model="form.payroll.amount.amount" type="number" step="0.01" min="0"
                            placeholder="0.00" :class="{ error: errors.amount }" />
                        <span v-if="errors.amount" class="error-message">{{ errors.amount }}</span>
                    </div>

                    <div class="form-group">
                        <label>Token</label>
                        <div class="token-selector">
                            <div class="selected-token">
                                <img :src="form.payroll.amount.token.icon" :alt="form.payroll.amount.token.symbol"
                                    class="token-icon" />
                                <span class="token-symbol">{{ form.payroll.amount.token.symbol }}</span>
                            </div>
                            <div class="token-dropdown">
                                <div v-for="token in tokens" :key="token.address" @click="selectToken(token)"
                                    class="token-option"
                                    :class="{ active: token.address === form.payroll.amount.token.address }">
                                    <img :src="token.icon" :alt="token.symbol" class="token-icon" />
                                    <span class="token-info">
                                        <span class="token-symbol">{{ token.symbol }}</span>
                                        <span class="token-name">{{ token.name }}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="frequency">Frequency</label>
                        <select id="frequency" v-model="form.payroll.frequency">
                            <option value="hourly">Hourly</option>
                            <option value="12-hours">12 Hours</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
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
                            @click="form.network = 'sei-testnet'">
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
                    <span v-if="isLoading">Creating Contract...</span>
                    <span v-else>Create Contract</span>
                </button>
            </div>
        </form>
    </div>
</template>

<style scoped>
.create-contract-container {
    max-width: 800px;
    margin: 0 auto;
}

.create-contract-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
}

.create-contract-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.create-contract-header p {
    color: var(--text-secondary);
    font-size: 1.1rem;
}

.contract-form {
    display: flex;
    flex-direction: column;
    gap: 32px;
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
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border-color);
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
.form-group textarea,
.form-group select {
    padding: 12px 16px;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 1rem;
    transition: all 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
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
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
}

.token-selector {
    position: relative;
}

.selected-token {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
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

@media (max-width: 768px) {
    .create-contract-header {
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
}
</style>