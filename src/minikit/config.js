// World ID Configuration
export const WORLD_ID_CONFIG = {
    APP_ID: import.meta.env.VITE_WORLD_ID_APP_ID || 'app_c1f666c83bbbc687bde452e4acb51b40',
    ACTION: import.meta.env.VITE_WORLD_ID_ACTION || 'msci-login',
    API_ENDPOINT: '/api/world-id/login',
    STATUS_ENDPOINT: '/api/world-id/status',
    VERIFICATION_LEVELS: ['device', 'orb'],
    DEFAULT_LEVEL: 'device'
};

export default WORLD_ID_CONFIG;