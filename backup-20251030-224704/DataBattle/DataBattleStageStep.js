class DataBattleStageStep {
    constructor({
        id = "",
        activeDelayTime = 0,
        enemyId = "",
        enemyType = "",
        health = 0,
        shield = 0,
        hitCount = 0,
        delayHit = 0,
    } = {}) {
        this.id = id;
        this.activeDelayTime = activeDelayTime;
        this.enemyId = enemyId;
        this.enemyType = enemyType;
        this.health = health;
        this.shield = shield;
        this.hitCount = hitCount;
        this.delayHit = delayHit;
    }
}

export default DataBattleStageStep;
