<template>
  <div class="outer">
    <div class="group-slot-demo">
      <h5># Use Slot</h5>
      <checkbox-group
        v-model="itemNameList"
      >
        <checkbox
          :label="groupName[0].name"
        />
        <checkbox
          :label="groupName[1].name"
        />
        <checkbox
          :label="groupName[2].name"
        />
      </checkbox-group>
      <p>value List : {{ itemNameList }}</p>
    </div>
    <div class="group-list-demo">
      <h5># Use List</h5>
      <checkbox-group
        :list="groupName"
        v-model="itemNameList"
      />
      <p>value List : {{ itemNameList }}</p>
    </div>
    <hr>
    <div class="box-demo">
      <h5># V-Box</h5>
      <checkbox-group
        :list="groupNameTheOhter"
        :group-align="'vbox'"
        v-model="itemNameListTheOhter"
      />
      <p>value List : {{ itemNameListTheOhter }}</p>
      <h5># H-Box</h5>
      <checkbox-group
        :list="groupNameTheOhter"
        v-model="itemNameListTheOhter"
      />
      <p>value List : {{ itemNameListTheOhter }}</p>
    </div>
    <hr>
    <div class="custom-event-demo">
      <h5># custom event</h5>
      <checkbox
        v-model="checkAll"
        :label="'all check'"
        @on-change="handleCheckAll"
      />
      <checkbox-group
        :list="groupNameAnother"
        v-model="itemNameListAnother"
        @on-change="checkAllGroupChange"
      />
      <p>value List : {{ itemNameListAnother }}</p>
    </div>
    <hr>
    <div class="custom-event-demo">
      <h5># disabled</h5>
      <checkbox-group
        :list="groupNameAnother"
        :disabled="isDisabled"
        v-model="itemNameListAnother"
        @on-change="checkAllGroupChange"
      />
      <button @click="clickEvent">change status</button>
      <p>value List : {{ itemNameListAnother }}</p>
    </div>
  </div>
</template>
<script>
  import '@/styles/evui.css';
  import checkbox from '@/components/checkbox/checkbox';
  import checkboxGroup from '@/components/checkbox/checkbox-group';

  export default {
    components: {
      checkbox,
      checkboxGroup,
    },
    data() {
      return {
        checkAll: false,
        isDisabled: true,
        groupName: [
          {
            name: 'apple',
          },
          {
            name: 'orange',
          },
          {
            name: 'banana',
          },
        ],
        itemNameList: [],
        groupNameAnother: [
          {
            name: 'map',
          },
          {
            name: 'reduce',
          },
          {
            name: 'slice',
          },
        ],
        itemNameListAnother: [],
        groupNameTheOhter: [
          {
            name: 'cheese',
          },
          {
            name: 'ham',
          },
          {
            name: 'egg',
          },
        ],
        itemNameListTheOhter: ['cheese', 'ham'],
      };
    },
    methods: {
      handleCheckAll() {
        if (this.checkAll) {
          this.itemNameListAnother = ['map', 'reduce', 'slice'];
        } else {
          this.itemNameListAnother = [];
        }
      },
      checkAllGroupChange(data) {
        if (data.length === this.groupNameAnother.length) {
          this.checkAll = true;
        } else {
          this.checkAll = false;
        }
      },
      clickEvent() {
        this.isDisabled = !this.isDisabled;
      },
    },
  };
</script>
<style scoped>
  .group-slot-demo {
    padding: 3px;
    width: 300px;
    display: inline-block;
  }
  .group-list-demo {
    padding: 3px;
    width: 300px;
    display: inline-block;
  }
</style>
