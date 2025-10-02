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

// Extract identifier (letters only for simplicity) - now handles [] suffix for arrays
type IdentifierWithArray<S extends string> =
  S extends `${infer Char}${infer Rest}`
    ? Char extends 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k' | 'l' | 'm' | 'n' | 'o' | 'p' | 'q' | 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y' | 'z' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'P' | 'Q' | 'R' | 'S' | 'T' | 'U' | 'V' | 'W' | 'X' | 'Y' | 'Z' | '_'
      ? `${Char}${IdentifierWithArray<Rest>}`
      : Char extends '['
        ? Rest extends `]${infer After}`
          ? After extends ''
            ? '[]'
            : ''
          : ''
        : ''
    : ''

// Split identifier and array marker
type SplitIdentifier<S extends string> =
  S extends `${infer Name}[]`
    ? { name: Name; isArray: true }
    : { name: S; isArray: false }

// Accumulator-based parsing to build a single object type
type ParseFieldsAcc<S extends string, Acc extends Record<string, any> = {}> =
  Trim<S> extends ''
    ? Acc
    : Trim<S> extends `${infer Name} ${infer Rest}`
      ? IdentifierWithArray<Name> extends infer ID extends string
        ? ID extends ''
          ? Acc
          : SplitIdentifier<ID> extends { name: infer FieldName extends string; isArray: infer IsArray }
            ? Trim<Rest> extends `{${infer Nested}}${infer After}`
              ? IsArray extends true
                ? ParseFieldsAcc<Trim<After>, Acc & { [K in FieldName]: ParseObject<Nested>[] }>
                : ParseFieldsAcc<Trim<After>, Acc & { [K in FieldName]: ParseObject<Nested> }>
              : IsArray extends true
                ? ParseFieldsAcc<Trim<Rest>, Acc & { [K in FieldName]: string[] }>
                : ParseFieldsAcc<Trim<Rest>, Acc & { [K in FieldName]: string }>
            : Acc
        : Acc
    : IdentifierWithArray<Trim<S>> extends infer ID extends string
      ? ID extends ''
        ? Acc
        : SplitIdentifier<ID> extends { name: infer FieldName extends string; isArray: infer IsArray }
          ? IsArray extends true
            ? Acc & { [K in FieldName]: string[] }
            : Acc & { [K in FieldName]: string }
          : Acc
      : Acc

// Parse object contents (everything between { and }) - prettify to flatten intersections
type ParseObject<S extends string> = Prettify<ParseFieldsAcc<Trim<S>>>

// Main parse type - expects { ... }
export type Parse<S extends string> = Trim<S> extends `{${infer Content}}`
  ? Prettify<ParseObject<Content>>
  : never

// Type-safe function that creates objects with inferred types
export function create<const T extends string>(
  schema: T
): Parse<T> {
  // At runtime, return an empty object (or you could parse and validate)
  return {} as Parse<T>
}
