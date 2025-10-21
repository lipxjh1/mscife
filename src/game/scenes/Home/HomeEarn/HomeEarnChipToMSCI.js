import centerData from "../../../Data/CenterData.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import {
    container_main,
    container_popup,
    container_buttons,
} from "./HomeEarn.js";

import cdLocalization from "../../../Data/CenterDataLocalization.js";
import { CreateChipToMSCIConvertPopup } from "./HomeEarnChipToMSCIPopupConvert.js";
import { CreateMSCIHistory } from "./HomeEarnChipToMSCIHistory.js";

let container_main_chip_to_msci = null;

let container_popup_chip_to_msci = null;
let container_popup_open_position = { x: 0, y: 0 };
let container_popup_close_position = { x: 0, y: 4000 };

let isOpen = false;

let timeCountEvents = [];

let constantK = 0;

export function CreateChipToMSCI(scene) {
    if (container_main_chip_to_msci) {
        ClearTimeEvents();

        container_main_chip_to_msci.destroy();
    }

    container_main_chip_to_msci = scene.add.container(0, 0);
    container_main.add(container_main_chip_to_msci);

    container_popup_chip_to_msci = scene.add.container(0, 0);
    container_main_chip_to_msci.add(container_popup_chip_to_msci);
    container_popup_chip_to_msci.setDepth(101);

    const lock_bg = scene.add
        .image(0, 0, "home_earn_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_popup_chip_to_msci.add(lock_bg);

    const popu_bg = scene.add
        .image(0, 0, "home_earn_chip_to_msci_popup_bg")
        .setOrigin(0, 0);
    container_popup_chip_to_msci.add(popu_bg);

    centerData.RequestMSCIDashboard(
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
                392 + 8,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                    "Total Chip in server"
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
            .text(540, 454 + 8, respone.data.dailyCycle.totalServerChip, {
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
                546 + 8,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                    "Total $MSCI to convert"
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
            .text(540, 608 + 8, respone.data.dailyCycle.msciRemainingToday, {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "40px",
                color: "#ffffff",
                align: "right",
            })
            .setOrigin(0.5, 0);
        container_popup_chip_to_msci.add(text_value);
    }

    {
        constantK = respone.data.dailyCycle.constantK;

        const text_titile = scene.add
            .text(
                540,
                700 + 8,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                    "Convert rate"
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
            .text(540, 762 + 8, constantK, {
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
                854 + 8,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                    "Time left"
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
            .text(540, 916 + 8, "00/00/0000 00:00:00", {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "40px",
                color: "#ffffff",
                align: "right",
            })
            .setOrigin(0.5, 0);
        container_popup_chip_to_msci.add(text_value);

        function SetTextTimeRemain(seconds) {
            text_value.setText(formatTimeRemaining(seconds));
        }

        SetTextTimeRemain(respone.data.dailyCycle.cycleEndsInSeconds);

        // Tạo Timer Event để đếm ngược
        let timeEvent = scene.time.addEvent({
            delay: 1000, // 1 giây
            callback: () => {
                if (respone.data.dailyCycle.cycleEndsInSeconds < 0) {
                    respone.data.dailyCycle.cycleEndsInSeconds = 0;

                    timeEvent.remove();

                    CreateChipToMSCI(scene);
                }

                SetTextTimeRemain(respone.data.dailyCycle.cycleEndsInSeconds);

                respone.data.dailyCycle.cycleEndsInSeconds -= 1;
            },
            callbackScope: this,
            loop: true,
        });

        timeCountEvents.push(timeEvent);
    }

    {
        const text_titile = scene.add
            .text(
                540,
                1008 + 8,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                    "Your Chip"
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
            .text(540, 1070 + 8, respone.data.userInfo.chipBalance, {
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
                1162 + 8,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                    "Level pass"
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
            .text(
                540,
                1224 + 8,
                respone.data.userInfo.passedStages +
                    "/" +
                    respone.data.userInfo.totalStages,
                {
                    fontFamily: cdLocalization.getCurrentFont(),
                    fontSize: "40px",
                    color: "#ffffff",
                    align: "right",
                }
            )
            .setOrigin(0.5, 0);
        container_popup_chip_to_msci.add(text_value);
    }

    {
        const text_titile = scene.add
            .text(
                540,
                1316 + 8,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                    "Your % total Chip to convert"
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
            .text(540, 1378 + 8, respone.data.userInfo.percent * 100 + "%", {
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
                1470 + 8,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                    "Your total Chip to convert"
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
            .text(
                540,
                1532 + 8,
                respone.data.userInfo.remainingConvertibleChip +
                    "/" +
                    respone.data.userInfo.maxConvertibleChipToday,
                {
                    fontFamily: cdLocalization.getCurrentFont(),
                    fontSize: "40px",
                    color: "#ffffff",
                    align: "right",
                }
            )
            .setOrigin(0.5, 0);
        container_popup_chip_to_msci.add(text_value);
    }

    const btn_convert = CreateBottomButton(
        scene,
        container_popup_chip_to_msci,
        160 + 312 / 2,
        1711 + 120 / 2,
        "home_earn_chip_to_msci_btn",
        "convertBtnKey"
    );
    btn_convert.button.on("pointerdown", (pointer) => {
        if (centerData.userInfo.CurrentStage > 1) {
            CreateChipToMSCIConvertPopup(
                scene,
                constantK,
                respone.data.userInfo.remainingConvertibleChip,
                respone.data.userInfo.maxConvertibleChipToday,
                () => {
                    CreateChipToMSCI(scene);
                }
            );
        } else {
            CreateAlertPopup(
                scene,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                    "You must pass stage 1 to convert chip"
                ),
                () => {},
                null
            );
        }
    });

    const btn_history = CreateBottomButton(
        scene,
        container_popup_chip_to_msci,
        608 + 312 / 2,
        1711 + 120 / 2,
        "home_earn_chip_to_msci_btn",
        "converHistoryBtnKey"
    );
    btn_history.button.on("pointerdown", (pointer) => {
        CreateMSCIHistory(scene);
    });
}

function CreateBottomButton(scene, container, x, y, imageKey, buttonName) {
    let btnWidth = 312;
    let btnHeight = 120;

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
