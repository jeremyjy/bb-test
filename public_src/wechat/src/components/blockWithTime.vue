<template lang="html">
  <div class="story-list">
    <div v-for="item in storylist" class="story-list-item">
          <div @click="toggleItem(item)">
            <i class="goyinzi" v-link="{name:'yinzi',params:{id:item.id}}"></i>
            <img src="../assets/icon_nav_button.png" alt="" />
            <div class="play-block-content">
              <div class="play-block-title">
                {{item.name}}
              </div>
              <div class="play-block-desc-oneline">
                {{item.desc || '这里是一些描述，如果描述为空，我就会出现。'}}
              </div>
              <div class="play-block-time">
                <span>{{item.duration | duration}}</span>
                <span>{{item.category.name || '无'}}</span>
                <span>{{item.fileSize | fileSize}}</span>
              </div>
            </div>
            <audio @ended="listeningToEnd()" :src="item.fileName" :id="item.id">

            </audio>
          </div>
          <!-- 收藏、试听、推送列表 -->
          <ul v-show="currentItem === item && active" class="story-list-item-option">
              <li class="story-list-item-collection"><a>
                  收藏
              </a></li>
              <li class="story-list-item-audition" @click="playAudio(item.id)"><a>
                  试听
              </a></li>
              <li class="story-list-item-demand" @click="dianboStory(item.id)"><a>
                  点播
              </a></li>
              <li class="story-list-item-push" @click="pushStory(item)"><a>
                  推送
              </a></li>
          </ul>
    </div>
  </div>
</template>

<script>
import playBlockMixin from './playBlockMixin'
export default {
  mixins: [playBlockMixin]
}
</script>
