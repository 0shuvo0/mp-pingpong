<template>
    <div class="container">
      <router-view/>
    </div>
</template>

<style lang="scss">
.container{
  padding: 3em;
  max-width: 1000px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1em;
  margin: auto;
}
</style>