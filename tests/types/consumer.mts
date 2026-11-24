import { createApp, h } from 'vue';
import EVUI, { EvButton, EvGrid, EvIcon, EvLoading, EvMessage, EvProgress, EvToggle } from 'evui';
import 'evui/style';

const version: string = EVUI.version;
const buttonType: InstanceType<typeof EvButton>['$props']['htmlType'] = 'reset';
const click: NonNullable<InstanceType<typeof EvButton>['$props']['onClick']> = (event) => {
  // @ts-expect-error the payload is a MouseEvent, not a string
  const text: string = event;
  void text;
};
const listener: NonNullable<InstanceType<typeof EvToggle>['$props']['onChange']> = (value) => {
  // @ts-expect-error the payload is a boolean, not a number
  const number: number = value;
  void number;
};
const props: InstanceType<typeof EvGrid>['$props'] = { rows: [], columns: [] };
const colorStops = [{ value: 50, color: 'red' }] as const;
const progressProps: InstanceType<typeof EvProgress>['$props'] = { color: colorStops };
const iconProps: InstanceType<typeof EvIcon>['$props'] = {
  onDblClick: (event: MouseEvent) => event.preventDefault(),
  onContextMenu: (event: MouseEvent) => event.preventDefault(),
};
h(EvProgress, progressProps);
h(EvIcon, iconProps);
const message = EvMessage('Ready');
message?.hide();

createApp({})
  .use(EVUI)
  .use(EvMessage)
  .use(EvGrid)
  .use(EvButton)
  .use(EvToggle)
  .use(EvIcon)
  .use(EvLoading)
  .use(EvProgress);
void [version, buttonType, click, listener, props];
