

require('./routes/db.js');
var https = require('https');
var fs = require('fs');
var compression = require('compression');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var tasks = require('./routes/tasks');
var foods = require('./routes/foods');
var user_route = require('./routes/user_route');
var cook_route = require('./routes/cook_route');
var admin_route = require('./routes/admin_route');

var port = 3000;

var app = express();

app.use(compression());

var options = {
  key: fs.readFileSync('/home/eatoeato/ssl/keys/d44d6_50855_23db8fd0b3713a1f85eee3a5b7e1f1e0.key'),
  cert: fs.readFileSync('/home/eatoeato/ssl/certs/eatoeato_com_d44d6_50855_1513036799_10e8d635ad6b8cb73e529fa7fcf67589.crt'),
};

 //server = https.createServer(certOpts, app);
// Set Static Folder

console.log('DIR NAME'+ __dirname);
app.use(express.static(path.join(__dirname, 'client')));
app.use(bodyParser.json({limit: "50mb"}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));
// app.use(bodyParser.json()); 



app.use('/', index);
app.use('/api', tasks);
app.use('/foods', foods);
app.use('/user', user_route);
app.use('/cook', cook_route);

app.use('/admin', admin_route);
var server = https.createServer(options, app);
server.listen(port, function(){
    console.log('Express server listening to port '+port);
});
//  app.listen(port, function(){
//      console.log('Server started on port '+port);
//  });




// require('./routes/db.js');
// var express = require('express');
// var path = require('path');
// var bodyParser = require('body-parser');

// var index = require('./routes/index');
// var tasks = require('./routes/tasks');
// var foods = require('./routes/foods');
// var user_route = require('./routes/user_route');
// var cook_route = require('./routes/cook_route');
// var admin_route = require('./routes/admin_route');

// var gulp = require('gulp');
// var uglify = require('gulp-uglify');
// var pump = require('pump');

// gulp.task('compress', function (cb) {
//   pump([
//     gulp.src('client/pudblic/js/*.js'),
//     uglify(),
//     gulp.dest('dist')
//   ],
//     cb
//   );
// });


// var port = 3000;

// var app = express();


// // Set Static Folder
// app.use(express.static(path.join(__dirname, 'client')));
// app.use(bodyParser.json({ limit: "50mb" }));
// app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));
// // app.use(bodyParser.json()); 


// app.use('/', index);
// app.use('/api', tasks);
// app.use('/foods', foods);
// app.use('/user', user_route);
// app.use('/cook', cook_route);

// app.use('/admin', admin_route);

// app.listen(port, function () {
//   console.log('Server started on port ' + port);
// });