import Vue from 'vue'
import Router from 'vue-router'



const login = () => import( /* webpackChunkName: "login" */ './components/login.vue')

const home = () => import( /* webpackChunkName: "home" */ './components/home.vue')
const movieinfo = () => import( /* webpackChunkName: "home" */ './components/movieInfo/movieinfo.vue')

const leave = () => import( /* webpackChunkName: "home" */ './components/movieInfo/leave.vue')
const room = () => import( /* webpackChunkName: "room" */ './components/room.vue')

//引入添加影片
const addinfo = () => import( /* webpackChunkName: "room" */ './components/movieInfo/addinfo.vue')
//引入添加电影人员
const addplay = () => import( /* webpackChunkName: "detail" */ './components/movieInfo/addplay.vue')
const moviedetail = () => import( /* webpackChunkName: "detail" */ './components/movieInfo/moviedetail.vue')

//引入排片组件
const schedule = () => import( /* webpackChunkName: "schedule" */ './components/movieInfo/schedule.vue')

// moviedetail

Vue.use(Router)

export default new Router({
  routes: [{
      path: '/',
      name: 'login',
      component: login,
    },
    {
      path: '/home',
      name: 'home',
      component: home,
      redirect:'/now',
      children: [{
        path: '/now',
        name: 'now',
        component: movieinfo
        },
        {
          path: '/leave',
          name: 'leave',
          component: leave,
        },
        {
          path: '/room',
          name: 'room',
          component: room,
        },
        {
          path:'/addinfo',
          name:'addinfo',
          component:addinfo
        },
        {
          path:'/addplay',
          name:'addplay',
          component:addplay
        },{
          path:'/moviedetail',
          name:'moviedetail',
          component:moviedetail
        },{
          path:'/schedule',
          name:'schedule',
          component:schedule
        }
      ]
    }
    // {

    // path: '/login',
    // name: 'about',
    // // route level code-splitting
    // // this generates a separate chunk (about.[hash].js) for this route
    // // which is lazy-loaded when the route is visited.
    // // which is lhomeazy-loaded when the route is visited.
    // component:
    // }
  ]
})