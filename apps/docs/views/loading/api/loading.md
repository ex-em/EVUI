
>### Desc
 - 태그는 &lt;ev-loading&gt;(이하 <로딩>)으로 정의

```
<div>
    <ev-loading
        v-model="Boolean값"
        :fullscreen="Boolean값"
        :click-outside="Boolean값"
        :icon-class="String"
        :icon-style="{
            속성: 값,
            속성: 값,
        }"
    />
</div>
```

```
<div>
    <ev-loading
        v-model="Boolean값"
        :fullscreen="Boolean값"
        :click-outside="Boolean값"
    >
        슬롯에 들어갈 컨텐츠
    </ev-loading>
</div>
```

 - <로딩>은 외부에서 값을 정하기 때문에 v-model로 Boolean 값에 따라 표기하도록 한다
 - 기본적으로는 부모의 사이즈에 맞춰 생성
 - fullscreen 모드인 경우는 전체 화면에 로딩마스크가 생김
 - click-outside는 로딩마스크 백그라운드 클릭 시 닫혀지는 기능 제공여부
 - slot을 사용하지 않는 경우, :icon-class로 회전하는 i 태그의 클래스명을, icon-style로는 i 태그의 스타일을 변경할 수 있다
 - slot을 사용하는 경우, 태그 내부에 슬롯이 들어갈 컨텐츠를 커스텀으로 입력한다.

>### Props

  | 이름 | 타입 | 디폴트 | 설명 | 종류 |
  |------------ |-----------|---------|-------------------------|---------------------------------------------------|
  | v-model | Boolean | false | 보임 여부 | |
  | fullscreen | Boolean | false | 전체화면 로딩 여부 | |
  | click-outside | Boolean | false | 로딩 백그라운드 클릭 시 닫힘 여부 | |
  | icon-class | String | null | i 태그 클래스명 | 슬롯을 사용하지 않는 경우 |
  | icon-style | String | null | i 태그 스타일 | 슬롯을 사용하지 않는 경우 |
