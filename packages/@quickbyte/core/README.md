# @quickbyte/core

A flexible, low-code data transformation pipeline for Node.js.

## Installation

```bash
npm install @quickbyte/core
```

## Usage

```typescript
import { createDataTransformer } from '@quickbyte/core';

// Create a transformer
const transformer = createDataTransformer({
  // Configuration
});

// Transform data
const result = await transformer.transform(data);
```

## License

MIT
