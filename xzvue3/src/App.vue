<template>
  <div id="app">
      <button @click="addA">增加</button>
      <p> {{a}}</p>
      <p>{{movie}}</p>
      <p><button @click="updateArr">更改数组</button>{{arr}}</p>

      <input v-my-focus type="text">
  </div>
</template>
<script>
import {defineComponent,ref,toRef,toRefs} from 'vue'
import { mapActions , mapMutations , mapState} from 'vuex'
export default defineComponent({
   el:'app',
    directives:{
      "my-focus":{
        mounted(el) {
            el.focus()
        }
      }
    },
   setup(props) {
      
      let data = ref({
        a:1,
        arr:[1,2,3,4,5,6]
      })
      let {a,arr} = toRefs(data.value)
      // console.log(a);
      //更改数组索引的值
      const methods ={


        updateArr(){
          arr.value[0]='已更改'
        },
        addA(){
          a.value++;
        }


      }


      return {
        ...toRefs(data.value),
        ...methods,
      }
   },

   computed:{
     movie(){
       return `${this.a}依旧可以`
     }
   }
})
</script>

<style lang="scss">

</style>
