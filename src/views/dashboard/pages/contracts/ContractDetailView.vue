<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Contract, Activity, ERC20Amount, Token } from '../../../../types';
import { TokenContract } from '../../../../smart_contract/erc20';
import { formatUnits, parseUnits } from 'viem';
import { tokens } from '../../../../utils/constants';
import { createSeiMoneySDK } from '@seimoney/sdk/src/sdk';

const route = useRoute();
const router = useRouter();
const sdk = createSeiMoneySDK({ apiUrl: import.meta.env.VITE_API_URL });

const isLoading = ref(true);
const contract = ref<Contract | null>(null);
const activities = ref<Activity[]>([]);
const isRetryingPayment = ref(false);
const balance = ref('0');
const contractId = route.params.id as string;

const getBalance = async () => {
    if (!contract.value) return;
    const balanceWei = await TokenContract.getTokenBalance(contract.value.payroll.amount.token.address, contract.value.address);
    balance.value = formatUnits(balanceWei, contract.value.payroll.amount.token.decimals);
};

const isDepositing = ref(false);

const depositForm = ref<ERC20Amount>({
    amount: '',
    token: tokens[0]
});

const depositToAccount = async () => {
    if (!contract.value || !depositForm.value.amount || parseFloat(depositForm.value.amount) <= 0) return;

    isDepositing.value = true;

    try {
        const txHash = await TokenContract.transfer(
            depositForm.value.token.address,
            contract.value.address,
            parseUnits(depositForm.value.amount.toString(), depositForm.value.token.decimals)
        );
        if (!txHash) return;

        depositForm.value.amount = '';

        getBalance();

    } catch (error) {
        console.error('Failed to deposit:', error);
    } finally {
        isDepositing.value = false;
    }
};

const getContract = async () => {
    isLoading.value = true;
    try {
        contract.value = await sdk.contracts.getContract(contractId);
        activities.value = await sdk.analytics.getActivitiesFor(contractId);
        getBalance();
    } catch (error) {
        console.error('Error fetching contract:', error);
    }
    isLoading.value = false;
};

const selectToken = (token: Token) => {
    depositForm.value.token = token;
};

const retryPayment = async (activityId: string) => {
    isRetryingPayment.value = true;
    try {
        await sdk.contracts.fulfillContractTransaction(activityId);
        await getContract();
    } catch (error) {
        console.error('Error retrying payment:', error);
    }
    isRetryingPayment.value = false;
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'signed': return '#10b981';
        case 'not_signed': return '#f59e0b';
        case 'completed': return '#6b7280';
        default: return '#6b7280';
    }
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

const openDocument = () => {
    if (!contract.value) return;
    window.open(contract.value.documentURL, '_blank');
};

onMounted(() => {
    getContract();
});
</script>

<template>
    <div class="contract-detail-container">
        <!-- Back Navigation -->
        <div class="back-nav">
            <button @click="router.back()" class="back-btn">
                <span class="back-icon">←</span>
                Back to Contracts
            </button>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading contract details...</p>
        </div>

        <div v-else-if="contract" class="contract-detail-content">
            <!-- Contract Header -->
            <div class="contract-header">
                <div class="header-info">
                    <div class="token-info">
                        Available: {{ balance }} {{ contract.payroll.amount.token.symbol }}
                    </div>
                    <h1>{{ contract.name }}</h1>
                    <p class="company">{{ contract.company }}</p>
                    <div class="status-badge" :style="{
                        color: getStatusColor(contract.signed.status ? 'signed' : 'not_signed'),
                        background: `${getStatusColor(contract.signed.status ? 'signed' : 'not_signed')}15`,
                        border: `1px solid ${getStatusColor(contract.signed.status ? 'signed' : 'not_signed')}30`
                    }">
                        <span class="status-dot"
                            :style="{ background: getStatusColor(contract.signed.status ? 'signed' : 'not_signed') }"></span>
                        {{ contract.signed.status ? 'Signed' : 'Not Signed' }}
                    </div>
                </div>

                <div class="header-actions">
                    <button v-if="!contract.signed.status"
                        @click="copyToClipboard(`http://seimoney.link/contract/sign/${contract.contractId}`)"
                        class="btn btn-primary">
                        <span>📤 Share for Signature</span>
                    </button>

                    <button v-if="contract.documentURL" @click="openDocument" class="btn btn-outline">
                        📄 View Document
                    </button>
                </div>
            </div>

            <!-- Deposit Section -->
            <div class="deposit-section">
                <div class="section-card">
                    <h3>Add Funds</h3>
                    <p class="section-description">Add funds to this contract. Or transfer {{ depositForm.token.symbol
                        }} to {{ contract.address }}</p>

                    <form @submit.prevent="depositToAccount" class="deposit-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Amount</label>
                                <input v-model="depositForm.amount" type="number" step="0.01" min="0" placeholder="0.00"
                                    required />
                            </div>
                            <div class="form-group">
                                <label>Token</label>
                                <div class="token-selector">
                                    <div class="selected-token">
                                        <img :src="tokens[0].icon" :alt="tokens[0].symbol" class="token-icon" />
                                        <span class="token-symbol">{{ tokens[0].symbol }}</span>
                                    </div>
                                    <div class="token-dropdown">
                                        <div v-for="token in tokens" :key="token.address" @click="selectToken(token)"
                                            class="token-option"
                                            :class="{ active: token.address === tokens[0].address }">
                                            <img :src="token.icon" :alt="token.symbol" class="token-icon" />
                                            <span class="token-info">
                                                <span class="token-symbol">{{ token.symbol }}</span>
                                                <span class="token-name">{{ token.name }}</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary" :disabled="isDepositing">
                                <span v-if="isDepositing">Depositing...</span>
                                <span v-else>Deposit</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>


            <!-- Contract Details Grid -->
            <div class="details-grid">
                <!-- Basic Information -->
                <div class="detail-card">
                    <h3>Basic Information</h3>
                    <div class="detail-rows">
                        <div class="detail-row">
                            <span class="label">Role:</span>
                            <span class="value">{{ contract.role.title }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Contract ID:</span>
                            <span class="value monospace">{{ contract.contractId }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Created:</span>
                            <span class="value">{{ formatDate(contract.createdAt) }}</span>
                        </div>
                        <div class="detail-row" v-if="contract.updatedAt">
                            <span class="label">Last Updated:</span>
                            <span class="value">{{ formatDate(contract.updatedAt) }}</span>
                        </div>
                    </div>
                </div>

                <!-- Blockchain Information -->
                <div class="detail-card">
                    <h3>Blockchain Details</h3>
                    <div class="detail-rows">
                        <div class="detail-row">
                            <span class="label">Contract Address:</span>
                            <div class="address-field">
                                <span class="value monospace">{{ formatAddress(contract.address) }}</span>
                                <button @click="copyToClipboard(contract.address)" class="copy-btn"
                                    title="Copy full address">
                                    📋
                                </button>
                            </div>
                        </div>
                        <div class="detail-row">
                            <span class="label">Recipient Address:</span>
                            <div class="address-field">
                                <span class="value monospace">{{ formatAddress(contract.recipientAddress) }}</span>
                                <button @click="copyToClipboard(contract.recipientAddress)" class="copy-btn"
                                    title="Copy full address">
                                    📋
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Payment Information -->
                <div class="detail-card">
                    <h3>Payment Terms</h3>
                    <div class="detail-rows">
                        <div class="detail-row">
                            <span class="label">Amount:</span>
                            <span class="value payment-amount">
                                {{ contract.payroll.amount.amount }} {{ contract.payroll.amount.token.symbol }}
                            </span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Frequency:</span>
                            <span class="value">{{ contract.payroll.frequency }}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Token Address:</span>
                            <div class="address-field">
                                <span class="value monospace">{{ formatAddress(contract.payroll.amount.token.address)
                                    }}</span>
                                <button @click="copyToClipboard(contract.payroll.amount.token.address)" class="copy-btn"
                                    title="Copy token address">
                                    📋
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Signature Status -->
                <div class="detail-card">
                    <h3>Signature Status</h3>
                    <div class="detail-rows">
                        <div class="detail-row">
                            <span class="label">Signed:</span>
                            <span class="value"
                                :class="{ 'signed': contract.signed.status, 'not-signed': !contract.signed.status }">
                                {{ contract.signed.status ? 'Yes' : 'No' }}
                            </span>
                        </div>
                        <div class="detail-row" v-if="contract.signed.status && contract.signed.timestamp">
                            <span class="label">Signed At:</span>
                            <span class="value">{{ formatDate(new Date(contract.signed.timestamp * 1000)) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Role Description -->
            <div class="description-card" v-if="contract.role.description">
                <h3>Role Description</h3>
                <p>{{ contract.role.description }}</p>
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
                                        {{ activity.type === 'contract' ? '📋' : activity.type === 'file' ? '📄' : '🔗'
                                        }}
                                    </span>
                                    <span class="type-text">{{ activity.type }}</span>
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

                            <div v-if="activity.transaction" class="activity-transaction">
                                <span class="label">Transaction:</span>
                                <div class="address-field">
                                    <span class="value monospace">{{ formatAddress(activity.transaction) }}</span>
                                    <button @click="copyToClipboard(activity.transaction)" class="copy-btn"
                                        title="Copy transaction hash">
                                        📋
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div v-if="activity.status === 'failed'" class="activity-actions">
                            <button @click="retryPayment(activity.id)" :disabled="isRetryingPayment"
                                class="btn btn-outline btn-small">
                                <span v-if="isRetryingPayment">Retrying...</span>
                                <span v-else>🔄 Retry Payment</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-else class="error-state">
            <h2>Contract not found</h2>
            <p>The requested contract could not be found.</p>
            <button @click="router.push('/dashboard/contracts')" class="btn btn-primary">
                Back to Contracts
            </button>
        </div>
    </div>
</template>

<style scoped>
.contract-detail-container {
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

.contract-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
    padding: 24px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
}

.header-info h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.company {
    color: var(--text-secondary);
    font-size: 1.1rem;
    margin-bottom: 12px;
}

.status-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
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

.signed {
    color: #10b981;
    font-weight: 600;
}

.not-signed {
    color: #ef4444;
    font-weight: 600;
}

.address-field {
    display: flex;
    align-items: center;
    gap: 8px;
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

.description-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 32px;
}

.description-card h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
}

.description-card p {
    color: var(--text-secondary);
    line-height: 1.6;
    font-size: 0.95rem;
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

.deposit-section {
    margin-bottom: 30px;
}

.section-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
}

.section-card h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.section-description {
    color: var(--text-secondary);
    margin-bottom: 24px;
}

.deposit-form {
    margin-top: 16px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 16px;
    align-items: end;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    font-weight: 500;
    color: var(--text-primary);
    font-size: 0.9rem;
}

.form-group input,
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
.form-group select:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
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

@media (max-width: 768px) {
    .contract-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
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