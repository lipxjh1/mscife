import centerData from "../../../Data/CenterData.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";

import {
    CreateCharacterRewardPopup,
    CreateMultiCharacterRewardPopup,
} from "../../Share/PopupReward.js";

import {
    container_gacha,
    box_ticket_quantity,
    SetSpining,
    SetOutSpining,
    BuyTicketCharacter,
} from "./HomeGacha.js";

let container_0 = null;

let spinNum = 0;
let currentSpin = 0;

let numberPerSpin = 1;

let buttonSpin = null;
let buttonSpinX10 = null;

let arr_char_Data = {
    anna: { imgKey: "home_gacha_char_anna" },
    julia: { imgKey: "home_gacha_char_julia" },
    fiona: { imgKey: "home_gacha_char_fiona" },
    david: { imgKey: "home_gacha_char_david" },
    henry: { imgKey: "home_gacha_char_henry" },
    marcus: { imgKey: "home_gacha_char_marcus" },
    victoria: { imgKey: "home_gacha_char_victoria" },
    elizabeth: { imgKey: "home_gacha_char_elizabeth" },
    alexandra: { imgKey: "home_gacha_char_alexandra" },
    akane: { imgKey: "home_gacha_char_akane" },
    alice: { imgKey: "home_gacha_char_alice" },
    caitlyn: { imgKey: "home_gacha_char_caitlyn" },
};

export function CreateGachaCharacter(scene) {
    Destroy();

    container_0 = scene.add.container(0, 0);
    container_gacha.add(container_0);
    container_0.setDepth(0);

    // const img_title = scene.add
    //     .image(540, 1354, "home_gacha_title")
    //     .setOrigin(0.5, 0);
    // container_gacha.add(img_title);

    const items = [];

    // Lấy tất cả các key (tên nhân vật)
    let keys = Object.keys(arr_char_Data);

    for (let i = 0; i < 21; i++) {
        // Chọn ngẫu nhiên một key
        let randomKey = keys[Math.floor(Math.random() * keys.length)];

        // Lấy phần tử ngẫu nhiên từ arr_char_Data
        let randomCharacter = arr_char_Data[randomKey];

        const newItem = {
            itemId: randomKey,
        };

        items.push(newItem);
    }

    CreateGachaList(scene, items);

    GachaListIdleMove(scene, container_gacha_list.gridTable);

    centerData.RequestInventory();

    CreateSpinButtons(scene);
}

function CreateSpinButtons(scene) {
    buttonSpin = CreateSpinButton(scene, {
        x: 270,
        y: 1645 + 183 / 2,
        text: "Recruit",
        onPointerDown: () => {
            let spinDuration = 6500;

            if (box_ticket_quantity > 0) {
                reward_data = null;
                rewardDataArr = [];

                numberPerSpin = 1;

                Spin(scene, 1);

                if (buttonSpin) {
                    buttonSpin.btn_spin.disableInteractive();
                }
                if (buttonSpinX10) {
                    buttonSpinX10.btn_spin.disableInteractive();
                }

                SetSpining();

                scene.time.delayedCall(spinDuration, () => {
                    if (buttonSpin) {
                        buttonSpin.btn_spin.setInteractive();
                    }
                    if (buttonSpinX10) {
                        buttonSpinX10.btn_spin.setInteractive();
                    }

                    SetOutSpining();
                });
            } else if (box_ticket_quantity === 0) {
                CreateAlertPopup(
                    scene,
                    cdLocalization.getLocalization(
                        cdLocalization.GROUP_KEYS.HomeGacha.KEY,
                        "Buy more character tickets?"
                    ),
                    () => {
                        BuyTicketCharacter(scene);
                    },
                    () => {}
                );
            }
        },
    });

    buttonSpinX10 = CreateSpinButton(scene, {
        x: 810,
        y: 1645 + 183 / 2,
        text:
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeGacha.KEY,
                "Recruit"
            ) + " X10",
        onPointerDown: () => {
            let spinDuration = 6500;

            if (box_ticket_quantity >= 10) {
                reward_data = null;
                rewardDataArr = [];

                numberPerSpin = 10;

                Spin(scene, 1);

                if (buttonSpin) {
                    buttonSpin.btn_spin.disableInteractive();
                }
                if (buttonSpinX10) {
                    buttonSpinX10.btn_spin.disableInteractive();
                }

                SetSpining();

                scene.time.delayedCall(spinDuration, () => {
                    if (buttonSpin) {
                        buttonSpin.btn_spin.setInteractive();
                    }
                    if (buttonSpinX10) {
                        buttonSpinX10.btn_spin.setInteractive();
                    }

                    SetOutSpining();
                });
            } else if (box_ticket_quantity === 0) {
                CreateAlertPopup(
                    scene,
                    cdLocalization.getLocalization(
                        cdLocalization.GROUP_KEYS.HomeGacha.KEY,
                        "Buy more character tickets?"
                    ),
                    () => {
                        BuyTicketCharacter(scene);
                    },
                    () => {}
                );
            }
        },
    });
}

function CreateSpinButton(scene, options) {
    let btnWidth = 441;
    let btnHeight = 183;

    const btn_container = scene.add.container(options.x, options.y);
    container_0.add(btn_container);

    const btn_inner_container = scene.add.container(
        -btnWidth / 2,
        -btnHeight / 2
    );
    btn_container.add(btn_inner_container);

    btn_container.btn_spin = scene.add
        .image(0, 0, "home_gacha_btn_recuit_1")
        .setOrigin(0, 0)
        .setInteractive({ useHandCursor: true }) // Thiết lập tương tác và đổi thành hình bàn tay khi hover
        .on("pointerdown", function () {
            options.onPointerDown?.();
        })
        .on("pointerover", function () {
            //console.log("spin over");

            scene.tweens.add({
                targets: btn_container,
                scaleX: 1.2, // Phóng to 20% theo chiều ngang
                scaleY: 1.2, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        })
        .on("pointerout", function () {
            //console.log("spin out");

            scene.tweens.add({
                targets: btn_container,
                scaleX: 1, // Phóng to 20% theo chiều ngang
                scaleY: 1, // Phóng to 20% theo chiều dọc
                duration: 100, // Thời gian hiệu ứng (ms)
                ease: "Power2",
            });
        });

    btn_inner_container.add(btn_container.btn_spin);

    btn_container.text = scene.add
        .text(
            btnWidth / 2,
            68,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.HomeGacha.KEY,
                options.text
            ),
            {
                fontFamily: cdLocalization.getCurrentFont(), // Font-family
                fontSize: "48px", // Font-size
                color: "#3D3D3D", // Màu chữ (color)
                align: "center",
            }
        )
        .setOrigin(0.5, 1);

    btn_inner_container.add(btn_container.text);
}

let reward_data = null;
let rewardDataArr = [];
export function Spin(scene, spinRound) {
    // console.log("Spin");
    // console.log("spinNum", spinNum);
    // console.log("currentSpin", currentSpin);

    if (spinNum > 0) {
        return;
    }

    spinNum = spinRound;

    // console.log("Spin box");

    CreateLoadingPopup();

    if (numberPerSpin == 1) {
        centerData.RequestOpenBox(
            "BOX_NFT_CHARACTER",
            (result) => {
                HideLoadingPopup();

                reward_data = result.data;
                //spinNum = reward_data.length;
                spinNum = 1;
                currentSpin = 0;

                //console.log("Request spin done: ", result);

                centerData.RequestInventory();

                DoSpinGacha(scene, reward_data.code);
            },
            (error) => {
                HideLoadingPopup();

                //console.log("RequestSpin thất bại:", error);

                CreateAlertPopup(scene, `Spin failed:\n${error}`);
            }
        );
    } else if (numberPerSpin == 10) {
        centerData.RequestOpenMultiBox(
            "BOX_NFT_CHARACTER",
            numberPerSpin,
            (result) => {
                HideLoadingPopup();

                rewardDataArr = [];
                for (let i = 0; i < result.results.length; i++) {
                    rewardDataArr.push(result.results[i].data);
                }

                //spinNum = reward_data.length;
                spinNum = 1;
                currentSpin = 0;

                //console.log("Request spin done: ", result);

                centerData.RequestInventory();

                DoSpinGacha(scene, rewardDataArr[0].code);
            },
            (error) => {
                HideLoadingPopup();

                //console.log("RequestSpin thất bại:", error);

                CreateAlertPopup(scene, `Spin failed:\n${error}`);
            }
        );
    }
}

function DoSpinGacha(scene, itemCode) {
    //console.log("itemCode:", itemCode);
    //console.log("arr_char_Data[itemCode]:", arr_char_Data[itemCode]);

    gachaIdleMove.remove();

    const items = [];

    // Lấy tất cả các key (tên nhân vật)
    let keys = Object.keys(arr_char_Data);

    for (let i = 0; i < 21; i++) {
        if (i != 19) {
            // Chọn ngẫu nhiên một key
            let randomKey = keys[Math.floor(Math.random() * keys.length)];

            // Lấy phần tử ngẫu nhiên từ arr_char_Data
            let randomCharacter = arr_char_Data[randomKey];

            const newItem = {
                itemId: randomKey,
            };

            items.push(newItem);
        } else {
            const newItem = {
                itemId: itemCode,
            };

            items.push(newItem);
        }
    }

    CreateGachaList(scene, items);

    let scrollValPerItem = 1 / items.length;

    let selectedIndex = items.length - 1;

    let scrollToValue =
        scrollValPerItem * (0.5 * 2 + 0.125) + scrollValPerItem * selectedIndex;

    let spinDuration = 6000;

    let spinNumber = 3;

    scrollToTarget(
        scene,
        scrollToValue,
        spinDuration,
        spinNumber,
        container_gacha_list.gridTable
    );

    scene.time.delayedCall(spinDuration, () => {
        let selectedCell = getCellContainer(container_gacha_list.gridTable);

        selectedCell.containerCard.setSelected();

        spinNum = 0;
        currentSpin = 0;

        if (rewardDataArr == null || rewardDataArr.length <= 0) {
            //console.log("reward_data:", reward_data.length);

            CreateCharacterRewardPopup(
                scene,
                reward_data._id,
                reward_data.code,
                reward_data.name,
                reward_data.role,
                reward_data.rank,
                reward_data.level,
                reward_data.star
            );
        } else {
            CreateMultiCharacterRewardPopup(scene, rewardDataArr);
        }
    });

    // if (active_btn_close_delay) {
    //     active_btn_close_delay.remove();
    // }

    // active_btn_close_delay = scene.time.delayedCall(spinDuration + 2000, () => {
    //     container_gacha.btn_close.setVisible(true);
    //     container_gacha.btn_close.setInteractive();

    //     currentSpin++;

    //     if (currentSpin >= spinNum) {
    //         spinNum = 0;
    //         currentSpin = 0;

    //         CreateCharacterClaimPopup(
    //             scene,
    //             reward_data.code,
    //             reward_data.name,
    //             reward_data.role,
    //             reward_data.rank,
    //             reward_data.level,
    //             reward_data.star
    //         );
    //     } else {
    //         DoSpinGacha(scene, reward_data[currentSpin]);
    //     }
    // });
}

export function Destroy(scene) {
    if (gachaIdleMove) {
        gachaIdleMove.remove();
    }

    if (container_0) {
        container_0.destroy();
    }
}

//kết thúc tạo top bar bg

//Tạo quay gacha

let container_gacha_list = null;

function CreateGachaList(scene, arrItemData) {
    if (container_gacha_list) {
        container_gacha_list.destroy();
    }

    container_gacha_list = scene.add.container(0, 0);
    container_0.add(container_gacha_list);

    // Tạo bảng gridTable và gán các item vào

    const posX = 540;

    const posY = 352 + 923 / 2 + 50;

    const scrollViewWidth = (395 + 60) * 3;

    const scrollViewHeight = 923 + 200;

    const space = 60;

    // const scrollBG = scene.rexUI.add.roundRectangle(
    //   posX,
    //   posY,
    //   scrollViewWidth,
    //   scrollViewHeight,
    //   0,
    //   0x000000
    // );
    // container_gacha_list.add(scrollBG);

    const gridTable = scene.rexUI.add
        .gridTable({
            x: posX,
            y: posY,
            width: scrollViewWidth,
            height: scrollViewHeight,
            scrollMode: 1,

            table: {
                cellWidth: 395 + space,
                cellHeight: 923,
                columns: arrItemData.length,
                rows: 1,
                //reuseCellContainer: true, // Kích hoạt tái sử dụng cell container
            },

            scroller: false,
            slider: false,

            items: arrItemData, // Gán danh sách item vào gridTable

            createCellContainerCallback: (cell, cellContainer) => {
                var scene = cell.scene,
                    width = cell.width,
                    height = cell.height,
                    item = cell.item,
                    index = cell.index;
                if (cellContainer === null) {
                    cellContainer = scene.rexUI.add.label({
                        width: 395,
                        height: 923,
                        orientation: 0,
                    });
                } else {
                    //console.log(cell.index + ": reuse cell-container");
                }

                // Tạo và thêm `card_Item` vào `cellContainer`
                const card = card_item_gacha(scene, index, item);
                cellContainer.add(card); // Thêm card vào cellContainer

                // Lưu `container_card` vào cellContainer để truy xuất sau
                cellContainer.containerCard = card;

                return cellContainer;
            },
        })
        .setDepth(0)
        .layout();

    container_gacha_list.gridTable = gridTable;
    container_gacha_list.add(gridTable);

    // const maskShape = scene.add
    //   .rectangle(
    //     posX,
    //     463 + 1457 / 2 + 36 * 3,
    //     scrollViewWidth,
    //     scrollViewHeight,
    //     0x000000
    //   )
    //   .setVisible(false);

    // const mask = new Phaser.Display.Masks.GeometryMask(scene, maskShape);
    // gridTable.setMask(mask);
}

function card_item_gacha(scene, i, item) {
    //console.log("Item = ", item.itemId);

    const container_card = scene.add.container(0, 0);

    const container_tween = scene.add.container(
        70 + 395 / 2,
        (923 + 200) / 2 - 923 / 2
    );
    container_card.add(container_tween);

    const container_true = scene.add.container(
        -395 / 2,
        -(923 + 200) / 2 + 100
    );
    container_tween.add(container_true);

    // const tweenOrigin = scene.rexUI.add
    //   .roundRectangle(0, 0, 10, 10, 0, 0xff0000)
    //   .setOrigin(0.5, 0.5);

    // container_tween.add(tweenOrigin);

    // const item_bg = scene.rexUI.add
    //   .roundRectangle(0, 0, 395, 923, 0, 0xffffff)
    //   .setOrigin(0, 0);

    // container_true.add(item_bg);

    // const trueOrigin = scene.rexUI.add
    //   .roundRectangle(0, 0, 10, 10, 0, 0x007fff)
    //   .setOrigin(0.5, 0.5);

    // container_true.add(trueOrigin);

    //console.log("gacha item ", item);

    let itemLocalData = arr_char_Data[item.itemId];

    if (itemLocalData && itemLocalData.imgKey !== "") {
        const item_icon = scene.add
            .image(395 / 2, 923 / 2, itemLocalData.imgKey)
            .setOrigin(0.5, 0.5);
        container_true.add(item_icon);
    } else {
        const img = scene.add.rectangle(395 / 2, 923 / 2, 395, 923, 0x000000);
        container_true.add(img);

        const text_id = scene.add
            .text(395 / 2, 923 / 2, item.itemId, {
                fontFamily: "Russo One",
                fontSize: "80px",
                color: "#ffffff",
                align: "center",
            })
            .setOrigin(0.5, 0.5);
        container_true.add(text_id);
    }

    container_card.setSelected = function () {
        scene.tweens.add({
            targets: container_tween,
            scaleX: 1.1, // Giá trị scale mục tiêu cho chiều ngang
            scaleY: 1.1, // Giá trị scale mục tiêu cho chiều dọc
            duration: 1000, // Thời gian tween là 1 giây (1000 ms)
            ease: "Linear", // Dễ dàng chuyển động tuyến tính
        });
    };

    return container_card;
}

function getCellContainer(gridTable) {
    const itemCount = gridTable.items.length;

    let activeCells = [];

    for (let i = 0; i < itemCount; i++) {
        const cellContainer = gridTable.getCellContainer(i);
        if (cellContainer) {
            activeCells.push(cellContainer);

            //console.log(`CellContainer at index ${i}:`, cellContainer);
        } else {
            //console.warn(`No CellContainer found at index ${i}`);
        }
    }

    if (activeCells.length > 0) {
        return activeCells[Math.floor(activeCells.length / 2)];
    }

    return null;
}

let gachaIdleMove = null;
function GachaListIdleMove(scene, gridTable) {
    let startTime = scene.time.now;

    let duration = 120000;

    let tweenValue = 0;

    // Tạo sự kiện và lưu tham chiếu vào biến
    gachaIdleMove = scene.time.addEvent({
        delay: 16, // Cập nhật mỗi 16 ms (khoảng 60 FPS)
        loop: true,
        callback: () => {
            const elapsed = scene.time.now - startTime;
            tweenValue = Phaser.Math.Clamp(elapsed / duration, 0, 1);

            if (tweenValue >= 1) {
                tweenValue = 0;
                startTime = scene.time.now;
            }

            gridTable.setT(tweenValue);
        },
    });

    // // Khi muốn hủy sự kiện, chỉ cần gọi remove:
    // gachaIdleMove.remove();
}

// Cuộn đến giá trị t = 0.75 trong 3 giây với tốc độ giảm dần
function scrollToTarget(scene, targetT, duration, spinNumber, gridTable) {
    //console.log("scrollToTarget:");

    let spinTimePerRound = duration / spinNumber;

    let count = 0;

    function ScrollLoop() {
        //console.log("ScrollLoop");

        gridTable.setT(0);

        const startT = gridTable.t;
        const distance = targetT - startT;
        const startTime = scene.time.now;

        const scrollEvent = scene.time.addEvent({
            delay: 16,
            callback: () => {
                const elapsedTime = scene.time.now - startTime;
                const normalizedTime = Phaser.Math.Clamp(
                    elapsedTime / spinTimePerRound,
                    0,
                    1
                );

                const currentT = normalizedTime;

                gridTable.setT(currentT);

                // Dừng khi hoàn tất
                if (normalizedTime >= 1) {
                    scrollEvent.remove();
                }
            },
            loop: true,
        });
    }

    function ScrollFinal() {
        //console.log("ScrollFinal");

        gridTable.setT(0);

        const startT = gridTable.t;
        const distance = targetT - startT;
        const startTime = scene.time.now;

        // Hàm easing cho chuyển động chậm dần (ease out)
        function easeOutQuad(t) {
            return t * (2 - t);
        }

        const scrollEvent = scene.time.addEvent({
            delay: 16,
            callback: () => {
                const elapsedTime = scene.time.now - startTime;
                const normalizedTime = Phaser.Math.Clamp(
                    elapsedTime / spinTimePerRound,
                    0,
                    1
                );

                // Áp dụng easing để cuộn chậm dần
                const easedProgress = easeOutQuad(normalizedTime);
                const currentT = startT + distance * easedProgress;

                gridTable.setT(currentT);

                // Dừng khi hoàn tất
                if (normalizedTime >= 1) {
                    scrollEvent.remove();
                }
            },
            loop: true,
        });
    }

    //Do spin

    if (spinNumber - 1 > 0) {
        ScrollLoop(scene);
        count++;

        scene.time.addEvent({
            delay: spinTimePerRound, // Thời gian delay (1 giây = 1000ms)
            callback: () => {
                count++;
                //console.log(`Lần lặp thứ ${count}`);

                if (count === spinNumber) {
                    ScrollFinal(scene);
                } else {
                    ScrollLoop(scene);
                }
            },
            repeat: spinNumber - 2, // Số lần lặp thêm sau lần đầu tiên (2 + 1 = 3 lần chạy)
        });
    } else {
        ScrollFinal(scene);
    }
}
