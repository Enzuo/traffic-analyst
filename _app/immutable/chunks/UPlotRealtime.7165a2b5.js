import{S as k,i as S,s as _,k as D,l as T,m as x,h as y,b as G,I as b,w as C}from"./index.a1ad4ba8.js";import{b as I}from"./sceneGraph.8c923948.js";function O(){let a=0,e=0,n=[],l=!1,r;const m=i=>{n.push(i)},c=i=>{r=window.requestAnimationFrame(c),o(i)},u=()=>{r||(r=window.requestAnimationFrame(c),l=!0)},s=()=>{window.cancelAnimationFrame(r),r=null,l=!1},o=i=>{let d=Math.min(i-a,20);a=i,e+=d;for(var h=0;h<n.length;h++)n[h](e,d)};return{start:u,stop:s,subscribeTick:m,get isPlaying(){return l}}}function L(a,e,n){let l=[[]],r=[],m=a.colors?a.colors:["blue","red","orange","green"];for(let s=0;s<e.length;s++)r.push({label:e[s].props.name,scale:"y",value:(o,i)=>i==null?"-":i.toFixed(1)+(a.units||"km/h"),stroke:m[s]}),l.push([]);const c={title:a.title||"Speed",width:300,height:300,cursor:{drag:{setScale:!1}},select:{show:!1},series:[{},...r],scales:{x:{time:!1},y:{}},axes:[{},{space:60,scale:"y",values:(s,o,i)=>o.map(f=>+f.toFixed(1)),side:1,grid:{show:!1}}]};let u=new I(Object.assign(c,a),l,n);return{setData:s=>{u.setData(s)},updateData:(s,o)=>{l[0].push(s/1e3);for(let i=0;i<o.length;i++){let f=o[i];l[i+1]&&l[i+1].push(f)}u.setData(l)}}}function P(a){let e;return{c(){e=D("div")},l(n){e=T(n,"DIV",{}),x(e).forEach(y)},m(n,l){G(n,e,l),a[8](e)},p:b,i:b,o:b,d(n){n&&y(e),a[8](null)}}}function q(a,e,n){let{title:l}=e,{units:r}=e,{colors:m=null}=e,{key:c}=e,{transformFn:u}=e,{time:s}=e,{observed:o}=e,i,f;const d=t=>{if(i){let g=o.map(w=>u?u(w.state[c]):w.state[c]);i.updateData(t,g)}};function h(t,g){t&&g&&(i=L({title:l,units:r,key:c,transformFn:u,colors:m},t,g))}function F(t){C[t?"unshift":"push"](()=>{f=t,n(0,f)})}return a.$$set=t=>{"title"in t&&n(1,l=t.title),"units"in t&&n(2,r=t.units),"colors"in t&&n(3,m=t.colors),"key"in t&&n(4,c=t.key),"transformFn"in t&&n(5,u=t.transformFn),"time"in t&&n(6,s=t.time),"observed"in t&&n(7,o=t.observed)},a.$$.update=()=>{a.$$.dirty&129&&h(o,f),a.$$.dirty&64&&d(s)},[f,l,r,m,c,u,s,o,F]}class K extends k{constructor(e){super(),S(this,e,q,P,_,{title:1,units:2,colors:3,key:4,transformFn:5,time:6,observed:7})}}export{O as S,K as U};