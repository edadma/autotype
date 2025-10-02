import { createModel } from './model'
import { query } from './query'

const model = createModel({
  employee: {
    name: { type: 'string' },
    age: { type: 'number' },
    department: { type: 'ref', entity: 'department' }
  },
  department: {
    name: { type: 'string' },
    budget: { type: 'number' }
  }
})

// Test type inference
const result1 = query('employee { name age }', model)
const result2 = query('employee { name department { name budget } }', model)

// These should type-check correctly
const test1: { name: string; age: number }[] = result1
const test2: { name: string; department: { name: string; budget: number } }[] = result2

// These should error - uncomment to test
// const error1: { name: string; salary: number }[] = result1  // salary doesn't exist
// const error2: { name: number }[] = result1  // name should be string, not number

console.log('Type checking passed!')
