<template>
  <div class="case">
    <p class="case-title">Common</p>
    <ev-menu
      v-model="menu"
      :items="menuItems"
      @change="menuChange"
    />
    <div class="description">
      <span class="badge">Selected Menu Name</span>
      {{ menu }}
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  setup() {
    const menu = ref(null);
    const menuItems = ref([
      {
        text: 'Menu Text 01',
        value: 'menu01',
        iconClass: 'ev-icon-s-panel-out',
      },
      {
        text: 'Menu Text 02',
        value: 'menu02',
        iconClass: 'ev-icon-s-pause',
        children: [
          {
            text: 'Child Text 02-1',
            value: 'menu02-1',
            iconClass: 'ev-icon-server2',
            expand: false,
            children: [
              {
                text: 'Child Text 02-1-1',
                value: 'menu02-1-1',
              },
              {
                text: 'Child Text 02-1-2',
                value: 'menu02-1-2',
              },
              {
                text: 'Child Text 02-1-3',
                value: 'menu02-1-3',
              },
              {
                text: 'Child Text 02-1-4',
                value: 'menu02-1-4',
              },
            ],
          },
          {
            text: 'Child Text 02-2',
            value: 'menu02-2',
            iconClass: 'ev-icon-server',
          },
          {
            text: 'Child Text 02-3',
            value: 'menu02-3',
            iconClass: 'ev-icon-compress',
            children: [
              {
                text: 'Child Text 02-3-1',
                value: 'menu02-3-1',
                iconClass: 'ev-icon-bell-warning',
              },
              {
                text: 'Child Text 02-3-2',
                value: 'menu02-3-2',
                iconClass: 'ev-icon-expand2',
              },
            ],
          },
        ],
      },
      {
        text: 'Menu Text 03',
        value: 'menu03',
        hidden: true,
        children: [
          {
            text: 'Child Text 03-1',
            value: 'menu03-1',
          },
          {
            text: 'Child Text 03-2',
            value: 'menu03-2',
          },
          {
            text: 'Child Text 03-3',
            value: 'menu03-3',
          },
          {
            text: 'Child Text 03-4',
            value: 'menu03-4',
          },
        ],
      },
      {
        text: 'Menu Text 04',
        value: 'menu04',
      },
      {
        text: 'Menu Text 05',
        value: 'menu05',
        children: [
          {
            text: 'Child Text 05-1',
            value: 'menu05-1',
          },
          {
            text: 'Child Text 05-2',
            value: 'menu05-2',
            iconClass: 'ev-icon-expand',
          },
        ],
      },
    ]);
    const menuChange = (newVal, prevVal) => {
      console.log(newVal, prevVal);
    };

    return {
      menu,
      menuItems,
      menuChange,
    };
  },
};
</script>
