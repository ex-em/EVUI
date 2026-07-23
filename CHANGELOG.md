# [3.16.0](https://github.com/ex-em/EVUI/compare/3.15.0...3.16.0) (2026-07-23)


### Features

* **tabs:** 오버플로우/선택 상태 변화에 헤더 스크롤이 반응하도록 개선 ([780e21b](https://github.com/ex-em/EVUI/commit/780e21b33cc8e2786c3b7f33bc49f19ef9f1c726))

# [3.15.0](https://github.com/ex-em/EVUI/compare/3.14.0...3.15.0) (2026-07-20)


### Bug Fixes

* **chart:** realtime scatter 만료 전 stale series가 마지막 키일 때 X축 freeze 수정 ([d038670](https://github.com/ex-em/EVUI/commit/d0386701bea819c97e845bc72d421c6f7191fcd8))
* **chart:** 어노테이션 코드리뷰 지적 수정 (padding/격리/axis/textAlign/teardown) ([66e57b5](https://github.com/ex-em/EVUI/commit/66e57b54bd7d1df4f8e3a56238e368976fd98b8c)), closes [#2306](https://github.com/ex-em/EVUI/issues/2306)
* color visual spec 워크로드 축소로 timeout 해소 ([6fe405b](https://github.com/ex-em/EVUI/commit/6fe405b508e671bf6d4445588f912c5ea5766545))
* realtime scatter blit fast-path를 full redraw와 픽셀 동등하게 수정 ([5ffcb0a](https://github.com/ex-em/EVUI/commit/5ffcb0a1b7ac98a068433ecce5fd9ad8d7a88142))
* realtime scatter blit 반투명·분수 DPR 폴백 + cross-series dedupe 복원 ([dfe62b0](https://github.com/ex-em/EVUI/commit/dfe62b0f5b0c27b0b97c018d2b8a485afbffff27))
* realtime scatter blit 반투명(opacity) 지원 — opaqueFill gate 제거, per-point drawn 플래그 ([d181b45](https://github.com/ex-em/EVUI/commit/d181b45beb220ff3792df2cdcd3aef1516b4361c))
* realtime scatter blit 분수 DPR 지원 — q배수 시프트로 device px 정수화 ([d4407ae](https://github.com/ex-em/EVUI/commit/d4407ae07e4322a5522ed69dcc1cb670ffd8473a))
* realTimeScatter 만료된 개별 series 자동 제거 ([3ea2ce9](https://github.com/ex-em/EVUI/commit/3ea2ce98000bff0cfb7562bf57cea756768bd7ba))


### Features

* **chart:** 어노테이션 series location 의 start/end 를 non-null 첫/마지막으로 변경 ([d42da46](https://github.com/ex-em/EVUI/commit/d42da46c16585ac2bbf242f7fa890e11b1dc1fd3))
* **chart:** 어노테이션/뱃지 모듈 추가 ([5be02a2](https://github.com/ex-em/EVUI/commit/5be02a2927ccf0278429b2b0ce8a90937d1048f0))

# [3.14.0](https://github.com/ex-em/EVUI/compare/3.13.0...3.14.0) (2026-06-30)


### Bug Fixes

* **chart:** 슬라이딩 윈도우 시간축 라벨 점프 현상 수정 ([12b10ae](https://github.com/ex-em/EVUI/commit/12b10aec9603cc0110c66a3d48644fefb93085c8))


### Features

* **chart:** plotLine/plotBand/plotLabel 옵션 확장 및 라벨 렌더링 개선 ([47d71c6](https://github.com/ex-em/EVUI/commit/47d71c6ab06d8fe022987080b5fa661c79955489))
* **chart:** plotLines/plotBands z-order 옵션(plot.aboveSeries) 추가 ([501ff60](https://github.com/ex-em/EVUI/commit/501ff60b2a7b0b5eed12dddb9e27e2f76057b19e))

# [3.13.0](https://github.com/ex-em/EVUI/compare/3.12.1...3.13.0) (2026-06-30)


### Bug Fixes

* **chart:** keepDisplay 리사이즈 시 displayFromStartArea 사각형의 startArea 꼬리 드리프트 보정 ([9b82dc8](https://github.com/ex-em/EVUI/commit/9b82dc8a8d996aaa60878e53218b90e5069c0271))
* **chart:** startArea 내에서 드래그 시 텍스트 선택이 되지 않도록 user-select 속성을 비활성화 ([5eb62d9](https://github.com/ex-em/EVUI/commit/5eb62d9de29101e39ff00d22612be859f57b834b))
* clampOnStep, stepStrictly 스펙 충돌 수정 ([41a1525](https://github.com/ex-em/EVUI/commit/41a1525cf1c9d9ef0a8bd1ca07e8074fffb7514a))
* disableEmpty 와 stepStrictly 충돌 해소 ([5c8945a](https://github.com/ex-em/EVUI/commit/5c8945afb866856c6917de483c87ad2a76774d59))
* 화살표 버튼 값 조절 오류 수정, 테스트 코드 추가 ([4ccba2e](https://github.com/ex-em/EVUI/commit/4ccba2e3463985a16561eb6fe943eb290d01bb78))


### Features

* **chart:** dragSelection을 캔버스 바깥에서 시작할 수 있는 startArea 옵션 추가 ([746014e](https://github.com/ex-em/EVUI/commit/746014ebf43af38d9e036b6f6d2a172ea88a1c15))
* **chart:** scatter 드래그 선택을 startArea 지점부터 표시하는 displayFromStartArea 옵션 추가 ([82a5fe4](https://github.com/ex-em/EVUI/commit/82a5fe4fc84a8f147c847958186a6a721de9d203))
* disableEmpty 옵션 추가 ([3cedb1c](https://github.com/ex-em/EVUI/commit/3cedb1cc20d8b7b04856cd2e886c32630355c75a))
* inputNumber clampOnStep 옵션 추가 ([d7ce684](https://github.com/ex-em/EVUI/commit/d7ce6843e5acb5738f20b692fd24613cb056fb5f))

## [3.12.1](https://github.com/ex-em/EVUI/compare/3.12.0...3.12.1) (2026-06-23)


### Bug Fixes

* **chart:** 커스텀 툴팁 위치 계산 시 offsetWidth undefined 크래시 수정 ([3c05826](https://github.com/ex-em/EVUI/commit/3c05826221efa5b9572c3cdd1b6f441195e39222))

# [3.12.0](https://github.com/ex-em/EVUI/compare/3.11.0...3.12.0) (2026-06-19)


### Features

* **chart:** ev-chart-group deferPollingRedraw provide (자식 차트 호출 가능) ([fbb3c28](https://github.com/ex-em/EVUI/commit/fbb3c28db918634ab2850b56a0ce247bdf80a7bf))
* **chart:** selectSeries 선택 라인 항상 최상위(dimmed 묻힘 방지) ([38a3c95](https://github.com/ex-em/EVUI/commit/38a3c95f2a52d2b26a131d464c88fb57dd00b3de))


### Performance Improvements

* **chart:** selectSeries 변화 없으면 재렌더 스킵 ([b022539](https://github.com/ex-em/EVUI/commit/b0225395b2af3186a75940cb47225aa81dad3d6c))
* **chart:** shallowOptionsWatch opt-in 추가 (options deep watch 비용 제거) ([4a65bef](https://github.com/ex-em/EVUI/commit/4a65befca997e0ef4edebbd7947d69504fca2166))
* **chart:** 인터랙션 중 폴링 리드로우 양보(deferPollingRedraw) ([97b6373](https://github.com/ex-em/EVUI/commit/97b6373b46734e672a068aedecb340d0a959638f))

# [3.11.0](https://github.com/ex-em/EVUI/compare/3.10.0...3.11.0) (2026-06-16)


### Bug Fixes

* **chart:** 3.4 rebase 정합 — displayOverflow/clamp parity + 무구독 가드 + 비-circle 배치 ([c637ca9](https://github.com/ex-em/EVUI/commit/c637ca9e21cfc20d9c12ec85b0dc4aa829e4c198))
* **chart:** bar chart range maxTip 정확성 수정 ([a198d85](https://github.com/ex-em/EVUI/commit/a198d856acfcb203f27026db47186ee99702e089))
* **chart:** blit fast-path 의 끊긴 drawAxis/drawSeries 호출 재배선 ([41cee1c](https://github.com/ex-em/EVUI/commit/41cee1c01f1d3dec3af65833bc2cfd40e0f27e63))
* **chart:** minIndex/maxIndex 유효성 검사 로직 개선 ([8dfb809](https://github.com/ex-em/EVUI/commit/8dfb809041a8bce0b58a80263f5a96a4f97a8073))
* **chart:** realtime scatter > maxY 0 clamp 제거 ([77f2d31](https://github.com/ex-em/EVUI/commit/77f2d31234155a432a62e8b0e08b50ffcbd32737))
* **chart:** realtime scatter blit fast-path 재연결로 복원 ([cf1c230](https://github.com/ex-em/EVUI/commit/cf1c23053993841322dd675533eb17ac4f0be803)), closes [#2297](https://github.com/ex-em/EVUI/issues/2297)
* **chart:** realtime scatter blit 좌단 점 잘림 수정 ([32d6ee8](https://github.com/ex-em/EVUI/commit/32d6ee8b572950f901e55736bd07f3ea6d7b182d))
* **chart:** render-error 임계치 경로 이중 렌더 제거 ([dd4540e](https://github.com/ex-em/EVUI/commit/dd4540e4df29324d2e6e6c30cd1eaae0d707a68c))
* **chart:** worker epoch 경합 차단 + 에러 fallback epoch 정합 (이슈1) ([b0d8cdf](https://github.com/ex-em/EVUI/commit/b0d8cdf46bc706489c30b3997ee46dcab6ffa3ea))
* **chart:** worker 렌더에 passingValue·segments 옵션 누락 보완 ([ed95682](https://github.com/ex-em/EVUI/commit/ed9568269271eb89b92ef5d4666867a2733d4e42))
* **chart:** worker 렌더에 point·fillOpacity 옵션 누락 보완 ([aabd98f](https://github.com/ex-em/EVUI/commit/aabd98f9e25088103a3c4a62b039239d01a026b5))
* **chart:** worker 무한 재시도 차단 + in-flight 유실 복구 + postMessage 보호 (이슈5/6) ([c07da27](https://github.com/ex-em/EVUI/commit/c07da27f837d89b20f93da6c52421417a660dda0))
* **chart:** worker 버전 핸드셰이크 실효화 + postMessage 실패 이중 렌더 제거 ([cb7b5bb](https://github.com/ex-em/EVUI/commit/cb7b5bb006bb51db8b324400224a3c0903172906))
* **chart:** worker 진입 가드로 미지원 타입·비숫자 축·선택/tip 상태 차단 (이슈2/3/7/8) ([0afa576](https://github.com/ex-em/EVUI/commit/0afa576ea585b561a4504e5f22ec6ced959fddb0))
* **chart:** workerRender 실패/예외 관측성 + 버전 불일치 fallback (이슈4) ([4fbc6d9](https://github.com/ex-em/EVUI/commit/4fbc6d99fd4527da4194619770b833bb2ba8e3ff))
* **chart:** 가상 스크롤 학습 평균이 추정 높이에 반영되도록 우선순위 수정 ([a75d9e8](https://github.com/ex-em/EVUI/commit/a75d9e866275a83835d3f54ea77d44c7598f3a15))
* **chart:** 가시 인덱스 계산 로직에서 Number.isFinite 사용으로 안정성 향상 ([916c044](https://github.com/ex-em/EVUI/commit/916c044a65b2503849386a8ee14c35297e071ebb))
* **chart:** 개선된 가시 인덱스 계산 로직으로 데이터 렌더링 안정성 향상 ([baf95d4](https://github.com/ex-em/EVUI/commit/baf95d4ae4dcfc81361c1c4c69bf83309fcd4cb8))
* **chart:** 기본 설정에서 가상 스크롤 툴팁 휠 스크롤 보장 ([109e8c4](https://github.com/ex-em/EVUI/commit/109e8c4f45b11a1edee359a930c3daa71371327a))
* **chart:** 브러시 데이터 갱신 시 groups 누락 크래시 수정 ([7b23fb8](https://github.com/ex-em/EVUI/commit/7b23fb89b1802982e229ed46eba6ed41546ad391))
* **chart:** 숨김 상태 측정으로 행 높이가 추정값으로 굳는 문제 수정 ([4e7da28](https://github.com/ex-em/EVUI/commit/4e7da286613c78efcbfaa737fbc1a104d9840156))
* **chart:** 툴팁 가상스크롤 비-row 요소 순서 보존 ([4e4b80f](https://github.com/ex-em/EVUI/commit/4e4b80f01867bec7d591f292e211d8bc697d84bd))
* getTimeLabel()이 categoryMode 축에서도 마우스 위치를 연속적인 시간값으로 보간 하는 현상 수정 ([05eb9c7](https://github.com/ex-em/EVUI/commit/05eb9c72958da2a1173e93fb9deee121597acea5))


### Features

* **chart:** axes-data-max-change 를 모든 차트 타입에서 사용 가능하게 일반화 ([2d12210](https://github.com/ex-em/EVUI/commit/2d12210b6a1359e860f943c0c227d9d2f1b9c725))
* **chart:** axis range에 따른 가시 인덱스 보정 로직 추가 ([c9db6fe](https://github.com/ex-em/EVUI/commit/c9db6fef0d72e8456d91436b67aa58c27868a77c))
* **chart:** props.data deep-watch opt-out 옵션 추가 (options.shallowDataWatch, 기본 off) ([e7d7807](https://github.com/ex-em/EVUI/commit/e7d780758ad33ab363e5eb82b996c00d140c54dc))
* **chart:** scatter realtime 데이터 y 최대값을 올리는 axes-data-max-change 이벤트 추가 ([4ed4d95](https://github.com/ex-em/EVUI/commit/4ed4d9527d8b2649e91210d6e04d911e266bdd31))
* **chart:** worker 렌더 오프로딩 chart.core 연결 + opt-in (options.workerRender, 기본 off) ([3de47b6](https://github.com/ex-em/EVUI/commit/3de47b65888a3b7fed7fa162ef4ed65aeb40c0c8))
* **chart:** worker 렌더러 인프라 추가 (gate/entry/unpack, 미연결) ([783d497](https://github.com/ex-em/EVUI/commit/783d497b7e08f8b95d3a03a1ccc47af073f121dc))
* **chart:** 렌더 스냅샷 계약 모듈 추가 (render.snapshot, 미연결) ([4330fa2](https://github.com/ex-em/EVUI/commit/4330fa20d1b7e11b15054f2c402e7b834bdd87c4))
* **chart:** 인덱스 범위 계산 개선을 위해 TimeCategoryScale에 calculateScaleRange 메서드 추가 ([1a707fd](https://github.com/ex-em/EVUI/commit/1a707fd019264f3ef296c528719507a5690cf669))
* **chart:** 커스텀 툴팁(html formatter) 가상 스크롤 지원 ([5065e59](https://github.com/ex-em/EVUI/commit/5065e59b860a065627c332217925c851f3fc8662))


### Performance Improvements

* **chart:** addSeriesStackDS 죽은 캐시 제거 + 점객체 풀 재사용 ([f6fc5bc](https://github.com/ex-em/EVUI/commit/f6fc5bc78a6c7749fbebb3d8b927d677403ad696))
* **chart:** closePath per-point/per-region 제거 (dense 렌더 비용 제거) ([8b7e4ae](https://github.com/ex-em/EVUI/commit/8b7e4aeae8c5d910d327d5ded4cd2a9d4d6eba7f))
* **chart:** custom tooltip hover 비용 절감 (시그니처 기반 redraw 스킵 + 포맷·필터 캐시) ([01e6c8d](https://github.com/ex-em/EVUI/commit/01e6c8d9550976cf251f9ed7231f6a418b248e47))
* **chart:** geometry 메모이즈로 불변 프레임 재계산 skip (line/bar) ([328bd34](https://github.com/ex-em/EVUI/commit/328bd3435f7fe0de54655c15d98893d8c6510c87))
* **chart:** hit-test hover 핫패스 축소 (라벨 유효성 mask 사전계산 + fallback 조건부) ([9bdf8dc](https://github.com/ex-em/EVUI/commit/9bdf8dcf5eaa321e95b3d669a6f0e985e573bf07))
* **chart:** line computeGeometry scalingFactor 루프 밖 hoist ([ae5068f](https://github.com/ex-em/EVUI/commit/ae5068f9bc300fcc5d148ea19841a8eac4fe8f7d))
* **chart:** line draw 매 프레임 할당 제거 (fill 경로 한정 스캔 + valueArray 제거) ([ed1a7fa](https://github.com/ex-em/EVUI/commit/ed1a7fa6f7881ea9e9eabe3ac811db4843dfcbca))
* **chart:** line draw 색 변환을 인스턴스 슬롯 캐시로 (colorStringToRgba 호출부) ([83830bc](https://github.com/ex-em/EVUI/commit/83830bc548462f86a4befa764ec2d8b708d681a9))
* **chart:** line draw 시 동일 픽셀 lineTo 생략 (draw-skip, 출력 불변) ([38d22cb](https://github.com/ex-em/EVUI/commit/38d22cb7c3cbff73431da120eae5eab04dc5c00c))
* **chart:** line 시리즈 포인트 그리기 batching 으로 캔버스 flush 횟수 감소 ([9864004](https://github.com/ex-em/EVUI/commit/9864004a2b653198e0108ac754cf2fe172d257ff))
* **chart:** line 전부-null 시리즈 래스터 skip (범례/툴팁/기하 불변) ([8fda18c](https://github.com/ex-em/EVUI/commit/8fda18cd6ae8e9316e82e83b07fa97b580d4b50d))
* **chart:** line 핫 per-point 루프 forEach → for (draw/computeGeometry) ([5cbfcbf](https://github.com/ex-em/EVUI/commit/5cbfcbf0a30d69aaa8a7dede4cf9d6b6238085ca))
* **chart:** memoize colorStringToRgba results ([95bf8da](https://github.com/ex-em/EVUI/commit/95bf8da3590749107e46eb936e0ab027b002f1a5))
* **chart:** optimize addSeriesStackDS base lookup for many series with nulls ([19a2ccc](https://github.com/ex-em/EVUI/commit/19a2ccc304c496dfe8d90dcf6bc1d4dd2793be37))
* **chart:** realtime scatter blit fast-path 도입으로 틱당 렌더 비용 절감 ([a42b90f](https://github.com/ex-em/EVUI/commit/a42b90f780bc9f94d4872bbb0afb08786d746f12))
* **chart:** realtime scatter 중복 체크(dedupe) 비용 절감 ([7189897](https://github.com/ex-em/EVUI/commit/71898978ae3e41edf7494183f02438242cf840ee))
* **chart:** reduce deep-watch callback cost in EvChart ([ee01a1e](https://github.com/ex-em/EVUI/commit/ee01a1e1569a09da28b74431243ca85ec6cd0874))
* **chart:** reuse data point objects in addSeriesDS to reduce GC ([38e4030](https://github.com/ex-em/EVUI/commit/38e4030cb08dac76c9912580efb9ddddc97e0d09))
* **chart:** select/maxTip 옵션에서도 worker 렌더 허용 (2/2) ([601675e](https://github.com/ex-em/EVUI/commit/601675e34c71c11185d00e4873daf0f8bd50bb52))
* **chart:** skip canvas reallocation when size is unchanged ([2e3178e](https://github.com/ex-em/EVUI/commit/2e3178eeccc1004268eae559a232beac605e2b1a))
* **chart:** time/step 축 line·bar 의 worker 진입 차단 제거 ([4ceab0f](https://github.com/ex-em/EVUI/commit/4ceab0f1cb7238805a411728445a8cc520b26812))
* **chart:** updateSeries 시 series 인스턴스 증분 재조정(reconcileSeriesSet) ([ffdd5fc](https://github.com/ex-em/EVUI/commit/ffdd5fcb55f3462d82d452ea71fd8aff49c34d2b))
* **chart:** worker snapshot 에 selection 상태 전달 (select 옵션 worker 허용 1/2) ([9c5126c](https://github.com/ex-em/EVUI/commit/9c5126c52c99cdee0f1147dceaa6b0fa2f4b7cf7))
* **chart:** worker snapshot 에서 time/step 축 좌표 숫자 정규화 ([69eb517](https://github.com/ex-em/EVUI/commit/69eb5178b1345ec19166fea5e4dce785019eb3b7))
* **chart:** worker 스냅샷에서 빈 시리즈 제외 (pack/postMessage 비용 절감) ([91b6572](https://github.com/ex-em/EVUI/commit/91b657232924c5db78560ca3d415cb750dc48369))
* **chart:** 다중 차트 hover 시 강제 동기 레이아웃 제거 ([5717c4b](https://github.com/ex-em/EVUI/commit/5717c4ba55661bb9e56b4cc384d5e5f9be94bdf2))
* **chart:** 데이터 파이프라인 cloneDeep/반응성 제거 (normalize 비-mutate, toRaw unwrap) ([6d29c82](https://github.com/ex-em/EVUI/commit/6d29c82cf8dfdb7b60233a700d5646e98a49970b))
* **chart:** 점 마커 색상별 배치 렌더링으로 path-per-point 제거 ([acb935c](https://github.com/ex-em/EVUI/commit/acb935c28c6d5309385353c40544ac02c5b20e10))
* **chart:** 커스텀 툴팁 row 탐지 실패 시 가상 스크롤 재시도 단락 ([857803d](https://github.com/ex-em/EVUI/commit/857803d1081da8602fd53aa9998d35c8490c3e4a))

# [3.10.0](https://github.com/ex-em/EVUI/compare/3.9.3...3.10.0) (2026-06-05)


### Bug Fixes

* **chart:** axis range 밖 데이터의 잘못된 렌더링·tooltip·maxTip 수정 ([15380a9](https://github.com/ex-em/EVUI/commit/15380a9d13e78b66562a54df191d4c58803a5e90))


### Features

* **chart:** line·bar 에 displayOverflow (값 축 초과 경계 표시) 추가 ([97f716e](https://github.com/ex-em/EVUI/commit/97f716e8e63e2c80b678fcc9ab34a4e2bc6f0a93))
* **tabPanel:** 활성화된 적 있는 탭만 mount하는 lazy prop 추가 ([71f78f8](https://github.com/ex-em/EVUI/commit/71f78f82b926f79539826ac5d3b34b16c9db2f2e))

## [3.9.3](https://github.com/ex-em/EVUI/compare/3.9.2...3.9.3) (2026-05-22)


### Bug Fixes

* **chart:** interpolation 'zero' 분기 순서 복원하여 회귀 해소 ([82592d3](https://github.com/ex-em/EVUI/commit/82592d339bc1b856f8118e12b3ea9f19baf6acd6))


### Performance Improvements

* **chart:** addSeriesDS에서 primitive 데이터의 addData 호출을 인라인 객체 생성으로 대체 ([21a144c](https://github.com/ex-em/EVUI/commit/21a144c603c1d5fbef21c92f3da4d284287596f0))
* **chart:** addSeriesDS의 Object.keys 호출을 제거하여 O(N²) 패턴 해소 ([c8f3c2e](https://github.com/ex-em/EVUI/commit/c8f3c2ee02964a1e7c9123da3ae117f8f6712bbe))
* **chart:** createDataSet 내 불필요한 순회 제거 및 루프 최적화 ([3b758bb](https://github.com/ex-em/EVUI/commit/3b758bbc1605c9b4e537087240014193d5adc919))

## [3.9.2](https://github.com/ex-em/EVUI/compare/3.9.1...3.9.2) (2026-05-14)


### Bug Fixes

* **chart:** realtime scatter coordinateDedupe opt-out 복원 + dedupe 주석·헬퍼 정리 ([42b7b00](https://github.com/ex-em/EVUI/commit/42b7b0014c08079b335923b8e6efa9035e30626f))
* **chart:** realtime scatter 동일 좌표 overdraw로 점 굵기가 흔들리는 현상 수정 ([b5c5339](https://github.com/ex-em/EVUI/commit/b5c5339743b7f8000bb16d6634d1abb7e9b65934))
* **chart:** scatter dedupe coordinateDedupe opt-out 복원·중복 dedupe 제거·O(1) Set 마이그레이션 ([4a6fe66](https://github.com/ex-em/EVUI/commit/4a6fe663f5c0330d0dbd8f066335256273b4cc2e))


### Performance Improvements

* **chart:** scatter draw에서 불필요한 drawnKeys.add 호출 제거 ([ad65f35](https://github.com/ex-em/EVUI/commit/ad65f359cb69c20257b0513788fedcb511479eaf))


### Reverts

* **docs:** realtime scatter 예제 테스트 코드 제거 및 3.4 원본 복원 ([f971275](https://github.com/ex-em/EVUI/commit/f971275e3fc02697543e71c6bb512db4e49038d8))

## [3.9.1](https://github.com/ex-em/EVUI/compare/3.9.0...3.9.1) (2026-05-08)


### Bug Fixes

* **chart:** tooltip wheel 이벤트가 viewport 스크롤을 불필요하게 차단하는 문제 수정 ([d2ebaf3](https://github.com/ex-em/EVUI/commit/d2ebaf377b879a78804536cafb0cb04aae8a5976))
* **chart:** tooltip 내부 스크롤 끝 도달 시 viewport로 휠 이벤트가 전파되지 않도록 변경 ([96e5991](https://github.com/ex-em/EVUI/commit/96e599100650f2e855e0cfb8137b6b51d19f62b5))

# [3.9.0](https://github.com/ex-em/EVUI/compare/3.8.2...3.9.0) (2026-05-07)


### Features

* trim-trailing-zero 옵션 추가 ([ff0e792](https://github.com/ex-em/EVUI/commit/ff0e79236639232a099aa82f2b06c3838e437985))

## [3.8.2](https://github.com/ex-em/EVUI/compare/3.8.1...3.8.2) (2026-04-30)


### Bug Fixes

* maxtip이 정상적인 위치에 그려지지 않는 현상 수정 ([65f91be](https://github.com/ex-em/EVUI/commit/65f91befc8d5e6710e557bc80379a49602df2567))
* setBrushXAndWidth 로직 변경 ([ee777c2](https://github.com/ex-em/EVUI/commit/ee777c2b4cfabc0ce38f6de53d963b10934fd7df))

## [3.8.1](https://github.com/ex-em/EVUI/compare/3.8.0...3.8.1) (2026-04-29)


### Bug Fixes

* align out일때, Bar의 크기 고려 하지 않고 표시되도록 함 + Bar랑 겹치는 부분 수정 ([6d86939](https://github.com/ex-em/EVUI/commit/6d86939b16cb55e3d46236ff55bad8740bf6e4c1))
* horizontal + out 조합일때 막대의 두께가 32px을 초과해야만 value가 그려지는 문제 수정 ([8bdf022](https://github.com/ex-em/EVUI/commit/8bdf0221e26dfc669afbed1306e8e9ad92314354))
* out일때, Bar 너비가 아닌 Bar 영역 너비 제한 추가 ([45a3d09](https://github.com/ex-em/EVUI/commit/45a3d0965d8f3cab56b8488894fedeade020683b))
* showValue align 'out' 옵션에서 바 크기와 무관하게 텍스트를 표시하고, 차트 경계 이탈 시에만 숨기도록 수정 ([0414e3d](https://github.com/ex-em/EVUI/commit/0414e3dc3ce86bb0d5fa3f3e528bc20ae30650de))

# [3.8.0](https://github.com/ex-em/EVUI/compare/3.7.0...3.8.0) (2026-04-27)


### Bug Fixes

* **chart:** fill(with null) null 데이터 처리 ([ac27472](https://github.com/ex-em/EVUI/commit/ac274720e8f3d56c9168294e6b9718f63819135c))
* **chart:** selectLabel indicator 텍스트가 클릭 라벨로 표시되도록 보정 ([41e44e8](https://github.com/ex-em/EVUI/commit/41e44e8845f0ceea9031a87c5b09fd432f7212b8))
* improve text positioning for bar elements to prevent overflow and clipping ([1d3df38](https://github.com/ex-em/EVUI/commit/1d3df38f1e7daadae9a60016ed861875706fd0c5))
* out이고 수평일때 bar를 벗어나는 경우 그리지 않음 ([bab78dd](https://github.com/ex-em/EVUI/commit/bab78ddc00436b4cf6238efc2a7272d7e25fcf55))
* text가 bar를 벗어나거나 잘림 현상 ([dc03110](https://github.com/ex-em/EVUI/commit/dc031100d9921592b76e43fc10c73d6f2bd766de))
* 린트 에러 픽스 ([43faa57](https://github.com/ex-em/EVUI/commit/43faa5743b2b67fca973e4a9a6949b031f4b8c63))
* 실패한 테스트 코드 수정 ([7b98327](https://github.com/ex-em/EVUI/commit/7b983271966a6ee32d661c9c01283a7bbd1d4fea))


### Features

* willReadFrequently 옵션을 pie type에만 적용 ([4b5e279](https://github.com/ex-em/EVUI/commit/4b5e279c11133192583fada02a70ba62af2264bf))


### Performance Improvements

* firstLabelFontStyle 옵션이 있을 경우에 대한 처리 ([143bac2](https://github.com/ex-em/EVUI/commit/143bac2712d251cfdfdb9d73e629412f7b76207e))


### Reverts

* y축 buffer 완화 롤백 ([8ad19b8](https://github.com/ex-em/EVUI/commit/8ad19b86c4222cf3215ace9c1262068741d0127e))

# [3.7.0](https://github.com/ex-em/EVUI/compare/3.6.6...3.7.0) (2026-04-24)


### Bug Fixes

* keepDisplay:true 일때 범례 hover 시 드래그 영역 사라짐 ([456f9a3](https://github.com/ex-em/EVUI/commit/456f9a3ff378c1ed68687c64a7c1c1dbb098cf10))
* time scale 코드 리뷰 피드백 반영 ([8b3ea5f](https://github.com/ex-em/EVUI/commit/8b3ea5fcf5d371f3e8a04719ca68315e6c8b08e2))


### Features

* 시간 축 데이터 범위는 유지하면서 interval의 절대 시간 boundary 기준으로만 표시하도록 함 ([b3bf6f0](https://github.com/ex-em/EVUI/commit/b3bf6f0482a292a209d707b860db5cc89ee55232))

## [3.6.6](https://github.com/ex-em/EVUI/compare/3.6.5...3.6.6) (2026-04-24)


### Bug Fixes

* dense 데이터에서 hover snap threshold 보정 ([d037ea0](https://github.com/ex-em/EVUI/commit/d037ea0f2cc898549654c54da40446c76a832634))
* selectedLabel 사용중일때 데이터가 없는 부분 선택이 되지 않는 현상 수정 ([f62d032](https://github.com/ex-em/EVUI/commit/f62d03277b47acc565dc79c0408d5a4234d77d22))


### Reverts

* 테스트 예제 삭제 ([608a87d](https://github.com/ex-em/EVUI/commit/608a87d0e1d047cbf5e075cf1fc80b84c350a867))

## [3.6.5](https://github.com/ex-em/EVUI/compare/3.6.4...3.6.5) (2026-04-20)


### Bug Fixes

* horizontal: true이고 라벨이 2개일때 마지막 라벨이 나오지 않는 이슈 ([bd5be24](https://github.com/ex-em/EVUI/commit/bd5be24605017e3a0a4f2887859c51d785319e18))
* linear 일때만 x축에 소수점을 더하여 계산하는 로직을 타도록 수정 ([c088895](https://github.com/ex-em/EVUI/commit/c088895658badf57a39085f6388cfc64e989a407))
* time 축 category 모드일때 라벨 겹침 현상 ([7b9861e](https://github.com/ex-em/EVUI/commit/7b9861e3889f407fb381135ec9637ed438f500a1))
* 테스트 코드 추가 ([15a47c7](https://github.com/ex-em/EVUI/commit/15a47c7de2ecc25b135a07f95c2900dcbe4a8ec2))

## [3.6.4](https://github.com/ex-em/EVUI/compare/3.6.3...3.6.4) (2026-04-17)


### Bug Fixes

* chart selectLabel 빠른 연속 클릭 시 click 이벤트 소실 수정 ([#2221](https://github.com/ex-em/EVUI/issues/2221)) ([68f0346](https://github.com/ex-em/EVUI/commit/68f03461c1bb276741b3d332c6bdafc62cb055c8))
* step: 1일때 nice scale 적용되지 않음 ([86ce60a](https://github.com/ex-em/EVUI/commit/86ce60a0c4afbb7a51d92c04e71b2e5351168de1))
* 불필요한 스크린샷 파일 삭제 ([2c005d8](https://github.com/ex-em/EVUI/commit/2c005d8c8829d4cab70ab3454f7fe18dc172bbc2))

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
