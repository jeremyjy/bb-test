<template>
  <edit-habit :habit-plans="habitPlans" :url="url"></edit-habit>
</template>
<style>
  body{
    background-color:#ECECEC;
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
  import config from './config'
  import group from 'vux/dist/components/group'
  import flexbox from 'vux/dist/components/flexbox'
  import flexboxItem from 'vux/dist/components/flexbox-item'
  import xInput from 'vux/dist/components/x-input'
  import xButton from 'vux/dist/components/x-button'
  import editHabit from '../../components/editHabitPlan.vue'
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
        url: config.url
      }
    },
    methods: {
    },
    components: {
      group,
      flexbox,
      flexboxItem,
      xInput,
      xButton,
      editHabit
    }
  }
</script>
