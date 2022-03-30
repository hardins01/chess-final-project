//this is the js file to control the logic of the chess board and game

//find the board
var chessBoard = document.getElementById("board");

//find the status and warning messages
var statusMessage = document.getElementById("status-message");
var warningMessage = document.getElementById("warning-message");

//the number that this player is, either 1 or 2, or 0 if they're a spectator
var playerNum;

//the number of the player whose turn it currently is -1 = waiting for players to join, 1 = player1's turn, 2 = player2's turn
var whoseTurn = -1;

//get which room this user is in, determined by the url of the page
var roomNum = parseInt(window.location.href[window.location.href.length - 1]);

//declare the mp3 clip to be played when a piece is moved
var pieceMovementAudio = new Audio("audio/capture.mp3");

//helper function for Board class (remember that row and col range from 0-7)
function constructSquareID(row, col)
{
     var result = "";
     switch(col)
     {
          case 0:
               result += "a";
               break;
          case 1:
               result += "b";
               break;
          case 2:
               result += "c";
               break;
          case 3:
               result += "d";
               break;
          case 4:
               result += "e";
               break;
          case 5:
               result += "f";
               break;
          case 6:
               result += "g";
               break;
          case 7:
               result += "h";
               break;
     }
     result += 8 - row;
     return result;
}

//helper function to return the coordinates given the id of the square
//returns an array of length 2, in the format of [row, col]
function constructCoordinates(squareID)
{
     var result = [-1, -1];  //these coordinates are [row, col]
     
     //get each piece of the id
     var locationCol = squareID.slice(0, 1);  //the column of the square, "a"-"f"
     var locationRow = squareID.slice(1);     //the row of the square, "1"-"8"

     //convert the row from a string to the correct value
     result[0] = 8 - parseInt(locationRow);

     //convert the column from a string to the correct value
     switch(locationCol)
     {
          case "a":
               result[1] = 0;
               break;
          case "b":
               result[1] = 1;
               break;
          case "c":
               result[1] = 2;
               break;
          case "d":
               result[1] = 3;
               break;
          case "e":
               result[1] = 4;
               break;
          case "f":
               result[1] = 5;
               break;
          case "g":
               result[1] = 6;
               break;
          case "h":
               result[1] = 7;
               break;
     }
     return result;
}

//the Board class
class Board
{     
     //the constructor for the Board class
     constructor(chessBoardFromDOM, boardData)
     {
          //store the version of the board from the DOM
          this.boardInDOM = chessBoardFromDOM;

          //an object to store the data of the board, modelled after the boardData.json file used by the server
          this.boardData = {
               a8url: "", b8url: "", c8url: "", d8url: "", e8url: "", f8url: "", g8url: "", h8url: "",
               a7url: "", b7url: "", c7url: "", d7url: "", e7url: "", f7url: "", g7url: "", h7url: "",
               a6url: "", b6url: "", c6url: "", d6url: "", e6url: "", f6url: "", g6url: "", h6url: "",
               a5url: "", b5url: "", c5url: "", d5url: "", e5url: "", f5url: "", g5url: "", h5url: "",
               a4url: "", b4url: "", c4url: "", d4url: "", e4url: "", f4url: "", g4url: "", h4url: "",
               a3url: "", b3url: "", c3url: "", d3url: "", e3url: "", f3url: "", g3url: "", h3url: "",
               a2url: "", b2url: "", c2url: "", d2url: "", e2url: "", f2url: "", g2url: "", h2url: "",
               a1url: "", b1url: "", c1url: "", d1url: "", e1url: "", f1url: "", g1url: "", h1url: ""
          };

          //create the 2D array, to store the squares of boardInDOM
          this.gameboard = [
               [0, 0, 0, 0, 0, 0, 0, 0], 
               [0, 0, 0, 0, 0, 0, 0, 0], 
               [0, 0, 0, 0, 0, 0, 0, 0], 
               [0, 0, 0, 0, 0, 0, 0, 0], 
               [0, 0, 0, 0, 0, 0, 0, 0], 
               [0, 0, 0, 0, 0, 0, 0, 0], 
               [0, 0, 0, 0, 0, 0, 0, 0], 
               [0, 0, 0, 0, 0, 0, 0, 0]
          ];

          //an array of all the pieces on the board at any given time
          this.pieces = [];

          //declare variable to keep track of whether a square is selected
          this.squareIsSelected = false;

          //loop through gameboard, setting each index to its corresponding square on the board
          for(var row = 0; row < this.gameboard.length; row++)
          {
               for(var col = 0; col < this.gameboard[0].length; col++)
               {
                    this.gameboard[row][col] = this.boardInDOM.querySelector("#" + constructSquareID(row, col));
               }
          }
     }

     //function to remove the selection of all squares
     removeSquareSelections()
     {
          for(var row = 0; row < this.gameboard.length; row++)
          {
               for(var col = 0; col < this.gameboard[0].length; col++)
               {
                    this.gameboard[row][col].classList.remove("selected");
                    this.gameboard[row][col].classList.remove("valid-move");
               }
          }
     }

     //function to initialize the board with all the pieces on it in the correct positions
     //this is no longer necessary due to boardData.json being in charge of piece positions
     initialize()
     {
          //add the pawns to the board
          var w_pawn1 = new Pawn(this, "a2", "white");
          var w_pawn2 = new Pawn(this, "b2", "white");
          var w_pawn3 = new Pawn(this, "c2", "white");
          var w_pawn4 = new Pawn(this, "d2", "white");
          var w_pawn5 = new Pawn(this, "e2", "white");
          var w_pawn6 = new Pawn(this, "f2", "white");
          var w_pawn7 = new Pawn(this, "g2", "white");
          var w_pawn8 = new Pawn(this, "h2", "white");
          var b_pawn1 = new Pawn(this, "a7", "black");
          var b_pawn2 = new Pawn(this, "b7", "black");
          var b_pawn3 = new Pawn(this, "c7", "black");
          var b_pawn4 = new Pawn(this, "d7", "black");
          var b_pawn5 = new Pawn(this, "e7", "black");
          var b_pawn6 = new Pawn(this, "f7", "black");
          var b_pawn7 = new Pawn(this, "g7", "black");
          var b_pawn8 = new Pawn(this, "h7", "black");

          //add the rooks to the board
          var w_rook1 = new Rook(this, "a1", "white");
          var w_rook2 = new Rook(this, "h1", "white");
          var b_rook1 = new Rook(this, "a8", "black");
          var b_rook2 = new Rook(this, "h8", "black");

          //add the knights to the board
          var w_knight1 = new Knight(this, "b1", "white");
          var w_knight2 = new Knight(this, "g1", "white");
          var b_knight1 = new Knight(this, "b8", "black");
          var b_knight2 = new Knight(this, "g8", "black");

          //add the bishops to the board
          var w_bishop1 = new Bishop(this, "c1", "white");
          var w_bishop2 = new Bishop(this, "f1", "white");
          var b_bishop1 = new Bishop(this, "c8", "black");
          var b_bishop2 = new Bishop(this, "f8", "black");

          //add the queens to the board
          var w_queen = new Queen(this, "d1", "white");
          var b_queen = new Queen(this, "d8", "black");

          //add the kings to the board
          var w_king = new King(this, "e1", "white");
          var b_king = new King(this, "e8", "black");
     }


     //function to update all the pieces on the board based on what the template creates
     updatePiecesArrayFromHTML()
     {
          //clear the current array of pieces
          this.pieces = [];

          //loop through the board, looking for pieces
          for(var row = 0; row < this.gameboard.length; row++)
          {
               for(var col = 0; col < this.gameboard[0].length; col++)
               {
                    //if the square contains a piece, create that new piece and add it to the pieces array
                    var img_source = this.gameboard[row][col].querySelector(".piece").src;
                    
                    //clean up the src to just get the url of the image, not the full site
                    if(img_source.indexOf("images") !== -1)
                    {
                         img_source = img_source.substring(img_source.indexOf("images"));
                    }
                    else
                    {
                         img_source = "";
                    }

                    //perform the check for each possible piece
                    switch(img_source)
                    {
                         case "":
                              break;
                         case "images/Pawn_w.png":
                              var new_pawn = new Pawn(this, this.gameboard[row][col].id, "white");
                              break;
                         case "images/Pawn_b.png":
                              var new_pawn = new Pawn(this, this.gameboard[row][col].id, "black");
                              break;
                         case "images/Rook_w.png":
                              var new_rook = new Rook(this, this.gameboard[row][col].id, "white");
                              break;
                         case "images/Rook_b.png":
                              var new_rook = new Rook(this, this.gameboard[row][col].id, "black");
                              break;
                         case "images/Knight_w.png":
                              var new_knight = new Knight(this, this.gameboard[row][col].id, "white");
                              break;
                         case "images/Knight_b.png":
                              var new_knight = new Knight(this, this.gameboard[row][col].id, "black");
                              break;
                         case "images/Bishop_w.png":
                              var new_bishop = new Bishop(this, this.gameboard[row][col].id, "white");
                              break;
                         case "images/Bishop_b.png":
                              var new_bishop = new Bishop(this, this.gameboard[row][col].id, "black");
                              break;
                         case "images/King_w.png":
                              var new_king = new King(this, this.gameboard[row][col].id, "white");
                              break;
                         case "images/King_b.png":
                              var new_king = new King(this, this.gameboard[row][col].id, "black");
                              break;
                         case "images/Queen_w.png":
                              var new_queen = new Queen(this, this.gameboard[row][col].id, "white");
                              break;
                         case "images/Queen_b.png":
                              var new_queen = new Queen(this, this.gameboard[row][col].id, "black");
                              break;
                    }
               }
          }
     }


     //function to update the boardData variable, which is modelled after the boardData.json file used by the server
     updateBoardDataFromHTML()
     {
          //loop through the entire html board
          for(var row = 0; row < this.gameboard.length; row++)
          {
               for(var col = 0; col < this.gameboard[0].length; col++)
               {
                    //get the src attribute of the image at [row][col]
                    var img_source = this.gameboard[row][col].querySelector(".piece").src;
                    if(img_source.indexOf("images") !== -1)
                    {
                         img_source = img_source.substring(img_source.indexOf("images"));
                    }
                    else
                    {
                         img_source = "";
                    }

                    
                    
                    //a switch block, because I don't know how to do it without redoing all the template stuff
                    var row_and_col = [row, col];

                    switch(row_and_col[0])
                    {
                         case 0:
                              switch(row_and_col[1])
                              {
                                   case 0:
                                        this.boardData.a8url = img_source;
                                        break;
                                   case 1:
                                        this.boardData.b8url = img_source;
                                        break;
                                   case 2:
                                        this.boardData.c8url = img_source;
                                        break;
                                   case 3:
                                        this.boardData.d8url = img_source;
                                        break;
                                   case 4:
                                        this.boardData.e8url = img_source;
                                        break;
                                   case 5:
                                        this.boardData.f8url = img_source;
                                        break;
                                   case 6:
                                        this.boardData.g8url = img_source;
                                        break;
                                   case 7:
                                        this.boardData.h8url = img_source;
                                        break;
                              }
                              break;
                         case 1:
                              switch(row_and_col[1])
                              {
                                   case 0:
                                        this.boardData.a7url = img_source;
                                        break;
                                   case 1:
                                        this.boardData.b7url = img_source;
                                        break;
                                   case 2:
                                        this.boardData.c7url = img_source;
                                        break;
                                   case 3:
                                        this.boardData.d7url = img_source;
                                        break;
                                   case 4:
                                        this.boardData.e7url = img_source;
                                        break;
                                   case 5:
                                        this.boardData.f7url = img_source;
                                        break;
                                   case 6:
                                        this.boardData.g7url = img_source;
                                        break;
                                   case 7:
                                        this.boardData.h7url = img_source;
                                        break;
                              }
                              break;
                         case 2:
                              switch(row_and_col[1])
                              {
                                   case 0:
                                        this.boardData.a6url = img_source;
                                        break;
                                   case 1:
                                        this.boardData.b6url = img_source;
                                        break;
                                   case 2:
                                        this.boardData.c6url = img_source;
                                        break;
                                   case 3:
                                        this.boardData.d6url = img_source;
                                        break;
                                   case 4:
                                        this.boardData.e6url = img_source;
                                        break;
                                   case 5:
                                        this.boardData.f6url = img_source;
                                        break;
                                   case 6:
                                        this.boardData.g6url = img_source;
                                        break;
                                   case 7:
                                        this.boardData.h6url = img_source;
                                        break;
                              }
                              break;
                         case 3:
                              switch(row_and_col[1])
                              {
                                   case 0:
                                        this.boardData.a5url = img_source;
                                        break;
                                   case 1:
                                        this.boardData.b5url = img_source;
                                        break;
                                   case 2:
                                        this.boardData.c5url = img_source;
                                        break;
                                   case 3:
                                        this.boardData.d5url = img_source;
                                        break;
                                   case 4:
                                        this.boardData.e5url = img_source;
                                        break;
                                   case 5:
                                        this.boardData.f5url = img_source;
                                        break;
                                   case 6:
                                        this.boardData.g5url = img_source;
                                        break;
                                   case 7:
                                        this.boardData.h5url = img_source;
                                        break;
                                   }
                                   break;
                         case 4:
                              switch(row_and_col[1])
                              {
                                   case 0:
                                        this.boardData.a4url = img_source;
                                        break;
                                   case 1:
                                        this.boardData.b4url = img_source;
                                        break;
                                   case 2:
                                        this.boardData.c4url = img_source;
                                        break;
                                   case 3:
                                        this.boardData.d4url = img_source;
                                        break;
                                   case 4:
                                        this.boardData.e4url = img_source;
                                        break;
                                   case 5:
                                        this.boardData.f4url = img_source;
                                        break;
                                   case 6:
                                        this.boardData.g4url = img_source;
                                        break;
                                   case 7:
                                        this.boardData.h4url = img_source;
                                        break;
                              }
                              break;
                         case 5:
                              switch(row_and_col[1])
                              {
                                   case 0:
                                        this.boardData.a3url = img_source;
                                        break;
                                   case 1:
                                        this.boardData.b3url = img_source;
                                        break;
                                   case 2:
                                        this.boardData.c3url = img_source;
                                        break;
                                   case 3:
                                        this.boardData.d3url = img_source;
                                        break;
                                   case 4:
                                        this.boardData.e3url = img_source;
                                        break;
                                   case 5:
                                        this.boardData.f3url = img_source;
                                        break;
                                   case 6:
                                        this.boardData.g3url = img_source;
                                        break;
                                   case 7:
                                        this.boardData.h3url = img_source;
                                        break;
                              }
                              break;
                         case 6:
                              switch(row_and_col[1])
                              {
                                   case 0:
                                        this.boardData.a2url = img_source;
                                        break;
                                   case 1:
                                        this.boardData.b2url = img_source;
                                        break;
                                   case 2:
                                        this.boardData.c2url = img_source;
                                        break;
                                   case 3:
                                        this.boardData.d2url = img_source;
                                        break;
                                   case 4:
                                        this.boardData.e2url = img_source;
                                        break;
                                   case 5:
                                        this.boardData.f2url = img_source;
                                        break;
                                   case 6:
                                        this.boardData.g2url = img_source;
                                        break;
                                   case 7:
                                        this.boardData.h2url = img_source;
                                        break;
                              }
                              break;
                         case 7:
                              switch(row_and_col[1])
                              {
                                   case 0:
                                        this.boardData.a1url = img_source;
                                        break;
                                   case 1:
                                        this.boardData.b1url = img_source;
                                        break;
                                   case 2:
                                        this.boardData.c1url = img_source;
                                        break;
                                   case 3:
                                        this.boardData.d1url = img_source;
                                        break;
                                   case 4:
                                        this.boardData.e1url = img_source;
                                        break;
                                   case 5:
                                        this.boardData.f1url = img_source;
                                        break;
                                   case 6:
                                        this.boardData.g1url = img_source;
                                        break;
                                   case 7:
                                        this.boardData.h1url = img_source;
                                        break;
                              }
                              break;
                    }
               }
          }
     }

     //function to update the html version the client can see, from boardData
     updateHTMLFromBoardData()
     {
          //loop through the entire html board
          for(var row = 0; row < this.gameboard.length; row++)
          {
               for(var col = 0; col < this.gameboard[0].length; col++)
               {
                    //a switch block, because I don't know how to do it without redoing all the template stuff
                    var row_and_col = [row, col];

                    switch(row_and_col[0])
                    {
                         case 0:
                              switch(row_and_col[1])
                              {
                                   case 0:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.a8url;
                                        break;
                                   case 1:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.b8url;
                                        break;
                                   case 2:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.c8url;
                                        break;
                                   case 3:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.d8url;
                                        break;
                                   case 4:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.e8url;
                                        break;
                                   case 5:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.f8url;
                                        break;
                                   case 6:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.g8url;
                                        break;
                                   case 7:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.h8url;
                                        break;
                              }
                              break;
                         case 1:
                              switch(row_and_col[1])
                              {
                                   case 0:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.a7url;
                                        break;
                                   case 1:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.b7url;
                                        break;
                                   case 2:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.c7url;
                                        break;
                                   case 3:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.d7url;
                                        break;
                                   case 4:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.e7url;
                                        break;
                                   case 5:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.f7url;
                                        break;
                                   case 6:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.g7url;
                                        break;
                                   case 7:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.h7url;
                                        break;
                              }
                              break;
                         case 2:
                              switch(row_and_col[1])
                              {
                                   case 0:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.a6url;
                                        break;
                                   case 1:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.b6url;
                                        break;
                                   case 2:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.c6url;
                                        break;
                                   case 3:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.d6url;
                                        break;
                                   case 4:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.e6url;
                                        break;
                                   case 5:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.f6url;
                                        break;
                                   case 6:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.g6url;
                                        break;
                                   case 7:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.h6url;
                                        break;
                              }
                              break;
                         case 3:
                              switch(row_and_col[1])
                              {
                                   case 0:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.a5url;
                                        break;
                                   case 1:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.b5url;
                                        break;
                                   case 2:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.c5url;
                                        break;
                                   case 3:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.d5url;
                                        break;
                                   case 4:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.e5url;
                                        break;
                                   case 5:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.f5url;
                                        break;
                                   case 6:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.g5url;
                                        break;
                                   case 7:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.h5url;
                                        break;
                              }
                              break;
                         case 4:
                              switch(row_and_col[1])
                              {
                                   case 0:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.a4url;
                                        break;
                                   case 1:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.b4url;
                                        break;
                                   case 2:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.c4url;
                                        break;
                                   case 3:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.d4url;
                                        break;
                                   case 4:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.e4url;
                                        break;
                                   case 5:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.f4url;
                                        break;
                                   case 6:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.g4url;
                                        break;
                                   case 7:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.h4url;
                                        break;
                              }
                              break;
                         case 5:
                              switch(row_and_col[1])
                              {
                                   case 0:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.a3url;
                                        break;
                                   case 1:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.b3url;
                                        break;
                                   case 2:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.c3url;
                                        break;
                                   case 3:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.d3url;
                                        break;
                                   case 4:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.e3url;
                                        break;
                                   case 5:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.f3url;
                                        break;
                                   case 6:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.g3url;
                                        break;
                                   case 7:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.h3url;
                                        break;
                              }
                              break;
                         case 6:
                              switch(row_and_col[1])
                              {
                                   case 0:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.a2url;
                                        break;
                                   case 1:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.b2url;
                                        break;
                                   case 2:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.c2url;
                                        break;
                                   case 3:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.d2url;
                                        break;
                                   case 4:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.e2url;
                                        break;
                                   case 5:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.f2url;
                                        break;
                                   case 6:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.g2url;
                                        break;
                                   case 7:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.h2url;
                                        break;
                              }
                              break;
                         case 7:
                              switch(row_and_col[1])
                              {
                                   case 0:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.a1url;
                                        break;
                                   case 1:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.b1url;
                                        break;
                                   case 2:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.c1url;
                                        break;
                                   case 3:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.d1url;
                                        break;
                                   case 4:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.e1url;
                                        break;
                                   case 5:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.f1url;
                                        break;
                                   case 6:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.g1url;
                                        break;
                                   case 7:
                                        this.gameboard[row][col].querySelector(".piece").src = this.boardData.h1url;
                                        break;
                              }
                              break;
                    }
               }
          }
     }
}

//create a Board object, called b
var b = new Board(chessBoard);

//the Piece class, which is the basis for all other pieces
class Piece
{
     //the constructor, mainly to set its properties
     constructor(board, squareID, color, isKing)
     {
          //assign the board label, which is the Board object it's on
          this.board = board;
          this.board.pieces.push(this);
          
          //assign the location variable, which will be a square of the Board object it's on
          this.location = board.boardInDOM.querySelector("#" + squareID);

          //assign the color variable, to know whether this is a black or white rook
          this.color = color;

          //keep track of whether this piece is clicked
          this.isSelected = false;

          //keep track of whether this piece is a king or not
          this.isKing = isKing;
     }

     //move the picture of the piece to the newLocation and update the this.location variable
     move(newSquareID)
     {
          //if there is a piece on the square being moved to, make sure to remove it from pieces array
          for(var i = 0; i < this.board.pieces.length; i++)
          {
               if(this.board.pieces[i].location === this.board.boardInDOM.querySelector("#" + newSquareID))
               {
                    this.board.pieces.splice(i, 1);   //remove one element from pieces, at index i
               }
          }

          //perform the actual move
          this.location.querySelector(".piece").src = "";
          this.location = this.board.boardInDOM.querySelector("#" + newSquareID);
          this.location.querySelector(".piece").src = this.url;
     }
}


//the Rook class, which represents a rook piece that can move like a rook
class Rook extends Piece
{
     constructor(board, squareID, color)
     {
          //call the Piece constructor (always the first step in child constructors)
          super(board, squareID, color, false);

          //assign the url variable, which points to the image that this rook is shown as
          this.url = "images/Rook_" + this.color[0] + ".png";

          //"put the piece on the board" by assigning the url of the image to the square it's on
          this.location.querySelector(".piece").src = this.url;
     }

     //display all valid moves that this piece can make (making steps in all of the four cardinal directions)
     displayValidMoves()
     {
          //move in the North direction until you hit the edge of the board or a piece
          var currentRow = constructCoordinates(this.location.id)[0];
          while(currentRow > 0)
          {
               //decrement currentRow to move up one square
               currentRow--;

               //check if this square has a piece on it, and stop the while loop if so
               var currentSquare = this.board.gameboard[currentRow][constructCoordinates(this.location.id)[1]];
               var pieceOnCurrentSquare = false;
               var oppositeColorPieceOnCurrentSquare = false;
               for(var i = 0; i < this.board.pieces.length; i++)
               {
                    if(this.board.pieces[i].location === currentSquare)
                    {
                         pieceOnCurrentSquare = true;
                         if(this.board.pieces[i].color !== this.color)
                         {
                              oppositeColorPieceOnCurrentSquare = true;
                         }
                    }
               }
               if(!oppositeColorPieceOnCurrentSquare && pieceOnCurrentSquare)
               {
                    break;
               }

               //add valid-move to currentSquare
               currentSquare.classList.add("valid-move");

               //bug fix for being able to capture piece of opposite color
               if(oppositeColorPieceOnCurrentSquare)
               {
                    break;
               }
          }

          //reset currentRow
          currentRow = constructCoordinates(this.location.id)[0];
          
          //move in the South direction until you hit the edge of the board or a piece
          while(currentRow < 7)
          {
               //increment currentRow to move down one square
               currentRow++;

               //check if this square has a piece on it, and stop the while loop if so
               var currentSquare = this.board.gameboard[currentRow][constructCoordinates(this.location.id)[1]];
               var pieceOnCurrentSquare = false;
               var oppositeColorPieceOnCurrentSquare = false;
               for(var i = 0; i < this.board.pieces.length; i++)
               {
                    if(this.board.pieces[i].location === currentSquare)
                    {
                         pieceOnCurrentSquare = true;
                         if(this.board.pieces[i].color !== this.color)
                         {
                              oppositeColorPieceOnCurrentSquare = true;
                         }
                    }
               }
               if(!oppositeColorPieceOnCurrentSquare && pieceOnCurrentSquare)
               {
                    break;
               }

               //add valid-move to currentSquare
               currentSquare.classList.add("valid-move");

               //bug fix for being able to capture piece of opposite color
               if(oppositeColorPieceOnCurrentSquare)
               {
                    break;
               }
          }

          //move in the West direction until you hit the edge of the board or a piece
          var currentCol = constructCoordinates(this.location.id)[1];
          while(currentCol > 0)
          {
               //decrement currentCol to move up one square
               currentCol--;

               //check if this square has a piece on it, and stop the while loop if so
               var currentSquare = this.board.gameboard[constructCoordinates(this.location.id)[0]][currentCol];
               var pieceOnCurrentSquare = false;
               var oppositeColorPieceOnCurrentSquare = false;
               for(var i = 0; i < this.board.pieces.length; i++)
               {
                    if(this.board.pieces[i].location === currentSquare)
                    {
                         pieceOnCurrentSquare = true;
                         if(this.board.pieces[i].color !== this.color)
                         {
                              oppositeColorPieceOnCurrentSquare = true;
                         }
                    }
               }
               if(!oppositeColorPieceOnCurrentSquare && pieceOnCurrentSquare)
               {
                    break;
               }

               //add valid-move to currentSquare
               currentSquare.classList.add("valid-move");

               //bug fix for being able to capture piece of opposite color
               if(oppositeColorPieceOnCurrentSquare)
               {
                    break;
               }
          }

          //reset currentCol
          currentCol = constructCoordinates(this.location.id)[1];

          //move in the East direction until you hit the edge of the board or a piece
          while(currentCol < 7)
          {
               //increment currentCol to move up one square
               currentCol++;

               //check if this square has a piece on it, and stop the while loop if so
               var currentSquare = this.board.gameboard[constructCoordinates(this.location.id)[0]][currentCol];
               var pieceOnCurrentSquare = false;
               var oppositeColorPieceOnCurrentSquare = false;
               for(var i = 0; i < this.board.pieces.length; i++)
               {
                    if(this.board.pieces[i].location === currentSquare)
                    {
                         pieceOnCurrentSquare = true;
                         if(this.board.pieces[i].color !== this.color)
                         {
                              oppositeColorPieceOnCurrentSquare = true;
                         }
                    }
               }
               if(!oppositeColorPieceOnCurrentSquare && pieceOnCurrentSquare)
               {
                    break;
               }

               //add valid-move to currentSquare
               currentSquare.classList.add("valid-move");

               //bug fix for being able to capture piece of opposite color
               if(oppositeColorPieceOnCurrentSquare)
               {
                    break;
               }
          }
     }
}


//the Bishop class
class Bishop extends Piece
{
     //the constructor
     constructor(board, squareID, color)
     {
          //call the Piece constructor (always the first step in child constructors)
          super(board, squareID, color, false);

          //assign the url variable, which points to the image that this bishop is shown as
          this.url = "images/Bishop_" + this.color[0] + ".png";

          //"put the piece on the board" by assigning the url of the image to the square it's on
          this.location.querySelector(".piece").src = this.url;
     }

     //show on the board all the possible moves this bishop can make
     displayValidMoves()
     {
          //move in the NorthEast direction until we reach the edge of the board or a piece
          var currentRow = constructCoordinates(this.location.id)[0];
          var currentCol = constructCoordinates(this.location.id)[1];
          while(currentRow > 0 && currentCol < 7)
          {
               //decrement currentRow and increment currentCol to move up and to the right
               currentRow--;
               currentCol++;

               //check if this square has a piece on it, and stop the while loop if so
               var currentSquare = this.board.gameboard[currentRow][currentCol];
               var pieceOnCurrentSquare = false;
               var oppositeColorPieceOnCurrentSquare = false;
               for(var i = 0; i < this.board.pieces.length; i++)
               {
                    if(this.board.pieces[i].location === currentSquare)
                    {
                         pieceOnCurrentSquare = true;
                         if(this.board.pieces[i].color !== this.color)
                         {
                              oppositeColorPieceOnCurrentSquare = true;
                         }
                    }
               }
               if(!oppositeColorPieceOnCurrentSquare && pieceOnCurrentSquare)
               {
                    break;
               }

               //add valid-move to currentSquare
               currentSquare.classList.add("valid-move");

               //bug fix for being able to capture piece of opposite color
               if(oppositeColorPieceOnCurrentSquare)
               {
                    break;
               }
          }

          //reset currentRow and currentCol
          var currentRow = constructCoordinates(this.location.id)[0];
          var currentCol = constructCoordinates(this.location.id)[1];

          //move in the NorthWest direction until we reach the edge of the board or a piece
          while(currentRow > 0 && currentCol > 0)
          {
               //decrement currentRow and currentCol to move up and to the left
               currentRow--;
               currentCol--;

               //check if this square has a piece on it, and stop the while loop if so
               var currentSquare = this.board.gameboard[currentRow][currentCol];
               var pieceOnCurrentSquare = false;
               var oppositeColorPieceOnCurrentSquare = false;
               for(var i = 0; i < this.board.pieces.length; i++)
               {
                    if(this.board.pieces[i].location === currentSquare)
                    {
                         pieceOnCurrentSquare = true;
                         if(this.board.pieces[i].color !== this.color)
                         {
                              oppositeColorPieceOnCurrentSquare = true;
                         }
                    }
               }
               if(!oppositeColorPieceOnCurrentSquare && pieceOnCurrentSquare)
               {
                    break;
               }

               //add valid-move to currentSquare
               currentSquare.classList.add("valid-move");

               //bug fix for being able to capture piece of opposite color
               if(oppositeColorPieceOnCurrentSquare)
               {
                    break;
               }
          }

          //reset currentRow and currentCol
          var currentRow = constructCoordinates(this.location.id)[0];
          var currentCol = constructCoordinates(this.location.id)[1];

          //move in the SouthWest direction until we reach the edge of the board or a piece
          while(currentRow < 7 && currentCol > 0)
          {
               //decrement currentRow and currentCol to move up and to the left
               currentRow++;
               currentCol--;

               //check if this square has a piece on it, and stop the while loop if so
               var currentSquare = this.board.gameboard[currentRow][currentCol];
               var pieceOnCurrentSquare = false;
               var oppositeColorPieceOnCurrentSquare = false;
               for(var i = 0; i < this.board.pieces.length; i++)
               {
                    if(this.board.pieces[i].location === currentSquare)
                    {
                         pieceOnCurrentSquare = true;
                         if(this.board.pieces[i].color !== this.color)
                         {
                              oppositeColorPieceOnCurrentSquare = true;
                         }
                    }
               }
               if(!oppositeColorPieceOnCurrentSquare && pieceOnCurrentSquare)
               {
                    break;
               }

               //add valid-move to currentSquare
               currentSquare.classList.add("valid-move");

               //bug fix for being able to capture piece of opposite color
               if(oppositeColorPieceOnCurrentSquare)
               {
                    break;
               }
          }

          //reset currentRow and currentCol
          var currentRow = constructCoordinates(this.location.id)[0];
          var currentCol = constructCoordinates(this.location.id)[1];

          //move in the SouthEast direction until we reach the edge of the board or a piece
          while(currentRow < 7 && currentCol < 7)
          {
               //increment currentRow and currentCol to move up and to the left
               currentRow++;
               currentCol++;

               //check if this square has a piece on it, and stop the while loop if so
               var currentSquare = this.board.gameboard[currentRow][currentCol];
               var pieceOnCurrentSquare = false;
               var oppositeColorPieceOnCurrentSquare = false;
               for(var i = 0; i < this.board.pieces.length; i++)
               {
                    if(this.board.pieces[i].location === currentSquare)
                    {
                         pieceOnCurrentSquare = true;
                         if(this.board.pieces[i].color !== this.color)
                         {
                              oppositeColorPieceOnCurrentSquare = true;
                         }
                    }
               }
               if(!oppositeColorPieceOnCurrentSquare && pieceOnCurrentSquare)
               {
                    break;
               }

               //add valid-move to currentSquare
               currentSquare.classList.add("valid-move");

               //bug fix for being able to capture piece of opposite color
               if(oppositeColorPieceOnCurrentSquare)
               {
                    break;
               }
          }
     }
}


//the Queen class, literally just a combination of Rook and Bishop
class Queen extends Piece
{
     //the constructor
     constructor(board, squareID, color)
     {
          //call the Piece constructor (always the first step in child constructors)
          super(board, squareID, color, false);

          //assign the url variable, which points to the image that this rook is shown as
          this.url = "images/Queen_" + this.color[0] + ".png";

          //"put the piece on the board" by assigning the url of the image to the square it's on
          this.location.querySelector(".piece").src = this.url;
     }

     //display all possible moves on the board for this queen
     displayValidMoves()
     {
          //move in the North direction until you hit the edge of the board or a piece
          var currentRow = constructCoordinates(this.location.id)[0];
          while(currentRow > 0)
          {
               //decrement currentRow to move up one square
               currentRow--;

               //check if this square has a piece on it, and stop the while loop if so
               var currentSquare = this.board.gameboard[currentRow][constructCoordinates(this.location.id)[1]];
               var pieceOnCurrentSquare = false;
               var oppositeColorPieceOnCurrentSquare = false;
               for(var i = 0; i < this.board.pieces.length; i++)
               {
                    if(this.board.pieces[i].location === currentSquare)
                    {
                         pieceOnCurrentSquare = true;
                         if(this.board.pieces[i].color !== this.color)
                         {
                              oppositeColorPieceOnCurrentSquare = true;
                         }
                    }
               }
               if(!oppositeColorPieceOnCurrentSquare && pieceOnCurrentSquare)
               {
                    break;
               }

               //add valid-move to currentSquare
               currentSquare.classList.add("valid-move");

               //bug fix for being able to capture piece of opposite color
               if(oppositeColorPieceOnCurrentSquare)
               {
                    break;
               }
          }

          //reset currentRow
          currentRow = constructCoordinates(this.location.id)[0];
          
          //move in the South direction until you hit the edge of the board or a piece
          while(currentRow < 7)
          {
               //increment currentRow to move down one square
               currentRow++;

               //check if this square has a piece on it, and stop the while loop if so
               var currentSquare = this.board.gameboard[currentRow][constructCoordinates(this.location.id)[1]];
               var pieceOnCurrentSquare = false;
               var oppositeColorPieceOnCurrentSquare = false;
               for(var i = 0; i < this.board.pieces.length; i++)
               {
                    if(this.board.pieces[i].location === currentSquare)
                    {
                         pieceOnCurrentSquare = true;
                         if(this.board.pieces[i].color !== this.color)
                         {
                              oppositeColorPieceOnCurrentSquare = true;
                         }
                    }
               }
               if(!oppositeColorPieceOnCurrentSquare && pieceOnCurrentSquare)
               {
                    break;
               }

               //add valid-move to currentSquare
               currentSquare.classList.add("valid-move");

               //bug fix for being able to capture piece of opposite color
               if(oppositeColorPieceOnCurrentSquare)
               {
                    break;
               }
          }

          //move in the West direction until you hit the edge of the board or a piece
          var currentCol = constructCoordinates(this.location.id)[1];
          while(currentCol > 0)
          {
               //decrement currentCol to move up one square
               currentCol--;

               //check if this square has a piece on it, and stop the while loop if so
               var currentSquare = this.board.gameboard[constructCoordinates(this.location.id)[0]][currentCol];
               var pieceOnCurrentSquare = false;
               var oppositeColorPieceOnCurrentSquare = false;
               for(var i = 0; i < this.board.pieces.length; i++)
               {
                    if(this.board.pieces[i].location === currentSquare)
                    {
                         pieceOnCurrentSquare = true;
                         if(this.board.pieces[i].color !== this.color)
                         {
                              oppositeColorPieceOnCurrentSquare = true;
                         }
                    }
               }
               if(!oppositeColorPieceOnCurrentSquare && pieceOnCurrentSquare)
               {
                    break;
               }

               //add valid-move to currentSquare
               currentSquare.classList.add("valid-move");

               //bug fix for being able to capture piece of opposite color
               if(oppositeColorPieceOnCurrentSquare)
               {
                    break;
               }
          }

          //reset currentCol
          currentCol = constructCoordinates(this.location.id)[1];

          //move in the East direction until you hit the edge of the board or a piece
          while(currentCol < 7)
          {
               //increment currentCol to move up one square
               currentCol++;

               //check if this square has a piece on it, and stop the while loop if so
               var currentSquare = this.board.gameboard[constructCoordinates(this.location.id)[0]][currentCol];
               var pieceOnCurrentSquare = false;
               var oppositeColorPieceOnCurrentSquare = false;
               for(var i = 0; i < this.board.pieces.length; i++)
               {
                    if(this.board.pieces[i].location === currentSquare)
                    {
                         pieceOnCurrentSquare = true;
                         if(this.board.pieces[i].color !== this.color)
                         {
                              oppositeColorPieceOnCurrentSquare = true;
                         }
                    }
               }
               if(!oppositeColorPieceOnCurrentSquare && pieceOnCurrentSquare)
               {
                    break;
               }

               //add valid-move to currentSquare
               currentSquare.classList.add("valid-move");

               //bug fix for being able to capture piece of opposite color
               if(oppositeColorPieceOnCurrentSquare)
               {
                    break;
               }
          }

          //move in the NorthEast direction until we reach the edge of the board or a piece
          var currentRow = constructCoordinates(this.location.id)[0];
          var currentCol = constructCoordinates(this.location.id)[1];
          while(currentRow > 0 && currentCol < 7)
          {
               //decrement currentRow and increment currentCol to move up and to the right
               currentRow--;
               currentCol++;

               //check if this square has a piece on it, and stop the while loop if so
               var currentSquare = this.board.gameboard[currentRow][currentCol];
               var pieceOnCurrentSquare = false;
               var oppositeColorPieceOnCurrentSquare = false;
               for(var i = 0; i < this.board.pieces.length; i++)
               {
                    if(this.board.pieces[i].location === currentSquare)
                    {
                         pieceOnCurrentSquare = true;
                         if(this.board.pieces[i].color !== this.color)
                         {
                              oppositeColorPieceOnCurrentSquare = true;
                         }
                    }
               }
               if(!oppositeColorPieceOnCurrentSquare && pieceOnCurrentSquare)
               {
                    break;
               }

               //add valid-move to currentSquare
               currentSquare.classList.add("valid-move");

               //bug fix for being able to capture piece of opposite color
               if(oppositeColorPieceOnCurrentSquare)
               {
                    break;
               }
          }

          //reset currentRow and currentCol
          var currentRow = constructCoordinates(this.location.id)[0];
          var currentCol = constructCoordinates(this.location.id)[1];

          //move in the NorthWest direction until we reach the edge of the board or a piece
          while(currentRow > 0 && currentCol > 0)
          {
               //decrement currentRow and currentCol to move up and to the left
               currentRow--;
               currentCol--;

               //check if this square has a piece on it, and stop the while loop if so
               var currentSquare = this.board.gameboard[currentRow][currentCol];
               var pieceOnCurrentSquare = false;
               var oppositeColorPieceOnCurrentSquare = false;
               for(var i = 0; i < this.board.pieces.length; i++)
               {
                    if(this.board.pieces[i].location === currentSquare)
                    {
                         pieceOnCurrentSquare = true;
                         if(this.board.pieces[i].color !== this.color)
                         {
                              oppositeColorPieceOnCurrentSquare = true;
                         }
                    }
               }
               if(!oppositeColorPieceOnCurrentSquare && pieceOnCurrentSquare)
               {
                    break;
               }

               //add valid-move to currentSquare
               currentSquare.classList.add("valid-move");

               //bug fix for being able to capture piece of opposite color
               if(oppositeColorPieceOnCurrentSquare)
               {
                    break;
               }
          }

          //reset currentRow and currentCol
          var currentRow = constructCoordinates(this.location.id)[0];
          var currentCol = constructCoordinates(this.location.id)[1];

          //move in the SouthWest direction until we reach the edge of the board or a piece
          while(currentRow < 7 && currentCol > 0)
          {
               //decrement currentRow and currentCol to move up and to the left
               currentRow++;
               currentCol--;

               //check if this square has a piece on it, and stop the while loop if so
               var currentSquare = this.board.gameboard[currentRow][currentCol];
               var pieceOnCurrentSquare = false;
               var oppositeColorPieceOnCurrentSquare = false;
               for(var i = 0; i < this.board.pieces.length; i++)
               {
                    if(this.board.pieces[i].location === currentSquare)
                    {
                         pieceOnCurrentSquare = true;
                         if(this.board.pieces[i].color !== this.color)
                         {
                              oppositeColorPieceOnCurrentSquare = true;
                         }
                    }
               }
               if(!oppositeColorPieceOnCurrentSquare && pieceOnCurrentSquare)
               {
                    break;
               }

               //add valid-move to currentSquare
               currentSquare.classList.add("valid-move");

               //bug fix for being able to capture piece of opposite color
               if(oppositeColorPieceOnCurrentSquare)
               {
                    break;
               }
          }

          //reset currentRow and currentCol
          var currentRow = constructCoordinates(this.location.id)[0];
          var currentCol = constructCoordinates(this.location.id)[1];

          //move in the SouthEast direction until we reach the edge of the board or a piece
          while(currentRow < 7 && currentCol < 7)
          {
               //increment currentRow and currentCol to move up and to the left
               currentRow++;
               currentCol++;

               //check if this square has a piece on it, and stop the while loop if so
               var currentSquare = this.board.gameboard[currentRow][currentCol];
               var pieceOnCurrentSquare = false;
               var oppositeColorPieceOnCurrentSquare = false;
               for(var i = 0; i < this.board.pieces.length; i++)
               {
                    if(this.board.pieces[i].location === currentSquare)
                    {
                         pieceOnCurrentSquare = true;
                         if(this.board.pieces[i].color !== this.color)
                         {
                              oppositeColorPieceOnCurrentSquare = true;
                         }
                    }
               }
               if(!oppositeColorPieceOnCurrentSquare && pieceOnCurrentSquare)
               {
                    break;
               }

               //add valid-move to currentSquare
               currentSquare.classList.add("valid-move");

               //bug fix for being able to capture piece of opposite color
               if(oppositeColorPieceOnCurrentSquare)
               {
                    break;
               }
          }
     }
}


//the Pawn class
class Pawn extends Piece
{
     constructor(board, squareID, color)
     {
          //call the Piece constructor, always the first step
          super(board, squareID, color, false);

          //assign the url variable, which points to the image that this rook is shown as
          this.url = "images/Pawn_" + this.color[0] + ".png";

          //"put the piece on the board" by assigning the url of the image to the square it's on
          this.location.querySelector(".piece").src = this.url;
     }

     //function to display the valid moves of this piece on the board
     displayValidMoves()
     {
          //determine whether this pawn will move up or move down, based on its color
          var movingUp = (this.color === "white");

          //leave this function without doing anything if we're right at the end of the board and can't move
          if(movingUp && constructCoordinates(this.location.id)[0] === 0) return;
          if(!movingUp && constructCoordinates(this.location.id)[0] === 7) return;

          //if this pawn is moving up
          if(movingUp)
          {
               //check if the square above contains a piece
               var pieceUpOne = false;
               var pieceUpTwo = false;
               var upOneCoordinates = [constructCoordinates(this.location.id)[0] - 1, constructCoordinates(this.location.id)[1]];
               var upTwoCoordinates = [constructCoordinates(this.location.id)[0] - 2, constructCoordinates(this.location.id)[1]];
               for(var i = 0; i < this.board.pieces.length; i++)
               {
                    //if any piece is in the upOne square
                    var currPieceCoordinates = constructCoordinates(this.board.pieces[i].location.id);
                    var currPieceUpOne = (currPieceCoordinates[0] === upOneCoordinates[0] && currPieceCoordinates[1] === upOneCoordinates[1]);
                    if(currPieceUpOne)
                    {
                         pieceUpOne = true;
                    }

                    //if any piece is in the twoUp square
                    var currPieceUpTwo = (currPieceCoordinates[0] === upTwoCoordinates[0] && currPieceCoordinates[1] === upTwoCoordinates[1]);
                    if(currPieceUpTwo)
                    {
                         pieceUpTwo = true;
                    }
               }

               //signify the square(s) above the piece as valid moves, if it doesn't contain a piece
               var oneSquareUp = this.board.gameboard[upOneCoordinates[0]][upOneCoordinates[1]];
               if(!pieceUpOne)    //if there's not a piece in the way
               {
                    oneSquareUp.classList.add("valid-move");
                    if(!pieceUpTwo && constructCoordinates(this.location.id)[0] === 6)   //if we're on the correct row, we can move up two instead of just 1
                    {
                         var twoSquaresUp = this.board.gameboard[upTwoCoordinates[0]][upTwoCoordinates[1]];
                         twoSquaresUp.classList.add("valid-move");
                    }
               }
               

               //check the up-left square to see if it contains a piece of the opposite color
               var upLeftCoordinates = [constructCoordinates(this.location.id)[0] - 1, constructCoordinates(this.location.id)[1] - 1];
               for(var i = 0; i < this.board.pieces.length; i++)
               {
                    //search through the this.board.pieces array to find a piece up to the left
                    var currPieceCoordinates = constructCoordinates(this.board.pieces[i].location.id);
                    var currPieceUpLeft = (currPieceCoordinates[0] === upLeftCoordinates[0] && currPieceCoordinates[1] === upLeftCoordinates[1]);
                    if(this.color !== this.board.pieces[i].color && currPieceUpLeft)
                    {
                         //we have found an opposite colored piece up and to the left, so mark that as a valid move
                         var upLeftSquare = this.board.gameboard[currPieceCoordinates[0]][currPieceCoordinates[1]];
                         upLeftSquare.classList.add("valid-move");
                         break;
                    }
               }

               //check the up-right square to see if it contains a piece of the opposite color
               var upRightCoodinates = [constructCoordinates(this.location.id)[0] - 1, constructCoordinates(this.location.id)[1] + 1];
               for(var i = 0; i < this.board.pieces.length; i++)
               {
                    //search through the this.board.pieces array to find a piece up to the left
                    var currPieceCoordinates = constructCoordinates(this.board.pieces[i].location.id);
                    var currPieceUpRight = (currPieceCoordinates[0] === upRightCoodinates[0] && currPieceCoordinates[1] === upRightCoodinates[1]);
                    if(this.color !== this.board.pieces[i].color && currPieceUpRight)
                    {
                         //we have found an opposite colored piece up and to the left, so mark that as a valid move
                         var upRightSquare = this.board.gameboard[currPieceCoordinates[0]][currPieceCoordinates[1]];
                         upRightSquare.classList.add("valid-move");
                         break;
                    }
               }
               return;
          }

          //if this pawn is moving down
          if(!movingUp)
          {
               //check if the squares below contains a piece
               var pieceDownOne = false;
               var pieceDownTwo = false;
               var downOneCoordinates = [constructCoordinates(this.location.id)[0] + 1, constructCoordinates(this.location.id)[1]];
               var downTwoCoordinates = [constructCoordinates(this.location.id)[0] + 2, constructCoordinates(this.location.id)[1]];
               for(var i = 0; i < this.board.pieces.length; i++)
               {
                    //if any piece is in the downOne square
                    var currPieceCoordinates = constructCoordinates(this.board.pieces[i].location.id);
                    var currPieceDownOne = (currPieceCoordinates[0] === downOneCoordinates[0] && currPieceCoordinates[1] === downOneCoordinates[1]);
                    if(currPieceDownOne)
                    {
                         pieceDownOne = true;
                    }

                    //if any piece is in the downTwo square
                    var currPieceDownTwo = (currPieceCoordinates[0] === downTwoCoordinates[0] && currPieceCoordinates[1] === downTwoCoordinates[1]);
                    if(currPieceDownTwo)
                    {
                         pieceDownTwo = true;
                    }
               }

               //signify the square(s) below the piece as valid moves, if it doesn't contain a piece
               var oneSquareDown = this.board.gameboard[downOneCoordinates[0]][downOneCoordinates[1]];
               if(!pieceDownOne)    //if there's not a piece in the way
               {
                    oneSquareDown.classList.add("valid-move");
                    if(!pieceDownTwo && constructCoordinates(this.location.id)[0] === 1)   //if we're on the correct row, we can move down two instead of just one
                    {
                         var twoSquaresDown = this.board.gameboard[downTwoCoordinates[0]][downTwoCoordinates[1]];
                         twoSquaresDown.classList.add("valid-move");
                    }
               }
               

               //check the down-left square to see if it contains a piece of the opposite color
               var downLeftCoordinates = [constructCoordinates(this.location.id)[0] + 1, constructCoordinates(this.location.id)[1] - 1];
               for(var i = 0; i < this.board.pieces.length; i++)
               {
                    //search through the this.board.pieces array to find a piece down to the left
                    var currPieceCoordinates = constructCoordinates(this.board.pieces[i].location.id);
                    var currPieceDownLeft = (currPieceCoordinates[0] === downLeftCoordinates[0] && currPieceCoordinates[1] === downLeftCoordinates[1]);
                    if(this.color !== this.board.pieces[i].color && currPieceDownLeft)
                    {
                         //we have found an opposite colored piece down and to the left, so mark that as a valid move
                         var downLeftSquare = this.board.gameboard[currPieceCoordinates[0]][currPieceCoordinates[1]];
                         downLeftSquare.classList.add("valid-move");
                         break;
                    }
               }

               //check the down-right square to see if it contains a piece of the opposite color
               var downRightCoodinates = [constructCoordinates(this.location.id)[0] + 1, constructCoordinates(this.location.id)[1] + 1];
               for(var i = 0; i < this.board.pieces.length; i++)
               {
                    //search through the this.board.pieces array to find a piece down to the right
                    var currPieceCoordinates = constructCoordinates(this.board.pieces[i].location.id);
                    var currPieceDownRight = (currPieceCoordinates[0] === downRightCoodinates[0] && currPieceCoordinates[1] === downRightCoodinates[1]);
                    if(this.color !== this.board.pieces[i].color && currPieceDownRight)
                    {
                         //we have found an opposite colored piece down to the right, so mark that as a valid move
                         var downRightSquare = this.board.gameboard[currPieceCoordinates[0]][currPieceCoordinates[1]];
                         downRightSquare.classList.add("valid-move");
                         break;
                    }
               }
               return;
          }
     }

     //overload the move function, since we need to check if the newSquare is at the opposite end of the board
     //in which case, it becomes a queen for the same team
     move(newSquareID)
     {
          //if there is a piece on the square being moved to, make sure to remove it from pieces array
          for(var i = 0; i < this.board.pieces.length; i++)
          {
               if(this.board.pieces[i].location === this.board.boardInDOM.querySelector("#" + newSquareID))
               {
                    this.board.pieces.splice(i, 1);   //remove one element from pieces, at index i
               }
          }

          //perform the actual move
          this.location.querySelector(".piece").src = "";
          this.location = this.board.boardInDOM.querySelector("#" + newSquareID);
          this.location.querySelector(".piece").src = this.url;

          //check if the new location is at the opposite end of the board (different for each color)
          var oppositeIsTop = (this.color === "white");
          var oppositeIsBottom = (this.color === "black");

          //perform specific check for pieces which have the top as the opposite side of the board
          if(oppositeIsTop)
          {
               //if this piece's location is at the top row
               if(constructCoordinates(this.location.id)[0] === 0)
               {
                    //swap it with a queen, of the same color
                    for(var i = 0; i < this.board.pieces.length; i++)
                    {
                         if(this.board.pieces[i].location === this.location)
                         {
                              this.board.pieces.splice(i, 1);   //remove this pawn from pieces, at index i
                         }
                    }
                    var newQueen = new Queen(this.board, this.location.id, this.color);
               }
               return;
          }

          //perform specific check for pieces which have the bottom as the opposite side of the board
          if(oppositeIsBottom)
          {
               //if this piece's location is at the bottom row
               if(constructCoordinates(this.location.id)[0] === 7)
               {
                    //swap it with a queen, of the same color
                    for(var i = 0; i < this.board.pieces.length; i++)
                    {
                         if(this.board.pieces[i].location === this.location)
                         {
                              this.board.pieces.splice(i, 1);   //remove this pawn from pieces, at index i
                         }
                    }
                    var newQueen = new Queen(this.board, this.location.id, this.color);
               }
               return;
          }
     }
}


//the Knight class
class Knight extends Piece
{
     constructor(board, squareID, color)
     {
          //call the Piece constructor, always the first step
          super(board, squareID, color, false);

          //assign the url variable, which points to the image that this rook is shown as
          this.url = "images/Knight_" + this.color[0] + ".png";

          //"put the piece on the board" by assigning the url of the image to the square it's on
          this.location.querySelector(".piece").src = this.url;
     }

     //display all the possible moves a knight can make
     //this function starts at the positive x-axis and moves around like the unit circle
     //I will comment each section by their positions on the unit circle, for readability
     //they will be pi/6, pi/3, 2pi/3, 5pi/6, 7pi/6, 4pi/3, 5pi/3, and 11pi/6
     displayValidMoves()
     {
          /*

               pi/6

          */
          var currCoordinates = [constructCoordinates(this.location.id)[0] - 1, constructCoordinates(this.location.id)[1] + 2];

          //check if those coordinates are off the board
          var currCoordinatesOffBoard = (currCoordinates[0] < 0 || currCoordinates[0] > 7 || currCoordinates[1] < 0 || currCoordinates[1] > 7);
          
          //check if there's a friendly piece on those coordinates
          var currCoordinatesHasFriendlyPiece = false;
          for(var i = 0; i < this.board.pieces.length; i++)
          {
               var currPieceCoordinates = constructCoordinates(this.board.pieces[i].location.id);
               var currPieceOnCurrCoordinates = (currPieceCoordinates[0] === currCoordinates[0] && currPieceCoordinates[1] === currCoordinates[1]);
               if(this.color === this.board.pieces[i].color && currPieceOnCurrCoordinates)
               {
                    currCoordinatesHasFriendlyPiece = true;
                    break;
               }
          }

          //if there's not a friendly piece on it and it's not off the board, mark that square as valid
          if(!currCoordinatesOffBoard && !currCoordinatesHasFriendlyPiece)
          {
               var currSquare = this.board.gameboard[currCoordinates[0]][currCoordinates[1]];
               currSquare.classList.add("valid-move");
          }


          /*

               pi/3

          */
          var currCoordinates = [constructCoordinates(this.location.id)[0] - 2, constructCoordinates(this.location.id)[1] + 1];

          //check if those coordinates are off the board
          var currCoordinatesOffBoard = (currCoordinates[0] < 0 || currCoordinates[0] > 7 || currCoordinates[1] < 0 || currCoordinates[1] > 7);

          //check if there's a friendly piece on those coordinates
          var currCoordinatesHasFriendlyPiece = false;
          for(var i = 0; i < this.board.pieces.length; i++)
          {
               var currPieceCoordinates = constructCoordinates(this.board.pieces[i].location.id);
               var currPieceOnCurrCoordinates = (currPieceCoordinates[0] === currCoordinates[0] && currPieceCoordinates[1] === currCoordinates[1]);
               if(this.color === this.board.pieces[i].color && currPieceOnCurrCoordinates)
               {
                    currCoordinatesHasFriendlyPiece = true;
                    break;
               }
          }

          //if there's not a friendly piece on it and it's not off the board, mark that square as valid
          if(!currCoordinatesOffBoard && !currCoordinatesHasFriendlyPiece)
          {
               var currSquare = this.board.gameboard[currCoordinates[0]][currCoordinates[1]];
               currSquare.classList.add("valid-move");
          }


          /*

               2pi/3

          */
          var currCoordinates = [constructCoordinates(this.location.id)[0] - 2, constructCoordinates(this.location.id)[1] - 1];

          //check if those coordinates are off the board
          var currCoordinatesOffBoard = (currCoordinates[0] < 0 || currCoordinates[0] > 7 || currCoordinates[1] < 0 || currCoordinates[1] > 7);
     
          //check if there's a friendly piece on those coordinates
          var currCoordinatesHasFriendlyPiece = false;
          for(var i = 0; i < this.board.pieces.length; i++)
          {
               var currPieceCoordinates = constructCoordinates(this.board.pieces[i].location.id);
               var currPieceOnCurrCoordinates = (currPieceCoordinates[0] === currCoordinates[0] && currPieceCoordinates[1] === currCoordinates[1]);
               if(this.color === this.board.pieces[i].color && currPieceOnCurrCoordinates)
               {
                    currCoordinatesHasFriendlyPiece = true;
                    break;
               }
          }
     
          //if there's not a friendly piece on it and it's not off the board, mark that square as valid
          if(!currCoordinatesOffBoard && !currCoordinatesHasFriendlyPiece)
          {
               var currSquare = this.board.gameboard[currCoordinates[0]][currCoordinates[1]];
               currSquare.classList.add("valid-move");
          }


          /*

               5pi/6

          */
          var currCoordinates = [constructCoordinates(this.location.id)[0] - 1, constructCoordinates(this.location.id)[1] - 2];

          //check if those coordinates are off the board
          var currCoordinatesOffBoard = (currCoordinates[0] < 0 || currCoordinates[0] > 7 || currCoordinates[1] < 0 || currCoordinates[1] > 7);
          
          //check if there's a friendly piece on those coordinates
          var currCoordinatesHasFriendlyPiece = false;
          for(var i = 0; i < this.board.pieces.length; i++)
          {
               var currPieceCoordinates = constructCoordinates(this.board.pieces[i].location.id);
               var currPieceOnCurrCoordinates = (currPieceCoordinates[0] === currCoordinates[0] && currPieceCoordinates[1] === currCoordinates[1]);
               if(this.color === this.board.pieces[i].color && currPieceOnCurrCoordinates)
               {
                    currCoordinatesHasFriendlyPiece = true;
                    break;
               }
          }
          
          //if there's not a friendly piece on it and it's not off the board, mark that square as valid
          if(!currCoordinatesOffBoard && !currCoordinatesHasFriendlyPiece)
          {
               var currSquare = this.board.gameboard[currCoordinates[0]][currCoordinates[1]];
               currSquare.classList.add("valid-move");
          }


          /*

               7pi/6

          */
          var currCoordinates = [constructCoordinates(this.location.id)[0] + 1, constructCoordinates(this.location.id)[1] - 2];

          //check if those coordinates are off the board
          var currCoordinatesOffBoard = (currCoordinates[0] < 0 || currCoordinates[0] > 7 || currCoordinates[1] < 0 || currCoordinates[1] > 7);
               
          //check if there's a friendly piece on those coordinates
          var currCoordinatesHasFriendlyPiece = false;
          for(var i = 0; i < this.board.pieces.length; i++)
          {
               var currPieceCoordinates = constructCoordinates(this.board.pieces[i].location.id);
               var currPieceOnCurrCoordinates = (currPieceCoordinates[0] === currCoordinates[0] && currPieceCoordinates[1] === currCoordinates[1]);
               if(this.color === this.board.pieces[i].color && currPieceOnCurrCoordinates)
               {
                    currCoordinatesHasFriendlyPiece = true;
                    break;
               }
          }
               
          //if there's not a friendly piece on it and it's not off the board, mark that square as valid
          if(!currCoordinatesOffBoard && !currCoordinatesHasFriendlyPiece)
          {
               var currSquare = this.board.gameboard[currCoordinates[0]][currCoordinates[1]];
               currSquare.classList.add("valid-move");
          }


          /*

               4pi/3

          */
          var currCoordinates = [constructCoordinates(this.location.id)[0] + 2, constructCoordinates(this.location.id)[1] - 1];

          //check if those coordinates are off the board
          var currCoordinatesOffBoard = (currCoordinates[0] < 0 || currCoordinates[0] > 7 || currCoordinates[1] < 0 || currCoordinates[1] > 7);
                    
          //check if there's a friendly piece on those coordinates
          var currCoordinatesHasFriendlyPiece = false;
          for(var i = 0; i < this.board.pieces.length; i++)
          {
               var currPieceCoordinates = constructCoordinates(this.board.pieces[i].location.id);
               var currPieceOnCurrCoordinates = (currPieceCoordinates[0] === currCoordinates[0] && currPieceCoordinates[1] === currCoordinates[1]);
               if(this.color === this.board.pieces[i].color && currPieceOnCurrCoordinates)
               {
                    currCoordinatesHasFriendlyPiece = true;
                    break;
               }
          }
                    
          //if there's not a friendly piece on it and it's not off the board, mark that square as valid
          if(!currCoordinatesOffBoard && !currCoordinatesHasFriendlyPiece)
          {
               var currSquare = this.board.gameboard[currCoordinates[0]][currCoordinates[1]];
               currSquare.classList.add("valid-move");
          }


          /*

               5pi/3

          */
          var currCoordinates = [constructCoordinates(this.location.id)[0] + 2, constructCoordinates(this.location.id)[1] + 1];

          //check if those coordinates are off the board
          var currCoordinatesOffBoard = (currCoordinates[0] < 0 || currCoordinates[0] > 7 || currCoordinates[1] < 0 || currCoordinates[1] > 7);
                         
          //check if there's a friendly piece on those coordinates
          var currCoordinatesHasFriendlyPiece = false;
          for(var i = 0; i < this.board.pieces.length; i++)
          {
               var currPieceCoordinates = constructCoordinates(this.board.pieces[i].location.id);
               var currPieceOnCurrCoordinates = (currPieceCoordinates[0] === currCoordinates[0] && currPieceCoordinates[1] === currCoordinates[1]);
               if(this.color === this.board.pieces[i].color && currPieceOnCurrCoordinates)
               {
                    currCoordinatesHasFriendlyPiece = true;
                    break;
               }
          }
                         
          //if there's not a friendly piece on it and it's not off the board, mark that square as valid
          if(!currCoordinatesOffBoard && !currCoordinatesHasFriendlyPiece)
          {
               var currSquare = this.board.gameboard[currCoordinates[0]][currCoordinates[1]];
               currSquare.classList.add("valid-move");
          }


          /*

               11pi/6

          */
          var currCoordinates = [constructCoordinates(this.location.id)[0] + 1, constructCoordinates(this.location.id)[1] + 2];

          //check if those coordinates are off the board
          var currCoordinatesOffBoard = (currCoordinates[0] < 0 || currCoordinates[0] > 7 || currCoordinates[1] < 0 || currCoordinates[1] > 7);
                              
          //check if there's a friendly piece on those coordinates
          var currCoordinatesHasFriendlyPiece = false;
          for(var i = 0; i < this.board.pieces.length; i++)
          {
               var currPieceCoordinates = constructCoordinates(this.board.pieces[i].location.id);
               var currPieceOnCurrCoordinates = (currPieceCoordinates[0] === currCoordinates[0] && currPieceCoordinates[1] === currCoordinates[1]);
               if(this.color === this.board.pieces[i].color && currPieceOnCurrCoordinates)
               {
                    currCoordinatesHasFriendlyPiece = true;
                    break;
               }
          }
                              
          //if there's not a friendly piece on it and it's not off the board, mark that square as valid
          if(!currCoordinatesOffBoard && !currCoordinatesHasFriendlyPiece)
          {
               var currSquare = this.board.gameboard[currCoordinates[0]][currCoordinates[1]];
               currSquare.classList.add("valid-move");
          }
     }
}


//the King class
class King extends Piece
{
     constructor(board, squareID, color)
     {
          //call the Piece constructor, always the first step
          super(board, squareID, color, true);

          //assign the url variable, which points to the image that this rook is shown as
          this.url = "images/King_" + this.color[0] + ".png";

          //"put the piece on the board" by assigning the url of the image to the square it's on
          this.location.querySelector(".piece").src = this.url;
     }

     //display all the possible moves a king can make
     //this function starts at the positive x-axis and moves around like the unit circle
     //I will comment each section by their positions on the unit circle, for readability
     //they will be 0pi, pi/4, pi/2, 3pi/4, pi, 5pi/4, 3pi/2, and 7pi/4
     displayValidMoves()
     {
          /*

               0pi

          */
          var currCoordinates = [constructCoordinates(this.location.id)[0], constructCoordinates(this.location.id)[1] + 1];

          //check if those coordinates are off the board
          var currCoordinatesOffBoard = (currCoordinates[0] < 0 || currCoordinates[0] > 7 || currCoordinates[1] < 0 || currCoordinates[1] > 7);
               
          //check if there's a friendly piece on those coordinates
          var currCoordinatesHasFriendlyPiece = false;
          for(var i = 0; i < this.board.pieces.length; i++)
          {
               var currPieceCoordinates = constructCoordinates(this.board.pieces[i].location.id);
               var currPieceOnCurrCoordinates = (currPieceCoordinates[0] === currCoordinates[0] && currPieceCoordinates[1] === currCoordinates[1]);
               if(this.color === this.board.pieces[i].color && currPieceOnCurrCoordinates)
               {
                    currCoordinatesHasFriendlyPiece = true;
                    break;
               }
          }
     
          //if there's not a friendly piece on it and it's not off the board, mark that square as valid
          if(!currCoordinatesOffBoard && !currCoordinatesHasFriendlyPiece)
          {
               var currSquare = this.board.gameboard[currCoordinates[0]][currCoordinates[1]];
               currSquare.classList.add("valid-move");
          }


          /*

               pi/4

          */
          var currCoordinates = [constructCoordinates(this.location.id)[0] - 1, constructCoordinates(this.location.id)[1] + 1];

          //check if those coordinates are off the board
          var currCoordinatesOffBoard = (currCoordinates[0] < 0 || currCoordinates[0] > 7 || currCoordinates[1] < 0 || currCoordinates[1] > 7);
                    
          //check if there's a friendly piece on those coordinates
          var currCoordinatesHasFriendlyPiece = false;
          for(var i = 0; i < this.board.pieces.length; i++)
          {
               var currPieceCoordinates = constructCoordinates(this.board.pieces[i].location.id);
               var currPieceOnCurrCoordinates = (currPieceCoordinates[0] === currCoordinates[0] && currPieceCoordinates[1] === currCoordinates[1]);
               if(this.color === this.board.pieces[i].color && currPieceOnCurrCoordinates)
               {
                    currCoordinatesHasFriendlyPiece = true;
                    break;
               }
          }
          
          //if there's not a friendly piece on it and it's not off the board, mark that square as valid
          if(!currCoordinatesOffBoard && !currCoordinatesHasFriendlyPiece)
          {
               var currSquare = this.board.gameboard[currCoordinates[0]][currCoordinates[1]];
               currSquare.classList.add("valid-move");
          }


          /*

               pi/2

          */
          var currCoordinates = [constructCoordinates(this.location.id)[0] - 1, constructCoordinates(this.location.id)[1]];

          //check if those coordinates are off the board
          var currCoordinatesOffBoard = (currCoordinates[0] < 0 || currCoordinates[0] > 7 || currCoordinates[1] < 0 || currCoordinates[1] > 7);
                         
          //check if there's a friendly piece on those coordinates
          var currCoordinatesHasFriendlyPiece = false;
          for(var i = 0; i < this.board.pieces.length; i++)
          {
               var currPieceCoordinates = constructCoordinates(this.board.pieces[i].location.id);
               var currPieceOnCurrCoordinates = (currPieceCoordinates[0] === currCoordinates[0] && currPieceCoordinates[1] === currCoordinates[1]);
               if(this.color === this.board.pieces[i].color && currPieceOnCurrCoordinates)
               {
                    currCoordinatesHasFriendlyPiece = true;
                    break;
               }
          }
               
          //if there's not a friendly piece on it and it's not off the board, mark that square as valid
          if(!currCoordinatesOffBoard && !currCoordinatesHasFriendlyPiece)
          {
               var currSquare = this.board.gameboard[currCoordinates[0]][currCoordinates[1]];
               currSquare.classList.add("valid-move");
          }


          /*

               3pi/4

          */
          var currCoordinates = [constructCoordinates(this.location.id)[0] - 1, constructCoordinates(this.location.id)[1] - 1];

          //check if those coordinates are off the board
          var currCoordinatesOffBoard = (currCoordinates[0] < 0 || currCoordinates[0] > 7 || currCoordinates[1] < 0 || currCoordinates[1] > 7);
                              
          //check if there's a friendly piece on those coordinates
          var currCoordinatesHasFriendlyPiece = false;
          for(var i = 0; i < this.board.pieces.length; i++)
          {
               var currPieceCoordinates = constructCoordinates(this.board.pieces[i].location.id);
               var currPieceOnCurrCoordinates = (currPieceCoordinates[0] === currCoordinates[0] && currPieceCoordinates[1] === currCoordinates[1]);
               if(this.color === this.board.pieces[i].color && currPieceOnCurrCoordinates)
               {
                    currCoordinatesHasFriendlyPiece = true;
                    break;
               }
          }
                    
          //if there's not a friendly piece on it and it's not off the board, mark that square as valid
          if(!currCoordinatesOffBoard && !currCoordinatesHasFriendlyPiece)
          {
               var currSquare = this.board.gameboard[currCoordinates[0]][currCoordinates[1]];
               currSquare.classList.add("valid-move");
          }


          /*

               pi

          */
          var currCoordinates = [constructCoordinates(this.location.id)[0], constructCoordinates(this.location.id)[1] - 1];

          //check if those coordinates are off the board
          var currCoordinatesOffBoard = (currCoordinates[0] < 0 || currCoordinates[0] > 7 || currCoordinates[1] < 0 || currCoordinates[1] > 7);
                                   
          //check if there's a friendly piece on those coordinates
          var currCoordinatesHasFriendlyPiece = false;
          for(var i = 0; i < this.board.pieces.length; i++)
          {
               var currPieceCoordinates = constructCoordinates(this.board.pieces[i].location.id);
               var currPieceOnCurrCoordinates = (currPieceCoordinates[0] === currCoordinates[0] && currPieceCoordinates[1] === currCoordinates[1]);
               if(this.color === this.board.pieces[i].color && currPieceOnCurrCoordinates)
               {
                    currCoordinatesHasFriendlyPiece = true;
                    break;
               }
          }
                         
          //if there's not a friendly piece on it and it's not off the board, mark that square as valid
          if(!currCoordinatesOffBoard && !currCoordinatesHasFriendlyPiece)
          {
               var currSquare = this.board.gameboard[currCoordinates[0]][currCoordinates[1]];
               currSquare.classList.add("valid-move");
          }


          /*

               5pi/4

          */
          var currCoordinates = [constructCoordinates(this.location.id)[0] + 1, constructCoordinates(this.location.id)[1] - 1];

          //check if those coordinates are off the board
          var currCoordinatesOffBoard = (currCoordinates[0] < 0 || currCoordinates[0] > 7 || currCoordinates[1] < 0 || currCoordinates[1] > 7);
                                        
          //check if there's a friendly piece on those coordinates
          var currCoordinatesHasFriendlyPiece = false;
          for(var i = 0; i < this.board.pieces.length; i++)
          {
               var currPieceCoordinates = constructCoordinates(this.board.pieces[i].location.id);
               var currPieceOnCurrCoordinates = (currPieceCoordinates[0] === currCoordinates[0] && currPieceCoordinates[1] === currCoordinates[1]);
               if(this.color === this.board.pieces[i].color && currPieceOnCurrCoordinates)
               {
                    currCoordinatesHasFriendlyPiece = true;
                    break;
               }
          }
                              
          //if there's not a friendly piece on it and it's not off the board, mark that square as valid
          if(!currCoordinatesOffBoard && !currCoordinatesHasFriendlyPiece)
          {
               var currSquare = this.board.gameboard[currCoordinates[0]][currCoordinates[1]];
               currSquare.classList.add("valid-move");
          }


          /*

               3pi/2

          */
          var currCoordinates = [constructCoordinates(this.location.id)[0] + 1, constructCoordinates(this.location.id)[1]];

          //check if those coordinates are off the board
          var currCoordinatesOffBoard = (currCoordinates[0] < 0 || currCoordinates[0] > 7 || currCoordinates[1] < 0 || currCoordinates[1] > 7);
                                             
          //check if there's a friendly piece on those coordinates
          var currCoordinatesHasFriendlyPiece = false;
          for(var i = 0; i < this.board.pieces.length; i++)
          {
               var currPieceCoordinates = constructCoordinates(this.board.pieces[i].location.id);
               var currPieceOnCurrCoordinates = (currPieceCoordinates[0] === currCoordinates[0] && currPieceCoordinates[1] === currCoordinates[1]);
               if(this.color === this.board.pieces[i].color && currPieceOnCurrCoordinates)
               {
                    currCoordinatesHasFriendlyPiece = true;
                    break;
               }
          }
                                   
          //if there's not a friendly piece on it and it's not off the board, mark that square as valid
          if(!currCoordinatesOffBoard && !currCoordinatesHasFriendlyPiece)
          {
               var currSquare = this.board.gameboard[currCoordinates[0]][currCoordinates[1]];
               currSquare.classList.add("valid-move");
          }


          /*

               7pi/4

          */
          var currCoordinates = [constructCoordinates(this.location.id)[0] + 1, constructCoordinates(this.location.id)[1] + 1];

          //check if those coordinates are off the board
          var currCoordinatesOffBoard = (currCoordinates[0] < 0 || currCoordinates[0] > 7 || currCoordinates[1] < 0 || currCoordinates[1] > 7);
                                                  
          //check if there's a friendly piece on those coordinates
          var currCoordinatesHasFriendlyPiece = false;
          for(var i = 0; i < this.board.pieces.length; i++)
          {
               var currPieceCoordinates = constructCoordinates(this.board.pieces[i].location.id);
               var currPieceOnCurrCoordinates = (currPieceCoordinates[0] === currCoordinates[0] && currPieceCoordinates[1] === currCoordinates[1]);
               if(this.color === this.board.pieces[i].color && currPieceOnCurrCoordinates)
               {
                    currCoordinatesHasFriendlyPiece = true;
                    break;
               }
          }
                                        
          //if there's not a friendly piece on it and it's not off the board, mark that square as valid
          if(!currCoordinatesOffBoard && !currCoordinatesHasFriendlyPiece)
          {
               var currSquare = this.board.gameboard[currCoordinates[0]][currCoordinates[1]];
               currSquare.classList.add("valid-move");
          }
     }
}

//update the state of the board, important for first opening of the page
b.updatePiecesArrayFromHTML();
b.updateBoardDataFromHTML();

//function to remove selection if clicked on outside of board
function windowEventListener()
{
     //we want to remove the selection of a square if the mouse is clicked outside the chess board
     if(b.squareIsSelected)
     {
          b.removeSquareSelections();
          b.squareIsSelected = false;
     }
}

//this function is in charge of logic for determining if a piece needs to be moved
function boardEventListener(event)
{
     //stop the propagation of the event to keep from triggering the window event
     event.stopPropagation();

     //if we clicked a piece image, assign the square to its parent
     if(event.target.classList.contains("piece"))
     {
          var clickedSquare = event.target.parentNode;
     }
     else   //this fixes a bug where the piece became selected instead of the square it's on
     {
          var clickedSquare = event.target;
     }

     //get the square that's selected before the event
     var squareSelectedBeforeEvent = b.boardInDOM.querySelector(".selected");  //note that this may be null

     //check if this square is currently selected or a valid move for a selected piece
     var clickedSquareIsSelected = clickedSquare.classList.contains("selected");
     var clickedSquareIsValidMove = clickedSquare.classList.contains("valid-move");

     //find the piece that's selected before the event, if there is one
     if(squareSelectedBeforeEvent !== null)
     {
          for(var i = 0; i < b.pieces.length; i++)
          {
               //if piece is on the square that was selected before the click event
               if(b.pieces[i].location.id === squareSelectedBeforeEvent.id)
               {    
                    var pieceSelectedBeforeEvent = b.pieces[i];
               }
          }
     }

     //find the piece that becomes selected because of this event, if there is one
     for(var i = 0; i < b.pieces.length; i++)
     {
          //if piece is on the square that was selected before the click event
          if(b.pieces[i].location.id === clickedSquare.id)
          {    
               //get the selected piece and its color
               var pieceSelectedDueToEvent = b.pieces[i];
               var colorOfClickedPiece = pieceSelectedDueToEvent.color;

               //figure out if a king was captured due to this event firing
               var whiteKingCaptured = false;
               var blackKingCaptured = false;
               var kingSelectedDueToEvent = (clickedSquareIsValidMove && pieceSelectedDueToEvent.isKing);
               if(kingSelectedDueToEvent && playerNum === 1 && pieceSelectedDueToEvent.color === "black")
               {
                    blackKingCaptured = true;
               }
               else if(kingSelectedDueToEvent && playerNum === 2 && pieceSelectedDueToEvent.color === "white")
               {
                    whiteKingCaptured = true;
               }
          }
     }

     //check conditions for the click being invalid
     if(playerNum === 1 && colorOfClickedPiece === "black" && !clickedSquareIsValidMove)
     {
          //player 1 clicked a black piece that isn't a piece to capture, but they're white, so exit function
          return;
     }
     else if(playerNum === 2 && colorOfClickedPiece === "white" && !clickedSquareIsValidMove)
     {
          //player 2 clicked a white piece that isn't a piece to capture, but they're black, so exit function
          return;
     }
     else if(playerNum === 1 && (whoseTurn === -1 || whoseTurn === 2))
     {
          //player 1 still needs to wait for player 2 to join, or for player 2 to play their move
          return;
     }
     else if(playerNum === 2 && whoseTurn === 1)
     {
          //player 2 still needs to wait for player 1 to join
          return;
     }

     //remove selection of other squares
     b.removeSquareSelections();

     //select the square if it's not currently selected
     if(clickedSquareIsSelected === false)
     {
          //check if this square is a valid move for a currently selected piece
          if(clickedSquareIsValidMove)
          {
               //move the piece to that square
               if(pieceSelectedBeforeEvent !== undefined)
               {
                    //move the piece
                    pieceSelectedBeforeEvent.move(clickedSquare.id);
                    pieceSelectedBeforeEvent.isSelected = false;

                    //play the piece move sound
                    pieceMovementAudio.play();

                    //run all socket related functions
                    b.updateBoardDataFromHTML();
                    b.updatePiecesArrayFromHTML();
                    emitUpdateBoardWithSocket();

                    //if the opposite king was captured, making this player the winner
                    if(whiteKingCaptured)
                    {
                         endGame(2);
                    }
                    else if(blackKingCaptured)
                    {
                         endGame(1);
                    }
                    else
                    {
                         nextMove();
                    }
               }
               return;
          }

          //if a piece was selected before the event, we want clicking again to cancel the selection
          if(pieceSelectedBeforeEvent)
          {
               return;
          }

          //toggle the selected class for clickedSquare
          clickedSquare.classList.toggle("selected");
          b.squareIsSelected = true;

          //find the piece on clickedSquare, if there is one
          if(pieceSelectedDueToEvent !== undefined)
          {
               pieceSelectedDueToEvent.displayValidMoves();
               pieceSelectedDueToEvent.isSelected = true;
          }
          else    //if there's no piece on clickedSquare, then set all of the piece's isSelected to false
          {
               for(var i = 0; i < b.pieces.length; i++)
               {
                    b.pieces[i].isSelected = false;
               }
               }
     }
     else
     {
          b.squareIsSelected = false;
     }
}

//only allow clicking if the player isn't a spectator
function allowClicks()
{
     window.removeEventListener("click", windowEventListener);
     b.boardInDOM.removeEventListener("click", boardEventListener);

     if(playerNum !== 0)
     {    
          //add an event listener to the window to get correct selection behavior
          window.addEventListener("click", windowEventListener);

          //add an event listener to b.boardInDOM for selection and movement behavior
          b.boardInDOM.addEventListener("click", boardEventListener);
     }
}


//socket stuff
var socket = io.connect(document.getElementById("Gameurl").textContent);    //use this when doing localtunnel
//var socket = io.connect("http://localhost:3000");      //use this when not doing localtunnel

//as soon as this player enters the room, tell the server so it knows which room it just entered
socket.on("connect", function()
{
     socket.emit("enter-room", {roomNum: roomNum});
});

//function to emit the update-board event
function emitUpdateBoardWithSocket()
{
     //emit the event, sending the data back to the server
     socket.emit("update-board", {board: b.boardData, roomNum: roomNum});
}

//function to emit the next-turn event, which tells everyone whose turn it is now
function nextMove()
{
     if(playerNum === 1)
     {
          var nextTurn = 2;
          statusMessage.textContent = "Waiting for black player to make their move...";
     }
     else if(playerNum === 2)
     {
          var nextTurn = 1;
          statusMessage.textContent = "Waiting for white player to make their move...";
     }
     //send to everyone that this player has moved, so it's the next player's turn
     socket.emit("next-turn", {whoseTurn: nextTurn, roomNum: roomNum});
     whoseTurn = nextTurn;
}

//function to emit the game-over event, which tells everyone who won
function endGame(winner)
{
     //emit the event
     socket.emit("game-over", {winner: winner, roomNum: roomNum});
}


//listen for the update-board event
socket.on("update-board", function(data)
{
     b.boardData = data.board;
     b.updateHTMLFromBoardData();
     pieceMovementAudio.play();
     b.updatePiecesArrayFromHTML();
});

//listen for the get-player-num event
socket.on("player-join-game", function(data)
{
     playerNum = data.playerNum;
     if(playerNum === 1)
     {
          statusMessage.textContent = "You are white player, waiting for black player to join...";
          warningMessage.textContent = "WARNING: If you refresh your page or leave the game while playing, you will forfeit the game and move to the back of the spectator queue.";
     }

     allowClicks();
});

//listen for the begin-game event
socket.on("begin-game", function(data)
{
     //get whose turn it is
     whoseTurn = data.whoseTurn;

     //change the status message, based on who this player is
     if(playerNum === 1 && whoseTurn !== -1)
     {
          statusMessage.textContent = "You are white player, it's your move."
     }
     else if(playerNum === 2)
     {
          statusMessage.textContent = "You are black player, waiting for white player to make their move...";
          warningMessage.textContent = "WARNING: If you refresh your page or leave the game while playing, you will forfeit the game and move to the back of the spectator queue.";
     }
});

//listen for the next-turn event
socket.on("next-turn", function(data)
{
     //update this board's version of whose turn it is
     whoseTurn = data.whoseTurn;

     //change the status message, based on who this player is
     if(playerNum === 1 && whoseTurn === 1)
     {
          statusMessage.textContent = "It's your turn."
     }
     else if(playerNum === 2 && whoseTurn === 2)
     {
          statusMessage.textContent = "It's your turn.";
     }
});

//listen for the queue-positions event
socket.on("queue-position", function(data)
{
     if(playerNum === 0)
     {
          statusMessage.textContent = "You are currently watching a game in progress. Your position in the queue: " + data.position;
          warningMessage.textContent = "WARNING: If you refresh your page or leave the room as a spectator, you will be forfeiting your position in the spectator queue.";
     }
});

//listen for the game-over event
socket.on("game-over", function(data)
{
     //figure out if this player won or lost
     if((playerNum === 1 && data.winner === 1) || (playerNum === 2 && data.winner === 2))
     {
          //this player won
          statusMessage.textContent = "Congrats! You won! The next game will begin in 5 seconds...";
     }
     else if((playerNum === 1 && data.winner === 2) || (playerNum === 2 && data.winner === 1))
     {
          //this player lost
          statusMessage.textContent = "Oh no! You lost! The next game will begin in 5 seconds...";
     }
     else
     {
          //this is a spectator, so tell them who won
          if(data.winner === 1)
          {
               statusMessage.textContent = "White player won! The next game will begin in 5 seconds...";
          }
          else
          {
               statusMessage.textContent = "Black player won! The next game will begin in 5 seconds...";
          }
     }
});