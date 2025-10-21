class DataItem {
    /**
     * Tạo một đối tượng DataPlayer.
     *
     * @param {number} itemId - ID của item.
     * @param {string} imgKey - Khóa sprite UI.
     */
    constructor(itemId, imgKey) {
        this.itemId = itemId;
        this.imgKey = imgKey;
    }
}

export default DataItem;
