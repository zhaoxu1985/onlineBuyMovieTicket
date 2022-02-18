var express = require('express');
var router = express.Router();
var sql = require('../../pool/pool')


// 登录接口
router.post('/', function (req, res, next) {

    sql.query(`select * from admin where number=? and upwd=?`, [req.body.number, req.body.upwd], (err, data) => {
        if (err) throw err
        let obj = {
            data: {}
        }
        if (data.length > 0) {
            res.send({
                data: {
                    number: data[0].number,
                    upwd: data[0].upwd
                },
                meta: {
                    status: 200,
                    msg: '登录成功'
                }
            })
        } 
        if(data.length==0){
            res.send({
                meta: {
                    status: 404,
                    msg: '登录失败'
                }
            })
        }
    })

});

module.exports = router;