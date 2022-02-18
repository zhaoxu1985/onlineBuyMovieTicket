<template>
  <div style="height:50%">
    <el-card>
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>排片管理</el-breadcrumb-item>
        <el-breadcrumb-item>添加排片</el-breadcrumb-item>
      </el-breadcrumb>
    </el-card>
    <el-card style="margin-top:10px;position: relative;">
      
      <div class="sliderBox">
        <my-swiper @index-data="indexData($event)" :data="movie_info"></my-swiper>
      </div>
      <div class="pointer"></div>
    </el-card>
    <el-tabs type="border-card" style="margin-top:10px;min-height:400px;text-align:center;margin-bottom:20px">
      <div v-if="movie_time.length==0" class="timeIsNull">
        <div style="width:100%">暂无时间安排</div>
        <el-button style="margin-top:10%" type="success" @click="addTime">添加拍片</el-button>
      </div>
      <el-card v-if="movie_time.length>0">
        <el-button type="success" @click="addTime">添加拍片</el-button>
      </el-card>
      <!-- ----------- start 时间渲染------------ -->
      <el-tab-pane   style="margin-top:10px" :label="item.m_date" v-for="(item,i) in movie_time" :key="i">
        <el-table  :data="item.dateChildren" style="width: 100%;min-height:300px" :default-sort="{prop: 'm_start', order: 'descending'}">
          <el-table-column prop="period_id" label="场次id" width="100">
          </el-table-column>

          <el-table-column prop="m_date" label="日期" width="180">
          </el-table-column>

          <el-table-column prop="r_name" label="放映室">
          </el-table-column>

          <el-table-column prop="m_start" sortable='custom' label="开始时间">
          </el-table-column>

          <el-table-column prop="m_stop" label="结束时间">
          </el-table-column>

          <el-table-column prop="tag" label="是否可购买" width="100" filter-placement="bottom-end">
            <template slot-scope="scope">
              <el-tag :type="scope.row.is_buy === '0' ? 'danger' : 'success'" disable-transitions>
                {{scope.row.is_buy=='1' ? '是' : '否'}}</el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="price" label="本场价格">
          </el-table-column>

          <el-table-column label="编辑" width="200">
              <template slot-scope="scope">
                <div>
                    <el-popconfirm
                        title="这是一段内容确定删除吗？"
                        @confirm="delAlreadyAddTime(scope.row)"
                      >
                            <el-button slot="reference" size="small" @click="visible = true" type="danger">删除</el-button>

                      </el-popconfirm>
                
                
                </div>
              </template>
          </el-table-column>
        </el-table>

      </el-tab-pane>

      <!-- -----------stop 时间渲染------------ -->
    </el-tabs>
    <div style="width:100%;height:10px"></div>
    <!------------------start 添加影片的dialog ------------------->

    <el-dialog title="设置开始时间" :visible.sync="addTimeVisibel" width="90%" :before-close="addTimehandleClose" center>
      

      <el-form :model="addTimeForm" :rules="rules" ref="addTimeTemFormRef" label-width="100px" class="demo-ruleForm">
        <el-row>
           <el-col :span="12">
                   <el-form-item label="日期" prop="m_date">
                      <!--选择时间 -->
                      <el-date-picker style="width:100%"  v-model="addTimeForm.m_date" align="right" type="date" placeholder="选择日期"
                        :picker-options="pickerOptions">
                      </el-date-picker>
                    </el-form-item>
           </el-col>
           <el-col :span="12">
             
               
           </el-col>
        </el-row>
        <el-row>
 
        </el-row>

    
            <el-alert style="margin-bottom:10px" v-show="dateIsNull" title="请先选择日期" type="warning" :closable="false">
            </el-alert>
            <el-row v-for="(item,i) in addTimeForm.timesCount" :key="i">
              <el-col :span="5">
                  <el-form-item label="开始时间" :prop="`timesCount.${i}.start`" :rules="rules.start" >
                    <el-time-select :disabled="dateIsNull" style="width:auto;" @change="selectTime(item.start,i)" format="HH-mm" v-model="item.start" :picker-options="{
                        start: '08:00',
                        step: '00:05',
                        end: '23:30'
                      }" placeholder="添加时间">
                    </el-time-select>
                  </el-form-item>
              </el-col>
              <el-col :span="5" >
                  <el-form-item label="结束时间">
                        <el-input
                          placeholder="选择开始时间自动生成结束时间"
                          v-model="item.stop"
                          :disabled="true">
                        </el-input>
                  </el-form-item>
              </el-col>
              <el-col :span="4">
                   <el-form-item label="票价" :prop="`timesCount.${i}.price`" :rules="rules.price">
                        <el-input v-model="item.price" placeholder="本场价格"></el-input>
                    </el-form-item>
              </el-col>
              <el-col :span="5">
                  <el-form-item label="选择影厅" :prop="`timesCount.${i}.m_rid`" :rules="rules.m_rid">
                        <el-autocomplete
                          v-model="item.temRoomName"
                          :fetch-suggestions="querySearchAsync" 
                          placeholder="请输入内容"
                          @select="roomSelectd($event,i)"
                        ></el-autocomplete>
                    </el-form-item>
              </el-col>
              <el-col :span="5">
                <el-button @click="delTime(i)" style="margin-left:20px" type="danger"><i class="iconfont el-icon-shanchu"></i></el-button>
              </el-col>
              <el-divider></el-divider>
            </el-row>
            
            <div style="text-align:center">
              <el-button @click="addTimeArr()" type="success">添加时间</el-button>
            </div>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addTimeCancel('addTimeTemFormRef')">取 消</el-button>
        <el-button :element-loading-text="loadText" v-loading.fullscreen.lock="addLoading" type="primary" @click="addTimeFinish('addTimeTemFormRef')">确 定</el-button>
      </span>
    </el-dialog>
    <!------------------stop 添加影片的dialog ------------------->
  </div>
</template>

<script>
  import mySwiper from './HomeSwiper.vue'
  export default {
    
    components: {
      mySwiper,
    },
    data() {
          var movie_price= (rule, value, callback) => {
          var regex =/(^[1-9]\d*(\.\d{1,2})?$)|(^0(\.\d{1,2})?$)/
          if(!regex.test(value)){
            callback(new Error('请输入正确格式,最多两位小数'))
          }else if(value<1){
              this.$notify({
                  title: '警告',
                  message: '请输入价格',
                  type: 'warning'
              })
          }else{
              callback()
          }
        }
        var start= (rule, value, callback) => {
            for(let i =0;i<this.addTimeForm.timesCount.length;i++){
              for(let j=0;j<i;j++){
                if(this.addTimeForm.timesCount[i].start==this.addTimeForm.timesCount[j].start){
                   callback(new Error('重复'))
                }
              }
            }
            
          
          if(value<1){
             callback(new Error('请输入开始时间'))
          }else{
              callback()
          }
        }
      return {
        // 当前轮播索引值(电影id)
        movieIndex: '',
        movie_info: [],
        //每场的电影时间表
        movie_time: [],
        movie_img: {},
        addTimeVisibel: false,

        //确定删除timeAlreadyAddTime显示隐藏
        visible:false,

    
        //总提交表单
        addTimeForm: {
              //选择日期
              m_date:'',
              // 电影id
                  m_id:'',
              // 多个时间数组时间
              timesCount:[
                {
                  start:'',
                  stop:'',
                   //影厅id
                  m_rid:'',
                    //临时选择的影厅名称
                  temRoomName:'',
                  //本场票价
                  price:this.getPrice,
                }
              ],
              
              //是否可购买:,
              is_buy:1,
        },
        //加载loading
        addLoading:false,
        loadText:'添加中...',
        pickerOptions: {
          disabledDate(time) {
            return time.getTime() + 86400000 < new Date()
          },
          shortcuts: [{
            text: '今天',
            onClick(picker) {
              picker.$emit('pick', new Date());
            }
          }, {
            text: '明天',
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() + 3600 * 1000 * 24);
              picker.$emit('pick', date);
            }
          }, {
            text: '后天',
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 2);
              picker.$emit('pick', date);
            }
          }, {
            text: `${new Date().getMonth()+1}月${new Date().getDate()+3}日`,
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 3);
              picker.$emit('pick', date);
            }
          }, {
            text: `${new Date().getMonth()+1}月${new Date().getDate()+4}日`,
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 4);
              picker.$emit('pick', date);
            }
          }, {
            text: `${new Date().getMonth()+1}月${new Date().getDate()+5}日`,
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() + 3600 * 1000 * 24 * 5);
              picker.$emit('pick', date);
            }
          }]
        },
        rules: {
          //  now_date start
          m_date: [{
            type: 'date',
            required: true,
            message: '请选择日期',
            trigger: 'change'
          }],
          start: [{
             validator: start, trigger: 'change' 
          }],
          m_rid:[
              {
                type: 'number',
                required: true,
                message: '请选择影厅',
                trigger: 'change'
              }
          ],
          price:[
             { validator: movie_price, trigger: 'change' }
          ]

        }
      }
    },
    methods: {
      //获取电影信息
      async getMovieInfo() {
        let {
          data: res
        } = await this.$axios.get('/getInfo')
        if (res.meta.status != 200) return this.$message.error('获取电影信息失败')
        this.$message.success('获取成功')
        this.movie_info = res.data

      },
      //接收子组件的值
      indexData(e) {
        this.movieIndex = e
        console.log(e);
      },

      //获取时间信息
      async getMovieTime() {
        let {
          data: res
        } = await this.$axios.get('/getinfo/time', {
          params: {
            movie_id: this.movieIndex
          }
        })
        if (res.meta.status !== 200) return this.$message.error('获取失败')
        this.movie_time = res.data;
        console.log(res.data);
      },
      //---------------start----添加电影----------------------
      //添加排片时间按钮 dialog显示
      addTime() {
        this.addTimeForm.timesCount[0].price=this.getPrice
        this.addTimeForm.m_id=this.movieIndex
        this.addTimeVisibel = true
      },
      addTimehandleClose(done) {
        this.$confirm('确认关闭？')
          .then(_ => {
            done();
          })
          .catch(_ => {});
      },

      //addTimeFinish 确定添加按钮
      addTimeFinish(ref) {
        
        this.$refs[ref].validate(async (valid) => {
          if (valid) {
            this.addLoading=true
            let count =0
            let arr =['添加中......','创建时间中......','创建座位影厅中......','即将完成......']
            let that = this
            let interval = setInterval(function(){
                that.loadText=arr[count];
                 count++
                if(count==4) clearInterval(interval)
               
            },parseInt(Math.random()*1000)+1)
            console.log(this.addTimeForm);
             let {data:res} = await  this.$axios.post('/addinfo/addTime',this.addTimeForm)
             if(res.meta.status!=200) { 
               this.addLoading=false
                return this.$message.error(res.meta.msg)
             }
             this.$message.success('添加成功')
             this.addTimeVisibel=false
             this.$refs[ref].resetFields()
             this.getMovieTime()
             this.addTimeForm.timesCount=[
                {
                  start:'',
                  stop:'',
                   //影厅id
                  m_rid:'',
                    //临时选择的影厅名称
                  temRoomName:'',
                  //本场票价
                  price:this.getPrice,
                }
              ],
             this.addLoading=false
          } else {
            return this.$notify.error('请输入关键信息');
          }
        });
        // time()
      },
      // 取消,不关闭dialog
      addTimeCancel(ref) {
        this.addTimeVisibel = false
        this.$refs[ref].resetFields()
      },
      //算出今天的的拍片 需提供
      //电影时长  日期   开始时间 
      time(tlength, date, start) {
           // let d = delay*60*1000
            let th = tlength*60*1000 
            //电影时间毫秒值
            // 当前年-月-日 
            let tdate = (new Date(date+" "+start).getTime())
            let tdate2 = (new Date(date+" "+start).getTime()+th)
            // 用来存储时
            let timearr = {
              start:'',
              stop:''
            }
            for (let i = 0; i < 1; i++) {
                if(new Date(tdate+(th*i)).getDay() > new Date(tdate).getDay()){
                    break;
                }
                timearr.start=new Date(tdate+(th*i))
                timearr.stop=new Date(tdate2+(th*i))
            }
            return timearr
      },
        formateHM(date){

              let hh = date.getHours()
              let mm = date.getMinutes()
              hh == '00' ? hh = '24' : ''
              hh >= '10' ? '' : hh = '0' + hh
              mm >= '10' ? '' : mm = '0' + mm
            return `${hh}:${mm}`
          
        },
          // 添加时间按钮
          addTimeArr(){
            this.addTimeForm.timesCount.push({start:this.addTimeForm.timesCount[this.addTimeForm.timesCount.length-1].start,stop:'',price:this.getPrice})
          },
          // 选择时间触发change
          selectTime(e,i){
               let date = `${this.addTimeForm.m_date.getFullYear()}-${this.addTimeForm.m_date.getMonth()+1}-${this.addTimeForm.m_date.getDate()}`
                //传递  电影时长  日期   开始时间
               let startEndStop = this.time(this.getTimeLength,date,e)
               let str = this.formateHM(startEndStop.stop);
               if(this.addTimeForm.timesCount[i].start=='' || this.addTimeForm.timesCount[i].start==null){
                  return this.addTimeForm.timesCount[i].stop='无'
               }
               this.addTimeForm.timesCount[i].stop=this.formateHM(startEndStop.stop);
          }
          ,
          //删除时间段
          delTime(i){
              this.addTimeForm.timesCount.splice(i,1)
          },
          // querySearchAsync roomSelectd
        //手动输入搜索 room 触发事件
          async querySearchAsync(queryString,cb){
              console.log('搜索触发');
              let {data:res}=await this.$axios.get('room/all')
              if(res.meta.status!==200)return this.$message.error('查询错误')
              let arr =[]
              res.data.forEach((e,i)=>{
                arr.push({value:e.r_name,id:e.r_id,})
              })
              cb(arr)
           
          },
          //选择了一个值后触发
          roomSelectd(e,i){
          
              this.addTimeForm.timesCount[i].m_rid=e.id
              // this.temRoomName=e.value
          },

          //删除已经添加的时间 ， 需要做判断， 如果已经有用户购买了次场次，不可删除
          async delAlreadyAddTime(row){
             let {data:res} = await  this.$axios.delete('/updateinfo/deltime',{data:row})
             if(res.meta.status!=200) return this.$message.error(res.meta.msg)
             this.$message.success(res.meta.msg)
             this.getMovieTime()
          }
      //---------------stop----添加电影----------------------
    },
    watch: {
      movieIndex() {
        this.getMovieTime()
      },
    },
    //loading结束后,还需要做一些初始化，(data数据已经初始化，Dom已完成，组件未加载)
    created() {
      console.log('created');
      this.getMovieInfo()
    },
    //数据已加载，dom渲染完成，
    mounted() {
      
    },
    computed:{
       getTimeLength(){
         let timeLength = ''
          this.movie_info.forEach((e, i) => {
            if (e.movie_id == this.movieIndex) {
              timeLength = e.time_length
            }
          });
          return timeLength
       },
      //  获取电影价格
      getPrice(){
          let price = ''
            this.movie_info.forEach((e, i) => {
              if (e.movie_id == this.movieIndex) {
                price=e.movie_price
              }
            });
            return price
      },
       //m_date是否为空
       dateIsNull(){
          return this.addTimeForm.m_date=='' || this.addTimeForm.m_date==null?true:false;
       }
    }
  }
</script>

<style>

  .sliderBox {
    width: 100%;

    overflow: hidden;
  }

  .timeBox {
    width: 100%;
    height: 40px;
    background-color: aqua;
    margin: 5px 0px 5px 0px;
  }

  .pointer {
    position: absolute;
    border-style: solid;
    border-width: 0px 20px 20px 20px;
    border-color: transparent transparent rgb(0, 0, 0) transparent;
    /* width: 50px;
        height: 50px; */
    bottom: -8px;
    left: 580px;
    text-align: center;
    z-index: 30;
  }

  .timeIsNull {

    font-size: 35px;
    height: 100%;
    font-family: '楷体';
    color: #8d8c8a;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-wrap: wrap;
  }

  .el-tabs__content {
    height: 100%;
    min-height: 300px;
  }
  .el-divider--horizontal{
    margin-top:62px;
  }

</style>