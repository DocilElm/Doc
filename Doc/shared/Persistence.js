export class Persistence {
    /**
     * A function to get data from an url instead of a local file
     * @param {string} url The url where the data is located
     * @param {*} defaultValue The default value to return if the data is not found (e.g [] or {})
     * @returns {*} 
     */
    static getDataFromURL(url, defaultValue = {}) {
        return JSON.parse(FileLib.getUrlContent(url) ?? defaultValue)   
    }

    /**
     * A function to get data from a local file
     * @param {string} filePath The relative path of where it is located in Doc/data
     * @param {*} defaultValue The default value to return if the data is not found (e.g [] or {})
     * @returns {*} 
     */
    static getDataFromFile(filePath, defaultValue = {}) {
        return JSON.parse(FileLib.read("Doc", `data/${filePath}`)) ?? defaultValue
    }

    /**
     * Save data to a local file
     * @param {string} filePath The relative path of where it is located in Doc/data
     * @param {*} data The data to save to the file, defaults to an empty object
     * @param {boolean} createFolderTree Recursively create the needed folder tree
     */
    static saveDataToFile(filePath, data = {}, createFolderTree = true) {
        FileLib.write("Doc", `data/${filePath}`, JSON.stringify(data), createFolderTree)
    }
}