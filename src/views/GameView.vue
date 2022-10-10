<template>
    <div class="game-page">
        <p class="game-score">
            <span class="red">0</span>
            <span class="vs">VS</span>
            <span class="blue">0</span>
        </p>
        <div class="game-board-container">
            <GameControls
             color="#f00"
             @btnClick="movePad"
             v-if="playingOn === 'left'"
            />
            <div class="game-board" ref="gameBoard">
                <div class="decorative-border top-left">
                    <img src="@/assets/bar_red_2.png" alt="">
                </div>
                <div class="decorative-border bottom-left">
                    <img src="@/assets/bar_red_1.png" alt="">
                </div>
                <div class="decorative-border top-right">
                    <img src="@/assets/bar_blue_2.png" alt="">
                </div>
                <div class="decorative-border bottom-right">
                    <img src="@/assets/bar_blue_1.png" alt="">
                </div>

                <canvas class="game-canvas" ref="gameCanvas"></canvas>
            </div>
            <GameControls
             color="#3dcbff"
             @btnClick="movePad"
             v-if="playingOn === 'right'"
            />
        </div>
    </div>
</template>

<script>
import GameControls from '@/components/GameControls.vue'

import leftPadChar from '@/assets/pong3-red.png'
import rightPadChar from '@/assets/pong3-blue.png'

const leftPadImg = new Image()
leftPadImg.src = leftPadChar

const rightPadImg = new Image()
rightPadImg.src = rightPadChar

const BALL_RADUIS = 10
const PAD_WIDTH = 20
const PAD_HEIGHT = 60
const PAD_MOVE_SPEED = 20

export default {
    components: {
        GameControls
    },
    data(){
        return {
            ctx: null,
            ballData: {
                x: 50,
                y: 50,
                vx: Math.random() + 2,
                vy: Math.random() + 2
            },
            leftPadData: {
                y: 30
            },
            rightPadData: {
                y: 60
            },
            playingOn: this.$route.query.userType === 'challanger' ? 'right' : 'left'
        }
    },
    mounted(){
        this.setupGame()
        this.startGame()
        window.addEventListener('resize', this.setCanvasSize)
        window.addEventListener('keydown', this.handleKeydown)
    },
    beforeDestroy(){
        window.removeEventListener('resize', this.setCanvasSize)
        window.removeEventListener('keydown', this.handleKeydown)
    },
    methods: {
        setupGame(){
            const canvas = this.$refs.gameCanvas
            this.setCanvasSize()
            this.ctx = canvas.getContext('2d')
            this.ballData.x = 50 + (Math.random() * (canvas.width - 100))
            this.ballData.y = 50 + (Math.random() * (canvas.height - 100))
            if(Math.random() > .5) this.ballData.vx *= -1
            if(Math.random() > .5) this.ballData.vy *= -1

            const padY = (canvas.height / 2) - (PAD_HEIGHT / 2)
            this.leftPadData.y = padY
            this.rightPadData.y = padY
        },
        setCanvasSize(){
            const board = this.$refs.gameBoard
            const canvas = this.$refs.gameCanvas
            canvas.height = board.clientHeight
            canvas.width = board.clientWidth
        },
        drawBall(){
            const ctx = this.ctx
            ctx.beginPath()
            ctx.arc(this.ballData.x, this.ballData.y, BALL_RADUIS, 0, Math.PI * 2)
            ctx.fillStyle = '#fff'
            ctx.fill()
        },
        drawPads(){
            const canvas = this.$refs.gameCanvas
            const ctx = this.ctx
            
            ctx.beginPath()
            ctx.drawImage(leftPadImg, 10, this.leftPadData.y, PAD_WIDTH, PAD_HEIGHT)
            
            ctx.beginPath()
            ctx.drawImage(rightPadImg, canvas.width - 10 - PAD_WIDTH, this.rightPadData.y, PAD_WIDTH, PAD_HEIGHT)
        },
        startGame(){
            this.render()
            requestAnimationFrame(this.startGame)
        },
        render(){
            const canvas = this.$refs.gameCanvas
            this.ctx.clearRect(0, 0, canvas.width, canvas.height)
            this.drawBall()
            this.drawPads()
            this.animate()
        },
        animate(){
            const canvas = this.$refs.gameCanvas
            this.ballData.x += this.ballData.vx
            this.ballData.y += this.ballData.vy
            if(this.ballData.x < BALL_RADUIS || this.ballData.x + BALL_RADUIS > canvas.width) this.ballData.vx *= -1
            if(this.ballData.y < BALL_RADUIS || this.ballData.y + BALL_RADUIS > canvas.height) this.ballData.vy *= -1
        },
        movePad(direction){
            const canvas = this.$refs.gameCanvas
            const data = this[this.playingOn === 'left' ? 'leftPadData' : 'rightPadData']
            data.y += direction === 'up' ? -PAD_MOVE_SPEED : PAD_MOVE_SPEED
            if(data.y < 0) data.y = 0
            if(data.y > canvas.height - PAD_HEIGHT) data.y = canvas.height - PAD_HEIGHT
        },
        handleKeydown(e){
            if(e.key === 'ArrowUp') this.movePad('up')
            if(e.key === 'ArrowDown') this.movePad('down')
        }
    }
}
</script>

<style lang="scss">
.game-page{
    width: 100%;
    --border-color: rgb(97, 97, 97);
}

.game-score{
    text-align: center;
    margin-bottom: 1em;
    font-size: 2em;
    font-weight: bolder;
    display: flex;
    gap: .75em;
    justify-content: center;
    .red{
        color: #f00;
    }
    .blue{
        color: #3dcbff;
    }
    .vs{
        transform: scale(.75);
    }
}

.game-board-container{
    display: flex;
    align-items: center;
    gap: 1em;
}


.game-board{
    border: 2px solid var(--border-color);
    width: 100%;
    height: 0;
    padding-top: 50%;
    position: relative;
    &::after{
        content: '';
        display: block;
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 5px;
        height: 100%;
        border-left: 2px solid var(--border-color);
        border-right: 2px solid var(--border-color);
    }
    &::before{
        content: '';
        display: block;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        --size: min(20vw, 20vh);
        height: var(--size);
        width: var(--size);
        border-radius: 50%;
        box-shadow: 0 0 0 5px #111111, 0 0 0 7px var(--border-color);
        border: 2px solid var(--border-color);
    }

    .decorative-border{
        position: absolute;
        top: 0;
        left: 0;
        transform: translate(-10%, -40%);
        width: 45%;
        img{
            width: 100%;
        }
        &.bottom-left{
            top: 100%;
            transform: translate(-10%, -60%);
        }
        &.top-right{
            left: 100%;
            transform: translate(-91%, -35%);
        }
        &.bottom-right{
            top: 100%;
            left: 100%;
            transform: translate(-91%, -50%);
        }
    }

    .game-canvas{
        background-color: transparent;
        position: absolute;
        top: 0;
        left: 0;
        z-index: 9;
    }
}
</style>