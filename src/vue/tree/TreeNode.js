export default {
    props: {
        columns   : Array,
        nodeObj   : Object,
        treeColumn: String
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
        }
    }
};
