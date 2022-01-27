# gulp自动化构建工作流

## 安装
```shell
yarn add humphrey-pages --dev
```

## 命令
```shell
humphrey-pages clean
humphrey-pages build
humphrey-pages develop
```

## 配置文件
在项目根目录创建`pages.config.js`文件

```js
module.exports = {
    data: {
        menus: [
            {
                name: 'Home',
                icon: 'aperture',
                link: 'index.html'
            },
            {
                name: 'Features',
                link: 'features.html'
            },
            {
                name: 'About',
                link: 'about.html'
            },
            {
                name: 'Contact',
                link: '#',
                children: [
                    {
                        name: 'CSDN',
                        link: 'https://blog.csdn.net/weixin_46652769'
                    },
                    {
                        name: 'github',
                        link: 'https://github.com/Humphrey2021'
                    },
                    {
                        name: 'divider'
                    },
                    {
                        name: 'About',
                        link: 'https://github.com/Humphrey2021'
                    }
                ]
            }
        ],
        pkg: require('./package.json'),
        date: new Date()
    },
    build: {
        src: 'src',
        dist: 'dist',
        temp: '.tmp',
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

```
可以自定义
