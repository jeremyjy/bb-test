<template>
    <a href="" class="user-info-left"></a>
    <div class="user-info-right">
      <div><b>小红花当天累计:{{total}}</b></div>
      <div> <img class="flower-icon" src="http://www.qnsb.com/fzepaper/site1/qnsb/res/1/1/2010-08/12/B15/res05_attpic_brief.jpg"/><sapn>已完成</sapn>
      <img class="flower-icon gray" src="http://www.qnsb.com/fzepaper/site1/qnsb/res/1/1/2010-08/12/B15/res05_attpic_brief.jpg"/><sapn>未完成</sapn></div>
    </div>
    <div v-for="(index, rule) in rules">
    <group>
      <div>
        <div class="user-info-right">
          <div>
          {{index+1}}.{{rule.behaviorName}}
          </div>
          <div>
          {{{flowerStatusFun(rule)}}}
          </div>
        </div>
        <div class="{{{flowerLogoFun(rule)}}}">
        </div>
      </div>
    </group>
    </div>
</template>
<script>
import Cell from 'vux/dist/components/cell'
import Group from 'vux/dist/components/group'
export default {
  attached () {
    var date = window.location.href
    date = date.substr(date.indexOf('?') + 1)
    this.$http.get('http://127.0.0.1:3000/api/wechat/checkFlowers?openid=o20X8wqnihCqIToftlGzjCwr2RfE&date=' + date).then(res => {
      this.$data.total = res.data.flowersToday
      this.$data.detail = res.data.detail
      this.$data.flowerStatusFun = function (rule) {
        var flowersLimit = rule.flowersLimit
        var behaviorCode = rule.behaviorCode
        var str = ''
        var flowers = 0
        try {
          flowers = this.$data.detail[behaviorCode]
        } catch (e) {
          flowers = 0
        }
        for (var i = 0; i < flowersLimit; i++) {
          if (i % 6 === 0) str += '<br>'
          if (i <= flowers) {
            str += '<img class="flower-icon" src="http://www.qnsb.com/fzepaper/site1/qnsb/res/1/1/2010-08/12/B15/res05_attpic_brief.jpg"/>'
          } else {
            str += '<img class="flower-icon gray" src="http://www.qnsb.com/fzepaper/site1/qnsb/res/1/1/2010-08/12/B15/res05_attpic_brief.jpg"/>'
          }
        }
        return str
      }
      this.$data.flowerLogoFun = function (rule) {
        var flowersLimit = rule.flowersLimit
        var behaviorCode = rule.behaviorCode
        var flowers = 0
        try {
          flowers = this.$data.detail[behaviorCode]
        } catch (e) {
          flowers = 0
        }
        if (flowers >= flowersLimit / 2) {
          return 'flower-right'
        }
        return 'flower-right gray'
      }
    })
  },

  components: {
    Cell,
    Group
  },
  data () {
    return {
      rules: [{category: 'signature', behaviorName: '每日签到', behaviorCode: 'signIn', flowersOnce: 1, flowersLimit: 1},
              {category: 'sharingOrCommunication', behaviorName: '分享', behaviorCode: 'share', flowersOnce: 1, flowersLimit: 1},
              {category: 'sharingOrCommunication', behaviorName: '主动与好友设备语音聊天', behaviorCode: 'chatWithFriends', flowersOnce: 1, flowersLimit: 1},
              {category: 'sharingOrCommunication', behaviorName: '主动与家庭圈语音聊天', behaviorCode: 'chatWithFamily', flowersOnce: 1, flowersLimit: 1},
              {category: 'sharingOrCommunication', behaviorName: '添加朋友', behaviorCode: 'addFriend', flowersOnce: 1, flowersLimit: 1},
              {category: 'task', behaviorName: '设备听完整故事', behaviorCode: 'listenStory', flowersOnce: 1, flowersLimit: 12},
              {category: 'habit', behaviorName: '自定义习惯', behaviorCode: 'performCustomHabit', flowersOnce: 1, flowersLimit: 6}],
      detail: {},
      total: 0,
      flowerStatusFun: function () { },
      flowerLogoFun: function () { }
    }
  }
}
</script>
<style>
.user-info-left {
    display: inline-block;
    height: 6em;
    width: 7em;
    border-radius: 50%;
    vertical-align: text-bottom;
    background: url("http://www.qnsb.com/fzepaper/site1/qnsb/res/1/1/2010-08/12/B15/res05_attpic_brief.jpg") no-repeat center;
}
.user-info-right {
       display: inline-block;

   }
   .flower-icon {
       width: 20px;
       height: 20px;
       vertical-align: sub;
       margin-left: 5px;
   }
.flower-right {
    float:right;
    display: inline-block;
    height: 5em;
    width: 5em;
    border-radius: 50%;
    vertical-align: text-bottom;
    background: url("http://www.qnsb.com/fzepaper/site1/qnsb/res/1/1/2010-08/12/B15/res05_attpic_brief.jpg") no-repeat center;
}
.flower-right-upset {
    float:right;
    display: inline-block;
    height: 5em;
    width: 5em;
    border-radius: 50%;
    vertical-align: text-bottom;
    background: url("http://www.qnsb.com/fzepaper/site1/qnsb/res/1/1/2010-08/12/B15/res05_attpic_brief.jpg") no-repeat center;
    -webkit-filter: grayscale(100%);
    -moz-filter: grayscale(100%);
    -ms-filter: grayscale(100%);
    -o-filter: grayscale(100%);
    filter: grayscale(100%);
    filter: gray;
}
.gray {
-webkit-filter: grayscale(100%);
-moz-filter: grayscale(100%);
-ms-filter: grayscale(100%);
-o-filter: grayscale(100%);
filter: grayscale(100%);
filter: gray;
}
</style>
