import { CreateAlertPopup } from "../../Share/AlertPopup.js";
import centerData from "../../../Data/CenterData.js";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import { GetNeuralinkInfo } from "./HomeNeuralinkUpgrade.js";
import { ActiveNeuralinkInventoryInprogress } from "./HomeNeuralinkInventoryInprogress.js";

//let timeRemainToUpgrade = 60;
let timeRemainToUpgrade = 86400;

export function CreateNeuralinkProcessUpgradePopup(
    scene,
    upgradeId,
    quantity,
    onCompleteCallback
) {
    let caculatedMSCI =
        quantity * GetNeuralinkInfo().upgradeRequirements.finalCost;

    CreateAlertPopup(
        scene,
        cdLocalization.getLocalization(
            cdLocalization.GROUP_KEYS.Neuralink.KEY,
            `Would you like to use ${caculatedMSCI} $MSCI to complete the process of upgrading ${quantity} Neuralink?`
        ),
        () => {
            centerData.RequestNeuralinkUpgradeSecond(
                upgradeId,
                (result) => {
                    CreateAlertPopup(
                        scene,
                        `Congratulations! You have successfully upgraded your Neuralink to Connected Neuralink. Please return to claim it when the refinement period ends`,
                        () => {
                            if (
                                onCompleteCallback &&
                                typeof onCompleteCallback === "function"
                            ) {
                                onCompleteCallback();
                            }

                            ActiveNeuralinkInventoryInprogress(scene, true);
                        },
                        (error) => {
                            //console.log("error: ", error);
                        }
                    );
                },
                (error) => {
                    //console.log("error: ", error);

                    CreateAlertPopup(scene, error.message);
                }
            );
        },
        () => {
            CreateAlertPopup(
                scene,
                `If upgrade process is not completed, you will lose all Neuralink and $MSCI assets that were entered into the upgrade process.`
            );
        }
    );
}

export function checkUpgradeAvailability(
    scene,
    deadlineTimestamp,
    onAvailableCallback
) {
    let secondRemaining = calculateRemainingSeconds(deadlineTimestamp);

    if (secondRemaining <= timeRemainToUpgrade) {
        if (onAvailableCallback && typeof onAvailableCallback === "function") {
            onAvailableCallback();
        }
    } else {
        CreateAlertPopup(
            scene,
            cdLocalization.getLocalization(
                cdLocalization.GROUP_KEYS.Neuralink.KEY,
                `You need to wait {i} to upgrade again`,
                [formatSecondsToHMS(secondRemaining - timeRemainToUpgrade)]
            )
        );
    }
}

export function GetTimeRemainToUpgrade() {
    return timeRemainToUpgrade;
}

function calculateRemainingSeconds(targetDateTimeString) {
    // 1. Convert target time string to Date object (UTC)
    const targetDate = new Date(targetDateTimeString);

    // 2. Get current time
    const now = new Date();

    // 3. Calculate difference in milliseconds
    // If targetDate < now, result will be negative (time has passed)
    const diffMilliseconds = targetDate.getTime() - now.getTime();

    // 4. Convert milliseconds to seconds and round down
    const diffSeconds = Math.floor(diffMilliseconds / 1000);

    return diffSeconds;
}

function formatSecondsToHMS(totalSeconds) {
    // Ensure input is a non-negative integer
    if (
        typeof totalSeconds !== "number" ||
        totalSeconds < 0 ||
        !Number.isInteger(totalSeconds)
    ) {
        console.error("Input must be a non-negative integer.");
        return null;
    }

    // Calculate days first
    const days = Math.floor(totalSeconds / 86400); // 1 day = 86400 seconds
    const remainingSeconds = totalSeconds % 86400;

    // Calculate hours, minutes, seconds from remaining seconds
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    // Get localized "Days" string
    let dayStr = cdLocalization.getLocalization(
        cdLocalization.GROUP_KEYS.Neuralink.KEY,
        `Days`
    );

    // Helper function to add leading zero if number < 10
    function pad(num) {
        return num < 10 ? "0" + num : num;
    }

    // Return formatted string matching "X Days HH:MM:SS" pattern
    return `${days} ${dayStr} ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
