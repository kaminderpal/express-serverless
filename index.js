const express = require('express')
const serverlessHttp = require('serverless-http')
const path = require('path')
const bodyParser = require('body-parser')
const AWS = require('aws-sdk')

const app = express();

const USERS_TABLE = process.env.USERS_TABLE;
console.log()
const dynamoDb = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.json({ strict : false }));


//send index file on root path.
app.get("/",(req,res)=>{
    res.sendFile(path.resolve(__dirname,"index.html"));
});


app.get("/user/:email",(req,res)=>{
    
    const params = {
        TableName : USERS_TABLE,
        key : {
            email : req.params.email
        }
    };

    try{
        dynamoDb.get(params, (error,result) => {
            if(error){
                console.log(error);
                res.status(400).send({error: "Could not get User"});
            }
            if(result.Item){
                const {email,firstname,lastname} = result.Item;
                res.status(200).status({ email, firstname, lastname });
            }else{
                res.status(400).send({error : "could not get user"});
            }
        })
    }
    catch(err){
        res.status(404).send({error : "could not get user"});
    }
});
app.post("/user",(req,res)=>{
    const { firstname,lastname,email,password } = req.body;
    if(typeof email !== 'string'){
        res.status(400).send({error:"Email must be string"});
    } else if (typeof firstname !== 'string'){
        res.status(400).send({error:"firstname must be string"});
    }else if(typeof lastname !== 'string'){
        res.status(400).send({error:"lastname must be string"});
    }else if(typeof password !== 'string'){
        res.status(400).send({error:"password must be string"});
    }
    const params = {
        TableName : USERS_TABLE,
        Item : {
            email : email,
            firstName : firstname,
            lastName : lastname,
            password : password
        }
    };

    try{
        dynamoDb.put(params,(error)=>{
            if(error){
                console.log(error);
                res.status(400).send({error: "Not able to create user"});
            }
            res.status(200).send({email,firstname,lastname});
        });
    }
    catch(err){
        res.status(404).send({"message" : "OOps someyjing went wrong."});
    }
});

module.exports.handler = serverlessHttp(app);
