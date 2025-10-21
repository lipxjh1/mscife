import centerDataItem from "../../Data/CenterDataItem.js";
import { AssetLoadingManager } from "../AssetLoadingManager.js";

let container_main = null;

let container_selector = null;

export function CreateItemsSelector(scene) {
    AssetLoadingManager.getInstance().init(scene);

    AssetLoadingManager.getInstance().lazyLoadShopInventory(() => {
        LoadAssetsDone(scene);
    });
}

function LoadAssetsDone(scene) {
    CreateItemButtons(scene);
}

function CreateItemButtons(scene) {
    container_main = scene.add.container(0, 0).setDepth(100);

    container_selector = scene.add.container(0, 0);
    container_main.add(container_selector);

    //button shield
    {
        let code = "DOGE_SHIELD";

        let canUseTimes = 3;

        let quantity = 99;

        let itemData = centerDataItem.getItemById(code);

        function OnButtonDown() {
            if (quantity > 0 && btn.locked == false && canUseTimes > 0) {
                quantity -= 1;

                canUseTimes -= 1;

                btn.text_quantity.setText(quantity);

                btn.setLock(3);

                scene.UseShield(scene, 3);

                if (canUseTimes <= 0) {
                    btn.setLock(-1);
                }
            }
        }

        let btn = CreateButtonSelect(scene);

        btn.button.on("pointerdown", function () {
            OnButtonDown();
        });

        btn.setPosition(856 + 196 / 2, 1664 + 196 / 2);
        btn.image.setTexture(itemData.imgKey);

        btn.text_quantity.setText(quantity);

        scene.input.keyboard.on(
            "keydown-Q",
            function (event) {
                //console.log("Phím Q đã được nhấn!");
                OnButtonDown();
            },
            scene
        );
    }

    //button energy
    {
        let code = "DOGE_ENERGY";

        let quantity = 99;

        let itemData = centerDataItem.getItemById(code);

        function OnButtonDown() {
            if (quantity > 0 && btn.locked == false) {
                quantity -= 1;

                btn.text_quantity.setText(quantity);

                btn.setLock(30);

                scene.UseEnergy(scene, 30);
            }
        }

        let btn = CreateButtonSelect(scene);

        btn.button.on("pointerdown", function () {
            OnButtonDown();
        });

        btn.setPosition(856 + 196 / 2, 1132 + 196 / 2);
        btn.image.setTexture(itemData.imgKey);

        btn.text_quantity.setText(quantity);

        scene.input.keyboard.on(
            "keydown-W",
            function (event) {
                //console.log("Phím W đã được nhấn!");
                OnButtonDown();
            },
            scene
        );
    }
}

function CreateButtonSelect(scene) {
    let container_button = scene.add.container(0, 0);
    container_selector.add(container_button);

    let container_button_inner = scene.add.container(-196 / 2, -196 / 2);
    container_button.add(container_button_inner);
    container_button.container_button_inner = container_button_inner;

    container_button.locked = false;

    container_button.button = scene.add
        .image(0, 0, "gameplay_selector_item_btn")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {})
        .on("pointerover", function () {
            scene.tweens.add({
                targets: container_button,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: container_button,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    container_button_inner.add(container_button.button);

    container_button.image = scene.add
        .image(196 / 2, 196 / 2, "item_musk")
        .setDisplaySize(150, 150)
        .setOrigin(0.5, 0.5);
    container_button_inner.add(container_button.image);

    container_button.text_quantity = scene.add
        .text(196, 196, "", {
            fontFamily: "Russo One",
            fontSize: "52px",
            color: "#ffffff",
            align: "right",
            wordWrap: { width: 250, useAdvancedWrap: true },
            stroke: "#000000",
            strokeThickness: 5,
        })
        .setOrigin(1, 1);
    container_button_inner.add(container_button.text_quantity);

    container_button.setLock = function (seconds) {
        if (seconds >= 0) {
            container_button.locked = true;

            container_button.circle = scene.add.graphics();
            container_button.circle.fillStyle(0x000000, 0.5);
            container_button.circle.fillCircle(196 / 2, 196 / 2, 100);
            container_button_inner.add(container_button.circle);

            // Thêm tween slice 360 độ từ góc 0 giờ
            let startAngle = -90; // Góc bắt đầu (đơn vị: độ, -90° tương ứng với góc 0 giờ)
            let endAngle = 270; // Góc kết thúc (đơn vị: độ, 270° tương ứng với góc 0 giờ sau khi quay 360°)

            scene.tweens.add({
                targets: { angle: startAngle }, // Đối tượng tween
                angle: endAngle, // Giá trị cuối cùng của góc
                duration: seconds * 1000, // Thời gian chạy
                ease: "Linear", // Hiệu ứng tuyến tính
                onUpdate: (tween) => {
                    // Xóa nội dung cũ của circle
                    container_button.circle.clear();

                    // Vẽ lại hình tròn với góc mới
                    container_button.circle.fillStyle(0x000000, 0.5); // Màu nền và độ trong suốt
                    container_button.circle.slice(
                        196 / 2, // Tâm x
                        196 / 2, // Tâm y
                        100, // Bán kính
                        Phaser.Math.DegToRad(tween.targets[0].angle), // Góc bắt đầu (chuyển từ độ sang radian)
                        Phaser.Math.DegToRad(endAngle), // Góc kết thúc (chuyển từ độ sang radian)
                        false // Theo chiều kim đồng hồ
                    );
                    container_button.circle.fillPath(); // Điền màu vào slice
                },
                onComplete: () => {
                    container_button.locked = false;

                    container_button.circle.destroy();
                },
            });
        } else {
            container_button_inner.each(function (child) {
                if (child.setTint) {
                    child.setTint(0x646464); // Màu tint bạn muốn áp dụng
                }
            });
        }
    };

    return container_button;
}
