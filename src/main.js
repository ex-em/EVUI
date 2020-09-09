import EvCheckBox from '@/components/checkBox';

const components = {
  EvCheckBox,
};

const evui = {
  ...components,
};

const install = (app) => {
  if (!app) {
    return;
  }

  Object.keys(evui).forEach((key) => {
    app.component(key, evui[key]);
  });

  // app.config.globalProperties.$message = () => EvMessage;
  // app.config.globalProperties.$messagebox = () => EvMessageBox;
  // app.config.globalProperties.$notify = () => EvNotification;
};

const API = {
  version: '"2.0"',
  install,
  ...components,
};

export default API;
