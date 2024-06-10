<template>
  <table
    class="ev-scheduler"
    :class="{ draggable: !!dragEventName }"
  >
    <thead>
      <tr class="ev-scheduler-header">
        <td />
        <td
          v-for="(wItem, wIdx) in colLabels.length"
          :key="`${wItem}_${wIdx}_header`"
          class="ev-scheduler-header-label"
          @click="selectColumn(wIdx)"
          v-html="colLabels[wIdx]"
        />
      </tr>
    </thead>
    <tbody @mouseleave="mouseleaveBoxArea">
      <tr
        v-for="(hItem, hIdx) in rowLabels.length"
        :key="`${hItem}_${hIdx}_body`"
        class="ev-scheduler-body"
      >
        <td
          :key="`${hItem}_${hIdx}_${rowLabels[hIdx]}`"
          class="ev-scheduler-body-label"
          @click="selectRow(hIdx)"
          v-html="rowLabels[hIdx]"
        />
        <td
          v-for="(wItem, wIdx) in colLabels.length"
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
    colLabels: {
      type: Array,
      default: () => [
        '<span style="color: #FF0000">SUN</span>',
        'MON',
        'TUE',
        'WED',
        'THU',
        'FRI',
        '<span style="color: #0006F9">SAT</span>',
      ],
    },
    rowLabels: {
      type: Array,
      default: () => [
        '00:00',
        '01:00',
        '02:00',
        '03:00',
        '04:00',
        '05:00',
        '06:00',
        '07:00',
        '08:00',
        '09:00',
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
        '17:00',
        '18:00',
        '19:00',
        '20:00',
        '21:00',
        '22:00',
        '23:00',
      ],
    },
  },
  emits: {
    'update:modelValue': Array,
    change: Array,
  },
  setup() {
    const { mv, validateValue } = useModel();

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

.ev-scheduler-header-label,
.ev-scheduler-body-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ev-scheduler-body-box {
  border: 1px solid #cccccc;

  &.selected {
    background-color: #cceecc;
  }
}

.ev-scheduler-selection {
  position: absolute;
  top: 0;
  left: 0;
}
</style>
