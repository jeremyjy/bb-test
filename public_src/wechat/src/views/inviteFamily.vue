<template>

  <img v-bind:src="customer" length ="150" width= "150" >

</template>
<script>
  export default {
    ready () {
      this.$http.get('http://127.0.0.1:3000/wechat/inviteFamilyMember?openid=o2eEHswH2dDQYwmeo-N6Vs1H-WYs').then((res) => {
        console.log(res.data)
        this.$set('customer', res.data.qrcode)
      })
    }
  }
</script>

