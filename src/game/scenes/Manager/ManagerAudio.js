import AudioUtils from "../../utils/audioUtils.js";

let audio_background = null;

export function CreateAudioBackground(scene) {
    // Nếu nhạc nền chưa được phát
    if (!scene.sound.get("audio_background")) {
        audio_background = AudioUtils.createSound(scene, "audio_background", {
            loop: true, // Lặp lại nhạc
            volume: 0.5, // Đặt âm lượng
        });

        if (audio_background) {
            // Chỉ phát khi audio context đã sẵn sàng
            if (!scene.sound.locked) {
                AudioUtils.playSound(audio_background, scene);
                audio_background.setMute(!GetActiveAudio());
            } else {
                scene.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
                    AudioUtils.playSound(audio_background, scene);
                    audio_background.setMute(!GetActiveAudio());
                });
            }
        }
    }
}

let playerVoice = null;
export function CreateAudioPlayerVoice(scene) {
    if (!playerVoice) {
        playerVoice = AudioUtils.createSound(scene, "player_0_voice");

        if (playerVoice) {
            playerVoice.on("complete", () => {
                // Tùy chọn xử lý khi âm thanh phát xong
                //console.log("Phát âm thanh hoàn tất.");
            });
        }
    }

    if (playerVoice) {
        // Dừng và phát lại âm thanh bất kể trạng thái của nó
        if (playerVoice.isPlaying) {
            playerVoice.stop(); // Dừng âm thanh nếu đang phát
        }

        // Chỉ phát khi audio context đã sẵn sàng
        if (!scene.sound.locked) {
            AudioUtils.playSound(playerVoice, scene);
            playerVoice.setMute(!GetActiveAudio());
        } else {
            scene.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
                AudioUtils.playSound(playerVoice, scene);
                playerVoice.setMute(!GetActiveAudio());
            });
        }
    }
}

export function GetActiveAudio() {
    const audioStatus = localStorage.getItem("audioOn");
    if (audioStatus === null) {
        // Nếu chưa có giá trị, mặc định là true (âm thanh bật)
        return true;
    }
    return audioStatus === "true"; // Trả về true nếu "audioOn" là "true"
}

export function SetActiveAudio(boolVal) {
    console.log("SetActiveAudio:", boolVal);

    localStorage.setItem("audioOn", boolVal);

    if (boolVal === true) {
        if (audio_background) {
            try {
                audio_background.setMute(false);
            } catch (error) {
                console.warn("Failed to unmute background audio:", error);
            }
        }
    } else {
        if (audio_background) {
            try {
                audio_background.setMute(true);
            } catch (error) {
                console.warn("Failed to mute background audio:", error);
            }
        }
    }
}

