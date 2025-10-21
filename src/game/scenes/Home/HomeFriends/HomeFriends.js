import centerData from "../../../Data/CenterData.js";
import centerDataItem from "../../../Data/CenterDataItem.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import {
    HideGoogleButtonLoginTelegramLink,
    ShowGoogleButtonLoginTelegramLink,
} from "../../../utils.js";

import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import {
    MovePlayerBarToDefault,
    MovePlayerBarToAccount,
    MovePlayerBarToHide,
    MovePlayerBarToRank,
} from "../HomeTopBarPlayer.js";
import { CreateFriendMessage } from "./HomeFriendMessage.js";

let container_main = null;

let btn_friend_list = null;

let btn_request_list = null;

let input_friend_id = "";

// Pagination variables for friends list
let friendsGridTable = null;
let currentFriendsPage = 0;
let totalFriendsPages = 0;
let isUpdatingFriends = false;
const FRIENDS_PAGE_LIMIT = 10;

export function CreateFriends(scene) {
    //console.log("CreateCenterMarketSellItems");

    CreateLoadingPopup();

    AssetLoadingManager.getInstance().init(scene);

    AssetLoadingManager.getInstance().lazyLoadFriends(() => {
        HideLoadingPopup();

        AssetsLoadDone(scene);
    });
}

function AssetsLoadDone(scene) {
    Destroy();

    container_main = scene.add.container(0, 0);
    container_main.setDepth(200);

    let lockBg = scene.add
        .image(0, 0, "home_friends_bg")
        .setInteractive()
        .setOrigin(0, 0);

    container_main.add(lockBg);

    let text_title = scene.add
        .text(
            606.5,
            274,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                "Friends"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "38px",
                color: "#ffffff",
            }
        )
        .setOrigin(0.5, 0);

    container_main.add(text_title);

    let avatar = scene.add
        .image(62 + 220 / 2, 392 + 220 / 2, centerData.userInfo.Avatar)
        .setOrigin(0.5, 0.5);

    container_main.add(avatar);

    let text_user_name = scene.add
        .text(306, 448, centerData.userInfo.Username || "No user loaded", {
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

    container_main.add(text_user_name);

    let text_user_id = scene.add
        .text(306, 524, "ID: " + centerData.userInfo.UserId, {
            fontFamily: "Russo One",
            fontSize: "32px",
            color: "#D2D2D2",
        })
        .setOrigin(0, 0);

    container_main.add(text_user_id);

    input_friend_id = "";
    CreateFriendInput(scene, function (value) {
        input_friend_id = value;
    });

    btn_request_list = CreateButton0(
        scene,
        container_main,
        686 + 328 / 2,
        641 + 86 / 2,
        "Request list"
    );
    container_main.add(btn_request_list);

    btn_request_list.button.on("pointerdown", function () {
        if (btn_friend_list) {
            btn_friend_list.button.setInteractive();
            btn_friend_list.setVisible(true);
        }

        if (btn_request_list) {
            btn_request_list.button.disableInteractive();
            btn_request_list.setVisible(false);
        }

        RequestAcceptFriendList(scene);
    });

    btn_friend_list = CreateButton0(
        scene,
        container_main,
        686 + 328 / 2,
        641 + 86 / 2,
        "Friend list"
    );
    container_main.add(btn_friend_list);

    btn_friend_list.button.on("pointerdown", function () {
        if (btn_friend_list) {
            btn_friend_list.button.disableInteractive();
            btn_friend_list.setVisible(false);
        }

        if (btn_request_list) {
            btn_request_list.button.setInteractive();
            btn_request_list.setVisible(true);
        }

        RequestFriendList(scene);
    });

    if (btn_friend_list) {
        btn_friend_list.button.disableInteractive();
        btn_friend_list.setVisible(false);
    }

    if (btn_request_list) {
        btn_request_list.button.setInteractive();
        btn_request_list.setVisible(true);
    }

    let btn_add_friend = CreateButton0(
        scene,
        container_main,
        686 + 328 / 2,
        754 + 86 / 2,
        "Add friend"
    );
    container_main.add(btn_add_friend);

    btn_add_friend.button.on("pointerdown", function () {
        if (input_friend_id != "") {
            AddFriend(scene, input_friend_id);
        } else {
            CreateAlertPopup(scene, "Please enter friend's ID");
        }
    });

    //create close btn
    const btn_close = scene.add
        .image(38 + 118 / 2, 248 + 90 / 2, "share_btn_home_2")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            MovePlayerBarToAccount(scene);

            Destroy(scene);
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

    container_main.add(btn_close);

    MovePlayerBarToHide(scene);

    HideGoogleButtonLoginTelegramLink();

    RequestFriendList(scene);
}

function RequestAcceptFriendList(scene) {
    // Khi mở danh sách chờ xác nhận, cần hủy danh sách bạn bè (nếu đang mở)
    DestroyFriendItemList(scene);

    CreateLoadingPopup();
    centerData.RequestGetFriendRequestList(
        (result) => {
            HideLoadingPopup();
            CreateAcceptItemList(scene, result.data.receivedRequests);
        },
        (error) => {
            HideLoadingPopup();
            CreateAlertPopup(scene, error);
        }
    );
}

function RequestFriendList(scene) {
    // Khi mở danh sách bạn bè, cần hủy danh sách chờ xác nhận (nếu đang mở)
    DestroyAcceptItemList(scene);

    CreateLoadingPopup();

    // Khởi tạo trạng thái phân trang
    currentFriendsPage = 1;
    totalFriendsPages = 1;
    isUpdatingFriends = true;

    centerData.RequestGetFriendList(
        currentFriendsPage,
        FRIENDS_PAGE_LIMIT,
        (result) => {
            HideLoadingPopup();

            // Lưu tổng số trang từ pagination
            if (
                result &&
                result.data &&
                result.data.pagination &&
                typeof result.data.pagination.pages === "number"
            ) {
                totalFriendsPages = result.data.pagination.pages;
            } else {
                totalFriendsPages = 1;
            }

            CreateFriendItemList(scene, result);
            isUpdatingFriends = false;
        },
        (error) => {
            HideLoadingPopup();
            isUpdatingFriends = false;
            CreateAlertPopup(scene, error);
        }
    );
}

let container_accept_item_list = null;

function DestroyAcceptItemList(scene) {
    if (container_accept_item_list) {
        container_accept_item_list.destroy();
        container_accept_item_list = null;
    }
}

function CreateAcceptItemList(scene, requestArr) {
    //console.log("CreateAcceptItemList: ");

    DestroyFriendItemList(scene);

    DestroyAcceptItemList(scene);

    //Create friend list
    container_accept_item_list = scene.add.container(0, 0);
    //container_list.setDepth(200);
    container_main.add(container_accept_item_list);

    // Kích thước của ScrollView
    const scrollViewWidth = 1020;
    const scrollViewHeight = 1044;

    const columns = 1;
    const rows = Math.ceil(2 / columns);

    const itemWidth = 904;
    const itemHeight = 200;
    const itemSpacing = 20;

    const posX = 30 + scrollViewWidth / 2;
    const posY = 876 + scrollViewHeight / 2;

    // const background = scene.add
    //     .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0xffffff)
    //     .setAlpha(0.5);
    // container_list.add(background);

    // Tạo một Scrollable Panel (bảng cuộn)
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
                left: 126,
                right: 0,
                top: 40,
                bottom: 200 / 2 + 20 / 2,
            },
        })
        .layout();

    container_accept_item_list.add(scrollablePanel);

    for (let i = 0; i < requestArr.length; i++) {
        const requestData = requestArr[i];

        let container_item = CreateAcceptItem(
            scene,
            scrollablePanel,
            requestData
        );

        container_item.button_accept.button.on("pointerdown", function () {
            AcceptFriend(scene, container_item);
        });

        container_item.button_reject.button.on("pointerdown", function () {
            RejectFriend(scene, container_item);
        });
    }

    scrollablePanel.layout();

    let maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_accept_item_list.add(maskShape);

    let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    scrollablePanel.setMask(mask);
}

function CreateAcceptItem(scene, scrollablePanel, itemData) {
    // console.log("CreateItem itemData: ", itemData);

    let itemWidth = 904;
    let itemHeight = 200;

    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);

    item.itemData = itemData;

    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    item.add(container_inner);
    item.container_inner = container_inner;

    item.bg = scene.add
        .image(0, 0, "home_friends_list_item_bg")
        .setOrigin(0, 0);
    container_inner.add(item.bg);

    item.avatar = scene.add
        .image(23 + 160 / 2, 20 + 160 / 2, item.itemData.Avatar)
        .setDisplaySize(160, 160)
        .setOrigin(0.5, 0.5);
    container_inner.add(item.avatar);

    item.text_name = scene.add
        .text(199, 20, item.itemData.Username, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "38px",
            color: "#ffffff",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(item.text_name);

    item.text_id = scene.add
        .text(199, 74, item.itemData.FromUserId, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "24px",
            color: "#ffffff",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 650, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(item.text_id);

    item.button_accept = CreateButton1(
        scene,
        container_inner,
        640 + 200 / 2,
        35 + 58 / 2,
        "home_friends_btn_0",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Accept"
        )
    );

    item.button_reject = CreateButton1(
        scene,
        container_inner,
        640 + 200 / 2,
        114 + 58 / 2,
        "home_friends_btn_1",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Reject"
        )
    );

    scrollablePanel.getElement("panel").add(item, {
        align: "top-left",
        expand: false,
    });

    return item;
}

let container_friend_item_list = null;

function DestroyFriendItemList(scene) {
    if (container_friend_item_list) {
        container_friend_item_list.destroy();
        container_friend_item_list = null;
    }
}

function CreateFriendItemList(scene, receivedData) {
    //console.log("CreateFriendItemList receivedData: ", receivedData);

    DestroyAcceptItemList(scene);

    DestroyFriendItemList(scene);

    //Create friend list
    container_friend_item_list = scene.add.container(0, 0);
    container_main.add(container_friend_item_list);

    if (
        !receivedData ||
        !receivedData.data ||
        !receivedData.data.friends ||
        receivedData.data.friends.length === 0
    ) {
        const emptyText = scene.add
            .text(540, 1400, "No Friends", {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "38px",
                color: "#ffffff",
                align: "center",
                stroke: "#000000",
                strokeThickness: 10,
            })
            .setOrigin(0.5, 0.5);
        container_friend_item_list.add(emptyText);
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
    friendsGridTable = scene.rexUI.add
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
            items: receivedData.data.friends,
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
                left: 126,
                right: 0,
                top: 40,
                bottom: 200 / 2 + 20 / 2,
            },
        })
        .layout();

    container_friend_item_list.add(friendsGridTable);

    // Theo dõi tương tác kéo thả để xử lý cuộn và nạp thêm
    friendsGridTable
        .setInteractive()
        .on("pointerdown", function (pointer) {
            friendsGridTable.startY = pointer.y;
            friendsGridTable.isDragging = true;
            friendsGridTable.startTime = scene.time.now;
        })
        .on("pointermove", function (pointer) {
            if (!friendsGridTable.isDragging) return;

            const deltaY = pointer.y - friendsGridTable.startY;
            friendsGridTable.startY = pointer.y;

            let currentT = friendsGridTable.t - deltaY * 0.001;
            currentT = Phaser.Math.Clamp(currentT, 0, 1);
            friendsGridTable.setT(currentT);

            if (friendsGridTable.t > 0.9 && !isUpdatingFriends) {
                UpdateFriendList(scene);
            }
        })
        .on("pointerup", function () {
            friendsGridTable.isDragging = false;
        })
        .on("pointerover", function (pointer) {
            if (friendsGridTable.isDragging) {
                friendsGridTable.startY = pointer.y;
            }
        });

    // Thêm sự kiện cuộn chuột
    friendsGridTable.on("scroll", function () {
        if (friendsGridTable.t > 0.9 && !isUpdatingFriends) {
            UpdateFriendList(scene);
        }
    });

    // Thiết lập mask
    let maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_friend_item_list.add(maskShape);

    let mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    friendsGridTable.setMask(mask);
}

function UpdateFriendList(scene) {
    if (isUpdatingFriends) return;
    if (currentFriendsPage >= totalFriendsPages) return;

    isUpdatingFriends = true;
    currentFriendsPage++;

    CreateLoadingPopup();

    centerData.RequestGetFriendList(
        currentFriendsPage,
        FRIENDS_PAGE_LIMIT,
        (result) => {
            HideLoadingPopup();

            const newFriends =
                result && result.data && result.data.friends
                    ? result.data.friends
                    : [];
            CreateUpdateFriendList(scene, newFriends);

            isUpdatingFriends = false;
        },
        (error) => {
            HideLoadingPopup();
            isUpdatingFriends = false;
        }
    );
}

function CreateUpdateFriendList(scene, friendArray) {
    if (!friendArray || friendArray.length <= 0) {
        return;
    }

    let currentItems = friendsGridTable.items;
    let updatedItems = [...currentItems, ...friendArray];
    friendsGridTable.setItems(updatedItems);
    friendsGridTable.refresh();
}

function createFriendItem(scene, itemWidth, itemHeight) {
    const container = scene.add.container(0, 0);
    container.setSize(itemWidth, itemHeight);

    const container_inner = scene.add.container(-70, 0);
    container.add(container_inner);

    const bg = scene.add
        .image(0, 0, "home_friends_list_item_bg")
        .setOrigin(0, 0);
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

    const button_message = CreateButton1(
        scene,
        container_inner,
        640 + 200 / 2,
        35 + 58 / 2,
        "home_friends_btn_0",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Message"
        )
    );

    // Lắng nghe một lần, dùng container.itemData động để hành xử theo dữ liệu mới
    button_message.button.removeAllListeners("pointerdown");
    button_message.button.on("pointerdown", function () {
        CreateFriendMessage(scene, {
            UserId: container.itemData.UserId,
            Username: container.itemData.Username,
            Avatar: container.itemData.Avatar,
        });

        Destroy();
    });

    const button_remove = CreateButton1(
        scene,
        container_inner,
        640 + 200 / 2,
        114 + 58 / 2,
        "home_friends_btn_1",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Remove"
        )
    );

    // Lắng nghe một lần, dùng container.itemData động để hành xử theo dữ liệu mới
    button_remove.button.removeAllListeners("pointerdown");
    button_remove.button.on("pointerdown", function () {
        const itemData = container.itemData;
        if (!itemData) return;

        RemoveFriend(scene, container);
    });

    // API cập nhật nội dung được gọi bởi gridTable
    container.updateContent = function (data) {
        container.itemData = data;
        if (!data) return;

        avatar.setTexture(data.Avatar);
        avatar.setDisplaySize(160, 160);
        text_name.setText(data.Username);
        text_id.setText(data.UserId);
    };

    return container;
}

function AddFriend(scene, friendId) {
    CreateLoadingPopup();
    centerData.RequestAddFriend(
        friendId,
        (result) => {
            HideLoadingPopup();
            CreateAlertPopup(scene, result.message);
        },
        (error) => {
            HideLoadingPopup();
            CreateAlertPopup(scene, error);
        }
    );
}

function AcceptFriend(scene, item) {
    CreateLoadingPopup();
    centerData.RequestAcceptFriend(
        item.itemData.FromUserId,
        (result) => {
            HideLoadingPopup();
            CreateAlertPopup(scene, result.message);

            RequestAcceptFriendList(scene);
        },
        (error) => {
            HideLoadingPopup();
            CreateAlertPopup(scene, error);
        }
    );
}

function RejectFriend(scene, item) {
    CreateLoadingPopup();
    centerData.RequestRejectFriend(
        item.itemData.FromUserId,
        (result) => {
            HideLoadingPopup();
            CreateAlertPopup(scene, result.message);

            RequestAcceptFriendList(scene);
        },
        (error) => {
            HideLoadingPopup();
            CreateAlertPopup(scene, error);
        }
    );
}

function RemoveFriend(scene, item) {
    CreateLoadingPopup();
    centerData.RequestRemoveFriend(
        item.itemData.UserId,
        (result) => {
            HideLoadingPopup();
            CreateAlertPopup(scene, result.message);

            RequestFriendList(scene);
        },
        (error) => {
            HideLoadingPopup();
            CreateAlertPopup(scene, error);
        }
    );
}

function CreateFriendInput(scene, onValueChange) {
    let placeHolderStr = cdLocalization.getLocalization(
        cdLocalization.GROUP_KEYS.CenterMarket.KEY,
        "Enter friend's ID"
    );

    let fontStr = cdLocalization.getCurrentFont();

    // Tạo input HTML
    const inputHTML = `
<form id="converter-form">
    <input 
        type="text" 
        min="0"
        step="1"  
        id="friendInput" 
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
    const form_element = scene.add
        .dom(62 + 584 / 2, 748 + 89 / 2) // Vị trí trung tâm màn hình
        .createFromHTML(inputHTML);

    container_main.add(form_element);

    // Lấy phần tử input
    const inputElement = document.getElementById("friendInput");
    const inputForm = document.getElementById("converter-form"); // Lấy đối tượng FORM

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

export function Destroy(scene) {
    if (container_main) {
        container_main.destroy();
        container_main = null;
    }

    if (container_accept_item_list) {
        container_accept_item_list.destroy();
        container_accept_item_list = null;
    }

    if (container_friend_item_list) {
        container_friend_item_list.destroy();
        container_friend_item_list = null;
    }

    if (friendsGridTable) {
        friendsGridTable.destroy();
        friendsGridTable = null;
    }

    // Reset pagination variables
    currentFriendsPage = 0;
    totalFriendsPages = 0;
    isUpdatingFriends = false;

    ShowGoogleButtonLoginTelegramLink();
}
