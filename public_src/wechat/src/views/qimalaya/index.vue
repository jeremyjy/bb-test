<template lang="html">
  <div class="">
    <scroller height="80" :lock-x="true" :bounce="true" :scrollbar-x="false">
      <div class="">
        <search :placeholder="searchPlaceholder" @result-click="resultClick" @on-change="getResult" :results="results" :value.sync="value"></search>
        <flexbox class="category" wrap="wrap" :gutter="0">
          <flexbox-item class="category-item" v-for="item in categories" :span="1/3">
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
            <flexbox-item class="category-item" v-for="item in categories" :span="1/3">
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
  </div>
</template>

<script>
  import Search from 'vux/dist/components/Search'
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
      document.title = '云端故事'
      this.$http.get(this.$http.options.xmly + '?t=getTagsList&category_id=6&type=0').then(function (res) {
        this.$data.categories = JSON.parse(res.body)
      })
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
      Search,
      Flexbox,
      FlexboxItem,
      Divider,
      Scroller
    }
  }
</script>

<style lang="css">
@import '../../assets/css/common.css';
@import '../../assets/css/xmly.css';
</style>
