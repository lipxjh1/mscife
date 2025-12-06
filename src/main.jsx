import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { TonConnectUIProvider } from "@tonconnect/ui-react";

// Manifest cho TON Connect
const manifestUrl =
    "https://raw.githubusercontent.com/ton-blockchain/dns/refs/heads/main/tonconnect-manifest.json";

import "@suiet/wallet-kit/style.css";

//import { WalletProvider } from "@suiet/wallet-kit";

import { GoogleOAuthProvider } from "@react-oauth/google";

// World ID MiniKit
import { MiniKitProvider } from "./minikit";

ReactDOM.createRoot(document.getElementById("root")).render(
    // <React.StrictMode>
    //     <WalletProvider>
    //         <TonConnectUIProvider manifestUrl={manifestUrl}>
    //             <App />
    //         </TonConnectUIProvider>
    //     </WalletProvider>
    // </React.StrictMode>

    <React.StrictMode>
        <MiniKitProvider>
            <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                <TonConnectUIProvider manifestUrl={manifestUrl}>
                    <App />
                </TonConnectUIProvider>
            </GoogleOAuthProvider>
        </MiniKitProvider>
    </React.StrictMode>
);

