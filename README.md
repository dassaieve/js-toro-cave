# js-toro-cave

A maze generator on a torus topology.

Fisrt it was a game project. In a platform game the maze generator would be filled by premade rooms like marching squares. Have done 6 sets of rooms to be mixed in the maze with perlin noise. To ease the map, the longest maze route would lose the walls betwen commom cells. This way the map would have some open regions e somes maze islands. Also, the dead ends woul lose wall to make some rooms inside the maze.

Fist I have done the platform player and map colision on TIC-80 (fantasy computer for making, playing and sharing tiny games). But the maze was getting more interesting than the game and the TIC-80 wasn't enought. Decided to move to HTML5.

Pseudorandom Number Generator use is the mulberry32, copied after some StackOverflow searching.
Startint on a graph with the torus topology.
Some algorithm for maze generation.
Breadth-first search.
Pedometer to map and analyse the maze.
 ...
