const {
    query, urlencoded
} = require('express');
var express = require('express');
const pool = require('../../pool/pool');
var router = express.Router();
var sql = require('../../pool/pool');
var {
    getNow,
    getDate,
    shutBuyV1
} = require('./shutBuyV1')
const {
    route
} = require('./addinfo');

//获取已上映,带有分页功能的电影信息
router.get('/', function (req, res, next) {

    sql.query('select is_sale from movie_info where is_sale=1', (err, total) => {
        if (req.query.hasOwnProperty('nowPage') && req.query.hasOwnProperty('pageSize')) {
            var data = {
                data: [],
                meta: {
                    status: 200,
                    msg: '获取成功'
                },
                total: total.length
            }
            let page = (Number(req.query.nowPage) - 1) * Number(req.query.pageSize)
            let endPage = Number(req.query.pageSize)
            data.data = []
            sql.query(
                `select m.movie_id,m.movie_name,m.is_sale,d_order,time_length,
            m.is_presell,m.movie_type,m.kps,m.main_pic,m.movie_price,online_place,movie_about from movie_info m where m.is_sale=1 ORDER BY m.d_order ASC limit ?,?;
            `, [page, endPage], (err, result) => {
                    if (err) return next('崩了')
                    for (let i in result) {
                        if (result[i].is_sale == 1) {
                            data.data.push(result[i])
                        }
                    }
                    // ;
                    res.send(data)
                })
        } else {
            sql.query(`select m.movie_id,m.movie_name,m.is_sale,d_order,time_length,
            m.is_presell,m.movie_type,m.kps,m.main_pic,m.movie_price,language,online_place,online_time,movie_about from movie_info m where m.is_sale=1 ORDER BY m.d_order ASC;
            select d.which_id,d.play_class,d.actor_id,a.p_name from detail_movie_info d 
            RIGHT JOIN actor_info a
            ON d.actor_id=a.p_id
            where d.play_class='演员';
            `, (err, result) => {
                if (err) return next('崩了')
                for (let i = 0; i < result[0].length; i++) {
                    result[0][i].actorChild = []
                    for (let j = 0; j < result[1].length; j++) {
                        if (result[0][i].movie_id == result[1][j].which_id) {
                            result[0][i].actorChild.push(result[1][j])
                        }
                    }
                }
                res.send({
                    data: result[0],
                    meta: {
                        status: 200,
                        msg: '查询成功'
                    }
                })
            })
        }
    })
});

//获取以下架的电影信息
router.get('/leave', (req, res) => {
    sql.query('select is_sale from movie_info where is_sale=0', (err, total) => {
        if (req.query.hasOwnProperty('nowPage') && req.query.hasOwnProperty('pageSize')) {
            var data = {
                data: [],
                meta: {
                    status: 200,
                    msg: '获取成功'
                },
                total: total.length
            }
            let page = (Number(req.query.nowPage) - 1) * Number(req.query.pageSize)
            let endPage = Number(req.query.pageSize)
            data.data = []
            sql.query(
                `select m.movie_id,m.movie_name,m.is_sale,d_order,time_length,
            m.is_presell,m.movie_type,m.kps,m.main_pic,m.movie_price from movie_info m where m.is_sale=0 limit ?,?
            `, [page, endPage], (err, result) => {
                    if (err) return next('崩了')
                    // ;
                    for (let i in result) {
                        if (result[i].is_sale == 0) {
                            data.data.push(result[i])
                        }
                    }
                    // ;
                    res.send(data)
                })
        } else {
            sql.query(`select m.movie_id,m.movie_name,m.is_sale,d_order,time_length,
            m.is_presell,m.movie_type,m.kps,m.main_pic,m.movie_price from movie_info m where m.is_sale=0
            `, (err, result) => {
                if (err) return next('崩了')
                res.send({
                    data: result,
                    meta: {
                        status: 200,
                        msg: '查询成功'
                    }
                })
            })
        }
    })
})


//搜索以上架的电影名字
router.get('/search', (req, res) => {
    sql.query(`select  m.movie_id,m.movie_name,m.is_sale,
    m.is_presell,m.movie_type,m.kps,m.main_pic,m.movie_price from movie_info m where m.movie_name like '%${req.query.movie_name}%'
    `, (err, result) => {
        if (err) throw res.send({
            status: 404,
            msg: '获取失败'
        })
        let data = {
            data: result,
            meta: {
                status: 200,
                msg: '获取成功'
            }
        }
        res.send(data)
    })
})


//搜索以下架架的电影名字
router.get('/searchLeave', (req, res) => {
    // ;
    sql.query(`select  m.movie_id,m.movie_name,m.is_sale,
    m.is_presell,m.movie_type,m.kps,m.main_pic,m.movie_price from movie_info m where m.movie_name like '%${req.query.movie_name}%' and m.is_sale=0
    `, (err, result) => {
        if (err) throw res.send({
            status: 404,
            msg: '获取失败'
        })
        let data = {
            data: result,
            meta: {
                status: 200,
                msg: '获取成功'
            }
        }
        res.send(data)
    })
})

//根据id获取电影所有人员信息 tree   list 
router.get('/info', (req, res, next) => {
    if (req.query.tree == 1) {
        //tree 树形结构
        sql.query(`
        select DISTINCT play_class from detail_movie_info where which_id=?;
        select a.p_id,d.id,d.which_id,d.cos_play,d.actor_id,d.play_class,a.p_name,a.p_pic,a.birthday,a.about,a.count_fans,a.native_place,a.background from detail_movie_info d
        INNER JOIN actor_info a
        ON d.actor_id=a.p_id
        WHERE d.which_id=?;
        select * from movie_info where movie_id=?`, [req.query.movie_id, req.query.movie_id, req.query.movie_id], (err, result) => {
            if (err) return next('err')
            let obj = {
                meta: {
                    status: 200,
                    msg: '获取成功'
                },
                data: {}
            }
            let arr = []
            for (let i = 0; i < result[0].length; i++) {
                arr[i] = result[0][i]
                arr[i].play_length = 0
                arr[i].children = [];
                for (let j = 0; j < result[1].length; j++) {
                    if (result[0][i].play_class == result[1][j].play_class) {
                        arr[i].children.push(result[1][j])
                        arr[i].play_length++
                    }
                }
            }
            obj.data.actor = arr
            obj.data.movie_info = result[2]
            sql.query(`select id,t_id,t_path,title from trailer where t_id=?`, [req.query.movie_id], (err, result) => {
                if (err) {
                    res.send({
                        meta: {
                            status: 404,
                            msg: '获取失败'
                        }
                    })
                    return next('崩了')
                }
                obj.data.video_list = result
                sql.query('select id,s_id,s_path from stage_img where s_id=?', [req.query.movie_id], (err, result) => {
                    if (err) {
                        res.send({
                            meta: {
                                status: 404,
                                msg: '获取失败'
                            }
                        })
                        return next('崩了')
                    }
                    obj.data.img_list = result
                    res.send(obj)
                })
            })
        })
    }
    if (req.query.tree == 0) {
        // 一维结构
        sql.query(`
        SELECT d.cos_play,a.p_id,a.p_name,a.p_pic,a.birthday,a.about,a.count_fans,a.native_place,a.background,play_class from movie_info m 
        left JOIN detail_movie_info d 
        ON m.movie_id=d.which_id
        INNER JOIN actor_info a on d.actor_id=a.p_id
        WHERE d.which_id=?`, [req.query.movie_id], (err, result) => {
            let obj = {
                data: result,
                meta: {
                    status: 200,
                    msg: '获取成功'
                }
            }
            res.send(obj)
        })
    }
})
//根据id获取单个电影信息
router.get('/movie', (req, res, next) => {
    // ;
    sql.query('select * from movie_info where movie_id=?', [req.query.id], (err, result) => {
        if (err) {
            return next()
        }
        res.send({
            data: result[0],
            meta: {
                status: 200,
                msg: '获取成功'
            }
        })
    })
})
//获取预告视频

router.get('/trailer/get', (req, res, next) => {
    //电影id
    // ;
    let str = 'select id,t_id,t_path,title from trailer where t_id=? and id=?';
    if (!req.query.hasOwnProperty('id')) {
        str = 'select id,t_id,t_path,title from trailer where t_id=?'
    }
    sql.query(str, [Number(req.query.t_id), Number(req.query.id)], (err, result) => {
        // ;
        if (err) return next('崩了')
        res.send({
            data: result,
            meta: {
                status: 200,
                msg: '查询成功'
            }
        })
    })
})

//根据名字获取单个人员
router.get('/actor/get', (req, res, next) => {
    //有id则返回id对应的信息，如果没有，默认返回十条信息
    // ;
    let str = `select p_id,p_name,p_pic,birthday,about,count_fans,native_place,background from actor_info where p_name like '%${req.query.p_name}%'`
    if (req.query.p_name == '') {
        str = 'select p_id,p_name,p_pic,birthday,about,count_fans,native_place,background from actor_info limit 0,5'
    }
    // ;
    sql.query(str, [req.query.p_name], (err, result) => {
        if (err) return next('崩了')
        res.send({
            data: result,
            meta: {
                status: 200,
                msg: '查询成功'
            }
        })
    })
})

//------------------------start---- 函数区域----------------------------
//启动时，对所有已经过了的时间，设置为不可购买

sql.query(`update movie_time set is_buy=0 where m_date<'${getNow()}';
 update movie_time set is_buy=0 where m_date<='${getNow()}' and m_start<='${getDate()}'`, (err, result) => {
    if (err) throw err
    ;
})


//开启时间计时器
// shutBuy(2)
sql.query(`select m_id from movie_time GROUP BY m_id;
select m_id,m_date from movie_time where is_buy=1 GROUP BY m_id,m_date ORDER BY m_date;`, (err, result) => {
    if (err) throw err
    // ;

    for (let i = 0; i < result[0].length; i++) {
        result[0][i].children = []
        for (let j = 0; j < result[1].length; j++) {
            if (result[1][j].m_id == result[0][i].m_id) {
                //    ;
                result[0][i].children.push(result[1][j])
            }
        }
    }

    for (let i = 0; i < result[0].length; i++) {
        if (result[0][i].children.length == 0) {
            continue
        }

    }

})
const {
    shutBuyV2
} = require('./shutBuyV2')
let nul = shutBuyV2()

//------------------------stop---- 函数区域----------------------------
//根据id获取时间安排
//电影时间信息
router.get('/time', (req, res, next) => {

    sql.query(`select m_id,m_date from movie_time where m_id=? and m_date>=? GROUP BY m_date;
select r.r_rows,r.r_cols,r.screen_location,m.period_id,m.m_id,m.m_date,m.seat_state,m.m_rid,m.m_start,m.m_stop,m.price,m.is_buy,r.r_name from movie_time m,room r where m_date>=? and m_id=? and r.r_id=m.m_rid ORDER BY m.m_start;
    `,
        [req.query.movie_id, getNow(), getNow(), req.query.movie_id], (err, result) => {
            if (err) return next('崩了')
            let obj = result[0]

            for (let i = 0; i < result[1].length; i++) {
                result[1][i].seat_state = JSON.parse(result[1][i].seat_state)
            }
            for (let i = 0; i < result[0].length; i++) {
                obj[i].dateChildren = []
                for (let j = 0; j < result[1].length; j++) {
                    if (obj[i].m_date == result[1][j].m_date) {
                        obj[i].dateChildren.push(result[1][j])
                    }
                }
            }
            if (err) return next('崩了')
            obj.sort(function (a, b) {
                var a1 = a.m_date.split('-').join('')
                var a2 = b.m_date.split('-').join('')
                return a1 - a2
            })

            res.send({
                data: obj,
                meta: {
                    status: 200,
                    msg: '查询成功'
                }
            })
        })
})

// 查询某一天的电影时间
router.get('/filterTime', (req, res, next) => {
    // 需要电影id 和 哪一天的电影时间
    // ;
    sql.query(`select m_id,m_date from movie_time where m_id=? and m_date=? and is_buy=1 GROUP BY m_date;
    select r.r_rows,r.r_cols,r.screen_location,m.period_id,m.m_id,m.m_date,m.seat_state,m.m_rid,m.m_start,m.m_stop,m.price,m.is_buy,r.r_name from movie_time m,room r where m_date=? and m_id=? and r.r_id=m.m_rid and is_buy=1 ORDER BY m.m_start;
        `, [req.query.movie_id, req.query.m_date, req.query.m_date, req.query.movie_id], (err, result) => {
        if (err) return next('崩了')
        let obj = result[0]
        if (!obj.length) {
            return res.send({
                meta: {
                    status: 203,
                    msg: '未找到或本场以关闭在线购票,请到实体店铺购买'
                }
            })
        }
        for (let i = 0; i < result[1].length; i++) {
            result[1][i].seat_state = JSON.parse(result[1][i].seat_state)
        }
        for (let i = 0; i < result[0].length; i++) {
            obj[i].dateChildren = []
            for (let j = 0; j < result[1].length; j++) {
                if (obj[i].m_date == result[1][j].m_date) {
                    obj[i].dateChildren.push(result[1][j])
                }
            }
        }
        if (err) return next('崩了')
        obj.sort(function (a, b) {
            var a1 = a.m_date.split('-').join('')
            var a2 = b.m_date.split('-').join('')
            return a1 - a2
        })
        for (let i = 0; i < obj[0].dateChildren.length; i++) {
            next()
            let result = obj[0].dateChildren[i]
            // ;
            let arr = []
            for (let j = 0; j < result.r_rows; j++) {
                arr[j] = []
                for (let k = 0; k < result.seat_state.length; k++) {
                    if (result.seat_state[k].x == j + 1) {
                        arr[j].push(result.seat_state[k])
                    } else {
                        continue
                    }
                }
            }
            result.seat_state = arr
        }
        res.send({
            data: obj,
            meta: {
                status: 200,
                msg: '查询成功'
            }
        })
    })
})

//根据影厅id 获取时间场次信息
router.get('/period', (req, res,next) => {
    // ;
    sql.query(`select r.r_rows,r.r_cols,r.screen_location,m.period_id,m.m_id,m.m_date,m.seat_state,m.m_rid,m.m_start,m.m_stop,m.price,m.is_buy,r.r_name from movie_time m,room r where r.r_id=? and r.r_id=m.m_rid and m.period_id=?`, [req.query.r_id, req.query.period_id], (err, result) => {
        if(err) return next('崩了')
        try{
            result[0].seat_state = JSON.parse(result[0].seat_state)
            result[0].screen_location = JSON.parse(result[0].screen_location)
            let arr = []
            for (let j = 0; j < result[0].r_rows; j++) {
                arr[j] = []
                for (let i = 0; i < result[0].seat_state.length; i++) {
                    if (result[0].seat_state[i].x == j + 1) {
                        arr[j].push(result[0].seat_state[i])
                    } else {
                        continue
                    }
                }
            }
        }catch(e){
           return res.send({
            data:[],
            meta: {
                status: 200,
                msg: '获取成功'
                }
            })
        }
       

        result[0].seat_state = arr
        res.send({
            data: result[0],
            meta: {
                status: 200,
                msg: '获取成功'
            }
        })
    })
})
// 用户 查询订单信息
router.get('/order', (req, res, next) => {
    var obj = req.query

    var sqlstr = `select m.movie_id,m.movie_name,m.movie_type,
    m.time_length,m.main_pic,m.language,m.play_type,m.online_place,
    m.kps,o.order_id,o.order_id,o.o_id,o.ticket,o.seat,o.p_id,
    o.buy_time,o.order_state,o.price,o.qr_img,t.m_date,t.m_start,t.m_stop,r.r_name from orders o
    INNER JOIN movie_info m
    ON o.movie_id=m.movie_id
    INNER JOIN movie_time t
    ON o.p_id=t.period_id
    INNER JOIN room r
    ON t.m_rid=r.r_id
    WHERE o.order_id=${obj.order_id};`

    if (!!req.query.uid && !!req.query.token) {
        sqlstr = `select m.movie_id,m.movie_name,m.movie_type,
        m.time_length,m.main_pic,m.language,m.play_type,m.online_place,
        m.kps,o.order_id,o.order_id,o.o_id,o.ticket,o.seat,o.p_id,
        o.buy_time,o.order_state,o.price,o.qr_img,t.m_date,t.m_start,t.m_stop,r.r_name from orders o
        INNER JOIN movie_info m
        ON o.movie_id=m.movie_id
        INNER JOIN movie_time t
        ON o.p_id=t.period_id
        INNER JOIN room r
        ON t.m_rid=r.r_id
        WHERE o.o_id=${obj.uid} and order_state!=0 ORDER BY order_state ASC LIMIT ${obj.currentSize},5;`
        }
    sql.query(`${sqlstr}`, (err, result) => {
        if (err) throw err
        try {
            if(result.length==0) return res.send(
                {
                    data: result,
                    meta: {
                        status: 200,
                        msg: '暂无'
                    }
                }
            )   
            if (err) throw err
            if (err) return next('崩了')
            result.forEach((e,i)=>{
                result[i].seat = JSON.parse(result[i].seat) 
            })
            res.send({
                data: result,
                meta: {
                    status: 200,
                    msg: '查询成功'
                }
            })
        } catch (e) {

            return next('错误')
        }
    })
})

//查询电影首屏 评论
router.get('/comments',(req,res,next)=>{
    //需要电影id  和 用户 id

    sql.query(`	
    SELECT u.uid,u.net_name,u.headimg,c.id,c.c_commentCount,c.c_praise,c.movie_id,c.c_comment,c.c_time,c.score from comments c
    INNER JOIN users u
    ON u.uid=c.c_id
    WHERE c.movie_id=?`,[req.query.movie_id],(err,result)=>{
        if(err) return next()
        sql.query('select c_id,score,c_comment from comments where movie_id=? and c_id=?',[req.query.movie_id,req.query.uid],(err,result1)=>{
            if(err) throw err
            var data = {
                data:result,
                wetherComment:{
                    isTrue:false,
                    score:'',
                    c_comment:''
                },
                meta:{
                    status:200,
                    msg:'查询成功'
                }
            }
            if(result1.length>=1){
                data.wetherComment={
                    isTrue:true,
                    score:result1[0].score,
                    c_comment:result1[0].c_comment
                }
            }
            res.send(data)
        })
       
    })
})
// 根据评论者id 获取被评的评论 二屏评论
router.get('/reply',(req,res,next)=>{
    ;                                                     //p_id 被评论人的id
    sql.query(`
    select r.id,r.p_id,r.c_pid,r.movie_id,r.reply_time,r.r_comment,r.c_praise,u.net_name
    ,u.headimg
    from reply r
    INNER JOIN users u
    ON r.c_pid=u.uid
    where p_id=? and movie_id=?;`,[req.query.p_id,req.query.movie_id],(err,result)=>{
        if(err) throw err
        res.send({
            data:result,
            meta:{
                status:200,
                msg:'查询成功'
            }
        })
    })
})

//获取用户点赞、收藏、关注 的信息
router.get('/praise',(req,res,next)=>{
    ;
    sql.query('select collect,focus,wantToSee,praise from u_colle where uid=?',[req.query.uid],(err,result)=>{
        if(err) return next()
        for(var k in result[0]){
            result[0][k] = JSON.parse(result[0][k])
            result[0].uid=req.query.uid
        }
    
        res.send(
            {
                data:result[0],
                meta:{
                    status:200,
                    msg:'查询成功'
                }
            }
        )
    })
})
module.exports = router;