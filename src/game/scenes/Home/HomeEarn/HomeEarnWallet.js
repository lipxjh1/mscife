// Removed Telegram SDK import - using window.open() instead

import centerData from "../../../Data/CenterData.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import {
    ConnectSuiWallet,
    ConnectWallet,
    DisconnectSuiWallet,
    DisconnectWallet,
} from "../../../wallet/Wallet.js";

import {
    container_main,
    container_popup,
    container_buttons,
} from "./HomeEarn.js";
import { box_ticket_quantity } from "../HomeGacha/HomeGacha.js";
import { CreateHistory } from "./HomeEarnTransactionHistory.js";

import cdLocalization from "../../../Data/CenterDataLocalization.js";
import { OpenMuskContainer } from "../HomeMusk.js";
import { CreateTransferMcoinPopup } from "../../Share/PopupTransferMCoin.js";
import { CreateWithdraw } from "../../Share/PopupWithdraw.js";
import { isTelegramMiniApp } from "../../../utils.js";
import { CreateChipToMSCI } from "./HomeEarnChipToMSCI.js";

let container_main_wallet = null;

let container_popup_wallet = null;
let container_popup_open_position = { x: 0, y: 0 };
let container_popup_close_position = { x: 0, y: 4000 };

let container_select_wallet = null;

let text_musk = null;
let text_chip = null;
let text_msci = null;

let isOpen = false;

export function CreateWallet(scene) {
    if (container_main_wallet) {
        container_main_wallet.destroy();
    }

    container_main_wallet = scene.add.container(0, 0);
    container_popup.add(container_main_wallet);

    container_popup_wallet = scene.add.container(0, 0);
    container_main_wallet.add(container_popup_wallet);
    container_popup_wallet.setDepth(101);

    const lock_bg = scene.add
        .image(0, 0, "home_earn_wallet_popup_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_popup_wallet.add(lock_bg);

    CreateLabels(scene);

    CreateWalletAddress(scene);

    CreateButtons(scene);

    Open(scene);
}

let btn_wallet_address = null;

let btn_change_wallet = null;

function CreateWalletAddress(scene) {
    // return; // Enabled - Show wallet address when connected

    let walletAddress = centerData.GetWalletAddress();

    if (btn_wallet_address) {
        btn_wallet_address.destroy();
    }

    if (walletAddress != null && walletAddress != "") {
        btn_wallet_address = scene.add.container(74 + 931 / 2, 676 + 119 / 2);
        container_popup_wallet.add(btn_wallet_address);

        let btn = scene.rexUI.add
            .roundRectangle(0, 0, 931, 119, 119 / 2, 0x00aaff, 1)
            .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
            .on("pointerdown", async function () {
                //console.log("btn_close clicked");

                if (await isTelegramMiniApp()) {
                    window.copyToClipboard(walletAddress);
                } else {
                    window.copyToClipboardNormal(walletAddress);
                }
            })
            .on("pointerover", function () {
                //console.log("btn_close over");

                scene.tweens.add({
                    targets: btn_wallet_address,
                    scaleX: 1.2, // Phóng to 20% theo chiều ngang
                    scaleY: 1.2, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            })
            .on("pointerout", function () {
                //console.log("btn_close out");

                scene.tweens.add({
                    targets: btn_wallet_address,
                    scaleX: 1, // Phóng to 20% theo chiều ngang
                    scaleY: 1, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            });
        btn_wallet_address.add(btn);

        const text_wallet_address = scene.add
            .text(0, 0, walletAddress, {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "30px",
                color: "#ffffff",
                align: "center",
            })
            .setOrigin(0.5);
        btn_wallet_address.add(text_wallet_address);
    }
}

function CreateLabels(scene) {
    //label $MSCI
    {
        const label = scene.add.container(69 + 943 / 2, 236 + 108 / 2);
        container_popup_wallet.add(label);

        const label_inner = scene.add.container(-943 / 2, -108 / 2);
        label.add(label_inner);

        const bg = scene.add
            .image(0, 0, "home_earn_wallet_label_0")
            .setOrigin(0, 0);
        label_inner.add(bg);

        const text_titile = scene.add
            .text(
                26,
                108 / 2,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                    "$MSCI"
                ),
                {
                    fontFamily: cdLocalization.getCurrentFont(),
                    fontSize: "40px",
                    color: "#ffffff",
                    align: "left",
                }
            )
            .setOrigin(0, 0.5);
        label_inner.add(text_titile);

        text_msci = scene.add
            .text(
                906,
                108 / 2,
                centerData.userInfo.MSCI,
                {
                    fontFamily: cdLocalization.getCurrentFont(),
                    fontSize: "40px",
                    color: "#ffffff",
                    align: "right",
                }
            )
            .setOrigin(1, 0.5);
        label_inner.add(text_msci);
    }

    //label musk
    {
        const label = scene.add.container(69 + 943 / 2, 372 + 108 / 2);
        container_popup_wallet.add(label);

        const label_inner = scene.add.container(-943 / 2, -108 / 2);
        label.add(label_inner);

        const bg = scene.add
            .image(0, 0, "home_earn_wallet_label_0")
            .setOrigin(0, 0);
        label_inner.add(bg);

        const text_titile = scene.add
            .text(26, 108 / 2, "M-Coin", {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "40px",
                color: "#ffffff",
                align: "left",
            })
            .setOrigin(0, 0.5);
        label_inner.add(text_titile);

        text_musk = scene.add
            .text(
                906,
                108 / 2,
                centerData.userInfo.Musk,
                {
                    fontFamily: cdLocalization.getCurrentFont(),
                    fontSize: "40px",
                    color: "#ffffff",
                    align: "right",
                }
            )
            .setOrigin(1, 0.5);
        label_inner.add(text_musk);
    }

    //label chip
    {
        const label = scene.add.container(69 + 943 / 2, 508 + 108 / 2);
        container_popup_wallet.add(label);

        const label_inner = scene.add.container(-943 / 2, -108 / 2);
        label.add(label_inner);

        const bg = scene.add
            .image(0, 0, "home_earn_wallet_label_0")
            .setOrigin(0, 0);
        label_inner.add(bg);

        const text_titile = scene.add
            .text(26, 108 / 2, "Chip", {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "40px",
                color: "#ffffff",
                align: "left",
            })
            .setOrigin(0, 0.5);
        label_inner.add(text_titile);

        text_chip = scene.add
            .text(
                906,
                108 / 2,
                centerData.userInfo.Chip,
                {
                    fontFamily: cdLocalization.getCurrentFont(),
                    fontSize: "40px",
                    color: "#ffffff",
                    align: "right",
                }
            )
            .setOrigin(1, 0.5);
        label_inner.add(text_chip);
    }
}

function CreateButtons(scene) {
    //btn withdraw
    {
        // const label = scene.add.container(74 + 939 / 2, 861 + 131 / 2);
        // container_popup_wallet.add(label);
        // const label_inner = scene.add.container(-939 / 2, -131 / 2);
        // label.add(label_inner);
        // const bg = scene.add
        //     .image(0, 0, "home_earn_wallet_label_1")
        //     .setOrigin(0, 0)
        //     .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        //     .on("pointerdown", function () {
        //         //console.log("btn_close clicked");
        //         let wallet_address = centerData.GetWalletAddress();
        //         if (centerData.walletType === centerData.WalletType.SUI.KEY) {
        //             CreateAlertPopup(
        //                 scene,
        //                 "Sui Wallet is currently under development"
        //             );
        //         } else if (wallet_address == null || wallet_address === "") {
        //             CreateAlertPopup(
        //                 scene,
        //                 cdLocalization.getLocalization(
        //                     cdLocalization.GROUP_KEYS.HomeMusk.KEY,
        //                     "Wallet is not connected"
        //                 )
        //             );
        //         } else {
        //             if (centerData.userInfo.CurrentStage < 20) {
        //                 CreateAlertPopup(
        //                     scene,
        //                     "Withdraw is not available until level 20 passed"
        //                 );
        //             } else {
        //                 //CreateWithdraw(scene);
        //                 CreateAlertPopup(
        //                     scene,
        //                     cdLocalization.getLocalization(
        //                         cdLocalization.GROUP_KEYS.Main.KEY,
        //                         "SYSTEM MAINTENANCE ANNOUNCEMENT"
        //                     )
        //                 );
        //             }
        //         }
        //     })
        //     .on("pointerover", function () {
        //         //console.log("btn_close over");
        //         scene.tweens.add({
        //             targets: label,
        //             scaleX: 1.2, // Phóng to 20% theo chiều ngang
        //             scaleY: 1.2, // Phóng to 20% theo chiều dọc
        //             duration: 100, // Thời gian hiệu ứng (ms)
        //             ease: "Power2",
        //         });
        //     })
        //     .on("pointerout", function () {
        //         //console.log("btn_close out");
        //         scene.tweens.add({
        //             targets: label,
        //             scaleX: 1, // Phóng to 20% theo chiều ngang
        //             scaleY: 1, // Phóng to 20% theo chiều dọc
        //             duration: 100, // Thời gian hiệu ứng (ms)
        //             ease: "Power2",
        //         });
        //     });
        // label_inner.add(bg);
        // const text_titile = scene.add
        //     .text(
        //         64,
        //         131 / 2,
        //         cdLocalization.getLocalization(
        //             cdLocalization.GROUP_KEYS.HomeWallet.KEY,
        //             "Withdraw"
        //         ),
        //         {
        //             fontFamily: cdLocalization.getCurrentFont(),
        //             fontSize: "40px",
        //             color: "#ffffff",
        //             align: "left",
        //         }
        //     )
        //     .setOrigin(0, 0.5);
        // label_inner.add(text_titile);
        // const icon = scene.add
        //     .image(798 + 69 / 2, 131 / 2, "home_earn_wallet_icon_0")
        //     .setOrigin(0.5, 0.5);
        // label_inner.add(icon);
        // // label_inner.each(function (child) {
        // //     if (child.setTint) {
        // //         child.setTint(0x9a9a9a); // Màu tint bạn muốn áp dụng
        // //     }
        // // });
    }

    //btn Deposit
    {
        // const label = scene.add.container(74 + 939 / 2, 1011 + 131 / 2);
        // container_popup_wallet.add(label);
        // const label_inner = scene.add.container(-939 / 2, -131 / 2);
        // label.add(label_inner);
        // const bg = scene.add
        //     .image(0, 0, "home_earn_wallet_label_1")
        //     .setOrigin(0, 0)
        //     .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        //     .on("pointerdown", function () {
        //         //console.log("btn_close clicked");
        //         OpenMuskContainer(scene);
        //     })
        //     .on("pointerover", function () {
        //         //console.log("btn_close over");
        //         scene.tweens.add({
        //             targets: label,
        //             scaleX: 1.2, // Phóng to 20% theo chiều ngang
        //             scaleY: 1.2, // Phóng to 20% theo chiều dọc
        //             duration: 100, // Thời gian hiệu ứng (ms)
        //             ease: "Power2",
        //         });
        //     })
        //     .on("pointerout", function () {
        //         //console.log("btn_close out");
        //         scene.tweens.add({
        //             targets: label,
        //             scaleX: 1, // Phóng to 20% theo chiều ngang
        //             scaleY: 1, // Phóng to 20% theo chiều dọc
        //             duration: 100, // Thời gian hiệu ứng (ms)
        //             ease: "Power2",
        //         });
        //     });
        // label_inner.add(bg);
        // const text_titile = scene.add
        //     .text(
        //         64,
        //         131 / 2,
        //         cdLocalization.getLocalization(
        //             cdLocalization.GROUP_KEYS.HomeWallet.KEY,
        //             "Deposit"
        //         ),
        //         {
        //             fontFamily: cdLocalization.getCurrentFont(),
        //             fontSize: "40px",
        //             color: "#ffffff",
        //             align: "left",
        //         }
        //     )
        //     .setOrigin(0, 0.5);
        // label_inner.add(text_titile);
        // const icon = scene.add
        //     .image(798 + 69 / 2, 131 / 2, "home_earn_wallet_icon_1")
        //     .setOrigin(0.5, 0.5);
        // label_inner.add(icon);
    }

    //btn Transfer M-Coin
    {
        const label = scene.add.container(74 + 939 / 2, 1161 + 131 / 2);
        container_popup_wallet.add(label);

        const label_inner = scene.add.container(-939 / 2, -131 / 2);
        label.add(label_inner);

        const bg = scene.add
            .image(0, 0, "home_earn_wallet_label_1")
            .setOrigin(0, 0)
            .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
            .on("pointerdown", function () {
                if (centerData.userInfo.CurrentStage < 20) {
                    CreateAlertPopup(
                        scene,
                        "Transfer M-Coin is not available until level 20 passed"
                    );
                } else {
                    CreateTransferMcoinPopup(scene);
                }
            })
            .on("pointerover", function () {
                scene.tweens.add({
                    targets: label,
                    scaleX: 1.2, // Phóng to 20% theo chiều ngang
                    scaleY: 1.2, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            })
            .on("pointerout", function () {
                scene.tweens.add({
                    targets: label,
                    scaleX: 1, // Phóng to 20% theo chiều ngang
                    scaleY: 1, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            });
        label_inner.add(bg);

        const text_titile = scene.add
            .text(
                64,
                131 / 2,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                    "Transfer M-Coin"
                ),
                {
                    fontFamily: cdLocalization.getCurrentFont(),
                    fontSize: "40px",
                    color: "#ffffff",
                    align: "left",
                }
            )
            .setOrigin(0, 0.5);
        label_inner.add(text_titile);

        const icon = scene.add
            .image(798 + 69 / 2, 131 / 2, "home_earn_wallet_icon_2")
            .setOrigin(0.5, 0.5);
        label_inner.add(icon);
    }

    //btn Transactions History
    {
        const label = scene.add.container(74 + 939 / 2, 1311 + 131 / 2);
        container_popup_wallet.add(label);

        const label_inner = scene.add.container(-939 / 2, -131 / 2);
        label.add(label_inner);

        const bg = scene.add
            .image(0, 0, "home_earn_wallet_label_1")
            .setOrigin(0, 0)
            .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
            .on("pointerdown", function () {
                //console.log("btn_close clicked");

                CreateHistory(scene);
            })
            .on("pointerover", function () {
                //console.log("btn_close over");

                scene.tweens.add({
                    targets: label,
                    scaleX: 1.2, // Phóng to 20% theo chiều ngang
                    scaleY: 1.2, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            })
            .on("pointerout", function () {
                //console.log("btn_close out");

                scene.tweens.add({
                    targets: label,
                    scaleX: 1, // Phóng to 20% theo chiều ngang
                    scaleY: 1, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            });
        label_inner.add(bg);

        const text_titile = scene.add
            .text(
                64,
                131 / 2,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                    "Transactions History"
                ),
                {
                    fontFamily: cdLocalization.getCurrentFont(),
                    fontSize: "40px",
                    color: "#ffffff",
                    align: "left",
                }
            )
            .setOrigin(0, 0.5);
        label_inner.add(text_titile);

        const icon = scene.add
            .image(798 + 69 / 2, 131 / 2, "home_earn_wallet_icon_3")
            .setOrigin(0.5, 0.5);
        label_inner.add(icon);
    }

    //btn chip to $msci
    {
        const label = scene.add.container(74 + 939 / 2, 1461 + 131 / 2);
        container_popup_wallet.add(label);

        const label_inner = scene.add.container(-939 / 2, -131 / 2);
        label.add(label_inner);

        const bg = scene.add
            .image(0, 0, "home_earn_wallet_label_1")
            .setOrigin(0, 0)
            .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
            .on("pointerdown", function () {
                CreateChipToMSCI(scene);
            })
            .on("pointerover", function () {
                //console.log("btn_close over");

                scene.tweens.add({
                    targets: label,
                    scaleX: 1.2, // Phóng to 20% theo chiều ngang
                    scaleY: 1.2, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            })
            .on("pointerout", function () {
                //console.log("btn_close out");

                scene.tweens.add({
                    targets: label,
                    scaleX: 1, // Phóng to 20% theo chiều ngang
                    scaleY: 1, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            });
        label_inner.add(bg);

        const text_titile = scene.add
            .text(
                64,
                131 / 2,
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                    "Chip to $MSCI"
                ),
                {
                    fontFamily: cdLocalization.getCurrentFont(),
                    fontSize: "40px",
                    color: "#ffffff",
                    align: "left",
                }
            )
            .setOrigin(0, 0.5);
        label_inner.add(text_titile);

        const icon = scene.add
            .image(798 + 69 / 2, 131 / 2, "home_earn_wallet_icon_5")
            .setOrigin(0.5, 0.5);
        label_inner.add(icon);

        // label_inner.each(function (child) {
        //     if (child.setTint) {
        //         child.setTint(0x9a9a9a); // Màu tint bạn muốn áp dụng
        //     }
        // });
    }

    //btn change wallet
    {
        btn_change_wallet = scene.add.container(74 + 939 / 2, 1611 + 131 / 2);
        container_popup_wallet.add(btn_change_wallet);
        const label_inner = scene.add.container(-939 / 2, -131 / 2);
        btn_change_wallet.add(label_inner);
        const bg = scene.add
            .image(0, 0, "home_earn_wallet_label_1")
            .setOrigin(0, 0)
            .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
            .on("pointerdown", function () {
                let walletAddress = centerData.GetWalletAddress();
                console.log("centerData.walletType:", centerData.walletType);
                if (walletAddress != null && walletAddress !== "") {
                    if (
                        centerData.walletType === centerData.WalletType.TON.KEY
                    ) {
                        DisconnectWallet();
                    } else if (
                        centerData.walletType === centerData.WalletType.SUI.KEY
                    ) {
                        DisconnectSuiWallet();
                    }
                    CheckDisconnect(scene);
                } else {
                    // ConnectWallet();
                    // CheckConnect(scene);
                    CreateSelectWalletPopup(scene);
                }
            })
            .on("pointerover", function () {
                scene.tweens.add({
                    targets: btn_change_wallet,
                    scaleX: 1.2, // Phóng to 20% theo chiều ngang
                    scaleY: 1.2, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            })
            .on("pointerout", function () {
                scene.tweens.add({
                    targets: btn_change_wallet,
                    scaleX: 1, // Phóng to 20% theo chiều ngang
                    scaleY: 1, // Phóng to 20% theo chiều dọc
                    duration: 100, // Thời gian hiệu ứng (ms)
                    ease: "Power2",
                });
            });
        label_inner.add(bg);
        const text_titile = scene.add
            .text(64, 131 / 2, "wallet status", {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "40px",
                color: "#ffffff",
                align: "left",
            })
            .setOrigin(0, 0.5);
        label_inner.add(text_titile);
        const icon = scene.add
            .image(798 + 69 / 2, 131 / 2, "home_earn_wallet_icon_4")
            .setOrigin(0.5, 0.5);
        label_inner.add(icon);
        btn_change_wallet.setConnected = function () {
            btn_change_wallet.setVisible(true);
            text_titile.setText(
                cdLocalization.getLocalization(
                    cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                    "Change Wallet"
                )
            );
        };
        btn_change_wallet.setDisconnected = function () {
            btn_change_wallet.setVisible(false);
            // text_titile.setText(
            //     cdLocalization.getLocalization(
            //         cdLocalization.GROUP_KEYS.HomeWallet.KEY,
            //         "Connect Wallet"
            //     )
            // );
        };
        btn_change_wallet.checkStats = function () {
            let walletAddress = centerData.GetWalletAddress();
            if (walletAddress != null && walletAddress !== "") {
                btn_change_wallet.setConnected();
            } else {
                btn_change_wallet.setDisconnected();
            }
        };
        btn_change_wallet.checkStats();
    }
}

function CreateSelectWalletPopup(scene) {
    container_select_wallet = scene.add.container(0, 0);
    container_main.add(container_select_wallet);

    const lock_bg = scene.rexUI.add
        .roundRectangle(0, 0, 1080, 1920, 0, 0x000000, 0.75)
        .setOrigin(0, 0)
        .setInteractive();

    container_select_wallet.add(lock_bg);

    let bg = scene.add
        .image(134, 633, "home_earn_wallet_select_popup_bg")
        .setOrigin(0, 0);
    container_select_wallet.add(bg);

    let text_title = scene.add
        .text(
            540,
            680,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeWallet.KEY,
                "Select wallet"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(),
                fontSize: "64px",
                fontStyle: "normal",
                color: "#FFFFFF",
                shadow: {
                    offsetX: 0,
                    offsetY: 0,
                    blur: 7.2,
                    color: "#0BF",
                    fill: true,
                    stroke: false,
                },
                align: "center",
            }
        )
        .setOrigin(0.5, 0);
    container_select_wallet.add(text_title);

    // const btn_sui = CreateSelectWalletButton(scene);
    // btn_sui.setPosition(164 + 751 / 2, 813 + 106 / 2);
    // btn_sui.text_titile.setText(
    //     cdLocalization.getLocalization(
    //         cdLocalization.GROUP_KEYS.HomeWallet.KEY,
    //         "SUI Wallet"
    //     )
    // );
    // container_select_wallet.add(btn_sui);

    // btn_sui.bg.on("pointerup", function () {
    //     //ConnectSuiWallet();

    //     //CheckConnect(scene);

    //     //const platform = window.Telegram.WebApp.platform;

    //     let suiLink = `https://sui.m-sci.net/connect-sui?token=${centerData.GetAccessToken()}`;

    //     // if (platform === "ios" || platform === "android") {
    //     //     CreateMobileGuide(scene, suiLink);
    //     // } else if (platform === "web" || platform === "desktop") {
    //     //     openLink(suiLink);
    //     // }

    //     if (centerData.isTouch) {
    //         CreateMobileGuide(scene, suiLink);
    //     } else {
    //         openLink(suiLink);
    //     }

    //     container_select_wallet.destroy();
    // });

    const btn_ton = CreateSelectWalletButton(scene);
    btn_ton.setPosition(164 + 751 / 2, 962 + 106 / 2);
    btn_ton.text_titile.setText(
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.HomeWallet.KEY,
            "TON Wallet"
        )
    );
    container_select_wallet.add(btn_ton);

    btn_ton.bg.on("pointerup", function () {
        ConnectWallet();

        CheckConnect(scene);

        container_select_wallet.destroy();
    });

    //create close btn
    const btn_close = scene.add
        .image(164 + 32 / 2, 692 + 54 / 2, "share_btn_back")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            container_select_wallet.destroy();
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

    container_select_wallet.add(btn_close);
}

function CreateMobileGuide(scene, suiLink) {
    let container_sui_guide = scene.add.container(0, 0);
    container_main.add(container_sui_guide);

    const guide_bg = scene.add
        .image(0, 0, "home_earn_wallet_sui_guide_bg")
        .setOrigin(0, 0)
        .setInteractive();

    container_sui_guide.add(guide_bg);

    const btn_copy = scene.add
        .image(
            252 + 575 / 2,
            1425 + 106 / 2,
            "home_earn_wallet_sui_guide_btn_copy_url"
        )
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", async function () {
            if (await isTelegramMiniApp()) {
                window.copyToClipboard(suiLink);
            } else {
                window.copyToClipboardNormal(suiLink);
            }
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

    container_sui_guide.add(btn_copy);

    //create close btn
    const btn_close = scene.add
        .image(32 + 32 / 2, 38 + 54 / 2, "share_btn_back")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            container_sui_guide.destroy();
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

    container_sui_guide.add(btn_close);
}

function CreateSelectWalletButton(scene) {
    let btn = scene.add.container(0, 0);

    const label_inner = scene.add.container(-751 / 2, -106 / 2);
    btn.add(label_inner);

    btn.bg = scene.add
        .image(0, 0, "home_earn_wallet_select_popup_btn")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {})
        .on("pointerup", function () {})
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    label_inner.add(btn.bg);

    btn.text_titile = scene.add
        .text(751 / 2, 106 / 2, "wallet status", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "40px",
            color: "#ffffff",
            align: "left",
        })
        .setOrigin(0.5, 0.5);
    label_inner.add(btn.text_titile);

    return btn;
}

export function IsOpen() {
    return isOpen;
}

let activeTween = null;
export function Open(scene) {
    if (isOpen == true) return;

    container_popup_wallet.setPosition(
        container_popup_close_position.x,
        container_popup_close_position.y
    );

    if (activeTween) {
        activeTween.stop();
        scene.tweens.remove(activeTween);
    }

    activeTween = scene.tweens.add({
        targets: container_popup_wallet,
        x: container_popup_open_position.x,
        y: container_popup_open_position.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {
            isOpen = true;
        },
    });
}

export function Close(scene) {
    if (isOpen == false) return;

    if (activeTween) {
        activeTween.stop();
        scene.tweens.remove(activeTween);
    }

    activeTween = scene.tweens.add({
        targets: container_popup_wallet,
        x: container_popup_close_position.x,
        y: container_popup_close_position.y, // Vị trí kết thúc
        duration: 500, // Thời gian tween
        ease: "Power2", // Kiểu easing
        onComplete: () => {
            Destroy();
        },
    });
}

function Destroy(scene) {
    isOpen = false;

    container_main_wallet.destroy();
}

let connectLoop;
function CheckConnect(scene) {
    const lock_bg = scene.rexUI.add
        .roundRectangle(0, 0, 1080, 1920, 0, 0x000000, 0.75)
        .setOrigin(0, 0)
        .setInteractive();

    container_main.add(lock_bg);

    connectLoop = scene.time.addEvent({
        delay: 125,
        loop: true,
        callback: () => {
            let walletAddress = centerData.GetWalletAddress();

            console.log("walletAddress:", walletAddress);

            let modalState = centerData.GetModalState();

            console.log("modalState:", modalState);

            if (modalState === centerData.ModalState.Close.KEY) {
                if (walletAddress != null && walletAddress !== "") {
                    //centerData.RequestGetNFTCharacterIds();

                    CreateWalletAddress(scene);

                    CreateLoadingPopup();

                    centerData.RequestUpdateWallet(
                        centerData.GetWalletAddress(),
                        (result) => {
                            HideLoadingPopup();

                            CreateAlertPopup(scene, "Wallet updated");
                        },
                        (error) => {
                            HideLoadingPopup();

                            CreateAlertPopup(
                                scene,
                                "Wallet update failed\n" + error.message
                            );
                        }
                    );
                }

                connectLoop.remove();

                connectLoop = null;

                //btn_change_wallet.checkStats();

                lock_bg.destroy();
            }
        },
    });
}

let disconnectLoop;
function CheckDisconnect(scene) {
    disconnectLoop = scene.time.addEvent({
        delay: 125,
        loop: true,
        callback: () => {
            let walletAddress = centerData.GetWalletAddress();

            console.log("walletAddress:", walletAddress);

            if (walletAddress == null || walletAddress === "") {
                centerData.ClearNFTCharacterIds();

                CreateWalletAddress(scene);

                disconnectLoop.remove();

                disconnectLoop = null;

                //btn_change_wallet.checkStats();

                CreateLoadingPopup();

                centerData.RequestUpdateWallet(
                    "",
                    (result) => {
                        HideLoadingPopup();

                        CreateAlertPopup(scene, "Wallet updated");
                    },
                    (error) => {
                        HideLoadingPopup();

                        CreateAlertPopup(
                            scene,
                            "Wallet update failed\n" + error.message
                        );
                    }
                );
            }
        },
    });
}
