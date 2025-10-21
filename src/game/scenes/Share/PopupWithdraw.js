import centerData from "../../Data/CenterData";
import cdLocalization from "../../Data/CenterDataLocalization";

import { CreateAlertPopup, CreateLoadingPopup,  HideLoadingPopup } from "./AlertPopup";

export function CreateWithdraw(scene, onSuccess, onFailed) {
    let inputNumberValue = null;

    let container_main_code = scene.add.container(0, 0);
    container_main_code.setDepth(1000);

    const black_bg = scene.add.rectangle(0, 0, 1080, 1920).setOrigin(0, 0);
    black_bg.isFilled = true;
    black_bg.fillColor = 0;
    black_bg.fillAlpha = 0.5;
    black_bg.setInteractive();

    container_main_code.add(black_bg);

    let container_popup_code = scene.add.container(0, 0);
    container_main_code.add(container_popup_code);

    let bgWidth = 1060;
    let bgHeight = 562;

    let container_popup_code_inner = scene.add.container(
        540 - bgWidth / 2,
        960 - 50 - bgHeight / 2
    );
    container_popup_code.add(container_popup_code_inner);

    const bg = scene.add
        .image(0, 0, "share_popup_input_bg_2")
        .setInteractive()
        .setOrigin(0, 0);
    container_popup_code_inner.add(bg);

    const text = scene.add
        .text(
            bgWidth / 2,
            55,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                "M-SCI withdraw"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "32px",
                color: "#ffffff",
                align: "center",
            }
        )
        .setOrigin(0.5, 0.5);

    container_popup_code_inner.add(text);

    const text_2 = scene.add
        .text(
            bgWidth / 2,
            125,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                "M-SCI withdraw max 1000 M-Coin/Day"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "32px",
                color: "#ffffff",
                align: "center",
            }
        )
        .setOrigin(0.5, 0.5);

    container_popup_code_inner.add(text_2);

    function CreateButton(scene, x, y, imageKey, buttonName) {
        let btnWidth = 321;
        let btnHeight = 92;

        const btn_container = scene.add.container(x, y);
        container_popup_code_inner.add(btn_container);

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
                    cdLocalization.GROUP_KEYS.HomeWallet.KEY,
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

    function CreateButton1(scene, x, y, imageKey, buttonName) {
        let btnWidth = 200;
        let btnHeight = 92;

        const btn_container = scene.add.container(x, y);
        container_popup_code_inner.add(btn_container);

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
                    cdLocalization.GROUP_KEYS.HomeWallet.KEY,
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

    const btn_100 = CreateButton1(
        scene,
        202 + 200 / 2,
        203 + 92 / 2,
        "share_popup_input_btn_1",
        100
    );
    btn_100.button.on("pointerdown", function () {
        SetSelect(btn_100, 100);
    });

    const btn_200 = CreateButton1(
        scene,
        430 + 200 / 2,
        203 + 92 / 2,
        "share_popup_input_btn_1",
        200
    );
    btn_200.button.on("pointerdown", function () {
        SetSelect(btn_200, 200);
    });

    const btn_500 = CreateButton1(
        scene,
        658 + 200 / 2,
        203 + 92 / 2,
        "share_popup_input_btn_1",
        500
    );
    btn_500.button.on("pointerdown", function () {
        SetSelect(btn_500, 500);
    });

    const btn_1000 = CreateButton1(
        scene,
        316 + 200 / 2,
        323 + 92 / 2,
        "share_popup_input_btn_1",
        1000
    );
    btn_1000.button.on("pointerdown", function () {
        SetSelect(btn_1000, 1000);
    });

    const btn_10000 = CreateButton1(
        scene,
        544 + 200 / 2,
        323 + 92 / 2,
        "share_popup_input_btn_1",
        10000
    );
    btn_10000.button.on("pointerdown", function () {
        SetSelect(btn_10000, 10000);
    });

    function SetSelect(btn, value) {
        inputNumberValue = value;

        if (btn == btn_100) {
            btn_100.button.setTint(0x646464);
        } else {
            btn_100.button.clearTint();
        }

        if (btn == btn_200) {
            btn_200.button.setTint(0x646464);
        } else {
            btn_200.button.clearTint();
        }

        if (btn == btn_500) {
            btn_500.button.setTint(0x646464);
        } else {
            btn_500.button.clearTint();
        }

        if (btn == btn_1000) {
            btn_1000.button.setTint(0x646464);
        } else {
            btn_1000.button.clearTint();
        }

        if (btn == btn_10000) {
            btn_10000.button.setTint(0x646464);
        } else {
            btn_10000.button.clearTint();
        }
    }

    const btn_yes = CreateButton(
        scene,
        195 + 321 / 2,
        443 + 92 / 2,
        "share_popup_input_btn",
        "Withdraw"
    );
    btn_yes.button.on("pointerdown", function () {
        if (inputNumberValue == null || inputNumberValue == "") {
            CreateAlertPopup(
                scene,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                    "Number must not be empty"
                )
            );
        }

        if (inputNumberValue != null && inputNumberValue != "") {
            let amount = Number(inputNumberValue);

            if (amount > centerData.userInfo.Musk) {
                CreateAlertPopup(
                    scene,
                    cdLocalization.getLocalization(
                        cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                        "Not enough M-Coin to withdraw"
                    )
                );

                return;
            }

            let wallet_address = centerData.GetWalletAddress();

            if (centerData.walletType === centerData.WalletType.SUI.KEY) {
                CreateAlertPopup(
                    scene,
                    "Sui Wallet is currently under development"
                );
            } else if (wallet_address == null || wallet_address === "") {
                CreateAlertPopup(
                    scene,
                    cdLocalization.getLocalization(
                        cdLocalization.GROUP_KEYS.HomeMusk.KEY,
                        "Wallet is not connected"
                    )
                );
            } else {
                CreateAlertPopup(
                    scene,
                    cdLocalization.getLocalization(
                        cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                        `Do you want to withdraw {i} M-Coin to your wallet?`,
                        [amount]
                    ),
                    () => {
                        centerData.RequestWalletWithdraw(
                            wallet_address,
                            amount,
                            () => {
                                CreateAlertPopup(
                                    scene,
                                    cdLocalization.getLocalization(
                                        cdLocalization.GROUP_KEYS.HomeWallet
                                            .KEY,
                                        "TON will be transferred to your wallet in 10 minutes."
                                    )
                                );
                            },
                            () => {
                                CreateAlertPopup(
                                    scene,
                                    cdLocalization.getLocalization(
                                        cdLocalization.GROUP_KEYS.HomeWallet
                                            .KEY,
                                        "Withdraw fail"
                                    )
                                );
                            }
                        );
                    },
                    () => {}
                );
            }
        }
    });

    const btn_no = CreateButton(
        scene,
        544 + 321 / 2,
        443 + 92 / 2,
        "share_popup_input_btn",
        "Cancel"
    );
    btn_no.button.on("pointerdown", function () {
        container_main_code.destroy();
    });
}
