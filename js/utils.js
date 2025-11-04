// utils.js

// 通用工具
export function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
export function changeDisplay(...args) { args.forEach(e => e[0].style.display = e[1]) }
export function startMsCountdown(durationMs, displayElement, onEnd) {
    const endTime = Date.now() + durationMs;
    const timerId = setInterval(() => {
        const remaining = endTime - Date.now();
        if (remaining <= 0) {
            if (typeof onEnd === "function") onEnd();
            return;
        }
        if (displayElement) { displayElement.textContent = `剩餘時間：${(remaining / 1000).toFixed(3)} 秒` }
    }, 50);
    return {endTime, timerId}
}

// 專用工具
export function toggleBtn(source, isActive) { 
    source.style.border = isActive ? "3.5px var(--even-level) solid" : "0";
    source.style.color = isActive ? "var(--even-level)" : "var(--odd-level)";
    source.style.backgroundColor = isActive ? "var(--odd-level)" : "var(--even-level)";
}