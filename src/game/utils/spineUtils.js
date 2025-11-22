/**
 * Utility functions for Spine animations
 */

/**
 * Safely set animation on a spine object
 * @param {Object} spine - The spine object
 * @param {number} trackIndex - Animation track index (usually 0)
 * @param {string} animationName - Name of the animation
 * @param {boolean} loop - Whether to loop the animation
 * @returns {boolean} - True if animation was set successfully, false otherwise
 */
export function safeSetAnimation(
    spine,
    trackIndex = 0,
    animationName = "idle",
    loop = true
) {
    try {
        // console.log("safeSetAnimation called with:", {
        //     spine: spine,
        //     trackIndex: trackIndex,
        //     animationName: animationName,
        //     loop: loop,
        // });

        if (!spine) {
            console.warn("Spine object is null or undefined");
            return false;
        }

        // console.log("Spine object properties:", {
        //     hasAnimationState: !!spine.animationState,
        //     animationState: spine.animationState,
        //     hasSkeleton: !!spine.skeleton,
        //     skeleton: spine.skeleton,
        // });

        if (spine && spine.animationState) {
            // console.log(
            //     "Setting animation:",
            //     animationName,
            //     "with loop:",
            //     loop
            // );
            spine.animationState.setAnimation(trackIndex, animationName, loop);
            //console.log("Animation set successfully");
            return true;
        } else {
            // console.warn(
            //     "Spine object or animationState is not available:",
            //     spine
            // );
            return false;
        }
    } catch (error) {
        //console.error("Error setting spine animation:", error);
        return false;
    }
}

/**
 * Emergency fallback function for when animationState is undefined
 * @param {Object} spine - The spine object
 * @param {number} trackIndex - Animation track index (usually 0)
 * @param {string} animationName - Name of the animation
 * @param {boolean} loop - Whether to loop the animation
 * @returns {boolean} - True if animation was set successfully, false otherwise
 */
export function emergencySetAnimation(
    spine,
    trackIndex = 0,
    animationName = "idle",
    loop = true
) {
    try {
        if (!spine) {
            console.warn("Spine object is null or undefined");
            return false;
        }

        // Thử các cách khác nhau để set animation
        if (spine.animationState && spine.animationState.setAnimation) {
            spine.animationState.setAnimation(trackIndex, animationName, loop);
            return true;
        }

        if (spine.skeleton && spine.skeleton.setAnimation) {
            spine.skeleton.setAnimation(trackIndex, animationName, loop);
            return true;
        }

        if (spine.setAnimation) {
            spine.setAnimation(trackIndex, animationName, loop);
            return true;
        }

        // Thử tạo animationState nếu chưa có
        if (spine.skeleton && !spine.animationState) {
            //console.log("Creating animationState for spine");
            spine.animationState = new spine.skeleton.data.animationStateData();
            if (spine.animationState.setAnimation) {
                spine.animationState.setAnimation(
                    trackIndex,
                    animationName,
                    loop
                );
                return true;
            }
        }

        //console.warn("No valid animation method found for spine:", spine);
        return false;
    } catch (error) {
        //console.error("Error in emergencySetAnimation:", error);
        return false;
    }
}

/**
 * Safely play idle animation on a spine object
 * @param {Object} spine - The spine object
 * @returns {boolean} - True if animation was set successfully, false otherwise
 */
export function playIdleAnimation(spine) {
    //console.log("playIdleAnimation called with spine:", spine);
    const result = safeSetAnimation(spine, 0, "idle", true);
    if (!result) {
        //console.log("Trying emergency fallback for idle animation");
        return emergencySetAnimation(spine, 0, "idle", true);
    }
    return result;
}

/**
 * Safely play shoot animation on a spine object
 * @param {Object} spine - The spine object
 * @returns {boolean} - True if animation was set successfully, false otherwise
 */
export function playShootAnimation(spine) {
    //console.log("playShootAnimation called with spine:", spine);
    const result = safeSetAnimation(spine, 0, "shoot", false);
    if (!result) {
        //console.log("Trying emergency fallback for shoot animation");
        return emergencySetAnimation(spine, 0, "shoot", false);
    }
    return result;
}

/**
 * Safely play attack animation on a spine object
 * @param {Object} spine - The spine object
 * @returns {boolean} - True if animation was set successfully, false otherwise
 */
export function playAttackAnimation(spine) {
    //console.log("playAttackAnimation called with spine:", spine);
    const result = safeSetAnimation(spine, 0, "attack", false);
    if (!result) {
        //console.log("Trying emergency fallback for attack animation");
        return emergencySetAnimation(spine, 0, "attack", false);
    }
    return result;
}

/**
 * Safely play custom animation on a spine object
 * @param {Object} spine - The spine object
 * @param {string} animationName - Name of the animation
 * @param {boolean} loop - Whether to loop the animation
 * @returns {boolean} - True if animation was set successfully, false otherwise
 */
export function playCustomAnimation(spine, animationName, loop = false) {
    // console.log("playCustomAnimation called with:", {
    //     spine,
    //     animationName,
    //     loop,
    // });
    const result = safeSetAnimation(spine, 0, animationName, loop);
    if (!result) {
        // console.log(
        //     "Trying emergency fallback for custom animation:",
        //     animationName
        // );
        return emergencySetAnimation(spine, 0, animationName, loop);
    }
    return result;
}

/**
 * Destroy Spine object và cleanup memory
 * @param {SpineGameObject} spine - Spine object cần destroy
 * @param {Phaser.Scene} scene - Scene chứa spine object
 */
export function destroySpine(spine, scene) {
    if (!spine || !spine.active) {
        return; // Already destroyed
    }

    try {
        console.log(`[SpineUtils] Destroying spine: ${spine.name || 'unnamed'}`);

        // Step 1: Clear animation state
        if (spine.animationState) {
            try {
                // Stop all animations
                spine.animationState.clearTracks();

                // Clear listeners (prevent memory leaks)
                spine.animationState.clearListeners();

                // Nullify reference
                spine.animationState = null;
            } catch (error) {
                console.warn('[SpineUtils] Error clearing animationState:', error);
            }
        }

        // Step 2: Clear skeleton data
        if (spine.skeleton) {
            try {
                // Clear skeleton reference
                spine.skeleton = null;
            } catch (error) {
                console.warn('[SpineUtils] Error clearing skeleton:', error);
            }
        }

        // Step 3: Remove all event listeners
        if (spine.state) {
            try {
                spine.state.clearListeners();
                spine.state = null;
            } catch (error) {
                console.warn('[SpineUtils] Error clearing state:', error);
            }
        }

        // Step 4: Clear plugin data
        if (spine.plugin) {
            try {
                spine.plugin = null;
            } catch (error) {
                console.warn('[SpineUtils] Error clearing plugin:', error);
            }
        }

        // Step 5: Remove from scene display list
        if (scene && spine.scene) {
            try {
                spine.scene = null;
            } catch (error) {
                console.warn('[SpineUtils] Error removing from scene:', error);
            }
        }

        // Step 6: Destroy the GameObject
        if (spine.destroy) {
            spine.destroy();
        }

        console.log('[SpineUtils] Spine destroyed successfully');

    } catch (error) {
        console.error('[SpineUtils] Fatal error destroying spine:', error);
    }
}

/**
 * Destroy multiple spine objects
 * @param {Array<SpineGameObject>} spines - Array of spine objects
 * @param {Phaser.Scene} scene - Scene chứa spine objects
 */
export function destroySpines(spines, scene) {
    if (!Array.isArray(spines)) {
        console.warn('[SpineUtils] destroySpines: input is not an array');
        return;
    }

    console.log(`[SpineUtils] Destroying ${spines.length} spine objects`);

    spines.forEach((spine, index) => {
        try {
            destroySpine(spine, scene);
        } catch (error) {
            console.error(`[SpineUtils] Error destroying spine ${index}:`, error);
        }
    });

    console.log('[SpineUtils] All spines destroyed');
}

/**
 * Clear spine texture cache (gọi khi scene shutdown)
 * @param {Phaser.Scene} scene - Scene cần clear cache
 * @param {Array<string>} spineKeys - Array of spine keys to clear
 */
export function clearSpineCache(scene, spineKeys = []) {
    if (!scene || !scene.textures) {
        console.warn('[SpineUtils] clearSpineCache: invalid scene');
        return;
    }

    console.log(`[SpineUtils] Clearing spine cache for ${spineKeys.length} keys`);

    try {
        spineKeys.forEach(key => {
            // Remove từ texture manager
            if (scene.textures.exists(key)) {
                scene.textures.remove(key);
                console.log(`[SpineUtils] Removed texture: ${key}`);
            }

            // Remove từ cache manager
            if (scene.cache && scene.cache.json && scene.cache.json.exists(key)) {
                scene.cache.json.remove(key);
            }
        });

        console.log('[SpineUtils] Spine cache cleared successfully');

    } catch (error) {
        console.error('[SpineUtils] Error clearing spine cache:', error);
    }
}

/**
 * Debug function to check spine object
 * @param {Object} spine - The spine object to debug
 */
export function debugSpine(spine) {
    console.log("=== SPINE DEBUG ===");
    console.log("Spine object:", spine);
    console.log("Type:", typeof spine);
    console.log("Constructor:", spine?.constructor?.name);
    console.log("Has animationState:", !!spine?.animationState);
    console.log("Has skeleton:", !!spine?.skeleton);
    console.log(
        "Available animations:",
        spine?.skeleton?.data?.animations?.map((a) => a.name) || []
    );
    console.log("==================");
}
