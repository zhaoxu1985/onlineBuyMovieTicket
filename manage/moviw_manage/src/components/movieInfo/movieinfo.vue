<template>
  <div>
    <!-- 搜索栏 -->
    <el-row>
      <el-col :span="24">
        <el-card>
          <el-input width='100px' placeholder="请输入内容" v-model="searchInput">
          </el-input>
          <el-button @click="search" class="btn-search" type='primary'> <i class="el-icon-search"></i> 搜索</el-button>
          <el-button @click='clearSearchInput' class="btn-search" type='danger'> <i class=" el-icon-delete"></i> 清空
          </el-button>
        </el-card>
      </el-col>
    </el-row>
    <!-- ///搜索栏 -->
    <el-card class="main_card">
      <div @mouseenter.stop="boxEnter" @mouseleave.stop="boxLeave" class="box-2"
        v-for="(item,i) in searchList==''?movieList:searchList" :key="i">
        <!-- 显示顺序标识 -->
        <div @click="imgclick(item.movie_id)" class="imgheader">
          <img width="100%" :src="item.main_pic" alt="">
          <div class="order">{{item.d_order}}</div>
        </div>

        <div class="info-header">{{item.movie_name}}</div>
        <div>

          <div class="info-kps-price">
            <!-- 价格 -->
            <div class="info-price">￥{{item.movie_price}}</div>
            <!-- 评分 -->
            <el-rate class="info-kps" :value="item.kps/2" :max='5' disabled show-score text-color="#ff9900"
              :score-template="String(item.kps)">
            </el-rate>
          </div>
        </div>
        <div class="edit" :key="i">
          <el-button @click="alertDialog(item)" size='mini' class="editDeleteBtn" type='primary'> <i class="el-icon-edit"></i> 编辑</el-button>
          <el-button @click="shutdownMovie(item,i)" size='mini' class="editDeleteBtn" type='danger'> <i class="el-icon-delete"></i> 下架</el-button>
        </div>

      </div>
      <div class="block">
        <!-- 分页器 -->
        <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="nowPage"
          :page-sizes="[5,10,20,30]" :page-size="pageSize" layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
        <!-- 分页器结束 -->
      </div>
    </el-card>
    <!-- 弹出框 -->
    <el-dialog title="编辑" :visible.sync="dialogVisible" width="50%" :before-close="handleClose">
        
        <div class="diabox">
            <el-form :model="editInput" :rules="rules" ref="editInputRef" label-width="100px" class="demo-ruleForm">
              <el-form-item label="电影名称" prop="movie_name">
                <el-input v-model="editInput.movie_name"></el-input>
              </el-form-item>
              <!-- 主图url -->
               <el-form-item label="主图URL" prop="main_pic">
                    <el-input v-model="editInput.main_pic"></el-input>
                </el-form-item>
              <!-- 显示顺序 -->
                <el-form-item label="显示顺序" prop="d_order">
                  <el-select v-model="editInput.d_order" placeholder="请选择显示顺序">
                    <el-option v-for="(item,i) in 15" :key="i" :value="item"></el-option>
                  </el-select>
                </el-form-item>
            <el-form-item label="电影类型" prop="movie_type">
              <el-checkbox-group v-model="editInput.movie_type">
                <el-checkbox  label="爱情" name="type" value=爱情></el-checkbox>
                <el-checkbox label="恐怖" name="type"></el-checkbox>
                <el-checkbox label="童话" name="type"></el-checkbox>
                <el-checkbox label="科幻" name="type" value="科幻"></el-checkbox>
                <el-checkbox label="穿越" name="type"></el-checkbox>
                <el-checkbox label="冒险" name="type"></el-checkbox>
                <el-checkbox label="动作" name="type"></el-checkbox>
                <el-checkbox label="历史" name="type"></el-checkbox>
                <el-checkbox label="剧情" name="type"></el-checkbox>
                <el-checkbox label="浪漫" name="type"></el-checkbox>
                <el-checkbox label="奇幻" name="type"></el-checkbox>
                <el-checkbox label="战争" name="type"></el-checkbox>
                <el-checkbox label="犯罪" name="type"></el-checkbox>
                <el-checkbox label="纪录片" name="type"></el-checkbox>
                <el-checkbox label="动画片" name="type"></el-checkbox>
                <el-checkbox label="家庭" name="type"></el-checkbox>
                <el-checkbox label="人物" name="type"></el-checkbox>
                <el-checkbox label="喜剧" name="type"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>

              <el-form-item label="电影简介" prop="movie_about">
                <el-input type="textarea" v-model="editInput.movie_about
                "></el-input>
              </el-form-item>
            </el-form>
        </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editInputRuls('editInputRef')">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  export default {
    data() {
      //电影时长
    var time_length=(rule, value, callback)=>{
        if(value.length==0){
           callback(new Error('请输入电影时长'))
        }
        if(!Number.isInteger(Number(value))){
           callback(new Error('请输入数字类型'))
        }else{
          callback()
        }
    }
    //主图URL 
    var main_pic = (rule, value, callback) => {
      var regex = /(http|https):\/\/.+(\.jpg|\.png)/gi;
      if (!regex.test(value)) {
        callback(new Error("请输入正确链接"));
      } else {
        callback();
      }
    };
      return {
        //  当前页码
        nowPage: 1,
        // 总条数
        total: 40,
        // 每页显示多少条
        pageSize: 10,

        movieList: '',

        searchList: '',
        //搜索内容
        searchInput: '',
        value: 3.5,
        //搜索筛选列表
        filterMovie: [],
        filterLength:Number(),

        //弹出框
        dialogVisible: false,

        // 编辑信息input 
        editInput:{},

        //验证规则
       rules: {
        //  电影名称
          movie_name: [
            { required: true, message: '请输入电影名称', trigger: 'blur' },
            { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
          ],
          //电影类型
          movie_type: [
            { type: 'array', required: true, message: '请至少选择一个电影类型', trigger: 'change' }
          ],
          //简介
          movie_about: [
            { required: true, message: '请输入活动名称', trigger: 'blur' },
            { min: 10, max: 500, message: '长度在 10 到 500 个字符', trigger: 'blur' }
          ],
            //电影时长
          time_length: [
              { validator:time_length , trigger: "blur" }
          ],
          //显示顺序
          d_order:[
            { required: true, message: '请选择显示顺序', trigger: 'change' }
          ],
          //主图url
           main_pic: [{ validator: main_pic, trigger: "blur" }],
       }
      }

      
    },
    methods: {
      imgclick(id) {
        console.log(id);
      },
      //搜索按钮
      async search() {
        if(this.searchInput=='') return this.$message.warning('请输入内容')
        let {
          data: res
        } = await this.$axios.get('/getinfo/search', {
          params: {
            movie_name: this.searchInput
          }
        })
        this.searchList = res.data
        if(res.data.length==0) this.$message.warning('没有哦亲')
        console.log(this.searchList);
      },
      //清空输入框
      clearSearchInput() {
        this.searchList = ''
        this.searchInput = ''
      },
      // 获取电影列表
      async getMovieList() {
        let {data: res} = await this.$axios.get('/getinfo', {
          params: {
            nowPage: this.nowPage,
            pageSize: this.pageSize
          }
        })
        console.log(res);
        this.total = res.total
        this.movieList = res.data
      },
      //编辑按钮弹出dialog
      alertDialog(item){
        this.dialogVisible=true
        if( item.movie_type.constructor!=Array){
            item.movie_type = item.movie_type.split('/')
            item.movie_type.forEach((e,i)=>{
              item.movie_type[i] = this.Trim(e) 
            })
        }
        this.editInput=item
      },
      //弹出框退出提醒
      handleClose(done) {
        this.$confirm('确认关闭？')
          .then(_ => {
            done();
          })
          .catch(_ => {});
      },
      //下架电影
      async shutdownMovie(e,i){
         let {data:res} = await this.$axios.post('/updateinfo/down',e)
         if(res.meta.status!==200) return this.$message.error(res.meta.msg)
         this.getMovieList()
         return this.$message.success(res.meta.msg)
      },
      handleSizeChange(val) {
        this.pageSize = val
        this.getMovieList()
      },
      handleCurrentChange(val) {
        this.nowPage = val
        this.getMovieList()
      },
      //》》》》》》》动画
      boxEnter(e) {
        e.target.style.boxShadow = '0px 0px 15px 0px rgb(0 0 0 / 50%)'
        e.target.children[3].style.transform = "translateY(0px)"
      },
      boxLeave(e) {
        e.target.style.boxShadow = '3px 3px 10px #888888'
        e.target.children[3].style.transform = "translateY(60px)"
      },

      //》》》》》》动画结束

      //编辑按钮 校验编表单
       editInputRuls(formName) {
         
        this.$refs[formName].validate(async (valid) => {
          if (valid) {
            let {data:res} = await this.$axios.post('/updateinfo',{movie_info:this.editInput})
            if(res.meta.status!==200) return this.$message.error('修改失败')
            this.$message.success('修改成功')
            this.getMovieList()
            this.dialogVisible = false
          } else {
            return false;
          }
        });
      },

      //去除空格
      Trim(str){ 
        return str.replace(/(^\s*)|(\s*$)/g, ""); 
      }
    },
    computed: {
    
    },
    created() {
      this.getMovieList()
    },
    mounted() {
      this.getMovieList()
    },
  }
</script>

<style scoped>
  /* .box{
    width: 90vw;
  } */
  .box-2 {
    -webkit-box-orient: vertical;
    -webkit-box-direction: normal;
    width: 200px;
    height: 320px;
    margin: 20px;
    overflow: hidden;
    display: inline-block;
    border-radius: 3px;
    transition: all .3s ease;
    background-color: rgb(255, 255, 255);
    box-shadow: 3px 3px 10px #888888;
    position: relative;
  }

  .imgheader {
    width: 100%;
    height: 80%;
    z-index: -1;
    border-radius: 3px;
    background-color: #fff;
    overflow: hidden;
    cursor: -moz-zoom-out;
    padding: 10px;
    box-sizing: border-box;
  }

  .main_card {
    margin-top: 10px;
  }

  .el-input {
    width: 300px;
  }

  .btn-search {
    margin-left: 10px;
    width: 100px;
  }

  .info-header {
    width: 200px;
    height: 30px;
    font-weight: 900;
    font-size: 20px;
    margin-left: 10px;
  }

  .info-kps-price {
    width: 200px;
  }

  .info-price {
    width: 50px;
    display: inline-block;
  }

  .info-kps {
    width: 150px;
    display: inline-block;
  }

  .edit {
    width: 100%;
    height: 60px;
    background-color: rgb(255, 255, 255);
    /* text-align: center; */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10 !important;
    margin-top: 60px;
    position: absolute;
    transition: 0.3s ease all;
    bottom:0px;
    transform: translateY(51px);
  }

  .editDeleteBtn {
    width: 70px;
    height: 30px
  }
  .order{
    width: 40px;
    height: 40px;
    background-color: rgb(216, 47, 47);
    position: absolute;
    left: 0;
    border-radius: 10px;
    color: white;
    font-size: 25px;
    font-weight: 700;
    text-align: center;
    top: 0;
  }
</style>