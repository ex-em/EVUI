import { defaultsDeep } from 'lodash-es';

const DEFAULT_OPTIONS = {
  icon: {
    type: {
      reset: '',
      previous: '',
      latest: '',
      dragZoom: '',
    },
    size: 'medium',
    color: '#0D0D0D',
    hoverColor: '#1a6afe',
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
