
var express = require('express');
var path = require('path');
const {createProxyMiddleware } = require('http-proxy-middleware');
var app = express();

app.use(express.static( 'dist'));
app.use('/', createProxyMiddleware({
    // 代理跨域目标接口
    target: 'http://127.0.0.1:9090/v1/',
    changeOrigin: true,

    // 修改响应头信息，实现跨域并允许带cookie
    onProxyRes: function(proxyRes, req, res) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS"); //允许访问的方式
        res.header("Content-Type", "application/json;charset=utf-8");
        res.header("Content-Type", "*");
    },
    // 修改响应信息中的cookie域名
//  cookieDomainRewrite: ''  // 可以为false，表示不修改
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.listen(3000)

