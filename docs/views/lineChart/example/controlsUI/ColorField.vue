<template>
  <div class="color-field">
    <input type="color" class="color-swatch" :value="hex" @input="onHex($event.target.value)" />
    <ev-input-number
      v-if="withAlpha"
      v-model="alpha"
      class="alpha"
      :step="0.05"
      :precision="2"
      :min="0"
      :max="1"
    />
  </div>
</template>

<script>
import { ref, watch } from 'vue';

// EVUI엔 colorPicker 컴포넌트가 없어 네이티브 <input type="color">로 대체.
// 네이티브는 hex만 지원하므로 withAlpha일 때 alpha 슬라이더를 더해 rgba를 합성한다.
export default {
  name: 'ColorField',
  props: {
    modelValue: {
      type: String,
      default: '#000000',
    },
    withAlpha: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const toHex2 = (n) => Math.max(0, Math.min(255, Number(n))).toString(16).padStart(2, '0');

    const parse = (v) => {
      const s = String(v || '').trim();
      const m = s.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/i);
      if (m) {
        return {
          hex: `#${toHex2(m[1])}${toHex2(m[2])}${toHex2(m[3])}`,
          alpha: m[4] !== undefined ? Number(m[4]) : 1,
        };
      }
      if (/^#[0-9a-f]{6}$/i.test(s)) {
        return { hex: s.toLowerCase(), alpha: 1 };
      }
      if (/^#[0-9a-f]{3}$/i.test(s)) {
        const h = s.slice(1);
        return { hex: `#${h[0]}${h[0]}${h[1]}${h[1]}${h[2]}${h[2]}`.toLowerCase(), alpha: 1 };
      }
      return { hex: '#000000', alpha: 1 };
    };

    const initial = parse(props.modelValue);
    const hex = ref(initial.hex);
    const alpha = ref(initial.alpha);

    watch(
      () => props.modelValue,
      (v) => {
        const p = parse(v);
        hex.value = p.hex;
        alpha.value = p.alpha;
      },
    );

    const compose = () => {
      if (!props.withAlpha || alpha.value >= 1) {
        emit('update:modelValue', hex.value);
        return;
      }
      const r = parseInt(hex.value.slice(1, 3), 16);
      const g = parseInt(hex.value.slice(3, 5), 16);
      const b = parseInt(hex.value.slice(5, 7), 16);
      emit('update:modelValue', `rgba(${r}, ${g}, ${b}, ${alpha.value})`);
    };

    const onHex = (v) => {
      hex.value = v;
      compose();
    };
    watch(alpha, compose);

    return { hex, alpha, onHex };
  },
};
</script>

<style lang="scss" scoped>
.color-field {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-swatch {
  width: 44px;
  height: 30px;
  padding: 0;
  border: 1px solid #d0d4da;
  border-radius: 4px;
  background: none;
  cursor: pointer;
}

.alpha {
  flex: 1 1 auto;
  min-width: 84px;
}
</style>
