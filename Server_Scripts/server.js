//------------------------------------------------------------Node Packages-----------------------------------------------------

//Dotenv
require("dotenv").config();//reading the .env file

//EXPRESS
const express = require("express"); //including express package for creating a server
const app = express();
const port = process.env.DEV_PORT || 3000

app.use(express.static('Public')) //the public folder is what is visible to the client (actually a subset of that folder (depending on the currently rendered webpage and it's used resources))
app.use(express.json({ limit: '1mb' })); //telling that my app will be sending/recieving data in json format (limiting to 1MB)

//------------------------------------------------------------------------------------------------------------------------------

//Other Scripts
const { Register_Email, Register_Username, Verify_OTP, Register_Password } = require("./Auth/register.js");
const { Authorize_User } = require("./Auth/login.js");
const { Validate_Session } = require("./Auth/validate_session.js")
const { Logout } = require("./Auth/logout.js");
const { Return_Users_DB } = require("./Debugging_Scripts/Return_Users.js");
const { Fetch_All_Users } = require("./Page_Queries/users.js");
const { Profile_Page, Fetch_Profile_Pictures, Update_Profile_Picture, Remove_Profile_Photo } = require("./Page_Queries/profile.js");
const { Delete_Account } = require("./Auth/Delete_Acc.js");
const { Fetch_Static_Profile, Update_Bio, Update_Username, Update_Gender, Update_Password } = require("./Page_Queries/profile.js");
const { Fetch_Dashboard } = require("./Page_Queries/Dashboard.js");
const { Verify_Email, Forgot_Verify_OTP, Verify_Password } = require("./Auth/Forgot_Details.js");
const { trainPricePrediction, trainDemandPrediction, RNN } = require("./model_training.js")


app.listen(port, () => { //function called when the server starts listening
    // const fs = require('fs');

    // // Read the dataset from the JSON file
    // const dataset = JSON.parse(fs.readFileSync("./Public/Dataset_Training/dataset_for_demand_prediction.json"));

    // // Define the state and crop type to update
    // const stateToUpdate = "Bihar";
    // const cropsToUpdate = ["Wheat", "Rice", "Soybean"];

    // // Define the percentage range to randomly change the demand values
    // const percentageRange = 10.252;

    // // Loop through the crops to update and update their demand values
    // cropsToUpdate.forEach(cropType => {
    //     const cropData = dataset[stateToUpdate][cropType];
    //     cropData.forEach(crop => {
    //         // Calculate the new demand value within the percentage range
    //         const originalDemand = crop.demand;
    //         const demandChange = originalDemand * percentageRange / 100;
    //         const newDemand = originalDemand + (Math.random() * 2 - 1) * demandChange;

    //         // Round the new demand value to 2 decimal places
    //         crop.demand = Math.round(newDemand * 100) / 100;
    //     });
    // });

    // // Print the updated dataset
    // console.log( JSON.stringify(dataset[stateToUpdate]));

    // const fs = require('fs');

    // const jsonData = JSON.parse(fs.readFileSync("./Public/Dataset_Training/dataset_for_demand_prediction.json"));
    // // sort the keys
    // const sortedData = {};
    // Object.keys(jsonData).sort().forEach(key => {
    //     sortedData[key] = jsonData[key];
    // });

    // // print the sorted JSON to the console
    // fs.writeFileSync('sorted.json', JSON.stringify(sortedData, null, 2));
    
});

app.post("/getPricePrediction", (req, res) => {
    if (req.body.model == "polynomialRegression")
        trainPricePrediction(req, res); //price prediction using Regression
    else
        RNN(req, res, "price"); //price prediction using RNN
})

app.post("/getDemandPrediction", (req, res) => {
    if (req.body.model == "polynomialRegression")
        trainDemandPrediction(req, res);
    else
        RNN(req, res, "demand");
})

app.get("/get_User_DB", (req, res) => { //only for debugging
    Return_Users_DB(res);
})


app.post("/Register_Email_api", (request, response) => {  //for Email Stage of registering
    Register_Email(request.body, response);
})

app.post("/Register_Username_api", (request, response) => {  //for Username Stage of registering
    Register_Username(request.body, response);
})

app.post("/Register_OTP_api", (request, response) => { //for OTP Stage of registering
    Verify_OTP(request.body, response);
})

app.post("/Register_Password_api", (request, response) => { //for Password Stage of registering
    Register_Password(request.body, response);
})

app.post('/auth_api', async (req, res) => { //Authorizes user[when user logs in]
    Authorize_User(req.body, res);
})



app.post('/validate_session_api', (req, res) => { //checks if session cookie is valid [if it is valid , it also updates the last activity]
    Validate_Session(req.body).then((Session_matched) => {
        verdict = {}
        if (Session_matched.length)
            verdict.Status = "Session Matched";
        else
            verdict.Status = "Invalid Session";
        res.json(verdict);
    })
})

app.post("/update_profile_picture_api", (request, response) => {
    Update_Profile_Picture(request.body, response);
})


app.post('/logout_api', (req, res) => { //Logout user
    Logout(req.body.Session_ID, res);
})

app.post("/Fetch_Users", (req, res) => { //Fetch all users data to be displayed on users.html
    Fetch_All_Users(req.body, res);
})

app.post("/Profile_Page_api", (req, res) => { //Get your own profile page information 
    Profile_Page(req.body, res);
})

app.post('/Delete_Account', (req, res) => { //Deletes user account
    Delete_Account(req.body, res);
})

app.post("/fetch_Profile_Pictures_api", (req, res) => { //fetch all the available profile picture paths
    Fetch_Profile_Pictures(req.body, res);
})

app.post("/Remove_Profile_Picture_api", (req, res) => { //called when user updates profile picture in his proifle
    Remove_Profile_Photo(req.body, res);
})

app.post("/Update_Bio_api", (req, res) => { //called when user updates bio in his proifle
    Update_Bio(req.body, res);
})

app.post("/Update_Username_api", (req, res) => { //called when user updates username in his proifle
    Update_Username(req.body, res);
})

app.post("/Update_Gender_api", (req, res) => { //called when user updates Gender in his proifle
    Update_Gender(req.body, res);
})

app.post("/Fetch_Static_Profile_api", (req, res) => { //called when user visits someone else's profile page
    Fetch_Static_Profile(req.body, res);
})

app.post("/Fetch_Dashboard_api", (req, res) => {
    Fetch_Dashboard(req.body, res);
})

app.post("/Forgot_Email_api", (req, res) => {
    Verify_Email(req.body, res);
})

app.post("/Forgot_OTP_api", (req, res) => { //api called whem user enters the OTP sent , in forget password page
    Forgot_Verify_OTP(req.body, res);
})

app.post("/Forget_Password_api", (req, res) => { //api called when user enters new password in forgot password page
    Verify_Password(req.body, res);
})

app.post("/Update_Password_api", (req, res) => { //api called when user requests to change password
    Update_Password(req.body, res);
})

