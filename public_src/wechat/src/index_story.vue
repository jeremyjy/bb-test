<template>
  <div>
    <!-- main view -->
    <scroller height="80" :lock-x="true" :bounce="true" :scrollbar-x="false">
      <div class="">
        <img src="http://img0.imgtn.bdimg.com/it/u=623778658,3586926980&fm=21&gp=0.jpg" alt="" />
        <search :placeholder="searchPlaceholder" @result-click="resultClick" @on-change="getResult" :results="results" :value.sync="value"></search>
        <flexbox wrap="wrap" :gutter="0">
          <flexbox-item class="category-item" v-for="item in categories" :span="1/3">
            <a @click="gotoList(item)">
              <img :src="item.iconFileName" alt="" />
              <div class="category-title">
                {{item.name}}
              </div>
            </a>
          </flexbox-item>
        </flexbox>
      </div>
    </scroller>
    <tabbar style="position:fixed;bottom:0">
      <!--use v-link-->
      <tabbar-item v-link="{path:'/collection'}">
        <img slot="icon" src="./assets/icon_nav_button.png">
        <span slot="label">收藏</span>
      </tabbar-item>
      <!--use http link-->
      <tabbar-item show-dot link="/history">
        <img slot="icon" src="./assets/icon_nav_msg.png">
        <span slot="label">历史</span>
      </tabbar-item>
      <!--use vue-router link-->
      <tabbar-item link="/song-list">
        <img slot="icon" src="./assets/icon_nav_article.png">
        <span slot="label">歌单</span>
      </tabbar-item>
    </tabbar>
  </div>
</template>

<script>
import Tabbar from 'vux/dist/components/tabbar'
import TabbarItem from 'vux/dist/components/tabbar-item'
import Search from './components/Search'
import Flexbox from 'vux/dist/components/flexbox'
import FlexboxItem from 'vux/dist/components/flexbox-item'
import Divider from 'vux/dist/components/Divider'
import Scroller from 'vux/dist/components/Scroller'

export default {
  data: function () {
    return {
      results: [],
      categories: [],
      value: '',
      searchPlaceholder: '输入想听的故事吧'
    }
  },
  computed: {},
  ready: function () {
    document.title = '口袋故事'
    this.$http.get(this.$http.options.root + '/story-categories').then(function (res) {
      this.$data.categories = JSON.parse(res.body)
    })
  },
  attached: function () {},
  methods: {
    gotoList (item) {
      let category = JSON.stringify({name: item.name, url: item.iconFileName, desc: item.description})
      window.localStorage.setItem('category', category)
      this.$router.go({name: 'storyList', params: {'category': item.id}})
    },
    resultClick (item) {
      window.alert('you click the result item: ' + JSON.stringify(item))
    },
    getResult (val) {
      let rs = []
      let url = this.$http.options.root + '/stories?_filters={"name":"' + val + '"}'
      url = encodeURI(url)
      this.$http.get(url).then((res) => {
        let result = JSON.parse(res.body)
        for (let i = 0; i < result.length; i++) {
          rs.push(result[i])
        }
      })
      this.results = rs
    }
  },
  components: {
    Tabbar,
    TabbarItem,
    Search,
    Flexbox,
    FlexboxItem,
    Divider,
    Scroller
  }
}
</script>
<style>
.category-item {
  width: 100px;
  height: 130px;
  border-radius: 10px;
}
.category-item img{
  width: 100px;
}
.category-title{
  text-align: center;
}
</style>
