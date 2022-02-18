const {
  query
} = require("express");
var express = require("express");
var router = express.Router();
var sql = require("../../pool/pool");
var qr_image = require("qr-image");
const asyncLock = require('async-lock')
let lock = new asyncLock()


// 修改电影信息
router.post("/", (req, res,next) => {
  ;
  req.body.movie_info.movie_type = req.body.movie_info.movie_type.join('/')
  ;
  sql.query(
    `update movie_info set ? where movie_id=${req.body.movie_info.movie_id}`,
    [req.body.movie_info],
    (err, result) => {
      if (err) return next()
      res.send({
        meta: {
          status: 200,
          msg: "修改成功",
        },
      });
    }
  );
});

//下架电影
router.post("/down", (req, res, next) => {
  ;
  sql.query(
    `select m_id,m_date from movie_time where m_id=${req.body.movie_id} and is_buy=1`,
    (err, result) => {
      if (err) return next("崩了");
      ;
      if (result.length > 0) {
        return res.send({
          meta: {
            status: 202,
            msg: "还有在售的场次,不可删除",
          },
        });
      } else {
        sql.query(
          `update movie_info set is_sale=0 where movie_id=?`,
          [req.body.movie_id],
          (err, result) => {
            // ;
            if (result.affectedRows > 0) {
              return res.send({
                meta: {
                  status: 200,
                  msg: "下架成功",
                },
              });
            } else {
              return res.send({
                meta: {
                  status: 200,
                  msg: "没有此电影的信息，无法下架",
                },
              });
            }
          }
        );
      }
    }
  );
});
//上架电影
router.post("/up", (req, res, next) => {
  ;
  sql.query(
    `update movie_info set is_sale=1,movie_price=? where movie_id=?`,
    [req.body.price, req.body.movie_id],
    (err, result) => {
      if (err) next("崩了");
      ;
      if (result.affectedRows >= 1) {
        return res.send({
          meta: {
            status: 200,
            msg: "上架成功",
          },
        });
      } else {
        return res.send({
          meta: {
            status: 400,
            msg: "上架失败，请联系数据管理员...",
          },
        });
      }
    }
  );
});

//删除预告视频
router.delete("/video", (req, res, next) => {
  ;
  sql.query("delete from trailer where id=?", [req.query.id], (err, result) => {
    ;
    if (err) return next("崩了");
    res.send({
      meta: {
        status: 200,
        msg: "删除成功",
      },
    });
  });
});
//修改预告视频
router.post("/setVideo", (req, res) => {
  ;
  sql.query(
    "update trailer set title=?,t_path=? where id=?",
    [req.body.title, req.body.t_path, req.body.id],
    (err, result) => {
      if (err) return next("崩了");
      res.send({
        meta: {
          status: 200,
          msg: "修改成功",
        },
      });
    }
  );
});
// 删除参与者信息  扮演，导演....
router.delete("/playdel", (req, res) => {
  let str = req.body.id.join(",");
  sql.query(
    `delete from detail_movie_info where id in(${str})`,
    (err, result) => {
      ;
      if (err) throw err;
      if (result.affectedRows > 0) {
        return res.send({
          meta: {
            status: 200,
            msg: "删除成功",
          },
        });
      }
    }
  );
});

//删除剧照,
router.delete("/imgdel", (req, res) => {
  let id = req.body.id;
  ;
  let str = id.join(",");
  ;
  sql.query(`delete from stage_img where id in(${str})`, (err, result) => {
    ;
    if (err) return next("程序崩溃了");
    return res.send({
      meta: {
        status: 200,
        msg: "删除成功",
      },
    });
  });
});

//删除电影时间场次
router.delete("/deltime", (req, res, next) => {
  ;
  sql.query(
    "select seat_state from movie_time where period_id=?",
    [req.body.period_id],
    (err, result) => {
      if (err) return next("崩了");
      try {
        var seat_state = JSON.parse(result[0].seat_state);
      } catch (e) {
        return next("崩了");
      }
      try {
        sql.query(
          `update movie_time set seat_state='${JSON.stringify(
            seat_state
          )}' where period_id=${req.body.period_id}`,
          (err, result) => {
            if (err) throw err;

            let count = 0;
            for (let i = 0; i < seat_state.length; i++) {
              // ;
              if (seat_state[i].state >= 1) {
                count++;
                ;
                // break;
              }
            }
            if (count > 0) {
              return res.send({
                meta: {
                  status: 201,
                  msg: "此场次已经有人购买,不可删除!!!",
                },
              });
            } else {
              sql.query(
                `delete from movie_time where period_id=${req.body.period_id}`,
                (err, result) => {
                  if (err) return next("崩了");
                  if (result.affectedRows > 0) {
                    return res.send({
                      meta: {
                        status: 200,
                        msg: "删除成功",
                      },
                    });
                  }
                }
              );
            }
          }
        );
      } catch (e) {
        return next();
      }
    }
  );
});

//信息确定，座位以锁定，确认购买  需要订单id
router.post("/seatbuy", (req, res, next) => {
  ;
  sql.query(
    "select uid,token,phone,upwd from users where uid=?",
    [req.body.uid],
    (err, result) => {
      if (err) return next("崩了");
      try {
        if (
          req.body.uid != result[0].uid ||
          req.body.token != result[0].token ||
          req.body.phone != result[0].phone
        ) {
          res.send({
            meta: {
              status: 202,
              msg: "您的登录信息失效",
            },
          });
        } else {
          ;
          sql.query(`select order_state from orders where order_id=${req.body.order_id}`,(err,result1)=>{
            if(err) return next()
            if(result1[0].order_state==2){
              return res.send({
                meta:{
                  status:205,
                  msg:'已购买,你想再付一次钱吗?'
                }
              })
            }else{
              sql.query(`update orders set order_state=2 where order_id=${req.body.order_id}`,(err,result)=>{
                  if(err) throw err
                  if(result.affectedRows>0){
                    ;
                    res.send({
                      meta:{
                        status:200,
                        msg:'购买成功'
                      }
                    })
                  }
                  
              })  
            }
          })
         
        }
      } catch (e) {
        return next("崩了");
      }
    }
  );
});
//锁定座位

router.post("/lockSeat", (req, res, next) => {

  lock.acquire('key',function (cb){
  
    sql.query('select order_id from orders', (err, dateL) => {
  
      //生成验证码(8位永久不重复)
      let createTime = new Date().getTime;
  
      try {
        sql.query(
          "select uid,token,phone,upwd from users where uid=?",
          [req.body.uid],
          (err, result) => {
            if (err) return next("崩了");
            //如果用户信息审核失败，返回错误
            try {
              if (
                req.body.uid != result[0].uid ||
                req.body.token != result[0].token ||
                req.body.phone != result[0].phone
              ) {
                cb()
                res.send({
                  meta: {
                    status: 202,
                    msg: "您的登录信息失效",
                  },
                });
              } else {
                //先判断状态有没有被改变 如果有人先预定，则返回某个被预定的座位
                //修改座位状态为1
                //记录是否有被购买的
                let alreadyBuy = [];
                sql.query(
                  "select seat_state from movie_time where period_id=?",
                  [req.body.period_id],
                  (err, result) => {
                  
                    if (err) {
                      cb()
                      next()
                      return 
                    };
                    try {
                      result[0].seat_state = JSON.parse(result[0].seat_state);
                      // ;
                      
                      //查看有没有座位被锁定,如果被锁定,返回被锁定的座位
                      result[0].seat_state.forEach((e1, i1) => {
                        req.body.buy_seat.forEach((e2, i2) => {
                          if (
                            result[0].seat_state[i1].x == req.body.buy_seat[i2].x &&
                            result[0].seat_state[i1].y == req.body.buy_seat[i2].y
                          ) {
                            if (result[0].seat_state[i1].state == 1) {
                              next();
                              return alreadyBuy.push({
                                x: result[0].seat_state[i1].x,
                                y: result[0].seat_state[i1].y,
                              });
                            }
                            return (result[0].seat_state[i1].state = 1,result[0].seat_state[i1].uid=req.body.uid);
                          }
                        });
                      });
                    } catch (e) {
                      cb()
                    
                      return next("崩了");
                    }
                    //如果有已经被抢先购买的，则返回被购买的座位
                    if (alreadyBuy.length >= 1) {
                     
                      res.send({
                        data: {
                          x: alreadyBuy[0].x,
                          y: alreadyBuy[0].y,
                        },
                        meta: {
                          status: 203,
                          msg: `${alreadyBuy[0].x}排${alreadyBuy[0].y}座,正在被预定,换个座位试试吧!`,
                        },
                      });
                      cb()
                      return
                    }
                  
                    //身份确认成功, 座位无占用, 锁定并提交当前用户的订单
                    sql.query(
                      `update movie_time set seat_state=? where period_id=?`,
                      [JSON.stringify(result[0].seat_state), req.body.period_id],
                      (err2, result2) => {
                        if (err){
                          cb()
                          return next()
                        };
                        //生成订单svg形式的二维码
                    
                        var temp_qrcode = qr_image.image(`http://zx.vaiwan.com/adminOrder`, {
                          //设置容错率,L(低), M（中，默认）, Q（高）, H（最高）.
                          ec_level: "Q",
                          margin: 3,
                          size: "100%",
                          type: "svg",
                        });
                        var cb1 = cb
                      
                        temp_qrcode.pipe(require("fs").createWriteStream(`./public/v1/img/qr/${req.body.commit_date}.svg`)
                        .on("finish",async (err, reject)=>{
                        
                            let p =
                            require("path").resolve(__dirname, "../../") +
                            `/public/v1/img/qr/${req.body.commit_date}.svg`;

                            var svgString = require("fs").readFileSync(
                              p,
                              "utf-8"
                            );

                            //读取完成之后,删除svg
                            require('fs').unlink(require("path").resolve(__dirname, "../../") +
                              `/public/v1/img/qr/${req.body.commit_date}.svg`,
                              function (err, result) {
                                ;
                            })
                            
                            
                            let str =String(dateL.length)
                            for(let i=0;str.length<8;i++){
                                str+=(parseInt(Math.random()*11))  
                            }
                            req.body.ticket = str
                            let obj = req.body;
                            sql.query(
                              `insert into orders(movie_id,o_id,movie_name,seat,p_id,buy_time,order_state,price,ticket,qr_img,is_pay)values(${
                                obj.movie_id
                              },${obj.uid},'${obj.movie_name}','${JSON.stringify(
                                obj.buy_seat
                              )}',${obj.period_id},${obj.commit_date},1,${
                                obj.price
                              },${obj.ticket},'${svgString}',0)`,
                              (err, Forder) => {
                                if (err) return next();
                                cb()
                                return res.send({
                                  data: {
                                    order_id: Forder.insertId
                                  },
                                  meta: {
                                    status: 200,
                                    msg: "锁定座位成功",
                                  },
                                });
                              }
                            );
                          })
                        );
                      }
                    );
                  }
                );
              }
            } catch (e) {
              cb1()
              return next("崩了");
            }
          }
        );
      } catch (e) {
        cb1()
        return next();
      }
    })
  }, (err, ret)=>{
      if(err) return next()
  });



  
});

//取消点赞
router.post('/noPraise',(req,res,next)=>{
  //id: 被点赞人的id
  var word = `update ${req.body.bet==0?'comments':'reply'} set c_praise=c_praise-1 where c_id=${req.body.id} and movie_id=${req.body.movie_id};`
  sql.query(word,(err,result)=>{
      if(err) throw err
      sql.query(`select id,praise from u_colle where uid=${req.body.uid}`,(err,result1)=>{
          if(err) throw err
          
          result1[0].praise = JSON.parse(result1[0].praise)
          result1[0].praise.filter((e1,i1)=>{
              if(e1.movie_id==req.body.movie_id && e1.c_id==req.body.id){
                  result1[0].praise.splice(i1,1)
              }
          })
          sql.query(`update u_colle set praise='${JSON.stringify(result1[0].praise)}'`,(err,result3)=>{
              if(err) return next()
              res.send({
                  meta:{
                      status:200,
                      msg:'取消点赞成功'
                  }
              })
          })
         
      })
  })
})

//编辑评论
router.post('/editComment',(req,res,next)=>{
    sql.query(`update comments set c_comment=?,score=? where c_id=? and movie_id=?`,
    [req.body.c_comment, req.body.score, req.body.uid, req.body.movie_id],
    (err,result)=>{
      if(err) return next()
      if(result.affectedRows>0){
       return res.send({
          meta:{
            status:200,
            msg:'修改成功'
          }
        })
      }
      next()
    })
})

//取消想看
router.post('/cancelSee',(req,res,next)=>{
  ;
  sql.query(`select wantToSee from u_colle where uid=?`,[req.body.uid],(err,result1)=>{
    result1[0].wantToSee = JSON.parse(result1[0].wantToSee)
    result1[0].wantToSee.filter((e,i)=>{
      if(e.movie_id==req.body.movie_id  && e.uid == req.body.uid){
        result1[0].wantToSee.splice(i,1)
      }
    })
    sql.query(`update u_colle set wantToSee='${JSON.stringify(result1[0].wantToSee)}' where uid=${req.body.uid};`,(err,result2)=>{
        if(err) throw err
        res.send({
          meta:{
            status:200,
            msg:'取消想看成功'
          }
        })
    })
  })
})

module.exports = router;