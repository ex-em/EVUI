
>### Desc
 - 태그는 &lt;ev-tabs&gt;(이하 <탭>)과 &lt;ev-tab-panel&gt;(이하 <탭 패널>)로 정의

```
<ev-tabs
    v-model="초기값(value)"
    v-model:panels="[{...}, {...}, {...}]"
    :closable="Boolean값"
    :stretch="Boolean값"
    :draggable="Boolean값"
>
    <ev-tab-panel
        :text="패널의 텍스트(라벨)"
        :value="패널 값"
    >
        // rendering contents
    </ev-tab-panel>
</ev-tabs>
```

- <탭> 컴포넌트 하위에 <탭 패널> 컴포넌트가 존재합니다. 
- <탭> 컴포넌트의 v-model로는 초기에 선택된 탭의 value가 바인딩되며, v-model:panels에는 탭 리스트 정보가 바인딩됩니다..
- <탭> 컴포넌트에는 여러 옵션들이 존재합니다. (closable, stretch, draggable)
- <탭 패널>에는 text, value 속성이 존재합니다. <탭 패널> 태그 내부에는 실제로 해당 탭이 선택되었을 때, 보여줄 컨텐츠를 넣으면 됩니다.


>### Props
1) tabs

| 이름 | 타입 | 디폴트 | 설명 | 종류 |
|------|--------|------|------|------|
| v-model(modelValue) | String, Number | null | <탭>에서 선택한 탭 value | |
| panels | Array | [] | <탭>의 리스트 | |
| closable | Boolean | false | <탭> 상단 nav의 닫기 아이콘 표기 여부 | |
| stretch | Boolean | false | <탭> 상단 nav의 텍스트 모두 표기 여부 | |
| stretch | draggable | false | <탭> 상단 nav의 드래그앤드랍 이동 여부 | |

2) tab-panel

| 이름 | 타입 | 디폴트 | 설명 | 종류 |
|------|--------|------|------|------|
| text | String, Number | null | <탭 패널>의 텍스트(라벨) | |
| value | String, Number | null | <탭 패널>의 value | required |


