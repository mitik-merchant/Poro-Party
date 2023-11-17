class Login extends Phaser.Scene {

    constructor(){
        super("Login");
    }

    //pass the socket to the Login as well
    init(data){
        this.socket = data.socket;
    }

    preload(){
        this.load.html('codeform', "assets/codeform.html");
    }  

    create() {
        const scene = this;
    
        scene.popUp = scene.add.graphics();
        scene.boxes = scene.add.graphics();
    
        // for popup window
        scene.popUp.lineStyle(5, 0xffffff);
        scene.popUp.fillStyle(0xffffff, 0.5);
    
        // for boxes
        scene.boxes.lineStyle(1, 0xffffff);
        scene.boxes.fillStyle(0xa9a9a9, 1);
    
        // popup window
        scene.popUp.strokeRect(25, 25, 750, 500);
        scene.popUp.fillRect(25, 25, 750, 500);
    
        //title
        scene.title = scene.add.text(200, 60, "Poro Party!", {
          fill: "#E75480",
          fontSize: "66px",
          fontStyle: "bold",
        });

    
        scene.JoinRoomButton = scene.add.text(250, 215, "Enter Username and Select Cat!", {
          fill: "#000000",
          fontSize: "20px",
          fontStyle: "bold",
        });
        
        scene.inputElement = this.add.dom(300, 250).createFromCache("codeform");


        const form = document.getElementById('roomForm');

        //once submit button is clicked get data and ask server if the key is valid
        form.addEventListener('submit',function(event){
          event.preventDefault(); //prevent default form submission
          const usernameInput = scene.inputElement.node.querySelector('input[name="user-name"]');
          const catInput = document.querySelector('input[name="cats"]:checked');
          
          //if these values exist, save the data into data object and emit isKeyValid event
          if (usernameInput && catInput) {
            const username = usernameInput.value;
            const cat = catInput.value;
          
          if (username&&cat){
            const data = {
              username:username, 
              cat: cat}; 
            scene.socket.emit("isKeyValid", data);
          }
        }
        })
        
        //empty text
        scene.notValidText = scene.add.text(562, 295, "", {
          fill: "#ff0000",
          fontSize: "15px",
          fontStyle: "bold"
        });
        
        //display that invalid text
        scene.socket.on("KeyNotValid", function (data) {
          scene.notValidText.setText(`Username Taken, Please Try Again: ${data.username}`);
        });

        //if key is valid, emit joinRoom and exit the waiting room
        scene.socket.on("KeyisValid",  (input) => {
          scene.socket.emit("joinRoom", input);
          scene.scene.stop("Login");
        });

      
      }
}