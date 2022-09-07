>## Desc
>### 1. 개별 차트
 - 기존 [chart options](../lineChart#axesx-axesy)에 zoom option을 추가하여 줌 기능 사용 가능.

```
  <ev-chart
    v-model:zoomStartIdx="줌 StartIdx 조절"
    v-model:zoomEndIdx="줌 EndIdx 조절"
    ...
  />
```   
>### 2. 차트 그룹 (Chart Group)
 - 태그는 &lt;ev-chart-group&gt;(이하 <차트 그룹>)으로 정의
 - ev-chart-group의 options를 설정하여 group으로 감싸진 각각 차트의 동작(ex. 줌)을 제어

```
<ev-chart-group
   v-model:zoomStartIdx="줌 StartIdx 조절"
   v-model:zoomEndIdx="줌 EndIdx 조절"
   :options="차트 그룹 속성"
>
  <ev-chart
    ...
  />
  <ev-chart
    ...
  />
</ev-chart-group>
```   
<br/>
   
>## 줌 사용 가능한 차트
1. [Line Chart](../lineChart)

<br/>

>## Props
### 1. v-model:zoomStartIdx
 - option에서 zoom 옵션을 사용할 경우 유효한 바인딩
 - 현재 차트의 시작 인덱스에 대한 정보
 - zoomStartIdx를 이용하여 줌의 시작 인덱스를 조정 가능

#### Example
```
const zoomStartIdx = ref(0);
```
### 2. v-model:zoomEndIdx
 - option에서 zoom 옵션을 사용할 경우 유효한 바인딩
 - 현재 차트의 마지막 인덱스에 대한 정보
 - zoomEndIdx를 이용하여 줌의 마지막 인덱스를 조정 가능

#### Example
```
const zoomEndIdx = ref(0);
```

### 3. options
| 이름              | 타입 | 디폴트           | 설명      | 종류(예시)                       | 
|-----------------|------------------|---------------|---------|---------------------------------------------------|
| zoom            | Object | ([상세](#zoom)) | 차트 줌 설정 |                              |

#### zoom
| 이름              | 타입 | 디폴트              | 설명                     | 종류(예시)                       | 
|-----------------|------------------|--------------------|------------------------|---------------------------------------------------|
| toolbar         | Object | ([상세](#toolbar)) | 차트 줌을 제어할 수 있는 toolbar |                              |
| bufferMemoryCnt | Number | 100             | 차트 줌 버퍼 메모리 제한 설정      | 100이면 최신 100개의 zoom 기록만 저장 됨 |

#### toolbar
| 이름    | 타입      | 디폴트            | 설명                                         | 종류(예시) |
|-------|---------|----------------|--------------------------------------------|---------------------------------------------------|
| show  | Boolean | false          | chart의 toolbar를 사용할지 설정                    |
| items | Object  | ([상세](#items)) | toolbar에 사용할 아이콘 설정 (설정한 아이콘에 따라 기능이 활성화 됨) |

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

###### Zoom Options Example
```
const options = {
    zoom: {
    bufferMemoryCnt: 100,
    toolbar: {
      show: true,
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
  },
}
```
