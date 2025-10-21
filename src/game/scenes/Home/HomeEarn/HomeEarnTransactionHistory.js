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

let container_history_list = null;

let container_buttons = null;

let btn_musk = null;
let btn_chip = null;
let btn_msci = null;

let maskShape = null;

let mask = null;

let gridTable = null;

let currentPage = 0;

let totalPages = 0;

let currentHistory = "musk";

export function CreateHistory(scene) {
    Destroy();

    container_main = scene.add.container(0, 0);
    container_main.setDepth(200);

    container_history = scene.add.container(0, 0);
    container_main.add(container_history);

    container_buttons = scene.add.container(0, 0);
    container_main.add(container_buttons);

    const lock_bg = scene.add
        .image(0, 0, "home_earn_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_history.add(lock_bg);

    let title = scene.add
        .image(
            322 + 720 / 2,
            80 + 90 / 2,
            "home_earn_transaction_history_title"
        )
        .setOrigin(0.5, 0.5);
    container_history.add(title);

    btn_musk = CreateCatButton(scene, 0 + 360 / 2, 219 + 120 / 2, "Musk");

    btn_musk.button.on("pointerdown", function () {
        ActiveMusk(scene);
    });

    btn_chip = CreateCatButton(scene, 360 + 360 / 2, 219 + 120 / 2, "Chip");

    btn_chip.button.on("pointerdown", function () {
        ActiveChip(scene);
    });

    btn_msci = CreateCatButton(scene, 720 + 360 / 2, 219 + 120 / 2, "MSCI");

    btn_msci.button.on("pointerdown", function () {
        ActiveMSCI(scene);
    });

    ActiveMusk(scene);

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
}

let isUpdating = false;
function UpdateHistory(scene) {
    if (isUpdating) return;

    if (currentPage < totalPages) {
        isUpdating = true;

        currentPage++;

        CreateLoadingPopup();

        if (currentHistory == "musk") {
            centerData.RequestTransactionHistoryMusk(
                currentPage,
                (result) => {
                    isUpdating = false;

                    HideLoadingPopup();

                    CreateUpdateItemList(scene, result.data);
                },
                (error) => {
                    isUpdating = false;

                    HideLoadingPopup();

                    //console.log("lấy quest thất bại:", error);
                    // Thực hiện các hành động khi đăng nhập thất bại
                }
            );
        } else if (currentHistory == "chip") {
            centerData.RequestTransactionHistoryChip(
                currentPage,
                (result) => {
                    isUpdating = false;

                    HideLoadingPopup();

                    CreateUpdateItemList(scene, result.data);
                },
                (error) => {
                    isUpdating = false;

                    HideLoadingPopup();

                    //console.log("lấy quest thất bại:", error);
                    // Thực hiện các hành động khi đăng nhập thất bại
                }
            );
        } else if (currentHistory == "msci") {
            centerData.RequestTransactionHistoryMSCI(
                currentPage,
                (result) => {
                    isUpdating = false;

                    HideLoadingPopup();

                    CreateUpdateItemList(scene, result.data);
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
}

function CreateList(scene, arr_data) {
    //console.log("CreateList: ", arr_data);

    if (container_history_list != null) {
        container_history_list.destroy();
    }

    container_history_list = scene.add.container(0, 0);
    container_history.add(container_history_list);

    if (!arr_data || arr_data.length <= 0) {
        return;
    }

    // Kích thước của ScrollView
    const scrollViewWidth = 1080;
    const scrollViewHeight = 1554;

    const itemWidth = 1004;
    const itemHeight = 218;
    const itemSpacing = 16;

    const posX = 38 + scrollViewWidth / 2;
    const posY = 366 + scrollViewHeight / 2;

    // Tạo một gridTable
    gridTable = scene.rexUI.add
        .gridTable({
            x: posX,
            y: posY,
            width: scrollViewWidth,
            height: scrollViewHeight,
            scrollMode: 0,
            table: {
                cellWidth: itemWidth,
                cellHeight: itemHeight + itemSpacing,
                columns: 1,
                reuseCellContainer: true, // Tái sử dụng cell container
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
            items: arr_data,
            createCellContainerCallback: function (cell, cellContainer) {
                var scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    // Chỉ tạo card một lần
                    cellContainer = createTransactionItem(scene);
                }

                // Cập nhật nội dung của card với dữ liệu mới
                cellContainer.updateContent(item);

                return cellContainer;
            },
            space: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 40,
            },
        })
        .layout();

    container_history_list.add(gridTable);

    gridTable.on("scroll", function () {
        if (gridTable.t > 0.9 && !isUpdating) {
            UpdateHistory(scene);
        }
    });

    maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_history_list.add(maskShape);

    mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    gridTable.setMask(mask);
}

function CreateUpdateItemList(scene, arr_data) {
    // Thêm dữ liệu mới vào gridTable
    if (!arr_data || arr_data.length <= 0) {
        return;
    }

    let currentItems = gridTable.items;
    let newItems = [...currentItems, ...arr_data];

    gridTable.setItems(newItems);
    gridTable.refresh();
}

function createTransactionItem(scene) {
    const itemWidth = 1004;
    const itemHeight = 218;

    const container = scene.add.container(0, 0);
    container.setSize(itemWidth, itemHeight);

    let container_inner = scene.add.container(0, 0);
    container.add(container_inner);

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

    const text_type = scene.add
        .text(139, 71, "", {
            fontFamily: "Russo One",
            fontSize: "32px",
            color: "#CCCCCC",
            align: "left",
            wordWrap: { width: itemWidth / 2, useAdvancedWrap: true },
        })
        .setOrigin(0, 1);
    container_inner.add(text_type);

    const text_time = scene.add
        .text(139, 75, "", {
            fontFamily: "Russo One",
            fontSize: "24px",
            color: "#CCCCCC",
            align: "left",
            wordWrap: { width: itemWidth / 2, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_time);

    const text_detail = scene.add
        .text(58, 146, "", {
            fontFamily: "Russo One",
            fontSize: "24px",
            color: "#CCCCCC",
            align: "left",
            wordWrap: { width: 888, useAdvancedWrap: true },
        })
        .setOrigin(0, 0);
    container_inner.add(text_detail);

    const text_amount = scene.add
        .text(900, 36, "", {
            fontFamily: "Russo One",
            fontSize: "52px",
            color: "#CCCCCC",
            align: "right",
            wordWrap: { width: itemWidth / 2, useAdvancedWrap: true },
        })
        .setOrigin(1, 0);
    container_inner.add(text_amount);

    const chip_icon = scene.add
        .image(908 + 64 / 2, 36 + 64 / 2, "home_top_currency_chip_1")
        .setVisible(false);
    container_inner.add(chip_icon);

    const musk_icon = scene.add
        .image(908 + 64 / 2, 36 + 64 / 2, "home_top_currency_chip_2")
        .setVisible(false);
    container_inner.add(musk_icon);

    const text_msci = scene.add
        .text(860, 36 + 64 / 2, "$MSCI", {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#FFA600",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
        })
        .setOrigin(0, 0.5)
        .setVisible(false);
    container_inner.add(text_msci);

    // Hàm để cập nhật dữ liệu cho card
    container.updateContent = function (transaction) {
        container.transaction = transaction;

        let status = "";
        if (transaction.status) {
            status = transaction.status;
        }

        // Cập nhật loại giao dịch
        text_type.setText(transaction.type.replace(/_/g, " ") + " " + status);

        // Cập nhật thời gian
        text_time.setText(formatDateTime(transaction.createdAt));

        // Cập nhật chi tiết
        text_detail.setText(transaction.detail);

        // Cập nhật số lượng và loại tiền tệ (hỗ trợ dữ liệu mới: currency; fallback: currencyUnit)
        const hasAmount =
            transaction.amount !== undefined && transaction.amount !== null;
        if (hasAmount) {
            text_amount.setText(transaction.amount);
            text_amount.setVisible(true);

            // Ẩn tất cả các icon và text tiền tệ
            chip_icon.setVisible(false);
            musk_icon.setVisible(false);
            text_msci.setVisible(false);

            const currencyValue = (
                (transaction.currency && String(transaction.currency)) ||
                (transaction.currencyUnit &&
                    String(transaction.currencyUnit)) ||
                ""
            ).toLowerCase();

            if (currencyValue === "chip") {
                chip_icon.setVisible(true);
                text_amount.setPosition(900, 36);
            } else if (currencyValue === "musk") {
                musk_icon.setVisible(true);
                text_amount.setPosition(900, 36);
            } else if (currencyValue === "msci") {
                text_amount.setPosition(850, 36);
                text_msci.setVisible(true);
            } else {
                // Không xác định loại tiền: hiển thị số lượng ở vị trí mặc định, không icon
                text_amount.setPosition(900, 36);
            }
        } else {
            text_amount.setVisible(false);
            chip_icon.setVisible(false);
            musk_icon.setVisible(false);
            text_msci.setVisible(false);
        }
    };

    // const debugRect = scene.add.rectangle(0, 0, itemWidth, itemHeight, 0x00ff00, 0).setOrigin(0, 0);
    // debugRect.setStrokeStyle(2, 0x00ff00, 1);
    // container.add(debugRect);

    return container;
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

function ActiveMusk(scene) {
    currentHistory = "musk";

    btn_musk.setSelected();
    btn_chip.setUnselected();
    btn_msci.setUnselected();

    currentPage = 1;

    totalPages = 1;

    CreateLoadingPopup();
    centerData.RequestTransactionHistoryMusk(
        currentPage,
        (result) => {
            HideLoadingPopup();

            totalPages = result.pagination.totalPages;

            CreateList(scene, result.data);
        },
        (error) => {
            HideLoadingPopup();

            //console.log("lấy quest thất bại:", error);
            // Thực hiện các hành động khi đăng nhập thất bại
        }
    );
}

function ActiveChip(scene) {
    currentHistory = "chip";

    btn_musk.setUnselected();
    btn_chip.setSelected();
    btn_msci.setUnselected();

    currentPage = 1;

    totalPages = 1;

    CreateLoadingPopup();
    centerData.RequestTransactionHistoryChip(
        currentPage,
        (result) => {
            HideLoadingPopup();

            totalPages = result.pagination.totalPages;

            CreateList(scene, result.data);
        },
        (error) => {
            HideLoadingPopup();

            //console.log("lấy quest thất bại:", error);
            // Thực hiện các hành động khi đăng nhập thất bại
        }
    );
}

function ActiveMSCI(scene) {
    currentHistory = "msci";

    btn_musk.setUnselected();
    btn_chip.setUnselected();
    btn_msci.setSelected();

    currentPage = 1;

    totalPages = 1;

    CreateLoadingPopup();
    centerData.RequestTransactionHistoryMSCI(
        currentPage,
        (result) => {
            HideLoadingPopup();

            totalPages = result.pagination.totalPages;

            CreateList(scene, result.data);
        },
        (error) => {
            HideLoadingPopup();

            //console.log("lấy quest thất bại:", error);
            // Thực hiện các hành động khi đăng nhập thất bại
        }
    );
}

function CreateCatButton(scene, x, y, buttonName) {
    let btnWidth = 360;
    let btnHeight = 120;

    const btn_container = scene.add.container(x, y);
    container_buttons.add(btn_container);

    const btn_inner_container = scene.add.container(
        -btnWidth / 2,
        -btnHeight / 2
    );
    btn_container.add(btn_inner_container);

    btn_container.button = scene.add
        .image(0, 0, "home_earn_cat_button")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true })
        .on("pointerdown", function () {})
        .on("pointerover", function () {
            // Hiệu ứng hover có thể được thêm vào đây
        })
        .on("pointerout", function () {
            // Hiệu ứng hover có thể được thêm vào đây
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
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "38px",
                color: "#FFF",
                align: "center",
            }
        )
        .setOrigin(0.5, 0.5);

    btn_inner_container.add(text);

    btn_container.setSelected = function () {
        btn_container.button.disableInteractive();
        btn_inner_container.each(function (child) {
            if (child.setTint) {
                child.clearTint();
            }
        });
    };

    btn_container.setUnselected = function () {
        btn_container.button.setInteractive();
        btn_inner_container.each(function (child) {
            if (child.setTint) {
                child.setTint(0x9a9a9a);
            }
        });
    };

    return btn_container;
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

    gridTable = null;
}
