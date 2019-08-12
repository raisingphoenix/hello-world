//var PLAY_BUTTON=document.getElementById("PLAY");
window.addEventListener("load",__init__,false);

var Tetris;

function __init__(){

	Tetris=new Game();
}

function Game(){
	this.score=0;
	this.paused=true;
	this.game_is_over=false;
	this.speed=1000;
	this.CurrentPiece=randomPiece();
	this.NextPiece=randomPiece();
	this.showNextPiece=showNextPiece;
	this.removeNextPiece=removeNextPiece;
	this.TableSquares=document.getElementsByTagName("td");
	this.SCORE_OUT=document.getElementById("SCORE");
	this.SCORE_OUT.value=0;
	this.moveShape=moveShape;
	this.gameOver=gameOver;
	this.setSpeed=setSpeed;
	this.playGame=playGame;
	this.checkForGameOver=checkForGameOver;
	this.pieceHitBottom=pieceHitBottom;

	this.PLAY_BUTTON=document.getElementById("PLAY");
	this.RESET_BUTTON =document.getElementById('RESET');

	this.PLAY_BUTTON.addEventListener("click",Play_Pause,false);
	this.RESET_BUTTON.addEventListener("click",ResetGame,false);

	this.Play_Pause=Play_Pause;
	this.ResetGame = ResetGame;

	this.dropScoreLines=dropScoreLines;
	this.timer=null;
	this.y_score_values=[];
	this.listenForEvents=window.addEventListener("keydown",handleEvents,false);
	this.randomPiece=randomPiece;
	this.removeNextPiece();
	this.showNextPiece();
	
	function showNextPiece(){
		
		var x=this.NextPiece.piece_name=="line"?10:-4
		for(var i=0;i<this.NextPiece.shape_array.length;i++){
			this.TableSquares[this.NextPiece.shape_array[i]+x].className="drop_"+this.NextPiece.piece_name;
		}
	}
	function removeNextPiece(){
		var x=this.NextPiece.piece_name=="line"?10:-4
		for(var i=0;i<this.NextPiece.shape_array.length;i++){
			this.TableSquares[this.NextPiece.shape_array[i]+x].className="border";
		}
	}
	function randomPiece(){
		var random_int_7=Math.floor(Math.random()*7);
		switch(random_int_7){
			case 0: return new LinePiece();
			case 1: return new FrontLPiece();
			case 2: return new BackLPiece();
			case 3: return new SquarePiece();
			case 4: return new CrossPiece();
			case 5: return new FrontZPiece();
			case 6: return new BackZPiece();
			default:  return
		}
	}
	function checkForGameOver(){
		this.game_is_over=this.CurrentPiece.current_shape.some(gameCheck);
		function gameCheck(v){
				return v<84;
		}
	}

	function setSpeed(){
		var factor=Math.floor(this.score/10);
		if(factor<13)
			this.speed=1000-factor*70;
		else
			this.speed=100-(7*(13-factor));
	}
	function moveShape(){
		this.CurrentPiece.current_shape.forEach(clearIt,this);
		this.CurrentPiece.proposed_shape.forEach(showIt,this);
		
		function clearIt(v){
				    if(v>85)
					 this.TableSquares[v].className="clear";
				   // else
					// this.TableSquares[v].className="border"
				   };
		function showIt(v){
				   if(v>85)
				   	this.TableSquares[v].className=this.CurrentPiece.drop_color
				  };
	}

	function handleEvents(e){		//------!!!!!! FIGURE HOW TO PASS REFERNCE/ARGUMENTS WITH EVENT LISTENERS-----!!!!!!!!
		switch(e.keyCode){
			case 37:	//	key = left arrow
			case 39:	//	key = right arrow
				Tetris.CurrentPiece.proposedTranslate(e.keyCode);
				Tetris.CurrentPiece.canTranslate(e.keyCode);
				break;
			case 40:	//	key = down arrow
				Tetris.CurrentPiece.proposedDrop();
				Tetris.CurrentPiece.canDrop();
				break;
			case 70:	// key=f
			case 72:	// key=h
				//console.log(Tetris.CurrentPiece.proposedTransform);
				Tetris.CurrentPiece.proposedTransform(e.keyCode);
				Tetris.CurrentPiece.canTransform(e.keyCode);
				break;
			default:
				break;
		}
	
	}
//===================================================================================================
//================================================ PLAY GAME ==============================================
//===================================================================================================
//--------     START GAME OR PAUSE GAME    ---------------
	function Play_Pause(){
		if(Tetris.paused==true){
			this.value="Pause";
			Tetris.paused=false;
			Tetris.playGame();
		}
		else{
			this.value="Play";
			Tetris.paused=true;
		}
	}
	function ResetGame(e){
		location.reload();
	}
//----------  PLAY GAME  --------------------
	function playGame(){
		Tetris.timer=null;
		//------------------   IF GAME IS NOT OVER AND NOT PAUSED ----------------
		if(!Tetris.game_is_over && !Tetris.paused){
			//--------	ASSIGN VALUES FOR A PROPOSED DROP OF SHAPE
			Tetris.CurrentPiece.proposedDrop();
			
			//----------- IF CURRENT PIECE CAN NO LONGER DROP ------------
			if(!Tetris.CurrentPiece.canDrop()){			

				Tetris.pieceHitBottom();
				Tetris.CurrentPiece=Tetris.NextPiece;
				Tetris.removeNextPiece();
				Tetris.NextPiece=Tetris.randomPiece();
				Tetris.showNextPiece();
				Tetris.timer=setTimeout(Tetris.playGame,10);	
				
			}//-------------- ELSE PIECE CAN CONTINUE TO DROP -------------
			else{
				Tetris.timer=setTimeout(Tetris.playGame,Tetris.speed);	
			}
		}//--------------  GAME IS OVER ------------------------------
		else if(Tetris.game_is_over){						
			Tetris.gameOver();
		}
	}
//===================================================================================================
//============================================= END OF PLAY GAME ===========================================
//===================================================================================================
	function gameOver(){
		this.timer=null;
		document.getElementById('game_over').className = 'reset_game';
	}

	function pieceHitBottom(){
		var sq;
		var points_scored=0;
		Tetris.y_score_values=[];
		var y_values=getHeightValues();
		//-----------SEARCH FOR SCORE --------------------
		for(var i in y_values){	
			sq=y_values[i]*14+2;

			for(var j=0;j<10;j++){
				if(Tetris.TableSquares[sq+j].className=="clear"||Tetris.TableSquares[sq+j].className=="border")
					break;
			}
			if(j==10){		// ---whole row has no clear cell
				points_scored++;
				Tetris.y_score_values.push(y_values[i]);
			}
		}

		this.score+=points_scored;

		this.SCORE_OUT.textContent=this.score;

		this.setSpeed();
		this.CurrentPiece.current_shape.forEach(classIt,this);
		if(points_scored>0)
			this.dropScoreLines();
		else{
			this.checkForGameOver();
			if(this.game_is_over)
				return;
		}
	//=====================================HELPER METHODS FOR PIECE_HIT_BOTTOM==============================


			function classIt(v){
				if(v>85)
					this.TableSquares[v].className=this.CurrentPiece.piece_name;
			}

			function getHeightValues(){
				var stored_value;
				var temp1=[];
				var temp2=[];
				for(var i in Tetris.CurrentPiece.current_shape)
					temp1.push(Math.floor(Tetris.CurrentPiece.current_shape[i]/14));

				stored_value=temp1[0];
				temp2.push(stored_value)
				for(var i=0;i<temp1.length;i++){
					if(temp1[i]!=stored_value){
						temp2.push(temp1[i]);
						stored_value=temp1[i];
					}
				}
				return temp2;
			}



	}
//==============================     CLOSE PIECE HIT BOTTOM METHOD       =============================
	function dropScoreLines(){
		var sq;
		for(var x=86;x<96;x++){
			
			this.TableSquares[x].className="clear";
		}
		for(var i=0;i<this.y_score_values.length;i++){
			sq=this.y_score_values[i]*14+11;
			while(sq>99){
				if(this.TableSquares[sq].className!="border"){
					this.TableSquares[sq].className=this.TableSquares[sq-14].className;
				}
				sq--;
			}
		}
	}
}
//==============================================================================================
//=======================================END OF GAME CLASS======================================
//==============================================================================================


function Piece(name){
	this.piece_name=name;
	this.transform_index=0;
	this.shift_index=0;
	this.proposed_shape=[];

	this.proposedTranslate=proposedTranslate;
	this.canTranslate=canTranslate;

	this.proposedDrop=proposedDrop;
	this.canDrop=canDrop;

	this.proposedTransform=proposedTransform;
	this.canTransform=canTransform;

	function proposedTransform(key_code){

		
		if(key_code==72){
			this.transform_index--;
			this.transform_index%=this.transform_array.length;
			if(this.transform_index<0)
				this.transform_index=this.transform_array.length+this.transform_index;
	
			this.proposed_shape=this.current_shape.map(function(v,i,a){ return v} );
		
			for(var i in this.transform_array[this.transform_index]){
				this.proposed_shape[i]+= -1 * (this.transform_array[this.transform_index][i]);
			}
		}
		else{
			this.proposed_shape=this.current_shape.map(function(v,i,a){ return v} );
		
			for(var i in this.transform_array[this.transform_index]){
				this.proposed_shape[i]+=this.transform_array[this.transform_index][i];
			}
			this.transform_index++;
			this.transform_index%=this.transform_array.length;
			if(this.transform_index<0)
				this.transform_index=this.transform_array.length+this.transform_index;
	
		}


	}

	function proposedTranslate(key_code){
		var move= (key_code==39) ? 1:-1;
		this.proposed_shape=this.current_shape.map(function(v){ return v+=move} );
	}
	function canTranslate(){
		if(this.proposed_shape.every(isClear)){
			Tetris.moveShape();
			this.current_shape=this.proposed_shape;
			return true;
		}
		return false;
	}
	function canTransform(){
		var jostle=[];
		if(this.proposed_shape.every(isClear)){
			Tetris.moveShape();
			this.current_shape=this.proposed_shape;
			this.shift_index=0;
			return true;
		}
		else{								//try jostling piece left/right
			
			jostle=this.proposed_shape.map(function (v){return v-1});
			if(jostle.every(isClear)){
				this.proposed_shape=jostle;
				Tetris.moveShape();
				this.current_shape=this.proposed_shape;
				this.shift_index=1;
				return true;				
			}

			jostle=this.proposed_shape.map(function (v){return v+1});
			if(jostle.every(isClear)){
				this.proposed_shape=jostle;
				Tetris.moveShape();
				this.current_shape=this.proposed_shape;
				this.shift_index=-1;
				return true;				
			}		
		}
		return false;
	
	}
	function proposedDrop(){
		this.proposed_shape=this.current_shape.map(function(v,i,a){ return v+=14 } );	
	}

	function canDrop(){
		if(this.proposed_shape.every(isClear)){
			Tetris.moveShape();
			this.current_shape=this.proposed_shape;
			return true;
		}
		return false;

	}
	function isClear(v,i,a){
		return((v<86 && v%14>1 && v%14<12) || Tetris.TableSquares[v].className=="clear" || Tetris.TableSquares[v].className.substring(0,4)=="drop");
	}

}
//==========================================END PIECE CLASS===================================

function LinePiece(){
	this.Piece_Con=Piece;
	this.Piece_Con("line");
	this.shape_array=[21,35,49,63];
	this.transform_array=[[13,0,-13,-26],[-13,0,13,26]];
	this.current_shape=this.shape_array;
	this.drop_color="drop_line";
	this.canTransform=lineCanTransform

	function lineCanTransform(){		//---------- override canTransform method for line  -------------

		var jostle=[];
		if(this.proposed_shape.every(isClear)){
			Tetris.moveShape();
			this.current_shape=this.proposed_shape;
			//this.shift_index=0;
			return true;
		}
		else{								//----------- try jostling piece left/right ----------
			
			jostle=this.proposed_shape.map(function (v){return v-1});
			if(jostle.every(isClear)){
				this.proposed_shape=jostle;
				Tetris.moveShape();
				//this.shift_index=1;
				this.current_shape=this.proposed_shape;
				return true;				
			}
			else{
				jostle=this.proposed_shape.map(function (v){return v-2});
				if(jostle.every(isClear)){
					this.proposed_shape=jostle;
					Tetris.moveShape();
					//this.shift_index=2;
					this.current_shape=this.proposed_shape;
					return true;
				}
			}

			jostle=this.proposed_shape.map(function (v){return v+1});
			if(jostle.every(isClear)){
				this.proposed_shape=jostle;
				Tetris.moveShape();
				//this.shift_index=-1;
				this.current_shape=this.proposed_shape;
				return true;				
			}		
		}
		return false;
	}
	function isClear(v,i,a){
		return((v<86 && v%14>1 && v%14<12) || Tetris.TableSquares[v].className=="clear" || Tetris.TableSquares[v].className.substring(0,4)=="drop");
	}

}
function FrontLPiece(){
	this.Piece_Con=Piece;
	this.Piece_Con("front_l");
	this.shape_array=[34,48,62,63];
	this.transform_array=[[1,-1,-14,-14],[-2,-13,0,13],[14,14,1,-1],[-13,0,13,2]];
	this.current_shape=this.shape_array;
	this.drop_color="drop_front_l";

}
function BackLPiece(){
	this.Piece_Con=Piece;
	this.Piece_Con("back_l");
	this.shape_array=[35,49,62,63];
	this.transform_array=[[13,0,-12,1],[-13,-13,-1,-1],[-1,12,0,-13],[1,1,13,13]];
	this.current_shape=this.shape_array;
	this.drop_color="drop_back_l";

}
function CrossPiece(){
	this.Piece_Con=Piece;
	this.Piece_Con("cross");
	this.shape_array=[48,61,62,63];
	this.transform_array=[[0,0,0,13],[13,1,1,0],[-13,0,0,0],[0,-1,-1,-13]];
	this.current_shape=this.shape_array;
	this.drop_color="drop_cross";

}
function SquarePiece(){
	this.Piece_Con=Piece;
	this.Piece_Con("square");
	this.shape_array=[48,49,62,63];
	this.transform_array=[[]];
	this.current_shape=this.shape_array;
	this.drop_color="drop_square";

}
function FrontZPiece(){
	this.Piece_Con=Piece;
	this.Piece_Con("front_z");
	this.shape_array=[49,50,62,63];
	this.transform_array=[[-15,-2,-13,0],[15,2,13,0]];
	this.current_shape=this.shape_array;
	this.drop_color="drop_front_z";

}
function BackZPiece(){
	this.Piece_Con=Piece;
	this.Piece_Con("back_z");
	this.shape_array=[47,48,62,63];
	this.transform_array=[[-12,1,-14,-1],[12,-1,14,1]];
	this.current_shape=this.shape_array;
	this.drop_color="drop_back_z";

}
