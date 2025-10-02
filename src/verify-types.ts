import { autotypeWithSchema } from './typeFunction'
import { Schema } from './schema'

function createSchema<const T extends Schema>(schema: T): T {
  return schema
}

const schema = createSchema({
  users: {
    $array: true,
    $schema: {
      id: 'string',
      posts: {
        $array: true,
        $schema: {
          title: 'string',
        },
      },
    },
  },
})

const ex1 = autotypeWithSchema('{ users { id posts { title } } }', schema)
const ex2 = autotypeWithSchema('{ users { posts { title } } }', schema)

// Test 1: Can we access the properties?
const users1 = ex1.users
const firstUser = ex1.users[0]
const userId = ex1.users[0].id
const posts = ex1.users[0].posts
const firstPost = ex1.users[0].posts[0]
const title = ex1.users[0].posts[0].title

// Test 2: ex2 should NOT have id
const users2 = ex2.users
// @ts-expect-error - id should not exist on ex2
const shouldError = ex2.users[0].id

// Test 3: Type checking
const test: typeof ex1 = {
  users: [
    {
      id: 'user1',
      posts: [{ title: 'Post 1' }],
    },
  ],
}

console.log('Type verification passed!')
