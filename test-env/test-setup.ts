// 테스트 환경 전역 설정
import { config } from '@vue/test-utils';

// 전역 테스트 설정
config.global.mocks = {
  // 필요한 경우 전역 mocks 설정
};

// 콘솔 경고 무시 설정 (필요한 경우)
const originalError = window.console.error;
// eslint-disable-next-line no-console
window.console.error = (...args: any[]) => {
  if (typeof args[0] === 'string' && args[0].includes('[Vue warn]')) {
    return;
  }
  originalError.call(console, ...args);
};

// 추가 전역 설정이 필요한 경우 여기에 추가
