import { Scene } from "phaser";
import { LoadPreloader } from "./Preloader.js";
import BaseScene from "./BaseScene.js";

export class Boot extends BaseScene {
    constructor() {
        super({ key: "Boot" });
    }

    preload() {
        LoadPreloader(this);
        console.log("Boot");
    }

    async create() {
        // ✅ Safe scene transition with stop
        this.safeStartScene("Preloader");
    }
}

export default Boot;

