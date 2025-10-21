import centerData from "../../Data/CenterData";
import cdLocalization from "../../Data/CenterDataLocalization";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "./AlertPopup";

export function CreateInputNumberPopup(scene, titile, onSuccess, onFailed) {
    let inputValue = null;

    let container_main = scene.add.container(0, 0);
    container_main.setDepth(1000);

    const black_bg = scene.add.rectangle(0, 0, 1080, 1920).setOrigin(0, 0);
    black_bg.isFilled = true;
    black_bg.fillColor = 0;
    black_bg.fillAlpha = 0.5;
    black_bg.setInteractive();

    container_main.add(black_bg);

    let container_popup = scene.add.container(0, 0);
    container_main.add(container_popup);

    const bg = scene.add
        .image(540, 960 - 380, "share_popup_input_bg")
        .setInteractive()
        .setOrigin(0.5, 0);
    container_popup.add(bg);

    const text = scene.add
        .text(
            540,
            960 - 380 + 55,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Main.KEY,
                titile
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "32px",
                color: "#ffffff",
                align: "center",
            }
        )
        .setOrigin(0.5, 0.5);

    container_popup.add(text);

    function CreateButton(scene, x, y, imageKey, buttonName) {
        let btnWidth = 321;
        let btnHeight = 92;

        const btn_container = scene.add.container(x, y);
        container_popup.add(btn_container);

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
                20,
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
            .setOrigin(0.5, 0);

        btn_inner_container.add(text);

        return btn_container;
    }

    const btn_yes = CreateButton(
        scene,
        540 - 321 / 2 - 28 / 2,
        960 - 380 + 232 + 92 / 2,
        "share_popup_input_btn",
        "Yes"
    );
    btn_yes.button.on("pointerdown", function () {
        let numberValue = Number(inputValue);

        if (
            inputValue != null &&
            inputValue !== "" &&
            Number.isInteger(numberValue) &&
            numberValue > 0
        ) {
            if (onSuccess && typeof onSuccess === "function") {
                onSuccess(numberValue);
            }

            container_main.destroy();
        } else {
            CreateAlertPopup(
                scene,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.Main.KEY,
                    "Please enter a valid positive integer"
                )
            );
        }
    });

    const btn_no = CreateButton(
        scene,
        540 + 321 / 2 + 28 / 2,
        960 - 380 + 232 + 92 / 2,
        "share_popup_input_btn",
        "No"
    );
    btn_no.button.on("pointerdown", function () {
        if (onFailed && typeof onFailed === "function") {
            onFailed(inputValue);
        }

        container_main.destroy();
    });

    let placeHolderStr = cdLocalization.getLocalization(
        cdLocalization.GROUP_KEYS.Main.KEY,
        "Enter your code"
    );

    let fontStr = cdLocalization.getCurrentFont();

    // Tạo input HTML
    const inputHTML = `
<form id="converter-form">
    <input
        type="number"
        min="1"
        step="1"
        id="userInput"
        placeholder="${placeHolderStr}"
        maxlength="64"
        style="
            width:860px;
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
        .dom(540, 960 - 380 + 115 + 90 / 2) // Vị trí trung tâm màn hình
        .createFromHTML(inputHTML);

    container_popup.add(form_element);

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
        // Chuyển đổi giá trị nhập vào thành số nguyên
        let parsedValue = parseInt(inputElement.value, 10);

        // Kiểm tra nếu giá trị không hợp lệ, đặt lại thành 0
        if (isNaN(parsedValue)) {
            parsedValue = 0;
        }

        // Đảm bảo giá trị là số nguyên dương (>= 1)
        parsedValue = Math.max(parsedValue, 0);

        // Cập nhật giá trị của input nếu có thay đổi
        if (parsedValue.toString() !== inputElement.value) {
            inputElement.value = parsedValue > 0 ? parsedValue : "";
        }

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
