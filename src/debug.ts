import type { DataModel } from './model'

// Copy the parser types to debug
type Trim<S extends string> = S extends ` ${infer R}`
  ? Trim<R>
  : S extends `${infer R} `
    ? Trim<R>
    : S

type Identifier<S extends string> =
  S extends `${infer Char}${infer Rest}`
    ? Char extends 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z' | '_'
      ? `${Char}${Identifier<Rest>}`
      : ''
    : ''

type ParseFields<S extends string> =
  Trim<S> extends ''
    ? []
    : Trim<S> extends `${infer Name} ${infer Rest}`
      ? Identifier<Name> extends infer ID extends string
        ? ID extends ''
          ? []
          : Trim<Rest> extends `{${string}`
            ? any
            : [{ name: ID }, ...ParseFields<Rest>]
        : []
    : Identifier<Trim<S>> extends infer ID extends string
      ? ID extends ''
        ? []
        : [{ name: ID }]
      : []

type ParseQuery<S extends string> =
  Trim<S> extends `${infer Entity} {${infer Projection}}`
    ? Identifier<Entity> extends infer E extends string
      ? { entity: E; fields: ParseFields<Projection> }
      : never
    : never

// Test parsing
type Test1 = ParseQuery<'employee { name department { name } }'>
type Test2 = ParseFields<'name department { name }'>
type Test3 = ParseFields<'name age'>

// Export for inspection
export type _Test1 = Test1
export type _Test2 = Test2
export type _Test3 = Test3
