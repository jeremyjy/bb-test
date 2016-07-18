<template lang="html">
  <flexbox class="vux-1px-tb" :gutter="0">
    <flexbox-item @click="currentTab=item" v-for="(index, item) in tabbarItems" :class="{'vux-1px-l':(index===0),'current-tab':(currentTab==item)}" class="vux-1px-r tabbar-item"><div>{{item}}</div></flexbox-item>
  </flexbox>
</template>

<script>
import Flexbox from 'vux/dist/components/flexbox'
import FlexboxItem from 'vux/dist/components/flexbox-item'
export default {
  data: function () {
    return {
      tabbarItems: ['性格社交', '生活习惯', '心理发展', '学习认知'],
      currentTab: '性格社交'
    }
  },
  computed: {
  },
  ready: function () {},
  attached: function () {},
  methods: {},
  components: {Flexbox, FlexboxItem}
}
</script>

<style lang="css">
.vux-1px-tb {
  margin: 10px auto;
  width: 90%;
  border-top: #ab6 1px solid;
  border-bottom: #ab6 1px solid;
  background-image: none;
}
.current-tab{
  background-color: #ab6;
  color: #fff;
}
.tabbar-item{
  height:30px;
  font-size: 14px;
  text-align:center;
  line-height: 30px;
}
.vux-1px-r {
  border-right: 1px solid #ab6;
}
.vux-1px-l {
  border-left: 1px solid #ab6;
}
</style>
