import centerData from "../../../Data/CenterData.js";
import centerDataPlayer from "../../../Data/CenterDataPlayer.js";

import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import { AssetPlayerLoadingManager } from "../../AssetPlayerLoadingManager.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import {
    MovePlayerBarToHide,
    MovePlayerBarToDefault,
} from "../HomeTopBarPlayer.js";

import {
    CreateGachaCharacter,
    Spin as SpinCharacter,
    Destroy as DestroyCharacter,
} from "./HomeGachaCharacter.js";

import {
    CreateGachaFragment,
    Spin as SpinFragment,
    Destroy as DestroyFragment,
} from "./HomeGachaFragment.js";
import { CreateBuyItemPopup } from "../../Share/PopupBuyItem.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";

let container_main = null;

let container_gacha = null;

let container_buttons = null;

let isFragmentSpin = true;

let container_btn_mode_piece = null;
let container_btn_buy_piece = null;

let container_btn_mode_box = null;
let container_btn_buy_box = null;

let piece_ticket_quantity = 0;
let text_piece_quantity = null;

let box_ticket_quantity = 0;
let text_box_quantity = null;

let btn_close = null;

let isSpining = false;

let isOpen = false;

export { container_gacha, piece_ticket_quantity, box_ticket_quantity };

export function CreateGacha(scene) {
    CreateLoadingPopup();

    let assetsToLoad = 2;
    let assetsLoaded = 0;

    const onAssetLoaded = () => {
        assetsLoaded++;
        if (assetsLoaded === assetsToLoad) {
            HideLoadingPopup();
            AssetsLoadDone(scene);
        }
    };

    AssetLoadingManager.getInstance().init(scene);

    AssetLoadingManager.getInstance().lazyLoadGacha(() => {
        onAssetLoaded();
    });

    let keys = Object.keys(centerDataPlayer.dataPlayerDictionary);

    AssetPlayerLoadingManager.getInstance().init(scene);

    AssetPlayerLoadingManager.getInstance().lazyLoadCharacterUICard(
        keys,
        () => {
            onAssetLoaded();
        }
    );
}

function AssetsLoadDone(scene) {
    isOpen = true;

    MovePlayerBarToHide(scene);

    isSpining = false;

    container_main = scene.add.container(0, 0);
    container_main.setDepth(100);
    const block_bg = scene.add
        .image(0, 0, "home_gacha_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_main.add(block_bg);

    container_gacha = scene.add.container(0, 0);
    container_main.add(container_gacha);

    container_buttons = scene.add.container(0, 0);
    container_main.add(container_buttons);

    CreateModeButtons(scene);

    CreateBuyButton(scene);

    //create close btn
    btn_close = scene.add
        .image(38 + 118 / 2, 248 + 76 / 2, "share_btn_home_2")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            //console.log("btn_close clicked");

            Close(scene);
        })
        .on("pointerover", function () {
            //console.log("btn_close over");

            scene.tweens.add({
                targets: btn_close,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            //console.log("btn_close out");

            scene.tweens.add({
                targets: btn_close,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });

    container_buttons.add(btn_close);
    container_buttons.btn_close = btn_close;

    scene.tweens.add({
        targets: container_main, // Đối tượng container cần tween
        alpha: { from: 0, to: 1 }, // Chuyển alpha từ 0 (mờ) đến 1 (hiển thị hoàn toàn)
        duration: 500, // Thời gian tween (ms)
        ease: "Linear", // Kiểu easing, có thể thay đổi
        repeat: 0, // Không lặp lại, chỉ chạy một lần
    });

    centerData.AddInventoryChange(OnInventoryChange);
}

function OnInventoryChange() {
    piece_ticket_quantity = 0;

    let box_nft_fragment = centerData.inventoryDictionary["BOX_NFT_FRAGMENT"];

    if (box_nft_fragment != null && box_nft_fragment.quantity) {
        piece_ticket_quantity = box_nft_fragment.quantity;
    }

    if (
        text_piece_quantity &&
        text_piece_quantity.active !== false &&
        text_piece_quantity.scene
    ) {
        text_piece_quantity.setText(piece_ticket_quantity);
    }

    box_ticket_quantity = 0;

    let box_nft_character = centerData.inventoryDictionary["BOX_NFT_CHARACTER"];

    if (box_nft_character != null && box_nft_character.quantity) {
        box_ticket_quantity = box_nft_character.quantity;
    }

    if (
        text_box_quantity &&
        text_box_quantity.active !== false &&
        text_box_quantity.scene
    ) {
        //console.log("text_box_quantity:", text_box_quantity);

        text_box_quantity.setText(box_ticket_quantity);
    }
}

function SetSpinMode(scene, boolValFragmentSpin) {
    if (isSpining === true) {
        return;
    }

    isFragmentSpin = boolValFragmentSpin;

    if (isFragmentSpin) {
        DestroyCharacter(scene);

        CreateGachaFragment(scene);

        container_btn_mode_piece.setSelected(true);
        container_btn_mode_box.setSelected(false);
    } else {
        DestroyFragment(scene);

        CreateGachaCharacter(scene);

        container_btn_mode_piece.setSelected(false);
        container_btn_mode_box.setSelected(true);
    }
}

export function SetSpining() {
    isSpining = true;

    btn_close.disableInteractive();
}

export function SetOutSpining() {
    isSpining = false;

    btn_close.setInteractive();
}

function CreateModeButtons(scene) {
    //tạo nút box spin
    container_btn_mode_box = scene.add.container(540, 1354 + 96 / 2);
    container_buttons.add(container_btn_mode_box);

    const btn_spinBox = scene.add
        .image(0, 0, "home_gacha_mode_title")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            SetSpinMode(scene, true);
        })
        .on("pointerover", function () {
            container_btn_mode_box.each(function (child) {
                if (child.setTint) {
                    child.setTint(0x646464); // Màu tint bạn muốn áp dụng
                }
            });
        })
        .on("pointerout", function () {
            container_btn_mode_box.each(function (child) {
                if (child.clearTint) {
                    child.clearTint(); // Xóa tint
                }
            });
        });

    container_btn_mode_box.add(btn_spinBox);

    container_buttons.btn = btn_spinBox;

    const text_box = scene.add
        .text(
            0,
            0,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeGacha.KEY,
                "Hero Recruit"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "60px", // Font-size
                color: "#FFF", // Màu chữ (color)
                align: "center",
            }
        )
        .setOrigin(0.5, 0.5);

    container_btn_mode_box.add(text_box);

    container_btn_mode_box.setSelected = function (boolVal) {
        if (boolVal) {
            btn_spinBox.setVisible(true);
            text_box.setVisible(true);
            btn_spinBox.setInteractive({ useHandCursor: true });
        } else {
            btn_spinBox.setVisible(false);
            text_box.setVisible(false);
            btn_spinBox.disableInteractive();
        }
    };

    //tạo nút piece spin
    container_btn_mode_piece = scene.add.container(540, 1354 + 96 / 2);
    container_buttons.add(container_btn_mode_piece);

    const btn_spinPiece = scene.add
        .image(0, 0, "home_gacha_mode_title")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            SetSpinMode(scene, false);
        })
        .on("pointerover", function () {
            container_btn_mode_piece.each(function (child) {
                if (child.setTint) {
                    child.setTint(0x646464); // Màu tint bạn muốn áp dụng
                }
            });
        })
        .on("pointerout", function () {
            container_btn_mode_piece.each(function (child) {
                if (child.clearTint) {
                    child.clearTint(); // Xóa tint
                }
            });
        });
    container_btn_mode_piece.add(btn_spinPiece);

    container_buttons.btn = btn_spinPiece;

    const text_piece = scene.add
        .text(
            0,
            0,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeGacha.KEY,
                "Hero Piece"
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "60px", // Font-size
                color: "#FFF", // Màu chữ (color)
                align: "center",
            }
        )
        .setOrigin(0.5, 0.5);

    container_btn_mode_piece.add(text_piece);

    container_btn_mode_piece.setSelected = function (boolVal) {
        if (boolVal) {
            btn_spinPiece.setVisible(true);
            text_piece.setVisible(true);
            btn_spinPiece.setInteractive({ useHandCursor: true });
        } else {
            btn_spinPiece.setVisible(false);
            text_piece.setVisible(false);
            btn_spinPiece.disableInteractive();
        }
    };

    SetSpinMode(scene, false);
}

function CreateBuyButton(scene) {
    container_btn_buy_box = scene.add.container(
        187 + 376 / 2,
        1486 + 110 / 2 - 15
    );
    container_buttons.add(container_btn_buy_box);

    let container_btn_buy_box_inner = scene.add.container(-376 / 2, -110 / 2);
    container_btn_buy_box.add(container_btn_buy_box_inner);

    const btn_buy_character_ticket = scene.add
        .image(0, 0, "home_gacha_btn_buy_character_box")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            //console.log("spin clicked");

            if (isSpining === false) {
                BuyTicketCharacter(scene);
            }
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: container_btn_buy_box,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: container_btn_buy_box,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });

    container_btn_buy_box_inner.add(btn_buy_character_ticket);
    container_btn_buy_box.btn = btn_buy_character_ticket;

    text_box_quantity = scene.add
        .text(255, 74, "0", {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#ffffff",
            align: "right",
        })
        .setOrigin(1, 1);
    container_btn_buy_box_inner.add(text_box_quantity);

    //button piece

    container_btn_buy_piece = scene.add.container(
        552 + 376 / 2,
        1486 + 110 / 2 - 15
    );
    container_buttons.add(container_btn_buy_piece);

    let container_btn_buy_piece_inner = scene.add.container(-376 / 2, -110 / 2);
    container_btn_buy_piece.add(container_btn_buy_piece_inner);

    const btn_buy_piece_ticket = scene.add
        .image(0, 0, "home_gacha_btn_buy_character_piece_box")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            if (isSpining === false) {
                BuyTicketPiece(scene);
            }
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: container_btn_buy_piece,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: container_btn_buy_piece,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });

    container_btn_buy_piece_inner.add(btn_buy_piece_ticket);
    container_btn_buy_piece.btn = btn_buy_piece_ticket;

    text_piece_quantity = scene.add
        .text(255, 74, "0", {
            fontFamily: "Russo One",
            fontSize: "40px",
            color: "#ffffff",
            align: "right",
        })
        .setOrigin(1, 1);
    container_btn_buy_piece_inner.add(text_piece_quantity);
}

export function BuyTicketCharacter(scene) {
    CreateLoadingPopup();

    centerData.RequestShop(
        () => {
            HideLoadingPopup();

            let item = centerData.itemShopDictionary["BOX_NFT_CHARACTER"];

            if (item != null) {
                if (centerData.userInfo.Musk >= item.price) {
                    CreateBuyItemPopup(
                        scene,
                        item.code,
                        item.name,
                        item.price,
                        item.priceScore,
                        item.remaining,
                        item.description,
                        () => {
                            centerData.RequestInventory();
                        },
                        () => {}
                    );
                }
            }
        },
        (error) => {
            HideLoadingPopup();

            CreateAlertPopup("Request shop failed\n" + error.message);
        }
    );
}

export function BuyTicketPiece(scene) {
    CreateLoadingPopup();

    centerData.RequestShop(
        () => {
            HideLoadingPopup();

            let item = centerData.itemShopDictionary["BOX_NFT_FRAGMENT"];

            if (item != null) {
                if (centerData.userInfo.Musk >= item.price) {
                    CreateBuyItemPopup(
                        scene,
                        item.code,
                        item.name,
                        item.price,
                        item.priceScore,
                        item.remaining,
                        item.description,
                        () => {
                            centerData.RequestInventory();
                        },
                        () => {}
                    );
                }
            }
        },
        (error) => {
            HideLoadingPopup();

            CreateAlertPopup("Request shop failed\n" + error.message);
        }
    );
}

export function IsOpen() {
    return isOpen;
}

function Close(scene) {
    isOpen = false;

    MovePlayerBarToDefault(scene);

    scene.tweens.add({
        targets: container_main, // Đối tượng container cần tween
        alpha: { from: 1, to: 0 }, // Chuyển alpha từ 0 (mờ) đến 1 (hiển thị hoàn toàn)
        duration: 500, // Thời gian tween (ms)
        ease: "Linear", // Kiểu easing, có thể thay đổi
        repeat: 0, // Không lặp lại, chỉ chạy một lần
        onComplete: () => {
            Destroy(scene); // Log ra console khi tween hoàn tất
        },
    });
}

function Destroy(scene) {
    centerData.RemoveInventoryChange(OnInventoryChange);

    DestroyCharacter(scene);
    DestroyFragment(scene);

    if (container_main) container_main.destroy();
    container_main = null;
    text_box_quantity = null;
    text_piece_quantity = null;

    scene.events.once("shutdown", () => {
        centerData.RemoveInventoryChange(OnInventoryChange);
    });
}

//kết thúc tạo top bar bg
