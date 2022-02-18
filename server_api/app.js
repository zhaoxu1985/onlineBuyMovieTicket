var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var logger = require("morgan");
var ejs = require('ejs')
var mount = require('mount-routes');
var fs = require("fs");
var pool = require("./pool/pool");
const Compression = require('compression')
const cors = require('koa2-cors')

// 处理跨域，放到中间件的最前面


var app = express();
// app.use(cors());
//把所有文件压缩
app.use(Compression())
app.all("http://127.0.0.8080/v1/*", function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*"); //允许所有来源访问
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS"); //允许访问的方式
  res.header("Content-Type", "application/json;charset=utf-8");
  res.header("Content-Type", "*");
  next()
});


app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(logger('dev'));
app.use(express.json());

mount(app, './routes', false)

var ejs = require('ejs');

app.engine(".html", ejs.__express);
app.set("view engine", "html");


// catch 404 and forward to error handler
app.use(function (err, req, res, next) {
  next({
    meta: {
      status: 404,
      msg: '失败'
    }
  })
});

// error handler`
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.send({
    mata: {
      status: 404,
      msg: '失败'
    }
  })
});


app.listen(9090);

module.exports = app;