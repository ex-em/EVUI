### Desc
- Headless compound component 패턴의 input 컴포넌트
- 동작과 접근성(WAI-ARIA)만 제공하며, 스타일은 포함하지 않음
- 5개의 서브 컴포넌트를 조합하여 사용

```
<ev-input-root>
  <ev-input-label>레이블</ev-input-label>
  <ev-input v-model="value" />
  <ev-input-description>설명</ev-input-description>
  <ev-input-error-message>에러</ev-input-error-message>
</ev-input-root>
```
- &lt;ev-input&gt;은 단독으로도 사용 가능

```
<ev-input v-model="value" type="email" name="email" />
```

### Components

#### ev-input-root
- context provider. 하위 컴포넌트에 상태(disabled, required, invalid)를 전파
- ID를 자동 생성하여 label↔input, error↔input을 aria로 연결

| 이름 | 타입 | 디폴트 | 설명 | 종류 |
|------|------|--------|------|------|
| disabled | Boolean | false | 하위 input에 disabled 전파 | true, false |
| required | Boolean | false | 하위 input에 required 전파 | true, false |
| invalid | Boolean | false | 하위 input에 aria-invalid 전파 | true, false |

#### ev-input
- 핵심 input 요소. `inheritAttrs: false`로 모든 native HTML 속성을 내부 `<input>`에 직접 전달
- Root 없이 단독 사용 가능

| 이름 | 타입 | 디폴트 | 설명 | 종류 |
|------|------|--------|------|------|
| v-model | String, Number | '' | 입력 값 바인딩 | |
| v-model.trim | | | blur 시 앞뒤 공백 자동 제거 (Vue native modifier) | |
| disabled | Boolean | undefined | 비활성화. undefined이면 Root의 값을 따름 | true, false |
| required | Boolean | undefined | 필수 입력. undefined이면 Root의 값을 따름 | true, false |

Native HTML 속성(type, name, placeholder, autocomplete, maxlength, data-* 등)은 내부 `<input>`에 직접 전달됩니다.

#### ev-input-label
- `<label>` 요소. Root 내에서 사용 시 input과 `for`/`id`가 자동 연결

#### ev-input-description
- 설명 텍스트. mount 시 input의 `aria-describedby`에 자동 등록

#### ev-input-error-message
- 에러 메시지. `role="alert"`, `aria-live="assertive"` 자동 설정
- mount 시 input의 `aria-describedby`에 자동 등록

### Event (ev-input)

| 이름 | 파라미터 | 설명 |
|------|----------|------|
| focus | event | focus 이벤트 |
| blur | event | blur 이벤트. v-model.trim 사용 시 이 시점에 trim 적용 |
| input | (value, event) | input 이벤트 |
| change | (value, event) | change 이벤트 |

### Accessibility
- Root 내에서 사용 시 label↔input, description↔input, error↔input이 aria 속성으로 자동 연결
- `aria-invalid`, `aria-required`가 Root의 상태에 따라 자동 설정
- ErrorMessage에 `role="alert"`, `aria-live="assertive"` 자동 적용
- Description/ErrorMessage가 unmount되면 `aria-describedby`에서 자동 제거
