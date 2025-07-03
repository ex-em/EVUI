import debounce from '../../src/common/utils.debounce';

// Jest의 타이머 모킹을 사용하여 시간 제어
beforeEach(() => {
  jest.useFakeTimers();
  // Date.now 모킹 - debounce 함수에서 시간 계산에 사용
  jest.spyOn(Date, 'now').mockReturnValue(0);

  // requestAnimationFrame 모킹
  global.requestAnimationFrame = jest.fn(cb => setTimeout(cb, 16)); // 16ms는 일반적인 브라우저 프레임률
  global.cancelAnimationFrame = jest.fn(clearTimeout);

  // root 변수 모킹 - debounce 함수에서 사용
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

describe('debounce 함수', () => {
  describe('디버깅 - 기본 동작 확인', () => {
    test('debounce 함수가 올바르게 반환되는지 확인', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      expect(typeof debouncedFn).toBe('function');
      expect(typeof debouncedFn.cancel).toBe('function');
      expect(typeof debouncedFn.flush).toBe('function');
      expect(typeof debouncedFn.pending).toBe('function');
    });

    test('Jest 타이머가 올바르게 작동하는지 확인', () => {
      const mockFn = jest.fn();

      setTimeout(mockFn, 100);
      expect(mockFn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('wait=0일 때 즉시 실행되는지 확인', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 0);

      debouncedFn();
      // wait=0이면 setTimeout(fn, 0)이 호출되므로 바로 실행되어야 함
      jest.runAllTimers();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('flush 메서드가 즉시 실행되는지 확인', () => {
      const mockFn = jest.fn().mockReturnValue('테스트결과');
      const debouncedFn = debounce(mockFn, 100);

      debouncedFn('인수1', '인수2');
      const result = debouncedFn.flush();

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('인수1', '인수2');
      expect(result).toBe('테스트결과');
    });

    test('leading=true일 때 즉시 실행되는지 확인', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100, { leading: true });

      debouncedFn();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('pending 상태 확인', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      expect(debouncedFn.pending()).toBe(false);

      debouncedFn();
      expect(debouncedFn.pending()).toBe(true);

      debouncedFn.cancel();
      expect(debouncedFn.pending()).toBe(false);
    });

    test('실제 타이머 동작 확인 - Date.now 모킹과 함께', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      // 시작 시간: 0ms
      Date.now.mockReturnValue(0);
      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      // 시간 진행 후 shouldInvoke 체크를 위해 Date.now도 진행
      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('실제 타이머 동작 확인 - runAllTimers 사용', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      Date.now.mockReturnValue(0);
      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      // 모든 타이머를 실행하고 시간도 충분히 진행
      Date.now.mockReturnValue(200);
      jest.runAllTimers();
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('시간 진행과 함께 여러 번 호출 테스트', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      // 첫 번째 호출
      Date.now.mockReturnValue(0);
      debouncedFn('첫번째');

      // 50ms 후 두 번째 호출
      Date.now.mockReturnValue(50);
      jest.advanceTimersByTime(50);
      debouncedFn('두번째');

      // 50ms 후 세 번째 호출
      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(50);
      debouncedFn('세번째');

      expect(mockFn).not.toHaveBeenCalled();

      // 마지막 호출 후 100ms 진행
      Date.now.mockReturnValue(200);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('세번째');
    });
  });

  describe('정상 케이스 - 기본 동작', () => {
    test('지정된 시간이 지난 후 함수가 호출되어야 함', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      Date.now.mockReturnValue(0);
      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('여러 번 호출해도 마지막 호출 후 지정 시간이 지나야 실행되어야 함', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      Date.now.mockReturnValue(0);
      debouncedFn();

      Date.now.mockReturnValue(50);
      jest.advanceTimersByTime(50);
      debouncedFn();

      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(50);
      debouncedFn();

      expect(mockFn).not.toHaveBeenCalled();

      Date.now.mockReturnValue(200);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('마지막 호출의 인수로 함수가 실행되어야 함', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      Date.now.mockReturnValue(0);
      debouncedFn('첫번째');
      debouncedFn('두번째');
      debouncedFn('세번째');

      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith('세번째');
    });

    test('함수의 반환값을 올바르게 반환해야 함', () => {
      const mockFn = jest.fn().mockReturnValue('결과값');
      const debouncedFn = debounce(mockFn, 100);

      Date.now.mockReturnValue(0);
      debouncedFn();
      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);

      const result = debouncedFn.flush();
      expect(result).toBe('결과값');
    });
  });

  describe('정상 케이스 - leading 옵션', () => {
    test('leading이 true일 때 즉시 실행되어야 함', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100, { leading: true });

      Date.now.mockReturnValue(0);
      debouncedFn();
      expect(mockFn).toHaveBeenCalledTimes(1);

      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('leading과 trailing이 모두 true일 때 두 번 실행되어야 함', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100, { leading: true, trailing: true });

      Date.now.mockReturnValue(0);
      debouncedFn();
      expect(mockFn).toHaveBeenCalledTimes(1);

      Date.now.mockReturnValue(50);
      jest.advanceTimersByTime(50);
      debouncedFn();

      Date.now.mockReturnValue(150);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    test('leading이 true이고 trailing이 false일 때 한 번만 실행되어야 함', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100, { leading: true, trailing: false });

      Date.now.mockReturnValue(0);
      debouncedFn();
      expect(mockFn).toHaveBeenCalledTimes(1);

      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('정상 케이스 - maxWait 옵션', () => {
    test('maxWait 시간이 지나면 강제로 실행되어야 함', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100, { maxWait: 150 });

      Date.now.mockReturnValue(0);
      debouncedFn();

      Date.now.mockReturnValue(50);
      jest.advanceTimersByTime(50);
      debouncedFn();

      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(50);
      debouncedFn();

      Date.now.mockReturnValue(150);
      jest.advanceTimersByTime(50);

      // maxWait 시간(150ms)이 지났으므로 실행되어야 함
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('maxWait가 wait보다 작을 때 wait 값으로 보정되어야 함', () => {
      const mockFn = jest.fn();
      // maxWait가 wait보다 작으면 Math.max로 인해 wait 값으로 보정됨
      const debouncedFn = debounce(mockFn, 200, { maxWait: 100 });

      Date.now.mockReturnValue(0);
      debouncedFn();

      // 100ms 후에는 실행되지 않음 (실제 maxWait는 200ms로 보정됨)
      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(mockFn).not.toHaveBeenCalled();

      // 200ms 후에 실행됨
      Date.now.mockReturnValue(200);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('maxWait가 wait보다 클 때 정상적으로 maxWait 제한이 동작해야 함', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 200, { maxWait: 300 });

      Date.now.mockReturnValue(0);
      debouncedFn();

      // 150ms 후 다시 호출 (wait 시간을 리셋)
      Date.now.mockReturnValue(150);
      jest.advanceTimersByTime(150);
      debouncedFn();

      // 150ms 더 진행 (총 300ms, maxWait 시간 도달)
      Date.now.mockReturnValue(300);
      jest.advanceTimersByTime(150);

      // maxWait(300ms) 시간이 지났으므로 강제로 실행되어야 함
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('정상 케이스 - cancel 메서드', () => {
    test('cancel 호출 시 대기 중인 실행이 취소되어야 함', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      Date.now.mockReturnValue(0);
      debouncedFn();
      debouncedFn.cancel();

      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(mockFn).not.toHaveBeenCalled();
    });

    test('cancel 후 다시 호출하면 정상 동작해야 함', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      Date.now.mockReturnValue(0);
      debouncedFn();
      debouncedFn.cancel();

      Date.now.mockReturnValue(50);
      debouncedFn();

      Date.now.mockReturnValue(150);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('정상 케이스 - flush 메서드', () => {
    test('flush 호출 시 즉시 실행되어야 함', () => {
      const mockFn = jest.fn().mockReturnValue('즉시실행결과');
      const debouncedFn = debounce(mockFn, 100);

      Date.now.mockReturnValue(0);
      debouncedFn();
      const result = debouncedFn.flush();

      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(result).toBe('즉시실행결과');
    });

    test('flush 후 타이머는 정리되어야 함', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      Date.now.mockReturnValue(0);
      debouncedFn();
      debouncedFn.flush();

      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1); // flush로 한 번만 실행
    });

    test('대기 중인 호출이 없을 때 flush하면 이전 결과를 반환해야 함', () => {
      const mockFn = jest.fn().mockReturnValue('이전결과');
      const debouncedFn = debounce(mockFn, 100);

      Date.now.mockReturnValue(0);
      debouncedFn();
      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);

      const result = debouncedFn.flush();
      expect(result).toBe('이전결과');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('정상 케이스 - pending 메서드', () => {
    test('대기 중일 때 pending이 true를 반환해야 함', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      expect(debouncedFn.pending()).toBe(false);

      Date.now.mockReturnValue(0);
      debouncedFn();
      expect(debouncedFn.pending()).toBe(true);

      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(debouncedFn.pending()).toBe(false);
    });

    test('cancel 후 pending이 false를 반환해야 함', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      Date.now.mockReturnValue(0);
      debouncedFn();
      expect(debouncedFn.pending()).toBe(true);

      debouncedFn.cancel();
      expect(debouncedFn.pending()).toBe(false);
    });

    test('flush 후 pending이 false를 반환해야 함', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      Date.now.mockReturnValue(0);
      debouncedFn();
      expect(debouncedFn.pending()).toBe(true);

      debouncedFn.flush();
      expect(debouncedFn.pending()).toBe(false);
    });
  });

  describe('엣지 케이스 - wait 값 처리', () => {
    test('wait이 0일 때 다음 틱에 실행되어야 함', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 0);

      Date.now.mockReturnValue(0);
      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      Date.now.mockReturnValue(0);
      jest.advanceTimersByTime(0);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('wait이 undefined일 때 requestAnimationFrame이 사용되어야 함', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn);

      Date.now.mockReturnValue(0);
      debouncedFn();
      expect(mockFn).not.toHaveBeenCalled();

      // requestAnimationFrame은 16ms로 모킹됨
      Date.now.mockReturnValue(16);
      jest.advanceTimersByTime(16);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('wait이 문자열일 때 숫자로 변환되어야 함', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, '100');

      Date.now.mockReturnValue(0);
      debouncedFn();
      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('wait이 NaN일 때 requestAnimationFrame이 사용되어야 함', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, NaN);

      Date.now.mockReturnValue(0);
      debouncedFn();

      // NaN도 falsy이고 0이 아니므로 useRAF가 true가 됨
      Date.now.mockReturnValue(16);
      jest.advanceTimersByTime(16);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('엣지 케이스 - options 처리', () => {
    test('options가 null일 때 기본값이 적용되어야 함', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100, null);

      Date.now.mockReturnValue(0);
      debouncedFn();
      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('options가 undefined일 때 기본값이 적용되어야 함', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100, undefined);

      Date.now.mockReturnValue(0);
      debouncedFn();
      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('leading과 trailing이 모두 false일 때 실행되지 않아야 함', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100, { leading: false, trailing: false });

      Date.now.mockReturnValue(0);
      debouncedFn();
      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(mockFn).not.toHaveBeenCalled();
    });

    test('options에 잘못된 타입의 값이 있어도 처리되어야 함', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100, {
        leading: 'true', // truthy 값
        trailing: '', // falsy 값
        maxWait: 'abc', // 잘못된 숫자
      });

      Date.now.mockReturnValue(0);
      debouncedFn();
      expect(mockFn).toHaveBeenCalledTimes(1); // leading이 truthy이므로 즉시 실행

      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1); // trailing이 falsy이므로 추가 실행 없음
    });
  });

  describe('엣지 케이스 - this 컨텍스트', () => {
    test('this 컨텍스트가 올바르게 전달되어야 함', () => {
      const obj = {
        value: 42,
        getValue: jest.fn(function () {
          return this.value;
        }),
      };

      const debouncedGetValue = debounce(obj.getValue, 100);
      Date.now.mockReturnValue(0);
      debouncedGetValue.call(obj);

      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(obj.getValue).toHaveBeenCalledTimes(1);
    });

    test('arrow function에서는 this가 유지되어야 함', () => {
      const mockFn = jest.fn(() => 'arrow function result');
      const debouncedFn = debounce(mockFn, 100);

      Date.now.mockReturnValue(0);
      debouncedFn();
      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('에러 케이스 - 잘못된 함수 입력', () => {
    test('func가 함수가 아닐 때 TypeError를 발생시켜야 함', () => {
      expect(() => debounce(null, 100)).toThrow(TypeError);
      expect(() => debounce(null, 100)).toThrow('Expected a function');
    });

    test('func가 undefined일 때 TypeError를 발생시켜야 함', () => {
      expect(() => debounce(undefined, 100)).toThrow(TypeError);
      expect(() => debounce(undefined, 100)).toThrow('Expected a function');
    });

    test('func가 문자열일 때 TypeError를 발생시켜야 함', () => {
      expect(() => debounce('not a function', 100)).toThrow(TypeError);
      expect(() => debounce('not a function', 100)).toThrow('Expected a function');
    });

    test('func가 숫자일 때 TypeError를 발생시켜야 함', () => {
      expect(() => debounce(123, 100)).toThrow(TypeError);
      expect(() => debounce(123, 100)).toThrow('Expected a function');
    });

    test('func가 객체일 때 TypeError를 발생시켜야 함', () => {
      expect(() => debounce({}, 100)).toThrow(TypeError);
      expect(() => debounce({}, 100)).toThrow('Expected a function');
    });

    test('func가 배열일 때 TypeError를 발생시켜야 함', () => {
      expect(() => debounce([], 100)).toThrow(TypeError);
      expect(() => debounce([], 100)).toThrow('Expected a function');
    });
  });

  describe('에러 케이스 - 비정상적인 사용', () => {
    test('함수가 예외를 던져도 debounce는 정상 작동해야 함', () => {
      const mockFn = jest.fn(() => {
        throw new Error('함수 내부 에러');
      });
      const debouncedFn = debounce(mockFn, 100);

      Date.now.mockReturnValue(0);
      debouncedFn();

      expect(() => {
        Date.now.mockReturnValue(100);
        jest.advanceTimersByTime(100);
      }).toThrow('함수 내부 에러');

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('여러 번 cancel 호출해도 에러가 발생하지 않아야 함', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      expect(() => {
        debouncedFn.cancel();
        debouncedFn.cancel();
        debouncedFn.cancel();
      }).not.toThrow();
    });

    test('아무것도 호출하지 않고 flush해도 에러가 발생하지 않아야 함', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      expect(() => {
        debouncedFn.flush();
      }).not.toThrow();
    });
  });

  describe('성능 케이스 - 대량 호출', () => {
    test('짧은 시간에 많은 호출이 있어도 한 번만 실행되어야 함', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      Date.now.mockReturnValue(0);
      // 1000번 연속 호출
      for (let i = 0; i < 1000; i++) {
        debouncedFn(`호출 ${i}`);
      }

      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('호출 999'); // 마지막 인수로 호출
    });

    test('복잡한 인수도 올바르게 처리되어야 함', () => {
      const mockFn = jest.fn();
      const debouncedFn = debounce(mockFn, 100);

      const complexArg = {
        nested: { deep: { value: 42 } },
        array: [1, 2, 3],
        func: () => 'test',
      };

      Date.now.mockReturnValue(0);
      debouncedFn(complexArg, 'second arg', null, undefined);

      Date.now.mockReturnValue(100);
      jest.advanceTimersByTime(100);
      expect(mockFn).toHaveBeenCalledWith(complexArg, 'second arg', null, undefined);
    });
  });
});
