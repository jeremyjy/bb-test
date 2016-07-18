<template lang="html">
  <div class="story-list">
    <div v-for="item in storylist" class="story-list-item">
          <i class="goyinzi" v-link="{name:'yinzi',params:{id:item.id}}"></i>
          <div @click="toggleItem(item)">
            <img src="../assets/icon_nav_button.png" alt="" />
            {{item.name}}
          </div>
          <!-- 收藏、试听、推送列表 -->
          <ul v-show="currentItem === item && active" class="story-list-item-option">
              <li class="story-list-item-collection"><a>
                  收藏
              </a></li>
              <li class="story-list-item-audition"><a>
                  试听
              </a></li>
              <li class="story-list-item-demand"><a>
                  点播
              </a></li>
              <li class="story-list-item-push"><a>
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
