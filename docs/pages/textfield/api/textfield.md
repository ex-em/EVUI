### Props

  |     이름     |  타입           |   디폴트        |                 종류              |                  설명               |
  | ------------ | --------------- | --------------- | --------------------------------- | ----------------------------------- |
  | width        | String/Number   | '100%'          |  ('150px', '100%', 150)           | textfield 의 넓이                   |
  | height       | String/Number   | '100%'          |  ('150px', '100%', 150)           | textfield 의 높이                   |
  | value        | String          | ''              | ''                                | Value 값                            |
  | disabled     | Boolean         | false           | true, false                       | 비활성화                            |
  | readonly     | Boolean         | false           | true, false                       | 읽기 전용                           |
  | type         | String          | 'text'          | 'text', 'password', 'textarea'    | 타입 설정                           |  
  | placeholder  | String          | ''              | ''                                | textfield 가 비었을 때 보여질 값    |
  | useRegExp    | Boolean         | false           | true, false                       | 정규식을 통한 validation 처리 여부  |
  | regExp       | RegExp          | null            |                                   | useRegExp 옵션 사용시 적용될 정규식 |
  | errorMsg     | String          | 'Wrong Message' |                                   | validation 발생 시 보여질 메세지    |
  | useMaxLength | Boolean         | false           | true, false                       | value 의 최대길이 제한 여부         |
  | maxLength    | Number          | Infinity        |                                   | value 의 최대길이 제한 길이         |
  | borderColor  | String          | '#dddee1'       |                                   | textfield의 테두리 색상             |

### Event

 - on-click ( event ) - textfield 클릭 시 호출
 - on-keydown ( event ) - key down 시 호출
 - on-keyup ( event ) - key up 시 호출
 - on-keyenter ( event ) - enter key 누를 시 호출
 - on-focus (event) - textfield 에 focus 발생 시 호출
 - on-blur (event) - textfield 에서 focus 가 없어질 때 호출
 - on-input-change - textfield 의 값이 변경된 뒤 호출
 - on-change - textfield 의 값이 변경될 때 호출                       

 | 파라미터 |  타입  | 설명 |
 | ------- | ------ | ---- |
 | event   | Object | Event object |
