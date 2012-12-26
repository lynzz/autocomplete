define("arale/autocomplete/1.1.0/data-source",["arale/base/1.0.1/base","arale/class/1.0.0/class","arale/events/1.0.0/events","$"],function(a,b,c){function g(a){return"[object String]"===Object.prototype.toString.call(a)}function h(a){return a?a.replace(/^([a-z])/,function(a,b){return b.toUpperCase()}):""}var d=a("arale/base/1.0.1/base"),e=a("$"),f=d.extend({attrs:{source:null,type:"array"},initialize:function(a){f.superclass.initialize.call(this,a),this.id=0,this.callbacks=[];var b=this.get("source");if(g(b))this.set("type","url");else if(e.isArray(b))this.set("type","array");else if(e.isPlainObject(b))this.set("type","object");else{if(!e.isFunction(b))throw Error("Source Type Error");this.set("type","function")}},getData:function(a){return this["_get"+h(this.get("type"))+"Data"](a)},abort:function(){this.callbacks=[]},_done:function(a){this.trigger("data",a)},_getUrlData:function(a){var c,b=this,d=this.get("source").replace(/{{query}}/g,a?encodeURIComponent(a):"");d+=(d.indexOf("&")>-1?"&":"")+"_timestamp="+(new Date).getTime();var f="callback_"+this.id++;this.callbacks.push(f),c=/^(https?:\/\/)/.test(d)?{dataType:"jsonp"}:{dataType:"json"},e.ajax(d,c).success(function(a){e.inArray(f,b.callbacks)>-1&&(delete b.callbacks[f],b._done(a))}).error(function(){e.inArray(f,b.callbacks)>-1&&(delete b.callbacks[f],b._done({}))})},_getArrayData:function(){var a=this.get("source");return this._done(a),a},_getObjectData:function(){var b=this.get("source");return this._done(b),b},_getFunctionData:function(a){function d(a){b._done(a)}var b=this,c=this.get("source"),e=c.call(this,a,d);e&&this._done(e)}});c.exports=f}),define("arale/autocomplete/1.1.0/filter",["$"],function(a,b,c){function f(a,b){if(d.isPlainObject(a)){var c=b&&b.key||"value";return a[c]||""}return a}var d=a("$"),e={"default":function(a,b,c){var e=[];return d.each(a,function(a,b){var g={},h=f(b,c);d.isPlainObject(b)&&(g=d.extend({},b)),g.matchKey=h,e.push(g)}),e},startsWith:function(a,b,c){var e=[],g=b.length,h=RegExp("^"+b);return d.each(a,function(a,b){var i={},j=f(b,c);d.isPlainObject(b)&&(i=d.extend({},b)),h.test(j)&&(i.matchKey=j,g>0&&(i.highlightIndex=[[0,g]]),e.push(i))}),e}};c.exports=e}),define("arale/autocomplete/1.1.0/autocomplete",["./data-source","./filter","$","arale/overlay/0.9.13/overlay","arale/position/1.0.0/position","arale/iframe-shim/1.0.0/iframe-shim","arale/widget/1.0.2/widget","arale/base/1.0.1/base","arale/class/1.0.0/class","arale/events/1.0.0/events","arale/widget/1.0.2/templatable","gallery/handlebars/1.0.0/handlebars"],function(a,b,c){function m(a){return"[object String]"===Object.prototype.toString.call(a)}function n(a,b){if(!a)return b;if(d.isFunction(a))return a.call(this,b);if(m(a)){for(var c=a.split("."),e=b;c.length;){var g=c.shift();if(!e[g])break;e=e[g]}return e}return b}var d=a("$"),e=a("arale/overlay/0.9.13/overlay"),f=a("arale/widget/1.0.2/templatable"),g=a("gallery/handlebars/1.0.0/handlebars"),h=a("./data-source"),i=a("./filter"),j='<div class="{{classPrefix}}">\n<ul class="{{classPrefix}}-ctn" data-role="items">\n{{#each items}}\n<li data-role="item" class="{{../classPrefix}}-item" data-value="{{matchKey}}">{{highlightItem ../classPrefix matchKey}}</li>\n{{/each}}\n</ul>\n</div>',k={UP:38,DOWN:40,LEFT:37,RIGHT:39,ENTER:13,ESC:27,BACKSPACE:8},l=e.extend({Implements:f,attrs:{trigger:{value:null,getter:function(a){return d(a)}},classPrefix:"ui-autocomplete",align:{baseXY:[0,"100%"]},template:j,submitOnEnter:!0,dataSource:[],locator:"data",filter:void 0,inputFilter:function(a){return a},disabled:!1,selectFirst:!1,delay:100,selectedIndex:void 0,inputValue:"",data:[]},events:{"mousedown [data-role=item]":function(){this.selectItem(),this._firstMousedown=!0},mousedown:function(){this._secondMousedown=!0},"mouseenter [data-role=item]":function(a){var b=this.items.index(a.currentTarget);this.set("selectedIndex",b)}},templateHelpers:{highlightItem:function(a,b){var c=this.highlightIndex,e=0,f=b||this.matchKey||"",h="";if(d.isArray(c)){for(var i=0,j=c.length;j>i;i++){var l,m,k=c[i];if(d.isArray(k)?(l=k[0],m=k[1]-k[0]):(l=k,m=1),l>e&&(h+=f.substring(e,l)),f.length>l&&(h+='<span class="'+a+'-item-hl">'+f.substr(l,m)+"</span>"),e=l+m,e>=f.length)break}return f.length>e&&(h+=f.substring(e,f.length)),new g.SafeString(h)}return f}},parseElement:function(){this.model={classPrefix:this.get("classPrefix"),items:[]},l.superclass.parseElement.call(this)},setup:function(){var a=this.get("trigger"),b=this;l.superclass.setup.call(this),this.dataSource=new h({source:this.get("dataSource")}).on("data",this._filterData,this),this._initFilter(),this._blurHide([a]),this._tweakAlignDefaultValue(),a.attr("autocomplete","off").on("blur.autocomplete",d.proxy(this._blurEvent,this)).on("keydown.autocomplete",d.proxy(this._keydownEvent,this)).on("keyup.autocomplete",function(){clearTimeout(b._timeout),b._timeout=setTimeout(function(){b._keyupEvent.call(b)},b.get("delay"))})},destroy:function(){this._clear(),this.element.remove(),l.superclass.destroy.call(this)},hide:function(){this.dataSource.abort(),l.superclass.hide.call(this)},selectItem:function(){this.hide();var a=this.currentItem,b=this.get("selectedIndex"),c=this.get("data")[b];if(a){var d=a.attr("data-value");this.get("trigger").val(d),this.set("inputValue",d),this.trigger("itemSelect",c),this._clear()}},setInputValue:function(a){if(this.get("inputValue")!==a){this._start=!0,this.set("inputValue",a);var b=this.get("trigger");b.val()!==a&&b.val(a)}},_initFilter:function(){var a=this.get("filter");a=void 0===a?"url"===this.dataSource.get("type")?null:{name:"startsWith",func:i.startsWith,options:{key:"value"}}:d.isPlainObject(a)?i[a.name]?{name:a.name,func:i[a.name],options:a.options}:null:d.isFunction(a)?{func:a}:i[a]?{name:a,func:i[a]}:null,a||(a={name:"default",func:i["default"]}),this.set("filter",a)},_filterData:function(a){var b=this.get("filter"),c=this.get("locator");a=n(c,a),a=b.func.call(this,a,this.queryValue,b.options),this.set("data",a)},_blurEvent:function(){this._secondMousedown?this._firstMousedown&&(this.get("trigger").focus(),this.hide()):this.hide(),delete this._firstMousedown,delete this._secondMousedown},_keyupEvent:function(){if(!this.get("disabled")&&this._keyupStart){delete this._keyupStart;var a=this.get("trigger").val();this.setInputValue(a)}},_keydownEvent:function(a){if(!this.get("disabled"))switch(a.which){case k.ESC:this.hide();break;case k.UP:this._keyUp(a);break;case k.DOWN:this._keyDown(a);break;case k.LEFT:case k.RIGHT:break;case k.ENTER:this._keyEnter(a);break;default:this._keyupStart=!0}},_keyUp:function(a){if(a.preventDefault(),this.get("data").length){if(!this.get("visible"))return this.show(),void 0;this._step(-1)}},_keyDown:function(a){if(a.preventDefault(),this.get("data").length){if(!this.get("visible"))return this.show(),void 0;this._step(1)}},_keyEnter:function(a){this.get("visible")&&(this.selectItem(),this.get("submitOnEnter")||a.preventDefault())},_step:function(a){var b=this.get("selectedIndex");-1===a?b>0?this.set("selectedIndex",b-1):this.set("selectedIndex",this.items.length-1):1===a&&(this.items.length-1>b?this.set("selectedIndex",b+1):this.set("selectedIndex",0))},_clear:function(){this.$("[data-role=items]").empty(),this.set("selectedIndex",-1),delete this.items,delete this.lastIndex,delete this.currentItem},_tweakAlignDefaultValue:function(){var a=this.get("align");a.baseElement=this.get("trigger"),this.set("align",a)},_onRenderInputValue:function(a){this._start&&a&&(this.queryValue=this.get("inputFilter").call(this,a),this.queryValue&&(this.dataSource.abort(),this.dataSource.getData(this.queryValue))),""!==a&&this.queryValue||(this.set("data",[]),this.hide()),delete this._start},_onRenderData:function(a){this._clear(),this.model.items=a,this.renderPartial("[data-role=items]"),this.items=this.$("[data-role=items]").children(),this.currentItem=null,this.get("selectFirst")&&this.set("selectedIndex",0),d.trim(this.$("[data-role=items]").text())?this.show():this.hide()},_onRenderSelectedIndex:function(a){if(-1!==a){var b=this.get("classPrefix")+"-item-hover";this.currentItem&&this.currentItem.removeClass(b),this.currentItem=this.items.eq(a).addClass(b),this.trigger("indexChange",a,this.lastIndex),this.lastIndex=a}}});c.exports=l});