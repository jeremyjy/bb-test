<template>
<div style="background:url(https://o5omsejde.qnssl.com/demo/test1.jpg); min-height:200px; line-height: 200px;">
<flexbox style="height:200px;">
  <flexbox-item><img :src= "device.icon" width="80" height="80" class= "icon" style = "vertical-align: middle; margin-left:150px"></flexbox-item>
  <flexbox-item><input v-model="device.name"></input></cell></flexbox-item>
  <button v-on:click = "changeNickname(customer,nickname)">修改昵称</button>

</flexbox>
  </div>
<group>
  <cell title="出厂厂家" :value="device.manufacturerId" @click="click"></cell>
</group>
<group>
  <cell title="设备名称" :value="device.deviceModelName" @click="click"></cell>
</group>
<div style = "min-height:300px; line-height: 300px;">
  <qrcode :val= "url" :size= "size" style = "text-align:center; margin-top:20px;"></qrcode>
  </div>

</template>
<script>
  import Qrcode from 'vue-qrcode/dist/vue-qrcode'
  import flexbox from 'vux/dist/components/flexbox'
  import flexboxItem from 'vux/dist/components/flexbox-item'
  import group from 'vux/dist/components/group'
  import cell from 'vux/dist/components/cell'

  export default {
    ready () {
      this.$http.get('http://127.0.0.1:3000/wechat/showDeviceQRcode?openid=o2eEHswH2dDQYwmeo-N6Vs1H-WYs').then((res) => {
        this.$data.url = res.data.url
        this.$data.device = res.data.device
      })
    },
    components: {
      Qrcode,
      flexbox,
      flexboxItem,
      group,
      cell
    },
    data () {
      return {
        device: {},
        url: '',
        size: 200
      }
    }
  }
</script>
<style>
.box1{background:url(http://www.divcss5.com/img201301/divcss5-logo-2013.gif)}
</style>

