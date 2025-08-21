<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import type { CreateCheckout } from '../../../../types';
import { categories, days, timezones } from '../../../../utils/constants';
import { createSeiMoneySDK } from '@seimoney/sdk/src/sdk';

const router = useRouter();
const sdk = createSeiMoneySDK({ apiUrl: import.meta.env.VITE_API_URL });

const form = ref<CreateCheckout & { file: File | null; }>({
    name: '',
    tagline: '',
    about: '',
    category: '',
    logoURL: '',
    location: {
        address: '',
        city: '',
        zipCode: '',
        country: ''
    },
    schedule: {
        timezone: 'UTC',
        workingHours: {
            start: '09:00',
            end: '17:00'
        },
        workingDays: [1, 2, 3, 4, 5]
    },
    file: null
});

const isLoading = ref(false);
const errors = ref<Record<string, string>>({});

const validateForm = () => {
    errors.value = {};

    if (!form.value.name.trim()) {
        errors.value.name = 'Store name is required';
    }

    if (!form.value.tagline?.trim()) {
        errors.value.tagline = 'Store tagline is required';
    }

    if (!form.value.about.trim()) {
        errors.value.about = 'About section is required';
    }

    if (!form.value.category) {
        errors.value.category = 'Category is required';
    }

    if (!form.value.location.address.trim()) {
        errors.value.address = 'Address is required';
    }

    if (!form.value.location.city?.trim()) {
        errors.value.city = 'City is required';
    }

    if (!form.value.location.country?.trim()) {
        errors.value.country = 'Country is required';
    };


    if (form.value.schedule.workingDays.length === 0) {
        errors.value.workingDays = 'Please select at least one working day';
    }

    return Object.keys(errors.value).length === 0;
};

const toggleWorkingDay = (day: number) => {
    const index = form.value.schedule.workingDays.indexOf(day);

    if (index > -1) {
        form.value.schedule.workingDays.splice(index, 1);
    } else {
        form.value.schedule.workingDays.push(day);
    }
};

const handleSubmit = async () => {
    if (!validateForm()) return;

    isLoading.value = true;

    try {
        const created = await sdk.products.createCheckout(form.value, form.value.file as File);

        if (!created) {
            throw new Error('Failed to create checkout');
        }

        router.push('/dashboard/checkout');
    } catch (error) {
        console.error('Failed to create checkout:', error);
        errors.value.submit = 'Failed to create checkout. Please try again.';
    } finally {
        isLoading.value = false;
    }
};

const previewLogo = ref<string | null>(null);

const handleLogoChange = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
        form.value.file = target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            previewLogo.value = e.target?.result as string;
            form.value.logoURL = previewLogo.value;
        };
        reader.readAsDataURL(form.value.file);
    }
};
</script>

<template>
    <div class="create-checkout-container">
        <div class="create-checkout-header">
            <div>
                <h1>Create Your Checkout</h1>
                <p>Set up your digital storefront to start selling products</p>
            </div>
            <button @click="router.go(-1)" class="btn btn-secondary">
                ← Back
            </button>
        </div>

        <form @submit.prevent="handleSubmit" class="checkout-form">
            <!-- Store Information -->
            <div class="form-section">
                <h3>Store Information</h3>

                <div class="form-group">
                    <label for="name">Store Name *</label>
                    <input id="name" v-model="form.name" type="text" placeholder="e.g., My Digital Store"
                        :class="{ error: errors.name }" />
                    <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
                </div>

                <div class="form-group">
                    <label for="tagline">Tagline *</label>
                    <input id="tagline" v-model="form.tagline" type="text"
                        placeholder="A short description of your store" :class="{ error: errors.tagline }" />
                    <span v-if="errors.tagline" class="error-message">{{ errors.tagline }}</span>
                </div>

                <div class="form-group">
                    <label for="about">About Your Store *</label>
                    <textarea id="about" v-model="form.about"
                        placeholder="Describe what you sell and what makes your store unique" rows="4"
                        :class="{ error: errors.about }"></textarea>
                    <span v-if="errors.about" class="error-message">{{ errors.about }}</span>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="category">Category *</label>
                        <select id="category" v-model="form.category" :class="{ error: errors.category }">
                            <option value="">Select a category</option>
                            <option v-for="category in categories" :key="category" :value="category">
                                {{ category }}
                            </option>
                        </select>
                        <span v-if="errors.category" class="error-message">{{ errors.category }}</span>
                    </div>

                    <div class="form-group">
                        <label for="logoURL">Logo</label>
                        <div class="logo-upload-section">
                            <div class="logo-upload-option">
                                <input type="file" @change="handleLogoChange" accept="image/*" class="file-input"
                                    id="logo-file" />
                                <label for="logo-file" class="upload-btn">Upload</label>
                            </div>
                        </div>
                        <span v-if="errors.logoURL" class="error-message">{{ errors.logoURL }}</span>

                        <div v-if="form.logoURL" class="logo-preview">
                            <img :src="form.logoURL" alt="Logo preview" class="preview-image" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Location Information -->
            <div class="form-section">
                <h3>Location</h3>

                <div class="form-group">
                    <label for="address">Address *</label>
                    <input id="address" v-model="form.location.address" type="text" placeholder="123 Main Street"
                        :class="{ error: errors.address }" />
                    <span v-if="errors.address" class="error-message">{{ errors.address }}</span>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="city">City *</label>
                        <input id="city" v-model="form.location.city" type="text" placeholder="San Francisco"
                            :class="{ error: errors.city }" />
                        <span v-if="errors.city" class="error-message">{{ errors.city }}</span>
                    </div>

                    <div class="form-group">
                        <label for="zipCode">Zip Code</label>
                        <input id="zipCode" v-model="form.location.zipCode" type="text" placeholder="12345" />
                    </div>

                    <div class="form-group">
                        <label for="country">Country *</label>
                        <input id="country" v-model="form.location.country" type="text" placeholder="United States"
                            :class="{ error: errors.country }" />
                        <span v-if="errors.country" class="error-message">{{ errors.country }}</span>
                    </div>
                </div>
            </div>

            <!-- Business Hours -->
            <div class="form-section">
                <h3>Business Hours</h3>

                <div class="form-row">
                    <div class="form-group">
                        <label for="timezone">Timezone</label>
                        <select id="timezone" v-model="form.schedule.timezone">
                            <option v-for="tz in timezones" :key="tz" :value="tz">
                                {{ tz }}
                            </option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="startTime">Start Time</label>
                        <input id="startTime" v-model="form.schedule.workingHours.start" type="time" />
                    </div>

                    <div class="form-group">
                        <label for="endTime">End Time</label>
                        <input id="endTime" v-model="form.schedule.workingHours.end" type="time" />
                    </div>
                </div>

                <div class="form-group">
                    <label>Working Days *</label>
                    <div class="working-days">
                        <button v-for="day in Object.keys(days)" :key="day" type="button"
                            @click="toggleWorkingDay(Number(day))" class="day-btn"
                            :class="{ 'active': form.schedule.workingDays.includes(Number(day)) }">
                            {{ days[Number(day)].slice(0, 3) }}
                        </button>
                    </div>
                    <span v-if="errors.workingDays" class="error-message">{{ errors.workingDays }}</span>
                </div>
            </div>

            <!-- Preview Section -->
            <div class="form-section">
                <h3>Preview</h3>
                <div class="checkout-preview">
                    <div class="preview-header">
                        <div class="preview-logo" v-if="form.logoURL">
                            <img :src="form.logoURL" :alt="form.name" class="logo-image" />
                        </div>
                        <div class="preview-info">
                            <h4>{{ form.name || 'Your Store Name' }}</h4>
                            <p class="preview-tagline">{{ form.tagline || 'Your store tagline' }}</p>
                            <div class="preview-meta">
                                <span class="preview-category" v-if="form.category">{{ form.category }}</span>
                                <span class="preview-location" v-if="form.location.city && form.location.country">
                                    {{ form.location.city }}, {{ form.location.country }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="preview-about" v-if="form.about">
                        <p>{{ form.about }}</p>
                    </div>

                    <div class="preview-schedule">
                        <h5>Business Hours</h5>
                        <div class="schedule-info">
                            <span class="hours">{{ form.schedule.workingHours.start }} - {{
                                form.schedule.workingHours.end }}</span>
                            <span class="timezone">({{ form.schedule.timezone }})</span>
                        </div>
                        <div class="working-days-preview">
                            <span v-for="day in form.schedule.workingDays" :key="day" class="day-tag">
                                {{ days[day].slice(0, 3) }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Error Message -->
            <div v-if="errors.submit" class="error-message global-error">
                {{ errors.submit }}
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
                <button type="button" @click="router.go(-1)" class="btn btn-secondary">
                    Cancel
                </button>
                <button type="submit" class="btn btn-primary" :disabled="isLoading">
                    <span v-if="isLoading">Creating Checkout...</span>
                    <span v-else>🏪 Create Checkout</span>
                </button>
            </div>
        </form>
    </div>
</template>

<style scoped>
.create-checkout-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
}

.create-checkout-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
}

.create-checkout-header h1 {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.create-checkout-header p {
    color: var(--text-secondary);
    font-size: 1.1rem;
}

.checkout-form {
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
.form-group textarea.error,
.form-group select.error {
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

.global-error {
    text-align: center;
    padding: 12px;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 6px;
    border: 1px solid rgba(239, 68, 68, 0.2);
    margin-top: 0;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
}

.logo-upload-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.logo-upload-option {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9rem;
    color: var(--text-secondary);
}

.file-input {
    display: none;
}

.upload-btn {
    padding: 6px 12px;
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    color: var(--text-primary);
    transition: all 0.2s ease;
}

.upload-btn:hover {
    background: var(--bg-tertiary);
    border-color: #667eea;
}

.logo-preview {
    margin-top: 12px;
}

.preview-image {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid var(--border-color);
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

.checkout-preview {
    background: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 24px;
    margin-top: 16px;
}

.preview-header {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 16px;
}

.preview-logo {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
}

.logo-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.preview-info h4 {
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 4px;
}

.preview-tagline {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 8px;
}

.preview-meta {
    display: flex;
    gap: 12px;
    align-items: center;
}

.preview-category,
.preview-location {
    padding: 2px 8px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    font-size: 0.7rem;
    color: var(--text-secondary);
}

.preview-about {
    margin-bottom: 16px;
    padding: 16px;
    background: var(--bg-secondary);
    border-radius: 8px;
    border: 1px solid var(--border-color);
}

.preview-about p {
    color: var(--text-secondary);
    font-size: 0.9rem;
    line-height: 1.5;
}

.preview-schedule h5 {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 8px;
}

.schedule-info {
    display: flex;
    gap: 8px;
    align-items: center;
    margin-bottom: 8px;
}

.hours {
    font-weight: 500;
    color: var(--text-primary);
}

.timezone {
    color: var(--text-secondary);
    font-size: 0.8rem;
}

.working-days-preview {
    display: flex;
    gap: 4px;
    flex-wrap: wrap;
}

.day-tag {
    padding: 2px 6px;
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 500;
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

@media (max-width: 768px) {
    .create-checkout-header {
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

    .preview-header {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .working-days {
        justify-content: center;
    }

    .working-days-preview {
        justify-content: center;
    }
}
</style>