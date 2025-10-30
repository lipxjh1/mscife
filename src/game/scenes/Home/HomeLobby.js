import { AssetLoadingManager } from "../AssetLoadingManager.js";

import { AssetPlayerLoadingManager } from "../AssetPlayerLoadingManager.js";

import centerData from "../../Data/CenterData.js";

import centerDataPlayer from "../../Data/CenterDataPlayer.js";

import { GetActiveAudio, SetActiveAudio } from "../Manager/ManagerAudio.js";

import { CreateReward } from "./HomeReward/HomeReward.js";

import { OpenCloseBeta } from "./HomeCloseBeta.js";

import { CreateGacha } from "./HomeGacha/HomeGacha.js";

import { CreateEarn } from "./HomeEarn/HomeEarn.js";

import { CreateShop } from "./HomeShop/HomeShop.js";

import { CreateCharacterInventory } from "./HomeCharacterInventory/HomeCharacterInventory.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../Share/AlertPopup.js";

import { CreateInventory } from "./HomeInventory/HomeInventory.js";
import { CreateHomeBattle } from "./HomeBattle/HomeBattle.js";
import { CreateDaily } from "./HomeDaily.js";
import { CreateNotification } from "./HomeNotification.js";
import cdLocalization from "../../Data/CenterDataLocalization.js";
import { CreateLanguage } from "./HomeLanguage.js";
import { CreateGiftCodePopup } from "../Share/PopupGiftCode.js";

import { CreateChipReward } from "./HomeDailyChipReward.js";
import { CreateCenterMarket } from "./HomeCenterMarket/HomeCenterMarket.js";
import { CreateHomePlayTest } from "./HomePlayTest/HomePlayTest.js";
import { CreateMSCITokenomic } from "./HomeMSCITokenomic/HomeMSCITokenomic.js";
import { CreateHomeNeuralink } from "./HomeNeuralink/HomeNeuralink.js";
import { playIdleAnimation, debugSpine } from "../../utils/spineUtils.js";
import { CreateGuild } from "./HomeGuild/HomeGuild.js";

let container_main = null;

let container_0 = null;

let container_1 = null;

let isTween = false;

export function CreateLobby(scene) {
    container_main = scene.add.container(0, 0);
    container_main.setDepth(0);

    const block_bg = scene.add
        .image(0, 0, "home_lobby_bg")
        .setOrigin(0, 0)
        .setInteractive();
    container_main.add(block_bg);

    container_0 = scene.add.container(0, 0);
    container_main.add(container_0);
    container_0.setDepth(1);

    container_1 = scene.add.container(0, 0);
    container_main.add(container_1);
    container_1.setDepth(2);

    const block_bg_footer = scene.add
        .image(0, 0, "home_lobby_bg_footer")
        .setOrigin(0, 0);
    container_1.add(block_bg_footer);

    CreateButtonLanguage(scene);

    //CreateButtonCode(scene);

    CreateButtonGuild(scene);

    CreateButtonPlaytest(scene);

    CreateButtonDaily(scene);

    CreateButtonBattle(scene);

    //CreateButtonTutorial(scene);

    CreateButtonCenterMarket(scene);

    CreateButtonReward(scene);

    CreateButtonCharacter(scene);

    //CreateButtonCloseBeta(scene);

    CreateButtonMSCI(scene);

    CreateButtonNotifiaction(scene);

    CreateDailyChipReward(scene);

    CheckNotification(scene);

    scene.time.addEvent({
        delay: 15000, // 1 giây (1000ms)
        callback: () => {
            CheckNotification(scene);
        }, // Hàm được gọi mỗi lần lặp
        callbackScope: this,
        loop: true, // Đặt thành true để vòng lặp liên tục
    });

    CreateButtonAudio(scene);

    CreateButtonGacha(scene);

    CreateButtonWallet(scene);

    CreateButtonNeuralink(scene);

    CreateButtonInventory(scene);

    CreateButtonShop(scene);

    CreateLoadingPopup();

    // ✅ NEW: Load On Demand implementation
    centerData.RequestMergedCharacters(
        () => {
            HideLoadingPopup();

            if (centerData.selectedPlayerArr.length <= 0) {
                FirstTimeEquipCharacters(scene);
            } else {
                SpawnLobbyCharacterWithLoadOnDemand(scene);
            }
        },
        () => {
            HideLoadingPopup();
        }
    );

    CreateButtonSelectLeft(scene);

    CreateButtonSelectRight(scene);
}

function CreateDailyChipReward(scene) {
    const daily_chip_reward_bg = scene.add
        .image(1080, 376 + 93 / 2, "home_lobby_daily_chip_reward_bg")
        .setOrigin(1, 0.5);
    container_1.add(daily_chip_reward_bg);

    const daily_chip_reward_btn = scene.add
        .image(545 + 347 / 2, 392 + 62 / 2, "home_lobby_daily_chip_reward_btn")
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            CreateChipReward(scene);
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: daily_chip_reward_btn,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: daily_chip_reward_btn,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    container_1.add(daily_chip_reward_btn);

    let text_reward = scene.add
        .text(562, 409 + 24 / 2, "", {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "24px",
            color: "#B2B2B2",
            align: "left",
        })
        .setOrigin(0, 0.5);
    container_1.add(text_reward);

    let text_amount = scene.add
        .text(text_reward.x + text_reward.width, text_reward.y, 0, {
            fontFamily: cdLocalization.getCurrentFont(),
            fontSize: "28px",
            color: "#ffffff",
            align: "left",
        })
        .setOrigin(0, 0.5);
    container_1.add(text_amount);

    let text_reward_localization = () => {
        text_reward.setStyle({
            fontFamily: cdLocalization.getCurrentFont(),
        });

        text_reward.setText(
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeLobby.KEY,
                "Daily Chip reward: "
            )
        );

        text_amount.setStyle({
            fontFamily: cdLocalization.getCurrentFont(),
        });

        text_amount.setPosition(
            text_reward.x + text_reward.width,
            text_reward.y
        );
    };

    let text_chip_reward_update_value = () => {
        // Guard: tránh cập nhật khi scene hoặc text đã bị hủy/sleep
        if (
            !scene ||
            !scene.sys ||
            scene.sys.isDestroyed ||
            !scene.sys.isActive()
        ) {
            return;
        }
        if (
            !text_amount ||
            !text_amount.scene ||
            !text_amount.active ||
            text_amount.destroyed
        ) {
            return;
        }

        let chipAmount =
            centerData && centerData.userInfo
                ? centerData.userInfo.DailyPointReward
                : 0;

        const rewardsRoot =
            centerData &&
            centerData.chipDailyReward &&
            centerData.chipDailyReward.data;
        const rewards =
            rewardsRoot && Array.isArray(rewardsRoot.chipRewards)
                ? rewardsRoot.chipRewards
                : [];

        for (let i = 0; i < rewards.length; i++) {
            const chipRewardData = rewards[i];
            if (chipRewardData && chipRewardData.active) {
                chipAmount += chipRewardData.dailyAmount;
            }
        }

        // Guard cuối: tránh lỗi Canvas context null khi Text nội bộ đã bị destroy
        if (text_amount && text_amount.setText) {
            text_amount.setText(chipAmount);
        }
    };

    text_reward_localization();

    // Đăng ký event
    cdLocalization.AddLocalizationChange(text_reward_localization);

    // Gỡ bỏ khi scene bị shutdown
    scene.events.once("shutdown", () => {
        cdLocalization.RemoveLocalizationChange(text_reward_localization);
    });

    centerData.AddChipDailyRewardChange(text_chip_reward_update_value);

    scene.events.once("shutdown", () => {
        centerData.RemoveChipDailyRewardChange(text_chip_reward_update_value);
    });
    centerData.RequestChipDailyRewards();
}

function CreateButtonCode(scene) {
    const btn_code = scene.add
        .image(30, 595 + 182 / 2, "home_lobby_btn_code")
        .setOrigin(0, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            CreateGiftCodePopup(scene);
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_code,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_code,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    container_1.add(btn_code);
}

function CreateButtonGuild(scene) {
    const btn_guild = scene.add
        .image(30, 595 + 182 / 2, "home_lobby_btn_guild")
        .setOrigin(0, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            CreateGuild(scene);
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_guild,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_guild,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    container_1.add(btn_guild);
}

function CreateButtonPlaytest(scene) {
    const btn_playtest = scene.add
        .image(12, 755 + 190 / 2, "home_lobby_btn_playtest")
        .setOrigin(0, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            CreateHomePlayTest(scene);
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_playtest,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_playtest,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    container_1.add(btn_playtest);
}

function CreateButtonLanguage(scene) {
    const btn_language = scene.add
        .image(24, 465 + 159 / 2, "home_lobby_btn_language")
        .setOrigin(0, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            CreateLanguage(scene);
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_language,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_language,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    container_1.add(btn_language);
}

function CreateButtonDaily(scene) {
    const btn_daily = scene.add
        .image(1043, 463 + 159 / 2, "home_lobby_btn_daily")
        .setOrigin(1, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            CreateDaily(scene);
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_daily,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_daily,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    container_1.add(btn_daily);
}

function CreateButtonBattle(scene) {
    const btn_battle = scene.add
        .image(0, 1126 + 273 / 2, "home_lobby_btn_battle")
        .setOrigin(0, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            if (centerData.selectedPlayerArr.length < 1) {
                CreateAlertPopup(
                    scene,
                    "Equip characters to start a battle",
                    () => {
                        CreateCharacterInventory(scene);
                    },
                    () => {}
                );
            } else {
                CreateHomeBattle(scene);
            }
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_battle,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_battle,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    container_1.add(btn_battle);
}

function CreateButtonTutorial(scene) {
    const btn_tutorial = scene.add
        .image(1041, 717 + 157 / 2, "home_lobby_btn_tutorial")
        .setOrigin(1, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {})
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_tutorial,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_tutorial,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    container_1.add(btn_tutorial);
}

function CreateButtonMSCI(scene) {
    const btn_msci = scene.add
        .image(1045, 620 + 167 / 2, "home_lobby_btn_msci")
        .setOrigin(1, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            CreateMSCITokenomic(scene);
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_msci,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_msci,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    container_1.add(btn_msci);
}

function CreateButtonCenterMarket(scene) {
    const btn = scene.add
        .image(1041, 770 + 157 / 2, "home_lobby_btn_center_market")
        .setOrigin(1, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            CreateCenterMarket(scene);
        })
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
    container_1.add(btn);
}

function CreateButtonReward(scene) {
    const btn_reward = scene.add
        .image(1065, 1126 + 229 / 2, "home_lobby_btn_reward")
        .setOrigin(1, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            CreateReward(scene);
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_reward,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_reward,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    container_1.add(btn_reward);
}

function CreateButtonCharacter(scene) {
    const btn_character = scene.add
        .image(24, 1322 + 291 / 2, "home_lobby_btn_character")
        .setOrigin(0, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            //console.log("ButtonCharacter clicked");

            CreateCharacterInventory(scene);
        })
        .on("pointerover", function () {
            //console.log("ButtonCharacter over");

            scene.tweens.add({
                targets: btn_character,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            // console.log("ButtonCharacter out");

            scene.tweens.add({
                targets: btn_character,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    container_1.add(btn_character);
}

function CreateButtonEarn(scene) {
    const btn_earn = scene.add
        .image(1040.5 + 30, 277 - 27 + 253 / 2, "home_lobby_btn_earn")
        .setOrigin(1, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            CreateEarn(scene);
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_earn,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_earn,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    container_1.add(btn_earn);
}

function CreateButtonBoss(scene) {
    const btn_boss_container = scene.add.container(
        1040.5 - 34 + 30,
        477 - 27 + 253 / 2
    );
    container_1.add(btn_boss_container);

    const btn_boss = scene.add
        .image(0, 0, "home_lobby_btn_boss")
        .setOrigin(1, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {})
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_boss_container,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_boss_container,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    btn_boss_container.add(btn_boss);

    const text_time = scene.add
        .text(-309 / 2, -38, "00 : 00", {
            fontFamily: "Russo One",
            fontSize: "48px",
            color: "#ffffff",
            align: "center",
        })
        .setOrigin(0.5);

    text_time.setAngle(5);
    btn_boss_container.add(text_time);

    // Thời gian đếm ngược (3 phút = 180 giây)
    let timeLeft = 180;

    // Tạo tween đếm ngược
    scene.tweens.addCounter({
        from: timeLeft,
        to: 0,
        duration: timeLeft * 1000, // 180 giây = 180000 ms
        onUpdate: (tween) => {
            timeLeft = Math.floor(tween.getValue());
            // Format thời gian thành mm:ss
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            // Padding số 0 phía trước nếu cần
            const formattedTime = `${String(minutes).padStart(
                2,
                "0"
            )} : ${String(seconds).padStart(2, "0")}`;
            text_time.setText(formattedTime);
        },
        onComplete: () => {
            //console.log("Countdown completed!");
        },
    });
}

function CreateButtonCloseBeta(scene) {
    const btn_close_beta = scene.add
        .image(1059 - 10, 472 + 209 / 2, "home_lobby_btn_close_beta")
        .setOrigin(1, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            //console.log("ButtonBattle clicked");

            OpenCloseBeta(scene);
        })
        .on("pointerover", function () {
            //console.log("ButtonBattle over");

            scene.tweens.add({
                targets: btn_close_beta,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            //console.log("ButtonBattle out");

            scene.tweens.add({
                targets: btn_close_beta,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    container_1.add(btn_close_beta);
}

let btn_notification = null;
function CreateButtonNotifiaction(scene) {
    btn_notification = scene.add
        .image(914 + 68 / 2, 389 + 68 / 2, "home_lobby_btn_notification")
        .setOrigin(0.5, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            CreateNotification(scene);
        })
        .on("pointerover", function () {
            //console.log("ButtonBattle over");

            scene.tweens.add({
                targets: btn_notification,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            //console.log("ButtonBattle out");

            scene.tweens.add({
                targets: btn_notification,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });

    btn_notification.setAlert = function (boolVal) {
        if (boolVal) {
            btn_notification.setTexture("home_lobby_btn_notification_new");

            btn_notification.tween = scene.tweens.add({
                targets: btn_notification,
                angle: { from: -15, to: 15 }, // Lắc qua lại từ -15° đến 15°
                duration: 200, // Tốc độ rung
                ease: "Sine.easeInOut", // Hiệu ứng mềm mại
                yoyo: true, // Quay lại trạng thái ban đầu
                repeat: -1, // Lặp vô hạn
            });
        } else {
            btn_notification.setTexture("home_lobby_btn_notification");

            btn_notification.angle = 0;

            if (btn_notification.tween) {
                btn_notification.tween.stop();
                scene.tweens.remove(btn_notification.tween);
            }
        }
    };
}

export function CheckNotification(scene) {
    centerData.RequestMails(
        1,
        (result) => {
            // console.log(
            //     "CheckNotification result.pagination.unreadMails: ",
            //     result.pagination.unreadMails
            // );

            if (result.pagination.unreadMails > 0) {
                btn_notification.setAlert(true);
            } else {
                btn_notification.setAlert(false);
            }
        },
        (error) => {}
    );
}

function CreateButtonAudio(scene) {
    const btn_audio_on = scene.add
        .image(987 + 68 / 2, 389 + 68 / 2, "home_lobby_btn_audio_on")
        .setOrigin(0.5, 0.5);
    container_1.add(btn_audio_on);

    const btn_audio_off = scene.add
        .image(987 + 68 / 2, 389 + 68 / 2, "home_lobby_btn_audio_off")
        .setOrigin(0.5, 0.5);
    container_1.add(btn_audio_off);

    function CheckAudioButtons() {
        //console.log("CheckAudioButtons, ", GetActiveAudio());

        if (GetActiveAudio() == true) {
            btn_audio_on.setVisible(true);
            btn_audio_off.setVisible(false);
        } else {
            btn_audio_on.setVisible(false);
            btn_audio_off.setVisible(true);
        }
    }

    CheckAudioButtons();

    btn_audio_on
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            SetActiveAudio(false);

            CheckAudioButtons();
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_audio_on,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_audio_on,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });

    btn_audio_off
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            SetActiveAudio(true);

            CheckAudioButtons();
        })
        .on("pointerover", function () {
            scene.tweens.add({
                targets: btn_audio_off,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            scene.tweens.add({
                targets: btn_audio_off,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
}

function CreateButtonGacha(scene) {
    const btn_gacha = scene.add
        .image(1067, 1299 + 316 / 2, "home_lobby_btn_gacha")
        .setOrigin(1, 0.5)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            //console.log("ButtonGacha clicked");

            CreateGacha(scene);
        })
        .on("pointerover", function () {
            //console.log("ButtonGacha over");

            scene.tweens.add({
                targets: btn_gacha,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            // console.log("ButtonGacha out");

            scene.tweens.add({
                targets: btn_gacha,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    container_1.add(btn_gacha);
}

function CreateBottomButton(scene, x, y, imageKey, buttonName) {
    let btnWidth = 160;
    let btnHeight = 164;

    const btn_container = scene.add.container(x, y);
    container_1.add(btn_container);

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
        .text(btnWidth / 2, 128, "", {
            fontFamily: cdLocalization.getCurrentFont(), // Font-family
            fontSize: "32px", // Font-size
            color: "#FFF", // Màu chữ (color)
            stroke: "#FFF", // Màu viền (text-shadow)
            strokeThickness: 2, // Độ dày của viền (tương đương với text-shadow)
            shadow: {
                offsetX: 0, // Offset X của shadow
                offsetY: 0, // Offset Y của shadow
                color: "rgba(255, 255, 255, 0.50)", // Màu shadow với độ trong suốt
                blur: 2, // Blur radius (tương đương với text-shadow)
                fill: true, // Áp dụng shadow cho phần fill
            },
            align: "center",
        })
        .setOrigin(0.5, 0);

    btn_inner_container.add(text);

    let text_localization = () => {
        text.setStyle({
            fontFamily: cdLocalization.getCurrentFont(),
        });

        text.setText(
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeLobby.KEY,
                buttonName
            )
        );
    };

    text_localization();

    // Đăng ký event
    cdLocalization.AddLocalizationChange(text_localization);

    // Gỡ bỏ khi scene bị shutdown
    scene.events.once("shutdown", () => {
        cdLocalization.RemoveLocalizationChange(text_localization);
    });

    return btn_container;
}

function CreateButtonWallet(scene) {
    let btn = CreateBottomButton(
        scene,
        76 + 160 / 2,
        1723 + 164 / 2,
        "home_lobby_btn_wallet",
        "Wallet"
    );

    btn.button.on("pointerdown", function () {
        CreateEarn(scene);
    });
}

function CreateButtonNeuralink(scene) {
    let btn = CreateBottomButton(
        scene,
        332 + 160 / 2,
        1723 + 164 / 2,
        "home_lobby_btn_neuralink",
        "DeGameFi"
    );

    btn.button.on("pointerdown", function () {
        CreateHomeNeuralink(scene);
    });
}

function CreateButtonInventory(scene) {
    let btn = CreateBottomButton(
        scene,
        581 + 160 / 2,
        1723 + 164 / 2,
        "home_lobby_btn_inventory",
        "Inventory"
    );

    btn.button.on("pointerdown", function () {
        CreateInventory(scene);
    });
}

function CreateButtonShop(scene) {
    let btn = CreateBottomButton(
        scene,
        844 + 160 / 2,
        1723 + 164 / 2,
        "home_lobby_btn_shop",
        "Shop"
    );

    btn.button.on("pointerdown", function () {
        CreateShop(scene);
    });
}

function CreateButtonSelectLeft(scene) {
    const btn = scene.add
        .image(38 + 32 / 2, 1035 + 70 / 2, "home_lobby_btn_left")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            //console.log("CreateButtonSelectLeft clicked");

            LeftButtonClick(scene);
        })
        .on("pointerover", function () {
            //console.log("CreateButtonSelectLeft over");

            scene.tweens.add({
                targets: btn,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            //console.log("CreateButtonSelectLeft out");

            scene.tweens.add({
                targets: btn,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    container_1.add(btn);
}

function CreateButtonSelectRight(scene) {
    const btn = scene.add
        .image(1010 + 32 / 2, 1035 + 70 / 2, "home_lobby_btn_right")
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            // console.log("CreateButtonSelectRight clicked");

            RightButtonClick(scene);
        })
        .on("pointerover", function () {
            //console.log("CreateButtonSelectRight over");

            scene.tweens.add({
                targets: btn,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            // console.log("CreateButtonSelectRight out");

            scene.tweens.add({
                targets: btn,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });
    container_1.add(btn);
}

function FirstTimeEquipCharacters(scene) {
    let playerDict = centerData.GetMergedCharacters();

    let keys = Object.keys(playerDict);

    let _id_gunner = null;
    let _id_sniper = null;
    let _id_rocket = null;

    let selectedArr = [];

    for (let i = 0; i < keys.length; i++) {
        let k = keys[i];

        let unlockedPlayer = playerDict[k];

        if (
            _id_gunner == null &&
            unlockedPlayer &&
            unlockedPlayer.role === "gunner"
        ) {
            _id_gunner = k;
            selectedArr.push(k);
        } else if (
            _id_sniper == null &&
            unlockedPlayer &&
            unlockedPlayer.role === "sniper"
        ) {
            _id_sniper = k;
            selectedArr.push(k);
        } else if (
            _id_rocket == null &&
            unlockedPlayer &&
            unlockedPlayer.role === "rocket"
        ) {
            _id_rocket = k;
            selectedArr.push(k);
        }

        if (_id_gunner != null && _id_sniper != null && _id_rocket != null) {
            break;
        }
    }

    if (selectedArr.length > 0) {
        CreateLoadingPopup();

        centerData.RequestUpdateBattleCharacters(
            selectedArr,
            () => {
                HideLoadingPopup();

                CreateLoadingPopup();

                centerData.RequestUserInfo(
                    () => {
                        HideLoadingPopup();

                        SpawnLobbyCharacter(scene);
                    },
                    () => {
                        HideLoadingPopup();

                        CreateAlertPopup(
                            scene,
                            "First time get user info failed"
                        );
                    }
                );
            },
            () => {
                HideLoadingPopup();

                CreateAlertPopup(scene, "First time set players failed");
            }
        );
    }
}

export function SpawnLobbyCharacter(scene) {
    AssetPlayerLoadingManager.getInstance().init(scene);

    CreateLoadingPopup();

    let arrIds = centerData.getSelectedPlayerLocalIds();

    AssetPlayerLoadingManager.getInstance().lazyLoadCharacterSpineUI(
        arrIds,
        () => {
            HideLoadingPopup();

            if (player_spine != null) {
                player_spine.destroy();
            }

            if (currentIndex > centerData.selectedPlayerArr.length - 1) {
                currentIndex = centerData.selectedPlayerArr.length - 1;

                currentIndex = Phaser.Math.Clamp(currentIndex, 0, currentIndex);

                return;
            }

            player_spine = CreateLobbyCharacter(scene);

            player_spine.skeleton.setToSetupPose();

            player_spine.setPosition(540, 1920 * 1.5);
            player_spine.setScale(1.4);
        }
    );
}

function LeftButtonClick(scene) {
    if (centerData.selectedPlayerArr.length < 1) {
        return;
    }

    if (isTween) return;

    isTween = true;

    currentIndex--;

    if (currentIndex < 0) {
        currentIndex = centerData.selectedPlayerArr.length - 1;
    }

    let newSpine = CreateLobbyCharacter(scene);

    newSpine.skeleton.setToSetupPose();

    newSpine.setPosition(540 - 1080, 1920 * 1.5);
    newSpine.setScale(1.4);

    scene.tweens.add({
        targets: newSpine, // Đối tượng bạn muốn tween (container, sprite, image, v.v.)
        x: 540, // Vị trí x đích
        y: newSpine.y, // Vị trí y đích
        duration: 500, // Thời gian tween (ms)
        ease: "Power2", // Kiểu easing (bạn có thể thử các kiểu khác như 'Linear', 'Bounce', 'Elastic')
        delay: 0, // Độ trễ trước khi tween bắt đầu (nếu có)
        onComplete: function () {},
    });

    scene.tweens.add({
        targets: player_spine, // Đối tượng bạn muốn tween (container, sprite, image, v.v.)
        x: player_spine.x + 1080, // Vị trí x đích
        y: player_spine.y, // Vị trí y đích
        duration: 500, // Thời gian tween (ms)
        ease: "Power2", // Kiểu easing (bạn có thể thử các kiểu khác như 'Linear', 'Bounce', 'Elastic')
        delay: 0, // Độ trễ trước khi tween bắt đầu (nếu có)
        onComplete: function () {
            player_spine.destroy();
            player_spine = newSpine;

            isTween = false;
        },
    });
}

function RightButtonClick(scene) {
    if (centerData.selectedPlayerArr.length < 1) {
        return;
    }

    if (isTween) return;

    isTween = true;

    currentIndex++;

    if (currentIndex >= centerData.selectedPlayerArr.length) {
        currentIndex = 0;
    }

    let newSpine = CreateLobbyCharacter(scene);

    newSpine.skeleton.setToSetupPose();

    newSpine.setPosition(540 + 1080, 1920 * 1.5);
    newSpine.setScale(1.4);

    scene.tweens.add({
        targets: newSpine, // Đối tượng bạn muốn tween (container, sprite, image, v.v.)
        x: 540, // Vị trí x đích
        y: newSpine.y, // Vị trí y đích
        duration: 500, // Thời gian tween (ms)
        ease: "Power2", // Kiểu easing (bạn có thể thử các kiểu khác như 'Linear', 'Bounce', 'Elastic')
        delay: 0, // Độ trễ trước khi tween bắt đầu (nếu có)
        onComplete: function () {},
    });

    scene.tweens.add({
        targets: player_spine, // Đối tượng bạn muốn tween (container, sprite, image, v.v.)
        x: player_spine.x - 1080, // Vị trí x đích
        y: player_spine.y, // Vị trí y đích
        duration: 500, // Thời gian tween (ms)
        ease: "Power2", // Kiểu easing (bạn có thể thử các kiểu khác như 'Linear', 'Bounce', 'Elastic')
        delay: 0, // Độ trễ trước khi tween bắt đầu (nếu có)
        onComplete: function () {
            player_spine.destroy();
            player_spine = newSpine;

            isTween = false;
        },
    });
}

let container_player = null;

let player_spine = null;

let currentIndex = 0;

let currentPlayerId = "";

function CreateLobbyCharacter(scene) {
    if (
        centerData.selectedPlayerArr == null ||
        centerData.selectedPlayerArr.length <= 0
    )
        return;

    currentPlayerId = centerData.selectedPlayerArr[currentIndex];

    let unlockedPlayer = centerData.getUnlockedPlayerById(currentPlayerId);

    let pData = centerDataPlayer.getPlayerById(unlockedPlayer.code);

    container_player = scene.add.container(0, 0);
    container_0.add(container_player);

    //console.log("Creating spine with key:", pData.spineUIKey);
    let spawnedSpine = scene.add.spine(540, 1920 * 1.5, pData.spineUIKey);

    //console.log("Spine created:", spawnedSpine);
    // debugSpine(spawnedSpine); // Debug code - remove in production

    // Thêm delay để đảm bảo spine được khởi tạo đúng cách
    scene.time.delayedCall(100, () => {
        //console.log("Delayed spine check:");
        // debugSpine(spawnedSpine); // Debug code - remove in production
        playIdleAnimation(spawnedSpine);
    });

    //console.log("player_spine_ui = " + spawnedSpine);

    // Thêm spine vào container
    container_player.add(spawnedSpine);

    // // Áp dụng tint bằng cách thay đổi trực tiếp giá trị RGBA cho mỗi slot
    // player_spine.skeleton.slots.forEach((slot) => {
    //   slot.color.set(1, 0.5, 0.5, 1); // Thiết lập màu đỏ nhạt (1, 0.5, 0.5, 1)
    // });

    return spawnedSpine;
}

// ✅ NEW: Load On Demand implementation
function SpawnLobbyCharacterWithLoadOnDemand(scene) {
    console.log('SpawnLobbyCharacterWithLoadOnDemand: Starting progressive character loading');
    
    // Step 1: Quick basic spine loading (100-200ms)
    const basicIds = centerData.getSelectedPlayerLocalIds();
    AssetPlayerLoadingManager.getInstance().init(scene);
    
    // Step 2: Render immediately with basic data
    AssetPlayerLoadingManager.getInstance()
        .lazyLoadCharacterSpineUI(basicIds, () => {
            console.log('SpawnLobbyCharacterWithLoadOnDemand: Basic assets loaded');
            
            // Render basic lobby character immediately
            renderBasicLobbyCharacter(scene);
            
            // Step 3: Background-load detailed data
            console.log('SpawnLobbyCharacterWithLoadOnDemand: Loading detailed data in background');
            Promise.allSettled(
                centerData.selectedPlayerArr.map(id =>
                    centerData.loadFullCharacterData(id)
                )
            ).then(results => {
                console.log('SpawnLobbyCharacterWithLoadOnDemand: Detailed data loaded', results);
                
                // Step 4: Enhance with detailed data when ready
                enhanceLobbyCharacterWithDetails(scene);
            }).catch(error => {
                console.error('SpawnLobbyCharacterWithLoadOnDemand: Error loading detailed data:', error);
            });
        }).catch(error => {
            console.error('SpawnLobbyCharacterWithLoadOnDemand: Error loading basic assets:', error);
            // Fallback to basic implementation
            SpawnLobbyCharacter(scene);
        });
}

// ✅ NEW: Render basic lobby character
function renderBasicLobbyCharacter(scene) {
    console.log('renderBasicLobbyCharacter: Rendering with basic data');
    
    // Use existing SpawnLobbyCharacter but with basic data only
    SpawnLobbyCharacter(scene);
}

// ✅ NEW: Enhance lobby character with details
function enhanceLobbyCharacterWithDetails(scene) {
    console.log('enhanceLobbyCharacterWithDetails: Enhancing with detailed data');
    
    // Update character UI with detailed data
    centerData.EmitUnlockedPlayerChange();
}

// ✅ NEW: Smooth character switching with Load On Demand
function SwitchCharacterSeamlessly(scene, direction) {
    console.log('SwitchCharacterSeamlessly: Switching character', direction);
    
    const currentIndex = centerData.selectedPlayerLocalIndex || 0;
    let nextIndex;
    
    if (direction === 'next') {
        nextIndex = (currentIndex + 1) % centerData.selectedPlayerArr.length;
    } else {
        nextIndex = (currentIndex - 1 + centerData.selectedPlayerArr.length) % centerData.selectedPlayerArr.length;
    }
    
    centerData.selectedPlayerLocalIndex = nextIndex;
    const nextCharacterId = centerData.selectedPlayerArr[nextIndex];
    
    if (!centerData.isCharacterFullyLoaded(nextCharacterId)) {
        // Show subtle loading indicator during transition
        showTransitionLoading(scene);
        
        // Load details mid-transition
        centerData.loadFullCharacterData(nextCharacterId)
            .then(() => {
                performCharacterSwitch(scene, direction, nextIndex);
                hideTransitionLoading(scene);
            })
            .catch(error => {
                console.error('SwitchCharacterSeamlessly: Error loading character', error);
                hideTransitionLoading(scene);
                // Still perform switch with basic data
                performCharacterSwitch(scene, direction, nextIndex);
            });
    } else {
        // Direct switch if already loaded
        performCharacterSwitch(scene, direction, nextIndex);
    }
}

// ✅ NEW: Show transition loading
function showTransitionLoading(scene) {
    console.log('showTransitionLoading: Showing transition loading');
    // Add subtle loading indicator during character switch
    if (!scene.transitionLoading) {
        scene.transitionLoading = scene.add.text(
            540, 960, 'Loading...',
            {
                fontFamily: 'Russo One',
                fontSize: '24px',
                fill: '#ffffff',
                align: 'center'
            }
        ).setOrigin(0.5);
    } else {
        scene.transitionLoading.setVisible(true);
    }
}

// ✅ NEW: Hide transition loading
function hideTransitionLoading(scene) {
    console.log('hideTransitionLoading: Hiding transition loading');
    // Hide loading indicator
    if (scene.transitionLoading) {
        scene.transitionLoading.setVisible(false);
    }
}

// ✅ NEW: Perform character switch
function performCharacterSwitch(scene, direction, nextIndex) {
    console.log('performCharacterSwitch: Performing character switch', direction, nextIndex);
    
    // Use existing character switching logic
    if (direction === 'next') {
        NextCharacter(scene);
    } else if (direction === 'prev') {
        PrevCharacter(scene);
    }
}
