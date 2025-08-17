<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { CreatePaymentLink } from '../../../../types';
import { tokens } from '../../../../utils/constants';
import { useWalletStore } from '../../../../stores/wallet';
import { parseUnits, type Hex } from 'viem';
import { createSeiMoneySDK } from '@seimoney/sdk/src/sdk';

const router = useRouter();
const walletStore = useWalletStore();
const sdk = createSeiMoneySDK({ apiUrl: import.meta.env.VITE_API_URL });

const form = ref<CreatePaymentLink & { recipient?: Recipient; }>({
    description: '',
    amount: {
        amount: '',
        token: tokens[0]
    },
    recipientAddress: undefined,
    attributes: {},
    oneTime: true,
    network: 'sei-testnet',
    recipient: undefined
});

const isLoading = ref(false);
const errors = ref<Record<string, string>>({});

const attributeKey = ref('');
const attributeValue = ref('');

interface Recipient {
    name: string;
    address?: Hex;
    icon: string;
    custom: boolean;
}

const recipients = ref<Recipient[]>([]);

const selectRecipient = (recipient: Recipient) => {
    form.value.recipient = recipient;

    if (recipient.custom) {
        form.value.recipientAddress = undefined;
        return;
    }

    form.value.recipientAddress = recipient.address;
};

const validateForm = () => {
    errors.value = {};

    if (!form.value.description.trim()) {
        errors.value.description = 'Description is required';
    }

    if (!form.value.amount.amount || parseFloat(form.value.amount.amount) <= 0) {
        errors.value.amount = 'Valid amount is required';
    }

    if (!form.value.recipientAddress?.trim()) {
        errors.value.recipientAddress = 'Recipient address is required';
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(form.value.recipientAddress)) {
        errors.value.recipientAddress = 'Invalid Ethereum address';
    }

    return Object.keys(errors.value).length === 0;
};

const handleSubmit = async () => {
    if (!validateForm()) return;

    isLoading.value = true;

    try {
        const createdLink = await sdk.paymentLinks.createPaymentLink({
            ...form.value,
            amount: {
                ...form.value.amount,
                amount: parseUnits(
                    form.value.amount.amount,
                    form.value.amount.token.decimals
                ).toString(),
            },
        });

        if (!createdLink) {
            return;
        }

        router.push('/dashboard/links');
    } catch (error) {
        console.error('Failed to create payment link:', error);
    } finally {
        isLoading.value = false;
    }
};

const selectToken = (token: any) => {
    form.value.amount.token = token;
};

const addAttribute = () => {
    if (attributeKey.value.trim() && attributeValue.value.trim()) {
        form.value.attributes[attributeKey.value.trim()] = attributeValue.value.trim();
        attributeKey.value = '';
        attributeValue.value = '';
    }
};

const removeAttribute = (key: string) => {
    delete form.value.attributes[key];
};

onMounted(() => {
    if (walletStore.address) {
        recipients.value.push({
            name: 'You',
            address: walletStore.address,
            icon: '/images/colors.png',
            custom: false
        });
    }

    if (walletStore.savingsAccount) {
        recipients.value.push({
            name: 'Smart Account',
            address: walletStore.savingsAccount,
            icon: '/images/colors.png',
            custom: false
        });
    }

    recipients.value.push({
        name: 'Other',
        address: undefined,
        icon: '/images/colors.png',
        custom: true
    });

    form.value.recipient = recipients.value[0];
    form.value.recipientAddress = recipients.value[0].address;
});
</script>

<template>
    <div class="create-link-container">
        <div class="create-link-header">
            <div>
                <h1>Create Payment Link</h1>
                <p>Generate a shareable payment link for your product or service</p>
            </div>
            <button @click="router.go(-1)" class="btn btn-secondary">
                ← Back
            </button>
        </div>

        <form @submit.prevent="handleSubmit" class="link-form">
            <div class="form-section">
                <h3>Payment Details</h3>

                <div class="form-group">
                    <label for="description">Description *</label>
                    <input id="description" v-model="form.description" type="text"
                        placeholder="e.g., Web3 Development Course" :class="{ error: errors.description }" />
                    <span v-if="errors.description" class="error-message">{{ errors.description }}</span>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="amount">Amount *</label>
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

                <div class="form-group">
                    <label for="recipientAddress">Recipient *</label>

                    <div class="form-group">
                        <div class="token-selector">
                            <div class="selected-token" v-if="form.recipient">
                                <img :src="form.recipient.icon" class="token-icon" />
                                <span class="token-symbol">{{ form.recipient.name }}</span>
                            </div>
                            <div class="token-dropdown">
                                <div v-for="recipient in recipients" :key="recipient.address"
                                    @click="selectRecipient(recipient)" class="token-option"
                                    :class="{ active: recipient.address === form.recipientAddress }">
                                    <img :src="recipient.icon" :alt="recipient.name" class="token-icon" />
                                    <span class="token-info">
                                        <span class="token-symbol">{{ recipient.name }}</span>
                                        <span class="token-name">{{ recipient.address }}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <input id="recipientAddress" v-if="form.recipient?.custom" v-model="form.recipientAddress"
                        type="text" placeholder="0x..." :class="{ error: errors.recipientAddress }" />

                    <span v-if="errors.recipientAddress" class="error-message">{{ errors.recipientAddress }}</span>
                </div>
            </div>

            <div class="form-section">
                <h3>Additional Attributes</h3>
                <p class="section-description">Add custom attributes to your payment link</p>

                <div class="attributes-input">
                    <div class="form-row">
                        <div class="form-group">
                            <input v-model="attributeKey" type="text" placeholder="Attribute key (e.g., category)" />
                        </div>
                        <div class="form-group">
                            <input v-model="attributeValue" type="text"
                                placeholder="Attribute value (e.g., education)" />
                        </div>
                        <button type="button" @click="addAttribute" class="btn btn-outline">
                            Add
                        </button>
                    </div>
                </div>

                <div v-if="Object.keys(form.attributes).length > 0" class="attributes-list">
                    <div v-for="(value, key) in form.attributes" :key="key" class="attribute-item">
                        <span class="attribute-key">{{ key }}:</span>
                        <span class="attribute-value">{{ value }}</span>
                        <button type="button" @click="removeAttribute(key)" class="remove-btn">
                            ✕
                        </button>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h3>Preview</h3>
                <div class="link-preview">
                    <div class="preview-card">
                        <h4>{{ form.description || 'Payment Link' }}</h4>
                        <div class="preview-amount">
                            <span class="amount">{{ form.amount.amount || '0' }} {{ form.amount.token.symbol }}</span>
                            <img :src="form.amount.token.icon" :alt="form.amount.token.symbol" class="token-icon" />
                        </div>
                        <div class="preview-recipient">
                            To: {{ form.recipientAddress || '0x...' }}
                        </div>
                        <div v-if="Object.keys(form.attributes).length > 0" class="preview-attributes">
                            <div v-for="(value, key) in form.attributes" :key="key" class="preview-attribute">
                                {{ key }}: {{ value }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="form-section">
                <h3>Type</h3>

                <div class="type-selector">
                    <div class="selected-type">
                        <span class="type-name">{{ form.oneTime ? 'One Time' : 'Reusable' }}</span>
                    </div>
                    <div class="type-dropdown">
                        <div class="type-option" :class="{ active: form.oneTime }" @click="form.oneTime = true">
                            <span class="type-info">
                                <span class="type-symbol">One Time</span>
                                <span class="type-name">Payment link is valid for a single transaction only.</span>
                            </span>
                        </div>
                        <div class="type-option" :class="{ active: !form.oneTime }" @click="form.oneTime = false">
                            <span class="type-info">
                                <span class="type-symbol">Reusable</span>
                                <span class="type-name">Payment link can be used multiple times, by one or more
                                    payers.</span>
                            </span>
                        </div>
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
                    <span v-if="isLoading">Creating Link...</span>
                    <span v-else>Create Payment Link</span>
                </button>
            </div>
        </form>
    </div>
</template>

<style scoped>
.create-link-container {
    max-width: 800px;
    margin: 0 auto;
}

.create-link-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
}

.create-link-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.create-link-header p {
    color: var(--text-secondary);
    font-size: 1.1rem;
}

.link-form {
    display: flex;
    flex-direction: column;
    gap: 32px;
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

.form-group input {
    padding: 12px 16px;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 1rem;
    transition: all 0.2s ease;
}

.form-group input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input.error {
    border-color: #ef4444;
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

.attributes-input {
    margin-bottom: 20px;
}

.attributes-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.attribute-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
}

.attribute-key {
    font-weight: 500;
    color: var(--text-primary);
}

.attribute-value {
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

.link-preview {
    margin-top: 16px;
}

.preview-card {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 20px;
}

.preview-card h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
}

.preview-amount {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.amount {
    font-size: 1.25rem;
    font-weight: 700;
    color: #10b981;
}

.preview-recipient {
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-bottom: 12px;
}

.preview-attributes {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
}

.preview-attribute {
    padding: 4px 8px;
    background: var(--bg-secondary);
    border-radius: 4px;
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
    .create-link-header {
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