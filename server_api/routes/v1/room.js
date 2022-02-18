
var express = require('express');
var router = express.Router();
var sql = require('../../pool/pool')

// 添加影厅
router.post('/', (req, res, next) => {

    sql.query(`select r_name from room where r_name='${req.body.r_name}'`, (err, result) => {
        if (result.length > 0) {
            return res.send({
                meta: {
                    status: 400,
                    msg: '影厅名称重复'
                }
            })
        }
        // ;
        sql.query(`insert into room(r_name,r_rows,r_cols,screen_location,seat_state,count_seat)values('${req.body.r_name}',${req.body.r_rows},${req.body.r_cols},'${JSON.stringify(req.body.screen_location)}','${JSON.stringify(req.body.seat_state)}','${req.body.count_seat}')`,
            (err, result) => {
                if (err){ return next('错误')}
                res.send({
                    meta: {
                        status: 200,
                        msg: '成功'
                    }
                })
            })
    })

})
// r_name,r_size,seat_state,screen_location

//修改影厅
router.post('/edit',(req,res,next)=>{
  
    let screen = JSON.stringify(req.body.screen_location);
    let seat = JSON.stringify(req.body.seat_state)
    // ;
    // ${req.body.r_id}
    // ;
    sql.query(`update room set r_name=?,r_size=?,seat_state=?,r_rows=?,r_cols=?,screen_location=? where r_id=${req.body.r_id}`,[req.body.r_name,req.body.r_size,seat,req.body.r_rows,req.body.r_cols,screen],(err,result)=>{
        ;
        if(err) throw next('错误')
        res.send({meta:{status:200,msg:'修改成功'}})
    })
})

//获取影厅，传入影厅id则获取对应的id
router.get('/',(req,res,next)=>{
    let obj = req.query

    // ;
    // 查几条数据
    let page = (Number(obj.nowPage)-1) *Number(obj.pageSize)
    let endPage = Number(req.query.pageSize)
    // ;
    if(!obj.hasOwnProperty('searchInput')){
        sql.query(`select r_id,r_name,seat_state,r_rows,r_cols,screen_location from room`,(err,result)=>{
            if(err){return next('失败')}
            let data = {
                data:[],
                meta:{
                    status:200,
                    msg:'获取成功'
                },
                total:result.length
            }
            sql.query(`select r_id,r_name,seat_state,r_rows,r_cols,screen_location from room limit ${page},${endPage}`,(err,result)=>{
                if(err){return next('失败')}
               
                for(let i in result){
                    result[i].seat_state=JSON.parse(result[i].seat_state)
                    result[i].screen_location=JSON.parse(result[i].screen_location)
                }
                data.data=result
                // ;
                res.send(data)
            })
            return 
        })
        
    }
    if(obj.hasOwnProperty('searchInput')){
        // ;
        sql.query('select r_name from room where r_name like ?',[`%${req.query.searchInput}%`],(err,result)=>{
            let data = {
                data:[],
                meta:{
                    status:200,
                    msg:'获取成功'
                },
                total:result.length
            }
            data.total=result.length
            // ;
            sql.query(`select r_name from room where r_name like ? limit ?,?`,[`%${req.query.searchInput}%`,page,endPage],(err,result)=>{
                if(err) return next()
                data.data=result
                res.send(data)
            })
        })
       
    
    }
    // res.send(obj)
    // let str = ''
   
    // sql.query(`select r_id,r_name,seat_state,r_rows,r_cols,screen_location`,(err,result)=>{
    //     ;
    // })
})

// 编辑获取影厅id
router.get('/:id',(req,res,next)=>{
    ;
    if(req.params.id=='all'){
        sql.query('select r_id,r_name from room',(err,result)=>{
            if(err) return next('崩了')
            return res.send({
                data:result,
                meta:{
                    status:200,
                    msg:'查询成功'
                }
            })
        })
    }else{

    let id = req.params.id
    sql.query('select * from room where r_id=?',[id],(err,result)=>{
        if(err){return next('错误')}
        if(result.length==0){
            return res.send({meta:{status:201,msg:'没有哦'}})
        }
        result[0].screen_location=JSON.parse(result[0].screen_location)
        result[0].seat_state=JSON.parse(result[0].seat_state)
        let obj = {
            data:result[0],
            meta:{
                status:200,
                msg:'查询成功'
            }
        }
        
        res.send(obj)
    })
    }
})

//删除影厅
router.delete("/",(req,res)=>{

    sql.query('delete from room where r_id=?',[req.body.r_id],(err,result)=>{
        if(err){return next('失败')}
        res.send(
            {
                meta:{
                    status:200,
                    msg:'删除成功'
                }
            }
        ) 
    })
    // ;
})
module.exports = router