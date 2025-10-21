import centerData from "../../../Data/CenterData.js";
import centerDataItem from "../../../Data/CenterDataItem.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import centerDataPlayer from "../../../Data/CenterDataPlayer.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";
import { CreateCharacterCard } from "../../Share/CharacterCard.js";
import { CreateCenterMarketCharacterSelected } from "./HomeCenterMarketMainCharacterSelected.js";
import { RequestCharacterStarLevelStatisticsDetail } from "./HomeCenterMarketMainCharacterStar.js";

let selectedCode = null;
let selectedStar = null;
let selectedLevel = null;

export function CreateCenterMarketCharacterSelectedDetail(
    scene,
    code,
    star,
    level
) {
    selectedCode = code;
    selectedStar = star;
    selectedLevel = level;

    CreateBuy(scene);
}

let container_buy = null;

let container_buy_buttons = null;

let maskShape = null;

let mask = null;

let gridTable = null;

let currentPage = 0;

let totalPages = 0;

// Phân trang và cuộn vô hạn
let isUpdating = false;
const PAGE_LIMIT = 10;

function CreateBuy(scene) {
    //console.log("CreateBuy item: ", item);

    Destroy(scene);

    container_buy = scene.add.container(0, 0);
    container_buy.setDepth(300);

    container_buy_buttons = scene.add.container(0, 0);
    container_buy_buttons.setDepth(300);

    let bg = scene.add
        .image(0, 0, "home_center_market_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_buy.add(bg);

    let bg2 = scene.add
        .image(0, 0, "home_center_market_item_bg")
        .setOrigin(0, 0);
    container_buy.add(bg2);

    let baseInfo = centerData.baseCharacterInfo[selectedCode];

    let container_card = CreateCharacterCard(
        scene,
        "",
        baseInfo.code,
        baseInfo.name,
        baseInfo.role,
        baseInfo.rank,
        selectedLevel,
        selectedStar
    );

    container_card.setScale(500 / 444);

    container_card.setPosition(45 + 360 / 2, 192 + 500 / 2);

    container_buy.add(container_card);

    const text_name = scene.add
        .text(
            424,
            205,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeShop.KEY,
                baseInfo.name
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "32px", // Font-size
                color: "#FFA600", // Màu chữ (color)
                align: "left",
            }
        )
        .setOrigin(0, 0);
    container_buy.add(text_name);

    const text_star = scene.add
        .text(
            424,
            247,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.CenterMarket.KEY,
                "Star"
            ) +
                ": " +
                selectedStar,
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "32px", // Font-size
                color: "#FFA600", // Màu chữ (color)
                align: "left",
                wordWrap: { width: 250, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);
    container_buy.add(text_star);

    const text_level = scene.add
        .text(
            424,
            283,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.CenterMarket.KEY,
                "Level"
            ) +
                ": " +
                selectedLevel,
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "32px", // Font-size
                color: "#FFA600", // Màu chữ (color)
                align: "left",
                wordWrap: { width: 250, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);
    container_buy.add(text_level);

    CreateLoadingPopup();

    // Khởi tạo trạng thái phân trang
    currentPage = 1;
    totalPages = 1;
    isUpdating = true;

    centerData.RequestGetCMarketCharacterListingsByCodeStarLevel(
        selectedCode,
        selectedStar,
        selectedLevel,
        currentPage,
        PAGE_LIMIT,
        (result) => {
            HideLoadingPopup();

            // Lưu tổng số trang từ pagination
            if (
                result &&
                result.pagination &&
                typeof result.pagination.pages === "number"
            ) {
                totalPages = result.pagination.pages;
            } else {
                totalPages = 1;
            }

            // Tạo danh sách lần đầu
            CreateCancelPriceList(scene, result.data || []);

            isUpdating = false;
        },
        () => {
            HideLoadingPopup();
            isUpdating = false;
        }
    );

    let btn_cancel = CreateOptionsButton(
        scene,
        435 + 286 / 2,
        619 + 84 / 2,
        "home_center_market_button_2",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Cancel"
        )
    );
    container_buy_buttons.add(btn_cancel);

    btn_cancel.button.on("pointerdown", function () {
        Destroy(scene);

        CreateCenterMarketCharacterSelected(
            scene,
            baseInfo.role,
            selectedCode,
            selectedStar
        );
    });
}

let container_price_list = null;

function CreateCancelPriceList(scene, listedArray) {
    if (container_price_list) {
        container_price_list.destroy();
    }

    //Create friend list
    container_price_list = scene.add.container(0, 0);
    container_buy.add(container_price_list);

    // Kích thước của ScrollView
    const scrollViewWidth = 1200;
    const scrollViewHeight = 1150;

    const itemWidth = 1000;
    const itemHeight = 110;
    const itemSpacing = 20;

    const posX = -40 + scrollViewWidth / 2;
    const posY = 745 + scrollViewHeight / 2;

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
            items: listedArray,
            createCellContainerCallback: function (cell, cellContainer) {
                var scene = cell.scene,
                    item = cell.item;
                if (cellContainer === null) {
                    // Chỉ tạo container một lần
                    cellContainer = createPriceListItem(
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
                left: 80,
                right: 0,
                top: 10,
                bottom: 110 / 2 + 10 / 2,
            },
        })
        .layout();

    container_price_list.add(gridTable);

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
                UpdateCancelPriceList(scene);
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
            UpdateCancelPriceList(scene);
        }
    });

    // Thiết lập mask
    maskShape = scene.add
        .rectangle(posX, posY, scrollViewWidth, scrollViewHeight, 0x000000)
        .setVisible(false);
    container_price_list.add(maskShape);

    mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    gridTable.setMask(mask);
}

function UpdateCancelPriceList(scene) {
    if (isUpdating) return;
    if (currentPage >= totalPages) return;

    isUpdating = true;
    currentPage++;

    CreateLoadingPopup();

    centerData.RequestGetCMarketCharacterListingsByCodeStarLevel(
        selectedCode,
        selectedStar,
        selectedLevel,
        currentPage,
        PAGE_LIMIT,
        (result) => {
            HideLoadingPopup();

            const newItems = result && result.data ? result.data : [];
            CreateUpdateCancelItemList(scene, newItems);

            isUpdating = false;
        },
        (error) => {
            HideLoadingPopup();
            isUpdating = false;
        }
    );
}

function CreateUpdateCancelItemList(scene, listedArray) {
    if (!listedArray || listedArray.length <= 0) {
        return;
    }

    let currentItems = gridTable.items;
    let updatedItems = [...currentItems, ...listedArray];
    gridTable.setItems(updatedItems);
    gridTable.refresh();
}

function createPriceListItem(scene, itemWidth, itemHeight) {
    const container = scene.add.container(0, 0);
    container.setSize(itemWidth, itemHeight);

    const container_inner = scene.add.container(0, 0);
    container.add(container_inner);

    const bg = scene.add
        .image(0, 0, "home_center_market_price_element_bg")
        .setOrigin(0, 0);
    container_inner.add(bg);

    const text_price = scene.add
        .text(30, itemHeight / 2, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "32px",
            color: "#FFA600",
            align: "left",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 300, useAdvancedWrap: true },
        })
        .setOrigin(0, 0.5);
    container_inner.add(text_price);

    const text_seller = scene.add
        .text(500, itemHeight / 2, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "32px",
            color: "#FFA600",
            align: "right",
            stroke: "#000000",
            strokeThickness: 10,
            wordWrap: { width: 300, useAdvancedWrap: true },
        })
        .setOrigin(1, 0.5);
    container_inner.add(text_seller);

    const btn_select = CreateButton0(
        scene,
        container_inner,
        769 + 218 / 2,
        10 + 98 / 2,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Buy"
        )
    );

    // Lắng nghe một lần, dùng container.itemData động để hành xử theo dữ liệu mới
    btn_select.button.removeAllListeners("pointerdown");
    btn_select.button.on("pointerdown", function () {
        const itemData = container.itemData;
        if (!itemData) return;
        CreateAlertPopup(
            scene,
            `Buy this item with ${itemData.price} M-Coin?`,
            () => {
                if (itemData.price >= centerData.userInfo.Musk) {
                    CreateAlertPopup(
                        scene,
                        cdLocalization.getLocalization(
                            cdLocalization.GROUP_KEYS.Main.KEY,
                            "Not enough M-Coin"
                        )
                    );

                    return;
                }

                CreateLoadingPopup();
                centerData.RequestPostCMarketCharacterBuy(
                    itemData._id,
                    (result) => {
                        HideLoadingPopup();
                        CreateAlertPopup(scene, result.message, () => {}, null);

                        CreateCenterMarketCharacterSelectedDetail(
                            scene,
                            selectedCode,
                            selectedStar,
                            selectedLevel
                        );

                        RequestCharacterStarLevelStatisticsDetail();
                    },
                    (error) => {
                        HideLoadingPopup();
                        CreateAlertPopup(scene, error, () => {}, null);
                    }
                );
            },
            () => {}
        );
    });

    // API cập nhật nội dung được gọi bởi gridTable
    container.updateContent = function (data) {
        container.itemData = data;
        if (!data) return;
        text_price.setText(data.price + " M-Coin");
        text_seller.setText(
            data.sellerId && data.sellerId.Username
                ? data.sellerId.Username
                : ""
        );
    };

    return container;
}

function CreateButton0(scene, container, x, y, buttonName) {
    let btnWidth = 218;
    let btnHeight = 98;

    const btn_container = scene.add.container(x, y);
    container.add(btn_container);

    const btn_inner_container = scene.add.container(
        -btnWidth / 2,
        -btnHeight / 2
    );
    btn_container.add(btn_inner_container);

    btn_container.button = scene.add
        .image(0, 0, "home_center_market_button_0")
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

function CreateOptionsButton(scene, x, y, imageKey, buttonName) {
    let btnWidth = 286;
    let btnHeight = 84;

    const btn_container = scene.add.container(x, y);
    container_buy.add(btn_container);

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
            btnHeight / 2 - 8,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
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

function Destroy(scene) {
    if (container_buy) {
        container_buy.destroy();
    }
    if (container_buy_buttons) {
        container_buy_buttons.destroy();
    }
}
