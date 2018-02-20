webpackJsonp([10],{"./web/static/js/userDashboard.js":function(e,t,s){"use strict";(function(e){function n(t){var s=e(".store-select-box").chosen().val(),n=e(".select-box-large.institution").chosen().val(),l=w.default.getDateRanges(),f=l.startDate,h=l.endDate;!s&&t.storeId&&(s=t.storeId),!n&&t.institutionIds&&(n=t.institutionIds),o(f,h,s,n),a(f,h,s,n),i(f,h,s,n),r(f,h,s,n),c(f,h,s,n),u(f,h,s,n),d(f,h,s,n)}function o(t,n,o,a){e.post("/sessions",{storeId:[o],dimension:"day",startDate:t,endDate:n,institutionIds:a,_csrf:z},function(e){if(e.success){var t=l(e.data);return h("sessions","column",t.activeUsers),h("sessions-new","column",t.newUsers)}s.e(0).then(function(){s("./web/static/js/flash.js").default.render({payload:e})}.bind(null,s)).catch(s.oe)})}function a(t,n,o,a){e.post("/users/events/summary",{storeId:o,startDate:t,endDate:n,events:["bookDownloadComplete"],institutionIds:a,userIds:[],_csrf:z},function(e){if(e.success)return h("book-downloads","column",f(e.data));s.e(0).then(function(){s("./web/static/js/flash.js").default.render({payload:e})}.bind(null,s)).catch(s.oe)})}function i(t,n,o,a){e.post("/users/events/summary",{storeId:o,startDate:t,endDate:n,events:["bookOpen"],institutionIds:a,userIds:[],_csrf:z},function(e){if(e.success)return h("book-open","column",f(e.data));s.e(0).then(function(){s("./web/static/js/flash.js").default.render({payload:e})}.bind(null,s)).catch(s.oe)})}function r(t,n,o,a){e.post("/users/events/summary",{storeId:o,startDate:t,endDate:n,events:["searchResult"],institutionIds:a,userIds:[],_csrf:z},function(e){if(e.success)return h("book-search","column",f(e.data));s.e(0).then(function(){s("./web/static/js/flash.js").default.render({payload:e})}.bind(null,s)).catch(s.oe)})}function c(t,n,o,a){e.post("/users/events/summary",{storeId:o,startDate:t,endDate:n,events:["noteAdd"],institutionIds:a,userIds:[],_csrf:z},function(e){if(e.success)return h("book-notes","column",f(e.data));s.e(0).then(function(){s("./web/static/js/flash.js").default.render({payload:e})}.bind(null,s)).catch(s.oe)})}function u(t,n,o,a){e.post("/users/events",{storeId:o,startDate:t,endDate:n,events:["bookDownloadComplete"],institutionIds:a,limit:5,_csrf:z},function(e){if(e.success)return p("top-user-download","column",v(e.data));s.e(0).then(function(){s("./web/static/js/flash.js").default.render({payload:e})}.bind(null,s)).catch(s.oe)})}function d(t,n,o,a){e.post("/users/events",{storeId:o,startDate:t,endDate:n,events:["bookOpen"],institutionIds:a,limit:5,_csrf:z},function(e){if(e.success)return p("top-user-open","column",v(e.data));s.e(0).then(function(){s("./web/static/js/flash.js").default.render({payload:e})}.bind(null,s)).catch(s.oe)})}function l(e){if(!e.length)return{activeUsers:[],newUsers:[]};var t={activeUsers:[{name:"Active Users",data:[]}],newUsers:[{name:"New Users",data:[]}]};return U()(e,function(e){var s=x()(1e3*e.timestamp).utc().valueOf();t.activeUsers[0].data.push([s,e.users]),t.newUsers[0].data.push([s,e.newusers])}),t}function f(e){return e.length?[{name:"No. of users",data:k()(e,function(e){return[x()(1e3*e.timestamp).utc().valueOf(),e.count]})}]:[]}function h(e,t,s){g.a.chart(document.getElementsByClassName(e)[0],{chart:{type:t,backgroundColor:"transparent",zoomType:"xy"},credits:{enabled:!1},title:{text:s.length?null:"No data"},xAxis:{type:"datetime",dateTimeLabelFormats:{day:"%e %b '%y"},labels:{style:{fontSize:"13px"}}},yAxis:{title:{text:"Count"}},legend:{enabled:!1},tooltip:{shared:!1,formatter:function(){return g.a.dateFormat("%e %b, %Y",this.x)+"<br />"+this.series.name+": <b>"+this.y+"</b>"}},series:s})}function p(e,t,s){g.a.chart(document.getElementsByClassName(e)[0],{chart:{type:t,backgroundColor:"transparent",zoomType:"xy"},credits:{enabled:!1},title:{text:s.length?null:"No data"},xAxis:{type:"category",labels:{style:{fontSize:"13px"}}},plotOptions:{series:{stacking:"normal"}},yAxis:{title:{text:"Activity count"}},legend:{enabled:!1},tooltip:{formatter:function(){return"Name : "+this.point.name+" <br/> Count :  "+this.y}},series:s,exporting:{chartOptions:{plotOptions:{series:{dataLabels:{enabled:!1}}}},scale:3}})}function b(t){t||(t=e(".store-select-box").chosen().val());var n="institutions:"+t;if("undefined"!=typeof Storage&&void 0!==sessionStorage[n]){var o=JSON.parse(sessionStorage[n]);if(o.length)return m(o)}e.post("/institutions",{storeId:t,_csrf:z},function(e){if(e.success)return"undefined"!=typeof Storage&&(sessionStorage[n]=JSON.stringify(e.data)),m(e.data);s.e(0).then(function(){s("./web/static/js/flash.js").default.render({payload:e})}.bind(null,s)).catch(s.oe)})}function m(t){var s=T.institutionIds,n="";e(".select-box-large.institution option").remove(),n=S()(t,function(e,t){return e+"<option "+(C()(s,t.id)!=-1?'selected="selected"':"")+' value="'+t.id+'">'+t.name+"</option>"},""),e(".select-box-large.institution").append(n),e(".select-box-large.institution").chosen().trigger("chosen:updated")}function v(e){return e.length?[{name:"Top Users",data:k()(e,function(e){return[e.name?e.name:e.id,e.count]})}]:[]}Object.defineProperty(t,"__esModule",{value:!0});var y=s("./node_modules/highcharts/highcharts.js"),g=s.n(y),j=s("./node_modules/moment/moment.js"),x=s.n(j),w=s("./web/static/js/datePicker.js"),I=s("./node_modules/qs/lib/index.js"),D=s.n(I),_=s("./node_modules/lodash/map.js"),k=s.n(_),O=s("./node_modules/lodash/forEach.js"),U=s.n(O),N=s("./node_modules/lodash/reduce.js"),S=s.n(N),A=s("./node_modules/lodash/indexOf.js"),C=s.n(A),q=(s("./web/static/js/common.js"),s("./node_modules/chosen-npm/public/chosen.jquery.js")),z=(s.n(q),e("input[name=_csrf]").val()),T=D.a.parse(window.location.search.substring(1));U()([".store-select-box",".select-box-large.institution"],function(t){e(t).chosen({disable_search:!0})}),e(".btnApply").on("click",function(){n(T)}),e(".store-select-box").chosen().change(function(){b()}),e(".select-box-large.institution").chosen(),e(".select-box-large.book").chosen(),e('.box-header > [data-toggle="tooltip"]').tooltip(),w.default.setDatePicker('input[name="daterange"]'),n(T),b(T.storeId),e(".user-details").on("click",function(t){t.preventDefault();var s=e(".store-select-box").chosen().val(),n=e(".select-box-large.institution").chosen().val(),o=e(this).data("event");window.location="/users/daily?"+D.a.stringify({storeId:s,institutionIds:n,event:o})}),e(".top-user-details").on("click",function(t){t.preventDefault();var s=e(".store-select-box").chosen().val(),n=e(".select-box-large.institution").chosen().val(),o=e(this).data("event");window.location="/users/activity?"+D.a.stringify({storeId:s,institutionIds:n,event:o})})}).call(t,s("./node_modules/jquery/dist/jquery.js"))}},["./web/static/js/userDashboard.js"]);