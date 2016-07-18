<template lang="html">
  <div class="">
    <div class="story-top">
      <div class="story">
        <div class="story-title">
          {{story.name}}
        </div>
        <div class="story-props">
          <span>{{story.duration | duration}}</span>
          <span>{{story.category.name}}</span>
          <span>{{story.fileSize | fileSize}}</span>
        </div>
      </div>
      <img src="../../assets/icon_nav_button.png" alt="" style="margin-left:30px;margin-top:20px;"/>
    </div>
    <div class="b_add_btn">
      <div class="image"><img src="../../assets/radio_record.png" style="width:60px;height:60px;display:block;"/></div>
      <div @click="popup(0)" class="">
        <div class="text" v-show="!showAudioBlock0">
            <p class="title">录引子</p>
            <p class="tips">在故事播放前面给宝宝说上一段话吧</p>
        </div>
      </div>
      <div class="audio-block" v-show="showAudioBlock0">
        <img class="voice" @click="playVoice(1)" src="../../assets/audio_btn.png" alt="" />
        <i class="rerecord" @click="popup(1)"></i>
        <i class="delete" @click="deleteRecord(1)"></i>
      </div>
    </div>
    <div class="before_re audiod"  data-index="0"><span class="re-text">引子：</span><img class="audio_icon" src="../../assets/audio_btn.png"/><span class="playtime" data-index="0"></span><img class="del" src="../../assets/del_record.png" data-index="0"/><img class="redo" src="../../assets/re_record.png" data-index="0"/></div>
    <div class="mid-line" style="height:55px;width:100%;display:block;border-bottom:1px solid #d3d5dc;overflow:hidden;">
    </div>
    <div class="a_add_btn">
      <div class="" @click="popup(2)">
        <div class="image"><img src="../../assets/radio_record.png" style="width:60px;height:60px;"/></div>
        <div class="text" v-show="!showAudioBlock1">
            <p class="title">录问题</p>
            <p class="tips">在故事播放后给宝宝提问吧</p>
        </div>
      </div>
      <div class="audio-block" v-show="showAudioBlock1">
        <img class="voice" @click="playVoice(3)" src="../../assets/audio_btn.png" alt="" />
        <i class="rerecord" @click="popup(3)"></i>
        <i class="delete" @click="deleteRecord(3)"></i>
      </div>
    </div>
    <div class="push_btn fix_bottom">
      <div class="push_story_btn bdr" @click="pushStoryConfirm(0)">
        <div><img src="../../assets/icon_nav_button.png" alt="" /></div>
        <p>试听</p>
      </div>
      <div class="push_story_btn" @click="pushStoryConfirm(1)">
        <div><img src="../../assets/icon_nav_button.png" alt="" /></div>
        <p>推送</p>
      </div>
    <dialog :show.sync="dialogShow" class="dialog">
      <span class="dialog-close" @click="dialogShow=false">X</span>
      <p class="dialog-title">{{popupTitle}}</p>
      <div class="dialog-content">
        <div v-show="recordType===0 || recordType===1" class="">
          <p>
            在播放故事之前录一段话发送给宝宝吧
          </p>
          <p>
            例如：宝贝，要乖乖睡觉哦。
          </p>
        </div>
        <div v-show="recordType===2 || recordType===3" class="">
          <p>
            播放完故事之后，你可以问宝宝些问题
          </p>
          <p>
            例如：宝贝，接下来是不是要亲我一下？
          </p>
        </div>
      </div>
      <div class="img-box">
        <img v-show="!isRecording" src="../../assets/record.png" alt="" />
        <img v-show="isRecording" src="../../assets/record.gif" alt="" />
      </div>
      <div class="startRecord">
        <button type="button" class="btn btn-default" name="button" @click="record()">{{isRecording?'点击结束录音':'点击开始录音'}}</button>
      </div>
    </dialog>
    <confirm confirm-text="确定" cancel-text="取消" :show.sync="showConfirm" :title="confirmTitle" @on-cancel="onCancel" @on-confirm="onConfirm">
      <p style="text-align:center;">{{confirmContent}}</p>
    </confirm>
  </div>
</template>

<script>
import wx from 'weixin-js-sdk'
import dialog from 'vux/dist/components/dialog'
import Confirm from 'vux/dist/components/confirm'
export default {
  data: function () {
    return {
      story: {category: {}},
      id: '',
      voices: [{localId: '', serverId: ''}, {localId: '', serverId: ''}, {localId: '', serverId: ''}, {localId: '', serverId: ''}],
      isRecording: false,
      dialogShow: false,
      isPlaying: false,
      isPlayingStory: false,
      type: 0,
      showConfirm: false,
      confirmTitle: '',
      confirmContent: '',
      popupTitle: '录引子',
      recordType: 0 // 0:录引子 1:重录引子 2:录问题 3:重录问题
    }
  },
  route: {
    data (transition) {
      this.id = transition.to.params.id
      this.$http.get(this.$http.options.root + `/stories/${this.id}`).then(function (res) {
        this.story = JSON.parse(res.body)
        console.log('this.story:', this.story)
      })
    }
  },
  computed: {
    showAudioBlock0 () {
      return (this.voices[0].localId.length > 0 | this.voices[1].localId.length > 0)
    },
    showAudioBlock1 () {
      return (this.voices[2].localId.length > 0 | this.voices[3].localId.length > 0)
    }
  },
  ready: function () {
    this.$http.get(this.$http.options.root + '/auth/wx/jsapi?url=' + window.location.href.replace('localhost:8080', 'czcioutest.ittun.com')).then(function (res) {
      let config = JSON.parse(res.body)
      wx.config(config)
      wx.ready(function () {
        // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
      })
      wx.error(function (res) {
        // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
        console.log('wx jsapi err:')
        console.log(res)
      })
    })
  },
  attached: function () {},
  methods: {
    popup (type) {
      this.recordType = type
      this.dialogShow = true
      if (this.recordType === 1 || this.recordType === 0) {
        this.popupTitle = '录引子'
      } else {
        this.popupTitle = '录问题'
      }
    },
    record () {
      if (this.isRecording) {
        this.stopRecord()
      } else {
        this.startRecord()
      }
    },
    startRecord () {
      let _this = this
      console.log('start record 0')
      wx.startRecord({
        success: function () {
          console.log('start record 1')
          _this.isRecording = true
        },
        fail: function (res) {
          wx.stopRecord({
            success: function (res) {
              _this.isRecording = false
            }
          })
        }
      })
    },
    stopRecord () {
      this.isRecording = false
      this.dialogShow = false
      let _this = this
      wx.stopRecord({
        success: function (res) {
          _this.voices[_this.recordType].localId = res.localId
        },
        fail: function (res) {
          console.log(res)
        }
      })
    },
    uploadVoice () {
      let _this = this
      return new Promise(function (resolve, reject) {
        // 上传音频
        if (_this.voices[1].localId) {
          _this.wechatVoiceUpload(1, (id) => { resolve(id) })
        } else if (_this.voices[0].localId) {
          _this.wechatVoiceUpload(0, (id) => { resolve(id) })
        } else {
          resolve()
        }
      }).then(function (yinzi) {
        let serverIds = {'yinzi': yinzi, 'question': ''}
        return new Promise(function (resolve, reject) {
          if (_this.voices[3].localId) {
            _this.wechatVoiceUpload(3, (id) => {
              serverIds.question = id
              resolve(serverIds)
            })
          } else if (_this.voices[2].localId) {
            _this.wechatVoiceUpload(2, (id) => {
              serverIds.question = id
              resolve(serverIds)
            })
          } else {
            resolve(serverIds)
          }
        })
      })
    },
    wechatVoiceUpload (i, cb) {
      let _this = this
      console.log(`this.voices[${i}].localId:${this.voices[i].localId}`)
      wx.uploadVoice({
        localId: this.voices[i].localId,
        success: function (res) {
          _this.voices[i].serverId = res.serverId
          console.log(`_this.voices[${i}].serverId`)
          console.log(_this.voices[i].serverId)
          console.log(res)
          cb && cb(res.serverId)
        },
        fail: function (res) {
        }
      })
    },
    deleteRecord (type) {
      if (this.voices[type] && this.voices[type].localId) {
        this.voices[type].localId = ''
      }
      if (this.voices[type - 1] && this.voices[type - 1].localId) {
        this.voices[type - 1].localId = ''
      }
    },
    playVoice (i) {
      let playRecordIndex = this.voices[i].localId ? i : (i - 1)
      let _this = this
      if (!this.isPlaying) {
        this.isPlaying = true
        wx.playVoice({
          localId: _this.voices[playRecordIndex].localId
        })
      } else {
        this.isPlaying = false
        wx.stopVoice({
          localId: _this.voices[playRecordIndex].localId
        })
      }
    },
    playStory () {
      let audio = document.getElementById('audio')
      if (!this.isPlayingStory) {
        this.isPlayingStory = true
        audio.play()
      } else {
        this.isPlayingStory = false
        audio.pause()
      }
    },
    audioPause () {
      console.log('pauseaaaa')
    },
    pushStoryConfirm (type) {
      this.showConfirm = true
      this.type = type
      if (type) {
        this.confirmTitle = '下载故事到设备'
        this.confirmContent = '故事将会被推送到设备'
      } else {
        this.confirmTitle = '在设备端试听故事'
        this.confirmContent = '故事将会在设备端下载'
      }
    },
    onCancel () {
      this.showConfirm = false
    },
    onConfirm () {
      this.pushStory(this.type)
    },
    pushStory (type) {
      let _this = this
      let action = type === 0 ? 'playStory' : 'downloadStory'
      console.log('this.story::', this.story)
      let story = this.story.id
      console.log('ssstory:', story)
      this.uploadVoice().then(function (serverIds) {
        console.log(serverIds)
        let body = {serverIds, action, story}
        console.log(body)
        let url = _this.$http.options.root + '/auth/wx/pushStory'
        console.log(url)
        _this.$http.post(url, body).then(function (res) {
          console.log(res.body)
        })
      })
    }
  },
  components: { dialog, Confirm }
}
</script>

<style lang="css">
    body{background-color:#f0eff5;margin-bottom:55px;}
    .before{width:100%;height:55px;border-bottom:1px solid #d3d5dc;line-height:55px;color:#3b3b3c;font-size:14px;text-indent:2em;background-color:#f3f4f9;}
    .a_add_btn , .b_add_btn{height:60px;width:100%;padding-top:30px;padding-bottom:30px;border-bottom:1px solid #d3d5dc;background-color:#fff;}
	  div.ok{opacity:1;}
    .a_add_btn div.image , .b_add_btn div.image{width:100px;height:60px;display:inline-block;float: left;}
    .a_add_btn div.image img , .b_add_btn div.image img{width:60px;height:60px;padding-left:30px;}
    .a_add_btn div.text p.title , .b_add_btn div.text p.title{font-size:18px;line-height:36px;color:#5c5d5d;}
    .a_add_btn div.text p.tips , .b_add_btn div.text p.tips{font-size:13px;line-height:22px;color:#999;}
    .push_btn{height:70px;width:100%;background-color:#fff;}
    .fix_bottom{position:fixed;bottom:0px;}
    .push_btn .push_story_btn{height:70px;width:49%;background-color:#fff;display:inline-block;color:#000;text-align:center;}
    .bdr{border-right: 1px solid #ccc;}
    .push_story_btn div{text-align: center;align-content: center;}
    .push_story_btn img{height: 26px; align-self: center;margin-top: 5px;}
	  .af_ly span.end , .bb_ly span.end{background-color:#ffa235;}
    .audiod{height:44px;padding-top:38px;padding-bottom:38px;width:100%;border-bottom:1px solid #d3d5dc;display:none;background-color:#f3f4f9;}
    .audiod img{display:block;float:left;}
    .audiod img.user_head{width:44px;height:44px;margin-left:11px;}
    .audiod img.audio_icon{width:97px;height:44px;}
    .audiod img.del{float:right;width:44px;height:44px;}
    .audiod img.redo{float:right;width:44px;height:44px;}
    .audiod span.playtime{float:left;height:55px;line-height:55px;font-size:12px;color:#bcbcbc;}
    .audiod span.re-text{float:left;height:44px;line-height:44px;font-size:17px;color:#000;width:72px;text-indent:1em;}
    .push_mess1 div p{font-size:13px;line-height:26px;text-align:left;padding-left:1em;}
    .push_mess1 div{margin-top:0px;}
    .push_mess1 div p.record_icon{margin-top:0px;text-align:center;}
    .box_after , .box_before{display:none;}
    .hid{display:none;}
    .box_after  .question{text-align:left;text-indent:2em;}
	  .nav-blue{background-color:#3968ac;}
    .over_layer{position:fixed;top:0;height:100%;width:100%;z-index:501;background-color:#000;opacity:0.3;display:block;}
    .dialog_box{position:fixed;top:0;height:100%;width:100%;z-index:10001;display:block;}
    .dialog_table{width:271px;height:102px;background-color:#fff;border-radius:5px; position:absolute;left:50%;top:50%;margin:-51px 0 0 -135px;box-shadow: -1px -1px 3px #ccc;}
    .dialog_table p{width:271px;}
    .dialog_table p span{display:block;float:left;}
    .action_title{width:100%;height:57px;line-height:57px;border-bottom:1px solid #ccc;font-size:12px;color:#0a0a0a;text-align:center;}
    .action_one , .action_two{text-align:center;width:135px;font-size:14px;color:#228bfe;height:44px;line-height:44px;}
    .action_one{border-right:1px solid #ccc;}
    .only-one{width:100%;border:0px;}
    div,p,span,ul,li{-webkit-touch-callout:none;-webkit-user-select:none;-khtml-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;}
    .dialog{border-radius:8px;padding-bottom:8px;}
    .dialog-close{ position:absolute;right:4px;top:0px;font-size:18px;}
    .dialog-title {line-height:30px;color:#666;padding: 10px;}
    .dialog-content{font-size: 12px;color:#333;padding: 15px;}
    .img-box{height: 120px;margin: 5px;overflow: hidden;align-content:center;}
    .startRecord{height: 80px;align-content: center;}
    .startRecord button{padding: 10px; margin: 10px;border-radius: 5px; background-color: #5dc5ec; border: 0;color:white;}
    .audio-block{ width: 100%; padding-top: 15px;}
    .audio-block i{width: 40px;height: 40px;position: absolute;}
    .voice{ width: 70px; background-color: yellow;}
    .rerecord{background-image: url(../../assets/re_record.png);background-size:cover;right: 55px;}
    .delete{background-image: url(../../assets/del_record.png);background-size:cover;right: 5px;}
    .story-top{height: 88px; background-color: #fff;margin-bottom: 55px;border-bottom: 1px solid #d3d5dc;}
    .story{position: absolute;margin-left: 100px;}
    .story-title{font-size: 18px;line-height: 36px;color: #5c5d5d;margin-top: 16px;padding-left: 10px;}
    .story span{color:#666;border-right: 1px solid #ccc;padding: 0 10px;font-size: 14px;}
    .story span:last-child{border-right: 0px;}
</style>
