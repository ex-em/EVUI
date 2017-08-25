export default {
    props : {
        columns : Array,
        data: Array
    },
    methods: {
        test() {
            console.log(this);
        }
    },
    created(){
        console.log(this);
    }
};
