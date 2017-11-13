<template>
    <input
        type="search"
        v-model="inputValue"
        @input="onInput"
        @blur="onBlur"
    >
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
            }
        },
        computed: {

        },
        methods: {
            onInput() {
                console.log(arguments)
            },
            onBlur() {
                this.$emit('blur', this.inputValue);
            }
        },
        data(){
            return {
                inputValue: this.value
            };
        }
    }
</script>

<style>

</style>