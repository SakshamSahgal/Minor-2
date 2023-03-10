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

    function Logout() //function called when user logs out
    {
            if(Cookies.get("Session_ID") == undefined)
                location.href = "./index.html";
            else
            {
                let Session_Data = {
                    Session_ID : Cookies.get("Session_ID")
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

    function Fetch_Profile_Page() //funtion fetches the static profile data
    {
        let req_json = {
            Session_ID : Cookies.get("Session_ID") ,
            Username : ((window.location.href).split("/")[4]).split(".")[0] //getting the usrename from the URL
        }
        
        console.log(req_json);

        if(req_json.Session_ID == undefined)
            location.href = "../index.html";
        else
        {
            loadOverlay.hidden = false; //revealing the load overlay

            SendToServer(req_json,"/Fetch_Static_Profile_api").then((response) => {
                console.log(response);
                loadOverlay.hidden = true; //hiding the load overlay
                if(response.Status == "Pass")
                {
                    document.getElementById("Profile_Photo").src = "../" + (response.His_Profile_Picture);
                    document.getElementById("Username").textContent = response.Username;
                    document.getElementById("user_bio").textContent = response.Bio;
                    document.getElementById("User_Gender").textContent = response.Gender;
                    document.getElementById("User_Email").textContent = response.Email;
                    document.getElementById("Activity_Status").textContent = response.Activity_Status;
                    document.getElementById("profile_picture").src = "../" + response.My_Profile_Picture;

                    if(response.Activity_Status == "Online")
                        document.getElementById("Activity_Status").style="color: green;";
                    else
                        document.getElementById("Activity_Status").style="color: red;";
                }
                else
                {
                    if(response.Description == "You are accessing your Own Profile")
                        location.href = "../Profiles.html";
                    else
                        alert(response.Description);
                }
            })
        }
    }

    function Logout()
    {
        let Session = {
            Session_ID : Cookies.get("Session_ID")
        }
    
        if(Session.Session_ID == undefined)
            location.href = "../index.html";
        else
        {
            loadOverlay.hidden = false;
            let Server_Response = SendToServer(Session,"/logout_api");
            Server_Response.then((response)=>{
                loadOverlay.hidden = true;
                console.log(response);
                if(Cookies.get("Session_ID") != undefined)
                    Cookies.remove("Session_ID");
                location.href = "../index.html";
            })
        }
    }
    Fetch_Profile_Page();