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
      :width-options="widthOptions"
      :height-options="heightOptions"
    />
    <div class="description">
      {{ checkVal2 }}
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const checkVal1 = ref([]);

    const checkVal2 = ref([]);
    const widthLabels = (cnt) => {
      const result = [];
      for (let i = 0; i < cnt; i++) {
        result.push(`+${i + 1}일`);
      }
      return result;
    };
    const widthOptions = ref({
      count: 15,
      labels: widthLabels(15),
    });

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
    const heightLabels = (cnt) => {
      const result = [];
      for (let i = 0; i < cnt; i++) {
        if (i % 2) {
          result.push(`${lpadToTwoDigits(Math.floor(i / 2))}:30`);
        } else {
          result.push(`${lpadToTwoDigits(i / 2)}:00`);
        }
      }
      return result;
    };
    const heightOptions = ref({
      count: 48,
      labels: heightLabels(48),
    });

    const clearVal1 = () => { checkVal1.value = []; };

    return {
      checkVal1,
      checkVal2,
      widthOptions,
      heightOptions,
      clearVal1,
    };
  },
};
</script>

<style lang="scss">
</style>
