import PropTypes from "prop-types";
import { forwardRef, useEffect, useLayoutEffect, useRef } from "react";
import StartGame from "./main";
import { EventBus } from "./EventBus";

export const PhaserGame = forwardRef(function PhaserGame(
    {
        currentActiveScene,
        phaserWalletConnect,
        phaserWalletDisconnect,
        phaserSendTransaction,
        phaserNftCharacters,
        phaserSuiWalletConnect,
        phaserSuiWalletDisconnect,
        phaserLoginGoogle,
    },
    ref
) {
    const game = useRef();

    // Create the game inside a useLayoutEffect hook to avoid the game being created outside the DOM
    useLayoutEffect(() => {
        if (game.current === undefined) {
            game.current = StartGame("game-container");

            if (ref !== null) {
                ref.current = { game: game.current, scene: null };
            }
        }

        return () => {
            if (game.current) {
                game.current.destroy(true);
                game.current = undefined;
            }
        };
    }, [ref]);

    useEffect(() => {
        EventBus.on("current-scene-ready", (currentScene) => {
            if (currentActiveScene instanceof Function) {
                currentActiveScene(currentScene);
            }
            ref.current.scene = currentScene;
        });

        return () => {
            EventBus.removeListener("current-scene-ready");
        };
    }, [currentActiveScene, ref]);

    useEffect(() => {
        EventBus.on("react-wallet-connect", () => {
            if (phaserWalletConnect instanceof Function) {
                phaserWalletConnect();
            }
        });

        return () => {
            EventBus.removeListener("react-wallet-connect");
        };
    }, [phaserWalletConnect, ref]);

    useEffect(() => {
        EventBus.on("react-wallet-disconnect", () => {
            if (phaserWalletDisconnect instanceof Function) {
                phaserWalletDisconnect();
            }
        });

        return () => {
            EventBus.removeListener("react-wallet-disconnect");
        };
    }, [phaserWalletDisconnect, ref]);

    useEffect(() => {
        EventBus.on(
            "react-send-transaction",
            (amount, receiver, onSuccess, onError) => {
                if (phaserSendTransaction instanceof Function) {
                    phaserSendTransaction(amount, receiver, onSuccess, onError);
                }
            }
        );

        return () => {
            EventBus.removeListener("react-send-transaction");
        };
    }, [phaserSendTransaction, ref]);

    useEffect(() => {
        EventBus.on("react-nft-characters", (onSuccess, onError) => {
            if (phaserNftCharacters instanceof Function) {
                phaserNftCharacters(onSuccess, onError);
            }
        });

        return () => {
            EventBus.removeListener("react-nft-characters");
        };
    }, [phaserNftCharacters, ref]);

    //Sui wallet

    useEffect(() => {
        EventBus.on("react-sui-wallet-connect", () => {
            if (phaserSuiWalletConnect instanceof Function) {
                phaserSuiWalletConnect();
            }
        });

        return () => {
            EventBus.removeListener("react-sui-wallet-connect");
        };
    }, [phaserSuiWalletConnect, ref]);

    useEffect(() => {
        EventBus.on("react-sui-wallet-disconnect", () => {
            if (phaserSuiWalletDisconnect instanceof Function) {
                phaserSuiWalletDisconnect();
            }
        });

        return () => {
            EventBus.removeListener("react-sui-wallet-disconnect");
        };
    }, [phaserSuiWalletDisconnect, ref]);

    useEffect(() => {
        EventBus.on("react-login-google", (onSuccess, onError) => {
            if (phaserLoginGoogle instanceof Function) {
                phaserLoginGoogle(onSuccess, onError);
            }
        });

        return () => {
            EventBus.removeListener("react-login-google");
        };
    }, [phaserLoginGoogle, ref]);

    return <div id="game-container"></div>;
});

// Props definitions
PhaserGame.propTypes = {
    currentActiveScene: PropTypes.func,
    phaserWalletConnect: PropTypes.func,
    phaserWalletDisconnect: PropTypes.func,
    phaserSendTransaction: PropTypes.func,
    phaserNftCharacters: PropTypes.func,
    phaserSuiWalletConnect: PropTypes.func,
    phaserSuiWalletDisconnect: PropTypes.func,
    phaserLoginGoogle: PropTypes.func,
};
