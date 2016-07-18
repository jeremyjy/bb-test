<template lang="html">
  <ul class="bbcloud-list3">
    <li class="bbcloud-list3-item" v-link="{name:'album',params:{id: item.id}}" v-for="item in albums">
        <img class="bbcloud-list3-item-col1" :src="item.cover_url_middle"/>
        <table class="bbcloud-list3-item-col2">
            <tr>
                <td><div class="stroy-item-row1">{{item.album_title}}</div></td>
            </tr>
            <tr>
                <td><div class="stroy-item-row2">{{item.album_intro}}</div></td>
            </tr>
        </table>
        <img  class="bbcloud-list3-item-col3" src="../../assets/more_hd.png">
    </li>
    <li v-show="!isLoading" class="getmore" @click="getmore">{{nextPageText}}</li>
    <li v-show="isLoading" class="getmore"><spinner type="lines" slot="value"></spinner></li>
</ul>

</template>

<script>
import Spinner from 'vux/dist/components/Spinner'
export default {
  data: function () {
    return {
      albums: [],
      isLoading: false,
      page: 1,
      nextPageText: '',
      tagName: '',
      calcDimension: 3,
      count: 5
    }
  },
  route: {
    data (transition) {
      this.tagName = transition.to.params.tag_name
      this.calcDimension = transition.to.params.calc_dimension
      console.log('transition:', transition)
      if (transition.from.name === 'qimalaya' || transition.from.name === undefined) {
        let url = encodeURI(this.url)
        this.$http.get(url).then((res) => {
          this.albums = JSON.parse(res.body).albums
          this.nextPageText = '加载下一页'
        })
      }
    }
  },
  computed: {
    url: function () {
      return this.$http.options.xmly + `?t=getV2AlbumsList&category_id=6&count=${this.count}&calc_dimension=${this.calcDimension}&tag_name=${this.tagName}`
    }
  },
  ready: function () {},
  attached: function () {},
  methods: {
    getmore: function () {
      if (!this.isLoading) {
        this.isLoading = true
        let url = this.url + `&page=${++this.page}`
        console.log('url is:', url)
        url = encodeURI(url)
        this.$http.get(url).then((res) => {
          this.albums = this.albums.concat(JSON.parse(res.body).albums)
          this.isLoading = false
        })
      }
    }
  },
  components: {
    Spinner
  }
}
</script>

<style lang="css">
@import '../../assets/css/common.css';
@import '../../assets/css/xmly.css';
</style>
