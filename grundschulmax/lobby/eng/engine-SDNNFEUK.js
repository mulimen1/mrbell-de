import"./c-HA7ZXDUJ.js";import{a as Le,b as Ve,c as Lr,d as mt,e as tn,f as rn,g as cr,j as on}from"./c-YDBS3ESL.js";import{a as $o,b as Ko}from"./c-CVTBYW32.js";import{a as Vo,b as Wo,c as Yo,d as jo,e as Ho}from"./c-CRTY4J5N.js";import{a as Lo,b as Wt,f as No}from"./c-DT6AQNTN.js";import{a as de}from"./c-6RG2VTFI.js";import{c as qt,g as nn}from"./c-O3IBRHVW.js";import{i as oe,n as le,o as en,p as Mi,r as be,v as ae}from"./c-4CL4YIIF.js";import"./c-ZHLNBKVE.js";import{a as Mt,b as Te}from"./c-ZZSOSCPV.js";import{j as sn}from"./c-ILSGQGKU.js";import{a as Vr}from"./c-DX4FIPJ6.js";import"./c-Y6FRX6A3.js";import{b as pr}from"./c-CI32PRD4.js";import{I as Ot,K as Jo,L as Y,O as me,P as he,R as mr,a as B,b as Fe,e as fr,f as Oi,h as Nt,l as ct,o as ce,p as Xo,q as qo,r as ze,s as Ft,t as Xt,w as Qo,x as Zo}from"./c-JFRMHYKB.js";function Bi(s,e=null){let t=s*6;if(t>65535?e||(e=new Uint32Array(t)):e||(e=new Uint16Array(t)),e.length!==t)throw new Error(`Out buffer length is incorrect, got ${e.length} and expected ${t}`);for(let r=0,i=0;r<t;r+=6,i+=4)e[r+0]=i+0,e[r+1]=i+1,e[r+2]=i+2,e[r+3]=i+0,e[r+4]=i+2,e[r+5]=i+3;return e}function ln(s){return{dynamicUpdate:an(s,!0),staticUpdate:an(s,!1)}}function an(s,e){let t=[];t.push(`

        var index = 0;

        for (let i = 0; i < ps.length; ++i)
        {
            const p = ps[i];

            `);let r=0;for(let o in s){let n=s[o];if(e!==n.dynamic)continue;t.push(`offset = index + ${r}`),t.push(n.code);let a=Ft(n.format);r+=a.stride/4}t.push(`
            index += stride * 4;
        }
    `),t.unshift(`
        var stride = ${r};
    `);let i=t.join(`
`);return new Function("ps","f32v","u32v",i)}var Wr=class{constructor(e){this._size=0,this._generateParticleUpdateCache={};let t=this._size=e.size??1e3,r=e.properties,i=0,o=0;for(let f in r){let p=r[f],c=Ft(p.format);p.dynamic?o+=c.stride:i+=c.stride}this._dynamicStride=o/4,this._staticStride=i/4,this.staticAttributeBuffer=new pr(t*4*i),this.dynamicAttributeBuffer=new pr(t*4*o),this.indexBuffer=Bi(t);let n=new Jo,a=0,l=0;this._staticBuffer=new Oi({data:new Float32Array(1),label:"static-particle-buffer",shrinkToFit:!1,usage:fr.VERTEX|fr.COPY_DST}),this._dynamicBuffer=new Oi({data:new Float32Array(1),label:"dynamic-particle-buffer",shrinkToFit:!1,usage:fr.VERTEX|fr.COPY_DST});for(let f in r){let p=r[f],c=Ft(p.format);p.dynamic?(n.addAttribute(p.attributeName,{buffer:this._dynamicBuffer,stride:this._dynamicStride*4,offset:a*4,format:p.format}),a+=c.size):(n.addAttribute(p.attributeName,{buffer:this._staticBuffer,stride:this._staticStride*4,offset:l*4,format:p.format}),l+=c.size)}n.addIndex(this.indexBuffer);let u=this.getParticleUpdate(r);this._dynamicUpload=u.dynamicUpdate,this._staticUpload=u.staticUpdate,this.geometry=n}getParticleUpdate(e){let t=Da(e);return this._generateParticleUpdateCache[t]?this._generateParticleUpdateCache[t]:(this._generateParticleUpdateCache[t]=this.generateParticleUpdate(e),this._generateParticleUpdateCache[t])}generateParticleUpdate(e){return ln(e)}update(e,t){e.length>this._size&&(t=!0,this._size=Math.max(e.length,this._size*1.5|0),this.staticAttributeBuffer=new pr(this._size*this._staticStride*4*4),this.dynamicAttributeBuffer=new pr(this._size*this._dynamicStride*4*4),this.indexBuffer=Bi(this._size),this.geometry.indexBuffer.setDataWithSize(this.indexBuffer,this.indexBuffer.byteLength,!0));let r=this.dynamicAttributeBuffer;if(this._dynamicUpload(e,r.float32View,r.uint32View),this._dynamicBuffer.setDataWithSize(this.dynamicAttributeBuffer.float32View,e.length*this._dynamicStride*4,!0),t){let i=this.staticAttributeBuffer;this._staticUpload(e,i.float32View,i.uint32View),this._staticBuffer.setDataWithSize(i.float32View,e.length*this._staticStride*4,!0)}}destroy(){this._staticBuffer.destroy(),this._dynamicBuffer.destroy(),this.geometry.destroy()}};function Da(s){let e=[];for(let t in s){let r=s[t];e.push(t,r.code,r.dynamic?"d":"s")}return e.join("_")}var un={aVertex:(s,e,t,r,i)=>{let o=0,n=0,a=0,l=0;for(let u=0;u<s.length;++u){let f=s[u],p=f.texture,c=f.scaleX,h=f.scaleY,_=f.anchorX,m=f.anchorY,d=p.trim,g=p.orig;d?(n=d.x-_*g.width,o=n+d.width,l=d.y-m*g.height,a=l+d.height):(o=g.width*(1-_),n=g.width*-_,a=g.height*(1-m),l=g.height*-m),e[r]=n*c,e[r+1]=l*h,e[r+i]=o*c,e[r+i+1]=l*h,e[r+i*2]=o*c,e[r+i*2+1]=a*h,e[r+i*3]=n*c,e[r+i*3+1]=a*h,r+=i*4}},aPosition:(s,e,t,r,i)=>{for(let o=0;o<s.length;++o){let n=s[o],a=n.x,l=n.y;e[r]=a,e[r+1]=l,e[r+i]=a,e[r+i+1]=l,e[r+i*2]=a,e[r+i*2+1]=l,e[r+i*3]=a,e[r+i*3+1]=l,r+=i*4}},aRotation:(s,e,t,r,i)=>{for(let o=0;o<s.length;++o){let n=s[o].rotation;e[r]=n,e[r+i]=n,e[r+i*2]=n,e[r+i*3]=n,r+=i*4}},aUV:(s,e,t,r,i)=>{for(let o=0;o<s.length;++o){let n=s[o].texture.uvs;e[r]=n.x0,e[r+1]=n.y0,e[r+i]=n.x1,e[r+i+1]=n.y1,e[r+i*2]=n.x2,e[r+i*2+1]=n.y2,e[r+i*3]=n.x3,e[r+i*3+1]=n.y3,r+=i*4}},aColor:(s,e,t,r,i)=>{for(let o=0;o<s.length;++o){let n=s[o].color;t[r]=n,t[r+i]=n,t[r+i*2]=n,t[r+i*3]=n,r+=i*4}}};function pn(s){let e=Object.values(s),t=e.filter(i=>i.dynamic),r=e.filter(i=>!i.dynamic);return{dynamicUpdate:fn(t),staticUpdate:fn(r)}}function fn(s){let e=0,t=[];for(let r=0;r<s.length;r++){let i=s[r],o=Ft(i.format).stride/4;e+=o,t.push({stride:o,updateFunction:i.updateFunction||un[i.attributeName]})}return(r,i,o)=>{let n=0;for(let a=0;a<t.length;a++){let l=t[a];l.updateFunction(r,i,o,n,e),n+=l.stride}}}function cn(){return La}function La(s,e,t){let r=s.gl,i=s.shader,o=i._getProgramData(e.glProgram);for(let n in e.groups){let a=e.groups[n];for(let l in a.resources){let u=a.resources[l];if(u instanceof Nt)u.ubo?i.bindUniformBlock(u,e._uniformBindMap[n][l],t.blockIndex++):i.updateUniformGroup(u);else if(u instanceof No)i.bindUniformBlock(u,e._uniformBindMap[n][l],t.blockIndex++);else if(u instanceof qo||u instanceof Yo){s.texture.bind(u,t.textureCount);let f=e._uniformBindMap[n][l],p=o.uniformData[f];p&&(p.value!==t.textureCount&&r.uniform1i(p.location,t.textureCount),t.textureCount++)}else u instanceof Xo}}}var mn=[(s,e,t,r,i)=>{let o=r[s].toArray(!0);e[t]=o[0],e[t+1]=o[1],e[t+2]=o[2],e[t+4]=o[3],e[t+5]=o[4],e[t+6]=o[5],e[t+8]=o[6],e[t+9]=o[7],e[t+10]=o[8]},(s,e,t,r,i)=>{i=r[s],e[t]=i.x,e[t+1]=i.y,e[t+2]=i.width,e[t+3]=i.height},(s,e,t,r,i)=>{i=r[s],e[t]=i.x,e[t+1]=i.y},(s,e,t,r,i)=>{i=r[s],e[t]=i.red,e[t+1]=i.green,e[t+2]=i.blue,e[t+3]=i.alpha},(s,e,t,r,i)=>{i=r[s],e[t]=i.red,e[t+1]=i.green,e[t+2]=i.blue}],hn={f32:(s,e,t,r,i)=>{e[t]=i},i32:(s,e,t,r,i)=>{e[t]=i},"vec2<f32>":(s,e,t,r,i)=>{e[t]=i[0],e[t+1]=i[1]},"vec3<f32>":(s,e,t,r,i)=>{e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2]},"vec4<f32>":(s,e,t,r,i)=>{e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3]},"mat2x2<f32>":(s,e,t,r,i)=>{e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3]},"mat3x3<f32>":(s,e,t,r,i)=>{e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+4]=i[3],e[t+5]=i[4],e[t+6]=i[5],e[t+8]=i[6],e[t+9]=i[7],e[t+10]=i[8]},"mat4x4<f32>":(s,e,t,r,i)=>{for(let o=0;o<16;o++)e[t+o]=i[o]},"mat3x2<f32>":(s,e,t,r,i)=>{for(let o=0;o<6;o++)e[t+(o/3|0)*4+o%3]=i[o]},"mat4x2<f32>":(s,e,t,r,i)=>{for(let o=0;o<8;o++)e[t+(o/4|0)*4+o%4]=i[o]},"mat2x3<f32>":(s,e,t,r,i)=>{for(let o=0;o<6;o++)e[t+(o/2|0)*4+o%2]=i[o]},"mat4x3<f32>":(s,e,t,r,i)=>{for(let o=0;o<12;o++)e[t+(o/4|0)*4+o%4]=i[o]},"mat2x4<f32>":(s,e,t,r,i)=>{for(let o=0;o<8;o++)e[t+(o/2|0)*4+o%2]=i[o]},"mat3x4<f32>":(s,e,t,r,i)=>{for(let o=0;o<12;o++)e[t+(o/3|0)*4+o%3]=i[o]}},dn={f32:(s,e,t,r,i)=>{e[t]=i},i32:(s,e,t,r,i)=>{e[t]=i},"vec2<f32>":(s,e,t,r,i)=>{e[t]=i[0],e[t+1]=i[1]},"vec3<f32>":(s,e,t,r,i)=>{e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2]},"vec4<f32>":(s,e,t,r,i)=>{e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3]},"mat2x2<f32>":(s,e,t,r,i)=>{e[t]=i[0],e[t+1]=i[1],e[t+4]=i[2],e[t+5]=i[3]},"mat3x3<f32>":(s,e,t,r,i)=>{e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+4]=i[3],e[t+5]=i[4],e[t+6]=i[5],e[t+8]=i[6],e[t+9]=i[7],e[t+10]=i[8]},"mat4x4<f32>":(s,e,t,r,i)=>{for(let o=0;o<16;o++)e[t+o]=i[o]},"mat3x2<f32>":(s,e,t,r,i)=>{for(let o=0;o<6;o++)e[t+(o/3|0)*4+o%3]=i[o]},"mat4x2<f32>":(s,e,t,r,i)=>{for(let o=0;o<8;o++)e[t+(o/4|0)*4+o%4]=i[o]},"mat2x3<f32>":(s,e,t,r,i)=>{for(let o=0;o<6;o++)e[t+(o/2|0)*4+o%2]=i[o]},"mat4x3<f32>":(s,e,t,r,i)=>{for(let o=0;o<12;o++)e[t+(o/4|0)*4+o%4]=i[o]},"mat2x4<f32>":(s,e,t,r,i)=>{for(let o=0;o<8;o++)e[t+(o/2|0)*4+o%2]=i[o]},"mat3x4<f32>":(s,e,t,r,i)=>{for(let o=0;o<12;o++)e[t+(o/3|0)*4+o%3]=i[o]}};function xn(s){return gn(s,dn,e=>{let t=Math.max(Vo[e.data.type]/16,1),r=e.data.value.length/e.data.size,i=(4-r%4)%4;return(o,n,a,l,u)=>{let f=0;for(let p=0;p<e.data.size*t;p++){for(let c=0;c<r;c++)n[a++]=u[f++];a+=i}}})}function _n(s){return gn(s,hn,e=>{let{size:t,align:r}=$o[e.data.type],i=(Math.max(t,r)-t)/4;return(o,n,a,l,u)=>{let f=0;for(let p=0;p<e.data.size;p++){for(let c=0;c<t/4;c++)n[a++]=u[f++];a+=i}}})}function gn(s,e,t){let r={};for(let i in s){let o=s[i],n=o.data,a=!1;r[n.name]={offset:o.offset/4,func:null};for(let l=0;l<Wt.length;l++){let u=Wt[l];if(n.type===u.type&&u.test(n)){r[n.name].func=mn[l],a=!0;break}}a||(n.size===1?r[n.name].func=e[n.type]:r[n.name].func=t(o))}return(i,o,n,a)=>{for(let l in r)r[l].func(l,o,a+r[l].offset,i,i[l])}}var yn={f32(s,e,t,r,i,o,n){t!==r&&(e.value=r,n.uniform1f(i[s].location,r))},"vec2<f32>"(s,e,t,r,i,o,n){(t[0]!==r[0]||t[1]!==r[1])&&(t[0]=r[0],t[1]=r[1],n.uniform2f(i[s].location,r[0],r[1]))},"vec3<f32>"(s,e,t,r,i,o,n){(t[0]!==r[0]||t[1]!==r[1]||t[2]!==r[2])&&(t[0]=r[0],t[1]=r[1],t[2]=r[2],n.uniform3f(i[s].location,r[0],r[1],r[2]))},"vec4<f32>"(s,e,t,r,i,o,n){(t[0]!==r[0]||t[1]!==r[1]||t[2]!==r[2]||t[3]!==r[3])&&(t[0]=r[0],t[1]=r[1],t[2]=r[2],t[3]=r[3],n.uniform4f(i[s].location,r[0],r[1],r[2],r[3]))},i32(s,e,t,r,i,o,n){t!==r&&(e.value=r,n.uniform1i(i[s].location,r))},"vec2<i32>"(s,e,t,r,i,o,n){(t[0]!==r[0]||t[1]!==r[1])&&(t[0]=r[0],t[1]=r[1],n.uniform2i(i[s].location,r[0],r[1]))},"vec3<i32>"(s,e,t,r,i,o,n){(t[0]!==r[0]||t[1]!==r[1]||t[2]!==r[2])&&(t[0]=r[0],t[1]=r[1],t[2]=r[2],n.uniform3i(i[s].location,r[0],r[1],r[2]))},"vec4<i32>"(s,e,t,r,i,o,n){(t[0]!==r[0]||t[1]!==r[1]||t[2]!==r[2]||t[3]!==r[3])&&(t[0]=r[0],t[1]=r[1],t[2]=r[2],t[3]=r[3],n.uniform4i(i[s].location,r[0],r[1],r[2],r[3]))},u32(s,e,t,r,i,o,n){t!==r&&(e.value=r,n.uniform1ui(i[s].location,r))},"vec2<u32>"(s,e,t,r,i,o,n){(t[0]!==r[0]||t[1]!==r[1])&&(t[0]=r[0],t[1]=r[1],n.uniform2ui(i[s].location,r[0],r[1]))},"vec3<u32>"(s,e,t,r,i,o,n){(t[0]!==r[0]||t[1]!==r[1]||t[2]!==r[2])&&(t[0]=r[0],t[1]=r[1],t[2]=r[2],n.uniform3ui(i[s].location,r[0],r[1],r[2]))},"vec4<u32>"(s,e,t,r,i,o,n){(t[0]!==r[0]||t[1]!==r[1]||t[2]!==r[2]||t[3]!==r[3])&&(t[0]=r[0],t[1]=r[1],t[2]=r[2],t[3]=r[3],n.uniform4ui(i[s].location,r[0],r[1],r[2],r[3]))},bool(s,e,t,r,i,o,n){t!==r&&(e.value=r,n.uniform1i(i[s].location,r))},"vec2<bool>"(s,e,t,r,i,o,n){(t[0]!==r[0]||t[1]!==r[1])&&(t[0]=r[0],t[1]=r[1],n.uniform2i(i[s].location,r[0],r[1]))},"vec3<bool>"(s,e,t,r,i,o,n){(t[0]!==r[0]||t[1]!==r[1]||t[2]!==r[2])&&(t[0]=r[0],t[1]=r[1],t[2]=r[2],n.uniform3i(i[s].location,r[0],r[1],r[2]))},"vec4<bool>"(s,e,t,r,i,o,n){(t[0]!==r[0]||t[1]!==r[1]||t[2]!==r[2]||t[3]!==r[3])&&(t[0]=r[0],t[1]=r[1],t[2]=r[2],t[3]=r[3],n.uniform4i(i[s].location,r[0],r[1],r[2],r[3]))},"mat2x2<f32>"(s,e,t,r,i,o,n){n.uniformMatrix2fv(i[s].location,!1,r)},"mat3x3<f32>"(s,e,t,r,i,o,n){n.uniformMatrix3fv(i[s].location,!1,r)},"mat4x4<f32>"(s,e,t,r,i,o,n){n.uniformMatrix4fv(i[s].location,!1,r)}},vn={f32(s,e,t,r,i,o,n){n.uniform1fv(i[s].location,r)},"vec2<f32>"(s,e,t,r,i,o,n){n.uniform2fv(i[s].location,r)},"vec3<f32>"(s,e,t,r,i,o,n){n.uniform3fv(i[s].location,r)},"vec4<f32>"(s,e,t,r,i,o,n){n.uniform4fv(i[s].location,r)},"mat2x2<f32>"(s,e,t,r,i,o,n){n.uniformMatrix2fv(i[s].location,!1,r)},"mat3x3<f32>"(s,e,t,r,i,o,n){n.uniformMatrix3fv(i[s].location,!1,r)},"mat4x4<f32>"(s,e,t,r,i,o,n){n.uniformMatrix4fv(i[s].location,!1,r)},i32(s,e,t,r,i,o,n){n.uniform1iv(i[s].location,r)},"vec2<i32>"(s,e,t,r,i,o,n){n.uniform2iv(i[s].location,r)},"vec3<i32>"(s,e,t,r,i,o,n){n.uniform3iv(i[s].location,r)},"vec4<i32>"(s,e,t,r,i,o,n){n.uniform4iv(i[s].location,r)},u32(s,e,t,r,i,o,n){n.uniform1iv(i[s].location,r)},"vec2<u32>"(s,e,t,r,i,o,n){n.uniform2iv(i[s].location,r)},"vec3<u32>"(s,e,t,r,i,o,n){n.uniform3iv(i[s].location,r)},"vec4<u32>"(s,e,t,r,i,o,n){n.uniform4iv(i[s].location,r)},bool(s,e,t,r,i,o,n){n.uniform1iv(i[s].location,r)},"vec2<bool>"(s,e,t,r,i,o,n){n.uniform2iv(i[s].location,r)},"vec3<bool>"(s,e,t,r,i,o,n){n.uniform3iv(i[s].location,r)},"vec4<bool>"(s,e,t,r,i,o,n){n.uniform4iv(i[s].location,r)}},bn=[(s,e,t,r,i,o,n)=>{n.uniformMatrix3fv(i[s].location,!1,o[s].toArray(!0))},(s,e,t,r,i,o,n)=>{t=i[s].value,r=o[s],(t[0]!==r.x||t[1]!==r.y||t[2]!==r.width||t[3]!==r.height)&&(t[0]=r.x,t[1]=r.y,t[2]=r.width,t[3]=r.height,n.uniform4f(i[s].location,r.x,r.y,r.width,r.height))},(s,e,t,r,i,o,n)=>{t=i[s].value,r=o[s],(t[0]!==r.x||t[1]!==r.y)&&(t[0]=r.x,t[1]=r.y,n.uniform2f(i[s].location,r.x,r.y))},(s,e,t,r,i,o,n)=>{t=i[s].value,r=o[s],(t[0]!==r.red||t[1]!==r.green||t[2]!==r.blue||t[3]!==r.alpha)&&(t[0]=r.red,t[1]=r.green,t[2]=r.blue,t[3]=r.alpha,n.uniform4f(i[s].location,r.red,r.green,r.blue,r.alpha))},(s,e,t,r,i,o,n)=>{t=i[s].value,r=o[s],(t[0]!==r.red||t[1]!==r.green||t[2]!==r.blue)&&(t[0]=r.red,t[1]=r.green,t[2]=r.blue,n.uniform3f(i[s].location,r.red,r.green,r.blue))}];function Tn(s,e){let t={};for(let r in s.uniformStructures){if(!e[r])continue;let i=s.uniformStructures[r],o=!1;for(let n=0;n<Wt.length;n++){let a=Wt[n];if(i.type===a.type&&a.test(i)){t[r]=bn[n],o=!0;break}}if(!o){let n=i.size===1?yn:vn;t[r]=n[i.type]}}return(r,i,o)=>{let n=o.gl;for(let a in t){let l=i[a],u=r[a],f=r[a].value;t[a](a,u,f,l,r,i,n)}}}function Va(){Object.assign(qt.prototype,{_unsafeEvalCheck(){}}),Object.assign(Lo.prototype,{_systemCheck(){}}),Object.assign(Ho.prototype,{_generateUniformsSync:Tn}),Object.assign(Wo.prototype,{_generateUboSync:xn}),Object.assign(Ko.prototype,{_generateUboSync:_n}),Object.assign(jo.prototype,{_generateShaderSync:cn}),Object.assign(Wr.prototype,{generateParticleUpdate:pn})}Va();var Sn={extension:{type:B.Environment,name:"browser",priority:-1},test:()=>!0,load:async()=>{await import("./c-4MKEBG4E.js")}};var wn={extension:{type:B.Environment,name:"webworker",priority:0},test:()=>typeof self<"u"&&self.WorkerGlobalScope!==void 0,load:async()=>{await import("./c-7BMQILAO.js")}};var Nr;function Pn(s){return Nr!==void 0||(Nr=(()=>{let e={stencil:!0,failIfMajorPerformanceCaveat:s??qt.defaultOptions.failIfMajorPerformanceCaveat};try{if(!Y.get().getWebGLRenderingContext())return!1;let r=Y.get().createCanvas().getContext("webgl",e),i=!!r?.getContextAttributes()?.stencil;if(r){let o=r.getExtension("WEBGL_lose_context");o&&o.loseContext()}return r=null,i}catch{return!1}})()),Nr}var Xr;async function An(s={}){return Xr!==void 0||(Xr=await(async()=>{let e=Y.get().getNavigator().gpu;if(!e)return!1;try{return await(await e.requestAdapter(s)).requestDevice(),!0}catch{return!1}})()),Xr}var Cn=["webgl","webgpu","canvas"];async function Fn(s){let e=[];s.preference?Array.isArray(s.preference)?e=s.preference.slice():(e.push(s.preference),Cn.forEach(o=>{o!==s.preference&&e.push(o)})):e=Cn.slice();let t,r={};for(let o=0;o<e.length;o++){let n=e[o];if(n==="webgpu"&&await An()){let{WebGPURenderer:a}=await import("./c-FUBVYWV5.js");t=a,r={...s,...s.webgpu};break}else if(n==="webgl"&&Pn(s.failIfMajorPerformanceCaveat??qt.defaultOptions.failIfMajorPerformanceCaveat)){let{WebGLRenderer:a}=await import("./c-7QC7DLCO.js");t=a,r={...s,...s.webgl};break}else if(n==="canvas"){let{CanvasRenderer:a}=await import("./c-ZJQCG4T2.js");t=a,r={...s,...s.canvasOptions};break}}if(delete r.webgpu,delete r.webgl,delete r.canvasOptions,!t)throw new Error("No available renderer for the current environment");let i=new t;return await i.init(r),i}var hr=class{static init(e){Object.defineProperty(this,"resizeTo",{configurable:!0,set(t){globalThis.removeEventListener("resize",this.queueResize),this._resizeTo=t,t&&(globalThis.addEventListener("resize",this.queueResize),this.resize())},get(){return this._resizeTo}}),this.queueResize=()=>{this._resizeTo&&(this._cancelResize(),this._resizeId=requestAnimationFrame(()=>this.resize()))},this._cancelResize=()=>{this._resizeId&&(cancelAnimationFrame(this._resizeId),this._resizeId=null)},this.resize=()=>{if(!this._resizeTo)return;this._cancelResize();let t,r;if(this._resizeTo===globalThis.window)t=globalThis.innerWidth,r=globalThis.innerHeight;else{let{clientWidth:i,clientHeight:o}=this._resizeTo;t=i,r=o}this.renderer.resize(t,r),this.render()},this._resizeId=null,this._resizeTo=null,this.resizeTo=e.resizeTo||null}static destroy(){globalThis.removeEventListener("resize",this.queueResize),this._cancelResize(),this._cancelResize=null,this.queueResize=null,this.resizeTo=null,this.resize=null}};hr.extension=B.Application;var dr=class{static init(e){e=Object.assign({autoStart:!0,sharedTicker:!1},e),Object.defineProperty(this,"ticker",{configurable:!0,set(t){this._ticker&&this._ticker.remove(this.render,this),this._ticker=t,t&&t.add(this.render,this,en.LOW)},get(){return this._ticker}}),this.stop=()=>{this._ticker.stop()},this.start=()=>{this._ticker.start()},this._ticker=null,this.ticker=e.sharedTicker?Mi.shared:new Mi,e.autoStart&&this.start()}static destroy(){if(this._ticker){let e=this._ticker;this.ticker=null,e.destroy()}}};dr.extension=B.Application;Fe.add(hr);Fe.add(dr);var On=class ki{constructor(...e){this.stage=new le,e[0]!==void 0&&ce(ct,"Application constructor options are deprecated, please use Application.init() instead.")}async init(e){e={...e},this.stage||(this.stage=new le),this.renderer=await Fn(e),ki._plugins.forEach(t=>{t.init.call(this,e)})}render(){this.renderer.render({container:this.stage})}get canvas(){return this.renderer.canvas}get view(){return ce(ct,"Application.view is deprecated, please use Application.canvas instead."),this.renderer.canvas}get screen(){return this.renderer.screen}get domContainerRoot(){return this.renderer.renderPipes.dom?._domElement}destroy(e=!1,t=!1){let r=ki._plugins.slice(0);r.reverse(),r.forEach(i=>{i.destroy.call(this)}),this.stage.destroy(t),this.stage=null,this.renderer.destroy(e),this.renderer=null}};On._plugins=[];var qr=On;Fe.handleByList(B.Application,qr._plugins);Fe.add(nn);var Yr={test(s){return typeof s=="string"&&s.startsWith("info face=")},parse(s){let e=s.match(/^[a-z]+\s+.+$/gm),t={info:[],common:[],page:[],char:[],chars:[],kerning:[],kernings:[],distanceField:[]};for(let p in e){let c=e[p].match(/^[a-z]+/gm)[0],h=e[p].match(/[a-zA-Z]+=([^\s"']+|"([^"]*)")/gm),_={};for(let m in h){let d=h[m].split("="),g=d[0],b=d[1].replace(/"/gm,""),S=parseFloat(b),A=isNaN(S)?b:S;_[g]=A}t[c].push(_)}let r={chars:{},pages:[],lineHeight:0,fontSize:0,fontFamily:"",distanceField:null,baseLineOffset:0},[i]=t.info,[o]=t.common,[n]=t.distanceField??[];n&&(r.distanceField={range:parseInt(n.distanceRange,10),type:n.fieldType}),r.fontSize=parseInt(i.size,10),r.fontFamily=i.face,r.lineHeight=parseInt(o.lineHeight,10);let a=t.page;for(let p=0;p<a.length;p++)r.pages.push({id:parseInt(a[p].id,10)||0,file:a[p].file});let l={};r.baseLineOffset=o.base===void 0?0:r.lineHeight-parseInt(o.base,10);let u=t.char;for(let p=0;p<u.length;p++){let c=u[p],h=parseInt(c.id,10),_=c.letter??c.char??String.fromCharCode(h);_==="space"&&(_=" "),l[h]=_,r.chars[_]={id:h,page:parseInt(c.page,10)||0,x:parseInt(c.x,10),y:parseInt(c.y,10),width:parseInt(c.width,10),height:parseInt(c.height,10),xOffset:parseInt(c.xoffset,10),yOffset:parseInt(c.yoffset,10),xAdvance:parseInt(c.xadvance,10),kerning:{}}}let f=t.kerning||[];for(let p=0;p<f.length;p++){let c=parseInt(f[p].first,10),h=parseInt(f[p].second,10),_=parseInt(f[p].amount,10);r.chars[l[h]]&&(r.chars[l[h]].kerning[l[c]]=_)}return r}};var Ei={test(s){let e=s;return typeof e!="string"&&"getElementsByTagName"in e&&e.getElementsByTagName("page").length&&e.getElementsByTagName("info")[0].getAttribute("face")!==null},parse(s){let e={chars:{},pages:[],lineHeight:0,fontSize:0,fontFamily:"",distanceField:null,baseLineOffset:0},t=s.getElementsByTagName("info")[0],r=s.getElementsByTagName("common")[0],i=s.getElementsByTagName("distanceField")[0];i&&(e.distanceField={type:i.getAttribute("fieldType"),range:parseInt(i.getAttribute("distanceRange"),10)});let o=s.getElementsByTagName("page"),n=s.getElementsByTagName("char"),a=s.getElementsByTagName("kerning");e.fontSize=parseInt(t.getAttribute("size"),10),e.fontFamily=t.getAttribute("face"),e.lineHeight=parseInt(r.getAttribute("lineHeight"),10);for(let f=0;f<o.length;f++)e.pages.push({id:parseInt(o[f].getAttribute("id"),10)||0,file:o[f].getAttribute("file")});let l={},u=r.getAttribute("base");e.baseLineOffset=u===null?0:e.lineHeight-parseInt(u,10);for(let f=0;f<n.length;f++){let p=n[f],c=parseInt(p.getAttribute("id"),10),h=p.getAttribute("letter")??p.getAttribute("char")??String.fromCharCode(c);h==="space"&&(h=" "),l[c]=h,e.chars[h]={id:c,page:parseInt(p.getAttribute("page"),10)||0,x:parseInt(p.getAttribute("x"),10),y:parseInt(p.getAttribute("y"),10),width:parseInt(p.getAttribute("width"),10),height:parseInt(p.getAttribute("height"),10),xOffset:parseInt(p.getAttribute("xoffset"),10),yOffset:parseInt(p.getAttribute("yoffset"),10),xAdvance:parseInt(p.getAttribute("xadvance"),10),kerning:{}}}for(let f=0;f<a.length;f++){let p=parseInt(a[f].getAttribute("first"),10),c=parseInt(a[f].getAttribute("second"),10),h=parseInt(a[f].getAttribute("amount"),10);e.chars[l[c]]&&(e.chars[l[c]].kerning[l[p]]=h)}return e}};var Ri={test(s){return typeof s=="string"&&s.match(/<font(\s|>)/)?Ei.test(Y.get().parseXML(s)):!1},parse(s){return Ei.parse(Y.get().parseXML(s))}};var Wa=[".xml",".fnt"],Mn={extension:{type:B.CacheParser,name:"cacheBitmapFont"},test:s=>!!s?.pages&&!!s?.chars&&typeof s?.fontFamily=="string"&&s.fontFamily!=="",getCacheableAssets(s,e){let t={};return s.forEach(r=>{t[r]=e,t[`${r}-bitmap`]=e}),t[`${e.fontFamily}-bitmap`]=e,t}},Bn={extension:{type:B.LoadParser,priority:Le.Normal},name:"loadBitmapFont",id:"bitmap-font",test(s){return Wa.includes(Ve.extname(s).toLowerCase())},async testParse(s){return Yr.test(s)||Ri.test(s)},async parse(s,e,t){let r=Yr.test(s)?Yr.parse(s):Ri.parse(s),{src:i}=e,{pages:o}=r,n=[],a=r.distanceField?{scaleMode:"linear",alphaMode:"premultiply-alpha-on-upload",autoGenerateMipmaps:!1,resolution:1}:{};for(let c=0;c<o.length;++c){let h=o[c].file,_=Ve.join(Ve.dirname(i),h);_=tn(_,i),n.push({src:_,data:a})}let[l,{BitmapFont:u}]=await Promise.all([t.load(n),import("./c-XTKA7YQ3.js")]),f=n.map(c=>l[c.src]);return new u({data:r,textures:f},i)},async load(s,e){return await(await Y.get().fetch(s)).text()},async unload(s,e,t){await Promise.all(s.pages.map(r=>t.unload(r.texture.source._sourceOrigin))),s.destroy()}};var jr=class{constructor(e,t=!1){this._loader=e,this._assetList=[],this._isLoading=!1,this._maxConcurrent=1,this.verbose=t}add(e){e.forEach(t=>{this._assetList.push(t)}),this.verbose&&console.log("[BackgroundLoader] assets: ",this._assetList),this._isActive&&!this._isLoading&&this._next()}async _next(){if(this._assetList.length&&this._isActive){this._isLoading=!0;let e=[],t=Math.min(this._assetList.length,this._maxConcurrent);for(let r=0;r<t;r++)e.push(this._assetList.pop());await this._loader.load(e),this._isLoading=!1,this._next()}}get active(){return this._isActive}set active(e){this._isActive!==e&&(this._isActive=e,e&&!this._isLoading&&this._next())}};var kn={extension:{type:B.CacheParser,name:"cacheTextureArray"},test:s=>Array.isArray(s)&&s.every(e=>e instanceof Ot),getCacheableAssets:(s,e)=>{let t={};return s.forEach(r=>{e.forEach((i,o)=>{t[r+(o===0?"":o+1)]=i})}),t}};async function Hr(s){if("Image"in globalThis)return new Promise(e=>{let t=new Image;t.onload=()=>{e(!0)},t.onerror=()=>{e(!1)},t.src=s});if("createImageBitmap"in globalThis&&"fetch"in globalThis){try{let e=await(await fetch(s)).blob();await createImageBitmap(e)}catch{return!1}return!0}return!1}var En={extension:{type:B.DetectionParser,priority:1},test:async()=>Hr("data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A="),add:async s=>[...s,"avif"],remove:async s=>s.filter(e=>e!=="avif")};var Rn=["png","jpg","jpeg"],zn={extension:{type:B.DetectionParser,priority:-1},test:()=>Promise.resolve(!0),add:async s=>[...s,...Rn],remove:async s=>s.filter(e=>!Rn.includes(e))};var Na="WorkerGlobalScope"in globalThis&&globalThis instanceof globalThis.WorkerGlobalScope;function ht(s){return Na?!1:document.createElement("video").canPlayType(s)!==""}var In={extension:{type:B.DetectionParser,priority:0},test:async()=>ht("video/mp4"),add:async s=>[...s,"mp4","m4v"],remove:async s=>s.filter(e=>e!=="mp4"&&e!=="m4v")};var Un={extension:{type:B.DetectionParser,priority:0},test:async()=>ht("video/ogg"),add:async s=>[...s,"ogv"],remove:async s=>s.filter(e=>e!=="ogv")};var Gn={extension:{type:B.DetectionParser,priority:0},test:async()=>ht("video/webm"),add:async s=>[...s,"webm"],remove:async s=>s.filter(e=>e!=="webm")};var Dn={extension:{type:B.DetectionParser,priority:0},test:async()=>Hr("data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA="),add:async s=>[...s,"webp"],remove:async s=>s.filter(e=>e!=="webp")};var Ln=class $r{constructor(){this.loadOptions={...$r.defaultOptions},this._parsers=[],this._parsersValidated=!1,this.parsers=new Proxy(this._parsers,{set:(e,t,r)=>(this._parsersValidated=!1,e[t]=r,!0)}),this.promiseCache={}}reset(){this._parsersValidated=!1,this.promiseCache={}}_getLoadPromiseAndParser(e,t){let r={promise:null,parser:null};return r.promise=(async()=>{let i=null,o=null;if((t.parser||t.loadParser)&&(o=this._parserHash[t.parser||t.loadParser],t.loadParser&&ze(`[Assets] "loadParser" is deprecated, use "parser" instead for ${e}`),o||ze(`[Assets] specified load parser "${t.parser||t.loadParser}" not found while loading ${e}`)),!o){for(let n=0;n<this.parsers.length;n++){let a=this.parsers[n];if(a.load&&a.test?.(e,t,this)){o=a;break}}if(!o)return ze(`[Assets] ${e} could not be loaded as we don't know how to parse it, ensure the correct parser has been added`),null}i=await o.load(e,t,this),r.parser=o;for(let n=0;n<this.parsers.length;n++){let a=this.parsers[n];a.parse&&a.parse&&await a.testParse?.(i,t,this)&&(i=await a.parse(i,t,this)||i,r.parser=a)}return i})(),r}async load(e,t){this._parsersValidated||this._validateParsers();let r=typeof t=="function"?{...$r.defaultOptions,...this.loadOptions,onProgress:t}:{...$r.defaultOptions,...this.loadOptions,...t||{}},{onProgress:i,onError:o,strategy:n,retryCount:a,retryDelay:l}=r,u=0,f={},p=Lr(e),c=Mt(e,m=>({alias:[m],src:m,data:{}})),h=c.reduce((m,d)=>m+(d.progressSize||1),0),_=c.map(async m=>{let d=Ve.toAbsolute(m.src);f[m.src]||(await this._loadAssetWithRetry(d,m,{onProgress:i,onError:o,strategy:n,retryCount:a,retryDelay:l},f),u+=m.progressSize||1,i&&i(u/h))});return await Promise.all(_),p?f[c[0].src]:f}async unload(e){let r=Mt(e,i=>({alias:[i],src:i})).map(async i=>{let o=Ve.toAbsolute(i.src),n=this.promiseCache[o];if(n){let a=await n.promise;delete this.promiseCache[o],await n.parser?.unload?.(a,i,this)}});await Promise.all(r)}_validateParsers(){this._parsersValidated=!0,this._parserHash=this._parsers.filter(e=>e.name||e.id).reduce((e,t)=>(!t.name&&!t.id?ze("[Assets] parser should have an id"):(e[t.name]||e[t.id])&&ze(`[Assets] parser id conflict "${t.id}"`),e[t.name]=t,t.id&&(e[t.id]=t),e),{})}async _loadAssetWithRetry(e,t,r,i){let o=0,{onError:n,strategy:a,retryCount:l,retryDelay:u}=r,f=p=>new Promise(c=>setTimeout(c,p));for(;;)try{this.promiseCache[e]||(this.promiseCache[e]=this._getLoadPromiseAndParser(e,t)),i[t.src]=await this.promiseCache[e].promise;return}catch(p){delete this.promiseCache[e],delete i[t.src],o++;let c=a!=="retry"||o>l;if(a==="retry"&&!c){n&&n(p,t),await f(u);continue}if(a==="skip"){n&&n(p,t);return}n&&n(p,t);let h=new Error(`[Loader.load] Failed to load ${e}.
${p}`);throw p instanceof Error&&p.stack&&(h.stack=p.stack),h}}};Ln.defaultOptions={onProgress:void 0,onError:void 0,strategy:"throw",retryCount:3,retryDelay:250};var Vn=Ln;function We(s,e){if(Array.isArray(e)){for(let t of e)if(s.startsWith(`data:${t}`))return!0;return!1}return s.startsWith(`data:${e}`)}function Ne(s,e){let t=s.split("?")[0],r=Ve.extname(t).toLowerCase();return Array.isArray(e)?e.includes(r):r===e}var Xa=".json",qa="application/json",Wn={extension:{type:B.LoadParser,priority:Le.Low},name:"loadJson",id:"json",test(s){return We(s,qa)||Ne(s,Xa)},async load(s){return await(await Y.get().fetch(s)).json()}};var Ya=".txt",ja="text/plain",Nn={name:"loadTxt",id:"text",extension:{type:B.LoadParser,priority:Le.Low,name:"loadTxt"},test(s){return We(s,ja)||Ne(s,Ya)},async load(s){return await(await Y.get().fetch(s)).text()}};var Ha=["normal","bold","100","200","300","400","500","600","700","800","900"],$a=[".ttf",".otf",".woff",".woff2"],Ka=["font/ttf","font/otf","font/woff","font/woff2"],Qa=/^(--|-?[A-Z_])[0-9A-Z_-]*$/i;function Za(s){let e=Ve.extname(s),i=Ve.basename(s,e).replace(/(-|_)/g," ").toLowerCase().split(" ").map(a=>a.charAt(0).toUpperCase()+a.slice(1)),o=i.length>0;for(let a of i)if(!a.match(Qa)){o=!1;break}let n=i.join(" ");return o||(n=`"${n.replace(/[\\"]/g,"\\$&")}"`),n}var Ja=/^[0-9A-Za-z%:/?#\[\]@!\$&'()\*\+,;=\-._~]*$/;function el(s){return Ja.test(s)?s:encodeURI(s)}var Xn={extension:{type:B.LoadParser,priority:Le.Low},name:"loadWebFont",id:"web-font",test(s){return We(s,Ka)||Ne(s,$a)},async load(s,e){let t=Y.get().getFontFaceSet();if(t){let r=[],i=e.data?.family??Za(s),o=e.data?.weights?.filter(a=>Ha.includes(a))??["normal"],n=e.data??{};for(let a=0;a<o.length;a++){let l=o[a],u=new FontFace(i,`url('${el(s)}')`,{...n,weight:l});await u.load(),t.add(u),r.push(u)}return Te.has(`${i}-and-url`)?Te.get(`${i}-and-url`).entries.push({url:s,faces:r}):Te.set(`${i}-and-url`,{entries:[{url:s,faces:r}]}),r.length===1?r[0]:r}return ze("[loadWebFont] FontFace API is not supported. Skipping loading font"),null},unload(s){let e=Array.isArray(s)?s:[s],t=e[0].family,r=Te.get(`${t}-and-url`),i=r.entries.find(o=>o.faces.some(n=>e.indexOf(n)!==-1));i.faces=i.faces.filter(o=>e.indexOf(o)===-1),i.faces.length===0&&(r.entries=r.entries.filter(o=>o!==i)),e.forEach(o=>{Y.get().getFontFaceSet().delete(o)}),r.entries.length===0&&Te.remove(`${t}-and-url`)}};function Yt(s,e=1){let t=mt.RETINA_PREFIX?.exec(s);return t?parseFloat(t[1]):e}function jt(s,e,t){s.label=t,s._sourceOrigin=t;let r=new Ot({source:s,label:t}),i=()=>{delete e.promiseCache[t],Te.has(t)&&Te.remove(t)};return r.source.once("destroy",()=>{e.promiseCache[t]&&(ze("[Assets] A TextureSource managed by Assets was destroyed instead of unloaded! Use Assets.unload() instead of destroying the TextureSource."),i())}),r.once("destroy",()=>{s.destroyed||(ze("[Assets] A Texture managed by Assets was destroyed instead of unloaded! Use Assets.unload() instead of destroying the Texture."),i())}),r}var tl=".svg",rl="image/svg+xml",qn={extension:{type:B.LoadParser,priority:Le.Low,name:"loadSVG"},name:"loadSVG",id:"svg",config:{crossOrigin:"anonymous",parseAsGraphicsContext:!1},test(s){return We(s,rl)||Ne(s,tl)},async load(s,e,t){return e.data?.parseAsGraphicsContext??this.config.parseAsGraphicsContext?ol(s):il(s,e,t,this.config.crossOrigin)},unload(s){s.destroy(!0)}};async function il(s,e,t,r){let i=await Y.get().fetch(s),o=Y.get().createImage();o.src=`data:image/svg+xml;charset=utf-8,${encodeURIComponent(await i.text())}`,o.crossOrigin=r,await o.decode();let n=e.data?.width??o.width,a=e.data?.height??o.height,l=e.data?.resolution||Yt(s),u=Math.ceil(n*l),f=Math.ceil(a*l),p=Y.get().createCanvas(u,f),c=p.getContext("2d");c.imageSmoothingEnabled=!0,c.imageSmoothingQuality="high",c.drawImage(o,0,0,n*l,a*l);let{parseAsGraphicsContext:h,..._}=e.data??{},m=new Vr({resource:p,alphaMode:"premultiply-alpha-on-upload",resolution:l,..._});return jt(m,t,s)}async function ol(s){let t=await(await Y.get().fetch(s)).text(),r=new sn;return r.svg(t),r}var nl=`(function () {
    'use strict';

    const WHITE_PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";
    async function checkImageBitmap() {
      try {
        if (typeof createImageBitmap !== "function") return false;
        const response = await fetch(WHITE_PNG);
        const imageBlob = await response.blob();
        const imageBitmap = await createImageBitmap(imageBlob);
        return imageBitmap.width === 1 && imageBitmap.height === 1;
      } catch (_e) {
        return false;
      }
    }
    void checkImageBitmap().then((result) => {
      self.postMessage(result);
    });

})();
`,Ht=null,$t=class{constructor(){Ht||(Ht=URL.createObjectURL(new Blob([nl],{type:"application/javascript"}))),this.worker=new Worker(Ht)}};$t.revokeObjectURL=function(){Ht&&(URL.revokeObjectURL(Ht),Ht=null)};var sl=`(function () {
    'use strict';

    async function loadImageBitmap(url, alphaMode) {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(\`[WorkerManager.loadImageBitmap] Failed to fetch \${url}: \${response.status} \${response.statusText}\`);
      }
      const imageBlob = await response.blob();
      return alphaMode === "premultiplied-alpha" ? createImageBitmap(imageBlob, { premultiplyAlpha: "none" }) : createImageBitmap(imageBlob);
    }
    self.onmessage = async (event) => {
      try {
        const imageBitmap = await loadImageBitmap(event.data.data[0], event.data.data[1]);
        self.postMessage({
          data: imageBitmap,
          uuid: event.data.uuid,
          id: event.data.id
        }, [imageBitmap]);
      } catch (e) {
        self.postMessage({
          error: e,
          uuid: event.data.uuid,
          id: event.data.id
        });
      }
    };

})();
`,Kt=null,xr=class{constructor(){Kt||(Kt=URL.createObjectURL(new Blob([sl],{type:"application/javascript"}))),this.worker=new Worker(Kt)}};xr.revokeObjectURL=function(){Kt&&(URL.revokeObjectURL(Kt),Kt=null)};var Yn=0,zi,Ii=class{constructor(){this._initialized=!1,this._createdWorkers=0,this._workerPool=[],this._queue=[],this._resolveHash={}}isImageBitmapSupported(){return this._isImageBitmapSupported!==void 0?this._isImageBitmapSupported:(this._isImageBitmapSupported=new Promise(e=>{let{worker:t}=new $t;t.addEventListener("message",r=>{t.terminate(),$t.revokeObjectURL(),e(r.data)})}),this._isImageBitmapSupported)}loadImageBitmap(e,t){return this._run("loadImageBitmap",[e,t?.data?.alphaMode])}async _initWorkers(){this._initialized||(this._initialized=!0)}_getWorker(){zi===void 0&&(zi=navigator.hardwareConcurrency||4);let e=this._workerPool.pop();return!e&&this._createdWorkers<zi&&(this._createdWorkers++,e=new xr().worker,e.addEventListener("message",t=>{this._complete(t.data),this._returnWorker(t.target),this._next()})),e}_returnWorker(e){this._workerPool.push(e)}_complete(e){this._resolveHash[e.uuid]&&(e.error!==void 0?this._resolveHash[e.uuid].reject(e.error):this._resolveHash[e.uuid].resolve(e.data),delete this._resolveHash[e.uuid])}async _run(e,t){await this._initWorkers();let r=new Promise((i,o)=>{this._queue.push({id:e,arguments:t,resolve:i,reject:o})});return this._next(),r}_next(){if(!this._queue.length)return;let e=this._getWorker();if(!e)return;let t=this._queue.pop(),r=t.id;this._resolveHash[Yn]={resolve:t.resolve,reject:t.reject},e.postMessage({data:t.arguments,uuid:Yn++,id:r})}reset(){this._workerPool.forEach(e=>e.terminate()),this._workerPool.length=0,Object.values(this._resolveHash).forEach(({reject:e})=>{e?.(new Error("WorkerManager has been reset before completion"))}),this._resolveHash={},this._queue.length=0,this._initialized=!1,this._createdWorkers=0}},Ui=new Ii;var al=[".jpeg",".jpg",".png",".webp",".avif"],ll=["image/jpeg","image/png","image/webp","image/avif"];async function ul(s,e){let t=await Y.get().fetch(s);if(!t.ok)throw new Error(`[loadImageBitmap] Failed to fetch ${s}: ${t.status} ${t.statusText}`);let r=await t.blob();return e?.data?.alphaMode==="premultiplied-alpha"?createImageBitmap(r,{premultiplyAlpha:"none"}):createImageBitmap(r)}var Kr={name:"loadTextures",id:"texture",extension:{type:B.LoadParser,priority:Le.High,name:"loadTextures"},config:{preferWorkers:!0,preferCreateImageBitmap:!0,crossOrigin:"anonymous"},test(s){return We(s,ll)||Ne(s,al)},async load(s,e,t){let r=null;globalThis.createImageBitmap&&this.config.preferCreateImageBitmap?this.config.preferWorkers&&await Ui.isImageBitmapSupported()?r=await Ui.loadImageBitmap(s,e):r=await ul(s,e):r=await new Promise((o,n)=>{r=Y.get().createImage(),r.crossOrigin=this.config.crossOrigin,r.src=s,r.complete?o(r):(r.onload=()=>{o(r)},r.onerror=n)});let i=new Vr({resource:r,alphaMode:"premultiply-alpha-on-upload",resolution:e.data?.resolution||Yt(s),...e.data});return jt(i,t,s)},unload(s){s.destroy(!0)}};var fl=[".mp4",".m4v",".webm",".ogg",".ogv",".h264",".avi",".mov"],Gi,Di;function pl(s,e,t){t===void 0&&!e.startsWith("data:")?s.crossOrigin=ml(e):t!==!1&&(s.crossOrigin=typeof t=="string"?t:"anonymous")}function cl(s){return new Promise((e,t)=>{s.addEventListener("canplaythrough",r),s.addEventListener("error",i),s.load();function r(){o(),e()}function i(n){o(),t(n)}function o(){s.removeEventListener("canplaythrough",r),s.removeEventListener("error",i)}})}function ml(s,e=globalThis.location){if(s.startsWith("data:"))return"";e||(e=globalThis.location);let t=new URL(s,document.baseURI);return t.hostname!==e.hostname||t.port!==e.port||t.protocol!==e.protocol?"anonymous":""}function hl(){let s=[],e=[];for(let t of fl){let r=cr.MIME_TYPES[t.substring(1)]||`video/${t.substring(1)}`;ht(r)&&(s.push(t),e.includes(r)||e.push(r))}return{validVideoExtensions:s,validVideoMime:e}}var jn={name:"loadVideo",id:"video",extension:{type:B.LoadParser,name:"loadVideo"},test(s){if(!Gi||!Di){let{validVideoExtensions:r,validVideoMime:i}=hl();Gi=r,Di=i}let e=We(s,Di),t=Ne(s,Gi);return e||t},async load(s,e,t){let r={...cr.defaultOptions,resolution:e.data?.resolution||Yt(s),alphaMode:e.data?.alphaMode||await rn(),...e.data},i=document.createElement("video"),o={preload:r.autoLoad!==!1?"auto":void 0,"webkit-playsinline":r.playsinline!==!1?"":void 0,playsinline:r.playsinline!==!1?"":void 0,muted:r.muted===!0?"":void 0,loop:r.loop===!0?"":void 0,autoplay:r.autoPlay!==!1?"":void 0};Object.keys(o).forEach(l=>{let u=o[l];u!==void 0&&i.setAttribute(l,u)}),r.muted===!0&&(i.muted=!0),pl(i,s,r.crossorigin);let n=document.createElement("source"),a;if(r.mime)a=r.mime;else if(s.startsWith("data:"))a=s.slice(5,s.indexOf(";"));else if(!s.startsWith("blob:")){let l=s.split("?")[0].slice(s.lastIndexOf(".")+1).toLowerCase();a=cr.MIME_TYPES[l]||`video/${l}`}return n.src=s,a&&(n.type=a),new Promise((l,u)=>{r.preload&&!r.autoPlay&&i.load(),i.addEventListener("canplay",f),i.addEventListener("error",p),n.addEventListener("error",p),i.appendChild(n);async function f(){let h=new cr({...r,resource:i});c(),e.data.preload&&await cl(i),l(jt(h,t,s))}function p(h){c(),u(h)}function c(){i.removeEventListener("canplay",f),i.removeEventListener("error",p),n.removeEventListener("error",p)}})},unload(s){s.destroy(!0)}};var Qr={extension:{type:B.ResolveParser,name:"resolveTexture"},test:Kr.test,parse:s=>({resolution:parseFloat(mt.RETINA_PREFIX.exec(s)?.[1]??"1"),format:s.split(".").pop(),src:s})};var Hn={extension:{type:B.ResolveParser,priority:-2,name:"resolveJson"},test:s=>mt.RETINA_PREFIX.test(s)&&s.endsWith(".json"),parse:Qr.parse};var Zr=class{constructor(){this._detections=[],this._initialized=!1,this.resolver=new mt,this.loader=new Vn,this.cache=Te,this._backgroundLoader=new jr(this.loader),this._backgroundLoader.active=!0,this.reset()}async init(e={}){if(this._initialized){ze("[Assets]AssetManager already initialized, did you load before calling this Assets.init()?");return}if(this._initialized=!0,e.defaultSearchParams&&this.resolver.setDefaultSearchParams(e.defaultSearchParams),e.basePath&&(this.resolver.basePath=e.basePath),e.bundleIdentifier&&this.resolver.setBundleIdentifier(e.bundleIdentifier),e.manifest){let o=e.manifest;typeof o=="string"&&(o=await this.load(o)),this.resolver.addManifest(o)}let t=e.texturePreference?.resolution??1,r=typeof t=="number"?[t]:t,i=await this._detectFormats({preferredFormats:e.texturePreference?.format,skipDetections:e.skipDetections,detections:this._detections});this.resolver.prefer({params:{format:i,resolution:r}}),e.preferences&&this.setPreferences(e.preferences),e.loadOptions&&(this.loader.loadOptions={...this.loader.loadOptions,...e.loadOptions})}add(e){this.resolver.add(e)}async load(e,t){this._initialized||await this.init();let r=Lr(e),i=Mt(e).map(a=>{if(typeof a!="string"){let l=this.resolver.getAlias(a);return l.some(u=>!this.resolver.hasKey(u))&&this.add(a),Array.isArray(l)?l[0]:l}return this.resolver.hasKey(a)||this.add({alias:a,src:a}),a}),o=this.resolver.resolve(i),n=await this._mapLoadToResolve(o,t);return r?n[i[0]]:n}addBundle(e,t){this.resolver.addBundle(e,t)}async loadBundle(e,t){this._initialized||await this.init();let r=!1;typeof e=="string"&&(r=!0,e=[e]);let i=this.resolver.resolveBundle(e),o={},n=Object.keys(i),a=0,l=[],u=()=>{t?.(l.reduce((p,c)=>p+c,0)/a)},f=n.map((p,c)=>{let h=i[p],_=Object.values(h),d=[...new Set(_.flat())].reduce((g,b)=>g+(b.progressSize||1),0);return l.push(0),a+=d,this._mapLoadToResolve(h,g=>{l[c]=g*d,u()}).then(g=>{o[p]=g})});return await Promise.all(f),r?o[e[0]]:o}async backgroundLoad(e){this._initialized||await this.init(),typeof e=="string"&&(e=[e]);let t=this.resolver.resolve(e);this._backgroundLoader.add(Object.values(t))}async backgroundLoadBundle(e){this._initialized||await this.init(),typeof e=="string"&&(e=[e]);let t=this.resolver.resolveBundle(e);Object.values(t).forEach(r=>{this._backgroundLoader.add(Object.values(r))})}reset(){this.resolver.reset(),this.loader.reset(),this.cache.reset(),this._initialized=!1}get(e){if(typeof e=="string")return Te.get(e);let t={};for(let r=0;r<e.length;r++)t[r]=Te.get(e[r]);return t}async _mapLoadToResolve(e,t){let r=[...new Set(Object.values(e))];this._backgroundLoader.active=!1;let i=await this.loader.load(r,t);this._backgroundLoader.active=!0;let o={};return r.forEach(n=>{let a=i[n.src],l=[n.src];n.alias&&l.push(...n.alias),l.forEach(u=>{o[u]=a}),Te.set(l,a)}),o}async unload(e){this._initialized||await this.init();let t=Mt(e).map(i=>typeof i!="string"?i.src:i),r=this.resolver.resolve(t);await this._unloadFromResolved(r)}async unloadBundle(e){this._initialized||await this.init(),e=Mt(e);let t=this.resolver.resolveBundle(e),r=Object.keys(t).map(i=>this._unloadFromResolved(t[i]));await Promise.all(r)}async _unloadFromResolved(e){let t=Object.values(e);t.forEach(r=>{Te.remove(r.src)}),await this.loader.unload(t)}async _detectFormats(e){let t=[];e.preferredFormats&&(t=Array.isArray(e.preferredFormats)?e.preferredFormats:[e.preferredFormats]);for(let r of e.detections)e.skipDetections||await r.test()?t=await r.add(t):e.skipDetections||(t=await r.remove(t));return t=t.filter((r,i)=>t.indexOf(r)===i),t}get detections(){return this._detections}setPreferences(e){this.loader.parsers.forEach(t=>{t.config&&Object.keys(t.config).filter(r=>r in e).forEach(r=>{t.config[r]=e[r]})})}},dt=new Zr;Fe.handleByList(B.LoadParser,dt.loader.parsers).handleByList(B.ResolveParser,dt.resolver.parsers).handleByList(B.CacheParser,dt.cache.parsers).handleByList(B.DetectionParser,dt.detections);Fe.add(kn,zn,En,Dn,In,Un,Gn,Wn,Nn,Xn,qn,Kr,jn,Bn,Mn,Qr,Hn);var $n={loader:B.LoadParser,resolver:B.ResolveParser,cache:B.CacheParser,detection:B.DetectionParser};Fe.handle(B.Asset,s=>{let e=s.ref;Object.entries($n).filter(([t])=>!!e[t]).forEach(([t,r])=>Fe.add(Object.assign(e[t],{extension:e[t].extension??r})))},s=>{let e=s.ref;Object.keys($n).filter(t=>!!e[t]).forEach(t=>Fe.remove(e[t]))});var Jr={5:[.153388,.221461,.250301],7:[.071303,.131514,.189879,.214607],9:[.028532,.067234,.124009,.179044,.20236],11:[.0093,.028002,.065984,.121703,.175713,.198596],13:[.002406,.009255,.027867,.065666,.121117,.174868,.197641],15:[489e-6,.002403,.009246,.02784,.065602,.120999,.174697,.197448]};var dl=["in vec2 vBlurTexCoords[%size%];","uniform sampler2D uTexture;","uniform vec4 uInputClamp;","out vec4 finalColor;","void main(void)","{","    %blur%","}"].join(`
`);function Kn(s){let e=Jr[s],t=e.length,r="",i="finalColor = ",o="    + ",n="texture(uTexture, clamp(vBlurTexCoords[%index%], uInputClamp.xy, uInputClamp.zw)) * %value%";for(let a=0;a<s;a++){let l=a===0?i:o,u=a<t?a:s-a-1,f=n.replace("%index%",a.toString()).replace("%value%",e[u].toString());r+=`${l}${f}
`}return dl.replace("%blur%",`${r};`).replace("%size%",s.toString())}var xl=`
    in vec2 aPosition;

    uniform float uStrength;

    out vec2 vBlurTexCoords[%size%];

    uniform vec4 uInputSize;
    uniform vec4 uOutputFrame;
    uniform vec4 uOutputTexture;

    vec4 filterVertexPosition( void )
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;

    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

    vec2 filterTextureCoord( void )
    {
        return aPosition * (uOutputFrame.zw * uInputSize.zw);
    }

    void main(void)
    {
        gl_Position = filterVertexPosition();

        float pixelStrength = uInputSize.%dimension% * uStrength;

        vec2 textureCoord = filterTextureCoord();
        %blur%
    }`;function Qn(s,e){let t=Math.ceil(s/2),r=xl,i="",o;e?o="vBlurTexCoords[%index%] =  textureCoord + vec2(%sampleIndex% * pixelStrength, 0.0);":o="vBlurTexCoords[%index%] =  textureCoord + vec2(0.0, %sampleIndex% * pixelStrength);";for(let n=0;n<s;n++){let a=o.replace("%index%",n.toString());a=a.replace("%sampleIndex%",`${n-(t-1)}.0`),i+=a,i+=`
`}return r=r.replace("%blur%",i),r=r.replace("%size%",s.toString()),r=r.replace("%dimension%",e?"z":"w"),r}function Zn(s,e){let t=Qn(e,s),r=Kn(e);return me.from({vertex:t,fragment:r,name:`blur-${s?"horizontal":"vertical"}-pass-filter`})}var Jn=`

struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,
};

struct BlurUniforms {
  uStrength:f32,
};

@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler : sampler;

@group(1) @binding(0) var<uniform> blurUniforms : BlurUniforms;


struct VSOutput {
    @builtin(position) position: vec4<f32>,
    %blur-struct%
  };

fn filterVertexPosition(aPosition:vec2<f32>) -> vec4<f32>
{
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;

    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

fn filterTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
    return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
}

fn globalTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
  return  (aPosition.xy / gfu.uGlobalFrame.zw) + (gfu.uGlobalFrame.xy / gfu.uGlobalFrame.zw);
}

fn getSize() -> vec2<f32>
{
  return gfu.uGlobalFrame.zw;
}


@vertex
fn mainVertex(
  @location(0) aPosition : vec2<f32>,
) -> VSOutput {

  let filteredCord = filterTextureCoord(aPosition);

  let pixelStrength = gfu.uInputSize.%dimension% * blurUniforms.uStrength;

  return VSOutput(
   filterVertexPosition(aPosition),
    %blur-vertex-out%
  );
}

@fragment
fn mainFragment(
  @builtin(position) position: vec4<f32>,
  %blur-fragment-in%
) -> @location(0) vec4<f32> {

    var   finalColor = vec4(0.0);

    %blur-sampling%

    return finalColor;
}
`;function es(s,e){let t=Jr[e],r=t.length,i=[],o=[],n=[];for(let p=0;p<e;p++){i[p]=`@location(${p}) offset${p}: vec2<f32>,`,s?o[p]=`filteredCord + vec2(${p-r+1} * pixelStrength, 0.0),`:o[p]=`filteredCord + vec2(0.0, ${p-r+1} * pixelStrength),`;let c=p<r?p:e-p-1,h=t[c].toString();n[p]=`finalColor += textureSample(uTexture, uSampler,
            clamp(offset${p}, gfu.uInputClamp.xy, gfu.uInputClamp.zw)) * ${h};`}let a=i.join(`
`),l=o.join(`
`),u=n.join(`
`),f=Jn.replace("%blur-struct%",a).replace("%blur-vertex-out%",l).replace("%blur-fragment-in%",a).replace("%blur-sampling%",u).replace("%dimension%",s?"z":"w");return he.from({vertex:{source:f,entryPoint:"mainVertex"},fragment:{source:f,entryPoint:"mainFragment"}})}var ts=class rs extends ae{constructor(e){e={...rs.defaultOptions,...e};let t=Zn(e.horizontal,e.kernelSize),r=es(e.horizontal,e.kernelSize);super({glProgram:t,gpuProgram:r,resources:{blurUniforms:{uStrength:{value:0,type:"f32"}}},...e}),this.horizontal=e.horizontal,this.legacy=e.legacy??!1,this._quality=0,this.quality=e.quality,this.blur=e.strength,this._blurUniforms=this.resources.blurUniforms,this._uniforms=this._blurUniforms.uniforms}apply(e,t,r,i){this.legacy?this._applyLegacy(e,t,r,i):this._applyOptimized(e,t,r,i)}_applyLegacy(e,t,r,i){if(this._uniforms.uStrength=this.strength/this.passes,this.passes===1)e.applyFilter(this,t,r,i);else{let o=oe.getSameSizeTexture(t),n=t,a=o;this._state.blend=!1;let l=e.renderer.type===mr.WEBGPU;for(let u=0;u<this.passes-1;u++){e.applyFilter(this,n,a,u===0?!0:l);let f=a;a=n,n=f}this._state.blend=!0,e.applyFilter(this,n,r,i),oe.returnTexture(o)}}_applyOptimized(e,t,r,i){if(this._uniforms.uStrength=this._calculateInitialStrength(),this.passes===1)e.applyFilter(this,t,r,i);else{let o=oe.getSameSizeTexture(t),n=t,a=o;this._state.blend=!1;let l=e.renderer,u=l.type===mr.WEBGPU,f=u?l.renderPipes.uniformBatch:null;for(let p=0;p<this.passes-1;p++){f&&this.groups[1].setResource(f.getUboResource(this._blurUniforms),0),e.applyFilter(this,n,a,u);let c=a;a=n,n=c,this._uniforms.uStrength*=.5}f&&this.groups[1].setResource(f.getUboResource(this._blurUniforms),0),this._state.blend=!0,e.applyFilter(this,n,r,i),oe.returnTexture(o)}}_calculateInitialStrength(){let e=1,t=.5;for(let r=1;r<this.passes;r++)e+=t*t,t*=.5;return this.strength/Math.sqrt(e)}get blur(){return this.strength}set blur(e){this.padding=1+Math.abs(e)*2,this.strength=e}get quality(){return this._quality}set quality(e){this._quality=e,this.passes=e}};ts.defaultOptions={strength:8,quality:4,kernelSize:5,legacy:!1};var ei=ts;var xt=class extends ae{constructor(...e){let t=e[0]??{};typeof t=="number"&&(ce(ct,"BlurFilter constructor params are now options object. See params: { strength, quality, resolution, kernelSize }"),t={strength:t},e[1]!==void 0&&(t.quality=e[1]),e[2]!==void 0&&(t.resolution=e[2]||"inherit"),e[3]!==void 0&&(t.kernelSize=e[3])),t={...ei.defaultOptions,...t};let{strength:r,strengthX:i,strengthY:o,quality:n,...a}=t;super({...a,compatibleRenderers:mr.BOTH,resources:{}}),this._repeatEdgePixels=!1,this.blurXFilter=new ei({horizontal:!0,...t}),this.blurYFilter=new ei({horizontal:!1,...t}),this.quality=n,this.strengthX=i??r,this.strengthY=o??r,this.repeatEdgePixels=!1}apply(e,t,r,i){let o=Math.abs(this.blurXFilter.strength),n=Math.abs(this.blurYFilter.strength);if(o&&n){let a=oe.getSameSizeTexture(t);this.blurXFilter.blendMode="normal",this.blurXFilter.apply(e,t,a,!0),this.blurYFilter.blendMode=this.blendMode,this.blurYFilter.apply(e,a,r,i),oe.returnTexture(a)}else n?(this.blurYFilter.blendMode=this.blendMode,this.blurYFilter.apply(e,t,r,i)):(this.blurXFilter.blendMode=this.blendMode,this.blurXFilter.apply(e,t,r,i))}updatePadding(){this._repeatEdgePixels?this.padding=0:this.padding=Math.max(Math.abs(this.blurXFilter.blur),Math.abs(this.blurYFilter.blur))*2}get strength(){if(this.strengthX!==this.strengthY)throw new Error("BlurFilter's strengthX and strengthY are different");return this.strengthX}set strength(e){this.blurXFilter.blur=this.blurYFilter.blur=e,this.updatePadding()}get quality(){return this.blurXFilter.quality}set quality(e){this.blurXFilter.quality=this.blurYFilter.quality=e}get strengthX(){return this.blurXFilter.blur}set strengthX(e){this.blurXFilter.blur=e,this.updatePadding()}get strengthY(){return this.blurYFilter.blur}set strengthY(e){this.blurYFilter.blur=e,this.updatePadding()}get blur(){return ce("8.3.0","BlurFilter.blur is deprecated, please use BlurFilter.strength instead."),this.strength}set blur(e){ce("8.3.0","BlurFilter.blur is deprecated, please use BlurFilter.strength instead."),this.strength=e}get blurX(){return ce("8.3.0","BlurFilter.blurX is deprecated, please use BlurFilter.strengthX instead."),this.strengthX}set blurX(e){ce("8.3.0","BlurFilter.blurX is deprecated, please use BlurFilter.strengthX instead."),this.strengthX=e}get blurY(){return ce("8.3.0","BlurFilter.blurY is deprecated, please use BlurFilter.strengthY instead."),this.strengthY}set blurY(e){ce("8.3.0","BlurFilter.blurY is deprecated, please use BlurFilter.strengthY instead."),this.strengthY=e}get repeatEdgePixels(){return this._repeatEdgePixels}set repeatEdgePixels(e){this._repeatEdgePixels=e,this.updatePadding()}};xt.defaultOptions={strength:8,quality:4,kernelSize:5,legacy:!1};var is=`
in vec2 vTextureCoord;
in vec4 vColor;

out vec4 finalColor;

uniform float uColorMatrix[20];
uniform float uAlpha;

uniform sampler2D uTexture;

float rand(vec2 co)
{
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

void main()
{
    vec4 color = texture(uTexture, vTextureCoord);
    float randomValue = rand(gl_FragCoord.xy * 0.2);
    float diff = (randomValue - 0.5) *  0.5;

    if (uAlpha == 0.0) {
        finalColor = color;
        return;
    }

    if (color.a > 0.0) {
        color.rgb /= color.a;
    }

    vec4 result;

    result.r = (uColorMatrix[0] * color.r);
        result.r += (uColorMatrix[1] * color.g);
        result.r += (uColorMatrix[2] * color.b);
        result.r += (uColorMatrix[3] * color.a);
        result.r += uColorMatrix[4];

    result.g = (uColorMatrix[5] * color.r);
        result.g += (uColorMatrix[6] * color.g);
        result.g += (uColorMatrix[7] * color.b);
        result.g += (uColorMatrix[8] * color.a);
        result.g += uColorMatrix[9];

    result.b = (uColorMatrix[10] * color.r);
       result.b += (uColorMatrix[11] * color.g);
       result.b += (uColorMatrix[12] * color.b);
       result.b += (uColorMatrix[13] * color.a);
       result.b += uColorMatrix[14];

    result.a = (uColorMatrix[15] * color.r);
       result.a += (uColorMatrix[16] * color.g);
       result.a += (uColorMatrix[17] * color.b);
       result.a += (uColorMatrix[18] * color.a);
       result.a += uColorMatrix[19];

    vec3 rgb = mix(color.rgb, result.rgb, uAlpha);

    // Premultiply alpha again.
    rgb *= result.a;

    finalColor = vec4(rgb, result.a);
}
`;var Li=`struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,
};

struct ColorMatrixUniforms {
  uColorMatrix:array<vec4<f32>, 5>,
  uAlpha:f32,
};


@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler : sampler;
@group(1) @binding(0) var<uniform> colorMatrixUniforms : ColorMatrixUniforms;


struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>,
  };
  
fn filterVertexPosition(aPosition:vec2<f32>) -> vec4<f32>
{
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;

    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

fn filterTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
  return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
}

@vertex
fn mainVertex(
  @location(0) aPosition : vec2<f32>, 
) -> VSOutput {
  return VSOutput(
   filterVertexPosition(aPosition),
   filterTextureCoord(aPosition),
  );
}


@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
) -> @location(0) vec4<f32> {


  var c = textureSample(uTexture, uSampler, uv);
  
  if (colorMatrixUniforms.uAlpha == 0.0) {
    return c;
  }

 
    // Un-premultiply alpha before applying the color matrix. See issue #3539.
    if (c.a > 0.0) {
      c.r /= c.a;
      c.g /= c.a;
      c.b /= c.a;
    }

    var cm = colorMatrixUniforms.uColorMatrix;


    var result = vec4<f32>(0.);

    result.r = (cm[0][0] * c.r);
    result.r += (cm[0][1] * c.g);
    result.r += (cm[0][2] * c.b);
    result.r += (cm[0][3] * c.a);
    result.r += cm[1][0];

    result.g = (cm[1][1] * c.r);
    result.g += (cm[1][2] * c.g);
    result.g += (cm[1][3] * c.b);
    result.g += (cm[2][0] * c.a);
    result.g += cm[2][1];

    result.b = (cm[2][2] * c.r);
    result.b += (cm[2][3] * c.g);
    result.b += (cm[3][0] * c.b);
    result.b += (cm[3][1] * c.a);
    result.b += cm[3][2];

    result.a = (cm[3][3] * c.r);
    result.a += (cm[4][0] * c.g);
    result.a += (cm[4][1] * c.b);
    result.a += (cm[4][2] * c.a);
    result.a += cm[4][3];

    var rgb = mix(c.rgb, result.rgb, colorMatrixUniforms.uAlpha);

    rgb.r *= result.a;
    rgb.g *= result.a;
    rgb.b *= result.a;

    return vec4(rgb, result.a);
}`;var _r=class extends ae{constructor(e={}){let t=new Nt({uColorMatrix:{value:[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0],type:"f32",size:20},uAlpha:{value:1,type:"f32"}}),r=he.from({vertex:{source:Li,entryPoint:"mainVertex"},fragment:{source:Li,entryPoint:"mainFragment"}}),i=me.from({vertex:on,fragment:is,name:"color-matrix-filter"});super({...e,gpuProgram:r,glProgram:i,resources:{colorMatrixUniforms:t}}),this.alpha=1}_loadMatrix(e,t=!1){if(t){let r=[...e];this._multiply(r,this.matrix,e),this.resources.colorMatrixUniforms.uniforms.uColorMatrix=r}else this.resources.colorMatrixUniforms.uniforms.uColorMatrix=e;this.resources.colorMatrixUniforms.update()}_multiply(e,t,r){return e[0]=t[0]*r[0]+t[1]*r[5]+t[2]*r[10]+t[3]*r[15],e[1]=t[0]*r[1]+t[1]*r[6]+t[2]*r[11]+t[3]*r[16],e[2]=t[0]*r[2]+t[1]*r[7]+t[2]*r[12]+t[3]*r[17],e[3]=t[0]*r[3]+t[1]*r[8]+t[2]*r[13]+t[3]*r[18],e[4]=t[0]*r[4]+t[1]*r[9]+t[2]*r[14]+t[3]*r[19]+t[4],e[5]=t[5]*r[0]+t[6]*r[5]+t[7]*r[10]+t[8]*r[15],e[6]=t[5]*r[1]+t[6]*r[6]+t[7]*r[11]+t[8]*r[16],e[7]=t[5]*r[2]+t[6]*r[7]+t[7]*r[12]+t[8]*r[17],e[8]=t[5]*r[3]+t[6]*r[8]+t[7]*r[13]+t[8]*r[18],e[9]=t[5]*r[4]+t[6]*r[9]+t[7]*r[14]+t[8]*r[19]+t[9],e[10]=t[10]*r[0]+t[11]*r[5]+t[12]*r[10]+t[13]*r[15],e[11]=t[10]*r[1]+t[11]*r[6]+t[12]*r[11]+t[13]*r[16],e[12]=t[10]*r[2]+t[11]*r[7]+t[12]*r[12]+t[13]*r[17],e[13]=t[10]*r[3]+t[11]*r[8]+t[12]*r[13]+t[13]*r[18],e[14]=t[10]*r[4]+t[11]*r[9]+t[12]*r[14]+t[13]*r[19]+t[14],e[15]=t[15]*r[0]+t[16]*r[5]+t[17]*r[10]+t[18]*r[15],e[16]=t[15]*r[1]+t[16]*r[6]+t[17]*r[11]+t[18]*r[16],e[17]=t[15]*r[2]+t[16]*r[7]+t[17]*r[12]+t[18]*r[17],e[18]=t[15]*r[3]+t[16]*r[8]+t[17]*r[13]+t[18]*r[18],e[19]=t[15]*r[4]+t[16]*r[9]+t[17]*r[14]+t[18]*r[19]+t[19],e}brightness(e,t){let r=[e,0,0,0,0,0,e,0,0,0,0,0,e,0,0,0,0,0,1,0];this._loadMatrix(r,t)}tint(e,t){let[r,i,o]=Xt.shared.setValue(e).toArray(),n=[r,0,0,0,0,0,i,0,0,0,0,0,o,0,0,0,0,0,1,0];this._loadMatrix(n,t)}greyscale(e,t){let r=[e,e,e,0,0,e,e,e,0,0,e,e,e,0,0,0,0,0,1,0];this._loadMatrix(r,t)}grayscale(e,t){this.greyscale(e,t)}blackAndWhite(e){let t=[.3,.6,.1,0,0,.3,.6,.1,0,0,.3,.6,.1,0,0,0,0,0,1,0];this._loadMatrix(t,e)}hue(e,t){e=(e||0)/180*Math.PI;let r=Math.cos(e),i=Math.sin(e),o=Math.sqrt,n=1/3,a=o(n),l=r+(1-r)*n,u=n*(1-r)-a*i,f=n*(1-r)+a*i,p=n*(1-r)+a*i,c=r+n*(1-r),h=n*(1-r)-a*i,_=n*(1-r)-a*i,m=n*(1-r)+a*i,d=r+n*(1-r),g=[l,u,f,0,0,p,c,h,0,0,_,m,d,0,0,0,0,0,1,0];this._loadMatrix(g,t)}contrast(e,t){let r=(e||0)+1,i=-.5*(r-1),o=[r,0,0,0,i,0,r,0,0,i,0,0,r,0,i,0,0,0,1,0];this._loadMatrix(o,t)}saturate(e=0,t){let r=e*2/3+1,i=(r-1)*-.5,o=[r,i,i,0,0,i,r,i,0,0,i,i,r,0,0,0,0,0,1,0];this._loadMatrix(o,t)}desaturate(){this.saturate(-1)}negative(e){let t=[-1,0,0,1,0,0,-1,0,1,0,0,0,-1,1,0,0,0,0,1,0];this._loadMatrix(t,e)}sepia(e){let t=[.393,.7689999,.18899999,0,0,.349,.6859999,.16799999,0,0,.272,.5339999,.13099999,0,0,0,0,0,1,0];this._loadMatrix(t,e)}technicolor(e){let t=[1.9125277891456083,-.8545344976951645,-.09155508482755585,0,.046249425232852304,-.3087833385928097,1.7658908555458428,-.10601743074722245,0,-.2758903984886823,-.231103377548616,-.7501899197440212,1.847597816108189,0,.12137623870388682,0,0,0,1,0];this._loadMatrix(t,e)}polaroid(e){let t=[1.438,-.062,-.062,0,0,-.122,1.378,-.122,0,0,-.016,-.016,1.483,0,0,0,0,0,1,0];this._loadMatrix(t,e)}toBGR(e){let t=[0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,1,0];this._loadMatrix(t,e)}kodachrome(e){let t=[1.1285582396593525,-.3967382283601348,-.03992559172921793,0,.24991995145868634,-.16404339962244616,1.0835251566291304,-.05498805115633132,0,.09698983488904393,-.16786010706155763,-.5603416277695248,1.6014850761964943,0,.13972481597886063,0,0,0,1,0];this._loadMatrix(t,e)}browni(e){let t=[.5997023498159715,.34553243048391263,-.2708298674538042,0,.1860075629647401,-.037703249837783157,.8609577587992641,.15059552388459913,0,-.14497417640467167,.24113635128153335,-.07441037908422492,.44972182064877153,0,-.029655197167024642,0,0,0,1,0];this._loadMatrix(t,e)}vintage(e){let t=[.6279345635605994,.3202183420819367,-.03965408211312453,0,.037848179746251466,.02578397704808868,.6441188644374771,.03259127616149294,0,.029265996770472907,.0466055556782719,-.0851232987247891,.5241648018700465,0,.020232119953863904,0,0,0,1,0];this._loadMatrix(t,e)}colorTone(e,t,r,i,o){e||(e=.2),t||(t=.15),r||(r=16770432),i||(i=3375104);let n=Xt.shared,[a,l,u]=n.setValue(r).toArray(),[f,p,c]=n.setValue(i).toArray(),h=[.3,.59,.11,0,0,a,l,u,e,0,f,p,c,t,0,a-f,l-p,u-c,0,0];this._loadMatrix(h,o)}night(e,t){e||(e=.1);let r=[e*-2,-e,0,0,0,-e,0,e,0,0,0,e,e*2,0,0,0,0,0,1,0];this._loadMatrix(r,t)}predator(e,t){let r=[11.224130630493164*e,-4.794486999511719*e,-2.8746118545532227*e,0*e,.40342438220977783*e,-3.6330697536468506*e,9.193157196044922*e,-2.951810836791992*e,0*e,-1.316135048866272*e,-3.2184197902679443*e,-4.2375030517578125*e,7.476448059082031*e,0*e,.8044459223747253*e,0,0,0,1,0];this._loadMatrix(r,t)}lsd(e){let t=[2,-.4,.5,0,0,-.5,2,-.4,0,0,-.4,-.5,3,0,0,0,0,0,1,0];this._loadMatrix(t,e)}reset(){let e=[1,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,1,0];this._loadMatrix(e,!1)}get matrix(){return this.resources.colorMatrixUniforms.uniforms.uColorMatrix}set matrix(e){this.resources.colorMatrixUniforms.uniforms.uColorMatrix=e}get alpha(){return this.resources.colorMatrixUniforms.uniforms.uAlpha}set alpha(e){this.resources.colorMatrixUniforms.uniforms.uAlpha=e}};var os=`
in vec2 vTextureCoord;
in vec2 vFilterUv;

out vec4 finalColor;

uniform sampler2D uTexture;
uniform sampler2D uMapTexture;

uniform vec4 uInputClamp;
uniform highp vec4 uInputSize;
uniform mat2 uRotation;
uniform vec2 uScale;

void main()
{
    vec4 map = texture(uMapTexture, vFilterUv);
    
    vec2 offset = uInputSize.zw * (uRotation * (map.xy - 0.5)) * uScale; 

    finalColor = texture(uTexture, clamp(vTextureCoord + offset, uInputClamp.xy, uInputClamp.zw));
}
`;var ns=`in vec2 aPosition;
out vec2 vTextureCoord;
out vec2 vFilterUv;


uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

uniform mat3 uFilterMatrix;

vec4 filterVertexPosition( void )
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

vec2 getFilterCoord( void )
{
  return ( uFilterMatrix * vec3( filterTextureCoord(), 1.0)  ).xy;
}


void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
    vFilterUv = getFilterCoord();
}
`;var Vi=`
struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,
};

struct DisplacementUniforms {
  uFilterMatrix:mat3x3<f32>,
  uScale:vec2<f32>,
  uRotation:mat2x2<f32>
};



@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;
@group(0) @binding(1) var uTexture: texture_2d<f32>;
@group(0) @binding(2) var uSampler : sampler;

@group(1) @binding(0) var<uniform> filterUniforms : DisplacementUniforms;
@group(1) @binding(1) var uMapTexture: texture_2d<f32>;
@group(1) @binding(2) var uMapSampler : sampler;

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>,
    @location(1) filterUv : vec2<f32>,
  };

fn filterVertexPosition(aPosition:vec2<f32>) -> vec4<f32>
{
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;

    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

fn filterTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
    return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
}

fn globalTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
  return  (aPosition.xy / gfu.uGlobalFrame.zw) + (gfu.uGlobalFrame.xy / gfu.uGlobalFrame.zw);  
}

fn getFilterCoord(aPosition:vec2<f32> ) -> vec2<f32>
{
  return ( filterUniforms.uFilterMatrix * vec3( filterTextureCoord(aPosition), 1.0)  ).xy;
}

fn getSize() -> vec2<f32>
{

  
  return gfu.uGlobalFrame.zw;
}
  
@vertex
fn mainVertex(
  @location(0) aPosition : vec2<f32>, 
) -> VSOutput {
  return VSOutput(
   filterVertexPosition(aPosition),
   filterTextureCoord(aPosition),
   getFilterCoord(aPosition)
  );
}

@fragment
fn mainFragment(
  @location(0) uv: vec2<f32>,
  @location(1) filterUv: vec2<f32>,
  @builtin(position) position: vec4<f32>
) -> @location(0) vec4<f32> {

    var map = textureSample(uMapTexture, uMapSampler, filterUv);

    var offset =  gfu.uInputSize.zw * (filterUniforms.uRotation * (map.xy - 0.5)) * filterUniforms.uScale; 
   
    return textureSample(uTexture, uSampler, clamp(uv + offset, gfu.uInputClamp.xy, gfu.uInputClamp.zw));
}`;var gr=class extends ae{constructor(...e){let t=e[0];t instanceof be&&(e[1]&&ce(ct,"DisplacementFilter now uses options object instead of params. {sprite, scale}"),t={sprite:t,scale:e[1]});let{sprite:r,scale:i,...o}=t,n=i??20;typeof n=="number"&&(n=new Qo(n,n));let a=new Nt({uFilterMatrix:{value:new Zo,type:"mat3x3<f32>"},uScale:{value:n,type:"vec2<f32>"},uRotation:{value:new Float32Array([0,0,0,0]),type:"mat2x2<f32>"}}),l=me.from({vertex:ns,fragment:os,name:"displacement-filter"}),u=he.from({vertex:{source:Vi,entryPoint:"mainVertex"},fragment:{source:Vi,entryPoint:"mainFragment"}}),f=r.texture.source;super({...o,gpuProgram:u,glProgram:l,resources:{filterUniforms:a,uMapTexture:f,uMapSampler:f.style}}),this._sprite=t.sprite,this._sprite.renderable=!1}apply(e,t,r,i){let o=this.resources.filterUniforms.uniforms;e.calculateSpriteMatrix(o.uFilterMatrix,this._sprite);let n=this._sprite.worldTransform,a=Math.sqrt(n.a*n.a+n.b*n.b),l=Math.sqrt(n.c*n.c+n.d*n.d);a!==0&&l!==0&&(o.uRotation[0]=n.a/a,o.uRotation[1]=n.b/a,o.uRotation[2]=n.c/l,o.uRotation[3]=n.d/l),this.resources.uMapTexture=this._sprite.texture.source,e.applyFilter(this,t,r,i)}get scale(){return this.resources.filterUniforms.uniforms.uScale}};Fe.add(Sn,wn);var it=`in vec2 aPosition;
out vec2 vTextureCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

vec4 filterVertexPosition( void )
{
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    
    position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord( void )
{
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

void main(void)
{
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
}
`;var ot=`struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,
};

@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;

struct VSOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) uv : vec2<f32>
  };

fn filterVertexPosition(aPosition:vec2<f32>) -> vec4<f32>
{
    var position = aPosition * gfu.uOutputFrame.zw + gfu.uOutputFrame.xy;

    position.x = position.x * (2.0 / gfu.uOutputTexture.x) - 1.0;
    position.y = position.y * (2.0*gfu.uOutputTexture.z / gfu.uOutputTexture.y) - gfu.uOutputTexture.z;

    return vec4(position, 0.0, 1.0);
}

fn filterTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
    return aPosition * (gfu.uOutputFrame.zw * gfu.uInputSize.zw);
}

fn globalTextureCoord( aPosition:vec2<f32> ) -> vec2<f32>
{
  return  (aPosition.xy / gfu.uGlobalFrame.zw) + (gfu.uGlobalFrame.xy / gfu.uGlobalFrame.zw);  
}

fn getSize() -> vec2<f32>
{
  return gfu.uGlobalFrame.zw;
}
  
@vertex
fn mainVertex(
  @location(0) aPosition : vec2<f32>, 
) -> VSOutput {
  return VSOutput(
   filterVertexPosition(aPosition),
   filterTextureCoord(aPosition)
  );
}`;var ss=`
in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform vec2 uOffset;

void main(void)
{
    vec4 color = vec4(0.0);

    // Sample top left pixel
    color += texture(uTexture, vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y + uOffset.y));

    // Sample top right pixel
    color += texture(uTexture, vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y + uOffset.y));

    // Sample bottom right pixel
    color += texture(uTexture, vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y - uOffset.y));

    // Sample bottom left pixel
    color += texture(uTexture, vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y - uOffset.y));

    // Average
    color *= 0.25;

    finalColor = color;
}`;var as=`struct KawaseBlurUniforms {
  uOffset:vec2<f32>,
};

@group(0) @binding(1) var uTexture: texture_2d<f32>; 
@group(0) @binding(2) var uSampler: sampler;
@group(1) @binding(0) var<uniform> kawaseBlurUniforms : KawaseBlurUniforms;

@fragment
fn mainFragment(
  @builtin(position) position: vec4<f32>,
  @location(0) uv : vec2<f32>
) -> @location(0) vec4<f32> {
  let uOffset = kawaseBlurUniforms.uOffset;
  var color: vec4<f32> = vec4<f32>(0.0);

  // Sample top left pixel
  color += textureSample(uTexture, uSampler, vec2<f32>(uv.x - uOffset.x, uv.y + uOffset.y));
  // Sample top right pixel
  color += textureSample(uTexture, uSampler, vec2<f32>(uv.x + uOffset.x, uv.y + uOffset.y));
  // Sample bottom right pixel
  color += textureSample(uTexture, uSampler, vec2<f32>(uv.x + uOffset.x, uv.y - uOffset.y));
  // Sample bottom left pixel
  color += textureSample(uTexture, uSampler, vec2<f32>(uv.x - uOffset.x, uv.y - uOffset.y));
  // Average
  color *= 0.25;

  return color;
}`;var ls=`
precision highp float;
in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform vec2 uOffset;

uniform vec4 uInputClamp;

void main(void)
{
    vec4 color = vec4(0.0);

    // Sample top left pixel
    color += texture(uTexture, clamp(vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y + uOffset.y), uInputClamp.xy, uInputClamp.zw));

    // Sample top right pixel
    color += texture(uTexture, clamp(vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y + uOffset.y), uInputClamp.xy, uInputClamp.zw));

    // Sample bottom right pixel
    color += texture(uTexture, clamp(vec2(vTextureCoord.x + uOffset.x, vTextureCoord.y - uOffset.y), uInputClamp.xy, uInputClamp.zw));

    // Sample bottom left pixel
    color += texture(uTexture, clamp(vec2(vTextureCoord.x - uOffset.x, vTextureCoord.y - uOffset.y), uInputClamp.xy, uInputClamp.zw));

    // Average
    color *= 0.25;

    finalColor = color;
}
`;var us=`struct KawaseBlurUniforms {
  uOffset:vec2<f32>,
};

struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,
};

@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;

@group(0) @binding(1) var uTexture: texture_2d<f32>; 
@group(0) @binding(2) var uSampler: sampler;
@group(1) @binding(0) var<uniform> kawaseBlurUniforms : KawaseBlurUniforms;

@fragment
fn mainFragment(
  @builtin(position) position: vec4<f32>,
  @location(0) uv : vec2<f32>
) -> @location(0) vec4<f32> {
  let uOffset = kawaseBlurUniforms.uOffset;
  var color: vec4<f32> = vec4(0.0);

  // Sample top left pixel
  color += textureSample(uTexture, uSampler, clamp(vec2<f32>(uv.x - uOffset.x, uv.y + uOffset.y), gfu.uInputClamp.xy, gfu.uInputClamp.zw));
  // Sample top right pixel
  color += textureSample(uTexture, uSampler, clamp(vec2<f32>(uv.x + uOffset.x, uv.y + uOffset.y), gfu.uInputClamp.xy, gfu.uInputClamp.zw));
  // Sample bottom right pixel
  color += textureSample(uTexture, uSampler, clamp(vec2<f32>(uv.x + uOffset.x, uv.y - uOffset.y), gfu.uInputClamp.xy, gfu.uInputClamp.zw));
  // Sample bottom left pixel
  color += textureSample(uTexture, uSampler, clamp(vec2<f32>(uv.x - uOffset.x, uv.y - uOffset.y), gfu.uInputClamp.xy, gfu.uInputClamp.zw));
  // Average
  color *= 0.25;
    
  return color;
}`;var _l=Object.defineProperty,gl=(s,e,t)=>e in s?_l(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t,Bt=(s,e,t)=>(gl(s,typeof e!="symbol"?e+"":e,t),t),fs=class ps extends ae{constructor(...e){let t=e[0]??{};(typeof t=="number"||Array.isArray(t))&&(ce("6.0.0","KawaseBlurFilter constructor params are now options object. See params: { strength, quality, clamp, pixelSize }"),t={strength:t},e[1]!==void 0&&(t.quality=e[1]),e[2]!==void 0&&(t.clamp=e[2])),t={...ps.DEFAULT_OPTIONS,...t};let r=he.from({vertex:{source:ot,entryPoint:"mainVertex"},fragment:{source:t?.clamp?us:as,entryPoint:"mainFragment"}}),i=me.from({vertex:it,fragment:t?.clamp?ls:ss,name:"kawase-blur-filter"});super({gpuProgram:r,glProgram:i,resources:{kawaseBlurUniforms:{uOffset:{value:new Float32Array(2),type:"vec2<f32>"}}}}),Bt(this,"uniforms"),Bt(this,"_pixelSize",{x:0,y:0}),Bt(this,"_clamp"),Bt(this,"_kernels",[]),Bt(this,"_blur"),Bt(this,"_quality"),this.uniforms=this.resources.kawaseBlurUniforms.uniforms,this.pixelSize=t.pixelSize??{x:1,y:1},Array.isArray(t.strength)?this.kernels=t.strength:typeof t.strength=="number"&&(this._blur=t.strength,this.quality=t.quality??3),this._clamp=!!t.clamp}apply(e,t,r,i){let o=this.pixelSizeX/t.source.width,n=this.pixelSizeY/t.source.height,a;if(this._quality===1||this._blur===0)a=this._kernels[0]+.5,this.uniforms.uOffset[0]=a*o,this.uniforms.uOffset[1]=a*n,e.applyFilter(this,t,r,i);else{let l=oe.getSameSizeTexture(t),u=t,f=l,p,c=this._quality-1;for(let h=0;h<c;h++)a=this._kernels[h]+.5,this.uniforms.uOffset[0]=a*o,this.uniforms.uOffset[1]=a*n,e.applyFilter(this,u,f,!0),p=u,u=f,f=p;a=this._kernels[c]+.5,this.uniforms.uOffset[0]=a*o,this.uniforms.uOffset[1]=a*n,e.applyFilter(this,u,r,i),oe.returnTexture(l)}}get strength(){return this._blur}set strength(e){this._blur=e,this._generateKernels()}get quality(){return this._quality}set quality(e){this._quality=Math.max(1,Math.round(e)),this._generateKernels()}get kernels(){return this._kernels}set kernels(e){Array.isArray(e)&&e.length>0?(this._kernels=e,this._quality=e.length,this._blur=Math.max(...e)):(this._kernels=[0],this._quality=1)}get pixelSize(){return this._pixelSize}set pixelSize(e){if(typeof e=="number"){this.pixelSizeX=this.pixelSizeY=e;return}if(Array.isArray(e)){this.pixelSizeX=e[0],this.pixelSizeY=e[1];return}this._pixelSize=e}get pixelSizeX(){return this.pixelSize.x}set pixelSizeX(e){this.pixelSize.x=e}get pixelSizeY(){return this.pixelSize.y}set pixelSizeY(e){this.pixelSize.y=e}get clamp(){return this._clamp}_updatePadding(){this.padding=Math.ceil(this._kernels.reduce((e,t)=>e+t+.5,0))}_generateKernels(){let e=this._blur,t=this._quality,r=[e];if(e>0){let i=e,o=e/t;for(let n=1;n<t;n++)i-=o,r.push(i)}this._kernels=r,this._updatePadding()}};Bt(fs,"DEFAULT_OPTIONS",{strength:4,quality:3,clamp:!1,pixelSize:{x:1,y:1}});var ti=fs;var cs=`in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform sampler2D uMapTexture;
uniform float uBloomScale;
uniform float uBrightness;

void main() {
    vec4 color = texture(uTexture, vTextureCoord);
    color.rgb *= uBrightness;
    vec4 bloomColor = vec4(texture(uMapTexture, vTextureCoord).rgb, 0.0);
    bloomColor.rgb *= uBloomScale;
    finalColor = color + bloomColor;
}
`;var ms=`struct AdvancedBloomUniforms {
  uBloomScale: f32,
  uBrightness: f32,
};

@group(0) @binding(1) var uTexture: texture_2d<f32>; 
@group(0) @binding(2) var uSampler: sampler;
@group(1) @binding(0) var<uniform> advancedBloomUniforms : AdvancedBloomUniforms;
@group(1) @binding(1) var uMapTexture: texture_2d<f32>;

@fragment
fn mainFragment(
  @builtin(position) position: vec4<f32>,
  @location(0) uv : vec2<f32>
) -> @location(0) vec4<f32> {
  var color = textureSample(uTexture, uSampler, uv);
  color = vec4<f32>(color.rgb * advancedBloomUniforms.uBrightness, color.a);

  var bloomColor = vec4<f32>(textureSample(uMapTexture, uSampler, uv).rgb, 0.0);
  bloomColor = vec4<f32>(bloomColor.rgb * advancedBloomUniforms.uBloomScale, bloomColor.a);
  
  return color + bloomColor;
}
`;var hs=`
in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform float uThreshold;

void main() {
    vec4 color = texture(uTexture, vTextureCoord);

    // A simple & fast algorithm for getting brightness.
    // It's inaccuracy , but good enought for this feature.
    float _max = max(max(color.r, color.g), color.b);
    float _min = min(min(color.r, color.g), color.b);
    float brightness = (_max + _min) * 0.5;

    if(brightness > uThreshold) {
        finalColor = color;
    } else {
        finalColor = vec4(0.0, 0.0, 0.0, 0.0);
    }
}
`;var ds=`struct ExtractBrightnessUniforms {
  uThreshold: f32,
};

@group(0) @binding(1) var uTexture: texture_2d<f32>; 
@group(0) @binding(2) var uSampler: sampler;
@group(1) @binding(0) var<uniform> extractBrightnessUniforms : ExtractBrightnessUniforms;

@fragment
fn mainFragment(
  @builtin(position) position: vec4<f32>,
  @location(0) uv : vec2<f32>
) -> @location(0) vec4<f32> {
  let color: vec4<f32> = textureSample(uTexture, uSampler, uv);

  // A simple & fast algorithm for getting brightness.
  // It's inaccurate, but good enough for this feature.
  let max: f32 = max(max(color.r, color.g), color.b);
  let min: f32 = min(min(color.r, color.g), color.b);
  let brightness: f32 = (max + min) * 0.5;

  return select(vec4<f32>(0.), color, brightness > extractBrightnessUniforms.uThreshold);
}
`;var yl=Object.defineProperty,vl=(s,e,t)=>e in s?yl(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t,xs=(s,e,t)=>(vl(s,typeof e!="symbol"?e+"":e,t),t),_s=class gs extends ae{constructor(e){e={...gs.DEFAULT_OPTIONS,...e};let t=he.from({vertex:{source:ot,entryPoint:"mainVertex"},fragment:{source:ds,entryPoint:"mainFragment"}}),r=me.from({vertex:it,fragment:hs,name:"extract-brightness-filter"});super({gpuProgram:t,glProgram:r,resources:{extractBrightnessUniforms:{uThreshold:{value:e.threshold,type:"f32"}}}}),xs(this,"uniforms"),this.uniforms=this.resources.extractBrightnessUniforms.uniforms}get threshold(){return this.uniforms.uThreshold}set threshold(e){this.uniforms.uThreshold=e}};xs(_s,"DEFAULT_OPTIONS",{threshold:.5});var ys=_s;var bl=Object.defineProperty,Tl=(s,e,t)=>e in s?bl(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t,Qt=(s,e,t)=>(Tl(s,typeof e!="symbol"?e+"":e,t),t),vs=class bs extends ae{constructor(e){e={...bs.DEFAULT_OPTIONS,...e};let t=he.from({vertex:{source:ot,entryPoint:"mainVertex"},fragment:{source:ms,entryPoint:"mainFragment"}}),r=me.from({vertex:it,fragment:cs,name:"advanced-bloom-filter"});super({gpuProgram:t,glProgram:r,resources:{advancedBloomUniforms:{uBloomScale:{value:e.bloomScale,type:"f32"},uBrightness:{value:e.brightness,type:"f32"}},uMapTexture:Ot.WHITE}}),Qt(this,"uniforms"),Qt(this,"bloomScale",1),Qt(this,"brightness",1),Qt(this,"_extractFilter"),Qt(this,"_blurFilter"),this.uniforms=this.resources.advancedBloomUniforms.uniforms,this._extractFilter=new ys({threshold:e.threshold}),this._blurFilter=new ti({strength:e.kernels??e.blur,quality:e.kernels?void 0:e.quality}),Object.assign(this,e)}apply(e,t,r,i){let o=oe.getSameSizeTexture(t);this._extractFilter.apply(e,t,o,!0);let n=oe.getSameSizeTexture(t);this._blurFilter.apply(e,o,n,!0),this.uniforms.uBloomScale=this.bloomScale,this.uniforms.uBrightness=this.brightness,this.resources.uMapTexture=n.source,e.applyFilter(this,t,r,i),oe.returnTexture(n),oe.returnTexture(o)}get threshold(){return this._extractFilter.threshold}set threshold(e){this._extractFilter.threshold=e}get kernels(){return this._blurFilter.kernels}set kernels(e){this._blurFilter.kernels=e}get blur(){return this._blurFilter.strength}set blur(e){this._blurFilter.strength=e}get quality(){return this._blurFilter.quality}set quality(e){this._blurFilter.quality=e}get pixelSize(){return this._blurFilter.pixelSize}set pixelSize(e){typeof e=="number"&&(e={x:e,y:e}),Array.isArray(e)&&(e={x:e[0],y:e[1]}),this._blurFilter.pixelSize=e}get pixelSizeX(){return this._blurFilter.pixelSizeX}set pixelSizeX(e){this._blurFilter.pixelSizeX=e}get pixelSizeY(){return this._blurFilter.pixelSizeY}set pixelSizeY(e){this._blurFilter.pixelSizeY=e}};Qt(vs,"DEFAULT_OPTIONS",{threshold:.5,bloomScale:1,brightness:1,blur:8,quality:4,pixelSize:{x:1,y:1}});var Wi=vs;var Ts=`precision highp float;
in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform float uAlpha;
uniform vec3 uColor;
uniform vec2 uOffset;

uniform vec4 uInputSize;

void main(void){
    vec4 sample = texture(uTexture, vTextureCoord - uOffset * uInputSize.zw);

    // Premultiply alpha
    sample.rgb = uColor.rgb * sample.a;

    // alpha user alpha
    sample *= uAlpha;

    finalColor = sample;
}`;var Ss=`struct DropShadowUniforms {
  uAlpha: f32,
  uColor: vec3<f32>,
  uOffset: vec2<f32>,
};

struct GlobalFilterUniforms {
  uInputSize:vec4<f32>,
  uInputPixel:vec4<f32>,
  uInputClamp:vec4<f32>,
  uOutputFrame:vec4<f32>,
  uGlobalFrame:vec4<f32>,
  uOutputTexture:vec4<f32>,
};

@group(0) @binding(0) var<uniform> gfu: GlobalFilterUniforms;

@group(0) @binding(1) var uTexture: texture_2d<f32>; 
@group(0) @binding(2) var uSampler: sampler;
@group(1) @binding(0) var<uniform> dropShadowUniforms : DropShadowUniforms;

@fragment
fn mainFragment(
  @builtin(position) position: vec4<f32>,
  @location(0) uv : vec2<f32>
) -> @location(0) vec4<f32> {
  var color: vec4<f32> = textureSample(uTexture, uSampler, uv - dropShadowUniforms.uOffset * gfu.uInputSize.zw);

  // Premultiply alpha
  color = vec4<f32>(vec3<f32>(dropShadowUniforms.uColor.rgb * color.a), color.a);
  // alpha user alpha
  color *= dropShadowUniforms.uAlpha;

  return color;
}`;var Sl=Object.defineProperty,wl=(s,e,t)=>e in s?Sl(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t,Zt=(s,e,t)=>(wl(s,typeof e!="symbol"?e+"":e,t),t),ws=class Ps extends ae{constructor(e){e={...Ps.DEFAULT_OPTIONS,...e};let t=he.from({vertex:{source:ot,entryPoint:"mainVertex"},fragment:{source:Ss,entryPoint:"mainFragment"}}),r=me.from({vertex:it,fragment:Ts,name:"drop-shadow-filter"});super({gpuProgram:t,glProgram:r,resources:{dropShadowUniforms:{uAlpha:{value:e.alpha,type:"f32"},uColor:{value:new Float32Array(3),type:"vec3<f32>"},uOffset:{value:e.offset,type:"vec2<f32>"}}},resolution:e.resolution}),Zt(this,"uniforms"),Zt(this,"shadowOnly",!1),Zt(this,"_color"),Zt(this,"_blurFilter"),Zt(this,"_basePass"),this.uniforms=this.resources.dropShadowUniforms.uniforms,this._color=new Xt,this.color=e.color??0,this._blurFilter=new ti({strength:e.kernels??e.blur,quality:e.kernels?void 0:e.quality}),this._basePass=new ae({gpuProgram:he.from({vertex:{source:ot,entryPoint:"mainVertex"},fragment:{source:`
                    @group(0) @binding(1) var uTexture: texture_2d<f32>; 
                    @group(0) @binding(2) var uSampler: sampler;
                    @fragment
                    fn mainFragment(
                        @builtin(position) position: vec4<f32>,
                        @location(0) uv : vec2<f32>
                    ) -> @location(0) vec4<f32> {
                        return textureSample(uTexture, uSampler, uv);
                    }
                    `,entryPoint:"mainFragment"}}),glProgram:me.from({vertex:it,fragment:`
                in vec2 vTextureCoord;
                out vec4 finalColor;
                uniform sampler2D uTexture;

                void main(void){
                    finalColor = texture(uTexture, vTextureCoord);
                }
                `,name:"drop-shadow-filter"}),resources:{}}),Object.assign(this,e)}apply(e,t,r,i){let o=oe.getSameSizeTexture(t);e.applyFilter(this,t,o,!0),this._blurFilter.apply(e,o,r,i),this.shadowOnly||e.applyFilter(this._basePass,t,r,!1),oe.returnTexture(o)}get offset(){return this.uniforms.uOffset}set offset(e){this.uniforms.uOffset=e,this._updatePadding()}get offsetX(){return this.offset.x}set offsetX(e){this.offset.x=e,this._updatePadding()}get offsetY(){return this.offset.y}set offsetY(e){this.offset.y=e,this._updatePadding()}get color(){return this._color.value}set color(e){this._color.setValue(e);let[t,r,i]=this._color.toArray();this.uniforms.uColor[0]=t,this.uniforms.uColor[1]=r,this.uniforms.uColor[2]=i}get alpha(){return this.uniforms.uAlpha}set alpha(e){this.uniforms.uAlpha=e}get blur(){return this._blurFilter.strength}set blur(e){this._blurFilter.strength=e,this._updatePadding()}get quality(){return this._blurFilter.quality}set quality(e){this._blurFilter.quality=e,this._updatePadding()}get kernels(){return this._blurFilter.kernels}set kernels(e){this._blurFilter.kernels=e}get pixelSize(){return this._blurFilter.pixelSize}set pixelSize(e){typeof e=="number"&&(e={x:e,y:e}),Array.isArray(e)&&(e={x:e[0],y:e[1]}),this._blurFilter.pixelSize=e}get pixelSizeX(){return this._blurFilter.pixelSizeX}set pixelSizeX(e){this._blurFilter.pixelSizeX=e}get pixelSizeY(){return this._blurFilter.pixelSizeY}set pixelSizeY(e){this._blurFilter.pixelSizeY=e}_updatePadding(){let e=Math.max(Math.abs(this.offsetX),Math.abs(this.offsetY));this.padding=e+this.blur*2+this.quality*4}};Zt(ws,"DEFAULT_OPTIONS",{offset:{x:4,y:4},color:0,alpha:.5,shadowOnly:!1,kernels:void 0,blur:2,quality:3,pixelSize:{x:1,y:1},resolution:1});var Ni=ws;function nt(s){if(s===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return s}function Rs(s,e){s.prototype=Object.create(e.prototype),s.prototype.constructor=s,s.__proto__=e}var ke={autoSleep:120,force3D:"auto",nullTargetWarn:1,units:{lineHeight:""}},wr={duration:.5,overwrite:!1,delay:0},no,ue,j,qe=1e8,V=1/qe,Qi=Math.PI*2,Pl=Qi/4,Al=0,zs=Math.sqrt,Cl=Math.cos,Fl=Math.sin,ne=function(e){return typeof e=="string"},J=function(e){return typeof e=="function"},at=function(e){return typeof e=="number"},mi=function(e){return typeof e>"u"},et=function(e){return typeof e=="object"},Be=function(e){return e!==!1},so=function(){return typeof window<"u"},ri=function(e){return J(e)||ne(e)},Is=typeof ArrayBuffer=="function"&&ArrayBuffer.isView||function(){},_e=Array.isArray,Ol=/random\([^)]+\)/g,Ml=/,\s*/g,As=/(?:-?\.?\d|\.)+/gi,ao=/[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g,zt=/[-+=.]*\d+[.e-]*\d*[a-z%]*/g,Xi=/[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi,lo=/[+-]=-?[.\d]+/,Bl=/[^,'"\[\]\s]+/gi,kl=/^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i,Q,Ze,Zi,uo,Ue={},si={},Us,Gs=function(e){return(si=er(e,Ue))&&ge},hi=function(e,t){return console.warn("Invalid property",e,"set to",t,"Missing plugin? gsap.registerPlugin()")},Pr=function(e,t){return!t&&console.warn(e)},Ds=function(e,t){return e&&(Ue[e]=t)&&si&&(si[e]=t)||Ue},Ar=function(){return 0},El={suppressEvents:!0,isStart:!0,kill:!1},ii={suppressEvents:!0,kill:!1},Rl={suppressEvents:!0},fo={},gt=[],Ji={},Ls,Oe={},qi={},Cs=30,oi=[],po="",co=function(e){var t=e[0],r,i;if(et(t)||J(t)||(e=[e]),!(r=(t._gsap||{}).harness)){for(i=oi.length;i--&&!oi[i].targetTest(t););r=oi[i]}for(i=e.length;i--;)e[i]&&(e[i]._gsap||(e[i]._gsap=new _o(e[i],r)))||e.splice(i,1);return e},yt=function(e){return e._gsap||co(Ye(e))[0]._gsap},mo=function(e,t,r){return(r=e[t])&&J(r)?e[t]():mi(r)&&e.getAttribute&&e.getAttribute(t)||r},Se=function(e,t){return(e=e.split(",")).forEach(t)||e},ee=function(e){return Math.round(e*1e5)/1e5||0},K=function(e){return Math.round(e*1e7)/1e7||0},It=function(e,t){var r=t.charAt(0),i=parseFloat(t.substr(2));return e=parseFloat(e),r==="+"?e+i:r==="-"?e-i:r==="*"?e*i:e/i},zl=function(e,t){for(var r=t.length,i=0;e.indexOf(t[i])<0&&++i<r;);return i<r},ai=function(){var e=gt.length,t=gt.slice(0),r,i;for(Ji={},gt.length=0,r=0;r<e;r++)i=t[r],i&&i._lazy&&(i.render(i._lazy[0],i._lazy[1],!0)._lazy=0)},ho=function(e){return!!(e._initted||e._startAt||e.add)},Vs=function(e,t,r,i){gt.length&&!ue&&ai(),e.render(t,r,i||!!(ue&&t<0&&ho(e))),gt.length&&!ue&&ai()},Ws=function(e){var t=parseFloat(e);return(t||t===0)&&(e+"").match(Bl).length<2?t:ne(e)?e.trim():e},Ns=function(e){return e},Ge=function(e,t){for(var r in t)r in e||(e[r]=t[r]);return e},Il=function(e){return function(t,r){for(var i in r)i in t||i==="duration"&&e||i==="ease"||(t[i]=r[i])}},er=function(e,t){for(var r in t)e[r]=t[r];return e},Fs=function s(e,t){for(var r in t)r!=="__proto__"&&r!=="constructor"&&r!=="prototype"&&(e[r]=et(t[r])?s(e[r]||(e[r]={}),t[r]):t[r]);return e},li=function(e,t){var r={},i;for(i in e)i in t||(r[i]=e[i]);return r},br=function(e){var t=e.parent||Q,r=e.keyframes?Il(_e(e.keyframes)):Ge;if(Be(e.inherit))for(;t;)r(e,t.vars.defaults),t=t.parent||t._dp;return e},Ul=function(e,t){for(var r=e.length,i=r===t.length;i&&r--&&e[r]===t[r];);return r<0},Xs=function(e,t,r,i,o){r===void 0&&(r="_first"),i===void 0&&(i="_last");var n=e[i],a;if(o)for(a=t[o];n&&n[o]>a;)n=n._prev;return n?(t._next=n._next,n._next=t):(t._next=e[r],e[r]=t),t._next?t._next._prev=t:e[i]=t,t._prev=n,t.parent=t._dp=e,t},di=function(e,t,r,i){r===void 0&&(r="_first"),i===void 0&&(i="_last");var o=t._prev,n=t._next;o?o._next=n:e[r]===t&&(e[r]=n),n?n._prev=o:e[i]===t&&(e[i]=o),t._next=t._prev=t.parent=null},vt=function(e,t){e.parent&&(!t||e.parent.autoRemoveChildren)&&e.parent.remove&&e.parent.remove(e),e._act=0},kt=function(e,t){if(e&&(!t||t._end>e._dur||t._start<0))for(var r=e;r;)r._dirty=1,r=r.parent;return e},Gl=function(e){for(var t=e.parent;t&&t.parent;)t._dirty=1,t.totalDuration(),t=t.parent;return e},eo=function(e,t,r,i){return e._startAt&&(ue?e._startAt.revert(ii):e.vars.immediateRender&&!e.vars.autoRevert||e._startAt.render(t,!0,i))},Dl=function s(e){return!e||e._ts&&s(e.parent)},Os=function(e){return e._repeat?tr(e._tTime,e=e.duration()+e._rDelay)*e:0},tr=function(e,t){var r=Math.floor(e=K(e/t));return e&&r===e?r-1:r},ui=function(e,t){return(e-t._start)*t._ts+(t._ts>=0?0:t._dirty?t.totalDuration():t._tDur)},xi=function(e){return e._end=K(e._start+(e._tDur/Math.abs(e._ts||e._rts||V)||0))},_i=function(e,t){var r=e._dp;return r&&r.smoothChildTiming&&e._ts&&(e._start=K(r._time-(e._ts>0?t/e._ts:((e._dirty?e.totalDuration():e._tDur)-t)/-e._ts)),xi(e),r._dirty||kt(r,e)),e},qs=function(e,t){var r;if((t._time||!t._dur&&t._initted||t._start<e._time&&(t._dur||!t.add))&&(r=ui(e.rawTime(),t),(!t._dur||Mr(0,t.totalDuration(),r)-t._tTime>V)&&t.render(r,!0)),kt(e,t)._dp&&e._initted&&e._time>=e._dur&&e._ts){if(e._dur<e.duration())for(r=e;r._dp;)r.rawTime()>=0&&r.totalTime(r._tTime),r=r._dp;e._zTime=-V}},Je=function(e,t,r,i){return t.parent&&vt(t),t._start=K((at(r)?r:!r&&fi(t)&&(!e._last||e._last._start>=e._time)?e._last?e._last._start:e._time:r||e!==Q?Xe(e,r,t):e._time)+t._delay),t._end=K(t._start+(t.totalDuration()/Math.abs(t.timeScale())||0)),Xs(e,t,"_first","_last",e._sort?"_start":0),fi(t)||(e._recent=t),i||qs(e,t),e._ts<0&&_i(e,e._tTime),e},Ys=function(e,t){return(Ue.ScrollTrigger||hi("scrollTrigger",t))&&Ue.ScrollTrigger.create(t,e)},js=function(e,t,r,i,o){if(vo(e,t,o),!e._initted)return 1;if(!r&&e._pt&&!ue&&(e._dur&&e.vars.lazy!==!1||!e._dur&&e.vars.lazy)&&Ls!==Me.frame)return gt.push(e),e._lazy=[o,i],1},Ll=function s(e){var t=e.parent;return t&&t._ts&&t._initted&&!t._lock&&(t.rawTime()<0||s(t))},fi=function(e){var t=e.data;return t==="isFromStart"||t==="isStart"},Vl=function(e,t,r,i){var o=e.ratio,n=t<0||!t&&(!e._start&&Ll(e)&&!(!e._initted&&fi(e))||(e._ts<0||e._dp._ts<0)&&!fi(e))?0:1,a=e._rDelay,l=0,u,f,p;if(a&&e._repeat&&(l=Mr(0,e._tDur,t),f=tr(l,a),e._yoyo&&f&1&&(n=1-n),f!==tr(e._tTime,a)&&(o=1-n,e.vars.repeatRefresh&&e._initted&&e.invalidate())),n!==o||ue||i||e._zTime===V||!t&&e._zTime){if(!e._initted&&js(e,t,i,r,l))return;for(p=e._zTime,e._zTime=t||(r?V:0),r||(r=t&&!p),e.ratio=n,e._from&&(n=1-n),e._time=0,e._tTime=l,u=e._pt;u;)u.r(n,u.d),u=u._next;t<0&&eo(e,t,r,!0),e._onUpdate&&!r&&Ie(e,"onUpdate"),l&&e._repeat&&!r&&e.parent&&Ie(e,"onRepeat"),(t>=e._tDur||t<0)&&e.ratio===n&&(n&&vt(e,1),!r&&!ue&&(Ie(e,n?"onComplete":"onReverseComplete",!0),e._prom&&e._prom()))}else e._zTime||(e._zTime=t)},Wl=function(e,t,r){var i;if(r>t)for(i=e._first;i&&i._start<=r;){if(i.data==="isPause"&&i._start>t)return i;i=i._next}else for(i=e._last;i&&i._start>=r;){if(i.data==="isPause"&&i._start<t)return i;i=i._prev}},rr=function(e,t,r,i){var o=e._repeat,n=K(t)||0,a=e._tTime/e._tDur;return a&&!i&&(e._time*=n/e._dur),e._dur=n,e._tDur=o?o<0?1e10:K(n*(o+1)+e._rDelay*o):n,a>0&&!i&&_i(e,e._tTime=e._tDur*a),e.parent&&xi(e),r||kt(e.parent,e),e},Ms=function(e){return e instanceof xe?kt(e):rr(e,e._dur)},Nl={_start:0,endTime:Ar,totalDuration:Ar},Xe=function s(e,t,r){var i=e.labels,o=e._recent||Nl,n=e.duration()>=qe?o.endTime(!1):e._dur,a,l,u;return ne(t)&&(isNaN(t)||t in i)?(l=t.charAt(0),u=t.substr(-1)==="%",a=t.indexOf("="),l==="<"||l===">"?(a>=0&&(t=t.replace(/=/,"")),(l==="<"?o._start:o.endTime(o._repeat>=0))+(parseFloat(t.substr(1))||0)*(u?(a<0?o:r).totalDuration()/100:1)):a<0?(t in i||(i[t]=n),i[t]):(l=parseFloat(t.charAt(a-1)+t.substr(a+1)),u&&r&&(l=l/100*(_e(r)?r[0]:r).totalDuration()),a>1?s(e,t.substr(0,a-1),r)+l:n+l)):t==null?n:+t},Tr=function(e,t,r){var i=at(t[1]),o=(i?2:1)+(e<2?0:1),n=t[o],a,l;if(i&&(n.duration=t[1]),n.parent=r,e){for(a=n,l=r;l&&!("immediateRender"in a);)a=l.vars.defaults||{},l=Be(l.vars.inherit)&&l.parent;n.immediateRender=Be(a.immediateRender),e<2?n.runBackwards=1:n.startAt=t[o-1]}return new re(t[0],n,t[o+1])},bt=function(e,t){return e||e===0?t(e):t},Mr=function(e,t,r){return r<e?e:r>t?t:r},fe=function(e,t){return!ne(e)||!(t=kl.exec(e))?"":t[1]},Xl=function(e,t,r){return bt(r,function(i){return Mr(e,t,i)})},to=[].slice,Hs=function(e,t){return e&&et(e)&&"length"in e&&(!t&&!e.length||e.length-1 in e&&et(e[0]))&&!e.nodeType&&e!==Ze},ql=function(e,t,r){return r===void 0&&(r=[]),e.forEach(function(i){var o;return ne(i)&&!t||Hs(i,1)?(o=r).push.apply(o,Ye(i)):r.push(i)})||r},Ye=function(e,t,r){return j&&!t&&j.selector?j.selector(e):ne(e)&&!r&&(Zi||!ir())?to.call((t||uo).querySelectorAll(e),0):_e(e)?ql(e,r):Hs(e)?to.call(e,0):e?[e]:[]},ro=function(e){return e=Ye(e)[0]||Pr("Invalid scope")||{},function(t){var r=e.current||e.nativeElement||e;return Ye(t,r.querySelectorAll?r:r===e?Pr("Invalid scope")||uo.createElement("div"):e)}},$s=function(e){return e.sort(function(){return .5-Math.random()})},Ks=function(e){if(J(e))return e;var t=et(e)?e:{each:e},r=Et(t.ease),i=t.from||0,o=parseFloat(t.base)||0,n={},a=i>0&&i<1,l=isNaN(i)||a,u=t.axis,f=i,p=i;return ne(i)?f=p={center:.5,edges:.5,end:1}[i]||0:!a&&l&&(f=i[0],p=i[1]),function(c,h,_){var m=(_||t).length,d=n[m],g,b,S,A,v,M,F,O,C;if(!d){if(C=t.grid==="auto"?0:(t.grid||[1,qe])[1],!C){for(F=-qe;F<(F=_[C++].getBoundingClientRect().left)&&C<m;);C<m&&C--}for(d=n[m]=[],g=l?Math.min(C,m)*f-.5:i%C,b=C===qe?0:l?m*p/C-.5:i/C|0,F=0,O=qe,M=0;M<m;M++)S=M%C-g,A=b-(M/C|0),d[M]=v=u?Math.abs(u==="y"?A:S):zs(S*S+A*A),v>F&&(F=v),v<O&&(O=v);i==="random"&&$s(d),d.max=F-O,d.min=O,d.v=m=(parseFloat(t.amount)||parseFloat(t.each)*(C>m?m-1:u?u==="y"?m/C:C:Math.max(C,m/C))||0)*(i==="edges"?-1:1),d.b=m<0?o-m:o,d.u=fe(t.amount||t.each)||0,r=r&&m<0?ou(r):r}return m=(d[c]-d.min)/d.max||0,K(d.b+(r?r(m):m)*d.v)+d.u}},io=function(e){var t=Math.pow(10,((e+"").split(".")[1]||"").length);return function(r){var i=K(Math.round(parseFloat(r)/e)*e*t);return(i-i%1)/t+(at(r)?0:fe(r))}},Qs=function(e,t){var r=_e(e),i,o;return!r&&et(e)&&(i=r=e.radius||qe,e.values?(e=Ye(e.values),(o=!at(e[0]))&&(i*=i)):e=io(e.increment)),bt(t,r?J(e)?function(n){return o=e(n),Math.abs(o-n)<=i?o:n}:function(n){for(var a=parseFloat(o?n.x:n),l=parseFloat(o?n.y:0),u=qe,f=0,p=e.length,c,h;p--;)o?(c=e[p].x-a,h=e[p].y-l,c=c*c+h*h):c=Math.abs(e[p]-a),c<u&&(u=c,f=p);return f=!i||u<=i?e[f]:n,o||f===n||at(n)?f:f+fe(n)}:io(e))},Zs=function(e,t,r,i){return bt(_e(e)?!t:r===!0?!!(r=0):!i,function(){return _e(e)?e[~~(Math.random()*e.length)]:(r=r||1e-5)&&(i=r<1?Math.pow(10,(r+"").length-2):1)&&Math.floor(Math.round((e-r/2+Math.random()*(t-e+r*.99))/r)*r*i)/i})},Yl=function(){for(var e=arguments.length,t=new Array(e),r=0;r<e;r++)t[r]=arguments[r];return function(i){return t.reduce(function(o,n){return n(o)},i)}},jl=function(e,t){return function(r){return e(parseFloat(r))+(t||fe(r))}},Hl=function(e,t,r){return ea(e,t,0,1,r)},Js=function(e,t,r){return bt(r,function(i){return e[~~t(i)]})},$l=function s(e,t,r){var i=t-e;return _e(e)?Js(e,s(0,e.length),t):bt(r,function(o){return(i+(o-e)%i)%i+e})},Kl=function s(e,t,r){var i=t-e,o=i*2;return _e(e)?Js(e,s(0,e.length-1),t):bt(r,function(n){return n=(o+(n-e)%o)%o||0,e+(n>i?o-n:n)})},or=function(e){return e.replace(Ol,function(t){var r=t.indexOf("[")+1,i=t.substring(r||7,r?t.indexOf("]"):t.length-1).split(Ml);return Zs(r?i:+i[0],r?0:+i[1],+i[2]||1e-5)})},ea=function(e,t,r,i,o){var n=t-e,a=i-r;return bt(o,function(l){return r+((l-e)/n*a||0)})},Ql=function s(e,t,r,i){var o=isNaN(e+t)?0:function(h){return(1-h)*e+h*t};if(!o){var n=ne(e),a={},l,u,f,p,c;if(r===!0&&(i=1)&&(r=null),n)e={p:e},t={p:t};else if(_e(e)&&!_e(t)){for(f=[],p=e.length,c=p-2,u=1;u<p;u++)f.push(s(e[u-1],e[u]));p--,o=function(_){_*=p;var m=Math.min(c,~~_);return f[m](_-m)},r=t}else i||(e=er(_e(e)?[]:{},e));if(!f){for(l in t)go.call(a,e,l,"get",t[l]);o=function(_){return So(_,a)||(n?e.p:e)}}}return bt(r,o)},Bs=function(e,t,r){var i=e.labels,o=qe,n,a,l;for(n in i)a=i[n]-t,a<0==!!r&&a&&o>(a=Math.abs(a))&&(l=n,o=a);return l},Ie=function(e,t,r){var i=e.vars,o=i[t],n=j,a=e._ctx,l,u,f;if(o)return l=i[t+"Params"],u=i.callbackScope||e,r&&gt.length&&ai(),a&&(j=a),f=l?o.apply(u,l):o.call(u),j=n,f},yr=function(e){return vt(e),e.scrollTrigger&&e.scrollTrigger.kill(!!ue),e.progress()<1&&Ie(e,"onInterrupt"),e},Jt,ta=[],ra=function(e){if(e)if(e=!e.name&&e.default||e,so()||e.headless){var t=e.name,r=J(e),i=t&&!r&&e.init?function(){this._props=[]}:e,o={init:Ar,render:So,add:go,kill:hu,modifier:mu,rawVars:0},n={targetTest:0,get:0,getSetter:gi,aliases:{},register:0};if(ir(),e!==i){if(Oe[t])return;Ge(i,Ge(li(e,o),n)),er(i.prototype,er(o,li(e,n))),Oe[i.prop=t]=i,e.targetTest&&(oi.push(i),fo[t]=1),t=(t==="css"?"CSS":t.charAt(0).toUpperCase()+t.substr(1))+"Plugin"}Ds(t,i),e.register&&e.register(ge,i,we)}else ta.push(e)},W=255,vr={aqua:[0,W,W],lime:[0,W,0],silver:[192,192,192],black:[0,0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,W],navy:[0,0,128],white:[W,W,W],olive:[128,128,0],yellow:[W,W,0],orange:[W,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[W,0,0],pink:[W,192,203],cyan:[0,W,W],transparent:[W,W,W,0]},Yi=function(e,t,r){return e+=e<0?1:e>1?-1:0,(e*6<1?t+(r-t)*e*6:e<.5?r:e*3<2?t+(r-t)*(2/3-e)*6:t)*W+.5|0},ia=function(e,t,r){var i=e?at(e)?[e>>16,e>>8&W,e&W]:0:vr.black,o,n,a,l,u,f,p,c,h,_;if(!i){if(e.substr(-1)===","&&(e=e.substr(0,e.length-1)),vr[e])i=vr[e];else if(e.charAt(0)==="#"){if(e.length<6&&(o=e.charAt(1),n=e.charAt(2),a=e.charAt(3),e="#"+o+o+n+n+a+a+(e.length===5?e.charAt(4)+e.charAt(4):"")),e.length===9)return i=parseInt(e.substr(1,6),16),[i>>16,i>>8&W,i&W,parseInt(e.substr(7),16)/255];e=parseInt(e.substr(1),16),i=[e>>16,e>>8&W,e&W]}else if(e.substr(0,3)==="hsl"){if(i=_=e.match(As),!t)l=+i[0]%360/360,u=+i[1]/100,f=+i[2]/100,n=f<=.5?f*(u+1):f+u-f*u,o=f*2-n,i.length>3&&(i[3]*=1),i[0]=Yi(l+1/3,o,n),i[1]=Yi(l,o,n),i[2]=Yi(l-1/3,o,n);else if(~e.indexOf("="))return i=e.match(ao),r&&i.length<4&&(i[3]=1),i}else i=e.match(As)||vr.transparent;i=i.map(Number)}return t&&!_&&(o=i[0]/W,n=i[1]/W,a=i[2]/W,p=Math.max(o,n,a),c=Math.min(o,n,a),f=(p+c)/2,p===c?l=u=0:(h=p-c,u=f>.5?h/(2-p-c):h/(p+c),l=p===o?(n-a)/h+(n<a?6:0):p===n?(a-o)/h+2:(o-n)/h+4,l*=60),i[0]=~~(l+.5),i[1]=~~(u*100+.5),i[2]=~~(f*100+.5)),r&&i.length<4&&(i[3]=1),i},oa=function(e){var t=[],r=[],i=-1;return e.split(st).forEach(function(o){var n=o.match(zt)||[];t.push.apply(t,n),r.push(i+=n.length+1)}),t.c=r,t},ks=function(e,t,r){var i="",o=(e+i).match(st),n=t?"hsla(":"rgba(",a=0,l,u,f,p;if(!o)return e;if(o=o.map(function(c){return(c=ia(c,t,1))&&n+(t?c[0]+","+c[1]+"%,"+c[2]+"%,"+c[3]:c.join(","))+")"}),r&&(f=oa(e),l=r.c,l.join(i)!==f.c.join(i)))for(u=e.replace(st,"1").split(zt),p=u.length-1;a<p;a++)i+=u[a]+(~l.indexOf(a)?o.shift()||n+"0,0,0,0)":(f.length?f:o.length?o:r).shift());if(!u)for(u=e.split(st),p=u.length-1;a<p;a++)i+=u[a]+o[a];return i+u[p]},st=function(){var s="(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b",e;for(e in vr)s+="|"+e+"\\b";return new RegExp(s+")","gi")}(),Zl=/hsl[a]?\(/,xo=function(e){var t=e.join(" "),r;if(st.lastIndex=0,st.test(t))return r=Zl.test(t),e[1]=ks(e[1],r),e[0]=ks(e[0],r,oa(e[1])),!0},Cr,Me=function(){var s=Date.now,e=500,t=33,r=s(),i=r,o=1e3/240,n=o,a=[],l,u,f,p,c,h,_=function m(d){var g=s()-i,b=d===!0,S,A,v,M;if((g>e||g<0)&&(r+=g-t),i+=g,v=i-r,S=v-n,(S>0||b)&&(M=++p.frame,c=v-p.time*1e3,p.time=v=v/1e3,n+=S+(S>=o?0:o-S),A=1),b||(l=u(m)),A)for(h=0;h<a.length;h++)a[h](v,c,M,d)};return p={time:0,frame:0,tick:function(){_(!0)},deltaRatio:function(d){return c/(1e3/(d||60))},wake:function(){Us&&(!Zi&&so()&&(Ze=Zi=window,uo=Ze.document||{},Ue.gsap=ge,(Ze.gsapVersions||(Ze.gsapVersions=[])).push(ge.version),Gs(si||Ze.GreenSockGlobals||!Ze.gsap&&Ze||{}),ta.forEach(ra)),f=typeof requestAnimationFrame<"u"&&requestAnimationFrame,l&&p.sleep(),u=f||function(d){return setTimeout(d,n-p.time*1e3+1|0)},Cr=1,_(2))},sleep:function(){(f?cancelAnimationFrame:clearTimeout)(l),Cr=0,u=Ar},lagSmoothing:function(d,g){e=d||1/0,t=Math.min(g||33,e)},fps:function(d){o=1e3/(d||240),n=p.time*1e3+o},add:function(d,g,b){var S=g?function(A,v,M,F){d(A,v,M,F),p.remove(S)}:d;return p.remove(d),a[b?"unshift":"push"](S),ir(),S},remove:function(d,g){~(g=a.indexOf(d))&&a.splice(g,1)&&h>=g&&h--},_listeners:a},p}(),ir=function(){return!Cr&&Me.wake()},I={},Jl=/^[\d.\-M][\d.\-,\s]/,eu=/["']/g,tu=function(e){for(var t={},r=e.substr(1,e.length-3).split(":"),i=r[0],o=1,n=r.length,a,l,u;o<n;o++)l=r[o],a=o!==n-1?l.lastIndexOf(","):l.length,u=l.substr(0,a),t[i]=isNaN(u)?u.replace(eu,"").trim():+u,i=l.substr(a+1).trim();return t},ru=function(e){var t=e.indexOf("(")+1,r=e.indexOf(")"),i=e.indexOf("(",t);return e.substring(t,~i&&i<r?e.indexOf(")",r+1):r)},iu=function(e){var t=(e+"").split("("),r=I[t[0]];return r&&t.length>1&&r.config?r.config.apply(null,~e.indexOf("{")?[tu(t[1])]:ru(e).split(",").map(Ws)):I._CE&&Jl.test(e)?I._CE("",e):r},ou=function(e){return function(t){return 1-e(1-t)}},Et=function(e,t){return e&&(J(e)?e:I[e]||iu(e))||t},Ut=function(e,t,r,i){r===void 0&&(r=function(l){return 1-t(1-l)}),i===void 0&&(i=function(l){return l<.5?t(l*2)/2:1-t((1-l)*2)/2});var o={easeIn:t,easeOut:r,easeInOut:i},n;return Se(e,function(a){I[a]=Ue[a]=o,I[n=a.toLowerCase()]=r;for(var l in o)I[n+(l==="easeIn"?".in":l==="easeOut"?".out":".inOut")]=I[a+"."+l]=o[l]}),o},na=function(e){return function(t){return t<.5?(1-e(1-t*2))/2:.5+e((t-.5)*2)/2}},ji=function s(e,t,r){var i=t>=1?t:1,o=(r||(e?.3:.45))/(t<1?t:1),n=o/Qi*(Math.asin(1/i)||0),a=function(f){return f===1?1:i*Math.pow(2,-10*f)*Fl((f-n)*o)+1},l=e==="out"?a:e==="in"?function(u){return 1-a(1-u)}:na(a);return o=Qi/o,l.config=function(u,f){return s(e,u,f)},l},Hi=function s(e,t){t===void 0&&(t=1.70158);var r=function(n){return n?--n*n*((t+1)*n+t)+1:0},i=e==="out"?r:e==="in"?function(o){return 1-r(1-o)}:na(r);return i.config=function(o){return s(e,o)},i};Se("Linear,Quad,Cubic,Quart,Quint,Strong",function(s,e){var t=e<5?e+1:e;Ut(s+",Power"+(t-1),e?function(r){return Math.pow(r,t)}:function(r){return r},function(r){return 1-Math.pow(1-r,t)},function(r){return r<.5?Math.pow(r*2,t)/2:1-Math.pow((1-r)*2,t)/2})});I.Linear.easeNone=I.none=I.Linear.easeIn;Ut("Elastic",ji("in"),ji("out"),ji());(function(s,e){var t=1/e,r=2*t,i=2.5*t,o=function(a){return a<t?s*a*a:a<r?s*Math.pow(a-1.5/e,2)+.75:a<i?s*(a-=2.25/e)*a+.9375:s*Math.pow(a-2.625/e,2)+.984375};Ut("Bounce",function(n){return 1-o(1-n)},o)})(7.5625,2.75);Ut("Expo",function(s){return Math.pow(2,10*(s-1))*s+s*s*s*s*s*s*(1-s)});Ut("Circ",function(s){return-(zs(1-s*s)-1)});Ut("Sine",function(s){return s===1?1:-Cl(s*Pl)+1});Ut("Back",Hi("in"),Hi("out"),Hi());I.SteppedEase=I.steps=Ue.SteppedEase={config:function(e,t){e===void 0&&(e=1);var r=1/e,i=e+(t?0:1),o=t?1:0,n=1-V;return function(a){return((i*Mr(0,n,a)|0)+o)*r}}};wr.ease=I["quad.out"];Se("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt",function(s){return po+=s+","+s+"Params,"});var _o=function(e,t){this.id=Al++,e._gsap=this,this.target=e,this.harness=t,this.get=t?t.get:mo,this.set=t?t.getSetter:gi},Fr=function(){function s(t){this.vars=t,this._delay=+t.delay||0,(this._repeat=t.repeat===1/0?-2:t.repeat||0)&&(this._rDelay=t.repeatDelay||0,this._yoyo=!!t.yoyo||!!t.yoyoEase),this._ts=1,rr(this,+t.duration,1,1),this.data=t.data,j&&(this._ctx=j,j.data.push(this)),Cr||Me.wake()}var e=s.prototype;return e.delay=function(r){return r||r===0?(this.parent&&this.parent.smoothChildTiming&&this.startTime(this._start+r-this._delay),this._delay=r,this):this._delay},e.duration=function(r){return arguments.length?this.totalDuration(this._repeat>0?r+(r+this._rDelay)*this._repeat:r):this.totalDuration()&&this._dur},e.totalDuration=function(r){return arguments.length?(this._dirty=0,rr(this,this._repeat<0?r:(r-this._repeat*this._rDelay)/(this._repeat+1))):this._tDur},e.totalTime=function(r,i){if(ir(),!arguments.length)return this._tTime;var o=this._dp;if(o&&o.smoothChildTiming&&this._ts){for(_i(this,r),!o._dp||o.parent||qs(o,this);o&&o.parent;)o.parent._time!==o._start+(o._ts>=0?o._tTime/o._ts:(o.totalDuration()-o._tTime)/-o._ts)&&o.totalTime(o._tTime,!0),o=o.parent;!this.parent&&this._dp.autoRemoveChildren&&(this._ts>0&&r<this._tDur||this._ts<0&&r>0||!this._tDur&&!r)&&Je(this._dp,this,this._start-this._delay)}return(this._tTime!==r||!this._dur&&!i||this._initted&&Math.abs(this._zTime)===V||!this._initted&&this._dur&&r||!r&&!this._initted&&(this.add||this._ptLookup))&&(this._ts||(this._pTime=r),Vs(this,r,i)),this},e.time=function(r,i){return arguments.length?this.totalTime(Math.min(this.totalDuration(),r+Os(this))%(this._dur+this._rDelay)||(r?this._dur:0),i):this._time},e.totalProgress=function(r,i){return arguments.length?this.totalTime(this.totalDuration()*r,i):this.totalDuration()?Math.min(1,this._tTime/this._tDur):this.rawTime()>=0&&this._initted?1:0},e.progress=function(r,i){return arguments.length?this.totalTime(this.duration()*(this._yoyo&&!(this.iteration()&1)?1-r:r)+Os(this),i):this.duration()?Math.min(1,this._time/this._dur):this.rawTime()>0?1:0},e.iteration=function(r,i){var o=this.duration()+this._rDelay;return arguments.length?this.totalTime(this._time+(r-1)*o,i):this._repeat?tr(this._tTime,o)+1:1},e.timeScale=function(r,i){if(!arguments.length)return this._rts===-V?0:this._rts;if(this._rts===r)return this;var o=this.parent&&this._ts?ui(this.parent._time,this):this._tTime,n=this._rts<0;this._rts=+r||0,this._ts=this._ps||r===-V?0:this._rts;var a=this.totalDuration();return(n!==this._rts<0||o>0&&o<a)&&this.totalTime(Mr(-Math.abs(this._delay),a,o),i!==!1),xi(this),Gl(this)},e.paused=function(r){if(!arguments.length)return this._ps;if(this._ps!==r)if(this._ps=r,r)this._pTime=this._tTime||Math.max(-this._delay,this.rawTime()),this._ts=this._act=0;else{ir(),this._ts=this._rts;var i=this.parent&&!this.parent.smoothChildTiming?this.rawTime():this._tTime||this._pTime,o=this.progress()===1&&Math.abs(this._zTime)!==V,n;if(o)for(this._tTime-=V,n=this._first;n;){if(!n._dur&&n._zTime<0&&n._ts&&n._start<=i+V){o=!1;break}n=n._next}this.totalTime(i,o)}return this},e.startTime=function(r){if(arguments.length){this._start=K(r);var i=this.parent||this._dp;return i&&(i._sort||!this.parent)&&Je(i,this,this._start-this._delay),this}return this._start},e.endTime=function(r){return this._start+(Be(r)?this.totalDuration():this.duration())/Math.abs(this._ts||1)},e.rawTime=function(r){var i=this.parent||this._dp;return i?r&&(!this._ts||this._repeat&&this._time&&this.totalProgress()<1)?this._tTime%(this._dur+this._rDelay):this._ts?ui(i.rawTime(r),this):this._tTime:this._tTime},e.revert=function(r){r===void 0&&(r=Rl);var i=ue;return ue=r,ho(this)&&(this.timeline&&this.timeline.revert(r),this.totalTime(-.01,r.suppressEvents)),this.data!=="nested"&&r.kill!==!1&&this.kill(),ue=i,this},e.globalTime=function(r){for(var i=this,o=arguments.length?r:i.rawTime();i;)o=i._start+o/(Math.abs(i._ts)||1),i=i._dp;return!this.parent&&this._sat?this._sat.globalTime(r):o},e.repeat=function(r){return arguments.length?(this._repeat=r===1/0?-2:r,Ms(this)):this._repeat===-2?1/0:this._repeat},e.repeatDelay=function(r){if(arguments.length){var i=this._time;return this._rDelay=r,Ms(this),i?this.time(i):this}return this._rDelay},e.yoyo=function(r){return arguments.length?(this._yoyo=r,this):this._yoyo},e.seek=function(r,i){return this.totalTime(Xe(this,r),Be(i))},e.restart=function(r,i){return this.play().totalTime(r?-this._delay:0,Be(i)),this._dur||(this._zTime=-V),this},e.play=function(r,i){return r!=null&&this.seek(r,i),this.reversed(!1).paused(!1)},e.reverse=function(r,i){return r!=null&&this.seek(r||this.totalDuration(),i),this.reversed(!0).paused(!1)},e.pause=function(r,i){return r!=null&&this.seek(r,i),this.paused(!0)},e.resume=function(){return this.paused(!1)},e.reversed=function(r){return arguments.length?(!!r!==this.reversed()&&this.timeScale(-this._rts||(r?-V:0)),this):this._rts<0},e.invalidate=function(){return this._initted=this._act=0,this._zTime=-V,this},e.isActive=function(){var r=this.parent||this._dp,i=this._start,o;return!!(!r||this._ts&&this._initted&&r.isActive()&&(o=r.rawTime(!0))>=i&&o<this.endTime(!0)-V)},e.eventCallback=function(r,i,o){var n=this.vars;return arguments.length>1?(i?(n[r]=i,o&&(n[r+"Params"]=o),r==="onUpdate"&&(this._onUpdate=i)):delete n[r],this):n[r]},e.then=function(r){var i=this,o=i._prom;return new Promise(function(n){var a=J(r)?r:Ns,l=function(){var f=i.then;i.then=null,o&&o(),J(a)&&(a=a(i))&&(a.then||a===i)&&(i.then=f),n(a),i.then=f};i._initted&&i.totalProgress()===1&&i._ts>=0||!i._tTime&&i._ts<0?l():i._prom=l})},e.kill=function(){yr(this)},s}();Ge(Fr.prototype,{_time:0,_start:0,_end:0,_tTime:0,_tDur:0,_dirty:0,_repeat:0,_yoyo:!1,parent:null,_initted:!1,_rDelay:0,_ts:1,_dp:0,ratio:0,_zTime:-V,_prom:0,_ps:!1,_rts:1});var xe=function(s){Rs(e,s);function e(r,i){var o;return r===void 0&&(r={}),o=s.call(this,r)||this,o.labels={},o.smoothChildTiming=!!r.smoothChildTiming,o.autoRemoveChildren=!!r.autoRemoveChildren,o._sort=Be(r.sortChildren),Q&&Je(r.parent||Q,nt(o),i),r.reversed&&o.reverse(),r.paused&&o.paused(!0),r.scrollTrigger&&Ys(nt(o),r.scrollTrigger),o}var t=e.prototype;return t.to=function(i,o,n){return Tr(0,arguments,this),this},t.from=function(i,o,n){return Tr(1,arguments,this),this},t.fromTo=function(i,o,n,a){return Tr(2,arguments,this),this},t.set=function(i,o,n){return o.duration=0,o.parent=this,br(o).repeatDelay||(o.repeat=0),o.immediateRender=!!o.immediateRender,new re(i,o,Xe(this,n),1),this},t.call=function(i,o,n){return Je(this,re.delayedCall(0,i,o),n)},t.staggerTo=function(i,o,n,a,l,u,f){return n.duration=o,n.stagger=n.stagger||a,n.onComplete=u,n.onCompleteParams=f,n.parent=this,new re(i,n,Xe(this,l)),this},t.staggerFrom=function(i,o,n,a,l,u,f){return n.runBackwards=1,br(n).immediateRender=Be(n.immediateRender),this.staggerTo(i,o,n,a,l,u,f)},t.staggerFromTo=function(i,o,n,a,l,u,f,p){return a.startAt=n,br(a).immediateRender=Be(a.immediateRender),this.staggerTo(i,o,a,l,u,f,p)},t.render=function(i,o,n){var a=this._time,l=this._dirty?this.totalDuration():this._tDur,u=this._dur,f=i<=0?0:K(i),p=this._zTime<0!=i<0&&(this._initted||!u),c,h,_,m,d,g,b,S,A,v,M,F;if(this!==Q&&f>l&&i>=0&&(f=l),f!==this._tTime||n||p){if(a!==this._time&&u&&(f+=this._time-a,i+=this._time-a),c=f,A=this._start,S=this._ts,g=!S,p&&(u||(a=this._zTime),(i||!o)&&(this._zTime=i)),this._repeat){if(M=this._yoyo,d=u+this._rDelay,this._repeat<-1&&i<0)return this.totalTime(d*100+i,o,n);if(c=K(f%d),f===l?(m=this._repeat,c=u):(v=K(f/d),m=~~v,m&&m===v&&(c=u,m--),c>u&&(c=u)),v=tr(this._tTime,d),!a&&this._tTime&&v!==m&&this._tTime-v*d-this._dur<=0&&(v=m),M&&m&1&&(c=u-c,F=1),m!==v&&!this._lock){var O=M&&v&1,C=O===(M&&m&1);if(m<v&&(O=!O),a=O?0:f%u?u:f,this._lock=1,this.render(a||(F?0:K(m*d)),o,!u)._lock=0,this._tTime=f,!o&&this.parent&&Ie(this,"onRepeat"),this.vars.repeatRefresh&&!F&&(this.invalidate()._lock=1,v=m),a&&a!==this._time||g!==!this._ts||this.vars.onRepeat&&!this.parent&&!this._act)return this;if(u=this._dur,l=this._tDur,C&&(this._lock=2,a=O?u:-1e-4,this.render(a,!0),this.vars.repeatRefresh&&!F&&this.invalidate()),this._lock=0,!this._ts&&!g)return this}}if(this._hasPause&&!this._forcing&&this._lock<2&&(b=Wl(this,K(a),K(c)),b&&(f-=c-(c=b._start))),this._tTime=f,this._time=c,this._act=!!S,this._initted||(this._onUpdate=this.vars.onUpdate,this._initted=1,this._zTime=i,a=0),!a&&f&&u&&!o&&!v&&(Ie(this,"onStart"),this._tTime!==f))return this;if(c>=a&&i>=0)for(h=this._first;h;){if(_=h._next,(h._act||c>=h._start)&&h._ts&&b!==h){if(h.parent!==this)return this.render(i,o,n);if(h.render(h._ts>0?(c-h._start)*h._ts:(h._dirty?h.totalDuration():h._tDur)+(c-h._start)*h._ts,o,n),c!==this._time||!this._ts&&!g){b=0,_&&(f+=this._zTime=-V);break}}h=_}else{h=this._last;for(var k=i<0?i:c;h;){if(_=h._prev,(h._act||k<=h._end)&&h._ts&&b!==h){if(h.parent!==this)return this.render(i,o,n);if(h.render(h._ts>0?(k-h._start)*h._ts:(h._dirty?h.totalDuration():h._tDur)+(k-h._start)*h._ts,o,n||ue&&ho(h)),c!==this._time||!this._ts&&!g){b=0,_&&(f+=this._zTime=k?-V:V);break}}h=_}}if(b&&!o&&(this.pause(),b.render(c>=a?0:-V)._zTime=c>=a?1:-1,this._ts))return this._start=A,xi(this),this.render(i,o,n);this._onUpdate&&!o&&Ie(this,"onUpdate",!0),(f===l&&this._tTime>=this.totalDuration()||!f&&a)&&(A===this._start||Math.abs(S)!==Math.abs(this._ts))&&(this._lock||((i||!u)&&(f===l&&this._ts>0||!f&&this._ts<0)&&vt(this,1),!o&&!(i<0&&!a)&&(f||a||!l)&&(Ie(this,f===l&&i>=0?"onComplete":"onReverseComplete",!0),this._prom&&!(f<l&&this.timeScale()>0)&&this._prom())))}return this},t.add=function(i,o){var n=this;if(at(o)||(o=Xe(this,o,i)),!(i instanceof Fr)){if(_e(i))return i.forEach(function(a){return n.add(a,o)}),this;if(ne(i))return this.addLabel(i,o);if(J(i))i=re.delayedCall(0,i);else return this}return this!==i?Je(this,i,o):this},t.getChildren=function(i,o,n,a){i===void 0&&(i=!0),o===void 0&&(o=!0),n===void 0&&(n=!0),a===void 0&&(a=-qe);for(var l=[],u=this._first;u;)u._start>=a&&(u instanceof re?o&&l.push(u):(n&&l.push(u),i&&l.push.apply(l,u.getChildren(!0,o,n)))),u=u._next;return l},t.getById=function(i){for(var o=this.getChildren(1,1,1),n=o.length;n--;)if(o[n].vars.id===i)return o[n]},t.remove=function(i){return ne(i)?this.removeLabel(i):J(i)?this.killTweensOf(i):(i.parent===this&&di(this,i),i===this._recent&&(this._recent=this._last),kt(this))},t.totalTime=function(i,o){return arguments.length?(this._forcing=1,!this._dp&&this._ts&&(this._start=K(Me.time-(this._ts>0?i/this._ts:(this.totalDuration()-i)/-this._ts))),s.prototype.totalTime.call(this,i,o),this._forcing=0,this):this._tTime},t.addLabel=function(i,o){return this.labels[i]=Xe(this,o),this},t.removeLabel=function(i){return delete this.labels[i],this},t.addPause=function(i,o,n){var a=re.delayedCall(0,o||Ar,n);return a.data="isPause",this._hasPause=1,Je(this,a,Xe(this,i))},t.removePause=function(i){var o=this._first;for(i=Xe(this,i);o;)o._start===i&&o.data==="isPause"&&vt(o),o=o._next},t.killTweensOf=function(i,o,n){for(var a=this.getTweensOf(i,n),l=a.length;l--;)_t!==a[l]&&a[l].kill(i,o);return this},t.getTweensOf=function(i,o){for(var n=[],a=Ye(i),l=this._first,u=at(o),f;l;)l instanceof re?zl(l._targets,a)&&(u?(!_t||l._initted&&l._ts)&&l.globalTime(0)<=o&&l.globalTime(l.totalDuration())>o:!o||l.isActive())&&n.push(l):(f=l.getTweensOf(a,o)).length&&n.push.apply(n,f),l=l._next;return n},t.tweenTo=function(i,o){o=o||{};var n=this,a=Xe(n,i),l=o,u=l.startAt,f=l.onStart,p=l.onStartParams,c=l.immediateRender,h,_=re.to(n,Ge({ease:o.ease||"none",lazy:!1,immediateRender:!1,time:a,overwrite:"auto",duration:o.duration||Math.abs((a-(u&&"time"in u?u.time:n._time))/n.timeScale())||V,onStart:function(){if(n.pause(),!h){var d=o.duration||Math.abs((a-(u&&"time"in u?u.time:n._time))/n.timeScale());_._dur!==d&&rr(_,d,0,1).render(_._time,!0,!0),h=1}f&&f.apply(_,p||[])}},o));return c?_.render(0):_},t.tweenFromTo=function(i,o,n){return this.tweenTo(o,Ge({startAt:{time:Xe(this,i)}},n))},t.recent=function(){return this._recent},t.nextLabel=function(i){return i===void 0&&(i=this._time),Bs(this,Xe(this,i))},t.previousLabel=function(i){return i===void 0&&(i=this._time),Bs(this,Xe(this,i),1)},t.currentLabel=function(i){return arguments.length?this.seek(i,!0):this.previousLabel(this._time+V)},t.shiftChildren=function(i,o,n){n===void 0&&(n=0);var a=this._first,l=this.labels,u;for(i=K(i);a;)a._start>=n&&(a._start+=i,a._end+=i),a=a._next;if(o)for(u in l)l[u]>=n&&(l[u]+=i);return kt(this)},t.invalidate=function(i){var o=this._first;for(this._lock=0;o;)o.invalidate(i),o=o._next;return s.prototype.invalidate.call(this,i)},t.clear=function(i){i===void 0&&(i=!0);for(var o=this._first,n;o;)n=o._next,this.remove(o),o=n;return this._dp&&(this._time=this._tTime=this._pTime=0),i&&(this.labels={}),kt(this)},t.totalDuration=function(i){var o=0,n=this,a=n._last,l=qe,u,f,p;if(arguments.length)return n.timeScale((n._repeat<0?n.duration():n.totalDuration())/(n.reversed()?-i:i));if(n._dirty){for(p=n.parent;a;)u=a._prev,a._dirty&&a.totalDuration(),f=a._start,f>l&&n._sort&&a._ts&&!n._lock?(n._lock=1,Je(n,a,f-a._delay,1)._lock=0):l=f,f<0&&a._ts&&(o-=f,(!p&&!n._dp||p&&p.smoothChildTiming)&&(n._start+=K(f/n._ts),n._time-=f,n._tTime-=f),n.shiftChildren(-f,!1,-1/0),l=0),a._end>o&&a._ts&&(o=a._end),a=u;rr(n,n===Q&&n._time>o?n._time:o,1,1),n._dirty=0}return n._tDur},e.updateRoot=function(i){if(Q._ts&&(Vs(Q,ui(i,Q)),Ls=Me.frame),Me.frame>=Cs){Cs+=ke.autoSleep||120;var o=Q._first;if((!o||!o._ts)&&ke.autoSleep&&Me._listeners.length<2){for(;o&&!o._ts;)o=o._next;o||Me.sleep()}}},e}(Fr);Ge(xe.prototype,{_lock:0,_hasPause:0,_forcing:0});var nu=function(e,t,r,i,o,n,a){var l=new we(this._pt,e,t,0,1,To,null,o),u=0,f=0,p,c,h,_,m,d,g,b;for(l.b=r,l.e=i,r+="",i+="",(g=~i.indexOf("random("))&&(i=or(i)),n&&(b=[r,i],n(b,e,t),r=b[0],i=b[1]),c=r.match(Xi)||[];p=Xi.exec(i);)_=p[0],m=i.substring(u,p.index),h?h=(h+1)%5:m.substr(-5)==="rgba("&&(h=1),_!==c[f++]&&(d=parseFloat(c[f-1])||0,l._pt={_next:l._pt,p:m||f===1?m:",",s:d,c:_.charAt(1)==="="?It(d,_)-d:parseFloat(_)-d,m:h&&h<4?Math.round:0},u=Xi.lastIndex);return l.c=u<i.length?i.substring(u,i.length):"",l.fp=a,(lo.test(i)||g)&&(l.e=0),this._pt=l,l},go=function(e,t,r,i,o,n,a,l,u,f){J(i)&&(i=i(o||0,e,n));var p=e[t],c=r!=="get"?r:J(p)?u?e[t.indexOf("set")||!J(e["get"+t.substr(3)])?t:"get"+t.substr(3)](u):e[t]():p,h=J(p)?u?fu:aa:bo,_;if(ne(i)&&(~i.indexOf("random(")&&(i=or(i)),i.charAt(1)==="="&&(_=It(c,i)+(fe(c)||0),(_||_===0)&&(i=_))),!f||c!==i||oo)return!isNaN(c*i)&&i!==""?(_=new we(this._pt,e,t,+c||0,i-(c||0),typeof p=="boolean"?cu:la,0,h),u&&(_.fp=u),a&&_.modifier(a,this,e),this._pt=_):(!p&&!(t in e)&&hi(t,i),nu.call(this,e,t,c,i,h,l||ke.stringFilter,u))},su=function(e,t,r,i,o){if(J(e)&&(e=Sr(e,o,t,r,i)),!et(e)||e.style&&e.nodeType||_e(e)||Is(e))return ne(e)?Sr(e,o,t,r,i):e;var n={},a;for(a in e)n[a]=Sr(e[a],o,t,r,i);return n},yo=function(e,t,r,i,o,n){var a,l,u,f;if(Oe[e]&&(a=new Oe[e]).init(o,a.rawVars?t[e]:su(t[e],i,o,n,r),r,i,n)!==!1&&(r._pt=l=new we(r._pt,o,e,0,1,a.render,a,0,a.priority),r!==Jt))for(u=r._ptLookup[r._targets.indexOf(o)],f=a._props.length;f--;)u[a._props[f]]=l;return a},_t,oo,vo=function s(e,t,r){var i=e.vars,o=i.ease,n=i.startAt,a=i.immediateRender,l=i.lazy,u=i.onUpdate,f=i.runBackwards,p=i.yoyoEase,c=i.keyframes,h=i.autoRevert,_=e._dur,m=e._startAt,d=e._targets,g=e.parent,b=g&&g.data==="nested"?g.vars.targets:d,S=e._overwrite==="auto"&&!no,A=e.timeline,v=i.easeReverse||p,M,F,O,C,k,N,L,U,X,R,z,q,se;if(A&&(!c||!o)&&(o="none"),e._ease=Et(o,wr.ease),e._rEase=v&&(Et(v)||e._ease),e._from=!A&&!!i.runBackwards,e._from&&(e.ratio=1),!A||c&&!i.stagger){if(U=d[0]?yt(d[0]).harness:0,q=U&&i[U.prop],M=li(i,fo),m&&(m._zTime<0&&m.progress(1),t<0&&f&&a&&!h?m.render(-1,!0):m.revert(f&&_?ii:El),m._lazy=0),n){if(vt(e._startAt=re.set(d,Ge({data:"isStart",overwrite:!1,parent:g,immediateRender:!0,lazy:!m&&Be(l),startAt:null,delay:0,onUpdate:u&&function(){return Ie(e,"onUpdate")},stagger:0},n))),e._startAt._dp=0,e._startAt._sat=e,t<0&&(ue||!a&&!h)&&e._startAt.revert(ii),a&&_&&t<=0&&r<=0){t&&(e._zTime=t);return}}else if(f&&_&&!m){if(t&&(a=!1),O=Ge({overwrite:!1,data:"isFromStart",lazy:a&&!m&&Be(l),immediateRender:a,stagger:0,parent:g},M),q&&(O[U.prop]=q),vt(e._startAt=re.set(d,O)),e._startAt._dp=0,e._startAt._sat=e,t<0&&(ue?e._startAt.revert(ii):e._startAt.render(-1,!0)),e._zTime=t,!a)s(e._startAt,V,V);else if(!t)return}for(e._pt=e._ptCache=0,l=_&&Be(l)||l&&!_,F=0;F<d.length;F++){if(k=d[F],L=k._gsap||co(d)[F]._gsap,e._ptLookup[F]=R={},Ji[L.id]&&gt.length&&ai(),z=b===d?F:b.indexOf(k),U&&(X=new U).init(k,q||M,e,z,b)!==!1&&(e._pt=C=new we(e._pt,k,X.name,0,1,X.render,X,0,X.priority),X._props.forEach(function(He){R[He]=C}),X.priority&&(N=1)),!U||q)for(O in M)Oe[O]&&(X=yo(O,M,e,z,k,b))?X.priority&&(N=1):R[O]=C=go.call(e,k,O,"get",M[O],z,b,0,i.stringFilter);e._op&&e._op[F]&&e.kill(k,e._op[F]),S&&e._pt&&(_t=e,Q.killTweensOf(k,R,e.globalTime(t)),se=!e.parent,_t=0),e._pt&&l&&(Ji[L.id]=1)}N&&wo(e),e._onInit&&e._onInit(e)}e._onUpdate=u,e._initted=(!e._op||e._pt)&&!se,c&&t<=0&&A.render(qe,!0,!0)},au=function(e,t,r,i,o,n,a,l){var u=(e._pt&&e._ptCache||(e._ptCache={}))[t],f,p,c,h;if(!u)for(u=e._ptCache[t]=[],c=e._ptLookup,h=e._targets.length;h--;){if(f=c[h][t],f&&f.d&&f.d._pt)for(f=f.d._pt;f&&f.p!==t&&f.fp!==t;)f=f._next;if(!f)return oo=1,e.vars[t]="+=0",vo(e,a),oo=0,l?Pr(t+" not eligible for reset. Try splitting into individual properties"):1;u.push(f)}for(h=u.length;h--;)p=u[h],f=p._pt||p,f.s=(i||i===0)&&!o?i:f.s+(i||0)+n*f.c,f.c=r-f.s,p.e&&(p.e=ee(r)+fe(p.e)),p.b&&(p.b=f.s+fe(p.b))},lu=function(e,t){var r=e[0]?yt(e[0]).harness:0,i=r&&r.aliases,o,n,a,l;if(!i)return t;o=er({},t);for(n in i)if(n in o)for(l=i[n].split(","),a=l.length;a--;)o[l[a]]=o[n];return o},uu=function(e,t,r,i){var o=t.ease||i||"power1.inOut",n,a;if(_e(t))a=r[e]||(r[e]=[]),t.forEach(function(l,u){return a.push({t:u/(t.length-1)*100,v:l,e:o})});else for(n in t)a=r[n]||(r[n]=[]),n==="ease"||a.push({t:parseFloat(e),v:t[n],e:o})},Sr=function(e,t,r,i,o){return J(e)?e.call(t,r,i,o):ne(e)&&~e.indexOf("random(")?or(e):e},pi=po+"repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,easeReverse,autoRevert",sa={};Se(pi+",id,stagger,delay,duration,paused,scrollTrigger",function(s){return sa[s]=1});pi=pi.split(",");var re=function(s){Rs(e,s);function e(r,i,o,n){var a;typeof i=="number"&&(o.duration=i,i=o,o=null),a=s.call(this,n?i:br(i))||this;var l=a.vars,u=l.duration,f=l.delay,p=l.immediateRender,c=l.stagger,h=l.overwrite,_=l.keyframes,m=l.defaults,d=l.scrollTrigger,g=i.parent||Q,b=(_e(r)||Is(r)?at(r[0]):"length"in i)?[r]:Ye(r),S,A,v,M,F,O,C,k;if(a._targets=b.length?co(b):Pr("GSAP target "+r+" not found. https://gsap.com",!ke.nullTargetWarn)||[],a._ptLookup=[],a._overwrite=h,_||c||ri(u)||ri(f)){i=a.vars;var N=i.easeReverse||i.yoyoEase;if(S=a.timeline=new xe({data:"nested",defaults:m||{},targets:g&&g.data==="nested"?g.vars.targets:b}),S.kill(),S.parent=S._dp=nt(a),S._start=0,c||ri(u)||ri(f)){if(M=b.length,C=c&&Ks(c),et(c))for(F in c)~pi.indexOf(F)&&(k||(k={}),k[F]=c[F]);for(A=0;A<M;A++)v=li(i,sa),v.stagger=0,N&&(v.easeReverse=N),k&&er(v,k),O=b[A],v.duration=+Sr(u,nt(a),A,O,b),v.delay=(+Sr(f,nt(a),A,O,b)||0)-a._delay,!c&&M===1&&v.delay&&(a._delay=f=v.delay,a._start+=f,v.delay=0),S.to(O,v,C?C(A,O,b):0),S._ease=I.none;S.duration()?u=f=0:a.timeline=0}else if(_){br(Ge(S.vars.defaults,{ease:"none"})),S._ease=Et(_.ease||i.ease||"none");var L=0,U,X,R;if(_e(_))_.forEach(function(z){return S.to(b,z,">")}),S.duration();else{v={};for(F in _)F==="ease"||F==="easeEach"||uu(F,_[F],v,_.easeEach);for(F in v)for(U=v[F].sort(function(z,q){return z.t-q.t}),L=0,A=0;A<U.length;A++)X=U[A],R={ease:X.e,duration:(X.t-(A?U[A-1].t:0))/100*u},R[F]=X.v,S.to(b,R,L),L+=R.duration;S.duration()<u&&S.to({},{duration:u-S.duration()})}}u||a.duration(u=S.duration())}else a.timeline=0;return h===!0&&!no&&(_t=nt(a),Q.killTweensOf(b),_t=0),Je(g,nt(a),o),i.reversed&&a.reverse(),i.paused&&a.paused(!0),(p||!u&&!_&&a._start===K(g._time)&&Be(p)&&Dl(nt(a))&&g.data!=="nested")&&(a._tTime=-V,a.render(Math.max(0,-f)||0)),d&&Ys(nt(a),d),a}var t=e.prototype;return t.render=function(i,o,n){var a=this._time,l=this._tDur,u=this._dur,f=i<0,p=i>l-V&&!f?l:i<V?0:i,c,h,_,m,d,g,b,S;if(!u)Vl(this,i,o,n);else if(p!==this._tTime||!i||n||!this._initted&&this._tTime||this._startAt&&this._zTime<0!==f||this._lazy){if(c=p,S=this.timeline,this._repeat){if(m=u+this._rDelay,this._repeat<-1&&f)return this.totalTime(m*100+i,o,n);if(c=K(p%m),p===l?(_=this._repeat,c=u):(d=K(p/m),_=~~d,_&&_===d?(c=u,_--):c>u&&(c=u)),g=this._yoyo&&_&1,g&&(c=u-c),d=tr(this._tTime,m),c===a&&!n&&this._initted&&_===d)return this._tTime=p,this;_!==d&&this.vars.repeatRefresh&&!g&&!this._lock&&c!==m&&this._initted&&(this._lock=n=1,this.render(K(m*_),!0).invalidate()._lock=0)}if(!this._initted){if(js(this,f?i:c,n,o,p))return this._tTime=0,this;if(a!==this._time&&!(n&&this.vars.repeatRefresh&&_!==d))return this;if(u!==this._dur)return this.render(i,o,n)}if(this._rEase){var A=c<a;if(A!==this._inv){var v=A?a:u-a;this._inv=A,this._from&&(this.ratio=1-this.ratio),this._invRatio=this.ratio,this._invTime=a,this._invRecip=v?(A?-1:1)/v:0,this._invScale=A?-this.ratio:1-this.ratio,this._invEase=A?this._rEase:this._ease}this.ratio=b=this._invRatio+this._invScale*this._invEase((c-this._invTime)*this._invRecip)}else this.ratio=b=this._ease(c/u);if(this._from&&(this.ratio=b=1-b),this._tTime=p,this._time=c,!this._act&&this._ts&&(this._act=1,this._lazy=0),!a&&p&&!o&&!d&&(Ie(this,"onStart"),this._tTime!==p))return this;for(h=this._pt;h;)h.r(b,h.d),h=h._next;S&&S.render(i<0?i:S._dur*S._ease(c/this._dur),o,n)||this._startAt&&(this._zTime=i),this._onUpdate&&!o&&(f&&eo(this,i,o,n),Ie(this,"onUpdate")),this._repeat&&_!==d&&this.vars.onRepeat&&!o&&this.parent&&Ie(this,"onRepeat"),(p===this._tDur||!p)&&this._tTime===p&&(f&&!this._onUpdate&&eo(this,i,!0,!0),(i||!u)&&(p===this._tDur&&this._ts>0||!p&&this._ts<0)&&vt(this,1),!o&&!(f&&!a)&&(p||a||g)&&(Ie(this,p===l?"onComplete":"onReverseComplete",!0),this._prom&&!(p<l&&this.timeScale()>0)&&this._prom()))}return this},t.targets=function(){return this._targets},t.invalidate=function(i){return(!i||!this.vars.runBackwards)&&(this._startAt=0),this._pt=this._op=this._onUpdate=this._lazy=this.ratio=0,this._ptLookup=[],this.timeline&&this.timeline.invalidate(i),s.prototype.invalidate.call(this,i)},t.resetTo=function(i,o,n,a,l){Cr||Me.wake(),this._ts||this.play();var u=Math.min(this._dur,(this._dp._time-this._start)*this._ts),f;return this._initted||vo(this,u),f=this._ease(u/this._dur),au(this,i,o,n,a,f,u,l)?this.resetTo(i,o,n,a,1):(_i(this,0),this.parent||Xs(this._dp,this,"_first","_last",this._dp._sort?"_start":0),this.render(0))},t.kill=function(i,o){if(o===void 0&&(o="all"),!i&&(!o||o==="all"))return this._lazy=this._pt=0,this.parent?yr(this):this.scrollTrigger&&this.scrollTrigger.kill(!!ue),this;if(this.timeline){var n=this.timeline.totalDuration();return this.timeline.killTweensOf(i,o,_t&&_t.vars.overwrite!==!0)._first||yr(this),this.parent&&n!==this.timeline.totalDuration()&&rr(this,this._dur*this.timeline._tDur/n,0,1),this}var a=this._targets,l=i?Ye(i):a,u=this._ptLookup,f=this._pt,p,c,h,_,m,d,g;if((!o||o==="all")&&Ul(a,l))return o==="all"&&(this._pt=0),yr(this);for(p=this._op=this._op||[],o!=="all"&&(ne(o)&&(m={},Se(o,function(b){return m[b]=1}),o=m),o=lu(a,o)),g=a.length;g--;)if(~l.indexOf(a[g])){c=u[g],o==="all"?(p[g]=o,_=c,h={}):(h=p[g]=p[g]||{},_=o);for(m in _)d=c&&c[m],d&&((!("kill"in d.d)||d.d.kill(m)===!0)&&di(this,d,"_pt"),delete c[m]),h!=="all"&&(h[m]=1)}return this._initted&&!this._pt&&f&&yr(this),this},e.to=function(i,o){return new e(i,o,arguments[2])},e.from=function(i,o){return Tr(1,arguments)},e.delayedCall=function(i,o,n,a){return new e(o,0,{immediateRender:!1,lazy:!1,overwrite:!1,delay:i,onComplete:o,onReverseComplete:o,onCompleteParams:n,onReverseCompleteParams:n,callbackScope:a})},e.fromTo=function(i,o,n){return Tr(2,arguments)},e.set=function(i,o){return o.duration=0,o.repeatDelay||(o.repeat=0),new e(i,o)},e.killTweensOf=function(i,o,n){return Q.killTweensOf(i,o,n)},e}(Fr);Ge(re.prototype,{_targets:[],_lazy:0,_startAt:0,_op:0,_onInit:0});Se("staggerTo,staggerFrom,staggerFromTo",function(s){re[s]=function(){var e=new xe,t=to.call(arguments,0);return t.splice(s==="staggerFromTo"?5:4,0,0),e[s].apply(e,t)}});var bo=function(e,t,r){return e[t]=r},aa=function(e,t,r){return e[t](r)},fu=function(e,t,r,i){return e[t](i.fp,r)},pu=function(e,t,r){return e.setAttribute(t,r)},gi=function(e,t){return J(e[t])?aa:mi(e[t])&&e.setAttribute?pu:bo},la=function(e,t){return t.set(t.t,t.p,Math.round((t.s+t.c*e)*1e6)/1e6,t)},cu=function(e,t){return t.set(t.t,t.p,!!(t.s+t.c*e),t)},To=function(e,t){var r=t._pt,i="";if(!e&&t.b)i=t.b;else if(e===1&&t.e)i=t.e;else{for(;r;)i=r.p+(r.m?r.m(r.s+r.c*e):Math.round((r.s+r.c*e)*1e4)/1e4)+i,r=r._next;i+=t.c}t.set(t.t,t.p,i,t)},So=function(e,t){for(var r=t._pt;r;)r.r(e,r.d),r=r._next},mu=function(e,t,r,i){for(var o=this._pt,n;o;)n=o._next,o.p===i&&o.modifier(e,t,r),o=n},hu=function(e){for(var t=this._pt,r,i;t;)i=t._next,t.p===e&&!t.op||t.op===e?di(this,t,"_pt"):t.dep||(r=1),t=i;return!r},du=function(e,t,r,i){i.mSet(e,t,i.m.call(i.tween,r,i.mt),i)},wo=function(e){for(var t=e._pt,r,i,o,n;t;){for(r=t._next,i=o;i&&i.pr>t.pr;)i=i._next;(t._prev=i?i._prev:n)?t._prev._next=t:o=t,(t._next=i)?i._prev=t:n=t,t=r}e._pt=o},we=function(){function s(t,r,i,o,n,a,l,u,f){this.t=r,this.s=o,this.c=n,this.p=i,this.r=a||la,this.d=l||this,this.set=u||bo,this.pr=f||0,this._next=t,t&&(t._prev=this)}var e=s.prototype;return e.modifier=function(r,i,o){this.mSet=this.mSet||this.set,this.set=du,this.m=r,this.mt=o,this.tween=i},s}();Se(po+"parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger,easeReverse",function(s){return fo[s]=1});Ue.TweenMax=Ue.TweenLite=re;Ue.TimelineLite=Ue.TimelineMax=xe;Q=new xe({sortChildren:!1,defaults:wr,autoRemoveChildren:!0,id:"root",smoothChildTiming:!0});ke.stringFilter=xo;var Rt=[],ni={},xu=[],Es=0,_u=0,$i=function(e){return(ni[e]||xu).map(function(t){return t()})},Or=function(){var e=Date.now(),t=[];e-Es>2&&($i("matchMediaInit"),Rt.forEach(function(r){var i=r.queries,o=r.conditions,n,a,l,u;for(a in i)n=Ze.matchMedia(i[a]).matches,n&&(l=1),n!==o[a]&&(o[a]=n,u=1);u&&(r.revert(),l&&t.push(r))}),$i("matchMediaRevert"),t.forEach(function(r){return r.onMatch(r,function(i){return r.add(null,i)})}),Es=e,$i("matchMedia"))},ua=function(){function s(t,r){this.selector=r&&ro(r),this.data=[],this._r=[],this.isReverted=!1,this.id=_u++,t&&this.add(t)}var e=s.prototype;return e.add=function(r,i,o){J(r)&&(o=i,i=r,r=J);var n=this,a=function(){var u=j,f=n.selector,p;return u&&u!==n&&u.data.push(n),o&&(n.selector=ro(o)),j=n,p=i.apply(n,arguments),J(p)&&n._r.push(p),j=u,n.selector=f,n.isReverted=!1,p};return n.last=a,r===J?a(n,function(l){return n.add(null,l)}):r?n[r]=a:a},e.ignore=function(r){var i=j;j=null,r(this),j=i},e.getTweens=function(){var r=[];return this.data.forEach(function(i){return i instanceof s?r.push.apply(r,i.getTweens()):i instanceof re&&!(i.parent&&i.parent.data==="nested")&&r.push(i)}),r},e.clear=function(){this._r.length=this.data.length=0},e.kill=function(r,i){var o=this;if(r?function(){for(var a=o.getTweens(),l=o.data.length,u;l--;)u=o.data[l],u.data==="isFlip"&&(u.revert(),u.getChildren(!0,!0,!1).forEach(function(f){return a.splice(a.indexOf(f),1)}));for(a.map(function(f){return{g:f._dur||f._delay||f._sat&&!f._sat.vars.immediateRender?f.globalTime(0):-1/0,t:f}}).sort(function(f,p){return p.g-f.g||-1/0}).forEach(function(f){return f.t.revert(r)}),l=o.data.length;l--;)u=o.data[l],u instanceof xe?u.data!=="nested"&&(u.scrollTrigger&&u.scrollTrigger.revert(),u.kill()):!(u instanceof re)&&u.revert&&u.revert(r);o._r.forEach(function(f){return f(r,o)}),o.isReverted=!0}():this.data.forEach(function(a){return a.kill&&a.kill()}),this.clear(),i){for(var n=Rt.length;n--;)Rt[n].id===this.id&&Rt.splice(n,1);this._mqs&&this._mqs.forEach(function(a){return a.removeListener?a.removeListener(Or):a.removeEventListener("change",Or)}),this._mqs=null}},e.revert=function(r){this.kill(r||{})},s}(),gu=function(){function s(t){this.contexts=[],this.scope=t,j&&j.data.push(this)}var e=s.prototype;return e.add=function(r,i,o){et(r)||(r={matches:r});var n=new ua(0,o||this.scope),a=n.conditions={},l,u,f;j&&!n.selector&&(n.selector=j.selector),this.contexts.push(n),i=n.add("onMatch",i),n.queries=r;for(u in r)u==="all"?f=1:(l=Ze.matchMedia(r[u]),l&&(Rt.indexOf(n)<0&&Rt.push(n),(a[u]=l.matches)&&(f=1),l.addListener?l.addListener(Or):l.addEventListener("change",Or),(n._mqs||(n._mqs=[])).push(l)));return f&&i(n,function(p){return n.add(null,p)}),this},e.revert=function(r){this.kill(r||{})},e.kill=function(r){this.contexts.forEach(function(i){return i.kill(r,!0)})},s}(),ci={registerPlugin:function(){for(var e=arguments.length,t=new Array(e),r=0;r<e;r++)t[r]=arguments[r];t.forEach(function(i){return ra(i)})},timeline:function(e){return new xe(e)},getTweensOf:function(e,t){return Q.getTweensOf(e,t)},getProperty:function(e,t,r,i){ne(e)&&(e=Ye(e)[0]);var o=yt(e||{}).get,n=r?Ns:Ws;return r==="native"&&(r=""),e&&(t?n((Oe[t]&&Oe[t].get||o)(e,t,r,i)):function(a,l,u){return n((Oe[a]&&Oe[a].get||o)(e,a,l,u))})},quickSetter:function(e,t,r){if(e=Ye(e),e.length>1){var i=e.map(function(f){return ge.quickSetter(f,t,r)}),o=i.length;return function(f){for(var p=o;p--;)i[p](f)}}e=e[0]||{};var n=Oe[t],a=yt(e),l=a.harness&&(a.harness.aliases||{})[t]||t,u=n?function(f){var p=new n;Jt._pt=0,p.init(e,r?f+r:f,Jt,0,[e]),p.render(1,p),Jt._pt&&So(1,Jt)}:a.set(e,l);return n?u:function(f){return u(e,l,r?f+r:f,a,1)}},quickTo:function(e,t,r){var i,o=ge.to(e,Ge((i={},i[t]="+=0.1",i.paused=!0,i.stagger=0,i),r||{})),n=function(l,u,f){return o.resetTo(t,l,u,f)};return n.tween=o,n},isTweening:function(e){return Q.getTweensOf(e,!0).length>0},defaults:function(e){return e&&e.ease&&(e.ease=Et(e.ease,wr.ease)),Fs(wr,e||{})},config:function(e){return Fs(ke,e||{})},registerEffect:function(e){var t=e.name,r=e.effect,i=e.plugins,o=e.defaults,n=e.extendTimeline;(i||"").split(",").forEach(function(a){return a&&!Oe[a]&&!Ue[a]&&Pr(t+" effect requires "+a+" plugin.")}),qi[t]=function(a,l,u){return r(Ye(a),Ge(l||{},o),u)},n&&(xe.prototype[t]=function(a,l,u){return this.add(qi[t](a,et(l)?l:(u=l)&&{},this),u)})},registerEase:function(e,t){I[e]=Et(t)},parseEase:function(e,t){return arguments.length?Et(e,t):I},getById:function(e){return Q.getById(e)},exportRoot:function(e,t){e===void 0&&(e={});var r=new xe(e),i,o;for(r.smoothChildTiming=Be(e.smoothChildTiming),Q.remove(r),r._dp=0,r._time=r._tTime=Q._time,i=Q._first;i;)o=i._next,(t||!(!i._dur&&i instanceof re&&i.vars.onComplete===i._targets[0]))&&Je(r,i,i._start-i._delay),i=o;return Je(Q,r,0),r},context:function(e,t){return e?new ua(e,t):j},matchMedia:function(e){return new gu(e)},matchMediaRefresh:function(){return Rt.forEach(function(e){var t=e.conditions,r,i;for(i in t)t[i]&&(t[i]=!1,r=1);r&&e.revert()})||Or()},addEventListener:function(e,t){var r=ni[e]||(ni[e]=[]);~r.indexOf(t)||r.push(t)},removeEventListener:function(e,t){var r=ni[e],i=r&&r.indexOf(t);i>=0&&r.splice(i,1)},utils:{wrap:$l,wrapYoyo:Kl,distribute:Ks,random:Zs,snap:Qs,normalize:Hl,getUnit:fe,clamp:Xl,splitColor:ia,toArray:Ye,selector:ro,mapRange:ea,pipe:Yl,unitize:jl,interpolate:Ql,shuffle:$s},install:Gs,effects:qi,ticker:Me,updateRoot:xe.updateRoot,plugins:Oe,globalTimeline:Q,core:{PropTween:we,globals:Ds,Tween:re,Timeline:xe,Animation:Fr,getCache:yt,_removeLinkedListItem:di,reverting:function(){return ue},context:function(e){return e&&j&&(j.data.push(e),e._ctx=j),j},suppressOverwrites:function(e){return no=e}}};Se("to,from,fromTo,delayedCall,set,killTweensOf",function(s){return ci[s]=re[s]});Me.add(xe.updateRoot);Jt=ci.to({},{duration:0});var yu=function(e,t){for(var r=e._pt;r&&r.p!==t&&r.op!==t&&r.fp!==t;)r=r._next;return r},vu=function(e,t){var r=e._targets,i,o,n;for(i in t)for(o=r.length;o--;)n=e._ptLookup[o][i],n&&(n=n.d)&&(n._pt&&(n=yu(n,i)),n&&n.modifier&&n.modifier(t[i],e,r[o],i))},Ki=function(e,t){return{name:e,headless:1,rawVars:1,init:function(i,o,n){n._onInit=function(a){var l,u;if(ne(o)&&(l={},Se(o,function(f){return l[f]=1}),o=l),t){l={};for(u in o)l[u]=t(o[u]);o=l}vu(a,o)}}}},ge=ci.registerPlugin({name:"attr",init:function(e,t,r,i,o){var n,a,l;this.tween=r;for(n in t)l=e.getAttribute(n)||"",a=this.add(e,"setAttribute",(l||0)+"",t[n],i,o,0,0,n),a.op=n,a.b=l,this._props.push(n)},render:function(e,t){for(var r=t._pt;r;)ue?r.set(r.t,r.p,r.b,r):r.r(e,r.d),r=r._next}},{name:"endArray",headless:1,init:function(e,t){for(var r=t.length;r--;)this.add(e,r,e[r]||0,t[r],0,0,0,0,0,1)}},Ki("roundProps",io),Ki("modifiers"),Ki("snap",Qs))||ci;re.version=xe.version=ge.version="3.15.1";Us=1;so()&&ir();var bu=I.Power0,Tu=I.Power1,Su=I.Power2,wu=I.Power3,Pu=I.Power4,Au=I.Linear,Cu=I.Quad,Fu=I.Cubic,Ou=I.Quart,Mu=I.Quint,Bu=I.Strong,ku=I.Elastic,Eu=I.Back,Ru=I.SteppedEase,zu=I.Bounce,Iu=I.Sine,Uu=I.Expo,Gu=I.Circ;var fa,Tt,sr,Mo,Vt,Du,pa,Bo,Lu=function(){return typeof window<"u"},ut={},Lt=180/Math.PI,ar=Math.PI/180,nr=Math.atan2,ca=1e8,ko=/([A-Z])/g,Vu=/(left|right|width|margin|padding|x)/i,Wu=/[\s,\(]\S/,tt={autoAlpha:"opacity,visibility",scale:"scaleX,scaleY",alpha:"opacity"},Ao=function(e,t){return t.set(t.t,t.p,Math.round((t.s+t.c*e)*1e4)/1e4+t.u,t)},Nu=function(e,t){return t.set(t.t,t.p,e===1?t.e:Math.round((t.s+t.c*e)*1e4)/1e4+t.u,t)},Xu=function(e,t){return t.set(t.t,t.p,e?Math.round((t.s+t.c*e)*1e4)/1e4+t.u:t.b,t)},qu=function(e,t){return t.set(t.t,t.p,e===1?t.e:e?Math.round((t.s+t.c*e)*1e4)/1e4+t.u:t.b,t)},Yu=function(e,t){var r=t.s+t.c*e;t.set(t.t,t.p,~~(r+(r<0?-.5:.5))+t.u,t)},va=function(e,t){return t.set(t.t,t.p,e?t.e:t.b,t)},ba=function(e,t){return t.set(t.t,t.p,e!==1?t.b:t.e,t)},ju=function(e,t,r){return e.style[t]=r},Hu=function(e,t,r){return e.style.setProperty(t,r)},$u=function(e,t,r){return e._gsap[t]=r},Ku=function(e,t,r){return e._gsap.scaleX=e._gsap.scaleY=r},Qu=function(e,t,r,i,o){var n=e._gsap;n.scaleX=n.scaleY=r,n.renderTransform(o,n)},Zu=function(e,t,r,i,o){var n=e._gsap;n[t]=r,n.renderTransform(o,n)},Z="transform",Ee=Z+"Origin",Ju=function s(e,t){var r=this,i=this.target,o=i.style,n=i._gsap;if(e in ut&&o){if(this.tfm=this.tfm||{},e!=="transform")e=tt[e]||e,~e.indexOf(",")?e.split(",").forEach(function(a){return r.tfm[a]=lt(i,a)}):this.tfm[e]=n.x?n[e]:lt(i,e),e===Ee&&(this.tfm.zOrigin=n.zOrigin);else return tt.transform.split(",").forEach(function(a){return s.call(r,a,t)});if(this.props.indexOf(Z)>=0)return;n.svg&&(this.svgo=i.getAttribute("data-svg-origin"),this.props.push(Ee,t,"")),e=Z}(o||t)&&this.props.push(e,t,o[e])},Ta=function(e){e.translate&&(e.removeProperty("translate"),e.removeProperty("scale"),e.removeProperty("rotate"))},ef=function(){var e=this.props,t=this.target,r=t.style,i=t._gsap,o,n;for(o=0;o<e.length;o+=3)e[o+1]?e[o+1]===2?t[e[o]](e[o+2]):t[e[o]]=e[o+2]:e[o+2]?r[e[o]]=e[o+2]:r.removeProperty(e[o].substr(0,2)==="--"?e[o]:e[o].replace(ko,"-$1").toLowerCase());if(this.tfm){for(n in this.tfm)i[n]=this.tfm[n];i.svg&&(i.renderTransform(),t.setAttribute("data-svg-origin",this.svgo||"")),o=Bo(),(!o||!o.isStart)&&!r[Z]&&(Ta(r),i.zOrigin&&r[Ee]&&(r[Ee]+=" "+i.zOrigin+"px",i.zOrigin=0,i.renderTransform()),i.uncache=1)}},Sa=function(e,t){var r={target:e,props:[],revert:ef,save:Ju};return e._gsap||ge.core.getCache(e),t&&e.style&&e.nodeType&&t.split(",").forEach(function(i){return r.save(i)}),r},wa,Co=function(e,t){var r=Tt.createElementNS?Tt.createElementNS((t||"http://www.w3.org/1999/xhtml").replace(/^https/,"http"),e):Tt.createElement(e);return r&&r.style?r:Tt.createElement(e)},De=function s(e,t,r){var i=getComputedStyle(e);return i[t]||i.getPropertyValue(t.replace(ko,"-$1").toLowerCase())||i.getPropertyValue(t)||!r&&s(e,lr(t)||t,1)||""},ma="O,Moz,ms,Ms,Webkit".split(","),lr=function(e,t,r){var i=t||Vt,o=i.style,n=5;if(e in o&&!r)return e;for(e=e.charAt(0).toUpperCase()+e.substr(1);n--&&!(ma[n]+e in o););return n<0?null:(n===3?"ms":n>=0?ma[n]:"")+e},Fo=function(){Lu()&&window.document&&(fa=window,Tt=fa.document,sr=Tt.documentElement,Vt=Co("div")||{style:{}},Du=Co("div"),Z=lr(Z),Ee=Z+"Origin",Vt.style.cssText="border-width:0;line-height:0;position:absolute;padding:0",wa=!!lr("perspective"),Bo=ge.core.reverting,Mo=1)},ha=function(e){var t=e.ownerSVGElement,r=Co("svg",t&&t.getAttribute("xmlns")||"http://www.w3.org/2000/svg"),i=e.cloneNode(!0),o;i.style.display="block",r.appendChild(i),sr.appendChild(r);try{o=i.getBBox()}catch{}return r.removeChild(i),sr.removeChild(r),o},da=function(e,t){for(var r=t.length;r--;)if(e.hasAttribute(t[r]))return e.getAttribute(t[r])},Pa=function(e){var t,r;try{t=e.getBBox()}catch{t=ha(e),r=1}return t&&(t.width||t.height)||r||(t=ha(e)),t&&!t.width&&!t.x&&!t.y?{x:+da(e,["x","cx","x1"])||0,y:+da(e,["y","cy","y1"])||0,width:0,height:0}:t},Aa=function(e){return!!(e.getCTM&&(!e.parentNode||e.ownerSVGElement)&&Pa(e))},wt=function(e,t){if(t){var r=e.style,i;t in ut&&t!==Ee&&(t=Z),r.removeProperty?(i=t.substr(0,2),(i==="ms"||t.substr(0,6)==="webkit")&&(t="-"+t),r.removeProperty(i==="--"?t:t.replace(ko,"-$1").toLowerCase())):r.removeAttribute(t)}},St=function(e,t,r,i,o,n){var a=new we(e._pt,t,r,0,1,n?ba:va);return e._pt=a,a.b=i,a.e=o,e._props.push(r),a},xa={deg:1,rad:1,turn:1},tf={grid:1,flex:1},Pt=function s(e,t,r,i){var o=parseFloat(r)||0,n=(r+"").trim().substr((o+"").length)||"px",a=Vt.style,l=Vu.test(t),u=e.tagName.toLowerCase()==="svg",f=(u?"client":"offset")+(l?"Width":"Height"),p=100,c=i==="px",h=i==="%",_,m,d,g;if(i===n||!o||xa[i]||xa[n])return o;if(n!=="px"&&!c&&(o=s(e,t,r,"px")),g=e.getCTM&&Aa(e),(h||n==="%")&&(ut[t]||~t.indexOf("adius")))return _=g?e.getBBox()[l?"width":"height"]:e[f],ee(h?o/_*p:o/100*_);if(a[l?"width":"height"]=p+(c?n:i),m=i!=="rem"&&~t.indexOf("adius")||i==="em"&&e.appendChild&&!u?e:e.parentNode,g&&(m=(e.ownerSVGElement||{}).parentNode),(!m||m===Tt||!m.appendChild)&&(m=Tt.body),d=m._gsap,d&&h&&d.width&&l&&d.time===Me.time&&!d.uncache)return ee(o/d.width*p);if(h&&(t==="height"||t==="width")){var b=e.style[t];e.style[t]=p+i,_=e[f],b?e.style[t]=b:wt(e,t)}else(h||n==="%")&&!tf[De(m,"display")]&&(a.position=De(e,"position")),m===e&&(a.position="static"),m.appendChild(Vt),_=Vt[f],m.removeChild(Vt),a.position="absolute";return l&&h&&(d=yt(m),d.time=Me.time,d.width=m[f]),ee(c?_*o/p:_&&o?p/_*o:0)},lt=function(e,t,r,i){var o;return Mo||Fo(),t in tt&&t!=="transform"&&(t=tt[t],~t.indexOf(",")&&(t=t.split(",")[0])),ut[t]&&t!=="transform"?(o=Er(e,i),o=t!=="transformOrigin"?o[t]:o.svg?o.origin:vi(De(e,Ee))+" "+o.zOrigin+"px"):(o=e.style[t],(!o||o==="auto"||i||~(o+"").indexOf("calc("))&&(o=yi[t]&&yi[t](e,t,r)||De(e,t)||mo(e,t)||(t==="opacity"?1:0))),r&&!~(o+"").trim().indexOf(" ")?Pt(e,t,o,r)+r:o},rf=function(e,t,r,i){if(!r||r==="none"){var o=lr(t,e,1),n=o&&De(e,o,1);n&&n!==r?(t=o,r=n):t==="borderColor"&&(r=De(e,"borderTopColor"))}var a=new we(this._pt,e.style,t,0,1,To),l=0,u=0,f,p,c,h,_,m,d,g,b,S,A,v;if(a.b=r,a.e=i,r+="",i+="",i.substring(0,6)==="var(--"&&(i=De(e,i.substring(4,i.indexOf(")")))),i==="auto"&&(m=e.style[t],e.style[t]=i,i=De(e,t)||i,m?e.style[t]=m:wt(e,t)),f=[r,i],xo(f),r=f[0],i=f[1],c=r.match(zt)||[],v=i.match(zt)||[],v.length){for(;p=zt.exec(i);)d=p[0],b=i.substring(l,p.index),_?_=(_+1)%5:(b.substr(-5)==="rgba("||b.substr(-5)==="hsla(")&&(_=1),d!==(m=c[u++]||"")&&(h=parseFloat(m)||0,A=m.substr((h+"").length),d.charAt(1)==="="&&(d=It(h,d)+A),g=parseFloat(d),S=d.substr((g+"").length),l=zt.lastIndex-S.length,S||(S=S||ke.units[t]||A,l===i.length&&(i+=S,a.e+=S)),A!==S&&(h=Pt(e,t,m,S)||0),a._pt={_next:a._pt,p:b||u===1?b:",",s:h,c:g-h,m:_&&_<4||t==="zIndex"?Math.round:0});a.c=l<i.length?i.substring(l,i.length):""}else a.r=t==="display"&&i==="none"?ba:va;return lo.test(i)&&(a.e=0),this._pt=a,a},_a={top:"0%",bottom:"100%",left:"0%",right:"100%",center:"50%"},of=function(e){var t=e.split(" "),r=t[0],i=t[1]||"50%";return(r==="top"||r==="bottom"||i==="left"||i==="right")&&(e=r,r=i,i=e),t[0]=_a[r]||r,t[1]=_a[i]||i,t.join(" ")},nf=function(e,t){if(t.tween&&t.tween._time===t.tween._dur){var r=t.t,i=r.style,o=t.u,n=r._gsap,a,l,u;if(o==="all"||o===!0)i.cssText="",l=1;else for(o=o.split(","),u=o.length;--u>-1;)a=o[u],ut[a]&&(l=1,a=a==="transformOrigin"?Ee:Z),wt(r,a);l&&(wt(r,Z),n&&(n.svg&&r.removeAttribute("transform"),i.scale=i.rotate=i.translate="none",Er(r,1),n.uncache=1,Ta(i)))}},yi={clearProps:function(e,t,r,i,o){if(o.data!=="isFromStart"){var n=e._pt=new we(e._pt,t,r,0,0,nf);return n.u=i,n.pr=-10,n.tween=o,e._props.push(r),1}}},kr=[1,0,0,1,0,0],Ca={},Fa=function(e){return e==="matrix(1, 0, 0, 1, 0, 0)"||e==="none"||!e},ga=function(e){var t=De(e,Z);return Fa(t)?kr:t.substr(7).match(ao).map(ee)},Eo=function(e,t){var r=e._gsap||yt(e),i=e.style,o=ga(e),n,a,l,u;return r.svg&&e.getAttribute("transform")?(l=e.transform.baseVal.consolidate().matrix,o=[l.a,l.b,l.c,l.d,l.e,l.f],o.join(",")==="1,0,0,1,0,0"?kr:o):(o===kr&&!e.offsetParent&&e!==sr&&!r.svg&&(l=i.display,i.display="block",n=e.parentNode,(!n||!e.offsetParent&&!e.getBoundingClientRect().width)&&(u=1,a=e.nextElementSibling,sr.appendChild(e)),o=ga(e),l?i.display=l:wt(e,"display"),u&&(a?n.insertBefore(e,a):n?n.appendChild(e):sr.removeChild(e))),t&&o.length>6?[o[0],o[1],o[4],o[5],o[12],o[13]]:o)},Oo=function(e,t,r,i,o,n){var a=e._gsap,l=o||Eo(e,!0),u=a.xOrigin||0,f=a.yOrigin||0,p=a.xOffset||0,c=a.yOffset||0,h=l[0],_=l[1],m=l[2],d=l[3],g=l[4],b=l[5],S=t.split(" "),A=parseFloat(S[0])||0,v=parseFloat(S[1])||0,M,F,O,C;r?l!==kr&&(F=h*d-_*m)&&(O=A*(d/F)+v*(-m/F)+(m*b-d*g)/F,C=A*(-_/F)+v*(h/F)-(h*b-_*g)/F,A=O,v=C):(M=Pa(e),A=M.x+(~S[0].indexOf("%")?A/100*M.width:A),v=M.y+(~(S[1]||S[0]).indexOf("%")?v/100*M.height:v)),i||i!==!1&&a.smooth?(g=A-u,b=v-f,a.xOffset=p+(g*h+b*m)-g,a.yOffset=c+(g*_+b*d)-b):a.xOffset=a.yOffset=0,a.xOrigin=A,a.yOrigin=v,a.smooth=!!i,a.origin=t,a.originIsAbsolute=!!r,e.style[Ee]="0px 0px",n&&(St(n,a,"xOrigin",u,A),St(n,a,"yOrigin",f,v),St(n,a,"xOffset",p,a.xOffset),St(n,a,"yOffset",c,a.yOffset)),e.setAttribute("data-svg-origin",A+" "+v)},Er=function(e,t){var r=e._gsap||new _o(e);if("x"in r&&!t&&!r.uncache)return r;var i=e.style,o=r.scaleX<0,n="px",a="deg",l=getComputedStyle(e),u=De(e,Ee)||"0",f,p,c,h,_,m,d,g,b,S,A,v,M,F,O,C,k,N,L,U,X,R,z,q,se,He,At,ft,D,ye,ve,$e;return f=p=c=m=d=g=b=S=A=0,h=_=1,r.svg=!!(e.getCTM&&Aa(e)),l.translate&&((l.translate!=="none"||l.scale!=="none"||l.rotate!=="none")&&(i[Z]=(l.translate!=="none"?"translate3d("+(l.translate+" 0 0").split(" ").slice(0,3).join(", ")+") ":"")+(l.rotate!=="none"?"rotate("+l.rotate+") ":"")+(l.scale!=="none"?"scale("+l.scale.split(" ").join(",")+") ":"")+(l[Z]!=="none"?l[Z]:"")),i.scale=i.rotate=i.translate="none"),F=Eo(e,r.svg),r.svg&&(r.uncache?(se=e.getBBox(),u=r.xOrigin-se.x+"px "+(r.yOrigin-se.y)+"px",q=""):q=!t&&e.getAttribute("data-svg-origin"),Oo(e,q||u,!!q||r.originIsAbsolute,r.smooth!==!1,F)),v=r.xOrigin||0,M=r.yOrigin||0,F!==kr&&(N=F[0],L=F[1],U=F[2],X=F[3],f=R=F[4],p=z=F[5],F.length===6?(h=Math.sqrt(N*N+L*L),_=Math.sqrt(X*X+U*U),m=N||L?nr(L,N)*Lt:0,b=U||X?nr(U,X)*Lt+m:0,b&&(_*=Math.abs(Math.cos(b*ar))),r.svg&&(f-=v-(v*N+M*U),p-=M-(v*L+M*X))):($e=F[6],ye=F[7],At=F[8],ft=F[9],D=F[10],ve=F[11],f=F[12],p=F[13],c=F[14],O=nr($e,D),d=O*Lt,O&&(C=Math.cos(-O),k=Math.sin(-O),q=R*C+At*k,se=z*C+ft*k,He=$e*C+D*k,At=R*-k+At*C,ft=z*-k+ft*C,D=$e*-k+D*C,ve=ye*-k+ve*C,R=q,z=se,$e=He),O=nr(-U,D),g=O*Lt,O&&(C=Math.cos(-O),k=Math.sin(-O),q=N*C-At*k,se=L*C-ft*k,He=U*C-D*k,ve=X*k+ve*C,N=q,L=se,U=He),O=nr(L,N),m=O*Lt,O&&(C=Math.cos(O),k=Math.sin(O),q=N*C+L*k,se=R*C+z*k,L=L*C-N*k,z=z*C-R*k,N=q,R=se),d&&Math.abs(d)+Math.abs(m)>359.9&&(d=m=0,g=180-g),h=ee(Math.sqrt(N*N+L*L+U*U)),_=ee(Math.sqrt(z*z+$e*$e)),O=nr(R,z),b=Math.abs(O)>2e-4?O*Lt:0,A=ve?1/(ve<0?-ve:ve):0),r.svg&&(q=e.getAttribute("transform"),r.forceCSS=e.setAttribute("transform","")||!Fa(De(e,Z)),q&&e.setAttribute("transform",q))),Math.abs(b)>90&&Math.abs(b)<270&&(o?(h*=-1,b+=m<=0?180:-180,m+=m<=0?180:-180):(_*=-1,b+=b<=0?180:-180)),t=t||r.uncache,r.x=f-((r.xPercent=f&&(!t&&r.xPercent||(Math.round(e.offsetWidth/2)===Math.round(-f)?-50:0)))?e.offsetWidth*r.xPercent/100:0)+n,r.y=p-((r.yPercent=p&&(!t&&r.yPercent||(Math.round(e.offsetHeight/2)===Math.round(-p)?-50:0)))?e.offsetHeight*r.yPercent/100:0)+n,r.z=c+n,r.scaleX=ee(h),r.scaleY=ee(_),r.rotation=ee(m)+a,r.rotationX=ee(d)+a,r.rotationY=ee(g)+a,r.skewX=b+a,r.skewY=S+a,r.transformPerspective=A+n,(r.zOrigin=parseFloat(u.split(" ")[2])||!t&&r.zOrigin||0)&&(i[Ee]=vi(u)),r.xOffset=r.yOffset=0,r.force3D=ke.force3D,r.renderTransform=r.svg?af:wa?Oa:sf,r.uncache=0,r},vi=function(e){return(e=e.split(" "))[0]+" "+e[1]},Po=function(e,t,r){var i=fe(t);return ee(parseFloat(t)+parseFloat(Pt(e,"x",r+"px",i)))+i},sf=function(e,t){t.z="0px",t.rotationY=t.rotationX="0deg",t.force3D=0,Oa(e,t)},Gt="0deg",Br="0px",Dt=") ",Oa=function(e,t){var r=t||this,i=r.xPercent,o=r.yPercent,n=r.x,a=r.y,l=r.z,u=r.rotation,f=r.rotationY,p=r.rotationX,c=r.skewX,h=r.skewY,_=r.scaleX,m=r.scaleY,d=r.transformPerspective,g=r.force3D,b=r.target,S=r.zOrigin,A="",v=g==="auto"&&e&&e!==1||g===!0;if(S&&(p!==Gt||f!==Gt)){var M=parseFloat(f)*ar,F=Math.sin(M),O=Math.cos(M),C;M=parseFloat(p)*ar,C=Math.cos(M),n=Po(b,n,F*C*-S),a=Po(b,a,-Math.sin(M)*-S),l=Po(b,l,O*C*-S+S)}d!==Br&&(A+="perspective("+d+Dt),(i||o)&&(A+="translate("+i+"%, "+o+"%) "),(v||n!==Br||a!==Br||l!==Br)&&(A+=l!==Br||v?"translate3d("+n+", "+a+", "+l+") ":"translate("+n+", "+a+Dt),u!==Gt&&(A+="rotate("+u+Dt),f!==Gt&&(A+="rotateY("+f+Dt),p!==Gt&&(A+="rotateX("+p+Dt),(c!==Gt||h!==Gt)&&(A+="skew("+c+", "+h+Dt),(_!==1||m!==1)&&(A+="scale("+_+", "+m+Dt),b.style[Z]=A||"translate(0, 0)"},af=function(e,t){var r=t||this,i=r.xPercent,o=r.yPercent,n=r.x,a=r.y,l=r.rotation,u=r.skewX,f=r.skewY,p=r.scaleX,c=r.scaleY,h=r.target,_=r.xOrigin,m=r.yOrigin,d=r.xOffset,g=r.yOffset,b=r.forceCSS,S=parseFloat(n),A=parseFloat(a),v,M,F,O,C;l=parseFloat(l),u=parseFloat(u),f=parseFloat(f),f&&(f=parseFloat(f),u+=f,l+=f),l||u?(l*=ar,u*=ar,v=Math.cos(l)*p,M=Math.sin(l)*p,F=Math.sin(l-u)*-c,O=Math.cos(l-u)*c,u&&(f*=ar,C=Math.tan(u-f),C=Math.sqrt(1+C*C),F*=C,O*=C,f&&(C=Math.tan(f),C=Math.sqrt(1+C*C),v*=C,M*=C)),v=ee(v),M=ee(M),F=ee(F),O=ee(O)):(v=p,O=c,M=F=0),(S&&!~(n+"").indexOf("px")||A&&!~(a+"").indexOf("px"))&&(S=Pt(h,"x",n,"px"),A=Pt(h,"y",a,"px")),(_||m||d||g)&&(S=ee(S+_-(_*v+m*F)+d),A=ee(A+m-(_*M+m*O)+g)),(i||o)&&(C=h.getBBox(),S=ee(S+i/100*C.width),A=ee(A+o/100*C.height)),C="matrix("+v+","+M+","+F+","+O+","+S+","+A+")",h.setAttribute("transform",C),b&&(h.style[Z]=C)},lf=function(e,t,r,i,o){var n=360,a=ne(o),l=parseFloat(o)*(a&&~o.indexOf("rad")?Lt:1),u=l-i,f=i+u+"deg",p,c;return a&&(p=o.split("_")[1],p==="short"&&(u%=n,u!==u%(n/2)&&(u+=u<0?n:-n)),p==="cw"&&u<0?u=(u+n*ca)%n-~~(u/n)*n:p==="ccw"&&u>0&&(u=(u-n*ca)%n-~~(u/n)*n)),e._pt=c=new we(e._pt,t,r,i,u,Nu),c.e=f,c.u="deg",e._props.push(r),c},ya=function(e,t){for(var r in t)e[r]=t[r];return e},uf=function(e,t,r){var i=ya({},r._gsap),o="perspective,force3D,transformOrigin,svgOrigin",n=r.style,a,l,u,f,p,c,h,_;i.svg?(u=r.getAttribute("transform"),r.setAttribute("transform",""),n[Z]=t,a=Er(r,1),wt(r,Z),r.setAttribute("transform",u)):(u=getComputedStyle(r)[Z],n[Z]=t,a=Er(r,1),n[Z]=u);for(l in ut)u=i[l],f=a[l],u!==f&&o.indexOf(l)<0&&(h=fe(u),_=fe(f),p=h!==_?Pt(r,l,u,_):parseFloat(u),c=parseFloat(f),e._pt=new we(e._pt,a,l,p,c-p,Ao),e._pt.u=_||0,e._props.push(l));ya(a,i)};Se("padding,margin,Width,Radius",function(s,e){var t="Top",r="Right",i="Bottom",o="Left",n=(e<3?[t,r,i,o]:[t+o,t+r,i+r,i+o]).map(function(a){return e<2?s+a:"border"+a+s});yi[e>1?"border"+s:s]=function(a,l,u,f,p){var c,h;if(arguments.length<4)return c=n.map(function(_){return lt(a,_,u)}),h=c.join(" "),h.split(c[0]).length===5?c[0]:h;c=(f+"").split(" "),h={},n.forEach(function(_,m){return h[_]=c[m]=c[m]||c[(m-1)/2|0]}),a.init(l,h,p)}});var Ro={name:"css",register:Fo,targetTest:function(e){return e.style&&e.nodeType},init:function(e,t,r,i,o){var n=this._props,a=e.style,l=r.vars.startAt,u,f,p,c,h,_,m,d,g,b,S,A,v,M,F,O,C;Mo||Fo(),this.styles=this.styles||Sa(e),O=this.styles.props,this.tween=r;for(m in t)if(m!=="autoRound"&&(f=t[m],!(Oe[m]&&yo(m,t,r,i,e,o)))){if(h=typeof f,_=yi[m],h==="function"&&(f=f.call(r,i,e,o),h=typeof f),h==="string"&&~f.indexOf("random(")&&(f=or(f)),_)_(this,e,m,f,r)&&(F=1);else if(m.substr(0,2)==="--")u=(getComputedStyle(e).getPropertyValue(m)+"").trim(),f+="",st.lastIndex=0,st.test(u)||(d=fe(u),g=fe(f),g?d!==g&&(u=Pt(e,m,u,g)+g):d&&(f+=d)),this.add(a,"setProperty",u,f,i,o,0,0,m),n.push(m),O.push(m,0,a[m]);else if(h!=="undefined"){if(l&&m in l?(u=typeof l[m]=="function"?l[m].call(r,i,e,o):l[m],ne(u)&&~u.indexOf("random(")&&(u=or(u)),fe(u+"")||u==="auto"||(u+=ke.units[m]||fe(lt(e,m))||""),(u+"").charAt(1)==="="&&(u=lt(e,m))):u=lt(e,m),c=parseFloat(u),b=h==="string"&&f.charAt(1)==="="&&f.substr(0,2),b&&(f=f.substr(2)),p=parseFloat(f),m in tt&&(m==="autoAlpha"&&(c===1&&lt(e,"visibility")==="hidden"&&p&&(c=0),O.push("visibility",0,a.visibility),St(this,a,"visibility",c?"inherit":"hidden",p?"inherit":"hidden",!p)),m!=="scale"&&m!=="transform"&&(m=tt[m],~m.indexOf(",")&&(m=m.split(",")[0]))),S=m in ut,S){if(this.styles.save(m),C=f,h==="string"&&f.substring(0,6)==="var(--"){if(f=De(e,f.substring(4,f.indexOf(")"))),f.substring(0,5)==="calc("){var k=e.style.perspective;e.style.perspective=f,f=De(e,"perspective"),k?e.style.perspective=k:wt(e,"perspective")}p=parseFloat(f)}if(A||(v=e._gsap,v.renderTransform&&!t.parseTransform||Er(e,t.parseTransform),M=t.smoothOrigin!==!1&&v.smooth,A=this._pt=new we(this._pt,a,Z,0,1,v.renderTransform,v,0,-1),A.dep=1),m==="scale")this._pt=new we(this._pt,v,"scaleY",v.scaleY,(b?It(v.scaleY,b+p):p)-v.scaleY||0,Ao),this._pt.u=0,n.push("scaleY",m),m+="X";else if(m==="transformOrigin"){O.push(Ee,0,a[Ee]),f=of(f),v.svg?Oo(e,f,0,M,0,this):(g=parseFloat(f.split(" ")[2])||0,g!==v.zOrigin&&St(this,v,"zOrigin",v.zOrigin,g),St(this,a,m,vi(u),vi(f)));continue}else if(m==="svgOrigin"){Oo(e,f,1,M,0,this);continue}else if(m in Ca){lf(this,v,m,c,b?It(c,b+f):f);continue}else if(m==="smoothOrigin"){St(this,v,"smooth",v.smooth,f);continue}else if(m==="force3D"){v[m]=f;continue}else if(m==="transform"){uf(this,f,e);continue}}else m in a||(m=lr(m)||m);if(S||(p||p===0)&&(c||c===0)&&!Wu.test(f)&&m in a)d=(u+"").substr((c+"").length),p||(p=0),g=fe(f)||(m in ke.units?ke.units[m]:d),d!==g&&(c=Pt(e,m,u,g)),this._pt=new we(this._pt,S?v:a,m,c,(b?It(c,b+p):p)-c,!S&&(g==="px"||m==="zIndex")&&t.autoRound!==!1?Yu:Ao),this._pt.u=g||0,S&&C!==f?(this._pt.b=u,this._pt.e=C,this._pt.r=qu):d!==g&&g!=="%"&&(this._pt.b=u,this._pt.r=Xu);else if(m in a)rf.call(this,e,m,u,b?b+f:f);else if(m in e)this.add(e,m,u||e[m],b?b+f:f,i,o);else if(m!=="parseTransform"){hi(m,f);continue}S||(m in a?O.push(m,0,a[m]):typeof e[m]=="function"?O.push(m,2,e[m]()):O.push(m,1,u||e[m])),n.push(m)}}F&&wo(this)},render:function(e,t){if(t.tween._time||!Bo())for(var r=t._pt;r;)r.r(e,r.d),r=r._next;else t.styles.revert()},get:lt,aliases:tt,getSetter:function(e,t,r){var i=tt[t];return i&&i.indexOf(",")<0&&(t=i),t in ut&&t!==Ee&&(e._gsap.x||lt(e,"x"))?r&&pa===r?t==="scale"?Ku:$u:(pa=r||{})&&(t==="scale"?Qu:Zu):e.style&&!mi(e.style[t])?ju:~t.indexOf("-")?Hu:gi(e,t)},core:{_removeProperty:wt,_getMatrix:Eo}};ge.utils.checkPrefix=lr;ge.core.getStyleSaver=Sa;(function(s,e,t,r){var i=Se(s+","+e+","+t,function(o){ut[o]=1});Se(e,function(o){ke.units[o]="deg",Ca[o]=1}),tt[i[13]]=s+","+e,Se(r,function(o){var n=o.split(":");tt[n[1]]=i[n[0]]})})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent","rotation,rotationX,rotationY,skewX,skewY","transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective","0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");Se("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective",function(s){ke.units[s]="px"});ge.registerPlugin(Ro);var te=ge.registerPlugin(Ro)||ge,k0=te.core.Tween;var je="/grundschulmax/lobby/",E=(s,e)=>s+Math.random()*(e-s),zo={schueler:{fx:.5,sky:.3,birds:1,clouds:1,petals:1,ground:.86},astro:{fx:.5,sky:.45,rockets:1,ground:.86},fuss:{fx:.5,sky:.25,birds:1,clouds:1,ground:.86},polizei:{fx:.5,sky:.3,birds:1,clouds:1,ground:.88},feuer:{fx:.5,sky:.3,birds:1,clouds:1,ground:.9},arzt:{fx:.5,sky:.3,birds:1,clouds:1,ground:.9},forsch:{fx:.45,sky:.25,birds:1,fireflies:1,ground:.9},koch:{fx:.5,sky:.3,birds:1,clouds:1,ground:.92},kunst:{fx:.4,sky:.4,birds:1,clouds:1,petals:1,ground:.9},pilot:{fx:.55,sky:.35,planes:1,clouds:1,ground:.93}};async function G0(s,e){dt.setPreferences({preferWorkers:!1,preferCreateImageBitmap:!1});let t=new qr;await t.init({resizeTo:s,backgroundAlpha:0,antialias:!0,resolution:Math.min(window.devicePixelRatio||1,2),autoDensity:!0,preference:"webgl",powerPreference:"high-performance"}),s.appendChild(t.canvas);let r=e.eyes||{},i={},o=async(x,y)=>i[x]=i[x]||await dt.load(y),n=(x,y)=>o(x,y).catch(()=>null);await Promise.all(["platform","bit-w","bit-r","cloud0","cloud1","cloud2","cloud3","plane","rocket"].map(x=>o(x,je+"img/"+x+".webp")));let a=new le;t.stage.addChild(a);let l=new le,u=new le,f=new le,p=new le,c=new le,h=new le;a.addChild(l,u,f,p,c),t.stage.addChild(h);let _=new _r;l.filters=[_];let m={n:0,e:0},d=0,g=0,b=!1,S=null,A={job:"",kid:""},v=()=>zo[A.job]||zo.schueler;async function M(x){let y=await n("w-"+x,je+"w/"+x+".webp");y||(x="schueler",y=await o("w-schueler",je+"w/schueler.webp"));let[P,T]=await Promise.all([n("w-"+x+"n",je+"w/"+x+"-n.webp"),n("w-"+x+"d",je+"w/"+x+"-d.webp")]),w=new le,G=new be(y),$=P?new be(P):null,ie=T?new be(T):null;w.addChild(G),$&&($.alpha=m.n,w.addChild($));let Qe=null;return ie&&(ie.renderable=!1,Qe=new gr({sprite:ie,scale:0}),w.filters=[Qe]),{c:w,day:G,night:$,depth:ie,f:Qe,job:x,tw:y.width,th:y.height,k:1,ox:0,oy:0}}function F(x){if(!x)return;let y=Math.max(d/x.tw,g/x.th)*1.04,P=(zo[x.job]||{}).fx??.5,T=Math.min(0,Math.max(d-x.tw*y,d/2-P*x.tw*y)),w=(g-x.th*y)/2;x.k=y,x.ox=T,x.oy=w;for(let G of[x.day,x.night])G&&(G.scale.set(y),G.position.set(T,w));x.depth&&(x.depth.scale.set(x.tw*y/x.depth.texture.width),x.depth.position.set(T,w))}async function O(x,y){let P=await M(x),T=S;S=P,l.addChild(P.c),P.depth&&l.addChild(P.depth),F(P),Ci(),Ra();let w=()=>{T&&(T.c.destroy(),T.depth&&T.depth.destroy())};y&&T?(P.c.alpha=0,te.to(P.c,{alpha:1,duration:.5,onComplete:w})):w()}let C=new de;C.filters=[new xt({strength:12,quality:3})],f.addChild(C);let k=new be(i.platform);k.anchor.set(.5,.36),f.addChild(k);let N=new de;N.blendMode="add",f.addChild(N);let L=new de;L.filters=[new xt({strength:3,quality:2})],f.addChild(L);let U=new de;U.filters=[new xt({strength:3})],f.addChild(U),U.visible=!1;let X=new le;p.addChild(X);let R=new le;X.addChild(R);let z=new be;z.anchor.set(.5,1),R.addChild(z);let q=new Ni({color:16773320,alpha:.45,blur:1.2,offset:{x:-3,y:-2},quality:3});z.filters=[q];let se=new le;R.addChild(se);let He=[];function At(x){se.removeChildren().forEach(G=>G.destroy()),He=[];let y=r[x];if(!y)return;let P=y.skin[0]<<16|y.skin[1]<<8|y.skin[2],T=z.texture.width,w=z.texture.height;for(let[G,$,ie,Qe]of y.eyes){let pt=ie*T*1.25,Re=Qe*w*1.3,pe=new de;pe.ellipse(0,Re/2,pt/2,Re/2).fill(P),pe.moveTo(-pt*.45,Re*.92).quadraticCurveTo(0,Re*1.12,pt*.45,Re*.92).stroke({width:Math.max(2,Re*.1),color:3810328,alpha:.85,cap:"round"}),pe.position.set((G-.5)*T,($-1)*w-Re/2),pe.scale.y=0,se.addChild(pe),He.push(pe)}}function ft(x){if(!He.length)return;let y=He.map(T=>T.scale),P=te.timeline();P.to(y,{y:1,duration:.07,ease:"power2.in"}).to(y,{y:0,duration:.11,ease:"power2.out"}),x&&P.to(y,{y:1,duration:.07,delay:.08}).to(y,{y:0,duration:.11})}(function x(){te.delayedCall(E(2.2,5.5),()=>{ft(Math.random()<.18),x()})})();let D=new le;p.addChild(D);let ye=new be;ye.anchor.set(.5,1),D.addChild(ye),D.visible=!1;let ve=null;async function $e(x){if(!x){D.visible=U.visible=!1;return}let[y,P]=await Promise.all([n("p-"+x,je+"pets/"+x+"-sit.webp"),n("pj-"+x,je+"pets/"+x+"-jump.webp")]);if(!y){D.visible=U.visible=!1;return}ve={s:y,j:P||y},ye.texture=y,D.visible=U.visible=!0,Ti(),te.fromTo(D.scale,{x:0,y:0},{x:1,y:1,duration:.5,ease:"back.out(2)"})}function bi(x){D.visible&&(ve&&(ye.texture=ve.j),te.timeline().to(D,{y:D._y-g*(x?.1:.05),duration:.22,ease:"power2.out"}).to(D,{y:D._y,duration:.2,ease:"power2.in",onComplete:()=>ve&&(ye.texture=ve.s)}).to(D.scale,{x:1.08,y:.9,duration:.07}).to(D.scale,{x:1,y:1,duration:.3,ease:"elastic.out(1,0.5)"}))}let rt=1,Pe=0,Ae=0,Ce=0,ur=()=>(z.texture.height||900)*rt;async function Rr(x,y,P){let T=x+"-"+y,w=await o("f-"+T,je+"fig/"+T+".webp");z.texture=w,At(T),A.kid=x,Ti(),P&&(R.scale.set(.2),te.to(R.scale,{x:1,y:1,duration:.5,ease:"back.out(2.2)"}),Ct(24))}function Ti(){let x=e.safeBottom?e.safeBottom(d,g):0,y=e.safeTop?e.safeTop(d,g):0;Pe=d/2,Ae=Math.min(g*(v().ground||.86),g-x);let P=Math.min(g*(b?.34:.44),Ae-y-g*.04);rt=P/(z.texture.height||900),X.position.set(Pe,Ae),z.scale.set(rt),se.scale.set(rt);let T=(z.texture.width||400)*rt;Ce=Math.min(d*.42,T*1.75),k.scale.set(Ce/k.texture.width),k.position.set(Pe,Ae),C.clear().ellipse(0,0,Ce*.62,Ce*.17).fill({color:1707008,alpha:.34}),C.position.set(Pe+Ce*.12,Ae+Ce*.13),L.clear().ellipse(0,0,T*.36,Ce*.045).fill({color:0,alpha:.42}),L.position.set(Pe+3,Ae);let w=P*.36;ye.texture&&ye.texture.height>1&&ye.scale.set(w/ye.texture.height),D._y=Ae,D.position.set(Pe+Ce*.33,D._y),U.clear().ellipse(0,0,w*.5,w*.1).fill({color:0,alpha:.35}),U.position.set(Pe+Ce*.33+2,D._y),q.offset={x:-Math.max(2,rt*6),y:-Math.max(1,rt*4)}}function Ma(x,y,P){let T=new de,w=E(.6,1.1)*Math.max(6,d*.006),G=E(0,6),$=()=>{G+=.35;let ie=.2+Math.abs(Math.sin(G))*.8;T.clear().moveTo(-w,-w*ie).quadraticCurveTo(-w*.4,-w*.2,0,0).quadraticCurveTo(w*.4,-w*.2,w,-w*ie).stroke({width:Math.max(1.5,w*.28),color:2763322,alpha:.8,cap:"round",join:"round"})};T.position.set(x,y),u.addChild(T),t.ticker.add($),te.to(T,{x:P>0?d+60:-60,y:y+E(-g*.05,g*.05),duration:E(10,16),ease:"none",onComplete:()=>{t.ticker.remove($),T.destroy()}})}function Ba(){let x=v();if(!x.birds||m.n>.6||!t.ticker.started)return;let y=Math.random()<.5?1:-1,P=g*x.sky*E(.25,.8),T=Math.floor(E(3,6));for(let w=0;w<T;w++)Ma((y>0?-40:d+40)-y*w*E(18,30),P+E(-14,14)+w%2*10,y)}function Io(x){let y=v();if(!y.clouds||!t.ticker.started)return;let P=i["cloud"+Math.floor(E(0,3))],T=new be(P);T.anchor.set(.5),T.scale.set(d*E(.08,.15)/P.width),T.alpha=m.n>.5?.22:E(.7,.92);let w=Math.random()<.5?1:-1,G=g*y.sky*E(.12,.65);T.position.set(x?E(0,d):w>0?-d*.1:d*1.1,G),u.addChild(T),te.to(T,{x:w>0?d*1.15:-d*.15,duration:E(45,70)*(x?.6:1),ease:"none",onComplete:()=>T.destroy()})}function Uo(x){if(!t.ticker.started)return;let y=x==="rocket"?i.rocket:i.plane,P=new be(y);P.anchor.set(.5);let T=Math.random()<.5?1:-1,w=d*(x==="rocket"?.04:.05);P.scale.set(w/y.width),x!=="rocket"?P.scale.x*=-T:P.rotation=T*.9;let G=g*v().sky*E(.2,.6);P.position.set(T>0?-60:d+60,G+(x==="rocket"?g*.2:0)),u.addChild(P),te.to(P,{x:T>0?d+80:-80,y:G-g*.08,duration:E(9,14),ease:"none",onComplete:()=>P.destroy()})}function ka(){if(!v().petals||m.n>.6||!t.ticker.started)return;let x=new de().ellipse(0,0,E(3,5),E(1.6,2.6)).fill([16757713,16777215,16769658][Math.floor(E(0,3))]);x.alpha=.85,x.position.set(E(-d*.1,d*.6),E(-20,g*.2)),c.addChild(x),te.to(x,{x:x.x+d*E(.3,.6),y:g*E(.7,1.05),rotation:E(-6,6),duration:E(9,15),ease:"sine.inOut",onComplete:()=>x.destroy()})}function Ea(){if(m.n<.6||!t.ticker.started)return;let x=new de,y=d*.08;x.moveTo(0,0).lineTo(-y,-y*.35).stroke({width:2.5,color:16777215,alpha:.9,cap:"round"}),x.blendMode="add";let P=E(d*.3,d),T=E(0,g*v().sky*.6);x.position.set(P,T),x.alpha=0,u.addChild(x),te.timeline({onComplete:()=>x.destroy()}).to(x,{alpha:1,duration:.15}).to(x,{x:P-d*.25,y:T+d*.09,duration:.9,ease:"power1.in"},0).to(x,{alpha:0,duration:.3},.6)}let zr=[];function Ra(){zr.forEach(P=>P.g.destroy()),zr.length=0;let x=v(),y=x.fireflies?26:14;for(let P=0;P<y;P++){let T=new de().circle(0,0,E(1,x.fireflies?2.8:2)).fill(x.fireflies?14286714:16777215);T.blendMode="add",c.addChild(T),zr.push({g:T,x:E(0,1),y:E(.35,.95),sp:E(.02,.06),ph:E(0,6.3),ff:!!x.fireflies})}}setInterval(()=>Io(),9e3),setInterval(Ba,14e3),setInterval(ka,1400),setInterval(Ea,9e3),setInterval(()=>{let x=v();x.planes?Uo("plane"):x.rockets&&Uo("rocket")},16e3);let Si=!1;function Go(){if(Si||!t.ticker.started)return;Si=!0;let x=Math.random()<.5?1:-1,y=ur()*.36,P=Ae+Ce*.06,T=new be(i["bit-r"]);T.anchor.set(.5,1);let w=y/i["bit-r"].height,G=()=>{T.texture=i["bit-r"],T.scale.set(w*-x,w)};G();let $=Pe-x*Math.min(d*.42,Math.max(d*.24,Ce*.75+y*.6));T.position.set(x>0?-y:d+y,P),p.addChild(T),te.timeline({onComplete:()=>{T.destroy(),Si=!1}}).to(T,{x:$,duration:2.4,ease:"power2.out"}).add(()=>{T.texture=i["bit-w"];let ie=y/i["bit-w"].height;T.scale.set(ie,ie),e.onBit&&e.onBit()}).to(T,{y:P-10,duration:.18,yoyo:!0,repeat:3,ease:"sine.inOut"}).to(T,{rotation:.06*x,duration:.25,yoyo:!0,repeat:3},"<").add(G,"+=0.6").to(T,{x:x>0?d+y:-y,duration:2.2,ease:"power2.in"})}setTimeout(Go,6e3),setInterval(Go,3e4);function Ct(x,y=Pe,P=Ae-ur()*.5){for(let T=0;T<x;T++){let w=new de().star(0,0,4,E(4,9),E(1.5,3)).fill([16777215,16769658,9430015,16754920][T%4]);w.blendMode="add",w.position.set(y+E(-30,30),P+E(-60,60)),c.addChild(w);let G=E(0,6.28),$=E(g*.08,g*.28);te.timeline({onComplete:()=>w.destroy()}).to(w,{x:w.x+Math.cos(G)*$,y:w.y+Math.sin(G)*$-g*.05,rotation:E(-3,3),duration:E(.7,1.3),ease:"power3.out"}).to(w,{alpha:0,duration:.5},"-=0.5")}}function Do(){let x=new de,y=ur()*.55,P=g*1.1;for(let T=0;T<8;T++){let w=y*(1-T/9);x.rect(-w/2,-P,w,P).fill({color:12577279,alpha:.07})}x.blendMode="add",x.position.set(Pe,Ae),x.scale.set(.2,0),c.addChild(x),te.timeline({onComplete:()=>x.destroy()}).to(x.scale,{x:1,y:1,duration:.35,ease:"power3.out"}).to(x,{alpha:0,duration:.7,delay:.25})}function wi(){for(let x=0;x<8;x++){let y=new be(i.cloud3);y.anchor.set(.5),y.scale.set(g*.03/i.cloud3.width),y.alpha=.8,y.position.set(Pe+E(-20,20),Ae-6),c.addChild(y);let P=x<4?-1:1;te.timeline({onComplete:()=>y.destroy()}).to(y,{x:y.x+P*E(g*.06,g*.12),y:y.y-E(4,18),duration:.6,ease:"power2.out"}).to(y.scale,{x:y.scale.x*1.8,y:y.scale.y*1.8,duration:.6},0).to(y,{alpha:0,duration:.4},.25)}}function za(x,y){let P=new de;P.blendMode="add",P.position.set(x,y),c.addChild(P);let T={r:4,a:.9};te.to(T,{r:Math.max(30,d*.035),a:0,duration:.55,ease:"power2.out",onUpdate:()=>P.clear().circle(0,0,T.r).stroke({width:3,color:16777215,alpha:T.a}),onComplete:()=>P.destroy()}),Ct(6,x,y)}let Ir=!1;function Ur(x){if(Ir)return;Ir=!0;let y=g*(x?.16:.09);bi(x),te.timeline({onComplete:()=>Ir=!1}).to(R.scale,{x:1.08,y:.9,duration:.1,ease:"power2.out"}).to(R.scale,{x:.95,y:1.07,duration:.14}).to(R,{y:-y,duration:.3,ease:"power2.out"},"<").to(R,{rotation:x?Math.PI*2:0,duration:.55,ease:"power1.inOut"},"<").to(R.scale,{x:1,y:1,duration:.2},"<0.1").to(R,{y:0,duration:.26,ease:"power2.in"}).add(()=>{wi(),R.rotation=0,e.onLand&&e.onLand()}).to(R.scale,{x:1.1,y:.88,duration:.08}).to(R.scale,{x:1,y:1,duration:.5,ease:"elastic.out(1, 0.4)"})}let Pi=new Wi({threshold:.55,bloomScale:0,brightness:1,blur:8,quality:5});function Ia(){a.filters=[Pi];let x=1.14,y=Pe,P=Ae-ur()*.5,T=te.timeline();return T.to(a.scale,{x,y:x,duration:.7,ease:"power3.inOut"},0).to(a.position,{x:-y*(x-1),y:-P*(x-1),duration:.7,ease:"power3.inOut"},0).to(Pi,{bloomScale:1.4,duration:.5},.2).add(()=>{Do(),Ct(70),Ur(!0)},.55).to(Pi,{bloomScale:0,duration:1.2},1.4).to(a.scale,{x:1,y:1,duration:.9,ease:"power3.inOut"},2.1).to(a.position,{x:0,y:0,duration:.9,ease:"power3.inOut"},2.1),new Promise(w=>T.eventCallback("onComplete",()=>{a.filters=null,w()}))}async function Ua(x,y){let P=x+"-"+y;await Promise.all([o("f-"+P,je+"fig/"+P+".webp"),n("w-"+y,je+"w/"+y+".webp")]);let T=new de,w=Pe,G=Ae-ur()*.5;T.blendMode="add",T.position.set(w,G),h.addChild(T);let $=new de().rect(0,0,d,g).fill(16777215);$.alpha=0,h.addChild($);let ie={r:0,s:0},Qe=Math.hypot(d,g)*.6,pt=()=>{T.clear();for(let pe=0;pe<5;pe++){let Gr=ie.r*(1-pe*.12);Gr>0&&T.circle(0,0,Gr).stroke({width:10+pe*4,color:[9430015,11832575,16754920,16769658,16777215][pe],alpha:.5})}T.rotation=ie.s},Re=null;await new Promise(pe=>{te.timeline({onComplete:pe}).to(R,{rotation:Math.PI*2,duration:.6,ease:"power2.in"},0).to(ie,{r:Qe,s:3,duration:.7,ease:"power3.in",onUpdate:pt},0).to($,{alpha:1,duration:.18},.55).add(()=>{R.rotation=0,A.job=y,Re=Promise.all([O(y),Rr(x,y)])},.75).to(ie,{r:0,s:6,duration:.6,ease:"power3.out",onUpdate:pt},.95).to($,{alpha:0,duration:.5},1).add(()=>{T.destroy(),$.destroy(),Do(),Ct(40),wi()},1.55)}),Re&&await Re}async function Ga(){let x=d/g>=1.05?"room-l":"room-p",y=await n(x,je+"img/"+x+".webp");if(!y){Ur(!0);return}let P=x==="room-l"?[276,152,1395,518,1672,941]:[213,260,727,821,941,1672],T=new be(y),w=Math.max(d/P[4],g/P[5]),G=(d-P[4]*w)/2,$=(g-P[5]*w)/2;T.scale.set(w),T.position.set(G,$),h.addChild(T);let ie=(P[0]+P[2])/2,Qe=(P[1]+P[3])/2,pt=G+ie*w,Re=$+Qe*w,pe=Math.max(d/((P[2]-P[0])*w),g/((P[3]-P[1])*w))*1.7;R.y=-g*1.1,a.scale.set(1.25),a.position.set(-d*.125,-g*.125),await new Promise(Gr=>{let Dr={z:1};te.timeline({onComplete:Gr}).to(Dr,{z:pe,duration:1.6,ease:"power3.in",onUpdate:()=>{T.scale.set(w*Dr.z),T.position.set(pt-ie*w*Dr.z,Re-Qe*w*Dr.z)}},.5).to(T,{alpha:0,duration:.35},1.75).to(a.scale,{x:1,y:1,duration:1.2,ease:"power3.out"},1.6).to(a.position,{x:0,y:0,duration:1.2,ease:"power3.out"},1.6).to(R,{y:0,duration:.6,ease:"bounce.out"},2.1).add(()=>{wi(),e.onLand&&e.onLand(),T.destroy(),bi(!1),Ct(20)},2.35)})}function Ai(x=new Date().getHours()+new Date().getMinutes()/60){m.n=x>=20.5||x<6.5?1:x>=19?(x-19)/1.5:x<7.5?1-(x-6.5):0,m.e=x>=17&&x<20.5?Math.min(1,(x-17)/2)*(1-m.n):0,Ci()}function Ci(){let x=m.n,y=m.e,P=S&&S.night;_.reset(),P&&(S.night.alpha=x);let T=P?0:x;if(T>0||y>0){_.brightness(1-T*.5,!0);let w=_.matrix;w[0]*=1-T*.3+y*.1,w[6]*=1-T*.15-y*.04,w[12]*=1+T*.3-y*.16,_.matrix=w}q.color=x>.5?10470655:y>.3?16761466:16773320,q.alpha=x>.5?.55:.42}let H={x:0,y:0,tx:0,ty:0,auto:0};s.addEventListener("pointermove",x=>{let y=s.getBoundingClientRect();H.tx=((x.clientX-y.left)/y.width-.5)*2,H.ty=((x.clientY-y.top)/y.height-.5)*2,H.auto=3}),window.addEventListener("deviceorientation",x=>{x.gamma!=null&&(H.tx=Math.max(-1,Math.min(1,x.gamma/25)),H.ty=Math.max(-1,Math.min(1,(x.beta-45)/25)),H.auto=3)});let Ke=0;t.ticker.add(x=>{let y=x.deltaMS/1e3;Ke+=y,H.auto>0?H.auto-=y:(H.tx=Math.sin(Ke*.23)*.35,H.ty=Math.sin(Ke*.17)*.2),H.x+=(H.tx-H.x)*Math.min(1,y*3),H.y+=(H.ty-H.y)*Math.min(1,y*3);let P=Math.min(d,g)*.012;if(S&&S.f&&(S.f.scale.x=-H.x*P*1.6,S.f.scale.y=-H.y*P*.8),l.position.set(-H.x*P*.5,-H.y*P*.3),u.position.copyFrom(l.position),f.position.set(-H.x*P*1.4,-H.y*P*.8),p.position.copyFrom(f.position),R.skew.x=-H.x*.012,!Ir){let w=Math.sin(Ke*2.1);z.scale.y=rt*(1+w*.008),z.scale.x=rt*(1-w*.004),se.scale.copyFrom(z.scale),R.x=Math.sin(Ke*.55)*g*.003}let T=Math.min(1,Math.max(0,-R.y/(g*.16)));if(L.scale.set(1-T*.55),L.alpha=1-T*.6,D.visible){D.rotation=Math.sin(Ke*1.7)*.02;let w=Math.min(1,Math.max(0,(D._y-D.y)/(g*.1)));U.scale.set(1-w*.5)}N.clear();for(let w=0;w<3;w++){let G=(Ke*.45+w/3)%1;N.ellipse(Pe,Ae-Ce*.02,Ce*(.3+G*.32),Ce*(.08+G*.08)).stroke({width:3,color:8379647,alpha:(1-G)*.5})}for(let w of zr)w.y-=y*w.sp*.3,w.x+=Math.sin(Ke*.5+w.ph)*y*.01,w.y<.3&&(w.y=.95),w.g.position.set(w.x*d,w.y*g),w.g.alpha=w.ff?m.n>.4?.5+Math.sin(Ke*2+w.ph)*.5:0:(1-m.n)*.35*(.5+Math.sin(Ke*1.3+w.ph)*.5)}),t.stage.eventMode="static",t.stage.hitArea={contains:()=>!0},z.eventMode="static",z.cursor="pointer",z.on("pointertap",x=>{x.stopPropagation(),Ur(!1),Ct(12),e.onTap&&e.onTap()}),ye.eventMode="static",ye.cursor="pointer",ye.on("pointertap",x=>{x.stopPropagation(),bi(!0),e.onPet&&e.onPet()}),t.stage.on("pointertap",x=>{za(x.global.x,x.global.y),e.onWorldTap&&e.onWorldTap()});function Fi(){d=t.renderer.width/t.renderer.resolution,g=t.renderer.height/t.renderer.resolution,b=d/g<1.05,F(S),Ti(),Ci()}t.renderer.on("resize",Fi),d=t.renderer.width/t.renderer.resolution,g=t.renderer.height/t.renderer.resolution,b=d/g<1.05,Ai(),A.job=e.job||"schueler",await O(A.job),await Rr(e.kid||"lena",A.job),e.pet&&await $e(e.pet),Fi();for(let x=0;x<3;x++)Io(!0);return setInterval(()=>Ai(),6e4),{setFigure:(x,y,P)=>Rr(x,y,P),setView:(x,y)=>(A.job=x,O(x,y)),outfit:(x,y)=>y!==A.job?Ua(x,y):Rr(x,y,!0),setPet:$e,intro:Ga,jump:Ur,levelUp:Ia,sparkle:Ct,blink:ft,mood:m,setTime:x=>Ai(x),figRect:()=>{let x=z.getBounds();return{x:x.x,y:x.y,w:x.width,h:x.height}},pause:()=>t.ticker.stop(),resume:()=>{t.ticker.start(),Fi()},preload:x=>x.forEach(y=>o("f-"+y,je+"fig/"+y+".webp").catch(()=>{}))}}export{G0 as create};
/*! Bundled license information:

gsap/gsap-core.js:
  (*!
   * GSAP 3.15.1
   * https://gsap.com
   *
   * @license Copyright 2008-2026, GreenSock. All rights reserved.
   * Subject to the terms at https://gsap.com/standard-license
   * @author: Jack Doyle, jack@greensock.com
  *)

gsap/CSSPlugin.js:
  (*!
   * CSSPlugin 3.15.1
   * https://gsap.com
   *
   * Copyright 2008-2026, GreenSock. All rights reserved.
   * Subject to the terms at https://gsap.com/standard-license
   * @author: Jack Doyle, jack@greensock.com
  *)
*/
