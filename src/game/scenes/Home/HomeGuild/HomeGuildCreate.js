import centerData from "../../../Data/CenterData.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";
import { CreateGuild } from "./HomeGuild.js";
import { CreateGuildNone } from "./HomeGuildNone.js";

export function CreateGuildCreate(scene) {
    LoadAssetsDone(scene);
}

let container_main = null;

let container_item_list = null;

let container_buttons = null;

let input_guild_name = "";

let input_guild_description = "";

let selectedAvatarKey = "";

function LoadAssetsDone(scene) {
    Destroy();

    container_main = scene.add.container(0, 0);
    container_main.setDepth(200);

    const lock_bg = scene.add
        .image(0, 0, "home_guild_bg")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true });

    container_main.add(lock_bg);

    container_buttons = scene.add.container(0, 0);
    container_main.add(container_buttons);

    let text_title = scene.add
        .text(
            606.5,
            274,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                "Guild"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "38px",
                color: "#ffffff",
                align: "center",
            }
        )
        .setOrigin(0.5, 0);

    container_main.add(text_title);

    input_guild_name = "";
    CreateGuildNameInput(scene, function (value) {
        input_guild_name = value;
    });

    input_guild_description = "";
    CreateGuildDescriptionInput(scene, function (value) {
        input_guild_description = value;
    });

    let btn_create_guild = CreateButton0(
        scene,
        container_main,
        376 + 328 / 2,
        709 + 86 / 2,
        "Create Guild"
    );
    container_main.add(btn_create_guild);

    btn_create_guild.button.on("pointerdown", function () {
        CreateGuildRequest(scene);
    });

    let text_note = scene.add
        .text(
            540,
            916,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                "To create a guild you need 10000 M-Coin and campaign pass over stage 20"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "38px",
                color: "#ffffff",
                align: "center",
                wordWrap: { width: 845, useAdvancedWrap: true },
            }
        )
        .setOrigin(0.5, 0);

    container_main.add(text_note);

    CreateAvatarList(scene);

    //create close btn
    const btn_close = scene.add
        .image(38 + 118 / 2, 248 + 90 / 2, "share_btn_home_2")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            Close(scene);
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_close,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_close,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });

    container_buttons.add(btn_close);
}

function CreateGuildRequest(scene) {
    if (input_guild_name == "") {
        CreateAlertPopup(scene, "Please enter guild's name");
        return;
    }

    if (input_guild_name.length > 20) {
        CreateAlertPopup(scene, "Guild's name must be less than 20 characters");
        return;
    }

    if (input_guild_description == "") {
        CreateAlertPopup(scene, "Please enter guild's description");
        return;
    }

    if (input_guild_description.length > 20) {
        CreateAlertPopup(
            scene,
            "Guild's description must be less than 20 characters"
        );
        return;
    }

    if (centerData.userInfo.Musk < 10000) {
        CreateAlertPopup(scene, "You need 10000 M-Coin to create a guild");
        return;
    }

    if (centerData.userInfo.CurrentStage < 20) {
        CreateAlertPopup(scene, "You need to pass stage 20 to create a guild");
        return;
    }

    centerData.RequestPostCreateGuild(
        input_guild_name,
        input_guild_description,
        selectedAvatarKey,
        () => {
            CreateAlertPopup(scene, "Create guild success");

            Destroy(scene);

            CreateGuild(scene);
        },
        (error) => {
            CreateAlertPopup(scene, "Create guild failed\n" + error);
        }
    );
}

function CreateButton0(scene, container, x, y, buttonName) {
    let btnWidth = 328;
    let btnHeight = 86;

    const btn_container = scene.add.container(x, y);
    container.add(btn_container);

    const btn_inner_container = scene.add.container(
        -btnWidth / 2,
        -btnHeight / 2
    );
    btn_container.add(btn_inner_container);

    btn_container.button = scene.add
        .image(0, 0, "home_guild_btn_play")
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
                cdLocalization.GROUP_KEYS.Main.KEY,
                buttonName
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "38px", // Font-size
                color: "#FFF", // Màu chữ (color)
                align: "center",
            }
        )
        .setOrigin(0.5, 0.5);

    btn_inner_container.add(text);

    return btn_container;
}

function CreateGuildNameInput(scene, onValueChange) {
    let placeHolderStr = cdLocalization.getLocalization(
        cdLocalization.GROUP_KEYS.CenterMarket.KEY,
        "Enter guild's name"
    );

    let fontStr = cdLocalization.getCurrentFont();

    // Tạo input HTML
    const inputHTML = `
<form id="converter-guild-name-form">
    <input 
        type="text" 
        min="0"
        step="1"  
        id="guildNameInput" 
        placeholder="${placeHolderStr}"
        maxlength="64"
        style="
            width:944px; 
            height: 70px;
            padding: 20px; 
            border-radius:10px; 
            font-size: 32px; 
            font-family: ${fontStr};
            background-color: rgba(0, 0, 0, 0.6); /* Màu nền của input */
            color: #ffffff; /* Màu chữ của text */
            z-index: 1000; /* Đưa lên trên cùng */
        "
    />
    <style>
        #quantityInput::placeholder {
            color: #ffffff; /* Màu chữ của placeholder */
            opacity: 0.5; /* Đảm bảo hiển thị rõ ràng placeholder */
        }
        #quantityInput:focus {
            outline: none; /* Bỏ viền focus mặc định */
            border: 2px solid #ffffff; /* Thêm viền khi focus */
        }
    </style>
</form>
`;

    // Thêm input field vào game
    const form_element = scene.add
        .dom(540, 427 + 89 / 2) // Vị trí trung tâm màn hình
        .createFromHTML(inputHTML);

    container_main.add(form_element);

    // Lấy phần tử input
    const inputElement = document.getElementById("guildNameInput");
    const inputForm = document.getElementById("converter-guild-name-form"); // Lấy đối tượng FORM

    // Tạo handler cho sự kiện SUBMIT
    const submitHandler = (event) => {
        // NGĂN CHẶN HÀNH VI MẶC ĐỊNH của form (reload trang)
        event.preventDefault();
    };

    // Thêm listener cho sự kiện submit (khi nhấn Enter)
    if (inputForm) {
        inputForm.addEventListener("submit", submitHandler);
    }

    // Xử lý sự kiện nhập dữ liệu
    inputElement.addEventListener("input", () => {
        if (onValueChange && typeof onValueChange === "function") {
            // Gọi callback với giá trị hợp lệ
            onValueChange(inputElement.value);
        }
    });

    // Xử lý sự kiện click ra ngoài
    document.addEventListener("click", (event) => {
        if (!inputElement.contains(event.target)) {
            inputElement.blur(); // Hủy trạng thái focus
        }
    });
}

function CreateGuildDescriptionInput(scene, onValueChange) {
    let placeHolderStr = cdLocalization.getLocalization(
        cdLocalization.GROUP_KEYS.CenterMarket.KEY,
        "Enter guild's description"
    );

    let fontStr = cdLocalization.getCurrentFont();

    // Tạo input HTML
    const inputHTML = `
<form id="converter-guild-description-form">
    <input 
        type="text" 
        min="0"
        step="1"  
        id="guildDescriptionInput" 
        placeholder="${placeHolderStr}"
        maxlength="64"
        style="
            width:944px; 
            height: 70px;
            padding: 20px; 
            border-radius:10px; 
            font-size: 32px; 
            font-family: ${fontStr};
            background-color: rgba(0, 0, 0, 0.6); /* Màu nền của input */
            color: #ffffff; /* Màu chữ của text */
            z-index: 1000; /* Đưa lên trên cùng */
        "
    />
    <style>
        #quantityInput::placeholder {
            color: #ffffff; /* Màu chữ của placeholder */
            opacity: 0.5; /* Đảm bảo hiển thị rõ ràng placeholder */
        }
        #quantityInput:focus {
            outline: none; /* Bỏ viền focus mặc định */
            border: 2px solid #ffffff; /* Thêm viền khi focus */
        }
    </style>
</form>
`;

    // Thêm input field vào game
    const form_element = scene.add
        .dom(540, 569 + 89 / 2) // Vị trí trung tâm màn hình
        .createFromHTML(inputHTML);

    container_main.add(form_element);

    // Lấy phần tử input
    const inputElement = document.getElementById("guildDescriptionInput");
    const inputForm = document.getElementById(
        "converter-guild-description-form"
    ); // Lấy đối tượng FORM

    // Tạo handler cho sự kiện SUBMIT
    const submitHandler = (event) => {
        // NGĂN CHẶN HÀNH VI MẶC ĐỊNH của form (reload trang)
        event.preventDefault();
    };

    // Thêm listener cho sự kiện submit (khi nhấn Enter)
    if (inputForm) {
        inputForm.addEventListener("submit", submitHandler);
    }

    // Xử lý sự kiện nhập dữ liệu
    inputElement.addEventListener("input", () => {
        if (onValueChange && typeof onValueChange === "function") {
            // Gọi callback với giá trị hợp lệ
            onValueChange(inputElement.value);
        }
    });

    // Xử lý sự kiện click ra ngoài
    document.addEventListener("click", (event) => {
        if (!inputElement.contains(event.target)) {
            inputElement.blur(); // Hủy trạng thái focus
        }
    });
}

export function CreateAvatarList(scene) {
    let itemData = [];

    for (let i = 0; i < 10; i++) {
        const newItem = {
            avatarKey: "GA" + (i + 1),
        };
        itemData.push(newItem);
    }

    selectedAvatarKey = itemData[0].avatarKey;

    container_item_list = scene.add.container(0, 0);
    container_main.add(container_item_list);

    const scrollViewWidth = 845;

    const scrollViewHeight = 920;

    const spaceWidth = 10 / 2;

    const spaceHeight = 10 / 2;

    const cellWidth = 200;

    const cellHeight = 170;

    const posX = 120 + scrollViewWidth / 2 + cellWidth / 2 + spaceWidth * 2;

    const posY = 1000 + scrollViewHeight / 2;

    // const grid_bg = scene.rexUI.add.roundRectangle(
    //     posX,
    //     posY,
    //     scrollViewWidth,
    //     scrollViewHeight,
    //     0,
    //     0x000000,
    //     0.5
    // );
    // container_popup_select_popup.add(grid_bg);

    const gridTable = scene.rexUI.add
        .gridTable({
            x: posX,
            y: posY,
            width: scrollViewWidth,
            height: scrollViewHeight,
            scrollMode: 0,

            table: {
                cellWidth: cellWidth + spaceWidth,
                cellHeight: cellHeight + spaceHeight,
                columns: 4,
                //reuseCellContainer: true, // Kích hoạt tái sử dụng cell container
            },

            mouseWheelScroller: {
                focus: false,
                speed: 1,
            },

            items: itemData, // Gán danh sách item vào gridTable

            createCellContainerCallback: (cell, cellContainer) => {
                var scene = cell.scene,
                    width = cell.width,
                    height = cell.height,
                    item = cell.item,
                    index = cell.index;
                if (cellContainer === null) {
                    cellContainer = scene.rexUI.add.label({
                        width: width,
                        height: cellHeight,
                        orientation: 0,
                    });
                } else {
                    //console.log(cell.index + ": reuse cell-container");
                }

                cellContainer.add(CreateAvatarItem(scene, index, item));

                return cellContainer;
            },

            space: {
                // left: 50,
                // right: 0,
                top: 20,
                // bottom: 0,
                // row: 0,
            },
        })
        .layout();

    gridTable.isDragging = false;

    scene.input.on("pointerup", (pointer) => {
        gridTable.isDragging = false;
    });

    container_item_list.add(gridTable);
    container_item_list.gridTable = gridTable;

    // const gridOrigin = scene.rexUI.add.roundRectangle(
    //     gridTable.x,
    //     gridTable.y,
    //     50,
    //     50,
    //     0,
    //     0xffffff,
    //     1
    // );
    // container_item_list.add(gridOrigin);

    const maskShape = scene.add
        .rectangle(
            540,
            1000 + scrollViewHeight / 2,
            scrollViewWidth,
            scrollViewHeight,
            0x000000
        )
        .setVisible(false);

    const mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    gridTable.setMask(mask);

    CheckSelectedCards();
}

function CreateAvatarItem(scene, i, item) {
    let container_card = scene.add.container(0, 0);

    container_card.item = item;

    let container_card_inner = scene.add.container(-200 / 2, -200 / 2);
    container_card.add(container_card_inner);

    let item_avatar = scene.add
        .image(200 / 2, 200 / 2, item.avatarKey)
        .setOrigin(0.5, 0.5)
        .setDisplaySize(200, 170)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function (pointer) {
            //console.log("btn_item clicked");

            container_item_list.gridTable.startY = pointer.y;

            container_item_list.gridTable.isDragging = true;

            container_card.startTime = scene.time.now; // Lấy thời gian hiện tại khi nhấn chuột
        })
        .on("pointermove", function (pointer) {
            //console.log("btn_item pointermove");

            if (!container_item_list.gridTable.isDragging) return;

            const deltaY = pointer.y - container_item_list.gridTable.startY; // Tính độ chênh lệch so với vị trí trước đó
            container_item_list.gridTable.startY = pointer.y; // Cập nhật startY cho lần di chuyển tiếp theo

            let itemHeight = 170;

            let itemCount = container_item_list.gridTable.items.length;

            let columns = 3;

            let rows = Math.ceil(itemCount / columns);

            let maxHeight = itemHeight * rows;

            let tPerPixel = 1 * (itemHeight / maxHeight);

            let smoothVal = 0.005;

            // Tính toán giá trị T hiện tại của bảng và điều chỉnh theo deltaY
            let currentT =
                container_item_list.gridTable.t -
                deltaY * (tPerPixel * smoothVal); // Điều chỉnh tốc độ cuộn
            currentT = Phaser.Math.Clamp(currentT, 0, 1); // Đảm bảo T nằm trong phạm vi 0-1

            container_item_list.gridTable.setT(currentT); // Cập nhật vị trí cuộn của bảng
        })
        .on("pointerup", function (pointer) {
            //console.log("btn_item pointerup");

            if (container_item_list.gridTable.isDragging == false) {
                //do something if it is seleted not dragging
            }

            container_item_list.gridTable.isDragging = false; // Dừng kéo

            const endTime = scene.time.now; // Lấy thời gian hiện tại khi thả chuột
            const duration = endTime - container_card.startTime; // Tính thời gian giữa hai sự kiện

            if (duration <= 125) {
                SelectAvatar(scene, container_card);
            }
        })
        .on("pointerover", function (pointer) {
            if (container_item_list.gridTable.isDragging == true) {
                container_item_list.gridTable.startY = pointer.y;
            }

            container_card.each(function (child) {
                if (child.setTint) {
                    child.setTint(0x646464); // Màu tint bạn muốn áp dụng
                }
            });
        })
        .on("pointerout", function (pointer) {
            container_card.each(function (child) {
                if (child.clearTint) {
                    child.clearTint(); // Xóa tint
                }
            });
        });
    container_card_inner.add(item_avatar);

    let using = scene.add
        .image(0, 0, "home_guild_avatar_using")
        .setDisplaySize(64, 64)
        .setOrigin(0.5, 0.5)
        .setPosition(200 * 0.75, 170 * 0.8);
    container_card_inner.add(using);

    container_card.setUsing = function (boolVal) {
        using.setVisible(boolVal);
    };

    if (selectedAvatarKey == item.avatarKey) {
        container_card.setUsing(true);
    } else {
        container_card.setUsing(false);
    }

    return container_card;
}

function CheckSelectedCards() {
    let activeCells = [];

    //console.log("selectedAvatarKey = "+selectedAvatarKey);

    for (let i = 0; i < container_item_list.gridTable.items.length; i++) {
        const cellContainer = container_item_list.gridTable.getCellContainer(i);
        if (cellContainer) {
            activeCells.push(cellContainer);

            //console.log(`CellContainer at index ${i}:`, cellContainer);

            let card = cellContainer.children[0];

            if (selectedAvatarKey == card.item.avatarKey) {
                //console.log("selectedAvatarKey = "+selectedAvatarKey);

                card.setUsing(true);
            } else {
                card.setUsing(false);
            }
        } else {
            //console.warn(`No CellContainer found at index ${i}`);
        }
    }

    //console.log("activeCells:", activeCells);
}

function SelectAvatar(scene, container_card) {
    if (container_card.item.avatarKey !== selectedAvatarKey) {
        selectedAvatarKey = container_card.item.avatarKey;

        CheckSelectedCards();
    }
}

function Close(scene) {
    Destroy();

    CreateGuildNone(scene);
}

function Destroy() {
    if (container_main) {
        container_main.destroy();
    }
    if (container_buttons) {
        container_buttons.destroy();
    }
}
