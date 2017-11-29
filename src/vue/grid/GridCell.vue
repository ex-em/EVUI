<template>
    <td v-if="visible"
        class="evui-grid-cell-wrap"
        @click="onClick()"
        @dblclick="onDblClick()"
    >
        <div v-if="readOnly || cellRender == null || cellRender == ''"
             :style="{width:width+'px'}"
             class="evui-grid-cell">
            {{ valueFormat }}
        </div>
        <template v-else>
            <div v-if="cellRender=='checkbox'"
                 class="evui-grid-cell"
                 :style="{display:'inline-block', width:'100%', textAlign:'center'}"
            >
                <checkbox  v-model="cellValue"
                           @onChange="onChange"
                ></checkbox>
            </div>
            <template v-else>
                <div v-if="! isClicked"
                     class="evui-grid-cell"
                     :style="{width:width+'px'}"
                > {{ valueFormat }} </div>
                <div v-else
                     class="evui-grid-cell"
                     :style="{display:'inline-block', width:width+'px'}"
                >
                    <component :is="cellRender"
                               :style="{width:width+'px'}"
                               v-model="cellValue"
                               v-focus
                               @input="onInput"
                               @blur="onBlur"
                    >
                    </component>
                </div>
            </template>
        </template>
    </td>
</template>

<script>
    import textbox from '../components/TextBox.vue';
    import selectbox from '../components/SelectBox.vue';
    import checkbox from '../components/CheckBox.vue';
    import spinner from '../components/Spinner.vue';

    export default {
        directives: {
            focus: {
                inserted: function (el) {
                    el.focus()
                }
            }
        },
        components: {
            textbox,
            selectbox,
            checkbox,
            spinner
        },
        props : {
            /**
             * cell 넓이를 설정합니다.
             */
            width: null,
            /**
             * cell 키 값을 지정합니다.
             */
            dataIndex: {
                type: String,
                default: null,
            },
            /**
             * cell 표현 방식을 변경 할 수 있습니다.
             * checkbox | textbox | spinner | selectbox
             */
            cellRender: String,
            /**
             * cell 값의 수정 여부를 결정합니다.
             */
            readOnly: {
                type: Boolean,
                default: false,
            },
            /**
             *  cell을 보여줄지 여부를 결정합니다.
             *  true: show, false: hide
             */
            visible: {
                type: Boolean,
                default: true
            },
            /**
             * cell 값입니다.
             */
            value: {
                default: null
            },
            /**
             * cell 값의 데이터 타입을 정의합니다.
             */
            dataType: null,
            /**
             * cell 값의 소수점 자릿수를 결정합니다.
             */
            toFixed: {
                type: Number,
                default: 0
            },
            /**
             * cell을 클릭하였을 때 이벤트가 발생됩니다.
             */
            cellClick: null,
            /**
             * cell 더블 클릭하였을 때 이벤트가 발생됩니다.
             */
            cellDblClick: null,
            /**
             * row를 클릭하였을 때 이벤트가 발생됩니다.
             */
            rowClick: null,
            /**
             * row 더블 클릭하였을 때 이벤트가 발생됩니다.
             */
            rowDblClick: null

        },
        data: function () {
            return {
                isClicked: false,
                cellValue: this.value,
            }
        },
        watch: {
            value(value) {
                this.cellValue = value;
            }
        },
        computed: {
            valueFormat(){
                let value;
                switch(this.dataType){
                    case 'number':
                    case 'integer':
                        value =  ~~this.cellValue.toLocaleString();
                        break;
                    case 'float':
//                        value =  this.cellValue.toLocaleString(undefined, { minimumFractionDigits: this.toFixed });
                        value =  (+this.cellValue.toFixed(this.toFixed)).toLocaleString();
                    case 'date':
                    case 'datetime':
                        break;
                    default:
                        value = this.cellValue;
                        break;

                }
                return value;
            },
        },
        methods: {
            onClick() {
                this.isClicked = true;
                this.$emit('cellClick', this.cellValue);
            },
            onDblClick() {
                this.isClicked = true;
                this.$emit('cellDblClick', this.cellValue);
            },
            onBlur(value) {
                this.isClicked = false;
                this.cellValue = value;
                this.$emit('cellBlur');
            },
            onInput(value) {
                this.cellValue = value;
            },
            onChange(value) {
                if(this.cellRender == 'checkbox'){
                    this.$emit('checkChange', this.dataIndex, value);
                }else{
                    this.$emit('cellChange', this.dataIndex, value);
                }
            },

            cls(type) {
                switch (type) {
                    case 'number':
                    case 'integer':
                    case 'numeric':
                    case 'float':
                        return 'text-align-right';
                    case 'date':
                    case 'datetime':
                        return '';
                    case 'checkbox' :
                        return '';
                    default:
                        return '';
                }
            }
        },

        mounted() {

        },
        created() {

        }
    };

</script>
<style>
    .evui-grid-cell-wrap{
        position: relative;
        overflow: hidden;
    }

    .evui-grid-cell {
        border-spacing: 0;
        vertical-align: middle;
        padding: 0 2px 0 2px;
        font-size:12px;
        height: 19px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
    }

</style>
