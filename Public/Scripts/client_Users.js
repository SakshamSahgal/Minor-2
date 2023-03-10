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

    function Display_On_Table(users_arr)
    {
        let this_Table_Body = document.getElementById("users_table_body");
        let row_counter=1;
        users_arr.forEach(user => {

          //creating new row
          let new_row = document.createElement("tr");
          new_row.classList.add("bg-light");
          new_row.style="--bs-bg-opacity: .6;";

          //creating number col for this row
          let new_head = document.createElement("th");
          new_head.scope = "row";
          new_head.classList.add("text-center");
          new_head.textContent = row_counter++;

          //creating profile picture col
          let Profile_Picture_Col = document.createElement("td");
          Profile_Picture_Col.classList.add("text-center");

          //creating image for profile picture col
          let this_profile_picture = document.createElement("img");
          this_profile_picture.src = user.Profile_Picture;
          this_profile_picture.height = "50";
          this_profile_picture.classList.add("rounded-circle");
          this_profile_picture.classList.add("shadow-4-strong");
          
          Profile_Picture_Col.appendChild(this_profile_picture); 
         
          //creating handle col
          let Handle_col = document.createElement("td");
          Handle_col.innerHTML = "<a href=/Profiles/" + user.Username + ".html >" + user.Username + " </a>" ;
          Handle_col.classList.add("text-center");

          //creating Activity Status Coll
          let Activity_Status_Col = document.createElement("td");
          Activity_Status_Col.classList.add("text-center");
          Activity_Status_Col.innerHTML = "<b>" +  user.Activity_Status + "</b>";
          Activity_Status_Col.style = (user.Activity_Status == "Online") ? "color: green;" : "color: red;";

          new_row.appendChild(new_head);
          new_row.appendChild(Profile_Picture_Col);
          new_row.appendChild(Handle_col);
          new_row.appendChild(Activity_Status_Col);
          this_Table_Body.appendChild(new_row);
        });
    }

    function Fetch_All_Users()
    {
        let Session={
            Session_ID : Cookies.get("Session_ID")
        }

        if(Session.Session_ID == undefined)
            location.href = "./index.html";
        else
        {
            loadOverlay.hidden = false; //Revealing the load overlay [while user fetches from database]
            SendToServer(Session,"/Fetch_Users").then((response) => {
                console.log(response);
                loadOverlay.hidden = true; //hiding the load overlay
                if(response.Status == "Fail" && response.Description == "Invalid Session")
                    location.href = "./logged_out.html";
                else
                {
                    Display_On_Table(response.users);
                    document.getElementById("profile_picture").src = response.My_Profile_Picture;
                    document.getElementById("information_modal").textContent = response.Information;
                }
            })

        }
    }

    Fetch_All_Users();