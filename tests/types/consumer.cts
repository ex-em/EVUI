import { createApp } from 'vue';
import evui = require('evui');

const buttonType: InstanceType<typeof evui.EvButton>['$props']['htmlType'] = 'button';
// @ts-expect-error htmlType only accepts native button types
const invalidType: InstanceType<typeof evui.EvButton>['$props']['htmlType'] = 'link';
const windowOptions: evui.EvWindowProps = { visible: false, width: 300 };

createApp({}).use(evui.default).use(evui.EvToggle);
void [buttonType, invalidType, windowOptions];
