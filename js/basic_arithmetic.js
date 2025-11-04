// basic_arithmetic.js

import {
    getRandomInt,
    toggleBtn,
    startMsCountdown,
    changeDisplay
} from '/js/utils.js';

const algorithm = [false, false, false];
let numSize = null, time = null, times = null;
let lastBtn = { numSize: null, time: null, times: null };

const setQus = document.querySelectorAll("button[data-type]");
const front = document.getElementById("front");
const back = document.getElementById("back");
const qusNum = document.getElementById("qus_num");
const qusCon = document.getElementById("qus_con");
const timerDisplay = document.getElementById("timer");
const qusTimeupCont = document.getElementById("qus_timeup_cont");
const qusConOpt = document.getElementById("qus_con_opt");
const qusConOptChildren = document.querySelectorAll("#qus_con_opt *");
const start = document.getElementById("start");
const end = document.getElementById("end");
const totalQus = document.getElementById("total-qus");
const totalCor = document.getElementById("total-cor");
const rateCor = document.getElementById("rate-cor");
const totalTime = document.getElementById("total-time");
const averTime = document.getElementById("aver-time");
const restart = document.getElementById("restart");

const symbols = ["+", "-", "×"];
let questions = [];
let currentIndex = 0;
let currentCorrect = 0;
let averageData = [];
let timerId = null;
let endTime = null;

function setOptions(source, type, value) {
    switch (type) {
        case 0:
            algorithm[value] = !algorithm[value];
            toggleBtn(source, algorithm[value]);
            break;
        case 1:
            updateSingleSelect("numSize", source, value);
            break;
        case 2:
            updateSingleSelect("time", source, value);
            break;
        case 3:
            updateSingleSelect("times", source, value);
            break;
    }
}

function updateSingleSelect(key, source, value) {
    if (lastBtn[key]) toggleBtn(lastBtn[key], false);
    lastBtn[key] = source;
    toggleBtn(source, true);

    if (key === "numSize") numSize = value;
    else if (key === "time") time = value;
    else if (key === "times") times = value;
}

function testStart() {
    function generateQuestion() {
        function generateOptions(num1, num2, sym, ans) {
            const question = `${num1} ${sym} ${num2}`;
            const choices = new Set([ans]);

            while (choices.size < 4) {
                const delta = getRandomInt(1, 15);
                const sign = Math.random() < 0.5 ? -1 : 1;
                let fakeAns = ans + delta * sign;
                fakeAns = Math.max(0, fakeAns);
                choices.add(fakeAns);
            }

            const shuffled = Array.from(choices).sort(() => Math.random() - 0.5);
            return { question, options: shuffled };
        }

        const questions = [];
        const activeAlgos = algorithm
            .map((v, i) => (v ? i : null))
            .filter((v) => v !== null);

        for (let i = 0; i < times; i++) {
            const randomIndex = activeAlgos[getRandomInt(0, activeAlgos.length - 1)];
            const randomSymbol = symbols[randomIndex];
            let random1, random2, ans;

            if (randomSymbol === "+") {
                random1 = getRandomInt(1, numSize);
                random2 = getRandomInt(1, numSize);
                ans = random1 + random2;
            } else if (randomSymbol === "-") {
                random1 = getRandomInt(1, numSize);
                random2 = getRandomInt(1, random1);
                ans = random1 - random2;
            } else {
                random1 = getRandomInt(1, numSize);
                random2 = getRandomInt(1, numSize);
                ans = random1 * random2;
            }
            const gr = generateOptions(random1, random2, randomSymbol, ans);

            questions.push({ question: gr.question, options: gr.options, ans });
        }
        return questions
    }

    if (!algorithm.some(Boolean) || numSize === null || time === null || times === null) {
        alert("請先完成所有設定！");
        return;
    }

    changeDisplay([front, "none"], [back, "flex"], [end, "none"]);

    questions = generateQuestion();

    currentIndex = 0;
    currentCorrect = 0;
    averageData = [];

    nextQuestion();
}

function handleOptionClick(event) {
    if (timerId) clearInterval(timerId);

    const selectedOption = Number(event.target.textContent);
    const ans = questions[currentIndex - 1].ans;
    const pushData = Number(time - (((endTime - Date.now()) / 1000).toFixed(3)))
    averageData.push(pushData);
    if (selectedOption === ans) {
        currentCorrect++;
        nextQuestion();
    } else {
        changeDisplay([qusConOpt, "none"], [qusTimeupCont, "block"]);
        timerDisplay.textContent = `回答錯誤！答案為 ${ans}`;
        qusTimeupCont.removeEventListener("click", handleTimeupClick);
        qusTimeupCont.addEventListener("click", handleTimeupClick);
    }
}

function handleTimeupClick() {
    nextQuestion();
    changeDisplay([qusTimeupCont, "none"]);
    qusTimeupCont.removeEventListener("click", handleTimeupClick);
}

function showQuestion(index) {
    const q = questions[index - 1];
    qusNum.textContent = index;
    qusCon.textContent = q.question;
    qusConOptChildren.forEach(e => e.removeEventListener("click", handleOptionClick));
    qusConOptChildren.forEach(e => e.addEventListener("click", handleOptionClick));
    qusConOptChildren.forEach((e, i) => e.textContent = q.options[i]);
    changeDisplay([qusTimeupCont, "none"], [qusConOpt, "grid"]);
}

function nextQuestion() {
    if (timerId) clearInterval(timerId);
    if (currentIndex < questions.length) {
        currentIndex++;
        showQuestion(currentIndex);
        const functionReturn = startMsCountdown(time * 1000, timerDisplay, () => {
                const ans = questions[currentIndex - 1].ans;
                clearInterval(timerId);
                averageData.push(time);
                changeDisplay([qusConOpt, "none"], [qusTimeupCont, "block"]);
                timerDisplay.textContent = `時間到！答案為 ${ans}`;
                qusTimeupCont.removeEventListener("click", handleTimeupClick);
                qusTimeupCont.addEventListener("click", handleTimeupClick);
            }
        );
        endTime = functionReturn.endTime;
        timerId = functionReturn.timerId;
    } else {
        endTest();
    }
}

function endTest() {
    if (timerId) clearInterval(timerId);
    changeDisplay([back, "none"], [end, "flex"]);
    totalQus.textContent = times;
    totalCor.textContent = currentCorrect;
    const rate = times > 0 ? (currentCorrect / times * 100) : 0;
    rateCor.textContent = `${rate.toFixed(2)}%`;
    const totalTimeValue = averageData.reduce((acc, val) => acc + val, 0);
    totalTime.textContent = totalTimeValue.toFixed(3) + " 秒";
    const aver = times > 0 ? (totalTimeValue / times) : 0;
    averTime.textContent = `${aver.toFixed(3)} 秒`;
}

function init() {
    start.addEventListener("click", testStart);
    restart.addEventListener("click", testStart);
    setQus.forEach((e) => {
        const dataType = Number(e.getAttribute("data-type"));
        const dataValue = Number(e.getAttribute("data-value"));
        e.addEventListener("click", () => setOptions(e, dataType, dataValue));
    });
}

init();