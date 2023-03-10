//NEDB
const Datastore = require("nedb"); //including the nedb node package for database 
const users = new Datastore("Database/users.db");

function Return_Users_DB(res)
{
    users.loadDatabase();
    users.find({},(err,data) => {
        res.json(data);
    })
}

module.exports = {Return_Users_DB}