import centerData from "../../Data/CenterData";
import centerDataPlayer from "../../Data/CenterDataPlayer.js";
import centerDataItem from "../../Data/CenterDataItem.js";

import { AssetLoadingManager } from "../AssetLoadingManager.js";

import { AssetPlayerLoadingManager } from "../AssetPlayerLoadingManager.js";

export function GetFrame_0_ByRank(rankType) {
    let imgKey = "";

    if (rankType != null && rankType !== "") {
        if (
            rankType == centerDataPlayer.RANK_KEY.sc.KEY ||
            rankType == centerDataPlayer.RANK_KEY.sb.KEY ||
            rankType == centerDataPlayer.RANK_KEY.sa.KEY
        ) {
            rankType = centerDataPlayer.RANK_KEY.s.KEY;
        }
    }

    if (rankType != null && rankType !== "") {
        imgKey = "share_character_card_frame_0_" + rankType;
    } else {
        imgKey = "share_character_card_frame_0_c";
    }

    return imgKey;
}

export function GetFrame_1_ByRank(rankType) {
    let imgKey = "";

    if (rankType != null && rankType !== "") {
        if (
            rankType == centerDataPlayer.RANK_KEY.sc.KEY ||
            rankType == centerDataPlayer.RANK_KEY.sb.KEY ||
            rankType == centerDataPlayer.RANK_KEY.sa.KEY
        ) {
            rankType = centerDataPlayer.RANK_KEY.s.KEY;
        }
    }

    if (rankType != null && rankType !== "") {
        imgKey = "share_character_card_frame_1_" + rankType;
    } else {
        imgKey = "share_character_card_frame_1_c";
    }

    return imgKey;
}

export function GetRoleIcon(roleType, rankType) {
    //console.log("roleType: ", roleType);

    let imgKey = "";

    if (rankType != null && rankType !== "") {
        if (
            rankType == centerDataPlayer.RANK_KEY.sc.KEY ||
            rankType == centerDataPlayer.RANK_KEY.sb.KEY ||
            rankType == centerDataPlayer.RANK_KEY.sa.KEY
        ) {
            rankType = centerDataPlayer.RANK_KEY.s.KEY;
        }
    }

    switch (roleType) {
        case "gunner":
            imgKey = "share_character_card_role_gunner";

            if (rankType != null && rankType !== "") {
                imgKey = "share_character_card_role_gunner_" + rankType;
            }

            break;
        case "sniper":
            imgKey = "share_character_card_role_sniper";

            if (rankType != null && rankType !== "") {
                imgKey = "share_character_card_role_sniper_" + rankType;
            }

            break;
        case "rocket":
            imgKey = "share_character_card_role_rocket";

            if (rankType != null && rankType !== "") {
                imgKey = "share_character_card_role_rocket_" + rankType;
            }

            break;
    }

    return imgKey;
}

export function CreateCharacterCard(
    scene,
    _id = "",
    code = "",
    name = "",
    role = "",
    rank = "",
    level = 1,
    star = 1
) {
    const container_card = scene.add.container(0, 0);

    container_card._id = _id;
    container_card.code = code;
    container_card.name = name;
    container_card.role = role;
    container_card.rank = rank;
    container_card.level = level;
    container_card.star = star;
    container_card.characterLocalData = centerDataPlayer.getPlayerById(
        container_card.code
    );

    container_card.container_card_inner = scene.add.container(
        -319 / 2,
        -444 / 2
    );
    container_card.add(container_card.container_card_inner);

    // console.log("code: ", container_card.code);
    // console.log("level: ", container_card.level);
    // console.log("playerData: ", container_card.characterLocalData);

    // const item_bg = scene.rexUI.add.roundRectangle(
    //   0,
    //   0,
    //   340,
    //   470,
    //   0,
    //   0x000000,
    //   1
    // );
    // container_card.add(item_bg);

    const background = scene.add
        .image(0, 0, "share_character_card_bg")
        .setOrigin(0, 0);
    container_card.container_card_inner.add(background);
    container_card.background = background;

    if (container_card.characterLocalData) {
        const avatar = scene.add
            .image(
                319 / 2,
                384,
                container_card.characterLocalData.cardImgInventoryKey
            )
            .setOrigin(0.5, 1);
        container_card.container_card_inner.add(avatar);
    } else {
        const text_id = scene.add
            .text(319 / 2, 444 / 2, container_card.code, {
                fontFamily: "Russo One",
                fontSize: "80px",
                color: "#ffffff",
                align: "center",
            })
            .setOrigin(0.5, 0.5);
        container_card.container_card_inner.add(text_id);
    }

    const frame_0 = scene.add
        .image(0, 0, GetFrame_0_ByRank(container_card.rank))
        .setOrigin(0, 0);
    container_card.container_card_inner.add(frame_0);

    if (container_card.role != "") {
        const role_icon = scene.add
            .image(
                197,
                259,
                GetRoleIcon(container_card.role, container_card.rank)
            )
            .setOrigin(0, 0);
        container_card.container_card_inner.add(role_icon);
    }

    if (container_card.rank != "") {
        const frame_1 = scene.add
            .image(0, 0, GetFrame_1_ByRank(container_card.rank))
            .setOrigin(0, 0);
        container_card.container_card_inner.add(frame_1);
    }

    if (container_card.level > 0) {
        const text_level_0 = scene.add
            .text(7, 350, "Lv.", {
                fontFamily: "Russo One",
                fontSize: "23px",
                color: "#ffffff",
                align: "left",
                strokeThickness: 1,
                shadow: {
                    offsetX: 2,
                    offsetY: 4,
                    color: "#000000",
                    blur: 0,
                    stroke: true,
                    fill: true,
                },
            })
            .setOrigin(0, 1);

        container_card.container_card_inner.add(text_level_0);

        const text_level_1 = scene.add
            .text(44, 350, container_card.level, {
                fontFamily: "Russo One",
                fontSize: "60px",
                color: "#ffffff",
                align: "left",
                strokeThickness: 1,
                shadow: {
                    offsetX: 2,
                    offsetY: 4,
                    color: "#000000",
                    blur: 0,
                    stroke: true,
                    fill: true,
                },
            })
            .setOrigin(0, 1);

        container_card.container_card_inner.add(text_level_1);
    }

    if (container_card.star > 0) {
        let posX = 319;
        let posY = 328;

        for (let i = 0; i < container_card.star; i++) {
            const img_star = scene.add
                .image(posX, posY, "share_character_card_star")
                .setOrigin(1, 0);
            container_card.container_card_inner.add(img_star);

            posX -= 55 / 2 + 5;
        }
    }

    const name_bg = scene.add
        .image(0, 0, "share_character_card_name_bg")
        .setOrigin(0, 0);
    container_card.container_card_inner.add(name_bg);

    if (container_card.name != "") {
        const text_name = scene.add
            .text(319 / 2, 396 + 36, container_card.name, {
                fontFamily: "Russo One",
                fontSize: "36px",
                color: "#ffffff",
                align: "center",
                wordWrap: { width: 236, useAdvancedWrap: true },
                stroke: "#000000",
                strokeThickness: 1,
                shadow: {
                    offsetX: 2,
                    offsetY: 4,
                    color: "#000000",
                    blur: 0,
                    stroke: true,
                    fill: true,
                },
            })
            .setOrigin(0.5, 1);

        container_card.container_card_inner.add(text_name);
    }

    const tick_selected = scene.add
        .image(253, 0, "share_character_card_tick_selected")
        .setOrigin(0, 0);
    container_card.container_card_inner.add(tick_selected);

    container_card.setSelected = function () {
        name_bg.setTint(0x2ead00);

        tick_selected.setAlpha(1);
    };

    container_card.setUnselected = function () {
        name_bg.setTint(0x3d3d40);

        tick_selected.setAlpha(0);
    };

    container_card.setUnselected();

    // const origin = scene.add.rectangle(0, 0, 50, 50, 0xffffff);

    // container_card.add(origin);

    return container_card;
}
