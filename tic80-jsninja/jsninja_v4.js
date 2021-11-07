// script: js
/*

#jsninja v4
##feito:
- Implementada precisao ao aplicar colisao
- Desenhei 4 grupos de tiles para geracao procedural de terreno tipo marching squares ortogonais
- Limitei x e y para funcionar circularmente dentro dos limites (240x8) e (136x8);

##bugs:
- colisao: ao escorregar de um bloco pode-se ficar colado na parede;

##Todo:
- Implementar geracao procedural do mapa com perlin noise ou simplex noise e marching squares;

#jsninja v3
##feito:
- Reposicionei a resolucao do CoyoteJump dentro do player.Update;
- Na colisao player x mapa ao cair o coyote_ct zera
- Retirei codigos comentados desnecessarios

#jsninja v2

##feito:
- Coloquei foco na camera perseguindo em y;

#jsninja v1

##feito:
- animacao do ninja ok para correr, escorregar, pular, cair;
- 3 blocos solidos;
- mapa de colisao reduz x e y para dentro dos (240*8) e (136*8) proporcionando x e y infinitos funcionando com o mapa de colisao;


#para fazer
limitar tx de 0 a 240
limitar ty de 0 a 136
*/

dxlinha = 0    ;
t       = 0    ;
gravity = 0.14 ;
friction= 0.85 ;
floor   = 120  ;
precisao = 4; // 4 e 997 funcionam

var solids = {
 [16]:true,
	[17]:true,
	[18]:true,
	}

function Anim(span,frames,loop){
 this.span=span || 60;
 this.frame=0;
 this.loop= loop || false;
 this.tick=0;
 this.indx=0;
 this.frames=frames || new Array();
 this.ended=false;

 this.Update =  function (ti) {
  if ( (ti >= this.tick) && (this.frames.length > 0)) {
   if (this.loop) {
    this.indx=(this.indx+1)%this.frames.length;
    this.frame=this.frames[this.indx];
    this.ended=false;
   }
   else {
    this.indx= ( this.indx<this.frames.length ? this.indx+1 : this.frames.length )
    this.frame= this.frame[this.indx];
    if (this.indx == this.frames.length) { this.ended=true;}
   }
   this.tick=ti+this.span;
  }
 }

 this.RandomIndx = function () {
  this.indx=math.random(this.frames.lenght);
 }

 this.Reset = function() {
  this.indx=0;
  this.ended=false;
 }
 return this;
}

function Player(x,y) {
	this.x= x || 8;
	this.y= y || 8;
	this.dx= 0;
	this.dy= 0;
	this.maxdx = 2;
	this.maxdy = 4;
	this.acc = 0.25;
	this.flip= 0;
	this.jump= 2.7;
	this.st= new Array();
	this.anim= new Array();
	this.sp= 0;
	this.coyote_tics =8;
	this.coyote_ct =0;
	this.istand  =false;
	this.irun    =false;
	this.ifall   =false; 
	this.islide  =false;
	this.ilanded =false;
	this.iclimb  =false;
	
	//State machine
	this.stId = 0;
	this.st = [
		function () { //st[0] Stand (default)
		},
		function () { //st[1] Run
		},
		function () { //st[2] Jump
		},
		function () { //st[3] Fall
		},
		function () { //st[4] Slide
		},
		function () { //st[5] WallJump
		},
	];

 this.DoMaxDy=function () {
	  // maxdy
		if (Math.abs(this.dy) > this.maxdy) {
			this.dy=(this.dy>0)? this.maxdy: -this.maxdy;
		}
	}

 this.DoMaxDx=function () {
	  // maxdy
		if (Math.abs(this.dx) > this.maxdx) {
			this.dx=(this.dx>0)? this.maxdx: -this.maxdx;
		}
	}

	this.Update=function (){
	 //Physics

  //aplica Gravidade
  this.dy+=gravity;

  //aplica Friccao
		if (Math.abs(this.dx) > 0.1) {
			this.dx*=friction;
		}
		else {
			this.dx=0;
		}

		//controls	

		this.irun=false;
		//Left
		if (btn(2)) {
			this.dx-=this.acc;
			this.irun=true;
		}

		//Right
		else if (btn(3)) { 
			this.dx+=this.acc;
			this.irun=true;
		}
		
		if (btnp(4)) { //asa 
			if (this.ilanded ) {
				this.dy=-this.jump;
				this.ilanded = false;
			}
		}
  this.CoyoteUpdate();

  this.DoMaxDy();
	 this.DoMaxDx();

		//Aplicar dx e dy somente depois da colisao
	} //Fim da funcao Update


 this.CoyoteUpdate = function () {
		//coyote jump
		if (this.dy>0.01) {
			if ( this.ilanded
				&& (this.coyote_ct < this.coyote_tics)
				) 
				{ this.coyote_ct ++}
				else {
				 this.ilanded=false;
					this.coyote_ct=0;
				}
		}		
	}	

	this.Animate = function () {

		if (this.dx!=0) {
			this.flip = ( this.dx > 0 ) ? 0 : 1 ;
		}

	if (this.ilanded){
			if (this.irun){
				this.anim.run.Update(t);
				this.sp=  this.anim.run.frame;
			}
			else if (this.dx != 0) {
				this.anim.slide.Update(t);
				this.sp=  this.anim.slide.frame;
			}
			else {
				this.anim.stand.Update(t);
				this.sp=  this.anim.stand.frame;
			}
			
		}
		else if ( this.dy > 0) {
				this.anim.fall.Update(t);
				this.sp=  this.anim.fall.frame;
		} 
		else {
				this.anim.jump.Update(t);
				this.sp=  this.anim.jump.frame;		
		}
	}

	return this
}


cam = {
	mapx:0,
	mapy:0,
	tilw:30,
	tilh:17,
	scrx:0,
	scry:0,
	curx:0,
	cury:0,
	focx:112, //de 0 a 30*8
	focy:(10*8),    //de 0 a 17*8
}

player = new Player(0,0);
	player.anim.stand  = new Anim(30,[1,2],true);
	player.anim.run    = new Anim(6,[3,4,5,6],true);
	player.anim.jump   = new Anim(60,[7],true);
	player.anim.fall   = new Anim(60,[8],true);
	player.anim.slide  = new Anim(60,[9],true);

function px2cel(px) {
	return Math.floor(px/8);
}

function solid(x,y) {
 x = (x % (240*8)); // permite abs(tx) > 240
	y = (y % (136*8)); // permite abs(ty) > 136
	if (x <0) {x=(240*8)+x}
	if (y <0) {y=(136*8)+y}
 x=px2cel(x);
	y=px2cel(y);
	//trace("mget " + x + " , " + y );
 return solids[mget(x,y)];
}

function colidePlayerMap(){

 //MAP colision
	
	//LEFT will collide?
	if ( solid(player.x+player.dx+1,player.y+player.dy+0)
  ||  solid(player.x+player.dx+1,player.y+player.dy+7)
  )
		{ //LEFT
		player.dx = 0;
	}
	
	//RIGHT
	if ( solid(player.x+player.dx+6,player.y+player.dy+0)
  ||  solid(player.x+player.dx+6,player.y+player.dy+7) 
		)		
		{
		player.dx = 0;
 }
			
	//DOWN
	if (solid(player.x+player.dx+2 ,player.y+player.dy+8)
  || solid(player.x+player.dx+5 ,player.y+player.dy+8) 
		){

		player.dy= Math.floor( player.dy * precisao  );
		player.dy-=((player.y * precisao +player.dy-0)%(8*precisao));
		player.dy/= precisao;
		//player.dy-=((player.y + player.dy-0)%8);

		player.ilanded = true;
		player.coyote_ct=0;
	} 
	
	//UP
	if (solid(player.x+player.dx+2,player.y+player.dy-0)
  || solid(player.x+player.dx+5,player.y+player.dy-0) 
		){
				player.dy= Math.floor( player.dy * precisao  );
				player.dy+=8*precisao-((player.y * precisao +player.dy-0)%(8*precisao));
				player.dy/= precisao;
		//player.dy+=8-((player.y+player.dy-0)%8)
	}
}



function TIC(){

	player.Update(t);
	//player.CoyoteUpdate();	
	colidePlayerMap();

	player.y+=player.dy;
	player.x+=player.dx;
	
	if (player.x < 0 ) { player.x += (8 * 240) };
	if (player.x > (8*240) ) { player.x = player.x % (8 * 240) };

	if (player.y < 0 ) { player.y += (8 * 136) };
	if (player.y > (8*136) ) { player.y = player.y % (8 * 136) };

	cls(8); // limpa a tela

cam.mapx= px2cel(player.x-cam.focx);
cam.scrx= (player.x<0)? -(8+player.x%8) : -(player.x%8);

cam.mapy= px2cel(player.y-cam.focy);
cam.scry= (player.y<0)? -(8+player.y%8) : -(player.y%8);


	map(cam.mapx,   
					cam.mapy,
	    cam.tilw+1,
					cam.tilh,
					cam.scrx,
					cam.scry, 0);  //Desenha o cenario/mapa

	player.Animate();  //Desenha player

	spr( player.sp, player.x-(cam.mapx*8)+cam.scrx  , player.y-(cam.mapy*8)+cam.scry, 12, 1, player.flip );
	
 print(" px:" +  (player.x|0) + " tx:" +	px2cel(player.x) + 
	    " py:" +  (player.y|0) + " ty:" + px2cel(player.y) + 
	    " dx:" +  (player.dx)+ " dx\':" + dxlinha + 
					"\n coytics:" + player.coyote_ct +" / " + player.coyote_tics +
					"\n cam.mapx:" + cam.mapx + " cam.scrx:" + cam.scrx +
					" ." );
	
 t= t+1;
}

