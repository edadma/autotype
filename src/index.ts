import { createModel } from './model'
import { query, type Database } from './query'

// Define a simple data model for a small company
const model = createModel({
  employee: {
    id: { type: 'number' },
    name: { type: 'string' },
    age: { type: 'number' },
    salary: { type: 'number' },
    hireDate: { type: 'date' },
    department: { type: 'ref', entity: 'department' },
    subordinates: { type: 'array', entity: 'employee' },
  },
  department: {
    id: { type: 'number' },
    name: { type: 'string' },
    budget: { type: 'number' },
    employees: { type: 'array', entity: 'employee' },
  },
})

// Create a toy database for a small tech company
const engineering = {
  id: 1,
  name: 'Engineering',
  budget: 500000,
  employees: [] as any[], // Will be filled below
}

const sales = {
  id: 2,
  name: 'Sales',
  budget: 300000,
  employees: [] as any[],
}

const alice = {
  id: 1,
  name: 'Alice',
  age: 35,
  salary: 120000,
  hireDate: new Date('2020-01-15'),
  department: engineering,
  subordinates: [] as any[],
}

const bob = {
  id: 2,
  name: 'Bob',
  age: 28,
  salary: 95000,
  hireDate: new Date('2021-03-20'),
  department: engineering,
  subordinates: [],
}

const carol = {
  id: 3,
  name: 'Carol',
  age: 32,
  salary: 105000,
  hireDate: new Date('2020-08-10'),
  department: engineering,
  subordinates: [],
}

const david = {
  id: 4,
  name: 'David',
  age: 40,
  salary: 110000,
  hireDate: new Date('2019-05-12'),
  department: sales,
  subordinates: [] as any[],
}

const eve = {
  id: 5,
  name: 'Eve',
  age: 26,
  salary: 80000,
  hireDate: new Date('2022-01-05'),
  department: sales,
  subordinates: [],
}

// Set up relationships
alice.subordinates = [bob, carol]
david.subordinates = [eve]
engineering.employees = [alice, bob, carol]
sales.employees = [david, eve]

const db: Database = {
  employee: [alice, bob, carol, david, eve],
  department: [engineering, sales],
}

function main() {
  console.log('=== Small Tech Company Database ===\n')

  // Query 1: Simple projection - just names and salaries
  const result1 = query('employee { name salary }', model, db)
  console.log('Query 1 - All employees (name, salary):')
  console.log(JSON.stringify(result1, null, 2))

  // Query 2: Employees with their department
  const result2 = query('employee { name department { name } }', model, db)
  console.log('\nQuery 2 - Employees with department:')
  console.log(JSON.stringify(result2, null, 2))

  // Query 3: Managers with their subordinates
  const result3 = query('employee { name subordinates { name salary } }', model, db)
  console.log('\nQuery 3 - All employees with subordinates:')
  console.log(JSON.stringify(result3, null, 2))

  // Query 4: Departments with their employees
  const result4 = query('department { name budget employees { name age } }', model, db)
  console.log('\nQuery 4 - Departments with employees:')
  console.log(JSON.stringify(result4, null, 2))

  // Query 5: Complex - employees with department and subordinates
  const result5 = query(
    'employee { name salary department { name budget } subordinates { name age } }',
    model,
    db
  )
  console.log('\nQuery 5 - Complete employee info:')
  console.log(JSON.stringify(result5, null, 2))
}

main()
