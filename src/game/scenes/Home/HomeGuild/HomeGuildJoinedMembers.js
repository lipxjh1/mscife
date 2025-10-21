import centerData from "../../../Data/CenterData.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import { GetMyGuild } from "./HomeGuild.js";
import { DestroyGuildChat } from "./HomeGuildChat.js";
import { GetGuildJoinedSubContainer } from "./HomeGuildJoined.js";

let container_main_member = null;

let container_grid = null;

let container_buttons = null;

let search_guild_member_name_inputElement = null;
let input_search_member_name = "";
let form_element = null;

let myGuild = null;

let gridTable = null;

let currentPage = 0;

let totalPages = 0;

// Phân trang và cuộn vô hạn
let isUpdating = false;
const PAGE_LIMIT = 10;

export function CreateGuildJoinedMember(scene) {
    DestroyGuildChat();

    DestroyGuildJoinedMember();

    myGuild = GetMyGuild();

    container_main_member = scene.add.container(0, 0);
    GetGuildJoinedSubContainer().add(container_main_member);

    container_grid = scene.add.container(0, 0);
    container_main_member.add(container_grid);

    container_buttons = scene.add.container(0, 0);
    container_main_member.add(container_buttons);

    input_search_member_name = "";
    CreateSearchGuildInput(scene, function (value) {
        input_search_member_name = value;
    });

    let btn_search_member = CreateButton0(
        scene,
        container_main_member,
        686 + 328 / 2,
        754 + 86 / 2,
        "Search"
    );
    container_main_member.add(btn_search_member);

    btn_search_member.button.on("pointerdown", function () {
        if (input_search_member_name != "") {
            SearchGuildMember(scene, input_search_member_name);
        } else {
            CreateAlertPopup(scene, "Please enter Guild member's name");
        }
    });

    RequestMemberList(scene);
}

export function HideInputElementMember() {
    if (search_guild_member_name_inputElement) {
        search_guild_member_name_inputElement.style.visibility = "hidden";
    }
}

export function ShowInputElementMember() {
    if (search_guild_member_name_inputElement) {
        search_guild_member_name_inputElement.style.visibility = "visible";
    }
}

function SearchGuildMember(scene, keyword = "") {
    // Tìm kiếm lại với keyword mới
    RequestMemberList(scene, keyword);
}

function RequestMemberList(scene, keyword = "") {
    CreateLoadingPopup();

    // Khởi tạo trạng thái phân trang
    currentPage = 1;
    totalPages = 1;
    isUpdating = true;

    centerData.RequestGetGuildMemberList(
        myGuild.GuildId,
        keyword,
        currentPage,
        PAGE_LIMIT,
        (result) => {
            HideLoadingPopup();

            // Lưu tổng số trang từ pagination
            if (
                result &&
                result.totalPages &&
                typeof result.totalPages === "number"
            ) {
                totalPages = result.totalPages;
            } else {
                totalPages = 1;
            }

            // Tạo danh sách lần đầu
            CreateMemberItemList(scene, result);

            isUpdating = false;
        },
        (error) => {
            HideLoadingPopup();
            isUpdating = false;
            CreateAlertPopup(scene, error);
        }
    );
}

let container_member_item_list = null;

function DestroyMemberItemList(scene) {
    if (container_member_item_list) {
        container_member_item_list.destroy();
        container_member_item_list = null;
    }
}

function CreateMemberItemList(scene, receivedData) {
    //console.log("CreateMemberItemList receivedData: ", receivedData);

    DestroyMemberItemList(scene);

    //Create member list
    container_member_item_list = scene.add.container(0, 0);
    container_grid.add(container_member_item_list);

    if (
        !receivedData ||
        !receivedData.members ||
        receivedData.members.length === 0
    ) {
        const emptyText = scene.add
            .text(540, 1400, "No Data", {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "38px",
                color: "#ffffff",
                align: "center",
                stroke: "#000000",
                strokeThickness: 10,
            })
            .setOrigin(0.5, 0.5);
        container_member_item_list.add(emptyText);
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
                    cellContainer = createMemberItem(
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

    container_member_item_list.add(gridTable);

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
                UpdateMemberList(scene);
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
            UpdateMemberList(scene);
        }
    });

    // Thiết lập mask
    let maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_member_item_list.add(maskShape);

    let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    gridTable.setMask(mask);
}

function UpdateMemberList(scene) {
    if (isUpdating) return;
    if (currentPage >= totalPages) return;

    isUpdating = true;
    currentPage++;

    CreateLoadingPopup();

    centerData.RequestGetGuildMemberList(
        myGuild.GuildId,
        input_search_member_name,
        currentPage,
        PAGE_LIMIT,
        (result) => {
            HideLoadingPopup();

            const newMembers = result && result.members ? result.members : [];
            CreateUpdateMemberList(scene, newMembers);

            isUpdating = false;
        },
        (error) => {
            HideLoadingPopup();
            isUpdating = false;
        }
    );
}

function CreateUpdateMemberList(scene, memberArray) {
    if (!memberArray || memberArray.length <= 0) {
        return;
    }

    let currentItems = gridTable.items;
    let updatedItems = [...currentItems, ...memberArray];
    gridTable.setItems(updatedItems);
    gridTable.refresh();
}

function createMemberItem(scene, itemWidth, itemHeight) {
    const container = scene.add.container(0, 0);
    container.setSize(itemWidth, itemHeight);

    const container_inner = scene.add.container(-70, 0);
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
        .text(199, 74, "", {
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

    const text_role = scene.add
        .text(199, 128, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "24px",
            color: "#FFCC00",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_role);

    const button_remove = CreateButton1(
        scene,
        container_inner,
        640 + 200 / 2,
        114 + 58 / 2,
        "home_guild_btn_1",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Kick"
        )
    );

    // Lắng nghe một lần, dùng container.itemData động để hành xử theo dữ liệu mới
    button_remove.button.removeAllListeners("pointerdown");
    button_remove.button.on("pointerdown", function () {
        const itemData = container.itemData;
        if (!itemData) return;

        RemoveMember(scene, container);
    });

    // API cập nhật nội dung được gọi bởi gridTable
    container.updateContent = function (data) {
        container.itemData = data;
        if (!data) return;

        avatar.setTexture(data.Avatar);
        avatar.setDisplaySize(160, 160);
        text_name.setText(data.Username);
        text_id.setText(data.UserId);
        text_role.setText(data.Role);

        // Set màu role và hiển thị button kick
        if (data.UserId == myGuild.Leader.UserId) {
            text_role.setColor("#00FF44");
            button_remove.setVisible(false);
            button_remove.button.disableInteractive();
        } else {
            text_role.setColor("#ffffff");

            if (myGuild.MyRole !== "leader") {
                button_remove.setVisible(false);
                button_remove.button.disableInteractive();
            } else {
                button_remove.setVisible(true);
                button_remove.button.setInteractive({ useHandCursor: true });
            }
        }
    };

    return container;
}

function RemoveMember(scene, memberItem) {
    const memberData = memberItem.itemData;
    if (!memberData) return;

    CreateAlertPopup(
        scene,
        "Are you sure you want to kick this member?",
        () => {
            CreateLoadingPopup();
            centerData.RequestDeleteGuildMember(
                memberData.UserId,
                (result) => {
                    HideLoadingPopup();
                    CreateAlertPopup(scene, result.message);
                    RequestMemberList(scene);
                },
                (error) => {
                    HideLoadingPopup();
                    CreateAlertPopup(scene, error);
                }
            );
        },
        () => {}
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
        "Enter member's name"
    );

    let fontStr = cdLocalization.getCurrentFont();

    // Tạo input HTML
    const inputHTML = `
<form id="converter-search-member-form">
    <input 
        type="text" 
        min="0"
        step="1"  
        id="guildMemberNameSearchInput" 
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

    container_main_member.add(form_element);

    // Lấy phần tử input
    search_guild_member_name_inputElement = document.getElementById(
        "guildMemberNameSearchInput"
    );
    const inputForm = document.getElementById("converter-search-member-form"); // Lấy đối tượng FORM

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
    search_guild_member_name_inputElement.addEventListener("input", () => {
        if (onValueChange && typeof onValueChange === "function") {
            // Gọi callback với giá trị hợp lệ
            onValueChange(search_guild_member_name_inputElement.value);
        }
    });

    // Xử lý sự kiện click ra ngoài
    const clickOutsideHandler = (event) => {
        if (!search_guild_member_name_inputElement.contains(event.target)) {
            search_guild_member_name_inputElement.blur(); // Hủy trạng thái focus
        }
    };

    document.addEventListener("click", clickOutsideHandler);

    // Lưu trữ handler để cleanup sau này
    form_element.clickOutsideHandler = clickOutsideHandler;

    // Thêm function cleanup event listeners
    form_element.removeEventListeners = () => {
        if (search_guild_member_name_inputElement) {
            search_guild_member_name_inputElement.removeEventListener(
                "input",
                onValueChange
            );
        }
        document.removeEventListener("click", clickOutsideHandler);
    };
}

export function DestroyGuildJoinedMember() {
    // Cleanup event listeners trước khi destroy
    if (form_element && form_element.removeEventListeners) {
        form_element.removeEventListeners();
    }

    if (container_main_member) {
        container_main_member.destroy();
        container_main_member = null;
    }
    if (container_buttons) {
        container_buttons.destroy();
        container_buttons = null;
    }
    if (gridTable) {
        gridTable.destroy();
        gridTable = null;
    }

    // Reset các biến global
    search_guild_member_name_inputElement = null;
    input_search_member_name = "";
    form_element = null;
    currentPage = 0;
    totalPages = 0;
    isUpdating = false;
    container_member_item_list = null;
}
