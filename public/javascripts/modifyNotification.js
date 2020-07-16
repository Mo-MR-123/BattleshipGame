
var redAlertBarClass = 'alert alert-danger';
var successGreenAlertBarClass = 'alert alert-success';
var warningYellowAlertBarClass = 'alert alert-warning';
var defaultAlertBarClass = 'alert alert-primary'
var notificationDivId = '#notification'

/**
 * Notify the user about game state by showing the notification message in the notification bar
 * @param {String} msg - Message to show on the notification bar
 * @param {Number} typeAlert - Indicating what color should be displayed on the notification bar
 *                             {
 *                              0: RED (alert)
 *                              1: GREEN (success)
 *                              2: YELLOW (warning)
 *                              default: BLUE (default color)
 *                             }
 */
function showNotificationMsg(msg, typeAlert) {
    var currentClassAttr = $(notificationDivId).attr('class')
    switch (typeAlert) {
        case 0:
            $(notificationDivId).attr(currentClassAttr, redAlertBarClass)
            break;
        case 1:
            $(notificationDivId).attr(currentClassAttr, successGreenAlertBarClass)
            break;
        case 2:
            $(notificationDivId).attr(currentClassAttr, warningYellowAlertBarClass)
            break;
        default:
            $(notificationDivId).attr(currentClassAttr, defaultAlertBarClass)
            break;
    }
    msgPrefix = "<b>Notification: </b>"
    $(notificationDivId).html(msgPrefix + msg)
    
}