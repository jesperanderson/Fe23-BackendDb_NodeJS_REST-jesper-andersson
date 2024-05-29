import express from "express";
import ejs from "ejs";
import * as db from "./db.js"
import bodyParser from "body-parser";
const app = express();

//set public folder for static web pages
app.use(express.static('public'));

//set dynamic web pages, set views and engine
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//////Routing//////
app.get('/', async (req, res) => {
    const pageTitle = "Dynamic webpage";
    const sql = 'SHOW tables';
    const dbData = await db.query(sql);
    console.log(dbData);
    res.render('index', {pageTitle, dbData} );
});
app.get('/exempel', async (req, res) => {
    let cols = ["first","second","one","4","c"]
    let buildQuery = (cols) => {
        let colQuery = "";
        for (let i = 0; i < cols.length; i++) {
            if(i<cols.length-1){    
                colQuery+=cols[i]+",";
            }else{
                colQuery+=cols[i]
            }     
        }
        let queryStart = "INSERT INTO(" + colQuery + ") WHERE fdsaf";
        console.log(queryStart);
    }
    buildQuery(cols);

    //
    const pageTitle = "Dynamic webpage";
    const sql = 'SHOW tables';
    const dbData = await db.query(sql);
    console.log(dbData);
    res.render('index', {pageTitle, dbData} );
});

let currentTable;
app.post('/', async (req, res) => {
    console.log(req.body);
    const tableName = req.body.table_name;
    const pageTitle = "Dynamic webpage";
    const sql = `SELECT * FROM ${tableName}`;
    currentTable = tableName;
    const dbData = await db.query(sql);
    console.log(dbData);
    
    if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        res.render('partials/dataTable', { dbData });
    } else {
        res.render('index', { pageTitle, dbData });
    }
});



app.get('/addStudent', async (req, res) => {
    const pageTitle = "Add Student";
    res.render('addStudent', { pageTitle });
});

app.post('/addStudent', async (req, res) => {
    const { firstName, lastName, town } = req.body;
    const sql = `INSERT INTO students (firstname, lastname, town) VALUES (?, ?, ?)`;
    try {
        await db.query(sql, [firstName, lastName, town]);
        res.redirect('/'); // Redirect till startsidan efter att studenten har lagts till
    } catch (error) {
        console.error("Error adding student:", error);
        res.status(500).send("Error adding student. Please try again later.");
    }
});


app.get('/removeData', async (req, res) => {
    
    const pageTitle = "Dynamic webpage";
    const sql = `SELECT * FROM ${currentTable}`;
    const dbData = await db.query(sql);
    console.log(dbData);
    res.render('removeData', {pageTitle, dbData} );
});
app.post('/removeData', async (req, res) => {
    console.log(req.body);
    const requestData = req.body;
    const pageTitle = "Dynamic webpage";
    const sqlDeleteQuery = `DELETE FROM ${currentTable} WHERE id=${requestData.id}`;
    const deleteQuery = await db.query(sqlDeleteQuery);
    console.log(deleteQuery);
    //get table data
    const sql = `SELECT * FROM ${currentTable}`;
    const dbData = await db.query(sql);
    //get table headers
    const sql2 = `DESCRIBE ${currentTable}`;
    const dbDataHeaders = await db.query(sql2);
    console.log(dbDataHeaders);
    //show webpage
    res.render('removeData', {pageTitle, dbData, dbDataHeaders} );
});

/////JSON DATA//////
app.get('/students', async (req, res) => {
    let sql = "";
    const {id} = req.query;
    if(id){
        sql = `SELECT * FROM students WHERE id = ${id}`;
    }else{
        sql = `SELECT * FROM students`;
    }
    const dbData = await db.query(sql);
    res.json(dbData);
});

app.get('/students_courses', async (req, res) => {
    let sql = "";
    const {id} = req.query;
    if(id){
        sql = `SELECT * FROM students_courses WHERE id = ${id}`;
    }else{
        sql = `SELECT * FROM students_courses`;
    }
    const dbData = await db.query(sql);
    res.json(dbData);
});

app.get('/courses', async (req, res) => {
    let sql = "";
    const {id} = req.query;
    if(id){
        sql = `SELECT * FROM courses WHERE id = ${id}`;
    }else{
        sql = `SELECT * FROM courses`;
    }
    const dbData = await db.query(sql);
    res.json(dbData);
});

app.get("/students/:studentName/courses", async (req, res) => {
    let studentData = [req.params.studentName]
    const [result] = await db.query(
        `SELECT c.* FROM Courses c JOIN Students_Courses sc ON (c.id = sc.Courses_id) JOIN Students s ON (sc.Students_id = s.id) WHERE s.lastname = "${studentData}" OR s.firstname = "${studentData}" OR s.id = "${studentData}" OR s.town = "${studentData}"`
    );
    res.json(result);
});

app.get("/courses/:courseInfo", async (req, res) => {
    let coursesData = [req.params.courseInfo]
    const result = await db.query(
        `SELECT s.* FROM Students s JOIN Students_Courses sc ON (s.id = sc.Students_id) JOIN Courses c ON (sc.Courses_id = c.id) WHERE c.id = "${coursesData}" LIKE c.name = "${coursesData}"`
    );
    res.json(result);
});


//server configuration
const port = 3000;
app.listen(port, () => {
    console.log(`server is running on  http://localhost:${port}/`);
});