# SCAN REPORT - Multiplayer Boss V2 Module

## HomeBattle.js Analysis

**File Location:** `/mnt/d/fe/mscife/src/game/scenes/Home/HomeBattle/HomeBattle.js`

**CreateList() Function Location:** Lines 122-207

**Current Sections in CreateList():**
- `CreateItemCampian()` - Line 188
- `CreateItemMultiplayer()` - Line 191 (conditional, only if CurrentStage > 1)
- `CreateItemBoss()` - Line 193 (conditional, only if CurrentStage > 1)

**Insert Point for V2:** Line 194 - After `CreateItemBoss()` call, before `scrollablePanel.layout()` on line 196

## Section Pattern Analysis

### Dimensions (All Sections)
- **Item Width:** 1004px
- **Item Height:** 293px
- **Button Width:** 248px
- **Button Height:** 78px

### Layout Structure Pattern
```javascript
const item = scene.add.container(0, 0);
item.setSize(itemWidth, itemHeight);

let container_inner = scene.add.container(-itemWidth / 2, -itemHeight / 2);
item.add(container_inner);

const bg = scene.add.image(0, 0, "home_battle_item_bg_boss").setOrigin(0, 0);
container_inner.add(bg);

// Text elements at exact positions
const text_mode = scene.add.text(38, 35, ...);
const text_info = scene.add.text(38, 102, ...);
```

### Text Positioning Pattern
- **Title:** (38, 35) - Font size: 52px, Color: #CCCCCC
- **Description:** (38, 102) - Font size: 28px, Color: #CCCCCC

### Button Pattern (Multiplayer Section Example)
```javascript
const btn_name = CreateOptionsButton(
    scene,
    container_inner,
    746 + 248 / 2,  // X position (right side)
    199 + 78 / 2,   // Y position (bottom)
    "home_battle_btn",
    cdLocalization.getLocalization(cdLocalization.GROUP_KEYS.HomeBattle.KEY, "ButtonText")
);
```

### Button Spacing (3 Buttons)
- **Right button (Create):** X = 746 + 248/2 = 870
- **Middle button (Join):** X = 476 + 248/2 = 600
- **Left button (Rooms):** X = 206 + 248/2 = 330
- **All buttons Y:** 199 + 78/2 = 238

### Container Pattern
```javascript
scrollablePanel.getElement("panel").add(item, {
    align: "top-left",
    expand: false,
});
```

## Assets Available

### Background Images
- **home_battle_item_bg_boss** - Path: `assets/home_2/home_battle/home_battle_item_bg_boss.webp`
- **home_battle_item_bg_campain** - Already used by Campaign section

### Button Images
- **home_battle_btn** - Path: `assets/home_2/home_battle/home_battle_btn.webp`
- **home_battle_btn_lock** - Available if needed
- **home_battle_btn_battle** - Used for title

### Font Configuration
- **Font Family:** `cdLocalization.getCurrentFont()`
- **Localization Group:** `cdLocalization.GROUP_KEYS.HomeBattle.KEY`

## CreateOptionsButton() Function Pattern

**Location:** Lines 209-267

**Function Signature:**
```javascript
function CreateOptionsButton(scene, container, x, y, imageKey, buttonName)
```

**Button Creation Pattern:**
- Container with inner container for positioning
- Image button with hover effects (scale 1.0 → 1.2 in 100ms)
- Text centered on button using localization
- Returns container with `.button` property for event handling

## Integration Points

### Import Location
**Line:** Add after line 29 (import section)
```javascript
import { multiplayerBossV2 } from '../../../modules/multiplayerBossV2/index.js';
```

### Function Call Location
**Line:** 194 (after CreateItemBoss, before scrollablePanel.layout())
```javascript
multiplayerBossV2.createBattleSection(scene, scrollablePanel);
```

### Exact Code to Add

**At line 30 (add new import):**
```javascript
import { multiplayerBossV2 } from '../../../modules/multiplayerBossV2/index.js';
```

**At line 194 (add function call):**
```javascript
multiplayerBossV2.createBattleSection(scene, scrollablePanel);
```

## Existing Module Structure Pattern

**Directory:** `/mnt/d/fe/mscife/src/modules/`

**Pattern from vorld-auth module:**
- `index.js` - Main entry point with exports
- Component files co-located or in subdirectories
- Clean separation of concerns
- Export pattern: `export default` and named exports

## Critical Requirements for V2 Module

### Must Match Exactly:
1. **Section dimensions:** 1004x293px
2. **Button dimensions:** 248x78px
3. **Text positioning:** Title (38,35), Description (38,102)
4. **Button positioning:** Same X coordinates as Multiplayer section
5. **Container pattern:** `container_inner` with negative positioning
6. **Background asset:** `home_battle_item_bg_boss`
7. **Button asset:** `home_battle_btn`
8. **Hover effects:** Scale 1.0 → 1.2 in 100ms
9. **Font styling:** 52px title, 28px description, #CCCCCC color
10. **Localization pattern:** Use `cdLocalization.GROUP_KEYS.HomeBattle.KEY`

### Module Export Pattern:
```javascript
export const multiplayerBossV2 = {
    createBattleSection: (scene, scrollablePanel) => { ... }
};
```

## Code Quality Requirements

- **Import path:** Correct relative path from HomeBattle.js location
- **Function signature:** Match existing pattern exactly
- **Error handling:** Console.log for button click handlers (placeholder)
- **Clean integration:** No duplicate code, minimal changes
- **Production ready:** Follow existing code patterns and conventions

---

**Status:** ✅ Scan Complete - All patterns identified, integration points clear