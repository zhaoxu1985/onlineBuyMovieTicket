<template>
  <div class="swiper-container">
        <swiper ref="mySwiper" :options="swiperOptions">
            <swiper-slide style="touch-action:none" v-for="(item,i) in data" :key="item.movie_id">
                    <div class="imgDiv" :style="'background-image:url('+item.main_pic+')'"></div>
            </swiper-slide>
             <div class="swiper-pagination"  slot="pagination"></div>
        </swiper>
        <div class="swiper-button-prev" slot="button-prev"></div>
        <div class="swiper-button-next" slot="button-next"></div>
  </div>
</template>

<script>
// 引入插件
import { swiper, swiperSlide } from "vue-awesome-swiper";
import "swiper/dist/css/swiper.css";

let vm = null;
export default {
    name:'HomeSwiper',
    props:{ 
        data:{
            type:Array,
            required:true,
        }
    },
     components: {
        swiper,
        swiperSlide
     },
    data() {
        return {
            swiperOptions:{
            
                width:1200,
                notNextTick: true,
                centeredSlides : true,   //设定为true时，active slide会居中，而不是默认状态下的居左。
                observer:true,
                // loop:true,
                // autoplay:3000,
                initialSlide:0, // 一开始就放到所有中间的位置
                touchRatio:0.8,
                effect:'',
                slidesPerView : 7,  //显示几个元素

                paginationClickable: true, //分页器可点击吗
                slideToClickedSlide:true, //点击居中
                prevButton: '.swiper-button-prev',
                nextButton: '.swiper-button-next',
                onTransitionEnd: function(swiper){
                    vm.$emit("index-data",vm.data[swiper.activeIndex].movie_id)//切换结束时，告诉我现在是第几个slide
                },
                
            },
            
        }
    },
    methods:{
       
    },
    beforeUpdate(){
        vm.$emit("index-data",this.data[0].movie_id)
    },
    created() {
        vm=this
    },
}
</script>

<style>
    .swiper-container{
        height: 220px;
        padding-top:7px;
    }
    .box{
       flex-shrink: 0;
        height: 100%;
        width: 100%;
        box-sizing: border-box;
    }
    .swiper-slide-active{
        transition: 0.3s all;
        transform: scale(1.2);
    }
    .imgDiv{
        flex-shrink: 0;
        width:100%;
        height: 200px;
        max-width: 128px;
        background-size: 128px 200px;
        background-repeat: no-repeat;
        display: inline-block;
        background-position: center;
    }
    .swiper-container{
    --swiper-theme-color: #ff6600;
    --swiper-pagination-color: #00ff33;/* 两种都可以 */
  }

</style>