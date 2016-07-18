import Alert from 'vux/dist/components/alert'
// 定义一个混合对象
export default {
  props: {
    storylist: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data: function () {
    return {
      currentItem: {},
      active: false,
      isPlaying: false,
      showAlert: false,
      lastPlayingId: ''
    }
  },
  computed: {},
  ready: function () {
    console.log('data from block:', this.storylist)
  },
  attached: function () {},
  methods: {
    toggleItem (item) {
      console.log(item)
      if (this.currentItem === item) {
        this.active = !this.active
      } else {
        this.active = true
        this.currentItem = item
      }
    },
    playAudio (id) {
      let toPlayAudio = document.getElementById(id)
      let lastAudio = document.getElementById(this.lastPlayingId)
      if (id === this.lastPlayingId && this.isPlaying) {
        this.isPlaying = false
        lastAudio.currentTime = 0
        lastAudio.pause()
      } else {
        this.isPlaying = true
        if (lastAudio) {
          lastAudio.currentTime = 0
          lastAudio.pause()
        }
        this.lastPlayingId = id
        toPlayAudio.play()
      }
    },
    listeningToEnd () {
      // window.alert('very good.给小红花')
    },
    dianboStory (id) {
      let action = 'playStory'
      let story = id
      let body = {action, story}
      let url = this.$http.options.root + '/auth/wx/pushStory'
      console.log(url)
      this.$http.post(url, body).then(function (res) {
        let result = JSON.parse(res.body)
        if (result.code === 200) {
          this.showAlert = true
        } else {
          console.log(result)
        }
      })
    },
    pushStory (item) {
      this.$router.go({name: 'yinzi', params: {id: item.id}})
    }
  },
  components: { Alert }
}
