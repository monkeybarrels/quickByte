# QuickByte

A flexible, low-code data transformation pipeline for Node.js.

## Overview

QuickByte is a powerful, low-code data transformation platform designed to simplify complex data integration workflows. It provides a flexible and extensible platform for handling data transformations across various formats and sources.

## Packages

This monorepo contains the following packages:

- **@quickbyte/core**: The core data transformation library
- **@quickbyte/pipelines**: A plugin for defining transformation pipelines in JSON

## Installation

```bash
# Install the core package
npm install @quickbyte/core

# Install the pipelines plugin
npm install @quickbyte/pipelines
```

## Quick Start

```typescript
import { createDataTransformer } from '@quickbyte/core';

// Create a transformer
const transformer = createDataTransformer({
  // Configuration
});

// Transform data
const result = await transformer.transform(data);
```

## Features

- **Multi-Format Support**: XML, CSV, JSON, MongoDB, API Endpoints, Data Streams
- **Extensible Architecture**: Custom format support through a simple interface
- **Low-Code Approach**: Intuitive transformation pipeline builder

## Documentation

For detailed documentation, visit the [documentation site](https://quickbyte.readthedocs.io/).

## License

MIT 