// title:  Perlin Noise
// author: Anastasia Dunbar
// script: js
var width=240-16,height=136-16;



function mulberry32(a) {
    return function() {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

var myrnd = mulberry32(22);
// 7, 9, 11, 12, 13, 14, 22,  


function mix(a,b,t){return(t*(b-a))+a;}
function mod(a,b){return((a%b)+b)%b;}
function fract(x){return x-Math.floor(x);}
function clamp(a,b,c){return Math.min(Math.max(a,b),c);}
function dot(a,b){for(var s=0,i=0;i<a.length;i++){s+=a[i]*b[i];}return s;}
function sign(x){return x>0?1:x<0?-1:0;}
function pow2(a,b){return Math.pow(Math.abs(a),b)*sign(a);}
function pal(i,r,g,b){
 i=i<0?0:i;i=i>15?15:i;
 if(r==undefined&&g==undefined&&b==undefined){return[peek(0x3fc0+(i*3)),peek(0x3fc0+(i*3)+1),peek(0x3fc0+(i*3)+2)];}else{
  poke(0x3fc0+(i*3)+2,clamp(b,0,255));poke(0x3fc0+(i*3)+1,clamp(g,0,255));poke(0x3fc0+(i*3),clamp(r,0,255));
 }
}

var seed={
 a:500+(Math.random()*1e4),//500 + r*10000
 fx:500+(Math.random()*1e4),
 fy:500+(Math.random()*1e4),
 px:Math.random()-.5,
 py:Math.random()-.5
}

var seed={
 a:500+(myrnd()*1e4),//500 + r*10000
 fx:500+(myrnd()*1e4),
 fy:500+(myrnd()*1e4),
 px:myrnd()-.5,
 py:myrnd()-.5
}
print( myrnd() + " " + myrnd() );

function pseudorandom2D(x,y){
 return fract(
   Math.sin(
    dot(
     [x+seed.px,y+seed.py],
     [seed.fx,seed.fy]
    )
   )*seed.a
  );
}
function perlin(x,y){
 return mix(
  mix(
   pseudorandom2D(Math.floor(x)  ,Math.floor(y)),
   pseudorandom2D(Math.floor(x)+1,Math.floor(y)),
   fract(x)
  ),
  mix(
   pseudorandom2D(Math.floor(x)  ,Math.floor(y)+1),
   pseudorandom2D(Math.floor(x)+1,Math.floor(y)+1),
   fract(x)
  ),
  fract(y)
 )
}
function f(x,y){
 x/=32;y/=32;
 var iterations=2,sum=0;
 for(var i=0;i<iterations;i++){
  seed.a=500+((fract(Math.sin((i+.512)*512)*725.63))*1e4);
  sum+=perlin(x*(i+1),y*(i+1));
 }
 return sum/iterations;
}

//marchingcubes
ms0 = [140,141,142,143,156,157,158,159,172,173,174,175,188,189,190,191];
ms1 = [204,205,206,207,220,221,222,223,236,237,238,239,252,253,254,255];
ms2 = [200,201,202,203,216,217,218,219,232,233,234,235,248,249,250,251];
ms3 = [ 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79];

ms4 = [ 96, 97, 98, 99,100,101,102,103,104,105,106,107,108,109,110,111];
ms5 = [112,113,114,115,116,117,118,119,120,121,122,123,124,125,126,127];
ms6 = [128,129,130,131,132,133,134,135,136,137,138,139,140,141,142,143];
ms7 = [ 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95];


function sprms( x , y ){
/*
 p1 = f( x     , y     ); //10h
 p2 = f( x + 8 , y     ); //2h
 p3 = f( x + 8 , y + 8 ); //4h
 p4 = f( x     , y + 8 ); //8h
*/ 
 p1 = pix( x     , y     )/15; //10h
 p2 = pix( x + 8 , y     )/15; //2h
 p3 = pix( x + 8 , y + 8 )/15; //4h
 p4 = pix( x     , y + 8 )/15; //8h 
 
 v = 0;
 v += ( (p1 < 0.38) || (p1 > 0.62) ) ? 1 : 0 ;
 v += ( (p2 < 0.38) || (p2 > 0.62) ) ? 2 : 0 ;
 v += ( (p3 < 0.38) || (p3 > 0.62) ) ? 4 : 0 ;
 v += ( (p4 < 0.38) || (p4 > 0.62) ) ? 8 : 0 ;

 t = f( x+2000 , y+2000 ); 
 
 if ( t < 0.5 ) {
  spr( ms6[v] , x , y , -1 , 1 , 0, 0 , 1,1);
 } else  if ( t < 0.66 ) {
  spr( ms3[v] , x , y , -1 , 1 , 0, 0 , 1,1);
 } else {
  spr( ms6[v] , x , y , -1 , 1 , 0, 0 , 1,1);
 }
 
}

mt0 = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];
mt1 = [16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
mt2 = [32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47];
mt3 = [48,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63];

function sprmt( x , y ){
/*
 p1 = f( x + 4 , y     ); //12h
 p2 = f( x + 8 , y + 4 ); //3h
 p3 = f( x + 4 , y + 8 ); //6h
 p4 = f( x     , y + 4 ); //9h
*/

 p1 = pix( x     , y     )/15; //10h
 p2 = pix( x + 8 , y     )/15; //2h
 p3 = pix( x + 8 , y + 8 )/15; //4h
 p4 = pix( x     , y + 8 )/15; //8h 
  
 v = 0;
 v += ( (p1 < 0.38) || (p1 > 0.62) ) ? 1 : 0 ;
 v += ( (p2 < 0.38) || (p2 > 0.62) ) ? 2 : 0 ;
 v += ( (p3 < 0.38) || (p3 > 0.62) ) ? 4 : 0 ;
 v += ( (p4 < 0.38) || (p4 > 0.62) ) ? 8 : 0 ;

 t = f( x+2000 , y+2000 ); 
 
 if ( t < 0.33 ) {
  spr( mt2[v] , x , y , -1 , 1 , 0, 0 , 1,1);
 } else if ( t < 0.66 ) {
  spr( mt1[v] , x , y , -1 , 1 , 0, 0 , 1,1);
 } else {
  spr( mt3[v] , x , y , -1 , 1 , 0, 0 , 1,1); 
 }
}

var maze  = [];
var stack = [];

function Cell(x,y){
 this.x = x;
 this.y = y;
 this.walls = [true,true,true,true]; // up right down left
 
 this.show = function() {
  rect( x, y, 8, 8, 0 );
  if (this.walls[0]) { line( x   , y   , x+8 , y   , 15 ); }
  if (this.walls[1]) { line( x+8 , y   , x+8 , y+8 , 15 ); }  
  if (this.walls[2]) { line( x   , y+8 , x+8 , y+8 , 15 ); }
  if (this.walls[3]) { line( x   , y   , x   , y+8 , 15 ); }
  rect( x+1, y+1, 7, 7, 7 );
 }
 
 this.conect = function ( c ) {
  if ( (this.x > c.x) && (this.y == c.y) ) {
   this.walls[3] = false;
   c.walls[1] = false;
  } 
  else if ( (this.x < c.x) && (this.y == c.y) ) {
   this.walls[1] = false;
   c.walls[3] = false;
  } 
  else if ( (this.y > c.y) && (this.x == c.x) ) {
   this.walls[0] = false;
   c.walls[2] = false;
  }
  else if ( (this.y < c.y) && (this.x == c.x) ) {
   this.walls[2] = false;
   c.walls[0] = false;
  }
 }//fim da function conect
 
}

function Maze() {

 this.startcell = new Cell(0,0);
 this.pilha = [];
 this.cells = [];
 this.limites = [];
 this.colortag = 0;
 this.started = false;
 this.atual = this.startcell ;
 this.vizinhos = [];
 this.visitado = [];
 
 this.start = function ( x , y ) {
  this.startcell = new Cell( Math.floor(x-(x%8)) , Math.floor(y-(y%8)) );
  this.cells.push(this.startcell);
  this.pilha.push(this.startcell);
  this.atual = this.startcell ;
  //this.colortag = pix( this.atual.x+3 , this.atual.y+3 );
  this.colortag = noisepix(  this.atual.x+3 , this.atual.y+3 , 3 );
  for ( j = 0 ; j < height ; j+=8 ) {
   for ( i = 0 ; i < width ; i+=8 ) {
    this.visitado.push(false);
   }
  }
  this.marcarvisitado( x , y );
  this.started = true;
 }//fim da funcao start

 this.show = function() {
  var i,j,c,l;
  c = this.cells.length;
  l = this.limites.length;
  for( i = 0 ; i < c ; i ++ ) {
   this.cells[i].show();
  }
//  for( i = 0 ; i < l ; i ++ ) {
//   this.limites[i].show();
//  }
  rect( this.atual.x+2 , this.atual.y+2 , 5 , 5 , 15 );
 }//fim da funcao show
 
 this.foivisitado = function( x , y ) {
  if ( x > width || y > height || x < 0 || y < 0 ) {
   return true;
  }
  var i = Math.floor(x/8);
  var j = Math.floor(y/8);
  return this.visitado[ (j*Math.floor(width/8))+i ];
 }// fim da funcao foivisitado

 this.marcarvisitado = function( x , y ) { 
  if ( x > width || y > height || x < 0 || y < 0 ) {
   return true;
  } 
  var i = Math.floor (x/8);
  var j = Math.floor (y/8);
  this.visitado[ (j*Math.floor(width/8))+i ] = true ;
 }// fim da funcao marcavisitado 

 this.fazburaco = function(){
  this.vizinhos = this.getvizinhos();
  //trace("this.vizinhos.length = " + this.vizinhos.length);
  var nviz = this.vizinhos.length;
  var novacell , dir ;
  
  if ( nviz > 0 ) {
   dir = Math.floor(Math.random()*nviz);
   //trace("dir = " + dir );
   novacell = new Cell( this.vizinhos[dir][0], this.vizinhos[dir][1] );
   //trace("novacell = " + [novacell.x,novacell.y] +" " +  novacell.walls );
   this.atual.conect(novacell);
   //trace("novacell conectada");         
   this.cells.push(novacell);
   this.pilha.push(novacell);
   this.marcarvisitado( novacell.x , novacell.y );
   this.atual = novacell;
   return true;
  } else if ( this.pilha.length > 0 ) {
   this.atual = this.pilha.pop();
   return true;   
  } else {
   return false;   
  }
 }// fim da funcao fazburaco
 
 this.getvizinhos = function () {
  if ( this.started ) {
   var acima, direita , baixo , esquerda ;
   var dir = [[3,-5],[11,3],[3,11],[-5,3]];
   var vizinhos = [];
   var i = 0;
   var x = 0, y = 0;
   for ( i = 0 ; i < 4 ; i++ ){
    x = this.atual.x + dir[i][0];
    y = this.atual.y + dir[i][1];
//    if ( pix( x , y ) == this.colortag ) {
    if ( noisepix( x , y , 3 )== this.colortag) {    
     if ( ! this.foivisitado( x-(x%8),y-(y%8))){
      vizinhos.push( [x-(x%8),y-(y%8)] );
     }
    } else {
     this.limites.push( new Cell( x-(x%8),y-(y%8) ));
    }
   }
   return vizinhos;
  } else {
   return [] ;
  }
 }// fim da funcao getvizinhos


}


var  levels = {  
    2 : [0 , 15],
    3 : [0 , 8, 15], 
    4 : [0 , 5, 10, 15] ,
    5 : [0 , 4, 8, 12, 15],
    6 : [0 , 3, 6, 9, 12, 15],
    7 : [0 , 2, 5, 7, 10, 12, 15],
    8 : [0 , 2, 4, 6, 8, 11, 13, 15],
    9 : [0 , 2, 4, 6, 8, 9, 11, 13, 15],
   10 : [0 , 1, 2, 4, 6, 8, 9, 11, 13, 15],
   11 : [0 , 1, 2, 4, 6, 8, 9, 11, 13, 14, 15], 
   12 : [0 , 1, 2, 4, 6, 8, 9, 10, 11, 13, 14, 15],
   13 : [0 , 1, 2, 4, 5, 6, 8, 9, 10, 11, 13, 14, 15],
   14 : [0 , 1, 2, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15],
   15 : [0 , 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15],
   16 : [0 , 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
 };


function noisepix( x , y , campos ) {
 return    levels[campos][
      Math.floor(
       clamp(
        f(x,y),0,1
       )*campos
      )
    ];   
}


function noisefill( x , y , wd , hg ) {

 levels = {  
    2 : [0 , 15],
    3 : [0 , 8, 15], 
    4 : [0 , 5, 10, 15] ,
    5 : [0 , 4, 8, 12, 15],
    6 : [0 , 3, 6, 9, 12, 15],
    7 : [0 , 2, 5, 7, 10, 12, 15],
    8 : [0 , 2, 4, 6, 8, 11, 13, 15],
    9 : [0 , 2, 4, 6, 8, 9, 11, 13, 15],
   10 : [0 , 1, 2, 4, 6, 8, 9, 11, 13, 15],
   11 : [0 , 1, 2, 4, 6, 8, 9, 11, 13, 14, 15], 
   12 : [0 , 1, 2, 4, 6, 8, 9, 10, 11, 13, 14, 15],
   13 : [0 , 1, 2, 4, 5, 6, 8, 9, 10, 11, 13, 14, 15],
   14 : [0 , 1, 2, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15],
   15 : [0 , 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15],
   16 : [0 , 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
 };
 
 campos = 3 ; //de 2 a 16;

 if (campos > 1 ) {

 for ( j = 0 ; j < hg ; j++ ) {
  for ( i = 0 ; i < wd ; i++ ) {

   pix(x+i,y+j,
    //15 - 
    levels[campos][
      Math.floor(
       clamp(
        f(x+i,y+j),0,1
       )*campos
      )
    ]
   );   
  
  }
 }
 
 // print("Faca debug aqui"");
  
 }
} 

//marching squares fill
function msfill( x , y , wd , hg ) {

 for ( j = 0 ; j < hg ; j+=8 ) {
  for ( i = 0 ; i < wd ; i+=8 ) {

   sprms( x+i , y+j );

  }
 }

}


//marching tiles fill
function mtfill( x , y , wd , hg ) {

 for ( j = 0 ; j < hg ; j+=8 ) {
  for ( i = 0 ; i < wd ; i+=8 ) {

   sprmt( x+i , y+j );

  }
 }

}












state_machine = 0;
cls(0);
var i=0,stop=false,t=0;

var mz = new Maze();
mz.start( 120, 64 );
mz.show();

function TIC() {
 if(!stop){

  if( state_machine == 0 ){
   rect( 16 , 128 , 160 , 8 , 0 );
   print("                    ", 16 , 128 );  
   print("0: 1 2 3 4 5 6 7 8 9", 16 , 128 );
   //print("                    ", 16 , 128 );
   if ( key(27) ){ //0-
    state_machine = 0;
   }
   if ( key(28) ){ //1
    state_machine = 1;
   }
   if ( key(29) ){ //2
    state_machine = 2;
   }
   if ( key(30) ){ //3
    state_machine = 3;
   }
   if ( key(31) ){ //4
    state_machine = 4;
   }
   if ( key(32) ){ //5
    state_machine = 5;
   }
   if ( key(33) ){ //6
    state_machine = 6;
   }
   if ( key(34) ){ //7
    state_machine = 7;
   }
   if ( key(35) ){ //8
    state_machine = 8;
   }   
   if ( key(36) ){ //9
    state_machine = 9;
   }   
   if ( key(48) ){
    state_machine = 99;
    stop = true;
   }
   if( state_machine != 0 ){
    rect( 16 , 128 , 160 , 8 , 0 );   
    print("                    ", 16 , 128 );  
    print("Go to " + state_machine + " . . . . . ", 16 , 128 );
    trace(" 0: " + time());   
    t = time();
   }
  }
 
  if( state_machine == -1 ){
   rect( 16 , 128 , 160 , 8 , 0 );
   print("                    ", 16 , 128 );  
   print("wait 2 sec          ", 16 , 128 );
   var current = time();
   if ( current > (t+2000) ){
    state_machine = 0;
    trace(" -1: " + time());
   }
  }
  
  if( state_machine == -2 ){
   rect( 16 , 128 , 160 , 8 , 0 );
   print("                    ", 16 , 128 );  
   print("wait 0.1 sec          ", 16 , 128 );
   var current = time();
   if ( current > (t+100) ){
    state_machine = 0;
    trace(" -2: " + time());
   }
  }
 
  if( state_machine == 1 ){
   cls(0);
   noisefill( 0 , 0 , 240 , 136 );
   state_machine = -1;
  }

  if( state_machine == 2 ){
   cls(0);  
   noisefill( 0 , 0 , 240 , 136 );
   msfill( 0 , 0 , 240 , 136 );
   state_machine = -1;
  } 

  if( state_machine == 3 ){
   cls(0);
   noisefill( 0 , 0 , 240 , 136 );
   mtfill( 0 , 0 , 240 , 136 );
   state_machine = -1;
  }  

  if( state_machine == 4 ){
   noisefill( 0 , 0 , 240 , 136 );
   rect( 16 , 128 , 160 , 8 , 0 );   
   print("                    ", 16 , 128 );
   print("4: 5", 16 , 128 );
   state_machine = 41;
  }
  if( state_machine == 41 ){
   if ( key(32) ){ //5
    state_machine = 5;
   }
  }
  if( state_machine == 5 ){
   //noisefill( 0 , 0 , 240 , 136 );
   msfill( 0 , 0 , 240 , 136 );
   state_machine = 42;
   rect( 16 , 128 , 160 , 8 , 0 );   
   print("                    ", 16 , 128 );
   print("5: 6", 16 , 128 );
  }  
  if( state_machine == 42 ){
   if ( key(33) ){ //6
    state_machine = 6;
   }
  }  
  if( state_machine == 6 ){
   //noisefill( 0 , 0 , 240 , 136 );
   //msfill( 0 , 0 , 240 , 136 );
   mtfill( 0 , 0 , 240 , 136 );
   state_machine = -1;
  }    
  
  if( state_machine == 7 ){
   //cls(0);
   //trace("limpa a tela");
   //noisefill( 0 , 0 , 240 , 136 );  
   //trace("noisefill");
   while(   
   //trace(" mz.fazburaco()=" + mz.fazburaco() );
      mz.fazburaco()
     ){
   }
   mz.show();
   var startc = mz.limites[ Math.floor( Math.random() *  mz.limites.length ) ];
   mz.start( startc.x , startc.y );
   while(   
   //trace(" mz.fazburaco()=" + mz.fazburaco() );
      mz.fazburaco()
     ){
   }   
   mz.show();   
   
   state_machine = -2;
  }      
  

  if( state_machine == 99 ){
   rect( 16 , 128 , 160 , 8 , 0 );
   print("Pressione espaco para Continuar", 16 , 128);
    if ( key(48) ){
     stop = true;
    }
  }
  
 } else {
// print("Pressione espaco para sair")
// if ( key(48) ){ 
  exit();
// }
 }
}
