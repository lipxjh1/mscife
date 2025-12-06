// World ID MiniKit Module - Main Exports
export { MiniKitProvider, useMiniKit } from './MiniKitProvider';
export { useWorldId } from './useWorldId';
export { default as WorldIdLogin } from './WorldIdLogin';
export { default as NotInWorldApp } from './NotInWorldApp';
export { WORLD_ID_CONFIG } from './config';

// Module info
export const WORLD_ID_MODULE = {
    name: 'world-id-minikit',
    version: '1.0.0',
    description: 'World ID MiniKit integration module for MSCI Game',
    dependencies: ['@worldcoin/minikit-js'],
    features: ['World ID verification', 'One-tap login', 'World App detection']
};