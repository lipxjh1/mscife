/**
 * PopupInputText.js
 * Reusable text input dialog component
 * Used for: Change Username, etc.
 */

// import centerData from "../../Data/CenterData.js";
// import cdLocalization from "../../Data/CenterDataLocalization.js";

/**
 * Show text input dialog
 * @param {Phaser.Scene} scene - Current scene
 * @param {Object} config - Configuration object
 * @param {string} config.title - Dialog title
 * @param {string} config.placeholder - Input placeholder
 * @param {string} config.currentValue - Current value to show
 * @param {number} config.maxLength - Max input length (default: 20)
 * @param {number} config.minLength - Min input length (default: 3)
 * @param {RegExp} config.validation - Validation regex
 * @param {string} config.validationMessage - Message when validation fails
 * @param {Function} config.onConfirm - Callback when confirmed
 * @param {Function} config.onCancel - Callback when cancelled
 */
export function ShowInputTextDialog(scene, config) {
    const {
        title = "Input",
        placeholder = "",
        currentValue = "",
        maxLength = 20,
        minLength = 3,
        validation = /^[a-zA-Z0-9_-]+$/,
        validationMessage = "Invalid input",
        onConfirm = () => {},
        onCancel = () => {}
    } = config;

    // Get screen dimensions
    const screenWidth = scene.cameras.main.width;
    const screenHeight = scene.cameras.main.height;
    const centerX = screenWidth / 2;
    const centerY = screenHeight / 2;

    // Create overlay container
    const container = scene.add.container(0, 0).setDepth(1000);

    // Dark overlay background
    const overlay = scene.add.rectangle(centerX, centerY, screenWidth, screenHeight, 0x000000, 0.7)
        .setInteractive()
        .on('pointerdown', () => {}); // Block clicks through

    // Popup background
    const popupWidth = 600;
    const popupHeight = 400;
    const popup_bg = scene.add.image(centerX, centerY, 'share_popup_input_bg')
        .setDisplaySize(popupWidth, popupHeight);

    // Title text
    const titleText = scene.add.text(centerX, centerY - 140, title, {
        fontFamily: 'Russo One',
        fontSize: '36px',
        color: '#ffffff',
        align: 'center'
    }).setOrigin(0.5, 0.5);

    // Input value (starts with current value)
    let inputValue = currentValue;

    // Input display background
    const inputBgWidth = 500;
    const inputBgHeight = 60;
    const inputBg = scene.add.rectangle(centerX, centerY - 40, inputBgWidth, inputBgHeight, 0x333333, 0.8)
        .setStrokeStyle(2, 0xffffff);

    // Input text display
    const inputText = scene.add.text(centerX, centerY - 40, inputValue || placeholder, {
        fontFamily: 'Russo One',
        fontSize: '28px',
        color: inputValue ? '#ffffff' : '#888888',
        align: 'center'
    }).setOrigin(0.5, 0.5);

    // Character counter
    const counterText = scene.add.text(centerX + 220, centerY - 10, `${inputValue.length}/${maxLength}`, {
        fontFamily: 'Russo One',
        fontSize: '20px',
        color: '#aaaaaa',
        align: 'right'
    }).setOrigin(1, 0.5);

    // Error message text (hidden by default)
    const errorText = scene.add.text(centerX, centerY + 20, '', {
        fontFamily: 'Russo One',
        fontSize: '20px',
        color: '#ff4444',
        align: 'center'
    }).setOrigin(0.5, 0.5).setVisible(false);

    // Helper function to update display
    const updateDisplay = () => {
        inputText.setText(inputValue || placeholder);
        inputText.setColor(inputValue ? '#ffffff' : '#888888');
        counterText.setText(`${inputValue.length}/${maxLength}`);
        counterText.setColor(inputValue.length >= maxLength ? '#ff4444' : '#aaaaaa');
    };

    // Create HTML input overlay for actual typing
    const htmlInput = document.createElement('input');
    htmlInput.type = 'text';
    htmlInput.value = inputValue;
    htmlInput.maxLength = maxLength;
    htmlInput.placeholder = placeholder;
    htmlInput.style.cssText = `
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -80px);
        width: 480px;
        height: 50px;
        font-size: 24px;
        font-family: 'Russo One', sans-serif;
        text-align: center;
        background: rgba(51, 51, 51, 0.95);
        border: 2px solid #ffffff;
        border-radius: 8px;
        color: #ffffff;
        outline: none;
        z-index: 10001;
    `;

    // Add HTML input to DOM
    document.body.appendChild(htmlInput);
    htmlInput.focus();

    // Update on input
    htmlInput.addEventListener('input', (e) => {
        inputValue = e.target.value;
        updateDisplay();
        errorText.setVisible(false);
    });

    // Handle Enter key
    htmlInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            confirmAction();
        } else if (e.key === 'Escape') {
            cancelAction();
        }
    });

    // Confirm button
    const confirmBtnWidth = 200;
    const confirmBtnHeight = 60;
    const confirmBtn = scene.add.rectangle(centerX - 120, centerY + 100, confirmBtnWidth, confirmBtnHeight, 0x44aa44)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => confirmBtn.setFillStyle(0x55bb55))
        .on('pointerout', () => confirmBtn.setFillStyle(0x44aa44))
        .on('pointerdown', () => confirmAction());

    const confirmText = scene.add.text(centerX - 120, centerY + 100, 'Confirm', {
        fontFamily: 'Russo One',
        fontSize: '28px',
        color: '#ffffff',
        align: 'center'
    }).setOrigin(0.5, 0.5);

    // Cancel button
    const cancelBtn = scene.add.rectangle(centerX + 120, centerY + 100, confirmBtnWidth, confirmBtnHeight, 0xaa4444)
        .setInteractive({ useHandCursor: true })
        .on('pointerover', () => cancelBtn.setFillStyle(0xbb5555))
        .on('pointerout', () => cancelBtn.setFillStyle(0xaa4444))
        .on('pointerdown', () => cancelAction());

    const cancelText = scene.add.text(centerX + 120, centerY + 100, 'Cancel', {
        fontFamily: 'Russo One',
        fontSize: '28px',
        color: '#ffffff',
        align: 'center'
    }).setOrigin(0.5, 0.5);

    // Add all to container
    container.add([
        overlay,
        popup_bg,
        titleText,
        inputBg,
        inputText,
        counterText,
        errorText,
        confirmBtn,
        confirmText,
        cancelBtn,
        cancelText
    ]);

    // Confirm action
    const confirmAction = () => {
        const trimmedValue = inputValue.trim();

        // Validate length
        if (trimmedValue.length < minLength) {
            errorText.setText(`Minimum ${minLength} characters required`);
            errorText.setVisible(true);
            return;
        }

        if (trimmedValue.length > maxLength) {
            errorText.setText(`Maximum ${maxLength} characters allowed`);
            errorText.setVisible(true);
            return;
        }

        // Validate format
        if (!validation.test(trimmedValue)) {
            errorText.setText(validationMessage);
            errorText.setVisible(true);
            return;
        }

        // Check if same as current
        if (trimmedValue === currentValue) {
            errorText.setText('New name must be different');
            errorText.setVisible(true);
            return;
        }

        // Clean up
        cleanup();

        // Call confirm callback
        onConfirm(trimmedValue);
    };

    // Cancel action
    const cancelAction = () => {
        cleanup();
        onCancel();
    };

    // Cleanup function
    const cleanup = () => {
        // Remove HTML input
        if (htmlInput && htmlInput.parentNode) {
            htmlInput.parentNode.removeChild(htmlInput);
        }
        // Destroy container
        container.destroy();
    };

    // Return cleanup function for external use
    return { cleanup };
}

export default ShowInputTextDialog;