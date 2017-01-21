(function(){
  
  

var app=angular.module("tictactoe",[]);

app.controller("GameController", GameController);
app.filter("HTMLFilter", HTMLFilter);
  
app.constant("WinCombo", [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [6,4,2]
  ]
);
  
app.constant("ResetTime", 3000);

GameController.$inject = ["WinCombo", "$timeout", "ResetTime"];  

function GameController(WINCOMBO, $timeout, RESETTIME) {
  var ctrl = this;
  
  
  
  ctrl.init = function() {
    ctrl.s = [];
    
    for(var i=0; i<9;i++) {
      ctrl.s.push("&nbsp;");
    }
  
    ctrl.player1 = "X";
    ctrl.player2 = "O";
    ctrl.turn = 1;
    ctrl.playerTurn = true;
    ctrl.p1Plays = [];
    ctrl.p2Plays = [];
    ctrl.gameStopped = false;
    ctrl.gameInProgress = false;
    ctrl.gameStatus = "";
    
  }
  
  ctrl.swapPieces = function() {
    ctrl.player1 = ctrl.player1 === "X" ? "O" : "X";
    ctrl.player2 = ctrl.player2 === "O" ? "X" : "O";
  };
  
  ctrl.playPosition = function(pos) {
    
    if(ctrl.s[pos] != "&nbsp;" || ctrl.gameStopped) return;
    
    ctrl.gameInProgress = true;
    ctrl.gameStatus = "In progress..."
    
    if(ctrl.turn % 2 == 1) {
      ctrl.s[pos] = ctrl.player1;
      ctrl.p1Plays.push(pos);
      ctrl.turn = 2;
    } else {
      ctrl.s[pos] = ctrl.player2;
      ctrl.p2Plays.push(pos);
      ctrl.turn = 1;
    }
    
    evalBoard();
    ctrl.playerTurn = ctrl.playerTurn ? false : true;
    if(!ctrl.playerTurn) $timeout(function(){computerPlay();},300);
    
  };
  
  function evalBoard() {
    console.log("Evaluating board...");
    //console.log(WINCOMBO);
    
    //First check to see if game is drawn
    
    if(ctrl.p1Plays.length + ctrl.p2Plays.length == 9) {
      ctrl.gameStopped = true;
      ctrl.gameInProgress = false;
      ctrl.gameStatus = "Cats game!";
      $timeout(function(){ ctrl.init(); }, RESETTIME);
      return;
    }
    
    for(var i =0; i<WINCOMBO.length;i++) {
      //console.log("Evaluating at " + WINCOMBO[i][0] + " " + WINCOMBO[i][1] + " " +WINCOMBO[i][2]);
      //console.log("Pieces are " + ctrl.s[WINCOMBO[i][0]] + " " + ctrl.s[WINCOMBO[i][1]] + " " + ctrl.s[WINCOMBO[i][2]] );
      var win  = ctrl.s[WINCOMBO[i][0]] == ctrl.s[WINCOMBO[i][1]] && ctrl.s[WINCOMBO[i][2]] == ctrl.s[WINCOMBO[i][0]];
      var playerWin = win && ctrl.s[WINCOMBO[i][0]] == ctrl.player1;
      var compWin = win && ctrl.s[WINCOMBO[i][0]] == ctrl.player2;
      
      if(playerWin) {
        ctrl.gameStopped = true;
        ctrl.gameInProgress = false;
        ctrl.gameStatus = "YOU WON!!";
        $timeout(function(){ ctrl.init(); }, RESETTIME);
        return;
      } else if (compWin) {
        ctrl.gameStopped = true;
        ctrl.gameInProgress = false;
        ctrl.gameStatus = "You Lost!!";
        $timeout(function(){ ctrl.init(); }, RESETTIME);
        return;
      }
      
    }
  }
  
  function computerPlay() {
    //find current plays
    console.log("Computer Playing...");
    /*
    var p1Plays = ctrl.s.map(function(pos,idx){
      if(pos == ctrl.player1) return idx;
    }).filter(function(play){
      return play != undefined;
    });
    
    var p2Plays = ctrl.s.map(function(pos,idx){
      if(pos == ctrl.player2) return idx;
    }).filter(function(play){
      return play != undefined;
    });
    */
    //console.log("Computer has played: " + ctrl.p2Plays);
    
    //Prioritize choosing a winning move
    //var newPlay = null;
    
    if(ctrl.p2Plays.length == 0) {
      //We haven't played yet, pick a random play
      console.log("Picking a random position, with emphasis on the center position (4)...");
      var pos = ctrl.p1Plays.indexOf(4) == -1 ? 4 : Math.round(Math.random() * 8);
      if(ctrl.p1Plays.indexOf(pos) != -1) {
        console.log("Picking a new Position..." + pos+1);
        ctrl.playPosition(pos+1);
        return;
      } else {
        console.log("Playing original position " + pos);
        ctrl.playPosition(pos);
        
        return;
      } 
    } else if(ctrl.p1Plays.length + ctrl.p2Plays.length >= 8 ) {
      console.log("Game finished");
      return;
    }
      
      //console.log("Checking winning moves first...");
      var newPlay = optimalPlay();
      if (newPlay != undefined ) {
        console.log("Move is " + newPlay);
        ctrl.playPosition(newPlay);
        return;  
      } else {
        //Block Player 1 from succeeding
        console.log("Checking blocking moves");
        newPlay = optimalPlay();
        console.log("Blocking play is " + newPlay);
        ctrl.playPosition(newPlay);
        return;
        
      }
      
      
      
      
    
  }
 
  function optimalPlay() {
    console.log("Computer has played: ", ctrl.p2Plays);
    //Player 1 plays are held in global variable ctrl.p1Plays
    //Player 2 plays are held in global variable ctrl.p2Plays
    
    //The optimal play would check winning moves first
    //  secondly, it would check blocking moves
    //  thirdly, it would play a random position
    
    //Loop through the winning combos to see if we have played 2 of the 3 required moves
    var possiblePlays = [];
    for(var i = 0; i<WINCOMBO.length;i++) {
      var possibleCombo = WINCOMBO[i].filter(function(play){
        //console.log(play, ctrl.p2Plays.indexOf(play));
        return ctrl.p2Plays.indexOf(play) != -1;
      });
      //console.log("Checking possibleCombo ", possibleCombo);
      
      if(possibleCombo.length == 2) {
        //console.log("Winning Combo found " + WINCOMBO[i]);
        var pos = WINCOMBO[i].filter(function(play){
          return ctrl.p2Plays.indexOf(play) == -1;
        })[0];
        
        if(ctrl.p1Plays.indexOf(pos) == -1) {
          console.log("Winning position has not been played, adding to possible plays", pos);
          possiblePlays.push(pos);
        }
        
      }
    }
    
    for(var i=0;i<WINCOMBO.length;i++) {
      var possibleBlock = WINCOMBO[i].filter(function(play){
        return ctrl.p1Plays.indexOf(play) != -1;
      });
      //console.log("Checking block combo ", possibleBlock);
      if(possibleBlock.length == 2) {
        //console.log("Possible block found " + WINCOMBO[i]);
        var pos = WINCOMBO[i].filter(function(play){
          return ctrl.p1Plays.indexOf(play) == -1;
        })[0];
        //console.log("Possible play at position ", pos);
        if(ctrl.p2Plays.indexOf(pos) == -1) {
          console.log("Blocking position has not been played, adding position ", pos);
          possiblePlays.push(pos);
        }
      }
      
    }
    console.log("Possible plays are: ", possiblePlays);
    console.log("Suggesting play is: ", possiblePlays[0]);
    
    //check if length of possible plays == 0; now we need a random play
    
    if(possiblePlays.length == 0) {
      var played = ctrl.p1Plays.concat(ctrl.p2Plays);
      var position = played[0];
      console.log("Finding a random position available...");
      while(played.indexOf(position) != -1 ) {
        position = Math.round(Math.random() * 8);
        console.log("Checking ", position);
      }
      
      
      
      possiblePlays.push(position);
    }
    
    return possiblePlays[0];
    
    /*
    
    for(var i = 0; i<WINCOMBO.length;i++) {
        var possiblePlays = plays.filter(function(play){
          return WINCOMBO[i].indexOf(play) != -1;
        });
        console.log("Winning combo is " + WINCOMBO[i]);
        if(possiblePlays.length == 2) {
          for(var j=0;j<WINCOMBO[i].length;j++) {
            if(possiblePlays.indexOf(WINCOMBO[i][j]) == -1) {
              return WINCOMBO[i][j];
            }
          }
        }
        
      }
      */
  }
  
 ctrl.init(); 
}

HTMLFilter.$inject = ['$sce'];

function HTMLFilter($sce) {
  return function(text) {
    return $sce.trustAsHtml(text);
  };
}
  
})();