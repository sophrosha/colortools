// === ПЕРЕМЕННЫЕ СОСТОЯНИЯ ===
let hue = 0;
let saturation = 100;
let value = 100;

// === DOM ЭЛЕМЕНТЫ ===
const wheelCanvas = document.getElementById('colorWheel');
const wheelCtx = wheelCanvas.getContext('2d');
const squareCanvas = document.getElementById('colorSquare');
const squareCtx = squareCanvas.getContext('2d');
const wheelMarker = document.getElementById('wheelMarker');
const squareMarker = document.getElementById('squareMarker');
const colorPreview = document.getElementById('colorPreview');
const hexInput = document.getElementById('hexInput');
const rInput = document.getElementById('rInput');
const gInput = document.getElementById('gInput');
const bInput = document.getElementById('bInput');
const toast = document.getElementById('toast');

// === HSV TO RGB ===
function hsvToRgb(h, s, v) {
    h = ((h % 360) + 360) % 360;
    s /= 100;
    v /= 100;

    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;

    let r, g, b;

    if (h < 60) { r = c; g = x; b = 0; }
    else if (h < 120) { r = x; g = c; b = 0; }
    else if (h < 180) { r = 0; g = c; b = x; }
    else if (h < 240) { r = 0; g = x; b = c; }
    else if (h < 300) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }

    return [
        Math.round((r + m) * 255),
        Math.round((g + m) * 255),
        Math.round((b + m) * 255)
    ];
}

// === RGB TO HEX ===
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
}

// === РИСУЕМ КОЛЕСО (HUE) ===
function drawWheel() {
    const w = wheelCanvas.width;
    const h = wheelCanvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) / 2 - 2;

    wheelCtx.clearRect(0, 0, w, h);

    for (let angle = 0; angle < 360; angle += 1) {
        const startAngle = (angle - 2) * Math.PI / 180;
        const endAngle = (angle + 2) * Math.PI / 180;

        wheelCtx.beginPath();
        wheelCtx.moveTo(cx, cy);
        wheelCtx.arc(cx, cy, radius, startAngle, endAngle);
        wheelCtx.closePath();

        const [r, g, b] = hsvToRgb(angle, 100, 100);
        wheelCtx.fillStyle = `rgb(${r},${g},${b})`;
        wheelCtx.fill();
    }

    // Вырезаем центр (под квадрат)
    wheelCtx.globalCompositeOperation = 'destination-out';
    wheelCtx.beginPath();
    wheelCtx.arc(cx, cy, 68, 0, Math.PI * 2);
    wheelCtx.fill();
    wheelCtx.globalCompositeOperation = 'source-over';
}

// === РИСУЕМ КВАДРАТ НАСЫЩЕННОСТИ/ЯРКОСТИ ===
function drawSquare() {
    const w = squareCanvas.width;
    const h = squareCanvas.height;
    squareCtx.clearRect(0, 0, w, h);

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const s = (x / w) * 100;
            const v = 100 - (y / h) * 100;
            const [r, g, b] = hsvToRgb(hue, s, v);
            squareCtx.fillStyle = `rgb(${r},${g},${b})`;
            squareCtx.fillRect(x, y, 1, 1);
        }
    }
}

// === ОБНОВЛЕНИЕ МАРКЕРОВ ===
function updateMarkers() {
    // Маркер колеса - угол считается от оси X (0° = право), поэтому hue - 0
    const wheelRadius = 128;
    const angle = hue * Math.PI / 180; // Убрали -90, чтобы 0° = красный справа
    const wx = 140 + wheelRadius * Math.cos(angle);
    const wy = 140 + wheelRadius * Math.sin(angle);
    wheelMarker.style.left = wx + 'px';
    wheelMarker.style.top = wy + 'px';

    // Маркер квадрата
    const sx = (saturation / 100) * 130;
    const sy = (1 - value / 100) * 130;
    squareMarker.style.left = sx + 'px';
    squareMarker.style.top = sy + 'px';

    // Цвет маркера квадрата
    const [mr, mg, mb] = hsvToRgb(hue, saturation, value);
    squareMarker.style.background = `rgb(${mr},${mg},${mb})`;
}

// === ОБНОВЛЕНИЕ ЦВЕТА ===
function updateColor() {
    const [r, g, b] = hsvToRgb(hue, saturation, value);
    const hex = rgbToHex(r, g, b);

    // Обновляем превью
    colorPreview.style.background = `rgb(${r},${g},${b})`;

    // Обновляем инпуты
    hexInput.value = hex;
    rInput.value = r;
    gInput.value = g;
    bInput.value = b;

    // Обновляем маркеры
    updateMarkers();
}

// === ОБРАБОТКА ПЕРЕТАСКИВАНИЯ КОЛЕСА ===
let isDraggingWheel = false;

wheelCanvas.addEventListener('mousedown', (e) => {
    isDraggingWheel = true;
    handleWheelMove(e);
});

function handleWheelMove(e) {
    const rect = wheelCanvas.getBoundingClientRect();
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const x = e.clientX - rect.left - cx;
    const y = e.clientY - rect.top - cy;

    // Угол от оси X (0° = право)
    let angle = Math.atan2(y, x) * 180 / Math.PI;
    if (angle < 0) angle += 360;

    hue = angle;
    drawSquare();
    updateColor();
}

// === ОБРАБОТКА ПЕРЕТАСКИВАНИЯ КВАДРАТА ===
let isDraggingSquare = false;

document.getElementById('squareContainer').addEventListener('mousedown', (e) => {
    isDraggingSquare = true;
    handleSquareMove(e);
});

function handleSquareMove(e) {
    const rect = squareCanvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));

    saturation = (x / rect.width) * 100;
    value = 100 - (y / rect.height) * 100;

    updateColor();
}

// === ГЛОБАЛЬНЫЕ СОБЫТИЯ ДЛЯ ПЕРЕТАСКИВАНИЯ ===
document.addEventListener('mousemove', (e) => {
    if (isDraggingWheel) handleWheelMove(e);
    if (isDraggingSquare) handleSquareMove(e);
});

document.addEventListener('mouseup', () => {
    isDraggingWheel = false;
    isDraggingSquare = false;
});

// === КОПИРОВАНИЕ ===
function copyToClipboard(inputId) {
    const input = document.getElementById(inputId);
    const btn = input.nextElementSibling;

    navigator.clipboard.writeText(input.value).then(() => {
        btn.classList.add('copied');
        toast.classList.add('show');

        setTimeout(() => {
            btn.classList.remove('copied');
            toast.classList.remove('show');
        }, 2000);
    });
}

// === ИНИЦИАЛИЗАЦИЯ ===
drawWheel();
drawSquare();
updateColor();
