window.addEventListener("load",init);

var pong = {};

var keys = { jugadorUnoArriba : 87,
           jugadorUnoAbajo : 83,
           jugadorDosArriba : 38,
           jugadorDosAbajo : 40,
           jugadorTresDerecha: 39,
           jugadorTresIzquierda: 37,
           jugadorCuatroDerecha: 68,
           jugadorCuatroIzquierda:65,
           teclaQueGeneraBola:32        
        };

var keysPressed = [];
var lastTime = 0;
var paddleParameters = {margin:50,speed:200};

var disparoDisp=false;

//EXAMEN PARAMETERS
var numeroDeBolas =0;

function init(){

    

    pong = {
        bolas: [],
        game : generateGameObject(document.getElementById("game")),
        playArea : generateGameObject(document.getElementById("playArea")),
        leftPaddle : generateGameObject(document.getElementById("left")),
        rightPaddle : generateGameObject(document.getElementById("right")),
        upPaddle: generateGameObject(document.getElementById("up")),
        downPaddle: generateGameObject(document.getElementById("down")),
        ball : generateGameObject(document.getElementById("ball"))
    }

    //init ball extra parameters
    pong.ball.direction = {x:-1,y:1};
    pong.ball.speed = 250;

    //adjust gameArea Position
    var newPosForGameArea = {top:0,left:0};
    newPosForGameArea.left = ((pong.game.width - pong.playArea.width)/2);
    newPosForGameArea.top = ((pong.game.height - pong.playArea.height)/2);
    updatePosition(pong.playArea,newPosForGameArea);
 //   console.log(newPosForGameArea);

    //adjust Left paddle
    var newPosForLP = {top:0,left:0};
    newPosForLP.left = paddleParameters.margin;
    newPosForLP.top = (pong.playArea.height - pong.leftPaddle.height)/2;
    updatePosition(pong.leftPaddle,newPosForLP);
 //   console.log(newPosForLP);

    //adjust Up Paddle
    var newPosForUP = {top:0,left:0};
    newPosForUP.left = (pong.playArea.width - pong.upPaddle.width)/2;
    newPosForUP.top = paddleParameters.margin;
    updatePosition(pong.upPaddle,newPosForUP);

      //adjust Down Paddle
     var newPosForDP = {top:0,left:0};
     newPosForDP.left = (pong.playArea.width - pong.downPaddle.width)/2;
     newPosForDP.top = (pong.playArea.height - paddleParameters.margin - pong.downPaddle.height);
     updatePosition(pong.downPaddle,newPosForDP); 

    //adjust right paddle
    var newPosForRP = {top:0,left:0};
    newPosForRP.left = pong.playArea.width - paddleParameters.margin - pong.rightPaddle.width;
    newPosForRP.top = (pong.playArea.height - pong.rightPaddle.height)/2;
    updatePosition(pong.rightPaddle,newPosForRP);
 //   console.log(newPosForRP);

    //center ball
    var newPosForBall = {top:0,left:0};
    newPosForBall.left = (pong.playArea.width - pong.ball.width)/2;
    newPosForBall.top = (pong.playArea.height - pong.ball.height)/2;
    updatePosition(pong.ball,newPosForBall);
 //   console.log(newPosForBall);

    //key listeners
    window.addEventListener("keydown",procesaKeyPulsada);
    window.addEventListener("keyup",teclaSuelta);

    requestBolita();
    requestBolita();

    //start loop
    requestAnimationFrame(loop);

    
}

function procesaKeyPulsada(keyPulsada)
{
    keysPressed[keyPulsada.keyCode] = true;
}

function teclaSuelta(teclaQueSoltamos)
{
    delete keysPressed[teclaQueSoltamos.keyCode];
}

function loop(currentTime){

    var deltaMs = (currentTime - lastTime)/1000;
    updatePaddles(deltaMs);
    moveBall(deltaMs, pong.ball);

    lastTime = currentTime;
    requestAnimationFrame(loop);

    
    updateLasBolas(deltaMs);
    
    if(keysPressed[keys.teclaQueGeneraBola]){
        if(disparoDisp==true)
        {
            disparoDisp=false;
        }else  if(disparoDisp==false)
        {
            requestBolita();
            disparoDisp=true;
        }      
        
    }    
        
  
}     


function updateLasBolas(deltaMs)
{

    for (var i=0;i<pong.bolas.length;i++)
    {
            moveBall(deltaMs,pong.bolas[i]);
    }
}

function moveBall(deltaMs, bola){
    var deltaPx = deltaMs * bola.speed;

    updateNextPosition(deltaPx*bola.direction.x,deltaPx*bola.direction.y,bola);
    adjustBallWithCollisions(bola,pong.playArea,pong.leftPaddle,pong.rightPaddle,pong.upPaddle,pong.downPaddle);
    updatePosition(bola);
}

function adjustBallWithCollisions(ball,playArea,leftPaddle,rightPaddle, upPaddle, downPaddle){

    //update position when collision with ball
    var wallsHit = adjustPositionToParentBounds(ball,playArea);

    //update position after collision with wall
    if(wallsHit.top || wallsHit.down)
        ball.direction.y *= -1;
    if(wallsHit.left) {
        ball.direction.x *= -1;
        console.log("Player 2 Scored!");
    }
    else if(wallsHit.right){
        ball.direction.x *= -1;
        console.log("Player 1 Scored!");
    }
    //check collision with paddle
    collideWithPaddle(ball,leftPaddle);
    collideWithPaddle(ball,rightPaddle);
    collideWithPaddle(ball,upPaddle);
    collideWithPaddle(ball,downPaddle);    

}

function collideWithPaddle(ball,paddle){
    var pointTL = {x:ball.left,y:ball.top};
    var pointTR = {x:(ball.left+ball.width),y:ball.top};
    var pointBL = {x:ball.left,y:(ball.top+ball.height)};
    var pointBR = {x:(ball.left+ball.width),y:(ball.top+ball.height)};

    pointTL.collide = pointInGO(pointTL.x,pointTL.y,paddle);
    pointTR.collide = pointInGO(pointTR.x,pointTR.y,paddle);
    pointBL.collide = pointInGO(pointBL.x,pointBL.y,paddle);
    pointBR.collide = pointInGO(pointBR.x,pointBR.y,paddle);

    //rigth side collides
    if(pointTR.collide && pointBR.collide){
        console.log("derecha");
        updatePosition(ball,{top:ball.top,left:(paddle.left-ball.width)});
        ball.direction.x *= -1;
    }
    //top side collides
    if(pointTL.collide && pointTR.collide){
        console.log("arriba");
        updatePosition(ball,{top:(10+paddle.top+paddle.height),left:ball.left});
        ball.direction.y *= -1;
    }
    //bottom side collides
    if(pointBL.collide && pointBR.collide){
        console.log("abajo");
        updatePosition(ball,{top:paddle.top-ball.height,left:ball.left});
        ball.direction.y *= -1;
    }
    //left side collides
    if(pointTL.collide && pointBL.collide){
        console.log("izquierda");
        updatePosition(ball,{top:ball.top,left:paddle.left+paddle.width});
        ball.direction.x *= -1;
    }
    
}

function pointInGO(x,y,GO){

    if( x >= GO.left && x <= (GO.left+GO.width) && y >= GO.top && y <= (GO.top+GO.height))
        return true;
    return false;
}

function adjustPositionToSiblings(childGO,siblingGO){
    
    if(childGO.left < 0) {  
        childGO.left = 0;
        wallsHit.left = true; 
    }
    else if((childGO.left + childGO.width) > parentGO.width){
        childGO.left = parentGO.width - childGO.width;
        wallsHit.right = true;
    }
    if(childGO.top < 0){
        childGO.top = 0;
        wallsHit.top = true;
    } 
    else if ((childGO.top + childGO.height) > parentGO.height){ 
        childGO.top = parentGO.height - childGO.height;
        wallsHit.down = true;
    }

    return wallsHit;
}

function updatePaddles(deltaMs){
    var deltaPx = deltaMs * paddleParameters.speed; 

    if(keysPressed[keys.jugadorUnoArriba]){
        movePaddleInBounds(-deltaPx,pong.leftPaddle);
    }
    if(keysPressed[keys.jugadorUnoAbajo]){
        movePaddleInBounds(deltaPx,pong.leftPaddle);
    }
    if(keysPressed[keys.jugadorDosArriba]){
        movePaddleInBounds(-deltaPx,pong.rightPaddle);
    }
    if(keysPressed[keys.jugadorDosAbajo]){
        movePaddleInBounds(deltaPx,pong.rightPaddle);
    }
    if(keysPressed[keys.jugadorTresDerecha]){
        movePaddleHorizontalInBounds(deltaPx,pong.upPaddle);
    }
    if(keysPressed[keys.jugadorTresIzquierda]){
        movePaddleHorizontalInBounds(-deltaPx,pong.upPaddle);
    }
    if(keysPressed[keys.jugadorCuatroDerecha]){
        movePaddleHorizontalInBounds(deltaPx,pong.downPaddle);
    }
    if(keysPressed[keys.jugadorCuatroIzquierda]){
        movePaddleHorizontalInBounds(-deltaPx,pong.downPaddle);
    }
    
    

}

function requestBolita(){

    var bolaHTML = generateBola("playArea", numeroDeBolas);

    var bolaGO = generateGameObject(bolaHTML);

    bolaGO.direction= {x:randomIntFromInterval(-1,1),y:randomIntFromInterval(-1,1)};
    bolaGO.speed = randomIntFromInterval(100,250);

    //init bullet
    var newPosForBola = {top:0,left:0};
    newPosForBola.left = (pong.playArea.width - pong.ball.width)/2;
    newPosForBola.top = (pong.playArea.height - pong.ball.height)/2;
    
    //Math.floor(Math.random() * 6) + 1;

    updatePosition(bolaGO,newPosForBola);

    pong.bolas.push(bolaGO);

}

function randomIntFromInterval(min,max) // min and max included
{
    return Math.floor(Math.random()*(max-min+1)+min);
}

function generateBola(padreHTML)
{
    var paraBolaElegido = document.createElement("div");

    paraBolaElegido.className="bola";

    document.getElementById(padreHTML).appendChild(paraBolaElegido);
    

    return paraBolaElegido;
}

function movePaddleInBounds(deltaY,paddleGO){
    updateNextPosition(0,deltaY,paddleGO);
    adjustPositionToParentBounds(paddleGO,pong.playArea);
    updatePosition(paddleGO);
}

function movePaddleHorizontalInBounds(deltaX,paddleGO){
    updateNextPosition(deltaX,0,paddleGO);
    adjustPositionToParentBounds(paddleGO,pong.playArea);
    updatePosition(paddleGO);
}

function updateNextPosition(deltaX,deltaY,gameObject){
    gameObject.top += deltaY;
    gameObject.left += deltaX;
}

function adjustPositionToParentBounds(childGO,parentGO){
    
    var wallsHit = {}

    if(childGO.left < 0) {  
        childGO.left = 0;
        wallsHit.left = true; 
    }
    else if((childGO.left + childGO.width) > parentGO.width){
        childGO.left = parentGO.width - childGO.width;
        wallsHit.right = true;
    }
    if(childGO.top < 0){
        childGO.top = 0;
        wallsHit.top = true;
    } 
    else if ((childGO.top + childGO.height) > parentGO.height){ 
        childGO.top = parentGO.height - childGO.height;
        wallsHit.down = true;
    }

    return wallsHit;
}

function updatePosition(gameObject,newPosition){

    if(newPosition != undefined){
        gameObject.top = newPosition.top;
        gameObject.left = newPosition.left;
    }
    gameObject.dom.style.top = gameObject.top + "px";
    gameObject.dom.style.left = gameObject.left + "px";
}

function getPosition(HTML){
    var pos = {left:0,top:0};
    if(HTML.style.top != "")
        pos.top = parseInt(HTML.style.top);
    if(HTML.style.left != "")
        pos.left = parseInt(HTML.style.left);
    return pos;
}

function getDimension(HTML){
    var dim = {width:0,height:0};
    var computedDim = HTML.getBoundingClientRect();
    dim.width = computedDim.width;
    dim.height = computedDim.height;
    return dim;
}

function generateGameObject(HTMLobject){

    var dimension = getDimension(HTMLobject);
    var position = getPosition(HTMLobject);

    return {
        left : position.left,
        top : position.top,
        width : dimension.width,
        height : dimension.height,
        dom : HTMLobject
    };
}

