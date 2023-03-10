//NEDB
const Datastore = require("nedb"); //including the nedb node package for database 
const users = new Datastore("Database/users.db");
const SendMail = require("./SendMail.js");
const bcrypt = require('bcrypt');

//------------------------------------------------------------------------------------------------------------------------------


//Other Scripts
const {Create_Directory} = require("../directories.js"); //for creating Directories


function validate_username(str)
{
    //The number of characters must be between 5 and 15.
    //The string should only contain alphanumeric characters and/or underscores (_).
    //The first character of the string should be alphabetic.

    if(/^[A-Za-z][A-Za-z0-9_]{4,14}$/.test(str))
        return "Valid Username";
    else
        return "Invalid Username";
}

function validate_email(str)
{
    let regex = new RegExp("([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])");

    if(regex.test(str))
        return "Valid Email";
    else
        return "Invalid Email";
}

function validate_password(str)
{
    //The minimum number of characters must be 8.
    //The string must have at least one digit.
    //The string must have at least one uppercase character.
    //The string must have at least one lowercase character.
    //The string must have at least one special character.

    if(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/.test(str))
        return "Valid Password";
    else
        return "Invalid Password";
}


function Register_Email(req_JSON,response) //email stage
{
    console.log(req_JSON);
    if(validate_email(req_JSON.Email) == "Valid Email")
    {
        users.loadDatabase();
        users.find({Email : req_JSON.Email},(err,email_querry_result_array) => {

            if(email_querry_result_array.length) //if email exists in DB
            {
                if(email_querry_result_array[0].Registration_Status != "Registered")
                {
                    users.remove(email_querry_result_array[0],{});
                    let JSON_to_Insert = {
                        Email : req_JSON.Email,
                        Username : "",
                        Password : "",
                        Gender : "",
                        Profile_Picture : "./GUI_Resources/No_photo.gif", 
                        Bio : "",
                        Registration_Status : "OnHold" ,
                        OTP_Generated : "",
                        OTP_Generated_Time : 0,
                        Last_Activity : 0,
                        Session : []
                    }
                    users.insert(JSON_to_Insert);
                    verdict = {
                        Status : "Pass",
                        Description : "Email Stage Passed"
                    }
                    response.json(verdict);
                }
                else
                {
                    verdict = {
                        Status : "Fail",
                        Description : "Email Already Registered"
                    }
                    response.json(verdict);
                }
            }
            else
            {
                let JSON_to_Insert = {
                    Email : req_JSON.Email,
                    Username : "",
                    Password : "",
                    Gender : "",
                    Profile_Picture : "./GUI_Resources/No_photo.gif", 
                    Bio : "",
                    Registration_Status : "OnHold" ,
                    OTP_Generated : "",
                    OTP_Generated_Time : 0,
                    Last_Activity : 0,
                    Session : []
                }
                users.insert(JSON_to_Insert);
                verdict = {
                    Status : "Pass",
                    Description : "Email Stage Passed"
                }
                response.json(verdict);
            }
        })
    }
    else
    {
        verdict = {
            Status : "Fail",
            Description : "Invalid Email"
        }
        response.json(verdict);
    }
}

function Register_Username(req_JSON,response) //username Stage
{
    console.log(req_JSON);
    if(validate_username(req_JSON.Username) == "Valid Username")
    {
        users.loadDatabase();
        users.find({Username : req_JSON.Username},(err,username_querry_array) => {
            
            if(username_querry_array.length == 0) //username not matched
            {
                users.loadDatabase();
                users.find({Email : req_JSON.Email},(err,email_querry_result_array) => {

                    if(email_querry_result_array.length)
                    {
                        if(email_querry_result_array[0].Registration_Status == "OnHold")
                        {
                            let Update_JSON = JSON.parse(JSON.stringify(email_querry_result_array[0]));
                            Update_JSON.Username = req_JSON.Username;
                            
                            Update_JSON.OTP_Generated_Time = Date.now();
                            Update_JSON.OTP_Generated = (Update_JSON.OTP_Generated_Time)%1000000007; //generating a OTP
                            users.loadDatabase();
                            users.update(email_querry_result_array[0],Update_JSON,{},(err,Num_Replaced) => { //updating the email matched entry with username
                                console.log("Successfully updated " + Num_Replaced + " Entries");
                                
                                email_info = {
                                    to : req_JSON.Email,
                                    OTP : Update_JSON.OTP_Generated
                                }

                                SendMail(email_info); //sending mail    

                                verdict={
                                    Status : "Pass",
                                    Description : "Username Stage Passed"
                                }
                                response.json(verdict);
                            })

                        }
                        else
                        {
                            if(email_querry_result_array[0].Registration_Status == "Registered")
                            {
                                verdict ={
                                    Status : "Fail",
                                    Description : "Email Already Registered"
                                }

                                response.json(verdict);
                            }
                            else
                            {
                                verdict={
                                    Status : "Fail",
                                    Description : "User Already Verified"
                                }
                                response.json(verdict);
                            }
                        }
                    }   
                    else
                    {
                        verdict={
                            Status : "Fail",
                            Description : "Wrong Email"
                        }
                        response.json(verdict);
                    }

                })
            }   
            else
            {
                verdict = {
                    Status : "Fail",
                    Description : "Username Already Exists"
                }
                response.json(verdict);
            }

        })
    }
    else
    {
        verdict={
            Status : "Fail",
            Description : "Invalid Username"
        }
        response.json(verdict);
    }
}

function Verify_OTP(req_JSON,response)
{
    console.log(req_JSON);
    users.loadDatabase();
    users.find({Username : req_JSON.Username , Email : req_JSON.Email},(err,user_matched_array)=>{

        if(user_matched_array.length) //matched some entry
        {
            if(user_matched_array[0].Registration_Status == "OnHold")
            {
                if(req_JSON.OTP == user_matched_array[0].OTP_Generated)
                {
                    if( Date.now() - user_matched_array[0].OTP_Generated_Time <= 300000) //not expired
                    {
                        let Update_JSON = JSON.parse(JSON.stringify(user_matched_array[0]));
                        Update_JSON.Registration_Status = "Verified";
                        
                        users.loadDatabase();
                        users.update(user_matched_array[0],Update_JSON,{},(err,Num_Replaced) => {
                            
                            console.log("Entries Replaced = " + Num_Replaced);

                            let verdict={
                                Status : "Pass",
                                Description : "OTP stage Completed!"
                            }
                            response.json(verdict);
                        })

                    }   
                    else //expired
                    {
                        users.loadDatabase(); //deleting that entry
                        users.remove(user_matched_array[0],{},(err,numReplaced)=>{
                            console.log("Entries Removed = " + numReplaced);
                            
                            let verdict={
                                Status : "Fail",
                                Description : "OTP Expired"
                            }   

                            response.json(verdict);

                        })

                    }
                }
                else
                {
                    let verdict ={
                        Status : "Fail",
                        Description : "Wrong OTP"
                    }
                    response.json(verdict);
                }
            }
            else
            {
                let verdict={
                    Status : "Fail",
                    Description : "Email Already Exists"
                }
                response.json(verdict);
            }
        }
        else
        {
            let verdict={
                Status : "Fail",
                Description : "Wrong Credintials"
            }
            response.json(verdict);
        }

    })
}

function Register_Password(req_JSON,response)
{
    console.log(req_JSON);
    if(validate_password(req_JSON.Password) == "Valid Password")
    {
        users.loadDatabase();
        users.find({Email : req_JSON.Email,Username : req_JSON.Username},(err,user_matched_array) => {

            if(user_matched_array.length) //matched some entry in DB
            {
                if(user_matched_array[0].Registration_Status == "Verified")
                {
                    bcrypt.hash(req_JSON.Password,10).then((hashed_password) => {
                        
                        console.log("Hashed Password = " + hashed_password);
                        
                        let Update_JSON = JSON.parse(JSON.stringify(user_matched_array[0]));
                        Update_JSON.Password = hashed_password;
                        Update_JSON.Registration_Status = "Registered";
                        users.loadDatabase();
                        users.update(user_matched_array[0],Update_JSON,{},(err,Num_Replaced) => {
                            console.log("Entries Replaced = " + Num_Replaced);
                            console.log(Create_Directory("Media/" + req_JSON.Username)); //creating a directory with his username
                            fs.copyFileSync("Public/Profiles/Profile_HTML_Template.html","Public/Profiles/" + req_JSON.Username + ".html"); //creating his personal profile page (just copying from the template html)
                            
                            let verdict={
                                Status : "Pass",
                                Description : "User Registered Successfully!"
                            }
                            
                            response.json(verdict);
                        })

                    })

                }
                else
                {
                    let verdict={
                        Status : "Fail",
                        Description : "OTP not verified"
                    }
                    response.json(verdict);
                }
            }
            else
            {
                let verdict={
                    Status : "Fail",
                    Description : "Invalid Credentials"
                }    
                response.json(verdict);
            }

        })
    }
    else
    {
        let verdict={
            Status : "Fail",
            Description : "Invalid Password"
        }
        response.json(verdict);
    }
}

module.exports = {Register_Email,Register_Username,Verify_OTP,Register_Password};