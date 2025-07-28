<script setup lang="ts">
const currentYear = new Date().getFullYear();

const socialLinks = [
    { name: 'Twitter', url: '#', icon: '𝕏' },
    { name: 'Discord', url: '#', icon: '💬' },
    { name: 'GitHub', url: '#', icon: '👨‍💻' },
    { name: 'Telegram', url: '#', icon: '📱' }
];

const quickLinks = [
    { name: 'Documentation', url: '#' },
    { name: 'API Reference', url: '#' },
    { name: 'Examples', url: '#' },
    { name: 'Status Page', url: '#' }
];

const companyLinks = [
    { name: 'About', url: '#' },
    { name: 'Blog', url: '#' },
    { name: 'Careers', url: '#' },
    { name: 'Contact', url: '#' }
];

const legalLinks = [
    { name: 'Privacy Policy', url: '#' },
    { name: 'Terms of Service', url: '#' },
    { name: 'Cookie Policy', url: '#' }
];
</script>

<template>
    <footer id="contact" class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <h3 class="brand-name">SeiMoney</h3>
                    <p class="brand-tagline">Simplifying Internet Money</p>
                    <p class="brand-description">
                        The most powerful Web3 payment infrastructure built on Sei Network.
                        Empowering creators, businesses, and developers worldwide.
                    </p>

                    <div class="social-links">
                        <a v-for="social in socialLinks" :key="social.name" :href="social.url" class="social-link"
                            :title="social.name">
                            {{ social.icon }}
                        </a>
                    </div>
                </div>

                <div class="footer-links">
                    <div class="link-group">
                        <h4 class="link-title">Developers</h4>
                        <ul class="link-list">
                            <li v-for="link in quickLinks" :key="link.name">
                                <a :href="link.url" class="footer-link">{{ link.name }}</a>
                            </li>
                        </ul>
                    </div>

                    <div class="link-group">
                        <h4 class="link-title">Company</h4>
                        <ul class="link-list">
                            <li v-for="link in companyLinks" :key="link.name">
                                <a :href="link.url" class="footer-link">{{ link.name }}</a>
                            </li>
                        </ul>
                    </div>

                    <div class="link-group">
                        <h4 class="link-title">Legal</h4>
                        <ul class="link-list">
                            <li v-for="link in legalLinks" :key="link.name">
                                <a :href="link.url" class="footer-link">{{ link.name }}</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="footer-bottom">
                <div class="footer-bottom-content">
                    <p class="copyright">
                        © {{ currentYear }} SeiMoney. All rights reserved.
                    </p>
                    <div class="footer-badges">
                        <span class="badge">Built on Sei Network</span>
                        <span class="badge">x402 Protocol</span>
                    </div>
                </div>
            </div>
        </div>
    </footer>
</template>

<style scoped>
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

.social-links {
    display: flex;
    gap: 1rem;
}

.social-link {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: white;
    text-decoration: none;
    transition: all 0.3s ease;
    font-size: 1.2rem;
}

.social-link:hover {
    background: rgba(99, 102, 241, 0.2);
    transform: translateY(-2px);
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

@media (max-width: 968px) {
    .footer-content {
        grid-template-columns: 1fr;
        gap: 3rem;
        text-align: center;
    }

    .footer-links {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 640px) {
    .footer {
        padding: 3rem 0 1.5rem;
    }

    .footer-links {
        grid-template-columns: 1fr;
        gap: 2rem;
    }

    .footer-bottom-content {
        flex-direction: column;
        text-align: center;
    }

    .footer-badges {
        justify-content: center;
    }
}
</style>