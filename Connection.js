const mysql = require("mysql");

const databaseConfiguration = { 
   host: "sql7.freemysqlhosting.net",
   user: "sql7253327",
   password: "siuhUBG93p",
   database:"sql7253327"
}
const connection = mysql.createConnection(databaseConfiguration);

connection.connect((err)=> {
   if (err) {
     console.error('error connecting: ' + err.stack);
     return;
   }

   console.log('connected as id ' + connection.threadId);
 });

 module.exports = {
     connection
 }

