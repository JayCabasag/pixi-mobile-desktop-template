import '@pixi/spine-pixi';

import { Application } from 'pixi.js';
import { initAssets } from './utils/assets';
import { navigation } from './utils/navigation';
import { GameScreen } from './screens/GameScreen';
import { HomeScreen } from './screens/HomeScreen';
import { LoadScreen } from './screens/LoadScreen';
import { ResultScreen } from './screens/ResultScreen';
import { TiledBackground } from './ui/TiledBackground';
import { getUrlParam } from './utils/getUrlParams';
import { sound } from '@pixi/sound';
import { device } from './utils/device';

/** The PixiJS app Application instance, shared across the project */
export const app = new Application();

/** Set up a resize function for the desktop app */
function resize() {
    // Use visualViewport when available for better accuracy
    const windowWidth = window.visualViewport?.width || window.innerWidth;
    const windowHeight = window.visualViewport?.height || window.innerHeight;

    // Set base dimensions for design scaling
    const baseWidth = 1920;
    const baseHeight = 1080;

    // Determine scale ratio
    const scale = Math.min(windowWidth / baseWidth, windowHeight / baseHeight);

    // Apply scaled size
    const scaledWidth = baseWidth * scale;
    const scaledHeight = baseHeight * scale;

    // Resize canvas visually
    app.renderer.canvas.style.width = `${scaledWidth}px`;
    app.renderer.canvas.style.height = `${scaledHeight}px`;

    // Resize renderer (still logical size)
    app.renderer.resize(baseWidth, baseHeight);

    // Resize your custom logic
    navigation.resize(baseWidth, baseHeight);

    // Reset scroll for mobile
    window.scrollTo(0, 0);
}

/** Set up a resize function for the app */
function resizeMobile() {
    const portraitWidth = 750;
    const portraitHeight = 1400;

    const landscapeWidth = 1400;
    const landscapeHeight = 750;

    const vw = window.visualViewport?.width || window.innerWidth;
    const vh = window.visualViewport?.height || window.innerHeight;

    const isLandscape = vw > vh;

    const baseWidth = isLandscape ? landscapeWidth : portraitWidth;
    const baseHeight = isLandscape ? landscapeHeight : portraitHeight;

    // Always render at fixed size
    app.renderer.resize(baseWidth, baseHeight);
    navigation.resize(baseWidth, baseHeight);

    const scale = Math.min(vw / baseWidth, vh / baseHeight);
    const scaledWidth = baseWidth * scale;
    const scaledHeight = baseHeight * scale;

    const canvas = app.view;
    canvas.style.width = `${baseWidth}px`;
    canvas.style.height = `${baseHeight}px`;
    canvas.style.transformOrigin = 'top left';
    canvas.style.transform = `scale(${scale})`;

    canvas.style.position = 'absolute';
    canvas.style.left = `${(vw - scaledWidth) / 2}px`;
    canvas.style.top = `${(vh - scaledHeight) / 2}px`;

    window.scrollTo(0, 0);
}

/** Fire when document visibility changes - lose or regain focus */
function visibilityChange() {
    if (document.hidden) {
        sound.pauseAll();
        navigation.blur();
    } else {
        sound.resumeAll();
        navigation.focus();
    }
}

/** Setup app and initialise assets */
async function init() {
    // Initialize app
    await app.init({
        resolution: Math.max(window.devicePixelRatio, 2),
        backgroundColor: 0xffffff,
    });

    // This is for checking
    /** @ts-ignore */
    globalThis.__PIXI_APP__ = app;

    // Add pixi canvas element (app.canvas) to the document's body
    document.body.appendChild(app.canvas);

    if (device.isMobileDevice()) {
        device.isMobile = true;
        window.addEventListener('resize', resizeMobile);
        resizeMobile();
    } else {
        device.isMobile = false;
        window.addEventListener('resize', resize);
        resize();
    }

    // Add a visibility listener, so the app can pause sounds and screens
    document.addEventListener('visibilitychange', visibilityChange);

    // Setup assets bundles (see assets.ts) and start up loading everything in background
    await initAssets((progress) => {
        console.log(progress);
    });

    // Add a persisting background shared by all screens
    navigation.setBackground(TiledBackground);

    // Show initial loading screen
    await navigation.showScreen(LoadScreen);

    // Go to one of the screens if a shortcut is present in url params, otherwise go to home screen
    if (getUrlParam('game') !== null) {
        await navigation.showScreen(GameScreen);
    } else if (getUrlParam('load') !== null) {
        await navigation.showScreen(LoadScreen);
    } else if (getUrlParam('result') !== null) {
        await navigation.showScreen(ResultScreen);
    } else {
        await navigation.showScreen(HomeScreen);
    }
}

// Init everything
init();
