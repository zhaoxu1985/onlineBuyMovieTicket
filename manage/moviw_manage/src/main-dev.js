import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import axios from 'axios';

import DragSelect from 'vue-drag-select/src/DragSelect.vue'

//引入图标
import icon from './icon/iconfont.css';
import 'default-passive-events'
Vue.use(ElementUI)


Vue.prototype.$axios = axios;

axios.defaults.baseURL='/'

Vue.config.productionTip = false;


// 路由导航守卫
// 为路由对象，添加beforeEach 导航守卫
router.beforeEach(function(to,form,next){
	//如果用户访问的登录页,直接放行
    if(to.path==='/') return next()
    if(to.path==='/login') return next('/')
    //从sessionStorage 中获取 保存的token信息（值）
    const tokenStr = window.sessionStorage.getItem('token')
    //没有token,强制跳转到登录页面
    if(!tokenStr) return next('/')
    //如果有，就直接放行
    next()
})

new Vue({
  router,
  store,

  render: h => h(App)
}).$mount('#app')

export default {
  components: {
    'drag-select-container': DragSelect
  }
}