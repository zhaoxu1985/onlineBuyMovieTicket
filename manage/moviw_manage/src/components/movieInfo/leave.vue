<template>
  <div>
    <!-- 搜索栏 -->
    <el-row>
      <el-col :span="24">
        <el-card>
          <el-input
            width="100px"
            placeholder="请输入内容"
            v-model="searchInput"
          >
          </el-input>
          <el-button @click="search" class="btn-search" type="primary">
            <i class="el-icon-search"></i> 搜索</el-button
          >
          <el-button @click="clearSearchInput" class="btn-search" type="danger">
            <i class=" el-icon-delete"></i> 清空
          </el-button>
        </el-card>
      </el-col>
    </el-row>
    <!-- ///搜索栏 -->
    <el-card class="main_card">
      <div class="listNull" v-show="movieList.length==0?true:false">
          无
      </div>
      <div
        @mouseenter.stop="boxEnter"
        @mouseleave.stop="boxLeave"
        class="box-2"
        v-for="(item, i) in searchList == '' ? movieList : searchList"
        :key="i"
      >
        <!-- {{item.movie_id}} -->
        <div @click="imgclick(item.movie_id)" class="imgheader">
          <img width="100%" :src="item.main_pic" alt="" />
        </div>

        <div class="info-header">{{ item.movie_name }}</div>
        <div>
          <div class="info-kps-price">
            <!-- 价格 -->
            <div class="info-price">￥{{ item.movie_price }}</div>
            <!-- 评分 -->
            <el-rate
              class="info-kps"
              :value="item.kps / 2"
              :max="5"
              disabled
              show-score
              text-color="#ff9900"
              :score-template="String(item.kps)"
            >
            </el-rate>
          </div>
        </div>

        <div class="edit" :key="i">
          <el-button
            @click="alertDialog(item.movie_id)"
            size="mini"
            class="editDeleteBtn"
            type="primary"
          >
            <i class="el-icon-edit"></i> 编辑</el-button
          >
          <el-button
            @click="upMovie(item, i)"
            size="mini"
            class="editDeleteBtn"
            type="danger"
          >
            <i class="el-icon-delete"></i>上架</el-button
          >
        </div>
      </div>
      <div class="block">
        <!-- 分页器 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="nowPage"
          :page-sizes="[5, 10, 20, 30]"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        >
        </el-pagination>
        <!-- 分页器结束 -->
      </div>
    </el-card>
    <!-- 弹出框 -->
    <el-dialog
      title="编辑"
      :visible.sync="dialogVisible"
      width="100%"
      :before-close="handleClose"
    >
      <div class="diabox"></div>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 上架弹框 -->
    <el-dialog
      title="上架信息"
      :visible.sync="updialogVisible"
      width="50%"
      :before-close="handleClose"
    >
      <el-form>
        <el-form-item label="上映价格" prop="price">
          <el-input-number
            v-model="upMovieForm.price"
            :precision="2"
            :step="0.1"
            :max="500"
          ></el-input-number>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="updialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="upAddFinish">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //  当前页码
      nowPage: 1,
      // 总条数
      total: 40,
      // 每页显示多少条
      pageSize: 10,
      //首屏渲染的所有数据
      movieList: [],

      searchList: "",
      //搜索内容
      searchInput: "",
      value: 3.5,
      //搜索筛选列表
      filterMovie: [],
      filterLength: Number(),

      //弹出框
      dialogVisible: false,

      //上架信息dialog
      updialogVisible: false,
      // 上架信息表单
      upMovieForm: {
        movie_id: "",
        price: Number(), //上架价格
      },

      //表单验证规则
      rules: {
        m_rid: [
          {
            type: "number",
            required: true,
            message: "请输入电影价格",
            trigger: "change",
          },
        ],
      },
    };
  },
  methods: {
    imgclick(id) {
      console.log(id);
    },
    //搜索按钮
    async search() {
      if (this.searchInput == "") return this.$message.warning("请输入内容");
      let { data: res } = await this.$axios.get("/getinfo/searchLeave", {
        params: {
          movie_name: this.searchInput,
        },
      });
      this.searchList = res.data;
      if (res.data.length == 0) this.$message.warning("没有哦亲");
      console.log(this.searchList);
    },
    //清空输入框
    clearSearchInput() {
      this.searchList = "";
      this.searchInput = "";
    },
    // 获取电影列表
    async getMovieList() {
      let { data: res } = await this.$axios.get("/getinfo/leave", {
        params: {
          nowPage: this.nowPage,
          pageSize: this.pageSize,
        },
      });
      console.log(res);
      this.total = res.total;
      this.movieList = res.data;
    },
    //删除按钮弹出dialog
    alertDialog(id) {
      this.dialogVisible = true;
      console.log(id);
    },
    //弹出框退出提醒
    handleClose(done) {
      this.$confirm("确认关闭？")
        .then((_) => {
          done();
        })
        .catch((_) => {});
    },
    //上架电影dialog弹窗
    upMovie(e, i) {
      this.upMovieForm.movie_id = e.movie_id;
      this.updialogVisible = true;
    },
    //确定上架按钮 finish
    async upAddFinish() {
      let { data: res } = await this.$axios.post(
        "/updateinfo/up",
        this.upMovieForm
      );
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.getMovieList();
      this.updialogVisible = false;
      return this.$message.success(res.meta.msg);
    },

    handleSizeChange(val) {
      this.pageSize = val;
      this.getMovieList();
    },
    handleCurrentChange(val) {
      this.nowPage = val;
      this.getMovieList();
    },
    //》》》》》》》动画
    boxEnter(e) {
      e.target.style.boxShadow = "0px 0px 15px 0px rgb(0 0 0 / 50%)";
      e.target.children[3].style.transform = "translateY(0px)";
    },
    boxLeave(e) {
      e.target.style.boxShadow = "3px 3px 10px #888888";
      e.target.children[3].style.transform = "translateY(60px)";
    },

    //》》》》》》动画结束
  },
  computed: {},
  created() {
    this.getMovieList();
  },
  mounted() {
    this.getMovieList();
  },
};
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
  transition: all 0.3s ease;
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
  font-family: '楷体';
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
  bottom: 0px;
  transform: translateY(51px);
}

.editDeleteBtn {
  width: 70px;
  height: 30px;
}

.listNull{
  width: 100%;
  height: 300px;
  color: rgba(122, 122, 122, 0.5);
  font-family: '楷体';
  font-size: 35px;
  text-align: center;
  line-height: 300px;
}
</style>
