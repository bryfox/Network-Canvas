"use strict";var Canvas=function e(t){function o(e,t,o){for(;1.1*e.width()<t.width()-2*o;)e.fontSize(1.1*e.fontSize()),e.y((t.height()-e.height())/2);e.setX(t.getX()-e.getWidth()/2),e.setY(t.getY()-e.getHeight()/1.8)}var n,i,r,d,a,s={},c=[],l=!1,f=!1,g,u={blue:"#0174DF",placidblue:"#83b5dd",violettulip:"#9B90C8",hemlock:"#9eccb3",paloma:"#aab1b0",freesia:"#ffd600",cayenne:"#c40000",celosiaorange:"#f47d44",sand:"#ceb48d",dazzlingblue:"#006bb6",edge:"#e85657",selected:"gold"},w={defaultNodeSize:35,defaultNodeColor:u.blue,defaultEdgeColor:u.edge,concentricCircleColor:"#ffffff",concentricCircleNumber:5,nodeTypes:[{name:"Person",color:u.blue},{name:"OnlinePerson",color:u.hemlock},{name:"Organisation",color:u.cayenne},{name:"Professional",color:u.violettulip}]},v=function(e){s.addNode(e.detail)},h=function(e){s.addEdge(e.detail)},m=function(e){s.removeNode(e.detail)},p=function(e){s.removeEdge(e.detail)},y=function(){var e=$(".info-button").offset(),t=$(".canvas-title").offset();$(".canvas-title").data("oldPos",t),console.log(t),$(".canvas-title").css({position:"absolute"}),$(".canvas-title").offset(t),$(".canvas-title").children().hide(),$(".canvas-title").addClass("closed"),$(".canvas-title").offset(e),setTimeout(function(){$(".canvas-popover").hide(),$(".info-button").css("visibility","visible")},500)},k=function(){$(".info-button").css("visibility","hidden"),$(".canvas-popover").show(),$(".canvas-title").offset($(".canvas-title").data("oldPos")),$(".canvas-title").removeClass("closed"),setTimeout(function(){$(".canvas-title").children().show()},500)},b=function(e){if(!f&&(l||($(".new-node-form").addClass("node-form-open"),$(".content").addClass("blurry"),l=!0,$(".name-box").focus()),8!==e.which||$(e.target).is("input, textarea, div")||e.preventDefault(),13===event.which)){$(".new-node-form").removeClass("node-form-open"),$(".content").removeClass("blurry"),l=!1;var t={label:$(".name-box").val()};network.addNode(t),$(".name-box").val("")}},C=function(){s.destroy()};return s.init=function(){notify("Canvas initialising.",1),s.initKinetic(),s.drawUIComponents(),extend(w,t),g=menu.addMenu("Canvas","hi-icon-support"),menu.addItem(g,"Load Network","icon-play",null),menu.addItem(g,"Create Random Graph","icon-play",null),menu.addItem(g,"Download Network Data","icon-play",null),menu.addItem(g,"Reset Node Positions","icon-play",s.resetPositions),menu.addItem(g,"Clear Graph","icon-play",null),window.addEventListener("nodeAdded",v,!1),window.addEventListener("edgeAdded",h,!1),window.addEventListener("nodeRemoved",m,!1),window.addEventListener("edgeRemoved",p,!1),window.addEventListener("changeStageStart",C,!1),$(".close-popover").on("click",y),$(".info-button").on("click",k);var e=network.getEdges({from:network.getNodes({type_t0:"Ego"})[0].id,type:"Dyad"});console.log(e);for(var o=0;o<e.length;o++)s.addNode(e[o])},s.destroy=function(){menu.removeMenu(g),$(".new-node-form").remove(),window.removeEventListener("nodeAdded",v,!1),window.removeEventListener("edgeAdded",h,!1),window.removeEventListener("nodeRemoved",m,!1),window.removeEventListener("edgeRemoved",p,!1),window.removeEventListener("changeStageStart",C,!1),$(document).off("keypress",b),$(".close-popover").off("click",y),$(".info-button").off("click",k)},s.resetPositions=function(){var e=network.getEdges({from:network.getNodes({type_t0:"Ego"})[0].id,type:"Dyad"});console.log(e);for(var t=0;t<e.length;t++)network.updateEdge(e[t].id,{coords:[]})},s.addNode=function(e){notify("Canvas is creating a node.",2),console.log(e);var t,n=Math.round(randomBetween(0,w.nodeTypes.length-1)),i=network.getNodes().length;e.label=e.nname_t0;var a={coords:[$(window).width()+50,100],id:i,label:"Undefined",size:w.defaultNodeSize,type:w.nodeTypes[n].name,color:"rgba(0,0,0,0.8)",strokeWidth:1};extend(a,e),a.id=parseInt(a.id,10),a.type="Person";var l=new Kinetic.Group({id:a.id,x:a.coords[0],y:a.coords[1],name:a.label,edges:[],type:a.type,draggable:!0,dragDistance:10});switch(a.type){case"Person":t=new Kinetic.Circle({radius:a.size,fill:a.color,stroke:"white",strokeWidth:a.strokeWidth});break;case"Organisation":t=new Kinetic.Rect({width:2*a.size,height:2*a.size,fill:a.color,stroke:s.calculateStrokeColor(a.color),strokeWidth:a.strokeWidth});break;case"OnlinePerson":t=new Kinetic.RegularPolygon({sides:3,fill:a.color,radius:1.2*a.size,stroke:s.calculateStrokeColor(a.color),strokeWidth:a.strokeWidth});break;case"Professional":t=new Kinetic.Star({numPoints:6,fill:a.color,innerRadius:a.size-a.size/3,outerRadius:a.size+a.size/3,stroke:s.calculateStrokeColor(a.color),strokeWidth:a.strokeWidth})}var f=new Kinetic.Text({text:a.label,fontFamily:"Lato",fill:"white",align:"center",fontStyle:500});if(notify("Putting node "+a.label+" at coordinates x:"+a.coords[0]+", y:"+a.coords[1],2),l.on("dragstart",function(){notify("dragstart",1),this.attrs.oldx=this.attrs.x,this.attrs.oldy=this.attrs.y,this.moveToTop(),d.draw()}),l.on("dragmove",function(){notify("Dragmove",0);var e=a.id;$.each(r.children,function(t,o){if(o.attrs.from.id===e||o.attrs.to.id===e){var n=[s.getNodeByID(o.attrs.from.id).getX(),s.getNodeByID(o.attrs.from.id).getY(),s.getNodeByID(o.attrs.to.id).getX(),s.getNodeByID(o.attrs.to.id).getY()];o.attrs.points=n}}),r.draw()}),l.on("tap click",function(){var e=new CustomEvent("log",{detail:{eventType:"nodeClick",eventObject:this.attrs.id}});window.dispatchEvent(e),this.moveToTop(),d.draw()}),l.on("dbltap dblclick",function(){notify("double tap",1),c.push(this),console.log(c),2===c.length?(console.log(c),c[1].children[0].stroke("white"),c[0].children[0].stroke("white"),network.addEdge({from:c[0].attrs.id,to:c[1].attrs.id})===!1&&(notify("Canvas removing edge.",2),network.removeEdge(network.getEdges({from:c[0].attrs.id,to:c[1].attrs.id}))),c=[],d.draw()):(this.children[0].stroke(u.selected),d.draw())}),l.on("dragend",function(){notify("dragend",1);var e={},t={};e.x=this.attrs.oldx,e.y=this.attrs.oldy,t.x=this.attrs.x,t.y=this.attrs.y;var o={from:e,to:t},n=this,i=new CustomEvent("log",{detail:{eventType:"nodeMove",eventObject:o}});window.dispatchEvent(i),network.setProperties(network.getEdge(n.attrs.id),{coords:[n.attrs.x,n.attrs.y]}),delete this.attrs.oldx,delete this.attrs.oldy}),o(f,t,10),l.add(t),l.add(f),d.add(l),console.log(l),d.draw(),!e.coords||0===e.coords.length){var g=new Kinetic.Tween({node:l,x:$(window).width()-150,y:100,duration:.7,easing:Kinetic.Easings.EaseOut});g.play(),network.setProperties(network.getNode(a.id),{coords:[$(window).width()-150,100]})}return l},s.addEdge=function(e){notify("Canvas is adding an edge.",2);var t=network.getNode(e.from),o=network.getNode(e.to),n=[t.coords[0],t.coords[1],o.coords[0],o.coords[1]],i=new Kinetic.Line({strokeWidth:2,opacity:1,stroke:w.defaultEdgeColor,from:t,to:o,points:n});return r.add(i),r.draw(),d.draw(),notify("Created Edge between "+t.label+" and "+o.label,"success",2),!0},s.removeEdge=function(e){var t=network.getNode(e.from),o=network.getNode(e.to);notify("Removing edge."),$.each(s.getKineticEdges(),function(e,n){console.log(e),console.log(n),(n.attrs.from===t&&n.attrs.to===o||n.attrs.from===o&&n.attrs.to===t)&&(r.children[e].remove(),r.draw())})},s.clearGraph=function(){r.removeChildren(),r.clear(),d.removeChildren(),d.clear()},s.initKinetic=function(){n=new Kinetic.Stage({container:"kineticCanvas",width:window.innerWidth,height:window.innerHeight}),i=new Kinetic.Layer,d=new Kinetic.Layer,r=new Kinetic.Layer,a=new Kinetic.Layer,n.add(i),n.add(r),n.add(d),n.add(a),notify("Kinetic stage initialised.",1)},s.drawUIComponents=function(){for(var e,t,o=w.concentricCircleColor,n=window.innerHeight-w.defaultNodeSize,r=.1,d=0;d<w.concentricCircleNumber;d++){var s=1-d/w.concentricCircleNumber,c=n/2*s;t=new Kinetic.Circle({x:window.innerWidth/2,y:window.innerHeight/2,radius:c,stroke:"white",strokeWidth:1.5,opacity:0}),e=new Kinetic.Circle({x:window.innerWidth/2,y:window.innerHeight/2,radius:c,fill:o,opacity:r,strokeWidth:0}),r+=(.3-r)/w.concentricCircleNumber,i.add(e),i.add(t)}var l=new Kinetic.Circle({radius:50,stroke:"#666",strokeWidth:0,y:window.innerHeight-100,x:100});l.on("click tap",function(){}),a.add(l),i.draw(),a.draw(),notify("User interface initialised.",1)},s.initNewNodeForm=function(){var e=$('<div class="new-node-form"></div>'),t=$('<div class="new-node-inner"></div>');e.append(t),t.append("<h1>Add a new contact</h1>"),t.append("<p>Some text accompanying the node creation box.</p>"),t.append('<input type="text" class="form-control name-box"></input>'),$(".content").after(e),$(document).on("keypress",b)},s.getKineticNodes=function(){return d.children},s.getKineticEdges=function(){return r.children},s.getSimpleNodes=function(){var e={},t=s.getKineticNodes();return $.each(t,function(t,o){e[o.attrs.id]={},e[o.attrs.id].x=o.attrs.x,e[o.attrs.id].y=o.attrs.y,e[o.attrs.id].name=o.attrs.name,e[o.attrs.id].type=o.attrs.type,e[o.attrs.id].size=o.attrs.size,e[o.attrs.id].color=o.attrs.color}),e},s.getSimpleEdges=function(){var e={},t=0;return $.each(r.children,function(o,n){e[t]={},e[t].from=n.attrs.from.attrs.id,e[t].to=n.attrs.to.attrs.id,t++}),e},s.getSimpleEdge=function(e){var t=s.getSimpleEdges();if(!e)return!1;var o=t[e];return o},s.getEdgeLayer=function(){return r},s.getNodeByID=function(e){var t={},o=s.getKineticNodes();return $.each(o,function(o,n){n.attrs.id===e&&(t=n)}),t},s.getNodeColorByType=function(e){var t=null;return $.each(w.nodeTypes,function(o,n){n.name===e&&(t=n.color)}),t?t:!1},s.init(),s};