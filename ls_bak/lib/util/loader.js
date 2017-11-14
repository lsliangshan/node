'use strict';

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2017 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/4/27
 */
const path = require('path');
const fs = require('fs');
const assert = require('assert');
const lib = require('./index.js');

/*eslint-disable consistent-return */
module.exports = class {
    constructor(loadPath, options, skip) {
        // 启动目录
        this.loadPath = loadPath;
        let loaders = {};
        if (options instanceof Array) {
            for (var _iterator = options, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
                var _ref;

                if (_isArray) {
                    if (_i >= _iterator.length) break;
                    _ref = _iterator[_i++];
                } else {
                    _i = _iterator.next();
                    if (_i.done) break;
                    _ref = _i.value;
                }

                let option = _ref;

                option.skip = skip || false;
                loaders = lib.extend(loaders, this.load(option) || {});
            }
        } else {
            options.skip = skip || false;
            loaders = this.load(options) || {};
        }
        return loaders;
    }

    /**
     * loop load
     * 
     * @param {any} dir 
     * @param {boolean} [skip=false] 
     * @returns 
     */
    walk(dir, skip = false) {
        dir = path.resolve(this.loadPath, dir);
        const exist = fs.existsSync(dir);
        if (!exist) {
            return;
        }

        const files = fs.readdirSync(dir);
        let list = [],
            p;

        for (var _iterator2 = files, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : (0, _getIterator3.default)(_iterator2);;) {
            var _ref2;

            if (_isArray2) {
                if (_i2 >= _iterator2.length) break;
                _ref2 = _iterator2[_i2++];
            } else {
                _i2 = _iterator2.next();
                if (_i2.done) break;
                _ref2 = _i2.value;
            }

            let file = _ref2;

            p = fs.statSync(path.resolve(dir, file));
            if (!skip && p.isFile()) {
                list.push(path.resolve(dir, file));
            } else if (p.isDirectory()) {
                list = list.concat(this.walk(path.resolve(dir, file), false));
            }
        }

        return list;
    }

    /**
     * load files
     * 
     * @param {any} [options={}] 
     * @param {boolean} [skip=false] 
     * @returns 
     */
    load(options = {}) {
        assert(typeof options.root === 'string', 'root must be specified');

        options.suffix = options.suffix || '.js';
        options.filter = options.filter || [];
        options.skip = options.prefix === '/' ? true : options.skip || false;

        let loaders = {};

        let paths = this.walk(options.root, options.skip);
        if (!paths) {
            return;
        }
        let name = '',
            tempPath = '',
            regExp = new RegExp(`${options.suffix}$`);
        for (let key in paths) {
            tempPath = paths[key].replace(/(\\|\/\/)/g, '/');
            name = path.relative(path.resolve(this.loadPath, options.root), tempPath);
            if (regExp.test(name)) {
                name = name.slice(0, name.lastIndexOf(options.suffix));
                /*eslint-disable no-loop-func */
                options.filter.forEach((v, i) => {
                    name = name.replace(v, '');
                });
                if (name) {
                    //clear require cache
                    this.cleanCache(tempPath);
                    loaders[name] = require(tempPath);
                }
            }
        }

        return loaders;
    }

    /**
     * clear require cache
     * 
     * @param {any} modulePath 
     */
    cleanCache(modulePath) {
        let module = require.cache[modulePath];
        // remove reference in module.parent
        if (module && module.parent) {
            module.parent.children.splice(module.parent.children.indexOf(module), 1);
        }
        require.cache[modulePath] = null;
    }

};