//NEDB
const Datastore = require("nedb"); //including the nedb node package for database 
const users = new Datastore("Database/users.db");
//-------------------------------------------------------------------------------------
const {Validate_Session} = require("../Auth/validate_session.JS")
const {Delete_Directory} = require("../directories.js"); //for creating Directories

function Delete_Account(req_JSON,res)
{
        console.log("searching for session -> ");
        console.log(req_JSON.Session_ID);
        
        Validate_Session(req_JSON).then((session_matched_array) => {
            if(session_matched_array.length) //valid Session
            {
                users.loadDatabase();
                users.remove(session_matched_array[0],{},(err,NumRemoved) => {
                    
                    console.log("No of entries removed from DB = " + NumRemoved);
                    let dir = "Media/" + session_matched_array[0].Username;
                    console.log(Delete_Directory(dir)); //deleting the media folder
                    dir = "Public/Profiles/" + session_matched_array[0].Username + ".html";
                    console.log(Delete_Directory(dir)); //deleting the profile page
                    let verdict={
                        Status : "Pass",
                        Description : "Successfully Deleted Account"
                    }
                    res.json(verdict);
                })
            }
            else //invalid Session
            {
                let verdict={
                    Status : "Fail",
                    Description : "Invalid Session"
                }
                res.json(verdict);
            }
        })
}

module.exports = {Delete_Account}