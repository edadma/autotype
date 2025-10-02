// Test ParseFields directly
type Trim<S extends string> = S extends ` ${infer R}` ? Trim<R> : S extends `${infer R} ` ? Trim<R> : S

type Identifier<S extends string> =
  S extends `${infer Char}${infer Rest}`
    ? Char extends 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z'
      ? `${Char}${Identifier<Rest>}`
      : ''
    : ''

// Copy ParseFields logic (simplified)
type TestParseFields<S extends string> =
  Trim<S> extends ''
    ? []
    : Trim<S> extends `${infer Name} ${infer Rest}`
      ? Identifier<Name> extends infer ID extends string
        ? ID extends ''
          ? []
          : [{ name: ID; value: 'string' }, ...TestParseFields<Rest>]
        : []
      : Identifier<Trim<S>> extends infer ID extends string
        ? ID extends ''
          ? []
          : [{ name: ID; value: 'string' }]
        : []

type Test1 = TestParseFields<'id name'>
type Test2 = TestParseFields<'users'>

export const t1: Test1 = null as any
export const t2: Test2 = null as any
