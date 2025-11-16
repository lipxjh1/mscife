import Papa from "papaparse";
import ASSET_CONFIG from '../../config/assets';

export class CenterDataLocalization {
    constructor() {
        this.LOCALIZATION_KEYS = {
            en: {
                KEY: "en",
                FONT: "Russo One",
            },
            vi: {
                KEY: "vi",
                FONT: "Noto Sans",
            },
            ru: {
                KEY: "ru",
                FONT: "Noto Sans",
            },
            cn: {
                KEY: "cn",
                FONT: "Noto Sans SC",
            },
            jp: {
                KEY: "jp",
                FONT: "Noto Sans JP",
            },
            kr: {
                KEY: "kr",
                FONT: "Noto Sans KR",
            },
            in: {
                KEY: "in",
                FONT: "Noto Sans",
            },
            de: {
                KEY: "de",
                FONT: "Noto Sans",
            },
        };

        this.GROUP_KEYS = {
            Main: {
                KEY: "main",
            },
            Preload: {
                KEY: "preload",
            },
            HomeLobby: {
                KEY: "home_lobby",
            },
            HomeMusk: {
                KEY: "home_musk",
            },
            HomeAccount: {
                KEY: "home_account",
            },
            HomeNetwork: {
                KEY: "home_network",
            },
            HomeRank: {
                KEY: "home_rank",
            },
            HomeDaily: {
                KEY: "home_daily",
            },
            HomeMission: {
                KEY: "home_mission",
            },
            HomeAchivevement: {
                KEY: "home_achivevement",
            },
            HomeAirdrop: {
                KEY: "home_airdrop",
            },
            HomeBattle: {
                KEY: "home_battle",
            },
            HomeCampian: {
                KEY: "home_campian",
            },
            HomeBoss: {
                KEY: "home_boss",
            },
            HomeTeam: {
                KEY: "home_team",
            },
            HomeFragment: {
                KEY: "home_fragment",
            },
            HomeGacha: {
                KEY: "home_gacha",
            },
            HomeWallet: {
                KEY: "home_wallet",
            },
            HomeMint: {
                KEY: "home_mint",
            },
            HomeShop: {
                KEY: "home_shop",
            },
            HomeShopDescription: {
                KEY: "home_shop_description",
            },
            CenterMarket: {
                KEY: "center_market",
            },
            Neuralink: {
                KEY: "neuralink",
            },
        };

        // Thêm một instance EventTarget vào class Data
        this.eventTarget = new EventTarget();

        //this.currentLanguage = this.LOCALIZATION_KEYS.vi.KEY;

        this.currentLanguage = this.GetLanguage();

        this.localizations = {};

        this.loadCSVData();
    }

    // Thêm hàm để thêm, xóa, và kích hoạt sự kiện
    onEvent(eventName, callback) {
        this.eventTarget.addEventListener(eventName, callback);
    }

    offEvent(eventName, callback) {
        this.eventTarget.removeEventListener(eventName, callback);
    }

    emitEvent(eventName, detail = null) {
        this.eventTarget.dispatchEvent(new CustomEvent(eventName, { detail }));
    }

    AddLocalizationChange(callback) {
        this.onEvent("localizationchange", callback);
    }

    RemoveLocalizationChange(callback) {
        this.offEvent("localizationchange", callback);
    }

    EmitLocalizationChange() {
        this.emitEvent("localizationchange", this.currentLanguage);
    }

    GetLanguage(defaultValue = "en") {
        return localStorage.getItem("language") || defaultValue;
    }

    Setlanguage(keySTR = this.LOCALIZATION_KEYS.en.KEY) {
        localStorage.setItem("language", keySTR);
    }

    async loadCSVData() {
        try {
            //Create main
            {
                const response = await fetch(ASSET_CONFIG.get("/assets/MSCI_Translate.csv"));
                const csvData = await response.text();
                let localization = this.CreateLocalization(csvData);

                this.localizations[this.GROUP_KEYS.Main.KEY] = {
                    localization: localization,
                };
            }

            //Create preload
            {
                const response = await fetch(
                    ASSET_CONFIG.get("/assets/MSCI_Translate_Preload.csv"))
                );
                const csvData = await response.text();
                let localization = this.CreateLocalization(csvData);

                this.localizations[this.GROUP_KEYS.Preload.KEY] = {
                    localization: localization,
                };
            }

            //Create lobby
            {
                const response = await fetch(
                    ASSET_CONFIG.get("/assets/MSCI_Translate_Home_Lobby.csv")
                );
                const csvData = await response.text();
                let localization = this.CreateLocalization(csvData);

                this.localizations[this.GROUP_KEYS.HomeLobby.KEY] = {
                    localization: localization,
                };
            }

            //Create musk
            {
                const response = await fetch(
                    ASSET_CONFIG.get("/assets/MSCI_Translate_Home_Musk.csv")
                );
                const csvData = await response.text();
                let localization = this.CreateLocalization(csvData);

                this.localizations[this.GROUP_KEYS.HomeMusk.KEY] = {
                    localization: localization,
                };
            }

            //Create Account
            {
                const response = await fetch(
                    ASSET_CONFIG.get("/assets/MSCI_Translate_Home_Account.csv")
                );
                const csvData = await response.text();
                let localization = this.CreateLocalization(csvData);

                this.localizations[this.GROUP_KEYS.HomeAccount.KEY] = {
                    localization: localization,
                };
            }

            //Create Network
            {
                const response = await fetch(
                    ASSET_CONFIG.get("/assets/MSCI_Translate_Home_Network.csv")
                );
                const csvData = await response.text();
                let localization = this.CreateLocalization(csvData);

                this.localizations[this.GROUP_KEYS.HomeNetwork.KEY] = {
                    localization: localization,
                };
            }

            //Create Rank
            {
                const response = await fetch(
                    ASSET_CONFIG.get("/assets/MSCI_Translate_Home_Rank.csv")
                );
                const csvData = await response.text();
                let localization = this.CreateLocalization(csvData);

                this.localizations[this.GROUP_KEYS.HomeRank.KEY] = {
                    localization: localization,
                };
            }

            //Create Daily
            {
                const response = await fetch(
                    ASSET_CONFIG.get("/assets/MSCI_Translate_Home_Daily.csv")
                );
                const csvData = await response.text();
                let localization = this.CreateLocalization(csvData);

                this.localizations[this.GROUP_KEYS.HomeDaily.KEY] = {
                    localization: localization,
                };
            }

            //Create Mission
            {
                const response = await fetch(
                    ASSET_CONFIG.get("/assets/MSCI_Translate_Home_Mission.csv")
                );
                const csvData = await response.text();
                let localization = this.CreateLocalization(csvData);

                this.localizations[this.GROUP_KEYS.HomeMission.KEY] = {
                    localization: localization,
                };
            }

            //Create Achivevement
            {
                const response = await fetch(
                    ASSET_CONFIG.get("/assets/MSCI_Translate_Home_Achivevement.csv")
                );
                const csvData = await response.text();
                let localization = this.CreateLocalization(csvData);

                this.localizations[this.GROUP_KEYS.HomeAchivevement.KEY] = {
                    localization: localization,
                };
            }

            //Create Airdrop
            {
                const response = await fetch(
                    ASSET_CONFIG.get("/assets/MSCI_Translate_Home_Airdrop.csv")
                );
                const csvData = await response.text();
                let localization = this.CreateLocalization(csvData);

                this.localizations[this.GROUP_KEYS.HomeAirdrop.KEY] = {
                    localization: localization,
                };
            }

            //Create Battle
            {
                const response = await fetch(
                    ASSET_CONFIG.get("/assets/MSCI_Translate_Home_Battle.csv")
                );
                const csvData = await response.text();
                let localization = this.CreateLocalization(csvData);

                this.localizations[this.GROUP_KEYS.HomeBattle.KEY] = {
                    localization: localization,
                };
            }

            //Create Campian
            {
                const response = await fetch(
                    ASSET_CONFIG.get("/assets/MSCI_Translate_Home_Campian.csv")
                );
                const csvData = await response.text();
                let localization = this.CreateLocalization(csvData);

                this.localizations[this.GROUP_KEYS.HomeCampian.KEY] = {
                    localization: localization,
                };
            }

            //Create boss
            {
                const response = await fetch(
                    ASSET_CONFIG.get("/assets/MSCI_Translate_Home_Boss.csv")
                );
                const csvData = await response.text();
                let localization = this.CreateLocalization(csvData);

                this.localizations[this.GROUP_KEYS.HomeBoss.KEY] = {
                    localization: localization,
                };
            }

            //Create team
            {
                const response = await fetch(
                    ASSET_CONFIG.get("/assets/MSCI_Translate_Home_Team.csv")
                );
                const csvData = await response.text();
                let localization = this.CreateLocalization(csvData);

                this.localizations[this.GROUP_KEYS.HomeTeam.KEY] = {
                    localization: localization,
                };
            }

            //Create fragment
            {
                const response = await fetch(
                    ASSET_CONFIG.get("/assets/MSCI_Translate_Home_Fragment.csv")
                );
                const csvData = await response.text();
                let localization = this.CreateLocalization(csvData);

                this.localizations[this.GROUP_KEYS.HomeFragment.KEY] = {
                    localization: localization,
                };
            }

            //Create gacha
            {
                const response = await fetch(
                    ASSET_CONFIG.get("/assets/MSCI_Translate_Home_Gacha.csv")
                );
                const csvData = await response.text();
                let localization = this.CreateLocalization(csvData);

                this.localizations[this.GROUP_KEYS.HomeGacha.KEY] = {
                    localization: localization,
                };
            }

            //Create Wallet
            {
                const response = await fetch(
                    ASSET_CONFIG.get("/assets/MSCI_Translate_Home_Wallet.csv")
                );
                const csvData = await response.text();
                let localization = this.CreateLocalization(csvData);

                this.localizations[this.GROUP_KEYS.HomeWallet.KEY] = {
                    localization: localization,
                };
            }

            //Create Mint
            {
                const response = await fetch(
                    ASSET_CONFIG.get("/assets/MSCI_Translate_Home_Mint.csv")
                );
                const csvData = await response.text();
                let localization = this.CreateLocalization(csvData);

                this.localizations[this.GROUP_KEYS.HomeMint.KEY] = {
                    localization: localization,
                };
            }

            //Create shop
            {
                const response = await fetch(
                    ASSET_CONFIG.get("/assets/MSCI_Translate_Home_Shop.csv")
                );
                const csvData = await response.text();
                let localization = this.CreateLocalization(csvData);

                this.localizations[this.GROUP_KEYS.HomeShop.KEY] = {
                    localization: localization,
                };
            }

            //Create shop description
            {
                const response = await fetch(
                    ASSET_CONFIG.get("/assets/MSCI_Translate_Home_Shop_Description.csv")
                );
                const csvData = await response.text();
                let localization = this.CreateLocalization(csvData);

                this.localizations[this.GROUP_KEYS.HomeShopDescription.KEY] = {
                    localization: localization,
                };
            }

            //Create center market
            {
                const response = await fetch(
                    ASSET_CONFIG.get("/assets/MSCI_Translate_Center_Market.csv")
                );
                const csvData = await response.text();
                let localization = this.CreateLocalization(csvData);

                this.localizations[this.GROUP_KEYS.CenterMarket.KEY] = {
                    localization: localization,
                };
            }

            //Create neuralink
            {
                const response = await fetch(
                    ASSET_CONFIG.get("/assets/MSCI_Translate_Neuralink.csv")
                );
                const csvData = await response.text();
                let localization = this.CreateLocalization(csvData);

                this.localizations[this.GROUP_KEYS.Neuralink.KEY] = {
                    localization: localization,
                };
            }
        } catch (error) {
            console.error("Error loading CSV:", error);
        }
    }

    CreateLocalization(csvData) {
        let newLocalization = {};

        // Parse CSV data
        const parsedData = Papa.parse(csvData, {
            header: true,
            skipEmptyLines: true,
        });

        parsedData.data.forEach((row) => {
            const key = row.key.replace(/^"|"$/g, "");

            if (!newLocalization[key]) {
                newLocalization[key] = {};
            }

            if (row.en) {
                newLocalization[key][this.LOCALIZATION_KEYS.en.KEY] = row.en
                    .replace(/^"|"$/g, "")
                    .replace(/\\n/g, "\n");
            }

            if (row.vi) {
                newLocalization[key][this.LOCALIZATION_KEYS.vi.KEY] = row.vi
                    .replace(/^"|"$/g, "")
                    .replace(/\\n/g, "\n");
            }

            if (row.ru) {
                newLocalization[key][this.LOCALIZATION_KEYS.ru.KEY] = row.ru
                    .replace(/^"|"$/g, "")
                    .replace(/\\n/g, "\n");
            }

            if (row.cn) {
                newLocalization[key][this.LOCALIZATION_KEYS.cn.KEY] = row.cn
                    .replace(/^"|"$/g, "")
                    .replace(/\\n/g, "\n");
            }

            if (row.jp) {
                newLocalization[key][this.LOCALIZATION_KEYS.jp.KEY] = row.jp
                    .replace(/^"|"$/g, "")
                    .replace(/\\n/g, "\n");
            }

            if (row.kr) {
                newLocalization[key][this.LOCALIZATION_KEYS.kr.KEY] = row.kr
                    .replace(/^"|"$/g, "")
                    .replace(/\\n/g, "\n");
            }

            if (row.in) {
                newLocalization[key][this.LOCALIZATION_KEYS.in.KEY] = row.in
                    .replace(/^"|"$/g, "")
                    .replace(/\\n/g, "\n");
            }

            if (row.de) {
                newLocalization[key][this.LOCALIZATION_KEYS.de.KEY] = row.de
                    .replace(/^"|"$/g, "")
                    .replace(/\\n/g, "\n");
            }
        });

        //console.log("localization:", newLocalization);

        return newLocalization;
    }

    replacePlaceholders(str, values) {
        return str.replace(/{i}/g, () =>
            values.length > 0 ? values.shift() : "{missing}"
        );
    }

    getTranslation(groupKey = "", key, language) {
        // console.log("getTranslation localization key: ", key);
        // console.log("getTranslation language key: ", language);

        let selectedLocalization =
            this.localizations[this.GROUP_KEYS.Main.KEY]?.localization;

        if (groupKey != "") {
            if (
                !this.localizations[groupKey] ||
                !this.localizations[groupKey].localization
            ) {
                console.warn(`Localization for ${groupKey} not loaded yet`);
                return `${key}`;
            }
            selectedLocalization = this.localizations[groupKey].localization;
        }

        // return (
        //     selectedLocalization[key]?.[language.KEY] ||
        //     `Translation not found for key: ${key}`
        // );

        return (
            (selectedLocalization &&
                selectedLocalization[key]?.[language.KEY]) ||
            `${key}`
        );
    }

    getLocalization(groupKey = "", key = "", values = []) {
        let transStr = this.getTranslation(
            groupKey,
            key,
            this.LOCALIZATION_KEYS[this.currentLanguage]
        );

        if (values && values.length > 0) {
            let placeStr = this.replacePlaceholders(transStr, values);

            return placeStr;
        } else {
            return transStr;
        }
    }

    getCurrentFont() {
        // return (
        //     this.LOCALIZATION_KEYS[this.currentLanguage].FONT +
        //     `,"Noto Sans:900","Noto Sans SC","Noto Sans KR","Noto Sans JP"`
        // );

        return this.LOCALIZATION_KEYS[this.currentLanguage].FONT;
    }

    getFont() {}

    changeLocalization(localizationKey = this.LOCALIZATION_KEYS.en.KEY) {
        this.currentLanguage = localizationKey;

        this.Setlanguage(this.currentLanguage);

        this.EmitLocalizationChange();
    }
}

const cdLocalization = new CenterDataLocalization();
export default cdLocalization;
