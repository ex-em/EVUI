import throttle from '../../src/common/utils.throttle';

// Jest의 타이머 모킹을 사용하여 시간 제어
beforeEach(() => {
  jest.useFakeTimers();
  // Date.now 모킹 - throttle 함수에서 시간 계산에 사용
  jest.spyOn(Date, 'now').mockReturnValue(0);

  // requestAnimationFrame 모킹
  global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16)); // 16ms는 일반적인 브라우저 프레임률
  global.cancelAnimationFrame = jest.fn(clearTimeout);

  // root 변수 모킹 - throttle이 내부적으로 debounce를 사용하므로 필요
  global.root = {
    requestAnimationFrame: global.requestAnimationFrame,
  };
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
  // Date.now 모킹 해제
  Date.now.mockRestore();
  // requestAnimationFrame 모킹 해제
  delete global.requestAnimationFrame;
  delete global.cancelAnimationFrame;
  // root 모킹 해제
  delete global.root;
});

describe('throttle 함수', () => {
  describe('디버깅 - 기본 동작 확인', () => {
    test('throttle 함수가 올바르게 반환되는지 확인', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      expect(typeof throttledFn).toBe('function');
      expect(typeof throttledFn.cancel).toBe('function');
      expect(typeof throttledFn.flush).toBe('function');
      expect(typeof throttledFn.pending).toBe('function');
    });

    test('wait=0일 때 즉시 실행되는지 확인', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 0);

      throttledFn();
      // throttle은 기본적으로 leading=true이므로 즉시 실행되어야 함
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('flush 메서드가 즉시 실행되는지 확인', () => {
      const mockFn = jest.fn().mockReturnValue('테스트결과');
      const throttledFn = throttle(mockFn, 100);

      throttledFn('인수1', '인수2');
      expect(mockFn).toHaveBeenCalledTimes(1); // leading 실행

      throttledFn('다른인수');
      const result = throttledFn.flush();

      expect(mockFn).toHaveBeenCalledTimes(2); // leading + flush로 trailing 실행
      expect(mockFn).toHaveBeenLastCalledWith('다른인수');
      expect(result).toBe('테스트결과');
    });

    test('pending 상태 확인', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      expect(throttledFn.pending()).toBe(false);

      throttledFn();
      // throttle은 즉시 실행 후에도 trailing 실행을 위해 pending이 될 수 있음
      expect(throttledFn.pending()).toBe(true);

      throttledFn.cancel();
      expect(throttledFn.pending()).toBe(false);
    });
  });

  describe('정상 케이스 - 기본 동작 (leading=true, trailing=true)', () => {
    test('첫 호출 시 즉시 실행되어야 함 (leading=true)', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      Date.now.mockReturnValue(0);
      throttledFn();

      // throttle은 기본적으로 leading=true이므로 즉시 실행
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('wait 시간 내 여러 호출 시 leading 1회 + trailing 1회만 실행되어야 함', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      Date.now.mockReturnValue(0);
      throttledFn('첫번째');
      expect(mockFn).toHaveBeenCalledTimes(1); // leading 실행
      expect(mockFn).toHaveBeenLastCalledWith('첫번째');

      // wait 시간 내에 추가 호출들
      Date.now.mockReturnValue(30);
      jest.advanceTimersByTime(30);
      throttledFn('두번째');

      Date.now.mockReturnValue(60);
      jest.advanceTimersByTime(30);
      throttledFn('세번째');

      Date.now.mockReturnValue(90);
      jest.advanceTimersByTime(30);
      throttledFn('네번째');

      expect(mockFn).toHaveBeenCalledTimes(1); // 아직 leading만 실행됨

      // wait 시간 완료 후 trailing 실행
      Date.now.mockReturnValue(200);
      jest.advanceTimersByTime(110);
      expect(mockFn).toHaveBeenCalledTimes(2); // leading + trailing
      expect(mockFn).toHaveBeenLastCalledWith('네번째'); // 마지막 인수로 실행
    });

    test('wait 시간 이후 다시 호출하면 새로운 cycle 시작', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      // 첫 번째 cycle
      Date.now.mockReturnValue(0);
      throttledFn('첫번째cycle');
      expect(mockFn).toHaveBeenCalledTimes(1);

      // wait 시간 완료
      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1); // trailing 없음 (단일 호출)

      // 새로운 cycle 시작
      Date.now.mockReturnValue(200);
      throttledFn('두번째cycle');
      expect(mockFn).toHaveBeenCalledTimes(2); // 새로운 leading 실행
      expect(mockFn).toHaveBeenLastCalledWith('두번째cycle');
    });

    test('연속된 호출에서 각 wait 구간마다 최대 2회씩 실행 (leading + trailing)', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      // 첫 번째 구간 (0-100ms)
      Date.now.mockReturnValue(0);
      throttledFn('1-1');
      throttledFn('1-2');
      throttledFn('1-3');
      expect(mockFn).toHaveBeenCalledTimes(1); // leading

      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(2); // + trailing
      expect(mockFn).toHaveBeenLastCalledWith('1-3');

      // 두 번째 구간 - 충분한 간격을 두고 시작 (250-350ms)
      Date.now.mockReturnValue(250);
      jest.advanceTimersByTime(150);
      throttledFn('2-1');
      throttledFn('2-2');
      expect(mockFn).toHaveBeenCalledTimes(3); // 새로운 leading

      Date.now.mockReturnValue(350);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(4); // + trailing
      expect(mockFn).toHaveBeenLastCalledWith('2-2');
    });
  });

  describe('leading 옵션 테스트', () => {
    test('leading=false일 때 첫 호출 시 즉시 실행되지 않아야 함', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100, { leading: false });

      Date.now.mockReturnValue(0);
      throttledFn('첫번째');

      expect(mockFn).not.toHaveBeenCalled(); // leading=false이므로 즉시 실행 안됨

      // wait 시간 후 trailing 실행
      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('첫번째');
    });

    test('leading=false일 때 wait 시간 내 여러 호출 시 trailing만 실행', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100, { leading: false });

      Date.now.mockReturnValue(0);
      throttledFn('첫번째');
      throttledFn('두번째');
      throttledFn('세번째');

      expect(mockFn).not.toHaveBeenCalled();

      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('세번째'); // 마지막 인수
    });

    test('leading=true일 때 정상 동작 확인', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100, { leading: true });

      Date.now.mockReturnValue(0);
      throttledFn('첫번째');

      expect(mockFn).toHaveBeenCalledTimes(1); // 즉시 실행
      expect(mockFn).toHaveBeenCalledWith('첫번째');
    });
  });

  describe('trailing 옵션 테스트', () => {
    test('trailing=false일 때 wait 시간 후 추가 실행되지 않아야 함', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100, { trailing: false });

      Date.now.mockReturnValue(0);
      throttledFn('첫번째');
      expect(mockFn).toHaveBeenCalledTimes(1); // leading 실행

      throttledFn('두번째');
      throttledFn('세번째');

      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1); // trailing 실행 안됨
    });

    test('trailing=true일 때 wait 시간 후 마지막 호출 실행', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100, { trailing: true });

      Date.now.mockReturnValue(0);
      throttledFn('첫번째');
      expect(mockFn).toHaveBeenCalledTimes(1); // leading 실행

      throttledFn('두번째');
      throttledFn('세번째');

      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(2); // trailing 실행됨
      expect(mockFn).toHaveBeenLastCalledWith('세번째');
    });

    test('leading=false, trailing=false일 때 실행되지 않아야 함', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100, { leading: false, trailing: false });

      Date.now.mockReturnValue(0);
      throttledFn('첫번째');
      throttledFn('두번째');

      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(mockFn).not.toHaveBeenCalled();
    });
  });

  describe('cancel 및 flush 메서드 테스트', () => {
    test('cancel 호출 시 pending된 실행이 취소되어야 함', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      Date.now.mockReturnValue(0);
      throttledFn('첫번째');
      expect(mockFn).toHaveBeenCalledTimes(1); // leading 실행

      throttledFn('두번째');
      throttledFn.cancel(); // trailing 취소

      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1); // trailing 실행 안됨
    });

    test('flush 호출 시 pending된 함수가 즉시 실행되어야 함', () => {
      const mockFn = jest.fn().mockReturnValue('결과값');
      const throttledFn = throttle(mockFn, 100);

      Date.now.mockReturnValue(0);
      throttledFn('첫번째');
      expect(mockFn).toHaveBeenCalledTimes(1); // leading 실행

      throttledFn('두번째');
      const result = throttledFn.flush(); // 즉시 실행

      expect(mockFn).toHaveBeenCalledTimes(2); // leading + flush
      expect(mockFn).toHaveBeenLastCalledWith('두번째');
      expect(result).toBe('결과값');
    });

    test('flush 후 pending 상태가 해제되어야 함', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100);

      throttledFn('테스트');
      expect(throttledFn.pending()).toBe(true);

      throttledFn.flush();
      expect(throttledFn.pending()).toBe(false);
    });
  });

  describe('에러 케이스', () => {
    test('func이 함수가 아닐 때 TypeError 발생', () => {
      expect(() => throttle(null, 100)).toThrow(TypeError);
      expect(() => throttle(undefined, 100)).toThrow(TypeError);
      expect(() => throttle('string', 100)).toThrow(TypeError);
      expect(() => throttle(123, 100)).toThrow(TypeError);
      expect(() => throttle({}, 100)).toThrow(TypeError);
    });

    test('func이 함수가 아닐 때 에러 메시지 확인', () => {
      expect(() => throttle(null, 100)).toThrow('Expected a function');
    });
  });

  describe('실제 사용 시나리오', () => {
    test('스크롤 이벤트 시뮬레이션 - 100ms마다 최대 1회 실행', () => {
      const updatePosition = jest.fn();
      const throttledUpdate = throttle(updatePosition, 100);

      // 빠른 스크롤 이벤트 시뮬레이션 (10ms마다 발생)
      for (let i = 0; i < 10; i++) {
        Date.now.mockReturnValue(i * 10);
        jest.advanceTimersByTime(10);
        throttledUpdate(`position-${i}`);
      }

      expect(updatePosition).toHaveBeenCalledTimes(1); // leading만 실행됨

      // 100ms 완료 후 trailing 실행
      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(10);
      expect(updatePosition).toHaveBeenCalledTimes(2); // leading + trailing
      expect(updatePosition).toHaveBeenLastCalledWith('position-9');
    });

    test('API 호출 제한 시나리오 - trailing=false로 중복 호출 방지', () => {
      const apiCall = jest.fn();
      const throttledApiCall = throttle(apiCall, 300, { trailing: false });

      // 사용자가 빠르게 버튼을 여러 번 클릭
      Date.now.mockReturnValue(0);
      throttledApiCall('request-1');
      expect(apiCall).toHaveBeenCalledTimes(1);

      Date.now.mockReturnValue(50);
      jest.advanceTimersByTime(50);
      throttledApiCall('request-2');

      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(50);
      throttledApiCall('request-3');

      // 300ms 후에도 추가 호출 없음 (trailing=false)
      Date.now.mockReturnValue(300);
      jest.advanceTimersByTime(200);
      expect(apiCall).toHaveBeenCalledTimes(1);
    });

    test('리사이즈 이벤트 시나리오', () => {
      const handleResize = jest.fn();
      const throttledResize = throttle(handleResize, 150);

      // 연속된 리사이즈 이벤트
      const resizeEvents = [0, 20, 40, 60, 80, 100, 120, 160, 180];

      resizeEvents.forEach((time, index) => {
        Date.now.mockReturnValue(time);
        if (index > 0) {
          jest.advanceTimersByTime(20);
        }
        throttledResize(`resize-${index}`);
      });

      expect(handleResize).toHaveBeenCalledTimes(2);

      // 150ms 후 trailing 실행
      Date.now.mockReturnValue(300);
      jest.advanceTimersByTime(140);
      expect(handleResize).toHaveBeenCalledTimes(2);
      expect(handleResize).toHaveBeenLastCalledWith('resize-7');
    });
  });

  describe('옵션 조합 테스트', () => {
    test('leading=true, trailing=true (기본값)', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100, { leading: true, trailing: true });

      Date.now.mockReturnValue(0);
      throttledFn('1');
      throttledFn('2');
      expect(mockFn).toHaveBeenCalledTimes(1); // leading

      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(2); // + trailing
    });

    test('leading=true, trailing=false', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100, { leading: true, trailing: false });

      Date.now.mockReturnValue(0);
      throttledFn('1');
      throttledFn('2');
      expect(mockFn).toHaveBeenCalledTimes(1); // leading

      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1); // trailing 없음
    });

    test('leading=false, trailing=true', () => {
      const mockFn = jest.fn();
      const throttledFn = throttle(mockFn, 100, { leading: false, trailing: true });

      Date.now.mockReturnValue(0);
      throttledFn('1');
      throttledFn('2');
      expect(mockFn).not.toHaveBeenCalled(); // leading 없음

      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1); // trailing만
      expect(mockFn).toHaveBeenCalledWith('2');
    });
  });
});
