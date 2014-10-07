/*! 
 * angular-loading-bar v0.3.0
 * https://chieffancypants.github.io/angular-loading-bar
 * Copyright (c) 2014 Wes Cruver
 * License: MIT
 */

msos.provide("ng.ui.loading");

ng.ui.loading.version = new msos.set_version(14, 7, 31);


// Start by loading our loading.css stylesheet
ng.ui.loading.css = new msos.loader();
ng.ui.loading.css.load('ng_ui_css_loading',   msos.resource_url('ng', 'ui/css/loading.css'));

// Below is the standard angular-loading-bar code, except angular-loading-bar -> ng.ui.loading
!function(){"use strict";angular.module("ng.util.loading",["loadingBar"]),angular.module("loadingBar",[]).config(["$httpProvider",function(a){var b=["$q","$cacheFactory","$timeout","$rootScope","cfpLoadingBar",function(b,c,d,e,f){function g(){d.cancel(i),f.complete(),k=0,j=0}function h(b){var d,e=a.defaults;if("GET"!==b.method||b.cache===!1)return b.cached=!1,!1;d=b.cache===!0&&void 0===e.cache?c.get("$http"):void 0!==e.cache?e.cache:b.cache;var f=void 0!==d?void 0!==d.get(b.url):!1;return void 0!==b.cached&&f!==b.cached?b.cached:(b.cached=f,f)}var i,j=0,k=0,l=f.latencyThreshold;return{request:function(a){return a.ignoreLoadingBar||h(a)||(e.$broadcast("cfpLoadingBar:loading",{url:a.url}),0===j&&(i=d(function(){f.start()},l)),j++,f.set(k/j)),a},response:function(a){return h(a.config)||(k++,e.$broadcast("cfpLoadingBar:loaded",{url:a.config.url}),k>=j?g():f.set(k/j)),a},responseError:function(a){return h(a.config)||(k++,e.$broadcast("cfpLoadingBar:loaded",{url:a.config.url}),k>=j?g():f.set(k/j)),b.reject(a)}}}];a.interceptors.push(b)}]).provider("cfpLoadingBar",function(){this.includeSpinner=!0,this.includeBar=!0,this.latencyThreshold=100,this.parentSelector="body",this.$get=["$document","$timeout","$animate","$rootScope",function(a,b,c,d){function e(){b.cancel(k),q||(d.$broadcast("cfpLoadingBar:started"),q=!0,t&&c.enter(n,m),s&&c.enter(p,m),f(.02))}function f(a){if(q){var c=100*a+"%";o.css("width",c),r=a,b.cancel(j),j=b(function(){g()},250)}}function g(){if(!(h()>=1)){var a=0,b=h();a=b>=0&&.25>b?(3*Math.random()+3)/100:b>=.25&&.65>b?3*Math.random()/100:b>=.65&&.9>b?2*Math.random()/100:b>=.9&&.99>b?.005:0;var c=h()+a;f(c)}}function h(){return r}function i(){d.$broadcast("cfpLoadingBar:completed"),f(1),k=b(function(){c.leave(n,function(){r=0,q=!1}),c.leave(p)},500)}var j,k,l=this.parentSelector,m=a.find(l),n=angular.element('<div id="loading-bar"><div class="bar"><div class="peg"></div></div></div>'),o=n.find("div").eq(0),p=angular.element('<div id="loading-bar-spinner"><div class="spinner-icon"></div></div>'),q=!1,r=0,s=this.includeSpinner,t=this.includeBar;return{start:e,set:f,status:h,inc:g,complete:i,includeSpinner:this.includeSpinner,latencyThreshold:this.latencyThreshold,parentSelector:this.parentSelector}}]})}();