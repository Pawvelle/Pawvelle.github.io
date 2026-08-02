const I18N = {
    en: {
        "meta.desc": "Pawvelle — a personal archive of code, projects, and technical exploration.",
        "access.skip": "Skip to content",
        "aria.primary": "Primary navigation",
        "aria.display": "Display controls",
        "nav.intro": "Intro",
        "nav.stack": "Tech Stack",
        "nav.timeline": "Timeline",
        "nav.work": "Projects",
        "nav.contact": "Contact",
        "intro.role": "CST Undergraduate | LLMs & Agent Development",
        "intro.copy": "CST undergraduate focused on LLMs and agent development. This site documents the projects I’m building and how they grow from ideas into systems.",
        "intro.link.work": "View Projects",
        "intro.link.contact": "Get in Touch",
        "intro.scroll": "Scroll to explore",
        "stack.title": "Tech Stack",
        "timeline.title": "TIMELINE",
        "timeline.1.title": "The 28th China Robot and Artificial Intelligence Competition",
        "timeline.1.desc": "Contributed to robot system optimization, winning the Hubei Provincial Second Prize.",
        "timeline.2.title": "The 14th Hubei \"Challenge Cup\" Business Plan Competition",
        "timeline.2.desc": "Participated in AI solution design and project innovation, winning the Hubei Provincial Second Prize.",
        "timeline.3.title": "The 28th Central South Regional Competition of Chinese Collegiate Computing Competition",
        "timeline.3.desc": "Contributed to project development and code organization, and received the Third Prize.",
        "timeline.4.title": "CRAIC Artificial Intelligence Innovation Competition (National Finals)",
        "timeline.4.desc": "Contributed to robot algorithm and neural network design, winning the National Second Prize.",
        "selected.title": "Projects",
        "selected.1.title": "Minecraft Agent",
        "selected.1.desc": "A locally running vision-language agent that explores perception, task planning, and action execution in Minecraft.",
        "selected.1.meta": "In Progress · 2026",
        "selected.2.title": "RolyPunch Arena",
        "selected.2.desc": "A 3D interactive scene built with C++ and OpenGL, featuring impact feedback, physical motion, and camera control.",
        "selected.3.title": "News Radar",
        "selected.3.desc": "A command-line tool for collecting, filtering, and archiving campus information.",
        "selected.4.title": "Jump Game",
        "selected.4.desc": "A browser game built around charging, motion, and landing-point calculation.",
        "contact.title": "LET’S CONNECT",
        "contact.copy": "Turning a few worthwhile ideas into things that can actually run.",
        "contact.email": "Email",
        "footer.brand.desc": "An archive of code, projects, and ongoing building.",
        "theme.to.dark": "Switch to dark mode",
        "theme.to.light": "Switch to light mode",
        "language.switch": "Switch language"
    },
    zh: {
        "meta.desc": "Pawvelle — 一个关于代码、项目与技术探索的个人档案。",
        "access.skip": "跳到主要内容",
        "aria.primary": "主导航",
        "aria.display": "显示设置",
        "nav.intro": "简介",
        "nav.stack": "技术栈",
        "nav.timeline": "时间线",
        "nav.work": "项目",
        "nav.contact": "联系",
        "intro.role": "计算机科学与技术本科生 | 大语言模型与智能体开发",
        "intro.copy": "计算机科学与技术本科生，关注大语言模型与智能体开发。这里记录我正在构建的项目，以及它们从想法走向系统的过程。",
        "intro.link.work": "查看项目",
        "intro.link.contact": "与我联系",
        "intro.scroll": "向下探索",
        "stack.title": "技术栈",
        "timeline.title": "时间线",
        "timeline.1.title": "第28届中国机器人及人工智能大赛",
        "timeline.1.desc": "参与机器人系统算法优化，获湖北省二等奖。",
        "timeline.2.title": "湖北省第十四届“挑战杯”大学生创业计划竞赛",
        "timeline.2.desc": "参与 AI 项目方案设计与创新实践，获湖北省二等奖。",
        "timeline.3.title": "第十九届中国大学生计算机设计大赛中南地区赛",
        "timeline.3.desc": "参与项目开发与代码整理，获得三等奖。",
        "timeline.4.title": "CRAIC 人工智能创新赛国赛",
        "timeline.4.desc": "参与机器人算法与神经网络设计，获全国二等奖。",
        "selected.title": "项目",
        "selected.1.title": "Minecraft Agent",
        "selected.1.desc": "一个在本地运行的视觉语言智能体，尝试在 Minecraft 中完成环境感知、任务规划与动作执行。",
        "selected.1.meta": "开发中 · 2026",
        "selected.2.title": "RolyPunch Arena",
        "selected.2.desc": "一个使用 C++ 与 OpenGL 构建的三维交互场景，包含受击反馈、物理摆动与视角控制。",
        "selected.3.title": "News Radar",
        "selected.3.desc": "一个用于收集、筛选和归档校园资讯的命令行工具。",
        "selected.4.title": "Jump Game",
        "selected.4.desc": "一个围绕蓄力、运动轨迹和落点判断构建的浏览器小游戏。",
        "contact.title": "保持联系",
        "contact.copy": "正在把一些值得继续做下去的想法，慢慢变成真正可运行的东西。",
        "contact.email": "邮箱",
        "footer.brand.desc": "代码、项目与持续构建的档案。",
        "theme.to.dark": "切换到深色模式",
        "theme.to.light": "切换到浅色模式",
        "language.switch": "切换语言"
    }
};

const LANG_STORAGE_KEY = "pawvelle-lang";
const THEME_STORAGE_KEY = "pawvelle-theme";
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
const themeColorMeta = document.querySelector("[data-theme-color]");
const themeToggles = document.querySelectorAll("[data-theme-toggle]");
const langToggles = document.querySelectorAll("[data-lang-toggle]");
const siteHeader = document.querySelector(".site-header");
const siteShell = document.getElementById("siteShell");
const splash = document.getElementById("splash");
const enterButtons = document.querySelectorAll("[data-enter-site]");

function readStorage(key) {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        return null;
    }
}

function writeStorage(key, value) {
    try {
        localStorage.setItem(key, value);
    } catch (error) {}
}

function storedTheme() {
    const saved = readStorage(THEME_STORAGE_KEY);
    return saved === "dark" || saved === "light" ? saved : null;
}

function detectTheme() {
    return storedTheme() || (systemThemeQuery.matches ? "dark" : "light");
}

function activeTheme() {
    return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function detectLang() {
    const saved = readStorage(LANG_STORAGE_KEY);
    if (saved === "en" || saved === "zh") return saved;
    return (navigator.language || "").toLowerCase().startsWith("zh") ? "zh" : "en";
}

let currentLang = detectLang();

function updateControlLabels() {
    const dict = I18N[currentLang] || I18N.en;
    const nextTheme = activeTheme() === "dark" ? "light" : "dark";
    const themeLabel = dict[nextTheme === "dark" ? "theme.to.dark" : "theme.to.light"];

    themeToggles.forEach((button) => {
        button.setAttribute("aria-label", themeLabel);
        button.setAttribute("title", themeLabel);
    });

    langToggles.forEach((button) => {
        button.setAttribute("aria-label", dict["language.switch"]);
        button.setAttribute("title", dict["language.switch"]);
    });
}

function applyTheme(theme, shouldSave = false) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;

    if (themeColorMeta) {
        themeColorMeta.setAttribute("content", theme === "dark" ? "#0A0A0A" : "#FFFFFF");
    }

    if (shouldSave) writeStorage(THEME_STORAGE_KEY, theme);
    updateControlLabels();
}

function applyLang(lang) {
    const dict = I18N[lang] || I18N.en;

    document.querySelectorAll("[data-i18n]").forEach((element) => {
        const key = element.getAttribute("data-i18n");
        if (dict[key] !== undefined) element.textContent = dict[key];
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
        const key = element.getAttribute("data-i18n-aria");
        if (dict[key] !== undefined) element.setAttribute("aria-label", dict[key]);
    });

    const meta = document.querySelector("[data-i18n-meta='desc']");
    if (meta && dict["meta.desc"]) meta.setAttribute("content", dict["meta.desc"]);

    document.documentElement.lang = lang === "zh" ? "zh-Hans" : "en";
    document.querySelectorAll("[data-lang-label]").forEach((label) => {
        label.textContent = lang === "zh" ? "EN" : "中文";
    });

    writeStorage(LANG_STORAGE_KEY, lang);
    updateControlLabels();
}

function enterSite() {
    if (!document.body.classList.contains("splash-open")) return;

    siteShell?.removeAttribute("inert");
    siteShell?.setAttribute("aria-hidden", "false");
    if (siteShell) siteShell.scrollTop = 0;

    document.body.classList.remove("splash-open");
    document.body.classList.add("portfolio-entered");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.setTimeout(() => {
        splash?.setAttribute("inert", "");
        splash?.setAttribute("aria-hidden", "true");
        document.getElementById("intro")?.focus({ preventScroll: true });
    }, reducedMotion ? 0 : 1000);
}

function resetEntryScroll() {
    window.scrollTo(0, 0);
    if (siteShell) siteShell.scrollTop = 0;
}

resetEntryScroll();

applyTheme(detectTheme());
applyLang(currentLang);

themeToggles.forEach((button) => {
    button.addEventListener("click", () => {
        applyTheme(activeTheme() === "dark" ? "light" : "dark", true);
    });
});

langToggles.forEach((button) => {
    button.addEventListener("click", () => {
        currentLang = currentLang === "zh" ? "en" : "zh";
        applyLang(currentLang);
    });
});

enterButtons.forEach((button) => button.addEventListener("click", enterSite));

const syncSystemTheme = () => {
    if (!storedTheme()) applyTheme(detectTheme());
};

if (systemThemeQuery.addEventListener) {
    systemThemeQuery.addEventListener("change", syncSystemTheme);
} else if (systemThemeQuery.addListener) {
    systemThemeQuery.addListener(syncSystemTheme);
}

siteShell?.addEventListener("scroll", () => {
    siteHeader?.classList.toggle("is-scrolled", siteShell.scrollTop > 16);
}, { passive: true });

window.addEventListener("pageshow", () => {
    if (document.body.classList.contains("splash-open")) resetEntryScroll();
});

window.addEventListener("beforeunload", resetEntryScroll);

(function setupReveals() {
    const targets = document.querySelectorAll("[data-reveal]");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
        targets.forEach((element) => element.classList.add("is-visible"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -8% 0px" });

    targets.forEach((element) => observer.observe(element));
})();

(function setupActiveNavigation() {
    const sections = document.querySelectorAll("#intro, #tech-stack, #timeline, #selected-work, #contact");
    const links = document.querySelectorAll(".primary-nav a[href^='#']");

    if (!sections.length || !links.length || !siteShell) return;

    const sectionList = Array.from(sections);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let navigationLock = null;
    let navigationLockTimer = null;
    let navigationFrame = null;

    function setActiveLink(href) {
        links.forEach((link) => {
            link.classList.toggle("is-active", link.getAttribute("href") === href);
        });
    }

    function updateActiveFromViewport() {
        if (navigationLock) return;

        const headerBottom = siteHeader?.getBoundingClientRect().bottom || 0;
        const activationLine = Math.max(headerBottom + 1, window.innerHeight * 0.3);
        const activeSection = sectionList.find((section) => {
            const rect = section.getBoundingClientRect();
            return rect.top <= activationLine && rect.bottom > activationLine;
        }) || sectionList.slice().sort((first, second) => (
            Math.abs(first.getBoundingClientRect().top - activationLine)
            - Math.abs(second.getBoundingClientRect().top - activationLine)
        ))[0];

        if (activeSection) setActiveLink(`#${activeSection.id}`);
    }

    function requestActiveUpdate() {
        if (navigationFrame !== null) return;

        navigationFrame = window.requestAnimationFrame(() => {
            navigationFrame = null;
            updateActiveFromViewport();
        });
    }

    links.forEach((link) => {
        link.addEventListener("click", () => {
            navigationLock = link.getAttribute("href");
            setActiveLink(navigationLock);

            window.clearTimeout(navigationLockTimer);
            navigationLockTimer = window.setTimeout(() => {
                navigationLock = null;
                requestActiveUpdate();
            }, reducedMotion ? 100 : 1000);
        });
    });

    siteShell.addEventListener("scroll", requestActiveUpdate, { passive: true });
    window.addEventListener("resize", requestActiveUpdate);
    requestActiveUpdate();
})();

(function setupContactCentering() {
    // The contact section is a tall, vertically-centered closing statement, so a
    // plain top-aligned anchor jump leaves its heading sitting oddly low (or, if
    // compensated with a fixed offset, risks revealing the footer on tall
    // viewports). Centering the target in the viewport keeps it looking right at
    // any window height.
    const contact = document.getElementById("contact");
    if (!contact) return;

    const links = document.querySelectorAll('a[href="#contact"]');
    if (!links.length) return;

    links.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            contact.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
            history.pushState(null, "", "#contact");
        });
    });
})();

(function setupProjectRailReel() {
    const stage = document.getElementById("projectScrollStage");
    const grid = document.getElementById("projectFeatureGrid");
    const feature = document.getElementById("projectFeature");
    const viewport = document.getElementById("projectRailViewport");
    const track = document.getElementById("projectRailTrack");

    if (!stage || !grid || !feature || !viewport || !track) return;

    const PIN_BREAKPOINT = 900;
    const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let extraScroll = 0;
    let headerHeight = 0;
    let ticking = false;

    function reset() {
        grid.classList.remove("is-pinned");
        grid.style.top = "";
        viewport.style.height = "";
        track.style.transform = "";
        stage.style.height = "";
        extraScroll = 0;
    }

    function measure() {
        const eligible = !reducedMotionQuery.matches && window.innerWidth > PIN_BREAKPOINT;

        if (!eligible) {
            reset();
            return;
        }

        const featureHeight = feature.offsetHeight;
        const trackHeight = track.scrollHeight;
        const extra = Math.round(trackHeight - featureHeight);

        if (extra <= 0) {
            reset();
            return;
        }

        // Recompute in place (never bounce height back to auto first): collapsing the
        // tall spacer momentarily would clamp the scroll position while the user is
        // mid-scroll inside the pinned range, yanking the page back up.
        headerHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) || 0;
        extraScroll = extra;

        grid.classList.add("is-pinned");
        grid.style.top = `${headerHeight}px`;
        viewport.style.height = `${featureHeight}px`;
        stage.style.height = `${featureHeight + extra}px`;

        applyProgress();
    }

    function applyProgress() {
        if (extraScroll <= 0) return;

        const stageTop = stage.getBoundingClientRect().top;
        const scrolledPast = headerHeight - stageTop;
        const progress = Math.min(1, Math.max(0, scrolledPast / extraScroll));

        track.style.transform = `translateY(-${(progress * extraScroll).toFixed(1)}px)`;
    }

    function onScroll() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(() => {
            applyProgress();
            ticking = false;
        });
    }

    siteShell?.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    reducedMotionQuery.addEventListener?.("change", measure);
    document.fonts?.ready?.then(measure).catch(() => {});

    if ("ResizeObserver" in window) {
        const resizeObserver = new ResizeObserver(() => measure());
        resizeObserver.observe(feature);
        resizeObserver.observe(track);
    }

    langToggles.forEach((button) => button.addEventListener("click", () => window.setTimeout(measure, 0)));

    measure();
})();
