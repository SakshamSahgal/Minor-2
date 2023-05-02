let loadOverlay = document.getElementById("Load_overlay");
JSONEditor.defaults.editors.object.options.collapsed = true;

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
            alert(response.price)
            loadOverlay.hidden = true;
        })
    } 
}

function viewPredictPriceDataset()
{
    //fetching the dataset
    fetch("../Dataset_Training/dataset_for_price_prediction.json").then(response => response.json()).then(data =>{
        console.log(data);

            var container = document.getElementById('json-editor');
            var editor = new JSONEditor(container, {
                mode: 'view',
                search: false,
                indentation: 4,
                theme: 'bootstrap5', // or any other theme you prefer
                schema: {
                    type: 'object',
                    title: 'View Generated Database',
                    properties: {
                    
                    }
                },
                iconlib: 'fontawesome4',
                startval: data,
                disable_array_reorder : true,
                compact : true,
                remove_button_labels : true,
                disable_properties : true,
                disable_array_delete : true,
                disable_edit_json : true,
                startCollapsed: true,
            });
            

    })
}

Fetch_Dashboard();

viewPredictPriceDataset();