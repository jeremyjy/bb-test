<template lang="html">
  <div class="">
    <search @result-click="resultClick" @on-change="getResult" :results="results" :value.sync="value"></search>

  </div>
</template>

<script>
import Search from 'vux/dist/components/Search'
export default {
  data: function () {
    return {
      results: [],
      value: ''
    }
  },
  computed: {},
  ready: function () {},
  attached: function () {},
  methods: {
    resultClick (item) {
      window.alert('you click the result item: ' + JSON.stringify(item))
    },
    getResult (val) {
      this.results = getResult(this.value)
    }
  },
  components: {
    Search
  }
}
function getResult (val) {
  let rs = []
  for (let i = 0; i < 40; i++) {
    rs.push({
      title: `${val} result: ${i + 1} `,
      other: i
    })
  }
  return rs
}
</script>

<style lang="css">
</style>
