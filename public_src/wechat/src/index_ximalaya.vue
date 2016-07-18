<template>
  <div>
    <!-- main view -->
    <scroller height="80" :lock-x="true" :bounce="true" :scrollbar-x="false">
      <div class="">
        <search :placeholder="searchPlaceholder" @result-click="resultClick" @on-change="getResult" :results="results" :value.sync="value"></search>
        <flexbox class="category" wrap="wrap" :gutter="0">
          <flexbox-item class="category-item" v-for="item in categories" :span="1/4">
            <a v-link="{name:'albums',params: {'tag_name': item.tag_name,'calc_dimension': 3}}">
              <img :src="item.cover_url_small" alt="" />
              <div class="category-title">
                {{item.tag_name}}
              </div>
            </a>
          </flexbox-item>
        </flexbox>
        <div class="">
          <div class="">
            <span class="recommand">推荐</span>
            <span class="more">查看更多</span>
          </div>
          <flexbox wrap="wrap" :gutter="0">
            <flexbox-item class="category-item" v-for="item in categories" :span="1/4">
              <a @click="gotoList(item)">
                <img :src="item.cover_url_small" alt="" />
                <div class="category-title">
                  {{item.tag_name}}
                </div>
              </a>
            </flexbox-item>
          </flexbox>
        </div>
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
  route: {
    data (transition) {
      document.title = '云端故事'
      this.$http.get(this.$http.options.xmly + '?t=getTagsList&category_id=6&type=0').then(function (res) {
        console.log('callback')
        this.categories = JSON.parse(res.body)
        console.log(this.categories)
      })
    }
  },
  ready: function () {

  },
  attached: function () {},
  methods: {
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
          rs.push({
            title: `${result[i].name}`,
            other: result[i].id
          })
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
@import './assets/css/common.css';
@import './assets/css/xmly.css';
</style>
