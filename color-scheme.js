// Основные переменные
let currentHarmony = 'analogous';
let baseHue = 0;
let angleStep = 30;
let baseColor = { h: 0, s: 100, l: 50 };

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
    drawColorWheel();
    setupColorWheel();
    setupHarmonyButtons();
    setupSettings();
    updateColorScheme();
});

// Рисуем цветовое колесо
function drawColorWheel() {
    const canvas = document.getElementById('colorWheel');
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const outerRadius = canvas.width / 2 - 20;
    const innerRadius = 40;

    // Рисуем спектр
    for (let angle = 0; angle < 360; angle++) {
        const startAngle = (angle - 1) * Math.PI / 180;
        const endAngle = (angle + 1) * Math.PI / 180;

        ctx.beginPath();
        ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
        ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
        ctx.closePath();

        ctx.fillStyle = `hsl(${angle}, 100%, 50%)`;
        ctx.fill();
    }

    // Добавляем засечки
    ctx.save();
    ctx.translate(centerX, centerY);
    for (let i = 0; i < 36; i++) {
        const angle = i * 10 * Math.PI / 180;
        const innerR = outerRadius - 10;
        const outerR = outerRadius - 5;

        ctx.beginPath();
        ctx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
        ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
        ctx.strokeStyle = 'rgba(255,255,255,0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    ctx.restore();
}

// Обработка кликов по колесу
function setupColorWheel() {
    const canvas = document.getElementById('colorWheel');
    let isDragging = false;

    function getHueFromEvent(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left - canvas.width / 2;
        const y = clientY - rect.top - canvas.height / 2;
        const angle = Math.atan2(y, x) * 180 / Math.PI;
        return (angle + 360) % 360;
    }

    function handleStart(e) {
        isDragging = true;
        baseHue = getHueFromEvent(e);
        baseColor.h = baseHue;
        updateColorScheme();
        updateMainColorInfo();
    }

    function handleMove(e) {
        if (!isDragging) return;
        baseHue = getHueFromEvent(e);
        baseColor.h = baseHue;
        updateColorScheme();
        updateMainColorInfo();
    }

    function handleEnd() {
        isDragging = false;
    }

    canvas.addEventListener('mousedown', handleStart);
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleEnd);

    canvas.addEventListener('touchstart', handleStart, { passive: true });
    document.addEventListener('touchmove', handleMove, { passive: true });
    document.addEventListener('touchend', handleEnd);
}

// Кнопки выбора гармонии
function setupHarmonyButtons() {
    document.querySelectorAll('.harmony-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.harmony-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentHarmony = btn.dataset.harmony;
            updateColorScheme();
        });
    });
}

// Кнопки +/- для настроек
function setupSettings() {
    document.getElementById('hueMinus').onclick = () => adjustHue(-10);
    document.getElementById('huePlus').onclick = () => adjustHue(10);
    document.getElementById('angleMinus').onclick = () => adjustAngle(-5);
    document.getElementById('anglePlus').onclick = () => adjustAngle(5);
}

// Обновление всей схемы
function updateColorScheme() {
    const colors = generateColorPalette();
    renderPalette(colors);
    renderTints(colors);
    updateMainColorInfo();
    updateSchemeUrl();
    updateWheelMarkers(colors);
}

// Генерация палитры по типу гармонии
function generateColorPalette() {
    const colors = [];
    const h = baseHue;

    switch(currentHarmony) {
        case 'analogous':
            colors.push({ h: h, s: 100, l: 50 });
            colors.push({ h: (h + angleStep) % 360, s: 100, l: 50 });
            colors.push({ h: (h + angleStep * 2) % 360, s: 100, l: 50 });
            colors.push({ h: (h - angleStep + 360) % 360, s: 100, l: 50 });
            break;

        case 'monochromatic':
            colors.push({ h: h, s: 100, l: 50 });
            colors.push({ h: h, s: 100, l: 70 });
            colors.push({ h: h, s: 100, l: 30 });
            colors.push({ h: h, s: 60, l: 50 });
            break;

        case 'complementary':
            colors.push({ h: h, s: 100, l: 50 });
            colors.push({ h: (h + 180) % 360, s: 100, l: 50 });
            colors.push({ h: h, s: 100, l: 70 });
            colors.push({ h: (h + 180) % 360, s: 100, l: 70 });
            break;

        case 'triadic':
            colors.push({ h: h, s: 100, l: 50 });
            colors.push({ h: (h + 120) % 360, s: 100, l: 50 });
            colors.push({ h: (h + 240) % 360, s: 100, l: 50 });
            colors.push({ h: h, s: 60, l: 70 });
            break;

        case 'tetradic':
            colors.push({ h: h, s: 100, l: 50 });
            colors.push({ h: (h + 90) % 360, s: 100, l: 50 });
            colors.push({ h: (h + 180) % 360, s: 100, l: 50 });
            colors.push({ h: (h + 270) % 360, s: 100, l: 50 });
            break;

        case 'accent':
            colors.push({ h: h, s: 20, l: 50 });
            colors.push({ h: h, s: 100, l: 50 });
            colors.push({ h: (h + 150) % 360, s: 100, l: 50 });
            colors.push({ h: (h + 210) % 360, s: 100, l: 50 });
            break;
    }
    return colors;
}

// Показываем маркеры на колесе
function updateWheelMarkers(colors) {
    const container = document.getElementById('wheelMarkers');
    container.innerHTML = '';
    const centerX = 150;
    const centerY = 150;
    const radius = 105;

    colors.forEach((color, index) => {
        const hue = color.h;
        const angleRad = hue * Math.PI / 180;
        const x = centerX + Math.cos(angleRad) * radius;
        const y = centerY + Math.sin(angleRad) * radius;

        const marker = document.createElement('div');
        marker.className = 'wheel-marker';
        marker.style.left = x + 'px';
        marker.style.top = y + 'px';
        marker.style.backgroundColor = hslToHex(color.h, color.s, color.l);

        if (index === 0) marker.classList.add('marker-primary');

        // Перетаскивание маркера
        let isDragging = false;
        marker.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            isDragging = true;
            document.body.style.cursor = 'grabbing';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const canvas = document.getElementById('colorWheel');
            const rect = canvas.getBoundingClientRect();
            const cx = e.clientX - rect.left - canvas.width / 2;
            const cy = e.clientY - rect.top - canvas.height / 2;
            let angle = Math.atan2(cy, cx) * 180 / Math.PI;
            let newHue = (angle + 360) % 360;

            if (index === 0) {
                baseHue = newHue;
                baseColor.h = newHue;
            }
            updateColorScheme();
            updateMainColorInfo();
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                document.body.style.cursor = '';
            }
        });

        container.appendChild(marker);
    });
}

// Рисуем палитру
function renderPalette(colors) {
    const container = document.getElementById('paletteDisplay');
    container.innerHTML = '';
    colors.forEach(color => {
        const hex = hslToHex(color.h, color.s, color.l);
        const div = document.createElement('div');
        div.className = 'palette-color';
        div.style.backgroundColor = hex;
        div.innerHTML = `<span class="color-hex">${hex}</span>`;
        div.onclick = () => copyToClipboard(hex);
        container.appendChild(div);
    });
}

// Рисуем таблицу оттенков
function renderTints(colors) {
    const container = document.getElementById('tintsDisplay');
    container.innerHTML = '';
    const lightnessSteps = [95, 90, 85, 75, 65, 55, 45, 35, 25, 15, 10, 5];

    lightnessSteps.forEach(l => {
        const row = document.createElement('div');
        row.className = 'tint-row';
        colors.forEach(color => {
            const hex = hslToHex(color.h, color.s, l);
            const cell = document.createElement('div');
            cell.className = 'tint-cell';
            cell.style.backgroundColor = hex;
            cell.innerHTML = `<span class="tint-hex">${hex}</span>`;
            cell.onclick = () => copyToClipboard(hex);
            row.appendChild(cell);
        });
        container.appendChild(row);
    });
}

// Обновляем информацию о цвете
function updateMainColorInfo() {
    const hex = hslToHex(baseColor.h, baseColor.s, baseColor.l);
    const rgb = hslToRgb(baseColor.h / 360, baseColor.s / 100, baseColor.l / 100);

    document.getElementById('mainColorPreview').style.backgroundColor = hex;
    document.getElementById('rPercent').textContent = Math.round(rgb.r / 255 * 100);
    document.getElementById('gPercent').textContent = Math.round(rgb.g / 255 * 100);
    document.getElementById('bPercent').textContent = Math.round(rgb.b / 255 * 100);
    document.getElementById('hexDisplay').textContent = hex.replace('#', '');
}

// Обновляем ссылку
function updateSchemeUrl() {
    const hex = hslToHex(baseColor.h, baseColor.s, baseColor.l);
    document.getElementById('schemeUrl').textContent = `https://color-scheme.ru/${baseColor.h}-${currentHarmony}-${hex}`;
}

// Изменение оттенка
function adjustHue(delta) {
    baseHue = (baseHue + delta + 360) % 360;
    baseColor.h = baseHue;
    document.getElementById('hueValue').textContent = Math.round(baseHue) + '°';
    updateColorScheme();
}

// Изменение угла
function adjustAngle(delta) {
    angleStep = Math.max(5, Math.min(60, angleStep + delta));
    document.getElementById('angleValue').textContent = angleStep + '°';
    updateColorScheme();
}

// Копирование в буфер
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => showToast());
}

// Показ уведомления
function showToast() {
    const toast = document.getElementById('toast');
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

// Конвертация HSL в HEX
function hslToHex(h, s, l) {
    return rgbToHex(...Object.values(hslToRgb(h / 360, s / 100, l / 100)));
}

// Конвертация HSL в RGB
function hslToRgb(h, s, l) {
    let r, g, b;
    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

// Конвертация RGB в HEX
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}
