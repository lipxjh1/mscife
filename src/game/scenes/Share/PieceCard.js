import centerData from "../../Data/CenterData";
import centerDataPlayer from "../../Data/CenterDataPlayer.js";
import centerDataItem from "../../Data/CenterDataItem.js";

export function CreatePieceCard(
    scene,
    _id,
    code,
    piece1,
    piece2,
    piece3,
    piece4
) {
    //console.log("Item = ", item);

    const container_card = scene.add.container(0, 0);

    container_card._id = _id;
    container_card.code = code;

    const container_card_inner = scene.add.container(-512 / 2, -512 / 2);
    container_card.add(container_card_inner);

    let img_key = centerDataItem.getItemById(code).imgKey;

    let img_pos = { x: 0, y: 0 };

    let outLineWidth = 2;

    const outline_0 = scene.rexUI.add
        .roundRectangle(
            img_pos.x - outLineWidth / 2,
            img_pos.y - outLineWidth / 2,
            512 + outLineWidth,
            512 + outLineWidth,
            4,
            0xffffff
        )
        .setOrigin(0, 0);
    container_card_inner.add(outline_0);

    const outline_1 = scene.rexUI.add
        .roundRectangle(
            img_pos.x + outLineWidth / 2,
            img_pos.y + outLineWidth / 2,
            512 - outLineWidth,
            512 - outLineWidth,
            4,
            0x000000
        )
        .setOrigin(0, 0);
    container_card_inner.add(outline_1);

    const item_img = scene.add
        .image(img_pos.x, img_pos.y, img_key)
        .setOrigin(0, 0);
    container_card_inner.add(item_img);

    if (piece1 == 0) {
        let lock_img = scene.rexUI.add.roundRectangle(
            512 / 4,
            512 / 4,
            512 / 2,
            512 / 2,
            0,
            0x000000,
            0.5
        );
        container_card_inner.add(lock_img);
    }

    if (piece2 == 0) {
        let lock_img = scene.rexUI.add.roundRectangle(
            512 / 4 + (512 / 4) * 2,
            512 / 4,
            512 / 2,
            512 / 2,
            0,
            0x000000,
            0.5
        );
        container_card_inner.add(lock_img);
    }

    if (piece3 == 0) {
        let lock_img = scene.rexUI.add.roundRectangle(
            512 / 4,
            512 / 4 + (512 / 4) * 2,
            512 / 2,
            512 / 2,
            0,
            0x000000,
            0.5
        );
        container_card_inner.add(lock_img);
    }

    if (piece4 == 0) {
        let lock_img = scene.rexUI.add.roundRectangle(
            512 / 4 + (512 / 4) * 2,
            512 / 4 + (512 / 4) * 2,
            512 / 2,
            512 / 2,
            0,
            0x000000,
            0.5
        );
        container_card_inner.add(lock_img);
    }

    return container_card;
}
