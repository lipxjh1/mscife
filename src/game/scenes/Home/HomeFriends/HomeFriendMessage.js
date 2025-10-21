import centerData from "../../../Data/CenterData.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";
import { CreateFriends } from "./HomeFriends.js";

let selectedUserId = "";
let selectedUsername = "";
let selectedAvatar = "";

let maxMessageCharacters = 300;

export function CreateFriendMessage(scene, friendData) {
    selectedUserId = friendData.UserId;
    selectedUsername = friendData.Username;
    selectedAvatar = friendData.Avatar;

    messageArr = [];

    DestroyFriendChat();

    container_main_chat = scene.add.container(0, 0);
    container_main_chat.setDepth(200);

    let lockBg = scene.add
        .image(0, 0, "home_friends_bg")
        .setInteractive()
        .setOrigin(0, 0);

    container_main_chat.add(lockBg);

    container_buttons = scene.add.container(0, 0);
    container_main_chat.add(container_buttons);

    let text_title = scene.add
        .text(
            606.5,
            274,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                "Friend message"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "38px",
                color: "#ffffff",
            }
        )
        .setOrigin(0.5, 0);

    container_main_chat.add(text_title);

    let avatar = scene.add
        .image(62 + 220 / 2, 392 + 220 / 2, selectedAvatar)
        .setOrigin(0.5, 0.5);

    container_main_chat.add(avatar);

    let text_user_name = scene.add
        .text(306, 448, selectedUsername || "No user loaded", {
            fontFamily: "Russo One",
            fontSize: "48px",
            color: "#ffffff",
            shadow: {
                offsetX: 2,
                offsetY: 2,
                color: "#FF9D00",
                blur: 7,
                stroke: true,
                fill: true,
            },
            align: "left",
        })
        .setOrigin(0, 0);

    container_main_chat.add(text_user_name);

    let text_user_id = scene.add
        .text(306, 524, "ID: " + selectedUserId, {
            fontFamily: "Russo One",
            fontSize: "32px",
            color: "#D2D2D2",
        })
        .setOrigin(0, 0);

    container_main_chat.add(text_user_id);

    input_chat_message = "";
    CreateFriendChatInput(scene, function (value) {
        input_chat_message = value;
    });

    let btn_send = CreateButton0(
        scene,
        container_main_chat,
        686 + 328 / 2,
        754 + 86 / 2,
        "Send"
    );
    container_main_chat.add(btn_send);

    btn_send.button.on("pointerdown", function () {
        SendChat(scene, input_chat_message);
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

    RequestGetFriendChatHistory(scene);
}

let container_main_chat = null;

let container_buttons = null;

let input_chat_message_inputElement = null;
let input_chat_message = "";
let form_element = null;

let gridTable = null;

let currentPage = 0;

let totalPages = 0;

// Phân trang và cuộn vô hạn
let isUpdating = false;
const PAGE_LIMIT = 10;

let messageArr = [];

let stageTimeEvent = null;

export function HideInputElementChat() {
    if (input_chat_message_inputElement) {
        input_chat_message_inputElement.style.visibility = "hidden";
    }
}

export function ShowInputElementChat() {
    //console.log("ShowInputElement", input_chat_message_inputElement);

    if (input_chat_message_inputElement) {
        input_chat_message_inputElement.style.visibility = "visible";
    }
}

function RequestGetFriendChatHistory(scene) {
    CreateLoadingPopup();

    // Khởi tạo trạng thái phân trang
    currentPage = 1;
    totalPages = 1;
    isUpdating = true;

    centerData.RequestGetFriendChatHistory(
        selectedUserId,
        currentPage,
        PAGE_LIMIT,
        (result) => {
            HideLoadingPopup();

            // Lưu tổng số trang từ pagination
            if (result && typeof result.data.pagination.pages === "number") {
                totalPages = result.data.pagination.pages;
            } else {
                totalPages = 1;
            }

            messageArr = result.data.messages;

            // Tạo danh sách lần đầu
            CreateFriendItemList(scene);

            isUpdating = false;
        },
        (error) => {
            HideLoadingPopup();
            isUpdating = false;
            CreateAlertPopup(scene, error);
        }
    );
}

let container_friend_item_list = null;

function DestroyFriendItemList(scene) {
    if (container_friend_item_list) {
        container_friend_item_list.destroy();
        container_friend_item_list = null;
    }
}

function CreateFriendItemList(scene) {
    //console.log("messageArr: ", messageArr);

    DestroyFriendItemList(scene);

    container_friend_item_list = scene.add.container(0, 0);
    container_main_chat.add(container_friend_item_list);

    // Kích thước của ScrollView
    const scrollViewWidth = 1020;
    const scrollViewHeight = 1044;

    const itemWidth = 904;
    const itemHeight = 200;
    const itemSpacing = 10;

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
            items: messageArr,
            createCellContainerCallback: function (cell, cellContainer) {
                var scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    // Chỉ tạo container một lần
                    cellContainer = createFriendItem(
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
                bottom: 200 / 2 + 10 / 2,
            },
        })
        .layout();

    container_friend_item_list.add(gridTable);

    gridTable.setT(1);

    // Thêm sự kiện cuộn chuột
    gridTable.on("scroll", function () {
        if (gridTable.t < 0.01 && !isUpdating) {
            UpdateFriendList(scene);
        }
    });

    // Thiết lập mask
    let maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_friend_item_list.add(maskShape);

    let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    gridTable.setMask(mask);

    StartPolling(scene);
}

function StartPolling(scene) {
    if (stageTimeEvent) {
        stageTimeEvent.remove(); // Dừng Timer Event
    }

    // Tạo Timer Event để đếm ngược
    stageTimeEvent = scene.time.addEvent({
        delay: 3000, // 3 giây
        callback: () => {
            if (container_main_chat) {
                PollUpdateFriendList(scene);
            }
        },
        callbackScope: scene,
        loop: true,
    });
}

function PollUpdateFriendList(scene) {
    if (messageArr.length == 0 || isUpdating) return;

    isUpdating = true;

    centerData.RequestGetFriendChatFromTimeStamp(
        selectedUserId,
        messageArr[messageArr.length - 1].CreatedAt,
        (result) => {
            let newMessages = result.data.messages;

            //console.log("newMessages: ", newMessages);

            if (container_main_chat == null) {
                isUpdating = false;
                return;
            }

            if (!newMessages || newMessages.length <= 0) {
                isUpdating = false;
                return;
            }

            // 1. Lấy danh sách MessageId hiện có
            let currentItems = gridTable.items || [];
            const existingMessageIds = new Set(
                currentItems.map((item) => item.MessageId)
            );

            // 2. Lọc ra các tin nhắn mới (chưa có trong currentItems)
            const uniqueNewMessages = newMessages.filter(
                (message) => !existingMessageIds.has(message.MessageId)
            );

            // 3. Đếm số lượng tin nhắn mới không trùng lặp
            const newCount = uniqueNewMessages.length;
            //console.log(`Số lượng tin nhắn mới không trùng lặp: ${newCount}`);
            // Bạn có thể sử dụng biến 'newCount' này cho thông báo hoặc hiển thị.

            // 4. Cập nhật danh sách: Thêm các tin nhắn mới VÀ DUY NHẤT vào cuối danh sách hiện tại
            let updatedItems = [...currentItems, ...uniqueNewMessages];

            //console.log("updatedItems: ", updatedItems);

            currentPage = Math.ceil(updatedItems.length / PAGE_LIMIT) - 1;

            if (currentPage < 1) {
                currentPage = 1;
            }

            // *Lưu ý: Nếu API luôn trả về danh sách tin nhắn SẮP XẾP theo thời gian TĂNG DẦN
            // và bạn chỉ muốn thêm tin nhắn mới hơn, thì logic trên là chính xác.
            // Nếu thứ tự tin nhắn không được đảm bảo, bạn có thể cần sắp xếp lại `updatedItems`
            // trước khi gán cho gridTable.

            let lastT = gridTable.t;

            gridTable.setItems(updatedItems);
            gridTable.refresh();

            if (lastT > 0.8) {
                gridTable.setT(1);
            }

            isUpdating = false;
        },
        (error) => {
            isUpdating = false;
            // Xử lý lỗi (nếu cần)
            //console.error("Lỗi khi tải lịch sử chat:", error);
        }
    );
}

function UpdateFriendList(scene) {
    if (isUpdating) return;

    if (currentPage >= totalPages) return;

    isUpdating = true;
    currentPage++;

    CreateLoadingPopup();

    centerData.RequestGetFriendChatHistory(
        selectedUserId,
        currentPage,
        PAGE_LIMIT,
        (result) => {
            HideLoadingPopup();

            // Lưu tổng số trang từ pagination
            if (result && typeof result.data.pagination.pages === "number") {
                totalPages = result.data.pagination.pages;
            } else {
                totalPages = 1;
            }

            const newArr =
                result && result.data.messages ? result.data.messages : [];
            CreateUpdateChatList(scene, newArr);

            isUpdating = false;
        },
        (error) => {
            HideLoadingPopup();
            isUpdating = false;
        }
    );
}

function SendChat(scene, message) {
    if (message == null || message == "" || message.length == 0) {
        CreateAlertPopup(scene, "message must not be empty");

        return;
    }

    if (message.length > maxMessageCharacters) {
        CreateAlertPopup(
            scene,
            `message must be under ${maxMessageCharacters} characters`
        );
        return;
    }

    CreateLoadingPopup();
    centerData.RequestPostFriendChatSend(
        selectedUserId,
        message,
        (result) => {
            HideLoadingPopup();

            if (input_chat_message_inputElement) {
                input_chat_message_inputElement.value = "";
            }

            PollUpdateFriendList(scene);
        },
        (error) => {
            HideLoadingPopup();

            CreateAlertPopup(scene, error, () => {}, null);
        }
    );
}

function CreateUpdateChatList(scene, messageArray) {
    if (container_main_chat == null) return;

    // 1. Kiểm tra mảng tin nhắn đầu vào
    if (!messageArray || messageArray.length <= 0) {
        return;
    }

    let currentItems = gridTable.items || [];

    // 2. Tạo Set các MessageId hiện có trong danh sách
    // Việc sử dụng Set giúp kiểm tra sự tồn tại nhanh hơn (O(1)).
    const existingMessageIds = new Set(
        currentItems.map((item) => item.MessageId)
    );

    // 3. Lọc ra các tin nhắn trong messageArray chưa có trong currentItems
    const uniqueNewMessages = messageArray.filter(
        (message) =>
            // Lọc những tin nhắn CÓ MessageId VÀ MessageId đó CHƯA tồn tại
            message.MessageId && !existingMessageIds.has(message.MessageId)
    );

    // 4. Nếu không có tin nhắn mới nào độc lập thì không cần cập nhật
    if (uniqueNewMessages.length === 0) {
        //console.log("Không có tin nhắn mới độc lập để thêm vào.");
        return;
    }

    // 5. Cập nhật danh sách:
    // Tin nhắn mới (uniqueNewMessages) được thêm VÀO ĐẦU (vì đây là hàm Create/Update,
    // thường dùng để tải dữ liệu lịch sử hoặc khi tin nhắn mới đến)
    let updatedItems = [...uniqueNewMessages, ...currentItems];

    // In ra số lượng tin nhắn mới đã được thêm
    //console.log(`Đã thêm ${uniqueNewMessages.length} tin nhắn mới không trùng lặp.`);

    // 6. Gán và làm mới GridTable
    gridTable.setItems(updatedItems);
    gridTable.refresh();
    gridTable.setT(0.02);
}

function createFriendItem(scene, itemWidth, itemHeight) {
    const container = scene.add.container(0, 0);
    container.setSize(itemWidth, itemHeight);

    const container_inner = scene.add.container(0, 0);
    container.add(container_inner);

    let bg = scene.add
        .graphics()
        .fillStyle(0x4e4e4e, 0.4)
        .fillRoundedRect(0, 0, itemWidth, itemHeight, 4);
    container_inner.add(bg);

    const text_name = scene.add
        .text(10, 10, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "28px",
            color: "#ffffff",
            align: "left",
            wordWrap: { width: 880, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_name);

    const text_content = scene.add
        .text(10, text_name.y + text_name.height + 10, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "24px",
            color: "#ffffff",
            align: "left",
            wordWrap: { width: 880, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_content);

    // API cập nhật nội dung được gọi bởi gridTable
    container.updateContent = function (data) {
        container.itemData = data;
        if (!data) return;

        text_name.setText(`${formatDateTime(data.CreatedAt)}`);
        text_content.setText(data.Content);

        if (data.FromUserId == centerData.userInfo.UserId) {
            text_name.setOrigin(1, 0);
            text_name.setPosition(894, 10);
            text_name.setColor("#FFA600");

            text_content.setOrigin(1, 0);
            text_content.setPosition(894, text_name.y + text_name.height + 10);
        } else {
            text_name.setOrigin(0, 0);
            text_name.setPosition(10, 10);
            text_name.setColor("#00FFAA");

            text_content.setOrigin(0, 0);
            text_content.setPosition(10, text_name.y + text_name.height + 10);
        }

        // let caculatedHeight =
        //     10 + text_name.height + 10 + text_content.height + 10;

        // bg.clear();
        // bg.fillStyle(0x4e4e4e, 0.4);
        // bg.fillRoundedRect(0, 0, itemWidth, caculatedHeight, 4);

        // container.setSize(itemWidth, caculatedHeight);
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
        .image(0, 0, "home_friends_btn_add_friend")
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
        .image(0, 0, "home_friends_btn_0")
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

function CreateFriendChatInput(scene, onValueChange) {
    let placeHolderStr = cdLocalization.getLocalization(
        cdLocalization.GROUP_KEYS.CenterMarket.KEY,
        "Enter message"
    );

    let fontStr = cdLocalization.getCurrentFont();

    // Tạo input HTML
    const inputHTML = `
<form id="converter-chat-form">
    <input 
        type="text" 
        min="0"
        step="1"  
        id="friendChatInput" 
        placeholder="${placeHolderStr}"
        maxlength="${maxMessageCharacters}"
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

    container_main_chat.add(form_element);

    // Lấy phần tử input
    input_chat_message_inputElement =
        document.getElementById("friendChatInput");
    const inputForm = document.getElementById("converter-chat-form"); // Lấy đối tượng FORM

    // Tạo handler cho sự kiện SUBMIT
    const submitHandler = (event) => {
        // NGĂN CHẶN HÀNH VI MẶC ĐỊNH của form (reload trang)
        event.preventDefault();

        SendChat(scene, input_chat_message);
    };

    // Thêm listener cho sự kiện submit (khi nhấn Enter)
    if (inputForm) {
        inputForm.addEventListener("submit", submitHandler);
    }

    // Xử lý sự kiện nhập dữ liệu
    input_chat_message_inputElement.addEventListener("input", () => {
        if (onValueChange && typeof onValueChange === "function") {
            // Gọi callback với giá trị hợp lệ
            onValueChange(input_chat_message_inputElement.value);
        }
    });

    // Xử lý sự kiện click ra ngoài
    const clickOutsideHandler = (event) => {
        if (!input_chat_message_inputElement.contains(event.target)) {
            input_chat_message_inputElement.blur(); // Hủy trạng thái focus
        }
    };

    document.addEventListener("click", clickOutsideHandler);

    // Lưu trữ handler để cleanup sau này
    form_element.clickOutsideHandler = clickOutsideHandler;

    // Thêm function cleanup event listeners
    form_element.removeEventListeners = () => {
        if (input_chat_message_inputElement) {
            input_chat_message_inputElement.removeEventListener(
                "input",
                onValueChange
            );
        }
        document.removeEventListener("click", clickOutsideHandler);
    };
}

function formatDateTime(timestamp) {
    const date = new Date(timestamp);

    // Lấy các thành phần của ngày giờ
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    // Ghép các thành phần theo định dạng mong muốn
    return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
}

function Close(scene) {
    DestroyFriendChat();
    CreateFriends(scene);
}

export function DestroyFriendChat() {
    // Cleanup event listeners trước khi destroy
    if (form_element && form_element.removeEventListeners) {
        form_element.removeEventListeners();
    }

    if (container_main_chat) {
        container_main_chat.destroy();
        container_main_chat = null;
    }
    if (container_buttons) {
        container_buttons.destroy();
        container_buttons = null;
    }
    if (container_friend_item_list) {
        container_friend_item_list.destroy();
        container_friend_item_list = null;
    }
    if (gridTable) {
        gridTable.destroy();
        gridTable = null;
    }

    // Cleanup stage time event
    if (stageTimeEvent) {
        stageTimeEvent.remove();
    }

    // Reset các biến global
    input_chat_message_inputElement = null;
    input_chat_message = "";
    form_element = null;
    currentPage = 0;
    totalPages = 0;
    isUpdating = false;

    messageArr = [];
}
