import DataBattleStageStep from "./DataBattleStageStep.js";

import DataBattleStage from "./DataBattleStage.js";

export class CenterDataBattle {
    constructor() {
        this.dataBattleDictionary = {};

        // console.log("CenterDataBattle");

        // Gọi hàm tạo dữ liệu ngay khi khởi tạo
        this.CreateDataBattle();
    }

    // Phương thức lấy phần tử từ dictionary theo id
    getBattleById(id) {
        //console.log("Current dictionary:", this.dataBattleDictionary);
        return this.dataBattleDictionary[id] || null;
    }

    CreateDataBattle() {
        this.Create_Battle_1();
        this.Create_Battle_2();
        this.Create_Battle_3();
        this.Create_Battle_4();
        this.Create_Battle_5();
        this.Create_Battle_6();
        this.Create_Battle_7();
        this.Create_Battle_8();
        this.Create_Battle_9();
        this.Create_Battle_10();
        this.Create_Battle_11();
        this.Create_Battle_12();
        this.Create_Battle_13();
        this.Create_Battle_14();
        this.Create_Battle_15();
        this.Create_Battle_16();
        this.Create_Battle_17();
        this.Create_Battle_18();
        this.Create_Battle_19();
        this.Create_Battle_20();
    }

    GetBattleName(levelId = 0) {
        let name = "";

        if (levelId <= 20) {
            name = "Earth";
        }

        return name;
    }

    Create_Battle_1() {
        let newBattle = [];

        //Create stage
        let stage_0 = new DataBattleStage({
            stageId: 0,
            timeLimit: 30,
        });

        //Create stage step
        let stage_0_step_0 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 0,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 100,
            shield: 0,
            hitCount: 1,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_0);

        //Create stage step
        let stage_0_step_1 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 100,
            shield: 0,
            hitCount: 1,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_1);

        newBattle.push(stage_0);

        // console.log("newBattle: ", newBattle);

        // Đẩy vào dictionary với khóa là id
        this.dataBattleDictionary[1] = newBattle;
    }

    Create_Battle_2() {
        let newBattle = [];

        //Create stage
        let stage_0 = new DataBattleStage({
            stageId: 0,
            timeLimit: 30,
        });

        //Create stage step
        let stage_0_step_0 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 0,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 200,
            shield: 0,
            hitCount: 1,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_0);

        //Create stage step
        let stage_0_step_1 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 200,
            shield: 0,
            hitCount: 1,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_1);

        newBattle.push(stage_0);

        // console.log("newBattle: ", newBattle);

        // Đẩy vào dictionary với khóa là id
        this.dataBattleDictionary[2] = newBattle;
    }

    Create_Battle_3() {
        let newBattle = [];

        //Create stage
        let stage_0 = new DataBattleStage({
            stageId: 0,
            timeLimit: 30,
        });

        //Create stage step
        let stage_0_step_0 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 0,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 300,
            shield: 0,
            hitCount: 1,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_0);

        //Create stage step
        let stage_0_step_1 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 300,
            shield: 0,
            hitCount: 1,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_1);

        newBattle.push(stage_0);

        // console.log("newBattle: ", newBattle);

        // Đẩy vào dictionary với khóa là id
        this.dataBattleDictionary[3] = newBattle;
    }

    Create_Battle_4() {
        let newBattle = [];

        //Create stage
        let stage_0 = new DataBattleStage({
            stageId: 0,
            timeLimit: 30,
        });

        //Create stage step
        let stage_0_step_0 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 0,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 400,
            shield: 0,
            hitCount: 1,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_0);

        //Create stage step
        let stage_0_step_1 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 400,
            shield: 0,
            hitCount: 1,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_1);

        //Create stage step
        let stage_0_step_2 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "drone_0",
            enemyType: "drone",
            health: 200,
            shield: 0,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_2);

        newBattle.push(stage_0);

        // console.log("newBattle: ", newBattle);

        // Đẩy vào dictionary với khóa là id
        this.dataBattleDictionary[4] = newBattle;
    }

    Create_Battle_5() {
        let newBattle = [];

        //Create stage
        let stage_0 = new DataBattleStage({
            stageId: 0,
            timeLimit: 30,
        });

        //Create stage step
        let stage_0_step_0 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 0,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 500,
            shield: 0,
            hitCount: 1,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_0);

        //Create stage step
        let stage_0_step_1 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 500,
            shield: 0,
            hitCount: 1,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_1);

        //Create stage step
        let stage_0_step_2 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "drone_0",
            enemyType: "drone",
            health: 250,
            shield: 0,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_2);

        newBattle.push(stage_0);

        // console.log("newBattle: ", newBattle);

        // Đẩy vào dictionary với khóa là id
        this.dataBattleDictionary[5] = newBattle;
    }

    Create_Battle_6() {
        let newBattle = [];

        //Create stage
        let stage_0 = new DataBattleStage({
            stageId: 0,
            timeLimit: 30,
        });

        //Create stage step
        let stage_0_step_0 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 0,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 600,
            shield: 600,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_0);

        //Create stage step
        let stage_0_step_1 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 600,
            shield: 600,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_1);

        //Create stage step
        let stage_0_step_2 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 10,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 600,
            shield: 600,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_2);

        //Create stage step
        let stage_0_step_3 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "drone_0",
            enemyType: "drone",
            health: 260,
            shield: 260,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_3);

        newBattle.push(stage_0);

        // console.log("newBattle: ", newBattle);

        // Đẩy vào dictionary với khóa là id
        this.dataBattleDictionary[6] = newBattle;
    }

    Create_Battle_7() {
        let newBattle = [];

        //Create stage
        let stage_0 = new DataBattleStage({
            stageId: 0,
            timeLimit: 30,
        });

        //Create stage step
        let stage_0_step_0 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 0,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 700,
            shield: 700,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_0);

        //Create stage step
        let stage_0_step_1 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 700,
            shield: 700,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_1);

        //Create stage step
        let stage_0_step_2 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 10,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 700,
            shield: 700,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_2);

        //Create stage step
        let stage_0_step_3 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "drone_0",
            enemyType: "drone",
            health: 270,
            shield: 270,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_3);

        newBattle.push(stage_0);

        // console.log("newBattle: ", newBattle);

        // Đẩy vào dictionary với khóa là id
        this.dataBattleDictionary[7] = newBattle;
    }

    Create_Battle_8() {
        let newBattle = [];

        //Create stage
        let stage_0 = new DataBattleStage({
            stageId: 0,
            timeLimit: 30,
        });

        //Create stage step
        let stage_0_step_0 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 0,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 800,
            shield: 800,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_0);

        //Create stage step
        let stage_0_step_1 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 800,
            shield: 800,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_1);

        //Create stage step
        let stage_0_step_2 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 10,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 800,
            shield: 800,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_2);

        //Create stage step
        let stage_0_step_3 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "drone_0",
            enemyType: "drone",
            health: 280,
            shield: 280,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_3);

        newBattle.push(stage_0);

        // console.log("newBattle: ", newBattle);

        // Đẩy vào dictionary với khóa là id
        this.dataBattleDictionary[8] = newBattle;
    }

    Create_Battle_9() {
        let newBattle = [];

        //Create stage
        let stage_0 = new DataBattleStage({
            stageId: 0,
            timeLimit: 30,
        });

        //Create stage step
        let stage_0_step_0 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 0,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 900,
            shield: 900,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_0);

        //Create stage step
        let stage_0_step_1 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 900,
            shield: 900,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_1);

        //Create stage step
        let stage_0_step_2 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 10,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 900,
            shield: 900,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_2);

        //Create stage step
        let stage_0_step_3 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "drone_0",
            enemyType: "drone",
            health: 290,
            shield: 290,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_3);

        newBattle.push(stage_0);

        // console.log("newBattle: ", newBattle);

        // Đẩy vào dictionary với khóa là id
        this.dataBattleDictionary[9] = newBattle;
    }

    Create_Battle_10() {
        let newBattle = [];

        //Create stage
        let stage_0 = new DataBattleStage({
            stageId: 0,
            timeLimit: 30,
        });

        //Create stage step
        let stage_0_step_0 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 0,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 1000,
            shield: 1000,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_0);

        //Create stage step
        let stage_0_step_1 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 1000,
            shield: 1000,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_1);

        //Create stage step
        let stage_0_step_2 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 10,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 1000,
            shield: 1000,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_2);

        //Create stage step
        let stage_0_step_3 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "drone_0",
            enemyType: "drone",
            health: 300,
            shield: 300,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_3);

        newBattle.push(stage_0);

        // console.log("newBattle: ", newBattle);

        // Đẩy vào dictionary với khóa là id
        this.dataBattleDictionary[10] = newBattle;
    }

    Create_Battle_11() {
        let newBattle = [];

        //Create stage
        let stage_0 = new DataBattleStage({
            stageId: 0,
            timeLimit: 30,
        });

        //Create stage step
        let stage_0_step_0 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 0,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 1100,
            shield: 1100,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_0);

        //Create stage step
        let stage_0_step_1 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 1100,
            shield: 1100,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_1);

        //Create stage step
        let stage_0_step_2 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 10,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 1100,
            shield: 1100,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_2);

        //Create stage step
        let stage_0_step_3 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "drone_0",
            enemyType: "drone",
            health: 310,
            shield: 310,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_3);

        //Create stage step
        let stage_0_step_4 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "drone_0",
            enemyType: "drone",
            health: 310,
            shield: 310,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_4);

        newBattle.push(stage_0);

        // console.log("newBattle: ", newBattle);

        // Đẩy vào dictionary với khóa là id
        this.dataBattleDictionary[11] = newBattle;
    }

    Create_Battle_12() {
        let newBattle = [];

        //Create stage
        let stage_0 = new DataBattleStage({
            stageId: 0,
            timeLimit: 30,
        });

        //Create stage step
        let stage_0_step_0 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 0,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 1200,
            shield: 1200,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_0);

        //Create stage step
        let stage_0_step_1 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 1200,
            shield: 1200,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_1);

        //Create stage step
        let stage_0_step_2 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 10,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 1200,
            shield: 1200,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_2);

        //Create stage step
        let stage_0_step_3 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "drone_0",
            enemyType: "drone",
            health: 320,
            shield: 320,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_3);

        //Create stage step
        let stage_0_step_4 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "drone_0",
            enemyType: "drone",
            health: 320,
            shield: 320,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_4);

        newBattle.push(stage_0);

        // console.log("newBattle: ", newBattle);

        // Đẩy vào dictionary với khóa là id
        this.dataBattleDictionary[12] = newBattle;
    }

    Create_Battle_13() {
        let newBattle = [];

        //Create stage
        let stage_0 = new DataBattleStage({
            stageId: 0,
            timeLimit: 30,
        });

        //Create stage step
        let stage_0_step_0 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 0,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 1300,
            shield: 1300,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_0);

        //Create stage step
        let stage_0_step_1 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 1300,
            shield: 1300,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_1);

        //Create stage step
        let stage_0_step_2 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 10,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 1300,
            shield: 1300,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_2);

        //Create stage step
        let stage_0_step_3 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "drone_0",
            enemyType: "drone",
            health: 330,
            shield: 330,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_3);

        //Create stage step
        let stage_0_step_4 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "drone_0",
            enemyType: "drone",
            health: 330,
            shield: 330,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_4);

        newBattle.push(stage_0);

        // console.log("newBattle: ", newBattle);

        // Đẩy vào dictionary với khóa là id
        this.dataBattleDictionary[13] = newBattle;
    }

    Create_Battle_14() {
        let newBattle = [];

        //Create stage
        let stage_0 = new DataBattleStage({
            stageId: 0,
            timeLimit: 30,
        });

        //Create stage step
        let stage_0_step_0 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 0,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 1400,
            shield: 1400,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_0);

        //Create stage step
        let stage_0_step_1 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 1400,
            shield: 1400,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_1);

        //Create stage step
        let stage_0_step_2 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 10,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 1400,
            shield: 1400,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_2);

        //Create stage step
        let stage_0_step_3 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "drone_0",
            enemyType: "drone",
            health: 340,
            shield: 340,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_3);

        //Create stage step
        let stage_0_step_4 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "drone_0",
            enemyType: "drone",
            health: 340,
            shield: 340,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_4);

        newBattle.push(stage_0);

        // console.log("newBattle: ", newBattle);

        // Đẩy vào dictionary với khóa là id
        this.dataBattleDictionary[14] = newBattle;
    }

    Create_Battle_15() {
        let newBattle = [];

        //Create stage
        let stage_0 = new DataBattleStage({
            stageId: 0,
            timeLimit: 30,
        });

        //Create stage step
        let stage_0_step_0 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 0,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 1500,
            shield: 1500,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_0);

        //Create stage step
        let stage_0_step_1 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 1500,
            shield: 1500,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_1);

        //Create stage step
        let stage_0_step_2 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 10,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 1500,
            shield: 1500,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_2);

        //Create stage step
        let stage_0_step_3 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "drone_0",
            enemyType: "drone",
            health: 350,
            shield: 350,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_3);

        //Create stage step
        let stage_0_step_4 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "drone_0",
            enemyType: "drone",
            health: 350,
            shield: 350,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_4);

        newBattle.push(stage_0);

        // console.log("newBattle: ", newBattle);

        // Đẩy vào dictionary với khóa là id
        this.dataBattleDictionary[15] = newBattle;
    }

    Create_Battle_16() {
        let newBattle = [];

        //Create stage
        let stage_0 = new DataBattleStage({
            stageId: 0,
            timeLimit: 30,
        });

        //Create stage step
        let stage_0_step_0 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 0,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 1600,
            shield: 1600,
            hitCount: 3,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_0);

        //Create stage step
        let stage_0_step_1 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "normal_0",
            enemyType: "normal",
            health: 1600,
            shield: 1600,
            hitCount: 3,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_1);

        //Create stage step
        let stage_0_step_2 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 10,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 1600,
            shield: 1600,
            hitCount: 3,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_2);

        //Create stage step
        let stage_0_step_3 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 10,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 1600,
            shield: 1600,
            hitCount: 3,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_3);

        //Create stage step
        let stage_0_step_4 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "drone_0",
            enemyType: "drone",
            health: 360,
            shield: 360,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_4);

        //Create stage step
        let stage_0_step_5 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "drone_0",
            enemyType: "drone",
            health: 360,
            shield: 360,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_5);

        newBattle.push(stage_0);

        // console.log("newBattle: ", newBattle);

        // Đẩy vào dictionary với khóa là id
        this.dataBattleDictionary[16] = newBattle;
    }

    Create_Battle_17() {
        let newBattle = [];

        //Create stage
        let stage_0 = new DataBattleStage({
            stageId: 0,
            timeLimit: 30,
        });

        //Create stage step
        let stage_0_step_0 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 0,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 1700,
            shield: 1700,
            hitCount: 3,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_0);

        //Create stage step
        let stage_0_step_1 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 1700,
            shield: 1700,
            hitCount: 3,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_1);

        //Create stage step
        let stage_0_step_2 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 10,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 1700,
            shield: 1700,
            hitCount: 3,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_2);

        //Create stage step
        let stage_0_step_3 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 10,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 1700,
            shield: 1700,
            hitCount: 3,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_3);

        //Create stage step
        let stage_0_step_4 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "drone_0",
            enemyType: "drone",
            health: 370,
            shield: 370,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_4);

        //Create stage step
        let stage_0_step_5 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "drone_0",
            enemyType: "drone",
            health: 370,
            shield: 370,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_5);

        newBattle.push(stage_0);

        // console.log("newBattle: ", newBattle);

        // Đẩy vào dictionary với khóa là id
        this.dataBattleDictionary[17] = newBattle;
    }

    Create_Battle_18() {
        let newBattle = [];

        //Create stage
        let stage_0 = new DataBattleStage({
            stageId: 0,
            timeLimit: 30,
        });

        //Create stage step
        let stage_0_step_0 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 0,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 1800,
            shield: 1800,
            hitCount: 3,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_0);

        //Create stage step
        let stage_0_step_1 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 1800,
            shield: 1800,
            hitCount: 3,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_1);

        //Create stage step
        let stage_0_step_2 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 10,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 1800,
            shield: 1800,
            hitCount: 3,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_2);

        //Create stage step
        let stage_0_step_3 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 10,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 1800,
            shield: 1800,
            hitCount: 3,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_3);

        //Create stage step
        let stage_0_step_4 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "drone_0",
            enemyType: "drone",
            health: 380,
            shield: 380,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_4);

        //Create stage step
        let stage_0_step_5 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "drone_0",
            enemyType: "drone",
            health: 380,
            shield: 380,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_5);

        newBattle.push(stage_0);

        // console.log("newBattle: ", newBattle);

        // Đẩy vào dictionary với khóa là id
        this.dataBattleDictionary[18] = newBattle;
    }

    Create_Battle_19() {
        let newBattle = [];

        //Create stage
        let stage_0 = new DataBattleStage({
            stageId: 0,
            timeLimit: 30,
        });

        //Create stage step
        let stage_0_step_0 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 0,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 1900,
            shield: 1900,
            hitCount: 3,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_0);

        //Create stage step
        let stage_0_step_1 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 1900,
            shield: 1900,
            hitCount: 3,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_1);

        //Create stage step
        let stage_0_step_2 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 10,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 1900,
            shield: 1900,
            hitCount: 3,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_2);

        //Create stage step
        let stage_0_step_3 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 10,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 1900,
            shield: 1900,
            hitCount: 3,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_3);

        //Create stage step
        let stage_0_step_4 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "drone_0",
            enemyType: "drone",
            health: 390,
            shield: 390,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_4);

        //Create stage step
        let stage_0_step_5 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "drone_0",
            enemyType: "drone",
            health: 390,
            shield: 390,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_5);

        newBattle.push(stage_0);

        // console.log("newBattle: ", newBattle);

        // Đẩy vào dictionary với khóa là id
        this.dataBattleDictionary[19] = newBattle;
    }

    Create_Battle_20() {
        let newBattle = [];

        //Create stage
        let stage_0 = new DataBattleStage({
            stageId: 0,
            timeLimit: 30,
        });

        //Create stage step
        let stage_0_step_0 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 0,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 2000,
            shield: 2000,
            hitCount: 3,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_0);

        //Create stage step
        let stage_0_step_1 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 2000,
            shield: 2000,
            hitCount: 3,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_1);

        //Create stage step
        let stage_0_step_2 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 10,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 2000,
            shield: 2000,
            hitCount: 3,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_2);

        //Create stage step
        let stage_0_step_3 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 10,
            enemyId: "normal_0",
            enemyType: "tank",
            health: 2000,
            shield: 2000,
            hitCount: 3,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_3);

        //Create stage step
        let stage_0_step_4 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "drone_0",
            enemyType: "drone",
            health: 400,
            shield: 400,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_4);

        //Create stage step
        let stage_0_step_5 = new DataBattleStageStep({
            id: 0,
            activeDelayTime: 5,
            enemyId: "drone_0",
            enemyType: "drone",
            health: 400,
            shield: 400,
            hitCount: 2,
            delayHit: 2,
        });

        stage_0.addStep(stage_0_step_5);

        newBattle.push(stage_0);

        // console.log("newBattle: ", newBattle);

        // Đẩy vào dictionary với khóa là id
        this.dataBattleDictionary[20] = newBattle;
    }
}

const centerDataBattle = new CenterDataBattle();
export default centerDataBattle;
