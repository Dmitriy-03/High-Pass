const { src, dest, series, watch } = require("gulp");
const autoprefixer = require("gulp-autoprefixer");
const cleanCSS = require("gulp-clean-css");
const del = require("del");
const browserSync = require("browser-sync").create();
const svgSprite = require("gulp-svg-sprite");
const sourcemaps = require("gulp-sourcemaps");
const htmlmin = require("gulp-htmlmin");
const image = require("gulp-image");
const concat = require("gulp-concat");
const gulpif = require("gulp-if");
const sass = require("gulp-sass")(require("sass"));

let prod = false;

const isProd = (done) => {
  prod = true;
  done();
};

const clean = () => {
  return del(["app"]);
};

const htmlMinify = () => {
  return src("src/**/*.html")
    .pipe(
      gulpif(
        prod,
        htmlmin({
          collapseWhitespace: true,
        })
      )
    )
    .pipe(dest("app"))
    .pipe(browserSync.stream());
};

const styles = () => {
  return src("src/styles/style.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(gulpif(!prod, sourcemaps.init()))
    .pipe(concat("main.css"))
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(gulpif(prod, cleanCSS({ level: 2 })))
    .pipe(gulpif(!prod, sourcemaps.write(".")))
    .pipe(dest("app"))
    .pipe(browserSync.stream());
};

const svgSprites = () => {
  return src("src/img/svg/**.svg")
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../sprite.svg",
          },
        },
      })
    )
    .pipe(dest("app/img"));
};

const images = () => {
  return src([
    "src/img/**/*.jpg",
    "src/img/**/*.png",
    "src/img/**/*.jpeg",
    "src/img/*.svg",
  ])
    .pipe(image())
    .pipe(dest("app/img"));
};

const font = () => {
  return src("src/font/*.{woff2,woff}").pipe(dest("app/font"));
};

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: "app",
    },
  });

  watch("src/*.html", htmlMinify);
  watch("src/styles/**/*.scss", styles);
  watch("src/img/svg/**.svg", svgSprites);
  watch("src/img/**/*.{jpg,jpeg,png}", images);
};

exports.styles = styles;
exports.htmlMinify = htmlMinify;
exports.dev = series(
  clean,
  htmlMinify,
  styles,
  font,
  svgSprites,
  images,
  watchFiles
);

exports.build = series(
  isProd,
  clean,
  htmlMinify,
  styles,
  font,
  svgSprites,
  images
);
