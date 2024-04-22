if (document.cookie.split(";").some((item) => item.trim().startsWith("theme="))) {
    if (document.cookie.split(";").some((item) => item.includes("theme=dark"))) {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.add("light");
    }
} else {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add("dark");
        } else {
        document.documentElement.classList.add("light");
    }
}

function toggleTheme() {
    if (document.documentElement.classList.contains("light")) {
        document.documentElement.classList.remove("light");
        document.documentElement.classList.add("dark");
        document.cookie = "theme=dark;path=/";
    } else if (document.documentElement.classList.contains("dark")) {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
        document.cookie = "theme=light;path=/";
    }
}