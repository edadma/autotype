// Data model type definitions

export type FieldType = 'string' | 'number' | 'date' | 'boolean'

export type EntityField =
  | { type: FieldType }
  | { type: 'ref'; entity: string }
  | { type: 'array'; entity: string } // One-to-many relationship

export type Entity = {
  [fieldName: string]: EntityField
}

export type DataModel = {
  [entityName: string]: Entity
}

// Helper to create a typed data model
export function createModel<const T extends DataModel>(model: T): T {
  return model
}
