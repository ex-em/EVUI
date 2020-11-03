<template>
  <table
    class="ev-scheduler"
    :class="{ draggable: !!dragEventName }"
  >
    <thead>
      <tr class="ev-scheduler-header">
        <td />
        <td
          v-for="(wItem, wIdx) in widthOptions.count"
          :key="`${wItem}_${wIdx}_header`"
          class="ev-scheduler-header-label"
          @click="selectColumn(wIdx)"
          v-html="widthOptions.labels[wIdx]"
        />
      </tr>
    </thead>
    <tbody @mouseleave="mouseleaveBoxArea">
      <tr
        v-for="(hItem, hIdx) in heightOptions.count"
        :key="`${hItem}_${hIdx}_body`"
        class="ev-scheduler-body"
      >
        <td
          :key="`${hItem}_${hIdx}_${heightOptions.labels[hIdx]}`"
          class="ev-scheduler-body-label"
          @click="selectRow(hIdx)"
          v-html="heightOptions.labels[hIdx]"
        />
        <td
          v-for="(wItem, wIdx) in widthOptions.count"
          :key="`${wItem}_${hIdx}_${wIdx}_body`"
          class="ev-scheduler-body-box"
          :class="{ selected: mv[hIdx][wIdx] }"
          :style="selectionStyle(hIdx, wIdx)"
          @mousedown.stop.prevent="mousedownBox(hIdx, wIdx, $event)"
          @mouseup.stop.prevent="mouseupBox(hIdx, wIdx)"
          @[`${dragEventName}`]="mousemoveBox(hIdx, wIdx)"
        />
      </tr>
    </tbody>
  </table>
</template>

<script>
import { toRefs } from 'vue';
import { useModel, useEvent } from './uses';

export default {
  name: 'EvScheduler',
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    widthOptions: {
      type: Object,
      default: () => ({
        count: 7,
        labels: ['<span style="color: #FF0000">SUN</span>',
          'MON', 'TUE', 'WED', 'THU', 'FRI',
          '<span style="color: #0006F9">SAT</span>',
        ],
      }),
      validator: ({ count, labels }) =>
        (count ? typeof count === 'number' && count > 0 : true)
        && (labels ? Array.isArray(labels) && labels.length === count : true),
    },
    heightOptions: {
      type: Object,
      default: () => ({
        count: 24,
        labels: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
          '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
          '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
          '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
      }),
      validator: ({ count, labels }) =>
        (count ? typeof count === 'number' && count > 0 : true)
        && (labels ? Array.isArray(labels) && labels.length === count : true),
    },
  },
  emits: {
    'update:modelValue': Array,
    change: null,
  },
  setup() {
    const {
      mv,
      validateValue,
    } = useModel();

    validateValue();

    const {
      mousePos,
      selectionStyle,
      mousedownBox,
      mouseupBox,
      mousemoveBox,
      mouseleaveBoxArea,
      selectColumn,
      selectRow,
    } = useEvent({ mv });

    return {
      mv,
      selectionStyle,
      mousedownBox,
      mouseupBox,
      mousemoveBox,
      mouseleaveBoxArea,
      selectColumn,
      selectRow,
      ...toRefs(mousePos),
    };
  },
};
</script>

<style lang="scss">
@import '../../style/index.scss';
.ev-scheduler {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  table-layout: fixed;
  text-align: center;
  font-size: $font-size-small;
  user-select: none;
  cursor: pointer;

  &.draggable {
    cursor: crosshair !important;
  }

  td {
    height: 18px;
  }
}

.ev-scheduler-body-box {
  border: 1px solid #CCCCCC;

  &.selected {
    background-color: #CCEECC;
  }
}

.ev-scheduler-selection {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
