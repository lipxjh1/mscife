import centerData from "../../../Data/CenterData.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import cdLocalization from "../../../Data/CenterDataLocalization.js";
import { CreateChipToMSCIConvertPopup } from "../HomeEarn/HomeEarnChipToMSCIPopupConvert.js";
import { CreateMSCIHistory } from "../HomeEarn/HomeEarnChipToMSCIHistory.js";
import { AssetLoadingManager } from "../../AssetLoadingManager.js";
import { CreateMSCITokenomicHistory } from "./HomeMSCITokenomicHistory.js";
import { CreateMSCITokenomicProgram } from "./HomeMSCITokenomicProgram.js";
import { CreateCenterMarket } from "../HomeCenterMarket/HomeCenterMarket.js";

let container_main_chip_to_msci = null;

let container_popup_chip_to_msci = null;
let container_popup_open_position = { x: 0, y: 0 };
let container_popup_close_position = { x: 0, y: 4000 };

let isOpen = false;

let timeCountEvents = [];

export function CreateMSCITokenomic(scene) {
    CreateLoadingPopup();

    AssetLoadingManager.getInstance().init(scene);

    AssetLoadingManager.getInstance().lazyEarn(() => {
        HideLoadingPopup();

        LoadAssetsDone(scene);
    });
}

function LoadAssetsDone(scene) {
    if (container_main_chip_to_msci) {
        ClearTimeEvents();

        container_main_chip_to_msci.destroy();
    }

    container_main_chip_to_msci = scene.add.container(0, 0);
    container_main_chip_to_msci.setDepth(300);

    container_popup_chip_to_msci = scene.add.container(0, 0);
    container_main_chip_to_msci.add(container_popup_chip_to_msci);
    container_popup_chip_to_msci.setDepth(101);

    const lock_bg = scene.add
        .image(0, 0, "home_earn_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_popup_chip_to_msci.add(lock_bg);

    const popu_bg = scene.add
        .image(0, 0, "home_earn_msci_view_popup_bg")
        .setOrigin(0, 0);
    container_popup_chip_to_msci.add(popu_bg);

    centerData.RequestTokenomicDetail(
        (result) => {
            CreateLabels(scene, result);
        },
        (error) => {}
    );

    //create close btn
    const btn_close = scene.add
        .image(38 + 118 / 2, 58 + 90 / 2, "share_btn_home_2")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            //console.log("btn_close clicked");

            Close(scene);
        })
        .on("pointerover", function () {
            //console.log("btn_close over");

            scene.tweens.add({
                targets: btn_close,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            //console.log("btn_close out");

            scene.tweens.add({
                targets: btn_close,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });

    container_main_chip_to_msci.add(btn_close);

    Open(scene);
}

function CreateLabels(scene, respone) {
    {
        const text_titile = scene.add
            .text(
                540,
                230 + 8,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                    "$MSCI price"
                ),
                {
                    fontFamily: cdLocalization.getCurrentFont(),
                    fontSize: "40px",
                    color: "#ffffff",
                    align: "left",
                }
            )
            .setOrigin(0.5, 0);
        container_popup_chip_to_msci.add(text_titile);

        let text_value = scene.add
            .text(540, 292 + 8, respone.data.tokenomics.marketPrice, {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "40px",
                color: "#ffffff",
                align: "right",
            })
            .setOrigin(0.5, 0);
        container_popup_chip_to_msci.add(text_value);
    }

    {
        const text_titile = scene.add
            .text(
                540,
                384 + 8,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                    "Growth rate"
                ),
                {
                    fontFamily: cdLocalization.getCurrentFont(),
                    fontSize: "40px",
                    color: "#ffffff",
                    align: "left",
                }
            )
            .setOrigin(0.5, 0);
        container_popup_chip_to_msci.add(text_titile);

        let text_value = scene.add
            .text(540, 446 + 8, respone.data.tokenomics.growthRate + "%", {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "40px",
                color: "#ffffff",
                align: "right",
            })
            .setOrigin(0.5, 0);
        container_popup_chip_to_msci.add(text_value);
    }

    {
        const text_titile = scene.add
            .text(
                540,
                538 + 8,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                    "Your $MSCI"
                ),
                {
                    fontFamily: cdLocalization.getCurrentFont(),
                    fontSize: "40px",
                    color: "#ffffff",
                    align: "left",
                }
            )
            .setOrigin(0.5, 0);
        container_popup_chip_to_msci.add(text_titile);

        let text_value = scene.add
            .text(540, 600 + 8, respone.data.tokenomics.totalSupply, {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "40px",
                color: "#ffffff",
                align: "right",
            })
            .setOrigin(0.5, 0);
        container_popup_chip_to_msci.add(text_value);
    }

    {
        const text_titile = scene.add
            .text(
                540,
                703 + 8,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                    "msciExplainKey"
                ),
                {
                    fontFamily: cdLocalization.getCurrentFont(),
                    fontSize: "40px",
                    color: "#ffffff",
                    align: "left",
                    wordWrap: { width: 820, useAdvancedWrap: true },
                }
            )
            .setOrigin(0.5, 0);
        container_popup_chip_to_msci.add(text_titile);
    }

    const btn_go_to_market = CreateBottomButton(
        scene,
        container_popup_chip_to_msci,
        95 + 260 / 2,
        1729 + 100 / 2,
        "home_earn_msci_view_btn_0",
        "goToMarketBtnKey"
    );
    btn_go_to_market.button.on("pointerdown", (pointer) => {
        Close(scene);

        CreateCenterMarket(scene);
    });

    const btn_history = CreateBottomButton(
        scene,
        container_popup_chip_to_msci,
        410 + 260 / 2,
        1729 + 100 / 2,
        "home_earn_msci_view_btn_0",
        "History"
    );
    btn_history.button.on("pointerdown", (pointer) => {
        CreateMSCITokenomicHistory(scene);
    });

    const btn_tokenomics = CreateBottomButton(
        scene,
        container_popup_chip_to_msci,
        725 + 260 / 2,
        1729 + 100 / 2,
        "home_earn_msci_view_btn_0",
        "Tokenomics"
    );
    btn_tokenomics.button.on("pointerdown", (pointer) => {
        CreateMSCITokenomicProgram(scene, respone.data.categories);
    });
}

function CreateBottomButton(scene, container, x, y, imageKey, buttonName) {
    let btnWidth = 260;
    let btnHeight = 100;

    const btn_container = scene.add.container(x, y);
    container.add(btn_container);

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
                cdLocalization.GROUP_KEYS.HomeWallet.KEY,
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

function formatTimeRemaining(seconds) {
    // Tính số giờ, phút và giây
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    // Thêm số 0 phía trước nếu giá trị nhỏ hơn 10
    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(minutes).padStart(2, "0");
    const formattedSeconds = String(secs).padStart(2, "0");

    // Trả về chuỗi định dạng giờ:phút:giây
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

export function IsOpen() {
    return isOpen;
}

let activeTween = null;
export function Open(scene) {
    if (isOpen == true) return;

    container_popup_chip_to_msci.setPosition(
        container_popup_close_position.x,
        container_popup_close_position.y
    );

    if (activeTween) {
        activeTween.stop();
        scene.tweens.remove(activeTween);
    }

    activeTween = scene.tweens.add({
        targets: container_popup_chip_to_msci,
        x: container_popup_open_position.x,
        y: container_popup_open_position.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {
            isOpen = true;
        },
    });
}

export function Close(scene) {
    if (isOpen == false) return;

    if (activeTween) {
        activeTween.stop();
        scene.tweens.remove(activeTween);
    }

    activeTween = scene.tweens.add({
        targets: container_popup_chip_to_msci,
        x: container_popup_close_position.x,
        y: container_popup_close_position.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {
            Destroy();
        },
    });
}

function ClearTimeEvents() {
    for (let i = 0; i < timeCountEvents.length; i++) {
        timeCountEvents[i].remove();
    }

    timeCountEvents = [];
}

function Destroy(scene) {
    isOpen = false;

    ClearTimeEvents();

    container_main_chip_to_msci.destroy();
}
