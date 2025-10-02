// Type-level parser for OQL-like query strings
// Phase 1: Parse simple projections like "employee { name age }"

import type { DataModel, EntityField } from './model'

// String utilities
type Trim<S extends string> = S extends ` ${infer R}`
  ? Trim<R>
  : S extends `${infer R} `
    ? Trim<R>
    : S

// Extract identifier
type Identifier<S extends string> =
  S extends `${infer Char}${infer Rest}`
    ? Char extends 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z' | '_'
      ? `${Char}${Identifier<Rest>}`
      : ''
    : ''

// Parse field list into field names
type ParseFields<S extends string> =
  Trim<S> extends ''
    ? []
    : Trim<S> extends `${infer Name} ${infer Rest}`
      ? Identifier<Name> extends infer ID extends string
        ? ID extends ''
          ? []
          : Trim<Rest> extends `{${string}`
            ? // Has nested object - skip over it for now
              SkipBraced<Trim<Rest>> extends [infer Nested extends string, infer After extends string]
              ? [{ name: ID; nested: Nested }, ...ParseFields<After>]
              : []
            : // Simple field
              [{ name: ID }, ...ParseFields<Rest>]
        : []
    : Identifier<Trim<S>> extends infer ID extends string
      ? ID extends ''
        ? []
        : [{ name: ID }]
      : []

// Skip over {...} counting depth
type SkipBraced<S extends string> =
  S extends `{${infer Rest}`
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

// Extract entity and projection from query
type ParseQuery<S extends string> =
  Trim<S> extends `${infer Entity} {${infer Projection}}`
    ? Identifier<Entity> extends infer E extends string
      ? { entity: E; fields: ParseFields<Projection> }
      : never
    : never

// Resolve field type from model
type ResolveFieldType<
  Model extends DataModel,
  EntityName extends string,
  FieldName extends string
> = EntityName extends keyof Model
  ? FieldName extends keyof Model[EntityName]
    ? Model[EntityName][FieldName] extends { type: infer T }
      ? T extends 'string' ? string
        : T extends 'number' ? number
        : T extends 'date' ? Date
        : T extends 'boolean' ? boolean
        : T extends 'ref'
          ? Model[EntityName][FieldName] extends { type: 'ref'; entity: infer E extends string }
            ? E extends keyof Model ? Model[E] : unknown
            : unknown
          : T extends 'array'
            ? Model[EntityName][FieldName] extends { type: 'array'; entity: infer E extends string }
              ? E extends keyof Model ? Model[E][] : unknown
              : unknown
            : unknown
      : unknown
    : unknown
  : unknown

// Build result type from parsed fields recursively
type FieldsToType<
  Model extends DataModel,
  EntityName extends string,
  Fields extends any[]
> = Fields extends []
  ? {}
  : Fields extends [infer First, ...infer Rest extends any[]]
    ? First extends { name: infer FieldName extends string; nested: infer Nested extends string }
      ? // Nested field (ref or array)
        EntityName extends keyof Model
          ? FieldName extends keyof Model[EntityName]
            ? Model[EntityName][FieldName] extends { type: 'ref'; entity: infer RefEntity extends string }
              ? Nested extends `{${infer NestedProjection}}`
                ? {
                    [K in FieldName]: FieldsToType<Model, RefEntity, ParseFields<NestedProjection>>
                  } & FieldsToType<Model, EntityName, Rest>
                : FieldsToType<Model, EntityName, Rest>
              : Model[EntityName][FieldName] extends { type: 'array'; entity: infer RefEntity extends string }
                ? Nested extends `{${infer NestedProjection}}`
                  ? {
                      [K in FieldName]: FieldsToType<Model, RefEntity, ParseFields<NestedProjection>>[]
                    } & FieldsToType<Model, EntityName, Rest>
                  : FieldsToType<Model, EntityName, Rest>
                : FieldsToType<Model, EntityName, Rest>
            : FieldsToType<Model, EntityName, Rest>
          : FieldsToType<Model, EntityName, Rest>
      : First extends { name: infer FieldName extends string }
        ? // Simple field
          {
            [K in FieldName]: ResolveFieldType<Model, EntityName, FieldName>
          } & FieldsToType<Model, EntityName, Rest>
        : FieldsToType<Model, EntityName, Rest>
    : {}

// Prettify to flatten intersections
type Prettify<T> = {
  [K in keyof T]: T[K]
} & {}

// Main type: infer result type from query string and model
export type InferQueryResult<
  Q extends string,
  Model extends DataModel
> = ParseQuery<Q> extends { entity: infer E extends string; fields: infer F extends any[] }
  ? Prettify<FieldsToType<Model, E, F>>[]
  : never
