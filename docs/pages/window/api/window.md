 >#### body 의 component 는 slot 으로 처리

## Props

  |    이름     |        타입       | 디폴트 |  종류 |           설명          |
  |-----------  |----------------- | ------ | ----- | ---------------------- |
  | width       | [String, Number] | 250    |  | |
  | height      | [String, Number] | 250    |  | |
  | minWidth    | [String, Number] | 150    |  | 최소 width |
  | minHeight   | [String, Number] | 150    |  | 최소 height |
  | maximizable | Boolean          | true   |  | 최대화 버튼 사용 여부 |
  | title       | String           | ''     |  | header 의 title |
  | resizeable  | Boolean          | true   |  | window 크기 변경 가능 여부 |
  | closeType   | String           | 'hide' | 'destroy', 'hide' | close 시, <br> 어떻게 처리할 것인지 선택 |
  | isShow      | Boolean          | true   |  | update 를 사용했기때문에 v-model 처럼 사용 가능하고 내부적으로 closeType 에 따라 v-if, v-show 처리 |


## Event

 - mousedown (event, clickedInfo)
>#### 마우스가 눌려질 때 감지

 | 파라미터     |  타입  | 설명 |
 | ----------- | ------ | ---- |
 | event       | Object | Event object |
 | clickedInfo | Object | 클릭된 정보들 |

 - mousedown-mousemove (event)
>#### 마우스가 눌려진 상태(이동 및 크기 조정 진행 중) 일 때의 마우스 이동 감지

 | 파라미터 |  타입  | 설명 |
 | ------- | ------ | ---- |
 | event   | Object | Event object |

 - mousedown-mouseup (event)
>#### 마우스가 눌려진 상태(이동 및 크기 조정 진행 중) 가 풀렸을 때 감지

 | 파라미터 |  타입  | 설명 |
 | ------- | ------ | ---- |
 | event   | Object | Event object |

 - mouseout (event)
>#### 마우스가 window 밖으로 벗어날 때 호출

 | 파라미터 |  타입  | 설명 |
 | ------- | ------ | ---- |
 | event   | Object | Event object |

 - header-dbl-click (event)
>#### header 를 더블 클릭 시 호출

 | 파라미터 |  타입  | 설명 |
 | ------- | ------ | ---- |
 | event   | Object | Event object |

 - before-close (event)
>#### close 가 실행되기 전 호출

 | 파라미터 |  타입  | 설명 |
 | ------- | ------ | ---- |
 | this    | Object | window scope |

 - resize (event, positionInfo)
>#### header 를 더블 클릭 시 호출

 |   파라미터    |  타입  | 설명 |
 | ------------ | ------ | ---- |
 | event        | Object | Event object      |
 | positionInfo | Object | Position 관련 정보 |


