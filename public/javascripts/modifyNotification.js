
var redAlertBarClass = 'alert alert-danger';
var successGreenAlertBarClass = 'alert alert-success';
var warningYellowAlertBarClass = 'alert alert-warning';
var greyAlertBarClass = 'alert alert-secondary';
var defaultAlertBarClass = 'alert alert-primary';
var notificationDivId = '#notification';

/**
 * Notify the user about game state by showing the notification message in the notification bar
 * @param {String} msg - Message to show on the notification bar
 * @param {Number} typeAlert - Indicating what color should be displayed on the notification bar  
 *                             {  
 *                                0: RED (alert)  
 *                                1: GREEN (success)  
 *                                2: YELLOW (warning)  
 *                                3: GREY  
 *                                default color: BLUE  
 *                             }  
 */
function showNotificationMsg(msg, typeAlert=null) {
    $(notificationDivId).removeClass();
    switch (typeAlert) {
        case 0:
            $(notificationDivId).addClass(redAlertBarClass);
            break;
        case 1:
            $(notificationDivId).addClass(successGreenAlertBarClass);
            break;
        case 2:
            $(notificationDivId).addClass(warningYellowAlertBarClass);
            break;
        case 3:
            $(notificationDivId).addClass(greyAlertBarClass);
            break;
        default:
            $(notificationDivId).addClass(defaultAlertBarClass);
            break;
    }
    $(notificationDivId).html("<b>Notification: </b>" + msg);
}