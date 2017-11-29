<template>
    <div class="DocumentB">
        <h1>DocumentB</h1>

        <div>
            <button @click="btnClick()">DocumentB Count++</button> {{ name +' / count: '+ cnt }}
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            contentName: {
                type: String,
                default: 'DocumentB'
            },
            count: {
                type: Number,
                default: 1
            }
        },
        data() {
            return {
                name: this.contentName,
                cnt: this.count
            }
        },
        methods: {
            btnClick() {
                this.cnt += 1;
            }
        },
        mounted() {
        }
    }
</script>

<style scoped>
</style>
