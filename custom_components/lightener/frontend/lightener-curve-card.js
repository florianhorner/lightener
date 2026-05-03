function t(t,e,i,r){var n,s=arguments.length,o=s<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(t,e,i,r);else for(var a=t.length-1;a>=0;a--)(n=t[a])&&(o=(s<3?n(o):s>3?n(e,i,o):n(e,i))||o);return s>3&&o&&Object.defineProperty(e,i,o),o}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,r=Symbol(),n=new WeakMap;let s=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==r)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=n.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&n.set(e,t))}return t}toString(){return this.cssText}};const o=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,r)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[r+1],t[0]);return new s(i,t,r)},a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new s("string"==typeof t?t:t+"",void 0,r))(e)})(t):t,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:g}=Object,u=globalThis,v=u.trustedTypes,_=v?v.emptyScript:"",b=u.reactiveElementPolyfillSupport,f=(t,e)=>t,m={toAttribute(t,e){switch(e){case Boolean:t=t?_:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},y=(t,e)=>!l(t,e),x={attribute:!0,type:String,converter:m,reflect:!1,useDefault:!1,hasChanged:y};Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=x){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(t,i,e);void 0!==r&&d(this.prototype,t,r)}}static getPropertyDescriptor(t,e,i){const{get:r,set:n}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:r,set(e){const s=r?.call(this);n?.call(this,e),this.requestUpdate(t,s,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??x}static _$Ei(){if(this.hasOwnProperty(f("elementProperties")))return;const t=g(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(f("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(f("properties"))){const t=this.properties,e=[...h(t),...p(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,r)=>{if(i)t.adoptedStyleSheets=r.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of r){const r=document.createElement("style"),n=e.litNonce;void 0!==n&&r.setAttribute("nonce",n),r.textContent=i.cssText,t.appendChild(r)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),r=this.constructor._$Eu(t,i);if(void 0!==r&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:m).toAttribute(e,i.type);this._$Em=t,null==n?this.removeAttribute(r):this.setAttribute(r,n),this._$Em=null}}_$AK(t,e){const i=this.constructor,r=i._$Eh.get(t);if(void 0!==r&&this._$Em!==r){const t=i.getPropertyOptions(r),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:m;this._$Em=r;const s=n.fromAttribute(e,t.type);this[r]=s??this._$Ej?.get(r)??s,this._$Em=null}}requestUpdate(t,e,i,r=!1,n){if(void 0!==t){const s=this.constructor;if(!1===r&&(n=this[t]),i??=s.getPropertyOptions(t),!((i.hasChanged??y)(n,e)||i.useDefault&&i.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(s._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:r,wrapped:n},s){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,s??e??this[t]),!0!==n||void 0!==s)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===r&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,r=this[e];!0!==t||this._$AL.has(e)||void 0===r||this.C(e,void 0,i,r)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[f("elementProperties")]=new Map,$[f("finalized")]=new Map,b?.({ReactiveElement:$}),(u.reactiveElementVersions??=[]).push("2.1.2");const w=globalThis,k=t=>t,P=w.trustedTypes,C=P?P.createPolicy("lit-html",{createHTML:t=>t}):void 0,A="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,I="?"+E,S=`<${I}>`,M=document,L=()=>M.createComment(""),R=t=>null===t||"object"!=typeof t&&"function"!=typeof t,T=Array.isArray,D="[ \t\n\f\r]",U=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,O=/-->/g,z=/>/g,N=RegExp(`>|${D}(?:([^\\s"'>=/]+)(${D}*=${D}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),B=/'/g,H=/"/g,j=/^(?:script|style|textarea|title)$/i,F=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),V=F(1),q=F(2),K=Symbol.for("lit-noChange"),W=Symbol.for("lit-nothing"),G=new WeakMap,X=M.createTreeWalker(M,129);function Y(t,e){if(!T(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==C?C.createHTML(e):e}const Z=(t,e)=>{const i=t.length-1,r=[];let n,s=2===e?"<svg>":3===e?"<math>":"",o=U;for(let e=0;e<i;e++){const i=t[e];let a,l,d=-1,c=0;for(;c<i.length&&(o.lastIndex=c,l=o.exec(i),null!==l);)c=o.lastIndex,o===U?"!--"===l[1]?o=O:void 0!==l[1]?o=z:void 0!==l[2]?(j.test(l[2])&&(n=RegExp("</"+l[2],"g")),o=N):void 0!==l[3]&&(o=N):o===N?">"===l[0]?(o=n??U,d=-1):void 0===l[1]?d=-2:(d=o.lastIndex-l[2].length,a=l[1],o=void 0===l[3]?N:'"'===l[3]?H:B):o===H||o===B?o=N:o===O||o===z?o=U:(o=N,n=void 0);const h=o===N&&t[e+1].startsWith("/>")?" ":"";s+=o===U?i+S:d>=0?(r.push(a),i.slice(0,d)+A+i.slice(d)+E+h):i+E+(-2===d?e:h)}return[Y(t,s+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),r]};class J{constructor({strings:t,_$litType$:e},i){let r;this.parts=[];let n=0,s=0;const o=t.length-1,a=this.parts,[l,d]=Z(t,e);if(this.el=J.createElement(l,i),X.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(r=X.nextNode())&&a.length<o;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(A)){const e=d[s++],i=r.getAttribute(t).split(E),o=/([.?@])?(.*)/.exec(e);a.push({type:1,index:n,name:o[2],strings:i,ctor:"."===o[1]?rt:"?"===o[1]?nt:"@"===o[1]?st:it}),r.removeAttribute(t)}else t.startsWith(E)&&(a.push({type:6,index:n}),r.removeAttribute(t));if(j.test(r.tagName)){const t=r.textContent.split(E),e=t.length-1;if(e>0){r.textContent=P?P.emptyScript:"";for(let i=0;i<e;i++)r.append(t[i],L()),X.nextNode(),a.push({type:2,index:++n});r.append(t[e],L())}}}else if(8===r.nodeType)if(r.data===I)a.push({type:2,index:n});else{let t=-1;for(;-1!==(t=r.data.indexOf(E,t+1));)a.push({type:7,index:n}),t+=E.length-1}n++}}static createElement(t,e){const i=M.createElement("template");return i.innerHTML=t,i}}function Q(t,e,i=t,r){if(e===K)return e;let n=void 0!==r?i._$Co?.[r]:i._$Cl;const s=R(e)?void 0:e._$litDirective$;return n?.constructor!==s&&(n?._$AO?.(!1),void 0===s?n=void 0:(n=new s(t),n._$AT(t,i,r)),void 0!==r?(i._$Co??=[])[r]=n:i._$Cl=n),void 0!==n&&(e=Q(t,n._$AS(t,e.values),n,r)),e}class tt{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,r=(t?.creationScope??M).importNode(e,!0);X.currentNode=r;let n=X.nextNode(),s=0,o=0,a=i[0];for(;void 0!==a;){if(s===a.index){let e;2===a.type?e=new et(n,n.nextSibling,this,t):1===a.type?e=new a.ctor(n,a.name,a.strings,this,t):6===a.type&&(e=new ot(n,this,t)),this._$AV.push(e),a=i[++o]}s!==a?.index&&(n=X.nextNode(),s++)}return X.currentNode=M,r}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class et{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,r){this.type=2,this._$AH=W,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Q(this,t,e),R(t)?t===W||null==t||""===t?(this._$AH!==W&&this._$AR(),this._$AH=W):t!==this._$AH&&t!==K&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>T(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==W&&R(this._$AH)?this._$AA.nextSibling.data=t:this.T(M.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,r="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=J.createElement(Y(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(e);else{const t=new tt(r,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=G.get(t.strings);return void 0===e&&G.set(t.strings,e=new J(t)),e}k(t){T(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,r=0;for(const n of t)r===e.length?e.push(i=new et(this.O(L()),this.O(L()),this,this.options)):i=e[r],i._$AI(n),r++;r<e.length&&(this._$AR(i&&i._$AB.nextSibling,r),e.length=r)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=k(t).nextSibling;k(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class it{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,r,n){this.type=1,this._$AH=W,this._$AN=void 0,this.element=t,this.name=e,this._$AM=r,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=W}_$AI(t,e=this,i,r){const n=this.strings;let s=!1;if(void 0===n)t=Q(this,t,e,0),s=!R(t)||t!==this._$AH&&t!==K,s&&(this._$AH=t);else{const r=t;let o,a;for(t=n[0],o=0;o<n.length-1;o++)a=Q(this,r[i+o],e,o),a===K&&(a=this._$AH[o]),s||=!R(a)||a!==this._$AH[o],a===W?t=W:t!==W&&(t+=(a??"")+n[o+1]),this._$AH[o]=a}s&&!r&&this.j(t)}j(t){t===W?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class rt extends it{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===W?void 0:t}}class nt extends it{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==W)}}class st extends it{constructor(t,e,i,r,n){super(t,e,i,r,n),this.type=5}_$AI(t,e=this){if((t=Q(this,t,e,0)??W)===K)return;const i=this._$AH,r=t===W&&i!==W||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,n=t!==W&&(i===W||r);r&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class ot{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Q(this,t)}}const at=w.litHtmlPolyfillSupport;at?.(J,et),(w.litHtmlVersions??=[]).push("3.3.2");const lt=globalThis;class dt extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const r=i?.renderBefore??e;let n=r._$litPart$;if(void 0===n){const t=i?.renderBefore??null;r._$litPart$=n=new et(e.insertBefore(L(),t),t,void 0,i??{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return K}}dt._$litElement$=!0,dt.finalized=!0,lt.litElementHydrateSupport?.({LitElement:dt});const ct=lt.litElementPolyfillSupport;ct?.({LitElement:dt}),(lt.litElementVersions??=[]).push("4.2.2");const ht=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},pt={attribute:!0,type:String,converter:m,reflect:!1,hasChanged:y},gt=(t=pt,e,i)=>{const{kind:r,metadata:n}=i;let s=globalThis.litPropertyMetadata.get(n);if(void 0===s&&globalThis.litPropertyMetadata.set(n,s=new Map),"setter"===r&&((t=Object.create(t)).wrapped=!0),s.set(i.name,t),"accessor"===r){const{name:r}=i;return{set(i){const n=e.get.call(this);e.set.call(this,i),this.requestUpdate(r,n,t,!0,i)},init(e){return void 0!==e&&this.C(r,void 0,t,e),e}}}if("setter"===r){const{name:r}=i;return function(i){const n=this[r];e.call(this,i),this.requestUpdate(r,n,t,!0,i)}}throw Error("Unsupported decorator location: "+r)};function ut(t){return(e,i)=>"object"==typeof i?gt(t,e,i):((t,e,i)=>{const r=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),r?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function vt(t){return ut({...t,state:!0,attribute:!1})}class _t{constructor(t,e){this.isConnected=t,this.requestUpdate=e,this.ready=!1,this.started=!1}ensureLoaded(){if(this.started)return;if(this.started=!0,customElements.get("ha-entity-picker"))return void(this.ready=!0);(async()=>{try{const t=window.loadCardHelpers;"function"==typeof t&&await t()}catch{}try{const t=customElements.get("hui-entities-card");await(t?.getConfigElement?.())}catch{}})();const t=customElements.whenDefined("ha-entity-picker"),e=new Promise(t=>setTimeout(t,1500));Promise.race([t,e]).then(()=>{this.isConnected()&&(this.ready=!!customElements.get("ha-entity-picker"),this.ready||(console.warn("[lightener] <ha-entity-picker> not available — falling back to plain input."),customElements.whenDefined("ha-entity-picker").then(()=>{this.isConnected()&&(this.ready=!0,this.requestUpdate())}).catch(()=>{})),this.requestUpdate())}).catch(()=>{})}}function bt(t){return{...t,controlPoints:t.controlPoints.map(t=>({...t}))}}function ft(t){return t.map(bt)}function mt(t,e,i){const[r,n]=t,[s,o]=e;return r===n?s:s+(i-r)*(o-s)/(n-r)}function yt(t){const e=new Map;let i=null;e.set(0,0);for(const r of t)0!==r.lightener||0===r.target?e.set(r.lightener,r.target):i=r.target;if(null===i||e.has(1)||e.set(1,i),!e.has(100)){let t=-1,i=100;for(const[r,n]of e)0!==r&&r>t&&(t=r,i=n);e.set(100,i)}const r=[];for(const[t,i]of e)r.push({lightener:t,target:i});return r.sort((t,e)=>t.lightener-e.lightener),r}function xt(t,e){return function(t,e){if(0===t.length)return 0;const i=Math.max(0,Math.min(100,e));if(i<=t[0].lightener)return t[0].target;for(let e=1;e<t.length;e++){const r=t[e-1],n=t[e];if(i===n.lightener)return n.target;if(i<n.lightener)return mt([r.lightener,n.lightener],[r.target,n.target],i)}return t[t.length-1].target}(yt(t),e)}const $t=44,wt=12,kt=300,Pt=200;function Ct(t){return $t+t/100*kt}function At(t){return wt+(1-t/100)*Pt}function Et(t,e,i){return Math.max(e,Math.min(i,t))}function It(t){const e=t.length;if(0===e)return{dx:[],tangents:[]};if(1===e)return{dx:[],tangents:[0]};const i=[],r=[],n=[];for(let s=0;s<e-1;s++)i.push(t[s+1].x-t[s].x),r.push(t[s+1].y-t[s].y),n.push(0===i[s]?0:r[s]/i[s]);const s=new Array(e).fill(0);if(2===e)return s[0]=n[0],s[1]=n[0],{dx:i,tangents:s};s[0]=n[0],s[e-1]=n[e-2];for(let t=1;t<e-1;t++)0===n[t-1]||0===n[t]||n[t-1]*n[t]<=0?s[t]=0:s[t]=(n[t-1]+n[t])/2;for(let t=0;t<e-1;t++){if(0===n[t]){s[t]=0,s[t+1]=0;continue}const e=s[t]/n[t],i=s[t+1]/n[t],r=e*e+i*i;if(r>9){const o=3/Math.sqrt(r);s[t]=o*e*n[t],s[t+1]=o*i*n[t]}}return{dx:i,tangents:s}}function St(t,e){return Math.max(0,Math.min(100,xt(t,e)))}function Mt(t,e){const i=yt(t).map(t=>({x:t.lightener,y:t.target}));return Math.max(0,Math.min(100,function(t,e){if(t.length<2)return 0;if(2===t.length){const[i,r]=t,n=r.x-i.x;if(0===n)return i.y;const s=(e-i.x)/n;return i.y+s*(r.y-i.y)}const{dx:i,tangents:r}=It(t);let n=0;for(let i=0;i<t.length-1;i++){if(e<=t[i+1].x){n=i;break}n=i}const s=i[n]||1,o=Et((e-t[n].x)/s,0,1),a=s/3,l=1-o;return l*l*l*t[n].y+3*l*l*o*(t[n].y+r[n]*a)+3*l*o*o*(t[n+1].y-r[n+1]*a)+o*o*o*t[n+1].y}(i,e)))}const Lt=["#42a5f5","#ef5350","#5c6bc0","#ffa726","#ab47bc","#1565c0","#ec407a","#8d6e63","#ffca28","#7e57c2"];const Rt=["","8 4","4 4","12 4 4 4","2 4"];const Tt=[{id:"linear",name:"Linear",description:"Equal brightness — what you set is what you get.",controlPoints:[{lightener:0,target:0},{lightener:1,target:1},{lightener:100,target:100}]},{id:"dim_accent",name:"Dim accent",description:"Caps at ~45% — great for mood or accent lighting.",controlPoints:[{lightener:0,target:0},{lightener:1,target:1},{lightener:25,target:8},{lightener:50,target:20},{lightener:100,target:45}]},{id:"late_starter",name:"Late starter",description:"Stays very dim until ~45%, then brightens quickly.",controlPoints:[{lightener:0,target:0},{lightener:1,target:1},{lightener:45,target:1},{lightener:70,target:45},{lightener:100,target:100}]},{id:"night_mode",name:"Night mode",description:"Caps at ~25% — barely bright even at full brightness.",controlPoints:[{lightener:0,target:0},{lightener:1,target:1},{lightener:20,target:3},{lightener:50,target:10},{lightener:100,target:25}]}];const Dt={phase:"idle"};let Ut=class extends dt{constructor(){super(...arguments),this.curves=[],this.selectedCurveId=null,this.readOnly=!1,this.scrubberPosition=null,this._dragCurveIdx=-1,this._dragPointIdx=-1,this._hoveredPoint=null,this._focusedPoint=null,this._isMobile=!1,this._uid=Math.random().toString(36).slice(2,7),this._mql=null,this._wasDragging=!1,this._longPressTimer=null,this._longPressFired=!1,this._onMqlChange=t=>{this._isMobile=t.matches}}_getSvgCoords(t){const e=this._svgRef;if(!e)return null;const i=e.getScreenCTM();if(!i)return null;let r;try{r=i.inverse()}catch{return null}if(!r||isNaN(r.a))return null;const n=e.createSVGPoint();n.x=t.clientX,n.y=t.clientY;const s=n.matrixTransform(r);return{x:(a=s.x,(a-$t)/kt*100),y:(o=s.y,100*(1-(o-wt)/Pt))};var o,a}_isCurveInteractive(t){return!this.readOnly&&(null===this.selectedCurveId||this.curves[t]?.entityId===this.selectedCurveId)}_focusCurve(t){this.dispatchEvent(new CustomEvent("focus-curve",{detail:{entityId:t},bubbles:!0,composed:!0}))}_onPointFocus(t,e){const i=this.curves[t];i&&(this._focusedPoint={curve:t,point:e},this._hoveredPoint={curve:t,point:e},this._focusCurve(i.entityId))}_onPointBlur(t,e){this._focusedPoint?.curve===t&&this._focusedPoint?.point===e&&(this._focusedPoint=null),this._hoveredPoint?.curve===t&&this._hoveredPoint?.point===e&&(this._hoveredPoint=null)}_dispatchKeyboardMove(t,e,i,r){this.dispatchEvent(new CustomEvent("point-move",{detail:{curveIndex:t,pointIndex:e,lightener:i,target:r},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("point-drop",{detail:{curveIndex:t,pointIndex:e},bubbles:!0,composed:!0}))}_getKeyboardInsertPoint(t,e){const i=t.controlPoints[e],r=t.controlPoints[e+1],n=t.controlPoints[e-1];return r&&r.lightener-i.lightener>1?{lightener:Math.round((i.lightener+r.lightener)/2),target:Math.round((i.target+r.target)/2)}:n&&i.lightener-n.lightener>1?{lightener:Math.round((n.lightener+i.lightener)/2),target:Math.round((n.target+i.target)/2)}:null}_onPointKeyDown(t,e,i){const r=this.curves[e],n=r?.controlPoints[i];if(!r||!n)return;if(this.selectedCurveId!==r.entityId&&this._focusCurve(r.entityId),0===i&&("ArrowRight"===t.key||"ArrowLeft"===t.key))return;const s=t.shiftKey?10:1,o=i>0?r.controlPoints[i-1].lightener+1:n.lightener,a=i<r.controlPoints.length-1?r.controlPoints[i+1].lightener-1:100;if("ArrowRight"===t.key)return t.preventDefault(),void this._dispatchKeyboardMove(e,i,Math.min(a,n.lightener+s),n.target);if("ArrowLeft"===t.key)return t.preventDefault(),void this._dispatchKeyboardMove(e,i,Math.max(o,n.lightener-s),n.target);if("ArrowUp"===t.key)return t.preventDefault(),void this._dispatchKeyboardMove(e,i,n.lightener,Math.min(100,n.target+s));if("ArrowDown"===t.key)return t.preventDefault(),void this._dispatchKeyboardMove(e,i,n.lightener,Math.max(0,n.target-s));if("Enter"===t.key){const n=this._getKeyboardInsertPoint(r,i);if(!n)return;return t.preventDefault(),this.dispatchEvent(new CustomEvent("point-add",{detail:{entityId:r.entityId,lightener:n.lightener,target:n.target},bubbles:!0,composed:!0})),void this.updateComplete.then(()=>this._refocusHitCircle(e,i)).catch(()=>{})}(" "===t.key||"Delete"===t.key||"Backspace"===t.key)&&i>0&&r.controlPoints.length>2&&(t.preventDefault(),this.dispatchEvent(new CustomEvent("point-remove",{detail:{curveIndex:e,pointIndex:i},bubbles:!0,composed:!0})),this.updateComplete.then(()=>this._refocusHitCircle(e,Math.max(1,i-1))).catch(()=>{}))}_refocusHitCircle(t,e){const i=this.renderRoot.querySelector(`.hit-circle[data-curve="${t}"][data-point="${e}"]`);i&&i.focus()}_onPointerDown(t,e,i){0===t.button&&this._isCurveInteractive(e)&&(t.preventDefault(),this._longPressFired=!1,this._clearLongPress(),i>0&&(this._longPressTimer=setTimeout(()=>{this._longPressFired=!0,this._dragCurveIdx=-1,this._dragPointIdx=-1,this.dispatchEvent(new CustomEvent("point-remove",{detail:{curveIndex:e,pointIndex:i},bubbles:!0,composed:!0}))},500)),this._svgRef?.setPointerCapture(t.pointerId),this._dragCurveIdx=e,this._dragPointIdx=i)}_clearLongPress(){this._longPressTimer&&(clearTimeout(this._longPressTimer),this._longPressTimer=null)}_onPointerMove(t){if(this._dragCurveIdx<0)return;t.preventDefault(),this._clearLongPress();const e=this._getSvgCoords(t);if(!e)return;const i=this.curves[this._dragCurveIdx],r=i?.controlPoints??[],n=this._dragPointIdx>0?r[this._dragPointIdx-1].lightener+1:1,s=this._dragPointIdx<r.length-1?r[this._dragPointIdx+1].lightener-1:100,o=0===this._dragPointIdx?this.curves[this._dragCurveIdx]?.controlPoints[0]?.lightener??0:Math.round(Et(e.x,n,s)),a=Math.round(Et(e.y,0,100));this.dispatchEvent(new CustomEvent("point-move",{detail:{curveIndex:this._dragCurveIdx,pointIndex:this._dragPointIdx,lightener:o,target:a},bubbles:!0,composed:!0}))}_onPointerUp(t){this._clearLongPress(),this._longPressFired||this._dragCurveIdx<0||(t.preventDefault(),this.dispatchEvent(new CustomEvent("point-drop",{detail:{curveIndex:this._dragCurveIdx,pointIndex:this._dragPointIdx},bubbles:!0,composed:!0})),this._dragCurveIdx=-1,this._dragPointIdx=-1,this._wasDragging=!0,setTimeout(()=>{this._wasDragging=!1},400))}_onPointContextMenu(t,e,i){t.preventDefault(),t.stopPropagation(),this.readOnly||this._isCurveInteractive(e)&&0!==i&&this.dispatchEvent(new CustomEvent("point-remove",{detail:{curveIndex:e,pointIndex:i},bubbles:!0,composed:!0}))}_onDblClick(t){if(this.readOnly)return;if(this._wasDragging)return;const e=this._getSvgCoords(t);if(!e)return;const i=Math.round(Et(e.x,1,100)),r=Math.round(Et(e.y,0,100));this.dispatchEvent(new CustomEvent("point-add",{detail:{lightener:i,target:r,entityId:this.selectedCurveId},bubbles:!0,composed:!0}))}_renderGrid(){return q`
      <defs>
        <clipPath id="graph-area-${this._uid}">
          <rect x="${14}" y="${-18}" width="${360}" height="${260}" />
        </clipPath>
      </defs>
      <!-- Diagonal reference line (1:1) -->
      <line class="diagonal-ref"
        x1="${Ct(0)}" y1="${At(0)}"
        x2="${Ct(100)}" y2="${At(100)}" />

      ${[0,25,50,75,100].map(t=>q`
        <!-- Vertical grid -->
        <line class="grid-line"
          x1="${Ct(t)}" y1="${At(0)}"
          x2="${Ct(t)}" y2="${At(100)}" />
        <!-- Horizontal grid -->
        <line class="grid-line"
          x1="${Ct(0)}" y1="${At(t)}"
          x2="${Ct(100)}" y2="${At(t)}" />
        <!-- X tick labels -->
        <text class="tick-label" text-anchor="middle"
          x="${Ct(t)}" y="${228}">${t}%</text>
        <!-- Y tick labels -->
        <text class="tick-label" text-anchor="end" dominant-baseline="middle"
          x="${38}" y="${At(t)}">${t}%</text>
      `)}

      <!-- Axis border lines -->
      <line class="axis-line"
        x1="${$t}" y1="${At(0)}"
        x2="${344}" y2="${At(0)}" />
      <line class="axis-line"
        x1="${$t}" y1="${At(0)}"
        x2="${$t}" y2="${At(100)}" />

      <!-- Axis labels -->
      <text class="axis-label" text-anchor="middle"
        x="${194}" y="${244}">Group brightness</text>
      <text class="axis-label" text-anchor="middle"
        transform="rotate(-90, 10, ${112})"
        x="10" y="${112}">Light brightness</text>
    `}_renderCrossHair(t){if(this._dragCurveIdx<0)return W;const e=t.controlPoints[this._dragPointIdx];if(!e)return W;const i=Ct(e.lightener),r=At(e.target);return q`
      <line class="crosshair"
        x1="${i}" y1="${r}"
        x2="${i}" y2="${At(0)}"
        stroke="${t.color}" opacity="0.5" />
      <line class="crosshair"
        x1="${i}" y1="${r}"
        x2="${$t}" y2="${r}"
        stroke="${t.color}" opacity="0.5" />
    `}_renderTooltip(t,e){const i=Ct(e.lightener),r=At(e.target),n=`${e.lightener}:${e.target}`,s=5*n.length,o=Et(i-s/2-2,$t,344-s-8),a=Math.max(16,r-16);return q`
      <rect class="tooltip-bg"
        x="${o}" y="${a-8}"
        width="${s+8}" height="14" />
      <text class="tooltip-text" text-anchor="start"
        x="${o+4}" y="${a+2}">${n}</text>
    `}_renderScrubberIndicator(){if(null===this.scrubberPosition)return W;const t=this.scrubberPosition,e=Ct(t),i=q`
      <rect
        x="${e}" y="${At(100)}"
        width="${Ct(100)-e}" height="${Pt}"
        fill="var(--ha-card-background, var(--card-background-color, #fff))"
        fill-opacity="0.93"
        pointer-events="none"
      />
    `,r=q`
      <line class="scrubber-line"
        x1="${e}" y1="${At(0)}"
        x2="${e}" y2="${At(100)}" />
    `,n=this.curves.filter(t=>t.visible).map(i=>{const r=At(Mt(i.controlPoints,t));return q`
          <circle
            class="scrubber-dot"
            cx="${e}" cy="${r}"
            r="4"
            fill="${i.color}"
            filter="url(#scrubber-glow-${i.color.replace("#","")}-${this._uid})"
            pointer-events="none"
          />
        `});return q`${i}${r}${n}`}_orderedCurves(){const t=this.selectedCurveId?this.curves.findIndex(t=>t.entityId===this.selectedCurveId):-1;return t>=0?[...this.curves.slice(0,t).map((t,e)=>({curve:t,idx:e})),...this.curves.slice(t+1).map((e,i)=>({curve:e,idx:t+1+i})),{curve:this.curves[t],idx:t}]:this.curves.map((t,e)=>({curve:t,idx:e}))}_renderCurvePaths(t,e){if(!t.visible||!t.controlPoints.length)return W;try{const i=null===this.selectedCurveId||t.entityId===this.selectedCurveId,r=this._dragCurveIdx===e,n=i?1:.2,s=yt(t.controlPoints),o=function(t){if(t.length<2)return"";if(2===t.length)return`M${t[0].x},${t[0].y} L${t[1].x},${t[1].y}`;const{dx:e,tangents:i}=It(t);let r=`M${t[0].x},${t[0].y}`;for(let n=0;n<t.length-1;n++){const s=e[n]/3;r+=` C${t[n].x+s},${t[n].y+i[n]*s} ${t[n+1].x-s},${t[n+1].y-i[n+1]*s} ${t[n+1].x},${t[n+1].y}`}return r}(s.map(t=>({x:Ct(t.lightener),y:At(t.target)}))),a=o+` L${Ct(s[s.length-1].lightener)},${At(0)}`+` L${Ct(0)},${At(0)} Z`,l=`grad-${e}-${this._uid}`,d=Rt[e%Rt.length];return q`
        <defs>
          <linearGradient id="${l}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${t.color}" stop-opacity="${i?.45:.06}" />
            <stop offset="100%" stop-color="${t.color}" stop-opacity="${i?.08:0}" />
          </linearGradient>
        </defs>
        ${r?this._renderCrossHair(t):W}
        <path
          d="${a}"
          fill="url(#${l})"
          style="opacity: ${n}"
          pointer-events="none"
        />
        <path
          class="curve-line"
          d="${o}"
          stroke="${t.color}"
          stroke-dasharray="${d}"
          style="opacity: ${n}"
          pointer-events="none"
        />
      `}catch{return W}}_renderCurvePoints(t,e){if(!t.visible||!t.controlPoints.length)return W;try{const i=this._isCurveInteractive(e);if(!(i&&!this.readOnly))return W;const r=this._dragCurveIdx===e,n=t.color+"33";let s=null;if(r&&this._dragPointIdx>=0)s=t.controlPoints[this._dragPointIdx];else if(this._hoveredPoint?.curve===e||this._focusedPoint?.curve===e){const i=this._focusedPoint?.curve===e?this._focusedPoint.point:this._hoveredPoint?.point??-1;s=t.controlPoints[i]??null}return q`
        ${t.controlPoints.map((i,s)=>{const o=0===s,a=r&&this._dragPointIdx===s,l=this._hoveredPoint?.curve===e&&this._hoveredPoint?.point===s;return q`
            <circle
              class="hit-circle ${o?"origin-hit":""}"
              data-curve="${e}"
              data-point="${s}"
              cx="${Ct(i.lightener)}"
              cy="${At(i.target)}"
              r="${this._isMobile?28:22}"
              fill="transparent"
              pointer-events="all"
              tabindex="0"
              role="button"
              aria-label="${t.friendlyName} point ${i.lightener}% group brightness to ${i.target}% light brightness. ${0===s?"Arrow Up/Down to adjust starting brightness. Cannot be moved horizontally.":"Arrow keys move, Enter adds a nearby point, Space removes."}"
              style="touch-action: none; -webkit-touch-callout: none"
              @pointerdown=${t=>this._onPointerDown(t,e,s)}
              @contextmenu=${t=>this._onPointContextMenu(t,e,s)}
              @pointerenter=${()=>this._hoveredPoint={curve:e,point:s}}
              @pointerleave=${()=>this._hoveredPoint=null}
              @focus=${()=>this._onPointFocus(e,s)}
              @blur=${()=>this._onPointBlur(e,s)}
              @keydown=${t=>this._onPointKeyDown(t,e,s)}
            />
            <circle
              class="control-point ${o?"origin":""} ${a?"dragging":""} ${l?"hovered":""} ${this._focusedPoint?.curve===e&&this._focusedPoint?.point===s?"focused":""}"
              cx="${Ct(i.lightener)}"
              cy="${At(i.target)}"
              r="6"
              fill="${n}"
              stroke="${t.color}"
              stroke-width="2"
              style="--glow-color: ${t.color}"
              pointer-events="none"
            />
          `})}
        ${null!==s?this._renderTooltip(t,s):W}
      `}catch{return W}}connectedCallback(){super.connectedCallback(),this._mql=window.matchMedia("(max-width: 500px)"),this._isMobile=this._mql.matches,this._mql.addEventListener("change",this._onMqlChange)}disconnectedCallback(){super.disconnectedCallback(),this._clearLongPress(),this._mql?.removeEventListener("change",this._onMqlChange),this._mql=null}_getSvgDescription(){const t=this.curves.filter(t=>t.visible);if(!t.length)return"No curves displayed";const e=t.map(t=>{const e=t.controlPoints[t.controlPoints.length-1];return`${t.friendlyName} (${t.controlPoints.length} points, max ${e?.target??0}%)`});return`${t.length} curve${1===t.length?"":"s"}: ${e.join(", ")}`}render(){return V`
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
        ${this.readOnly?W:V`<rect
              class="hit-area"
              x="${$t}"
              y="${wt}"
              width="${kt}"
              height="${Pt}"
              pointer-events="all"
              fill="transparent"
            />`}
        <!-- Phase 1: curve fills and lines (rendered before scrubber overlay) -->
        ${(()=>{const t=this._orderedCurves();return q`<g clip-path="url(#graph-area-${this._uid})">${t.map(({curve:t,idx:e})=>this._renderCurvePaths(t,e))}</g>`})()}
        <!-- Scrubber glow filters (only re-render when curves change, not on every position update) -->
        <defs>
          <clipPath id="editing-label-clip-${this._uid}">
            <rect x="${48}" y="${8}" width="${288}" height="24" />
          </clipPath>
          ${this.curves.filter(t=>t.visible).map(t=>{const e=`scrubber-glow-${t.color.replace("#","")}-${this._uid}`;return q`
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
        <!-- Phase 3: control points rendered after scrubber overlay so they are always visible -->
        ${(()=>{const t=this._orderedCurves();return q`<g clip-path="url(#graph-area-${this._uid})">${t.map(({curve:t,idx:e})=>this._renderCurvePoints(t,e))}</g>`})()}
        ${(()=>{if(this.readOnly)return W;if(0===this.curves.length)return q`<text class="hint hint-select" text-anchor="middle"
                x="${194}" y="${112}"
                >Add a light below to get started</text>`;if(null===this.selectedCurveId&&this._dragCurveIdx<0)return q`<text class="hint hint-select" text-anchor="middle"
                x="${194}" y="${112}"
                >Select a light to edit its curve</text>`;const t=this.curves.find(t=>t.entityId===this.selectedCurveId),e=this._isMobile?"Double-tap add · Hold remove":"Double-click to add · Right-click to remove";return q`
              <text class="editing-label"
                x="${50}" y="${26}"
                fill="${t?.color??"currentColor"}"
                clip-path="url(#editing-label-clip-${this._uid})"
                >Editing ${t?.friendlyName??""}</text>
              <text class="hint" text-anchor="middle"
                x="${194}" y="${206}"
                >${e}</text>`})()}
      </svg>
    `}};Ut.styles=o`
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
    .control-point.origin {
      stroke-dasharray: 2 2;
    }
    .hit-circle.origin-hit {
      cursor: ns-resize;
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
      font-size: 11px;
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
  `,t([ut({type:Array})],Ut.prototype,"curves",void 0),t([ut({type:String})],Ut.prototype,"selectedCurveId",void 0),t([ut({type:Boolean})],Ut.prototype,"readOnly",void 0),t([ut({type:Number})],Ut.prototype,"scrubberPosition",void 0),t([vt()],Ut.prototype,"_dragCurveIdx",void 0),t([vt()],Ut.prototype,"_dragPointIdx",void 0),t([vt()],Ut.prototype,"_hoveredPoint",void 0),t([vt()],Ut.prototype,"_focusedPoint",void 0),t([vt()],Ut.prototype,"_isMobile",void 0),t([function(t){return(e,i,r)=>((t,e,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof e&&Object.defineProperty(t,e,i),i))(e,i,{get(){return(e=>e.renderRoot?.querySelector(t)??null)(this)}})}("svg")],Ut.prototype,"_svgRef",void 0),Ut=t([ht("curve-graph")],Ut);let Ot=class extends dt{constructor(){super(...arguments),this.curves=[],this.readOnly=!1,this.previewActive=!1,this.canPreview=!1,this._dragging=!1,this._position=50,this._trackRef=null}_onPointerDown(t){this.readOnly||(t.preventDefault(),this._dragging=!0,t.target.setPointerCapture(t.pointerId),this._updatePositionFromClient(t.clientX),this.dispatchEvent(new CustomEvent("scrubber-start",{bubbles:!0,composed:!0})))}_onPointerMove(t){this._dragging&&(t.preventDefault(),this._updatePositionFromClient(t.clientX))}_onPointerUp(){this._dragging&&(this._dragging=!1,this.dispatchEvent(new CustomEvent("scrubber-end",{bubbles:!0,composed:!0})))}_onTrackClick(t){this.readOnly||this._updatePositionFromClient(t.clientX)}_onKeyDown(t){if(this.readOnly)return;const e=t.shiftKey?10:1;if("ArrowRight"===t.key||"ArrowUp"===t.key)t.preventDefault(),this._position=Math.min(100,this._position+e);else if("ArrowLeft"===t.key||"ArrowDown"===t.key)t.preventDefault(),this._position=Math.max(0,this._position-e);else if("Home"===t.key)t.preventDefault(),this._position=0;else{if("End"!==t.key)return;t.preventDefault(),this._position=100}this._emitPosition()}_updatePositionFromClient(t){const e=this._trackRef;if(!e)return;const i=e.getBoundingClientRect(),r=(t-i.left)/i.width*100;this._position=Math.max(0,Math.min(100,r)),this._emitPosition()}_emitPosition(){this.dispatchEvent(new CustomEvent("scrubber-move",{detail:{position:this._position},bubbles:!0,composed:!0}))}_onPreviewToggle(){this.dispatchEvent(new CustomEvent("preview-toggle",{bubbles:!0,composed:!0}))}firstUpdated(){this._trackRef=this.renderRoot.querySelector(".track-area")}render(){const t=Math.round(this._position);return V`
      <div class="scrubber-panel">
        <div class="scrubber-header">
          <div class="scrubber-label">Group brightness</div>
          ${this.canPreview?this.previewActive?V`<button class="preview-toggle-btn active" @click=${this._onPreviewToggle}>
                  <span class="preview-live-dot"></span>
                  Previewing all lights &nbsp;·&nbsp;
                  <span class="preview-restore-text">Restore</span>
                </button>`:V`<button class="preview-toggle-btn" @click=${this._onPreviewToggle}>
                  Preview all lights
                </button>`:W}
        </div>
        <div
          class="track-area"
          role="slider"
          tabindex="${this.readOnly?-1:0}"
          aria-disabled="${this.readOnly}"
          aria-label="Brightness scrubber"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow=${t}
          aria-valuetext="${t}% brightness"
          @click=${this._onTrackClick}
          @keydown=${this._onKeyDown}
        >
          <div class="track-bg"></div>
          <div class="track-fill" style="width: ${this._position}%"></div>
          <div class="position-label" style="left: ${this._position}%">${t}%</div>
          <div
            class="thumb ${this._dragging?"dragging":""}"
            style="left: ${this._position}%"
            @pointerdown=${this._onPointerDown}
            @pointermove=${this._onPointerMove}
            @pointerup=${this._onPointerUp}
            @lostpointercapture=${this._onPointerUp}
          ></div>
        </div>
      </div>
    `}};var zt;Ot.styles=o`
    :host {
      display: block;
      --accent: var(--primary-color, #2563eb);
      --divider: var(--divider-color, rgba(127, 127, 127, 0.2));
    }
    .scrubber-panel {
      border-radius: 12px;
      padding: 12px;
      background: color-mix(
        in srgb,
        var(--ha-card-background, var(--card-background-color, #fff)) 95%,
        var(--secondary-text-color, #616161) 5%
      );
    }
    .scrubber-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 10px;
      min-height: 22px;
    }
    .scrubber-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--secondary-text-color, #616161);
    }
    .preview-toggle-btn {
      border: 1px solid var(--divider);
      border-radius: 999px;
      padding: 4px 11px;
      font-size: 10px;
      font-weight: 500;
      background: transparent;
      color: var(--secondary-text-color, #616161);
      cursor: pointer;
      font-family: inherit;
      display: flex;
      align-items: center;
      gap: 5px;
      transition:
        border-color 0.15s,
        color 0.15s,
        background 0.15s;
      white-space: nowrap;
      flex-shrink: 0;
    }
    .preview-toggle-btn:hover {
      border-color: var(--accent);
      color: var(--accent);
      background: color-mix(in srgb, var(--accent) 4%, transparent);
    }
    .preview-toggle-btn:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
    .preview-toggle-btn.active {
      border-color: var(--accent);
      color: var(--accent);
      background: color-mix(in srgb, var(--accent) 6%, transparent);
    }
    .preview-live-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--accent);
      animation: pulse-dot 1.4s ease-in-out infinite;
      flex-shrink: 0;
    }
    .preview-restore-text {
      opacity: 0.7;
    }
    @keyframes pulse-dot {
      0%,
      100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.5;
        transform: scale(0.8);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .preview-live-dot {
        animation: none;
        opacity: 0.6;
      }
    }
    .track-area {
      position: relative;
      height: 28px;
      cursor: pointer;
      touch-action: none;
      /* Align with graph plot area: scrubber panel now has same 12px side
         padding as graph panel, so % margins match the SVG axis padding. */
      margin-left: ${$t/356*100}%;
      margin-right: ${12/356*100}%;
    }
    .track-bg {
      position: absolute;
      top: 12px;
      left: 0;
      right: 0;
      height: 4px;
      border-radius: 2px;
      background: color-mix(in srgb, var(--accent) 25%, transparent);
    }
    .track-fill {
      position: absolute;
      top: 12px;
      left: 0;
      height: 4px;
      border-radius: 2px;
      background: linear-gradient(
        90deg,
        color-mix(in srgb, var(--accent) 25%, transparent),
        var(--accent)
      );
      transition: width 0.05s linear;
    }
    .thumb {
      position: absolute;
      top: 6px;
      width: 16px;
      height: 16px;
      background: var(--accent);
      border-radius: 50%;
      transform: translateX(-50%);
      cursor: grab;
      border: 2px solid var(--ha-card-background, var(--card-background-color, #fff));
      box-shadow: 0 2px 6px color-mix(in srgb, var(--accent) 30%, transparent);
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
      box-shadow: 0 2px 10px color-mix(in srgb, var(--accent) 45%, transparent);
    }
    .thumb.dragging {
      cursor: grabbing;
      box-shadow: 0 2px 14px color-mix(in srgb, var(--accent) 50%, transparent);
    }
    .position-label {
      position: absolute;
      top: -10px;
      font-size: 10px;
      font-weight: 600;
      color: var(--accent);
      transform: translateX(-50%);
      user-select: none;
      font-variant-numeric: tabular-nums;
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
      .scrubber-label {
        font-size: 11px;
      }
      .preview-toggle-btn {
        font-size: 11px;
        padding: 0 12px;
        min-height: 44px;
      }
    }
  `,t([ut({type:Array})],Ot.prototype,"curves",void 0),t([ut({type:Boolean})],Ot.prototype,"readOnly",void 0),t([ut({type:Boolean})],Ot.prototype,"previewActive",void 0),t([ut({type:Boolean})],Ot.prototype,"canPreview",void 0),t([vt()],Ot.prototype,"_dragging",void 0),t([vt()],Ot.prototype,"_position",void 0),Ot=t([ht("curve-scrubber")],Ot);const Nt=[{value:"linear",label:"Linear"},{value:"dim_accent",label:"Dim accent"},{value:"late_starter",label:"Late starter"},{value:"night_mode",label:"Night mode"}];let Bt=zt=class extends dt{constructor(){super(...arguments),this.curves=[],this.selectedCurveId=null,this.scrubberPosition=null,this.canManage=!1,this.managing=!1,this.excludeEntityIds=[],this.presetOptions=Nt,this.closeAddSignal=0,this.closeRemoveSignal=0,this.hass=null,this._addingLight=!1,this._pendingAddEntity="",this._pendingPreset=Nt[0].value,this._confirmingRemove=null,this._picker=new _t(()=>this.isConnected,()=>this.requestUpdate())}_select(t){this._confirmingRemove!==t&&this.dispatchEvent(new CustomEvent("select-curve",{detail:{entityId:t},bubbles:!0,composed:!0}))}_toggle(t,e){t.stopPropagation(),this.dispatchEvent(new CustomEvent("toggle-curve",{detail:{entityId:e},bubbles:!0,composed:!0}))}_clearSelection(t,e){t.stopPropagation(),this._select(e)}willUpdate(t){super.willUpdate(t),!t.has("canManage")&&!t.has("managing")||this.canManage&&!this.managing||(this._confirmingRemove=null),t.has("closeAddSignal")&&this._cancelAdd(),t.has("closeRemoveSignal")&&(this._confirmingRemove=null)}_startRemove(t,e){t.stopPropagation(),this.canManage&&!this.managing&&(this.curves.length<=1||(this._cancelAdd(),this._confirmingRemove=e,this.dispatchEvent(new CustomEvent("remove-panel-open",{bubbles:!0,composed:!0}))))}_cancelRemove(t){t.stopPropagation(),this._confirmingRemove=null}_confirmRemove(t,e){t.stopPropagation(),this.canManage&&!this.managing?(this._confirmingRemove=null,this.dispatchEvent(new CustomEvent("remove-light",{detail:{entityId:e},bubbles:!0,composed:!0}))):this._confirmingRemove=null}_onItemKeyDown(t,e){if(this._confirmingRemove!==e&&t.target===t.currentTarget&&("Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._select(e)),"ArrowDown"===t.key||"ArrowUp"===t.key)){t.preventDefault();const e=[...this.renderRoot.querySelectorAll(".legend-item")],i=e.indexOf(t.currentTarget),r="ArrowDown"===t.key?i+1:i-1;e[r]?.focus()}}_onToggleKeyDown(t,e){"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._toggle(t,e))}connectedCallback(){super.connectedCallback(),this._picker.ensureLoaded()}updated(t){t.has("hass")&&this.hass&&this._picker.ensureLoaded()}_onFallbackAddEntityInput(t){this._pendingAddEntity=t.target.value.trim()}_startAdd(){this._confirmingRemove=null,this._addingLight=!0,this._pendingAddEntity="",this._pendingPreset=this.presetOptions[0]?.value??"linear",this.dispatchEvent(new CustomEvent("add-panel-open",{bubbles:!0,composed:!0}))}_cancelAdd(){this._addingLight=!1,this._pendingAddEntity=""}_onAddEntityChange(t){this._pendingAddEntity=t.detail?.value??""}_onPresetChange(t){this._pendingPreset=t.target.value}_confirmAdd(){const t=this._pendingAddEntity.trim();t&&(this.dispatchEvent(new CustomEvent("add-light",{detail:{entityId:t,preset:this._pendingPreset},bubbles:!0,composed:!0})),this._addingLight=!1,this._pendingAddEntity="")}_renderAddForm(){const t=[...this.curves.map(t=>t.entityId),...this.excludeEntityIds.filter(Boolean)];return V`
      <div class="add-form">
        ${this._picker.ready?V`<ha-entity-picker
              .hass=${this.hass}
              .value=${this._pendingAddEntity}
              .includeDomains=${["light"]}
              .excludeEntities=${t}
              allow-custom-entity
              @value-changed=${this._onAddEntityChange}
            ></ha-entity-picker>`:V`<input
              type="text"
              .value=${this._pendingAddEntity}
              placeholder="light.entity_id"
              @input=${this._onFallbackAddEntityInput}
            />`}
        <div class="preset-field">
          <label for="preset-select">Starting curve</label>
          <select id="preset-select" .value=${this._pendingPreset} @change=${this._onPresetChange}>
            ${this.presetOptions.map(t=>V`
                <option value=${t.value} ?selected=${t.value===this._pendingPreset}>
                  ${t.label}
                </option>
              `)}
          </select>
        </div>
        <div class="add-form-actions">
          <button type="button" @click=${this._cancelAdd}>Cancel</button>
          <button
            type="button"
            class="primary"
            ?disabled=${!this._pendingAddEntity}
            @click=${this._confirmAdd}
          >
            Add
          </button>
        </div>
      </div>
    `}_renderConfirmRow(t){return V`
      <div class="confirm-row">
        <span class="confirm-text">Remove "${t.friendlyName}"?</span>
        <button type="button" class="confirm-btn" @click=${t=>this._cancelRemove(t)}>
          Cancel
        </button>
        <button
          type="button"
          class="confirm-btn danger"
          @click=${e=>this._confirmRemove(e,t.entityId)}
        >
          Remove
        </button>
      </div>
    `}render(){return V`
      <div class="legend-panel">
        <div class="legend-label">Lights</div>
        <div class="legend" role="listbox" aria-label="Light curves">
          ${this.curves.map((t,e)=>{const i=this.canManage&&!this.managing&&this._confirmingRemove===t.entityId;return V`
              <div
                class="legend-item ${t.visible?"":"hidden"} ${this.selectedCurveId===t.entityId?"selected":""} ${i?"confirming":""}"
                role="option"
                tabindex="0"
                aria-selected=${this.selectedCurveId===t.entityId}
                @click=${()=>this._select(t.entityId)}
                @keydown=${e=>this._onItemKeyDown(e,t.entityId)}
                style="--accent-color: ${t.color}"
              >
                <span
                  class="color-dot shape-${zt._shapes[e%zt._shapes.length]}"
                  style="background: ${t.color}; --dot-color: ${t.color}"
                ></span>
                ${i?this._renderConfirmRow(t):V`
                      <span class="name" title=${t.friendlyName}>${t.friendlyName}</span>
                      ${null!==this.scrubberPosition?V`<span class="brightness-value"
                            >${Math.round(St(t.controlPoints,Math.round(this.scrubberPosition)))}%</span
                          >`:W}
                      ${this.selectedCurveId===t.entityId?V`
                            <span class="editing-chip">Editing</span>
                            <button
                              type="button"
                              class="clear-edit-icon"
                              aria-label="Stop editing ${t.friendlyName}"
                              title="Stop editing ${t.friendlyName}"
                              @click=${e=>this._clearSelection(e,t.entityId)}
                            >
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                              >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          `:W}
                      <button
                        type="button"
                        class="eye-btn"
                        aria-label="${t.visible?"Hide":"Show"} ${t.friendlyName}"
                        aria-pressed=${!t.visible}
                        @click=${e=>this._toggle(e,t.entityId)}
                        @keydown=${e=>this._onToggleKeyDown(e,t.entityId)}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          ${t.visible?V`
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              `:V`
                                <path
                                  d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
                                />
                                <path
                                  d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
                                />
                                <line x1="1" y1="1" x2="23" y2="23" />
                              `}
                        </svg>
                      </button>
                      ${this.canManage&&this.curves.length>1?V`<button
                            type="button"
                            class="remove-icon"
                            aria-label="Remove ${t.friendlyName}"
                            title="Remove ${t.friendlyName}"
                            ?disabled=${this.managing}
                            @click=${e=>this._startRemove(e,t.entityId)}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path
                                d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                              ></path>
                            </svg>
                          </button>`:W}
                    `}
              </div>
            `})}
        </div>
        ${this.canManage||this.managing?V`
              <div class="add-divider"></div>
              <div class="add-row">
                ${this.managing?V`<div class="managing-row" role="status" aria-live="polite">
                      <span class="spinner" aria-hidden="true"></span>
                      Updating lights…
                    </div>`:this._addingLight?this._renderAddForm():V`<button
                        type="button"
                        class="add-light-btn"
                        ?disabled=${this.managing}
                        @click=${this._startAdd}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add light
                      </button>`}
              </div>
            `:W}
      </div>
    `}};Bt.styles=o`
    :host {
      display: block;
      --accent: var(--primary-color, #2563eb);
      --divider: var(--divider-color, rgba(127, 127, 127, 0.2));
    }
    .legend-panel {
      border-radius: 12px;
      padding: 8px;
      background: color-mix(
        in srgb,
        var(--ha-card-background, var(--card-background-color, #fff)) 95%,
        var(--secondary-text-color, #616161) 5%
      );
      border: 1px solid color-mix(in srgb, var(--divider) 80%, transparent);
    }
    .legend-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--secondary-text-color, #616161);
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
      background: color-mix(in srgb, var(--primary-color, #2563eb) 8%, transparent);
    }
    .legend-item:focus {
      outline: none;
    }
    .legend-item:focus-visible {
      background: color-mix(in srgb, var(--primary-color, #2563eb) 10%, transparent);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color, #2563eb) 50%, transparent);
    }
    .legend-item.hidden {
      opacity: 0.4;
    }
    .legend-item.selected {
      background: color-mix(in srgb, var(--primary-color, #2563eb) 12%, transparent);
    }
    .legend-item.selected:hover {
      background: color-mix(in srgb, var(--primary-color, #2563eb) 16%, transparent);
    }
    .legend-item.confirming {
      background: color-mix(in srgb, var(--error-color, #db4437) 10%, transparent);
      cursor: default;
    }
    .legend-item.confirming:hover {
      background: color-mix(in srgb, var(--error-color, #db4437) 12%, transparent);
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
    .eye-btn {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      opacity: 0.35;
      transition: opacity 0.15s ease;
      padding: 4px;
      box-sizing: content-box;
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: inherit;
      border-radius: 4px;
    }
    .eye-btn svg {
      width: 16px;
      height: 16px;
      display: block;
    }
    .legend-item:hover .eye-btn,
    .legend-item.hidden .eye-btn {
      opacity: 0.7;
    }
    .eye-btn:focus {
      outline: none;
    }
    .eye-btn:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
      opacity: 0.9;
    }
    .remove-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      opacity: 0;
      transition:
        opacity 0.15s ease,
        color 0.15s ease;
      padding: 4px;
      box-sizing: content-box;
      color: var(--secondary-text-color, #616161);
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .legend-item:hover .remove-icon,
    .legend-item:focus-within .remove-icon {
      opacity: 0.7;
    }
    .remove-icon:hover {
      opacity: 1 !important;
      color: var(--error-color, #db4437);
    }
    .remove-icon:focus {
      outline: none;
    }
    .remove-icon:focus-visible {
      outline: 2px solid var(--error-color, #db4437);
      outline-offset: 2px;
      border-radius: 4px;
      opacity: 1;
    }
    .remove-icon:disabled {
      cursor: not-allowed;
      opacity: 0.3 !important;
    }
    .remove-icon svg {
      width: 16px;
      height: 16px;
      display: block;
    }
    .name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      flex: 1;
      min-width: 0;
    }
    .brightness-value {
      font-size: 11px;
      font-weight: 600;
      font-variant-numeric: tabular-nums;
      color: var(--secondary-text-color, #616161);
      flex-shrink: 0;
      min-width: 2.8ch;
      text-align: right;
    }
    .editing-chip {
      flex-shrink: 0;
      padding: 2px 6px;
      border-radius: 4px;
      background: color-mix(in srgb, var(--primary-color, #2563eb) 12%, transparent);
      color: var(--primary-color, #2563eb);
      font-size: 10px;
      font-weight: 700;
      line-height: 1.4;
    }
    .clear-edit-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      padding: 4px;
      box-sizing: content-box;
      color: var(--primary-color, #2563eb);
      background: transparent;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      transition:
        opacity 0.15s ease,
        background 0.15s ease;
    }
    .clear-edit-icon:hover {
      opacity: 1;
      background: color-mix(in srgb, var(--primary-color, #2563eb) 10%, transparent);
      border-radius: 4px;
    }
    .clear-edit-icon:focus {
      outline: none;
    }
    .clear-edit-icon:focus-visible {
      outline: 2px solid var(--primary-color, #2563eb);
      outline-offset: 2px;
      border-radius: 4px;
      opacity: 1;
    }
    .clear-edit-icon svg {
      width: 16px;
      height: 16px;
      display: block;
    }
    .confirm-row {
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;
      min-width: 0;
    }
    .confirm-text {
      flex: 1;
      min-width: 0;
      word-break: break-word;
      font-size: 12px;
      color: var(--error-color, #db4437);
      font-weight: 500;
    }
    .confirm-btn {
      padding: 4px 10px;
      font-size: 11px;
      font-weight: 500;
      border-radius: 6px;
      border: 1px solid var(--divider);
      background: transparent;
      color: var(--secondary-text-color, #616161);
      cursor: pointer;
      font-family: inherit;
      flex-shrink: 0;
    }
    .confirm-btn.danger {
      background: var(--error-color, #db4437);
      border-color: var(--error-color, #db4437);
      color: #fff;
    }
    .confirm-btn.danger:hover {
      opacity: 0.9;
    }
    .confirm-btn:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
    .add-divider {
      height: 1px;
      margin: 6px 10px;
      background: var(--divider);
    }
    .add-row {
      padding: 6px 10px 8px;
    }
    .add-light-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      background: transparent;
      border: 1px dashed var(--divider);
      border-radius: 8px;
      color: var(--secondary-text-color, #616161);
      font-family: inherit;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      width: 100%;
      transition:
        border-color 0.15s ease,
        color 0.15s ease,
        background 0.15s ease;
    }
    .add-light-btn:hover:not(:disabled) {
      border-color: var(--primary-color, #2563eb);
      border-style: solid;
      color: var(--primary-color, #2563eb);
      background: color-mix(in srgb, var(--primary-color, #2563eb) 6%, transparent);
    }
    .add-light-btn:focus-visible {
      outline: 2px solid var(--primary-color, #2563eb);
      outline-offset: 2px;
    }
    .add-light-btn:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
    .add-light-btn svg {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }
    .add-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .add-form input[type='text'] {
      padding: 6px 10px;
      border: 1px solid var(--divider);
      border-radius: 8px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      font-family: inherit;
      font-size: 13px;
      width: 100%;
      box-sizing: border-box;
    }
    .add-form input[type='text']:focus {
      outline: none;
      border-color: var(--primary-color, #2563eb);
      box-shadow: 0 0 0 1px var(--primary-color, #2563eb);
    }
    .add-form label {
      font-size: 11px;
      color: var(--secondary-text-color, #616161);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .preset-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .preset-field select {
      padding: 6px 10px;
      border: 1px solid var(--divider);
      border-radius: 8px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      font-family: inherit;
      font-size: 13px;
    }
    .preset-field select:focus {
      outline: none;
      border-color: var(--primary-color, #2563eb);
      box-shadow: 0 0 0 1px var(--primary-color, #2563eb);
    }
    .add-form-actions {
      display: flex;
      gap: 6px;
      justify-content: flex-end;
    }
    .add-form-actions button {
      padding: 4px 12px;
      min-height: 44px;
      font-size: 12px;
      font-weight: 500;
      border-radius: 6px;
      border: 1px solid var(--divider);
      background: transparent;
      color: var(--secondary-text-color, #616161);
      cursor: pointer;
      font-family: inherit;
      transition:
        border-color 0.15s ease,
        color 0.15s ease,
        background 0.15s ease;
    }
    .add-form-actions button:hover:not(:disabled) {
      border-color: var(--primary-color, #2563eb);
      color: var(--primary-color, #2563eb);
    }
    .add-form-actions button.primary {
      background: var(--primary-color, #2563eb);
      border-color: var(--primary-color, #2563eb);
      color: #fff;
    }
    .add-form-actions button.primary:hover:not(:disabled) {
      opacity: 0.9;
      color: #fff;
    }
    .add-form-actions button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .managing-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 8px 10px;
      color: var(--secondary-text-color, #616161);
      font-size: 12px;
    }
    .spinner {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      border: 2px solid color-mix(in srgb, var(--secondary-text-color, #616161) 30%, transparent);
      border-top-color: var(--primary-color, #2563eb);
      animation: spin 0.8s linear infinite;
      flex-shrink: 0;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    @media (max-width: 500px) {
      .legend-item {
        padding: 10px 10px;
        font-size: 14px;
        min-height: 44px;
        box-sizing: border-box;
      }
      .eye-btn {
        width: 20px;
        height: 20px;
        min-width: 44px;
        min-height: 44px;
        padding: 12px;
        margin-left: auto;
        box-sizing: content-box;
      }
      .eye-btn svg {
        width: 20px;
        height: 20px;
      }
      .remove-icon {
        opacity: 0.6;
        width: 20px;
        height: 20px;
        min-width: 44px;
        min-height: 44px;
        padding: 12px;
        box-sizing: content-box;
      }
      .remove-icon svg {
        width: 18px;
        height: 18px;
      }
      .editing-chip {
        display: none;
      }
      .clear-edit-icon {
        width: 20px;
        height: 20px;
        min-width: 44px;
        min-height: 44px;
        padding: 12px;
        box-sizing: content-box;
      }
      .clear-edit-icon svg {
        width: 18px;
        height: 18px;
      }
    }
  `,Bt._shapes=["circle","square","diamond","triangle","bar"],t([ut({type:Array})],Bt.prototype,"curves",void 0),t([ut({type:String})],Bt.prototype,"selectedCurveId",void 0),t([ut({type:Number})],Bt.prototype,"scrubberPosition",void 0),t([ut({type:Boolean})],Bt.prototype,"canManage",void 0),t([ut({type:Boolean})],Bt.prototype,"managing",void 0),t([ut({type:Array})],Bt.prototype,"excludeEntityIds",void 0),t([ut({type:Array})],Bt.prototype,"presetOptions",void 0),t([ut({type:Number})],Bt.prototype,"closeAddSignal",void 0),t([ut({type:Number})],Bt.prototype,"closeRemoveSignal",void 0),t([ut({attribute:!1})],Bt.prototype,"hass",void 0),t([vt()],Bt.prototype,"_addingLight",void 0),t([vt()],Bt.prototype,"_pendingAddEntity",void 0),t([vt()],Bt.prototype,"_pendingPreset",void 0),t([vt()],Bt.prototype,"_confirmingRemove",void 0),Bt=zt=t([ht("curve-legend")],Bt);let Ht=class extends dt{constructor(){super(...arguments),this.dirty=!1,this.readOnly=!1,this.saving=!1,this.canUndo=!1}_onSave(){this.dispatchEvent(new CustomEvent("save-curves",{bubbles:!0,composed:!0}))}_onCancel(){this.dispatchEvent(new CustomEvent("cancel-curves",{bubbles:!0,composed:!0}))}_onUndo(){this.dispatchEvent(new CustomEvent("undo-curves",{bubbles:!0,composed:!0}))}render(){return this.readOnly?V`
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
      `:this.dirty||this.canUndo?V`
      <div class="footer">
        ${this.canUndo?V`
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
            `:V`<span class="unsaved-label">Unsaved changes</span>`}
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
          ${this.saving?"Saving…":"Save"}
        </button>
      </div>
    `:V``}};Ht.styles=o`
    :host {
      display: block;
      --accent: var(--primary-color, #2563eb);
      --divider: var(--divider-color, rgba(127, 127, 127, 0.2));
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
      color: var(--warning-color, #b45309);
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
      background: var(--accent);
      color: #fff;
    }
    .btn-save:hover:not(:disabled) {
      background: color-mix(in srgb, var(--accent) 85%, #000);
    }
    .btn-ghost {
      background: transparent;
      color: var(--secondary-text, #616161);
      border: 1px solid var(--divider);
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
  `,t([ut({type:Boolean})],Ht.prototype,"dirty",void 0),t([ut({type:Boolean})],Ht.prototype,"readOnly",void 0),t([ut({type:Boolean})],Ht.prototype,"saving",void 0),t([ut({type:Boolean})],Ht.prototype,"canUndo",void 0),Ht=t([ht("curve-footer")],Ht);"undefined"!=typeof window&&(window.__LIGHTENER_CURVE_CARD_VERSION__="2.15.0-dev.5");const jt=V`<svg
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
</svg>`;const Ft=["light"];let Vt=class extends dt{constructor(){super(...arguments),this._config={},this._hass=null,this._picker=new _t(()=>this.isConnected,()=>this.requestUpdate())}connectedCallback(){super.connectedCallback(),this._picker.ensureLoaded()}setConfig(t){this._config=t,this._picker.ensureLoaded()}set hass(t){this._hass=t,this._picker.ensureLoaded()}_fireConfigChanged(){this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}_onEntityChange(t){const e=t.detail?.value??"";this._config={...this._config,entity:e||void 0},this._fireConfigChanged()}_onTitleChange(t){const e=t.target.value;this._config={...this._config,title:e||void 0},this._fireConfigChanged()}_onFallbackEntityInput(t){const e=t.target.value.trim();this._config={...this._config,entity:e||void 0},this._fireConfigChanged()}render(){const t=this._config.entity??"",e=this._config.title??"";return V`
      <div class="form">
        <div class="field">
          <label>Entity</label>
          ${this._picker.ready?V`
                <ha-entity-picker
                  .hass=${this._hass}
                  .value=${t}
                  .includeDomains=${Ft}
                  allow-custom-entity
                  @value-changed=${this._onEntityChange}
                ></ha-entity-picker>
                <span class="hint">Select a Lightener group to edit its brightness curves.</span>
              `:V`
                <input
                  type="text"
                  .value=${t}
                  placeholder="light.your_lightener_group"
                  @change=${this._onFallbackEntityInput}
                />
                <span class="hint">
                  Entity picker unavailable — enter a Lightener light entity ID manually (must start
                  with <code>light.</code>).
                </span>
              `}
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
    `}};Vt.styles=o`
    :host {
      display: block;
      --accent: var(--primary-color, #2563eb);
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
      border-color: var(--accent);
      box-shadow: 0 0 0 1px var(--accent);
    }
    .hint {
      font-size: 11px;
      color: var(--secondary-text-color, #616161);
      opacity: 0.7;
    }
  `,t([vt()],Vt.prototype,"_config",void 0),t([vt()],Vt.prototype,"_hass",void 0),Vt=t([ht("lightener-curve-card-editor")],Vt);let qt=class extends dt{constructor(){super(...arguments),this._curves=[],this._originalCurves=[],this._config={},this._selectedCurveId=null,this._saveState=Dt,this._loadError=null,this._loading=!1,this._manageError=null,this._managingLights=!1,this._scrubberPosition=null,this._cancelAnimating=!1,this._hass=null,this._undoStack=[],this._dragUndoPushed=!1,this._loaded=!1,this._loadedEntityId=void 0,this._loadErrorEntityId=void 0,this._boundKeyHandler=null,this._boundBeforeUnload=null,this._saveSuccessTimer=null,this._cancelAnimFrame=null,this._previewActive=!1,this._showPresets=!1,this._legendCloseAddSignal=0,this._legendCloseRemoveSignal=0,this._previewRafPending=!1,this._previewTrailingTimer=null,this._lastPreviewTime=0,this._previewRestoreBrightness=new Map,this._lastPreviewBrightness=new Map,this._lastEmittedDirtyState=!1,this._dirtyVersion=0,this._cleanVersion=0,this._onPreviewToggle=()=>{this._previewActive?this._stopPreview():this._startPreview()},this._startPreview=()=>{if(this._hass&&!this._previewActive){this._previewActive=!0,null===this._scrubberPosition&&(this._scrubberPosition=50),this._previewRestoreBrightness.clear(),this._lastPreviewBrightness.clear();for(const t of this._curves){const e=this._hass.states[t.entityId];e&&this._previewRestoreBrightness.set(t.entityId,"off"===e.state?null:e.attributes.brightness??void 0)}this._previewLights(this._scrubberPosition)}},this._stopPreview=()=>{if(this._previewActive&&this._hass){this._previewActive=!1,this._previewRafPending=!1,this._previewTrailingTimer&&(clearTimeout(this._previewTrailingTimer),this._previewTrailingTimer=null);for(const[t,e]of this._previewRestoreBrightness)null===e?this._hass.callService("light","turn_off",{entity_id:t}).catch(()=>{}):void 0===e?this._hass.callService("light","turn_on",{entity_id:t}).catch(()=>{}):this._hass.callService("light","turn_on",{entity_id:t,brightness:e}).catch(()=>{});this._previewRestoreBrightness.clear(),this._lastPreviewBrightness.clear()}},this._PREVIEW_INTERVAL_MS=300,this._pendingPreviewPosition=null}get _saving(){return"saving"===this._saveState.phase}get _saveSuccess(){return"saved"===this._saveState.phase}get _saveError(){return"error"===(t=this._saveState).phase?t.message:null;var t}_dispatchSave(t){this._saveState=function(t,e){switch(e.type){case"reset":return{phase:"idle"};case"dirty":return"idle"===t.phase?{phase:"dirty"}:t;case"save-start":return"saving"===t.phase?t:{phase:"saving"};case"save-success":return"saving"!==t.phase?t:{phase:"saved"};case"save-error":return"saving"!==t.phase?t:{phase:"error",message:e.message};case"save-clear":return"saved"===t.phase||"error"===t.phase?{phase:"idle"}:t}}(this._saveState,t)}get _embedded(){return!0===this._config.embedded}static getConfigElement(){return document.createElement("lightener-curve-card-editor")}static getStubConfig(){return{type:"custom:lightener-curve-card"}}setConfig(t){const e=t.entity!==this._config.entity;this._config=t,e&&(this._previewActive&&this._stopPreview(),this._loaded=!1,this._loadedEntityId=void 0,this._loadErrorEntityId=void 0,this._showPresets=!1,this._tryLoadCurves())}set hass(t){const e=!!this._hass;this._hass=t,e&&this._loaded||this._tryLoadCurves()}getCardSize(){return 4}getGridOptions(){return{columns:12,rows:9,min_columns:6,min_rows:6}}get _isAdmin(){return this._hass?.user?.is_admin??!1}get _entityId(){return this._config.entity}get _isDirty(){return this._dirtyVersion!==this._cleanVersion}get _canManageLights(){return this._isAdmin&&!!this._hass&&!!this._entityId&&!this._isDirty&&!this._saving&&!this._cancelAnimating&&!this._loading&&!this._managingLights&&!this._loadError}get dirty(){return this._isDirty}connectedCallback(){super.connectedCallback(),this._loadErrorEntityId!==this._entityId&&(this._loaded=!1,this._loadedEntityId=void 0),this._tryLoadCurves(),this._boundKeyHandler=this._onKeyDown.bind(this),this._boundBeforeUnload=this._onBeforeUnload.bind(this),window.addEventListener("keydown",this._boundKeyHandler),window.addEventListener("beforeunload",this._boundBeforeUnload)}disconnectedCallback(){super.disconnectedCallback(),this._previewActive&&this._stopPreview(),this._boundKeyHandler&&window.removeEventListener("keydown",this._boundKeyHandler),this._boundBeforeUnload&&window.removeEventListener("beforeunload",this._boundBeforeUnload),this._saveSuccessTimer&&(clearTimeout(this._saveSuccessTimer),this._saveSuccessTimer=null),this._cancelAnimFrame&&(cancelAnimationFrame(this._cancelAnimFrame),this._cancelAnimFrame=null,this._cancelAnimating=!1)}updated(t){if(super.updated(t),t.has("_curves")||t.has("_originalCurves")||t.has("_cancelAnimating")){const t=this._isDirty;t!==this._lastEmittedDirtyState&&(this._lastEmittedDirtyState=t,this.dispatchEvent(new CustomEvent("curve-dirty-state",{detail:{dirty:t},bubbles:!0,composed:!0})),t&&this._dispatchSave({type:"dirty"}))}}_togglePresets(){if(this._managingLights)return;if(0===this._curves.length)return;const t=!this._showPresets;this._showPresets=t,t&&(this._legendCloseAddSignal++,this._legendCloseRemoveSignal++)}_onLegendPanelOpen(){this._showPresets=!1}_applyPreset(t){if(this._cancelAnimating||this._saving||this._managingLights)return;if(0===this._curves.length)return;this._pushUndo();const e=t.controlPoints.map(t=>({...t}));null!==this._selectedCurveId?this._curves=this._curves.map(t=>t.entityId===this._selectedCurveId?{...t,controlPoints:e}:t):this._curves=this._curves.map(t=>({...t,controlPoints:e})),this._dirtyVersion++,this._showPresets=!1}_renderPresetsPanel(){const t=null!==this._selectedCurveId?`Applying to ${this._curves.find(t=>t.entityId===this._selectedCurveId)?.friendlyName??"selected light"}`:"Applying to all lights";return V`
      <div class="presets-panel">
        <div class="presets-header">${t}</div>
        ${Tt.map(t=>V`
            <button class="preset-option" @click=${()=>this._applyPreset(t)}>
              <svg
                class="preset-preview"
                viewBox="0 0 64 40"
                width="64"
                height="40"
                aria-hidden="true"
              >
                <polyline
                  points="${function(t){return t.controlPoints.map(t=>{const e=4+t.lightener/100*56,i=36-t.target/100*32;return`${e.toFixed(1)},${i.toFixed(1)}`}).join(" ")}(t)}"
                  fill="none"
                  stroke="var(--accent, #2563eb)"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <div class="preset-name">${t.name}</div>
              <div class="preset-desc">${t.description}</div>
            </button>
          `)}
      </div>
    `}_onKeyDown(t){const e=document.activeElement;e&&e!==this&&e!==document.body&&!this.contains(e)||((t.ctrlKey||t.metaKey)&&"s"===t.key&&this._isDirty&&this._isAdmin&&!this._saving&&!this._managingLights&&(t.preventDefault(),this._onSave()),!t.ctrlKey&&!t.metaKey||"z"!==t.key||t.shiftKey||!this._saving&&!this._cancelAnimating&&!this._managingLights&&this._undoStack.length>0&&(t.preventDefault(),this._undo()),"Escape"===t.key&&(this._showPresets?(t.preventDefault(),this._showPresets=!1):!this._isDirty||this._saving||this._cancelAnimating||this._managingLights||(t.preventDefault(),this._onCancel())))}_onBeforeUnload(t){this._isDirty&&(t.preventDefault(),t.returnValue="")}async _tryLoadCurves(){if(this._loaded&&this._loadedEntityId===this._entityId)return;if(this._loading)return;if(!this._hass||!this._entityId){if(0===this._curves.length){const t=[{entityId:"light.ceiling_light",friendlyName:"Ceiling Light",controlPoints:[{lightener:0,target:0},{lightener:20,target:0},{lightener:60,target:80},{lightener:100,target:100}],visible:!0,color:Lt[0]},{entityId:"light.sofa_lamp",friendlyName:"Sofa Lamp",controlPoints:[{lightener:0,target:0},{lightener:10,target:50},{lightener:40,target:100},{lightener:70,target:100},{lightener:100,target:60}],visible:!0,color:Lt[1]},{entityId:"light.led_strip",friendlyName:"LED Strip",controlPoints:[{lightener:0,target:0},{lightener:1,target:1},{lightener:100,target:100}],visible:!0,color:Lt[2]}];this._curves=t,this._originalCurves=ft(t),this._cleanVersion=this._dirtyVersion}return}this._loadError=null,this._loading=!0;const t=this._entityId;try{const n=await this._hass.callWS({type:"lightener/get_curves",entity_id:t});if(this._entityId!==t)return;const s=(e=n.entities,i=this._hass.states,r=Lt,Object.keys(e).map((t,n)=>{const s=e[t]?.brightness??{},o=new Map([[0,0]]);for(const[t,e]of Object.entries(s)){const i=Number(t),r=Number(e);Number.isFinite(i)&&Number.isFinite(r)&&(i<0||i>100||r<0||r>100||o.set(i,r))}const a=[...o].map(([t,e])=>({lightener:t,target:e}));a.sort((t,e)=>t.lightener-e.lightener);const l=i[t]?.attributes?.friendly_name??t.replace("light.","");return{entityId:t,friendlyName:l,controlPoints:a,visible:!0,color:r[n%r.length]}}));this._curves=s,this._originalCurves=ft(s),this._cleanVersion=this._dirtyVersion,this._loaded=!0,this._loadedEntityId=t,this._loadErrorEntityId=void 0}catch(e){if(this._entityId!==t)return;console.error("[Lightener] Failed to load curves:",e),this._loadError=String(e),this._loaded=!0,this._loadedEntityId=t,this._loadErrorEntityId=t}finally{this._loading=!1,this._entityId!==t&&this._tryLoadCurves()}var e,i,r}_onScrubberMove(t){this._scrubberPosition=t.detail.position,this._previewActive&&this._previewLights(t.detail.position)}_onScrubberStart(){}_onScrubberEnd(){}_previewLights(t){if(!this._previewActive||!this._hass)return;this._pendingPreviewPosition=t;const e=Date.now()-this._lastPreviewTime;e<this._PREVIEW_INTERVAL_MS?this._previewTrailingTimer||(this._previewTrailingTimer=setTimeout(()=>{this._previewTrailingTimer=null,null!==this._pendingPreviewPosition&&this._previewLights(this._pendingPreviewPosition)},this._PREVIEW_INTERVAL_MS-e)):this._previewRafPending||(this._previewTrailingTimer&&(clearTimeout(this._previewTrailingTimer),this._previewTrailingTimer=null),this._previewRafPending=!0,requestAnimationFrame(()=>{if(this._previewRafPending=!1,this._previewActive&&this._hass){this._lastPreviewTime=Date.now();for(const e of this._curves){if(!e.visible)continue;const i=Math.round(St(e.controlPoints,t)),r=Math.round(i/100*255);if(0===r){if("off"===this._lastPreviewBrightness.get(e.entityId))continue;this._lastPreviewBrightness.set(e.entityId,"off"),this._hass.callService("light","turn_off",{entity_id:e.entityId}).catch(()=>{})}else{if(this._lastPreviewBrightness.get(e.entityId)===r)continue;this._lastPreviewBrightness.set(e.entityId,r),this._hass.callService("light","turn_on",{entity_id:e.entityId,brightness:r}).catch(()=>{})}}}}))}_onSelectCurve(t){if(this._cancelAnimating)return;const{entityId:e}=t.detail,i=this._curves.find(t=>t.entityId===e);i&&!i.visible||(this._selectedCurveId=this._selectedCurveId===e?null:e)}_onFocusCurve(t){if(this._cancelAnimating)return;const{entityId:e}=t.detail,i=this._curves.find(t=>t.entityId===e);i&&i.visible&&(this._selectedCurveId=e)}_pushUndo(){this._undoStack.push(ft(this._curves)),this._undoStack.length>50&&this._undoStack.shift()}_undo(){0!==this._undoStack.length&&null===this._cancelAnimFrame&&this._animateCurvesTo(this._undoStack.pop())}_animateCurvesTo(t,e){const i=ft(this._curves);this._cancelAnimating=!0;const r=performance.now(),n=s=>{const o=s-r,a=Math.min(o/300,1),l=function(t){return 1-Math.pow(1-t,3)}(a),d=t.map((t,e)=>{const r=i[e];if(!r)return t;const n=r.controlPoints,s=t.controlPoints,o=Math.min(n.length,s.length),d=[];for(let t=0;t<o;t++)d.push({lightener:Math.round(n[t].lightener+(s[t].lightener-n[t].lightener)*l),target:Math.round(n[t].target+(s[t].target-n[t].target)*l)});if(s.length>o&&a>=1)for(let t=o;t<s.length;t++)d.push({...s[t]});if(n.length>o&&a<1)for(let t=o;t<n.length;t++)d.push({...n[t]});return d.sort((t,e)=>t.lightener-e.lightener),{...t,controlPoints:d,visible:r.visible}});this._curves=d,a<1?this._cancelAnimFrame=requestAnimationFrame(n):(this._curves=t.map((t,e)=>({...t,visible:i[e]?.visible??t.visible})),this._cancelAnimating=!1,this._cancelAnimFrame=null,function(t,e){if(t.length!==e.length)return!1;for(let i=0;i<t.length;i++){const r=t[i].controlPoints,n=e[i].controlPoints;if(r.length!==n.length)return!1;for(let t=0;t<r.length;t++){if(r[t].lightener!==n[t].lightener)return!1;if(r[t].target!==n[t].target)return!1}}return!0}(this._curves,this._originalCurves)&&(this._cleanVersion=this._dirtyVersion),e?.())};this._cancelAnimFrame=requestAnimationFrame(n)}_onPointMove(t){if(this._cancelAnimating)return;this._showPresets=!1,this._dragUndoPushed||(this._pushUndo(),this._dragUndoPushed=!0);const{curveIndex:e,pointIndex:i,lightener:r,target:n}=t.detail,s=this._curves[e];s&&this._selectedCurveId!==s.entityId&&(this._selectedCurveId=s.entityId);const o=[...this._curves],a={...o[e]},l=[...a.controlPoints];l[i]={lightener:r,target:n},a.controlPoints=l,o[e]=a,this._curves=o,this._dirtyVersion++}_onPointDrop(t){this._dragUndoPushed=!1}_onPointAdd(t){if(this._cancelAnimating)return;const{lightener:e,target:i,entityId:r}=t.detail,n=r??this._selectedCurveId;if(!n)return;const s=this._curves.findIndex(t=>t.entityId===n);if(s<0)return;if(this._curves[s].controlPoints.some(t=>t.lightener===e))return;this._pushUndo();const o=[...this._curves],a={...o[s]},l=[...a.controlPoints,{lightener:e,target:i}];l.sort((t,e)=>t.lightener-e.lightener),a.controlPoints=l,o[s]=a,this._curves=o,this._dirtyVersion++}_onPointRemove(t){if(this._cancelAnimating)return;this._dragUndoPushed=!1;const{curveIndex:e,pointIndex:i}=t.detail,r=this._curves[e];if(!r)return;if(r.controlPoints.length<=2)return;if(0===i)return;this._pushUndo();const n=[...this._curves],s={...n[e]};s.controlPoints=s.controlPoints.filter((t,e)=>e!==i),n[e]=s,this._curves=n,this._dirtyVersion++}_onToggleCurve(t){if(this._cancelAnimating)return;const{entityId:e}=t.detail,i=this._curves.map(t=>t.entityId===e?{...t,visible:!t.visible}:t);if(this._curves=i,this._selectedCurveId===e){const t=i.find(t=>t.entityId===e);t&&!t.visible&&(this._selectedCurveId=null)}}async _onAddLight(t){if(!this._hass||!this._entityId||this._managingLights)return;const{entityId:e,preset:i}=t.detail;if(e){this._previewActive&&this._stopPreview(),this._manageError=null,this._managingLights=!0;try{const t={type:"lightener/add_light",entity_id:this._entityId,controlled_entity_id:e};i&&(t.preset=i),await this._hass.callWS(t),this._undoStack=[],this._loaded=!1,await this._tryLoadCurves()}catch(t){console.error("[Lightener] Failed to add light:",t),this._manageError=this._formatManageError(t,"Could not add light.")}finally{this._managingLights=!1}}}async _onRemoveLight(t){if(!this._hass||!this._entityId||this._managingLights)return;const{entityId:e}=t.detail;if(e){this._previewActive&&this._stopPreview(),this._manageError=null,this._managingLights=!0;try{await this._hass.callWS({type:"lightener/remove_light",entity_id:this._entityId,controlled_entity_id:e}),this._selectedCurveId===e&&(this._selectedCurveId=null),this._undoStack=[],this._loaded=!1,await this._tryLoadCurves()}catch(t){console.error("[Lightener] Failed to remove light:",t),this._manageError=this._formatManageError(t,"Could not remove light.")}finally{this._managingLights=!1}}}_formatManageError(t,e){const i=t;return i?.message?i.message:e}async saveCurves(){return this._onSave()}async _onSave(){if(!this._hass||!this._entityId||this._saving||this._cancelAnimating||this._managingLights)return!1;this._previewActive&&this._stopPreview();const t=this._entityId;this._dispatchSave({type:"save-start"});try{const e=function(t){const e={};for(const i of t){const t={};let r=-1,n=0;for(const e of i.controlPoints)0===e.lightener&&0===e.target||(t[String(e.lightener)]=String(e.target),e.lightener>r&&(r=e.lightener,n=e.target));!("100"in t)&&r>=0&&(t[100]=String(n)),e[i.entityId]={brightness:t}}return e}(this._curves);return await this._hass.callWS({type:"lightener/save_curves",entity_id:t,curves:e}),this._entityId!==t?(this._previewActive&&this._stopPreview(),this._undoStack=[],this._dispatchSave({type:"reset"}),!1):(this._originalCurves=ft(this._curves),this._cleanVersion=this._dirtyVersion,this._undoStack=[],this._loaded=!1,this._tryLoadCurves(),this._dispatchSave({type:"save-success"}),this._saveSuccessTimer&&clearTimeout(this._saveSuccessTimer),this._saveSuccessTimer=setTimeout(()=>{this._dispatchSave({type:"save-clear"}),this._saveSuccessTimer=null},2e3),!0)}catch(t){return console.error("[Lightener] Failed to save curves:",t),this._dispatchSave({type:"save-error",message:"Save failed. Check connection."}),!1}}_retryLoad(){this._loaded=!1,this._loadError=null,this._loadErrorEntityId=void 0,this._tryLoadCurves()}_onCancel(){this._cancelAnimating||(this._previewActive&&this._stopPreview(),this._showPresets=!1,this._undoStack=[],this._animateCurvesTo(ft(this._originalCurves),()=>{this._selectedCurveId=null,this._dispatchSave({type:"reset"})}))}_renderLoadingSkeleton(){return V`
      <div class="loading-indicator" role="status" aria-live="polite">
        <div class="loading-graph" aria-hidden="true"></div>
        <div class="loading-caption">Loading curves…</div>
      </div>
    `}render(){return V`
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
          ${!this._loading&&this._isAdmin&&this._curves.length>0?V`<button
                class="presets-btn ${this._showPresets?"active":""}"
                @click=${this._togglePresets}
                ?disabled=${this._managingLights}
                aria-expanded=${this._showPresets}
              >
                Presets
              </button>`:W}
        </div>

        ${this._showPresets?this._renderPresetsPanel():W}

        <div class="workspace">
          <div class="main-stack">
            ${this._loading?this._renderLoadingSkeleton():V`<div class="graph-panel">
                  <curve-graph
                    .curves=${this._curves}
                    .selectedCurveId=${this._selectedCurveId}
                    .readOnly=${!this._isAdmin||this._cancelAnimating||this._managingLights}
                    .scrubberPosition=${this._scrubberPosition}
                    @point-move=${this._onPointMove}
                    @point-drop=${this._onPointDrop}
                    @point-add=${this._onPointAdd}
                    @point-remove=${this._onPointRemove}
                    @focus-curve=${this._onFocusCurve}
                  ></curve-graph>
                </div>`}
            ${this._curves.length>0?V`<curve-scrubber
                  .curves=${this._curves}
                  .readOnly=${!this._isAdmin||this._managingLights}
                  .canPreview=${this._isAdmin&&!this._cancelAnimating&&!this._managingLights}
                  .previewActive=${this._previewActive}
                  @scrubber-move=${this._onScrubberMove}
                  @scrubber-start=${this._onScrubberStart}
                  @scrubber-end=${this._onScrubberEnd}
                  @preview-toggle=${this._onPreviewToggle}
                ></curve-scrubber>`:W}
          </div>

          <div class="side-rail">
            <curve-legend
              .curves=${this._curves}
              .selectedCurveId=${this._selectedCurveId}
              .scrubberPosition=${this._scrubberPosition}
              .canManage=${this._canManageLights}
              .managing=${this._managingLights}
              .excludeEntityIds=${this._entityId?[this._entityId]:[]}
              .closeAddSignal=${this._legendCloseAddSignal}
              .closeRemoveSignal=${this._legendCloseRemoveSignal}
              .hass=${this._hass}
              @select-curve=${this._onSelectCurve}
              @toggle-curve=${this._onToggleCurve}
              @add-panel-open=${this._onLegendPanelOpen}
              @remove-panel-open=${this._onLegendPanelOpen}
              @add-light=${this._onAddLight}
              @remove-light=${this._onRemoveLight}
            ></curve-legend>
            ${this._manageError?V`<div class="error" role="alert">${jt} ${this._manageError}</div>`:W}
          </div>

          <div class="footer-slot">
            <curve-footer
              .dirty=${this._isDirty||this._cancelAnimating}
              .readOnly=${!this._isAdmin||this._managingLights}
              .saving=${this._saving||this._cancelAnimating||this._managingLights}
              .canUndo=${this._undoStack.length>0&&!this._cancelAnimating&&!this._managingLights}
              @save-curves=${this._onSave}
              @cancel-curves=${this._onCancel}
              @undo-curves=${()=>this._undo()}
            ></curve-footer>
          </div>
        </div>

        <div class="status-stack">
          ${this._saveSuccess?V`<div class="success" role="status" aria-live="polite">
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
          ${this._loadError?V`<div class="error" role="alert">
                ${jt} Failed to load curves
                <button type="button" class="retry-link" @click=${this._retryLoad}>Retry</button>
              </div>`:W}
          ${this._saveError?V`<div class="error" role="alert">
                ${jt} Save failed
                <button type="button" class="retry-link" @click=${this._onSave}>Retry</button>
              </div>`:W}
        </div>
      </div>
    `}};qt.styles=o`
    :host {
      --card-bg: var(--ha-card-background, var(--card-background-color, #fff));
      --text-color: var(--primary-text-color, #212121);
      --secondary-text: var(--secondary-text-color, #616161);
      --divider: var(--divider-color, rgba(127, 127, 127, 0.2));
      --accent: var(--primary-color, #2563eb);
      --graph-bg: var(--card-background-color, var(--ha-card-background, #fafafa));
      --panel-bg: color-mix(in srgb, var(--card-bg) 95%, var(--secondary-text, #616161) 5%);
      --text-xs: 9px;
      --text-sm: 12px;
      --text-md: 13px;
      --text-lg: 14px;

      display: block;
      font-family: var(
        --mdc-typography-body1-font-family,
        var(--paper-font-body1_-_font-family, 'Roboto', sans-serif)
      );
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

      box-shadow: none;
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
      gap: 12px;
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
      color: var(--accent);
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
        linear-gradient(
          90deg,
          transparent,
          var(--divider-color, rgba(127, 127, 127, 0.15)),
          transparent
        ),
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
        color-mix(in srgb, var(--accent) 8%, transparent) 0%,
        color-mix(in srgb, var(--accent) 30%, transparent) 45%,
        color-mix(in srgb, var(--accent) 8%, transparent) 100%
      );
      clip-path: polygon(0% 78%, 18% 78%, 38% 45%, 62% 18%, 82% 22%, 100% 0, 100% 100%, 0 100%);
    }
    .loading-caption {
      font-size: var(--text-sm);
      color: var(--secondary-text);
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
      .card.embedded {
        --curve-graph-max-height: 360px;
        --curve-graph-min-height: 240px;
      }
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
    .presets-btn {
      margin-left: auto;
      padding: 4px 10px;
      min-height: 44px;
      font-size: 12px;
      font-weight: 500;
      background: transparent;
      border: 1px solid var(--divider);
      border-radius: 6px;
      color: var(--secondary-text);
      cursor: pointer;
      font-family: inherit;
      transition:
        border-color 0.15s ease,
        color 0.15s ease,
        background 0.15s ease;
      flex-shrink: 0;
    }
    .presets-btn:hover {
      border-color: var(--accent);
      color: var(--accent);
      background: color-mix(in srgb, var(--accent) 4%, transparent);
    }
    .presets-btn:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
    .presets-btn.active {
      border-color: var(--accent);
      color: var(--accent);
    }
    .presets-panel {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      padding-bottom: 8px;
      animation: fade-in 0.15s ease;
    }
    .presets-header {
      grid-column: 1 / -1;
      font-size: 11px;
      color: var(--secondary-text);
      opacity: 0.7;
      padding-bottom: 2px;
    }
    .preset-option {
      border: 1px solid var(--divider);
      border-radius: 8px;
      padding: 10px;
      cursor: pointer;
      background: transparent;
      text-align: left;
      font-family: inherit;
      transition:
        border-color 0.15s ease,
        background 0.15s ease;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .preset-option:hover {
      border-color: var(--accent);
      background: color-mix(in srgb, var(--accent) 4%, transparent);
    }
    .preset-option:focus-visible {
      outline: 2px solid var(--accent);
      outline-offset: 2px;
    }
    .preset-name {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-color);
    }
    .preset-desc {
      font-size: 10px;
      color: var(--secondary-text);
      opacity: 0.75;
      line-height: 1.35;
    }
    .preset-preview {
      display: block;
      opacity: 0.65;
      margin-bottom: 2px;
    }
    @media (prefers-reduced-motion: reduce) {
      .loading-graph {
        animation: none;
      }
    }
  `,t([vt()],qt.prototype,"_curves",void 0),t([vt()],qt.prototype,"_originalCurves",void 0),t([vt()],qt.prototype,"_config",void 0),t([vt()],qt.prototype,"_selectedCurveId",void 0),t([vt()],qt.prototype,"_saveState",void 0),t([vt()],qt.prototype,"_loadError",void 0),t([vt()],qt.prototype,"_loading",void 0),t([vt()],qt.prototype,"_manageError",void 0),t([vt()],qt.prototype,"_managingLights",void 0),t([vt()],qt.prototype,"_scrubberPosition",void 0),t([vt()],qt.prototype,"_cancelAnimating",void 0),t([vt()],qt.prototype,"_hass",void 0),t([vt()],qt.prototype,"_previewActive",void 0),t([vt()],qt.prototype,"_showPresets",void 0),t([vt()],qt.prototype,"_legendCloseAddSignal",void 0),t([vt()],qt.prototype,"_legendCloseRemoveSignal",void 0),qt=t([ht("lightener-curve-card")],qt);export{qt as LightenerCurveCard,Vt as LightenerCurveCardEditor};
