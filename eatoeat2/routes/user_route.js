var express = require('express');
var router = express.Router();
var mongojs = require('mongojs');
var bcrypt = require('bcrypt-nodejs');
var db = mongojs('mongodb://admin:root@ds127399.mlab.com:27399/eatoeat');
//var db = mongojs('mongodb://server1.idigitie.in:27017/eatoeatoDb');

var nodemailer = require('nodemailer');
var crypto = require('crypto');
var fs = require('fs');
var dns = require('dns');
var os = require('os');
var _ = require('underscore');
const NodeCache = require("node-cache");
const myCache = new NodeCache();
var where = require("lodash.where");
const moment = require('moment');
const moment_range = require('moment-range');
const moment_r = moment_range.extendMoment(moment);
var randomstring = require("randomstring");
// var util=require('util');
var request = require('request');

const config = require('./config');

var transporter = nodemailer.createTransport({

    service: 'gmail',
    auth: {
        user: 'ankuridigitie@gmail.com',
        pass: 'ankur@123'
    }

});

var send_addr = '"EatoEato 👻" <ankuridigitie@gmail.com>';
// setup email data with unicode symbols
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

    .post('/add-user-info', function (req, res, next) {


        console.log(req.body);


        db.user_infos.find({

            phone: parseInt(req.body.user_contact_no)

        }, function (err, user_details_phone) {

            if (user_details_phone != "") {

                //res.status(409);
                console.log('email already registered');
                res.json({
                    'status': 'Phone_No Already Registered'
                });

            }
            else {

                db.user_infos.save({

                    username: req.body.user_name,
                    email: '',
                    phone: parseInt(req.body.user_contact_no),
                    password: bcrypt.hashSync(req.body.user_password, bcrypt.genSaltSync(10)),
                    joined_on: moment(new Date()).format("DD/MM/YYYY"),
                    isVerified: "false",
                    gender: '',
                    dob: '',
                    status: "active",
                    coupon_detail: [],
                    isDeactivate: "false",
                    address: []

                }, function (err, user) {

                    if (err) throw err;

                    res.send({ 'status': 'success' });

                    var to_no = parseInt(req.body.user_contact_no);
                    var message = "Dear " + req.body.user_name + " Welcome to eatoeato.com, don't forget to complete your details and enjoy ordering your food choice."

                    request("http://smsgate.idigitie.com/http-api.php?username=eatoeato&password=idid@1234&senderid=EATOET&route=1&number=" + to_no + "&message=" + message, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            console.log('SMS SEND') // Print the google web page.
                        }
                    });


                    // var template = process.cwd() + '/mailers/user-registration/after-user-registration.html';

                    // fs.readFile(template, 'utf8', function (err, file) {
                    //     if (err) {
                    //         //handle errors
                    //         console.log('ERROR!');
                    //         return res.send('ERROR!');
                    //     }

                    //     String.prototype.replaceAll = function (target, replacement) {
                    //         return this.split(target).join(replacement);
                    //     };

                    //     var email_template = file.replace("#user_name#", 'ANKUR GUPTA');
                    //     //  email_template = email_template.replaceAll("#user_email#", 'ankuridigitie@gmail.com');


                    //     var mailOptions = {
                    //         from: '"EatoEato 👻" <ankuridigitie@gmail.com>', // sender address
                    //         to: 'ankuridigitie@gmail.com', // list of receivers
                    //         subject: 'EatoEato Email Verification', // Subject line
                    //         //   text: 'Please Verify Your Email Account', // plain text body
                    //         html: email_template
                    //     };

                    //     transporter.sendMail(mailOptions, function (error, info) {
                    //         if (error) {
                    //             console.log(error);
                    //             // res.json({
                    //             //     yo: 'error'
                    //             // });
                    //         } else {
                    //             console.log('Message sent: ' + info.response);
                    //             res.send(info.response);

                    //         };
                    //     });
                    // });


                    // var mailOptions = {
                    //     from: '"EatoEato 👻" <ankuridigitie@gmail.com>', // sender address
                    //     to: req.body.user_email, // list of receivers
                    //     subject: 'Welcome To EatoEato ', // Subject line
                    //     text: 'Please Activate Your EatoEato Account', // plain text body
                    //     html: '<b>Your Account Has Been Created by, Please Click on Below Link to Verify your Account</b> <br> <a href="http://192.168.1.157:3000/#/verify-user-params/' + user._id + '">' + randomstring.generate({ length: 100, charset: 'alphabetic' }) + '</a>' // html body
                    // };

                    // transporter.sendMail(mailOptions, function (error, info) {
                    //     if (error) {
                    //         console.log(error);
                    //         res.json({
                    //             yo: 'error'
                    //         });
                    //     } else {
                    //         console.log('Message sent: ' + info.response);

                    //     };
                    // });


                    console.log(user._id);

                })

            }
        });
        //     }





        //  });



    });


router

    .get('/mailer-test', function (req, res, next) {


        // console.log('PROCESS CWD');
        // console.log(process.cwd());

        // var template = process.cwd() + '/mailers/user-registration/after-user-registration.html';

        // fs.readFile(template, 'utf8', function (err, file) {
        //     if (err) {
        //         //handle errors
        //         console.log('ERROR!');
        //         return res.send('ERROR!');
        //     }

        //     String.prototype.replaceAll = function (target, replacement) {
        //         return this.split(target).join(replacement);
        //     };

        //     var email_template = file.replace("#user_name#", 'ANKUR GUPTA');
        //     //  email_template = email_template.replaceAll("#user_email#", 'ankuridigitie@gmail.com');


        //     var mailOptions = {
        //         from: send_addr, // sender address
        //         to: 'ankuridigitie@gmail.com', // list of receivers
        //         subject: 'EatoEato Email Verification', // Subject line
        //         //   text: 'Please Verify Your Email Account', // plain text body
        //         html: email_template
        //     };

        //     transporter.sendMail(mailOptions, function (error, info) {
        //         if (error) {
        //             console.log(error);
        //             // res.json({
        //             //     yo: 'error'
        //             // });
        //         } else {
        //             console.log('Message sent: ' + info.response);
        //             res.send(info.response);

        //         };
        //     });
        // });

        db.sms_template_infos.find({

            name: 'Order Received/ User'

        }, function (err, sms_template) {

            var sms_body = sms_template[0].body;

            var email_template = sms_body.replace("^^FIRST_NAME^^", 'ANKUR GUPTA');


            res.send(email_template);


        });


        // var to_no = parseInt(fdata[0].phone);
        // var message = "Your Order Successfully placed with EatoEato, Payment Receieved Through Wallet , Your Reference Id No. is-" + id;

        // request("http://smsgate.idigitie.com/http-api.php?username=eatoeato&password=idid@1234&senderid=EATOET&route=1&number=" + to_no + "&message=" + message, function (error, response, body) {
        //     if (!error && response.statusCode == 200) {
        //         console.log('SMS SEND') // Print the google web page.
        //     }
        // })



    });


router

    .get('/user-verify/:user_id/:email', function (req, res, next) {
        // console.log(req.params['user_id']);
        // res.send('Task API');
        // res.writeHead(302, {'Location': 'http://192.168.1.101:3000/#/user_login'});
        // res.end();
        console.log('EMAIL UPDATING');
        db.user_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.params['user_id'])
            },
            update: {
                $set: {
                    isVerified: "true",
                    email: req.params['email']
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

            res.status(200);
            res.send(user);
            console.log('user Verified');
        });
    });


router

    .post('/user-login', function (req, res, next) {

        // res.send('Task API');    
        console.log(req.body);
        db.user_infos.find({

            phone: parseInt(req.body.phone),

        }, function (err, user) {



            if (err || user == "") {

                res.send({ 'status': 'unauthorized' });
            }
            else {

                if (user[0].isDeactivate == "true") {

                    res.send({ 'status': 'deactivated' });
                }
                else {

                    if (bcrypt.compareSync(req.body.password, user[0].password)) {

                        if (user[0].status == "inactive") {
                            res.status(200).send('account disabled');
                            console.log('user is inactive');
                        } else {
                            console.log(user);
                            res.send({ 'status': 'success', 'data': user });

                        }

                    } else {
                        res.send({ 'status': 'unauthorized' });

                    }

                }
            }

        });


    });

router

    .post('/send-verify-email-to-user', function (req, res, next) {


        console.log(req.body);
        var mailOptions = {
            from: '"EatoEato 👻" <ankuridigitie@gmail.com>', // sender address
            to: req.body.email, // list of receivers
            subject: 'EatoEato-Email Verification', // Subject line
            text: 'Please Verify Your Email Account', // plain text body
            html: '<b> Please Click on Below Link to Verify your Account</b> <br><br> <a href="http://148.72.248.184:3000/#/verify-user-params/' + req.body.user_id + '/' + req.body.email + '">' + randomstring.generate({ length: 100, charset: 'alphabetic' }) + '</a>' // html body
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

router

    .post('/user-contact-update', function (req, res, next) {


        db.user_infos.update({
            "_id": mongojs.ObjectId(req.body.user_id)
        },

            {
                "$set": {

                    phone: parseInt(req.body.user_contact_no),

                }




            }, function (err, data, lastErrorObject) {

                res.send({ 'status': 'success' });

            });


    });



router

    .post('/user-pass-update', function (req, res, next) {


        console.log(req.body);
        var flag = false;
        db.user_infos.find({
            _id: mongojs.ObjectId(req.body.user_id)
        }, function (err, user) {

            if (err) {

                console.log(err);
                res.status(401);
                res.send(err);


            } else {

                if (bcrypt.compareSync(req.body.old_pass, user[0].password)) {

                    db.user_infos.findAndModify({
                        query: {
                            _id: mongojs.ObjectId(req.body.user_id)
                        },
                        update: {
                            $set: {

                                password: bcrypt.hashSync(req.body.new_pass, bcrypt.genSaltSync(10))
                            }
                        },
                        new: true
                    }, function (err, data, lastErrorObject) {
                        if (err) {

                            flag = false;
                            console.log('this is err');
                            res.send(err);

                        }
                        //    res.status(200);
                        // var arr=[];
                        // var main_obj={};
                        // var obj={};
                        // obj.message="Password Updated";
                        // obj.status="true";
                        // main_obj.result=obj;
                        res.send({ 'status': 'success' });
                        flag = true;

                    })


                } else {
                    if (flag) {
                        console.log('pass updated');
                    } else if (!flag) {
                        res.send({ 'status': 'failure' });
                        console.log('incorrect');
                    }
                    // res.status(200).send('fine');

                }

            }
        });

    });

router

    .post('/user-profile-update', function (req, res, next) {
        console.log('DATA RECIEVED');
        console.log(req.body);
        //   res.send(req.body);
        //  res.send(req.body);

        console.log('WITHOUT IMAGE')


        db.user_infos.update({
            "_id": mongojs.ObjectId(req.body.user_id)
        },

            {
                "$set": {
                    username: req.body.username,
                    dob: req.body.dob,
                    gender: req.body.gender,
                }




            }, function (err, data, lastErrorObject) {
                if (err) {

                    throw err;
                    console.log(err);

                }
                console.log(data);
                res.status(200).send({ 'status': 'Profile Updated' });
            });

        //     }


    });




router

    .post('/user-address-add', function (req, res, next) {

        var date = new Date();
        var timestamp_var = date.getTime();

        if (req.body.hasOwnProperty('address_default')) {

            db.user_infos.findAndModify(

                {
                    query: {
                        _id: mongojs.ObjectId(req.body.user_id),
                        'address.address_default': "true"
                    },
                    update: {
                        $set: {
                            'address.$.address_default': 'false'
                        }

                    },
                    new: true
                },
                function (err, data, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send('error');
                        throw err;

                    } else {

                        db.user_infos.findAndModify(

                            {
                                query: {
                                    _id: mongojs.ObjectId(req.body.user_id)
                                },
                                update: {
                                    $push: {
                                        'address': {
                                            'address_id': timestamp_var,
                                            'address_name': req.body.address_name,
                                            'address_details': req.body.address_details,
                                            'address_locality': req.body.address_locality,
                                            'address_pincode': req.body.address_pincode,
                                            'address_state': req.body.address_state,
                                            'address_city': req.body.address_city,
                                            'address_contact': req.body.address_contact,
                                            'address_type': req.body.address_type,
                                            'latitude': req.body.latitude,
                                            'longitude': req.body.longitude,
                                            'address_default': 'true'
                                        }
                                    }

                                },
                                new: true
                            },
                            function (err, data, lastErrorObject) {
                                if (err) {
                                    res.status(400);
                                    res.send('error');
                                    throw err;

                                }
                                //   res.status(200);
                                res.send({ status: 'success', data: data });

                            });



                    }


                });


        } else {


            db.user_infos.findAndModify(

                {
                    query: {
                        _id: mongojs.ObjectId(req.body.user_id)
                    },
                    update: {
                        $push: {
                            'address': {
                                'address_id': timestamp_var,
                                'address_name': req.body.address_name,
                                'address_details': req.body.address_details,
                                'address_locality': req.body.address_locality,
                                'address_pincode': req.body.address_pincode,
                                'address_state': req.body.address_state,
                                'address_city': req.body.address_city,
                                'address_contact': req.body.address_contact,
                                'address_type': req.body.address_type,
                                'latitude': req.body.latitude,
                                'longitude': req.body.longitude,
                                'address_default': 'false'
                            }
                        }

                    },
                    new: true
                },
                function (err, data, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send('error');
                        throw err;

                    }
                    //  res.status(200);
                    res.send({ status: 'success', data: data });


                });


        }

    });


router

    .post('/edit-user-address-save', function (req, res, next) {

        console.log(req.body);
        var date = new Date();
        var timestamp_var = date.getTime();

        if (Boolean(req.body.address_default) == true) {
            console.log('111');
            db.user_infos.findAndModify(

                {
                    query: {
                        _id: mongojs.ObjectId(req.body.user_id),
                        'address.address_default': "true"
                    },
                    update: {
                        $set: {
                            'address.$.address_default': 'false'
                        }

                    },
                    new: true
                },
                function (err, data, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send('error');
                        throw err;

                    } else {

                        db.user_infos.findAndModify(

                            {
                                query: {
                                    _id: mongojs.ObjectId(req.body.user_id),
                                    'address.address_id': parseInt(req.body.address_id)
                                },

                                update: {
                                    $set: {
                                        'address.$.address_default': 'true',
                                        'address.$.address_name': req.body.address_name,
                                        'address.$.address_details': req.body.address_details,
                                        'address.$.address_locality': req.body.address_locality,
                                        'address.$.address_pincode': req.body.address_pincode,
                                        'address.$.address_state': req.body.address_state,
                                        'address.$.address_city': req.body.address_city,
                                        'address.$.address_contact': req.body.address_contact,
                                        'address.$.address_type': req.body.address_type,
                                        'address.$.latitude': req.body.latitude,
                                        'address.$.longitude': req.body.longitude

                                    }


                                }
                            },
                            function (err, data, lastErrorObject) {
                                if (err) {
                                    res.status(400);
                                    res.send('error');
                                    throw err;

                                }
                                //   res.status(200);
                                res.send({ status: 'success' });

                            });



                    }


                });


        } else {

            console.log('IN 2 nd ONE');


            db.user_infos.findAndModify(

                {
                    query: {

                        _id: mongojs.ObjectId(req.body.user_id),
                        'address.address_id': parseInt(req.body.address_id)
                    },
                    update: {
                        $set: {
                            'address.$.address_default': 'false',
                            'address.$.address_name': req.body.address_name,
                            'address.$.address_details': req.body.address_details,
                            'address.$.address_locality': req.body.address_locality,
                            'address.$.address_pincode': req.body.address_pincode,
                            'address.$.address_state': req.body.address_state,
                            'address.$.address_city': req.body.address_city,
                            'address.$.address_contact': req.body.address_contact,
                            'address.$.address_type': req.body.address_type,
                            'address.$.latitude': req.body.latitude,
                            'address.$.longitude': req.body.longitude

                        }
                    },
                    new: true
                },
                function (err, data, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send('error');
                        throw err;

                    }
                    //  res.status(200);
                    res.send({ status: 'success' });


                });


        }

    });


router

    .post('/get-user-address', function (req, res, next) {

        console.log(req.body);

        db.user_infos.find({

            _id: mongojs.ObjectId(req.body.user_id)

        }, function (err, user) {


            if (err) {
                res.status(404);
                res.send('user not find');
            } else {

                res.status(200).json(user);

                console.log(user);
            }
        });
    });


router

    .post('/user-account-update', function (req, res, next) {

        console.log(req.body);
        db.user_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.body.user_id)
            },
            update: {
                $set: {
                    email: req.body.user_email,
                    phone: parseInt(req.body.user_mobile),
                }
            },
            new: true
        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                throw err;

            }
            res.status(200);
            res.send({ 'status': 'Account Updated' });
            console.log('user PROFILE UPDATED');
        })
    });




router
    .post('/user-account-deactivate', function (req, res, next) {

        console.log(req.body);


        db.user_infos.find({

            _id: mongojs.ObjectId(req.body.user_id),

            phone: parseInt(req.body.user_contact)
        }, function (err, user) {


            if (err || user == "") {

                res.send({ status: 'invalid contact' });
            } else {

                console.log(user);

                if (bcrypt.compareSync(req.body.user_pass, user[0].password)) {
                    db.user_infos.findAndModify({
                        query: {
                            _id: mongojs.ObjectId(req.body.user_id),


                        },
                        update: {
                            $set: {

                                isDeactivate: "true",
                                status: "Inactive"
                            }
                        },
                        new: true
                    }, function (err, data, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send('error');

                            throw err;

                        }

                        console.log('Accout Deactivated');
                        res.send({ status: 'success' });

                    });

                } else {

                    res.send({ status: 'invalid password' });

                }
            }

        });


    });


router
    .post('/user-profile-image-upload', function (req, res, next) {



        // dns.lookup(os.hostname(), function (err, add, fam) {
        //   console.log('addr: '+add);
        // })

        var date = new Date();
        var current_hour = date.getTime();

        var user_id = req.body.user_id;

        var image_name = '192.168.1.157:3000' + '/uploads/' + current_hour + '.jpg';

        fs.writeFile("client/uploads/" + current_hour + ".jpg", new Buffer(req.body.files, "base64"), function (err) {

            if (err) {

                throw err;
            } else {

                db.user_infos.findAndModify({
                    query: {
                        _id: mongojs.ObjectId(req.body.user_id)
                    },
                    update: {
                        $set: {
                            user_profile_image: image_name

                        }
                    },
                    new: true
                }, function (err, data, lastErrorObject) {
                    if (err) {
                        res.status(400);
                        res.send('error');
                        throw err;

                    }
                    res.status(200);
                    res.send('User PROFILE IMAGE UPDATED');
                    console.log('User PROFILE IMAGE UPDATED');
                })
                // res.send("success");
                // console.log("success!");
            }

        });

    });

//Getting Details for Logged in users

router
    .post('/get-user-details', function (req, res, next) {

        db.user_infos.find({
            _id: mongojs.ObjectId(req.body.user_id),
        }, function (err, user) {

            if (err || user == "") {
                res.status(404);
                res.send('No user Found');
            } else {

                console.log(user);
                res.status(200).send(user[0]);

            }
        });

    });


router
    .post('/forget-user-password', function (req, res, next) {

        console.log(req.body);
        db.user_infos.find({
            email: req.body.user_email,
        }, function (err, user) {

            if (err || user == "") {
                res.status(404);
                res.send('Email Not Found');
            } else {

                var mailOptions = {
                    from: '"EatoEato 👻" <ankuridigitie@gmail.com>', // sender address
                    to: req.body.user_email, // list of receivers
                    subject: 'EatoEato Password Reset', // Subject line
                    text: 'Resetting your EatoEato Password', // plain text body
                    html: '<b> Please Click on Below Link to Reset your Account Password</b> <br><br><br> <a href="http://148.72.248.184:3000/#/user_login' + user._id + '">' + randomValueHex(100) + '</a>' // html body
                };

                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                        res.json({
                            yo: 'error'
                        });
                    } else {
                        console.log('Message sent: ' + info.response);
                        res.json({
                            'status': 'Email Correct',
                            'info': 'Email Sent'
                        });

                    };
                });



            }
        });

    });

router
    .post('/delete-user-address', function (req, res, next) {

        console.log(req.body);

        db.user_infos.findAndModify({
            query: {
                _id: mongojs.ObjectId(req.body.user_id)
            },
            update: {
                $pull: {
                    'address': {
                        'address_id': parseInt(req.body.address_id)
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
            res.status(200).send({ 'status': 'deleted' });

        });
    });

router
    .post('/edit-user-address-fetch', function (req, res, next) {

        console.log(req.body);

        db.user_infos.find(
            {
                'address.address_id': parseInt(req.body.address_id)
            },
            { 'address.$': 1, _id: 0 }

            , function (err, useraddr, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');
                    throw err;

                }
                console.log(useraddr);
                res.send({ 'data': useraddr });

            });

    });

var bulk = db.filter_infos.initializeOrderedBulkOp();
// FOR DATE LISTING

router
    .post('/get-cook-listing-by-date', function (req, res, next) {

        console.log("FILTER BY DATE");
        console.log(req.body);   // THIS IS THE USER LATITUDE AND LONGITUDE



        var listing = [];
        var count = 0;
        var filter_cuisine = [];
        var filter_cuisine_obj = [];

        var filter_occ = [];
        var filter_occ_obj = [];

        var total_cuisine = 0;
        var total_occ = 0;

        var veg_type = [];
        var meal_type = [];

        var price_list = [];
        var price_data = {};

        var time_list = [];
        var time_data = {};

        var filter = {};

        db.cook_infos.find({ isApproved: 'Approved' }, {
            'food_details': 1,
            _id: 0,
            cook_latitude: 1,
            cook_longitude: 1,
            cook_company_name: 1,
            delivery_by: 1,
            isDeactivate: 1,
        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                console.log(err);

                throw err;

            }


            console.log('FINAL DATA');
            console.log(data);

            var i, j;




            var lt, lt1, ln, ln1, dLat, dLon, a;
            var cook_final_list_coll = [];

            // FINDING ALL COOKS WITHIN USER range

            for (i = 0; i < data.length; i++) {

                if (data[i].food_details.length > 0) {



                    lt = parseFloat(req.body.lat);   // this is User lat
                    lt1 = data[i].cook_latitude;  // this is Cook lat

                    ln = parseFloat(req.body.long);    // this is User long
                    ln1 = data[i].cook_longitude;  // this is Cook long

                    dLat = (lt - lt1) * Math.PI / 180;
                    dLon = (ln - ln1) * Math.PI / 180;
                    a = 0.5 - Math.cos(dLat) / 2 + Math.cos(lt1 * Math.PI / 180) * Math.cos(lt * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;
                    d = Math.round(6371000 * 2 * Math.asin(Math.sqrt(a)));



                    if (d <= 3000) {

                        cook_final_list_coll.push(data[i]);

                    }


                }



            }



            var maxDate, minDate, dd, isValidDate;
            var range, pos;
            var dates = [];
            var date_range_false_id = [];
            function stringToDate(_date, _format, _delimiter) {
                var formatLowerCase = _format.toLowerCase();
                var formatItems = formatLowerCase.split(_delimiter);
                var dateItems = _date.split(_delimiter);
                var monthIndex = formatItems.indexOf("mm");
                var dayIndex = formatItems.indexOf("dd");
                var yearIndex = formatItems.indexOf("yyyy");
                var month = parseInt(dateItems[monthIndex]);
                month -= 1;
                var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
                return formatedDate;
            }


            for (var i = 0; i < cook_final_list_coll.length; i++) {

                for (var j = 0; j < cook_final_list_coll[i].food_details.length; j++) {
                    dates = [];
                    dates.push(new Date(stringToDate(cook_final_list_coll[i].food_details[j].selected_date_from, "dd-MM-yyyy", "-")));
                    dates.push(new Date(stringToDate(cook_final_list_coll[i].food_details[j].selected_date_to, "dd-MM-yyyy", "-")));


                    maxDate = new Date(Math.max.apply(null, dates));
                    minDate = new Date(Math.min.apply(null, dates));


                    range = moment_r.range(minDate, maxDate);

                    dd = moment(new Date(stringToDate(req.body.date, "dd-MM-yyyy", "-")));  // THIS IS CURRENT DATE

                    console.log('CURRENT DAY');
                    console.log(dd);
                    isValidDate = dd.within(range);



                    if (isValidDate == false) {

                        //  cook_final_list_coll.splice(i,1);
                        //   console.log('INAVLID RANGE-'+cook_final_list_coll[i].food_details[j].food_name);
                        date_range_false_id.push(cook_final_list_coll[i].food_details[j]._id);
                    }
                    if (isValidDate == true) {

                        // console.log('VALID RANGE');  
                    }


                }

            }   // END



            // COLLECT ALL COOK LATITUDE AND LONGITUDE

            var lat_long_coll = [];
            var lat_long_obj = {};

            // COLLECT ALL COOK LATITUDE AND LONGITUDE

            // PREPARING LIST OF ALL FOODS DETAIL WHO HAS APPROVED BY ADMIN ONLY

            for (var i = 0; i < cook_final_list_coll.length; i++) {

                for (var j = 0; j < cook_final_list_coll[i].food_details.length; j++) {

                    if (cook_final_list_coll[i].food_details[j].food_isApproved == 'Approved' && cook_final_list_coll[i].food_details[j].food_status == 'Enable' && cook_final_list_coll[i].isDeactivate == 'false') {

                        lat_long_obj = {};
                        lat_long_obj.cook_latitude = cook_final_list_coll[i].cook_latitude;
                        lat_long_obj.cook_longitude = cook_final_list_coll[i].cook_longitude;

                        lat_long_coll.push(lat_long_obj);
                        listing[count] = cook_final_list_coll[i].food_details[j];
                        listing[count].delivery_by = cook_final_list_coll[i].delivery_by;
                        listing[count].brand_name = cook_final_list_coll[i].cook_company_name;

                        count++;
                    }



                }


            }  //END

            // REMOVING LISTING FOOD IF DATE RANGE false

            if (date_range_false_id.length > 0) {


                for (var i = 0; i < date_range_false_id.length; i++) {

                    for (var j = 0; j < listing.length; j++) {

                        if (date_range_false_id[i] == listing[j]._id) {

                            listing.splice(j, 1);

                        }
                    }


                }



            }


            // END

            var c = 0;
            for (var i = 0; i < listing.length; i++) {

                for (j = 0; j < listing[i].cuisine_list.length; j++) {

                    if (listing[i].cuisine_list[j].status == 'true' && filter_cuisine.indexOf(listing[i].cuisine_list[j].category_name) < 0) {

                        filter_cuisine.push(listing[i].cuisine_list[j].category_name);
                        filter_cuisine_obj[c] = listing[i].cuisine_list[j];
                        c++;
                        // filter.filter_cuisine=filter_cuisine;
                        //    total_cuisine++;
                        // filter.total_cuisine=total_cuisine;



                    }

                }
            }

            var o = 0;
            for (var i = 0; i < listing.length; i++) {

                for (j = 0; j < listing[i].occassion_list.length; j++) {

                    if (listing[i].occassion_list[j].status == 'true' && filter_occ.indexOf(listing[i].occassion_list[j].group_attr) < 0) {

                        filter_occ.push(listing[i].occassion_list[j].group_attr);
                        filter_occ_obj[o] = listing[i].occassion_list[j];
                        o++;
                        // filter.filter_cuisine=filter_cuisine;
                        //    total_cuisine++;
                        // filter.total_cuisine=total_cuisine;



                    }

                }
            }
            var i, j;
            for (i = 0; i < listing.length; i++) {

                if (veg_type.length < 1) {

                    veg_type.push({
                        'veg_type': listing[i].food_type
                    });

                } else {



                    for (j = 0; j < veg_type.length; j++) {

                        if (veg_type[j].veg_type == listing[i].food_type) {
                            break;
                        } else {
                            veg_type.push({
                                'veg_type': listing[i].food_type
                            });
                        }

                    }
                }

            }

            for (i = 0; i < listing.length; i++) {


                price_list.push(parseInt(listing[i].food_price_per_plate));
            }

            var min = Math.min.apply(null, price_list);
            var max = Math.max.apply(null, price_list);

            price_data.min_price = min;
            price_data.max_price = max;




            filter.listing = listing;
            filter.cuisine_list = filter_cuisine_obj;
            filter.occasion_list = filter_occ_obj;
            filter.veg_type = veg_type;
            filter.price_data = price_data;
            filter.time_data = time_data;
            filter.food_count = listing.length;
            filter.lat_long_coll = lat_long_coll;
            // myCache.set("myKey", listing, 0, function (err, success) {
            //     if (!err && success) {

            //         // true
            //         // ... do something ...
            //     }
            // });



            // db.filter_infos.remove({ 'user_long': req.body.long }, function (err, data) {


            //     //     console.log('DELETED');

            // });


            // bulk.find( {  user_lat: req.body.lat,
            //     user_long: req.body.long } ).remove(function(err,rdata){

            //             console.log('r remoe');
            //             console.log(rdata);
            //     });

            db.filter_infos.remove({

                user_lat: parseFloat(req.body.lat),
                user_long: parseFloat(req.body.long)

            }, function (err, data) {

                console.log('REMOVED MANY');
                res.status(200).send(filter);
                db.filter_infos.find({

                    user_lat: parseFloat(req.body.lat),
                    user_long: parseFloat(req.body.long)

                }, function (err, data) {

                    if (data.length < 1) {

                        console.log('EMpty');


                        for (var i = 0; i < listing.length; i++) {

                            db.filter_infos.save({

                                food_listing: listing[i],
                                user_lat: parseFloat(req.body.lat),
                                user_long: parseFloat(req.body.long),

                                cuisine_list: filter.cuisine_list,
                                occasion_list: filter.occasion_list,
                                veg_type: filter.veg_type,
                                price_data: filter.price_data,
                                time_data: filter.time_data,
                                food_count: filter.food_count,
                                lat_long_coll: filter.lat_long_coll,

                            }, function (err, data, lastErrorObject) {
                                if (err) {
                                    res.status(400);
                                    res.send('error');
                                    throw err;


                                }


                            });
                        }


                    }
                    if (data.length > 0) {


                    }
                });
            });





        });
    });




router
    .post('/get-listing-foods', function (req, res, next) {

        console.log('LISTING FOODS');
        console.log(req.body);   // THIS IS THE USER LATITUDE AND LONGITUDE
        console.log('THIS IS CURR DAY');
        //  var dt = new Date();
        //              var curr_hour = dt.toString("HH:mm");
        //          console.log(curr_hour);


        var listing = [];
        var count = 0;
        var filter_cuisine = [];
        var filter_cuisine_obj = [];

        var filter_occ = [];
        var filter_occ_obj = [];

        var total_cuisine = 0;
        var total_occ = 0;

        var veg_type = [];
        var meal_type = [];

        var price_list = [];
        var price_data = {};

        var time_list = [];
        var time_data = {};

        var filter = {};

        db.cook_infos.find({ isApproved: 'Approved' }, {
            'food_details': 1,
            _id: 0,
            cook_latitude: 1,
            cook_longitude: 1,
            cook_company_name: 1,
            delivery_by: 1,
            isDeactivate: 1
        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                console.log(err);

                throw err;

            }



            var i, j;




            var lt, lt1, ln, ln1, dLat, dLon, a;
            var cook_final_list_coll = [];

            // FINDING ALL COOKS WITHIN USER range

            for (i = 0; i < data.length; i++) {

                if (data[i].food_details.length > 0) {



                    lt = parseFloat(req.body.lat);   // this is User lat
                    lt1 = data[i].cook_latitude;  // this is Cook lat

                    ln = parseFloat(req.body.long);    // this is User long
                    ln1 = data[i].cook_longitude;  // this is Cook long

                    dLat = (lt - lt1) * Math.PI / 180;
                    dLon = (ln - ln1) * Math.PI / 180;
                    a = 0.5 - Math.cos(dLat) / 2 + Math.cos(lt1 * Math.PI / 180) * Math.cos(lt * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;
                    d = Math.round(6371000 * 2 * Math.asin(Math.sqrt(a)));



                    if (d <= 3000) {

                        cook_final_list_coll.push(data[i]);

                    }


                }



            }


            console.log(cook_final_list_coll);
            var maxDate, minDate, dd, isValidDate;
            var range, pos;
            var dates = [];
            var date_range_false_id = [];
            function stringToDate(_date, _format, _delimiter) {
                var formatLowerCase = _format.toLowerCase();
                var formatItems = formatLowerCase.split(_delimiter);
                var dateItems = _date.split(_delimiter);
                var monthIndex = formatItems.indexOf("mm");
                var dayIndex = formatItems.indexOf("dd");
                var yearIndex = formatItems.indexOf("yyyy");
                var month = parseInt(dateItems[monthIndex]);
                month -= 1;
                var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
                return formatedDate;
            }


            for (var i = 0; i < cook_final_list_coll.length; i++) {

                for (var j = 0; j < cook_final_list_coll[i].food_details.length; j++) {
                    dates = [];
                    dates.push(new Date(stringToDate(cook_final_list_coll[i].food_details[j].selected_date_from, "dd-MM-yyyy", "-")));
                    dates.push(new Date(stringToDate(cook_final_list_coll[i].food_details[j].selected_date_to, "dd-MM-yyyy", "-")));


                    maxDate = new Date(Math.max.apply(null, dates));
                    minDate = new Date(Math.min.apply(null, dates));
                    //minDate=minDate.subtract(1,'d');
                    minDate.setDate(minDate.getDate() - 1);
                    maxDate.setDate(maxDate.getDate() + 1);


                    range = moment_r.range(minDate, maxDate);

                    dd = moment();  // THIS IS CURRENT DATE
                    isValidDate = dd.within(range);


                    if (isValidDate == false) {

                        //  cook_final_list_coll.splice(i,1);
                        //   console.log('INAVLID RANGE-'+cook_final_list_coll[i].food_details[j].food_name);
                        date_range_false_id.push(cook_final_list_coll[i].food_details[j]._id);
                    }
                    if (isValidDate == true) {

                        // console.log('VALID RANGE');
                    }


                }

            }   // END



            // COLLECT ALL COOK LATITUDE AND LONGITUDE

            var lat_long_coll = [];
            var lat_long_obj = {};

            // COLLECT ALL COOK LATITUDE AND LONGITUDE

            // PREPARING LIST OF ALL FOODS DETAIL WHO HAS APPROVED BY ADMIN ONLY

            for (var i = 0; i < cook_final_list_coll.length; i++) {

                for (var j = 0; j < cook_final_list_coll[i].food_details.length; j++) {

                    if (cook_final_list_coll[i].food_details[j].food_isApproved == 'Approved' && cook_final_list_coll[i].food_details[j].food_status == 'Enable' && cook_final_list_coll[i].isDeactivate == 'false') {

                        lat_long_obj = {};
                        lat_long_obj.cook_latitude = cook_final_list_coll[i].cook_latitude;
                        lat_long_obj.cook_longitude = cook_final_list_coll[i].cook_longitude;

                        lat_long_coll.push(lat_long_obj);
                        cook_final_list_coll[i].food_details[j].delivery_by = cook_final_list_coll[i].delivery_by;
                        cook_final_list_coll[i].food_details[j].brand_name = cook_final_list_coll[i].cook_company_name;

                        listing[count] = cook_final_list_coll[i].food_details[j];


                        count++;
                    }



                }


                // filter.listing=listing;
                //   console.log(listing);

            }  //END

            // REMOVING LISTING FOOD IF DATE RANGE false

            if (date_range_false_id.length > 0) {


                for (var i = 0; i < date_range_false_id.length; i++) {

                    for (var j = 0; j < listing.length; j++) {

                        if (date_range_false_id[i] == listing[j]._id) {

                            listing.splice(j, 1);

                        }
                    }


                }



            }

            // END

            var c = 0;
            for (var i = 0; i < listing.length; i++) {

                for (j = 0; j < listing[i].cuisine_list.length; j++) {

                    if (listing[i].cuisine_list[j].status == 'true' && filter_cuisine.indexOf(listing[i].cuisine_list[j].category_name) < 0) {

                        filter_cuisine.push(listing[i].cuisine_list[j].category_name);
                        filter_cuisine_obj[c] = listing[i].cuisine_list[j];
                        c++;
                        // filter.filter_cuisine=filter_cuisine;
                        //    total_cuisine++;
                        // filter.total_cuisine=total_cuisine;



                    }

                }
            }

            var o = 0;
            for (var i = 0; i < listing.length; i++) {

                for (j = 0; j < listing[i].occassion_list.length; j++) {

                    if (listing[i].occassion_list[j].status == 'true' && filter_occ.indexOf(listing[i].occassion_list[j].group_attr) < 0) {

                        filter_occ.push(listing[i].occassion_list[j].group_attr);
                        filter_occ_obj[o] = listing[i].occassion_list[j];
                        o++;
                        // filter.filter_cuisine=filter_cuisine;
                        //    total_cuisine++;
                        // filter.total_cuisine=total_cuisine;



                    }

                }
            }
            var i, j;
            for (i = 0; i < listing.length; i++) {

                if (veg_type.length < 1) {

                    veg_type.push({
                        'veg_type': listing[i].food_type
                    });

                } else {



                    for (j = 0; j < veg_type.length; j++) {

                        if (veg_type[j].veg_type == listing[i].food_type) {
                            break;
                        } else {
                            veg_type.push({
                                'veg_type': listing[i].food_type
                            });
                        }

                    }
                }

            }

            for (i = 0; i < listing.length; i++) {


                price_list.push(parseInt(listing[i].food_price_per_plate));
            }

            var min = Math.min.apply(null, price_list);
            var max = Math.max.apply(null, price_list);

            price_data.min_price = min;
            price_data.max_price = max;


            filter.listing = listing;

            filter.cuisine_list = filter_cuisine_obj;
            filter.occasion_list = filter_occ_obj;
            filter.veg_type = veg_type;
            filter.price_data = price_data;
            filter.time_data = time_data;
            filter.food_count = listing.length;
            filter.lat_long_coll = lat_long_coll;




            db.filter_infos.remove({

                user_lat: parseFloat(req.body.lat),
                user_long: parseFloat(req.body.long)

            }, function (err, data) {

                console.log('REMOVED MANY');
                db.filter_infos.find({

                    user_lat: parseFloat(req.body.lat),
                    user_long: parseFloat(req.body.long)

                }, function (err, data) {

                    if (data.length < 1) {

                        console.log('EMpty F');


                        for (var i = 0; i < listing.length; i++) {

                            db.filter_infos.save({

                                food_listing: listing[i],
                                user_lat: parseFloat(req.body.lat),
                                user_long: parseFloat(req.body.long),

                                cuisine_list: filter_cuisine_obj,
                                occasion_list: filter_occ_obj,
                                veg_type: veg_type,
                                price_data: price_data,
                                time_data: time_data,
                                food_count: listing.length,
                                lat_long_coll: lat_long_coll,

                            }, function (err, data, lastErrorObject) {
                                if (err) {
                                    res.status(400);
                                    res.send('error');
                                    throw err;

                                }


                            });
                        }


                    }
                    if (data.length > 0) {


                    }
                });
            });



            // db.filter_infos.find({


            //     user_lat: parseFloat(req.body.lat),
            //     user_long: parseFloat(req.body.long)

            // }, function (err, data) {

            //     if (data.length < 1) {

            //         console.log('EMpty');


            //         for (var i = 0; i < listing.length; i++) {

            //             db.filter_infos.save({

            //                 food_listing: listing[i],
            //                 cuisine_list: filter_cuisine_obj,
            //                 occasion_list: filter_occ_obj,
            //                 veg_type: veg_type,
            //                 price_data: price_data,
            //                 time_data: time_data,
            //                 food_count: listing.length,
            //                 lat_long_coll: lat_long_coll,
            //                 user_lat: parseFloat(req.body.lat),
            //                 user_long: parseFloat(req.body.long)

            //             }, function (err, data, lastErrorObject) {
            //                 if (err) {
            //                     res.status(400);
            //                     res.send('error');
            //                     throw err;

            //                 }

            //                 console.log('F SAVED');


            //             });
            //         }


            //     }
            //     if (data.length > 0) {

            //         console.log('Already Have')
            //     }
            // });

            // myCache.set("myKey", listing, 0, function (err, success) {
            //     if (!err && success) {

            //         // true
            //         // ... do something ...
            //     }
            // });


            res.status(200).send(filter);

        });
    });



// router
//     .post('/get-listing-foods', function (req, res, next) {

//         console.log('LISTING FOODS');
//         console.log('THIS IS CURRENT DATE');
//          var dt = new Date();
//             var curr_hour = dt.getHours();
//         console.log(curr_hour);
//         console.log(req.body);   // THIS IS THE USER LATITUDE AND LONGITUDE
// // NOTE PENDING:- For Time Filters We Have To Calculate min time and max time acc to today day (using current day )


//         var listing = [];
//         var count = 0;
//         var filter_cuisine = [];
//         var filter_cuisine_obj = [];

//         var filter_occ = [];
//         var filter_occ_obj = [];

//         var total_cuisine = 0;
//         var total_occ = 0;

//         var veg_type = [];
//         var meal_type = [];

//         var price_list = [];
//         var price_data = {};

//         var time_list = [];
//         var time_data = {};

//         var filter = {};

//         db.cook_infos.find({ isApproved: 'Approved' }, {
//             'food_details': 1,
//             _id: 0,
//             cook_latitude: 1,
//             cook_longitude: 1
//         }, function (err, data, lastErrorObject) {
//             if (err) {
//                 res.status(400);
//                 res.send('error');
//                 console.log(err);

//                 throw err;

//             }



//             var i, j;




//             var lt, lt1, ln, ln1, dLat, dLon, a;
//             var cook_final_list_coll = [];

//             // FINDING ALL COOKS WITHIN USER range

//             for (i = 0; i < data.length; i++) {

//                 if (data[i].food_details.length > 0) {



//                     lt = req.body.lat;   // this is User lat
//                     lt1 = data[i].cook_latitude;  // this is Cook lat

//                     ln = req.body.long;    // this is User long
//                     ln1 = data[i].cook_longitude;  // this is Cook long

//                     dLat = (lt - lt1) * Math.PI / 180;
//                     dLon = (ln - ln1) * Math.PI / 180;
//                     a = 0.5 - Math.cos(dLat) / 2 + Math.cos(lt1 * Math.PI / 180) * Math.cos(lt * Math.PI / 180) * (1 - Math.cos(dLon)) / 2;
//                     d = Math.round(6371000 * 2 * Math.asin(Math.sqrt(a)));



//                     if (d <= 3000) {

//                         cook_final_list_coll.push(data[i]);

//                     }


//                 }



//             }



//             var maxDate, minDate, dd, isValidDate;
//             var range, pos;
//             var dates = [];
//             var date_range_false_id = [];
//             function stringToDate(_date, _format, _delimiter) {
//                 var formatLowerCase = _format.toLowerCase();
//                 var formatItems = formatLowerCase.split(_delimiter);
//                 var dateItems = _date.split(_delimiter);
//                 var monthIndex = formatItems.indexOf("mm");
//                 var dayIndex = formatItems.indexOf("dd");
//                 var yearIndex = formatItems.indexOf("yyyy");
//                 var month = parseInt(dateItems[monthIndex]);
//                 month -= 1;
//                 var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
//                 return formatedDate;
//             }


//             for (var i = 0; i < cook_final_list_coll.length; i++) {

//                 for (var j = 0; j < cook_final_list_coll[i].food_details.length; j++) {
//                     dates = [];
//                     dates.push(new Date(stringToDate(cook_final_list_coll[i].food_details[j].selected_date_from, "dd-MM-yyyy", "-")));
//                     dates.push(new Date(stringToDate(cook_final_list_coll[i].food_details[j].selected_date_to, "dd-MM-yyyy", "-")));


//                     maxDate = new Date(Math.max.apply(null, dates));
//                     minDate = new Date(Math.min.apply(null, dates));

//                     range = moment_r.range(minDate, maxDate);

//                     dd = moment();  // THIS IS CURRENT DATE
//                     isValidDate = dd.within(range);


//                     if (isValidDate == false) {

//                         //  cook_final_list_coll.splice(i,1);
//                         //   console.log('INAVLID RANGE-'+cook_final_list_coll[i].food_details[j].food_name);
//                         date_range_false_id.push(cook_final_list_coll[i].food_details[j]._id);
//                     }
//                     if (isValidDate == true) {

//                         // console.log('VALID RANGE');
//                     }


//                 }

//             }   // END



//             // COLLECT ALL COOK LATITUDE AND LONGITUDE

//             var lat_long_coll = [];
//             var lat_long_obj = {};

//             // COLLECT ALL COOK LATITUDE AND LONGITUDE

//             // PREPARING LIST OF ALL FOODS DETAIL WHO HAS APPROVED BY ADMIN ONLY
//             var dt = new Date();
//             var curr_hour = dt.getHours();
//             var cur_ampm = (curr_hour >= 12) ? "PM" : "AM";

//             var db_from_am_pm;
//             var db_to_am_pm;
//             var db_time_from;
//             var db_time_to;
//     console.log("THIS IS CURR HOUR BEFORE");
//                             console.log(curr_hour);
//             var curr_day_for_match = dt.toString().toLowerCase().substring(0, 3) + "_from";
//             var curr_day_for_match_to = dt.toString().toLowerCase().substring(0, 3) + "_to";

//             // if (cur_ampm == "PM" && curr_hour != 12) {
//             //     console.log('THIS IS HOUR CHECK');
//             //     curr_hour = curr_hour + 12;

//             // }
//              console.log("THIS IS CURR HOUR 111");
//                             console.log(curr_hour);
//             for (var i = 0; i < cook_final_list_coll.length; i++) {

//                 for (var j = 0; j < cook_final_list_coll[i].food_details.length; j++) {

//                     if (cook_final_list_coll[i].food_details[j].food_isApproved == 'Approved' && cook_final_list_coll[i].food_details[j].available_hours[curr_day_for_match] != "") {


//                         db_from_am_pm = cook_final_list_coll[i].food_details[j].available_hours[curr_day_for_match].substr(cook_final_list_coll[i].food_details[j].available_hours[curr_day_for_match].length - 2)
//                         db_to_am_pm = cook_final_list_coll[i].food_details[j].available_hours[curr_day_for_match_to].substr(cook_final_list_coll[i].food_details[j].available_hours[curr_day_for_match_to].length - 2)
//                         db_time_from = parseInt(cook_final_list_coll[i].food_details[j].available_hours[curr_day_for_match].substr(0, 2));
//                         db_time_to = parseInt(cook_final_list_coll[i].food_details[j].available_hours[curr_day_for_match_to].substr(0, 2));

//                         if (db_from_am_pm == "PM" && db_time_from !=12) {
//                             db_time_from = db_time_from + 12;
//                         }
//                         if (db_to_am_pm == "PM" && db_time_to !=12 ) {
//                             db_time_to = db_time_to + 12;
//                         }


//                         if (db_time_from <= curr_hour && db_time_to >= curr_hour) {

//                             console.log('THIS CURR DB AM PM FROM');
//                             console.log(db_time_from);
//                             console.log(db_time_to);
//                             console.log("THIS IS CURR HOUR");
//                             console.log(curr_hour);


//                             lat_long_obj = {};
//                             lat_long_obj.cook_latitude = cook_final_list_coll[i].cook_latitude;
//                             lat_long_obj.cook_longitude = cook_final_list_coll[i].cook_longitude;

//                             lat_long_coll.push(lat_long_obj);
//                             listing[count] = cook_final_list_coll[i].food_details[j];   // THIS  IS FINAL LISTING


//                             count++;

//                         }


//                     }



//                 }


//                 // filter.listing=listing;
//                 //   console.log(listing);

//             }  //END

//             // REMOVING LISTING FOOD IF DATE RANGE false

//             if (date_range_false_id.length > 0) {


//                 for (var i = 0; i < date_range_false_id.length; i++) {

//                     for (var j = 0; j < listing.length; j++) {

//                         if (date_range_false_id[i] == listing[j]._id) {

//                             listing.splice(j, 1);

//                         }
//                     }


//                 }



//             }

//             // END

//             var c = 0;
//             for (var i = 0; i < listing.length; i++) {

//                 for (j = 0; j < listing[i].cuisine_list.length; j++) {

//                     if (listing[i].cuisine_list[j].status == 'true' && filter_cuisine.indexOf(listing[i].cuisine_list[j].category_name) < 0) {

//                         filter_cuisine.push(listing[i].cuisine_list[j].category_name);
//                         filter_cuisine_obj[c] = listing[i].cuisine_list[j];
//                         c++;
//                         // filter.filter_cuisine=filter_cuisine;
//                         //    total_cuisine++;
//                         // filter.total_cuisine=total_cuisine;



//                     }

//                 }
//             }

//             var o = 0;
//             for (var i = 0; i < listing.length; i++) {

//                 for (j = 0; j < listing[i].occassion_list.length; j++) {

//                     if (listing[i].occassion_list[j].status == 'true' && filter_occ.indexOf(listing[i].occassion_list[j].group_attr) < 0) {

//                         filter_occ.push(listing[i].occassion_list[j].group_attr);
//                         filter_occ_obj[o] = listing[i].occassion_list[j];
//                         o++;
//                         // filter.filter_cuisine=filter_cuisine;
//                         //    total_cuisine++;
//                         // filter.total_cuisine=total_cuisine;



//                     }

//                 }
//             }
//             var i, j;
//             for (i = 0; i < listing.length; i++) {

//                 if (veg_type.length < 1) {

//                     veg_type.push({
//                         'veg_type': listing[i].food_type
//                     });

//                 } else {



//                     for (j = 0; j < veg_type.length; j++) {

//                         if (veg_type[j].veg_type == listing[i].food_type) {
//                             break;
//                         } else {
//                             veg_type.push({
//                                 'veg_type': listing[i].food_type
//                             });
//                         }

//                     }
//                 }

//             }

//             for (i = 0; i < listing.length; i++) {


//                 price_list.push(parseInt(listing[i].food_price_per_plate));
//             }

//             var min = Math.min.apply(null, price_list);
//             var max = Math.max.apply(null, price_list);

//             price_data.min_price = min;
//             price_data.max_price = max;


//             //For Getting min hours and max hours


//             var temp_time;
//             var temp_fist_two;
//             var temp_last_two;
//             var am_pm;

//             for (i = 0; i < listing.length; i++) {


//                 if (listing[i].available_hours.hasOwnProperty('sun_from') && listing[i].available_hours.sun_from != "") {


//                     temp_fist_two = listing[i].available_hours.sun_from.slice(0, 2);
//                     temp_last_two = listing[i].available_hours.sun_from;
//                     am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)

//                     if (am_pm == "PM") {

//                         temp_time = parseInt(listing[i].available_hours.sun_from.slice(0, 2)) + 12;
//                         time_list.push(temp_time);

//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.sun_from.slice(0, 2)));
//                     }
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));


//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));
//                     //  time_list.push(parseInt(listing[i].available_hours.sun_from.slice(0, 2)));
//                 }
//                 if (listing[i].available_hours.hasOwnProperty('mon_from') && listing[i].available_hours.mon_from != "") {

//                     temp_fist_two = listing[i].available_hours.mon_from.slice(0, 2);
//                     temp_last_two = listing[i].available_hours.mon_from

//                     if (temp_last_two == "PM") {

//                         temp_time = parseInt(listing[i].available_hours.mon_from.slice(0, 2)) + 12;
//                         time_list.push(temp_time);
//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.mon_from.slice(0, 2)));
//                     }
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));

//                 }
//                 if (listing[i].available_hours.hasOwnProperty('tue_from') && listing[i].available_hours.tue_from != "") {

//                     temp_fist_two = listing[i].available_hours.tue_from.slice(0, 2);
//                     temp_last_two = listing[i].available_hours.tue_from;
//                     am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1);

//                     if (am_pm == "PM") {

//                         temp_time = parseInt(listing[i].available_hours.tue_from.slice(0, 2)) + 12;
//                         time_list.push(temp_time);
//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.tue_from.slice(0, 2)));
//                     }
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));

//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));
//                     //  time_list.push(parseInt(listing[i].available_hours.tue_from.slice(0, 2)));
//                 }
//                 if (listing[i].available_hours.hasOwnProperty('wed_from') && listing[i].available_hours.wed_from != "") {

//                     temp_fist_two = listing[i].available_hours.wed_from.slice(0, 2);
//                     temp_last_two = listing[i].available_hours.wed_from;
//                     am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)
//                     if (am_pm == "PM") {

//                         temp_time = parseInt(listing[i].available_hours.wed_from.slice(0, 2)) + 12;
//                         time_list.push(temp_time);
//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.wed_from.slice(0, 2)));
//                     }
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));
//                     time_list.push(temp_time);
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));
//                     // time_list.push(parseInt(listing[i].available_hours.wed_from.slice(0, 2)));
//                 }
//                 if (listing[i].available_hours.hasOwnProperty('thu_from') && listing[i].available_hours.thu_from != "") {

//                     temp_fist_two = listing[i].available_hours.thu_from.slice(0, 2);
//                     temp_last_two = listing[i].available_hours.thu_from;
//                     am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)
//                     if (am_pm == "PM") {

//                         temp_time = parseInt(listing[i].available_hours.thu_from.slice(0, 2)) + 12;
//                         time_list.push(temp_time);
//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.thu_from.slice(0, 2)));
//                     }
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));

//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));
//                     // time_list.push(parseInt(listing[i].available_hours.thu_from.slice(0, 2)));
//                 }
//                 if (listing[i].available_hours.hasOwnProperty('fri_from') && listing[i].available_hours.fri_from != "") {

//                     temp_fist_two = listing[i].available_hours.fri_from.slice(0, 2);
//                     temp_last_two = listing[i].available_hours.fri_from;
//                     am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)
//                     if (am_pm == "PM") {

//                         temp_time = parseInt(listing[i].available_hours.fri_from.slice(0, 2)) + 12;
//                         time_list.push(temp_time);
//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.fri_from.slice(0, 2)));
//                     }
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));

//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));
//                     //  time_list.push(parseInt(listing[i].available_hours.fri_from.slice(0, 2)));
//                 }
//                 if (listing[i].available_hours.hasOwnProperty('sat_from') && listing[i].available_hours.sat_from != "") {

//                     temp_fist_two = listing[i].available_hours.sat_from.slice(0, 2);
//                     temp_last_two = temp_fist_two.slice(-2);
//                     am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)
//                     if (am_pm == "PM") {

//                         temp_time = parseInt(listing[i].available_hours.sat_from.slice(0, 2)) + 12;
//                         time_list.push(temp_time);
//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.fri_from.slice(0, 2)));
//                     }
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));
//                     time_list.push(temp_time);
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));
//                     //  time_list.push(parseInt(listing[i].available_hours.sat_from.slice(0, 2)));
//                 }

//                 if (listing[i].available_hours.hasOwnProperty('sun_to') && listing[i].available_hours.sun_to != "") {

//                     temp_fist_two = listing[i].available_hours.sun_to.slice(0, 2);
//                     temp_last_two = temp_fist_two.slice(-2);
//                     am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)
//                     if (am_pm == "PM") {

//                         temp_time = parseInt(listing[i].available_hours.sun_to.slice(0, 2)) + 12;
//                         if (temp_time == 24) {
//                             temp_time = temp_time - 12;
//                         }

//                         time_list.push(temp_time);
//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.fri_from.slice(0, 2)));
//                     }
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));

//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));
//                     // time_list.push(parseInt(listing[i].available_hours.sun_to.slice(0, 2)));
//                 }
//                 if (listing[i].available_hours.hasOwnProperty('mon_to') && listing[i].available_hours.mon_to != "") {


//                     temp_fist_two = listing[i].available_hours.mon_to.slice(0, 2);
//                     temp_last_two = listing[i].available_hours.mon_to;
//                     am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)
//                     console.log(temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1));
//                     if (am_pm == "PM") {

//                         temp_time = parseInt(listing[i].available_hours.mon_to.slice(0, 2)) + 12;

//                         if (temp_time == 24) {
//                             temp_time = temp_time - 12;
//                         }

//                         time_list.push(temp_time);


//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.mon_to.slice(0, 2)));
//                     }

//                 }
//                 if (listing[i].available_hours.hasOwnProperty('tue_to') && listing[i].available_hours.tue_to != "") {

//                     temp_fist_two = listing[i].available_hours.tue_to.slice(0, 2);
//                     temp_last_two = listing[i].available_hours.tue_to;
//                     am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)

//                     if (am_pm == "PM") {



//                         temp_time = parseInt(listing[i].available_hours.tue_to.slice(0, 2)) + 12;


//                         if (temp_time == 24) {
//                             temp_time = temp_time - 12;
//                         }

//                         time_list.push(temp_time);
//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.tue_to.slice(0, 2)));
//                     }
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));

//                 }
//                 if (listing[i].available_hours.hasOwnProperty('wed_to') && listing[i].available_hours.wed_to != "") {

//                     temp_fist_two = listing[i].available_hours.wed_to.slice(0, 2);
//                     temp_last_two = listing[i].available_hours.wed_to;
//                     am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)

//                     if (am_pm == "PM") {

//                         temp_time = parseInt(listing[i].available_hours.wed_to.slice(0, 2)) + 12;
//                         if (temp_time == 24) {
//                             temp_time = temp_time - 12;
//                         }

//                         time_list.push(temp_time);
//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.wed_to.slice(0, 2)));
//                     }
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));

//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));
//                     // time_list.push(parseInt(listing[i].available_hours.wed_to.slice(0, 2)));
//                 }
//                 if (listing[i].available_hours.hasOwnProperty('thu_to') && listing[i].available_hours.thu_to != "") {

//                     temp_fist_two = listing[i].available_hours.thu_to.slice(0, 2);
//                     temp_last_two = listing[i].available_hours.thu_to;
//                     am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)

//                     if (am_pm == "PM") {

//                         temp_time = parseInt(listing[i].available_hours.thu_to.slice(0, 2)) + 12;
//                         if (temp_time == 24) {
//                             temp_time = temp_time - 12;
//                         }

//                         time_list.push(temp_time);
//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.thu_to.slice(0, 2)));
//                     }
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));

//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));
//                     //   time_list.push(parseInt(listing[i].available_hours.thu_to.slice(0, 2)));
//                 }
//                 if (listing[i].available_hours.hasOwnProperty('fri_to') && listing[i].available_hours.fri_to != "") {

//                     temp_fist_two = listing[i].available_hours.fri_to.slice(0, 2);
//                     temp_last_two = listing[i].available_hours.fri_to;
//                     am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)

//                     if (am_pm == "PM") {

//                         temp_time = parseInt(listing[i].available_hours.fri_to.slice(0, 2)) + 12;
//                         if (temp_time == 24) {
//                             temp_time = temp_time - 12;
//                         }

//                         time_list.push(temp_time);
//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.fri_to.slice(0, 2)));
//                     }
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));

//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));
//                     //    time_list.push(parseInt(listing[i].available_hours.fri_to.slice(0, 2)));
//                 }
//                 if (listing[i].available_hours.hasOwnProperty('sat_to') && listing[i].available_hours.sat_to != "") {

//                     temp_fist_two = listing[i].available_hours.sat_to.slice(0, 2);
//                     temp_last_two = listing[i].available_hours.thu_to;
//                     am_pm = temp_last_two.charAt(temp_last_two.length - 2) + temp_last_two.charAt(temp_last_two.length - 1)

//                     if (am_pm == "PM") {

//                         temp_time = parseInt(listing[i].available_hours.sat_to.slice(0, 2)) + 12;
//                         if (temp_time == 24) {
//                             temp_time = temp_time - 12;
//                         }

//                         time_list.push(temp_time);
//                     }
//                     else {
//                         time_list.push(parseInt(listing[i].available_hours.sat_to.slice(0, 2)));
//                     }
//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));

//                     //    console.log(listing[i].available_hours.sun_from.slice(0,2));
//                     // time_list.push(parseInt(listing[i].available_hours.sat_to.slice(0, 2)));
//                 }

//             }


//             time_list = time_list.filter(x => {
//                 return x != undefined;
//             })
//             var min = Math.min.apply(null, time_list);
//             var max = Math.max.apply(null, time_list);

//             console.log(time_list);
//             time_data.min_time = min;
//             time_data.max_time = max;


//             filter.listing = listing;
//             filter.cuisine_list = filter_cuisine_obj;
//             filter.occasion_list = filter_occ_obj;
//             filter.veg_type = veg_type;
//             filter.price_data = price_data;
//             filter.time_data = time_data;
//             filter.food_count = listing.length;
//             filter.lat_long_coll = lat_long_coll;
//             myCache.set("myKey", listing, 0, function (err, success) {
//                 if (!err && success) {

//                     // true
//                     // ... do something ...
//                 }
//             });


//             res.status(200).send(filter);

//         });
//     });



router
    .post('/filter-cook-listing', function (req, res, next) {

        console.log('CHeck Filter');
        console.log(req.body);

        var incoming_data = req.body.serach_fields;
        var group_val = '';
        var cuisine_val = [];
        var min_price_val = 0;
        var max_price_val = 0;
        var food_type_val = '';
        var user_lat = parseFloat(req.body.lat_long.lat);
        var user_long = parseFloat(req.body.lat_long.long);

        var i = 0;
        for (i = 0; i < incoming_data.length; i++) {

            if (incoming_data[i].hasOwnProperty('group_attr')) {

                group_val = incoming_data[i].group_attr;
            }
        }
        for (i = 0; i < incoming_data.length; i++) {

            if (incoming_data[i].hasOwnProperty('category_name')) {

                cuisine_val.push(incoming_data[i].category_name);
            }
        }
        for (i = 0; i < incoming_data.length; i++) {

            if (incoming_data[i].hasOwnProperty('min_price')) {

                min_price_val = parseInt(incoming_data[i].min_price);
                max_price_val = parseInt(incoming_data[i].max_price);

            }
        }
        for (i = 0; i < incoming_data.length; i++) {

            if (incoming_data[i].hasOwnProperty('food_type')) {

                food_type_val = incoming_data[i].food_type;

            }
        }

        // SIngle Combination

        if (group_val != '' && cuisine_val.length < 1 && min_price_val == 0 && food_type_val == '') {

            console.log('1');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },
                        { 'food_listing.occassion_list.group_attr': group_val },


                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    for (i = 0; i < data.length; i++) {

                        //   for(j=0;j<data[i].food_listing.length;j++){

                        final_data.push(data[i].food_listing);

                        // }
                    }
                    console.log('DTAAAAA');

                    res.send(final_data);
                }

            )
            // db.filter_infos.find(
            //     { 'food_listing.occassion_list.group_attr': group_val },
            //     { 'food_listing.$': 1 },



            //     // var i, j;
            //     // var final_data = [];
            //     // for (i = 0; i < data.length; i++) {

            //     //     for (j = 0; j < data[i].food_details.length; j++) {

            //     //         final_data.push(data[i].food_details[j]);

            //     //     }
            //     // }
            //     console.log('THISI SDATA');
            // console.log(data);
            // res.send(data);
            // }

            //     )

        }
        else if (cuisine_val.length > 0 && group_val == '' && min_price_val == 0 && food_type_val == '') {

            console.log('2');
            db.filter_infos.find(
                {
                    $and: [

                        { user_lat: user_lat },
                        { user_long: user_long },
                        { 'food_listing.cuisine_list.category_name': { $in: cuisine_val } }

                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    for (i = 0; i < data.length; i++) {

                        //   for(j=0;j<data[i].food_listing.length;j++){

                        final_data.push(data[i].food_listing);

                        // }
                    }
                    console.log('DTAAAAA');
                    console.log(final_data.length);
                    res.send(final_data);
                }

            )


        }
        else if (min_price_val != 0 && cuisine_val.length < 1 && group_val == 0 && food_type_val == '') {

            console.log('3');
            console.log(min_price_val);
            console.log(max_price_val);
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },
                        { 'food_listing.food_price_per_plate': { $gt: min_price_val - 1, $lt: max_price_val + 1 } },



                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    for (i = 0; i < data.length; i++) {

                        //   for(j=0;j<data[i].food_listing.length;j++){

                        final_data.push(data[i].food_listing);

                        // }
                    }
                    console.log('DTAAAAA');
                    //  console.log(final_data.length);
                    res.send(final_data);
                }

            )

        }
        else if (food_type_val != '' && cuisine_val.length < 1 && min_price_val == 0 && group_val == '') {

            console.log('4');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },
                        { 'food_listing.food_type': food_type_val },



                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    for (i = 0; i < data.length; i++) {

                        //   for(j=0;j<data[i].food_listing.length;j++){

                        final_data.push(data[i].food_listing);

                        // }
                    }
                    console.log('DTAAAAA');
                    //   console.log(data);
                    res.send(final_data);
                }

            )
        }

        ///////////// Double Combination

        else if (group_val != '' && cuisine_val.length > 0 && min_price_val == 0 && food_type_val == '') {

            console.log('5');
            console.log(cuisine_val);
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },

                        {
                            $and:
                            [
                                { 'food_listing.occassion_list.group_attr': group_val },
                                { 'food_listing.cuisine_list.category_name': { $in: cuisine_val } }
                            ]
                        }



                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    console.log('THIS IS DATA');
                    console.log(data);
                    for (i = 0; i < data.length; i++) {

                        //   for(j=0;j<data[i].food_listing.length;j++){

                        final_data.push(data[i].food_listing);

                        // }
                    }
                    console.log('DTAAAAA');
                    console.log('CHECK');
                    // console.log(data);
                    res.send(final_data);
                }

            )
        }

        else if (group_val != '' && min_price_val != 0 && cuisine_val.length < 1 && food_type_val == '') {

            console.log('6');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },
                        { 'food_listing.occassion_list.group_attr': group_val },
                        { 'food_listing.food_price_per_plate': { $gt: min_price_val - 1, $lt: max_price_val + 1 } },


                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    for (i = 0; i < data.length; i++) {

                        //   for(j=0;j<data[i].food_listing.length;j++){

                        final_data.push(data[i].food_listing);

                        // }
                    }
                    console.log('DTAAAAA');
                    console.log(data);
                    res.send(final_data);
                }

            )
        }

        else if (group_val != '' && food_type_val != '' && cuisine_val.length < 1 && min_price_val == 0) {

            console.log('7');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },
                        { 'food_listing.occassion_list.group_attr': group_val },
                        { 'food_listing.food_type': food_type_val },


                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    for (i = 0; i < data.length; i++) {

                        //   for(j=0;j<data[i].food_listing.length;j++){

                        final_data.push(data[i].food_listing);

                        // }
                    }
                    console.log('DTAAAAA');
                    console.log(data);
                    res.send(final_data);
                }

            )
        }

        ///////////

        else if (cuisine_val.length > 0 && min_price_val != 0 && food_type_val == '' && group_val == '') {

            console.log('8');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },
                        { 'food_listing.cuisine_list.category_name': { $in: cuisine_val } },
                        { 'food_listing.food_price_per_plate': { $gt: min_price_val - 1, $lt: max_price_val + 1 } },


                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    for (i = 0; i < data.length; i++) {

                        //   for(j=0;j<data[i].food_listing.length;j++){

                        final_data.push(data[i].food_listing);

                        // }
                    }
                    console.log('DTAAAAA');
                    //  console.log(data);
                    res.send(final_data);
                }

            )
        }

        else if (cuisine_val.length > 0 && food_type_val != '' && min_price_val == 0 && group_val == '') {

            console.log('9');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },
                        { 'food_listing.cuisine_list.category_name': { $in: cuisine_val } },
                        { 'food_listing.food_type': food_type_val },


                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    for (i = 0; i < data.length; i++) {

                        //   for(j=0;j<data[i].food_listing.length;j++){

                        final_data.push(data[i].food_listing);

                        // }
                    }
                    console.log('DTAAAAA');
                    console.log(data);
                    res.send(final_data);
                }

            )
        }


        /////////

        else if (min_price_val != 0 && food_type_val != '' && cuisine_val.length < 1 && group_val == '') {

            console.log('10');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },
                        { 'food_listing.food_price_per_plate': { $gt: min_price_val - 1, $lt: max_price_val + 1 } },
                        { 'food_listing.food_type': food_type_val },


                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    for (i = 0; i < data.length; i++) {

                        //   for(j=0;j<data[i].food_listing.length;j++){

                        final_data.push(data[i].food_listing);

                        // }
                    }

                    if (data.length < 1) {

                        final_data = [];
                        res.send(final_data);
                    }
                    else {
                        console.log('DTAAAAA');
                        console.log(data);
                        res.send(final_data);

                    }

                }

            )
        }


        //////// TRIPLE Combination

        else if (group_val != '' && cuisine_val.length > 0 && min_price_val != 0 && food_type_val == '') {

            console.log('11');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },
                        { 'food_listing.food_price_per_plate': { $gt: min_price_val - 1, $lt: max_price_val + 1 } },
                        {
                            $and:
                            [
                                { 'food_listing.occassion_list.group_attr': group_val },
                                { 'food_listing.cuisine_list.category_name': { $in: cuisine_val } },


                            ]

                        }

                        // { 'food_listing.food_type': food_type_val },


                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    for (i = 0; i < data.length; i++) {

                        //   for(j=0;j<data[i].food_listing.length;j++){

                        final_data.push(data[i].food_listing);

                        // }
                    }
                    console.log('DTAAAAA');
                    // console.log(data);
                    res.send(final_data);
                }

            )
        }
        else if (group_val == '' && cuisine_val.length > 0 && min_price_val != 0 && food_type_val != '') {

            console.log('12');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },
                        { 'food_listing.food_price_per_plate': { $gt: min_price_val - 1, $lt: max_price_val + 1 } },
                        // { 'food_listing.occassion_list.group_attr': group_val },
                        {
                            $and: [

                                { 'food_listing.cuisine_list.category_name': { $in: cuisine_val } },

                                { 'food_listing.food_type': food_type_val },
                            ]
                        }



                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    for (i = 0; i < data.length; i++) {

                        //   for(j=0;j<data[i].food_listing.length;j++){

                        final_data.push(data[i].food_listing);

                        // }
                    }
                    console.log('DTAAAAA');
                    console.log(data);
                    res.send(final_data);
                }

            )
        }

        else if (group_val != '' && cuisine_val.length < 1 && min_price_val != 0 && food_type_val != '') {

            console.log('13');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },
                        { 'food_listing.food_price_per_plate': { $gt: min_price_val - 1, $lt: max_price_val + 1 } },

                        {
                            $and: [
                                { 'food_listing.occassion_list.group_attr': group_val },
                                //   { 'food_listing.cuisine_list.category_name': { $all: cuisine_val } },

                                { 'food_listing.food_type': food_type_val },

                            ]
                        }



                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    for (i = 0; i < data.length; i++) {

                        //   for(j=0;j<data[i].food_listing.length;j++){

                        final_data.push(data[i].food_listing);

                        // }
                    }
                    console.log('DTAAAAA');
                    console.log(data);
                    res.send(final_data);
                }

            )
        }
        else if (group_val != '' && cuisine_val.length > 0 && min_price_val == 0 && food_type_val != '') {

            console.log('14');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },

                        {
                            $and:
                            [
                                { 'food_listing.occassion_list.group_attr': group_val },
                                { 'food_listing.cuisine_list.category_name': { $in: cuisine_val } },
                                //  { 'food_listing.food_price_per_plate': { $gt: min_price_val - 1, $lt: max_price_val + 1 } },
                                { 'food_listing.food_type': food_type_val },


                            ]
                        }


                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    for (i = 0; i < data.length; i++) {

                        //   for(j=0;j<data[i].food_listing.length;j++){

                        final_data.push(data[i].food_listing);

                        // }
                    }
                    console.log('DTAAAAA');
                    console.log(data);
                    res.send(final_data);
                }

            )
        }
        // else if (group_val != '' && cuisine_val.length > 0 && min_price_val != 0 && food_type_val == '') {

        //     console.log('15');
        //               db.filter_infos.find(
        //         {
        //             $and: [
        //                 { user_lat: user_lat },
        //                 { user_long: user_long },
        //                 { 'food_listing.occassion_list.group_attr': group_val },
        //                 { 'food_listing.cuisine_list.category_name': { $all: cuisine_val } },
        //                 { 'food_listing.food_price_per_plate': { $gt: min_price_val - 1, $lt: max_price_val + 1 } },
        //                 // { 'food_listing.food_type': food_type_val },


        //             ]
        //         }

        //         , function (err, data) {

        //             var i, j;
        //             var final_data = [];
        //             for (i = 0; i < data.length; i++) {

        //                 //   for(j=0;j<data[i].food_listing.length;j++){

        //                 final_data.push(data[i].food_listing);

        //                 // }
        //             }
        //             console.log('DTAAAAA');
        //             console.log(data);
        //             res.send(final_data);
        //         }

        //     )
        // }


        ////// ALL Combination

        else if (group_val != '' && cuisine_val.length > 0 && min_price_val != 0 && food_type_val != '') {

            console.log('16');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },
                        { 'food_listing.food_price_per_plate': { $gt: min_price_val - 1, $lt: max_price_val + 1 } },

                        {
                            $and: [
                                { 'food_listing.occassion_list.group_attr': group_val },
                                { 'food_listing.cuisine_list.category_name': { $in: cuisine_val } },

                                { 'food_listing.food_type': food_type_val },

                            ]
                        }



                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    if (data.length < 1) {

                        final_data = [];
                        res.send(final_data);


                    }
                    else {
                        for (i = 0; i < data.length; i++) {

                            //   for(j=0;j<data[i].food_listing.length;j++){

                            final_data.push(data[i].food_listing);

                            // }
                        }
                        console.log('DTAAAAA');
                        console.log(data);
                        res.send(final_data);
                    }

                }

            )
        }


        // ALL Combination (ALL NULL)

        else if (group_val == '' && cuisine_val.length < 1 && min_price_val == 0 && food_type_val == '') {

            console.log('17');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },
                        // { 'food_listing.occassion_list.group_attr': group_val },
                        // { 'food_listing.cuisine_list.category_name': { $all: cuisine_val } },
                        // { 'food_listing.food_price_per_plate': { $gt: min_price_val - 1, $lt: max_price_val + 1 } },
                        // { 'food_listing.food_type': food_type_val },


                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    for (i = 0; i < data.length; i++) {

                        //   for(j=0;j<data[i].food_listing.length;j++){

                        final_data.push(data[i].food_listing);

                        // }
                    }
                    console.log('DTAAAAA');
                    console.log(data);
                    res.send(final_data);
                }

            )
        }


    });

router
    .post('/filter-cook-listing-android', function (req, res, next) {

        console.log('CHeck Filter ANDROID');
        console.log(req.body);

        var incoming_data = req.body.serach_fields;
        var group_val = '';
        var cuisine_val = [];
        var min_price_val = 0;
        var max_price_val = 0;
        var food_type_val = '';
        var user_lat = parseFloat(req.body.lat_long.lat);
        var user_long = parseFloat(req.body.lat_long.long);

        var i = 0;
        for (i = 0; i < incoming_data.length; i++) {

            if (incoming_data[i].hasOwnProperty('group_attr')) {

                group_val = incoming_data[i].group_attr;
            }
        }
        for (i = 0; i < incoming_data.length; i++) {

            if (incoming_data[i].hasOwnProperty('category_name')) {

                cuisine_val.push(incoming_data[i].category_name);
            }
        }
        for (i = 0; i < incoming_data.length; i++) {

            if (incoming_data[i].hasOwnProperty('min_price')) {

                min_price_val = parseInt(incoming_data[i].min_price);
                max_price_val = parseInt(incoming_data[i].max_price);

            }
        }
        for (i = 0; i < incoming_data.length; i++) {

            if (incoming_data[i].hasOwnProperty('food_type')) {

                food_type_val = incoming_data[i].food_type;

            }
        }
        // for (i = 0; i < incoming_data.length; i++) {

        //     if (incoming_data[i].hasOwnProperty('lat')) {

        //         user_lat = incoming_data[i].lat;
        //         user_long = incoming_data[i].long;


        //     }
        // }
        console.log(group_val);
        console.log(cuisine_val);
        console.log(min_price_val);
        console.log(max_price_val);
        console.log(food_type_val);
        // res.send('suucee');

        // SIngle Combination

        if (group_val != '' && cuisine_val.length < 1 && min_price_val == 0 && food_type_val == '') {

            console.log('1');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },
                        { 'food_listing.occassion_list.group_attr': group_val },


                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    if (data.length < 1) {

                        var sending_data = {};
                        sending_data.listing = [];
                        sending_data.cuisine_list = [];
                        sending_data.occasion_list = [];
                        sending_data.veg_type = [];
                        sending_data.price_data = [];
                        sending_data.food_count = [];
                        sending_data.lat_long_coll = [];
                        res.send(sending_data);

                    }
                    else {

                        for (i = 0; i < data.length; i++) {

                            //   for(j=0;j<data[i].food_listing.length;j++){

                            final_data.push(data[i].food_listing);

                            // }
                        }
                        console.log('DTAAAAA');
                        console.log(data);
                        var sending_data = {};
                        sending_data.listing = final_data;
                        sending_data.cuisine_list = data[0].cuisine_list;
                        sending_data.occasion_list = data[0].occasion_list;
                        sending_data.veg_type = data[0].veg_type;
                        sending_data.price_data = data[0].price_data;
                        sending_data.food_count = data[0].food_count;
                        sending_data.lat_long_coll = data[0].lat_long_coll;

                        //  sending_data.listing = final_data;

                        res.send(sending_data);
                    }
                }

            )
            // db.filter_infos.find(
            //     { 'food_listing.occassion_list.group_attr': group_val },
            //     { 'food_listing.$': 1 },



            //     // var i, j;
            //     // var final_data = [];
            //     // for (i = 0; i < data.length; i++) {

            //     //     for (j = 0; j < data[i].food_details.length; j++) {

            //     //         final_data.push(data[i].food_details[j]);

            //     //     }
            //     // }
            //     console.log('THISI SDATA');
            // console.log(data);
            // res.send(data);
            // }

            //     )

        }
        else if (cuisine_val.length > 0 && group_val == '' && min_price_val == 0 && food_type_val == '') {

            console.log('2');
            db.filter_infos.find(
                {
                    $and: [

                        { user_lat: user_lat },
                        { user_long: user_long },
                        { 'food_listing.cuisine_list.category_name': { $in: cuisine_val } }

                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    if (data.length < 1) {

                        var sending_data = {};
                        sending_data.listing = [];
                        sending_data.cuisine_list = [];
                        sending_data.occasion_list = [];
                        sending_data.veg_type = [];
                        sending_data.price_data = [];
                        sending_data.food_count = [];
                        sending_data.lat_long_coll = [];
                        res.send(sending_data);

                    }
                    else {

                        for (i = 0; i < data.length; i++) {

                            //   for(j=0;j<data[i].food_listing.length;j++){

                            final_data.push(data[i].food_listing);

                            // }
                        }
                        console.log('DTAAAAA');
                        //   console.log(data);
                        var sending_data = {};
                        sending_data.listing = final_data;
                        sending_data.cuisine_list = data[0].cuisine_list;
                        sending_data.occasion_list = data[0].occasion_list;
                        sending_data.veg_type = data[0].veg_type;
                        sending_data.price_data = data[0].price_data;
                        sending_data.food_count = data[0].food_count;
                        sending_data.lat_long_coll = data[0].lat_long_coll;

                        //  sending_data.listing = final_data;

                        res.send(sending_data);
                    }
                }

            )


        }
        else if (min_price_val != 0 && cuisine_val.length < 1 && group_val == 0 && food_type_val == '') {

            console.log('3');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },
                        { 'food_listing.food_price_per_plate': { $gt: min_price_val - 1, $lt: max_price_val + 1 } },



                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    if (data.length < 1) {

                        var sending_data = {};
                        sending_data.listing = [];
                        sending_data.cuisine_list = [];
                        sending_data.occasion_list = [];
                        sending_data.veg_type = [];
                        sending_data.price_data = [];
                        sending_data.food_count = [];
                        sending_data.lat_long_coll = [];
                        res.send(sending_data);

                    }
                    else {

                        for (i = 0; i < data.length; i++) {

                            //   for(j=0;j<data[i].food_listing.length;j++){

                            final_data.push(data[i].food_listing);

                            // }
                        }
                        console.log('DTAAAAA');
                        console.log(data);
                        var sending_data = {};
                        sending_data.listing = final_data;
                        sending_data.cuisine_list = data[0].cuisine_list;
                        sending_data.occasion_list = data[0].occasion_list;
                        sending_data.veg_type = data[0].veg_type;
                        sending_data.price_data = data[0].price_data;
                        sending_data.food_count = data[0].food_count;
                        sending_data.lat_long_coll = data[0].lat_long_coll;

                        //  sending_data.listing = final_data;

                        res.send(sending_data);
                    }
                }

            )

        }
        else if (food_type_val != '' && cuisine_val.length < 1 && min_price_val == 0 && group_val == '') {

            console.log('4');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },
                        { 'food_listing.food_type': food_type_val },



                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    if (data.length < 1) {

                        var sending_data = {};
                        sending_data.listing = [];
                        sending_data.cuisine_list = [];
                        sending_data.occasion_list = [];
                        sending_data.veg_type = [];
                        sending_data.price_data = [];
                        sending_data.food_count = [];
                        sending_data.lat_long_coll = [];
                        res.send(sending_data);

                    }
                    else {

                        for (i = 0; i < data.length; i++) {

                            //   for(j=0;j<data[i].food_listing.length;j++){

                            final_data.push(data[i].food_listing);

                            // }
                        }
                        console.log('DTAAAAA');
                        console.log(data);
                        var sending_data = {};
                        sending_data.listing = final_data;
                        sending_data.cuisine_list = data[0].cuisine_list;
                        sending_data.occasion_list = data[0].occasion_list;
                        sending_data.veg_type = data[0].veg_type;
                        sending_data.price_data = data[0].price_data;
                        sending_data.food_count = data[0].food_count;
                        sending_data.lat_long_coll = data[0].lat_long_coll;

                        //  sending_data.listing = final_data;

                        res.send(sending_data);
                    }
                }

            )
        }

        ///////////// Double Combination

        else if (group_val != '' && cuisine_val.length > 0 && min_price_val == 0 && food_type_val == '') {

            console.log('5');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },

                        {
                            $and: [

                                { 'food_listing.occassion_list.group_attr': group_val },
                                { 'food_listing.cuisine_list.category_name': { $in: cuisine_val } }
                            ]
                        }



                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    if (data.length < 1) {

                        var sending_data = {};
                        sending_data.listing = [];
                        sending_data.cuisine_list = [];
                        sending_data.occasion_list = [];
                        sending_data.veg_type = [];
                        sending_data.price_data = [];
                        sending_data.food_count = [];
                        sending_data.lat_long_coll = [];
                        res.send(sending_data);

                    }
                    else {

                        for (i = 0; i < data.length; i++) {

                            //   for(j=0;j<data[i].food_listing.length;j++){

                            final_data.push(data[i].food_listing);

                            // }
                        }
                        console.log('DTAAAAA');
                        console.log('CHECK');
                        // console.log(data);
                        var sending_data = {};
                        sending_data.listing = final_data;
                        sending_data.cuisine_list = data[0].cuisine_list;
                        sending_data.occasion_list = data[0].occasion_list;
                        sending_data.veg_type = data[0].veg_type;
                        sending_data.price_data = data[0].price_data;
                        sending_data.food_count = data[0].food_count;
                        sending_data.lat_long_coll = data[0].lat_long_coll;

                        //  sending_data.listing = final_data;

                        res.send(sending_data);
                    }
                }

            )
        }

        else if (group_val != '' && min_price_val != 0 && cuisine_val.length < 1 && food_type_val == '') {

            console.log('6');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },
                        { 'food_listing.occassion_list.group_attr': group_val },
                        { 'food_listing.food_price_per_plate': { $gt: min_price_val - 1, $lt: max_price_val + 1 } },


                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    if (data.length < 1) {

                        var sending_data = {};
                        sending_data.listing = [];
                        sending_data.cuisine_list = [];
                        sending_data.occasion_list = [];
                        sending_data.veg_type = [];
                        sending_data.price_data = [];
                        sending_data.food_count = [];
                        sending_data.lat_long_coll = [];
                        res.send(sending_data);

                    }
                    else {

                        for (i = 0; i < data.length; i++) {

                            //   for(j=0;j<data[i].food_listing.length;j++){

                            final_data.push(data[i].food_listing);

                            // }
                        }
                        console.log('DTAAAAA');
                        console.log(data);
                        var sending_data = {};
                        sending_data.listing = final_data;
                        sending_data.cuisine_list = data[0].cuisine_list;
                        sending_data.occasion_list = data[0].occasion_list;
                        sending_data.veg_type = data[0].veg_type;
                        sending_data.price_data = data[0].price_data;
                        sending_data.food_count = data[0].food_count;
                        sending_data.lat_long_coll = data[0].lat_long_coll;

                        //  sending_data.listing = final_data;

                        res.send(sending_data);
                    }
                }

            )
        }

        else if (group_val != '' && food_type_val != '' && cuisine_val.length < 1 && min_price_val == 0) {

            console.log('7');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },
                        { 'food_listing.occassion_list.group_attr': group_val },
                        { 'food_listing.food_type': food_type_val },


                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    if (data.length < 1) {

                        var sending_data = {};
                        sending_data.listing = [];
                        sending_data.cuisine_list = [];
                        sending_data.occasion_list = [];
                        sending_data.veg_type = [];
                        sending_data.price_data = [];
                        sending_data.food_count = [];
                        sending_data.lat_long_coll = [];
                        res.send(sending_data);

                    }
                    else {

                        for (i = 0; i < data.length; i++) {

                            //   for(j=0;j<data[i].food_listing.length;j++){

                            final_data.push(data[i].food_listing);

                            // }
                        }
                        console.log('DTAAAAA');
                        console.log(data);
                        var sending_data = {};
                        sending_data.listing = final_data;
                        sending_data.cuisine_list = data[0].cuisine_list;
                        sending_data.occasion_list = data[0].occasion_list;
                        sending_data.veg_type = data[0].veg_type;
                        sending_data.price_data = data[0].price_data;
                        sending_data.food_count = data[0].food_count;
                        sending_data.lat_long_coll = data[0].lat_long_coll;

                        //  sending_data.listing = final_data;

                        res.send(sending_data);
                    }
                }

            )
        }

        ///////////

        else if (cuisine_val.length > 0 && min_price_val != 0 && food_type_val == '' && group_val == '') {

            console.log('8 And');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },
                        { 'food_listing.cuisine_list.category_name': { $in: cuisine_val } },
                        { 'food_listing.food_price_per_plate': { $gt: min_price_val - 1, $lt: max_price_val + 1 } },

                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    if (data.length < 1) {

                        var sending_data = {};
                        sending_data.listing = [];
                        sending_data.cuisine_list = [];
                        sending_data.occasion_list = [];
                        sending_data.veg_type = [];
                        sending_data.price_data = [];
                        sending_data.food_count = [];
                        sending_data.lat_long_coll = [];
                        res.send(sending_data);

                    }
                    else {

                        for (i = 0; i < data.length; i++) {

                            //   for(j=0;j<data[i].food_listing.length;j++){

                            final_data.push(data[i].food_listing);

                            // }
                        }
                        console.log('DTAAAAA');
                        console.log(data.length);
                        //   console.log(data);
                        var sending_data = {};
                        sending_data.listing = final_data;
                        sending_data.cuisine_list = data[0].cuisine_list;
                        sending_data.occasion_list = data[0].occasion_list;
                        sending_data.veg_type = data[0].veg_type;
                        sending_data.price_data = data[0].price_data;
                        sending_data.food_count = data[0].food_count;
                        sending_data.lat_long_coll = data[0].lat_long_coll;

                        //  sending_data.listing = final_data;

                        res.send(sending_data);
                    }
                }

            )
        }

        else if (cuisine_val.length > 0 && food_type_val != '' && min_price_val == 0 && group_val == '') {

            console.log('9');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },
                        { 'food_listing.cuisine_list.category_name': { $in: cuisine_val } },
                        { 'food_listing.food_type': food_type_val },


                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    if (data.length < 1) {

                        var sending_data = {};
                        sending_data.listing = [];
                        sending_data.cuisine_list = [];
                        sending_data.occasion_list = [];
                        sending_data.veg_type = [];
                        sending_data.price_data = [];
                        sending_data.food_count = [];
                        sending_data.lat_long_coll = [];
                        res.send(sending_data);

                    }
                    else {

                        for (i = 0; i < data.length; i++) {

                            //   for(j=0;j<data[i].food_listing.length;j++){

                            final_data.push(data[i].food_listing);

                            // }
                        }
                        console.log('DTAAAAA');
                        console.log(data);
                        var sending_data = {};
                        sending_data.listing = final_data;
                        sending_data.cuisine_list = data[0].cuisine_list;
                        sending_data.occasion_list = data[0].occasion_list;
                        sending_data.veg_type = data[0].veg_type;
                        sending_data.price_data = data[0].price_data;
                        sending_data.food_count = data[0].food_count;
                        sending_data.lat_long_coll = data[0].lat_long_coll;

                        //  sending_data.listing = final_data;

                        res.send(sending_data);
                    }
                }
            )
        }


        /////////

        else if (min_price_val != 0 && food_type_val != '' && cuisine_val.length < 1 && group_val == '') {

            console.log('10 a');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },
                        { 'food_listing.food_price_per_plate': { $gt: min_price_val - 1, $lt: max_price_val + 1 } },
                        { 'food_listing.food_type': food_type_val },


                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    if (data.length < 1) {

                        var sending_data = {};
                        sending_data.listing = [];
                        sending_data.cuisine_list = [];
                        sending_data.occasion_list = [];
                        sending_data.veg_type = [];
                        sending_data.price_data = [];
                        sending_data.food_count = [];
                        sending_data.lat_long_coll = [];
                        res.send(sending_data);

                    }
                    else {

                        for (i = 0; i < data.length; i++) {

                            //   for(j=0;j<data[i].food_listing.length;j++){

                            final_data.push(data[i].food_listing);

                            // }
                        }
                        console.log('DTAAAAA');
                        console.log(data);
                        var sending_data = {};
                        sending_data.listing = final_data;
                        sending_data.cuisine_list = data[0].cuisine_list;
                        sending_data.occasion_list = data[0].occasion_list;
                        sending_data.veg_type = data[0].veg_type;
                        sending_data.price_data = data[0].price_data;
                        sending_data.food_count = data[0].food_count;
                        sending_data.lat_long_coll = data[0].lat_long_coll;

                        //  sending_data.listing = final_data;

                        res.send(sending_data);
                    }
                }

            )
        }


        //////// TRIPLE Combination

        else if (group_val != '' && cuisine_val.length > 0 && min_price_val != 0 && food_type_val == '') {

            console.log('11');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },
                        { 'food_listing.food_price_per_plate': { $gt: min_price_val - 1, $lt: max_price_val + 1 } },
                        {
                            $and: [
                                { 'food_listing.occassion_list.group_attr': group_val },
                                { 'food_listing.cuisine_list.category_name': { $in: cuisine_val } },

                            ]
                        }


                        // { 'food_listing.food_type': food_type_val },


                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    for (i = 0; i < data.length; i++) {

                        //   for(j=0;j<data[i].food_listing.length;j++){

                        final_data.push(data[i].food_listing);

                        // }
                    }
                    console.log('DTAAAAA 23');
                    console.log(data);

                    if (data.length < 1) {
                        var sending_data = {};
                        sending_data.listing = [];
                        sending_data.cuisine_list = [];
                        sending_data.occasion_list = [];
                        sending_data.veg_type = [];
                        sending_data.price_data = [];
                        sending_data.food_count = [];
                        sending_data.lat_long_coll = [];
                        res.send(sending_data);
                    }
                    else {
                        var sending_data = {};
                        sending_data.listing = final_data;
                        sending_data.cuisine_list = data[0].cuisine_list;
                        sending_data.occasion_list = data[0].occasion_list;
                        sending_data.veg_type = data[0].veg_type;
                        sending_data.price_data = data[0].price_data;
                        sending_data.food_count = data[0].food_count;
                        sending_data.lat_long_coll = data[0].lat_long_coll;

                        //  sending_data.listing = final_data;

                        res.send(sending_data);

                    }

                }

            )
        }
        else if (group_val == '' && cuisine_val.length > 0 && min_price_val != 0 && food_type_val != '') {

            console.log('12');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },
                        { 'food_listing.food_price_per_plate': { $gt: min_price_val - 1, $lt: max_price_val + 1 } },
                        {
                            $and: [
                                { 'food_listing.cuisine_list.category_name': { $in: cuisine_val } },

                                { 'food_listing.food_type': food_type_val },

                            ]
                        }
                        // { 'food_listing.occassion_list.group_attr': group_val },



                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    if (data.length < 1) {

                        sending_data = {};
                        res.send(sending_data);

                    }
                    else {

                        for (i = 0; i < data.length; i++) {

                            //   for(j=0;j<data[i].food_listing.length;j++){

                            final_data.push(data[i].food_listing);

                            // }
                        }

                        var sending_data = {};
                        sending_data.listing = final_data;
                        sending_data.cuisine_list = data[0].cuisine_list;
                        sending_data.occasion_list = data[0].occasion_list;
                        sending_data.veg_type = data[0].veg_type;
                        sending_data.price_data = data[0].price_data;
                        sending_data.food_count = data[0].food_count;
                        sending_data.lat_long_coll = data[0].lat_long_coll;

                        //  sending_data.listing = final_data;

                        res.send(sending_data);
                    }
                }
            )
        }

        else if (group_val != '' && cuisine_val.length < 1 && min_price_val != 0 && food_type_val != '') {

            console.log('13');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },
                        { 'food_listing.food_price_per_plate': { $gt: min_price_val - 1, $lt: max_price_val + 1 } },
                        {
                            $and: [
                                { 'food_listing.occassion_list.group_attr': group_val },
                                //   { 'food_listing.cuisine_list.category_name': { $all: cuisine_val } },

                                { 'food_listing.food_type': food_type_val },

                            ]
                        }



                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    if (data.length < 1) {

                        var sending_data = {};
                        sending_data.listing = [];
                        sending_data.cuisine_list = [];
                        sending_data.occasion_list = [];
                        sending_data.veg_type = [];
                        sending_data.price_data = [];
                        sending_data.food_count = [];
                        sending_data.lat_long_coll = [];
                        res.send(sending_data);
                    }
                    else {

                        for (i = 0; i < data.length; i++) {

                            //   for(j=0;j<data[i].food_listing.length;j++){

                            final_data.push(data[i].food_listing);

                            // }
                        }
                        console.log('DTAAAAA');
                        console.log(data);
                        var sending_data = {};
                        sending_data.listing = final_data;
                        sending_data.cuisine_list = data[0].cuisine_list;
                        sending_data.occasion_list = data[0].occasion_list;
                        sending_data.veg_type = data[0].veg_type;
                        sending_data.price_data = data[0].price_data;
                        sending_data.food_count = data[0].food_count;
                        sending_data.lat_long_coll = data[0].lat_long_coll;

                        //  sending_data.listing = final_data;

                        res.send(sending_data);
                    }
                }

            )
        }
        else if (group_val != '' && cuisine_val.length > 0 && min_price_val == 0 && food_type_val != '') {

            console.log('14');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },

                        {
                            $and: [

                                { 'food_listing.occassion_list.group_attr': group_val },
                                { 'food_listing.cuisine_list.category_name': { $in: cuisine_val } },
                                //  { 'food_listing.food_price_per_plate': { $gt: min_price_val - 1, $lt: max_price_val + 1 } },
                                { 'food_listing.food_type': food_type_val },

                            ]
                        }


                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];

                    if (data.length < 1) {

                        var sending_data = {};
                        sending_data.listing = [];
                        sending_data.cuisine_list = [];
                        sending_data.occasion_list = [];
                        sending_data.veg_type = [];
                        sending_data.price_data = [];
                        sending_data.food_count = [];
                        sending_data.lat_long_coll = [];
                        res.send(sending_data);

                    }
                    else {


                        for (i = 0; i < data.length; i++) {

                            //   for(j=0;j<data[i].food_listing.length;j++){

                            final_data.push(data[i].food_listing);

                            // }
                        }
                        console.log('DTAAAAA');
                        console.log(data);
                        var sending_data = {};
                        sending_data.listing = final_data;
                        sending_data.cuisine_list = data[0].cuisine_list;
                        sending_data.occasion_list = data[0].occasion_list;
                        sending_data.veg_type = data[0].veg_type;
                        sending_data.price_data = data[0].price_data;
                        sending_data.food_count = data[0].food_count;
                        sending_data.lat_long_coll = data[0].lat_long_coll;

                        //  sending_data.listing = final_data;

                        res.send(sending_data);
                    }
                }

            )
        }
        // else if (group_val != '' && cuisine_val.length > 0 && min_price_val != 0 && food_type_val == '') {

        //     console.log('15');
        //               db.filter_infos.find(
        //         {
        //             $and: [
        //                 { user_lat: user_lat },
        //                 { user_long: user_long },
        //                 { 'food_listing.occassion_list.group_attr': group_val },
        //                 { 'food_listing.cuisine_list.category_name': { $all: cuisine_val } },
        //                 { 'food_listing.food_price_per_plate': { $gt: min_price_val - 1, $lt: max_price_val + 1 } },
        //                 // { 'food_listing.food_type': food_type_val },


        //             ]
        //         }

        //         , function (err, data) {

        //             var i, j;
        //             var final_data = [];
        //             for (i = 0; i < data.length; i++) {

        //                 //   for(j=0;j<data[i].food_listing.length;j++){

        //                 final_data.push(data[i].food_listing);

        //                 // }
        //             }
        //             console.log('DTAAAAA');
        //             console.log(data);
        //             res.send(final_data);
        //         }

        //     )
        // }


        ////// ALL Combination

        else if (group_val != '' && cuisine_val.length > 0 && min_price_val != 0 && food_type_val != '') {

            console.log('16');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },
                        { 'food_listing.food_price_per_plate': { $gt: min_price_val - 1, $lt: max_price_val + 1 } },

                        {
                            $and: [

                                { 'food_listing.occassion_list.group_attr': group_val },
                                { 'food_listing.cuisine_list.category_name': { $in: cuisine_val } },

                                { 'food_listing.food_type': food_type_val },

                            ]
                        }



                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];

                    if (data.length < 1) {

                        var sending_data = {};
                        sending_data.listing = [];
                        sending_data.cuisine_list = [];
                        sending_data.occasion_list = [];
                        sending_data.veg_type = [];
                        sending_data.price_data = [];
                        sending_data.food_count = [];
                        sending_data.lat_long_coll = [];
                        res.send(sending_data);

                    }
                    else {

                        for (i = 0; i < data.length; i++) {

                            //   for(j=0;j<data[i].food_listing.length;j++){

                            final_data.push(data[i].food_listing);

                            // }
                        }
                        console.log('DTAAAAA');
                        console.log(data);
                        var sending_data = {};
                        sending_data.listing = final_data;
                        sending_data.cuisine_list = data[0].cuisine_list;
                        sending_data.occasion_list = data[0].occasion_list;
                        sending_data.veg_type = data[0].veg_type;
                        sending_data.price_data = data[0].price_data;
                        sending_data.food_count = data[0].food_count;
                        sending_data.lat_long_coll = data[0].lat_long_coll;

                        //  sending_data.listing = final_data;

                        res.send(sending_data);
                    }

                }

            )
        }


        // ALL Combination (ALL NULL)

        else if (group_val == '' && cuisine_val.length < 1 && min_price_val == 0 && food_type_val == '') {

            console.log('16');
            db.filter_infos.find(
                {
                    $and: [
                        { user_lat: user_lat },
                        { user_long: user_long },
                        // { 'food_listing.occassion_list.group_attr': group_val },
                        // { 'food_listing.cuisine_list.category_name': { $all: cuisine_val } },
                        // { 'food_listing.food_price_per_plate': { $gt: min_price_val - 1, $lt: max_price_val + 1 } },
                        // { 'food_listing.food_type': food_type_val },


                    ]
                }

                , function (err, data) {

                    var i, j;
                    var final_data = [];
                    for (i = 0; i < data.length; i++) {

                        //   for(j=0;j<data[i].food_listing.length;j++){

                        final_data.push(data[i].food_listing);

                        // }
                    }
                    var sending_data = {};
                    sending_data.listing = final_data;
                    sending_data.cuisine_list = data[0].cuisine_list;
                    sending_data.occasion_list = data[0].occasion_list;
                    sending_data.veg_type = data[0].veg_type;
                    sending_data.price_data = data[0].price_data;
                    sending_data.food_count = data[0].food_count;
                    sending_data.lat_long_coll = data[0].lat_long_coll;

                    //  sending_data.listing = final_data;

                    res.send(sending_data);
                }

            )
        }


    });

router
    .post('/fetch-food-by-id', function (req, res, next) {
        //       , {
        //    "food_details.$.": 1
        // }
        var u = {};
        var cat_list = [];
        var cat_list_data = [];
        //console.log(req.body);

        db.cook_infos.findOne({

            'food_details._id': mongojs.ObjectId(req.body.food_id),

        }
            , function (err, food) {


                if (err) {
                    res.status(404);
                    res.send('No Food');
                } else {

                    u = food;
                    var check = 0;
                    console.log('THIS IS COOK ID');

                    // console.log(u.food_details[0].occassion_list[0].status);

                    console.log('THIS IS U FOOD DETAILS');
                    //                    console.log(u.food_details);
                    console.log(food);
                    //        if(u.hasOwnProperty('food_details')){

                    if (food != null) {

                        if (u.food_details.length > 0) {

                            for (var i = 0; i < u.food_details.length; i++) {

                                for (var j = 0; j < u.food_details[i].occassion_list.length; j++) {

                                    if (u.food_details[i].occassion_list[j].status == "true") {


                                        if (cat_list.length > 0) {
                                            check = 0;
                                            for (var k = 0; k < cat_list.length; k++) {



                                                if (cat_list[k] == u.food_details[i].occassion_list[j].group_attr) {

                                                    check = 1;
                                                    break;
                                                }


                                            }
                                            if (check == 0) {
                                                cat_list.push(u.food_details[i].occassion_list[j].group_attr);
                                            }

                                        }
                                        else {
                                            cat_list.push(u.food_details[i].occassion_list[j].group_attr);
                                        }
                                    }
                                }
                            }

                        }
                    }


                    //         }

                    function stringToDate(_date, _format, _delimiter) {
                        var formatLowerCase = _format.toLowerCase();
                        var formatItems = formatLowerCase.split(_delimiter);
                        var dateItems = _date.split(_delimiter);
                        var monthIndex = formatItems.indexOf("mm");
                        var dayIndex = formatItems.indexOf("dd");
                        var yearIndex = formatItems.indexOf("yyyy");
                        var month = parseInt(dateItems[monthIndex]);
                        month -= 1;
                        var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
                        return formatedDate;
                    }

                    var c_pos = 0;


                    var data_collection = [];

                    var main_obj = {};
                    var dates = [];
                    var dd;
                    var minDate;
                    var maxDate;
                    var isValidDate = false;
                    //LOOP TILL CAT LIST 
                    //u is a collection of all foods of particular cook

                    for (var t = 0; t < cat_list.length; t++) {

                        var data_obj_arr = [];
                        for (var n = 0; n < u.food_details.length; n++) {


                            for (var s = 0; s < u.food_details[n].occassion_list.length; s++) {
                                var data_obj = {};
                                dates = [];
                                minDate = '';
                                maxDate = '';
                                isValidDate = false;

                                if (u.food_details[n].occassion_list[s].group_attr == cat_list[t] && u.food_details[n].occassion_list[s].status == "true" && u.food_details[n].food_isApproved == "Approved" && u.food_details[n].food_status == "Enable") {


                                    dates.push(new Date(stringToDate(u.food_details[n].selected_date_from, "dd-mm-yyyy", "-")));
                                    dates.push(new Date(stringToDate(u.food_details[n].selected_date_to, "dd-mm-yyyy", "-")));

                                    console.log('DATE VIEW');
                                    console.log(dates);
                                    maxDate = new Date(Math.max.apply(null, dates));
                                    minDate = new Date(Math.min.apply(null, dates));

                                    const range = moment_r.range(minDate, maxDate);

                                    dd = moment();  // THIS IS CURRENT DATE

                                    isValidDate = dd.within(range);
                                    console.log(isValidDate);

                                    if (isValidDate) {
                                        console.log('INSIDE');
                                        data_obj.food_id = u.food_details[n]._id;
                                        data_obj.cook_id = u.food_details[n].cook_id;
                                        data_obj.food_name = u.food_details[n].food_name;
                                        data_obj.food_cuisine = u.food_details[n].cuisine_list;
                                        data_obj.food_type = u.food_details[n].food_type;
                                        data_obj.food_img = u.food_details[n].food_img;
                                        data_obj.food_price_per_plate = u.food_details[n].food_price_per_plate;
                                        data_obj.food_desc = u.food_details[n].food_desc;
                                        data_obj.cart_qty = u.food_details[n].cart_qty;
                                        data_obj.food_min_qty = u.food_details[n].food_min_qty;
                                        data_obj.food_max_qty = u.food_details[n].food_max_qty;
                                        data_obj.food_total_qty = u.food_details[n].food_total_qty;
                                        data_obj.selected_date_from = u.food_details[n].selected_date_from;
                                        data_obj.selected_date_to = u.food_details[n].selected_date_to;
                                        data_obj.delivery_by = u.delivery_by;
                                        data_obj.brand_name = food.cook_company_name;

                                        data_obj.food_type = u.food_details[n].food_type;
                                        data_obj.max_date_for_detail_page = moment(u.food_details[n].selected_date_to, 'DD-MM-YYYY').format('YYYY-MM-DD');
                                        data_obj.food_review = [];
                                        //send_obj.menu_details[cat_list[i]][j].food_review = [];
                                        data_obj.food_price_per_plate = u.food_details[n].food_price_per_plate;

                                        data_obj_arr.push(data_obj);
                                        break;
                                    }

                                }

                            }

                        }

                        var temp = cat_list[t];

                        main_obj[temp] = data_obj_arr;
                        data_collection.push(main_obj);
                        console.log('FINAL LENGTH');
                        console.log(data_collection.length);
                    }
                    // for (var t = 0; t < u.food_details.length; t++) {

                    //     var c_pos = 0;
                    //     var main_obj = {};
                    //     var data_obj_arr = [];
                    //     for (var n = 0; n < u.food_details[t].occassion_list.length; n++) {
                    //         var data_obj = {};
                    //         if (u.food_details[t].occassion_list[n].group_attr == cat_list[c_pos] && u.food_details[t].occassion_list[n].status == "true") {

                    //             data_obj.food_id = u.food_details[t]._id;
                    //             data_obj.food_name = u.food_details[t].food_name;
                    //             data_obj.food_price_per_plate = u.food_details[t].food_price_per_plate;

                    //             data_obj_arr.push(data_obj);

                    //             console.log('we found your list');
                    //             c_pos++;
                    //         }

                    //     }

                    //     var temp = cat_list[t];

                    //     main_obj[temp] = data_obj_arr;


                    //     data_collection.push(main_obj);
                    //     //   console.log(main_obj);
                    // }

                    //THIS IS ALL I HAVE TO SEND FOR DETAIL FOOD VIEW
                    //   res.send(data_collection[0]);





                    var send_obj = {};

                    send_obj.food = food;
                    send_obj.menu_details = data_collection[0];
                    //    res.send(send_obj);


                    db.review_infos.find({

                        'food_id': mongojs.ObjectId(req.body.food_id)
                    }
                        , function (err, food_review) {


                            for (var i = 0; i < cat_list.length; i++) {

                                if (send_obj.menu_details.hasOwnProperty(cat_list[i])) {

                                    console.log('RECORD DFOUND');
                                    //  console.log(send_obj.menu_details[cat_list[i]][i].food_id);




                                    for (var j = 0; j < send_obj.menu_details[cat_list[i]].length; j++) {

                                        for (var s = 0; s < food_review.length; s++) {

                                            // send_obj.menu_details[cat_list[i]][j].food_review = [];

                                            if (food_review[s].food_id == send_obj.menu_details[cat_list[i]][j].food_id.toString()) {

                                                console.log('ENETERED');
                                                send_obj.menu_details[cat_list[i]][j].food_review.push(food_review[s]);

                                            }
                                            else {

                                                send_obj.menu_details[cat_list[i]][j].food_review = [];

                                            }

                                        }

                                    }


                                }

                            }
                            //  res.send(send_obj.menu_details);
                            res.send(send_obj);
                        });

                    //    console.log(data_collection[0]);
                }
            });


    });


// router
//     .post('/fetch-food-by-id', function (req, res, next) {
//         //       , {
//         //    "food_details.$.": 1
//         // }


//         //     console.log(req.body);

//         //         db.cook_infos.findOne({

//         //         'food_details._id': mongojs.ObjectId(req.body.food_id)
//         //     }
//         // , function(err, food) {


//         //         if (err) {
//         //             res.status(404);
//         //             res.send('No Food');
//         //         } else {


//         //             res.send(food);
//         //            console.log(food);
//         //         }
//         //     });


//     });

router
    .post('/check-promo-code', function (req, res, next) {

        console.log('PROMO CODE');
        console.log(req.body);



        db.coupon_infos.find({



        },

            function (err, coupon) {


                if (err) {
                    res.status(404);
                    res.send(err);
                } else {

                    //res.send(coupon[0].coupon_infos);
                    //    console.log(coupon);
                    var coupon_db_detail = coupon;
                    var is_coupon_code_valid = false;

                    for (var i = 0; i < coupon_db_detail.length; i++) {


                        if (coupon_db_detail[i].coupon_code == req.body.promo_code) {
                            console.log(coupon_db_detail[i]);
                            for (var s = 0; s < req.body.cuisine_list.length; s++) {

                                for (var j = 0; j < coupon_db_detail[i].categories.length; j++) {

                                    console.log('MATCH CHECK');
                                    console.log(coupon_db_detail[i].categories);
                                    console.log(coupon_db_detail[i].categories[j].category_name);
                                    console.log(req.body.cuisine_list[s].cuisine_name);
                                    if (coupon_db_detail[i].categories[j].category_name == req.body.cuisine_list[s].cuisine_name) {

                                        console.log('INSIDE VALID');
                                        is_coupon_code_valid = true;

                                    }
                                }

                            }


                        }

                    }



                    // for (var s = 0; s < req.body.categories.length; s++) {

                    //     for (var i = 0; i < coupon_db_detail.length; i++) {

                    //         if (req.body.categories[s].category_name == coupon_db_detail[i].categories) {

                    //             is_coupon_code_valid = true;

                    //         }

                    //     }
                    // }



                    // CHECKING IF COUPON IS VALID OR Not

                    if (is_coupon_code_valid == true) {


                        db.coupon_infos.find({

                            coupon_code: req.body.promo_code,
                            // 'user_arr._id': mongojs.ObjectId(req.body.user_id)

                        },

                            function (err, coupon_data) {



                                if (coupon_data.length > 0) {

                                    var user_coupon_count = 0;

                                    for (var i = 0; i < coupon_data[0].user_arr.length; i++) {

                                        if (coupon_data[0].user_arr[i]._id == req.body.user_id) {

                                            user_coupon_count++;
                                        }
                                    }

                                    if (user_coupon_count < parseInt(coupon_data[0].coupon_uses_per_customer)) {


                                        var flag = 0;
                                        var coupon_id;
                                        var coupon_db_val;

                                        var coupon_amount_detail = {};  // THIS IS USED TO SEND AS RESPONSE TO DEDUCT AMOUNT
                                        var coupon_final_coll = [];
                                        var current_coupon_count = 0;
                                        var is_coupon_validate = false;
                                        //calculating date range for coupon

                                        var dates = [];
                                        //var incoming_date = new Date(req.body[i].date);
                                        function stringToDate(_date, _format, _delimiter) {
                                            var formatLowerCase = _format.toLowerCase();
                                            var formatItems = formatLowerCase.split(_delimiter);
                                            var dateItems = _date.split(_delimiter);
                                            var monthIndex = formatItems.indexOf("mm");
                                            var dayIndex = formatItems.indexOf("dd");
                                            var yearIndex = formatItems.indexOf("yyyy");
                                            var month = parseInt(dateItems[monthIndex]);
                                            month -= 1;
                                            var formatedDate = new Date(dateItems[yearIndex], month, dateItems[dayIndex]);
                                            return formatedDate;
                                        }

                                        // var frm_date=stringToDate(coupon[0].coupon_infos[2].coupon_due_start,"dd/MM/yyyy","/");

                                        // console.log('THIS IS FRM DATE');
                                        // console.log(frm_date);
                                        for (var i = 0; i < coupon.length; i++) {

                                            if (coupon[i].coupon_code == req.body.promo_code) {
                                                dates.push(new Date(stringToDate(coupon[i].coupon_due_start, "dd/MM/yyyy", "/")));
                                                dates.push(new Date(stringToDate(coupon[i].coupon_due_end, "dd/MM/yyyy", "/")));
                                            }
                                        }

                                        var maxDate = new Date(Math.max.apply(null, dates));
                                        var minDate = new Date(Math.min.apply(null, dates));

                                        const range = moment_r.range(minDate, maxDate);

                                        var dd = moment();  // THIS IS CURRENT DATE
                                        console.log(dates);
                                        var isValidDate = dd.within(range);


                                        if (isValidDate == true) {


                                            // RETURN THE ERR RESPONSE

                                            //  for (var m = 0; m < req.body.cuisine_list.length; m++) {

                                            for (var i = 0; i < coupon.length; i++) {

                                                if (coupon[i].coupon_code == req.body.promo_code && coupon[i].coupon_used_counter < parseInt(coupon[i].coupon_voucher_limit)

                                                    && coupon[i].coupon_status == "Enable") {
                                                    //CHECKING CUISINE LIST
                                                    //&& coupon[0].coupon_infos[i].cuisine_name == req.body.cuisine_list[m].cuisine_name
                                                    console.log('TESTING CCCC');
                                                    coupon_amount_detail = {};
                                                    coupon_amount_detail.coupon_id = coupon[i]._id;
                                                    // coupon_db_val = coupon[0].coupon_infos[i].coupon_used_counter + 1;
                                                    coupon_amount_detail.coupon_discount_amount = coupon[i].coupon_discount_amount;
                                                    coupon_amount_detail.coupon_discount_operation = coupon[i].coupon_discount_operation;
                                                    coupon_amount_detail.coupon_cuisine_name = coupon[i].categories;
                                                    coupon_amount_detail.status = "coupon_valid";

                                                    current_coupon_count = coupon[i].coupon_used_counter;
                                                    current_coupon_count = current_coupon_count + 1;

                                                    is_coupon_validate = true;
                                                    coupon_final_coll.push(coupon_amount_detail);
                                                    break;

                                                }

                                            }

                                            //    }




                                            // UPDATING COUPON COUNTER +1
                                            if (is_coupon_validate == true) {

                                                res.json({ 'data': coupon_final_coll, 'status': 'coupon_valid' });



                                            }
                                            else {
                                                res.json({ 'data': [], 'status': 'coupon_expired' });

                                            }




                                        } else if (isValidDate == false) {


                                            res.json({ 'data': [], 'status': 'coupon_expired' });
                                        }

                                    }
                                    else {

                                        res.json({ 'data': [], 'status': 'coupon_expired' });
                                    }
                                }

                            });




                    }
                    else {

                        // RETURN THE ERR RESPONSE
                        res.json({ 'data': [], 'status': 'coupon_invalid' });
                    }


                }
            });
    });





router
    .post('/pay-now-for-foods', function (req, res, next) {

        console.log('This is Food Data');
        console.log(req.body);

        var items = req.body;
        var id;

        //     console.log(req.body);

        var temp_arr = [];
        var temp_obj = {};
        var mid_arr = [];
        var final_arr = [];
        var id_arr = [];
        var len = items.length;

        var cook_id_arr = [];
        var cook_id_obj = {};
        // for (var i = 0; i < items.length; i++) {

        for (var i = 0; i < items.length; i++) {

            cook_id_obj = {};
            cook_id_obj.cook_id = items[i].cook_id;
            cook_id_obj.food_id = items[i].food_id;

            cook_id_arr.push(cook_id_obj);
        }
        var uSize = _.uniq(cook_id_arr, function (p) { return p.cook_id; });
        console.log(uSize);

        for (var m = 0; m < uSize.length; m++) {

            mid_arr = [];
            for (n = 0; n < len; n++) {

                if (items[n].cook_id == uSize[m].cook_id) {

                    console.log('FOUND');
                    mid_arr.push(items[n]);

                }

            }
            id = 'ET' + randomstring.generate({ length: 14, charset: 'numeric' });
            id_arr.push(id);
            final_arr.push(mid_arr);
        }

        console.log(final_arr);



        // if (temp_arr.length < 1) {

        //     temp_arr.push(items[0]);

        // }

        // if (temp_arr.length > 0) {

        //     console.log(items.length);
        //     // for (var m = 0; m < temp_arr.length; m++) {

        //     //     for (var n = 0; n < items.length; n++) {

        //     //         if (temp_arr[m].cook_id == items[n].cook_id) {
        //     //             console.log('FOUND');
        //     //             temp_arr.push(items[n]);

        //     //         }

        //     //     }

        //     // }
        //     //    temp_arr.push(items[i]);

        //    }



        //    }

        //  console.log(temp_arr);
        var dataobj = {};
        dataobj.id = id_arr.join("|");

        res.send({ 'status': 'success', 'data': dataobj });



        var is_discount_applied = false;

        for (var s = 0; s < final_arr.length; s++) {


            s_len = final_arr.length;
            db.order_infos.save({

                'order_id': id_arr[s],
                'user_id': mongojs.ObjectId(items[0].user_id),

                'cook_id': mongojs.ObjectId(final_arr[s][0].cook_id),
                'date': moment(new Date()).format("DD/MM/YYYY"),
                'time': moment().toDate().getTime(),
                'order_status': 'pending',
                'items': final_arr[s],
                'pay_status': "false",
                "is_picked": "false",
                'delivery_id': "ETD" + randomstring.generate(6)
            }, function (err, user) {


                // console.log(final_arr);

                // for (var i = 0; i < final_arr.length; i++) {


                //     db.track_order_infos.save({

                //         'main_order_id': id,
                //         'sub_order_id': final_arr[i].order_id,
                //         'cook_id': final_arr[i].cook_id,
                //         'sub_order_status': 'pending',
                //         'time': moment().toDate().getTime(),
                //         'order_history': []

                //     }, function (err, user) {

                //     });  
                // }


                //    'main_order_id': main_id,
                //                                                 'sub_order_id': items[i].order_id,
                //                                                 'cook_id':items[i].cook_id,
                //                                                 'sub_order_status': 'pending',
                //                                                 'time': moment().toDate().getTime(),

            });



        }
        var promo_code = "";
        for (var k = 0; k < final_arr.length; k++) {

            for (var l = 0; l < final_arr[k].length; l++) {

                //  console.log(final_arr[k][l].discount_amt);
                if (final_arr[k][l].discount_amt > 0) {

                    is_discount_applied = true;

                    if (final_arr[k][l].hasOwnProperty('discount_coupon_code')) {

                        promo_code = final_arr[k][l].discount_coupon_code;
                        console.log('THISIS PROMO CODE');
                        console.log(final_arr[k][l].discount_coupon_code);
                    }

                }

                db.track_order_infos.save({

                    'main_order_id': id_arr[k],
                    //  'sub_order_id': final_arr[k][l].order_id,
                    'cook_id': final_arr[k][0].cook_id,
                    'sub_order_status': 'pending',
                    'time': moment().toDate().getTime(),
                    'order_history': []

                }, function (err, user) {

                });
            }

        }
        //&& items[0].pay_mode !='wallet+online' && items[0].pay_mode !='online'
        if (is_discount_applied == true) {


            db.coupon_infos.update({
                "coupon_code": promo_code
            },

                {
                    "$push": {

                        user_arr: { _id: mongojs.ObjectId(items[0].user_id) },

                    }

                }, function (err, data, lastErrorObject) {

                    console.log('COUPON UPDATED');
                    console.log(promo_code);


                });
        }

        // TILL CHECK

        if (items[0].pay_mode == 'wallet') {


            db.user_wallet_infos.find({

                user_id: mongojs.ObjectId(items[0].user_id)

            }, function (err, wallet, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send(err);

                    console.log(err);

                }

                // var temp_tot=0;
                // for(var i=0;i<items.length;i++){

                //     temp_tot=temp_tot+items[i].food_qty*items[i].food_price
                // }


                var old_wallet_amt = wallet[0].wallet_amount;
                var new_wallet_amt = old_wallet_amt - items[0].grand_total;

                var wall_history = {
                    'transac_id': mongojs.ObjectId(),
                    'date': moment(new Date()).format("DD/MM/YYYY"),
                    'added_amt': '',
                    'debit_amt': items[0].grand_total,
                    'time': moment(new Date()).format("HH:mm"),
                    'transac_status': 'success',
                    'previous_amt': old_wallet_amt,
                    'amt_type': 'debit',
                    //    // 'remaining_amt': req.body.address_city,
                    'comment': 'Thanks for using eato eato',

                }

                db.user_wallet_infos.update({
                    "user_id": mongojs.ObjectId(items[0].user_id)
                },

                    {
                        "$set": {

                            wallet_amount: new_wallet_amt,

                        },
                        "$push": {

                            wallet_history: wall_history

                        }




                    }, function (err, data, lastErrorObject) {


                        console.log('wallet is updated');
                    });
                // res.status(200);
                // res.send({ "status": "Amount Added To Wallet" });
            });


            // EMAIL AND SMS SEND

            db.user_infos.find(

                {
                    _id: mongojs.ObjectId(items[0].user_id)
                }
                ,
                function (err, fdata, lastErrorObject) {


                    if (fdata[0].email.isEmailVerified != '') {

                        console.log('FINEEEE');

                        var template = process.cwd() + '/mailers/order/order_placed.html';

                        fs.readFile(template, 'utf8', function (err, file) {
                            if (err) {
                                //handle errors
                                console.log('ERROR!');
                                return res.send('ERROR!');
                            }

                            String.prototype.replaceAll = function (target, replacement) {
                                return this.split(target).join(replacement);
                            };

                            var email_template = file.replace("#user_name#", items[0].username);
                            //  email_template = email_template.replaceAll("#user_email#", 'ankuridigitie@gmail.com');


                            var mailOptions = {
                                from: '"EatoEato 👻" <ankuridigitie@gmail.com>', // sender address
                                to: fdata[0].email, // list of receivers
                                subject: 'Order Successfully Placed With EatoEato', // Subject line
                                //   text: 'Please Verify Your Email Account', // plain text body
                                html: email_template
                            };

                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    console.log(error);
                                    // res.json({
                                    //     yo: 'error'
                                    // });
                                } else {
                                    console.log('Message sent: ' + info.response);
                                    //   res.send(info.response);

                                };
                            });
                        });

                    }


                    // SENDING MOBILE OTP

                    var to_no = parseInt(fdata[0].phone);
                    var message = "Your Order Successfully placed with EatoEato, Payment Receieved Through Wallet , Your Reference Id No. is-" + id;

                    request("http://smsgate.idigitie.com/http-api.php?username=eatoeato&password=idid@1234&senderid=EATOET&route=1&number=" + to_no + "&message=" + message, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            console.log('SMS SEND') // Print the google web page.
                        }
                    })

                    //   res.send(fdata);
                });

            // SENDING MOBILE OTP TO COOK + NOTIFICATION SAVE WALLET

            for (var s = 0; s < uSize.length; s++) {

                (function(s,uSize){

                console.log('FINAL ARRAY -' + s);
                console.log(uSize[s].cook_id);
                var tmp_cookid = uSize[s].cook_id;


                db.cook_infos.find({

                    _id: mongojs.ObjectId(uSize[s].cook_id)

                }, function (err, cookdata) {

                    db.sms_template_infos.find({

                        name: 'Order Received/ Cook'

                    }, function (err, sms_template) {
                        console.log('SMS TEMPLATE');
                        console.log(sms_template);
                        var tmp_sms_body = sms_template[0].body;

                        var cookname = cookdata[0].cook_name;
                        var cookcontact = cookdata[0].cook_contact;
                        var sms_body = tmp_sms_body;

                        console.log('THIS IS COOK CONTACT');
                        console.log(cookcontact);

                        var sms_template = sms_body.replace("^^FIRST_NAME^^", cookname);

                        console.log('THIS IS SMS TEMPLATE');
                        console.log(sms_template);
                        //   res.send(email_template);

                        var to_no = parseInt(cookcontact);
                        var message = sms_template;

                        request("http://smsgate.idigitie.com/http-api.php?username=eatoeato&password=idid@1234&senderid=EATOET&route=1&number=" + to_no + "&message=" + message, function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                                console.log('SMS SEND TO COOKKKK') // Print the google web page.


                            }

                            // SAVING NOTIFICATION DATA

                            db.notification_infos.save(
                             
                                {
                                    notificationid: config.notificationObj.notification_id_cook_order_received,
                                    user_cook_id: mongojs.ObjectId(tmp_cookid),
                                    title: config.notificationTitleContent.notification_title_for_cook_order_received,
                                    message: "Congratulations, You Received a New Order #"+id_arr[s],
                                    seenstatus: '0',
                                    date: moment(new Date()).format("DD/MM/YYYY"),
                                    datetime: Math.round(moment().toDate().getTime() / 1000),

                                }, function (err, user) {

                                    if (err) {
                                        res.status(400);
                                        res.send('error');
                                        throw err;

                                    }

                                    // db.user_infos.find({ _id: mongojs.ObjectId(req.body.userid) }, function (err, userdata) {

                                    //     console.log('USER DATA');

                                    //     sendMessageToUser(userdata[0].token, config.notificationMessageContent.notification_message_for_user_order_confirmed, config.notificationTitleContent.notification_title_for_user_order_confirmed, config.notificationObj.notification_id_user_order_confirmed, 'data2');
                                    //     console.log(userdata);

                                    // });

                                    console.log('NOTIFICATION SAVED');
                                    // res.status(200).send(data);
                                });



                        });



                    });


                });

                })(s,uSize);
            }




        }

        if (items[0].pay_mode == 'cod') {


            db.user_infos.find(

                {
                    _id: mongojs.ObjectId(items[0].user_id)
                }
                ,
                function (err, fdata, lastErrorObject) {

                    if (fdata[0].email.isEmailVerified != '') {

                        console.log('FINEEEE');

                        var template = process.cwd() + '/mailers/order/order_placed.html';

                        fs.readFile(template, 'utf8', function (err, file) {
                            if (err) {
                                //handle errors
                                console.log('ERROR!');
                                return res.send('ERROR!');
                            }

                            String.prototype.replaceAll = function (target, replacement) {
                                return this.split(target).join(replacement);
                            };

                            var email_template = file.replace("#user_name#", items[0].username);
                            //  email_template = email_template.replaceAll("#user_email#", 'ankuridigitie@gmail.com');


                            var mailOptions = {
                                from: '"EatoEato 👻" <ankuridigitie@gmail.com>', // sender address
                                to: fdata[0].email, // list of receivers
                                subject: 'Order Successfully Placed With EatoEato', // Subject line
                                //   text: 'Please Verify Your Email Account', // plain text body
                                html: email_template
                            };

                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    console.log(error);
                                    // res.json({
                                    //     yo: 'error'
                                    // });
                                } else {
                                    console.log('Message sent: ' + info.response);
                                    //   res.send(info.response);

                                };
                            });
                        });

                    }


                    // SENDING MOBILE OTP TO USER

                    db.sms_template_infos.find({

                        name: 'Order Received/ User'

                    }, function (err, sms_template) {

                        var sms_body = sms_template[0].body;

                        var sms_template = sms_body.replace("^^FIRST_NAME^^", items[0].username);


                        //   res.send(email_template);

                        var to_no = parseInt(fdata[0].phone);
                        var message = sms_template + id;

                        request("http://smsgate.idigitie.com/http-api.php?username=eatoeato&password=idid@1234&senderid=EATOET&route=1&number=" + to_no + "&message=" + message, function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                                console.log('SMS SEND') // Print the google web page.


                            }
                        });




                    });


                    // SENDING MOBILE OTP TO COOK + NOTIFICATION SAVE COD

                    for (var s = 0; s < uSize.length; s++) {
                        
                      (function(s,uSize){

                        console.log('FINAL ARRAY -' + s);
                        console.log(uSize[s].cook_id);
                        var tmp_cookid = uSize[s].cook_id;


                        db.cook_infos.find({

                            _id: mongojs.ObjectId(uSize[s].cook_id)

                        }, function (err, cookdata) {

                            db.sms_template_infos.find({

                                name: 'Order Received/ Cook'

                            }, function (err, sms_template) {
                                console.log('SMS TEMPLATE');
                                console.log(sms_template);
                                var tmp_sms_body = sms_template[0].body;

                                var cookname = cookdata[0].cook_name;
                                var cookcontact = cookdata[0].cook_contact;
                                var sms_body = tmp_sms_body;

                                console.log('THIS IS COOK CONTACT');
                                console.log(cookcontact);

                                var sms_template = sms_body.replace("^^FIRST_NAME^^", cookname);

                                console.log('THIS IS SMS TEMPLATE');
                                console.log(sms_template);
                                //   res.send(email_template);

                                var to_no = parseInt(cookcontact);
                                var message = sms_template;

                                request("http://smsgate.idigitie.com/http-api.php?username=eatoeato&password=idid@1234&senderid=EATOET&route=1&number=" + to_no + "&message=" + message, function (error, response, body) {
                                    if (!error && response.statusCode == 200) {
                                        console.log('SMS SEND TO COOKKKK') // Print the google web page.


                                    }

                                    // SAVING NOTIFICATION DATA

                                    db.notification_infos.save(
                                        {

                                            notificationid: config.notificationObj.notification_id_cook_order_received,
                                            user_cook_id: mongojs.ObjectId(uSize[s].cook_id),
                                            title: config.notificationTitleContent.notification_title_for_cook_order_received,
                                            message: "Congratulations, You Received a New Order #"+id_arr[s],
                                            seenstatus: '0',
                                            date: moment(new Date()).format("DD/MM/YYYY"),
                                            datetime: Math.round(moment().toDate().getTime() / 1000),

                                        }, function (err, user) {

                                            if (err) {
                                                res.status(400);
                                                res.send('error');
                                                throw err;

                                            }

                                            // db.user_infos.find({ _id: mongojs.ObjectId(req.body.userid) }, function (err, userdata) {

                                            //     console.log('USER DATA');

                                            //     sendMessageToUser(userdata[0].token, config.notificationMessageContent.notification_message_for_user_order_confirmed, config.notificationTitleContent.notification_title_for_user_order_confirmed, config.notificationObj.notification_id_user_order_confirmed, 'data2');
                                            //     console.log(userdata);

                                            // });

                                            console.log('NOTIFICATION SAVED');
                                            // res.status(200).send(data);
                                        });



                                });



                            });


                        });

                        })(s,uSize);
                    }

                });


        }

    });


router
    .post('/get-user-open-order-by-id', function (req, res, next) {


        var order_coll = {}

        var delivered_orders = {};
        var cancelled_orders = {};
        var open_orders = {};


        db.order_infos.find(

            {
                $and: [{ user_id: mongojs.ObjectId(req.body.user_id) },
                { order_status: 'delivered' }

                ]
            }

        ).sort({ '_id': -1 }, function (err, del_response) {


            if (err) {

                res.send(err);

            }
            else {
                //      res.send(del_response);

                db.review_infos.find({ user_id: mongojs.ObjectId(req.body.user_id) }, function (err, revdata) {

                    console.log('THIS IS USER REVIEW');
                    console.log(revdata);


                    if (del_response.length > 0) {

                        for (var i = 0; i < del_response.length; i++) {

                            result = 0.0;
                            temp_d = 0;
                            for (var j = 0; j < del_response[i].items.length; j++) {

                                temp_d = del_response[i].items[j].food_price * del_response[i].items[j].food_qty;
                                temp_d = temp_d + del_response[i].items[j].delivery_charge;
                                temp_d = temp_d + temp_d * .18;
                                result = result + temp_d;
                            }
                            del_response[i].grand_total = result;
                            del_response[i].is_rated = 'false';
                        }
                        order_coll.delivered_orders = del_response;

                        for (var s = 0; s < revdata.length; s++) {

                            for (var t = 0; t < order_coll.delivered_orders.length; t++) {

                                if (revdata[s].order_id == order_coll.delivered_orders[t].order_id) {

                                    order_coll.delivered_orders[t].is_rated = 'true';
                                    console.log('REVIEW MATHC');
                                }
                            }
                        }

                    }
                    else {

                        order_coll.delivered_orders = [];

                    }
                });



                // 2 nd Callback

                db.order_infos.find(

                    {
                        $and: [{ user_id: mongojs.ObjectId(req.body.user_id) },
                        { order_status: { $in: ['pending', 'confirmed', 'ready_for_del'] } }

                        ]
                    }

                ).sort({ '_id': -1 }, function (err, open_response) {


                    if (err) {

                        res.send(err);

                    }
                    else {
                        //  res.send(del_response);
                        var result = 0.0;
                        var temp_d = 0;
                        if (open_response.length > 0) {

                            for (var i = 0; i < open_response.length; i++) {

                                result = 0.0;
                                temp_d = 0;
                                for (var j = 0; j < open_response[i].items.length; j++) {

                                    temp_d = open_response[i].items[j].food_price * open_response[i].items[j].food_qty;
                                    temp_d = temp_d + open_response[i].items[j].delivery_charge;
                                    temp_d = temp_d + temp_d * .18;
                                    result = result + temp_d;
                                }
                                open_response[i].grand_total = result;
                            }

                            order_coll.open_orders = open_response;

                            //    res.send(open_response);
                        }
                        else {

                            order_coll.open_orders = [];

                        }


                        // 3 rd Callback

                        db.order_infos.find(

                            {
                                $and: [{ user_id: mongojs.ObjectId(req.body.user_id) },
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
                                            temp_d = temp_d + cancel_response[i].items[j].delivery_charge;
                                            temp_d = temp_d + temp_d * .18;
                                            result = result + temp_d;
                                        }
                                        cancel_response[i].grand_total = result;
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



    });


router
    .post('/get-user-open-order-by-id-date', function (req, res, next) {


        var order_coll = {}

        var delivered_orders = {};
        var cancelled_orders = {};
        var open_orders = {};

        var result = 0.0;
        var temp_d = 0;

        db.order_infos.find(

            {
                $and: [{ user_id: mongojs.ObjectId(req.body.user_id) },
                { order_status: 'delivered' },
                { date: req.body.date }
                ]
            }

        ).sort({ '_id': -1 }, function (err, del_response) {


            if (err) {

                res.send(err);

            }
            else {
                //      res.send(del_response);
                if (del_response.length > 0) {


                    // order_coll.delivered_orders = del_response;

                    for (var i = 0; i < del_response.length; i++) {

                        result = 0.0;
                        temp_d = 0;
                        for (var j = 0; j < del_response[i].items.length; j++) {

                            temp_d = del_response[i].items[j].food_price * del_response[i].items[j].food_qty;
                            temp_d = temp_d + del_response[i].items[j].delivery_charge;
                            temp_d = temp_d + temp_d * .18;
                            result = result + temp_d;
                        }
                        del_response[i].grand_total = result;
                        del_response[i].is_rated = 'false';
                    }
                    order_coll.delivered_orders = del_response;

                }
                else {

                    order_coll.delivered_orders = [];

                }

                // 2 nd Callback

                db.order_infos.find(

                    {
                        $and: [{ user_id: mongojs.ObjectId(req.body.user_id) },
                        { order_status: { $in: ['pending', 'confirmed', 'ready_for_del'] } },
                        { date: req.body.date }
                        ]
                    }

                ).sort({ '_id': -1 }, function (err, open_response) {


                    if (err) {

                        res.send(err);

                    }
                    else {
                        //  res.send(del_response);
                        if (open_response.length > 0) {

                            //  order_coll.open_orders = open_response;




                            for (var i = 0; i < open_response.length; i++) {

                                result = 0.0;
                                temp_d = 0;
                                for (var j = 0; j < open_response[i].items.length; j++) {

                                    temp_d = open_response[i].items[j].food_price * open_response[i].items[j].food_qty;
                                    temp_d = temp_d + open_response[i].items[j].delivery_charge;
                                    temp_d = temp_d + temp_d * .18;
                                    result = result + temp_d;
                                }
                                open_response[i].grand_total = result;
                            }

                            order_coll.open_orders = open_response;
                        }
                        else {

                            order_coll.open_orders = [];

                        }


                        // 3 rd Callback

                        db.order_infos.find(

                            {
                                $and: [{ user_id: mongojs.ObjectId(req.body.user_id) },
                                { order_status: { $in: ['cancelled'] } },
                                { date: req.body.date }
                                ]
                            }

                        ).sort({ '_id': -1 }, function (err, cancel_response) {


                            if (err) {

                                res.send(err);

                            }
                            else {
                                //  res.send(del_response);
                                if (cancel_response.length > 0) {

                                    //order_coll.cancelled_orders = cancel_response;
                                    for (var i = 0; i < cancel_response.length; i++) {

                                        result = 0.0;
                                        temp_d = 0;
                                        for (var j = 0; j < cancel_response[i].items.length; j++) {

                                            temp_d = cancel_response[i].items[j].food_price * cancel_response[i].items[j].food_qty;
                                            temp_d = temp_d + cancel_response[i].items[j].delivery_charge;
                                            temp_d = temp_d + temp_d * .18;
                                            result = result + temp_d;
                                        }
                                        cancel_response[i].grand_total = result;
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





    });


router
    .post('/user-contact-validate', function (req, res, next) {

        db.user_infos.find(
            {
                phone: parseInt(req.body.user_contact_no),

            }
            , function (err, user) {

                if (err) {

                    console.log(err);
                    res.status(404);

                    res.send('cook not find');
                } else {

                    if (user.length < 1) {

                        res.send({ 'status': 'Not Registered' });

                    }
                    else {
                        res.send({ "status": "Already Registered" });


                    }


                }


            });
    });


router
    .post('/user-forget-pass-update', function (req, res, next) {

        console.log(req.body);

        db.user_infos.findAndModify({
            query: { phone: parseInt(req.body.user_contact_no) },
            update: {
                $set: {
                    // bcrypt.hashSync(req.body.new_pass, bcrypt.genSaltSync(10))
                    password: bcrypt.hashSync(req.body.user_new_pass, bcrypt.genSaltSync(10))
                }
            },
            new: true
        }, function (err, data, lastErrorObject) {
            if (err) {

                flag = false;

            }
            res.status(200);
            res.send({ "status": "Password Successfully Updated" });

            console.log('COOK password UPDATED');
        });

    });


router
    .post('/add-money-to-wallet', function (req, res, next) {

        console.log(req.body);
        db.user_wallet_infos.find({
            user_id: mongojs.ObjectId(req.body.user_id)
        }, function (err, data, lastErrorObject) {
            if (err) {

                console.log(err);
            }

            console.log(data);

            if (data.length < 1) {

                console.log('NOD ATA FOUND');

                db.user_wallet_infos.save({

                    user_id: mongojs.ObjectId(req.body.user_id),
                    wallet_amount: req.body.wallet_amount,

                }, function (err, user) {

                    console.log('Ammoutn Added');
                    var wall_history = {
                        'transac_id': mongojs.ObjectId(),
                        'date': moment(new Date()).format("DD/MM/YYYY"),
                        'added_amt': req.body.wallet_amount,
                        'debit_amt': '',
                        'time': moment(new Date()).format("HH:mm"),
                        'transac_status': 'success',
                        'previous_amt': '0',
                        'amt_type': 'credit',
                        //    // 'remaining_amt': req.body.address_city,
                        'comment': 'Thanks for using eato eato',

                    }

                    db.user_wallet_infos.findAndModify({
                        query: {
                            user_id: mongojs.ObjectId(req.body.user_id)
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
                        res.status(200);
                        res.send({ "status": "Amount Added To Wallet" });
                    });



                });

            }
            if (data.length > 0) {

                var updated_amt = parseInt(req.body.wallet_amount) + parseInt(data[0].wallet_amount);
                // var remaining_amt=
                var wall_history = {
                    'transac_id': mongojs.ObjectId(),
                    'date': moment(new Date()).format("DD/MM/YYYY"),
                    'added_amt': req.body.wallet_amount,
                    'time': moment(new Date()).format("HH:mm"),
                    'transac_status': 'success',
                    'previous_amt': data[0].wallet_amount,
                    //    // 'remaining_amt': req.body.address_city,
                    'comment': 'Thanks for using eato eato',

                }

                db.user_wallet_infos.findAndModify({
                    query: {
                        user_id: mongojs.ObjectId(req.body.user_id)
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
                            user_id: mongojs.ObjectId(req.body.user_id),
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

                        res.status(200);
                        res.send({ "status": "Amount Added To Wallet" });
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
    .post('/save-user-review', function (req, res, next) {

        console.log('Review');
        console.log(req.body);
        db.review_infos.find({
            order_id: req.body.order_id,
            user_id: mongojs.ObjectId(req.body.user_id),
            food_id: mongojs.ObjectId(req.body.food_id),

        }, function (err, data, lastErrorObject) {
            if (err) {

                console.log(err);
            }


            if (data.length < 1) {



                db.review_infos.save({

                    user_id: mongojs.ObjectId(req.body.user_id),
                    food_id: mongojs.ObjectId(req.body.food_id),
                    cook_id: mongojs.ObjectId(req.body.cook_id),
                    food_name: req.body.food_name,
                    order_id: req.body.order_id,
                    username: req.body.username,
                    review_title: req.body.review_title,
                    review_desc: req.body.review_desc,
                    review_rating: req.body.review_rating,
                    date: moment(new Date()).format("DD/MM/YYYY"),
                    time: moment(new Date()).format("HH:mm")

                }, function (err, review) {

                    if (err) {
                        console.log(err);
                        res.status(400);
                        res.send(err);

                    }

                    res.send({ 'status': 'success', 'data': review });
                    //   console.log(review);

                });

            }
            else {

                console.log('Already added review');
                res.send({ 'status': 'Review Already Added' });
            }

        });
    });

router
    .post('/view-user-review', function (req, res, next) {

        console.log(req.body);
        // db.review_infos.aggregate(

        //     { $match: { user_id: mongojs.ObjectId(req.body.user_id) } },

        //     // { $unwind: "$cook_arr" },
        //     {
        //         $lookup: {
        //             from: 'cook_infos',
        //             localField: 'food_id',
        //             foreignField: 'food_details._id',
        //             as: 'food_info'

        //         },

        //     },
        //     {$project:{review_title:1,review_desc:1,review_rating:1,date:1,time:1,'food_info.food_details._id':1,'food_info.food_details.food_name':1,'food_info.food_details.food_name':1,'food_info.food_details.food_price_per_plate':1,'food_info.food_details.food_img':1}}
        //     , function (err, review, lastErrorObject) {

        //         if (err) {

        //         }

        //         for(var i=0;i<review[0].food_info.length;i++){

        //             for(var j=0;j<review[0].food_info[i].food_details.length;j++){



        //             }
        //         }
        //         res.send(review);

        //     });


        db.review_infos.find({

            user_id: mongojs.ObjectId(req.body.user_id),

        }, function (err, review, lastErrorObject) {

            if (err) {

            }
            console.log(review);
            var review_arr = [];
            review_arr = review;

            db.cook_infos.find({}, {
                'food_details': 1,
                _id: 0
            }, function (err, food, lastErrorObject) {
                if (err) {
                    res.status(400);
                    res.send('error');

                    throw err;

                }

                var food_arr = [];

                for (var i = 0; i < food.length; i++) {

                    if (food[i].food_details.length > 0) {

                        for (var s = 0; s < food[i].food_details.length; s++) {

                            food_arr.push(food[i].food_details[s]);

                        }

                        //  
                        //  
                    }
                }
                //    res.send(food_arr);
                var review_data = [];
                var review_data_obj = {};
                for (var j = 0; j < review_arr.length; j++) {

                    for (var k = 0; k < food_arr.length; k++) {

                        if (food_arr[k]._id == review_arr[j].food_id.toString()) {

                            review_data_obj = {};

                            review_data_obj.food_name = food_arr[k].food_name;
                            review_data_obj.food_price_per_plate = food_arr[k].food_price_per_plate;
                            review_data_obj.food_img = food_arr[k].food_img;
                            review_data_obj.review_title = review_arr[j].review_title;
                            review_data_obj.review_desc = review_arr[j].review_desc;
                            review_data_obj.review_rating = review_arr[j].review_rating;
                            review_data_obj.review_date = review_arr[j].date;
                            review_data_obj.review_time = review_arr[j].time;

                            review_data.push(review_data_obj);
                            console.log('FOUND');
                        }
                    }
                }
                res.send(review_data);


            });



        });


    });


router
    .post('/fetch-user-wallet', function (req, res, next) {

        db.user_wallet_infos.find({
            user_id: mongojs.ObjectId(req.body.user_id)
        }, function (err, data, lastErrorObject) {
            if (err) {

                console.log(err);
            }

            res.send(data);
            console.log(data);
        });
    });


router
    .post('/food-time-validate', function (req, res, next) {


        var incoming_time = req.body.time;
        console.log(incoming_time);


        db.cook_infos.find({
            'food_details._id': mongojs.ObjectId(req.body.food_id)

        }, function (err, data, lastErrorObject) {
            if (err) {
                res.status(400);
                res.send('error');
                console.log(err);

                throw err;

            }

            var food_arr = [];

            for (var i = 0; i < data[0].food_details.length; i++) {

                if (data[0].food_details[i]._id == req.body.food_id) {

                    food_arr.push(data[0].food_details[i]);
                }
            }

            var dt = moment(new Date(), "YYYY-MM-DD HH:mm:ss"); //IT SHOULD BE CURRENT DATE AND CHANGABLE ACC TO USER
            var day = dt.format('dddd').slice(0, 3).toLowerCase().concat('_from');

            console.log('THI IS DAY');

            var extract_db_date_time = data[0].available_hours.day;

            var temp_last_from, temp_last_to, am_pm_from, am_pm_to;

            var incoming_date_val = incoming_time.slice(0, 2);   // FIRST TWO INTEGER FOR INCOMING TIME
            incoming_date_val = parseInt(incoming_date_val);
            var incoming_date_val_am_pm = incoming_time.charAt(incoming_time.length - 2) + incoming_time.charAt(incoming_time.length - 1)

            var is_valid = false;

            // if (incoming_date_val_am_pm == "PM") {

            //     if (parseInt(incoming_date_val) != 12) {
            //         incoming_date_val = parseInt(incoming_date_val) + 12;
            //     }

            // }
            // if (incoming_date_val_am_pm == "AM") {

            //     incoming_date_val = parseInt(incoming_date_val);
            // }

            if (day == "mon_from") {

                if (data[0].available_hours.mon_from != "") {

                    temp_last_from = data[0].available_hours.mon_from;
                    temp_last_to = data[0].available_hours.mon_to;

                    am_pm_from = temp_last_from.charAt(temp_last_from.length - 2) + temp_last_from.charAt(temp_last_from.length - 1);

                    am_pm_to = temp_last_to.charAt(temp_last_to.length - 2) + temp_last_to.charAt(temp_last_to.length - 1);

                    if (am_pm_from == "PM") {

                        temp_last_from = data[0].available_hours.mon_from.slice(0, 1);
                        temp_last_from = temp_last_from + 12;
                    }
                    if (am_pm_from == "AM") {

                        temp_last_from = data[0].available_hours.mon_from.slice(0, 1);
                        console.log(temp_last_from);
                    }
                    if (am_pm_to == "PM") {


                        temp_last_to = data[0].available_hours.mon_to.slice(0, 1);

                        temp_last_to = parseInt(temp_last_to) + 12;

                        console.log(temp_last_to);
                        console.log(incoming_date_val);
                    }
                    if (am_pm_to == "AM") {
                        temp_last_to = data[0].available_hours.mon_to.slice(0, 1);

                    }


                    if (incoming_date_val == temp_last_from) {

                        is_valid = true;

                    }
                    if (incoming_date_val == temp_last_to) {
                        is_valid = true;

                    }

                    if (incoming_date_val > temp_last_from && incoming_date_val < temp_last_to) {

                        is_valid = true;

                    }


                }

                if (is_valid == true) {

                    res.send({ 'status': 'valid' })
                }
                if (is_valid == false) {

                    res.send({ 'status': 'invalid' })
                }
            }


            if (day == "tue_from") {

                if (data[0].available_hours.tue_from != "") {

                    temp_last_from = data[0].available_hours.tue_from;
                    temp_last_to = data[0].available_hours.tue_to;

                    am_pm_from = temp_last_from.charAt(temp_last_from.length - 2) + temp_last_from.charAt(temp_last_from.length - 1);

                    am_pm_to = temp_last_to.charAt(temp_last_to.length - 2) + temp_last_to.charAt(temp_last_to.length - 1);

                    if (am_pm_from == "PM") {

                        temp_last_from = data[0].available_hours.tue_from.slice(0, 1);
                        temp_last_from = temp_last_from + 12;
                    }
                    if (am_pm_from == "AM") {

                        temp_last_from = data[0].available_hours.tue_from.slice(0, 1);
                        console.log(temp_last_from);
                    }
                    if (am_pm_to == "PM") {


                        temp_last_to = data[0].available_hours.tue_to.slice(0, 1);

                        temp_last_to = parseInt(temp_last_to) + 12;

                        console.log(temp_last_to);
                        console.log(incoming_date_val);
                    }
                    if (am_pm_to == "AM") {
                        temp_last_to = data[0].available_hours.tue_to.slice(0, 1);

                    }


                    if (incoming_date_val == temp_last_from) {

                        is_valid = true;

                    }
                    if (incoming_date_val == temp_last_to) {
                        is_valid = true;

                    }

                    if (incoming_date_val > temp_last_from && incoming_date_val < temp_last_to) {

                        is_valid = true;

                    }


                }

                if (is_valid == true) {

                    res.send({ 'status': 'valid' })
                }
                if (is_valid == false) {

                    res.send({ 'status': 'invalid' })
                }
            }

            if (day == "wed_from") {

                if (data[0].available_hours.wed_from != "") {

                    temp_last_from = data[0].available_hours.wed_from;
                    temp_last_to = data[0].available_hours.wed_to;

                    am_pm_from = temp_last_from.charAt(temp_last_from.length - 2) + temp_last_from.charAt(temp_last_from.length - 1);

                    am_pm_to = temp_last_to.charAt(temp_last_to.length - 2) + temp_last_to.charAt(temp_last_to.length - 1);

                    if (am_pm_from == "PM") {

                        temp_last_from = data[0].available_hours.wed_from.slice(0, 1);
                        temp_last_from = temp_last_from + 12;
                    }
                    if (am_pm_from == "AM") {

                        temp_last_from = data[0].available_hours.wed_from.slice(0, 1);
                        console.log(temp_last_from);
                    }
                    if (am_pm_to == "PM") {


                        temp_last_to = data[0].available_hours.wed_to.slice(0, 1);

                        temp_last_to = parseInt(temp_last_to) + 12;

                        console.log(temp_last_to);
                        console.log(incoming_date_val);
                    }
                    if (am_pm_to == "AM") {
                        temp_last_to = data[0].available_hours.wed_to.slice(0, 1);

                    }


                    if (incoming_date_val == temp_last_from) {

                        is_valid = true;
                        console.log('CONTGEAGTS 1');
                    }
                    if (incoming_date_val == temp_last_to) {
                        is_valid = true;
                        console.log('CONTGEAGTS 12');

                    }

                    if (incoming_date_val > temp_last_from && incoming_date_val < temp_last_to) {

                        is_valid = true;
                        console.log('CONTGEAGTS 13');
                    }

                    console.log('NOT EMPTY');
                }

                if (is_valid == true) {

                    res.send({ 'status': 'valid' })
                }
                if (is_valid == false) {

                    res.send({ 'status': 'invalid' })
                }
            }



            if (day == "thu_from") {

                if (data[0].available_hours.wed_from != "") {

                    temp_last_from = data[0].available_hours.thu_from;
                    temp_last_to = data[0].available_hours.thu_to;

                    am_pm_from = temp_last_from.charAt(temp_last_from.length - 2) + temp_last_from.charAt(temp_last_from.length - 1);

                    am_pm_to = temp_last_to.charAt(temp_last_to.length - 2) + temp_last_to.charAt(temp_last_to.length - 1);

                    if (am_pm_from == "PM") {

                        temp_last_from = data[0].available_hours.thu_from.slice(0, 1);
                        temp_last_from = temp_last_from + 12;
                    }
                    if (am_pm_from == "AM") {

                        temp_last_from = data[0].available_hours.thu_from.slice(0, 1);
                        console.log(temp_last_from);
                    }
                    if (am_pm_to == "PM") {


                        temp_last_to = data[0].available_hours.thu_to.slice(0, 1);

                        temp_last_to = parseInt(temp_last_to) + 12;

                        console.log(temp_last_to);
                        console.log(incoming_date_val);
                    }
                    if (am_pm_to == "AM") {
                        temp_last_to = data[0].available_hours.thu_to.slice(0, 1);

                    }


                    if (incoming_date_val == temp_last_from) {

                        is_valid = true;
                        console.log('CONTGEAGTS 1');
                    }
                    if (incoming_date_val == temp_last_to) {
                        is_valid = true;
                        console.log('CONTGEAGTS 12');

                    }

                    if (incoming_date_val > temp_last_from && incoming_date_val < temp_last_to) {

                        is_valid = true;
                        console.log('CONTGEAGTS 13');
                    }

                    console.log('NOT EMPTY');
                }

                if (is_valid == true) {

                    res.send({ 'status': 'valid' })
                }
                if (is_valid == false) {

                    res.send({ 'status': 'invalid' })
                }
            }


            if (day == "fri_from") {

                if (data[0].available_hours.fri_from != "") {

                    temp_last_from = data[0].available_hours.fri_from;
                    temp_last_to = data[0].available_hours.fri_to;

                    am_pm_from = temp_last_from.charAt(temp_last_from.length - 2) + temp_last_from.charAt(temp_last_from.length - 1);

                    am_pm_to = temp_last_to.charAt(temp_last_to.length - 2) + temp_last_to.charAt(temp_last_to.length - 1);

                    if (am_pm_from == "PM") {

                        temp_last_from = data[0].available_hours.fri_from.slice(0, 1);
                        temp_last_from = temp_last_from + 12;
                    }
                    if (am_pm_from == "AM") {

                        temp_last_from = data[0].available_hours.fri_from.slice(0, 1);
                        console.log(temp_last_from);
                    }
                    if (am_pm_to == "PM") {


                        temp_last_to = data[0].available_hours.fri_to.slice(0, 1);

                        temp_last_to = parseInt(temp_last_to) + 12;

                        console.log(temp_last_to);
                        console.log(incoming_date_val);
                    }
                    if (am_pm_to == "AM") {
                        temp_last_to = data[0].available_hours.fri_to.slice(0, 1);

                    }


                    if (incoming_date_val == temp_last_from) {

                        is_valid = true;
                        console.log('CONTGEAGTS 1');
                    }
                    if (incoming_date_val == temp_last_to) {
                        is_valid = true;
                        console.log('CONTGEAGTS 12');

                    }

                    if (incoming_date_val > temp_last_from && incoming_date_val < temp_last_to) {

                        is_valid = true;
                        console.log('CONTGEAGTS 13');
                    }

                    console.log('NOT EMPTY');
                }

                if (is_valid == true) {

                    res.send({ 'status': 'valid' })
                }
                if (is_valid == false) {

                    res.send({ 'status': 'invalid' })
                }
            }


            if (day == "sat_from") {

                if (data[0].available_hours.sat_from != "") {

                    temp_last_from = data[0].available_hours.sat_from;
                    temp_last_to = data[0].available_hours.sat_to;

                    am_pm_from = temp_last_from.charAt(temp_last_from.length - 2) + temp_last_from.charAt(temp_last_from.length - 1);

                    am_pm_to = temp_last_to.charAt(temp_last_to.length - 2) + temp_last_to.charAt(temp_last_to.length - 1);

                    if (am_pm_from == "PM") {

                        temp_last_from = data[0].available_hours.sat_from.slice(0, 1);
                        temp_last_from = temp_last_from + 12;
                    }
                    if (am_pm_from == "AM") {

                        temp_last_from = data[0].available_hours.sat_from.slice(0, 1);
                        console.log(temp_last_from);
                    }
                    if (am_pm_to == "PM") {


                        temp_last_to = data[0].available_hours.sat_to.slice(0, 1);

                        temp_last_to = parseInt(temp_last_to) + 12;

                        console.log(temp_last_to);
                        console.log(incoming_date_val);
                    }
                    if (am_pm_to == "AM") {
                        temp_last_to = data[0].available_hours.sat_to.slice(0, 1);

                    }


                    if (incoming_date_val == temp_last_from) {

                        is_valid = true;
                        console.log('CONTGEAGTS 1');
                    }
                    if (incoming_date_val == temp_last_to) {
                        is_valid = true;
                        console.log('CONTGEAGTS 12');

                    }

                    if (incoming_date_val > temp_last_from && incoming_date_val < temp_last_to) {

                        is_valid = true;
                        console.log('CONTGEAGTS 13');
                    }

                    console.log('NOT EMPTY');
                }

                if (is_valid == true) {

                    res.send({ 'status': 'valid' })
                }
                if (is_valid == false) {

                    res.send({ 'status': 'invalid' })
                }
            }

            if (day == "sun_from") {

                if (data[0].available_hours.sat_from != "") {

                    temp_last_from = data[0].available_hours.sun_from;
                    temp_last_to = data[0].available_hours.sun_to;

                    am_pm_from = temp_last_from.charAt(temp_last_from.length - 2) + temp_last_from.charAt(temp_last_from.length - 1);

                    am_pm_to = temp_last_to.charAt(temp_last_to.length - 2) + temp_last_to.charAt(temp_last_to.length - 1);

                    if (am_pm_from == "PM") {

                        temp_last_from = data[0].available_hours.sun_from.slice(0, 1);
                        temp_last_from = temp_last_from + 12;
                    }
                    if (am_pm_from == "AM") {

                        temp_last_from = data[0].available_hours.sun_from.slice(0, 1);
                        console.log(temp_last_from);
                    }
                    if (am_pm_to == "PM") {


                        temp_last_to = data[0].available_hours.sun_to.slice(0, 1);

                        temp_last_to = parseInt(temp_last_to) + 12;

                    }
                    if (am_pm_to == "AM") {
                        temp_last_to = data[0].available_hours.sun_to.slice(0, 1);

                    }


                    if (incoming_date_val == temp_last_from) {

                        is_valid = true;

                    }
                    if (incoming_date_val == temp_last_to) {
                        is_valid = true;


                    }

                    if (incoming_date_val > temp_last_from && incoming_date_val < temp_last_to) {

                        is_valid = true;

                    }


                }

                if (is_valid == true) {

                    res.send({ 'status': 'valid' })
                }
                if (is_valid == false) {

                    res.send({ 'status': 'invalid' })
                }
            }


        });

    });


router
    .post('/get-payu-data', function (req, res, next) {

        console.log(req.body);
        res.redirect('https://www.eatoeato.com:3000/user/payu-test' + req.body);
    })

router
    .post('/payu-process', function (req, res, next) {

        console.log('PAYU DATA');
        console.log(req.body);
        //   var arr=[];
        var id_arr = req.body.txnid.split("|");
        // id_arr=req.body.txnid;
        console.log(id_arr);

        if (req.body.status == 'failure') {

            res.redirect('https://www.eatoeato.com:3000/#/payment/failure');

            for (var i = 0; i < id_arr.length; i++) {

                db.order_infos.findAndModify({
                    query: {
                        order_id: id_arr[i]
                    },
                    update: {
                        $set: {
                            pay_status: "false",
                            order_status: "cancelled"
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


                    console.log('payment status updated');
                }

                );
            }


        }
        if (req.body.status == 'success') {

            res.redirect('https://www.eatoeato.com:3000/#/payment/success');

            for (var i = 0; i < id_arr.length; i++) {

                db.order_infos.findAndModify({
                    query: {
                        order_id: id_arr[i]
                    },
                    update: {
                        $set: {
                            pay_status: "true"

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


                    console.log('payment status updated');
                }

                );
            }
        }

        //res.send({ redirect:"client/pages/home"});
    });

router
    .post('/payu-process-app', function (req, res, next) {

        console.log('PAYU DATA');
        console.log(req.body);
        //   var arr=[];
        var id_arr = req.body.txnid.split("|");
        // id_arr=req.body.txnid;
        console.log(id_arr);

        if (req.body.status == 'failure') {

            res.send({ 'status': 'failure' });

            for (var i = 0; i < id_arr.length; i++) {

                db.order_infos.findAndModify({
                    query: {
                        order_id: id_arr[i]
                    },
                    update: {
                        $set: {
                            pay_status: "false",
                            order_status: "cancelled"
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


                    console.log('payment status updated');
                }

                );
            }


        }

        if (req.body.status == 'success') {

            res.send({ 'status': 'success' });

            for (var i = 0; i < id_arr.length; i++) {

                db.order_infos.findAndModify({
                    query: {
                        order_id: id_arr[i]
                    },
                    update: {
                        $set: {
                            pay_status: "true"

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


                    console.log('payment status updated');
                }

                );
            }
        }

        //res.send({ redirect:"client/pages/home"});
    });

router
    .post('/payu-process-wallet-online', function (req, res, next) {


        console.log(req.body);
        console.log(req.body);
        //   var arr=[];
        var id_arr = req.body.txnid.split("|");
        // id_arr=req.body.txnid;
        console.log(id_arr);

        if (req.body.status == 'failure') {

            res.redirect('https://www.eatoeato.com:3000/#/payment/failure');

            for (var i = 0; i < id_arr.length; i++) {

                db.order_infos.findAndModify({
                    query: {
                        order_id: id_arr[i]
                    },
                    update: {
                        $set: {
                            pay_status: "false",
                            order_status: "cancelled"
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


                    console.log('payment status updated');
                }

                );
            }


        }
        if (req.body.status == 'success') {

            res.redirect('https://www.eatoeato.com:3000/#/payment/success');

            for (var i = 0; i < id_arr.length; i++) {

                db.order_infos.findAndModify({
                    query: {
                        order_id: id_arr[i]
                    },
                    update: {
                        $set: {
                            pay_status: "true"

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


                    console.log('payment status updated');


                    db.user_wallet_infos.find({

                        user_id: mongojs.ObjectId(req.body.email)

                    }, function (err, wallet, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send(err);

                            console.log(err);

                        }

                        var old_wallet_amt = wallet[0].wallet_amount;
                        var new_wallet_amt = old_wallet_amt - parseInt(req.body.productinfo);


                        var wall_history = {
                            'transac_id': mongojs.ObjectId(),
                            'date': moment(new Date()).format("DD/MM/YYYY"),
                            'added_amt': '',
                            'time': moment(new Date()).format("HH:mm"),
                            'transac_status': 'success',
                            'previous_amt': '0',
                            'amt_type': 'debit',
                            //    // 'remaining_amt': req.body.address_city,
                            'comment': 'Thanks for using eato eato',

                        }

                        db.user_wallet_infos.update({
                            "user_id": mongojs.ObjectId(req.body.email)
                        },

                            {
                                "$set": {

                                    wallet_amount: new_wallet_amt,

                                },
                                "$push": {

                                    wallet_history: wall_history

                                }


                            }, function (err, data, lastErrorObject) {

                                // res.send({ 'status': 'success' });
                                console.log('wallet is updated');


                                res.redirect('http://148.72.248.184:3000/#/payment/success');
                            });
                        // res.status(200);
                        // res.send({ "status": "Amount Added To Wallet" });
                    });


                }

                );
            }
        }



    });



router
    .post('/payu-process-wallet-online-app', function (req, res, next) {


        console.log(req.body);
        //    console.log(req.body);
        //   var arr=[];
        var id_arr = req.body.txnid.split("|");
        // id_arr=req.body.txnid;
        console.log(id_arr);

        if (req.body.status == 'failure') {

            res.send({ 'status': 'failure' });

            for (var i = 0; i < id_arr.length; i++) {

                db.order_infos.findAndModify({
                    query: {
                        order_id: id_arr[i]
                    },
                    update: {
                        $set: {
                            pay_status: "false",
                            order_status: "cancelled"
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




                    console.log('payment status updated');

                }

                );
            }


        }
        if (req.body.status == 'success') {

            //   res.send({'status':'success'});

            for (var i = 0; i < id_arr.length; i++) {

                db.order_infos.findAndModify({
                    query: {
                        order_id: id_arr[i]
                    },
                    update: {
                        $set: {
                            pay_status: "true"

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


                    console.log('payment status updated');


                    db.user_wallet_infos.find({

                        user_id: mongojs.ObjectId(req.body.user_id)

                    }, function (err, wallet, lastErrorObject) {
                        if (err) {
                            res.status(400);
                            res.send(err);

                            console.log(err);

                        }

                        var old_wallet_amt = wallet[0].wallet_amount;
                        var new_wallet_amt = old_wallet_amt - parseInt(req.body.wallet_amt);


                        var wall_history = {
                            'transac_id': mongojs.ObjectId(),
                            'date': moment(new Date()).format("DD/MM/YYYY"),
                            'added_amt': '',
                            'time': moment(new Date()).format("HH:mm"),
                            'transac_status': 'success',
                            'previous_amt': '0',
                            'amt_type': 'debit',
                            //    // 'remaining_amt': req.body.address_city,
                            'comment': 'Thanks for using eato eato',

                        }

                        db.user_wallet_infos.update({
                            "user_id": mongojs.ObjectId(req.body.user_id)
                        },

                            {
                                "$set": {

                                    wallet_amount: new_wallet_amt,

                                },
                                "$push": {

                                    wallet_history: wall_history

                                }


                            }, function (err, data, lastErrorObject) {

                                // res.send({ 'status': 'success' });
                                console.log('wallet is updated');
                                res.send({ 'status': 'success' });
                            });
                        // res.status(200);
                        // res.send({ "status": "Amount Added To Wallet" });
                    });


                }

                );
            }
        }



    });


router
    .post('/payu-wallet-process', function (req, res, next) {


        if (req.body.status == 'failure') {

            console.log('Payment Failed');
            console.log(req.body);

            res.redirect('http://148.72.248.184:3000/#/my_wallet');





        }
        if (req.body.status == 'success') {


            db.user_wallet_infos.find({
                user_id: mongojs.ObjectId(req.body.txnid)
            }, function (err, data, lastErrorObject) {
                if (err) {

                    console.log(err);
                }

                console.log(data);

                if (data.length < 1) {

                    console.log('NOD ATA FOUND');

                    db.user_wallet_infos.save({

                        user_id: mongojs.ObjectId(req.body.txnid),
                        wallet_amount: req.body.amount,

                    }, function (err, user) {

                        console.log('Ammoutn Added');
                        var wall_history = {
                            'transac_id': mongojs.ObjectId(),
                            'date': moment(new Date()).format("DD/MM/YYYY"),
                            'added_amt': req.body.amount,
                            'time': moment(new Date()).format("HH:mm"),
                            'transac_status': 'success',
                            'previous_amt': '0',
                            'amt_type': 'credit',
                            //    // 'remaining_amt': req.body.address_city,
                            'comment': 'Thanks for using eato eato',

                        }

                        db.user_wallet_infos.findAndModify({
                            query: {
                                user_id: mongojs.ObjectId(req.body.user_id)
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
                            res.status(200);

                            res.redirect('http://148.72.248.184:3000/#/my_wallet');
                            //   res.send({ "status": "Amount Added To Wallet" });
                        });



                    });

                }
                if (data.length > 0) {

                    var updated_amt = parseInt(req.body.amount) + parseInt(data[0].wallet_amount);
                    // var remaining_amt=
                    var wall_history = {
                        'transac_id': mongojs.ObjectId(),
                        'date': moment(new Date()).format("DD/MM/YYYY"),
                        'added_amt': req.body.amount,
                        'time': moment(new Date()).format("HH:mm"),
                        'transac_status': 'success',
                        'previous_amt': data[0].wallet_amount,
                        //    // 'remaining_amt': req.body.address_city,
                        'comment': 'Thanks for using eato eato',

                    }

                    db.user_wallet_infos.findAndModify({
                        query: {
                            user_id: mongojs.ObjectId(req.body.txnid)
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
                                user_id: mongojs.ObjectId(req.body.txnid),
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

                            res.status(200);
                            // res.send({ "status": "Amount Added To Wallet" });
                            res.redirect('http://148.72.248.184:3000/#/my_wallet');
                            console.log('THIS IS UPDATED AMT');
                            console.log(updated_amt);
                        });


                        console.log('Ammoutn Added');
                    });



                }

                // console.log('wallet amt added');
            });
            console.log('success');

        }

    });


router
    .post('/payu-wallet-process-android', function (req, res, next) {

        console.log('WALLET DATA');
        console.log(req.body);

        if (req.body.status == 'failure') {

            console.log('Payment Failed');
            console.log(req.body);

            res.send({ status: 'failure' });
            // res.redirect('http://148.72.248.184:3000/#/my_wallet');





        }

        if (req.body.status == 'success') {


            db.user_wallet_infos.find({
                user_id: mongojs.ObjectId(req.body.user_id)
            }, function (err, data, lastErrorObject) {
                if (err) {

                    console.log(err);
                }

                console.log(data);

                if (data.length < 1) {

                    console.log('NOD ATA FOUND');

                    db.user_wallet_infos.save({

                        user_id: mongojs.ObjectId(req.body.user_id),
                        wallet_amount: req.body.amount,

                    }, function (err, user) {

                        console.log('Ammoutn Added');
                        var wall_history = {
                            'transac_id': mongojs.ObjectId(),
                            'date': moment(new Date()).format("DD/MM/YYYY"),
                            'added_amt': req.body.amount,
                            'time': moment(new Date()).format("HH:mm"),
                            'transac_status': 'success',
                            'previous_amt': '0',
                            'amt_type': 'credit',
                            //    // 'remaining_amt': req.body.address_city,
                            'comment': 'Thanks for using eato eato',

                        }

                        db.user_wallet_infos.findAndModify({
                            query: {
                                user_id: mongojs.ObjectId(req.body.user_id)
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
                            res.status(200);
                            res.send({ status: 'success' });
                            //  res.redirect('http://148.72.248.184:3000/#/my_wallet');
                            //   res.send({ "status": "Amount Added To Wallet" });
                        });



                    });

                }
                if (data.length > 0) {

                    var updated_amt = parseInt(req.body.amount) + parseInt(data[0].wallet_amount);
                    // var remaining_amt=
                    var wall_history = {
                        'transac_id': mongojs.ObjectId(),
                        'date': moment(new Date()).format("DD/MM/YYYY"),
                        'added_amt': req.body.amount,
                        'time': moment(new Date()).format("HH:mm"),
                        'transac_status': 'success',
                        'previous_amt': data[0].wallet_amount,
                        //    // 'remaining_amt': req.body.address_city,
                        'comment': 'Thanks for using eato eato',

                    }

                    db.user_wallet_infos.findAndModify({
                        query: {
                            user_id: mongojs.ObjectId(req.body.user_id)
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
                                user_id: mongojs.ObjectId(req.body.user_id),
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

                            res.status(200);
                            // res.send({ "status": "Amount Added To Wallet" });
                            res.redirect('http://148.72.248.184:3000/#/my_wallet');
                            console.log('THIS IS UPDATED AMT');
                            console.log(updated_amt);
                        });


                        console.log('Ammoutn Added');
                    });



                }

                // console.log('wallet amt added');
            });
            console.log('success');

        }

    });



router
    .post('/payu-wallet-process-app', function (req, res, next) {

        console.log(req.body);

        if (req.body.status == 'failure') {

            console.log('Payment Failed');
            console.log(req.body);

            res.send({ 'status': 'failure' });
            var id_arr = req.body.txnid.split("|");
            for (var i = 0; i < id_arr.length; i++) {

                db.order_infos.findAndModify({
                    query: {
                        order_id: id_arr[i]
                    },
                    update: {
                        $set: {
                            pay_status: "false",
                            order_status: "cancelled"
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




                    console.log('payment status Failed updated');

                }

                );
            }


        }
        if (req.body.status == 'success') {


            db.user_wallet_infos.find({
                user_id: mongojs.ObjectId(req.body.txnid)
            }, function (err, data, lastErrorObject) {
                if (err) {

                    console.log(err);
                }

                console.log(data);

                if (data.length < 1) {

                    console.log('NOD ATA FOUND');

                    db.user_wallet_infos.save({

                        user_id: mongojs.ObjectId(req.body.txnid),
                        wallet_amount: req.body.amount,

                    }, function (err, user) {

                        console.log('Ammoutn Added');
                        var wall_history = {
                            'transac_id': mongojs.ObjectId(),
                            'date': moment(new Date()).format("DD/MM/YYYY"),
                            'added_amt': req.body.amount,
                            'time': moment(new Date()).format("HH:mm"),
                            'transac_status': 'success',
                            'previous_amt': '0',
                            'amt_type': 'credit',
                            //    // 'remaining_amt': req.body.address_city,
                            'comment': 'Thanks for using eato eato',

                        }

                        db.user_wallet_infos.findAndModify({
                            query: {
                                user_id: mongojs.ObjectId(req.body.txnid)
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
                            res.status(200);

                            res.send({ 'status': 'success' });
                            //   res.send({ "status": "Amount Added To Wallet" });
                        });



                    });

                }
                if (data.length > 0) {

                    var updated_amt = parseInt(req.body.amount) + parseInt(data[0].wallet_amount);
                    // var remaining_amt=
                    var wall_history = {
                        'transac_id': mongojs.ObjectId(),
                        'date': moment(new Date()).format("DD/MM/YYYY"),
                        'added_amt': req.body.amount,
                        'time': moment(new Date()).format("HH:mm"),
                        'transac_status': 'success',
                        'previous_amt': data[0].wallet_amount,
                        //    // 'remaining_amt': req.body.address_city,
                        'comment': 'Thanks for using eato eato',

                    }

                    db.user_wallet_infos.findAndModify({
                        query: {
                            user_id: mongojs.ObjectId(req.body.txnid)
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
                                user_id: mongojs.ObjectId(req.body.txnid),
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

                            res.status(200);
                            // res.send({ "status": "Amount Added To Wallet" });
                            res.send({ 'status': 'success' });
                            console.log('THIS IS UPDATED AMT');
                            console.log(updated_amt);
                        });


                        console.log('Ammoutn Added');
                    });



                }

                // console.log('wallet amt added');
            });
            console.log('success');

        }

    });



module.exports = router;
