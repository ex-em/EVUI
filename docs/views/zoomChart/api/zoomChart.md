>## Desc
- 태그는 &lt;ev-chart-zoom&gt;(이하 <차트 줌>)으로 정의

```
<ev-chart-zoom
  :options="차트 줌 속성"
>
  <ev-chart
    v-model:selectedItem="선택된 데이터 정보"
    :data="차트 데이터"
    :options="차트 속성"
    :resize-timeout="debounce wait시간(단위: ms)"
  />
</ev-chart-zoom>
```   
<br/>
   
>## 줌 사용 가능한 차트
1. [Line Chart](../lineChart)

<br/>

>## Props
### 1. options
| 이름              | 타입 | 디폴트              | 설명                 | 종류(예시)                       | 
|-----------------|------------------|--------------------|------------------------------|---------------------------------------------------|
| toolbar         | Object | ([상세](#toolbar)) | 차트 줌 우측 상단 tool 속성 |                              |
| bufferMemoryCnt | Number | 100             | 차트 줌 버퍼 메모리 제한 설정  | 100이면 최신 100개의 zoom 기록만 저장 됨 |

#### toolbar
| 이름            | 타입       | 디폴트                 | 설명                                    | 종류(예시) |
|----------|---------------------|---------------------------------------|-------------------------|---------------------------------------------------|
| icon          | Object   | ([상세](#icon))       | toolbar에 사용할 아이콘 설정 |

##### icon
| 이름         | 타입                          | 디폴트           | 설명                                | 종류(예시)     |
|------------|-----------------------------|---------------|-----------------------------------|------------|
| type       | Object                      | ([상세](#type)) | 아이콘 종류 설정 (설정한 아이콘에 따라 기능이 활성화 됨) |            |
| size       | String                      | 'medium'      | 아이콘 사이즈                           | 'small', 'medium', 'large'  |
| color      | Hex, RGB, RGBA Code(String) | '#0D0D0D'     | 아이콘 색상                            |            |
| hoverColor | Hex, RGB, RGBA Code(String)                     | '#1a6afe'     | 아이콘 마우스 호버 시 색상                   |            |

###### type
| 이름       | 타입 | 디폴트 | 설명           | 종류(예시)             |
|----------|------|-------|--------------|--------------------|
| previous | String | '' | 줌 이전 기록으로 이동 | [ev icon](../icon) |
| latest   | String | '' | 줌 최근 기록으로 이동 | [ev icon](../icon) |
| reset    | String | '' | 줌 초기화        | [ev icon](../icon) |
| dragZoom | String | '' | drag 줌 기능    | [ev icon](../icon) |

###### type Example
```
const chartZoomOptions = {
    toobar: {
        icon: {
            type: {
                previous: 'ev-icon-allow2-left',
                latest: 'ev-icon-allow2-right',
                reset: 'ev-icon-redo',
                dragZoom: 'ev-icon-zoomin',
            }
            ... 생략
        }
    },
    ... 생략
}
```
