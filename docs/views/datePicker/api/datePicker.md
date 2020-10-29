### Desc
- 태그는 &lt;ev-date-picker&gt;(이하 <데이트피커>)으로 정의

```
<ev-date-picker
  v-model=""
  ...
/>
```
- <데이트피커>에서 바인딩 옵션 설정으로 의도에 인풋박스와 드롭다운, 캘린더로 기능을 구현

### Props

| 이름 | 타입 | 디폴트 | 설명 | 종류 |
| --- | ---- | ----- | ---- | --- |
| v-model | String, Array | '' | 컴포넌트 입력 값, String 타입인 경우는 'YYYY-MM-DD' 또는 'YYYY-MM-DD HH:MI:SS'의 형태로 작성해야하며, Array 타입인 경우는 배열 내에 'YYYY-MM-DD' 형식에 맞는 String 값을 넣어야한다.  | |
| placeholder | String | '' | 인풋박스의 placeholder |  |
| disabled | Boolean | false | <데이트피커> 사용여부 |  |
| clearable | Boolean | false | <데이트피커> 내 선택된 항목을 모두 clear할 수 있는 아이콘 사용 여부 |  |
| mode | String | 'date' | 캘린더 모드 | 'date', 'dateTime', 'dateMulti', 'dateRange' |
|  |  | date(default) | 메인 캘린더에서 날짜를 선택 | 'YYYY-MM-DD' |
|  |  | dateTime | 메인 캘린더에 날짜와 시간(HMS)을 선택 | 'YYYY-MM-DD HH:MI:SS' |
|  |  | dateMulti | 메인 캘린더에 여러 날짜는 선택 | \['YYYY-MM-DD', ...\] |
|  |  | dateRange | 메인 캘린더와 확장 캘린더에서 fromDate ~ toDate를 선택 | \['YYYY-MM-DD'`(fromDate)`, 'YYYY-MM-DD'`(toDate)`\] |
| monthNotation | String | 'fullName' | 캘린더 헤더의 월 표기방식 | 'fullName', 'abbrName', 'numberName', 'korName' |
| dayOfTheWeekNotation | String | 'abbrUpperName' | 캘린더의 요일 표기방식 | 'abbrUpperName', 'abbrLowerName', 'abbrPascalName', 'abbrKorName' |
| options | Object | {} | 캘린더의 세부 옵션 |  |
|  | multiType | 'date' | `mode: dateMulti` 의 세부 타입 | 'weekday', 'week', 'date' |
|  |  | date | limit 개수만큼 단일 날짜 선택 | \[YYYY-MM-DD, ...\] |
|  |  | weekday | 주중(월~금) 선택 | \['YYYY-MM-DD'`월`, 'YYYY-MM-DD'`화`, 'YYYY-MM-DD'`수`, 'YYYY-MM-DD'`목`, 'YYYY-MM-DD'`금`\] |
|  |  | week | 주일(일~토) 선택 | \['YYYY-MM-DD'`일`, 'YYYY-MM-DD'`월`, 'YYYY-MM-DD'`화`, 'YYYY-MM-DD'`수`, 'YYYY-MM-DD'`목`, 'YYYY-MM-DD'`금`, 'YYYY-MM-DD'`토`\] |
|  | multiDayLimit | 1 | `mode: dateMulti, type: date` 시 선택 일수 제한 |  |
|  | disabledDate | () => {} | 달력 상 사용불가능 날짜를 함수로 정의 |  |
|  | tagShorten | false | 선택된 날짜가 연속되는 경우 날짜를 모두 나열하는 것은 default이나, 이를 `fromDate ~ toDate`로 태그를 단축하여 보여주는 기능. (mode: `dateMulti`, options.multiType: `weekday` or `week`), (mode: `dateRange`)인 경우 사용 가능 |  |
