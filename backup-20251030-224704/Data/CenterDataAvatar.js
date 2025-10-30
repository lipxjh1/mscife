import DataItem from "./DataItem.js";

export class CenterDataAvatar {
    constructor() {
        this.existAvatarArr = [];

        this.addFreeAvatar();
    }

    // Phương thức lấy phần tử từ dictionary theo id
    getRandomFreeAvatar() {
        let randomNumber = Phaser.Math.Between(0, 11);
        return `avatar_free_${randomNumber}`;
    }

    addFreeAvatar() {
        for (let i = 0; i < 12; i++) {
            this.existAvatarArr.push(`avatar_free_${i}`);
        }
    }

    isExist(avatarKey) {
        return this.existAvatarArr.includes(avatarKey);
    }
}

const centerDataAvatar = new CenterDataAvatar();
export default centerDataAvatar;
