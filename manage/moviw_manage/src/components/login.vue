<template>
    <div class="box">
        <div class="centerBg">

            <div class="left">
                
                <img width="100%" src="img/ikon.png" alt="">
            </div>
            <div class="right">
                <div class="rightBox">
                    <div class="headerText">
                        管理员登录
                    </div>
                    <div style="text-align:start;font-size:13px">您可以直接输入您的账号密码进行登录</div>
                     <!-- 表单 -->
                <el-form style="margin-top:50px" label-position='top' :model="loginForm" status-icon :rules="rules" ref="loginForm"
                    label-width="100px" class="demo-ruleForm">

                    <el-form-item prop="uname">
                        <el-input prefix-icon="el-icon-user" type="uname" v-model="loginForm.uname" autocomplete="off"></el-input>
                    </el-form-item>
                <el-divider style="width:80%"></el-divider>
                    <el-form-item prop="upwd">
                        <el-input prefix-icon="el-icon-lock" @keyup.enter.native="submitForm('loginForm')" type="upwd" v-model="loginForm.upwd"
                            autocomplete="off"></el-input>
                    </el-form-item>
                <el-divider></el-divider>
                    <el-form-item class="btnmargin">
                        <el-button style="width:75%;" round type="danger" @click="submitForm('loginForm')">登录
                        </el-button>
                    </el-form-item>
                </el-form>
                </div>
               
            </div>
        </div>

    </div>
</template>

<script>
    export default {
        data() {
            var validateUname = (rule, value, callback) => {
                if (value === "") return callback(new Error("请输入账号!"));
                value;
                if (/\d/.test(value)) {
                    callback();
                } else {
                    callback("账号为数字");
                }
            };
            var validateUpwd = (rule, value, callback) => {
                if (value === "") callback(new Error("请输入密码!"));

                if (this.loginForm.upwd !== "") {
                    callback();
                }
            };
            return {
                loginForm: {
                    uname: "",
                    upwd: "",
                },

                rules: {
                    uname: [{
                        validator: validateUname,
                        trigger: "blur",
                    }, ],
                    upwd: [{
                        validator: validateUpwd,
                        trigger: "blur",
                    }, ],
                },
            };
        },
        methods: {
            //验证规则，并验证账号
            submitForm(formName) {
                this.$refs[formName].validate(async (valid) => {
                    if (valid) {
                        let {
                            data: res
                        } = await this.$axios.post("/login", {
                            number: this.loginForm.uname,
                            upwd: this.loginForm.upwd,
                        });
                        if (res.meta.status != 200) return this.$message.error("登陆失败!");
                        console.log(res.data);
                        window.sessionStorage.setItem("token", res.data.number);
                        this.$router.push("/home");
                    } else {
                        return false;
                    }
                });
            },
            resetForm(formName) {
                this.$refs[formName].resetFields();
            },
            enterclick() {
                console.log("触发");
            },
        },
    };
</script>

<style scoped>
    .box {
        width: 100vw;
        height: 100vh;
        background-color: #f8fafc;
        display: flex;
        justify-content: center;
        align-items: center;
        background-image: url("../../public/img/loginBg.jpg");
        background-size: cover;
        background-repeat: no-repeat;
        position: relative;
    }

    .el-icon-user-solid {
        line-height: 110px;
    }

    .el-form-item {
        display: block;
    }

    .centerBg {
        width: 1400px;
        height: 800px;
        flex-shrink: 0;
        background-image: url('../../public/img/centerBg.png');
        background-size: 90%;
        /* background-size: cover; */
        background-repeat: no-repeat;
        background-position: center;
        display: flex;
        box-sizing: border-box;
        padding: 70px 200px;
    }

    .header {
        width: 100%;
        height: 50px;
        flex: 1;
        text-align: start;
        font-size: 30px;

        /* background-color: rgb(12, 93, 69); */
    }

    .left {
        width: 50%;
        flex-shrink: 0;
        /* background-color: red; */
        text-align: center;
    }
    .left>img{
        width: 90%;
        margin-left: 10px;
        border-radius: 20px;
    }
    .right {
        width: 50%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .el-input{
        width: 80%;
    }
    .rightBox{
        width: 80%;
        height: 70%;
        text-align: center;
    }
    .headerText{
        text-align: start;
        width: 100%;
        font-size: 32px;
        color: rgb(70, 70, 70);
    }
    .rightBox > span{
        text-align: start;
        font-size:13px;
        color: #313131;
    }
    .logo{
        height: 100px;
        width: 100px;
        border-radius: 50%;
        text-align: center;
        background-color: #F9CAC2;
    }
</style>