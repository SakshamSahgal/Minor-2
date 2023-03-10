//NEDB
const Datastore = require("nedb"); //including the nedb node package for database 
const users = new Datastore("Database/users.db");


function Logout(Sessionid,res)
{
    users.loadDatabase();
    users.find({"Session.Session_ID" : Sessionid},(err,user_matched_array)=>{
        
        console.log("Found = ");
        console.log(user_matched_array);

        let verdict = {
        }

        if(user_matched_array.length == 0) //User has already logged Out/Invalid Session
        {
            verdict.Status = "Fail";
            verdict.Description = "User already logged out or Invalid Session";
            res.json(verdict);
        }
        else
        {
                let Updated_JSON = JSON.parse(JSON.stringify(user_matched_array[0]));

                for(var i=0;i<Updated_JSON.Session.length;i++)
                {
                    if(Updated_JSON.Session[i].Session_ID == String(Sessionid))
                    {
                        console.log("index = " + i);
                        Updated_JSON.Session.splice(i,1); // 2nd parameter means remove one item only
                    }
                }
                
                users.update(user_matched_array[0],Updated_JSON,{},(err,Num_Replaced) => {
                    
                    console.log("No of elements replaced = " + Num_Replaced);

                    verdict.Status = "Pass";
                    verdict.Description = "User successfully Logged out";
                    res.json(verdict);
                })  
        }
    });
}

module.exports = {Logout};