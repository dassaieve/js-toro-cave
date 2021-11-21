
isWallup = 1;
isWallright = 2;
isWalldown = 4;
isWallleft = 8;
isColumns = 16;
isVisited = 32;

//prng = mulberry32( tstamp() );
prng = mulberry32( 0x5EEDF00D+1 );
for (let i = 0 ; i <  500 ; i++) { prng() };

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

class ToroMaze { //ToroGraph
    constructor() {
        this.cmap = [[31, 31, 31, 31, 31],
        [31, 31, 31, 31, 31],
        [31, 31, 31, 31, 31],
        [31, 31, 31, 31, 31],
        [31, 31, 31, 31, 31]]
        this.width = 5;
        this.height = 5;
    }

    getCell(x,y) {         
        return new MazeCell( x, y, this);  }
    getCellup(x,y) {      y = (y-1 < 0) ? this.height-1 : (y-1) % this.height;
        return new MazeCell( x, y, this);  }
    getCellright(x,y) {   x = (x+1 < 0) ? this.width-1 : (x+1) % this.width;
        return new MazeCell( x, y, this);  }
    getCelldown(x,y) {    y = (y+1 < 0) ? this.height-1 : (y+1) % this.height;
        return new MazeCell( x, y, this);  }
    getCellleft(x,y) {    x = (x-1 < 0) ? this.width-1 : (x-1) % this.width;
        return new MazeCell( x, y, this);  }

    restart( w = 5 , h = 5){
        this.width      = w;
        this.height     = h;
        this.cmap = [];
        let i, j;
        let hei = [];
        for ( i = 0 ; i < h ; i ++ ){
          hei.push( isWallup + isWallright + isWalldown + isWallleft + isColumns );
        }
        for ( j = 0 ; j < w ; j ++ ){
          this.cmap.push ( hei.slice() );
        }
    }

    digRandom(){
        let i , j;
        let h = this.height;
        let w = this.width;

        for( j=0 ; j < h ; j++ ) {
            for ( i=0 ; i < w ; i++) {
                switch ( Math.floor( prng()*4 ) ) {
                    case 0: this.getCell(i,j).unirCellup(); break;
                    case 1: this.getCell(i,j).unirCellright(); break;
                    case 2: this.getCell(i,j).unirCelldown(); break;
                    case 3: this.getCell(i,j).unirCellleft(); break;
                    default: break;
                }
            }
        }
    }

    digRandomLess(p=1){
        let i , j;
        let h = this.height;
        let w = this.width;

        for( j=0 ; j < h ; j+=p ) {
            for ( i=0 ; i < w ; i+=p) {
                switch ( Math.floor( prng()*4 ) ) {
                    case 0: this.getCell(i,j).unirCellup(); break;
                    case 1: this.getCell(i,j).unirCellright(); break;
                    case 2: this.getCell(i,j).unirCelldown(); break;
                    case 3: this.getCell(i,j).unirCellleft(); break;
                    default: break;
                }
            }
        }
    }

    checkCols(){
        let i , j;
        let h = this.height;
        let w = this.width;

        for( j=0 ; j < h ; j++ ) {
            for ( i=0 ; i < w ; i++) {
                let c = this.getCell(i,j);
                let wu = c.isWallup();
                let wl = c.isWallleft();
                let wul = c.getCellup().isWallleft();
                let wlu = c.getCellleft().isWallup();
                c.setColumns( wu || wl || wul || wlu );
            }
        }

    }

    unirCells( a , b ){
        if ( a.x == b.x ) {
            if      ( a.getCellup().y == b.y )   { a.unirCellup()    ; return true;}
            else if ( a.getCelldown().y == b.y ) { a.unirCelldown()  ; return true;}
        } else if ( a.y == b.y ) {
            if      ( a.getCellright().x == b.x ) { a.unirCellright(); return true;}
            else if ( a.getCellleft().x == b.x )  { a.unirCellleft() ; return true;}
        }
        return false;
    }

    getVisitedBorder(){
        let i , j;
        let h = this.height;
        let w = this.width;
        let vis = [];

        for( j=0 ; j < h ; j++ ) {
            for ( i=0 ; i < w ; i++) {
                let c = this.getCell(i,j);
                if ( c.isVisited() ){
                    if ( 
                        !c.getCellup().isVisited()    ||
                        !c.getCellright().isVisited() ||
                        !c.getCelldown().isVisited()  ||                        
                        !c.getCellleft().isVisited()
                        ) {
                        vis.push( c );
                    }
                }
            }
        }
        return vis;
    }//fim de getVisitedBorder

    getUnvisitedBorder(){
        let i , j;
        let h = this.height;
        let w = this.width;
        let vis = [];

        for( j=0 ; j < h ; j++ ) {
            for ( i=0 ; i < w ; i++) {
                let c = this.getCell(i,j);
                if ( !c.isVisited() ){
                    if ( 
                        c.getCellup().isVisited()    ||
                        c.getCellright().isVisited() ||
                        c.getCelldown().isVisited()  ||                        
                        c.getCellleft().isVisited()
                        ) {
                        vis.push( c );
                    }
                }
            }
        }
        return vis;        
    }//fim de getUnvisitedBorder


    setVisited( on ){
        let i , j;
        let h = this.height;
        let w = this.width;
        let vis = [];

        for( j=0 ; j < h ; j++ ) {
            for ( i=0 ; i < w ; i++) {
                let c = this.getCell(i,j);
                c.setVisited( on );
            }
        }
        return vis;        
    }//fim de getUnvisitedBorder

}

class MazeCell { //GraphVertice
    constructor(x,y,maze={} ) {
        this.x = x;
        this.y = y;
        this.maze = maze;
    }
    toString(){
        return "MazeCell:{x:"+this.x+", y:"+this.y+
        ", maze: ("+this.maze.width+", "+this.maze.height+")}" ;
    }

    isWallup()   { return this.maze.cmap[this.x][this.y] & isWallup    }
    isWallright(){ return this.maze.cmap[this.x][this.y] & isWallright }
    isWalldown() { return this.maze.cmap[this.x][this.y] & isWalldown  }
    isWallleft() { return this.maze.cmap[this.x][this.y] & isWallleft  }
    isColumns()  { return this.maze.cmap[this.x][this.y] & isColumns   }
    isVisited()  { return this.maze.cmap[this.x][this.y] & isVisited   }
    getCellup()    { return this.maze.getCellup   (this.x, this.y) }
    getCellright() { return this.maze.getCellright(this.x, this.y) }
    getCelldown()  { return this.maze.getCelldown (this.x, this.y) }
    getCellleft()  { return this.maze.getCellleft (this.x, this.y) }
    setWallup(onoff) { if (onoff)   { this.maze.cmap[this.x][this.y] = this.maze.cmap[this.x][this.y] | isWallup ;
        } else                      { this.maze.cmap[this.x][this.y] = this.maze.cmap[this.x][this.y] & ~isWallup ; } }
    setWallright(onoff) { if (onoff){ this.maze.cmap[this.x][this.y] = this.maze.cmap[this.x][this.y] | isWallright ;
        } else                      { this.maze.cmap[this.x][this.y] = this.maze.cmap[this.x][this.y] & ~isWallright ; } }
    setWalldown(onoff) { if (onoff) { this.maze.cmap[this.x][this.y] = this.maze.cmap[this.x][this.y] | isWalldown ;
        } else                      { this.maze.cmap[this.x][this.y] = this.maze.cmap[this.x][this.y] & ~isWalldown ; } }
    setWallleft(onoff) { if (onoff) { this.maze.cmap[this.x][this.y] = this.maze.cmap[this.x][this.y] | isWallleft ;
        } else                      { this.maze.cmap[this.x][this.y] = this.maze.cmap[this.x][this.y] & ~isWallleft ; } }
    setColumns(onoff) { if (onoff)  { this.maze.cmap[this.x][this.y] = this.maze.cmap[this.x][this.y] | isColumns ;
        } else                      { this.maze.cmap[this.x][this.y] = this.maze.cmap[this.x][this.y] & ~isColumns ; } }
    setVisited(onoff) { if (onoff)  { this.maze.cmap[this.x][this.y] = this.maze.cmap[this.x][this.y] | isVisited ;
        } else                      { this.maze.cmap[this.x][this.y] = this.maze.cmap[this.x][this.y] & ~isVisited ; } }
    unirCellup()     {this.setWallup(false);    this.getCellup().setWalldown(false); this.checkCols() ; this.getCellright().checkCols() }
    unirCellright()  {this.setWallright(false); this.getCellright().setWallleft(false); this.getCellright().checkCols() ; this.getCellright().getCelldown().checkCols() }
    unirCelldown()   {this.setWalldown(false);  this.getCelldown().setWallup(false); this.getCelldown().checkCols(); this.getCellright().getCelldown().checkCols() }
    unirCellleft()   {this.setWallleft(false);  this.getCellleft().setWallright(false); this.checkCols(); this.getCelldown().checkCols(); }
    
    checkCols() {
        let wu  = this.isWallup();
        let wl  = this.isWallleft();
        let wul = this.getCellup().isWallleft();
        let wlu = this.getCellleft().isWallup();
        this.setColumns( wu || wl || wul || wlu );
    }

    getUnvisitedNeighbors(){
        let neighbors = [];
        if (!this.getCellup().isVisited()    ) neighbors.push( this.getCellup() ) ;
        if (!this.getCellright().isVisited() ) neighbors.push( this.getCellright() ) ;
        if (!this.getCelldown().isVisited()  ) neighbors.push( this.getCelldown() ) ;
        if (!this.getCellleft().isVisited()  ) neighbors.push( this.getCellleft() ) ;
        return neighbors ;
    }

    getRandomUnvisitedNeighbor(){
        let n = this.getUnvisitedNeighbors();
        if ( n.length > 0 ){ return n[Math.floor(prng()*n.length)] }
        else { return false; }
    }

    getLinkedNeighbors(){
        let neighbors = [];
        if (!this.isWallup()    && !this.getCellup().isWalldown())     neighbors.push( this.getCellup() ) ;
        if (!this.isWallright() && !this.getCellright().isWallleft() ) neighbors.push( this.getCellright() ) ;
        if (!this.isWalldown()  && !this.getCelldown().isWallup() )    neighbors.push( this.getCelldown() ) ;
        if (!this.isWallleft()  && !this.getCellleft().isWallright() ) neighbors.push( this.getCellleft() ) ;
        return neighbors ;
    }

    getLinkedUnvisitedNeighbors(){
        let neighbors = [];
        if (!this.getCellup().isVisited()    && !this.isWallup()    && !this.getCellup().isWalldown())     neighbors.push( this.getCellup() ) ;
        if (!this.getCellright().isVisited() && !this.isWallright() && !this.getCellright().isWallleft() ) neighbors.push( this.getCellright() ) ;
        if (!this.getCelldown().isVisited()  && !this.isWalldown()  && !this.getCelldown().isWallup() )    neighbors.push( this.getCelldown() ) ;
        if (!this.getCellleft().isVisited()  && !this.isWallleft()  && !this.getCellleft().isWallright() ) neighbors.push( this.getCellleft() ) ;
        return neighbors ;
    }//fim do     getLinkedUnvisitedNeighbors

}

class MazeVisualizer2x2 {
    constructor( maze ) { // ( graph )
        this.maze = maze;
        this.corwall = 'gray';
        this.corcenter = 'black';
        this.corpath = 'black';
        this.corroute = 'cyan';
        this.corcenterlite = 'red';
    }

    draw( ctx ) {
        let i , j;
        let h = this.maze.height;
        let w = this.maze.width;
        let t = 2; //tamanho da celula
        let p = 4; //tamanho do pixel

        for( j=0 ; j < h ; j++ ) {
            for ( i=0 ; i < w ; i++) {
                let c = this.maze.getCell(i,j);
                let x = c.x * t * p;
                let y = c.y * t * p;

                ctx.fillStyle = c.isColumns() ? this.corwall : this.corpath ;
                ctx.fillRect( x  ,  y  , p , p) ; //coluna
                
                ctx.fillStyle = c.isWallup() ? this.corwall : this.corpath ;
                ctx.fillRect( x+p,  y  , p , p) ; //wup
                
                ctx.fillStyle = c.isWallleft() ? this.corwall : this.corpath ;
                ctx.fillRect( x  ,  y+p, p , p) ; //wleft
                
                ctx.fillStyle = this.corcenter;
                ctx.fillRect( x+p,  y+p, p , p) ; //centro
            }
        }        
    }

    drawRoute( ctx , route , cor = this.corroute){
        let i , j;
        let h = this.maze.height;
        let w = this.maze.width;
        let t = 2; //tamanho da celula
        let p = 4; //tamanho do pixel
        let len = route.length;

        for( j=0 ; j < len ; j++ ) {

            let c = route[j];

            let x = c.x * t * p;
            let y = c.y * t * p;

            ctx.fillStyle = c.isColumns() ? this.corwall : cor ;
            ctx.fillRect( x  ,  y  , p , p) ; //coluna
            
            ctx.fillStyle = c.isWallup() ? this.corwall : cor ;
            ctx.fillRect( x+p,  y  , p , p) ; //wup
            
            ctx.fillStyle = c.isWallleft() ? this.corwall : cor ;
            ctx.fillRect( x  ,  y+p, p , p) ; //wleft
            
            ctx.fillStyle = cor;
            ctx.fillRect( x+p,  y+p, p , p) ; //centro
        }        
    }//fim drawRoute

    drawCenter( ctx, route , cor = this.corcenterlite ){
        let i , j;
        let h = this.maze.height;
        let w = this.maze.width;
        let t = 2; //tamanho da celula
        let p = 4; //tamanho do pixel
        let len = route.length;

        for( j=0 ; j < len ; j++ ) {

            let c = route[j];

            let x = c.x * t * p;
            let y = c.y * t * p;

            ctx.fillStyle = cor;
            ctx.fillRect( x+p,  y+p, p , p) ; //centro
        }        

    }//fim drawCenter

    drawRoutePath( ctx , route , cor = this.corroute ){
        let i , j;
        let h = this.maze.height;
        let w = this.maze.width;
        let t = 2; //tamanho da celula
        let p = 4; //tamanho do pixel
        let len = route.length;
        let lx, ly;


        ctx.beginPath();
        ctx.lineWidth = p;
        ctx.strokeStyle = cor;
        ctx.lineCap = 'square';

        for( j=0 ; j < len ; j++ ) {

            let c = route[j];

            let x = c.x * t * p;
            let y = c.y * t * p;

            if( j == 0 ) {
                ctx.moveTo(x+p+2,y+p+2);
            }

            if( Math.abs(x - lx) > 2*p || Math.abs(y - ly) > 2*p ) {

                if (lx == 0 && lx != x) {
                    ctx.lineTo( 2,y+p+2);
                }

                if (lx == (c.maze.width-1)*t*p  && lx!= x  ) {
                    ctx.moveTo( 2,y+p+2);
                    ctx.lineTo( 2,y+p+2);
                }

                if (ly == 0 && ly != y) {
                    ctx.lineTo( x+p+2, 2);
                }

                if (ly == (c.maze.height-1)*t*p  && ly!= y  ) {
                    ctx.moveTo( x+p+2,2);
                    ctx.lineTo( x+p+2,2);
                }


                ctx.moveTo(x+p+2,y+p+2);
            }

            ctx.lineTo(x+p+2,y+p+2);

            lx = x;
            ly = y;
        }        
        ctx.stroke();
        ctx.closePath();

    }//fim drawRoutePath

    drawRect( ctx, route , cor = this.corcenterlite ){
        let i , j;
        let h = this.maze.height;
        let w = this.maze.width;
        let t = 2; //tamanho da celula
        let p = 4; //tamanho do pixel
        let len = route.length;

        for( j=0 ; j < len ; j++ ) {

            let c = route[j];

            let x = c.x * t * p;
            let y = c.y * t * p;

            ctx.fillStyle = cor;
            ctx.fillRect( x,  y, 3*p , 3*p) ; //bordas do centro
        }        

    }//fim drawRect




}

class MazeAlgorithm {
    constructor (maze) {
        this.algorithm = "none";
    //    this.visited = new Set();
        this.done = false;
        this.x = 0;
        this.y = 0;
        this.maze = maze;
    }

    oneStep() {
        if (this.y < (this.maze.height-0)) {
            if (this.x < (this.maze.width-0)){
                switch ( Math.floor( prng()*10 ) ) {
                    case 0: this.maze.getCell(this.x,this.y).unirCellup();    break;
                    case 1: this.maze.getCell(this.x,this.y).unirCellright(); break;
                    case 2: this.maze.getCell(this.x,this.y).unirCelldown();  break;
                    case 3: this.maze.getCell(this.x,this.y).unirCellleft();  break;
                    case 4: break;
                    case 5: break;
                    case 6: this.maze.getCell(this.x,this.y).unirCellleft();  break;
                    case 7: this.maze.getCell(this.x,this.y).unirCelldown();  break;
                    case 8: this.maze.getCell(this.x,this.y).unirCellright(); break;
                    case 9: this.maze.getCell(this.x,this.y).unirCellup();    break;
                    default: break;
                }
                this.x++;
            } else {
                this.x = 0;
                this.y++;
            }
        } else {
            this.done = true;
        }
    }

    dig(steps=1){
        let i = 0;
        while ( !this.done && (i < steps) ) {

            this.oneStep();

            i++;
        }
        return this.done ;
    } //fim de dig();

    reset(){
        this.maze.restart(this.maze.width, this.maze.height);
        this.done = false;
        this.x = 0;
        this.y = 0;
    }
}

class MazeBackTrackAlgorithm extends MazeAlgorithm {
    constructor(maze){     
        super(maze);
        this.algorithm = "backtrack";
        this.pilha = [];
        let x =  Math.floor(prng()*this.maze.width);
        let y =  Math.floor(prng()*this.maze.height);
        this.atual = this.maze.getCell( x, y);
        this.setInicial();
        this.maxroute = [];
    }

    setInicial(x=-1, y=-1) {
        this.atual.x = x < 0 ? this.atual.x : x;
        this.atual.y = y < 0 ? this.atual.y : y;
        this.pilha.push(this.atual);
        this.atual.setVisited(true);
    }

    reset(){
        super.reset();
        this.pilha = null;
        this.pilha = [];
        let x =  Math.floor(prng()*this.maze.width);
        let y =  Math.floor(prng()*this.maze.height);
        this.atual = this.maze.getCell( x, y);
        this.setInicial( x , y );
        this.maxroute = [];
    }

    // celula atual está sempre 1 passo adiante da pilha
    oneStep() {
        if ( this.pilha.length > 0 ) {
            let ca = this.atual.getRandomUnvisitedNeighbor();
            if ( ca!=false ) {
                this.maze.unirCells( this.atual , ca );
                this.pilha.push( this.atual );
                this.atual = ca;
                //this.pilha.push( this.atual );
                this.atual.setVisited(true);
            } else {
                if ( this.pilha.length > this.maxroute.length ) {
                    this.maxroute = this.pilha.slice();
                }

                // let ct =0;
                // do { ct++;
                    this.atual = this.pilha.pop();
                //     if (this.atual.x == undefined) {break;}
                // } while( !this.atual.getRandomUnvisitedNeighbor() );
            }
            return true ;
        } else {
            this.done = true;
            return false ;
        }
    }
}

class MazeBackTrackShortCorridorAlgorithm extends MazeAlgorithm {
    constructor(maze){     
        super(maze);
        this.algorithm = "backtrack";
        this.pilha = [];
        let x =  Math.floor(prng()*this.maze.width);
        let y =  Math.floor(prng()*this.maze.height);
        this.atual = this.maze.getCell( x, y);
        this.setInicial();
        this.maxroute = [];
        this.maxcorridor = 10; //hipotenusa
        this.stepcount = 0;

    }

    setInicial(x=-1, y=-1) {
        this.atual.x = x < 0 ? this.atual.x : x;
        this.atual.y = y < 0 ? this.atual.y : y;
        this.pilha.push(this.atual);
        this.atual.setVisited(true);
        this.maxcorridor = Math.floor( Math.hypot(this.maze.width, this.maze.height)/3 );
        this.stepcount = 0;
    }

    reset(){
        super.reset();
        this.pilha = null;
        this.pilha = [];
        let x =  Math.floor(prng()*this.maze.width);
        let y =  Math.floor(prng()*this.maze.height);
        this.atual = this.maze.getCell( x, y);
        this.setInicial( x , y );
        this.maxroute = [];
    }

    // celula atual está sempre 1 passo adiante da pilha
    oneStep() {
        if ( this.pilha.length > 0 ) {
            
            if ( this.stepcount > this.maxcorridor){
                let d = this.stepcount;
                let e = (prng()*this.maxcorridor*15);
                if ( d > e ) {
                    this.pilha.push( this.atual );
                    let vb = this.maze.getVisitedBorder();
                    if (vb.length > 0 ) {
                        this.atual = vb[ Math.floor( prng() * vb.length)  ];
                    } else {
                        this.atual = this.pilha.pop();
                    }
                    this.stepcount = 0;

                }  
            }

            let ca = this.atual.getRandomUnvisitedNeighbor();

            if ( ca!=false ) {
                this.maze.unirCells( this.atual , ca );
                this.pilha.push( this.atual );
                this.atual = ca;
                //this.pilha.push( this.atual );
                this.atual.setVisited(true);
                this.stepcount++;
            } else {
                if ( this.pilha.length > this.maxroute.length ) {
                    this.maxroute = this.pilha.slice();
                }

                // let ct =0;
                // do { ct++;
                    this.atual = this.pilha.pop();
                    this.stepcount = 0;
                //     if (this.atual.x == undefined) {break;}
                // } while( !this.atual.getRandomUnvisitedNeighbor() );

            }
            return true ;
        } else {
            this.done = true;
            return false ;
        }
    }
}

class BfsAnimated {
    constructor (maze , start, stop) {
        this.maze = maze;
        this.start = start || this.maze.getCell( Math.floor( prng()*this.maze.width) , Math.floor( prng()*this.maze.height) );
        this.stop = stop || this.maze.getCell( Math.floor( prng()*this.maze.width) , Math.floor( prng()*this.maze.height) );
        this.live = [];
        this.dmap = [];
        this.steps = 0;
        this.done = false;
        this.found = false;
        this.path = [];
        this.explored = false;
        this.setup();
    }

    setup() {
        let i, j;
        let hei = [];
        for ( i = 0 ; i < this.maze.height ; i ++ ){
          hei.push( this.maze.width*this.maze.height );
        }
        for ( j = 0 ; j < this.maze.width ; j ++ ){
          this.dmap.push ( hei.slice() );
        }

        this.dmap[this.start.x][this.start.y] = this.steps;

        this.maze.setVisited( false );
        this.start.setVisited( true );
        this.live.push(this.start);
        this.done = false;
        this.found = false;
        this.path = [];
        this.explored = false;
    }// fim do setup

    reset() {
        this.live = [];
        this.steps = 0;
        this.setup();
    }

    dig(steps=1){
        let i = 0;
        while ( !this.done && (i < steps) ) {

            this.oneStep();

            i++;
        }
        return this.done ;
    } //fim de dig();

    oneStep() {
        let l, n , v, w, p, i;
        n = [];
        
        if ( this.live.length > 0 && !this.explored ) {
            this.steps++;
            for( l = 0; l < this.live.length ; l ++) {
                this.live[l].setVisited(true);
                v = this.live[l].getLinkedUnvisitedNeighbors();

                for (const e of v) {
                    n.push( e );
                    this.dmap[e.x][e.y] = this.steps;
                    if ( e.x == this.stop.x && e.y == this.stop.y ) {
                        //Encontrou o destino
                        this.found = true;
                        console.log("Encontrou o destino.");
                    }
                }
            }

            this.live = n;
        }
        else {
            //Acabou a exploração        
            this.explored = true;
        }
        //Se encotrou stop descer ladeira
        if (  this.found ==  true) {
            w = this.stop ;
            p = [];
            p.push(w);

            console.log( "Começar a descer a ladeira. Stop na altura " +  this.dmap[w.x][w.y] );

            while ( !((w.x == this.start.x) && (w.y == this.start.y)) ) {
                v = w.getLinkedNeighbors();
                for (const e of v)  {
                    if ( this.dmap[e.x][e.y] < this.dmap[w.x][w.y] ){
                        p.push(e);
                        w = e;
                        break;
                    }
                }
            }// desceu a ladeira
            p.reverse();
            this.path = p;
            this.done = true;
        }

    }// fim de oneStep

}//fim de BfsAnimated


function bfs(maze , start, stop) {
    this.maze = maze;
    this.start = start || this.maze.getCell( Math.floor( prng()*this.maze.width) , Math.floor( prng()*this.maze.height) );
    this.stop = stop || this.maze.getCell( Math.floor( prng()*this.maze.width) , Math.floor( prng()*this.maze.height) );
    this.live = [];
    this.dmap = [];
    this.steps = 0;
    this.done = false;
    this.found = false;
    this.path = [];
    this.explored = false;
    
    this.setup = function() {
        let i, j;
        let hei = [];
        for ( i = 0 ; i < this.maze.height ; i ++ ){
            hei.push( this.maze.width*this.maze.height );
        }
        for ( j = 0 ; j < this.maze.width ; j ++ ){
            this.dmap.push ( hei.slice() );
        }

        this.dmap[this.start.x][this.start.y] = this.steps;

        this.maze.setVisited( false );
        this.start.setVisited( true );
        this.live.push(this.start);
        this.done = false;
        this.found = false;
        this.path = [];
        this.explored = false;
    }// fim do setup

    this.reset = function () {
        this.live = [];
        this.steps = 0;
        this.setup();
    }

    this.dig = function (steps=1){
        let i = 0;
        while ( !this.done && (i < steps) ) {
            this.oneStep();
            i++;
        }
        return this.done ;
    } //fim de dig();

    this.oneStep = function() {
        let l, n , v, w, p, i;
        n = [];
        
        if ( this.live.length > 0 && !this.explored ) {
            this.steps++;
            for( l = 0; l < this.live.length ; l ++) {
                this.live[l].setVisited(true);
                v = this.live[l].getLinkedUnvisitedNeighbors();

                for (const e of v) {
                    n.push( e );
                    this.dmap[e.x][e.y] = this.steps;
                    if ( e.x == this.stop.x && e.y == this.stop.y ) {
                        //Encontrou o destino
                        this.found = true;
                        //console.log("Encontrou o destino.");
                    }
                }
            }
            this.live = n;
        }
        else {
            //Acabou a exploração        
            this.explored = true;
        }
        //Se encotrou stop descer ladeira
        if (  this.found ==  true) {
            w = this.stop ;
            p = [];
            p.push(w);
            //console.log( "Começar a descer a ladeira. Stop na altura " +  this.dmap[w.x][w.y] );
            while ( !((w.x == this.start.x) && (w.y == this.start.y)) ) {
                v = w.getLinkedNeighbors();
                for (const e of v)  {
                    if ( this.dmap[e.x][e.y] < this.dmap[w.x][w.y] ){
                        p.push(e);
                        w = e;
                        break;
                    }
                }
            }// desceu a ladeira
            p.reverse();
            this.path = p;
            this.done = true;
        }
    }// fim de oneStep

    this.setup();
    while(!this.dig(1));
    return this.path.slice();
}//fim da função bfs


class PedometerStats {
    constructor (maze ) {
        this.maze = maze;
        this.start = this.maze.getCell( Math.floor( prng()*this.maze.width) , Math.floor( prng()*this.maze.height) );
        this.stop = this.maze.getCell( Math.floor( prng()*this.maze.width) , Math.floor( prng()*this.maze.height) );
        this.live = [];
        this.dmap = [];
        this.steps = 0;
        this.done = false;
        this.found = false;
        this.path = [];
        this.explored = false;
        this.setup();
    }

    setup() {
        let i, j;
        let hei = [];
        for ( i = 0 ; i < this.maze.height ; i ++ ){
          hei.push( this.maze.width*this.maze.height );
        }
        for ( j = 0 ; j < this.maze.width ; j ++ ){
          this.dmap.push ( hei.slice() );
        }

        this.maze.setVisited( false );
        this.start.setVisited( true );
        this.live.push(this.start);
        this.done = false;
        this.found = false;
        this.path = [];
        this.explored = false;
    }// fim do setup

    reset() {
        this.live = [];
        this.steps = 0;
        this.setup();
    }

    dig(steps=1){
        let i = 0;
        while ( !this.done && (i < steps) ) {
            this.oneStep();
            i++;
        }
        return this.done ;
    } //fim de dig();

    oneStep() {
        let l, n , v, w, p, i;
        n = [];
        
        if ( this.live.length > 0 && !this.explored ) {
            this.steps++;
            for( l = 0; l < this.live.length ; l ++) {
                this.live[l].setVisited(true);
                v = this.live[l].getLinkedUnvisitedNeighbors();

                for (const e of v) {
                    n.push( e );
                    this.dmap[e.x][e.y] = this.steps;
                    this.stop = e ; 
                }
            }

            this.live = n;
        }
        else {
            //Acabou a exploração        
            this.explored = true;
        }
    }// fim de oneStep

    getFartestCell( initCell ){
        let next , vizinhos, lastcell , live, steps;
        next = [];
        live = [];
        steps = 0;
        lastcell = this.maze.getCell( Math.floor( this.maze.width/2) , Math.floor( this.maze.height/2) );

        this.maze.setVisited( false );
        live.push( initCell);
        this.dmap[initCell.x][initCell.y] = steps;
        initCell.setVisited( true );

        while ( live.length > 0 ) {
            steps++;
            next = [];

            for( const cel of live ) {
                cel.setVisited(true);
                vizinhos = cel.getLinkedUnvisitedNeighbors();

                for (const viz of vizinhos) {
                    next.push( viz );
                    this.dmap[viz.x][viz.y] = steps;
                    lastcell = viz;
                }
            }

            live = next;
        }
        return lastcell;
    }//fim de getFartestCell;

    getPathUp( target ) {
        let w = target ;
        let p = [];
        let v;
        p.push(w);
        //console.log( "Começar a descer a ladeira. Stop na altura " +  this.dmap[w.x][w.y] );
        while ( this.dmap[w.x][w.y] != 0 ) {
            v = w.getLinkedNeighbors();
            for (const e of v)  {
                if ( this.dmap[e.x][e.y] < this.dmap[w.x][w.y] ){
                    p.push(e);
                    w = e;
                    break;
                }
            }
        }
        p.push(w); // Adiciona celula com dmap 0;
        // desceu a ladeira
        p.reverse(); // Para que o caminho suba a ladeira
        return p.slice();
    }// fim de getPathUp

    getTheBigPath(){
        let pbegin = this.getFartestCell( this.maze.getCell(0,0) );
        let pend = this.getFartestCell( pbegin );
        let path = this.getPathUp( pend );
        let msg  = "Tamanho do TheBigPath " + path.length ;
        console.log(msg);
        return path.slice();
    }// fim de getTheBigPath
    


}//fim de PedometerAndAnalise
