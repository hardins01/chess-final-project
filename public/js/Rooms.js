//the js file attatched to PlayRoomView.html, mainly just for updating the number of players in each room with socket

//get the DOM elements which show the client how many players are in each room
var room1Count = document.getElementById("PlayerCountRoom1");
var room2Count = document.getElementById("PlayerCountRoom2");
var room3Count = document.getElementById("PlayerCountRoom3");
var room4Count = document.getElementById("PlayerCountRoom4");
var roomCounts = [room1Count, room2Count, room3Count, room4Count];


var socket = io.connect(document.getElementById("Gameurl").textContent);    //use this when doing localtunnel
//var socket = io.connect("http://localhost:3000");      //use this when not doing localtunnel

//function to tell the server that someone is looking at the room view page
socket.on("connect", function()
{
     socket.emit("room-view-join", {});
});

//function to get the newest data from the server, then update the html this client can see
socket.on("update-room-capacities", function(data)
{
     for(var i = 0; i < data.roomCounts.length; i++)
     {
          roomCounts[i].textContent = "# of people in room: " + data.roomCounts[i];
     }
});