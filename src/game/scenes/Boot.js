import { Scene } from "phaser";
import { LoadPreloader } from "./Preloader.js";

export class Boot extends Scene {
    constructor() {
        super("Boot");
    }

    preload() {
        LoadPreloader(this);
        console.log("Boot");
    }

    async create() {
        this.scene.start("Preloader");
    }
}

export default Boot;

