import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import centerData from "../../../Data/CenterData.js";
import centerDataItem from "../../../Data/CenterDataItem.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";

let container_main = null;

let container_history = null;

let container_buttons = null;

let maskShape = null;

let mask = null;

let scrollablePanel = null;

let currentPage = 0;

let totalPages = 0;

let selectedSlug = "";

let dataSaple = {
    success: true,
    data: [
        {
            date: "2025-06-07T05:01:39.534Z",
            chipAmountConverted: 1000,
            msciAmountReceived: 226.68016958071465,
            conversionRateK: 0.22668016958071466,
        },
        {
            date: "2025-06-07T04:56:35.164Z",
            chipAmountConverted: 100,
            msciAmountReceived: 22.668016958071465,
            conversionRateK: 0.22668016958071466,
        },
    ],
    pagination: {
        page: 1,
        limit: 20,
        totalPages: 1,
        totalResults: 2,
    },
};

export function CreateMSCITokenomicProgramDetail(scene, slug) {
    Destroy();

    selectedSlug = slug;

    container_main = scene.add.container(0, 0);
    container_main.setDepth(300);

    container_history = scene.add.container(0, 0);
    container_main.add(container_history);

    container_buttons = scene.add.container(0, 0);
    container_main.add(container_buttons);

    const lock_bg = scene.add
        .image(0, 0, "home_earn_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_history.add(lock_bg);

    const popu_bg = scene.add
        .image(0, 0, "home_earn_msci_view_detail_popup_bg")
        .setOrigin(0, 0);
    container_history.add(popu_bg);

    // let title = scene.add
    //     .image(
    //         322 + 720 / 2,
    //         80 + 90 / 2,
    //         "home_earn_chip_to_msci_history_title"
    //     )
    //     .setOrigin(0.5, 0.5);
    // container_history.add(title);

    //create close btn
    const btn_close = scene.add
        .image(38 + 32 / 2, 98 + 54 / 2, "share_btn_back")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            Destroy();
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

    CreateLoadingPopup();

    currentPage = 1;

    totalPages = 1;

    centerData.RequestTokenomicSlugDetail(
        selectedSlug,
        currentPage,
        (result) => {
            HideLoadingPopup();

            totalPages = result.pagination.totalPages;

            CreateList(scene, result);
        },
        (error) => {
            HideLoadingPopup();

            //console.log("lấy quest thất bại:", error);
            // Thực hiện các hành động khi đăng nhập thất bại
        }
    );
}

let isUpdating = false;
function UpdateHistory(scene) {
    if (isUpdating) return;

    if (currentPage < totalPages) {
        isUpdating = true;

        currentPage++;

        CreateLoadingPopup();

        centerData.RequestTokenomicSlugDetail(
            selectedSlug,
            currentPage,
            (result) => {
                isUpdating = false;

                HideLoadingPopup();

                CreateUpdateItemList(scene, result);
            },
            (error) => {
                isUpdating = false;

                HideLoadingPopup();

                //console.log("lấy quest thất bại:", error);
                // Thực hiện các hành động khi đăng nhập thất bại
            }
        );
    }
}

function CreateList(scene, respone) {
    //console.log("CreateList: ", respone.history);

    {
        const text_titile = scene.add
            .text(
                540,
                230 + 8,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                    respone.categoryName
                ),
                {
                    fontFamily: cdLocalization.getCurrentFont(),
                    fontSize: "40px",
                    color: "#ffffff",
                    align: "left",
                }
            )
            .setOrigin(0.5, 0);
        container_history.add(text_titile);
    }

    {
        const text_titile = scene.add
            .text(
                540,
                322 + 8,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                    "Total $MSCI"
                ),
                {
                    fontFamily: cdLocalization.getCurrentFont(),
                    fontSize: "40px",
                    color: "#ffffff",
                    align: "left",
                }
            )
            .setOrigin(0.5, 0);
        container_history.add(text_titile);

        let text_value = scene.add
            .text(540, 384 + 8, respone.total, {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "40px",
                color: "#ffffff",
                align: "right",
            })
            .setOrigin(0.5, 0);
        container_history.add(text_value);
    }

    {
        const text_titile = scene.add
            .text(
                540,
                476 + 8,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                    "$MSCI remaining"
                ),
                {
                    fontFamily: cdLocalization.getCurrentFont(),
                    fontSize: "40px",
                    color: "#ffffff",
                    align: "left",
                }
            )
            .setOrigin(0.5, 0);
        container_history.add(text_titile);

        let text_value = scene.add
            .text(540, 538 + 8, respone.remaining, {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "40px",
                color: "#ffffff",
                align: "right",
            })
            .setOrigin(0.5, 0);
        container_history.add(text_value);
    }

    if (!respone.history || respone.history.length <= 0) {
        return;
    }

    let arr_data = respone.history;

    // Kích thước của ScrollView
    const scrollViewWidth = 1080;
    const scrollViewHeight = 1246;

    const columns = 1;
    const rows = Math.ceil(arr_data.length / columns);

    const itemWidth = 1004;
    const itemHeight = 218;
    const itemSpacing = 16;

    const posX = 38 + scrollViewWidth / 2;
    const posY = 620 + scrollViewHeight / 2;

    // const background = scene.add
    //   .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
    //   .setAlpha(0.8);

    // container_archivement.add(background);

    // Tạo một Scrollable Panel (bảng cuộn)
    scrollablePanel = scene.rexUI.add
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

    scrollablePanel.itemLenght = arr_data.length;

    container_history.add(scrollablePanel);

    for (let i = 0; i < arr_data.length; i++) {
        //console.log("CreateListItem: ", arr_data[i]);

        CreateListItem(scene, scrollablePanel, arr_data[i]);
    }

    scrollablePanel.layout();

    maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_history.add(maskShape);

    mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    scrollablePanel.setMask(mask);
}

function CreateUpdateItemList(scene, respone) {
    if (!respone.history || respone.history.length <= 0) {
        return;
    }

    let arr_data = respone.history;

    scrollablePanel.itemLenght += arr_data.length;

    for (let i = 0; i < arr_data.length; i++) {
        //console.log("CreateListItem: ", arr_data[i]);

        CreateListItem(scene, scrollablePanel, arr_data[i]);
    }

    scrollablePanel.layout();
}

function CreateListItem(scene, scrollablePanel, transaction) {
    //console.log("CreateListItem: ", transaction);

    const itemWidth = 1004;
    const itemHeight = 218;

    const item = scene.add.container(0, 0);
    item.setSize(itemWidth, itemHeight);
    item.setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function (pointer) {
            //console.log("btn_item clicked");

            scrollablePanel.startY = pointer.y;

            scrollablePanel.isDragging = true;

            item.startTime = scene.time.now; // Lấy thời gian hiện tại khi nhấn chuột
        })
        .on("pointermove", function (pointer) {
            //console.log("btn_item pointermove");

            if (!scrollablePanel.isDragging) return;

            const deltaY = pointer.y - scrollablePanel.startY; // Tính độ chênh lệch so với vị trí trước đó
            scrollablePanel.startY = pointer.y; // Cập nhật startY cho lần di chuyển tiếp theo

            let itemCount = scrollablePanel.itemLenght;

            let columns = 3;

            let rows = Math.ceil(itemCount / columns);

            let maxHeight = itemHeight * rows;

            let tPerPixel = 1 * (itemHeight / maxHeight);

            let smoothVal = 0.005;

            // Tính toán giá trị T hiện tại của bảng và điều chỉnh theo deltaY
            let currentT = scrollablePanel.t - deltaY * (tPerPixel * smoothVal); // Điều chỉnh tốc độ cuộn
            currentT = Phaser.Math.Clamp(currentT, 0, 1); // Đảm bảo T nằm trong phạm vi 0-1

            scrollablePanel.setT(currentT); // Cập nhật vị trí cuộn của bảng

            if (scrollablePanel.t > 0.9) {
                UpdateHistory(scene);
            }
        })
        .on("pointerup", function (pointer) {
            //console.log("btn_item pointerup");

            if (scrollablePanel.isDragging == false) {
                //do something if it is seleted not dragging
            }

            scrollablePanel.isDragging = false; // Dừng kéo

            const endTime = scene.time.now; // Lấy thời gian hiện tại khi thả chuột
            const duration = endTime - item.startTime; // Tính thời gian giữa hai sự kiện

            if (duration <= 125) {
            }
        })
        .on("pointerover", function (pointer) {
            if (scrollablePanel.isDragging == true) {
                scrollablePanel.startY = pointer.y;
            }
        });

    item.transaction = transaction;

    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    item.add(container_inner);

    //console.log(`item.achievement${i}`, item.achievement);

    // const item_bg = scene.rexUI.add.roundRectangle(
    //   0,
    //   0,
    //   itemWidth,
    //   itemHeight,
    //   0,
    //   0xffffff
    // );
    // item_bg.setOrigin(0.5, 0.5);
    // item.add(item_bg);

    let bg = scene.rexUI.add
        .roundRectangle(
            0, // Tọa độ x
            0, // Tọa độ y
            itemWidth, // Chiều rộng
            itemHeight, // Chiều cao
            0, // Độ bo góc
            0x000000, // Màu nền
            0.6 // Độ trong suốt
        )
        .setOrigin(0, 0);
    container_inner.add(bg);

    const type_icon = scene.add
        .image(32 + 75 / 2, 32 + 65 / 2, "home_earn_wallet_icon_3")
        .setTint(0xcccccc);
    container_inner.add(type_icon);

    const text_time = scene.add
        .text(139, 30, formatDateTime(item.transaction.date), {
            fontFamily: "Russo One",
            fontSize: "24px",
            color: "#CCCCCC",
            align: "left",
            wordWrap: { width: itemWidth / 2, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_time);

    const text_amountUnlocked = scene.add
        .text(139, 75, "$MSCI: " + item.transaction.amountUnlocked, {
            fontFamily: "Russo One",
            fontSize: "24px",
            color: "#CCCCCC",
            align: "left",
            wordWrap: { width: itemWidth / 2, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_amountUnlocked);

    scrollablePanel.getElement("panel").add(item, {
        align: "top-left",
        expand: false,
    });
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

export function Destroy() {
    if (container_main) {
        container_main.destroy();
        container_main = null;
    }

    if (maskShape) {
        maskShape.destroy();
    }

    if (mask) {
        mask.destroy();
    }
}
