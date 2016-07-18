export default {
  '*': {
    component: (resolve) => {
      require(['./views/index'], resolve)
    }
  },
  '/': {
    component: (resolve) => {
      require(['./views/index'], resolve)
    }
  },
  '/index': {
    component: (resolve) => {
      require(['./views/index'], resolve)
    }
  },
  '/qimalaya': {
    name: 'qimalaya',
    component: (resolve) => {
      require(['./index_ximalaya'], resolve)
    }
  },
  '/qimalaya/albums/:tag_name/:calc_dimension': {
    name: 'albums',
    component: (resolve) => {
      require(['./views/qimalaya/albums'], resolve)
    }
  },
  '/qimalaya/album/:id': {
    name: 'album',
    component: (resolve) => {
      require(['./views/qimalaya/album'], resolve)
    }
  },
  '/story': {
    component: (resolve) => {
      require(['./index_story'], resolve)
    }
  },
  '/story/yinzi/:id': {
    name: 'yinzi',
    component: (resolve) => {
      require(['./views/stories/yinzi'], resolve)
    }
  },
  '/storylist/:category': {
    name: 'storyList',
    component: (resolve) => {
      require(['./views/stories/common'], resolve)
    }
  },
  '/collection': {
    component: (resolve) => {
      require(['./views/collection'], resolve)
    }
  },
  '/history': {
    component: (resolve) => {
      require(['./views/history'], resolve)
    }
  },
  '/song-list': {
    component: (resolve) => {
      require(['./views/song-list'], resolve)
    }
  },
  '/emoji': {
    component: (resolve) => {
      require(['./views/emoji'], resolve)
    }
  },
  '/flist': {
    component: (resolve) => {
      require(['./views/friendsList'], resolve)
    }
  },
  '/device': {
    component: (resolve) => {
      require(['./views/showDeviceQR'], resolve)
    }
  },
  '/family': {
    component: (resolve) => {
      require(['./views/showFamily'], resolve)
    }
  },
  '/invite': {
    component: (resolve) => {
      require(['./views/inviteFamily'], resolve)
    }
  },
  '/flower': {
    component: (resolve) => {
      require(['./views/flower'], resolve)
    }
  },
  '/flowerDay': {
    component: (resolve) => {
      require(['./views/flowerDay'], resolve)
    }
  },
  '/flowerRule': {
    component: (resolve) => {
      require(['./views/flowerRule'], resolve)
    }
  },
  '/habit': {
    component: (resolve) => {
      require(['./views/habit/habit-list'], resolve)
    }
  },
  '/habit-edit': {
    component: (resolve) => {
      require(['./views/habit/habit-edit'], resolve)
    }
  },
  '/habit-delete': {
    component: (resolve) => {
      require(['./views/habit/habit-delete'], resolve)
    }
  },
  '/habit-create': {
    component: (resolve) => {
      require(['./views/habit/habit-create'], resolve)
    }
  }
}
