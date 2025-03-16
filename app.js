//jshint esversion: 6
// hint for atom (only?) in what version we are so it doesn't keep sending error messages
const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
require('dotenv').config();
const https = require("https");
const punycode = require('punycode/');


const app = express();

app.use(express.static("public")); // directing to the folder 'public'; providing the path to the static files
// use the urlencoded method of bodyParser:
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/signup.html");
});

app.post("/", function(req, res) {
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const email = req.body.email;

  // var for the data we later send to mailchimp. the curly braces make it a javascript object
  const data = {
    members: [{
      email_address: email,
      status: "subscribed",
      merge_fields: {
        FNAME: firstName,
        LNAME: lastName
      }
    }]
  };
  // this is what we will send to mailchimp:
  const jsonData = JSON.stringify(data);
  // next we need to make our request:
  // response will be a respose from the mailchimp server

    //2025 new audience ID: 9dc3aa3fe2
    const url = "https://us20.api.mailchimp.com/3.0/lists/9dc3aa3fe2"
  //2020:  const url = "https://us7.api.mailchimp.com/3.0/lists/0fb8819296"
  const options = {
    method: "POST",
      //here we can use any string with colon before the API key:
      //the API key is protected (must be!)
      auth: `mamamia:${process.env.MAILCHIMP_API_KEY}`
  }
// this is to make the request to mailchimp with 'options' which makes a post
  const request = https.request(url, options, function(response) {
    if (response.statusCode === 200) {
      //res.send("Successfully subscribed")
      res.sendFile(__dirname + "/success.html");
    } else {
      //res.send("There was an error with signing up, please try again")
      res.sendFile(__dirname + "/failure.html");
    }

    response.on("data", function(data) {
      console.log(JSON.parse(data));
    })
  })
  // we can comment out the request.write to see the failure-website in the browser
  request.write(jsonData);
  request.end();

  console.log(firstName, lastName, email);
});

// the post request for the failure-route from the failure.html is going to be caught here
app.post("/failure", function(req, res) {
  // and redirect the browser to the home-route (will trigger the app.get("/") from line 16)
  res.redirect("/");
})

//for heroku: process.env.PORT  this is a dynamic port that heroku can define
// we also add our local port 3000 with the 'OR' 
app.listen(process.env.PORT || 3000, function() {
  console.log("Server is running on port 3000.");
});

