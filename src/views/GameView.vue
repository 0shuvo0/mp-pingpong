<template>
    <div class="game-page">
        <div class="ready-stats">
            <p class="ready-stats-payer1">
                <button @click="markUserReady" class="btn" v-if="!userReady">I am ready!</button>
                <span class="d-inline-block mb-05" v-else-if="userReady && opponentReady">The game has began!!!</span>
                <span class="d-inline-block mb-05" v-else>waiting for opponent ...</span>
            </p>
            <p class="ready-stats-payer2">Your opponent is <span class="blue" v-if="opponentReady">ready!</span><span class="red" v-else>not ready!</span></p>
        </div>
        <p class="game-score">
            <span class="red">{{score.opponent}}</span>
            <span class="vs">VS</span>
            <span class="blue">{{score.user}}</span>
        </p>
        <div class="game-board-container">
            <!-- <GameControls
             color="#f00"
             @btnClick="movePad"
             v-if="playingOn === 'left'"
            /> -->
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
            <!-- <GameControls
             color="#3dcbff"
             @btnClick="movePad"
             v-if="playingOn === 'right'"
            /> -->
        </div>
        <GameControls
            :color="playingOn === 'left' ? '#f00' : '#3dcbff'"
            @btnClick="movePad"
        />
        <GameOverModal
         v-if="gameOver"
         :score="score"
         :winner="winner"
         :playerIs="playingOn === 'right' ? 'user' : 'opponent'"
        />
    </div>
</template>

<script>
import GameControls from '@/components/GameControls.vue'

import leftPadChar from '@/assets/pong3-red.png'
import rightPadChar from '@/assets/pong3-blue.png'
import GameOverModal from '../components/GameOverModal.vue'

import scoreUpdate from '@/assets/scoreUpdate.wav'

const scoreUpdateSound = new Audio(scoreUpdate)

const leftPadImg = new Image()
leftPadImg.src = leftPadChar

const rightPadImg = new Image()
rightPadImg.src = rightPadChar

const BALL_RADUIS = 10

const PAD_O_WIDTH = 4
const PAD_O_HEIGHT = 20
let PAD_WIDTH = 20
let PAD_HEIGHT = 60
const PAD_MOVE_SPEED = 10
const PAD_MARGIN = 2


function percentage(totalValue, percentage){
   return totalValue * (percentage / 100)
}

function getXYCoord(canvas, hX, hY){
    const height = canvas.height
    const width = canvas.width
    const x = percentage(width, hX)
    const y = percentage(height, hY)

    return {x, y}
}

function checkCollision(bx, by, px, py){
    let Xn = Math.max(px, Math.min(bx, px + PAD_WIDTH));
    let Yn = Math.max(py, Math.min(by, py + PAD_HEIGHT));
    let Dx = Xn - bx
    let Dy = Yn - by
    const R = BALL_RADUIS

    return (Dx * Dx + Dy * Dy) <= R * R
}

export default {
    components: {
    GameControls,
    GameOverModal
},
    data(){
        return {
            userReady: false,
            opponentReady: false,
            ctx: null,
            ballData: {
                x: 50,
                y: 50,
                vx: Math.max(.6, Math.random() + .2),
                vy: Math.max(.6, Math.random() + .2)
            },
            leftPadData: {
                y: 40
            },
            rightPadData: {
                y: 40
            },
            playingOn: this.$route.query.userType === 'challanger' ? 'right' : 'left',
            score: {
                user: 0,
                opponent: 0
            },
            gameOver: false,
            winnner: ''
        }
    },
    sockets: {
        opponentReady(){
            this.opponentReady = true
        },
        startGame({ballData, leftPadData, rightPadData}){
            this.ballData = ballData
            this.leftPadData = this.playingOn === 'left' ? leftPadData : rightPadData
            this.rightPadData = this.playingOn === 'right' ? leftPadData : rightPadData
            this.setupGame()
            this.startGame()
        },
        opponentPadMove(direction){
            const canvas = this.$refs.gameCanvas
            const data = this[this.playingOn === 'right' ? 'leftPadData' : 'rightPadData']
            data.y += direction === 'up' ? -PAD_MOVE_SPEED : PAD_MOVE_SPEED
            if(data.y < 0) data.y = 0
            if(percentage(canvas.height, data.y) > canvas.height - PAD_HEIGHT) data.y = (100 * (canvas.height - PAD_HEIGHT)) / canvas.height
        },
        scoreUpdate(score){
            this.score = score
        },
        gameOver({score, winner}){
            this.score = score
            this.winner = winner
            this.gameOver = true
        }
    },
    // watch: {
    //     score: {
    //         handler(){
    //             scoreUpdateSound.play()
    //         },
    //         deep: true
    //     }
    // },
    mounted(){
        const canvas = this.$refs.gameCanvas
        const height = canvas.height
        const width = canvas.width
        PAD_HEIGHT = percentage(height, PAD_O_HEIGHT)
        PAD_WIDTH = percentage(width, PAD_O_WIDTH)
        
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
        },
        setCanvasSize(){
            const board = this.$refs.gameBoard
            const canvas = this.$refs.gameCanvas
            canvas.height = board.clientHeight
            canvas.width = board.clientWidth
            const height = canvas.height
            const width = canvas.width
            PAD_HEIGHT = percentage(height, PAD_O_HEIGHT)
            PAD_WIDTH = percentage(width, PAD_O_WIDTH)
        },
        drawBall(){
            const canvas = this.$refs.gameCanvas
            const ctx = this.ctx
            ctx.beginPath()
            const {x, y} = getXYCoord(canvas, this.ballData.x, this.ballData.y)
            ctx.arc(x, y, BALL_RADUIS, 0, Math.PI * 2)
            ctx.fillStyle = '#fff'
            ctx.fill()
        },
        drawPads(){
            const canvas = this.$refs.gameCanvas
            const ctx = this.ctx
            
            const {x: x1, y: y1} = getXYCoord(canvas, PAD_MARGIN, this.leftPadData.y)
            ctx.beginPath()
            ctx.drawImage(leftPadImg, x1, y1, PAD_WIDTH, PAD_HEIGHT)
            
            const {x: x2, y: y2} = getXYCoord(canvas, PAD_MARGIN, this.rightPadData.y)
            ctx.beginPath()
            ctx.drawImage(rightPadImg, canvas.width - x2 - PAD_WIDTH, y2, PAD_WIDTH, PAD_HEIGHT)
        },
        startGame(){
            this.render()
            if(this.gameOver) return
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
            const {x, y} = getXYCoord(canvas, this.ballData.x, this.ballData.y)
            const {x: plx, y: ply} = getXYCoord(canvas, PAD_MARGIN, this.leftPadData.y)
            const {x: prx, y: pry} = getXYCoord(canvas, PAD_MARGIN, this.rightPadData.y)
            
            const leftPadConllision = checkCollision(x, y, plx, ply)
            const rightPadConllision = checkCollision(x, y, canvas.width - prx - PAD_WIDTH, pry)
            const isChallanger = this.$route.query.userType === 'challanger'
            if(leftPadConllision || rightPadConllision){
                this.ballData.vy *= -1
            }
            if(leftPadConllision){
                this.ballData.vx = Math.abs(this.ballData.vx)
            }
            if(rightPadConllision){
                this.ballData.vx = -Math.abs(this.ballData.vx)
            }
            if(x <= BALL_RADUIS){
                console.log('left player died')

                this.ctx.fillStyle = '#f00'
                this.ctx.fillRect(0, 0, 50, canvas.height)
                if(isChallanger){
                    this.score.user++
                    this.$socket.emit('scoreUpdate', {
                        score: this.score,
                        roomId: this.$route.query.roomId
                    })
                }
            }
            if(x + BALL_RADUIS >= canvas.width){

                this.ctx.fillStyle = '#3dcbff'
                this.ctx.fillRect(canvas.width - 50, 0, 50, canvas.height)
                if(isChallanger){
                    this.score.opponent++
                    this.$socket.emit('scoreUpdate', {
                        score: this.score,
                        roomId: this.$route.query.roomId
                    })
                }
            }
            if(x <= BALL_RADUIS){
                this.ballData.vx = Math.abs(this.ballData.vx)
            }
            if(x + BALL_RADUIS >= canvas.width){
                this.ballData.vx = -Math.abs(this.ballData.vx)
            }
            if(y <= BALL_RADUIS){
                this.ballData.vy = Math.abs(this.ballData.vy)
            }
            if(y + BALL_RADUIS >= canvas.height){
                this.ballData.vy = -Math.abs(this.ballData.vy)
            }
        },
        movePad(direction){
            const canvas = this.$refs.gameCanvas
            const data = this[this.playingOn === 'left' ? 'leftPadData' : 'rightPadData']
            this.$socket.emit('playerPadMove', {
                roomId: this.$route.query.roomId,
                direction,
                player: this.$route.query.userType === 'challanger' ? 'player' : 'opponent'
            })
            data.y += direction === 'up' ? -PAD_MOVE_SPEED : PAD_MOVE_SPEED
            if(data.y < 0) data.y = 0
            if(percentage(canvas.height, data.y) > canvas.height - PAD_HEIGHT) data.y = (100 * (canvas.height - PAD_HEIGHT)) / canvas.height //
        },
        handleKeydown(e){
            if(e.key === 'ArrowUp') this.movePad('up')
            if(e.key === 'ArrowDown') this.movePad('down')
        },
        markUserReady(){
            this.$socket.emit(this.$route.query.userType === 'challanger' ? 'playerReady' : 'opponentReady', this.$route.query.roomId)
            this.userReady = true
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
        transform: translate(-10%, -41%);
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
            transform: translate(-91%, -53%);
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

.ready-stats{
    text-align: center;
    margin-bottom: 2em;
}
.ready-stats-payer1 .btn{
    margin-bottom: 1em;
    width: 200px;
}
.ready-stats-payer2 span{
    font-weight: 600;
    font-style: italic;
}
.ready-stats-payer2 span.red{
    color: rgb(214, 50, 50);
}
.ready-stats-payer2 span.blue{
    color: #3dcbff;
}
</style>