import checkbox from '../components/CheckBox.vue';

export default {
    props: {
        columns    : Array,
        nodeObj    : Object,
        treeColumn : String,
        useCheckBox: Boolean
    },
    computed: {
        node() {
            return this.nodeObj;
        }
    },
    methods: {
        toggleExpandNode() {
            if(this.node.isLeaf) {
                return;
            }

            let expandMode = !this.node.expanded;
            this.$emit('node-expand', this.node, expandMode);
        },

        onChange(checkValue) {
            this.$emit('node-checked', this.node, checkValue);
        }
    },
    components: {
        checkbox
    }
};
