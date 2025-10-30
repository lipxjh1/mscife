import centerData from "./CenterData.js";
import DataPlayer from "./DataPlayer.js";

export class CenterDataPlayer {
    constructor() {
        this.ROLE_KEY = {
            gunner: {
                KEY: "gunner",
            },
            sniper: {
                KEY: "sniper",
            },
            rocket: {
                KEY: "rocket",
            },
        };

        this.RANK_KEY = {
            c: {
                KEY: "c",
            },
            b: {
                KEY: "b",
            },
            a: {
                KEY: "a",
            },
            s: {
                KEY: "s",
            },
            sc: {
                KEY: "sc",
            },
            sb: {
                KEY: "sb",
            },
            sa: {
                KEY: "sa",
            },
        };

        this.CODE_KEY = {
            david: {
                KEY: "david",
            },
            davidsc: {
                KEY: "davidsc",
            },
            henry: {
                KEY: "henry",
            },
            henrysc: {
                KEY: "henrysc",
            },
            marcus: {
                KEY: "marcus",
            },
            marcussc: {
                KEY: "marcussc",
            },
            anna: {
                KEY: "anna",
            },
            annasb: {
                KEY: "annasb",
            },
            julia: {
                KEY: "julia",
            },
            juliasb: {
                KEY: "juliasb",
            },
            fiona: {
                KEY: "fiona",
            },
            fionasb: {
                KEY: "fionasb",
            },
            victoria: {
                KEY: "victoria",
            },
            victoriasa: {
                KEY: "victoriasa",
            },
            elizabeth: {
                KEY: "elizabeth",
            },
            elizabethsa: {
                KEY: "elizabethsa",
            },
            alexandra: {
                KEY: "alexandra",
            },
            alexandrasa: {
                KEY: "alexandrasa",
            },
            akane: {
                KEY: "akane",
            },
            alice: {
                KEY: "alice",
            },
            caitlyn: {
                KEY: "caitlyn",
            },
        };

        this.dataPlayerDictionary = {};

        // console.log("CenterDataPlayer");

        // Gọi hàm tạo dữ liệu ngay khi khởi tạo
        this.CreateDataPlayer();

        this.selectedPlayerTestArr = [
            this.CODE_KEY.david.KEY,
            this.CODE_KEY.henry.KEY,
            this.CODE_KEY.marcus.KEY,
        ];

        this.playTestPlayer = {};

        this.playTestStarPlayer = {};

        this.avoidRankToUpStar = [
            this.RANK_KEY.sc.KEY,
            this.RANK_KEY.sb.KEY,
            this.RANK_KEY.sa.KEY,
        ];
    }

    // Phương thức lấy phần tử từ dictionary theo id
    getPlayerById(id) {
        //console.log("Looking for player with id:", id);
        //console.log("Current dictionary:", this.dataPlayerDictionary);
        return this.dataPlayerDictionary[id] || null;
    }

    getTrueLevel(level) {
        let remainingLevel = level % 15;

        if (remainingLevel == 0) {
            remainingLevel = 1;
        }

        return remainingLevel;
    }

    // getStar(level) {
    //     let stars = Math.floor(level / 15);
    //     return stars;
    // }

    CreateDataPlayer() {
        this.Create_Player_David();
        this.Create_Player_DavidSC();

        this.Create_Player_Henry();
        this.Create_Player_HenrySC();

        this.Create_Player_Marcus();
        this.Create_Player_MarcusSC();

        this.Create_Player_Anna();
        this.Create_Player_AnnaSB();
        this.Create_Player_Julia();
        this.Create_Player_JuliaSB();
        this.Create_Player_Fiona();
        this.Create_Player_FionaSB();

        this.Create_Player_Victoria();
        this.Create_Player_VictoriaSA();
        this.Create_Player_Elizabeth();
        this.Create_Player_ElizabethSA();
        this.Create_Player_Alexandra();
        this.Create_Player_AlexandraSA();

        this.Create_Player_Akane();
        this.Create_Player_Alice();
        this.Create_Player_Caitlyn();
    }

    Create_Player_David() {
        let newDataPlayer = new DataPlayer();

        newDataPlayer.playerId = this.CODE_KEY.david.KEY;
        newDataPlayer.spineUIKey = "david_spine_ui";
        newDataPlayer.spineGameplayKey = "david_spine_gameplay";
        newDataPlayer.cardImgInventoryKey = "david_ui_card_inventory";

        // Đẩy vào dictionary với khóa là id
        this.dataPlayerDictionary[newDataPlayer.playerId] = newDataPlayer;
    }

    Create_Player_DavidSC() {
        let newDataPlayer = new DataPlayer();

        newDataPlayer.playerId = this.CODE_KEY.davidsc.KEY;
        newDataPlayer.spineUIKey = "davidsc_spine_ui";
        newDataPlayer.spineGameplayKey = "davidsc_spine_gameplay";
        newDataPlayer.cardImgInventoryKey = "davidsc_ui_card_inventory";

        // Đẩy vào dictionary với khóa là id
        this.dataPlayerDictionary[newDataPlayer.playerId] = newDataPlayer;
    }

    Create_Player_Henry() {
        let newDataPlayer = new DataPlayer();

        newDataPlayer.playerId = this.CODE_KEY.henry.KEY;
        newDataPlayer.spineUIKey = "henry_spine_ui";
        newDataPlayer.spineGameplayKey = "henry_spine_gameplay";
        newDataPlayer.cardImgInventoryKey = "henry_ui_card_inventory";

        // Đẩy vào dictionary với khóa là id
        this.dataPlayerDictionary[newDataPlayer.playerId] = newDataPlayer;
    }

    Create_Player_HenrySC() {
        let newDataPlayer = new DataPlayer();

        newDataPlayer.playerId = this.CODE_KEY.henrysc.KEY;
        newDataPlayer.spineUIKey = "henrysc_spine_ui";
        newDataPlayer.spineGameplayKey = "henrysc_spine_gameplay";
        newDataPlayer.cardImgInventoryKey = "henrysc_ui_card_inventory";

        // Đẩy vào dictionary với khóa là id
        this.dataPlayerDictionary[newDataPlayer.playerId] = newDataPlayer;
    }

    Create_Player_Marcus() {
        let newDataPlayer = new DataPlayer();

        newDataPlayer.playerId = this.CODE_KEY.marcus.KEY;
        newDataPlayer.spineUIKey = "marcus_spine_ui";
        newDataPlayer.spineGameplayKey = "marcus_spine_gameplay";
        newDataPlayer.cardImgInventoryKey = "marcus_ui_card_inventory";

        // Đẩy vào dictionary với khóa là id
        this.dataPlayerDictionary[newDataPlayer.playerId] = newDataPlayer;
    }

    Create_Player_MarcusSC() {
        let newDataPlayer = new DataPlayer();

        newDataPlayer.playerId = this.CODE_KEY.marcussc.KEY;
        newDataPlayer.spineUIKey = "marcussc_spine_ui";
        newDataPlayer.spineGameplayKey = "marcussc_spine_gameplay";
        newDataPlayer.cardImgInventoryKey = "marcussc_ui_card_inventory";

        // Đẩy vào dictionary với khóa là id
        this.dataPlayerDictionary[newDataPlayer.playerId] = newDataPlayer;
    }

    Create_Player_Anna() {
        let newDataPlayer = new DataPlayer();

        newDataPlayer.playerId = this.CODE_KEY.anna.KEY;
        newDataPlayer.spineUIKey = "anna_spine_ui";
        newDataPlayer.spineGameplayKey = "anna_spine_gameplay";
        newDataPlayer.cardImgInventoryKey = "anna_ui_card_inventory";

        // Đẩy vào dictionary với khóa là id
        this.dataPlayerDictionary[newDataPlayer.playerId] = newDataPlayer;
    }

    Create_Player_AnnaSB() {
        let newDataPlayer = new DataPlayer();

        newDataPlayer.playerId = this.CODE_KEY.annasb.KEY;
        newDataPlayer.spineUIKey = "annasb_spine_ui";
        newDataPlayer.spineGameplayKey = "annasb_spine_gameplay";
        newDataPlayer.cardImgInventoryKey = "annasb_ui_card_inventory";

        // Đẩy vào dictionary với khóa là id
        this.dataPlayerDictionary[newDataPlayer.playerId] = newDataPlayer;
    }

    Create_Player_Julia() {
        let newDataPlayer = new DataPlayer();

        newDataPlayer.playerId = this.CODE_KEY.julia.KEY;
        newDataPlayer.spineUIKey = "julia_spine_ui";
        newDataPlayer.spineGameplayKey = "julia_spine_gameplay";
        newDataPlayer.cardImgInventoryKey = "julia_ui_card_inventory";

        // Đẩy vào dictionary với khóa là id
        this.dataPlayerDictionary[newDataPlayer.playerId] = newDataPlayer;
    }

    Create_Player_JuliaSB() {
        let newDataPlayer = new DataPlayer();

        newDataPlayer.playerId = this.CODE_KEY.juliasb.KEY;
        newDataPlayer.spineUIKey = "juliasb_spine_ui";
        newDataPlayer.spineGameplayKey = "juliasb_spine_gameplay";
        newDataPlayer.cardImgInventoryKey = "juliasb_ui_card_inventory";

        // Đẩy vào dictionary với khóa là id
        this.dataPlayerDictionary[newDataPlayer.playerId] = newDataPlayer;
    }

    Create_Player_Fiona() {
        let newDataPlayer = new DataPlayer();

        newDataPlayer.playerId = this.CODE_KEY.fiona.KEY;
        newDataPlayer.spineUIKey = "fiona_spine_ui";
        newDataPlayer.spineGameplayKey = "fiona_spine_gameplay";
        newDataPlayer.cardImgInventoryKey = "fiona_ui_card_inventory";

        // Đẩy vào dictionary với khóa là id
        this.dataPlayerDictionary[newDataPlayer.playerId] = newDataPlayer;
    }

    Create_Player_FionaSB() {
        let newDataPlayer = new DataPlayer();

        newDataPlayer.playerId = this.CODE_KEY.fionasb.KEY;
        newDataPlayer.spineUIKey = "fionasb_spine_ui";
        newDataPlayer.spineGameplayKey = "fionasb_spine_gameplay";
        newDataPlayer.cardImgInventoryKey = "fionasb_ui_card_inventory";

        // Đẩy vào dictionary với khóa là id
        this.dataPlayerDictionary[newDataPlayer.playerId] = newDataPlayer;
    }

    Create_Player_Victoria() {
        let newDataPlayer = new DataPlayer();

        newDataPlayer.playerId = this.CODE_KEY.victoria.KEY;
        newDataPlayer.spineUIKey = "victoria_spine_ui";
        newDataPlayer.spineGameplayKey = "victoria_spine_gameplay";
        newDataPlayer.cardImgInventoryKey = "victoria_ui_card_inventory";

        // Đẩy vào dictionary với khóa là id
        this.dataPlayerDictionary[newDataPlayer.playerId] = newDataPlayer;
    }

    Create_Player_VictoriaSA() {
        let newDataPlayer = new DataPlayer();

        newDataPlayer.playerId = this.CODE_KEY.victoriasa.KEY;
        newDataPlayer.spineUIKey = "victoriasa_spine_ui";
        newDataPlayer.spineGameplayKey = "victoriasa_spine_gameplay";
        newDataPlayer.cardImgInventoryKey = "victoriasa_ui_card_inventory";

        // Đẩy vào dictionary với khóa là id
        this.dataPlayerDictionary[newDataPlayer.playerId] = newDataPlayer;
    }

    Create_Player_Elizabeth() {
        let newDataPlayer = new DataPlayer();

        newDataPlayer.playerId = this.CODE_KEY.elizabeth.KEY;
        newDataPlayer.spineUIKey = "elizabeth_spine_ui";
        newDataPlayer.spineGameplayKey = "elizabeth_spine_gameplay";
        newDataPlayer.cardImgInventoryKey = "elizabeth_ui_card_inventory";

        // Đẩy vào dictionary với khóa là id
        this.dataPlayerDictionary[newDataPlayer.playerId] = newDataPlayer;
    }

    Create_Player_ElizabethSA() {
        let newDataPlayer = new DataPlayer();

        newDataPlayer.playerId = this.CODE_KEY.elizabethsa.KEY;
        newDataPlayer.spineUIKey = "elizabethsa_spine_ui";
        newDataPlayer.spineGameplayKey = "elizabethsa_spine_gameplay";
        newDataPlayer.cardImgInventoryKey = "elizabethsa_ui_card_inventory";

        // Đẩy vào dictionary với khóa là id
        this.dataPlayerDictionary[newDataPlayer.playerId] = newDataPlayer;
    }

    Create_Player_Alexandra() {
        let newDataPlayer = new DataPlayer();

        newDataPlayer.playerId = this.CODE_KEY.alexandra.KEY;
        newDataPlayer.spineUIKey = "alexandra_spine_ui";
        newDataPlayer.spineGameplayKey = "alexandra_spine_gameplay";
        newDataPlayer.cardImgInventoryKey = "alexandra_ui_card_inventory";

        // Đẩy vào dictionary với khóa là id
        this.dataPlayerDictionary[newDataPlayer.playerId] = newDataPlayer;
    }

    Create_Player_AlexandraSA() {
        let newDataPlayer = new DataPlayer();

        newDataPlayer.playerId = this.CODE_KEY.alexandrasa.KEY;
        newDataPlayer.spineUIKey = "alexandrasa_spine_ui";
        newDataPlayer.spineGameplayKey = "alexandrasa_spine_gameplay";
        newDataPlayer.cardImgInventoryKey = "alexandrasa_ui_card_inventory";

        // Đẩy vào dictionary với khóa là id
        this.dataPlayerDictionary[newDataPlayer.playerId] = newDataPlayer;
    }

    Create_Player_Akane() {
        let newDataPlayer = new DataPlayer();

        newDataPlayer.playerId = this.CODE_KEY.akane.KEY;
        newDataPlayer.spineUIKey = "akane_spine_ui";
        newDataPlayer.spineGameplayKey = "akane_spine_gameplay";
        newDataPlayer.cardImgInventoryKey = "akane_ui_card_inventory";

        // Đẩy vào dictionary với khóa là id
        this.dataPlayerDictionary[newDataPlayer.playerId] = newDataPlayer;
    }

    Create_Player_Alice() {
        let newDataPlayer = new DataPlayer();

        newDataPlayer.playerId = this.CODE_KEY.alice.KEY;
        newDataPlayer.spineUIKey = "alice_spine_ui";
        newDataPlayer.spineGameplayKey = "alice_spine_gameplay";
        newDataPlayer.cardImgInventoryKey = "alice_ui_card_inventory";

        this.dataPlayerDictionary[newDataPlayer.playerId] = newDataPlayer;
    }

    Create_Player_Caitlyn() {
        let newDataPlayer = new DataPlayer();

        newDataPlayer.playerId = this.CODE_KEY.caitlyn.KEY;
        newDataPlayer.spineUIKey = "caitlyn_spine_ui";
        newDataPlayer.spineGameplayKey = "caitlyn_spine_gameplay";
        newDataPlayer.cardImgInventoryKey = "caitlyn_ui_card_inventory";

        // Đẩy vào dictionary với khóa là id
        this.dataPlayerDictionary[newDataPlayer.playerId] = newDataPlayer;
    }

    CreatePlayTestPlayerList() {
        let newPlayerList = {};

        let playerBaseArr = Object.values(
            JSON.parse(JSON.stringify(centerData.baseCharacterInfo))
        );

        for (let i = 0; i < playerBaseArr.length; i++) {
            let baseData = playerBaseArr[i];

            // console.log(
            //     `CreatePlayTestPlayerList ${baseData.code}: `,
            //     baseData
            // );

            baseData._id = baseData.code;

            baseData.level = 10;

            baseData.star = baseData.starLevelData.length;

            newPlayerList[baseData.code] = baseData;
        }

        for (let i = 0; i < playerBaseArr.length; i++) {
            let baseData = playerBaseArr[i];

            let evolveData = newPlayerList[baseData.code + "s" + baseData.rank];

            if (evolveData != null) {
                const copy = evolveData;

                copy.level = 1;

                copy.star = 1;

                newPlayerList[baseData.code]["envolvedProperties"] = copy;
            }
        }

        this.playTestPlayer = newPlayerList;
    }

    CreatePlayTestStarPlayerList() {
        let newPlayerList = {};

        let playerBaseArr = Object.values(
            JSON.parse(JSON.stringify(centerData.baseCharacterInfo))
        );

        for (let i = 0; i < playerBaseArr.length; i++) {
            let baseData = playerBaseArr[i];

            baseData._id = baseData.code;

            baseData.level = 10;

            baseData.star = 3;

            newPlayerList[baseData.code] = baseData;
        }

        this.playTestStarPlayer = newPlayerList;
    }

    isSelectedTestPlayer(_id) {
        // Kiểm tra xem chuỗi có thuộc mảng không
        if (this.selectedPlayerTestArr.includes(_id)) {
            //console.log(`${stringToCheck} exists in selectedPlayer`);

            return true;
        } else {
            //console.log(`${stringToCheck} does not exist in selectedPlayer`);

            return false;
        }
    }

    addToSelectedTestPlayer(_id, onSuccess, onError) {
        let newSelected = [];

        let player = this.playTestPlayer[_id];

        if (player) {
            for (let i = 0; i < this.selectedPlayerTestArr.length; i++) {
                let checkPlayer =
                    this.playTestPlayer[this.selectedPlayerTestArr[i]];

                if (player.role !== checkPlayer.role) {
                    newSelected.push(checkPlayer._id);
                }
            }

            newSelected.push(player._id);

            this.selectedPlayerTestArr = newSelected;
        }
    }

    removeFromSelectedTestPlayer(_id, onSuccess, onError) {
        this.selectedPlayerTestArr = this.selectedPlayerTestArr.filter(
            (player) => player !== _id
        );
    }
}

const centerDataPlayer = new CenterDataPlayer();
export default centerDataPlayer;
