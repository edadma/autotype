type Field = {
  name: string
  isArray: boolean
  value: 'string' | Field[]
}

export function generateType(fields: Field[], indent = 0): string {
  const indentStr = '  '.repeat(indent)
  const lines: string[] = []

  for (let i = 0; i < fields.length; i++) {
    const field = fields[i]
    const isLast = i === fields.length - 1

    if (field.value === 'string') {
      const typeStr = field.isArray ? 'string[]' : 'string'
      lines.push(`${indentStr}${field.name}: ${typeStr}${isLast ? '' : ';'}`)
    } else {
      if (field.isArray) {
        lines.push(`${indentStr}${field.name}: {`)
        lines.push(generateType(field.value, indent + 1))
        lines.push(`${indentStr}}[]${isLast ? '' : ';'}`)
      } else {
        lines.push(`${indentStr}${field.name}: {`)
        lines.push(generateType(field.value, indent + 1))
        lines.push(`${indentStr}}${isLast ? '' : ';'}`)
      }
    }
  }

  return lines.join('\n')
}

export function generateTypeString(fields: Field[]): string {
  return `{\n${generateType(fields, 1)}\n}`
}
