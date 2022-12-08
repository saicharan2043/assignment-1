let { format, compareAsc } = require("date-fns");
let express = require("express");
let { open } = require("sqlite");
let sqlite3 = require("sqlite3");
let path = require("path");
const isValid = require("date-fns/isValid");
let addDays = require("date-fns/addDays");
let dbPath = path.join(__dirname, "todoApplication.db");
console.log(dbPath);
let app = express();
app.use(express.json());
let db = null;
let instalizeDbandServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server is running http://localhost:300/");
    });
  } catch (e) {
    console.log(e.message);
  }
};

instalizeDbandServer();

let middelWerFunction = (request, response, next) => {
  let { search_q, priority, status, category, dueDate } = request.query;
  if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (
    priority !== "HIGH" &&
    priority !== "MEDIUM" &&
    priority !== "LOW"
  ) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (
    category !== "WORK" &&
    category !== "HOME" &&
    category !== "LEARNING"
  ) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else if (dueDate === undefined) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    next();
  }
};

app.get("/todos/", async (request, response) => {
  let { search_q, priority, status, category, dueDate } = request.query;
  //console.log(search_q);
  let userDetails;
  if (priority !== undefined && status !== undefined) {
    if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
      response.status(400);
      response.send("Invalid Todo Status");
    } else if (
      priority !== "HIGH" &&
      priority !== "MEDIUM" &&
      priority !== "LOW"
    ) {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else {
      userDetails = `SELECT * FROM todo WHERE priority = '${priority}' and status = '${status}'`;
    }
  } else if (category !== undefined && status !== undefined) {
    if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
      response.status(400);
      response.send("Invalid Todo Status");
    } else if (
      category !== "WORK" &&
      category !== "HOME" &&
      category !== "LEARNING"
    ) {
      response.status(400);
      response.send("Invalid Todo Category");
    } else {
      userDetails = `SELECT * FROM todo WHERE category = '${category}' and status = '${status}'`;
    }
  } else if (category !== undefined && priority !== undefined) {
    if (category !== "WORK" && category !== "HOME" && category !== "LEARNING") {
      response.status(400);
      response.send("Invalid Todo Category");
    } else if (
      priority !== "HIGH" &&
      priority !== "MEDIUM" &&
      priority !== "LOW"
    ) {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else {
      userDetails = `SELECT * FROM todo WHERE category = '${category}' and priority = '${priority}'`;
    }
  } else if (status !== undefined) {
    if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
      response.status(400);
      response.send("Invalid Todo Status");
    } else {
      userDetails = `SELECT * FROM todo WHERE status = '${status}'`;
    }
  } else if (priority !== undefined) {
    if (priority !== "HIGH" && priority !== "MEDIUM" && priority !== "LOW") {
      response.status(400);
      response.send("Invalid Todo Priority");
      console.log("hello");
    } else {
      userDetails = `SELECT * FROM todo WHERE priority = '${priority}'`;
    }
  } else if (search_q !== undefined) {
    userDetails = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'`;
  } else if (category !== undefined) {
    if (category !== "WORK" && category !== "HOME" && category !== "LEARNING") {
      response.status(400);
      response.send("Invalid Todo Category");
    } else {
      userDetails = `SELECT * FROM todo WHERE category = '${category}'`;
    }
  }
  if (userDetails !== undefined) {
    let dbResponse = await db.all(userDetails);
    let createObject = (dbResponse) => {
      myArray = [];
      for (let value of dbResponse) {
        let object = {
          id: value.id,
          todo: value.todo,
          priority: value.priority,
          status: value.status,
          category: value.category,
          dueDate: value.due_date,
        };
        myArray.push(object);
      }
      return myArray;
    };
    response.send(createObject(dbResponse));
  }
});

app.get("/todos/:todoId/", async (request, Response) => {
  let { todoId } = request.params;
  let userDetails = `SELECT id , todo , priority , status , category , due_date as dueDate FROM todo WHERE id = ${todoId}`;
  let dbResponse = await db.get(userDetails);
  Response.send(dbResponse);
});

app.get("/agenda/", async (request, response) => {
  let { date } = request.query;
  let value = addDays(new Date(date), 0);
  let reslut = isValid(value);
  if (reslut === false) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    let dateObject = format(new Date(date), "yyyy-MM-dd");
    let userDetails = `SELECT id , todo , priority , status , category , due_date as dueDate FROM todo WHERE due_date = '${dateObject}'`;
    //console.log(userDetails);
    let dbResponse = await db.all(userDetails);
    response.send(dbResponse);
    //console.log(dbResponse);
  }
});

app.post("/todos/", async (request, response) => {
  try {
    let { id, todo, priority, status, category, dueDate } = request.body;
    let value = addDays(new Date(dueDate), 0);
    let reslut = isValid(value);

    if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
      response.status(400);
      response.send("Invalid Todo Status");
    } else if (
      priority !== "HIGH" &&
      priority !== "MEDIUM" &&
      priority !== "LOW"
    ) {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else if (
      category !== "WORK" &&
      category !== "HOME" &&
      category !== "LEARNING"
    ) {
      response.status(400);
      response.send("Invalid Todo Category");
    } else if (reslut === false) {
      response.status(400);
      response.send("Invalid Due Date");
      console.log("hello");
    } else {
      let userDetails = `
            INSERT INTO 
                todo(id , todo , priority , status , category , due_date)
            VALUES ('${id}' , '${todo}' , '${priority}' , '${status}' , '${category}' , '${dueDate}')
            `;
      let dbResponse = await db.all(userDetails);
      console.log("Hello");
      response.send("Todo Successfully Added");
    }
  } catch (e) {
    console.log(e.message);
  }
});

app.put("/todos/:todoId/", async (request, response) => {
  let { todoId } = request.params;
  let { todo, priority, status, category, dueDate } = request.body;
  let value = addDays(new Date(dueDate), 0);
  let reslut = isValid(value);
  if (status !== undefined) {
    if (status !== "TO DO" && status !== "IN PROGRESS" && status !== "DONE") {
      response.status(400);
      response.send("Invalid Todo Status");
    } else {
      let userDetails = `UPDATE todo SET status = '${status}' WHERE id = ${todoId}`;
      let dbResponse = await db.all(userDetails);
      response.send("Status Updated");
    }
  } else if (priority !== undefined) {
    if (priority !== "HIGH" && priority !== "MEDIUM" && priority !== "LOW") {
      response.status(400);
      response.send("Invalid Todo Priority");
    } else {
      let userDetails = `UPDATE todo SET priority = '${priority}' WHERE id = ${todoId}`;
      let dbResponse = await db.all(userDetails);
      response.send("Priority Updated");
    }
  } else if (todo !== undefined) {
    let userDetails = `UPDATE todo SET todo = '${todo}' WHERE id = ${todoId}`;
    let dbResponse = await db.all(userDetails);
    response.send("Todo Updated");
  } else if (category !== undefined) {
    if (category !== "WORK" && category !== "HOME" && category !== "LEARNING") {
      response.status(400);
      response.send("Invalid Todo Category");
    } else {
      let userDetails = `UPDATE todo SET category = '${category}' WHERE id = ${todoId}`;
      let dbResponse = await db.all(userDetails);
      response.send("Category Updated");
    }
  } else if (dueDate !== undefined) {
    if (reslut === false) {
      response.status(400);
      response.send("Invalid Due Date");
    } else {
      let userDetails = `UPDATE todo SET due_date = '${dueDate}' WHERE id = ${todoId}`;
      let dbResponse = await db.all(userDetails);
      response.send("Due Date Updated");
    }
  }
});

app.delete("/todos/:todoId/", async (request, Response) => {
  let { todoId } = request.params;
  let userDetails = `DELETE FROM todo WHERE id = ${todoId}`;
  await db.all(userDetails);
  Response.send("Todo Deleted");
});

module.exports = app;
