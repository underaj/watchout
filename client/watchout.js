var WIDTH = 900;
var HEIGHT = 500;
var RADIUS = 20;
var MOUSE_RADIUS = 10;
var INITIAL = 3;
var MAX = 20;
var coordinates = [];
var delay = 2000;
var score = 0;
var d3Score = d3.select('.current span').data([0]);
var d3HighScore = d3.select('.highscore span').data([0]);
var collisionCount = 0;
var d3Collisions = d3.select('.collisions span').data([0]);
var drag = d3.behavior.drag().on('drag', function(d, i) {
  var newX = d.x + d3.event.dx;
  var newY = d.y + d3.event.dy;
  d.x = newX < 0 ? 0 : newX > WIDTH ? WIDTH : newX;
  d.y = newY < 0 ? 0 : newY > HEIGHT ? HEIGHT : newY;
  d3.select(this).style('transform', function(d, i) {
    return 'translate(' + d.x + 'px, ' + d.y + 'px)';
  });
});

var svg = d3.select('.board')
  .append('svg')
  .attr('width', WIDTH)
  .attr('height', HEIGHT);

svg.append('defs').append('pattern')
  .attr('id', 'asteroid')
  .attr('width', 2 * RADIUS)
  .attr('height', 2 * RADIUS)
  .append('image')
  .attr('xlink:href', 'shuriken.png')
  .attr('width', 2 * RADIUS)
  .attr('height', 2 * RADIUS);

var mouse = d3.select('.mouse');
mouse.data([{x: 0, y: 0}])
  .style('width', 2 * MOUSE_RADIUS + 'px')
  .style('height', 2 * MOUSE_RADIUS + 'px');
mouse.call(drag);

var randomUpTo = function(n) {
  return Math.floor(Math.random() * (n - 2 * RADIUS)) + RADIUS;
};

var randomCoord = function() {
  return {
    cx: randomUpTo(WIDTH),
    cy: randomUpTo(HEIGHT)
  };
};

var makeInitialData = function() {
  for (var i = 0; i < INITIAL; i++) {
    coordinates.push(randomCoord());
  }
};

var update = function() {
  coordinates.forEach(function(obj) {
    obj.cx = randomUpTo(WIDTH);
    obj.cy = randomUpTo(HEIGHT);
  });

  var circle = svg.selectAll('circle')
    .data(coordinates);
  circle
    .transition().duration(delay)
    .attr('cx', function(d) { return d.cx; })
    .attr('cy', function(d) { return d.cy; });
  circle  
    .enter()
    .append('circle')
    .attr('cx', function(d) { return d.cx; })
    .attr('cy', function(d) { return d.cy; })
    .attr('r', RADIUS)
    .attr('fill', 'url("#asteroid")')
    .classed('asteroid', true);
  circle
    .exit()
    .remove();

  if (coordinates.length < MAX) {
    coordinates.push(randomCoord());
  }
};

var tick = function() {
  update();
  setTimeout(tick, delay);
};

var collision = function(m, c) {
  return Math.sqrt(Math.pow(m.x + MOUSE_RADIUS - c.cx, 2) + 
    Math.pow(m.y - MOUSE_RADIUS - c.cy, 2)) <= MOUSE_RADIUS + RADIUS; 
};

var collisionCheck = function() {
  var mP = mouse.datum();
  var cP = svg.selectAll('circle');

  // Some stop iterating when a true value is returned from the callback function.
  var hasCollision = false;
  cP.each(function(circle) {
    var cx = d3.select(this).attr('cx');
    var cy = d3.select(this).attr('cy');
    if (collision(mP, {cx: cx, cy: cy})) {
      hasCollision = true;
      collisionCount++;
    }
  });
  if (hasCollision) {
    if (d3HighScore.datum() < score) {
      d3HighScore.data([score])
        .text(function(d) { return d; });
    }
    d3Collisions.data([collisionCount]).text(function(d) { return d; });
    coordinates.length = 0;
    update();
    makeInitialData();
    update();
    update();
    score = 0;
  }
  
  d3Score.data([++score])
    .text(function(d) { return d; });
};

makeInitialData();
update();
tick();
setInterval(collisionCheck, 100);