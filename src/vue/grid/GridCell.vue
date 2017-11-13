<template>
    <td v-if="visible"
        class="evui-grid-cell-wrap"
        @click="onClick()"
    >
        <div v-if="readOnly || render == null || render == ''"
             :style="{width:width+'px', height:height+'px'}"
             class="evui-grid-cell">
            {{ this.cellValue }}
        </div>
        <template v-else>
            <div v-if="render=='checkbox'"
                 class="evui-grid-cell"
                 :style="{width:width+'px', height:height+'px'}"
            >
                <checkbox  v-model="cellValue"
                           @onChange="onChange"
                ></checkbox>
            </div>
            <template v-else>
                <div v-if="! isClicked"
                     class="evui-grid-cell"
                     :style="{width:width+'px', height:height+'px'}"
                > {{ this.cellValue }} </div>
                <div v-else
                     class="evui-grid-cell"
                     :style="{width:width+'px', height:height+'px'}"
                >
                    <component :is="render"
                               :style="{width:width+'px', height:height+'px'}"
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
            width: null,
            height: null,
            dataIndex: {
                type: String,
                default: null,
            },
            render: String,
            readOnly: {
                type: Boolean,
                default: false,
            },
            visible: {
                type: Boolean,
                default: true
            },
            value: {
                default: null
            }
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

        },
        methods: {
            onClick() {
                this.isClicked = true;
                this.$emit('cellClick');
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
                if(this.render == 'checkbox'){
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
        width:100%;
        height:100%;
        overflow: hidden;
    }

    .evui-grid-cell {
        border-spacing: 0;
        padding: 0 2px 0 2px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
    }

</style>
