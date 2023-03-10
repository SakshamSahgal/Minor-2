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

    function Register_Email()
    {
        let Register = {
        Email : document.getElementById("register_email").value,
        }
        console.log(Register);
        loadOverlay.hidden = false;
         SendToServer(Register,"/Register_Email_api").then((response) => {
            loadOverlay.hidden = true;
             console.log(response);   
             if(response.Status == "Pass")
             {
                document.getElementById("Register_Email_Div").hidden = true; //hiding email div
                document.getElementById("Register_Username_Div").hidden = false; //revealing username div

             }  
             else
                alert(response.Description);       
        })
    }

    function Register_Username()
    {
        let Register = {
            Email : document.getElementById("register_email").value,
            Username : document.getElementById("register_username").value
        }

        loadOverlay.hidden = false;
        SendToServer(Register,"/Register_Username_api").then((response)=>{
            loadOverlay.hidden = true;
            console.log(response);
            
            if(response.Status == "Pass")
            {
                document.getElementById("Register_Username_Div").hidden = true; //hiding username div
                document.getElementById("Register_OTP_Div").hidden = false; //revealing OTP div
            }
            else
                alert(response.Description);
        })

    }

    function Register_OTP()
    {
        let Register = {
            Email : document.getElementById("register_email").value,
            Username : document.getElementById("register_username").value,
            OTP : document.getElementById("register_otp").value
        }
        loadOverlay.hidden = false;
        SendToServer(Register,"/Register_OTP_api").then((response)=>{
            loadOverlay.hidden = true;
            console.log(response);
            if(response.Status == "Pass")
            {
                document.getElementById("Register_OTP_Div").hidden = true;//hiding OTP div
                document.getElementById("Register_Password_Div").hidden = false;//revealing register password div
            }
            else
                alert(response.Description);
        })
    }


    function Register_Password()
    {
        let Register = {
            Email : document.getElementById("register_email").value,
            Username : document.getElementById("register_username").value,
            Password :document.getElementById("register_password").value
        }

        SendToServer(Register,"/Register_Password_api").then((response)=>{
            console.log(response);
            if(response.Status == "Pass")
            {
                alert(response.Description);
                window.location.reload();//refresh page
            }
            else
                alert(response.Description);
        }) 

    }

    function Log_in() //Logs in User
    {
        let Login_Credentials = { //getting the crenditials from the input field
            Email : document.getElementById("login_email").value,
            Password : document.getElementById("login_pass").value
        }
        
        console.log(Login_Credentials);
        loadOverlay.hidden = false; //revealing the load overlay
        let server_response = SendToServer(Login_Credentials,'/auth_api');
        server_response.then((response)=>{
            loadOverlay.hidden = true; //hiding the load overlay
            console.log(response);
            if(response.Status == "Pass")
            {
                Cookies.set("Session_ID",response.Session.Session_ID,{ expires: 7 });
                location.href = "./Dashboard.html";
            }
            else
                alert(response.Description);                
        });
    }


    function Validate_Session() //checks if the user is already logged in
    {
        let Session = {
            Session_ID : Cookies.get("Session_ID")
        }

        if(Session.Session_ID != undefined )
        {
            loadOverlay.hidden = false; //revealing the load overlay

            SendToServer(Session,"/validate_session_api").then((response)=>{

                loadOverlay.hidden = true; //hiding the load overlay

                console.log(response);
                if(response.Status == "Session Matched")
                    location.href = "./Dashboard.html";
                else
                   Cookies.remove("Session_ID");
            });
        }
    }

Validate_Session();