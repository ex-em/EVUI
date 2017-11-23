<template>
    <select id="id"
        v-model="inputValue"
        @input="onInput"
        @blur="onBlur"
    >
        <options v-for="item in options" :value="item.value">{{item.display}}</options>
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
            options: []
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
                options: []
            };
        }
    }
</script>

<style>

</style>
