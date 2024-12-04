/**
 * laydate 日期与时间组件
 * MIT Licensed
 */
;!function(window, document) {
    "use strict";
    
    var isLayui = window.layui && layui.define
    ,config = {
        path: '', //假如浏览器未载入 layui.css 文件,则此处配置文件所在目录
        skin: null, //主题
        format: 'YYYY-MM-DD', //默认日期格式
        min: '1900-1-1', //有效最小日期,年月日必须用"-"分割
        max: '2099-12-31', //有效最大日期,年月日必须用"-"分割
        isInitValue: true, //用于控制是否自动向元素填充初始值
        isPreview: true, //用于控制是否显示底部的预览信息
        trigger: 'focus', //呼出控件的事件
        show: false, //是否直接显示,如果设置 true,则默认直接显示控件
        showBottom: true, //是否显示底部栏
        btns: ['clear', 'now', 'confirm'], //右下角显示的按钮,会按照数组顺序排列
        lang: 'cn', //语言,只支持cn/en,如果值为空,则会根据浏览器语言自动切换
        theme: 'default', //主题
        position: null, //控件定位方式定位
        calendar: false, //是否开启公历重要节日,仅支持中文版
        mark: {}, //日期备注,如重要事件或活动标记
        zIndex: null, //控件层叠顺序
        done: null, //控件选择完毕后的回调,点击清空/现在/确定也均会触发
        change: null //日期时间改变后的回调
    }
    
    //主体CSS配置
    ,theme = {
        //默认主题
        default: {
            main: '#009688' //主色调
            ,header: '#009688' //头部背景色
            ,hover: '#009688' //日期hover背景色
            ,input: '#009688' //输入框选中边框色
        }
    }
    
    //组件构造器
    ,Class = function(options){
        var that = this;
        that.index = ++laydate.index;
        that.config = lay.extend({}, config, options);
        laydate.ready(function(){
            that.init();
        });
    }
    
    //DOM查找
    ,lay = function(selector){
        return new LAY(selector);
    }
    
    //DOM构造器
    ,LAY = function(selector){
        var index = 0
        ,nativeDOM = typeof selector === 'object' ? [selector] : (
            this.selector = selector
            ,document.querySelectorAll(selector || null)
        );
        for(; index < nativeDOM.length; index++){
            this.push(nativeDOM[index]);
        }
    };
    
    //载入组件所需样式
    laydate.link = function(href, fn, cssname){
        //未设置路径,则不主动加载css
        if(!laydate.path) return;
        var head = document.getElementsByTagName('head')[0]
        ,link = document.createElement('link');
        if(typeof fn === 'string') cssname = fn;
        var app = (cssname || href).replace(/\.|\//g, '');
        var id = 'layuicss-'+ app
        ,timeout = 0;
        
        link.rel = 'stylesheet';
        link.href = laydate.path + href;
        link.id = id;
        
        if(!document.getElementById(id)){
            head.appendChild(link);
        }
        
        if(typeof fn !== 'function') return;
        
        //轮询css是否加载完毕
        (function poll() { 
            if(++timeout > 8 * 1000 / 100){
                return window.console && console.error('laydate.css: Invalid');
            }
            parseInt(lay.style(document.getElementById(id), 'width')) === 1989 ? fn() : setTimeout(poll, 100);
        }());
    };

    //核心入口  
    laydate.render = function(options){
        var inst = new Class(options);
        return thisDate.call(inst);
    };
    
    //将组件添加到全局
    window.laydate = laydate;
    
    //自动加载组件所需样式
    isLayui ? layui.define(function(exports){ //layui加载
        laydate.path = layui.cache.dir;
        exports('laydate', laydate);
    }) : ((typeof define === 'function' && define.amd) ? define : function(){ //普通script标签加载
        laydate.ready();
    })();

}(window, document); 