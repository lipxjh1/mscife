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

import { container_center_market_sell_sub } from "./HomeCenterMarketSell.js";

let container_main = null;

let isOpen = false;

let text_quantity = null;

export function CreateCenterMarketSellMSCI(scene) {
    //console.log("CreateCenterMarketCharacter");

    Destroy();

    isOpen = false;

    container_main = scene.add.container(0, 0);
    container_center_market_sell_sub.add(container_main);

    let lockBg = scene.add
        .image(0, 0, "center_market_character_fill")
        .setOrigin(0, 0);
    container_main.add(lockBg);

    CreateBuy(scene);

    Open(scene);
}

let container_buy = null;

let container_buy_buttons = null;

function CreateBuy(scene) {
    if (container_buy) {
        container_buy.destroy();
    }

    if (container_buy_buttons) {
        container_buy_buttons.destroy();
    }

    container_buy = scene.add.container(0, 0);
    container_buy.setDepth(300);
    container_main.add(container_buy);

    container_buy_buttons = scene.add.container(0, 0);
    container_buy_buttons.setDepth(300);
    container_main.add(container_buy_buttons);

    let itemLocalData = centerDataItem.getItemById("MSCI");

    const blackbg = scene.add.rectangle(
        540,
        470 + 1330 / 2,
        1080,
        1330,
        0x000000
    );
    container_buy.add(blackbg);

    let bg2 = scene.add
        .image(0, 280, "home_center_market_item_bg")
        .setOrigin(0, 0);
    container_buy.add(bg2);

    let itemIcon = scene.add
        .image(0, 0, itemLocalData.imgKey)
        .setOrigin(0.5, 0.5)
        .setScale(350 / 500);

    itemIcon.setPosition(55 + 350 / 2, 495 + 350 / 2);

    container_buy.add(itemIcon);

    const text_base = scene.add
        .text(424, 480, "$MSCI", {
            fontFamily: cdLocalization.getCurrentFont(), // Font-family
            fontSize: "32px", // Font-size
            color: "#FFA600", // Màu chữ (color)
            align: "left",
        })
        .setOrigin(0, 0);
    container_buy.add(text_base);

    text_quantity = scene.add
        .text(55 + 350 / 2, 857, "Quantity", {
            fontFamily: cdLocalization.getCurrentFont(), // Font-family
            fontSize: "32px", // Font-size
            color: "#FFFFFF", // Màu chữ (color)
            align: "center",
        })
        .setOrigin(0.5, 0);
    container_buy.add(text_quantity);

    UpdateCurrentQuantity(scene);

    let inputQuantityValue = 0;

    let inputPriceValue = 0;

    CreateQuantityInput(scene, (getValue) => {
        inputQuantityValue = Number(getValue);

        container_buy.setPrice(inputPriceValue * inputQuantityValue);

        SetFee();
    });

    CreatePriceInput(scene, (getValue) => {
        inputPriceValue = Number(getValue);

        container_buy.setPrice(inputPriceValue * inputQuantityValue);

        SetFee();
    });

    const text_fee = scene.add
        .text(424, 522, "", {
            fontFamily: cdLocalization.getCurrentFont(), // Font-family
            fontSize: "32px", // Font-size
            color: "#FFA600", // Màu chữ (color)
            align: "left",
        })
        .setOrigin(0, 0);
    container_buy.add(text_fee);

    let platformFee = 0.05;

    function SetFee() {
        let str = cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Transaction fee (5%): {i} M-Coin",
            [(inputPriceValue * inputQuantityValue * platformFee).toFixed(1)]
        );

        text_fee.setText(str);
    }

    SetFee();

    const text_price = scene.add
        .text(424, 564, "", {
            fontFamily: cdLocalization.getCurrentFont(), // Font-family
            fontSize: "32px", // Font-size
            color: "#FFA600", // Màu chữ (color)
            align: "left",
        })
        .setOrigin(0, 0);
    container_buy.add(text_price);

    container_buy.setPrice = function (price) {
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

    container_buy.setPrice(inputPriceValue);

    let btn_sell = CreateOptionsButton(
        scene,
        753 + 286 / 2,
        857 + 84 / 2,
        "home_center_market_button_1",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Sell"
        )
    );
    container_buy_buttons.add(btn_sell);

    btn_sell.button.on("pointerdown", function () {
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

        if (inputQuantityValue > centerData.userInfo.MSCI) {
            CreateAlertPopup(
                scene,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.Main.KEY,
                    "Quantity must be less than or equal to the inventory quantity"
                )
            );

            return;
        }

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

        if (inputPriceValue > 0 && inputQuantityValue > 0) {
            CreateLoadingPopup();

            centerData.RequestPostCMarketMSCISell(
                inputQuantityValue,
                inputPriceValue,
                () => {
                    HideLoadingPopup();

                    CreateAlertPopup(
                        scene,
                        cdLocalization.getLocalization(
                            cdLocalization.GROUP_KEYS.Main.KEY,
                            "Item in sell"
                        )
                    );

                    CreateLoadingPopup();
                    centerData.RequestUserInfo(
                        (result) => {
                            HideLoadingPopup();

                            UpdateCurrentQuantity(scene);
                        },
                        (error) => {
                            HideLoadingPopup();
                        }
                    );
                },
                (error) => {
                    HideLoadingPopup();

                    CreateAlertPopup(scene, error);
                }
            );
        }
    });
}

function UpdateCurrentQuantity(scene) {
    text_quantity.setText(
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            "Quantity"
        ) +
            ": " +
            centerData.userInfo.MSCI
    );
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
        .dom(424 + 607 / 2, 736 + 90 / 2) // Vị trí trung tâm màn hình
        .createFromHTML(inputHTML);

    container_buy.add(form_element);

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
        .dom(424 + 607 / 2, 646 + 90 / 2) // Vị trí trung tâm màn hình
        .createFromHTML(inputHTML);

    container_buy.add(form_element);

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

export function IsOpen() {
    return isOpen;
}

export function Open(scene) {
    if (isOpen == true) return;

    isOpen = true;
}

export function Close(scene) {
    if (isOpen == false) return;

    isOpen = false;
    Destroy();
}

export function Destroy(scene) {
    if (container_main) {
        container_main.destroy();
    }

    if (container_buy) {
        container_buy.destroy();
    }

    if (container_buy_buttons) {
        container_buy_buttons.destroy();
    }
}
