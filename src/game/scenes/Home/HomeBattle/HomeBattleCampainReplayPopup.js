import centerData from "../../../Data/CenterData.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";
import { PlayCampain } from "./HomeBattleCampain.js";

export function CreateReplayPopup(scene, startStage) {
    let inputNumberValue = null;
    let selectedButton = null;
    let availableLevels = [];

    let container_main_code = scene.add.container(0, 0);
    container_main_code.setDepth(1000);

    const black_bg = scene.add.rectangle(0, 0, 1080, 1920).setOrigin(0, 0);
    black_bg.isFilled = true;
    black_bg.fillColor = 0;
    black_bg.fillAlpha = 0.5;
    black_bg.setInteractive();

    container_main_code.add(black_bg);

    let container_popup_code = scene.add.container(0, 0);
    container_main_code.add(container_popup_code);

    let bgWidth = 1060;
    let bgHeight = 562;

    let container_popup_code_inner = scene.add.container(
        540 - bgWidth / 2,
        960 - 50 - bgHeight / 2
    );
    container_popup_code.add(container_popup_code_inner);

    const bg = scene.add
        .image(0, 0, "share_popup_input_bg_2")
        .setInteractive()
        .setOrigin(0, 0);
    container_popup_code_inner.add(bg);

    const text = scene.add
        .text(
            bgWidth / 2,
            55,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeCampian.KEY,
                "Select replay levels"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "32px",
                color: "#ffffff",
                align: "center",
            }
        )
        .setOrigin(0.5, 0.5);

    container_popup_code_inner.add(text);

    // const text_2 = scene.add
    //     .text(
    //         bgWidth / 2,
    //         125,
    //         cdLocalization.getLocalization(
    //             cdLocalization.GROUP_KEYS.HomeCampian.KEY,
    //             "Select level to replay"
    //         ),
    //         {
    //             fontFamily: cdLocalization.getCurrentFont(),
    //             fontSize: "32px",
    //             color: "#ffffff",
    //             align: "center",
    //         }
    //     )
    //     .setOrigin(0.5, 0.5);

    // container_popup_code_inner.add(text_2);

    // Container để chứa các button level
    let levelButtonsContainer = scene.add.container(bgWidth / 2, 250);
    container_popup_code_inner.add(levelButtonsContainer);

    function CreateLevelButton(scene, x, y, imageKey, buttonName, levelData) {
        let btnWidth = 321;
        let btnHeight = 91;

        const btn_container = scene.add.container(x, y);
        levelButtonsContainer.add(btn_container);

        const btn_inner_container = scene.add.container(
            -btnWidth / 2,
            -btnHeight / 2
        );
        btn_container.add(btn_inner_container);

        // Sử dụng texture khác nhau dựa trên trạng thái
        btn_container.button = scene.add
            .image(0, 0, imageKey)
            .setOrigin(0, 0)
            .setInteractive({
                useHandCursor: levelData && levelData.remainingReplays > 0,
            })
            .on("pointerdown", function () {
                if (levelData && levelData.remainingReplays > 0) {
                    SetSelect(btn_container, levelData.stageId);
                }
            })
            .on("pointerover", function () {
                if (levelData && levelData.remainingReplays > 0) {
                    scene.tweens.add({
                        targets: btn_container,
                        scaleX: 1.2,
                        scaleY: 1.2,
                        duration: 100,
                        ease: "Power2",
                    });
                }
            })
            .on("pointerout", function () {
                if (levelData && levelData.remainingReplays > 0) {
                    scene.tweens.add({
                        targets: btn_container,
                        scaleX: 1,
                        scaleY: 1,
                        duration: 100,
                        ease: "Power2",
                    });
                }
            });
        btn_inner_container.add(btn_container.button);

        // Set tint cho button khi hết replay
        if (levelData && levelData.remainingReplays <= 0) {
            btn_container.button.setTint(0x666666);
        }

        // Text chính cho level với thông tin replay
        let levelText = buttonName;
        if (levelData) {
            levelText = `Replay ${levelData.stageId} (${levelData.remainingReplays}/${levelData.maxReplays})`;
        }

        const text = scene.add
            .text(btnWidth / 2, 12, levelText, {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "28px", // Giữ font size vừa phải để có chỗ cho các dòng khác
                color:
                    levelData && levelData.remainingReplays > 0
                        ? "#FFF"
                        : "#888",
                align: "center",
                stroke: "#000000",
                strokeThickness: 2,
            })
            .setOrigin(0.5, 0);

        btn_inner_container.add(text);

        // Hiển thị top player nếu có
        if (levelData && levelData.topPlayer) {
            // Username
            const usernameText = scene.add
                .text(
                    btnWidth / 2,
                    40, // Vị trí dòng thứ 2
                    levelData.topPlayer.username,
                    {
                        fontFamily: cdLocalization.getCurrentFont(),
                        fontSize: "22px", // Tăng font size cho username
                        color: "#FFD700",
                        align: "center",
                        stroke: "#000000",
                        strokeThickness: 1,
                    }
                )
                .setOrigin(0.5, 0);

            btn_inner_container.add(usernameText);

            // Time
            const timeText = scene.add
                .text(
                    btnWidth / 2,
                    65, // Vị trí dòng thứ 3
                    `Time: ${levelData.topPlayer.completionTimeFormatted}`,
                    {
                        fontFamily: cdLocalization.getCurrentFont(),
                        fontSize: "18px", // Tăng font size cho time
                        color: "#FFD700",
                        align: "center",
                        stroke: "#000000",
                        strokeThickness: 1,
                    }
                )
                .setOrigin(0.5, 0);

            btn_inner_container.add(timeText);
        } else if (levelData) {
            // Nếu không có top player nhưng có dữ liệu level, hiển thị thông tin replay
            const replayText = scene.add
                .text(
                    btnWidth / 2,
                    40, // Vị trí dòng thứ 2
                    `Replay: ${levelData.remainingReplays}/${levelData.maxReplays}`,
                    {
                        fontFamily: cdLocalization.getCurrentFont(),
                        fontSize: "20px",
                        color:
                            levelData.remainingReplays > 0 ? "#00FF00" : "#888",
                        align: "center",
                        stroke: "#000000",
                        strokeThickness: 1,
                    }
                )
                .setOrigin(0.5, 0);

            btn_inner_container.add(replayText);
        }

        return btn_container;
    }

    function CreateButton(scene, x, y, imageKey, buttonName) {
        let btnWidth = 321;
        let btnHeight = 92;

        const btn_container = scene.add.container(x, y);
        container_popup_code_inner.add(btn_container);

        const btn_inner_container = scene.add.container(
            -btnWidth / 2,
            -btnHeight / 2
        );
        btn_container.add(btn_inner_container);

        btn_container.button = scene.add
            .image(0, 0, imageKey)
            .setOrigin(0, 0)
            .setInteractive({ useHandCursor: true })
            .on("pointerdown", function () {})
            .on("pointerover", function () {
                scene.tweens.add({
                    targets: btn_container,
                    scaleX: 1.2,
                    scaleY: 1.2,
                    duration: 100,
                    ease: "Power2",
                });
            })
            .on("pointerout", function () {
                scene.tweens.add({
                    targets: btn_container,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 100,
                    ease: "Power2",
                });
            });
        btn_inner_container.add(btn_container.button);

        const text = scene.add
            .text(
                btnWidth / 2,
                20,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeCampian.KEY,
                    buttonName
                ),
                {
                    fontFamily: cdLocalization.getCurrentFont(),
                    fontSize: "36px",
                    color: "#FFF",
                    align: "center",
                }
            )
            .setOrigin(0.5, 0);

        btn_inner_container.add(text);

        return btn_container;
    }

    function SetSelect(btn, value) {
        inputNumberValue = value;
        selectedButton = btn;

        // Reset tất cả button về trạng thái bình thường
        availableLevels.forEach((levelData) => {
            if (levelData.button) {
                levelData.button.button.clearTint();
            }
        });

        // Highlight button được chọn
        if (btn) {
            btn.button.setTint(0x646464);
        }
    }

    // Lấy data từ RequestCheckPointStatus và tạo buttons
    centerData.RequestCheckPointStatus(
        (result) => {
            //console.log("Replay popup data:", result.data);

            // Lọc các level thuộc về campaign hiện tại (dựa trên startStage)
            // Các mốc replay là: startStage + 5, startStage + 10, startStage + 15, startStage + 20
            availableLevels = result.data.filter((levelData) => {
                // Tính các mốc replay cho campaign này
                const milestone1 = startStage + 5;
                const milestone2 = startStage + 10;
                const milestone3 = startStage + 15;
                const milestone4 = startStage + 20;

                // Chỉ lấy các stage milestone của campaign này
                return (
                    levelData.stageId === milestone1 ||
                    levelData.stageId === milestone2 ||
                    levelData.stageId === milestone3 ||
                    levelData.stageId === milestone4
                );
            });

            // Sắp xếp theo stageId
            availableLevels.sort((a, b) => a.stageId - b.stageId);

            // Tạo buttons cho các level có sẵn
            const buttonSpacing = 350;
            const buttonsPerRow = 2;

            availableLevels.forEach((levelData, index) => {
                const row = Math.floor(index / buttonsPerRow);
                const col = index % buttonsPerRow;

                const x = (col - 0.5) * buttonSpacing;
                const y = row * 100; // Khoảng cách đều giữa các hàng

                const button = CreateLevelButton(
                    scene,
                    x,
                    y,
                    "share_popup_input_btn", // Sử dụng share_popup_input_btn thay vì share_popup_input_btn_1
                    `Replay ${levelData.stageId} (${levelData.remainingReplays}/${levelData.maxReplays})`,
                    levelData
                );

                // Lưu reference đến button
                levelData.button = button;
            });

            // Tự động chọn level đầu tiên nếu có
            if (availableLevels.length > 0) {
                const firstAvailableLevel = availableLevels.find(
                    (level) => level.remainingReplays > 0
                );
                if (firstAvailableLevel) {
                    SetSelect(
                        firstAvailableLevel.button,
                        firstAvailableLevel.stageId
                    );
                }
            }
        },
        (error) => {
            //console.error("Error loading checkpoint status:", error);
            // Fallback: tạo buttons cũ nếu không load được data
            CreateFallbackButtons();
        }
    );

    function CreateFallbackButtons() {
        // Tạo buttons cho các level cách nhau 5 đơn vị: startStage + 5, startStage + 10, startStage + 15, startStage + 20
        const btn_5 = CreateLevelButton(
            scene,
            -175, // Điều chỉnh vị trí cho kích thước mới
            0,
            "share_popup_input_btn",
            `Replay ${startStage + 5} (10/10)`,
            {
                stageId: startStage + 5,
                remainingReplays: 10,
                maxReplays: 10,
            }
        );
        btn_5.button.on("pointerdown", function () {
            SetSelect(btn_5, startStage + 5);
        });

        const btn_10 = CreateLevelButton(
            scene,
            175, // Điều chỉnh vị trí cho kích thước mới
            0,
            "share_popup_input_btn",
            `Replay ${startStage + 10} (10/10)`,
            {
                stageId: startStage + 10,
                remainingReplays: 10,
                maxReplays: 10,
            }
        );
        btn_10.button.on("pointerdown", function () {
            SetSelect(btn_10, startStage + 10);
        });

        const btn_15 = CreateLevelButton(
            scene,
            -175, // Điều chỉnh vị trí cho kích thước mới
            100, // Khoảng cách đều giữa các hàng
            "share_popup_input_btn",
            `Replay ${startStage + 15} (10/10)`,
            {
                stageId: startStage + 15,
                remainingReplays: 10,
                maxReplays: 10,
            }
        );
        btn_15.button.on("pointerdown", function () {
            SetSelect(btn_15, startStage + 15);
        });

        const btn_20 = CreateLevelButton(
            scene,
            175, // Điều chỉnh vị trí cho kích thước mới
            100, // Khoảng cách đều giữa các hàng
            "share_popup_input_btn",
            `Replay ${startStage + 20} (10/10)`,
            {
                stageId: startStage + 20,
                remainingReplays: 10,
                maxReplays: 10,
            }
        );
        btn_20.button.on("pointerdown", function () {
            SetSelect(btn_20, startStage + 20);
        });

        // Tự động chọn level đầu tiên
        SetSelect(btn_5, startStage + 5);
    }

    const btn_yes = CreateButton(
        scene,
        195 + 321 / 2,
        428 + 92 / 2,
        "share_popup_input_btn",
        "Fight"
    );
    btn_yes.button.on("pointerdown", function () {
        if (inputNumberValue) {
            centerData.replayStage = inputNumberValue;
            PlayCampain(scene);
            container_main_code.destroy();
        } else {
            // Hiển thị thông báo chọn level
            CreateAlertPopup(scene, "Please select a level to replay");
        }
    });

    const btn_no = CreateButton(
        scene,
        544 + 321 / 2,
        428 + 92 / 2,
        "share_popup_input_btn",
        "Cancel"
    );
    btn_no.button.on("pointerdown", function () {
        container_main_code.destroy();
    });

    // Close popup khi click vào background
    black_bg.on("pointerdown", function () {
        container_main_code.destroy();
    });
}
