import centerData from "../../../Data/CenterData.js";
import centerDataItem from "../../../Data/CenterDataItem.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import centerDataPlayer from "../../../Data/CenterDataPlayer.js";

import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import { AssetPlayerLoadingManager } from "../../AssetPlayerLoadingManager.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";
import { GetPriceGuideByItemCode } from "./HomeCenterMarket.js";
import { CreateCenterMarketSellItems } from "./HomeCenterMarketSellItems.js";
import { RequestToSellItemListType } from "./HomeCenterMarketSellItemsType.js";

let itemCode = null;

export function CreateCenterMarketSellItemsDetail(scene, selectedItemCode) {
    itemCode = selectedItemCode;

    CreateLoadingPopup();

    centerData.RequestGetCMarketItemListingStatistics(
        [itemCode],
        (result) => {
            HideLoadingPopup();
            CreateSell(scene, result.data[0]);
        },
        (error) => {
            HideLoadingPopup();
        }
    );
}

let container_sell = null;

let container_sell_buttons = null;

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function CreateSell(scene, receivedData) {
    console.log("Createsell receivedData: ", receivedData);

    Destroy(scene);

    container_sell = scene.add.container(0, 0);
    container_sell.setDepth(300);

    container_sell_buttons = scene.add.container(0, 0);
    container_sell_buttons.setDepth(300);

    let bg = scene.add
        .image(0, 0, "home_center_market_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_sell.add(bg);

    let bg2 = scene.add
        .image(0, 0, "home_center_market_item_bg")
        .setOrigin(0, 0);
    container_sell.add(bg2);

    let itemLocalData = centerDataItem.getItemById(itemCode);

    let inventoryData = centerData.getItemOwnById(itemCode);

    let priceGuide = GetPriceGuideByItemCode(itemCode);

    let itemIcon = scene.add
        .image(0, 0, itemLocalData.imgKey)
        .setOrigin(0.5, 0.5)
        .setScale(350 / 500);

    itemIcon.setPosition(55 + 350 / 2, 195 + 350 / 2);

    container_sell.add(itemIcon);

    let text_quantity = scene.add
        .text(
            55 + 350 / 2,
            576,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.CenterMarket.KEY,
                "Quantity"
            ) +
                ": " +
                inventoryData.quantity,
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "32px", // Font-size
                color: "#FFFFFF", // Màu chữ (color)
                align: "center",
            }
        )
        .setOrigin(0.5, 0);
    container_sell.add(text_quantity);

    let inputPriceValue = 0;

    let inputQuantityValue = 0;

    CreatePriceInput(scene, (getValue) => {
        inputPriceValue = Number(getValue);

        container_sell.setPrice(inputPriceValue * inputQuantityValue);

        debouncedSetFee(); // Dùng debounce thay vì gọi trực tiếp
    });

    CreateQuantityInput(scene, (getValue) => {
        inputQuantityValue = Number(getValue);

        container_sell.setPrice(inputPriceValue * inputQuantityValue);

        debouncedSetFee(); // Dùng debounce thay vì gọi trực tiếp
    });

    // Tạo phiên bản debounce cho SetFee
    let debouncedSetFee;
    // Khởi tạo debounce sau khi định nghĩa SetFee
    debouncedSetFee = debounce(SetFee, 300);

    const text_TotalListings = scene.add
        .text(
            424,
            205,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.CenterMarket.KEY,
                "Total listings"
            ) +
                ": " +
                receivedData.totalListings,
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "32px", // Font-size
                color: "#FFA600", // Màu chữ (color)
                align: "left",
            }
        )
        .setOrigin(0, 0);
    container_sell.add(text_TotalListings);

    const text_floor = scene.add
        .text(
            424,
            247,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.CenterMarket.KEY,
                "Floor price"
            ) +
                ": " +
                priceGuide.min +
                " M-Coin",
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "32px", // Font-size
                color: "#FFA600", // Màu chữ (color)
                align: "left",
            }
        )
        .setOrigin(0, 0);
    container_sell.add(text_floor);

    const text_top = scene.add
        .text(
            424,
            289,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.CenterMarket.KEY,
                "Top price"
            ) +
                ": " +
                priceGuide.max +
                " M-Coin",
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "32px", // Font-size
                color: "#FFA600", // Màu chữ (color)
                align: "left",
            }
        )
        .setOrigin(0, 0);
    container_sell.add(text_top);

    const text_fee = scene.add
        .text(424, 331, "", {
            fontFamily: cdLocalization.getCurrentFont(), // Font-family
            fontSize: "32px", // Font-size
            color: "#FFA600", // Màu chữ (color)
            align: "left",
        })
        .setOrigin(0, 0);
    container_sell.add(text_fee);

    function SetFee() {
        //console.log("SetFree selectedPrice: ", selectedPrice);
        //console.log("SetFree inputQuantityValue: ", inputQuantityValue);

        let str = cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            `Transaction fee ({i}%): {i} M-Coin`,
            [
                receivedData.platformFee * 100,
                (
                    inputPriceValue *
                    inputQuantityValue *
                    receivedData.platformFee
                ).toFixed(1),
            ]
        );

        text_fee.setText(str);
    }

    const text_price = scene.add
        .text(424, 393, "", {
            fontFamily: cdLocalization.getCurrentFont(), // Font-family
            fontSize: "32px", // Font-size
            color: "#FFA600", // Màu chữ (color)
            align: "left",
        })
        .setOrigin(0, 0);
    container_sell.add(text_price);

    container_sell.setPrice = function (price) {
        text_price.setText(
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.CenterMarket.KEY,
                "Order price"
            ) +
                ": " +
                price +
                " M-Coin"
        );
    };

    container_sell.setPrice(0);

    let btn_cancel = CreateOptionsButton(
        scene,
        435 + 286 / 2,
        619 + 120 + 84 / 2,
        "home_center_market_button_2",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Cancel"
        )
    );
    container_sell_buttons.add(btn_cancel);

    btn_cancel.button.on("pointerdown", function () {
        Destroy(scene);
    });

    let btn_sell = CreateOptionsButton(
        scene,
        753 + 286 / 2,
        619 + 120 + 84 / 2,
        "home_center_market_button_1",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Sell"
        )
    );
    container_sell_buttons.add(btn_sell);

    btn_sell.button.on("pointerdown", function () {
        if (inputPriceValue <= 0) {
            CreateAlertPopup(
                scene,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.Main.KEY,
                    "Price must not be empty"
                )
            );

            return;
        }

        if (inputQuantityValue <= 0) {
            CreateAlertPopup(
                scene,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.Main.KEY,
                    "Quantity must not be empty"
                )
            );

            return;
        }

        if (inputQuantityValue > inventoryData.quantity) {
            CreateAlertPopup(
                scene,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.Main.KEY,
                    "Quantity must not be greater than inventory quantity"
                )
            );

            return;
        }

        if (inputPriceValue > 0 && inputQuantityValue > 0) {
            if (inputPriceValue < priceGuide.min) {
                CreateAlertPopup(
                    scene,
                    cdLocalization.getLocalization(
                        cdLocalization.GROUP_KEYS.Main.KEY,
                        "Price must be greater than floor price"
                    )
                );

                return;
            }

            if (inputPriceValue > priceGuide.max) {
                CreateAlertPopup(
                    scene,
                    cdLocalization.getLocalization(
                        cdLocalization.GROUP_KEYS.Main.KEY,
                        "Price must be less than top price"
                    )
                );

                return;
            }

            CreateLoadingPopup();

            centerData.RequestPostCMarketItemSell(
                itemCode,
                inputPriceValue,
                inputQuantityValue,
                (result) => {
                    HideLoadingPopup();

                    CreateAlertPopup(
                        scene,
                        cdLocalization.getLocalization(
                            cdLocalization.GROUP_KEYS.Main.KEY,
                            result.message
                        )
                    );

                    Destroy(scene);

                    inventoryData.quantity -= inputQuantityValue;

                    CreateCenterMarketSellItems(scene);
                },
                (error) => {
                    HideLoadingPopup();

                    CreateAlertPopup(scene, error);
                }
            );
        }
    });
}

function CreatePriceInput(scene, onValueChange) {
    let placeHolderStr = cdLocalization.getLocalization(
        cdLocalization.GROUP_KEYS.CenterMarket.KEY,
        "Enter price per unit"
    );

    let fontStr = cdLocalization.getCurrentFont();

    // Tạo input HTML
    const inputHTML = `
<form id="converter-price-form">
    <input 
        type="number" 
        min="0"
        step="1"  
        id="priceInput" 
        placeholder="${placeHolderStr}"
        maxlength="64"
        style="
            width:597px; 
            padding: 20px; 
            border-radius:10px; 
            font-size: 36px; 
            font-family: ${fontStr};
            background-color: rgba(0, 0, 0, 0.6); /* Màu nền của input */
            color: #ffffff; /* Màu chữ của text */
            z-index: 1000; /* Đưa lên trên cùng */
        "
    />
    <style>
        #priceInput::placeholder {
            color: #ffffff; /* Màu chữ của placeholder */
            opacity: 0.5; /* Đảm bảo hiển thị rõ ràng placeholder */
        }
        #priceInput:focus {
            outline: none; /* Bỏ viền focus mặc định */
            border: 2px solid #ffffff; /* Thêm viền khi focus */
        }
    </style>
</form>
`;

    // Thêm input field vào game
    const form_element = scene.add
        .dom(424 + 607 / 2, 456 + 90 / 2) // Vị trí trung tâm màn hình
        .createFromHTML(inputHTML);

    container_sell.add(form_element);

    // Lấy phần tử input
    const inputElement = document.getElementById("priceInput");
    const inputForm = document.getElementById("converter-price-form"); // Lấy đối tượng FORM

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
            // Chuyển đổi giá trị nhập vào thành số nguyên
            let parsedValue = parseInt(inputElement.value, 10);

            // Kiểm tra nếu giá trị không hợp lệ, đặt lại thành 0
            if (isNaN(parsedValue)) {
                parsedValue = 0;
            }

            // Đảm bảo giá trị không âm
            parsedValue = Math.max(parsedValue, 0);

            // Cập nhật giá trị của input
            inputElement.value = parsedValue;

            //console.log("inputElement.value: ", inputElement.value);

            // Gọi callback với giá trị hợp lệ
            onValueChange(parsedValue);
        }
    });

    // Xử lý sự kiện click ra ngoài
    document.addEventListener("click", (event) => {
        if (!inputElement.contains(event.target)) {
            inputElement.blur(); // Hủy trạng thái focus
        }
    });
}

function CreateQuantityInput(scene, onValueChange) {
    let placeHolderStr = cdLocalization.getLocalization(
        cdLocalization.GROUP_KEYS.CenterMarket.KEY,
        "Enter quantity"
    );

    let fontStr = cdLocalization.getCurrentFont();

    // Tạo input HTML
    const inputHTML = `
<form id="converter-form">
    <input 
        type="number" 
        min="0"
        step="1"  
        id="quantityInput" 
        placeholder="${placeHolderStr}"
        maxlength="64"
        style="
            width:597px; 
            padding: 20px; 
            border-radius:10px; 
            font-size: 36px; 
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
        .dom(424 + 607 / 2, 456 + 120 + 90 / 2) // Vị trí trung tâm màn hình
        .createFromHTML(inputHTML);

    container_sell.add(form_element);

    // Lấy phần tử input
    const inputElement = document.getElementById("quantityInput");
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
            // Chuyển đổi giá trị nhập vào thành số nguyên
            let parsedValue = parseInt(inputElement.value, 10);

            // Kiểm tra nếu giá trị không hợp lệ, đặt lại thành 0
            if (isNaN(parsedValue)) {
                parsedValue = 0;
            }

            // Đảm bảo giá trị không âm
            parsedValue = Math.max(parsedValue, 0);

            // Cập nhật giá trị của input
            inputElement.value = parsedValue;

            //console.log("inputElement.value: ", inputElement.value);

            // Gọi callback với giá trị hợp lệ
            onValueChange(parsedValue);
        }
    });

    // Xử lý sự kiện click ra ngoài
    document.addEventListener("click", (event) => {
        if (!inputElement.contains(event.target)) {
            inputElement.blur(); // Hủy trạng thái focus
        }
    });
}

function CreateOptionsButton(scene, x, y, imageKey, buttonName) {
    let btnWidth = 286;
    let btnHeight = 84;

    const btn_container = scene.add.container(x, y);
    container_sell.add(btn_container);

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
    if (container_sell) {
        container_sell.destroy();
    }
    if (container_sell_buttons) {
        container_sell_buttons.destroy();
    }
}
