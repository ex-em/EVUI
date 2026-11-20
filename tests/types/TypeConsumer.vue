<template>
  <EvButton html-type="submit" @click="onClick">Submit</EvButton>
  <EvToggle v-model="enabled" @change="onChange" />
  <EvIcon icon="ev-icon-check" size="small" @dbl-click="onClick" />
  <EvLoading v-model="enabled" :icon-class="null" :icon-style="{ color: 'red' }" />
  <EvProgress :model-value="42" :color="[{ value: 50, color: 'red' }]" />
  <EvGrid :rows="[[1, 'hello']]" />
  <!-- @vue-expect-error -->
  <EvButton html-type="link" />
  <!-- @vue-expect-error -->
  <EvToggle :model-value="'yes'" />
  <!-- @vue-expect-error -->
  <EvProgress :model-value="{}" />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { EvButton, EvGrid, EvIcon, EvLoading, EvProgress, EvToggle } from 'evui';
import 'evui/style';

export default defineComponent({
  components: { EvButton, EvGrid, EvIcon, EvLoading, EvProgress, EvToggle },
  setup() {
    const enabled = ref(false);
    const onChange = (value: boolean) => {
      enabled.value = value;
    };
    const onClick = (event: MouseEvent) => event.preventDefault();

    return { enabled, onChange, onClick };
  },
});
</script>
