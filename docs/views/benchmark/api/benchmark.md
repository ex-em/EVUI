# Chart Performance Benchmark

## Overview

Chart 컴포넌트의 성능을 측정하는 도구입니다.

## Metrics

| Metric | Description |
|--------|-------------|
| Initial Render | 차트 초기 렌더링에 소요되는 시간 (ms) |
| Avg Update | 데이터 업데이트 시 평균 렌더링 시간 (ms) |
| FPS | 초당 프레임 수 (Frames Per Second) |
| Memory | 차트가 사용하는 메모리 (MB) |

## How to Use

1. **Chart Type**: 테스트할 차트 타입을 선택합니다 (Line, Bar, Scatter)
2. **Data Size**: 테스트할 데이터 개수를 선택합니다 (1,000 ~ 100,000)
3. **Series Count**: 시리즈 개수를 선택합니다 (1 ~ 10)
4. **Run Benchmark**: 초기 렌더링 성능을 측정합니다
5. **Update Test**: 데이터 업데이트 성능을 10회 측정하여 평균을 계산합니다

## Performance Indicators

### FPS (Frames Per Second)
- **55+**: Good (Green)
- **30-54**: Warning (Orange)
- **<30**: Bad (Red)

### Initial Render Time
- **<100ms**: Excellent
- **100-500ms**: Good
- **500-1000ms**: Acceptable
- **>1000ms**: Needs Optimization

## Notes

- Memory 측정은 Chrome 브라우저에서 `--enable-precise-memory-info` 플래그와 함께 사용해야 정확합니다.
- 다른 탭이나 프로세스의 영향을 최소화하기 위해 독립적인 환경에서 테스트하는 것을 권장합니다.
