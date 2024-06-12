# evui/ui

## TODO

- [ ] Add Type

## How to use

1. Install the package

```bash
npm install @evui/ui
```

2. Apply Plugin

```typescript
// main.ts
import EVUI, { EvMessageBox, EvMessage, EvNotification } from '@evui/ui';
import '@evui/ui/style';

const app = createApp(App);
app.use(EVUI);
```

3. Add global type

```typescript
// tsconfig.json
{
  ...
  "compilerOptions": {
    "types": ["@evui/ui/global"]
  }
  ...
}
```
