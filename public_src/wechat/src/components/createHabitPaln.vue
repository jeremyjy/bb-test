<template>
  <table class="story-introduction">
    <tr >
      <td>习惯名称
        <input type="text" placeholder="习惯名称" class="habit-input" v-model="habitPlan.name">
      </td>
    </tr>
    <tr>
      <td>
        <flexbox style="height:40px;">
          <span>运动时间&nbsp&nbsp&nbsp</span>
          <span>启动&nbsp</span>
          <datetime class="datetime" :value.sync="habitPlan.fromTime" format="HH:mm" @on-change="change"></datetime>
          <span>&nbsp&nbsp&nbsp&nbsp&nbsp</span>
          <span>停止&nbsp</span>
          <datetime class="datetime" :value.sync="habitPlan.endTime" format="HH:mm" @on-change="change"></datetime>
        </flexbox>
      </td>
    </tr>
    <tr class="habit-cycle-period">
      <td>循环周期
        <div class="habit-cycle-periodBox">
          <div class="habit-cycle-week" @click="clickWeek('monday')" :class="{ 'dateColor': habitPlan.monday}">周一</div>
          <div class="habit-cycle-week" @click="clickWeek('tuesday')" :class="{ 'dateColor': habitPlan.tuesday}">周二</div>
          <div class="habit-cycle-week" @click="clickWeek('wednesday')" :class="{ 'dateColor': habitPlan.wednesday}">周三</div>
          <div class="habit-cycle-week" @click="clickWeek('thursday')" :class="{ 'dateColor': habitPlan.thursday}">周四</div>
          <div class="habit-cycle-week" @click="clickWeek('friday')" :class="{ 'dateColor': habitPlan.friday}">周五</div>
          <div class="habit-cycle-week" @click="clickWeek('saturday')" :class="{ 'dateColor': habitPlan.saturday}">周六</div>
          <div class="habit-cycle-week" @click="clickWeek('sunday')" :class="{ 'dateColor': habitPlan.sunday}">周七</div>
        </div>
      </td>
    </tr>
    <tr>
      <td>
        <span>音乐</span>
        <vue-file-upload :url="url + '/upload/story'" :files.sync = 'files' :events = 'cbEvents' :filters = "filters" :request-options = "reqopts"></vue-file-upload>
        <span>{{files[files.length-1].name}}<span>
          <!--<ul v-for="item in files">-->
            <!--<li>{{item.name}}</li>-->
          <!--</ul>-->
        <!--<input type="file" class="music-calss">-->
        <!--<a href="javascript:;" class="music-calss">-->
          <!--<input type="file"/>-->
          <!--<input type="text" v-model="musicName" v-show="false">-->
        <!--</a>-->
      </td>
    </tr>
  </table>
  <flexbox>
    <flexbox-item>
      <x-button @click="cancel">取消</x-button>
    </flexbox-item>
    <flexbox-item>
      <x-button type="primary" @click="confirm">确定</x-button>
    </flexbox-item>
  </flexbox>
  <alert :show.sync="alertShow" title="" button-text="确定">
    <p style="text-align:center;">{{alertContent}}</p>
  </alert>
</template>
<style>
  body, html,div {
    margin:0px;
    padding: 1px;
    /*background-color: #F0F0F2;*/
  }
  .story-introduction {
    margin-left: 7%;
    width: 88%;
  }
  .story-introduction tr td {
    font-size: 14px;
    font-family: "微软雅黑";
  }

  /* 习惯输入框样式 */
  .habit-input {
    margin-left: 3%;
    background: #FFFFFF;
    width: 205px;
    height: 32px;
    border: 1px solid #BBBBBB;
    border-radius: 1%;
    border-radius: 4px;
  }
  .habit-time-startBox {
    display: inline;
    margin-left: 3%;
  }
  .habit-time-stopBox{
    display: inline;
    margin-left: 6%;
  }
  .habit-time-stop {
    display: inline;
    background: #FFFFFF;
    width: 69%;
    height: 80%;
    border: 1px solid #BBBBBB;
    border-radius: 1%;
    border-radius: 4px;
    padding: 3% 2%;
  }
  /* 行高 */
  table tr {
    height:89px;
  }
  .habit-cycle-periodBox {
    padding: 3% 0;
    color: #66667D;
  }
  .story-introduction tr td div.habit-cycle-week {
    margin-left: 5px;
    font-size: 12px;
    display: inline;
    /*background: #FFFFFF;*/
    width: 69%;
    height: 80%;
    border: 1px solid #BBBBBB;
    border-radius: 1%;
    border-radius: 4px;
    padding: 2% 3px;
  }
  .story-introduction tr td div.habit-cycle-week:nth-child(1) {
    margin-left: 0px;
  }
  .music-calss {
    margin-left: 2%;
    background: #FFFFFF;
    width: 138px;
    height: 32px;
    border: 1px solid #BBBBBB;
    border-radius: 1%;
    border-radius: 4px;
  }
  .folder {
    display: inline;
    width: 50px;
    height: 34px;
    margin-left: 2%;
    background: red;
  }
  .habit-submit {
    margin: 50px 5%;
    background: #FFFFFF;
    width: 90%;
    height: 24px;
    border: 1px solid #BBBBBB;
    border-radius: 8px;
    text-align: center;
    padding-top: 5px;
  }
  .datetime{
    background: #FFFFFF;
    border: 1px solid #C9C9C9;
    border-radius: 5px;
  }
  .dateColor{
    background: #18AFFD;
  }
</style>
<script>
  import Vue from 'vue'
  import VueRouter from 'vue-router'
  import Group from 'vux/dist/components/group'
  import Datetime from 'vux/dist/components/datetime'
  import flexbox from 'vux/dist/components/flexbox'
  import flexboxItem from 'vux/dist/components/flexbox-item'
  import xButton from 'vux/dist/components/x-button'
  import VueFileUpload from 'vue-file-upload'
  import alert from 'vux/dist/components/alert'
  export default{
    props: ['habitPlan', 'showEdit', 'url'],
    ready () {
    },
    data () {
      return {
        alertShow: false,
        name: '',
        fromTime: '',
        endTime: '',
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
        alertContent: '',
        files: [],
        filters: [
          {
            name: 'imageFilter',
            fn (file) {
              var type = '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|'
              console.log(type)
              return '|jpg|png|jpeg|bmp|gif|mp3|'.indexOf(type) !== -1
            }
          }
        ],
        cbEvents: {
          onCompleteUpload (file, response, status, header) {
            console.log(this)
            console.log(response)
            console.log('finish upload;')
          },
          onAddFileSuccess (file) {
            console.log(file)
            console.log('success add to queue')
          }
        },
        reqopts: {
          formData: {
//            tokens: 'tttttttttttttt'
          },
          responseType: 'json',
          withCredentials: false
        }
      }
    },
    methods: {
      change (val) {
        console.log('change', val)
      },
      clickWeek (week) {
        this.habitPlan[week] = !this.habitPlan[week]
      },
      cancel () {
        let router = new VueRouter()
        if (this.habitPlan.id) {
          this.showEdit = true
        } else {
          router.go('/habit')
        }
      },
      confirm () {
        if (this.habitPlan.id) {
          // 修改
        } else {
          // 创建
          let file = this.files[this.files.length - 1]
          if (!file) {
            this.alertContent = '音乐还没上传哟!'
            this.alertShow = true
          } else {
            this.habitPlan.musicName = file.name || ''
            verify(this, file)
          }
        }
      }
    },
    components: {
      Group,
      Datetime,
      flexbox,
      flexboxItem,
      xButton,
      VueFileUpload,
      alert
    }
  }
  function verify (self, file) {
    let habitPlan = self.habitPlan
    if (!habitPlan.name) {
      self.alertContent = '习惯名称不能为空!'
      self.alertShow = true
    } else if (!habitPlan.fromTime || !habitPlan.endTime) {
      self.alertContent = '启动时间或停止时间不能为空!'
      self.alertShow = true
    } else if (habitPlan.fromTime.replace(':', '') >= habitPlan.endTime.replace(':', '')) {
      self.alertContent = '停止时间必须大于启动时间!'
      self.alertShow = true
    } else {
      if (file) {
        file.upload()
      }
      Vue.http.post(self.url + '/api/wechat/habitPlan', self.habitPlan).then(function (res) {
        console.log('-------------------------------')
        console.log(res)
      }, function (res) {
        console.log(res)
        // error callback
      })
    }
  }
</script>
