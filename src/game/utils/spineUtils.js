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
