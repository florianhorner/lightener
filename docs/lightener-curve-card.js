function t(t,e,i,r){var s,n=arguments.length,o=n<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,r);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(o=(n<3?s(o):n>3?s(e,i,o):s(e,i))||o);return n>3&&o&&Object.defineProperty(e,i,o),o}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,r=Symbol(),s=new WeakMap;let n=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==r)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=s.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&s.set(e,t))}return t}toString(){return this.cssText}};const o=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,r)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[r+1],t[0]);return new n(i,t,r)},a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new n("string"==typeof t?t:t+"",void 0,r))(e)})(t):t,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,g=globalThis,v=g.trustedTypes,_=v?v.emptyScript:"",f=g.reactiveElementPolyfillSupport,b=(t,e)=>t,y={toAttribute(t,e){switch(e){case Boolean:t=t?_:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},x=(t,e)=>!l(t,e),m={attribute:!0,type:String,converter:y,reflect:!1,useDefault:!1,hasChanged:x};Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=m){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(t,i,e);void 0!==r&&d(this.prototype,t,r)}}static getPropertyDescriptor(t,e,i){const{get:r,set:s}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:r,set(e){const n=r?.call(this);s?.call(this,e),this.requestUpdate(t,n,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??m}static _$Ei(){if(this.hasOwnProperty(b("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(b("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(b("properties"))){const t=this.properties,e=[...h(t),...p(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,r)=>{if(i)t.adoptedStyleSheets=r.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of r){const r=document.createElement("style"),s=e.litNonce;void 0!==s&&r.setAttribute("nonce",s),r.textContent=i.cssText,t.appendChild(r)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),r=this.constructor._$Eu(t,i);if(void 0!==r&&!0===i.reflect){const s=(void 0!==i.converter?.toAttribute?i.converter:y).toAttribute(e,i.type);this._$Em=t,null==s?this.removeAttribute(r):this.setAttribute(r,s),this._$Em=null}}_$AK(t,e){const i=this.constructor,r=i._$Eh.get(t);if(void 0!==r&&this._$Em!==r){const t=i.getPropertyOptions(r),s="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:y;this._$Em=r;const n=s.fromAttribute(e,t.type);this[r]=n??this._$Ej?.get(r)??n,this._$Em=null}}requestUpdate(t,e,i,r=!1,s){if(void 0!==t){const n=this.constructor;if(!1===r&&(s=this[t]),i??=n.getPropertyOptions(t),!((i.hasChanged??x)(s,e)||i.useDefault&&i.reflect&&s===this._$Ej?.get(t)&&!this.hasAttribute(n._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:r,wrapped:s},n){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,n??e??this[t]),!0!==s||void 0!==n)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===r&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,r=this[e];!0!==t||this._$AL.has(e)||void 0===r||this.C(e,void 0,i,r)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[b("elementProperties")]=new Map,$[b("finalized")]=new Map,f?.({ReactiveElement:$}),(g.reactiveElementVersions??=[]).push("2.1.2");const w=globalThis,k=t=>t,C=w.trustedTypes,P=C?C.createPolicy("lit-html",{createHTML:t=>t}):void 0,A="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,S="?"+E,I=`<${S}>`,M=document,D=()=>M.createComment(""),O=t=>null===t||"object"!=typeof t&&"function"!=typeof t,U=Array.isArray,R="[ \t\n\f\r]",T=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,z=/-->/g,L=/>/g,B=RegExp(`>|${R}(?:([^\\s"'>=/]+)(${R}*=${R}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),N=/'/g,H=/"/g,j=/^(?:script|style|textarea|title)$/i,F=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),K=F(1),q=F(2),V=Symbol.for("lit-noChange"),W=Symbol.for("lit-nothing"),G=new WeakMap,X=M.createTreeWalker(M,129);function Y(t,e){if(!U(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==P?P.createHTML(e):e}const Z=(t,e)=>{const i=t.length-1,r=[];let s,n=2===e?"<svg>":3===e?"<math>":"",o=T;for(let e=0;e<i;e++){const i=t[e];let a,l,d=-1,c=0;for(;c<i.length&&(o.lastIndex=c,l=o.exec(i),null!==l);)c=o.lastIndex,o===T?"!--"===l[1]?o=z:void 0!==l[1]?o=L:void 0!==l[2]?(j.test(l[2])&&(s=RegExp("</"+l[2],"g")),o=B):void 0!==l[3]&&(o=B):o===B?">"===l[0]?(o=s??T,d=-1):void 0===l[1]?d=-2:(d=o.lastIndex-l[2].length,a=l[1],o=void 0===l[3]?B:'"'===l[3]?H:N):o===H||o===N?o=B:o===z||o===L?o=T:(o=B,s=void 0);const h=o===B&&t[e+1].startsWith("/>")?" ":"";n+=o===T?i+I:d>=0?(r.push(a),i.slice(0,d)+A+i.slice(d)+E+h):i+E+(-2===d?e:h)}return[Y(t,n+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),r]};class J{constructor({strings:t,_$litType$:e},i){let r;this.parts=[];let s=0,n=0;const o=t.length-1,a=this.parts,[l,d]=Z(t,e);if(this.el=J.createElement(l,i),X.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(r=X.nextNode())&&a.length<o;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(A)){const e=d[n++],i=r.getAttribute(t).split(E),o=/([.?@])?(.*)/.exec(e);a.push({type:1,index:s,name:o[2],strings:i,ctor:"."===o[1]?rt:"?"===o[1]?st:"@"===o[1]?nt:it}),r.removeAttribute(t)}else t.startsWith(E)&&(a.push({type:6,index:s}),r.removeAttribute(t));if(j.test(r.tagName)){const t=r.textContent.split(E),e=t.length-1;if(e>0){r.textContent=C?C.emptyScript:"";for(let i=0;i<e;i++)r.append(t[i],D()),X.nextNode(),a.push({type:2,index:++s});r.append(t[e],D())}}}else if(8===r.nodeType)if(r.data===S)a.push({type:2,index:s});else{let t=-1;for(;-1!==(t=r.data.indexOf(E,t+1));)a.push({type:7,index:s}),t+=E.length-1}s++}}static createElement(t,e){const i=M.createElement("template");return i.innerHTML=t,i}}function Q(t,e,i=t,r){if(e===V)return e;let s=void 0!==r?i._$Co?.[r]:i._$Cl;const n=O(e)?void 0:e._$litDirective$;return s?.constructor!==n&&(s?._$AO?.(!1),void 0===n?s=void 0:(s=new n(t),s._$AT(t,i,r)),void 0!==r?(i._$Co??=[])[r]=s:i._$Cl=s),void 0!==s&&(e=Q(t,s._$AS(t,e.values),s,r)),e}class tt{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,r=(t?.creationScope??M).importNode(e,!0);X.currentNode=r;let s=X.nextNode(),n=0,o=0,a=i[0];for(;void 0!==a;){if(n===a.index){let e;2===a.type?e=new et(s,s.nextSibling,this,t):1===a.type?e=new a.ctor(s,a.name,a.strings,this,t):6===a.type&&(e=new ot(s,this,t)),this._$AV.push(e),a=i[++o]}n!==a?.index&&(s=X.nextNode(),n++)}return X.currentNode=M,r}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class et{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,r){this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Q(this,t,e),O(t)?t===W||null==t||""===t?(this._$AH!==W&&this._$AR(),this._$AH=W):t!==this._$AH&&t!==V&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>U(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==W&&O(this._$AH)?this._$AA.nextSibling.data=t:this.T(M.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,r="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=J.createElement(Y(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(e);else{const t=new tt(r,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=G.get(t.strings);return void 0===e&&G.set(t.strings,e=new J(t)),e}k(t){U(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,r=0;for(const s of t)r===e.length?e.push(i=new et(this.O(D()),this.O(D()),this,this.options)):i=e[r],i._$AI(s),r++;r<e.length&&(this._$AR(i&&i._$AB.nextSibling,r),e.length=r)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=k(t).nextSibling;k(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class it{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,r,s){this.type=1,this._$AH=W,this._$AN=void 0,this.element=t,this.name=e,this._$AM=r,this.options=s,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=W}_$AI(t,e=this,i,r){const s=this.strings;let n=!1;if(void 0===s)t=Q(this,t,e,0),n=!O(t)||t!==this._$AH&&t!==V,n&&(this._$AH=t);else{const r=t;let o,a;for(t=s[0],o=0;o<s.length-1;o++)a=Q(this,r[i+o],e,o),a===V&&(a=this._$AH[o]),n||=!O(a)||a!==this._$AH[o],a===W?t=W:t!==W&&(t+=(a??"")+s[o+1]),this._$AH[o]=a}n&&!r&&this.j(t)}j(t){t===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class rt extends it{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===W?void 0:t}}class st extends it{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==W)}}class nt extends it{constructor(t,e,i,r,s){super(t,e,i,r,s),this.type=5}_$AI(t,e=this){if((t=Q(this,t,e,0)??W)===V)return;const i=this._$AH,r=t===W&&i!==W||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,s=t!==W&&(i===W||r);r&&this.element.removeEventListener(this.name,this,i),s&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class ot{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Q(this,t)}}const at=w.litHtmlPolyfillSupport;at?.(J,et),(w.litHtmlVersions??=[]).push("3.3.2");const lt=globalThis;class dt extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const r=i?.renderBefore??e;let s=r._$litPart$;if(void 0===s){const t=i?.renderBefore??null;r._$litPart$=s=new et(e.insertBefore(D(),t),t,void 0,i??{})}return s._$AI(t),s})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return V}}dt._$litElement$=!0,dt.finalized=!0,lt.litElementHydrateSupport?.({LitElement:dt});const ct=lt.litElementPolyfillSupport;ct?.({LitElement:dt}),(lt.litElementVersions??=[]).push("4.2.2");const ht=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},pt={attribute:!0,type:String,converter:y,reflect:!1,hasChanged:x},ut=(t=pt,e,i)=>{const{kind:r,metadata:s}=i;let n=globalThis.litPropertyMetadata.get(s);if(void 0===n&&globalThis.litPropertyMetadata.set(s,n=new Map),"setter"===r&&((t=Object.create(t)).wrapped=!0),n.set(i.name,t),"accessor"===r){const{name:r}=i;return{set(i){const s=e.get.call(this);e.set.call(this,i),this.requestUpdate(r,s,t,!0,i)},init(e){return void 0!==e&&this.C(r,void 0,t,e),e}}}if("setter"===r){const{name:r}=i;return function(i){const s=this[r];e.call(this,i),this.requestUpdate(r,s,t,!0,i)}}throw Error("Unsupported decorator location: "+r)};function gt(t){return(e,i)=>"object"==typeof i?ut(t,e,i):((t,e,i)=>{const r=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),r?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function vt(t){return gt({...t,state:!0,attribute:!1})}function _t(t,e){return(e,i,r)=>((t,e,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof e&&Object.defineProperty(t,e,i),i))(e,i,{get(){return(e=>e.renderRoot?.querySelector(t)??null)(this)}})}function ft(t){return t.map(t=>({...t,controlPoints:t.controlPoints.map(t=>({...t}))}))}function bt(t){const e=new Map;e.set(0,0);for(const i of t)e.set(i.lightener,i.target);e.has(100)||e.set(100,100);const i=[];for(const[t,r]of e)i.push({lightener:t,target:r});return i.sort((t,e)=>t.lightener-e.lightener),i}const yt=44,xt=12,mt=300,$t=200;function wt(t){return yt+t/100*mt}function kt(t){return xt+(1-t/100)*$t}function Ct(t,e,i){return Math.max(e,Math.min(i,t))}function Pt(t){const e=t.length,i=[],r=[],s=[];for(let n=0;n<e-1;n++)i.push(t[n+1].x-t[n].x),r.push(t[n+1].y-t[n].y),s.push(r[n]/(i[n]||1));const n=new Array(e);n[0]=s[0],n[e-1]=s[e-2];for(let t=1;t<e-1;t++)n[t]=(s[t-1]+s[t])/2;return{dx:i,tangents:n}}function At(t,e){return function(t,e){if(t.length<2)return 0;if(2===t.length){const[i,r]=t,s=r.x-i.x;if(0===s)return i.y;const n=(e-i.x)/s;return i.y+n*(r.y-i.y)}const{dx:i,tangents:r}=Pt(t);let s=0;for(let i=0;i<t.length-1;i++){if(e<=t[i+1].x){s=i;break}s=i}const n=i[s]||1,o=Ct((e-t[s].x)/n,0,1),a=n/3,l=1-o;return l*l*l*t[s].y+3*l*l*o*(t[s].y+r[s]*a)+3*l*o*o*(t[s+1].y-r[s+1]*a)+o*o*o*t[s+1].y}(bt(t).map(t=>({x:t.lightener,y:t.target})),e)}const Et=["#42a5f5","#ef5350","#5c6bc0","#ffa726","#ab47bc","#1565c0","#ec407a","#8d6e63","#ffca28","#7e57c2"];const St=["","8 4","4 4","12 4 4 4","2 4"];let It=class extends dt{constructor(){super(...arguments),this.curves=[],this.selectedCurveId=null,this.readOnly=!1,this.scrubberPosition=null,this._dragCurveIdx=-1,this._dragPointIdx=-1,this._hoveredPoint=null,this._focusedPoint=null,this._isMobile=!1,this._mql=null,this._wasDragging=!1,this._longPressTimer=null,this._longPressFired=!1,this._onMqlChange=t=>{this._isMobile=t.matches}}_getSvgCoords(t){const e=this._svgRef;if(!e)return null;const i=e.getScreenCTM();if(!i)return null;const r=i.inverse(),s=e.createSVGPoint();s.x=t.clientX,s.y=t.clientY;const n=s.matrixTransform(r);return{x:(a=n.x,(a-yt)/mt*100),y:(o=n.y,100*(1-(o-xt)/$t))};var o,a}_isCurveInteractive(t){return!this.readOnly&&(null===this.selectedCurveId||this.curves[t]?.entityId===this.selectedCurveId)}_focusCurve(t){this.dispatchEvent(new CustomEvent("focus-curve",{detail:{entityId:t},bubbles:!0,composed:!0}))}_onPointFocus(t,e){const i=this.curves[t];i&&(this._focusedPoint={curve:t,point:e},this._hoveredPoint={curve:t,point:e},this._focusCurve(i.entityId))}_onPointBlur(t,e){this._focusedPoint?.curve===t&&this._focusedPoint?.point===e&&(this._focusedPoint=null),this._hoveredPoint?.curve===t&&this._hoveredPoint?.point===e&&(this._hoveredPoint=null)}_dispatchKeyboardMove(t,e,i,r){this.dispatchEvent(new CustomEvent("point-move",{detail:{curveIndex:t,pointIndex:e,lightener:i,target:r},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("point-drop",{detail:{curveIndex:t,pointIndex:e},bubbles:!0,composed:!0}))}_getKeyboardInsertPoint(t,e){const i=t.controlPoints[e],r=t.controlPoints[e+1],s=t.controlPoints[e-1];return r&&r.lightener-i.lightener>1?{lightener:Math.round((i.lightener+r.lightener)/2),target:Math.round((i.target+r.target)/2)}:s&&i.lightener-s.lightener>1?{lightener:Math.round((s.lightener+i.lightener)/2),target:Math.round((s.target+i.target)/2)}:null}_onPointKeyDown(t,e,i){const r=this.curves[e],s=r?.controlPoints[i];if(!r||!s)return;this.selectedCurveId!==r.entityId&&this._focusCurve(r.entityId);const n=t.shiftKey?10:1,o=i>0?r.controlPoints[i-1].lightener+1:s.lightener,a=i<r.controlPoints.length-1?r.controlPoints[i+1].lightener-1:100;if("ArrowRight"===t.key)return t.preventDefault(),void this._dispatchKeyboardMove(e,i,Math.min(a,s.lightener+n),s.target);if("ArrowLeft"===t.key)return t.preventDefault(),void this._dispatchKeyboardMove(e,i,Math.max(o,s.lightener-n),s.target);if("ArrowUp"===t.key)return t.preventDefault(),void this._dispatchKeyboardMove(e,i,s.lightener,Math.min(100,s.target+n));if("ArrowDown"===t.key)return t.preventDefault(),void this._dispatchKeyboardMove(e,i,s.lightener,Math.max(0,s.target-n));if("Enter"===t.key){const e=this._getKeyboardInsertPoint(r,i);if(!e)return;return t.preventDefault(),void this.dispatchEvent(new CustomEvent("point-add",{detail:{entityId:r.entityId,lightener:e.lightener,target:e.target},bubbles:!0,composed:!0}))}(" "===t.key||"Delete"===t.key||"Backspace"===t.key)&&i>0&&i<r.controlPoints.length-1&&r.controlPoints.length>2&&(t.preventDefault(),this.dispatchEvent(new CustomEvent("point-remove",{detail:{curveIndex:e,pointIndex:i},bubbles:!0,composed:!0})))}_onPointerDown(t,e,i){0===t.button&&this._isCurveInteractive(e)&&0!==i&&(t.preventDefault(),this._longPressFired=!1,this._clearLongPress(),this._longPressTimer=setTimeout(()=>{this._longPressFired=!0,this._dragCurveIdx=-1,this._dragPointIdx=-1,this.dispatchEvent(new CustomEvent("point-remove",{detail:{curveIndex:e,pointIndex:i},bubbles:!0,composed:!0}))},500),this._svgRef?.setPointerCapture(t.pointerId),this._dragCurveIdx=e,this._dragPointIdx=i)}_clearLongPress(){this._longPressTimer&&(clearTimeout(this._longPressTimer),this._longPressTimer=null)}_onPointerMove(t){if(this._dragCurveIdx<0)return;t.preventDefault(),this._clearLongPress();const e=this._getSvgCoords(t);if(!e)return;const i=this.curves[this._dragCurveIdx],r=i?.controlPoints??[],s=this._dragPointIdx>0?r[this._dragPointIdx-1].lightener+1:1,n=this._dragPointIdx<r.length-1?r[this._dragPointIdx+1].lightener-1:100,o=Math.round(Ct(e.x,s,n)),a=Math.round(Ct(e.y,0,100));this.dispatchEvent(new CustomEvent("point-move",{detail:{curveIndex:this._dragCurveIdx,pointIndex:this._dragPointIdx,lightener:o,target:a},bubbles:!0,composed:!0}))}_onPointerUp(t){this._clearLongPress(),this._longPressFired||this._dragCurveIdx<0||(t.preventDefault(),this.dispatchEvent(new CustomEvent("point-drop",{detail:{curveIndex:this._dragCurveIdx,pointIndex:this._dragPointIdx},bubbles:!0,composed:!0})),this._dragCurveIdx=-1,this._dragPointIdx=-1,this._wasDragging=!0,setTimeout(()=>{this._wasDragging=!1},400))}_onPointContextMenu(t,e,i){t.preventDefault(),t.stopPropagation(),this.readOnly||this._isCurveInteractive(e)&&0!==i&&this.dispatchEvent(new CustomEvent("point-remove",{detail:{curveIndex:e,pointIndex:i},bubbles:!0,composed:!0}))}_onDblClick(t){if(this.readOnly)return;if(this._wasDragging)return;const e=this._getSvgCoords(t);if(!e)return;const i=Math.round(Ct(e.x,1,100)),r=Math.round(Ct(e.y,0,100));this.dispatchEvent(new CustomEvent("point-add",{detail:{lightener:i,target:r,entityId:this.selectedCurveId},bubbles:!0,composed:!0}))}_renderGrid(){return q`
      <!-- Diagonal reference line (1:1) -->
      <line class="diagonal-ref"
        x1="${wt(0)}" y1="${kt(0)}"
        x2="${wt(100)}" y2="${kt(100)}" />

      ${[0,25,50,75,100].map(t=>q`
        <!-- Vertical grid -->
        <line class="grid-line"
          x1="${wt(t)}" y1="${kt(0)}"
          x2="${wt(t)}" y2="${kt(100)}" />
        <!-- Horizontal grid -->
        <line class="grid-line"
          x1="${wt(0)}" y1="${kt(t)}"
          x2="${wt(100)}" y2="${kt(t)}" />
        <!-- X tick labels -->
        <text class="tick-label" text-anchor="middle"
          x="${wt(t)}" y="${228}">${t}%</text>
        <!-- Y tick labels -->
        <text class="tick-label" text-anchor="end" dominant-baseline="middle"
          x="${38}" y="${kt(t)}">${t}%</text>
      `)}

      <!-- Axis border lines -->
      <line class="axis-line"
        x1="${yt}" y1="${kt(0)}"
        x2="${344}" y2="${kt(0)}" />
      <line class="axis-line"
        x1="${yt}" y1="${kt(0)}"
        x2="${yt}" y2="${kt(100)}" />

      <!-- Axis labels -->
      <text class="axis-label" text-anchor="middle"
        x="${194}" y="${244}">Group brightness</text>
      <text class="axis-label" text-anchor="middle"
        transform="rotate(-90, 10, ${112})"
        x="10" y="${112}">Light brightness</text>
    `}_renderCrossHair(t){if(this._dragCurveIdx<0)return W;const e=t.controlPoints[this._dragPointIdx];if(!e)return W;const i=wt(e.lightener),r=kt(e.target);return q`
      <line class="crosshair"
        x1="${i}" y1="${r}"
        x2="${i}" y2="${kt(0)}"
        stroke="${t.color}" opacity="0.5" />
      <line class="crosshair"
        x1="${i}" y1="${r}"
        x2="${yt}" y2="${r}"
        stroke="${t.color}" opacity="0.5" />
    `}_renderTooltip(t,e){const i=wt(e.lightener),r=kt(e.target),s=`${e.lightener}:${e.target}`,n=5*s.length,o=Ct(i-n/2-2,yt,344-n-8),a=Math.max(16,r-16);return q`
      <rect class="tooltip-bg"
        x="${o}" y="${a-8}"
        width="${n+8}" height="14" />
      <text class="tooltip-text" text-anchor="start"
        x="${o+4}" y="${a+2}">${s}</text>
    `}_renderScrubberIndicator(){if(null===this.scrubberPosition)return W;const t=this.scrubberPosition,e=wt(t),i=q`
      <rect
        x="${e}" y="${kt(100)}"
        width="${wt(100)-e}" height="${$t}"
        fill="var(--ha-card-background, var(--card-background-color, #1c1c1c))"
        opacity="0.25"
        pointer-events="none"
      />
    `,r=q`
      <line class="scrubber-line"
        x1="${e}" y1="${kt(0)}"
        x2="${e}" y2="${kt(100)}" />
    `,s=this.curves.filter(t=>t.visible).map(i=>{const r=kt(At(i.controlPoints,t));return q`
          <circle
            class="scrubber-dot"
            cx="${e}" cy="${r}"
            r="4"
            fill="${i.color}"
            filter="url(#scrubber-glow-${i.color.replace("#","")})"
            pointer-events="none"
          />
        `});return q`${i}${r}${s}`}_renderCurve(t,e){if(!t.visible||!t.controlPoints.length)return W;try{const i=null===this.selectedCurveId||t.entityId===this.selectedCurveId,r=this._isCurveInteractive(e)&&!this.readOnly,s=bt(t.controlPoints),n=function(t){if(t.length<2)return"";if(2===t.length)return`M${t[0].x},${t[0].y} L${t[1].x},${t[1].y}`;const{dx:e,tangents:i}=Pt(t);let r=`M${t[0].x},${t[0].y}`;for(let s=0;s<t.length-1;s++){const n=e[s]/3;r+=` C${t[s].x+n},${t[s].y+i[s]*n} ${t[s+1].x-n},${t[s+1].y-i[s+1]*n} ${t[s+1].x},${t[s+1].y}`}return r}(s.map(t=>({x:wt(t.lightener),y:kt(t.target)}))),o=n+` L${wt(s[s.length-1].lightener)},${kt(0)}`+` L${wt(0)},${kt(0)} Z`,a=`grad-${e}`,l=St[e%St.length],d=this._dragCurveIdx===e,c=t.color+"33",h=i?1:.2;let p=null;if(d&&this._dragPointIdx>=0)p=t.controlPoints[this._dragPointIdx];else if((this._hoveredPoint?.curve===e||this._focusedPoint?.curve===e)&&r){const i=this._focusedPoint?.curve===e?this._focusedPoint.point:this._hoveredPoint?.point??-1;p=t.controlPoints[i]??null}return q`
      <defs>
        <linearGradient id="${a}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${t.color}" stop-opacity="${i?.45:.06}" />
          <stop offset="100%" stop-color="${t.color}" stop-opacity="${i?.08:0}" />
        </linearGradient>
      </defs>
      ${d?this._renderCrossHair(t):W}
      <path
        d="${o}"
        fill="url(#${a})"
        style="opacity: ${h}"
        pointer-events="none"
      />
      <path
        class="curve-line"
        d="${n}"
        stroke="${t.color}"
        stroke-dasharray="${l}"
        style="opacity: ${h}"
        pointer-events="none"
      />
      ${r?t.controlPoints.map((i,r)=>{const s=0===i.lightener,n=d&&this._dragPointIdx===r,o=this._hoveredPoint?.curve===e&&this._hoveredPoint?.point===r;return q`
              <circle
                class="hit-circle"
                cx="${wt(i.lightener)}"
                cy="${kt(i.target)}"
                r="${this._isMobile?28:22}"
                fill="transparent"
                pointer-events="all"
                tabindex="${s?-1:0}"
                role="${s?"presentation":"button"}"
                aria-label="${t.friendlyName} point ${i.lightener}% group brightness to ${i.target}% light brightness. Arrow keys move, Enter adds a nearby point, Space removes."
                style="touch-action: none; -webkit-touch-callout: none"
                @pointerdown=${t=>this._onPointerDown(t,e,r)}
                @contextmenu=${t=>this._onPointContextMenu(t,e,r)}
                @pointerenter=${()=>this._hoveredPoint={curve:e,point:r}}
                @pointerleave=${()=>this._hoveredPoint=null}
                @focus=${()=>this._onPointFocus(e,r)}
                @blur=${()=>this._onPointBlur(e,r)}
                @keydown=${t=>this._onPointKeyDown(t,e,r)}
              />
              <circle
                class="control-point ${s?"fixed":""} ${n?"dragging":""} ${o?"hovered":""} ${this._focusedPoint?.curve===e&&this._focusedPoint?.point===r?"focused":""}"
                cx="${wt(i.lightener)}"
                cy="${kt(i.target)}"
                r="6"
                fill="${c}"
                stroke="${t.color}"
                stroke-width="2"
                style="--glow-color: ${t.color}"
                pointer-events="none"
              />
            `}):W}
      ${null!==p?this._renderTooltip(t,p):W}
    `}catch{return W}}connectedCallback(){super.connectedCallback(),this._mql=window.matchMedia("(max-width: 500px)"),this._isMobile=this._mql.matches,this._mql.addEventListener("change",this._onMqlChange)}disconnectedCallback(){super.disconnectedCallback(),this._clearLongPress(),this._mql?.removeEventListener("change",this._onMqlChange),this._mql=null}_getSvgDescription(){const t=this.curves.filter(t=>t.visible);if(!t.length)return"No curves displayed";const e=t.map(t=>{const e=t.controlPoints[t.controlPoints.length-1];return`${t.friendlyName} (${t.controlPoints.length} points, max ${e?.target??0}%)`});return`${t.length} curve${1===t.length?"":"s"}: ${e.join(", ")}`}render(){return K`
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
        <desc>${this._getSvgDescription()}</desc>
        ${this._renderGrid()}

        <!-- Invisible hit area for double-click -->
        ${this.readOnly?W:K`<rect
              class="hit-area"
              x="${yt}"
              y="${xt}"
              width="${mt}"
              height="${$t}"
              pointer-events="all"
              fill="transparent"
            />`}
        ${(()=>{const t=this.selectedCurveId?this.curves.findIndex(t=>t.entityId===this.selectedCurveId):-1,e=t>0?[...this.curves.slice(0,t).map((t,e)=>({curve:t,idx:e})),...this.curves.slice(t+1).map((e,i)=>({curve:e,idx:t+1+i})),{curve:this.curves[t],idx:t}]:this.curves.map((t,e)=>({curve:t,idx:e}));return e.map(({curve:t,idx:e})=>this._renderCurve(t,e))})()}
        <!-- Scrubber glow filters (only re-render when curves change, not on every position update) -->
        <defs>
          ${this.curves.filter(t=>t.visible).map(t=>{const e=`scrubber-glow-${t.color.replace("#","")}`;return q`
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
        ${(()=>{if(this.readOnly)return W;if(null===this.selectedCurveId&&this._dragCurveIdx<0)return q`<text class="hint hint-select" text-anchor="middle"
                x="${194}" y="${112}"
                >Select a light below — each gets its own curve</text>`;const t=this.curves.find(t=>t.entityId===this.selectedCurveId);return q`
              <text class="editing-label"
                x="${50}" y="${26}"
                fill="${t?.color??"currentColor"}"
                >Editing: ${t?.friendlyName??""}</text>
              <text class="hint" text-anchor="end"
                x="${340}" y="${206}"
                >Dbl-click to add · Right-click or long-press to remove</text>`})()}
      </svg>
    `}};It.styles=o`
    :host {
      display: block;
    }
    svg {
      width: 100%;
      height: auto;
      min-height: var(--curve-graph-min-height, 0);
      max-height: var(--curve-graph-max-height, 320px);
      display: block;
      border-radius: 6px;
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
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
    .control-point.hovered,
    .control-point.focused {
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
    .hit-circle:focus-visible {
      outline: none;
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
  `,t([gt({type:Array})],It.prototype,"curves",void 0),t([gt({type:String})],It.prototype,"selectedCurveId",void 0),t([gt({type:Boolean})],It.prototype,"readOnly",void 0),t([gt({type:Number})],It.prototype,"scrubberPosition",void 0),t([vt()],It.prototype,"_dragCurveIdx",void 0),t([vt()],It.prototype,"_dragPointIdx",void 0),t([vt()],It.prototype,"_hoveredPoint",void 0),t([vt()],It.prototype,"_focusedPoint",void 0),t([vt()],It.prototype,"_isMobile",void 0),t([_t("svg")],It.prototype,"_svgRef",void 0),It=t([ht("curve-graph")],It);let Mt=class extends dt{constructor(){super(...arguments),this.curves=[],this.readOnly=!1,this._position=50,this._overflowCount=0,this._dragging=!1,this._trackRef=null,this._resizeObserver=null,this._observedBadgesRef=null}_badgeTextColor(t){const e=t.toLowerCase();return"#ffca28"===e?"#9e7c00":"#ffa726"===e?"#b36b00":t}_getInterpolatedValues(){const t=Math.round(this._position);return this.curves.filter(t=>t.visible).map(e=>({entityId:e.entityId,name:e.friendlyName,color:e.color,value:Math.round(At(e.controlPoints,t))}))}_onPointerDown(t){this.readOnly||(t.preventDefault(),this._dragging=!0,t.target.setPointerCapture(t.pointerId),this._updatePositionFromClient(t.clientX),this.dispatchEvent(new CustomEvent("scrubber-start",{bubbles:!0,composed:!0})))}_onPointerMove(t){this._dragging&&(t.preventDefault(),this._updatePositionFromClient(t.clientX))}_onPointerUp(){this._dragging&&(this._dragging=!1,this.dispatchEvent(new CustomEvent("scrubber-end",{bubbles:!0,composed:!0})))}_onTrackClick(t){this.readOnly||(this.dispatchEvent(new CustomEvent("scrubber-start",{bubbles:!0,composed:!0})),this._updatePositionFromClient(t.clientX),setTimeout(()=>{this.dispatchEvent(new CustomEvent("scrubber-end",{bubbles:!0,composed:!0}))},1500))}_onKeyDown(t){if(this.readOnly)return;const e=t.shiftKey?10:1;if("ArrowRight"===t.key||"ArrowUp"===t.key)t.preventDefault(),this._position=Math.min(100,this._position+e);else if("ArrowLeft"===t.key||"ArrowDown"===t.key)t.preventDefault(),this._position=Math.max(0,this._position-e);else if("Home"===t.key)t.preventDefault(),this._position=0;else{if("End"!==t.key)return;t.preventDefault(),this._position=100}this._emitPosition()}_updatePositionFromClient(t){const e=this._trackRef;if(!e)return;const i=e.getBoundingClientRect(),r=(t-i.left)/i.width*100;this._position=Math.max(0,Math.min(100,r)),this._emitPosition()}_emitPosition(){this.dispatchEvent(new CustomEvent("scrubber-move",{detail:{position:this._position},bubbles:!0,composed:!0}))}connectedCallback(){super.connectedCallback(),"undefined"!=typeof ResizeObserver&&(this._resizeObserver=new ResizeObserver(()=>this._measureBadgeOverflow()))}disconnectedCallback(){super.disconnectedCallback(),this._resizeObserver?.disconnect(),this._resizeObserver=null,this._observedBadgesRef=null}firstUpdated(){this._trackRef=this.renderRoot.querySelector(".track-area"),this._bindBadgeObserver(),this._measureBadgeOverflow()}updated(){this._bindBadgeObserver()}_bindBadgeObserver(){this._resizeObserver&&this._badgesRef&&this._observedBadgesRef!==this._badgesRef&&(this._resizeObserver.disconnect(),this._resizeObserver.observe(this._badgesRef),this._observedBadgesRef=this._badgesRef)}_measureBadgeOverflow(){const t=this._badgesRef;if(!t)return;const e=t.clientHeight+1,i=[...t.querySelectorAll('.badge[data-value-badge="true"]')].filter(t=>t.offsetTop+t.offsetHeight>e).length;i!==this._overflowCount&&(this._overflowCount=i)}render(){const t=this._getInterpolatedValues(),e=Math.round(this._position);return K`
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

        <div class="value-badges-wrap">
          <div class="value-badges">
            ${t.map(t=>K`
                <div class="badge" data-value-badge="true">
                  <span class="badge-dot" style="background: ${t.color}"></span>
                  <span style="color: ${this._badgeTextColor(t.color)}">${t.value}%</span>
                  <span class="badge-name">${t.name}</span>
                </div>
              `)}
          </div>
          ${this._overflowCount>0?K`<div class="overflow-indicator">+${this._overflowCount} more</div>`:null}
        </div>
      </div>
    `}};var Dt;Mt.styles=o`
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
    .value-badges-wrap {
      position: relative;
      margin-top: 10px;
    }
    .value-badges {
      display: flex;
      gap: 4px 6px;
      flex-wrap: wrap;
      max-height: var(--curve-scrubber-badges-max-height, 46px);
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
    .overflow-indicator {
      position: absolute;
      right: 0;
      bottom: 0;
      display: inline-flex;
      align-items: center;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 600;
      color: var(--secondary-text-color, #616161);
      background: linear-gradient(
        90deg,
        transparent,
        color-mix(
            in srgb,
            var(--ha-card-background, var(--card-background-color, #fff)) 94%,
            var(--secondary-text-color, #616161) 6%
          )
          28%
      );
      pointer-events: none;
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
  `,t([gt({type:Array})],Mt.prototype,"curves",void 0),t([gt({type:Boolean})],Mt.prototype,"readOnly",void 0),t([vt()],Mt.prototype,"_position",void 0),t([vt()],Mt.prototype,"_overflowCount",void 0),t([_t(".value-badges")],Mt.prototype,"_badgesRef",void 0),Mt=t([ht("curve-scrubber")],Mt);let Ot=Dt=class extends dt{constructor(){super(...arguments),this.curves=[],this.selectedCurveId=null}_select(t){this.dispatchEvent(new CustomEvent("select-curve",{detail:{entityId:t},bubbles:!0,composed:!0}))}_toggle(t,e){t.stopPropagation(),this.dispatchEvent(new CustomEvent("toggle-curve",{detail:{entityId:e},bubbles:!0,composed:!0}))}_onItemKeyDown(t,e){if("Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._select(e)),"ArrowDown"===t.key||"ArrowUp"===t.key){t.preventDefault();const e=[...this.renderRoot.querySelectorAll(".legend-item")],i=e.indexOf(t.currentTarget),r="ArrowDown"===t.key?i+1:i-1;e[r]?.focus()}}_onToggleKeyDown(t,e){"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._toggle(t,e))}render(){return K`
      <div class="legend-panel">
        <div class="legend-label">Lights</div>
        <div class="legend" role="listbox" aria-label="Light curves">
          ${this.curves.map((t,e)=>K`
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
                  class="color-dot shape-${Dt._shapes[e%Dt._shapes.length]}"
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
                  ${t.visible?K`
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      `:K`
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
    `}};Ot.styles=o`
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
    .legend-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--secondary-text-color, #616161);
      opacity: 0.7;
      padding: 6px 10px 4px;
    }
    .legend {
      display: flex;
      flex-direction: column;
      gap: 2px;
      max-height: var(--curve-legend-max-height, none);
      overflow: auto;
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
  `,Ot._shapes=["circle","square","diamond","triangle","bar"],t([gt({type:Array})],Ot.prototype,"curves",void 0),t([gt({type:String})],Ot.prototype,"selectedCurveId",void 0),Ot=Dt=t([ht("curve-legend")],Ot);let Ut=class extends dt{constructor(){super(...arguments),this.dirty=!1,this.readOnly=!1,this.saving=!1,this.canUndo=!1}_onSave(){this.dispatchEvent(new CustomEvent("save-curves",{bubbles:!0,composed:!0}))}_onCancel(){this.dispatchEvent(new CustomEvent("cancel-curves",{bubbles:!0,composed:!0}))}_onUndo(){this.dispatchEvent(new CustomEvent("undo-curves",{bubbles:!0,composed:!0}))}render(){return this.readOnly?K`
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
      `:this.dirty||this.canUndo?K`
      <div class="footer">
        ${this.canUndo?K`
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
            `:K`<span class="unsaved-label">Unsaved changes</span>`}
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
    `:K``}};Ut.styles=o`
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
  `,t([gt({type:Boolean})],Ut.prototype,"dirty",void 0),t([gt({type:Boolean})],Ut.prototype,"readOnly",void 0),t([gt({type:Boolean})],Ut.prototype,"saving",void 0),t([gt({type:Boolean})],Ut.prototype,"canUndo",void 0),Ut=t([ht("curve-footer")],Ut);const Rt=K`<svg
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
</svg>`;let Tt=class extends dt{constructor(){super(...arguments),this._config={},this._hass=null}setConfig(t){this._config=t}set hass(t){this._hass=t}_fireConfigChanged(){this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}_onEntityChange(t){const e=t.detail?.value??"";this._config={...this._config,entity:e||void 0},this._fireConfigChanged()}_onTitleChange(t){const e=t.target.value;this._config={...this._config,title:e||void 0},this._fireConfigChanged()}render(){const t=this._config.entity??"",e=this._config.title??"";return K`
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
    `}};Tt.styles=o`
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
  `,t([vt()],Tt.prototype,"_config",void 0),t([vt()],Tt.prototype,"_hass",void 0),Tt=t([ht("lightener-curve-card-editor")],Tt);let zt=class extends dt{constructor(){super(...arguments),this._curves=[],this._originalCurves=[],this._config={},this._selectedCurveId=null,this._saving=!1,this._loadError=null,this._saveError=null,this._saveSuccess=!1,this._loading=!1,this._scrubberPosition=null,this._cancelAnimating=!1,this._hass=null,this._undoStack=[],this._dragUndoPushed=!1,this._loaded=!1,this._loadedEntityId=void 0,this._boundKeyHandler=null,this._boundBeforeUnload=null,this._saveSuccessTimer=null,this._cancelAnimFrame=null,this._previewActive=!1,this._previewRafPending=!1,this._lastPreviewTime=0,this._previewRestoreBrightness=new Map,this._lastEmittedDirtyState=!1,this._PREVIEW_INTERVAL_MS=300}get _embedded(){return!0===this._config.embedded}static getConfigElement(){return document.createElement("lightener-curve-card-editor")}static getStubConfig(){return{type:"custom:lightener-curve-card"}}setConfig(t){const e=t.entity!==this._config.entity;this._config=t,e&&(this._loaded=!1,this._loadedEntityId=void 0,this._tryLoadCurves())}set hass(t){const e=!!this._hass;this._hass=t,e&&this._loaded||this._tryLoadCurves()}getCardSize(){return 4}get _isAdmin(){return this._hass?.user?.is_admin??!1}get _entityId(){return this._config.entity}get _isDirty(){return!function(t,e){if(t.length!==e.length)return!1;for(let i=0;i<t.length;i++){const r=t[i].controlPoints,s=e[i].controlPoints;if(r.length!==s.length)return!1;for(let t=0;t<r.length;t++){if(r[t].lightener!==s[t].lightener)return!1;if(r[t].target!==s[t].target)return!1}}return!0}(this._curves,this._originalCurves)}get dirty(){return this._isDirty}connectedCallback(){super.connectedCallback(),this._loaded=!1,this._loadedEntityId=void 0,this._tryLoadCurves(),this._boundKeyHandler=this._onKeyDown.bind(this),this._boundBeforeUnload=this._onBeforeUnload.bind(this),window.addEventListener("keydown",this._boundKeyHandler),window.addEventListener("beforeunload",this._boundBeforeUnload)}disconnectedCallback(){super.disconnectedCallback(),this._boundKeyHandler&&window.removeEventListener("keydown",this._boundKeyHandler),this._boundBeforeUnload&&window.removeEventListener("beforeunload",this._boundBeforeUnload),this._saveSuccessTimer&&(clearTimeout(this._saveSuccessTimer),this._saveSuccessTimer=null),this._cancelAnimFrame&&(cancelAnimationFrame(this._cancelAnimFrame),this._cancelAnimFrame=null,this._cancelAnimating=!1)}updated(t){if(super.updated(t),t.has("_curves")||t.has("_originalCurves")||t.has("_cancelAnimating")){const t=this._isDirty;t!==this._lastEmittedDirtyState&&(this._lastEmittedDirtyState=t,this.dispatchEvent(new CustomEvent("curve-dirty-state",{detail:{dirty:t},bubbles:!0,composed:!0})))}}_onKeyDown(t){const e=document.activeElement;e&&e!==this&&e!==document.body&&!this.contains(e)||((t.ctrlKey||t.metaKey)&&"s"===t.key&&this._isDirty&&this._isAdmin&&!this._saving&&(t.preventDefault(),this._onSave()),!t.ctrlKey&&!t.metaKey||"z"!==t.key||t.shiftKey||!this._saving&&!this._cancelAnimating&&this._undoStack.length>0&&(t.preventDefault(),this._undo()),"Escape"===t.key&&(!this._isDirty||this._saving||this._cancelAnimating||(t.preventDefault(),this._onCancel())))}_onBeforeUnload(t){this._isDirty&&(t.preventDefault(),t.returnValue="")}async _tryLoadCurves(){if(this._loaded&&this._loadedEntityId===this._entityId)return;if(this._loading)return;if(!this._hass||!this._entityId){if(0===this._curves.length){const t=[{entityId:"light.ceiling_light",friendlyName:"Ceiling Light",controlPoints:[{lightener:0,target:0},{lightener:20,target:0},{lightener:60,target:80},{lightener:100,target:100}],visible:!0,color:Et[0]},{entityId:"light.sofa_lamp",friendlyName:"Sofa Lamp",controlPoints:[{lightener:0,target:0},{lightener:10,target:50},{lightener:40,target:100},{lightener:70,target:100},{lightener:100,target:60}],visible:!0,color:Et[1]},{entityId:"light.led_strip",friendlyName:"LED Strip",controlPoints:[{lightener:0,target:0},{lightener:1,target:1},{lightener:100,target:100}],visible:!0,color:Et[2]}];this._curves=t,this._originalCurves=ft(t)}return}this._loadError=null,this._loading=!0;const t=this._entityId;try{const s=await this._hass.callWS({type:"lightener/get_curves",entity_id:t});if(this._entityId!==t)return;const n=(e=s.entities,i=this._hass.states,r=Et,Object.keys(e).map((t,s)=>{const n=e[t]?.brightness??{},o=[{lightener:0,target:0}];for(const[t,e]of Object.entries(n)){const i=Number(t),r=Number(e);Number.isFinite(i)&&Number.isFinite(r)&&o.push({lightener:i,target:r})}o.sort((t,e)=>t.lightener-e.lightener);const a=i[t]?.attributes?.friendly_name??t.replace("light.","");return{entityId:t,friendlyName:a,controlPoints:o,visible:!0,color:r[s%r.length]}}));this._curves=n,this._originalCurves=ft(n),this._loaded=!0,this._loadedEntityId=t}catch(e){if(this._entityId!==t)return;console.error("[Lightener] Failed to load curves:",e),this._loadError=String(e),this._loaded=!0,this._loadedEntityId=t}finally{this._loading=!1,this._entityId!==t&&this._tryLoadCurves()}var e,i,r}_onScrubberMove(t){this._scrubberPosition=t.detail.position,this._previewLights(t.detail.position)}_onScrubberStart(){if(this._hass&&!this._previewActive){this._previewActive=!0,this._previewRestoreBrightness.clear();for(const t of this._curves){const e=this._hass.states[t.entityId];e&&this._previewRestoreBrightness.set(t.entityId,"off"===e.state?null:e.attributes.brightness??null)}}}_onScrubberEnd(){if(this._previewActive&&this._hass){this._previewActive=!1;for(const[t,e]of this._previewRestoreBrightness)null===e?this._hass.callService("light","turn_off",{entity_id:t}).catch(()=>{}):this._hass.callService("light","turn_on",{entity_id:t,brightness:e}).catch(()=>{});this._previewRestoreBrightness.clear()}}_previewLights(t){if(!this._previewActive||!this._hass)return;Date.now()-this._lastPreviewTime<this._PREVIEW_INTERVAL_MS||this._previewRafPending||(this._previewRafPending=!0,requestAnimationFrame(()=>{if(this._previewRafPending=!1,this._previewActive&&this._hass){this._lastPreviewTime=Date.now();for(const e of this._curves){if(!e.visible)continue;const i=Math.round(At(e.controlPoints,t)),r=Math.round(i/100*255);0===r?this._hass.callService("light","turn_off",{entity_id:e.entityId}).catch(()=>{}):this._hass.callService("light","turn_on",{entity_id:e.entityId,brightness:r}).catch(()=>{})}}}))}_onSelectCurve(t){if(this._cancelAnimating)return;const{entityId:e}=t.detail,i=this._curves.find(t=>t.entityId===e);i&&!i.visible||(this._selectedCurveId=this._selectedCurveId===e?null:e)}_onFocusCurve(t){if(this._cancelAnimating)return;const{entityId:e}=t.detail,i=this._curves.find(t=>t.entityId===e);i&&i.visible&&(this._selectedCurveId=e)}_pushUndo(){this._undoStack.push(ft(this._curves)),this._undoStack.length>50&&this._undoStack.shift()}_undo(){0!==this._undoStack.length&&null===this._cancelAnimFrame&&this._animateCurvesTo(this._undoStack.pop())}_animateCurvesTo(t,e){const i=ft(this._curves);this._cancelAnimating=!0;const r=performance.now(),s=n=>{const o=n-r,a=Math.min(o/300,1),l=function(t){return 1-Math.pow(1-t,3)}(a),d=t.map((t,e)=>{const r=i[e];if(!r)return t;const s=r.controlPoints,n=t.controlPoints,o=Math.min(s.length,n.length),d=[];for(let t=0;t<o;t++)d.push({lightener:Math.round(s[t].lightener+(n[t].lightener-s[t].lightener)*l),target:Math.round(s[t].target+(n[t].target-s[t].target)*l)});if(n.length>o&&a>=1)for(let t=o;t<n.length;t++)d.push({...n[t]});if(s.length>o&&a<1)for(let t=o;t<s.length;t++)d.push({...s[t]});return d.sort((t,e)=>t.lightener-e.lightener),{...t,controlPoints:d,visible:r.visible}});this._curves=d,a<1?this._cancelAnimFrame=requestAnimationFrame(s):(this._curves=t.map((t,e)=>({...t,visible:i[e]?.visible??t.visible})),this._cancelAnimating=!1,this._cancelAnimFrame=null,e?.())};this._cancelAnimFrame=requestAnimationFrame(s)}_onPointMove(t){if(this._cancelAnimating)return;this._dragUndoPushed||(this._pushUndo(),this._dragUndoPushed=!0);const{curveIndex:e,pointIndex:i,lightener:r,target:s}=t.detail,n=this._curves[e];n&&this._selectedCurveId!==n.entityId&&(this._selectedCurveId=n.entityId);const o=[...this._curves],a={...o[e]},l=[...a.controlPoints];l[i]={lightener:r,target:s},a.controlPoints=l,o[e]=a,this._curves=o}_onPointDrop(t){this._dragUndoPushed=!1}_onPointAdd(t){if(this._cancelAnimating)return;const{lightener:e,target:i,entityId:r}=t.detail,s=r??this._selectedCurveId;if(!s)return;const n=this._curves.findIndex(t=>t.entityId===s);if(n<0)return;if(this._curves[n].controlPoints.some(t=>t.lightener===e))return;this._pushUndo();const o=[...this._curves],a={...o[n]},l=[...a.controlPoints,{lightener:e,target:i}];l.sort((t,e)=>t.lightener-e.lightener),a.controlPoints=l,o[n]=a,this._curves=o}_onPointRemove(t){if(this._cancelAnimating)return;this._dragUndoPushed=!1;const{curveIndex:e,pointIndex:i}=t.detail,r=this._curves[e];if(!r)return;if(r.controlPoints.length<=2)return;this._pushUndo();const s=[...this._curves],n={...s[e]};n.controlPoints=n.controlPoints.filter((t,e)=>e!==i),s[e]=n,this._curves=s}_onToggleCurve(t){if(this._cancelAnimating)return;const{entityId:e}=t.detail,i=this._curves.map(t=>t.entityId===e?{...t,visible:!t.visible}:t);if(this._curves=i,this._selectedCurveId===e){const t=i.find(t=>t.entityId===e);t&&!t.visible&&(this._selectedCurveId=null)}}async saveCurves(){return this._onSave()}async _onSave(){if(!this._hass||!this._entityId||this._saving||this._cancelAnimating)return!1;this._saving=!0,this._saveError=null;try{const t=function(t){const e={};for(const i of t){const t={};for(const e of i.controlPoints)0!==e.lightener&&(t[String(e.lightener)]=String(e.target));e[i.entityId]={brightness:t}}return e}(this._curves);return await this._hass.callWS({type:"lightener/save_curves",entity_id:this._entityId,curves:t}),this._originalCurves=ft(this._curves),this._undoStack=[],this._loaded=!1,this._tryLoadCurves(),this._saveSuccess=!0,this._saveSuccessTimer=setTimeout(()=>{this._saveSuccess=!1,this._saveSuccessTimer=null},2e3),!0}catch(t){return console.error("[Lightener] Failed to save curves:",t),this._saveError="Save failed. Check connection.",!1}finally{this._saving=!1}}_retryLoad(){this._loaded=!1,this._loadError=null,this._tryLoadCurves()}_onCancel(){this._cancelAnimating||(this._undoStack=[],this._animateCurvesTo(ft(this._originalCurves),()=>{this._selectedCurveId=null}))}_renderLoadingSkeleton(){return K`
      <div class="loading-indicator" role="status" aria-live="polite">
        <div class="loading-graph" aria-hidden="true"></div>
        <div class="loading-caption">Loading curves…</div>
      </div>
    `}render(){return K`
      <div
        class="card ${this._embedded?"embedded":""}"
        role="region"
        aria-label="Brightness Curves Editor"
      >
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

        <div class="workspace">
          <div class="main-stack">
            ${this._loading?this._renderLoadingSkeleton():K`<div class="graph-panel">
                  <curve-graph
                    .curves=${this._curves}
                    .selectedCurveId=${this._selectedCurveId}
                    .readOnly=${!this._isAdmin||this._cancelAnimating}
                    .scrubberPosition=${this._scrubberPosition}
                    @point-move=${this._onPointMove}
                    @point-drop=${this._onPointDrop}
                    @point-add=${this._onPointAdd}
                    @point-remove=${this._onPointRemove}
                    @focus-curve=${this._onFocusCurve}
                  ></curve-graph>
                </div>`}

            <curve-scrubber
              .curves=${this._curves}
              .readOnly=${!this._isAdmin}
              @scrubber-move=${this._onScrubberMove}
              @scrubber-start=${this._onScrubberStart}
              @scrubber-end=${this._onScrubberEnd}
            ></curve-scrubber>
          </div>

          <div class="side-rail">
            <curve-legend
              .curves=${this._curves}
              .selectedCurveId=${this._selectedCurveId}
              @select-curve=${this._onSelectCurve}
              @toggle-curve=${this._onToggleCurve}
            ></curve-legend>
          </div>

          <div class="footer-slot">
            <curve-footer
              .dirty=${this._isDirty||this._cancelAnimating}
              .readOnly=${!this._isAdmin}
              .saving=${this._saving||this._cancelAnimating}
              .canUndo=${this._undoStack.length>0&&!this._cancelAnimating}
              @save-curves=${this._onSave}
              @cancel-curves=${this._onCancel}
              @undo-curves=${()=>this._undo()}
            ></curve-footer>
          </div>
        </div>

        <div class="status-stack">
          ${this._previewActive?K`<div class="preview-notice" role="status" aria-live="polite">
                Previewing live — release to restore original brightness
              </div>`:W}
          ${this._saveSuccess?K`<div class="success" role="status" aria-live="polite">
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
              </div>`:W}
          ${this._loadError?K`<div class="error" role="alert">
                ${Rt} Failed to load curves
                <button type="button" class="retry-link" @click=${this._retryLoad}>Retry</button>
              </div>`:W}
          ${this._saveError?K`<div class="error" role="alert">
                ${Rt} Save failed
                <button type="button" class="retry-link" @click=${this._onSave}>Retry</button>
              </div>`:W}
        </div>
      </div>
    `}};zt.styles=o`
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
    .card.embedded {
      --curve-graph-max-height: 520px;
      --curve-graph-min-height: 360px;
      --curve-legend-max-height: 440px;
      --curve-scrubber-badges-max-height: 72px;

      background: transparent;
      box-shadow: none;
      border-radius: 0;
      padding: 0;
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
    .workspace {
      display: grid;
      gap: 14px;
    }
    .main-stack,
    .side-rail,
    .footer-slot,
    .status-stack {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-width: 0;
    }
    .graph-panel {
      border-radius: 12px;
      padding: 12px;
      background: var(--panel-bg);
      box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.04);
      overflow: hidden;
    }
    .card.embedded .header {
      margin-bottom: 12px;
      padding-inline: 2px;
    }
    .card.embedded .graph-panel {
      padding: 14px;
      border: 1px solid color-mix(in srgb, var(--divider) 80%, transparent);
      box-shadow: none;
    }
    .card.embedded .header-icon {
      opacity: 0.42;
    }
    .card.embedded h2 {
      font-size: 0.95rem;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      color: var(--secondary-text);
    }
    .error {
      font-size: var(--text-sm);
      color: var(--error-color, #db4437);
      padding: 0;
      display: flex;
      align-items: center;
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
      padding: 0;
      display: flex;
      align-items: center;
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
    .preview-notice {
      font-size: var(--text-sm);
      color: var(--secondary-text-color, #616161);
      padding: 0;
      display: flex;
      align-items: center;
      gap: 6px;
      opacity: 0.8;
    }
    .status-icon {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }
    .loading-indicator {
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 280px;
      gap: 16px;
      padding: 28px 20px;
      border-radius: 12px;
      background: var(--panel-bg);
    }
    .loading-graph {
      position: relative;
      min-height: 240px;
      border-radius: 10px;
      overflow: hidden;
      background:
        linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.16), transparent),
        linear-gradient(rgba(128, 128, 128, 0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(128, 128, 128, 0.08) 1px, transparent 1px);
      background-size:
        200px 100%,
        100% 25%,
        25% 100%;
      background-position:
        -200px 0,
        0 0,
        0 0;
      animation: shimmer 1.8s ease-in-out infinite;
    }
    .loading-graph::before,
    .loading-graph::after {
      content: '';
      position: absolute;
    }
    .loading-graph::before {
      inset: 18px 18px 18px 28px;
      border-left: 1px solid rgba(128, 128, 128, 0.18);
      border-bottom: 1px solid rgba(128, 128, 128, 0.18);
      border-radius: 0 0 0 6px;
    }
    .loading-graph::after {
      inset: auto 40px 52px 44px;
      height: 90px;
      border-radius: 999px;
      background: linear-gradient(
        120deg,
        rgba(37, 99, 235, 0.08) 0%,
        rgba(37, 99, 235, 0.3) 45%,
        rgba(37, 99, 235, 0.08) 100%
      );
      clip-path: polygon(0% 78%, 18% 78%, 38% 45%, 62% 18%, 82% 22%, 100% 0, 100% 100%, 0 100%);
    }
    .loading-caption {
      font-size: var(--text-sm);
      color: var(--secondary-text);
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
    @keyframes shimmer {
      0% {
        background-position:
          -200px 0,
          0 0,
          0 0;
      }
      100% {
        background-position:
          calc(100% + 200px) 0,
          0 0,
          0 0;
      }
    }
    @media (min-width: 1100px) {
      .card.embedded .workspace {
        grid-template-columns: minmax(0, 1.7fr) minmax(300px, 0.95fr);
        align-items: start;
        grid-template-areas:
          'main side'
          'main footer';
      }
      .card.embedded .main-stack {
        grid-area: main;
      }
      .card.embedded .side-rail {
        grid-area: side;
      }
      .card.embedded .footer-slot {
        grid-area: footer;
      }
    }
    @media (max-width: 1099px) {
      .card.embedded {
        --curve-graph-max-height: 420px;
        --curve-graph-min-height: 300px;
        --curve-legend-max-height: none;
      }
      .card.embedded .footer-slot {
        order: 2;
        position: sticky;
        bottom: max(0px, env(safe-area-inset-bottom));
        z-index: 3;
        padding-top: 8px;
        border-top: 1px solid var(--divider-color, rgba(127, 127, 127, 0.2));
        background: color-mix(in srgb, var(--card-bg) 72%, transparent);
        backdrop-filter: blur(14px);
      }
      .card.embedded .side-rail {
        order: 3;
      }
    }
    @media (max-width: 700px) {
      .card.embedded {
        --curve-graph-min-height: 240px;
      }
    }
  `,t([vt()],zt.prototype,"_curves",void 0),t([vt()],zt.prototype,"_originalCurves",void 0),t([vt()],zt.prototype,"_config",void 0),t([vt()],zt.prototype,"_selectedCurveId",void 0),t([vt()],zt.prototype,"_saving",void 0),t([vt()],zt.prototype,"_loadError",void 0),t([vt()],zt.prototype,"_saveError",void 0),t([vt()],zt.prototype,"_saveSuccess",void 0),t([vt()],zt.prototype,"_loading",void 0),t([vt()],zt.prototype,"_scrubberPosition",void 0),t([vt()],zt.prototype,"_cancelAnimating",void 0),t([vt()],zt.prototype,"_hass",void 0),t([vt()],zt.prototype,"_previewActive",void 0),zt=t([ht("lightener-curve-card")],zt);export{zt as LightenerCurveCard,Tt as LightenerCurveCardEditor};
