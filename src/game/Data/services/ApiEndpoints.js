/**
 * API Endpoints Configuration
 * Centralized API endpoint URLs for better maintainability
 *
 * Total endpoints: 178
 * Generated from CenterData.js refactor
 */

export const API_ENDPOINTS = {
    // 🔐 AUTHENTICATION (6 endpoints)
    AUTH: {
        LOGIN_TELEGRAM: '/api/auth/login-telegram',
        SIGNIN_EMAIL: '/api/auth-ep/signin',
        SIGNUP_EMAIL: '/api/auth-ep/signup',
        FORGOT_PASSWORD: '/api/auth-ep/forgot-password',
        SIGNIN_GOOGLE: '/auth/login-google',
        SIGNIN_GOOGLE_LINK_TELEGRAM: '/auth/login-google'
    },

    // 👤 USER & PROFILE (19 endpoints)
    USER: {
        UPDATE_BATTLE_CHARACTERS: '/api/me/update-battle-characters',
        UPDATE_WALLET: '/api/me/update-wallet',
        GET_PROFILE: '/api/me',
        UPDATE_OTHER_GAME_INFO: '/api/me/update-other-game-info',
        GET_CHARACTERS: '/api/me/characters',
        GET_INVENTORY: '/api/me/inventory',
        GET_F1_LIST: '/api/me/f1-list',
        GET_QUESTS: '/api/me/quests',
        MARK_QUEST_DONE: '/api/me/quests/mark-done',
        GET_CHECKIN_STATUS: '/api/me/checkin-status',
        DAILY_CHECKIN: '/api/me/daily-checkin',
        MAKEUP_CHECKIN: '/api/me/makeup-checkin',
        GET_F1_USERS: '/api/f1-users',
        GET_MAILS: '/api/mail/mails',
        READ_MAIL: '/api/mail/mails',
        CLAIM_MAIL: '/api/mail/mails',
        UPDATE_AVATAR: '/api/me/update-avatar',
        SEARCH_USER: '/api/users/search',
        GET_CHIP_REWARDS: '/api/me/chip-rewards'
    },

    // 💰 MARKET & ECONOMY (47 endpoints)
    MARKET: {
        // Basic Market
        GET_ROLES: '/api/market/marketplace/character-roles',
        GET_CODES_BY_ROLE: '/api/market/marketplace/character-roles-detail',
        GET_STARS_BY_CODE: '/api/market/marketplace/characters-by-star',
        GET_LEVELS_BY_CODE_STAR: '/api/market/marketplace/characters-by-code-star-level',
        GET_LEVELS_BY_CODE_STAR_PRICE: '/api/market/marketplace/characters-by-code-star-level-price',
        GET_ITEMS_BY_CODES: '/api/market/marketplace/by-item-codes',
        GET_FRAGMENTS_BY_CODE: '/api/market/marketplace/character-fragments',

        // Orders
        GET_ORDERS: '/api/market/marketplace/orders',
        CANCEL_ORDER: '/api/market/marketplace/orders',
        ORDER_HISTORY: '/api/market/marketplace/order-history',
        LISTING_HISTORY: '/api/market/marketplace/listing-history',

        // Trading
        GET_TRADEABLE_ITEMS: '/api/market/tradable-items',
        GET_TRADEABLE_ITEM: '/api/market/tradable-item',
        GET_ORDER_COUNTS: '/api/market/marketplace/order-counts',

        // Listings
        GET_MY_LISTINGS: '/api/market/marketplace/my-listings',
        CREATE_LISTING: '/api/market/marketplace/list',
        CANCEL_LISTING: '/api/market/marketplace/cancel',

        // Token Trading
        TOKEN_ORDERBOOK: '/api/market/orderbook/token',
        TOKEN_ORDER: '/api/market/order/token',
        TOKEN_ORDERS_ME: '/api/market/orders/token/me',
        TOKEN_ORDER_CANCEL: '/api/market/order/token',

        // MSCI Trading
        GET_MSCI_DASHBOARD: '/api/me/msci/dashboard',
        MSCI_CONVERT: '/api/me/msci/convert',
        MSCI_CONVERSION_HISTORY: '/api/me/msci/conversion-history',

        // Neuralink Trading
        NEURALINK_ORDERBOOK_SELL: '/api/market/orderbook/neuralink/sell',
        NEURALINK_ORDERBOOK: '/api/market/orderbook/neuralink',
        NEURALINK_CURRENT_BUY: '/api/market/orders/neuralink/current_buy',
        NEURALINK_CURRENT_SELL: '/api/market/orders/neuralink/current_sell',
        NEURALINK_HISTORY_BUY: '/api/market/orders/neuralink/history',

        // Market Item Trading
        MARKET_ITEM_TRADEABLE: '/api/market-item/tradeable',
        MARKET_ITEM_STATISTICS: '/api/market-item/statistics',
        MARKET_ITEM_PRICE_GUIDE: '/api/market-item/price-guide',
        MARKET_ITEM_LISTINGS: '/api/market-item/listings',
        MARKET_ITEM_MY_LISTINGS: '/api/market-item/my-listings',
        MARKET_ITEM_CANCEL: '/api/market-item/cancel',
        MARKET_ITEM_BUY: '/api/market-item/buy',
        MARKET_ITEM_SELL: '/api/market-item/sell',
        MARKET_ITEM_MY_BUY: '/api/market-item/buy',

        // Character Marketplace
        CHARACTER_MY_CHARACTERS: '/api/character-marketplace/my-characters',
        CHARACTER_STATISTICS: '/api/character-marketplace/statistics',
        CHARACTER_LISTINGS: '/api/character-marketplace/listings',
        CHARACTER_MY_LISTINGS: '/api/character-marketplace/my-listings',
        CHARACTER_MY_BUY: '/api/character-marketplace/my-buy',
        CHARACTER_PURCHASE: '/api/character-marketplace/purchase',
        CHARACTER_CREATE: '/api/character-marketplace/create',
        CHARACTER_CANCEL: '/api/character-marketplace/cancel',

        // MSCI Marketplace
        MSCI_LISTINGS: '/api/market-msci/listings',
        MSCI_MY_LISTINGS: '/api/market-msci/my-listings',
        MSCI_MY_TRANSACTIONS: '/api/market-msci/my-transactions',
        MSCI_CREATE: '/api/market-msci/create',
        MSCI_CANCEL: '/api/market-msci/cancel',
        MSCI_PURCHASE: '/api/market-msci/purchase'
    },

    // 🎮 GAMEPLAY & BATTLE (11 endpoints)
    GAME: {
        GET_ITEM_INFO: '/api/game-item',
        SPIN: '/api/spin',
        PREMIUM_SPIN: '/api/premium-spin',
        GET_CURRENT_BATTLE: '/api/current-scene',
        START_BATTLE: '/api/start-battle',
        GET_STAGE_INFO: '/api/game-stage',
        BOSS_CLAIM_REWARDS: '/api/boss/claim-rewards-simple',
        BOSS_GET_REWARDS: '/api/boss/get-rewards-simple',
        BOSS_MVP_BOARD: '/api/boss/mvp-board',
        BOSS_TOP_DAMAGE: '/api/boss/top-damage',
        MPBOSS_ACTIVE_ROOMS: '/api/mpboss/active-rooms'
    },

    // 🏆 CHARACTER MANAGEMENT (7 endpoints)
    CHARACTER: {
        GET_INFO: '/api/character',
        COMBINE_FRAGMENTS: '/api/character/combine-fragments',
        UPGRADE_LEVEL: '/api/character/upgrade-level',
        UPGRADE_STAR: '/api/character/upgrade-star',
        UPGRADE_TO_S_RANK: '/api/character/upgrade-to-s-rank',
        DECOMPOSE: '/api/character/decompose',
        DECOMPOSE_MULTIPLE: '/api/character/decompose-multiple',
        SELL_FOR_MUSK: '/api/character/sell-for-musk'
    },

    // 📊 RANKINGS & ACHIEVEMENTS (4 endpoints)
    RANKING: {
        GET_USERS: '/api/rankings/users',
        GET_ME: '/api/rankings/me',
        GET_ACHIEVEMENTS: '/api/achievement',
        CLAIM_ACHIEVEMENT: '/api/achievement/claim'
    },

    // 💳 TRANSACTIONS & WALLET (5 endpoints)
    WALLET: {
        WITHDRAW_REQUEST: '/api/withdraw/create-withdraw-request',
        TRANSACTION_HISTORY: '/api/me/transactions',
        TRANSACTION_MUSK: '/api/transactions/musk',
        TRANSACTION_CHIP: '/api/transactions/chip',
        TRANSACTION_MSCI: '/api/transactions/msci'
    },

    // 🛒 SHOP & PURCHASES (4 endpoints)
    SHOP: {
        GET_ITEMS: '/api/shop/items',
        BUY_ITEM: '/api/shop/buy',
        OPEN_BOX: '/api/box/open',
        OPEN_MULTIPLE_BOX: '/api/box/open-multiple'
    },

    // 🎯 NFT & MINTING (2 endpoints)
    NFT: {
        MINT_CHARACTER: '/api/mint/character',
        GET_NFT_CHARACTERS: '/api/character/get-info' // External API
    },

    // 🤝 SOCIAL & FRIENDS (8 endpoints)
    SOCIAL: {
        SEND_FRIEND_REQUEST: '/api/friends/send',
        ACCEPT_FRIEND_REQUEST: '/api/friends/accept',
        REJECT_FRIEND_REQUEST: '/api/friends/reject',
        REMOVE_FRIEND: '/api/friends/remove',
        GET_FRIEND_REQUESTS: '/api/friends/requests',
        GET_FRIEND_LIST: '/api/friends/list',
        FRIEND_CHAT_HISTORY: '/api/friendchat',
        FRIEND_CHAT_SEND: '/api/friendchat'
    },

    // 🏰 GUILD/CLAN (15 endpoints)
    GUILD: {
        GET_MY_GUILD: '/api/guild/my-guild',
        SEARCH_GUILDS: '/api/guild/search',
        GET_GUILD_MEMBERS: '/api/guild/members',
        JOIN_GUILD: '/api/guild/join',
        LEAVE_GUILD: '/api/guild/leave',
        DELETE_GUILD: '/api/guild/delete',
        GET_GUILD_REQUESTS: '/api/guild/my-guild/requests',
        APPROVE_GUILD_REQUEST: '/api/guild/request',
        REJECT_GUILD_REQUEST: '/api/guild/request',
        GET_MY_REQUESTS: '/api/guild/my-request',
        CANCEL_GUILD_REQUEST: '/api/guild/my-request',
        GET_GUILD_MEMBER: '/api/guild/member',
        CREATE_GUILD: '/api/guild/create',
        UPDATE_GUILD_AVATAR: '/api/guild',
        GUILD_DONATION_LEADERBOARD: '/api/guild/donation-leaderboard',
        GUILD_DONATE: '/api/guild/donate'
    },

    // 📋 SYSTEM & CONFIGURATION (7 endpoints)
    SYSTEM: {
        GET_RATE: '/api/config/rate',
        GET_CHIP_RATES: '/api/chip-rates',
        TRANSFER_MUSK: '/api/p2p/transfer-musk',
        VIP_STATUS: '/api/vip/status',
        VIP_PURCHASE: '/api/vip/purchase',
        CHECKPOINT_STATUS: '/api/checkpoint-status',
        GET_TOKENOMICS: '/api/stats/tokenomics',
        GET_TOKENOMICS_HISTORY: '/api/stats/tokenomics'
    },

    // 👾 BOSS SYSTEM (4 endpoints)
    BOSS: {
        ACTIVE: '/api/boss/active',
        SCHEDULE: '/api/boss/schedule',
        GAMEPLAY_STATUS: '/api/boss',
        GET_MARKETPLACE: '/api/market/marketplace'
    },

    // 🧠 DEGAMEFI & NEURALINK (11 endpoints)
    DEGAMEFI: {
        INITIATE: '/api/degamefi/initiate',
        PROCESS_PAY: '/api/degamefi/process',
        GET_UPGRADEABLE_NEURALINKS: '/api/degamefi/upgradeable_neuralinks',
        GET_PROCESSES_AWAITING: '/api/degamefi/processes',
        GET_PROCESSES_REFINING: '/api/degamefi/processes',
        GET_PROCESSES_READY: '/api/degamefi/processes',
        CLAIM_PROCESS: '/api/degamefi/process',
        GET_PROCESS_HISTORY: '/api/degamefi/processes',
        LIQUIDATE: '/api/degamefi/liquidate',
        EQUIP_ITEM: '/api/degamefi/equip-item',
        UNEQUIP_ITEM: '/api/degamefi/unequip-item',
        COMPOSE_NEURALINK: '/api/degamefi/compose' // External API
    }
};

// Export as default for easy importing
export default API_ENDPOINTS;