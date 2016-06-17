var WIDTH = 900;
var HEIGHT = 500;
var RADIUS = 20;
var coordinates = [];
var delay = 1000;

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
    .transition(delay)
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

for (var i = 0; i < 3; i++) {
  coordinates.push({});
}

var tick = function() {
  update();
  setTimeout(tick, delay);
};

tick();