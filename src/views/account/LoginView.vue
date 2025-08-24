<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '../../composables/useAuth';
import { useWeb3Modal } from '@web3modal/wagmi/vue';
import { useWalletStore } from '../../stores/wallet';
import { useRouter } from 'vue-router';

const { login, register } = useAuth();

const email = ref('');
const name = ref('');
const isLoading = ref(false);
const isLoadingLogin = ref(false);
const error = ref('');
const errorLogin = ref('');

const router = useRouter();
const modal = useWeb3Modal();
const walletStore = useWalletStore();

const handleLogin = async () => {
    if (!walletStore.address) {
        errorLogin.value = 'Please connect your wallet';
        return;
    }

    isLoadingLogin.value = true;
    errorLogin.value = '';

    try {
        const logged = await login(walletStore.address);

        if (!logged) {
            errorLogin.value = 'Account not found. Please create an account.';
        }

        router.push('/');
    } catch (err) {
        errorLogin.value = 'Login failed. Please try again.';
    } finally {
        isLoadingLogin.value = false;
    }
};

const handleCreateAccount = async () => {
    if (!walletStore.address) {
        error.value = 'Please connect your wallet';
        return;
    }

    if (!name.value) {
        error.value = 'Name is required';
        return;
    }

    if (!email.value) {
        error.value = 'Email is required';
        return;
    }

    isLoading.value = true;
    error.value = '';

    try {
        const logged = await register(walletStore.address, email.value, undefined, name.value);

        if (!logged) {
            errorLogin.value = 'Failed to create account. Please try again.';
        }

        router.push('/');
    } catch (err) {
        error.value = 'Create account failed. Please try again.';
    } finally {
        isLoading.value = false;
    }
};
</script>

<template>
    <div class="login-container">
        <div class="login-card">
            <div class="login-header">
                <h1 class="logo">SeiMoney</h1>
                <p class="tagline">Simplifying Internet Money</p>
            </div>

            <div class="login-form" v-if="!walletStore.address">
                <button class="btn btn-primary" @click="modal.open()">
                    <span>Connect Wallet</span>
                </button>
            </div>

            <div v-else>
                <form @submit.prevent="handleCreateAccount" class="login-form">
                    <div class="form-group">
                        <label for="name">Name</label>
                        <input id="name" v-model="name" type="text" placeholder="Enter your name" :disabled="isLoading"
                            required />
                    </div>

                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input id="email" v-model="email" type="email" placeholder="Enter your email"
                            :disabled="isLoading" required />
                    </div>

                    <div v-if="error" class="error-message">
                        {{ error }}
                    </div>

                    <button type="submit" class="btn btn-primary" :disabled="isLoading">
                        <span v-if="isLoading">Signing In...</span>
                        <span v-else>Create Account</span>
                    </button>
                </form>

                <div class="or">
                    <h3>OR</h3>
                </div>

                <form @submit.prevent="handleLogin" class="login-form">
                    <div v-if="errorLogin" class="error-message">
                        {{ errorLogin }}
                    </div>

                    <button type="submit" class="btn btn-primary" :disabled="isLoadingLogin">
                        <span v-if="isLoadingLogin">Signing In...</span>
                        <span v-else>Sign In</span>
                    </button>
                </form>
            </div>

            <div class="login-footer">
                <p>Built on Sei Network with x402 Protocol</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
}

.login-card {
    background: var(--bg-primary);
    border-radius: 16px;
    padding: 40px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 400px;
    border: 1px solid var(--border-color);
}

.login-header {
    text-align: center;
    margin-bottom: 32px;
}

.logo {
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 8px;
}

.tagline {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.or {
    text-align: center;
    margin: 16px 0;
}

.or h3 {
    color: var(--text-secondary);
    font-size: 0.9rem;
}


.login-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-checkbox {
    flex-direction: row;
    justify-content: space-between;
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
    background: var(--bg-secondary);
    color: var(--text-primary);
    font-size: 1rem;
    transition: all 0.2s ease;
}

.form-group input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.error-message {
    color: #ef4444;
    font-size: 0.9rem;
    text-align: center;
    padding: 8px;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 6px;
    border: 1px solid rgba(239, 68, 68, 0.2);
}

.btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
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

.login-footer {
    text-align: center;
    margin-top: 24px;
    padding-top: 24px;
    border-top: 1px solid var(--border-color);
}

.login-footer p {
    color: var(--text-secondary);
    font-size: 0.8rem;
}

@media (max-width: 480px) {
    .login-card {
        padding: 24px;
    }

    .logo {
        font-size: 1.5rem;
    }
}
</style>