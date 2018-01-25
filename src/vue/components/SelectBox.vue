<template>
    <select id="id"
        v-model="inputValue"
        @input="onInput"
        @blur="onBlur"
    >
        <option v-for="item in optionItems" :key="item.value" :value="item.value">{{item.display}}</option>
    </select>
</template>

<script>
    export default {
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
            options: null
        },
        computed: {

        },
        methods: {
            onInput() {
            },
            onBlur() {
                this.$emit('blur', this.inputValue);
            }
        },
        data(){
            return {
                inputValue: this.value,
                optionItems: this.options
            };
        }
    }
</script>

<style>

</style>
