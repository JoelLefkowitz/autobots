fs = require("fs");
YAML = require("yaml");

function joinListEntries(x) {
  return [x[0], x[1].join(" ")];
}

function joinObjAttrs(x) {
  return Object.fromEntries(Object.entries(x).map(joinListEntries));
}

function parseYaml(x) {
  return YAML.parse(fs.readFileSync(x, "utf8"));
}

module.exports = function (grunt) {
  const forceTasks = ["prettier"];
  const routines = joinObjAttrs(parseYaml("routines.yml"));

  const watchers = {
    prebuild: {
      files: 'src/**/*.ts',
      tasks: ['prebuild'],
      options: {
        debounceDelay: 500,
      },
    }
  };

  grunt.initConfig({exec: routines, watch: watchers});

  grunt.loadNpmTasks("grunt-exec");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-force-task");

  for (let name of Object.keys(routines)) {
    forceTasks.includes(name)
      ? grunt.registerTask(name, "force:exec:" + name)
      : grunt.registerTask(name, "exec:" + name);
  }

  grunt.registerTask("lint", ["cspell", "eslint"]);
  grunt.registerTask("format", ["prettier"]);
  grunt.registerTask("tests", ["jasmine"]);
  grunt.registerTask("prebuild", ["format", "lint"]);
  grunt.registerTask("prepublish", ["prebuild", "compile", "tests"]);

  grunt.registerTask("dev", ["prepublish", "run"]);
  grunt.registerTask("devNew", ["prepublish", "new"]);
}
