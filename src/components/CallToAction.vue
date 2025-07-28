<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const ctaRef = ref<HTMLElement | null>(null);
const isVisible = ref(false);

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

    if (ctaRef.value) {
        observer.value.observe(ctaRef.value);
    }
});

onUnmounted(() => {
    if (observer.value) {
        observer.value.disconnect();
    }
});
</script>

<template>
    <section id="about" ref="ctaRef" class="cta" :class="{ 'visible': isVisible }">
        <div class="cta-background">
            <div class="gradient-mesh"></div>
        </div>

        <div class="container">
            <div class="cta-content">
                <h2 class="cta-title">
                    Ready to Transform Your
                    <span class="highlight">Payment Experience?</span>
                </h2>

                <p class="cta-subtitle">
                    Join thousands of creators, businesses, and developers who trust SeiMoney
                    for their Web3 payment infrastructure. Start building the future of finance today.
                </p>

                <div class="cta-actions">
                    <a href="#" class="btn btn-primary btn-large">
                        Start Building Free
                    </a>
                    <a href="#" class="btn btn-outline btn-large">
                        View Documentation
                    </a>
                </div>

                <div class="cta-features">
                    <div class="feature-item">
                        <span class="feature-check">✓</span>
                        No setup fees
                    </div>
                    <div class="feature-item">
                        <span class="feature-check">✓</span>
                        5-minute integration
                    </div>
                    <div class="feature-item">
                        <span class="feature-check">✓</span>
                        24/7 developer support
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.cta {
    padding: 8rem 0;
    position: relative;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
    overflow: hidden;
    opacity: 0;
    transform: translateY(50px);
    transition: all 0.8s ease;
}

.cta.visible {
    opacity: 1;
    transform: translateY(0);
}

.cta-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
}

.gradient-mesh {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background:
        radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.05) 0%, transparent 70%);
    animation: pulse 4s ease-in-out infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.8;
    }
}

.container {
    position: relative;
    z-index: 1;
}

.cta-content {
    text-align: center;
    color: white;
    max-width: 800px;
    margin: 0 auto;
}

.cta-title {
    font-size: 3rem;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 1.5rem;
}

.highlight {
    background: linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.cta-subtitle {
    font-size: 1.25rem;
    line-height: 1.7;
    margin-bottom: 3rem;
    opacity: 0.95;
}

.cta-actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 3rem;
}

.btn-large {
    padding: 16px 32px;
    font-size: 1.1rem;
}

.btn-outline {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
}

.btn-outline:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    color: white;
}

.cta-features {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
}

.feature-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1rem;
    opacity: 0.9;
}

.feature-check {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    font-size: 0.75rem;
    font-weight: bold;
}

@media (max-width: 768px) {
    .cta {
        padding: 4rem 0;
    }

    .cta-title {
        font-size: 2rem;
    }

    .cta-subtitle {
        font-size: 1rem;
    }

    .cta-actions {
        flex-direction: column;
        align-items: center;
    }

    .cta-features {
        flex-direction: column;
        align-items: center;
        gap: 1rem;
    }
}

@media (max-width: 480px) {
    .cta-title {
        font-size: 1.75rem;
    }

    .btn-large {
        width: 100%;
        max-width: 280px;
    }
}
</style>