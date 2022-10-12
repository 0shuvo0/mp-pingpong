<template>
    <div class="modal-wrapper">
        <div class="modal-content">
            <p class="title">{{title}}!!!</p>
            <p class="info">{{description}} the game. Final score is <b>{{score.user}}/{{score.opponent}}</b></p>
            <a href="/" class="btn">continue</a>
        </div>
    </div>
</template>

<script>
export default {
    props: ['score', 'winner', 'playerIs'],
    computed: {
        title(){
            if(this.winner === 'tie') return 'Its a Tie'
            if(this.winner === 'player') return this.playerIs === 'user' ? 'You won' : 'You lost'
            return this.playerIs !== 'user' ? 'You won' : 'You lost'
        },
        description(){
            if(this.winner === 'tie') return 'You tied'
            if(this.winner === 'player') return this.playerIs === 'user' ? 'You won' : 'You lost'
            return this.playerIs !== 'user' ? 'You won' : 'You lost'
        }
    }
}
</script>

<style lang="scss">
.modal-wrapper{
    height: 100vh;
    width: 100vw;
    background: rgba(255, 255, 255, .3);
    backdrop-filter: blur(10px);
    position: fixed;
    top: 0;
    left: 0;
    z-index: 999;
    display: flex;
    justify-content: center;
    align-items: center;
    .modal-content{
        width: 90%;
        max-width: 400px;
        padding: 2em 1em;
        border-radius: 10px;
        background: #fff;
        color: #000;
        text-align: center;
        animation: .3s popIn;
        .title{
            font-size: 1.5em;
            font-weight: bold;
        }
        .info{
            margin: 1em 0;
        }
        .btn{
            display: inline-block;
            text-decoration: none;
            min-width: 200px;
            margin-top: 1em;
        }
    }
}

@keyframes popIn {
    0%{
        transform: scale(.6);
        opacity: 0;
    }
    100%{
        transform: scale(1);
        opacity: 1;
    }
}
</style>