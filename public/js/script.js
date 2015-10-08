/*global d3:false */
'use strict';
function generateHeader(filename, el) {
    d3.select(el)
      .append('h1')
      .attr('class', 'title center section-header')
      .html(filename);
}
function generateChart(fileType, el) {

  var width = 400;
  var height = 600;
  var sizeCharacterLength = 8;
  var fontSizeInPixels = 4;
  var lineHeight = 20;
  var color = d3.scale.category20c();
  var convertToMB = 0;
  var requests = 0;
  var children = [];
  for (var j = 0; j < fileType.length; j++) {
    convertToMB += fileType[j].value / 1000000;
    if (fileType[j].files) {
      requests += fileType[j].files.length;
      children.push(fileType[j]);
    }
  }
  generateHeader(convertToMB.toFixed(2) + ' MB Transferred in ' + requests + ' requests', el);

  var json = {
    'children': children
  };

  var bubble = d3.layout.pack()
    .sort(null)
    .size([width, height]);

  var svg = d3.select(el)
    .append('div')
    .attr('class', 'bubble-chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('class', 'bubble');

  var node = svg.selectAll('.node')
    .data(bubble.nodes(json)
      .filter(function(d) {
        return !d.children;
      }))
    .enter()
    .append('g')
    .attr('class', 'node')
    .attr('transform', function(d) {
      return 'translate(' + d.x + ',' + d.y + ')';
    });

  node.append('circle')
    .attr('r', function(d) {
      return d.r;
    })
    .style('fill', function(d) {
      return color(d.title);
    });

  node.append('text')
    .attr('color', '#000')
    .attr('x', function(d) {
      return -fontSizeInPixels * (d.title.length);
    })
    .text(function(d) {
      return d.title;
    });

  node.append('text')
    .attr('color', '#000')
    .attr('x', function() {
      return -fontSizeInPixels * sizeCharacterLength;
    })
    .attr('y', function() {
      return lineHeight;
    })
    .text(function(d) {
      return ' (' + (d.value / 1000000)
        .toFixed(2) + ' MB)';
    });

  var tooltip = d3.select(el)
    .append('div')
    .attr('class', 'tp-holder');

  tooltip.append('div')
    .attr('class', 'tp-arrow');

  var tooltip_content = tooltip.append('div')
    .attr('class', 'tp-content');

  tooltip_content.append('span')
    .attr('class', 'asset_type title');

  tooltip_content.append('span')
    .attr('class', 'count title');

  tooltip_content.append('div')
    .attr('class', 'percent');

  node.on('click', function(d) {

      tooltip.select('.asset_type')
        .html(d.title);
      tooltip.select('.count')
        .html(' (' + (d.value / 1000000)
          .toFixed(2) + ' MB transferred in ' + d.files.length + ' request(s))');
      tooltip.select('.percent')
        .html('<pre>' + d.files.join('\n') + '</pre>');
      tooltip.style('display', 'block');

      var tooltip_width = Math.round(tooltip.style('width')
        .replace('px', ''));
      var tooltip_arrow_width = Math.round(tooltip.select('.tp-arrow')
        .style('width')
        .replace('px', ''));
      var tooltip_arrow_height = Math.round(tooltip.select('.tp-arrow')
        .style('height')
        .replace('px', ''));
      var tooltip_offset = 0.5 * (window.innerWidth - tooltip_width);
      var tooltip_arrow_width_percentage = 0.1;
      tooltip.style('top', d3.event.pageY + tooltip_arrow_height);
      tooltip.select('.tp-arrow')
        .style('left', d3.event.pageX - tooltip_offset - (tooltip_arrow_width * tooltip_arrow_width_percentage));
       d3.event.stopPropagation();


        });

    d3.select('body')
    .on('click', function() {

      tooltip.style('display', 'none');

    });
  }



  function generateStats(stats, el) {

    var html = '';
    for (var j = 0; j < stats.length; j++) {
      //No render if there are any other resources from the response
      if (stats[j].resource) {
        var fileInformation = stats[j].info;
        var hasFileInformation = false;
        if (fileInformation && fileInformation instanceof Array) {
          hasFileInformation = true;
        }
        html += '<div class="metrics">';
        html += '<p class="title pull-left">' + stats[j].title + '</p>';
        html += '<p class="title pull-right">' + stats[j].resource + ' ' + stats[j].units + '</p>';

        if (hasFileInformation) {
          html += '<p class="clear center"><div title="' + stats[j].info.join('\n');
          html += '" class="break"><pre>' + stats[j].info.join('\n') + '</pre></div>';
        }
        html += '</div>';
      }
    }
    d3.select(el)
      .append('div')
      .html(html);

  }


/*  function generateResourceTiming(filename, el) {
    generateHeader('Resource Panel', el);
    d3.select(el)
      .append('iframe')
      .attr('class', 'resourceTiming')
      .attr('src', filename + '.html');

  }*/



/*  function generateScreenshot(filename, el) {

    generateHeader(filename + '-Statistics', el);
    d3.select(el)
      .append('div')
      .attr('class', 'screenshot pull-right')
      .append('img')
      .attr('src', filename + '.jpg')
      .attr('class');

  }*/

  function fetchData(url) {
    d3.json(url, function(err, pages) {

      if (err) {
        return console.warn(err);
      }

      d3.select('#container')
        .append('div')
        .attr('class', 'page');
      var page = d3.selectAll('.page')[0][0];
      var chart = d3.select(page)
        .append('div');
      generateChart(pages[0].fileType, chart[0][0]);
      var stats = d3.select(page)
        .append('div');
      generateStats(pages[0].stats, stats[0][0]);

      //var resourcePanel = d3.select(page).append('div');

      // generateScreenshot(pages[i].title, stats[0][0]);

      //generateResourceTiming(pages[i].title, resourcePanel[0][0]);
    });

  }



  d3.select('#submit')
    .on('click', function() {
      d3.select('#container').html("");
      var param = d3.select('#url_text').node().value;
      //param = 'http://ramanathanmuthuraman.github.io/React-Duck2Go/';
      var url = 'metrics?url=' + param;
      fetchData(url);

    });