import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";
import centerData from "../../../Data/CenterData.js";
import centerDataItem from "../../../Data/CenterDataItem.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";

export let container_stage_list = null;
let maskShape = null;
let mask = null;
let isOpen = false;

import { container_achievements_sub_panel } from "./HomeRewardAchievements.js";

export function CreateStageList(scene) {
    if (isOpen) return;
    isOpen = true;

    CreateLoadingPopup();

    centerData.RequestAchievementsInfo(
        "STAGE",
        (result) => {
            HideLoadingPopup();

            const arr_data = result.achievements.filter(
                (a) => a.type && a.type.includes("STAGE")
            );

            container_stage_list = scene.add.container(0, 0);
            container_achievements_sub_panel.add(container_stage_list);

            if (!arr_data || arr_data.length <= 0) {
                //console.log("No stage achievements data available");
                const text = scene.add
                    .text(
                        1080 / 2,
                        1920 / 2 - 200,
                        cdLocalization.getLocalization(
                            cdLocalization.GROUP_KEYS.HomeAchivevement.KEY,
                            "No achievements available"
                        ),
                        {
                            fontFamily: cdLocalization.getCurrentFont(),
                            fontSize: "48px",
                            color: "#ffffff",
                            align: "center",
                        }
                    )
                    .setOrigin(0.5, 0.5);
                container_stage_list.add(text);
                return;
            }

            const validAchievements = arr_data.filter((achievement) => {
                if (
                    !achievement ||
                    !achievement.title ||
                    !achievement.description
                ) {
                    //console.warn("Invalid achievement data:", achievement);
                    return false;
                }
                return true;
            });

            if (validAchievements.length === 0) {
                //console.log("No valid achievements found");
                return;
            }

            // --- Position & Dimension Calculation ---
            const itemWidth = 1004; // The width of our list item
            const scrollViewWidth = itemWidth; // Panel width should match item width

            // Y position calculation based on the category buttons above
            const catButtonsCenterY = 418;
            const catButtonsHeight = 120;
            const catButtonsBottomY = catButtonsCenterY + catButtonsHeight / 2;
            const topMargin = 20; // Space between buttons and list
            const bottomMargin = 40; // Space at the bottom of the screen
            const topY = catButtonsBottomY + topMargin;
            const bottomY = 1920 - bottomMargin;
            const scrollViewHeight = bottomY - topY;

            // Center position for the scroll panel
            const posX = 1080 / 2; // Center horizontally on the screen
            const posY = topY + scrollViewHeight / 2;

            // --- Scrollable Panel Creation ---
            const columns = 1;
            const rows = Math.ceil(validAchievements.length / columns);
            const itemHeight = 353;
            const itemSpacing = 30;

            const scrollablePanel = scene.rexUI.add
                .scrollablePanel({
                    x: posX,
                    y: posY,
                    width: scrollViewWidth,
                    height: scrollViewHeight,
                    scrollMode: 0,
                    panel: {
                        child: scene.rexUI.add.gridSizer({
                            width: scrollViewWidth,
                            height: scrollViewHeight,
                            column: columns,
                            row: rows,
                            space: { column: itemSpacing, row: itemSpacing },
                        }),
                        mask: { padding: 1 },
                    },
                    mouseWheelScroller: { focus: false, speed: 0.2 },
                    space: { top: 0, bottom: 40 },
                })
                .layout();
            container_stage_list.add(scrollablePanel);

            validAchievements.forEach((achievement) => {
                const container_item = scene.add.container(0, 0);
                container_item.setSize(itemWidth, itemHeight);
                container_item.achievement = achievement;

                let container_inner = scene.add.container(-1004 / 2, -353 / 2);
                container_item.add(container_inner);
                container_item.container_inner = container_inner;

                let bg = scene.rexUI.add
                    .roundRectangle(0, 0, 1004, 353, 0, 0x4e4e4e, 0.4)
                    .setOrigin(0, 0);
                container_inner.add(bg);

                const text_title = scene.add
                    .text(
                        14,
                        10.5,
                        cdLocalization.getLocalization(
                            cdLocalization.GROUP_KEYS.HomeAchivevement.KEY,
                            achievement.title
                        ),
                        {
                            fontFamily: cdLocalization.getCurrentFont(),
                            fontSize: "38px",
                            color: "#ffffff",
                            wordWrap: { width: 680, useAdvancedWrap: true },
                        }
                    )
                    .setOrigin(0, 0);
                container_inner.add(text_title);

                const text_content = scene.add
                    .text(
                        14,
                        97,
                        cdLocalization.getLocalization(
                            cdLocalization.GROUP_KEYS.HomeAchivevement.KEY,
                            achievement.description
                        ),
                        {
                            fontFamily: cdLocalization.getCurrentFont(),
                            fontSize: "28px",
                            color: "#ffffff",
                            wordWrap: { width: 680, useAdvancedWrap: true },
                        }
                    )
                    .setOrigin(0, 0);
                container_inner.add(text_content);

                if (achievement.claimed == false && achievement._id) {
                    const btn_stage = CreateButton0(
                        scene,
                        container_inner,
                        694 + 288 / 2,
                        169 + 72 / 2,
                        "home_reward_btn_locked",
                        "Claim"
                    );
                    btn_stage.button.on("pointerdown", function () {
                        centerData.RequestClaimAchievement(
                            achievement._id,
                            (result) => {
                                achievement.claimed = true;
                                btn_stage.destroy();
                                const btn_unlocked = CreateButton0(
                                    scene,
                                    container_inner,
                                    694 + 288 / 2,
                                    169 + 72 / 2,
                                    "home_reward_btn_unlocked",
                                    "Unlocked"
                                );
                                container_item.btn_unlocked = btn_unlocked;
                                CreateAlertPopup(
                                    scene,
                                    "Achievement claimed successfully!"
                                );
                            },
                            (error) => {
                                CreateAlertPopup(
                                    scene,
                                    "Failed to claim achievement: " + error
                                );
                            }
                        );
                    });
                    container_item.btn_stage = btn_stage;
                } else if (achievement.claimed == true) {
                    const btn_unlocked = CreateButton0(
                        scene,
                        container_inner,
                        694 + 288 / 2,
                        169 + 72 / 2,
                        "home_reward_btn_unlocked",
                        "Unlocked"
                    );
                    container_item.btn_unlocked = btn_unlocked;
                } else if (!achievement._id) {
                    // Achievement không có _id, hiển thị trạng thái "Locked" hoặc "Not Available"
                    const btn_locked = CreateButton0(
                        scene,
                        container_inner,
                        694 + 288 / 2,
                        169 + 72 / 2,
                        "home_reward_btn_locked",
                        "Locked"
                    );
                    btn_locked.button.setTint(0x666666); // Làm mờ button
                    container_item.btn_locked = btn_locked;
                }

                CreateRewardList(scene, container_item);
                scrollablePanel
                    .getElement("panel")
                    .add(container_item, { expand: false });
            });

            scrollablePanel.layout();

            maskShape = scene.add
                .rectangle(
                    posX,
                    posY,
                    scrollViewWidth,
                    scrollViewHeight,
                    0x000000
                )
                .setVisible(false);
            container_stage_list.add(maskShape);

            mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
            scrollablePanel.setMask(mask);
        },
        (error) => {
            HideLoadingPopup();
            CreateAlertPopup(scene, "Failed to load achievements: " + error);
        }
    );
}

function CreateButton0(scene, container, x, y, imageKey, buttonName) {
    let btnWidth = 288;
    let btnHeight = 72;
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
        .setInteractive({ useHandCursor: true });
    btn_inner_container.add(btn_container.button);
    const text = scene.add
        .text(
            btnWidth / 2,
            btnHeight / 2 - 4,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeAchivevement.KEY,
                buttonName
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "36px",
                color: "#FFF",
                align: "center",
            }
        )
        .setOrigin(0.5, 0.5);
    btn_inner_container.add(text);
    return btn_container;
}

function CreateRewardList(scene, fatherContainer) {
    let container_reward_list = scene.add.container(0, 0);
    fatherContainer.container_inner.add(container_reward_list);
    const columns = fatherContainer.achievement.itemRewards.length;
    const scrollViewWidth = 650;
    const scrollViewHeight = 110;

    // Align to the left, matching the padding of the text elements above (14px).
    const posX = 14 + scrollViewWidth / 2;
    const posY = 229 + scrollViewHeight / 2;

    const scrollablePanel = scene.rexUI.add
        .scrollablePanel({
            x: posX,
            y: posY,
            width: scrollViewWidth,
            height: scrollViewHeight,
            scrollMode: 1, // Horizontal layout
            panel: {
                child: scene.rexUI.add.gridSizer({
                    column: columns,
                    row: 1,
                    space: { column: 10 },
                }),
            },
            // Disable user interaction
            scroller: false,
            mouseWheelScroller: false,
        })
        .layout();
    container_reward_list.add(scrollablePanel);

    CreateItemRewardList(scene, scrollablePanel, fatherContainer);
    scrollablePanel.layout();
}

function CreateItemRewardList(scene, scrollablePanel, fatherContainer) {
    if (fatherContainer.achievement.itemRewards) {
        fatherContainer.achievement.itemRewards.forEach((reward) => {
            let item = CreateItemReward(scene, scrollablePanel);
            item.text_value.setText("x" + reward.quantity);
            let itemData = centerDataItem.getItemById(reward.item);
            if (itemData && itemData.imgKey) {
                item.icon.setTexture(itemData.imgKey).setDisplaySize(70, 70);
            } else {
                item.icon
                    .setTexture("home_top_currency_chip_1")
                    .setDisplaySize(70, 70);
            }
        });
    }
}

function CreateItemReward(scene, scrollablePanel) {
    let itemWidth = 110,
        itemHeight = 110;
    const item = scene.add.container(0, 0).setSize(itemWidth, itemHeight);
    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    item.add(container_inner);
    item.bg = scene.add.image(0, 0, "home_reward_item_bg").setOrigin(0, 0);
    container_inner.add(item.bg);
    item.icon = scene.add
        .image(itemWidth / 2, itemHeight / 2, "home_top_currency_chip_1")
        .setDisplaySize(70, 70);
    container_inner.add(item.icon);
    item.text_value = scene.add
        .text(95, 95, 0, {
            fontFamily: "Russo One",
            fontSize: "24px",
            color: "#ffffff",
            align: "right",
            stroke: "#000000",
            strokeThickness: 5,
        })
        .setOrigin(1, 1);
    container_inner.add(item.text_value);
    scrollablePanel.getElement("panel").add(item);
    return item;
}

export function Close() {
    if (!isOpen) return;
    isOpen = false;
    if (container_stage_list) {
        container_stage_list.destroy();
        container_stage_list = null;
    }
    if (maskShape) maskShape.destroy();
    if (mask) mask.destroy();
}
