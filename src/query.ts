// Query function that combines runtime parsing with type inference

import type { DataModel } from './model'
import type { InferQueryResult } from './typeParser'
import { parseQuery } from './runtimeParser'

// Database type - contains tables (entity arrays)
export type Database = {
  [entityName: string]: any[]
}

// Project a single record based on field selection
function projectRecord(
  record: any,
  fields: Array<{ name: string; fields?: any[] }>,
  entityName: string,
  model: any,
  db: Database
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
      // Nested object (many-to-one) - project the referenced object
      const refValue = record[field.name]
      if (refValue) {
        result[field.name] = projectRecord(refValue, field.fields, fieldDef.entity, model, db)
      } else {
        result[field.name] = null
      }
    } else if (field.fields && fieldDef.type === 'array') {
      // Nested array (one-to-many) - project each element
      const arrayValue = record[field.name]
      if (Array.isArray(arrayValue)) {
        result[field.name] = arrayValue.map(item =>
          projectRecord(item, field.fields!, fieldDef.entity, model, db)
        )
      } else {
        result[field.name] = []
      }
    } else {
      // Simple field - copy value directly
      result[field.name] = record[field.name]
    }
  }

  return result
}

// Main query function with type inference
export function query<const Q extends string, const M extends DataModel>(
  queryString: Q,
  model: M,
  db: Database
): InferQueryResult<Q, M> {
  const parsed = parseQuery(queryString)

  // Get the entity data from database
  const entityData = db[parsed.entity]

  if (!entityData) {
    throw new Error(`Entity '${parsed.entity}' not found in database`)
  }

  if (!Array.isArray(entityData)) {
    throw new Error(`Entity '${parsed.entity}' data is not an array`)
  }

  // Project each record according to the query fields
  const results = entityData.map(record =>
    projectRecord(record, parsed.fields, parsed.entity, model, db)
  )

  return results as InferQueryResult<Q, M>
}
