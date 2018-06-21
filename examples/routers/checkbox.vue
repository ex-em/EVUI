<template>
  <div>
    <div>
      <h4> Basic Check Box </h4>
      <div>
        <checkbox
          v-model="baseCheck[0]"
          :label="base[0].name"
        />
        <checkbox
          v-model="baseCheck[1]"
          :label="base[1].name"
        />
        <checkbox
          v-model="baseCheck[2]"
          :label="base[2].name"
          :disabled="base[2].disabled"
        />
        <checkbox
          v-model="baseCheck[3]"
          :label="base[3].name"
        />
        <checkbox
          v-model="baseCheck[3]"
          :label="base[3].name"
          :disabled="base[3].disabled"
        />
        <h5> No Label </h5>
        <checkbox
          v-model="baseCheck[4]"
        />
        <h5> Raw Values </h5>
        <p>{{ base }}</p>
        <h5> Check List </h5>
        <p>{{ baseCheck }}</p>
        <h5> list handling </h5>
        <div
          v-for="item in baseList"
          :key="item.id"
          style="display:inline-block;"
        >
          <checkbox
            v-model="item.checked"
            :label="item.name"
          />
        </div>
        <p>{{ baseList }}</p>
        <h5> bind custom event </h5>
        <checkbox
          v-model="customEvent.checked"
          :label="customEvent.name"
          @on-change="changeFn"
        />
        <p> change value: {{ customEvent.value }}</p>
      </div>
    </div>
    <div>
      <h4> Basic Check Box Group</h4>
      <h5>Check All Using Custom Change Event</h5>
      <checkbox
        v-model="checkAll"
        :label="'all check'"
        @on-change="handleCheckAll"
      />
      <h5>use slot</h5>
      <checkbox-group
        v-model="itemNameList"
        @on-change="checkAllGroupChange"
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
      <p>{{ itemNameList }}</p>
      <h5>use list</h5>
      <checkbox-group
        :list="groupName"
        v-model="itemNameList"
        @on-change="checkAllGroupChange"
      />
      <p>{{ itemNameList }}</p>
      <h5>vbox / hbox</h5>
      <checkbox-group
        :list="groupName"
        v-model="itemNameList"
        @on-change="checkAllGroupChange"
      />
      <checkbox-group
        :list="groupName"
        :group-align="'vbox'"
        v-model="itemNameList"
        @on-change="checkAllGroupChange"
      />
      <p>{{ itemNameList }}</p>
      <h5> disabled </h5>
      <p>list</p>
      <checkbox-group
        :list="groupName"
        :disabled="checked"
        v-model="itemNameList"
      />
      <p>slot</p>
      <checkbox-group
        v-model="itemNameList"
      >
        <checkbox
          :label="groupName[0].name"
          :disabled="checked"
        />
        <checkbox
          :label="groupName[1].name"
          :disabled="checked"
        />
        <checkbox
          :label="groupName[2].name"
          :disabled="checked"
        />
      </checkbox-group>
      <checkbox
        :label="'checked disabled'"
        v-model="checked"
      />
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
        checked: true,
        baseCheck: [false, false, true, true, true],
        base: [
          {
            name: 'Easy',
          },
          {
            name: 'Normal',
          },
          {
            name: 'Hard',
            disabled: true,
          },
          {
            name: 'Same Bind',
            disabled: true,
          },
        ],
        baseList: [
          {
            name: 'item01',
            checked: false,
          },
          {
            name: 'item02',
            checked: true,
          },
          {
            name: 'item03',
            checked: true,
          },
          {
            name: 'item04',
            checked: false,
          },
        ],
        customEvent: {
          value: '',
          code: 97,
          checked: false,
          name: 'add alphabet when you change',
        },
        groupName: [
          {
            name: 'group01',
          },
          {
            name: 'group02',
          },
          {
            name: 'group03',
          },
        ],
        itemNameList: [],
        checkAll: false,
      };
    },
    methods: {
      changeFn(checked) {
        let value = this.customEvent.value;
        let code = this.customEvent.code;

        if (code === 123) {
          value = '';
          code = 97;
        } else if (checked === true) {
          value += String.fromCharCode(code);
          code++;
        }

        this.customEvent.value = value;
        this.customEvent.code = code;
      },
      handleCheckAll() {
        if (this.checkAll) {
          this.itemNameList = ['group01', 'group02', 'group03'];
        } else {
          this.itemNameList = [];
        }
      },
      checkAllGroupChange(data) {
        if (data.length === this.groupName.length) {
          this.checkAll = true;
        } else {
          this.checkAll = false;
        }
      },
    },
  };
</script>
<style scoped>
  h4 {
    color: mediumseagreen;
  }
  h5 {
    color: darkorange;
  }
</style>
