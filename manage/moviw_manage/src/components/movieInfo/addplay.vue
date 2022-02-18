<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>电影管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加人员</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card class="main_card">
      <el-form
        :model="addActorInfo"
        :rules="rules"
        ref="ruleForm"
        label-width="100px"
      >
        <el-row align="bottom">
          <el-card>
            <el-col class="add-movie-img-path" :span="5">
              <div
                v-show="addActorInfo.p_pic.length > 0 ? false : true"
                class="main_pic_preview"
              ></div>
              <img
                v-show="addActorInfo.p_pic.length == 0 ? false : true"
                class="main_pic"
                :src="addActorInfo.p_pic"
              />
            </el-col>
            <el-col :span="10">
              <!-- 价格 -->
              <!-- <el-row>
                <el-col :span="24"> </el-col>
              </el-row> -->
              <!-- 头像url -->
              <el-row>
                <el-col :span="24">
                  <el-form-item label="头像url" prop="p_pic">
                    <el-input v-model="addActorInfo.p_pic"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <!-- 电影名称 电影类型 -->
                  <el-form-item label="人员名称" prop="p_name">
                    <el-input v-model="addActorInfo.p_name"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-form-item label="生日" prop="birthday">
                  <el-col :span="24">
                    <el-date-picker
                      v-model="addActorInfo.birthday"
                      type="date"
                      placeholder="选择生日"
                    >
                    </el-date-picker>
                  </el-col>
                </el-form-item>
              </el-row>
            </el-col>
          </el-card>
        </el-row>

        <el-card style="margin-top:10px">
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="人员简介" prop="about">
                <el-input
                  type="textarea"
                  :rows="2"
                  placeholder="请输入人员简介"
                  v-model="addActorInfo.about"
                >
                </el-input>
              </el-form-item>
            </el-col>

            <el-col :span="8">
              <el-form-item label="背景图" prop="p_pic">
                <el-input v-model="addActorInfo.background"> </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="籍贯" prop="native_place">
                <el-input v-model="addActorInfo.native_place"></el-input>
              </el-form-item>
            </el-col>
            <!-- <<<电影名称 电影类型 -->
          </el-row>
        </el-card>

        <el-card style="margin-top:10px;">
          <!-- 添加 -->
          <el-row>
            <el-col class="addBtn" :span="24">
              <el-button @click="addActorBtn('ruleForm')" type="success"
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
    var p_pic = (rule, value, callback) => {
      var regex = /(http|https):\/\/.+(\.jpg|\.png)/gi;
      if (!regex.test(value)) {
        callback(new Error("请输入正确链接"));
      } else {
        callback();
      }
    };
    return {
      addActorInfo: {
        p_name: "",
        p_pic: "",
        birthday: "",
        about: "",
        native_place: "",
        background: "",
      },
      // 验证规则
      rules: {
        //籍贯
        native_place: [
          { required: true, message: "请输入籍贯", trigger: "blur" },
          {
            min: 1,
            max: 20,
            message: "长度在 1 到 20 个字符",
            trigger: "blur",
          },
        ],
        //演员名称
        p_name: [
          { required: true, message: "请输入演员名称", trigger: "blur" },
          {
            min: 1,
            max: 20,
            message: "长度在 1 到 20 个字符",
            trigger: "blur",
          },
        ],
        // 生日
        birthday: [
          {
            type: "date",
            required: true,
            message: "请选择日期",
            trigger: "change",
          },
        ],


        //头像url
        p_pic: [{ validator: p_pic, trigger: "blur" }],
        // 人员简介
        about: [
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
      },
    };
  },
  methods: {
    async addActorBtn(ref) {
      this.$refs[ref].validate(async (valid) => {
        if (valid) {
          // console.log(this.formatDate);
          let { data: res } = await this.$axios.post('addinfo/addActor',this.addActorInfo);
          console.log(res);
          if(res.meta.status!=200)return this.$notify.error(`${res.meta.msg}`)
          this.$notify.success('添加成功')
          console.log(res);
        } else {
          this.$notify({
            title: "警告",
            message: "请输入完整的人员信息",
            type: "warning",
          });
          return false;
        }
      });
    },
  },
  computed: {
    formatDate() {
      let year = this.addActorInfo.birthday.getFullYear(); //年
      let month = this.addActorInfo.birthday.getMonth(); //月
      let dates = this.addActorInfo.birthday.getDate(); //日
      return `${year}-${month}-${dates}`;
    },
  },
};
</script>

<style scoped>
.main_card {
  margin-top: 10px;
  width: 83vw;
  /* height: 85vh; */
  display: flex;
  justify-content: center;
}
.main_pic {
  width: 80%;

  display: inline-block;
  background-color: aqua;
}

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
  height: 180px;
  overflow: hidden;
}
.addBtn {
  text-align: center;
}
</style>
