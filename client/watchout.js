var WIDTH = 900;
var HEIGHT = 500;
var RADIUS = 20;
var MOUSE_RADIUS = 10;

var INITIAL = 3;
var MAX = 15;

var coordinates = [];
var players = [];

var delay = 2000;
var score = 0;
var collided = false;
var collisionCount = 0;

var tickInterval, collisionInterval;

var d3Score = d3.select('.current span').data([0]);
var d3HighScore = d3.select('.highscore span').data([0]);
var d3Collisions = d3.select('.collisions span').data([0]);

var drag = d3.behavior.drag().on('drag', function(d, i) {
  var newX = d.cx + d3.event.dx;
  var newY = d.cy + d3.event.dy;
  d.cx = newX < MOUSE_RADIUS ? MOUSE_RADIUS : newX > WIDTH - MOUSE_RADIUS ? WIDTH - MOUSE_RADIUS : newX;
  d.cy = newY < MOUSE_RADIUS ? MOUSE_RADIUS : newY > HEIGHT - MOUSE_RADIUS ? HEIGHT - MOUSE_RADIUS : newY;
  d3.select(this).attr('cx', d.cx).attr('cy', d.cy);
});

var scoreBoard = d3.select('.scoreboard')
  .style('width', WIDTH + 'px')
  .style('margin', '0 auto');

var board = d3.select('.board')
  .style('width', WIDTH + 'px')
  .style('height', HEIGHT + 'px')
  .style('margin', '0 auto');

var svg = board
  .append('svg')
  .attr('width', WIDTH)
  .attr('height', HEIGHT)
  .style('background-color', 'lightgray');

board.append('button')
  .on('click', function() { addPlayer(); })
  .text('Add Player');

svg.append('defs').append('pattern')
  .attr('id', 'asteroid')
  .attr('width', 2 * RADIUS)
  .attr('height', 2 * RADIUS)
  .append('image')
  .attr('xlink:href', 'shuriken.png')
  .attr('width', 2 * RADIUS)
  .attr('height', 2 * RADIUS);

var addPlayer = function() {
  var newPlayer = randomCoord();
  newPlayer.id = players.length;
  players.push(newPlayer);

  var playerNodes = svg.selectAll('.player').data(players);

  playerNodes
    .enter()
    .append('circle')
    .style('width', 2 * MOUSE_RADIUS + 'px')
    .attr('cx', function(d) { return d.cx; })
    .attr('cy', function(d) { return d.cy; })
    .attr('r', MOUSE_RADIUS)
    .classed('player', true)
    .call(drag);
};

var randomUpTo = function(n) {
  return Math.floor(Math.random() * (n - 2 * RADIUS)) + RADIUS;
};

var randomCoord = function() {
  return {
    cx: randomUpTo(WIDTH),
    cy: randomUpTo(HEIGHT)
  };
};

var safeCoord = function() {
  var newAsteroid = randomCoord();
  while (anyPlayerCollision(newAsteroid)) {
    newAsteroid = randomCoord();
  }
  return newAsteroid;
};

var makeInitialData = function() {
  var coordFn = players.length === 0 ? randomCoord : safeCoord;
  for (var i = 0; i < INITIAL; i++) {
    coordinates.push(coordFn());
  }
};

var anyPlayerCollision = function(newAsteroid) {
  for (var i = 0; i < players.length; i++) {
    if (collision(players[i], newAsteroid)) {
      return true;
    }
  }
  return false;
};

var update = function() {
  var circle = svg.selectAll('.asteroid').data(coordinates);

  // UPDATE
  circle
    .transition()
    .duration(delay)
    .attr('cx', function(d) { return d.cx; })
    .attr('cy', function(d) { return d.cy; })
    .tween('collisionCheck', function() {
      return function(t) {
        var cx = d3.select(this).attr('cx');
        var cy = d3.select(this).attr('cy');
        var coord = {cx: cx, cy: cy};
        if (players.some(function(p) {
          return collision(p, coord);
        })) {
          collided = true;
        }
      };
    });

  // ENTER  
  circle
    .enter()
    .append('circle')
    .attr('cx', function(d) { return d.cx; })
    .attr('cy', function(d) { return d.cy; })
    .attr('r', RADIUS)
    .attr('fill', 'url("#asteroid")')
    .classed('asteroid', true);

  // REMOVE
  circle
    .exit()
    .remove();

  if (coordinates.length < MAX) {
    coordinates.push(safeCoord());
  }
};

var startGame = function() {
  makeInitialData();
  update();
  tickInterval = setInterval(function() {
    coordinates.forEach(function(obj) {
      obj.cx = randomUpTo(WIDTH);
      obj.cy = randomUpTo(HEIGHT);
    });
    update();
  }, delay);
  setTimeout(function() {
    collisionInterval = setInterval(function () {
      collisionCheck();
      if (collided) {
        stopGame();
      }
      d3Score.data([++score])
        .text(function(d) { return d; });
    }, 100);
  }, delay);
};

var stopGame = function() {
  clearInterval(tickInterval);
  clearInterval(collisionInterval);
  collided = false;
  collisionCount++;
  d3Collisions.data([collisionCount]).text(function(d) { return d; });
  coordinates.length = 0;
  update();
  score = 0;
  if (d3HighScore.datum() < score) {
    d3HighScore.data([score])
      .text(function(d) { return d; });
  }
  startGame();
};

var collision = function(m, c) {
  return Math.sqrt(Math.pow(m.cx + MOUSE_RADIUS - c.cx, 2) + 
    Math.pow(m.cy + MOUSE_RADIUS - c.cy, 2)) <= MOUSE_RADIUS + RADIUS; 
};

var collisionCheck = function() {
  var cP = svg.selectAll('.asteroid');
  for (var i = 0; i < players.length; i++) {  
    cP.each(function() {
      var cx = d3.select(this).attr('cx');
      var cy = d3.select(this).attr('cy');
      if (collision(players[i], {cx: cx, cy: cy})) {
        return true;
      }
    });
  }
};

startGame();
