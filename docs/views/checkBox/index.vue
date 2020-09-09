<template>
  <div class="article-title">
    <h1> CHECK BOX </h1>
  </div>
  <br>
  <h3>일반적인 v-model 사용</h3>
  <br>
  <EvCheckBox
    v-model="checkVal1"
  >
    TEST1
  </EvCheckBox>
  <br>
  {{ checkVal1 }}
  <br><br><br>
  <h3>일반적인 v-model 사용 + change 이벤트 사용</h3>
  <br>
  <EvCheckBox
    v-model="checkVal2"
    @change="onChange"
  >
    TEST2
  </EvCheckBox>
  <br>
  {{ checkVal2 }}
  <br><br><br>
  <h3>disabled</h3>
  <br>
  <EvCheckBox
    v-model="checkVal3"
    disabled
  >
    TEST3
  </EvCheckBox>
  <br>
  {{ checkVal3 }}
  <br><br><br><br>
  <Example
    title="'TITLE'"
    description="'DESC'"
  />
</template>

<script>
import { ref, onMounted } from 'vue';
import Example from '../../components/Example';

export default {
  name: 'CheckBox',
  components: { Example },
  inheritAttrs: false,
  setup() {
    const checkVal1 = ref(true);
    const checkVal2 = ref(false);
    const checkVal3 = ref(false);

    const onChange = (value, e) => {
      console.log(`value: ${value}, e : ${e}`);
    };

    onMounted(() => {
      console.log('onMounted');
    });

    return {
      checkVal1,
      checkVal2,
      checkVal3,
      onChange,
    };
  },
};
</script>
