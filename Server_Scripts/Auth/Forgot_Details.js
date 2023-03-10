//NEDB
const Datastore = require("nedb"); //including the nedb node package for database 
const users = new Datastore("Database/users.db");
const SendMail = require("./SendMail.js");
const bcrypt = require('bcrypt');

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

function Verify_Email(req_JSON,res) //function used to verify if email exists [called when user is in forget password section]
{
    if(validate_email(req_JSON.Email) == "Valid Email")
    {
        users.loadDatabase();
        users.find({Email : req_JSON.Email},(err,users_found_array) => {
            if(users_found_array.length) //user found with the entered email
            {
                if(users_found_array[0].Registration_Status == "Registered")
                {
                    let Updated_JSON = JSON.parse(JSON.stringify(users_found_array[0]));

                    Updated_JSON.OTP_Generated_Time = Date.now(); //Setting Generation Time
                    Updated_JSON.OTP_Generated = Updated_JSON.OTP_Generated_Time%(1000000007); //Setting OTP
                    
                    users.update(users_found_array[0],Updated_JSON,{},(err,NumReplaced) => {

                        console.log("Updated OTP of " + NumReplaced + " Entries");
                        
                        email_info = {
                            to : req_JSON.Email,
                            OTP : Updated_JSON.OTP_Generated
                        }
                        
                        SendMail(email_info); //sending mail

                        let verdict ={
                            Status : "Pass",
                            Description : "OTP Send"
                        }

                        res.json(verdict);
                    })
                }
                else
                {
                    let verdict = {
                        Status : "Fail",
                        Description : "User Not Registered"
                    }
                    res.json(verdict);
                }
            }
            else
            {
                let verdict={
                    Status : "Fail",
                    Description : "Email Doesn't Exists"
                }
                res.json(verdict);
            }
        })
    }
    else
    {
        let verdict={
            Status : "Fail",
            Description : "Invalid Email"
        }
        res.json(verdict);
    }
    
}


function Forgot_Verify_OTP(req_JSON,res)
{
    console.log(req_JSON);
    users.loadDatabase();
    users.find({OTP_Generated : parseInt(req_JSON.OTP)},(err,OTP_match_array) => {

        if(OTP_match_array.length)
        {
            if(OTP_match_array[0].Email == req_JSON.Email)
            {
                if( parseInt(parseInt(Date.now()) - parseInt(OTP_match_array[0].OTP_Generated_Time)) <= 300000 ) //time difference is less than 5 minutes
                {
                    let verdict={
                        Status : "Pass",
                        Description : "OTP matched"
                    }
                    res.json(verdict);
                }
                else
                {
                    let verdict={
                        Status : "Fail",
                        Description : "OTP Expired"
                    }
                    res.json(verdict);
                }
            }
            else
            {
                let verdict={
                    Status : "Fail",
                    Description : "Wrong OTP!"
                }
                res.json(verdict);
            }
        }
        else
        {
            let verdict={
                Status : "Fail",
                Description : "Wrong OTP!"
            }
            res.json(verdict);
        }

    })
}

function Verify_Password(req_JSON,res)
{
    console.log(req_JSON);


    if(validate_password(req_JSON.Password) == "Valid Password")
    {
        users.loadDatabase();
        users.find({Email : req_JSON.Email , OTP_Generated : parseInt(req_JSON.OTP) } , (err,User_Match_Array) => { 
            
            if(User_Match_Array.length) //if email and otp both matched
            {
                if( parseInt(parseInt(Date.now()) - parseInt(User_Match_Array[0].OTP_Generated_Time)) <= 300000 ) //time difference is less than 5 minutes
                {
                    users.loadDatabase();
                    bcrypt.hash(req_JSON.Password,10).then((hashed_password) => {
                            
                        console.log("Hashed Password = " + hashed_password);
                        
                        let Update_JSON = JSON.parse(JSON.stringify(User_Match_Array[0]));
                        Update_JSON.Password = hashed_password;
                        users.loadDatabase();
                        users.update(User_Match_Array[0],Update_JSON,{},(err,Num_Replaced) => {
                            console.log("Entries Replaced = " + Num_Replaced);
                         
                            let verdict={
                                Status : "Pass",
                                Description : "Password Updated Successfully!"
                            }
                            
                            res.json(verdict);
                        })
                    })
                }
                else
                {
                    let verdict ={
                        Status : "Fail",
                        Description : "OTP Expired"
                    }
                    res.json(verdict);
                }
    
            }
            else
            {
                let verdict={
                    Status : "Fail",
                    Description : "User Not Found"
                }
                res.json(verdict);
            }

        })
    }
    else
    {
        let verdict ={
            Status : "Fail",
            Description : "Invalid Password"
        }
        res.json(verdict);
    }

}

module.exports = {Verify_Email,Forgot_Verify_OTP,Verify_Password}