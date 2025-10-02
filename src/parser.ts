export type Field = {
  name: string
  isArray: boolean
  value: 'string' | Field[]
}

export function parse(input: string): Field[] {
  let pos = 0

  function skipWhitespace() {
    while (pos < input.length && /\s/.test(input[pos])) {
      pos++
    }
  }

  function parseIdentifier(): { name: string; isArray: boolean } | null {
    skipWhitespace()
    let ident = ''
    while (pos < input.length && /[a-zA-Z_]/.test(input[pos])) {
      ident += input[pos]
      pos++
    }
    if (!ident) return null

    // Check for array marker []
    let isArray = false
    if (input[pos] === '[' && input[pos + 1] === ']') {
      isArray = true
      pos += 2 // consume '[]'
    }

    return { name: ident, isArray }
  }

  function parseObject(): Field[] | null {
    skipWhitespace()
    if (input[pos] !== '{') return null
    pos++ // consume '{'

    const fields: Field[] = []

    while (true) {
      skipWhitespace()
      if (input[pos] === '}') {
        pos++ // consume '}'
        break
      }

      const ident = parseIdentifier()
      if (!ident) {
        throw new Error(`Expected identifier at position ${pos}`)
      }

      skipWhitespace()
      if (input[pos] === '{') {
        const nested = parseObject()
        if (!nested) {
          throw new Error(`Expected object at position ${pos}`)
        }
        fields.push({ name: ident.name, isArray: ident.isArray, value: nested })
      } else {
        fields.push({ name: ident.name, isArray: ident.isArray, value: 'string' })
      }
    }

    return fields
  }

  const result = parseObject()
  if (!result) {
    throw new Error('Expected object')
  }

  skipWhitespace()
  if (pos !== input.length) {
    throw new Error(`Unexpected content at position ${pos}`)
  }

  return result
}
