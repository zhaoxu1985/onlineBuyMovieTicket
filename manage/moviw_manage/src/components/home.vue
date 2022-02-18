<template>
  <div class="box">
    <el-container>
      <!-- 头部导航栏 -->
      <el-header>
         <div class="headerBox">
            <div class="imgRound"> 
                
                <ul class="uls">
                    <div class="headPhoto">
                         <img width="100%" style="height:50px" src="img/ikon.png" alt="">
                    </div>
                  
                  <li @click="exit">退出登录</li>
                  
                </ul>
            </div>
         </div>
      </el-header>
      <el-container>
        <!-- 左侧菜单栏 -->

        <el-aside width="" height="100%">
          <!-- 展开关闭按钮 -->

          <div class="menuBox">
            <el-menu
              @select="selectMenu"
              router
              unique-opened
              :default-active="!menuIndex ? 'now' : menuIndex"
              class="el-menu-vertical-demo"
              :collapse="isno"
            >
              <el-button style="width:100%;" @click="swich" v-if="isno"
                >展开</el-button
              >
              <el-button style="width:100%;" @click="swich" v-if="!isno"
                >收起</el-button
              >
              <el-submenu index="1">
                <template slot="title">
                  <i class="el-icon-menu"></i>
                  <span>电影信息</span>
                </template>
                <el-menu-item @click="reindex('now')" index="now"
                  ><i class="el-icon-huo iconfont"></i>正在热映
                </el-menu-item>
                <el-menu-item @click="reindex('leave')" index="leave">
                  <i class="aliIcon el-icon-xiajia iconfont"></i> 以下架</el-menu-item
                >
              </el-submenu>
              <el-submenu index="2">
                <template slot="title">
                  <i class="el-icon-dianying iconfont aliIcon"></i>
                  <span slot="title">电影管理</span>
                </template>
                <el-menu-item @click="reindex('addinfo')" index="addinfo"
                  ><i class="aliIcon iconfont el-icon-tianjia"></i> 添加影片
                </el-menu-item>
                <el-menu-item @click="reindex('addplay')" index="addplay">
                  <i class="el-icon-wode iconfont aliIcon"></i>
                  添加人员</el-menu-item
                >
                <el-menu-item @click="reindex('moviedetail')" index="moviedetail">
                  <i class="el-icon-bianji iconfont aliIcon"></i>
                  编辑信息</el-menu-item
                >
              </el-submenu>

              <el-submenu index="3">
                <template slot="title">
                  <i class="aliIcon iconfont el-icon-huiyishi"></i>
                  <span slot="title">影厅管理</span>
                </template>
                <el-menu-item @click="reindex('room')" index="room"
                  >
                  <i class="aliIcon iconfont el-icon-tianjia"></i>
                  添加影厅
                  </el-menu-item
                >
              </el-submenu>

              <!-- 第四栏目 -->
              <el-submenu index="4">
                <template slot="title">
                  <i class="aliIcon iconfont el-icon-richenganpai"></i>
                  <span slot="title">排片管理</span>
                </template>
                <el-menu-item @click="reindex('schedule')" index="schedule"
                  >
                  <i class="aliIcon iconfont el-icon-tianjia"></i>
                  添加排片
                  </el-menu-item
                >
              </el-submenu>
            </el-menu>
          </div>
        </el-aside>

        <!-- 右侧主题区 -->
        <el-main>
          <router-view>
            <movieinfo></movieinfo>
          </router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //展开关闭按钮
      isno: false,
      //打开的菜单
      menuIndex: "",
    };
  },
  methods: {
    selectMenu(index) {
      console.log(index);
    },
    //打开关闭左侧菜单
    swich: function() {
      this.isno = !this.isno;
      console.log(this.isno);
      if (this.isno == true) {
        this.bgmenu = "red";
      }
      if (this.isno == false) {
        this.bgmenu = "pink";
      }
    },
    //记录打开的菜单项
    reindex(index) {
      window.sessionStorage.setItem("menuIndex", index);
    },
    //退出
    exit(){
      window.sessionStorage.clear('token');
      this.$router.push('/login')
      this.$notify.success('已退出')
    }
  },
  created() {
    this.menuIndex = window.sessionStorage.getItem("menuIndex");
  },
};
</script>

<style>

/*整体部分*/ 
::-webkit-scrollbar
{
	width: 10px;
	height: 10px;
}
/*滑动轨道*/ 
::-webkit-scrollbar-track
{
    width: 15px;
	border-radius: 0px;
	background: none;
}
/*滑块*/
::-webkit-scrollbar-thumb
{
	border-radius: 5px;
	-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.2);
	background: linear-gradient(#f84646, #727df1,#f54040);
}
/*滑块效果*/ 
::-webkit-scrollbar-thumb:hover
{
    width: 10px;
	border-radius: 5px;
	-webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.2);
	background-color: rgba(85, 85, 85, 0.4);
}

.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
}
.aliIcon{
  margin-right: 5px !important;
}
.aliIcon::before{
  font-size: 20px !important;
}
.el-aside {
  transition: 1s ease;

}


.box {
  width: 100vw;
  height: 100vh;
}

.el-icon-huo {
  color: #ff0808 !important;
}

.el-header {
  height: 20vh;
  width: 100%;
  color: aliceblue;
  font-size: 25px;
  background-color: #575757fd;
  /* background-color: white; */
  line-height: 60px;
}

.isnoBtn {
  width: 100%;
  border-radius: 0;
  border: 0;
  background-color: #f56c6c;
  color: white;
}

.el-main {
  width: 98vw;
  height: 92.8vh;
  background-color: rgba(236, 76, 76, 0.513);
}
 .headerBox{
   width: 100%;
   height: 100%;
   display: flex;
   justify-content: flex-end;
  
 }  
 .imgRound{
   width: 100px;

   margin-right: 20px;
  z-index: 2;
   /* text-align: center; */
 }
 .el-header{
   padding: 0;
   margin: 0;
 }
 .uls{
   width: 100%;
    list-style: none;
    font-size: 15px;
    margin: 0;
    padding: 0;
    height: 100%;
    text-align: center;
    position: relative;
    
 }
 .uls:hover li{
    display: block;
    background-color: #f56c6c;
 }
 .uls>li{
   display: none;
   text-align: center;
   cursor: pointer;
   margin-top:-20px;
 }
 .headPhoto{
   display: inline-block;

   width: 50px;
   height: 50px;
   overflow: hidden;
   margin-top: 5px;
   border-radius: 50%;
 }
</style>
