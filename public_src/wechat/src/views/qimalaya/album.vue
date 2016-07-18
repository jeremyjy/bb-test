<template lang="html">
  <div id="container">
      <ul class="bbcloud-list3">
        <li class="bbcloud-list3-item0">
            <img :src="album.cover_url_middle" class="bbcloud-list3-item-col1">
            <div class="bbcloud-list3-item-col2">
                <table>
                    <tr>
                        <td><div class="bbcloud-item-row1">{{album.album_title}}</div></td>
                    </tr>
                    <tr>
                        <td class="bbcloud-item-row2">主播：一千零一夜电台</td>
                    </tr>
                    <tr>
                        <td class="bbcloud-item-row3">播放：<b>2552.3</b>万次</td>
                    </tr>
                    <tr>
                        <td class="bbcloud-item-row4">状态：<b>2016-060-17</b></td>
                    </tr>
                </table>
            </div>
        </li>
      </ul>

      <div class="bbcloud-list3-nav"></div>
      <ul class="bbcloud-list3">
          <li class="bbcloud-list3-item0 bbcloud-list3-item1" v-for="item in album.tracks">
              <div class="bbcloud-list3-top" @click="toggleItem(this,item)">
                  <img :src="item.cover_url_small" class="bbcloud-list-col1">
                  <div class="bbcloud-list3-item-col2">
                      <table>
                          <tr>
                              <td><div class="bbcloud-table-col1">{{item.track_title}}</div></td>
                              <td class="bbcloud-table-col2"><b class="bbcloud-date">2015-07-01</b></td>
                          </tr>
                          <tr>
                              <td>播放：<b class="bbcloud-playTimes">2552.3</b>万</td>
                              <td class="bbcloud-table-col2">时长：<b>01：54</b></td>
                          </tr>
                      </table>
                  </div>
                  <img src="../../assets/more_hd.png" alt="" class="bbcloud-list-col3">
              </div>

              <div class="bbcloud-list3-bottom" v-show="currentItem === item && active">
                  <div class="bbcloud-option-col">
                      <img src="../../assets/logo.png" alt="" class="bbcloud-option-col1-icon">
                      收藏
                  </div>
                  <div class="bbcloud-option-col">
                      <img src="../../assets/logo.png" alt="" class="bbcloud-option-col1-icon">
                      试听
                  </div>
                  <div class="bbcloud-option-col">
                      <img src="../../assets/logo.png" alt="" class="bbcloud-option-col1-icon">
                      点播
                  </div>
                  <div class="bbcloud-option-col">
                      <img src="../../assets/logo.png" alt="" class="bbcloud-option-col1-icon">
                      推送
                  </div>
              </div>
          </li>
          <li v-show="!isLoading" class="getmore" @click="getmore">{{nextPageText}}</li>
          <li v-show="isLoading" class="getmore"><spinner type="lines" slot="value"></spinner></li>
      </ul>
  </div>
</template>

<script>
import Spinner from 'vux/dist/components/Spinner'
export default {
  data: function () {
    return {
      album: {},
      currentItem: {},
      active: false,
      isLoading: false,
      albumId: 0,
      page: 1,
      nextPageText: '',
      tagName: '',
      calcDimension: 3,
      count: 5
    }
  },
  route: {
    data (transition) {
      this.albumId = transition.to.params.id
      console.log(transition.from.name)
      if (transition.from.name === 'albums' || transition.from.name === undefined) {
        let url = encodeURI(this.url)
        this.$http.get(url).then((res) => {
          console.log('read once?')
          this.album = JSON.parse(res.body)
          this.nextPageText = '加载下一页'
        })
      }
    }
  },
  computed: {
    url: function () {
      return this.$http.options.xmly + `?t=getAlbumsBrowse&count=${this.count}&album_id=${this.albumId}`
    }
  },
  ready: function () {},
  attached: function () {},
  methods: {
    toggleItem (target, item) {
      if (this.currentItem === item) {
        this.active = !this.active
      } else {
        this.active = true
        this.currentItem = item
      }
    },
    getmore: function () {
      if (!this.isLoading) {
        this.isLoading = true
        let url = this.url + `&page=${++this.page}`
        console.log('url is:', url)
        url = encodeURI(url)
        this.$http.get(url).then((res) => {
          this.album.tracks = this.album.tracks.concat(JSON.parse(res.body).tracks)
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
