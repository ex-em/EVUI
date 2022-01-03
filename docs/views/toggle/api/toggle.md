
>### Desc
 - 태그는 &lt;ev-toggle&gt;(이하 <토글>)로 정의

```
<ev-toggle
    v-model="초기값(Boolean)"
/>
```

 - <토글> 컴포넌트는 두 상태를 스위칭할 때 사용한다.

>### Props

 | 이름            | 타입 | 디폴트 | 설명 | 종류 |
 |---------------|------|--------|------|------|
  | v-model       | Boolean | false | <토글>에서 선택된 값 | |
  | readonly      | Boolean | false | <토글> 읽기전용 여부 | |
  | disabled      | Boolean | false | <토글> 사용 여부 | |
  | width         | Number | 40 | <토글> width size | |
  | activeColor   | String | '#409EFF' | <토글> 활성화 시 색상 | |
  | inactiveColor | String | '#DCDFE6' | <토글> 비활성화 시 색상 | |

>### Event

 | 이름 | 파라미터 | 설명 |
 | ---- | ------- | ---- |
 | change | newValue | <토글> 내 v-model 변화 이벤트 감지 |

>### 참고
 - 
