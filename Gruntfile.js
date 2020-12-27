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
  const execs = joinObjAttrs(parseYaml("routines.yml"));
  const force = ["prettier"];

  grunt.initConfig({ exec: execs });
  grunt.loadNpmTasks("grunt-exec");
  grunt.loadNpmTasks("grunt-force-task");

  for (let name of Object.keys(execs)) {
    force.includes(name)
      ? grunt.registerTask(name, "force:exec:" + name)
      : grunt.registerTask(name, "exec:" + name);
  }

  grunt.registerTask("lint", ["cspell", "eslint"]);
  grunt.registerTask("format", ["prettier", "csscomb"]);
  grunt.registerTask("tests", ["jasmine"]);
  grunt.registerTask("prebuild", ["format", "lint"]);
  grunt.registerTask("dev", ["prebuild", "build", "tests", "run"]);
};