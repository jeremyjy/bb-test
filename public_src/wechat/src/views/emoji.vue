<template>
    <div id='emoji' class="weui_panel_bd">
      <div>
        <a class="weui_media_box" v-for = "emoji in emojis" href='javascript:void(0)' @click = 'getVoice(emoji.name)'>
          <div>
            <div>
              <img :src = "emoji.iconFileUrl"/>
              <span id='emojiName'>{{emoji.name}}</span>
            </div>
            <div id="voice" v-if = "showVoice === emoji.name">
              <video :src = "emoji.voiceFileUrl" controls="controls">
              </video>
              <button @click="dibble(emoji)" class="primary">点播</button>
              <!--<icon type="download"></icon>-->
            </div>
          </div>
        </a>
      </div>
    </div>
</template>
<style>
    body{
    }
  #voice{
    background: dimgray;
  }
  video{
    /*height: 100px;*/
  }
  #emojiName{
    /*padding: 25%;*/
    text-align:center;
  }
</style>
<script>
import vuxAlert from 'vux/dist/components/alert'
import vuxGroup from 'vux/dist/components/group'
import vuxSwitch from 'vux/dist/components/switch'
export default {
  ready () {
    this.$http.get(this.$data.url + '/api/wechat/emoji').then(function (res) {
      // success callback
      this.$data.emojis = JSON.parse(res.body)
    }, function (res) {
      // error callback
    })
  },
  components: {
    vuxAlert,
    vuxGroup,
    vuxSwitch
  },
  data () {
    return {
      emojis: [],
      showVoice: '',
      url: '',
      show: true
    }
  },
  methods: {
    getVoice (name) {
      if (this.$data.showVoice === name) {
        this.$data.showVoice = false
      } else {
        this.$data.showVoice = name
      }
    },
    dibble (emoji) {
      this.$http.post(this.$data.url + '/api/wechat/emoji/dibble', emoji).then(function (res) {
        console.log(res)
        let body = JSON.parse(res.body)
        if (body.code === 200) {
          window.alert('点播成功')
        } else {
          window.alert('点播失败: ' + body.msg)
        }
      })
    }
  }
}
</script>
