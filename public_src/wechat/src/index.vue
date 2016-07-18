<template>
  <div>
    <!-- main view -->
    <router-view
      class="view"
      keep-alive
      transition
      style="margin-bottom:50px"
      transition-mode="out-in">
    </router-view>
  </div>
</template>

<script>
import Tabbar from 'vux/dist/components/tabbar'
import TabbarItem from 'vux/dist/components/tabbar-item'
// import $ from 'webpack-zepto'
export default {
  ready () {
    // console.log('height is:::', $(document).height())
    // window.alert(window.localStorage.getItem('token'))
  },
  components: {
    Tabbar,
    TabbarItem
  }
}
</script>
<style>
@import '~vux/dist/vux.css';
@import './assets/css/common.css'
</style>
