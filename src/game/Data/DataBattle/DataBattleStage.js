import DataBattleStageStep from "./DataBattleStageStep.js";

class DataBattleStage {
    constructor({ stageId = "", timeLimit = null, steps = [] } = {}) {
        this.stageId = stageId;
        this.timeLimit = timeLimit;
        this.steps = steps;
    }

    addStep(step) {
        this.steps.push(step);
    }
}

export default DataBattleStage;
