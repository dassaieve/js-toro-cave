// title:        Toro Maze
// author:       DcBoo
// Description:  Labirinto num plano/morfologia toroidal
// script: js

/*

#ToroMaze v4 (inclui v2, v3 e v4);

##Feito:
	- dados desacoplados da tela;
	- Objeto ToroMaze funcional;
	- Visualizao em celulas de 3 pixels implementada no objeto, pode ser desacoplado;
	 - Visualizao replica tiles no espao disponvel;
	 - Implementado camera;
		- Movimentacao interativa implementada;
		- Sorteio de celulas e ligacoes;

##Bugs:
 - Na visualizacao ha vazamento de escopo de uma funcao em outra;

##Todo:
	- showpilha: destaca o caminho da pilha;
	- analisacell: 
				beco: 1 ligacao, 
				corredor: 2 ligacao, 
				bifurcacao: 3 ligaao, 
				cruzamento: 4 ligacao;
	- temperatura: 
				beco frio; 
				corredor normal; 
				bifurcacao quente; 
				cruzamento muito quente;
	- pedometro: 
				inicia em 0; 
				marca passos p cada beco;
				compartilha passos nos corredores;
				divide passos nas bifurcaoes e cruzamentos;
				balanceia pelos becos;
				encontra ponto central;
	- fazer salas:
				becos: dist 3 cel e vira sala 2x2;
				bifurcacoes: dist 2 cel e vira sala 3x2;
				cruzamento: dist 2 cel e vira sala	3x3;
				bitflag: zera colunas;
				espalha gasolina e queima paredes contiguas;


#ToroMaze v1

##Feito:
- Agora maze ocupa retangulo
 - Eliminado a array de limites
	- Eliminado a tagcolor
	- Nao usa noisepix
- Eliminado MarchingSquares
- Copiados tiles do personagem
- Copiados 6 conjuntos de tiles p maze


##Bugs:
- soh tenho o maze normal dentro do retangulo;
- maze depende de variaveis do ambiente, falta desacoplar;
- estrutura de dados baseada em tiles de 8 pixels


##Todo:
- Desacoplar dados do map ou tela;
- Fazer classe ToroMaze;


*/

tilwidth  = 30;
tilheight = 17;
mapwidth  = 240;
mapheight = 136;
scrwidth  = 160;
scrheight = 80;

prng = mulberry32( tstamp() );

mt1 = [160,161,162,163,164,165,166,167,168,169,170,171,172,173,174,175];
mt2 = [176,177,178,179,180,181,182,183,184,185,186,187,188,189,190,191];
mt3 = [192,193,194,195,196,197,198,199,200,201,202,203,204,205,206,207];
mt4 = [208,209,210,211,212,213,214,215,216,217,218,219,220,221,222,223];
mt5 = [224,225,226,227,228,229,230,231,232,233,234,235,236,237,238,239];
mt6 = [240,241,242,243,244,245,246,247,248,249,250,251,252,253,254,255];

var  levels = {		
	 2 :	[0 , 15],
	 3 :	[0 , 8, 15], 
	 4 :	[0 , 5, 10, 15] ,
	 5 :	[0 , 4, 8, 12, 15],
	 6 :	[0 , 3, 6, 9, 12, 15],
	 7 :	[0 , 2, 5, 7, 10, 12, 15],
	 8 :	[0 , 2, 4, 6, 8, 11, 13, 15],
	 9 :	[0 , 2, 4, 6, 8, 9, 11, 13, 15],
	10 :	[0 , 1, 2, 4, 6, 8, 9, 11, 13, 15],
	11 :	[0 , 1, 2, 4, 6, 8, 9, 11, 13, 14, 15], 
	12 :	[0 , 1, 2, 4, 6, 8, 9, 10, 11, 13, 14, 15],
	13 :	[0 , 1, 2, 4, 5, 6, 8, 9, 10, 11, 13, 14, 15],
	14 :	[0 , 1, 2, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15],
	15 :	[0 , 1, 2, 3, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15],
	16 :	[0 , 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
};

function mulberry32(a) {
	return function() {
  a |= 0; a = a + 0x6D2B79F5 | 0;
  var t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
	}
}//fim da funcao mulberry32(a);

function bmaskon(c,m){return c|m;}
function bmaskoff(c,m){return c&(~m);}
function bmasktoggle(c,m){return c^m;}

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
	a:500+(prng()*1e4),//500 + r*10000
	fx:500+(prng()*1e4),
	fy:500+(prng()*1e4),
	px:prng()-.5,
	py:prng()-.5
}

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

function sprmt( x , y ){
	p1 = pix( x + 4 , y     )/15; //10h
	p2 = pix( x + 8 , y + 4 )/15; //2h
	p3 = pix( x + 4 , y + 8 )/15; //4h
	p4 = pix( x     , y + 4 )/15; //8h	
	v = 0;
	v += ( (p1 < 0.38) || (p1 > 0.62) ) ? 1 : 0 ;
	v += ( (p2 < 0.38) || (p2 > 0.62) ) ? 2 : 0 ;
	v += ( (p3 < 0.38) || (p3 > 0.62) ) ? 4 : 0 ;
	v += ( (p4 < 0.38) || (p4 > 0.62) ) ? 8 : 0 ;
	t = f( x+2000 , y+2000 );	
	if ( t < 0.33 ) {
		spr(	mt1[v] , x , y , -1 , 1 , 0, 0 , 1,1);
	} else if ( t < 0.66 ) {
		spr(	mt5[v] , x , y , -1 , 1 , 0, 0 , 1,1);
	}	else {
		spr(	mt6[v] , x , y , -1 , 1 , 0, 0 , 1,1);	
	}
}//fim da funcao sprmt(x,y);

function Cell(x,y){
	this.x = x;
	this.y = y;
	this.walls = [true,true,true,true]; // up right down left
	
	this.show = function() {
	 rect( x, y, 8, 8, 0 );
	 if (this.walls[0]) { line( x   , y   , x+8 , y   , 15 ); }
			else{line( x+1   , y   , x+7 , y   , 7 );}
	 if (this.walls[1]) { line( x+8 , y   , x+8 , y+8 , 15 ); }		
			else{line( x+8 , y+1   , x+8 , y+7 , 7 );}		
	 if (this.walls[2]) { line( x   , y+8 , x+8 , y+8 , 15 ); }
			else{line( x+1   , y+8 , x+7 , y+8 , 7 );}		
	 if (this.walls[3]) { line( x   , y   , x   , y+8 , 15 ); }
			else{line( x   , y+1   , x   , y+7 , 7 ); }
		rect( x+1, y+1, 7, 7, 7 );
	}//fim da function show
	
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
	
//	return this;
}//fim do Objeto Cell(x,y);


function Maze() {

	this.startcell = new Cell(0,0);
	this.pilha = [];
	this.cells = [];
	this.started = false;
	this.atual = this.startcell ;
	this.vizinhos = [];
	this.visitado = [];
	
 this.start = function ( x , y ) {
  this.startcell = new Cell( Math.floor(x-(x%8)) , Math.floor(y-(y%8)) );
		this.cells.push(this.startcell);
		this.pilha.push(this.startcell);
		this.atual = this.startcell ;
		for ( j = 0 ; j < scrheight ; j+=8 ) {
		 for ( i = 0 ; i < scrwidth ; i+=8 ) {
		  this.visitado.push(false);
	  }
  }
		this.marcarvisitado( x , y );
	 this.started = true;
	}//fim da funcao start

 this.show = function() {
	 var i,j,c,l;
		c = this.cells.length;
		for( i = 0 ; i < c ; i ++ ) {
		 this.cells[i].show();
		}
		rect( this.atual.x+2 , this.atual.y+2 , 5 , 5 , 15 );
	}//fim da funcao show
	
	this.foivisitado = function( x , y ) {
	 if ( x > scrwidth || y > scrheight || x < 0 || y < 0 ) {
		 return true;
		}
		var i = Math.floor(x/8);
		var j = Math.floor(y/8);
		return this.visitado[ (j*Math.floor(scrwidth/8))+i ];
	}// fim da funcao foivisitado

	this.marcarvisitado = function( x , y ) {	
	 if ( x > scrwidth || y > scrheight || x < 0 || y < 0 ) {
		 return true;
		}	
		var i = Math.floor (x/8);
		var j = Math.floor (y/8);
		this.visitado[ (j*Math.floor(scrwidth/8))+i ] = true ;
	}// fim da funcao marcavisitado	

 this.fazburaco = function(){
  this.vizinhos = this.getvizinhos();
		//trace("this.vizinhos.length = " + this.vizinhos.length);
		var nviz = this.vizinhos.length;
		var novacell , dir ;
  if ( nviz > 0 ) {
			dir = Math.floor(prng()*nviz);
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
//				 if ( ! this.foivisitado( x-(x%8),y-(y%8))){
// 				 vizinhos.push( [x-(x%8),y-(y%8)] );
//					}
					if ( ! this.foivisitado( x,y) ){
 				 vizinhos.push( [x-(x%8),y-(y%8)] );
					}

			}
			return vizinhos;
		} else {
		 return [] ;
		}
	}// fim da funcao getvizinhos

//	return this;
}//Fim do Objeto Maze();

function noisepix( x , y , campos ) {
 return				levels[campos][
						Math.floor(
							clamp(
								f(x,y),0,1
							)*campos
						)
				];		 
}

function noisefill( x , y , wd , hg ) {
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
	//	print("Faca debug aqui"");
	}
} // fim da function noisefill


//marching tiles fill
function mtfill( x , y , wd , hg ) {
 for ( j = 0 ; j < hg ; j+=8 ) {
	 for ( i = 0 ; i < wd ; i+=8 ) {
   sprmt( x+i , y+j );
  }
 }
}// fim da function mtfill( x , y , wd , hg )



t_0 = time();

state_machine = 0;
cls(0);
var i=0,stop=false,t=0;

var mz = new Maze();
mz.start( 120, 64 );
mz.show();

var toro = ToroMaze();
toro.start( 73, 27 );
camx = 0;
camy = 0;
scrx = 7;
scry = 7;


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
			mtfill( 0 , 0 , 240 , 136 );
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
			mtfill( 0 , 0 , 240 , 136 );
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
		 cls(0);
		//trace("limpa a tela");
		 //noisefill( 0 , 0 , 240 , 136 );		
			//trace("noisefill");
	  while(   
			//trace(" mz.fazburaco()=" + mz.fazburaco() );
      mz.fazburaco()
				 ){			}
			mz.show();

			rectb( 0, 0, scrwidth+1 , scrheight+1, 14);
//			rectb( 1, 1, scrwidth-1 , scrheight-1, 14);
//			rectb( 2, 2, scrwidth-3 , scrheight-3, 14);
			
		 print( mz.visitado , 16 , 104 );
			print( mz.atual.x + "," + mz.atual.y , 16 , 112 );
			print( mz.vizinhos , 16 , 120 );
			
						
			state_machine = -2;
	 }						
		
		if( state_machine == 8 ){
			mz.show();
			mtfill( 0 , 0 , 240 , 136 );
			state_machine = -1;
	 }				

		if( state_machine == 9 ){
			cls();
			print( "Width(x3): " + toro.width + "\t Height(x3): " + toro.height + "\t Atual: [" + toro.atual + "]" , 0 , 90);

//			camx += 1;
//			camy += 1;
			a = 0;
//			toro.randomconection();
/*   
			toro.showcell([ 0, 0] , scrx , scry ,  toro.width*18+a , toro.height*10+a , camx , camy );
			toro.showcell([ 1, 1] , scrx , scry ,  toro.width*18+a , toro.height*10+a , camx , camy );
			toro.showcell([ 2, 2] , scrx , scry ,  toro.width*18+a , toro.height*10+a , camx , camy );
			toro.showcell([ 3, 3] , scrx , scry ,  toro.width*18+a , toro.height*10+a , camx , camy );
			toro.showcell([ 4, 4] , scrx , scry ,  toro.width*18+a , toro.height*10+a , camx , camy );
   toro.showcell([ 5, 5] , scrx , scry ,  toro.width*18+a , toro.height*10+a , camx , camy );
			toro.showcell([ 6, 6] , scrx , scry ,  toro.width*18+a , toro.height*10+a , camx , camy );
			toro.showcell([ 7, 7] , scrx , scry ,  toro.width*18+a , toro.height*10+a , camx , camy );
		 toro.showatual(         scrx , scry ,  toro.width*18+a , toro.height*10+a , camx , camy );
*/			

			var scrx, scry, scrw, scrh, camx, camy ;
			scrx = 10;
			scry = 10;
			scrw = 220;
			scrh = 82;
   camx = 0;
   camy = 0;

   rectb(        scrx-1 , scry-1,  scrw+4+a , scrh+4+a , 8);			
   toro.showmaze(  scrx ,  scry ,      scrw ,      scrh, camx , camy );
			toro.showvizinhos( scrx ,  scry ,      scrw ,      scrh, camx , camy );

//			state_machine = -2;
	 }				

  if( state_machine == 9 ){
		
			toro.fazburaco();
		
		 if ( keyp(58)/*UP*/    ) {
			 toro.atualmove(0); }
		 if ( keyp(59)/*DOWN*/  ) {
			 toro.atualmove(2); }
			if ( keyp(60)/*LEFT*/  ) {
			 toro.atualmove(3); }
			if ( keyp(61)/*RIGHT*/ ) {
			 toro.atualmove(1); }
				
			if ( keyp(26)/*Z*/     ) {
			 	state_machine = -2;
			}
			
	 	state_machine = -3;
			//t = time();
		}

  if( state_machine == -3 ){
		 var current = time();
	 	if ( current > (t+100) ){
	   state_machine = 9;
			}
		}
		
		

  if( state_machine == 99 ){
		 rect( 16 , 128 , 160 , 8 , 0 );
   print("Pressione espaco para Continuar", 16 , 128);
    if ( key(48) ){
					stop = true;
				}
		}
		
 } else {
//	print("Pressione espaco para sair")
// if ( key(48) ){	
		exit();
//	}
 }
}

function ToroMaze() {
	this.started = false;
	this.cmap = [0,0,0,0,0],
													[0,0,0,0,0],
													[0,0,0,0,0],
													[0,0,0,0,0],
													[0,0,0,0,0]													;
	this.pilha      = [[0,0]];
	this.wallup		   = 1;
	this.wallright  = 2;
	this.walldown   = 4;
	this.wallleft   = 8;
	this.visited    = 16;
	this.atual      = [0,0];
	this.prng       = prng;
	this.width      = 5;
	this.height     = 5;
	this.cornv      = 15;
	this.corvi      = 0;
	this.corat      = 11;
	this.corwa      = 15;
	this.corvz      = 9;
	
	this.start = function (w,h) {
		this.width      = w;
		this.height     = h;
	 this.cmap = [];
  hei = [];
		for ( i = 0 ; i < h ; i ++ ){
			hei.push( 15 );
		}
		for ( j = 0 ; j < w ; j ++ ){
			this.cmap.push ( hei.slice() );
		}
		this.atual = [ Math.floor( prng()*w ) , 
																	Math.floor( prng()*h ) ];
//		this.atual = [ 0 ,	0];
		this.marcarvisitado( this.atual );
		this.pilha = [this.atual];
		this.started = true;
	} // fim da function start
	
	this.marcarvisitado = function (v){
		x = v[0];
		x = ( x > ( this.width - 1 ) ) ?
			x % this.width : x ;
		x = ( x < 0 ) ?
			(x % this.width) +  this.width : x ;

		y = v[1];
		y = ( y > ( this.height - 1 ) ) ? 
			y % this.height : y ;
		y = ( y < 0 ) ? 
			(y % this.height) +  this.height : y ;
		this.cmap[x][y] = ((this.cmap[x][y]) | this.visited) ;
	} // fim da funcao marcarvisitado

	this.showcell = function ( cell , scrx , scry , scrw , scrh , camx , camy ) {
		tc = 3; //tamanho da celula
		x = cell[0]*3-camx+scrx;
		y = cell[1]*3-camy+scry;
		c = this.cmap[cell[0]][cell[1]];

  x = (x > this.width*tc)?
			(x%(this.width*tc)) : x;
		x = (x < scrx) ? 
			(x%(this.width*tc))+(this.width*tc) : x;

  y = (y > this.height*tc)?
			(y%(this.height*tc)) : y;
		y = (y < scry) ? 
			(y%(this.height*tc))+(this.height*tc) : y;

		
		if ( x < scrx + scrw ) {
			if ( x >= scrx       ) {
			 if ( y < scry + scrh ) {
				 if ( y >= scry       ) {
						for( var i=0;  x + this.width*tc*i < scrx + scrw ; i++ ) {
							for( var j=0; y + this.height*tc*j < scry + scrh ; j++ ) {
								this.drawcell( x + this.width*tc*i  , y+this.height*tc*j , tc, c );
							}
						}
						return true;
					}
			 }
			}
		}
		return false;
	}// fim da funcao showcell

 this.drawcell = function( x, y, tc, c ){
		rectb( x, y, tc, tc, this.corwa );
		pix(x+1,y+1, (c & this.visited  ) ? this.corvi : this.cornv);
		pix(x+1,y  , (c & this.wallup   ) ? this.corwa : this.corvi);
		pix(x+2,y+1, (c & this.wallright) ? this.corwa : this.corvi);
		pix(x+1,y+2, (c & this.walldown ) ? this.corwa : this.corvi);
		pix(x  ,y+1, (c & this.wallleft ) ? this.corwa : this.corvi);
	}// fim da funcao drawcell

	this.showatual = function ( scrx , scry , scrw , scrh , camx , camy ) {
  camx = camx % (this.width*tc) ;
		camy = camy % (this.height*tc) ;

		tc = 3; //tamanho da celula	
	 cell = this.atual;
		x = cell[0]*3-camx+scrx;
		y = cell[1]*3-camy+scry;

	 if ( this.showcell( cell , scrx , scry , scrw , scrh , camx , camy ) ) {
			rectb( x, y, tc, tc, this.corat );
			//pix(x+1,y+1, this.corat );			
		}
		print("atual x, y = " + x + ", " + y , 0, 98);
		print("camx, camy = "+ camx + ", " + camy );
	}// fim da funcao showatual

	this.showmaze = function( scrx , scry , scrw , scrh , camx , camy ) {
		for(var jh=0; jh<this.height ; jh++){
		 for(var iw=0; iw<this.width  ; iw++){
    this.showcell( [iw,jh] , scrx , scry , scrw , scrh , camx , camy );
			}
		}	
		this.showatual(            scrx , scry , scrw , scrh , camx , camy );
	}// fim da funcao showmaze

 this.conectcells = function( ca , cb ){
	 if ( ca[0]==cb[0] ){ //mesma coluna
		 switch(ca[1]-cb[1]){
			 case ( 1): // ca embaixo de cb
				case (1-this.height): // ca embaixo de cb na margem do toro
					this.cmap[cb[0]][cb[1]] = this.cmap[cb[0]][cb[1]] & (~this.walldown) ;
				 this.cmap[ca[0]][ca[1]] = this.cmap[ca[0]][ca[1]] & (~this.wallup  ) ;					
				 break;
				case (-1): // ca emcima de cb
				case (this.height-1): // ca emcima de cb na margem do toro
				 this.cmap[ca[0]][ca[1]] = this.cmap[ca[0]][ca[1]] & (~this.walldown) ;
					this.cmap[cb[0]][cb[1]] = this.cmap[cb[0]][cb[1]] & (~this.wallup  ) ;
			  break;
				default:
			}
		}else if(ca[1]==cb[1]){//mesma linha
		 switch(ca[0]-cb[0]){
			 case ( 1): // ca a direita de cb
				case (1-this.width): // ca s direita de na margem do toro
					this.cmap[cb[0]][cb[1]] = this.cmap[cb[0]][cb[1]] & (~this.wallright) ;
				 this.cmap[ca[0]][ca[1]] = this.cmap[ca[0]][ca[1]] & (~this.wallleft ) ;					
				 break;
				case (-1): // ca a esquerda de cb
				case (this.width-1): // ca a esquerda de cb na margem do toro
				 this.cmap[ca[0]][ca[1]] = this.cmap[ca[0]][ca[1]] & (~this.wallright) ;
					this.cmap[cb[0]][cb[1]] = this.cmap[cb[0]][cb[1]] & (~this.wallleft ) ;
			  break;
				default:
			}
		}//nao ha linhas ou colunas em commum;
	}//fim da function conectcells 
	
	this.randomconection = function(){
		var px = Math.floor( prng()*this.width ); 
		var py =	Math.floor( prng()*this.height );
  
		var a , b ;
		a = [px,py];

		if ( 0==(this.cmap[px][py] & this.visited) ){
//		if ( true  ){
   var dir = Math.floor( prng()*4);
			switch(dir){
				case 0 : // cima
				 b = [   px,
					    (py==0)? this.height-1 : py-1 ];
					break;			
				case 1 : // direita
				 b = [ (px+1)%this.width, 
									py  ];
					break;			
				case 2 : // baixo
				 b = [  px,
								 (py+1)%this.height ];
					break;			
				case 3 : // esquerda
				 b = [ (px==0)? (this.width-1) : px-1, 
									py  ];				
					break;
				default:
			}
   this.cmap[px][py] = this.cmap[px][py] | this.visited;
			this.cmap[b[0]][b[1]] = this.cmap[b[0]][b[1]] | this.visited;
			this.conectcells( a , b );
  }
	}//fim da funcao randomconection
	
	this.atualmove = function(dir){
		var px = this.atual[0];
		var py =	this.atual[1];
  
		var a , b ;
		a = [px,py];

		if ( true  ){
			switch(dir){
				case 0 : // cima
				 b = [   px,
					    (py==0)? this.height-1 : py-1 ];
					break;			
				case 1 : // direita
				 b = [ (px+1)%this.width, 
									py  ];
					break;			
				case 2 : // baixo
				 b = [  px,
								 (py+1)%this.height ];
					break;			
				case 3 : // esquerda
				 b = [ (px==0)? (this.width-1) : px-1, 
									py  ];				
					break;
				default:
			}
   this.cmap[px][py]     =  this.cmap[px][py]     | this.visited;
			this.cmap[b[0]][b[1]] =  this.cmap[b[0]][b[1]] | this.visited;
			this.conectcells( a , b );
			this.atual = b ;
  }
	}//fim da funcao atualmove
	
 this.getvizinhos = function(){
		//var acima, direita, baixo, esquerda;
		var dir=[[0,-1],[1,0],[0,1],[-1,0]];
		var viz=[];
		var i = 0,x=0, y=0;
		for (i=0;i<4;i++){
			x=this.atual[0]+dir[i][0];
			y=this.atual[1]+dir[i][1];
			x=(x<0)?(this.width-1):(x%this.width);
			y=(y<0)?(this.height-1):(y%this.height);
			if ( 0==(this.cmap[x][y] & this.visited)  ){
				viz.push( [x,y] );
			}
		}
		//print( viz , 0 , 120 );
		return viz
	}//fim da funcao getvizinhos
	
	this.showvizinhos = function( scrx , scry , scrw , scrh , camx , camy ){
	 var viz = this.getvizinhos();
		var v;
  var	tc = 3; //tamanho da celula	
		for (v in viz) {
			vx = viz[v][0]*3-camx+scrx;
			vy = viz[v][1]*3-camy+scry;
		 if ( this.showcell( cell , scrx , scry , scrw , scrh , camx , camy ) ) {
				//rectb( x, y, tc, tc, this.corat );
				pix( vx     , vy     , this.corvz);
				pix( vx+tc-1, vy     , this.corvz);
				pix( vx+tc-1, vy+tc-1, this.corvz);
				pix( vx     , vy+tc-1, this.corvz);
			}
		} 
		return viz;
	}//fim da funcao showvizinhos
	
	this.fazburaco = function(){
		var viz = this.getvizinhos();
		var nviz = viz.length;
		if (nviz > 0){
		 var dir = Math.floor(prng()*nviz);
			var cellb = viz[dir];
			var bx = cellb[0]; 
			var by = cellb[1];
			this.conectcells( this.atual , cellb );
			this.cmap[bx][by] = this.cmap[bx][by] | this.visited;
		 this.pilha.push( cellb );
			this.atual = cellb;
			return true;
  } else if ( this.pilha.length > 0 ) {
   this.atual = this.pilha.pop();
   return true;
  } else {
   return false;
  }
	}//fim da funcao faz buraco
	
	
	return this //fim do objeto ToroMaze
}
