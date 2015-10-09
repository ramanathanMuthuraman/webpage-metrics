/* jshint node: true */
var express = require('express');
var phantomas = require('phantomas');
var url = require('url');
var router = express.Router();
var fs = require('fs');
var rimraf= require('rimraf');
/* GET users listing. */
router.get('/', function(req, res) {

	var url_parts = url.parse(req.url, true);
	var url_query = url_parts.query.url;
	var metrics = [];
	var proxy = 'http://10.144.1.10:8080';
	var results_folder = './public/results/';
	var folder_name = new Date().getTime();
	var current_result_path = results_folder+folder_name+'/';
	var title = url.parse(url_query).pathname;


	var page = {
		title: title,
		url: url_query,
		selector: 'body',
		screenshot_title : 'screenshot',
		har_title: 'har',
		reporter: 'json'
	};
	if (!fs.existsSync(results_folder)){
    	fs.mkdirSync(results_folder);
	}
	fs.mkdirSync(current_result_path);
	console.log(current_result_path+page.screenshot_title);
	phantomas(page.url, {
		'screenshot': current_result_path+page.screenshot_title+'.jpg',
		'timeout': 1000,
		'har': current_result_path+page.har_title,
	//	'proxy':proxy,
		'reporter': page.reporter
	}, function(err, json) {
		if(err){
			console.log(err);
		}
			fs.writeFileSync(current_result_path+'test.json', JSON.stringify(json));

		/*simplehar({
			har: current_result_path + page.title + '.har',
			html: current_result_path + page.title + '.html'
		});*/
		//console.log(json);
		metrics.push({
			'title': page.title,
			'stats': [{
				'title': 'DOM Content loaded',
				'resource': json.metrics.domInteractive + json.metrics.domComplete,
				'units': 'ms',
				'info': ''
				}, {
				'title': 'DOM elements count',
				'resource': json.metrics.DOMelementsCount,
				'units': 'elements',
				'info': ''
				}, {
				'title': 'Time Backend',
				'resource': json.metrics.timeBackend,
				'units': '%',
				'info': ''
				}, {
				'title': 'Time Frontend',
				'resource': json.metrics.timeFrontend,
				'units': '%',
				'info': ''
				}, {
				'title': 'AJAX calls',
				'resource': json.metrics.otherSize,
				'units': 'requests',
				'info': json.offenders.otherCount
				}, {
				'title': 'Time To First CSS',
				'resource': json.metrics.timeToFirstCss,
				'units': 'ms',
				'info': json.offenders.timeToFirstCss
				}, {
				'title': 'Time To First JS',
				'resource': json.metrics.timeToFirstJs,
				'units': 'ms',
				'info': json.offenders.timeToFirstJs
				}, {
				'title': 'Smallest Response',
				'resource': json.metrics.smallestResponse,
				'units': 'bytes',
				'info': json.offenders.smallestResponse
				}, {
				'title': 'Biggest Response',
				'resource': json.metrics.biggestResponse,
				'units': 'bytes',
				'info': json.offenders.biggestResponse
				}, {
				'title': 'Fastest Response',
				'resource': json.metrics.fastestResponse,
				'units': 'ms',
				'info': json.offenders.fastestResponse
				}, {
				'title': 'Slowest Response',
				'resource': json.metrics.slowestResponse,
				'units': 'ms',
				'info': json.offenders.slowestResponse
				}, {
				'title': 'Smallest Latency',
				'resource': json.metrics.smallestLatency,
				'units': 'ms',
				'info': json.offenders.smallestLatency
				}, {
				'title': 'Biggest Latency',
				'resource': json.metrics.biggestLatency,
				'units': 'ms',
				'info': json.offenders.biggestLatency
				},{
				'title': 'Caching Disabled',
				'resource': json.metrics.cachingDisabled,
				'units': 'files',
				'info': json.offenders.cachingDisabled
				}, {
				'title': 'Assets Not Gzipped',
				'resource': json.metrics.assetsNotGzipped,
				'units': 'files',
				'info': json.offenders.assetsNotGzipped
				}],
				'fileType': [{
				'title': 'CSS',
				'value': json.metrics.cssSize,
				'files': json.offenders.cssCount
				}, {
				'title': 'JS',
				'value': json.metrics.jsSize,
				'files': json.offenders.jsCount
				}, {
				'title': 'Images',
				'value': json.metrics.imageSize,
				'files': json.offenders.imageCount
				}, {
				'title': 'Fonts',
				'value': json.metrics.webfontSize,
				'files': json.offenders.webfontCount
				}]
		});
		//delete the temp results folder
		rimraf(current_result_path, function(err){
			if(err){
				return err;
			}
		});
		res.send(JSON.stringify(metrics));

	});


});

module.exports = router;
