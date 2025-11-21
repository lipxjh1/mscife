import centerData from "../../Data/CenterData";
import centerDataPlayer from "../../Data/CenterDataPlayer.js";
import centerDataItem from "../../Data/CenterDataItem.js";

import { AssetLoadingManager } from "../AssetLoadingManager.js";

import { AssetPlayerLoadingManager } from "../AssetPlayerLoadingManager.js";

// ✅ NEW: Loading state constants for progressive enhancement
const CharacterCardStates = {
    LOADING: 'loading',
    BASIC_LOADED: 'basic',
    LOADING_DETAIL: 'loading_detail',
    FULL_LOADED: 'full',
    ERROR: 'error',
    RETRY_AVAILABLE: 'retry'
};

// ✅ NEW: Loading state management
const LoadingStateManager = {
    states: new Map(),
    
    setState(characterId, state) {
        this.states.set(characterId, state);
    },
    
    getState(characterId) {
        return this.states.get(characterId) || CharacterCardStates.LOADING;
    },
    
    isLoading(characterId) {
        const state = this.getState(characterId);
        return state === CharacterCardStates.LOADING || state === CharacterCardStates.LOADING_DETAIL;
    },
    
    isFullyLoaded(characterId) {
        return this.getState(characterId) === CharacterCardStates.FULL_LOADED;
    }
};

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
    // ✅ NEW: Check if we should use progressive loading
    if (centerData && centerData.isCharacterFullyLoaded && centerData.getCharacterFullInfo) {
        // Try to find character ID from available data
        let characterId = _id;
        if (!characterId && centerData.selectedPlayerArr && centerData.selectedPlayerArr.length > 0) {
            characterId = centerData.selectedPlayerArr[0];
        }
        
        if (characterId) {
            return CreateCharacterCardProgressive(scene, characterId, _id, code, name, role, rank, level, star);
        }
    }
    
    // Fallback to original implementation
    return CreateCharacterCardBasic(scene, _id, code, name, role, rank, level, star);
}

// ✅ NEW: Progressive character card creation
export function CreateCharacterCardProgressive(scene, characterId, _id = "", code = "", name = "", role = "", rank = "", level = 1, star = 1) {
    console.log('CreateCharacterCardProgressive: Creating card for', characterId);
    
    const container_card = scene.add.container(0, 0);
    
    // Store basic properties
    container_card._id = _id || characterId;
    container_card.code = code;
    container_card.name = name;
    container_card.role = role;
    container_card.rank = rank;
    container_card.level = level;
    container_card.star = star;
    container_card.characterId = characterId;
    
    // Get current character data state
    const characterData = centerData.getCharacterFullInfo(characterId);
    const hasFullData = centerData.isCharacterFullyLoaded(characterId);
    const isLoading = centerData.isCharacterLoading(characterId);
    
    // Determine current state
    let currentState;
    if (isLoading) {
        currentState = CharacterCardStates.LOADING_DETAIL;
    } else if (hasFullData) {
        currentState = CharacterCardStates.FULL_LOADED;
        // Update container properties with full data
        if (characterData) {
            container_card.name = characterData.name || name;
            container_card.role = characterData.role || role;
            container_card.rank = characterData.rank || rank;
            container_card.level = characterData.level || level;
            container_card.star = characterData.star || star;
        }
    } else if (characterData) {
        currentState = CharacterCardStates.BASIC_LOADED;
        // Update container properties with basic data
        container_card.name = characterData.name || name;
        container_card.role = characterData.role || role;
        container_card.rank = characterData.rank || rank;
        container_card.level = characterData.level || level;
        container_card.star = characterData.star || star;
    } else {
        currentState = CharacterCardStates.LOADING;
    }
    
    LoadingStateManager.setState(characterId, currentState);
    
    // Setup container structure for progressive rendering
    container_card.container_card_inner = scene.add.container(-319 / 2, -444 / 2);
    container_card.add(container_card.container_card_inner);
    
    // Render based on current state
    renderCharacterCardByState(container_card, characterId, characterData, currentState, scene);
    
    // Setup state monitoring for updates
    setupCharacterCardMonitoring(container_card, characterId, scene);
    
    // Setup selection interface
    setupCardSelectionInterface(container_card, scene);
    
    return container_card;
}

// ✅ NEW: Basic character card creation (original logic)
export function CreateCharacterCardBasic(scene, _id = "", code = "", name = "", role = "", rank = "", level = 1, star = 1) {
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

// ✅ NEW: State-based rendering system
function renderCharacterCardByState(container, characterId, characterData, state, scene) {
    console.log('renderCharacterCardByState:', characterId, state);
    
    // Clear previous content
    container.container_card_inner.removeAll(true);
    
    switch (state) {
        case CharacterCardStates.LOADING:
            renderLoadingCard(container, scene);
            triggerDetailLoading(characterId);
            break;
            
        case CharacterCardStates.BASIC_LOADED:
            renderBasicCard(container, characterData, scene);
            triggerDetailLoading(characterId);
            break;
            
        case CharacterCardStates.LOADING_DETAIL:
            renderBasicCard(container, characterData, scene);
            renderDetailLoadingOverlay(container, scene);
            break;
            
        case CharacterCardStates.FULL_LOADED:
            renderFullCharacterCard(container, characterData, scene);
            break;
            
        case CharacterCardStates.ERROR:
            renderErrorCard(container, characterId, scene);
            break;
            
        default:
            renderLoadingCard(container, scene);
            triggerDetailLoading(characterId);
    }
}

// ✅ NEW: Render loading card
function renderLoadingCard(container, scene) {
    // Create card background
    const background = scene.add
        .image(0, 0, "share_character_card_bg")
        .setOrigin(0, 0);
    container.container_card_inner.add(background);
    
    // Create skeleton loading elements
    const frame_0 = scene.add
        .image(0, 0, GetFrame_0_ByRank(container.rank))
        .setOrigin(0, 0);
    container.container_card_inner.add(frame_0);
    
    // Add loading spinner
    const spinnerContainer = scene.add.container(319 / 2, 444 / 2);
    const spinner = scene.add.text(0, 0, '⏳', {
        fontSize: '48px',
        fill: '#ffffff'
    }).setOrigin(0.5);
    spinnerContainer.add(spinner);
    
    // Add loading text
    const loadingText = scene.add.text(0, 60, 'Loading...', {
        fontSize: '18px',
        fill: '#ffffff',
        fontFamily: 'Russo One'
    }).setOrigin(0.5);
    spinnerContainer.add(loadingText);
    
    container.container_card_inner.add(spinnerContainer);
    
    // Add name background
    const name_bg = scene.add
        .image(0, 0, "share_character_card_name_bg")
        .setOrigin(0, 0);
    container.container_card_inner.add(name_bg);
}

// ✅ NEW: Render basic card
function renderBasicCard(container, characterData, scene) {
    if (!characterData) {
        renderErrorCard(container, null, scene);
        return;
    }
    
    // Create card background
    const background = scene.add
        .image(0, 0, "share_character_card_bg")
        .setOrigin(0, 0);
    container.container_card_inner.add(background);
    
    // Add frame
    const frame_0 = scene.add
        .image(0, 0, GetFrame_0_ByRank(container.rank))
        .setOrigin(0, 0);
    container.container_card_inner.add(frame_0);
    
    // Add basic character info
    // ✅ Fix: Fallback to centerDataPlayer if centerData missing cardImgInventoryKey
    // This fixes the issue where progressive loading shows text ID instead of character image
    let imageKey = characterData.cardImgInventoryKey;

    // Fallback to centerDataPlayer (sync data source) if async centerData doesn't have key
    if (!imageKey && container.code && typeof centerDataPlayer !== 'undefined') {
        try {
            const playerData = centerDataPlayer.getPlayerById(container.code);
            if (playerData && playerData.cardImgInventoryKey) {
                imageKey = playerData.cardImgInventoryKey;
                console.log(`[CharacterCard] ✅ Fallback to centerDataPlayer for ${container.code}: ${imageKey}`);
            }
        } catch (error) {
            console.warn(`[CharacterCard] ⚠️ centerDataPlayer fallback failed for ${container.code}:`, error);
        }
    }

    // Render card with image if key is available from either source
    if (imageKey) {
        const avatar = scene.add
            .image(319 / 2, 384, imageKey)
            .setOrigin(0.5, 1);
        container.container_card_inner.add(avatar);
    } else {
        // Better fallback: Show loading state instead of text ID
        // This provides better UX while waiting for async data
        console.warn(`[CharacterCard] ⚠️ No image key available for ${characterData._id || container.code}, showing placeholder`);

        // Show loading text (temporary - better than character ID)
        const loadingText = scene.add
            .text(319 / 2, 444 / 2, "Loading...", {
                fontFamily: "Russo One",
                fontSize: "40px",
                color: "#888888",
                align: "center",
            })
            .setOrigin(0.5, 0.5);
        container.container_card_inner.add(loadingText);
    }
    
    // Add level
    if (container.level > 0) {
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
        container.container_card_inner.add(text_level_0);

        const text_level_1 = scene.add
            .text(44, 350, container.level, {
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
        container.container_card_inner.add(text_level_1);
    }
    
    // Add stars
    if (container.star > 0) {
        let posX = 319;
        let posY = 328;

        for (let i = 0; i < container.star; i++) {
            const img_star = scene.add
                .image(posX, posY, "share_character_card_star")
                .setOrigin(1, 0);
            container.container_card_inner.add(img_star);

            posX -= 55 / 2 + 5;
        }
    }
    
    // Add role icon if available
    if (container.role != "") {
        const role_icon = scene.add
            .image(197, 259, GetRoleIcon(container.role, container.rank))
            .setOrigin(0, 0);
        container.container_card_inner.add(role_icon);
    }
    
    // Add name
    const name_bg = scene.add
        .image(0, 0, "share_character_card_name_bg")
        .setOrigin(0, 0);
    container.container_card_inner.add(name_bg);

    if (container.name != "") {
        const text_name = scene.add
            .text(319 / 2, 396 + 36, container.name, {
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
        container.container_card_inner.add(text_name);
    }
}

// ✅ NEW: Render detail loading overlay
function renderDetailLoadingOverlay(container, scene) {
    // Add semi-transparent overlay
    const overlay = scene.add.rectangle(0, 0, 319, 444, 0x000000, 0.3);
    container.container_card_inner.add(overlay);
    
    // Add loading indicator at center
    const loadingIndicator = scene.add.container(319 / 2, 444 / 2);
    const spinner = scene.add.text(0, 0, '🔄', {
        fontSize: '32px',
        fill: '#ffff00'
    }).setOrigin(0.5);
    loadingIndicator.add(spinner);
    
    const loadingText = scene.add.text(0, 40, 'Loading details...', {
        fontSize: '14px',
        fill: '#ffffff',
        fontFamily: 'Russo One'
    }).setOrigin(0.5);
    loadingIndicator.add(loadingText);
    
    container.container_card_inner.add(loadingIndicator);
}

// ✅ NEW: Render full character card
function renderFullCharacterCard(container, characterData, scene) {
    // Render basic info first
    renderBasicCard(container, characterData, scene);
    
    // Add detailed information if available
    if (characterData.properties) {
        // Create detailed stats overlay
        const statsContainer = scene.add.container(0, 0);
        
        // Add stats background
        const statsBg = scene.add.rectangle(160, 30, 310, 80, 0x000000, 0.7);
        statsContainer.add(statsBg);
        
        // Add stats
        const stats = [
            `ATK: ${characterData.properties.attackDamage || 0}`,
            `HP: ${characterData.properties.hp || 0}`,
            `DEF: ${characterData.properties.defense || 0}`
        ];
        
        stats.forEach((stat, index) => {
            const statText = scene.add.text(20 + (index % 2) * 150, 10 + Math.floor(index / 2) * 25, stat, {
                fontSize: '12px',
                fill: '#00ff00',
                fontFamily: 'Russo One'
            }).setOrigin(0, 0);
            statsContainer.add(statText);
        });
        
        container.container_card_inner.add(statsContainer);
    }
    
    // Add rank frame if fully loaded
    if (container.rank != "") {
        const frame_1 = scene.add
            .image(0, 0, GetFrame_1_ByRank(container.rank))
            .setOrigin(0, 0);
        container.container_card_inner.add(frame_1);
    }
}

// ✅ NEW: Render error card
function renderErrorCard(container, characterId, scene) {
    // Create error background
    const background = scene.add
        .image(0, 0, "share_character_card_bg")
        .setOrigin(0, 0);
    container.container_card_inner.add(background);
    
    // Add error frame
    const frame_0 = scene.add
        .image(0, 0, GetFrame_0_ByRank(container.rank))
        .setOrigin(0, 0);
    container.container_card_inner.add(frame_0);
    
    // Add error message
    const errorContainer = scene.add.container(319 / 2, 444 / 2);
    const errorText = scene.add.text(0, -20, '❌ Load Error', {
        fontSize: '20px',
        fill: '#ff6666',
        fontFamily: 'Russo One'
    }).setOrigin(0.5);
    errorContainer.add(errorText);
    
    const retryText = scene.add.text(0, 20, 'Tap to retry', {
        fontSize: '14px',
        fill: '#aaaaaa',
        fontFamily: 'Russo One'
    }).setOrigin(0.5);
    errorContainer.add(retryText);
    
    container.container_card_inner.add(errorContainer);
    
    // Add name background
    const name_bg = scene.add
        .image(0, 0, "share_character_card_name_bg")
        .setOrigin(0, 0);
    container.container_card_inner.add(name_bg);
}

// ✅ NEW: Trigger detail loading
function triggerDetailLoading(characterId) {
    if (centerData && centerData.loadFullCharacterData) {
        console.log('triggerDetailLoading: Loading details for', characterId);
        centerData.loadFullCharacterData(characterId);
    }
}

// ✅ NEW: Setup character card monitoring
function setupCharacterCardMonitoring(container, characterId, scene) {
    // Monitor character data changes
    const checkInterval = setInterval(() => {
        if (!scene || !scene.sys || !scene.sys.isActive()) {
            clearInterval(checkInterval);
            return;
        }
        
        const hasFullData = centerData.isCharacterFullyLoaded(characterId);
        const isLoading = centerData.isCharacterLoading(characterId);
        const characterData = centerData.getCharacterFullInfo(characterId);
        
        let newState;
        if (isLoading) {
            newState = CharacterCardStates.LOADING_DETAIL;
        } else if (hasFullData) {
            newState = CharacterCardStates.FULL_LOADED;
            // Update container properties with full data
            if (characterData) {
                container.name = characterData.name || container.name;
                container.role = characterData.role || container.role;
                container.rank = characterData.rank || container.rank;
                container.level = characterData.level || container.level;
                container.star = characterData.star || container.star;
            }
        } else if (characterData) {
            newState = CharacterCardStates.BASIC_LOADED;
            // Update container properties with basic data
            if (characterData) {
                container.name = characterData.name || container.name;
                container.role = characterData.role || container.role;
                container.rank = characterData.rank || container.rank;
                container.level = characterData.level || container.level;
                container.star = characterData.star || container.star;
            }
        } else {
            newState = CharacterCardStates.ERROR;
        }
        
        const currentState = LoadingStateManager.getState(characterId);
        if (currentState !== newState) {
            LoadingStateManager.setState(characterId, newState);
            renderCharacterCardByState(container, characterId, characterData, newState, scene);
        }
    }, 500); // Check every 500ms
    
    // Cleanup on scene destroy
    scene.events.on('shutdown', () => {
        clearInterval(checkInterval);
    });
}

// ✅ NEW: Setup card selection interface
function setupCardSelectionInterface(container, scene) {
    // Add name background for selection
    const name_bg = container.container_card_inner.getByName('name_bg');
    if (!name_bg) {
        const name_bg_new = scene.add
            .image(0, 0, "share_character_card_name_bg")
            .setOrigin(0, 0)
            .setName('name_bg');
        container.container_card_inner.add(name_bg_new);
    }
    
    const tick_selected = scene.add
        .image(253, 0, "share_character_card_tick_selected")
        .setOrigin(0, 0);
    container.container_card_inner.add(tick_selected);

    container.setSelected = function () {
        const nameBg = container.container_card_inner.getByName('name_bg') || 
                       container.container_card_inner.getChildren().find(child => child.texture && child.texture.key === 'share_character_card_name_bg');
        if (nameBg) {
            nameBg.setTint(0x2ead00);
        }
        tick_selected.setAlpha(1);
    };

    container.setUnselected = function () {
        const nameBg = container.container_card_inner.getByName('name_bg') || 
                       container.container_card_inner.getChildren().find(child => child.texture && child.texture.key === 'share_character_card_name_bg');
        if (nameBg) {
            nameBg.setTint(0x3d3d40);
        }
        tick_selected.setAlpha(0);
    };

    container.setUnselected();
}
