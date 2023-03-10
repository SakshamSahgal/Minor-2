const {Validate_Session} = require("../Auth/validate_session.js");
const Datastore = require("nedb"); //including the nedb node package for database 
const users = new Datastore("Database/users.db");

//Dotenv
require("dotenv").config();//reading the .env file

function Fetch_All_Users(req_JSON,res)
{
    let verdict = {}
    Validate_Session(req_JSON,res).then((session_match_array) => {

        if(session_match_array.length)
        {
            users_array = [] //array that contains the returing JSONs

            users.loadDatabase();
            users.find({},(err,users_matched_array) => { //returning all elements from the users database

                users_matched_array.forEach(element => { //Iterating over each user in the returned array
                    
                    let this_user_json = {} //JSON that stores the returning data of this particular user

                    this_user_json.Username = element.Username;
                    this_user_json.Profile_Picture = element.Profile_Picture;
                    
                    if(element.Username == session_match_array[0].Username) //if this is my Username
                        verdict.My_Profile_Picture = element.Profile_Picture;

                    
                    //console.log(parseInt(Date.now()) , "-" , parseInt(element.Last_Activity) , " = " , parseInt(Date.now()) - parseInt(element.Last_Activity));

                    
                    if( (parseInt(Date.now()) - parseInt(element.Last_Activity))  <= process.env.Activity_Duration && element.Session.length > 0) //checking the activity status (online if logged-in and last activity less than 5 minutes)
                        this_user_json.Activity_Status = "Online";
                    else
                        this_user_json.Activity_Status = "Offline";

                        users_array.push(this_user_json);

                    if(users_array.length == users_matched_array.length)
                    {
                        verdict.Status = "Pass";
                        verdict.users = users_array;
                        verdict.Information = "Users Inactive for more than " + (process.env.Activity_Duration/60000)  + " minutes are shown offline";
                        res.json(verdict);
                    }

                });
            })
        }
        else
        {
            verdict.Status = "Fail";
            verdict.Description = "Invalid Session";
            res.json(verdict);
        }
    })
}

module.exports = {Fetch_All_Users}