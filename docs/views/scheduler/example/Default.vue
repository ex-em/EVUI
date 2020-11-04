<template>
  <div class="case">
    <p class="case-title">Common</p>
    <ev-scheduler
      v-model="checkVal1"
    />
    <div class="description">
      <span
        class="badge"
        @click="clearVal1"
      >
        Clear
      </span>
      {{ checkVal1 }}
    </div>
  </div>
  <div class="case">
    <p class="case-title">Custom</p>
    <ev-scheduler
      v-model="checkVal2"
      :col-labels="widthLabels()"
      :row-labels="heightLabels()"
    />
    <div class="description">
      {{ checkVal2 }}
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

/**
 * 월, 일을 두자리 숫자로 보정
 * @param num
 * @returns {string|*}
 */
const lpadToTwoDigits = (num) => {
  if (num === null) {
    return '00';
  } else if (+num < 10) {
    return `0${num}`;
  }
  return num;
};

export default {
  setup() {
    const checkVal1 = ref([]);
    const clearVal1 = () => { checkVal1.value = []; };

    const checkVal2 = ref([]);
    const widthLabels = () => {
      const result = [];
      for (let i = 0; i < 15; i++) {
        result.push(`+${i + 1}일`);
      }
      return result;
    };
    const heightLabels = () => {
      const result = [];
      for (let i = 0; i < 48; i++) {
        if (i % 2) {
          result.push(`${lpadToTwoDigits(Math.floor(i / 2))}:30`);
        } else {
          result.push(`${lpadToTwoDigits(i / 2)}:00`);
        }
      }
      return result;
    };

    return {
      checkVal1,
      clearVal1,
      checkVal2,
      widthLabels,
      heightLabels,
    };
  },
};
</script>

<style lang="scss">
</style>
