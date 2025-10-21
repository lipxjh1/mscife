import centerData from "../../Data/CenterData";
import cdLocalization from "../../Data/CenterDataLocalization";

let container_main = null;
let currentScene = null;
let currentBattleId = "";

let topDamageDataArr = [];

let topDamageItemArr = [];

let bossBattleTimerEvent = null;

export function CreateTopDamageBar(scene, battleId) {
    currentScene = scene;

    currentBattleId = battleId;

    container_main = scene.add.container(0, 0).setDepth(200);

    for (let i = 0; i < 3; i++) {
        let itemContainer = createTopItem(scene);

        container_main.add(itemContainer);

        itemContainer.setPosition(0, 300 + 100 * i + 10 * i);

        // itemContainer.updateContent({
        //     rank: i,
        //     username: "username " + i,
        //     damage: i,
        //     percentage: i,
        // });

        itemContainer.updateContent(null);

        topDamageItemArr.push(itemContainer);
    }

    CreateRequestTopDamageLoop(scene);
}

export function UpdateTopDamageBar() {
    for (let i = 0; i < topDamageItemArr.length; i++) {
        let itemContainer = topDamageItemArr[i];

        if (i < topDamageDataArr.length) {
            let data = topDamageDataArr[i];

            itemContainer.updateContent({
                rank: data.rank,
                username: data.username,
                damage: data.damage,
                percentage: data.percentage,
            });
        } else {
            itemContainer.updateContent(null);
        }
    }
}

function createTopItem(scene) {
    const container = scene.add.container(0, 0);
    container.setSize(100, 100);

    const container_inner = scene.add.container(0, 0);
    container.add(container_inner);

    let bg = scene.add
        .graphics()
        .fillStyle(0x4e4e4e, 0.4)
        .fillRoundedRect(0, 0, 430, 100, 4);
    container_inner.add(bg);

    const text_rank = scene.add
        .text(20, 29, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#ffffff",
            align: "left",
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_rank);

    const text_name = scene.add
        .text(100, 15, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#ffffff",
            align: "left",
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_name);

    const text_damage = scene.add
        .text(100, 60, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "30px",
            color: "#FFA600",
            align: "left",
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_damage);

    // API cập nhật nội dung được gọi bởi gridTable
    container.updateContent = function (data) {
        container.itemData = data;
        if (data == null) {
            container.setVisible(false);

            return;
        }

        container.setVisible(true);

        text_rank.setText(data.rank + ".");
        text_name.setText(data.username);
        text_damage.setText(`Damage ${data.damage} (${data.percentage}%)`);
    };

    return container;
}

function CreateRequestTopDamageLoop(scene) {
    StopRequestTopDamageLoop();

    centerData.RequestBossBattleJoinTopDamage(
        currentBattleId,
        (result) => {
            topDamageDataArr = result.mvpList;

            UpdateTopDamageBar();
        },
        () => {}
    );

    // SỬ DỤNG PHASER TIME EVENT - TỐI ƯU HƠN CHO MỤC ĐÍCH TIMER
    bossBattleTimerEvent = scene.time.addEvent({
        delay: 3000, // 3000ms = 3 giây
        callback: handleLoopTopDamageEvent, // Tên hàm callback

        // SỬA LỖI QUAN TRỌNG: callbackScope phải là scene nếu hàm này
        // được định nghĩa bên ngoài Scene Class và không sử dụng this
        callbackScope: scene,

        loop: true, // Lặp vô hạn
        startAt: 0, // Chạy ngay lập tức khi khởi tạo
    });
}

export function StopRequestTopDamageLoop() {
    if (bossBattleTimerEvent) {
        bossBattleTimerEvent.destroy();
        bossBattleTimerEvent = null; // Reset biến
    }
}

function handleLoopTopDamageEvent() {
    centerData.RequestBossBattlePoolTopDamage(
        currentBattleId,
        (result) => {
            topDamageDataArr = result.topDamage;

            UpdateTopDamageBar();
        },
        () => {}
    );
}
