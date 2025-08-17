<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import type { Contract } from '../../types';
import SignatureMsg from '../../types/signature';
import { config } from '../../utils/wallet-config';
import { signMessage } from '@wagmi/core';
import { useWalletStore } from '../../stores/wallet';
import { useWeb3Modal } from '@web3modal/wagmi/vue';
import { createSeiMoneySDK } from '@seimoney/sdk/src/sdk';

const route = useRoute();
const contractId = route.params.id as string;
const sdk = createSeiMoneySDK({ apiUrl: import.meta.env.VITE_API_URL });

const contract = ref<Contract | null>(null);
const isLoading = ref(true);
const isSigning = ref(false);
const isCompleted = ref(false);
const error = ref('');
const walletStore = useWalletStore();
const modal = useWeb3Modal();

onMounted(async () => {
    try {
        contract.value = await sdk.contracts.getContract(contractId);
    } catch (err) {
        error.value = 'Failed to load contract details';
    } finally {
        isLoading.value = false;
    }
});

const openDocument = () => {
    if (!contract.value) return;
    window.open(contract.value.documentURL, '_blank');
};


const handleSignContract = async () => {
    if (!contract.value) return;

    if (walletStore.address !== contract.value.recipientAddress) {
        error.value = 'You are not authorized to sign this contract';
        return;
    }

    isSigning.value = true;
    error.value = '';

    try {
        const expiresAt = Date.now() + SignatureMsg.SIGNATURE_TTL;
        const message = `${SignatureMsg.SIGN_CONTRACT}:${contract.value.contractId}:${expiresAt}`;

        const signature = await signMessage(config, { message });

        const signed = await sdk.contracts.signContract({
            contractId: contract.value.contractId,
            signature,
            expiresAt
        });

        if (!signed) {
            error.value = 'Failed to sign contract. Please try again.';
            return;
        }

        isCompleted.value = true;
    } catch (err) {
        error.value = 'Failed to sign contract. Please try again.';
    } finally {
        isSigning.value = false;
    }
};

const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};
</script>

<template>
    <div class="contract-sign-container">
        <div class="contract-sign-card">
            <!-- Loading State -->
            <div v-if="isLoading" class="loading-state">
                <div class="loading-spinner"></div>
                <p>Loading contract details...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error && !contract" class="error-state">
                <div class="error-icon">❌</div>
                <h3>Contract Not Found</h3>
                <p>{{ error }}</p>
            </div>

            <!-- Success State -->
            <div v-else-if="isCompleted" class="success-state">
                <div class="success-icon">✅</div>
                <h3>Contract Signed Successfully!</h3>
                <p>Your employment contract has been digitally signed and is now active.</p>
                <div class="contract-summary">
                    <h4>{{ contract?.name }}</h4>
                    <p><strong>Company:</strong> {{ contract?.company }}</p>
                    <p><strong>Role:</strong> {{ contract?.role.title }}</p>
                    <p><strong>Salary:</strong> {{ contract?.payroll.amount.amount }} {{
                        contract?.payroll.amount.token.symbol }} / {{ contract?.payroll.frequency }}</p>
                    <p><strong>Signed:</strong> {{ formatDate(new Date(contract?.signed?.timestamp || 0)) }}</p>
                </div>
            </div>

            <!-- Contract Signing Form -->
            <div v-else-if="contract" class="contract-form">
                <div class="contract-header">
                    <div class="company-info">
                        <h2>{{ contract.name }}</h2>
                        <p class="company-name">{{ contract.company }}</p>
                    </div>
                    <div class="contract-status" v-if="contract.signed.status">
                        <span class="status-badge active">Signed</span>
                    </div>
                    <div class="contract-status" v-else>
                        <span class="status-badge pending">Pending Signature</span>
                    </div>
                </div>

                <div class="contract-content">
                    <div class="section">
                        <h3>Position Details</h3>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span class="label">Role:</span>
                                <span class="value">{{ contract.role.title }}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Company:</span>
                                <span class="value">{{ contract.company }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <button v-if="contract.documentURL" @click="openDocument" class="btn btn-outline">
                            📄 View Document
                        </button>
                    </div>

                    <div class="section">
                        <h3>Role Description</h3>
                        <p class="role-description">{{ contract.role.description }}</p>
                    </div>

                    <div class="section">
                        <h3>Payment</h3>
                        <div class="compensation-details">
                            <div class="salary-info">
                                <span class="salary-amount">{{ contract.payroll.amount.amount }} {{
                                    contract.payroll.amount.token.symbol }}</span>
                                <span class="salary-frequency">per {{ contract.payroll.frequency }}</span>
                            </div>
                            <div class="payment-details">
                                <div class="detail-item">
                                    <span class="label">Payment Token:</span>
                                    <span class="value">{{ contract.payroll.amount.token.name }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="label">Recipient Address:</span>
                                    <span class="value address">{{ formatAddress(contract.recipientAddress) }}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="label">Payment Frequency:</span>
                                    <span class="value">{{ contract.payroll.frequency }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div v-if="Object.keys(contract.metadata).length > 0" class="section">
                        <h3>Additional Terms</h3>
                        <div class="metadata-grid">
                            <div v-for="(value, key) in contract.metadata" :key="key" class="metadata-item">
                                <span class="metadata-key">{{key.replace(/([A-Z])/g, ' $1').replace(/^./, str =>
                                    str.toUpperCase())}}:</span>
                                <span class="metadata-value">{{ value }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <h3>Contract Terms</h3>
                        <div class="terms-content">
                            <p>By signing this contract, you agree to:</p>
                            <ul>
                                <li>Perform the duties outlined in the role description</li>
                                <li>Maintain confidentiality of company information</li>
                                <li>Receive automated salary payments via blockchain</li>
                                <li>Comply with company policies and procedures</li>
                                <li>Provide 30 days notice for contract termination</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div v-if="error" class="error-message">
                    {{ error }}
                </div>

                <div class="signing-actions">
                    <button class="btn btn-secondary" v-if="contract.signed.status">
                        <span>Already Signed</span>
                    </button>

                    <button @click="modal.open()" class="btn btn-primary" v-else-if="!walletStore.address">
                        <span>Connect Wallet</span>
                    </button>

                    <button @click="handleSignContract" class="btn btn-primary" :disabled="isSigning" v-else>
                        <span v-if="isSigning">Signing Contract...</span>
                        <span v-else>🖊️ Sign Contract</span>
                    </button>
                </div>

                <div class="signing-info">
                    <p>🔒 Secure digital signature powered by Sei Network</p>
                    <p>Your signature will be cryptographically verified and stored on-chain</p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.contract-sign-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
}

.contract-sign-card {
    background: var(--bg-primary);
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 800px;
    border: 1px solid var(--border-color);
    max-height: 90vh;
    overflow-y: auto;
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

.contract-summary {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
    text-align: left;
}

.contract-summary h4 {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
}

.contract-summary p {
    margin-bottom: 8px;
    font-size: 0.9rem;
}

.contract-summary p:last-child {
    margin-bottom: 0;
}

.contract-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
    padding-bottom: 20px;
    border-bottom: 2px solid var(--border-color);
}

.company-info h2 {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.company-name {
    font-size: 1.1rem;
    color: var(--text-secondary);
    font-weight: 500;
}

.status-badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-badge.pending {
    background: rgba(245, 158, 11, 0.1);
    color: #f59e0b;
    border: 1px solid rgba(245, 158, 11, 0.2);
}

.status-badge.active {
    background: rgba(34, 197, 94, 0.1);
    color: #22c55e;
    border: 1px solid rgba(34, 197, 94, 0.2);
}

.contract-content {
    margin-bottom: 32px;
}

.section {
    margin-bottom: 32px;
    padding-bottom: 24px;
    border-bottom: 1px solid var(--border-color);
}

.section:last-child {
    border-bottom: none;
    margin-bottom: 0;
}

.section h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 16px;
}

.detail-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
}

.detail-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.label {
    color: var(--text-secondary);
    font-size: 0.8rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.value {
    color: var(--text-primary);
    font-weight: 500;
    font-size: 0.95rem;
}

.value.address {
    font-family: 'Courier New', monospace;
    background: var(--bg-secondary);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.85rem;
}

.role-description {
    color: var(--text-secondary);
    line-height: 1.6;
    font-size: 0.95rem;
}

.compensation-details {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.salary-info {
    text-align: center;
    padding: 20px;
    background: var(--bg-secondary);
    border-radius: 12px;
    border: 1px solid var(--border-color);
}

.salary-amount {
    display: block;
    font-size: 2rem;
    font-weight: 700;
    color: #10b981;
    margin-bottom: 4px;
}

.salary-frequency {
    color: var(--text-secondary);
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.payment-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.metadata-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
}

.metadata-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.metadata-key {
    color: var(--text-secondary);
    font-size: 0.8rem;
    font-weight: 500;
    text-transform: capitalize;
}

.metadata-value {
    color: var(--text-primary);
    font-weight: 500;
    font-size: 0.95rem;
}

.terms-content {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 20px;
}

.terms-content p {
    color: var(--text-primary);
    font-weight: 500;
    margin-bottom: 12px;
}

.terms-content ul {
    color: var(--text-secondary);
    padding-left: 20px;
}

.terms-content li {
    margin-bottom: 8px;
    line-height: 1.5;
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

.signing-actions {
    margin-bottom: 24px;
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

.btn-outline:hover:not(:disabled) {
    background: #667eea;
    color: white;
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

.signing-info {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
}

.signing-info p {
    color: var(--text-secondary);
    font-size: 0.8rem;
    margin-bottom: 4px;
}

.signing-info p:last-child {
    margin-bottom: 0;
}

@media (max-width: 768px) {
    .contract-sign-card {
        padding: 24px;
        max-height: 95vh;
    }

    .contract-header {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;
    }

    .company-info h2 {
        font-size: 1.5rem;
    }

    .detail-grid,
    .metadata-grid {
        grid-template-columns: 1fr;
    }

    .salary-amount {
        font-size: 1.5rem;
    }

    .compensation-details {
        gap: 16px;
    }
}
</style>