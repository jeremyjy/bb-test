<template>
  <list-habit :habit-plans="habitPlans" :url="url" v-if="pages === 'list'"></list-habit>
  <!--<edit-habit :habit-plans="habitPlans" :url="url" v-if="pages === 'edit'"></edit-habit>-->
  <!--<delete-habit :habit-plans="habitPlans" :url="url" v-if="pages === 'delete'"></delete-habit>-->
  <div style="position:absolute;
      width:50%;height:66%;
      right:24%;bottom:3%;" v-show="habitPlans.length === 0">
    <span>暂无习惯,创建一个试试!</span>
  </div>
  <div class="tabbar" v-if="pages === 'list'">
    <flexbox>
      <flexbox-item>
        <x-button type="default" @click="edit" :disabled="habitPlans.length === 0">修改</x-button>
      </flexbox-item>
      <flexbox-item>
        <x-button type="primary" @click="create">增加</x-button>
      </flexbox-item>
      <flexbox-item>
        <x-button type="warn" @click="delete" :disabled="habitPlans.length === 0">删除</x-button>
      </flexbox-item>
    </flexbox>
  </div>
</template>
<style>
    * {
      margin: 0;
      padding: 0;
    }
    body{
      background-color:#ECECEC;
      line-height: 1.6;
      font-family: Helvetica Neue,Helvetica,Arial,sans-serif;
    }
    .posts-list{
      background-color:#ffffff;
    }
    .vux-flexbox .vux-flexbox-item{
      padding-right: 20px;
      text-align: right;
    }
    .vux-flex-row {
      margin-top: 1%;
      margin-bottom: 1%;
    }
    .item-title{
      /*padding-right: 20px;*/
      padding-left: 5%;
      /*width: 12%;*/
    }
    .item-span{
      width: 35%;
      margin-left: 2%;
    }
    .item-span-date{
      width: 20%;
    }
    .item-span-number{
      /*padding-bottom: 5px;*/
    }
    .date{
      margin-left: 3%;
      border: 1px solid #C9C9C9;
      border-radius:5px;
      text-align: center;
      width: 6%;
    }
    .posts-list li{
      border-bottom: 1px solid #d5dbdb;
      margin-top: -7%;
    }
    .tabbar{
      /*text-align: center;*/
      position:absolute;
      width:80%;height:15%;
      right:8%;bottom:3%;
    }
    .dateColor{
      background: #18AFFD;
    }
</style>
<script>
  import VueRouter from 'vue-router'
  import config from './config'
  import group from 'vux/dist/components/group'
  import flexbox from 'vux/dist/components/flexbox'
  import flexboxItem from 'vux/dist/components/flexbox-item'
  import xInput from 'vux/dist/components/x-input'
  import xButton from 'vux/dist/components/x-button'
//  import editHabit from '../../components/editHabitPlan.vue'
  import listHabit from '../../components/listHabitPlan.vue'
//  import deleteHabit from '../../components/deleteHabitPlan.vue'
  export default{
    ready () {
      this.$http.get(this.$data.url + '/api/wechat/habitPlan').then(function (res) {
        // success callback
        let body = JSON.parse(res.body)
        if (Array.isArray(body)) {
          this.$data.habitPlans = JSON.parse(res.body)
        }
      }, function (res) {
        // error callback
      })
    },
    data () {
      return {
        habitPlans: [],
        url: config.url,
        pages: 'list'
      }
    },
    methods: {
      edit () {
//        this.$data.pages = 'edit'
//        console.log(config)
        let router = new VueRouter()
        router.go('/habit-edit')
      },
      delete () {
//        this.$data.pages = 'delete'
//        console.log(config)
        let router = new VueRouter()
        router.go('/habit-delete')
      },
      create () {
        let router = new VueRouter()
        router.go('/habit-create')
      }
    },
    components: {
      group,
      flexbox,
      flexboxItem,
      xInput,
      xButton,
//      editHabit,
      listHabit
//      deleteHabit
    }
  }
</script>
