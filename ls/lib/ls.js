/***
 **                                                          _ooOoo_
 **                                                         o8888888o
 **                                                         88" . "88
 **                                                         (| -_- |)
 **                                                          O\ = /O
 **                                                      ____/`---'\____
 **                                                    .   ' \\| |// `.
 **                                                     / \\||| : |||// \
 **                                                   / _||||| -:- |||||- \
 **                                                     | | \\\ - /// | |
 **                                                   | \_| ''\---/'' | |
 **                                                    \ .-\__ `-` ___/-. /
 **                                                 ___`. .' /--.--\ `. . __
 **                                              ."" '< `.___\_<|>_/___.' >'"".
 **                                             | | : `- \`.;`\ _ /`;.`/ - ` : | |
 **                                               \ \ `-. \_ __\ /__ _/ .-` / /
 **                                       ======`-.____`-.___\_____/___.-`____.-'======
 **                                                          `=---='
 **
 **                                       .............................................
 **                                              佛祖保佑             永无BUG
 **                                      佛曰:
 **                                              写字楼里写字间，写字间里程序员；
 **                                              程序人员写程序，又拿程序换酒钱。
 **                                              酒醒只在网上坐，酒醉还来网下眠；
 **                                              酒醉酒醒日复日，网上网下年复年。
 **                                              但愿老死电脑间，不愿鞠躬老板前；
 **                                              奔驰宝马贵者趣，公交自行程序员。
 **                                              别人笑我忒疯癫，我笑自己命太贱；
 **                                              不见满街漂亮妹，哪个归得程序员？
 */
/**
 * Created by liangshan on 2017/11/13.
 */

const path = require('path');
const http = require('http');
const koa = require('koa');
const util = require('./util/index');
const config = require('./config/config');
const pkg = require('../package.json');
const controller = require('./controller/base');

global.ls = {};

module.exports = class {
  constructor (options = {}) {
    this.options = options;
    this.koa = new koa();
    this.init();
  }

  init () {
    const root_path = this.options.root_path || process.env.root_path || process.cwd();
    const app_path = path.resolve(root_path, this.options.app_path || process.env.app_path || 'app');

    util.define(ls, 'root_path', root_path);
    util.define(ls, 'app_path', app_path);
    util.define(ls, 'app', this.koa);
    util.define(ls.controller, 'base', controller);
    util.define(ls, 'version', pkg.version);

    // 缓存
    Object.defineProperty(ls, '_caches', {
      value: {},
      writable: true,
      configurable: false,
      enumerable: false
    });
  }

  /**
   * 注册异常处理
   *
   */
  captureError() {
    //koa 错误
    ls.app.on('error', (err, ctx) => {
      console.log(err, 'ERROR');
    });

    //promise reject错误
    process.on('unhandledRejection', (reason, promise) => {
      console.log(reason, 'ERROR');
    });

    //未知错误
    process.on('uncaughtException', err => {
      console.log(err, 'ERROR');
      if (err.message.indexOf(' EADDRINUSE ') > -1) {
        process.exit();
      }
    });
  }

  loadControllers () {
    console.log('controller path: ', ls.app_path)
  }

  createServer () {
    if (!this.server) {
      this.server = http.createServer(ls.app.callback());
    }
    this.server.listen(config.app_port || 3000);
    console.log(`服务已经启动: http://127.0.0.1:${config.app_port}`);
  }

  run () {
    this.loadControllers();
    this.captureError();
    this.createServer();
  }
}

