<template>
  <ul class="posts-list">
    <li>
      <flexbox class = 'flexbox'>
        <span class="item-delete-title">习惯名称</span>
        <span class="item-delete-title">启动时间</span>
        <span class="item-delete-title">停止时间</span>
        <span class="item-delete-title">音乐</span>
        <span class="item-delete-title">操作</span>
      </flexbox>
    </li>
    <li v-for = "habit in habitPlans">
      <flexbox class = 'flexbox'>
        <span class='item-span'>{{habit.name}}</span>
        <span class="item-span">{{habit.fromTime}}</span>
        <span class="item-span">{{habit.endTime}}</span>
        <span class="item-span">{{habit.musicName}}</span>
      </flexbox>
      <flexbox class = 'flexbox'>
        <span class='item-span item-span-date'>循环周期</span>
        <span class="date" :class="{ 'dateColor': habit.monday}">一</span>
        <span class="date" :class="{ 'dateColor': habit.tuesday}">二</span>
        <span class="date" :class="{ 'dateColor': habit.wednesday}">三</span>
        <span class="date" :class="{ 'dateColor': habit.thursday}">四</span>
        <span class="date" :class="{ 'dateColor': habit.friday}">五</span>
        <span class="date" :class="{ 'dateColor': habit.saturday}">六</span>
        <span class="date" :class="{ 'dateColor': habit.sunday}">日</span>
        <button  class='delete' @click="deleteHabit(habit.id, habit.name)"><icon type="cancel"></icon></button>
      </flexbox>
    </li>
  </ul>
  <confirm :show.sync="showConfirm" :title="deleteTitle" confirm-text="确定" cancel-text="取消" @on-confirm="onAction(1)" @on-cancel="onAction(0)"><p style="text-align:center;">确定是否删除,如果删除后,无法找回</p></confirm>
  <alert :show.sync="alertShow" title="" button-text="确定">
    <p style="text-align:center;">{{alertContent}}</p>
  </alert>
</template>
<style>
  body{
    /*background-color:#ff0000;*/
  }
  .item-delete-title {
    padding-right: 3.8%;
    padding-left: 2%;
  }
  .delete{
    padding-left: 3%;
    padding-right: 2%;
    position: relative;
    bottom: 12px;
  }
  .date {
    margin-left: 4%;
  }
</style>
<script>
//  import VueRouter from 'vue-router'
  import group from 'vux/dist/components/group'
  import flexbox from 'vux/dist/components/flexbox'
  import flexboxItem from 'vux/dist/components/flexbox-item'
  import xInput from 'vux/dist/components/x-input'
  import xButton from 'vux/dist/components/x-button'
  import icon from 'vux/dist/components/icon'
  import confirm from 'vux/dist/components/confirm'
  import alert from 'vux/dist/components/alert'
  export default{
    props: ['habitPlans', 'url'],
    data () {
      return {
        showConfirm: false,
        alertShow: false,
        alertContent: '',
        deleteTitle: '',
        deleteId: ''
      }
    },
    methods: {
      deleteHabit (id, name) {
        this.$data.deleteTitle = '删除' + name
        this.$data.showConfirm = true
        this.$data.deleteId = id
      },
      onAction (type) {
        let self = this
        let id = self.$data.deleteId
        if (type === 1) {
          self.$http.delete(self.url + '/api/wechat/habitPlan?id=' + id).then(function (res) {
//          let body = JSON.parse(res.body)
            self.$data.alertShow = true
            self.$data.alertContent = '删除成功!'
            self.habitPlans.forEach(function (item, index) {
              if (item.id === id) {
                self.habitPlans.splice(index, 1)
              }
            })
          }, function (res) {
            self.$data.alertShow = true
            self.$data.alertContent = '删除失败!'
            // error callback
          })
        }
      }
    },
    components: {
      group,
      flexbox,
      flexboxItem,
      xInput,
      xButton,
      icon,
      confirm,
      alert
    }
  }
</script>
