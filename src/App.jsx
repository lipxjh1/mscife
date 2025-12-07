import { useRef, useState, useEffect } from "react";

import Phaser from "phaser";
import { PhaserGame } from "./game/PhaserGame";
import LinkGoogleAccount from "./pages/LinkGoogleAccount";
import vorldAuth, { OTPInput } from './modules/vorld-auth';
import VorldLoginModal from './game/scenes/Share/share-react/VorldLoginModal.jsx';

import { init as initTelegramWebApp, viewport } from "@telegram-apps/sdk";

import {
    useTonConnectUI,
    useTonAddress,
    useTonWallet,
    useTonConnectModal,
} from "@tonconnect/ui-react";

import { beginCell, Address } from "@ton/core";

import centerData from "./game/Data/CenterData.js";
import LoadingOverlay from "./game/scenes/Share/share-react/LoadingOverlay.jsx";
import ConfirmPopup from "./game/scenes/Share/share-react/ConfirmPopup.jsx";
import GoogleLoginContainer from "./game/scenes/Share/share-react/GoogleLoginContainer.jsx";
import GoogleLoginTelegramLinkContainer from "./game/scenes/Share/share-react/GoogleLoginTelegramLinkContainer.jsx";

import { EventBus } from "./game/EventBus.js";

import {
    GoogleLogin,
    useGoogleLogin,
    useGoogleOneTapLogin,
    googleLogout,
    useGoogleOAuth,
} from "@react-oauth/google";
import { lazy, Suspense } from "react";
import axios from "axios";
const AuthOneTap = lazy(() => import("./auth/AuthOneTap.jsx"));

// ========================================
// NEW: ARENA GAME IMPORT
// ========================================
import ArenaTab from "./components/Arena/ArenaTab.jsx";
import ArenaUI from "./components/Arena/ArenaUI.jsx";
import './services/socket.js'; // Initialize socket connection

// ========================================
// NEW: DISCONNECT MODAL
// ========================================
import DisconnectModal from "./components/Connection/DisconnectModal.jsx";

// ========================================
// NEW: AUTH WRAPPER
// ========================================
import AuthWrapper from "./components/Auth/AuthWrapper.jsx";

// ========================================
// NEW: WORLD ID MINIKIT
// ========================================
import { MiniKitProvider } from "./minikit/MiniKitProvider";
import WorldIDLoginManager from "./components/WorldIDLoginManager";

//import { useWallet, ConnectButton, ConnectModal } from "@suiet/wallet-kit";

function App() {
    // The sprite can only be moved in the MainMenu Scene
    const [canMoveSprite, setCanMoveSprite] = useState(true);

    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef();
    const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });
    const [showLoading, setShowLoading] = useState(false);

    // Routing state
    const [currentPage, setCurrentPage] = useState("game");

    // Vorld Auth State
    const [showVorldOTP, setShowVorldOTP] = useState(false);
    const [vorldEmail, setVorldEmail] = useState('');
    const [showVorldLoginPopup, setShowVorldLoginPopup] = useState(false);  // NEW: Login popup state

    const [isPopupOpen, setPopupOpen] = useState(false);
    const [popupConfig, setPopupConfig] = useState(null);
    const [showGoogleLogin, setShowGoogleLogin] = useState(false);
    const [showGoogleLoginTelegramLink, setShowGoogleLoginTelegramLink] =
        useState(false);

    useEffect(() => {
        // Đăng ký lắng nghe sự kiện hiển thị LoadingOverlay
        const showLoadingListener = () => setShowLoading(true);
        // Đăng ký lắng nghe sự kiện ẩn LoadingOverlay
        const hideLoadingListener = () => setShowLoading(false);

        // Đăng ký các sự kiện với EventBus
        EventBus.on("show-loading", showLoadingListener);
        EventBus.on("hide-loading", hideLoadingListener);

        // Cleanup listeners khi component unmount
        return () => {
            EventBus.off("show-loading", showLoadingListener);
            EventBus.off("hide-loading", hideLoadingListener);
        };
    }, []);

    // Lắng nghe yêu cầu hiển thị popup từ Phaser
    useEffect(() => {
        /**
         * Xử lý hiển thị popup từ các sự kiện Phaser
         * @param {Object} config - Cấu hình popup
         * @param {string} config.title - Tiêu đề popup
         * @param {string} config.message - Nội dung thông báo
         * @param {string} [config.confirmText] - Nút xác nhận
         * @param {string} [config.cancelText] - Nút hủy
         * @param {string} config.confirmEvent - Sự kiện khi xác nhận
         * @param {string} [config.cancelEvent] - Sự kiện khi hủy
         * @param {boolean} [config.showBothButtons] - Hiển thị cả 2 nút hay chỉ 1 nút
         */
        const handleShowPopup = (config) => {
            setPopupConfig({
                title: config.title,
                message: config.message,
                confirmText: config.confirmText,
                cancelText: config.cancelText,
                showBothButtons:
                    config.showBothButtons !== undefined
                        ? config.showBothButtons
                        : true,
                onConfirm: () => {
                    EventBus.emit(config.confirmEvent);
                    setPopupOpen(false);
                },
                onCancel: () => {
                    if (config.cancelEvent) {
                        EventBus.emit(config.cancelEvent);
                    }
                    setPopupOpen(false);
                },
            });
            setPopupOpen(true);
        };

        EventBus.on("ui:show-popup", handleShowPopup);

        return () => {
            EventBus.off("ui:show-popup", handleShowPopup);
        };
    }, []);

    // Lắng nghe hiển thị/ẩn Google Login từ EventBus
    useEffect(() => {
        const handleShowGoogleLogin = () => setShowGoogleLogin(true);
        const handleHideGoogleLogin = () => setShowGoogleLogin(false);

        EventBus.on("ui:show-google-login", handleShowGoogleLogin);
        EventBus.on("ui:hide-google-login", handleHideGoogleLogin);

        return () => {
            EventBus.off("ui:show-google-login", handleShowGoogleLogin);
            EventBus.off("ui:hide-google-login", handleHideGoogleLogin);
        };
    }, []);

    // Lắng nghe hiển thị/ẩn Google Login Telegram Link từ EventBus
    useEffect(() => {
        const handleShowGoogleLoginTelegramLink = () =>
            setShowGoogleLoginTelegramLink(true);
        const handleHideGoogleLoginTelegramLink = () =>
            setShowGoogleLoginTelegramLink(false);

        EventBus.on(
            "ui:show-google-login-telegram-link",
            handleShowGoogleLoginTelegramLink
        );
        EventBus.on(
            "ui:hide-google-login-telegram-link",
            handleHideGoogleLoginTelegramLink
        );

        return () => {
            EventBus.off(
                "ui:show-google-login-telegram-link",
                handleShowGoogleLoginTelegramLink
            );
            EventBus.off(
                "ui:hide-google-login-telegram-link",
                handleHideGoogleLoginTelegramLink
            );
        };
    }, []);

    // Vorld Auth: Listen for OTP event from Phaser
    useEffect(() => {
        const handleShowOTP = (data) => {
            console.log('🔐 Show Vorld OTP for:', data.email);
            setVorldEmail(data.email);
            setShowVorldOTP(true);
        };

        EventBus.on('vorld:show-otp', handleShowOTP);

        return () => {
            EventBus.removeListener('vorld:show-otp', handleShowOTP);
        };
    }, []);

    // ========================================
    // NEW: Vorld Auth - Login Popup Listeners
    // ========================================
    useEffect(() => {
        /**
         * Show Vorld Login Modal
         * Triggered when user clicks "Đăng nhập bằng Vorld" button
         */
        const handleShowLoginPopup = () => {
            console.log('[App] Showing Vorld login popup');
            setShowVorldLoginPopup(true);
        };
        
        /**
         * Handle Vorld Login Submit
         * Triggered when user submits email/password in modal
         */
        const handleLoginSubmit = ({ email, password }) => {
            console.log('[App] Vorld login submit:', email);
            
            // Close login popup
            setShowVorldLoginPopup(false);
            
            // Get current scene reference from phaserRef (same pattern as changeScene, moveSprite, addSprite)
            const currentScene = phaserRef.current?.scene;
            
            // Call RequestVorldLogin method
            if (currentScene && typeof currentScene.RequestVorldLogin === 'function') {
                console.log('[App] Calling scene.RequestVorldLogin()');
                currentScene.RequestVorldLogin(email, password);
            } else {
                console.error('[App] RequestVorldLogin method not found on scene');
                console.log('[App] Available scene:', currentScene);
            }
        };

        EventBus.on('show-vorld-login-popup', handleShowLoginPopup);
        EventBus.on('vorld-login-submit', handleLoginSubmit);

        return () => {
            EventBus.off('show-vorld-login-popup', handleShowLoginPopup);
            EventBus.off('vorld-login-submit', handleLoginSubmit);
        };
    }, []);

    const changeScene = () => {
        const scene = phaserRef.current.scene;

        if (scene) {
            scene.changeScene();
        }
    };

    const moveSprite = () => {
        const scene = phaserRef.current.scene;

        if (scene && scene.scene.key === "MainMenu") {
            // Get the update logo position
            scene.moveLogo(({ x, y }) => {
                setSpritePosition({ x, y });
            });
        }
    };

    const addSprite = () => {
        const scene = phaserRef.current.scene;

        if (scene) {
            // Add more stars
            const x = Phaser.Math.Between(64, scene.scale.width - 64);
            const y = Phaser.Math.Between(64, scene.scale.height - 64);

            //  `add.sprite` is a Phaser GameObjectFactory method and it returns a Sprite Game Object instance
            const star = scene.add.sprite(x, y, "star");

            //  ... which you can then act upon. Here we create a Phaser Tween to fade the star sprite in and out.
            //  You could, of course, do this from within the Phaser Scene code, but this is just an example
            //  showing that Phaser objects and systems can be acted upon from outside of Phaser itself.
            scene.add.tween({
                targets: star,
                duration: 500 + Math.random() * 1000,
                alpha: 0,
                yoyo: true,
                repeat: -1,
            });
        }
    };

    // Event emitted from the PhaserGame component
    const currentScene = (scene) => {
        setCanMoveSprite(scene.scene.key !== "MainMenu");
    };

    const ReactInitRelegram = async () => {
        // Khởi tạo Telegram WebApp
        await initTelegramWebApp();
        // Mount viewport trước
        await viewport.mount();
        // Sau đó mới gọi requestFullscreen
        try {
            await viewport.requestFullscreen();
        } catch (error) {
            //console.error("Không thể chuyển sang chế độ toàn màn hình:", error);
        }
    };

    useEffect(() => {
        ReactInitRelegram();
    }, []);

    // Routing logic
    useEffect(() => {
        const path = window.location.pathname;

        if (path === "/link-google-account") {
            setCurrentPage("link-google");
        } else {
            setCurrentPage("game");
        }
    }, []);

    // World ID login success listener
    useEffect(() => {
        const handleWorldIdLoginSuccess = (data) => {
            console.log('🎉 World ID login successful in App!', data);

            // Get current scene and notify it
            const currentScene = phaserRef.current?.scene;
            if (currentScene) {
                EventBus.emit('auth-success', {
                    type: 'world-id',
                    user: data.user,
                    tokens: data.tokens
                });
            }
        };

        EventBus.on('world-id-login-success', handleWorldIdLoginSuccess);

        return () => {
            EventBus.off('world-id-login-success', handleWorldIdLoginSuccess);
        };
    }, []);

    // Google auth: chỉ mount One Tap khi người dùng yêu cầu
    const [showOneTapGoogleSigin, setShowOneTapGoogleSigin] = useState(false);

    // let login = useGoogleLogin({
    //     onSuccess: async (tokenResponse) => {
    //         console.log(tokenResponse);
    //         centerData.RequestSigninGoogle(
    //             tokenResponse.access_token,
    //             (result) => {
    //                 console.log(result);
    //             },
    //             (error) => {
    //                 console.log(error);
    //             }
    //         );

    //         console.log(userInfo);
    //     },
    //     onError: (error) => {
    //         console.log("Google login error: ", error);
    //     },
    // });

    // let login = useGoogleOneTapLogin({
    //     onSuccess: (credentialResponse) => {
    //         console.log(credentialResponse);
    //     },
    //     onError: () => {
    //         console.log("Login Failed");
    //     },
    // });

    let onLoginGoogleSuccess = null;
    let onLoginGoogleError = null;

    const ReactLoginGoogle = (onSuccess, onError) => {
        onLoginGoogleSuccess = onSuccess;
        onLoginGoogleError = onError;

        setShowOneTapGoogleSigin(true);
    };

    const handleGoogleLogin = () => {
        googleLogin();

        setShowOneTapGoogleSigin(true);
        //login();
    };

    const handleGoogleLogout = () => {
        googleLogout();
    };

    //Ton Wallet

    const [tonConnecting, setTonConnecting] = useState(false);

    const [tonDisconnecting, setTonDisconnecting] = useState(false);

    const [tonConnectUI, setOptions] = useTonConnectUI();
    //tonConnectUI.disconnect();

    const { state, open, close } = useTonConnectModal();
    const tonWallet = useTonWallet();

    const userFriendlyAddress = useTonAddress();
    const rawAddress = useTonAddress(false);

    // console.log("wallet frienly address: ", userFriendlyAddress);
    // console.log("wallet raw address: ", rawAddress);

    const ReactWalletConnect = async (onConnected, onDisconnected) => {
        setTonConnecting(true);

        open();

        centerData.SetModalState(true);
    };

    const ReactWalletDisconnect = async (
        onDisconnected,
        onDisconnectedError
    ) => {
        setTonDisconnecting(true);

        centerData.SetWalletAddress("");

        tonConnectUI.disconnect();
    };

    // Modified useEffect to use callbacks from state
    useEffect(() => {
        if (userFriendlyAddress && userFriendlyAddress != "") {
            centerData.walletType = centerData.WalletType.TON.KEY;

            centerData.SetWalletAddress(userFriendlyAddress);

            centerData.SetModalState(centerData.ModalState.Close.KEY);

            setTonConnecting(false);
        }

        if (tonConnecting) {
            console.log("Ton set ModalState");

            centerData.SetModalState(tonConnectUI.modalState.status);

            if (tonConnectUI.modalState === centerData.ModalState.Close.KEY) {
                setTonConnecting(false);
            }
        }

        if (tonDisconnecting) {
            if (userFriendlyAddress == null || userFriendlyAddress === "") {
                centerData.SetWalletAddress("");

                setTonDisconnecting(false);
            }
        }

        console.log("tonConnectUI.modalState: ", tonConnectUI.modalState);
    }, [
        userFriendlyAddress,
        tonConnecting,
        tonDisconnecting,
        tonConnectUI.modalState,
    ]); // Fixed dependency array

    const ReactSendTransaction = async (
        amount,
        receiver,
        onSuccess,
        onError
    ) => {
        // ═══════════════════════════════════════════════════════
        // DEBUG LOGGING - START
        // ═══════════════════════════════════════════════════════
        console.log("═".repeat(60));
        console.log("🚀 ReactSendTransaction CALLED");
        console.log("═".repeat(60));
        console.log("📊 Parameters:", {
            amount,
            receiver,
            receiverLength: receiver?.length,
            receiverPrefix: receiver?.substring(0, 3),
            hasOnSuccess: typeof onSuccess === "function",
            hasOnError: typeof onError === "function"
        });
        console.log("🔗 TonConnect State:", {
            tonConnectUI: !!tonConnectUI,
            connected: tonConnectUI?.connected,
            account: tonConnectUI?.account?.address,
            wallet: tonConnectUI?.wallet?.name
        });
        console.log("👤 User Info:", {
            userId: centerData?.userInfo?.UserId,
            hasCenterData: !!centerData
        });
        // ═══════════════════════════════════════════════════════
        // DEBUG LOGGING - END
        // ═══════════════════════════════════════════════════════

        const body = beginCell()
            .storeUint(0, 32)
            .storeStringTail(`${centerData.userInfo.UserId || ""}|${amount}`)
            .endCell();

        // ═══════════════════════════════════════════════════════
        // FIX: AMOUNT FORMAT - Convert to STRING
        // ═══════════════════════════════════════════════════════
        console.log("💰 Converting amount to nanoton string...");

        let amountInNanoton;
        try {
            // Convert TON to nanoton (1 TON = 1,000,000,000 nanoton)
            // Must be STRING for TonConnect SDK
            amountInNanoton = BigInt(Math.floor(amount * 1e9)).toString();

            console.log("   Original amount (TON):", amount);
            console.log("   Nanoton (number):", Math.floor(amount * 1e9));
            console.log("   Nanoton (string):", amountInNanoton);
            console.log("   ✅ Amount converted to string format");
        } catch (conversionError) {
            console.error("❌ Amount conversion failed:", conversionError);
            if (onError) onError(new Error("Failed to convert amount"));
            return;
        }
        // ═══════════════════════════════════════════════════════

        const transaction = {
            validUntil: Math.floor(Date.now() / 1000) + 60, // 1 minutes
            messages: [
                {
                    address: receiver,
                    amount: amountInNanoton, // ← FIXED: String format
                    payload: body.toBoc().toString("base64"),
                },
            ],
        };

        console.log("📤 Transaction Object:", {
            validUntil: transaction.validUntil,
            messageCount: transaction.messages.length,
            message: {
                address: transaction.messages[0].address,
                amount: transaction.messages[0].amount,
                amountType: typeof transaction.messages[0].amount, // Should show "string"
                payloadLength: transaction.messages[0].payload.length
            }
        });

        try {
            console.log("🔗 Calling tonConnectUI.sendTransaction...");
            const result = await tonConnectUI.sendTransaction(transaction);

            console.log("✅ SUCCESS! Transaction sent:", result);

            if (onSuccess && typeof onSuccess === "function") {
                onSuccess(result);
            }
        } catch (error) {
            console.error("═".repeat(60));
            console.error("❌ TRANSACTION FAILED");
            console.error("═".repeat(60));
            console.error("❌ Error Type:", error.constructor.name);
            console.error("❌ Error Message:", error.message);
            console.error("❌ Error Code:", error.code);

            // ═══════════════════════════════════════════════════════
            // FIX: SMART ERROR DETECTION
            // ═══════════════════════════════════════════════════════
            let userMessage = "Transaction failed. Please try again.";

            // Detect error type based on message and name
            const errorMsg = (error.message || "").toLowerCase();
            const errorName = error.name || "";

            if (errorName === 'UserRejectsError' ||
                errorMsg.includes('reject') ||
                errorMsg.includes('cancel') ||
                (errorMsg.includes('user') && errorMsg.includes('cancel'))) {
                userMessage = "Transaction cancelled by user";
                console.error("   → User cancellation detected");
            } else if (errorMsg.includes('insufficient')) {
                userMessage = "Insufficient funds in wallet";
                console.error("   → Insufficient funds detected");
            } else if (errorMsg.includes('timeout') || errorMsg.includes('timed out')) {
                userMessage = "Transaction timed out. Please try again";
                console.error("   → Timeout detected");
            } else if (errorMsg.includes('network') || errorMsg.includes('connection')) {
                userMessage = "Network error. Check your connection";
                console.error("   → Network error detected");
            } else {
                console.error("   → Generic error - using default message");
            }

            console.error("❌ User-facing message:", userMessage);
            console.error("═".repeat(60));
            // ═══════════════════════════════════════════════════════

            if (onError && typeof onError === "function") {
                onError(new Error(userMessage));
            }
        }    };

    function toNanoTon(amount) {
        amount = Number(amount);

        return amount * 1_000_000_000; // Chuyển từ TON sang nanoton
    }

    // EventBus listener for TON transactions
    useEffect(() => {
        const handleReactSendTransaction = (amount, receiver, onSuccess, onError) => {
            ReactSendTransaction(amount, receiver, onSuccess, onError);
        };

        EventBus.on("react-send-transaction", handleReactSendTransaction);

        return () => {
            EventBus.off("react-send-transaction", handleReactSendTransaction);
        };
    }, []); // Empty deps = run once on mount

    // Hoặc sử dụng tonAPI
    const ReactNftCharacters = async (onSuccess, onError) => {
        if (!tonConnectUI.account) return;

        let friendlyCollectionAddress =
            "EQC2rvOp-eEfdJUnJN1ORvoIb5PMu8J_fnBos0gmqJBHEBEW";

        const friendlyParse = Address.parse(friendlyCollectionAddress);

        let rawCollectionAddress = friendlyParse.toRawString();

        try {
            const response = await fetch(
                `https://tonapi.io/v2/accounts/${rawAddress}/nfts?collection=${rawCollectionAddress}&limit=1000&offset=0&indirect_ownership=true`
            );
            const result = await response.json();
            //console.log("NFTs from tonAPI:", result);

            let arr_ids = [];

            if (result.nft_items) {
                for (let i = 0; i < result.nft_items.length; i++) {
                    let nft = result.nft_items[i];

                    const rawParse = Address.parse(nft.address);

                    arr_ids.push(rawParse.toString());
                }

                //console.log("arr_ids:", arr_ids);
            } else {
                //console.log("no nft characters");
            }

            if (onSuccess && typeof onSuccess === "function") {
                onSuccess(arr_ids);
            }
        } catch (error) {
            //console.error("Error:", error);

            if (onError && typeof onError === "function") {
                onError(error);
            }
        }
    };

    // Hoặc sử dụng tonAPI
    const fetchJettonsTonAPI = async () => {
        if (!tonConnectUI.account) return;

        try {
            const response = await fetch(
                `https://tonapi.io/v2/accounts/${rawAddress}/jettons?currencies=ton`
            );
            const data = await response.json();
            console.log("NFTs from tonAPI:", data);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    // //Sui Wallet

    // const [suiConnecting, setSuiConnecting] = useState(false);

    // const [suiDisconnecting, setSuiDisconnecting] = useState(false);

    // const [showModal, setShowModal] = useState(false);

    // //const suiWallet = useAccounts();

    // const suiWallet = useWallet();

    // console.log("suiWallet", suiWallet);

    // const ReactSuiWalletConnect = async () => {
    //     setSuiConnecting(true);

    //     setShowModal(true);

    //     centerData.SetModalState(true);
    // };

    // const ReactSuiWalletDisconnect = async () => {
    //     setSuiDisconnecting(true);

    //     suiWallet.disconnect();
    // };

    // // Modified useEffect to use callbacks from state
    // useEffect(() => {
    //     if (suiWallet && suiWallet.address && suiWallet.address != "") {
    //         centerData.walletType = centerData.WalletType.SUI.KEY;
    //         centerData.SetWalletAddress(suiWallet.address);
    //         setShowModal(false);
    //         centerData.SetModalState(centerData.ModalState.Close.KEY);
    //         setSuiConnecting(false);
    //     }

    //     console.log("suiConnecting: ", suiConnecting);

    //     if (suiConnecting) {
    //         if (showModal == true) {
    //             centerData.SetModalState(centerData.ModalState.Open.KEY);
    //         } else {
    //             centerData.SetModalState(centerData.ModalState.Close.KEY);
    //             setSuiConnecting(false);
    //         }

    //         console.log("Sui modalState: ", showModal);
    //     }

    //     if (suiDisconnecting) {
    //         if (
    //             suiWallet == null ||
    //             suiWallet.address == null ||
    //             suiWallet.address === ""
    //         ) {
    //             centerData.SetWalletAddress("");
    //             setSuiDisconnecting(false);
    //         }
    //     }
    // }, [suiWallet, suiConnecting, showModal, suiDisconnecting]);

    // Vorld Auth: Handle OTP verification
    const handleVorldOTPVerify = async (otp) => {
        console.log('🔐 Verifying Vorld OTP:', otp);
        
        const result = await vorldAuth.verifyOTP(vorldEmail, otp);
        
        if (result.success) {
            console.log('✅ Vorld OTP verified:', result.user);
            setShowVorldOTP(false);
            
            // Notify Phaser
            EventBus.emit('vorld:otp-success', {
                user: result.user,
                tokens: result.tokens
            });
        } else {
            console.error('❌ Vorld OTP failed:', result.error);
            throw new Error(result.error);
        }
    };

    const handleVorldOTPBack = () => {
        console.log('🔙 Vorld OTP cancelled');
        setShowVorldOTP(false);
        setVorldEmail('');
    };

    // Check if we should show World ID login or regular app
    if (!isReady) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <div style={{
                    color: 'white',
                    fontSize: '1.2rem',
                    textAlign: 'center'
                }}>
                    Loading...
                </div>
            </div>
        );
    }

    // If in World App and not logged in, show World ID login
    if (isInstalled && !localStorage.getItem('accessToken')) {
        return <WorldIdLogin />;
    }

    // If not in World App and not logged in, show regular login or fallback
    if (!isInstalled && !localStorage.getItem('accessToken')) {
        // In production, show NotInWorldApp
        if (process.env.NODE_ENV === 'production') {
            return <NotInWorldApp />;
        }
        // In development, show regular app with warning
    }

    return (
        <div id="app">
            <MiniKitProvider>
                <AuthWrapper>
                    <WorldIDLoginManager />
                {/* ========================================
                    NEW: DISCONNECT MODAL (Persistent, Center Screen)
                    ======================================== */}
                <DisconnectModal />

                {currentPage === "link-google" ? (
                    <LinkGoogleAccount />
                ) : (
                    <PhaserGame
                        ref={phaserRef}
                        currentActiveScene={currentScene}
                        phaserWalletConnect={ReactWalletConnect}
                        phaserWalletDisconnect={ReactWalletDisconnect}
                        phaserSendTransaction={ReactSendTransaction}
                        phaserNftCharacters={ReactNftCharacters}
                        // phaserSuiWalletConnect={ReactSuiWalletConnect}
                        // phaserSuiWalletDisconnect={ReactSuiWalletDisconnect}
                        phaserLoginGoogle={ReactLoginGoogle}
                    />
                )}

                <LoadingOverlay showLoading={showLoading} />
                {popupConfig && (
                    <ConfirmPopup
                        isOpen={isPopupOpen}
                        title={popupConfig.title}
                        message={popupConfig.message}
                        confirmText={popupConfig.confirmText}
                        cancelText={popupConfig.cancelText}
                        onConfirm={popupConfig.onConfirm}
                        onCancel={popupConfig.onCancel}
                        showBothButtons={popupConfig.showBothButtons}
                    />
                )}
            <div>
                {/* <ConnectModal
                    open={showModal}
                    onOpenChange={(open) => setShowModal(open)}
                ></ConnectModal> */}

                {/* <ConnectButton>Connect Wallet</ConnectButton> */}

                {/* <button onClick={() => ReactSuiWalletConnect()}>
                    Sui Wallet
                </button>

                <button onClick={() => ReactSuiWalletDisconnect()}>
                    Disconnect sui Wallet
                </button> */}
                {/* <div>
                    <button onClick={ReactNftCharacters}>Get NFTs (tonAPI)</button>
                </div> */}
                {/* <div>
                    <button
                        onClick={() =>
                            ReactWalletConnect(
                                (wallet) => {
                                    console.log("Connected:", wallet);
                                    // Xử lý khi kết nối thành công
                                },
                                (error) => {
                                    console.log("Error:", error);
                                    // Xử lý khi có lỗi
                                }
                            )
                        }
                    >
                        Connect Wallet
                    </button>
                </div> */}
                {/* <div>
                    <button onClick={() => tonConnectUI.disconnect()}>
                        Disconnect Wallet
                    </button>
                </div> */}
                {/* <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        position: "absolute",
                        top: "15%",
                        right: "10%",
                        transform: "translate(-50%,-50%)",
                        height: "25px", // Chiều cao nút
                        width: "100px", // Chiều rộng nút
                        paddingTop: "14px",
                        paddingRight: "0px",
                        paddingBottom: "14px",
                        paddingLeft: "0px",
                        color: "red", // Màu chữ
                        fontSize: "10px", // Thay đổi kích thước font chữ ở đây
                        textAlign: "center", // Căn giữa chữ
                        zIndex: 100,
                    }}
                >
                    User-friendly address: {userFriendlyAddress}
                </div> */}
                {/* <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        position: "absolute",
                        top: "20%",
                        right: "-10%",
                        transform: "translate(-50%,-50%)",
                        height: "25px", // Chiều cao nút
                        width: "100px", // Chiều rộng nút
                        paddingTop: "14px",
                        paddingRight: "0px",
                        paddingBottom: "14px",
                        paddingLeft: "0px",
                        color: "red", // Màu chữ
                        fontSize: "10px", // Thay đổi kích thước font chữ ở đây
                        textAlign: "center", // Căn giữa chữ
                        zIndex: 100,
                    }}
                >
                    Raw address: {rawAddress}
                </div> */}
                {/* <div>
                    <button className="button" onClick={changeScene}>
                        Change Scene
                    </button>
                </div>
                <div>
                    <button
                        disabled={canMoveSprite}
                        className="button"
                        onClick={moveSprite}
                    >
                        Toggle Movement
                    </button>
                </div>
                <div className="spritePosition">
                    Sprite Position:
                    <pre>{`{\n  x: ${spritePosition.x}\n  y: ${spritePosition.y}\n}`}</pre>
                </div>
                <div>
                    <button className="button" onClick={addSprite}>
                        Add New Sprite
                    </button>
                </div> */}
            </div>
            <GoogleLoginContainer
                isOpen={showGoogleLogin}
                onSuccess={(credentialResponse) => {
                    //console.log(credentialResponse);
                    EventBus.emit(
                        "react-google-button-login",
                        credentialResponse
                    );
                    setShowGoogleLogin(false);
                }}
                onError={() => {
                    EventBus.emit("react-google-button-login-error");
                    setShowGoogleLogin(false);
                }}
            />
            <GoogleLoginTelegramLinkContainer
                isOpen={showGoogleLoginTelegramLink}
                onSuccess={(credentialResponse) => {
                    //console.log(credentialResponse);
                    EventBus.emit(
                        "react-google-button-login-telegram-link",
                        credentialResponse
                    );
                    setShowGoogleLoginTelegramLink(false);
                }}
                onError={() => {
                    EventBus.emit(
                        "react-google-button-login-error-telegram-link"
                    );
                    setShowGoogleLoginTelegramLink(false);
                }}
            />
            
            {/* ========================================
                NEW: VORLD LOGIN MODAL - DISABLED
                ======================================== */}
            {/* <VorldLoginModal
                isOpen={showVorldLoginPopup}
                onClose={() => setShowVorldLoginPopup(false)}
            /> */}
            
            {/* ========================================
                EXISTING: VORLD OTP INPUT
                ======================================== */}
            {showVorldOTP && (
                <OTPInput
                    email={vorldEmail}
                    onVerify={handleVorldOTPVerify}
                    onBack={handleVorldOTPBack}
                />
            )}
            
            <div>
                {/* <button onClick={handleGoogleLogin}>Đăng nhập Google</button>
                <button onClick={handleGoogleLogout}>Đăng xuất Google</button> */}
                {/* {showOneTapGoogleSigin && (
                    <Suspense fallback={null}>
                        <AuthOneTap
                            onSuccess={(result) => {
                                console.log("Google AuthOneTap: ", result);

                                if (
                                    onLoginGoogleSuccess &&
                                    typeof onLoginGoogleSuccess === "function"
                                ) {
                                    onLoginGoogleSuccess(result);
                                }

                                setShowOneTapGoogleSigin(false);
                            }}
                            onError={() => {
                                if (
                                    onLoginGoogleError &&
                                    typeof onLoginGoogleError === "function"
                                ) {
                                    onLoginGoogleError();
                                }

                                setShowOneTapGoogleSigin(false);
                            }}
                        />
                    </Suspense>
                )} */}
            </div>

            {/* ========================================
                NEW: ARENA GAME TAB
                ======================================== */}
            <ArenaTab />

            {/* ========================================
                NEW: ARENA UI COMPONENTS (Countdown + Notifications)
                ======================================== */}
                <ArenaUI />
                </AuthWrapper>
            </MiniKitProvider>
        </div>
    );
}

export default App;
