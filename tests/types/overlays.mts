import { EvMessage, EvMessageBox, EvNotification, EvWindow } from 'evui';

const windowProps: InstanceType<typeof EvWindow>['$props'] = {
  width: '60vw',
  onResize: (event, position) => {
    event.preventDefault();
    const width: number = position.width;
    void width;
  },
  onMousedownMouseup: (event) => event.preventDefault(),
};
const badWindow: InstanceType<typeof EvWindow>['$props'] = {
  // @ts-expect-error window dimensions cannot be booleans
  width: false,
};

EvMessage({ type: 'success', duration: 1000 }).hide();
EvMessageBox({
  message: 'Continue?',
  onClose: (button) => {
    const action: 'ok' | 'cancel' | undefined = button;
    void action;
  },
});
EvNotification({ position: 'top-left', onClick: () => {} });

// @ts-expect-error duration is a number of milliseconds
EvMessage({ duration: '1000' });
// @ts-expect-error unsupported notification position
EvNotification({ position: 'center' });
void [windowProps, badWindow];
