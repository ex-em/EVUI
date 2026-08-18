
>### Desc

- 태그는 &lt;ev-select&gt;(이하 <셀렉트>)로 정의
- &lt;ev-select&gt; 클릭시 나타나는 영역은 dropBox(이하 <드랍박스>)로 정의

```
<ev-select
    v-model="초기값(value)"
    :items="[{...}, {...}, {...}]"
/>
```

- <셀렉트> 컴포넌트는 `<input type="text" />` 를 래핑하는 구조를 가지고 있다.
- <셀렉트> 컴포넌트를 클릭하였을 때, :items 속성에 1개 이상의 객체를 가진 배열이 존재하는 경우,
   하단에 선택할 리스트 데이터를 보여주는 <드랍다운 박스>가 나타난다.
- <드랍박스>가 열린 상태에서 <셀렉트>를 한번더 클릭할 시 <드랍다운 박스>는 사라진다.
- <셀렉트> 컴포넌트의 기본 width는 100%이다.
   다른 형태를 위해서는 ev-select 클래스에 스타일을 래핑해야한다.
- 기본적으로 <드랍박스>의 너비는 <셀렉트> 컴포넌트의 너비와 동일하게 맞춰져 있다.
- items 바인딩 값의 타입은 배열이며, 속성으로는 name, value, iconClass 이다.
- iconClass속성의 값으로 <드랍박스>의 <li> 내 아이콘을 추가할 수 있다.
- <드랍박스>는 기본적으로 인풋박스의 하단에 드랍다운되며, 브라우저 높이에 맞춰 <드랍박스>가 아래로 위치하는 경우 브라우저 화면을 넘어가는 경우 상단에 드랍업 된다.

>### Props

1) 셀렉트 사용 시

 | 이름 | 타입 | 디폴트 | 설명 | 종류 |
  |------|--------|------|------|------|
  | v-model | Boolean, String, Number | null | <셀렉트>에서 선택된 값으로, 해당 값은 바인딩되어 동적으로 변함 | |
  | items | Array | [] | <셀렉트> 선택가능한 리스트 |  |
  | placeholder | String | '' | <셀렉트>의 표기문구 |  |
  | disabled | Boolean | false | <셀렉트> 사용가능 여부 |  |
  | clearable | Boolean | false | <셀렉트>에 선택된 항목들 모두 clear기능 사용여부 |  |
  | filterable | Boolean | false | <셀렉트> 항목들 필터링 기능 사용여부 |  |
  | searchPlaceholder | String | '' | <셀렉트> 필터링의 표기문구 |  |
  | noMatchingText | String | '' | <셀렉트> 필터링 결과가 없을 시 표기문구 |  |
  | checkable      | Boolean | false | <셀렉트> 체크박스 여부 |  |
  | teleport | String | '' | <드랍박스>를 옮길 target CSS selector (예: `"body"`, `".my-class"`, `"#some-id"`). 빈 문자열이면 teleport 비활성. 매칭되는 element가 없거나 selector가 유효하지 않으면 `document.body`로 fallback하고 console.warn. | `"body"`, `".class"`, `"#id"` |
  | highlight | Object | {} | 검색어 하이라이트 설정. `filterable`과 함께 사용한다. | `{ match: true, color: '#409eff' }` |

- <셀렉트> 클릭 시 <드랍다운 박스>가 나타나며, 목록 선택 시 <드랍다운 박스>가 닫혀야한다.
- `teleport` 옵션 사용 시 <드랍박스>는 viewport 기준(position: fixed)으로 위치가 계산되며, ev-window 등 부모 컨테이너 경계에 잘리지 않는다.
- `teleport` target 또는 그 ancestor에 `transform`/`filter`/`perspective`/`will-change` 등이 적용돼 있으면 `position: fixed`의 containing block이 해당 ancestor로 바뀌어 <드랍박스> 위치가 어긋날 수 있다. 기본값인 `"body"` 또는 body 직속 element를 권장한다.

2) 멀티 셀렉트 사용 시

 | 이름 | 타입 | 디폴트 | 설명 | 종류 |
  |------|--------|------|------|------|
  | v-model | Boolean, String, Number | null | <셀렉트>에서 선택된 값으로, 해당 값은 바인딩되어 동적으로 변함 | |
  | items | Array | [] | <셀렉트> 선택가능한 리스트 |  |
  | placeholder | String | '' | <셀렉트>의 표기문구 |  |
  | multiple | true |  | <셀렉트> 복수 선택 가능여부 |  |
  | disabled | Boolean | false | <셀렉트> 사용가능 여부 |  |
  | clearable | Boolean | false | <셀렉트>에 선택된 항목들 모두 clear기능 사용여부 |  |
  | collapse-tags | Boolean | false | <셀렉트>에 선택된 항목의 생략 태그기능 사용여부 | { 항목1 (x) } { +1 } |
  | filterable | Boolean | false | <셀렉트> 항목들 필터링 기능 사용여부 |  |
  | searchPlaceholder | String | '' | <셀렉트> 필터링의 표기문구 |  |
  | noMatchingText | String | '' | <셀렉트> 필터링 결과가 없을 시 표기문구 |  |
  | checkable         | Boolean | false | <셀렉트> 체크박스 여부 |  |
  | teleport | String | '' | <드랍박스>를 옮길 target CSS selector (예: `"body"`, `".my-class"`, `"#some-id"`). 빈 문자열이면 teleport 비활성. 매칭되는 element가 없거나 selector가 유효하지 않으면 `document.body`로 fallback하고 console.warn. | `"body"`, `".class"`, `"#id"` |
  | tagMaxRows | Number | 0 | multiple 모드에서 tag wrapper가 노출할 최대 줄 수. `0`(기본)은 무제한, 양의 정수는 그 줄 수까지 표시하고 이상은 wrapper 내부 scroll. 항목이 많이 선택되어 wrapper가 폭발적으로 커질 때 teleport 모드에서 dropbox가 viewport 밖으로 밀려나는 문제와 non-teleport 모드에서 wrapper height 변화로 flip 방향이 점프하는 문제를 옵트인 방식으로 막는다. | `0`, `3` |
  | highlight | Object | {} | 검색어 하이라이트 설정. `filterable`과 함께 사용한다. | `{ match: true, color: '#409eff' }` |

- <셀렉트> 클릭 시 <드랍다운 박스>가 나타나며, 목록 선택 시 <드랍다운 박스>가 닫히지 말아야 한다.

3) 검색어 하이라이트 (`highlight`)

 | 이름 | 타입 | 디폴트 | 설명 |
 |------|--------|------|------|
 | match | Boolean | false | 검색어 매칭 구간 강조 여부 |
 | color | String | '' | 매칭 구간 강조 색상. 미지정 시 기본색(테마 primary) |

```
<ev-select
    v-model="value"
    :items="items"
    filterable
    :highlight="{ match: true, color: '#409eff' }"
/>
```

- `filterable`이 켜져 있고 검색어가 입력된 상태에서만 강조가 적용된다. `highlight`를 지정하지 않으면 기존 렌더링과 동일하다.
- 강조 구간은 필터와 **동일한 매처**(원문 / 영→한 / 한→영 변환)로 계산되므로, 필터에 걸린 이유가 그대로 강조된다.
- <셀렉트> 필터는 한글 초성 검색과 한/영 자판 변환 검색을 지원한다. 따라서 한/영 변환 없이 `sk`(→`나`), `dlstmxjstm`(→`인스턴스`)처럼 입력해도 해당 한글 항목이 검색되며, 그 구간이 강조된다.
- 항목명 안에 검색어가 여러 번 등장하면 매칭된 모든 구간이 강조된다.
- 강조는 <드랍박스> 항목명에만 적용되며, multiple 모드의 선택 태그에는 적용되지 않는다.
- 강조는 색상으로만 적용되며 굵기는 변하지 않는다.
- `disabled` 항목은 필터링 결과에는 그대로 나타나지만 강조색이 적용되지 않는다. 항목명 전체가 검색어와 일치할 때 강조색이 "선택 불가"를 알리는 회색을 덮어버리는 것을 막기 위함이다.

>### Slot

 | 이름 | 슬롯 프롭 | 설명 |
 |------|-----------|------|
 | search-filter | `item` | `filterable` 검색 입력을 커스텀 렌더링 |

`item` 이 제공하는 값: `value`(현재 검색어), `onInput`, `class`, `placeholder`.

```
<template #search-filter="{ item }">
  <input
    :value="item.value"
    :class="item.class"
    :placeholder="item.placeholder"
    @input="item.onInput"
  />
</template>
```

>### Event

1) 셀렉트

 | 이름 | 파라미터 | 설명 |
 | ---- | ------- | ---- |
 | change | newValue | <셀렉트> 내 v-model 변화 이벤트 감지 |

>### 참고

-
