console.log("Anastasia loaded");

const MODE_CLASS = "anastasia-mode";
const BRAND_OLD = "DeepSeek";
const BRAND_NEW = "Anastasia";

let savedTitle = null;
let textRestore = [];
let rebrandObserver = null;
let debounceTimer = null;
let savedLogoEl = null;
let savedLogoHTML = null;
let savedPlaceholders = [];
let placeholderTimer = null;
let heartSwaps = [];

function attachFetchInterceptor() {
    window.__anastasiaMode = true;
    console.log("Anastasia: режим активирован, interceptor.js подхватит");
}

function detachFetchInterceptor() {
    window.__anastasiaMode = false;
    if (window.__anastasiaPromptReset) window.__anastasiaPromptReset();
}

const LOGO_CONTAINER_SELECTOR = '[class*="e066abb8"]';
const LOGO_TEXT = '<span style="font-size:24px;font-weight:300;line-height:1;display:inline-flex;align-items:center;margin-right:8px;color:#ff007f;opacity:0.85;">♡</span><span style="font-weight:600;font-size:17px;color:#ff007f;">Anastasia</span>';
const NEW_PLACEHOLDER = "Message Anastasia";
const BEST_TEXT = "Best";
const TEXT_MAP = [
    ["New chat", "Новый чатик"],
    ["Новый чат", "Новый чатик"],
    ["Where would you like to begin?", "Приветик чем сегодян займемся >.<"],
    ["Где бы вы хотели начать?", "Приветик чем сегодян займемся >.<"],
    ["Start chatting with Expert", "Приветик, чем сегодня займемся >.<"],
    ["Let's start chatting", "я тут как тут, соскучился? >.<"],
    ["Start chatting with Instant", "я тут как тут, соскучился? >.<"],
    ["Начнём общение", "я тут как тут, соскучился? >.<"],
    ["Start chatting with Vision", "ооо покажи что там у тебя >.<"],
    ["How can I help?", "ну колись, что там у тебя стряслось? >.<"],
    ["Чем могу помочь?", "ну колись, что там у тебя стряслось? >.<"],
    ["What's on your mind today?", "о чём думаешь? только честно! >.<"],
    ["What can I do for you?", "я рядом, давай устроим что-нибудь крутое >.<"],
    ["Whenever you're ready", "Я полностью готова к работе!"]
];

function isMode() {
    return document.documentElement.classList.contains(MODE_CLASS);
}

function isHiddenChain(el) {
    while (el) {
        if (el.id === "anastasia-button" || el.id === "anastasia-wordmark") {
            return true;
        }

        if (el.tagName === "SCRIPT" ||
            el.tagName === "STYLE" ||
            el.tagName === "TEMPLATE" ||
            el.tagName === "NOSCRIPT" ||
            el.tagName === "INPUT" ||
            el.tagName === "TEXTAREA" ||
            el.tagName === "SELECT" ||
            el.tagName === "OPTION" ||
            el.tagName === "CODE" ||
            el.tagName === "PRE") {
            return true;
        }

        if (el.isContentEditable) {
            return true;
        }

        if (el.hidden) {
            return true;
        }

        if (el.getAttribute && el.getAttribute("aria-hidden") === "true") {
            return true;
        }

        if (el.style) {
            const d = el.style.display;
            const v = el.style.visibility;

            if (d === "none" || v === "hidden") {
                return true;
            }
        }

        el = el.parentElement;
    }

    return false;
}

function applyRebrand() {
    if (savedTitle === null) {
        savedTitle = document.title;
    }

    document.title = document.title.split(BRAND_OLD).join(BRAND_NEW);

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;

    while ((node = walker.nextNode())) {
        if (isHiddenChain(node.parentElement)) continue;

        const value = node.nodeValue;

        if (value && value.includes(BRAND_OLD)) {
            textRestore.push({ node, value });
            node.nodeValue = value.split(BRAND_OLD).join(BRAND_NEW);
        }

        if (value) {
            const trimmed = value.trim();

            if (/^(Expert|Эксперт)$/i.test(trimmed)) {
                textRestore.push({ node, value });
                node.nodeValue = BEST_TEXT;
            } else {
                for (const pair of TEXT_MAP) {
                    if (trimmed === pair[0]) {
                        textRestore.push({ node, value });
                        node.nodeValue = pair[1];
                        break;
                    }
                }
            }
        }
    }

    replaceLogo();
    replaceWhale();
    replaceSidebarToggle();
}

function replaceLogo() {
    const logoContainer = document.querySelector(LOGO_CONTAINER_SELECTOR);
    if (!logoContainer) return;

    const svgEl = logoContainer.querySelector("svg");
    if (!svgEl) return;
    if (svgEl.dataset.anastasiaDone) return;

    if (savedLogoEl === null && savedLogoHTML === null) {
        savedLogoEl = svgEl;
        savedLogoHTML = svgEl.outerHTML;
    }

    const wrapper = document.createElement("span");
    wrapper.style.cssText = "display:inline-flex;align-items:center;";
    wrapper.innerHTML = LOGO_TEXT;

    svgEl.parentNode.replaceChild(wrapper, svgEl);
    wrapper.dataset.anastasiaDone = "1";
}

function makeHeart(size) {
    const heart = document.createElement("span");
    heart.className = "anastasia-heart";
    heart.innerText = "❤";
    heart.style.cssText =
        "font-size:" + size + "px;line-height:1;display:inline-flex;align-items:center;" +
        "justify-content:center;margin-right:8px;color:#ff007f;" +
        "transition:transform 0.2s ease;cursor:pointer;";

    heart.onmouseenter = () => { heart.style.transform = "scale(1.2)"; };
    heart.onmouseleave = () => { heart.style.transform = "scale(1)"; };

    return heart;
}

function swapToHeart(svg, size) {
    if (!svg || !svg.parentNode) return;
    if (svg.parentNode.querySelector(".anastasia-heart")) return;

    const heart = makeHeart(size);

    heartSwaps.push({ original: svg, heart });
    svg.parentNode.replaceChild(heart, svg);
}

function replaceWhale() {
    for (const svg of document.querySelectorAll('svg[viewBox="0 0 35 26"]')) {
        if (isHiddenChain(svg)) continue;

        swapToHeart(svg, 28);
    }
}

function replaceSidebarToggle() {
    for (const svg of document.querySelectorAll('svg[viewBox="0 0 27 24"]')) {
        if (isHiddenChain(svg)) continue;

        const heart = document.createElement("span");
        heart.className = "anastasia-heart";
        heart.innerText = "♡";
        heart.style.cssText =
            "font-size:24px;line-height:1;display:inline-flex;align-items:center;" +
            "justify-content:center;color:#ff007f;cursor:pointer;";

        heart.onclick = () => svg.click();

        heartSwaps.push({ original: svg, heart });
        svg.parentNode.replaceChild(heart, svg);
    }
}

function restoreHearts() {
    for (const swap of heartSwaps) {
        if (swap.heart.parentNode) {
            swap.heart.parentNode.replaceChild(swap.original, swap.heart);
        }
    }

    heartSwaps = [];
}

function fixPlaceholder() {
    for (const ta of document.querySelectorAll("textarea")) {
        const ph = ta.getAttribute("placeholder");

        if (!ph || !/message|deepseek/i.test(ph)) continue;

        if (!savedPlaceholders.some(entry => entry.el === ta)) {
            savedPlaceholders.push({ el: ta, value: ph });
        }

        ta.setAttribute("placeholder", NEW_PLACEHOLDER);
    }
}

function restorePlaceholders() {
    for (const entry of savedPlaceholders) {
        entry.el.setAttribute("placeholder", entry.value);
    }

    savedPlaceholders = [];
}

function restoreRebrand() {
    if (savedLogoEl && savedLogoHTML !== null) {
        const container = document.querySelector(LOGO_CONTAINER_SELECTOR);
        if (container) {
            const placeholder = container.querySelector("[data-anastasia-done]");
            if (placeholder && placeholder.parentNode) {
                const tmp = document.createElement("div");
                tmp.innerHTML = savedLogoHTML;
                const restored = tmp.firstChild;
                placeholder.parentNode.replaceChild(restored, placeholder);
            }
        }
    }

    savedLogoEl = null;
    savedLogoHTML = null;

    restoreHearts();

    for (const entry of textRestore) {
        entry.node.nodeValue = entry.value;
    }

    if (savedTitle !== null) {
        document.title = savedTitle;
        savedTitle = null;
    }

    textRestore = [];
}

function enterAnastasiaMode() {
    document.documentElement.classList.add(MODE_CLASS);
    applyRebrand();
    attachFetchInterceptor();
    fixPlaceholder();

    placeholderTimer = setInterval(fixPlaceholder, 200);

    if (!rebrandObserver) {
        rebrandObserver = new MutationObserver(() => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(applyRebrand, 150);
        });

        rebrandObserver.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });
    }

    button.textContent = "×";
    button.title = "Выйти из Anastasia";

    document.addEventListener("click", (e) => {
        if (e.target.closest && e.target.closest("[class*='new'], button")) {
            const txt = e.target.textContent || "";
            if (/new chat|новый чатик/i.test(txt)) {
                window.postMessage("anastasia:newchat", "*");
                console.log("Anastasia: новый чат → промпт будет в первом сообщении");
            }
        }
    }, true);

    console.log("Anastasia: режим ВКЛЮЧЁН");
}

function exitAnastasiaMode() {
    document.documentElement.classList.remove(MODE_CLASS);

    if (placeholderTimer) {
        clearInterval(placeholderTimer);
        placeholderTimer = null;
    }

    if (rebrandObserver) {
        rebrandObserver.disconnect();
        rebrandObserver = null;
    }

    restorePlaceholders();
    restoreRebrand();
    detachFetchInterceptor();

    button.textContent = "A";
    button.title = "Включить Anastasia";

    console.log("Anastasia: режим ВЫКЛЮЧЕН");
}

function toggleMode() {
    if (isMode()) {
        exitAnastasiaMode();
    } else {
        enterAnastasiaMode();
        window.postMessage("anastasia:sendprompt", "*");
    }
}

const button = document.createElement("button");
button.id = "anastasia-button";
button.textContent = "A";
button.title = "Включить Anastasia";

button.addEventListener("click", toggleMode);

document.body.appendChild(button);