// ==UserScript==
// @name         Multi-Functionality Diep.io Script
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  Predator/Hunter stack, Primitive FOV, and Ratio counter in one script with toggleable menu.
// @author       MI300#4401, WSG, Snowfall
// @match        https://diep.io/*
// @grant        GM_addStyle
// @grant        unsafeWindow
// ==/UserScript==

// Global Variables
let scriptStates = {
    predatorStack: false,
    primitiveFov: false,
    ratioCounter: false,
    antiAntiCheat: false,
    gradientName: false,
    changeFont: false
};
let menuVisible = false;

// Predator and Hunter Stack Script
let isPredator = true;
let reload = 7;
const predator = [[50, 500, 1400, 2800], [50, 500, 1300, 2700], [50, 400, 1200, 2450], [50, 300, 1100, 2200], [50, 300, 1000, 2100], [50, 300, 900, 1800], [50, 300, 800, 1700], [50, 300, 750, 1500]];
const hunter = [[50, 1200], [50, 1100], [50, 1000], [50, 950], [50, 800], [50, 725], [50, 700], [50, 625]];

function shoot(w) {
    extern.onKeyDown(36);
    setTimeout(() => { extern.onKeyUp(36); }, w);
}

function clump() {
    if (!scriptStates.predatorStack) return;
    shoot(predator[reload][0]);
    setTimeout(() => { shoot(predator[reload][1]); }, predator[reload][2]);
    setTimeout(() => { extern.onKeyDown(5); extern.onKeyUp(5); }, predator[reload][3]);
}
function clump2() {
    if (!scriptStates.predatorStack) return;
    shoot(hunter[reload][0]);
    setTimeout(() => { extern.onKeyDown(5); extern.onKeyUp(5); }, hunter[reload][1]);
}

function adjustReload(delta) {
    reload = Math.max(0, Math.min(7, reload + delta));
}

// Primitive FOV Script
let dynamicZoom = 0.7;
const minDynamicZoom = 0.5;
const maxDynamicZoom = 1.0;
const zoomStep = 0.01;

function setZoom() {
    if (!scriptStates.primitiveFov) return;
    if (typeof extern !== 'undefined' && typeof extern.setScreensizeZoom === 'function') {
        extern.setScreensizeZoom(1.0, dynamicZoom);
    }
}

document.addEventListener('wheel', event => {
    if (!scriptStates.primitiveFov) return;
    dynamicZoom = event.deltaY < 0
        ? Math.min(dynamicZoom + zoomStep, maxDynamicZoom)
        : Math.max(dynamicZoom - zoomStep, minDynamicZoom);
    setZoom();
});

// Ratio Script
let startTime = 0;
let spawnedIn = false;
const counter = document.createElement('div');
counter.style.position = 'fixed';
counter.style.right = '10px';
counter.style.top = '50%';
counter.style.color = 'white';
counter.style.textShadow = '2px 2px 0 black';
counter.style.fontSize = '20px';
counter.style.zIndex = '1000';
counter.style.display = 'none';
document.body.appendChild(counter);

function formatTime(hours, minutes, seconds) {
    return hours > 0
        ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        : `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function updateCounter() {
    if (!scriptStates.ratioCounter) {
        counter.style.display = 'none';
        return;
    }
    counter.style.display = 'block';
    if (__common__.screen_state === 'in-game') {
        if (!spawnedIn) startTime = Date.now();
        spawnedIn = true;
    } else {
        spawnedIn = false;
    }

    if (spawnedIn) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const hours = Math.floor(elapsed / 3600);
        const minutes = Math.floor((elapsed % 3600) / 60);
        const seconds = elapsed % 60;
        counter.textContent = formatTime(hours, minutes, seconds);
    } else {
        counter.textContent = '00:00:00';
    }
}

setInterval(updateCounter, 1000);

// Anti-Anti-Cheat Script
const handler = {apply(r,o,args){Error.stackTraceLimit=0;return r.apply(o,args)}};Object.freeze = new Proxy(Object.freeze, handler);

// Gradient Name Script
const gradientNameScript = () => {
    const color1 = "#62CFF4";
    const color2 = "#2C67F2";

    const context = CanvasRenderingContext2D.prototype;
    let i,
        text = [
            "Score",
            "Lvl",
            "This is the tale of...",
            "Privacy Policy",
            "Terms of Service",
            "More games",
            "FFA",
            "Survival",
            "Domination",
            "Tag",
            "Maze",
            "Sandbox",
            "Copy party link",
            "Scoreboard",
            "Leader",
            "Game Mode",
            "(press enter to spawn)",
            "Game mode",
            "4 Teams",
            "2 Teams",
            "Changelog",
            "Last updated",
            "diep.io",
            "Connecting...",
            "*",
            "Level",
            "Time Alive",
            "Tank",
            "Copy Party Link",
            "(press enter to continue)",
            "You were killed by:",
        ];

    context.fillText = new Proxy(context.fillText, {
        apply(type, _this, args) {
            const grad = _this.createLinearGradient(0, 0, 200, 0);
            grad.addColorStop(0, color1);
            grad.addColorStop(1, color2);
            _this.fillStyle = grad;
            for (i = 0; i < text.length; i++) {
                if (args[0].startsWith(text[i])) _this.fillStyle = "white";
            }
            return type.apply(_this, args);
        },
    });
};

// Change Font Script
const changeFontScript = () => {
    const options = {
        fontFamily: "Mogra",
    };

    let font = document.createElement("link");
    font.rel = "stylesheet";
    font.href = `https://fonts.googleapis.com/css2?family=${options.fontFamily.split(" ").join("+")}&display=swap`;

    document.head.appendChild(font);

    GM_addStyle(`
#textInput {
    box-shadow: none !important;
    transform: translateY(-2.5px);
    font-family: ${options.fontFamily} !important;
}

`);

    const { set: fontSetter } = Object.getOwnPropertyDescriptor(CanvasRenderingContext2D.prototype, "font");
    Object.defineProperty(unsafeWindow.CanvasRenderingContext2D.prototype, "font", {
        set(value) {
            fontSetter.call(this, value.replace("Ubuntu", `'${options.fontFamily}'`));
        }
    });
};

// Menu Functionality
const menu = document.createElement('div');
menu.style.position = 'fixed';
menu.style.left = '50%';
menu.style.top = '50%';
menu.style.transform = 'translate(-50%, -50%)';
menu.style.padding = '20px';
menu.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
menu.style.color = 'white';
menu.style.fontSize = '16px';
menu.style.border = '1px solid white';
menu.style.zIndex = '10000';
menu.style.display = 'none';
document.body.appendChild(menu);

function toggleMenu() {
    menuVisible = !menuVisible;
    menu.style.display = menuVisible ? 'block' :
'none';
    menu.innerHTML = `
        <h3>Toggle Scripts</h3>
        <label>
            <input type="checkbox" id="togglePredatorStack" ${scriptStates.predatorStack ? 'checked' : ''}>
            Predator Stack
        </label><br>
        <label>
            <input type="checkbox" id="togglePrimitiveFov" ${scriptStates.primitiveFov ? 'checked' : ''}>
            Primitive FOV
        </label><br>
        <label>
            <input type="checkbox" id="toggleRatioCounter" ${scriptStates.ratioCounter ? 'checked' : ''}>
            Ratio Counter
        </label><br>
        <label>
            <input type="checkbox" id="toggleAntiAntiCheat" ${scriptStates.antiAntiCheat ? 'checked' : ''}>
            Anti-Anti-Cheat
        </label><br>
        <label>
            <input type="checkbox" id="toggleGradientName" ${scriptStates.gradientName ? 'checked' : ''}>
            Gradient Name
        </label><br>
        <label>
            <input type="checkbox" id="toggleChangeFont" ${scriptStates.changeFont ? 'checked' : ''}>
            Change Font
        </label><br>
        <button id="closeMenuButton">Close Menu</button>
    `;

    document.getElementById('togglePredatorStack').onchange = e => scriptStates.predatorStack = e.target.checked;
    document.getElementById('togglePrimitiveFov').onchange = e => scriptStates.primitiveFov = e.target.checked;
    document.getElementById('toggleRatioCounter').onchange = e => scriptStates.ratioCounter = e.target.checked;
    document.getElementById('toggleAntiAntiCheat').onchange = e => scriptStates.antiAntiCheat = e.target.checked;
    document.getElementById('toggleGradientName').onchange = e => scriptStates.gradientName = e.target.checked;
    document.getElementById('toggleChangeFont').onchange = e => scriptStates.changeFont = e.target.checked;
    document.getElementById('closeMenuButton').onclick = toggleMenu;
}

// Key Listener for Menu Toggle
document.addEventListener('keydown', event => {
    if (event.key === 'Tab' && event.shiftKey) {
        event.preventDefault();
        toggleMenu();
    }
});

// Initialize Scripts
function initializeScripts() {
    if (scriptStates.gradientName) gradientNameScript();
    if (scriptStates.changeFont) changeFontScript();
}

initializeScripts();

console.log("Multi-Functionality Diep.io Script Loaded!");


