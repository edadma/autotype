import { createModel } from './model'
import { query } from './query'

// Define a simple data model matching OQL tutorial examples
const model = createModel({
  employee: {
    name: { type: 'string' },
    age: { type: 'number' },
    salary: { type: 'number' },
    hireDate: { type: 'date' },
    department: { type: 'ref', entity: 'department' },
    subordinates: { type: 'array', entity: 'employee' }, // One-to-many self-reference
  },
  department: {
    name: { type: 'string' },
    budget: { type: 'number' },
    employees: { type: 'array', entity: 'employee' }, // One-to-many
  },
})

function main() {
  // Example 1: Simple projection
  const result1 = query('employee { name age }', model)
  console.log('Query 1 - Simple fields:')
  console.log(JSON.stringify(result1, null, 2))

  // Example 2: One-to-many - employee with subordinates (like OQL tutorial)
  const result2 = query('employee { name subordinates { name } }', model)
  console.log('\nQuery 2 - One-to-many (subordinates):')
  console.log(JSON.stringify(result2, null, 2))

  // Example 3: Many-to-one - employee with department
  const result3 = query('employee { name department { name } }', model)
  console.log('\nQuery 3 - Many-to-one (department):')
  console.log(JSON.stringify(result3, null, 2))

  // Example 4: Department with employees array
  const result4 = query('department { name employees { name age } }', model)
  console.log('\nQuery 4 - Department with employees:')
  console.log(JSON.stringify(result4, null, 2))

  // Example 5: Complex nested with both ref and array
  const result5 = query(
    'employee { name department { name } subordinates { name age } }',
    model
  )
  console.log('\nQuery 5 - Complex nested:')
  console.log(JSON.stringify(result5, null, 2))
}

main()
