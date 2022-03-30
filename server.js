//get external packages
var fs = require("fs");
var path = require("path");
var express = require("express");
var exphbs = require("express-handlebars");
var socket = require("socket.io");
const localtunnel = require('localtunnel');

//set up express
var app = express();
const port = process.env.PORT || 3000;

//initialize express-handlebars with no main layout and "/views/partials" as the partials directory
app.engine("handlebars", exphbs({ defaultLayout: null, partialsDir: [path.join(__dirname + "/views/partials")]}));
app.set("view engine", "handlebars");

//initialize localtunnel
var Gameurl = "null";
(async () => 
{
	const tunnel = await localtunnel({ port: port });
   
	Gameurl = tunnel.url;
	console.log("url for the game:", tunnel.url)
	tunnel.on('close', () => {
		// tunnels are closed
	});
})();


//middleware functions
//if the client asks for one of the rooms, give them the most updated version of that board
app.get("/room:n", function(req, res, next)
{
	var n = parseInt(req.params.n);
	if(n !== NaN && n >= 1 && n <= 4)
	{
		var dataToSend = {url: Gameurl, roomNum: n};
		for(const [key, value] of Object.entries(rooms[n - 1].boardData))
		{
			dataToSend[key] = value;
		}
		res.status(200).render("room", dataToSend);
		return;
	}
	next();
});

//send everything in the public directory by name
app.use(express.static("public"));

//if the user asks for the homepage, give them the home page
app.get("/", function(req, res)
{
	res.status(200).sendFile(path.join(__dirname + "/html/MainChess.html"));
});

//if the user asks for the creators page
app.get("/Creators", function(req, res)
{
	res.status(200).sendFile(path.join(__dirname + "/html/Creators.html"));
});

//if the user asks for the how to play page
app.get("/HowToPlay", function(req, res)
{
	res.status(200).sendFile(path.join(__dirname + "/html/HowToPlay.html"));
});

//if the user asks for the room view page
app.get("/Rooms", function(req, res)
{
	res.status(200).render("rooms", {url: Gameurl});
});


//tell the server to begin listening
var server = app.listen(port, function()
{
	console.log("server is now set up on port", port);
});


//game variables used by socket, different for each room
var rooms = [
	{
		//room1
		numPeopleInRoom: 0,
		player1id: "",
		player2id: "",
		spectatorQueue: [],
		whoseTurn: -1,
		boardData: {}
	},
	{
		//room2
		numPeopleInRoom: 0,
		player1id: "",
		player2id: "",
		spectatorQueue: [],
		whoseTurn: -1,
		boardData: {}
	},
	{
		//room3
		numPeopleInRoom: 0,
		player1id: "",
		player2id: "",
		spectatorQueue: [],
		whoseTurn: -1,
		boardData: {}
	},
	{
		//room4
		numPeopleInRoom: 0,
		player1id: "",
		player2id: "",
		spectatorQueue: [],
		whoseTurn: -1,
		boardData: {}
	}
];

//fill the data for all the boards at the initial state of the game
var initialBoardData = JSON.parse(fs.readFileSync("initialBoardState.json"));
for(var i = 0; i < rooms.length; i++)
{
	rooms[i].boardData = initialBoardData;
}

//an array of all people looking at the room view
var roomViewids = [];



//initialize socket.io
var io = socket(server);

//function to call when the game ends, it's here because it happens on multiple occasions
function endGame(data)
{
	//tell all players and spectators in current room who won
	io.to(rooms[data.roomNum - 1].player1id).emit("game-over", {winner: data.winner});  //tell player 1 the game is over
	if(rooms[data.roomNum - 1].player2id !== "")
	{
		io.to(rooms[data.roomNum - 1].player2id).emit("game-over", {winner: data.winner});  //tell player 2 the game is over
	}
	for(var i = 0; i < rooms[data.roomNum - 1].spectatorQueue.length; i++)
	{
		io.to(rooms[data.roomNum - 1].spectatorQueue[i]).emit("game-over", {winner: data.winner});  //spectators the game is over
	}
	
	//move the current players 1 and 2 back to the end of the queue, the winner first
	if(data.winner === 1)    //player 1 won
	{
		rooms[data.roomNum - 1].spectatorQueue.push(rooms[data.roomNum - 1].player1id);
		rooms[data.roomNum - 1].player1id = "";
		if(rooms[data.roomNum - 1].player2id !== "")  //do extra check just in case player 2 left
		{
			rooms[data.roomNum - 1].spectatorQueue.push(rooms[data.roomNum - 1].player2id);
			rooms[data.roomNum - 1].player2id = "";
		}
	}
	else       //player 2 won
	{
		if(rooms[data.roomNum - 1].player2id !== "")  //do extra check just in case player 2 left
		{
			rooms[data.roomNum - 1].spectatorQueue.push(rooms[data.roomNum - 1].player2id);
			rooms[data.roomNum - 1].player2id = "";
		}
		if(rooms[data.roomNum - 1].player1id !== "")  //do extra check just in case player 1 left
		{
			rooms[data.roomNum - 1].spectatorQueue.push(rooms[data.roomNum - 1].player1id);
			rooms[data.roomNum - 1].player1id = "";
		}	
	}

	//pop the next two players off the front of the queue, and make them players 1 and 2
	if(rooms[data.roomNum - 1].spectatorQueue.length > 0)   //do extra check since there's no one to make player 1
	{
		rooms[data.roomNum - 1].player1id = rooms[data.roomNum - 1].spectatorQueue.shift();
	}
	if(rooms[data.roomNum - 1].spectatorQueue.length > 0)   //do extra check since there's no one else to make player 2
	{
		rooms[data.roomNum - 1].player2id = rooms[data.roomNum - 1].spectatorQueue.shift();
	}

	//function to set up the next game, to be called after 5 seconds
	function restartGame()
	{
		//tell player1 and player2 that they're player1 and player2
		if(rooms[data.roomNum - 1].player1id !== "")
		{
			io.to(rooms[data.roomNum - 1].player1id).emit("player-join-game", {playerNum: 1});
		}
		if(rooms[data.roomNum - 1].player2id !== "")   //do extra check just in case there is no player 2
		{
			io.to(rooms[data.roomNum - 1].player2id).emit("player-join-game", {playerNum: 2});
		}

		//tell the spectators that they're spectators
		for(var i = 0; i < rooms[data.roomNum - 1].spectatorQueue.length; i++)
		{
			io.to(rooms[data.roomNum - 1].spectatorQueue[i]).emit("player-join-game", {playerNum: 0});
		}
		updateQueuePositions(data.roomNum);   //tell spectators their updated queue positions

		//reset everyone's boards
		rooms[data.roomNum - 1].boardData = initialBoardData;
		if(rooms[data.roomNum - 1].player1id !== "")
		{
			io.to(rooms[data.roomNum - 1].player1id).emit("update-board", {board: rooms[data.roomNum - 1].boardData});  //update player 1's board
		}
		if(rooms[data.roomNum - 1].player2id !== "")
		{
			io.to(rooms[data.roomNum - 1].player2id).emit("update-board", {board: rooms[data.roomNum - 1].boardData});  //update player 2's board
		}
		for(var i = 0; i < rooms[data.roomNum - 1].spectatorQueue.length; i++)
		{
			io.to(rooms[data.roomNum - 1].spectatorQueue[i]).emit("update-board", {board: rooms[data.roomNum - 1].boardData});  //update spectator's boards
		}

		//tell player1 and player 2 to begin playing
		if(rooms[data.roomNum - 1].player1id !== "" && rooms[data.roomNum - 1].player2id !== "")   //if there is a player1 and player2
		{
			io.to(rooms[data.roomNum - 1].player1id).emit("begin-game", {whoseTurn: 1});
			io.to(rooms[data.roomNum - 1].player2id).emit("begin-game", {whoseTurn: 1});
			rooms[data.roomNum - 1].whoseTurn = 1;
		}
		else if(rooms[data.roomNum - 1].player1id !== "")   //if there's a player1 but not a player2
		{
			io.to(rooms[data.roomNum - 1].player1id).emit("begin-game", {whoseTurn: -1});
			rooms[data.roomNum - 1].whoseTurn = -1;
		}
	}
	setTimeout(restartGame, 5000);
}


//function to tell everyone in the queue their position
function updateQueuePositions(roomNum)
{
	for(var i = 0; i < rooms[roomNum - 1].spectatorQueue.length; i++)
	{
		//loop through spectatorQueue and tell each one their updated position in the queue
		io.to(rooms[roomNum - 1].spectatorQueue[i]).emit("queue-position", {position: i + 1});
	}
}


//function to update the capacities of the rooms to all the people on the room view page
function updateRoomCapacities()
{
	//calculate the number of people in each room by looping through every room
	var roomCounts = [0, 0, 0, 0];
	for(var i = 0; i < rooms.length; i++)
	{
		if(rooms[i].player1id !== "")
		{
			roomCounts[i]++;
		}
		if(rooms[i].player2id !== "")
		{
			roomCounts[i]++;
		}
		roomCounts[i] += rooms[i].spectatorQueue.length;
	}

	//for every person on the room view page
	for(var i = 0; i < roomViewids.length; i++)
	{
		io.to(roomViewids[i]).emit("update-room-capacities", {roomCounts: roomCounts});
	}
}


//all the socket.io functions to do when someone joins
io.on("connection", function(socket)
{
	//function to run when someone joins the room view page
	socket.on("room-view-join", function(data)
	{
		roomViewids.push(socket.id);  //push their id in the room view page

		//emit to all room view people how many people there are in each room
		updateRoomCapacities();
	});

	//function to run right when the player connects (the client calls enter-room as soon as it connects)
	socket.on("enter-room", function(data)
	{
		//tell this player what player they are
		if(rooms[data.roomNum - 1].numPeopleInRoom == 0)
		{
			//this player is player 1
			console.log("player 1 has joined room", data.roomNum, socket.id);
			rooms[data.roomNum - 1].player1id = socket.id;
			io.to(rooms[data.roomNum - 1].player1id).emit("player-join-game", {playerNum: 1});
			rooms[data.roomNum - 1].numPeopleInRoom++;

			//send a code to tell player 1 to wait for a player 2 to join
			io.to(rooms[data.roomNum - 1].player1id).emit("begin-game", {whoseTurn: -1});
			rooms[data.roomNum - 1].whoseTurn = -1;
		}
		else if(rooms[data.roomNum - 1].numPeopleInRoom == 1)
		{
			//this player is player 2
			console.log("player 2 has joined room", data.roomNum, socket.id);
			rooms[data.roomNum - 1].player2id = socket.id;
			io.to(rooms[data.roomNum - 1].player2id).emit("player-join-game", {playerNum: 2});
			rooms[data.roomNum - 1].numPeopleInRoom++;

			//start the game, tell everyone that it's player 1's turn
			io.to(rooms[data.roomNum - 1].player1id).emit("begin-game", {whoseTurn: 1});
			io.to(rooms[data.roomNum - 1].player2id).emit("begin-game", {whoseTurn: 1});
			rooms[data.roomNum - 1].whoseTurn = 1;
		}
		else
		{
			//since there are already too many players in this game, the incoming connection is a spectator
			console.log("spectator has joined room", data.roomNum, socket.id);
			rooms[data.roomNum - 1].spectatorQueue.push(socket.id);
			io.to(socket.id).emit("player-join-game", {playerNum: 0});
			//io.to(socket.id).emit("update-board", {board: rooms[data.roomNum - 1].boardData});
			updateQueuePositions(data.roomNum);
			rooms[data.roomNum - 1].numPeopleInRoom++;
		}
		updateRoomCapacities();
	});
	

	
	//function to update the board, emitted to every player and spectator
	socket.on("update-board", function(data)
	{
		//update the boardData variable, stored here on the server
		rooms[data.roomNum - 1].boardData = data.board;
		
		//update the board for every player and spectator in given room
		io.to(rooms[data.roomNum - 1].player1id).emit("update-board", {board: rooms[data.roomNum - 1].boardData});
		io.to(rooms[data.roomNum - 1].player2id).emit("update-board", {board: rooms[data.roomNum - 1].boardData});
		for(var i = 0; i < rooms[data.roomNum - 1].spectatorQueue.length; i++)
		{
			io.to(rooms[data.roomNum - 1].spectatorQueue[i]).emit("update-board", {board: rooms[data.roomNum - 1].boardData});
		}
	});

	//function to update the server's version of whose turn it is
	socket.on("next-turn", function(data)
	{
		rooms[data.roomNum - 1].whoseTurn = data.whoseTurn;

		//tell every player and spectator in the given room whose turn it is
		io.to(rooms[data.roomNum - 1].player1id).emit("next-turn", {whoseTurn: rooms[data.roomNum - 1].whoseTurn});
		io.to(rooms[data.roomNum - 1].player2id).emit("next-turn", {whoseTurn: rooms[data.roomNum - 1].whoseTurn});
		for(var i = 0; i < rooms[data.roomNum - 1].spectatorQueue.length; i++)
		{
			io.to(rooms[data.roomNum - 1].spectatorQueue[i]).emit("next-turn", {whoseTurn: rooms[data.roomNum - 1].whoseTurn});
		}
	});

	//function to distribute to everyone who won and who lost
	socket.on("game-over", function(data)
	{
		endGame(data);
	});
	
	//function to deal with someone leaving the room
	socket.on("disconnect", function(data)
	{
		//check if this person was on the room view page
		for(var i = 0; i < roomViewids.length; i++)
		{
			if(roomViewids[i] === socket.id)   //if we found the client that left as part of the roomViewids array
			{
				roomViewids.splice(i, 1);   //remove them from the array
				return;   //don't do anything else in this function
			}
		}
		
		//first try to figure out which room the current user was in when they left
		var roomNum;
		for(var i = 0; i < 4; i++)   //loop through each room, comparing to players and spectators
		{
			if(rooms[i].player1id === socket.id || rooms[i].player2id === socket.id)
			{
				//we found socket.id as player1 or player2 in room i
				roomNum = i + 1;
				break;
			}
			for(var j = 0; j < rooms[i].spectatorQueue.length; j++)
			{
				if(rooms[i].spectatorQueue[j] === socket.id)
				{
					//we found socket.id as a spectator in room i
					roomNum = i + 1;
					break;
				}
			}
		}

		//do special things for each type of player leaving
		console.log(socket.id, "left room", roomNum);
		if(socket.id === rooms[roomNum - 1].player1id)   //player 1 left
		{
			//declare player 2 as the winner
			rooms[roomNum - 1].player1id = "";
			endGame({winner: 2, roomNum: roomNum});
		}
		else if(socket.id === rooms[roomNum - 1].player2id)    //player 2 left
		{
			//declare player 1 as the winner
			rooms[roomNum - 1].player2id = "";
			endGame({winner: 1, roomNum: roomNum});
		}
		else   //a spectator left
		{ 
			//remove them from spectatorQueue
			for(var i = 0; i < rooms[roomNum - 1].spectatorQueue.length; i++)
			{
				if(rooms[roomNum - 1].spectatorQueue[i] === socket.id)
				{
					rooms[roomNum - 1].spectatorQueue.splice(i, 1);
					break;
				}
			}
			updateQueuePositions(roomNum);
		}
		rooms[roomNum - 1].numPeopleInRoom--;

		//update room capacities for people in the rooms page
		updateRoomCapacities();
	});
});

