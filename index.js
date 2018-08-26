const express = require("express");
const server = express();
const PORT = process.env.PORT || 8000;
const  bodyParser = require("body-parser");
const cors = require("cors");
const {connection } = require("./Connection");
const fs = require("fs");
const uuidv4 = require('uuid/v4');
const compression = require('compression');
const helmet = require('helmet');


server.listen(PORT, ()=>{
    console.log(`Server is running on Localhost:${PORT}`);
 });
 server.use(compression());
 server.use(helmet());
 server.get("/",(request, response)=>{
     response.send("on the master branch");
 });
 server.use(express.static('public'));
 server.use(bodyParser.json());
 server.use(
     cors({
         oringin:"http://localhost:3000"
        })
    );
server.get("/get/jokes", (request ,response) => {
    connection.query("SELECT * FROM joke order by id desc ", (error , results) => {
        if (error){
            showError(error);
        }
        response.json(results);
    })
});

//post image****************************************
server.post("/post/joke", (request, response) => {
    const { body } = request;
    if (body){
        const { title , file} = body;
        if(file){
            const { base64 } = file;
            const fileName = uuidv4();
            fs.writeFile(`./public/images/${fileName}.jpeg`, base64, 'base64', (error) => {
                if(error){
                    console.log(error);
                }
            })
            const sql = "INSERT into joke set ?";
            const values ={
                image_location: `/images/${fileName}.jpeg`,
                title
            }
            connection.query(sql, values , (error, result) =>{
                if(error){
                    showError(error, response);
                }else{
                    console.log(body);
                    response.json({
                        status:"succes",
                        message:"joke uploaded"
                    })
                }
            })
        }
    }
});

//To get the data of commented image from joke table************************
server.get('/get/joke/:id', (request, response) => {
    const values = [request.params.id];
    const sql = "SELECT * FROM joke where id = ?";
    connection.query(sql, values, (error, results) => {
        if (error) {
            showError(error, response)
        }
        response.json(results[0]);
    });
});

//comments**************************************************
server.get(`/get/comments/:jokeId`, (request, response) => {
    const {body} = request;
    if (body) {
        const sql = `SELECT * FROM comment where joke_id = ?`;
        const values = [request.params.jokeId];
        connection.query(sql, values, (error, results) => {
            if (error) {
                showError(error, response);
            }
            response.json(results);
        });
    }
});

//post comments*********************************
server.post("/post/comment", (request, response) => {
    const {body} = request;
    if (body) {
        const { text, username, joke_id} = body;
        const sql ="INSERT into comment set ?";
        const values ={
            text: `${text}`,
            username :`${username}`,
            joke_id: `${joke_id}`
        }
        connection.query(sql, values, (error, results) => {
            if (error) {
          showError(error, response);
        }
        console.log(results);
        response.json({ 
            status: "succes",
             message: "comment posted"
            });
        });
    }
});

//:vote up and down************************************
server.post("/update/joke/:vote",(request,response) => {
    const voteType= request.params.vote;
    const { body } = request;
    if(body){
        const { id } = body;
        if(id){
            vote(id , voteType , response);
        }
    }
})
  
function vote(id , voteType , response ){
    let sql;
    if(voteType === "upvote"){
        sql ="update joke set up_votes =up_votes + 1 where id = ? ";
    }else{
        sql ="update joke set down_votes = down_votes - 1 where id = ? ";
    }
    let values = [id];
    connection.query(sql,values,(error,results)=>{
        if(error){
            showError(error,response);
        }
        console.log(results);
        response.json({
            status: "succes",
            message: "joke voted"
        })
    })
}

//error**************************************
function showError(error, response){
    console.log (error);
    response.json({
        status: "error",
        message:"something went worng"
    });
}
//End Homework******************************************