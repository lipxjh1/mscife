import centerData from "../../Data/CenterData";
import centerDataItem from "../../Data/CenterDataItem";
import cdLocalization from "../../Data/CenterDataLocalization";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "./AlertPopup";

export function CreateBuyItemPopup(
    scene,
    code = "",
    name = "",
    price = 0,
    priceScore = 0,
    remaining,
    description = "",
    onSuccess,
    onFailed
) {
    let inputValue = null;

    let container_main_buy = scene.add.container(0, 0);
    container_main_buy.setDepth(1000);

    const black_bg = scene.add.rectangle(0, 0, 1080, 1920).setOrigin(0, 0);
    black_bg.isFilled = true;
    black_bg.fillColor = 0;
    black_bg.fillAlpha = 0.9;
    black_bg.setInteractive();

    container_main_buy.add(black_bg);

    let container_popup_buy = scene.add.container(0, 0);
    container_main_buy.add(container_popup_buy);

    const bg = scene.add
        .image(540, 613 + 695 / 2, "share_popup_buy_bg")
        .setInteractive()
        .setOrigin(0.5, 0.5);
    container_popup_buy.add(bg);

    const imgKey = centerDataItem.getItemById(code).imgKey;

    const item_img = scene.add
        .image(94 + 320 / 2, 667 + 320 / 2, imgKey)
        .setOrigin(0.5, 0.5)
        .setScale(300 / 350);
    container_popup_buy.add(item_img);

    const item_text_remaining = scene.add
        .text(
            408,
            982,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeShop.KEY,
                "x"
            ) + remaining,
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "36px",
                color: "#ffffff",
                align: "right",
                stroke: "#000000",
                strokeThickness: 5,
            }
        )
        .setOrigin(1, 1);
    container_popup_buy.add(item_text_remaining);

    if (price === 0) {
        const item_text_price = scene.add
            .text(94 + 320 / 2 - 20, 1031 + 36 / 2, priceScore, {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "36px",
                color: "#ffffff",
                align: "center",
            })
            .setOrigin(0.5, 0.5);
        container_popup_buy.add(item_text_price);

        const chip_icon = scene.add
            .image(
                item_text_price.x + item_text_price.width / 2 + 40,
                item_text_price.y,
                "home_top_currency_chip_1"
            )
            .setOrigin(0.5, 0.5)
            .setDisplaySize(60, 60);
        container_popup_buy.add(chip_icon);
    } else {
        const item_text_price = scene.add
            .text(94 + 320 / 2 - 20, 1031 + 36 / 2, price, {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "36px",
                color: "#ffffff",
                align: "center",
            })
            .setOrigin(0.5, 0.5);
        container_popup_buy.add(item_text_price);

        const chip_icon = scene.add
            .image(
                item_text_price.x + item_text_price.width / 2 + 40,
                item_text_price.y,
                "home_top_currency_chip_2"
            )
            .setOrigin(0.5, 0.5)
            .setDisplaySize(60, 60);
        container_popup_buy.add(chip_icon);
    }

    const text_name = scene.add
        .text(
            466,
            667,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeShop.KEY,
                name
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "48px",
                color: "#ffffff",
                align: "left",
                wordWrap: { width: 520, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);

    container_popup_buy.add(text_name);

    const text_description = scene.add
        .text(
            466,
            740,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeShopDescription.KEY,
                code
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "24px",
                color: "#ffffff",
                align: "left",
                wordWrap: { width: 520, useAdvancedWrap: true },
            }
        )
        .setOrigin(0, 0);

    container_popup_buy.add(text_description);

    function CreateButton(scene, x, y, imageKey, buttonName) {
        let btnWidth = 321;
        let btnHeight = 92;

        const btn_container = scene.add.container(x, y);
        container_popup_buy.add(btn_container);

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
                btnHeight / 2,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeShop.KEY,
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

    const btn_yes = CreateButton(
        scene,
        94 + 321 / 2,
        1162 + 92 / 2,
        "share_popup_input_btn",
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.Main.KEY,
            "Yes"
        )
    );
    btn_yes.button.on("pointerdown", function () {
        let buyAmount = Number(inputValue);

        let caculatedMusk = price * buyAmount;

        let caculatedChip = priceScore * buyAmount;

        if (remaining && buyAmount > remaining) {
            inputElement.style.visibility = "hidden";

            CreateAlertPopup(
                scene,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeShop.KEY,
                    "No items to buy"
                ),
                () => {
                    inputElement.style.visibility = "visible";
                }
            );
        }

        if (price > 0 && caculatedMusk > centerData.userInfo.Musk) {
            inputElement.style.visibility = "hidden";

            CreateAlertPopup(
                scene,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeShop.KEY,
                    "Not enough M-Coin"
                ),
                () => {
                    inputElement.style.visibility = "visible";
                }
            );

            return;
        } else if (priceScore > 0 && caculatedChip > centerData.userInfo.Chip) {
            inputElement.style.visibility = "hidden";

            CreateAlertPopup(
                scene,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeShop.KEY,
                    "Not enough Chip"
                ),
                () => {
                    inputElement.style.visibility = "visible";
                }
            );

            return;
        }

        if (buyAmount != null && buyAmount > 0) {
            let amount = buyAmount * 0.01;

            if (amount > 0) {
                CreateLoadingPopup();

                centerData.RequestBuyItem(
                    code,
                    buyAmount,
                    (result) => {
                        HideLoadingPopup();

                        if (onSuccess && typeof onSuccess === "function") {
                            onSuccess(result, buyAmount);
                        }

                        inputElement.style.visibility = "hidden";

                        CreateAlertPopup(
                            scene,
                            cdLocalization.getLocalization(
                                cdLocalization.GROUP_KEYS.HomeShop.KEY,
                                "Transaction success"
                            ),
                            () => {
                                inputElement.style.visibility = "visible";
                            }
                        );

                        container_main_buy.destroy();
                    },
                    (error) => {
                        HideLoadingPopup();

                        if (onFailed && typeof onFailed === "function") {
                            onFailed(error);
                        }

                        inputElement.style.visibility = "hidden";

                        CreateAlertPopup(
                            scene,
                            "Transaction fail:" + "\n" + error.message,
                            () => {
                                inputElement.style.visibility = "visible";
                            }
                        );
                    }
                );
            }
        } else {
            inputElement.style.visibility = "hidden";

            CreateAlertPopup(
                scene,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeShop.KEY,
                    "Number must not be empty"
                ),
                () => {
                    inputElement.style.visibility = "visible";
                }
            );
        }
    });

    const btn_no = CreateButton(
        scene,
        665 + 321 / 2,
        1162 + 92 / 2,
        "share_popup_input_btn",
        cdLocalization.getLocalization(cdLocalization.GROUP_KEYS.Main.KEY, "No")
    );
    btn_no.button.on("pointerdown", function () {
        container_main_buy.destroy();
    });

    let placeHolderStr = cdLocalization.getLocalization(
        cdLocalization.GROUP_KEYS.HomeShop.KEY,
        "Enter amount"
    );

    let fontStr = cdLocalization.getCurrentFont();

    // Tạo input HTML
    const inputHTML = `
<form id="converter-form">
    <input 
        type="number" 
        min="0" 
        id="userInput" 
        placeholder="${placeHolderStr}"
        maxlength="64"
        style="
            width:520px; 
            padding: 12px; 
            border-radius:0px; 
            font-size: 36px; 
            font-family: ${fontStr};
            background-color: rgba(0, 0, 0, 0.6); /* Màu nền của input */
            color: #ffffff; /* Màu chữ của text */
            z-index: 1000; /* Đưa lên trên cùng */
        "
    />
    <style>
        #userInput::placeholder {
            color: #ffffff; /* Màu chữ của placeholder */
            opacity: 0.5; /* Đảm bảo hiển thị rõ ràng placeholder */
        }
        #userInput:focus {
            outline: none; /* Bỏ viền focus mặc định */
            border: 2px solid #ffffff; /* Thêm viền khi focus */
        }
    </style>
</form>
`;

    // Thêm input field vào game
    const form_element = scene.add
        .dom(466 + 520 / 2, 1009 + 76 / 2) // Vị trí trung tâm màn hình
        .createFromHTML(inputHTML);

    container_popup_buy.add(form_element);

    // inputElement.style.visibility = isVisible ? "visible" : "hidden";

    // Lấy phần tử input
    const inputElement = document.getElementById("userInput");
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
        inputValue = inputElement.value;

        //console.log("inputValue: ", inputValue);
    });

    // Xử lý sự kiện click ra ngoài
    document.addEventListener("click", (event) => {
        if (!inputElement.contains(event.target)) {
            inputElement.blur(); // Hủy trạng thái focus
        }
    });
}
