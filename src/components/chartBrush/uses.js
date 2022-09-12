import { defaultsDeep } from 'lodash-es';

const DEFAULT_OPTIONS = {
  show: true,
  chartIdx: 0,
  height: 100,
  buttonColor: '',
};

// eslint-disable-next-line import/prefer-default-export
export const useBrushModel = () => {
  const getNormalizedBrushOptions = options => defaultsDeep({}, options, DEFAULT_OPTIONS);

  return {
    getNormalizedBrushOptions,
  };
};
