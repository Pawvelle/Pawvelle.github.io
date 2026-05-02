(function () {
    const STORAGE_KEY = 'pawvelle-language';
    const ATTRS = ['aria-label', 'alt', 'title'];
    const textOriginals = new WeakMap();
    const attrOriginals = new WeakMap();

    const en = {
        '返回首页': 'Back to home',
        '主导航': 'Primary navigation',
        '首页': 'Home',
        '项目': 'Projects',
        '笔记': 'Notes',
        '兴趣': 'Interests',
        '关于 Pawvelle': 'About Pawvelle',
        '主题标签': 'Topic tags',
        '喜欢的东西': 'Favorite things',
        '关于与站内入口': 'About and site links',
        '专注概览': 'Focus overview',
        '项目标签': 'Project tags',
        'Pawvelle 头像': 'Pawvelle avatar',
        '← 首页': '← Home',
        '← 回到首页': '← Back Home',
        '/ 关于': '/ About',
        '/ 项目': '/ Projects',
        '/ 笔记': '/ Notes',
        '/ 兴趣': '/ Interests',
        '你好鸭，我是': "Hello, I'm",
        '全部': 'All',
        '编程': 'Programming',
        '最近常驻的小星球': 'Current Little Worlds',
        '给日常自动化准备的 Python 小工具': 'Python tools for everyday automation',
        '日常使用': 'Daily use',
        '研究': 'Research',
        '认真记录小语言模型微调': 'Careful notes on small language model fine-tuning',
        '持续更新': 'Ongoing',
        '系统': 'Systems',
        '把想法变成清爽可用的小系统': 'Turning ideas into clean, usable systems',
        '施工中': 'In progress',
        '写作': 'Writing',
        '🏷 常看': '🏷 Frequent',
        '关于机器学习和好奇心的随手札记': 'Notes on machine learning and curiosity',
        '最近': 'Recent',
        '喜欢的小角落': 'Favorite Corners',
        '软软收藏': 'Soft Picks',
        '动画': 'Anime',
        '乐队番': 'Band anime',
        '舞台与日常': 'Stage and everyday life',
        '游戏': 'Games',
        '二次元游戏': 'Anime-style games',
        '崩坏：星穹铁道': 'Honkai: Star Rail',
        '角色造型': 'Character styling',
        '服装美学': 'Costume aesthetics',
        '视觉': 'Visuals',
        '粉彩配色': 'Pastel palettes',
        '可爱 UI 细节': 'Cute UI details',
        '最近沉迷中': 'Currently Into',
        '在看': 'Watching',
        '在玩': 'Playing',
        '喜欢': 'Loving',
        '星穹铁道': 'Star Rail',
        '粉彩 UI': 'Pastel UI',
        '个入口': 'entries',
        '专注': 'Focus',
        '今年': 'This year',
        '👋 状态不错': '👋 Feeling good',
        '现在': 'Now',
        '当前主线': 'Current Focus',
        '实用 Python 模式和小 API': 'Practical Python patterns and small APIs',
        '核心学习': 'Core study',
        '微调笔记和小实验': 'Fine-tuning notes and small experiments',
        '每周更新': 'Weekly updates',
        '关于': 'About',
        '这里收纳代码、语言、小工具和软软的视觉系统。页面刻意保持轻巧，方便以后慢慢长成更完整的小宇宙。': 'This space gathers code, language, small tools, and soft visual systems. The pages stay intentionally light so they can grow into a fuller little universe over time.',
        '这个地方是什么': 'What This Place Is',
        '介绍': 'Intro',
        '这里整理编程、机器学习、写作和视觉审美相关的实验。它不是冰冷的作品墙，更像一份会继续更新的生活索引。': 'A home for experiments around programming, machine learning, writing, and visual taste. It is less a cold portfolio wall and more a living index.',
        '当前关注': 'Current Focus',
        '实用 Python': 'Practical Python',
        '自动化模式、小工具和日常脚本。': 'Automation patterns, small tools, and daily scripts.',
        '代码': 'Code',
        '语言模型': 'Language Models',
        '微调、评估，以及围绕实验的笔记整理。': 'Fine-tuning, evaluation, and notes around experiments.',
        '学习': 'Learning',
        '视觉系统': 'Visual Systems',
        '柔和界面、舒适留白和细小的交互细节。': 'Soft interfaces, comfortable spacing, and small interaction details.',
        '设计': 'Design',
        '站内入口': 'Site Entrances',
        '链接': 'Links',
        '工具与系统': 'Tools and systems',
        '学习与写作': 'Learning and writing',
        '柔软视觉角落': 'Soft visual corner',
        '建造日志': 'Build Log',
        '小工具、实验和界面系统先放在这里。它像一层起始书架，之后可以慢慢长成更完整的案例记录。': 'Small tools, experiments, and interface systems live here first. This is an early shelf that can grow into fuller case notes.',
        'Python 工具箱': 'Python Toolbox',
        '用脚本和辅助 API 自动化重复工作、清理数据、测试小想法，把乱糟糟的步骤整理成可以反复使用的命令。': 'Scripts and helper APIs automate repeat work, clean data, test small ideas, and turn messy steps into reusable commands.',
        '自动化': 'Automation',
        '小系统': 'Small Systems',
        '把笔记、提示词、代码和轻量数据结构连起来的界面与流程。目标是让每个系统都清楚、好懂，也方便继续扩展。': 'Interfaces and workflows that connect notes, prompts, code, and lightweight data structures. The goal is for every system to stay clear, readable, and easy to extend.',
        '原型': 'Prototype',
        '项目队列': 'Project Queue',
        '下一步': 'Next',
        '个人网站页面': 'Personal website pages',
        '把网站从单个静态屏幕变成可以漫游的档案库。': 'Turn the site from a single static screen into a browsable archive.',
        '学习仪表盘': 'Learning dashboard',
        '安静地整理笔记、模型实验和阅读清单。': 'Quietly organize notes, model experiments, and reading lists.',
        '笔记本': 'Notebook',
        '一个轻量的小本子，用来放学习记录、写作碎片，以及那些还需要一点结构才能变成作品的想法。': 'A lightweight notebook for learning logs, writing fragments, and ideas that need a little structure before becoming finished work.',
        'LLM 笔记': 'LLM Notes',
        '记录微调笔记、提示词模式、评估习惯和语言模型小实验。重点是认真迭代，而不是追逐一闪而过的演示。': 'Notes on fine-tuning, prompt patterns, evaluation habits, and small language-model experiments. The focus is steady iteration, not chasing flashy demos.',
        '微调': 'Fine-tuning',
        '评估': 'Evaluation',
        '关于机器学习、软件工具、视觉系统和日常观察的短札。把技术工作里容易忘记的小发现，存成更容易回看的样子。': 'Short notes on machine learning, software tools, visual systems, and everyday observations. Small findings from technical work are saved in a form that is easier to revisit.',
        '短文': 'Short essays',
        '草稿': 'Drafts',
        '分区': 'Sections',
        '索引': 'Index',
        '小语言模型微调': 'Small language model fine-tuning',
        '研究笔记': 'Research notes',
        '随手札记和短文': 'Quick notes and essays',
        '写作书架': 'Writing shelf',
        '柔软角落': 'Soft Corner',
        '这里收藏影响本站气质的视觉世界、游戏、角色设计和一点点玩心。二次元的可爱感，会轻轻藏在这些细节里。': 'A collection of visual worlds, games, character design, and a little playfulness that shape the site mood. The anime-inspired softness is tucked into these details.',
        '逛逛': 'Browse',
        '分类': 'Categories',
        '乐队番的小宇宙': 'Little worlds of band anime',
        '舞台、练习室和热血日常。': 'Stages, practice rooms, and spirited everyday moments.',
        '尤其喜欢崩坏：星穹铁道。': 'Especially Honkai: Star Rail.',
        '服装细节、轮廓和材质感。': 'Costume details, silhouettes, and textures.',
        '配色、卡片、图标和小动效。': 'Palettes, cards, icons, and small motion details.',
        '喜欢乐队番里的舞台感、练习室日常、成员之间的羁绊，以及音乐响起来时那种热血又可爱的瞬间。': 'I like the stage presence, practice-room routines, bonds between members, and those spirited, cute moments when the music starts.',
        '偏爱二次元游戏，尤其是崩坏：星穹铁道。喜欢它的角色、宇宙旅途、剧情节奏，以及每次抽卡前的小小期待。': 'I lean toward anime-style games, especially Honkai: Star Rail: the characters, cosmic journey, story pacing, and the small anticipation before each pull.',
        '造型': 'Styling',
        '关注角色造型、服装美学、材质、妆面，以及从插画走到现实世界时那份视觉转译。': 'I pay attention to character styling, costume aesthetics, materials, makeup, and the visual translation from illustration into the real world.',
        '配色': 'Palette',
        '粉彩配色、可爱 UI 细节、柔软留白，以及让数字空间安静下来但不显空洞的视觉系统。': 'Pastel palettes, cute UI details, soft spacing, and visual systems that make digital space feel calm without feeling empty.'
    };

    const titleEn = {
        '关于 Pawvelle - Pawvelle': 'About Pawvelle - Pawvelle',
        '项目 - Pawvelle': 'Projects - Pawvelle',
        '笔记 - Pawvelle': 'Notes - Pawvelle',
        '兴趣 - Pawvelle': 'Interests - Pawvelle'
    };

    let originalTitle = document.title;
    let toggleButton = null;

    function readLanguage() {
        try {
            return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'zh';
        } catch (error) {
            return 'zh';
        }
    }

    function saveLanguage(lang) {
        try {
            localStorage.setItem(STORAGE_KEY, lang);
        } catch (error) {
            // Ignore storage failures so the toggle still works for the current page.
        }
    }

    function injectStyles() {
        if (document.getElementById('language-toggle-style')) return;

        const style = document.createElement('style');
        style.id = 'language-toggle-style';
        style.textContent = `
            .browser-bar {
                grid-template-columns: auto minmax(0, 1fr) auto;
            }

            .bar-actions {
                justify-self: end;
                display: inline-flex;
                align-items: center;
                gap: 8px;
                min-width: 0;
                z-index: 2;
            }

            .language-toggle {
                min-width: 54px;
                height: 30px;
                padding: 0 12px;
                border-radius: 999px;
                background: #171a17;
                color: #fffdf7;
                border: 1px solid rgba(255, 253, 247, 0.72);
                box-shadow: 0 8px 18px rgba(24, 36, 28, 0.16);
                font-size: 12px;
                font-weight: 800;
                line-height: 1;
                letter-spacing: 0;
                transition: transform 0.22s var(--ease), box-shadow 0.22s var(--ease), background 0.22s var(--ease);
            }

            .language-toggle:hover {
                transform: translateY(-1px);
                box-shadow: 0 12px 22px rgba(24, 36, 28, 0.2);
            }

            .language-toggle:focus-visible {
                outline: 2px solid rgba(119, 185, 155, 0.72);
                outline-offset: 3px;
            }

            @media (max-width: 620px) {
                .browser-bar {
                    grid-template-columns: auto minmax(0, 1fr) auto;
                    gap: 10px;
                }

                .bar-actions {
                    gap: 6px;
                }

                .language-toggle {
                    min-width: 48px;
                    padding: 0 10px;
                    font-size: 11.5px;
                }
            }

            @media (max-width: 380px) {
                .address {
                    font-size: 0;
                }

                .address svg {
                    display: block;
                }

                .language-toggle {
                    min-width: 44px;
                    padding: 0 9px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function setupToggle() {
        const bar = document.querySelector('.browser-bar');
        if (!bar) return null;

        bar.removeAttribute('aria-hidden');

        const traffic = bar.querySelector('.traffic');
        const address = bar.querySelector('.address');
        if (traffic) traffic.setAttribute('aria-hidden', 'true');
        if (address) address.setAttribute('aria-hidden', 'true');

        let actions = bar.querySelector('.bar-actions');
        if (!actions) {
            actions = document.createElement('div');
            actions.className = 'bar-actions';

            const backChip = bar.querySelector(':scope > .back-chip');
            if (backChip) {
                actions.appendChild(backChip);
            }

            bar.appendChild(actions);
        }

        let button = actions.querySelector('.language-toggle');
        if (!button) {
            button = document.createElement('button');
            button.type = 'button';
            button.className = 'language-toggle';
            actions.appendChild(button);
        }

        button.addEventListener('click', () => {
            const next = document.documentElement.lang === 'en' ? 'zh' : 'en';
            applyLanguage(next);
        });

        return button;
    }

    function shouldSkipTextNode(node) {
        const parent = node.parentElement;
        return !parent || Boolean(parent.closest('script, style, noscript, textarea, .language-toggle'));
    }

    function translateText(root, lang) {
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        let node = walker.nextNode();

        while (node) {
            if (!shouldSkipTextNode(node)) {
                if (!textOriginals.has(node)) {
                    textOriginals.set(node, node.nodeValue);
                }

                const original = textOriginals.get(node);
                const key = original.trim();
                const leading = original.match(/^\s*/)[0];
                const trailing = original.match(/\s*$/)[0];

                node.nodeValue = lang === 'en' && en[key] ? `${leading}${en[key]}${trailing}` : original;
            }

            node = walker.nextNode();
        }
    }

    function getOriginalAttr(el, attr) {
        let attrs = attrOriginals.get(el);
        if (!attrs) {
            attrs = {};
            attrOriginals.set(el, attrs);
        }

        if (!(attr in attrs)) {
            attrs[attr] = el.getAttribute(attr);
        }

        return attrs[attr];
    }

    function translateAttributes(root, lang) {
        root.querySelectorAll('[aria-label], [alt], [title]').forEach((el) => {
            if (el.closest('.language-toggle')) return;

            ATTRS.forEach((attr) => {
                if (!el.hasAttribute(attr)) return;

                const original = getOriginalAttr(el, attr);
                el.setAttribute(attr, lang === 'en' && en[original] ? en[original] : original);
            });
        });
    }

    function updateButton(lang) {
        if (!toggleButton) return;

        toggleButton.textContent = lang === 'en' ? '中文' : 'EN';
        toggleButton.setAttribute(
            'aria-label',
            lang === 'en' ? 'Switch to Chinese' : '切换到英文'
        );
        toggleButton.setAttribute('title', lang === 'en' ? 'Switch to Chinese' : '切换到英文');
    }

    function translateTitle(lang) {
        document.title = lang === 'en' && titleEn[originalTitle] ? titleEn[originalTitle] : originalTitle;
    }

    function applyLanguage(lang) {
        const normalized = lang === 'en' ? 'en' : 'zh';
        document.documentElement.lang = normalized === 'en' ? 'en' : 'zh-CN';
        translateText(document.body, normalized);
        translateAttributes(document.body, normalized);
        translateTitle(normalized);
        updateButton(normalized);
        saveLanguage(normalized);
    }

    function init() {
        injectStyles();
        toggleButton = setupToggle();
        applyLanguage(readLanguage());
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
