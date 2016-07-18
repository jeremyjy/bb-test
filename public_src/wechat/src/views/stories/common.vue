<template lang="html">
  <div class="">
    <search :placeholder="searchPlaceholder" @on-change="getResult" :results="results" :value.sync="value"></search>
    <tabbar></tabbar>
    <!-- main view -->
    <play-block :storylist="storyList"></play-block>
  </div>
</template>

<script>
import Search from '../../components/Search'
import playBlock from '../../components/blockWithDesc'
import tabbar from '../../components/tabbar'
export default {
  data: function () {
    return {
      results: [],
      value: '',
      category: {},
      storyList: [],
      currentItem: {},
      active: false
    }
  },
  route: {
    data (transition) {
      this.category = JSON.parse(window.localStorage.getItem('category'))
      console.log(this.category.name)
      let id = transition.to.params.category
      console.log('ididid:', id)
      let url = this.$http.options.root + '/stories?_filters={"category":"' + id + '"}'
      url = encodeURI(url)
      this.$http.get(url).then((res) => {
        this.storyList = JSON.parse(res.body)
      })
    }
  },
  computed: {},
  ready: function () {},
  attached: function () {},
  methods: {
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
  components: { playBlock, Search, tabbar }
}
</script>

<style lang="css">
</style>
