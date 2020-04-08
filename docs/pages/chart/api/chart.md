## 1. Data  
```javascript
const chartData = {
  series: {
    series1: { name: 'series#1', show: true, type: 'line', fill: true, point: false },
    series2: { name: 'series#2', show: true, type: 'line', fill: true, point: false },
  },
  groups: [
    ['series1', 'series2'],
  ],
  labels: [
    +new Date('2017/01/01 00:00:00'),
    +new Date('2017/01/01 00:01:00'),
    +new Date('2017/01/01 00:02:00'),
    +new Date('2017/01/01 00:03:00'),
    +new Date('2017/01/01 00:04:00'),
  ],
  data: {
    series1: [100, 150, 51, 150, 350],
  },
}
```
watch를 통해 데이터 변경을 감지하므로, labels와 data property의 데이터들을 관리하면 된다.

## 2. Options
### 2.1 Axis
- showAxis

  | Description                   | Value     | Default |
  | ----------------------------- | --------- | ------- |
  | Axis의 Show/Hide 속성         | Boolean   | true    |

- autoScaleRatio

  | Description                   | Value            | Default |
  | ----------------------------- | ---------------- | ------- |
  | Axis의 Max Buffer를 위한 속성 | 0.1~0.9 (Number) | null    |

- showGrid

  | Description                       | Value   | Default         |
  | --------------------------------- | ------- | --------------- |
  | Chart의 Grid선을 그리기 위한 속성 | Boolean | false |

- gridLineColor

  | Description        | Value            | Default   |
  | ------------------ | ---------------- | --------- |
  | Chart의 Grid 선 색 | HexCode (String) | '#C9CFDC' |
  
- axisLineColor

  | Description  | Value            | Default   |
  | ------------ | ---------------- | --------- |
  | Axis의 선 색 | HexCode (String) | '#b4b6ba' |  
  
- showIndicator

  | Description                       | Value   | Default         |
  | --------------------------------- | ------- | --------------- |
  | Chart의 Grid선을 그리기 위한 속성 | Boolean | false |

- startToZero

  | Description                                                  | Value   | Default |
  | ------------------------------------------------------------ | ------- | ------- |
  | 해당 Axis의 시작값을 0으로 설정하는 속성 *(Linear, LogarithmType에 사용)* | Boolean | false   |

- horizontal

  | Description                      | Value   | Default |
  | -------------------------------- | ------- | ------- |
  | Horizontal Bar Chart를 위한 속성 | Boolean | false   |

- labelStyle (Object)

  | Property   | Description | Value            | Default      |
  | ---------- | ----------- | ---------------- | ------------ |
  | fontSize   | 글자 크기   | Number           | 12           |
  | color      | 글자 색상   | HexCode (String) | '#25262E'    |
  | fontFamily | 글자체      | String           | 'Roboto' |
  | fitWidth   | Label Text Ellipsis 처리 | Boolean | false |
  | fitDir   | Ellipsis 방향 | String | 'right' |

  ```javascript
  // Example
  const labelStyle = {
    fontSize: 12,
    color: '#25262E',
    fontFamily: 'Droid Sans',
    fitWidth: false,
    fitDir: 'right',
  };
  ```

#### 2.1.1 Linear

- interval

  | Description                            | Value  | Default |
  | -------------------------------------- | ------ | ------- |
  | Axis의 Label 표기를 위한 interval 속성 | Number | null    |

  미지정 시 Chart 내부에서 해당 Axis 데이터의 max/min value를 기반으로 interval을 구함.

- 기타 참고사항

  Linear Type의 Axis Label은 각 숫자 단위에 맞춰 'K', 'M', 'G'로 숫자를 변환하여 보여준다.
  예를 들어, Label에 필요한 값이 1,500일 경우 '1.5K'로 표기한다.

- Examples

  ```javascript
  const options = {
    axesY: [{
      type: 'linear',
    }],
  }
  ```

#### 2.1.2 Logarithmic
- Logarithmic Type Axis는 Axis의 min max를 로그로 계산하여 자동으로 추가 buffer값을 제공한다.

- 기타 참고사항

  Linear Type의 Axis Label은 각 숫자 단위에 맞춰 'K', 'M', 'G'로 숫자를 변환하여 보여준다.
  예를 들어, Label에 필요한 값이 1,500일 경우 '1.5K'로 표기한다.

- Examples

  ```javascript
  const options = {
    axesY: [{
      type: 'log',
    }],
  };
  ```

#### 2.1.3 Time

- interval

  | Description                     | Value                                                        | Default |
  | ------------------------------- | ------------------------------------------------------------ | ------- |
  | Axis Label 표기를 위한 interval | 'millisecond', 'second', 'minute', 'hour', 'day', 'week' ,'month', 'quarter', 'year' (String) | null    |

  각 시간 단위에 따른 millisecond 값을 구하여 계산함.

- timeFormat

  moment의 timeFormat 이용

  참고 URL: https://momentjs.com/docs/#/parsing/string-format/

- Examples

  ```javascript
  const options = {
    axesX: [{
      type: 'time',
      timeFormat: 'HH:mm:ss',
      interval: 'minute',
    }],
  };
  ```

#### 2.1.4 Step

- timeMode

  | Description                    | Value                | Default |
  | ------------------------------ | -------------------- | ------- |
  | Step Axis를 Time 기반으로 변경 | true/false (Boolean) | false   |

- timeFormat

  moment의 timeFormat 이용

  참고 URL: https://momentjs.com/docs/#/parsing/string-format/

### 2.2 Sub Property

- Title (Object)
  **Chart 상단**에 해당 Chart의 Title을 생성

  | Property         | Description       | Value            | Default |
  | ---------------- | ----------------- | ---------------- | ------- |
  | show             | Title 표시 여부   | Boolean          |         |
  | height           | Title 영역의 높이 | Number           |         |
  | text             | Title명           | String           | ''      |
  | style.fontSize   | 글자 크기         | Number           |         |
  | style.color      | 글자 색상         | HexCode (String) | ''      |
  | style.fontFamily | 글자체            |                  | ''      |

  

- Legend (Object)

  Chart의 4방향에 Legend를 생성

  | Property | Description                                   | Value                                     | Default |
  | -------- | --------------------------------------------- | ----------------------------------------- | ------- |
  | show     | Legend 표시 여부                              | Boolean                                   | true    |
  | position | Legend 위치                                   | 'top', 'right', 'bottom', 'left' (String) | 'right' |
  | color    | Legend 색상 (Active)                          | HexCode(String)                           | '#000'  |
  | inactive | Legend 색상 (InActive)                        | HexCode(String)                           | '#aaa'  |
  | width    | Legend의 넓이 *('left', 'right'의 경우 조절)* | Number                                    | 140     |
  | height   | Legend의 높이 *('top', 'bottom'의 경우 조절)* | Number                                    | 24      |

- width

  | Description                         | Value         | Default |
  | ----------------------------------- | ------------- | ------- |
  | Chart의 넓이 ('150px', '100%', 150) | String/Number | '100%'  |

- height

  | Description                         | Value         | Default |
  | ----------------------------------- | ------------- | ------- |
  | Chart의 높이 ('150px', '100%', 150) | String/Number | '100%'  |

- horizontal

  | Description                 | Value   | Default |
  | --------------------------- | ------- | ------- |
  | Bar Chart의 Horizontal 여부 | Boolean | false   |

- thickness

  | Description             | Value          | Default |
  | ----------------------- | -------------- | ------- |
  | Bar Chart의 각 Bar 넓이 | 0.1~1 (Number) | 1       |


- tooltip (object)

  | Property         | Description                      | Value           | Default   |
  | ---------------- | -------------------------------- | --------------- | --------- |
  | use              | tooltip 표시 여부                | Boolean         | true      |
  | backgroundColor  | tooltip 배경 색상                | HexCode(String) | '#4C4C4C' |
  | borderColor      | tooltip 테두리 색상              | HexCode(String) | '#666666' |
  | shadowOpacity    | 그림자 투명도                    | Number          | 0.25      |
  | useShadow        | 그림자 사용 여부                 | Boolean         | false     |
  | throttledMove    | 데이터 조회 Throttling 처리 유무 | Boolean         | false     |
  | debouncedHide    | 좌표 이동 시 tooltip hide 여부   | Boolean         | false     |

- indicator (object)

  | Property  | Description         | Value           | Default   |
  | --------- | ------------------- | --------------- | --------- |
  | use       | indicator 표시 여부 | Boolean         | false     |
  | color     | 색상                | HexCode(String) | '#EE7F44' |

- maxTip (object)

  | Property         | Description                   | Value           | Default   |
  | ---------------- | ----------------------------- | --------------- | --------- |
  | use              | maxTip 표시 여부              | Boolean         | false     |
  | fixedPosTop      | maxTip 위치를 최대값으로 고정 | Boolean         | false     |
  | showIndicator    | indicator 표시 여부           | Boolean         | false     |
  | indicatorColor   | indicator 색상                | HexCode(String) | '#000000' |
  | tipBackground    | maxTip 배경색상               | HexCode(String) | '#000000' |
  | tipTextColor     | maxTip 글자 색상              | HexCode(String) | '#FFFFFF' |

- selectItem (object)

  | Property            | Description                               | Value           | Default   |
  | ------------------- | ----------------------------------------- | --------------- | --------- |
  | use                 | 차트 아이템 선택 기능                     | Boolean         | false     |
  | showTextTip         | 선택한 label의 최대값 표시                | Boolean         | false     |
  | showTip             | 선택한 label의 상단에 화살표 표시         | Boolean         | false     |
  | showIndicator       | 선택한 label의 indicator 표시             | Boolean         | false     |
  | fixedPosTop         | indicator 및 tip의 위치를 최대값으로 고정 | Boolean         | false     |
  | useApproximateValue | 가까운 label을 선택                       | Boolean         | false     |
  | indicatorColor   | indicator 색상                               | HexCode(String) | '#000000' |
  | tipBackground    | tip 배경색상                                 | HexCode(String) | '#000000' |
  | tipTextColor     | tip 글자 색상                                | HexCode(String) | '#FFFFFF' |

