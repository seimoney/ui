<script setup lang="ts">
import { onMounted, ref } from 'vue';
import type { Contract } from '../../../../types';
import ApiService from '../../../../api/api-service';
import { RouterLink } from 'vue-router';

const isLoading = ref(true);
const contracts = ref<Contract[]>([]);

const getContracts = async () => {
    isLoading.value = true;
    contracts.value = await ApiService.getContracts();
    isLoading.value = false;
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'signed': return '#10b981';
        case 'not_signed': return '#f59e0b';
        case 'completed': return '#6b7280';
        default: return '#6b7280';
    }
};

const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const copyToClipboard = async (text: string) => {
    try {
        await navigator.clipboard.writeText(text);
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
    }
};

onMounted(() => {
    getContracts();
});
</script>

<template>
    <div class="contracts-container">
        <div class="contracts-header">
            <div>
                <h1>Payrolls</h1>
                <p>Manage your payroll contracts and agreements</p>
            </div>
            <router-link to="/dashboard/contracts/create" class="btn btn-primary">
                + Create Contract
            </router-link>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading your contracts...</p>
        </div>

        <div class="contracts-content" v-else>
            <div v-if="contracts.length === 0" class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>No contracts yet</h3>
                <p>Create your first payroll contract to get started</p>
                <router-link to="/dashboard/contracts/create" class="btn btn-primary">
                    Create Contract
                </router-link>
            </div>

            <div v-else class="contracts-grid">
                <div v-for="contract in contracts" :key="contract.contractId" class="contract-card">
                    <div class="contract-header">
                        <div class="contract-info">
                            <h3>{{ contract.name }}</h3>
                            <p class="contract-company">{{ contract.company }}</p>
                        </div>
                        <div class="contract-status"
                            :style="{ color: getStatusColor(contract.signed.status ? 'signed' : 'not_signed') }">
                            <span class="status-dot"
                                :style="{ background: getStatusColor(contract.signed.status ? 'signed' : 'not_signed') }"></span>
                            {{ contract.signed.status ? 'Signed' : 'Not Signed' }}
                        </div>
                    </div>

                    <div class="contract-details">
                        <div class="detail-item">
                            <span class="detail-label">Role:</span>
                            <span class="detail-value">{{ contract.role.title }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Contract address:</span>
                            <span class="detail-value address">{{ formatAddress(contract.address) }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Recipient:</span>
                            <span class="detail-value address">{{ formatAddress(contract.recipientAddress) }}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Payment:</span>
                            <span class="detail-value">
                                {{ contract.payroll.amount.amount }} {{ contract.payroll.amount.token.symbol }} / {{
                                    contract.payroll.frequency }}
                            </span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Created:</span>
                            <span class="detail-value">{{ formatDate(new Date(contract.createdAt)) }}</span>
                        </div>
                    </div>

                    <div class="contract-description">
                        <p>{{ contract.role.description }}</p>
                    </div>

                    <div class="contract-actions">
                        <RouterLink :to="`contracts/${contract.contractId}`">
                            <button class="btn btn-secondary">View Details</button>
                        </RouterLink>
                        <button @click="copyToClipboard(`http://seimoney.link/contract/sign/${contract.contractId}`)"
                            v-if="!contract.signed.status" class="btn btn-outline">
                            Share for Signature
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.contracts-container {
    max-width: 1200px;
    margin: 0 auto;
}

.contracts-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
}

.contracts-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.contracts-header p {
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

.contracts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 24px;
}

.contract-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
    transition: all 0.2s ease;
}

.contract-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.contract-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20px;
}

.contract-info h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
}

.contract-company {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.contract-status {
    display: flex;
    align-items: center;
    gap: 6px;
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

.contract-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
}

.detail-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.detail-label {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.detail-value {
    color: var(--text-primary);
    font-weight: 500;
    font-size: 0.9rem;
}

.detail-value.address {
    font-family: 'Courier New', monospace;
    background: var(--bg-primary);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.8rem;
}

.contract-description {
    margin-bottom: 20px;
    padding: 12px;
    background: var(--bg-primary);
    border-radius: 8px;
    border: 1px solid var(--border-color);
}

.contract-description p {
    color: var(--text-secondary);
    font-size: 0.9rem;
    line-height: 1.5;
}

.contract-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.contract-actions .btn {
    flex: 1;
    min-width: 120px;
    font-size: 0.9rem;
    padding: 10px 16px;
}

@media (max-width: 768px) {
    .contracts-header {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
    }

    .contracts-grid {
        grid-template-columns: 1fr;
    }

    .contract-actions {
        flex-direction: column;
    }

    .contract-actions .btn {
        flex: none;
    }
}
</style>