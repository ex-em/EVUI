
>### Desc
 - 태그는 &lt;ev-progress&gt;(이하 <프로그레스>)으로 정의

```
<ev-progress
    v-mode="바인딩값"
    :color="색상값 문자열 또는 색상값조건의 배열"
    :stroke-width="바 너비"
    :inner-text="바 내부 텍스트"
>
    컨텐츠
</ev-progress>
```

 - <프로그레스>는 현재 작업의 진행상황을 표기하고 사용자에게 현재 상태를 알리는데 사용됩니다.
 - <프로그레스>태그 내부의 컨텐츠는 <프로그레스>바 우측 영역에 컨텐츠를 보여줄 때 사용됩니다.
 

>### Props
| 이름 | 타입 | 디폴트 | 설명 | 종류 |
| --- | ---- | ----- | ---- | --- |
| v-mode | Number | 0 | <프로그레스>의 값 | 0 ~ 100 |
| color | String, Array | '#409EFF' | <프로그래스>의 기본 색상 | |
| stroke-width | Number | 6 | <프로그래스>바의 너비 | |
| inner-text | String | '' | <프로그래스>바 내부의 텍스트 | |
