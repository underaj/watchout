var WIDTH = 900;
var HEIGHT = 500;
var RADIUS = 20;
var MOUSE_RADIUS = 10;
var coordinates = [];
var delay = 2000;
var score = 0;
var d3Score = d3.select('.current span').data([0]);
var highScore = 0;
var d3HighScore = d3.select('.highscore').select('span').data([0]);
var drag = d3.behavior.drag()
  .on('drag', function(d, i) {
    d.x += d3.event.dx;
    d.y += d3.event.dy;
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
  .attr('xlink:href', 'asteroid.png')
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

var update = function() {
  coordinates.forEach(function(obj) {
    obj.cx = randomUpTo(WIDTH);
    obj.cy = randomUpTo(HEIGHT);
  });

  var circle = svg.selectAll('circle')
    .data(coordinates);
  circle
    .transition().delay(delay)
    .attr('cx', function(d) { return d.cx; })
    .attr('cy', function(d) { return d.cy; });
  circle  
    .enter()
    .append('circle')
    .attr('cx', function(d) { return d.cx; })
    .attr('cy', function(d) { return d.cy; })
    .attr('r', RADIUS)
    .attr('fill', 'url("#asteroid")');
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
  var cP = svg.selectAll('circle').data();
  // Some stop iterating when a true value is returned from the callback function.
  if (cP.some(collision.bind(null, mP))) {
    if (d3HighScore.datum() < score) {
      d3HighScore.data([score])
        .text(function(d) { return d; });
    }
    score = 0;
  }
  
  d3Score.data([++score])
    .text(function(d) { return d; });
};

for (var i = 0; i < 3; i++) {
  coordinates.push({});
}

tick();

setInterval(collisionCheck, 50);