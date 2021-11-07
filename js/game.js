
let animar = false;
let animID = false;

var canvas = document.getElementById("tela");
var ctx = canvas.getContext("2d");
var terminal = document.getElementById("terminal")
terminal.value = "a";

let a = new ToroMaze();
a.restart(60,40);

//let b = new MazeAlgorithm( a );
//let b = new MazeBackTrackAlgorithm( a );
let b = new MazeBackTrackShortCorridorAlgorithm( a );

//prng();//avança o prng p obter mapa diferente

while (!b.dig(1));

let cpath = bfs( a, a.getCell(8,10) , a.getCell(6,39) );
//let c = new Bfs( a, a.getCell(8,10) , a.getCell(43,17) );

let c = new BfsAnimated( a, a.getCell(10,21) , a.getCell(50,30) );

let v = new MazeVisualizer2x2(a);
draw();

function explore() {
  if (!c.done){


  // drawing code
  if ( c.dig(1) ) { 
    //c.reset();
    terminal.value += "a";
  } else {
    //terminal.value += "b";
  }

  draw();

  } else {
    ligardesligar() ;

  }

}

function draw() {
  v.draw(ctx);
  v.drawRoutePath( ctx , cpath , 'LightSalmon');
  //v.drawRoute( ctx , b.pilha );
  //v.drawRoutePath( ctx , b.pilha );
  let vb = a.getVisitedBorder();
  v.drawCenter( ctx , vb , 'yellow');
  v.drawCenter( ctx , c.live , 'orange' );
  
  //v.drawRect( ctx , [c.start, c.stop] , 'green');
  v.drawCenter( ctx , [c.start] , 'green');
  v.drawCenter( ctx , [c.stop] , 'red');
  v.drawRoutePath( ctx , c.path , 'red');
}





function ligardesligar() {
  if ( animar ) { animar = false ; clearInterval(animID)  ; animID = null; console.log("Desliga Interval");}
  else { animID = setInterval(explore, Math.floor(1000/100) ) ; animar = true;console.log("Liga Interval"); }
}

document.getElementById("step").onclick = explore;
document.getElementById("setstart").onclick = setstart;
document.getElementById("setstop").addEventListener("click", setstop);
document.getElementById("newmaze").addEventListener("click", newmaze);
document.getElementById("onoff").onclick = ligardesligar;

function setstart( event ) {
  document.getElementById("tela").style.cursor="progress" ;
  document.getElementById("tela").onclick = setstartonclick;
  console.log("Set Start ON");
}

function setstartonclick( event ) {
  c.start = a.getCell( Math.floor( event.offsetX/8) , Math.floor( event.offsetY/8) );
  c.reset();
  draw();
  document.getElementById("tela").style.cursor="default" ;
  document.getElementById("tela").removeEventListener("click", setstartonclick);
  console.log("Set Start OFF");
}

function setstop( event ) {
  document.getElementById("tela").style.cursor="progress" ;
  document.getElementById("tela").onclick = setstoponclick;
  console.log("Set Stop ON");
}

function setstoponclick( event ) {
  c.stop = a.getCell( Math.floor( event.offsetX/8) , Math.floor( event.offsetY/8) );
  c.reset();
  draw();
  document.getElementById("tela").style.cursor="default" ;
  document.getElementById("tela").removeEventListener("click", setstartonclick);
  console.log("Set Stop OFF");
}