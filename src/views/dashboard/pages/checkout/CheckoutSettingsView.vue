<script setup lang="ts">
import { onMounted, ref, } from 'vue';
import { useRouter } from 'vue-router';
import type { Checkout } from '../../../../types';
import { categories, days, timezones } from '../../../../utils/constants';
import { createSeiMoneySDK } from '@seimoney/sdk/src/sdk';

const router = useRouter();

const isLoading = ref(true);
const isSaving = ref(false);
const checkout = ref<Checkout | null>(null);
const sdk = createSeiMoneySDK({ apiUrl: import.meta.env.VITE_API_URL });

const getCheckout = async () => {
    isLoading.value = true;
    try {
        checkout.value = await sdk.products.getCheckoutWithAuth();
    } catch (error) {
        console.error('Error loading checkout:', error);
    } finally {
        isLoading.value = false;
    }
};

const toggleWorkingDay = (day: number) => {
    if (!checkout.value) return;

    const index = checkout.value.schedule.workingDays.indexOf(day);

    if (index > -1) {
        checkout.value.schedule.workingDays.splice(index, 1);
    } else {
        checkout.value.schedule.workingDays.push(day);
    }
};

const saveSettings = async () => {
    isSaving.value = true;
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));

        router.push('/checkout');
    } catch (error) {
        console.error('Error saving settings:', error);
    } finally {
        isSaving.value = false;
    }
};

onMounted(() => {
    getCheckout();
});
</script>

<template>
    <div class="settings-container">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading checkout settings...</p>
        </div>

        <div v-else class="settings-content" v-if="checkout">
            <!-- Header -->
            <div class="settings-header">
                <button @click="router.back()" class="back-btn">
                    <span class="back-icon">←</span>
                    Back to Checkout
                </button>
                <div class="header-content">
                    <h1>Checkout Settings</h1>
                    <p>Update your store incheckoutation and preferences</p>
                </div>
            </div>

            <!-- Settings checkout -->
            <div class="settings-checkout">
                <div class="checkout-section">
                    <h2>Store Incheckoutation</h2>
                    <div class="checkout-grid">
                        <div class="checkout-group full-width">
                            <label for="name">Store Name</label>
                            <input id="name" v-model="checkout.name" type="text" placeholder="Enter your store name" />
                        </div>

                        <div class="checkout-group full-width">
                            <label for="tagline">Tagline</label>
                            <input id="tagline" v-model="checkout.tagline" type="text"
                                placeholder="A short description of your store" />
                        </div>

                        <div class="checkout-group full-width">
                            <label for="about">About Your Store</label>
                            <textarea id="about" v-model="checkout.about"
                                placeholder="Describe what you sell and what makes your store unique"
                                rows="4"></textarea>
                        </div>

                        <div class="checkout-group">
                            <label for="category">Category</label>
                            <select id="category" v-model="checkout.category">
                                <option value="">Select a category</option>
                                <option v-for="category in categories" :key="category" :value="category">
                                    {{ category }}
                                </option>
                            </select>
                        </div>

                        <div class="checkout-group">
                            <label for="logoURL">Logo URL</label>
                            <input id="logoURL" v-model="checkout.logoURL" type="url"
                                placeholder="https://example.com/logo.png" />
                        </div>
                    </div>
                </div>

                <div class="checkout-section">
                    <h2>Location</h2>
                    <div class="checkout-grid">
                        <div class="checkout-group">
                            <label for="country">Country</label>
                            <input id="country" v-model="checkout.location.country" type="text"
                                placeholder="United States" />
                        </div>

                        <div class="checkout-group">
                            <label for="city">City</label>
                            <input id="city" v-model="checkout.location.city" type="text" placeholder="San Francisco" />
                        </div>

                        <div class="checkout-group full-width">
                            <label for="address">Address</label>
                            <input id="address" v-model="checkout.location.address" type="text"
                                placeholder="123 Main Street" />
                        </div>

                        <div class="checkout-group">
                            <label for="zipCode">Zip Code</label>
                            <input id="zipCode" v-model="checkout.location.zipCode" type="text" placeholder="12345" />
                        </div>
                    </div>
                </div>

                <div class="checkout-section">
                    <h2>Business Hours</h2>
                    <div class="checkout-grid">
                        <div class="checkout-group">
                            <label for="timezone">Timezone</label>
                            <select id="timezone" v-model="checkout.schedule.timezone">
                                <option v-for="tz in timezones" :key="tz" :value="tz">
                                    {{ tz }}
                                </option>
                            </select>
                        </div>

                        <div class="checkout-group">
                            <label for="startTime">Start Time</label>
                            <input id="startTime" v-model="checkout.schedule.workingHours.start" type="time" />
                        </div>

                        <div class="checkout-group">
                            <label for="endTime">End Time</label>
                            <input id="endTime" v-model="checkout.schedule.workingHours.end" type="time" />
                        </div>

                        <div class="checkout-group full-width">
                            <label>Working Days</label>
                            <div class="working-days">
                                <button v-for="day in Object.keys(days)" :key="day" type="button"
                                    @click="toggleWorkingDay(Number(day))" class="day-btn"
                                    :class="{ 'active': checkout.schedule.workingDays.includes(Number(day)) }">
                                    {{ days[Number(day)].slice(0, 3) }}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Save Button -->
                <div class="checkout-actions">
                    <button @click="saveSettings" class="btn btn-primary" :disabled="isSaving">
                        <span v-if="isSaving">Saving...</span>
                        <span v-else>Save Settings</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.settings-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.loading-state {
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
        transcheckout: rotate(0deg);
    }

    100% {
        transcheckout: rotate(360deg);
    }
}

.settings-header {
    margin-bottom: 32px;
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
    margin-bottom: 16px;
    transition: color 0.2s ease;
}

.back-btn:hover {
    color: var(--text-primary);
}

.back-icon {
    font-size: 1.2rem;
}

.header-content h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.header-content p {
    color: var(--text-secondary);
    font-size: 1.1rem;
}

.settings-checkout {
    display: flex;
    flex-direction: column;
    gap: 32px;
}

.checkout-section {
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
}

.checkout-section h2 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 20px;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 8px;
}

.checkout-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.checkout-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.checkout-group.full-width {
    grid-column: 1 / -1;
}

.checkout-group label {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.9rem;
}

.checkout-group input,
.checkout-group select,
.checkout-group textarea {
    padding: 12px 16px;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-size: 0.9rem;
    transition: border-color 0.2s ease;
}

.checkout-group input:focus,
.checkout-group select:focus,
.checkout-group textarea:focus {
    outline: none;
    border-color: #667eea;
}

.working-days {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.day-btn {
    padding: 8px 12px;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: var(--bg-primary);
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 500;
    transition: all 0.2s ease;
}

.day-btn:hover {
    border-color: #667eea;
    color: var(--text-primary);
}

.day-btn.active {
    background: #667eea;
    border-color: #667eea;
    color: white;
}

.checkout-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 20px;
    border-top: 1px solid var(--border-color);
}

.btn {
    padding: 12px 32px;
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
    transcheckout: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

@media (max-width: 768px) {
    .checkout-grid {
        grid-template-columns: 1fr;
    }

    .checkout-actions {
        justify-content: stretch;
    }

    .btn {
        width: 100%;
    }
}
</style>