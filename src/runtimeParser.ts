// Runtime parser for OQL-like query strings
// Phase 1: Parse simple projections like "employee { name age }"

export type ParsedField = {
  name: string
  fields?: ParsedField[]
}

export type ParsedQuery = {
  entity: string
  fields: ParsedField[]
}

export function parseQuery(query: string): ParsedQuery {
  const trimmed = query.trim()

  // Extract entity name (everything before first {)
  const entityMatch = trimmed.match(/^(\w+)\s*\{/)
  if (!entityMatch) {
    throw new Error('Invalid query: expected entity { ... }')
  }

  const entity = entityMatch[1]
  const projectStart = trimmed.indexOf('{')
  const projectEnd = findMatchingBrace(trimmed, projectStart)
  const projection = trimmed.slice(projectStart + 1, projectEnd).trim()

  return {
    entity,
    fields: parseFields(projection)
  }
}

function parseFields(projection: string): ParsedField[] {
  const fields: ParsedField[] = []
  let pos = 0

  while (pos < projection.length) {
    // Skip whitespace
    while (pos < projection.length && /\s/.test(projection[pos])) {
      pos++
    }

    if (pos >= projection.length) break

    // Parse field name
    let fieldName = ''
    while (pos < projection.length && /[a-zA-Z_]/.test(projection[pos])) {
      fieldName += projection[pos]
      pos++
    }

    if (!fieldName) break

    // Skip whitespace
    while (pos < projection.length && /\s/.test(projection[pos])) {
      pos++
    }

    // Check for nested projection
    if (projection[pos] === '{') {
      const nestedStart = pos
      const nestedEnd = findMatchingBrace(projection, nestedStart)
      const nested = projection.slice(nestedStart + 1, nestedEnd).trim()
      fields.push({
        name: fieldName,
        fields: parseFields(nested)
      })
      pos = nestedEnd + 1
    } else {
      fields.push({ name: fieldName })
    }
  }

  return fields
}

function findMatchingBrace(str: string, start: number): number {
  let depth = 1
  let pos = start + 1

  while (pos < str.length && depth > 0) {
    if (str[pos] === '{') depth++
    if (str[pos] === '}') depth--
    pos++
  }

  return pos - 1
}
