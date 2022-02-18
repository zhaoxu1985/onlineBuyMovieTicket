<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>电影管理</el-breadcrumb-item>
      <el-breadcrumb-item>编辑信息</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-select :filter-method="filterMethods" v-model="searchValue" filterable placeholder="请选择电影">
        <el-option v-for="item in searchOptions" :key="item.value" :label="item.label" :value="item.value">
        </el-option>
      </el-select>
    </el-card>
    <el-card v-show="searchValue.length==0?true:false" class="searchPlace">
      请搜索一个电影名称
    </el-card>
    <el-card v-show="movieList.hasOwnProperty('main_pic') ? true : false">
      <div class="left-img">
        <img width="100%" :src="this.movieList.main_pic" alt="图片" />
      </div>

      <div class="right-img">
        <div v-text="'片名: ' + movieList.movie_name"></div>
        <div v-text="'电影类型: ' + movieList.movie_type"></div>
        <div v-text="'上映地点: ' + movieList.online_place"></div>
        <div v-text="'语言: ' + movieList.language"></div>
        <div v-text="'评分: ' + movieList.kps"></div>
        <div v-text="'播放类型: ' + movieList.play_type"></div>
        <div v-text="'电影时长: ' + movieList.time_length"></div>
        <div class="about-span">
          电影简介:
          <span>{{ movieList.movie_about }}</span>
        </div>
      </div>
    </el-card>
    <el-card v-if="movieListAll.length == 0 ? false : true">
      <div class="trailerHeader">
        <div>预告视频></div>
        <div>
          <el-button @click="videoAllBtn">编辑<i class="el-icon-arrow-right el-icon--right"></i></el-button>
        </div>
      </div>
      <div v-if="movieListAll.length == 0 ? false : true" class="trailer" style="height:250px">
        <!-- 预告视频渲染>>>>>> -->

        <div class="trailer-preview-box">
          <!-- width="250px" height="90%" -->
          <div style="width:250px;height:100%" v-for="(item, i) in movieListAll.video_list.slice(0, 10)" :key="i">
            <video class="videos" :src="item.t_path + '#t=5'" width="200px" height="120px" preload="metadata"
              controls></video>
            <div style="padding:0px 10px 0px 10px">
              {{ item.title }}
            </div>
          </div>
        </div>
      </div>
    </el-card>
    <!-- <<<<<<<<<<<<<<<<<<<  剧照  start >>>>>>>>>>>>>>>> -->
    <el-card v-if="movieListAll.length == 0 ? false : true">
      <div class="img-box">
        <div class="trailerHeader">
          <div>剧照></div>
          <div>
            <el-button @click="imgAllBtn">编辑<i class="el-icon-arrow-right el-icon--right"></i></el-button>
          </div>
        </div>
        <div class="trailer">
          <!-- 剧照渲染>>>>>> -->

          <div class="trailer-preview-box">
            <img v-for="(item, i) in movieListAll.img_list.slice(0, 10)" :key="i" class="videos" :src="item.s_path"
              width="250px" height="90%" preload="metadata" controls />
          </div>
        </div>
      </div>
    </el-card>
    <!-- <<<<<<<<<<<<<<<<<<<  剧照  stop >>>>>>>>>>>>>>>> -->
    <el-card v-if="movieListAll.length == 0 ? false : true">
      <div class="img-box">
        <div class="trailerHeader">
          <div>参与者></div>
          <div>
            <el-button @click="playAllBtn">编辑<i class="el-icon-arrow-right el-icon--right"></i></el-button>
          </div>
        </div>
        <div class="cosplay">
          <!-- v-if="movieListAll.length==0?false:true" -->
          <!-- 演员渲染>>>>>> -->

          <div class="cosplay-preview-box">
            <div class="cosplayBox" v-for="(item, i) in movieListAll.actor" :key="i">
              <div v-for="(item2, i) in item.children" :key="i">
                <div style="height:120px;overflow:hidden;">
                  <img width="100px" style="margin:0px 10px 0px 10px" :src="item2.p_pic" alt="" />
                </div>

                <div class="cosplaySpan">
                  {{ item2.p_name }}
                </div>
                <div class="cosplaySpan">
                  <div v-if="item2.cos_play == '导演'">
                    {{ item2.cos_play }}
                  </div>
                  <div v-else-if="item2.cos_play == null">
                    {{ item2.play_class }}
                  </div>
                  <div v-else>饰演:{{ item2.cos_play }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
    <!-- 从下往上开的预告视频弹出框 >>>>>>> -->
    <el-drawer title="编辑>预告视频>" :visible.sync="videoDrawer" :direction="direction"
      size="93%;border-radius:30px 30px 0px 0px">
      <div style="height:90%;overflow:auto">
        <div class="videoPreviewTop">
          <div>
            <div class="videoPriveBox" v-for="(item, i) in movieListAll.video_list" :key="i">
              <video width="100%" height="150px" preload="metadata" controls :src="item.t_path + '#t=5'"></video>
              <span
                style="  width:100%;overflow:hidden;display: -webkit-box;-webkit-box-orient: vertical;-webkit-line-clamp: 2;">{{ item.title }}</span>
              <div style="position:absolute;bottom:0;width:100%;text-align:center;">
                <el-button @click="videoEdit(item.id)" style="margin:0px 10px 0px 10px" class="edit_el-button--danger"
                  type="primary"><i class="el-icon-edit"></i></el-button>
                <el-popconfirm confirm-button-text="好的" cancel-button-text="不用了" icon="el-icon-info" icon-color="red"
                  title="这是一段内容确定删除吗？" @confirm="videoDel(item.id)">
                  <el-button style="margin:0px 10px 0px 10px;" slot="reference" type="danger"
                    class="del-el-button--danger">
                    <i class="el-icon-delete"></i></el-button>
                </el-popconfirm>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="videoPreviewBottom">
        <el-button @click="viedoAddClick()" type="primary">添加预告视频</el-button>
      </div>
    </el-drawer>
    <!-- <<<<<<<<< 从下往上开的预告视频弹出框 -->

    <!-- 视频修改dialog>>>>>>>>>>>>> -->
    <el-dialog title="编辑" :visible.sync="editVideoVisible" width="50%" :before-close="beforeEditBtnClose">
      <!-- 编辑视频布局>>>>> -->

      <el-form :model="editVideoFormData" status-icon :rules="rules" ref="editFormRef" label-width="100px"
        class="demo-ruleForm">
        <el-form-item label="标题" prop="title">
          <el-input type="textarea" autosize v-model="editVideoFormData.title" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item label="视频url" prop="t_path">
          <el-input type="text" v-model="editVideoFormData.t_path" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>

      <!--<<<<<<<< 编辑视频布局 -->
      <span slot="footer" class="dialog-footer">
        <el-button v-if="isVideoDialog == 0" :rows="2" @click="editVideoCancelBtn('editFormRef')">取 消</el-button>
        <el-button v-if="isVideoDialog == 0" type="primary" @click="editVideoFinishBtn('editFormRef')">确 定</el-button>
        <el-button v-if="isVideoDialog == 1" :rows="2" @click="addVideoCancelBtn('editFormRef')">取 消</el-button>
        <el-button v-if="isVideoDialog == 1" type="primary" @click="addVideoFinishBtn('editFormRef')">添加</el-button>
      </span>
    </el-dialog>
    <!-- <<<<<<<<<<< 视频修改dialog -->


    <!--start参与者编辑从下往上弹出>>>>>>>>>>>>>>> -->
    <el-drawer title="编辑>参与者>" :visible.sync="playDrawer" :direction="direction"
      size="93%;border-radius:30px 30px 0px 0px">
      <div class="playCLassBox">
        <div v-for="(item, i) in movieListAll.actor" :key="i">
          <div class="playClassTitle">
            {{ item.play_class }} ({{ item.play_length }})
          </div>
          <div style="width:132px;display:inline-block; margin:10px" v-for="(item2, i) in item.children" :key="i">
            <el-checkbox-group v-show="isChecBox" v-model="playTopDelList">
              <el-checkbox :label="item2.id">
              </el-checkbox>
            </el-checkbox-group>
            <div style="height:120px;overflow:hidden;">
              <img width="100px" style="margin:0px 10px 0px 10px" :src="item2.p_pic" alt="" />
            </div>


            <div class="cosplaySpan">
              <div v-if="item2.cos_play == '导演'">
                <div>
                  {{ item2.cos_play }}
                </div>
                <div>{{item2.p_name}}</div>
              </div>

              <div v-else-if="item2.play_class=='演员'">
                <div>
                  {{item2.p_name}}
                </div>
                饰演: {{ item2.cos_play }}
              </div>

              <div v-else>
                <div>
                  {{item2.p_name}}
                </div>
                {{ item2.cos_play }}
              </div>

            </div>

          </div>
          <div class="playAddBox" @click="rightAddBtn(item.play_class)">
            <svg width="100%" height="100%" viewBox="0 0 220 300" version="1.1"
              xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg">
              <desc>Created with Lunacy</desc>
              <defs>
                <rect width="220" height="300" id="artboard_1" />
                <clipPath id="clip_1">
                  <use xlink:href="#artboard_1" clip-rule="evenodd" />
                </clipPath>
              </defs>
              <g id="Honor-View-20" clip-path="url(#clip_1)">
                <use xlink:href="#artboard_1" stroke="none" fill="#FFFFFF" fill-opacity="0" />
                <g id="Group" transform="translate(9.679199 10)">
                  <path d="M0 0L200.642 0L200.642 276L0 276L0 0Z" id="Rectangle" fill="none" stroke="#808080"
                    stroke-width="11" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="18 29 0 0" />
                  <path d="M0 1L113 1" transform="translate(43.8208 138)" id="Line" fill="none" stroke="#808080"
                    stroke-width="9" stroke-linecap="round" stroke-linejoin="round" />
                  <path d="M0 0L0 125" transform="translate(100.3208 75.50001)" id="Line" fill="none" stroke="#808080"
                    stroke-width="9" stroke-linecap="round" stroke-linejoin="round" />
                </g>
              </g>
            </svg>
          </div>
        </div>
      </div>

      <div class="playCLassBottom">
        <el-button @click="addPlayBtn" type="success">
          添加分类
        </el-button>
        <el-button @click="playDelClick" type="danger">
          删除
        </el-button>
        <el-button @click="playTopDelList=[];isChecBox=false" v-show="playTopDelList.length>0?true:false" type="danger">
          取消选中
        </el-button>
      </div>
    </el-drawer>
    <!--<<<<<<<<<<<<<<<<<<<<<<参与者编辑从下往上弹出 stop -->

    <!-- right添加演员dialog >>>>>>>>>>>>>>>>>>-->

    <el-dialog title="" :visible.sync="addRightVisible" width="50%" :before-close="addRightVisibleClose">
      <el-form :model="rightPlayForm" :rules="rules" ref="addRightRef" label-width="100px" class="demo-ruleForm">
        <!-- which_id:Number(),  //电影id
            play_class:'', //分类名称
            actor_id:'' , //人员id
            cos_play:''  //扮演角色-->
        <el-alert style="margin-bottom:10px;" v-show="orPlayAdd==1?true:false" title="分类要包含一个演员" type="warning"
          show-icon>
        </el-alert>
        <el-form-item label="分类" prop="play_class">
          <el-input :disabled="isClass" v-model="rightPlayForm.play_class"></el-input>
        </el-form-item>
        <el-form-item label="选择人员" prop="actor_id">
          <el-autocomplete popper-class="my-autocomplete" v-model="rightaddValue" :fetch-suggestions="querySearch"
            placeholder="请输入并选择一个演员" @select="handleSelect">

            <template slot-scope="{ item }">

              <div class="addPreviewBox">
                <div class="addPlayPreview">
                  <img width="100%" :src=" item.p_pic" alt="">
                </div>
                <div class="playName">
                  {{item.address}}
                </div>
              </div>


            </template>

          </el-autocomplete>
          <!-- <el-input v-model="rightPlayForm.actor_id"></el-input> -->
        </el-form-item>
        <el-form-item label="扮演角色" prop="cos_play">
          <el-input v-model="rightPlayForm.cos_play"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addRightCancel('addRightRef')">取 消</el-button>
        <el-button v-show="orPlayAdd==0?true:false" type="primary" @click="addRightFinish('addRightRef')">确定</el-button>
        <el-button v-show="orPlayAdd==1?true:false" type="primary" @click="addPlayFinish('addRightRef')">添加</el-button>
      </span>
    </el-dialog>

    <!--<<<<<<<<<<<<<<<   right添加演员dialog -->

    <!--   start  剧照从下往上弹出  >>>>>>>>>>>>>>>>> -->
    <el-drawer title="编辑>剧照>" :visible.sync="imgDrawer" :direction="direction"
      size="93%;border-radius:30px 30px 0px 0px">
      <div class="imgbox">
        <div class="imgBoxTop">

          <div style="width:300px" v-for="(item,i) in movieListAll.img_list" :key="i">
            <div style="position:relative;">
              <div ref="delBackground" :key='i' style="display:none;" class="imgdelBackground">
                <i class="el-icon-delete-solid"></i>
              </div>
              <img ref='imgref' :key="item.id" @click="isDel==1?imgclick(item.id,'imgref',i,'delBackground'):''"
                width="90%" :src="item.s_path" lazy alt="加载出错">
            </div>
          </div>

        </div>
        <div class="imgBoxBottom">
          <el-button @click="addImgClick" type="success">添加</el-button>
          <el-button type="danger" @click="delImg">删除</el-button>
          <el-button v-show="delarr.length==0?false:true" type="danger" @click="delImgCancel">取消删除</el-button>
        </div>
      </div>

    </el-drawer>
    <!-- <<<<<<<<<<<<<<<剧照从下往上弹出 stop -->



    <!-- 添加剧照 dialog   start -->
    <el-dialog title="添加剧照" :visible.sync="addImgVisible">
      <el-form ref="addImgFormRef" :rules="rules" :model="addImgForm">
        <el-form-item label="图片URL" prop="s_path">
          <el-input v-model="addImgForm.s_path" autocomplete="off"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addImgCancel">取 消</el-button>
        <el-button type="primary" @click="addImgFinish('addImgFormRef')">添加</el-button>
      </div>
    </el-dialog>
    <!-- 添加剧照 dialog   \stop -->

  </div>
</template>

<script>
  import loading from "./loading";
  export default {
    component: {
      loading
    },
    data() {
      var url = (rule, value, callback) => {
        var regex = /(http|https):\/\/.+(\.jpg|\.png|\.mp4|\.wav|\.avi|\.mov|\.flv|\.webm)/gi;
        if (!regex.test(value)) {
          callback(new Error("请输入正确链接"));
        } else {
          callback();
        }
      };
      var actor_id = (rule, value, callback) => {
        if (this.rightPlayForm.actor_id == '') {
          callback(new Error("请选择演员,如果没有,请先添加"));
        } else {
          callback();
        }
      };
      return {
        loading: false,
        //搜索框input
        searchValue: "",
        //搜索框展示的电影信息
        movieList: {},
        //搜索框的options
        searchOptions: [],
        //电影详情,所有
        movieListAll: [],
        //定义弹出框的方向,
        direction: "btt",
        //<<<< 视频的添加还是修改 >>>>
        isVideoDialog: 0,
        //预告视频弹出框
        videoDrawer: false,
        // 预告视频修改弹出框
        editVideoVisible: false,
        // 预告视频编辑表单
        editVideoFormData: {},

        /* <<<<<<<< 参与者 start   >>>>>>>>>>>>>>>>>>*/
        //参与者编辑窗口
        playDrawer: false,
        // right 参与者添加
        rightPlayForm: {
          which_id: this.searchValue, //电影id
          play_class: "", //分类名称
          actor_id: "", //人员id
          cos_play: "", //扮演角色
        },
        //right添加电影参与者弹出框
        addRightVisible: false,
        //right添加参与者动态搜索input
        rightAddPlayInput: '',
        // 用与展示的人员名字
        rightaddValue: '',
        // 多选删除演员角色数组
        playTopDelList: [],
        // 控制删除checBox是否显示
        isChecBox: false,
        isClass: true, //分类是否可编辑 ， 右侧添加不可编辑， 添加分类可编辑
        orPlayAdd: 0, // 0 : 右侧添加  1 : 添加
        /* <<<<<<<<  stop 参与者  >>>>>>>> >>>>*/



        /* <<<<<<<<     start 剧照 从下往上弹出框    >>>>>>>> >>>>*/

        // 从下往上弹框
        imgDrawer: false,
        // 是否启用删除
        isDel: 0,
        //多选删除选择的图片信息
        delarr: [],
        //添加img的弹框，显示隐藏
        addImgVisible: false,
        //添加剧照的表单
        addImgForm: {
          s_id: '',
          s_path: ''
        },

        /* <<<<<<<<     stop剧照 从下往上弹出框    >>>>>>>> >>>>*/

        //校验规则
        rules: {
          title: [{
              required: true,
              message: "请输入视频标题",
              trigger: "change",
            },
            {
              min: 5,
              max: 500,
              message: "长度在 5 到 500 个字符",
              trigger: "change",
            },
          ],
          play_class: [{
              required: true,
              message: "请输入一个分类",
              trigger: "blur",
            },
            {
              min: 1,
              max: 10,
              message: "长度在 1 到 5 个字符",
              trigger: "blur",
            },
          ],
          t_path: [{
            required: true,
            validator: url,
            trigger: "change",
          }, ],
          s_path: [{
            required: true,
            validator: url,
            trigger: "change",
          }, ],

          actor_id: [{
            required: true,
            validator: actor_id,
            trigger: "change",
          }],
          cos_play: [{
              required: true,
              message: "请输入视频标题",
              trigger: "change",
            },
            {
              min: 1,
              max: 10,
              message: "长度在 1 到 10 个字符",
              trigger: "change",
            },
          ],
        },
      };
    },
    methods: {
      //动态获取搜索框的值
      filterMethods(query) {
        if (query != "") {
          console.log(query);
          this.loading = true;
          setTimeout(async () => {
            let {
              data: res
            } = await this.$axios.get("getinfo/search", {
              params: {
                movie_name: query,
              },
            });
            if (res.meta.status != 200) return this.$message.error("获取失败");
            let arr = [];
            res.data.forEach((e, i) => {
              console.log(e);
              arr.push({
                label: e.movie_name,
                value: e.movie_id,
              });
            });
            this.searchOptions = arr;
            this.loading = false;
          }, 500);
        } else {
          this.searchOptions = [];
        }
      },

      //video编辑btn
      videoAllBtn() {
        this.videoDrawer = true;
      },
      //video删除按钮
      async videoDel(id) {
        console.log(id);
        let {
          data: res
        } = await this.$axios.delete("updateinfo/video", {
          params: {
            id,
          },
        });
        this.getMovieInfoList();
      },
      //video添加预告视频按钮
      viedoAddClick() {
        this.isVideoDialog = 1;
        console.log("触发");
        this.editVideoFormData = {
          t_path: "",
          title: "",
          t_id: this.searchValue,
        };
        this.editVideoVisible = true;
      },
      //video dialog添加 的保存按钮
      addVideoFinishBtn(ref) {
        console.log("触发Finish");
        this.$refs[ref].validate(async (valid) => {
          if (valid) {
            let {
              data: res
            } = await this.$axios.post(
              "/addinfo/video",
              this.editVideoFormData
            );
            console.log(res);
            if (res.meta.status != 200) return this.$message.error("添加失败");
            this.$message.success("添加成功");
            this.getMovieInfoList();
            this.editVideoVisible = false;
            this.editVideoFormData = {};
          } else {
            return false;
          }
        });
      },

      //video dialog添加 的取消按钮
      addVideoCancelBtn() {
        console.log("触发Cancel");
        this.editVideoVisible = false;
      },
      //视频编辑按钮
      async videoEdit(id) {
        this.isVideoDialog = 0;
        console.log(id);
        let {
          data: res
        } = await this.$axios.get("getinfo/trailer/get", {
          params: {
            t_id: this.searchValue,
            id: id,
          },
        });
        if (res.meta.status != 200) {
          this.$message.error("失败");
        }
        this.editVideoFormData = res.data[0];
        this.editVideoVisible = true;
      },

      //修改video dialog确定按钮
      editVideoFinishBtn(ref) {
        this.$refs[ref].validate(async (valid) => {
          if (valid) {
            console.log(this.editVideoFormData);
            let {
              data: res
            } = await this.$axios.post(
              "updateinfo/setVideo",
              this.editVideoFormData
            );
            if (res.meta.status != 200) return this.$message.error("修改失败");
            console.log(res);
            this.$message.success(res.meta.msg);
            this.editVideoVisible = false;
          } else {
            return false;
          }
        });
      },
      //编辑dialog取消按钮
      editVideoCancelBtn(ref) {
        this.$refs[ref].resetFields();
        this.editVideoVisible = false;
      },
      //编辑按钮关闭前提示
      beforeEditBtnClose() {
        this.$confirm("确认关闭？")
          .then((_) => {
            this.editVideoVisible = false;
            done();
          })
          .catch((_) => {});
      },

      //img 从下往上弹框内容 start >>>>>>>>>>>>>>>>>>>
      //img编辑btn
      imgAllBtn() {
        console.log("触发");
        setTimeout((_) => {
          this.imgDrawer = true;
        }, 500)

      },
      //loadmore : 触底事件
      loadmore() {
        console.log('触底了');

      },
      //img点击
      imgclick(id, ref, i, delref) {
        console.log(id, ref)
        console.log(this.$refs[ref][i]);
        this.$refs[delref][i].style.display = 'flex'
        this.delarr.push(id)
        if (this.delarr.length == 0) {
          return this.$message.error('未选择任何图片')
        }

      },
      // img 删除按钮
      async delImg() {
        this.isDel = 1;
        if (this.delarr.length == 0) {
          return this.$notify.warning('单击图片选择删除')
        }
        let {
          data: res
        } = await this.$axios.delete('/updateinfo/imgdel', {
          data: {
            id: this.delarr
          }
        })
        if (res.meta.status != 200) {
          return this.$message.error('删除失败')
        }
        this.$message.success('删除成功')
        this.getMovieInfoList()
        this.delImgCancel()
      },
      //img 取消删除按钮
      delImgCancel() {
        let delElement = this.$refs['delBackground'];
        for (let i = 0; i < delElement.length; i++) {
          delElement[i].style.display = 'none';
        }
        this.delarr = []
        this.isDel = 0
      },
      //添加按钮
      addImgClick() {
        this.addImgVisible = true
      },
      //img取消添加dialog按钮
      addImgCancel() {
        this.addImgVisible = false;
        this.addImgForm.url = '';
        this.$refs['addImgFormRef'].resetFields()
      },
      //img添加，确定按钮
      addImgFinish(ref) {

        this.$refs[ref].validate(async (valid) => {
          if (valid) {
            this.addImgForm.s_id = this.searchValue
            let {
              data: res
            } = await this.$axios.post('/addinfo/addimg', this.addImgForm)
            if (res.meta.status != 200) return this.$message.error('添加失败')
            this.$message.success('添加成功')
            this.addImgVisible = false
            this.addImgForm.s_path = ''
            this.getMovieInfoList()
          } else {
            return this.$notify.error('请输入url')
          }
        });
      },

      //img 从下往上弹框内容 stop >>>>>>>>>>>>>>>>>>>





      /*<<< start 电影参与者  >>>>>>>>>>>>>*/

      //扮演角色编辑按钮btn
      playAllBtn() {
        this.playDrawer = true;
        console.log(this.movieListAll);
      },

      //>>>>>>>>>>>>添加按钮 start
      //exp:  0 : 右侧添加  1 : 添加
      // 扮演角色添加按钮
      addPlayBtn() {
        this.orPlayAdd = 1
        console.log();
        this.isClass = false
        this.addRightVisible = true;
      },
      //right 扮演角色右侧添加按钮
      rightAddBtn(ls) {
        this.orPlayAdd = 0
        console.log(ls);
        this.isClass = true
        this.rightPlayForm.which_id = this.searchValue;
        this.rightPlayForm.play_class = ls;
        this.addRightVisible = true;
      },
      //>>>>>>>>>>>>>>添加按钮 stop
      //关闭前提示
      addRightVisibleClose(ref) {
        this.$confirm("确认关闭？")
          .then((_) => {
            this.addRightVisible = false;
            this.clearRightForm()
            this.$refs['addRightRef'].resetFields()
            done();
          })
          .catch((_) => {});
      },
      // 取消添加按钮
      clearRightForm(ref) {
        // rightPlayForm: {
        //   which_id: this.searchValue, //电影id
        //   play_class: "", //分类名称
        //   actor_id: "", //人员id
        //   cos_play: "", //扮演角色
        // },
        this.rightPlayForm.play_class = '';
        this.rightPlayForm.actor_id = '';
        this.rightPlayForm.cos_play = '';

      },
      addRightCancel() {
        //取消隐藏
        this.$refs['addRightRef'].resetFields()
        this.addRightVisible = false;
        this.clearRightForm('addRightRef')
      },
      //play right 确定添加按钮
      addRightFinish(ref) {

        this.$refs[ref].validate(async (valid) => {
          if (valid) {
            let {
              data: res
            } = await this.$axios.post('/addinfo/mactor', this.rightPlayForm)
            if (res.meta.status != 200) return this.$message.error('添加失败')
            this.$message.success('添加成功')
            this.clearRightForm()
            this.addRightVisible = false
            this.getMovieInfoList()
          } else {
            return this.$notify.error('请选择必要信息')
          }
        });
      },
      // 演员添加按钮 须填写分类的
      addPlayFinish(ref) {
        this.rightPlayForm.which_id = this.searchValue;
        console.log(this.rightPlayForm);
        this.$refs[ref].validate(async (valid) => {
          if (valid) {

            let {
              data: res
            } = await this.$axios.post('/addinfo/mactor', this.rightPlayForm)
            if (res.meta.status != 200) return this.$message.error('添加失败')
            this.$message.success('添加成功')
            this.addRightVisible = false
            this.clearRightForm()
            this.getMovieInfoList()
          } else {
            return this.$notify.error('请选择必要信息')
          }
        });
      },
      async querySearch(value, cb) {
        console.log(value);

        let {
          data: res
        } = await this.$axios.get('/getinfo/actor/get', {
          params: {
            p_name: value
          }
        })
        if (res.meta.status != 200) return this.$message.error('获取人员列表失败')
        let arr = [

        ]
        res.data.forEach((item, i) => {
          arr.push({
            value: item,
            address: item.p_name,
            p_pic: item.p_pic,
            id: item.actor_id
          })
        })
        cb(arr);
      },

      handleSelect(item) {
        //动态名字
        this.rightaddValue = item.value.p_name
        // 记录当前名字的id
        this.rightPlayForm.actor_id = item.value.p_id
        console.log(item);
        console.log(this.rightPlayForm);

      },
      //删除电影演员，（Array）
      async playDelClick() {
        this.isChecBox = true;
        this.playTopDelList;
        if (this.playTopDelList.length == 0) {
          return this.$notify.warning('没有选择删除项')
        }

        let {
          data: res
        } = await this.$axios.delete('/updateinfo/playdel', {
          data: {
            id: this.playTopDelList
          }
        })
        if (res.meta.status != 200) return this.$message.error('删除失败')
        this.$message.success('删除成功');
        this.playTopDelList = []
        this.getMovieInfoList()
        this.isChecBox = false;
      },

      /*<<< stop  电影参与者  >>>>>>>>>>>>>*/



      //获取电影信息  0:一维数组 1:tree结构
      async getMovieInfoList() {
        //获取电影信息
        let {
          data: res
        } = await this.$axios.get("getinfo/info", {
          params: {
            movie_id: this.searchValue,
            tree: 1,
          },
        });
        if (res.meta.status != 200) return this.$message.error("获取失败");
        this.movieListAll = res.data;
      },
    },
    computed: {},
    mounted() {},
    watch: {
      async searchValue() {
        console.log("改变");
        let {
          data: movieData
        } = await this.$axios.get(`getinfo/movie`, {
          params: {
            id: this.searchValue
          }
        });
        console.log(movieData);
        if (movieData.meta.status != 200) return this.$notify.error("获取失败");
        this.movieList = movieData.data;
        this.getMovieInfoList()
      },
      //监听演员删除数组
      playTopDelList() {
        console.log(this.playTopDelList);
      }

    },
  };
</script>

<style scoped>
  .el-card {
    margin: 10px;
  }

  .left-img {
    width: 140px;
    height: 200px;
    box-sizing: border-box;
    overflow: hidden;
    display: inline-block;
    margin-left: 10px;
  }

  .right-img {
    width: 600px;
    height: 200px;
    border-radius: 10px;
    box-sizing: border-box;
    overflow: hidden;
    display: inline-block;
    margin-left: 10px;
  }

  .about-span {
    font-size: 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    line-clamp: 2;

  }

  /* 预告视频box */
  .trailer {
    width: 100%;
    height: 180px;
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
  }

  .trailer-videoAllbtn {
    width: 110px;
    height: 100%;
    /* background-color: red; */
    display: inline-block;
    cursor: pointer;
  }

  .trailerHeader {
    display: flex;
    justify-content: space-between;
  }

  .trailer-preview-box {
    width: 100%;
    height: 90%;
    display: flex;
    flex-wrap: nowrap;
    overflow: auto;
    margin-bottom: 20px;
  }

  .videos {
    margin: 0px 10px 0px 10px;
    display: inline-block;
  }

  /* 扮演者box */
  .cosplay {
    width: 100%;
    height: 200px;
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
  }

  /* cosplay内容box */
  .cosplay-preview-box {
    width: 90%;
    height: 200px;
    display: flex;
    flex-wrap: nowrap;
    overflow: auto;
    margin-bottom: 20px;
  }

  .cosplayBox {
    height: 100%;
    display: inlin-block;
    display: flex;
    flex-wrap: nowrap;
    text-align: center;
  }

  .coslayImg {
    width: 100%;
  }

  .cosplaySpan {
    text-align: center;
  }

  .videoPreviewTop {
    height: 93%;
    width: 100%;
    /* background: red; */
    overflow: auto;
  }

  .videoPriveBox {
    width: 250px;
    height: 245px;
    background-color: rgba(179, 184, 182, 0.507);
    text-align: center;
    display: inline-table;
    margin: 10px;
    position: relative;
    border-radius: 5px;
  }

  .videoPreviewBottom {
    height: 7%;
    width: 100%;
    position: fixed;
    bottom: 0;
    text-align: center;
  }

  .edit_el-button--danger {
    background-color: #d9dbda;
    color: black;
    border: 2px solid black;
  }

  .del-el-button--danger {
    background-color: #d9dbda;
    color: black;
    border: 2px solid black;
  }

  .edit_el-button--danger:hover {
    background-color: rgba(77, 218, 147, 0.76);
  }

  .del-el-button--danger:hover {
    background-color: rgba(255, 0, 0, 0.7);
  }

  /* 参与者编辑框title */
  .playClassTitle {
    width: 150px;
    color: rgb(0, 0, 0);
    padding-left: 10px;
    line-height: 50px;
    font-size: 24px;
    font-weight: bold;
  }

  /* 参与者头像展示box */
  .classPersonBox {
    width: 130px;
    height: 175px;
    display: flex;
    overflow: auto;
    margin: 20px;
    background-color: rgba(160, 160, 160, 0.541);
  }

  .playCLassBox {
    height: 80vh;
    overflow: auto;
  }

  .playCLassBottom {
    width: 100%;
    position: absolute;
    bottom: 5px;
    text-align: center;
  }

  .playAddBox {
    width: 132px;
    display: inline-block;
    margin: 10px;
    height: 140px;
    cursor: pointer;
  }

  .addPlayPreview {
    width: 80px;
    height: 80px;
    background-color: aqua;
    border-radius: 80px;
    overflow: hidden;
    display: inline-block;
  }

  .addPreviewBox {
    height: 90px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .playName {
    width: 80px;
    display: inline-block;
    padding-left: 10px;
    font-size: 20px;
  }


  /* 剧照编辑区top*/
  .imgBoxTop {
    height: 700px;
    width: 100%;
    position: relative;
    overflow: auto;
    display: flex;
    flex-wrap: wrap;
  }

  /* 剧照编辑区bottom*/
  .imgBoxBottom {
    width: 100%;
    height: 10%;
    position: fixed;
    bottom: 0;
    text-align: center;
  }

  .imgbox {
    width: 100%;
    height: 80%;
    overflow: auto;
  }

  #vueWaterfall {
    width: 100%;
  }

  .imgdelBackground {
    width: 90%;
    height: 98%;
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(114, 114, 114, 0.7);
    font-size: 50px;
    top: 0;
    z-index: 10;
    color: rgba(238, 115, 115, 0.719);
  }

  .searchPlace {
    height: 500px;
    font-size: 40px;
    text-align: center;
    color: #8d8f8e;
    font-family: '楷体';
  }
</style>