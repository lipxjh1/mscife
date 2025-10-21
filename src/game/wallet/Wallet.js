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
    EventBus.emit(
        "react-send-transaction",
        amount,
        receiver,
        (result) => {
            if (onSuccess && typeof onSuccess === "function") {
                onSuccess(result);
            }

            //console.log("EventBus Send transaction success: ", result);
        },
        (error) => {
            if (onError && typeof onError === "function") {
                onError(error);
            }

            //console.log("EventBus Send transaction error: ", error);
        }
    );
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
