### Desc
- 태그는 &lt;EvRadio&gt;(이하 <라디오>), &lt;EvRadioGroup&gt;(이하 <라디오그룹>)으로 정의

```
<EvRadioGroup>
  <EvRadio>텍스트</EvRadio>
  <EvRadio>텍스트</EvRadio>
  <EvRadio>텍스트</EvRadio>
</EvRadioGroup>
```

 - <라디오그룹>에서 `<slot>`을 사용하여 <라디오>태그가 안에 들어가는 로직
 - <라디오>에서 `<slot>`을 사용하여 label 텍스트를 입력하거나, `<slot>` 내역이 없으면 label 바인드 변수가 입력되는 로직

### Props
#### <라디오그룹>

|    이름     |   디폴트   |  타입   |          설명            |                    종류                           |
|------------ |-----------|---------|-------------------------|---------------------------------------------------|
| v-model     | null      | String, Number, Symbol | <라디오그룹> 내 선택된 <라디오>의 label 값으로, 해당 값은 바인딩되어 동적으로 변함 | |

#### <라디오>

|    이름     |   디폴트   |  타입   |          설명            |                    종류                           |
|------------ |-----------|---------|-------------------------|---------------------------------------------------|
| v-model     | null      | String, Number, Symbol | <라디오그룹> 내 선택된 <라디오>의 label 값으로, 해당 값은 바인딩되어 동적으로 변함 | |
| label       | null      | String, Number, Symbol | HTML element value (required) |  |
| disabled    | false     | Boolean | HTML element disabled attribute    |  |
| size        | medium    | String  | 라디오 버튼 크기 | small, medium(default) |

### Event
#### <라디오그룹>

 | 이름 | 파라미터 | 설명 |
 | ---- | ------- | ---- |
 | change | event | <라디오그룹> 내 <라디오> 변화 이벤트 감지 |

#### <라디오>

 | 이름 | 파라미터 | 설명 |
 | ---- | ------- | ---- |
 | change | event | <라디오> 변화 이벤트 감지 |

