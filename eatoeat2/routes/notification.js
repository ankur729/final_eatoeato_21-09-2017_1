var request = require('request');

exports.notificationObj = {

    notification_id_user_order_placed: "0",
    notification_id_user_order_confirmed: "1",
    notification_id_user_order_picked: "2",
    notification_id_user_order_ready_for_del: "3",
    notification_id_user_order_delivered: "4",
    notification_id_cook_order_recieved: "5",
    notification_id_cook_order_delivered: "6",


};

exports.notificationMessageContent = {

    notification_message_for_user_order_placed: " battery less than 10 percent",
    notification_message_for_user_order_confirmed: " is within 1km in your area",
    notification_message_for_user_order_picked: "Now you can track ",
    notification_message_for_user_order_ready_for_del: "Added you in Group",
    notification_message_for_user_order_delivered: "Added you in Group",
    notification_message_for_user_cook_order_recieved: "Added you in Group",
    notification_message_for_cook_order_delivered: "Added you in Group"
};


exports.notificationTitleContent = {

    notification_title_for_battery_alert: "Battery Alert",
    notification_title_for_nearby_alert: "NearBy Alert",
    notification_title_for_after_tracking_accept: "Accept Tracking"
};




exports.email = {
    sendEmail: 'rahulidigitie@gmail.com',

};

// exports.html = function(code){

//     return "  <!DOCTYPE html>\n" +
//                         "<html lang=\"en-us\">\n" +
//                         "<head>\n" +
//                         "      <title>Password Reset</title>\n" +
//                         "      <style>\n" +
//                         "      h3{\n" +
//                         "            color: green;\n" +
//                         "            text-align: center;\n" +
//                         "      }\n" +
//                         "      </style>\n" +
//                         "</head>\n" +
//                         "<body>\n" +
//                         "      <h3>Your password reset link is</h3>\n" +
//                         "      <h3>"+code+"</h3>\n" +
//                         "</body>\n" +
//                         "</html>" 
// };

// exports.sendMessageToUser = function (deviceId, message,title ,notificationid,data2) {
//     request({
//         url: 'https://fcm.googleapis.com/fcm/send',
//         method: 'POST',
//         headers: {
//             'Content-Type': ' application/json',
//             'Authorization': 'key=AAAAkP3-mKM:APA91bEHoojRA8bvfsu_hPXKjYquWFL_uO_ztwEnn_xTz8OJaHKGtTN73CB8LJZrbKybTT0LQ3pUb6Ouobq8QYk1nrCUVszOITmDlwo-Jv-lI_t4okfl-Es1FebZuouo2r5GHnd-J6De'
//         },
//         body: JSON.stringify(
//             {
//                 "data": {
//                     "message": message,
//                     "title": title,
//                     "notificationid":notificationid,
//                     "data":data2
//                 },
//                 "to": deviceId
//             }
//         )
//     }, function (error, response, body) {
//         if (error) {
//             console.error(error, response, body);
//         }
//         else if (response.statusCode >= 400) {
//             console.error('HTTP Error: ' + response.statusCode + ' - ' + response.statusMessage + '\n' + body);
//         }
//         else {
//             console.log('Done!')
//         }
//     });
// }