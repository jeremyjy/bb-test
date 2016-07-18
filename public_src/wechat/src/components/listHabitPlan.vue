<template>
  <ul class="posts-list">
    <li>
      <flexbox class = 'flexbox'>
        <span class="item-title">习惯名称</span>
        <span class="item-title">启动时间</span>
        <span class="item-title">停止时间</span>
        <span class="item-title">音乐</span>
        <!--<span class="item-title">操作</span>-->
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
      </flexbox>
    </li>
  </ul>
</template>
<style>
  .item-title{
    padding-right: 3%;
    padding-left: 4%;
  }
</style>
<script>
  import group from 'vux/dist/components/group'
  import flexbox from 'vux/dist/components/flexbox'
  import flexboxItem from 'vux/dist/components/flexbox-item'
  import xInput from 'vux/dist/components/x-input'
  import xButton from 'vux/dist/components/x-button'
  export default{
    props: ['habitPlans', 'url'],
    components: {
      group,
      flexbox,
      flexboxItem,
      xInput,
      xButton
    }
  }
</script>
