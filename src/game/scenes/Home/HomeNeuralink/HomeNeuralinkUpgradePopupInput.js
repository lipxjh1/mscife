import centerData from "../../../Data/CenterData";
import cdLocalization from "../../../Data/CenterDataLocalization";
import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup";

export function CreateNeuralinkToUpgradePopupInput(
    scene,
    totalNeuralink,
    totalMSCI,
    convertRate,
    onSuccess,
    onFailed
) {
    let inputValue = null;

    let container_main_buy = scene.add.container(0, 0);
    container_main_buy.setDepth(1000);

    const black_bg = scene.add.rectangle(0, 0, 1080, 1920).setOrigin(0, 0);
    black_bg.isFilled = true;
    black_bg.fillColor = 0;
    black_bg.fillAlpha = 0.5;
    black_bg.setInteractive();

    container_main_buy.add(black_bg);

    let container_popup_buy = scene.add.container(0, 0);
    container_main_buy.add(container_popup_buy);

    const bg = scene.add
        .image(540, 960 - 380, "share_popup_input_bg")
        .setInteractive()
        .setOrigin(0.5, 0);
    container_popup_buy.add(bg);

    let askStr = cdLocalization.getLocalization(
        cdLocalization.GROUP_KEYS.Neuralink.KEY,
        `Your total Neuralink`
    );

    askStr += `\n${totalNeuralink || 0}`;

    const text = scene.add
        .text(540, 960 - 380 + 55, askStr, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "32px",
            color: "#ffffff",
            align: "center",
        })
        .setOrigin(0.5, 0.5);

    container_popup_buy.add(text);

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
        "Confirm"
    );
    btn_yes.button.on("pointerdown", function () {
        let neuralinkToConvert = Number(inputValue);

        if (!totalNeuralink || neuralinkToConvert > totalNeuralink) {
            CreateAlertPopup(
                scene,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.Neuralink.KEY,
                    "Not enough Neuralink"
                )
            );

            return;
        }

        if (neuralinkToConvert != null && neuralinkToConvert > 0) {
            let caculatedMSCI = neuralinkToConvert * convertRate;

            if (caculatedMSCI > totalMSCI) {
                CreateAlertPopup(
                    scene,
                    cdLocalization.getLocalization(
                        cdLocalization.GROUP_KEYS.Neuralink.KEY,
                        "Not enough $MSCI"
                    ) +
                        "\n" +
                        caculatedMSCI +
                        "\n" +
                        " $MSCI" +
                        " > " +
                        totalMSCI +
                        " $MSCI"
                );

                return;
            }

            CreateAlertPopup(
                scene,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.Neuralink.KEY,
                    `neuralinkToConectedKey`,
                    [neuralinkToConvert, caculatedMSCI]
                ) ||
                    `Convert ${neuralinkToConvert} Neuralink for ${caculatedMSCI} MSCI?`,
                () => {
                    CreateLoadingPopup();
                    centerData.RequestNeuralinkUpgrade(
                        neuralinkToConvert,
                        (result) => {
                            HideLoadingPopup();
                            if (onSuccess && typeof onSuccess === "function") {
                                onSuccess(result, neuralinkToConvert);
                            }
                            CreateAlertPopup(
                                scene,
                                cdLocalization.getLocalization(
                                    cdLocalization.GROUP_KEYS.HomeShop.KEY,
                                    `${
                                        result.message
                                    }\nSecond upgrade at ${formatDateTime(
                                        result.process.secondPaymentDeadline
                                    )}`
                                )
                            );
                            container_main_buy.destroy();
                        },
                        (error) => {
                            HideLoadingPopup();
                            if (onFailed && typeof onFailed === "function") {
                                onFailed(error);
                            }
                            // Format error message an toàn
                            const errorText = typeof error === 'string'
                                ? error
                                : (error?.message || error?.toString() || "Unknown error");

                            CreateAlertPopup(
                                scene,
                                "Upgrade fail:\n" + errorText
                            );
                        }
                    );
                },
                () => {}
            );
        } else {
            CreateAlertPopup(
                scene,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeShop.KEY,
                    "Number must not be empty"
                )
            );
        }
    });

    const btn_no = CreateButton(
        scene,
        540 + 321 / 2 + 28 / 2,
        960 - 380 + 232 + 92 / 2,
        "share_popup_input_btn",
        "Cancel"
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

    container_popup_buy.add(form_element);

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
