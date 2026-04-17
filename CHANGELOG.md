## [3.6.3](https://github.com/ex-em/EVUI/compare/3.6.2...3.6.3) (2026-04-17)


### Bug Fixes

* axesX일 경우 넓이에 소수점 한자리를 더하여 계산하도록 변경 ([800e1d4](https://github.com/ex-em/EVUI/commit/800e1d4f117c90315fc9c9aac26b0fb838ee1245))
* extraLabel 계산을 util로 만들고 test 코드를 helpers.util.spec.js로 옮김 ([f927fcb](https://github.com/ex-em/EVUI/commit/f927fcb0ee96220d2936d2538192171ecc15dde0))
* interval이 range를 벗어나는 경우 로직 타지 않게 수정 ([992458b](https://github.com/ex-em/EVUI/commit/992458b4954aeb4b8b54abc4ba5988f87a49a3a0))
* nice fractions 2.5 제거, extraFormattedLabels를 배열로 넘겨 예외로 계산하도록 수정 ([92ba8e3](https://github.com/ex-em/EVUI/commit/92ba8e381bbeda6d909ef63183daf76b561755e7))
* realTimeScatter > 데이터가 없을 경우, Y축에 0~1 범위가 아닌 0~1.1 범위가 표시되는 현상 수정 ([9a6e7bd](https://github.com/ex-em/EVUI/commit/9a6e7bdc7f44582f0833f362cdc9907d83c53315))
* v-model.trim 사용 시 내부/외부 값 동기화 안되는 현상 수정 ([49ab849](https://github.com/ex-em/EVUI/commit/49ab849b41af011b27dc5cd5d6d92111b844b985)), closes [#2214](https://github.com/ex-em/EVUI/issues/2214)
* visual update ([56ada81](https://github.com/ex-em/EVUI/commit/56ada81708e6e7fbb6a14e4ccb4e268df453c497))
* widestNumeric 계산을 notFormattedLabels를 순회하지않고 graphMin,graphMax 중에서 큰 값으로 수정 ([2312dc8](https://github.com/ex-em/EVUI/commit/2312dc82d7f0fc72e557a1b3a53eacf6af597611))
* 브러쉬 차트 드래그 시 캔버스 영역 밖에서도 정상 동작하도록 개선 ([35c8ffe](https://github.com/ex-em/EVUI/commit/35c8ffeada57c893b2f9488623689415a9b744b0))
* 예제 Deafult에 isHorizontal 토글 추가, isHorizontal만 변경했을때 차트가 그려지지 않는 현상 수정 ([0242fe7](https://github.com/ex-em/EVUI/commit/0242fe76bdf0b89a3f025c9e7df5139afb3cddd8))
* 주석 삭제 ([044f050](https://github.com/ex-em/EVUI/commit/044f050d7aac6614d4da425c9146c7100d9a95db))
* 코드 리뷰 반영 ([65e0280](https://github.com/ex-em/EVUI/commit/65e0280766cca306d13b18abc292b7e36131b6e0))

## [3.6.2](https://github.com/ex-em/EVUI/compare/3.6.1...3.6.2) (2026-04-14)


### Bug Fixes

* min값 비교할때 현재 min값이 null이 아닐 경우 그 다음 min값이 null이 아닐때만 비교하도록 변경 ([ec43b9e](https://github.com/ex-em/EVUI/commit/ec43b9e77451c0514500c15988d93e7d53ccf20c))
* time > scale > interval : 0 입력 시 브라우저 프리징 현상 수정 ([223ae3b](https://github.com/ex-em/EVUI/commit/223ae3b1f3b36ca1e35c2ee63ac4200c314f120e))
* 표시 가능한 label개수를 넘을 경우 range, interval 조합이 complete함에도 무시되는 현상 수정 ([a178787](https://github.com/ex-em/EVUI/commit/a178787b25931a6a7066c2cc5687cf0b49fef1e2))

## [3.6.1](https://github.com/ex-em/EVUI/compare/3.6.0...3.6.1) (2026-04-09)


### Bug Fixes

* bar chart scrollbar 렌더링 버그 수정 ([ea19a79](https://github.com/ex-em/EVUI/commit/ea19a7957455bfe82ca5c704aba29a787596aee7))
* barData가 있을때만 아래 로직을 타도록 수정 ([ec50878](https://github.com/ex-em/EVUI/commit/ec508788a0bf8f0ce52b89ad7c2a8c7855de1413))
* **chart:** click/dblclick 핸들러가 all-null label 정보를 그대로 반환 ([9306e65](https://github.com/ex-em/EVUI/commit/9306e65bac5dc2cf935e74dfeafe36338f298844))
* **chart:** findHitItem/findClosestDataIndex에 disableNullLabelSnap 옵션 추가 ([2195ccf](https://github.com/ex-em/EVUI/commit/2195ccf99298719c133ee7c768d88e2fffc48e71))
* **chart:** getHitItemByPosition에 disableNullLabelSnap 옵션 추가 ([f2e0007](https://github.com/ex-em/EVUI/commit/f2e0007ed0138ce7d04fada68c9f872240801186))
* **chart:** hitId falsy sentinel, JSDoc, FillWithNull.vue 명세 정합성 수정 ([ab4f8bd](https://github.com/ex-em/EVUI/commit/ab4f8bd2704e14fe8f8bee65c42a2f2db13f363a))
* endIndex가 gData의 개수를 넘지 않도록 처리 ([7edaa8d](https://github.com/ex-em/EVUI/commit/7edaa8d494f70963687411c086273204678b049d))
* findHitItem fallback이 "첫 시리즈" 고정으로 선택되는 문제 수정 ([45c91c4](https://github.com/ex-em/EVUI/commit/45c91c44c36a7505a9ee1efc8e2f4e131891eba8)), closes [#2199](https://github.com/ex-em/EVUI/issues/2199)
* getHitItemByPosition fallback이 잘못된 시리즈를 선택하는 문제 수정 ([a8db4dc](https://github.com/ex-em/EVUI/commit/a8db4dc8a82c4454f8610fde769575a84cc12610)), closes [ex-em/EVUI#2199](https://github.com/ex-em/EVUI/issues/2199)
* linear 축일때 데이터 max 값과 축의 max 값이 크게 차이나는 현상 및 사용자 range가 있을때 interval을 딱 떨어지는 interval로 구하도록 수정 ([7b35174](https://github.com/ex-em/EVUI/commit/7b351740d45a704d95da27e352798245c59d0715))
* null-only 라벨 click 결과가 hover/dblclick 과 다른 문제 수정 ([1e4f883](https://github.com/ex-em/EVUI/commit/1e4f88307760df199836b9a0cdd2f83d4c724e21))
* null-only 라벨 클릭 시 이웃 라벨 값이 잘못 선택되는 문제 수정 ([3827bdc](https://github.com/ex-em/EVUI/commit/3827bdc2d65cd971baa8964a90b2a5770fc31852))
* range가 0보다 작거나 유효하지 않은 경우 eary return, 유한소수중에서도 소수점 자리수가 작은 게 우선이 되도록 개선 ([751004e](https://github.com/ex-em/EVUI/commit/751004e64da2ec0845945abc912da530eb626444))
* range가 업데이트될때 크기만 조정하고 스크롤 위치는 유지하도록 수정 ([aa0c63c](https://github.com/ex-em/EVUI/commit/aa0c63c0df480bbefb2d3d3cf179f6e302d6bbd5))
* update test:visual ([c4eb865](https://github.com/ex-em/EVUI/commit/c4eb8658ed653143ed13c07d49dfc9bc273d69ce))
* 경고 로그 추가 다시 수정 ([3bcc092](https://github.com/ex-em/EVUI/commit/3bcc092ab621e7c5fafe20d48b8c24685c1bef7f))
* 라벨이 많을 경우 스크롤 시 버벅이는 현상 개선 ([ada7b0f](https://github.com/ex-em/EVUI/commit/ada7b0f3075e7223718a16a2538ce8293211641c))

# [3.6.0](https://github.com/ex-em/EVUI/compare/3.5.6...3.6.0) (2026-04-08)


### Bug Fixes

* [linearScale] chartData > data, label 이 빈배열일 경우, 이전 버전 스펙과 동일하게 보이도록 함 ([865c371](https://github.com/ex-em/EVUI/commit/865c3715e7b9058c7738f92783f86ceb066be673))
* chartData > data, label 이 빈배열일 경우, 이전 버전 스펙과 동일하게 보이도록 함 ([02363db](https://github.com/ex-em/EVUI/commit/02363db09ad38f481fe11c7232b2944329a671ea))
* findHitItem에 directHit 우선 선택 로직 추가 -- plugins.interaction ([4164484](https://github.com/ex-em/EVUI/commit/4164484fb48fe7e2f915d4fdab07950a79ef40bd))
* interval을 증가시키는 방식을 2배에서, interval 배수로 변경하여 조금씩 증가하며 관찰하도록 함 ([cc62d9a](https://github.com/ex-em/EVUI/commit/cc62d9aef69cdb3b1f878082a8c7e4627f68cbc2))
* line 포인트 직격 케이스를 directHit로 표시 -- element.line ([95b064d](https://github.com/ex-em/EVUI/commit/95b064d6d03f2308d826cccb74a89cf2abb990b6))
* range, interval 옵션을 같이쓰고 fixedStep을 사용하지 않을 경우, maxStep을 넘을 수 없도록 함 ([870a415](https://github.com/ex-em/EVUI/commit/870a4152dae85b1bbf76503c7962299e461f3452))
* range, interval 옵션을 같이쓰고 fixedStep을 사용하지 않을 경우, maxStep을 넘을 수 없도록 함 -- time.scale ([594b22c](https://github.com/ex-em/EVUI/commit/594b22cfabf78f5ce9a1368288d4d46f957ffb61))
* scrollbarOpt.range를 직접 수정 후 복원하는 패턴 제거 ([547b5f6](https://github.com/ex-em/EVUI/commit/547b5f6ed277e8335fe3f46a0f4579cfe5fec953))
* 잘못된 jsDoc 수정 ([f719964](https://github.com/ex-em/EVUI/commit/f7199642bd1330485faed7736e099052325d033c))


### Features

* bar element에 directHit 플래그 추가 -- element.bar ([443ff34](https://github.com/ex-em/EVUI/commit/443ff34b771b51d4a71e05d9bc13927b59d81180))

## [3.5.6](https://github.com/ex-em/EVUI/compare/3.5.5...3.5.6) (2026-04-01)


### Bug Fixes

* lastLabelFontStyle 적용 ([608e958](https://github.com/ex-em/EVUI/commit/608e958ee684e0dc4d18e3754aa46c0f214311bc))
* lastLabelStyle 적용 ([9266d76](https://github.com/ex-em/EVUI/commit/9266d76f872927e70148de2b8ce1437577a4ee27))
* showLastLabel이 true일때만 lastLabelFontStyle이 적용되게 하고 마지막 라벨도 적용되게 수정 ([c1bcb1f](https://github.com/ex-em/EVUI/commit/c1bcb1f66f0bfc85ed71196c2ded889eb4be7986))

## [3.5.5](https://github.com/ex-em/EVUI/compare/3.5.4...3.5.5) (2026-03-26)


### Bug Fixes

* bar chart scrollbar 렌더링 버그 수정 ([9e31932](https://github.com/ex-em/EVUI/commit/9e31932a90349d6ada5ca7ee8d4171f6930e890e))
* chart > scrollbar 옵션 변경할때 차트에 반영되지 않음 (3.4) ([52a8c88](https://github.com/ex-em/EVUI/commit/52a8c8800931847cad05512242326045d5ec73bc))
* ensure chart legend and data creation wait for DOM updates in Scrollbar component ([ac0da41](https://github.com/ex-em/EVUI/commit/ac0da413e3f8f07cd2f3ababae39a6cee563f2e6))
* range[0] -> movedMin 으로 변경 ([f92e08a](https://github.com/ex-em/EVUI/commit/f92e08adad0a2ba11f5d772803ae2c4550293bcd))
* savedPosition 초기화 로직 함수로 분리 ([101eb27](https://github.com/ex-em/EVUI/commit/101eb27d2a2cf0a5a17534d6153669aea499be0d))
* updateScrollbar의 조건 강화 , maxium 줄 수정, scrolling updateByScrollbar 추가 ([a63814f](https://github.com/ex-em/EVUI/commit/a63814f32009ce35893db863689cbec2504d50d9))

## [3.5.4](https://github.com/ex-em/EVUI/compare/3.5.3...3.5.4) (2026-03-25)


### Bug Fixes

* maxWidth 값이 없을 경우, 라벨끼리 겹치는 현상 수정 ([e85a304](https://github.com/ex-em/EVUI/commit/e85a304202e4817e71f85a0d2937cc2da72573b1))

## [3.5.3](https://github.com/ex-em/EVUI/compare/3.5.2...3.5.3) (2026-03-24)


### Bug Fixes

* **chart:** realTimeScatter autoScale 시 유효 시간 범위 밖 데이터 min/max 반영 문제 수정 ([d3bd463](https://github.com/ex-em/EVUI/commit/d3bd4631a3d65159b6477157823ee31df4c08928))
* **chart:** realTimeScatter 데이터 초기화 시 Y축 NaN 표시 문제 수정 ([1a227ab](https://github.com/ex-em/EVUI/commit/1a227abc0429b2459c9d2dc0b02e55f79d0c6e32))
* lastLabelStyle 기본값 제거. 사용자가 부여했을때만 적용되도록 함 ([9a4b13f](https://github.com/ex-em/EVUI/commit/9a4b13fef5db12b5f1e4451b698bb82da46e3716))
* 데이터 있는 시리즈 찾도록 로직 수정 ([850b000](https://github.com/ex-em/EVUI/commit/850b000e66ecd7a342ec583c921fb5a6775597cd))
* 주석 수정 ([94205cf](https://github.com/ex-em/EVUI/commit/94205cf75af47f814d3560e70df8caa63b0e4227))

## [3.5.2](https://github.com/ex-em/EVUI/compare/3.5.1...3.5.2) (2026-03-23)


### Bug Fixes

* update decimal point calculation logic and add new tests for getDecimalPointFromRange ([2de5664](https://github.com/ex-em/EVUI/commit/2de5664628a9203d2ddcacdac8b045f26386d559))
* 부동소수점 오차 제거 및 테스트 코드 작성 ([8c9a933](https://github.com/ex-em/EVUI/commit/8c9a93364fd1f2f29e13bbcc9170408370707f90))

## [3.5.1](https://github.com/ex-em/EVUI/compare/3.5.0...3.5.1) (2026-03-20)


### Reverts

* Revert "feat(build): preserveModules를 적용하여 tree-shaking 지원" ([84fe88d](https://github.com/ex-em/EVUI/commit/84fe88ded5b46e51db1b5b77a2949e81a940351f))
* Revert "feat(build): unplugin-vue-components용 EvuiResolver 추가" ([e7f29e6](https://github.com/ex-em/EVUI/commit/e7f29e69c1434524e6860f20e77d74f4cfe7763f))
* Revert "test: add evui resolver tests" ([d8c03f6](https://github.com/ex-em/EVUI/commit/d8c03f69a42fcfd267dcd989a341abe4563cb9a2))

# [3.5.0](https://github.com/ex-em/EVUI/compare/3.4.214...3.5.0) (2026-03-20)


### Bug Fixes

* '%'를 포함한 문자열도 처리가능하도록 maxWidth 로직 개선 ([641a8bf](https://github.com/ex-em/EVUI/commit/641a8bf45c070fc8a563e096014fc2b24d7ad615))
* axis > linear > interval, range 유실되지 않도록 수정 ([a8d7135](https://github.com/ex-em/EVUI/commit/a8d7135baa5f5af206403f36e0050adf8d04581d))
* axis > range 값을 미달하거나 초과하는 데이터에 대해 예외처리 지정 ([2a1c2d0](https://github.com/ex-em/EVUI/commit/2a1c2d0cabecaf63ce607eb3b40c2d68db189653))
* axis > time > interval, range 유실되지 않도록 수정 ([b389e27](https://github.com/ex-em/EVUI/commit/b389e270a3499e8500d9210bcf6c386d07d89764))
* calculateScaleRange 에서 user Range를 넘겨도 startToZero, autoScaleRatio 에 의해 변질 될 수 있는 부분 수정 ([0ae12f6](https://github.com/ex-em/EVUI/commit/0ae12f6653df509104c32769a3bf570b32d5e259))
* docs > hash로 이동했을 때 상단 title 영역 잘려보이는 현상 수정 ([5bfe413](https://github.com/ex-em/EVUI/commit/5bfe413bb56e215f15f653514aa11ec83530c3c5))
* docs 예제 오류 수정 ([bae3b24](https://github.com/ex-em/EVUI/commit/bae3b245f6efbae49e8d24156d695a21802b4606))
* ensure scaleChange option correctly evaluates truthiness for axes ([6ba73b3](https://github.com/ex-em/EVUI/commit/6ba73b34461bdd4927903c20a36fc0cf5e7b708d))
* range+interval이 호환되더라도 다음 fallback으로 넘어가는 현상 수정 ([dbe6101](https://github.com/ex-em/EVUI/commit/dbe6101da0ae671727c25f8cadd7ed7c3857dc9e))
* update axes-scale-change event payload ([8b1138b](https://github.com/ex-em/EVUI/commit/8b1138bd1c888abdfc2699921832fdf6282a10b5))
* update axes-scale-change event payload to return arrays for minSteps and maxSteps ([fdedcc4](https://github.com/ex-em/EVUI/commit/fdedcc4cb5e336a6097a0947cf31a98652b30c5d))
* 스타일린트 에러 수정 ([e5ea75b](https://github.com/ex-em/EVUI/commit/e5ea75b73ca62f392d0a2c8b31e3e25e9bec9b2c))
* 예제 페이지 스타일 개선 후 사이즈가 무한으로 늘어나는 현상 수정 ([2cbd1e9](https://github.com/ex-em/EVUI/commit/2cbd1e9c6221e2ccaf061d7c2a647d69a333e20d))
* 중복 설명 삭제 ([d0c06d6](https://github.com/ex-em/EVUI/commit/d0c06d62a5b34c00199c43ec7d488605db8a7a51))


### Features

* add scaleChange option to charts for detecting scale changes and emitting events ([ef277a2](https://github.com/ex-em/EVUI/commit/ef277a2edf418afeceecabf1535809e6d7d7806f))
* axesScaleChange emit 추가 ([7d54d77](https://github.com/ex-em/EVUI/commit/7d54d77af090cedcd14b9182eb2feca954fe9b96))
* axis > lastLabelFontStyle 옵션 추가 ([d08d500](https://github.com/ex-em/EVUI/commit/d08d500330c7976136fbc4bc2e6db30ec0c13968))
* axis > niceScale 옵션 제거 > 기본으로 적용 ([f40af24](https://github.com/ex-em/EVUI/commit/f40af240f6e5dc7737e4d8088c4544bd35c87349))
* **build:** preserveModules를 적용하여 tree-shaking 지원 ([06fe8a4](https://github.com/ex-em/EVUI/commit/06fe8a46891d7240dac6ecbd6c198c356e4fc450))
* **build:** unplugin-vue-components용 EvuiResolver 추가 ([2908ef8](https://github.com/ex-em/EVUI/commit/2908ef848d946b78b8008daaf37cfd6a57768ec6))
* heatmap > click-legend emit 추가 ([d537b95](https://github.com/ex-em/EVUI/commit/d537b95e09b4d25cbaaeeb898d5b4989487e6639))

## [3.4.214](https://github.com/ex-em/EVUI/compare/3.4.213...3.4.214) (2026-02-20)


### Bug Fixes

* **ci:** add NODE_AUTH_TOKEN env for npm authentication in release workflow ([4d61aa1](https://github.com/ex-em/EVUI/commit/4d61aa1044ca033ab85c20b1c98faae06f1271eb))
* **ci:** add tagFormat and remove unused 3.0 branch from release config ([137476a](https://github.com/ex-em/EVUI/commit/137476a1e5d122194aa63acc93550a73a555ef7d))
* **ci:** fix release deployment by upgrading Node.js and removing duplicate publish workflow ([9723695](https://github.com/ex-em/EVUI/commit/972369537db33ea43e49ccab6cc537e833a542ce))
* **ci:** use PAT for release workflow to bypass branch protection ([c25f078](https://github.com/ex-em/EVUI/commit/c25f0787ef2fe3e88234e11e1e7813c6c7552e4a))
* resetDataGroup 가 호출되지 않아 범위를 벗어난 데이터를 삭제하지 않는 현상 수정 ([#2105](https://github.com/ex-em/EVUI/issues/2105)) ([f3a3aa4](https://github.com/ex-em/EVUI/commit/f3a3aa40b51581178846f93e20d1f3b8591b4bac))
* use isNil instead of null check for hitItemId in chart interaction ([59aa7c3](https://github.com/ex-em/EVUI/commit/59aa7c3b6e35c8008ed931932dded23027e3558a))
