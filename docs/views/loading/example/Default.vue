<template>
  <div class="case">
    <p class="case-title">Common</p>
    <div class="loading-wrapper">
      <ev-loading v-model="isLoading1" />
      <div> TITLE </div>
      <div> CONTENTS </div>
    </div>
    <div class="description">
      <button
        class="btn"
        @click="changeLoading1"
      >
        click to change loading
      </button>
      &nbsp; {{ isLoading1 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Full Screen</p>
    <div class="loading-wrapper">
      <ev-loading
        v-model="isLoading2"
        :fullscreen="true"
        :click-outside="true"
        :icon-class="'ev-icon-shard'"
        :icon-style="{
          'font-size': '60px',
        }"
      />
      <div> TITLE2 </div>
      <div> CONTENTS2 </div>
    </div>
    <div class="description">
      <button
        class="btn"
        @click="changeLoading2"
      >
        click to change loading
      </button>
      &nbsp; {{ isLoading2 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Custom Loading</p>
    <div class="loading-wrapper">
      <ev-loading
        v-model="isLoading3"
        :click-outside="true"
      >
        <i class="ev-icon-configuration-line ev-loading-icon" />
        <div class="loading-text">
          <span>{{ loadingText }}</span>
        </div>
      </ev-loading>
      <div> TITLE3 </div>
      <div> CONTENTS3 </div>
    </div>
    <div class="description">
      <button
        class="btn"
        @click="changeLoading3"
      >
        click to change loading
      </button>
      &nbsp; {{ isLoading3 }}
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const isLoading1 = ref(false);
    const changeLoading1 = () => {
      isLoading1.value = !isLoading1.value;
    };

    const isLoading2 = ref(false);
    const changeLoading2 = () => {
      isLoading2.value = !isLoading2.value;
    };

    const loadingText = ref('NOW LOADING');
    const isLoading3 = ref(false);
    let timer = null;
    let num = 0;
    const changeLoading3 = () => {
      isLoading3.value = !isLoading3.value;
      if (isLoading3.value) {
        timer = setInterval(() => {
          num++;
          const dotArr = new Array(num % 5).fill('.');
          loadingText.value = `NOW LOADING${dotArr.join('')}`;
        }, 300);
      } else if (!isLoading3.value) {
        clearInterval(timer);
        timer = null;
        num = 0;
        loadingText.value = 'NOW LOADING';
      }
    };

    return {
      isLoading1,
      changeLoading1,
      isLoading2,
      changeLoading2,
      isLoading3,
      changeLoading3,
      loadingText,
    };
  },
};
</script>

<style lang="scss">
.loading-wrapper {
  position: relative;
  width: 400px;
  height: 400px;
  background-color: #5AC8FA;
  overflow: auto;
}
.ev-loading-icon {
  display: inline-block;
  font-size: 25px;
  animation: rotating 2s linear infinite;
}
.loading-text {
  font-size: 12px;
  padding: 10px;
  user-select: none;
}

@keyframes rotating {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0);
  }
}
</style>
