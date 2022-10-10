<template>
  <div>
    <div class="user-id">
      <span class="user-id-text">Your id:</span>
      <i class="user-id-id">{{userId || 'Loading ...'}}</i>
      <span
       class="user-id-copy-btn"
       @click="copyUserId"
       v-if="userId"
      >{{copyBtnText}}</span>
    </div>
    <div class="input-group w-btn">
      <input v-model="opponentId" type="text" placeholder="Enter opponent id" class="input-group-input">
      <button class="btn" @click="connectPlayers">connect</button>
    </div>
  </div>
</template>

<script>
export default {
  data(){
    return {
      userId: '',
      opponentId: '',
      copyBtnText: 'copy id'
    }
  },
  sockets: {
    connect: function () {
      console.log('socket connected')
      this.userId = this.$socket.id
    },
    roomCreated({roomId, userType}){
      this.$router.push({
        path: '/game',
        query: {
          roomId,
          userType
        }
      })
    }
  },
  methods: {
    copyUserId(){
      if(!navigator || !navigator.clipboard) return alert("Your browser doesn't support automatic copt so you have to copy text manually")
      navigator.clipboard.writeText(this.userId)
      this.copyBtnText = 'copied!'
      setTimeout(() => {
        this.copyBtnText = 'copy id'
      }, 1000)
    },
    connectPlayers(){
      if(!this.opponentId) return
      this.$socket.emit('createRoom', {
        userId: this.userId,
        opponentId: this.opponentId
      })
    }
  }
}
</script>

<style lang="scss">
.user-id{
  font-size: 1.5em;
  display: flex;
  align-items: center;
  gap: .25em;
  margin-bottom: 1em;
  .user-id-text{
    color: rgb(28, 123, 247);
    font-weight: bold;
  }
  .user-id-id{
    color: rgb(206, 204, 204);
  }
  .user-id-copy-btn{
    font-size: .8em;
    color: rgb(28, 123, 247);
    cursor: pointer;
    &:hover{
      text-decoration: underline;
    }
  }
}
</style>