var express = require('express');

var router = express.Router();
var mongojs = require('mongojs');
var bcrypt = require('bcrypt-nodejs');
var db = mongojs('mongodb://admin:root@ds127399.mlab.com:27399/eatoeat');
//var db=mongojs('mongodb://server1.idigitie.in:27017/eatoeatoDb');
var fs = require('fs');
const moment = require('moment');
var dns = require('dns');
var os = require('os');
var _ = require('underscore');
var randomstring = require("randomstring");
//var fs = require('fs'), gm = require('gm');
var Jimp = require("jimp");
var ObjectId = require('mongodb').ObjectID;
var schedule = require('node-schedule');
var fs = require('fs')
    , gm = require('gm').subClass({ imageMagick: true });
var request = require('request');
var nodemailer = require('nodemailer');
const excel = require('node-excel-export');
const config = require('./config');
var transporter = nodemailer.createTransport({

    //  var tempdata = { groupid: groupId, groupname: data.group_name, members: jsonusersinfo };
    //config.sendMessageToUser(data5.token, " Added In The Group " + data.group_name, data.group_name, config.notificationObj.notification_id_add_member, tempdata);

    service: 'gmail',
    auth: {
        user: 'ankuridigitie@gmail.com',
        pass: 'ankur@123'
    }

});

// NOTIFICATION CODE
function sendMessageToUser(deviceId, message, title, notificationid, data2) {
    request({
        url: 'https://fcm.googleapis.com/fcm/send',
        method: 'POST',
        headers: {
            'Content-Type': ' application/json',
           'Authorization': 'key=AAAAN9__z9A:APA91bE-2QF1JcJP5BZvzdgslWITsIn1k8DRUmQdmhapXbNAYd67c9zu_D7dkMZWHrlZYaGKfgrDzEdyPvKtRVV1WD4UBlsuz1dfqYI3SAhtWEMcwSjV0eIcG_yAoQeEQUlT7lo_8fcM'
        },
        body: JSON.stringify(
            {
                "data": {
                    "message": message,
                    "title": title,
                    "notificationid": notificationid,
                    "data": data2
                },
                "to": deviceId
            }
        )
    }, function (error, response, body) {
        if (error) {
            console.error(error, response, body);
        }
        else if (response.statusCode >= 400) {
            console.error('HTTP Error: ' + response.statusCode + ' - ' + response.statusMessage + '\n' + body);
        }
        else {
            console.log('Done NOTIFICATION!')
        }
    });
}

router

    .post('/insert-token', function (req, res, next) {

        console.log('NOTIFICATION CHECK');
        console.log(req.body);
        var usertype = req.body.user_type;

        // 1 for user
        // 2 for cook

        if (usertype == '1') {

            db.user_infos.findAndModify(
                {

                    query: {
                        '_id': mongojs.ObjectId(req.body._id)
                    },
                    update: {
                        $set: {
                            token: req.body.token,
                            device_type: req.body.device_type,

                        }
                    },
                    new: true
                }, function (err, doc) {
                    if (err) {
                        console.log("Something wrong when updating data!");
                    } else {
                        if (doc != null) {
                            console.log("Token updated");
                            console.log(doc);
                            res.send("true");
                        }
                    }
                });
        }
        else if (usertype == '2') {

            db.cook_infos.findAndModify(
                {

                    query: {
                        '_id': mongojs.ObjectId(req.body._id)
                    },
                    update: {
                        $set: {
                            token: req.body.token,
                            device_type: req.body.device_type,

                        }
                    },
                    new: true
                }, function (err, doc) {
                    if (err) {
                        console.log("Something wrong when updating data!");
                    } else {
                        if (doc != null) {
                            console.log("Token updated");
                            console.log(doc);
                            res.send("true");
                        }
                    }
                });

        }


    });

router

    .post('/get-notification', function (req, res, next) {

        console.log('get noti');
        console.log(req.body);
        var CurrentDate = moment().unix();
        console.log(CurrentDate);
        var incoming_data = req.body;

        db.notification_infos.find(

            {
                $and: [

                    {
                        date: moment(new Date()).format("DD/MM/YYYY"),
                    },
                    { user_cook_id: mongojs.ObjectId(incoming_data.user_cook_id) }
                ]
            }

        ).sort({ datetime: 1 }, function (err, user) {
            if (err || !user) console.log("No  user found");
            else {
                console.log(user.length);
                //             console.log(coupon[0].coupon_infos);

                res.send(user);

            }

        });


    });

router

    .post('/update-seen-status', function (req, res, next) {

        var incoming_data = req.body;

        db.notification_infos.findAndModify({
            query: {
                user_cook_id: incoming_data.user_cook_id
            },
            update: {
                $set: {
                    seenstatus: '1',
                },


            },
            new: true

        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }

            console.log(data);
            res.status(200).send(data);
        });


    })

// NOTIFICATION CODE


// app.post('/insert-token', function (req, res) {

//     user_details.findOneAndUpdate({ "_id": ObjectId(req.body.userid) },
//         { $set: { token: req.body.token } },
//         { new: true },
//         function (err, doc) {
//             if (err) {
//                 console.log("Something wrong when updating data!");
//             } else {
//                 if (doc != null) {
//                     console.log("Token updated");
//                     console.log(doc);
//                     res.send("Token updated");
//                 }
//             }
//         });

// });

router

    .post('/test-notify', function (req, res, next) {

        request({
            url: 'https://fcm.googleapis.com/fcm/send',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'key=AAAAN9__z9A:APA91bE-2QF1JcJP5BZvzdgslWITsIn1k8DRUmQdmhapXbNAYd67c9zu_D7dkMZWHrlZYaGKfgrDzEdyPvKtRVV1WD4UBlsuz1dfqYI3SAhtWEMcwSjV0eIcG_yAoQeEQUlT7lo_8fcM'
            },
            body: JSON.stringify(
                {
                    "data": {
                        "message": 'message',
                        "title": 'title',
                        "notificationid": 'notificationid',
                        "data": 'data2'
                    },
                    "to": 'dUg5tuEbdh4:APA91bG5pFo0K3np5N4iXpssYe2fxPY49tGDrj0UNiJvubiqEPCyCt69uWAqfLmojd6mlIqxP240B6OnkVCm_RweZPJuZ30T9AgtBeH_CTBJ2YiL4gIl0EZQRSbd7rIXNVz_CUCzv618'
                }
            )
        }, function (error, response, body) {
            if (error) {
                console.error(error, response, body);
            }
            else if (response.statusCode >= 400) {
                console.error('HTTP Error: ' + response.statusCode + ' - ' + response.statusMessage + '\n' + body);
            }
            else {
                console.log('Done NOTIFICATION!')
            }
        });

    });



function sendsms(to_no, message) {

    request("http://smsgate.idigitie.com/http-api.php?username=eatoeato&password=idid@1234&senderid=EATOET&route=1&number=" + to_no + "&message=" + message, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('SMS SEND') // Print the google web page.
        }
    });
}

// let startTime = new Date(Date.now() + 15000);
// let endTime = new Date(startTime.getTime() + 3000);
// var j = schedule.scheduleJob({ start: startTime, end: endTime, rule: '*/1 * * * * *' }, function(){
//   console.log('Time for tea!');
// });
// var cron = require('node-schedule');
// var rule = new schedule.RecurrenceRule();
// rule.minute = 42;

// schedule.scheduleJob('30 * * * * *', function(){
//     console.log('This runs at the 30th mintue of every hour.');
// });

// var rule2 = new schedule.RecurrenceRule();
// rule2.dayOfWeek = [5,6,0];
// rule2.hour = 3;
// rule2.minute = 10;
// schedule.scheduleJob(rule2, function(){
//     console.log('This runs at 3:10AM every Friday, Saturday and Sunday.');
// });


var rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [0, new schedule.Range(4, 6)];
rule.hour = 22;
rule.minute = 0;

var j = schedule.scheduleJob(rule, function () {

    console.log('Today is recognized by Rebecca Black!');

    db.filter_infos.remove();

});

router

    .post('/add-user-info', function (req, res, next) {

        // res.send('Task API');

        db.user_infos.save({
            username: req.body.user_name,
            email: req.body.user_email,
            phone: req.body.user_contact_no,
            password: bcrypt.hashSync(req.body.user_password, bcrypt.genSaltSync(10)),
            joined_on: moment(new Date()).format("DD/MM/YYYY"),
            coupon_detail: [],
            orders: [],
            isDeactivate: "false",
            sub_order_status: [],
            isVerified: "true",


        }, function (err, user) {

            if (err) throw err;

            res.send(user);
            console.log('user saved');

        })

    });

router
    .post('/fetch-user-by-id', function (req, res, next) {

        db.user_infos.aggregate(
            {
                "$match": { _id: mongojs.ObjectId(req.body.user_id) }
            },
            {
                $lookup: {
                    from: 'order_infos',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'order_data'

                }

            },
            {
                $lookup: {
                    from: 'user_wallet_infos',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'wallet_data'

                }

            },
            {
                $lookup: {
                    from: 'coupon_infos',
                    localField: '_id',
                    foreignField: 'user_arr._id',
                    as: 'coupon_data'

                }

            }

            ,
            { $project: { username: 1, email: 1, phone: 1, joined_on: 1, status: 1, dob: 1, gender: 1, address: 1, 'order_data.order_id': 1, 'wallet_data.wallet_amount': 1, 'coupon_data.coupon_code': 1 } },
            function (err, user) {
                if (err || !user) console.log(err);
                else {
                    console.log(user);
                    res.status(200).send(user);
                }

            }

        );

    });

router
    .post('/fetch-user-orders-by-id', function (req, res, next) {

        db.order_infos.find(
            {
                "user_id": mongojs.ObjectId(req.body.user_id)
            }

            ,
            { 'order_id': 1, 'order_status': 1, 'date': 1, 'items.pay_mode': 1, 'items.delivery_charge': 1, 'items.food_qty': 1, 'items.username': 1, 'items.food_price': 1 },
            function (err, user) {
                if (err || !user) console.log(err);
                else {

                    //res.status(200).send(user);
                    if (user.length > 0) {

                        var temp_tot = 0.0;
                        var temp_gst = 0.0;

                        var del_charge = user[0].items[0].delivery_charge;

                        for (var i = 0; i < user.length; i++) {
                            temp_tot = 0.0;

                            for (var j = 0; j < user[i].items.length; j++) {


                                temp_tot = temp_tot + user[i].items[j].food_price * user[i].items[j].food_qty;

                                //temp_tot=
                            }

                            temp_tot = temp_tot + del_charge;
                            temp_gst = temp_tot * .18;
                            user[i].grand_total = temp_tot.toFixed(2);
                            temp_tot = temp_tot + temp_gst;
                            user[i].pay_mode = user[i].items[0].pay_mode;
                            user[i].username = user[i].items[0].username;

                        }
                        console.log(user);
                        res.status(200).send(user);
                    }
                    else {

                        res.status(200).send(user);
                    }


                }

            }

        );

    });


router
    .post('/update-user-by-id', function (req, res, next) {

        console.log(req.body);

        db.user_infos.findAndModify({
            query: {
                '_id': mongojs.ObjectId(req.body._id)
            },
            update: {
                $set: {
                    username: req.body.username,
                    email: req.body.email,
                    phone: req.body.phone,
                    eatoeat_points: req.body.eatoeat_points,
                    status: req.body.status,
                },


            },
            new: true

        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }

            console.log(data);
            res.status(200).send(data);
        });

        //    db.user_infos.find(
        //                           {"_id": mongojs.ObjectId(req.body.user_id)}   

        //                         ,function(err, user) {
        //                         if( err || !user) console.log("No  user found");
        //                         else 
        //                                 {     
        //                                     console.log(user);
        //                                     res.status(200).send(user);
        //                                 }     

        //                                     }

        //    );

    });


router

    .post('/delete-all-user', function (req, res, next) {

        db.user_infos.remove({}, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            console.log('deleted');
            res.status(200).send(data);

        });
    });

router

    .post('/delete-selected-user', function (req, res, next) {

        console.log(req.body);
        for (var i = 0; i < req.body.selected_user.length; i++) {

            db.user_infos.remove({
                _id: mongojs.ObjectId(req.body.selected_user[i])
            }, function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }
                console.log('deleted');


            });



        }
        res.status(200).send({
            'status': 'deleted'
        });
    });



router

    .post('/active-user-by-id', function (req, res, next) {

        for (var i = 0; i < req.body.length; i++) {

            db.user_infos.update({
                "_id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "status": 'Active'

                    }

                }

                ,
                function (err, user) {
                    if (err || !user) console.log("No  user found");
                    else {
                        console.log(user);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });
    });

router

    .post('/inactive-user-by-id', function (req, res, next) {

        for (var i = 0; i < req.body.length; i++) {

            db.user_infos.update({
                "_id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "status": 'Inactive'

                    }

                }

                ,
                function (err, user) {
                    if (err || !user) console.log("No  user found");
                    else {
                        console.log(user);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });
    });


router

    .post('/active-all-user', function (req, res, next) {

        db.user_infos.find(

            {},
            function (err, user) {
                if (err || !user) console.log("No  user found");
                else {
                    console.log(user.length);
                    //             console.log(coupon[0].coupon_infos);

                    for (var i = 0; i < user.length; i++) {



                        db.user_infos.update({},

                            {
                                "$set": {
                                    "status": 'Active'

                                }

                            }, {
                                multi: true
                            },
                            function (err, user) {
                                if (err || !user) console.log("No  user found");
                                else {
                                    console.log('activated all');

                                }

                            }

                        );

                    }

                    res.status(200).send(user);
                }

            }

        );



    });

router

    .post('/inactive-all-user', function (req, res, next) {

        db.user_infos.find(

            {},
            function (err, user) {
                if (err || !user) console.log("No  user found");
                else {
                    console.log(user.length);
                    //             console.log(coupon[0].coupon_infos);

                    for (var i = 0; i < user.length; i++) {



                        db.user_infos.update({},

                            {
                                "$set": {
                                    "status": 'Inactive'

                                }

                            }, {
                                multi: true
                            },
                            function (err, user) {
                                if (err || !user) console.log("No  user found");
                                else {
                                    console.log('Inactivated all');

                                }

                            }

                        );

                    }

                    res.status(200).send(user);
                }

            }

        );



    });


router
    .get('/get-admin-id', function (req, res, next) {



        db.admin_infos.find(
            function (err, admin) {
                if (err || !admin) console.log("No  admin found");
                else {

                    if (admin.length < 1) {


                        db.admin_infos.save({

                            _id: mongojs.ObjectId(),


                        }, function (err, data, lastErrorObject) {
                            if (err) {
                                res.status(400);
                                res.send('error');
                                throw err;

                            }
                            res.status(200);
                            res.send(data);

                        });

                    } else {
                        if (admin[0].hasOwnProperty('_id')) {

                            db.admin_infos.find({},

                                function (err, admin) {
                                    if (err || !admin) console.log(err);
                                    else {

                                        console.log(admin);
                                        res.status(200).send(admin[0]);
                                    }
                                });



                        } else {
                            console.log('IT DOES NOT HAVE ID YET');
                        }
                    }


                    // res.status(200).send(admin);
                }
            });


    });


router
    .post('/add-cook-info', function (req, res, next) {



        // res.send('Task API');
        dns.lookup(os.hostname(), function (err, add, fam) {


            //    var cook_bn_img = randomstring.generate(13);


            //   var cook_banner_img = add + ':3000/uploads/cook_uploads/' + cook_bn_img + '.jpg';
            //    var cook_banner_img_for_web = '/uploads/cook_uploads/' + cook_bn_img + '.jpg';



            // fs.writeFile("client/uploads/cook_uploads/" + cook_bn_img + ".jpg", new Buffer(req.body.cook_banner_img, "base64"), function (err) {

            //     if (err) {

            //         throw err;
            //         console.log(err);
            //         res.send(err)
            //     } else {
            //         console.log('cook banner Img uploaded');
            //         // res.send("success");
            //         // console.log("success!");
            //     }

            // });

            db.cook_infos.save({


                // cook_name: req.body.cook_name,
                // cook_email: req.body.cook_email,
                // cook_contact: req.body.cook_contact,
                // cook_addition_contact: req.body.cook_addition_contact,
                // about_us: req.body.about_us,
                // gender: req.body.gender,

                // //  Panel Two

                // delivery_by: req.body.delivery_by,
                // //    cook_delivery_range: req.body.cook_delivery_range,
                // service_center_name: req.body.service_center_name,
                // status: req.body.status,
                // isApproved: req.body.isApproved,


                // //  Panel Three

                // cook_company_name: req.body.cook_company_name,
                // street_address: req.body.street_address,
                // cook_latitude: req.body.cook_latitude,
                // cook_longitude: req.body.cook_longitude,

                // city: req.body.city,
                // state: req.body.state,
                // pincode: req.body.pincode,

                // //   Panel Four

                // cook_commission: req.body.cook_commission,
                // bank_type: req.body.bank_type,
                // bank_name: req.body.bank_name,
                // branch_name: req.body.branch_name,

                // bank_ifsc: req.body.bank_ifsc,
                // cook_name_on_bank_acc: req.body.cook_name_on_bank_acc,
                // bank_account_no: req.body.bank_account_no,




                //  Panel One
                _id: mongojs.ObjectId(),
                cook_name: req.body.cook_name,
                cook_email: req.body.cook_email,
                cook_contact: req.body.cook_contact,
                //    cook_addition_contact: req.body.cook_p_additional_contact,
                cook_password: bcrypt.hashSync(req.body.cook_password, bcrypt.genSaltSync(10)),
                // about_us: req.body.cook_about_us,
                gender: req.body.cook_gender,

                //  Panel Two

                cook_delivery_by: req.body.delivery_by,
                cook_delivery_range: req.body.delivery_range,
                status: req.body.cook_isActive,
                isApproved: req.body.cook_isApproved,
                service_center_name: req.body.service_center_name,

                //  Panel Three

                cook_company_name: req.body.cook_company_name,
                street_address: req.body.cook_location,
                landmark: req.body.landmark,
                cook_latitude: req.body.cook_lat,
                cook_longitude: req.body.cook_long,
                cook_company_name: req.body.cook_company_name,
                city: req.body.cook_city,
                state: req.body.cook_state,
                pincode: req.body.cook_pincode,

                //   Panel Four

                cook_commission: req.body.cook_commission,
                bank_type: req.body.cook_acc_type,
                bank_name: req.body.cook_bank_name,
                cook_bank_branch_name: req.body.cook_branch_name,
                bank_ifsc: req.body.cook_ifsc,
                cook_name_on_bank_acc: req.body.cook_name_on_bank_acc,
                bank_account_no: req.body.cook_acc_no,
                last_updated_at: '',

                // //cook_banner_img: cook_banner_img,
                //  cook_banner_img_for_web: cook_banner_img_for_web,
                delivery_boy_id: '',
                //         cook_other_payment_info: req.body.cook_other_payment_info,
                //         cook_commission: req.body.cook_commission,
                status: "Active",
                isApproved: "Approved",
                "isDeactivate": "false",
                joined_on: moment(new Date()).format("DD/MM/YYYY"),
                joined_at: Math.floor(Date.now() / 1000),

                food_details: [],
                updated_fields: []


            }, function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }
                res.status(200);
                res.send({
                    'status': 'Cook Successfully Added Via Admin'
                });
                console.log('Cook Successfully Added Via Admin');
            });


        });
        // db.cook_infos.save({
        //                      cook_name:req.body.cook_name,
        //                     cook_email:req.body.cook_email,
        //                     c ook_contact:req.body.cook_contact_no,
        //                     cook_password:bcrypt.hashSync(req.body.cook_password,bcrypt.genSaltSync(10))


        //                     },function(err,cook){

        //                            if( err || !cook) console.log("err in cook");
        //                            else
        //                            {

        //                                  res.send(cook);
        //                            }
        //                         console.log('cook saved');

        //                   })

    });

router
    .get('/get-all-users', function (req, res, next) {

        console.log('this is get');
        db.user_infos.aggregate(

            {
                $lookup: {
                    from: 'order_infos',
                    localField: '_id',
                    foreignField: 'user_id',
                    as: 'order_data'

                }

            },
            { $sort: { _id: -1 } },
            { $project: { username: 1, email: 1, phone: 1, joined_on: 1, status: 1, 'order_data.order_id': 1 } }
            , function (err, users) {
                if (err || !users) console.log(err);
                else {
                    res.header('Access-Control-Allow-Origin', '*');
                    res.header('Access-Control-Allow-Methods', 'GET');

                    res.status(200).send(users);
                }

            });
    });

var sortBy = (function () {

    //cached privated objects
    var _toString = Object.prototype.toString,
        //the default parser function
        _parser = function (x) { return x; },
        //gets the item to be sorted
        _getItem = function (x) {
            return this.parser((x !== null && typeof x === "object" && x[this.prop]) || x);
        };

    // Creates a method for sorting the Array
    // @array: the Array of elements
    // @o.prop: property name (if it is an Array of objects)
    // @o.desc: determines whether the sort is descending
    // @o.parser: function to parse the items to expected type
    return function (array, o) {
        if (!(array instanceof Array) || !array.length)
            return [];
        if (_toString.call(o) !== "[object Object]")
            o = {};
        if (typeof o.parser !== "function")
            o.parser = _parser;
        o.desc = !!o.desc ? -1 : 1;
        return array.sort(function (a, b) {
            a = _getItem.call(o, a);
            b = _getItem.call(o, b);
            return o.desc * (a < b ? -1 : +(a > b));
        });
    };

} ());

router
    .get('/get-all-cooks', function (req, res, next) {

        console.log('tet');

        //     { }, {
        //     cook_name: 1,
        //     cook_email: 1,
        //     cook_commission: 1,
        //     isApproved: 1,
        //     status: 1,
        //     cook_contact: 1,
        //     joined_on: 1,
        //     updated_fields: 1,
        //     joined_at: 1
        // }, function (err, cooks) {
        //     if (err || !cooks) console.log("No  cook found");
        //     else {
        //         console.log(cooks);

        //         var f_data = sortBy(cooks, { prop: "joined_at" });
        //         var date = Math.round(new Date().getTime() / 1000)

        //         console.log(date);
        //         res.status(200).send(f_data);
        //     }
        // });

        // }
        // res.send('Task API');
        db.cook_infos.find({},
            {
                cook_name: 1,
                cook_email: 1,
                joined_at: 1,
                cook_commission: 1,
                isApproved: 1,
                status: 1,
                cook_contact: 1,
                joined_on: 1,


            }



        ).sort({ joined_at: -1 }, function (err, data) {

            res.send(data);
        });
    });



router
    .post('/get-footer-details', function (req, res, next) {

        console.log(req.body);
        db.admin_infos.find({
            'info_pages._id': mongojs.ObjectId(req.body.info_id)
        },
            { info_pages: 1 }
            ,
            function (err, data) {

                res.send(data);
            });

    });


router
    .post('/delete-cook', function (req, res, next) {


        for (var i = 0; i < req.body.length; i++) {

            db.cook_infos.remove({
                "_id": db.ObjectId(req.body[i])
            });
        }


        res.status(200).send('ooook');
    });

router
    .get('/delete-all-cook', function (req, res, next) {


        db.cook_infos.remove();
        res.status(200).send('All Deleted');
        console.log('all cook deletedddd');
    });



router

    .post('/active-cook-by-id', function (req, res, next) {

        for (var i = 0; i < req.body.length; i++) {

            db.cook_infos.update({
                "_id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "status": 'Active'

                    }

                }

                ,
                function (err, data) {
                    if (err || !data) console.log("No  data found");
                    else {
                        console.log(data);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });
    });

router

    .post('/inactive-cook-by-id', function (req, res, next) {
        console.log(req.body);
        for (var i = 0; i < req.body.length; i++) {

            db.cook_infos.update({
                "_id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "status": 'Inactive'

                    }

                }

                ,
                function (err, data) {
                    if (err || !data) console.log("No  data found");
                    else {
                        console.log(data);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });
    });



router

    .post('/active-all-cook', function (req, res, next) {

        db.cook_infos.find(

            {},
            function (err, data) {
                if (err || !data) console.log("No  data found");
                else {
                    console.log(data.length);
                    //             console.log(coupon[0].coupon_infos);

                    for (var i = 0; i < data.length; i++) {



                        db.cook_infos.update({},

                            {
                                "$set": {
                                    "status": 'Active'

                                }

                            }, {
                                multi: true
                            },
                            function (err, data) {
                                if (err || !data) console.log("No  data found");
                                else {
                                    console.log('activated all');

                                }

                            }

                        );

                    }

                    res.status(200).send('all updated');
                }

            }

        );



    });

router

    .post('/inactive-all-cook', function (req, res, next) {

        db.cook_infos.find(

            {},
            function (err, data) {
                if (err || !data) console.log("No  data found");
                else {
                    console.log(data.length);
                    //             console.log(coupon[0].coupon_infos);

                    for (var i = 0; i < data.length; i++) {



                        db.cook_infos.update({},

                            {
                                "$set": {
                                    "status": 'InActive'

                                }

                            }, {
                                multi: true
                            },
                            function (err, data) {
                                if (err || !data) console.log("No  data found");
                                else {
                                    console.log('Inactivated all');

                                }

                            }

                        );

                    }

                    res.status(200).send(data);
                }

            }

        );



    });





router
    .post('/delete-user', function (req, res, next) {


        for (var i = 0; i < req.body.length; i++) {

            db.user_infos.remove({
                "_id": db.ObjectId(req.body[i])
            });
        }

        res.status(200).send('ooook');

    });


router
    .get('/delete-all-user', function (req, res, next) {


        db.user_infos.remove();
        res.status(200).send('All Deleted');
        console.log('all user deletedddd');
    });



// res.send('Task API');

router
    .post('/save-global-setting', function (req, res, next) {


        // res.send('Task API');
        console.log(req.body.copyright);
        var web_logo_file;
        var footer_logo_file;
        var favicon_file;
        dns.lookup(os.hostname(), function (err, add, fam) {


            if (req.body.hasOwnProperty('website_logo') && req.body.website_logo != "") {
                var web_logo_temp = randomstring.generate(13);
                web_logo_file = 'uploads/global_setting_uploads/' + web_logo_temp + '.jpg';



                fs.writeFile("client/uploads/global_setting_uploads/" + web_logo_temp + ".jpg", new Buffer(req.body.website_logo, "base64"), function (err) {

                    if (err) {

                        throw err;
                        console.log(err);
                        res.send(err)
                    } else {
                        console.log('Website logo uploaded');

                    }

                });


            }

            if (req.body.hasOwnProperty('footer_logo') && req.body.footer_logo != "") {
                var footer_logo_temp = randomstring.generate(13);
                footer_logo_file = '/uploads/global_setting_uploads/' + footer_logo_temp + '.jpg';



                fs.writeFile("client/uploads/global_setting_uploads/" + footer_logo_temp + ".jpg", new Buffer(req.body.footer_logo, "base64"), function (err) {

                    if (err) {

                        throw err;
                        console.log(err);
                        res.send(err)
                    } else {
                        console.log('Footer logo uploaded');

                    }

                });


            }
            if (req.body.hasOwnProperty('favicon') && req.body.favicon != "") {
                var favicon_temp = randomstring.generate(13);
                favicon_file = '/uploads/global_setting_uploads/' + favicon_temp + '.jpg';

                console.log('FAVICON UPLOADED');

                fs.writeFile("client/uploads/global_setting_uploads/" + favicon_temp + ".jpg", new Buffer(req.body.favicon, "base64"), function (err) {

                    if (err) {

                        throw err;
                        console.log(err);
                        res.send(err)
                    } else {
                        console.log('Footer logo uploaded');

                    }

                });


            }


            if (req.body.favicon != "" && req.body.footer_logo != "" && req.body.website_logo != "") {

                db.global_setting_infos.findAndModify(

                    {
                        query: {

                        },
                        update: {
                            $set: {
                                site_name: req.body.site_name,
                                display_email: req.body.display_email,
                                send_from_email: req.body.send_from_email,
                                receive_on: req.body.receive_on,
                                phone: req.body.phone,
                                alt_phn: req.body.alt_phn,
                                addrress: req.body.addrress,
                                website_header: req.body.website_header,
                                website_caption: req.body.website_caption,

                                tax_rate: req.body.tax_rate,
                                delivery_charge: req.body.delivery_charge,
                                android_link: req.body.android_link,
                                ios_link: req.body.ios_link,

                                meta_tag_title: req.body.meta_tag_title,
                                meta_tag_desc: req.body.meta_tag_desc,
                                meta_tag_keyword: req.body.meta_tag_keyword,
                                google_analytic_code: req.body.google_analytic_code,
                                // google_map_code: req.body.google_map_code,
                                // schema: req.body.schema,
                                copyright: req.body.copyright,
                                website_logo: web_logo_file,
                                footer_logo: footer_logo_file,
                                favicon: favicon_file
                            },


                        },
                        new: true
                    },
                    function (err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }
                        //   console.log('SUCCESS WIth Image');
                        console.log('this is temp');
                        res.status(200);
                        res.send(data);

                    });
            } else if (req.body.favicon == "" && req.body.footer_logo != "" && req.body.website_logo != "") {
                db.global_setting_infos.findAndModify(

                    {
                        query: {

                        },
                        update: {
                            $set: {
                                site_name: req.body.site_name,
                                display_email: req.body.display_email,
                                send_from_email: req.body.send_from_email,
                                receive_on: req.body.receive_on,
                                phone: req.body.phone,
                                alt_phn: req.body.alt_phn,
                                addrress: req.body.addrress,
                                website_header: req.body.website_header,
                                website_caption: req.body.website_caption,

                                tax_rate: req.body.tax_rate,
                                delivery_charge: req.body.delivery_charge,
                                android_link: req.body.android_link,
                                ios_link: req.body.ios_link,

                                meta_tag_title: req.body.meta_tag_title,
                                meta_tag_desc: req.body.meta_tag_desc,
                                meta_tag_keyword: req.body.meta_tag_keyword,
                                google_analytic_code: req.body.google_analytic_code,
                                google_map_code: req.body.google_map_code,
                                schema: req.body.schema,
                                copyright: req.body.copyright,
                                website_logo: web_logo_file,
                                footer_logo: footer_logo_file,

                            },


                        },
                        new: true
                    },
                    function (err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }
                        //   console.log('SUCCESS WIth Image');
                        console.log('this is temp');
                        res.status(200);
                        res.send(data);

                    });

            } else if (req.body.favicon == "" && req.body.footer_logo == "" && req.body.website_logo != "") {
                console.log("ARRIVESD");
                console.log(web_logo_file);
                db.global_setting_infos.findAndModify(

                    {
                        query: {

                        },
                        update: {
                            $set: {
                                site_name: req.body.site_name,
                                display_email: req.body.display_email,
                                send_from_email: req.body.send_from_email,
                                receive_on: req.body.receive_on,
                                phone: req.body.phone,
                                alt_phn: req.body.alt_phn,
                                addrress: req.body.addrress,
                                website_header: req.body.website_header,
                                website_caption: req.body.website_caption,

                                tax_rate: req.body.tax_rate,
                                delivery_charge: req.body.delivery_charge,
                                android_link: req.body.android_link,
                                ios_link: req.body.ios_link,

                                meta_tag_title: req.body.meta_tag_title,
                                meta_tag_desc: req.body.meta_tag_desc,
                                meta_tag_keyword: req.body.meta_tag_keyword,
                                google_analytic_code: req.body.google_analytic_code,
                                google_map_code: req.body.google_map_code,
                                schema: req.body.schema,
                                copyright: req.body.copyright,
                                website_logo: web_logo_file,


                            },


                        },
                        new: true
                    },
                    function (err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }
                        //   console.log('SUCCESS WIth Image');
                        console.log('this is temp');
                        res.status(200);
                        res.send(data);

                    });

            } else if (req.body.favicon == "" && req.body.footer_logo != "" && req.body.website_logo == "") {
                db.global_setting_infos.findAndModify(

                    {
                        query: {

                        },
                        update: {
                            $set: {
                                site_name: req.body.site_name,
                                display_email: req.body.display_email,
                                send_from_email: req.body.send_from_email,
                                receive_on: req.body.receive_on,
                                phone: req.body.phone,
                                alt_phn: req.body.alt_phn,
                                addrress: req.body.addrress,
                                website_header: req.body.website_header,
                                website_caption: req.body.website_caption,

                                tax_rate: req.body.tax_rate,
                                delivery_charge: req.body.delivery_charge,
                                android_link: req.body.android_link,
                                ios_link: req.body.ios_link,

                                meta_tag_title: req.body.meta_tag_title,
                                meta_tag_desc: req.body.meta_tag_desc,
                                meta_tag_keyword: req.body.meta_tag_keyword,
                                google_analytic_code: req.body.google_analytic_code,
                                google_map_code: req.body.google_map_code,
                                schema: req.body.schema,
                                copyright: req.body.copyright,
                                footer_logo: footer_logo_file,


                            },


                        },
                        new: true
                    },
                    function (err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }
                        //   console.log('SUCCESS WIth Image');
                        console.log('this is temp');
                        res.status(200);
                        res.send(data);

                    });

            } else if (req.body.favicon != "" && req.body.footer_logo == "" && req.body.website_logo == "") {
                db.global_setting_infos.findAndModify(

                    {
                        query: {

                        },
                        update: {
                            $set: {
                                site_name: req.body.site_name,
                                display_email: req.body.display_email,
                                send_from_email: req.body.send_from_email,
                                receive_on: req.body.receive_on,
                                phone: req.body.phone,
                                alt_phn: req.body.alt_phn,
                                addrress: req.body.addrress,
                                website_header: req.body.website_header,
                                website_caption: req.body.website_caption,

                                tax_rate: req.body.tax_rate,
                                delivery_charge: req.body.delivery_charge,
                                android_link: req.body.android_link,
                                ios_link: req.body.ios_link,

                                meta_tag_title: req.body.meta_tag_title,
                                meta_tag_desc: req.body.meta_tag_desc,
                                meta_tag_keyword: req.body.meta_tag_keyword,
                                google_analytic_code: req.body.google_analytic_code,
                                google_map_code: req.body.google_map_code,
                                schema: req.body.schema,
                                copyright: req.body.copyright,
                                favicon: favicon_file


                            },


                        },
                        new: true
                    },
                    function (err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }
                        //   console.log('SUCCESS WIth Image');
                        console.log('this is temp');
                        res.status(200);
                        res.send(data);

                    });

            } else if (req.body.favicon != "" && req.body.footer_logo != "" && req.body.website_logo == "") {
                db.global_setting_infos.findAndModify(

                    {
                        query: {

                        },
                        update: {
                            $set: {
                                site_name: req.body.site_name,
                                display_email: req.body.display_email,
                                send_from_email: req.body.send_from_email,
                                receive_on: req.body.receive_on,
                                phone: req.body.phone,
                                alt_phn: req.body.alt_phn,
                                addrress: req.body.addrress,
                                website_header: req.body.website_header,
                                website_caption: req.body.website_caption,

                                tax_rate: req.body.tax_rate,
                                delivery_charge: req.body.delivery_charge,
                                android_link: req.body.android_link,
                                ios_link: req.body.ios_link,

                                meta_tag_title: req.body.meta_tag_title,
                                meta_tag_desc: req.body.meta_tag_desc,
                                meta_tag_keyword: req.body.meta_tag_keyword,
                                google_analytic_code: req.body.google_analytic_code,
                                google_map_code: req.body.google_map_code,
                                schema: req.body.schema,
                                copyright: req.body.copyright,
                                footer_logo: footer_logo_file,
                                favicon: favicon_file


                            },


                        },
                        new: true
                    },
                    function (err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }
                        //   console.log('SUCCESS WIth Image');
                        console.log('this is temp');
                        res.status(200);
                        res.send(data);

                    });

            } else if (req.body.favicon != "" && req.body.footer_logo == "" && req.body.website_logo != "") {
                db.global_setting_infos.findAndModify(

                    {
                        query: {

                        },
                        update: {
                            $set: {
                                site_name: req.body.site_name,
                                display_email: req.body.display_email,
                                send_from_email: req.body.send_from_email,
                                receive_on: req.body.receive_on,
                                phone: req.body.phone,
                                alt_phn: req.body.alt_phn,
                                addrress: req.body.addrress,
                                website_header: req.body.website_header,
                                website_caption: req.body.website_caption,


                                tax_rate: req.body.tax_rate,
                                delivery_charge: req.body.delivery_charge,
                                android_link: req.body.android_link,
                                ios_link: req.body.ios_link,

                                meta_tag_title: req.body.meta_tag_title,
                                meta_tag_desc: req.body.meta_tag_desc,
                                meta_tag_keyword: req.body.meta_tag_keyword,
                                google_analytic_code: req.body.google_analytic_code,
                                google_map_code: req.body.google_map_code,
                                schema: req.body.schema,
                                copyright: req.body.copyright,
                                website_logo: web_logo_file,
                                favicon: favicon_file


                            },


                        },
                        new: true
                    },
                    function (err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }
                        //   console.log('SUCCESS WIth Image');
                        console.log('this is temp');
                        res.status(200);
                        res.send(data);

                    });

            } else if (req.body.favicon == "" && req.body.footer_logo == "" && req.body.website_logo == "") {

                console.log('CHECKKKKKKKKKKKKKKKKKKKKKKK');
                db.global_setting_infos.findAndModify(

                    {
                        query: {

                        },
                        update: {
                            $set: {
                                site_name: req.body.site_name,
                                display_email: req.body.display_email,
                                send_from_email: req.body.send_from_email,
                                receive_on: req.body.receive_on,
                                phone: req.body.phone,
                                alt_phn: req.body.alt_phn,
                                addrress: req.body.addrress,
                                website_header: req.body.website_header,
                                website_caption: req.body.website_caption,

                                tax_rate: req.body.tax_rate,
                                delivery_charge: req.body.delivery_charge,
                                android_link: req.body.android_link,
                                ios_link: req.body.ios_link,

                                meta_tag_title: req.body.meta_tag_title,
                                meta_tag_desc: req.body.meta_tag_desc,
                                meta_tag_keyword: req.body.meta_tag_keyword,
                                google_analytic_code: req.body.google_analytic_code,
                                google_map_code: req.body.google_map_code,
                                schema: req.body.schema,
                                copyright: req.body.copyright,



                            },


                        },
                        new: true
                    },
                    function (err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');
                            throw err;

                        }
                        //   console.log('SUCCESS WIth Image');
                        console.log('this is temp');
                        res.status(200);
                        res.send(data);

                    });
            }



        });




    });

router

    .get('/fetch-global-settings', function (req, res, next) {

        console.log('testing');
        db.global_setting_infos.find(

            function (err, settings) {
                if (err || !settings) console.log("No  setting found");

                else {
                    console.log(settings);
                    res.status(200).send(settings);
                }
            });

    });

router

    .get('/fetch-cuisine-name', function (req, res, next) {


        db.categories_infos.find({}, {
            category_name: 1
        },
            function (err, cuisine) {
                if (err || !cuisine) console.log("No  setting found");

                else {
                    console.log(cuisine);
                    res.status(200).send(cuisine);
                }
            });

    });

// FOR INFORMATION PAGES MANAGMENT INFO/./

router

    .post('/add-info-pages', function (req, res, next) {


        console.log(req.body);

        db.admin_infos.findAndModify({
            query: {
                '_id': mongojs.ObjectId('58cbccaa2881da106cd7d255')
            },
            update: {
                $push: {
                    'info_pages':
                    {
                        '_id': mongojs.ObjectId(),
                        'info_title': req.body.info.info_title,
                        // 'info_page_desc': req.body.info_page_desc,
                        'info_desc': req.body.info.info_desc,
                        // 'info_meta_tag': req.body.info.info_meta_tag,
                        // 'info_meta_desc': req.body.info.info_meta_desc,
                        // 'info_meta_keyword': req.body.info.info_meta_keyword,
                        // 'info_seo_url': req.body.info.info_seo_url,
                        // 'info_status': req.body.info.info_status,
                        // 'info_sort_order': req.body.info.info_sort_order,
                        'info_tag': req.body.info.info_tag,

                    }

                }
            },
            new: true

        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }

            console.log(data);
            res.status(200).send(data);
        });


    });

router

    .post('/fetch-info-pages', function (req, res, next) {

        db.admin_infos.find(
            {},
            { info_pages: 1, _id: 0, 'info_pages.info_title': 1, 'info_pages.info_sort_order': 1, 'info_pages._id': 1 }
            ,
            function (err, info) {


                if (err) {
                    res.status(404);
                    res.send('info not found');
                } else {


                    res.status(200).send(info[0]);
                }
            });
    });


router

    .post('/fetch-info_page-by-id', function (req, res, next) {

        //console.log(req.body.info_page_id);
        db.admin_infos.findOne({
            "info_pages._id": mongojs.ObjectId(req.body.info_page_id)
        },
            {
                'info_pages.$': 1
            }
            , function (err, info) {
                if (err || !info) console.log("No  info found");
                else {

                    res.status(200).send(info);
                }

            }

        );

    });

router

    .post('/delete-selected-info-pages', function (req, res, next) {

        console.log(req.body);

        for (var i = 0; i < req.body.selected_info_page.length; i++) {

            db.admin_infos.findAndModify({
                query: {
                    _id: mongojs.ObjectId(req.body.admin_id)
                },
                update: {
                    $pull: {
                        'info_pages': {
                            '_id': mongojs.ObjectId(req.body.selected_info_page[i])
                        }
                    }

                }

            }, function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }
                console.log(data);


            });


        }
        res.send({ 'status': 'deleted' });
    });


router

    .post('/delete-all-info-pages', function (req, res, next) {


        console.log(req.body);
        db.admin_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.body.admin_id)
            },
            update: {
                'info_pages': []
            }



        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            console.log('deleted');
            res.status(200).send(data);

        });
    });


router

    .post('/update-info-page', function (req, res, next) {


        db.admin_infos.update({
            "info_pages._id": mongojs.ObjectId(req.body._id)
        },

            {
                "$set": {
                    "info_pages.$.info_title": req.body.info_title,
                    // 'info_pages.$.info_page_desc': req.body.info_page_desc,
                    "info_pages.$.info_desc": req.body.info_desc,
                    // "info_pages.$.info_meta_tag": req.body.info_meta_tag,
                    // "info_pages.$.info_meta_desc": req.body.info_meta_desc,
                    // "info_pages.$.info_meta_keyword": req.body.info_meta_keyword,
                    // "info_pages.$.info_seo_url": req.body.info_seo_url,
                    // "info_pages.$.info_status": req.body.info_status,
                    // "info_pages.$.info_title": req.body.info_title,
                    // "info_pages.$.info_sort_order": req.body.info_sort_order,
                    "info_pages.$.info_tag": req.body.info_tag,

                }

            }

            ,
            function (err, info) {
                if (err || !info) console.log("No  info found");
                else {

                    res.status(200).send({ 'status': 'updated' });
                }

            }



        );
    });

// FOR COUPON MANAGMENT/./

router

    .post('/add-coupon-info', function (req, res, next) {

        //   var coupon_data = [];
        //    coupon_data = req.body;

        //  coupon_data._id = mongojs.ObjectId();


        db.coupon_infos.save({

            coupon_name: req.body.coupon_name,
            coupon_code: req.body.coupon_code,
            coupon_discount_operation: req.body.coupon_discount_operation,
            coupon_due_start: req.body.coupon_due_start,
            coupon_due_end: req.body.coupon_due_end,
            coupon_discount_amount: req.body.coupon_discount_amount,
            coupon_voucher_limit: req.body.coupon_voucher_limit,
            coupon_uses_per_customer: req.body.coupon_uses_per_customer,
            coupon_status: req.body.coupon_status,
            coupon_used_counter: req.body.coupon_used_counter,
            user_arr: req.body.user_arr,
            categories: req.body.categories,
        }, function (err, coupon) {

            if (err) throw err;

            res.send(coupon);
            console.log('coupon saved');

        })

        // db.coupon_infos.findAndModify({
        //     query: {
        //         '_id': mongojs.ObjectId(req.body.admin_id)
        //     },
        //     update: {
        //         $push: {
        //             'coupon_infos': coupon_data

        //             coupon_name: req.body.coupon_name,
        //             coupon_code: req.body.coupon_code,
        //             coupon_discount_operation: req.body.coupon_discount_operation,
        //             coupon_due_start: req.body.coupon_due_start,
        //             coupon_due_end: req.body.coupon_due_end,
        //             coupon_voucher_limit: req.body.coupon_voucher_limit,
        //             coupon_uses_per_customer: req.body.coupon_uses_per_customer,
        //             coupon_status: req.body.coupon_status,
        //             coupon_used_counter: req.body.coupon_used_counter,
        //             user_arr: req.body.user_arr,
        //             categories: req.body.categories,

        //         }
        //     },
        //     new: true

        // }, function (err, data, lastErrorObject) {
        //     if (err) {
        //         res.status(400);
        //         res.send('error');
        //         throw err;

        //     }

        //     console.log(data);
        //     res.status(200).send(data);
        // });



    });


router

    .get('/fetch-coupon-info', function (req, res, next) {

        db.coupon_infos.find({



        }

            ,
            function (err, coupon) {


                if (err) {
                    res.status(404);
                    res.send('info not found');
                } else {

                    res.send(coupon);

                }
            });

    });

router
    .post('/fetch-coupon-by-id', function (req, res, next) {

        console.log(req.body);

        db.coupon_infos.find({
            "_id": mongojs.ObjectId(req.body.coupon_id)
        }
            , function (err, coupon) {
                if (err || !coupon) console.log("No  coupon found");
                else {
                    console.log(coupon);
                    res.status(200).send(coupon);
                }

            }

        );

    });

router
    .post('/update-coupon-by-id', function (req, res, next) {

        console.log(req.body);
        var coupon_data = req.body;
        // var d = new Date();


        // var curr_day_for_match = d.toString().toLowerCase().substring(0, 3) + "_frfom";

        // res.send(curr_day_for_match);

        // var categories = [];

        // for (var i = 0; i < req.body.categories.length; i++) {

        //     categories[i] = req.body.categories[i];
        // }

        db.coupon_infos.update({
            "_id": mongojs.ObjectId(req.body._id)
        },

            {
                "$set": {

                    "coupon_name": req.body.coupon_name,
                    "coupon_code": req.body.coupon_code,
                    "coupon_discount_operation": req.body.coupon_discount_operation,
                    "coupon_discount_amount": req.body.coupon_discount_amount,
                    "coupon_due_start": req.body.coupon_due_start,
                    "coupon_due_end": req.body.coupon_due_end,
                    "coupon_voucher_limit": req.body.coupon_voucher_limit,
                    "coupon_uses_per_customer": req.body.coupon_uses_per_customer,
                    "coupon_status": req.body.coupon_status,
                    // "cuisine_id": req.body.cuisine_id,
                    categories: req.body.categories

                }


            }

            ,
            function (err, coupon) {
                if (err || !coupon) console.log("No  coupon found");
                else {
                    console.log(coupon);
                    res.status(200).send(coupon);
                }

            }



        );

    });

router

    .post('/delete-selected-coupon', function (req, res, next) {


        for (var i = 0; i < req.body.selected_coupons.length; i++) {

            db.coupon_infos.remove(
                {
                    _id: mongojs.ObjectId(req.body.selected_coupons[i])
                }

                , function (err, data, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send('error');
                        throw err;

                    }
                    console.log('deleted');
                    res.status(200).send(data);

                });



        }

    });


router

    .post('/delete-all-coupon', function (req, res, next) {

        console.log('delteing ALL');
        console.log(req.body);
        db.coupon_infos.remove({

        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            console.log('deleted');
            res.status(200).send(data);

        });
    });

router

    .post('/enable-coupon-by-id', function (req, res, next) {

        console.log(req.body);

        for (var i = 0; i < req.body.length; i++) {

            db.admin_infos.update({
                "coupon_infos._id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "coupon_infos.$.coupon_status": 'Enable'

                    }

                }

                ,
                function (err, coupon) {
                    if (err || !coupon) console.log("No  coupon found");
                    else {
                        console.log(coupon);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });

    });

router

    .post('/disable-coupon-by-id', function (req, res, next) {

        console.log(req.body);
        for (var i = 0; i < req.body.length; i++) {

            db.admin_infos.update({
                "coupon_infos._id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "coupon_infos.$.coupon_status": 'Disable'

                    }

                }

                ,
                function (err, coupon) {
                    if (err || !coupon) throw err;
                    else {
                        console.log(coupon);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });

    });

router

    .post('/enable-all-coupon', function (req, res, next) {

        console.log('enabling all');
        console.log(req.body);
        db.admin_infos.find({
            "_id": mongojs.ObjectId(req.body.admin_id)
        }, {
                coupon_infos: 1,
                _id: 0
            }, function (err, coupon) {
                if (err || !coupon) console.log("No  coupon found");
                else {
                    console.log(coupon[0].coupon_infos);

                    for (var i = 0; i < coupon[0].coupon_infos.length; i++) {



                        db.admin_infos.update({
                            "coupon_infos._id": mongojs.ObjectId(coupon[0].coupon_infos[i]._id)
                        },

                            {
                                "$set": {
                                    "coupon_infos.$.coupon_status": 'Enable'

                                }

                            }

                            ,
                            function (err, coupon) {
                                if (err || !coupon) console.log("No  coupon found");
                                else {
                                    console.log(coupon);

                                }

                            }



                        );

                    }

                    res.status(200).send(coupon);
                }

            }

        );



    });

router

    .post('/disable-all-coupon', function (req, res, next) {

        console.log(req.body);
        db.admin_infos.find({
            "_id": mongojs.ObjectId(req.body.admin_id)
        }, {
                coupon_infos: 1,
                _id: 0
            }, function (err, coupon) {
                if (err || !coupon) console.log("No  coupon found");
                else {
                    console.log(coupon[0].coupon_infos);

                    for (var i = 0; i < coupon[0].coupon_infos.length; i++) {



                        db.admin_infos.update({
                            "coupon_infos._id": mongojs.ObjectId(coupon[0].coupon_infos[i]._id)
                        },

                            {
                                "$set": {
                                    "coupon_infos.$.coupon_status": 'Disable'

                                }

                            }

                            ,
                            function (err, coupon) {
                                if (err || !coupon) console.log("No  coupon found");
                                else {
                                    console.log(coupon);

                                }

                            }



                        );

                    }

                    res.status(200).send(coupon);
                }

            }

        );



    });


// FOR COUPON MANAGMENT /./
router

    .post('/add-social-info', function (req, res, next) {

        db.admin_infos.find({

            _id: mongojs.ObjectId(req.body.admin_id)

        }, function (err, admin) {


            if (err) {
                res.status(404);
                res.send('info not found');
            } else {

                //    res.status(200).json(user);

                // console.log(admin[0].social_info);
                var count;
                for (var i = 0; i < req.body.social.length; i++) {
                    count = 0;
                    if (admin[0].hasOwnProperty('social_info')) {
                        for (var j = 0; j < admin[0].social_info.length; j++) {

                            if (admin[0].social_info[j].social_media == req.body.social[i].social_media) {

                                count = 1;
                            }

                        }
                        if (count == 1) {

                            db.admin_infos.update({
                                "social_info.social_media": req.body.social[i].social_media
                            },

                                {
                                    "$set": {
                                        "social_info.$.social_media": req.body.social[i].social_media,
                                        "social_info.$.social_url": req.body.social[i].social_url,
                                        "social_info.$.social_status": req.body.social[i].social_status

                                    }

                                });
                        }
                        if (count == 0) {


                            db.admin_infos.findAndModify(

                                {
                                    query: {},
                                    update: {
                                        $push: {
                                            "social_info": {
                                                'social_media': req.body.social[i].social_media,
                                                'social_url': req.body.social[i].social_url,
                                                'social_status': req.body.social[i].social_status
                                            }
                                        }
                                    },
                                    new: true
                                },
                                function (err, data, lastErrorObject) {
                                    if (err) {

                                        res.send('error');
                                        throw err;

                                    }

                                    console.log('Social Details UPDATED');

                                });

                        }

                    }
                }
                res.status(200).send({
                    'status': 'fine'
                });
            }

        });



    });



router

    .post('/get-social-infos', function (req, res, next) {

        var res_social = [];
        db.admin_infos.find({
            "_id": mongojs.ObjectId(req.body.admin_id)
        }

            ,
            function (err, social) {
                if (err || !social) console.log(err);
                else {
                    console.log(social[0].social_info);
                    res_social = social[0].social_info;
                    res.status(200).send(res_social);
                }

            }

        );

        //res.send('this is social infos');
        //  db.social_infos.find(
        //                 { 

        //                    _id: mongojs.ObjectId('58956efa325e380c1ce8c94a')

        //                 }
        //                 ,function(err,social_infos){


        //                  if(err || social_infos=="")
        //                  {  
        //                       res.status(404);
        //                       res.send('info not found');
        //                  }else {    

        //                     //    res.status(200).json(user);
        //                     res.send(social_infos[0]);  
        //                     console.log(social_infos);
        //                  }
        //         });
    });



router

    .post('/remove-social-media', function (req, res, next) {

        db.admin_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.body.admin_id)
            },
            update: {
                $pull: {
                    'social_info': {
                        'social_media': req.body.social_media
                    }
                }

            }

        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            console.log('deleted');
            res.status(200).send({
                'status': 'deleted'
            });

        });

    });

router

    .get('/fetch-social-page', function (req, res, next) {

        db.admin_infos.find({
            'social_info.social_status': 'Active'
        },
            { social_info: 1 }
            ,
            function (err, data) {
                if (err || !data) console.log("No  data found");
                else {
                    console.log(data);
                    res.status(200).send(data);
                }

            }

        );

    });


router

    .get('/fetch-social-global-data', function (req, res, next) {


        var finalresarr = [];
        var finalresobj = {};

        db.global_setting_infos.find({

        }
            ,
            function (err, gdata) {
                if (err || !gdata) console.log("No  data found");
                else {
                    // console.log(gdata);

                    finalresobj = {};
                    finalresobj.globaldata = gdata[0];
                    finalresarr.push(finalresobj);

                    db.admin_infos.find({

                    },
                        { social_info: 1, 'info_pages._id': 1, 'info_pages.info_title': 1, 'info_pages.info_desc': 1 }
                        ,
                        function (err, sdata) {
                            if (err || !sdata) console.log("No data found");
                            else {
                                console.log(sdata);

                                finalresobj = {};
                                finalresobj.socialdata = sdata[0].social_info;
                                finalresarr.push(finalresobj);
                                finalresobj = {};
                                finalresobj.infodata = sdata[0].info_pages;
                                finalresarr.push(finalresobj);

                                // console.log(footer_coll);
                                res.status(200).send(finalresarr);
                            }

                        }

                    );




                }



            });

    });


router
    .post('/add-product-category', function (req, res, next) {

        db.categories_infos.save({

            category_name: req.body.category_name,

            category_order: req.body.category_order,
            status: 'false'
        }, function (err, category) {

            if (err || !category) console.log("err in category");
            else {

                res.send(category);
            }
            console.log('category saved');

        });


        // var date = new Date();
        // var current_hour = date.getTime();

        // var cat_name = randomstring.generate(13);
        // var cat_banner = randomstring.generate(13);

        // var cat_img_web = '/uploads/admin_uploads/' + cat_name + '.jpg';
        // var cat_banner_web = '/uploads/admin_uploads/' + cat_banner + '.jpg';

        // var category_image = 'category_image' + cat_name + '.jpg';
        // var category_banner = 'category_banner' + cat_banner + '.jpg';


        // fs.writeFile("client/uploads/admin_uploads/" + cat_name + ".jpg", new Buffer(req.body.cat_img, "base64"), function (err) {

        //     if (err) {

        //         throw err;
        //     } else {


        //         fs.writeFile("client/uploads/admin_uploads/" + cat_banner + ".jpg", new Buffer(req.body.cat_banner, "base64"), function (err) {

        //             if (err) {

        //                 throw err;
        //             } else {

        //                 db.categories_infos.save({

        //                     category_name: req.body.category_name,

        //                     category_order: req.body.category_order,
        //                     status: 'false'
        //                 }, function (err, category) {

        //                     if (err || !category) console.log("err in category");
        //                     else {

        //                         res.send(category);
        //                     }
        //                     console.log('category saved');

        //                 });



        //             }

        //         });


        //     }

        // });

    });



// FOR ATTRIBUTE INFO


router
    .post('/add-attribute-group', function (req, res, next) {

        db.attributes_infos.save({
            'group_name': req.body.attr_group_name,
            'sort_order': req.body.attr_group_order


        }, function (err, attr) {

            if (err) throw err;

            res.send(attr);
            console.log('attr saved');

        })

        // console.log(req.body);
        // db.attribute_infos.findAndModify(

        //     {
        //         query: {},
        //         update: {
        //             $push: {
        //                 "groupname": {
        //                     '_id': mongojs.ObjectId(),
        //                     'fields': req.body.attr_group_name,
        //                     'sort_order': req.body.attr_group_order
        //                 }
        //             }
        //         },
        //         new: true
        //     },
        //     function (err, data, lastErrorObject) {
        //         if (err) {
        //             res.status(400);
        //             res.send('error');
        //             throw err;

        //         }

        //         console.log(data.groupname);
        //         res.send(data.groupname);
        //     });

    });

router
    .get('/fetch-attribute-group', function (req, res, next) {


        db.attributes_infos.find(
            {},

            { attr_fields: 0 },
            function (err, info) {


                if (err) {
                    res.status(404);
                    res.send('info not found');
                } else {

                    console.log(info);
                    res.status(200).send(info);
                }
            });

    });



router
    .post('/fetch-attr-group-by-id', function (req, res, next) {

        console.log(req.body.attr_group_id);
        db.attributes_infos.find(
            { "_id": mongojs.ObjectId(req.body.attr_group_id) },


            function (err, info) {


                if (err) {
                    res.status(404);
                    res.send('info not found');
                } else {


                    res.status(200).send(info);
                }
            });

    });


router
    .get('/fetch-attr-group-name', function (req, res, next) {

        db.attributes_infos.find(function (err, attribute_infos) {

            if (err || !attribute_infos) console.log(err);
            else {
                res.status(200).send(attribute_infos);
                console.log(attribute_infos);
            }
        });



    });

router
    .post('/udpate-attr-group', function (req, res, next) {

        console.log('THIS IS UPDATE ATTR GROP');
        console.log(req.body);
        db.attributes_infos.findAndModify(

            {
                query: {
                    _id: mongojs.ObjectId(req.body._id)
                },
                update: {
                    $set: {

                        group_name: req.body.group_name,
                        sort_order: req.body.sort_order,


                    },


                },
                new: true
            },
            function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }

                res.status(200);
                res.send(data);

            });




    });

router

    .post('/delete-selected-attr-group', function (req, res, next) {
        console.log(req.body);
        for (var i = 0; i < req.body.selected_attr_group.length; i++) {

            db.attributes_infos.remove({

                '_id': mongojs.ObjectId(req.body.selected_attr_group[i])


            }, function (err, data, lastErrorObject) {
                if (err) {

                    throw err;

                }
                console.log('deleted');


            });


        }
        res.send({ 'status': 'deleted' });
    });


router

    .post('/delete-all-info-pages', function (req, res, next) {


        console.log(req.body);
        db.admin_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.body.admin_id)
            },
            update: {
                'info_pages': []
            }



        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            console.log('deleted');
            res.status(200).send(data);

        });
    });



router
    .post('/save-attr-field-name', function (req, res, next) {
        console.log(req.body);

        var value = req.body.g_name;
        db.attributes_infos.find(

            {
                'group_name': req.body.g_name

            },
            function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }

                console.log(data);

                db.attributes_infos.update({
                    "_id": mongojs.ObjectId(data[0]._id)
                },

                    {
                        "$push": {
                            "attr_fields": {

                                _id: mongojs.ObjectId(),
                                'group_attr': req.body.f_name,
                                'status': 'false',
                                'sort_order': req.body.sort_order,
                                'parent_group': req.body.g_name
                            }

                        }

                    }

                    ,
                    function (err, banner) {
                        if (err || !banner) console.log("No  banner found");
                        else {
                            console.log(banner);

                        }

                    }



                );
                res.send(data);
            });






    });


router
    .post('/fetch-cook-by-id', function (req, res, next) {

        db.cook_infos.find({
            _id: mongojs.ObjectId(req.body.cook_id)
        }, {
                food_details: 0
            }, function (err, cooks) {
                if (err || !cooks) console.log("No  cook found");
                else {
                    console.log(cooks);
                    res.status(200).send(cooks);
                }
            });

    });


router
    .post('/del-boy-by-serv-center', function (req, res, next) {

        db.service_center_infos.aggregate(

            { $match: { _id: ObjectId(req.body.service_center_id) } },

            // { $unwind: "$cook_arr" },
            {
                $lookup: {
                    from: 'delivery_boy_infos',
                    localField: '_id',
                    foreignField: 'service_center_id',
                    as: 'delivery_boy'

                },

            },
            { $project: { 'delivery_boy._id': 1, 'delivery_boy.boy_name': 1, 'delivery_boy.boy_name': 1 } }

            , function (err, delivery_boy) {
                if (err || !delivery_boy) console.log("No  delivery_boy found");
                else {
                    console.log(delivery_boy);
                    if (delivery_boy.length > 0) {
                        var data = delivery_boy[0].delivery_boy;
                        res.status(200).send(data);

                    }
                    else {

                        var data = [];
                        res.status(200).send(data);
                    }

                }
            });

    });


router
    .post('/update-cook-by-id', function (req, res, next) {

        console.log('INCOMING DATA');
        console.log(req.body);


        if ((req.body.isApproved == "Approved" || req.body.isApproved == "Un Appr" || req.body.isApproved == "new") && req.body.delivery_by == "EatoEato") {
            console.log('APPR CALLED');
            db.cook_infos.findAndModify(

                {
                    query: {
                        _id: mongojs.ObjectId(req.body.cook_id)
                    },
                    update: {
                        $set: {
                            cook_name: req.body.cook_name,
                            cook_email: req.body.cook_email,
                            cook_contact: req.body.cook_contact,
                            cook_addition_contact: req.body.cook_addition_contact,
                            about_us: req.body.about_us,
                            gender: req.body.gender,

                            //  Panel Two

                            delivery_by: req.body.delivery_by,
                            delivery_boy_id: mongojs.ObjectId(req.body.delivery_boy_id),
                            //   cook_delivery_range: req.body.cook_delivery_range,
                            service_center_name: req.body.service_center_name,
                            status: req.body.status,
                            isApproved: req.body.isApproved,


                            //  Panel Three

                            cook_company_name: req.body.cook_company_name,
                            street_address: req.body.street_address,
                            cook_latitude: req.body.cook_latitude,
                            cook_longitude: req.body.cook_longitude,
                            landmark: req.body.landmark,

                            city: req.body.city,
                            state: req.body.state,
                            pincode: req.body.pincode,

                            //   Panel Four

                            cook_commission: req.body.cook_commission,
                            bank_type: req.body.bank_type,
                            bank_name: req.body.bank_name,
                            branch_name: req.body.branch_name,
                            cook_bank_branch_name: req.body.branch_name,
                            bank_ifsc: req.body.bank_ifsc,
                            cook_name_on_bank_acc: req.body.cook_name_on_bank_acc,
                            bank_account_no: req.body.bank_account_no,
                            updated_fields: [],

                            is_gstin: req.body.is_gstin,
                            gstin_no: req.body.gstin_no,

                            updated_at: moment(new Date()).format("DD/MM/YYYY"),
                        },


                    },
                    new: true
                },
                function (err, data, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send('error');
                        throw err;

                    }

                    res.status(200);
                    res.send(data);

                });

        }
        else {
            console.log('22222222222');
            db.cook_infos.findAndModify(

                {
                    query: {
                        _id: mongojs.ObjectId(req.body.cook_id)
                    },
                    update: {
                        $set: {
                            cook_name: req.body.cook_name,
                            cook_email: req.body.cook_email,
                            cook_contact: req.body.cook_contact,
                            cook_addition_contact: req.body.cook_addition_contact,
                            about_us: req.body.about_us,
                            gender: req.body.gender,

                            //  Panel Two

                            delivery_by: req.body.delivery_by,
                            delivery_range: req.body.delivery_range,
                            service_center_name: req.body.service_center_name,
                            status: req.body.status,
                            isApproved: req.body.isApproved,


                            //  Panel Three

                            cook_company_name: req.body.cook_company_name,
                            street_address: req.body.street_address,
                            cook_latitude: req.body.cook_latitude,
                            cook_longitude: req.body.cook_longitude,
                            landmark: req.body.landmark,
                            city: req.body.city,
                            state: req.body.state,
                            pincode: req.body.pincode,

                            //   Panel Four

                            cook_commission: req.body.cook_commission,
                            bank_type: req.body.bank_type,
                            bank_name: req.body.bank_name,
                            branch_name: req.body.branch_name,
                            cook_bank_branch_name: req.body.branch_name,
                            bank_ifsc: req.body.bank_ifsc,
                            cook_name_on_bank_acc: req.body.cook_name_on_bank_acc,
                            bank_account_no: req.body.bank_account_no,

                            is_gstin: req.body.is_gstin,
                            gstin_no: req.body.gstin_no,

                            updated_at: moment(new Date()).format("DD/MM/YYYY"),
                        },


                    },
                    new: true
                },
                function (err, data, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send('error');
                        throw err;

                    }

                    res.status(200);
                    res.send(data);

                });

        }








        if (req.body.hasOwnProperty('service_center_name')) {

            // IMP NOTE :: APPLY CHECK IF COOK ID ALREADY SAVED IN SERVICE CENTER OR NOT


            console.log('IT HAS SERCICE CENTER');
            console.log(req.body.service_center_name);


            db.service_center_infos.find(
                { 'center_name': req.body.service_center_name }
                ,
                function (err, service_center) {

                    if (service_center.length > 0) {

                        db.service_center_infos.update({
                            'cook_arr._id': mongojs.ObjectId(req.body.cook_id)

                        },
                            { $pull: { 'cook_arr': { '_id': mongojs.ObjectId(req.body.cook_id) } } }
                            , function (err, data, lastErrorObject) {
                                if (err) {
                                    res.status(400);
                                    res.send('error');
                                    throw err;

                                }
                                console.log('DELETED');

                                db.service_center_infos.findAndModify({

                                    query: { "center_name": req.body.service_center_name },
                                    update: {
                                        $push:
                                        {
                                            "cook_arr":

                                            {
                                                "_id": mongojs.ObjectId(req.body.cook_id)

                                            }
                                        }
                                    },
                                    new: true

                                },
                                    function (err, data) {
                                        console.log('UPDATED ALSO');
                                    });

                                //console.log(data);
                            }
                        );

                    }
                    console.log(service_center);
                });


        }

        if (req.body.hasOwnProperty('delivery_boy')) {

            db.cook_infos.findAndModify({

                query: { _id: mongojs.ObjectId(req.body.cook_id) },
                update: {
                    $set:
                    {
                        'delivery_boy_id': ObjectId(req.body.delivery_boy)
                    }
                },
                new: true

            },
                function (err, data) {
                    console.log('UPDATED DEL BOY ALSO');

                    // db.delivery_boy_infos.find(
                    //     { '_id': mongojs.ObjectId(req.body.delivery_boy) }
                    //     ,
                    //     function (err, service_center) {

                    //         if (service_center.length > 0) {

                    //             db.service_center_infos.update({
                    //                 'cook_arr._id': mongojs.ObjectId(req.body.cook_id)

                    //             },
                    //                 { $pull: { 'cook_arr': { '_id': mongojs.ObjectId(req.body.cook_id) } } }
                    //                 , function (err, data, lastErrorObject) {
                    //                     if (err) {
                    //                         res.status(400);
                    //                         res.send('error');
                    //                         throw err;

                    //                     }

                    //                 });
                    //         }
                });

        }
        //



    });

//FOR BANNER OPERATIONS

router
    .post('/add-banner-details', function (req, res, next) {

        console.log(req.body.img.length);
        var id = mongojs.ObjectId();
        db.banner_infos.save(
            {
                '_id': id, 'banner_name': req.body.banner_name, 'banner_status': req.body.banner_status
            }
            , function (err, banner) {

                if (err) throw err;



                console.log('banner DETAILS saved');

                for (var i = 0; i < req.body.choices.length; i++) {

                    var banner = randomstring.generate(13);

                    var banner_file = '/uploads/global_setting_uploads/' + banner + '.jpg';

                    fs.writeFile("client/uploads/global_setting_uploads/" + banner + ".jpg", new Buffer(req.body.img[i], "base64"), function (err) {

                        if (err) {

                            throw err;
                            console.log(err);
                            res.send(err)
                        } else {
                            console.log('Banner Img uploaded');

                        }

                    });

                    //  db.banner_infos.update(
                    // { '_id': mongojs.ObjectId(id) },
                    // { $push: { "banner_details": { _id:mongojs.ObjectId(),'banner_title': req.body.choices[i].banner_title, 'banner_link': req.body.choices[i].banner_link, 'banner_img': banner_file, 'banner_order': req.body.choices[i].banner_order } } }

                    db.banner_infos.findAndModify({
                        query: { _id: mongojs.ObjectId(id) },
                        update: {
                            $push: {
                                banner_details: {
                                    '_id': mongojs.ObjectId(),
                                    'banner_title': req.body.choices[i].banner_title,
                                    'banner_link': req.body.choices[i].banner_link,
                                    'banner_order': req.body.choices[i].banner_order,
                                    'banner_img': banner_file

                                }
                            }
                        },
                        new: true


                    }, function (err, data, lastErrorObject) {
                        if (err) {

                            res.send('error');
                            throw err;
                            console.log(err);
                        }


                    });

                }


                res.send(banner);

            });




    });

router
    .get('/fetch-all-banner-details', function (req, res, next) {

        db.banner_infos.find({

        },
            { banner_name: 1, banner_status: 1 }
            , function (err, banner) {
                if (err || !banner) console.log("No  banner found");
                else {
                    console.log(banner[0]);
                    res.status(200).send(banner);
                }
            });
    });

router

    .post('/delete-selected-banner', function (req, res, next) {

        console.log(req.body);

        for (var i = 0; i < req.body.selected_banner.length; i++) {

            db.banner_infos.remove({

                '_id': mongojs.ObjectId(req.body.selected_banner[i])

            }, function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }
                res.send('deleted')
                console.log('deleted');


            });

        }
    });

router

    .post('/delete-all-banners', function (req, res, next) {


        console.log(req.body);
        db.admin_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.body.admin_id)
            },

            update: {
                $pull: {
                    'banner_info': {

                    }
                }


            }


        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            console.log('deleted');
            res.status(200).send(data);

        });
    });

router

    .post('/delete-all-coupon', function (req, res, next) {

        console.log('delteing ALL');
        console.log(req.body);
        db.admin_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.body.admin_id)
            },
            update: {
                $pull: {
                    'coupon_infos': {

                    }
                }


            }


        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            console.log('deleted');
            res.status(200).send(data);

        });
    });

router

    .post('/enable-banner-by-id', function (req, res, next) {


        for (var i = 0; i < req.body.length; i++) {

            db.banner_infos.update({
                "_id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "banner_status": 'Enable'

                    }

                }

                ,
                function (err, coupon) {
                    if (err || !coupon) console.log("No  banner found");
                    else {
                        console.log(coupon);

                    }

                }

            );


        }
        res.status(200).send({
            'status': 'updated'
        });

    });

router

    .post('/disable-banner-by-id', function (req, res, next) {

        console.log(req.body);
        for (var i = 0; i < req.body.length; i++) {

            db.banner_infos.update({
                "_id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "banner_status": 'Disable'

                    }

                }

                ,
                function (err, banner) {
                    if (err || !banner) throw err;
                    else {
                        console.log(banner);

                    }

                }

            );


        }
        res.status(200).send({
            'status': 'updated'
        });

    });

router

    .post('/enable-all-banner', function (req, res, next) {

        db.banner_infos.update({

        },

            {
                "$set": {
                    "banner_status": 'Enable'

                }

            },
            { multi: true }
            ,
            function (err, banner) {
                if (err || !banner) console.log("No  banner found");
                else {
                    console.log(banner);

                }
                res.send('success');
            }



        );




    });

router

    .post('/disable-all-banner', function (req, res, next) {
        console.log('DISABLING ALL BANNER');
        db.banner_infos.update({

        },

            {
                "$set": {
                    "banner_status": 'Disable'

                }

            },
            { multi: true }
            ,
            function (err, banner) {
                if (err || !banner) console.log("No  banner found");
                else {
                    console.log(banner);

                }
                res.send('success');
            }



        );


    });

router

    .post('/fetch-banner-by-id', function (req, res, next) {

        //console.log(req.body.info_page_id);
        db.banner_infos.findOne({
            "_id": mongojs.ObjectId(req.body.banner_id)
        }
            , function (err, banner) {
                if (err || !banner) console.log("No  banner found");
                else {
                    console.log(banner);
                    res.status(200).send(banner);
                }

            }

        );

    });

router
    .post('/update-banner-img-by-id', function (req, res, next) {

        console.log(req.body);

        var banner = randomstring.generate(13);

        var banner_file = '/uploads/global_setting_uploads/' + banner + '.jpg';

        fs.writeFile("client/uploads/global_setting_uploads/" + banner + ".jpg", new Buffer(req.body.banner_img, "base64"), function (err) {

            if (err) {

                throw err;
                console.log(err);
                res.send(err)
            } else {
                console.log('Banner Img uploaded');

            }

        });



        db.banner_infos.update({
            'banner_details._id': mongojs.ObjectId(req.body.banner_id)
        }, {
                $set: { 'banner_details.$.banner_img': banner_file }
            }
            , function (err, data, lastErrorObject) {

                if (err) {

                    res.send('error');
                    throw err;
                    console.log(err);

                }
                console.log(data);
                res.send('updated')
            });

    });


router
    .post('/update-banner-details', function (req, res, next) {

        console.log('THIS IS BANNER');
        console.log(req.body);

        db.banner_infos.update({
            "_id": mongojs.ObjectId(req.body._id)
        },

            {
                "$set": {
                    "banner_name": req.body.banner_name,
                    "banner_status": req.body.banner_status

                }

            }

            , function (err, data, lastErrorObject) {

                if (err) {

                    res.send('error');
                    throw err;
                    console.log(err);

                }
                console.log(data);

                db.banner_infos.find(
                    {},
                    function (err, data) {


                        if (err) {
                            res.status(404);
                            res.send('layout not found');
                        } else {

                            console.log(data);

                            for (var i = 0; i < data.length; i++) {

                                if (data[i]._id == req.body._id) {

                                    for (var j = 0; j < data[i].banner_details.length; j++) {


                                        db.banner_infos.update({
                                            "banner_details._id": mongojs.ObjectId(data[i].banner_details[j]._id)
                                        },

                                            {
                                                "$set": {
                                                    "banner_details.$.banner_title": req.body.banner_details[j].banner_title,
                                                    "banner_details.$.banner_link": req.body.banner_details[j].banner_link,
                                                    "banner_details.$.banner_order": req.body.banner_details[j].banner_order,

                                                }

                                            }
                                            , function (err, data, lastErrorObject) {

                                                if (err) {

                                                    res.send('error');
                                                    throw err;
                                                    console.log(err);

                                                }


                                            }

                                        );

                                    }




                                }




                            }

                            res.send('data');


                        }
                    });



            });

    });

// LAYOUT OPERATIONS//
router
    .post('/add-layout-page', function (req, res, next) {

        var b_detail = [];
        console.log(req.body);

        db.banner_infos.find({
            _id: mongojs.ObjectId(req.body.banner_id)
        }

            , function (err, banner) {
                if (err || !banner) console.log("No  banner found");
                else {

                    b_detail.push(banner[0].banner_details);

                    db.layout_infos.save(
                        {
                            'layout_type': req.body.layout_type,
                            'assined_banner_id': req.body.banner_id,
                            'assined_banner_name': b_detail[0],
                            'layout_status': req.body.layout_status,
                            'layout_name': req.body.layout_name
                        }
                        ,
                        function (err, data, lastErrorObject) {
                            if (err) {
                                res.status(400);
                                res.send('error');
                                throw err;

                            }

                            console.log(data);
                            res.status(200).send(data);
                        });

                }

            }

        );

    });

router

    .post('/fetch-layout-detail', function (req, res, next) {

        db.layout_infos.find(
            {},

            function (err, layout) {


                if (err) {
                    res.status(404);
                    res.send('layout not found');
                } else {

                    console.log(layout);
                    res.status(200).send(layout);
                }
            });
    });

router

    .post('/delete-selected-layout-pages', function (req, res, next) {

        console.log(req.body);

        for (var i = 0; i < req.body.selected_layout_page.length; i++) {


            db.layout_infos.remove({

                '_id': mongojs.ObjectId(req.body.selected_layout_page[i])

            }, function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }

                console.log('deleted');


            });




        }
        res.send('deleted');
    });


router

    .post('/delete-all-layout-pages', function (req, res, next) {


        console.log(req.body);
        db.layout_infos.remove();

    });

router

    .post('/enable-layout-by-id', function (req, res, next) {

        console.log(req.body);

        for (var i = 0; i < req.body.length; i++) {

            db.layout_infos.update({
                "_id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "layout_status": 'Enable'

                    }


                }

                ,
                function (err, layout) {
                    if (err || !layout) console.log("No  layout found");
                    else {
                        console.log(layout);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });

    });

router

    .post('/disable-layout-by-id', function (req, res, next) {

        console.log(req.body);
        for (var i = 0; i < req.body.length; i++) {

            db.layout_infos.update({
                "_id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "layout_status": 'Disable'

                    }


                }

                ,
                function (err, layout) {
                    if (err || !layout) console.log("No  layout found");
                    else {
                        console.log(layout);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });

    });

router

    .post('/enable-all-layout', function (req, res, next) {

        console.log('enabling all');
        console.log(req.body);

        db.layout_infos.update({

        },

            {
                "$set": {
                    "layout_status": 'Enable'

                }

            },
            { multi: true }
            ,
            function (err, layout) {
                if (err || !layout) console.log("No  layout found");
                else {
                    console.log(layout);

                }
                res.send('success');
            }



        );


    });

router

    .post('/disable-all-layout', function (req, res, next) {

        console.log(req.body);
        db.layout_infos.update({

        },

            {
                "$set": {
                    "layout_status": 'Disable'

                }

            },
            { multi: true }
            ,
            function (err, layout) {
                if (err || !layout) console.log("No  layout found");
                else {
                    console.log(layout);

                }
                res.send('success');
            }



        );



    });

router

    .post('/fetch-layout-by-id', function (req, res, next) {


        db.layout_infos.find({
            "_id": mongojs.ObjectId(req.body.layout_id)
        }
            , function (err, layout) {
                if (err || !layout) console.log("No  layout found");
                else {
                    console.log(layout);
                    res.status(200).send(layout);
                }

            }

        );

    });

router

    .post('/update-layout-page', function (req, res, next) {

        console.log(req.body.banner_name._id);
        var b_detail = [];

        db.banner_infos.find({
            '_id': mongojs.ObjectId(req.body.banner_name._id)
        }

            , function (err, banner) {
                if (err || !banner) console.log("No  banner found");
                else {

                    console.log(banner);

                    b_detail.push(banner[0].banner_details);


                    db.layout_infos.update({
                        "_id": mongojs.ObjectId(req.body.layout_id)
                    },

                        {
                            "$set": {

                                'layout_type': req.body.layout_type,
                                'assined_banner_id': req.body.banner_id,
                                'assined_banner_name': b_detail[0],
                                'layout_status': req.body.layout_status,
                                'layout_name': req.body.layout_name

                            }

                        },
                        function (err, data, lastErrorObject) {
                            if (err) {
                                res.status(400);
                                res.send('error');
                                throw err;

                            }

                            console.log(data);
                            res.status(200).send(data);
                        });

                }

            }

        );

    });

//FOR TEMPLATE OPERATIONS

router

    .post('/save-sms-template', function (req, res, next) {
        var sms_template;

        String.prototype.replaceAll = function (target, replacement) {
            return this.split(target).join(replacement);
        };

        sms_template = req.body.sms_body.replaceAll("^", "");


        db.admin_infos.findAndModify({
            query: {
                '_id': mongojs.ObjectId(req.body.admin_id)
            },
            update: {
                $push: {
                    'sms_template':
                    {
                        '_id': mongojs.ObjectId(),
                        'sms_type': req.body.sms_type,
                        'sms_template': sms_template,

                    }

                }
            },
            new: true

        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }

            console.log(data);
            res.status(200).send(data);
        });

    });

router

    .post('/fetch-template-by-type', function (req, res, next) {


        db.admin_infos.find(
            { 'sms_template.sms_type': req.body.temp_view_id },
            { sms_template: 1, _id: 0 }
            ,
            function (err, template) {

                var count = 0;
                if (err) {
                    res.status(404);
                    res.send('info not found');
                } else {


                    if (template.length > 0) {

                        for (var i = 0; i < template[0].sms_template.length; i++) {

                            if (template[0].sms_template[i].sms_type == req.body.temp_view_id) {
                                res.status(200).send(template[0].sms_template[i]);
                                count++;
                                break;
                            }
                        }
                    }
                    if (count < 1) {

                        res.send({ 'status': 'no data found' });
                    }

                    //    if(template[0].sms_template);
                    // console.log(template[0].sms_template.length);

                }
            });
    });

router

    .post('/save-email-template', function (req, res, next) {

        console.log(req.body);
        var email_templates_subj;
        var email_template_body;

        String.prototype.replaceAll = function (target, replacement) {
            return this.split(target).join(replacement);
        };

        email_templates_subj = req.body.email_subj.replaceAll("^", "");
        email_template_body = req.body.email_body.replaceAll("^", "");

        console.log('subj--' + email_templates_subj);
        console.log('body--' + email_template_body);

        db.admin_infos.findAndModify({
            query: {
                '_id': mongojs.ObjectId(req.body.admin_id)
            },
            update: {
                $push: {
                    'email_template':
                    {
                        '_id': mongojs.ObjectId(),
                        'email_type': req.body.email_type,
                        'email_subj': email_templates_subj,
                        'email_body': email_template_body,

                    }

                }
            },
            new: true

        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }

            console.log(data);
            res.status(200).send(data);
        });

    });




// SERVICE CENTER OPERATIONS

router

    .post('/add-service-center', function (req, res, next) {

        console.log(req.body);

        db.service_center_infos.save({

            'center_name': req.body.center_name,
            'center_delivery_range': req.body.center_delivery_range,
            'center_lat': req.body.center_lat,

            'center_long': req.body.center_long,
            'center_landmark': req.body.center_landmark,
            'center_location': req.body.center_location,
            'center_state': req.body.center_state,
            'center_city': req.body.center_city,
            'center_pincode': req.body.center_pincode,
            'center_status': req.body.center_status,
            joined_on: moment(new Date()).format("DD/MM/YYYY"),
            "updated_at": "",
            "cook_arr": []



        }, function (err, user) {

            if (err) throw err;

            res.send(user);
            console.log('user saved');

        })

    });
// db.service_center_infos.findAndModify({
//     query: {

//     },
//     update: {
//         $push: {
//             'service_center_info':
//             {
//                 '_id': mongojs.ObjectId(),
//                 'center_name': req.body.center_name,
//                 'center_delivery_range': req.body.center_delivery_range,
//                 'center_lat': req.body.center_lat,
//                 'center_long': req.body.center_long,
//                 'center_location': req.body.center_location,
//                 'center_state': req.body.center_state,
//                 'center_city': req.body.center_city,
//                 'center_pincode': req.body.center_pincode,
//                 'center_status': req.body.center_status,
//                 joined_on: moment(new Date()).format("DD/MM/YYYY"),
//                 "updated_at": "",

//             }

//         }
//     },
//     new: true

// }, function (err, data, lastErrorObject) {
//     if (err) {
//         res.status(400);
//         res.send('error');
//         throw err;

//     }

//     console.log(data);
//     res.status(200).send(data);
// });



//  });

router

    .post('/fetch-service-center-all', function (req, res, next) {
        console.log("FETCHING");
        db.service_center_infos.find(
            {},

            function (err, service_center) {


                if (err) {
                    res.status(404);
                    res.send('Serv Center Not Found');
                } else {

                    console.log(service_center);
                    res.send(service_center);
                }
            });
    });


router

    .post('/fetch-service-center-with-orders', function (req, res, next) {


        db.service_center_infos.find(
            {}
            ,
            function (err, service_center) {

                var s_center_info = service_center;
                var d_boy;
                var tot_d_boy = 0;
                var tot_order = 0;

                db.delivery_boy_infos.find(
                    {}
                    ,
                    function (err, delivery_boy) {
                        console.log('DEL BOY DATA');
                        console.log(delivery_boy);
                        d_boy = delivery_boy;

                        for (var i = 0; i < s_center_info.length; i++) {
                            tot_d_boy = 0;

                            for (var j = 0; j < d_boy.length; j++) {

                                if (s_center_info[i]._id == d_boy[j].service_center_id.toString()) {
                                    console.log('TEST');
                                    tot_d_boy++;
                                }
                            }

                            s_center_info[i].tot_del_boy = tot_d_boy;

                        }

                        db.service_center_infos.find({}, function (err, svdata) {


                            console.log('SERVICE CENTER DATA');
                            console.log(svdata);
                        });

                        db.service_center_infos.aggregate(

                            { $unwind: "$cook_arr" },
                            {
                                $lookup: {
                                    from: 'order_infos',
                                    localField: 'cook_arr._id',
                                    foreignField: 'cook_id',
                                    as: 'order_data'

                                },

                            },
                            { $project: { 'center_name': 1, 'order_data.cook_id': 1 } }
                            , function (err, cook_order) {

                                console.log('COOK ORDER DATA');
                                console.log(cook_order);
                                for (var s = 0; s < s_center_info.length; s++) {
                                    tot_order = 0;
                                    for (var t = 0; t < cook_order.length; t++) {

                                        if (s_center_info[s].center_name == cook_order[t].center_name) {

                                            if (cook_order[t].order_data.length > 0) {

                                                for (var m = 0; m < cook_order[t].order_data.length; m++) {

                                                    tot_order++;

                                                }

                                            }


                                            console.log('FOUND');


                                        }
                                    }

                                    s_center_info[s].tot_orders = tot_order;
                                }
                                res.send(s_center_info);
                            });



                    });


            });


    });


router

    .post('/fetch-service-center-order-view', function (req, res, next) {

        console.log('view orders');
        console.log(req.body);


        db.service_center_infos.aggregate([

            {

                $match: {

                    _id: mongojs.ObjectId(req.body.service_center_id)

                }
            },

            {
                $unwind: '$cook_arr'

            }
            , {
                $lookup: {
                    from: 'order_infos',
                    localField: 'cook_arr._id',
                    foreignField: 'cook_id',
                    as: 'orders'

                },

            },
            // {
            //     $lookup: {
            //         from: 'user_infos',
            //         localField: 'user_id',
            //         foreignField: '_id',
            //         as: 'user'

            //     },

            // },
            { $project: { 'orders.order_id': 1, 'orders.date': 1, 'orders.order_status': 1, 'orders.items.grand_total': 1, 'orders.items.pay_mode': 1, 'orders.items.username': 1 } }
        ], function (err, data) {

            if (err) {

                res.send("error");

            }
            else {

                var final_data = [];

                for (var i = 0; i < data.length; i++) {

                    if (data[i].orders.length > 0) {

                        for (var j = 0; j < data[i].orders.length; j++) {

                            final_data.push(data[i].orders[j]);
                        }
                    }
                }
                res.send(final_data);

            }


        });
        //    res.send('test');
        // db.service_center_infos.find(
        //     { _id: mongojs.ObjectId('593e6c1795ab730870417f03') },
        //     { cook_arr: 1 },
        //     function (err, service_center) {


        //         if (err) {
        //             res.status(404);
        //             res.send('service center not found');
        //         } else {
        //             // res.send(service_center);

        //             var service_center_cooks = service_center[0].

        //                 db.order_infos.find(
        //                 {},
        //                 { order_id: 1, date: 1, 'items.grand_total': 1, order_status: 1, cook_id: 1 },

        //                 function (err, order_info) {

        //                     var order_data = order_info;
        //                     var final_data = [];

        //                     for (var i = 0; i < service_center_cooks.length; i++) {

        //                         for (var j = 0; j < order_data.length; j++) {

        //                             //  console.log(order_data[0].cook_id);
        //                             if (service_center_cooks[i]._id == order_data[j].cook_id) {
        //                                 console.log('FOUND');

        //                                 final_data.push(order_data[j]);

        //                             }
        //                         }
        //                     }


        //                     res.send(service_center_cooks);

        //                 });

        //             //                    

        //             // var service_center_detail = service_center[0].service_center_info;

        //             // var selec_serv_center = [];
        //             // for (var i = 0; i < service_center_detail.length; i++) {

        //             //     if (service_center_detail[i]._id == req.body.service_center_id) {
        //             //         selec_serv_center.push(service_center_detail[i]);

        //             //     }

        //             // }

        //             // //  console.log(selec_serv_center);
        //             // // res.send(selec_serv_center);
        //             // var orders_data = [];
        //             // var order_coll = [];
        //             // var order_obj = {};
        //             // var order_final_coll = [];
        //             // var final_obj = {};
        //             // db.user_infos.find({

        //             // },
        //             //     { orders: 1 }
        //             //     ,
        //             //     function (err, data) {
        //             //         if (err || !data) console.log("No  data found");
        //             //         else {
        //             //             // console.log(order);

        //             //             for (var i = 0; i < data.length; i++) {

        //             //                 if (data[i].orders.length > 0) {

        //             //                     orders_data.push(data[i]);
        //             //                 }

        //             //             }




        //             //             for (var j = 0; j < orders_data.length; j++) {


        //             //                 for (var k = 0; k < orders_data[j].orders.length; k++) {

        //             //                     // for (var l = 0; l < orders_data[j].orders[k].items.length; l++) {

        //             //                     order_coll.push(orders_data[j].orders[k]);

        //             //                     //  }

        //             //                 }
        //             //             }


        //             //             //    console.log()
        //             //             var is_break = "false";
        //             //             for (var m = 0; m < selec_serv_center[0].cook_arr.length; m++) {



        //             //                 for (var s = 0; s < order_coll.length; s++) {


        //             //                     for (var b = 0; b < order_coll[s].items.length; b++) {

        //             //                         if (order_coll[s].items[b].cook_id == selec_serv_center[0].cook_arr[m].cook_id) {

        //             //                             final_obj = {};

        //             //                             final_obj.order_id = order_coll[s].order_id;
        //             //                             final_obj.username = order_coll[s].items[b].username;
        //             //                             final_obj.food_total_price = order_coll[s].items[b].food_total_price;
        //             //                             final_obj.date = order_coll[s].date;
        //             //                             final_obj.time = order_coll[s].time;
        //             //                             final_obj.order_status = order_coll[s].order_status;


        //             //                             order_final_coll.push(final_obj);
        //             //                             is_break = "true";
        //             //                             break;

        //             //                         }

        //             //                     }

        //             //                 }

        //             //             }

        //             //             //   console.log(total_service_center_order);
        //             //             // res.send(order_final_coll);
        //             //             res.send(order_final_coll);

        //             //         }

        //             //     }

        //             // );








        //         }
        //     });

    });

router.post('/fetch-fetch', function (req, res, next) {


    db.service_center_infos.aggregate([

        {

            $match: {

                _id: mongojs.ObjectId(req.body.service_center_id)

            }
        },

        {
            $unwind: '$cook_arr'

        }
        , {
            $lookup: {
                from: 'order_infos',
                localField: 'cook_arr._id',
                foreignField: 'cook_id',
                as: 'orders'

            },

        }





    ], function (err, data) {

        if (err) {

            res.send("error");

        }
        else {

            res.send(data);

        }


    });




});


router

    .post('/delete-selected-service-center', function (req, res, next) {



        for (var i = 0; i < req.body.selected_service_center.length; i++) {

            db.service_center_infos.remove({

                '_id': mongojs.ObjectId(req.body.selected_service_center[i])

            }, function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }
                console.log(data);


            });


        }
        res.send({ 'status': 'deleted' });
    });


router

    .post('/delete-all-service-center', function (req, res, next) {



        db.admin_infos.findAndModify({
            query: {

            },
            update: {
                $pull: {
                    'service_center_info': {

                    }
                }

            }

        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            console.log('deleted');
            res.status(200).send(data);

        });

    });

router

    .post('/enable-service-center-by-id', function (req, res, next) {



        for (var i = 0; i < req.body.length; i++) {

            db.admin_infos.update({
                "service_center_info._id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "service_center_info.$.center_status": 'Enable'

                    }

                }

                ,
                function (err, data) {
                    if (err || !data) console.log("No  data found");
                    else {
                        console.log(data);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });

    });

router

    .post('/disable-service-center-by-id', function (req, res, next) {

        console.log(req.body);
        for (var i = 0; i < req.body.length; i++) {

            db.admin_infos.update({
                "service_center_info._id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "service_center_info.$.center_status": 'Disable'

                    }

                }

                ,
                function (err, data) {
                    if (err || !data) throw err;
                    else {
                        console.log(data);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });

    });

router

    .post('/enable-all-service-center', function (req, res, next) {


        db.admin_infos.find({

        }, {
                service_center_info: 1,
                _id: 0
            }, function (err, center) {
                if (err || !center) console.log("No  center found");
                else {
                    console.log(center[0].service_center_info);

                    for (var i = 0; i < center[0].service_center_info.length; i++) {



                        db.admin_infos.update({
                            "service_center_info._id": mongojs.ObjectId(center[0].service_center_info[i]._id)
                        },

                            {
                                "$set": {
                                    "service_center_info.$.center_status": 'Enable'

                                }

                            }

                            ,
                            function (err, data) {
                                if (err || !data) console.log("No  data found");
                                else {
                                    console.log(data);

                                }

                            }



                        );

                    }

                    res.status(200).send("fine");
                }

            }

        );



    });

router

    .post('/disable-all-service-center', function (req, res, next) {


        db.admin_infos.find({

        }, {
                service_center_info: 1,
                _id: 0
            }, function (err, center) {
                if (err || !center) console.log("No  center found");
                else {
                    console.log(center[0].service_center_info);

                    for (var i = 0; i < center[0].service_center_info.length; i++) {



                        db.admin_infos.update({
                            "service_center_info._id": mongojs.ObjectId(center[0].service_center_info[i]._id)
                        },

                            {
                                "$set": {
                                    "service_center_info.$.center_status": 'Disable'

                                }

                            }

                            ,
                            function (err, data) {
                                if (err || !data) console.log("No  data found");
                                else {
                                    console.log(data);

                                }

                            }



                        );

                    }

                    res.status(200).send("fine");
                }

            }

        );

    });


router

    .post('/fetch-service-center-by-id', function (req, res, next) {

        //console.log(req.body.info_page_id);
        db.service_center_infos.findOne({
            "_id": mongojs.ObjectId(req.body.service_center_id)
        }
            , function (err, center) {
                if (err || !center) console.log("No  center found");
                else {
                    console.log(center);
                    res.status(200).send(center);
                }

            }

        );

    });



router

    .post('/update-service-center-by-id', function (req, res, next) {


        db.service_center_infos.update({
            "_id": mongojs.ObjectId(req.body._id)
        },

            {
                "$set": {

                    'center_name': req.body.center_name,
                    'center_delivery_range': req.body.center_delivery_range,
                    'center_lat': req.body.center_lat,
                    'center_long': req.body.center_long,
                    'center_landmark': req.body.center_landmark,
                    'center_location': req.body.center_location,
                    'center_state': req.body.center_state,
                    'center_city': req.body.center_city,
                    'center_pincode': req.body.center_pincode,
                    'center_status': req.body.center_status,
                    'updated_at': moment(new Date()).format("DD/MM/YYYY"),




                }

            }

            ,
            function (err, center) {
                if (err || !center) console.log("No  center found");
                else {

                    res.status(200).send({ 'status': 'updated' });
                }

            }



        );
    });


router

    .post('/fetch-associated-cooks', function (req, res, next) {

        console.log('ASSOCATED COOKS');
        console.log(req.body);

        db.service_center_infos.aggregate(


            { $match: { _id: ObjectId(req.body.service_center_id) } },

            { $unwind: "$cook_arr" },
            {
                $lookup: {
                    from: 'cook_infos',
                    localField: 'cook_arr._id',
                    foreignField: '_id',
                    as: 'cook_data'

                },
            },
            { $unwind: "$cook_data" },
            {
                $lookup: {
                    from: 'delivery_boy_infos',
                    localField: "cook_data.delivery_boy_id",
                    foreignField: '_id',
                    as: 'dvdata'
                }
            },
            { $unwind: "$dvdata" },

            // { $match: { _id: ObjectId(req.body.service_center_id) } },

            // { $unwind: "$cook_arr" },
            // {
            //     $lookup: {
            //         from: 'cook_infos',
            //         localField: 'cook_arr._id',
            //         foreignField: '_id',
            //         as: 'cook_data'

            //     },

            // },

            { $project: { 'cook_data._id': 1, 'cook_data.cook_name': 1, 'cook_data.cook_email': 1, 'cook_data.cook_contact': 1, 'cook_data.cook_commission': 1, 'cook_data.joined_on': 1, 'cook_data.status': 1, 'cook_data.delivery_boy_id': 1, 'dvdata': 1 } }

            , function (err, data) {




                res.send(data);
            }


        );


    });

// DELIVERY BOY OPERATIONS


router

    .post('/add-delivery-boy', function (req, res, next) {

        db.delivery_boy_infos.save(

            {
                '_id': mongojs.ObjectId(),
                'boy_name': req.body.boy_name,
                'boy_email': req.body.boy_email,
                'boy_contact': req.body.boy_contact,
                'boy_password': req.body.boy_password,
                'boy_status': req.body.boy_status,
                // 'service_center_city': req.body.service_center_city,
                'service_center_id': mongojs.ObjectId(req.body.service_center_id),
                'assigned_cook_arr': [],
                'joined_on': moment(new Date()).format("DD/MM/YYYY"),
                'update_at': ''

            }

            , function (err, data, lastErrorObject) {


                res.send('added');
            });

        // db.delivery_boy_infos.findAndModify({
        //     query: {

        //     },
        //     update: {
        //         $push: {
        //             'delivery_boy_info':
        //             {
        //                 '_id': mongojs.ObjectId(),
        //                 'boy_name': req.body.boy_name,
        //                 'boy_email': req.body.boy_email,
        //                 'boy_contact': req.body.boy_contact,
        //                 'boy_password': req.body.boy_password,
        //                 'boy_status': req.body.boy_status,
        //                 'service_center_city': req.body.service_center_city,
        //                 'service_center_name': req.body.service_center_name,
        //                 'assigned_cook': req.body.selected_cook,
        //                 'cook_assign': req.body.cooks_arr,
        //                 'joined_on': moment(new Date()).format("DD/MM/YYYY"),
        //                 'update_at': ''

        //             }

        //         }
        //     },
        //     new: true

        // }, function (err, data, lastErrorObject) {
        //     if (err) {
        //         res.status(400);
        //         res.send('error');
        //         throw err;

        //     }




        //     console.log(data);
        //     res.status(200).send(data);
        // });
    });


router

    .post('/edit-delivery-boy', function (req, res, next) {


        db.admin_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.body._id)
            },
            update: {
                $set: {
                    'delivery_boy_info':
                    {

                        'boy_name': req.body.boy_name,
                        'boy_email': req.body.boy_email,
                        'boy_contact': req.body.boy_contact,
                        'boy_password': req.body.boy_password,
                        'boy_status': req.body.boy_status,
                        'service_center_city': req.body.service_center_city,
                        'service_center_name': req.body.service_center_name,
                        'assigned_cook': req.body.selected_cook,

                        'update_at': moment(new Date()).format("DD/MM/YYYY")

                    }

                }
            },
            new: true

        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }

            console.log(data);
            res.status(200).send(data);
        });
    });


router

    .post('/fetch-delivery-boy-all', function (req, res, next) {

        db.delivery_boy_infos.aggregate(
            // { $match: { _id: ObjectId(req.body.service_center_id) } },

            //  { $unwind: "$delivery_boy_infos" },
            {
                $lookup: {
                    from: 'service_center_infos',
                    localField: 'service_center_id',
                    foreignField: '_id',
                    as: 'service_center'

                },

            },
            {
                $lookup: {
                    from: 'cook_infos',
                    localField: '_id',
                    foreignField: 'delivery_boy_id',
                    as: 'cook_assign'

                },

            },
            //    {
            //        $unwind: "$cook_assign"

            //    },

            //      {
            //         $lookup: {
            //             from: 'order_infos',
            //             localField: 'cook_assign.cook_contact',
            //             foreignField: 'cook_contact',
            //             as: 'order_detail'

            //         },

            //     },
            { $project: { _id: 1, boy_name: 1, boy_email: 1, boy_contact: 1, joined_on: 1, 'service_center.center_name': 1, 'service_center._id': 1, 'cook_assign.cook_name': 1, 'cook_assign.cook_name': 1, 'cook_assign._id': 1, 'cook_assign.cook_contact': 1, 'order_detail.order_id': 1 } }

            , function (err, delivery_boy) {


                if (err) {
                    res.status(404);
                    res.send(err);
                } else {



                    res.send(delivery_boy);
                    // console.log(delivery_boy);
                    // res.send(delivery_boy[0]);
                }
            });

    });


router

    .post('/delete-selected-delivery-boy', function (req, res, next) {



        for (var i = 0; i < req.body.selected_delivery_boy.length; i++) {

            db.admin_infos.findAndModify({
                query: {

                },
                update: {
                    $pull: {
                        'delivery_boy_info': {
                            '_id': mongojs.ObjectId(req.body.selected_delivery_boy[i])
                        }
                    }

                }

            }, function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }
                console.log(data);


            });


        }
        res.send({ 'status': 'deleted' });
    });


router

    .post('/delete-all-delivery-boy', function (req, res, next) {



        db.admin_infos.findAndModify({
            query: {

            },
            update: {
                $pull: {
                    'delivery_boy_info': {

                    }
                }

            }

        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            console.log('deleted');
            res.status(200).send(data);

        });

    });




router

    .post('/fetch-delivery-boy-by-id', function (req, res, next) {

        db.delivery_boy_infos.aggregate(//{
            //     "_id": mongojs.ObjectId(req.body.delivery_boy_id)
            // }
            { $match: { _id: ObjectId(req.body.delivery_boy_id) } },

            //  { $unwind: "$delivery_boy_infos" },
            {
                $lookup: {
                    from: 'service_center_infos',
                    localField: 'service_center_id',
                    foreignField: '_id',
                    as: 'service_center'

                },

            }

            , function (err, data) {
                if (err || !data) console.log("No  data found");
                else {
                    console.log(data);

                    var final_data = data;
                    final_data[0].service_center_name = data[0].service_center[0].center_name;
                    final_data[0].service_center = '';
                    res.status(200).send(final_data);
                }

            }

        );

        //console.log(req.body.info_page_id);
        // db.delivery_boy_infos.aggregate(//{
        //     //     "_id": mongojs.ObjectId(req.body.delivery_boy_id)
        //     // }
        //     { $match: { _id: ObjectId(req.body.delivery_boy_id) } },

        //     //  { $unwind: "$delivery_boy_infos" },
        //     {
        //         $lookup: {
        //             from: 'service_center_infos',
        //             localField: 'service_center_id',
        //             foreignField: '_id',
        //             as: 'service_center'

        //         },

        //     },
        //     {
        //         $lookup: {
        //             from: 'cook_infos',
        //             localField: '_id',
        //             foreignField: 'delivery_boy_id',
        //             as: 'delivery_boy_cook'

        //         },

        //     },
        //     {
        //         $project: {
        //             boy_name: 1, boy_email: 1, boy_contact: 1, boy_status: 1, service_center_id: 1, 'service_center.center_name': 1,
        //             'delivery_boy_cook._id': 1, 'delivery_boy_cook.cook_name': 1
        //         }
        //     }
        //     , function (err, data) {
        //         if (err || !data) console.log("No  data found");
        //         else {
        //             console.log(data);
        //             //  res.send(data);

        //             var del_boy_cook_all = data[0].delivery_boy_cook;
        //             db.order_infos.find({},

        //                 { cook_id: 1 }

        //                 , function (err, del_boy_from_cook) {

        //                     var all_cook_in_order = del_boy_from_cook;

        //                     var tot_del_boy_order = 0;

        //                     for (var j = 0; j < del_boy_cook_all.length; j++) {

        //                         for (var i = 0; i < all_cook_in_order.length; i++) {

        //                             if (all_cook_in_order[i].cook_id.toString() == del_boy_cook_all[j]._id.toString()) {

        //                                 tot_del_boy_order++;
        //                             }

        //                         }

        //                     }

        //                     var final_data = data;
        //                     final_data[0].service_center_name = data[0].service_center[0].center_name;
        //                     final_data[0].service_center = '';
        //                     final_data[0].total_order =tot_del_boy_order;
        //                     res.send(final_data);

        //                 });

        //         }

        //     }

        // );

    });


router

    .post('/update-delivery-boy-by-id', function (req, res, next) {

        console.log(req.body);

        db.delivery_boy_infos.update({
            "_id": mongojs.ObjectId(req.body._id)
        },

            {
                "$set": {

                    'boy_name': req.body.boy_name,
                    'boy_email': req.body.boy_email,
                    'boy_contact': req.body.boy_contact,
                    'boy_password': req.body.boy_password,
                    'boy_status': req.body.boy_status,
                    //  'delivery_boy_info.$.service_center_city': req.body.service_center_city,
                    'service_center_id': mongojs.ObjectId(req.body.service_center_id),
                    // 'cook_assign': req.body.selected_cook,

                    'update_at': moment(new Date()).format("DD/MM/YYYY"),


                }

            }

            ,
            function (err, center) {

                res.send('success');

            });

        // db.admin_infos.update({
        //     "delivery_boy_info._id": mongojs.ObjectId(req.body._id)
        // },

        //     {
        //         "$set": {

        //             'delivery_boy_info.$.boy_name': req.body.boy_name,
        //             'delivery_boy_info.$.boy_email': req.body.boy_email,
        //             'delivery_boy_info.$.boy_contact': req.body.boy_contact,
        //             'delivery_boy_info.$.boy_password': req.body.boy_password,
        //             'delivery_boy_info.$.boy_status': req.body.boy_status,
        //             'delivery_boy_info.$.service_center_city': req.body.service_center_city,
        //             'delivery_boy_info.$.service_center_name': req.body.service_center_name,
        //             'delivery_boy_info.$.cook_assign': req.body.selected_cook,

        //             'delivery_boy_info.$.update_at': moment(new Date()).format("DD/MM/YYYY"),


        //         }

        //     }

        //     ,
        //     function (err, center) {
        //         if (err || !center) console.log("No  data found");
        //         else {

        //             res.status(200).send({ 'status': 'updated' });
        //         }

        //     }



        // );
    });


// FOOTER OPERATIONS

router

    .get('/fetch-footer-details', function (req, res, next) {

        var footer_coll = [];

        db.admin_infos.find({

        },
            { social_info: 1, info_pages: 1 }
            ,
            function (err, data) {
                if (err || !data) console.log("No data found");
                else {
                    //  console.log(data);
                    var temp = {};
                    temp = data[0].social_info;
                    temp = _.filter(temp, function (o) { return o.social_status == 'Active'; });
                    console.log('FOOTER SOCIAL DATA');
                    //   console.log(tdata);


                    var temp2 = {};
                    temp2 = data[0].info_pages;
                    //     console.log(data[0].social_info);
                    footer_coll.push(temp);
                    footer_coll.push(temp2);
                    // console.log(footer_coll);
                    res.status(200).send(footer_coll);
                }

            }

        );

    });

router

    .get('/fetch-home-banner', function (req, res, next) {

        var footer_coll = [];

        db.layout_infos.find({

            layout_name: 'home-page-banner'
        }
            ,
            function (err, data) {
                if (err || !data) console.log("No data found");
                else {

                    res.status(200).send(data[0].assined_banner_name);
                }

            }

        );

    });

router

    .get('/fetch-food-detail-banner', function (req, res, next) {

        console.log('FETCH FOOD');
        db.layout_infos.find({

            layout_name: 'food-detail-page-banner'
        }
            ,
            function (err, data) {
                if (err || !data) console.log("No data found");
                else {

                    res.status(200).send(data[0]);
                }

            }

        );

    });

router

    .get('/fetch-global-settings', function (req, res, next) {

        db.global_setting_infos.find({


        }
            ,
            function (err, data) {
                if (err || !data) console.log("No data found");
                else {

                    res.status(200).send(data[0]);
                }

            }

        );

    });
// CUISINE OPERATIONS

router

    .get('/fetch-all-cuisines', function (req, res, next) {


        db.categories_infos.find({

        },
            {
                category_name: 1, category_order: 1
            }


        ).sort({ 'category_order': 1 }, function (err, data) {
            if (err || !data) console.log("No data found");
            else {

                console.log(data);
                res.status(200).send(data);
            }

        }

            );

    });

router

    .post('/delete-selected-cuisine', function (req, res, next) {



        for (var i = 0; i < req.body.selected_cuisine.length; i++) {

            db.categories_infos.remove({

                '_id': mongojs.ObjectId(req.body.selected_cuisine[i])

            }, function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }
                console.log(data);


            });


        }
        res.send({ 'status': 'deleted' });
    });


router

    .post('/delete-all-cuisine', function (req, res, next) {




        db.categories_infos.remove({});


    });

router

    .post('/enable-cuisine-by-id', function (req, res, next) {



        for (var i = 0; i < req.body.length; i++) {

            db.categories_infos.update({
                "_id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "category_status": 'Enable'

                    }

                }

                ,
                function (err, data) {
                    if (err || !data) console.log("No  data found");
                    else {
                        console.log(data);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });

    });

router

    .post('/disable-cuisine-by-id', function (req, res, next) {

        console.log(req.body);
        for (var i = 0; i < req.body.length; i++) {

            db.categories_infos.update({
                "_id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "category_status": 'Disable'

                    }

                }

                ,
                function (err, data) {
                    if (err || !data) throw err;
                    else {
                        console.log(data);

                    }

                }



            );


        }
        res.status(200).send({
            'status': 'updated'
        });

    });

router

    .post('/enable-all-cuisine', function (req, res, next) {


        db.categories_infos.find({

        }, function (err, cuisine) {
            if (err || !cuisine) console.log("No  cuisine found");
            else {
                console.log('ANKUR')
                console.log(cuisine.length);

                for (var i = 0; i < cuisine.length; i++) {



                    db.categories_infos.update({
                        "_id": mongojs.ObjectId(cuisine[i]._id)
                    },

                        {
                            "$set": {
                                "category_status": 'Enable'

                            }

                        }

                        ,
                        function (err, data) {
                            if (err || !data) console.log("No  data found");
                            else {
                                console.log(data);

                            }

                        }



                    );

                }

                res.status(200).send("fine");
            }

        }

        );



    });

router

    .post('/disable-all-cuisine', function (req, res, next) {


        db.categories_infos.find({

        }, function (err, cuisine) {
            if (err || !cuisine) console.log("No  cuisine found");
            else {
                console.log('ANKUR')
                console.log(cuisine.length);

                for (var i = 0; i < cuisine.length; i++) {



                    db.categories_infos.update({
                        "_id": mongojs.ObjectId(cuisine[i]._id)
                    },

                        {
                            "$set": {
                                "category_status": 'Disable'

                            }

                        }

                        ,
                        function (err, data) {
                            if (err || !data) console.log("No  data found");
                            else {
                                console.log(data);

                            }

                        }



                    );

                }

                res.status(200).send("fine");
            }

        }

        );

    });


router

    .post('/fetch-cuisine-by-id', function (req, res, next) {

        //console.log(req.body.info_page_id);
        db.categories_infos.findOne({
            "_id": mongojs.ObjectId(req.body.cuisine_id)
        }
            , function (err, data) {
                if (err || !data) console.log("No  data found");
                else {
                    console.log(data);
                    res.status(200).send(data);
                }

            }

        );

    });


router

    .post('/update-cuisine-order-validate', function (req, res, next) {

        db.categories_infos.find(
            {
                $and: [

                    { "category_order": parseInt(req.body.category_order) },
                    { "category_name": { $ne: req.body.category_name } }

                ]
            }


            , function (err, data) {

                console.log('THIS IS DATA');
                console.log(data);
                if (data.length < 1) {
                    res.send({ 'status': 'valid', data: [] })
                }
                else if (data.length > 0) {
                    res.send({ 'status': 'invalid', data: data })
                }
                else { }


            });
    });

router

    .post('/update-cuisine-order-validate-add', function (req, res, next) {

        db.categories_infos.find(
            {
                $or: [

                    { "category_order": parseInt(req.body.category_order) },
                    { "category_name": req.body.category_name }

                ]
            }


            , function (err, data) {

                console.log('THIS IS DATA');
                console.log(data);
                if (data.length < 1) {
                    res.send({ 'status': 'valid', data: [] })
                }
                else if (data.length > 0) {
                    res.send({ 'status': 'invalid', data: data })
                }
                else { }


            });
    });

router

    .post('/update-cuisine-by-id', function (req, res, next) {

        db.categories_infos.update({
            "_id": mongojs.ObjectId(req.body._id)
        },

            {
                "$set": {


                    category_name: req.body.category_name,
                    // meta_tag_title: req.body.meta_tag_title,
                    // meta_tag_desc: req.body.meta_tag_desc,
                    // // cat_img: cat_img_web,
                    // // cat_banner: cat_banner_web,
                    // meta_tag_keyword: req.body.meta_tag_keyword,
                    // parent: req.body.parent,
                    // seo_url: req.body.seo_url,
                    // category_isBottom: req.body.category_isBottom,
                    // category_status: req.body.category_status,
                    category_order: parseInt(req.body.category_order),
                    status: 'false'


                }

            }

            ,
            function (err, center) {
                if (err || !center) console.log("No  center found");
                else {

                    res.status(200).send({ 'status': 'updated' });
                }

            }



        );
    });

router

    .get('/test-date', function (req, res, next) {

        console.log(new Date());
    });

// FOODS OPERATIONS

router

    .get('/fetch-all-cook-foods', function (req, res, next) {

        var food_coll = [];

        db.cook_infos.find({}, {
            'food_details': 1,
            _id: 0
        }
        ).sort({ 'food_details._id': -1 }, function (err, data) {

            if (err) {
                res.status(400);
                res.send('error');
                console.log(err);

                throw err;

            }
            //console.log(data[4].food_details.length);

            for (var i = 0; i < data.length; i++) {


                if (data[i].food_details.length > 0) {

                    for (var j = 0; j < data[i].food_details.length; j++) {
                        var food_obj = {};
                        food_obj = data[i].food_details[j];
                        food_coll.push(food_obj);
                    }
                    //  
                    //  
                }
            }

            res.send(food_coll);


        });

    });


router

    .post('/fetch-food-by-id', function (req, res, next) {

        console.log(req.body);
        db.cook_infos.findOne({

            'food_details._id': mongojs.ObjectId(req.body.food_id)

        }, {
                'food_details': 1,
                _id: 0
            }, function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    console.log(err);

                    throw err;

                }
                //console.log(data[4].food_details.length);

                var food = [];
                console.log('FOOD DETAILS');
                console.log(data);
                if (data != null) {

                    if (data.food_details.length > 0) {

                        for (var i = 0; i < data.food_details.length; i++) {

                            if (data.food_details[i]._id == req.body.food_id) {

                                food.push(data.food_details[i]);
                            }
                        }
                        console.log(data.food_details.length)
                        res.send(food);

                    }
                    else {

                        res.send('error');
                    }
                }
                else {
                    res.send('error');

                }




            }
        );



    });


router

    .post('/update-id', function (req, res, next) {

        console.log('ANKUR');
    });



router

    .post('/update-food-by-id-admin', function (req, res, next) {

        console.log('hello');

        if (req.body.files != '') {

            dns.lookup(os.hostname(), function (err, add, fam) {
                var img_name;
                var img_arr = [];
                var img_obj = {};
                //       for (var i = 0; i < img_len; i++) {

                img_obj = {};
                img_name = randomstring.generate(13);
                img_obj.food_img = add + ':3000/uploads/cook_uploads/raw/' + img_name + '.jpg';
                img_obj.food_img_web = '/uploads/cook_uploads/raw/' + img_name + '.jpg';
                img_obj.img_name = img_name + '.jpg';
                // img_arr.push(img_obj);

                fs.writeFile("client/uploads/cook_uploads/raw/" + img_name + ".jpg", new Buffer(req.body.files, "base64"), function (err) {

                    if (err) {

                        throw err;
                        console.log(err);
                        res.send(err)
                    }
                    else {
                        console.log('FOod image uploaded');

                    }

                });

                Jimp.read(Buffer.from(req.body.files, 'base64'), function (err, lenna) {
                    if (err) throw err;
                    lenna.resize(143, 128, Jimp.RESIZE_HERMITE)            // resize
                        .quality(100)                 // set JPEG quality
                        // set greyscale
                        .write("client/uploads/cook_uploads/200_by_250/" + img_name + ".jpg");
                });
                Jimp.read(Buffer.from(req.body.files, 'base64'), function (err, lenna) {
                    if (err) throw err;
                    lenna.resize(40, 40, Jimp.RESIZE_HERMITE)            // resize
                        .quality(100)                 // set JPEG quality
                        // set greyscale
                        .write("client/uploads/cook_uploads/thumb/" + img_name + ".jpg");
                });

                img_arr.push(img_obj);


                var cuss_len = req.body.update_food_details.cuisine_list.length;

                var cuss_data = [];

                //  var available_hours = req.body.update_food_details.available_hours;

                //  console.log(available_hours);

                for (var i = 0; i < cuss_len; i++) {
                    cuss_data.push(req.body.update_food_details.cuisine_list[i]);
                }


                db.cook_infos.findAndModify({
                    query: { 'food_details._id': mongojs.ObjectId(req.body.update_food_details._id) },
                    update: {
                        $set: {
                            'food_details.$.food_selection': req.body.update_food_details.food_selection,
                            'food_details.$.food_name': req.body.update_food_details.food_name,
                            'food_details.$.food_desc': req.body.update_food_details.food_desc,
                            'food_details.$.food_price_per_plate': req.body.update_food_details.food_price_per_plate,
                            'food_details.$.food_total_qty': req.body.update_food_details.food_total_qty,
                            'food_details.$.food_min_qty': req.body.update_food_details.food_min_qty,
                            'food_details.$.food_max_qty': req.body.update_food_details.food_max_qty,
                            'food_details.$.meal_type': req.body.update_food_details.meal_type,
                            'food_details.$.occassion_list': req.body.update_food_details.occassion_list,
                            'food_details.$.cuisine_list': req.body.update_food_details.cuisine_list,
                            //    'food_details.$.available_hours': available_hours,
                            'food_details.$.food_img': img_arr,
                            'food_details.$.selected_date_from': req.body.update_food_details.selected_date_from,
                            'food_details.$.selected_date_to': req.body.update_food_details.selected_date_to,
                            'food_details.$.food_isApproved': req.body.update_food_details.food_isApproved,
                            'food_details.$.food_status': req.body.update_food_details.food_status,

                        }

                    }
                    ,
                    new: true
                }, function (err, data, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send('error');
                        throw err;

                    }

                    else {
                        console.log(data);
                        console.log('Name UPdated');


                    }

                    res.status(200).send('success');
                });
            });

        }
        else if (req.body.files == '') {

            var cuss_len = req.body.update_food_details.cuisine_list.length;

            var cuss_data = [];

            //  var available_hours = req.body.update_food_details.available_hours;

            //  console.log(available_hours);

            for (var i = 0; i < cuss_len; i++) {
                cuss_data.push(req.body.update_food_details.cuisine_list[i]);
            }


            db.cook_infos.findAndModify({
                query: { 'food_details._id': mongojs.ObjectId(req.body.update_food_details._id) },
                update: {
                    $set: {
                        'food_details.$.food_selection': req.body.update_food_details.food_selection,
                        'food_details.$.food_name': req.body.update_food_details.food_name,
                        'food_details.$.food_desc': req.body.update_food_details.food_desc,
                        'food_details.$.food_price_per_plate': req.body.update_food_details.food_price_per_plate,
                        'food_details.$.food_total_qty': req.body.update_food_details.food_total_qty,
                        'food_details.$.food_min_qty': req.body.update_food_details.food_min_qty,
                        'food_details.$.food_max_qty': req.body.update_food_details.food_max_qty,
                        'food_details.$.meal_type': req.body.update_food_details.meal_type,
                        'food_details.$.occassion_list': req.body.update_food_details.occassion_list,
                        'food_details.$.cuisine_list': req.body.update_food_details.cuisine_list,
                        //    'food_details.$.available_hours': available_hours,
                        'food_details.$.selected_date_from': req.body.update_food_details.selected_date_from,
                        'food_details.$.selected_date_to': req.body.update_food_details.selected_date_to,
                        'food_details.$.food_isApproved': req.body.update_food_details.food_isApproved,
                        'food_details.$.food_status': req.body.update_food_details.food_status,

                    }

                }
                ,
                new: true
            }, function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }

                else {
                    console.log(data);
                    console.log('Name UPdated');


                }

                res.status(200).send('success');
            });

        }


    });

router

    .post('/delete-selected-food', function (req, res, next) {

        console.log(req.body);


        for (var i = 0; i < req.body.selected_food.length; i++) {
            var cook_id;
            console.log('I AM ANKUR');
            console.log(i);
            db.cook_infos.find({
                'food_details._id': mongojs.ObjectId(req.body.selected_food[i])
            }

                ,
                function (err, cook) {
                    if (err) console.log("No  cook found");
                    else {
                        cook_id = cook[0]._id;
                        var food_len = cook[0].food_details.length;

                        for (var j = 0; j < food_len; j++) {

                            db.cook_infos.update(
                                { _id: mongojs.ObjectId(cook_id) },

                                { "$pull": { "food_details": { "_id": mongojs.ObjectId(req.body.selected_food[j]) } } }

                                , function (err, data, lastErrorObject) {
                                    if (err) {
                                        res.status(400);
                                        res.send('error');
                                        throw err;

                                    }



                                });

                        }

                    }
                });


            // var selec_id=req.body.selected_food[i];

            // console.log(i);

        }



        res.send({ 'status': 'deleted' });
        //  db.cook_infos.update(
        //                     {_id:mongojs.ObjectId('58e2351081500b12bcaab112')},

        //                 {"$pull":{"food_details":{"_id":mongojs.ObjectId('58e3c7792da33d0970058e2b')}}}

        //             , function (err, data, lastErrorObject) {
        //                 if (err) {
        //                     res.status(400);
        //                     res.send('error');
        //                     throw err;

        //                 }

        //                      res.send({ 'status': 'deleted' });

        //             });



    });


router

    .post('/enable-food-id', function (req, res, next) {

        // for (var i = 0; i < req.body.length; i++) {
        //      var cook_id;


        //        db.cook_infos.find({
        //            'food_details._id':mongojs.ObjectId(req.body[i])
        // }

        //     ,
        //     function (err, cook) {
        //         if (err ) console.log("No  cook found");
        //         else {
        //              cook_id=cook[0]._id;
        //             //  var food_len=cook[0].food_details.length;

        //             //  for(var j=0;j<food_len;j++){

        //                     db.cook_infos.update(
        //                             {_id:mongojs.ObjectId(cook_id)},

        //                         {"$set":{"food_details.food_status":'Enable'}}

        //                     , function (err, data, lastErrorObject) {
        //                         if (err) {
        //                             res.status(400);
        //                             res.send('error');
        //                             throw err;

        //                         }



        //                     });

        //             // }

        //     }
        //        });

        //  }

        // console.log(req.body);

        for (var i = 0; i < req.body.length; i++) {

            db.cook_infos.update({
                "food_details._id": mongojs.ObjectId(req.body[i])
            },

                {
                    "$set": {
                        "food_details.$.food_status": 'Enable'

                    }

                }

                ,
                function (err, layout) {
                    if (err || !layout) console.log("No  layout found");
                    else {
                        console.log(layout);

                    }

                }



            );


        }

        res.send('updated');
    });


//  ATTRIBUE FIELDS OPERATIONS

router
    .get('/fetch-attribute-list-detail', function (req, res, next) {


        db.attributes_infos.find(
            {},

            function (err, data) {


                if (err) {
                    res.status(404);
                    res.send('data not found');
                } else {

                    console.log(data);

                    for (var i = 0; i < data.length; i++) {

                        for (var j = 0; j < data[i].attr_fields.length; j++) {

                            data[i].attr_fields[j].parent_group = data[i].group_name;

                        }
                    }
                    res.status(200).send(data);
                }
            });

    });


router

    .post('/delete-selected-attr-field', function (req, res, next) {

        console.log(req.body.selected_attr_field[0]);

        for (var i = 0; i < req.body.selected_attr_field.length; i++) {

            db.attributes_infos.update({

                'attr_fields._id': mongojs.ObjectId(req.body.selected_attr_field[i])
            },
                {
                    '$pull': {
                        'attr_fields': {



                        }
                    }

                }

                , function (err, data, lastErrorObject) {
                    if (err) {

                        throw err;

                    }
                    console.log('deleted');

                    console.log(data);
                });


        }
        res.send({ 'status': 'deleted' });
    });


router

    .post('/fetch-attr-field-by-id', function (req, res, next) {

        console.log(req.body);
        // db.test.aggregate([
        //     // Get just the docs that contain a shapes element where color is 'red'
        //     {$match: { 'groupname.group_fields._id':mongojs.ObjectId(req.body.attr_id)}},
        //     {$project: {
        //         'groupname.group_fields': {$filter: {
        //             input: '$groupname.$.group_fields',
        //             as: 'shape',
        //             cond: {$eq: ['$$shape._id', mongojs.ObjectId(req.body.attr_id)]}
        //         }},
        //         _id: 0
        //     }}
        // ],function(err,data){

        // res.send(data);
        //     console.log(data);
        // });


        db.attributes_infos.find({

            'attr_fields._id': mongojs.ObjectId(req.body.attr_id)

        }

            , function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    console.log(err);

                    throw err;

                }

                console.log(data[0]);
                var attr_coll = [];
                var attr_obj = {};
                for (var i = 0; i < data[0].attr_fields.length; i++) {
                    attr_obj = {};
                    if (data[0].attr_fields[i]._id == req.body.attr_id) {

                        attr_obj._id = data[0].attr_fields[i]._id;
                        attr_obj.group_attr = data[0].attr_fields[i].group_attr;
                        attr_obj.status = data[0].attr_fields[i].status;
                        attr_obj.sort_order = data[0].attr_fields[i].sort_order;
                        attr_obj.parent_group = data[0].group_name;

                        attr_coll.push(attr_obj);
                    }
                }
                res.send(attr_coll);


            }
        );



    });

router

    .post('/update-attr-field-by-id', function (req, res, next) {

        console.log(req.body);

        db.attributes_infos.findAndModify(



            {
                query: { 'attr_fields._id': mongojs.ObjectId(req.body._id) },
                update: {
                    $set: {
                        'attr_fields.$.group_attr': req.body.group_attr,
                        'attr_fields.$.status': req.body.status,
                        'attr_fields.$.sort_order': req.body.sort_order,

                    }

                }
                ,
                new: true
            }, function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }

                else {
                    console.log(data);
                    console.log('Name UPdated');

                    res.status(200).send('success');
                }


            });

    });

// TILL ATTRIBUE FIELDS OPERATIONS



// BANNER DISPLAY OPERATIONS


router

    .get('/get-listing-promotional-banner', function (req, res, next) {
        var list_bann_2 = [];
        db.layout_infos.find({
            'layout_type': 'listing_banner_2',
        },
            function (err, banner) {
                if (err || !banner) console.log(err);
                else {

                    list_bann_2.push(banner);

                    db.layout_infos.find({
                        'layout_name': 'listing-background-banner',
                    },
                        function (err, banner2) {
                            if (err || !banner) console.log(err);
                            else {

                                list_bann_2.push(banner2);
                                res.status(200).send(list_bann_2);
                            }


                        }
                    );
                    // console.log(admin);


                    // for (var i = 0; i < admin[0].layout_pages.length; i++) {

                    //     if (admin[0].layout_pages[i].layout_type == 'listing_banner_2') {
                    //         var list = {};
                    //         list.list_promo_bann = admin[0].layout_pages[i];
                    //         list_bann_2.push(list);

                    //     }
                    //     if (admin[0].layout_pages[i].layout_type == 'listing_background_banner') {
                    //         var list = {};
                    //         list.list_background_img = admin[0].layout_pages[i];
                    //         list_bann_2.push(list);

                    //     }

                    // }


                }
            });
        console.log('LISTING BANNER');

    });



// TILL BANNER DISPLAY OPERATIONS 



// router

//     .post('/disable-layout-by-id', function (req, res, next) {

//         console.log(req.body);
//         for (var i = 0; i < req.body.length; i++) {

//             db.admin_infos.update({
//                 "layout_pages._id": mongojs.ObjectId(req.body[i])
//             },

//                 {
//                     "$set": {
//                         "layout_pages.$.layout_status": 'Disable'

//                     }

//                 }

//                 ,
//                 function (err, coupon) {
//                     if (err || !coupon) throw err;
//                     else {
//                         console.log(coupon);

//                     }

//                 }



//             );


//         }
//         res.status(200).send({
//             'status': 'updated'
//         });

//     });



// ORDERS OPERATIONS


router
    .get('/fetch-user-orders-all', function (req, res, next) {

        console.log('fetching');
        var orders = [];
        db.order_infos.find({

        }, {
                order_id: 1, date: 1, 'order_status': 1, 'items.grand_total': 1, 'items.food_total_price': 1, 'items.username': 1, 'items.pay_mode': 1, 'pay_status': 1
            }

        ).sort({ time: -1 }, function (err, data) {

            res.send(data);

        });

    });

router
    .get('/fetch-refund-user-orders-all', function (req, res, next) {

        console.log('fetching');
        var orders = [];
        db.order_infos.find({

            $and: [
                {
                    order_status: { $in: ['cancelled', 'pending'] }
                },
                {
                    pay_status: 'true'
                },
                {

                    'items.pay_mode': { $in: ['online', 'wallet+online'] }
                },

            ]

        },
            {
                order_id: 1, user_id: 1, date: 1, 'order_status': 1, 'items.grand_total': 1, 'items.delivery_charge': 1, 'items.food_qty': 1, 'items.food_price': 1, 'items.food_total_price': 1, 'items.username': 1, 'items.pay_mode': 1, 'pay_status': 1
            }

        ).sort({ time: -1 }, function (err, data) {

            res.send(data);

        });

    });


router
    .post('/confirm-refund', function (req, res, next) {


        var incoming_data = req.body;


        db.order_infos.findAndModify({
            query: { order_id: incoming_data.orderid },
            update: { $set: { pay_status: 'false' } }

        }, function (err, doc) {

            if (err) {
                res.send(err);
            }

            res.send({ 'status': 'success' });
        })





        db.user_wallet_infos.find({
            user_id: mongojs.ObjectId(incoming_data.user_id)
        }, function (err, data, lastErrorObject) {
            if (err) {

                console.log(err);
            }

            console.log(data);

            if (data.length < 1) {

                db.user_wallet_infos.save({

                    user_id: mongojs.ObjectId(incoming_data.user_id),
                    wallet_amount: parseFloat(incoming_data.amount),

                }, function (err, user) {

                    console.log('Ammoutn Added');
                    var wall_history = {
                        'transac_id': mongojs.ObjectId(),
                        'date': moment(new Date()).format("DD/MM/YYYY"),
                        'added_amt': incoming_data.amount,
                        'debit_amt': '',
                        'time': moment(new Date()).format("HH:mm"),
                        'transac_status': 'success',
                        'previous_amt': '0',
                        'amt_type': 'credit',
                        //    // 'remaining_amt': req.body.address_city,
                        'comment': 'Refund issued for Order Id ' + incoming_data.orderid,

                    }

                    db.user_wallet_infos.findAndModify({
                        query: {
                            user_id: mongojs.ObjectId(incoming_data.user_id)
                        },
                        update: {

                            $push: {
                                'wallet_history': wall_history
                            }

                        },
                        new: true
                    }, function (err, user, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send(err);

                            console.log(err);

                        }
                        // res.status(200);
                        //  res.send({ "status": "Amount Added To Wallet" });
                    });



                });

            }
            if (data.length > 0) {

                var updated_amt = parseInt(incoming_data.amount) + parseInt(data[0].wallet_amount);
                // var remaining_amt=
                var wall_history = {
                    'transac_id': mongojs.ObjectId(),
                    'date': moment(new Date()).format("DD/MM/YYYY"),
                    'added_amt': parseFloat(incoming_data.amount),
                    'time': moment(new Date()).format("HH:mm"),
                    'transac_status': 'success',
                    'previous_amt': data[0].wallet_amount,
                    'amt_type': 'credit',
                    //    // 'remaining_amt': req.body.address_city,
                    'comment': 'Refund issued for Order Id ' + incoming_data.orderid,

                }

                db.user_wallet_infos.findAndModify({
                    query: {
                        user_id: mongojs.ObjectId(incoming_data.user_id)
                    },
                    update: {

                        $push: {
                            'wallet_history': wall_history
                        }

                    },
                    new: true
                }, function (err, user, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send(err);

                        console.log(err);

                    }

                    db.user_wallet_infos.findAndModify({
                        query: {
                            user_id: mongojs.ObjectId(incoming_data.user_id),
                        },
                        update: {
                            $set: {
                                wallet_amount: updated_amt

                            }
                        },
                        new: true
                    }, function (err, user, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send(err);
                            throw err;
                            console.log(err);

                        }

                        //  res.status(200);
                        // res.send({ "status": "Amount Added To Wallet" });
                        console.log('THIS IS UPDATED AMT');
                        console.log(updated_amt);
                    });


                    console.log('Ammoutn Added');
                });

            }

            // console.log('wallet amt added');
        });

    });


router
    .post('/fetch-complete-order-by-id', function (req, res, next) {

        console.log('ORDER DATA CHECK');
        console.log(req.body);
        db.order_infos.aggregate(

            { $match: { order_id: req.body.order_id } },

            // { $unwind: "$cook_arr" },
            {
                $lookup: {
                    from: 'user_infos',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user_data'

                },

            }
            ,
            {
                $lookup: {
                    from: 'cook_infos',
                    localField: 'cook_id',
                    foreignField: '_id',
                    as: 'cook_data'

                },

            },
            {
                $lookup: {
                    from: 'service_center_infos',
                    localField: 'cook_id',
                    foreignField: 'cook_arr._id',
                    as: 'service_center_data'

                },

            },
            // ,

            { $project: { 'order_id': 1, user_id: 1, cook_id: 1, date: 1, time: 1, order_status: 1, items: 1, 'user_data.email': 1, 'user_data.email': 1, 'user_data.phone': 1, 'cook_data.cook_name': 1, 'service_center_data.center_name': 1, 'service_center_data._id': 1 } }

            //  { 'order_id': req.body.order_id } // DYNAMIC 

            , function (err, order) {

                var order_info = order;
                var order_data = [];


                if (order_info[0].items[0].delivery_by == 'Self' || order_info[0].items[0].delivery_by == 'Self ') {

                    order_info[0].delivery_by = "Cook";
                    order_info[0].cook_name = order_info[0].cook_data[0].cook_name;

                    console.log('DELIVERY BY COOK');
                    db.track_order_infos.find(

                        { 'main_order_id': req.body.order_id } // DYNAMIC 

                        , function (err, order_history) {

                            order_info[0].order_history = order_history[0].order_history;

                            console.log('ORRR DER ID');
                            console.log(order_info);
                            res.send(order_info);

                        });

                }
                if (order_info[0].items[0].delivery_by == 'EatoEato' || order_info[0].items[0].delivery_by == 'EatoEato ') {

                    console.log('DELIVERY BY COOK');
                    order_info[0].delivery_by = "Admin";
                    order_info[0].center_name = order_info[0].service_center_data[0].center_name;
                    order_info[0].center_id = order_info[0].service_center_data[0]._id;

                    // FETCHING DELIVERY BOY INFO IF ORDER IS DELIVERED BY ADMIN | EatoEato

                    db.cook_infos.aggregate(

                        { $match: { _id: mongojs.ObjectId(order_info[0].cook_id) } },

                        // { $unwind: "$cook_arr" },
                        {
                            $lookup: {
                                from: 'delivery_boy_infos',
                                localField: 'delivery_boy_id',
                                foreignField: '_id',
                                as: 'delivery_boy_data'

                            },

                        },

                        { $project: { 'delivery_boy_data.boy_name': 1, 'delivery_boy_data.boy_email': 1, 'delivery_boy_data.boy_contact': 1, 'delivery_boy_data._id': 1 } }


                        , function (err, delivery_boy) {

                            console.log('THISI SI DEL BOY ID');

                            console.log(delivery_boy[0].delivery_boy_data);
                            order_info[0].delivery_boy_data = delivery_boy[0].delivery_boy_data;

                            db.track_order_infos.find(

                                { 'main_order_id': req.body.order_id } // DYNAMIC 

                                , function (err, order_history) {


                                    order_info[0].order_history = order_history[0].order_history;

                                    console.log('ORRR DER ID');
                                    console.log(order_info);
                                    res.send(order_info);
                                });

                        });

                }
                //   console.log(order);
                //   res.send(order);






            });


        //CHANGED

        // console.log('fetching');
        // console.log(req.body);
        // var email;
        // var phone;

        // var orders = [];
        // var cook_infos = [];

        // db.cook_infos.find(
        //     {

        //     },
        //     { cook_name: 1 }
        //     , function (err, cook) {

        //         if (err) {

        //             console.log(err);

        //         } else {

        //             cook_infos.push(cook);
        //             //  console.log(cook[0].cook_name);

        //         }


        //     });
        // // var order_data={};
        // db.user_infos.find({

        // },
        //     { orders: 1, username: 1, email: 1, phone: 1 }
        //     ,
        //     function (err, data) {
        //         if (err || !data) console.log("No  data found");
        //         else {
        //             // console.log(order);

        //             for (var i = 0; i < data.length; i++) {



        //                 if (data[i].orders.length > 0) {

        //                     for (var j = 0; j < data[i].orders.length; j++) {


        //                         data[i].orders[j].email = data[i].email;
        //                         data[i].orders[j].phone = data[i].phone;


        //                         orders.push(data[i].orders[j]);

        //                     }

        //                 }

        //             }

        //             console.log(orders.length);
        //             var final_order_coll = [];
        //             var final_order_detail = {};

        //             for (var j = 0; j < orders.length; j++) {


        //                 if (orders[j].order_id == req.body.order_id) {


        //                     final_order_coll.push(orders[j]);
        //                     console.log('MATCH');
        //                 }

        //             }


        //             var service_center_coll = [];

        //             db.admin_infos.find(
        //                 {},
        //                 { service_center_info: 1, _id: 0, }
        //                 ,
        //                 function (err, service_center) {


        //                     if (err) {
        //                         res.status(404);
        //                         res.send('service center not found');
        //                     } else {


        //                         service_center_coll = service_center[0].service_center_info;
        //                         var cook_name;
        //                         for (var i = 0; i < final_order_coll[0].items.length; i++) {


        //                             for (var j = 0; j < service_center_coll.length; j++) {

        //                                 for (var k = 0; k < service_center_coll[j].cook_arr.length; k++) {

        //                                     if (final_order_coll[0].items[i].cook_id == service_center_coll[j].cook_arr[k].cook_id) {


        //                                         for (var s = 0; s < cook_infos[0].length; s++) {

        //                                             if (cook_infos[0][s]._id == final_order_coll[0].items[i].cook_id) {

        //                                                 cook_name = cook_infos[0][s].cook_name;
        //                                             }

        //                                         }


        //                                         final_order_coll[0].items[i].email = service_center_coll[j].center_name;
        //                                         final_order_coll[0].items[i].service_center_name = service_center_coll[j].center_name;
        //                                         final_order_coll[0].items[i].service_id = service_center_coll[j]._id;
        //                                         final_order_coll[0].items[i].cook_name = cook_name;


        //                                     }

        //                                 }

        //                             }

        //                         }

        //                         res.status(200).send(final_order_coll);
        //                     }
        //                 });




        //         }

        //     }

        // );

    });


router
    .post('/update-order-status', function (req, res, next) {

        console.log('UPDATE ORDER STATUS');
        console.log(req.body);
        db.track_order_infos.update(

            {
                // 'sub_order_status.main_order_id': mongojs.ObjectId(req.body.order_id),
                'main_order_id': req.body.order_id,
                //    'sub_order_id': req.body.sub_order_id

            },
            {
                $push: {
                    'order_history': {

                        "order_status": req.body.order_status,
                        "order_comment": req.body.order_comment,
                        "status_date": moment(new Date()).format("DD/MM/YYYY"),
                        "status_time": moment().toDate().getTime(),




                    }
                }

            }
            , function (err, user, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send(err);
                    throw err;
                    console.log(err);

                }
                //  res.send('updated');
                db.order_infos.update(


                    {
                        // 'sub_order_status.main_order_id': mongojs.ObjectId(req.body.order_id),
                        'order_id': req.body.order_id

                    },
                    {
                        $set: {

                            'order_status': req.body.order_status

                        }

                    }
                    , function (err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send(err);
                            throw err;
                            console.log(err);

                        }
                        res.status(200);
                        res.send(data);
                        console.log('RETRRRR DATA');
                        console.log(data);

                        var orderstatus = req.body.order_status;
                        var userid = req.body.userid;
                        var smstemplate;

                        if (orderstatus == 'confirmed') {

                            // // SENDING SMS TO USER
                            // db.sms_template_infos.find({ 'name': 'Order Confirmed/ User' }, function (err, smstemplate_data) {


                            //     smstemplate = smstemplate_data[0].body.replace("^^FIRST_NAME^^", req.body.username);

                            //     sendsms(parseInt(req.body.usercontact), smstemplate);

                            // });

                            // // SENDING SMS TO COOK
                            // db.cook_infos.find({ '_id': mongojs.ObjectId(req.body.cookid) }, { cook_name: 1, cook_contact: 1 }, function (err, cookdata) {


                            //     db.sms_template_infos.find({ 'name': 'Order Confirmed/ Cook' }, function (err, smstemplate_data) {



                            //         smstemplate = smstemplate_data[0].body.replace("^^FIRST_NAME^^", cookdata[0].cook_name);

                            //         sendsms(parseInt(cookdata[0].cook_contact), smstemplate);

                            //     });


                            // });


                            // SAVING NOTIFICATION DATA

                            // SAVING NOTIFICATION DATA

                            db.notification_infos.save(
                                {

                                    notificationid: config.notificationObj.notification_id_user_order_confirmed,
                                    user_cook_id: mongojs.ObjectId(req.body.userid),
                                    title: config.notificationTitleContent.notification_title_for_user_order_confirmed,
                                   message:"Your Order #"+req.body.order_id+" has been confirmed.",
                                    seenstatus: '0',
                                    date: moment(new Date()).format("DD/MM/YYYY"),
                                    datetime: Math.round(moment().toDate().getTime() / 1000),

                                }, function (err, user) {

                                    if (err) {
                                        res.status(400);
                                        res.send('error');
                                        throw err;

                                    }

                                    db.user_infos.find({ _id: mongojs.ObjectId(req.body.userid) }, function (err, userdata) {

                                        console.log('USER DATA');

                                        sendMessageToUser(userdata[0].token, config.notificationMessageContent.notification_message_for_user_order_confirmed, config.notificationTitleContent.notification_title_for_user_order_confirmed, config.notificationObj.notification_id_user_order_confirmed, 'data2');
                                        console.log(userdata);

                                    });

                                    console.log('NOTIFICATION SAVED ADMIN');
                                    // res.status(200).send(data);
                                });



                        }
                        else if (orderstatus == 'ready_for_del') {



                            db.order_infos.find({ order_id: req.body.order_id }, { delivery_id: 1, user_id: 1, delivery_id: 1 }, function (err, dvcode) {

                                var del_code = dvcode[0].delivery_id;
                                var userid = dvcode[0].user_id;
                                db.user_infos.find({ _id: mongojs.ObjectId(req.body.userid) }, function (err, userdata) {

                                    var userphone = userdata[0].phone;
                                    console.log('THIS IS USER PHONE');
                                    console.log(userphone);
                                    console.log(del_code);
                                    db.sms_template_infos.find({ 'name': 'Order Ready To Delivery/ User' }, function (err, smstemplate_data) {


                                        smstemplate = smstemplate_data[0].body.replace("^^FIRST_NAME^^", req.body.username);
                                        smstemplate = smstemplate + del_code;



                                        request("http://smsgate.idigitie.com/http-api.php?username=eatoeato&password=idid@1234&senderid=EATOET&route=1&number=" + parseInt(userphone) + "&message=" + smstemplate, function (error, response, body) {
                                            if (!error && response.statusCode == 200) {
                                                console.log('SMS SEND admin') // Print the google web page.
                                            }
                                        });
                                        //sendsms(parseInt(req.body.usercontact), smstemplate);

                                    });

                                });
                            });
                            // SENDING SMS TO USER
                            // db.sms_template_infos.find({ 'name': 'Order Ready To Delivery/ User' }, function (err, smstemplate_data) {


                            //     smstemplate = smstemplate_data[0].body.replace("^^FIRST_NAME^^", req.body.username);

                            //     sendsms(parseInt(req.body.usercontact), smstemplate);

                            // });

                            // SENDING SMS TO COOK
                            db.cook_infos.find({ '_id': mongojs.ObjectId(req.body.cookid) }, { cook_name: 1, cook_contact: 1 }, function (err, cookdata) {


                                db.sms_template_infos.find({ 'name': 'Order Ready To Delivery/ Cook' }, function (err, smstemplate_data) {



                                    smstemplate = smstemplate_data[0].body.replace("^^FIRST_NAME^^", cookdata[0].cook_name);

                                    sendsms(parseInt(cookdata[0].cook_contact), smstemplate);

                                });


                            });


                        }
                        else if (orderstatus == 'cancelled') {


                            // SENDING SMS TO USER
                            db.sms_template_infos.find({ 'name': 'Order Cancelled/ User' }, function (err, smstemplate_data) {


                                smstemplate = smstemplate_data[0].body.replace("^^FIRST_NAME^^", req.body.username);

                                sendsms(parseInt(req.body.usercontact), smstemplate);

                            });

                            // SENDING SMS TO COOK
                            db.cook_infos.find({ '_id': mongojs.ObjectId(req.body.cookid) }, { cook_name: 1, cook_contact: 1 }, function (err, cookdata) {


                                db.sms_template_infos.find({ 'name': 'Order Cancelled/ Cook' }, function (err, smstemplate_data) {



                                    smstemplate = smstemplate_data[0].body.replace("^^FIRST_NAME^^", cookdata[0].cook_name);

                                    sendsms(parseInt(cookdata[0].cook_contact), smstemplate);

                                });


                            });

                        }
                        else if (orderstatus == 'delivered') {

                            // SENDING SMS TO USER
                            db.sms_template_infos.find({ 'name': 'Order Delivered/ User' }, function (err, smstemplate_data) {


                                smstemplate = smstemplate_data[0].body.replace("^^FIRST_NAME^^", req.body.username);

                                sendsms(parseInt(req.body.usercontact), smstemplate);

                            });


                            // SENDING SMS TO COOK
                            db.cook_infos.find({ '_id': mongojs.ObjectId(req.body.cookid) }, { cook_name: 1, cook_contact: 1 }, function (err, cookdata) {


                                db.sms_template_infos.find({ 'name': 'Order Delivered/ Cook' }, function (err, smstemplate_data) {



                                    smstemplate = smstemplate_data[0].body.replace("^^FIRST_NAME^^", cookdata[0].cook_name);

                                    sendsms(parseInt(cookdata[0].cook_contact), smstemplate);

                                });


                            });
                        }

                        console.log('user Verified');

                    });

            });
    });

router
    .post('/track-order-stat-by-id', function (req, res, next) {

        db.track_order_infos.find({
            'main_order_id': req.body.order_id
        },
            function (err, data) {
                if (err || !data) console.log("No  data found");
                else {

                    var track_order_coll = [];

                    // for (var i = 0; i < data[0].sub_order_status.length; i++) {

                    //     if (data[0].sub_order_status[i].main_order_id == req.body.order_id) {

                    //         track_order_coll.push(data[0].sub_order_status[i]);
                    //     }
                    // }
                    console.log(data);
                    res.send(data);

                }

            }

        );

    });


router
    .post('/cancel-order-status-admin', function (req, res, next) {

        db.user_infos.update(


            {
                // 'sub_order_status.main_order_id': mongojs.ObjectId(req.body.order_id),
                'sub_order_status.sub_order_id': parseInt(req.body.sub_order_id)

            },
            {
                $set: {

                    'sub_order_status.$.sub_order_status': 'cancelled'


                }

            }
            , function (err, user, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send(err);
                    throw err;
                    console.log(err);

                }

                res.send('cancelled');

            });


    });

router
    .post('/fetch-cook-orders-by-id', function (req, res, next) {

        console.log('fetching 2');
        var orders_data = [];

        db.user_infos.find({

        },
            { orders: 1 }
            ,
            function (err, data) {
                if (err || !data) console.log("No  data found");
                else {
                    // console.log(order);
                    var order_coll = [];
                    for (var i = 0; i < data.length; i++) {

                        if (data[i].orders.length > 0) {

                            orders_data.push(data[i]);
                        }

                    }

                    //   console.log(order[0].orders.length)
                    var cook_id;
                    var order_coll = [];
                    var order_obj = {};
                    // var count = orders_data.length;
                    // var duplicate_check = true;

                    // var temp_item_coll = [];
                    // var temp_item_obj = {};

                    for (var j = 0; j < orders_data.length; j++) {


                        for (var k = 0; k < orders_data[j].orders.length; k++) {

                            for (var l = 0; l < orders_data[j].orders[k].items.length; l++) {
                                // DB CALL 1

                                if (orders_data[j].orders[k].items[l].cook_id == '58df4eade498a312ac0aadfc') {


                                    order_obj = {};
                                    order_obj.order_id = orders_data[j].orders[k].order_id;
                                    order_obj.date = orders_data[j].orders[k].date;
                                    order_obj.time = orders_data[j].orders[k].time;
                                    // order_obj.order_status = orders_data[j].orders[k].order_status;

                                    order_obj.order_data = orders_data[j].orders[k].items[l];
                                    // order_coll.push(temp_item_obj);

                                    //   order_obj.order_data = temp_item_coll;

                                    order_coll.push(order_obj);


                                    // if (order_coll.length > 0) {

                                    //     for (var t = 0; t < order_coll.length; t++) {

                                    //         if (order_coll[t].order_id == orders_data[j].orders[k].order_id) {
                                    //             duplicate_check = true;
                                    //         }

                                    //     }

                                    // }

                                    // if (duplicate_check == false) {
                                    //     order_obj = {};
                                    //     order_obj.order_id = orders_data[j].orders[k].order_id;
                                    //     order_obj.date = orders_data[j].orders[k].date;
                                    //     order_obj.time = orders_data[j].orders[k].time;
                                    //     order_obj.order_status = orders_data[j].orders[k].order_status;

                                    //     temp_item_obj=orders_data[j].orders[k].items[l];
                                    //     temp_item_coll.push(temp_item_obj);

                                    //     order_obj.order_data = temp_item_coll;

                                    //     order_coll.push(order_obj);
                                    // }


                                }

                            }



                        }



                    }
                    res.status(200).send(order_coll);

                }

            }

        );

    });



router
    .post('/fetch-cook-orders-by-id-cook-center', function (req, res, next) {

        console.log(req.body);
        db.order_infos.find(

            { 'items.cook_id': req.body.cook_id } // DYNAMIC 

            , function (err, order_info) {

                db.cook_infos.find(

                    { '_id': mongojs.ObjectId(req.body.cook_id) }, // DYNAMIC 

                    { cook_delivery_by: 1, _id: 0 }

                    , function (err, cook_delivery_by) {

                        var cook_order = [];
                        var cook_obj = {};
                        var tot = 0;
                        for (var i = 0; i < order_info.length; i++) {

                            tot = 0;
                            for (var j = 0; j < order_info[i].items.length; j++) {

                                if (order_info[i].items[j].cook_id == req.body.cook_id) // DYNAMIC 
                                {
                                    tot = tot + parseInt(order_info[i].items[j].food_total_price);
                                    cook_obj = {};
                                    cook_obj.order_id = order_info[i].order_id;
                                    cook_obj.order_date = order_info[i].date;
                                    cook_obj.username = order_info[i].items[j].username;
                                    cook_obj.pay_mode = order_info[i].items[j].pay_mode;
                                    cook_obj.order_status = order_info[i].order_status;
                                    cook_obj.delivery_by = cook_delivery_by[0].cook_delivery_by;
                                    cook_obj.order_total = tot;


                                    cook_order[i] = cook_obj;
                                }
                            }

                            //  cook_obj[i].order_total=tot;
                        }

                        res.send(cook_order);

                    });


            });



    });

router
    .post('/fetch-delivery-boy-orders-by-id', function (req, res, next) {
        console.log(req.body);

        db.delivery_boy_infos.aggregate(

            { $match: { _id: ObjectId(req.body.delivery_boy_id) } },

            // { $unwind: "$cook_arr" },
            {
                $lookup: {
                    from: 'service_center_infos',
                    localField: 'service_center_id',
                    foreignField: '_id',
                    as: 'service_center'

                },

            }
            ,

            function (err, data) {

                //    var cook_arr = data[0].service_center[0].cook_arr;
                var cook_arr;
                db.order_infos.find({

                },
                    { order_id: 1, date: 1, order_status: 1, 'items.username': 1, 'items.grand_total': 1, 'items.pay_mode': 1, 'cook_id': 1 },
                    function (err, order) {

                        var order_info = order;
                        var final_data = [];

                        db.cook_infos.find({

                            delivery_boy_id: mongojs.ObjectId(req.body.delivery_boy_id)
                        },
                            { cook_name: 1 },
                            function (err, delvery_boy_cook) {

                                cook_arr = delvery_boy_cook;

                                for (var i = 0; i < cook_arr.length; i++) {

                                    for (var j = 0; j < order_info.length; j++) {

                                        if (cook_arr[i]._id == order_info[j].cook_id.toString()) {

                                            final_data.push(order_info[j]);

                                            //  console.log(order_info);
                                        }
                                    }
                                }
                                res.send(final_data);
                            });

                        //  res.send(final_data);

                    });




                // res.send(order_info);
            });


        // var orders_data = [];

        // db.user_infos.find({

        // },
        //     { orders: 1 }
        //     ,
        //     function (err, data) {
        //         if (err || !data) console.log("No  data found");
        //         else {
        //             // console.log(order);
        //             var order_coll = [];
        //             for (var i = 0; i < data.length; i++) {

        //                 if (data[i].orders.length > 0) {

        //                     orders_data.push(data[i]);
        //                 }

        //             }

        //             //   console.log(order[0].orders.length)
        //             var cook_id;
        //             var order_coll = [];
        //             var order_obj = {};

        //             for (var j = 0; j < orders_data.length; j++) {


        //                 for (var k = 0; k < orders_data[j].orders.length; k++) {

        //                     for (var l = 0; l < orders_data[j].orders[k].items.length; l++) {
        //                         // DB CALL 1

        //                         if (orders_data[j].orders[k].items[l].cook_id == req.body.cook_id) {
        //                             console.log('THISI IS INSIDE');
        //                             order_obj = {};
        //                             order_obj.order_id = orders_data[j].orders[k].order_id;
        //                             order_obj.date = orders_data[j].orders[k].date;
        //                             order_obj.time = orders_data[j].orders[k].time;
        //                             order_obj.order_status = orders_data[j].orders[k].order_status;
        //                             order_obj.username = orders_data[j].orders[k].items[l].username;

        //                             order_coll.push(order_obj);

        //                         }

        //                     }

        //                 }



        //             }
        //             res.status(200).send(order_coll);

        //         }

        //     }

        // );


    });


router
    .post('/fetch-cook-orders-for-front', function (req, res, next) {
        console.log('ddd');
        console.log(req.body.cook_id);
        var order_coll = {}

        var delivered_orders = {};
        var cancelled_orders = {};
        var open_orders = {};


        db.cook_infos.find({

            _id: mongojs.ObjectId(req.body.cook_id)

        },

            { cook_commission: 1 }
            , function (err, cookinfo) {
                console.log('COOK INFOR');
                console.log(cookinfo);
                var cookcommission = parseInt(cookinfo[0].cook_commission);


                console.log(cookcommission)
                db.order_infos.find(

                    {
                        $and: [{ cook_id: mongojs.ObjectId(req.body.cook_id) },
                        { order_status: 'delivered' }

                        ]
                    }

                ).sort({ '_id': -1 }, function (err, del_response) {

                    var result = 0.0;
                    var temp_d = 0;
                    var temp_comm = 0.0;
                    if (err) {

                        res.send(err);

                    }
                    else {
                        //      res.send(del_response);
                        if (del_response.length > 0) {

                            for (var i = 0; i < del_response.length; i++) {

                                result = 0.0;
                                temp_d = 0;
                                temp_comm = 0.0
                                for (var j = 0; j < del_response[i].items.length; j++) {

                                    temp_d = del_response[i].items[j].food_price * del_response[i].items[j].food_qty;
                                    temp_comm = (temp_d * cookcommission) / 100;
                                    temp_d = temp_d - temp_comm.toFixed(2);
                                    // temp_d = temp_d + del_response[i].items[j].delivery_charge;
                                    temp_d = temp_d + temp_d * .18;
                                    result = result + temp_d;
                                }
                                del_response[i].grand_total = result.toFixed(2);
                            }
                            order_coll.delivered_orders = del_response;

                        }
                        else {

                            order_coll.delivered_orders = [];

                        }

                        // 2 nd Callback

                        db.order_infos.find(

                            {
                                $and: [{ cook_id: mongojs.ObjectId(req.body.cook_id) },
                                { order_status: { $in: ['pending', 'confirmed', 'ready_for_del'] } }

                                ]
                            }

                        ).sort({ '_id': -1 }, function (err, open_response) {


                            if (err) {

                                res.send(err);

                            }
                            else {
                                //  res.send(del_response);
                                if (open_response.length > 0) {

                                    for (var i = 0; i < open_response.length; i++) {

                                        result = 0.0;
                                        temp_d = 0;
                                        temp_comm = 0.0;
                                        for (var j = 0; j < open_response[i].items.length; j++) {

                                            temp_d = open_response[i].items[j].food_price * open_response[i].items[j].food_qty;
                                            temp_comm = (temp_d * cookcommission) / 100;
                                            temp_d = temp_d - temp_comm.toFixed(2);
                                            // temp_d = temp_d + del_response[i].items[j].delivery_charge;
                                            temp_d = temp_d + temp_d * .18;

                                            result = result + temp_d;
                                        }
                                        open_response[i].grand_total = result.toFixed(2);
                                    }
                                    order_coll.open_orders = open_response;


                                }
                                else {

                                    order_coll.open_orders = [];

                                }


                                // 3 rd Callback

                                db.order_infos.find(

                                    {
                                        $and: [{ cook_id: mongojs.ObjectId(req.body.cook_id) },
                                        { order_status: { $in: ['cancelled'] } }

                                        ]
                                    }

                                ).sort({ '_id': -1 }, function (err, cancel_response) {


                                    if (err) {

                                        res.send(err);

                                    }
                                    else {
                                        //  res.send(del_response);
                                        if (cancel_response.length > 0) {

                                            for (var i = 0; i < cancel_response.length; i++) {

                                                result = 0.0;
                                                temp_d = 0;
                                                for (var j = 0; j < cancel_response[i].items.length; j++) {

                                                    temp_d = cancel_response[i].items[j].food_price * cancel_response[i].items[j].food_qty;
                                                    //     temp_d = temp_d + cancel_response[i].items[j].delivery_charge;
                                                    temp_comm = (temp_d * cookcommission) / 100;
                                                    temp_d = temp_d - temp_comm.toFixed(2);
                                                    // temp_d = temp_d + del_response[i].items[j].delivery_charge;
                                                    temp_d = temp_d + temp_d * .18;

                                                    result = result + temp_d;
                                                }
                                                cancel_response[i].grand_total = result.toFixed(2);
                                            }
                                            order_coll.cancelled_orders = cancel_response;


                                        }
                                        else {

                                            order_coll.cancelled_orders = [];

                                        }


                                        res.send(order_coll);

                                    }
                                });

                                //res.send(final_coll);

                            }
                        });



                    }
                });
            })



    });



router
    .post('/fetch-cook-orders-detail-admin', function (req, res, next) {
        console.log(req.body.order_id);
        db.order_infos.aggregate(

            { $match: { order_id: req.body.order_id } },

            // { $unwind: "$cook_arr" },
            {
                $lookup: {
                    from: 'user_infos',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user_data'

                },

            }
            ,
            {
                $lookup: {
                    from: 'cook_infos',
                    localField: 'cook_id',
                    foreignField: '_id',
                    as: 'cook_data'

                },

            },
            {
                $lookup: {
                    from: 'service_center_infos',
                    localField: 'cook_id',
                    foreignField: 'cook_arr._id',
                    as: 'service_center_data'

                },

            },
            // ,

            { $project: { 'order_id': 1, user_id: 1, cook_id: 1, date: 1, time: 1, order_status: 1, items: 1, 'user_data.email': 1, 'user_data.email': 1, 'user_data.phone': 1, 'cook_data.cook_name': 1, 'service_center_data.center_name': 1 } }

            //  { 'order_id': req.body.order_id } // DYNAMIC 

            , function (err, order) {

                var order_info = order;
                var order_data = [];


                if (order_info[0].items[0].delivery_by == 'Self' || order_info[0].items[0].delivery_by == 'Self ') {

                    order_info[0].delivery_by = "Cook";
                    order_info[0].cook_name = order_info[0].cook_data[0].cook_name;

                    console.log('DELIVERY BY COOK');
                }
                if (order_info[0].items[0].delivery_by == 'EatoEato' || order_info[0].items[0].delivery_by == 'EatoEato ') {

                    console.log('DELIVERY BY COOK');
                    order_info[0].delivery_by = "Admin";
                    order_info[0].center_name = order_info[0].service_center_data[0].center_name;
                }
                //   console.log(order);
                //   res.send(order);
                db.track_order_infos.find(

                    { 'main_order_id': req.body.order_id } // DYNAMIC 

                    , function (err, order_history) {


                        order_info[0].order_history = order_history[0].order_history;
                        // for (var k = 0; k < order_history.length; k++) {

                        //     for (var i = 0; i < order_info.length; i++) {

                        //         for (var j = 0; j < order_info[i].items.length; j++) {


                        //             if (order_history[k].sub_order_id == order_info[i].items[j].order_id) {

                        //                 order_info[i].items[j].order_hist = order_history[k];
                        //             }



                        //         }
                        //     }
                        // }
                        // order_obj.order_data = order_info;
                        // order_data.push(order_obj);
                        // order_obj = {};
                        // order_obj.order_history = order_history;
                        // order_data.push(order_obj);
                        console.log('ORRR DER ID');
                        console.log(order_info);
                        res.send(order_info);
                    });

                // db.order_infos.find({

                //     order_id: req.body.order_id

                // },
                //     function (err, data) {
                //         console.log('order');
                //         //   res.send(data);


                //         db.user_infos.find({

                //             _id: mongojs.ObjectId(data[0].user_id)

                //         },
                //             function (err, user) {

                //                 db.track_order_infos.find({

                //                     main_order_id: req.body.order_id

                //                 },
                //                     function (err, order_history) {

                //                         console.log(order_history);
                //                         data[0].user_email = user[0].email;
                //                         data[0].user_contact = user[0].phone;
                //                         data[0].order_history = order_history[0].order_history;

                //                         res.send(data);


                //                     });


                //             });


            });

        // db.order_infos.aggregate([


        //     {

        //         $match: {

        //             order_id: req.body.order_id

        //         }

        //     }

        //     , {
        //         $lookup:

        //         {

        //             from:"user_infos",
        //             localField:"user_id",
        //             foreignField:"_id",
        //             as:"user_info"
        //         }
        //     }
        // ],function(err,data){


        //     console.log(data);
        //     res.send(data);



        // });


        // var orders_data = [];
        // var final_data = [];
        // var user_data = [];
        // var service_ceneter_data = [];

        // db.user_infos.find({

        // },
        //     { orders: 1 }
        //     ,
        //     function (err, data) {
        //         if (err || !data) console.log("No  data found");
        //         else {
        //             // console.log(order);

        //             for (var i = 0; i < data.length; i++) {

        //                 if (data[i].orders.length > 0) {

        //                     orders_data.push(data[i]);
        //                 }

        //             }


        //             var cook_id;
        //             var order_coll = [];
        //             var order_obj = {};

        //             for (var j = 0; j < orders_data.length; j++) {


        //                 for (var k = 0; k < orders_data[j].orders.length; k++) {

        //                     for (var l = 0; l < orders_data[j].orders[k].items.length; l++) {

        //                         if (orders_data[j].orders[k].items[l].cook_id == '58faf626f023e30f78f2071c') {

        //                             // order_obj = {};
        //                             // order_obj.order_id = orders_data[j].orders[k].order_id;
        //                             // order_obj.date = orders_data[j].orders[k].date;
        //                             // order_obj.time = orders_data[j].orders[k].time;
        //                             // order_obj.order_status = orders_data[j].orders[k].order_status;
        //                             // order_obj.username = orders_data[j].orders[k].items[l].username;

        //                             order_coll.push(orders_data[j].orders[k]);



        //                         }

        //                     }

        //                 }



        //             }



        //             // NOW FETCHING STATUS OF FOOD
        //             var sub_order_track_detail_obj = {};
        //             var sub_order_track_detail_coll = [];

        //             db.user_infos.find({

        //             },
        //                 { sub_order_status: 1 }
        //                 ,
        //                 function (err, status) {
        //                     if (err || !status) console.log("No  data found");
        //                     else {

        //                         var sub_order_status = [];
        //                         for (var s = 0; s < status.length; s++) {

        //                             if (status[s].hasOwnProperty('sub_order_status')) {

        //                                 if (status[s].sub_order_status.length > 0) {
        //                                     sub_order_track_detail_obj = {};
        //                                     for (var t = 0; t < status[s].sub_order_status.length; t++) {

        //                                         sub_order_status.push(status[s].sub_order_status[t]);
        //                                         sub_order_track_detail_coll.push(status[s].sub_order_status[t]);
        //                                     }

        //                                 }
        //                             }

        //                         }


        //                         for (var a = 0; a < sub_order_status.length; a++) {

        //                             for (var b = 0; b < order_coll.length; b++) {

        //                                 for (var c = 0; c < order_coll[b].items.length; c++) {

        //                                     if (order_coll[b].items[c].order_id == sub_order_status[a].sub_order_id) {

        //                                         order_coll[b].items[c].order_status = sub_order_status[a].sub_order_status;
        //                                     }

        //                                 }
        //                             }
        //                         }


        //                         db.user_infos.find({

        //                         },
        //                             { email: 1, phone: 1 }
        //                             ,
        //                             function (err, user) {

        //                                 user_data.push(user);


        //                                 db.admin_infos.find({

        //                                 },
        //                                     { service_center_info: 1 }
        //                                     ,
        //                                     function (err, service_center) {

        //                                         var obj = {};
        //                                         service_ceneter_data.push(service_center);
        //                                         obj.order_data = order_coll;
        //                                         final_data.push(obj);
        //                                         obj = {};
        //                                         obj.user_data = user_data;
        //                                         final_data.push(obj);
        //                                         obj = {};
        //                                         obj.service_center_data = service_ceneter_data;
        //                                         final_data.push(obj);
        //                                         obj = {};
        //                                         obj.sub_order_detail = sub_order_track_detail_coll;
        //                                         final_data.push(obj);
        //                                         res.status(200).send(final_data);

        //                                     }
        //                                 );


        //                             }
        //                         );





        //                     }
        //                 });

        //             // res.status(200).send(order_coll);

        //         }

        //     }

        // );


    });
// FETCHING COOK RELATED ORDERS BY COOK ID

router
    .post('/fetch-cook-orders-by-id-admin', function (req, res, next) {


        var orders_data = [];

        db.user_infos.find({

        },
            { orders: 1 }
            ,
            function (err, data) {
                if (err || !data) console.log("No  data found");
                else {
                    // console.log(order);
                    var order_coll = [];
                    for (var i = 0; i < data.length; i++) {

                        if (data[i].orders.length > 0) {

                            orders_data.push(data[i]);
                        }

                    }

                    //   console.log(order[0].orders.length)
                    var cook_id;
                    var order_coll = [];
                    var order_obj = {};


                    var total_final_for_id = 0;
                    var is_self = false;
                    var is_service_center = false;
                    var duplicate_check = false;
                    for (var j = 0; j < orders_data.length; j++) {


                        for (var k = 0; k < orders_data[j].orders.length; k++) {

                            for (var l = 0; l < orders_data[j].orders[k].items.length; l++) {
                                // DB CALL 1
                                duplicate_check = false;
                                if (orders_data[j].orders[k].items[l].cook_id == req.body.cook_id) {


                                    // if (orders_data[j].orders[k].items[l].delivery_by == "Self") {
                                    //     is_self = true;
                                    // }
                                    // if (orders_data[j].orders[k].items[l].delivery_by == "EatoEato") {
                                    //     is_service_center = true;

                                    // }

                                    if (order_coll.length > 0) {

                                        for (var t = 0; t < order_coll.length; t++) {

                                            if (order_coll[t].order_id == orders_data[j].orders[k].order_id) {
                                                duplicate_check = true;
                                            }

                                        }

                                    }

                                    if (duplicate_check == false) {

                                        order_obj = {};
                                        order_obj.order_id = orders_data[j].orders[k].order_id;
                                        order_obj.date = orders_data[j].orders[k].date;
                                        order_obj.time = orders_data[j].orders[k].time;
                                        order_obj.order_status = orders_data[j].orders[k].order_status;
                                        order_obj.username = orders_data[j].orders[k].items[l].username;



                                        order_coll.push(order_obj);

                                    }




                                }


                            }




                            //   order_coll.push(orders_data[j].orders[k]);
                        }



                    }
                    console.log(order_coll.length);
                    for (var i = 0; i < order_coll.length; i++) {
                        console.log('VALIDTTE');
                        for (var j = 0; j < orders_data.length; j++) {


                            for (var k = 0; k < orders_data[j].orders.length; k++) {
                                is_self = false;
                                is_service_center = false;

                                console.log(orders_data[j].orders[k].order_id);

                                if (orders_data[j].orders[k].order_id == order_coll[i].order_id) {

                                    for (var l = 0; l < orders_data[j].orders[k].items.length; l++) {

                                        if (orders_data[j].orders[k].items[l].delivery_by == "Self") {

                                            is_self = true;
                                        }
                                        if (orders_data[j].orders[k].items[l].delivery_by == "EatoEato") {
                                            console.log('EATOTEOT');
                                            is_service_center = true;

                                        }

                                    }





                                }

                                if (is_self == true && is_service_center == false) {
                                    console.log('vvvvv');
                                    order_coll[i].delivery_by = "Cook";


                                }
                                if (is_self == true && is_service_center == true) {
                                    console.log('sss');
                                    order_coll[i].delivery_by = "Service Center & Cook";


                                }
                                break;
                                // if (is_service_center == true ) {
                                //     order_coll[i].delivery_by = "Service Center";
                                //      break;

                                // }
                                // order_coll[i].delivery_by = "COOK";
                                // break;


                            }
                            break;
                        }


                    }


                    // for (var i = 0; i < order_coll.length; i++) {

                    //     for (var j = 0; j < order_coll[i].items.length; j++) {

                    //         if (order_coll[i].items[j].cook_id == req.body.cook_id) {

                    //             total_final_for_id = total_final_for_id + order_coll[i].items[j].food_total_price;
                    //             if (order_coll[i].items[j].delivery_by == "Self") {
                    //                 is_self = true;
                    //             }
                    //             if (order_coll[i].items[j].delivery_by == "EatoEato") {
                    //                 is_service_center = true;

                    //             }

                    //         }
                    //     }
                    // }

                    res.status(200).send(order_coll);

                }

            }

        );


    });
// ORDERS OPERATIONS


router
    .post('/upload-file-test', function (req, res, next) {

        Jimp.read(Buffer.from(req.body.img, 'base64'), function (err, lenna) {
            if (err) throw err;
            lenna.resize(250, 250, Jimp.RESIZE_HERMITE)            // resize
                .quality(100)                 // set JPEG quality
                // set greyscale
                .write("client/uploads/admin_uploads/test1.jpg");
        });
        // sharp('input.jpg')
        //   .resize(200, 200)
        //   .toFile('ouput.jpg', function(err) {
        //       console.log(err);
        //     // output.jpg is a 200 pixels wide and 200 pixels high image
        //     // containing a scaled and cropped version of input.jpg
        //   });
        // gm('u7xhzIQ6CPPlY.jpg')
        // .identify(function (err, data) {
        //       if (!err) console.log(data)
        //       if(err)
        //       console.log(err);
        //     // // .resizeExact(240, 240)
        //     // // .noProfile()
        //     // .write('admin_uploads/bb.jpg', function (err) {
        //     //     if (!err) console.log('done');
        //     //     if(err) console.log(err);
        //     //     console.log('Uploaded');
        //     });



    });

router
    .get('/admin-dashboard', function (req, res, next) {


        //FOR  USER
        db.user_infos.find({

        }
            ,
            function (err, user) {
                if (err || !user) console.log("No  user found");
                else {

                    var dashboard_coll = [];

                    var dash_obj = {};
                    var active_user_count = 0;


                    dash_obj.total_user = user.length;

                    for (var i = 0; i < user.length; i++) {

                        if (user[i].status == 'active' || user[i].status == 'Active') {

                            active_user_count++;

                        }
                    }

                    //   dash_obj.total_user=user.length;

                    dash_obj.active_user = active_user_count;

                    dashboard_coll.push(dash_obj);

                    // For COOK
                    db.cook_infos.find({

                    }
                        ,
                        function (err, cook) {

                            // console.log(cook.length);
                            dash_obj = {};

                            dash_obj.total_cook = cook.length;

                            active_user_count = 0;
                            for (var i = 0; i < cook.length; i++) {

                                if (cook[i].status == 'Active' || cook[i].status == 'active') {

                                    active_user_count++;

                                }

                            }
                            dash_obj.active_cook = active_user_count;

                            dashboard_coll.push(dash_obj);

                            //  console.log(dashboard_coll);
                            db.order_infos.find({

                            },
                                function (err, data) {

                                    console.log(data);
                                    var pending_order = 0;
                                    var completed_order = 0;
                                    var cancelled_order = 0;
                                    var ready_for_del = 0;
                                    var delivered = 0;
                                    var confirmed = 0;
                                    dash_obj = {};

                                    //     res.send(data);
                                    for (var i = 0; i < data.length; i++) {

                                        //   if (data[i].items.length > 0) {

                                        //     for (var j = 0; j < data[i].items.length; j++) {
                                        console.log('test');

                                        if (data[i].order_status == 'pending') {

                                            pending_order++;
                                        }
                                        if (data[i].order_status == 'complete') {

                                            completed_order++;
                                        }
                                        if (data[i].order_status == 'ready_for_del') {

                                            ready_for_del++;
                                        }
                                        if (data[i].order_status == 'delivered') {

                                            delivered++;
                                        }
                                        if (data[i].order_status == 'confirmed') {

                                            confirmed++;
                                        }
                                        if (data[i].order_status == 'cancelled') {

                                            cancelled_order++;
                                        }

                                        //   }


                                        //     }

                                    }

                                    dash_obj.pending_order = pending_order;
                                    dash_obj.completed_order = completed_order;
                                    dash_obj.cancelled_order = cancelled_order;
                                    dash_obj.ready_for_del = ready_for_del;
                                    dash_obj.delivered = delivered;
                                    dash_obj.confirmed = confirmed;


                                    dashboard_coll.push(dash_obj);
                                    res.status(200).send(dashboard_coll);

                                });


                        });



                    // console.log(user.length);
                    // res.status(200).send(dashboard_coll);
                }

            }

        );




    });

router
    .get('/fetch-cook-payment-commission', function (req, res, next) {





        var orders_data = [];

        db.user_infos.find({

        },
            { orders: 1 }
            ,
            function (err, data) {
                if (err || !data) console.log("No  data found");
                else {
                    // console.log(order);
                    var order_coll = [];
                    for (var i = 0; i < data.length; i++) {

                        if (data[i].orders.length > 0) {

                            orders_data.push(data[i]);
                        }

                    }


                    var cook_id;
                    var order_coll = [];
                    var order_obj = {};
                    var duplicate_check = false;
                    for (var j = 0; j < orders_data.length; j++) {


                        for (var k = 0; k < orders_data[j].orders.length; k++) {

                            for (var l = 0; l < orders_data[j].orders[k].items.length; l++) {

                                if (orders_data[j].orders[k].items[l].cook_id == req.body.cook_id) {

                                    order_obj = {};
                                    order_obj.order_id = orders_data[j].orders[k].order_id;
                                    order_obj.date = orders_data[j].orders[k].date;
                                    order_obj.time = orders_data[j].orders[k].time;
                                    order_obj.order_status = orders_data[j].orders[k].order_status;
                                    order_obj.username = orders_data[j].orders[k].items[l].username;

                                    order_coll.push(orders_data[j].orders[k]);



                                }

                            }

                        }



                    }




                    res.status(200).send(orders_data);

                }

            }

        );


    });



router
    .get('/admin-commission', function (req, res, next) {

        db.order_infos.aggregate(

            {
                "$match": { order_status: 'delivered' }
            },
            {
                $lookup: {
                    from: 'cook_infos',
                    localField: 'cook_id',
                    foreignField: '_id',
                    as: 'cook_data'

                }

            },
            {
                $lookup: {
                    from: 'pay_commission_info',
                    localField: 'order_id',
                    foreignField: 'orderid',
                    as: 'comission_data'

                }

            },
            { $project: { order_id: 1, date: 1, time: 1, 'items': 1, 'cook_data.cook_commission': 1, 'cook_data.is_gstin': 1, 'cook_data.cook_name': 1, 'cook_data._id:': 1, 'comission_data': 1 } }

        ).sort({ 'time': -1 }, function (err, data) {


            if (data.length > 0) {
                for (var i = 0; i < data.length; i++) {


                    if (data[i].comission_data.length < 1) {
                        data[i].paid_status = 'unpaid'
                    }
                    if (data[i].comission_data.length > 0) {
                        data[i].paid_status = 'paid'
                    }
                }

                res.send(data);

            }
            else {
                var dd = [];
                res.send(dd);
            }

        }

            );



    });

router
    .post('/admin-commission-fetch-by-date-range', function (req, res, next) {

        var from_date = new Date(req.body.from_date).getTime();
        var to_date = new Date(req.body.to_date).getTime();




        db.order_infos.aggregate(

            {
                "$match": { $and: [{ order_status: 'delivered' }, { time: { $gte: from_date } }] }
            },
            {
                $lookup: {
                    from: 'cook_infos',
                    localField: 'cook_id',
                    foreignField: '_id',
                    as: 'cook_data'

                }

            },
            {
                $lookup: {
                    from: 'pay_commission_info',
                    localField: 'order_id',
                    foreignField: 'orderid',
                    as: 'comission_data'

                }

            },
            { $project: { order_id: 1, date: 1, time: 1, 'items': 1, 'cook_data.cook_commission': 1, 'cook_data.is_gstin': 1, 'cook_data.cook_name': 1, 'cook_data._id:': 1, 'comission_data': 1 } }

        ).sort({ 'time': -1 }, function (err, data) {

            console.log('TEST DATA');
            console.log(data);

            for (var i = 0; i < data.length; i++) {


                if (data[i].comission_data.length < 1) {
                    data[i].paid_status = 'unpaid'
                }
                if (data[i].comission_data.length > 0) {
                    data[i].paid_status = 'paid'
                }
            }

            res.send(data);
        }

            );



    });

router
    .post('/cook-payment-report', function (req, res, next) {

        console.log(req.body);
        db.order_infos.aggregate(

            {
                "$match": { order_status: 'delivered', cook_id: mongojs.ObjectId(req.body.cook_id) }
            },
            {
                $lookup: {
                    from: 'cook_infos',
                    localField: 'cook_id',
                    foreignField: '_id',
                    as: 'cook_data'

                }

            },
            {
                $lookup: {
                    from: 'pay_commission_info',
                    localField: 'order_id',
                    foreignField: 'orderid',
                    as: 'comission_data'

                }

            },
            { $project: { order_id: 1, date: 1, time: 1, 'items': 1, 'cook_data.cook_commission': 1, 'cook_data.is_gstin': 1, 'cook_data.cook_name': 1, 'cook_data._id:': 1, 'comission_data': 1 } }

        ).sort({ 'time': -1 }, function (err, commission) {




            var data = commission;
            // var s = response.data;
            var tot = 0;
            var tot_paid = 0;
            var final_res = commission;
            var tot_paid = 0;
            var final_data = [];
            var temp_obj = {};
            var theDate;

            var temp_d = 0;
            var result = 0.0;
            var temp_count = 0.0;

            for (var i = 0; i < data.length; i++) {
                tot = 0;
                for (var j = 0; j < data[i].items.length; j++) {

                    tot = tot + data[i].items[j].food_price * data[i].items[j].food_qty;
                }

                final_res[i].food_tot_val = tot;
                final_res[i].payble_amt = tot - Math.round((tot * parseInt(data[i].cook_data[0].cook_commission)) / 100);
                console.log('COMIISON DATA');
                console.log(data[0].comission_data);

                if (Array.isArray(data)) {

                    if (data[i].comission_data.length > 0) {

                        for (var s = 0; s < data[i].comission_data.length; s++) {

                            tot_paid = tot_paid + data[i].comission_data[s].amount;



                        }


                    }


                    if (data[i].cook_data[0].is_gstin == 'true') {


                        temp_d = 0;
                        result = 0.0;

                        for (var m = 0; m < data[i].items.length; m++) {

                            temp_d = data[i].items[m].food_qty * data[i].items[m].food_price;
                            result = (temp_d * data[i].cook_data[0].cook_commission) / 100;
                        }
                        console.log('TTTTTTTTTT');
                        console.log(result);
                        final_res[i].final_gst = result;
                        //  final_res[i].tot_paid =  final_res[i].tot_paid+(temp_d-result);
                    }
                    else {

                        final_res[i].final_gst = 0;
                        //  final_res[i].tot_paid = 0;
                    }


                    //                    for(var s=0;s<)
                    //     final_res[i].tot_paid = tot_paid;

                    temp_obj = {};

                    temp_obj.order_id = final_res[i].order_id;
                    temp_obj.date = final_res[i].date;
                    temp_obj.time = final_res[i].time;
                    temp_obj.cookname = final_res[i].cook_data[0].cook_name;
                    temp_obj.food_tot_val = final_res[i].food_tot_val;
                    temp_obj.food_tot_val = final_res[i].food_tot_val - final_res[i].final_gst;
                    temp_obj.tax_rate = final_res[i].final_gst;
                    temp_obj.tot_paid = final_res[i].tot_paid;
                    //  temp_obj.final_gst = final_res[i].final_gst;

                    //   theDate = new Date(final_res[i].time * 1000);
                    temp_obj.time = moment(final_res[i].time).format("h:mm A");

                    if (final_res[i].comission_data.length > 0) {
                        temp_obj.paid_status = 1;
                    }
                    if (final_res[i].comission_data.length < 1) {
                        temp_obj.paid_status = 0;
                    }



                    final_data.push(temp_obj);

                    temp_count = 0.0;
                    for (var s = 0; s < final_data.length; s++) {

                        if (final_data[s].paid_status == 1) {

                            temp_count = temp_count + final_data[s].food_tot_val;

                        }

                    }

                    final_data[0].tot_paid = temp_count;
                }
                else {

                    final_data = [];
                }

                // if ($scope.view_cook_pay_info[i].)
            }

            res.send(final_data);
        }

            );




    });

router
    .post('/admin-commission-detail-view', function (req, res, next) {

        // FIRST GET COOK ID

        console.log(req.body);
        var orders = [];
        db.user_infos.find({

        },
            {
                orders: 1
            }

            ,
            function (err, data) {

                for (var i = 0; i < data.length; i++) {


                    if (data[i].orders.length > 0) {

                        for (var j = 0; j < data[i].orders.length; j++) {

                            for (var k = 0; k < data[i].orders[j].items.length; k++) {

                                if (data[i].orders[j].items[k].cook_id == '59116d62cb88e32e8489f32c') {  //THIS IS SEND BY COOK

                                    orders.push(data[i].orders[j].items[k]);


                                }


                            }

                        }


                    }

                }


                // NOW ORDERS HAVE COOK ORDERS


                var final_data = [];
                var final_obj = {};

                db.user_infos.find({

                },
                    { sub_order_status: 1, _id: 0 }
                    ,
                    function (err, sub_order) {

                        var sub_order_detail = [];
                        // var sub_order_obj={};


                        for (var i = 0; i < sub_order.length; i++) {

                            if (sub_order[i].hasOwnProperty('sub_order_status')) {

                                if (sub_order[i].sub_order_status.length > 0) {

                                    for (var m = 0; m < sub_order[i].sub_order_status.length; m++) {

                                        sub_order_detail.push(sub_order[i].sub_order_status[m]);
                                    }


                                }
                            }
                        }

                        var final_data = [];
                        var final_obj = {};
                        for (var m = 0; m < orders.length; m++) {

                            for (var n = 0; n < sub_order_detail.length; n++) {

                                if (sub_order_detail[n].cook_id == '59116d62cb88e32e8489f32c') {

                                    if (sub_order_detail[n].sub_order_status == 'delivered') {

                                        console.log('TEST');
                                        final_data.push(orders[m]);

                                    }
                                }
                                // if (income_info_arr[j].cook_id == sub_order_detail[m].cook_id) {

                                //     if (sub_order_detail[m].sub_order_status == 'delivered') {
                                //         final_obj = {};
                                //         final_obj = income_info_arr[j];

                                //         final_data.push(final_obj);
                                //     }



                                // }

                            }


                        }

                        res.send(final_data);

                    });



                // db.pay_commission_info.find({

                // },
                //     function (err, commission) {


                //         var is_commission_found = false;

                //         for (var m = 0; m < orders.length; m++) {

                //             for (var n = 0; n < commission.length; n++) {

                //                 if (orders[m].order_id == commission[n].order_id) {


                //                     final_obj = {};
                //                     final_obj.order_id = orders[m].order_id;
                //                     final_obj.order_date = orders[m].order_date;
                //                     final_obj.food_total_price = orders[m].food_total_price;
                //                     final_obj.amount_paid = commission[m].paid_amt;

                //                     is_commission_found = true;

                //                     final_data.push(final_obj);

                //                 }

                //             }

                //         }


                //         res.send(final_data);

                //     });


            });
    });

router
    .post('/view-cook-pay-info', function (req, res, next) {

        console.log(req.body);

        var orders = [];
        db.user_infos.find({

        },
            {
                orders: 1
            }

            ,
            function (err, data) {
                if (err) console.log("No  orders found");
                else {
                    console.log(data);
                    for (var i = 0; i < data.length; i++) {


                        if (data[i].orders.length > 0) {

                            for (var j = 0; j < data[i].orders.length; j++) {

                                orders.push(data[i].orders[j]);
                            }


                        }

                    }

                    db.pay_commission_info.find({

                    },
                        function (err, commission) {

                            var payment_info = [];
                            var payment_info_obj = {};
                            var order_info = [];

                            for (var j = 0; j < orders.length; j++) {

                                for (var k = 0; k < orders.items.length; k++) {

                                    if (orders[j].items[k].cook_id == '59116d62cb88e32e8489f32c') {

                                        order_info.push(orders[j].items[k]);
                                        // if(commission.length>0){ 

                                        //     for(var m=0;m<commission.length;m++){

                                        //         if(commission[m].cook_id=='59116d62cb88e32e8489f32c'){

                                        //             payment_info_obj={};
                                        //             payment_info_obj.order_id=orders[j].items[k].order_id;
                                        //             payment_info_obj.order_date=orders[j].items[k].order_date;
                                        //             payment_info_obj.order_amount=orders[j].items[k].food_total_price;
                                        //             payment_info_obj.order_id=orders[j].items[k].order_id;
                                        //             payment_info_obj.order_id=orders[j].items[k].order_id;
                                        //             payment_info_obj.order_id=orders[j].items[k].order_id;

                                        //         }
                                        //     }
                                        // }

                                    }
                                }
                            }


                            res.status(200).send(order_info);

                        });




                }

            }

        );
        // db.pay_commission_info.save({
        //     cook_id: req.body.cook_id,
        //     cook_commission: req.body.cook_commission,
        //     paid_amt: req.body.paid_amt,

        //     added_on: moment(new Date()).format("DD/MM/YYYY"),



        // }, function (err, user) {

        //     if (err) throw err;

        //     res.send(user);
        //     console.log('user saved');

        //})

    });


router
    .post('/cook-pay-commission', function (req, res, next) {

        console.log(req.body);
        db.pay_commission_info.save({
            cook_id: req.body.cook_id,
            cook_commission: req.body.cook_commission,
            paid_amt: req.body.paid_amt,
            order_id: req.body.order_id,
            added_on: moment(new Date()).format("DD/MM/YYYY"),



        }, function (err, user) {

            if (err) throw err;

            res.send(user);
            console.log('user saved');

        })

    });

router
    .post('/approve-cook-fields', function (req, res, next) {

        console.log(req.body);

        var incoming_data = req.body;


        if (incoming_data.field_attr == 'cook_contact') {

            db.cook_infos.update(

                {
                    '_id': mongojs.ObjectId(incoming_data.cook_id),
                    'updated_fields.field_attr': 'cook_contact'
                },

                {
                    "$set": {
                        "cook_contact": parseInt(incoming_data.new_val),
                        last_updated_at: moment(new Date()).format("DD/MM/YYYY"),
                    },


                }, function (err, data, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send('error');
                        throw err;

                    }

                    db.cook_infos.update(
                        { "_id": mongojs.ObjectId(incoming_data.cook_id) },
                        { $pull: { 'updated_fields': { 'id': incoming_data.id } } }
                        , function (err, data, lastErrorObject) {
                            if (err) {
                                res.status(400);
                                res.send('error');
                                throw err;

                            }
                            console.log('deleted');
                            res.status(200).send(data);

                        });
                    // console.log(data);
                    // res.status(200).send(data);
                });
        }

        if (incoming_data.field_attr == 'delivery_by') {

            db.cook_infos.update(

                {
                    '_id': mongojs.ObjectId(incoming_data.cook_id),
                    'updated_fields.field_attr': 'delivery_by'
                },

                {
                    "$set": {
                        "delivery_by": incoming_data.new_val,
                        last_updated_at: moment(new Date()).format("DD/MM/YYYY"),

                    },


                }, function (err, data, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send('error');
                        throw err;

                    }

                    db.cook_infos.update(
                        { "_id": mongojs.ObjectId(incoming_data.cook_id) },
                        { $pull: { 'updated_fields': { 'id': incoming_data.id } } }
                        , function (err, data, lastErrorObject) {
                            if (err) {
                                res.status(400);
                                res.send('error');
                                throw err;

                            }
                            console.log('deleted');
                            res.status(200).send(data);

                        });
                    // console.log(data);
                    // res.status(200).send(data);
                });
        }



        // COMPANY udpate
        if (incoming_data.field_attr == 'cook_company_name') {

            db.cook_infos.update(

                {
                    '_id': mongojs.ObjectId(incoming_data.cook_id),
                    'updated_fields.field_attr': 'cook_company_name'
                },

                {
                    "$set": {
                        "cook_company_name": incoming_data.new_val,
                        last_updated_at: moment(new Date()).format("DD/MM/YYYY"),

                    },


                }, function (err, data, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send('error');
                        throw err;

                    }

                    db.cook_infos.update(
                        { "_id": mongojs.ObjectId(incoming_data.cook_id) },
                        { $pull: { 'updated_fields': { 'id': incoming_data.id } } }
                        , function (err, data, lastErrorObject) {
                            if (err) {
                                res.status(400);
                                res.send('error');
                                throw err;

                            }
                            console.log('deleted');
                            res.status(200).send(data);

                        });
                    // console.log(data);
                    // res.status(200).send(data);
                });
        }

        if (incoming_data.field_attr == 'bank_type') {

            db.cook_infos.update(

                {
                    '_id': mongojs.ObjectId(incoming_data.cook_id),
                    'updated_fields.field_attr': 'bank_type'
                },

                {
                    "$set": {
                        "bank_type": incoming_data.new_val,
                        last_updated_at: moment(new Date()).format("DD/MM/YYYY"),

                    },


                }, function (err, data, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send('error');
                        throw err;

                    }

                    db.cook_infos.update(
                        { "_id": mongojs.ObjectId(incoming_data.cook_id) },
                        { $pull: { 'updated_fields': { 'id': incoming_data.id } } }
                        , function (err, data, lastErrorObject) {
                            if (err) {
                                res.status(400);
                                res.send('error');
                                throw err;

                            }
                            console.log('deleted');
                            res.status(200).send(data);

                        });
                    // console.log(data);
                    // res.status(200).send(data);
                });
        }


        if (incoming_data.field_attr == 'cook_name_on_bank_acc') {


            console.log('ENTERED INTO COOK NAME ON BANK ACC');

            db.cook_infos.update(

                {
                    '_id': mongojs.ObjectId(incoming_data.cook_id),
                    'updated_fields.field_attr': 'cook_name_on_bank_acc'
                },

                {
                    "$set": {
                        "cook_name_on_bank_acc": incoming_data.new_val,
                        last_updated_at: moment(new Date()).format("DD/MM/YYYY"),

                    },


                }, function (err, data, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send('error');
                        throw err;

                    }

                    db.cook_infos.update(
                        { "_id": mongojs.ObjectId(incoming_data.cook_id) },
                        { $pull: { 'updated_fields': { 'id': incoming_data.id } } }
                        , function (err, data, lastErrorObject) {
                            if (err) {
                                res.status(400);
                                res.send('error');
                                throw err;

                            }
                            console.log('deleted');
                            res.status(200).send(data);

                        });
                    // console.log(data);
                    // res.status(200).send(data);
                });
        }

        if (incoming_data.field_attr == 'branch_name') {


            db.cook_infos.update(

                {
                    '_id': mongojs.ObjectId(incoming_data.cook_id),
                    'updated_fields.field_attr': 'branch_name'
                },

                {
                    "$set": {
                        "branch_name": incoming_data.new_val,
                        last_updated_at: moment(new Date()).format("DD/MM/YYYY"),

                    },


                }, function (err, data, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send('error');
                        throw err;

                    }

                    db.cook_infos.update(
                        { "_id": mongojs.ObjectId(incoming_data.cook_id) },
                        { $pull: { 'updated_fields': { 'id': incoming_data.id } } }
                        , function (err, data, lastErrorObject) {
                            if (err) {
                                res.status(400);
                                res.send('error');
                                throw err;

                            }
                            console.log('deleted');
                            res.status(200).send(data);

                        });
                    // console.log(data);
                    // res.status(200).send(data);
                });
        }

        if (incoming_data.field_attr == 'bank_account_no') {


            db.cook_infos.update(

                {
                    '_id': mongojs.ObjectId(incoming_data.cook_id),
                    'updated_fields.field_attr': 'bank_account_no'
                },

                {
                    "$set": {
                        "bank_account_no": incoming_data.new_val,
                        last_updated_at: moment(new Date()).format("DD/MM/YYYY"),

                    },


                }, function (err, data, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send('error');
                        throw err;

                    }

                    db.cook_infos.update(
                        { "_id": mongojs.ObjectId(incoming_data.cook_id) },
                        { $pull: { 'updated_fields': { 'id': incoming_data.id } } }
                        , function (err, data, lastErrorObject) {
                            if (err) {
                                res.status(400);
                                res.send('error');
                                throw err;

                            }

                            res.status(200).send(data);

                        });
                    // console.log(data);
                    // res.status(200).send(data);
                });
        }

        if (incoming_data.field_attr == 'bank_ifsc') {


            db.cook_infos.update(

                {
                    '_id': mongojs.ObjectId(incoming_data.cook_id),
                    'updated_fields.field_attr': 'bank_ifsc'
                },

                {
                    "$set": {
                        "bank_ifsc": incoming_data.new_val,
                        last_updated_at: moment(new Date()).format("DD/MM/YYYY"),

                    },


                }, function (err, data, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send('error');
                        throw err;

                    }

                    db.cook_infos.update(
                        { "_id": mongojs.ObjectId(incoming_data.cook_id) },
                        { $pull: { 'updated_fields': { 'id': incoming_data.id } } }
                        , function (err, data, lastErrorObject) {
                            if (err) {
                                res.status(400);
                                res.send('error');
                                throw err;

                            }

                            res.status(200).send(data);

                        });
                    // console.log(data);
                    // res.status(200).send(data);
                });
        }
        if (incoming_data.field_attr == 'bank_name') {


            db.cook_infos.update(

                {
                    '_id': mongojs.ObjectId(incoming_data.cook_id),
                    'updated_fields.field_attr': 'bank_name'
                },

                {
                    "$set": {
                        "bank_name": incoming_data.new_val,
                        last_updated_at: moment(new Date()).format("DD/MM/YYYY"),

                    },


                }, function (err, data, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send('error');
                        throw err;

                    }

                    db.cook_infos.update(
                        { "_id": mongojs.ObjectId(incoming_data.cook_id) },
                        { $pull: { 'updated_fields': { 'id': incoming_data.id } } }
                        , function (err, data, lastErrorObject) {
                            if (err) {
                                res.status(400);
                                res.send('error');
                                throw err;

                            }

                            res.status(200).send(data);

                        });
                    // console.log(data);
                    // res.status(200).send(data);
                });
        }
    });

router
    .post('/deny-cook-fields', function (req, res, next) {

        console.log(req.body);
        var incoming_data = req.body;
        db.cook_infos.update(
            { "_id": mongojs.ObjectId(incoming_data.cook_id) },
            { $pull: { 'updated_fields': { 'id': incoming_data.id } } }
            , function (err, data, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }

                res.status(200).send('success');

            });
    });


router
    .get('/fetch-user-all-reviews', function (req, res, next) {

        db.review_infos.find(

            {},

            function (err, data) {

                if (err) {

                    res.send(err)
                }

                res.send(data);
            }
        )
        // db.review_infos.aggregate(


        //     {
        //         $lookup: {
        //             from: 'user_infos',
        //             localField: 'user_id',
        //             foreignField: '_id',
        //             as: 'user_data'

        //         },

        //     },
        //     { $project: { food_name: 1, date: 1, review_rating: 1, 'user_data.username': 1 } },
        //     function (err, data) {

        //         if (err) {

        //             res.send(err)
        //         }

        //         res.send(data);
        //     }
        // )

    });

router
    .post('/edit-review', function (req, res, next) {

        console.log('REVIEW ID');
        console.log(req.body);
        db.review_infos.find({
            "_id": mongojs.ObjectId(req.body.review_id)
        }

            ,
            function (err, review) {
                if (err || !review) console.log("No  review found");
                else {
                    // console.log(user);
                    res.status(200).send(review);
                }

            }

        );

    });


router
    .post('/update-review-by-id', function (req, res, next) {

        console.log(req.body);

        db.review_infos.findAndModify({
            query: {
                '_id': mongojs.ObjectId(req.body._id)
            },
            update: {
                $set: {
                    review_title: req.body.review_title,
                    review_desc: req.body.review_desc,
                    review_rating: req.body.review_rating,

                },


            }

        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }

            console.log(data);
            res.status(200).send(data);
        });
    });


router
    .post('/admin-login', function (req, res, next) {

        console.log(req.body);

        // db.admin_login_infos.find({username:req.body.username},function(err,data){


        //     console.log(data);
        // })


        db.admin_login_infos.find(
            {
                $and: [
                    { "username": req.body.username },
                    { "password": req.body.password }
                ]
            }
            , function (err, admin) {
                if (err) console.log("No  admin found");

                if (admin.length < 1) {
                    res.send({ 'status': 'failure' });

                }
                else {
                    console.log(admin);
                    res.send({ 'status': 'success', 'data': admin });
                }

            }

        );
    });



router
    .post('/change-admin-pass', function (req, res, next) {


        db.admin_login_infos.find({ password: req.body.old_pass }, function (err, data) {


            if (data.length < 1) {

                res.send({ 'status': 'old pwd incorrect' });
            }

            if (data.length > 0) {

                console.log(data);

                db.admin_login_infos.update({
                    "username": 'admin'
                },

                    {
                        "$set": {
                            "password": req.body.new_pass

                        }

                    }

                    ,
                    function (err, user) {
                        if (err || !user) console.log("No  admin found");
                        else {
                            console.log(user);

                        }

                        res.send({ 'status': 'success' });

                    }



                );

                //res.send({'status':'old pwd incorrect'});
            }


        });

        console.log(req.body);

    });

router
    .post('/save-payment-info', function (req, res, next) {


        db.pay_commission_info.save({

            orderid: req.body.orderid,
            date: req.body.date,
            time: req.body.time,
            amount: req.body.amount,
            cook_id: mongojs.ObjectId(req.body.cook_id),
            comment: req.body.comment,
            status: 'paid'

        }, function (err, user) {

            if (err) throw err;

            res.send(user);
            console.log('user saved');

        });


        console.log(req.body);
    });


// FOR EMAIL TEMPLATE

router
    .post('/insert-email-template', function (req, res, next) {

        db.email_template_infos.save({

            name: req.body.name,
            subject: req.body.subject,
            body: req.body.body

        }, function (err, email) {

            if (err) throw err;

            res.send(email);
            console.log('email inserted');

        })

    });

router
    .get('/fetch-email-template-name', function (req, res, next) {

        db.email_template_infos.find(

            {},
            { name: 1 },
            function (err, email) {
                if (err || !email) console.log("No  email found");
                else {


                    res.status(200).send(email);
                }

            }

        );

    });

router

    .post('/fetch-email-template-by-type', function (req, res, next) {
        //console.log(req.body);
        db.email_template_infos.find(

            { _id: mongojs.ObjectId(req.body.temp_view_id) }
            ,
            function (err, template) {


                if (err) {
                    res.status(404);
                    res.send('info not found');
                } else {

                    res.send(template);

                }

            });
    });

router

    .post('/edit-email-template', function (req, res, next) {
        console.log(req.body);
        db.email_template_infos.findAndModify({

            query: {
                '_id': mongojs.ObjectId(req.body.id)
            },
            update: {
                $set: {
                    name: req.body.name,
                    subject: req.body.subject,
                    body: req.body.body,

                },


            },
            new: true

        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }

            console.log(data);
            res.send(data);
        });
    });


// FOR SMS TEMPLATE


router
    .post('/insert-sms-template', function (req, res, next) {

        db.sms_template_infos.save({

            name: req.body.name,
            subject: req.body.subject,
            body: req.body.body

        }, function (err, sms) {

            if (err) throw err;

            res.send(sms);
            console.log('sms inserted');

        })

    });

router
    .get('/fetch-sms-template-name', function (req, res, next) {

        db.sms_template_infos.find(

            {},
            { name: 1 },
            function (err, sms) {
                if (err || !sms) console.log("No  sms found");
                else {


                    res.status(200).send(sms);
                }

            }

        );

    });

router

    .post('/fetch-sms-template-by-type', function (req, res, next) {
        //console.log(req.body);
        db.sms_template_infos.find(

            { _id: mongojs.ObjectId(req.body.temp_view_id) }
            ,
            function (err, template) {


                if (err) {
                    res.status(404);
                    res.send('info not found');
                } else {

                    res.send(template);

                }

            });
    });

router

    .post('/edit-sms-template', function (req, res, next) {
        console.log(req.body);
        db.sms_template_infos.findAndModify({

            query: {
                '_id': mongojs.ObjectId(req.body.id)
            },
            update: {
                $set: {
                    name: req.body.name,
                    subject: req.body.subject,
                    body: req.body.body,

                },


            },
            new: true

        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }

            console.log(data);
            res.send(data);
        });
    });


router

    .post('/contact-query', function (req, res, next) {

        console.log(req.body);

        db.global_setting_infos.find({}, function (err, globaldata) {


            console.log(globaldata);

            var g_data = globaldata[0];

            res.send({ 'status': 'success' });

            // SENDING TO USER
            var mailOptions = {
                from: '"EatoEato 👻" <ankuridigitie@gmail.com>', // sender address
                to: req.body.email, // list of receivers
                subject: 'Thanks For Contacting EatoEato', // Subject line
                text: 'Thanks For Contacting EatoEato', // plain text body
                html: 'Thanks For Contacting EatoEato, We Will Reach You Shortly.!'
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    res.json({
                        yo: 'error'
                    });
                } else {
                    console.log('Message sent: ' + info.response);
                    res.send({ 'status': 'success' });

                };
            });

            // SENDING TO ADMIN
            var mailOptions = {
                from: '"EatoEato 👻" <ankuridigitie@gmail.com>', // sender address
                to: g_data.receive_on, // list of receivers
                subject: req.body.subject, // Subject line
                text: 'New Inquiry Recieved', // plain text body
                html: req.body.message
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    res.json({
                        yo: 'error'
                    });
                } else {
                    console.log('Message sent: ' + info.response);
                    res.send({ 'status': 'success' });

                };
            });

        });



    });



router

    .post('/del-boy-login', function (req, res, next) {

        console.log(req.body);

        db.delivery_boy_infos.find(
            {
                $and: [

                    { boy_contact: req.body.boy_contact },
                    { boy_password: req.body.boy_password }


                ]
            }
            ,
            function (err, dvdata) {

                console.log(dvdata);
                if (dvdata.length < 1) {

                    var arr = [];
                    res.send({ 'status': 'failiure', data: arr });

                }
                else if (dvdata.length > 0) {

                    console.log('DV DATA');
                    console.log(req.session);
                  //  req.session.user_id = dvdata[0].dvdata;
                    res.send({ 'status': 'success', data: dvdata });

                }


            });

    });


router

    .post('/del-boy-pickup-list', function (req, res, next) {

        var todaydate = moment(new Date()).format("DD-MM-YYYY");
        var ordertime = moment.unix(1503322114840 / 1000).format("hh:mm a")
        console.log(todaydate);

        db.cook_infos.find({
            delivery_boy_id: mongojs.ObjectId(req.body.delivery_boy_id)
        },
            { _id: 1 }
            , function (err, cookarr) {
                if (err) {

                    res.send(err);
                }


                var marr = [];
                var t;
                for (var i = 0; i < cookarr.length; i++) {

                    t = mongojs.ObjectId(cookarr[i]._id);
                    marr.push(t);
                }

                console.log('THIS IS MARR 1');
                console.log(marr);
                console.log(todaydate);


                db.order_infos.aggregate([
                    {
                        $match: {

                            $and: [
                                {
                                    cook_id: { $in: marr }
                                },
                                {
                                    'items.order_date': { $eq: todaydate }
                                },
                                {
                                    order_status: 'ready_for_del'
                                }

                            ]

                        }

                    },

                    {
                        $lookup: {
                            from: 'cook_infos',
                            localField: 'cook_id',
                            foreignField: '_id',
                            as: 'cook_data'

                        },

                    }
                    ,
                    { $project: { 'order_id': 1, 'is_picked': 1, 'items.order_date': 1, 'time': 1, 'order_status': 1, 'cook_data.cook_name': 1, 'cook_data.cook_contact': 1, 'cook_data.street_address': 1, 'cook_data.landmark': 1, 'cook_data.cook_latitude': 1, 'cook_data.cook_longitude': 1 } }
                ]
                ).sort({ time: -1 }, function (err, orderarr) {

                    console.log(orderarr);
                    res.send(orderarr);
                });

                //  let arr = cookarr.map((ele) => { return new mongoose.Types.ObjectId(ele.id) })
                // console.log(t);
                // res.send(marr);
            });



    })

router

    .post('/del-boy-open-pickup-list', function (req, res, next) {



        db.cook_infos.find({
            delivery_boy_id: mongojs.ObjectId(req.body.delivery_boy_id)
        },
            { _id: 1 }
            , function (err, cookarr) {
                if (err) {

                    res.send(err);
                }


                var marr = [];
                var t;
                for (var i = 0; i < cookarr.length; i++) {

                    t = mongojs.ObjectId(cookarr[i]._id);
                    marr.push(t);
                }


                db.order_infos.aggregate([
                    {
                        $match: {

                            $and: [
                                {
                                    cook_id: { $in: marr }
                                },
                                {
                                    order_status: { $in: ['confirmed', 'ready_for_del'] }
                                }

                            ]

                        }

                    },

                    {
                        $lookup: {
                            from: 'cook_infos',
                            localField: 'cook_id',
                            foreignField: '_id',
                            as: 'cook_data'

                        },

                    }
                    ,
                    { $project: { 'order_id': 1, 'is_picked': 1, 'items.order_date': 1, 'time': 1, 'order_status': 1, 'cook_data.cook_name': 1, 'cook_data.cook_contact': 1, 'cook_data.street_address': 1, 'cook_data.landmark': 1, 'cook_data.cook_latitude': 1, 'cook_data.cook_longitude': 1 } }
                ]
                ).sort({ 'items.order_date': -1 }, function (err, orderarr) {

                    console.log(marr);
                    res.send(orderarr);
                });

                //  let arr = cookarr.map((ele) => { return new mongoose.Types.ObjectId(ele.id) })
                // console.log(t);
                // res.send(marr);
            });



    })



router

    .post('/del-boy-delivered-list', function (req, res, next) {

        db.cook_infos.find({
            delivery_boy_id: mongojs.ObjectId(req.body.delivery_boy_id)
        },
            { _id: 1 }
            , function (err, cookarr) {
                if (err) {

                    res.send(err);
                }


                var marr = [];
                var t;
                for (var i = 0; i < cookarr.length; i++) {

                    t = mongojs.ObjectId(cookarr[i]._id);
                    marr.push(t);
                }


                db.order_infos.aggregate([
                    {
                        $match: {

                            $and: [
                                {
                                    cook_id: { $in: marr }
                                },
                                {
                                    order_status: 'delivered'
                                }

                            ]

                        }

                    },

                    {
                        $lookup: {
                            from: 'cook_infos',
                            localField: 'cook_id',
                            foreignField: '_id',
                            as: 'cook_data'

                        },

                    }
                    ,
                    { $project: { 'order_id': 1, 'date': 1, 'time': 1, 'order_status': 1, 'cook_data.cook_name': 1, 'cook_data.cook_contact': 1, 'cook_data.street_address': 1, 'cook_data.landmark': 1, 'cook_data.cook_latitude': 1, 'cook_data.cook_longitude': 1 } }
                ]
                    , function (err, orderarr) {

                        console.log(marr);
                        res.send(orderarr);
                    });

                //  let arr = cookarr.map((ele) => { return new mongoose.Types.ObjectId(ele.id) })
                // console.log(t);
                // res.send(marr);
            });



    })

router

    .post('/del-boy-profile-detail', function (req, res, next) {

        var dvprofile = {};
        db.delivery_boy_infos.aggregate([
            {
                $match: {
                    _id: mongojs.ObjectId(req.body.delivery_boy_id)
                }
            },
            {
                $lookup: {
                    from: 'service_center_infos',
                    localField: 'service_center_id',
                    foreignField: '_id',
                    as: 'service_center_data'

                },

            }
        ]
            , function (err, dvdata) {

                console.log(dvdata);
                //   res.send(dvdata);
                dvprofile.name = dvdata[0].boy_name;
                dvprofile.email = dvdata[0].boy_email;
                dvprofile.contact = dvdata[0].boy_contact;
                dvprofile.joined_on = dvdata[0].joined_on;
                dvprofile.service_center_name = dvdata[0].service_center_data[0].center_name;


                db.cook_infos.find({
                    delivery_boy_id: mongojs.ObjectId(req.body.delivery_boy_id)
                },
                    { _id: 1 }
                    , function (err, cookarr) {
                        if (err) {

                            res.send(err);
                        }



                        var marr = [];
                        var t;
                        for (var i = 0; i < cookarr.length; i++) {

                            t = mongojs.ObjectId(cookarr[i]._id);
                            marr.push(t);
                        }

                        dvprofile.totalcooks = marr.length;

                        db.order_infos.find(

                            {
                                $and: [
                                    {
                                        cook_id: { $in: marr }
                                    },
                                    {
                                        order_status: { $in: ['delivered', 'ready_for_del', 'confirmed'] }
                                    }

                                ]

                            },
                            { _id: 1 }
                            , function (err, totorder) {

                                console.log(totorder.length);

                                dvprofile.totorder = totorder.length;

                                db.order_infos.find(

                                    {
                                        $and: [
                                            {
                                                cook_id: { $in: marr }
                                            },
                                            {
                                                order_status: { $in: ['ready_for_del', 'confirmed'] }
                                            }

                                        ]

                                    },
                                    { _id: 1 }
                                    , function (err, pendingorder) {

                                        console.log(pendingorder.length);

                                        dvprofile.pendingorder = pendingorder.length;

                                        db.order_infos.find(

                                            {
                                                $and: [
                                                    {
                                                        cook_id: { $in: marr }
                                                    },
                                                    {
                                                        order_status: { $in: ['delivered'] }
                                                    }

                                                ]

                                            },
                                            { _id: 1 }
                                            , function (err, deliveredorder) {

                                                console.log(deliveredorder.length);

                                                dvprofile.deliveredorder = deliveredorder.length;


                                                res.send(dvprofile);
                                            });



                                    });

                            });

                        //  let arr = cookarr.map((ele) => { return new mongoose.Types.ObjectId(ele.id) })
                        // console.log(t);
                        // res.send(marr);
                    });



            });

    });


router

    .post('/confirm-pickup-cook', function (req, res, next) {

        console.log(req.body);
        db.order_infos.findAndModify({
            query: { order_id: req.body.orderid },
            update: { $set: { is_picked: 'true' } }

        }, function (err, doc) {

            if (err) {
                res.send(err);
            }

            res.send({ 'status': 'success' });
        })

    });

router

    .post('/del-boy-drop-list', function (req, res, next) {

        var todaydate = moment(new Date()).format("DD-MM-YYYY");
        var ordertime = moment.unix(1503322114840 / 1000).format("hh:mm a")
        console.log(todaydate);

        db.cook_infos.find({
            delivery_boy_id: mongojs.ObjectId(req.body.delivery_boy_id)
        },
            { _id: 1 }
            , function (err, cookarr) {
                if (err) {

                    res.send(err);
                }


                var marr = [];
                var t;
                for (var i = 0; i < cookarr.length; i++) {

                    t = mongojs.ObjectId(cookarr[i]._id);
                    marr.push(t);
                }


                db.order_infos.aggregate([
                    {
                        $match: {

                            $and: [
                                {
                                    cook_id: { $in: marr }
                                },
                                {
                                    'items.order_date': { $eq: todaydate }
                                },
                                {
                                    order_status: 'ready_for_del'
                                },
                                {
                                    is_picked: 'true'
                                }


                            ]

                        }

                    },

                    {
                        $lookup: {
                            from: 'cook_infos',
                            localField: 'cook_id',
                            foreignField: '_id',
                            as: 'cook_data'

                        },

                    },

                    {
                        $project: {
                            'order_id': 1, 'is_picked': 1, delivery_id: 1, 'items.order_date': 1, 'time': 1, 'order_status': 1, 'cook_data.cook_name': 1, 'cook_data.cook_contact': 1, 'cook_data.street_address': 1, 'cook_data.landmark': 1, 'cook_data.cook_latitude': 1, 'cook_data.cook_longitude': 1, 'items.username': 1, 'items.addr_info': 1, 'items.addr_name': 1, 'items.addr_contact': 1, 'items.addr_lat': 1, 'items.addr_long': 1, 'items.food_name': 1, 'items.food_price': 1, 'items.food_qty': 1, 'items.delivery_charge': 1, 'items.delivery_time': 1,
                            'items.pay_mode': 1, 'items.tax_rate': 1, 'items.food_type': 1
                        }
                    }
                ]
                ).sort({ 'items.order_date': -1 }, function (err, orderarr) {

                    console.log('rrrrrr');
                    console.log(orderarr);
                    var a;
                    var b;
                    var tax;
                    var grand_total = 0.0;


                    if (orderarr.length > 0) {
                        for (var i = 0; i < orderarr[0].items.length; i++) {

                            a = orderarr[0].items[i].food_price * orderarr[0].items[i].food_qty;
                            b = a + orderarr[0].items[i].delivery_charge;
                            tax = b * .18;
                            grand_total = grand_total + (b + tax);


                        }
                        orderarr[0].grand_total = grand_total.toFixed(2);
                        res.send(orderarr);

                    }
                    else {
                        orderarr = [];
                        res.send(orderarr);

                    }




                });

                //  let arr = cookarr.map((ele) => { return new mongoose.Types.ObjectId(ele.id) })
                // console.log(t);
                // res.send(marr);
            });



    })

router

    .post('/confirm-drop-order-user', function (req, res, next) {

        console.log(req.body);
        db.order_infos.findAndModify({
            query: { order_id: req.body.orderid },
            update: { $set: { order_status: 'delivered' } }

        }, function (err, doc) {

            if (err) {
                res.send(err);
            }

            res.send({ 'status': 'success' });
        })

    });


router

    .get('/excel-export-income', function (req, res, next) {

        db.order_infos.aggregate(

            {
                "$match": { order_status: 'delivered' }
            },
            {
                $lookup: {
                    from: 'cook_infos',
                    localField: 'cook_id',
                    foreignField: '_id',
                    as: 'cook_data'

                }

            },
            {
                $lookup: {
                    from: 'pay_commission_info',
                    localField: 'order_id',
                    foreignField: 'orderid',
                    as: 'comission_data'

                }

            },
            { $project: { order_id: 1, date: 1, time: 1, 'items': 1, 'cook_data.cook_commission': 1, 'cook_data.is_gstin': 1, 'cook_data.cook_name': 1, 'cook_data._id:': 1, 'comission_data': 1 } }

        ).sort({ 'time': -1 }, function (err, data) {


            for (var i = 0; i < data.length; i++) {


                if (data[i].comission_data.length < 1) {
                    data[i].paid_status = 'unpaid'
                }
                if (data[i].comission_data.length > 0) {
                    data[i].paid_status = 'paid'
                }
            }


            var income_list_view = data;

            var food_tot_val = 0;
            var payble_amt = 0;
            var discount_amt = 0;
            var del_charge = 0;
            var temp_tot_val = 0;

            var tt = 0;
            var is_gst_reg = false;
            var ts = 0;
            for (var i = 0; i < data.length; i++) {

                discount_amt = 0;
                food_tot_val = 0;
                del_charge = 0;
                temp_tot_val = 0;
                is_gst_reg = false;
                for (var j = 0; j < income_list_view[i].items.length; j++) {

                    if (income_list_view[i].items[j].discount_amt != 0) {

                        discount_amt = discount_amt + income_list_view[i].items[j].discount_amt;
                    }


                    food_tot_val = food_tot_val + (income_list_view[i].items[j].food_total_price * income_list_view[i].items[j].food_qty);
                    //  console.log(food_tot_val);
                }

                if (income_list_view[i].cook_data[0].is_gstin == "true") {
                    is_gst_reg = true;
                }

                del_charge = income_list_view[i].items[0].delivery_charge;

                income_list_view[i].food_total_price = food_tot_val;

                income_list_view[i].income = Math.round((food_tot_val * parseInt(income_list_view[i].cook_data[0].cook_commission)) / 100);

                if (discount_amt > 0) {

                    income_list_view[i].income = income_list_view[i].income - discount_amt;

                }

                income_list_view[i].payble_amt = food_tot_val - Math.round((food_tot_val * parseInt(income_list_view[i].cook_data[0].cook_commission)) / 100);

                income_list_view[i].eatoeato_gst = (income_list_view[i].income + del_charge) * 18 / 100;

                if (is_gst_reg == false) {

                    income_list_view[i].tax_rate = 0.0;

                    ts = income_list_view[i].food_total_price * .18;
                    income_list_view[i].eatoeato_gst = income_list_view[i].eatoeato_gst + ts;
                    income_list_view[i].eatoeato_gst = income_list_view[i].eatoeato_gst.toFixed(2);

                }
                else if (is_gst_reg == true) {

                    income_list_view[i].tax_rate = food_tot_val * 18 / 100;
                }


                console.log('commission');
                var ss;
                console.log(parseInt(income_list_view[i].cook_data[0].cook_commission));

                //temp_tot_val + (temp_tot_val * 18 / 100);
                income_list_view[i].discount_amt = discount_amt;
                income_list_view[i].eatoeato_total_val = income_list_view[i].eatoeato_total_val - income_list_view[i].discount_amt;
                income_list_view[i].eatoeato_total_val = income_list_view[i].eatoeato_total_val.toFixed(2);
                income_list_view[i].cook_name = income_list_view[i].cook_data[0].cook_name;
                income_list_view[i].pay_mode = income_list_view[i].items[0].pay_mode;
                income_list_view[i].delivery_charge = income_list_view[i].items[0].delivery_charge;
                income_list_view[i].delivery_time = income_list_view[i].items[0].delivery_time;
                ss = (income_list_view[i].items[0].food_total_price * income_list_view[i].cook_data[0].cook_commission) / 100;
                income_list_view[i].income = ss - discount_amt;
                console.log('ssssssssss');
                console.log(ss);
                income_list_view[i].food_total_price = income_list_view[i].items[0].food_total_price - ss;

                if (income_list_view[i].tax_rate != 0) {
                    income_list_view[i].tax_rate = income_list_view[i].food_total_price * 18 / 100;
                }



                temp_tot_val = food_tot_val + del_charge;
                if (is_gst_reg == false) {
                    income_list_view[i].eatoeato_gst = (income_list_view[i].food_total_price + income_list_view[i].income + del_charge) * .18;
                    income_list_view[i].eatoeato_gst = income_list_view[i].eatoeato_gst.toFixed(2);
                }
                else if (is_gst_reg == true) {
                    income_list_view[i].eatoeato_gst = (income_list_view[i].income + del_charge) * .18;
                    income_list_view[i].eatoeato_gst = income_list_view[i].eatoeato_gst.toFixed(2);
                }
                console.log('TEMP TOTAL VAL');
                console.log(temp_tot_val);
                income_list_view[i].eatoeato_total_val = income_list_view[i].income + income_list_view[i].delivery_charge + parseFloat(income_list_view[i].eatoeato_gst) + parseFloat(income_list_view[i].food_total_price) + income_list_view[i].tax_rate;
                income_list_view[i].eatoeato_total_val = income_list_view[i].eatoeato_total_val.toFixed(2);
                //$scope.income_list_view[i].food_total_price = $scope.income_list_view[i].eatoeato_total_val - $scope.income_list_view[i].income - $scope.income_list_view[i].delivery_charge - $scope.income_list_view[i].eatoeato_gst;
                //$scope.income_list_view[i].food_total_price = $scope.income_list_view[i].food_total_price.toFixed(2);
            }
            // //  console.log('THIS IS INCOME LIST');
            // $scope.income_list_view = response.data;
            // var rem_amt = 0;
            // for (var i = 0; i < $scope.income_list_view.length; i++) {

            //     rem_amt = $scope.income_list_view[i].total_amount_payble - $scope.income_list_view[i].total_paid;
            //     $scope.income_list_view[i].remaining_amt = rem_amt;

            // }

            console.log('mODIFIED');
            console.log(income_list_view);

            const styles = {
                headerDark: {
                    fill: {
                        fgColor: {
                            rgb: 'FF000000'
                        }
                    },
                    font: {
                        color: {
                            rgb: 'FFFFFFFF'
                        },
                        sz: 14,
                        bold: true,
                        underline: true
                    }
                },
                cellPink: {
                    fill: {
                        fgColor: {
                            rgb: 'FFFFCCFF'
                        }
                    }
                },
                cellGreen: {
                    fill: {
                        fgColor: {
                            rgb: 'FF00FF00'
                        }
                    }
                }
            };


            const heading = [
                // [{ value: 'a1', style: styles.headerDark }, { value: 'b1', style: styles.headerDark }, { value: 'c1', style: styles.headerDark }],
                // ['a2', 'b2', 'c2'] // <-- It can be only values
            ];


            //Here you specify the export structure
            const specification = {

                orderid: {
                    displayName: 'Order Id',
                    headerStyle: styles.headerDark,
                    cellStyle: styles.cellPink, // <- Cell style
                    width: 220 // <- width in pixels
                },
                cookname: {
                    displayName: 'Cook Name',
                    headerStyle: styles.headerDark,
                    cellStyle: styles.cellPink, // <- Cell style
                    width: 220 // <- width in pixels
                },
                date: {
                    displayName: 'Date',
                    headerStyle: styles.headerDark,
                    cellStyle: styles.cellPink, // <- Cell style
                    width: 220 // <- width in pixels
                },
                time: {

                    displayName: 'Time',
                    headerStyle: styles.headerDark,
                    cellStyle: styles.cellPink, // <- Cell style
                    width: 220 // <- width in pixels
                },
                discountamt: {

                    displayName: 'Discount Amt.',
                    headerStyle: styles.headerDark,
                    cellStyle: styles.cellPink, // <- Cell style
                    width: 220 // <- width in pixels
                },
                paymode: {

                    displayName: 'PayMent Mode',
                    headerStyle: styles.headerDark,
                    cellStyle: styles.cellPink, // <- Cell style
                    width: 220 // <- width in pixels
                },
                totalval: {

                    displayName: 'Total Value',
                    headerStyle: styles.headerDark,
                    cellStyle: styles.cellPink, // <- Cell style
                    width: 220 // <- width in pixels
                },
                eatoeatoincome: {

                    displayName: 'EatoEato Income',
                    headerStyle: styles.headerDark,
                    cellStyle: styles.cellPink, // <- Cell style
                    width: 220 // <- width in pixels
                },
                eatoeatodelcharge: {

                    displayName: 'EatoEato Delivery Charge',
                    headerStyle: styles.headerDark,
                    cellStyle: styles.cellPink, // <- Cell style
                    width: 220 // <- width in pixels
                },
                eatoeatogst: {

                    displayName: 'EatoEato GST',
                    headerStyle: styles.headerDark,
                    cellStyle: styles.cellPink, // <- Cell style
                    width: 220 // <- width in pixels
                },
                cookfoodval: {

                    displayName: 'Cook Food Value',
                    headerStyle: styles.headerDark,
                    cellStyle: styles.cellPink, // <- Cell style
                    width: 220 // <- width in pixels
                },
                paystatus: {

                    displayName: 'Payment Status',
                    headerStyle: styles.headerDark,
                    cellStyle: styles.cellPink, // <- Cell style
                    width: 220 // <- width in pixels
                }
            }

            const dataset = [


            ]

            var temp_obj = {};

            for (var i = 0; i < income_list_view.length; i++) {
                temp_obj = {};
                temp_obj.orderid = income_list_view[i].order_id;
                temp_obj.cookname = income_list_view[i].cook_data[0].cook_name;
                temp_obj.date = income_list_view[i].date;
                temp_obj.time = moment.unix(income_list_view[i].time).format("HH:mm a");
                temp_obj.discountamt = income_list_view[i].discount_amt;
                temp_obj.paymode = income_list_view[i].pay_mode;
                temp_obj.totalval = income_list_view[i].eatoeato_total_val;
                temp_obj.eatoeatoincome = income_list_view[i].income;
                temp_obj.eatoeatodelcharge = income_list_view[i].delivery_charge;
                temp_obj.eatoeatogst = income_list_view[i].eatoeato_gst;
                temp_obj.cookfoodval = income_list_view[i].food_total_price;

                temp_obj.paystatus = income_list_view[i].paid_status;

                temp_obj = dataset.push(temp_obj);
            }

            // The data set should have the following shape (Array of Objects)
            // The order of the keys is irrelevant, it is also irrelevant if the
            // dataset contains more fields as the report is build based on the
            // specification provided above. But you should have all the fields
            // that are listed in the report specification


            // Define an array of merges. 1-1 = A:1
            // The merges are independent of the data.
            // A merge will overwrite all data _not_ in the top-left cell.
            const merges = [
                //   { start: { row: 1, column: 1 }, end: { row: 1, column: 10 } },
                //   { start: { row: 2, column: 1 }, end: { row: 2, column: 5 } },
                { start: { row: 2, column: 6 }, end: { row: 2, column: 10 } }
            ]

            // Create the excel report.
            // This function will return Buffer
            const report = excel.buildExport(
                [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
                    {
                        name: 'Report', // <- Specify sheet name (optional)
                        heading: heading, // <- Raw heading array (optional)
                        // <- Merge cell ranges
                        specification: specification, // <- Report specification
                        data: dataset // <-- Report data
                    }
                ]
            );

            // You can then return this straight
            res.attachment('report.xlsx'); // This is sails.js specific (in general you need to set headers)
            return res.send(report);




            res.send(data);
        }

            );


    })



module.exports = router;