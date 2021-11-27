
let animar = false;
let animID = false;

var canvas = document.getElementById("tela");
// canvas.width = 480*3;
// canvas.height = 320*3;


var ctx = canvas.getContext("2d");
var terminal = document.getElementById("terminal");
terminal.value = "a";

let a = new ToroMaze();
a.restart(60,40);

let aa, vv, cc, dd;

//let b = new MazeAlgorithm( a );
//let b = new MazeBackTrackAlgorithm( a );
let b = new MazeBackTrackShortCorridorAlgorithm( a );

//prng();//avança o prng p obter mapa diferente

while (!b.dig(1));

//let apath = bfs( a, a.getCell(14,29) , a.getCell(29,9) );
//let bpath = bfs( a, a.getCell(29,9) , a.getCell(44,29) );
//let cpath = bfs( a, a.getCell(44,29) , a.getCell(14,29) );

let d = new PedometerStats( a );

let bigpath = d.getTheBigPath();

let c = new BfsAnimated( a, bigpath[0] , bigpath[bigpath.length -1 ] );

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
  //v.drawRoutePath( ctx , apath , 'LightSalmon');
  //v.drawRoutePath( ctx , bpath , 'GreenYellow');
  //v.drawRoutePath( ctx , cpath , 'CornflowerBlue');
  v.drawRoutePath( ctx , bigpath , 'Tomato');
  //v.drawRoute( ctx , bigpath , 'Tomato');

  let vb = a.getVisitedBorder();
  v.drawCenter( ctx , vb , 'yellow');
  v.drawCenter( ctx , c.live , 'orange' );
  
  //v.drawRect( ctx , [c.start, c.stop] , 'green');
  v.drawRect( ctx , [c.start] , 'green');
  v.drawRect( ctx , [c.stop] , 'red');
  v.drawRoutePath( ctx , c.path , 'red');

  // let wid = 480;
  // let hei = 320;
  // let imgData = ctx.getImageData(0, 0, 480, 320);
  // ctx.putImageData(imgData,   480, 0);
  // ctx.putImageData(imgData, 2*480, 0);

  // ctx.putImageData(imgData,     0, 320);
  // ctx.putImageData(imgData,   480, 320);
  // ctx.putImageData(imgData, 2*480, 320);

  // ctx.putImageData(imgData,     0, 2*320);
  // ctx.putImageData(imgData,   480, 2*320);
  // ctx.putImageData(imgData, 2*480, 2*320);
  
  // //#800000, #ff00ff, #00ff00, #808000, #0000ff, #008080, 
  // //#ffff00, #000080, #00ffff, #800080, #ff0000, #008000

  // flood_fill( ctx ,   0+  0+4, 320+4, '#800000' );
  // flood_fill( ctx ,   0+120+4, 320+4, '#ff00ff' );
  // flood_fill( ctx ,   0+240+4, 320+4, '#00ff00' );
  // flood_fill( ctx ,   0+360+4, 320+4, '#808000' );
  // flood_fill( ctx , 480+  0+4, 320+4, '#0000ff' );
  // flood_fill( ctx , 480+120+4, 320+4, '#008080' );
  // flood_fill( ctx , 480+240+4, 320+4, '#ffff00' );
  // flood_fill( ctx , 480+360+4, 320+4, '#000080' );
  // flood_fill( ctx , 960+  0+4, 320+4, '#00ffff' );
  // flood_fill( ctx , 960+120+4, 320+4, '#800080' );
  // flood_fill( ctx , 960+240+4, 320+4, '#ff0000' );
  // flood_fill( ctx , 960+360+4, 320+4, '#008000' );

  // flood_fill( ctx ,   0+  0+4, 640+4, '#ffff00' );
  // flood_fill( ctx ,   0+120+4, 640+4, '#000080' );
  // flood_fill( ctx ,   0+240+4, 640+4, '#00ffff' );
  // flood_fill( ctx ,   0+360+4, 640+4, '#800080' );
  // flood_fill( ctx , 480+  0+4, 640+4, '#ff0000' );
  // flood_fill( ctx , 480+120+4, 640+4, '#008000' );
  // flood_fill( ctx , 480+240+4, 640+4, '#800000' );
  // flood_fill( ctx , 480+360+4, 640+4, '#ff00ff' );
  // flood_fill( ctx , 960+  0+4, 640+4, '#00ff00' );
  // flood_fill( ctx , 960+120+4, 640+4, '#808000' );
  // flood_fill( ctx , 960+240+4, 640+4, '#0000ff' );
  // flood_fill( ctx , 960+360+4, 640+4, '#008080' );

  

}

function ligardesligar() {
  if ( animar ) { animar = false ; clearInterval(animID)  ; animID = null; console.log("Desliga Interval");}
  else { animID = setInterval(explore, Math.floor(1000/100) ) ; animar = true;console.log("Liga Interval"); }
}

document.getElementById("step").onclick = explore;
document.getElementById("setstart").onclick = setstart;
document.getElementById("setstop").addEventListener("click", setstop);
document.getElementById("newmaze").onclick = newmaze.bind(window);
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

function newmaze(){
 //console.log(this);
 b.reset();
 while (!b.dig(1));
 
 apath = bfs( a, a.getCell(14,29) , a.getCell(29,9) );
 bpath = bfs( a, a.getCell(29,9) , a.getCell(44,29) );
 cpath = bfs( a, a.getCell(44,29) , a.getCell(14,29) );
 bigpath = d.getTheBigPath();
 c.start = bigpath[0];
 c.stop = bigpath[bigpath.length -1 ];
 c.reset();

 aa = ToroMaze2Maze(a);
  
 var canvas2 = document.getElementById("unfold");
 if ( canvas2 != null ) { canvas2.remove() };

 document.getElementById("tela").insertAdjacentHTML( 'beforebegin' , '<canvas id="unfold" width="'+ (aa.width * 8) + '" height="'+ (aa.height * 8) +'"> Seu navegador não suporta o canvas.</canvas>');
 ctx2 = document.getElementById("unfold").getContext("2d");
 
 vv = new MazeVisualizer2x2(aa);
 vv.draw(ctx2);
 dd = new PedometerStats( aa );
 TThebigpath = dd.getTheBigPath( Math.floor(aa.width/2) , Math.floor(aa.height/2) );
 while( TThebigpath.length < 3 ) {
  TThebigpath = dd.getTheBigPath( Math.floor( Math.random() * aa.width) , Math.floor( Math.random() * aa.height) );
 }

 vv.drawRoutePath( ctx2, TThebigpath , 'red');
 

 draw();
 

}