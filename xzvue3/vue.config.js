module.exports={
  // //配置彻底懒加载
  // chainWebpack:config=>{
  //   config.plugins.delete("prefetch")
  //   //删除index.html开头的带有prefetch属性的link，不要异步下载暂时不需要的页面组件文件
  // },
  //配置发送请求的代理服务器程序
  devServer: {
    proxy: {
      '/': {
        target: `http://xzserver.applinzi.com`,
        changeOrigin: true
      }
    }
  }
}
