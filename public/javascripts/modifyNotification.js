
/**
 * Notify the user about game state by showing the notification message in the notification bar
 * @param {String} msg - Message to show on the notification bar 
 */
function showNotificationMsg(msg) {
    msgPrefix = "<b>Notification: </b>"
    $('#notification').append(msgPrefix)
    $('#notification').append(msg)
}