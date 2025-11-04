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
function shuffled(array) {
    const result = array.slice();
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

// 專用工具
export function toggleBtn(source, isActive) { 
    source.style.border = isActive ? "3.5px var(--even-level) solid" : "0";
    source.style.color = isActive ? "var(--even-level)" : "var(--odd-level)";
    source.style.backgroundColor = isActive ? "var(--odd-level)" : "var(--even-level)";
}
export function generateOptions(ans) {
    const choices = new Set([ans]);

    while (choices.size < 4) {
        const delta = getRandomInt(1, 15);
        const sign = Math.random() < 0.5 ? -1 : 1;
        let fakeAns = ans + delta * sign;
        choices.add(fakeAns);
    }

    const fn = shuffled(Array.from(choices));
    return fn;
}