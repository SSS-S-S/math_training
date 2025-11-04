// basic_arithmetic.js

import {
    getRandomInt,
    toggleBtn,
    startMsCountdown,
    changeDisplay,
    generateOptions,
} from '/js/utils.js';

const algorithm = [false, false, false];
let numSize = null, time = null, times = null;
let lastBtn = { numSize: null, time: null, times: null };

const settingPage = document.getElementById("setting_page");
const setQus = document.querySelectorAll("button[data-type]");
const start = document.getElementById("start");

const trainingPage = document.getElementById("training_page");
const qusNum = document.getElementById("qus_num");
const qusCon = document.getElementById("qus_con");
const timerDisplay = document.getElementById("timer");
const qusTimeupCont = document.getElementById("qus_timeup_cont");
const qusConOpt = document.getElementById("qus_con_opt");
const qusConOptChildren = document.querySelectorAll("#qus_con_opt *");

const resultPage = document.getElementById("result_page");
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
        const questions = [];
        const activeAlgos = algorithm
            .map((v, i) => (v ? i : null))
            .filter((v) => v !== null);

        for (let i = 0; i < times; i++) {
            const randomIndex = activeAlgos[getRandomInt(0, activeAlgos.length - 1)];
            const randomSymbol = symbols[randomIndex];
            let random1, random2, ans;

            if (randomSymbol === "+") {
                random1 = getRandomInt(-numSize, numSize);
                random2 = getRandomInt(-numSize, numSize);
                ans = random1 + random2;
            } else if (randomSymbol === "-") {
                random1 = getRandomInt(-numSize, numSize);
                random2 = getRandomInt(-numSize, random1);
                ans = random1 - random2;
            } else {
                random1 = getRandomInt(-numSize, numSize);
                random2 = getRandomInt(-numSize, numSize);
                ans = random1 * random2;
            }
            
            const question = `${random1} ${randomSymbol} ${random2}`;
            const gr = generateOptions(ans);

            questions.push({ question, options: gr, ans });
        }
        return questions
    }

    if (!algorithm.some(Boolean) || numSize === null || time === null || times === null) {
        alert("請先完成所有設定！");
        return;
    }

    changeDisplay([settingPage, "none"], [trainingPage, "flex"], [resultPage, "none"]);

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
    changeDisplay([trainingPage, "none"], [resultPage, "flex"]);
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