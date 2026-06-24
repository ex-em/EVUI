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
   v-model:groupSelectedLabel="각 차트에 라벨 표시"
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
### 1. v-model:groupSelectedLabel
- 현재 선택 된 label 인덱스에 대한 정보 

#### Example
```
const groupSelectLabel = ref({
    dataIndex: [1, 3, 7],
});;
```

### 2. v-model:zoomStartIdx
 - option에서 zoom 옵션을 사용할 경우 유효한 바인딩
 - 현재 차트의 시작 인덱스에 대한 정보
 - zoomStartIdx를 이용하여 줌의 시작 인덱스를 조정 가능

#### Example
```
const zoomStartIdx = ref(0);
```

### 3. v-model:zoomEndIdx
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
| 이름                 | 타입 | 디폴트              | 설명                                              | 종류(예시)                       | 
|--------------------|------------------|------------------|-------------------------------------------------|---------------------------------------------------|
| toolbar            | Object | ([상세](#toolbar)) | 차트 줌을 제어할 수 있는 toolbar                          |                              |
| bufferMemoryCnt    | Number | 100              | 차트 줌 버퍼 메모리 제한 설정                               | 100이면 최신 100개의 zoom 기록만 저장 됨 |
| keepZoomStatus | Boolean | false            | 데이트 업데이트시 기존 줌 상태(줌 영역, 메모리, 아이콘 활성화)를 유지할 지 설정 |  |
| useAnimation       | Boolean | true             | 차트 줌 애니메이션을 사용할지 설정          |  |
| useWheelMove       | Boolean | true             | 마우스 휠을 이용하여 차트 줌 영역을 이동할지 설정 |  |

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
    keepZoomStatus: true,
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

<br/>

>## Methods

<차트 그룹>의 `ref`로 호출하는 메서드.

### deferPollingRedraw(durationMs)

차트 클릭으로 detail 패널/popup을 여는 순간, 그룹 폴링(데이터 자동 갱신) redraw를 짧게 양보해 사용자가 연 것이 먼저 페인트되도록 한다. detail/popup을 띄우는 클릭 핸들러에서 호출한다. 미호출 시 양보 로직은 비활성(폴링 redraw가 평소대로 동작)이다.

- `durationMs` (Number, 디폴트 `800`): 폴링 redraw를 미룰 시간(ms). `0`~`2000`(상한)으로 클램프된다.
- one-shot이며 시간창이 지나면 자동으로 재개된다(별도 resume API 없음). detail이 열려 있는 동안에도 시간창 이후에는 차트가 계속 라이브 갱신된다.
- 반복 호출하면 더 미래로 연장되되 `현재 시각 + 2000ms`로 상한이 걸려 무한 연장되지 않는다.
- 그룹 내부의 자식 차트(또는 위젯)에서는 `inject('deferPollingRedraw')`로 동일 함수를 주입받아 직접 호출할 수도 있다.

#### Example

```vue
<ev-chart-group ref="groupRef" :options="options">
  <ev-chart ... @click="onOpenDetail" />
</ev-chart-group>
```

```js
const groupRef = ref();

const onOpenDetail = () => {
  // detail 패널을 여는 동안(디폴트 800ms) 그룹 폴링 redraw를 양보해 detail을 먼저 페인트
  groupRef.value.deferPollingRedraw();
  openDetailPanel();
};
```
