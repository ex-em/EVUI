## [3.4.214](https://github.com/ex-em/EVUI/compare/3.4.213...3.4.214) (2026-02-20)


### Bug Fixes

* **ci:** add NODE_AUTH_TOKEN env for npm authentication in release workflow ([4d61aa1](https://github.com/ex-em/EVUI/commit/4d61aa1044ca033ab85c20b1c98faae06f1271eb))
* **ci:** add tagFormat and remove unused 3.0 branch from release config ([137476a](https://github.com/ex-em/EVUI/commit/137476a1e5d122194aa63acc93550a73a555ef7d))
* **ci:** fix release deployment by upgrading Node.js and removing duplicate publish workflow ([9723695](https://github.com/ex-em/EVUI/commit/972369537db33ea43e49ccab6cc537e833a542ce))
* **ci:** use PAT for release workflow to bypass branch protection ([c25f078](https://github.com/ex-em/EVUI/commit/c25f0787ef2fe3e88234e11e1e7813c6c7552e4a))
* resetDataGroup 가 호출되지 않아 범위를 벗어난 데이터를 삭제하지 않는 현상 수정 ([#2105](https://github.com/ex-em/EVUI/issues/2105)) ([f3a3aa4](https://github.com/ex-em/EVUI/commit/f3a3aa40b51581178846f93e20d1f3b8591b4bac))
* use isNil instead of null check for hitItemId in chart interaction ([59aa7c3](https://github.com/ex-em/EVUI/commit/59aa7c3b6e35c8008ed931932dded23027e3558a))
