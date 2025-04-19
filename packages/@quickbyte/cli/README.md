# @quickbyte/cli

Command-line interface for running QuickByte data pipelines. This tool allows you to run, validate, and inspect data pipelines defined in JSON configuration files.

## Installation

```bash
npm install -g @quickbyte/cli
```

## Usage

### Running a Pipeline

Run a pipeline from a config file:

```bash
quickbyte run <configPath>
```

Where `<configPath>` is the path to a JSON file containing your pipeline configuration.

### Validating a Pipeline Config

Validate a pipeline configuration without executing it:

```bash
quickbyte validate <configPath>
```

### Listing Available Components

List all registered component types (readers, transformers, and writers):

```bash
quickbyte list
```

## Example Configurations

### Basic CSV to CSV Pipeline

```json
{
  "reader": {
    "type": "CSV",
    "location": "input.csv",
    "options": {
      "headers": true
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
      "headers": true
    }
  }
}
```

### File to MongoDB Pipeline with Enrichment

```json
{
  "reader": {
    "type": "FILE",
    "location": "data.json",
    "options": {
      "parseJson": true
    }
  },
  "transformers": [
    {
      "type": "ENRICH",
      "urlTemplate": "https://api.example.com/users/{id}",
      "merge": true,
      "onError": "skip"
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
      "collection": "users"
    }
  }
}
```

## Available Component Types

### Readers
- CSV: Read data from CSV files
- FILE: Read data from files (supports JSON and text)
- API: Read data from HTTP APIs
- MEMORY: Read data from memory
- MONGO: Read data from MongoDB

### Transformers
- MAP: Transform fields using a mapping configuration
- FILTER: Filter data based on conditions
- ENRICH: Enrich data from external APIs
- FIELD_MAPPING: Map fields with transformations
- ADD_FIELD: Add new fields to the data

### Writers
- CSV: Write data to CSV files
- FILE: Write data to files
- API: Write data to HTTP APIs
- MEMORY: Write data to memory
- MONGO: Write data to MongoDB

## Development

1. Install dependencies:
```bash
npm install
```

2. Build the package:
```bash
npm run build
```

3. Link the package for local development:
```bash
npm link
```

## Logging

The CLI provides detailed logging of pipeline execution:
- Timestamps for each operation
- Success and error messages
- Pipeline progress information

## Error Handling

The CLI provides clear error messages for:
- Invalid configuration files
- Pipeline execution errors
- Component initialization failures
- Data processing errors 