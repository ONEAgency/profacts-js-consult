# -------------------------------------------------
# GULPFILE
# -------------------------------------------------
# MAINS
gulp = require "gulp"
gutil = require "gulp-util"
plumber = require "gulp-plumber"
concat = require "gulp-concat"
browserSync = require("browser-sync").create()
runSequence = require "run-sequence"

# JS
coffee = require "gulp-coffee"
jsmin = require "gulp-jsmin"
template = require "gulp-template-compile"
browserify = require "gulp-browserify"
cssToJs = require "gulp-css-to-js"
# SCSS
sass = require "gulp-sass"
sourcemaps = require "gulp-sourcemaps"
scsslint = require "gulp-scss-lint"
jsonImporter = require "node-sass-json-importer"

# CSS
minifyCss = require "gulp-minify-css"
rename = require "gulp-rename"

# -------------------------------------------------
# PATHS
# -------------------------------------------------
paths =
  scss: "./src/scss/**/*.scss"
  css: "./dist/css"
  cssfiles: []
  coffee: ["./src/coffee/**/*.coffee", "./src/coffee/*.coffee"]
  js: "./dist/js"
  jsfiles: []
  bower: "bower_components/"

gulp_src = gulp.src
gulp.src = ->
  gulp_src.apply(gulp, arguments).pipe plumber (error) ->
    gutil.log gutil.colors.red("Error (#{error.plugin}):  + #{error.message}")
    @emit "end"

# -------------------------------------------------
# TASKS
# -------------------------------------------------
gulp.task "scss", ->
  gulp.src paths.scss
  .pipe sourcemaps.init()
  .pipe sass
    includePaths: [
      require("node-bourbon").includePaths
      require("node-neat").includePaths[1]
      require("node-normalize-scss").includePaths
      "#{paths.bower}font-awesome/scss"
    ]
    importer: jsonImporter
  .on "error", (err) ->
    gutil.log gutil.colors.black.bgRed " SASS ERROR", gutil.colors.red.bgBlack " #{err.message.split("  ")[2]}"
    gutil.log gutil.colors.black.bgRed " FILE:", gutil.colors.red.bgBlack " #{err.message.split("\n")[0]}"
    gutil.log gutil.colors.black.bgRed " LINE:", gutil.colors.red.bgBlack " #{err.line}"
    gutil.log gutil.colors.black.bgRed " COLUMN:", gutil.colors.red.bgBlack " #{err.column}"
    @emit "end"
  .pipe sourcemaps.write()
  .pipe gulp.dest paths.css

gulp.task "scss-lint", ->
  gulp.src paths.scss
  .pipe scsslint({
    "maxBuffer": 999999
  })

gulp.task "compileexecute", ->
  gulp.src "src/coffee/execute.coffee"
  .pipe coffee()
  .pipe gulp.dest paths.js

gulp.task "coffee", ->
  gulp.src "src/coffee/ProfactsModal.coffee" , read: false
  .pipe browserify
    standalone: "ProfactsModal"
    transform: [ "coffeeify" ]
    extensions: [ ".coffee" ]
  .pipe rename "ProfactsModal.js"
  .pipe gulp.dest paths.js

gulp.task "makemodal", ->
  gulp.src ["dist/js/templates.js", "dist/js/ProfactsModal.js", "dist/js/execute.js"]
  .pipe concat "modal.js"
  .pipe gulp.dest paths.js

gulp.task "jst", ->
  gulp.src "src/templates/*.html"
    .pipe template(
      name: (file) -> file.relative.split(".")[0]
      namespace: "profactsmodaltemplates"
    )
    .pipe concat "templates.js"
    .pipe gulp.dest "./dist/js"

gulp.task "js", ->
  runSequence(
    "jst"
    "compileexecute"
    "coffee"
    "makemodal"
  )

gulp.task "minify-css", ->
  gulp.src paths.cssfiles
    .pipe sourcemaps.init()
    .pipe concat "app.css"
    .pipe minifyCss()
    .pipe rename {suffix: ".min"}
    .pipe gulp.dest paths.css

gulp.task "minify-js", ->
  gulp.src paths.jsfiles
    .pipe sourcemaps.init()
    .pipe concat "app.js"
    .pipe jsmin()
    .pipe rename {suffix: ".min"}
    .pipe sourcemaps.write()
    .pipe gulp.dest paths.js

# -------------------------------------------------
# GROUPED TASKS2
# -------------------------------------------------
# WATCH
gulp.task "watch", ->
  gulp.watch paths.scss, ["scss"]
  gulp.watch paths.coffee, ["js"]

gulp.task "browser-sync", ->
  browserSync.init
    server: "./dist"
    startPath: "example.html"


# DEFAULT
gulp.task "default", [
  "coffee"
  "scss"
  "js"
  #"minify-css"
  #"minify-js"
  "watch"
  "browser-sync"
]