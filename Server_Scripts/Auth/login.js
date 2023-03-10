//NEDB
const Datastore = require("nedb"); //including the nedb node package for database 
const users = new Datastore("Database/users.db");
const bcrypt = require("bcrypt");


function validate_email(str)
{
    let regex = new RegExp("([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\"\(\[\]!#-[^-~ \t]|(\\[\t -~]))+\")@([!#-'*+/-9=?A-Z^-~-]+(\.[!#-'*+/-9=?A-Z^-~-]+)*|\[[\t -Z^-~]*])");

    if(regex.test(str))
        return "valid Email";
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

function Authorize_User(req_JSON,response) //called when user is logs in
{
        console.log(req_JSON);
        if(validate_email(req_JSON.Email) == "valid Email" && validate_password(req_JSON.Password) == "Valid Password")
        {
            users.loadDatabase();
            users.find({Email : req_JSON.Email},(err,user_matched_array) => {
                if(user_matched_array.length)
                {
                    bcrypt.compare(req_JSON.Password,user_matched_array[0].Password).then((IsMatched) => {

                        if(IsMatched)
                        {
                            let Updated_JSON = JSON.parse(JSON.stringify(user_matched_array[0]));
                            let New_Session = {
                                Session_ID : String(Date.now())
                            }
                            Updated_JSON.Session.push(New_Session); //Inserting a new Session
                            Updated_JSON.Last_Activity = String(Date.now()); //adding last activity time

                            users.update(user_matched_array[0],Updated_JSON,{},(err,NumReplaced) => {
                                
                                console.log("Entries Updated = " + NumReplaced);
                                
                                verdict={
                                    Status : "Pass",
                                    Description : "Logged in successfully!",
                                    Session : New_Session
                                }
                                response.json(verdict);
                            })
                        }
                        else
                        {
                            verdict = {
                                Status : "Fail",
                                Description : "Wrong Credentials"
                            }
                            response.json(verdict);
                        }

                    })
                }
                else
                {
                    verdict = {
                        Status : "Fail",
                        Description : "Wrong Credentials"
                    }
                    response.json(verdict);
                }
            })
        }
        else
        {
            let verdict={
                Status : "Fail",
                Description : validate_email(req_JSON.Email) + " " + validate_password(req_JSON.Password) 
            }
            response.json(verdict);
        }
}


module.exports = {Authorize_User};