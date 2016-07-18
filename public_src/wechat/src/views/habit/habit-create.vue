<template>
  <create-habit :habit-plan="habitPlan" :url="url"></create-habit>
</template>
<style>

</style>
<script>
//  import VueRouter from 'vue-router'
  import createHabit from '../../components/createHabitPaln.vue'
  import config from './config'
  export default{
    ready () {
    },
    data () {
      return {
        habitPlan: {
          name: '',
          fromTime: '',
          endTime: '',
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false,
          musicName: ''
        },
        url: config.url
      }
    },
    methods: {
    },
    components: {
      createHabit
    }
  }
</script>
