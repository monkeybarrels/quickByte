# @quickbyte/cli

Command-line interface for running QuickByte data pipelines. This tool allows you to run, validate, and inspect data pipelines defined in JSON configuration files.

## Table of Contents
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Command Reference](#command-reference)
- [Configuration Guide](#configuration-guide)
- [Component Types](#component-types)
- [Error Handling](#error-handling)
- [Logging](#logging)
- [Development](#development)

## Installation

### Global Installation
```bash
npm install -g @quickbyte/cli
```

### Local Installation
```bash
npm install @quickbyte/cli --save-dev
```

## Quick Start

1. Create a pipeline configuration file (e.g., `pipeline.json`)
2. Run your pipeline:
```bash
quickbyte run pipeline.json
```

## Command Reference

### `quickbyte run <configPath>`
Runs a pipeline from a configuration file.

**Options:**
- `--dry-run`: Validate and show pipeline plan without executing
- `--verbose`: Show detailed execution logs
- `--output <path>`: Specify custom output path for results

**Example:**
```bash
quickbyte run pipeline.json --dry-run --verbose
```

### `quickbyte validate <configPath>`
Validates a pipeline configuration without executing it.

**Options:**
- `--strict`: Enable strict validation mode
- `--schema <path>`: Use custom validation schema

**Example:**
```bash
quickbyte validate pipeline.json --strict
```

### `quickbyte list`
Lists all registered component types.

**Options:**
- `--type <type>`: Filter by component type (reader/transformer/writer)
- `--json`: Output in JSON format

**Example:**
```bash
quickbyte list --type reader
```

## Configuration Guide

### Basic Structure
```json
{
  "reader": {
    "type": "<reader_type>",
    "location": "<source>",
    "options": {}
  },
  "transformers": [
    {
      "type": "<transformer_type>",
      "options": {}
    }
  ],
  "writer": {
    "type": "<writer_type>",
    "location": "<destination>",
    "options": {}
  }
}
```

### Configuration Examples

#### CSV to CSV Pipeline
```json
{
  "reader": {
    "type": "CSV",
    "location": "input.csv",
    "options": {
      "headers": true,
      "delimiter": ",",
      "encoding": "utf-8"
    }
  },
  "transformers": [
    {
      "type": "MAP",
      "mapping": {
        "id": "id",
        "name": "fullName"
      }
    }
  ],
  "writer": {
    "type": "CSV",
    "location": "output.csv",
    "options": {
      "headers": true,
      "delimiter": ",",
      "encoding": "utf-8"
    }
  }
}
```

#### File to MongoDB Pipeline with Enrichment
```json
{
  "reader": {
    "type": "FILE",
    "location": "data.json",
    "options": {
      "parseJson": true,
      "encoding": "utf-8"
    }
  },
  "transformers": [
    {
      "type": "ENRICH",
      "urlTemplate": "https://api.example.com/users/{id}",
      "merge": true,
      "onError": "skip",
      "timeout": 5000
    },
    {
      "type": "FILTER",
      "condition": "item.status === 'active'"
    }
  ],
  "writer": {
    "type": "MONGO",
    "location": "mongodb://localhost:27017",
    "options": {
      "database": "mydb",
      "collection": "users",
      "batchSize": 1000
    }
  }
}
```

## Component Types

### Readers

#### CSV Reader
- **Type**: `CSV`
- **Options**:
  - `headers`: boolean (default: true)
  - `delimiter`: string (default: ",")
  - `encoding`: string (default: "utf-8")

#### File Reader
- **Type**: `FILE`
- **Options**:
  - `parseJson`: boolean
  - `encoding`: string
  - `chunkSize`: number

#### API Reader
- **Type**: `API`
- **Options**:
  - `method`: string
  - `headers`: object
  - `queryParams`: object
  - `timeout`: number

#### MongoDB Reader
- **Type**: `MONGO`
- **Options**:
  - `database`: string
  - `collection`: string
  - `query`: object
  - `batchSize`: number

### Transformers

#### Map Transformer
- **Type**: `MAP`
- **Options**:
  - `mapping`: object
  - `strict`: boolean

#### Filter Transformer
- **Type**: `FILTER`
- **Options**:
  - `condition`: string
  - `inverse`: boolean

#### Enrich Transformer
- **Type**: `ENRICH`
- **Options**:
  - `urlTemplate`: string
  - `merge`: boolean
  - `onError`: string
  - `timeout`: number

### Writers

#### CSV Writer
- **Type**: `CSV`
- **Options**:
  - `headers`: boolean
  - `delimiter`: string
  - `encoding`: string

#### MongoDB Writer
- **Type**: `MONGO`
- **Options**:
  - `database`: string
  - `collection`: string
  - `batchSize`: number
  - `upsert`: boolean

## Error Handling

The CLI provides comprehensive error handling with detailed messages for:

- Configuration validation errors
- Pipeline execution errors
- Component initialization failures
- Data processing errors
- Network and I/O errors

Error messages include:
- Error type and code
- Detailed description
- Affected component
- Suggested fixes

## Logging

The CLI provides detailed logging with the following features:

- Timestamps for each operation
- Success and error messages
- Pipeline progress information
- Component-specific logs
- Performance metrics

Log levels:
- ERROR: Critical errors
- WARN: Warning messages
- INFO: General information
- DEBUG: Detailed debugging information

## Development

### Setup
1. Clone the repository
2. Install dependencies:
```bash
npm install
```

### Building
```bash
npm run build
```

### Testing
```bash
npm test
```

### Local Development
```bash
npm link
```

### Contributing
1. Create a feature branch
2. Make your changes
3. Run tests
4. Submit a pull request 