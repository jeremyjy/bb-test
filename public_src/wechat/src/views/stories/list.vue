<template lang="html">
  <div>
      <div class="story-category">
          <img class="story-category-icon" src="../../assets/filter_bg.jpg" />
              <!--<p class="story-category-description"><span class="story-category-princess">公主故事</span><br/><br/>生活习惯、生活技能养成的故事，可以帮助宝宝更好的成长</p>-->
          <p class="story-category-description">
              <span class="story-category-princess">{{category.name}}</span>
              <br/>
              <span>{{category.desc}}</span>
          </p>
      </div>
      <div class="story-category-nav"></div>

      <play-block :storylist="storyList"></play-block>
    </div>
</template>

<script>
import playBlock from '../../components/playBlock'
export default {
  data: function () {
    return {
      category: {},
      storyList: [],
      currentItem: {},
      active: false
    }
  },
  route: {
    data (transition) {
      this.category = JSON.parse(window.localStorage.getItem('category'))
      console.log(this.category.name)
      let id = transition.to.params.category
      let url = this.$http.options.root + '/stories?_filters={"category":"' + id + '"}'
      url = encodeURI(url)
      this.$http.get(url).then((res) => {
        this.storyList = JSON.parse(res.body)
      })
    }
  },
  computed: {},
  ready: function () {},
  attached: function () {},
  methods: {
  },
  components: { playBlock }
}
</script>

<style lang="css">
        /* 顶部样式 */
        .story-category-icon {
            height: 95px;
            width: 95px;
            margin-left: 5%;
            margin-top: 4%;
            margin-bottom: 4%;
        }

        .story-category {
            height: 100%;
            background-color: #FFFFFF;
            -webkit-transform: rotateY(0deg);
            position: relative;
        }
        .story-category-princess {
            font-weight: bold;
            font-size: 16px;
            line-height:288%;
        }
        .story-category-description {
            position: absolute;
            top: 10%;
            left: 39%;
            margin-left: 0%;
            margin-right: 3%;
            font-size: 12px;

        }
        /* 灰色过渡带 */
        .story-category-nav {
            width:100%;
            height: 18px;
            background: #F0F0F2;
            border-top: 1px solid #BBBBBB;
        }
</style>
