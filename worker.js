var fs = require('fs');
var path = require('path');
var jade = require('jade');

var fpath = path.join(__dirname, 'node_modules/mocha/lib/reporters/templates/coverage.jade');
var template = fs.readFileSync(fpath, 'utf8');
var htmlCov = jade.compile(template, {filename: fpath});


var coverageClass = function (n) {
  if (n >= 75) return 'high';
  if (n >= 50) return 'medium';
  if (n >= 25) return 'low';
  return 'terrible';
};

module.exports = {
  // Initialize the plugin for a job
  //   config:     taken from DB config extended by flat file config
  //   job & repo: see strider-runner-core
  //   cb(err, initialized plugin)
  init: function (config, job, context, cb) {
    config = config || {};
    var ret = {
      env: {
          test_fail: 0
      },
      listen: function (io, context) {
        var self = this;
        io.on('plugin.blanket.done', function (id, data) {

        });
      },
      prepare: function (context, done) {
        var haveit = fs.existsSync(path.join(context.dataDir, 'node_modules/blanket'));
        context.data({enabled: true});
        if (haveit) return done();
        context.cmd('npm install blanket', done);
      },
      test: function (context, done) {
        var self = this;
        context.comment('Generating coverage report');
        context.cmd({
          cmd: config.test || 'mocha -r blanket -R json-cov',
          silent: false
        }, function (err, stdout) {
          if(err) {
            self.env.test_fail = 1
          }
          /**
           * If any test fails it will return exit code for failure
           * Regardless of test failure continue
           */
          var beginOfJson = stdout.indexOf('{');
          var jsonString = stdout.substr(beginOfJson, stdout.length);
          var report;
          try {
            report = JSON.parse(jsonString);
          } catch (e) {
            return done(new Error('coverage report not json'));
          }
          var goodness = report.coverage > 80 ? 'good' : (report.coverage > 50 ? 'ok' : 'bad');
          report.files.map(function (file) {
            file.filename = path.relative(context.dataDir, file.filename);
          });
          /**
           * Attach the test results to the job object
           */
          // var newHTML = htmlCov({cov: report, coverageClass: coverageClass()})
          job.test_results = {
            percent: report.coverage,
            coverageStatus: goodness,
            covered: report.hits,
            sloc: report.sloc,
            stats: report.stats,
            failures: report.failures,
            files: report.files.map(function (file) {
              return {
                percent: file.coverage,
                covered: file.hits,
                sloc: file.sloc,
                path: file.filename
              };
            })
          };
          context.data({
            enabled: true,
            percent: report.coverage,
            coverageStatus: goodness,
            covered: report.hits,
            sloc: report.sloc,
            html: htmlCov({
              cov: report,
              coverageClass: coverageClass
            }),
            files: report.files.map(function (file) {
              return {
                percent: file.coverage,
                covered: file.hits,
                sloc: file.sloc,
                path: file.filename
              };
            })
          }, 'replace', null);
          if(self.env.test_fail) return done(err);
          done();
        });
      }
    };
    cb(null, ret);
  }
};

