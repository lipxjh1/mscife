import centerData from "../../Data/CenterData";
import centerDataItem from "../../Data/CenterDataItem";
import cdLocalization from "../../Data/CenterDataLocalization";

import { CreateAlertPopup, CreateLoadingPopup,  HideLoadingPopup } from "./AlertPopup";

export function CreateUseItemPopup(
    scene,
    code = "",
    name = "",
    remaining,
    description = "",
    onYes,
    onNo
) {
    let inputValue = null;

    let container_main_use = scene.add.container(0, 0);
    container_main_use.setDepth(1000);

    const black_bg = scene.add.rectangle(0, 0, 1080, 1920).setOrigin(0, 0);
    black_bg.isFilled = true;
    black_bg.fillColor = 0;
    black_bg.fillAlpha = 0.9;
    black_bg.setInteractive();

    container_main_use.add(black_bg);

    let container_popup_buy = scene.add.container(0, 0);
    container_main_use.add(container_popup_buy);

    const bg = scene.add
        .image(540, 613 + 695 / 2, "share_popup_buy_bg")
        .setInteractive()
        .setOrigin(0.5, 0.5);
    container_popup_buy.add(bg);

    const imgKey = centerDataItem.getItemById(code).imgKey;

    const item_img = scene.add
        .image(94 + 320 / 2, 667 + 320 / 2, imgKey)
        .setOrigin(0.5, 0.5)
        .setScale(300 / 350);
    container_popup_buy.add(item_img);

    const item_text_price = scene.add
        .text(94 + 320 / 2, 1031 + 36 / 2, "x" + remaining, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "36px",
            color: "#ffffff",
            align: "center",
        })
        .setOrigin(0.5, 0.5);
    container_popup_buy.add(item_text_price);

    const text_name = scene.add
        .text(
            466,
            667,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeShop.KEY,
                name
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "48px",
                color: "#ffffff",
                align: "left",
                wordWrap: { width: 520, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);

    container_popup_buy.add(text_name);

    const text_description = scene.add
        .text(
            466,
            740,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeShopDescription.KEY,
                code
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "24px",
                color: "#ffffff",
                align: "left",
                wordWrap: { width: 520, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);

    container_popup_buy.add(text_description);

    function CreateButton(scene, x, y, imageKey, buttonName) {
        let btnWidth = 321;
        let btnHeight = 92;

        const btn_container = scene.add.container(x, y);
        container_popup_buy.add(btn_container);

        const btn_inner_container = scene.add.container(
            -btnWidth / 2,
            -btnHeight / 2
        );
        btn_container.add(btn_inner_container);

        btn_container.button = scene.add
            .image(0, 0, imageKey)
            .setOrigin(0, 0)
            .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
            .on("pointerdown", function () {})
            .on("pointerover", function () {
                scene.tweens.add({
                    targets: btn_container,
                    scaleX: 1.2, // Phóng to 20% theo chiều ngang
                    scaleY: 1.2, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            })
            .on("pointerout", function () {
                scene.tweens.add({
                    targets: btn_container,
                    scaleX: 1, // Phóng to 20% theo chiều ngang
                    scaleY: 1, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            });
        btn_inner_container.add(btn_container.button);

        const text = scene.add
            .text(
                btnWidth / 2,
                btnHeight / 2,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeShop.KEY,
                    buttonName
                ),
                {
                    fontFamily: cdLocalization.getCurrentFont(), // Font-family
                    fontSize: "36px", // Font-size
                    color: "#FFF", // Màu chữ (color)
                    align: "center",
                }
            )
            .setOrigin(0.5, 0.5);

        btn_inner_container.add(text);

        return btn_container;
    }

    const btn_yes = CreateButton(
        scene,
        94 + 321 / 2,
        1162 + 92 / 2,
        "share_popup_input_btn",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.Main.KEY,
            "Use"
        )
    );
    btn_yes.button.on("pointerdown", function () {
        if (onYes && typeof onYes === "function") {
            onYes();
        }

        container_main_use.destroy();
    });

    const btn_no = CreateButton(
        scene,
        665 + 321 / 2,
        1162 + 92 / 2,
        "share_popup_input_btn",
        cdLocalization.getLocalization(cdLocalization.GROUP_KEYS.Main.KEY, "No")
    );
    btn_no.button.on("pointerdown", function () {
        if (onNo && typeof onNo === "function") {
            onNo();
        }

        container_main_use.destroy();
    });
}
