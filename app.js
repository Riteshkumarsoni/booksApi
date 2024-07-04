const express = require('express')
const app = express()
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
const dbPath = path.join(__dirname, 'todoApplication.db')
let db = null
const format = require('date-fns/format')
const isMatch = require('date-fns/isMatch')
var isValid = require('date-fns/isValid')
app.use(express.json())
const InitializeDBServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`Some Error occured ${e.message}`)
    process.exit(1)
  }
}
InitializeDBServer()

const hasPriorityandStatusProperties = requestquery => {
  return (
    requestquery.priority !== undefined && requestquery.status !== undefined
  )
}

const hasPriorityproperty = requestquery => {
  return requestquery.priority !== undefined
}

const hasStatusProperty = requestquery => {
  return requestquery.status !== undefined
}

const hasCategoryandStatus = requestquery => {
  return (
    requestquery.status !== undefined && requestquery.category !== undefined
  )
}

const hasCategoryandPriority = requestquery => {
  return (
    requestquery.category !== undefined && requestquery.priority !== undefined
  )
}

const hasSearchProperty = requestquery => {
  return requestquery.search !== undefined
}

const hasCategoryProperty = requestquery => {
  return requestquery.category !== undefined
}

const outPutResult = dbObject => {
  return {
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    status: dbObject.status,
    category: dbObject.category,
    dueDate: dbObject.due_date,
  }
}

app.get('/todos/', async (request, response) => {
  let data = null
  let getTodosQuery = ''
  const {search_q = '', priority, status, category} = request.query

  switch (true) {
    case hasPriorityandStatusProperties(request.query):
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        if (
          status === 'TO DO' ||
          status === 'IN PROGRESS' ||
          status === 'DONE'
        ) {
          getTodosQuery = `
                        SELECT * FROM todo WHERE status = '${status}' AND priority = '${priority}';`
          data = await db.all(getTodosQuery)
          response.send(
            data.map(eachItem => {
              return outPutResult(eachItem)
            }),
          )
        } else {
          response.status(400)
          response.send('Invalid Todo Status')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break

    case hasCategoryandStatus(request.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (
          status === 'TO DO' ||
          status === 'IN PROGRESS' ||
          status === 'DONE'
        ) {
          getTodosQuery = `
                        SELECT * FROM todo WHERE category = '${category}' AND status = '${status}';`
          data = await db.all(getTodosQuery)
          response.send(
            data.map(eachItem => {
              return outPutResult(eachItem)
            }),
          )
        } else {
          response.status(400)
          response.send('Invalid Todo Status')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break

    case hasCategoryandPriority(request.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (
          priority === 'HIGH' ||
          priority === 'MEDIUM' ||
          priority === 'LOW'
        ) {
          getTodosQuery = `
                        SELECT * FROM todo WHERE category = '${category}' AND priority = '${priority}';`
          data = await db.all(getTodosQuery)
          response.send(
            data.map(eachItem => {
              return outPutResult(eachItem)
            }),
          )
        } else {
          response.status(400)
          response.send('Invalid Todo Priority')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break

    case hasPriorityproperty(request.query):
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        getTodosQuery = `
                    SELECT * FROM todo WHERE priority = '${priority}';`
        data = await db.all(getTodosQuery)
        response.send(
          data.map(eachItem => {
            return outPutResult(eachItem)
          }),
        )
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break

    case hasStatusProperty(request.query):
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        getTodosQuery = `
                        SELECT * FROM todo WHERE status = '${status}';`
        data = await db.all(getTodosQuery)
        response.send(
          data.map(eachItem => {
            return outPutResult(eachItem)
          }),
        )
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break

    case hasSearchProperty(request.query):
      getTodosQuery = `
                SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`
      data = await db.all(getTodosQuery)
      response.send(
        data.map(eachItem => {
          return outPutResult(eachItem)
        }),
      )
      break
    case hasCategoryProperty(request.query):
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        getTodosQuery = `
                        SELECT * FROM todo WHERE category = '${category}';`
        data = await db.all(getTodosQuery)
        response.send(
          data.map(eachItem => {
            return outPutResult(eachItem)
          }),
        )
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break

    default:
      getTodosQuery = `
                    SELECT * FROM todo;`
      data = await db.all(getTodosQuery)
      response.send(
        data.map(eachItem => {
          return outPutResult(eachItem)
        }),
      )
  }
})

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodosQuery = `
  SELECT * FROM todo WHERE id = ${todoId};`
  const data = await db.get(getTodosQuery)
  response.send(outPutResult(data))
})

// API 3
app.get('/agenda/', async (request, response) => {
  const {date} = request.query
  console.log(isMatch(date, 'yyyy-MM-dd'))
  if (isMatch(date, 'yyyy-MM-dd')) {
    const newDate = format(new Date(date), 'yyyy-MM-dd')
    console.log(newDate)
    const getTodosQuery = `
      SELECT * FROM todo WHERE due_date = '${newDate}';`
    const data = await db.all(getTodosQuery)
    response.send(
      data.map(eachItem => {
        return outPutResult(eachItem)
      }),
    )
  } else {
    response.status(400)
    response.send('Invalid Due Date')
  }
})

// API 4
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status, category, dueDate} = request.body
  if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
    if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        if (isMatch(dueDate, 'yyyy-MM-dd')) {
          const postNewDate = format(new Date(dueDate), 'yyyy-MM-dd')
          const postTodoQuery = `
            INSERT INTO 
              todo (id, todo, category, priority, status, due_date)
            VALUES
              (${id}, '${todo}', '${category}', '${priority}', '${status}', '${postNewDate}');`
          await db.run(postTodoQuery)
          response.send('Todo Successfully Added')
        } else {
          response.status(400)
          response.send('Invalid Due Date')
        }
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
    }
  } else {
    response.status(400)
    response.send('Invalid Todo Priority')
  }
})

//API 5

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodosQuery = `
    SELECT * FROM todo WHERE id = ${todoId};`
  const previousTodo = await db.get(getTodosQuery)
  const requestBody = request.body
  const {
    todo = previousTodo.todo,
    category = previousTodo.category,
    priority = previousTodo.priority,
    status = previousTodo.status,
    dueDate = previousTodo.due_date,
  } = request.body
  let getTodos = ''
  switch (true) {
    case requestBody.status !== undefined:
      if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
        getTodos = `
          UPDATE todo
          SET todo = '${todo}', category = '${category}', priority = '${priority}', status = '${status}'
          , due_date = '${dueDate}' WHERE id = ${todoId};`
        await db.run(getTodos)
        response.send('Status Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Status')
      }
      break

    case requestBody.priority !== undefined:
      if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
        getTodos = `
          UPDATE todo
          SET todo = '${todo}', category = '${category}', priority = '${priority}', status = '${status}'
          , due_date = '${dueDate}' WHERE id = ${todoId};`
        await db.run(getTodos)
        response.send('Priority Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Priority')
      }
      break

    case requestBody.category !== undefined:
      if (
        category === 'WORK' ||
        category === 'HOME' ||
        category === 'LEARNING'
      ) {
        getTodos = `
          UPDATE todo
          SET todo = '${todo}', category = '${category}', priority = '${priority}', status = '${status}'
          , due_date = '${dueDate}' WHERE id = ${todoId};`
        await db.run(getTodos)
        response.send('Category Updated')
      } else {
        response.status(400)
        response.send('Invalid Todo Category')
      }
      break

    case requestBody.todo !== undefined:
      getTodos = `
        UPDATE todo
        SET todo = '${todo}', category = '${category}', priority = '${priority}', status = '${status}'
        , due_date = '${dueDate}' WHERE id = ${todoId};`
      await db.run(getTodos)
      response.send('Todo Updated')

    case requestBody.dueDate !== undefined:
      if (isMatch(dueDate, 'yyyy-MM-dd')) {
        const newTodoDate = format(new Date(dueDate), 'yyyy-MM-dd')
        getTodos = `
          UPDATE todo
          SET todo = '${todo}', category = '${category}', priority = '${priority}', status = '${status}'
          , due_date = '${newTodoDate}' WHERE id = ${todoId};`
        await db.run(getTodos)
        response.send('Due Date Updated')
      } else {
        response.status(400)
        response.send('Invalid Due Date')
      }
      break
  }
})

// API 6
app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deletetodoQuery = `
    DELETE FROM todo
    WHERE id = ${todoId};`
  await db.run(deletetodoQuery)
  response.send('Todo Deleted')
})
module.exports = app
