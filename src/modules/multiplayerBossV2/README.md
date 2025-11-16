# Multiplayer Boss V2 Module

Enhanced multiplayer boss battles with Colyseus real-time support for the Battle menu.

## 📋 Overview

This module provides a complete UI section for the Multiplayer Boss V2 feature in the Battle menu. It follows the exact same patterns as existing HomeBattle sections for consistency and seamless integration.

## 📁 File Structure

```
src/modules/multiplayerBossV2/
├── index.js              # Main entry point and module exports
├── ui/
│   └── BattleSection.js  # UI component for the battle section
└── README.md             # This documentation
```

## 🚀 Usage

### Basic Integration

```javascript
// In HomeBattle.js (CreateList function)
import { multiplayerBossV2 } from '../../../modules/multiplayerBossV2/index.js';

// Add this after CreateItemBoss() call
multiplayerBossV2.createBattleSection(scene, scrollablePanel);
```

### Advanced Usage

```javascript
// Import with default export
import multiplayerBossV2 from '../../../modules/multiplayerBossV2/index.js';

// Import module info
import { MULTIPLAYER_BOSS_V2_INFO } from '../../../modules/multiplayerBossV2/index.js';

// Use the module
multiplayerBossV2.createBattleSection(scene, scrollablePanel);
console.log(`Module: ${MULTIPLAYER_BOSS_V2_INFO.name} v${MULTIPLAYER_BOSS_V2_INFO.version}`);
```

## 🎨 UI Components

### BattleSection

The main UI component that creates the Multiplayer Boss V2 section in the Battle menu.

**Features:**
- Exact dimensions: 1004x293px (matches other sections)
- Three buttons: "Create", "Join", "Rooms"
- "NEW" badge for visual distinction
- Hover effects and animations
- Reuses existing assets for consistency

**Layout:**
- Title: "Multiplayer Boss V2" at (38, 35)
- Description: "Colyseus-powered real-time battles" at (38, 102)
- Badge "NEW" at (950, 35)
- Three buttons at bottom with exact spacing

## 🔧 API Reference

### `multiplayerBossV2.createBattleSection(scene, scrollablePanel)`

Creates the Multiplayer Boss V2 battle section.

**Parameters:**
- `scene` (Phaser.Scene): The current Phaser scene
- `scrollablePanel` (RexUI.ScrollablePanel): The scrollable panel to add this section to

**Returns:** `void`

**Example:**
```javascript
multiplayerBossV2.createBattleSection(scene, scrollablePanel);
```

### Button Event Handlers

Currently, all buttons log to console as placeholders:

```javascript
// Create button
console.log("Multiplayer Boss V2: Create Room clicked");

// Join button
console.log("Multiplayer Boss V2: Join Room clicked");

// Rooms button
console.log("Multiplayer Boss V2: Room List clicked");
```

## 🎨 Assets Used

This module reuses existing assets for consistency:

- **Background:** `home_battle_item_bg_boss`
- **Buttons:** `home_battle_btn`
- **Fonts:** Uses `cdLocalization.getCurrentFont()`

## 🔗 Dependencies

- **Phaser 3:** Game engine
- **RexUI:** UI components
- **cdLocalization:** Text localization system
- **CenterDataLocalization:** Localization data

## 📝 TODO Items

- [ ] Implement actual Create Room functionality
- [ ] Implement actual Join Room functionality
- [ ] Implement actual Room List functionality
- [ ] Add proper localization support for V2 text
- [ ] Connect to Colyseus backend
- [ ] Add error handling and validation
- [ ] Add loading states for async operations
- [ ] Add room preview/hover information
- [ ] Add player count indicators
- [ ] Add room difficulty levels

## 🔧 Integration Guide

### Step 1: Import the module

In `src/game/scenes/Home/HomeBattle/HomeBattle.js`, add this import after line 29:

```javascript
import { multiplayerBossV2 } from '../../../modules/multiplayerBossV2/index.js';
```

### Step 2: Call the function

In the `CreateList()` function, add this call after line 193 (after `CreateItemBoss()`):

```javascript
multiplayerBossV2.createBattleSection(scene, scrollablePanel);
```

### Step 3: Test

1. Run `npm run dev`
2. Login to the game
3. Navigate to Battle menu
4. Verify the new section appears
5. Test the three buttons (check console)

## 🎯 Design Patterns

This module follows established patterns:

1. **Container Pattern:** Uses `container_inner` with negative positioning
2. **Asset Reuse:** Reuses existing assets (`home_battle_item_bg_boss`, `home_battle_btn`)
3. **Button Pattern:** Uses `createOptionsButton()` with hover effects
4. **Text Pattern:** Consistent font sizes and colors with other sections
5. **Module Pattern:** Clean exports with both named and default exports

## 🚨 Important Notes

- **Minimal Changes:** Only 2 lines need to be added to HomeBattle.js
- **Asset Loading:** Uses existing preloaded assets (no new assets needed)
- **Consistency:** Matches exact patterns from other battle sections
- **Performance:** Lazy loading through import ensures no impact on initial load
- **Maintenance:** Isolated module for easy updates and maintenance

---

**Version:** 2.0.0
**Last Updated:** 2025-11-16
**Status:** ✅ Ready for Integration