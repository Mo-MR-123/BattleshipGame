/* Helper functions to handle everything needed to be handled in localStorage */

(function (exports) {

    // check if localStorage is supported on the user browser
    if (typeof(Storage) !== "undefined") {

        // Adding object (e.g. { name: "Obaseki Nosa", location: "Lagos" } ) to localStorage
        exports.addObject = function(objectName, objectValue) {
            if (!(typeof objectName === "string")) {
                return new Error(`${objectName} is not of a String type. Make sure the object name is a String.`);
            }
            window.localStorage.setItem(objectName, JSON.stringify(objectValue));
        };

        // Getting an object from localStorage
        exports.getObject = function(objectName) {
            if (!(typeof objectName === "string")) {
                return new Error(`${objectName} is not of a String type. Make sure the object name is a String.`);
            }
            return JSON.parse(window.localStorage.getItem(objectName));
        };

        // Remove object from localStorage
        exports.removeObject = function(objectName) {
            if (!(typeof objectName === "string")) {
                return new Error(`${objectName} is not of a String type. Make sure the object name is a String.`);
            }
            window.localStorage.removeItem(objectName);
        };

        // Clear the whole localStorage (deletes everything present in localstorage)
        exports.clearLocalStorage = function() {
            window.localStorage.clear();
        };

    } else {
        return new Error("No localStorage available in this browser. Please make sure you use a browser that supports localStorage!");
    }
} 
(typeof exports === "undefined" ? this.LS = {} : new Error("Don't use this in server please."))); 