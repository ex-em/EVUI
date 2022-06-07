### Desc
- 태그는 &lt;ev-date-picker&gt;(이하 <데이트피커>)으로 정의

```
<ev-date-picker
  v-model=""
  ...옵션
/>
```
- <데이트피커>는 인풋박스와 드롭다운, 캘린더로 기능을 구현
- 인풋박스 영역 클릭 시 드롭다운 영역이 생기고 캘린더가 1 ~ 2개가 나타나며, 사용자는 이를 선택하여 v-model값을 변경

### Props

| 이름 | 타입 | 디폴트 | 설명 | 종류 |
| --- | ---- | ----- | ---- | --- |
| v-model | String, Array | '' | 컴포넌트 입력 값, String 타입인 경우는 'YYYY-MM-DD' 또는 'YYYY-MM-DD HH:MI:SS'의 형태로 작성해야하며, Array 타입인 경우는 배열 내에 'YYYY-MM-DD' 형식에 맞는 String 값을 넣어야한다.  | |
| placeholder | String | '' | 인풋박스의 placeholder |  |
| disabled | Boolean | false | <데이트피커> 사용여부 |  |
| clearable | Boolean | false | <데이트피커> 내 선택된 항목을 모두 clear할 수 있는 아이콘 사용 여부 |  |
| mode | String | 'date' | 캘린더 모드 | 'date', 'dateTime', 'dateMulti', 'dateRange', 'dateTimeRange' |
|  |  | date(default) | 메인 캘린더에서 날짜를 선택(사용자가 인풋에 직접 입력 가능) | 'YYYY-MM-DD' |
|  |  | dateTime | 메인 캘린더에 날짜와 시간(HMS)을 선택(사용자가 인풋에 직접 입력 가능) | 'YYYY-MM-DD HH:MI:SS' |
|  |  | dateMulti | 메인 캘린더에 여러 날짜는 선택 | \['YYYY-MM-DD', ...\] |
|  |  | dateRange | 메인 캘린더와 확장 캘린더에서 fromDate ~ toDate를 선택 | \['YYYY-MM-DD'`(fromDate)`, 'YYYY-MM-DD'`(toDate)`\] |
|  |  | dateTimeRange | 메인 캘린더와 확장 캘린더에서 fromDateTime ~ toDateTime을 선택 | \['YYYY-MM-DD HH:mm:ss'`(fromDate)`, 'YYYY-MM-DD HH:mm:ss'`(toDate)`\] |
| monthNotation | String | 'fullName' | 캘린더 헤더의 월 표기방식 | 'fullName', 'abbrName', 'numberName', 'korName' |
| dayOfTheWeekNotation | String | 'abbrUpperName' | 캘린더의 요일 표기방식 | 'abbrUpperName', 'abbrLowerName', 'abbrPascalName', 'abbrKorName' |
| options | Object | {} | 캘린더의 세부 옵션 |  |
|  | multiType | 'date' | `mode: dateMulti` 의 세부 타입 | 'weekday', 'week', 'date' |
|  |  | date | limit 개수만큼 단일 날짜 선택 | \[YYYY-MM-DD, ...\] |
|  |  | weekday | 주중(월~금) 선택 | \['YYYY-MM-DD'`월`, 'YYYY-MM-DD'`화`, 'YYYY-MM-DD'`수`, 'YYYY-MM-DD'`목`, 'YYYY-MM-DD'`금`\] |
|  |  | week | 주일(일~토) 선택 | \['YYYY-MM-DD'`일`, 'YYYY-MM-DD'`월`, 'YYYY-MM-DD'`화`, 'YYYY-MM-DD'`수`, 'YYYY-MM-DD'`목`, 'YYYY-MM-DD'`금`, 'YYYY-MM-DD'`토`\] |
|  | multiDayLimit | 1 | `mode: dateMulti, type: date` 시 선택 일수 제한 |  |
|  | disabledDate | () => {} | 달력 또는 시간에 사용불가능 날짜 또는 시간을 함수로 정의 <br> dateRange 또는 dateTimeRange 모드인 경우 from, to 각각 적용하고 싶을 때 array로 넘겨서 적용 가능 <br> ex) disabledDate: [<br>() => {}, <br>   () => {} <br>] | |
|  | tagShorten | false | 선택된 날짜가 연속되는 경우 날짜를 모두 나열하는 것은 default이나, 이를 `fromDate ~ toDate`로 태그를 단축하여 보여주는 기능. (mode: `dateMulti`, options.multiType: `weekday` or `week`), (mode: `dateRange`)인 경우 사용 가능 |  |
|  | timeFormat   | '' | 시간값 선택 범위 설정 <br> 타입: string, Array <br> 단일 캘린더일 경우 string으로 넘겨야 하며 'HH:mm:00'/'HH:55:00'/'10:mm:ss'로 사용 가능 <br> 다중 캘린더일 경우 Array로 넘겨야 하며 ['HH:00:ss', 'HH:59:00'] 로 사용 가능 <br> 숫자로 넘기면 disabled 적용  |  |
| shortcuts | Array | [] | shortcut 버튼을 이용한 사용자 정의 객체 Array <br> {<br> label: '어제', <br> value: 'yesterday',<br> shortcutDate: () => {} } <br> shortcutDate 함수의 반환값 타입은 Date(단일캘린더), Array(다중캘린더) 이며 Array 타입인 경우 배열 내에 Date 객체 형식으로 반환 <br> DateMulti 모드 제외 |  |
