<template>
    <div>
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/now' }">
                <font class="itemFont">首页</font>
            </el-breadcrumb-item>
            <el-breadcrumb-item>
                <font class="itemFont">影厅管理</font>
            </el-breadcrumb-item>
            <el-breadcrumb-item>
                <font class="itemFont">添加影厅</font>
            </el-breadcrumb-item>
        </el-breadcrumb>
        <el-card class="topCard" shadow="always">
            <el-input style="width:20%" v-model="searchInput"></el-input>

            <el-button @click="searchBtn" class="searchBtn" type="info" icon="el-icon-search" round></el-button>
            <el-button @click="searchBtnClear" class="searchBtn" type="danger" icon="el-icon-delete" round></el-button>
            <el-button @click="addRoomDialog" type="success" class="addRoomBtn"> 添加影厅</el-button>
            <!-- 总是显示 -->
        </el-card>
        <el-card class="topCard" shadow="always">
            <el-table :data="movieDataList" border style="width: 100%">
                <el-table-column prop="r_name" label="影厅名称" width="180">
                </el-table-column>
                <el-table-column prop="r_size" label="影厅大小" width="180">
                </el-table-column>
                <el-table-column prop="r_rows" label="总行"> </el-table-column>
                <el-table-column prop="r_cols" label="总列"> </el-table-column>
                <el-table-column prop="editor" label="编辑">
                    <template slot-scope="scope">
                        <div>
                            <el-button size="small" @click="selectRoomBtn(scope.row)" type="info">查看</el-button>
                            <el-button size="small" @click="editorRoomBtn(scope.row)" type="primary">编辑</el-button>
                            <el-popconfirm @confirm="deleteRoom(scope.row)" confirm-button-text='好的'
                                cancel-button-text='不用了' icon="el-icon-info" icon-color="red" title="这是一段内容确定删除吗？">
                                <el-button size="small" type="danger" slot="reference">删除</el-button>
                            </el-popconfirm>
                        </div>
                    </template>
                </el-table-column>

            </el-table>
            <div class="block">
                <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                    :current-page="page.nowPage" :page-sizes="[5, 10, 15, 20]" :page-size="page.pageSize"
                    layout="total, sizes, prev, pager, next, jumper" :total="page.total">
                </el-pagination>
            </div>
        </el-card>

        <!-- 添加影厅编辑框 -->
        <el-dialog :visible.sync="addRoomDialogVisible" style="background-color:#F8F7F7" width="100%"
            :before-close="addRoomHandleClose">
            <div :style="'height:'+seatBoxH" class="add-dia classlog-box">
                <el-row>
                    <el-col style="height:100vh" :span="7">
                        <div class="editBtnBox">
                            <el-tooltip effect="dark" content="可拖动选择" placement="bottom">
                                <el-button @click="btnState=true" class="untifyWidhtBtn" type="success">
                                    <i class="el-icon-bianji iconfont"></i>选择可用座位(可拖动)</el-button>
                            </el-tooltip>

                            <el-tooltip effect="dark" content="可拖动选择" placement="bottom">
                                <el-button @click="btnState=false" class="untifyWidhtBtn" type="danger">
                                    <i class="el-icon-bianji iconfont"></i>选择不可用(可拖动)</el-button>
                            </el-tooltip>

                            <el-form v-if="isEditStatus==false" :model="addRoom" status-icon :rules="rules"
                                ref="addRuleForm" class="demo-ruleForm">
                                <!-- <el-row>影厅名称</el-row> -->
                                <el-form-item label="影厅名称" prop="r_name">
                                    <el-input class="untifyWidht" placeholder="请输入影厅名称" v-model="addRoom.r_name"
                                        clearable>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="总行数" prop="r_rows">
                                    <el-input class="untifyWidht" placeholder="请输入总行数" v-model="addRoom.r_rows"
                                        clearable>
                                    </el-input>
                                </el-form-item>
                                <el-form-item label="总列数" prop="r_cols">
                                    <el-input class="untifyWidht" placeholder="请输入总列数" v-model="addRoom.r_cols"
                                        clearable>
                                    </el-input>
                                </el-form-item>

                                <el-form-item prop="screen_location">
                                    屏幕位置
                                    <el-input style="width:70px;margin-right:30px;padding:0px" class="untifyWidht"
                                        v-model="addRoom.screen_location.x">
                                    </el-input> 至
                                    <el-input style="width:70px" class="untifyWidht"
                                        v-model="addRoom.screen_location.y">
                                    </el-input>

                                </el-form-item>

                            </el-form>
                            <!-- <el-button @click="addResetForm('addRuleForm')">重置</el-button> -->
                            <el-button v-if="isEditStatus==false" type="danger" style="margin-top:20px"
                                @click="clearAddRoom('addRuleForm')">清空
                            </el-button>
                            <el-button v-if="isEditStatus==false" style="margin-top:20px" @click="preview">生成座位
                            </el-button>
                            <div style="margin-top:50px">
                                <el-button @click="addRoomDialogcancel">取 消</el-button>

                                <el-button v-if="isEditStatus==false" type="primary"
                                    v-loading.fullscreen.lock="addLoading" @click="addRoomDialogFinish('addRuleForm')">
                                    添加</el-button>

                                <el-button v-if="isEditStatus==true" type="primary"
                                    v-loading.fullscreen.lock="addLoading" @click="EditRoomDialogFinish('addRuleForm')">
                                    保存</el-button>

                            </div>
                        </div>
                    </el-col>
                    <!-- 编辑区域 -->
                    <el-col :style="'height:'+addRoom.r_rows<5?'100vh':seatBoxH" :span="16">
                        <div id="seatbox" :style="'height:'+seatBoxH" ref="seatBoxRefs">
                            <div class="topSelectScript">
                                <div :style="'width:'+stripWH+'px;margin:5px 5px 0px 5px;text-align:center;font-size:15px;color:white;'"
                                    v-for="item in Number(addScripCols)" :key="item">{{item}}</div>
                            </div>
                            <div class="leftSelectScript">
                                <div :style="'height:'+Number(stripWH+3.5)+'px; display: flex;align-items: center;justify-content: center;margin:5px;text-align:center;font-size:15px;color:white;'"
                                    v-for="item in Number(addScripRows)" :key="item">{{item}}</div>
                            </div>
                            <!-- 屏幕位置 -->
                            <div class="addScreenLocation"
                                :style="'margin:5px 5px 0px 5px;left:'+addScreenLocationLeft+'px;width:'+addScreenLocationW+'px'">
                                {{addScripName}}
                            </div>
                            <drag-select-container @change="selectChange($event)" selectorClass="item">
                                <template slot-scope="selectedItems">
                                    <div ref='seat' :style="formatItemWidth" :x="item.x" :y="item.y"
                                        v-for="(item,i) in addRoom.seat_state" :key="i"
                                        :class="getClasses(item, selectedItems)" :data-item="item.key">
                                        <!-- {{item.x}} {{item.y}} 状态::{{item.isNull}} -->

                                    </div>
                                </template>
                            </drag-select-container>
                        </div>
                    </el-col>
                    <!-- 编辑区域结束 -->

                </el-row>
            </div>

        </el-dialog>
        <!-- /////添加影厅编辑框 -->
        <!-- 查看-->
        <el-dialog title="查看" :visible.sync="selectVisible" width="500px" :before-close="selectBeforeClose">
            <div class="view-preview">
                <div class="view-preview-box">
                    <div class="select-screen-box">
                        <!-- 从此处编写 -->
                        <div class="select-screen-box-header">
                            <div class="select-screen-box-header-left"> <i class="el-icon-arrow-left"></i> </div>
                            <div class="select-screen-box-header-right"> <i class="el-icon-more"></i> </div>
                        </div>
                        <!-- 渲染座位 -->
                        <div class="select-screen-box-center">

                            <div :style="`${seatAnimation};width:`+selectWH.w+'px;height:'+selectWH.h+'px;left:-'+selectMleft+'px;top:-'+selectMtop+'px;display:inline-block;transition:1.5s all;position:absolute;'">
                                <div v-for="(item,i) in seatFormat" :key="i">
                                    <div class="selectSeatW" :style="items.isNull==1?selectSuccess:selectError"
                                        v-for="(items,k) in item" :key="k">{{items.a}}
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                    <img width="350px" src="../../public/img/screen.png" alt="">
                </div>

            </div>


            <span slot="footer" class="dialog-footer">
                <el-button @click="selectVisible=false">取消</el-button>
                <el-button type="primary" @click="selectVisible=false">确定</el-button>
            </span>
        </el-dialog>
        <!-- 查看结束 -->
    </div>
</template>

<script>
    import DragSelect from 'vue-drag-select/src/DragSelect.vue'
    export default {

        components: {
            'drag-select-container': DragSelect
        },
        data() {
            let regex = /\D/g;

            let r_name = (rule, value, callback) => {
                if (value.length == '') {
                    callback(new Error('请输入'))
                }
                callback()
            }
            let r_rows = (rule, value, callback) => {
                if (regex.test(value)) {
                    callback(new Error('只能输入数字'))
                }
                if (value.length == '') {
                    callback(new Error('请输入'))
                }
                callback()
            }
            let r_cols = (rule, value, callback) => {
                if (regex.test(value)) {
                    return callback(new Error('只能输入数字'))
                }
                if (value.length == '') {
                    callback(new Error('请输入'))
                }
                callback()
            }
            let screen_location = (rule, value, callback) => {
                // console.log(value);
                if (regex.test(value.x) || regex.test(value.y)) {
                    return callback(new Error('只能输入数字'))
                }
                if (value.x.length == '' || value.y.length == '') {
                    callback(new Error('请输入'))
                }
                callback()
            }

            return {

                rules: {
                    r_name: [{
                        validator: r_name,
                        trigger: 'blur'
                    }],
                    r_rows: [{
                        validator: r_rows,
                        trigger: 'blur'
                    }],
                    r_cols: [{
                        validator: r_cols,
                        trigger: 'blur'
                    }],
                    screen_location: [{
                        validator: screen_location,
                        trigger: 'blur'
                    }]
                },
                //查看的座位渲染
                seatFormat: [],
                //座位放大动画,
                seatAnimation:'transform: scale(1);',
                // 座位外边box
                selectWH: {},
                // 座位外box圆心重合（居中）
                selectMleft:'',
                selectMtop:'',
                //查看。位置是否可用
                //>>可用 //
                selectSuccess: "background-image:url('https://z3.ax1x.com/2021/04/02/ceOVvq.png');",
                //>> 不可用//
                selectError: "background-color:rgba(0,0,0,0);",


                customClass: 'customClass',
                stripWH: '',
                //查看dialog显示隐藏
                selectVisible: false,
                list: [],
                item: [],
                //添加影厅对话框
                addRoomDialogVisible: false,
                addSetNull: 'addSetNull',
                addSuccess: 'addSuccess',
                // 搜索框
                searchInput: "",
                //影厅数据
                movieDataList: Array(),
                page: {
                    nowPage: 1,
                    pageSize: 5,
                    total: Number(),
                },
                //避免动态行数渲染报错
                addScripCols: Number(),
                //避免动态列数渲染报错
                addScripRows: Number(),
                //避免动态名字渲染，因为屏幕会显示
                addScripName: '',
                //seatbox高度
                seatBoxH: '100vh',
                //屏幕位置做偏移量
                addScreenLocationLeft: Number(),
                // 计算屏幕宽度总宽度
                addScreenLocationW: Number(),
                addRoom: {
                    //添加影厅总行数
                    r_rows: Number(),
                    //添加影厅总列数
                    r_cols: Number(),
                    //添加电影的名字
                    r_name: String(),
                    //屏幕位置
                    screen_location: {
                        x: Number(),
                        y: Number()
                    },
                    //座位状态
                    seat_state: [],
                    //总座位数,
                    count_seat: "",
                },
                //添加和编辑的动态宽度设置:
                formatItemWidth: '',
                //选中的数据
                selectedList: [],
                //判断选择座位的状态 false:选择不可用座位 true：选择可用座位
                btnState: true,
                //添加座位的loading
                addLoading: false,

                //添加前的dialog展示
                addBeforeRoomDialogVisible: false,
                //是否是编辑状态编辑状态
                isEditStatus: false

            };
        },
        methods: {
            //查看按钮
            async selectRoomBtn(row) {
                console.log(row);
                let {
                    data: res
                } = await this.$axios.get(`room/${row.r_id}`)
                if (res.meta.status != 200) return this.$message.error('获取失败')
                this.addRoom = res.data

                let arr = []
                for (let j = 0; j < this.addRoom.r_rows; j++) {
                    arr[j] = []
                    for (let i = 0; i < this.addRoom.seat_state.length; i++) {
                        if (this.addRoom.seat_state[i].x == j + 1) {
                            arr[j].push(this.addRoom.seat_state[i])
                        } else {
                            continue
                        }
                    }
                }
              
                this.seatFormat = arr
                console.log(arr);
                
                
                //根据列数换算宽度
                let w = (this.addRoom.r_cols+3) * 25
                let h = (this.addRoom.r_rows+3) * 25
                console.log(w + '>>' + h);
                //this.selectWH [x][y] : 座位被撑开的box宽高
                this.selectWH = {
                    w: w,
                    h: h
                }
                //****计算座位中心点****//
                if(w<278){
                    this.selectMleft=0
                    this.selectMtop=0
                }else{
                    this.selectMleft=(w-278)/2
                    this.selectMtop=(h-278)/2
                }
                 this.seatAnimation='transform:scale(1)'
                //<<<<计算座位中心点****//
                //放大动画
                setTimeout(()=>{
                    this.seatAnimation='transform:scale(0.3)'
                },500)
                
                // console.log(object);
                this.selectVisible = true
            },
            //删除按钮
            async deleteRoom(row) {
                console.log(row);
                const loading = this.$loading({
                    lock: true,
                    text: '删除中',
                    spinner: 'el-icon-loading',
                    background: 'hsla(0,0%,100%,.9)'
                });
                let {
                    data: res
                } = await this.$axios.delete("room", {
                    data: {
                        r_id: row.r_id
                    }
                })
                setTimeout(() => {
                    loading.close();
                    this.$message.success('删除成功')
                    if (this.movieDataList.length == 1) {
                        this.page.nowPage = this.page.nowPage - 1
                    }
                    this.getRoomList()
                }, 500);
            },

            //编辑的保存按钮
            async EditRoomDialogFinish() {
                let {
                    data: res
                } = await this.$axios.post('/room/edit', this.addRoom)
                console.log(res);
                if (res.meta.status != 200) return this.$message.error('修改失败')
                this.$message.success('修改成功')
                this.addRoomDialogcancel()
                this.clearAddromFun();

                // this.isEditStatus=false
            },
            ////编辑按钮
            async editorRoomBtn(row) {
                let {
                    data: res
                } = await this.$axios.get(`/room/${row.r_id}`)
                this.addRoom = res.data
                this.addRoomDialogVisible = true


                //渲染可用和不可用状态          
                this.$nextTick(_ => {
                    this.preview()
                    let seat = this.$refs.seat
                    console.log(seat);
                    for (let i = 0; i < seat.length; i++) {
                        let seatX = seat[i].getAttribute('x');
                        let seatY = seat[i].getAttribute('y');
                        for (let j = 0; j < this.addRoom.seat_state.length; j++) {
                            if (this.addRoom.seat_state[j].x == seatX && this.addRoom.seat_state[j].y ==
                                seatY) {
                                if (this.addRoom.seat_state[j].isNull == 0) {
                                    seat[i].style.backgroundImage =
                                        'url("https://z3.ax1x.com/2021/04/02/ceLq4H.png")'
                                    // console.log(j);
                                }
                                if (this.addRoom.seat_state[j].isNull == 1) {
                                    // console.log(seat[j]);
                                    seat[j].style.backgroundImage =
                                        'url("https://z3.ax1x.com/2021/04/02/ceOVvq.png")'
                                }
                            }
                        }
                    }
                    // this.clickFormatItemWidth()


                })
                this.isEditStatus = true
            },
            selectBeforeClose(e) {
                this.$confirm('确认关闭？')
                    .then(_ => {
                        e();
                    })
                    .catch(_ => {});
            },
            //重置添加的表单
            addResetForm(formName) {
                this.$refs[formName].resetFields();
            },
            //确定添加按钮ref
            addRoomDialogFinish(formName) {
                //    console.log(this.addRoom);
                this.$refs[formName].validate(async (valid) => {
                    if (valid) {
                        let count = 0
                        for (let i = 0; i < this.addRoom.seat_state.length; i++) {
                            if (this.addRoom.seat_state[i].isNull != 0) {
                                count++
                            }
                        }
                        if (count == 0) {
                            return this.$message.error('你还没有选择可用选座位')
                        }
                        // this.addLoading = true;
                        let {
                            data: res
                        } = await this.$axios.post('room', this.addRoom)
                        console.log(this.addRoom);

                        if (res.meta.status != 200) {
                            this.addLoading = false;
                            return this.$message.error(res.meta.msg)
                        } else {
                            this.$message.success("添加成功")
                            this.addLoading = false;
                            this.addRoomDialogVisible = false
                            this.getRoomList()
                            this.clearAddromFun();
                            this.clearBeforeAddRoom()
                            this.addRoom.screen_location = {}
                            this.isEditStatus = false
                        }


                    } else {
                        return this.$message.warning('请输入完整信息');
                    }
                });
            },
            //取消添加按钮
            addRoomDialogcancel() {
                this.addRoomDialogVisible = false
                this.clearAddromFun()
                this.addRoom.seat_state = []
                this.clearBeforeAddRoom()
                this.addRoom.screen_location = {}
            },

            //清除添加影厅生成的按钮
            clearAddRoom(ref) {
                let alertMsg = this.$confirm('此操作将清除座位信息, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(val => {
                    this.addRoom.seat_state = []
                    this.addRoom.screen_location = {
                        x: '',
                        y: ''
                    }
                    this.clearBeforeAddRoom()
                    this.clearAddromFun()
                    // this.addResetForm(ref)
                }).catch(val => {})
            },
            //清空非动态数据，下次点击以防累加
            clearBeforeAddRoom() {
                this.addScreenLocationLeft = Number();
                this.addScreenLocationW = Number();
                this.addScripName = ''
                this.addScripCols = ''
                this.addScripRows = ''
            },
            //清空添加影厅数据
            clearAddromFun() {
                this.addRoom.r_rows = '';
                this.addRoom.r_cols = '';
                this.addRoom.r_name = '';
                this.addScreenLocationW = Number()
                this.addScreenLocationLeft = Number()
                this.addRoom.seat_state = [];
                this.addRoom.screen_location = {
                    x: '',
                    y: ''
                };
                this.addRoom.count_seat = '';
            },
            getClasses(item, selectedItems) {
                // console.log(selectedItems);
                const isActive = selectedItems.selectedItems.find(selectedItem => {
                    return parseInt(selectedItem.dataset.item, 10) === item.key;
                });
                return {
                    item: true,
                    active: isActive
                };
            },
            //监听子组件的数据
            selectChange(e) {
                console.log(e);
                for (let i = 0; i < this.addRoom.seat_state.length; i++) {
                    for (let j = 0; j < e.length; j++) {
                        if (e[j].getAttribute("x") == this.addRoom.seat_state[i].x && e[j].getAttribute("y") == this
                            .addRoom.seat_state[i].y) {
                            // arr1[j].value = arr2[i].value
                            // this.addRoom.seat_state[i][j]
                            // console.log(this.addRoom.seat_state[i]);
                            //判断选择可用还是不可用
                            if (this.btnState == false) {
                                this.addRoom.seat_state[i].isNull = 0
                                // console.log(this.addRoom.seat_state[i]);
                                e[j].style.backgroundImage = 'url("https://z3.ax1x.com/2021/04/02/ceLq4H.png")'
                                e[j].style.backgroundSize = '100%'
                            }
                            if (this.btnState == true) {

                                this.addRoom.seat_state[i].isNull = 1
                                // console.log(this.addRoom.seat_state[i]);
                                e[j].style.backgroundImage = 'url("https://z3.ax1x.com/2021/04/02/ceOVvq.png")'
                                e[j].style.backgroundSize = '100%'
                            }
                        }
                    }
                }
            },
            //分页器
            //每页显示几条选择触发
            handleSizeChange(val) {
                console.log(`每页 ${val} 条`);
                this.page.pageSize = val;
                this.getRoomList();
            },
            //当前页更改触发
            handleCurrentChange(val) {
                console.log(`当前页: ${val}`);
                this.page.nowPage = val;
                this.getRoomList();
            },

            addRoomDialog() {
                this.addRoomDialogVisible = true;
                this.isEditStatus = false
            },
            //搜索影厅，以影厅名称搜索
            async searchBtn() {
                if (this.searchInput.length < 1) {
                    return this.$message.warning("请输入搜索内容哦");
                }
                let {
                    data: res
                } = await this.$axios.get("/room", {
                    params: {
                        ...this.page,
                        searchInput: this.searchInput,
                    },
                });
                // console.log(res);
                this.page.total = res.total;
                this.movieDataList = res.data;
            },
            //搜索框清除
            searchBtnClear() {
                this.getRoomList();
                this.searchInput = "";
            },
            //获取影厅列表
            async getRoomList() {

                let {
                    data: res
                } = await this.$axios.get("/room", {
                    params: this.page,
                });
                console.log(this.movieDataList);
                this.page.total = res.total;
                this.movieDataList = res.data;
            },
            addRoomHandleClose(done) {
                this.$confirm("确认关闭？")
                    .then((_) => {
                        this.addRoom.seat_state = []
                        this.clearBeforeAddRoom()
                        this.clearAddromFun()
                        done();
                    })
                    .catch((_) => {});
            },
            editDragStart(e, ref) {},
            //子元素自动计算适应宽高
            clickFormatItemWidth() {
                let wh = 800 / this.addRoom.r_cols - 10

                //计算高度
                let seatBoxH = 0
                for (let i = 0; i < this.addRoom.r_rows; i++) {
                    seatBoxH += (wh + 10)
                }
                this.seatBoxH = seatBoxH + 'px'
                console.log(seatBoxH);
                //计算屏幕宽度
                for (let i = Number(this.addRoom.screen_location.x - 1); i < Number(this.addRoom.screen_location
                        .y); i++) {
                    this.addScreenLocationW += 800 / this.addRoom.r_cols
                    console.log('屏幕宽度+' + i);
                }
                //计算屏幕左侧偏移位置
                for (let i = 1; i < this.addRoom.screen_location.x; ++i) {
                    this.addScreenLocationLeft += Number(wh + 10)
                }
                let str = `width:${wh}px;height:${wh}px;display:inline-block;margin:5px 5px 0px 5px;border-radius:10px`
                this.formatItemWidth = str
                this.stripWH = wh
            },

            //添加room 点击预览按钮 //默认渲染时候是5行5列
            preview() {
                //添加辅助列数显示
                this.addScripCols = this.addRoom.r_cols
                //添加辅助行数显示
                this.addScripRows = this.addRoom.r_rows
                //影厅非动态名称

                if (this.isEditStatus == false) {
                    if (this.addRoom.seat_state.length != 0) {
                        return this.$message.error('已经生成,生成前先点击清除')
                    }
                }
                this.addScripName = this.addRoom.r_name
                this.clickFormatItemWidth()


                //保存this
                let vuethis = this
                // this.addRoom.r_rows=
                let key = 0
                let arr = [];
                if (this.isEditStatus == false) {
                    for (let i = 0; i < this.addRoom.r_rows; i++) {

                        for (let j = 0; j < this.addRoom.r_cols; j++) {
                            arr.push({
                                isNull: 0,
                                state: 0,
                                x: i + 1,
                                y: j + 1,
                                key: key,
                                uid:'',
                            })
                            key++
                        }
                    }
                    this.addRoom.seat_state = arr;
                }
                console.log(this.addRoom);


            },
        },
        created() {
            this.getRoomList();
            this.innerWidth = window.innerWidth;
        },
        mounted() {},
        computed: {

        },
    };
</script>

<style scope>
    /* 屏幕位置 */
    .addScreenLocation {
        position: absolute;
        top: -30px;
        height: 30px;
        background-color: rgb(129, 128, 128);
        border-radius: 0px 0px 20px 20px;
        text-align: center;
        color: black;
        font-size: 20px;
    }

    .customClass {
        height: 100vh;
    }

    .topSelectScript {
        position: absolute;
        display: flex;
        top: -60px;
        /* left: -10px; */
        width: 100%;
        height: 30px;
        border-radius: 30px;
        color: white;
        background-color: rgb(24, 46, 78);
    }

    .leftSelectScript {

        /* top:10px; */
        left: -40px;
        width: 30px;
        height: 100%;
        border-radius: 30px;
        color: white;
        background-color: rgb(24, 46, 78);
        position: absolute;
    }

    .el-dialog__body {
        font-size: 0;
    }

    /* 统一宽度 */
    .untifyWidht {
        margin-top: 10px;
    }
    .untifyWidhtBtn{
        width: 180px;
        margin: 10px;
    }

    .itemFont {
        color: white;
    }

    .topCard {
        margin-top: 10px;
    }

    .searchBtn {
        width: 60px;
        margin-left: 10px;
    }

    .el-dialog {
        /* height: 500vh; */
        margin-top: 0 !important;
        position: relative;
    }

    .dialog-footer {
        position: absolute;
        text-align: center;
        width: 100%;
        bottom: 0;
        left: 0;
        /* background-color: red; */
    }

    .el-icon el-icon-close {
        width: 100px;
        font-size: 40px;
    }

    .add-dialog-box {
        width: 100%;
        height: 80vh;
        background-color: antiquewhite;
    }

    .editBtnBox {
        width: 300px;
        height: 100%;
        text-align: center;
        height: 100%;
        background-color: rgba(246, 245, 245, 0.774);
    }

    .addRoomBtn {
        width: 100px;
    }

    /* 添加dialog */
    .box {
        width: 100%;
        display: flex;
        justify-content: center;

        /* align-items: center; */
    }

    .content_box {
        width: 500px;
        /* height: 500px; */
        border: 1px solid black;
        border-radius: 5%;
        display: flex;
        justify-content: flex-start;
        align-items: center;
        flex-direction: row;
        flex-wrap: wrap;
        user-select: none;
        /* overflow: hidden; */
    }

    .items {
        width: 50px;
        height: 50px;
        /* padding: 10px; */
        /* flex-grow: 1; */
        /* background-image: url("../../public/img/optional.png"); */
        background-color: red;
        background-size: 100%;
        border-radius: 10%;
        margin: 10px;
    }

    .selectBorder {
        background-color: rgb(102, 194, 74);
    }

    .el-button {
        margin-left: 0 !important;
    }

    #seatbox {
        width: 800px;
        height: 800px;
        background-color: rgb(173, 173, 173);
        position: relative;
        border-radius: 10px;
        text-align: center;
        /* display: inline-block; */
    }

    .seatbox {
        width: 800px;
        height: 800px;
        background-color: rgba(170, 157, 157, 0.171);
        position: relative;

    }

    .item {
        background-image: url("../../public/img/optional.png");
        background-size: 100%;
        color: white;
    }

    /* .item {
        display: inline-flex;
        min-width: 80px;
        height: 100px;
        margin-right: 10px;
        margin-bottom: 10px;
        background-color: #ddd;
        justify-content: center;
        align-items: center;
        text-transform: uppercase;
        letter-spacing: 3px;
        font-size: 10px;
    } */
    .selectedItems {
        background-color: red;
    }

    .active {
        background-color: rgb(0, 162, 255);
        color: #fff;
    }

    .addSuccess {
        background-color: greenyellow;
    }

    .addSetNull {
        background-color: red;
    }

    .view-preview {
        width: 100%;
        display: flex;
        justify-content: center;
        align-content: center;
    }

    .view-preview-box {
        position: relative; 
    }

    .select-screen-box {
        width: 295px;
        position: absolute;
        height: 522px;
        top: 90px;
        left: 29px;
        padding: 8px;
        box-sizing: border-box;
        background-color: rgb(235, 231, 231);
    }

    /* 手机头部(返回-----菜单) */
    .select-screen-box-header {
        width: 100%;
        height: 30px;
        /* background-color: rgba(197, 195, 195, 0); */
        border-radius: 10px;
        display: flex;
        justify-content: space-between;
        box-sizing: border-box;
        overflow: hidden;
        background-color: rgb(207, 207, 207);
    }

    /* 左侧返回按钮 */
    .select-screen-box-header-left {
        width: 30px;
        box-sizing: border-box;
        line-height: 30px;
        font-size: 20px;
        padding-left: 10px;
        height: 100%;
        /* background-color: rgb(207, 207, 207); */
    }

    /* 右侧三个点按钮 */
    .select-screen-box-header-right {
        box-sizing: border-box;
        right: 10px;
        line-height: 30px;
        font-size: 20px;
        padding-left: 5px;
        height: 100%;
        width: 30px;
        /* background-color: rgb(209, 207, 207); */
    }

    /* 座位展示区域 */
    .select-screen-box-center {
        width: 278px;
        height: 278px;
        margin-top: 5px;
        border-radius: 10px;
        text-align: center;
        overflow: auto;
        position: relative;
        background-color: rgb(214, 214, 214);
    }

    .selectSeatW {
        width: 25px;
        height: 25px;
        border-radius: 4px;
        margin: 2px 2px 0px 0px;
        display: inline-block;
        background-position: center;
        background-size: 35px;
    }
</style>