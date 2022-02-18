const { query } = require('express');
var express = require('express');
var router = express.Router();
var sql = require('../../pool/pool')
var multer = require("multer");
var fs = require('fs')


var {
    getNow, // 2020-1-1
    getDate, // 11：11：11
} = require('./shutBuyV1')



  //上传的文件保存在 upload
  const storage = multer.diskStorage({
    // destination  :设置文件的上传路径
    destination: function (req, file, cb) {
       ;
      //file 是上传的文件信息 比如 文件类型，文件名字，文件大小  。。。。。
      //req.body 除了文件之外的表单信息 比如 id name email
      //按找id进行分文件夹存储
      //如果不存在  就创建一个文件夹
      if (!fs.existsSync("public/v1/users/headimg/" + req.body.phone)) {
        fs.mkdirSync("public/v1/users/headimg/" + req.body.phone, (err) => {});
      }
      //如果存在  就进行路径的按需设置，
      if (fs.existsSync("public/v1/users/headimg/" + req.body.phone)) {
        cb(false, "public/v1/users/headimg/" + req.body.phone);
      }
    },
    //filename 设置文件的名字及后缀  后缀： 文件类型 比如 ：.png .jpg .mp4 ......
    filename: function (req, file, cb) {
      let type = file.originalname.match(/(.[a-z]{3,5})$/i)[0];
      // ;
      // cb :回调函数 调用之后会把会把文件存储到 destination 设置的路径中
      //但是需要自己定义名字及后缀    后缀： 文件类型 比如 ：.png .jpg .mp4 ......
      //null ：在存储之前调用，如果没有就开始存储文件

      cb(false, new Date().getTime() + type);
   
    },
  });
  
  //传入storage 除了这个参数我们还可以传入dest等参数
  const upload = multer({
    storage
  });

router.post('/', upload.single('headimg'),function(req,res,next){
    new Promise((resolve,reject)=>{
        let obj = req.body
        ;
        obj.signup_date = getNow()
        obj.signup_time = getDate()
        obj.token = new Date().getTime()
    //待判断手机号
        sql.query('select phone from users where phone=?',[req.body.phone],(err,result)=>{
            if(err) next();
            if(result.length>0){
                try{
                    fs.unlinkSync(`public/v1/users/headimg/${req.body.phone}/${req.file.filename}`)
                    resolve({
                        meta:{
                            status:204,
                            msg:'手机号已注册'
                        }
                    })
                }catch(e){
                    resolve({meta:{status:500,msg:'请求信息不完善'}})
                }
                
               
            }                                  //       upwd,          net_name,         headimg,                                                   phone,         signup_date,          signup_time,           token
             sql.query(`insert into users(upwd,net_name,headimg,phone,signup_date,signup_time,token)values('${obj.upwd}','${obj.net_name}','/users/headimg/${req.body.phone}/${req.file.filename}','${obj.phone}','${obj.signup_date}','${obj.signup_time}','${obj.token}')`,
             (err,result1)=>{
                 if(err) return next()
                sql.query(`insert into u_colle(phone,uid)value(${obj.phone},${result1.insertId})`,(err,result1)=>{})
                if(err) return next()
                //返回注册的用户信息
                sql.query(`select uid,net_name,email,headimg,phone,token from users where uid=?`,[result1.insertId],(err,result2)=>{
                    if(err) return next()
                    resolve({
                        data:result2[0],
                        meta:{status:200,msg:'注册成功'}
                    })
                })
               
             })
        })
    }).then((data)=>{
        ;
        res.send(data)
    }).catch((e)=>{next()})

})

//用户登录
router.post('/login',(req,res,next)=>{
    ;
    sql.query('select phone,upwd from users where phone=?',[req.body.phone],(err,result1)=>{
        if(err) throw err
        if(result1.length==0){
            return res.send({
                meta:{
                    status:203,
                    msg:'手机号未注册'
                }
            })
        }
        sql.query(`select uid,phone,upwd,net_name,headimg,email,token from users where phone=? and upwd=?`,[req.body.phone,req.body.upwd],(err,result2)=>{
            if(err) throw err
            if(result2.length==0){
                return res.send({
                    meta:{
                        status:202,
                        msg:'密码错误'
                    }
                })
            }
            res.send({
                data:{
                    uid:result2[0].uid,
                    phone:result2[0].phone,
                    net_name:result2[0].net_name,
                    headimg:result2[0].headimg,
                    email:result2[0].email,
                    token:result2[0].token
                },
                meta:{
                    status:200,
                    msg:'登录成功'
                }
            })
        })
    })
})
module.exports=router
