export default {
    props : {
        columns: Array,
        nodeObj: Object
    },
    data: function() {
        return {
            tree : null,
        };
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

            if(this.node.expanded) {
                this.node.expanded = false;
                this.$emit('node-expand', this.node.key, 'collapse');
            }
            else {
                this.node.expanded = true;
                this.$emit('node-expand', this.node.key, 'expand');
            }


        }
    }
};
