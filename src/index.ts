import { autotype } from './typeFunction'
import { Schema } from './schema'

function createSchema<const T extends Schema>(schema: T): T {
  return schema
}

function main() {
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

  const ex1 = autotype('{ users { id posts { title } } }', schema)
  const ex2 = autotype('{ users { posts { title } } }', schema)
}

main()
