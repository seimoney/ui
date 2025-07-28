<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const heroRef = ref<HTMLElement | null>(null);
const isVisible = ref(false);

const features = [
    {
        icon: 'mdi mdi-link-variant',
        title: 'Payment Links',
        description: 'Create and share payment links instantly. Accept crypto payments with just a click, perfect for freelancers, merchants, and content creators.',
        gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        image: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1'
    },
    {
        icon: 'mdi mdi-shield-lock',
        title: 'Premium Content Gating',
        description: 'Monetize your content effortlessly. Gate premium articles, videos, or digital products behind crypto payments with seamless user experience.',
        gradient: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
        image: 'https://images.pexels.com/photos/5380664/pexels-photo-5380664.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1'
    },
    {
        icon: 'mdi mdi-account-cash',
        title: 'Payroll Management',
        description: 'Streamline salary payments with automated crypto payroll. Schedule recurring payments, manage employee wallets, and ensure timely compensation.',
        gradient: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
        image: 'https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1'
    },
    {
        icon: 'mdi mdi-water-pump',
        title: 'DEFI Integration',
        description: 'Auto compound your stablecoins in real-time using powerful on-chain strategies. Your earnings grow passively the moment payments arrive.',
        gradient: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
        image: 'https://images.pexels.com/photos/6801642/pexels-photo-6801642.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&dpr=1'
    }
];

const techFeatures = [
    {
        title: 'Built on Sei Network',
        description: 'Lightning-fast transactions with minimal fees on the fastest blockchain',
        icon: 'mdi mdi-flash'
    },
    {
        title: 'x402 Protocol Integration',
        description: 'Advanced payment streaming technology for real-time financial flows',
        icon: 'mdi mdi-sync'
    },
    {
        title: 'Enterprise Security',
        description: 'Bank-grade security with multi-signature wallets and audit trails',
        icon: 'mdi mdi-shield-check'
    },
    {
        title: 'Developer Friendly',
        description: 'Comprehensive APIs and SDKs for seamless integration',
        icon: 'mdi mdi-code-tags'
    }
];

const observer = ref<IntersectionObserver | null>(null);

onMounted(() => {
    setTimeout(() => {
        isVisible.value = true;
    }, 300);

    observer.value = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        },
        { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.value?.observe(el);
    });
});

onUnmounted(() => {
    if (observer.value) {
        observer.value.disconnect();
    }
});
</script>

<template>
    <div class="landing-page">
        <!-- Header -->
        <header class="header">
            <div class="container">
                <nav class="nav">
                    <div class="logo">
                        <span class="logo-text">SeiMoney</span>
                    </div>

                    <div class="nav-actions">
                        <a href="https://www.x402.org" target="_blank" class="btn btn-outline">What's x402?</a>
                        <router-link to="/login" class="btn btn-primary">Launch App</router-link>
                    </div>
                </nav>
            </div>
        </header>

        <!-- Hero Section -->
        <section ref="heroRef" class="hero" :class="{ 'visible': isVisible }">
            <div class="hero-background">
                <div class="gradient-orb orb-1"></div>
                <div class="gradient-orb orb-2"></div>
                <div class="gradient-orb orb-3"></div>
            </div>

            <div class="container container-2">
                <div class="hero-content">
                    <h1 class="hero-title">
                        Simplifying
                        <span class="highlight">Internet Money</span>
                    </h1>

                    <p class="hero-subtitle">
                        The most powerful Web3 payment infrastructure built on Sei Network.
                        Create payment links, gate premium content, manage payroll, and stream money
                        with unprecedented ease and security.
                    </p>

                    <div class="hero-actions">
                        <router-link to="/login" class="btn btn-primary btn-large">Get Started Free</router-link>
                        <a href="#features" class="btn btn-outline btn-large">Explore Features</a>
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

        <!-- Features Section -->
        <section id="features" class="features animate-on-scroll">
            <div class="container">
                <h2 class="section-title">Powerful Features</h2>
                <p class="section-subtitle">
                    Everything you need to manage, send, and receive digital payments in the Web3 ecosystem
                </p>

                <div class="features-grid">
                    <div v-for="(feature, index) in features" :key="index" class="feature-card"
                        :style="{ '--delay': `${index * 0.1}s`, '--gradient': feature.gradient }">
                        <div class="feature-image">
                            <img :src="feature.image" :alt="feature.title" />
                            <div class="feature-icon">
                                <i :class="feature.icon"></i>
                            </div>
                        </div>
                        <h3 class="feature-title">{{ feature.title }}</h3>
                        <p class="feature-description">{{ feature.description }}</p>
                        <div class="feature-overlay"></div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Technology Section -->
        <section id="technology" class="technology animate-on-scroll">
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
                                <div class="tech-icon">
                                    <i :class="feature.icon"></i>
                                </div>
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

        <!-- Call to Action -->
        <section id="cta" class="cta animate-on-scroll">
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
                        <router-link to="/login" class="btn btn-primary btn-large">
                            Start Building Free
                        </router-link>
                        <a href="#" class="btn btn-outline btn-large">
                            View Documentation
                        </a>
                    </div>

                    <div class="cta-features">
                        <div class="feature-item">
                            <span class="feature-check">
                                <i class="mdi mdi-check"></i>
                            </span>
                            No setup fees
                        </div>
                        <div class="feature-item">
                            <span class="feature-check">
                                <i class="mdi mdi-check"></i>
                            </span>
                            5-minute integration
                        </div>
                        <div class="feature-item">
                            <span class="feature-check">
                                <i class="mdi mdi-check"></i>
                            </span>
                            24/7 developer support
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer class="footer">
            <div class="container">
                <div class="footer-content">
                    <div class="footer-brand">
                        <h3 class="brand-name">SeiMoney</h3>
                        <p class="brand-tagline">Simplifying Internet Money</p>
                        <p class="brand-description">
                            The most powerful Web3 payment infrastructure built on Sei Network.
                            Empowering creators, businesses, and developers worldwide.
                        </p>
                    </div>

                    <div class="footer-links">
                        <div class="link-group">
                            <h4 class="link-title">Products</h4>
                            <ul class="link-list">
                                <li><a href="#" class="footer-link">Payment Links</a></li>
                                <li><a href="#" class="footer-link">Content Gating</a></li>
                                <li><a href="#" class="footer-link">Payroll</a></li>
                            </ul>
                        </div>

                        <div class="link-group">
                            <h4 class="link-title">Developers</h4>
                            <ul class="link-list">
                                <li><a href="#" class="footer-link">Documentation</a></li>
                                <li><a href="#" class="footer-link">API Reference</a></li>
                            </ul>
                        </div>

                        <div class="link-group">
                            <h4 class="link-title">Company</h4>
                            <ul class="link-list">
                                <li><a href="#" class="footer-link">Blog</a></li>
                                <li><a href="#" class="footer-link">Contact</a></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="footer-bottom">
                    <div class="footer-bottom-content">
                        <p class="copyright">
                            © 2024 SeiMoney. All rights reserved.
                        </p>
                        <div class="footer-badges">
                            <span class="badge">Built on Sei Network</span>
                            <span class="badge">x402 Protocol</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    </div>
</template>

<style scoped>
.landing-page {
    min-height: 100vh;
    background: var(--bg-primary);
}

/* Header */
.header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border-color);
    transition: all 0.3s ease;
}

.dark .header {
    background: rgba(17, 24, 39, 0.95);
}

.nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 0;
}

.logo-text {
    font-size: 1.75rem;
    font-weight: 800;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.nav-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

/* Hero Section */
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
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
    display: grid;
    grid-template-columns: 1fr;
    gap: 4rem;
    align-items: center;
}

.container-2 {
    grid-template-columns: 1fr 1fr;
}

.hero-content {
    z-index: 1;
}

.hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 1.5rem;
    color: var(--text-primary);
}

.highlight {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.hero-subtitle {
    font-size: 1.25rem;
    color: var(--text-secondary);
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
    color: var(--text-primary);
    margin-bottom: 0.25rem;
}

.stat-label {
    font-size: 0.875rem;
    color: var(--text-secondary);
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

.dark .dashboard-preview {
    background: rgba(31, 41, 55, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.1);
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
    color: var(--text-primary);
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

/* Features Section */
.features {
    padding: 8rem 0;
    background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
    opacity: 0;
    transform: translateY(50px);
    transition: all 0.8s ease;
}

.features.visible {
    opacity: 1;
    transform: translateY(0);
}

.section-title {
    font-size: 2.5rem;
    font-weight: 700;
    text-align: center;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.section-subtitle {
    font-size: 1.2rem;
    text-align: center;
    color: var(--text-secondary);
    margin-bottom: 4rem;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    margin-top: 4rem;
}

.feature-card {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px);
    border-radius: 20px;
    padding: 0;
    border: 1px solid rgba(255, 255, 255, 0.2);
    position: relative;
    overflow: hidden;
    transition: all 0.4s ease;
    opacity: 0;
    transform: translateY(30px);
    animation: fadeInUp 0.6s ease-out var(--delay) forwards;
    cursor: pointer;
    display: flex;
    flex-direction: column;
}

.dark .feature-card {
    background: rgba(31, 41, 55, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.1);
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

.feature-image {
    position: relative;
    height: 200px;
    overflow: hidden;
    border-radius: 20px 20px 0 0;
}

.feature-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.feature-card:hover .feature-image img {
    transform: scale(1.05);
}

.feature-icon {
    position: absolute;
    top: 16px;
    right: 16px;
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: #6366f1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.feature-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 1.5rem 2rem 1rem;
    transition: color 0.3s ease;
}

.feature-card:hover .feature-title {
    background: var(--gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.feature-description {
    color: var(--text-secondary);
    line-height: 1.7;
    font-size: 1rem;
    margin: 0 2rem 2rem;
    flex: 1;
}

/* Technology Section */
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

.content-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
    position: relative;
    z-index: 1;
}

.section-title-left {
    font-size: 3rem;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 1.5rem;
    text-align: left;
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
    width: 48px;
    height: 48px;
    background: rgba(99, 102, 241, 0.1);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #6366f1;
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

/* Call to Action */
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

.cta-content {
    text-align: center;
    color: white;
    max-width: 800px;
    margin: 0 auto;
    position: relative;
    z-index: 1;
}

.cta-title {
    font-size: 3rem;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 1.5rem;
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
    font-size: 0.8rem;
    font-weight: bold;
}

/* Footer */
.footer {
    background: linear-gradient(180deg, #1f2937 0%, #111827 100%);
    color: white;
    padding: 4rem 0 2rem;
    position: relative;
}

.footer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.3), transparent);
}

.footer-content {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 4rem;
    margin-bottom: 3rem;
}

.footer-brand {
    max-width: 400px;
}

.brand-name {
    font-size: 2rem;
    font-weight: 800;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 0.5rem;
}

.brand-tagline {
    font-size: 1.1rem;
    color: #9ca3af;
    margin-bottom: 1rem;
    font-weight: 500;
}

.brand-description {
    color: #d1d5db;
    line-height: 1.6;
    margin-bottom: 2rem;
}

.footer-links {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
}

.link-group {
    min-width: 0;
}

.link-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: white;
    margin-bottom: 1rem;
}

.link-list {
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.footer-link {
    color: #d1d5db;
    text-decoration: none;
    transition: color 0.3s ease;
    font-size: 0.95rem;
}

.footer-link:hover {
    color: #6366f1;
}

.footer-bottom {
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    padding-top: 2rem;
}

.footer-bottom-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
}

.copyright {
    color: #9ca3af;
    font-size: 0.9rem;
}

.footer-badges {
    display: flex;
    gap: 1rem;
}

.badge {
    padding: 0.25rem 0.75rem;
    background: rgba(99, 102, 241, 0.1);
    border: 1px solid rgba(99, 102, 241, 0.2);
    border-radius: 20px;
    font-size: 0.8rem;
    color: #6366f1;
    font-weight: 500;
}

/* Buttons */
.btn {
    padding: 12px 24px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
    font-size: 16px;
    text-align: center;
    display: inline-block;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.btn-outline {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.3);
    backdrop-filter: blur(10px);
}

.header .btn-outline {
    border: 1px solid rgba(0, 0, 0, 0.1);
    color: #111827;
}

.btn-outline:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.5);
    color: white;
    transform: translateY(-2px);
}

.btn-large {
    padding: 16px 32px;
    font-size: 1.1rem;
}

/* Animations */
.animate-on-scroll {
    opacity: 0;
    transform: translateY(50px);
    transition: all 0.8s ease;
}

.animate-on-scroll.visible {
    opacity: 1;
    transform: translateY(0);
}

/* Responsive Design */
@media (max-width: 1024px) {
    .container {
        grid-template-columns: 1fr;
        gap: 3rem;
        text-align: center;
        padding: 0 16px;
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

    .footer-content {
        grid-template-columns: 1fr;
        gap: 3rem;
        text-align: center;
    }

    .footer-links {
        grid-template-columns: repeat(2, 1fr);
    }

    .features-grid {
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1rem;
    }

    .feature-card {
        margin: 0 auto;
        max-width: 350px;
    }
}

@media (max-width: 768px) {
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

    .tech-feature {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
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

    .footer-links {
        grid-template-columns: 1fr;
    }

    .footer-bottom-content {
        flex-direction: column;
        text-align: center;
    }

    .footer-badges {
        justify-content: center;
    }

    .features-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
    }

    .feature-image {
        height: 160px;
    }

    .feature-title {
        font-size: 1.25rem;
        margin: 1rem 1.5rem 0.75rem;
    }

    .feature-description {
        margin: 0 1.5rem 1.5rem;
        font-size: 0.9rem;
    }

    .container {
        padding: 0 12px;
    }
}
</style>