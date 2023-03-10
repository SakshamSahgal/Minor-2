
const {Validate_Session} = require("../Auth/validate_session.js");


function Fetch_Dashboard(req_JSON,res)
{
    Validate_Session(req_JSON).then( (Session_Result) => {
        
        if(Session_Result.length) //session Exists
        {
            let verdict={
                Status : "Pass",
                Profile_Picture : Session_Result[0].Profile_Picture 
            }

            res.json(verdict);
        }
        else
        {
            let verdict={
                Status : "Pass",
                Description : "Invalid Session"
            }
            res.json(verdict);
        }
    }) 
}

module.exports = {Fetch_Dashboard}