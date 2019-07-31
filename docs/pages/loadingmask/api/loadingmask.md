
>### Desc
 - 태그는 &lt;ev-loadingmask&gt;(이하 <로딩마스크>)로 정의

```
<ev-loading-mask
  v-if="true"
/>
 
<ev-loading-mask
  v-show="true"
/>
```

 - <로딩마스크>는 v-if나 v-show로 상태를 변경할 수 있다.

>### Props
>
>  |    이름     |   디폴트   |  타입   |          설명            |                    종류                           |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | bar-width   |   30   | Number | 로딩마스크 바 너비 |  |
  | bar-height  |   10   | Number | 로딩마스크 바 높이 |  |
  | bar-border-radius  |   20   | Number | 로딩마스크 바 테두리 둥근 정보 |  |
  | bar-color | rgba(200, 200, 200, 0.7) | String | 로딩마스크 바 색상 |  |
  | bar-count | 13 | Number | 로딩마스크 바 개수 |  |
  | spinner-radius | 30 | Number | 중앙 점에서 로딩 바까지의 반지름 |  |
  | anim-interval | 1 | Number | css animation 딜레이 시간 |  |

>### 참고
> -  
