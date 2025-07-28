import { ref } from "vue";

const isDark = ref(false);

export function useTheme() {
  const toggleTheme = () => {
    isDark.value = !isDark.value;
    updateTheme();
  };

  const updateTheme = () => {
    if (isDark.value) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const initTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    isDark.value = savedTheme === "dark";
    updateTheme();
  };

  return {
    isDark,
    toggleTheme,
    initTheme,
  };
}
