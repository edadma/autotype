import { autotypeWithSchema } from './typeFunction'
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

  const ex1 = autotypeWithSchema('{ users { id posts { title } } }', schema)
  const ex2 = autotypeWithSchema('{ users { posts { title } } }', schema)
}

main()
