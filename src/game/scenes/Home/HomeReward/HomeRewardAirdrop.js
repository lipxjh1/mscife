import { openTelegramLink } from "@telegram-apps/sdk";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import centerData from "../../../Data/CenterData.js";
import { container_main, container_popup } from "./HomeReward.js";
import centerDataItem from "../../../Data/CenterDataItem.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import { isTelegramMiniApp } from "../../../utils.js";
import {
    CreateSelectInvitePopup,
    getWebInviteUrl,
} from "../../Share/PopupCopyInviteUrl.js";

let container_airdrop = null;
let maskShape = null;
let mask = null;

let data = [
    // {
    //     code: "AIR_DROP_PI",
    //     chip: 10000,
    //     musk: 0,
    //     item: {
    //         code: "BOX_ALL_C_RANK",
    //         quantity: 1,
    //     },
    //     title: "Airdrop for PI Community",
    //     description:
    //         "Enter your community ID to earn 10000 Chip, 1 C characters box",
    //     type: "ONETIME",
    //     payload: "",
    //     status: 0,
    // },
    {
        code: "AIR_DROP_HAMSTER",
        chip: 10000,
        musk: 0,
        item: {
            code: "BOX_ALL_C_RANK",
            quantity: 1,
        },
        title: "Airdrop for Hamster Kombat Community",
        description:
            "Enter your community ID to earn 10000 Chip, 1 C characters box",
        type: "ONETIME",
        payload: "",
        status: 0,
    },
    {
        code: "AIR_DROP_DOGS",
        chip: 10000,
        musk: 0,
        item: {
            code: "BOX_ALL_C_RANK",
            quantity: 1,
        },
        title: "Airdrop for Dogs Community",
        description:
            "Enter your community ID to earn 10000 Chip, 1 C characters box",
        type: "ONETIME",
        payload: "",
        status: 0,
    },
    {
        code: "AIR_DROP_X",
        chip: 10000,
        musk: 0,
        item: {
            code: "BOX_ALL_C_RANK",
            quantity: 1,
        },
        title: "Airdrop for X Empire Community",
        description:
            "Enter your community ID to earn 10000 Chip, 1 C characters box",
        type: "ONETIME",
        payload: "",
        status: 0,
    },
    {
        code: "AIR_DROP_SEED",
        chip: 10000,
        musk: 0,
        item: {
            code: "BOX_ALL_C_RANK",
            quantity: 1,
        },
        title: "Airdrop for SEED Community",
        description:
            "Enter your community ID to earn 10000 Chip, 1 C characters box",
        type: "ONETIME",
        payload: "",
        status: 0,
    },
];

function GetIconById(code) {
    switch (code) {
        case "AIR_DROP_HAMSTER": {
            return "home_reward_airdrop_icon_hamster_kombat";
        }
        case "AIR_DROP_DOGS": {
            return "home_reward_airdrop_icon_dogs";
        }
        case "AIR_DROP_X": {
            return "home_reward_airdrop_icon_x";
        }
        case "AIR_DROP_SEED": {
            return "home_reward_airdrop_icon_seed";
        }
        // case "AIR_DROP_PI": {
        //     return "home_reward_airdrop_icon_pi";
        // }
    }
    return "";
}

function CreateAirdrop(scene) {
    CreateList(scene, data);
}

export function ActiveAirdrop(scene, isActive) {
    if (container_airdrop) {
        if (isActive) {
            container_airdrop.setPosition(0, 0);
        } else {
            container_airdrop.setPosition(4000, 0);
        }
    } else if (container_airdrop == null && isActive) {
        CreateAirdrop(scene);
    }
}

// Function to check if element is within mask bounds
function isElementInMaskBounds(element, maskBounds) {
    const elementBounds = element.getBoundingClientRect();
    const containerBounds = maskBounds;

    return !(
        elementBounds.bottom < containerBounds.top ||
        elementBounds.top > containerBounds.bottom ||
        elementBounds.right < containerBounds.left ||
        elementBounds.left > containerBounds.right
    );
}

// Function to update input visibility
function updateInputVisibility(scene, scrollablePanel) {
    if (!maskShape) return;

    const INPUT_HEIGHT = 59; // Chiều cao của input form

    const maskBounds = {
        top: maskShape.y - maskShape.height / 2,
        bottom: maskShape.y + maskShape.height / 2,
        left: maskShape.x - maskShape.width / 2,
        right: maskShape.x + maskShape.width / 2,
    };

    // Điều chỉnh vùng hiển thị để tính cả chiều cao của input
    const visibleBounds = {
        top: maskBounds.top + INPUT_HEIGHT / 2,
        bottom: maskBounds.bottom - INPUT_HEIGHT / 2,
        left: maskBounds.left,
        right: maskBounds.right,
    };

    const forms = container_airdrop.list.filter(
        (el) => el.inputElement && el.inputHTML
    );

    forms.forEach((form) => {
        const worldPosition = form.getWorldTransformMatrix();
        const formX = worldPosition.tx;
        const formY = worldPosition.ty;

        // Kiểm tra với vùng hiển thị đã được điều chỉnh
        const isVisible =
            formY >= visibleBounds.top &&
            formY <= visibleBounds.bottom &&
            formX >= visibleBounds.left &&
            formX <= visibleBounds.right;

        if (form.inputElement) {
            form.inputElement.style.visibility = isVisible
                ? "visible"
                : "hidden";
        }
    });
}

function CreateList(scene, arr_data) {
    Destroy();

    container_airdrop = scene.add.container(0, 0);
    container_popup.add(container_airdrop);

    if (!arr_data || arr_data.length <= 0) {
        return;
    }

    const scrollViewWidth = 1080;
    const scrollViewHeight = 1538;
    const columns = 1;
    const rows = Math.ceil(arr_data.length / columns);
    const itemWidth = 1004;
    const itemHeight = 391;
    const itemSpacing = 30;
    const posX = 38 + scrollViewWidth / 2;
    const posY = 382 + scrollViewHeight / 2;

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
                    columnProportions: 0,
                    rowProportions: 0,
                    space: {
                        column: itemSpacing,
                        row: itemSpacing,
                    },
                }),
                mask: {
                    padding: 1,
                },
            },
            mouseWheelScroller: {
                focus: false,
                speed: 0.2,
            },
            space: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 40,
            },
        })
        .layout();

    container_airdrop.add(scrollablePanel);

    // Add scroll event handler for visibility updates
    scrollablePanel.on("scroll", function () {
        updateInputVisibility(scene, scrollablePanel);
    });

    for (let i = 0; i < arr_data.length; i++) {
        if (
            IsCodeDone() == false ||
            (IsCodeDone() &&
                arr_data[i].code === centerData.userInfo.OtherGameCode)
        ) {
            const container_airdrop_unit = scene.add.container(0, 0);
            container_airdrop_unit.setSize(itemWidth, itemHeight);
            container_airdrop_unit.quest = arr_data[i];

            let container_inner = scene.add.container(-1004 / 2, -391 / 2);
            container_airdrop_unit.add(container_inner);

            let bg = scene.rexUI.add
                .roundRectangle(0, 0, 1004, 391, 0, 0x4e4e4e, 0.4)
                .setOrigin(0, 0);
            container_inner.add(bg);

            const text_title = scene.add
                .text(14, 10.5, "None", {
                    fontFamily: cdLocalization.getCurrentFont(),
                    fontSize: "38px",
                    color: "#ffffff",
                    align: "left",
                    wordWrap: { width: 680, useAdvancedWrap: true },
                })
                .setOrigin(0, 0);
            container_inner.add(text_title);

            if (container_airdrop_unit.quest.title) {
                text_title.setText(
                    cdLocalization.getLocalization(
                        cdLocalization.GROUP_KEYS.HomeAirdrop.KEY,
                        container_airdrop_unit.quest.title
                    )
                );
            } else {
                text_title.setText(
                    container_airdrop_unit.quest.code.replaceAll("_", " ")
                );
            }

            const text_description = scene.add
                .text(
                    14,
                    97,
                    cdLocalization.getLocalization(
                        cdLocalization.GROUP_KEYS.HomeAirdrop.KEY,
                        container_airdrop_unit.quest.description
                    ),
                    {
                        fontFamily: cdLocalization.getCurrentFont(),
                        fontSize: "28px",
                        color: "#ffffff",
                        align: "left",
                        wordWrap: { width: 648, useAdvancedWrap: true },
                    }
                )
                .setOrigin(0, 0);
            container_inner.add(text_description);

            const icon = scene.add
                .image(
                    730 + 225 / 2,
                    30 + 225 / 2,
                    GetIconById(container_airdrop_unit.quest.code)
                )
                .setOrigin(0.5, 0.5);
            container_inner.add(icon);

            // Reward containers setup
            const containter_reward_0 = scene.add.container(
                14 + 94 / 2,
                267 + 94 / 2
            );
            container_inner.add(containter_reward_0);

            const reward_0 = scene.add
                .image(0, 0, "home_reward_item_bg")
                .setOrigin(0.5, 0.5);
            containter_reward_0.add(reward_0);

            const reward_0_chip = scene.add
                .image(0, 0, "home_top_currency_chip_1")
                .setOrigin(0.5, 0.5);
            containter_reward_0.add(reward_0_chip);

            let reward_0_text = scene.add
                .text(
                    94 / 2 - 5,
                    94 / 2 - 5,
                    "x" + container_airdrop_unit.quest.chip,
                    {
                        fontFamily: "Russo One",
                        fontSize: "24px",
                        color: "#ffffff",
                        align: "right",
                    }
                )
                .setOrigin(1, 1);
            containter_reward_0.add(reward_0_text);

            const containter_reward_1 = scene.add.container(
                132 + 94 / 2,
                267 + 94 / 2
            );
            container_inner.add(containter_reward_1);

            const reward_1 = scene.add
                .image(0, 0, "home_reward_item_bg")
                .setOrigin(0.5, 0.5);
            containter_reward_1.add(reward_1);

            const reward_1_chip = scene.add
                .image(
                    0,
                    0,
                    centerDataItem.getItemById(
                        container_airdrop_unit.quest.item.code
                    ).imgKey
                )
                .setOrigin(0.5, 0.5)
                .setDisplaySize(64, 64);
            containter_reward_1.add(reward_1_chip);

            let reward_1_text = scene.add
                .text(
                    94 / 2 - 5,
                    94 / 2 - 5,
                    "x" + container_airdrop_unit.quest.item.quantity,
                    {
                        fontFamily: "Russo One",
                        fontSize: "24px",
                        color: "#ffffff",
                        align: "right",
                    }
                )
                .setOrigin(1, 1);
            containter_reward_1.add(reward_1_text);

            if (IsCodeDone() == false) {
                let input_text = CreateInputText(
                    scene,
                    "input_text" + container_airdrop_unit.quest.code,
                    OnInPutValueChange
                );
                input_text.setPosition(278 + 400 / 2, 295 + 59 / 2);
                container_inner.add(input_text);

                function OnInPutValueChange(value) {
                    if (input_text.inputValue && input_text.inputValue !== "") {
                        container_airdrop_unit.setActiveClaimButtons(true);
                    } else {
                        container_airdrop_unit.setActiveClaimButtons(false);
                    }
                }

                const btn_claim = CreateButton0(
                    scene,
                    container_inner,
                    702 + 288 / 2,
                    297 + 72 / 2,
                    "home_reward_airdrop_btn_claim_1",
                    "Claim"
                );
                btn_claim.button.on("pointerdown", function () {
                    if (input_text.inputValue && input_text.inputValue !== "") {
                        SendRequestClaim(
                            scene,
                            arr_data[i].code,
                            container_airdrop_unit.quest.code,
                            input_text.inputValue
                        );
                    }
                });
                container_airdrop_unit.btn_claim = btn_claim;

                const btn_claim_lock = CreateButton0(
                    scene,
                    container_inner,
                    702 + 288 / 2,
                    297 + 72 / 2,
                    "home_reward_airdrop_btn_claim_0",
                    "Claim"
                );
                container_airdrop_unit.btn_claim_lock = btn_claim_lock;

                container_airdrop_unit.setActiveClaimButtons = function (
                    isActive
                ) {
                    container_airdrop_unit.btn_claim.setVisible(isActive);
                    container_airdrop_unit.btn_claim_lock.setVisible(!isActive);
                };

                container_airdrop_unit.setActiveClaimButtons(false);
            } else {
                text_title.setText(
                    cdLocalization.getLocalization(
                        cdLocalization.GROUP_KEYS.HomeAirdrop.KEY,
                        "Invite your friends to claim more rewards"
                    )
                );

                text_description.setText("");

                const text_id = scene.add
                    .text(
                        278 + 400 / 2,
                        295 + 59 / 2,
                        cdLocalization.getLocalization(
                            cdLocalization.GROUP_KEYS.HomeAirdrop.KEY,
                            "Your ID: "
                        ) + centerData.userInfo.OtherGameId,
                        {
                            fontFamily: cdLocalization.getCurrentFont(),
                            fontSize: "36px",
                            color: "#ffffff",
                            align: "center",
                            wordWrap: { width: 680, useAdvancedWrap: true },
                        }
                    )
                    .setOrigin(0.5, 0);
                container_inner.add(text_id);

                const btn_invite = CreateButton0(
                    scene,
                    container_inner,
                    14 + 288 / 2,
                    140 + 72 / 2,
                    "home_reward_btn_invite",
                    "Invite"
                );
                btn_invite.button.on("pointerdown", async function () {
                    if (await isTelegramMiniApp()) {
                        openTelegramLink(centerData.GetTelegramShareUrl());
                    } else {
                        window.open(
                            getWebInviteUrl(centerData.userInfo.UserId),
                            "_blank"
                        );
                    }
                });

                const btn_invite_link = CreateButton0(
                    scene,
                    container_inner,
                    304 + 288 / 2,
                    140 + 72 / 2,
                    "home_reward_btn_invite_link",
                    "Invite Link"
                );
                btn_invite_link.button.on("pointerdown", async function () {
                    CreateSelectInvitePopup(scene);
                });
            }

            scrollablePanel.getElement("panel").add(container_airdrop_unit, {
                align: "top-left",
                expand: false,
            });
        }
    }

    scrollablePanel.layout();

    if (IsCodeDone()) {
        CreateThanksPopup(
            scene,
            centerData.userInfo.OtherGameCode,
            scrollablePanel
        );
    }

    maskShape = scene.add
        .rectangle(0 + 1080 / 2, 382 + 1538 / 2, 1080, 1538, 0x000000)
        .setVisible(false);
    container_airdrop.add(maskShape);

    mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    scrollablePanel.setMask(mask);

    // Initial visibility check after everything is set up
    updateInputVisibility(scene, scrollablePanel);
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
            btnHeight / 2 - 4,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeAirdrop.KEY,
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

function IsCodeDone() {
    if (
        centerData.userInfo.OtherGameCode &&
        centerData.userInfo.OtherGameCode !== ""
    ) {
        return true;
    }
    return false;
}

function SendRequestClaim(scene, code, OtherGameCode, OtherGameId) {
    CreateLoadingPopup();

    centerData.RequestUpdateOtherGameInfo(
        OtherGameCode,
        OtherGameId,
        (result) => {
            HideLoadingPopup();

            centerData.userInfo.OtherGameCode = OtherGameCode;
            centerData.userInfo.OtherGameId = OtherGameId;

            CreateList(scene, data);

            CreateAlertPopup(
                scene,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeAirdrop.KEY,
                    "Claim success"
                )
            );
        },
        (error) => {
            HideLoadingPopup();
            CreateAlertPopup(scene, "Claim failed");
        }
    );
}

function CreateInputText(scene, inputId, onValueChange) {
    const inputHTML = `
    <form id="converter-form-${inputId}">
        <input 
            type="text" 
            min="0" 
            id="${inputId}" 
            placeholder="Your network id"
            style="
                width:400px; 
                padding: 14px;
                font-size: 36px; 
                font-family: RussoOne, sans-serif;
                background-color: rgba(0, 0, 0, 0.6);
                color: #ffffff;
            "
        />
        <style>
            #${inputId}::placeholder {
                color: #ffffff;
                opacity: 0.5;
            }
            #${inputId}:focus {
                outline: none;
                border: 2px solid #ffffff;
            }
        </style>
    </form>
    `;

    const form_element = scene.add.dom(0, 0).createFromHTML(inputHTML);
    form_element.inputHTML = inputHTML;

    const inputElement = document.getElementById(inputId);
    form_element.inputElement = inputElement;
    const inputForm = document.getElementById(`converter-form-${inputId}`); // Lấy đối tượng FORM

    // Tạo handler cho sự kiện SUBMIT
    const submitHandler = (event) => {
        // NGĂN CHẶN HÀNH VI MẶC ĐỊNH của form (reload trang)
        event.preventDefault();
    };

    // Thêm listener cho sự kiện submit (khi nhấn Enter)
    if (inputForm) {
        inputForm.addEventListener("submit", submitHandler);
    }

    inputElement.addEventListener("input", (event) => {
        if (document.activeElement === inputElement) {
            form_element.inputValue = inputElement.value;
            if (onValueChange && typeof onValueChange === "function") {
                onValueChange(form_element.inputValue);
            }
        }
    });

    const clickOutsideHandler = (event) => {
        if (!inputElement.contains(event.target)) {
            inputElement.blur();
        }
    };

    document.addEventListener("click", clickOutsideHandler);

    // Add position update handling
    const updateHandler = () => {
        if (maskShape && form_element.inputElement) {
            const INPUT_HEIGHT = 59;
            const worldPosition = form_element.getWorldTransformMatrix();
            const formX = worldPosition.tx;
            const formY = worldPosition.ty;

            const maskBounds = {
                top: maskShape.y - maskShape.height / 2,
                bottom: maskShape.y + maskShape.height / 2,
                left: maskShape.x - maskShape.width / 2,
                right: maskShape.x + maskShape.width / 2,
            };

            // Điều chỉnh vùng hiển thị để tính cả chiều cao của input
            const visibleBounds = {
                top: maskBounds.top + INPUT_HEIGHT / 2,
                bottom: maskBounds.bottom - INPUT_HEIGHT / 2,
                left: maskBounds.left,
                right: maskBounds.right,
            };

            const isVisible =
                formY >= visibleBounds.top &&
                formY <= visibleBounds.bottom &&
                formX >= visibleBounds.left &&
                formX <= visibleBounds.right;

            form_element.inputElement.style.visibility = isVisible
                ? "visible"
                : "hidden";
        }
    };

    scene.events.on("update", updateHandler);

    // Enhanced cleanup
    form_element.removeEventListeners = () => {
        inputElement.removeEventListener("input", onValueChange);
        document.removeEventListener("click", clickOutsideHandler);
        scene.events.off("update", updateHandler);
    };

    return form_element;
}

function CreateThanksPopup(scene, code, scrollablePanel) {
    const container_thanks_main = scene.add.container(0, 0);
    container_thanks_main.setSize(1004, 1400);

    const container_thanks_popup = scene.add.container(
        -38 - 1004 / 2,
        -1400 / 2 - 230
    );
    container_thanks_main.add(container_thanks_popup);

    // let lock_bg = scene.add
    //     .image(0, 0, "home_reward_airdrop_thanks_bg")
    //     .setOrigin(0, 0)
    //     .setInteractive({ useHandCursor: true });
    // container_thanks_popup.add(lock_bg);

    const text_tile = scene.add
        .text(
            540,
            253,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeAirdrop.KEY,
                "Thank you for your participation"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "54px",
                color: "#ffffff",
                align: "center",
                wordWrap: { width: 984, useAdvancedWrap: true },
            }
        )
        .setOrigin(0.5, 0);
    container_thanks_popup.add(text_tile);

    let com = "the_com";

    switch (code) {
        case "AIR_DROP_HAMSTER": {
            com = "Hamster Kombat";
            break;
        }
        case "AIR_DROP_DOGS": {
            com = "Dogs";
            break;
        }
        case "AIR_DROP_X": {
            com = "X";
            break;
        }
        case "AIR_DROP_SEED": {
            com = "SEED";
            break;
        }
        // case "AIR_DROP_PI": {
        //     com = "Pi";
        //     break;
        // }
    }

    const text_0 = scene.add
        .text(
            540,
            463,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeAirdrop.KEY,
                `Dear {i} Warriors`,
                [com]
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "46px",
                color: "#ffffff",
                align: "left",
                wordWrap: { width: 984, useAdvancedWrap: true },
            }
        )
        .setOrigin(0.5, 0);
    container_thanks_popup.add(text_0);

    let str_1 = cdLocalization.getLocalization(
        cdLocalization.GROUP_KEYS.HomeAirdrop.KEY,
        "ThanksContent",
        [com]
    );

    const text_1 = scene.add
        .text(540, 546, str_1, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "40px",
            color: "#ffffff",
            align: "left",
            wordWrap: { width: 984, useAdvancedWrap: true },
        })
        .setOrigin(0.5, 0);
    container_thanks_popup.add(text_1);

    scrollablePanel.getElement("panel").add(container_thanks_main, {
        align: "top-left",
        expand: false,
    });

    scrollablePanel.layout();
}

export function Destroy() {
    if (container_airdrop) {
        // Cleanup all event listeners before destroying
        const inputs = container_airdrop.list.filter(
            (el) => el.removeEventListeners
        );
        inputs.forEach((input) => input.removeEventListeners());

        container_airdrop.destroy();
        container_airdrop = null;
    }

    if (maskShape) {
        maskShape.destroy();
        maskShape = null;
    }

    if (mask) {
        mask.destroy();
        mask = null;
    }
}
