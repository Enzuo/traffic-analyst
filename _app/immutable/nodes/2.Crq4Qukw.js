import{s as ie,e as P,t as j,a as $,c as N,b as F,d as Y,f as y,g as w,p as b,i as re,h as g,w as ce,x as ue,y as fe,n as Te,r as Oe,m as Ve,Y as ve,j as Ee,u as ze,q as Ue,v as He,z as me,A as pe,l as ke,D as Ge,G as Ie,H as je,Z as Ye,_ as xe,$ as We}from"../chunks/scheduler.C19aQTI2.js";import{S as se,i as oe,a as U,t as G,c as Q,b as Z,m as J,d as ee,e as qe,g as Xe}from"../chunks/index.B0knyX5n.js";import{e as be}from"../chunks/each.OpygIZJG.js";import{v as Ce}from"../chunks/environment.D6L2nK2c.js";import{h as Ke,u as Qe,C as Ze,a as Je}from"../chunks/index.BPu2XYXM.js";import{c as _e}from"../chunks/PerformanceObserver.CpkuGQ3y.js";import{S as et}from"../chunks/simulation2.CRWH4vD6.js";import{c as tt}from"../chunks/uPlot.min.D9LKXES3.js";import{D as ge}from"../chunks/TrafficSim.svelte_svelte_type_style_lang.C1bFZHyO.js";import"../chunks/loader.6aynuUIT.js";function rt(e,t){const r={},i={},n={$$scope:1};let a=e.length;for(;a--;){const s=e[a],o=t[a];if(o){for(const l in s)l in o||(i[l]=1);for(const l in o)n[l]||(r[l]=o[l],n[l]=1);e[a]=o}else for(const l in s)n[l]=1}for(const s in i)s in r||(r[s]=void 0);return r}function nt(e){return typeof e=="object"&&e!==null?e:{}}function at(e){let t,r,i,n,a,s,o,l,c,f,p,h,_,u,d,E,S,M,D,L,k,O;return{c(){t=P("div"),r=P("label"),i=j("RPM "),n=P("input"),a=$(),s=P("label"),o=j("GearRatios "),l=P("input"),c=$(),f=P("label"),p=j("GearSpeed "),h=P("input"),_=$(),u=P("label"),d=j("DriveRatio "),E=P("input"),S=$(),M=P("label"),D=j("WheelDiameter "),L=P("input"),this.h()},l(I){t=N(I,"DIV",{class:!0});var m=F(t);r=N(m,"LABEL",{for:!0});var V=F(r);i=Y(V,"RPM "),n=N(V,"INPUT",{id:!0}),V.forEach(y),a=w(m),s=N(m,"LABEL",{for:!0});var T=F(s);o=Y(T,"GearRatios "),l=N(T,"INPUT",{id:!0}),T.forEach(y),c=w(m),f=N(m,"LABEL",{for:!0});var v=F(f);p=Y(v,"GearSpeed "),h=N(v,"INPUT",{id:!0}),v.forEach(y),_=w(m),u=N(m,"LABEL",{for:!0});var R=F(u);d=Y(R,"DriveRatio "),E=N(R,"INPUT",{id:!0,type:!0}),R.forEach(y),S=w(m),M=N(m,"LABEL",{for:!0});var C=F(M);D=Y(C,"WheelDiameter "),L=N(C,"INPUT",{id:!0,type:!0,placeholder:!0}),C.forEach(y),m.forEach(y),this.h()},h(){b(n,"id","rpm"),n.value=Fe,b(r,"for","rpm"),b(l,"id","gear-ratio"),l.value=it,b(s,"for","gear-ratio"),b(h,"id","gear-speed"),h.value=e[0],b(f,"for","gear-speed"),b(E,"id","drive-ratio"),b(E,"type","number"),b(u,"for","drive-ratio"),b(L,"id","wheel-diameter"),b(L,"type","number"),b(L,"placeholder","cm"),b(M,"for","wheel-diameter"),b(t,"class","grid")},m(I,m){re(I,t,m),g(t,r),g(r,i),g(r,n),g(t,a),g(t,s),g(s,o),g(s,l),g(t,c),g(t,f),g(f,p),g(f,h),g(t,_),g(t,u),g(u,d),g(u,E),ce(E,e[1]),g(t,S),g(t,M),g(M,D),g(M,L),ce(L,e[2]),k||(O=[ue(l,"input",e[3]),ue(E,"input",e[4]),ue(L,"input",e[5])],k=!0)},p(I,[m]){m&1&&h.value!==I[0]&&(h.value=I[0]),m&2&&fe(E.value)!==I[1]&&ce(E,I[1]),m&4&&fe(L.value)!==I[2]&&ce(L,I[2])},i:Te,o:Te,d(I){I&&y(t),k=!1,Oe(O)}}}let Fe=0,it=0;function st(e,t,r){let i="",n=4,a=63;function s(f){let p=f.target.value;o(p)}function o(f){let p=f.split(","),h=[];for(let _=0;_<p.length;_++){let u=parseFloat(p[_]);console.log("drive ratio",n);let d=Ke(Fe,u,n,a);h.push((d*3.6).toFixed(1))}r(0,i=h.join(", "))}function l(){n=fe(this.value),r(1,n)}function c(){a=fe(this.value),r(2,a)}return[i,n,a,s,l,c]}class ot extends se{constructor(t){super(),oe(this,t,st,at,ie,{})}}function lt(){const e=tt(),t=_e("TrafficSimulation"),r=[de(20),de(-20)],i=[he(r[0]),he(r[1],25,$e.DEFENSIVE)],n=we(2e3),a=2e3,s=et();let o;return s.subscribeTick((l,c)=>{t.measureStart(),n.tickAtInterval(l,()=>{let f=Math.min(-20,o?o.state.position-10:-20),p=de(f,o?o.state.speed:20);o=p;let h=he(p);r.push(p),i.push(h),e.emit("car_created",p)}),i.forEach(f=>{f.think(l,c,r)}),r.forEach((f,p)=>{Qe(f,c);let h=f.state.speed;f.state.position+=h*(c/1e3),f.state.position>a&&(r.shift(),i.shift())}),t.measureEnd()}),{...s,simulation:s,cars:r,drivers:i,findCarDriver:ct,...e,debug:{perf:t}}}function de(e=0,t=0){let r=new Ze(Je("renault_zoe"));return r.state.position=e,r.state.speed=t,r}function ct(e,t){return t.findIndex(r=>r.car.id===e.id)}let $e={AGGRESSIVE:{MIN_TIME_TO_CONTACT:.5,UNEASY_TTI:3.5,IDEAL_TTC:.7,ANTICIPATION_TTC:1,MIN_DISTANCE:2,MAX_ACCELERATION:10},NORMAL:{MIN_TIME_TO_CONTACT:.5,UNEASY_TTI:4,IDEAL_TTC:1,ANTICIPATION_TTC:3,MIN_DISTANCE:3,MAX_ACCELERATION:2},DEFENSIVE:{MIN_TIME_TO_CONTACT:2,UNEASY_TTI:5,IDEAL_TTC:4,ANTICIPATION_TTC:30,MIN_DISTANCE:5,MAX_ACCELERATION:1}};function he(e,t=15,r=$e.NORMAL){const n=r.UNEASY_TTI||4,a=r.MIN_TIME_TO_CONTACT||.5,s=r.IDEAL_TTC||1,o=r.ANTICIPATION_TTC||5,l=r.MIN_DISTANCE,c=r.MAX_ACCELERATION||1;r.MAX_THROTTLE;let f=!1,p;const h=we(1e3);let _,u,d,E,S=0,M=0,D,L,k;function O(A,B,x){_=A;const le=B/1e3,H=e.state.speed,te=e.state.acceleration;if(h.tickAtInterval(A,()=>{if(f&&A>p+2e3&&(f=!1),u=ft(e,x),u){let W=u.distance,q=W/H,ne=W/Math.max(e.state.speed-u.car.state.speed,1);if(u.speed+3<H,ne<n){d="cuttingSpeed",E="brake",k=K(n,2.5,.05,.4);return}if(W<l){d="cuttingDistance",E="brake",k=K(l+2,l,0,.2);return}if(q<a){d="increasingTTC",E="throttle",L=K(s,a,u.speed,u.speed-5);return}if(q<o){E="throttle";let X=K(o,s,0,1).getYForX(q);H>u.speed&&(d="easingToTrafficSpeed",D=T(M,X)),H<u.speed&&(d="acceleratingToTrafficSpeed",D=v(M,1-X)),L=K(s,o,u.speed,t);return}}d="travelingToWantedSpeed",E="throttle",D=C(t,H,M,te)}),f){I(.2);return}if(E==="throttle"&&S>0){I(-2*le);return}if(u){let[,W]=ae(u.car,e),q=W/H,ne=W/Math.max(e.state.speed-u.car.state.speed,1);if(ne<2.5/3){d="godBrake",E="brake",I(3,3);return}if(ne<2.5){d="avoidingCrash",E="brake",I(.2);return}if(d==="cuttingSpeed"){let X=k.getYForX(ne);I(.1,X)}if(d==="cuttingDistance"){let X=k.getYForX(W);I(.02,X)}if(d==="increasingTTC"){let X=L.getYForX(q);V(H,X,te)}d==="easingToTrafficSpeed"&&R(D),d==="acceleratingToTrafficSpeed"&&R(D)}d==="travelingToWantedSpeed"&&R(D)}function I(A,B=1){M=0,e.state.throttleInput=0,S=S+A,S=Math.min(Math.max(S,0),B),e.state.brakeInput=S}function m(A,B=1){S=0,e.state.brakeInput=0,M=M+A,M=Math.min(Math.max(M,0),B),e.state.throttleInput=M}function V(A,B,x){A<B&&x<c&&m(.05),A>B&&m(-.05)}function T(A,B,x){return A-(.3+.2*Math.random())*B}function v(A,B,x){return A+(.3+.2*Math.random())*B}function R(A){if(M+.01<A)return m(.02);if(M-.01>A)return m(-.02)}function C(A,B,x,le,H=4){let te,q=(B>A?K(B,A,-H,0):K(0,A,H,0)).getYForX(B);return le>q&&(te=T(x,.5)),le<q&&(te=v(x,.5)),te}function z(){f=!0,p=_}return{think:O,stopCar:z,get frontCar(){return u},get car(){return e},get currentTask(){return d},get distance(){return ae(u.car,e)[1]},get TTC(){return u?ae(u.car,e)[1]/e.state.speed:null},get TTI(){return u?ae(u.car,e)[1]/Math.max(e.state.speed-u.speed,1):null},get plannedSpeedCurve(){return L}}}function K(e,t,r,i){if(e>t){let n=e;e=t,t=n;let a=r;r=i,i=a}return{getYForX(n){if(n<e)return r;if(n>t)return i;let a=e-t,o=(e-n)/a,l=r-i;return r-o*l}}}function ft(e,t){let r,i=1e4,n=1e4;for(var a=0;a<t.length;a++){if(t[a].id===e.id)continue;let[s,o]=ae(t[a],e);s>0&&s<i&&(r=t[a],i=s,n=o)}return r?{car:r,distance:n,speed:r.state.speed}:null}function ae(e,t){let r=e.state.position-t.state.position,i=r-e.props.length/2e3-t.props.length/2e3;return[r,i]}function we(e){let t=0;return{tickAtInterval:(r,i)=>r-t>=e?(t=r,i&&i(),!0):!1}}function ut(e){let t,r,i,n,a,s,o,l,c,f,p;const h=e[5].default,_=Ve(h,e,e[4],null);return{c(){t=P("div"),r=P("h1"),i=j(e[0]),n=$(),a=P("img"),o=$(),l=P("p"),c=j(e[1]),f=$(),_&&_.c(),this.h()},l(u){t=N(u,"DIV",{class:!0});var d=F(t);r=N(d,"H1",{});var E=F(r);i=Y(E,e[0]),E.forEach(y),n=w(d),a=N(d,"IMG",{src:!0}),o=w(d),l=N(d,"P",{class:!0});var S=F(l);c=Y(S,e[1]),S.forEach(y),f=w(d),_&&_.l(d),d.forEach(y),this.h()},h(){ve(a.src,s="images/"+e[2])||b(a,"src",s),b(l,"class","date svelte-1sipgtj"),b(t,"class","article svelte-1sipgtj")},m(u,d){re(u,t,d),g(t,r),g(r,i),g(t,n),g(t,a),g(t,o),g(t,l),g(l,c),g(t,f),_&&_.m(t,null),p=!0},p(u,[d]){(!p||d&1)&&Ee(i,u[0]),(!p||d&4&&!ve(a.src,s="images/"+u[2]))&&b(a,"src",s),(!p||d&2)&&Ee(c,u[1]),_&&_.p&&(!p||d&16)&&ze(_,h,u,u[4],p?He(h,u[4],d,null):Ue(u[4]),null)},i(u){p||(U(_,u),p=!0)},o(u){G(_,u),p=!1},d(u){u&&y(t),_&&_.d(u)}}}function dt(e,t,r){let{$$slots:i={},$$scope:n}=t,{title:a}=t,{author:s}=t,{date:o}=t,{image:l}=t;return e.$$set=c=>{"title"in c&&r(0,a=c.title),"author"in c&&r(3,s=c.author),"date"in c&&r(1,o=c.date),"image"in c&&r(2,l=c.image),"$$scope"in c&&r(4,n=c.$$scope)},[a,o,l,s,n,i]}class ht extends se{constructor(t){super(),oe(this,t,dt,ut,ie,{title:0,author:3,date:1,image:2})}}const Be="2dassets/";function mt(e,t){let r=e.getContext("2d"),i=[],n=_e("TrafficScenePixelArt");const a=Me(0,0);a.addChild(Se(0,-8,"background/background_city.png")),i.push(a);const s=Me(0,30);s.addChild(pt()),s.addChild(Se(0,-18,"background/road_border.png")),i.push(s),t.cars.forEach(h=>{s.addChild(Ae(h))}),f(),t.on("car_created",o);function o(h){console.log("simulation has a new car",h),s.addChild(Ae(h))}function l(h){n.measureStart(),r.clearRect(0,0,e.width,e.height),a.move(-.1,0),s.move(-.3,0),i.forEach(_=>{_.animate(h)}),i.forEach(_=>{_.draw(r)}),c=requestAnimationFrame(l),n.measureEnd()}var c;function f(){c||(c=requestAnimationFrame(l))}function p(){cancelAnimationFrame(c)}return{start:f,stop:p,debug:{perf:n}}}function pt(){var e=960,t=3,r=12,i=15,n=30,a="#FFF42D",s="#302E37";function o(c,f,p){var h=Math.floor(f),_=Math.floor(p);c.translate(0,.5),c.fillStyle=s;var u=t*r+(t+1);c.fillRect(0,_,e,u),c.strokeStyle=a,c.lineWidth=1,c.beginPath(),c.moveTo(h,_),c.lineTo(e,_),c.stroke(),c.beginPath();for(var d=1;d<t;d++){c.setLineDash([i,n]);var E=d*(r+1);c.moveTo(h,_+E),c.lineTo(e,_+E)}c.stroke(),c.setLineDash([]),c.beginPath(),c.moveTo(h,_+u),c.lineTo(e,_+u),c.stroke(),c.translate(0,-.5)}function l(c){}return{animate:l,draw:o}}function Ae(e){var t=new Image;const r=["landroverDefender","teslaCybertruck","citroenC15"],i=Math.floor(Math.random()*r.length);t.src=Be+r[i]+".png",t.onload=function(){};var n={x:0,y:0};function a(o){}function s(o,l,c){n.x=e.state.position*10,o.drawImage(t,Math.floor(n.x)+l,n.y+41-t.height)}return{animate:a,draw:s}}function Me(e,t){var r=[];function i(o){r.forEach(l=>l.animate(o))}function n(o){r.push(o)}function a(o,l){e+=o,t+=l}function s(o,l=0,c=0){r.forEach(f=>f.draw(o,l+e,c+t))}return{animate:i,draw:s,addChild:n,move:a}}function Se(e,t,r){var i=new Image;i.src=Be+r;var n=960;function a(o,l,c){for(var f=e+l,p=t+c;f<n;)o.drawImage(i,f,p),f+=100}function s(){}return{draw:a,animate:s}}function _t(e){let t,r,i,n,a;return n=new ge({props:{debugPerf:e[1]}}),{c(){t=P("div"),r=P("canvas"),i=$(),Q(n.$$.fragment),this.h()},l(s){t=N(s,"DIV",{});var o=F(t);r=N(o,"CANVAS",{width:!0,height:!0,class:!0}),F(r).forEach(y),i=w(o),Z(n.$$.fragment,o),o.forEach(y),this.h()},h(){b(r,"width","960"),b(r,"height","100"),b(r,"class","svelte-63pr4t")},m(s,o){re(s,t,o),g(t,r),e[3](r),g(t,i),J(n,t,null),a=!0},p(s,[o]){const l={};o&2&&(l.debugPerf=s[1]),n.$set(l)},i(s){a||(U(n.$$.fragment,s),a=!0)},o(s){G(n.$$.fragment,s),a=!1},d(s){s&&y(t),e[3](null),ee(n)}}}function gt(e,t,r){let{traffic_sim:i}=t,n,a,s;me(()=>{s=mt(n,i),r(1,a=s.debug.perf)}),pe(()=>{s&&s.stop()});function o(l){ke[l?"unshift":"push"](()=>{n=l,r(0,n)})}return e.$$set=l=>{"traffic_sim"in l&&r(2,i=l.traffic_sim)},[n,a,i,o]}class Tt extends se{constructor(t){super(),oe(this,t,gt,_t,ie,{traffic_sim:2})}}var vt=1e-6,Pe=typeof Float32Array<"u"?Float32Array:Array;Math.hypot||(Math.hypot=function(){for(var e=0,t=arguments.length;t--;)e+=arguments[t]*arguments[t];return Math.sqrt(e)});function Ne(){var e=new Pe(16);return Pe!=Float32Array&&(e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0),e[0]=1,e[5]=1,e[10]=1,e[15]=1,e}function Et(e,t,r){var i=r[0],n=r[1],a=r[2],s,o,l,c,f,p,h,_,u,d,E,S;return t===e?(e[12]=t[0]*i+t[4]*n+t[8]*a+t[12],e[13]=t[1]*i+t[5]*n+t[9]*a+t[13],e[14]=t[2]*i+t[6]*n+t[10]*a+t[14],e[15]=t[3]*i+t[7]*n+t[11]*a+t[15]):(s=t[0],o=t[1],l=t[2],c=t[3],f=t[4],p=t[5],h=t[6],_=t[7],u=t[8],d=t[9],E=t[10],S=t[11],e[0]=s,e[1]=o,e[2]=l,e[3]=c,e[4]=f,e[5]=p,e[6]=h,e[7]=_,e[8]=u,e[9]=d,e[10]=E,e[11]=S,e[12]=s*i+f*n+u*a+t[12],e[13]=o*i+p*n+d*a+t[13],e[14]=l*i+h*n+E*a+t[14],e[15]=c*i+_*n+S*a+t[15]),e}function It(e,t,r,i){var n=i[0],a=i[1],s=i[2],o=Math.hypot(n,a,s),l,c,f,p,h,_,u,d,E,S,M,D,L,k,O,I,m,V,T,v,R,C,z,A;return o<vt?null:(o=1/o,n*=o,a*=o,s*=o,l=Math.sin(r),c=Math.cos(r),f=1-c,p=t[0],h=t[1],_=t[2],u=t[3],d=t[4],E=t[5],S=t[6],M=t[7],D=t[8],L=t[9],k=t[10],O=t[11],I=n*n*f+c,m=a*n*f+s*l,V=s*n*f-a*l,T=n*a*f-s*l,v=a*a*f+c,R=s*a*f+n*l,C=n*s*f+a*l,z=a*s*f-n*l,A=s*s*f+c,e[0]=p*I+d*m+D*V,e[1]=h*I+E*m+L*V,e[2]=_*I+S*m+k*V,e[3]=u*I+M*m+O*V,e[4]=p*T+d*v+D*R,e[5]=h*T+E*v+L*R,e[6]=_*T+S*v+k*R,e[7]=u*T+M*v+O*R,e[8]=p*C+d*z+D*A,e[9]=h*C+E*z+L*A,e[10]=_*C+S*z+k*A,e[11]=u*C+M*z+O*A,t!==e&&(e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15]),e)}function bt(e,t,r,i,n){var a=1/Math.tan(t/2),s;return e[0]=a/r,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=a,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=-1,e[12]=0,e[13]=0,e[15]=0,n!=null&&n!==1/0?(s=1/(i-n),e[10]=(n+i)*s,e[14]=2*n*i*s):(e[10]=-1,e[14]=-2*i),e}var Ct=bt;const At=`
    attribute vec4 aVertexPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `,Mt=`
  void main() {
    gl_FragColor = vec4(0.97, 0.37, 0.53, 1.0);
  }
`;function St(e){const t=e.getContext("webgl",{antialias:!1});let r=_e("BackgroundWebGL");if(t===null){console.error("Unable to initialize WebGL. Your browser or machine may not support it.");return}const i=Pt(t,At,Mt),n={program:i,attribLocations:{vertexPosition:t.getAttribLocation(i,"aVertexPosition")},uniformLocations:{projectionMatrix:t.getUniformLocation(i,"uProjectionMatrix"),modelViewMatrix:t.getUniformLocation(i,"uModelViewMatrix")}};t.clearColor(0,0,0,1),t.clear(t.COLOR_BUFFER_BIT);const{vertices:a}=Dt(),s=Nt(t,a);let o=0,l=0,c=0,f=.05;function p(h){h*=.001,c=h-o,o=h,r.measureStart(),Rt(t,n,s,a.length/2,l),l+=c*f,r.measureEnd(),requestAnimationFrame(p)}return requestAnimationFrame(p),{debug:{perf:r},destroy:()=>{}}}function Pt(e,t,r){const i=Le(e,e.VERTEX_SHADER,t),n=Le(e,e.FRAGMENT_SHADER,r),a=e.createProgram();return e.attachShader(a,i),e.attachShader(a,n),e.linkProgram(a),e.getProgramParameter(a,e.LINK_STATUS)?a:(alert(`Unable to initialize the shader program: ${e.getProgramInfoLog(a)}`),null)}function Le(e,t,r){const i=e.createShader(t);return e.shaderSource(i,r),e.compileShader(i),e.getShaderParameter(i,e.COMPILE_STATUS)?i:(alert(`An error occurred compiling the shaders: ${e.getShaderInfoLog(i)}`),e.deleteShader(i),null)}function Nt(e,t){return{position:Lt(e,t)}}function Lt(e,t){const r=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,r);const i=t;return e.bufferData(e.ARRAY_BUFFER,new Float32Array(i),e.STATIC_DRAW),r}function Rt(e,t,r,i=5,n=0){e.clearColor(1,1,1,1),e.clearDepth(1),e.enable(e.DEPTH_TEST),e.depthFunc(e.LEQUAL),e.clear(e.COLOR_BUFFER_BIT|e.DEPTH_BUFFER_BIT);const a=45*Math.PI/180,s=e.canvas.clientWidth/e.canvas.clientHeight,o=.1,l=100,c=Ne();Ct(c,a,s,o,l);const f=Ne();Et(f,f,[-0,0,-6]),It(f,f,n,[.7,.2,1]),yt(e,r,t),e.useProgram(t.program),e.uniformMatrix4fv(t.uniformLocations.projectionMatrix,!1,c),e.uniformMatrix4fv(t.uniformLocations.modelViewMatrix,!1,f),e.drawArrays(e.LINE_STRIP,0,i)}function yt(e,t,r){const n=e.FLOAT,a=!1,s=0,o=0;e.bindBuffer(e.ARRAY_BUFFER,t.position),e.vertexAttribPointer(r.attribLocations.vertexPosition,2,n,a,s,o),e.enableVertexAttribArray(r.attribLocations.vertexPosition)}function Dt(){const r=[];for(let i=0;i<=10;i++){const n=i/10*3-1.5,a=i/10*3-3/2,s=-3/2,o=3/2;Re(i)?r.push(n,s,a,o):r.push(n,o,a,s)}for(let i=0;i<=10;i++){const s=i/10*3-1.5,o=i/10*3-3/2;Re(i)?r.push(1.5,s,-1.5,o):r.push(-1.5,s,1.5,o)}return{vertices:r}}function Re(e){return e%2==0}function kt(e){let t,r,i,n,a,s;return a=new ge({props:{debugPerf:e[1]}}),{c(){t=P("div"),r=P("canvas"),i=$(),n=P("div"),Q(a.$$.fragment),this.h()},l(o){t=N(o,"DIV",{class:!0});var l=F(t);r=N(l,"CANVAS",{width:!0,height:!0,class:!0}),F(r).forEach(y),i=w(l),n=N(l,"DIV",{style:!0});var c=F(n);Z(a.$$.fragment,c),c.forEach(y),l.forEach(y),this.h()},h(){b(r,"width","480"),b(r,"height","480"),b(r,"class","svelte-76eo7s"),Ge(n,"display","none"),b(t,"class","background svelte-76eo7s")},m(o,l){re(o,t,l),g(t,r),e[2](r),g(t,i),g(t,n),J(a,n,null),s=!0},p(o,[l]){const c={};l&2&&(c.debugPerf=o[1]),a.$set(c)},i(o){s||(U(a.$$.fragment,o),s=!0)},o(o){G(a.$$.fragment,o),s=!1},d(o){o&&y(t),e[2](null),ee(a)}}}function Ft(e,t,r){let i,n,a;me(()=>{n=St(i),r(1,a=n.debug.perf)}),pe(()=>{n&&n.destroy()});function s(o){ke[o?"unshift":"push"](()=>{i=o,r(0,i)})}return[i,a,s]}class $t extends se{constructor(t){super(),oe(this,t,Ft,kt,ie,{})}}function ye(e,t,r){const i=e.slice();return i[3]=t[r],i}function wt(e){let t,r=e[3].content+"",i;return{c(){t=new xe(!1),i=$(),this.h()},l(n){t=We(n,!1),i=w(n),this.h()},h(){t.a=i},m(n,a){t.m(r,n,a),re(n,i,a)},p(n,a){a&1&&r!==(r=n[3].content+"")&&t.p(r)},d(n){n&&(t.d(),y(i))}}}function De(e){let t,r;const i=[e[3].frontmatter];let n={$$slots:{default:[wt]},$$scope:{ctx:e}};for(let a=0;a<i.length;a+=1)n=Ye(n,i[a]);return t=new ht({props:n}),{c(){Q(t.$$.fragment)},l(a){Z(t.$$.fragment,a)},m(a,s){J(t,a,s),r=!0},p(a,s){const o=s&1?rt(i,[nt(a[3].frontmatter)]):{};s&65&&(o.$$scope={dirty:s,ctx:a}),t.$set(o)},i(a){r||(U(t.$$.fragment,a),r=!0)},o(a){G(t.$$.fragment,a),r=!1},d(a){ee(t,a)}}}function Bt(e){let t,r,i,n,a,s,o='<img src="title8.png" alt="AutoWaves" class="svelte-g2nepn"/>',l,c,f,p,h,_='<a class="button svelte-g2nepn" href="cars">cars list</a> <a class="button svelte-g2nepn" href="about">about</a>',u,d,E,S,M,D,L,k,O;r=new Tt({props:{traffic_sim:e[2]}}),n=new ge({props:{debugPerf:e[1],top:"130px"}}),f=new ot({});let I=be(e[0].articles),m=[];for(let T=0;T<I.length;T+=1)m[T]=De(ye(e,I,T));const V=T=>G(m[T],1,1,()=>{m[T]=null});return k=new $t({}),{c(){t=P("main"),Q(r.$$.fragment),i=$(),Q(n.$$.fragment),a=$(),s=P("h1"),s.innerHTML=o,l=$(),c=P("div"),Q(f.$$.fragment),p=$(),h=P("div"),h.innerHTML=_,u=$(),d=P("div"),E=j("v "),S=j(Ce),M=$(),D=P("div");for(let T=0;T<m.length;T+=1)m[T].c();L=$(),Q(k.$$.fragment),this.h()},l(T){t=N(T,"MAIN",{class:!0});var v=F(t);Z(r.$$.fragment,v),i=w(v),Z(n.$$.fragment,v),a=w(v),s=N(v,"H1",{class:!0,"data-svelte-h":!0}),Ie(s)!=="svelte-1xmbjy5"&&(s.innerHTML=o),l=w(v),c=N(v,"DIV",{id:!0,class:!0});var R=F(c);Z(f.$$.fragment,R),R.forEach(y),p=w(v),h=N(v,"DIV",{id:!0,"data-svelte-h":!0}),Ie(h)!=="svelte-1c4abwl"&&(h.innerHTML=_),u=w(v),d=N(v,"DIV",{id:!0,class:!0});var C=F(d);E=Y(C,"v "),S=Y(C,Ce),C.forEach(y),M=w(v),D=N(v,"DIV",{id:!0});var z=F(D);for(let A=0;A<m.length;A+=1)m[A].l(z);z.forEach(y),L=w(v),Z(k.$$.fragment,v),v.forEach(y),this.h()},h(){b(s,"class","svelte-g2nepn"),b(c,"id","tools"),b(c,"class","svelte-g2nepn"),b(h,"id","menu"),b(d,"id","footer"),b(d,"class","svelte-g2nepn"),b(D,"id","articles"),b(t,"class","svelte-g2nepn")},m(T,v){re(T,t,v),J(r,t,null),g(t,i),J(n,t,null),g(t,a),g(t,s),g(t,l),g(t,c),J(f,c,null),g(t,p),g(t,h),g(t,u),g(t,d),g(d,E),g(d,S),g(t,M),g(t,D);for(let R=0;R<m.length;R+=1)m[R]&&m[R].m(D,null);g(t,L),J(k,t,null),O=!0},p(T,[v]){const R={};if(v&2&&(R.debugPerf=T[1]),n.$set(R),v&1){I=be(T[0].articles);let C;for(C=0;C<I.length;C+=1){const z=ye(T,I,C);m[C]?(m[C].p(z,v),U(m[C],1)):(m[C]=De(z),m[C].c(),U(m[C],1),m[C].m(D,null))}for(Xe(),C=I.length;C<m.length;C+=1)V(C);qe()}},i(T){if(!O){U(r.$$.fragment,T),U(n.$$.fragment,T),U(f.$$.fragment,T);for(let v=0;v<I.length;v+=1)U(m[v]);U(k.$$.fragment,T),O=!0}},o(T){G(r.$$.fragment,T),G(n.$$.fragment,T),G(f.$$.fragment,T),m=m.filter(Boolean);for(let v=0;v<m.length;v+=1)G(m[v]);G(k.$$.fragment,T),O=!1},d(T){T&&y(t),ee(r),ee(n),ee(f),je(m,T),ee(k)}}}function Ot(e,t,r){let{data:i}=t,n=lt(),a;return me(()=>{n.start(),r(1,a=n.debug.perf)}),pe(()=>{n&&n.stop()}),e.$$set=s=>{"data"in s&&r(0,i=s.data)},[i,a,n]}class Xt extends se{constructor(t){super(),oe(this,t,Ot,Bt,ie,{data:0})}}export{Xt as component};
