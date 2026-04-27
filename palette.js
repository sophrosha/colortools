// Начальные значения (светло-фиолетовый)
let currentHue = 267;
let currentSaturation = 19; // По X (0-100%)
let currentLightness = 88;  // По Y (0-100%)

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    setupCopyButtons();
    updateColorDisplay(); // Инициализация
});

function setupEventListeners() {
    const hueSlider = document.getElementById('hueSlider');
    const hueSelector = document.getElementById('hueSelector');
    const colorGradient = document.getElementById('colorGradient');
    const colorSelector = document.getElementById('colorSelector');

    let isDragging = false;

    // --- Обработка Hue Slider (нижняя полоска) ---
    hueSlider.addEventListener('mousedown', startDrag);
    hueSlider.addEventListener('touchstart', startDrag, { passive: true });

    function startDrag(e) {
        isDragging = true;
        handleHueMove(e);
        document.addEventListener('mousemove', handleHueMove);
        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchmove', handleHueMove, { passive: true });
        document.addEventListener('touchend', stopDrag);
    }

    function handleHueMove(e) {
        if (!isDragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const rect = hueSlider.getBoundingClientRect();
        let x = clientX - rect.left;
        x = Math.max(0, Math.min(x, rect.width));

        const percentage = x / rect.width;
        currentHue = percentage * 360;

        hueSelector.style.left = (percentage * 100) + '%';

        // При смене оттенка обновляем фон квадрата
        updateGradientBackground();
        updateColorFromCoordinates();
    }

    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', handleHueMove);
        document.removeEventListener('mouseup', stopDrag);
        document.removeEventListener('touchmove', handleHueMove);
        document.removeEventListener('touchend', stopDrag);
    }

    // --- Обработка Gradient Picker (большой прямоугольник) ---
    colorGradient.addEventListener('mousedown', handleGradientMove);
    colorGradient.addEventListener('touchstart', handleGradientMove, { passive: true });

    function handleGradientMove(e) {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        const rect = colorGradient.getBoundingClientRect();

        let x = clientX - rect.left;
        let y = clientY - rect.top;

        // Ограничиваем в пределах прямоугольника
        x = Math.max(0, Math.min(x, rect.width));
        y = Math.max(0, Math.min(y, rect.height));

        // Сохраняем координаты как проценты
        currentSaturation = (x / rect.width) * 100;
        currentLightness = 100 - ((y / rect.height) * 100); // Инверсия Y

        // Двигаем кружок
        colorSelector.style.left = x + 'px';
        colorSelector.style.top = y + 'px';

        // Сбрасываем transform translate, так как мы позиционируем от верхнего левого угла самого элемента
        // Но лучше оставить translate, если используем top/left относительно родителя.
        // В CSS у нас top: 50% left: 50% transform: translate(-50%, -50%).
        // Если мы задаем left/top в пикселях, то transform нужно учесть.
        // Проще: просто задать left/top в пикселях, а transform убрать в момент перетаскивания?
        // Нет, в CSS уже задан transform. Значит left/top - это центр.
        colorSelector.style.left = x + 'px';
        colorSelector.style.top = y + 'px';
        // При перетаскивании mousemove дает координаты мыши, которые становятся центром кружка.
        // Так что все ок.

        updateColorValues();
    }
}

// Обновляем базовый цвет прямоугольника
function updateGradientBackground() {
    const gradientBox = document.getElementById('colorGradient');
    // Устанавливаем чистый цвет выбранного оттенка
    gradientBox.style.backgroundColor = `hsl(${currentHue}, 100%, 50%)`;
}

// Расчет цвета на основе координат X и Y
function updateColorFromCoordinates() {
    // В модели HSV (Hue, Saturation, Value):
    // X = Saturation (0% слева - белый, 100% справа - чистый)
    // Y = Value (0% сверху - светлый, 100% снизу - темный)

    // Но в CSS у нас:
    // Слева (x=0) - белый (Saturation 0)
    // Справа (x=100) - чистый цвет (Saturation 100)
    // Сверху (y=0) - светлый (Value 100)
    // Снизу (y=100) - темный (Value 0)

    // Мы используем currentSaturation (0-100) и currentLightness (как Value 0-100)
    // Для HSL конвертации нужно немного математики, но проще использовать HSV формулу

    const s = currentSaturation / 100;
    const v = currentLightness / 100;
    const h = currentHue / 360;

    const rgb = hsvToRgb(h, s, v);

    // Обновляем UI
    document.getElementById('colorPreview').style.backgroundColor = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    document.getElementById('hexValue').textContent = rgbToHex(rgb.r, rgb.g, rgb.b);
    document.getElementById('rgbValue').textContent = `${rgb.r}, ${rgb.g}, ${rgb.b}`;

    // HSL для отображения
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    document.getElementById('hslValue').textContent = `${hsl.h}°, ${hsl.s}%, ${hsl.l}%`;

    // HSV для отображения
    document.getElementById('hsvValue').textContent = `${Math.round(currentHue)}°, ${Math.round(currentSaturation)}%, ${Math.round(currentLightness)}%`;
}

// Запуск расчета цвета
function updateColorDisplay() {
    // Установка позиции hue selector
    document.getElementById('hueSelector').style.left = (currentHue / 360 * 100) + '%';
    updateGradientBackground();

    // Установка позиции color selector
    const gradientBox = document.getElementById('colorGradient');
    const x = (currentSaturation / 100) * gradientBox.offsetWidth;
    const y = ((100 - currentLightness) / 100) * gradientBox.offsetHeight;

    const selector = document.getElementById('colorSelector');
    selector.style.left = x + 'px';
    selector.style.top = y + 'px';

    updateColorValues();
}

// Обертка для обновления значений
function updateColorValues() {
    updateColorFromCoordinates();
}

// --- Вспомогательные функции ---

function hsvToRgb(h, s, v) {
    let r, g, b;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
}

function rgbToHsl(r, g, b) {
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max == min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function setupCopyButtons() {
    const buttons = document.querySelectorAll('.copy-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-type');
            let text = '';
            switch(type) {
                case 'hex': text = document.getElementById('hexValue').textContent; break;
                case 'rgb': text = document.getElementById('rgbValue').textContent; break;
                case 'hsl': text = document.getElementById('hslValue').textContent; break;
                case 'hsv': text = document.getElementById('hsvValue').textContent; break;
            }

            navigator.clipboard.writeText(text).then(() => {
                const toast = document.getElementById('toast');
                toast.classList.add('show');
                btn.classList.add('copied');
                setTimeout(() => {
                    toast.classList.remove('show');
                    btn.classList.remove('copied');
                }, 2000);
            });
        });
    });
}
