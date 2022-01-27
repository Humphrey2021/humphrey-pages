const { src, dest, parallel, series, watch } = require('gulp')
const sass = require('gulp-sass')(require('sass'))
const del = require('del')
const browserSync = require('browser-sync')
const loadPlugins = require('gulp-load-plugins')
const plugins = loadPlugins()
const bs = browserSync.create()
const cwd = process.cwd()
const path = require('path')

let config = {
    // default config
    build: {
        src: 'src',
        dist: 'dist',
        temp: 'temp',
        public: 'public',
        paths: {
            styles: 'assets/styles/*.scss',
            scripts: 'assets/scripts/*.js',
            pages: '*.html',
            images: 'assets/images/**',
            fonts: 'assets/fonts/**'

        }
    }
}

try {
    // config = require(`${cwd}/pages.config.js`)
    const loadConfig = require(`${cwd}/pages.config.js`)
    config = Object.assign({}, config, loadConfig)
} catch (e) { }

// 清除dist文件
const clean = () => {
    return del([config.build.dist, config.build.temp])
}

// 处理样式
const style = () => {
    return src(config.build.paths.styles, { base: config.build.src, cwd: config.build.src })
        .pipe(sass())
        .pipe(dest(config.build.temp))
        .pipe(bs.reload({ stream: true }))
}

// 处理js文件
const script = () => {
    return src(config.build.paths.scripts, { base: config.build.src, cwd: config.build.src })
        // .pipe(babel({ presets: ['@babel-preset-env'] }))
        // 写法换了啊  @babel-preset-env ==> @babel/env
        .pipe(plugins.babel({ presets: [require('@babel/preset-env')] }))
        .pipe(dest(config.build.temp))
        .pipe(bs.reload({ stream: true }))
}

// 处理模版文件
const page = () => {
    return src(config.build.paths.pages, { base: config.build.src, cwd: config.build.src })
        .pipe(plugins.swig({ data: config.data, defaults: { cache: false } })) // 防止模板缓存导致页面不能及时更新
        .pipe(dest(config.build.temp))
        .pipe(bs.reload({ stream: true }))
}

// 图片转换
const image = () => {
    return src(config.build.paths.images, { base: config.build.src, cwd: config.build.src })
        .pipe(plugins.imagemin())
        .pipe(dest(config.build.dist))
}

// 字体文件
const font = () => {
    return src(config.build.paths.fonts, { base: config.build.src, cwd: config.build.src })
        .pipe(plugins.imagemin())
        .pipe(dest(config.build.dist))
}

// 额外文件处理
const extra = () => {
    return src('**', { base: config.build.public, cwd: config.build.public })
        .pipe(dest(config.build.dist))
}

const serve = () => {
    watch(config.build.paths.styles, { cwd: config.build.src }, style)
    watch(config.build.paths.scripts, { cwd: config.build.src }, script)
    watch(config.build.paths.pages, { cwd: config.build.src }, page)
    // watch('src/assets/images/**', image)
    // watch('src/assets/fonts/**', font)
    // watch('public/**', extra)
    // 监听，这些页面发生变化时，会自动更新，但是未改变的时候不用去管
    watch([
        config.build.paths.images,
        config.build.paths.fonts
    ], { cwd: config.build.src }, bs.reload)
    watch('**', { cwd: config.build.public }, bs.reload)
    bs.init({
        notify: false,
        port: 8080,
        open: true, // 是否自动打开浏览器
        // files: 'dist/**', // 添加之后 .pipe(bs.reload({ stream: true }))， 就不需要这一行代码了
        server: {
            baseDir: [config.build.temp, config.build.src, config.build.public],
            routes: {
                '/node_modules': 'node_modules'
            }
        }
    })
}

const useref = () => {
    return src(config.build.paths.pages, { base: config.build.temp, cwd: config.build.temp })
        .pipe(plugins.useref({ searchPath: [config.build.temp, '.'] }))
        // html js css
        .pipe(plugins.if(/\.js$/, plugins.uglify()))
        .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
        .pipe(plugins.if(/\.html$/, plugins.htmlmin({
            collapseWhitespace: true,
            minifyCSS: true,
            minifyJS: true
        })))
        .pipe(dest(config.build.dist))
}

// 同时处理以上任务
// 处理src内文件转换工作
const compile = parallel(style, script, page)
// 上线时执行的任务
const build = series(clean, parallel(series(compile, useref), image, font, extra))

const develop = series(compile, serve)

module.exports = {
    clean,
    build,
    develop
}
