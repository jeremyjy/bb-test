<template>
<div class="user">
    <img :src="customer.icon" class="user-info-left"/>

    <div class="user-info-right">
        <div class="user-info-table">
            <div class="user-name">{{customer.name}}&nbsp
                <div class="records">连续{{result.continueDays}}天登录</div>
            </div>
            <div class="user-accumulation">积累：<b>{{customer.deviceId[0].totalFlowers}}</b> <img class="flower-icon" src="https://o5omsejde.qnssl.com/demo/test1.jpg"/></div>
            <div class="user-explain" @click= "ruleClickFn()">小红花激励制度</div>
        </div>
    </div>
</div>


<div>
  <inline-calendar
  class="inline-calendar-demo"
  :show.sync="show"
  :value.sync="value"
  :range="range"
  :show-last-month="showLastMonth"
  :show-next-month="showNextMonth"
  :highlight-weekend="highlightWeekend"
  :return-six-rows="return6Rows"
  :hide-header="hideHeader"
  :hide-week-list="hideWeekList"
  :replace-text-list="replaceTextList"
  :weeks-list="weeksList"
  :custom-slot-fn="buildSlotFn"
  :custom-click-fn="customClickFn"
  :disable-past="disablePast" >
  </inline-calendar>
</div>
</template>

<script>
import InlineCalendar from '../components/inline-calendar'
import Group from 'vux/dist/components/group'
import Radio from 'vux/dist/components/radio'
import XButton from 'vux/dist/components/x-button'
import Cell from 'vux/dist/components/cell'
import Divider from 'vux/dist/components/divider'
import Switch from 'vux/dist/components/switch'

export default {
  ready () {
    this.$http.get('http://127.0.0.1:3000/api/wechat/calculateFlowers?openid=o20X8wqnihCqIToftlGzjCwr2RfE').then((res) => {
      this.$data.customer = res.data.customer
      this.$data.result = res.data.result
      this.$data.buildSlotFn = (k1, k2, child) => {
        if (!child.isLastMonth && !child.isNextMonth) {
          if (this.$data.result[child.year + '-' + child.month_str + '-' + child.day]) {
            return 'record'
          }
        }
      }
      this.$data.customClickFn = (k1, k2, child) => {
        this.$route.router.go('/flowerDay?' + child.year + '-' + child.month_str + '-' + child.day)
      }
    })
  },
  watch: {
    replace (val) {
      this.replaceTextList = val ? {
        'TODAY': '今'
      } : {}
    },
    useCustomFn (val) {
      this.buildSlotFn = val ? (line, index, data) => {
        return /8/.test(data.day) ? '<div style="font-size:12px;text-align:center;"><span style="display:inline-block;width:5px;height:5px;background-color:red;border-radius:50%;"></span></div>' : ''
      } : () => ''
    },
    changeWeeksList (val) {
      this.weeksList = val ? ['日', '一', '二', '三', '四', '五', '六 '] : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
    }
  },
  data () {
    return {
      customer: {},
      result: {},
      show: true,
      value: '',
      listValue: '',
      range: false,
      showLastMonth: false,
      showNextMonth: false,
      highlightWeekend: false,
      return6Rows: false,
      hideHeader: true,
      hideWeekList: false,
      replaceTextList: {},
      replace: false,
      changeWeeksList: false,
      weeksList: ['日', '一', '二', '三', '四', '五', '六 '],
      useCustomFn: true,
      buildSlotFn: false,
      customClickFn: false,
      disablePast: false,
      ruleClickFn: () => {
        this.$route.router.go('flowerRule')
      }
    }
  },
  components: {
    InlineCalendar,
    Group,
    Switch,
    Radio,
    XButton,
    Cell,
    Divider
  }
}

</script>

<style>
body, html,div {
    margin: 0px;
    padding: 0px;
    font-family: "微软雅黑";
}
.user {
    padding-left: 1em;
    padding-top: 1em;
    padding-bottom:1em;
    border-bottom: 1px solid #666666;
}
.user-info-left {
    display: inline-block;
    height: 6em;
    width: 7em;
    border-radius: 50%;
    vertical-align: text-bottom;
}

.user-info-right {
       display: inline-block;

   }
.user-info-table {
    display: table;
    border-collapse: collapse;
    font-size: 1em;
    margin-left: 1em;
}
.user-name {
    display: table-row;
    width: 180px;
}
.user-accumulation {
    display: table-row;
    width: 180px;
    padding-left: 10px;
    line-height: 40px;
}
.user-explain {
    display: table-row;
    width: 380px;
    padding-left: 10px;
}
.records {
    color: #666666;
    display: inline-block;
    font-size: 0.7em;
    vertical-align: text-bottom;
}
.flower-icon {
    width: 20px;
    height: 20px;
    vertical-align: sub;
    margin-left: 5px;
}
/* 领取小红花 */
.table-bottom {
    display: table;
    width: 100%;
    text-align: center;
    margin-left:auto;
    margin-right:auto;
    padding: 16px;
    border-bottom: 1px solid #666666;
    box-sizing: border-box;
}
.table-col1 {
    display: table-cell;
    vertical-align:middle;
    width: 20%;
}
.table-bottom-icon {
    width: 2.8em;
}
.table-col2 {
    display: table-cell;
    line-height: 1.7em;
}
.table-center {
    display: table;
    margin-left: 0.7em;
    text-align: left;
}
.table-center-row1 {
    display: table-row;
    font-size: 1em;
    font-weight: bold;
}
.table-center-row2 {
    display: table-row;
    font-size: 10px;
    color: #666666;
}

.inline-calendar-demo {
  background: rgba(255,255,255,0.9);
  backdrop-filter: blur(5px);
}

.is-week-list-0,.is-week-list-1,.is-week-list-2,.is-week-list-3,.is-week-list-4,.is-week-list-5,.is-week-list-6 {
  border-bottom: 1px solid #D81B60;
}
.inline-calendar td>span {
    display: inline-block;
    width: 26px;
    height: 26px;
    line-height: 26px;
    font-weight: bold;
    border-radius: 50%;
    text-align: center;
}
.record {
    background-size: 77%;
    background-image: url(https://o5omsejde.qnssl.com/demo/test1.jpg);
    background-repeat: no-repeat;
    background-position: center;
}



</style>
