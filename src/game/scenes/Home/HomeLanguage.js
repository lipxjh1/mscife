import centerData from "../../Data/CenterData.js";
import centerDataItem from "../../Data/CenterDataItem.js";
import cdLocalization from "../../Data/CenterDataLocalization.js";

import { AssetLoadingManager } from "../AssetLoadingManager.js";

import { AssetPlayerLoadingManager } from "../AssetPlayerLoadingManager.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../Share/AlertPopup.js";

let container_main = null;

let isOpen = false;

let selectedLanguageBtn = null;

export function CreateLanguage(scene) {
    CreateLoadingPopup();

    AssetLoadingManager.getInstance().init(scene);

    AssetLoadingManager.getInstance().lazyLoadLanguage(() => {
        HideLoadingPopup();

        AssetsLoadDone(scene);
    });
}

function AssetsLoadDone(scene) {
    Destroy();

    container_main = scene.add.container(0, 0);
    container_main.setDepth(300);

    // const lock_bg = scene.rexUI.add
    //     .roundRectangle(540, 960, 1080, 1920, 0, 0x000000, 0.75)
    //     .setInteractive({ useHandCursor: true });

    // container_main.add(lock_bg);

    const lock_bg = scene.add
        .image(0, 0, "home_language_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_main.add(lock_bg);

    //Create buttons

    //create close btn
    const btn_close = scene.add
        .image(38 + 118 / 2, 58 + 90 / 2, "share_btn_home_2")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            CloseLanguage(scene);
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

    container_main.add(btn_close);

    CreateList(scene);

    OpenLanguage(scene);
}

function CreateList(scene) {
    //en
    {
        let localizationKeyObj = cdLocalization.LOCALIZATION_KEYS.en;

        let btn = CreatelanguageButton(scene, localizationKeyObj);

        btn.btn_language.setTexture("home_language_en");

        btn.setPosition(95 + 200 / 2, 319 + 150 / 2);

        if (localizationKeyObj.KEY === cdLocalization.currentLanguage) {
            btn.setSelected(true);

            selectedLanguageBtn = btn;
        } else {
            btn.setSelected(false);
        }

        btn.btn_language.on("pointerdown", function () {
            btn.setSelected(true);

            if (selectedLanguageBtn) {
                selectedLanguageBtn.setSelected(false);
            }

            cdLocalization.changeLocalization(localizationKeyObj.KEY);

            selectedLanguageBtn = btn;
        });
    }

    //vi
    {
        let localizationKeyObj = cdLocalization.LOCALIZATION_KEYS.vi;

        let btn = CreatelanguageButton(scene, localizationKeyObj);

        btn.btn_language.setTexture("home_language_vi");

        btn.setPosition(325 + 200 / 2, 319 + 150 / 2);

        if (localizationKeyObj.KEY === cdLocalization.currentLanguage) {
            btn.setSelected(true);

            selectedLanguageBtn = btn;
        } else {
            btn.setSelected(false);
        }

        btn.btn_language.on("pointerdown", function () {
            btn.setSelected(true);

            if (selectedLanguageBtn) {
                selectedLanguageBtn.setSelected(false);
            }

            cdLocalization.changeLocalization(localizationKeyObj.KEY);

            selectedLanguageBtn = btn;
        });
    }

    //ru
    {
        let localizationKeyObj = cdLocalization.LOCALIZATION_KEYS.ru;

        let btn = CreatelanguageButton(scene, localizationKeyObj);

        btn.btn_language.setTexture("home_language_ru");

        btn.setPosition(555 + 200 / 2, 319 + 150 / 2);

        if (localizationKeyObj.KEY === cdLocalization.currentLanguage) {
            btn.setSelected(true);

            selectedLanguageBtn = btn;
        } else {
            btn.setSelected(false);
        }

        btn.btn_language.on("pointerdown", function () {
            btn.setSelected(true);

            if (selectedLanguageBtn) {
                selectedLanguageBtn.setSelected(false);
            }

            cdLocalization.changeLocalization(localizationKeyObj.KEY);

            selectedLanguageBtn = btn;
        });
    }

    //cn
    {
        let localizationKeyObj = cdLocalization.LOCALIZATION_KEYS.cn;

        let btn = CreatelanguageButton(scene, localizationKeyObj);

        btn.btn_language.setTexture("home_language_cn");

        btn.setPosition(785 + 200 / 2, 319 + 150 / 2);

        if (localizationKeyObj.KEY === cdLocalization.currentLanguage) {
            btn.setSelected(true);

            selectedLanguageBtn = btn;
        } else {
            btn.setSelected(false);
        }

        btn.btn_language.on("pointerdown", function () {
            btn.setSelected(true);

            if (selectedLanguageBtn) {
                selectedLanguageBtn.setSelected(false);
            }

            cdLocalization.changeLocalization(localizationKeyObj.KEY);

            selectedLanguageBtn = btn;
        });
    }

    //jp
    {
        let localizationKeyObj = cdLocalization.LOCALIZATION_KEYS.jp;

        let btn = CreatelanguageButton(scene, localizationKeyObj);

        btn.btn_language.setTexture("home_language_jp");

        btn.setPosition(95 + 200 / 2, 499 + 150 / 2);

        if (localizationKeyObj.KEY === cdLocalization.currentLanguage) {
            btn.setSelected(true);

            selectedLanguageBtn = btn;
        } else {
            btn.setSelected(false);
        }

        btn.btn_language.on("pointerdown", function () {
            btn.setSelected(true);

            if (selectedLanguageBtn) {
                selectedLanguageBtn.setSelected(false);
            }

            cdLocalization.changeLocalization(localizationKeyObj.KEY);

            selectedLanguageBtn = btn;
        });
    }

    //kr
    {
        let localizationKeyObj = cdLocalization.LOCALIZATION_KEYS.kr;

        let btn = CreatelanguageButton(scene, localizationKeyObj);

        btn.btn_language.setTexture("home_language_kr");

        btn.setPosition(325 + 200 / 2, 499 + 150 / 2);

        if (localizationKeyObj.KEY === cdLocalization.currentLanguage) {
            btn.setSelected(true);

            selectedLanguageBtn = btn;
        } else {
            btn.setSelected(false);
        }

        btn.btn_language.on("pointerdown", function () {
            btn.setSelected(true);

            if (selectedLanguageBtn) {
                selectedLanguageBtn.setSelected(false);
            }

            cdLocalization.changeLocalization(localizationKeyObj.KEY);

            selectedLanguageBtn = btn;
        });
    }

    //in
    {
        let localizationKeyObj = cdLocalization.LOCALIZATION_KEYS.in;

        let btn = CreatelanguageButton(scene, localizationKeyObj);

        btn.btn_language.setTexture("home_language_in");

        btn.setPosition(555 + 200 / 2, 499 + 150 / 2);

        if (localizationKeyObj.KEY === cdLocalization.currentLanguage) {
            btn.setSelected(true);

            selectedLanguageBtn = btn;
        } else {
            btn.setSelected(false);
        }

        btn.btn_language.on("pointerdown", function () {
            btn.setSelected(true);

            if (selectedLanguageBtn) {
                selectedLanguageBtn.setSelected(false);
            }

            cdLocalization.changeLocalization(localizationKeyObj.KEY);

            selectedLanguageBtn = btn;
        });
    }

    //de
    {
        let localizationKeyObj = cdLocalization.LOCALIZATION_KEYS.de;

        let btn = CreatelanguageButton(scene, localizationKeyObj);

        btn.btn_language.setTexture("home_language_de");

        btn.setPosition(785 + 200 / 2, 499 + 150 / 2);

        if (localizationKeyObj.KEY === cdLocalization.currentLanguage) {
            btn.setSelected(true);

            selectedLanguageBtn = btn;
        } else {
            btn.setSelected(false);
        }

        btn.btn_language.on("pointerdown", function () {
            btn.setSelected(true);

            if (selectedLanguageBtn) {
                selectedLanguageBtn.setSelected(false);
            }

            cdLocalization.changeLocalization(localizationKeyObj.KEY);

            selectedLanguageBtn = btn;
        });
    }
}

function CreatelanguageButton(scene, localizationKeyObj) {
    let itemWidth = 200;
    let itemHeight = 150;

    const container_item = scene.add.container(0, 0);
    container_main.add(container_item);

    container_item.localizationKeyObj = localizationKeyObj;

    let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
    container_item.add(container_inner);
    container_item.container_inner = container_inner;

    container_item.btn_language = scene.add
        .image(0, 0, "home_language_en")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {})
        .on("pointerover", function () {
            scene.tweens.add({
                targets: container_item,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: container_item,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    container_inner.add(container_item.btn_language);

    container_item.tick = scene.add
        .image(itemWidth - 35, itemHeight - 35, "home_language_tick")
        .setOrigin(0.5, 0.5);
    container_inner.add(container_item.tick);

    container_item.setSelected = function (isSelected = false) {
        container_item.tick.setVisible(isSelected);
    };

    container_item.setSelected(false);

    return container_item;
}

export function IsOpen() {
    return isOpen;
}

function OpenLanguage(scene) {
    isOpen = true;
}

function CloseLanguage(scene) {
    isOpen = false;

    Destroy();
}

function Destroy() {
    if (container_main) {
        container_main.destroy();
    }

    container_main = null;
}
