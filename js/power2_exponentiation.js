// power2_exponentiation.js

import {
    getRandomInt,
    toggleBtn,
    startMsCountdown,
    changeDisplay
} from '/js/utils.js';

let numSize = null, time = null, times = null;
let lastBtn = { numSize: null, time: null, times: null };

const setQus = document.querySelectorAll("button[data-type]");
const settingPage = document.getElementById("setting_page");
const trainingPage = document.getElementById("training_page");
const qusNum = document.getElementById("qus_num");
const qusCon = document.getElementById("qus_con");
const timerDisplay = document.getElementById("timer");
const qusTimeupCont = document.getElementById("qus_timeup_cont");
const qusConOpt = document.getElementById("qus_con_opt");
const qusConOptChildren = document.querySelectorAll("#qus_con_opt *");
const start = document.getElementById("start");
const resultPage = document.getElementById("result_page");
const totalQus = document.getElementById("total-qus");
const totalCor = document.getElementById("total-cor");
const rateCor = document.getElementById("rate-cor");
const totalTime = document.getElementById("total-time");
const averTime = document.getElementById("aver-time");
const restart = document.getElementById("restart");

let questions = [];
let currentIndex = 0;
let currentCorrect = 0;
let averageData = [];
let timerId = null;
let endTime = null;

function setOptions(source, type, num) {
    const keys = ["numSize", "time", "times"];
    const key = keys[type];
    if (lastBtn[key]) toggleBtn(lastBtn[key], false);
    lastBtn[key] = source;
    toggleBtn(source, true);
    if (key === "numSize") numSize = num;
    else if (key === "time") time = num;
    else if (key === "times") times = num;
}

function testStart() {
    if (numSize === null || time === null || times === null) {
        alert("請先完成所有設定！");
        return;
    }
    changeDisplay([settingPage, "none"],[trainingPage, "flex"], [resultPage, "none"]);
    questions = [];
    for (let i = 0; i < times; i++) {
        const correctExp = getRandomInt(0, numSize);
        const ans = 2 ** correctExp;
        const optionsSet = new Set([ans]);
        while (optionsSet.size < 4) {
            let fakeExp;
            do {
                fakeExp = getRandomInt(0, numSize);
            } while (fakeExp === correctExp);
            optionsSet.add(2 ** fakeExp);
        }
        const opts = Array.from(optionsSet).sort(() => Math.random() - 0.5);
        questions.push({options: opts, exp: correctExp, ans});
    }
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
        changeDisplay([qusConOpt, "none"],[qusTimeupCont, "block"]);
        timerDisplay.textContent = `回答錯誤！答案為 ${ans}`;
        qusTimeupCont.removeEventListener("click", handleTimeupClick);
        qusTimeupCont.addEventListener("click", handleTimeupClick);
    }
}

function handleTimeupClick() {
    nextQuestion();
    changeDisplay([qusTimeupCont, "none"]);
    qusTimeupCont.removeEventListener("click", handleTimeupClick);
};

function showQuestion(index) {
    const q = questions[index - 1];
    qusNum.textContent = index;
    qusCon.innerHTML = `<span>2</span><sup>${q.exp}</sup>`;
    qusConOptChildren.forEach(e => e.removeEventListener("click", handleOptionClick));
    qusConOptChildren.forEach(e => e.addEventListener("click", handleOptionClick));
    qusConOptChildren.forEach((e, i) => e.textContent = q.options[i]);
    changeDisplay([qusTimeupCont, "none"],[qusConOpt, "grid"]);
}

function nextQuestion() {
    if (currentIndex < questions.length) {
        currentIndex++;
        showQuestion(currentIndex);
        const functionReturn = startMsCountdown(time * 1000, timerDisplay, () => {
            if (timerId) clearInterval(timerId);
            averageData.push(time);
            changeDisplay([qusConOpt, "none"],[qusTimeupCont, "block"]);
            const ans = questions[currentIndex - 1].ans
            timerDisplay.textContent = `時間到！答案為 ${ans}`;
            qusTimeupCont.removeEventListener("click", handleTimeupClick); 
            qusTimeupCont.addEventListener("click", handleTimeupClick);
        });
        endTime = functionReturn.endTime;
        timerId = functionReturn.timerId;
    } else {
        endTest();
    }
}

function endTest() {
    if (timerId) clearInterval(timerId);
    changeDisplay([trainingPage, "none"],[resultPage, "flex"]);
    totalQus.textContent = times;
    totalCor.textContent = currentCorrect;
    const rate = currentCorrect / times * 100;
    rateCor.textContent = `${rate.toFixed(2)}%`
    let totalTimeValue = averageData.reduce((acc, val) => acc + val, 0);
    totalTime.textContent = totalTimeValue.toFixed(3) + " 秒";
    const aver = totalTimeValue / times;
    averTime.textContent = `${aver.toFixed(3)} 秒`
}

function init() {
    start.addEventListener("click", testStart);
    restart.addEventListener("click", testStart);

    setQus.forEach((e) => {
        const dataType = Number(e.getAttribute("data-type"));
        const dataValue = Number(e.getAttribute("data-value"));
        e.addEventListener("click", () => setOptions(e, dataType, dataValue));
    })
}

init()