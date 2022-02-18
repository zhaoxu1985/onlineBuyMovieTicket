<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>电影管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加影片</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card width="100%" style="margin-top:10px">
      <el-form
        :model="addInfoForm"
        :rules="rules"
        ref="ruleForm"
        label-width="100px"
        class="demo-ruleForm"
      >
        <el-row align="bottom">
          <el-card>
            <el-col class="add-movie-img-path" :span="5">
              <div
                v-show="addInfoForm.main_pic.length > 0 ? false : true"
                class="main_pic_preview"
              ></div>
              <img
                v-show="addInfoForm.main_pic.length == 0 ? false : true"
                class="main_pic"
                :src="addInfoForm.main_pic"
              />
            </el-col>
            <el-col :span="19">
              <!-- 价格 -->
              <el-row>
                <el-col :span="24">
                  <el-form-item label="电影价格" prop="movie_price">
                    <el-input v-model="addInfoForm.movie_price"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <!-- 主图url -->
              <el-row>
                <el-col :span="24">
                  <el-form-item label="主图URL" prop="main_pic">
                    <el-input v-model="addInfoForm.main_pic"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <!-- 是否在售 -->
              <el-row>
                <el-col :span="10">
                  <el-form-item label="是否在售" prop="is_sale">
                    <el-switch v-model="addInfoForm.is_sale"></el-switch>
                  </el-form-item>
                </el-col>
                <el-col :span="10">
                  <el-form-item label="是否预售" prop="is_presell">
                    <el-switch v-model="addInfoForm.is_presell"></el-switch>
                  </el-form-item>
                </el-col>
              </el-row>
              <!-- <<<是否在售 -->
            </el-col>
          </el-card>
        </el-row>

        <el-card style="margin-top:10px">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="电影简介" prop="movie_about">
                <el-input
                  type="textarea"
                  :rows="2"
                  placeholder="请输入电影简介"
                  v-model="addInfoForm.movie_about"
                >
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <!-- 电影名称 电影类型 -->
              <el-form-item label="电影名称" prop="movie_name">
                <el-input v-model="addInfoForm.movie_name"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="电影类型" prop="movie_type">
                <el-select
                  v-model="addInfoForm.movie_type"
                  clearable
                  placeholder="请选择"
                >
                  <el-option
                    v-for="item in movieTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="语言" prop="language">
                <el-select
                  v-model="addInfoForm.language"
                  clearable
                  placeholder="请选择语言"
                >
                  <el-option
                    v-for="item in movieLanguage"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <!-- <<<电影名称 电影类型 -->
          </el-row>
        </el-card>

        <el-card style="margin-top:10px;">
          <!-- 上映时间,上映地点 -->
          <el-row>
            <el-col :span="12">
              <el-form-item label="上映时间" prop="online_time">
                <el-date-picker
                  v-model="addInfoForm.online_time"
                  align="right"
                  type="date"
                  placeholder="选择日期"
                  format="yyyy-MM-dd"
                  :picker-options="pickerOptions"
                >
                </el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="上映地点" prop="online_place">
                <el-select
                  v-model="addInfoForm.online_place"
                  clearable
                  placeholder="请选上映地点"
                >
                  <el-option
                    v-for="item in moviePlace"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <!-- <<<<<<<<<<<<上映时间,上映地点 -->

          <el-row>
            <el-col :span="24">
              <el-form-item label="电影时长" prop="time_length">
                <el-input
                  placeholder="60,80,120..."
                  v-model="addInfoForm.time_length"
                ></el-input>
              </el-form-item>
            </el-col>
            <el-col class="addBtn" :span="24">
              <el-button @click="addMovieInfoBtn('ruleForm')" type="success"
                >添加</el-button
              >
            </el-col>
          </el-row>
        </el-card>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    var main_pic = (rule, value, callback) => {
      var regex = /(http|https):\/\/.+(\.jpg|\.png)/gi;
      if (!regex.test(value)) {
        callback(new Error("请输入正确链接"));
      } else {
        callback();
      }
    };
    //验证价格
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
    return {
      //添加信息的表单信息
      addInfoForm: {
        movie_name: "", //电影名称
        movie_type: "", //电影类型
        online_time: "", // 上映时间
        online_place: "", // 上映地点
        is_presell: false, // 是否预售
        time_length: Number(), // 电影时长
        main_pic: "", //主图url
        movie_about: "", //电影简介
        movie_price: Number().toFixed(1), //电影价格
        is_sale: true, // 是否在售
        language: "", // 电影语言
        play_type: "", //2D/3D
        d_order: 0, //显示顺序
      },
      //验证规则
      rules: {
        //电影名称
        movie_name: [
          { required: true, message: "请输入电影名称", trigger: "blur" },
          { min: 1, max: 20, message: "长度在 1 到 20 个字符", trigger: "blur" },
        ],
        // 上映时间
        online_time: [
          {
            type: "date",
            required: true,
            message: "请选择日期",
            trigger: "change",
          },
        ],
        // 电影类型
        movie_type: [
          { required: true, message: "请选择电影类型", trigger: "change" },
        ],
        // 上映地点
        online_place: [
          { required: true, message: "请选择上映地点", trigger: "change" },
        ],
        //电影时长
        time_length: [
            { validator:time_length , trigger: "blur" }
        ],
        //主图url
        main_pic: [{ validator: main_pic, trigger: "blur" }],
        // 电影简介
        movie_about: [
          {
            required: true,
            message: "请输入电影简介(10-500个字符)",
            trigger: "blur",
          },
          {
            min: 10,
            max: 500,
            message: "长度在 10 到 500 个字符",
            trigger: "blur",
          },
        ],
        //电影价格
        movie_price: [
            { validator: movie_price, trigger: "blur" }
        ],
        //电影语言
        language: [
          { required: true, message: "请选择电影语言", trigger: "change" },
        ],
        //电影播放类型 2D/3D
        play_type: [
          { required: true, message: "请选择播放类型", trigger: "change" },
        ],
      },
      //语言型选择
      movieLanguage: [
        {
          value: "国语",
          label: "国语",
        },
        {
          value: "英语",
          label: "英语",
        },
        {
          value: "粤语",
          label: "粤语",
        },
        {
          value: "韩语",
          label: "韩语",
        },
        {
          value: "印度",
          label: "印度",
        },
        {
          value: "俄语",
          label: "俄语",
        },
      ],
      //电影类型选择
      movieTypeOptions: [
        {
          value: "2D",
          label: "2D",
        },
        {
          value: "2D IMAX",
          label: "2D IMAX",
        },
        {
          value: "3D",
          label: "3D",
        },
        {
          value: "3D IMAX",
          label: "英语3D IMAX",
        },
      ],

      //选择电影上映时间
      pickerOptions: {
        shortcuts: [
          {
            text: "明天",
            onClick(picker) {
              picker.$emit("pick", new Date().setDate(new Date().getDate()+1));
            },
          },
          {
            text: "今天",
            onClick(picker) {
              picker.$emit("pick", new Date());
            },
          },
          {
            text: "昨天",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", date);
            },
          },
          {
            text: "一周前",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", date);
            },
          },
        ],
      },
      //上映地点
      moviePlace: [
        {
          value: "中国大陆",
          label: "中国大陆",
        },
        {
          value: "好莱坞",
          label: "好莱坞",
        },
        {
          value: "美国",
          label: "美国",
        },
        {
          value: "韩国",
          label: "韩国",
        },
        {
          value: "印度",
          label: "印度",
        },
        {
          value: "日本",
          label: "日本",
        },
        {
          value: "俄罗斯",
          label: "俄罗斯",
        },
        {
          value: "加拿大",
          label: "加拿大",
        },
      ],
    };
  },
  methods: {
    addMovieInfoBtn(ref) {
      this.$refs[ref].validate(async (valid) => {
        if (valid) {
          let {data:res} = await this.$axios.post('/addinfo/',this.addInfoForm)
          if(res.meta.status!=200)return this.$notify.error('添加失败,电影名称存在 ')
          this.$notify.success('添加成功')
          console.log(res);

        } else {
            this.$notify({
              title: '警告',
              message: '请输入完整的信息',
              type: 'warning'
            });
          return false;
        }
      });
    },
  },
};
</script>

<style scoped>
.main_pic {
  width: 80%;
  display: inline-block;
  background-color: aqua;
  /* transition: all 1s ease; */
}
/* -------过度动画-------- */
/* .mainPic-enter ,.mainPic-enter-lveal{
        transition: 1s all ease;
        opacity: 0;
    } */
.main_pic_preview {
  width: 90%;
  height: 90%;
  border: 6px black dotted;
  border-radius: 5px;
  box-sizing: border-box;
  /* transition: all 1s; */
}
.add-movie-img-path {
  width: 160px;
  height: 200px;
}
.addBtn {
  text-align: center;
}
</style>