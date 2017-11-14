<template>
    <div class="evui-comp-checkbox" style="text-align: center">
        <input  type="checkbox"
                :id="id"
                :name="name"
                :value="value"
                :checked="checkValue"
                @change="onChange"
                >
        <label :for="id">
            <slot></slot>
        </label>
    </div>
</template>

<script>
    export default {
        model: {
            prop: 'checked',
            event: 'onChange'
        },
        props: {
            id: {
                type: String,
                default: function () {
                    return 'evui-' + this._uid;
                },
            },
            name: {
                type: String,
                default: null,
            },
            value: {
                default: null,
            },
            checked: {
                type: Boolean,
                default: false,
            },
            state: {
                type: Boolean,
                default: false
            }
        },
        computed: {
        },
        watch: {
            checked() {
                this.checkValue = this.checked;
            }
        },
        methods: {
            onChange() {
                this.checkValue = !this.checkValue;
                this.$emit('onChange', this.checkValue);
            }
        },
        data() {
            return {
                checkValue: this.checked
            }
        }
    }
</script>

<style scoped>
    .evui-comp-checkbox {
        position: relative;
        display:inline-block;
    }

    .evui-comp-checkbox label {
        width: 11px;
        height: 11px;
        cursor: pointer;
        position: absolute;
        top: 6px;
        left: 4px;
        background-color: #ffffff;
        border-radius: 2px;
        border : 1px solid #bfcbd9;
    }

    .evui-comp-checkbox label:after {
        content: '';
        width: 7px;
        height: 3px;
        position: absolute;
        top: 2px;
        left: 1px;
        border: 2px solid #333;
        border-top: none;
        border-right: none;
        background: transparent;
        opacity: 0;
        -webkit-transform: rotate(-45deg);
        transform: rotate(-45deg);
    }
    .evui-comp-checkbox label:hover::after {
        opacity: 0.5;
    }
    .evui-comp-checkbox input[type=checkbox] {
        visibility: hidden;
    }
    .evui-comp-checkbox input[type=checkbox]:checked + label:after {
        opacity: 1;
    }
</style>