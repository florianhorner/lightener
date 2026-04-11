function t(t,e,i,s){var r,n=arguments.length,o=n<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(o=(n<3?r(o):n>3?r(e,i,o):r(e,i))||o);return n>3&&o&&Object.defineProperty(e,i,o),o}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),r=new WeakMap;let n=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=r.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(e,t))}return t}toString(){return this.cssText}};const o=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new n(i,t,s)},a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new n("string"==typeof t?t:t+"",void 0,s))(e)})(t):t,{is:l,defineProperty:c,getOwnPropertyDescriptor:h,getOwnPropertyNames:d,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,g=globalThis,v=g.trustedTypes,_=v?v.emptyScript:"",f=g.reactiveElementPolyfillSupport,y=(t,e)=>t,b={toAttribute(t,e){switch(e){case Boolean:t=t?_:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},x=(t,e)=>!l(t,e),m={attribute:!0,type:String,converter:b,reflect:!1,useDefault:!1,hasChanged:x};Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=m){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&c(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:r}=h(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const n=s?.call(this);r?.call(this,e),this.requestUpdate(t,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??m}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const t=this.properties,e=[...d(t),...p(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,s)=>{if(i)t.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of s){const s=document.createElement("style"),r=e.litNonce;void 0!==r&&s.setAttribute("nonce",r),s.textContent=i.cssText,t.appendChild(s)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:b).toAttribute(e,i.type);this._$Em=t,null==r?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:b;this._$Em=s;const n=r.fromAttribute(e,t.type);this[s]=n??this._$Ej?.get(s)??n,this._$Em=null}}requestUpdate(t,e,i,s=!1,r){if(void 0!==t){const n=this.constructor;if(!1===s&&(r=this[t]),i??=n.getPropertyOptions(t),!((i.hasChanged??x)(r,e)||i.useDefault&&i.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:r},n){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),!0!==r||void 0!==n)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[y("elementProperties")]=new Map,$[y("finalized")]=new Map,f?.({ReactiveElement:$}),(g.reactiveElementVersions??=[]).push("2.1.2");const w=globalThis,C=t=>t,k=w.trustedTypes,A=k?k.createPolicy("lit-html",{createHTML:t=>t}):void 0,P="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,S="?"+E,I=`<${S}>`,M=document,U=()=>M.createComment(""),T=t=>null===t||"object"!=typeof t&&"function"!=typeof t,D=Array.isArray,O="[ \t\n\f\r]",R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,L=/-->/g,z=/>/g,N=RegExp(`>|${O}(?:([^\\s"'>=/]+)(${O}*=${O}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),H=/'/g,B=/"/g,j=/^(?:script|style|textarea|title)$/i,F=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),q=F(1),K=F(2),V=Symbol.for("lit-noChange"),G=Symbol.for("lit-nothing"),W=new WeakMap,X=M.createTreeWalker(M,129);function Y(t,e){if(!D(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(e):e}const Z=(t,e)=>{const i=t.length-1,s=[];let r,n=2===e?"<svg>":3===e?"<math>":"",o=R;for(let e=0;e<i;e++){const i=t[e];let a,l,c=-1,h=0;for(;h<i.length&&(o.lastIndex=h,l=o.exec(i),null!==l);)h=o.lastIndex,o===R?"!--"===l[1]?o=L:void 0!==l[1]?o=z:void 0!==l[2]?(j.test(l[2])&&(r=RegExp("</"+l[2],"g")),o=N):void 0!==l[3]&&(o=N):o===N?">"===l[0]?(o=r??R,c=-1):void 0===l[1]?c=-2:(c=o.lastIndex-l[2].length,a=l[1],o=void 0===l[3]?N:'"'===l[3]?B:H):o===B||o===H?o=N:o===L||o===z?o=R:(o=N,r=void 0);const d=o===N&&t[e+1].startsWith("/>")?" ":"";n+=o===R?i+I:c>=0?(s.push(a),i.slice(0,c)+P+i.slice(c)+E+d):i+E+(-2===c?e:d)}return[Y(t,n+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class J{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let r=0,n=0;const o=t.length-1,a=this.parts,[l,c]=Z(t,e);if(this.el=J.createElement(l,i),X.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=X.nextNode())&&a.length<o;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(P)){const e=c[n++],i=s.getAttribute(t).split(E),o=/([.?@])?(.*)/.exec(e);a.push({type:1,index:r,name:o[2],strings:i,ctor:"."===o[1]?st:"?"===o[1]?rt:"@"===o[1]?nt:it}),s.removeAttribute(t)}else t.startsWith(E)&&(a.push({type:6,index:r}),s.removeAttribute(t));if(j.test(s.tagName)){const t=s.textContent.split(E),e=t.length-1;if(e>0){s.textContent=k?k.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],U()),X.nextNode(),a.push({type:2,index:++r});s.append(t[e],U())}}}else if(8===s.nodeType)if(s.data===S)a.push({type:2,index:r});else{let t=-1;for(;-1!==(t=s.data.indexOf(E,t+1));)a.push({type:7,index:r}),t+=E.length-1}r++}}static createElement(t,e){const i=M.createElement("template");return i.innerHTML=t,i}}function Q(t,e,i=t,s){if(e===V)return e;let r=void 0!==s?i._$Co?.[s]:i._$Cl;const n=T(e)?void 0:e._$litDirective$;return r?.constructor!==n&&(r?._$AO?.(!1),void 0===n?r=void 0:(r=new n(t),r._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=r:i._$Cl=r),void 0!==r&&(e=Q(t,r._$AS(t,e.values),r,s)),e}class tt{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??M).importNode(e,!0);X.currentNode=s;let r=X.nextNode(),n=0,o=0,a=i[0];for(;void 0!==a;){if(n===a.index){let e;2===a.type?e=new et(r,r.nextSibling,this,t):1===a.type?e=new a.ctor(r,a.name,a.strings,this,t):6===a.type&&(e=new ot(r,this,t)),this._$AV.push(e),a=i[++o]}n!==a?.index&&(r=X.nextNode(),n++)}return X.currentNode=M,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class et{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=G,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Q(this,t,e),T(t)?t===G||null==t||""===t?(this._$AH!==G&&this._$AR(),this._$AH=G):t!==this._$AH&&t!==V&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>D(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==G&&T(this._$AH)?this._$AA.nextSibling.data=t:this.T(M.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=J.createElement(Y(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new tt(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=W.get(t.strings);return void 0===e&&W.set(t.strings,e=new J(t)),e}k(t){D(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const r of t)s===e.length?e.push(i=new et(this.O(U()),this.O(U()),this,this.options)):i=e[s],i._$AI(r),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=C(t).nextSibling;C(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class it{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,r){this.type=1,this._$AH=G,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=G}_$AI(t,e=this,i,s){const r=this.strings;let n=!1;if(void 0===r)t=Q(this,t,e,0),n=!T(t)||t!==this._$AH&&t!==V,n&&(this._$AH=t);else{const s=t;let o,a;for(t=r[0],o=0;o<r.length-1;o++)a=Q(this,s[i+o],e,o),a===V&&(a=this._$AH[o]),n||=!T(a)||a!==this._$AH[o],a===G?t=G:t!==G&&(t+=(a??"")+r[o+1]),this._$AH[o]=a}n&&!s&&this.j(t)}j(t){t===G?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class st extends it{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===G?void 0:t}}class rt extends it{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==G)}}class nt extends it{constructor(t,e,i,s,r){super(t,e,i,s,r),this.type=5}_$AI(t,e=this){if((t=Q(this,t,e,0)??G)===V)return;const i=this._$AH,s=t===G&&i!==G||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==G&&(i===G||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class ot{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Q(this,t)}}const at=w.litHtmlPolyfillSupport;at?.(J,et),(w.litHtmlVersions??=[]).push("3.3.2");const lt=globalThis;class ct extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let r=s._$litPart$;if(void 0===r){const t=i?.renderBefore??null;s._$litPart$=r=new et(e.insertBefore(U(),t),t,void 0,i??{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return V}}ct._$litElement$=!0,ct.finalized=!0,lt.litElementHydrateSupport?.({LitElement:ct});const ht=lt.litElementPolyfillSupport;ht?.({LitElement:ct}),(lt.litElementVersions??=[]).push("4.2.2");const dt=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},pt={attribute:!0,type:String,converter:b,reflect:!1,hasChanged:x},ut=(t=pt,e,i)=>{const{kind:s,metadata:r}=i;let n=globalThis.litPropertyMetadata.get(r);if(void 0===n&&globalThis.litPropertyMetadata.set(r,n=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),n.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const r=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,r,t,!0,i)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const r=this[s];e.call(this,i),this.requestUpdate(s,r,t,!0,i)}}throw Error("Unsupported decorator location: "+s)};function gt(t){return(e,i)=>"object"==typeof i?ut(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function vt(t){return gt({...t,state:!0,attribute:!1})}function _t(t){return t.map(t=>({...t,controlPoints:t.controlPoints.map(t=>({...t}))}))}function ft(t){const e=new Map;e.set(0,0);for(const i of t)e.set(i.lightener,i.target);e.has(100)||e.set(100,100);const i=[];for(const[t,s]of e)i.push({lightener:t,target:s});return i.sort((t,e)=>t.lightener-e.lightener),i}const yt=44,bt=12,xt=300,mt=200;function $t(t){return yt+t/100*xt}function wt(t){return bt+(1-t/100)*mt}function Ct(t,e,i){return Math.max(e,Math.min(i,t))}function kt(t){const e=t.length,i=[],s=[],r=[];for(let n=0;n<e-1;n++)i.push(t[n+1].x-t[n].x),s.push(t[n+1].y-t[n].y),r.push(s[n]/(i[n]||1));const n=new Array(e);n[0]=r[0],n[e-1]=r[e-2];for(let t=1;t<e-1;t++)n[t]=(r[t-1]+r[t])/2;return{dx:i,tangents:n}}function At(t,e){return function(t,e){if(t.length<2)return 0;if(2===t.length){const[i,s]=t,r=s.x-i.x;if(0===r)return i.y;const n=(e-i.x)/r;return i.y+n*(s.y-i.y)}const{dx:i,tangents:s}=kt(t);let r=0;for(let i=0;i<t.length-1;i++){if(e<=t[i+1].x){r=i;break}r=i}const n=i[r]||1,o=Ct((e-t[r].x)/n,0,1),a=n/3,l=1-o;return l*l*l*t[r].y+3*l*l*o*(t[r].y+s[r]*a)+3*l*o*o*(t[r+1].y-s[r+1]*a)+o*o*o*t[r+1].y}(ft(t).map(t=>({x:t.lightener,y:t.target})),e)}const Pt=["#42a5f5","#ef5350","#5c6bc0","#ffa726","#ab47bc","#1565c0","#ec407a","#8d6e63","#ffca28","#7e57c2"];const Et=["","8 4","4 4","12 4 4 4","2 4"];let St=class extends ct{constructor(){super(...arguments),this.curves=[],this.selectedCurveId=null,this.readOnly=!1,this.scrubberPosition=null,this._dragCurveIdx=-1,this._dragPointIdx=-1,this._hoveredPoint=null,this._isMobile=!1,this._mql=null,this._wasDragging=!1,this._longPressTimer=null,this._longPressFired=!1,this._onMqlChange=t=>{this._isMobile=t.matches}}_getSvgCoords(t){const e=this._svgRef;if(!e)return null;const i=e.getScreenCTM();if(!i)return null;const s=i.inverse(),r=e.createSVGPoint();r.x=t.clientX,r.y=t.clientY;const n=r.matrixTransform(s);return{x:(a=n.x,(a-yt)/xt*100),y:(o=n.y,100*(1-(o-bt)/mt))};var o,a}_isCurveInteractive(t){return!this.readOnly&&(null===this.selectedCurveId||this.curves[t]?.entityId===this.selectedCurveId)}_onPointerDown(t,e,i){0===t.button&&this._isCurveInteractive(e)&&0!==i&&(t.preventDefault(),this._longPressFired=!1,this._clearLongPress(),this._longPressTimer=setTimeout(()=>{this._longPressFired=!0,this._dragCurveIdx=-1,this._dragPointIdx=-1,this.dispatchEvent(new CustomEvent("point-remove",{detail:{curveIndex:e,pointIndex:i},bubbles:!0,composed:!0}))},500),this._svgRef?.setPointerCapture(t.pointerId),this._dragCurveIdx=e,this._dragPointIdx=i)}_clearLongPress(){this._longPressTimer&&(clearTimeout(this._longPressTimer),this._longPressTimer=null)}_onPointerMove(t){if(this._dragCurveIdx<0)return;t.preventDefault(),this._clearLongPress();const e=this._getSvgCoords(t);if(!e)return;const i=this.curves[this._dragCurveIdx],s=i?.controlPoints??[],r=this._dragPointIdx>0?s[this._dragPointIdx-1].lightener+1:1,n=this._dragPointIdx<s.length-1?s[this._dragPointIdx+1].lightener-1:100,o=Math.round(Ct(e.x,r,n)),a=Math.round(Ct(e.y,0,100));this.dispatchEvent(new CustomEvent("point-move",{detail:{curveIndex:this._dragCurveIdx,pointIndex:this._dragPointIdx,lightener:o,target:a},bubbles:!0,composed:!0}))}_onPointerUp(t){this._clearLongPress(),this._longPressFired||this._dragCurveIdx<0||(t.preventDefault(),this.dispatchEvent(new CustomEvent("point-drop",{detail:{curveIndex:this._dragCurveIdx,pointIndex:this._dragPointIdx},bubbles:!0,composed:!0})),this._dragCurveIdx=-1,this._dragPointIdx=-1,this._wasDragging=!0,setTimeout(()=>{this._wasDragging=!1},400))}_onPointContextMenu(t,e,i){t.preventDefault(),t.stopPropagation(),this.readOnly||this._isCurveInteractive(e)&&0!==i&&this.dispatchEvent(new CustomEvent("point-remove",{detail:{curveIndex:e,pointIndex:i},bubbles:!0,composed:!0}))}_onDblClick(t){if(this.readOnly)return;if(this._wasDragging)return;const e=this._getSvgCoords(t);if(!e)return;const i=Math.round(Ct(e.x,1,100)),s=Math.round(Ct(e.y,0,100));this.dispatchEvent(new CustomEvent("point-add",{detail:{lightener:i,target:s,entityId:this.selectedCurveId},bubbles:!0,composed:!0}))}_renderGrid(){return K`
      <!-- Diagonal reference line (1:1) -->
      <line class="diagonal-ref"
        x1="${$t(0)}" y1="${wt(0)}"
        x2="${$t(100)}" y2="${wt(100)}" />

      ${[0,25,50,75,100].map(t=>K`
        <!-- Vertical grid -->
        <line class="grid-line"
          x1="${$t(t)}" y1="${wt(0)}"
          x2="${$t(t)}" y2="${wt(100)}" />
        <!-- Horizontal grid -->
        <line class="grid-line"
          x1="${$t(0)}" y1="${wt(t)}"
          x2="${$t(100)}" y2="${wt(t)}" />
        <!-- X tick labels -->
        <text class="tick-label" text-anchor="middle"
          x="${$t(t)}" y="${228}">${t}%</text>
        <!-- Y tick labels -->
        <text class="tick-label" text-anchor="end" dominant-baseline="middle"
          x="${38}" y="${wt(t)}">${t}%</text>
      `)}

      <!-- Axis border lines -->
      <line class="axis-line"
        x1="${yt}" y1="${wt(0)}"
        x2="${344}" y2="${wt(0)}" />
      <line class="axis-line"
        x1="${yt}" y1="${wt(0)}"
        x2="${yt}" y2="${wt(100)}" />

      <!-- Axis labels -->
      <text class="axis-label" text-anchor="middle"
        x="${194}" y="${244}">Group brightness</text>
      <text class="axis-label" text-anchor="middle"
        transform="rotate(-90, 10, ${112})"
        x="10" y="${112}">Light brightness</text>
    `}_renderCrossHair(t){if(this._dragCurveIdx<0)return G;const e=t.controlPoints[this._dragPointIdx];if(!e)return G;const i=$t(e.lightener),s=wt(e.target);return K`
      <line class="crosshair"
        x1="${i}" y1="${s}"
        x2="${i}" y2="${wt(0)}"
        stroke="${t.color}" opacity="0.5" />
      <line class="crosshair"
        x1="${i}" y1="${s}"
        x2="${yt}" y2="${s}"
        stroke="${t.color}" opacity="0.5" />
    `}_renderTooltip(t,e){const i=$t(e.lightener),s=wt(e.target),r=`${e.lightener}:${e.target}`,n=5*r.length,o=Ct(i-n/2-2,yt,344-n-8),a=Math.max(16,s-16);return K`
      <rect class="tooltip-bg"
        x="${o}" y="${a-8}"
        width="${n+8}" height="14" />
      <text class="tooltip-text" text-anchor="start"
        x="${o+4}" y="${a+2}">${r}</text>
    `}_renderScrubberIndicator(){if(null===this.scrubberPosition)return G;const t=this.scrubberPosition,e=$t(t),i=K`
      <rect
        x="${e}" y="${wt(100)}"
        width="${$t(100)-e}" height="${mt}"
        fill="var(--ha-card-background, var(--card-background-color, #1c1c1c))"
        opacity="0.25"
        pointer-events="none"
      />
    `,s=K`
      <line class="scrubber-line"
        x1="${e}" y1="${wt(0)}"
        x2="${e}" y2="${wt(100)}" />
    `,r=this.curves.filter(t=>t.visible).map(i=>{const s=wt(At(i.controlPoints,t));return K`
          <circle
            class="scrubber-dot"
            cx="${e}" cy="${s}"
            r="4"
            fill="${i.color}"
            filter="url(#scrubber-glow-${i.color.replace("#","")})"
            pointer-events="none"
          />
        `});return K`${i}${s}${r}`}_renderCurve(t,e){if(!t.visible||!t.controlPoints.length)return G;try{const i=null===this.selectedCurveId||t.entityId===this.selectedCurveId,s=this._isCurveInteractive(e)&&!this.readOnly,r=ft(t.controlPoints),n=function(t){if(t.length<2)return"";if(2===t.length)return`M${t[0].x},${t[0].y} L${t[1].x},${t[1].y}`;const{dx:e,tangents:i}=kt(t);let s=`M${t[0].x},${t[0].y}`;for(let r=0;r<t.length-1;r++){const n=e[r]/3;s+=` C${t[r].x+n},${t[r].y+i[r]*n} ${t[r+1].x-n},${t[r+1].y-i[r+1]*n} ${t[r+1].x},${t[r+1].y}`}return s}(r.map(t=>({x:$t(t.lightener),y:wt(t.target)}))),o=n+` L${$t(r[r.length-1].lightener)},${wt(0)}`+` L${$t(0)},${wt(0)} Z`,a=`grad-${e}`,l=Et[e%Et.length],c=this._dragCurveIdx===e,h=t.color+"33",d=i?1:.2;let p=null;return c&&this._dragPointIdx>=0?p=t.controlPoints[this._dragPointIdx]:this._hoveredPoint?.curve===e&&s&&(p=t.controlPoints[this._hoveredPoint.point]),K`
      <defs>
        <linearGradient id="${a}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${t.color}" stop-opacity="${i?.45:.06}" />
          <stop offset="100%" stop-color="${t.color}" stop-opacity="${i?.08:0}" />
        </linearGradient>
      </defs>
      ${c?this._renderCrossHair(t):G}
      <path
        d="${o}"
        fill="url(#${a})"
        style="opacity: ${d}"
        pointer-events="none"
      />
      <path
        class="curve-line"
        d="${n}"
        stroke="${t.color}"
        stroke-dasharray="${l}"
        style="opacity: ${d}"
        pointer-events="none"
      />
      ${s?t.controlPoints.map((i,s)=>{const r=0===i.lightener,n=c&&this._dragPointIdx===s,o=this._hoveredPoint?.curve===e&&this._hoveredPoint?.point===s;return K`
              <circle
                class="hit-circle"
                cx="${$t(i.lightener)}"
                cy="${wt(i.target)}"
                r="${this._isMobile?28:22}"
                fill="transparent"
                pointer-events="all"
                style="touch-action: none; -webkit-touch-callout: none"
                @pointerdown=${t=>this._onPointerDown(t,e,s)}
                @contextmenu=${t=>this._onPointContextMenu(t,e,s)}
                @pointerenter=${()=>this._hoveredPoint={curve:e,point:s}}
                @pointerleave=${()=>this._hoveredPoint=null}
              />
              <circle
                class="control-point ${r?"fixed":""} ${n?"dragging":""} ${o?"hovered":""}"
                cx="${$t(i.lightener)}"
                cy="${wt(i.target)}"
                r="6"
                fill="${h}"
                stroke="${t.color}"
                stroke-width="2"
                style="--glow-color: ${t.color}"
                pointer-events="none"
              />
            `}):G}
      ${null!==p?this._renderTooltip(t,p):G}
    `}catch{return G}}connectedCallback(){super.connectedCallback(),this._mql=window.matchMedia("(max-width: 500px)"),this._isMobile=this._mql.matches,this._mql.addEventListener("change",this._onMqlChange)}disconnectedCallback(){super.disconnectedCallback(),this._clearLongPress(),this._mql?.removeEventListener("change",this._onMqlChange),this._mql=null}render(){return q`
      <svg
        viewBox="0 0 ${356} ${248}"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Brightness curve editor graph"
        @pointermove=${this._onPointerMove}
        @pointerup=${this._onPointerUp}
        @lostpointercapture=${this._onPointerUp}
        @dblclick=${this._onDblClick}
        @contextmenu=${t=>{this.readOnly||t.preventDefault()}}
      >
        ${this._renderGrid()}

        <!-- Invisible hit area for double-click -->
        ${this.readOnly?G:q`<rect
              class="hit-area"
              x="${yt}"
              y="${bt}"
              width="${xt}"
              height="${mt}"
              pointer-events="all"
              fill="transparent"
            />`}
        ${(()=>{const t=this.selectedCurveId?this.curves.findIndex(t=>t.entityId===this.selectedCurveId):-1,e=t>0?[...this.curves.slice(0,t).map((t,e)=>({curve:t,idx:e})),...this.curves.slice(t+1).map((e,i)=>({curve:e,idx:t+1+i})),{curve:this.curves[t],idx:t}]:this.curves.map((t,e)=>({curve:t,idx:e}));return e.map(({curve:t,idx:e})=>this._renderCurve(t,e))})()}
        <!-- Scrubber glow filters (only re-render when curves change, not on every position update) -->
        <defs>
          ${this.curves.filter(t=>t.visible).map(t=>{const e=`scrubber-glow-${t.color.replace("#","")}`;return K`
              <filter id="${e}" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                <feFlood flood-color="${t.color}" flood-opacity="0.5" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>`})}
        </defs>
        ${this._renderScrubberIndicator()}
        ${(()=>{if(this.readOnly)return G;if(null===this.selectedCurveId&&this._dragCurveIdx<0)return K`<text class="hint hint-select" text-anchor="middle"
                x="${194}" y="${112}"
                >Select a light below to start editing</text>`;const t=this.curves.find(t=>t.entityId===this.selectedCurveId);return K`
              <text class="editing-label"
                x="${50}" y="${26}"
                fill="${t?.color??"currentColor"}"
                >Editing: ${t?.friendlyName??""}</text>
              <text class="hint" text-anchor="end"
                x="${340}" y="${206}"
                >Dbl-click to add · Right-click or long-press to remove</text>`})()}
      </svg>
    `}};St.styles=o`
    :host {
      display: block;
    }
    svg {
      width: 100%;
      height: auto;
      max-height: 320px;
      display: block;
      border-radius: 6px;
      touch-action: none;
    }
    .grid-line {
      stroke: var(--secondary-text, #616161);
      stroke-width: 0.5;
      opacity: 0.15;
    }
    .axis-line {
      stroke: var(--secondary-text, #616161);
      stroke-width: 0.75;
      opacity: 0.4;
    }
    .axis-label {
      fill: var(--secondary-text, #616161);
      font-size: 10px;
      font-weight: 500;
      font-family: inherit;
    }
    .tick-label {
      fill: var(--secondary-text, #616161);
      font-size: 10px;
      font-weight: 500;
      font-family: inherit;
    }
    .curve-line {
      fill: none;
      stroke-width: 2.5;
      stroke-linecap: round;
      stroke-linejoin: round;
      transition: opacity 0.3s ease;
    }
    .control-point {
      cursor: grab;
      transition:
        r 0.15s ease,
        filter 0.15s ease;
    }
    .control-point:hover,
    .control-point.hovered {
      r: 7.5;
      filter: drop-shadow(0 0 6px var(--glow-color, #42a5f5));
    }
    .control-point.dragging {
      cursor: grabbing;
      r: 8;
      filter: drop-shadow(0 0 8px var(--glow-color, #42a5f5));
    }
    .control-point.fixed {
      cursor: default;
      opacity: 0.5;
    }
    .hit-area {
      fill: transparent;
      cursor: crosshair;
    }
    .hint {
      fill: var(--secondary-text, #616161);
      font-size: 11px;
      font-family: inherit;
      opacity: 0.8;
    }
    .hint-select {
      font-weight: 500;
    }
    .editing-label {
      font-size: 10px;
      font-family: inherit;
      opacity: 0.7;
      font-weight: 500;
    }
    .diagonal-ref {
      stroke: var(--secondary-text, #616161);
      stroke-width: 0.75;
      opacity: 0.12;
      stroke-dasharray: 4 3;
    }
    .crosshair {
      stroke-width: 0.75;
      stroke-dasharray: 3 3;
    }
    @media (max-width: 500px) {
      svg {
        min-height: 180px;
      }
      .axis-label,
      .tick-label {
        font-size: 12px;
      }
      .hint {
        font-size: 12px;
      }
      .editing-label {
        font-size: 12px;
      }
      .tooltip-text {
        font-size: 11px;
      }
    }
    .scrubber-line {
      stroke: var(--secondary-text, #616161);
      stroke-width: 0.75;
      stroke-dasharray: 3 3;
      opacity: 0.3;
    }
    .scrubber-dot {
      stroke: none;
    }
    .tooltip-bg {
      fill: var(--tooltip-background-color, var(--primary-text-color, #212121));
      rx: 3;
      ry: 3;
      opacity: 0.9;
    }
    .tooltip-text {
      fill: var(--tooltip-text-color, var(--card-background-color, #fff));
      font-size: 9.5px;
      font-family: inherit;
    }
  `,t([gt({type:Array})],St.prototype,"curves",void 0),t([gt({type:String})],St.prototype,"selectedCurveId",void 0),t([gt({type:Boolean})],St.prototype,"readOnly",void 0),t([gt({type:Number})],St.prototype,"scrubberPosition",void 0),t([vt()],St.prototype,"_dragCurveIdx",void 0),t([vt()],St.prototype,"_dragPointIdx",void 0),t([vt()],St.prototype,"_hoveredPoint",void 0),t([vt()],St.prototype,"_isMobile",void 0),t([function(t){return(e,i,s)=>((t,e,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof e&&Object.defineProperty(t,e,i),i))(e,i,{get(){return(e=>e.renderRoot?.querySelector(t)??null)(this)}})}("svg")],St.prototype,"_svgRef",void 0),St=t([dt("curve-graph")],St);let It=class extends ct{constructor(){super(...arguments),this.curves=[],this.readOnly=!1,this._position=50,this._dragging=!1,this._trackRef=null}_badgeTextColor(t){const e=t.toLowerCase();return"#ffca28"===e?"#9e7c00":"#ffa726"===e?"#b36b00":t}_getInterpolatedValues(){const t=Math.round(this._position);return this.curves.filter(t=>t.visible).map(e=>({entityId:e.entityId,name:e.friendlyName,color:e.color,value:Math.round(At(e.controlPoints,t))}))}_onPointerDown(t){this.readOnly||(t.preventDefault(),this._dragging=!0,t.target.setPointerCapture(t.pointerId),this._updatePositionFromClient(t.clientX),this.dispatchEvent(new CustomEvent("scrubber-start",{bubbles:!0,composed:!0})))}_onPointerMove(t){this._dragging&&(t.preventDefault(),this._updatePositionFromClient(t.clientX))}_onPointerUp(){this._dragging&&(this._dragging=!1,this.dispatchEvent(new CustomEvent("scrubber-end",{bubbles:!0,composed:!0})))}_onTrackClick(t){this.readOnly||(this.dispatchEvent(new CustomEvent("scrubber-start",{bubbles:!0,composed:!0})),this._updatePositionFromClient(t.clientX),setTimeout(()=>{this.dispatchEvent(new CustomEvent("scrubber-end",{bubbles:!0,composed:!0}))},1500))}_onKeyDown(t){if(this.readOnly)return;const e=t.shiftKey?10:1;if("ArrowRight"===t.key||"ArrowUp"===t.key)t.preventDefault(),this._position=Math.min(100,this._position+e);else if("ArrowLeft"===t.key||"ArrowDown"===t.key)t.preventDefault(),this._position=Math.max(0,this._position-e);else if("Home"===t.key)t.preventDefault(),this._position=0;else{if("End"!==t.key)return;t.preventDefault(),this._position=100}this._emitPosition()}_updatePositionFromClient(t){const e=this._trackRef;if(!e)return;const i=e.getBoundingClientRect(),s=(t-i.left)/i.width*100;this._position=Math.max(0,Math.min(100,s)),this._emitPosition()}_emitPosition(){this.dispatchEvent(new CustomEvent("scrubber-move",{detail:{position:this._position},bubbles:!0,composed:!0}))}firstUpdated(){this._trackRef=this.renderRoot.querySelector(".track-area")}render(){const t=this._getInterpolatedValues(),e=Math.round(this._position);return q`
      <div class="scrubber-panel">
        <div class="scrubber-label">Preview at brightness</div>
        <div
          class="track-area"
          role="slider"
          tabindex="0"
          aria-label="Brightness scrubber"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow=${e}
          aria-valuetext="${e}% brightness"
          @click=${this._onTrackClick}
          @keydown=${this._onKeyDown}
        >
          <div class="track-bg"></div>
          <div class="track-fill" style="width: ${this._position}%"></div>
          <div class="position-label" style="left: ${this._position}%">${e}%</div>
          <div
            class="thumb ${this._dragging?"dragging":""}"
            style="left: ${this._position}%"
            @pointerdown=${this._onPointerDown}
            @pointermove=${this._onPointerMove}
            @pointerup=${this._onPointerUp}
            @lostpointercapture=${this._onPointerUp}
          ></div>
        </div>

        <div class="value-badges">
          ${t.map(t=>q`
              <div class="badge">
                <span class="badge-dot" style="background: ${t.color}"></span>
                <span style="color: ${this._badgeTextColor(t.color)}">${t.value}%</span>
                <span class="badge-name">${t.name}</span>
              </div>
            `)}
        </div>
      </div>
    `}};var Mt;It.styles=o`
    :host {
      display: block;
    }
    .scrubber-panel {
      border-radius: 12px;
      padding: 14px 12px 12px;
      margin-bottom: 8px;
      background: color-mix(
        in srgb,
        var(--ha-card-background, var(--card-background-color, #fff)) 95%,
        var(--secondary-text-color, #616161) 5%
      );
    }
    .scrubber-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--secondary-text-color, #616161);
      opacity: 0.7;
      margin-bottom: 10px;
    }
    .track-area {
      position: relative;
      height: 28px;
      cursor: pointer;
      touch-action: none;
      /* Align with graph plot area: scrubber panel now has same 12px side
         padding as graph panel, so % margins match the SVG axis padding. */
      margin-left: ${yt/356*100}%;
      margin-right: ${12/356*100}%;
    }
    .track-bg {
      position: absolute;
      top: 12px;
      left: 0;
      right: 0;
      height: 4px;
      border-radius: 2px;
      background: rgba(37, 99, 235, 0.25);
    }
    .track-fill {
      position: absolute;
      top: 12px;
      left: 0;
      height: 4px;
      border-radius: 2px;
      background: linear-gradient(90deg, rgba(37, 99, 235, 0.25), #2563eb);
      transition: width 0.05s linear;
    }
    .thumb {
      position: absolute;
      top: 6px;
      width: 16px;
      height: 16px;
      background: #2563eb;
      border-radius: 50%;
      transform: translateX(-50%);
      cursor: grab;
      border: 2px solid var(--ha-card-background, var(--card-background-color, #fff));
      box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
      transition: box-shadow 0.15s ease;
      z-index: 2;
    }
    .thumb::after {
      content: '';
      position: absolute;
      top: -14px;
      left: -14px;
      right: -14px;
      bottom: -14px;
    }
    .thumb:hover {
      box-shadow: 0 2px 10px rgba(37, 99, 235, 0.45);
    }
    .thumb.dragging {
      cursor: grabbing;
      box-shadow: 0 2px 14px rgba(37, 99, 235, 0.5);
    }
    .position-label {
      position: absolute;
      top: -10px;
      font-size: 10px;
      font-weight: 600;
      color: #2563eb;
      transform: translateX(-50%);
      user-select: none;
      font-variant-numeric: tabular-nums;
      pointer-events: none;
    }
    .value-badges {
      display: flex;
      gap: 4px 6px;
      margin-top: 10px;
      flex-wrap: wrap;
      max-height: 46px;
      overflow: hidden;
    }
    .badge {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      background: rgba(128, 128, 128, 0.06);
      white-space: nowrap;
      min-width: 0;
    }
    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .badge-name {
      font-weight: 400;
      opacity: 0.5;
      margin-left: 2px;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 80px;
    }
    @media (max-width: 500px) {
      .track-area {
        height: 36px;
      }
      .track-bg {
        top: 17px;
      }
      .track-fill {
        top: 17px;
      }
      .thumb {
        width: 20px;
        height: 20px;
        top: 8px;
      }
      .position-label {
        font-size: 12px;
      }
      .badge {
        font-size: 13px;
        padding: 5px 10px;
      }
      .scrubber-label {
        font-size: 11px;
      }
    }
  `,t([gt({type:Array})],It.prototype,"curves",void 0),t([gt({type:Boolean})],It.prototype,"readOnly",void 0),t([vt()],It.prototype,"_position",void 0),It=t([dt("curve-scrubber")],It);let Ut=Mt=class extends ct{constructor(){super(...arguments),this.curves=[],this.selectedCurveId=null}_select(t){this.dispatchEvent(new CustomEvent("select-curve",{detail:{entityId:t},bubbles:!0,composed:!0}))}_toggle(t,e){t.stopPropagation(),this.dispatchEvent(new CustomEvent("toggle-curve",{detail:{entityId:e},bubbles:!0,composed:!0}))}_onItemKeyDown(t,e){if("Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._select(e)),"ArrowDown"===t.key||"ArrowUp"===t.key){t.preventDefault();const e=[...this.renderRoot.querySelectorAll(".legend-item")],i=e.indexOf(t.currentTarget),s="ArrowDown"===t.key?i+1:i-1;e[s]?.focus()}}_onToggleKeyDown(t,e){"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._toggle(t,e))}render(){return q`
      <div class="legend-panel">
        <div class="legend" role="listbox" aria-label="Light curves">
          ${this.curves.map((t,e)=>q`
              <div
                class="legend-item ${t.visible?"":"hidden"} ${this.selectedCurveId===t.entityId?"selected":""}"
                role="option"
                tabindex="0"
                aria-selected=${this.selectedCurveId===t.entityId}
                @click=${()=>this._select(t.entityId)}
                @keydown=${e=>this._onItemKeyDown(e,t.entityId)}
                title="${t.friendlyName}"
                style="--accent-color: ${t.color}"
              >
                <span
                  class="color-dot shape-${Mt._shapes[e%Mt._shapes.length]}"
                  style="background: ${t.color}; --dot-color: ${t.color}"
                ></span>
                <span class="name">${t.friendlyName}</span>
                <svg
                  class="eye-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  role="button"
                  tabindex="0"
                  aria-label="${t.visible?"Hide":"Show"} ${t.friendlyName}"
                  aria-pressed=${!t.visible}
                  @click=${e=>this._toggle(e,t.entityId)}
                  @keydown=${e=>this._onToggleKeyDown(e,t.entityId)}
                >
                  ${t.visible?q`
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      `:q`
                        <path
                          d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
                        />
                        <path
                          d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
                        />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      `}
                </svg>
              </div>
            `)}
        </div>
      </div>
    `}};Ut.styles=o`
    :host {
      display: block;
    }
    .legend-panel {
      border-radius: 12px;
      padding: 8px;
      background: color-mix(
        in srgb,
        var(--ha-card-background, var(--card-background-color, #fff)) 95%,
        var(--secondary-text-color, #616161) 5%
      );
    }
    .legend {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
      padding: 8px 10px;
      border-radius: 8px;
      transition:
        background 0.15s ease,
        opacity 0.2s ease;
      font-size: var(--text-md, 13px);
      font-weight: 500;
      color: var(--primary-text-color, #212121);
      position: relative;
    }
    .legend-item:hover {
      background: rgba(128, 128, 128, 0.08);
    }
    .legend-item.hidden {
      opacity: 0.4;
    }
    .legend-item.selected::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 10px;
      right: 10px;
      height: 2px;
      border-radius: 1px;
      background: var(--accent-color, currentColor);
    }
    .color-dot {
      width: 10px;
      height: 10px;
      flex-shrink: 0;
    }
    .color-dot.shape-circle {
      border-radius: 50%;
    }
    .color-dot.shape-square {
      border-radius: 2px;
    }
    .color-dot.shape-diamond {
      border-radius: 2px;
      transform: rotate(45deg);
      width: 9px;
      height: 9px;
    }
    .color-dot.shape-triangle {
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-bottom: 10px solid var(--dot-color);
      background: transparent !important;
    }
    .color-dot.shape-bar {
      border-radius: 2px;
      width: 10px;
      height: 6px;
      margin: 2px 0;
    }
    .eye-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      opacity: 0.35;
      transition: opacity 0.15s ease;
      margin-left: auto;
      padding: 4px;
      box-sizing: content-box;
    }
    .legend-item:hover .eye-icon,
    .legend-item.hidden .eye-icon {
      opacity: 0.7;
    }
    .name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    @media (max-width: 500px) {
      .legend-item {
        padding: 10px 10px;
        font-size: 14px;
        min-height: 44px;
        box-sizing: border-box;
      }
      .eye-icon {
        width: 20px;
        height: 20px;
        padding: 12px;
        margin: -12px;
        margin-left: auto;
        box-sizing: content-box;
      }
    }
  `,Ut._shapes=["circle","square","diamond","triangle","bar"],t([gt({type:Array})],Ut.prototype,"curves",void 0),t([gt({type:String})],Ut.prototype,"selectedCurveId",void 0),Ut=Mt=t([dt("curve-legend")],Ut);let Tt=class extends ct{constructor(){super(...arguments),this.dirty=!1,this.readOnly=!1,this.saving=!1,this.canUndo=!1}_onSave(){this.dispatchEvent(new CustomEvent("save-curves",{bubbles:!0,composed:!0}))}_onCancel(){this.dispatchEvent(new CustomEvent("cancel-curves",{bubbles:!0,composed:!0}))}_onUndo(){this.dispatchEvent(new CustomEvent("undo-curves",{bubbles:!0,composed:!0}))}render(){return this.readOnly?q`
        <div class="footer">
          <div class="read-only">
            <svg
              class="lock-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            View only
          </div>
        </div>
      `:this.dirty||this.canUndo?q`
      <div class="footer">
        ${this.canUndo?q`
              <button
                class="btn-ghost btn-undo"
                @click=${this._onUndo}
                ?disabled=${this.saving}
                aria-label="Undo"
              >
                <svg
                  class="undo-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="1 4 1 10 7 10"></polyline>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                </svg>
                Undo
              </button>
            `:q`<span class="unsaved-label">Unsaved changes</span>`}
        <button
          class="btn-ghost"
          @click=${this._onCancel}
          ?disabled=${this.saving}
          aria-label="Cancel changes (Esc)"
        >
          Cancel
        </button>
        <button
          class="btn-save"
          @click=${this._onSave}
          ?disabled=${this.saving}
          aria-label="Save changes (Ctrl+S)"
        >
          ${this.saving?"Saving...":"Save"}
        </button>
      </div>
    `:q`<div class="footer"></div>`}};Tt.styles=o`
    :host {
      display: block;
    }
    .footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      padding: 14px 0 0;
      min-height: 36px;
    }
    .read-only {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: var(--text-sm, 12px);
      color: var(--secondary-text, #616161);
      margin-right: auto;
    }
    .lock-icon {
      width: 14px;
      height: 14px;
      opacity: 0.6;
    }
    .unsaved-label {
      font-size: 11px;
      font-weight: 500;
      color: var(--warning-color, #f59e0b);
      margin-right: auto;
    }
    button {
      font-family: inherit;
      font-size: 12px;
      font-weight: 500;
      border: none;
      border-radius: 8px;
      padding: 7px 16px;
      cursor: pointer;
      transition:
        background 0.15s ease,
        opacity 0.15s ease;
    }
    button:disabled {
      opacity: 0.5;
      cursor: default;
    }
    .btn-save {
      background: #2563eb;
      color: #fff;
    }
    .btn-save:hover:not(:disabled) {
      background: #1d4fd8;
    }
    .btn-ghost {
      background: transparent;
      color: var(--secondary-text, #616161);
      border: 1px solid var(--divider, rgba(127, 127, 127, 0.2));
    }
    .btn-ghost:hover:not(:disabled) {
      background: rgba(128, 128, 128, 0.08);
    }
    .btn-undo {
      padding: 7px 10px;
      margin-right: auto;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .undo-icon {
      width: 14px;
      height: 14px;
    }
    @media (max-width: 500px) {
      .footer {
        min-height: 48px;
      }
      button {
        padding: 12px 20px;
        font-size: 14px;
        min-height: 44px;
      }
    }
  `,t([gt({type:Boolean})],Tt.prototype,"dirty",void 0),t([gt({type:Boolean})],Tt.prototype,"readOnly",void 0),t([gt({type:Boolean})],Tt.prototype,"saving",void 0),t([gt({type:Boolean})],Tt.prototype,"canUndo",void 0),Tt=t([dt("curve-footer")],Tt);const Dt=q`<svg
  class="status-icon"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <path
    d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
  ></path>
  <line x1="12" y1="9" x2="12" y2="13"></line>
  <line x1="12" y1="17" x2="12.01" y2="17"></line>
</svg>`;let Ot=class extends ct{constructor(){super(...arguments),this._config={},this._hass=null}setConfig(t){this._config=t}set hass(t){this._hass=t}_fireConfigChanged(){this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}_onEntityChange(t){const e=t.detail?.value??"";this._config={...this._config,entity:e||void 0},this._fireConfigChanged()}_onTitleChange(t){const e=t.target.value;this._config={...this._config,title:e||void 0},this._fireConfigChanged()}render(){const t=this._config.entity??"",e=this._config.title??"";return q`
      <div class="form">
        <div class="field">
          <label>Entity</label>
          <ha-entity-picker
            .hass=${this._hass}
            .value=${t}
            .includeDomains=${["light"]}
            allow-custom-entity
            @value-changed=${this._onEntityChange}
          ></ha-entity-picker>
          <span class="hint"
            >Choose the lightener group whose brightness curves you want to edit.</span
          >
        </div>
        <div class="field">
          <label>Title (optional)</label>
          <input
            type="text"
            .value=${e}
            placeholder="Brightness Curves"
            @input=${this._onTitleChange}
          />
        </div>
      </div>
    `}};Ot.styles=o`
    :host {
      display: block;
    }
    .form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    label {
      font-size: 12px;
      font-weight: 500;
      color: var(--secondary-text-color, #616161);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    input {
      padding: 8px 12px;
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      border-radius: 8px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      font-size: 14px;
      font-family: inherit;
    }
    input:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 1px #2563eb;
    }
    .hint {
      font-size: 11px;
      color: var(--secondary-text-color, #616161);
      opacity: 0.7;
    }
  `,t([vt()],Ot.prototype,"_config",void 0),t([vt()],Ot.prototype,"_hass",void 0),Ot=t([dt("lightener-curve-card-editor")],Ot);let Rt=class extends ct{constructor(){super(...arguments),this._curves=[],this._originalCurves=[],this._config={},this._selectedCurveId=null,this._saving=!1,this._loadError=null,this._saveError=null,this._saveSuccess=!1,this._loading=!1,this._scrubberPosition=null,this._cancelAnimating=!1,this._hass=null,this._undoStack=[],this._dragUndoPushed=!1,this._loaded=!1,this._loadedEntityId=void 0,this._boundKeyHandler=null,this._boundBeforeUnload=null,this._saveSuccessTimer=null,this._cancelAnimFrame=null,this._previewActive=!1,this._previewRafPending=!1,this._previewRestoreBrightness=new Map}static getConfigElement(){return document.createElement("lightener-curve-card-editor")}static getStubConfig(){return{type:"custom:lightener-curve-card"}}setConfig(t){const e=t.entity!==this._config.entity;this._config=t,e&&(this._loaded=!1,this._loadedEntityId=void 0,this._tryLoadCurves())}set hass(t){const e=!!this._hass;this._hass=t,e&&this._loaded||this._tryLoadCurves()}getCardSize(){return 4}get _isAdmin(){return this._hass?.user?.is_admin??!1}get _entityId(){return this._config.entity}get _isDirty(){return!function(t,e){if(t.length!==e.length)return!1;for(let i=0;i<t.length;i++){const s=t[i].controlPoints,r=e[i].controlPoints;if(s.length!==r.length)return!1;for(let t=0;t<s.length;t++){if(s[t].lightener!==r[t].lightener)return!1;if(s[t].target!==r[t].target)return!1}}return!0}(this._curves,this._originalCurves)}connectedCallback(){super.connectedCallback(),this._loaded=!1,this._loadedEntityId=void 0,this._tryLoadCurves(),this._boundKeyHandler=this._onKeyDown.bind(this),this._boundBeforeUnload=this._onBeforeUnload.bind(this),window.addEventListener("keydown",this._boundKeyHandler),window.addEventListener("beforeunload",this._boundBeforeUnload)}disconnectedCallback(){super.disconnectedCallback(),this._boundKeyHandler&&window.removeEventListener("keydown",this._boundKeyHandler),this._boundBeforeUnload&&window.removeEventListener("beforeunload",this._boundBeforeUnload),this._saveSuccessTimer&&(clearTimeout(this._saveSuccessTimer),this._saveSuccessTimer=null),this._cancelAnimFrame&&(cancelAnimationFrame(this._cancelAnimFrame),this._cancelAnimFrame=null,this._cancelAnimating=!1)}_onKeyDown(t){const e=document.activeElement;e&&e!==this&&e!==document.body&&!this.contains(e)||((t.ctrlKey||t.metaKey)&&"s"===t.key&&this._isDirty&&this._isAdmin&&!this._saving&&(t.preventDefault(),this._onSave()),!t.ctrlKey&&!t.metaKey||"z"!==t.key||t.shiftKey||!this._saving&&!this._cancelAnimating&&this._undoStack.length>0&&(t.preventDefault(),this._undo()),"Escape"===t.key&&(!this._isDirty||this._saving||this._cancelAnimating||(t.preventDefault(),this._onCancel())))}_onBeforeUnload(t){this._isDirty&&(t.preventDefault(),t.returnValue="")}async _tryLoadCurves(){if(this._loaded&&this._loadedEntityId===this._entityId)return;if(this._loading)return;if(!this._hass||!this._entityId){if(0===this._curves.length){const t=[{entityId:"light.ceiling_light",friendlyName:"Ceiling Light",controlPoints:[{lightener:0,target:0},{lightener:20,target:0},{lightener:60,target:80},{lightener:100,target:100}],visible:!0,color:Pt[0]},{entityId:"light.sofa_lamp",friendlyName:"Sofa Lamp",controlPoints:[{lightener:0,target:0},{lightener:10,target:50},{lightener:40,target:100},{lightener:70,target:100},{lightener:100,target:60}],visible:!0,color:Pt[1]},{entityId:"light.led_strip",friendlyName:"LED Strip",controlPoints:[{lightener:0,target:0},{lightener:1,target:1},{lightener:100,target:100}],visible:!0,color:Pt[2]}];this._curves=t,this._originalCurves=_t(t)}return}this._loadError=null,this._loading=!0;const t=this._entityId;try{const r=await this._hass.callWS({type:"lightener/get_curves",entity_id:t});if(this._entityId!==t)return;const n=(e=r.entities,i=this._hass.states,s=Pt,Object.keys(e).map((t,r)=>{const n=e[t]?.brightness??{},o=[{lightener:0,target:0}];for(const[t,e]of Object.entries(n)){const i=Number(t),s=Number(e);Number.isFinite(i)&&Number.isFinite(s)&&o.push({lightener:i,target:s})}o.sort((t,e)=>t.lightener-e.lightener);const a=i[t]?.attributes?.friendly_name??t.replace("light.","");return{entityId:t,friendlyName:a,controlPoints:o,visible:!0,color:s[r%s.length]}}));this._curves=n,this._originalCurves=_t(n),this._loaded=!0,this._loadedEntityId=t}catch(e){if(this._entityId!==t)return;console.error("[Lightener] Failed to load curves:",e),this._loadError=String(e),this._loaded=!0,this._loadedEntityId=t}finally{this._loading=!1,this._entityId!==t&&this._tryLoadCurves()}var e,i,s}_onScrubberMove(t){this._scrubberPosition=t.detail.position,this._previewLights(t.detail.position)}_onScrubberStart(){if(this._hass&&!this._previewActive){this._previewActive=!0,this._previewRestoreBrightness.clear();for(const t of this._curves){const e=this._hass.states[t.entityId];e&&this._previewRestoreBrightness.set(t.entityId,"off"===e.state?null:e.attributes.brightness??null)}}}_onScrubberEnd(){if(this._previewActive&&this._hass){this._previewActive=!1;for(const[t,e]of this._previewRestoreBrightness)null===e?this._hass.callService("light","turn_off",{entity_id:t}).catch(()=>{}):this._hass.callService("light","turn_on",{entity_id:t,brightness:e}).catch(()=>{});this._previewRestoreBrightness.clear()}}_previewLights(t){this._previewActive&&this._hass&&!this._previewRafPending&&(this._previewRafPending=!0,requestAnimationFrame(()=>{if(this._previewRafPending=!1,this._previewActive&&this._hass)for(const e of this._curves){if(!e.visible)continue;const i=Math.round(At(e.controlPoints,t)),s=Math.round(i/100*255);0===s?this._hass.callService("light","turn_off",{entity_id:e.entityId}).catch(()=>{}):this._hass.callService("light","turn_on",{entity_id:e.entityId,brightness:s}).catch(()=>{})}}))}_onSelectCurve(t){if(this._cancelAnimating)return;const{entityId:e}=t.detail,i=this._curves.find(t=>t.entityId===e);i&&!i.visible||(this._selectedCurveId=this._selectedCurveId===e?null:e)}_pushUndo(){this._undoStack.push(_t(this._curves)),this._undoStack.length>50&&this._undoStack.shift()}_undo(){0!==this._undoStack.length&&null===this._cancelAnimFrame&&this._animateCurvesTo(this._undoStack.pop())}_animateCurvesTo(t,e){const i=_t(this._curves);this._cancelAnimating=!0;const s=performance.now(),r=n=>{const o=n-s,a=Math.min(o/300,1),l=function(t){return 1-Math.pow(1-t,3)}(a),c=t.map((t,e)=>{const s=i[e];if(!s)return t;const r=s.controlPoints,n=t.controlPoints,o=Math.min(r.length,n.length),c=[];for(let t=0;t<o;t++)c.push({lightener:Math.round(r[t].lightener+(n[t].lightener-r[t].lightener)*l),target:Math.round(r[t].target+(n[t].target-r[t].target)*l)});if(n.length>o&&a>=1)for(let t=o;t<n.length;t++)c.push({...n[t]});if(r.length>o&&a<1)for(let t=o;t<r.length;t++)c.push({...r[t]});return c.sort((t,e)=>t.lightener-e.lightener),{...t,controlPoints:c,visible:s.visible}});this._curves=c,a<1?this._cancelAnimFrame=requestAnimationFrame(r):(this._curves=t.map((t,e)=>({...t,visible:i[e]?.visible??t.visible})),this._cancelAnimating=!1,this._cancelAnimFrame=null,e?.())};this._cancelAnimFrame=requestAnimationFrame(r)}_onPointMove(t){if(this._cancelAnimating)return;this._dragUndoPushed||(this._pushUndo(),this._dragUndoPushed=!0);const{curveIndex:e,pointIndex:i,lightener:s,target:r}=t.detail,n=this._curves[e];n&&this._selectedCurveId!==n.entityId&&(this._selectedCurveId=n.entityId);const o=[...this._curves],a={...o[e]},l=[...a.controlPoints];l[i]={lightener:s,target:r},a.controlPoints=l,o[e]=a,this._curves=o}_onPointDrop(t){this._dragUndoPushed=!1}_onPointAdd(t){if(this._cancelAnimating)return;const{lightener:e,target:i,entityId:s}=t.detail,r=s??this._selectedCurveId;if(!r)return;const n=this._curves.findIndex(t=>t.entityId===r);if(n<0)return;if(this._curves[n].controlPoints.some(t=>t.lightener===e))return;this._pushUndo();const o=[...this._curves],a={...o[n]},l=[...a.controlPoints,{lightener:e,target:i}];l.sort((t,e)=>t.lightener-e.lightener),a.controlPoints=l,o[n]=a,this._curves=o}_onPointRemove(t){if(this._cancelAnimating)return;this._dragUndoPushed=!1;const{curveIndex:e,pointIndex:i}=t.detail,s=this._curves[e];if(!s)return;if(s.controlPoints.length<=2)return;this._pushUndo();const r=[...this._curves],n={...r[e]};n.controlPoints=n.controlPoints.filter((t,e)=>e!==i),r[e]=n,this._curves=r}_onToggleCurve(t){if(this._cancelAnimating)return;const{entityId:e}=t.detail,i=this._curves.map(t=>t.entityId===e?{...t,visible:!t.visible}:t);if(this._curves=i,this._selectedCurveId===e){const t=i.find(t=>t.entityId===e);t&&!t.visible&&(this._selectedCurveId=null)}}async _onSave(){if(this._hass&&this._entityId&&!this._saving&&!this._cancelAnimating){this._saving=!0,this._saveError=null;try{const t=function(t){const e={};for(const i of t){const t={};for(const e of i.controlPoints)0!==e.lightener&&(t[String(e.lightener)]=String(e.target));e[i.entityId]={brightness:t}}return e}(this._curves);await this._hass.callWS({type:"lightener/save_curves",entity_id:this._entityId,curves:t}),this._originalCurves=_t(this._curves),this._undoStack=[],this._loaded=!1,this._tryLoadCurves(),this._saveSuccess=!0,this._saveSuccessTimer=setTimeout(()=>{this._saveSuccess=!1,this._saveSuccessTimer=null},2e3)}catch(t){console.error("[Lightener] Failed to save curves:",t),this._saveError="Save failed. Check connection."}finally{this._saving=!1}}}_retryLoad(){this._loaded=!1,this._loadError=null,this._tryLoadCurves()}_onCancel(){this._cancelAnimating||(this._undoStack=[],this._animateCurvesTo(_t(this._originalCurves),()=>{this._selectedCurveId=null}))}render(){return q`
      <div class="card" role="region" aria-label="Brightness Curves Editor">
        <div class="header">
          <svg
            class="header-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M2 20 C6 20, 8 4, 12 4 S18 20, 22 20" />
          </svg>
          <h2>${this._config.title??"Brightness Curves"}</h2>
        </div>

        ${this._loading?q`<div class="loading-indicator" role="status" aria-live="polite">
              Loading curves...
            </div>`:q`<div class="graph-panel">
              <curve-graph
                .curves=${this._curves}
                .selectedCurveId=${this._selectedCurveId}
                .readOnly=${!this._isAdmin||this._cancelAnimating}
                .scrubberPosition=${this._scrubberPosition}
                @point-move=${this._onPointMove}
                @point-drop=${this._onPointDrop}
                @point-add=${this._onPointAdd}
                @point-remove=${this._onPointRemove}
              ></curve-graph>
            </div>`}

        <curve-scrubber
          .curves=${this._curves}
          .readOnly=${!this._isAdmin}
          @scrubber-move=${this._onScrubberMove}
          @scrubber-start=${this._onScrubberStart}
          @scrubber-end=${this._onScrubberEnd}
        ></curve-scrubber>

        <curve-legend
          .curves=${this._curves}
          .selectedCurveId=${this._selectedCurveId}
          @select-curve=${this._onSelectCurve}
          @toggle-curve=${this._onToggleCurve}
        ></curve-legend>

        <curve-footer
          .dirty=${this._isDirty||this._cancelAnimating}
          .readOnly=${!this._isAdmin}
          .saving=${this._saving||this._cancelAnimating}
          .canUndo=${this._undoStack.length>0&&!this._cancelAnimating}
          @save-curves=${this._onSave}
          @cancel-curves=${this._onCancel}
          @undo-curves=${()=>this._undo()}
        ></curve-footer>

        ${this._saveSuccess?q`<div class="success" role="status" aria-live="polite">
              <svg
                class="status-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              Saved successfully
            </div>`:G}
        ${this._loadError?q`<div class="error" role="alert">
              ${Dt} Failed to load curves
              <button type="button" class="retry-link" @click=${this._retryLoad}>
                Tap to retry
              </button>
            </div>`:G}
        ${this._saveError?q`<div class="error" role="alert">
              ${Dt} Save failed
              <button type="button" class="retry-link" @click=${this._onSave}>Tap to retry</button>
            </div>`:G}
      </div>
    `}};Rt.styles=o`
    :host {
      --card-bg: var(--ha-card-background, var(--card-background-color, #fff));
      --text-color: var(--primary-text-color, #212121);
      --secondary-text: var(--secondary-text-color, #616161);
      --divider: var(--divider-color, rgba(127, 127, 127, 0.2));
      --graph-bg: var(--card-background-color, var(--ha-card-background, #fafafa));
      --panel-bg: color-mix(in srgb, var(--card-bg) 95%, var(--secondary-text, #616161) 5%);
      --text-xs: 9px;
      --text-sm: 12px;
      --text-md: 13px;
      --text-lg: 14px;

      display: block;
      font-family: var(--paper-font-body1_-_font-family, 'Roboto', sans-serif);
      height: fit-content;
    }
    .card {
      background: var(--card-bg);
      border-radius: var(--ha-card-border-radius, 16px);
      box-shadow: var(
        --ha-card-box-shadow,
        0 1px 3px rgba(0, 0, 0, 0.08),
        0 8px 24px rgba(0, 0, 0, 0.06)
      );
      padding: 20px;
      color: var(--text-color);
    }
    .header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
    }
    .header-icon {
      width: 18px;
      height: 18px;
      opacity: 0.5;
    }
    h2 {
      margin: 0;
      font-size: var(--text-lg);
      font-weight: 600;
      letter-spacing: -0.01em;
    }
    .graph-panel {
      border-radius: 12px;
      padding: 12px;
      background: var(--panel-bg);
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
      overflow: hidden;
      margin-bottom: 12px;
    }
    .error {
      font-size: var(--text-sm);
      color: var(--error-color, #db4437);
      padding: 8px 0 0;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }
    .error .retry-link {
      cursor: pointer;
      text-decoration: underline;
      opacity: 0.8;
      background: none;
      border: none;
      font: inherit;
      color: inherit;
      padding: 0;
    }
    .error .retry-link:hover {
      opacity: 1;
    }
    .success {
      font-size: var(--text-sm);
      color: #2563eb;
      padding: 8px 0 0;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      animation: success-fade 2s ease forwards;
    }
    @keyframes success-fade {
      0% {
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      70% {
        opacity: 1;
      }
      100% {
        opacity: 0;
      }
    }
    .status-icon {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }
    .loading-indicator {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 0;
      font-size: var(--text-sm);
      color: var(--secondary-text);
      animation: pulse 1.5s ease-in-out infinite;
    }
    @keyframes pulse {
      0%,
      100% {
        opacity: 0.5;
      }
      50% {
        opacity: 1;
      }
    }
    @keyframes fade-in {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `,t([vt()],Rt.prototype,"_curves",void 0),t([vt()],Rt.prototype,"_originalCurves",void 0),t([vt()],Rt.prototype,"_config",void 0),t([vt()],Rt.prototype,"_selectedCurveId",void 0),t([vt()],Rt.prototype,"_saving",void 0),t([vt()],Rt.prototype,"_loadError",void 0),t([vt()],Rt.prototype,"_saveError",void 0),t([vt()],Rt.prototype,"_saveSuccess",void 0),t([vt()],Rt.prototype,"_loading",void 0),t([vt()],Rt.prototype,"_scrubberPosition",void 0),t([vt()],Rt.prototype,"_cancelAnimating",void 0),t([vt()],Rt.prototype,"_hass",void 0),Rt=t([dt("lightener-curve-card")],Rt);export{Rt as LightenerCurveCard,Ot as LightenerCurveCardEditor};
