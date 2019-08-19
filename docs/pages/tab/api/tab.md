## Props
| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| v-model | List of tab. <br/> Use v-model to enable a two-way binding. | Array | - |
| active-tab-value | Activates the name of the tab panel | String | first tab |
| disable-tab-moving | Whether to use the tab moving. | Boolean | false |
| disable-remove-tab | Whether to use the tab removing. | Boolean | false |
| min-tab-width | minimum width of tab. Unit is px. | Number | 100 |
## Events
| Event Name | Description | Return Value |
| ---------- | ----------- | ------------ |
| change-tab | Emitted when tab is changed. | arg[0] - before change value of tab <br/> arg[1] - after change value of tab 
| remove-tab | Emitted when tab is removed. | arg[0] - after remove value of tab |
## Tab-Panel Props
| Property | Description | Type | Default |
| -------- | ----------- | ---- | ------- |
| value | the name of the tab panel being activated | String | - |
