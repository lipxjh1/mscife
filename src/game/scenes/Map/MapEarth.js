import Map from "./Map.js";

class MapEarth extends Map {
    constructor(scene, id) {
        super(scene, id); // Gọi constructor của lớp cha
        this.initEarthMap(); // Khởi tạo logic cho MapEarth

        this.enemySlots = [
            { positionX: 540, positionY: 1281, scaleX: 1, scaleY: 1, depth: 0 },
            {
                positionX: 540 - 150,
                positionY: 1281,
                scaleX: 1,
                scaleY: 1,
                depth: -1,
            },
            {
                positionX: 540 + 150,
                positionY: 1281,
                scaleX: 1,
                scaleY: 1,
                depth: -1,
            },
            {
                positionX: 540 - 300,
                positionY: 1281,
                scaleX: 1,
                scaleY: 1,
                depth: -2,
            },
            {
                positionX: 540 + 300,
                positionY: 1281,
                scaleX: 1,
                scaleY: 1,
                depth: -2,
            },
        ];

        this.enemyCurrentSlots = [];
    }

    // Phương thức khởi tạo logic riêng
    initEarthMap() {
        // Tạo sprite cho map background
        const map_bg = this.scene.add.sprite(0, 0, "map_0_bg").setOrigin(0, 0);
        this.AddToContainerBackground(map_bg);

        // Thêm obstacles đặc trưng
        const obstacle_0_wall = this.scene.add
            .sprite(538, 1143, "map_0_obstacle_0_wall")
            .setOrigin(1, 0);
        this.AddToContainerObstacles(obstacle_0_wall);
    }

    // Override một phương thức của Map (nếu cần)
    AddToContainerBackground(phaserObj) {
        super.AddToContainerBackground(phaserObj); // Gọi phương thức cha
        //console.log("Added to Earth background container:", phaserObj);
    }

    AddToContainerEnemy(phaserObj) {
        this.container_enemy.add(phaserObj);

        //console.log("AddToContainerEnemy:", phaserObj);

        if (phaserObj instanceof Phaser.GameObjects.Container) {
            //console.log("Phaser.GameObjects.Container:", phaserObj);

            if (this.enemyCurrentSlots.length == 0) {
                this.CloneEnemySlots();

                phaserObj.setPosition(
                    this.enemyCurrentSlots[0].positionX,
                    this.enemyCurrentSlots[0].positionY
                );

                phaserObj.setScale(
                    this.enemyCurrentSlots[0].scaleX,
                    this.enemyCurrentSlots[0].scaleY
                );

                phaserObj.setDepth(this.enemyCurrentSlots[0].depth);

                this.RemoveEnemySlotByIndex(0);
            } else {
                let ranIndex = Phaser.Math.Between(
                    0,
                    this.enemyCurrentSlots.length - 1
                );

                //console.log("random slot:", ranIndex);

                phaserObj.setPosition(
                    this.enemyCurrentSlots[ranIndex].positionX,
                    this.enemyCurrentSlots[ranIndex].positionY
                );

                phaserObj.setScale(
                    this.enemyCurrentSlots[ranIndex].scaleX,
                    this.enemyCurrentSlots[ranIndex].scaleY
                );

                phaserObj.setDepth(this.enemyCurrentSlots[ranIndex].depth);

                this.RemoveEnemySlotByIndex(ranIndex);
            }
        }
    }

    CloneEnemySlots() {
        this.enemyCurrentSlots = this.enemySlots.map((item) => ({ ...item }));
    }

    RemoveEnemySlotByIndex(indexNum) {
        this.enemyCurrentSlots.splice(indexNum, 1);
    }
}

// Hàm tạo MapEarth
export function CreateMap(scene, id) {
    return new MapEarth(scene, id);
}

export default MapEarth;
