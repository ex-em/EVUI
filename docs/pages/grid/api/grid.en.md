## Props
| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| v-model | List of row data. <br/> Use v-model to enable a two-way binding. | Array | - |
| columns | List of column data. | Array | - |
| selected | Set which row is selected. <br/> Use the .sync modifier to enable a two-way binding | Array | - |
| checked | Set which rows are checked. | Array | - |
| option.adjust | The columns to fit into the available width | Boolean | false |
| option.showHeader | - | Boolean | true |
| option.stripeRows | - | Boolean | false |
| option.rowHeight | Row fixed width in pixels. | Number | 24 |
| option.columnWidth | Column fixed width in pixels. | Number | 80 |
| option.scrollWidth | - | Number | 16 |
| option.useFilter | - | Boolean | true |
| option.useSelected | Whether the row is selectable | Boolean | true |
| option.useChecked | Whether the row is checkable | Object | use - false <br/> headerCheck - false <br/> mode - single |
| option.customContextMenu | - <br/> [example] <br/> `[`<br/>`{ text: 'test menu', itemId: 'menu1', callback: function },`<br/>`{ text: 'test menu2', itemId: 'menu2', callback: function }`<br/>`]` | Array | - |

## Events
| Event Name | Description | Return Value |
| ---------- | ----------- | ------------ |
| click-row | Emitted when row is selected. | arg[0] - event <br/> arg[1] - index of selected a row <br/> arg[2] - name of selected a column <br/> arg[3] - index of selected a column <br/> arg[4] - data of selected a row |
| check-one | Emitted when checkbox is clicked. | arg[0] - event <br/> arg[1] - index of checked a row <br/> arg[2] - data of checked a row |
| check-all | Emitted when checkbox of header is clicked. | arg[0] - event <br/> arg[1] - List of checked row |
