const {
    query,
    json
} = require('express');
var express = require('express');
var router = express.Router();
var sql = require('../../pool/pool')
var {
    getNow,
    getDate,
} = require('./shutBuyV1')
//添加电影信息
router.post('/', (req, res, next) => {
    sql.query('select movie_name from movie_info where movie_name=?', [req.body.movie_name], (err, result) => {
        if (err) {
            return next('错误,崩了')
        }
        if (result.length > 0) {
            return res.send({
                meta: {
                    status: 400,
                    msg: '电影名称已存在'
                }
            })
        }
        sql.query('insert into movie_info set ?', [req.body], (err, result) => {
            if (err) {
                return next(err)
            }
            ;
            if (result.affectedRows == 1) {
                return res.send({
                    data: {
                        id: result.insertId
                    },
                    meta: {
                        status: 200,
                        msg: '添加成功'
                    }
                })
            }
        })
    })


})

//添加电影人员信息 判断是否存在
router.post('/addActor', (req, res, next) => {
    // ;
    sql.query(`select p_name from actor_info where p_name=?`, [req.body.p_name], (err, result) => {
        if (err) {
            return next('崩了')
        }
        if (result.length > 0) {
            return res.send({
                meta: {
                    status: 400,
                    msg: '已存在相同名字的人员'
                },
            })
        } else {
            sql.query('insert into actor_info set ?', [req.body], (err, result) => {
                if (err) {
                    
                    return next('崩了')
                }
                res.send({
                    meta: {
                        status: 200,
                        msg: '添加成功'
                    }
                })
            })
        }

    })
})
//添加电影参与者信息
router.post('/mactor', (req, res, next) => {
    let obj = req.body;
    ;
    sql.query('insert into detail_movie_info set ?', [obj], (err, result) => {
        if (err) return next('崩了')
        res.send({
            meta: {
                status: 200,
                msg: '添加成功'
            }
        })
    })
})
//添加预告视频
router.post('/video', (req, res, next) => {
    ;
    sql.query('insert into trailer set ?', [req.body], (err, result) => {
        if (err) return next('崩了');
        if (result.affectedRows > 0) {
            return res.send({
                meta: {
                    status: 200,
                    msg: '添加成功'
                }
            })
        }
    })
})
//添加剧照
router.post('/addimg', (req, res, next) => {
    ;
    sql.query('insert into stage_img set ?', [req.body], (err, result) => {
        if (err) return next('崩了')
        ;
        res.send({
            meta: {
                status: 200,
                msg: '添加成功'
            }
        })
    })
})
function getTime(data) {
    let datas = new Date(data)
    let y = datas.getFullYear()
    let m = datas.getMonth() + 1
    let d = datas.getDate()
    m >= 10 ? '' : m = '0' + (datas.getMonth() + 1)
    d >= 10 ? '' : d = '0' + datas.getDate()
    return `${y}-${m}-${d}`
}
//添加电影时间
router.post('/addTime', (req, res, next) => {
  
    let obj = req.body
    let str = ''
    sql.query(`select m_date from movie_time where m_date='${getTime(obj.m_date)}' and m_id=${obj.m_id}`,(err,result)=>{
        if(err) throw err
        if(result.length>0){
            return res.send({meta:{status:202,msg:`${getTime(obj.m_date)},已经添加!,不可重复添加`}})
        }
        
        for (let i = 0; i < obj.timesCount.length; i++) {
            sql.query(`select seat_state from room where r_id=${obj.timesCount[i].m_rid}`, async (err, result) => {
                if (err) throw err
                // ;
                str += `insert into movie_time(m_id,m_rid,m_date,price,is_buy,m_start,m_stop,seat_state)values(${obj.m_id},${obj.timesCount[i].m_rid},'${getTime(obj.m_date)}',${obj.timesCount[i].price},${obj.is_buy},'${obj.timesCount[i].start}','${obj.timesCount[i].stop}','${result[0].seat_state}');`
            })
        }
        setTimeout(function () {
            sql.query(str, (err, result) => {
                if (err) throw err
                res.send({
                    meta: {
                        status: 200,
                        msg: '添加成功'
                    }
                })
            })
        }, 5000)

    })
})

//评论电影
router.post('/component',(req,res,next)=>{
    req.body.c_time=getNow()
        // 电影id,用户id,评论内容,评论时间,评分,
        sql.query('insert into comments set ?',[req.body],(err,result)=>{
            if(err) return next()
            res.send(
                {
                    meta:{
                        status:200,
                        msg:'评论成功'
                    }
                }
            )
        })
})
//回复评论者  需要电影id 被评论人的id,,用户id
router.post('/reply',(req,res,next)=>{
    sql.query(`update comments set c_commentCount=c_commentCount+1 where c_id=${req.body.p_id} and movie_id=${req.body.movie_id};`,(err,result1)=>{
        if(err) return next()
        req.body.reply_time=getNow()
        sql.query('insert into reply set ?',[req.body],(err,result)=>{
            if(err) return next()
            res.send({
                meta:{
                    status:200,
                    msg:'回复成功'
                }
            })
        })
    })
    
})

//点赞评论者
// bet为 0：首屏点赞 comments
//      1：回复点赞 repl
router.post('/praise',(req,res,next)=>{
    var word = `update ${req.body.bet==0?'comments':'reply'} set c_praise=c_praise+1 where c_id=${req.body.c_id} and movie_id=${req.body.movie_id};`
    sql.query(word,(err,result)=>{
        if(err) return next()
        sql.query(`select uid,praise from u_colle where uid=${req.body.uid}`,(err,result1)=>{
            if(err) throw err
            result1[0].praise = JSON.parse(result1[0].praise)
            result1[0].praise.push(
                {
                    movie_id:req.body.movie_id,  //电影id
                    c_id:req.body.c_id,  //被点赞者id
                    uid:req.body.uid //用户id
                }
            )
            result1[0].praise =  JSON.stringify(result1[0].praise)
            sql.query(`update u_colle set praise='${result1[0].praise}'`,(err,result2)=>{
                if(err) return next()
                res.send(
                    {
                        meta:{
                            status:200,
                            msg:'点赞成功'
                        }
                    }
                )
            })
            
        })
        
    })
})
//添加想看电影
router.post('/wantToSee',(req,res,next)=>{
    ;
    ;
    sql.query(`select wantToSee from u_colle where uid=?`,[req.body.uid],(err,result1)=>{
        ;
        result1[0].wantToSee = JSON.parse(result1[0].wantToSee)
        result1[0].wantToSee.push(
            {
                movie_id:req.body.movie_id,
                uid:req.body.uid
            }
        )
        sql.query(`update u_colle set wantToSee='${JSON.stringify(result1[0].wantToSee)}' where uid=?`,[req.body.uid],(err,result2)=>{
            if(err) throw err
            res.send({
                meta:{
                    status:200,
                    msg:'已添加到想看'
                }
            })
        })
    })
})

module.exports = router