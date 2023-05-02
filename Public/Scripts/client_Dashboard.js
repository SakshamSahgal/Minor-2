let loadOverlay = document.getElementById("Load_overlay");

async function SendToServer(JSON_to_Send,Route)
{
        let send_package_obj = { //packing it in an object
        method : 'POST' ,
        headers : {
            'Content-Type' : 'application/json' //telling that i am sending a JSON
        } ,
        body : JSON.stringify(JSON_to_Send)
        }
    
        let server_response = await fetch(Route,send_package_obj);
        return await server_response.json()
}


function Logout()
{
        if(Cookies.get("Session_ID") == undefined)
            location.href = "./index.html";
        else
        {
            let Session_Data = {
                Session_ID : Cookies.get("Session_ID"),
            }
            loadOverlay.hidden = false;  //Revealing the load overlay
            let Server_Response = SendToServer(Session_Data,"/logout_api");
            Server_Response.then((response)=>{
                loadOverlay.hidden = true; //hiding load overlay
                console.log(response);
                if(Cookies.get("Session_ID") != undefined)
                    Cookies.remove("Session_ID");
                location.href = "./index.html";
            })
        }
}


function Fetch_Dashboard() //function called at the page load [fetches dashboard content]
{
    let Session = {
        Session_ID : Cookies.get("Session_ID")

    }
    if(Session.Session_ID == undefined) //accesing via link
        location.href = "./index.html";
    else
    {
        loadOverlay.hidden = false;
        SendToServer(Session,"/Fetch_Dashboard_api").then( (response)=> {
            console.log(response);
            loadOverlay.hidden = true;
            if(response.Status == "Pass")
            {
                document.getElementById("profile_picture").src = response.Profile_Picture;
            }
            else
                alert(response.Description);

        })
    }
}


function getPricePrediction()
{
    let Session = {
        Session_ID : Cookies.get("Session_ID"),
        cropType : document.getElementById("cropType").value,
        year : parseInt(document.getElementById("yearInput").value)
    }
    if(Session.Session_ID == undefined) //accesing via link
        location.href = "./index.html";
    else
    {
        console.log(Session);
        loadOverlay.hidden = false;
        SendToServer(Session,"/getPricePrediction").then( (response)=> {
            console.log(response);
            alert(response.price + " price per kg")
            loadOverlay.hidden = true;
        })
    } 
}

function PredictDemand()
{
    let Session = {
        Session_ID : Cookies.get("Session_ID"),
        cropType : document.getElementById("cropTypeDemand").value,
        region : document.getElementById("Region").value,
        year : parseInt(document.getElementById("yearInputDemand").value)
    }
    if(Session.Session_ID == undefined) //accesing via link
        location.href = "./index.html";
    else
    {
        console.log(Session);
        loadOverlay.hidden = false;
        SendToServer(Session,"/getDemandPrediction").then( (response)=> {
            console.log(response);
            alert(response.Demand + " Metric Ton")
            loadOverlay.hidden = true;
        })
    } 
}


Fetch_Dashboard();

