type Field = {
  readonly name: string
  readonly value: 'string' | readonly Field[]
}

type TestField = {
  readonly name: 'id'
  readonly value: 'string'
}

// Test if we can use the name
type Test1 = { [K in TestField['name']]: string }  // Should be { id: string }

// Test with actual parsed field
type ParsedField = [{
  readonly name: "id"
  readonly value: "string"
}, {
  readonly name: "name"
  readonly value: "string"
}]

type First = ParsedField extends readonly [infer F, ...any[]] ? F : never

type Test2 = First extends Field ? 'yes' : 'no'  // Should be 'yes'
type Test3 = First extends { name: infer N } ? N : never  // Should be 'id'
type Test4 = { [K in First extends { name: infer N extends string } ? N : never]: string }  // Should be { id: string }

export const t1: Test1 = null as any
export const t2: Test2 = null as any
export const t3: Test3 = null as any
export const t4: Test4 = null as any
