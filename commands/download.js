require('colors');
var fs         = require('fs');
var inspect    = require('util').inspect;
var JSONStream = require('JSONStream');
var multimeter = require('multimeter');

var TaskClient = require('crp-task-client');
var error = require('../error');

exports =
module.exports = download;

module.exports.requiresAuth = true;

module.exports.usage =
function usage(name, args) {
  args.
    usage('Usage: crowdprocess' + ' ' + name + ' <task_id> [-O <results.json>] --wait').
    alias('O', 'output-file').
    boolean('w').
    alias('w', 'wait');
};

function download(args, credential) {
  var taskId = args._[0];
  if (! taskId) {
    error(new Error('No task id specified'));
  }


  /// Output stream

  var out;
  if (args.O) out = fs.createWriteStream(args.O);
  else out = process.stdout;

  var client = TaskClient({credential: credential});

  client.tasks.progress(taskId, function(err, stats) {
    if (err) error(err);

    if (args.O) console.error('This task has %d data units', stats.total);
    var complete = stats.complete;
    if (! complete) {
      console.error('0 results — quitting.'.red);
      process.exit(-1);
    }

    if (args.O) console.log('Downloading %d results...'.green, complete);

    if (args.O) {
      var multi = multimeter(process);
      var bar = multi.rel(0, -1);
    }

    var encoder = JSONStream.stringify();
    var s = client.tasks(taskId).results.getAll(args.wait);
    s.pipe(encoder).pipe(out);

    var arrived = 0;
    s.on('data', function(d) {
      arrived ++;
      if (arrived <= complete) updateBar();
    });

    encoder.once('end', function() {
      if (args.O) console.log('Saved to', args.O);
      finishedSending = true;
    });

    function updateBar() {
      if (args.O) {
        bar.percent((arrived / complete) * 100);
        if (arrived == complete) {
          multi.destroy();
          if (args.wait && ! args.O) {
            console.log('All results arrived, now waiting for new...');
          }
        }
      }
    }

  });
};