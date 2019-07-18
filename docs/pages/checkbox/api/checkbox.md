
>### Desc
 - 태그는 &lt;ev-checkbox&gt;(이하 <체크박스>), &lt;ev-checkbox-group&gt;(이하 <체크박스그룹>)으로 정의

```
<ev-checkbox-group>
  <ev-checkbox>텍스트</ev-checkbox>
  <ev-checkbox>텍스트</ev-checkbox>
  <ev-checkbox>텍스트</ev-checkbox>
</ev-checkbox-group>
```

 - <체크박스그룹>과 <체크박스> 태그는 부모-자식 관계로 사용해야 함
 - <체크박스그룹>.vue파일에서 <슬롯>을 사용하여 <체크박스>태그가 안에 들어가는 로직
 - <체크박스>.vue파일에서 <슬롯>을 사용하여 태그에 '텍스트'가 안에 들어가는 로직

>### Props
> 1) 체크박스 그룹 사용 시
>> <체크박스그룹>
>
>  |    이름     |   디폴트   |  타입   |          설명            |                    종류                           |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | v-model     |           | Array   | <체크박스그룹>에서 최초 선택되는 <체크박스> id 입력, 해당 값은 바인딩되어 동적으로 변함 | <체크박스> 변수 : id |
>> <체크박스>
>
>  |    이름     |   디폴트   |  타입   |          설명            |                    종류                           |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | value       |           | String  | HTML element value (required)    |  |
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
 | on-change | event | <체크박스그룹> 내 <체크박스> 변화 이벤트 감지 |

>### 참고
 - :id는 내부적으로 가지고 있으며, <체크박스>태그 내 <label for=":id">와 연동하기 위함.
   - 현재는 ${&#95;uid}&#95;${value}로 되어있으나, 추후 바꿀 예정
 - <체크박스>체크박스텍스트값</체크박스>로 태그 내부에 텍스트는 &lt;slot/&gt;을 사용함.
