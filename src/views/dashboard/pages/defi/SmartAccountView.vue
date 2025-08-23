<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { availableStrategies, findStrategyByAddress, tokens } from '../../../../utils/constants';
import { useWalletStore } from '../../../../stores/wallet';
import { SavingsAccountContract, SeiMoneyContract } from '../../../../smart_contract';
import { SavingsAccount, Strategy, ERC20Amount, Token } from '../../../../types';
import { formatUnits, parseUnits } from 'viem';
import { TokenContract } from '../../../../smart_contract/erc20';

const walletStore = useWalletStore();

const savingsAccount = ref<SavingsAccount | null>(null);
const isLoading = ref(true);
const isDepositing = ref(false);
const isWithdrawing = ref(false);
const isCreatingAccount = ref(false);

const depositForm = ref<ERC20Amount>({
    amount: '',
    token: tokens[0]
});

const withdrawForm = ref<ERC20Amount>({
    amount: '',
    token: tokens[0]
});

const selectToken = (token: Token) => {
    depositForm.value.token = token;
};

const selectTokenWithdraw = (token: Token) => {
    withdrawForm.value.token = token;
};

const getSavingsAccount = async () => {
    try {
        isLoading.value = true;

        if (!walletStore.savingsAccount) return;
        SavingsAccountContract.setAddress(walletStore.savingsAccount);

        const activeStrategy = await SavingsAccountContract.getStrategy(tokens[0].address);
        const balanceWei = await SavingsAccountContract.balanceOf(tokens[0].address);

        savingsAccount.value = {
            address: walletStore.savingsAccount,
            activeStrategy: activeStrategy ? findStrategyByAddress(activeStrategy) : undefined,
            balance: {
                amount: formatUnits(balanceWei, tokens[0].decimals),
                token: tokens[0]
            },
            autoCompoundEnabled: true,
        };
    } catch (error) {
        console.error('Failed to load smart account:', error);
    }
    finally {
        isLoading.value = false;
    }
};

onMounted(async () => {
    if (!walletStore.address) return;
    if (!walletStore.savingsAccount) {
        const savingsAccount = await SeiMoneyContract.getAccount(walletStore.address);
        walletStore.setSavingAccount(savingsAccount);
        if (savingsAccount) SavingsAccountContract.setAddress(savingsAccount);
    }
    getSavingsAccount();
});

watch(computed(() => walletStore.savingsAccount), () => {
    getSavingsAccount();
});


const createsavingsAccount = async () => {
    if (!walletStore.address) return;

    try {
        isCreatingAccount.value = true;

        const txHash = await SeiMoneyContract.createAccount();

        if (!txHash) {
            return;
        }

        const savingsAccount = await SeiMoneyContract.getAccount(walletStore.address);
        walletStore.setSavingAccount(savingsAccount);
        if (savingsAccount) SavingsAccountContract.setAddress(savingsAccount);

        getSavingsAccount();
    } catch (error) {
        console.error('Failed to create smart account:', error);
    } finally {
        isCreatingAccount.value = false;
    }
};

const depositToAccount = async () => {
    if (!savingsAccount.value || !depositForm.value.amount || parseFloat(depositForm.value.amount) <= 0) return;

    isDepositing.value = true;

    try {
        const txHash = await TokenContract.transfer(
            depositForm.value.token.address,
            savingsAccount.value.address,
            parseUnits(depositForm.value.amount.toString(), depositForm.value.token.decimals)
        );
        if (!txHash) return;

        depositForm.value.amount = '';

        const balanceWei = await SavingsAccountContract.balanceOf(tokens[0].address);
        savingsAccount.value.balance.amount = formatUnits(balanceWei, tokens[0].decimals);

    } catch (error) {
        console.error('Failed to deposit:', error);
    } finally {
        isDepositing.value = false;
    }
};

const withdrawFromAccount = async () => {
    if (!savingsAccount.value || !withdrawForm.value.amount || parseFloat(withdrawForm.value.amount) <= 0) return;
    if (Number(withdrawForm.value.amount) > Number(savingsAccount.value.balance.amount)) return;

    isWithdrawing.value = true;

    try {
        const txHash = await SavingsAccountContract.withdraw(
            withdrawForm.value.token.address,
            parseUnits(withdrawForm.value.amount.toString(), withdrawForm.value.token.decimals)
        );

        if (!txHash) return;

        withdrawForm.value.amount = '';

        const balanceWei = await SavingsAccountContract.balanceOf(tokens[0].address);
        savingsAccount.value.balance.amount = formatUnits(balanceWei, tokens[0].decimals);

    } catch (error) {
        console.error('Failed to withdraw:', error);
    } finally {
        isWithdrawing.value = false;
    }
};

const activateStrategy = async (strategy: Strategy) => {
    if (!savingsAccount.value) return;
    try {
        if (savingsAccount.value.activeStrategy?.address == strategy.address) return;

        else if (savingsAccount.value.activeStrategy) {
            await SavingsAccountContract.exitStrategy(tokens[0].address);
        }

        const txHash = await SavingsAccountContract.useStrategy(tokens[0].address, strategy.address);
        if (!txHash) return;

        savingsAccount.value.activeStrategy = strategy;
    } catch (error) {
        console.error('Failed to activate strategy:', error);
    }
};

const removeStrategy = async () => {
    if (!savingsAccount.value) return;
    try {
        if (!savingsAccount.value.activeStrategy) return;

        const txHash = await SavingsAccountContract.exitStrategy(tokens[0].address);
        if (!txHash) return;

        savingsAccount.value.activeStrategy = undefined;
    } catch (error) {
        console.error('Failed to remove strategy:', error);
    }
};

const earn = async () => {
    if (!savingsAccount.value) return;
    try {
        if (!savingsAccount.value.activeStrategy) return;

        const txHash = await SavingsAccountContract.earn(tokens[0].address);
        if (!txHash) return;

    } catch (error) {
        console.error('Failed to earn:', error);
    }
};

const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const getRiskColor = (risk: string) => {
    switch (risk) {
        case 'low': return '#10b981';
        case 'medium': return '#f59e0b';
        case 'high': return '#ef4444';
        default: return '#6b7280';
    }
};
</script>

<template>
    <div class="smart-account-container">
        <div class="smart-account-header">
            <div>
                <h1>Smart Account</h1>
                <p>Auto-compound your deposits with intelligent yield strategies</p>
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading your smart account...</p>
        </div>

        <!-- No Smart Account -->
        <div v-else-if="!walletStore.savingsAccount" class="no-account-state">
            <div class="no-account-card">
                <div class="no-account-icon">🤖</div>
                <h3>Create Your Smart Account</h3>
                <p>Deploy a smart contract that automatically compounds your revenue using advanced DeFi strategies.
                </p>

                <div class="benefits-list">
                    <div class="benefit-item">
                        <span class="benefit-icon">⚡</span>
                        <span>Automatic compounding</span>
                    </div>
                    <div class="benefit-item">
                        <span class="benefit-icon">📈</span>
                        <span>Optimized yield strategies</span>
                    </div>
                    <div class="benefit-item">
                        <span class="benefit-icon">🔒</span>
                        <span>Non-custodial & secure</span>
                    </div>
                    <div class="benefit-item">
                        <span class="benefit-icon">🎯</span>
                        <span>Strategies pool</span>
                    </div>
                </div>

                <button @click="createsavingsAccount" class="btn btn-primary" :disabled="isCreatingAccount">
                    <span v-if="isCreatingAccount">Creating Account...</span>
                    <span v-else>🚀 Create Smart Account</span>
                </button>
            </div>
        </div>

        <!-- Smart Account Dashboard -->
        <div v-else-if="savingsAccount" class="smart-account-dashboard">
            <!-- Account Overview -->
            <div class="account-overview">
                <div class="overview-card balance-card">
                    <div class="card-header">
                        <h3>Total Balance</h3>
                        <span class="account-address">{{ formatAddress(walletStore.savingsAccount) }}</span>
                    </div>
                    <div class="balance-amount">
                        <span class="amount">${{ savingsAccount.balance.amount.toLocaleString() }}</span>
                        <span class="token">{{ savingsAccount.balance.token.symbol }}</span>
                    </div>
                    <div class="btn btn-outline balance-btn" @click="earn" v-if="savingsAccount.activeStrategy">
                        <span>Earn</span>
                    </div>
                </div>

                <div class="overview-card strategy-card">
                    <div class="card-header">
                        <h3>Active Strategy</h3>
                        <span class="auto-compound" :class="{ active: savingsAccount.autoCompoundEnabled }">
                            {{ savingsAccount.autoCompoundEnabled ? '🔄 Auto-compound ON' : '⏸️ Auto-compound OFF' }}
                        </span>
                    </div>
                    <div v-if="savingsAccount.activeStrategy" class="active-strategy">
                        <h4>{{ savingsAccount.activeStrategy.name }}</h4>
                        <div class="strategy-stats">
                            <span class="apy">{{ savingsAccount.activeStrategy.apy }}% APY</span>
                            <span class="risk"
                                :style="{ color: getRiskColor(savingsAccount.activeStrategy.riskLevel) }">
                                {{ savingsAccount.activeStrategy.riskLevel.toUpperCase() }} RISK
                            </span>
                        </div>
                    </div>
                    <div v-else class="no-strategy">
                        <p>No active strategy</p>
                        <span class="select-strategy">Select a strategy below</span>
                    </div>
                </div>
            </div>

            <!-- Deposit Section -->
            <div class="deposit-section">
                <div class="section-card">
                    <h3>Deposit</h3>
                    <p class="section-description">Deposit tokens to your smart account for automatic compounding. Or
                        transfer {{ depositForm.token.symbol }} to {{ savingsAccount.address }}</p>

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

            <!-- Withdraw Section -->
            <div class="deposit-section">
                <div class="section-card">
                    <h3>Withdraw</h3>
                    <p class="section-description">Withdraw tokens from your smart account, returning funds to your
                        wallet.</p>

                    <form @submit.prevent="withdrawFromAccount" class="deposit-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Amount</label>
                                <input v-model="withdrawForm.amount" type="number" step="0.01" min="0"
                                    placeholder="0.00" required />
                            </div>
                            <div class="form-group">
                                <label>Token</label>
                                <div class="token-selector">
                                    <div class="selected-token">
                                        <img :src="tokens[0].icon" :alt="tokens[0].symbol" class="token-icon" />
                                        <span class="token-symbol">{{ tokens[0].symbol }}</span>
                                    </div>
                                    <div class="token-dropdown">
                                        <div v-for="token in tokens" :key="token.address"
                                            @click="selectTokenWithdraw(token)" class="token-option"
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
                            <button type="submit" class="btn btn-primary" :disabled="isWithdrawing">
                                <span v-if="isWithdrawing">Withdrawing...</span>
                                <span v-else>Withdraw</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Strategy Marketplace -->
            <div class="strategy-marketplace">
                <div class="section-card">
                    <h3>Available Strategies</h3>
                    <p class="section-description">Choose from verified yield strategies created by the community</p>

                    <div class="strategies-grid">
                        <div v-for="strategy in availableStrategies" :key="strategy.address" class="strategy-card"
                            :class="{ active: strategy.address == savingsAccount.activeStrategy?.address }">
                            <div class="strategy-header">
                                <div class="strategy-info">
                                    <h4>{{ strategy.name }} ({{ formatAddress(strategy.address) }})</h4>
                                    <p>{{ strategy.description }}</p>
                                </div>
                                <div class="strategy-status">
                                    <span v-if="strategy.address == savingsAccount.activeStrategy?.address"
                                        class="status-badge active">ACTIVE</span>
                                    <span v-else class="status-badge">AVAILABLE</span>
                                </div>
                            </div>

                            <div class="strategy-stats">
                                <div class="stat-item">
                                    <span class="stat-label">APY</span>
                                    <span class="stat-value apy">{{ strategy.apy }}%</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Risk</span>
                                    <span class="stat-value risk" :style="{ color: getRiskColor(strategy.riskLevel) }">
                                        {{ strategy.riskLevel.toUpperCase() }}
                                    </span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Desposit Fees</span>
                                    <span class="stat-value">{{ strategy.fees }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Withdraw Fees</span>
                                    <span class="stat-value">{{ strategy.fees }}</span>
                                </div>
                            </div>

                            <div class="strategy-protocols">
                                <span class="protocols-label">Protocols / Rewarders:</span>
                                <div class="protocols-list">
                                    <span v-for="protocol in strategy.protocols" :key="protocol" class="protocol-tag">
                                        {{ protocol }}
                                    </span>
                                </div>
                            </div>

                            <div class="strategy-actions">
                                <button v-if="strategy.address != savingsAccount.activeStrategy?.address"
                                    @click="activateStrategy(strategy)" class="btn btn-outline">
                                    Activate Strategy
                                </button>
                                <span v-else class="btn btn-outline active-indicator" @click="removeStrategy()">Remove
                                    Strategy</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.smart-account-container {
    max-width: 1200px;
    margin: 0 auto;
}

.smart-account-header {
    margin-bottom: 32px;
}

.smart-account-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.smart-account-header p {
    color: var(--text-secondary);
    font-size: 1.1rem;
}


.no-account-state {
    display: flex;
    justify-content: center;
    padding: 40px 20px;
}

.no-account-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    padding: 40px;
    text-align: center;
    max-width: 500px;
    width: 100%;
}

.no-account-icon {
    font-size: 4rem;
    margin-bottom: 24px;
}

.no-account-card h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
}

.no-account-card p {
    color: var(--text-secondary);
    margin-bottom: 32px;
    line-height: 1.6;
}

.benefits-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 32px;
}

.benefit-item {
    display: flex;
    align-items: center;
    gap: 8px;
    text-align: left;
}

.benefit-icon {
    font-size: 1.2rem;
}

.smart-account-dashboard {
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.account-overview {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
}

.overview-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.card-header h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
}

.account-address {
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    color: var(--text-secondary);
    background: var(--bg-primary);
    padding: 4px 8px;
    border-radius: 4px;
}

.balance-amount {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin-bottom: 12px;
}

.amount {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
}

.token {
    font-size: 1rem;
    color: var(--text-secondary);
}

.yield-earned {
    color: #10b981;
    font-weight: 500;
    font-size: 0.9rem;
}

.auto-compound {
    font-size: 0.8rem;
    padding: 4px 8px;
    border-radius: 12px;
    background: var(--bg-primary);
    color: var(--text-secondary);
}

.auto-compound.active {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
}

.active-strategy h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.strategy-stats {
    display: flex;
    gap: 16px;
}

.apy {
    color: #10b981;
    font-weight: 600;
}

.risk {
    font-weight: 600;
    font-size: 0.8rem;
}

.no-strategy p {
    color: var(--text-secondary);
    margin-bottom: 4px;
}

.select-strategy {
    color: #667eea;
    font-size: 0.8rem;
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

.strategies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 20px;
}

.strategy-card {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 20px;
    transition: all 0.2s ease;
}

.strategy-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.strategy-card.active {
    border-color: #10b981;
    background: rgba(16, 185, 129, 0.05);
}

.strategy-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
}

.strategy-info h4 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
}

.strategy-info p {
    color: var(--text-secondary);
    font-size: 0.9rem;
    line-height: 1.4;
}

.status-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-badge.active {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;
}

.status-badge:not(.active) {
    background: var(--bg-secondary);
    color: var(--text-secondary);
}

.strategy-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 16px;
}

.stat-item {
    text-align: center;
}

.stat-label {
    display: block;
    font-size: 0.7rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
}

.stat-value {
    display: block;
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.9rem;
}

.stat-value.apy {
    color: #10b981;
}

.strategy-protocols {
    margin-bottom: 16px;
}

.protocols-label {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-bottom: 8px;
    display: block;
}

.protocols-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.protocol-tag {
    padding: 2px 8px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    font-size: 0.7rem;
    color: var(--text-secondary);
}

.strategy-actions {
    text-align: center;
}

.active-indicator {
    color: #10b981;
    font-weight: 500;
    font-size: 0.9rem;
}

.empty-history {
    text-align: center;
    padding: 40px;
    color: var(--text-secondary);
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
    display: inline-block;
    text-align: center;
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

.btn-outline {
    background: transparent;
    color: #667eea;
    border: 1px solid #667eea;
}

.btn-outline:hover {
    background: #667eea;
    color: white;
}

@media (max-width: 768px) {
    .account-overview {
        grid-template-columns: 1fr;
    }

    .form-row {
        grid-template-columns: 1fr;
    }

    .strategies-grid {
        grid-template-columns: 1fr;
    }

    .strategy-stats {
        grid-template-columns: repeat(2, 1fr);
    }

    .benefits-list {
        grid-template-columns: 1fr;
    }

    .transaction-item {
        flex-direction: column;
        text-align: center;
        gap: 12px;
    }
}
</style>