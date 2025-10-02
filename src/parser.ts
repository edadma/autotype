import type { Schema } from './schema'

// Simple AST structure
type Field = {
  readonly name: string
  readonly value: 'string' | readonly Field[]
}

// String utilities
type Trim<S extends string> = S extends ` ${infer R}` ? Trim<R> : S extends `${infer R} ` ? Trim<R> : S

// Extract identifier
type Identifier<S extends string> =
  S extends `${infer Char}${infer Rest}`
    ? Char extends 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z' | '_'
      ? `${Char}${Identifier<Rest>}`
      : ''
    : ''

// Parse fields into AST - much simpler without trying to detect arrays
type ParseFields<S extends string> =
  Trim<S> extends ''
    ? []
    : Trim<S> extends `${infer Name} ${infer Rest}`
      ? Identifier<Name> extends infer ID extends string
        ? ID extends ''
          ? []
          : Trim<Rest> extends `{${string}`
            ? // Has nested object - need to find where it ends
              SkipBraced<Trim<Rest>> extends [infer Nested extends string, infer After extends string]
              ? Nested extends `{${infer Content}}`
                ? [{ name: ID; value: ParseFields<Content> }, ...ParseFields<After>]
                : []
              : []
            : // Simple field
              [{ name: ID; value: 'string' }, ...ParseFields<Rest>]
        : []
    : Identifier<Trim<S>> extends infer ID extends string
      ? ID extends ''
        ? []
        : [{ name: ID; value: 'string' }]
      : []

// Skip over {...} counting depth - returns the full {...} and what comes after
type SkipBraced<S extends string> = S extends `{${infer Rest}`
  ? SkipBracedHelper<Rest, [0]> extends [infer Content extends string, infer After extends string]
    ? [`{${Content}`, After]
    : never
  : never

type SkipBracedHelper<S extends string, Stack extends any[]> =
  S extends `{${infer Rest}`
    ? SkipBracedHelper<Rest, [0, ...Stack]> extends [infer Content extends string, infer After extends string]
      ? [`{${Content}`, After]
      : never
    : S extends `}${infer Rest}`
      ? Stack extends [0, ...infer NewStack]
        ? NewStack extends []
          ? ['}', Rest]
          : SkipBracedHelper<Rest, NewStack> extends [infer Content extends string, infer After extends string]
            ? [`}${Content}`, After]
            : never
        : never
      : S extends `${infer Char}${infer Rest}`
        ? SkipBracedHelper<Rest, Stack> extends [infer Content extends string, infer After extends string]
          ? [`${Char}${Content}`, After]
          : never
        : never

// Main parser
export type ParseAST<S extends string> =
  Trim<S> extends `{${infer Content}}`
    ? ParseFields<Content>
    : never

// Convert AST to TypeScript type using schema for array info
// Deep prettify to flatten all intersections
type Prettify<T> = T extends infer U
  ? {
      [K in keyof U]: U[K] extends object
        ? U[K] extends any[]
          ? U[K]
          : Prettify<U[K]>
        : U[K]
    }
  : never

type IsArrayInSchema<S extends Schema, FieldName extends string> = FieldName extends keyof S
  ? S[FieldName] extends { $array: true; $schema: Schema }
    ? true
    : false
  : false

type GetNestedSchema<S extends Schema, FieldName extends string> = FieldName extends keyof S
  ? S[FieldName] extends { $array: true; $schema: infer Nested extends Schema }
    ? Nested
    : {}
  : {}

// Helper to convert fields - using union of single-property objects, then merge
type FieldsToType<Fields extends readonly Field[], SchemaObj extends Schema> =
  UnionToIntersection<FieldToObject<Fields[number], SchemaObj>>

type FieldToObject<F, SchemaObj extends Schema> = F extends { name: infer FieldName extends string; value: infer FieldValue }
  ? {
      [K in FieldName]: FieldValue extends 'string'
        ? IsArrayInSchema<SchemaObj, FieldName> extends true
          ? string[]
          : string
        : FieldValue extends readonly Field[]
          ? IsArrayInSchema<SchemaObj, FieldName> extends true
            ? FieldsToType<FieldValue, GetNestedSchema<SchemaObj, FieldName>>[]
            : FieldsToType<FieldValue, GetNestedSchema<SchemaObj, FieldName>>
          : never
    }
  : {}

// Convert union to intersection
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

export type ParseWithSchema<S extends string, SchemaObj extends Schema> =
  ParseAST<S> extends readonly Field[]
    ? Prettify<FieldsToType<ParseAST<S>, SchemaObj>>
    : never
