import DataItem from "./DataItem.js";

export class CenterDataItem {
    constructor() {
        this.dataItemDictionary = {};

        this.dataItemFragmentDictionary = {};

        // console.log("dataItemDictionary: ", this.dataItemDictionary);

        // Gọi hàm tạo dữ liệu ngay khi khởi tạo
        this.CreateDataItem();
    }

    // Phương thức lấy phần tử từ dictionary theo id
    getItemById(id) {
        //console.log("Looking for player with id:", id);
        //console.log("Current dictionary:", this.dataPlayerDictionary);
        return this.dataItemDictionary[id.toLowerCase()] || null;
    }

    CreateDataItem() {
        this.Create_item_Chip();
        this.Create_item_Musk();
        this.Create_item_MSCI();

        this.Create_item_Character_Box();

        this.Create_item_Character_C_Box();
        this.Create_item_Character_C_Box_David();
        this.Create_item_Character_C_Box_Henry();
        this.Create_item_Character_C_Box_Marcus();

        this.Create_item_Character_Premium_Box();

        this.Create_item_Character_Fragment_Box();

        this.CreateFragmentCharacter();

        this.Create_item_MSCI_MEMORY();

        this.Create_item_DOGE_ENERGY();
        this.Create_item_DOGE_SHIELD();

        this.Create_item_BLIND_BAG();

        this.Create_item_World_Boss_Box();

        this.Create_item_Elite_Boss_Box();

        this.Create_Neuralinks();
    }

    Create_item_Chip() {
        let newData = new DataItem();

        newData.itemId = "Chip";
        newData.imgKey = "item_chip";

        // Đẩy vào dictionary với khóa là id
        this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
    }

    Create_item_Musk() {
        let newData = new DataItem();

        newData.itemId = "Musk";
        newData.imgKey = "item_musk";

        // Đẩy vào dictionary với khóa là id
        this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
    }

    Create_item_MSCI() {
        let newData = new DataItem();

        newData.itemId = "MSCI";
        newData.imgKey = "item_msci";

        // Đẩy vào dictionary với khóa là id
        this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
    }

    Create_item_Character_Box() {
        let newData = new DataItem();

        newData.itemId = "BOX_NFT_CHARACTER";
        newData.imgKey = "item_character_box";

        // Đẩy vào dictionary với khóa là id
        this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
    }

    Create_item_Character_C_Box() {
        let newData = new DataItem();

        newData.itemId = "BOX_ALL_C_RANK";
        newData.imgKey = "item_character_c_box";

        // Đẩy vào dictionary với khóa là id
        this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
    }

    Create_item_Character_C_Box_David() {
        let newData = new DataItem();

        newData.itemId = "BOX_DAVID";
        newData.imgKey = "item_character_c_box_david";

        // Đẩy vào dictionary với khóa là id
        this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
    }

    Create_item_Character_C_Box_Henry() {
        let newData = new DataItem();

        newData.itemId = "BOX_HENRY";
        newData.imgKey = "item_character_c_box_henry";

        // Đẩy vào dictionary với khóa là id
        this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
    }

    Create_item_Character_C_Box_Marcus() {
        let newData = new DataItem();

        newData.itemId = "BOX_MARCUS";
        newData.imgKey = "item_character_c_box_marcus";

        // Đẩy vào dictionary với khóa là id
        this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
    }

    Create_item_Character_Premium_Box() {
        let newData = new DataItem();

        newData.itemId = "BOX_PREMIUM_CHARACTER";
        newData.imgKey = "item_character_premium_box";

        // Đẩy vào dictionary với khóa là id
        this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
    }

    Create_item_Character_Fragment_Box() {
        let newData = new DataItem();

        newData.itemId = "BOX_NFT_FRAGMENT";
        newData.imgKey = "item_character_piece_box";

        // Đẩy vào dictionary với khóa là id
        this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
    }

    CreateFragmentCharacter() {
        //c
        this.CreateFragmentCharacterUnit("anna");
        this.CreateFragmentCharacterUnit("julia");
        this.CreateFragmentCharacterUnit("fiona");

        //b
        this.CreateFragmentCharacterUnit("david");
        this.CreateFragmentCharacterUnit("henry");
        this.CreateFragmentCharacterUnit("marcus");

        //a
        this.CreateFragmentCharacterUnit("victoria");
        this.CreateFragmentCharacterUnit("elizabeth");
        this.CreateFragmentCharacterUnit("alexandra");

        //s
        this.CreateFragmentCharacterUnit("akane");
        this.CreateFragmentCharacterUnit("alice");
        this.CreateFragmentCharacterUnit("caitlyn");
    }

    CreateFragmentCharacterUnit(charId) {
        {
            let newData = new DataItem();

            newData.itemId = charId + "_fragment_1";
            newData.imgKey = "item_fragment_" + charId;

            // Đẩy vào dictionary với khóa là id
            this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
            this.dataItemFragmentDictionary[newData.itemId.toLowerCase()] =
                newData;
        }

        {
            let newData = new DataItem();

            newData.itemId = charId + "_fragment_2";
            newData.imgKey = "item_fragment_" + charId;

            // Đẩy vào dictionary với khóa là id
            this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
            this.dataItemFragmentDictionary[newData.itemId.toLowerCase()] =
                newData;
        }

        {
            let newData = new DataItem();

            newData.itemId = charId + "_fragment_3";
            newData.imgKey = "item_fragment_" + charId;

            // Đẩy vào dictionary với khóa là id
            this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
            this.dataItemFragmentDictionary[newData.itemId.toLowerCase()] =
                newData;
        }

        {
            let newData = new DataItem();

            newData.itemId = charId + "_fragment_4";
            newData.imgKey = "item_fragment_" + charId;

            // Đẩy vào dictionary với khóa là id
            this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
            this.dataItemFragmentDictionary[newData.itemId.toLowerCase()] =
                newData;
        }
    }

    Create_item_MSCI_MEMORY() {
        let newData = new DataItem();

        newData.itemId = "MSCI_MEMORY";
        newData.imgKey = "item_msci_memory";

        // Đẩy vào dictionary với khóa là id
        this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
    }

    Create_item_DOGE_ENERGY() {
        let newData = new DataItem();

        newData.itemId = "DOGE_ENERGY";
        newData.imgKey = "item_doge_energy";

        // Đẩy vào dictionary với khóa là id
        this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
    }

    Create_item_DOGE_SHIELD() {
        let newData = new DataItem();

        newData.itemId = "DOGE_SHIELD";
        newData.imgKey = "item_doge_shield";

        // Đẩy vào dictionary với khóa là id
        this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
    }

    Create_item_BLIND_BAG() {
        let newData = new DataItem();

        newData.itemId = "BLIND_BAG";
        newData.imgKey = "item_blind_bag";

        // Đẩy vào dictionary với khóa là id
        this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
    }

    Create_item_World_Boss_Box() {
        let newData = new DataItem();

        newData.itemId = "WORLD_BOSS_BOX";
        newData.imgKey = "item_boss_world_box";

        // Đẩy vào dictionary với khóa là id
        this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
    }

    Create_item_Elite_Boss_Box() {
        let newData = new DataItem();

        newData.itemId = "ELITE_BOSS_BOX";
        newData.imgKey = "item_boss_elite_box";

        // Đẩy vào dictionary với khóa là id
        this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
    }

    Create_Neuralinks() {
        this.Create_item_Neuralink();

        this.Create_item_Neuralink_1();
        this.Create_item_Neuralink_2();
        this.Create_item_Neuralink_3();
        this.Create_item_Neuralink_4();
        this.Create_item_Neuralink_5();

        this.Create_item_Neuralink_1_E();
        this.Create_item_Neuralink_2_E();
        this.Create_item_Neuralink_3_E();
        this.Create_item_Neuralink_4_E();
        this.Create_item_Neuralink_5_E();
    }

    Create_item_Neuralink() {
        let newData = new DataItem();

        newData.itemId = "NEURALINK";
        newData.imgKey = "item_neuralink";

        // Đẩy vào dictionary với khóa là id
        this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
    }

    Create_item_Neuralink_1() {
        let newData = new DataItem();

        newData.itemId = "CONNECTED_NEURALINK_1";
        newData.imgKey = "item_neuralink_1";

        // Đẩy vào dictionary với khóa là id
        this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
    }

    Create_item_Neuralink_2() {
        let newData = new DataItem();

        newData.itemId = "CONNECTED_NEURALINK_2";
        newData.imgKey = "item_neuralink_2";

        // Đẩy vào dictionary với khóa là id
        this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
    }

    Create_item_Neuralink_3() {
        let newData = new DataItem();

        newData.itemId = "CONNECTED_NEURALINK_3";
        newData.imgKey = "item_neuralink_3";

        // Đẩy vào dictionary với khóa là id
        this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
    }

    Create_item_Neuralink_4() {
        let newData = new DataItem();

        newData.itemId = "CONNECTED_NEURALINK_4";
        newData.imgKey = "item_neuralink_4";

        // Đẩy vào dictionary với khóa là id
        this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
    }

    Create_item_Neuralink_5() {
        let newData = new DataItem();

        newData.itemId = "CONNECTED_NEURALINK_5";
        newData.imgKey = "item_neuralink_5";

        // Đẩy vào dictionary với khóa là id
        this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
    }

    Create_item_Neuralink_1_E() {
        let newData = new DataItem();

        newData.itemId = "ELITE_NEURALINK_1";
        newData.imgKey = "item_neuralink_1_e";

        // Đẩy vào dictionary với khóa là id
        this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
    }

    Create_item_Neuralink_2_E() {
        let newData = new DataItem();

        newData.itemId = "ELITE_NEURALINK_2";
        newData.imgKey = "item_neuralink_2_e";

        // Đẩy vào dictionary với khóa là id
        this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
    }

    Create_item_Neuralink_3_E() {
        let newData = new DataItem();

        newData.itemId = "ELITE_NEURALINK_3";
        newData.imgKey = "item_neuralink_3_e";

        // Đẩy vào dictionary với khóa là id
        this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
    }

    Create_item_Neuralink_4_E() {
        let newData = new DataItem();

        newData.itemId = "ELITE_NEURALINK_4";
        newData.imgKey = "item_neuralink_4_e";

        // Đẩy vào dictionary với khóa là id
        this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
    }

    Create_item_Neuralink_5_E() {
        let newData = new DataItem();

        newData.itemId = "ELITE_NEURALINK_5";
        newData.imgKey = "item_neuralink_5_e";

        // Đẩy vào dictionary với khóa là id
        this.dataItemDictionary[newData.itemId.toLowerCase()] = newData;
    }
}

const centerDataItem = new CenterDataItem();
export default centerDataItem;
