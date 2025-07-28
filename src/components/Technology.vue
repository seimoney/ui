<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const technologyRef = ref<HTMLElement | null>(null);
const isVisible = ref(false);

const techFeatures = [
    {
        title: 'Built on Sei Network',
        description: 'Lightning-fast transactions with minimal fees on the fastest blockchain',
        icon: '⚡'
    },
    {
        title: 'x402 Protocol Integration',
        description: 'Advanced payment streaming technology for real-time financial flows',
        icon: '🔄'
    },
    {
        title: 'Enterprise Security',
        description: 'Bank-grade security with multi-signature wallets and audit trails',
        icon: '🛡️'
    },
    {
        title: 'Developer Friendly',
        description: 'Comprehensive APIs and SDKs for seamless integration',
        icon: '👩‍💻'
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

    if (technologyRef.value) {
        observer.value.observe(technologyRef.value);
    }
});

onUnmounted(() => {
    if (observer.value) {
        observer.value.disconnect();
    }
});
</script>

<template>
    <section id="technology" ref="technologyRef" class="technology" :class="{ 'visible': isVisible }">
        <div class="container">
            <div class="content-grid">
                <div class="content-left">
                    <h2 class="section-title-left">
                        Built for the
                        <span class="highlight">Future of Finance</span>
                    </h2>
                    <p class="section-description">
                        SeiMoney leverages cutting-edge blockchain technology to deliver unparalleled
                        performance, security, and scalability. Built on Sei Network with x402 protocol
                        integration, we're pioneering the next generation of digital payments.
                    </p>

                    <div class="tech-stats">
                        <div class="stat-item">
                            <div class="stat-value">400ms</div>
                            <div class="stat-label">Average Transaction Time</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">$0.000</div>
                            <div class="stat-label">No Transaction Fee</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-value">12,500</div>
                            <div class="stat-label">Transactions per Second</div>
                        </div>
                    </div>
                </div>

                <div class="content-right">
                    <div class="tech-features">
                        <div v-for="(feature, index) in techFeatures" :key="index" class="tech-feature"
                            :style="{ '--delay': `${index * 0.1}s` }">
                            <div class="tech-icon">{{ feature.icon }}</div>
                            <div class="tech-content">
                                <h3 class="tech-title">{{ feature.title }}</h3>
                                <p class="tech-description">{{ feature.description }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.technology {
    padding: 8rem 0;
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
    color: white;
    position: relative;
    overflow: hidden;
    opacity: 0;
    transform: translateY(50px);
    transition: all 0.8s ease;
}

.technology.visible {
    opacity: 1;
    transform: translateY(0);
}

.technology::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
    z-index: 0;
}

.container {
    position: relative;
    z-index: 1;
}

.content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
}

.section-title-left {
    font-size: 3rem;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 1.5rem;
    text-align: left;
}

.highlight {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.section-description {
    font-size: 1.1rem;
    color: #d1d5db;
    line-height: 1.7;
    margin-bottom: 3rem;
}

.tech-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
}

.stat-item {
    text-align: left;
}

.stat-value {
    font-size: 2rem;
    font-weight: 700;
    color: #6366f1;
    margin-bottom: 0.25rem;
}

.stat-label {
    font-size: 0.875rem;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.tech-features {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.tech-feature {
    display: flex;
    align-items: flex-start;
    gap: 1.5rem;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all 0.3s ease;
    opacity: 0;
    transform: translateX(30px);
    animation: slideInRight 0.6s ease-out var(--delay) forwards;
}

@keyframes slideInRight {
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.tech-feature:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(99, 102, 241, 0.3);
    transform: translateY(-2px);
}

.tech-icon {
    font-size: 2rem;
    flex-shrink: 0;
    filter: drop-shadow(0 4px 8px rgba(99, 102, 241, 0.3));
}

.tech-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: white;
    margin-bottom: 0.5rem;
}

.tech-description {
    color: #d1d5db;
    line-height: 1.6;
}

@media (max-width: 968px) {
    .technology {
        padding: 4rem 0;
    }

    .content-grid {
        grid-template-columns: 1fr;
        gap: 3rem;
        text-align: center;
    }

    .section-title-left {
        font-size: 2.5rem;
        text-align: center;
    }

    .tech-stats {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .stat-item {
        text-align: center;
    }
}

@media (max-width: 640px) {
    .section-title-left {
        font-size: 2rem;
    }

    .tech-feature {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
    }

    .tech-stats {
        gap: 1rem;
    }
}
</style>