import { EventBus } from "../EventBus";

// Hàm kết nối ví
export async function ConnectWallet(onConnected, onDisconected) {
    EventBus.emit(
        "react-wallet-connect",
        (data) => {
            console.log("EventBus ConnectWallet: ", data);

            if (onConnected && typeof onConnected === "function") {
                onConnected(data.address);
            }
        },
        (error) => {
            if (onDisconected && typeof onDisconected === "function") {
                onDisconected(error);
            }

            console.log("EventBus ConnectWallet error: ", error);
        }
    );
}

// Hàm ngắt kết nối ví
export async function DisconnectWallet(onDisconnected, onDisconnectedError) {
    EventBus.emit(
        "react-wallet-disconnect",
        () => {
            if (onDisconnected && typeof onDisconnected === "function") {
                onDisconnected();
            }

            console.log("EventBus DisconnectWallet success: ");
        },
        (error) => {
            if (
                onDisconnectedError &&
                typeof onDisconnectedError === "function"
            ) {
                onDisconnectedError(error);
            }

            console.log("EventBus DisconnectWallet error: ", error);
        }
    );
}

export async function ConnectSuiWallet(onConnected, onDisconected) {
    EventBus.emit(
        "react-sui-wallet-connect",
        (data) => {
            console.log("EventBus ConnectSuiWallet: ", data);

            if (onConnected && typeof onConnected === "function") {
                onConnected(data.address);
            }
        },
        (error) => {
            if (onDisconected && typeof onDisconected === "function") {
                onDisconected(error);
            }

            console.log("EventBus ConnectSuiWallet error: ", error);
        }
    );
}

// Hàm ngắt kết nối ví
export async function DisconnectSuiWallet(onDisconnected, onDisconnectedError) {
    EventBus.emit(
        "react-sui-wallet-disconnect",
        () => {
            if (onDisconnected && typeof onDisconnected === "function") {
                onDisconnected();
            }

            console.log("EventBus DisconnectSuiWallet success: ");
        },
        (error) => {
            if (
                onDisconnectedError &&
                typeof onDisconnectedError === "function"
            ) {
                onDisconnectedError(error);
            }

            console.log("EventBus DisconnectSuiWallet error: ", error);
        }
    );
}

// Hàm gửi giao dịch
export async function SendTransaction(amount, receiver, onSuccess, onError) {
    console.log("📡 Wallet.SendTransaction CALLED");
    console.log("📊 Parameters:", {
        amount,
        receiver,
        hasSuccessCallback: typeof onSuccess === "function",
        hasErrorCallback: typeof onError === "function"
    });

    console.log("📡 Emitting EventBus 'react-send-transaction'...");

    EventBus.emit(
        "react-send-transaction",
        amount,
        receiver,
        (result) => {
            console.log("✅ Wallet.SendTransaction SUCCESS callback received:", result);
            if (onSuccess && typeof onSuccess === "function") {
                onSuccess(result);
            }
        },
        (error) => {
            console.error("❌ Wallet.SendTransaction ERROR callback received:", error);
            if (onError && typeof onError === "function") {
                onError(error);
            }
        }
    );

    console.log("📡 EventBus.emit completed (async)");
}

// Hàm kết nối ví
export async function GetNftCharacters(onConnected, onDisconected) {
    EventBus.emit(
        "react-nft-characters",
        (result) => {
            //console.log("EventBus GetNftCharacters: ", result);

            if (onConnected && typeof onConnected === "function") {
                onConnected(result);
            }
        },
        (error) => {
            if (onDisconected && typeof onDisconected === "function") {
                onDisconected(error);
            }
        }
    );
}
