/**
 * NodeJS + Express (w/ ejs) code to test reading form data and returning a response.
 *
 */

var express = require('express');
var router = express.Router();

//########################################
//to process data sent in on request need body-parser module
var bodyParser = require('body-parser');
var path = require ('path'); //to work with separtors on any OS including Windows

var querystring = require('querystring'); //for use in GET Query string of form URI/path?name=value

router.use(bodyParser.json()); // for parsing application/json

router.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
//#########################################

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'ReadFormDataSaveMongoDB' });
});

// GET with  URI  /read/Lynne   which means name=Lynne
router.get('/read/:name', function(req, res, next) {
  //expecting data variable called name --retrieve value using body-parser
  var body = JSON.stringify(req.body);  //if wanted entire body as JSON
  var params = JSON.stringify(req.params);//if wanted parameters
  var value_name = req.params.name;  //retrieve the data associated with name
  res.send("hello " + value_name);
})

/* the URI /readNameAndRespond */

// GET with URI with querry  /readNameAndRespond?name=Lynne
router.get('/readNameAndRespond', function(req, res, next) {
  //expecting data variable called name --retrieve value using body-parser
  var body = JSON.stringify(req.body);  //if wanted entire body as JSON
  var params = JSON.stringify(req.params);//if wanted parameters
  var query = req.query;  //if wanted the query
  var value_name = req.query.name;  //retrieve the data associated with name
  res.send("hello " + value_name);
});


//Processing Post to read post data called name
//now processing post
router.post('/readNameAndRespond', function(req, res, next) {

  //expecting data variable called name --retrieve value using body-parser
  var body = JSON.stringify(req.body);  //if wanted entire body as JSON
  var params = JSON.stringify(req.params);//if wanted parameters
  var value_name = req.body.name;  //retrieve the data associated with name
  res.send("hello now " + value_name);
});






//Processing Post to read post data called name
//now processing post
router.post('/readCustomerInfoAndRespond', function(req, res, next) {

  //expecting data variable called name --retrieve value using body-parser
  var body = JSON.stringify(req.body);  //if wanted entire body as JSON
  var params = JSON.stringify(req.params);//if wanted parameters
  var value_name = req.body.name;  //retrieve the data associated with name
  var value_email = req.body.email;  //retrieve the data associated with email
  res.send("Welcome,  " + value_name + "</br> We will reach you at: " + value_email);


});

module.exports = router;
