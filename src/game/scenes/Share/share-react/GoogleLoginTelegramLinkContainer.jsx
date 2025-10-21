import React, { useEffect, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";

const DESIGN_WIDTH = 1080;
const DESIGN_HEIGHT = 1920;

const GoogleLoginTelegramLinkContainer = ({ isOpen, onSuccess, onError }) => {
    if (!isOpen) {
        return null;
    }

    const [scale, setScale] = useState(0);

    useEffect(() => {
        function handleResize() {
            const w = window.innerWidth;
            const h = window.innerHeight;
            const scaleW = w / DESIGN_WIDTH;
            const scaleH = h / DESIGN_HEIGHT;
            setScale(Math.min(scaleW, scaleH));
        }
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const overlayStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        background: "transparent",
    };

    const containerStyle = {
        width: DESIGN_WIDTH,
        height: DESIGN_HEIGHT,
        background: "transparent",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        zIndex: 1000,
        boxSizing: "border-box",
        transform: `scale(${scale})`,
        transformOrigin: "center",
        pointerEvents: "none",
        marginTop: 0,
    };

    const buttonWrapperStyle = {
        pointerEvents: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: -970,
        marginLeft: -555,
        transformOrigin: "center",
    };

    const buttonScaleStyle = {
        pointerEvents: "auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transform: "scale(2)",
        transformOrigin: "center",
    };

    return (
        <div style={overlayStyle}>
            <div style={containerStyle}>
                <div style={buttonWrapperStyle}>
                    <div style={buttonScaleStyle}>
                        <GoogleLogin
                            size="large"
                            onSuccess={onSuccess}
                            onError={onError}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoogleLoginTelegramLinkContainer;
