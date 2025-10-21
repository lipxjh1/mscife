import centerData from "../../../Data/CenterData.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import { AssetLoadingManager } from "../../AssetLoadingManager.js";

import {
    CreateAlertPopup,
    CreateLoadingPopup,
    HideLoadingPopup,
} from "../../Share/AlertPopup.js";
import { CreateGuildJoined } from "./HomeGuildJoined.js";

import { CreateGuildNone } from "./HomeGuildNone.js";

let myGuild = null;

export function CreateGuild(scene) {
    CreateLoadingPopup();

    myGuild = null;
    
    let assetsToLoad = 2;
    let assetsLoaded = 0;

    const onAssetLoaded = () => {
        assetsLoaded++;
        
        if (assetsLoaded == assetsToLoad) {
            HideLoadingPopup();
            LoadAssetsDone(scene);
        }
    };

    AssetLoadingManager.getInstance().init(scene);
    AssetLoadingManager.getInstance().lazyLoadGuild(() => {
        onAssetLoaded();
    });

    RequestGetMyGuild(
        (response) => {
            onAssetLoaded();
        },
        (response) => {
            onAssetLoaded();
        }
    );
}

export function RequestGetMyGuild(onSuccess, onError) {
    
    centerData.RequestGetMyGuild(
        (response) => {
            if (response.success) {
                
                if (response.guild) {
                    SetMyGuild(response.guild);
                } else {
                    SetMyGuild(null);
                }
            } else {
                SetMyGuild(null);
            }

            if (onSuccess && typeof onSuccess === "function") {
                onSuccess(response);
            }
        },
        (response) => {
            SetMyGuild(null);

            CreateAlertPopup(scene, response.error.message);

            if (onError && typeof onError === "function") {
                onError(response);
            }
        }
    );
}

export function GetMyGuild() {
    return myGuild;
}

export function SetMyGuild(guild) {
    myGuild = guild;
}

function LoadAssetsDone(scene) {
    
    if (myGuild == null) {
        CreateGuildNone(scene);
    } else {
        
        CreateGuildJoined(scene);
    }
}
