const sql = require('../../pool/pool')

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
//获取时分秒退后10分钟的
function pushGetDate() {
    let now = new Date()
    let hh = now.getHours()

    let mm = now.getMinutes()
    let pushTime = mm + 15;
    if (pushTime >= 60) {
        hh += 1;
        pushTime -= mm;
    }
    hh >= 10 ? '' : hh = '0' + hh
    mm >= 10 ? '' : mm = '0' + mm
    return `${hh}:${pushTime}`
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

// MillisecondToDate()
let nowms = (new Date().getTime());

function shutBuyV2() {
    let countTime = 60;
    let interval = setInterval(() => {
        countTime--
        if (countTime == 0) {
            sql.query(`select period_id,m_date,m_start,m_stop from movie_time where m_date='${getNow()}' and m_start>='${getDate()}' and m_start<='${pushGetDate()}'  and is_buy=1 `, (err, result1) => {
                if (err) throw err;
                // :'暂无');
                for (let i = 0; i < result1.length; i++) {
                    let start = (new Date(`${result1[i].m_date} ${result1[i].m_start}`).getTime()) - 900000;
                    let now = new Date().getTime();
                    if(start-now <=0){
                    sql.query(`update movie_time set is_buy=0 where period_id=${result1[i].period_id}`, (err, result) => {
                        if (err) throw err
                        ;
                    })
                    }
                }
            })  

            countTime = 60;
            let nul = shutBuyV2();
            clearInterval(interval);
        }

        // ;
    }, 1000);
}
module.exports = {
    shutBuyV2
}

