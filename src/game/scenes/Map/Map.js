// import MapEarth from "./MapEarth.js";

// import MapSpace from "./MapSpace.js";

class Map {
    constructor(scene, id) {
        this.scene = scene;
        this.id = id;

        this.CreateContainers();

        //tạo obstacles
        this.container_obstacles = this.scene.add.container(0, 0);
        this.container_obstacles.setDepth(-2);

        // // Tạo sprite cho map
        // const obstacle_0_wall = this.scene.add
        //     .sprite(538, 1143, "map_0_obstacle_0_wall")
        //     .setOrigin(1, 0);

        // Thêm sprite vào container
        //this.container_obstacles.add(obstacle_0_wall);
    }

    CreateContainers() {
        // Tạo container cho map
        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(-1);

        this.container_background = this.scene.add.container(0, 0);
        this.container_background.setDepth(-4);

        this.container_enemy = this.scene.add.container(0, 0);
        this.container_enemy.setDepth(-3);

        this.container_obstacles = this.scene.add.container(0, 0);
        this.container_obstacles.setDepth(-2);

        this.container_enemy_drones = this.scene.add.container(0, 0);
        this.container_enemy_drones.setDepth(-1);
    }

    AddToContainerBackground(phaserObj) {
        this.container_background.add(phaserObj);
    }

    AddToContainerEnemy(phaserObj) {
        this.container_enemy.add(phaserObj);
    }

    AddToContainerObstacles(phaserObj) {
        this.container_obstacles.add(phaserObj);
    }

    AddToContainerEnemyDrones(phaserObj) {
        this.container_enemy_drones.add(phaserObj);
    }
}

// export function CreateMap(scene, id) {
//     let map = null;

//     if (id <= 20) {
//         map = MapEarth.CreateMap(scene, id);
//     }

//     if (id <= 20) {
//         map = MapSpace.CreateMap(scene, id);
//     }

//     return map;
// }

// Export default Map
export default Map;
