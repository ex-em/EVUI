
>### Desc
 - 태그는 &lt;ev-scheduler&gt;(이하 <스케쥴러>)로 정의

```
<ev-scheduler
    v-model=[]
    ...
/>
```

 - <스케쥴러> 컴포넌트는 2차원 요소 내부에서 범위를 지정할 때 사용한다.

>### Props
| 이름 | 타입 | 디폴트 | 설명 | 종류 |
|------|--------|------|------|------|
| v-model | Array | [] | <스케쥴러>에서 선택된 값 | |
| widthOptions | Object | { count: 7, labels: \['<span style="color: #FF0000">SUN</span>', 'MON', 'TUE', 'WED', 'THU', 'FRI', '<span style="color: #0006F9">SAT</span>'\] } | 캘린더 Width(Column)의 옵션 |  |
|  |  | count | 가로 칸 개수 | default: 7 (Number) |
|  |  | labels | 가로 칸 HTML 텍스트 | default: \['<span style="color: #FF0000">SUN</span>', 'MON', 'TUE', 'WED', 'THU', 'FRI', '<span style="color: #0006F9">SAT</span>'\] |
| heightOptions | Object | { count: 24, labels: \['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', ... , '23:00''\] } | 캘린더 Height(Row)의 옵션 |  |
|  |  | count | 세로 칸 개수 | default: 24 (Number) |
|  |  | labels | 가로 칸 HTML 텍스트 | default: \['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', ... , '23:00''\] |

>### Event
 | 이름 | 파라미터 | 설명 |
 | ---- | ------- | ---- |
 | change | newValue | <스케쥴러> 내 v-model 변화 이벤트 감지 |

>### 참고
 - 
