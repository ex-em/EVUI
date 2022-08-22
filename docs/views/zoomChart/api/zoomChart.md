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
| 이름    | 타입       | 디폴트            | 설명                   | 종류(예시) |
|-------|---------------------|----------------|----------------------|---------------------------------------------------|
| items | Object   | ([상세](#items)) | toolbar에 사용할 아이콘 설정 (설정한 아이콘에 따라 기능이 활성화 됨)  |

##### items
| 이름       | 타입     | 디폴트                                     | 설명           | 종류(예시)             |
|----------|--------|-----------------------------------------|--------------|--------------------|
| previous | Object | ([상세](#previous-latest-reset-dragzoom)) | 줌 이전 기록으로 이동 | |
| latest   | Object | ([상세](#previous-latest-reset-dragzoom))                       | 줌 최근 기록으로 이동 |  |
| reset    | Object | ([상세](#previous-latest-reset-dragzoom))                       | 줌 초기화        |  |
| dragZoom | Object | ([상세](#previous-latest-reset-dragzoom))                       | drag 줌 기능    |  |

###### previous latest reset dragZoom
###### type 공통
| 이름         |  타입 | 디폴트           | 설명                  | 종류(예시)                      |
|------------|--------|---------------|---------------------|-----------------------------|
| icon       | String | 'ev-icon-allow2-left', 'ev-icon-allow2-right', 'ev-icon-redo', 'ev-icon-zoomin'| 아이콘 모양 설정           | [ev icon](../icon)                        |
| size       | String | 'medium'      | 아이콘 사이즈             | 'small', 'medium', 'large'  |
| title      | String | 'Previous', 'Latest', 'Reset', 'Drag Zoom'     | 마우스 호버 시 보이는 아이콘 이름 |                             |

###### icon Example
```
const chartZoomOptions ={
      toolbar: {
        items: {
          previous: {
            icon: 'ev-icon-allow2-left',
            size: 'medium',
            title: 'Previous',
          },
          latest: {
            icon: 'ev-icon-allow2-right',
            size: 'medium',
            title: 'Latest',
          },
          reset: {
            icon: 'ev-icon-redo',
            size: 'medium',
            title: 'Reset',
          },
          dragZoom: {
            icon: 'ev-icon-zoomin',
            size: 'medium',
            title: 'Drag Zoom',
          },
        },
      },
    }
```
