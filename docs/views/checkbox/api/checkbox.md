
>### Desc
 - 태그는 &lt;EvCheckbox&gt;(이하 <체크박스>), &lt;EvCheckboxGroup&gt;(이하 <체크박스그룹>)으로 정의

```
<EvCheckboxGroup>
  <EvCheckbox>텍스트</EvCheckbox>
  <EvCheckbox>텍스트</EvCheckbox>
  <EvCheckbox>텍스트</EvCheckbox>
</EvCheckboxGroup>
```

 - <체크박스그룹>과 <체크박스> 태그는 위와 같이 상위에 그룹, 하위에 체크박스로 사용
   (provide, injected를 사용하여 EVUI2.0 체크박스로직의 부모-자식 1depth 관계인 한계점을 개선하여, <체크박스그룹>과 <체크박스> 사이에 DOM
   이 위치하더라도 그룹 내 스코프 내 양방향 데이터 바인딩이 가능하도록 함.)
 - <체크박스그룹>.vue파일에서 <슬롯>을 사용하여 <체크박스>태그가 안에 들어가는 로직
 - <체크박스><슬롯></체크박스>로 내부에 슬롯값이 들어가며, 내부 슬롯값이 없는 경우 <체크박스>의 label속성 값이 채워진다.  

>### Props
> 1) 체크박스 그룹 사용 시
>> <체크박스그룹>
>
> |    이름     |   디폴트  |  타입   |          설명            |                    종류                           |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | v-model     | null      | Array   | <체크박스그룹>내 선택된 <체크박스> label 값으로, 해당 값은 바인딩되어 동적으로 변함 | |
>> <체크박스>
>
> |    이름     |   디폴트  |  타입   |          설명            |                    종류                           |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | v-model     |   null    | String, Number, Boolean, Symbol, Array   | <체크박스그룹>내 선택된 <체크박스> label 값으로, 해당 값은 바인딩되어 동적으로 변함 | |
  | label       |   null    | String  | HTML element value (required)    |  |
  | disabled    |   false   | Boolean | HTML element disabled attribute    |  |
>

>
> 2) 체크박스만 사용 시
>> <체크박스>
>
>  |    이름     |   디폴트   |  타입   |          설명            |                    종류                           |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | v-model       |         | String or Boolean | <체크박스>의 value    |  |
  | value       |           | String  | HTML element value    |  |
  | size       |           | String  | 체크박스의 크기 | '', 'small' |
  | type       |           | String  | 체크박스 박스의 모양 (default : 테두리 원) | '', 'square' |
  | after-type |           | String  | 체크박스 내부 체크모양 (deault : 내부 원) | '', 'minus', 'check' |
  | disabled    |   false   | Boolean | HTML element disabled attribute    |  |

>### Event
>> <체크박스그룹>

 | 이름 | 파라미터 | 설명 |
 | ---- | ------- | ---- |
 | change | event | <체크박스그룹> 내 <체크박스> 변화 이벤트 감지 |

>### 참고
 - :id는 내부적으로 가지고 있으며, <체크박스>태그 내 <label for=":id">와 연동하기 위함.
   - 현재는 ${&#95;uid}&#95;${value}로 되어있으나, 추후 바꿀 예정
 - <체크박스>체크박스텍스트값</체크박스>로 태그 내부에 텍스트는 &lt;slot/&gt;을 사용함.
