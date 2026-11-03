(()=>{var Ec="169";var zu=0,Rh=1,Hu=2;var Nf=1,Tc=2,ni=3,Ti=0,Qe=1,pn=2,wi=0,Ei=1,Vn=2,Ch=3,Ph=4,Vu=5,Xi=100,Gu=101,Wu=102,Xu=103,qu=104,Yu=200,Zu=201,$u=202,Ju=203,el=204,nl=205,Ku=206,Qu=207,ju=208,td=209,ed=210,nd=211,id=212,sd=213,rd=214,il=0,sl=1,rl=2,Ns=3,al=4,ol=5,ll=6,cl=7,Ac=0,ad=1,od=2,Hn=0,ld=1,cd=2,hd=3,fd=4,ud=5,dd=6,pd=7;var Of=300,Os=301,Fs=302,hl=303,fl=304,ja=306,ks=1e3,Yi=1001,ul=1002,Je=1003,md=1004;var Hr=1005;var Rn=1006,Mo=1007;var Zi=1008;var ai=1009,Ff=1010,kf=1011,_r=1012,Rc=1013,$i=1014,zn=1015,Er=1016,Cc=1017,Pc=1018,Bs=1020,Bf=35902,zf=1021,Hf=1022,Pn=1023,Vf=1024,Gf=1025,Ls=1026,zs=1027,Ic=1028,Lc=1029,Wf=1030,Dc=1031;var Uc=1033,pa=33776,ma=33777,ga=33778,_a=33779,dl=35840,pl=35841,ml=35842,gl=35843,_l=36196,vl=37492,yl=37496,xl=37808,Ml=37809,bl=37810,Sl=37811,wl=37812,El=37813,Tl=37814,Al=37815,Rl=37816,Cl=37817,Pl=37818,Il=37819,Ll=37820,Dl=37821,va=36492,Ul=36494,Nl=36495,Xf=36283,Ol=36284,Fl=36285,kl=36286;var xa=2300,Bl=2301,bo=2302,Ih=2400,Lh=2401,Dh=2402;var gd=3200,_d=3201;var Nc=0,vd=1,bi="",fe="srgb",Pi="srgb-linear",Oc="display-p3",to="display-p3-linear",Ma="linear",he="srgb",ba="rec709",Sa="p3";var us=7680;var Uh=519,yd=512,xd=513,Md=514,qf=515,bd=516,Sd=517,wd=518,Ed=519,zl=35044;var Nh="300 es",si=2e3,wa=2001,Ai=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(e)===-1&&i[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;let i=this._listeners;return i[t]!==void 0&&i[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;let s=this._listeners[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;let i=this._listeners[t.type];if(i!==void 0){t.target=this;let s=i.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}},Oe=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Oh=1234567,ur=Math.PI/180,vr=180/Math.PI;function ri(){let n=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Oe[n&255]+Oe[n>>8&255]+Oe[n>>16&255]+Oe[n>>24&255]+"-"+Oe[t&255]+Oe[t>>8&255]+"-"+Oe[t>>16&15|64]+Oe[t>>24&255]+"-"+Oe[e&63|128]+Oe[e>>8&255]+"-"+Oe[e>>16&255]+Oe[e>>24&255]+Oe[i&255]+Oe[i>>8&255]+Oe[i>>16&255]+Oe[i>>24&255]).toLowerCase()}function Pe(n,t,e){return Math.max(t,Math.min(e,n))}function Fc(n,t){return(n%t+t)%t}function Td(n,t,e,i,s){return i+(n-t)*(s-i)/(e-t)}function Ad(n,t,e){return n!==t?(e-n)/(t-n):0}function dr(n,t,e){return(1-e)*n+e*t}function Rd(n,t,e,i){return dr(n,t,1-Math.exp(-e*i))}function Cd(n,t=1){return t-Math.abs(Fc(n,t*2)-t)}function Pd(n,t,e){return n<=t?0:n>=e?1:(n=(n-t)/(e-t),n*n*(3-2*n))}function Id(n,t,e){return n<=t?0:n>=e?1:(n=(n-t)/(e-t),n*n*n*(n*(n*6-15)+10))}function Ld(n,t){return n+Math.floor(Math.random()*(t-n+1))}function Dd(n,t){return n+Math.random()*(t-n)}function Ud(n){return n*(.5-Math.random())}function Nd(n){n!==void 0&&(Oh=n);let t=Oh+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Od(n){return n*ur}function Fd(n){return n*vr}function kd(n){return(n&n-1)===0&&n!==0}function Bd(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function zd(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function Hd(n,t,e,i,s){let r=Math.cos,a=Math.sin,o=r(e/2),l=a(e/2),c=r((t+i)/2),h=a((t+i)/2),f=r((t-i)/2),u=a((t-i)/2),d=r((i-t)/2),g=a((i-t)/2);switch(s){case"XYX":n.set(o*h,l*f,l*u,o*c);break;case"YZY":n.set(l*u,o*h,l*f,o*c);break;case"ZXZ":n.set(l*f,l*u,o*h,o*c);break;case"XZX":n.set(o*h,l*g,l*d,o*c);break;case"YXY":n.set(l*d,o*h,l*g,o*c);break;case"ZYZ":n.set(l*g,l*d,o*h,o*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Cn(n,t){switch(t.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function ie(n,t){switch(t.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}var Yf={DEG2RAD:ur,RAD2DEG:vr,generateUUID:ri,clamp:Pe,euclideanModulo:Fc,mapLinear:Td,inverseLerp:Ad,lerp:dr,damp:Rd,pingpong:Cd,smoothstep:Pd,smootherstep:Id,randInt:Ld,randFloat:Dd,randFloatSpread:Ud,seededRandom:Nd,degToRad:Od,radToDeg:Fd,isPowerOfTwo:kd,ceilPowerOfTwo:Bd,floorPowerOfTwo:zd,setQuaternionFromProperEuler:Hd,normalize:ie,denormalize:Cn},ct=class n{constructor(t=0,e=0){n.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,i=this.y,s=t.elements;return this.x=s[0]*e+s[3]*i+s[6],this.y=s[1]*e+s[4]*i+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(t,Math.min(e,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(Pe(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y;return e*e+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let i=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*i-a*s+t.x,this.y=r*s+a*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},zt=class n{constructor(t,e,i,s,r,a,o,l,c){n.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,i,s,r,a,o,l,c)}set(t,e,i,s,r,a,o,l,c){let h=this.elements;return h[0]=t,h[1]=s,h[2]=o,h[3]=e,h[4]=r,h[5]=l,h[6]=i,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],this}extractBasis(t,e,i){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,s=e.elements,r=this.elements,a=i[0],o=i[3],l=i[6],c=i[1],h=i[4],f=i[7],u=i[2],d=i[5],g=i[8],_=s[0],m=s[3],p=s[6],w=s[1],x=s[4],S=s[7],P=s[2],T=s[5],A=s[8];return r[0]=a*_+o*w+l*P,r[3]=a*m+o*x+l*T,r[6]=a*p+o*S+l*A,r[1]=c*_+h*w+f*P,r[4]=c*m+h*x+f*T,r[7]=c*p+h*S+f*A,r[2]=u*_+d*w+g*P,r[5]=u*m+d*x+g*T,r[8]=u*p+d*S+g*A,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8];return e*a*h-e*o*c-i*r*h+i*o*l+s*r*c-s*a*l}invert(){let t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],f=h*a-o*c,u=o*l-h*r,d=c*r-a*l,g=e*f+i*u+s*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/g;return t[0]=f*_,t[1]=(s*c-h*i)*_,t[2]=(o*i-s*a)*_,t[3]=u*_,t[4]=(h*e-s*l)*_,t[5]=(s*r-o*e)*_,t[6]=d*_,t[7]=(i*l-c*e)*_,t[8]=(a*e-i*r)*_,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,i,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*a+c*o)+a+t,-s*c,s*l,-s*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return this.premultiply(So.makeScale(t,e)),this}rotate(t){return this.premultiply(So.makeRotation(-t)),this}translate(t,e){return this.premultiply(So.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,i,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,i=t.elements;for(let s=0;s<9;s++)if(e[s]!==i[s])return!1;return!0}fromArray(t,e=0){for(let i=0;i<9;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}},So=new zt;function Zf(n){for(let t=n.length-1;t>=0;--t)if(n[t]>=65535)return!0;return!1}function yr(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function Vd(){let n=yr("canvas");return n.style.display="block",n}var Fh={};function ya(n){n in Fh||(Fh[n]=!0,console.warn(n))}function Gd(n,t,e){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(t,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:i()}}setTimeout(r,e)})}function Wd(n){let t=n.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function Xd(n){let t=n.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}var kh=new zt().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Bh=new zt().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),er={[Pi]:{transfer:Ma,primaries:ba,luminanceCoefficients:[.2126,.7152,.0722],toReference:n=>n,fromReference:n=>n},[fe]:{transfer:he,primaries:ba,luminanceCoefficients:[.2126,.7152,.0722],toReference:n=>n.convertSRGBToLinear(),fromReference:n=>n.convertLinearToSRGB()},[to]:{transfer:Ma,primaries:Sa,luminanceCoefficients:[.2289,.6917,.0793],toReference:n=>n.applyMatrix3(Bh),fromReference:n=>n.applyMatrix3(kh)},[Oc]:{transfer:he,primaries:Sa,luminanceCoefficients:[.2289,.6917,.0793],toReference:n=>n.convertSRGBToLinear().applyMatrix3(Bh),fromReference:n=>n.applyMatrix3(kh).convertLinearToSRGB()}},qd=new Set([Pi,to]),te={enabled:!0,_workingColorSpace:Pi,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(n){if(!qd.has(n))throw new Error(`Unsupported working color space, "${n}".`);this._workingColorSpace=n},convert:function(n,t,e){if(this.enabled===!1||t===e||!t||!e)return n;let i=er[t].toReference,s=er[e].fromReference;return s(i(n))},fromWorkingColorSpace:function(n,t){return this.convert(n,this._workingColorSpace,t)},toWorkingColorSpace:function(n,t){return this.convert(n,t,this._workingColorSpace)},getPrimaries:function(n){return er[n].primaries},getTransfer:function(n){return n===bi?Ma:er[n].transfer},getLuminanceCoefficients:function(n,t=this._workingColorSpace){return n.fromArray(er[t].luminanceCoefficients)}};function Ds(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function wo(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var ds,Hl=class{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{ds===void 0&&(ds=yr("canvas")),ds.width=t.width,ds.height=t.height;let i=ds.getContext("2d");t instanceof ImageData?i.putImageData(t,0,0):i.drawImage(t,0,0,t.width,t.height),e=ds}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=yr("canvas");e.width=t.width,e.height=t.height;let i=e.getContext("2d");i.drawImage(t,0,0,t.width,t.height);let s=i.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Ds(r[a]/255)*255;return i.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let i=0;i<e.length;i++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[i]=Math.floor(Ds(e[i]/255)*255):e[i]=Ds(e[i]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},Yd=0,Ea=class{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Yd++}),this.uuid=ri(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Eo(s[a].image)):r.push(Eo(s[a]))}else r=Eo(s);i.url=r}return e||(t.images[this.uuid]=i),i}};function Eo(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Hl.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var Zd=0,Ve=class n extends Ai{constructor(t=n.DEFAULT_IMAGE,e=n.DEFAULT_MAPPING,i=Yi,s=Yi,r=Rn,a=Zi,o=Pn,l=ai,c=n.DEFAULT_ANISOTROPY,h=bi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Zd++}),this.uuid=ri(),this.name="",this.source=new Ea(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new ct(0,0),this.repeat=new ct(1,1),this.center=new ct(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new zt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),e||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Of)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case ks:t.x=t.x-Math.floor(t.x);break;case Yi:t.x=t.x<0?0:1;break;case ul:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case ks:t.y=t.y-Math.floor(t.y);break;case Yi:t.y=t.y<0?0:1;break;case ul:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Ve.DEFAULT_IMAGE=null;Ve.DEFAULT_MAPPING=Of;Ve.DEFAULT_ANISOTROPY=1;var ge=class n{constructor(t=0,e=0,i=0,s=1){n.prototype.isVector4=!0,this.x=t,this.y=e,this.z=i,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,i,s){return this.x=t,this.y=e,this.z=i,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,i=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*i+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*i+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*i+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*i+a[11]*s+a[15]*r,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,i,s,r,l=t.elements,c=l[0],h=l[4],f=l[8],u=l[1],d=l[5],g=l[9],_=l[2],m=l[6],p=l[10];if(Math.abs(h-u)<.01&&Math.abs(f-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+u)<.1&&Math.abs(f+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+d+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let x=(c+1)/2,S=(d+1)/2,P=(p+1)/2,T=(h+u)/4,A=(f+_)/4,I=(g+m)/4;return x>S&&x>P?x<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(x),s=T/i,r=A/i):S>P?S<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(S),i=T/s,r=I/s):P<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(P),i=A/r,s=I/r),this.set(i,s,r,e),this}let w=Math.sqrt((m-g)*(m-g)+(f-_)*(f-_)+(u-h)*(u-h));return Math.abs(w)<.001&&(w=1),this.x=(m-g)/w,this.y=(f-_)/w,this.z=(u-h)/w,this.w=Math.acos((c+d+p-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(t,Math.min(e,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this.w=t.w+(e.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Vl=class extends Ai{constructor(t=1,e=1,i={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new ge(0,0,t,e),this.scissorTest=!1,this.viewport=new ge(0,0,t,e);let s={width:t,height:e,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Rn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);let r=new Ve(s,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);r.flipY=!1,r.generateMipmaps=i.generateMipmaps,r.internalFormat=i.internalFormat,this.textures=[];let a=i.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,i=1){if(this.width!==t||this.height!==e||this.depth!==i){this.width=t,this.height=e,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=i;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let i=0,s=t.textures.length;i<s;i++)this.textures[i]=t.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0;let e=Object.assign({},t.texture.image);return this.texture.source=new Ea(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},oi=class extends Vl{constructor(t=1,e=1,i={}){super(t,e,i),this.isWebGLRenderTarget=!0}},Ta=class extends Ve{constructor(t=null,e=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:i,depth:s},this.magFilter=Je,this.minFilter=Je,this.wrapR=Yi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var Gl=class extends Ve{constructor(t=null,e=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:i,depth:s},this.magFilter=Je,this.minFilter=Je,this.wrapR=Yi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Ri=class{constructor(t=0,e=0,i=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=i,this._w=s}static slerpFlat(t,e,i,s,r,a,o){let l=i[s+0],c=i[s+1],h=i[s+2],f=i[s+3],u=r[a+0],d=r[a+1],g=r[a+2],_=r[a+3];if(o===0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=f;return}if(o===1){t[e+0]=u,t[e+1]=d,t[e+2]=g,t[e+3]=_;return}if(f!==_||l!==u||c!==d||h!==g){let m=1-o,p=l*u+c*d+h*g+f*_,w=p>=0?1:-1,x=1-p*p;if(x>Number.EPSILON){let P=Math.sqrt(x),T=Math.atan2(P,p*w);m=Math.sin(m*T)/P,o=Math.sin(o*T)/P}let S=o*w;if(l=l*m+u*S,c=c*m+d*S,h=h*m+g*S,f=f*m+_*S,m===1-o){let P=1/Math.sqrt(l*l+c*c+h*h+f*f);l*=P,c*=P,h*=P,f*=P}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=f}static multiplyQuaternionsFlat(t,e,i,s,r,a){let o=i[s],l=i[s+1],c=i[s+2],h=i[s+3],f=r[a],u=r[a+1],d=r[a+2],g=r[a+3];return t[e]=o*g+h*f+l*d-c*u,t[e+1]=l*g+h*u+c*f-o*d,t[e+2]=c*g+h*d+o*u-l*f,t[e+3]=h*g-o*f-l*u-c*d,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,i,s){return this._x=t,this._y=e,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let i=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(i/2),h=o(s/2),f=o(r/2),u=l(i/2),d=l(s/2),g=l(r/2);switch(a){case"XYZ":this._x=u*h*f+c*d*g,this._y=c*d*f-u*h*g,this._z=c*h*g+u*d*f,this._w=c*h*f-u*d*g;break;case"YXZ":this._x=u*h*f+c*d*g,this._y=c*d*f-u*h*g,this._z=c*h*g-u*d*f,this._w=c*h*f+u*d*g;break;case"ZXY":this._x=u*h*f-c*d*g,this._y=c*d*f+u*h*g,this._z=c*h*g+u*d*f,this._w=c*h*f-u*d*g;break;case"ZYX":this._x=u*h*f-c*d*g,this._y=c*d*f+u*h*g,this._z=c*h*g-u*d*f,this._w=c*h*f+u*d*g;break;case"YZX":this._x=u*h*f+c*d*g,this._y=c*d*f+u*h*g,this._z=c*h*g-u*d*f,this._w=c*h*f-u*d*g;break;case"XZY":this._x=u*h*f-c*d*g,this._y=c*d*f-u*h*g,this._z=c*h*g+u*d*f,this._w=c*h*f+u*d*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let i=e/2,s=Math.sin(i);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,i=e[0],s=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],h=e[6],f=e[10],u=i+o+f;if(u>0){let d=.5/Math.sqrt(u+1);this._w=.25/d,this._x=(h-l)*d,this._y=(r-c)*d,this._z=(a-s)*d}else if(i>o&&i>f){let d=2*Math.sqrt(1+i-o-f);this._w=(h-l)/d,this._x=.25*d,this._y=(s+a)/d,this._z=(r+c)/d}else if(o>f){let d=2*Math.sqrt(1+o-i-f);this._w=(r-c)/d,this._x=(s+a)/d,this._y=.25*d,this._z=(l+h)/d}else{let d=2*Math.sqrt(1+f-i-o);this._w=(a-s)/d,this._x=(r+c)/d,this._y=(l+h)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let i=t.dot(e)+1;return i<Number.EPSILON?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Pe(this.dot(t),-1,1)))}rotateTowards(t,e){let i=this.angleTo(t);if(i===0)return this;let s=Math.min(1,e/i);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let i=t._x,s=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,h=e._w;return this._x=i*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-i*c,this._z=r*h+a*c+i*l-s*o,this._w=a*h-i*o-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);let i=this._x,s=this._y,r=this._z,a=this._w,o=a*t._w+i*t._x+s*t._y+r*t._z;if(o<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,o=-o):this.copy(t),o>=1)return this._w=a,this._x=i,this._y=s,this._z=r,this;let l=1-o*o;if(l<=Number.EPSILON){let d=1-e;return this._w=d*a+e*this._w,this._x=d*i+e*this._x,this._y=d*s+e*this._y,this._z=d*r+e*this._z,this.normalize(),this}let c=Math.sqrt(l),h=Math.atan2(c,o),f=Math.sin((1-e)*h)/c,u=Math.sin(e*h)/c;return this._w=a*f+this._w*u,this._x=i*f+this._x*u,this._y=s*f+this._y*u,this._z=r*f+this._z*u,this._onChangeCallback(),this}slerpQuaternions(t,e,i){return this.copy(t).slerp(e,i)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},R=class n{constructor(t=0,e=0,i=0){n.prototype.isVector3=!0,this.x=t,this.y=e,this.z=i}set(t,e,i){return i===void 0&&(i=this.z),this.x=t,this.y=e,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(zh.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(zh.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,i=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*i+r[6]*s,this.y=r[1]*e+r[4]*i+r[7]*s,this.z=r[2]*e+r[5]*i+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,i=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*i+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*i+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*i+r[10]*s+r[14])*a,this}applyQuaternion(t){let e=this.x,i=this.y,s=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*s-o*i),h=2*(o*e-r*s),f=2*(r*i-a*e);return this.x=e+l*c+a*f-o*h,this.y=i+l*h+o*c-r*f,this.z=s+l*f+r*h-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,i=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*i+r[8]*s,this.y=r[1]*e+r[5]*i+r[9]*s,this.z=r[2]*e+r[6]*i+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(t,Math.min(e,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let i=t.x,s=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=s*l-r*o,this.y=r*a-i*l,this.z=i*o-s*a,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let i=t.dot(this)/e;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return To.copy(this).projectOnVector(t),this.sub(To)}reflect(t){return this.sub(To.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(Pe(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y,s=this.z-t.z;return e*e+i*i+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,i){let s=Math.sin(e)*t;return this.x=s*Math.sin(i),this.y=Math.cos(e)*t,this.z=s*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,i){return this.x=t*Math.sin(e),this.y=i,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=i,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,i=Math.sqrt(1-e*e);return this.x=i*Math.cos(t),this.y=e,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},To=new R,zh=new Ri,li=class{constructor(t=new R(1/0,1/0,1/0),e=new R(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e+=3)this.expandByPoint(En.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,i=t.count;e<i;e++)this.expandByPoint(En.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let i=En.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let i=t.geometry;if(i!==void 0){let r=i.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,En):En.fromBufferAttribute(r,a),En.applyMatrix4(t.matrixWorld),this.expandByPoint(En);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Vr.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Vr.copy(i.boundingBox)),Vr.applyMatrix4(t.matrixWorld),this.union(Vr)}let s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,En),En.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,i;return t.normal.x>0?(e=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),e<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(nr),Gr.subVectors(this.max,nr),ps.subVectors(t.a,nr),ms.subVectors(t.b,nr),gs.subVectors(t.c,nr),gi.subVectors(ms,ps),_i.subVectors(gs,ms),ki.subVectors(ps,gs);let e=[0,-gi.z,gi.y,0,-_i.z,_i.y,0,-ki.z,ki.y,gi.z,0,-gi.x,_i.z,0,-_i.x,ki.z,0,-ki.x,-gi.y,gi.x,0,-_i.y,_i.x,0,-ki.y,ki.x,0];return!Ao(e,ps,ms,gs,Gr)||(e=[1,0,0,0,1,0,0,0,1],!Ao(e,ps,ms,gs,Gr))?!1:(Wr.crossVectors(gi,_i),e=[Wr.x,Wr.y,Wr.z],Ao(e,ps,ms,gs,Gr))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,En).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(En).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Kn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Kn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Kn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Kn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Kn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Kn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Kn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Kn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Kn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}},Kn=[new R,new R,new R,new R,new R,new R,new R,new R],En=new R,Vr=new li,ps=new R,ms=new R,gs=new R,gi=new R,_i=new R,ki=new R,nr=new R,Gr=new R,Wr=new R,Bi=new R;function Ao(n,t,e,i,s){for(let r=0,a=n.length-3;r<=a;r+=3){Bi.fromArray(n,r);let o=s.x*Math.abs(Bi.x)+s.y*Math.abs(Bi.y)+s.z*Math.abs(Bi.z),l=t.dot(Bi),c=e.dot(Bi),h=i.dot(Bi);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var $d=new li,ir=new R,Ro=new R,Ji=class{constructor(t=new R,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let i=this.center;e!==void 0?i.copy(e):$d.setFromPoints(t).getCenter(i);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,i.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let i=this.center.distanceToSquared(t);return e.copy(t),i>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;ir.subVectors(t,this.center);let e=ir.lengthSq();if(e>this.radius*this.radius){let i=Math.sqrt(e),s=(i-this.radius)*.5;this.center.addScaledVector(ir,s/i),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Ro.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(ir.copy(t.center).add(Ro)),this.expandByPoint(ir.copy(t.center).sub(Ro))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}},Qn=new R,Co=new R,Xr=new R,vi=new R,Po=new R,qr=new R,Io=new R,Aa=class{constructor(t=new R,e=new R(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Qn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let i=e.dot(this.direction);return i<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Qn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Qn.copy(this.origin).addScaledVector(this.direction,e),Qn.distanceToSquared(t))}distanceSqToSegment(t,e,i,s){Co.copy(t).add(e).multiplyScalar(.5),Xr.copy(e).sub(t).normalize(),vi.copy(this.origin).sub(Co);let r=t.distanceTo(e)*.5,a=-this.direction.dot(Xr),o=vi.dot(this.direction),l=-vi.dot(Xr),c=vi.lengthSq(),h=Math.abs(1-a*a),f,u,d,g;if(h>0)if(f=a*l-o,u=a*o-l,g=r*h,f>=0)if(u>=-g)if(u<=g){let _=1/h;f*=_,u*=_,d=f*(f+a*u+2*o)+u*(a*f+u+2*l)+c}else u=r,f=Math.max(0,-(a*u+o)),d=-f*f+u*(u+2*l)+c;else u=-r,f=Math.max(0,-(a*u+o)),d=-f*f+u*(u+2*l)+c;else u<=-g?(f=Math.max(0,-(-a*r+o)),u=f>0?-r:Math.min(Math.max(-r,-l),r),d=-f*f+u*(u+2*l)+c):u<=g?(f=0,u=Math.min(Math.max(-r,-l),r),d=u*(u+2*l)+c):(f=Math.max(0,-(a*r+o)),u=f>0?r:Math.min(Math.max(-r,-l),r),d=-f*f+u*(u+2*l)+c);else u=a>0?-r:r,f=Math.max(0,-(a*u+o)),d=-f*f+u*(u+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,f),s&&s.copy(Co).addScaledVector(Xr,u),d}intersectSphere(t,e){Qn.subVectors(t.center,this.origin);let i=Qn.dot(this.direction),s=Qn.dot(Qn)-i*i,r=t.radius*t.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=i-a,l=i+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(t.normal)+t.constant)/e;return i>=0?i:null}intersectPlane(t,e){let i=this.distanceToPlane(t);return i===null?null:this.at(i,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let i,s,r,a,o,l,c=1/this.direction.x,h=1/this.direction.y,f=1/this.direction.z,u=this.origin;return c>=0?(i=(t.min.x-u.x)*c,s=(t.max.x-u.x)*c):(i=(t.max.x-u.x)*c,s=(t.min.x-u.x)*c),h>=0?(r=(t.min.y-u.y)*h,a=(t.max.y-u.y)*h):(r=(t.max.y-u.y)*h,a=(t.min.y-u.y)*h),i>a||r>s||((r>i||isNaN(i))&&(i=r),(a<s||isNaN(s))&&(s=a),f>=0?(o=(t.min.z-u.z)*f,l=(t.max.z-u.z)*f):(o=(t.max.z-u.z)*f,l=(t.min.z-u.z)*f),i>l||o>s)||((o>i||i!==i)&&(i=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,e)}intersectsBox(t){return this.intersectBox(t,Qn)!==null}intersectTriangle(t,e,i,s,r){Po.subVectors(e,t),qr.subVectors(i,t),Io.crossVectors(Po,qr);let a=this.direction.dot(Io),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;vi.subVectors(this.origin,t);let l=o*this.direction.dot(qr.crossVectors(vi,qr));if(l<0)return null;let c=o*this.direction.dot(Po.cross(vi));if(c<0||l+c>a)return null;let h=-o*vi.dot(Io);return h<0?null:this.at(h/a,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},re=class n{constructor(t,e,i,s,r,a,o,l,c,h,f,u,d,g,_,m){n.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,i,s,r,a,o,l,c,h,f,u,d,g,_,m)}set(t,e,i,s,r,a,o,l,c,h,f,u,d,g,_,m){let p=this.elements;return p[0]=t,p[4]=e,p[8]=i,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=h,p[10]=f,p[14]=u,p[3]=d,p[7]=g,p[11]=_,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],e[9]=i[9],e[10]=i[10],e[11]=i[11],e[12]=i[12],e[13]=i[13],e[14]=i[14],e[15]=i[15],this}copyPosition(t){let e=this.elements,i=t.elements;return e[12]=i[12],e[13]=i[13],e[14]=i[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,i){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(t,e,i){return this.set(t.x,e.x,i.x,0,t.y,e.y,i.y,0,t.z,e.z,i.z,0,0,0,0,1),this}extractRotation(t){let e=this.elements,i=t.elements,s=1/_s.setFromMatrixColumn(t,0).length(),r=1/_s.setFromMatrixColumn(t,1).length(),a=1/_s.setFromMatrixColumn(t,2).length();return e[0]=i[0]*s,e[1]=i[1]*s,e[2]=i[2]*s,e[3]=0,e[4]=i[4]*r,e[5]=i[5]*r,e[6]=i[6]*r,e[7]=0,e[8]=i[8]*a,e[9]=i[9]*a,e[10]=i[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,i=t.x,s=t.y,r=t.z,a=Math.cos(i),o=Math.sin(i),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),f=Math.sin(r);if(t.order==="XYZ"){let u=a*h,d=a*f,g=o*h,_=o*f;e[0]=l*h,e[4]=-l*f,e[8]=c,e[1]=d+g*c,e[5]=u-_*c,e[9]=-o*l,e[2]=_-u*c,e[6]=g+d*c,e[10]=a*l}else if(t.order==="YXZ"){let u=l*h,d=l*f,g=c*h,_=c*f;e[0]=u+_*o,e[4]=g*o-d,e[8]=a*c,e[1]=a*f,e[5]=a*h,e[9]=-o,e[2]=d*o-g,e[6]=_+u*o,e[10]=a*l}else if(t.order==="ZXY"){let u=l*h,d=l*f,g=c*h,_=c*f;e[0]=u-_*o,e[4]=-a*f,e[8]=g+d*o,e[1]=d+g*o,e[5]=a*h,e[9]=_-u*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){let u=a*h,d=a*f,g=o*h,_=o*f;e[0]=l*h,e[4]=g*c-d,e[8]=u*c+_,e[1]=l*f,e[5]=_*c+u,e[9]=d*c-g,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){let u=a*l,d=a*c,g=o*l,_=o*c;e[0]=l*h,e[4]=_-u*f,e[8]=g*f+d,e[1]=f,e[5]=a*h,e[9]=-o*h,e[2]=-c*h,e[6]=d*f+g,e[10]=u-_*f}else if(t.order==="XZY"){let u=a*l,d=a*c,g=o*l,_=o*c;e[0]=l*h,e[4]=-f,e[8]=c*h,e[1]=u*f+_,e[5]=a*h,e[9]=d*f-g,e[2]=g*f-d,e[6]=o*h,e[10]=_*f+u}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Jd,t,Kd)}lookAt(t,e,i){let s=this.elements;return sn.subVectors(t,e),sn.lengthSq()===0&&(sn.z=1),sn.normalize(),yi.crossVectors(i,sn),yi.lengthSq()===0&&(Math.abs(i.z)===1?sn.x+=1e-4:sn.z+=1e-4,sn.normalize(),yi.crossVectors(i,sn)),yi.normalize(),Yr.crossVectors(sn,yi),s[0]=yi.x,s[4]=Yr.x,s[8]=sn.x,s[1]=yi.y,s[5]=Yr.y,s[9]=sn.y,s[2]=yi.z,s[6]=Yr.z,s[10]=sn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,s=e.elements,r=this.elements,a=i[0],o=i[4],l=i[8],c=i[12],h=i[1],f=i[5],u=i[9],d=i[13],g=i[2],_=i[6],m=i[10],p=i[14],w=i[3],x=i[7],S=i[11],P=i[15],T=s[0],A=s[4],I=s[8],B=s[12],v=s[1],b=s[5],F=s[9],N=s[13],V=s[2],Y=s[6],H=s[10],tt=s[14],G=s[3],at=s[7],ft=s[11],rt=s[15];return r[0]=a*T+o*v+l*V+c*G,r[4]=a*A+o*b+l*Y+c*at,r[8]=a*I+o*F+l*H+c*ft,r[12]=a*B+o*N+l*tt+c*rt,r[1]=h*T+f*v+u*V+d*G,r[5]=h*A+f*b+u*Y+d*at,r[9]=h*I+f*F+u*H+d*ft,r[13]=h*B+f*N+u*tt+d*rt,r[2]=g*T+_*v+m*V+p*G,r[6]=g*A+_*b+m*Y+p*at,r[10]=g*I+_*F+m*H+p*ft,r[14]=g*B+_*N+m*tt+p*rt,r[3]=w*T+x*v+S*V+P*G,r[7]=w*A+x*b+S*Y+P*at,r[11]=w*I+x*F+S*H+P*ft,r[15]=w*B+x*N+S*tt+P*rt,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[4],s=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],h=t[2],f=t[6],u=t[10],d=t[14],g=t[3],_=t[7],m=t[11],p=t[15];return g*(+r*l*f-s*c*f-r*o*u+i*c*u+s*o*d-i*l*d)+_*(+e*l*d-e*c*u+r*a*u-s*a*d+s*c*h-r*l*h)+m*(+e*c*f-e*o*d-r*a*f+i*a*d+r*o*h-i*c*h)+p*(-s*o*h-e*l*f+e*o*u+s*a*f-i*a*u+i*l*h)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,i){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=i),this}invert(){let t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],f=t[9],u=t[10],d=t[11],g=t[12],_=t[13],m=t[14],p=t[15],w=f*m*c-_*u*c+_*l*d-o*m*d-f*l*p+o*u*p,x=g*u*c-h*m*c-g*l*d+a*m*d+h*l*p-a*u*p,S=h*_*c-g*f*c+g*o*d-a*_*d-h*o*p+a*f*p,P=g*f*l-h*_*l-g*o*u+a*_*u+h*o*m-a*f*m,T=e*w+i*x+s*S+r*P;if(T===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let A=1/T;return t[0]=w*A,t[1]=(_*u*r-f*m*r-_*s*d+i*m*d+f*s*p-i*u*p)*A,t[2]=(o*m*r-_*l*r+_*s*c-i*m*c-o*s*p+i*l*p)*A,t[3]=(f*l*r-o*u*r-f*s*c+i*u*c+o*s*d-i*l*d)*A,t[4]=x*A,t[5]=(h*m*r-g*u*r+g*s*d-e*m*d-h*s*p+e*u*p)*A,t[6]=(g*l*r-a*m*r-g*s*c+e*m*c+a*s*p-e*l*p)*A,t[7]=(a*u*r-h*l*r+h*s*c-e*u*c-a*s*d+e*l*d)*A,t[8]=S*A,t[9]=(g*f*r-h*_*r-g*i*d+e*_*d+h*i*p-e*f*p)*A,t[10]=(a*_*r-g*o*r+g*i*c-e*_*c-a*i*p+e*o*p)*A,t[11]=(h*o*r-a*f*r-h*i*c+e*f*c+a*i*d-e*o*d)*A,t[12]=P*A,t[13]=(h*_*s-g*f*s+g*i*u-e*_*u-h*i*m+e*f*m)*A,t[14]=(g*o*s-a*_*s-g*i*l+e*_*l+a*i*m-e*o*m)*A,t[15]=(a*f*s-h*o*s+h*i*l-e*f*l-a*i*u+e*o*u)*A,this}scale(t){let e=this.elements,i=t.x,s=t.y,r=t.z;return e[0]*=i,e[4]*=s,e[8]*=r,e[1]*=i,e[5]*=s,e[9]*=r,e[2]*=i,e[6]*=s,e[10]*=r,e[3]*=i,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,i,s))}makeTranslation(t,e,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,i,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,e,-i,0,0,i,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,0,i,0,0,1,0,0,-i,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,0,i,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let i=Math.cos(e),s=Math.sin(e),r=1-i,a=t.x,o=t.y,l=t.z,c=r*a,h=r*o;return this.set(c*a+i,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+i,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+i,0,0,0,0,1),this}makeScale(t,e,i){return this.set(t,0,0,0,0,e,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,e,i,s,r,a){return this.set(1,i,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,i){let s=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,h=a+a,f=o+o,u=r*c,d=r*h,g=r*f,_=a*h,m=a*f,p=o*f,w=l*c,x=l*h,S=l*f,P=i.x,T=i.y,A=i.z;return s[0]=(1-(_+p))*P,s[1]=(d+S)*P,s[2]=(g-x)*P,s[3]=0,s[4]=(d-S)*T,s[5]=(1-(u+p))*T,s[6]=(m+w)*T,s[7]=0,s[8]=(g+x)*A,s[9]=(m-w)*A,s[10]=(1-(u+_))*A,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,i){let s=this.elements,r=_s.set(s[0],s[1],s[2]).length(),a=_s.set(s[4],s[5],s[6]).length(),o=_s.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],Tn.copy(this);let c=1/r,h=1/a,f=1/o;return Tn.elements[0]*=c,Tn.elements[1]*=c,Tn.elements[2]*=c,Tn.elements[4]*=h,Tn.elements[5]*=h,Tn.elements[6]*=h,Tn.elements[8]*=f,Tn.elements[9]*=f,Tn.elements[10]*=f,e.setFromRotationMatrix(Tn),i.x=r,i.y=a,i.z=o,this}makePerspective(t,e,i,s,r,a,o=si){let l=this.elements,c=2*r/(e-t),h=2*r/(i-s),f=(e+t)/(e-t),u=(i+s)/(i-s),d,g;if(o===si)d=-(a+r)/(a-r),g=-2*a*r/(a-r);else if(o===wa)d=-a/(a-r),g=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=c,l[4]=0,l[8]=f,l[12]=0,l[1]=0,l[5]=h,l[9]=u,l[13]=0,l[2]=0,l[6]=0,l[10]=d,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,i,s,r,a,o=si){let l=this.elements,c=1/(e-t),h=1/(i-s),f=1/(a-r),u=(e+t)*c,d=(i+s)*h,g,_;if(o===si)g=(a+r)*f,_=-2*f;else if(o===wa)g=r*f,_=-1*f;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-u,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-d,l[2]=0,l[6]=0,l[10]=_,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){let e=this.elements,i=t.elements;for(let s=0;s<16;s++)if(e[s]!==i[s])return!1;return!0}fromArray(t,e=0){for(let i=0;i<16;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t[e+9]=i[9],t[e+10]=i[10],t[e+11]=i[11],t[e+12]=i[12],t[e+13]=i[13],t[e+14]=i[14],t[e+15]=i[15],t}},_s=new R,Tn=new re,Jd=new R(0,0,0),Kd=new R(1,1,1),yi=new R,Yr=new R,sn=new R,Hh=new re,Vh=new Ri,In=class n{constructor(t=0,e=0,i=0,s=n.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=i,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,i,s=this._order){return this._x=t,this._y=e,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,i=!0){let s=t.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],f=s[2],u=s[6],d=s[10];switch(e){case"XYZ":this._y=Math.asin(Pe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,d),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Pe(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(Pe(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-f,d),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Pe(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(u,d),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Pe(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(o,d));break;case"XZY":this._z=Math.asin(-Pe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,d),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,i){return Hh.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Hh,e,i)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Vh.setFromEuler(this),this.setFromQuaternion(Vh,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};In.DEFAULT_ORDER="XYZ";var xr=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},Qd=0,Gh=new R,vs=new Ri,jn=new re,Zr=new R,sr=new R,jd=new R,tp=new Ri,Wh=new R(1,0,0),Xh=new R(0,1,0),qh=new R(0,0,1),Yh={type:"added"},ep={type:"removed"},ys={type:"childadded",child:null},Lo={type:"childremoved",child:null},_e=class n extends Ai{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Qd++}),this.uuid=ri(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let t=new R,e=new In,i=new Ri,s=new R(1,1,1);function r(){i.setFromEuler(e,!1)}function a(){e.setFromQuaternion(i,void 0,!1)}e._onChange(r),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new re},normalMatrix:{value:new zt}}),this.matrix=new re,this.matrixWorld=new re,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new xr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return vs.setFromAxisAngle(t,e),this.quaternion.multiply(vs),this}rotateOnWorldAxis(t,e){return vs.setFromAxisAngle(t,e),this.quaternion.premultiply(vs),this}rotateX(t){return this.rotateOnAxis(Wh,t)}rotateY(t){return this.rotateOnAxis(Xh,t)}rotateZ(t){return this.rotateOnAxis(qh,t)}translateOnAxis(t,e){return Gh.copy(t).applyQuaternion(this.quaternion),this.position.add(Gh.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Wh,t)}translateY(t){return this.translateOnAxis(Xh,t)}translateZ(t){return this.translateOnAxis(qh,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(jn.copy(this.matrixWorld).invert())}lookAt(t,e,i){t.isVector3?Zr.copy(t):Zr.set(t,e,i);let s=this.parent;this.updateWorldMatrix(!0,!1),sr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?jn.lookAt(sr,Zr,this.up):jn.lookAt(Zr,sr,this.up),this.quaternion.setFromRotationMatrix(jn),s&&(jn.extractRotation(s.matrixWorld),vs.setFromRotationMatrix(jn),this.quaternion.premultiply(vs.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Yh),ys.child=t,this.dispatchEvent(ys),ys.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(ep),Lo.child=t,this.dispatchEvent(Lo),Lo.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),jn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),jn.multiply(t.parent.matrixWorld)),t.applyMatrix4(jn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Yh),ys.child=t,this.dispatchEvent(ys),ys.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let i=0,s=this.children.length;i<s;i++){let a=this.children[i].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,i=[]){this[t]===e&&i.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(sr,t,jd),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(sr,tp,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);let e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].updateMatrixWorld(t)}updateWorldMatrix(t,e){let i=this.parent;if(t===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(t){let e=t===void 0||typeof t=="string",i={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(o=>({boxInitialized:o.boxInitialized,boxMin:o.box.min.toArray(),boxMax:o.box.max.toArray(),sphereInitialized:o.sphereInitialized,sphereRadius:o.sphere.radius,sphereCenter:o.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let f=l[c];r(t.shapes,f)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(t.animations,l))}}if(e){let o=a(t.geometries),l=a(t.materials),c=a(t.textures),h=a(t.images),f=a(t.shapes),u=a(t.skeletons),d=a(t.animations),g=a(t.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),f.length>0&&(i.shapes=f),u.length>0&&(i.skeletons=u),d.length>0&&(i.animations=d),g.length>0&&(i.nodes=g)}return i.object=s,i;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let i=0;i<t.children.length;i++){let s=t.children[i];this.add(s.clone())}return this}};_e.DEFAULT_UP=new R(0,1,0);_e.DEFAULT_MATRIX_AUTO_UPDATE=!0;_e.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var An=new R,ti=new R,Do=new R,ei=new R,xs=new R,Ms=new R,Zh=new R,Uo=new R,No=new R,Oo=new R,Fo=new ge,ko=new ge,Bo=new ge,Si=class n{constructor(t=new R,e=new R,i=new R){this.a=t,this.b=e,this.c=i}static getNormal(t,e,i,s){s.subVectors(i,e),An.subVectors(t,e),s.cross(An);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,i,s,r){An.subVectors(s,e),ti.subVectors(i,e),Do.subVectors(t,e);let a=An.dot(An),o=An.dot(ti),l=An.dot(Do),c=ti.dot(ti),h=ti.dot(Do),f=a*c-o*o;if(f===0)return r.set(0,0,0),null;let u=1/f,d=(c*l-o*h)*u,g=(a*h-o*l)*u;return r.set(1-d-g,g,d)}static containsPoint(t,e,i,s){return this.getBarycoord(t,e,i,s,ei)===null?!1:ei.x>=0&&ei.y>=0&&ei.x+ei.y<=1}static getInterpolation(t,e,i,s,r,a,o,l){return this.getBarycoord(t,e,i,s,ei)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,ei.x),l.addScaledVector(a,ei.y),l.addScaledVector(o,ei.z),l)}static getInterpolatedAttribute(t,e,i,s,r,a){return Fo.setScalar(0),ko.setScalar(0),Bo.setScalar(0),Fo.fromBufferAttribute(t,e),ko.fromBufferAttribute(t,i),Bo.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(Fo,r.x),a.addScaledVector(ko,r.y),a.addScaledVector(Bo,r.z),a}static isFrontFacing(t,e,i,s){return An.subVectors(i,e),ti.subVectors(t,e),An.cross(ti).dot(s)<0}set(t,e,i){return this.a.copy(t),this.b.copy(e),this.c.copy(i),this}setFromPointsAndIndices(t,e,i,s){return this.a.copy(t[e]),this.b.copy(t[i]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,i,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return An.subVectors(this.c,this.b),ti.subVectors(this.a,this.b),An.cross(ti).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return n.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return n.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,i,s,r){return n.getInterpolation(t,this.a,this.b,this.c,e,i,s,r)}containsPoint(t){return n.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return n.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let i=this.a,s=this.b,r=this.c,a,o;xs.subVectors(s,i),Ms.subVectors(r,i),Uo.subVectors(t,i);let l=xs.dot(Uo),c=Ms.dot(Uo);if(l<=0&&c<=0)return e.copy(i);No.subVectors(t,s);let h=xs.dot(No),f=Ms.dot(No);if(h>=0&&f<=h)return e.copy(s);let u=l*f-h*c;if(u<=0&&l>=0&&h<=0)return a=l/(l-h),e.copy(i).addScaledVector(xs,a);Oo.subVectors(t,r);let d=xs.dot(Oo),g=Ms.dot(Oo);if(g>=0&&d<=g)return e.copy(r);let _=d*c-l*g;if(_<=0&&c>=0&&g<=0)return o=c/(c-g),e.copy(i).addScaledVector(Ms,o);let m=h*g-d*f;if(m<=0&&f-h>=0&&d-g>=0)return Zh.subVectors(r,s),o=(f-h)/(f-h+(d-g)),e.copy(s).addScaledVector(Zh,o);let p=1/(m+_+u);return a=_*p,o=u*p,e.copy(i).addScaledVector(xs,a).addScaledVector(Ms,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},$f={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},xi={h:0,s:0,l:0},$r={h:0,s:0,l:0};function zo(n,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?n+(t-n)*6*e:e<1/2?t:e<2/3?n+(t-n)*6*(2/3-e):n}var At=class{constructor(t,e,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,i)}set(t,e,i){if(e===void 0&&i===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=fe){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,te.toWorkingColorSpace(this,e),this}setRGB(t,e,i,s=te.workingColorSpace){return this.r=t,this.g=e,this.b=i,te.toWorkingColorSpace(this,s),this}setHSL(t,e,i,s=te.workingColorSpace){if(t=Fc(t,1),e=Pe(e,0,1),i=Pe(i,0,1),e===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+e):i+e-i*e,a=2*i-r;this.r=zo(a,r,t+1/3),this.g=zo(a,r,t),this.b=zo(a,r,t-1/3)}return te.toWorkingColorSpace(this,s),this}setStyle(t,e=fe){function i(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=fe){let i=$f[t.toLowerCase()];return i!==void 0?this.setHex(i,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Ds(t.r),this.g=Ds(t.g),this.b=Ds(t.b),this}copyLinearToSRGB(t){return this.r=wo(t.r),this.g=wo(t.g),this.b=wo(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=fe){return te.fromWorkingColorSpace(Fe.copy(this),t),Math.round(Pe(Fe.r*255,0,255))*65536+Math.round(Pe(Fe.g*255,0,255))*256+Math.round(Pe(Fe.b*255,0,255))}getHexString(t=fe){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=te.workingColorSpace){te.fromWorkingColorSpace(Fe.copy(this),e);let i=Fe.r,s=Fe.g,r=Fe.b,a=Math.max(i,s,r),o=Math.min(i,s,r),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let f=a-o;switch(c=h<=.5?f/(a+o):f/(2-a-o),a){case i:l=(s-r)/f+(s<r?6:0);break;case s:l=(r-i)/f+2;break;case r:l=(i-s)/f+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=te.workingColorSpace){return te.fromWorkingColorSpace(Fe.copy(this),e),t.r=Fe.r,t.g=Fe.g,t.b=Fe.b,t}getStyle(t=fe){te.fromWorkingColorSpace(Fe.copy(this),t);let e=Fe.r,i=Fe.g,s=Fe.b;return t!==fe?`color(${t} ${e.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(t,e,i){return this.getHSL(xi),this.setHSL(xi.h+t,xi.s+e,xi.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,i){return this.r=t.r+(e.r-t.r)*i,this.g=t.g+(e.g-t.g)*i,this.b=t.b+(e.b-t.b)*i,this}lerpHSL(t,e){this.getHSL(xi),t.getHSL($r);let i=dr(xi.h,$r.h,e),s=dr(xi.s,$r.s,e),r=dr(xi.l,$r.l,e);return this.setHSL(i,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,i=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*i+r[6]*s,this.g=r[1]*e+r[4]*i+r[7]*s,this.b=r[2]*e+r[5]*i+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Fe=new At;At.NAMES=$f;var np=0,ci=class extends Ai{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:np++}),this.uuid=ri(),this.name="",this.type="Material",this.blending=Ei,this.side=Ti,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=el,this.blendDst=nl,this.blendEquation=Xi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new At(0,0,0),this.blendAlpha=0,this.depthFunc=Ns,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Uh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=us,this.stencilZFail=us,this.stencilZPass=us,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let i=t[e];if(i===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Ei&&(i.blending=this.blending),this.side!==Ti&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==el&&(i.blendSrc=this.blendSrc),this.blendDst!==nl&&(i.blendDst=this.blendDst),this.blendEquation!==Xi&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==Ns&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Uh&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==us&&(i.stencilFail=this.stencilFail),this.stencilZFail!==us&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==us&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(e){let r=s(t.textures),a=s(t.images);r.length>0&&(i.textures=r),a.length>0&&(i.images=a)}return i}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,i=null;if(e!==null){let s=e.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=e[r].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}},xe=class extends ci{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new At(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new In,this.combine=Ac,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}};var we=new R,Jr=new ct,Ee=class{constructor(t,e,i=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=i,this.usage=zl,this.updateRanges=[],this.gpuType=zn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,i){t*=this.itemSize,i*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[i+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,i=this.count;e<i;e++)Jr.fromBufferAttribute(this,e),Jr.applyMatrix3(t),this.setXY(e,Jr.x,Jr.y);else if(this.itemSize===3)for(let e=0,i=this.count;e<i;e++)we.fromBufferAttribute(this,e),we.applyMatrix3(t),this.setXYZ(e,we.x,we.y,we.z);return this}applyMatrix4(t){for(let e=0,i=this.count;e<i;e++)we.fromBufferAttribute(this,e),we.applyMatrix4(t),this.setXYZ(e,we.x,we.y,we.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)we.fromBufferAttribute(this,e),we.applyNormalMatrix(t),this.setXYZ(e,we.x,we.y,we.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)we.fromBufferAttribute(this,e),we.transformDirection(t),this.setXYZ(e,we.x,we.y,we.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let i=this.array[t*this.itemSize+e];return this.normalized&&(i=Cn(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=ie(i,this.array)),this.array[t*this.itemSize+e]=i,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Cn(e,this.array)),e}setX(t,e){return this.normalized&&(e=ie(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Cn(e,this.array)),e}setY(t,e){return this.normalized&&(e=ie(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Cn(e,this.array)),e}setZ(t,e){return this.normalized&&(e=ie(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Cn(e,this.array)),e}setW(t,e){return this.normalized&&(e=ie(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,i){return t*=this.itemSize,this.normalized&&(e=ie(e,this.array),i=ie(i,this.array)),this.array[t+0]=e,this.array[t+1]=i,this}setXYZ(t,e,i,s){return t*=this.itemSize,this.normalized&&(e=ie(e,this.array),i=ie(i,this.array),s=ie(s,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=s,this}setXYZW(t,e,i,s,r){return t*=this.itemSize,this.normalized&&(e=ie(e,this.array),i=ie(i,this.array),s=ie(s,this.array),r=ie(r,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==zl&&(t.usage=this.usage),t}};var Ra=class extends Ee{constructor(t,e,i){super(new Uint16Array(t),e,i)}};var Ca=class extends Ee{constructor(t,e,i){super(new Uint32Array(t),e,i)}};var ee=class extends Ee{constructor(t,e,i){super(new Float32Array(t),e,i)}},ip=0,dn=new re,Ho=new _e,bs=new R,rn=new li,rr=new li,Ce=new R,Ge=class n extends Ai{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:ip++}),this.uuid=ri(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Zf(t)?Ca:Ra)(t,1):this.index=t,this}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,i=0){this.groups.push({start:t,count:e,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new zt().getNormalMatrix(t);i.applyNormalMatrix(r),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return dn.makeRotationFromQuaternion(t),this.applyMatrix4(dn),this}rotateX(t){return dn.makeRotationX(t),this.applyMatrix4(dn),this}rotateY(t){return dn.makeRotationY(t),this.applyMatrix4(dn),this}rotateZ(t){return dn.makeRotationZ(t),this.applyMatrix4(dn),this}translate(t,e,i){return dn.makeTranslation(t,e,i),this.applyMatrix4(dn),this}scale(t,e,i){return dn.makeScale(t,e,i),this.applyMatrix4(dn),this}lookAt(t){return Ho.lookAt(t),Ho.updateMatrix(),this.applyMatrix4(Ho.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(bs).negate(),this.translate(bs.x,bs.y,bs.z),this}setFromPoints(t){let e=[];for(let i=0,s=t.length;i<s;i++){let r=t[i];e.push(r.x,r.y,r.z||0)}return this.setAttribute("position",new ee(e,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new li);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new R(-1/0,-1/0,-1/0),new R(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let i=0,s=e.length;i<s;i++){let r=e[i];rn.setFromBufferAttribute(r),this.morphTargetsRelative?(Ce.addVectors(this.boundingBox.min,rn.min),this.boundingBox.expandByPoint(Ce),Ce.addVectors(this.boundingBox.max,rn.max),this.boundingBox.expandByPoint(Ce)):(this.boundingBox.expandByPoint(rn.min),this.boundingBox.expandByPoint(rn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ji);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new R,1/0);return}if(t){let i=this.boundingSphere.center;if(rn.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){let o=e[r];rr.setFromBufferAttribute(o),this.morphTargetsRelative?(Ce.addVectors(rn.min,rr.min),rn.expandByPoint(Ce),Ce.addVectors(rn.max,rr.max),rn.expandByPoint(Ce)):(rn.expandByPoint(rr.min),rn.expandByPoint(rr.max))}rn.getCenter(i);let s=0;for(let r=0,a=t.count;r<a;r++)Ce.fromBufferAttribute(t,r),s=Math.max(s,i.distanceToSquared(Ce));if(e)for(let r=0,a=e.length;r<a;r++){let o=e[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)Ce.fromBufferAttribute(o,c),l&&(bs.fromBufferAttribute(t,c),Ce.add(bs)),s=Math.max(s,i.distanceToSquared(Ce))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ee(new Float32Array(4*i.count),4));let a=this.getAttribute("tangent"),o=[],l=[];for(let I=0;I<i.count;I++)o[I]=new R,l[I]=new R;let c=new R,h=new R,f=new R,u=new ct,d=new ct,g=new ct,_=new R,m=new R;function p(I,B,v){c.fromBufferAttribute(i,I),h.fromBufferAttribute(i,B),f.fromBufferAttribute(i,v),u.fromBufferAttribute(r,I),d.fromBufferAttribute(r,B),g.fromBufferAttribute(r,v),h.sub(c),f.sub(c),d.sub(u),g.sub(u);let b=1/(d.x*g.y-g.x*d.y);isFinite(b)&&(_.copy(h).multiplyScalar(g.y).addScaledVector(f,-d.y).multiplyScalar(b),m.copy(f).multiplyScalar(d.x).addScaledVector(h,-g.x).multiplyScalar(b),o[I].add(_),o[B].add(_),o[v].add(_),l[I].add(m),l[B].add(m),l[v].add(m))}let w=this.groups;w.length===0&&(w=[{start:0,count:t.count}]);for(let I=0,B=w.length;I<B;++I){let v=w[I],b=v.start,F=v.count;for(let N=b,V=b+F;N<V;N+=3)p(t.getX(N+0),t.getX(N+1),t.getX(N+2))}let x=new R,S=new R,P=new R,T=new R;function A(I){P.fromBufferAttribute(s,I),T.copy(P);let B=o[I];x.copy(B),x.sub(P.multiplyScalar(P.dot(B))).normalize(),S.crossVectors(T,B);let b=S.dot(l[I])<0?-1:1;a.setXYZW(I,x.x,x.y,x.z,b)}for(let I=0,B=w.length;I<B;++I){let v=w[I],b=v.start,F=v.count;for(let N=b,V=b+F;N<V;N+=3)A(t.getX(N+0)),A(t.getX(N+1)),A(t.getX(N+2))}}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Ee(new Float32Array(e.count*3),3),this.setAttribute("normal",i);else for(let u=0,d=i.count;u<d;u++)i.setXYZ(u,0,0,0);let s=new R,r=new R,a=new R,o=new R,l=new R,c=new R,h=new R,f=new R;if(t)for(let u=0,d=t.count;u<d;u+=3){let g=t.getX(u+0),_=t.getX(u+1),m=t.getX(u+2);s.fromBufferAttribute(e,g),r.fromBufferAttribute(e,_),a.fromBufferAttribute(e,m),h.subVectors(a,r),f.subVectors(s,r),h.cross(f),o.fromBufferAttribute(i,g),l.fromBufferAttribute(i,_),c.fromBufferAttribute(i,m),o.add(h),l.add(h),c.add(h),i.setXYZ(g,o.x,o.y,o.z),i.setXYZ(_,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let u=0,d=e.count;u<d;u+=3)s.fromBufferAttribute(e,u+0),r.fromBufferAttribute(e,u+1),a.fromBufferAttribute(e,u+2),h.subVectors(a,r),f.subVectors(s,r),h.cross(f),i.setXYZ(u+0,h.x,h.y,h.z),i.setXYZ(u+1,h.x,h.y,h.z),i.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,i=t.count;e<i;e++)Ce.fromBufferAttribute(t,e),Ce.normalize(),t.setXYZ(e,Ce.x,Ce.y,Ce.z)}toNonIndexed(){function t(o,l){let c=o.array,h=o.itemSize,f=o.normalized,u=new c.constructor(l.length*h),d=0,g=0;for(let _=0,m=l.length;_<m;_++){o.isInterleavedBufferAttribute?d=l[_]*o.data.stride+o.offset:d=l[_]*h;for(let p=0;p<h;p++)u[g++]=c[d++]}return new Ee(u,h,f)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new n,i=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=t(l,i);e.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let h=0,f=c.length;h<f;h++){let u=c[h],d=t(u,i);l.push(d)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let i=this.attributes;for(let l in i){let c=i[l];t.data.attributes[l]=c.toJSON(t.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let f=0,u=c.length;f<u;f++){let d=c[f];h.push(d.toJSON(t.data))}h.length>0&&(s[l]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere={center:o.center.toArray(),radius:o.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let i=t.index;i!==null&&this.setIndex(i.clone(e));let s=t.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(e))}let r=t.morphAttributes;for(let c in r){let h=[],f=r[c];for(let u=0,d=f.length;u<d;u++)h.push(f[u].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let a=t.groups;for(let c=0,h=a.length;c<h;c++){let f=a[c];this.addGroup(f.start,f.count,f.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},$h=new re,zi=new Aa,Kr=new Ji,Jh=new R,Qr=new R,jr=new R,ta=new R,Vo=new R,ea=new R,Kh=new R,na=new R,kt=class extends _e{constructor(t=new Ge,e=new xe){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let s=e[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){let i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,a=i.morphTargetsRelative;e.fromBufferAttribute(s,t);let o=this.morphTargetInfluences;if(r&&o){ea.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=o[l],f=r[l];h!==0&&(Vo.fromBufferAttribute(f,t),a?ea.addScaledVector(Vo,h):ea.addScaledVector(Vo.sub(e),h))}e.add(ea)}return e}raycast(t,e){let i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Kr.copy(i.boundingSphere),Kr.applyMatrix4(r),zi.copy(t.ray).recast(t.near),!(Kr.containsPoint(zi.origin)===!1&&(zi.intersectSphere(Kr,Jh)===null||zi.origin.distanceToSquared(Jh)>(t.far-t.near)**2))&&($h.copy(r).invert(),zi.copy(t.ray).applyMatrix4($h),!(i.boundingBox!==null&&zi.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,e,zi)))}_computeIntersections(t,e,i){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,f=r.attributes.normal,u=r.groups,d=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,_=u.length;g<_;g++){let m=u[g],p=a[m.materialIndex],w=Math.max(m.start,d.start),x=Math.min(o.count,Math.min(m.start+m.count,d.start+d.count));for(let S=w,P=x;S<P;S+=3){let T=o.getX(S),A=o.getX(S+1),I=o.getX(S+2);s=ia(this,p,t,i,c,h,f,T,A,I),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let g=Math.max(0,d.start),_=Math.min(o.count,d.start+d.count);for(let m=g,p=_;m<p;m+=3){let w=o.getX(m),x=o.getX(m+1),S=o.getX(m+2);s=ia(this,a,t,i,c,h,f,w,x,S),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let g=0,_=u.length;g<_;g++){let m=u[g],p=a[m.materialIndex],w=Math.max(m.start,d.start),x=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let S=w,P=x;S<P;S+=3){let T=S,A=S+1,I=S+2;s=ia(this,p,t,i,c,h,f,T,A,I),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let g=Math.max(0,d.start),_=Math.min(l.count,d.start+d.count);for(let m=g,p=_;m<p;m+=3){let w=m,x=m+1,S=m+2;s=ia(this,a,t,i,c,h,f,w,x,S),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}};function sp(n,t,e,i,s,r,a,o){let l;if(t.side===Qe?l=i.intersectTriangle(a,r,s,!0,o):l=i.intersectTriangle(s,r,a,t.side===Ti,o),l===null)return null;na.copy(o),na.applyMatrix4(n.matrixWorld);let c=e.ray.origin.distanceTo(na);return c<e.near||c>e.far?null:{distance:c,point:na.clone(),object:n}}function ia(n,t,e,i,s,r,a,o,l,c){n.getVertexPosition(o,Qr),n.getVertexPosition(l,jr),n.getVertexPosition(c,ta);let h=sp(n,t,e,i,Qr,jr,ta,Kh);if(h){let f=new R;Si.getBarycoord(Kh,Qr,jr,ta,f),s&&(h.uv=Si.getInterpolatedAttribute(s,o,l,c,f,new ct)),r&&(h.uv1=Si.getInterpolatedAttribute(r,o,l,c,f,new ct)),a&&(h.normal=Si.getInterpolatedAttribute(a,o,l,c,f,new R),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let u={a:o,b:l,c,normal:new R,materialIndex:0};Si.getNormal(Qr,jr,ta,u.normal),h.face=u,h.barycoord=f}return h}var an=class n extends Ge{constructor(t=1,e=1,i=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:i,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],h=[],f=[],u=0,d=0;g("z","y","x",-1,-1,i,e,t,a,r,0),g("z","y","x",1,-1,i,e,-t,a,r,1),g("x","z","y",1,1,t,i,e,s,a,2),g("x","z","y",1,-1,t,i,-e,s,a,3),g("x","y","z",1,-1,t,e,i,s,r,4),g("x","y","z",-1,-1,t,e,-i,s,r,5),this.setIndex(l),this.setAttribute("position",new ee(c,3)),this.setAttribute("normal",new ee(h,3)),this.setAttribute("uv",new ee(f,2));function g(_,m,p,w,x,S,P,T,A,I,B){let v=S/A,b=P/I,F=S/2,N=P/2,V=T/2,Y=A+1,H=I+1,tt=0,G=0,at=new R;for(let ft=0;ft<H;ft++){let rt=ft*b-N;for(let Dt=0;Dt<Y;Dt++){let Ut=Dt*v-F;at[_]=Ut*w,at[m]=rt*x,at[p]=V,c.push(at.x,at.y,at.z),at[_]=0,at[m]=0,at[p]=T>0?1:-1,h.push(at.x,at.y,at.z),f.push(Dt/A),f.push(1-ft/I),tt+=1}}for(let ft=0;ft<I;ft++)for(let rt=0;rt<A;rt++){let Dt=u+rt+Y*ft,Ut=u+rt+Y*(ft+1),q=u+(rt+1)+Y*(ft+1),et=u+(rt+1)+Y*ft;l.push(Dt,Ut,et),l.push(Ut,q,et),G+=6}o.addGroup(d,G,B),d+=G,u+=tt}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};function Hs(n){let t={};for(let e in n){t[e]={};for(let i in n[e]){let s=n[e][i];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][i]=null):t[e][i]=s.clone():Array.isArray(s)?t[e][i]=s.slice():t[e][i]=s}}return t}function ze(n){let t={};for(let e=0;e<n.length;e++){let i=Hs(n[e]);for(let s in i)t[s]=i[s]}return t}function rp(n){let t=[];for(let e=0;e<n.length;e++)t.push(n[e].clone());return t}function Jf(n){let t=n.getRenderTarget();return t===null?n.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:te.workingColorSpace}var ap={clone:Hs,merge:ze},op=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,lp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,We=class extends ci{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=op,this.fragmentShader=lp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Hs(t.uniforms),this.uniformsGroups=rp(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(e.extensions=i),e}},Pa=class extends _e{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new re,this.projectionMatrix=new re,this.projectionMatrixInverse=new re,this.coordinateSystem=si}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Mi=new R,Qh=new ct,jh=new ct,He=class extends Pa{constructor(t=50,e=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=vr*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(ur*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return vr*2*Math.atan(Math.tan(ur*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,i){Mi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Mi.x,Mi.y).multiplyScalar(-t/Mi.z),Mi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Mi.x,Mi.y).multiplyScalar(-t/Mi.z)}getViewSize(t,e){return this.getViewBounds(t,Qh,jh),e.subVectors(jh,Qh)}setViewOffset(t,e,i,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(ur*.5*this.fov)/this.zoom,i=2*e,s=this.aspect*i,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,e-=a.offsetY*i/c,s*=a.width/l,i*=a.height/c}let o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-i,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}},Ss=-90,ws=1,Wl=class extends _e{constructor(t,e,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new He(Ss,ws,t,e);s.layers=this.layers,this.add(s);let r=new He(Ss,ws,t,e);r.layers=this.layers,this.add(r);let a=new He(Ss,ws,t,e);a.layers=this.layers,this.add(a);let o=new He(Ss,ws,t,e);o.layers=this.layers,this.add(o);let l=new He(Ss,ws,t,e);l.layers=this.layers,this.add(l);let c=new He(Ss,ws,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[i,s,r,a,o,l]=e;for(let c of e)this.remove(c);if(t===si)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===wa)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,h]=this.children,f=t.getRenderTarget(),u=t.getActiveCubeFace(),d=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;let _=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,t.setRenderTarget(i,0,s),t.render(e,r),t.setRenderTarget(i,1,s),t.render(e,a),t.setRenderTarget(i,2,s),t.render(e,o),t.setRenderTarget(i,3,s),t.render(e,l),t.setRenderTarget(i,4,s),t.render(e,c),i.texture.generateMipmaps=_,t.setRenderTarget(i,5,s),t.render(e,h),t.setRenderTarget(f,u,d),t.xr.enabled=g,i.texture.needsPMREMUpdate=!0}},Ia=class extends Ve{constructor(t,e,i,s,r,a,o,l,c,h){t=t!==void 0?t:[],e=e!==void 0?e:Os,super(t,e,i,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},Xl=class extends oi{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let i={width:t,height:t,depth:1},s=[i,i,i,i,i,i];this.texture=new Ia(s,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:Rn}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new an(5,5,5),r=new We({name:"CubemapFromEquirect",uniforms:Hs(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Qe,blending:wi});r.uniforms.tEquirect.value=e;let a=new kt(s,r),o=e.minFilter;return e.minFilter===Zi&&(e.minFilter=Rn),new Wl(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e,i,s){let r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,i,s);t.setRenderTarget(r)}},Go=new R,cp=new R,hp=new zt,ii=class{constructor(t=new R(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,i,s){return this.normal.set(t,e,i),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,i){let s=Go.subVectors(i,e).cross(cp.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){let i=t.delta(Go),s=this.normal.dot(i);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(i,r)}intersectsLine(t){let e=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return e<0&&i>0||i<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let i=e||hp.getNormalMatrix(t),s=this.coplanarPoint(Go).applyMatrix4(t),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}},Hi=new Ji,sa=new R,Mr=class{constructor(t=new ii,e=new ii,i=new ii,s=new ii,r=new ii,a=new ii){this.planes=[t,e,i,s,r,a]}set(t,e,i,s,r,a){let o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(i),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){let e=this.planes;for(let i=0;i<6;i++)e[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,e=si){let i=this.planes,s=t.elements,r=s[0],a=s[1],o=s[2],l=s[3],c=s[4],h=s[5],f=s[6],u=s[7],d=s[8],g=s[9],_=s[10],m=s[11],p=s[12],w=s[13],x=s[14],S=s[15];if(i[0].setComponents(l-r,u-c,m-d,S-p).normalize(),i[1].setComponents(l+r,u+c,m+d,S+p).normalize(),i[2].setComponents(l+a,u+h,m+g,S+w).normalize(),i[3].setComponents(l-a,u-h,m-g,S-w).normalize(),i[4].setComponents(l-o,u-f,m-_,S-x).normalize(),e===si)i[5].setComponents(l+o,u+f,m+_,S+x).normalize();else if(e===wa)i[5].setComponents(o,f,_,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Hi.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Hi.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Hi)}intersectsSprite(t){return Hi.center.set(0,0,0),Hi.radius=.7071067811865476,Hi.applyMatrix4(t.matrixWorld),this.intersectsSphere(Hi)}intersectsSphere(t){let e=this.planes,i=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let i=0;i<6;i++){let s=e[i];if(sa.x=s.normal.x>0?t.max.x:t.min.x,sa.y=s.normal.y>0?t.max.y:t.min.y,sa.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(sa)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let i=0;i<6;i++)if(e[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};function Kf(){let n=null,t=!1,e=null,i=null;function s(r,a){e(r,a),i=n.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(i=n.requestAnimationFrame(s),t=!0)},stop:function(){n.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){n=r}}}function fp(n){let t=new WeakMap;function e(o,l){let c=o.array,h=o.usage,f=c.byteLength,u=n.createBuffer();n.bindBuffer(l,u),n.bufferData(l,c,h),o.onUploadCallback();let d;if(c instanceof Float32Array)d=n.FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?d=n.HALF_FLOAT:d=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=n.SHORT;else if(c instanceof Uint32Array)d=n.UNSIGNED_INT;else if(c instanceof Int32Array)d=n.INT;else if(c instanceof Int8Array)d=n.BYTE;else if(c instanceof Uint8Array)d=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:f}}function i(o,l,c){let h=l.array,f=l.updateRanges;if(n.bindBuffer(c,o),f.length===0)n.bufferSubData(c,0,h);else{f.sort((d,g)=>d.start-g.start);let u=0;for(let d=1;d<f.length;d++){let g=f[u],_=f[d];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++u,f[u]=_)}f.length=u+1;for(let d=0,g=f.length;d<g;d++){let _=f[d];n.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=t.get(o);l&&(n.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var mn=class n extends Ge{constructor(t=1,e=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:i,heightSegments:s};let r=t/2,a=e/2,o=Math.floor(i),l=Math.floor(s),c=o+1,h=l+1,f=t/o,u=e/l,d=[],g=[],_=[],m=[];for(let p=0;p<h;p++){let w=p*u-a;for(let x=0;x<c;x++){let S=x*f-r;g.push(S,-w,0),_.push(0,0,1),m.push(x/o),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let w=0;w<o;w++){let x=w+c*p,S=w+c*(p+1),P=w+1+c*(p+1),T=w+1+c*p;d.push(x,S,T),d.push(S,P,T)}this.setIndex(d),this.setAttribute("position",new ee(g,3)),this.setAttribute("normal",new ee(_,3)),this.setAttribute("uv",new ee(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.width,t.height,t.widthSegments,t.heightSegments)}},up=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,dp=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,pp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,mp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,gp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,_p=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,vp=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,yp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,xp=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Mp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,bp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Sp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,wp=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Ep=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Tp=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Ap=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Rp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Cp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Pp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Ip=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Lp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Dp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Up=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Np=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Op=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Fp=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,kp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Bp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,zp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Hp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Vp="gl_FragColor = linearToOutputTexel( gl_FragColor );",Gp=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Wp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Xp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,qp=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Yp=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Zp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,$p=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Jp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Kp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Qp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,jp=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,tm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,em=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,nm=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,im=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,sm=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,rm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,am=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,om=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lm=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,cm=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,hm=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,fm=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,um=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,dm=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,pm=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,mm=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,gm=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,_m=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,vm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,ym=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,xm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Mm=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,bm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Sm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,wm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Em=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Tm=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Am=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Rm=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Cm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Pm=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Im=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Lm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Dm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Um=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Nm=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Om=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Fm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,km=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Bm=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,zm=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Hm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Vm=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Gm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Wm=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Xm=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,qm=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Ym=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Zm=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,$m=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Jm=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Km=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Qm=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,jm=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,t0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,e0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,n0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,i0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,s0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,r0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,a0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,o0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,l0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,c0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,h0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,f0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,u0=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,d0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,p0=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,m0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,g0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,_0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,v0=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,y0=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,x0=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,M0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,b0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,S0=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,w0=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,E0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,T0=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,A0=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,R0=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,C0=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,P0=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,I0=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,L0=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,D0=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,U0=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,N0=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,O0=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,F0=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,k0=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,B0=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,z0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,H0=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,V0=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,G0=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,W0=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Bt={alphahash_fragment:up,alphahash_pars_fragment:dp,alphamap_fragment:pp,alphamap_pars_fragment:mp,alphatest_fragment:gp,alphatest_pars_fragment:_p,aomap_fragment:vp,aomap_pars_fragment:yp,batching_pars_vertex:xp,batching_vertex:Mp,begin_vertex:bp,beginnormal_vertex:Sp,bsdfs:wp,iridescence_fragment:Ep,bumpmap_pars_fragment:Tp,clipping_planes_fragment:Ap,clipping_planes_pars_fragment:Rp,clipping_planes_pars_vertex:Cp,clipping_planes_vertex:Pp,color_fragment:Ip,color_pars_fragment:Lp,color_pars_vertex:Dp,color_vertex:Up,common:Np,cube_uv_reflection_fragment:Op,defaultnormal_vertex:Fp,displacementmap_pars_vertex:kp,displacementmap_vertex:Bp,emissivemap_fragment:zp,emissivemap_pars_fragment:Hp,colorspace_fragment:Vp,colorspace_pars_fragment:Gp,envmap_fragment:Wp,envmap_common_pars_fragment:Xp,envmap_pars_fragment:qp,envmap_pars_vertex:Yp,envmap_physical_pars_fragment:sm,envmap_vertex:Zp,fog_vertex:$p,fog_pars_vertex:Jp,fog_fragment:Kp,fog_pars_fragment:Qp,gradientmap_pars_fragment:jp,lightmap_pars_fragment:tm,lights_lambert_fragment:em,lights_lambert_pars_fragment:nm,lights_pars_begin:im,lights_toon_fragment:rm,lights_toon_pars_fragment:am,lights_phong_fragment:om,lights_phong_pars_fragment:lm,lights_physical_fragment:cm,lights_physical_pars_fragment:hm,lights_fragment_begin:fm,lights_fragment_maps:um,lights_fragment_end:dm,logdepthbuf_fragment:pm,logdepthbuf_pars_fragment:mm,logdepthbuf_pars_vertex:gm,logdepthbuf_vertex:_m,map_fragment:vm,map_pars_fragment:ym,map_particle_fragment:xm,map_particle_pars_fragment:Mm,metalnessmap_fragment:bm,metalnessmap_pars_fragment:Sm,morphinstance_vertex:wm,morphcolor_vertex:Em,morphnormal_vertex:Tm,morphtarget_pars_vertex:Am,morphtarget_vertex:Rm,normal_fragment_begin:Cm,normal_fragment_maps:Pm,normal_pars_fragment:Im,normal_pars_vertex:Lm,normal_vertex:Dm,normalmap_pars_fragment:Um,clearcoat_normal_fragment_begin:Nm,clearcoat_normal_fragment_maps:Om,clearcoat_pars_fragment:Fm,iridescence_pars_fragment:km,opaque_fragment:Bm,packing:zm,premultiplied_alpha_fragment:Hm,project_vertex:Vm,dithering_fragment:Gm,dithering_pars_fragment:Wm,roughnessmap_fragment:Xm,roughnessmap_pars_fragment:qm,shadowmap_pars_fragment:Ym,shadowmap_pars_vertex:Zm,shadowmap_vertex:$m,shadowmask_pars_fragment:Jm,skinbase_vertex:Km,skinning_pars_vertex:Qm,skinning_vertex:jm,skinnormal_vertex:t0,specularmap_fragment:e0,specularmap_pars_fragment:n0,tonemapping_fragment:i0,tonemapping_pars_fragment:s0,transmission_fragment:r0,transmission_pars_fragment:a0,uv_pars_fragment:o0,uv_pars_vertex:l0,uv_vertex:c0,worldpos_vertex:h0,background_vert:f0,background_frag:u0,backgroundCube_vert:d0,backgroundCube_frag:p0,cube_vert:m0,cube_frag:g0,depth_vert:_0,depth_frag:v0,distanceRGBA_vert:y0,distanceRGBA_frag:x0,equirect_vert:M0,equirect_frag:b0,linedashed_vert:S0,linedashed_frag:w0,meshbasic_vert:E0,meshbasic_frag:T0,meshlambert_vert:A0,meshlambert_frag:R0,meshmatcap_vert:C0,meshmatcap_frag:P0,meshnormal_vert:I0,meshnormal_frag:L0,meshphong_vert:D0,meshphong_frag:U0,meshphysical_vert:N0,meshphysical_frag:O0,meshtoon_vert:F0,meshtoon_frag:k0,points_vert:B0,points_frag:z0,shadow_vert:H0,shadow_frag:V0,sprite_vert:G0,sprite_frag:W0},ot={common:{diffuse:{value:new At(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new zt},alphaMap:{value:null},alphaMapTransform:{value:new zt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new zt}},envmap:{envMap:{value:null},envMapRotation:{value:new zt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new zt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new zt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new zt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new zt},normalScale:{value:new ct(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new zt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new zt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new zt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new zt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new At(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new At(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new zt},alphaTest:{value:0},uvTransform:{value:new zt}},sprite:{diffuse:{value:new At(16777215)},opacity:{value:1},center:{value:new ct(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new zt},alphaMap:{value:null},alphaMapTransform:{value:new zt},alphaTest:{value:0}}},Bn={basic:{uniforms:ze([ot.common,ot.specularmap,ot.envmap,ot.aomap,ot.lightmap,ot.fog]),vertexShader:Bt.meshbasic_vert,fragmentShader:Bt.meshbasic_frag},lambert:{uniforms:ze([ot.common,ot.specularmap,ot.envmap,ot.aomap,ot.lightmap,ot.emissivemap,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.fog,ot.lights,{emissive:{value:new At(0)}}]),vertexShader:Bt.meshlambert_vert,fragmentShader:Bt.meshlambert_frag},phong:{uniforms:ze([ot.common,ot.specularmap,ot.envmap,ot.aomap,ot.lightmap,ot.emissivemap,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.fog,ot.lights,{emissive:{value:new At(0)},specular:{value:new At(1118481)},shininess:{value:30}}]),vertexShader:Bt.meshphong_vert,fragmentShader:Bt.meshphong_frag},standard:{uniforms:ze([ot.common,ot.envmap,ot.aomap,ot.lightmap,ot.emissivemap,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.roughnessmap,ot.metalnessmap,ot.fog,ot.lights,{emissive:{value:new At(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Bt.meshphysical_vert,fragmentShader:Bt.meshphysical_frag},toon:{uniforms:ze([ot.common,ot.aomap,ot.lightmap,ot.emissivemap,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.gradientmap,ot.fog,ot.lights,{emissive:{value:new At(0)}}]),vertexShader:Bt.meshtoon_vert,fragmentShader:Bt.meshtoon_frag},matcap:{uniforms:ze([ot.common,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.fog,{matcap:{value:null}}]),vertexShader:Bt.meshmatcap_vert,fragmentShader:Bt.meshmatcap_frag},points:{uniforms:ze([ot.points,ot.fog]),vertexShader:Bt.points_vert,fragmentShader:Bt.points_frag},dashed:{uniforms:ze([ot.common,ot.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Bt.linedashed_vert,fragmentShader:Bt.linedashed_frag},depth:{uniforms:ze([ot.common,ot.displacementmap]),vertexShader:Bt.depth_vert,fragmentShader:Bt.depth_frag},normal:{uniforms:ze([ot.common,ot.bumpmap,ot.normalmap,ot.displacementmap,{opacity:{value:1}}]),vertexShader:Bt.meshnormal_vert,fragmentShader:Bt.meshnormal_frag},sprite:{uniforms:ze([ot.sprite,ot.fog]),vertexShader:Bt.sprite_vert,fragmentShader:Bt.sprite_frag},background:{uniforms:{uvTransform:{value:new zt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Bt.background_vert,fragmentShader:Bt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new zt}},vertexShader:Bt.backgroundCube_vert,fragmentShader:Bt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Bt.cube_vert,fragmentShader:Bt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Bt.equirect_vert,fragmentShader:Bt.equirect_frag},distanceRGBA:{uniforms:ze([ot.common,ot.displacementmap,{referencePosition:{value:new R},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Bt.distanceRGBA_vert,fragmentShader:Bt.distanceRGBA_frag},shadow:{uniforms:ze([ot.lights,ot.fog,{color:{value:new At(0)},opacity:{value:1}}]),vertexShader:Bt.shadow_vert,fragmentShader:Bt.shadow_frag}};Bn.physical={uniforms:ze([Bn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new zt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new zt},clearcoatNormalScale:{value:new ct(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new zt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new zt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new zt},sheen:{value:0},sheenColor:{value:new At(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new zt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new zt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new zt},transmissionSamplerSize:{value:new ct},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new zt},attenuationDistance:{value:0},attenuationColor:{value:new At(0)},specularColor:{value:new At(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new zt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new zt},anisotropyVector:{value:new ct},anisotropyMap:{value:null},anisotropyMapTransform:{value:new zt}}]),vertexShader:Bt.meshphysical_vert,fragmentShader:Bt.meshphysical_frag};var ra={r:0,b:0,g:0},Vi=new In,X0=new re;function q0(n,t,e,i,s,r,a){let o=new At(0),l=r===!0?0:1,c,h,f=null,u=0,d=null;function g(w){let x=w.isScene===!0?w.background:null;return x&&x.isTexture&&(x=(w.backgroundBlurriness>0?e:t).get(x)),x}function _(w){let x=!1,S=g(w);S===null?p(o,l):S&&S.isColor&&(p(S,1),x=!0);let P=n.xr.getEnvironmentBlendMode();P==="additive"?i.buffers.color.setClear(0,0,0,1,a):P==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,a),(n.autoClear||x)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function m(w,x){let S=g(x);S&&(S.isCubeTexture||S.mapping===ja)?(h===void 0&&(h=new kt(new an(1,1,1),new We({name:"BackgroundCubeMaterial",uniforms:Hs(Bn.backgroundCube.uniforms),vertexShader:Bn.backgroundCube.vertexShader,fragmentShader:Bn.backgroundCube.fragmentShader,side:Qe,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(P,T,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),Vi.copy(x.backgroundRotation),Vi.x*=-1,Vi.y*=-1,Vi.z*=-1,S.isCubeTexture&&S.isRenderTargetTexture===!1&&(Vi.y*=-1,Vi.z*=-1),h.material.uniforms.envMap.value=S,h.material.uniforms.flipEnvMap.value=S.isCubeTexture&&S.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=x.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(X0.makeRotationFromEuler(Vi)),h.material.toneMapped=te.getTransfer(S.colorSpace)!==he,(f!==S||u!==S.version||d!==n.toneMapping)&&(h.material.needsUpdate=!0,f=S,u=S.version,d=n.toneMapping),h.layers.enableAll(),w.unshift(h,h.geometry,h.material,0,0,null)):S&&S.isTexture&&(c===void 0&&(c=new kt(new mn(2,2),new We({name:"BackgroundMaterial",uniforms:Hs(Bn.background.uniforms),vertexShader:Bn.background.vertexShader,fragmentShader:Bn.background.fragmentShader,side:Ti,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=S,c.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,c.material.toneMapped=te.getTransfer(S.colorSpace)!==he,S.matrixAutoUpdate===!0&&S.updateMatrix(),c.material.uniforms.uvTransform.value.copy(S.matrix),(f!==S||u!==S.version||d!==n.toneMapping)&&(c.material.needsUpdate=!0,f=S,u=S.version,d=n.toneMapping),c.layers.enableAll(),w.unshift(c,c.geometry,c.material,0,0,null))}function p(w,x){w.getRGB(ra,Jf(n)),i.buffers.color.setClear(ra.r,ra.g,ra.b,x,a)}return{getClearColor:function(){return o},setClearColor:function(w,x=1){o.set(w),l=x,p(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(w){l=w,p(o,l)},render:_,addToRenderList:m}}function Y0(n,t){let e=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=u(null),r=s,a=!1;function o(v,b,F,N,V){let Y=!1,H=f(N,F,b);r!==H&&(r=H,c(r.object)),Y=d(v,N,F,V),Y&&g(v,N,F,V),V!==null&&t.update(V,n.ELEMENT_ARRAY_BUFFER),(Y||a)&&(a=!1,S(v,b,F,N),V!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,t.get(V).buffer))}function l(){return n.createVertexArray()}function c(v){return n.bindVertexArray(v)}function h(v){return n.deleteVertexArray(v)}function f(v,b,F){let N=F.wireframe===!0,V=i[v.id];V===void 0&&(V={},i[v.id]=V);let Y=V[b.id];Y===void 0&&(Y={},V[b.id]=Y);let H=Y[N];return H===void 0&&(H=u(l()),Y[N]=H),H}function u(v){let b=[],F=[],N=[];for(let V=0;V<e;V++)b[V]=0,F[V]=0,N[V]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:b,enabledAttributes:F,attributeDivisors:N,object:v,attributes:{},index:null}}function d(v,b,F,N){let V=r.attributes,Y=b.attributes,H=0,tt=F.getAttributes();for(let G in tt)if(tt[G].location>=0){let ft=V[G],rt=Y[G];if(rt===void 0&&(G==="instanceMatrix"&&v.instanceMatrix&&(rt=v.instanceMatrix),G==="instanceColor"&&v.instanceColor&&(rt=v.instanceColor)),ft===void 0||ft.attribute!==rt||rt&&ft.data!==rt.data)return!0;H++}return r.attributesNum!==H||r.index!==N}function g(v,b,F,N){let V={},Y=b.attributes,H=0,tt=F.getAttributes();for(let G in tt)if(tt[G].location>=0){let ft=Y[G];ft===void 0&&(G==="instanceMatrix"&&v.instanceMatrix&&(ft=v.instanceMatrix),G==="instanceColor"&&v.instanceColor&&(ft=v.instanceColor));let rt={};rt.attribute=ft,ft&&ft.data&&(rt.data=ft.data),V[G]=rt,H++}r.attributes=V,r.attributesNum=H,r.index=N}function _(){let v=r.newAttributes;for(let b=0,F=v.length;b<F;b++)v[b]=0}function m(v){p(v,0)}function p(v,b){let F=r.newAttributes,N=r.enabledAttributes,V=r.attributeDivisors;F[v]=1,N[v]===0&&(n.enableVertexAttribArray(v),N[v]=1),V[v]!==b&&(n.vertexAttribDivisor(v,b),V[v]=b)}function w(){let v=r.newAttributes,b=r.enabledAttributes;for(let F=0,N=b.length;F<N;F++)b[F]!==v[F]&&(n.disableVertexAttribArray(F),b[F]=0)}function x(v,b,F,N,V,Y,H){H===!0?n.vertexAttribIPointer(v,b,F,V,Y):n.vertexAttribPointer(v,b,F,N,V,Y)}function S(v,b,F,N){_();let V=N.attributes,Y=F.getAttributes(),H=b.defaultAttributeValues;for(let tt in Y){let G=Y[tt];if(G.location>=0){let at=V[tt];if(at===void 0&&(tt==="instanceMatrix"&&v.instanceMatrix&&(at=v.instanceMatrix),tt==="instanceColor"&&v.instanceColor&&(at=v.instanceColor)),at!==void 0){let ft=at.normalized,rt=at.itemSize,Dt=t.get(at);if(Dt===void 0)continue;let Ut=Dt.buffer,q=Dt.type,et=Dt.bytesPerElement,Mt=q===n.INT||q===n.UNSIGNED_INT||at.gpuType===Rc;if(at.isInterleavedBufferAttribute){let gt=at.data,Ot=gt.stride,Rt=at.offset;if(gt.isInstancedInterleavedBuffer){for(let Xt=0;Xt<G.locationSize;Xt++)p(G.location+Xt,gt.meshPerAttribute);v.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=gt.meshPerAttribute*gt.count)}else for(let Xt=0;Xt<G.locationSize;Xt++)m(G.location+Xt);n.bindBuffer(n.ARRAY_BUFFER,Ut);for(let Xt=0;Xt<G.locationSize;Xt++)x(G.location+Xt,rt/G.locationSize,q,ft,Ot*et,(Rt+rt/G.locationSize*Xt)*et,Mt)}else{if(at.isInstancedBufferAttribute){for(let gt=0;gt<G.locationSize;gt++)p(G.location+gt,at.meshPerAttribute);v.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=at.meshPerAttribute*at.count)}else for(let gt=0;gt<G.locationSize;gt++)m(G.location+gt);n.bindBuffer(n.ARRAY_BUFFER,Ut);for(let gt=0;gt<G.locationSize;gt++)x(G.location+gt,rt/G.locationSize,q,ft,rt*et,rt/G.locationSize*gt*et,Mt)}}else if(H!==void 0){let ft=H[tt];if(ft!==void 0)switch(ft.length){case 2:n.vertexAttrib2fv(G.location,ft);break;case 3:n.vertexAttrib3fv(G.location,ft);break;case 4:n.vertexAttrib4fv(G.location,ft);break;default:n.vertexAttrib1fv(G.location,ft)}}}}w()}function P(){I();for(let v in i){let b=i[v];for(let F in b){let N=b[F];for(let V in N)h(N[V].object),delete N[V];delete b[F]}delete i[v]}}function T(v){if(i[v.id]===void 0)return;let b=i[v.id];for(let F in b){let N=b[F];for(let V in N)h(N[V].object),delete N[V];delete b[F]}delete i[v.id]}function A(v){for(let b in i){let F=i[b];if(F[v.id]===void 0)continue;let N=F[v.id];for(let V in N)h(N[V].object),delete N[V];delete F[v.id]}}function I(){B(),a=!0,r!==s&&(r=s,c(r.object))}function B(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:I,resetDefaultState:B,dispose:P,releaseStatesOfGeometry:T,releaseStatesOfProgram:A,initAttributes:_,enableAttribute:m,disableUnusedAttributes:w}}function Z0(n,t,e){let i;function s(c){i=c}function r(c,h){n.drawArrays(i,c,h),e.update(h,i,1)}function a(c,h,f){f!==0&&(n.drawArraysInstanced(i,c,h,f),e.update(h,i,f))}function o(c,h,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,h,0,f);let d=0;for(let g=0;g<f;g++)d+=h[g];e.update(d,i,1)}function l(c,h,f,u){if(f===0)return;let d=t.get("WEBGL_multi_draw");if(d===null)for(let g=0;g<c.length;g++)a(c[g],h[g],u[g]);else{d.multiDrawArraysInstancedWEBGL(i,c,0,h,0,u,0,f);let g=0;for(let _=0;_<f;_++)g+=h[_];for(let _=0;_<u.length;_++)e.update(g,i,u[_])}}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function $0(n,t,e,i){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let A=t.get("EXT_texture_filter_anisotropic");s=n.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(A){return!(A!==Pn&&i.convert(A)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(A){let I=A===Er&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(A!==ai&&i.convert(A)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==zn&&!I)}function l(A){if(A==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let f=e.logarithmicDepthBuffer===!0,u=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control");if(u===!0){let A=t.get("EXT_clip_control");A.clipControlEXT(A.LOWER_LEFT_EXT,A.ZERO_TO_ONE_EXT)}let d=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),g=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),p=n.getParameter(n.MAX_VERTEX_ATTRIBS),w=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),x=n.getParameter(n.MAX_VARYING_VECTORS),S=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),P=g>0,T=n.getParameter(n.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:f,reverseDepthBuffer:u,maxTextures:d,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:w,maxVaryings:x,maxFragmentUniforms:S,vertexTextures:P,maxSamples:T}}function J0(n){let t=this,e=null,i=0,s=!1,r=!1,a=new ii,o=new zt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(f,u){let d=f.length!==0||u||i!==0||s;return s=u,i=f.length,d},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,u){e=h(f,u,0)},this.setState=function(f,u,d){let g=f.clippingPlanes,_=f.clipIntersection,m=f.clipShadows,p=n.get(f);if(!s||g===null||g.length===0||r&&!m)r?h(null):c();else{let w=r?0:i,x=w*4,S=p.clippingState||null;l.value=S,S=h(g,u,x,d);for(let P=0;P!==x;++P)S[P]=e[P];p.clippingState=S,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=w}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function h(f,u,d,g){let _=f!==null?f.length:0,m=null;if(_!==0){if(m=l.value,g!==!0||m===null){let p=d+_*4,w=u.matrixWorldInverse;o.getNormalMatrix(w),(m===null||m.length<p)&&(m=new Float32Array(p));for(let x=0,S=d;x!==_;++x,S+=4)a.copy(f[x]).applyMatrix4(w,o),a.normal.toArray(m,S),m[S+3]=a.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,m}}function K0(n){let t=new WeakMap;function e(a,o){return o===hl?a.mapping=Os:o===fl&&(a.mapping=Fs),a}function i(a){if(a&&a.isTexture){let o=a.mapping;if(o===hl||o===fl)if(t.has(a)){let l=t.get(a).texture;return e(l,a.mapping)}else{let l=a.image;if(l&&l.height>0){let c=new Xl(l.height);return c.fromEquirectangularTexture(n,a),t.set(a,c),a.addEventListener("dispose",s),e(c.texture,a.mapping)}else return null}}return a}function s(a){let o=a.target;o.removeEventListener("dispose",s);let l=t.get(o);l!==void 0&&(t.delete(o),l.dispose())}function r(){t=new WeakMap}return{get:i,dispose:r}}var La=class extends Pa{constructor(t=-1,e=1,i=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=i,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,i,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=i-t,a=i+t,o=s+e,l=s-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},Is=4,tf=[.125,.215,.35,.446,.526,.582],qi=20,Wo=new La,ef=new At,Xo=null,qo=0,Yo=0,Zo=!1,Wi=(1+Math.sqrt(5))/2,Es=1/Wi,nf=[new R(-Wi,Es,0),new R(Wi,Es,0),new R(-Es,0,Wi),new R(Es,0,Wi),new R(0,Wi,-Es),new R(0,Wi,Es),new R(-1,1,-1),new R(1,1,-1),new R(-1,1,1),new R(1,1,1)],Da=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,i=.1,s=100){Xo=this._renderer.getRenderTarget(),qo=this._renderer.getActiveCubeFace(),Yo=this._renderer.getActiveMipmapLevel(),Zo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);let r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,i,s,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=af(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=rf(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(Xo,qo,Yo),this._renderer.xr.enabled=Zo,t.scissorTest=!1,aa(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Os||t.mapping===Fs?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Xo=this._renderer.getRenderTarget(),qo=this._renderer.getActiveCubeFace(),Yo=this._renderer.getActiveMipmapLevel(),Zo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=e||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,i={magFilter:Rn,minFilter:Rn,generateMipmaps:!1,type:Er,format:Pn,colorSpace:Pi,depthBuffer:!1},s=sf(t,e,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=sf(t,e,i);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Q0(r)),this._blurMaterial=j0(r,t,e)}return s}_compileMaterial(t){let e=new kt(this._lodPlanes[0],t);this._renderer.compile(e,Wo)}_sceneToCubeUV(t,e,i,s){let o=new He(90,1,e,i),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,f=h.autoClear,u=h.toneMapping;h.getClearColor(ef),h.toneMapping=Hn,h.autoClear=!1;let d=new xe({name:"PMREM.Background",side:Qe,depthWrite:!1,depthTest:!1}),g=new kt(new an,d),_=!1,m=t.background;m?m.isColor&&(d.color.copy(m),t.background=null,_=!0):(d.color.copy(ef),_=!0);for(let p=0;p<6;p++){let w=p%3;w===0?(o.up.set(0,l[p],0),o.lookAt(c[p],0,0)):w===1?(o.up.set(0,0,l[p]),o.lookAt(0,c[p],0)):(o.up.set(0,l[p],0),o.lookAt(0,0,c[p]));let x=this._cubeSize;aa(s,w*x,p>2?x:0,x,x),h.setRenderTarget(s),_&&h.render(g,o),h.render(t,o)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=u,h.autoClear=f,t.background=m}_textureToCubeUV(t,e){let i=this._renderer,s=t.mapping===Os||t.mapping===Fs;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=af()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=rf());let r=s?this._cubemapMaterial:this._equirectMaterial,a=new kt(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=t;let l=this._cubeSize;aa(e,0,0,3*l,2*l),i.setRenderTarget(e),i.render(a,Wo)}_applyPMREM(t){let e=this._renderer,i=e.autoClear;e.autoClear=!1;let s=this._lodPlanes.length;for(let r=1;r<s;r++){let a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=nf[(s-r-1)%nf.length];this._blur(t,r-1,r,a,o)}e.autoClear=i}_blur(t,e,i,s,r){let a=this._pingPongRenderTarget;this._halfBlur(t,a,e,i,s,"latitudinal",r),this._halfBlur(a,t,i,i,s,"longitudinal",r)}_halfBlur(t,e,i,s,r,a,o){let l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let h=3,f=new kt(this._lodPlanes[s],c),u=c.uniforms,d=this._sizeLods[i]-1,g=isFinite(r)?Math.PI/(2*d):2*Math.PI/(2*qi-1),_=r/g,m=isFinite(r)?1+Math.floor(h*_):qi;m>qi&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${qi}`);let p=[],w=0;for(let A=0;A<qi;++A){let I=A/_,B=Math.exp(-I*I/2);p.push(B),A===0?w+=B:A<m&&(w+=2*B)}for(let A=0;A<p.length;A++)p[A]=p[A]/w;u.envMap.value=t.texture,u.samples.value=m,u.weights.value=p,u.latitudinal.value=a==="latitudinal",o&&(u.poleAxis.value=o);let{_lodMax:x}=this;u.dTheta.value=g,u.mipInt.value=x-i;let S=this._sizeLods[s],P=3*S*(s>x-Is?s-x+Is:0),T=4*(this._cubeSize-S);aa(e,P,T,3*S,2*S),l.setRenderTarget(e),l.render(f,Wo)}};function Q0(n){let t=[],e=[],i=[],s=n,r=n-Is+1+tf.length;for(let a=0;a<r;a++){let o=Math.pow(2,s);e.push(o);let l=1/o;a>n-Is?l=tf[a-n+Is-1]:a===0&&(l=0),i.push(l);let c=1/(o-2),h=-c,f=1+c,u=[h,h,f,h,f,f,h,h,f,f,h,f],d=6,g=6,_=3,m=2,p=1,w=new Float32Array(_*g*d),x=new Float32Array(m*g*d),S=new Float32Array(p*g*d);for(let T=0;T<d;T++){let A=T%3*2/3-1,I=T>2?0:-1,B=[A,I,0,A+2/3,I,0,A+2/3,I+1,0,A,I,0,A+2/3,I+1,0,A,I+1,0];w.set(B,_*g*T),x.set(u,m*g*T);let v=[T,T,T,T,T,T];S.set(v,p*g*T)}let P=new Ge;P.setAttribute("position",new Ee(w,_)),P.setAttribute("uv",new Ee(x,m)),P.setAttribute("faceIndex",new Ee(S,p)),t.push(P),s>Is&&s--}return{lodPlanes:t,sizeLods:e,sigmas:i}}function sf(n,t,e){let i=new oi(n,t,e);return i.texture.mapping=ja,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function aa(n,t,e,i,s){n.viewport.set(t,e,i,s),n.scissor.set(t,e,i,s)}function j0(n,t,e){let i=new Float32Array(qi),s=new R(0,1,0);return new We({name:"SphericalGaussianBlur",defines:{n:qi,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:kc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:wi,depthTest:!1,depthWrite:!1})}function rf(){return new We({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:kc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:wi,depthTest:!1,depthWrite:!1})}function af(){return new We({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:kc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:wi,depthTest:!1,depthWrite:!1})}function kc(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function tg(n){let t=new WeakMap,e=null;function i(o){if(o&&o.isTexture){let l=o.mapping,c=l===hl||l===fl,h=l===Os||l===Fs;if(c||h){let f=t.get(o),u=f!==void 0?f.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==u)return e===null&&(e=new Da(n)),f=c?e.fromEquirectangular(o,f):e.fromCubemap(o,f),f.texture.pmremVersion=o.pmremVersion,t.set(o,f),f.texture;if(f!==void 0)return f.texture;{let d=o.image;return c&&d&&d.height>0||h&&d&&s(d)?(e===null&&(e=new Da(n)),f=c?e.fromEquirectangular(o):e.fromCubemap(o),f.texture.pmremVersion=o.pmremVersion,t.set(o,f),o.addEventListener("dispose",r),f.texture):null}}}return o}function s(o){let l=0,c=6;for(let h=0;h<c;h++)o[h]!==void 0&&l++;return l===c}function r(o){let l=o.target;l.removeEventListener("dispose",r);let c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function a(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:i,dispose:a}}function eg(n){let t={};function e(i){if(t[i]!==void 0)return t[i];let s;switch(i){case"WEBGL_depth_texture":s=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=n.getExtension(i)}return t[i]=s,s}return{has:function(i){return e(i)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(i){let s=e(i);return s===null&&ya("THREE.WebGLRenderer: "+i+" extension not supported."),s}}}function ng(n,t,e,i){let s={},r=new WeakMap;function a(f){let u=f.target;u.index!==null&&t.remove(u.index);for(let g in u.attributes)t.remove(u.attributes[g]);for(let g in u.morphAttributes){let _=u.morphAttributes[g];for(let m=0,p=_.length;m<p;m++)t.remove(_[m])}u.removeEventListener("dispose",a),delete s[u.id];let d=r.get(u);d&&(t.remove(d),r.delete(u)),i.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,e.memory.geometries--}function o(f,u){return s[u.id]===!0||(u.addEventListener("dispose",a),s[u.id]=!0,e.memory.geometries++),u}function l(f){let u=f.attributes;for(let g in u)t.update(u[g],n.ARRAY_BUFFER);let d=f.morphAttributes;for(let g in d){let _=d[g];for(let m=0,p=_.length;m<p;m++)t.update(_[m],n.ARRAY_BUFFER)}}function c(f){let u=[],d=f.index,g=f.attributes.position,_=0;if(d!==null){let w=d.array;_=d.version;for(let x=0,S=w.length;x<S;x+=3){let P=w[x+0],T=w[x+1],A=w[x+2];u.push(P,T,T,A,A,P)}}else if(g!==void 0){let w=g.array;_=g.version;for(let x=0,S=w.length/3-1;x<S;x+=3){let P=x+0,T=x+1,A=x+2;u.push(P,T,T,A,A,P)}}else return;let m=new(Zf(u)?Ca:Ra)(u,1);m.version=_;let p=r.get(f);p&&t.remove(p),r.set(f,m)}function h(f){let u=r.get(f);if(u){let d=f.index;d!==null&&u.version<d.version&&c(f)}else c(f);return r.get(f)}return{get:o,update:l,getWireframeAttribute:h}}function ig(n,t,e){let i;function s(u){i=u}let r,a;function o(u){r=u.type,a=u.bytesPerElement}function l(u,d){n.drawElements(i,d,r,u*a),e.update(d,i,1)}function c(u,d,g){g!==0&&(n.drawElementsInstanced(i,d,r,u*a,g),e.update(d,i,g))}function h(u,d,g){if(g===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,d,0,r,u,0,g);let m=0;for(let p=0;p<g;p++)m+=d[p];e.update(m,i,1)}function f(u,d,g,_){if(g===0)return;let m=t.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<u.length;p++)c(u[p]/a,d[p],_[p]);else{m.multiDrawElementsInstancedWEBGL(i,d,0,r,u,0,_,0,g);let p=0;for(let w=0;w<g;w++)p+=d[w];for(let w=0;w<_.length;w++)e.update(p,i,_[w])}}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=f}function sg(n){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,a,o){switch(e.calls++,a){case n.TRIANGLES:e.triangles+=o*(r/3);break;case n.LINES:e.lines+=o*(r/2);break;case n.LINE_STRIP:e.lines+=o*(r-1);break;case n.LINE_LOOP:e.lines+=o*r;break;case n.POINTS:e.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:i}}function rg(n,t,e){let i=new WeakMap,s=new ge;function r(a,o,l){let c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,f=h!==void 0?h.length:0,u=i.get(o);if(u===void 0||u.count!==f){let B=function(){A.dispose(),i.delete(o),o.removeEventListener("dispose",B)};u!==void 0&&u.texture.dispose();let d=o.morphAttributes.position!==void 0,g=o.morphAttributes.normal!==void 0,_=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],w=o.morphAttributes.color||[],x=0;d===!0&&(x=1),g===!0&&(x=2),_===!0&&(x=3);let S=o.attributes.position.count*x,P=1;S>t.maxTextureSize&&(P=Math.ceil(S/t.maxTextureSize),S=t.maxTextureSize);let T=new Float32Array(S*P*4*f),A=new Ta(T,S,P,f);A.type=zn,A.needsUpdate=!0;let I=x*4;for(let v=0;v<f;v++){let b=m[v],F=p[v],N=w[v],V=S*P*4*v;for(let Y=0;Y<b.count;Y++){let H=Y*I;d===!0&&(s.fromBufferAttribute(b,Y),T[V+H+0]=s.x,T[V+H+1]=s.y,T[V+H+2]=s.z,T[V+H+3]=0),g===!0&&(s.fromBufferAttribute(F,Y),T[V+H+4]=s.x,T[V+H+5]=s.y,T[V+H+6]=s.z,T[V+H+7]=0),_===!0&&(s.fromBufferAttribute(N,Y),T[V+H+8]=s.x,T[V+H+9]=s.y,T[V+H+10]=s.z,T[V+H+11]=N.itemSize===4?s.w:1)}}u={count:f,texture:A,size:new ct(S,P)},i.set(o,u),o.addEventListener("dispose",B)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",a.morphTexture,e);else{let d=0;for(let _=0;_<c.length;_++)d+=c[_];let g=o.morphTargetsRelative?1:1-d;l.getUniforms().setValue(n,"morphTargetBaseInfluence",g),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",u.texture,e),l.getUniforms().setValue(n,"morphTargetsTextureSize",u.size)}return{update:r}}function ag(n,t,e,i){let s=new WeakMap;function r(l){let c=i.render.frame,h=l.geometry,f=t.get(l,h);if(s.get(f)!==c&&(t.update(f),s.set(f,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),s.get(l)!==c&&(e.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,n.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){let u=l.skeleton;s.get(u)!==c&&(u.update(),s.set(u,c))}return f}function a(){s=new WeakMap}function o(l){let c=l.target;c.removeEventListener("dispose",o),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:a}}var Ua=class extends Ve{constructor(t,e,i,s,r,a,o,l,c,h=Ls){if(h!==Ls&&h!==zs)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&h===Ls&&(i=$i),i===void 0&&h===zs&&(i=Bs),super(null,s,r,a,o,l,h,i,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=o!==void 0?o:Je,this.minFilter=l!==void 0?l:Je,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}},Qf=new Ve,of=new Ua(1,1),jf=new Ta,tu=new Gl,eu=new Ia,lf=[],cf=[],hf=new Float32Array(16),ff=new Float32Array(9),uf=new Float32Array(4);function Xs(n,t,e){let i=n[0];if(i<=0||i>0)return n;let s=t*e,r=lf[s];if(r===void 0&&(r=new Float32Array(s),lf[s]=r),t!==0){i.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,n[a].toArray(r,o)}return r}function Te(n,t){if(n.length!==t.length)return!1;for(let e=0,i=n.length;e<i;e++)if(n[e]!==t[e])return!1;return!0}function Ae(n,t){for(let e=0,i=t.length;e<i;e++)n[e]=t[e]}function eo(n,t){let e=cf[t];e===void 0&&(e=new Int32Array(t),cf[t]=e);for(let i=0;i!==t;++i)e[i]=n.allocateTextureUnit();return e}function og(n,t){let e=this.cache;e[0]!==t&&(n.uniform1f(this.addr,t),e[0]=t)}function lg(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Te(e,t))return;n.uniform2fv(this.addr,t),Ae(e,t)}}function cg(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(n.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Te(e,t))return;n.uniform3fv(this.addr,t),Ae(e,t)}}function hg(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Te(e,t))return;n.uniform4fv(this.addr,t),Ae(e,t)}}function fg(n,t){let e=this.cache,i=t.elements;if(i===void 0){if(Te(e,t))return;n.uniformMatrix2fv(this.addr,!1,t),Ae(e,t)}else{if(Te(e,i))return;uf.set(i),n.uniformMatrix2fv(this.addr,!1,uf),Ae(e,i)}}function ug(n,t){let e=this.cache,i=t.elements;if(i===void 0){if(Te(e,t))return;n.uniformMatrix3fv(this.addr,!1,t),Ae(e,t)}else{if(Te(e,i))return;ff.set(i),n.uniformMatrix3fv(this.addr,!1,ff),Ae(e,i)}}function dg(n,t){let e=this.cache,i=t.elements;if(i===void 0){if(Te(e,t))return;n.uniformMatrix4fv(this.addr,!1,t),Ae(e,t)}else{if(Te(e,i))return;hf.set(i),n.uniformMatrix4fv(this.addr,!1,hf),Ae(e,i)}}function pg(n,t){let e=this.cache;e[0]!==t&&(n.uniform1i(this.addr,t),e[0]=t)}function mg(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Te(e,t))return;n.uniform2iv(this.addr,t),Ae(e,t)}}function gg(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Te(e,t))return;n.uniform3iv(this.addr,t),Ae(e,t)}}function _g(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Te(e,t))return;n.uniform4iv(this.addr,t),Ae(e,t)}}function vg(n,t){let e=this.cache;e[0]!==t&&(n.uniform1ui(this.addr,t),e[0]=t)}function yg(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Te(e,t))return;n.uniform2uiv(this.addr,t),Ae(e,t)}}function xg(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Te(e,t))return;n.uniform3uiv(this.addr,t),Ae(e,t)}}function Mg(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Te(e,t))return;n.uniform4uiv(this.addr,t),Ae(e,t)}}function bg(n,t,e){let i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(of.compareFunction=qf,r=of):r=Qf,e.setTexture2D(t||r,s)}function Sg(n,t,e){let i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),e.setTexture3D(t||tu,s)}function wg(n,t,e){let i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),e.setTextureCube(t||eu,s)}function Eg(n,t,e){let i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),e.setTexture2DArray(t||jf,s)}function Tg(n){switch(n){case 5126:return og;case 35664:return lg;case 35665:return cg;case 35666:return hg;case 35674:return fg;case 35675:return ug;case 35676:return dg;case 5124:case 35670:return pg;case 35667:case 35671:return mg;case 35668:case 35672:return gg;case 35669:case 35673:return _g;case 5125:return vg;case 36294:return yg;case 36295:return xg;case 36296:return Mg;case 35678:case 36198:case 36298:case 36306:case 35682:return bg;case 35679:case 36299:case 36307:return Sg;case 35680:case 36300:case 36308:case 36293:return wg;case 36289:case 36303:case 36311:case 36292:return Eg}}function Ag(n,t){n.uniform1fv(this.addr,t)}function Rg(n,t){let e=Xs(t,this.size,2);n.uniform2fv(this.addr,e)}function Cg(n,t){let e=Xs(t,this.size,3);n.uniform3fv(this.addr,e)}function Pg(n,t){let e=Xs(t,this.size,4);n.uniform4fv(this.addr,e)}function Ig(n,t){let e=Xs(t,this.size,4);n.uniformMatrix2fv(this.addr,!1,e)}function Lg(n,t){let e=Xs(t,this.size,9);n.uniformMatrix3fv(this.addr,!1,e)}function Dg(n,t){let e=Xs(t,this.size,16);n.uniformMatrix4fv(this.addr,!1,e)}function Ug(n,t){n.uniform1iv(this.addr,t)}function Ng(n,t){n.uniform2iv(this.addr,t)}function Og(n,t){n.uniform3iv(this.addr,t)}function Fg(n,t){n.uniform4iv(this.addr,t)}function kg(n,t){n.uniform1uiv(this.addr,t)}function Bg(n,t){n.uniform2uiv(this.addr,t)}function zg(n,t){n.uniform3uiv(this.addr,t)}function Hg(n,t){n.uniform4uiv(this.addr,t)}function Vg(n,t,e){let i=this.cache,s=t.length,r=eo(e,s);Te(i,r)||(n.uniform1iv(this.addr,r),Ae(i,r));for(let a=0;a!==s;++a)e.setTexture2D(t[a]||Qf,r[a])}function Gg(n,t,e){let i=this.cache,s=t.length,r=eo(e,s);Te(i,r)||(n.uniform1iv(this.addr,r),Ae(i,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||tu,r[a])}function Wg(n,t,e){let i=this.cache,s=t.length,r=eo(e,s);Te(i,r)||(n.uniform1iv(this.addr,r),Ae(i,r));for(let a=0;a!==s;++a)e.setTextureCube(t[a]||eu,r[a])}function Xg(n,t,e){let i=this.cache,s=t.length,r=eo(e,s);Te(i,r)||(n.uniform1iv(this.addr,r),Ae(i,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||jf,r[a])}function qg(n){switch(n){case 5126:return Ag;case 35664:return Rg;case 35665:return Cg;case 35666:return Pg;case 35674:return Ig;case 35675:return Lg;case 35676:return Dg;case 5124:case 35670:return Ug;case 35667:case 35671:return Ng;case 35668:case 35672:return Og;case 35669:case 35673:return Fg;case 5125:return kg;case 36294:return Bg;case 36295:return zg;case 36296:return Hg;case 35678:case 36198:case 36298:case 36306:case 35682:return Vg;case 35679:case 36299:case 36307:return Gg;case 35680:case 36300:case 36308:case 36293:return Wg;case 36289:case 36303:case 36311:case 36292:return Xg}}var ql=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.setValue=Tg(e.type)}},Yl=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=qg(e.type)}},Zl=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,i){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(t,e[o.id],i)}}},$o=/(\w+)(\])?(\[|\.)?/g;function df(n,t){n.seq.push(t),n.map[t.id]=t}function Yg(n,t,e){let i=n.name,s=i.length;for($o.lastIndex=0;;){let r=$o.exec(i),a=$o.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){df(e,c===void 0?new ql(o,n,t):new Yl(o,n,t));break}else{let f=e.map[o];f===void 0&&(f=new Zl(o),df(e,f)),e=f}}}var Us=class{constructor(t,e){this.seq=[],this.map={};let i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<i;++s){let r=t.getActiveUniform(e,s),a=t.getUniformLocation(e,r.name);Yg(r,a,this)}}setValue(t,e,i,s){let r=this.map[e];r!==void 0&&r.setValue(t,i,s)}setOptional(t,e,i){let s=e[i];s!==void 0&&this.setValue(t,i,s)}static upload(t,e,i,s){for(let r=0,a=e.length;r!==a;++r){let o=e[r],l=i[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,e){let i=[];for(let s=0,r=t.length;s!==r;++s){let a=t[s];a.id in e&&i.push(a)}return i}};function pf(n,t,e){let i=n.createShader(t);return n.shaderSource(i,e),n.compileShader(i),i}var Zg=37297,$g=0;function Jg(n,t){let e=n.split(`
`),i=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){let o=a+1;i.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return i.join(`
`)}function Kg(n){let t=te.getPrimaries(te.workingColorSpace),e=te.getPrimaries(n),i;switch(t===e?i="":t===Sa&&e===ba?i="LinearDisplayP3ToLinearSRGB":t===ba&&e===Sa&&(i="LinearSRGBToLinearDisplayP3"),n){case Pi:case to:return[i,"LinearTransferOETF"];case fe:case Oc:return[i,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",n),[i,"LinearTransferOETF"]}}function mf(n,t,e){let i=n.getShaderParameter(t,n.COMPILE_STATUS),s=n.getShaderInfoLog(t).trim();if(i&&s==="")return"";let r=/ERROR: 0:(\d+)/.exec(s);if(r){let a=parseInt(r[1]);return e.toUpperCase()+`

`+s+`

`+Jg(n.getShaderSource(t),a)}else return s}function Qg(n,t){let e=Kg(t);return`vec4 ${n}( vec4 value ) { return ${e[0]}( ${e[1]}( value ) ); }`}function jg(n,t){let e;switch(t){case ld:e="Linear";break;case cd:e="Reinhard";break;case hd:e="Cineon";break;case fd:e="ACESFilmic";break;case dd:e="AgX";break;case pd:e="Neutral";break;case ud:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+n+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var oa=new R;function t_(){te.getLuminanceCoefficients(oa);let n=oa.x.toFixed(4),t=oa.y.toFixed(4),e=oa.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function e_(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(fr).join(`
`)}function n_(n){let t=[];for(let e in n){let i=n[e];i!==!1&&t.push("#define "+e+" "+i)}return t.join(`
`)}function i_(n,t){let e={},i=n.getProgramParameter(t,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let r=n.getActiveAttrib(t,s),a=r.name,o=1;r.type===n.FLOAT_MAT2&&(o=2),r.type===n.FLOAT_MAT3&&(o=3),r.type===n.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:n.getAttribLocation(t,a),locationSize:o}}return e}function fr(n){return n!==""}function gf(n,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function _f(n,t){return n.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var s_=/^[ \t]*#include +<([\w\d./]+)>/gm;function $l(n){return n.replace(s_,a_)}var r_=new Map;function a_(n,t){let e=Bt[t];if(e===void 0){let i=r_.get(t);if(i!==void 0)e=Bt[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("Can not resolve #include <"+t+">")}return $l(e)}var o_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function vf(n){return n.replace(o_,l_)}function l_(n,t,e,i){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function yf(n){let t=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?t+=`
#define HIGH_PRECISION`:n.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function c_(n){let t="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===Nf?t="SHADOWMAP_TYPE_PCF":n.shadowMapType===Tc?t="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===ni&&(t="SHADOWMAP_TYPE_VSM"),t}function h_(n){let t="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case Os:case Fs:t="ENVMAP_TYPE_CUBE";break;case ja:t="ENVMAP_TYPE_CUBE_UV";break}return t}function f_(n){let t="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case Fs:t="ENVMAP_MODE_REFRACTION";break}return t}function u_(n){let t="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case Ac:t="ENVMAP_BLENDING_MULTIPLY";break;case ad:t="ENVMAP_BLENDING_MIX";break;case od:t="ENVMAP_BLENDING_ADD";break}return t}function d_(n){let t=n.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:i,maxMip:e}}function p_(n,t,e,i){let s=n.getContext(),r=e.defines,a=e.vertexShader,o=e.fragmentShader,l=c_(e),c=h_(e),h=f_(e),f=u_(e),u=d_(e),d=e_(e),g=n_(r),_=s.createProgram(),m,p,w=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(fr).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(fr).join(`
`),p.length>0&&(p+=`
`)):(m=[yf(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(fr).join(`
`),p=[yf(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+f:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Hn?"#define TONE_MAPPING":"",e.toneMapping!==Hn?Bt.tonemapping_pars_fragment:"",e.toneMapping!==Hn?jg("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Bt.colorspace_pars_fragment,Qg("linearToOutputTexel",e.outputColorSpace),t_(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(fr).join(`
`)),a=$l(a),a=gf(a,e),a=_f(a,e),o=$l(o),o=gf(o,e),o=_f(o,e),a=vf(a),o=vf(o),e.isRawShaderMaterial!==!0&&(w=`#version 300 es
`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",e.glslVersion===Nh?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Nh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let x=w+m+a,S=w+p+o,P=pf(s,s.VERTEX_SHADER,x),T=pf(s,s.FRAGMENT_SHADER,S);s.attachShader(_,P),s.attachShader(_,T),e.index0AttributeName!==void 0?s.bindAttribLocation(_,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function A(b){if(n.debug.checkShaderErrors){let F=s.getProgramInfoLog(_).trim(),N=s.getShaderInfoLog(P).trim(),V=s.getShaderInfoLog(T).trim(),Y=!0,H=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(Y=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,_,P,T);else{let tt=mf(s,P,"vertex"),G=mf(s,T,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+b.name+`
Material Type: `+b.type+`

Program Info Log: `+F+`
`+tt+`
`+G)}else F!==""?console.warn("THREE.WebGLProgram: Program Info Log:",F):(N===""||V==="")&&(H=!1);H&&(b.diagnostics={runnable:Y,programLog:F,vertexShader:{log:N,prefix:m},fragmentShader:{log:V,prefix:p}})}s.deleteShader(P),s.deleteShader(T),I=new Us(s,_),B=i_(s,_)}let I;this.getUniforms=function(){return I===void 0&&A(this),I};let B;this.getAttributes=function(){return B===void 0&&A(this),B};let v=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return v===!1&&(v=s.getProgramParameter(_,Zg)),v},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=$g++,this.cacheKey=t,this.usedTimes=1,this.program=_,this.vertexShader=P,this.fragmentShader=T,this}var m_=0,Jl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){let e=t.vertexShader,i=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(i),a=this._getShaderCacheForMaterial(t);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let i of e)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,i=e.get(t);return i===void 0&&(i=new Set,e.set(t,i)),i}_getShaderStage(t){let e=this.shaderCache,i=e.get(t);return i===void 0&&(i=new Kl(t),e.set(t,i)),i}},Kl=class{constructor(t){this.id=m_++,this.code=t,this.usedTimes=0}};function g_(n,t,e,i,s,r,a){let o=new xr,l=new Jl,c=new Set,h=[],f=s.logarithmicDepthBuffer,u=s.reverseDepthBuffer,d=s.vertexTextures,g=s.precision,_={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(v){return c.add(v),v===0?"uv":`uv${v}`}function p(v,b,F,N,V){let Y=N.fog,H=V.geometry,tt=v.isMeshStandardMaterial?N.environment:null,G=(v.isMeshStandardMaterial?e:t).get(v.envMap||tt),at=G&&G.mapping===ja?G.image.height:null,ft=_[v.type];v.precision!==null&&(g=s.getMaxPrecision(v.precision),g!==v.precision&&console.warn("THREE.WebGLProgram.getParameters:",v.precision,"not supported, using",g,"instead."));let rt=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,Dt=rt!==void 0?rt.length:0,Ut=0;H.morphAttributes.position!==void 0&&(Ut=1),H.morphAttributes.normal!==void 0&&(Ut=2),H.morphAttributes.color!==void 0&&(Ut=3);let q,et,Mt,gt;if(ft){let $e=Bn[ft];q=$e.vertexShader,et=$e.fragmentShader}else q=v.vertexShader,et=v.fragmentShader,l.update(v),Mt=l.getVertexShaderID(v),gt=l.getFragmentShaderID(v);let Ot=n.getRenderTarget(),Rt=V.isInstancedMesh===!0,Xt=V.isBatchedMesh===!0,se=!!v.map,qt=!!v.matcap,C=!!G,tn=!!v.aoMap,Gt=!!v.lightMap,$t=!!v.bumpMap,Pt=!!v.normalMap,le=!!v.displacementMap,Nt=!!v.emissiveMap,E=!!v.metalnessMap,y=!!v.roughnessMap,O=v.anisotropy>0,$=v.clearcoat>0,j=v.dispersion>0,Z=v.iridescence>0,St=v.sheen>0,lt=v.transmission>0,_t=O&&!!v.anisotropyMap,Jt=$&&!!v.clearcoatMap,nt=$&&!!v.clearcoatNormalMap,vt=$&&!!v.clearcoatRoughnessMap,It=Z&&!!v.iridescenceMap,Lt=Z&&!!v.iridescenceThicknessMap,yt=St&&!!v.sheenColorMap,Wt=St&&!!v.sheenRoughnessMap,Ft=!!v.specularMap,ae=!!v.specularColorMap,L=!!v.specularIntensityMap,pt=lt&&!!v.transmissionMap,W=lt&&!!v.thicknessMap,J=!!v.gradientMap,ut=!!v.alphaMap,mt=v.alphaTest>0,Yt=!!v.alphaHash,Se=!!v.extensions,Ze=Hn;v.toneMapped&&(Ot===null||Ot.isXRRenderTarget===!0)&&(Ze=n.toneMapping);let Kt={shaderID:ft,shaderType:v.type,shaderName:v.name,vertexShader:q,fragmentShader:et,defines:v.defines,customVertexShaderID:Mt,customFragmentShaderID:gt,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:g,batching:Xt,batchingColor:Xt&&V._colorsTexture!==null,instancing:Rt,instancingColor:Rt&&V.instanceColor!==null,instancingMorph:Rt&&V.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:Ot===null?n.outputColorSpace:Ot.isXRRenderTarget===!0?Ot.texture.colorSpace:Pi,alphaToCoverage:!!v.alphaToCoverage,map:se,matcap:qt,envMap:C,envMapMode:C&&G.mapping,envMapCubeUVHeight:at,aoMap:tn,lightMap:Gt,bumpMap:$t,normalMap:Pt,displacementMap:d&&le,emissiveMap:Nt,normalMapObjectSpace:Pt&&v.normalMapType===vd,normalMapTangentSpace:Pt&&v.normalMapType===Nc,metalnessMap:E,roughnessMap:y,anisotropy:O,anisotropyMap:_t,clearcoat:$,clearcoatMap:Jt,clearcoatNormalMap:nt,clearcoatRoughnessMap:vt,dispersion:j,iridescence:Z,iridescenceMap:It,iridescenceThicknessMap:Lt,sheen:St,sheenColorMap:yt,sheenRoughnessMap:Wt,specularMap:Ft,specularColorMap:ae,specularIntensityMap:L,transmission:lt,transmissionMap:pt,thicknessMap:W,gradientMap:J,opaque:v.transparent===!1&&v.blending===Ei&&v.alphaToCoverage===!1,alphaMap:ut,alphaTest:mt,alphaHash:Yt,combine:v.combine,mapUv:se&&m(v.map.channel),aoMapUv:tn&&m(v.aoMap.channel),lightMapUv:Gt&&m(v.lightMap.channel),bumpMapUv:$t&&m(v.bumpMap.channel),normalMapUv:Pt&&m(v.normalMap.channel),displacementMapUv:le&&m(v.displacementMap.channel),emissiveMapUv:Nt&&m(v.emissiveMap.channel),metalnessMapUv:E&&m(v.metalnessMap.channel),roughnessMapUv:y&&m(v.roughnessMap.channel),anisotropyMapUv:_t&&m(v.anisotropyMap.channel),clearcoatMapUv:Jt&&m(v.clearcoatMap.channel),clearcoatNormalMapUv:nt&&m(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:vt&&m(v.clearcoatRoughnessMap.channel),iridescenceMapUv:It&&m(v.iridescenceMap.channel),iridescenceThicknessMapUv:Lt&&m(v.iridescenceThicknessMap.channel),sheenColorMapUv:yt&&m(v.sheenColorMap.channel),sheenRoughnessMapUv:Wt&&m(v.sheenRoughnessMap.channel),specularMapUv:Ft&&m(v.specularMap.channel),specularColorMapUv:ae&&m(v.specularColorMap.channel),specularIntensityMapUv:L&&m(v.specularIntensityMap.channel),transmissionMapUv:pt&&m(v.transmissionMap.channel),thicknessMapUv:W&&m(v.thicknessMap.channel),alphaMapUv:ut&&m(v.alphaMap.channel),vertexTangents:!!H.attributes.tangent&&(Pt||O),vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,pointsUvs:V.isPoints===!0&&!!H.attributes.uv&&(se||ut),fog:!!Y,useFog:v.fog===!0,fogExp2:!!Y&&Y.isFogExp2,flatShading:v.flatShading===!0,sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:f,reverseDepthBuffer:u,skinning:V.isSkinnedMesh===!0,morphTargets:H.morphAttributes.position!==void 0,morphNormals:H.morphAttributes.normal!==void 0,morphColors:H.morphAttributes.color!==void 0,morphTargetsCount:Dt,morphTextureStride:Ut,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:v.dithering,shadowMapEnabled:n.shadowMap.enabled&&F.length>0,shadowMapType:n.shadowMap.type,toneMapping:Ze,decodeVideoTexture:se&&v.map.isVideoTexture===!0&&te.getTransfer(v.map.colorSpace)===he,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===pn,flipSided:v.side===Qe,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:Se&&v.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Se&&v.extensions.multiDraw===!0||Xt)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return Kt.vertexUv1s=c.has(1),Kt.vertexUv2s=c.has(2),Kt.vertexUv3s=c.has(3),c.clear(),Kt}function w(v){let b=[];if(v.shaderID?b.push(v.shaderID):(b.push(v.customVertexShaderID),b.push(v.customFragmentShaderID)),v.defines!==void 0)for(let F in v.defines)b.push(F),b.push(v.defines[F]);return v.isRawShaderMaterial===!1&&(x(b,v),S(b,v),b.push(n.outputColorSpace)),b.push(v.customProgramCacheKey),b.join()}function x(v,b){v.push(b.precision),v.push(b.outputColorSpace),v.push(b.envMapMode),v.push(b.envMapCubeUVHeight),v.push(b.mapUv),v.push(b.alphaMapUv),v.push(b.lightMapUv),v.push(b.aoMapUv),v.push(b.bumpMapUv),v.push(b.normalMapUv),v.push(b.displacementMapUv),v.push(b.emissiveMapUv),v.push(b.metalnessMapUv),v.push(b.roughnessMapUv),v.push(b.anisotropyMapUv),v.push(b.clearcoatMapUv),v.push(b.clearcoatNormalMapUv),v.push(b.clearcoatRoughnessMapUv),v.push(b.iridescenceMapUv),v.push(b.iridescenceThicknessMapUv),v.push(b.sheenColorMapUv),v.push(b.sheenRoughnessMapUv),v.push(b.specularMapUv),v.push(b.specularColorMapUv),v.push(b.specularIntensityMapUv),v.push(b.transmissionMapUv),v.push(b.thicknessMapUv),v.push(b.combine),v.push(b.fogExp2),v.push(b.sizeAttenuation),v.push(b.morphTargetsCount),v.push(b.morphAttributeCount),v.push(b.numDirLights),v.push(b.numPointLights),v.push(b.numSpotLights),v.push(b.numSpotLightMaps),v.push(b.numHemiLights),v.push(b.numRectAreaLights),v.push(b.numDirLightShadows),v.push(b.numPointLightShadows),v.push(b.numSpotLightShadows),v.push(b.numSpotLightShadowsWithMaps),v.push(b.numLightProbes),v.push(b.shadowMapType),v.push(b.toneMapping),v.push(b.numClippingPlanes),v.push(b.numClipIntersection),v.push(b.depthPacking)}function S(v,b){o.disableAll(),b.supportsVertexTextures&&o.enable(0),b.instancing&&o.enable(1),b.instancingColor&&o.enable(2),b.instancingMorph&&o.enable(3),b.matcap&&o.enable(4),b.envMap&&o.enable(5),b.normalMapObjectSpace&&o.enable(6),b.normalMapTangentSpace&&o.enable(7),b.clearcoat&&o.enable(8),b.iridescence&&o.enable(9),b.alphaTest&&o.enable(10),b.vertexColors&&o.enable(11),b.vertexAlphas&&o.enable(12),b.vertexUv1s&&o.enable(13),b.vertexUv2s&&o.enable(14),b.vertexUv3s&&o.enable(15),b.vertexTangents&&o.enable(16),b.anisotropy&&o.enable(17),b.alphaHash&&o.enable(18),b.batching&&o.enable(19),b.dispersion&&o.enable(20),b.batchingColor&&o.enable(21),v.push(o.mask),o.disableAll(),b.fog&&o.enable(0),b.useFog&&o.enable(1),b.flatShading&&o.enable(2),b.logarithmicDepthBuffer&&o.enable(3),b.reverseDepthBuffer&&o.enable(4),b.skinning&&o.enable(5),b.morphTargets&&o.enable(6),b.morphNormals&&o.enable(7),b.morphColors&&o.enable(8),b.premultipliedAlpha&&o.enable(9),b.shadowMapEnabled&&o.enable(10),b.doubleSided&&o.enable(11),b.flipSided&&o.enable(12),b.useDepthPacking&&o.enable(13),b.dithering&&o.enable(14),b.transmission&&o.enable(15),b.sheen&&o.enable(16),b.opaque&&o.enable(17),b.pointsUvs&&o.enable(18),b.decodeVideoTexture&&o.enable(19),b.alphaToCoverage&&o.enable(20),v.push(o.mask)}function P(v){let b=_[v.type],F;if(b){let N=Bn[b];F=ap.clone(N.uniforms)}else F=v.uniforms;return F}function T(v,b){let F;for(let N=0,V=h.length;N<V;N++){let Y=h[N];if(Y.cacheKey===b){F=Y,++F.usedTimes;break}}return F===void 0&&(F=new p_(n,b,v,r),h.push(F)),F}function A(v){if(--v.usedTimes===0){let b=h.indexOf(v);h[b]=h[h.length-1],h.pop(),v.destroy()}}function I(v){l.remove(v)}function B(){l.dispose()}return{getParameters:p,getProgramCacheKey:w,getUniforms:P,acquireProgram:T,releaseProgram:A,releaseShaderCache:I,programs:h,dispose:B}}function __(){let n=new WeakMap;function t(a){return n.has(a)}function e(a){let o=n.get(a);return o===void 0&&(o={},n.set(a,o)),o}function i(a){n.delete(a)}function s(a,o,l){n.get(a)[o]=l}function r(){n=new WeakMap}return{has:t,get:e,remove:i,update:s,dispose:r}}function v_(n,t){return n.groupOrder!==t.groupOrder?n.groupOrder-t.groupOrder:n.renderOrder!==t.renderOrder?n.renderOrder-t.renderOrder:n.material.id!==t.material.id?n.material.id-t.material.id:n.z!==t.z?n.z-t.z:n.id-t.id}function xf(n,t){return n.groupOrder!==t.groupOrder?n.groupOrder-t.groupOrder:n.renderOrder!==t.renderOrder?n.renderOrder-t.renderOrder:n.z!==t.z?t.z-n.z:n.id-t.id}function Mf(){let n=[],t=0,e=[],i=[],s=[];function r(){t=0,e.length=0,i.length=0,s.length=0}function a(f,u,d,g,_,m){let p=n[t];return p===void 0?(p={id:f.id,object:f,geometry:u,material:d,groupOrder:g,renderOrder:f.renderOrder,z:_,group:m},n[t]=p):(p.id=f.id,p.object=f,p.geometry=u,p.material=d,p.groupOrder=g,p.renderOrder=f.renderOrder,p.z=_,p.group=m),t++,p}function o(f,u,d,g,_,m){let p=a(f,u,d,g,_,m);d.transmission>0?i.push(p):d.transparent===!0?s.push(p):e.push(p)}function l(f,u,d,g,_,m){let p=a(f,u,d,g,_,m);d.transmission>0?i.unshift(p):d.transparent===!0?s.unshift(p):e.unshift(p)}function c(f,u){e.length>1&&e.sort(f||v_),i.length>1&&i.sort(u||xf),s.length>1&&s.sort(u||xf)}function h(){for(let f=t,u=n.length;f<u;f++){let d=n[f];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:e,transmissive:i,transparent:s,init:r,push:o,unshift:l,finish:h,sort:c}}function y_(){let n=new WeakMap;function t(i,s){let r=n.get(i),a;return r===void 0?(a=new Mf,n.set(i,[a])):s>=r.length?(a=new Mf,r.push(a)):a=r[s],a}function e(){n=new WeakMap}return{get:t,dispose:e}}function x_(){let n={};return{get:function(t){if(n[t.id]!==void 0)return n[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new R,color:new At};break;case"SpotLight":e={position:new R,direction:new R,color:new At,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new R,color:new At,distance:0,decay:0};break;case"HemisphereLight":e={direction:new R,skyColor:new At,groundColor:new At};break;case"RectAreaLight":e={color:new At,position:new R,halfWidth:new R,halfHeight:new R};break}return n[t.id]=e,e}}}function M_(){let n={};return{get:function(t){if(n[t.id]!==void 0)return n[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ct};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ct};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ct,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[t.id]=e,e}}}var b_=0;function S_(n,t){return(t.castShadow?2:0)-(n.castShadow?2:0)+(t.map?1:0)-(n.map?1:0)}function w_(n){let t=new x_,e=M_(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new R);let s=new R,r=new re,a=new re;function o(c){let h=0,f=0,u=0;for(let B=0;B<9;B++)i.probe[B].set(0,0,0);let d=0,g=0,_=0,m=0,p=0,w=0,x=0,S=0,P=0,T=0,A=0;c.sort(S_);for(let B=0,v=c.length;B<v;B++){let b=c[B],F=b.color,N=b.intensity,V=b.distance,Y=b.shadow&&b.shadow.map?b.shadow.map.texture:null;if(b.isAmbientLight)h+=F.r*N,f+=F.g*N,u+=F.b*N;else if(b.isLightProbe){for(let H=0;H<9;H++)i.probe[H].addScaledVector(b.sh.coefficients[H],N);A++}else if(b.isDirectionalLight){let H=t.get(b);if(H.color.copy(b.color).multiplyScalar(b.intensity),b.castShadow){let tt=b.shadow,G=e.get(b);G.shadowIntensity=tt.intensity,G.shadowBias=tt.bias,G.shadowNormalBias=tt.normalBias,G.shadowRadius=tt.radius,G.shadowMapSize=tt.mapSize,i.directionalShadow[d]=G,i.directionalShadowMap[d]=Y,i.directionalShadowMatrix[d]=b.shadow.matrix,w++}i.directional[d]=H,d++}else if(b.isSpotLight){let H=t.get(b);H.position.setFromMatrixPosition(b.matrixWorld),H.color.copy(F).multiplyScalar(N),H.distance=V,H.coneCos=Math.cos(b.angle),H.penumbraCos=Math.cos(b.angle*(1-b.penumbra)),H.decay=b.decay,i.spot[_]=H;let tt=b.shadow;if(b.map&&(i.spotLightMap[P]=b.map,P++,tt.updateMatrices(b),b.castShadow&&T++),i.spotLightMatrix[_]=tt.matrix,b.castShadow){let G=e.get(b);G.shadowIntensity=tt.intensity,G.shadowBias=tt.bias,G.shadowNormalBias=tt.normalBias,G.shadowRadius=tt.radius,G.shadowMapSize=tt.mapSize,i.spotShadow[_]=G,i.spotShadowMap[_]=Y,S++}_++}else if(b.isRectAreaLight){let H=t.get(b);H.color.copy(F).multiplyScalar(N),H.halfWidth.set(b.width*.5,0,0),H.halfHeight.set(0,b.height*.5,0),i.rectArea[m]=H,m++}else if(b.isPointLight){let H=t.get(b);if(H.color.copy(b.color).multiplyScalar(b.intensity),H.distance=b.distance,H.decay=b.decay,b.castShadow){let tt=b.shadow,G=e.get(b);G.shadowIntensity=tt.intensity,G.shadowBias=tt.bias,G.shadowNormalBias=tt.normalBias,G.shadowRadius=tt.radius,G.shadowMapSize=tt.mapSize,G.shadowCameraNear=tt.camera.near,G.shadowCameraFar=tt.camera.far,i.pointShadow[g]=G,i.pointShadowMap[g]=Y,i.pointShadowMatrix[g]=b.shadow.matrix,x++}i.point[g]=H,g++}else if(b.isHemisphereLight){let H=t.get(b);H.skyColor.copy(b.color).multiplyScalar(N),H.groundColor.copy(b.groundColor).multiplyScalar(N),i.hemi[p]=H,p++}}m>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=ot.LTC_FLOAT_1,i.rectAreaLTC2=ot.LTC_FLOAT_2):(i.rectAreaLTC1=ot.LTC_HALF_1,i.rectAreaLTC2=ot.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=f,i.ambient[2]=u;let I=i.hash;(I.directionalLength!==d||I.pointLength!==g||I.spotLength!==_||I.rectAreaLength!==m||I.hemiLength!==p||I.numDirectionalShadows!==w||I.numPointShadows!==x||I.numSpotShadows!==S||I.numSpotMaps!==P||I.numLightProbes!==A)&&(i.directional.length=d,i.spot.length=_,i.rectArea.length=m,i.point.length=g,i.hemi.length=p,i.directionalShadow.length=w,i.directionalShadowMap.length=w,i.pointShadow.length=x,i.pointShadowMap.length=x,i.spotShadow.length=S,i.spotShadowMap.length=S,i.directionalShadowMatrix.length=w,i.pointShadowMatrix.length=x,i.spotLightMatrix.length=S+P-T,i.spotLightMap.length=P,i.numSpotLightShadowsWithMaps=T,i.numLightProbes=A,I.directionalLength=d,I.pointLength=g,I.spotLength=_,I.rectAreaLength=m,I.hemiLength=p,I.numDirectionalShadows=w,I.numPointShadows=x,I.numSpotShadows=S,I.numSpotMaps=P,I.numLightProbes=A,i.version=b_++)}function l(c,h){let f=0,u=0,d=0,g=0,_=0,m=h.matrixWorldInverse;for(let p=0,w=c.length;p<w;p++){let x=c[p];if(x.isDirectionalLight){let S=i.directional[f];S.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(m),f++}else if(x.isSpotLight){let S=i.spot[d];S.position.setFromMatrixPosition(x.matrixWorld),S.position.applyMatrix4(m),S.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(m),d++}else if(x.isRectAreaLight){let S=i.rectArea[g];S.position.setFromMatrixPosition(x.matrixWorld),S.position.applyMatrix4(m),a.identity(),r.copy(x.matrixWorld),r.premultiply(m),a.extractRotation(r),S.halfWidth.set(x.width*.5,0,0),S.halfHeight.set(0,x.height*.5,0),S.halfWidth.applyMatrix4(a),S.halfHeight.applyMatrix4(a),g++}else if(x.isPointLight){let S=i.point[u];S.position.setFromMatrixPosition(x.matrixWorld),S.position.applyMatrix4(m),u++}else if(x.isHemisphereLight){let S=i.hemi[_];S.direction.setFromMatrixPosition(x.matrixWorld),S.direction.transformDirection(m),_++}}}return{setup:o,setupView:l,state:i}}function bf(n){let t=new w_(n),e=[],i=[];function s(h){c.camera=h,e.length=0,i.length=0}function r(h){e.push(h)}function a(h){i.push(h)}function o(){t.setup(e)}function l(h){t.setupView(e,h)}let c={lightsArray:e,shadowsArray:i,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function E_(n){let t=new WeakMap;function e(s,r=0){let a=t.get(s),o;return a===void 0?(o=new bf(n),t.set(s,[o])):r>=a.length?(o=new bf(n),a.push(o)):o=a[r],o}function i(){t=new WeakMap}return{get:e,dispose:i}}var Ql=class extends ci{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=gd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},jl=class extends ci{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}},T_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,A_=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function R_(n,t,e){let i=new Mr,s=new ct,r=new ct,a=new ge,o=new Ql({depthPacking:_d}),l=new jl,c={},h=e.maxTextureSize,f={[Ti]:Qe,[Qe]:Ti,[pn]:pn},u=new We({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ct},radius:{value:4}},vertexShader:T_,fragmentShader:A_}),d=u.clone();d.defines.HORIZONTAL_PASS=1;let g=new Ge;g.setAttribute("position",new Ee(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new kt(g,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Nf;let p=this.type;this.render=function(T,A,I){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;let B=n.getRenderTarget(),v=n.getActiveCubeFace(),b=n.getActiveMipmapLevel(),F=n.state;F.setBlending(wi),F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);let N=p!==ni&&this.type===ni,V=p===ni&&this.type!==ni;for(let Y=0,H=T.length;Y<H;Y++){let tt=T[Y],G=tt.shadow;if(G===void 0){console.warn("THREE.WebGLShadowMap:",tt,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;s.copy(G.mapSize);let at=G.getFrameExtents();if(s.multiply(at),r.copy(G.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/at.x),s.x=r.x*at.x,G.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/at.y),s.y=r.y*at.y,G.mapSize.y=r.y)),G.map===null||N===!0||V===!0){let rt=this.type!==ni?{minFilter:Je,magFilter:Je}:{};G.map!==null&&G.map.dispose(),G.map=new oi(s.x,s.y,rt),G.map.texture.name=tt.name+".shadowMap",G.camera.updateProjectionMatrix()}n.setRenderTarget(G.map),n.clear();let ft=G.getViewportCount();for(let rt=0;rt<ft;rt++){let Dt=G.getViewport(rt);a.set(r.x*Dt.x,r.y*Dt.y,r.x*Dt.z,r.y*Dt.w),F.viewport(a),G.updateMatrices(tt,rt),i=G.getFrustum(),S(A,I,G.camera,tt,this.type)}G.isPointLightShadow!==!0&&this.type===ni&&w(G,I),G.needsUpdate=!1}p=this.type,m.needsUpdate=!1,n.setRenderTarget(B,v,b)};function w(T,A){let I=t.update(_);u.defines.VSM_SAMPLES!==T.blurSamples&&(u.defines.VSM_SAMPLES=T.blurSamples,d.defines.VSM_SAMPLES=T.blurSamples,u.needsUpdate=!0,d.needsUpdate=!0),T.mapPass===null&&(T.mapPass=new oi(s.x,s.y)),u.uniforms.shadow_pass.value=T.map.texture,u.uniforms.resolution.value=T.mapSize,u.uniforms.radius.value=T.radius,n.setRenderTarget(T.mapPass),n.clear(),n.renderBufferDirect(A,null,I,u,_,null),d.uniforms.shadow_pass.value=T.mapPass.texture,d.uniforms.resolution.value=T.mapSize,d.uniforms.radius.value=T.radius,n.setRenderTarget(T.map),n.clear(),n.renderBufferDirect(A,null,I,d,_,null)}function x(T,A,I,B){let v=null,b=I.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(b!==void 0)v=b;else if(v=I.isPointLight===!0?l:o,n.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){let F=v.uuid,N=A.uuid,V=c[F];V===void 0&&(V={},c[F]=V);let Y=V[N];Y===void 0&&(Y=v.clone(),V[N]=Y,A.addEventListener("dispose",P)),v=Y}if(v.visible=A.visible,v.wireframe=A.wireframe,B===ni?v.side=A.shadowSide!==null?A.shadowSide:A.side:v.side=A.shadowSide!==null?A.shadowSide:f[A.side],v.alphaMap=A.alphaMap,v.alphaTest=A.alphaTest,v.map=A.map,v.clipShadows=A.clipShadows,v.clippingPlanes=A.clippingPlanes,v.clipIntersection=A.clipIntersection,v.displacementMap=A.displacementMap,v.displacementScale=A.displacementScale,v.displacementBias=A.displacementBias,v.wireframeLinewidth=A.wireframeLinewidth,v.linewidth=A.linewidth,I.isPointLight===!0&&v.isMeshDistanceMaterial===!0){let F=n.properties.get(v);F.light=I}return v}function S(T,A,I,B,v){if(T.visible===!1)return;if(T.layers.test(A.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&v===ni)&&(!T.frustumCulled||i.intersectsObject(T))){T.modelViewMatrix.multiplyMatrices(I.matrixWorldInverse,T.matrixWorld);let N=t.update(T),V=T.material;if(Array.isArray(V)){let Y=N.groups;for(let H=0,tt=Y.length;H<tt;H++){let G=Y[H],at=V[G.materialIndex];if(at&&at.visible){let ft=x(T,at,B,v);T.onBeforeShadow(n,T,A,I,N,ft,G),n.renderBufferDirect(I,null,N,ft,T,G),T.onAfterShadow(n,T,A,I,N,ft,G)}}}else if(V.visible){let Y=x(T,V,B,v);T.onBeforeShadow(n,T,A,I,N,Y,null),n.renderBufferDirect(I,null,N,Y,T,null),T.onAfterShadow(n,T,A,I,N,Y,null)}}let F=T.children;for(let N=0,V=F.length;N<V;N++)S(F[N],A,I,B,v)}function P(T){T.target.removeEventListener("dispose",P);for(let I in c){let B=c[I],v=T.target.uuid;v in B&&(B[v].dispose(),delete B[v])}}}var C_={[il]:sl,[rl]:ll,[al]:cl,[Ns]:ol,[sl]:il,[ll]:rl,[cl]:al,[ol]:Ns};function P_(n){function t(){let L=!1,pt=new ge,W=null,J=new ge(0,0,0,0);return{setMask:function(ut){W!==ut&&!L&&(n.colorMask(ut,ut,ut,ut),W=ut)},setLocked:function(ut){L=ut},setClear:function(ut,mt,Yt,Se,Ze){Ze===!0&&(ut*=Se,mt*=Se,Yt*=Se),pt.set(ut,mt,Yt,Se),J.equals(pt)===!1&&(n.clearColor(ut,mt,Yt,Se),J.copy(pt))},reset:function(){L=!1,W=null,J.set(-1,0,0,0)}}}function e(){let L=!1,pt=!1,W=null,J=null,ut=null;return{setReversed:function(mt){pt=mt},setTest:function(mt){mt?Mt(n.DEPTH_TEST):gt(n.DEPTH_TEST)},setMask:function(mt){W!==mt&&!L&&(n.depthMask(mt),W=mt)},setFunc:function(mt){if(pt&&(mt=C_[mt]),J!==mt){switch(mt){case il:n.depthFunc(n.NEVER);break;case sl:n.depthFunc(n.ALWAYS);break;case rl:n.depthFunc(n.LESS);break;case Ns:n.depthFunc(n.LEQUAL);break;case al:n.depthFunc(n.EQUAL);break;case ol:n.depthFunc(n.GEQUAL);break;case ll:n.depthFunc(n.GREATER);break;case cl:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}J=mt}},setLocked:function(mt){L=mt},setClear:function(mt){ut!==mt&&(n.clearDepth(mt),ut=mt)},reset:function(){L=!1,W=null,J=null,ut=null}}}function i(){let L=!1,pt=null,W=null,J=null,ut=null,mt=null,Yt=null,Se=null,Ze=null;return{setTest:function(Kt){L||(Kt?Mt(n.STENCIL_TEST):gt(n.STENCIL_TEST))},setMask:function(Kt){pt!==Kt&&!L&&(n.stencilMask(Kt),pt=Kt)},setFunc:function(Kt,$e,Jn){(W!==Kt||J!==$e||ut!==Jn)&&(n.stencilFunc(Kt,$e,Jn),W=Kt,J=$e,ut=Jn)},setOp:function(Kt,$e,Jn){(mt!==Kt||Yt!==$e||Se!==Jn)&&(n.stencilOp(Kt,$e,Jn),mt=Kt,Yt=$e,Se=Jn)},setLocked:function(Kt){L=Kt},setClear:function(Kt){Ze!==Kt&&(n.clearStencil(Kt),Ze=Kt)},reset:function(){L=!1,pt=null,W=null,J=null,ut=null,mt=null,Yt=null,Se=null,Ze=null}}}let s=new t,r=new e,a=new i,o=new WeakMap,l=new WeakMap,c={},h={},f=new WeakMap,u=[],d=null,g=!1,_=null,m=null,p=null,w=null,x=null,S=null,P=null,T=new At(0,0,0),A=0,I=!1,B=null,v=null,b=null,F=null,N=null,V=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),Y=!1,H=0,tt=n.getParameter(n.VERSION);tt.indexOf("WebGL")!==-1?(H=parseFloat(/^WebGL (\d)/.exec(tt)[1]),Y=H>=1):tt.indexOf("OpenGL ES")!==-1&&(H=parseFloat(/^OpenGL ES (\d)/.exec(tt)[1]),Y=H>=2);let G=null,at={},ft=n.getParameter(n.SCISSOR_BOX),rt=n.getParameter(n.VIEWPORT),Dt=new ge().fromArray(ft),Ut=new ge().fromArray(rt);function q(L,pt,W,J){let ut=new Uint8Array(4),mt=n.createTexture();n.bindTexture(L,mt),n.texParameteri(L,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(L,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Yt=0;Yt<W;Yt++)L===n.TEXTURE_3D||L===n.TEXTURE_2D_ARRAY?n.texImage3D(pt,0,n.RGBA,1,1,J,0,n.RGBA,n.UNSIGNED_BYTE,ut):n.texImage2D(pt+Yt,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,ut);return mt}let et={};et[n.TEXTURE_2D]=q(n.TEXTURE_2D,n.TEXTURE_2D,1),et[n.TEXTURE_CUBE_MAP]=q(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),et[n.TEXTURE_2D_ARRAY]=q(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),et[n.TEXTURE_3D]=q(n.TEXTURE_3D,n.TEXTURE_3D,1,1),s.setClear(0,0,0,1),r.setClear(1),a.setClear(0),Mt(n.DEPTH_TEST),r.setFunc(Ns),Gt(!1),$t(Rh),Mt(n.CULL_FACE),C(wi);function Mt(L){c[L]!==!0&&(n.enable(L),c[L]=!0)}function gt(L){c[L]!==!1&&(n.disable(L),c[L]=!1)}function Ot(L,pt){return h[L]!==pt?(n.bindFramebuffer(L,pt),h[L]=pt,L===n.DRAW_FRAMEBUFFER&&(h[n.FRAMEBUFFER]=pt),L===n.FRAMEBUFFER&&(h[n.DRAW_FRAMEBUFFER]=pt),!0):!1}function Rt(L,pt){let W=u,J=!1;if(L){W=f.get(pt),W===void 0&&(W=[],f.set(pt,W));let ut=L.textures;if(W.length!==ut.length||W[0]!==n.COLOR_ATTACHMENT0){for(let mt=0,Yt=ut.length;mt<Yt;mt++)W[mt]=n.COLOR_ATTACHMENT0+mt;W.length=ut.length,J=!0}}else W[0]!==n.BACK&&(W[0]=n.BACK,J=!0);J&&n.drawBuffers(W)}function Xt(L){return d!==L?(n.useProgram(L),d=L,!0):!1}let se={[Xi]:n.FUNC_ADD,[Gu]:n.FUNC_SUBTRACT,[Wu]:n.FUNC_REVERSE_SUBTRACT};se[Xu]=n.MIN,se[qu]=n.MAX;let qt={[Yu]:n.ZERO,[Zu]:n.ONE,[$u]:n.SRC_COLOR,[el]:n.SRC_ALPHA,[ed]:n.SRC_ALPHA_SATURATE,[ju]:n.DST_COLOR,[Ku]:n.DST_ALPHA,[Ju]:n.ONE_MINUS_SRC_COLOR,[nl]:n.ONE_MINUS_SRC_ALPHA,[td]:n.ONE_MINUS_DST_COLOR,[Qu]:n.ONE_MINUS_DST_ALPHA,[nd]:n.CONSTANT_COLOR,[id]:n.ONE_MINUS_CONSTANT_COLOR,[sd]:n.CONSTANT_ALPHA,[rd]:n.ONE_MINUS_CONSTANT_ALPHA};function C(L,pt,W,J,ut,mt,Yt,Se,Ze,Kt){if(L===wi){g===!0&&(gt(n.BLEND),g=!1);return}if(g===!1&&(Mt(n.BLEND),g=!0),L!==Vu){if(L!==_||Kt!==I){if((m!==Xi||x!==Xi)&&(n.blendEquation(n.FUNC_ADD),m=Xi,x=Xi),Kt)switch(L){case Ei:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Vn:n.blendFunc(n.ONE,n.ONE);break;case Ch:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Ph:n.blendFuncSeparate(n.ZERO,n.SRC_COLOR,n.ZERO,n.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}else switch(L){case Ei:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case Vn:n.blendFunc(n.SRC_ALPHA,n.ONE);break;case Ch:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Ph:n.blendFunc(n.ZERO,n.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}p=null,w=null,S=null,P=null,T.set(0,0,0),A=0,_=L,I=Kt}return}ut=ut||pt,mt=mt||W,Yt=Yt||J,(pt!==m||ut!==x)&&(n.blendEquationSeparate(se[pt],se[ut]),m=pt,x=ut),(W!==p||J!==w||mt!==S||Yt!==P)&&(n.blendFuncSeparate(qt[W],qt[J],qt[mt],qt[Yt]),p=W,w=J,S=mt,P=Yt),(Se.equals(T)===!1||Ze!==A)&&(n.blendColor(Se.r,Se.g,Se.b,Ze),T.copy(Se),A=Ze),_=L,I=!1}function tn(L,pt){L.side===pn?gt(n.CULL_FACE):Mt(n.CULL_FACE);let W=L.side===Qe;pt&&(W=!W),Gt(W),L.blending===Ei&&L.transparent===!1?C(wi):C(L.blending,L.blendEquation,L.blendSrc,L.blendDst,L.blendEquationAlpha,L.blendSrcAlpha,L.blendDstAlpha,L.blendColor,L.blendAlpha,L.premultipliedAlpha),r.setFunc(L.depthFunc),r.setTest(L.depthTest),r.setMask(L.depthWrite),s.setMask(L.colorWrite);let J=L.stencilWrite;a.setTest(J),J&&(a.setMask(L.stencilWriteMask),a.setFunc(L.stencilFunc,L.stencilRef,L.stencilFuncMask),a.setOp(L.stencilFail,L.stencilZFail,L.stencilZPass)),le(L.polygonOffset,L.polygonOffsetFactor,L.polygonOffsetUnits),L.alphaToCoverage===!0?Mt(n.SAMPLE_ALPHA_TO_COVERAGE):gt(n.SAMPLE_ALPHA_TO_COVERAGE)}function Gt(L){B!==L&&(L?n.frontFace(n.CW):n.frontFace(n.CCW),B=L)}function $t(L){L!==zu?(Mt(n.CULL_FACE),L!==v&&(L===Rh?n.cullFace(n.BACK):L===Hu?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):gt(n.CULL_FACE),v=L}function Pt(L){L!==b&&(Y&&n.lineWidth(L),b=L)}function le(L,pt,W){L?(Mt(n.POLYGON_OFFSET_FILL),(F!==pt||N!==W)&&(n.polygonOffset(pt,W),F=pt,N=W)):gt(n.POLYGON_OFFSET_FILL)}function Nt(L){L?Mt(n.SCISSOR_TEST):gt(n.SCISSOR_TEST)}function E(L){L===void 0&&(L=n.TEXTURE0+V-1),G!==L&&(n.activeTexture(L),G=L)}function y(L,pt,W){W===void 0&&(G===null?W=n.TEXTURE0+V-1:W=G);let J=at[W];J===void 0&&(J={type:void 0,texture:void 0},at[W]=J),(J.type!==L||J.texture!==pt)&&(G!==W&&(n.activeTexture(W),G=W),n.bindTexture(L,pt||et[L]),J.type=L,J.texture=pt)}function O(){let L=at[G];L!==void 0&&L.type!==void 0&&(n.bindTexture(L.type,null),L.type=void 0,L.texture=void 0)}function $(){try{n.compressedTexImage2D.apply(n,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function j(){try{n.compressedTexImage3D.apply(n,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Z(){try{n.texSubImage2D.apply(n,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function St(){try{n.texSubImage3D.apply(n,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function lt(){try{n.compressedTexSubImage2D.apply(n,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function _t(){try{n.compressedTexSubImage3D.apply(n,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Jt(){try{n.texStorage2D.apply(n,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function nt(){try{n.texStorage3D.apply(n,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function vt(){try{n.texImage2D.apply(n,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function It(){try{n.texImage3D.apply(n,arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Lt(L){Dt.equals(L)===!1&&(n.scissor(L.x,L.y,L.z,L.w),Dt.copy(L))}function yt(L){Ut.equals(L)===!1&&(n.viewport(L.x,L.y,L.z,L.w),Ut.copy(L))}function Wt(L,pt){let W=l.get(pt);W===void 0&&(W=new WeakMap,l.set(pt,W));let J=W.get(L);J===void 0&&(J=n.getUniformBlockIndex(pt,L.name),W.set(L,J))}function Ft(L,pt){let J=l.get(pt).get(L);o.get(pt)!==J&&(n.uniformBlockBinding(pt,J,L.__bindingPointIndex),o.set(pt,J))}function ae(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),c={},G=null,at={},h={},f=new WeakMap,u=[],d=null,g=!1,_=null,m=null,p=null,w=null,x=null,S=null,P=null,T=new At(0,0,0),A=0,I=!1,B=null,v=null,b=null,F=null,N=null,Dt.set(0,0,n.canvas.width,n.canvas.height),Ut.set(0,0,n.canvas.width,n.canvas.height),s.reset(),r.reset(),a.reset()}return{buffers:{color:s,depth:r,stencil:a},enable:Mt,disable:gt,bindFramebuffer:Ot,drawBuffers:Rt,useProgram:Xt,setBlending:C,setMaterial:tn,setFlipSided:Gt,setCullFace:$t,setLineWidth:Pt,setPolygonOffset:le,setScissorTest:Nt,activeTexture:E,bindTexture:y,unbindTexture:O,compressedTexImage2D:$,compressedTexImage3D:j,texImage2D:vt,texImage3D:It,updateUBOMapping:Wt,uniformBlockBinding:Ft,texStorage2D:Jt,texStorage3D:nt,texSubImage2D:Z,texSubImage3D:St,compressedTexSubImage2D:lt,compressedTexSubImage3D:_t,scissor:Lt,viewport:yt,reset:ae}}function Sf(n,t,e,i){let s=I_(i);switch(e){case zf:return n*t;case Vf:return n*t;case Gf:return n*t*2;case Ic:return n*t/s.components*s.byteLength;case Lc:return n*t/s.components*s.byteLength;case Wf:return n*t*2/s.components*s.byteLength;case Dc:return n*t*2/s.components*s.byteLength;case Hf:return n*t*3/s.components*s.byteLength;case Pn:return n*t*4/s.components*s.byteLength;case Uc:return n*t*4/s.components*s.byteLength;case pa:case ma:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*8;case ga:case _a:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case pl:case gl:return Math.max(n,16)*Math.max(t,8)/4;case dl:case ml:return Math.max(n,8)*Math.max(t,8)/2;case _l:case vl:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*8;case yl:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case xl:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case Ml:return Math.floor((n+4)/5)*Math.floor((t+3)/4)*16;case bl:return Math.floor((n+4)/5)*Math.floor((t+4)/5)*16;case Sl:return Math.floor((n+5)/6)*Math.floor((t+4)/5)*16;case wl:return Math.floor((n+5)/6)*Math.floor((t+5)/6)*16;case El:return Math.floor((n+7)/8)*Math.floor((t+4)/5)*16;case Tl:return Math.floor((n+7)/8)*Math.floor((t+5)/6)*16;case Al:return Math.floor((n+7)/8)*Math.floor((t+7)/8)*16;case Rl:return Math.floor((n+9)/10)*Math.floor((t+4)/5)*16;case Cl:return Math.floor((n+9)/10)*Math.floor((t+5)/6)*16;case Pl:return Math.floor((n+9)/10)*Math.floor((t+7)/8)*16;case Il:return Math.floor((n+9)/10)*Math.floor((t+9)/10)*16;case Ll:return Math.floor((n+11)/12)*Math.floor((t+9)/10)*16;case Dl:return Math.floor((n+11)/12)*Math.floor((t+11)/12)*16;case va:case Ul:case Nl:return Math.ceil(n/4)*Math.ceil(t/4)*16;case Xf:case Ol:return Math.ceil(n/4)*Math.ceil(t/4)*8;case Fl:case kl:return Math.ceil(n/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function I_(n){switch(n){case ai:case Ff:return{byteLength:1,components:1};case _r:case kf:case Er:return{byteLength:2,components:1};case Cc:case Pc:return{byteLength:2,components:4};case $i:case Rc:case zn:return{byteLength:4,components:1};case Bf:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}function L_(n,t,e,i,s,r,a){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new ct,h=new WeakMap,f,u=new WeakMap,d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(E,y){return d?new OffscreenCanvas(E,y):yr("canvas")}function _(E,y,O){let $=1,j=Nt(E);if((j.width>O||j.height>O)&&($=O/Math.max(j.width,j.height)),$<1)if(typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&E instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&E instanceof ImageBitmap||typeof VideoFrame<"u"&&E instanceof VideoFrame){let Z=Math.floor($*j.width),St=Math.floor($*j.height);f===void 0&&(f=g(Z,St));let lt=y?g(Z,St):f;return lt.width=Z,lt.height=St,lt.getContext("2d").drawImage(E,0,0,Z,St),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+j.width+"x"+j.height+") to ("+Z+"x"+St+")."),lt}else return"data"in E&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+j.width+"x"+j.height+")."),E;return E}function m(E){return E.generateMipmaps&&E.minFilter!==Je&&E.minFilter!==Rn}function p(E){n.generateMipmap(E)}function w(E,y,O,$,j=!1){if(E!==null){if(n[E]!==void 0)return n[E];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+E+"'")}let Z=y;if(y===n.RED&&(O===n.FLOAT&&(Z=n.R32F),O===n.HALF_FLOAT&&(Z=n.R16F),O===n.UNSIGNED_BYTE&&(Z=n.R8)),y===n.RED_INTEGER&&(O===n.UNSIGNED_BYTE&&(Z=n.R8UI),O===n.UNSIGNED_SHORT&&(Z=n.R16UI),O===n.UNSIGNED_INT&&(Z=n.R32UI),O===n.BYTE&&(Z=n.R8I),O===n.SHORT&&(Z=n.R16I),O===n.INT&&(Z=n.R32I)),y===n.RG&&(O===n.FLOAT&&(Z=n.RG32F),O===n.HALF_FLOAT&&(Z=n.RG16F),O===n.UNSIGNED_BYTE&&(Z=n.RG8)),y===n.RG_INTEGER&&(O===n.UNSIGNED_BYTE&&(Z=n.RG8UI),O===n.UNSIGNED_SHORT&&(Z=n.RG16UI),O===n.UNSIGNED_INT&&(Z=n.RG32UI),O===n.BYTE&&(Z=n.RG8I),O===n.SHORT&&(Z=n.RG16I),O===n.INT&&(Z=n.RG32I)),y===n.RGB_INTEGER&&(O===n.UNSIGNED_BYTE&&(Z=n.RGB8UI),O===n.UNSIGNED_SHORT&&(Z=n.RGB16UI),O===n.UNSIGNED_INT&&(Z=n.RGB32UI),O===n.BYTE&&(Z=n.RGB8I),O===n.SHORT&&(Z=n.RGB16I),O===n.INT&&(Z=n.RGB32I)),y===n.RGBA_INTEGER&&(O===n.UNSIGNED_BYTE&&(Z=n.RGBA8UI),O===n.UNSIGNED_SHORT&&(Z=n.RGBA16UI),O===n.UNSIGNED_INT&&(Z=n.RGBA32UI),O===n.BYTE&&(Z=n.RGBA8I),O===n.SHORT&&(Z=n.RGBA16I),O===n.INT&&(Z=n.RGBA32I)),y===n.RGB&&O===n.UNSIGNED_INT_5_9_9_9_REV&&(Z=n.RGB9_E5),y===n.RGBA){let St=j?Ma:te.getTransfer($);O===n.FLOAT&&(Z=n.RGBA32F),O===n.HALF_FLOAT&&(Z=n.RGBA16F),O===n.UNSIGNED_BYTE&&(Z=St===he?n.SRGB8_ALPHA8:n.RGBA8),O===n.UNSIGNED_SHORT_4_4_4_4&&(Z=n.RGBA4),O===n.UNSIGNED_SHORT_5_5_5_1&&(Z=n.RGB5_A1)}return(Z===n.R16F||Z===n.R32F||Z===n.RG16F||Z===n.RG32F||Z===n.RGBA16F||Z===n.RGBA32F)&&t.get("EXT_color_buffer_float"),Z}function x(E,y){let O;return E?y===null||y===$i||y===Bs?O=n.DEPTH24_STENCIL8:y===zn?O=n.DEPTH32F_STENCIL8:y===_r&&(O=n.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===$i||y===Bs?O=n.DEPTH_COMPONENT24:y===zn?O=n.DEPTH_COMPONENT32F:y===_r&&(O=n.DEPTH_COMPONENT16),O}function S(E,y){return m(E)===!0||E.isFramebufferTexture&&E.minFilter!==Je&&E.minFilter!==Rn?Math.log2(Math.max(y.width,y.height))+1:E.mipmaps!==void 0&&E.mipmaps.length>0?E.mipmaps.length:E.isCompressedTexture&&Array.isArray(E.image)?y.mipmaps.length:1}function P(E){let y=E.target;y.removeEventListener("dispose",P),A(y),y.isVideoTexture&&h.delete(y)}function T(E){let y=E.target;y.removeEventListener("dispose",T),B(y)}function A(E){let y=i.get(E);if(y.__webglInit===void 0)return;let O=E.source,$=u.get(O);if($){let j=$[y.__cacheKey];j.usedTimes--,j.usedTimes===0&&I(E),Object.keys($).length===0&&u.delete(O)}i.remove(E)}function I(E){let y=i.get(E);n.deleteTexture(y.__webglTexture);let O=E.source,$=u.get(O);delete $[y.__cacheKey],a.memory.textures--}function B(E){let y=i.get(E);if(E.depthTexture&&E.depthTexture.dispose(),E.isWebGLCubeRenderTarget)for(let $=0;$<6;$++){if(Array.isArray(y.__webglFramebuffer[$]))for(let j=0;j<y.__webglFramebuffer[$].length;j++)n.deleteFramebuffer(y.__webglFramebuffer[$][j]);else n.deleteFramebuffer(y.__webglFramebuffer[$]);y.__webglDepthbuffer&&n.deleteRenderbuffer(y.__webglDepthbuffer[$])}else{if(Array.isArray(y.__webglFramebuffer))for(let $=0;$<y.__webglFramebuffer.length;$++)n.deleteFramebuffer(y.__webglFramebuffer[$]);else n.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&n.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&n.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let $=0;$<y.__webglColorRenderbuffer.length;$++)y.__webglColorRenderbuffer[$]&&n.deleteRenderbuffer(y.__webglColorRenderbuffer[$]);y.__webglDepthRenderbuffer&&n.deleteRenderbuffer(y.__webglDepthRenderbuffer)}let O=E.textures;for(let $=0,j=O.length;$<j;$++){let Z=i.get(O[$]);Z.__webglTexture&&(n.deleteTexture(Z.__webglTexture),a.memory.textures--),i.remove(O[$])}i.remove(E)}let v=0;function b(){v=0}function F(){let E=v;return E>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+E+" texture units while this GPU supports only "+s.maxTextures),v+=1,E}function N(E){let y=[];return y.push(E.wrapS),y.push(E.wrapT),y.push(E.wrapR||0),y.push(E.magFilter),y.push(E.minFilter),y.push(E.anisotropy),y.push(E.internalFormat),y.push(E.format),y.push(E.type),y.push(E.generateMipmaps),y.push(E.premultiplyAlpha),y.push(E.flipY),y.push(E.unpackAlignment),y.push(E.colorSpace),y.join()}function V(E,y){let O=i.get(E);if(E.isVideoTexture&&Pt(E),E.isRenderTargetTexture===!1&&E.version>0&&O.__version!==E.version){let $=E.image;if($===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if($.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Ut(O,E,y);return}}e.bindTexture(n.TEXTURE_2D,O.__webglTexture,n.TEXTURE0+y)}function Y(E,y){let O=i.get(E);if(E.version>0&&O.__version!==E.version){Ut(O,E,y);return}e.bindTexture(n.TEXTURE_2D_ARRAY,O.__webglTexture,n.TEXTURE0+y)}function H(E,y){let O=i.get(E);if(E.version>0&&O.__version!==E.version){Ut(O,E,y);return}e.bindTexture(n.TEXTURE_3D,O.__webglTexture,n.TEXTURE0+y)}function tt(E,y){let O=i.get(E);if(E.version>0&&O.__version!==E.version){q(O,E,y);return}e.bindTexture(n.TEXTURE_CUBE_MAP,O.__webglTexture,n.TEXTURE0+y)}let G={[ks]:n.REPEAT,[Yi]:n.CLAMP_TO_EDGE,[ul]:n.MIRRORED_REPEAT},at={[Je]:n.NEAREST,[md]:n.NEAREST_MIPMAP_NEAREST,[Hr]:n.NEAREST_MIPMAP_LINEAR,[Rn]:n.LINEAR,[Mo]:n.LINEAR_MIPMAP_NEAREST,[Zi]:n.LINEAR_MIPMAP_LINEAR},ft={[yd]:n.NEVER,[Ed]:n.ALWAYS,[xd]:n.LESS,[qf]:n.LEQUAL,[Md]:n.EQUAL,[wd]:n.GEQUAL,[bd]:n.GREATER,[Sd]:n.NOTEQUAL};function rt(E,y){if(y.type===zn&&t.has("OES_texture_float_linear")===!1&&(y.magFilter===Rn||y.magFilter===Mo||y.magFilter===Hr||y.magFilter===Zi||y.minFilter===Rn||y.minFilter===Mo||y.minFilter===Hr||y.minFilter===Zi)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(E,n.TEXTURE_WRAP_S,G[y.wrapS]),n.texParameteri(E,n.TEXTURE_WRAP_T,G[y.wrapT]),(E===n.TEXTURE_3D||E===n.TEXTURE_2D_ARRAY)&&n.texParameteri(E,n.TEXTURE_WRAP_R,G[y.wrapR]),n.texParameteri(E,n.TEXTURE_MAG_FILTER,at[y.magFilter]),n.texParameteri(E,n.TEXTURE_MIN_FILTER,at[y.minFilter]),y.compareFunction&&(n.texParameteri(E,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(E,n.TEXTURE_COMPARE_FUNC,ft[y.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===Je||y.minFilter!==Hr&&y.minFilter!==Zi||y.type===zn&&t.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||i.get(y).__currentAnisotropy){let O=t.get("EXT_texture_filter_anisotropic");n.texParameterf(E,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,s.getMaxAnisotropy())),i.get(y).__currentAnisotropy=y.anisotropy}}}function Dt(E,y){let O=!1;E.__webglInit===void 0&&(E.__webglInit=!0,y.addEventListener("dispose",P));let $=y.source,j=u.get($);j===void 0&&(j={},u.set($,j));let Z=N(y);if(Z!==E.__cacheKey){j[Z]===void 0&&(j[Z]={texture:n.createTexture(),usedTimes:0},a.memory.textures++,O=!0),j[Z].usedTimes++;let St=j[E.__cacheKey];St!==void 0&&(j[E.__cacheKey].usedTimes--,St.usedTimes===0&&I(y)),E.__cacheKey=Z,E.__webglTexture=j[Z].texture}return O}function Ut(E,y,O){let $=n.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&($=n.TEXTURE_2D_ARRAY),y.isData3DTexture&&($=n.TEXTURE_3D);let j=Dt(E,y),Z=y.source;e.bindTexture($,E.__webglTexture,n.TEXTURE0+O);let St=i.get(Z);if(Z.version!==St.__version||j===!0){e.activeTexture(n.TEXTURE0+O);let lt=te.getPrimaries(te.workingColorSpace),_t=y.colorSpace===bi?null:te.getPrimaries(y.colorSpace),Jt=y.colorSpace===bi||lt===_t?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,y.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,y.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Jt);let nt=_(y.image,!1,s.maxTextureSize);nt=le(y,nt);let vt=r.convert(y.format,y.colorSpace),It=r.convert(y.type),Lt=w(y.internalFormat,vt,It,y.colorSpace,y.isVideoTexture);rt($,y);let yt,Wt=y.mipmaps,Ft=y.isVideoTexture!==!0,ae=St.__version===void 0||j===!0,L=Z.dataReady,pt=S(y,nt);if(y.isDepthTexture)Lt=x(y.format===zs,y.type),ae&&(Ft?e.texStorage2D(n.TEXTURE_2D,1,Lt,nt.width,nt.height):e.texImage2D(n.TEXTURE_2D,0,Lt,nt.width,nt.height,0,vt,It,null));else if(y.isDataTexture)if(Wt.length>0){Ft&&ae&&e.texStorage2D(n.TEXTURE_2D,pt,Lt,Wt[0].width,Wt[0].height);for(let W=0,J=Wt.length;W<J;W++)yt=Wt[W],Ft?L&&e.texSubImage2D(n.TEXTURE_2D,W,0,0,yt.width,yt.height,vt,It,yt.data):e.texImage2D(n.TEXTURE_2D,W,Lt,yt.width,yt.height,0,vt,It,yt.data);y.generateMipmaps=!1}else Ft?(ae&&e.texStorage2D(n.TEXTURE_2D,pt,Lt,nt.width,nt.height),L&&e.texSubImage2D(n.TEXTURE_2D,0,0,0,nt.width,nt.height,vt,It,nt.data)):e.texImage2D(n.TEXTURE_2D,0,Lt,nt.width,nt.height,0,vt,It,nt.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){Ft&&ae&&e.texStorage3D(n.TEXTURE_2D_ARRAY,pt,Lt,Wt[0].width,Wt[0].height,nt.depth);for(let W=0,J=Wt.length;W<J;W++)if(yt=Wt[W],y.format!==Pn)if(vt!==null)if(Ft){if(L)if(y.layerUpdates.size>0){let ut=Sf(yt.width,yt.height,y.format,y.type);for(let mt of y.layerUpdates){let Yt=yt.data.subarray(mt*ut/yt.data.BYTES_PER_ELEMENT,(mt+1)*ut/yt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,W,0,0,mt,yt.width,yt.height,1,vt,Yt,0,0)}y.clearLayerUpdates()}else e.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,W,0,0,0,yt.width,yt.height,nt.depth,vt,yt.data,0,0)}else e.compressedTexImage3D(n.TEXTURE_2D_ARRAY,W,Lt,yt.width,yt.height,nt.depth,0,yt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ft?L&&e.texSubImage3D(n.TEXTURE_2D_ARRAY,W,0,0,0,yt.width,yt.height,nt.depth,vt,It,yt.data):e.texImage3D(n.TEXTURE_2D_ARRAY,W,Lt,yt.width,yt.height,nt.depth,0,vt,It,yt.data)}else{Ft&&ae&&e.texStorage2D(n.TEXTURE_2D,pt,Lt,Wt[0].width,Wt[0].height);for(let W=0,J=Wt.length;W<J;W++)yt=Wt[W],y.format!==Pn?vt!==null?Ft?L&&e.compressedTexSubImage2D(n.TEXTURE_2D,W,0,0,yt.width,yt.height,vt,yt.data):e.compressedTexImage2D(n.TEXTURE_2D,W,Lt,yt.width,yt.height,0,yt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ft?L&&e.texSubImage2D(n.TEXTURE_2D,W,0,0,yt.width,yt.height,vt,It,yt.data):e.texImage2D(n.TEXTURE_2D,W,Lt,yt.width,yt.height,0,vt,It,yt.data)}else if(y.isDataArrayTexture)if(Ft){if(ae&&e.texStorage3D(n.TEXTURE_2D_ARRAY,pt,Lt,nt.width,nt.height,nt.depth),L)if(y.layerUpdates.size>0){let W=Sf(nt.width,nt.height,y.format,y.type);for(let J of y.layerUpdates){let ut=nt.data.subarray(J*W/nt.data.BYTES_PER_ELEMENT,(J+1)*W/nt.data.BYTES_PER_ELEMENT);e.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,J,nt.width,nt.height,1,vt,It,ut)}y.clearLayerUpdates()}else e.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,nt.width,nt.height,nt.depth,vt,It,nt.data)}else e.texImage3D(n.TEXTURE_2D_ARRAY,0,Lt,nt.width,nt.height,nt.depth,0,vt,It,nt.data);else if(y.isData3DTexture)Ft?(ae&&e.texStorage3D(n.TEXTURE_3D,pt,Lt,nt.width,nt.height,nt.depth),L&&e.texSubImage3D(n.TEXTURE_3D,0,0,0,0,nt.width,nt.height,nt.depth,vt,It,nt.data)):e.texImage3D(n.TEXTURE_3D,0,Lt,nt.width,nt.height,nt.depth,0,vt,It,nt.data);else if(y.isFramebufferTexture){if(ae)if(Ft)e.texStorage2D(n.TEXTURE_2D,pt,Lt,nt.width,nt.height);else{let W=nt.width,J=nt.height;for(let ut=0;ut<pt;ut++)e.texImage2D(n.TEXTURE_2D,ut,Lt,W,J,0,vt,It,null),W>>=1,J>>=1}}else if(Wt.length>0){if(Ft&&ae){let W=Nt(Wt[0]);e.texStorage2D(n.TEXTURE_2D,pt,Lt,W.width,W.height)}for(let W=0,J=Wt.length;W<J;W++)yt=Wt[W],Ft?L&&e.texSubImage2D(n.TEXTURE_2D,W,0,0,vt,It,yt):e.texImage2D(n.TEXTURE_2D,W,Lt,vt,It,yt);y.generateMipmaps=!1}else if(Ft){if(ae){let W=Nt(nt);e.texStorage2D(n.TEXTURE_2D,pt,Lt,W.width,W.height)}L&&e.texSubImage2D(n.TEXTURE_2D,0,0,0,vt,It,nt)}else e.texImage2D(n.TEXTURE_2D,0,Lt,vt,It,nt);m(y)&&p($),St.__version=Z.version,y.onUpdate&&y.onUpdate(y)}E.__version=y.version}function q(E,y,O){if(y.image.length!==6)return;let $=Dt(E,y),j=y.source;e.bindTexture(n.TEXTURE_CUBE_MAP,E.__webglTexture,n.TEXTURE0+O);let Z=i.get(j);if(j.version!==Z.__version||$===!0){e.activeTexture(n.TEXTURE0+O);let St=te.getPrimaries(te.workingColorSpace),lt=y.colorSpace===bi?null:te.getPrimaries(y.colorSpace),_t=y.colorSpace===bi||St===lt?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,y.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,y.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,_t);let Jt=y.isCompressedTexture||y.image[0].isCompressedTexture,nt=y.image[0]&&y.image[0].isDataTexture,vt=[];for(let J=0;J<6;J++)!Jt&&!nt?vt[J]=_(y.image[J],!0,s.maxCubemapSize):vt[J]=nt?y.image[J].image:y.image[J],vt[J]=le(y,vt[J]);let It=vt[0],Lt=r.convert(y.format,y.colorSpace),yt=r.convert(y.type),Wt=w(y.internalFormat,Lt,yt,y.colorSpace),Ft=y.isVideoTexture!==!0,ae=Z.__version===void 0||$===!0,L=j.dataReady,pt=S(y,It);rt(n.TEXTURE_CUBE_MAP,y);let W;if(Jt){Ft&&ae&&e.texStorage2D(n.TEXTURE_CUBE_MAP,pt,Wt,It.width,It.height);for(let J=0;J<6;J++){W=vt[J].mipmaps;for(let ut=0;ut<W.length;ut++){let mt=W[ut];y.format!==Pn?Lt!==null?Ft?L&&e.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+J,ut,0,0,mt.width,mt.height,Lt,mt.data):e.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+J,ut,Wt,mt.width,mt.height,0,mt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ft?L&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+J,ut,0,0,mt.width,mt.height,Lt,yt,mt.data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+J,ut,Wt,mt.width,mt.height,0,Lt,yt,mt.data)}}}else{if(W=y.mipmaps,Ft&&ae){W.length>0&&pt++;let J=Nt(vt[0]);e.texStorage2D(n.TEXTURE_CUBE_MAP,pt,Wt,J.width,J.height)}for(let J=0;J<6;J++)if(nt){Ft?L&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,vt[J].width,vt[J].height,Lt,yt,vt[J].data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,Wt,vt[J].width,vt[J].height,0,Lt,yt,vt[J].data);for(let ut=0;ut<W.length;ut++){let Yt=W[ut].image[J].image;Ft?L&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+J,ut+1,0,0,Yt.width,Yt.height,Lt,yt,Yt.data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+J,ut+1,Wt,Yt.width,Yt.height,0,Lt,yt,Yt.data)}}else{Ft?L&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,0,0,Lt,yt,vt[J]):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+J,0,Wt,Lt,yt,vt[J]);for(let ut=0;ut<W.length;ut++){let mt=W[ut];Ft?L&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+J,ut+1,0,0,Lt,yt,mt.image[J]):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+J,ut+1,Wt,Lt,yt,mt.image[J])}}}m(y)&&p(n.TEXTURE_CUBE_MAP),Z.__version=j.version,y.onUpdate&&y.onUpdate(y)}E.__version=y.version}function et(E,y,O,$,j,Z){let St=r.convert(O.format,O.colorSpace),lt=r.convert(O.type),_t=w(O.internalFormat,St,lt,O.colorSpace);if(!i.get(y).__hasExternalTextures){let nt=Math.max(1,y.width>>Z),vt=Math.max(1,y.height>>Z);j===n.TEXTURE_3D||j===n.TEXTURE_2D_ARRAY?e.texImage3D(j,Z,_t,nt,vt,y.depth,0,St,lt,null):e.texImage2D(j,Z,_t,nt,vt,0,St,lt,null)}e.bindFramebuffer(n.FRAMEBUFFER,E),$t(y)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,$,j,i.get(O).__webglTexture,0,Gt(y)):(j===n.TEXTURE_2D||j>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&j<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,$,j,i.get(O).__webglTexture,Z),e.bindFramebuffer(n.FRAMEBUFFER,null)}function Mt(E,y,O){if(n.bindRenderbuffer(n.RENDERBUFFER,E),y.depthBuffer){let $=y.depthTexture,j=$&&$.isDepthTexture?$.type:null,Z=x(y.stencilBuffer,j),St=y.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,lt=Gt(y);$t(y)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,lt,Z,y.width,y.height):O?n.renderbufferStorageMultisample(n.RENDERBUFFER,lt,Z,y.width,y.height):n.renderbufferStorage(n.RENDERBUFFER,Z,y.width,y.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,St,n.RENDERBUFFER,E)}else{let $=y.textures;for(let j=0;j<$.length;j++){let Z=$[j],St=r.convert(Z.format,Z.colorSpace),lt=r.convert(Z.type),_t=w(Z.internalFormat,St,lt,Z.colorSpace),Jt=Gt(y);O&&$t(y)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,Jt,_t,y.width,y.height):$t(y)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Jt,_t,y.width,y.height):n.renderbufferStorage(n.RENDERBUFFER,_t,y.width,y.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function gt(E,y){if(y&&y.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(n.FRAMEBUFFER,E),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!i.get(y.depthTexture).__webglTexture||y.depthTexture.image.width!==y.width||y.depthTexture.image.height!==y.height)&&(y.depthTexture.image.width=y.width,y.depthTexture.image.height=y.height,y.depthTexture.needsUpdate=!0),V(y.depthTexture,0);let $=i.get(y.depthTexture).__webglTexture,j=Gt(y);if(y.depthTexture.format===Ls)$t(y)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,$,0,j):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,$,0);else if(y.depthTexture.format===zs)$t(y)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,$,0,j):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,$,0);else throw new Error("Unknown depthTexture format")}function Ot(E){let y=i.get(E),O=E.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==E.depthTexture){let $=E.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),$){let j=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,$.removeEventListener("dispose",j)};$.addEventListener("dispose",j),y.__depthDisposeCallback=j}y.__boundDepthTexture=$}if(E.depthTexture&&!y.__autoAllocateDepthBuffer){if(O)throw new Error("target.depthTexture not supported in Cube render targets");gt(y.__webglFramebuffer,E)}else if(O){y.__webglDepthbuffer=[];for(let $=0;$<6;$++)if(e.bindFramebuffer(n.FRAMEBUFFER,y.__webglFramebuffer[$]),y.__webglDepthbuffer[$]===void 0)y.__webglDepthbuffer[$]=n.createRenderbuffer(),Mt(y.__webglDepthbuffer[$],E,!1);else{let j=E.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Z=y.__webglDepthbuffer[$];n.bindRenderbuffer(n.RENDERBUFFER,Z),n.framebufferRenderbuffer(n.FRAMEBUFFER,j,n.RENDERBUFFER,Z)}}else if(e.bindFramebuffer(n.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=n.createRenderbuffer(),Mt(y.__webglDepthbuffer,E,!1);else{let $=E.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,j=y.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,j),n.framebufferRenderbuffer(n.FRAMEBUFFER,$,n.RENDERBUFFER,j)}e.bindFramebuffer(n.FRAMEBUFFER,null)}function Rt(E,y,O){let $=i.get(E);y!==void 0&&et($.__webglFramebuffer,E,E.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),O!==void 0&&Ot(E)}function Xt(E){let y=E.texture,O=i.get(E),$=i.get(y);E.addEventListener("dispose",T);let j=E.textures,Z=E.isWebGLCubeRenderTarget===!0,St=j.length>1;if(St||($.__webglTexture===void 0&&($.__webglTexture=n.createTexture()),$.__version=y.version,a.memory.textures++),Z){O.__webglFramebuffer=[];for(let lt=0;lt<6;lt++)if(y.mipmaps&&y.mipmaps.length>0){O.__webglFramebuffer[lt]=[];for(let _t=0;_t<y.mipmaps.length;_t++)O.__webglFramebuffer[lt][_t]=n.createFramebuffer()}else O.__webglFramebuffer[lt]=n.createFramebuffer()}else{if(y.mipmaps&&y.mipmaps.length>0){O.__webglFramebuffer=[];for(let lt=0;lt<y.mipmaps.length;lt++)O.__webglFramebuffer[lt]=n.createFramebuffer()}else O.__webglFramebuffer=n.createFramebuffer();if(St)for(let lt=0,_t=j.length;lt<_t;lt++){let Jt=i.get(j[lt]);Jt.__webglTexture===void 0&&(Jt.__webglTexture=n.createTexture(),a.memory.textures++)}if(E.samples>0&&$t(E)===!1){O.__webglMultisampledFramebuffer=n.createFramebuffer(),O.__webglColorRenderbuffer=[],e.bindFramebuffer(n.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let lt=0;lt<j.length;lt++){let _t=j[lt];O.__webglColorRenderbuffer[lt]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,O.__webglColorRenderbuffer[lt]);let Jt=r.convert(_t.format,_t.colorSpace),nt=r.convert(_t.type),vt=w(_t.internalFormat,Jt,nt,_t.colorSpace,E.isXRRenderTarget===!0),It=Gt(E);n.renderbufferStorageMultisample(n.RENDERBUFFER,It,vt,E.width,E.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+lt,n.RENDERBUFFER,O.__webglColorRenderbuffer[lt])}n.bindRenderbuffer(n.RENDERBUFFER,null),E.depthBuffer&&(O.__webglDepthRenderbuffer=n.createRenderbuffer(),Mt(O.__webglDepthRenderbuffer,E,!0)),e.bindFramebuffer(n.FRAMEBUFFER,null)}}if(Z){e.bindTexture(n.TEXTURE_CUBE_MAP,$.__webglTexture),rt(n.TEXTURE_CUBE_MAP,y);for(let lt=0;lt<6;lt++)if(y.mipmaps&&y.mipmaps.length>0)for(let _t=0;_t<y.mipmaps.length;_t++)et(O.__webglFramebuffer[lt][_t],E,y,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,_t);else et(O.__webglFramebuffer[lt],E,y,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+lt,0);m(y)&&p(n.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(St){for(let lt=0,_t=j.length;lt<_t;lt++){let Jt=j[lt],nt=i.get(Jt);e.bindTexture(n.TEXTURE_2D,nt.__webglTexture),rt(n.TEXTURE_2D,Jt),et(O.__webglFramebuffer,E,Jt,n.COLOR_ATTACHMENT0+lt,n.TEXTURE_2D,0),m(Jt)&&p(n.TEXTURE_2D)}e.unbindTexture()}else{let lt=n.TEXTURE_2D;if((E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(lt=E.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),e.bindTexture(lt,$.__webglTexture),rt(lt,y),y.mipmaps&&y.mipmaps.length>0)for(let _t=0;_t<y.mipmaps.length;_t++)et(O.__webglFramebuffer[_t],E,y,n.COLOR_ATTACHMENT0,lt,_t);else et(O.__webglFramebuffer,E,y,n.COLOR_ATTACHMENT0,lt,0);m(y)&&p(lt),e.unbindTexture()}E.depthBuffer&&Ot(E)}function se(E){let y=E.textures;for(let O=0,$=y.length;O<$;O++){let j=y[O];if(m(j)){let Z=E.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:n.TEXTURE_2D,St=i.get(j).__webglTexture;e.bindTexture(Z,St),p(Z),e.unbindTexture()}}}let qt=[],C=[];function tn(E){if(E.samples>0){if($t(E)===!1){let y=E.textures,O=E.width,$=E.height,j=n.COLOR_BUFFER_BIT,Z=E.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,St=i.get(E),lt=y.length>1;if(lt)for(let _t=0;_t<y.length;_t++)e.bindFramebuffer(n.FRAMEBUFFER,St.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+_t,n.RENDERBUFFER,null),e.bindFramebuffer(n.FRAMEBUFFER,St.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+_t,n.TEXTURE_2D,null,0);e.bindFramebuffer(n.READ_FRAMEBUFFER,St.__webglMultisampledFramebuffer),e.bindFramebuffer(n.DRAW_FRAMEBUFFER,St.__webglFramebuffer);for(let _t=0;_t<y.length;_t++){if(E.resolveDepthBuffer&&(E.depthBuffer&&(j|=n.DEPTH_BUFFER_BIT),E.stencilBuffer&&E.resolveStencilBuffer&&(j|=n.STENCIL_BUFFER_BIT)),lt){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,St.__webglColorRenderbuffer[_t]);let Jt=i.get(y[_t]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Jt,0)}n.blitFramebuffer(0,0,O,$,0,0,O,$,j,n.NEAREST),l===!0&&(qt.length=0,C.length=0,qt.push(n.COLOR_ATTACHMENT0+_t),E.depthBuffer&&E.resolveDepthBuffer===!1&&(qt.push(Z),C.push(Z),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,C)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,qt))}if(e.bindFramebuffer(n.READ_FRAMEBUFFER,null),e.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),lt)for(let _t=0;_t<y.length;_t++){e.bindFramebuffer(n.FRAMEBUFFER,St.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+_t,n.RENDERBUFFER,St.__webglColorRenderbuffer[_t]);let Jt=i.get(y[_t]).__webglTexture;e.bindFramebuffer(n.FRAMEBUFFER,St.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+_t,n.TEXTURE_2D,Jt,0)}e.bindFramebuffer(n.DRAW_FRAMEBUFFER,St.__webglMultisampledFramebuffer)}else if(E.depthBuffer&&E.resolveDepthBuffer===!1&&l){let y=E.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[y])}}}function Gt(E){return Math.min(s.maxSamples,E.samples)}function $t(E){let y=i.get(E);return E.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function Pt(E){let y=a.render.frame;h.get(E)!==y&&(h.set(E,y),E.update())}function le(E,y){let O=E.colorSpace,$=E.format,j=E.type;return E.isCompressedTexture===!0||E.isVideoTexture===!0||O!==Pi&&O!==bi&&(te.getTransfer(O)===he?($!==Pn||j!==ai)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",O)),y}function Nt(E){return typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement?(c.width=E.naturalWidth||E.width,c.height=E.naturalHeight||E.height):typeof VideoFrame<"u"&&E instanceof VideoFrame?(c.width=E.displayWidth,c.height=E.displayHeight):(c.width=E.width,c.height=E.height),c}this.allocateTextureUnit=F,this.resetTextureUnits=b,this.setTexture2D=V,this.setTexture2DArray=Y,this.setTexture3D=H,this.setTextureCube=tt,this.rebindTextures=Rt,this.setupRenderTarget=Xt,this.updateRenderTargetMipmap=se,this.updateMultisampleRenderTarget=tn,this.setupDepthRenderbuffer=Ot,this.setupFrameBufferTexture=et,this.useMultisampledRTT=$t}function D_(n,t){function e(i,s=bi){let r,a=te.getTransfer(s);if(i===ai)return n.UNSIGNED_BYTE;if(i===Cc)return n.UNSIGNED_SHORT_4_4_4_4;if(i===Pc)return n.UNSIGNED_SHORT_5_5_5_1;if(i===Bf)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===Ff)return n.BYTE;if(i===kf)return n.SHORT;if(i===_r)return n.UNSIGNED_SHORT;if(i===Rc)return n.INT;if(i===$i)return n.UNSIGNED_INT;if(i===zn)return n.FLOAT;if(i===Er)return n.HALF_FLOAT;if(i===zf)return n.ALPHA;if(i===Hf)return n.RGB;if(i===Pn)return n.RGBA;if(i===Vf)return n.LUMINANCE;if(i===Gf)return n.LUMINANCE_ALPHA;if(i===Ls)return n.DEPTH_COMPONENT;if(i===zs)return n.DEPTH_STENCIL;if(i===Ic)return n.RED;if(i===Lc)return n.RED_INTEGER;if(i===Wf)return n.RG;if(i===Dc)return n.RG_INTEGER;if(i===Uc)return n.RGBA_INTEGER;if(i===pa||i===ma||i===ga||i===_a)if(a===he)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===pa)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===ma)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===ga)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===_a)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===pa)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===ma)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===ga)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===_a)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===dl||i===pl||i===ml||i===gl)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===dl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===pl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===ml)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===gl)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===_l||i===vl||i===yl)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(i===_l||i===vl)return a===he?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===yl)return a===he?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===xl||i===Ml||i===bl||i===Sl||i===wl||i===El||i===Tl||i===Al||i===Rl||i===Cl||i===Pl||i===Il||i===Ll||i===Dl)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(i===xl)return a===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Ml)return a===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===bl)return a===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Sl)return a===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===wl)return a===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===El)return a===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Tl)return a===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Al)return a===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Rl)return a===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Cl)return a===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Pl)return a===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Il)return a===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Ll)return a===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Dl)return a===he?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===va||i===Ul||i===Nl)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(i===va)return a===he?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===Ul)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Nl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Xf||i===Ol||i===Fl||i===kl)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(i===va)return r.COMPRESSED_RED_RGTC1_EXT;if(i===Ol)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Fl)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===kl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===Bs?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:e}}var tc=class extends He{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}},Ke=class extends _e{constructor(){super(),this.isGroup=!0,this.type="Group"}},U_={type:"move"},pr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ke,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ke,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new R,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new R),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ke,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new R,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new R),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let i of t.hand.values())this._getHandJoint(e,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,i){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(let _ of t.hand.values()){let m=e.getJointPose(_,i),p=this._getHandJoint(c,_);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let h=c.joints["index-finger-tip"],f=c.joints["thumb-tip"],u=h.position.distanceTo(f.position),d=.02,g=.005;c.inputState.pinching&&u>d+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&u<=d-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(s=e.getPose(t.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(U_)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let i=new Ke;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[e.jointName]=i,t.add(i)}return t.joints[e.jointName]}},N_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,O_=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,ec=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,i){if(this.texture===null){let s=new Ve,r=t.properties.get(s);r.__webglTexture=e.texture,(e.depthNear!=i.depthNear||e.depthFar!=i.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=s}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,i=new We({vertexShader:N_,fragmentShader:O_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new kt(new mn(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},nc=class extends Ai{constructor(t,e){super();let i=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,f=null,u=null,d=null,g=null,_=new ec,m=e.getContextAttributes(),p=null,w=null,x=[],S=[],P=new ct,T=null,A=new He;A.layers.enable(1),A.viewport=new ge;let I=new He;I.layers.enable(2),I.viewport=new ge;let B=[A,I],v=new tc;v.layers.enable(1),v.layers.enable(2);let b=null,F=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let et=x[q];return et===void 0&&(et=new pr,x[q]=et),et.getTargetRaySpace()},this.getControllerGrip=function(q){let et=x[q];return et===void 0&&(et=new pr,x[q]=et),et.getGripSpace()},this.getHand=function(q){let et=x[q];return et===void 0&&(et=new pr,x[q]=et),et.getHandSpace()};function N(q){let et=S.indexOf(q.inputSource);if(et===-1)return;let Mt=x[et];Mt!==void 0&&(Mt.update(q.inputSource,q.frame,c||a),Mt.dispatchEvent({type:q.type,data:q.inputSource}))}function V(){s.removeEventListener("select",N),s.removeEventListener("selectstart",N),s.removeEventListener("selectend",N),s.removeEventListener("squeeze",N),s.removeEventListener("squeezestart",N),s.removeEventListener("squeezeend",N),s.removeEventListener("end",V),s.removeEventListener("inputsourceschange",Y);for(let q=0;q<x.length;q++){let et=S[q];et!==null&&(S[q]=null,x[q].disconnect(et))}b=null,F=null,_.reset(),t.setRenderTarget(p),d=null,u=null,f=null,s=null,w=null,Ut.stop(),i.isPresenting=!1,t.setPixelRatio(T),t.setSize(P.width,P.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){r=q,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){o=q,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(q){c=q},this.getBaseLayer=function(){return u!==null?u:d},this.getBinding=function(){return f},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(q){if(s=q,s!==null){if(p=t.getRenderTarget(),s.addEventListener("select",N),s.addEventListener("selectstart",N),s.addEventListener("selectend",N),s.addEventListener("squeeze",N),s.addEventListener("squeezestart",N),s.addEventListener("squeezeend",N),s.addEventListener("end",V),s.addEventListener("inputsourceschange",Y),m.xrCompatible!==!0&&await e.makeXRCompatible(),T=t.getPixelRatio(),t.getSize(P),s.renderState.layers===void 0){let et={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(s,e,et),s.updateRenderState({baseLayer:d}),t.setPixelRatio(1),t.setSize(d.framebufferWidth,d.framebufferHeight,!1),w=new oi(d.framebufferWidth,d.framebufferHeight,{format:Pn,type:ai,colorSpace:t.outputColorSpace,stencilBuffer:m.stencil})}else{let et=null,Mt=null,gt=null;m.depth&&(gt=m.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,et=m.stencil?zs:Ls,Mt=m.stencil?Bs:$i);let Ot={colorFormat:e.RGBA8,depthFormat:gt,scaleFactor:r};f=new XRWebGLBinding(s,e),u=f.createProjectionLayer(Ot),s.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),w=new oi(u.textureWidth,u.textureHeight,{format:Pn,type:ai,depthTexture:new Ua(u.textureWidth,u.textureHeight,Mt,void 0,void 0,void 0,void 0,void 0,void 0,et),stencilBuffer:m.stencil,colorSpace:t.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1})}w.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),Ut.setContext(s),Ut.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function Y(q){for(let et=0;et<q.removed.length;et++){let Mt=q.removed[et],gt=S.indexOf(Mt);gt>=0&&(S[gt]=null,x[gt].disconnect(Mt))}for(let et=0;et<q.added.length;et++){let Mt=q.added[et],gt=S.indexOf(Mt);if(gt===-1){for(let Rt=0;Rt<x.length;Rt++)if(Rt>=S.length){S.push(Mt),gt=Rt;break}else if(S[Rt]===null){S[Rt]=Mt,gt=Rt;break}if(gt===-1)break}let Ot=x[gt];Ot&&Ot.connect(Mt)}}let H=new R,tt=new R;function G(q,et,Mt){H.setFromMatrixPosition(et.matrixWorld),tt.setFromMatrixPosition(Mt.matrixWorld);let gt=H.distanceTo(tt),Ot=et.projectionMatrix.elements,Rt=Mt.projectionMatrix.elements,Xt=Ot[14]/(Ot[10]-1),se=Ot[14]/(Ot[10]+1),qt=(Ot[9]+1)/Ot[5],C=(Ot[9]-1)/Ot[5],tn=(Ot[8]-1)/Ot[0],Gt=(Rt[8]+1)/Rt[0],$t=Xt*tn,Pt=Xt*Gt,le=gt/(-tn+Gt),Nt=le*-tn;if(et.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(Nt),q.translateZ(le),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),Ot[10]===-1)q.projectionMatrix.copy(et.projectionMatrix),q.projectionMatrixInverse.copy(et.projectionMatrixInverse);else{let E=Xt+le,y=se+le,O=$t-Nt,$=Pt+(gt-Nt),j=qt*se/y*E,Z=C*se/y*E;q.projectionMatrix.makePerspective(O,$,j,Z,E,y),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function at(q,et){et===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(et.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(s===null)return;let et=q.near,Mt=q.far;_.texture!==null&&(_.depthNear>0&&(et=_.depthNear),_.depthFar>0&&(Mt=_.depthFar)),v.near=I.near=A.near=et,v.far=I.far=A.far=Mt,(b!==v.near||F!==v.far)&&(s.updateRenderState({depthNear:v.near,depthFar:v.far}),b=v.near,F=v.far);let gt=q.parent,Ot=v.cameras;at(v,gt);for(let Rt=0;Rt<Ot.length;Rt++)at(Ot[Rt],gt);Ot.length===2?G(v,A,I):v.projectionMatrix.copy(A.projectionMatrix),ft(q,v,gt)};function ft(q,et,Mt){Mt===null?q.matrix.copy(et.matrixWorld):(q.matrix.copy(Mt.matrixWorld),q.matrix.invert(),q.matrix.multiply(et.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(et.projectionMatrix),q.projectionMatrixInverse.copy(et.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=vr*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return v},this.getFoveation=function(){if(!(u===null&&d===null))return l},this.setFoveation=function(q){l=q,u!==null&&(u.fixedFoveation=q),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=q)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(v)};let rt=null;function Dt(q,et){if(h=et.getViewerPose(c||a),g=et,h!==null){let Mt=h.views;d!==null&&(t.setRenderTargetFramebuffer(w,d.framebuffer),t.setRenderTarget(w));let gt=!1;Mt.length!==v.cameras.length&&(v.cameras.length=0,gt=!0);for(let Rt=0;Rt<Mt.length;Rt++){let Xt=Mt[Rt],se=null;if(d!==null)se=d.getViewport(Xt);else{let C=f.getViewSubImage(u,Xt);se=C.viewport,Rt===0&&(t.setRenderTargetTextures(w,C.colorTexture,u.ignoreDepthValues?void 0:C.depthStencilTexture),t.setRenderTarget(w))}let qt=B[Rt];qt===void 0&&(qt=new He,qt.layers.enable(Rt),qt.viewport=new ge,B[Rt]=qt),qt.matrix.fromArray(Xt.transform.matrix),qt.matrix.decompose(qt.position,qt.quaternion,qt.scale),qt.projectionMatrix.fromArray(Xt.projectionMatrix),qt.projectionMatrixInverse.copy(qt.projectionMatrix).invert(),qt.viewport.set(se.x,se.y,se.width,se.height),Rt===0&&(v.matrix.copy(qt.matrix),v.matrix.decompose(v.position,v.quaternion,v.scale)),gt===!0&&v.cameras.push(qt)}let Ot=s.enabledFeatures;if(Ot&&Ot.includes("depth-sensing")){let Rt=f.getDepthInformation(Mt[0]);Rt&&Rt.isValid&&Rt.texture&&_.init(t,Rt,s.renderState)}}for(let Mt=0;Mt<x.length;Mt++){let gt=S[Mt],Ot=x[Mt];gt!==null&&Ot!==void 0&&Ot.update(gt,et,c||a)}rt&&rt(q,et),et.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:et}),g=null}let Ut=new Kf;Ut.setAnimationLoop(Dt),this.setAnimationLoop=function(q){rt=q},this.dispose=function(){}}},Gi=new In,F_=new re;function k_(n,t){function e(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function i(m,p){p.color.getRGB(m.fogColor.value,Jf(n)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,w,x,S){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),f(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p)):p.isMeshStandardMaterial?(r(m,p),u(m,p),p.isMeshPhysicalMaterial&&d(m,p,S)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),_(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?l(m,p,w,x):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,e(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Qe&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,e(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Qe&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,e(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,e(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,e(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let w=t.get(p),x=w.envMap,S=w.envMapRotation;x&&(m.envMap.value=x,Gi.copy(S),Gi.x*=-1,Gi.y*=-1,Gi.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(Gi.y*=-1,Gi.z*=-1),m.envMapRotation.value.setFromMatrix4(F_.makeRotationFromEuler(Gi)),m.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,e(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,e(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,w,x){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*w,m.scale.value=x*.5,p.map&&(m.map.value=p.map,e(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function f(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function u(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,e(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,e(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function d(m,p,w){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,e(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,e(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,e(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,e(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,e(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Qe&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,e(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,e(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=w.texture,m.transmissionSamplerSize.value.set(w.width,w.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,e(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,e(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,e(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,e(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,e(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function _(m,p){let w=t.get(p).light;m.referencePosition.value.setFromMatrixPosition(w.matrixWorld),m.nearDistance.value=w.shadow.camera.near,m.farDistance.value=w.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function B_(n,t,e,i){let s={},r={},a=[],o=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(w,x){let S=x.program;i.uniformBlockBinding(w,S)}function c(w,x){let S=s[w.id];S===void 0&&(g(w),S=h(w),s[w.id]=S,w.addEventListener("dispose",m));let P=x.program;i.updateUBOMapping(w,P);let T=t.render.frame;r[w.id]!==T&&(u(w),r[w.id]=T)}function h(w){let x=f();w.__bindingPointIndex=x;let S=n.createBuffer(),P=w.__size,T=w.usage;return n.bindBuffer(n.UNIFORM_BUFFER,S),n.bufferData(n.UNIFORM_BUFFER,P,T),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,x,S),S}function f(){for(let w=0;w<o;w++)if(a.indexOf(w)===-1)return a.push(w),w;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(w){let x=s[w.id],S=w.uniforms,P=w.__cache;n.bindBuffer(n.UNIFORM_BUFFER,x);for(let T=0,A=S.length;T<A;T++){let I=Array.isArray(S[T])?S[T]:[S[T]];for(let B=0,v=I.length;B<v;B++){let b=I[B];if(d(b,T,B,P)===!0){let F=b.__offset,N=Array.isArray(b.value)?b.value:[b.value],V=0;for(let Y=0;Y<N.length;Y++){let H=N[Y],tt=_(H);typeof H=="number"||typeof H=="boolean"?(b.__data[0]=H,n.bufferSubData(n.UNIFORM_BUFFER,F+V,b.__data)):H.isMatrix3?(b.__data[0]=H.elements[0],b.__data[1]=H.elements[1],b.__data[2]=H.elements[2],b.__data[3]=0,b.__data[4]=H.elements[3],b.__data[5]=H.elements[4],b.__data[6]=H.elements[5],b.__data[7]=0,b.__data[8]=H.elements[6],b.__data[9]=H.elements[7],b.__data[10]=H.elements[8],b.__data[11]=0):(H.toArray(b.__data,V),V+=tt.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,F,b.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function d(w,x,S,P){let T=w.value,A=x+"_"+S;if(P[A]===void 0)return typeof T=="number"||typeof T=="boolean"?P[A]=T:P[A]=T.clone(),!0;{let I=P[A];if(typeof T=="number"||typeof T=="boolean"){if(I!==T)return P[A]=T,!0}else if(I.equals(T)===!1)return I.copy(T),!0}return!1}function g(w){let x=w.uniforms,S=0,P=16;for(let A=0,I=x.length;A<I;A++){let B=Array.isArray(x[A])?x[A]:[x[A]];for(let v=0,b=B.length;v<b;v++){let F=B[v],N=Array.isArray(F.value)?F.value:[F.value];for(let V=0,Y=N.length;V<Y;V++){let H=N[V],tt=_(H),G=S%P,at=G%tt.boundary,ft=G+at;S+=at,ft!==0&&P-ft<tt.storage&&(S+=P-ft),F.__data=new Float32Array(tt.storage/Float32Array.BYTES_PER_ELEMENT),F.__offset=S,S+=tt.storage}}}let T=S%P;return T>0&&(S+=P-T),w.__size=S,w.__cache={},this}function _(w){let x={boundary:0,storage:0};return typeof w=="number"||typeof w=="boolean"?(x.boundary=4,x.storage=4):w.isVector2?(x.boundary=8,x.storage=8):w.isVector3||w.isColor?(x.boundary=16,x.storage=12):w.isVector4?(x.boundary=16,x.storage=16):w.isMatrix3?(x.boundary=48,x.storage=48):w.isMatrix4?(x.boundary=64,x.storage=64):w.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",w),x}function m(w){let x=w.target;x.removeEventListener("dispose",m);let S=a.indexOf(x.__bindingPointIndex);a.splice(S,1),n.deleteBuffer(s[x.id]),delete s[x.id],delete r[x.id]}function p(){for(let w in s)n.deleteBuffer(s[w]);a=[],s={},r={}}return{bind:l,update:c,dispose:p}}var Na=class{constructor(t={}){let{canvas:e=Vd(),context:i=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:f=!1}=t;this.isWebGLRenderer=!0;let u;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");u=i.getContextAttributes().alpha}else u=a;let d=new Uint32Array(4),g=new Int32Array(4),_=null,m=null,p=[],w=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=fe,this.toneMapping=Hn,this.toneMappingExposure=1;let x=this,S=!1,P=0,T=0,A=null,I=-1,B=null,v=new ge,b=new ge,F=null,N=new At(0),V=0,Y=e.width,H=e.height,tt=1,G=null,at=null,ft=new ge(0,0,Y,H),rt=new ge(0,0,Y,H),Dt=!1,Ut=new Mr,q=!1,et=!1,Mt=new re,gt=new re,Ot=new R,Rt=new ge,Xt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},se=!1;function qt(){return A===null?tt:1}let C=i;function tn(M,D){return e.getContext(M,D)}try{let M={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:f};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Ec}`),e.addEventListener("webglcontextlost",J,!1),e.addEventListener("webglcontextrestored",ut,!1),e.addEventListener("webglcontextcreationerror",mt,!1),C===null){let D="webgl2";if(C=tn(D,M),C===null)throw tn(D)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(M){throw console.error("THREE.WebGLRenderer: "+M.message),M}let Gt,$t,Pt,le,Nt,E,y,O,$,j,Z,St,lt,_t,Jt,nt,vt,It,Lt,yt,Wt,Ft,ae,L;function pt(){Gt=new eg(C),Gt.init(),Ft=new D_(C,Gt),$t=new $0(C,Gt,t,Ft),Pt=new P_(C),$t.reverseDepthBuffer&&Pt.buffers.depth.setReversed(!0),le=new sg(C),Nt=new __,E=new L_(C,Gt,Pt,Nt,$t,Ft,le),y=new K0(x),O=new tg(x),$=new fp(C),ae=new Y0(C,$),j=new ng(C,$,le,ae),Z=new ag(C,j,$,le),Lt=new rg(C,$t,E),nt=new J0(Nt),St=new g_(x,y,O,Gt,$t,ae,nt),lt=new k_(x,Nt),_t=new y_,Jt=new E_(Gt),It=new q0(x,y,O,Pt,Z,u,l),vt=new R_(x,Z,$t),L=new B_(C,le,$t,Pt),yt=new Z0(C,Gt,le),Wt=new ig(C,Gt,le),le.programs=St.programs,x.capabilities=$t,x.extensions=Gt,x.properties=Nt,x.renderLists=_t,x.shadowMap=vt,x.state=Pt,x.info=le}pt();let W=new nc(x,C);this.xr=W,this.getContext=function(){return C},this.getContextAttributes=function(){return C.getContextAttributes()},this.forceContextLoss=function(){let M=Gt.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){let M=Gt.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return tt},this.setPixelRatio=function(M){M!==void 0&&(tt=M,this.setSize(Y,H,!1))},this.getSize=function(M){return M.set(Y,H)},this.setSize=function(M,D,k=!0){if(W.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}Y=M,H=D,e.width=Math.floor(M*tt),e.height=Math.floor(D*tt),k===!0&&(e.style.width=M+"px",e.style.height=D+"px"),this.setViewport(0,0,M,D)},this.getDrawingBufferSize=function(M){return M.set(Y*tt,H*tt).floor()},this.setDrawingBufferSize=function(M,D,k){Y=M,H=D,tt=k,e.width=Math.floor(M*k),e.height=Math.floor(D*k),this.setViewport(0,0,M,D)},this.getCurrentViewport=function(M){return M.copy(v)},this.getViewport=function(M){return M.copy(ft)},this.setViewport=function(M,D,k,z){M.isVector4?ft.set(M.x,M.y,M.z,M.w):ft.set(M,D,k,z),Pt.viewport(v.copy(ft).multiplyScalar(tt).round())},this.getScissor=function(M){return M.copy(rt)},this.setScissor=function(M,D,k,z){M.isVector4?rt.set(M.x,M.y,M.z,M.w):rt.set(M,D,k,z),Pt.scissor(b.copy(rt).multiplyScalar(tt).round())},this.getScissorTest=function(){return Dt},this.setScissorTest=function(M){Pt.setScissorTest(Dt=M)},this.setOpaqueSort=function(M){G=M},this.setTransparentSort=function(M){at=M},this.getClearColor=function(M){return M.copy(It.getClearColor())},this.setClearColor=function(){It.setClearColor.apply(It,arguments)},this.getClearAlpha=function(){return It.getClearAlpha()},this.setClearAlpha=function(){It.setClearAlpha.apply(It,arguments)},this.clear=function(M=!0,D=!0,k=!0){let z=0;if(M){let U=!1;if(A!==null){let it=A.texture.format;U=it===Uc||it===Dc||it===Lc}if(U){let it=A.texture.type,dt=it===ai||it===$i||it===_r||it===Bs||it===Cc||it===Pc,xt=It.getClearColor(),bt=It.getClearAlpha(),Tt=xt.r,Ct=xt.g,wt=xt.b;dt?(d[0]=Tt,d[1]=Ct,d[2]=wt,d[3]=bt,C.clearBufferuiv(C.COLOR,0,d)):(g[0]=Tt,g[1]=Ct,g[2]=wt,g[3]=bt,C.clearBufferiv(C.COLOR,0,g))}else z|=C.COLOR_BUFFER_BIT}D&&(z|=C.DEPTH_BUFFER_BIT,C.clearDepth(this.capabilities.reverseDepthBuffer?0:1)),k&&(z|=C.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),C.clear(z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",J,!1),e.removeEventListener("webglcontextrestored",ut,!1),e.removeEventListener("webglcontextcreationerror",mt,!1),_t.dispose(),Jt.dispose(),Nt.dispose(),y.dispose(),O.dispose(),Z.dispose(),ae.dispose(),L.dispose(),St.dispose(),W.dispose(),W.removeEventListener("sessionstart",xh),W.removeEventListener("sessionend",Mh),Fi.stop()};function J(M){M.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),S=!0}function ut(){console.log("THREE.WebGLRenderer: Context Restored."),S=!1;let M=le.autoReset,D=vt.enabled,k=vt.autoUpdate,z=vt.needsUpdate,U=vt.type;pt(),le.autoReset=M,vt.enabled=D,vt.autoUpdate=k,vt.needsUpdate=z,vt.type=U}function mt(M){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function Yt(M){let D=M.target;D.removeEventListener("dispose",Yt),Se(D)}function Se(M){Ze(M),Nt.remove(M)}function Ze(M){let D=Nt.get(M).programs;D!==void 0&&(D.forEach(function(k){St.releaseProgram(k)}),M.isShaderMaterial&&St.releaseShaderCache(M))}this.renderBufferDirect=function(M,D,k,z,U,it){D===null&&(D=Xt);let dt=U.isMesh&&U.matrixWorld.determinant()<0,xt=Ou(M,D,k,z,U);Pt.setMaterial(z,dt);let bt=k.index,Tt=1;if(z.wireframe===!0){if(bt=j.getWireframeAttribute(k),bt===void 0)return;Tt=2}let Ct=k.drawRange,wt=k.attributes.position,ne=Ct.start*Tt,ce=(Ct.start+Ct.count)*Tt;it!==null&&(ne=Math.max(ne,it.start*Tt),ce=Math.min(ce,(it.start+it.count)*Tt)),bt!==null?(ne=Math.max(ne,0),ce=Math.min(ce,bt.count)):wt!=null&&(ne=Math.max(ne,0),ce=Math.min(ce,wt.count));let me=ce-ne;if(me<0||me===1/0)return;ae.setup(U,z,xt,k,bt);let en,Qt=yt;if(bt!==null&&(en=$.get(bt),Qt=Wt,Qt.setIndex(en)),U.isMesh)z.wireframe===!0?(Pt.setLineWidth(z.wireframeLinewidth*qt()),Qt.setMode(C.LINES)):Qt.setMode(C.TRIANGLES);else if(U.isLine){let Et=z.linewidth;Et===void 0&&(Et=1),Pt.setLineWidth(Et*qt()),U.isLineSegments?Qt.setMode(C.LINES):U.isLineLoop?Qt.setMode(C.LINE_LOOP):Qt.setMode(C.LINE_STRIP)}else U.isPoints?Qt.setMode(C.POINTS):U.isSprite&&Qt.setMode(C.TRIANGLES);if(U.isBatchedMesh)if(U._multiDrawInstances!==null)Qt.renderMultiDrawInstances(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount,U._multiDrawInstances);else if(Gt.get("WEBGL_multi_draw"))Qt.renderMultiDraw(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount);else{let Et=U._multiDrawStarts,De=U._multiDrawCounts,jt=U._multiDrawCount,wn=bt?$.get(bt).bytesPerElement:1,fs=Nt.get(z).currentProgram.getUniforms();for(let nn=0;nn<jt;nn++)fs.setValue(C,"_gl_DrawID",nn),Qt.render(Et[nn]/wn,De[nn])}else if(U.isInstancedMesh)Qt.renderInstances(ne,me,U.count);else if(k.isInstancedBufferGeometry){let Et=k._maxInstanceCount!==void 0?k._maxInstanceCount:1/0,De=Math.min(k.instanceCount,Et);Qt.renderInstances(ne,me,De)}else Qt.render(ne,me)};function Kt(M,D,k){M.transparent===!0&&M.side===pn&&M.forceSinglePass===!1?(M.side=Qe,M.needsUpdate=!0,zr(M,D,k),M.side=Ti,M.needsUpdate=!0,zr(M,D,k),M.side=pn):zr(M,D,k)}this.compile=function(M,D,k=null){k===null&&(k=M),m=Jt.get(k),m.init(D),w.push(m),k.traverseVisible(function(U){U.isLight&&U.layers.test(D.layers)&&(m.pushLight(U),U.castShadow&&m.pushShadow(U))}),M!==k&&M.traverseVisible(function(U){U.isLight&&U.layers.test(D.layers)&&(m.pushLight(U),U.castShadow&&m.pushShadow(U))}),m.setupLights();let z=new Set;return M.traverse(function(U){if(!(U.isMesh||U.isPoints||U.isLine||U.isSprite))return;let it=U.material;if(it)if(Array.isArray(it))for(let dt=0;dt<it.length;dt++){let xt=it[dt];Kt(xt,k,U),z.add(xt)}else Kt(it,k,U),z.add(it)}),w.pop(),m=null,z},this.compileAsync=function(M,D,k=null){let z=this.compile(M,D,k);return new Promise(U=>{function it(){if(z.forEach(function(dt){Nt.get(dt).currentProgram.isReady()&&z.delete(dt)}),z.size===0){U(M);return}setTimeout(it,10)}Gt.get("KHR_parallel_shader_compile")!==null?it():setTimeout(it,10)})};let $e=null;function Jn(M){$e&&$e(M)}function xh(){Fi.stop()}function Mh(){Fi.start()}let Fi=new Kf;Fi.setAnimationLoop(Jn),typeof self<"u"&&Fi.setContext(self),this.setAnimationLoop=function(M){$e=M,W.setAnimationLoop(M),M===null?Fi.stop():Fi.start()},W.addEventListener("sessionstart",xh),W.addEventListener("sessionend",Mh),this.render=function(M,D){if(D!==void 0&&D.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(S===!0)return;if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),D.parent===null&&D.matrixWorldAutoUpdate===!0&&D.updateMatrixWorld(),W.enabled===!0&&W.isPresenting===!0&&(W.cameraAutoUpdate===!0&&W.updateCamera(D),D=W.getCamera()),M.isScene===!0&&M.onBeforeRender(x,M,D,A),m=Jt.get(M,w.length),m.init(D),w.push(m),gt.multiplyMatrices(D.projectionMatrix,D.matrixWorldInverse),Ut.setFromProjectionMatrix(gt),et=this.localClippingEnabled,q=nt.init(this.clippingPlanes,et),_=_t.get(M,p.length),_.init(),p.push(_),W.enabled===!0&&W.isPresenting===!0){let it=x.xr.getDepthSensingMesh();it!==null&&_o(it,D,-1/0,x.sortObjects)}_o(M,D,0,x.sortObjects),_.finish(),x.sortObjects===!0&&_.sort(G,at),se=W.enabled===!1||W.isPresenting===!1||W.hasDepthSensing()===!1,se&&It.addToRenderList(_,M),this.info.render.frame++,q===!0&&nt.beginShadows();let k=m.state.shadowsArray;vt.render(k,M,D),q===!0&&nt.endShadows(),this.info.autoReset===!0&&this.info.reset();let z=_.opaque,U=_.transmissive;if(m.setupLights(),D.isArrayCamera){let it=D.cameras;if(U.length>0)for(let dt=0,xt=it.length;dt<xt;dt++){let bt=it[dt];Sh(z,U,M,bt)}se&&It.render(M);for(let dt=0,xt=it.length;dt<xt;dt++){let bt=it[dt];bh(_,M,bt,bt.viewport)}}else U.length>0&&Sh(z,U,M,D),se&&It.render(M),bh(_,M,D);A!==null&&(E.updateMultisampleRenderTarget(A),E.updateRenderTargetMipmap(A)),M.isScene===!0&&M.onAfterRender(x,M,D),ae.resetDefaultState(),I=-1,B=null,w.pop(),w.length>0?(m=w[w.length-1],q===!0&&nt.setGlobalState(x.clippingPlanes,m.state.camera)):m=null,p.pop(),p.length>0?_=p[p.length-1]:_=null};function _o(M,D,k,z){if(M.visible===!1)return;if(M.layers.test(D.layers)){if(M.isGroup)k=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(D);else if(M.isLight)m.pushLight(M),M.castShadow&&m.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||Ut.intersectsSprite(M)){z&&Rt.setFromMatrixPosition(M.matrixWorld).applyMatrix4(gt);let dt=Z.update(M),xt=M.material;xt.visible&&_.push(M,dt,xt,k,Rt.z,null)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||Ut.intersectsObject(M))){let dt=Z.update(M),xt=M.material;if(z&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),Rt.copy(M.boundingSphere.center)):(dt.boundingSphere===null&&dt.computeBoundingSphere(),Rt.copy(dt.boundingSphere.center)),Rt.applyMatrix4(M.matrixWorld).applyMatrix4(gt)),Array.isArray(xt)){let bt=dt.groups;for(let Tt=0,Ct=bt.length;Tt<Ct;Tt++){let wt=bt[Tt],ne=xt[wt.materialIndex];ne&&ne.visible&&_.push(M,dt,ne,k,Rt.z,wt)}}else xt.visible&&_.push(M,dt,xt,k,Rt.z,null)}}let it=M.children;for(let dt=0,xt=it.length;dt<xt;dt++)_o(it[dt],D,k,z)}function bh(M,D,k,z){let U=M.opaque,it=M.transmissive,dt=M.transparent;m.setupLightsView(k),q===!0&&nt.setGlobalState(x.clippingPlanes,k),z&&Pt.viewport(v.copy(z)),U.length>0&&Br(U,D,k),it.length>0&&Br(it,D,k),dt.length>0&&Br(dt,D,k),Pt.buffers.depth.setTest(!0),Pt.buffers.depth.setMask(!0),Pt.buffers.color.setMask(!0),Pt.setPolygonOffset(!1)}function Sh(M,D,k,z){if((k.isScene===!0?k.overrideMaterial:null)!==null)return;m.state.transmissionRenderTarget[z.id]===void 0&&(m.state.transmissionRenderTarget[z.id]=new oi(1,1,{generateMipmaps:!0,type:Gt.has("EXT_color_buffer_half_float")||Gt.has("EXT_color_buffer_float")?Er:ai,minFilter:Zi,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:te.workingColorSpace}));let it=m.state.transmissionRenderTarget[z.id],dt=z.viewport||v;it.setSize(dt.z,dt.w);let xt=x.getRenderTarget();x.setRenderTarget(it),x.getClearColor(N),V=x.getClearAlpha(),V<1&&x.setClearColor(16777215,.5),x.clear(),se&&It.render(k);let bt=x.toneMapping;x.toneMapping=Hn;let Tt=z.viewport;if(z.viewport!==void 0&&(z.viewport=void 0),m.setupLightsView(z),q===!0&&nt.setGlobalState(x.clippingPlanes,z),Br(M,k,z),E.updateMultisampleRenderTarget(it),E.updateRenderTargetMipmap(it),Gt.has("WEBGL_multisampled_render_to_texture")===!1){let Ct=!1;for(let wt=0,ne=D.length;wt<ne;wt++){let ce=D[wt],me=ce.object,en=ce.geometry,Qt=ce.material,Et=ce.group;if(Qt.side===pn&&me.layers.test(z.layers)){let De=Qt.side;Qt.side=Qe,Qt.needsUpdate=!0,wh(me,k,z,en,Qt,Et),Qt.side=De,Qt.needsUpdate=!0,Ct=!0}}Ct===!0&&(E.updateMultisampleRenderTarget(it),E.updateRenderTargetMipmap(it))}x.setRenderTarget(xt),x.setClearColor(N,V),Tt!==void 0&&(z.viewport=Tt),x.toneMapping=bt}function Br(M,D,k){let z=D.isScene===!0?D.overrideMaterial:null;for(let U=0,it=M.length;U<it;U++){let dt=M[U],xt=dt.object,bt=dt.geometry,Tt=z===null?dt.material:z,Ct=dt.group;xt.layers.test(k.layers)&&wh(xt,D,k,bt,Tt,Ct)}}function wh(M,D,k,z,U,it){M.onBeforeRender(x,D,k,z,U,it),M.modelViewMatrix.multiplyMatrices(k.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),U.onBeforeRender(x,D,k,z,M,it),U.transparent===!0&&U.side===pn&&U.forceSinglePass===!1?(U.side=Qe,U.needsUpdate=!0,x.renderBufferDirect(k,D,z,U,M,it),U.side=Ti,U.needsUpdate=!0,x.renderBufferDirect(k,D,z,U,M,it),U.side=pn):x.renderBufferDirect(k,D,z,U,M,it),M.onAfterRender(x,D,k,z,U,it)}function zr(M,D,k){D.isScene!==!0&&(D=Xt);let z=Nt.get(M),U=m.state.lights,it=m.state.shadowsArray,dt=U.state.version,xt=St.getParameters(M,U.state,it,D,k),bt=St.getProgramCacheKey(xt),Tt=z.programs;z.environment=M.isMeshStandardMaterial?D.environment:null,z.fog=D.fog,z.envMap=(M.isMeshStandardMaterial?O:y).get(M.envMap||z.environment),z.envMapRotation=z.environment!==null&&M.envMap===null?D.environmentRotation:M.envMapRotation,Tt===void 0&&(M.addEventListener("dispose",Yt),Tt=new Map,z.programs=Tt);let Ct=Tt.get(bt);if(Ct!==void 0){if(z.currentProgram===Ct&&z.lightsStateVersion===dt)return Th(M,xt),Ct}else xt.uniforms=St.getUniforms(M),M.onBeforeCompile(xt,x),Ct=St.acquireProgram(xt,bt),Tt.set(bt,Ct),z.uniforms=xt.uniforms;let wt=z.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(wt.clippingPlanes=nt.uniform),Th(M,xt),z.needsLights=ku(M),z.lightsStateVersion=dt,z.needsLights&&(wt.ambientLightColor.value=U.state.ambient,wt.lightProbe.value=U.state.probe,wt.directionalLights.value=U.state.directional,wt.directionalLightShadows.value=U.state.directionalShadow,wt.spotLights.value=U.state.spot,wt.spotLightShadows.value=U.state.spotShadow,wt.rectAreaLights.value=U.state.rectArea,wt.ltc_1.value=U.state.rectAreaLTC1,wt.ltc_2.value=U.state.rectAreaLTC2,wt.pointLights.value=U.state.point,wt.pointLightShadows.value=U.state.pointShadow,wt.hemisphereLights.value=U.state.hemi,wt.directionalShadowMap.value=U.state.directionalShadowMap,wt.directionalShadowMatrix.value=U.state.directionalShadowMatrix,wt.spotShadowMap.value=U.state.spotShadowMap,wt.spotLightMatrix.value=U.state.spotLightMatrix,wt.spotLightMap.value=U.state.spotLightMap,wt.pointShadowMap.value=U.state.pointShadowMap,wt.pointShadowMatrix.value=U.state.pointShadowMatrix),z.currentProgram=Ct,z.uniformsList=null,Ct}function Eh(M){if(M.uniformsList===null){let D=M.currentProgram.getUniforms();M.uniformsList=Us.seqWithValue(D.seq,M.uniforms)}return M.uniformsList}function Th(M,D){let k=Nt.get(M);k.outputColorSpace=D.outputColorSpace,k.batching=D.batching,k.batchingColor=D.batchingColor,k.instancing=D.instancing,k.instancingColor=D.instancingColor,k.instancingMorph=D.instancingMorph,k.skinning=D.skinning,k.morphTargets=D.morphTargets,k.morphNormals=D.morphNormals,k.morphColors=D.morphColors,k.morphTargetsCount=D.morphTargetsCount,k.numClippingPlanes=D.numClippingPlanes,k.numIntersection=D.numClipIntersection,k.vertexAlphas=D.vertexAlphas,k.vertexTangents=D.vertexTangents,k.toneMapping=D.toneMapping}function Ou(M,D,k,z,U){D.isScene!==!0&&(D=Xt),E.resetTextureUnits();let it=D.fog,dt=z.isMeshStandardMaterial?D.environment:null,xt=A===null?x.outputColorSpace:A.isXRRenderTarget===!0?A.texture.colorSpace:Pi,bt=(z.isMeshStandardMaterial?O:y).get(z.envMap||dt),Tt=z.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,Ct=!!k.attributes.tangent&&(!!z.normalMap||z.anisotropy>0),wt=!!k.morphAttributes.position,ne=!!k.morphAttributes.normal,ce=!!k.morphAttributes.color,me=Hn;z.toneMapped&&(A===null||A.isXRRenderTarget===!0)&&(me=x.toneMapping);let en=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,Qt=en!==void 0?en.length:0,Et=Nt.get(z),De=m.state.lights;if(q===!0&&(et===!0||M!==B)){let un=M===B&&z.id===I;nt.setState(z,M,un)}let jt=!1;z.version===Et.__version?(Et.needsLights&&Et.lightsStateVersion!==De.state.version||Et.outputColorSpace!==xt||U.isBatchedMesh&&Et.batching===!1||!U.isBatchedMesh&&Et.batching===!0||U.isBatchedMesh&&Et.batchingColor===!0&&U.colorTexture===null||U.isBatchedMesh&&Et.batchingColor===!1&&U.colorTexture!==null||U.isInstancedMesh&&Et.instancing===!1||!U.isInstancedMesh&&Et.instancing===!0||U.isSkinnedMesh&&Et.skinning===!1||!U.isSkinnedMesh&&Et.skinning===!0||U.isInstancedMesh&&Et.instancingColor===!0&&U.instanceColor===null||U.isInstancedMesh&&Et.instancingColor===!1&&U.instanceColor!==null||U.isInstancedMesh&&Et.instancingMorph===!0&&U.morphTexture===null||U.isInstancedMesh&&Et.instancingMorph===!1&&U.morphTexture!==null||Et.envMap!==bt||z.fog===!0&&Et.fog!==it||Et.numClippingPlanes!==void 0&&(Et.numClippingPlanes!==nt.numPlanes||Et.numIntersection!==nt.numIntersection)||Et.vertexAlphas!==Tt||Et.vertexTangents!==Ct||Et.morphTargets!==wt||Et.morphNormals!==ne||Et.morphColors!==ce||Et.toneMapping!==me||Et.morphTargetsCount!==Qt)&&(jt=!0):(jt=!0,Et.__version=z.version);let wn=Et.currentProgram;jt===!0&&(wn=zr(z,D,U));let fs=!1,nn=!1,vo=!1,ye=wn.getUniforms(),mi=Et.uniforms;if(Pt.useProgram(wn.program)&&(fs=!0,nn=!0,vo=!0),z.id!==I&&(I=z.id,nn=!0),fs||B!==M){$t.reverseDepthBuffer?(Mt.copy(M.projectionMatrix),Wd(Mt),Xd(Mt),ye.setValue(C,"projectionMatrix",Mt)):ye.setValue(C,"projectionMatrix",M.projectionMatrix),ye.setValue(C,"viewMatrix",M.matrixWorldInverse);let un=ye.map.cameraPosition;un!==void 0&&un.setValue(C,Ot.setFromMatrixPosition(M.matrixWorld)),$t.logarithmicDepthBuffer&&ye.setValue(C,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(z.isMeshPhongMaterial||z.isMeshToonMaterial||z.isMeshLambertMaterial||z.isMeshBasicMaterial||z.isMeshStandardMaterial||z.isShaderMaterial)&&ye.setValue(C,"isOrthographic",M.isOrthographicCamera===!0),B!==M&&(B=M,nn=!0,vo=!0)}if(U.isSkinnedMesh){ye.setOptional(C,U,"bindMatrix"),ye.setOptional(C,U,"bindMatrixInverse");let un=U.skeleton;un&&(un.boneTexture===null&&un.computeBoneTexture(),ye.setValue(C,"boneTexture",un.boneTexture,E))}U.isBatchedMesh&&(ye.setOptional(C,U,"batchingTexture"),ye.setValue(C,"batchingTexture",U._matricesTexture,E),ye.setOptional(C,U,"batchingIdTexture"),ye.setValue(C,"batchingIdTexture",U._indirectTexture,E),ye.setOptional(C,U,"batchingColorTexture"),U._colorsTexture!==null&&ye.setValue(C,"batchingColorTexture",U._colorsTexture,E));let yo=k.morphAttributes;if((yo.position!==void 0||yo.normal!==void 0||yo.color!==void 0)&&Lt.update(U,k,wn),(nn||Et.receiveShadow!==U.receiveShadow)&&(Et.receiveShadow=U.receiveShadow,ye.setValue(C,"receiveShadow",U.receiveShadow)),z.isMeshGouraudMaterial&&z.envMap!==null&&(mi.envMap.value=bt,mi.flipEnvMap.value=bt.isCubeTexture&&bt.isRenderTargetTexture===!1?-1:1),z.isMeshStandardMaterial&&z.envMap===null&&D.environment!==null&&(mi.envMapIntensity.value=D.environmentIntensity),nn&&(ye.setValue(C,"toneMappingExposure",x.toneMappingExposure),Et.needsLights&&Fu(mi,vo),it&&z.fog===!0&&lt.refreshFogUniforms(mi,it),lt.refreshMaterialUniforms(mi,z,tt,H,m.state.transmissionRenderTarget[M.id]),Us.upload(C,Eh(Et),mi,E)),z.isShaderMaterial&&z.uniformsNeedUpdate===!0&&(Us.upload(C,Eh(Et),mi,E),z.uniformsNeedUpdate=!1),z.isSpriteMaterial&&ye.setValue(C,"center",U.center),ye.setValue(C,"modelViewMatrix",U.modelViewMatrix),ye.setValue(C,"normalMatrix",U.normalMatrix),ye.setValue(C,"modelMatrix",U.matrixWorld),z.isShaderMaterial||z.isRawShaderMaterial){let un=z.uniformsGroups;for(let xo=0,Bu=un.length;xo<Bu;xo++){let Ah=un[xo];L.update(Ah,wn),L.bind(Ah,wn)}}return wn}function Fu(M,D){M.ambientLightColor.needsUpdate=D,M.lightProbe.needsUpdate=D,M.directionalLights.needsUpdate=D,M.directionalLightShadows.needsUpdate=D,M.pointLights.needsUpdate=D,M.pointLightShadows.needsUpdate=D,M.spotLights.needsUpdate=D,M.spotLightShadows.needsUpdate=D,M.rectAreaLights.needsUpdate=D,M.hemisphereLights.needsUpdate=D}function ku(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return P},this.getActiveMipmapLevel=function(){return T},this.getRenderTarget=function(){return A},this.setRenderTargetTextures=function(M,D,k){Nt.get(M.texture).__webglTexture=D,Nt.get(M.depthTexture).__webglTexture=k;let z=Nt.get(M);z.__hasExternalTextures=!0,z.__autoAllocateDepthBuffer=k===void 0,z.__autoAllocateDepthBuffer||Gt.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),z.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(M,D){let k=Nt.get(M);k.__webglFramebuffer=D,k.__useDefaultFramebuffer=D===void 0},this.setRenderTarget=function(M,D=0,k=0){A=M,P=D,T=k;let z=!0,U=null,it=!1,dt=!1;if(M){let bt=Nt.get(M);if(bt.__useDefaultFramebuffer!==void 0)Pt.bindFramebuffer(C.FRAMEBUFFER,null),z=!1;else if(bt.__webglFramebuffer===void 0)E.setupRenderTarget(M);else if(bt.__hasExternalTextures)E.rebindTextures(M,Nt.get(M.texture).__webglTexture,Nt.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){let wt=M.depthTexture;if(bt.__boundDepthTexture!==wt){if(wt!==null&&Nt.has(wt)&&(M.width!==wt.image.width||M.height!==wt.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");E.setupDepthRenderbuffer(M)}}let Tt=M.texture;(Tt.isData3DTexture||Tt.isDataArrayTexture||Tt.isCompressedArrayTexture)&&(dt=!0);let Ct=Nt.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(Ct[D])?U=Ct[D][k]:U=Ct[D],it=!0):M.samples>0&&E.useMultisampledRTT(M)===!1?U=Nt.get(M).__webglMultisampledFramebuffer:Array.isArray(Ct)?U=Ct[k]:U=Ct,v.copy(M.viewport),b.copy(M.scissor),F=M.scissorTest}else v.copy(ft).multiplyScalar(tt).floor(),b.copy(rt).multiplyScalar(tt).floor(),F=Dt;if(Pt.bindFramebuffer(C.FRAMEBUFFER,U)&&z&&Pt.drawBuffers(M,U),Pt.viewport(v),Pt.scissor(b),Pt.setScissorTest(F),it){let bt=Nt.get(M.texture);C.framebufferTexture2D(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0,C.TEXTURE_CUBE_MAP_POSITIVE_X+D,bt.__webglTexture,k)}else if(dt){let bt=Nt.get(M.texture),Tt=D||0;C.framebufferTextureLayer(C.FRAMEBUFFER,C.COLOR_ATTACHMENT0,bt.__webglTexture,k||0,Tt)}I=-1},this.readRenderTargetPixels=function(M,D,k,z,U,it,dt){if(!(M&&M.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let xt=Nt.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&dt!==void 0&&(xt=xt[dt]),xt){Pt.bindFramebuffer(C.FRAMEBUFFER,xt);try{let bt=M.texture,Tt=bt.format,Ct=bt.type;if(!$t.textureFormatReadable(Tt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!$t.textureTypeReadable(Ct)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}D>=0&&D<=M.width-z&&k>=0&&k<=M.height-U&&C.readPixels(D,k,z,U,Ft.convert(Tt),Ft.convert(Ct),it)}finally{let bt=A!==null?Nt.get(A).__webglFramebuffer:null;Pt.bindFramebuffer(C.FRAMEBUFFER,bt)}}},this.readRenderTargetPixelsAsync=async function(M,D,k,z,U,it,dt){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let xt=Nt.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&dt!==void 0&&(xt=xt[dt]),xt){let bt=M.texture,Tt=bt.format,Ct=bt.type;if(!$t.textureFormatReadable(Tt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!$t.textureTypeReadable(Ct))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(D>=0&&D<=M.width-z&&k>=0&&k<=M.height-U){Pt.bindFramebuffer(C.FRAMEBUFFER,xt);let wt=C.createBuffer();C.bindBuffer(C.PIXEL_PACK_BUFFER,wt),C.bufferData(C.PIXEL_PACK_BUFFER,it.byteLength,C.STREAM_READ),C.readPixels(D,k,z,U,Ft.convert(Tt),Ft.convert(Ct),0);let ne=A!==null?Nt.get(A).__webglFramebuffer:null;Pt.bindFramebuffer(C.FRAMEBUFFER,ne);let ce=C.fenceSync(C.SYNC_GPU_COMMANDS_COMPLETE,0);return C.flush(),await Gd(C,ce,4),C.bindBuffer(C.PIXEL_PACK_BUFFER,wt),C.getBufferSubData(C.PIXEL_PACK_BUFFER,0,it),C.deleteBuffer(wt),C.deleteSync(ce),it}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(M,D=null,k=0){M.isTexture!==!0&&(ya("WebGLRenderer: copyFramebufferToTexture function signature has changed."),D=arguments[0]||null,M=arguments[1]);let z=Math.pow(2,-k),U=Math.floor(M.image.width*z),it=Math.floor(M.image.height*z),dt=D!==null?D.x:0,xt=D!==null?D.y:0;E.setTexture2D(M,0),C.copyTexSubImage2D(C.TEXTURE_2D,k,0,0,dt,xt,U,it),Pt.unbindTexture()},this.copyTextureToTexture=function(M,D,k=null,z=null,U=0){M.isTexture!==!0&&(ya("WebGLRenderer: copyTextureToTexture function signature has changed."),z=arguments[0]||null,M=arguments[1],D=arguments[2],U=arguments[3]||0,k=null);let it,dt,xt,bt,Tt,Ct;k!==null?(it=k.max.x-k.min.x,dt=k.max.y-k.min.y,xt=k.min.x,bt=k.min.y):(it=M.image.width,dt=M.image.height,xt=0,bt=0),z!==null?(Tt=z.x,Ct=z.y):(Tt=0,Ct=0);let wt=Ft.convert(D.format),ne=Ft.convert(D.type);E.setTexture2D(D,0),C.pixelStorei(C.UNPACK_FLIP_Y_WEBGL,D.flipY),C.pixelStorei(C.UNPACK_PREMULTIPLY_ALPHA_WEBGL,D.premultiplyAlpha),C.pixelStorei(C.UNPACK_ALIGNMENT,D.unpackAlignment);let ce=C.getParameter(C.UNPACK_ROW_LENGTH),me=C.getParameter(C.UNPACK_IMAGE_HEIGHT),en=C.getParameter(C.UNPACK_SKIP_PIXELS),Qt=C.getParameter(C.UNPACK_SKIP_ROWS),Et=C.getParameter(C.UNPACK_SKIP_IMAGES),De=M.isCompressedTexture?M.mipmaps[U]:M.image;C.pixelStorei(C.UNPACK_ROW_LENGTH,De.width),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,De.height),C.pixelStorei(C.UNPACK_SKIP_PIXELS,xt),C.pixelStorei(C.UNPACK_SKIP_ROWS,bt),M.isDataTexture?C.texSubImage2D(C.TEXTURE_2D,U,Tt,Ct,it,dt,wt,ne,De.data):M.isCompressedTexture?C.compressedTexSubImage2D(C.TEXTURE_2D,U,Tt,Ct,De.width,De.height,wt,De.data):C.texSubImage2D(C.TEXTURE_2D,U,Tt,Ct,it,dt,wt,ne,De),C.pixelStorei(C.UNPACK_ROW_LENGTH,ce),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,me),C.pixelStorei(C.UNPACK_SKIP_PIXELS,en),C.pixelStorei(C.UNPACK_SKIP_ROWS,Qt),C.pixelStorei(C.UNPACK_SKIP_IMAGES,Et),U===0&&D.generateMipmaps&&C.generateMipmap(C.TEXTURE_2D),Pt.unbindTexture()},this.copyTextureToTexture3D=function(M,D,k=null,z=null,U=0){M.isTexture!==!0&&(ya("WebGLRenderer: copyTextureToTexture3D function signature has changed."),k=arguments[0]||null,z=arguments[1]||null,M=arguments[2],D=arguments[3],U=arguments[4]||0);let it,dt,xt,bt,Tt,Ct,wt,ne,ce,me=M.isCompressedTexture?M.mipmaps[U]:M.image;k!==null?(it=k.max.x-k.min.x,dt=k.max.y-k.min.y,xt=k.max.z-k.min.z,bt=k.min.x,Tt=k.min.y,Ct=k.min.z):(it=me.width,dt=me.height,xt=me.depth,bt=0,Tt=0,Ct=0),z!==null?(wt=z.x,ne=z.y,ce=z.z):(wt=0,ne=0,ce=0);let en=Ft.convert(D.format),Qt=Ft.convert(D.type),Et;if(D.isData3DTexture)E.setTexture3D(D,0),Et=C.TEXTURE_3D;else if(D.isDataArrayTexture||D.isCompressedArrayTexture)E.setTexture2DArray(D,0),Et=C.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}C.pixelStorei(C.UNPACK_FLIP_Y_WEBGL,D.flipY),C.pixelStorei(C.UNPACK_PREMULTIPLY_ALPHA_WEBGL,D.premultiplyAlpha),C.pixelStorei(C.UNPACK_ALIGNMENT,D.unpackAlignment);let De=C.getParameter(C.UNPACK_ROW_LENGTH),jt=C.getParameter(C.UNPACK_IMAGE_HEIGHT),wn=C.getParameter(C.UNPACK_SKIP_PIXELS),fs=C.getParameter(C.UNPACK_SKIP_ROWS),nn=C.getParameter(C.UNPACK_SKIP_IMAGES);C.pixelStorei(C.UNPACK_ROW_LENGTH,me.width),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,me.height),C.pixelStorei(C.UNPACK_SKIP_PIXELS,bt),C.pixelStorei(C.UNPACK_SKIP_ROWS,Tt),C.pixelStorei(C.UNPACK_SKIP_IMAGES,Ct),M.isDataTexture||M.isData3DTexture?C.texSubImage3D(Et,U,wt,ne,ce,it,dt,xt,en,Qt,me.data):D.isCompressedArrayTexture?C.compressedTexSubImage3D(Et,U,wt,ne,ce,it,dt,xt,en,me.data):C.texSubImage3D(Et,U,wt,ne,ce,it,dt,xt,en,Qt,me),C.pixelStorei(C.UNPACK_ROW_LENGTH,De),C.pixelStorei(C.UNPACK_IMAGE_HEIGHT,jt),C.pixelStorei(C.UNPACK_SKIP_PIXELS,wn),C.pixelStorei(C.UNPACK_SKIP_ROWS,fs),C.pixelStorei(C.UNPACK_SKIP_IMAGES,nn),U===0&&D.generateMipmaps&&C.generateMipmap(Et),Pt.unbindTexture()},this.initRenderTarget=function(M){Nt.get(M).__webglFramebuffer===void 0&&E.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?E.setTextureCube(M,0):M.isData3DTexture?E.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?E.setTexture2DArray(M,0):E.setTexture2D(M,0),Pt.unbindTexture()},this.resetState=function(){P=0,T=0,A=null,Pt.reset(),ae.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return si}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=t===Oc?"display-p3":"srgb",e.unpackColorSpace=te.workingColorSpace===to?"display-p3":"srgb"}};var Oa=class extends _e{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new In,this.environmentIntensity=1,this.environmentRotation=new In,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}},ic=class{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=zl,this.updateRanges=[],this.version=0,this.uuid=ri()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,i){t*=this.stride,i*=e.stride;for(let s=0,r=this.stride;s<r;s++)this.array[t+s]=e.array[i+s];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=ri()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(e,this.stride);return i.setUsage(this.usage),i}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){return t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=ri()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}},Be=new R,Fa=class n{constructor(t,e,i,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=i,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,i=this.data.count;e<i;e++)Be.fromBufferAttribute(this,e),Be.applyMatrix4(t),this.setXYZ(e,Be.x,Be.y,Be.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)Be.fromBufferAttribute(this,e),Be.applyNormalMatrix(t),this.setXYZ(e,Be.x,Be.y,Be.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)Be.fromBufferAttribute(this,e),Be.transformDirection(t),this.setXYZ(e,Be.x,Be.y,Be.z);return this}getComponent(t,e){let i=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(i=Cn(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=ie(i,this.array)),this.data.array[t*this.data.stride+this.offset+e]=i,this}setX(t,e){return this.normalized&&(e=ie(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=ie(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=ie(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=ie(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=Cn(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=Cn(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=Cn(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=Cn(e,this.array)),e}setXY(t,e,i){return t=t*this.data.stride+this.offset,this.normalized&&(e=ie(e,this.array),i=ie(i,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this}setXYZ(t,e,i,s){return t=t*this.data.stride+this.offset,this.normalized&&(e=ie(e,this.array),i=ie(i,this.array),s=ie(s,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this.data.array[t+2]=s,this}setXYZW(t,e,i,s,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=ie(e,this.array),i=ie(i,this.array),s=ie(s,this.array),r=ie(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=i,this.data.array[t+2]=s,this.data.array[t+3]=r,this}clone(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let i=0;i<this.count;i++){let s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return new Ee(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new n(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let i=0;i<this.count;i++){let s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},hi=class extends ci{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new At(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},Ts,ar=new R,As=new R,Rs=new R,Cs=new ct,or=new ct,nu=new re,la=new R,lr=new R,ca=new R,wf=new ct,Jo=new ct,Ef=new ct,Ci=class extends _e{constructor(t=new hi){if(super(),this.isSprite=!0,this.type="Sprite",Ts===void 0){Ts=new Ge;let e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new ic(e,5);Ts.setIndex([0,1,2,0,2,3]),Ts.setAttribute("position",new Fa(i,3,0,!1)),Ts.setAttribute("uv",new Fa(i,2,3,!1))}this.geometry=Ts,this.material=t,this.center=new ct(.5,.5)}raycast(t,e){t.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),As.setFromMatrixScale(this.matrixWorld),nu.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),Rs.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&As.multiplyScalar(-Rs.z);let i=this.material.rotation,s,r;i!==0&&(r=Math.cos(i),s=Math.sin(i));let a=this.center;ha(la.set(-.5,-.5,0),Rs,a,As,s,r),ha(lr.set(.5,-.5,0),Rs,a,As,s,r),ha(ca.set(.5,.5,0),Rs,a,As,s,r),wf.set(0,0),Jo.set(1,0),Ef.set(1,1);let o=t.ray.intersectTriangle(la,lr,ca,!1,ar);if(o===null&&(ha(lr.set(-.5,.5,0),Rs,a,As,s,r),Jo.set(0,1),o=t.ray.intersectTriangle(la,ca,lr,!1,ar),o===null))return;let l=t.ray.origin.distanceTo(ar);l<t.near||l>t.far||e.push({distance:l,point:ar.clone(),uv:Si.getInterpolation(ar,la,lr,ca,wf,Jo,Ef,new ct),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}};function ha(n,t,e,i,s,r){Cs.subVectors(n,e).addScalar(.5).multiply(i),s!==void 0?(or.x=r*Cs.x-s*Cs.y,or.y=s*Cs.x+r*Cs.y):or.copy(Cs),n.copy(t),n.x+=or.x,n.y+=or.y,n.applyMatrix4(nu)}var sc=class extends Ve{constructor(t=null,e=1,i=1,s,r,a,o,l,c=Je,h=Je,f,u){super(null,a,o,l,c,h,s,r,f,u),this.isDataTexture=!0,this.image={data:t,width:e,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Vs=class extends Ee{constructor(t,e,i,s=1){super(t,e,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},Ps=new re,Tf=new re,fa=[],Af=new li,z_=new re,cr=new kt,hr=new Ji,Gn=class extends kt{constructor(t,e,i){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Vs(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<i;s++)this.setMatrixAt(s,z_)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new li),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,Ps),Af.copy(t.boundingBox).applyMatrix4(Ps),this.boundingBox.union(Af)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Ji),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,Ps),hr.copy(t.boundingSphere).applyMatrix4(Ps),this.boundingSphere.union(hr)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let i=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=i.length+1,a=t*r+1;for(let o=0;o<i.length;o++)i[o]=s[a+o]}raycast(t,e){let i=this.matrixWorld,s=this.count;if(cr.geometry=this.geometry,cr.material=this.material,cr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),hr.copy(this.boundingSphere),hr.applyMatrix4(i),t.ray.intersectsSphere(hr)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Ps),Tf.multiplyMatrices(i,Ps),cr.matrixWorld=Tf,cr.raycast(t,fa);for(let a=0,o=fa.length;a<o;a++){let l=fa[a];l.instanceId=r,l.object=this,e.push(l)}fa.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new Vs(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){let i=e.morphTargetInfluences,s=i.length+1;this.morphTexture===null&&(this.morphTexture=new sc(new Float32Array(s*this.count),s,this.count,Ic,zn));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<i.length;c++)a+=i[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=s*t;r[l]=o,r.set(i,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}};var on=class extends Ve{constructor(t,e,i,s,r,a,o,l,c){super(t,e,i,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}},gn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(t,e){let i=this.getUtoTmapping(t);return this.getPoint(i,e)}getPoints(t=5){let e=[];for(let i=0;i<=t;i++)e.push(this.getPoint(i/t));return e}getSpacedPoints(t=5){let e=[];for(let i=0;i<=t;i++)e.push(this.getPointAt(i/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],i,s=this.getPoint(0),r=0;e.push(0);for(let a=1;a<=t;a++)i=this.getPoint(a/t),r+=i.distanceTo(s),e.push(r),s=i;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e){let i=this.getLengths(),s=0,r=i.length,a;e?a=e:a=t*i[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=i[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,i[s]===a)return s/(r-1);let h=i[s],u=i[s+1]-h,d=(a-h)/u;return(s+d)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),l=e||(a.isVector2?new ct:new R);return l.copy(o).sub(a).normalize(),l}getTangentAt(t,e){let i=this.getUtoTmapping(t);return this.getTangent(i,e)}computeFrenetFrames(t,e){let i=new R,s=[],r=[],a=[],o=new R,l=new re;for(let d=0;d<=t;d++){let g=d/t;s[d]=this.getTangentAt(g,new R)}r[0]=new R,a[0]=new R;let c=Number.MAX_VALUE,h=Math.abs(s[0].x),f=Math.abs(s[0].y),u=Math.abs(s[0].z);h<=c&&(c=h,i.set(1,0,0)),f<=c&&(c=f,i.set(0,1,0)),u<=c&&i.set(0,0,1),o.crossVectors(s[0],i).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let d=1;d<=t;d++){if(r[d]=r[d-1].clone(),a[d]=a[d-1].clone(),o.crossVectors(s[d-1],s[d]),o.length()>Number.EPSILON){o.normalize();let g=Math.acos(Pe(s[d-1].dot(s[d]),-1,1));r[d].applyMatrix4(l.makeRotationAxis(o,g))}a[d].crossVectors(s[d],r[d])}if(e===!0){let d=Math.acos(Pe(r[0].dot(r[t]),-1,1));d/=t,s[0].dot(o.crossVectors(r[0],r[t]))>0&&(d=-d);for(let g=1;g<=t;g++)r[g].applyMatrix4(l.makeRotationAxis(s[g],d*g)),a[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},br=class extends gn{constructor(t=0,e=0,i=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=i,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(t,e=new ct){let i=e,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+t*r,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),f=Math.sin(this.aRotation),u=l-this.aX,d=c-this.aY;l=u*h-d*f+this.aX,c=u*f+d*h+this.aY}return i.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},rc=class extends br{constructor(t,e,i,s,r,a){super(t,e,i,i,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function Bc(){let n=0,t=0,e=0,i=0;function s(r,a,o,l){n=r,t=o,e=-3*r+3*a-2*o-l,i=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,h,f){let u=(a-r)/c-(o-r)/(c+h)+(o-a)/h,d=(o-a)/h-(l-a)/(h+f)+(l-o)/f;u*=h,d*=h,s(a,o,u,d)},calc:function(r){let a=r*r,o=a*r;return n+t*r+e*a+i*o}}}var ua=new R,Ko=new Bc,Qo=new Bc,jo=new Bc,Ki=class extends gn{constructor(t=[],e=!1,i="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=i,this.tension=s}getPoint(t,e=new R){let i=e,s=this.points,r=s.length,a=(r-(this.closed?0:1))*t,o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,h;this.closed||o>0?c=s[(o-1)%r]:(ua.subVectors(s[0],s[1]).add(s[0]),c=ua);let f=s[o%r],u=s[(o+1)%r];if(this.closed||o+2<r?h=s[(o+2)%r]:(ua.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=ua),this.curveType==="centripetal"||this.curveType==="chordal"){let d=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(f),d),_=Math.pow(f.distanceToSquared(u),d),m=Math.pow(u.distanceToSquared(h),d);_<1e-4&&(_=1),g<1e-4&&(g=_),m<1e-4&&(m=_),Ko.initNonuniformCatmullRom(c.x,f.x,u.x,h.x,g,_,m),Qo.initNonuniformCatmullRom(c.y,f.y,u.y,h.y,g,_,m),jo.initNonuniformCatmullRom(c.z,f.z,u.z,h.z,g,_,m)}else this.curveType==="catmullrom"&&(Ko.initCatmullRom(c.x,f.x,u.x,h.x,this.tension),Qo.initCatmullRom(c.y,f.y,u.y,h.y,this.tension),jo.initCatmullRom(c.z,f.z,u.z,h.z,this.tension));return i.set(Ko.calc(l),Qo.calc(l),jo.calc(l)),i}copy(t){super.copy(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,i=this.points.length;e<i;e++){let s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let s=t.points[e];this.points.push(new R().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function Rf(n,t,e,i,s){let r=(i-t)*.5,a=(s-e)*.5,o=n*n,l=n*o;return(2*e-2*i+r+a)*l+(-3*e+3*i-2*r-a)*o+r*n+e}function H_(n,t){let e=1-n;return e*e*t}function V_(n,t){return 2*(1-n)*n*t}function G_(n,t){return n*n*t}function mr(n,t,e,i){return H_(n,t)+V_(n,e)+G_(n,i)}function W_(n,t){let e=1-n;return e*e*e*t}function X_(n,t){let e=1-n;return 3*e*e*n*t}function q_(n,t){return 3*(1-n)*n*n*t}function Y_(n,t){return n*n*n*t}function gr(n,t,e,i,s){return W_(n,t)+X_(n,e)+q_(n,i)+Y_(n,s)}var ka=class extends gn{constructor(t=new ct,e=new ct,i=new ct,s=new ct){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=i,this.v3=s}getPoint(t,e=new ct){let i=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return i.set(gr(t,s.x,r.x,a.x,o.x),gr(t,s.y,r.y,a.y,o.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},ac=class extends gn{constructor(t=new R,e=new R,i=new R,s=new R){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=i,this.v3=s}getPoint(t,e=new R){let i=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return i.set(gr(t,s.x,r.x,a.x,o.x),gr(t,s.y,r.y,a.y,o.y),gr(t,s.z,r.z,a.z,o.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Ba=class extends gn{constructor(t=new ct,e=new ct){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new ct){let i=e;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new ct){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},oc=class extends gn{constructor(t=new R,e=new R){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new R){let i=e;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new R){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},za=class extends gn{constructor(t=new ct,e=new ct,i=new ct){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=i}getPoint(t,e=new ct){let i=e,s=this.v0,r=this.v1,a=this.v2;return i.set(mr(t,s.x,r.x,a.x),mr(t,s.y,r.y,a.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Ha=class extends gn{constructor(t=new R,e=new R,i=new R){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=i}getPoint(t,e=new R){let i=e,s=this.v0,r=this.v1,a=this.v2;return i.set(mr(t,s.x,r.x,a.x),mr(t,s.y,r.y,a.y),mr(t,s.z,r.z,a.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Va=class extends gn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new ct){let i=e,s=this.points,r=(s.length-1)*t,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],h=s[a>s.length-2?s.length-1:a+1],f=s[a>s.length-3?s.length-1:a+2];return i.set(Rf(o,l.x,c.x,h.x,f.x),Rf(o,l.y,c.y,h.y,f.y)),i}copy(t){super.copy(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let s=t.points[e];this.points.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,i=this.points.length;e<i;e++){let s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let s=t.points[e];this.points.push(new ct().fromArray(s))}return this}},lc=Object.freeze({__proto__:null,ArcCurve:rc,CatmullRomCurve3:Ki,CubicBezierCurve:ka,CubicBezierCurve3:ac,EllipseCurve:br,LineCurve:Ba,LineCurve3:oc,QuadraticBezierCurve:za,QuadraticBezierCurve3:Ha,SplineCurve:Va}),cc=class extends gn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let i=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new lc[i](e,t))}return this}getPoint(t,e){let i=t*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=i){let a=s[r]-i,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let i=0,s=this.curves.length;i<s;i++)e+=this.curves[i].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let i=0;i<=t;i++)e.push(this.getPoint(i/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],i;for(let s=0,r=this.curves;s<r.length;s++){let a=r[s],o=a.isEllipseCurve?t*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?t*a.points.length:t,l=a.getPoints(o);for(let c=0;c<l.length;c++){let h=l[c];i&&i.equals(h)||(e.push(h),i=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,i=t.curves.length;e<i;e++){let s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,i=this.curves.length;e<i;e++){let s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,i=t.curves.length;e<i;e++){let s=t.curves[e];this.curves.push(new lc[s.type]().fromJSON(s))}return this}},hc=class extends cc{constructor(t){super(),this.type="Path",this.currentPoint=new ct,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,i=t.length;e<i;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let i=new Ba(this.currentPoint.clone(),new ct(t,e));return this.curves.push(i),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,i,s){let r=new za(this.currentPoint.clone(),new ct(t,e),new ct(i,s));return this.curves.push(r),this.currentPoint.set(i,s),this}bezierCurveTo(t,e,i,s,r,a){let o=new ka(this.currentPoint.clone(),new ct(t,e),new ct(i,s),new ct(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),i=new Va(e);return this.curves.push(i),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,i,s,r,a){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+o,e+l,i,s,r,a),this}absarc(t,e,i,s,r,a){return this.absellipse(t,e,i,i,s,r,a),this}ellipse(t,e,i,s,r,a,o,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+c,e+h,i,s,r,a,o,l),this}absellipse(t,e,i,s,r,a,o,l){let c=new br(t,e,i,s,r,a,o,l);if(this.curves.length>0){let f=c.getPoint(0);f.equals(this.currentPoint)||this.lineTo(f.x,f.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}},fc=class n extends Ge{constructor(t=[new ct(0,-.5),new ct(.5,0),new ct(0,.5)],e=12,i=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:i,phiLength:s},e=Math.floor(e),s=Pe(s,0,Math.PI*2);let r=[],a=[],o=[],l=[],c=[],h=1/e,f=new R,u=new ct,d=new R,g=new R,_=new R,m=0,p=0;for(let w=0;w<=t.length-1;w++)switch(w){case 0:m=t[w+1].x-t[w].x,p=t[w+1].y-t[w].y,d.x=p*1,d.y=-m,d.z=p*0,_.copy(d),d.normalize(),l.push(d.x,d.y,d.z);break;case t.length-1:l.push(_.x,_.y,_.z);break;default:m=t[w+1].x-t[w].x,p=t[w+1].y-t[w].y,d.x=p*1,d.y=-m,d.z=p*0,g.copy(d),d.x+=_.x,d.y+=_.y,d.z+=_.z,d.normalize(),l.push(d.x,d.y,d.z),_.copy(g)}for(let w=0;w<=e;w++){let x=i+w*h*s,S=Math.sin(x),P=Math.cos(x);for(let T=0;T<=t.length-1;T++){f.x=t[T].x*S,f.y=t[T].y,f.z=t[T].x*P,a.push(f.x,f.y,f.z),u.x=w/e,u.y=T/(t.length-1),o.push(u.x,u.y);let A=l[3*T+0]*S,I=l[3*T+1],B=l[3*T+0]*P;c.push(A,I,B)}}for(let w=0;w<e;w++)for(let x=0;x<t.length-1;x++){let S=x+w*t.length,P=S,T=S+t.length,A=S+t.length+1,I=S+1;r.push(P,T,I),r.push(A,I,T)}this.setIndex(r),this.setAttribute("position",new ee(a,3)),this.setAttribute("uv",new ee(o,2)),this.setAttribute("normal",new ee(c,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.points,t.segments,t.phiStart,t.phiLength)}},Ga=class n extends fc{constructor(t=1,e=1,i=4,s=8){let r=new hc;r.absarc(0,-e/2,t,Math.PI*1.5,0),r.absarc(0,e/2,t,0,Math.PI*.5),super(r.getPoints(i),s),this.type="CapsuleGeometry",this.parameters={radius:t,length:e,capSegments:i,radialSegments:s}}static fromJSON(t){return new n(t.radius,t.length,t.capSegments,t.radialSegments)}},Qi=class n extends Ge{constructor(t=1,e=32,i=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:i,thetaLength:s},e=Math.max(3,e);let r=[],a=[],o=[],l=[],c=new R,h=new ct;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let f=0,u=3;f<=e;f++,u+=3){let d=i+f/e*s;c.x=t*Math.cos(d),c.y=t*Math.sin(d),a.push(c.x,c.y,c.z),o.push(0,0,1),h.x=(a[u]/t+1)/2,h.y=(a[u+1]/t+1)/2,l.push(h.x,h.y)}for(let f=1;f<=e;f++)r.push(f,f+1,0);this.setIndex(r),this.setAttribute("position",new ee(a,3)),this.setAttribute("normal",new ee(o,3)),this.setAttribute("uv",new ee(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.radius,t.segments,t.thetaStart,t.thetaLength)}},ji=class n extends Ge{constructor(t=1,e=1,i=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:i,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],f=[],u=[],d=[],g=0,_=[],m=i/2,p=0;w(),a===!1&&(t>0&&x(!0),e>0&&x(!1)),this.setIndex(h),this.setAttribute("position",new ee(f,3)),this.setAttribute("normal",new ee(u,3)),this.setAttribute("uv",new ee(d,2));function w(){let S=new R,P=new R,T=0,A=(e-t)/i;for(let I=0;I<=r;I++){let B=[],v=I/r,b=v*(e-t)+t;for(let F=0;F<=s;F++){let N=F/s,V=N*l+o,Y=Math.sin(V),H=Math.cos(V);P.x=b*Y,P.y=-v*i+m,P.z=b*H,f.push(P.x,P.y,P.z),S.set(Y,A,H).normalize(),u.push(S.x,S.y,S.z),d.push(N,1-v),B.push(g++)}_.push(B)}for(let I=0;I<s;I++)for(let B=0;B<r;B++){let v=_[B][I],b=_[B+1][I],F=_[B+1][I+1],N=_[B][I+1];t>0&&(h.push(v,b,N),T+=3),e>0&&(h.push(b,F,N),T+=3)}c.addGroup(p,T,0),p+=T}function x(S){let P=g,T=new ct,A=new R,I=0,B=S===!0?t:e,v=S===!0?1:-1;for(let F=1;F<=s;F++)f.push(0,m*v,0),u.push(0,v,0),d.push(.5,.5),g++;let b=g;for(let F=0;F<=s;F++){let V=F/s*l+o,Y=Math.cos(V),H=Math.sin(V);A.x=B*H,A.y=m*v,A.z=B*Y,f.push(A.x,A.y,A.z),u.push(0,v,0),T.x=Y*.5+.5,T.y=H*.5*v+.5,d.push(T.x,T.y),g++}for(let F=0;F<s;F++){let N=P+F,V=b+F;S===!0?h.push(V,V+1,N):h.push(V+1,V,N),I+=3}c.addGroup(p,I,S===!0?1:2),p+=I}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Wa=class n extends ji{constructor(t=1,e=1,i=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,t,e,i,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(t){return new n(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}};var ts=class n extends Ge{constructor(t=.5,e=1,i=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:i,phiSegments:s,thetaStart:r,thetaLength:a},i=Math.max(3,i),s=Math.max(1,s);let o=[],l=[],c=[],h=[],f=t,u=(e-t)/s,d=new R,g=new ct;for(let _=0;_<=s;_++){for(let m=0;m<=i;m++){let p=r+m/i*a;d.x=f*Math.cos(p),d.y=f*Math.sin(p),l.push(d.x,d.y,d.z),c.push(0,0,1),g.x=(d.x/e+1)/2,g.y=(d.y/e+1)/2,h.push(g.x,g.y)}f+=u}for(let _=0;_<s;_++){let m=_*(i+1);for(let p=0;p<i;p++){let w=p+m,x=w,S=w+i+1,P=w+i+2,T=w+1;o.push(x,S,T),o.push(S,P,T)}}this.setIndex(o),this.setAttribute("position",new ee(l,3)),this.setAttribute("normal",new ee(c,3)),this.setAttribute("uv",new ee(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}};var Gs=class n extends Ge{constructor(t=1,e=32,i=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:i,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),i=Math.max(2,Math.floor(i));let l=Math.min(a+o,Math.PI),c=0,h=[],f=new R,u=new R,d=[],g=[],_=[],m=[];for(let p=0;p<=i;p++){let w=[],x=p/i,S=0;p===0&&a===0?S=.5/e:p===i&&l===Math.PI&&(S=-.5/e);for(let P=0;P<=e;P++){let T=P/e;f.x=-t*Math.cos(s+T*r)*Math.sin(a+x*o),f.y=t*Math.cos(a+x*o),f.z=t*Math.sin(s+T*r)*Math.sin(a+x*o),g.push(f.x,f.y,f.z),u.copy(f).normalize(),_.push(u.x,u.y,u.z),m.push(T+S,1-x),w.push(c++)}h.push(w)}for(let p=0;p<i;p++)for(let w=0;w<e;w++){let x=h[p][w+1],S=h[p][w],P=h[p+1][w],T=h[p+1][w+1];(p!==0||a>0)&&d.push(x,S,T),(p!==i-1||l<Math.PI)&&d.push(S,P,T)}this.setIndex(d),this.setAttribute("position",new ee(g,3)),this.setAttribute("normal",new ee(_,3)),this.setAttribute("uv",new ee(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var Xa=class n extends Ge{constructor(t=1,e=.4,i=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:i,tubularSegments:s,arc:r},i=Math.floor(i),s=Math.floor(s);let a=[],o=[],l=[],c=[],h=new R,f=new R,u=new R;for(let d=0;d<=i;d++)for(let g=0;g<=s;g++){let _=g/s*r,m=d/i*Math.PI*2;f.x=(t+e*Math.cos(m))*Math.cos(_),f.y=(t+e*Math.cos(m))*Math.sin(_),f.z=e*Math.sin(m),o.push(f.x,f.y,f.z),h.x=t*Math.cos(_),h.y=t*Math.sin(_),u.subVectors(f,h).normalize(),l.push(u.x,u.y,u.z),c.push(g/s),c.push(d/i)}for(let d=1;d<=i;d++)for(let g=1;g<=s;g++){let _=(s+1)*d+g-1,m=(s+1)*(d-1)+g-1,p=(s+1)*(d-1)+g,w=(s+1)*d+g;a.push(_,m,w),a.push(m,p,w)}this.setIndex(a),this.setAttribute("position",new ee(o,3)),this.setAttribute("normal",new ee(l,3)),this.setAttribute("uv",new ee(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}};var Sr=class n extends Ge{constructor(t=new Ha(new R(-1,-1,0),new R(-1,1,0),new R(1,1,0)),e=64,i=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:t,tubularSegments:e,radius:i,radialSegments:s,closed:r};let a=t.computeFrenetFrames(e,r);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new R,l=new R,c=new ct,h=new R,f=[],u=[],d=[],g=[];_(),this.setIndex(g),this.setAttribute("position",new ee(f,3)),this.setAttribute("normal",new ee(u,3)),this.setAttribute("uv",new ee(d,2));function _(){for(let x=0;x<e;x++)m(x);m(r===!1?e:0),w(),p()}function m(x){h=t.getPointAt(x/e,h);let S=a.normals[x],P=a.binormals[x];for(let T=0;T<=s;T++){let A=T/s*Math.PI*2,I=Math.sin(A),B=-Math.cos(A);l.x=B*S.x+I*P.x,l.y=B*S.y+I*P.y,l.z=B*S.z+I*P.z,l.normalize(),u.push(l.x,l.y,l.z),o.x=h.x+i*l.x,o.y=h.y+i*l.y,o.z=h.z+i*l.z,f.push(o.x,o.y,o.z)}}function p(){for(let x=1;x<=e;x++)for(let S=1;S<=s;S++){let P=(s+1)*(x-1)+(S-1),T=(s+1)*x+(S-1),A=(s+1)*x+S,I=(s+1)*(x-1)+S;g.push(P,T,I),g.push(T,A,I)}}function w(){for(let x=0;x<=e;x++)for(let S=0;S<=s;S++)c.x=x/e,c.y=S/s,d.push(c.x,c.y)}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON();return t.path=this.parameters.path.toJSON(),t}static fromJSON(t){return new n(new lc[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}};var qa=class extends ci{constructor(t){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new At(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new At(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Nc,this.normalScale=new ct(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new In,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};var Xe=class extends ci{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new At(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new At(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Nc,this.normalScale=new ct(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new In,this.combine=Ac,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};function da(n,t,e){return!n||!e&&n.constructor===t?n:typeof t.BYTES_PER_ELEMENT=="number"?new t(n):Array.prototype.slice.call(n)}function Z_(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}var Ws=class{constructor(t,e,i,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(i),this.sampleValues=e,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,i=this._cachedIndex,s=e[i],r=e[i-1];n:{t:{let a;e:{i:if(!(t<s)){for(let o=i+2;;){if(s===void 0){if(t<r)break i;return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===o)break;if(r=s,s=e[++i],t<s)break t}a=e.length;break e}if(!(t>=r)){let o=e[1];t<o&&(i=2,r=o);for(let l=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(s=r,r=e[--i-1],t>=r)break t}a=i,i=0;break e}break n}for(;i<a;){let o=i+a>>>1;t<e[o]?a=o:i=o+1}if(s=e[i],r=e[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,s)}return this.interpolate_(i,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=t*s;for(let a=0;a!==s;++a)e[a]=i[r+a];return e}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},uc=class extends Ws{constructor(t,e,i,s){super(t,e,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ih,endingEnd:Ih}}intervalChanged_(t,e,i){let s=this.parameterPositions,r=t-2,a=t+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case Lh:r=t,o=2*e-i;break;case Dh:r=s.length-2,o=e+s[r]-s[r+1];break;default:r=t,o=i}if(l===void 0)switch(this.getSettings_().endingEnd){case Lh:a=t,l=2*i-e;break;case Dh:a=1,l=i+s[1]-s[0];break;default:a=t-1,l=e}let c=(i-e)*.5,h=this.valueSize;this._weightPrev=c/(e-o),this._weightNext=c/(l-i),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(t,e,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=this._offsetPrev,f=this._offsetNext,u=this._weightPrev,d=this._weightNext,g=(i-e)/(s-e),_=g*g,m=_*g,p=-u*m+2*u*_-u*g,w=(1+u)*m+(-1.5-2*u)*_+(-.5+u)*g+1,x=(-1-d)*m+(1.5+d)*_+.5*g,S=d*m-d*_;for(let P=0;P!==o;++P)r[P]=p*a[h+P]+w*a[c+P]+x*a[l+P]+S*a[f+P];return r}},dc=class extends Ws{constructor(t,e,i,s){super(t,e,i,s)}interpolate_(t,e,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=(i-e)/(s-e),f=1-h;for(let u=0;u!==o;++u)r[u]=a[c+u]*f+a[l+u]*h;return r}},pc=class extends Ws{constructor(t,e,i,s){super(t,e,i,s)}interpolate_(t){return this.copySampleValue_(t-1)}},Ln=class{constructor(t,e,i,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=da(e,this.TimeBufferType),this.values=da(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,i;if(e.toJSON!==this.toJSON)i=e.toJSON(t);else{i={name:t.name,times:da(t.times,Array),values:da(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(i.interpolation=s)}return i.type=t.ValueTypeName,i}InterpolantFactoryMethodDiscrete(t){return new pc(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new dc(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new uc(this.times,this.values,this.getValueSize(),t)}setInterpolation(t){let e;switch(t){case xa:e=this.InterpolantFactoryMethodDiscrete;break;case Bl:e=this.InterpolantFactoryMethodLinear;break;case bo:e=this.InterpolantFactoryMethodSmooth;break}if(e===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return console.warn("THREE.KeyframeTrack:",i),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return xa;case this.InterpolantFactoryMethodLinear:return Bl;case this.InterpolantFactoryMethodSmooth:return bo}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let i=0,s=e.length;i!==s;++i)e[i]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let i=0,s=e.length;i!==s;++i)e[i]*=t}return this}trim(t,e){let i=this.times,s=i.length,r=0,a=s-1;for(;r!==s&&i[r]<t;)++r;for(;a!==-1&&i[a]>e;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=i.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),t=!1);let i=this.times,s=this.values,r=i.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),t=!1);let a=null;for(let o=0;o!==r;o++){let l=i[o];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,l),t=!1;break}if(a!==null&&a>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,l,a),t=!1;break}a=l}if(s!==void 0&&Z_(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===bo,r=t.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=t[o],h=t[o+1];if(c!==h&&(o!==1||c!==t[0]))if(s)l=!0;else{let f=o*i,u=f-i,d=f+i;for(let g=0;g!==i;++g){let _=e[f+g];if(_!==e[u+g]||_!==e[d+g]){l=!0;break}}}if(l){if(o!==a){t[a]=t[o];let f=o*i,u=a*i;for(let d=0;d!==i;++d)e[u+d]=e[f+d]}++a}}if(r>0){t[a]=t[r];for(let o=r*i,l=a*i,c=0;c!==i;++c)e[l+c]=e[o+c];++a}return a!==t.length?(this.times=t.slice(0,a),this.values=e.slice(0,a*i)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),i=this.constructor,s=new i(this.name,t,e);return s.createInterpolant=this.createInterpolant,s}};Ln.prototype.TimeBufferType=Float32Array;Ln.prototype.ValueBufferType=Float32Array;Ln.prototype.DefaultInterpolation=Bl;var es=class extends Ln{constructor(t,e,i){super(t,e,i)}};es.prototype.ValueTypeName="bool";es.prototype.ValueBufferType=Array;es.prototype.DefaultInterpolation=xa;es.prototype.InterpolantFactoryMethodLinear=void 0;es.prototype.InterpolantFactoryMethodSmooth=void 0;var mc=class extends Ln{};mc.prototype.ValueTypeName="color";var gc=class extends Ln{};gc.prototype.ValueTypeName="number";var _c=class extends Ws{constructor(t,e,i,s){super(t,e,i,s)}interpolate_(t,e,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(i-e)/(s-e),c=t*o;for(let h=c+o;c!==h;c+=4)Ri.slerpFlat(r,0,a,c-o,a,c,l);return r}},Ya=class extends Ln{InterpolantFactoryMethodLinear(t){return new _c(this.times,this.values,this.getValueSize(),t)}};Ya.prototype.ValueTypeName="quaternion";Ya.prototype.InterpolantFactoryMethodSmooth=void 0;var ns=class extends Ln{constructor(t,e,i){super(t,e,i)}};ns.prototype.ValueTypeName="string";ns.prototype.ValueBufferType=Array;ns.prototype.DefaultInterpolation=xa;ns.prototype.InterpolantFactoryMethodLinear=void 0;ns.prototype.InterpolantFactoryMethodSmooth=void 0;var vc=class extends Ln{};vc.prototype.ValueTypeName="vector";var Cf={enabled:!1,files:{},add:function(n,t){this.enabled!==!1&&(this.files[n]=t)},get:function(n){if(this.enabled!==!1)return this.files[n]},remove:function(n){delete this.files[n]},clear:function(){this.files={}}},yc=class{constructor(t,e,i){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=i,this.itemStart=function(h){o++,r===!1&&s.onStart!==void 0&&s.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,s.onProgress!==void 0&&s.onProgress(h,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,f){return c.push(h,f),this},this.removeHandler=function(h){let f=c.indexOf(h);return f!==-1&&c.splice(f,2),this},this.getHandler=function(h){for(let f=0,u=c.length;f<u;f+=2){let d=c[f],g=c[f+1];if(d.global&&(d.lastIndex=0),d.test(h))return g}return null}}},$_=new yc,wr=class{constructor(t){this.manager=t!==void 0?t:$_,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(t,e){let i=this;return new Promise(function(s,r){i.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}};wr.DEFAULT_MATERIAL_NAME="__DEFAULT";var xc=class extends wr{constructor(t){super(t)}load(t,e,i,s){this.path!==void 0&&(t=this.path+t),t=this.manager.resolveURL(t);let r=this,a=Cf.get(t);if(a!==void 0)return r.manager.itemStart(t),setTimeout(function(){e&&e(a),r.manager.itemEnd(t)},0),a;let o=yr("img");function l(){h(),Cf.add(t,this),e&&e(this),r.manager.itemEnd(t)}function c(f){h(),s&&s(f),r.manager.itemError(t),r.manager.itemEnd(t)}function h(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),t.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),r.manager.itemStart(t),o.src=t,o}};var is=class extends wr{constructor(t){super(t)}load(t,e,i,s){let r=new Ve,a=new xc(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(t,function(o){r.image=o,r.needsUpdate=!0,e!==void 0&&e(r)},i,s),r}},Za=class extends _e{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new At(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}},$a=class extends Za{constructor(t,e,i){super(t,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(_e.DEFAULT_UP),this.updateMatrix(),this.groundColor=new At(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}},tl=new re,Pf=new R,If=new R,Mc=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ct(512,512),this.map=null,this.mapPass=null,this.matrix=new re,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Mr,this._frameExtents=new ct(1,1),this._viewportCount=1,this._viewports=[new ge(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera,i=this.matrix;Pf.setFromMatrixPosition(t.matrixWorld),e.position.copy(Pf),If.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(If),e.updateMatrixWorld(),tl.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(tl),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(tl)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}};var bc=class extends Mc{constructor(){super(new La(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ja=class extends Za{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(_e.DEFAULT_UP),this.updateMatrix(),this.target=new _e,this.shadow=new bc}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}};var Ka=class{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=Lf(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let e=Lf();t=(e-this.oldTime)/1e3,this.oldTime=e,this.elapsedTime+=t}return t}};function Lf(){return performance.now()}var zc="\\[\\]\\.:\\/",J_=new RegExp("["+zc+"]","g"),Hc="[^"+zc+"]",K_="[^"+zc.replace("\\.","")+"]",Q_=/((?:WC+[\/:])*)/.source.replace("WC",Hc),j_=/(WCOD+)?/.source.replace("WCOD",K_),t1=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Hc),e1=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Hc),n1=new RegExp("^"+Q_+j_+t1+e1+"$"),i1=["material","materials","bones","map"],Sc=class{constructor(t,e,i){let s=i||de.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(t,e)}setValue(t,e){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=i.length;s!==r;++s)i[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].unbind()}},de=class n{constructor(t,e,i){this.path=e,this.parsedPath=i||n.parseTrackName(e),this.node=n.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,i){return t&&t.isAnimationObjectGroup?new n.Composite(t,e,i):new n(t,e,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(J_,"")}static parseTrackName(t){let e=n1.exec(t);if(e===null)throw new Error("PropertyBinding: Cannot parse trackName: "+t);let i={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=i.nodeName.substring(s+1);i1.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(e);if(i!==void 0)return i}if(t.children){let i=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===e||o.uuid===e)return o;let l=i(o.children);if(l)return l}return null},s=i(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)t[e++]=i[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,i=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=n.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=e.objectIndex;switch(i){case"materials":if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(c!==void 0){if(t[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let a=t[s];if(a===void 0){let c=e.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.needsUpdate!==void 0?o=this.Versioning.NeedsUpdate:t.matrixWorldNeedsUpdate!==void 0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};de.Composite=Sc;de.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};de.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};de.prototype.GetterByBindingType=[de.prototype._getValue_direct,de.prototype._getValue_array,de.prototype._getValue_arrayElement,de.prototype._getValue_toArray];de.prototype.SetterByBindingTypeAndVersioning=[[de.prototype._setValue_direct,de.prototype._setValue_direct_setNeedsUpdate,de.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[de.prototype._setValue_array,de.prototype._setValue_array_setNeedsUpdate,de.prototype._setValue_array_setMatrixWorldNeedsUpdate],[de.prototype._setValue_arrayElement,de.prototype._setValue_arrayElement_setNeedsUpdate,de.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[de.prototype._setValue_fromArray,de.prototype._setValue_fromArray_setNeedsUpdate,de.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var yv=new Float32Array(1);var Df=new re,Qa=class{constructor(t,e,i=0,s=1/0){this.ray=new Aa(t,e),this.near=i,this.far=s,this.camera=null,this.layers=new xr,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,(e.near+e.far)/(e.near-e.far)).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):console.error("THREE.Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return Df.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Df),this}intersectObject(t,e=!0,i=[]){return wc(t,this,i,e),i.sort(Uf),i}intersectObjects(t,e=!0,i=[]){for(let s=0,r=t.length;s<r;s++)wc(t[s],this,i,e);return i.sort(Uf),i}};function Uf(n,t){return n.distance-t.distance}function wc(n,t,e,i){let s=!0;if(n.layers.test(t.layers)&&n.raycast(t,e)===!1&&(s=!1),s===!0&&i===!0){let r=n.children;for(let a=0,o=r.length;a<o;a++)wc(r[a],t,e,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Ec}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Ec);var Me="rgba(40,24,30,.85)";function K(n,t,e,i,s,r){n.beginPath(),n.roundRect(t,e,i,s,r)}function Q(n,t,e=7){n.fillStyle=t,n.fill(),n.lineWidth=e,n.strokeStyle=Me,n.stroke()}function Tr(n,t,e,i,s){let r=n.createLinearGradient(0,e,0,e+s);r.addColorStop(0,"rgba(255,255,255,.35)"),r.addColorStop(.5,"rgba(255,255,255,0)"),n.fillStyle=r,n.fill()}var iu={bus:[3.4,2,n=>{K(n,30,40,700,330,46),Q(n,"#e2231a",9),K(n,30,40,700,330,46),Tr(n,30,40,700,330),K(n,30,196,700,26,0),n.fillStyle="#fff3d6",n.fill();for(let t=0;t<2;t++)for(let e=0;e<6;e++)K(n,70+e*106,t?238:72,86,96,16),Q(n,"#bfe9ff",6);K(n,640,238,70,120,12),Q(n,"#2b2440",6);for(let t of[170,590])n.beginPath(),n.arc(t,380,58,0,7),Q(n,"#22262e",8),n.beginPath(),n.arc(t,380,24,0,7),n.fillStyle="#c9cdd6",n.fill();n.beginPath(),n.arc(712,330,14,0,7),n.fillStyle="#ffe14d",n.fill()},768,460],phone:[1.3,2.6,n=>{K(n,40,70,240,500,22),Q(n,"#e2231a",9),K(n,40,70,240,500,22),Tr(n,40,70,240,500),n.beginPath(),n.moveTo(30,80),n.quadraticCurveTo(160,0,290,80),n.closePath(),Q(n,"#c41a14",8),n.beginPath(),n.arc(160,44,16,0,7),n.fillStyle="#ffd23a",n.fill(),K(n,62,100,196,34,6),Q(n,"#2b2440",5),n.fillStyle="#fff",n.font="900 24px G,sans-serif",n.textAlign="center",n.fillText("TELEPHONE",160,126);for(let t=0;t<4;t++)for(let e=0;e<3;e++)K(n,72+e*62,160+t*72,52,58,6),Q(n,"#fff7d6",5);K(n,60,470,200,80,10),n.fillStyle="#c41a14",n.fill()},320,600],bigben:[1.6,4,n=>{n.beginPath(),n.moveTo(160,20),n.lineTo(232,150),n.lineTo(88,150),n.closePath(),Q(n,"#3a4a5a",8),n.beginPath(),n.moveTo(160,0),n.lineTo(170,30),n.lineTo(150,30),n.closePath(),n.fillStyle="#ffd23a",n.fill(),K(n,70,150,180,220,10),Q(n,"#e6c98f",8),n.beginPath(),n.arc(160,255,70,0,7),Q(n,"#fffbe8",8),n.beginPath(),n.arc(160,255,70,0,7),n.lineWidth=10,n.strokeStyle="#ffd23a",n.stroke(),n.lineCap="round",n.strokeStyle="#2b2440",n.lineWidth=9,n.beginPath(),n.moveTo(160,255),n.lineTo(160,205),n.stroke(),n.lineWidth=7,n.beginPath(),n.moveTo(160,255),n.lineTo(196,270),n.stroke(),K(n,80,370,160,410,6),Q(n,"#d9b77a",8);for(let t=0;t<6;t++)K(n,104,400+t*62,30,44,8),n.fillStyle="#8a6a3a",n.fill(),K(n,186,400+t*62,30,44,8),n.fill()},320,800],hat:[1.4,1.6,n=>{n.beginPath(),n.ellipse(160,210,120,160,0,0,7),Q(n,"#1d1b26",9);for(let t=0;t<40;t++)n.beginPath(),n.arc(70+Math.random()*180,70+Math.random()*260,10,0,7),n.fillStyle="rgba(255,255,255,.07)",n.fill();K(n,44,300,232,40,18),Q(n,"#e2231a",6),n.beginPath(),n.arc(160,320,18,0,7),n.fillStyle="#ffd23a",n.fill()},320,380],tea:[1.6,1.3,n=>{n.beginPath(),n.ellipse(170,170,120,100,0,0,7),Q(n,"#ffffff",8),n.beginPath(),n.ellipse(170,170,120,100,0,0,7),n.save(),n.clip();for(let t=0;t<5;t++)n.beginPath(),n.arc(90+t*40,170+t%2*20,14,0,7),n.fillStyle="#2f6fe0",n.fill();n.restore(),n.lineWidth=16,n.strokeStyle=Me,n.beginPath(),n.arc(300,170,40,-1.4,1.4),n.stroke(),n.strokeStyle="#fff",n.lineWidth=8,n.stroke(),n.beginPath(),n.moveTo(60,150),n.quadraticCurveTo(10,120,20,90),n.lineWidth=18,n.strokeStyle=Me,n.stroke(),n.lineWidth=10,n.strokeStyle="#fff",n.stroke(),n.beginPath(),n.ellipse(170,80,50,20,0,0,7),Q(n,"#fff",6),n.beginPath(),n.arc(170,66,12,0,7),n.fillStyle="#2f6fe0",n.fill()},380,300],pub:[3,2.2,n=>{K(n,30,90,640,360,14),Q(n,"#1f6b46",9),K(n,30,90,640,360,14),Tr(n,30,90,640,360),K(n,20,60,660,60,10),Q(n,"#174f34",8),K(n,200,66,300,48,8),Q(n,"#ffd23a",5),n.fillStyle="#5a3a10",n.font="900 34px G,sans-serif",n.textAlign="center",n.fillText("THE PUB",350,102);for(let t of[70,450])K(n,t,160,180,170,12),Q(n,"#ffcf6b",6),n.strokeStyle="#1f6b46",n.lineWidth=8,n.beginPath(),n.moveTo(t+90,160),n.lineTo(t+90,330),n.moveTo(t,245),n.lineTo(t+180,245),n.stroke();K(n,290,180,120,270,12),Q(n,"#7a3a1a",7),n.beginPath(),n.arc(390,320,8,0,7),n.fillStyle="#ffd23a",n.fill();for(let t of[70,450])for(let e=0;e<6;e++)n.beginPath(),n.arc(t+14+e*31,344,14,0,7),n.fillStyle=["#ff4f8b","#ffd23a","#ffffff"][e%3],n.fill()},700,470],gb:[2.2,1.4,n=>{n.save(),K(n,20,20,560,340,22),n.clip(),n.fillStyle="#012169",n.fillRect(0,0,600,380),n.strokeStyle="#fff",n.lineWidth=70,n.beginPath(),n.moveTo(20,20),n.lineTo(580,360),n.moveTo(580,20),n.lineTo(20,360),n.stroke(),n.strokeStyle="#c8102e",n.lineWidth=24,n.beginPath(),n.moveTo(20,20),n.lineTo(580,360),n.moveTo(580,20),n.lineTo(20,360),n.stroke(),n.fillStyle="#fff",n.fillRect(250,0,100,380),n.fillRect(0,140,600,100),n.fillStyle="#c8102e",n.fillRect(270,0,60,380),n.fillRect(0,160,600,60),n.restore(),K(n,20,20,560,340,22),n.lineWidth=8,n.strokeStyle=Me,n.stroke()},600,380],eiffel:[2.6,4.6,n=>{let t="#9a6640",e="#6e4428";n.fillStyle=t,n.strokeStyle=Me,n.lineWidth=8,n.lineJoin="round",n.beginPath(),n.moveTo(30,880),n.quadraticCurveTo(150,640,205,380),n.lineTo(315,380),n.quadraticCurveTo(370,640,490,880),n.lineTo(380,880),n.quadraticCurveTo(330,700,260,690),n.quadraticCurveTo(190,700,140,880),n.closePath(),n.fill(),n.stroke(),K(n,120,600,280,34,8),Q(n,e,7),n.beginPath(),n.moveTo(205,380),n.quadraticCurveTo(240,220,250,90),n.lineTo(270,90),n.quadraticCurveTo(280,220,315,380),n.closePath(),n.fillStyle=t,n.fill(),n.stroke(),K(n,180,370,160,28,8),Q(n,e,7),K(n,236,140,48,18,6),Q(n,e,6),n.beginPath(),n.moveTo(260,10),n.lineTo(270,92),n.lineTo(250,92),n.closePath(),n.fillStyle=e,n.fill(),n.strokeStyle="rgba(60,30,10,.35)",n.lineWidth=3;for(let i=410;i<880;i+=34){let s=(i-380)/500,r=55+s*200;n.beginPath(),n.moveTo(260-r,i),n.lineTo(260+r,i+30),n.moveTo(260+r,i),n.lineTo(260-r,i+30),n.stroke()}},520,900],arc:[2.6,2.2,n=>{K(n,40,40,520,420,10),Q(n,"#f1e3c4",9),K(n,40,40,520,420,10),Tr(n,40,40,520,420),K(n,30,30,540,70,8),Q(n,"#e3cfa6",7),n.beginPath(),n.moveTo(210,460),n.lineTo(210,250),n.arc(300,250,90,Math.PI,0),n.lineTo(390,460),n.closePath(),Q(n,"#5aa7e6",7);for(let t of[90,470])K(n,t-30,180,60,120,8),n.fillStyle="#d9c39a",n.fill()},600,500],croissant:[1.8,1.2,n=>{let t=[[90,150,50,-.5],[150,110,62,-.25],[220,96,70,0],[290,110,62,.25],[350,150,50,.5]];for(let[e,i,s,r]of t){n.save(),n.translate(e,i),n.rotate(r),n.beginPath(),n.ellipse(0,0,s*.6,s,0,0,7);let a=n.createLinearGradient(0,-s,0,s);a.addColorStop(0,"#ffd27a"),a.addColorStop(1,"#d9862e"),n.fillStyle=a,n.fill(),n.lineWidth=7,n.strokeStyle=Me,n.stroke(),n.restore()}},440,260],baguette:[3,.8,n=>{K(n,20,30,740,120,60);let t=n.createLinearGradient(0,30,0,150);t.addColorStop(0,"#f6c375"),t.addColorStop(1,"#c8802e"),Q(n,t,8),n.lineCap="round";for(let e=0;e<6;e++)n.beginPath(),n.moveTo(100+e*110,60),n.lineTo(150+e*110,110),n.lineWidth=12,n.strokeStyle="#fff1cf",n.stroke()},780,180],beret:[1.4,1.2,n=>{n.beginPath(),n.ellipse(160,140,140,110,0,0,7),Q(n,"#2b3a8f",9),n.beginPath(),n.ellipse(140,120,90,60,0,0,7),n.fillStyle="rgba(255,255,255,.12)",n.fill(),K(n,150,10,20,40,8),n.fillStyle="#1d2a6e",n.fill()},320,270],cafe:[2,2,n=>{n.save(),n.translate(200,200);for(let t=0;t<12;t++)n.beginPath(),n.moveTo(0,0),n.arc(0,0,180,t*Math.PI/6,(t+1)*Math.PI/6),n.closePath(),n.fillStyle=t%2?"#ffffff":"#e2231a",n.fill();n.beginPath(),n.arc(0,0,180,0,7),n.lineWidth=9,n.strokeStyle=Me,n.stroke(),n.beginPath(),n.arc(0,0,18,0,7),n.fillStyle="#fff",n.fill(),n.stroke(),n.restore()},400,400],fr:[2.2,1.4,n=>{n.save(),K(n,20,20,560,340,22),n.clip(),n.fillStyle="#0055a4",n.fillRect(0,0,207,380),n.fillStyle="#fff",n.fillRect(207,0,186,380),n.fillStyle="#ef4135",n.fillRect(393,0,207,380),n.restore(),K(n,20,20,560,340,22),n.lineWidth=8,n.strokeStyle=Me,n.stroke()},600,380],tor:[3.2,2.2,n=>{K(n,30,60,640,70,8),Q(n,"#e9d6a8",8),K(n,230,10,240,60,8),Q(n,"#e0c88f",7),n.fillStyle="#4a8a6a",n.beginPath(),n.ellipse(350,22,70,18,0,0,7),n.fill();for(let t=0;t<6;t++)K(n,54+t*112,130,42,300,8),Q(n,"#f1e3c4",7);K(n,20,430,660,40,8),Q(n,"#d9c39a",7)},700,490],schloss:[2.8,2.6,n=>{K(n,80,260,440,280,10),Q(n,"#f4f1ec",9);for(let[t,e,i]of[[60,90,300],[260,110,380],[450,90,280]])K(n,t,540-i,e,i,8),Q(n,"#ffffff",8),n.beginPath(),n.moveTo(t-10,540-i),n.lineTo(t+e/2,540-i-120),n.lineTo(t+e+10,540-i),n.closePath(),Q(n,"#3a6fd0",8);for(let t=0;t<4;t++)K(n,120+t*100,340,40,60,20),n.fillStyle="#5aa7e6",n.fill();K(n,270,430,70,110,35),Q(n,"#8a5232",6)},600,560],brezel:[1.8,1.6,n=>{n.lineCap="round",n.lineJoin="round";let t=()=>{n.beginPath(),n.moveTo(110,250),n.bezierCurveTo(20,150,80,30,180,60),n.bezierCurveTo(260,90,260,200,200,230),n.bezierCurveTo(140,200,140,90,220,60),n.bezierCurveTo(320,30,380,150,290,250)};t(),n.lineWidth=64,n.strokeStyle=Me,n.stroke(),t(),n.lineWidth=50,n.strokeStyle="#a8561f",n.stroke(),t(),n.lineWidth=20,n.strokeStyle="rgba(255,200,140,.35)",n.stroke();for(let e=0;e<30;e++){let i=Math.random();n.fillStyle="#fff",n.fillRect(80+Math.random()*240,60+Math.random()*170,6,6)}},400,300],dom:[2.2,3.6,n=>{for(let t of[40,280]){K(n,t,260,120,520,6),Q(n,"#5d5f6e",8),n.beginPath(),n.moveTo(t-10,262),n.lineTo(t+60,20),n.lineTo(t+130,262),n.closePath(),Q(n,"#4a4c5a",8);for(let e=0;e<4;e++)K(n,t+40,320+e*110,40,70,20),n.fillStyle="#8fd0ff",n.fill()}K(n,160,420,120,360,6),Q(n,"#666878",8),n.beginPath(),n.arc(220,500,36,0,7),Q(n,"#ff8ab5",6)},440,800],de:[2.2,1.4,n=>{n.save(),K(n,20,20,560,340,22),n.clip(),n.fillStyle="#1d1b26",n.fillRect(0,0,600,133),n.fillStyle="#dd0000",n.fillRect(0,133,600,114),n.fillStyle="#ffce00",n.fillRect(0,247,600,133),n.restore(),K(n,20,20,560,340,22),n.lineWidth=8,n.strokeStyle=Me,n.stroke()},600,380],abc:[2.6,1,n=>{[["A","#ff4f8b"],["B","#2f86ff"],["C","#ffb02e"]].forEach(([t,e],i)=>{K(n,20+i*250,20,220,220,34),Q(n,e,8),K(n,20+i*250,20,220,220,34),Tr(n,20,20,220,220),n.fillStyle="#fff",n.font="900 160px G,sans-serif",n.textAlign="center",n.textBaseline="middle",n.fillText(t,130+i*250,138)})},770,260],crown:[1.6,1.2,n=>{n.beginPath(),n.moveTo(30,230),n.lineTo(40,70),n.lineTo(110,150),n.lineTo(170,40),n.lineTo(230,150),n.lineTo(300,70),n.lineTo(310,230),n.closePath(),Q(n,"#ffc21a",9),n.beginPath(),n.rect(30,200,280,40),Q(n,"#e2a200",7);for(let[t,e]of[[90,"#e2231a"],[170,"#2f86ff"],[250,"#2fcf63"]])n.beginPath(),n.arc(t,220,13,0,7),n.fillStyle=e,n.fill();for(let t of[40,170,300])n.beginPath(),n.arc(t,t===170?40:70,16,0,7),Q(n,"#fff",5)},340,260],umbrella:[1.8,1.8,n=>{n.save(),n.translate(180,180);for(let t=0;t<8;t++)n.beginPath(),n.moveTo(0,0),n.arc(0,0,160,t*Math.PI/4,(t+1)*Math.PI/4),n.closePath(),n.fillStyle=t%2?"#1d1b26":"#e2231a",n.fill();n.beginPath(),n.arc(0,0,160,0,7),n.lineWidth=9,n.strokeStyle=Me,n.stroke(),n.beginPath(),n.arc(0,0,14,0,7),n.fillStyle="#ffd23a",n.fill(),n.restore()},360,360],towerbridge:[4.2,1.8,n=>{K(n,20,150,960,90,10),Q(n,"#5aa7e6",8);for(let t of[210,690])K(n,t,40,100,300,10),Q(n,"#e6d3a8",8),n.beginPath(),n.moveTo(t-6,44),n.lineTo(t+50,-10),n.lineTo(t+106,44),n.closePath(),Q(n,"#3a4a5a",7),K(n,t+30,100,40,70,18),n.fillStyle="#7fb7e6",n.fill();K(n,310,60,380,34,6),Q(n,"#5aa7e6",7),n.strokeStyle="#2f6fe0",n.lineWidth=8,n.beginPath(),n.moveTo(20,150),n.quadraticCurveTo(110,40,210,70),n.moveTo(980,150),n.quadraticCurveTo(890,40,790,70),n.stroke()},1e3,360],cheese:[1.8,1.4,n=>{n.beginPath(),n.moveTo(30,260),n.lineTo(340,260),n.lineTo(340,120),n.lineTo(30,40),n.closePath(),Q(n,"#ffd23a",9);for(let[t,e,i]of[[110,170,26],[230,200,20],[280,150,14],[90,100,14],[170,230,12]])n.beginPath(),n.arc(t,e,i,0,7),n.fillStyle="#e8b200",n.fill()},370,290],velo:[2.4,1.4,n=>{n.lineCap="round";for(let t of[110,390])n.beginPath(),n.arc(t,200,80,0,7),n.lineWidth=18,n.strokeStyle=Me,n.stroke(),n.lineWidth=10,n.strokeStyle="#2b2440",n.stroke(),n.beginPath(),n.arc(t,200,12,0,7),n.fillStyle="#c9cdd6",n.fill();n.strokeStyle="#2f86ff",n.lineWidth=16,n.beginPath(),n.moveTo(110,200),n.lineTo(210,90),n.lineTo(340,90),n.lineTo(390,200),n.moveTo(210,90),n.lineTo(250,200),n.lineTo(340,90),n.stroke(),K(n,180,60,70,20,10),n.fillStyle="#8a5232",n.fill(),n.beginPath(),n.ellipse(380,70,40,40,0,0,7),n.fillStyle="#c8802e",n.fill(),n.lineWidth=6,n.strokeStyle=Me,n.stroke(),n.fillStyle="#ffd27a",n.fillRect(350,50,60,12)},500,300],macaron:[1.8,1.2,n=>{[["#ff8ab5",70],["#7fe0b0",180],["#b48cff",290]].forEach(([t,e])=>{n.beginPath(),n.ellipse(e,130,56,46,0,0,7),Q(n,t,7),n.fillStyle="#fff6e6",n.fillRect(e-52,124,104,14),n.beginPath(),n.ellipse(e-14,112,18,8,0,0,7),n.fillStyle="rgba(255,255,255,.4)",n.fill()})},360,260],mona:[1.4,1.8,n=>{K(n,20,20,280,360,14),Q(n,"#d9a03a",10),K(n,50,50,220,300,6),n.fillStyle="#7a8a5a",n.fill(),n.beginPath(),n.ellipse(160,150,52,64,0,0,7),n.fillStyle="#e8c08a",n.fill(),n.beginPath(),n.ellipse(160,120,70,70,0,Math.PI,0),n.fillStyle="#3a2410",n.fill(),n.beginPath(),n.moveTo(70,350),n.quadraticCurveTo(160,220,250,350),n.fillStyle="#3a2a20",n.fill(),n.fillStyle="#1d1b26",n.beginPath(),n.arc(140,150,5,0,7),n.arc(180,150,5,0,7),n.fill(),n.strokeStyle="#8a4a2a",n.lineWidth=4,n.beginPath(),n.arc(160,168,16,.3,2.8),n.stroke()},320,400],turm:[1.4,4.2,n=>{n.fillStyle="#c9cdd6",K(n,140,300,40,560,10),Q(n,"#c9cdd6",7),n.beginPath(),n.arc(160,280,80,0,7),Q(n,"#dfe3ea",9);for(let t=0;t<6;t++)n.beginPath(),n.arc(160,280,60,t,t+.4),n.lineWidth=10,n.strokeStyle="#2f86ff",n.stroke();K(n,150,40,20,170,6),Q(n,"#e2231a",6),n.beginPath(),n.arc(160,30,14,0,7),n.fillStyle="#e2231a",n.fill()},320,880],fachwerk:[2,2.2,n=>{n.beginPath(),n.moveTo(20,170),n.lineTo(200,20),n.lineTo(380,170),n.closePath(),Q(n,"#c8402e",9),K(n,40,170,320,280,6),Q(n,"#fff6e6",9),n.strokeStyle="#6b3a20",n.lineWidth=16,n.beginPath(),n.moveTo(40,300),n.lineTo(360,300),n.moveTo(140,170),n.lineTo(140,450),n.moveTo(260,170),n.lineTo(260,450),n.moveTo(40,170),n.lineTo(140,300),n.moveTo(360,170),n.lineTo(260,300),n.stroke();for(let t of[70,290])K(n,t,200,46,70,6),n.fillStyle="#7fc7ff",n.fill();K(n,170,340,60,110,24),Q(n,"#8a5232",6)},400,470],uhr:[1.4,2.4,n=>{n.beginPath(),n.moveTo(20,140),n.lineTo(160,20),n.lineTo(300,140),n.closePath(),Q(n,"#6b3a20",9),K(n,40,130,240,220,10),Q(n,"#8a5232",9),n.beginPath(),n.arc(160,230,70,0,7),Q(n,"#fff6e6",7),n.lineCap="round",n.strokeStyle="#2b2440",n.lineWidth=9,n.beginPath(),n.moveTo(160,230),n.lineTo(160,180),n.moveTo(160,230),n.lineTo(200,240),n.stroke(),K(n,110,70,100,40,16),n.fillStyle="#ffd23a",n.fill();for(let t of[120,200])n.strokeStyle="#b8743e",n.lineWidth=6,n.beginPath(),n.moveTo(t,350),n.lineTo(t,470),n.stroke(),K(n,t-14,470,28,40,8),n.fillStyle="#d9a03a",n.fill()},320,520],tuete:[1.4,2.6,n=>{n.beginPath(),n.moveTo(160,560),n.lineTo(30,120),n.lineTo(290,120),n.closePath(),Q(n,"#ff4f8b",9),n.strokeStyle="#ffd23a",n.lineWidth=12;for(let t=0;t<5;t++)n.beginPath(),n.moveTo(60+t*20,200+t*70),n.lineTo(260-t*20,200+t*70),n.stroke();n.beginPath(),n.moveTo(30,120),n.quadraticCurveTo(160,0,290,120),n.closePath(),Q(n,"#5aa7e6",8),n.beginPath(),n.arc(160,40,24,0,7),Q(n,"#ffd23a",6)},320,580],calc:[1.6,2.2,n=>{K(n,20,20,300,440,30),Q(n,"#2f86ff",10),K(n,50,50,240,90,14),Q(n,"#c9f2c9",6),n.fillStyle="#1d1b26",n.font="900 60px G,sans-serif",n.textAlign="right",n.fillText("12",270,118),["7","8","9","4","5","6","1","2","3","0","+","="].forEach((e,i)=>{let s=i%3,r=Math.floor(i/3);K(n,50+s*82,160+r*72,70,58,14),Q(n,e==="="?"#ff8a1f":e==="+"?"#ffd23a":"#fff",5),n.fillStyle="#2b2440",n.font="900 36px G,sans-serif",n.textAlign="center",n.fillText(e,85+s*82,202+r*72)})},340,480],clock:[1.8,1.8,n=>{n.beginPath(),n.arc(180,180,160,0,7),Q(n,"#ff4f8b",10),n.beginPath(),n.arc(180,180,128,0,7),n.fillStyle="#fff",n.fill(),n.fillStyle="#2b2440",n.font="900 34px G,sans-serif",n.textAlign="center",n.textBaseline="middle";for(let t=1;t<=12;t++){let e=t/12*Math.PI*2-Math.PI/2;n.fillText(t,180+Math.cos(e)*104,182+Math.sin(e)*104)}n.lineCap="round",n.lineWidth=12,n.beginPath(),n.moveTo(180,180),n.lineTo(180,100),n.moveTo(180,180),n.lineTo(240,200),n.stroke()},360,360],waage:[2.4,1.6,n=>{K(n,230,40,20,260,8),Q(n,"#8a5232",6),K(n,160,290,160,30,10),Q(n,"#8a5232",6),n.strokeStyle=Me,n.lineWidth=12,n.beginPath(),n.moveTo(40,80),n.lineTo(440,60),n.stroke(),n.strokeStyle="#ffd23a",n.lineWidth=6,n.stroke();for(let[t,e]of[[60,80],[420,62]])n.beginPath(),n.ellipse(t,e+70,60,22,0,0,7),Q(n,"#c9cdd6",6);for(let t=0;t<3;t++)n.beginPath(),n.arc(40+t*22,135,14,0,7),n.fillStyle="#ff4f4f",n.fill();n.beginPath(),n.arc(420,115,30,0,7),Q(n,"#2fcf63",5)},480,340],laptop:[2.4,1.8,n=>{K(n,60,20,380,250,20),Q(n,"#3a3f5a",9),K(n,84,44,332,202,8),n.fillStyle="#7fe0ff",n.fill();for(let t=0;t<4;t++)K(n,110,70+t*40,80+t*40,18,9),n.fillStyle=["#ff4f8b","#ffd23a","#2fcf63","#ffffff"][t],n.fill();K(n,20,270,460,80,20),Q(n,"#c9cdd6",9),K(n,200,290,100,40,10),n.fillStyle="#aeb3c0",n.fill()},500,370],phone2:[1.2,2.2,n=>{K(n,20,20,220,420,36),Q(n,"#2b2440",9),K(n,40,60,180,330,12),n.fillStyle="#7fe0ff",n.fill();for(let t=0;t<4;t++)for(let e=0;e<3;e++)K(n,56+e*56,80+t*70,40,40,10),n.fillStyle=["#ff4f8b","#ffd23a","#2fcf63","#8a5cff","#ff8a1f","#2f86ff"][(t*3+e)%6],n.fill()},260,460],router:[2.2,1.4,n=>{K(n,20,140,420,120,28),Q(n,"#ffffff",9);for(let t=0;t<5;t++)n.beginPath(),n.arc(80+t*50,200,12,0,7),n.fillStyle=t%2?"#2fcf63":"#3ff0ff",n.fill();for(let t of[90,370])K(n,t-10,20,20,130,10),Q(n,"#c9cdd6",6);n.strokeStyle="#2f86ff",n.lineCap="round",n.lineWidth=12;for(let t of[40,70])n.beginPath(),n.arc(230,120,t,Math.PI*1.2,Math.PI*1.8),n.stroke()},460,280],cloud:[2.4,1.4,n=>{n.beginPath(),n.arc(150,170,90,Math.PI*.5,Math.PI*1.5),n.arc(250,110,100,Math.PI,0),n.arc(360,170,90,Math.PI*1.5,Math.PI*.5),n.closePath(),Q(n,"#ffffff",10),n.strokeStyle="#2f86ff",n.lineCap="round",n.lineWidth=16,n.beginPath(),n.moveTo(250,120),n.lineTo(250,210),n.moveTo(210,170),n.lineTo(250,210),n.lineTo(290,170),n.stroke()},500,280],robot:[1.6,1.8,n=>{K(n,50,60,240,200,50),Q(n,"#ffffff",9),K(n,80,90,180,130,30),n.fillStyle="#bff3ff",n.fill(),n.fillStyle="#1d1b26",n.beginPath(),n.ellipse(130,150,12,18,0,0,7),n.ellipse(210,150,12,18,0,0,7),n.fill(),n.lineWidth=6,n.strokeStyle="#1d1b26",n.beginPath(),n.arc(170,175,22,.3,2.8),n.stroke(),n.fillStyle="#3ff0ff";for(let t of[30,290])K(n,t,120,30,80,12),Q(n,"#3fc1c9",6);n.beginPath(),n.arc(170,30,18,0,7),Q(n,"#3ff0ff",6),K(n,165,40,10,24,4),n.fillStyle="#c9cdd6",n.fill(),K(n,90,270,160,80,30),Q(n,"#3fc1c9",8)},340,380],sat:[1.8,1.8,n=>{n.beginPath(),n.ellipse(180,170,150,110,-.5,0,7),Q(n,"#f1f3f7",9),n.beginPath(),n.ellipse(180,170,100,70,-.5,0,7),n.fillStyle="#dfe3ea",n.fill(),n.strokeStyle=Me,n.lineWidth=10,n.beginPath(),n.moveTo(180,170),n.lineTo(270,80),n.stroke(),n.beginPath(),n.arc(270,80,18,0,7),n.fillStyle="#ff4f8b",n.fill(),K(n,150,270,60,80,10),Q(n,"#9aa3b5",6)},360,360],mail:[2,1.4,n=>{K(n,20,40,380,240,24),Q(n,"#ffd23a",9),n.strokeStyle=Me,n.lineWidth=8,n.lineJoin="round",n.beginPath(),n.moveTo(30,50),n.lineTo(210,180),n.lineTo(390,50),n.stroke(),n.beginPath(),n.arc(360,70,34,0,7),Q(n,"#ff4f4f",6),n.fillStyle="#fff",n.font="900 40px G,sans-serif",n.textAlign="center",n.textBaseline="middle",n.fillText("1",360,72)},420,300],shield2:[1.6,1.8,n=>{n.beginPath(),n.moveTo(170,20),n.lineTo(310,70),n.quadraticCurveTo(310,290,170,360),n.quadraticCurveTo(30,290,30,70),n.closePath(),Q(n,"#2fcf63",10),n.strokeStyle="#fff",n.lineWidth=26,n.lineCap="round",n.lineJoin="round",n.beginPath(),n.moveTo(110,190),n.lineTo(155,235),n.lineTo(235,140),n.stroke()},340,380],padlock:[1.4,1.8,n=>{n.lineWidth=34,n.strokeStyle=Me,n.beginPath(),n.arc(150,140,80,Math.PI,0),n.stroke(),n.lineWidth=22,n.strokeStyle="#c9cdd6",n.stroke(),K(n,30,140,240,200,30),Q(n,"#ffb02e",9),n.beginPath(),n.arc(150,220,26,0,7),n.fillStyle="#5a3400",n.fill(),K(n,140,230,20,60,8),n.fill()},300,360],ki:[2,2,n=>{K(n,70,70,260,260,34),Q(n,"#2b2f45",10);for(let e=0;e<5;e++)for(let[i,s,r,a]of[[90+e*50,20,20,54],[90+e*50,326,20,54],[20,90+e*50,54,20],[326,90+e*50,54,20]])K(n,i,s,r,a,6),n.fillStyle="#ffd25a",n.fill();K(n,100,100,200,200,22);let t=n.createLinearGradient(100,100,300,300);t.addColorStop(0,"#3ff0ff"),t.addColorStop(1,"#8a5cff"),n.fillStyle=t,n.fill(),n.fillStyle="#fff",n.font="900 120px G,sans-serif",n.textAlign="center",n.textBaseline="middle",n.fillText("KI",200,208)},400,400],brain:[2,1.7,n=>{n.beginPath();for(let[t,e,i]of[[120,120,80],[210,90,85],[300,125,78],[110,210,70],[200,220,85],[300,210,72]])n.moveTo(t+i,e),n.arc(t,e,i,0,7);n.fillStyle=Me,n.fill(),n.beginPath();for(let[t,e,i]of[[120,120,72],[210,90,77],[300,125,70],[110,210,62],[200,220,77],[300,210,64]])n.moveTo(t+i,e),n.arc(t,e,i,0,7);n.fillStyle="#ff9ec7",n.fill(),n.strokeStyle="#3ff0ff",n.lineWidth=9,n.lineCap="round",n.beginPath(),n.moveTo(205,40),n.lineTo(205,290),n.moveTo(205,120),n.lineTo(130,120),n.lineTo(110,170),n.moveTo(205,200),n.lineTo(290,200),n.lineTo(300,150),n.moveTo(205,250),n.lineTo(140,250),n.stroke(),n.fillStyle="#fff";for(let[t,e]of[[110,170],[300,150],[140,250],[205,40]])n.beginPath(),n.arc(t,e,13,0,7),n.fill()},410,320],chatbot:[2.2,1.8,n=>{K(n,20,20,400,200,40),Q(n,"#ffffff",9),n.beginPath(),n.moveTo(80,210),n.lineTo(60,290),n.lineTo(150,214),n.fillStyle="#fff",n.fill(),n.lineWidth=9,n.strokeStyle=Me,n.stroke(),K(n,50,50,70,70,18),n.fillStyle="#3fc1c9",n.fill(),n.fillStyle="#fff",n.font="900 40px G,sans-serif",n.textAlign="center",n.textBaseline="middle",n.fillText("KI",85,87);for(let t=0;t<3;t++)K(n,140,60+t*44,240-t*60,24,12),n.fillStyle=["#8a5cff","#2f86ff","#ff4f8b"][t],n.fill()},440,310],lupe:[1.8,1.8,n=>{n.lineCap="round",n.lineWidth=46,n.strokeStyle=Me,n.beginPath(),n.moveTo(230,230),n.lineTo(330,330),n.stroke(),n.lineWidth=32,n.strokeStyle="#8a5232",n.stroke(),n.beginPath(),n.arc(150,150,120,0,7),Q(n,"#c9cdd6",10),n.beginPath(),n.arc(150,150,96,0,7),n.fillStyle="#bfefff",n.fill(),n.beginPath(),n.moveTo(110,200),n.bezierCurveTo(100,120,150,90,200,90),n.bezierCurveTo(206,150,170,200,110,200),n.fillStyle="#2fcf63",n.fill()},360,360],ruler:[3.4,.8,n=>{K(n,20,20,900,150,18),Q(n,"#ffd23a",8);for(let t=0;t<=30;t++)n.fillStyle="#5a3a10",n.fillRect(46+t*28.5,24,5,t%5?36:66)},940,200],tri:[1.8,1.6,n=>{n.beginPath(),n.moveTo(40,400),n.lineTo(40,40),n.lineTo(440,400),n.closePath(),Q(n,"rgba(120,200,255,.85)",9),n.beginPath(),n.moveTo(110,330),n.lineTo(110,200),n.lineTo(250,330),n.closePath(),n.fillStyle="rgba(255,255,255,.6)",n.fill()},480,440],abakus:[2.4,1.8,n=>{K(n,20,20,620,440,24),Q(n,"#b8743e",10),K(n,50,50,560,380,12),n.fillStyle="#ffe9c6",n.fill();let t=["#ff4f4f","#ff9a1f","#ffd23a","#2fcf63","#2f86ff"];for(let e=0;e<5;e++){n.fillStyle="#8a5232",n.fillRect(50,90+e*72,560,8);for(let i=0;i<6;i++)n.beginPath(),n.ellipse(110+i*56+e%2*120,94+e*72,26,28,0,0,7),Q(n,t[e],6)}},660,480]},su=n=>[1.4,1.6,t=>{let e=["#ff4f4f","#ff9a1f","#ffd23a","#2fcf63","#2f86ff","#8a5cff","#ff4f8b","#13c4d1","#ff8a1f","#5aa2f7"];t.font="900 300px G,sans-serif",t.textAlign="center",t.textBaseline="middle",t.lineJoin="round",t.lineWidth=34,t.strokeStyle=Me,t.strokeText(n,170,210),t.fillStyle=e[n],t.fillText(n,170,210),t.fillStyle="rgba(255,255,255,.3)",t.save(),t.beginPath(),t.rect(0,0,340,170),t.clip(),t.fillText(n,170,210),t.restore()},340,400],ru=n=>[1.5,1.5,t=>{let e=["#2f86ff","#ff4f8b","#2fcf63","#ffb02e"][n];if(t.beginPath(),n===0)t.arc(160,160,130,0,7);else if(n===1)t.moveTo(160,20),t.lineTo(300,290),t.lineTo(20,290),t.closePath();else if(n===2)t.roundRect(30,30,260,260,20);else{for(let i=0;i<10;i++){let s=i%2?60:140,r=-Math.PI/2+i*Math.PI/5;t.lineTo(160+Math.cos(r)*s,170+Math.sin(r)*s)}t.closePath()}Q(t,e,10)},320,320],au={};var ou={brezel:1,baguette:1,croissant:1};var _n={london0:[512,457],london1:[423,512],london2:[201,512],london3:[512,456],london4:[512,472],london5:[448,512],london6:[512,494],london7:[512,497],maerchen0:[286,512],maerchen1:[243,512],maerchen2:[512,507],maerchen3:[487,512],maerchen5:[512,453],maerchen6:[481,512],maerchen7:[512,493],wald0:[512,415],wald1:[484,512],wald2:[512,504],wald3:[493,512],wald4:[391,512],wald5:[491,512],wald6:[512,472],wald7:[512,483],buch0:[512,419],buch1:[512,497],buch2:[491,512],buch3:[512,449],buch4:[512,456],buch5:[512,432],buch6:[512,420],buch7:[512,450],muster0:[512,497],muster1:[512,319],muster2:[512,479],muster3:[512,494],muster4:[512,497],muster5:[512,500],muster6:[512,402],muster7:[504,512],geo0:[512,506],geo1:[507,512],geo2:[251,512],geo3:[508,512],geo4:[512,457],geo5:[502,512],geo7:[496,512],zahl0:[512,314],zahl1:[512,453],zahl2:[512,273],zahl3:[512,506],zahl4:[512,343],zahl5:[512,509],zahl6:[508,512],zahl7:[512,469],space0:[471,512],space1:[512,398],space2:[503,512],space3:[409,512],space4:[512,495],space5:[512,350],space6:[490,512],space7:[512,494],candy0:[512,497],candy1:[466,512],candy2:[512,508],candy3:[432,512],candy4:[502,512],candy5:[489,512],candy6:[512,487],candy7:[432,512],lava0:[512,472],lava1:[512,451],lava2:[512,477],lava3:[512,470],lava4:[512,507],lava5:[465,512],lava6:[512,489],lava7:[512,475],ice0:[498,512],ice1:[481,512],ice2:[493,512],ice3:[512,332],ice4:[460,512],ice5:[512,299],ice6:[423,512],ice7:[512,475],beach0:[512,482],beach1:[469,512],beach2:[412,512],beach3:[512,480],beach4:[512,405],beach5:[435,512],beach6:[512,497],beach7:[408,512],grass0:[512,508],grass1:[503,512],grass2:[512,488],grass3:[512,457],grass4:[509,512],grass5:[512,463],grass6:[512,502],grass7:[512,506],kueste0:[474,512],kueste1:[512,503],kueste2:[501,512],kueste3:[320,512],kueste4:[512,360],kueste5:[504,512],kueste6:[482,512],kueste7:[512,507],park0:[512,512],park1:[512,392],park2:[412,512],park3:[512,506],park4:[512,437],park5:[512,442],park6:[511,512],park7:[507,512],riviera0:[512,511],riviera1:[486,512],riviera2:[512,482],riviera3:[512,508],riviera4:[512,471],riviera5:[512,464],riviera6:[512,499],riviera7:[512,434],lavendel0:[506,512],lavendel1:[512,475],lavendel2:[512,496],lavendel3:[505,512],lavendel4:[512,502],lavendel5:[512,443],lavendel6:[512,493],lavendel7:[512,496],paris0:[385,512],paris1:[512,499],paris2:[512,498],paris3:[346,512],paris4:[512,493],paris5:[512,374],paris6:[512,429],paris7:[498,512],neon0:[512,419],neon1:[512,502],neon2:[512,501],neon3:[512,411],neon4:[431,512],neon5:[512,481],neon6:[512,239],neon7:[512,367],hof0:[512,479],hof1:[498,512],hof2:[512,464],hof3:[512,507],hof4:[512,505],hof5:[491,512],hof6:[441,512],hof7:[506,512],fluss0:[512,504],fluss1:[512,482],fluss2:[512,491],fluss3:[512,506],fluss4:[512,437],fluss5:[443,512],fluss6:[512,508],fluss7:[504,512],dschungel0:[512,471],dschungel1:[465,512],dschungel2:[512,507],dschungel3:[512,442],dschungel4:[512,462],dschungel5:[495,512],dschungel6:[512,500],dschungel7:[512,433],chip0:[512,486],chip1:[496,512],chip2:[498,512],chip3:[509,512],chip4:[512,468],chip5:[512,440],chip6:[512,508],chip7:[512,361],robo0:[512,468],robo1:[512,441],robo2:[512,483],robo3:[476,512],robo4:[512,342],robo5:[512,480],robo6:[512,493],robo7:[512,484]};var Vc={grass0:[384,366],grass1:[380,384],grass2:[378,384],grass3:[384,374],grass4:[384,363],grass5:[384,381],grass6:[365,384],grass7:[384,383],wald0:[384,377],wald1:[377,384],wald2:[384,377],wald3:[377,384],wald4:[384,374],wald5:[374,384],wald6:[384,374],wald7:[374,384],dschungel0:[384,375],dschungel1:[384,378],dschungel2:[384,375],dschungel3:[383,384],dschungel4:[384,367],dschungel5:[384,374],dschungel6:[384,360],dschungel7:[382,384],beach0:[384,362],beach1:[384,365],beach2:[362,384],beach3:[365,384],beach4:[384,362],beach5:[384,365],beach6:[362,384],beach7:[365,384],ice0:[374,384],ice1:[383,384],ice2:[384,374],ice3:[384,383],ice4:[374,384],ice5:[383,384],ice6:[384,374],ice7:[384,383],park0:[381,384],park1:[384,377],park2:[384,384],park3:[384,383],park4:[384,380],park5:[376,384],park6:[384,384],park7:[384,381],candy0:[384,369],candy1:[384,376],candy2:[384,361],candy3:[383,384],candy4:[384,369],candy5:[384,378],candy6:[384,364],lavendel0:[384,374],lavendel1:[371,384],lavendel2:[384,361],lavendel3:[381,384],lavendel4:[384,367],lavendel5:[384,371],lavendel6:[384,377],lavendel7:[384,382],fuss0:[384,229],fuss1:[384,284],fuss2:[384,283],lava0:[384,377],lava1:[384,380],lava2:[384,384],mond0:[381,384],mond1:[384,378],mond2:[384,367],mond3:[384,371]};var Ne=document,pe=null,Re=(n,t)=>(t||Ne).querySelector(n),rh=11,st=()=>(rh=rh*16807%2147483647)/2147483647,fn=(n,t,e)=>n+(t-n)*e,Ue=(n,t,e)=>Math.max(t,Math.min(e,n)),as=(n,t)=>{let e=Math.sin(n*127.1+t*311.7)*43758.5453;return e-Math.floor(e)};function fi(n,t){let e=Math.floor(n),i=Math.floor(t),s=n-e,r=t-i,a=s*s*(3-2*s),o=r*r*(3-2*r);return fn(fn(as(e,i),as(e+1,i),a),fn(as(e,i+1),as(e+1,i+1),a),o)}var On={mathe:{n:"Mathe",c:"#2f86ff",d:"#1554c4",ic:"+\u2212"},deutsch:{n:"Deutsch",c:"#ff4f8b",d:"#c41e5c",ic:"Aa"},ki:{n:"Internet und KI",c:"#ff8a1f",d:"#d9560a",ic:"shield"},englisch:{n:"Englisch",c:"#13c4d1",d:"#07818e",ic:"EN"},sach:{n:"Sachunterricht",c:"#2fcf63",d:"#118039",ic:"leaf"},franz:{n:"Franz\xF6sisch",c:"#8a5cff",d:"#5532c9",ic:"FR"}},r1=["mathe","deutsch","ki","englisch","sach","franz"],ke={grass:{n:"Blumenwiese",top:["#8fd94f","#84d047","#98df58"],side:"#b8723e",path:"#f3dc9c",pathD:"#e8c97c",rock:["#4f5b63","#5d6a72","#46525a"],fl:"water",lake:.74,foam:"#ffffff",trees:[["#3fb54a","#2e9a3c"],["#7ccf3a","#5fb52a"],["#ffb02e","#f08a12"],["#ff7a2e","#e2561a"]],flowers:["#ff4f8b","#fff36b","#ffffff","#8a5cff","#ff8a1f"],trunk:"#8a5232"},beach:{n:"Sonnenstrand",top:["#ffe08a","#ffd76e","#ffe7a0"],side:"#e0a64e",path:"#fff6d8",pathD:"#ffecb8",rock:["#d9a35a","#e6b46a","#c99245"],fl:"water",lake:.64,foam:"#ffffff",trees:[["#2fbf4a","#23a33c"]],flowers:["#ff7aa8","#ff9a3d","#ffffff","#ffd23a"],trunk:"#b8743e"},ice:{n:"Eiswelt",top:["#f2fbff","#e6f6ff","#ffffff"],side:"#8fcbf5",path:"#c9ecff",pathD:"#b5e3ff",rock:["#7fa8d8","#93b9e6","#6d98cc"],fl:"ice",lake:.72,foam:"#ffffff",trees:[["#1f8a5a","#17734a"]],flowers:["#7fe8ff","#b8f3ff","#ffffff"],trunk:"#6b4a3a"},lava:{n:"Vulkaninsel",top:["#2b2a30","#232228","#33313a"],side:"#18171c",path:"#8a8690",pathD:"#77737e",rock:["#1c1b20","#26252b","#141317"],fl:"lava",lake:.77,foam:"#ffd36b",trees:[["#3a2420","#2a1814"]],flowers:["#ff6a1a","#ffb02e"],trunk:"#2a1814"},candy:{n:"Zuckerland",top:["#ffa6d6","#ffb8de","#ff96cf"],side:"#8a4a2e",path:"#fff4fb",pathD:"#ffd9ee",rock:["#ffffff","#bff3ff","#fff3a8"],fl:"choc",lake:.74,foam:"#ffe3f2",trees:[["#ff4f8b","#ff8a1f"],["#5bc8ff","#8a5cff"],["#ffd23a","#2fcf63"]],flowers:["#ff4f8b","#5bc8ff","#ffd23a","#8a5cff","#2fcf63"],trunk:"#ffffff"},space:{n:"Sternenwelt",top:["#6a58d0","#5b4bbf","#7764dd"],side:"#2a1f66",path:"#d9d3ff",pathD:"#c4bbff",rock:["#3b2f8a","#46389e","#2f2574"],fl:"void",lake:.68,foam:"#c9b8ff",trees:[["#3ff0ff","#ff5ce1"],["#ffe14d","#7dff9a"]],flowers:["#3ff0ff","#ff5ce1","#ffe14d"],trunk:"#ffffff"}};Object.assign(ke,{zahl:{n:"Zahlenwiese",top:["#8fdc4f","#7fd044","#9fe35e"],side:"#b8723e",path:"#fff1c4",pathD:"#ffe39a",rock:["#5d6a72","#4f5b63"],fl:"water",lake:.78,foam:"#ffffff",trees:[["#3fb54a","#2e9a3c"],["#ffd23a","#f2a900"]],flowers:["#2f86ff","#ff4f8b","#ffd23a"],trunk:"#8a5232"},geo:{n:"Formenw\xFCste",top:["#ffd98a","#ffcf73","#ffe3a3"],side:"#e0a64e",path:"#fff6dc",pathD:"#ffeebe",rock:["#e6b46a","#d9a35a"],fl:"water",lake:.8,foam:"#ffffff",trees:[["#2f86ff","#ff4f8b"]],flowers:["#ff8a1f","#2fcf63","#8a5cff"],trunk:"#b8743e"},buch:{n:"B\xFCcherwiese",top:["#a6e05a","#97d64c","#b2e86a"],side:"#b8723e",path:"#fff3d6",pathD:"#ffe6b0",rock:["#5d6a72","#4f5b63"],fl:"water",lake:.78,foam:"#ffffff",trees:[["#ff8ab5","#ff5c97"],["#3fb54a","#2e9a3c"]],flowers:["#ff4f8b","#ffffff","#ffd23a"],trunk:"#8a5232"},wald:{n:"Buchstabenwald",top:["#5fc048","#54b33f","#6acb52"],side:"#8a5232",path:"#f3dc9c",pathD:"#e8c97c",rock:["#4f5b63","#5d6a72"],fl:"water",lake:.8,foam:"#ffffff",trees:[["#1f9a4a","#17803c"],["#2fb35a","#23994a"]],flowers:["#ff4f8b","#ffd23a"],trunk:"#6b4226"},london:{n:"London",top:["#8fd36a","#84c95f","#98da74"],side:"#9a8f86",path:"#e9e6e1",pathD:"#d9d5cf",rock:["#8d8a86","#a09d98"],fl:"water",lake:.8,foam:"#ffffff",trees:[["#2e9a3c","#23802f"]],flowers:["#e2231a","#ffffff","#1a3d8f"],trunk:"#5a3a26"},park:{n:"K\xF6nigspark",top:["#9be070","#8fd664","#a6e67c"],side:"#b8723e",path:"#f1e3c4",pathD:"#e6d4ad",rock:["#8d8a86"],fl:"water",lake:.74,foam:"#ffffff",trees:[["#2e9a3c","#23802f"],["#3fb54a","#2e9a3c"]],flowers:["#e2231a","#ffffff","#1a3d8f","#ffd23a"],trunk:"#5a3a26"},paris:{n:"Paris",top:["#e9e1d3","#ddd4c4","#f2ebdf"],side:"#b8a68a",path:"#fff8ea",pathD:"#f3e8d2",rock:["#c9bba3"],fl:"water",lake:.8,foam:"#ffffff",trees:[["#3fb54a","#2e9a3c"]],flowers:["#ff4f8b","#ffffff","#2f86ff"],trunk:"#6b4a3a"},lavendel:{n:"Lavendelfelder",top:["#9fd86a","#93cf5e","#aade78"],side:"#b8723e",path:"#fff1d0",pathD:"#ffe5ae",rock:["#c9bba3"],fl:"water",lake:.8,foam:"#ffffff",trees:[["#3fb54a","#2e9a3c"]],flowers:["#9b6cff","#b48cff","#ffd23a"],trunk:"#6b4a3a"},dschungel:{n:"Dschungel",top:["#4fbf45","#45b03c","#5acb50"],side:"#7a4a26",path:"#e8c98a",pathD:"#d9b672",rock:["#5d6a72","#4f5b63"],fl:"water",lake:.72,foam:"#ffffff",trees:[["#1f9a4a","#45d06a"],["#17803c","#2fb35a"]],flowers:["#ff4f8b","#ff8a1f","#ffd23a"],trunk:"#6b4226"},fluss:{n:"Flussufer",top:["#8fd94f","#84d047","#98df58"],side:"#b8723e",path:"#f3dc9c",pathD:"#e8c97c",rock:["#5d6a72","#4f5b63"],fl:"water",lake:.64,foam:"#ffffff",trees:[["#3fb54a","#2e9a3c"],["#7ccf3a","#5fb52a"]],flowers:["#ffffff","#ffd23a"],trunk:"#8a5232"},neon:{n:"Datenwolke",top:["#b9bcc4","#aeb1ba","#c4c7ce"],side:"#6d7079",path:"#eef6ff",pathD:"#dbe8f7",rock:["#8c8f98","#7d8089"],fl:"void",lake:.8,foam:"#ffffff",trees:[["#3ff0ff","#ff5ce1"],["#7dff9a","#ffe14d"]],flowers:["#3ff0ff","#ff5ce1"],trunk:"#ffffff"},chip:{n:"Chip-Land",top:["#a9acb5","#9fa2ab","#b4b7bf"],side:"#62656e",path:"#e8f4ff",pathD:"#d4e6f7",rock:["#7f828b","#70737c"],fl:"void",lake:.8,foam:"#7dff9a",trees:[["#22262e","#3ff0ff"]],flowers:["#ffd23a","#3ff0ff"],trunk:"#c9cdd6"}});Object.assign(ke,{muster:{...ke.zahl,n:"Musterland",top:["#9fe36a","#ffe08a","#9fe36a","#8fd4ff"],lake:.82},maerchen:{...ke.wald,n:"M\xE4rchenwald",top:["#7fcf5a","#74c44f","#8ad865"],trees:[["#b48cff","#8a5cff"],["#1f9a4a","#17803c"],["#ff8ab5","#ff5c97"]]},kueste:{...ke.beach,n:"Englische K\xFCste",top:["#a6e07a","#9bd66e","#ffe7a0"],trees:[["#2e9a3c","#23802f"]]},riviera:{...ke.beach,n:"C\xF4te d\u2019Azur",lake:.6},hof:{...ke.grass,n:"Bauernhof",top:["#a6e05a","#9cd84e","#e8c97c"],trees:[["#3fb54a","#2e9a3c"],["#ff7a2e","#e2561a"]]},robo:{...ke.neon,n:"Roboter-Werkstatt",top:["#c2c4cb","#b6b9c0","#cccfd5"],side:"#73767f",rock:["#94979f","#878a92"]}});var oe=["grass","beach","ice","lava","candy","maerchen"],Vt=44,bn=32,oo=22,Di=6,qn=bn*6+30,rs,yn;function a1(){rs=Re(".gw-cv"),yn=new Na({canvas:rs,antialias:!0}),yn.setPixelRatio(Math.min(devicePixelRatio,innerWidth>900?2:1.75)),yn.shadowMap.enabled=!0,yn.shadowMap.type=Tc,yn.outputColorSpace=fe,yn.toneMapping=Hn}var Le=new Oa;Le.background=new At("#3aa0e8");var hn=new He(30,1,1,300),Av=new R(0,1,1e-4).normalize(),yu=40,o1=new $a("#ffffff","#9fc4ff",.9);Le.add(o1);var be=new Ke;Le.add(be);var pi=new Ja("#fff6e6",2.5);pi.castShadow=!0;pi.shadow.mapSize.set(2048,2048);pi.shadow.bias=-8e-4;pi.shadow.normalBias=.03;Object.assign(pi.shadow.camera,{left:-30,right:30,top:34,bottom:-34,near:1,far:90});Le.add(pi,pi.target);var Yn=n=>-(14+n*bn),Ht=new Map,ue=(n,t)=>n+","+t,Zt=[],l1=(n,t)=>Ue(Math.floor((t-14+(fi(n*.2,t*.2)-.5)*10+(as(n,t)-.5)*2.5)/bn),0,oe.length-1);function c1(){for(let n=0;n<qn;n++){let t=-n,e=1+Math.round(fi(n*.22,3)*2.6),i=Vt-2-Math.round(fi(n*.22+40,9)*2.6);for(let s=0;s<Vt;s++){let r=l1(s,n),a=oe[r],o=n<1||n>qn-2;Ht.set(ue(s,t),{h:1,t:"land",b:a,ci:r})}}for(let n=0;n<2;n++){let t=new Map;for(let[e,i]of Ht){let[s,r]=e.split(",").map(Number),a={};for(let l=-2;l<=2;l++)for(let c=-2;c<=2;c++){let h=Ht.get(ue(s+l,r+c));h&&(a[h.b]=(a[h.b]||0)+1)}let o=i.b;for(let l in a)a[l]>a[o]&&(o=l);o!==i.b&&a[i.b]<9&&t.set(i,o)}for(let[e,i]of t)e.b=i,e.ci=oe.indexOf(i)}for(let n=0;n<qn;n++)for(let t=0;t<Vt;t++){let e=Ht.get(ue(t,-n));if(e.t!=="land")continue;let i=fi(t*.22+30,n*.22+7),s=ke[e.b];i>s.lake&&(s.fl==="lava"&&Fn[e.b]?e.lp=1:e.t=s.fl==="lava"?"lava":"water"),e.b==="lava"&&as(t*3,n*5)>.965&&!Fn.lava&&(e.t="lava");let r=fi(t*.3+100,n*.3+50);e.t==="land"&&(r>.56&&(e.h=2),r>.7&&(e.h=3),r>.82&&!_n[e.b+"0"]&&(e.rock=1+Math.floor((r-.82)*25)))}}function h1(){let n=Math.floor(Vt/2),t=-14,e=1,i=-(qn-14),s=(Vt-oo)/2+2,r=(Vt+oo)/2-3;for(Zt.push([n,t]);t>i;){if(st()<.55){let o=3+Math.floor(st()*5);e=n<s+3?1:n>r-3||st()<.5?-1:1;for(let l=0;l<o&&n+e>s&&n+e<r;l++)n+=e,Zt.push([n,t])}let a=2+Math.floor(st()*3);for(let o=0;o<a&&t>i;o++)t--,Zt.push([n,t])}for(let[a,o]of Zt){let l=Ht.get(ue(a,o));l.t="path",l.h=1,l.rock=0}for(let[a,o]of Zt)for(let l=-1;l<=1;l++)for(let c=-1;c<=1;c++){let h=Ht.get(ue(a+l,o+c));h&&h.t!=="path"&&(h.t!=="land"&&Math.abs(l)+Math.abs(c)===1&&(h.t="land"),h.t==="land"&&(h.rock=0,h.h=1,h.clear=1))}}function xu(n=1,t=1,e=1){let i=new an(n,t,e),s=i.attributes.position,r=i.attributes.normal,a=new Float32Array(s.count*3);for(let o=0;o<s.count;o++){let l=r.getY(o),c=s.getY(o)/t+.5,h=l>.5?1:l<-.5?.5:fn(.62,.84,c);r.getX(o)>.5&&(h*=.92),r.getZ(o)>.5&&(h*=1),a[o*3]=a[o*3+1]=a[o*3+2]=h}return i.setAttribute("color",new Ee(a,3)),i}var Mu=xu(),f1=new Xe({vertexColors:!0}),dh=[],X=(n,t,e,i,s,r,a,o="b")=>dh.push([n,t,e,i,s,r,a,o]),Ir=(n,t)=>{let e=new At(n),i={};return e.getHSL(i),e.setHSL(i.h,i.s,Ue(i.l+t,0,1)),e},bu=[];var Fn={grass:"gras",park:"gras",london:"gras",zahl:"raster",buch:"gras",muster:"bunt",geo:"formen",wald:"tanne",maerchen:"moos",dschungel:"jungel",fluss:"moos",hof:"acker",lavendel:"lav",paris:"stadt",beach:"sand",riviera:"sand",kueste:"sand",ice:"schnee",candy:"candy",lava:"lava",space:"lila",neon:"mond",chip:"mond",robo:"mond"},lo=[],Gc={};function u1(n){if(Gc[n])return Gc[n];let t=new is,e=[0,0,0].map(s=>{let r=t.load("/grundschulmax/tex/"+n+s+".webp");return r.wrapS=r.wrapT=ks,r.colorSpace=fe,r.anisotropy=8,r}),i=new Xe({map:e[0]});return i.onBeforeCompile=s=>{s.uniforms.t1={value:e[1]},s.uniforms.t2={value:e[2]},s.vertexShader=s.vertexShader.replace("#include <common>",`#include <common>
varying vec3 vWP; attribute float aG; varying float vG;`).replace("#include <worldpos_vertex>",`#include <worldpos_vertex>
vWP = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz; vG = aG;`),s.fragmentShader=s.fragmentShader.replace("#include <common>",`#include <common>
varying vec3 vWP; varying float vG; uniform sampler2D t1; uniform sampler2D t2;
float gh(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }`).replace("#include <map_fragment>",`vec2 wz = vec2(vWP.x, -vWP.z); vec4 tc = texture2D(map, wz / ${({lava:18,schnee:18,stadt:9,pfad:3.5,bunt:6,formen:7,raster:9}[n]||9).toFixed(2)}); diffuseColor *= tc;`)},Gc[n]=i}function d1(){let n={};for(let s of lo){let r=Fn[s[3]]||s[3];(n[r]=n[r]||[]).push(s)}let t=new mn(1,1).rotateX(-Math.PI/2),e=new _e,i=new At;for(let s in n){let r=n[s],a=t,o=new Float32Array(r.length),l=s==="lava"?[...ah.map(h=>[h[0],h[1],2.6]),...bu.filter(h=>/^lava[07]$/.test(h[0])).map(h=>[h[1],h[2],5.5]),...je.x>-900?[[je.x,je.z,8]]:[]]:[];r.forEach(([h,,f],u)=>{let d=0;for(let[g,_,m]of l){let p=Math.hypot(g-h,_-f);p<m&&(d=Math.max(d,1-p/m))}o[u]=d}),a=t.clone(),a.setAttribute("aG",new Vs(o,1));let c=new Gn(a,u1(s),r.length);r.forEach(([h,f,u],d)=>{e.position.set(h,f+.004,u),e.updateMatrix(),c.setMatrixAt(d,e.matrix),i.setRGB(1,1,1),c.setColorAt(d,i)}),c.receiveShadow=!0,be.add(c)}lo.length=0,ah.length=0}function p1(){for(let[n,t]of Ht){let[e,i]=n.split(",").map(Number),s=ke[t.b],r=e-Vt/2+.5;if(t.t==="water")continue;if(t.t==="lava"&&Fn[t.b]){ah.push([r,i]),X(r,.35,i,1,1.7,1,s.side),X(r,.85,i,1,.3,1,s.top[0]),lo.push([r,1,i,t.b]);continue}if(t.t==="lava"){X(r,-.2,i,1,1.4,1,s.side),di.push([r,i]);continue}let a=s.top[Math.floor(as(e,i)*s.top.length)],o=t.h;X(r,(o-1.3)/2,i,1,o+.7,1,{gras:"#3f8a0c",mond:"#8a8e98",lila:"#7a68b8",sand:"#d99a2c",schnee:"#a9c8ec",candy:"#e0609a",tanne:"#3c6a12",pilz:"#3f7a10",jungel:"#1f6a12",moos:"#3f7a10",acker:"#7a3a12",lav:"#c46a22",stadt:"#9e9283",raster:"#4fae4f",papier:"#c9b98f",bunt:"#d4b07a",formen:"#3f9a40",lava:s.side}[Fn[t.b]]||s.side),X(r,o-.15,i,1,.3,1,Ir(a,(o-1)*.055)),Fn[t.b]&&lo.push([r,o,i,t.b,t.b])}}var di=[],ah=[];function m1(n,t,e,i,s){let[r,a]=i.trees[Math.floor(st()*i.trees.length)],o=.8+st()*.35;if(s==="lava"){X(n,t+.55*o,e,.22*o,1.1*o,.22*o,i.trunk),X(n+.2*o,t+.9*o,e,.4*o,.14*o,.14*o,i.trunk),X(n-.15*o,t+.7*o,e+.1,.12*o,.12*o,.34*o,i.trunk);return}if(s==="beach"){for(let f=0;f<4;f++)X(n+f*.07,t+.2+f*.35,e-f*.05,.2,.38,.2,f%2?i.trunk:Ir(i.trunk,.06));let l=n+.25,c=t+1.55,h=e-.2;X(l,c,h,1.7*o,.12,.34,r),X(l,c,h,.34,.12,1.7*o,r),X(l+.3,c-.1,h+.3,.9,.1,.3,a),X(l-.3,c-.1,h-.3,.3,.1,.9,a),X(l,c+.08,h,.4,.2,.4,Ir(r,.05)),st()<.6&&(X(l+.12,c-.18,h+.1,.18,.18,.18,"#8a5232","s"),X(l-.1,c-.2,h+.14,.18,.18,.18,"#7a4426","s"));return}if(s==="ice"){X(n,t+.15,e,.18,.3,.18,i.trunk),X(n,t+.75*o,e,1*o,1*o,1*o,r,"k"),X(n,t+1.35*o,e,.7*o,.8*o,.7*o,Ir(r,.04),"k"),X(n,t+1.72*o,e,.34*o,.42*o,.34*o,"#ffffff","k");return}if(s==="candy"){X(n,t+.55,e,.12,1.1,.12,"#ffffff","c"),X(n,t+1.2,e,.9*o,.26,.9*o,r,"c"),X(n,t+1.34,e,.55*o,.04,.55*o,a,"c"),X(n,t+1.37,e,.22*o,.04,.22*o,"#ffffff","c");return}if(s==="geo"){let l=["#2f86ff","#ff4f8b","#ffd23a","#2fcf63","#8a5cff","#ff8a1f"],c=l[Math.floor(st()*6)],h=Math.floor(st()*4);h===0?X(n,t+.55,e,1,1.1,1,c,"k"):h===1?X(n,t+.45,e,.9,.9,.9,c,"s"):h===2?X(n,t+.45,e,.8,.9,.8,c):X(n,t+.5,e,.8,1,.8,c,"c");return}if(s==="wald"||s==="neon"&&!1){X(n,t+.15,e,.18,.3,.18,i.trunk),X(n,t+.9*o,e,1*o,1.5*o,1*o,r,"k"),X(n,t+1.6*o,e,.66*o,1*o,.66*o,a,"k");return}if(s==="london"||s==="paris"){X(n,t+.35,e,.14,.7,.14,i.trunk),X(n,t+1,e,.85*o,.85*o,.85*o,r,"s");return}if(s==="dschungel"){X(n,t+.6,e,.3,1.2,.3,i.trunk),X(n,t+1.35,e,1.4*o,.9*o,1.4*o,r,"s"),X(n+.3,t+1.7,e-.2,.9*o,.7*o,.9*o,a,"s");return}if(s==="neon"){X(n,t+.45,e,.9,.9,.9,"#ffffff","s"),X(n+.35,t+.35,e+.1,.7,.7,.7,"#f2f8ff","s"),X(n-.35,t+.3,e,.6,.6,.6,"#eef6ff","s");return}if(s==="chip"){X(n,t+.18,e,.9,.36,.9,r);for(let l of[-.3,0,.3])X(n+l,t+.06,e+.55,.1,.1,.22,i.trunk),X(n+l,t+.06,e-.55,.1,.1,.22,i.trunk),X(n+.55,t+.06,e+l,.22,.1,.1,i.trunk),X(n-.55,t+.06,e+l,.22,.1,.1,i.trunk);X(n-.25,t+.38,e-.25,.12,.04,.12,a);return}if(s==="space"){let l=2+Math.floor(st()*3);for(let c=0;c<l;c++){let h=.6+st()*1.1,f=(st()-.5)*.5,u=(st()-.5)*.5;X(n+f,t+h/2,e+u,.22,h,.22,c%2?r:a),X(n+f,t+h+.06,e+u,.12,.12,.12,"#ffffff")}return}X(n,t+.25*o,e,.24*o,.5*o,.24*o,i.trunk),X(n,t+.75*o,e,.8*o,.6*o,.8*o,r),X(n,t+1.2*o,e,.54*o,.4*o,.54*o,a)}function g1(n,t,e,i,s){let r=st();if(n==="beach")return r<.05?(X(t,e+.06,i,.3,.08,.3,"#ff9a3d"),X(t,e+.08,i,.1,.1,.5,"#ff9a3d"),X(t,e+.08,i,.5,.1,.1,"#ff9a3d")):r<.09?X(t,e+.12,i,.26,.2,.2,"#ffc1d6","s"):r<.11?X(t,e+.25,i,.5,.5,.5,["#ff4f8b","#2f86ff","#ffd23a"][Math.floor(st()*3)],"s"):r<.118&&(X(t,e+.7,i,.07,1.4,.07,"#ffffff","c"),X(t,e+1.4,i,1.1,.12,1.1,st()<.5?"#ff4f8b":"#2fbfff","c"),X(t,e+1.47,i,.3,.06,.3,"#ffffff","c")),!0;if(n==="ice")return r<.03?(X(t,e+.3,i,.62,.6,.62,"#ffffff","s"),X(t,e+.8,i,.44,.44,.44,"#ffffff","s"),X(t,e+.82,i+.22,.08,.08,.2,"#ff8a1f")):r<.09&&(X(t,e+.3,i,.2,.6,.2,"#7fe8ff"),X(t+.15,e+.2,i+.1,.14,.4,.14,"#b8f3ff")),!0;if(n==="candy")return r<.04?X(t,e+.18,i,.4,.36,.4,s.flowers[Math.floor(st()*5)],"s"):r<.06?(X(t,e+.12,i,.7,.2,.7,"#ffcf8a","c"),X(t,e+.24,i,.62,.06,.62,"#ff7ab8","c"),X(t,e+.27,i,.2,.05,.2,s.top[0],"c")):r<.12&&(X(t,e+.3,i,.5,.6,.5,"#ff6f9f","c"),X(t,e+.7,i,.56,.3,.56,"#ffffff","s"),X(t,e+.9,i,.14,.14,.14,"#ff2d55","s")),!0;if(n==="zahl"){if(r<.035){X(t,e+.26,i,.5,.5,.5,"#ffffff");let a=1+Math.floor(st()*6),o=[[0,0],[-.13,-.13],[.13,.13],[-.13,.13],[.13,-.13],[-.13,0],[.13,0]];({1:[0],2:[1,2],3:[0,1,2],4:[1,2,3,4],5:[0,1,2,3,4],6:[1,2,3,4,5,6]})[a].forEach(c=>X(t+o[c][0],e+.52,i+o[c][1],.08,.03,.08,"#1d1b26"))}else if(r<.07){let a=1+Math.floor(st()*4),o=["#ff4f4f","#ff9a1f","#ffd23a","#2fcf63","#2f86ff"][a];for(let l=0;l<a;l++)X(t,e+.22+l*.44,i,.44,.42,.44,o);X(t-.1,e+.2+a*.44,i+.23,.08,.08,.02,"#ffffff"),X(t+.1,e+.2+a*.44,i+.23,.08,.08,.02,"#ffffff")}else if(r<.085){X(t-.45,e+.4,i,.08,.8,.08,"#8a5232"),X(t+.45,e+.4,i,.08,.8,.08,"#8a5232");for(let a=0;a<2;a++){X(t,e+.35+a*.3,i,.9,.04,.04,"#8a5232");for(let o=0;o<4;o++)X(t-.3+o*.2,e+.35+a*.3,i,.16,.16,.16,["#ff4f8b","#2f86ff","#ffd23a","#2fcf63"][o],"s")}}return!0}if(n==="geo"){if(r<.03){X(t,e+.04,i,1.4,.06,.26,"#ffd23a");for(let a=0;a<6;a++)X(t-.6+a*.24,e+.08,i-.06,.03,.03,.12,"#1d1b26")}else r<.05&&X(t,e+.1,i,.7,.2,.7,"#2fcf63","k");return!0}if(n==="buch"||n==="wald"){if(r<.04){let a=2+Math.floor(st()*3);for(let o=0;o<a;o++){let l=["#e2231a","#2f86ff","#2fcf63","#ffd23a","#8a5cff"][Math.floor(st()*5)];X(t+(st()-.5)*.1,e+.08+o*.16,i,.7,.14,.5,l),X(t+.02,e+.08+o*.16,i+.26,.62,.1,.02,"#ffffff")}}else r<.065?(X(t,e+.1,i,1.1,.16,.16,"#ffd23a"),X(t+.62,e+.1,i,.14,.16,.16,"#ff8ab5"),X(t-.6,e+.1,i,.1,.1,.1,"#f3c99a","k")):r<.09?X(t,e+.22,i,.42,.42,.42,["#ff4f8b","#2f86ff","#ffd23a","#2fcf63","#ff8a1f"][Math.floor(st()*5)]):n==="wald"&&r<.12&&(X(t,e+.15,i,.1,.3,.1,"#fff3e0","c"),X(t,e+.32,i,.34,.18,.34,"#ff3b30","s"));return!0}if(n==="london"||n==="park")return r<.05?(X(t,e+.8,i,.08,1.6,.08,"#22262e"),X(t,e+1.65,i,.22,.22,.22,"#ffe14d","s")):r<.08&&X(t,e+.3,i,.9,.6,.9,"#2e9a3c"),!0;if(n==="paris"||n==="lavendel")return n==="lavendel"&&Math.round(t)%2===0&&fi(t*.25+9,i*.25)>.64?(X(t,e+.18,i,.6,.36,.8,st()<.5?"#9b6cff":"#8a5cff"),!0):(r<.045?X(t,e+.1,i,.9,.16,.18,"#e8b56a"):n==="lavendel"&&r<.09&&(X(t,e+.45,i,.08,.9,.08,"#2e9a3c"),X(t,e+.95,i,.5,.1,.5,"#ffd23a","c"),X(t,e+1,i,.2,.06,.2,"#7a4426","c")),!0);if(n==="dschungel"||n==="fluss"){if(r<.05)X(t,e+.15,i,1.2,.1,.26,"#2fb35a"),X(t,e+.15,i,.26,.1,1.2,"#23994a");else if(r<.06)X(t,e+.2,i,.4,.4,.4,"#ffd23a","s"),X(t+.24,e+.2,i,.14,.08,.14,"#ff8a1f");else if(r<.09&&n==="fluss")for(let a=0;a<3;a++)X(t+(st()-.5)*.5,e+.4,i+(st()-.5)*.5,.06,.8,.06,"#5fb52a");return!0}return n==="neon"||n==="chip"?(r<.06?X(t,e+.03,i,1,.04,.12,n==="chip"?"#ffd25a":"#9fc4ff"):r<.09&&X(t,e+.05,i,.14,.1,.14,["#2fcf63","#ff4f8b","#ffd23a","#2f86ff"][Math.floor(st()*4)],"s"),!0):n==="space"?(r<.006?(X(t,e+1.6,i,.7,.7,.7,["#ff8a1f","#2fcf63","#ff5ce1"][Math.floor(st()*3)],"s"),X(t,e+1.6,i,1.25,.05,1.25,"#ffe14d","c")):r<.07?X(t,e+.05,i,.7,.08,.7,"#3b2f8a","c"):r<.12&&X(t+(st()-.5)*.6,e+.06,i+(st()-.5)*.6,.1,.12,.1,"#ffffff"),!0):!1}function _1(){let n=oe.indexOf("lava");if(n<0)return;let t=Yn(n)-18,e=-7,i=-1;for(let s=Yn(n)-10;s>Yn(n)-bn+8;s--)for(let r=-12;r<=12;r++){let a=1e9;for(let[l,c]of Zt)a=Math.min(a,Math.hypot(l-Vt/2+.5-r,c-s));let o=Math.min(a,9)-Math.abs(r)*.25;a>6.5&&o>i&&(i=o,e=r,t=s)}for(let s=-5;s<=5;s++)for(let r=-5;r<=5;r++){let a=Ht.get(ue(Math.round(e+Vt/2-.5)+s,t+r));a&&a.t!=="path"&&(a.t="land",a.rock=0,a.h=1,a.clear=1,a.vol=1)}je.set(e,0,t)}var je=new R,Wc={},Oi=[];function Su(n){return n[0]==="D"&&n.length===2?su(+n[1]):n[0]==="S"&&n.length===2?ru(+n[1]):iu[n]}function v1(n){if(Wc[n])return Wc[n];let[,,t,e,i]=Su(n),s=document.createElement("canvas");s.width=e,s.height=i;let r=s.getContext("2d");r.lineJoin="round";try{t(r)}catch{}let a=new on(s);return a.colorSpace=fe,a.anisotropy=8,Wc[n]=a}function y1(){Oi.length=0}var Ks=[],$s={},no={lava:"lava",space:"mond",neon:"mond",chip:"mond",robo:"mond",grass:"grass",hof:"grass",maerchen:"grass",buch:"grass",kueste:"grass",zahl:"grass",geo:"grass",muster:"grass",park:"park",london:"park",paris:"park",lavendel:"lavendel",riviera:"lavendel",dschungel:"dschungel",fluss:"dschungel",candy:"candy",wald:"wald",ice:"ice",beach:"beach"},Ys=[];function x1(){let n={};for(let i of Ys)(n[i[0]]=n[i[0]]||[]).push(i);let t=new mn(1,1).rotateX(-Math.PI/2),e=new _e;for(let i in n){let s=n[i],[r,a]=Vc[i],o=new xe({map:M1(i),transparent:!0,alphaTest:.05,depthWrite:!1}),l=new Gn(t,o,s.length);s.forEach(([,c,h,f,u],d)=>{e.position.set(c,h+.02+d*4e-4,f),e.rotation.set(0,0,0),e.scale.set(u*r/384,1,u*a/384),e.updateMatrix(),l.setMatrixAt(d,e.matrix)}),l.renderOrder=1,be.add(l)}Ys.length=0}function M1(n){let t="t_"+n;if($s[t])return $s[t];let e=new is().load("/grundschulmax/tree/"+n+".webp");return e.colorSpace=fe,e.anisotropy=8,$s[t]=e}var b1={london4:1,london7:1,wald7:1,grass6:1,geo2:1,riviera2:1,neon0:1,robo7:1,riviera5:1,park2:1,park6:1,kueste6:1,fluss7:1,riviera0:1,fluss0:1,fluss5:1,buch6:1,buch5:1,buch4:1,dschungel1:1,neon7:1,riviera6:1,park4:1,geo0:1,geo7:1,geo5:1,space7:1,lava1:1,london3:1},S1={grass:[3,1,6,4],beach:[1,2,4],ice:[1,2,6],lava:[0,2,6],candy:[2,3,6],space:[0,3,2],zahl:[5,0,2],geo:[1,6,3],muster:[1,6,7],buch:[1,0,3],wald:[2,1,5,0],maerchen:[0,2,7],london:[6,0,5,2,1],kueste:[1,0,5],park:[0,5,7],paris:[4,2,0,5],lavendel:[1,5,0],riviera:[4,1,3],dschungel:[6,4,7],fluss:[4,1,6],hof:[0,1,5],neon:[2,5,6],chip:[1,4,7],robo:[0,1,6]},w1={},E1={};var Ar={};var Xc={lava0:"v",lava7:"v",grass4:"w",park0:"w",fluss6:"w",kueste5:"w",lavendel7:"w",candy4:"w",geo3:"w",maerchen3:"w",dschungel4:"w",ice7:"w",grass3:"h",lavendel1:"h",hof0:"h",paris2:"h",london4:"h",kueste1:"h",candy2:"h",maerchen2:"h",wald1:"h",buch1:"h",geo1:"h",zahl5:"h",ice1:"h",lava4:"k",ice4:"k",space6:"k",neon1:"k",grass0:"t",lavendel4:"t",hof6:"t",dschungel0:"t",beach0:"t",riviera1:"u",beach2:"u",riviera4:"u",hof2:"y",hof1:"y"};function T1(n){if($s[n])return $s[n];let t=new is().load("/grundschulmax/obj2/"+n+".webp");return t.colorSpace=fe,t.anisotropy=8,$s[n]=t}function A1(n){let t=(e,i,s)=>{let[r,a]=_n[e];return[i*r/512,i*a/512,s]};if(Ur==="mix"){let e=Zt[hs()],i=Zt[ve[0]],s=Zt[ve[1]]||i,r=(l,c,h,f,u)=>{let d=[];for(let g=-u;g<=u;g++)for(let _=-u;_<=u;_++)d.push([Math.round(l)+g,Math.round(c)+_,Math.hypot(g,_)]);d.sort((g,_)=>g[2]-_[2]);for(let[g,_]of d){let m=Ht.get(ue(g,_));if(!m)continue;let p=!0;for(let x=-h;x<=h&&p;x++)for(let S=-f;S<=f&&p;S++){let P=Ht.get(ue(g+x,_+S));(!P||P.t!=="land"||P.dec||P.vol||P.h!==m.h||P.b!==oe[0])&&(p=!1)}if(!p)continue;let w=1e9;for(let[x,S]of Zt)w=Math.min(w,Math.hypot(x-g,S-_));if(!(w<Math.max(h,f)+.4)){for(let x=-h;x<=h;x++)for(let S=-f;S<=f;S++)Ht.get(ue(g+x,_+S)).dec=1;return[g,_,m.h]}}return null},a=(l,c,h,f,u=0,d=4)=>{if(!_n[l])return null;let[g,_]=t(l,c),m=Math.abs(Math.sin(u))>.5,p=Math.floor((m?_:g)/2),w=Math.floor((m?g:_)/2),x=r(h,f,p,w,4)||r(h,f,Math.max(0,p-1),Math.max(0,w-1),5);return x&&(n.push([l,x[0]-Vt/2+.5,x[1],g,_,x[2],u]),oh.add(l)),x};a("grass5",3.6,e[0]+3,e[1]-2.5);let o=a("london5",3.4,i[0]-3.2,(i[1]+s[1])/2+1.5,.45,2);o&&(wu=[o[0]-Vt/2+.5,o[1]]),a("grass4",3.2,s[0]+3,s[1]+1,0,2)}}var Ur="",oh=new Set,wu=null,R1=0;function lh(){let n=Zn(Ie),t=n.x;ss=qe=n.z-2,Pr=ui=Ue(t,-Mn(),Mn())}var lu={buch:"grass",fluss:"grass",park:"grass",lavendel:"grass",dschungel:"grass",kueste:"beach",riviera:"beach",geo:"muster",robo:"chip",neon:"chip",space:"chip"};function C1(){oh=new Set,wu=null;let n=[];A1(n);let t=(Vt-oo)/2,e=(Vt+oo)/2;for(let i=0;i<oe.length;i++){let s=oe[i],r=s in lu?lu[s]:s;if(r===null&&!(s==="london"&&_n.london5))continue;let a=r===s?(S1[s]||[]).map(g=>s+g):[],l=r===null?["london5"]:_n[r+"0"]?[...Array(8).keys()].map(g=>r+g).filter(g=>!a.includes(g)).sort(()=>st()-.5):[],c=[...a.map(g=>[g,1]),...(w1[s]||[]).map(g=>[g,1]),...l.map(g=>[g,0])];i===0&&c.forEach(g=>g[2]=1);let h=new Set,f={};c.sort((g,_)=>(Ar[g[0]]?1:0)-(Ar[_[0]]?1:0));let u=n.length,d=new Set(["lava0","london5","wald2","london6","paris4","wald1"]);for(let g=0;g<3&&!(g>0&&n.length-u>=5);g++)for(let[_,m]of c){if(g>0&&n.length-u>=5)break;if(!_n[_]||b1[_]||g===0&&h.has(_)||g>0&&d.has(_)||oh.has(_))continue;if(h.add(_),_==="lava0"&&je.x>-900&&s==="lava"){let[I,B]=_n[_],v=7.5;f[_]=[Math.round(je.x+Vt/2-.5),je.z],n.push([_,je.x,je.z,v*I/512,v*B/512]);continue}let[p,w]=_n[_],x=g===2?2:m?3.6:2.7,S=x*p/512,P=x*w/512,T=Math.ceil(S/2),A=Math.ceil(P/2);for(let I=0;I<(g?1200:500);I++){let B=Ar[_]&&f[Ar[_]]&&I<250?f[Ar[_]]:null,v=4+I*.02,b=!B&&I<220&&ve.length?Zt[ve[Math.min(ve.length-1,i*Di+R1++%Di)]]:null,F=st()*6.283,N=T+2.5+st()*3,V=Math.round(B?B[0]+(st()-.5)*2*v:b?b[0]+Math.cos(F)*N:t-2+st()*(e-t+4)),Y=B?Math.round(B[1]+(st()-.5)*2*v):b?Math.round(b[1]+Math.sin(F)*N):Yn(i)-3-Math.floor(st()*(a.includes(_)&&I<300?bn*.4:bn-6)),H=I>300;if(Y>Yn(i)-2||Y<Yn(i)-bn+2)continue;let tt=!0,G=Ht.get(ue(V,Y));if(!G)continue;for(let rt=-T;rt<=T&&tt;rt++)for(let Dt=-A;Dt<=A&&tt;Dt++){let Ut=Ht.get(ue(V+rt,Y+Dt));(!Ut||Ut.t!=="land"||Ut.vol||Ut.dec||Ut.lp&&Ut.h===1||Ut.h!==G.h||Ut.b!==s)&&(tt=!1)}if(!tt||n.some(rt=>Math.hypot(rt[1]-(V-Vt/2+.5),rt[2]-Y)<(g?4:I<380?7.5:5))||Xc[_]&&n.some(rt=>Xc[rt[0]]===Xc[_]&&Math.hypot(rt[1]-(V-Vt/2+.5),rt[2]-Y)<16))continue;let at=1e9;for(let[rt,Dt]of Zt){let Ut=Math.hypot(rt-V,Dt-Y);Ut<at&&(at=Ut)}let ft=m?[T+1,T+5]:[T+1.5,T+9];if(!(!H&&!B&&(at<ft[0]||at>ft[1]))&&!(at<T+.9)){for(let rt=-T;rt<=T;rt++)for(let Dt=-A;Dt<=A;Dt++){let Ut=Ht.get(ue(V+rt,Y+Dt));Ut&&(Ut.dec=1)}f[_]=[V,Y],n.push([_,V-Vt/2+.5,Y,S,P,G.h]);break}}}}return n}function P1(n){let t=new mn(1,1).rotateX(-Math.PI/2);for(let[e,i,s,r,a,o=1,l=0]of n){let c=new xe({map:T1(e),transparent:!0,alphaTest:.03,depthWrite:!1,color:new At(.97,.97,.97)}),h=new kt(t,c);h.scale.set(r,1,a),h.rotation.y=l,h.position.set(i,o+.06,s),h.renderOrder=2,be.add(h),Ks.push({m:h,a:E1[e]||"",X:i,z:s,w:r,h:a,ph:Math.random()*6.28})}}function I1(n){for(let t of Ks){if(!t.a)continue;let e=t.m;if(t.a==="h"){let i=1+Math.sin(n*1.8+t.ph)*.05;e.scale.set(t.w*i,1,t.h*i),e.position.z=t.z+Math.sin(n*1.8+t.ph)*.12}else if(t.a==="b"){let i=1+Math.sin(n*2.2+t.ph)*.025;e.scale.set(t.w*i,1,t.h*i)}else t.a==="s"?e.position.x=t.X+Math.sin(n*.6+t.ph)*.4:t.a==="w"?e.rotation.y=Math.sin(n*2.5+t.ph)*.08:t.a==="r"&&(e.rotation.y=Math.sin(n*.8+t.ph)*.05)}}var cu={},L1={gb:4,fr:4,de:4,ki:7,chatbot:5,brain:7,lupe:5,eiffel:14,tor:11,bigben:12,dom:12,turm:12,towerbridge:10,schloss:11,arc:10,fachwerk:9,pub:8,bus:9,phone:9,robot:8,laptop:6,calc:6,abakus:6};function D1(n,t,e){let i=new Ke,s=r=>new qa({color:r,roughness:.55});if(n==="brezel"){let r=[[-.9,.55],[-1.05,-.15],[-.55,-.6],[0,-.35],[.35,.1],[.1,.45],[-.1,.45],[-.35,.1],[0,-.35],[.55,-.6],[1.05,-.15],[.9,.55]].map(([h,f])=>new R(h*t/2.2,0,f*e/1.6)),a=new kt(new Sr(new Ki(r),90,.26,14),s("#a8561f"));a.position.y=.26,i.add(a);let o=new Gn(new an(.07,.07,.07),s("#ffffff"),40),l=new _e,c=new Ki(r);for(let h=0;h<40;h++){let f=c.getPointAt(h/40);l.position.set(f.x+(Math.random()-.5)*.2,.5,f.z+(Math.random()-.5)*.2),l.rotation.set(Math.random(),Math.random(),0),l.updateMatrix(),o.setMatrixAt(h,l.matrix)}i.add(o)}else if(n==="baguette"){let r=new kt(new Ga(.32,t-.7,8,16),s("#e0a050"));r.rotation.z=Math.PI/2,r.scale.set(1,1,.85),r.position.y=.3,i.add(r);for(let a=0;a<5;a++){let o=new kt(new an(.38,.06,.12),s("#fff1cf"));o.position.set(-t/2+.7+a*(t-1.4)/4,.58,0),o.rotation.y=.7,i.add(o)}}else if(n==="croissant")for(let r=0;r<5;r++){let a=(r-2)/2,o=.42-Math.abs(a)*.12,l=new kt(new Gs(o,16,12),s(r%2?"#d98a35":"#e8a24a"));l.position.set(a*t*.38,o*.8,-Math.cos(a*1.2)*e*.3+e*.15),l.scale.set(.9,.85,1.2),l.rotation.y=a,i.add(l)}return i.traverse(r=>{r.isMesh&&(r.castShadow=!0,r.receiveShadow=!0)}),i}function U1(){let n=new mn(1,1).rotateX(-Math.PI/2);for(let[t,e,i,s,r,a,o]of Oi){if(ou[t]){let h=D1(t,s,r);h.position.set(e,1,i),h.rotation.y=a,be.add(h);continue}let l=cu[t]?1:L1[t]||5,c=v1(t);for(let h=0;h<l;h++){let f=h===l-1,u=f?1:.5+.3*h/l,d=new kt(n,new Xe({map:c,alphaTest:.5,side:pn,color:new At(u,u,u)}));d.scale.set(s,1,r),d.rotation.y=a,d.position.set(e,1.04+h*.06+(cu[t]?.1:0),i),d.castShadow=h===0||f,be.add(d)}}ls.length=0;for(let t=0;t<oe.length;t++){if(oe[t]!=="neon"&&oe[t]!=="chip")continue;let e=Oi.filter(i=>i[6]===t).sort((i,s)=>i[2]-s[2]);for(let i=0;i<e.length-1;i++){let s=e[i],r=e[i+1],a=[new R(s[1],1.12,s[2]),new R(s[1],1.12,(s[2]+r[2])/2),new R(r[1],1.12,(s[2]+r[2])/2),new R(r[1],1.12,r[2])],o=new Ki(a,!1,"catmullrom",0),l=oe[t]==="chip"?"#ffd25a":"#2f86ff",c=new kt(new Sr(o,40,.09,8),new Xe({color:l,emissive:l,emissiveIntensity:.35}));c.castShadow=!0,be.add(c);for(let h=0;h<2;h++){let f=new kt(new Gs(.17,10,8),new xe({color:"#ffffff"}));be.add(f),ls.push({cv:o,pk:f,ph:h*.5+Math.random()*.2,sp:.12+Math.random()*.08})}}}}var ls=[],N1={elephant:[["#9aa3b5",0,.7,0,1,.8,1.4],["#9aa3b5",0,.85,.85,.8,.7,.5],["#b8c0cf",.52,.95,.7,.26,.62,.5],["#b8c0cf",-.52,.95,.7,.26,.62,.5],["#8b94a6",0,.45,1.2,.2,.7,.2],["#ffffff",.22,.6,1.12,.08,.08,.3],["#ffffff",-.22,.6,1.12,.08,.08,.3],["#8b94a6",.3,.22,.45,.26,.45,.26],["#8b94a6",-.3,.22,.45,.26,.45,.26],["#8b94a6",.3,.22,-.45,.26,.45,.26],["#8b94a6",-.3,.22,-.45,.26,.45,.26],["#1d1b26",.2,1,1.1,.08,.08,.04],["#1d1b26",-.2,1,1.1,.08,.08,.04]],giraffe:[["#ffc93a",0,.95,0,.6,.5,1],["#ffc93a",0,1.55,.45,.26,1,.26],["#ffc93a",0,2.05,.62,.32,.3,.5],["#a8561f",.12,1.21,.2,.16,.02,.16],["#a8561f",-.14,1.21,-.2,.18,.02,.18],["#a8561f",.1,1.21,-.38,.14,.02,.14],["#a8561f",-.1,1.21,.36,.12,.02,.12],["#a8561f",0,1.7,.55,.1,.1,.1],["#7a3e14",.1,2.27,.6,.06,.14,.06],["#7a3e14",-.1,2.27,.6,.06,.14,.06],["#e8a62a",.2,.35,.35,.14,.7,.14],["#e8a62a",-.2,.35,.35,.14,.7,.14],["#e8a62a",.2,.35,-.35,.14,.7,.14],["#e8a62a",-.2,.35,-.35,.14,.7,.14]],zebra:[["#ffffff",0,.7,0,.6,.5,1.1],["#ffffff",0,.95,.65,.3,.45,.45],["#1d1b26",0,.97,-.4,.62,.04,.1],["#1d1b26",0,.97,-.15,.62,.04,.1],["#1d1b26",0,.97,.1,.62,.04,.1],["#1d1b26",0,.97,.35,.62,.04,.1],["#1d1b26",0,1.2,.62,.1,.1,.5],["#1d1b26",0,.9,.92,.24,.24,.12],["#f2f2f2",.2,.25,.35,.14,.5,.14],["#f2f2f2",-.2,.25,.35,.14,.5,.14],["#f2f2f2",.2,.25,-.35,.14,.5,.14],["#f2f2f2",-.2,.25,-.35,.14,.5,.14]],monkey:[["#8a5232",0,.45,0,.5,.5,.5],["#8a5232",0,.8,.15,.46,.42,.42],["#f3c99a",0,.78,.38,.3,.26,.06],["#f3c99a",.27,.82,.15,.1,.18,.18],["#f3c99a",-.27,.82,.15,.1,.18,.18],["#6b4226",0,.55,-.4,.1,.1,.5],["#1d1b26",.08,.84,.41,.06,.06,.02],["#1d1b26",-.08,.84,.41,.06,.06,.02]],lion:[["#ffb84d",0,.5,0,.6,.5,1],["#b85a1a",0,.72,.55,.7,.7,.5],["#ffb84d",0,.72,.72,.42,.42,.3],["#1d1b26",.1,.82,.88,.06,.06,.02],["#1d1b26",-.1,.82,.88,.06,.06,.02],["#b85a1a",0,.5,-.6,.1,.1,.4],["#e8a62a",.2,.18,.32,.16,.36,.16],["#e8a62a",-.2,.18,.32,.16,.36,.16],["#e8a62a",.2,.18,-.32,.16,.36,.16],["#e8a62a",-.2,.18,-.32,.16,.36,.16]],duck:[["#ffffff",0,.25,0,.4,.3,.55],["#2e9a3c",0,.5,.25,.26,.26,.26],["#ff9a1f",0,.48,.45,.14,.06,.16],["#ffffff",.22,.3,-.05,.06,.16,.36],["#ffffff",-.22,.3,-.05,.06,.16,.36]],frog:[["#4cc38a",0,.2,0,.5,.3,.5],["#ffffff",.14,.4,.18,.14,.14,.14],["#ffffff",-.14,.4,.18,.14,.14,.14],["#1d1b26",.14,.42,.26,.06,.06,.02],["#1d1b26",-.14,.42,.26,.06,.06,.02],["#2fa36a",.3,.1,-.15,.2,.1,.3],["#2fa36a",-.3,.1,-.15,.2,.1,.3]],deer:[["#a8693a",0,.65,0,.5,.45,.9],["#a8693a",0,1.05,.45,.26,.4,.3],["#fff3e0",0,.88,-.46,.2,.2,.06],["#6b4226",.14,1.4,.45,.06,.3,.06],["#6b4226",-.14,1.4,.45,.06,.3,.06],["#6b4226",.2,1.5,.45,.2,.05,.05],["#6b4226",-.2,1.5,.45,.2,.05,.05],["#fff3e0",.12,.9,.1,.08,.02,.08],["#fff3e0",-.1,.9,-.15,.08,.02,.08],["#8a5232",.17,.22,.3,.12,.45,.12],["#8a5232",-.17,.22,.3,.12,.45,.12],["#8a5232",.17,.22,-.3,.12,.45,.12],["#8a5232",-.17,.22,-.3,.12,.45,.12]],rabbit:[["#f2f2f2",0,.22,0,.36,.32,.46],["#f2f2f2",0,.4,.22,.28,.26,.26],["#f2f2f2",.07,.66,.2,.07,.3,.08],["#f2f2f2",-.07,.66,.2,.07,.3,.08],["#ffb6c8",0,.4,.36,.06,.05,.02],["#ffffff",0,.26,-.26,.14,.14,.1]]},O1={wald:["deer","rabbit","deer"],buch:["rabbit","duck"],maerchen:["frog","deer","rabbit"],zahl:["rabbit","duck"],geo:["rabbit"],muster:["rabbit","duck"],lavendel:["rabbit","duck"],london:["duck","rabbit"],kueste:["duck"],riviera:["duck"],paris:["duck"],hof:["rabbit","duck","deer","rabbit","frog","duck"],dschungel:["elephant","giraffe","zebra","monkey","lion"],fluss:["duck","duck","frog","deer","rabbit","duck"],park:["duck","rabbit","duck"],grass:["rabbit","deer","duck"],beach:["duck","monkey"],ice:["rabbit","deer"],candy:["rabbit","frog"]},Qs=[],F1={dschungel:1,fluss:1,park:1,hof:1};function k1(){for(let n=0;n<oe.length;n++){let t=O1[oe[n]];if(!t)continue;let e=F1[oe[n]]?9:3;for(let i=0,s=0;i<e&&s<400;s++){let r=t[i%t.length],a=r==="duck",o=3+Math.floor(st()*(Vt-6)),l=Yn(n)-3-Math.floor(st()*(bn-6)),c=Ht.get(ue(o,l));if(!c||(a?c.t!=="water":c.t!=="land"||c.h!==1||c.rock||c.dec))continue;let h=new Ke;for(let[d,g,_,m,p,w,x]of N1[r]){let S=new kt(Mu,new Xe({vertexColors:!0,color:d}));S.position.set(g,_,m),S.scale.set(p,w,x),S.castShadow=!0,h.add(S)}let f=(r==="elephant"?1.1:r==="giraffe"?1:.9)*1.7;h.scale.setScalar(f);let u=o-Vt/2+.5;h.position.set(u,a?.48:1,l),h.rotation.y=st()*6.28,be.add(h),Qs.push({g:h,kind:r,swim:a,home:[u,l],tx:u,tz:l,wait:st()*3,ph:st()*6,base:h.position.y}),i++}}}function qc(n,t,e){let i=Ht.get(ue(Math.round(t+Vt/2-.5),Math.round(e)));return i?n.swim?i.t==="water":i.t==="land"&&i.h===1&&!i.rock&&!i.vol&&!i.dec:!1}function B1(n,t){for(let e of Qs){let i=e.g,s=e.tx-i.position.x,r=e.tz-i.position.z,a=Math.hypot(s,r);if(e.wait>0){if(e.wait-=n,i.position.y=e.base+(e.kind==="frog"||e.kind==="rabbit"?0:Math.sin(t*2+e.ph)*.01),e.wait<=0)for(let f=0;f<8;f++){let u=e.home[0]+(st()-.5)*7,d=e.home[1]+(st()-.5)*7;if(qc(e,u,d)&&qc(e,(u+i.position.x)/2,(d+i.position.z)/2)){e.tx=u,e.tz=d;break}}continue}if(a<.05){e.wait=1+st()*4;continue}let l=Math.atan2(s,r)-i.rotation.y;l=Math.atan2(Math.sin(l),Math.cos(l)),i.rotation.y+=l*Math.min(1,n*5);let c={elephant:.6,giraffe:.8,duck:.5,frog:1.4,rabbit:1.6}[e.kind]||1;if(Math.abs(l)<.6){let f=Math.min(a,c*n),u=i.position.x+s/a*f,d=i.position.z+r/a*f;qc(e,u,d)?(i.position.x=u,i.position.z=d):e.wait=.5}let h=e.kind==="frog"||e.kind==="rabbit";i.position.y=e.base+(h?Math.abs(Math.sin(t*9+e.ph))*.25:e.swim?Math.sin(t*3+e.ph)*.03:Math.abs(Math.sin(t*7+e.ph))*.04),i.rotation.z=e.swim?Math.sin(t*2+e.ph)*.08:Math.sin(t*7+e.ph)*.03}}var Eu={grass:1,beach:1,ice:1,lava:1,candy:1,space:1};function Yc(n,t,e,i){for(let s=-e;s<=e;s++)for(let r=-e;r<=e;r++){let a=Ht.get(ue(n+s,t+r));if(!a||a.t!=="land"||a.h!==i.h||a.b!==i.b||a.dec||a.vol||a.lp&&a.h===1||a.tr&&(s||r)&&Math.abs(s)<=1&&Math.abs(r)<=1)return!1}return!i.tr}function hu(n,t,e){for(let[i,s]of[[1,0],[-1,0],[0,1],[0,-1]]){let r=Ht.get(ue(n+i,t+s));if(!r||r.t!=="land"||r.h!==e.h||r.b!==e.b||r.tr)return!1}return!0}function z1(){for(let[,n]of Ht)Fn[n.b]&&n.t==="land"&&n.h>2&&(n.h=2);for(let n=0;n<3;n++){let t=new Map;for(let[e,i]of Ht){if(!Fn[i.b]||i.t!=="land")continue;let[s,r]=e.split(",").map(Number),a=0,o=0;for(let l=-1;l<=1;l++)for(let c=-1;c<=1;c++){if(!l&&!c)continue;let h=Ht.get(ue(s+l,r+c));h&&(o++,h.t==="land"&&h.h>1&&a++)}t.set(i,a>=5?2:a<=3?1:i.h)}for(let[e,i]of t)e.h=i}}function H1(){for(let[t,e]of Ht){if(e.t!=="land"||e.rock||e.vol||e.dec||Eu[e.b]&&e.h===1&&st()<.6||_n[e.b+"0"]&&!{wald:1,dschungel:1,park:1,maerchen:1}[e.b]&&!no[e.b]||_n[e.b+"0"]&&e.h===1&&st()<.45)continue;let[i,s]=t.split(",").map(Number),r=ke[e.b],a=i-Vt/2+.5,o=e.h,l=fi(i*.35+7,s*.35+3),c={muster:"zahl",maerchen:"wald",kueste:"london",hof:"grass",robo:"chip"},h={muster:.25,maerchen:.7,kueste:.25,riviera:.3,hof:.35,robo:.15,grass:.75,beach:.3,ice:.5,lava:.3,candy:.28,space:.4,zahl:.35,geo:.12,buch:.3,wald:.8,london:.25,park:.55,paris:.3,lavendel:.1,dschungel:.9,fluss:.4,neon:.12,chip:.15}[e.b]??.4,f=c[e.b]||e.b;if(no[e.b]){if(no[e.b]){let u=no[e.b],d=({wald:.55,dschungel:.6}[u]||.3)*({london:.35,paris:.35,zahl:2.2,geo:2,muster:1.6}[e.b]||1);if(u==="mond"&&!e.clear&&!e.tr){let B=st();if(e.h===1&&B<.06&&Yc(i,s,2,e)){Ys.push([st()<.5?"fuss0":"fuss1",a,o,s,4.2+st()*.8]);for(let v=-2;v<=2;v++)for(let b=-2;b<=2;b++){let F=Ht.get(ue(i+v,s+b));F&&(F.tr=1)}continue}if(B<.1&&Yc(i,s,0,e)&&hu(i,s,e)){Ys.push(["fuss2",a,o,s,1.4+st()*.5]),e.tr=1;continue}}let g=fi(i*.11+31,s*.11+17),_=fi(i*.5+3,s*.5+9),m=g>.56,p=g>.5&&!m,w=m?Math.min(.75,(.35+(g-.56)*2.2)*(d/.3*.6+.4)):p?.12:.025,x=e.h>1,S=x?1.6+st()*.8:m?2.2+(g-.5)*4+_*.9:p?1.6+st()*.7:2.4+st()*.9,P=x?0:Math.max(0,Math.ceil(S/2-.8)),T=Math.min(S,4.2)*.5*.92,A=a,I=s;if(ve.some(B=>{let v=Zt[B];return v&&Math.hypot(v[0]-i,v[1]-s)<2.2+S*.5}))continue;if(Ur==="mix"&&Zt.length){let B=Zt[hs()];if(Math.hypot(B[0]-i,B[1]-s)<10&&i>B[0]-3)continue}if(!e.clear&&(x?st()<.55&&hu(i,s,e):st()<w)&&Yc(i,s,P,e)&&!Ys.some(B=>!String(B[0]).startsWith("fuss")&&Math.hypot(B[1]-A,B[3]-I)<T+B[4]*.5*.92)){let B=Object.keys(Vc).filter(b=>b.startsWith(u)&&!b.startsWith("fuss")),v=B[Math.floor(st()*B.length)];Ys.push([v,a+(x?0:(st()-.5)*.7),o,s+(x?0:(st()-.5)*.7),Math.min(S,4.2)]);for(let b=-1;b<=1;b++)for(let F=-1;F<=1;F++){let N=Ht.get(ue(i+b,s+F));N&&(N.tr=1)}}continue}if(!e.clear&&l>.52&&st()<h){m1(a+(st()-.5)*.2,o,s+(st()-.5)*.2,r,f);continue}if(_n[e.b+"0"]){if(st()<.5)continue}else if(g1(f,a,o,s,r))continue;if(st()<(e.b==="grass"?.22:.12)){let u=1+Math.floor(st()*3);for(let d=0;d<u;d++){let g=a+(st()-.5)*.7,_=s+(st()-.5)*.7,m=r.flowers[Math.floor(st()*r.flowers.length)];X(g,o+.1,_,.14,.2,.14,m)}}else e.b==="grass"&&st()<.2&&(X(a+(st()-.5)*.5,o+.08,s+(st()-.5)*.5,.08,.16,.08,"#5fb52a"),X(a+(st()-.5)*.5,o+.1,s+(st()-.5)*.5,.08,.2,.08,"#4aa52a"))}}if(oe.indexOf("lava")>=0){let t=je.x,e=je.z,i=ke.lava;if(Fn.lava)cs.set(-999,0,0);else for(let s=0;s<7;s++){let r=4.6-s*.62;for(let a=-Math.ceil(r);a<=Math.ceil(r);a++)for(let o=-Math.ceil(r);o<=Math.ceil(r);o++)a*a+o*o>r*r||s===6&&a*a+o*o<1.2||X(t+a,1.5+s*.7,e+o,1,.7,1,s>4?"#4a3640":Ir(i.side,s*.02))}if(Fn.lava||cs.set(t,1.5+6*.7+.2,e),!Fn.lava)for(let[s,r]of[[0,0],[1,0],[-1,0],[0,1],[0,-1]])di.push([t+s,e+r,1.5+5*.7+.4])}}var cs=new R(-999,0,0);function V1(){let n=new Gs(.5,16,10),t=n.attributes.position,e=new Float32Array(t.count*3);for(let i=0;i<t.count;i++){let s=fn(.62,1,t.getY(i)+.5);e[i*3]=e[i*3+1]=e[i*3+2]=s}return n.setAttribute("color",new Ee(e,3)),n}function G1(){let n=new Wa(.5,1,14),t=n.attributes.position,e=new Float32Array(t.count*3);for(let i=0;i<t.count;i++){let s=fn(.68,1,t.getY(i)+.5);e[i*3]=e[i*3+1]=e[i*3+2]=s}return n.setAttribute("color",new Ee(e,3)),n}function W1(){let n={b:Mu,c:ph(.5,1,20),s:V1(),k:G1()},t=new _e,e=new At;for(let i of["b","c","s","k"]){let s=dh.filter(a=>a[7]===i);if(!s.length)continue;let r=new Gn(n[i],f1,s.length);s.forEach(([a,o,l,c,h,f,u],d)=>{t.position.set(a,o,l),t.scale.set(c,h,f),t.updateMatrix(),r.setMatrixAt(d,t.matrix),r.setColorAt(d,e.set(u))}),r.castShadow=r.receiveShadow=!0,be.add(r)}}var Nn={uniforms:{t:{value:0}}};function X1(){let n=new kt(new mn(Vt+80,qn+80).rotateX(-Math.PI/2),new We({uniforms:(Nn.uniforms.wt||(Nn.uniforms.wt={value:(()=>{let h=new is().load("/grundschulmax/tex/wasser0.webp");return h.wrapS=h.wrapT=ks,h.colorSpace=fe,h.anisotropy=8,h})()}),Nn.uniforms),vertexShader:"varying vec3 wp; void main(){ vec4 w = modelMatrix*vec4(position,1.); wp=w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }",fragmentShader:`uniform float t; uniform sampler2D wt; varying vec3 wp;
      float hh(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      void main(){ vec2 uv = vec2(wp.x, -wp.z) / 9.; vec3 c = texture2D(wt, uv).rgb; c = pow(c, vec3(1./2.2));
        float k = hh(floor(uv*16.)); float v = sin(t*1.4 + k*6.283)*.5+.5; c *= .95 + .1*v;
        c += vec3(.9,.97,1.) * step(.985, k) * smoothstep(.75, 1., v) * .45;
        gl_FragColor = vec4(c,1.); }`}));n.position.set(0,.45,-qn/2),be.add(n);let t=[],e=new _e;for(let[h,f]of Ht){if(f.t==="water")continue;let[u,d]=h.split(",").map(Number),g=u-Vt/2+.5;for(let[_,m]of[[1,0],[-1,0],[0,1],[0,-1]]){let p=Ht.get(ue(u+_,d+m));p&&p.t!=="water"||t.push([g+_*.56,d+m*.56,_!==0,ke[(p||f).b].foam])}}let i=new Gn(new an(1,.05,1),new xe({color:"#ffffff",transparent:!0,opacity:.9}),t.length);t.forEach(([h,f,u,d],g)=>{e.position.set(h,.5,f),e.scale.set(u?.13:1.13,1,u?1.13:.13),e.updateMatrix(),i.setMatrixAt(g,e.matrix),i.setColorAt(g,new At(d))});let s={ice:"vec2 uv = vec2(wp.x, -wp.z) / 9.; vec3 w = pow(texture2D(wt, uv).rgb, vec3(1./2.2)); float l = dot(w, vec3(.2,.45,.35)); vec3 c = mix(vec3(.62,.84,.98), vec3(.93,.98,1.), smoothstep(.45,.9,l)); float k = hh(floor(uv*16.)); c += vec3(1.) * step(.985, k) * (.5+.5*sin(t*2.+k*30.)) * .35;",choc:"float v = sin(wp.x*1.2 + t*.7 + sin(wp.z*1.1 + t*.5)*1.5)*.5 + .5; vec3 c = mix(vec3(.36,.18,.08), vec3(.55,.3,.14), v); float sp = step(.96, hh(floor(wp.xz*3.))) * (.5+.5*sin(t*2.)); c = mix(c, vec3(1.,.85,.92), sp*.5);",void:"vec2 g = floor(wp.xz*5.); float k = hh(g); vec3 c = mix(vec3(.05,.03,.18), vec3(.13,.06,.32), .5 + .5*sin(wp.x*.3 + wp.z*.2 + t*.3)); float st = step(.975, k) * (.5 + .5*sin(t*3. + k*40.)); c += vec3(st);"},r={ice:[],choc:[],void:[]};for(let[h,f]of Ht){if(f.t!=="water")continue;let u=ke[f.b].fl;if(r[u]){let[d,g]=h.split(",").map(Number);r[u].push([d-Vt/2+.5,g])}}let a=new mn(1,1).rotateX(-Math.PI/2);for(let h in r){if(!r[h].length)continue;let f=new We({uniforms:Nn.uniforms,vertexShader:"varying vec3 wp; void main(){ vec4 w = modelMatrix*instanceMatrix*vec4(position,1.); wp = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }",fragmentShader:"uniform float t; uniform sampler2D wt; varying vec3 wp; float hh(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); } void main(){ "+s[h]+" gl_FragColor = vec4(c,1.); }"}),u=new Gn(a,f,r[h].length);r[h].forEach(([d,g],_)=>{e.position.set(d,.47,g),e.scale.set(1,1,1),e.updateMatrix(),u.setMatrixAt(_,e.matrix)}),be.add(u)}be.add(i),Nn.foam=i;let o=new We({uniforms:Nn.uniforms,vertexShader:`varying vec3 lp; varying vec3 wp; varying vec3 nn;
      void main(){ lp = position; nn = normal; vec4 w = modelMatrix*instanceMatrix*vec4(position,1.); wp = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }`,fragmentShader:`uniform float t; varying vec3 lp; varying vec3 wp; varying vec3 nn;
      float hh(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      void main(){
        vec2 g = floor(wp.xz*4. + vec2(0., t*.6));
        float k = hh(g), v = sin(t*2.2 + k*6.283)*.5+.5;
        vec3 hot = vec3(1.,.86,.25), mid = vec3(1.,.5,.06), low = vec3(.86,.2,.04);
        vec3 c = mix(low, mix(mid, hot, smoothstep(.55,1.,v)), smoothstep(.0,.6,v*.7 + k*.4));
        if (nn.y < .5) { float y = lp.y + .5; c = mix(vec3(.45,.08,.04), vec3(1.,.42,.05), y) * (.9 + .1*sin(t*3. + wp.x)); }
        gl_FragColor = vec4(c,1.); }`}),l=new an(1,.5,1),c=new Gn(l,o,di.length);di.forEach(([h,f,u],d)=>{e.position.set(h,(u||.75)-.25,f),e.scale.set(1,1,1),e.updateMatrix(),c.setMatrixAt(d,e.matrix)}),be.add(c),Nn.lava=di}var ve=[],kn=[],ln=new Ke;Le.add(ln);function Tu(n,t){let e=document.createElement("canvas");e.width=e.height=256;let i=e.getContext("2d");if(i.fillStyle="#fff",i.strokeStyle="#fff",i.lineJoin=i.lineCap="round",i.shadowColor="rgba(0,0,0,.22)",i.shadowOffsetY=8,n==="shield")i.beginPath(),i.moveTo(128,40),i.lineTo(200,68),i.quadraticCurveTo(200,172,128,216),i.quadraticCurveTo(56,172,56,68),i.closePath(),i.fill(),i.shadowColor="transparent",i.strokeStyle=t,i.lineWidth=20,i.beginPath(),i.moveTo(96,128),i.lineTo(121,153),i.lineTo(164,104),i.stroke();else if(n==="leaf")i.beginPath(),i.moveTo(66,196),i.bezierCurveTo(56,90,140,46,206,48),i.bezierCurveTo(212,130,164,202,66,196),i.fill(),i.shadowColor="transparent",i.strokeStyle=t,i.lineWidth=13,i.beginPath(),i.moveTo(76,186),i.quadraticCurveTo(130,122,182,74),i.stroke();else if(n==="star"){i.beginPath();for(let r=0;r<10;r++){let a=r%2?46:100,o=-Math.PI/2+r*Math.PI/5;i.lineTo(128+Math.cos(o)*a,134+Math.sin(o)*a)}i.fill()}else if(n==="sun"){i.beginPath(),i.arc(128,132,46,0,7),i.fill(),i.lineWidth=16;for(let r=0;r<8;r++){let a=r*Math.PI/4;i.beginPath(),i.moveTo(128+Math.cos(a)*66,132+Math.sin(a)*66),i.lineTo(128+Math.cos(a)*92,132+Math.sin(a)*92),i.stroke()}}else if(n==="drop")i.beginPath(),i.moveTo(128,40),i.bezierCurveTo(170,100,196,130,196,160),i.arc(128,160,68,0,Math.PI),i.bezierCurveTo(60,130,86,100,128,40),i.fill();else if(n==="paw"){i.beginPath(),i.ellipse(128,160,50,42,0,0,7),i.fill();for(let[r,a]of[[74,104],[108,76],[148,76],[182,104]])i.beginPath(),i.ellipse(r,a,20,26,0,0,7),i.fill()}else if(n==="chat"){i.beginPath(),i.roundRect(40,56,176,120,34),i.fill(),i.beginPath(),i.moveTo(76,168),i.lineTo(64,214),i.lineTo(118,172),i.fill(),i.shadowColor="transparent",i.fillStyle=t;for(let r of[88,128,168])i.beginPath(),i.arc(r,116,12,0,7),i.fill()}else if(n==="wifi"){i.lineWidth=20;for(let r of[96,64,32])i.beginPath(),i.arc(128,190,r,Math.PI*1.22,Math.PI*1.78),i.stroke();i.beginPath(),i.arc(128,190,14,0,7),i.fill()}else n==="book"?(i.beginPath(),i.moveTo(128,76),i.quadraticCurveTo(84,56,40,70),i.lineTo(40,190),i.quadraticCurveTo(84,176,128,196),i.quadraticCurveTo(172,176,216,190),i.lineTo(216,70),i.quadraticCurveTo(172,56,128,76),i.fill(),i.shadowColor="transparent",i.strokeStyle=t,i.lineWidth=8,i.beginPath(),i.moveTo(128,80),i.lineTo(128,190),i.stroke()):n==="globe"?(i.beginPath(),i.arc(128,128,84,0,7),i.fill(),i.shadowColor="transparent",i.strokeStyle=t,i.lineWidth=10,i.beginPath(),i.ellipse(128,128,36,84,0,0,7),i.stroke(),i.beginPath(),i.moveTo(44,128),i.lineTo(212,128),i.stroke()):n==="pad"?(i.beginPath(),i.roundRect(36,82,184,104,48),i.fill(),i.shadowColor="transparent",i.fillStyle=t,i.fillRect(66,124,44,14),i.fillRect(81,109,14,44),i.beginPath(),i.arc(166,118,11,0,7),i.arc(186,142,11,0,7),i.fill()):n==="lock"?(i.lineWidth=22,i.beginPath(),i.arc(128,104,40,Math.PI,0),i.stroke(),i.beginPath(),i.roundRect(70,102,116,94,16),i.fill()):(i.font=`900 ${n.length>2?100:124}px G, system-ui, sans-serif`,i.textAlign="center",i.textBaseline="middle",i.fillText(n,128,140));let s=new on(e);return s.colorSpace=fe,s.anisotropy=4,s}var Lr={},io=(n,t,e)=>Lr[n]||(Lr[n]=Tu(t,e));function ph(n,t,e=40){let i=new ji(n,n,t,e),s=i.attributes.position,r=i.attributes.normal,a=new Float32Array(s.count*3);for(let o=0;o<s.count;o++){let l=r.getY(o),c=s.getY(o)/t+.5,h=l>.5?1:l<-.5?.5:fn(.6,.86,c);a[o*3]=a[o*3+1]=a[o*3+2]=h}return i.setAttribute("color",new Ee(a,3)),i}var q1=ph(.86,.5),Rv=new Qi(.66,40).rotateX(-Math.PI/2),Y1=ph(.98,.36),cn=[],Zc=[],Sn=()=>{let n=cn.findIndex(e=>e.state==="cur");if(n>=0)return n;let t=-1;return cn.forEach((e,i)=>{e.state==="done"&&(t=i)}),Math.max(0,t)},hs=()=>Math.max(0,(ve[0]||0)-5),Zn=n=>{let[t,e]=Zt[n<0?hs():ve[n]];return new R(t-Vt/2+.5,1.3,e)},Or=()=>{let n=Sn();return cn[n]&&cn[n].state==="cur"?n-1:n},$c=(()=>{let n=document.createElement("canvas");n.width=n.height=128;let t=n.getContext("2d"),e=t.createRadialGradient(64,64,10,64,64,64);return e.addColorStop(0,"rgba(255,255,255,.9)"),e.addColorStop(.45,"rgba(255,255,255,.35)"),e.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=e,t.fillRect(0,0,128,128),new on(n)})(),fu=new mn(3.4,3.4).rotateX(-Math.PI/2),Z1=n=>{let t=new At(n),e={};return t.getHSL(e),t.setHSL(e.h,1,Math.min(.62,Math.max(.52,e.l+.08))),"#"+t.getHexString()},uu=null;function $1(){let n=document.createElement("canvas");n.width=4,n.height=128;let t=n.getContext("2d"),e=t.createLinearGradient(0,128,0,0);e.addColorStop(0,"rgba(255,255,255,.95)"),e.addColorStop(.35,"rgba(255,255,255,.35)"),e.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=e,t.fillRect(0,0,4,128);let i=new on(n);return i.colorSpace=fe,i}function J1(n,t,e){return new We({transparent:!0,depthWrite:!1,uniforms:{map:{value:n},c:{value:new At(t)},t:Nn.uniforms.t,ph:{value:Math.random()*6},dim:{value:e?1:0}},vertexShader:"varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }",fragmentShader:`uniform sampler2D map; uniform vec3 c; uniform float t, ph, dim; varying vec2 vUv;
      void main(){ vec2 p = vUv - .5; float r = length(p);
        vec3 col = c * (1.18 - r * .45) + vec3(.16) * smoothstep(.5, .0, length(p - vec2(-.12,.14)));
        float sw = fract((t + ph) * .28); float band = smoothstep(.09, .0, abs(p.x + p.y - (sw * 2.4 - 1.2)));
        col += vec3(1.) * band * .45 * (1. - dim * .6);
        vec4 ic = texture2D(map, vUv); col = mix(col, ic.rgb, ic.a);
        if (dim > .5) col = mix(col, vec3(dot(col, vec3(.3,.59,.11))), .12);
        gl_FragColor = vec4(col, smoothstep(.5, .485, r));
        #include <colorspace_fragment>
      }`})}function K1(n,t){let e="L"+n+t;if(Lr[e])return Lr[e];let i=Tu(t,On[n].c).image,s=document.createElement("canvas");s.width=s.height=256;let r=s.getContext("2d");r.globalAlpha=.28,r.drawImage(i,28,28,200,200),r.globalAlpha=1,r.shadowColor="rgba(0,0,0,.35)",r.shadowBlur=10,r.shadowOffsetY=6,r.lineWidth=22,r.strokeStyle="#c9ced8",r.lineCap="round",r.beginPath(),r.moveTo(88,130),r.lineTo(88,96),r.arc(128,96,40,Math.PI,0),r.lineTo(168,130),r.stroke();let a=r.createLinearGradient(0,118,0,214);a.addColorStop(0,"#ffe15a"),a.addColorStop(1,"#f2a900"),r.fillStyle=a,r.beginPath(),r.roundRect(66,118,124,96,22),r.fill(),r.shadowColor="transparent",r.fillStyle="rgba(255,255,255,.45)",r.beginPath(),r.roundRect(76,126,104,18,9),r.fill(),r.fillStyle="#7a4a00",r.beginPath(),r.arc(128,160,13,0,Math.PI*2),r.fill(),r.fillRect(122,162,12,30);let o=new on(s);return o.colorSpace=fe,o.anisotropy=4,Lr[e]=o}function mh(){if(ln.clear(),kn=[],cn=pe.list().slice(0,ve.length),Zc.length=0,Zt.length){let[s,r]=Zt[hs()],a=new Ci(new hi({map:du||(du=Q1()),transparent:!0,depthWrite:!1,depthTest:!1}));a.scale.set(3.4,1.6,1),a.position.set(s-Vt/2+.5,2.4,r+2.9),a.renderOrder=8,ln.add(a);let o=new kt(fu,new xe({map:$c,color:"#ffb02e",transparent:!0,depthWrite:!1,blending:Vn,opacity:.9}));o.position.set(s-Vt/2+.5,1.08,r),o.scale.setScalar(1.3),ln.add(o),ro=o}cn.forEach((s,r)=>{let a=On[s.k],o=new Ke,l=s.state,c=l==="done"?"#ffc21a":s.col||a.c,h=l==="done"?"#f2a900":s.col||a.c,f=l!=="pay"&&l!=="next",u=l==="done"?"#ffe14a":Z1(s.col||a.c),d=new kt(fu,new xe({map:$c,color:u,transparent:!0,depthWrite:!1,blending:Vn,opacity:f?1:.45}));d.position.y=-.2,d.scale.setScalar(f?1.6:1.15),o.add(d),o.userData.glow=d;let g=new kt(new ts(.98,1.3,64).rotateX(-Math.PI/2),new xe({color:u,transparent:!0,depthWrite:!1,opacity:f?1:.6}));g.position.y=.62,o.add(g),o.userData.nr=g;let _=new kt(new ts(1.3,2.1,64).rotateX(-Math.PI/2),new xe({map:$c,color:u,transparent:!0,depthWrite:!1,blending:Vn,opacity:f?.95:.4}));_.position.y=.6;let m=new kt(new ts(.9,.98,64).rotateX(-Math.PI/2),new xe({color:"#ffffff",transparent:!0,depthWrite:!1,blending:Vn,opacity:f?.9:.35}));if(m.position.y=.63,o.add(m),o.add(_),o.userData.nr2=_,f){let P=new kt(new ji(.9,.9,3.2,32,1,!0),new xe({map:uu||(uu=$1()),color:u,transparent:!0,depthWrite:!1,side:pn,blending:Vn,opacity:l==="cur"?.85:.35}));P.position.y=2.1,o.add(P),o.userData.beam=P}let p=new kt(Y1,new Xe({vertexColors:!0,color:s.game?"#ffd23a":"#ffffff",emissive:s.game?"#ffb300":f?u:"#ffffff",emissiveIntensity:f?.7:.3}));s.game&&p.scale.set(1.18,1,1.18),p.position.y=.05;let w=new kt(q1,new Xe({vertexColors:!0,color:h}));w.position.y=.3;let x=l==="done"?io("star","star"):l==="pay"||l==="next"?K1(s.k,s.ic||a.ic):s.game?io("pad","pad",a.c):s.ic?io(s.k+s.ic+(s.col||""),s.ic,s.col||a.c):io(s.k,a.ic,a.c),S=new kt(new Qi(.8,48).rotateX(-Math.PI/2),J1(x,c,l==="pay"||l==="next"));if(S.position.y=.56,[p,w].forEach(P=>{P.castShadow=P.receiveShadow=!0}),o.add(p,w,S),l==="cur"){let P=new kt(new ts(1.08,1.2,48).rotateX(-Math.PI/2),new xe({color:"#ffffff",transparent:!0,depthWrite:!1}));P.position.y=.2,o.add(P),o.userData.ring=P}if(o.position.copy(Zn(r)),o.userData={...o.userData,i:r,s,state:l,ph:Math.random()*6},ln.add(o),kn.push(o),pe.tutors!==!1||pe.labels){let P=ve[r],T=Zt[Math.max(0,P-1)],A=Zt[Math.min(Zt.length-1,P+1)],I=-(A[1]-T[1]),B=A[0]-T[0],v=Math.hypot(I,B)||1;I/=v,B/=v;let b=null,F=-1;for(let[N,V]of[[I,B],[-I,-B],[I+B*.6,B-I*.6],[-I+B*.6,-B-I*.6],[I-B*.6,B+I*.6],[-I-B*.6,-B+I*.6]]){let Y=o.position.x+N*1.6,H=o.position.z+V*1.6,tt=Ht.get(ue(Math.round(Y+Vt/2-.5),Math.round(H))),G=tt&&tt.t==="path"?-5:0,at=9;cn.forEach((ft,rt)=>{if(rt===r)return;let Dt=Zn(rt);at=Math.min(at,Math.hypot(Dt.x-Y,Dt.z-H))}),Zc.forEach(ft=>{at=Math.min(at,Math.hypot(ft[0]-Y,ft[1]-H)*.9)}),G+=at,G>F&&(F=G,b=[N,V])}I=b[0],B=b[1],Zc.push([o.position.x+I*1.6,o.position.z+B*1.6]);{let N=new Ci(new hi({map:tv(s.k),transparent:!0,depthWrite:!1,depthTest:!1,opacity:l==="pay"?.7:1}));N.scale.set(1.35,1.35,1),N.position.set(o.position.x+I*1.6,2.4,o.position.z+B*1.6),N.renderOrder=8,ln.add(N),o.userData.tut=N,o.userData.tph=Math.random()*6}}}),ch.length=0;let n=Sn(),t=ve[Math.min(n,ve.length-1)],e=ve[Math.min(n,cn.length-1)];Zt.forEach(([s,r],a)=>{if(ve.includes(a)||a>e||a<hs())return;let o=Ht.get(ue(s,r)),l=a<t,c=iv(o.b),[h,f]=sv(c),u=new kt(ev,l?Qc.gold:h);u.position.set(s-Vt/2+.5,o.t==="bridge"?.9:1.04,r),ln.add(u);let d=new kt(nv,l?Qc.goldG||(Qc.goldG=new xe({color:"#ffc21a",transparent:!0,opacity:.45,depthWrite:!1,blending:Vn})).clone():f.clone());d.position.copy(u.position),d.position.y+=.02,ln.add(d),ch.push([u,d,a])});let i=cn.findIndex(s=>s.state==="pay");if(i>0){let s=Zt[ve[i]-2],r=new Ke,a=new kt(xu(.9,.75,.5),new Xe({vertexColors:!0,color:"#ffc21a"}));a.position.y=.5;let o=new kt(new Xa(.28,.09,8,16,Math.PI),new Xe({color:"#9aa3b5"}));o.position.y=.86,r.add(a,o),r.position.set(s[0]-Vt/2+.5,1.2,s[1]),[a,o].forEach(l=>l.castShadow=!0),ln.add(r),ln.userData.lock=r}{let s=Sn(),r=pu[Ur];if(pu[Ur]=s,Un=null,r!=null&&s>r){let a=kn.find(o=>o.userData&&o.userData.i===s);a&&(Un={g:a,t0:-1},a.scale.setScalar(.01))}}Dr=null;{let s=Sn();if(cn[s]&&cn[s].state==="cur"&&Or()!==s){let r=new Ci(new hi({map:(Kc=Kc||{})[s>0?1:0]||(Kc[s>0?1:0]=j1(s>0?"Weiter geht\u2019s!":"Klick hier!")),transparent:!0,depthWrite:!1,depthTest:!1})),a=Zn(s);r.scale.set(3.6,2.25,1),r.position.set(a.x,3.2,a.z-1.6),r.renderOrder=9,ln.add(r),Dr=r}}fv()}var Jc={};function Q1(){let n=document.createElement("canvas");n.width=640,n.height=300;let t=n.getContext("2d");t.shadowColor="rgba(0,0,0,.28)",t.shadowOffsetY=8,t.shadowBlur=10;let e=t.createLinearGradient(0,30,0,170);e.addColorStop(0,"#ffb84d"),e.addColorStop(1,"#ff7a1a"),t.fillStyle=e,t.beginPath(),t.roundRect(150,26,340,140,44),t.fill(),t.shadowColor="transparent",t.strokeStyle="#ffffff",t.lineWidth=10,t.stroke(),t.fillStyle="#ffffff",t.font="900 92px G, system-ui, sans-serif",t.textAlign="center",t.textBaseline="middle",t.fillText("START",320,100);let i=new on(n);return i.colorSpace=fe,i.anisotropy=4,i}var du=null,ro=null,Kc=null,Dr=null,pu={},Un=null;function j1(n){let t=document.createElement("canvas");t.width=512,t.height=320;let e=t.getContext("2d");e.shadowColor="rgba(0,0,0,.3)",e.shadowOffsetY=8,e.shadowBlur=10;let i=e.createLinearGradient(0,20,0,150);i.addColorStop(0,"#ffffff"),i.addColorStop(1,"#f1ecff"),e.fillStyle=i,e.beginPath(),e.roundRect(56,20,400,130,65),e.fill(),e.shadowColor="transparent",e.lineWidth=10,e.strokeStyle="#ff8a1f",e.stroke(),e.fillStyle="#2b2440",e.font=`900 ${n.length>11?54:70}px G, system-ui, sans-serif`,e.textAlign="center",e.textBaseline="middle",e.fillText(n,256,88),e.shadowColor="rgba(0,0,0,.25)",e.shadowOffsetY=6,e.shadowBlur=8,e.fillStyle="#ff8a1f",e.beginPath(),e.moveTo(196,168),e.lineTo(316,168),e.lineTo(256,290),e.closePath(),e.fill();let s=new on(t);return s.colorSpace=fe,s.anisotropy=4,s}function tv(n){if(Jc[n])return Jc[n];let t=document.createElement("canvas");t.width=t.height=192;let e=new on(t);e.colorSpace=fe,Jc[n]=e;let i=t.getContext("2d"),s=On[n].c,r=new Image;return r.onload=()=>{i.clearRect(0,0,192,192),i.save(),i.shadowColor="rgba(0,0,0,.25)",i.shadowBlur=6,i.shadowOffsetY=4,i.beginPath(),i.arc(96,94,88,0,Math.PI*2),i.fillStyle=s,i.fill(),i.restore(),i.beginPath(),i.arc(96,94,78,0,Math.PI*2),i.fillStyle="#ffffff",i.fill(),i.save(),i.beginPath(),i.arc(96,94,78,0,Math.PI*2),i.clip(),i.drawImage(r,8,14,176,176),i.restore(),e.needsUpdate=!0},r.src=pe.tutor(n).src,e}var ev=new ji(.17,.17,.07,20),nv=new Qi(.42,24).rotateX(-Math.PI/2),ch=[],iv=n=>({grass:"g",zahl:"g",buch:"g",wald:"g",park:"g",lavendel:"g",dschungel:"g",fluss:"g",hof:"g",maerchen:"g",beach:"s",riviera:"s",geo:"s",kueste:"s",muster:"s",lava:"l",candy:"c",space:"m",neon:"m",chip:"m",robo:"m",ice:"i",london:"t",paris:"t"})[n]||"g";var mu={g:"#3fd2ff",s:"#3dff8a",l:"#ffffff",c:"#ffffff",m:"#1d2233",i:"#b98cff",t:"#ffd84a"},gu={},sv=n=>gu[n]||(gu[n]=[new xe({color:mu[n]}),new xe({color:n==="m"?"#5fd8ff":mu[n],transparent:!0,opacity:.5,depthWrite:!1,blending:n==="m"?Ei:Vn})]),Qc={white:new Xe({color:"#ffffff"}),gold:new Xe({color:"#ffc21a"})},ht={img:null,cv:document.createElement("canvas"),mood:"idle",blink:0,nextBlink:1.5};ht.cv.width=ht.cv.height=256;var co=new on(ht.cv);co.colorSpace=fe;var rv=[[142,258,50,52],[318,270,52,54]];ht.rim="#ffffff";function hh(){let n=ht.cv.getContext("2d");if(n.clearRect(0,0,256,256),!ht.img){co.needsUpdate=!0;return}let t=ht.rim;n.save(),n.shadowColor="rgba(0,0,0,.25)",n.shadowBlur=6,n.shadowOffsetY=4,n.beginPath(),n.arc(128,126,118,0,Math.PI*2),n.fillStyle=t,n.fill(),n.restore();let e=n.createLinearGradient(0,8,0,244);e.addColorStop(0,"rgba(255,255,255,.0)"),e.addColorStop(1,"rgba(0,30,80,.14)"),n.beginPath(),n.arc(128,126,118,0,Math.PI*2),n.fillStyle=e,n.fill();let i=n.createRadialGradient(118,100,10,128,126,104);i.addColorStop(0,"#ffffff"),i.addColorStop(1,"#e9f3ff"),n.beginPath(),n.arc(128,126,102,0,Math.PI*2),n.fillStyle=i,n.fill(),n.save(),n.beginPath(),n.arc(128,126,102,0,Math.PI*2),n.clip();let s={x:ht.fit.x+ht.dx,y:ht.fit.y+ht.dy,s:ht.fit.s},r=(Wn===1||ht.smile>0)&&ht.ih?ht.ih:Wn===-1&&ht.is?ht.is:ht.blink>.3&&ht.ib?ht.ib:ht.img;n.drawImage(r,s.x,s.y,s.s,s.s);let a=ht.blink;if(a>0&&ht.eyes&&!ht.ib)for(let[o,l,c,h]of ht.eyes){let f=s.s/512,u=s.x+o*f,d=s.y+l*f,g=c*f,_=h*f;n.save(),n.beginPath(),n.ellipse(u,d,g*1.06,_*1.06,0,0,Math.PI*2),n.clip();let m=d-_*1.06+_*2.12*a,p=n.createLinearGradient(0,d-_,0,m);p.addColorStop(0,ht.lid),p.addColorStop(1,ht.lid),n.fillStyle=p,n.fillRect(u-g*1.1,d-_*1.1,g*2.2,m-(d-_*1.1)),n.restore(),a>.85&&(n.strokeStyle="#4a2410",n.lineWidth=3.4,n.lineCap="round",n.beginPath(),n.ellipse(u,d+_*.1,g*.9,_*.35,0,.15*Math.PI,.85*Math.PI),n.stroke())}n.restore(),co.needsUpdate=!0}ht.fit={x:14,y:16,s:228};ht.dx=0;ht.dy=0;ht.eyes=rv;var Ye,Js,ho,Ie=0,$n=!1,Wn=0,Dn=0,ao=[],xn=1.75;function fo(){Ye&&Le.remove(Ye,Js,ho);let n=new Ci(new hi({map:co,transparent:!0,depthWrite:!1,depthTest:!1}));n.scale.set(xn,xn,1),n.center.set(.5,.5),n.renderOrder=9,Js=new kt(new Qi(.62,24).rotateX(-Math.PI/2),new xe({color:"#000",transparent:!0,opacity:.22,depthWrite:!1}));let t=pe.name()||"Du",e=document.createElement("canvas");e.width=512,e.height=128;let i=e.getContext("2d");i.font="900 64px G, system-ui, sans-serif";let s=Math.min(460,i.measureText(t).width+64);i.shadowColor="rgba(0,0,0,.25)",i.shadowOffsetY=6,i.fillStyle="#ffffff",i.beginPath(),i.roundRect(256-s/2,18,s,88,44),i.fill(),i.shadowColor="transparent",i.fillStyle="#1d1b26",i.textAlign="center",i.textBaseline="middle",i.fillText(t,256,64);let r=new on(e);r.colorSpace=fe;let a=new Ci(new hi({map:r,transparent:!0,depthWrite:!1,depthTest:!1}));a.scale.set(3,.75,1),a.renderOrder=10,Le.add(a),ho=a,Le.add(n,Js),Ye=n,Ie=Or(),Fr(Zn(Ie))}function Fr(n,t=0){Ye.position.set(n.x,n.y+1.2+t*1.4,n.z-.15-t*.7),ho&&ho.position.set(n.x,n.y+1.6,n.z+1),Js.position.set(n.x+.12,n.y+.6,n.z+.1),Js.scale.setScalar(Math.max(.3,.95-t*.2)),Js.material.opacity=.25-t*.05}function av(n,t){return new Promise(e=>{let i=performance.now(),s=()=>{let r=Math.min(1,(performance.now()-i)/n);t(r),r<1?requestAnimationFrame(s):e()};requestAnimationFrame(s)})}async function uo(n){if($n)return;$n=!0;let t=Ie<0?hs():ve[Ie],e=n<0?hs():ve[n],i=e>=t?1:-1,s=i<0;for(let r=t+i;i>0?r<=e:r>=e;r+=i){let[a,o]=Zt[r-i],[l,c]=Zt[r],h=r===e,f=r-i===t?1.3:.82,u=h?1.3:.82;await av(h?300:190,d=>{let g=fn(a,l,d)-Vt/2+.5,_=fn(o,c,d),m=new R(g,fn(f,u,d),_);Fr(m,Math.sin(Math.PI*d)*(h?1.2:.6));let p=1+Math.sin(Math.PI*d)*.1;Ye.scale.set(xn/p,xn*p,1),qe=_,ui=Ue(g,-Mn(),Mn())}),Ui(440+(r-t)*40,.05),Ye.scale.set(xn*1.12,xn*.88,1),setTimeout(()=>Ye.scale.set(xn,xn,1),90)}if(Ie=n,$n=!1,s){po(0);return}po(1),Ui(660,.1),setTimeout(()=>Ui(880,.14),120),Au(Ye.position)}function po(n){Wn=n,Dn=0}function Au(n){let t=["#ff4f8b","#2f86ff","#ffc21a","#2fcf63","#8a5cff","#ff8a1f"];for(let e=0;e<46;e++){let i=new kt(new an(.16,.16,.05),new xe({color:t[e%6],transparent:!0}));i.position.copy(n).add(new R(0,1.2,0)),ao.push({m:i,v:new R((Math.random()-.5)*6,5+Math.random()*5,(Math.random()-.5)*6),life:1.5,t:0,spin:Math.random()*10}),Le.add(i)}}var Ii=null;function Ui(n,t){try{Ii=Ii||new AudioContext;let e=Ii.createOscillator(),i=Ii.createGain();e.type="triangle",e.frequency.value=n,i.gain.setValueAtTime(.1,Ii.currentTime),i.gain.exponentialRampToValueAtTime(.001,Ii.currentTime+t*3),e.connect(i).connect(Ii.destination),e.start(),e.stop(Ii.currentTime+t*3)}catch{}}var ss=0,qe=0,Li=0,qs=!1,jc=0,th=0,Rr=0,eh=0,js=20,Ni=()=>-(qn-4)+js/2,os=()=>-js/2-2,Pr=0,ui=0,Ru=14,Mn=()=>Math.max(0,(Vt-Ru)/2-1);function Nr(){let n=Ne.getBoundingClientRect();if(n.width<2||n.height<2)return;let t=n.width,e=n.height,i=t/e,s=Ne.dataset.sz!==t+"x"+e;s&&(yn.setSize(t,e,!1),Ne.dataset.sz=t+"x"+e),hn.aspect=i;let r=i<1?13.5:Math.min(Vt-4,Math.max(24,30*i*.66));if(Ru=r,js=r/i,yu=js/2/Math.tan(Yf.degToRad(hn.fov/2)),hn.updateProjectionMatrix(),s)try{yn.render(Le,hn)}catch{}}var ov=()=>js/Math.max(1,Ne.getBoundingClientRect().height),_u=new Qa,vu=new ct;function lv(n){let t=Ne.getBoundingClientRect();vu.set((n.clientX-t.left)/t.width*2-1,-((n.clientY-t.top)/t.height)*2+1),_u.setFromCamera(vu,hn);let e=_u.intersectObjects(kn,!0);if(!e.length){tr();return}let i=e[0].object;for(;i.parent&&!kn.includes(i);)i=i.parent;let s=i.userData;if(s.state==="cur"&&Ie!==s.i&&!$n){qe=Ue(i.position.z,Ni(),os()),tr(),uo(s.i).then(()=>setTimeout(()=>mo(s),250));return}mo(i.userData),Ui(620,.05),qe=Ue(i.position.z,Ni(),os()),ui=Ue(i.position.x,-Mn(),Mn())}var cv={leaf:'<svg viewBox="0 0 24 24" width="15" height="15"><path fill="#fff" d="M5 19c-.6-7 5-12.5 14.5-13-.2 9-5.6 14.4-13 13.4l-1.5.1z"/></svg>',shield:'<svg viewBox="0 0 24 24" width="15" height="15"><path fill="#fff" d="M12 2.5l7.5 3v6c0 4.6-3.2 8.3-7.5 10-4.3-1.7-7.5-5.4-7.5-10v-6z"/></svg>',star:'<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#fff" d="M12 2.8l2.7 5.9 6.4.7-4.8 4.3 1.4 6.3L12 16.8 6.3 20l1.4-6.3L2.9 9.4l6.4-.7z"/></svg>',check:'<svg viewBox="0 0 24 24" width="16" height="16"><path fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" d="M5 12.5l4.5 4.5L19 7.5"/></svg>',flame:'<svg viewBox="0 0 24 24" width="16" height="16"><path fill="#fff" d="M12.6 2.5c.4 3-1.6 4.6-3.2 6.4C7.8 10.7 6.5 12.6 6.5 15a5.5 5.5 0 0 0 11 0c0-2.3-1-4-2.2-5.3.1 1.5-.4 2.6-1.4 3.2.3-3.7-1.2-7.6-1.3-10.4z"/><path fill="#ffd36b" d="M12 20.3a2.8 2.8 0 0 1-2.8-2.8c0-1.6 1.3-2.6 2.4-3.9.2 1.4 1 1.9 1.8 1.3.9 1 1.4 1.8 1.4 2.6a2.8 2.8 0 0 1-2.8 2.8z"/></svg>'},hv=n=>On[n].ic.length<=2?On[n].ic:cv[On[n].ic];function fv(){let n=pe.stats();Re(".gw-hs").textContent=n.stars,Re(".gw-hl").textContent=n.lessons,Re(".gw-hd").textContent=n.streak;let t=pe.off();Re(".gw-chips").innerHTML=r1.map(e=>`<button class="gw-chip${t.includes(e)?"":" on"}" data-k="${e}" style="--c:${On[e].c};--d:${On[e].d}"><i>${hv(e)}</i>${On[e].n}</button>`).join(""),Ne.querySelectorAll(".gw-chip").forEach(e=>e.onclick=()=>{if(!pe.toggle(e.dataset.k)){e.classList.remove("shk"),e.offsetWidth,e.classList.add("shk");return}Ui(560,.05),Cu()})}function mo(n){let t=On[n.s.k],e=Re(".gw-card");e.style.setProperty("--c",n.state==="done"?"#ffc21a":n.state==="pay"?"#3b8cff":t.c),e.style.setProperty("--d",n.state==="done"?"#e08a00":n.state==="pay"?"#1554c4":t.d);let i=n.state==="pay"?"7 Tage kostenlos testen":n.state==="done"?"Nochmal spielen":n.state==="cur"?n.s.game?"Spielen!":"Los geht\u2019s!":"Erst das Feld davor";e.innerHTML=`<small>${n.s.top||ke[oe[Math.floor(n.i/Di)]].n+" \xB7 Feld "+(n.i+1)}</small><b>${n.s.game?n.s.t:t.n}</b><span>${n.s.game?"Spielplatz am Ende vom Level":n.s.t+" \xB7 Lektion "+n.s.j}</span><button class="gw-go${n.state==="next"?" off":""}">${i}</button>`,e.classList.add("on"),Re(".gw-go",e).onclick=()=>{n.state==="cur"||n.state==="done"?(gh=!0,Re(".gw-card").classList.remove("on"),pe.play(n.i,n.s)):n.state==="next"?(e.classList.remove("shk"),e.offsetWidth,e.classList.add("shk"),po(-1)):n.state==="pay"&&(tr(),pe.pay())}}function Cr(n){let t=n.clone().project(hn),e=Ne.getBoundingClientRect();return[(t.x+1)/2*e.width,(1-t.y)/2*e.height]}function uv(n){let t=document.querySelector(".aside");if(!t||!t.offsetParent)return 8;let e=t.getBoundingClientRect();return e.right>n.left&&e.width<n.width*.6?e.right-n.left+10:8}function dv(){let n=Re(".gw-bub");if(!n)return;n.className="gw-bub"}var nh=!1,gh=!1;function _h(){setTimeout(()=>{if($n||gh||Re(".gw-card.on"))return;let n=Or();Ie!==n&&cn[Sn()]&&cn[Sn()].state==="cur"&&uo(n)},700)}function tr(){let n=Re(".gw-card.on");Re(".gw-card").classList.remove("on"),n&&_h()}function Cu(n){if(mh(),!$n&&!n){let t=Or();Ie>=0&&Ie===Sn()&&t!==Ie?_h():(Ie=t,Fr(Zn(Ie)))}}var ih=new Ka,Pu=!1,go=-1,sh=0,Zs=[];function fh(){let n=!!document.querySelector(".gstage.open,.les.on");if(n?nh=!0:nh&&(nh=!1,gh=!1,_h()),Pu||document.hidden||!Ne.isConnected||!Ne.offsetParent||n){uh=requestAnimationFrame(fh),ih.getDelta();return}let t=Math.min(.05,ih.getDelta()),e=ih.elapsedTime;!qs&&Math.abs(Li)>.001&&(qe=Ue(qe+Li,Ni(),os()),Li*=.9),ss=fn(ss,qe,1-Math.pow(.002,t)),Pr=fn(Pr,ui,1-Math.pow(.002,t));let i=new R(Pr,1,ss);hn.position.set(Pr,1+yu,ss),hn.up.set(0,0,-1),hn.lookAt(i),pi.position.set(i.x-14,30,i.z-9),pi.target.position.copy(i),Nn.uniforms.t.value=e,Nn.foam&&(Nn.foam.material.opacity=.75+Math.sin(e*2)*.15);{let r=Re(".gw-end");r&&(r.style.opacity=Ue(1-(ss-Ni())/(js*.9),0,1).toFixed(2))}let s=Ue(Math.floor((-ss-14)/bn),0,oe.length-1);if(s!==go){go=s;let r=Re(".gw-chap");r.innerHTML=pe.chapter?pe.chapter(s):`<small>Kapitel ${s+1}</small><b>${ke[oe[s]].n}</b>`,r.classList.remove("in"),r.offsetWidth,r.classList.add("in")}if(ht.nextBlink-=t,ht.nextBlink<0&&(ht.blink=1,ht.nextBlink=2.2+Math.random()*3.2,ht.bt=0),ht.blink>0){ht.bt=(ht.bt||0)+t;let r=ht.bt/.16;ht.blink=r<1?Math.sin(r*Math.PI):0}if(ht.smile=(ht.smile||0)-t,ht.smT=(ht.smT??7)-t,ht.smT<0&&(ht.smile=1.3,ht.smT=7+Math.random()*8),ht.look=ht.look||{x:0,t:3},ht.look.t-=t,ht.look.t<0&&(ht.look.x=[0,-9,9,0][Math.floor(Math.random()*4)],ht.look.t=1.5+Math.random()*2.5),ht.dx=fn(ht.dx,ht.look.x,1-Math.pow(.02,t)),ht.dy=Math.sin(e*2.1)*2.2,hh(),Ye&&!$n){Dn+=t;let r=0,a=Math.sin(e*1.3)*.07;if(ht.hopT=(ht.hopT??6)-t,ht.hopT<0){let c=-ht.hopT;r=Math.abs(Math.sin(c*Math.PI*3.2))*.35*Math.max(0,1-c/.62),c>.62&&(ht.hopT=5+Math.random()*5)}let o=1+Math.sin(e*2.1)*.025;Wn===0&&Ye.scale.set(xn*(2-o),xn*o,1),Wn===1&&(r=Math.abs(Math.sin(Dn*9))*.55*Math.max(0,1-Dn/1.6),a=Math.sin(Dn*14)*.12*Math.max(0,1-Dn/1.6),Dn>1.8&&(Wn=0)),Wn===-1&&(r=0,a=-.18*Math.min(1,Dn*4)*Math.max(0,1-Math.max(0,Dn-1.6)),Ye.scale.set(xn,xn*(1-.06*Math.min(1,Dn*4)),1),Dn>2.2&&(Wn=0,Ye.scale.set(2.3,2.3,1))),Fr(Zn(Ie),r),Ye.material.rotation=a;let l=Wn===1?"#ffd23a":Wn===-1?"#a9c8ff":"#ffffff";ht.rim!==l&&(ht.rim=l,hh())}for(let r of kn){let a=r.userData;if(a.glow){let o=a.state!=="pay"&&a.state!=="next",l=.5+.5*Math.sin(e*(a.state==="cur"?3.4:2.2)+a.ph);a.glow.material.opacity=o?.85+l*.15:.4+l*.2,a.glow.scale.setScalar(o?1.45+l*.35:1.05+l*.12),a.nr&&(a.nr.material.opacity=o?.9+l*.1:.45+l*.2,a.nr.scale.setScalar(1+l*(o?.06:.02))),a.nr2&&(a.nr2.material.opacity=o?.6+l*.4:.25+l*.15,a.nr2.scale.setScalar(1+l*(o?.22:.06))),a.beam&&(a.beam.material.opacity=(a.state==="cur"?.55:.2)+l*(a.state==="cur"?.4:.15),a.beam.rotation.y=e*.6)}}for(let r of kn){let a=r.userData;if(a.tut){let o=Math.sin(e*2+a.tph);a.tut.position.y=2.4+Math.max(0,o)*.18,a.tut.material.rotation=Math.sin(e*1.2+a.tph)*.06}}dv();for(let r of kn)if(r.userData.ring){let a=e*.9%1;r.userData.ring.scale.setScalar(.85+a*.35),r.userData.ring.material.opacity=1-a}if(ln.userData.lock&&(ln.userData.lock.rotation.y=Math.sin(e*1.6)*.35),B1(t,e),I1(e),Un){Un.t0<0&&(Un.t0=e+.5);let r=(e-Un.t0)/.9;if(r>=0){let a=r>=1?1:1+Math.sin(r*Math.PI)*.45*(1-r)+(1-Math.pow(1-r,3))-1;if(Un.g.scale.setScalar(Math.max(.01,r>=1?1:(1-Math.pow(1-r,3))*(1+Math.sin(r*Math.PI)*.35))),!Un.snd){Un.snd=1;try{Au(Un.g.position),Ui(880,.08),setTimeout(()=>Ui(1320,.1),120)}catch{}}r>=1&&(Un=null)}}if(Dr&&(Dr.visible=!$n&&Ie!==Sn(),Dr.center.set(.5,.5-Math.abs(Math.sin(e*3))*.12)),ro){let r=.5+.5*Math.sin(e*2.4);ro.material.opacity=.45+.45*r,ro.scale.setScalar(1.1+.35*r)}for(let[r,a,o]of ch){let l=.5+.5*Math.sin(e*3.2-o*.45);r.scale.setScalar(.9+.3*l),a.scale.setScalar(.6+.7*l),a.material.opacity=.15+.45*l}for(let r of ls)r.pk.position.copy(r.cv.getPointAt((e*r.sp+r.ph)%1)).setY(1.2);if(sh-=t,cs.x>-900&&sh<0){sh=.35;let r=new kt(new an(.6,.6,.6),new Xe({color:"#8d8290",transparent:!0}));r.position.copy(cs),Le.add(r),Zs.push({m:r,t:0,dx:(Math.random()-.5)*.8})}for(let r=Zs.length-1;r>=0;r--){let a=Zs[r];a.t+=t,a.m.position.y+=t*1.6,a.m.position.x+=a.dx*t,a.m.position.z-=t*.5,a.m.scale.setScalar(.6+a.t*.9),a.m.rotation.y+=t,a.m.material.opacity=Math.max(0,.9-a.t/3.2),a.t>3.2&&(Le.remove(a.m),Zs.splice(r,1))}for(let r=ao.length-1;r>=0;r--){let a=ao[r];a.t+=t,a.v.y-=12*t,a.m.position.addScaledVector(a.v,t),a.m.rotation.x+=a.spin*t,a.m.rotation.y+=a.spin*.6*t,a.m.material.opacity=1-a.t/a.life,a.t>a.life&&(Le.remove(a.m),ao.splice(r,1))}yn.render(Le,hn),uh=requestAnimationFrame(fh)}var uh=0,pv=`.gw{position:absolute;inset:0;overflow:hidden;background:transparent;font-family:G,system-ui,sans-serif;color:#1d1b26;--gl:0px}
.gw-cv{position:absolute;inset:0;width:100%;height:100%;touch-action:none;display:block}
.gw button{font:inherit;border:0;cursor:pointer;color:inherit;background:none}
.gw-top{position:absolute;left:calc(var(--gl) + 12px);right:12px;top:12px;display:flex;align-items:flex-start;justify-content:space-between;gap:10px;pointer-events:none}
.gw-tl{display:flex;flex-direction:column;align-items:flex-start;gap:8px;pointer-events:none}
.gw-head{pointer-events:auto;display:flex;align-items:center;gap:10px;padding:5px 18px 5px 5px;border-radius:999px;color:#fff!important;font-weight:900!important;font-size:18px!important;background:linear-gradient(180deg,var(--h1,#ff9a3d),var(--h2,#e2561a))!important;box-shadow:0 0 0 3px #fff,0 7px 0 3px var(--h3,#b8430f),0 16px 30px -12px rgba(0,0,0,.4);transition:transform .15s}
.gw-head:hover{transform:translateY(-2px)}.gw-head:active{transform:translateY(3px)}
.gw-head .gw-hf{display:flex}.gw-head .gw-hf img{width:42px;height:42px;border-radius:50%;background:#fff;object-fit:cover;object-position:50% 15%;box-shadow:0 0 0 2px #fff;animation:gwhb 3s ease-in-out infinite}
.gw-head .gw-hf img+img{margin-left:-16px}
.gw-head .gw-hf img:nth-child(2){animation-delay:-.5s}.gw-head .gw-hf img:nth-child(3){animation-delay:-1s}.gw-head .gw-hf img:nth-child(4){animation-delay:-1.5s}.gw-head .gw-hf img:nth-child(5){animation-delay:-2s}.gw-head .gw-hf img:nth-child(6){animation-delay:-2.5s}
@keyframes gwhb{0%,100%{transform:translateY(0) rotate(0)}40%{transform:translateY(-3px) rotate(-5deg)}70%{transform:translateY(1px) rotate(4deg)}}
.gw-chap{padding:8px 16px 10px 14px;border-radius:20px;background:linear-gradient(180deg,#fff,#f2f6ff);box-shadow:0 6px 0 rgba(20,40,90,.18),0 16px 30px -12px rgba(0,0,0,.35);opacity:0;transform:translateY(-12px)}
.gw-chap.in{animation:gwin .7s cubic-bezier(.2,1.6,.4,1) forwards}@keyframes gwin{to{opacity:1;transform:none}}
.gw-chap small{display:block;font-weight:900;font-size:11.5px;letter-spacing:.09em;text-transform:uppercase;color:#ff6a1a}
.gw-chap b{display:block;font-family:Grund,G,sans-serif;font-size:24px;letter-spacing:-.02em;line-height:1.1}
.gw-stats{display:flex;gap:8px}
.gw-st{display:flex;align-items:center;gap:6px;padding:7px 12px 7px 7px;border-radius:999px;background:#fff;font-weight:900;font-size:17px;box-shadow:0 5px 0 rgba(20,40,90,.18)}
.gw-st i{width:28px;height:28px;border-radius:50%;display:grid;place-items:center}
.gw-st i{background:none!important}.gw-st i img{width:132%;height:132%;object-fit:contain;filter:drop-shadow(0 2px 1px rgba(0,0,0,.2))}.gw-st.s i img{animation:gwst 4s ease-in-out infinite}.gw-st.d i img{transform-origin:50% 90%;animation:gwfl .4s ease-in-out infinite alternate}@keyframes gwst{0%,86%,100%{transform:none}91%{transform:rotate(-14deg) scale(1.15)}96%{transform:rotate(9deg)}}@keyframes gwfl{to{transform:scale(1.06,.94) rotate(3deg)}}
.gw-st small{font-weight:800;font-size:12.5px;color:#6b6780;margin-left:2px}
.gw-subs{position:absolute;right:12px;bottom:84px;width:min(340px,calc(100% - 24px));padding:14px;border-radius:24px;background:#fff;box-shadow:0 8px 0 rgba(20,40,90,.16),0 30px 50px -20px rgba(0,0,0,.4);transform:translateY(20px) scale(.96);opacity:0;pointer-events:none;transition:.25s cubic-bezier(.2,1.4,.4,1);z-index:3}
.gw-subs.on{transform:none;opacity:1;pointer-events:auto}
.gw-end{position:absolute;left:0;right:0;top:0;height:46%;z-index:3;pointer-events:none;opacity:0;backdrop-filter:blur(9px);-webkit-backdrop-filter:blur(9px);background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,0));-webkit-mask-image:linear-gradient(180deg,#000 55%,transparent);mask-image:linear-gradient(180deg,#000 55%,transparent);display:flex;align-items:flex-start;justify-content:center;padding-top:14%;transition:opacity .2s}
.gw-end div{display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 20px;border-radius:20px;background:#fff;box-shadow:0 6px 0 rgba(0,0,0,.12),0 14px 30px rgba(0,0,0,.18);text-align:center;max-width:300px}
.gw-end b{font-size:17px;color:#1d1b26}.gw-end span{font-size:13.5px;font-weight:700;color:#6b6780}
.gw-sx{position:absolute;right:10px;top:10px;width:34px;height:34px;border-radius:11px;display:grid;place-items:center;background:#f4f0e8;border:0}
.gw-subs b{display:block;font-size:17px}.gw-subs p{font-size:13px;font-weight:700;color:#6b6780;margin:2px 0 10px}
.gw-chips{display:flex;flex-wrap:wrap;gap:8px}
.gw-chip{display:flex;align-items:center;gap:7px;padding:7px 12px 7px 7px;border-radius:999px;font-weight:850;font-size:14px;color:#8b8597!important;background:#f0edf5!important;text-decoration:line-through}
.gw-chip i{width:26px;height:26px;border-radius:50%;display:grid;place-items:center;font-style:normal;font-size:12px;font-weight:900;color:#fff;background:#c9c3d4}
.gw-chip.on{color:#fff!important;text-decoration:none;background:linear-gradient(180deg,var(--c),var(--d))!important;box-shadow:0 4px 0 color-mix(in srgb,var(--d) 70%,#000)}
.gw-chip.on i{background:rgba(255,255,255,.25)}
.gw .shk{animation:gwshk .4s}@keyframes gwshk{20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}
.gw-card{position:absolute;left:calc(50% + var(--gl) / 2);bottom:90px;width:min(380px,calc(100% - 28px));transform:translate(-50%,30px) scale(.94);opacity:0;pointer-events:none;padding:16px 16px 14px;border-radius:26px;text-align:center;background:#fff;box-shadow:0 0 0 4px var(--c),0 9px 0 4px var(--d),0 30px 50px -16px rgba(0,0,0,.45);transition:.3s cubic-bezier(.2,1.5,.4,1);z-index:3}
.gw-card.on{transform:translate(-50%,0);opacity:1;pointer-events:auto}
.gw-card.shk{animation:gwshk2 .4s}@keyframes gwshk2{20%,60%{transform:translate(calc(-50% - 6px),0)}40%,80%{transform:translate(calc(-50% + 6px),0)}}
.gw-card small{display:block;font-weight:900;font-size:11.5px;letter-spacing:.08em;text-transform:uppercase;color:var(--d)}
.gw-card b{display:block;font-size:26px;letter-spacing:-.02em;margin:2px 0}
.gw-card span{display:block;font-weight:750;color:#6b6780;margin-bottom:12px}
.gw-go{width:100%;height:56px;border-radius:18px;color:#fff!important;font-weight:900;font-size:19px;background:linear-gradient(180deg,var(--c),var(--d))!important;box-shadow:0 6px 0 color-mix(in srgb,var(--d) 65%,#000)}
.gw-go.off{filter:grayscale(.8);opacity:.6}
.gw-bub{position:absolute;left:0;top:0;z-index:2;pointer-events:none;opacity:0;transition:opacity .3s}
.gw-bub.on{opacity:1}

.gw-bub{--c:#2f86ff}
.gw-bub{font-size:13.5px;font-weight:750;line-height:1.35;color:#2b2440}
.gw-bub{margin:0;padding:9px 13px 10px;border-radius:16px;transition:opacity .3s;background:#fff;box-shadow:0 0 0 3px var(--c),0 6px 0 3px color-mix(in srgb,var(--c) 70%,#000),0 16px 30px -12px rgba(0,0,0,.4);max-width:240px;width:max-content}
.gw-bub b{display:block;font-size:12px;font-weight:900;letter-spacing:.06em;text-transform:uppercase;color:var(--c)}
.gw-load{position:absolute;inset:0;display:grid;place-items:center;background:linear-gradient(180deg,#8fd94f,#5fbf3a);transition:opacity .5s;z-index:5}
.gw-load.off{opacity:0;pointer-events:none}.gw-load b{font-size:20px;color:#fff;text-shadow:0 3px 0 rgba(0,0,0,.15)}
@media (max-width:820px){.gw-top{display:none!important}}
.gw-bub{display:none!important}
@media (max-width:560px){.gw-head{font-size:15px!important;padding-right:14px}.gw-head .gw-hf img{width:34px;height:34px}.gw-head .gw-hf img+img{margin-left:-20px}.gw-tl{gap:6px}.gw-st{font-size:14px;padding:5px 9px 5px 5px}.gw-st i{width:22px;height:22px}.gw-st small{display:none}.gw-stats{gap:5px}.gw-chap{padding:8px 12px 9px}.gw-chap b{font-size:19px}}`,mv=`<canvas class="gw-cv"></canvas><div class="gw-top"><div class="gw-tl"><button class="gw-head"></button><div class="gw-chap"></div></div><div class="gw-stats"><div class="gw-st s"><i><img src="/grundschulmax/sp/ui/star.webp" alt=""></i><span class="gw-hs">0</span><small>Sterne</small></div><div class="gw-st l"><i><img src="/grundschulmax/sp/ui/check.webp" alt=""></i><span class="gw-hl">0</span><small>Lektionen</small></div><div class="gw-st d"><i><img src="/grundschulmax/sp/ui/flame.webp" alt=""></i><span class="gw-hd">0</span><small>Tage</small></div></div></div>
<div class="gw-subs"><button class="gw-sx" aria-label="Schlie\xDFen" onclick="this.parentNode.classList.remove('on')"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M6 6l12 12M18 6L6 18" stroke="#2b2838" stroke-width="3" stroke-linecap="round"/></svg></button><b>Meine F\xE4cher</b><p>Tippe ein Fach an, um es aus dem Pfad zu nehmen.</p><div class="gw-chips"></div></div><div class="gw-bub"></div><div class="gw-card"></div><div class="gw-end"><div><b>Noch nicht freigeschaltet</b><span>Lerne bis hierhin, um weitere Lernbereiche freizuschalten.</span></div></div><div class="gw-load"><b>Die Welt wird gebaut \u2026</b></div>`,gv=!1,vn="",Xn={};function vh(){return{TG:be,SPRS:Ks.slice(),cells:new Map(Ht),path:Zt.slice(),stIdx:ve.slice(),LAVA:di.slice(),DECS:Oi.slice(),CABLES:ls.slice(),animals:Qs.slice(),CH:oe,PER:Di,NR:qn,VOLC:cs.clone(),VPOS:je.clone()}}function Iu(n){be.visible=!1,be=n.TG,be.visible=!0,Ht.clear();for(let[t,e]of n.cells)Ht.set(t,e);Zt.length=0,Zt.push(...n.path),ve.length=0,ve.push(...n.stIdx),di.length=0,di.push(...n.LAVA),Oi.length=0,Oi.push(...n.DECS),ls.length=0,ls.push(...n.CABLES),Qs.length=0,Qs.push(...n.animals),Ks.length=0,Ks.push(...n.SPRS||[]),oe=n.CH,Di=n.PER,qn=n.NR,cs.copy(n.VOLC),je.copy(n.VPOS)}function Lu(n){Ur=n.key,oe=n.ch,Di=n.per,qn=bn*oe.length+30,rh=n.seed||11,be=new Ke,Le.add(be),Ht.clear(),Zt.length=0,dh.length=0,di.length=0,ve.length=0,Oi.length=0,ls.length=0,Qs.length=0,Ks.length=0,cs.set(-999,0,0),je.set(0,0,0),c1(),z1(),h1();for(let e=0;e<oe.length;e++){let i=Zt.map((s,r)=>[s,r]).filter(([[s,r]])=>Ht.get(ue(s,r)).t==="path"&&r<Yn(e)-3&&r>Yn(e)-bn+3).map(([,s])=>s);{let s=Zt[i[0]][1],r=Zt[i[i.length-1]][1],a=-1;for(let o=0;o<Di;o++){let l=s+(r-s)*o/(Di-1),c=i[0],h=1e9;for(let f of i){if(f<=a)continue;let u=Math.abs(Zt[f][1]-l);u<h&&(h=u,c=f)}ve.push(c),a=c}}}_1();let t=C1();return bu=t,y1(),p1(),d1(),H1(),x1(),X1(),W1(),U1(),P1(t),k1(),Xn[n.key]=vh()}function Du(){let n=pe.theme?pe.theme():{key:"mix",ch:["grass","beach","ice","lava","candy","maerchen"],per:6};if(n.key!==vn){if(vn&&!Xn[vn]&&(Xn[vn]=vh()),vn&&Xn[vn]&&(Xn[vn].TG.visible=!1),vn=n.key,Zs.forEach(t=>Le.remove(t.m)),Zs.length=0,go=-1,Xn[n.key])Iu(Xn[n.key]);else{let t=be;t.visible=!1,Lu(n)}gv=!0}}function _v(n){if(Xn[n.key]||!vn)return;let t=Xn[vn]||vh();Lu(n),Xn[n.key].TG.visible=!1,Iu(t)}function Uu(){let n=Re(".gw-head");if(!n)return;let t=pe.head?pe.head():null;if(!t){n.style.display="none";return}n.style.display="",n.style.setProperty("--h1",t.c1),n.style.setProperty("--h2",t.c2),n.style.setProperty("--h3",t.c3||t.c2),n.innerHTML=`<span class="gw-hf">${t.imgs.map(e=>`<img src="${e}" alt="">`).join("")}</span>${t.title}`,n.onclick=()=>{Ui(620,.05),t.click()}}async function Nu(n){pe=n;let t=vn;Du(),tr(),Re(".gw-subs").classList.remove("on"),Ne.dataset.theme=vn,mh(),Uu(),Ie=Or(),Fr(Zn(Ie)),lh(),fo();let e=pe;yh(pe.face()).then(()=>{pe===e&&fo()}),lh(),go=-1,Nr();try{yn.render(Le,hn)}catch{}return kr}async function vv(n,t){if(yn)return Ne!==n&&n.replaceWith,Nu(t);if(Ne=n,pe=t,n.classList.add("gw"),!document.getElementById("gw-css")){let i=document.createElement("style");i.id="gw-css",i.textContent=pv,document.head.appendChild(i)}n.innerHTML=mv,a1();let e=new Set;return rs.addEventListener("pointercancel",i=>{e.delete(i.pointerId),qs=!1,Li=0}),rs.addEventListener("pointerdown",i=>{if(e.add(i.pointerId),e.size>1){qs=!1,Li=0,Rr=99;return}qs=!0,jc=i.clientY,th=i.clientX,Rr=0,Li=0,eh=performance.now(),rs.setPointerCapture(i.pointerId)}),rs.addEventListener("pointermove",i=>{if(!qs||e.size>1)return;let s=i.clientY-jc,r=i.clientX-th;Rr+=Math.abs(s)+Math.abs(r),jc=i.clientY,th=i.clientX;let a=ov(),o=-s*a;qe=Ue(qe+o,Ni(),os()),ui=Ue(ui-r*a,-Mn(),Mn());let l=performance.now();Li=o/Math.max(8,l-eh)*16,eh=l}),rs.addEventListener("pointerup",i=>{let s=e.size>1;if(e.delete(i.pointerId),qs=!1,s){Li=0,Rr=99;return}Rr<8&&lv(i)}),["gesturestart","gesturechange"].forEach(i=>n.addEventListener(i,s=>s.preventDefault(),{passive:!1})),n.addEventListener("touchmove",i=>{i.touches.length>1&&i.preventDefault()},{passive:!1}),n.addEventListener("wheel",i=>{if(i.target.closest(".gw-subs,.gw-card"))return;i.preventDefault();let s=i.deltaMode===1?.6:.022;qe=Ue(qe+i.deltaY*s,Ni(),os()),ui=Ue(ui+i.deltaX*s,-Mn(),Mn())},{passive:!1}),addEventListener("keydown",i=>{if(!Ne.offsetParent||/INPUT|TEXTAREA/.test(document.activeElement.tagName))return;let s={ArrowUp:-3,ArrowDown:3}[i.key];s&&(qe=Ue(qe+s,Ni(),os()),i.preventDefault())}),new ResizeObserver(()=>Nr()).observe(n),Nr(),Du(),await yh(pe.face()),mh(),fo(),Uu(),lh(),Re(".gw-load").classList.add("off"),cancelAnimationFrame(uh),fh(),kr}var so=n=>new Promise(t=>{if(!n)return t(null);let e=new Image;e.onload=()=>t(e),e.onerror=()=>t(null),e.src=n});async function yh(n){[ht.img,ht.ib,ht.ih,ht.is]=await Promise.all([so(n.src),so(n.blink),so(n.happy),so(n.sad)]),ht.eyes=n.eyes||null,ht.lid=n.lid||"#f27a24",ht.fit=n.fit||{x:14,y:16,s:228},hh()}var kr={refresh:Cu,render:()=>{try{Nr(),yn.render(Le,hn)}catch{}},hopTo:n=>uo(n),mood:n=>po(n),resize:Nr,subjects:()=>Re(".gw-subs").classList.toggle("on"),hideCard:tr,tapCur:()=>{let n=Sn(),t=kn.find(i=>i.userData&&i.userData.i===n);if(!t)return;let e=t.userData;qe=Ue(t.position.z,Ni(),os()),Ie!==e.i&&!$n?(tr(),uo(e.i).then(()=>setTimeout(()=>mo(e),250))):mo(e)},cur:()=>Sn(),face:n=>yh(n),focus:n=>{let t=Zn(n);qe=t.z,ui=Ue(t.x,-Mn(),Mn())},pause:n=>{Pu=n},hero:()=>fo(),screen:n=>{let t=Zn(n).clone().setY(1.8).project(hn),e=Ne.getBoundingClientRect();return{x:e.left+(t.x+1)/2*e.width,y:e.top+(1-t.y)/2*e.height}},cur:()=>Sn()};kr.switchTo=Nu;kr.prebuild=_v;kr.root=()=>Ne;window.GSMPfad={start:vv};})();
/*! Bundled license information:

three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2024 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
