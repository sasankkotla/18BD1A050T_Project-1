const express = require('express');
const app = express();

//bodyparser
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

//for mongodb
const MongoClient=require('mongodb').MongoClient;
//Connecting server file for AWT
let server =require('./server');
let config = require('./config');
let middleware =require('./middleware');
const response =require('express');

//DATABASE CONNECTION
const url = 'mongodb://127.0.0.1:27017';
const dbName = 'HospitalManagement';
let db;
MongoClient.connect(url,{useNewUrlParser:true,useUnifiedTopology:true},(error,client) =>{
    if(error) return console.log(err);
    db = client.db(dbName);
    console.log(`Connected Database: ${url}`);
    console.log(`Database : ${dbName}`);
})

// 1)a) READ HOSPITAL DETAILS
app.get('/HospDetails', middleware.checkToken, function (req,res) {

    console.log("Fetching data from Hospital collection ");
    
    var data = db.collection('HospitalDetails').find().toArray()
    .then(result => res.json(result));
    
});


// 1)b) VENTILATORS DETAILS
app.get('/VentDetails', middleware.checkToken,  (req,res) => {
    console.log("Ventilators Information ");
    var ventilatordetails = db.collection('VentilatorDetails').find().toArray()
    .then(result => res.json(result));
    
});

// 2)a) SEARCH VENTILATORS BY STATUS
app.post('/searchventbystatus', middleware.checkToken, (req,res) =>{
    var status= req.body.status;
    console.log(status);
    var ventilatordetails=db.collection('VentilatorDetails').find({'status': status}).toArray()
    .then(result => res.json(result));
});

// 2)b) SEARCH VENTILATORS BY HOSPITAL NAME
app.post('/searchventbyname', middleware.checkToken, (req,res) =>{
    var name= req.query.name;
    console.log(name);
    var ventilatordetails=db.collection('VentilatorDetails').find({'name': new RegExp(name, 'i')}).toArray()
    .then(result => res.json(result));
});

// 3)  SEARCH Hospital by Name
app.post('/searchhospital',middleware.checkToken,(req,res)=>{
    var name=req.query.name;
    console.log(name);
    var hospitaldetails=db.collection('HospitalDetails')
    .find({ 'name': new RegExp(name,'i') }).toArray().then(result=>res.json(result));
});


// 4) UPDATE VENTILATOR DETAILS
app.put('/updateventilator',middleware.checkToken,(req,res) =>{
    var ventid={ ventilatorId: req.body.ventilatorId };
    console.log(ventid);
    var newvalues ={ $set:{ status: req.body.status }};
    db.collection("VentilatorDetails").updateOne(ventid,newvalues,function(err, result){
        if(err) throw err;

        else{
            res.json("1 document updated");
        }
    //console.log("1 document updated");
    })
});


// 5) Add ventilator
app.post('/addventilatorbyuser',middleware.checkToken,(req,res) =>{
    var hId=req.body.hId;
    var vId=req.body.ventilatorId;
    var status=req.body.status;
    var name=req.body.name;
    
    var item=
    {
        hId:hId, ventilatorId:vId, status:status, name:name
    };
    db.collection('VentilatorDetails').insertOne(item, function(err,result){
        res.json('Item inserted');
    });
});


// 6) Delete ventilator by  VentilatorId
app.delete('/delete',middleware.checkToken,(req,res)=>{
    var myquery=req.query.ventilatorId;
    console.log(myquery);

    var myquery1={ventilatorId: myquery };

    db.collection('VentilatorDetails').deleteOne(myquery1, function(err,obj)
        {
            if(err) throw err;
            res.json("1 document deleted");
        });
});

app.listen(1500);