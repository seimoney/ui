<script setup lang="ts">
import { ref, onMounted } from 'vue';

const heroRef = ref<HTMLElement | null>(null);
const isVisible = ref(false);

onMounted(() => {
    setTimeout(() => {
        isVisible.value = true;
    }, 300);
});
</script>

<template>
    <section ref="heroRef" class="hero" :class="{ 'visible': isVisible }">
        <div class="hero-background">
            <div class="gradient-orb orb-1"></div>
            <div class="gradient-orb orb-2"></div>
            <div class="gradient-orb orb-3"></div>
        </div>

        <div class="container">
            <div class="hero-content">
                <h1 class="hero-title">
                    Simplifying
                    <span class="highlight">Internet Money</span>
                </h1>

                <p class="hero-subtitle">
                    The most powerful Web3 payment infrastructure built on Sei Network.
                    Create payment links, gate premium content, manage payrolls, and stream money
                    with unprecedented ease and security.
                </p>

                <div class="hero-actions">
                    <a href="#" class="btn btn-primary">Get Started Free</a>
                    <a href="#features" class="btn btn-outline">Explore Features</a>
                </div>

                <div class="hero-stats">
                    <div class="stat">
                        <div class="stat-number">$2.4M+</div>
                        <div class="stat-label">Volume Processed</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">15K+</div>
                        <div class="stat-label">Active Users</div>
                    </div>
                    <div class="stat">
                        <div class="stat-number">99.9%</div>
                        <div class="stat-label">Uptime</div>
                    </div>
                </div>
            </div>

            <div class="hero-visual">
                <div class="dashboard-preview">
                    <div class="preview-header">
                        <div class="preview-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                    <div class="preview-content">
                        <div class="preview-card">
                            <h3>Payment Links</h3>
                            <div class="preview-chart"></div>
                        </div>
                        <div class="preview-card">
                            <h3>Payrolls</h3>
                            <div class="preview-progress"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>
.hero {
    min-height: 100vh;
    display: flex;
    align-items: center;
    position: relative;
    padding-top: 80px;
    overflow: hidden;
    opacity: 0;
    transform: translateY(50px);
    transition: all 0.8s ease;
}

.hero.visible {
    opacity: 1;
    transform: translateY(0);
}

.hero-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: -1;
}

.gradient-orb {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.6;
    animation: float 6s ease-in-out infinite;
}

.orb-1 {
    width: 300px;
    height: 300px;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    top: 20%;
    left: 10%;
    animation-delay: 0s;
}

.orb-2 {
    width: 400px;
    height: 400px;
    background: linear-gradient(135deg, #8b5cf6, #d946ef);
    top: 60%;
    right: 10%;
    animation-delay: 2s;
}

.orb-3 {
    width: 250px;
    height: 250px;
    background: linear-gradient(135deg, #3b82f6, #6366f1);
    bottom: 20%;
    left: 60%;
    animation-delay: 4s;
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0px) scale(1);
    }

    50% {
        transform: translateY(-20px) scale(1.05);
    }
}

.container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
}

.hero-content {
    z-index: 1;
}

.hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 1.5rem;
    color: #1f2937;
}

.highlight {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.hero-subtitle {
    font-size: 1.25rem;
    color: #6b7280;
    margin-bottom: 2.5rem;
    line-height: 1.6;
}

.hero-actions {
    display: flex;
    gap: 1rem;
    margin-bottom: 3rem;
}

.hero-stats {
    display: flex;
    gap: 3rem;
}

.stat {
    text-align: left;
}

.stat-number {
    font-size: 2rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.25rem;
}

.stat-label {
    font-size: 0.875rem;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.hero-visual {
    display: flex;
    justify-content: center;
    align-items: center;
}

.dashboard-preview {
    width: 100%;
    max-width: 500px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(99, 102, 241, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    overflow: hidden;
    animation: dashboard-float 3s ease-in-out infinite;
}

@keyframes dashboard-float {

    0%,
    100% {
        transform: translateY(0px) rotate(0deg);
    }

    50% {
        transform: translateY(-10px) rotate(1deg);
    }
}

.preview-header {
    padding: 1.5rem;
    border-bottom: 1px solid rgba(99, 102, 241, 0.1);
}

.preview-dots {
    display: flex;
    gap: 8px;
}

.preview-dots span {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    opacity: 0.7;
}

.preview-content {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.preview-card {
    background: rgba(99, 102, 241, 0.05);
    border-radius: 12px;
    padding: 1.5rem;
}

.preview-card h3 {
    margin-bottom: 1rem;
    color: #1f2937;
    font-size: 1.1rem;
    font-weight: 600;
}

.preview-chart {
    height: 60px;
    background: linear-gradient(90deg,
            rgba(99, 102, 241, 0.2) 0%,
            rgba(139, 92, 246, 0.2) 25%,
            rgba(99, 102, 241, 0.3) 50%,
            rgba(139, 92, 246, 0.1) 75%,
            rgba(99, 102, 241, 0.2) 100%);
    border-radius: 8px;
    position: relative;
    overflow: hidden;
}

.preview-chart::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    0% {
        left: -100%;
    }

    100% {
        left: 100%;
    }
}

.preview-progress {
    height: 8px;
    background: rgba(99, 102, 241, 0.1);
    border-radius: 4px;
    position: relative;
    overflow: hidden;
}

.preview-progress::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 75%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-radius: 4px;
    animation: progress-fill 3s ease-in-out infinite;
}

@keyframes progress-fill {
    0% {
        width: 0%;
    }

    50% {
        width: 75%;
    }

    100% {
        width: 75%;
    }
}

@media (max-width: 968px) {
    .container {
        grid-template-columns: 1fr;
        gap: 3rem;
        text-align: center;
    }

    .hero-title {
        font-size: 2.5rem;
    }

    .hero-subtitle {
        font-size: 1.1rem;
    }

    .hero-actions {
        justify-content: center;
        flex-wrap: wrap;
    }

    .hero-stats {
        justify-content: center;
    }
}

@media (max-width: 640px) {
    .hero-title {
        font-size: 2rem;
    }

    .hero-actions {
        flex-direction: column;
        align-items: center;
    }

    .hero-stats {
        flex-direction: column;
        gap: 1.5rem;
        align-items: center;
    }

    .stat {
        text-align: center;
    }
}
</style>