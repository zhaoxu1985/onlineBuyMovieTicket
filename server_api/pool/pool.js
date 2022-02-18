const mysql = require('mysql');
const pool = mysql.createPool({
    host: "127.0.0.1", //本地地址
    user: "root", //数据库名字
    charset:'utf8mb4',
    password: "root", //密码
    database: "movies", //连接数据库
    connectionLimit: 10000000, //最大连接数
    multipleStatements: true 
})


module.exports = pool