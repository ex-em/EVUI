<template>
    <div>
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

<style>

</style>