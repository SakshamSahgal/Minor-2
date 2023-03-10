fs = require("fs");

function Create_Directory(dir)
{
    var verdict = {}

    if(fs.existsSync(dir)) //if directory exists
        verdict.status = "The directory Already Exists";
    else
    {
        fs.mkdirSync(dir,{ recursive: true, force: true });
        verdict.status = "Successfully Created Directory";
    }

    return verdict;
}

function Delete_Directory(dir)
{
    let verdict = {}

    if(fs.existsSync(dir)) //if directory exists
    {
        console.log("dir deleting");
        fs.rmSync(dir, { recursive: true, force: true }) //recurcive true because we want to delete all files and folders inside also
        verdict.status = "Successfully Deleted Directory";
    }
    else
        verdict.status = "Directory doesnt exists";
    
    return verdict;
}

module.exports = {Create_Directory,Delete_Directory}