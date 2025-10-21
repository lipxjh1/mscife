import React, { useEffect, useState } from "react";
import cdLocalization from "../../../Data/CenterDataLocalization.js";
import { usePhaserImages } from "../PhaserImageBridge.js";

const DESIGN_WIDTH = 1080;
const DESIGN_HEIGHT = 1920;

/**
 * ConfirmPopup component props
 * @typedef {Object} ConfirmPopupProps
 * @property {boolean} isOpen - Whether the popup is open
 * @property {string} title - Title of the popup
 * @property {string} message - Message to display
 * @property {function} [onConfirm] - Function to call when confirmed (có thể null)
 * @property {function} [onCancel] - Function to call when canceled (có thể null)
 * @property {string} [confirmText='Xác nhận'] - Text for confirm button
 * @property {string} [cancelText='Hủy'] - Text for cancel button
 * @property {boolean} [showBothButtons=true] - Hiển thị cả 2 nút (true) hoặc chỉ 1 nút (false)
 */

// Hàm xử lý ngăn chặn sự kiện click được định nghĩa bên ngoài để không tạo mới mỗi lần render
const preventClickThrough = (e) => {
    //e.preventDefault();
    e.stopPropagation();
};

// URL mặc định fallback khi không thể lấy từ Phaser
const DEFAULT_BG_URL =
    "/assets/share_2/share_popup_alert/share_popup_alert_bg.webp";
const DEFAULT_BTN_URL =
    "/assets/share_2/share_popup_alert/share_popup_alert_btn.webp";

const ConfirmPopup = ({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Xác nhận",
    cancelText = "Hủy",
    showBothButtons = true,
}) => {
    if (!isOpen) {
        return null;
    }

    const [scale, setScale] = useState(0);
    const [currentFont, setCurrentFont] = useState(
        cdLocalization.getCurrentFont()
    );

    // Lấy URLs của hình ảnh từ Phaser cache
    const { images, ready } = usePhaserImages();

    // URLs của hình ảnh - ưu tiên lấy từ Phaser cache, nếu không có thì dùng fallback
    const bgImageUrl =
        ready && images.share_popup_alert_bg
            ? images.share_popup_alert_bg
            : DEFAULT_BG_URL;
    const btnImageUrl =
        ready && images.share_popup_alert_btn
            ? images.share_popup_alert_btn
            : DEFAULT_BTN_URL;

    // Responsive: tính toán scale dựa trên kích thước màn hình
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

    // Lắng nghe thay đổi ngôn ngữ và font
    useEffect(() => {
        const handleLanguageChange = () => {
            setCurrentFont(cdLocalization.getCurrentFont());
        };

        // Đăng ký lắng nghe sự kiện thay đổi ngôn ngữ
        cdLocalization.AddLocalizationChange(handleLanguageChange);

        // Cleanup listener khi component unmount
        return () =>
            cdLocalization.RemoveLocalizationChange(handleLanguageChange);
    }, []);

    const overlayStyle = {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "auto",
        background: "rgba(0, 0, 0, 0.7)",
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
        zIndex: 2002,
        boxSizing: "border-box",
        transform: `scale(${scale})`,
        transformOrigin: "center",
        pointerEvents: "auto",
        marginTop: 0,
    };

    const popupStyle = {
        // Sử dụng ảnh nền từ Phaser cache hoặc fallback URL
        backgroundImage: `url('${bgImageUrl}')`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",

        // Kích thước của popup theo ảnh
        width: "976px",
        height: "358px",

        marginLeft: "0px",
        marginTop: "0px",

        // Container được định vị tương đối để các phần tử bên trong có thể định vị tuyệt đối
        position: "relative",

        // Không cần thiết lập các thuộc tính flex ở đây nữa
        boxSizing: "border-box", // Đảm bảo padding không làm thay đổi kích thước
    };

    // Vùng chứa title với định vị tuyệt đối
    const titleAreaStyle = {
        position: "absolute",
        top: "30px", // Điều chỉnh vị trí từ phía trên của popup
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        zIndex: 10,
    };

    // Style cho title - giờ đây không cần margin top nữa
    const titleStyle = {
        fontSize: "52px",
        fontWeight: "bold",
        textShadow: "2px 2px 4px rgba(0,0,0,1)",
        fontFamily: currentFont,
        margin: 0,
        marginTop: "-100px",
        padding: 0,
    };

    // Vùng chứa message với định vị tuyệt đối
    const messageAreaStyle = {
        position: "absolute",
        top: "20px", // Điều chỉnh vị trí từ phía trên của popup
        left: 0,
        right: 0,
        height: "130px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
    };

    // Container cho message với khả năng cuộn
    const messageContainerStyle = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "845px", // Chiều rộng cố định để căn giữa
        overflow: "auto", // Cho phép cuộn nếu nội dung quá dài
    };

    // Style cho message
    const messageStyle = {
        fontSize: "32px",
        margin: 0,
        padding: "0px 20px",
        textShadow: "2px 2px 4px rgba(0,0,0,0.7)",
        textAlign: "center",
        wordWrap: "break-word",
        fontFamily: currentFont,
        lineHeight: 1.3, // Điều chỉnh khoảng cách giữa các dòng
    };

    // Vùng chứa các nút với định vị tuyệt đối
    const buttonAreaStyle = {
        position: "absolute",
        bottom: "40px", // Điều chỉnh vị trí từ phía dưới của popup
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        gap: "30px", // Khoảng cách giữa các nút
        zIndex: 10,
    };

    const buttonStyle = {
        padding: "12px 35px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "36px",
        fontWeight: "bold",
        boxShadow: "0 4px 8px rgba(0,0,0,0.3)",
        transition: "transform 0.1s ease",
        fontFamily: currentFont,
    };

    const confirmButtonStyle = {
        ...buttonStyle,

        // Sử dụng ảnh nền từ Phaser cache hoặc fallback URL
        backgroundImage: `url('${btnImageUrl}')`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",

        // Kích thước của popup theo ảnh
        width: "321px",
        height: "92px",

        color: "#fff",
    };

    const cancelButtonStyle = {
        ...buttonStyle,

        // Sử dụng ảnh nền từ Phaser cache hoặc fallback URL
        backgroundImage: `url('${btnImageUrl}')`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",

        // Kích thước của popup theo ảnh
        width: "321px",
        height: "92px",

        color: "#fff",
    };

    // Quyết định hiển thị nút dựa trên props và tương tự như AlertPopup.js
    let buttons;

    // Xử lý các trường hợp hiển thị nút tương tự AlertPopup.js
    if (onConfirm === null && onCancel === null) {
        // Trường hợp 1: cả hai callback đều null -> hiển thị 1 nút "Xác nhận" chỉ đóng popup
        buttons = (
            <button
                style={{ ...confirmButtonStyle, marginLeft: 0, marginRight: 0 }}
                onClick={() => {
                    if (onCancel) onCancel(); // Đóng popup
                }}
                onMouseOver={(e) =>
                    (e.currentTarget.style.transform = "scale(1.05)")
                }
                onMouseOut={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                }
            >
                {confirmText}
            </button>
        );
    } else if (onConfirm !== null && onCancel === null) {
        // Trường hợp 2: chỉ có onConfirm -> hiển thị 1 nút "Xác nhận" gọi callback onConfirm
        buttons = (
            <button
                style={{ ...confirmButtonStyle, marginLeft: 0, marginRight: 0 }}
                onClick={() => {
                    if (onConfirm) onConfirm();
                    if (onCancel) onCancel(); // Đóng popup
                }}
                onMouseOver={(e) =>
                    (e.currentTarget.style.transform = "scale(1.05)")
                }
                onMouseOut={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                }
            >
                {confirmText}
            </button>
        );
    } else if (!showBothButtons) {
        // Trường hợp 3: showBothButtons=false -> hiển thị 1 nút "Xác nhận" gọi callback onConfirm
        buttons = (
            <button
                style={{ ...confirmButtonStyle, marginLeft: 0, marginRight: 0 }}
                onClick={() => {
                    if (onConfirm) onConfirm();
                    if (onCancel) onCancel(); // Đóng popup
                }}
                onMouseOver={(e) =>
                    (e.currentTarget.style.transform = "scale(1.05)")
                }
                onMouseOut={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                }
            >
                {confirmText}
            </button>
        );
    } else {
        // Trường hợp 4: mặc định hiển thị cả 2 nút
        buttons = (
            <>
                <button
                    style={cancelButtonStyle}
                    onClick={onCancel}
                    onMouseOver={(e) =>
                        (e.currentTarget.style.transform = "scale(1.05)")
                    }
                    onMouseOut={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                    }
                >
                    {cancelText}
                </button>
                <button
                    style={confirmButtonStyle}
                    onClick={onConfirm}
                    onMouseOver={(e) =>
                        (e.currentTarget.style.transform = "scale(1.05)")
                    }
                    onMouseOut={(e) =>
                        (e.currentTarget.style.transform = "scale(1)")
                    }
                >
                    {confirmText}
                </button>
            </>
        );
    }

    return (
        <div
            style={overlayStyle}
            onClick={onCancel}
            onMouseDown={preventClickThrough}
            onMouseUp={preventClickThrough}
            onTouchStart={preventClickThrough}
            onTouchEnd={preventClickThrough}
            onTouchMove={preventClickThrough}
            onContextMenu={preventClickThrough}
        >
            <div style={containerStyle}>
                <div style={popupStyle} onClick={(e) => e.stopPropagation()}>
                    {/* Title Area - định vị tuyệt đối */}
                    <div style={titleAreaStyle}>
                        <h2 style={titleStyle}>{title}</h2>
                    </div>

                    {/* Message Area - định vị tuyệt đối */}
                    <div style={messageAreaStyle}>
                        <div style={messageContainerStyle}>
                            <p style={messageStyle}>{message}</p>
                        </div>
                    </div>

                    {/* Button Area - định vị tuyệt đối */}
                    <div style={buttonAreaStyle}>{buttons}</div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmPopup;
