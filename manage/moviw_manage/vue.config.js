


module.exports = {
  chainWebpack: config => {
    //production：发布模式
    config.when(process.env.NODE_ENV === 'production', config => {
        config.entry('app').clear().add('./src/main-pro.js') //配置打包入口文件
        //使用externals设置排除项，并在index.html中引入外部CDN资源
        config.set('externals', {
          vue: 'Vue',
          'vue-router': 'VueRouter',
          axios: 'axios',
          swiper: 'Swiper',
          element:'ElementUI',
          vuex:'Vuex'
        })
      })
      //development：开发模式
    config.when(process.env.NODE_ENV === 'development', config => {
      config.entry('app').clear().add('./src/main-pro.js') //配置打包入口文件
      //使用externals设置排除项，并在index.html中引入外部CDN资源
      config.set('externals', {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        axios: 'axios',
        swiper: 'Swiper',
        element:'ElementUi',
        vuex:'Vuex'
      })
    })
  },

	devServer:{
          disableHostCheck:true,
          proxy:{
            '/':{
              target:'http://127.0.0.1:9090/v1/',
              changeOrigin:true,
              ws:true
            }
            
          },
  },
 
}