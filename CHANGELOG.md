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
