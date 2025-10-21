import centerData from "../../../Data/CenterData.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";
import { CreateGuild, GetMyGuild } from "./HomeGuild.js";

export function CreateGuildDonate(scene) {
    LoadAssetsDone(scene);
}

let container_main = null;

let container_buttons = null;

let donate_inputElement = null;
let input_donate = "";
let form_element = null;

let gridTable = null;

let currentPage = 0;

let totalPages = 0;

// Phân trang và cuộn vô hạn
let isUpdating = false;
const PAGE_LIMIT = 10;

let inputValue = 0;

let myGuild = null;

function LoadAssetsDone(scene) {
    Destroy();

    myGuild = GetMyGuild();

    inputValue = 0;

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
            }
        )
        .setOrigin(0.5, 0);

    container_main.add(text_title);

    let guildAvatar = scene.add
        .image(62 + 215 / 2, 392 + 215 / 2, myGuild.Avatar)
        .setScale(215 / 128);
    container_main.add(guildAvatar);

    let text_guild_name = scene.add
        .text(306, 406, myGuild.Name, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "28px",
            color: "#ffffff",
            align: "left",
        })
        .setOrigin(0, 0);
    container_main.add(text_guild_name);

    let text_guild_id = scene.add
        .text(306, 452, "ID: " + myGuild.GuildId, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "28px",
            color: "#cccccc",
            align: "left",
        })
        .setOrigin(0, 0);
    container_main.add(text_guild_id);

    let text_leader_username = scene.add
        .text(
            306,
            494,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                "Leader"
            ) +
                ": " +
                myGuild.Leader.Username,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "28px",
                color: "#cccccc",
                align: "left",
            }
        )
        .setOrigin(0, 0);
    container_main.add(text_leader_username);

    let text_leader_id = scene.add
        .text(
            306,
            531,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                "Leader ID"
            ) +
                ": " +
                myGuild.Leader.UserId,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "28px",
                color: "#cccccc",
                align: "left",
            }
        )
        .setOrigin(0, 0);
    container_main.add(text_leader_id);

    let text_description = scene.add
        .text(62, 621, myGuild.Description, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "28px",
            color: "#ffffff",
            align: "left",
        })
        .setOrigin(0, 0);
    container_main.add(text_description);

    let text_members = scene.add
        .text(
            62,
            text_description.y + 28,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                "Members"
            ) +
                ": " +
                myGuild.Members +
                "/" +
                myGuild.MaxMembers,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "28px",
                color: "#ffffff",
                align: "left",
            }
        )
        .setOrigin(0, 0);
    container_main.add(text_members);

    let text_treasury = scene.add
        .text(1006, 404, "Guild Treasury", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "36px",
            color: "#ffffff",
            align: "right",
        })
        .setOrigin(1, 0);
    container_main.add(text_treasury);

    let text_treasury_value = scene.add
        .text(1006, 469, myGuild.Treasury.Musk + "M-Coin", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "36px",
            color: "#FFA600",
            align: "right",
        })
        .setOrigin(1, 0);
    container_main.add(text_treasury_value);

    input_donate = "";
    CreateSearchGuildInput(scene, function (value) {
        input_donate = value;
    });

    let btn_donate = CreateButton0(
        scene,
        container_main,
        686 + 328 / 2,
        754 + 86 / 2,
        "Donate"
    );
    container_main.add(btn_donate);

    btn_donate.button.on("pointerdown", function () {
        RequestDonate(scene);
    });

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

    RequestGuildList(scene);
}

function HideInputElement() {
    if (donate_inputElement) {
        donate_inputElement.style.visibility = "hidden";
    }
}

function ShowInputElement() {
    console.log("ShowInputElement", donate_inputElement);

    if (donate_inputElement) {
        donate_inputElement.style.visibility = "visible";
    }
}

function RequestDonate(scene) {
    let donateMusk = Number(inputValue);

    if (
        inputValue != null &&
        inputValue !== "" &&
        Number.isInteger(donateMusk) &&
        donateMusk > 0
    ) {
        if (donateMusk > centerData.userInfo.Musk) {
            CreateAlertPopup(
                scene,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeShop.KEY,
                    "Not enough M-Coin"
                )
            );

            return;
        }

        CreateLoadingPopup();

        centerData.RequestPostDonateGuild(
            donateMusk,
            (result) => {
                HideLoadingPopup();

                CreateAlertPopup(
                    scene,
                    result.message,
                    () => {
                        RequestGuildList(scene);
                    },
                    null
                );
            },
            (error) => {
                HideLoadingPopup();

                CreateAlertPopup(scene, "Transaction fail:" + "\n" + error);
            }
        );
    } else {
        CreateAlertPopup(
            scene,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeShop.KEY,
                "Number must not be empty"
            )
        );
    }
}

function RequestGuildList(scene, guildName = "") {
    CreateLoadingPopup();

    // Khởi tạo trạng thái phân trang
    currentPage = 1;
    totalPages = 1;
    isUpdating = true;

    centerData.RequestGetGuildDonateLeaderboard(
        currentPage,
        PAGE_LIMIT,
        (result) => {
            HideLoadingPopup();

            // Lưu tổng số trang từ pagination
            if (result && typeof result.totalPages === "number") {
                totalPages = result.totalPages;
            } else {
                totalPages = 1;
            }

            // Tạo danh sách lần đầu
            CreateGuildItemList(scene, result);

            isUpdating = false;
        },
        (error) => {
            HideLoadingPopup();
            isUpdating = false;
            CreateAlertPopup(scene, error);
        }
    );
}

let container_guild_item_list = null;

function DestroyGuildItemList() {
    if (container_guild_item_list) {
        container_guild_item_list.destroy();
        container_guild_item_list = null;
    }
}

function CreateGuildItemList(scene, receivedData) {
    //console.log("CreateGuildItemList receivedData: ", receivedData);

    DestroyGuildItemList();

    //Create guild list
    container_guild_item_list = scene.add.container(0, 0);
    container_main.add(container_guild_item_list);

    if (
        !receivedData ||
        !receivedData.members ||
        receivedData.members.length === 0
    ) {
        const emptyText = scene.add
            .text(540, 1400, "No Donate", {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "38px",
                color: "#ffffff",
                align: "center",
                stroke: "#000000",
                strokeThickness: 10,
            })
            .setOrigin(0.5, 0.5);
        container_guild_item_list.add(emptyText);
        return;
    }

    // Kích thước của ScrollView
    const scrollViewWidth = 1020;
    const scrollViewHeight = 1044;

    const itemWidth = 904;
    const itemHeight = 200;
    const itemSpacing = 20;

    const posX = 30 + scrollViewWidth / 2;
    const posY = 876 + scrollViewHeight / 2;

    // Tạo gridTable với tái sử dụng cell
    gridTable = scene.rexUI.add
        .gridTable({
            x: posX,
            y: posY,
            width: scrollViewWidth,
            height: scrollViewHeight,
            scrollMode: 0,
            table: {
                cellWidth: itemWidth + itemSpacing,
                cellHeight: itemHeight + itemSpacing,
                columns: 1,
                reuseCellContainer: true,
            },
            slider: {
                track: scene.rexUI.add.roundRectangle(
                    0,
                    0,
                    20,
                    10,
                    10,
                    0x000000,
                    0.3
                ),
                thumb: scene.rexUI.add.roundRectangle(
                    0,
                    0,
                    20,
                    30,
                    10,
                    0xcccccc
                ),
            },
            mouseWheelScroller: {
                focus: false,
                speed: 0.2,
            },
            items: receivedData.members,
            createCellContainerCallback: function (cell, cellContainer) {
                var scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    // Chỉ tạo container một lần
                    cellContainer = createGuildItem(
                        scene,
                        itemWidth,
                        itemHeight
                    );
                }
                // Cập nhật nội dung với dữ liệu mới
                cellContainer.updateContent(item);

                return cellContainer;
            },
            space: {
                left: 126,
                right: 0,
                top: 40,
                bottom: 200 / 2 + 20 / 2,
            },
        })
        .layout();

    container_guild_item_list.add(gridTable);

    // Theo dõi tương tác kéo thả để xử lý cuộn và nạp thêm
    gridTable
        .setInteractive()
        .on("pointerdown", function (pointer) {
            gridTable.startY = pointer.y;
            gridTable.isDragging = true;
            gridTable.startTime = scene.time.now;
        })
        .on("pointermove", function (pointer) {
            if (!gridTable.isDragging) return;

            const deltaY = pointer.y - gridTable.startY;
            gridTable.startY = pointer.y;

            let currentT = gridTable.t - deltaY * 0.001;
            currentT = Phaser.Math.Clamp(currentT, 0, 1);
            gridTable.setT(currentT);

            if (gridTable.t > 0.9 && !isUpdating) {
                UpdateGuildList(scene);
            }
        })
        .on("pointerup", function () {
            gridTable.isDragging = false;
        })
        .on("pointerover", function (pointer) {
            if (gridTable.isDragging) {
                gridTable.startY = pointer.y;
            }
        });

    // Thêm sự kiện cuộn chuột
    gridTable.on("scroll", function () {
        if (gridTable.t > 0.9 && !isUpdating) {
            UpdateGuildList(scene);
        }
    });

    // Thiết lập mask
    let maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_guild_item_list.add(maskShape);

    let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    gridTable.setMask(mask);
}

function UpdateGuildList(scene) {
    if (isUpdating) return;
    if (currentPage >= totalPages) return;

    isUpdating = true;
    currentPage++;

    CreateLoadingPopup();

    centerData.RequestGetGuildDonateLeaderboard(
        currentPage,
        PAGE_LIMIT,
        (result) => {
            HideLoadingPopup();

            const newDonates = result && result.members ? result.members : [];
            CreateUpdateGuildList(scene, newDonates);

            isUpdating = false;
        },
        (error) => {
            HideLoadingPopup();
            isUpdating = false;
        }
    );
}

function CreateUpdateGuildList(scene, guildArray) {
    if (!guildArray || guildArray.length <= 0) {
        return;
    }

    let currentItems = gridTable.items;
    let updatedItems = [...currentItems, ...guildArray];
    gridTable.setItems(updatedItems);
    gridTable.refresh();
}

function createGuildItem(scene, itemWidth, itemHeight) {
    const container = scene.add.container(0, 0);
    container.setSize(itemWidth, itemHeight);

    const container_inner = scene.add.container(-70, 0);
    container.add(container_inner);

    const bg = scene.add.image(0, 0, "home_guild_list_item_bg").setOrigin(0, 0);
    container_inner.add(bg);

    const text_rank = scene.add
        .text(20, 100, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "38px",
            color: "#ffffff",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_rank);

    const avatar = scene.add
        .image(122 + 160 / 2, 20 + 160 / 2, "")
        .setDisplaySize(160, 160)
        .setOrigin(0.5, 0.5);
    container_inner.add(avatar);

    const avatar_farme = scene.add
        .image(122 + 160 / 2, 20 + 160 / 2, "avatar_frame_3")
        .setScale(160 / 256)
        .setOrigin(0.5, 0.5);
    container_inner.add(avatar_farme);

    const text_name = scene.add
        .text(298, 20, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "38px",
            color: "#ffffff",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_name);

    const text_id = scene.add
        .text(298, 75, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "24px",
            color: "#ffffff",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_id);

    const text_donate = scene.add
        .text(880, 176, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "32px",
            color: "#FFA600",
            align: "right",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(1, 1);
    container_inner.add(text_donate);

    // API cập nhật nội dung được gọi bởi gridTable
    container.updateContent = function (data) {
        container.itemData = data;
        if (!data) return;

        text_rank.setText(data.rank + ".");

        avatar.setTexture(data.Avatar);
        avatar.setDisplaySize(160, 160);

        avatar_farme.setVisible(true);

        switch (data.rank) {
            case 1: {
                avatar_farme.setTexture("avatar_frame_1");
                avatar_farme.setScale(160 / 256);
                break;
            }

            case 2: {
                avatar_farme.setTexture("avatar_frame_2");
                avatar_farme.setScale(160 / 256);
                break;
            }

            case 3: {
                avatar_farme.setTexture("avatar_frame_3");
                avatar_farme.setScale(160 / 256);
                break;
            }

            default: {
                avatar_farme.setVisible(false);
                break;
            }
        }

        text_name.setText(data.Username);
        text_id.setText("ID: " + data.UserId);
        text_donate.setText("Donate: " + data.Contribution.Musk + "M-Coin");
    };

    return container;
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

function CreateButton1(scene, container, x, y, imgKey, buttonName) {
    let btnWidth = 200;
    let btnHeight = 58;

    const btn_container = scene.add.container(x, y);
    container.add(btn_container);

    const btn_inner_container = scene.add.container(
        -btnWidth / 2,
        -btnHeight / 2
    );
    btn_container.add(btn_inner_container);

    btn_container.button = scene.add
        .image(0, 0, "home_guild_btn_0")
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

    if (imgKey != "") {
        btn_container.button.setTexture(imgKey);
    }

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

function CreateSearchGuildInput(scene, onValueChange) {
    let placeHolderStr = cdLocalization.getLocalization(
        cdLocalization.GROUP_KEYS.CenterMarket.KEY,
        "Enter amount to donate"
    );

    let fontStr = cdLocalization.getCurrentFont();

    // Tạo input HTML
    const inputHTML = `
<form id="converter-donate-form">
    <input 
        type="number"
        min="0"
        step="1"
        id="guildDonateInput" 
        placeholder="${placeHolderStr}"
        maxlength="64"
        style="
            width:564px; 
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
    form_element = scene.add
        .dom(62 + 584 / 2, 748 + 89 / 2) // Vị trí trung tâm màn hình
        .createFromHTML(inputHTML);

    container_main.add(form_element);

    // Lấy phần tử input
    donate_inputElement = document.getElementById("guildDonateInput");
    const inputForm = document.getElementById("converter-donate-form"); // Lấy đối tượng FORM

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
    donate_inputElement.addEventListener("input", () => {
        // Chuyển đổi giá trị nhập vào thành số nguyên
        let parsedValue = parseInt(donate_inputElement.value, 10);

        // Kiểm tra nếu giá trị không hợp lệ, đặt lại thành 0
        if (isNaN(parsedValue)) {
            parsedValue = 0;
        }

        // Đảm bảo giá trị là số nguyên dương (>= 1)
        parsedValue = Math.max(parsedValue, 0);

        // Cập nhật giá trị của input nếu có thay đổi
        if (parsedValue.toString() !== donate_inputElement.value) {
            donate_inputElement.value = parsedValue > 0 ? parsedValue : "";
        }

        inputValue = donate_inputElement.value;

        //console.log("inputValue: ", inputValue);
    });

    // Xử lý sự kiện click ra ngoài
    const clickOutsideHandler = (event) => {
        if (!donate_inputElement.contains(event.target)) {
            donate_inputElement.blur(); // Hủy trạng thái focus
        }
    };

    document.addEventListener("click", clickOutsideHandler);

    // Lưu trữ handler để cleanup sau này
    form_element.clickOutsideHandler = clickOutsideHandler;

    // Thêm function cleanup event listeners
    form_element.removeEventListeners = () => {
        if (donate_inputElement) {
            donate_inputElement.removeEventListener("input", onValueChange);
        }
        document.removeEventListener("click", clickOutsideHandler);
    };
}

function Close(scene) {
    Destroy();

    CreateGuild(scene);
}

function Destroy() {
    // Cleanup event listeners trước khi destroy
    if (form_element && form_element.removeEventListeners) {
        form_element.removeEventListeners();
    }

    if (container_main) {
        container_main.destroy();
        container_main = null;
    }
    if (container_buttons) {
        container_buttons.destroy();
        container_buttons = null;
    }

    DestroyGuildItemList();

    if (gridTable) {
        gridTable.destroy();
        gridTable = null;
    }

    // Reset các biến global
    donate_inputElement = null;
    input_donate = "";
    form_element = null;
    currentPage = 0;
    totalPages = 0;
    isUpdating = false;
}
