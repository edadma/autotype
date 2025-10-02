// Query function that combines runtime parsing with type inference

import type { DataModel } from './model'
import type { InferQueryResult } from './typeParser'
import { parseQuery } from './runtimeParser'

// Mock data generators
function randomString(): string {
  return Math.random().toString(36).substring(7)
}

function randomNumber(): number {
  return Math.floor(Math.random() * 1000)
}

function randomDate(): Date {
  return new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000)
}

function randomBoolean(): boolean {
  return Math.random() > 0.5
}

// Generate mock value based on field type
function generateValue(fieldType: any): any {
  if (typeof fieldType === 'object' && fieldType.type) {
    switch (fieldType.type) {
      case 'string':
        return randomString()
      case 'number':
        return randomNumber()
      case 'date':
        return randomDate()
      case 'boolean':
        return randomBoolean()
      case 'ref':
        return {} // Will be populated recursively
      default:
        return null
    }
  }
  return null
}

// Generate mock object based on parsed fields and model
function generateMockObject(
  fields: Array<{ name: string; fields?: any[] }>,
  entityName: string,
  model: any
): any {
  const result: any = {}
  const entity = model[entityName]

  if (!entity) {
    throw new Error(`Entity '${entityName}' not found in model`)
  }

  for (const field of fields) {
    const fieldDef = entity[field.name]

    if (!fieldDef) {
      throw new Error(`Field '${field.name}' not found in entity '${entityName}'`)
    }

    if (field.fields && fieldDef.type === 'ref') {
      // Nested object (many-to-one)
      result[field.name] = generateMockObject(field.fields, fieldDef.entity, model)
    } else if (field.fields && fieldDef.type === 'array') {
      // Nested array (one-to-many)
      result[field.name] = Array.from({ length: 2 }, () =>
        generateMockObject(field.fields!, fieldDef.entity, model)
      )
    } else {
      // Simple field
      result[field.name] = generateValue(fieldDef)
    }
  }

  return result
}

// Main query function with type inference
export function query<const Q extends string, const M extends DataModel>(
  queryString: Q,
  model: M,
  count: number = 3
): InferQueryResult<Q, M> {
  const parsed = parseQuery(queryString)

  // Generate mock array of results
  const results = Array.from({ length: count }, () =>
    generateMockObject(parsed.fields, parsed.entity, model)
  )

  return results as InferQueryResult<Q, M>
}
