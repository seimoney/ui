<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const featuresRef = ref<HTMLElement | null>(null);
const isVisible = ref(false);

const features = [
    {
        icon: '🔗',
        title: 'Payment Links',
        description: 'Create and share payment links instantly. Accept crypto payments with just a click, perfect for freelancers, merchants, and content creators.',
        gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
    },
    {
        icon: '🤖',
        title: 'Smart Accounts',
        description: 'Deploy smart contracts that automatically compound your deposits using advanced DeFi strategies from our marketplace.',
        gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    },
    {
        icon: '🔒',
        title: 'Premium Content Gating',
        description: 'Monetize your content effortlessly. Gate premium articles, videos, or digital products behind crypto payments with seamless user experience.',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)'
    },
    {
        icon: '💰',
        title: 'Payroll Management',
        description: 'Streamline salary payments with automated crypto payroll. Schedule recurring payments, manage employee wallets, and ensure timely compensation.',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)'
    },
    {
        icon: '🌊',
        title: 'Money Streaming',
        description: 'Enable real-time money streaming based on x402 protocol. Stream payments by the second for subscriptions, salaries, or continuous services.',
        gradient: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)'
    }
];

const observer = ref<IntersectionObserver | null>(null);

onMounted(() => {
    observer.value = new IntersectionObserver(
        ([entry]) => {
            if (entry.isIntersecting) {
                isVisible.value = true;
            }
        },
        { threshold: 0.1 }
    );

    if (featuresRef.value) {
        observer.value.observe(featuresRef.value);
    }
});

onUnmounted(() => {
    if (observer.value) {
        observer.value.disconnect();
    }
});
</script>

<template>
    <section id="features" ref="featuresRef" class="features" :class="{ 'visible': isVisible }">
        <div class="container">
            <h2 class="section-title">Powerful Features</h2>
            <p class="section-subtitle">
                Everything you need to manage, send, and receive digital payments in the Web3 ecosystem
            </p>

            <div class="features-grid">
                <div v-for="(feature, index) in features" :key="index" class="feature-card"
                    :style="{ '--delay': `${index * 0.1}s`, '--gradient': feature.gradient }">
                    <div class="feature-icon">
                        {{ feature.icon }}
                    </div>
                    <h3 class="feature-title">{{ feature.title }}</h3>
                    <p class="feature-description">{{ feature.description }}</p>
                    <div class="feature-overlay"></div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.features {
    padding: 8rem 0;
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    opacity: 0;
    transform: translateY(50px);
    transition: all 0.8s ease;
}

.features.visible {
    opacity: 1;
    transform: translateY(0);
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 4rem;
}

.feature-card {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 2.5rem;
    text-align: center;
    border: 1px solid rgba(255, 255, 255, 0.2);
    position: relative;
    overflow: hidden;
    transition: all 0.4s ease;
    opacity: 0;
    transform: translateY(30px);
    animation: fadeInUp 0.6s ease-out var(--delay) forwards;
    cursor: pointer;
}

@keyframes fadeInUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.feature-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--gradient);
    transform: scaleX(0);
    transition: transform 0.3s ease;
}

.feature-card:hover::before {
    transform: scaleX(1);
}

.feature-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(99, 102, 241, 0.15);
    border-color: rgba(99, 102, 241, 0.2);
}

.feature-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--gradient);
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
}

.feature-card:hover .feature-overlay {
    opacity: 0.05;
}

.feature-icon {
    font-size: 3rem;
    margin-bottom: 1.5rem;
    display: block;
    filter: drop-shadow(0 4px 8px rgba(99, 102, 241, 0.2));
}

.feature-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 1rem;
    transition: color 0.3s ease;
}

.feature-card:hover .feature-title {
    background: var(--gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.feature-description {
    color: #6b7280;
    line-height: 1.7;
    font-size: 1rem;
}

@media (max-width: 768px) {
    .features {
        padding: 4rem 0;
    }

    .features-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
        margin-top: 2rem;
    }

    .feature-card {
        padding: 2rem;
    }

    .feature-icon {
        font-size: 2.5rem;
        margin-bottom: 1rem;
    }

    .feature-title {
        font-size: 1.25rem;
    }
}
</style>