
### Desc

- 태그는 &lt;ev-pagination&gt;(이하 <페이지네이션>)으로 정의

```html
<ev-pagination
  v-model="현재 페이지"
  :옵션
/>
```

### Props

| 이름 | 타입 | 디폴트 | 설명 | 종류 |
| --- | ---- | ----- | ---- | --- |
| v-model | Number | 1 | 현재 페이지 |  |
| total | Number, String | 0 | 전체 항목 수 | |
| per-page | Number, String | 20 | 각 페이지의 항목 수 | |
| visible-page | Number, String | 8 | 표시되는 페이지 수 | |
| page-info | Boolean | `false` | 페이지 정보 유무 | |
| order | String | 'left' | 페이지네이션 정렬 | 'left', 'right', 'center' |
| pagePerJump | Number? | - | Jump하기 위한 Double Arrow 버튼 사용 | 원하는 페이지만큼 점프가 가능합니다. 해당 페이지가 없는 경우 동일한 방향으로 갈 수 있는만큼 점프합니다. |
