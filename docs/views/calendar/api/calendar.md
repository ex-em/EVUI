### Desc
- 태그는 &lt;ev-calendar&gt;(이하 <캘린더>)로 정의

```
<ev-calendar
  옵션
/>
```
- <캘린더>에서 바인딩 옵션 설정으로 의도에 맞게 달력 기능 구현

### Props

| 이름 | 타입 | 디폴트 | 설명 | 종류 |
| --- | ---- | ----- | ---- | --- |
| v-model | String, Array | '' | 컴포넌트 입력 값, String 타입인 경우는 'YYYY-MM-DD' 또는 'YYYY-MM-DD HH:MI:SS'의 형태로 작성해야하며, Array 타입인 경우는 배열 내에 'YYYY-MM-DD' 형식에 맞는 String 값을 넣어야한다.  | |
| mode | String | 'date' | 캘린더 모드 | 'date', 'dateTime', 'dateMulti', 'dateRange' |
|  |  | date(default) | 메인 캘린더에서 날짜를 선택 | 'YYYY-MM-DD' |
|  |  | dateTime | 메인 캘린더에 날짜와 시간(HMS)을 선택 | 'YYYY-MM-DD HH:MI:SS' |
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
|  | disabledDate | () => {} | 달력 상 사용불가능 날짜를 함수로 정의 |  |
|  | timeFormat   | '' | 시간값 선택 범위 설정 <br> 타입: string, Array <br> 단일 캘린더일 경우 string으로 넘겨야 하며 'HH:mm:00'/'HH:55:00'/'10:mm:ss'로 사용 가능 <br> 다중 캘린더일 경우 Array로 넘겨야 하며 ['HH:00:ss', 'HH:59:00'] 로 사용 가능 <br> 숫자로 넘기면 disabled 적용  |  | 
