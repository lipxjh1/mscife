/**
 * Multiplayer Boss V2 Module
 *
 * Enhanced multiplayer boss battles with Colyseus real-time support
 *
 * @version 2.0.0
 * @date 2025-11-16
 * @description Complete module for Multiplayer Boss V2 section in Battle menu
 */

import { createBattleSection } from './ui/BattleSection.js';

/**
 * Multiplayer Boss V2 Module Object
 *
 * Provides functions to create and manage the Multiplayer Boss V2 UI section
 * in the Battle menu. This module follows the exact same patterns as existing
 * HomeBattle sections for consistency.
 */
export const multiplayerBossV2 = {
    /**
     * Create the Multiplayer Boss V2 battle section
     *
     * @param {Phaser.Scene} scene - The current Phaser scene
     * @param {RexUI.ScrollablePanel} scrollablePanel - The scrollable panel to add this section to
     * @returns {void}
     */
    createBattleSection
};

/**
 * Module Information
 */
export const MULTIPLAYER_BOSS_V2_INFO = {
    name: 'multiplayerBossV2',
    version: '2.0.0',
    description: 'Enhanced multiplayer boss battles with Colyseus real-time support',
    features: [
        'Real-time multiplayer battles',
        'Room management system',
        'Colyseus backend integration',
        'Enhanced UI/UX',
        'Scalable architecture'
    ],
    dependencies: [
        'Phaser 3',
        'RexUI',
        'cdLocalization'
    ],
    assets: {
        background: 'home_battle_item_bg_boss',
        button: 'home_battle_btn'
    }
};

// Export default for easy importing
export default multiplayerBossV2;