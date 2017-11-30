<template>
    <th v-if="visible"
        @click="onClick"
    >
        <div v-if="cellRender=='checkbox'"
             :draggable="draggable"
             :style="{ display:'inline-block',width:'100%' }"
        >
            <checkbox  v-model="cellValue"
                       @onChange="onChange"
            ></checkbox>
        </div>
        <div v-else
             class="grid-column-sort"
             :draggable="draggable"
             :style="{ width: width+'px' }"
             :class="{ active: isActive }"
        >
            {{ this.text }}
            <span v-if="useOrder"
                  class="arrow"
                  :class="order">
            </span>
        </div>
        <span class="filter-icon"  @click="clickFilter" v-if="filter!=='none'">
          <icon name="filter"></icon>
        </span>
        <div v-if="useResize"
             class="grip"
        ></div>
        <div class='filter-popover' v-if="filter!=='none'" @click="clickPopover">
            <input type='text' class='filter-input' @input="filterGrid(dataIndex,$event)">
        </div>
    </th>
</template>

<script>

    import checkbox from '../components/CheckBox.vue';

    export default {
        name: 'evui-grid-header-cell',
        components: {
            checkbox
        },
        props : {
            /**
             * Column의 넓이를 지정합니다.
             */
            width: {
                type: Number,
                default: null
            },
            /**
             * Column의 높이를 지정합니다.
             * @ignore
             */
            height: {
                type: Number,
                default: null
            },
            /**
             * Column을 구분하는 키 값이며, 필수사항 입니다.
             */
            dataIndex: {
                type: String,
                default: null,
            },
            /**
             * Column에 들어갈 문자열 입니다.
             */
            text: {
                type: String,
                default: null,
            },
            /**
             * Column의 Order 기능 사용 여부 입니다.
             */
            useOrder: {
                type: Boolean,
                default: true,
            },
            /**
             * @ignore
             */
            sortKey: {
                type: String,
                default: null,
            },
            /**
             * Column의 Resize 기능 사용 여부 입니다.
             */
            useResize: {
                type: Boolean,
                default: true,
            },
            /**
             * Column의 show/hide 기능 사용 여부 입니다.
             */
            visible: {
                type: Boolean,
                default: true
            },
            /**
             * @ignore
             */
            value: {
                default: null
            },
            /**
             * Column의 표현 방식을 변경 할 수 있습니다.
             * checkbox | textbox | spinner | selectbox
             */
            cellRender: {
                type: String,
                default: null
            },
            /**
             * Column의 Move 기능 사용 여부 입니다.
             */
            draggable: {
                type: Boolean,
                default: true,
            },
            /**
             * Column의 Filter 기능 사용 여부 입니다.
             * none | text
             */
            filter: {
                type: String,
                default : 'none'
            }
        },
        data: function () {
            return {
                cellValue: this.value,
                order: {
                    type: String,
                    default: null,
                }
            }
        },
        watch: {
            value(value) {
                this.cellValue = value;
            }
        },
        computed: {
            isActive() {
                return this.sortKey == this.dataIndex;
            }
        },
        methods: {
            checkOrder(direct) {
                if(! this.useOrder){
                    return false;
                }

                if(direct == 'desc'){
                    this.order = 'asc';
                }else{
                    this.order = 'desc';
                }

                return true;
            },
            onClick(e) {
                if (e.stopPropagation) {
                    e.stopPropagation(); // stops the browser from redirecting.
                }

                if(this.cellRender == 'checkbox'){
                    return;
                }
                this.checkOrder(this.order);

                this.$emit('cellClick', this, this.dataIndex);
            },
            onChange(value){
                if(this.cellRender == 'checkbox'){
                    this.$emit('allCheckChange', this.dataIndex, value);
                }else{
                    this.$emit('cellHeaderChange', this.dataIndex, value);
                }
            },
            onBlur(){
            },
            onInput(){
            },

            clickFilter(e){
                if (e.stopPropagation) {
                    e.stopPropagation(); // stops the browser from redirecting.
                }


                this.$emit('clickFilterIcon', e)
            },

            /**
             * 필터 input 이벤트
             * @param data : col (컬럼 정보)
             * @param e (input 이벤트)
             */
            filterGrid(data,e){
                this.$emit('filterGrid',data,e)
            },

            //th 클릭시 이벤트 버블링 막아줘
            clickPopover(e){
                e.stopPropagation();
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
    }
    .grip {
        width: 5px;
        right:0;
        top: 0;
        bottom:0;
        cursor: col-resize;
        position: absolute;
    }

    .active .arrow {
        opacity: 1;
    }

    .arrow {
        display: inline-block;
        vertical-align: middle;
        width: 0;
        height: 0;
        margin-left: 5px;
        opacity: 0;
    }

    .arrow.asc {
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-bottom: 4px solid #fff;
    }

    .arrow.desc {
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 4px solid #fff;
    }

    .filter-icon {
        /*background-image: url("/src/images/filter-black.png");*/
        width: 16px;
        height: 16px;
        position: absolute;
        right: 5px;
        top: 50%;
        transform: translate(0%,-50%);
    }

    .filter-popover {
        position: fixed;
        background: #fff;
        min-width: 150px;
        border-radius: 4px;
        border: 1px solid #e6ebf5;
        padding: 5px;
        z-index: 2000;
        color: #5a5e66;
        line-height: 1.4;
        text-align: justify;
        word-break: break-all;
        font-size: 14px;
        box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
        display : none;
        cursor: default;
    }

    .filter-input {
        -webkit-appearance: none;
        background-color: #fff;
        background-image: none;
        border-radius: 4px;
        border: 1px solid #d8dce5;
        box-sizing: border-box;
        color: #5a5e66;
        display: inline-block;
        font-size: 12px;
        height: 20px;
        line-height: 1;
        outline: none;
        padding: 0 10px;
        transition: border-color .2s cubic-bezier(.645,.045,.355,1);
        width: 100%;
    }
</style>
