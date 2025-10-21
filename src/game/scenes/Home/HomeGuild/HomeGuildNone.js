import centerData from "../../../Data/CenterData.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";
import {
    HideCurrencyBar,
    MovePlayerBarToDefault,
    MovePlayerBarToHide,
    OpenCurrencyBar,
} from "../HomeTopBarPlayer.js";
import { CreateGuildCreate } from "./HomeGuildCreate.js";
import { CreateGuildMyRequest } from "./HomeGuildMyRequest.js";

export function CreateGuildNone(scene) {
    LoadAssetsDone(scene);
}

let container_main = null;

let container_buttons = null;

let text_guilds = null;

let search_guild_name_inputElement = null;
let input_search_guild_name = "";
let form_element = null;

let gridTable = null;

let currentPage = 0;

let totalPages = 0;

// Phân trang và cuộn vô hạn
let isUpdating = false;
const PAGE_LIMIT = 10;

function LoadAssetsDone(scene) {
    MovePlayerBarToHide(scene);
    HideCurrencyBar(scene);

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
            }
        )
        .setOrigin(0.5, 0);

    container_main.add(text_title);

    text_guilds = scene.add
        .text(
            1006,
            390,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                "Guilds"
            ) +
                ": " +
                0,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "36px",
                color: "#ffffff",
                align: "right",
            }
        )
        .setOrigin(1, 0);

    container_main.add(text_guilds);

    text_guilds.setGuilds = function (count) {
        text_guilds.setText(
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                "Guilds"
            ) +
                ": " +
                count
        );
    };

    let btn_request = CreateButton0(
        scene,
        container_main,
        686 + 328 / 2,
        551 + 86 / 2,
        "Request"
    );
    container_main.add(btn_request);

    btn_request.button.on("pointerdown", function () {
        CreateGuildMyRequest(scene);

        Destroy();
    });

    let btn_create_guild = CreateButton0(
        scene,
        container_main,
        686 + 328 / 2,
        644 + 86 / 2,
        "Create Guild"
    );
    container_main.add(btn_create_guild);

    btn_create_guild.button.on("pointerdown", function () {
        CreateGuild(scene);

        Destroy();
    });

    input_search_guild_name = "";
    CreateSearchGuildInput(scene, function (value) {
        input_search_guild_name = value;
    });

    let btn_search_guild = CreateButton0(
        scene,
        container_main,
        686 + 328 / 2,
        754 + 86 / 2,
        "Search"
    );
    container_main.add(btn_search_guild);

    btn_search_guild.button.on("pointerdown", function () {
        if (input_search_guild_name != "") {
            SearchGuild(scene, input_search_guild_name);
        } else {
            CreateAlertPopup(scene, "Please enter Guild's name");
        }
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

    SearchGuild(scene, "");
}

function HideInputElement() {
    if (search_guild_name_inputElement) {
        search_guild_name_inputElement.style.visibility = "hidden";
    }
}

function ShowInputElement() {
    console.log("ShowInputElement", search_guild_name_inputElement);

    if (search_guild_name_inputElement) {
        search_guild_name_inputElement.style.visibility = "visible";
    }
}

function CreateGuild(scene) {
    console.log("CreateGuild");

    CreateGuildCreate(scene);

    Destroy();
}

function SearchGuild(scene, guildName = "") {
    // Tìm kiếm lại với keyword mới
    RequestGuildList(scene, guildName);
}

function RequestGuildList(scene, guildName = "") {
    CreateLoadingPopup();

    // Khởi tạo trạng thái phân trang
    currentPage = 1;
    totalPages = 1;
    isUpdating = true;

    centerData.RequestGetGuildList(
        guildName,
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

            // Cập nhật số lượng guild
            if (result && result.total) {
                text_guilds.setGuilds(result.total);
            } else {
                text_guilds.setGuilds(0);
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
        !receivedData.guilds ||
        receivedData.guilds.length === 0
    ) {
        const emptyText = scene.add
            .text(540, 1400, "No Guilds", {
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
            items: receivedData.guilds,
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
                left: 58,
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

    centerData.RequestGetGuildList(
        input_search_guild_name,
        currentPage,
        PAGE_LIMIT,
        (result) => {
            HideLoadingPopup();

            const newGuilds = result && result.guilds ? result.guilds : [];
            CreateUpdateGuildList(scene, newGuilds);

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

function JoinGuild(scene, guildId) {
    CreateLoadingPopup();
    centerData.RequestPostGuildJoin(
        guildId,
        (result) => {
            HideLoadingPopup();
            CreateAlertPopup(scene, result.message);

            CreateGuildNone(scene);
        },
        (error) => {
            HideLoadingPopup();
            CreateAlertPopup(scene, error);
        }
    );
}

function createGuildItem(scene, itemWidth, itemHeight) {
    const container = scene.add.container(0, 0);
    container.setSize(itemWidth, itemHeight);

    const container_inner = scene.add.container(0, 0);
    container.add(container_inner);

    const bg = scene.add.image(0, 0, "home_guild_list_item_bg").setOrigin(0, 0);
    container_inner.add(bg);

    const avatar = scene.add
        .image(23 + 160 / 2, 20 + 160 / 2, "")
        .setDisplaySize(160, 160)
        .setOrigin(0.5, 0.5);
    container_inner.add(avatar);

    const text_name = scene.add
        .text(199, 20, "", {
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
        .text(199, 75, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "24px",
            color: "#FFA600",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_id);

    const text_description = scene.add
        .text(199, 120, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "24px",
            color: "#ffffff",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_description);

    const text_members = scene.add
        .text(834, 31, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "24px",
            color: "#FFA600",
            align: "right",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(1, 0);
    container_inner.add(text_members);

    const button_join = CreateButton1(
        scene,
        container_inner,
        640 + 200 / 2,
        114 + 58 / 2,
        "home_guild_btn_0",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Join"
        )
    );

    // Lắng nghe một lần, dùng container.itemData động để hành xử theo dữ liệu mới
    button_join.button.removeAllListeners("pointerdown");
    button_join.button.on("pointerdown", function () {
        const itemData = container.itemData;
        if (!itemData) return;

        JoinGuild(scene, itemData.GuildId);
    });

    // API cập nhật nội dung được gọi bởi gridTable
    container.updateContent = function (data) {
        container.itemData = data;
        if (!data) return;

        avatar.setTexture(data.Avatar);
        avatar.setScale(160 / 128);
        text_name.setText(data.Name);
        text_id.setText(
            "ID: " + data.GuildId + " - Leader: " + data.LeaderInfo.Username
        );
        text_description.setText(data.Description);
        text_members.setText(
            "Members: " + data.Members + "/" + data.MaxMembers
        );
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
        "Enter guild's name"
    );

    let fontStr = cdLocalization.getCurrentFont();

    // Tạo input HTML
    const inputHTML = `
<form id="converter-search-form">
    <input 
        type="text" 
        min="0"
        step="1"  
        id="guildNameSearchInput" 
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
    search_guild_name_inputElement = document.getElementById(
        "guildNameSearchInput"
    );
    const inputForm = document.getElementById("converter-search-form"); // Lấy đối tượng FORM

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
    search_guild_name_inputElement.addEventListener("input", () => {
        if (onValueChange && typeof onValueChange === "function") {
            // Gọi callback với giá trị hợp lệ
            onValueChange(search_guild_name_inputElement.value);
        }
    });

    // Xử lý sự kiện click ra ngoài
    const clickOutsideHandler = (event) => {
        if (!search_guild_name_inputElement.contains(event.target)) {
            search_guild_name_inputElement.blur(); // Hủy trạng thái focus
        }
    };

    document.addEventListener("click", clickOutsideHandler);

    // Lưu trữ handler để cleanup sau này
    form_element.clickOutsideHandler = clickOutsideHandler;

    // Thêm function cleanup event listeners
    form_element.removeEventListeners = () => {
        if (search_guild_name_inputElement) {
            search_guild_name_inputElement.removeEventListener(
                "input",
                onValueChange
            );
        }
        document.removeEventListener("click", clickOutsideHandler);
    };
}

function Close(scene) {
    MovePlayerBarToDefault(scene);

    OpenCurrencyBar(scene);

    Destroy();
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
    search_guild_name_inputElement = null;
    input_search_guild_name = "";
    form_element = null;
    currentPage = 0;
    totalPages = 0;
    isUpdating = false;
}
