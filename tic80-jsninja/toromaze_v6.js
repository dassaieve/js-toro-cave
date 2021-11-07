// title:        Toro Maze
// author:       DcBoo
// Description:  Labirinto num plano/morfologia toroidal
// script: js

/*

#ToroMaze v6 (inclui v5 e v6);
 - Visualizacao em celulas de 2 pixels implementada no objeto, pode ser desacoplado;
  - bitflag: zera colunas;
   - zera colunas se celula faz 4 conexoes (trocar p/ coluna);
  - Melhorias na camera (muitos bugs corrigidos);	
 - Destaque de celulas:
  - maior rota;
  - celulas nos limites;
  - pilha / rota de volta a origem;	
 - Interacao:
  - "Z" faz salas, maior rota /32/16/8/4/2/1;
  - "X" maior rota;
  - "C" celulas vizinhas das nao visitadas;
  - "V" rota de volta a origem (showpilha: destaca o caminho da pilha);
 - Fazer sala:
  - espalha gasolina e queima paredes contiguas;
   - na maior rota;
    - Dividido, progressivamente em grupos de 32 / 16 / 8 / 4 / 2 / 1 rotas;
 - Pedometro: 
  - Mapa que salva o tamanho da pilha no momento em que a celula foi visitada;
     inicia em 0; 
     marca passos p cada beco;	
     compartilha passos nos corredores;	
     divide passos nas bifurcaoes e cruzamentos;
- Multiplos cavadores para reduzir extenso dos corredores sem bifurcacoes;
 - somente 1 cavador;
   contador de tamanho maximo de corredor;
   tamanho maximo de acordo com diagonal do labirinto;				
   zera contador ao criar bifurcaoes;
   estouro do maximo: teleporta cavador para alguma celula nos limites do labirinto;
				
##Bugs:
 - Na visualizacao ha vazamento de escopo de uma funcao em outra;
    provavelmente ser melhor desacoplar visualizacao e criar objeto camera e painel;
 - bitflag: zera colunas;
    zera colunas se celula faz 4 conexoes
    o correto eh verificar se a coluna esta sem 4 paredes;

##Todo:
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
    balanceia pelos becos;
    encontra ponto central;
 - fazer salas:
    becos: dist 3 cel e vira sala 2x2;
    bifurcacoes: dist 2 cel e vira sala 3x2;
    cruzamento: dist 2 cel e vira sala	3x3;
 - bitflag: zera colunas conferindo paredes;
 - fazer visualizadores desacoplados:
    2x2 melhorar;
    3x3 rascunho;
    8x8 simples; 
    8x8 p/ marching squares;


#ToroMaze v4 (inclui v2, v3 e v4);

##Feito:
	- dados desacoplados da tela;
	- Objeto ToroMaze funcional;
	- Visualizacao em celulas de 3 pixels implementada no objeto, pode ser desacoplado;
	 - Visualizao replica tiles no espao disponvel;
	 - Implementado camera;
		- Movimentacao interativa implementada;
		- Sorteio de celulas e ligacoes;

##Bugs:
 - Na visualizacao ha vazamento de escopo de uma funcao em outra;
	- Corredores muito longos sem bifurcacoes;

##Todo:
	- showpilha: destaca o caminho da pilha;
	- multiplos cavadores para reduzir extenso dos corredores sem bifurcacoes;
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
//prng = mulberry32( 0x5EEDF00D+1 );

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
//toro.start( 73, 27 );
//toro.start( 8, 12 );
//toro.start( 110, 41 );
toro.start( 30, 17 );
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

			print( "Width: " + toro.width + "\t Height: " + toro.height + "\t Atual: [" + toro.atual + "]" , 0 , 106);

			s9lx = toro.atual[0];
			s9ly = toro.atual[1];
   print( "Step: " + (toro.smap[s9lx][s9ly]) + " / " + toro.stepmax  , 0 , 114);

			var scrx, scry, scrw, scrh 
			//camx, camy ;
			scrx = 10;
			scry = 10;
			scrw = 220;
			scrh = 82;
   //camx = 0;
   //camy = 0;

   toro.showmaze(  scrx ,  scry ,      scrw ,      scrh, camx , camy );
   //state_machine = -2;
	 }				

  if( state_machine == 9 ){
		
			while (toro.fazburaco()){};
//			toro.fazburaco();
		
		 if ( keyp(58)/*UP*/    ) {
			 toro.atualmove(0); }
		 if ( keyp(59)/*DOWN*/  ) {
			 toro.atualmove(2); }
			if ( keyp(60)/*LEFT*/  ) {
			 toro.atualmove(3); }
			if ( keyp(61)/*RIGHT*/ ) {
			 toro.atualmove(1); }

		 if ( key(23)/*UP*/    ) {
			 camy--; }
		 if ( key(19)/*DOWN*/  ) {
			 camy++; }
			if ( key(01)/*LEFT*/  ) {
			 camx--; }
			if ( key(04)/*RIGHT*/ ) {
			 camx++; }
				
			if ( keyp(26)/*Z*/     ) {
					toro.limpamaxroute();
			 	state_machine = -2;
			}
			
			if ( keyp(24)/*X*/     ) {
					toro.maxrouteon = (toro.maxrouteon)?false:true;
			 	state_machine = -2;
			}

			if ( keyp(3)/*C*/     ) {
					toro.limiteson = (toro.limiteson)?false:true;
			 	state_machine = -2;
			}

			if ( keyp(22)/*V*/     ) {
					toro.backon = (toro.backon)?false:true;
			 	state_machine = -2;
			}
//key and keyp map			
//12345678901234567890123456
//abcdefghijklmnopqrstuvwxyz
			
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
		[0,0,0,0,0];
	this.pilha      = [[0,0]];
	this.wallup		   = 1;
	this.wallright  = 2;
	this.walldown   = 4;
	this.wallleft   = 8;
	this.visited    = 16;
	this.nocols    = 32;
	this.atual      = [0,0];
	this.prng       = prng;
	this.width      = 5;
	this.height     = 5;
	this.cornv      = 15;
	this.corvi      = 0;
	this.corat      = 11;
	this.corwa      = 15;
	this.corvz      = 9;
	this.corro      = 8;
 this.corli						= 6;
	this.corbk      = 14;
	this.smap       = this.cmap.slice();
	this.step							= 0;
	this.stepmax    = 0;
	this.maxroute   = [];
	this.maxrcls    =false;
	this.maxrouteon =false;
	this.limites    = [];
	this.limiteson  =false;
	this.backon     =true;
	
	this.start = function (w,h) {
	 this.width      = w;
	 this.height     = h;
	 this.cmap = [];
	 this.smap = [];
	 hei = [];
	 shei = [];
	 for ( i = 0 ; i < h ; i ++ ){
	   hei.push( 15 );
	   shei.push( 0 );
	 }
	 for ( j = 0 ; j < w ; j ++ ){
	   this.cmap.push ( hei.slice() );
	   this.smap.push ( shei.slice() );
         }
         this.atual = [ Math.floor( prng()*w ), Math.floor( prng()*h ) ];
         this.marcarvisitado( this.atual );
         this.pilha = [this.atual];
	 this.step = this.pilha.length;
	 this.marcarstep( this.atual );
	 this.maxrcls    =false;
	 this.maxrouteon =false;
	 this.corredor = 0;
         this.corrmax  = Math.floor(Math.sqrt(this.width**2 + this.height**2)/4) ;
         this.started = true;
	
	} // fim da function start
	
	this.marcarvisitado = function (vv){
		vx = vv[0];
		vx = ( vx < 0 ) ?
			(vx % this.width) +  this.width : vx ;

		vy = vv[1];
		vy = ( vy < 0 ) ? 
			(vy % this.height) +  this.height : vy ;
		this.cmap[vx][vy] = ((this.cmap[vx][vy]) | this.visited) ;
	} // fim da funcao marcarvisitado
	
	this.marcarstep = function (mv){
		mx = mv[0];
		mx = ( mx < 0 ) ?
			(mx % this.width) +  this.width : mx ;

		my = mv[1];
		my = ( my < 0 ) ? 
			(my % this.height) +  this.height : my ;
		this.smap[mx][my] = this.step ;
//		this.stepmax = (this.step > this.stepmax)?		this.step : this.stepmax ;		
		if ( this.step > this.stepmax ) {
			this.maxroute = this.pilha.slice();
			this.stepmax = this.step;
		}
	} // fim da funcao marcarstep
	
	this.marcarnocols = function(cc){
		var lx = cc[0];
		var ly = cc[1];
		var dir = [[0,0],[0,1],[1,0],[1,1]];
		for( var i=0; i<4 ; i++ ){
		 var x = lx+dir[i][0];
			var y = ly+dir[i][1];
			x = (x<0)?
							(x%this.width)+this.width:
							(x%this.width);
			y = (y<0)?
							(y%this.height)+this.height:
							(y%this.height);
			this.cmap[x][y] |= this.nocols;
		}
		
	}//fim da function marcarnocols
	
	this.checkcols = function(kc) {
	 var c = this.cmap[kc[0]][kc[1]]
		if ( !(c & this.wallup   ) &&
		     !(c & this.wallright) &&
							!(c & this.walldown ) &&
							!(c & this.wallleft ) ){
			this.marcarnocols( kc );			
		}
	}//fim da functin checkcols

	this.showcell = function ( cell , scrx , scry , scrw , scrh , camx , camy ) {
		tc = 2; //tamanho da celula
		x = cell[0]*2-camx;
		y = cell[1]*2-camy;
		c = this.cmap[cell[0]][cell[1]];
		x = (x < 0) ? 
			(x%(this.width*tc))+(this.width*tc) : x%(this.width*tc);
		y = (y < 0) ? 
			(y%(this.height*tc))+(this.height*tc) : y%(this.height*tc);
  x += scrx;
		y += scry;
		
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
		//rectb( x, y, tc, tc, this.corwa );
		pix(x  ,y  , (c & this.nocols   ) ? this.corvi : this.corwa);
		pix(x+1,y+1, (c & this.visited  ) ? this.corvi : this.corwa);
		pix(x+1,y  , (c & this.wallup   ) ? this.corwa : this.corvi);
		//pix(x+2,y+1, (c & this.wallright) ? this.corwa : this.corvi);
		//pix(x+1,y+2, (c & this.walldown ) ? this.corwa : this.corvi);
		pix(x  ,y+1, (c & this.wallleft ) ? this.corwa : this.corvi);
	}// fim da funcao drawcell

	this.showatual = function ( scrx , scry , scrw , scrh , camx , camy ) {
		tc = 2; //tamanho da celula	
  camx = camx % (this.width*tc) ;
		camy = camy % (this.height*tc) ;
	 cell = this.atual;
		x = cell[0]*2-camx+scrx;
		y = cell[1]*2-camy+scry;

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
		if ( 	this.maxrouteon ){
		 this.showmaxroute( scrx , scry , scrw , scrh , camx , camy );
		}
		if ( 	this.limiteson ){
		 this.showlimites( scrx , scry , scrw , scrh , camx , camy );
		}
		if ( 	this.backon ){
		 this.showbacktrack( scrx , scry , scrw , scrh , camx , camy );
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
			//this.conectcells( a , b );
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
  var	tc = 2; //tamanho da celula	
		for (v in viz) {
			vx = viz[v][0]*2-camx+scrx;
			vy = viz[v][1]*2-camy+scry;
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
  
/*	//Limita a extensao dos corredores continuos e faz mais bifurcaoes
			if (this.corredor > this.corrmax ){
   this.conferelimites();
			if ( this.limites.length > 0 ){
			 var mi = Math.floor( 
														 prng()*
															this.limites.length);
				//trace("mi="+mi+" limites.len="+	this.limites.length + ";");
			 var br = this.limites[mi];
				//trace("limites.len="+	this.limites.length + "\n" + 
				//						"limites [ " + this.limites + "]\n " +
				//						"br = [ " + br + "] \n");
			 this.atual[0] = br[0];
			 this.atual[1] =	br[1];
			}
			this.corredor = 0;
		}  // */
		
		var viz = this.getvizinhos();
		var nviz = viz.length;
		
  print("Corredor="+this.corredor+"/"+this.corrmax+" Atual: ["+this.atual+"]", 0, 120);
		if (nviz > 0 ){
		 var dir = Math.floor(prng()*nviz);
			var cellb = viz[dir];
			var bx = cellb[0]; 
			var by = cellb[1];
			this.conectcells( this.atual , cellb );
			this.cmap[bx][by] = this.cmap[bx][by] | this.visited;
		 this.pilha.push( cellb );
			this.checkcols( this.atual );
			this.corredor++;
			this.atual = cellb;
			this.step = this.pilha.length;
			this.marcarstep( this.atual );
			return true;
  } else if ( this.pilha.length > 0 ) {
   this.atual = this.pilha.pop();
			this.corredor = 0;
   return true;
  } else {
   return false;
  }
	}//fim da funcao faz buraco
	
	this.showmaxroute = function ( scrx , scry , scrw , scrh , camx , camy ) {
		tc = 2; //tamanho da celula	
  camx = camx % (this.width*tc) ;
		camy = camy % (this.height*tc) ;
	 cell = this.atual;
		x = cell[0]*2-camx+scrx;
		y = cell[1]*2-camy+scry;

  for (var i=0; i < this.maxroute.length ; i++){
			if ( this.showcell( this.maxroute[i] , scrx , scry , scrw , scrh , camx , camy ) ) {
				//rectb( x, y, tc, tc, this.corro );
				pix(x+1,y+1, this.corro );			
			}
		}
	}// fim da funcao showmaxroute
	
	this.limpamaxflag = 0;
	
	this.limpamaxroute = function() {
	 if (	this.maxrcls ==false ) {
			
			this.limpamaxflag++;

			var f = this.maxroute.length
			var g = [32,16,8,4,2,1];
			var h = g[this.limpamaxflag%g.length];
   var k = Math.floor(f/h);
//			trace(" f"+f+" g"+g+" h"+h+" k"+k);	
			for( var j=0; j < h ; j++ ) {
//			print("212345",0,110);
			 var r = this.maxroute.slice(j*k,(j+1)*k );
//  var r = this.maxroute.slice();				
//			trace(" k="+k+" r:"+r);	
			
				for(var i in r ){
				 var a = r[i].slice();
					var b = a.slice();
					var c = a.slice();
					var d = a.slice();
					var e = a.slice();
					//trace(":a" + a + " b" + b + " c" + c + " d" + d + " e" + e);
					b[1]--; 
					b = this.normalizexy(b);
					c[0]++; 
					c = this.normalizexy(c);
					d[1]++; 
					d = this.normalizexy(d);
					e[0]--; 
					e = this.normalizexy(e);
					//trace(" a" + a + " b" + b + " c" + c + " d" + d + " e" + e);
					//trace(" a" + a + " b" + containsxy(r,b) + " c" + containsxy(r,c) + " d" + containsxy(r,d) + " e" + containsxy(r,e));
					if ( containsxy(r,b) ) {
						this.conectcells( a , b );
					}
					if ( containsxy(r,c) ) {
						this.conectcells( a , c );
					}
					if ( containsxy(r,d) ) {
						this.conectcells( a , d );
					}
					if ( containsxy(r,e) ) {
						this.conectcells( a , e );
					}
	    this.checkcols(a); 
				}
				
			}//for
			//this.maxrcls    =true;
		}
 }//fim da funcao limpamaxroute;
	
	this.normalizexy = function( xy ) {
		var x = xy[0];
		var y = xy[1];
		//trace("x,y" + x + "," + y );
		x = (x<0)?(x%this.width +this.width ):x%this.width;
		y = (y<0)?(y%this.height+this.height):y%this.height;		
		//trace("x,y" + x + "," + y );		
		return [x,y];
	}
	
	this.conferelimites = function (){
	 var w = this.width ;
		var h = this.height;
		var x = 0;
		var y = 0;
		var cmap = this.cmap;
		this.limites = [];
		for ( x=0 ; x < w ; x++ ){
		 for ( y=0 ; y < h ; y++){
			 if ( cmap[x][y] & this.visited ){
				 //foi visitado
					//confere vizinhos nao visitados
					var dir=[[0,-1],[1,0],[0,1],[-1,0]];
					var viz=[];
					var i = 0,vx=0, vy=0;
					for (i=0;i<4;i++){
						vx=x+dir[i][0];
						vy=y+dir[i][1];
						vx=(vx<0)?(w-1):(vx%w);
						vy=(vy<0)?(h-1):(vy%h);
						if ( !(cmap[vx][vy] & this.visited) ){
							this.limites.push( [x,y] );
							break;
						} // if visitado com vizinhos nao visitados
					} // for vizinhos
				} // if else
			} // for y
		} // for x
	} //fim da funcao conferelimites
	
	this.showlimites = function ( scrx , scry , scrw , scrh , camx , camy ) {
		tc = 2; //tamanho da celula	
  camx = camx % (this.width*tc) ;
		camy = camy % (this.height*tc) ;
	 cell = this.atual;
		x = cell[0]*2-camx+scrx;
		y = cell[1]*2-camy+scry;

  for (var i=0; i < this.limites.length ; i++){
			if ( this.showcell( this.limites[i] , scrx , scry , scrw , scrh , camx , camy ) ) {
				//rectb( x, y, tc, tc, this.corro );
				pix(x+1,y+1, this.corli );			
			}
		}
	}// fim da funcao showlimites

	this.showbacktrack = function ( scrx , scry , scrw , scrh , camx , camy ) {
		tc = 2; //tamanho da celula	
  camx = camx % (this.width*tc) ;
		camy = camy % (this.height*tc) ;
	 cell = this.atual;
		x = cell[0]*2-camx+scrx;
		y = cell[1]*2-camy+scry;

  for (var i=0; i < this.pilha.length ; i++){
			if ( this.showcell( this.pilha[i] , scrx , scry , scrw , scrh , camx , camy ) ) {
				//rectb( x, y, tc, tc, this.corro );
				pix(x+1,y+1, this.corbk );			
			}
		}
	}// fim da funcao showbacktrack
	
	
	
		
	return this //fim do objeto ToroMaze
}

function containsxy(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (a[i][0] === obj[0]) {
										if (a[i][1] === obj[1]) {
            return true;
										}		
        }
    }
    return false;
}
