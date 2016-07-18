<template>
  <ul class="posts-list" v-show="showEdit">
    <li>
      <flexbox class = 'flexbox'>
        <span class="item-edit-title">习惯名称</span>
        <span class="item-edit-title">启动时间</span>
        <span class="item-edit-title">停止时间</span>
        <span class="item-edit-title">音乐</span>
        <span class="item-edit-title">操作</span>
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
        <button  class='edit' @click="edit(habit)"><icon type="success"></icon></button>
      </flexbox>
    </li>
  </ul>
  <div v-show="!showEdit">
    <edit-habit :habit-plan="habitPlan" :show-edit.sync="showEdit"></edit-habit>
  </div>
</template>
<style>
    body{
        /*background-color:#ff0000;*/
    }
    .item-edit-title {
      padding-right: 3.8%;
      padding-left: 2%;
    }
    .edit{
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
  import group from 'vux/dist/components/group'
  import flexbox from 'vux/dist/components/flexbox'
  import flexboxItem from 'vux/dist/components/flexbox-item'
  import xInput from 'vux/dist/components/x-input'
  import xButton from 'vux/dist/components/x-button'
  import icon from 'vux/dist/components/icon'
  import editHabit from './createHabitPaln.vue'
  export default{
    props: ['habitPlans', 'url'],
    data () {
      return {
        showEdit: true,
        habitPlan: {}
      }
    },
    methods: {
      edit (habit) {
        this.$data.showEdit = false
        this.$data.habitPlan = habit
      }
    },
    components: {
      group,
      flexbox,
      flexboxItem,
      xInput,
      xButton,
      icon,
      editHabit
    }
  }
</script>
