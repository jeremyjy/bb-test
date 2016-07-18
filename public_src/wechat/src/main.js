import Vue from 'vue'
import VueRouter from 'vue-router'
import VueResource from 'vue-resource'
import route from './routers'
import App from './index'
import * as filters from './filters'

Vue.use(VueResource)
Vue.use(VueRouter)
var router = new VueRouter()

// let token = window.localStorage.getItem('token')

// Vue.http.options.root = 'http://localhost:3000/api'
Vue.http.options.root = 'http://192.168.100.16:3000/api'
// Vue.http.options.xmly = 'http://localhost:3000/api/ximalaya'
Vue.http.options.xmly = 'http://192.168.100.16:3000/api/ximalaya'

Vue.http.headers.common['Authorization'] = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWFsbSI6ImN1c3RvbWVyIiwiaWF0IjoxNDY4Mzc3NDQzLCJleHAiOjE0NjgzODEwNDMsInN1YiI6IjU3ODM2Y2EwNjI2Njc2OTA2YWU3M2U4NCIsImp0aSI6IjU3ODVhOTYzY2UwNjRiYTAxZTFhOGQ2YyJ9.7hNpKYyufrSXv68w-Ektb54UqTfbSpGlRvxPgmBek9Y' // + token

// register filters
Object.keys(filters).forEach(function (k) {
  Vue.filter(k, filters[k])
})

// config router
router.map(route)
router.start(App, '#app')
