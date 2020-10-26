### Desc
- 태그는 &lt;ev-slider&gt;(이하 <슬라이더>)으로 정의

```
<ev-slider
  옵션
/>
```
- <슬라이더>에서 바인딩 옵션 설정으로 의도에 맞는 슬라이더 구현


### Props

| 이름 | 타입 | 디폴트 | 설명 | 종류 |
| --- | ---- | ----- | ---- | --- |
| v-model | null | Number, Array | 컴포넌트 입력 값 | |
| disabled | Boolean | false | 비활성화 여부 설정 | true, false |
| range | Boolean | false | 기본은 하나의 값 설정하지만, range 설정 통해 두개의 값, 범위 설정 가능 | true, false |
| max | Number | 100 | 최대값 설정 | |
| min | Number | 0 | 최소값 설정 | |
| step | Number | 1 | 클릭 및 드레그를 통한 변화 값. 0 보다 큰 값 | |
| mark | Object |  | 사용자 지정 라벨 설정. 특정 값/퍼센트의 위치에 특정 라벨링 가능. style 속성으로 라벨의 스타일 지정 가능 | | 
| color | String, Array | null | 사용자 지정 색 설정. 기본 slider 색 설정 시 string으로 색상값 입력. 슬라이더 범위별 색상 설정 시 array로 각 범위별 색상값 입력   | |
| tooltipFormat | Function | null | 툴팁 내 값을 사용자 지정 양식으로 변경. value를 인수로하는 함수의 리턴값으로 변경 가능 | |
| showStep | Boolean | false | step 값 위치 표현 여부 설정 | true, false |
| showTooltip | Boolean | true | tooltip 표현 여부 설정 | true, false |
| showInput | Boolean | false | inputNumber 컴포넌트 사용 여부 설정 | true, false |


### Event

 | 이름 | 파라미터 | 설명 |
 | ---- | ------- | ---- |
 | change | newValue | 컴포넌트 값 변경 시 호출 |
