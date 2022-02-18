// const { end } = require('../../pool/pool');
var sql = require('../../pool/pool');
//获取年月日
function getNow() {
    let now = new Date()
    let y = now.getFullYear()
    let m = now.getMonth() + 1
    let d = now.getDate()
    m >= 10 ? '' : m = '0' + (now.getMonth() + 1)
    d >= 10 ? '' : d = '0' + now.getDate()
    return `${y}-${m}-${d}`
}

function getTomorow(count=0) {
    let now = new Date()
    let y = now.getFullYear()
    let m = now.getMonth() 
    let d = now.getDate()+ count
    m >= 10 ? '' : m = '0' + (now.getMonth() + 1)
    d >= 10 ? '' : d = '0' + now.getDate()
    return `${y}-${m}-${d}`
}
//获取时分秒
function getDate() {
    let now = new Date()
    let hh = now.getHours()
    let mm = now.getMinutes()
    // hh == 00 ? hh = 24 : ''
    hh >= 10 ? '' : hh = '0' + hh
    mm >= 10 ? '' : mm = '0' + mm
    return `${hh}:${mm}`
}
// 毫秒换算时分秒
function MillisecondToDate(msd) {
    var time = parseFloat(msd) / 1000; //先将毫秒转化成秒
    if (null != time && "" != time) {
        if (time > 60 && time < 60 * 60) {
            time = parseInt(time / 60.0) + "分钟" + parseInt((parseFloat(time / 60.0) - parseInt(time / 60.0)) * 60) + "秒";
        } else if (time >= 60 * 60 && time < 60 * 60 * 24) {
            time = parseInt(time / 3600.0) + "小时" + parseInt((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60) + "分钟" + parseInt((parseFloat((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60) - parseInt((parseFloat(time / 3600.0) - parseInt(time / 3600.0)) * 60)) * 60) + "秒";
        } else {
            time = parseInt(time) + "秒";
        }
    }
    return time;
};

/*
    每次查询和购买时调用此方法，更改可购买状态
    判断开始时间 前十五分钟 关闭可购买状态
*/
//需要提供  电影id 和 当前时间 


// 查询圈数  如果到了 3圈 还没有时间，就结束计时，直至下次添加时间再次开始计时
let  coilCount= 0;
function shutBuyV1(playDate,movie_id) {
        
        console.log('61'+playDate,movie_id);
        let movieName=''
        sql.query(`select movie_name from movie_info where movie_id=${movie_id}`,(err,result)=>{
            if(err) throw err
            movieName=result[0].movie_name
        })
        try {
        sql.query(`select period_id,m_id,m_date,m_rid,m_start,m_stop from movie_time where m_id=${movie_id} and m_date='${playDate}' and is_buy=1`, (err, result) => {
            
                // console.log(result[0]);
            if (result.length != 0) {
                // 排序  拿到当前时间 最近的开始播放场次时间 result[0]
                result.sort(function (a, b) {
                    var value1 = a['m_start'].split(':').join('')
                    var value2 = b['m_start'].split(':').join('')
                    return value1 - value2
                })
                //获取电影开始时间  毫秒值 // 减去15分钟
                let start = (new Date(`${result[0].m_date} ${result[0].m_start}`).getTime())-900000
                 
                //开始计时
                var interval = setInterval(() => {
                    //如果当前时间的毫秒值 >=减去15分钟的开始时间 ，则触发判断，回调并清除旧定时器，开始新的计时器
                    if (new Date().getTime() >= start) {
                        sql.query(`update movie_time set is_buy=0 where period_id=${result[0].period_id}`, (err, result) => {
                            console.log('已更改');
                        })
                        // console.log('91'+result[0].m_date,movie_id);
                        shutBuy(result[0].m_date,movie_id)
                        clearInterval(interval)
                    }
                    let nowTime = new Date().getTime()
                    
                    console.log(`电影:${movieName} 时间${result[0].m_date} ${result[0].m_start} 场次id:${result[0].period_id} 距离结束购买还有:${MillisecondToDate(start-nowTime)}`);
                    
                }, 1000);
            }
            //如果没有电影时间信息，一分钟获取一次，确保判断的执行直到没有添加的电影天数
            if (result.length == 0) {
                
                coilCount +=1;
                let count =5
                let countInterval = setInterval(function () {
                    count--
                    // console.log(getTomorow(coilCount) , movie_id);
                    if (count == 0) {
                        sql.query(`select period_id,m_id,m_date,m_start,m_stop from movie_time where m_date='${getTomorow(coilCount)}' and m_id=${movie_id} and is_buy=1`,(err,result)=>{
                            console.log('今天的没有了，当前进入的:' +getTomorow(coilCount),movie_id );
                            if(result.length==0){ 
                                // console.log('coilCount:'+coilCount);
                                if(coilCount>2){
                                    console.log('无时间,关闭计时通道......')
                                    coilCount=0
                                   return clearInterval(countInterval)
                                }
                                shutBuy(getTomorow(coilCount),movie_id)
                            }
                            if(result.length>0){
                                shutBuy(result[0].m_date,result[0].m_id)
                                clearInterval(countInterval)
                            }
                            clearInterval(countInterval)
                        }) 
                        count=5
                    }
                    console.log(count);
                //    clearInterval(countInterval)
                }, 1000)
            }
        })
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    getNow,
    getDate,
    shutBuyV1
}


// 1.  String Number Boolean null undefined Object Symbel FUnction Set bigInt
// 2.  强制转换Number类型 parseInt([值]) parseFload([值]) Number([值])
// 3.  innetHTML=createElement('div')  
//     insertBefore() 
//     parentRemoveChild()  //不是永久删除，类似于剪切，想要还可以恢复
//     child.remove()  删除节点
// 4.  [node].firstElementChild() //第一个节点
//     [node].lastElementChild()  //最后一个节点

//     nextElementSibling()  //下一个兄弟节点
//     previousELementSibling //上一个兄弟节点
// 5.  [node].childNods  //所有节点
//     [node].parentNode() //父节点
// 6. undefined 1
// 7. undefined 1
// 8. 
// 9.setInterval([function],delay) //多次执行 
//   setTimeout([function],delay) //一次执行
//   清除定时器 : clearInterval  clearTimeout
// 10. document.documentElement.scrollTop
// 11. 事件注册的方式: removieEventListener(type,事件对象)  直接注册方式: 对象.[type]=null
// 12   向下取整： parseInt()   向上取整Math.ceil()

// 二 、
// 1   function getId(id){
//         return document.getElementById(id)
//     }
//     getId('id')
// 2.  let date = new Date()
//     let yyyy = date.getFullYear  //年
//     let mm = date.getMonth()+1 //月
//     let dd = date.getDate()  //日

//     //星期
//     let day = date.getDay()  //周
//     day==0?day=7:'';

//     let hh = date.getHours() //时
//     let nn = date.getMinutes() //分
//     let ss = date.getSeconds() //秒

//     `${yyyy}-${mm}-${dd} 周${day} ${hh}:${nn}:${ss}`

// 3. [node].[type] = function(e){
//     console.log(e.offsetX,e.offsetY)
// }

// 4. 
// 最简单的 :
//             arr.sort(function(a,b){
//                 //升序
//                 return a-b
//                 //降序 
//                 return b-a
//             })
// 复杂点的:
// 冒泡排序:
//         let arr = [8,7,6,5,4,2,1,14,452]
//         for(let i =0;i<arr.length;i++){
//             for(let j=0;j<arr.length;j++){
//                 if(arr[i]<arr[j]){
//                     let a = 0;
//                     a=arr[i];
//                     arr[i]=arr[j];
//                     arr[j]=a;
//                 }
//             }
//         }