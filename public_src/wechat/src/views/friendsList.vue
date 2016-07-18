
<template>
<div class = "vux-flexbox vux-flex-row">
    <div class = "vux-flexbox-item" style = "flex: 0 0 15%">
    </div>
    <div class = "vux-flexbox-item" style = "flex: 0 0 35%">
    设备
    </div>
    <div class = "vux-flexbox-item" style = "flex: 0 0 40%">
    自定义昵称
    </div>
    <div class = "vux-flexbox-item" style = "flex: 0 0 10%">

    </div>
  </div>
  <div class = "vux-flexbox vux-flex-row" v-for = "(index, item) in friends">
      <div class = "vux-flexbox-item" style = "flex: 0 0 15%">
      {{index}}
      </div>
      <div class = "vux-flexbox-item" style = "flex: 0 0 35%">
      {{devices[item.socialAccount].deviceModelName}}
      </div>
      <div class = "vux-flexbox-item" style = "flex: 0 0 40%">
      <input  v-model="item.nickName"></input>
      <button v-on:click = "changeNickname(customer,nickname)">修改昵称</button>
      </div>
      <div class = "vux-flexbox-item" style = "flex: 0 0 10%">
      <button v-on:click = "changeNickname(customer,nickname)">删除好友</button>
      </div>
    </div>
</template>
<script>
  export default {
    ready () {
      this.$http.get('http://127.0.0.1:3000/wechat/showDeviceFriends?openid=o2eEHswH2dDQYwmeo-N6Vs1H-WYs').then((res) => {
        console.log(res.data)
        this.$set('friends', res.data.friends)
        this.$set('devices', res.data.devices)
      })
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
