<template>

<div style="background:url(https://o5omsejde.qnssl.com/demo/test1.jpg); min-height:200px; line-height: 100px;">
<flexbox>
            <flexbox-item><img :src= "customer.icon" width="80" height="80" class= "icon" style = "vertical-align: middle; margin-left:20px"></flexbox-item>
            <flexbox-item><input  v-model="nickname"></input></cell></flexbox-item>
            <button v-on:click = "changeNickname(customer,nickname)">修改昵称</button>
 </flexbox>
 <flexbox v-if = "!! customer.deviceId == true">
             <flexbox-item><img :src= "customer.deviceId.icon" width="80" height="80" class= "icon" style = "vertical-align: middle; margin-left:20px"></flexbox-item>
             <flexbox-item><input v-model="deviceNickname"></input></cell></flexbox-item>
             <button v-on:click = "changeNickname(customer.deviceId,deviceNickname)">修改昵称</button>
  </flexbox>
  </div>
  <group>
  <div class = "vux-flexbox vux-flex-row">
    <div class = "vux-flexbox-item" v-for="(index, item) in group.members" style = "flex: 0 0 25%">
      <img :src= "'http://bbcloud-logo.oss-cn-shenzhen.aliyuncs.com/'+item.socialAccount+'.jpg'" width="80" height="80" class= "icon" v-if="item.socialAccount">
      <br>
      <span>{{item.nickName}}</span>
    </div>
  </div>
    </group>
  <br>
<x-button v-on:click = "removeUser(customer)">退出家庭圈聊</x-button>
</template>
<script>
import xButton from 'vux/dist/components/x-button'
import Cell from 'vux/dist/components/cell'
import Checker from 'vux/dist/components/checker'
import CheckerItem from 'vux/dist/components/checker-item'
import Group from 'vux/dist/components/group'
import flexbox from 'vux/dist/components/flexbox'
import flexboxItem from 'vux/dist/components/flexbox-item'

export default {
  ready () {
    this.$http.get('http://127.0.0.1:3000/wechat/showFamilyMembers?openid=o2eEHswH2dDQYwmeo-N6Vs1H-WYs').then((res) => {
      this.$data.customer = res.data.customer
      this.$data.group = res.data.group
      for (var item in res.data.group.members) {
        if (res.data.group.members[item].socialAccount === res.data.customer.socialAccount) {
          this.$data.nickname = res.data.group.members[item].nickName
        }
        if (res.data.customer.deviceId) {
          if (res.data.group.members[item].socialAccount === res.data.customer.deviceId.socialAccount) {
            this.$data.deviceNickname = res.data.group.members[item].nickName
          }
        }
      }
    })
  },
  components: {
    Cell,
    Checker,
    CheckerItem,
    Group,
    xButton,
    flexbox,
    flexboxItem
  },
  data () {
    return {
      customer: {},
      group: {},
      nickname: '',
      deviceNickname: ''
    }
  },
  methods: {
    removeUser: function (user) {
      this.$http.get('http://127.0.0.1:3000/wechat/exitGroup?openid=' + this.$data.customer.wechatOpenId).then((res) => {
        console.log('remove success!')
      })
    },
    changeNickname: function (object, nickname) {
      console.log(nickname)
      this.$http.get('http://127.0.0.1:3000/wechat/changeNickName?openid=' + this.$data.customer.wechatOpenId + '&socialAccount=' + object.socialAccount + '&nickname=' + nickname).then((res) => {
        console.log('change success!')
      })
    }
  }
}
</script>
<style>
.demo2-item {
  width: 80px;
  height: 80px;
  border: 1px solid #ccc;
  display: inline-block;
  border-radius: 50%;
  line-height: 40px;
  text-align: center;
}
.demo2-item-selected {
  border-color: green;
}
.icon{border-radius:50%}
</style>
