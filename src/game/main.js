import { Boot } from "./scenes/Boot";
import { Preloader } from "./scenes/Preloader";
import "./utils";

import RexUIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import "./plugins/spine/SpinePlugin.min.js"; // Import trực tiếp để nạp plugin vào môi trường toàn cục
import Phaser from "phaser";

import { Buffer } from "buffer";

window.Buffer = Buffer;

import WebFont from "webfontloader"; // Import WebFontLoader

// Mobile device detection for performance optimization
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
const isLowEnd = isMobile && (navigator.hardwareConcurrency || 2) <= 4;
const isTablet = isMobile && window.innerWidth >= 768;

// Log device detection for debugging
console.log('🔧 Device Detection:', {
    device: isMobile ? 'mobile' : 'desktop',
    type: isLowEnd ? 'low-end' : isTablet ? 'tablet' : isMobile ? 'mid-range' : 'desktop',
    cores: navigator.hardwareConcurrency || 'unknown',
    screen: `${window.innerWidth}x${window.innerHeight}`,
    userAgent: navigator.userAgent.substring(0, 50) + '...'
});

// Find out more information about the Game Config at:
// https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config = {
    type: Phaser.WEBGL,
    width: window.originWidth,
    height: window.originHeight,
    scale: {
        mode: Phaser.Scale.FIT, // Duy trì tỷ lệ
        autoCenter: Phaser.Scale.CENTER_BOTH, // Căn giữa trò chơi
    },
    render: {
        antialias: false, // Tắt khử răng cưa cho đồ họa pixel
        //pixelArt: true,   // Bật chế độ tối ưu cho pixel art
        powerPreference: isLowEnd ? "low-power" : isMobile ? "default" : "high-performance", // Adaptive GPU mode for mobile optimization
        batchSize: 4096, // Tăng số lượng đối tượng vẽ trong một lần
    },
    parent: "game-container",
    backgroundColor: "#000000",
    scene: [Boot, Preloader],
    audio: {
        disableWebAudio: false,
        noAudio: false,
    },
    dom: {
        createContainer: true,
    },
    plugins: {
        scene: [
            {
                plugin: RexUIPlugin,
                key: "rexUI",
                mapping: "rexUI",
            },
            {
                key: "SpinePlugin",
                plugin: window.SpinePlugin,
                mapping: "spine",
            },
        ],
    },
    loader: {
        crossOrigin: "anonymous",
    },
    fps: {
        target: isLowEnd ? 30 : isTablet ? 45 : isMobile ? 45 : 60, // Adaptive FPS based on device capability
        forceSetTimeOut: isMobile, // Use setTimeout on mobile for better battery life
        min: isLowEnd ? 15 : isMobile ? 20 : 30, // Adaptive minimum FPS
        smoothStep: true, // Keep smooth FPS transitions
    },
};

const StartGame = (parent) => {
    return new Phaser.Game({ ...config, parent });
};

export default StartGame;

// Sử dụng WebFontLoader để tải font trước khi khởi động game
const LoadFontsAndStartGame = () => {
    WebFont.load({
        google: {
            families: [
                "Russo One",
                "Noto Sans:900",
                "Noto Sans SC",
                "Noto Sans KR",
                "Noto Sans JP",
            ], // Thêm các font Google Fonts khác nếu cần
        },
        active: () => {
            console.log("Fonts loaded successfully!");
        },
        inactive: () => {
            console.error("Failed to load fonts!");
        },
    });
};

// Gọi hàm để bắt đầu quá trình tải font và khởi động game
LoadFontsAndStartGame();

window.deferredPrompt = null;
const beforeInstallPromptHandler = (e) => {
    // Prevent the browser's default install prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    window.deferredPrompt = e;
    console.log("PWA install prompt captured and stored on window.");

    // Dispatch a custom event to notify any part of the app that is listening
    window.dispatchEvent(new Event("pwa-install-ready"));
};

window.addEventListener("beforeinstallprompt", beforeInstallPromptHandler);

