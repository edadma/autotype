import { autotype, typed, schema } from './typeFunction'

// Example 1: Basic usage with autotype
const user1 = autotype('{ id }')
// Type: { id: string }

const user2 = autotype('{ id name email }')
// Type: { id: string; name: string; email: string }

// Example 2: Nested objects
const post = autotype('{ id store { id } }')
// Type: { id: string; store: { id: string } }

// Example 3: Using typed() to ensure data matches schema
const validUser = typed('{ id name }', {
  id: '123',
  name: 'Alice',
})
// Type: { id: string; name: string }

// This would be a type error:
// const invalidUser = typed('{ id name }', {
//   id: '123',
//   wrong: 'field'
// })

// Example 4: Builder pattern
const userSchema = schema('{ id name email }')

const newUser = userSchema.create()
// Type: { id: string; name: string; email: string }

const isValid = userSchema.validate({ id: '1', name: 'Bob', email: 'bob@example.com' })

// Example 5: Complex nested structures
const complex = autotype('{ user { id name } posts { id title } }')
// Type: {
//   user: { id: string; name: string };
//   posts: { id: string; title: string }
// }

// Export for demonstration
export function demonstrateTypes() {
  console.log('Type inference examples:')
  console.log('user1 type:', typeof user1)
  console.log('user2 type:', typeof user2)
  console.log('post type:', typeof post)
  console.log('complex type:', typeof complex)
}
