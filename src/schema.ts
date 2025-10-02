// Schema object type - explicit field type declarations
// 'string' for simple string fields
// { $array: true, $schema: Schema } for arrays of objects
export type Schema = {
  [key: string]: 'string' | { $array: true; $schema: Schema }
}

// Flatten intersection types for cleaner display
type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

// Type-level string utilities
type TrimLeft<S extends string> = S extends ` ${infer Rest}`
  ? TrimLeft<Rest>
  : S

type TrimRight<S extends string> = S extends `${infer Rest} `
  ? TrimRight<Rest>
  : S

type Trim<S extends string> = TrimLeft<TrimRight<S>>

// Extract identifier (letters only)
type Identifier<S extends string> =
  S extends `${infer Char}${infer Rest}`
    ? Char extends 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z' | '_'
      ? `${Char}${Identifier<Rest>}`
      : ''
    : ''

// Helper to extract content between braces (simplified - assumes well-formed input)
// Extracts from first { to matching }, handling nesting
type ExtractBraced<S extends string, Depth extends any[] = []> =
  S extends `{${infer Rest}`
    ? ExtractBracedContent<Rest, [0]>
    : never

type ExtractBracedContent<S extends string, Depth extends any[]> =
  S extends `{${infer Rest}`
    ? ExtractBracedContent<Rest, [0, ...Depth]> extends [infer Content extends string, infer After extends string]
      ? [`{${Content}`, After]
      : never
    : S extends `}${infer Rest}`
      ? Depth extends [0]
        ? ['', Rest]
        : Depth extends [0, ...infer NewDepth extends any[]]
          ? ExtractBracedContent<Rest, NewDepth> extends [infer Content extends string, infer After extends string]
            ? [`}${Content}`, After]
            : never
          : never
      : S extends `${infer Char}${infer Rest}`
        ? ExtractBracedContent<Rest, Depth> extends [infer Content extends string, infer After extends string]
          ? [`${Char}${Content}`, After]
          : never
        : ['', '']

// Helper to get the item schema for a field
// If field is an array: returns the $schema property
// If field is a string: returns empty object (no nested fields)
type GetFieldSchema<S extends Schema, Field extends string> = Field extends keyof S
  ? S[Field] extends { $array: true; $schema: infer NestedSchema extends Schema }
    ? NestedSchema
    : {}
  : {}

// Helper to check if a field is an array in the schema
type IsArray<S extends Schema, Field extends string> = Field extends keyof S
  ? S[Field] extends { $array: true; $schema: Schema }
    ? true
    : false
  : false

// Accumulator-based parsing with schema - only includes fields from pattern string
type ParseFieldsAcc<
  S extends string,
  SchemaObj extends Schema,
  Acc extends Record<string, any> = {}
> = Trim<S> extends ''
  ? Acc
  : Trim<S> extends `${infer Name} ${infer Rest}`
    ? Identifier<Name> extends infer ID extends string
      ? ID extends ''
        ? Acc
        : ExtractBraced<Trim<Rest>> extends [infer Nested extends string, infer After extends string]
          ? IsArray<SchemaObj, ID> extends true
            ? Nested extends `{${infer N}}`
              ? ParseFieldsAcc<
                  Trim<After>,
                  SchemaObj,
                  Acc & { [K in ID]: ParseObject<N, GetFieldSchema<SchemaObj, ID>>[] }
                >
              : Acc
            : Nested extends `{${infer N}}`
              ? ParseFieldsAcc<
                  Trim<After>,
                  SchemaObj,
                  Acc & { [K in ID]: ParseObject<N, GetFieldSchema<SchemaObj, ID>> }
                >
              : Acc
          : ParseFieldsAcc<Trim<Rest>, SchemaObj, Acc & { [K in ID]: string }>
      : Acc
    : Identifier<Trim<S>> extends infer ID extends string
      ? ID extends ''
        ? Acc
        : Acc & { [K in ID]: string }
      : Acc

// Parse object contents with schema
type ParseObject<S extends string, SchemaObj extends Schema = {}> = Prettify<
  ParseFieldsAcc<Trim<S>, SchemaObj>
>

// Main parse type - parses pattern string and uses schema for array metadata
export type ParseWithSchema<
  S extends string,
  SchemaObj extends Schema
> = Trim<S> extends `{${infer Content}}`
  ? Prettify<ParseObject<Content, SchemaObj>>
  : never
