import { defaultsDeep } from 'lodash-es';

const DEFAULT_OPTIONS = {
  toolbar: {
    items: {
      previous: {
        icon: 'ev-icon-allow2-left',
        size: 'medium',
        title: 'Previous',
      },
      latest: {
        icon: 'ev-icon-allow2-right',
        size: 'medium',
        title: 'Latest',
      },
      reset: {
        icon: 'ev-icon-redo',
        size: 'medium',
        title: 'Reset',
      },
      dragZoom: {
        icon: 'ev-icon-zoomin',
        size: 'medium',
        title: 'Drag Zoom',
      },
    },
  },
  bufferMemoryCnt: 100,
};

// eslint-disable-next-line import/prefer-default-export
export const useModel = () => {
  const getNormalizedOptions = options => defaultsDeep({}, options, DEFAULT_OPTIONS);

  return {
    getNormalizedOptions,
  };
};
