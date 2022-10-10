import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import SocketIO from 'socket.io-client'
import VueSocketIO from 'vue-socket.io'

import '@/assets/global.scss'

Vue.use(new VueSocketIO({
  debug: true,
  connection: SocketIO('http://localhost:3000')
}))

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
