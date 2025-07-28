<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const isScrolled = ref(false);
const isMobileMenuOpen = ref(false);

const handleScroll = () => {
    isScrolled.value = window.scrollY > 50;
};

const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

onMounted(() => {
    window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
    <header class="header" :class="{ 'scrolled': isScrolled }">
        <div class="container">
            <nav class="nav">
                <div class="logo">
                    <span class="logo-text">SeiMoney</span>
                </div>

                <div class="nav-links" :class="{ 'mobile-open': isMobileMenuOpen }">
                    <a href="#features" @click="isMobileMenuOpen = false">Features</a>
                    <a href="#technology" @click="isMobileMenuOpen = false">Technology</a>
                    <a href="#about" @click="isMobileMenuOpen = false">About</a>
                    <a href="#contact" @click="isMobileMenuOpen = false">Contact</a>
                </div>

                <div class="nav-actions">
                    <a href="#" class="btn btn-outline">Launch App</a>
                </div>

                <button class="mobile-menu-btn" @click="toggleMobileMenu">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </nav>
        </div>
    </header>
</template>

<style scoped>
.header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(99, 102, 241, 0.1);
    transition: all 0.3s ease;
}

.header.scrolled {
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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

.nav-links {
    display: flex;
    gap: 2rem;
    list-style: none;
}

.nav-links a {
    text-decoration: none;
    color: #4b5563;
    font-weight: 500;
    transition: color 0.3s ease;
    position: relative;
}

.nav-links a:hover {
    color: #6366f1;
}

.nav-links a::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    transition: width 0.3s ease;
}

.nav-links a:hover::after {
    width: 100%;
}

.nav-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.mobile-menu-btn {
    display: none;
    flex-direction: column;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
}

.mobile-menu-btn span {
    width: 24px;
    height: 2px;
    background: #6366f1;
    margin: 3px 0;
    transition: 0.3s;
    border-radius: 2px;
}

@media (max-width: 768px) {
    .nav-links {
        position: fixed;
        top: 80px;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(10px);
        flex-direction: column;
        padding: 2rem;
        border-bottom: 1px solid rgba(99, 102, 241, 0.1);
        transform: translateY(-100%);
        opacity: 0;
        transition: all 0.3s ease;
    }

    .nav-links.mobile-open {
        transform: translateY(0);
        opacity: 1;
    }

    .nav-actions {
        display: none;
    }

    .mobile-menu-btn {
        display: flex;
    }
}
</style>