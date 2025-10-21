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
import { CreateCenterMarketSellCharacterSelected } from "./HomeCenterMarketSellCharacterSelected.js";
import {
    GetCharacterIdByRoleCodeStarLevel,
    RequestToSellCharacterListRole,
} from "./HomeCenterMarketSellCharacterRole.js";
import { CreateCharacterCard } from "../../Share/CharacterCard.js";

let selectedCode = null;
let selectedStar = null;
let selectedLevel = null;

export function CreateCenterMarketSellCharacterSelectedDetail(
    scene,
    code,
    star,
    level
) {
    selectedCode = code;
    selectedStar = star;
    selectedLevel = level;

    CreateSell(scene);
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

function CreateSell(scene) {
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

    container_sell.add(container_card);

    let inputPriceValue = 0;

    CreatePriceInput(scene, (getValue) => {
        inputPriceValue = Number(getValue);
        debouncedSetFee(); // Dùng debounce thay vì gọi trực tiếp
    });

    // Tạo phiên bản debounce cho SetFee
    let debouncedSetFee;
    // Khởi tạo debounce sau khi định nghĩa SetFee
    debouncedSetFee = debounce(SetFee, 300);

    const text_name = scene.add
        .text(
            424,
            205,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.CenterMarket.KEY,
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
    container_sell.add(text_name);

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
            }
        )
        .setOrigin(0, 0);
    container_sell.add(text_star);

    const text_level = scene.add
        .text(
            424,
            289,
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
            }
        )
        .setOrigin(0, 0);
    container_sell.add(text_level);

    const text_fee = scene.add
        .text(424, 331, "", {
            fontFamily: cdLocalization.getCurrentFont(), // Font-family
            fontSize: "32px", // Font-size
            color: "#FFA600", // Màu chữ (color)
            align: "left",
        })
        .setOrigin(0, 0);
    container_sell.add(text_fee);

    let platformFee = 0.05;

    function SetFee() {
        let str = cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.CenterMarket.KEY,
            `Transaction fee ({i}%): {i} M-Coin`,
            [platformFee * 100, (inputPriceValue * platformFee).toFixed(1)]
        );

        text_fee.setText(str);
    }

    SetFee();

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

        if (inputPriceValue > 0) {
            CreateLoadingPopup();

            centerData.RequestPostCMarketCharacterSell(
                GetCharacterIdByRoleCodeStarLevel(
                    baseInfo.role,
                    selectedCode,
                    selectedStar,
                    selectedLevel
                ),
                inputPriceValue,
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

                    RequestToSellCharacterListRole(scene, () => {
                        CreateCenterMarketSellCharacterSelected(
                            scene,
                            selectedCode,
                            selectedStar,
                            selectedLevel
                        );
                    });
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
<form id="converter-form">
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
        .dom(424 + 607 / 2, 456 + 90 / 2) // Vị trí trung tâm màn hình
        .createFromHTML(inputHTML);

    container_sell.add(form_element);

    // Lấy phần tử input
    const inputElement = document.getElementById("priceInput");
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
