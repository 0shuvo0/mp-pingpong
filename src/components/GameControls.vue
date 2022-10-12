<template>
    <div class="game-board-controls" :style="{'--color': color}">
        <div class="game-board-control-btn" @click="$emit('btnClick', 'up')">
            <i class="bi bi-chevron-up"></i>
        </div>
        <div class="game-board-control-btn" @click="$emit('btnClick', 'down')">
            <i class="bi bi-chevron-down"></i>
        </div>
    </div>
</template>

<script>
export default {
    props: ['color']
}
</script>

<style lang="scss">
.game-board-controls{
    display: flex;
    gap: 4em;
    margin-top: 2em;
    justify-content: center;
}
.game-board-control-btn{
    height: 60px;
    width: 60px;
    line-height: 60px;
    font-size: 1.6em;
    text-align: center;
    border-radius: 50%;
    border: 2px solid var(--color, #fff);
    color: var(--color, #fff);
    &:hover{
        cursor: pointer;
        background-color: rgba(255, 255, 255, .05);
    }
}
</style>