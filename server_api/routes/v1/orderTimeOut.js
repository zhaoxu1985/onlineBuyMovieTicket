const e = require('express');
var sql = require('../../pool/pool');

let time = 600000

/*
    测试专用,清除所有已选座位
*/
function unlockSeat(period_id){
    sql.query(`select seat_state from movie_time where period_id=${period_id}`,(err,result)=>{
        try{
            var arr = JSON.parse(result[0].seat_state)
            arr.forEach((e,i)=>{
                arr[i].state=0
            })

            sql.query(`update movie_time set seat_state='${JSON.stringify(arr)}'`,(err,result)=>{
                if(result.affectedRows>0){
                    
                }
            })
        }catch(e){}
    })
}
// unlockSeat(546)


// 
//为了防止用户退出网页,计时不继续进行,导致座位锁定,
// 所以为了解决, 服务端进行定时扫描,每隔10秒进行数据库查询,查询以超时的订单,并更改订单状态,释放座位

function delOutOrder(){
    try{
        sql.query('select p_id,buy_time,order_id,seat from orders where order_state=1;',(err,result)=>{
           
            try{

                //过滤超时的订单id
                var filter = result.filter(e => {
                    e.seat = JSON.parse(e.seat)
                   return new Date().getTime() >= parseInt(e.buy_time)+time
                })
                try{
                    //不等0 说明还有过期时间
                    if(filter.length!=0){
                        //这个是订单id
                        var order =[];
                        filter.forEach(e => {
                            order.push(e.order_id)
                        })
                        // 每一个订单,订单的座位
                        var orderSeat = []
                        filter.forEach(function(e,i){
                            orderSeat.push(e.seat)
                        })

                        var arr = []
                        
                        filter.forEach(e=>{
                            arr.push(e.p_id)
                        })
                   
                        //查询场次id 更改座位被锁定的状态为 可购买状态
                        //,m.seat_state
                        sql.query(`select m.period_id,m.seat_state,m.m_id,o.order_id from orders o
                        LEFT JOIN movie_time m
                        ON o.p_id=m.period_id
                        WHERE o.order_id in(${order.join(',')});`,(err,result2)=>{
                            result2.forEach((e,i) => {
                                result2[i].seat_state=JSON.parse(e.seat_state)
                            });
                            try{
                                // ;
                                orderSeat.forEach((o1,oi1)=>{
                                    o1.forEach((o2,oi2)=>{
                                        // ;
                                        // ;
                                        
                                        result2[oi1].seat_state.filter((e,i)=>{
                                            if(e.x == o2.x && e.y == o2.y){
                                                result2[oi1].seat_state[i].state=0;
                                                sql.query(`update movie_time set seat_state='${JSON.stringify(result2[oi1].seat_state)}' where period_id=${arr[oi1]}`,(err,uResult)=>{
                                                    if(err) throw err
                                                    if(uResult.affectedRows>0){
                                                        ;
                                                    }
                                                    sql.query(`update orders set order_state=0 where order_id=${order[oi1]};`,(err,result)=>{
                                                        if ( err ) throw err
                                                        ;
                                                    })
                                                })
                                            }
                                        })
                                    })
                                    ;
                                })
                                
                            }catch(e){}
                         })
                       
                    }
                }catch(e){}
            }
            catch(e){
                return
            }
        })
    }
    catch(e){}
}
delOutOrder()

let interval = setInterval(delOutOrder,1000)
