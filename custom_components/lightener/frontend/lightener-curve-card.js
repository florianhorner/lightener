function e(e,t,i,r){var n,o=arguments.length,s=o<3?t:null===r?r=Object.getOwnPropertyDescriptor(t,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(e,t,i,r);else for(var a=e.length-1;a>=0;a--)(n=e[a])&&(s=(o<3?n(s):o>3?n(t,i,s):n(t,i))||s);return o>3&&s&&Object.defineProperty(t,i,s),s}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,r=Symbol(),n=new WeakMap;let o=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==r)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=n.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&n.set(t,e))}return e}toString(){return this.cssText}};const s=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,r)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[r+1],e[0]);return new o(i,e,r)},a=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new o("string"==typeof e?e:e+"",void 0,r))(t)})(e):e,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:g}=Object,u=globalThis,v=u.trustedTypes,_=v?v.emptyScript:"",b=u.reactiveElementPolyfillSupport,m=(e,t)=>e,f={toAttribute(e,t){switch(t){case Boolean:e=e?_:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},y=(e,t)=>!l(e,t),x={attribute:!0,type:String,converter:f,reflect:!1,useDefault:!1,hasChanged:y};Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=x){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(e,i,t);void 0!==r&&d(this.prototype,e,r)}}static getPropertyDescriptor(e,t,i){const{get:r,set:n}=c(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:r,set(t){const o=r?.call(this);n?.call(this,t),this.requestUpdate(e,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??x}static _$Ei(){if(this.hasOwnProperty(m("elementProperties")))return;const e=g(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(m("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(m("properties"))){const e=this.properties,t=[...h(e),...p(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(a(e))}else void 0!==e&&t.push(a(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,r)=>{if(i)e.adoptedStyleSheets=r.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of r){const r=document.createElement("style"),n=t.litNonce;void 0!==n&&r.setAttribute("nonce",n),r.textContent=i.cssText,e.appendChild(r)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),r=this.constructor._$Eu(e,i);if(void 0!==r&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:f).toAttribute(t,i.type);this._$Em=e,null==n?this.removeAttribute(r):this.setAttribute(r,n),this._$Em=null}}_$AK(e,t){const i=this.constructor,r=i._$Eh.get(e);if(void 0!==r&&this._$Em!==r){const e=i.getPropertyOptions(r),n="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:f;this._$Em=r;const o=n.fromAttribute(t,e.type);this[r]=o??this._$Ej?.get(r)??o,this._$Em=null}}requestUpdate(e,t,i,r=!1,n){if(void 0!==e){const o=this.constructor;if(!1===r&&(n=this[e]),i??=o.getPropertyOptions(e),!((i.hasChanged??y)(n,t)||i.useDefault&&i.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(o._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:r,wrapped:n},o){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??t??this[e]),!0!==n||void 0!==o)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===r&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,r=this[t];!0!==e||this._$AL.has(t)||void 0===r||this.C(t,void 0,i,r)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[m("elementProperties")]=new Map,$[m("finalized")]=new Map,b?.({ReactiveElement:$}),(u.reactiveElementVersions??=[]).push("2.1.2");const w=globalThis,k=e=>e,P=w.trustedTypes,C=P?P.createPolicy("lit-html",{createHTML:e=>e}):void 0,A="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,I="?"+E,S=`<${I}>`,M=document,D=()=>M.createComment(""),L=e=>null===e||"object"!=typeof e&&"function"!=typeof e,T=Array.isArray,R="[ \t\n\f\r]",U=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,z=/-->/g,O=/>/g,N=RegExp(`>|${R}(?:([^\\s"'>=/]+)(${R}*=${R}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),B=/'/g,H=/"/g,j=/^(?:script|style|textarea|title)$/i,F=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),V=F(1),q=F(2),G=Symbol.for("lit-noChange"),K=Symbol.for("lit-nothing"),W=new WeakMap,X=M.createTreeWalker(M,129);function Y(e,t){if(!T(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==C?C.createHTML(t):t}const Z=(e,t)=>{const i=e.length-1,r=[];let n,o=2===t?"<svg>":3===t?"<math>":"",s=U;for(let t=0;t<i;t++){const i=e[t];let a,l,d=-1,c=0;for(;c<i.length&&(s.lastIndex=c,l=s.exec(i),null!==l);)c=s.lastIndex,s===U?"!--"===l[1]?s=z:void 0!==l[1]?s=O:void 0!==l[2]?(j.test(l[2])&&(n=RegExp("</"+l[2],"g")),s=N):void 0!==l[3]&&(s=N):s===N?">"===l[0]?(s=n??U,d=-1):void 0===l[1]?d=-2:(d=s.lastIndex-l[2].length,a=l[1],s=void 0===l[3]?N:'"'===l[3]?H:B):s===H||s===B?s=N:s===z||s===O?s=U:(s=N,n=void 0);const h=s===N&&e[t+1].startsWith("/>")?" ":"";o+=s===U?i+S:d>=0?(r.push(a),i.slice(0,d)+A+i.slice(d)+E+h):i+E+(-2===d?t:h)}return[Y(e,o+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),r]};class J{constructor({strings:e,_$litType$:t},i){let r;this.parts=[];let n=0,o=0;const s=e.length-1,a=this.parts,[l,d]=Z(e,t);if(this.el=J.createElement(l,i),X.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(r=X.nextNode())&&a.length<s;){if(1===r.nodeType){if(r.hasAttributes())for(const e of r.getAttributeNames())if(e.endsWith(A)){const t=d[o++],i=r.getAttribute(e).split(E),s=/([.?@])?(.*)/.exec(t);a.push({type:1,index:n,name:s[2],strings:i,ctor:"."===s[1]?re:"?"===s[1]?ne:"@"===s[1]?oe:ie}),r.removeAttribute(e)}else e.startsWith(E)&&(a.push({type:6,index:n}),r.removeAttribute(e));if(j.test(r.tagName)){const e=r.textContent.split(E),t=e.length-1;if(t>0){r.textContent=P?P.emptyScript:"";for(let i=0;i<t;i++)r.append(e[i],D()),X.nextNode(),a.push({type:2,index:++n});r.append(e[t],D())}}}else if(8===r.nodeType)if(r.data===I)a.push({type:2,index:n});else{let e=-1;for(;-1!==(e=r.data.indexOf(E,e+1));)a.push({type:7,index:n}),e+=E.length-1}n++}}static createElement(e,t){const i=M.createElement("template");return i.innerHTML=e,i}}function Q(e,t,i=e,r){if(t===G)return t;let n=void 0!==r?i._$Co?.[r]:i._$Cl;const o=L(t)?void 0:t._$litDirective$;return n?.constructor!==o&&(n?._$AO?.(!1),void 0===o?n=void 0:(n=new o(e),n._$AT(e,i,r)),void 0!==r?(i._$Co??=[])[r]=n:i._$Cl=n),void 0!==n&&(t=Q(e,n._$AS(e,t.values),n,r)),t}class ee{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,r=(e?.creationScope??M).importNode(t,!0);X.currentNode=r;let n=X.nextNode(),o=0,s=0,a=i[0];for(;void 0!==a;){if(o===a.index){let t;2===a.type?t=new te(n,n.nextSibling,this,e):1===a.type?t=new a.ctor(n,a.name,a.strings,this,e):6===a.type&&(t=new se(n,this,e)),this._$AV.push(t),a=i[++s]}o!==a?.index&&(n=X.nextNode(),o++)}return X.currentNode=M,r}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class te{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,r){this.type=2,this._$AH=K,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=Q(this,e,t),L(e)?e===K||null==e||""===e?(this._$AH!==K&&this._$AR(),this._$AH=K):e!==this._$AH&&e!==G&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>T(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==K&&L(this._$AH)?this._$AA.nextSibling.data=e:this.T(M.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,r="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=J.createElement(Y(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(t);else{const e=new ee(r,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=W.get(e.strings);return void 0===t&&W.set(e.strings,t=new J(e)),t}k(e){T(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,r=0;for(const n of e)r===t.length?t.push(i=new te(this.O(D()),this.O(D()),this,this.options)):i=t[r],i._$AI(n),r++;r<t.length&&(this._$AR(i&&i._$AB.nextSibling,r),t.length=r)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=k(e).nextSibling;k(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ie{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,r,n){this.type=1,this._$AH=K,this._$AN=void 0,this.element=e,this.name=t,this._$AM=r,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=K}_$AI(e,t=this,i,r){const n=this.strings;let o=!1;if(void 0===n)e=Q(this,e,t,0),o=!L(e)||e!==this._$AH&&e!==G,o&&(this._$AH=e);else{const r=e;let s,a;for(e=n[0],s=0;s<n.length-1;s++)a=Q(this,r[i+s],t,s),a===G&&(a=this._$AH[s]),o||=!L(a)||a!==this._$AH[s],a===K?e=K:e!==K&&(e+=(a??"")+n[s+1]),this._$AH[s]=a}o&&!r&&this.j(e)}j(e){e===K?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class re extends ie{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===K?void 0:e}}class ne extends ie{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==K)}}class oe extends ie{constructor(e,t,i,r,n){super(e,t,i,r,n),this.type=5}_$AI(e,t=this){if((e=Q(this,e,t,0)??K)===G)return;const i=this._$AH,r=e===K&&i!==K||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==K&&(i===K||r);r&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class se{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){Q(this,e)}}const ae=w.litHtmlPolyfillSupport;ae?.(J,te),(w.litHtmlVersions??=[]).push("3.3.2");const le=globalThis;class de extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const r=i?.renderBefore??t;let n=r._$litPart$;if(void 0===n){const e=i?.renderBefore??null;r._$litPart$=n=new te(t.insertBefore(D(),e),e,void 0,i??{})}return n._$AI(e),n})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return G}}de._$litElement$=!0,de.finalized=!0,le.litElementHydrateSupport?.({LitElement:de});const ce=le.litElementPolyfillSupport;ce?.({LitElement:de}),(le.litElementVersions??=[]).push("4.2.2");const he=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},pe={attribute:!0,type:String,converter:f,reflect:!1,hasChanged:y},ge=(e=pe,t,i)=>{const{kind:r,metadata:n}=i;let o=globalThis.litPropertyMetadata.get(n);if(void 0===o&&globalThis.litPropertyMetadata.set(n,o=new Map),"setter"===r&&((e=Object.create(e)).wrapped=!0),o.set(i.name,e),"accessor"===r){const{name:r}=i;return{set(i){const n=t.get.call(this);t.set.call(this,i),this.requestUpdate(r,n,e,!0,i)},init(t){return void 0!==t&&this.C(r,void 0,e,t),t}}}if("setter"===r){const{name:r}=i;return function(i){const n=this[r];t.call(this,i),this.requestUpdate(r,n,e,!0,i)}}throw Error("Unsupported decorator location: "+r)};function ue(e){return(t,i)=>"object"==typeof i?ge(e,t,i):((e,t,i)=>{const r=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),r?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function ve(e){return ue({...e,state:!0,attribute:!1})}class _e{constructor(e,t){this.isConnected=e,this.requestUpdate=t,this.ready=!1,this.started=!1}ensureLoaded(){if(this.started)return;if(this.started=!0,customElements.get("ha-entity-picker"))return void(this.ready=!0);(async()=>{try{const e=window.loadCardHelpers;"function"==typeof e&&await e()}catch{}try{const e=customElements.get("hui-entities-card");await(e?.getConfigElement?.())}catch{}})();const e=customElements.whenDefined("ha-entity-picker"),t=new Promise(e=>setTimeout(e,1500));Promise.race([e,t]).then(()=>{this.isConnected()&&(this.ready=!!customElements.get("ha-entity-picker"),this.ready||(console.warn("[lightener] <ha-entity-picker> not available — falling back to plain input."),customElements.whenDefined("ha-entity-picker").then(()=>{this.isConnected()&&(this.ready=!0,this.requestUpdate())}).catch(()=>{})),this.requestUpdate())}).catch(()=>{})}}function be(e){return{...e,controlPoints:e.controlPoints.map(e=>({...e}))}}function me(e){return e.map(be)}function fe(e,t,i){const[r,n]=e,[o,s]=t;return r===n?o:o+(i-r)*(s-o)/(n-r)}function ye(e){const t=new Map;let i=null;t.set(0,0);for(const r of e)0!==r.lightener||0===r.target?t.set(r.lightener,r.target):i=r.target;if(null===i||t.has(1)||t.set(1,i),!t.has(100)){let e=-1,i=100;for(const[r,n]of t)0!==r&&r>e&&(e=r,i=n);t.set(100,i)}const r=[];for(const[e,i]of t)r.push({lightener:e,target:i});return r.sort((e,t)=>e.lightener-t.lightener),r}function xe(e,t){return function(e,t){if(0===e.length)return 0;const i=Math.max(0,Math.min(100,t));if(i<=e[0].lightener)return e[0].target;for(let t=1;t<e.length;t++){const r=e[t-1],n=e[t];if(i===n.lightener)return n.target;if(i<n.lightener)return fe([r.lightener,n.lightener],[r.target,n.target],i)}return e[e.length-1].target}(ye(e),t)}const $e=44,we=12,ke=300,Pe=200;function Ce(e){return $e+e/100*ke}function Ae(e){return we+(1-e/100)*Pe}function Ee(e,t,i){return Math.max(t,Math.min(i,e))}function Ie(e){const t=e.length;if(0===t)return{dx:[],tangents:[]};if(1===t)return{dx:[],tangents:[0]};const i=[],r=[],n=[];for(let o=0;o<t-1;o++)i.push(e[o+1].x-e[o].x),r.push(e[o+1].y-e[o].y),n.push(0===i[o]?0:r[o]/i[o]);const o=new Array(t).fill(0);if(2===t)return o[0]=n[0],o[1]=n[0],{dx:i,tangents:o};o[0]=n[0],o[t-1]=n[t-2];for(let e=1;e<t-1;e++)0===n[e-1]||0===n[e]||n[e-1]*n[e]<=0?o[e]=0:o[e]=(n[e-1]+n[e])/2;for(let e=0;e<t-1;e++){if(0===n[e]){o[e]=0,o[e+1]=0;continue}const t=o[e]/n[e],i=o[e+1]/n[e],r=t*t+i*i;if(r>9){const s=3/Math.sqrt(r);o[e]=s*t*n[e],o[e+1]=s*i*n[e]}}return{dx:i,tangents:o}}function Se(e,t){return Math.max(0,Math.min(100,xe(e,t)))}function Me(e,t){const i=ye(e).map(e=>({x:e.lightener,y:e.target}));return Math.max(0,Math.min(100,function(e,t){if(e.length<2)return 0;if(2===e.length){const[i,r]=e,n=r.x-i.x;if(0===n)return i.y;const o=(t-i.x)/n;return i.y+o*(r.y-i.y)}const{dx:i,tangents:r}=Ie(e);let n=0;for(let i=0;i<e.length-1;i++){if(t<=e[i+1].x){n=i;break}n=i}const o=i[n]||1,s=Ee((t-e[n].x)/o,0,1),a=o/3,l=1-s;return l*l*l*e[n].y+3*l*l*s*(e[n].y+r[n]*a)+3*l*s*s*(e[n+1].y-r[n+1]*a)+s*s*s*e[n+1].y}(i,t)))}const De=["#42a5f5","#ef5350","#5c6bc0","#ffa726","#ab47bc","#1565c0","#ec407a","#8d6e63","#ffca28","#7e57c2"];const Le=["","8 4","4 4","12 4 4 4","2 4"];const Te=[{id:"linear",name:"Linear",description:"Equal brightness — what you set is what you get.",controlPoints:[{lightener:0,target:0},{lightener:1,target:1},{lightener:100,target:100}]},{id:"dim_accent",name:"Dim accent",description:"Caps at ~45% — great for mood or accent lighting.",controlPoints:[{lightener:0,target:0},{lightener:1,target:1},{lightener:25,target:8},{lightener:50,target:20},{lightener:100,target:45}]},{id:"late_starter",name:"Late starter",description:"Stays very dim until ~45%, then brightens quickly.",controlPoints:[{lightener:0,target:0},{lightener:1,target:1},{lightener:45,target:1},{lightener:70,target:45},{lightener:100,target:100}]},{id:"night_mode",name:"Night mode",description:"Caps at ~25% — barely bright even at full brightness.",controlPoints:[{lightener:0,target:0},{lightener:1,target:1},{lightener:20,target:3},{lightener:50,target:10},{lightener:100,target:25}]}];function Re(e){return e.controlPoints.map(e=>{const t=4+e.lightener/100*56,i=36-e.target/100*32;return`${t.toFixed(1)},${i.toFixed(1)}`}).join(" ")}const Ue={phase:"idle"};let ze=class extends de{constructor(){super(...arguments),this.curves=[],this.selectedCurveId=null,this.entityId=null,this.readOnly=!1,this.scrubberPosition=null,this._dragCurveIdx=-1,this._dragPointIdx=-1,this._hoveredPoint=null,this._focusedPoint=null,this._isMobile=!1,this._graphHintDismissed=!1,this._uid=Math.random().toString(36).slice(2,7),this._mql=null,this._wasDragging=!1,this._longPressTimer=null,this._longPressFired=!1,this._onMqlChange=e=>{this._isMobile=e.matches}}willUpdate(e){super.willUpdate(e),e.has("entityId")&&(this._graphHintDismissed=!1)}_getSvgCoords(e){const t=this._svgRef;if(!t)return null;const i=t.getScreenCTM();if(!i)return null;let r;try{r=i.inverse()}catch{return null}if(!r||isNaN(r.a))return null;const n=t.createSVGPoint();n.x=e.clientX,n.y=e.clientY;const o=n.matrixTransform(r);return{x:(a=o.x,(a-$e)/ke*100),y:(s=o.y,100*(1-(s-we)/Pe))};var s,a}_isCurveInteractive(e){return!this.readOnly&&(null===this.selectedCurveId||this.curves[e]?.entityId===this.selectedCurveId)}_focusCurve(e){this.dispatchEvent(new CustomEvent("focus-curve",{detail:{entityId:e},bubbles:!0,composed:!0}))}_onPointFocus(e,t){const i=this.curves[e];i&&(this._focusedPoint={curve:e,point:t},this._hoveredPoint={curve:e,point:t},this._focusCurve(i.entityId))}_onPointBlur(e,t){this._focusedPoint?.curve===e&&this._focusedPoint?.point===t&&(this._focusedPoint=null),this._hoveredPoint?.curve===e&&this._hoveredPoint?.point===t&&(this._hoveredPoint=null)}_dispatchKeyboardMove(e,t,i,r){this.dispatchEvent(new CustomEvent("point-move",{detail:{curveIndex:e,pointIndex:t,lightener:i,target:r},bubbles:!0,composed:!0})),this.dispatchEvent(new CustomEvent("point-drop",{detail:{curveIndex:e,pointIndex:t},bubbles:!0,composed:!0}))}_getKeyboardInsertPoint(e,t){const i=e.controlPoints[t],r=e.controlPoints[t+1],n=e.controlPoints[t-1];return r&&r.lightener-i.lightener>1?{lightener:Math.round((i.lightener+r.lightener)/2),target:Math.round((i.target+r.target)/2)}:n&&i.lightener-n.lightener>1?{lightener:Math.round((n.lightener+i.lightener)/2),target:Math.round((n.target+i.target)/2)}:null}_onPointKeyDown(e,t,i){const r=this.curves[t],n=r?.controlPoints[i];if(!r||!n)return;if(this.selectedCurveId!==r.entityId&&this._focusCurve(r.entityId),0===i&&("ArrowRight"===e.key||"ArrowLeft"===e.key))return;const o=e.shiftKey?10:1,s=i>0?r.controlPoints[i-1].lightener+1:n.lightener,a=i<r.controlPoints.length-1?r.controlPoints[i+1].lightener-1:100;if("ArrowRight"===e.key)return e.preventDefault(),void this._dispatchKeyboardMove(t,i,Math.min(a,n.lightener+o),n.target);if("ArrowLeft"===e.key)return e.preventDefault(),void this._dispatchKeyboardMove(t,i,Math.max(s,n.lightener-o),n.target);if("ArrowUp"===e.key)return e.preventDefault(),void this._dispatchKeyboardMove(t,i,n.lightener,Math.min(100,n.target+o));if("ArrowDown"===e.key)return e.preventDefault(),void this._dispatchKeyboardMove(t,i,n.lightener,Math.max(0,n.target-o));if("Enter"===e.key){const n=this._getKeyboardInsertPoint(r,i);if(!n)return;return e.preventDefault(),this.dispatchEvent(new CustomEvent("point-add",{detail:{entityId:r.entityId,lightener:n.lightener,target:n.target},bubbles:!0,composed:!0})),void this.updateComplete.then(()=>this._refocusHitCircle(t,i)).catch(()=>{})}(" "===e.key||"Delete"===e.key||"Backspace"===e.key)&&i>0&&r.controlPoints.length>2&&(e.preventDefault(),this.dispatchEvent(new CustomEvent("point-remove",{detail:{curveIndex:t,pointIndex:i},bubbles:!0,composed:!0})),this.updateComplete.then(()=>this._refocusHitCircle(t,Math.max(1,i-1))).catch(()=>{}))}_refocusHitCircle(e,t){const i=this.renderRoot.querySelector(`.hit-circle[data-curve="${e}"][data-point="${t}"]`);i&&i.focus()}_onPointerDown(e,t,i){0===e.button&&this._isCurveInteractive(t)&&(e.preventDefault(),this._graphHintDismissed=!0,this._longPressFired=!1,this._clearLongPress(),i>0&&(this._longPressTimer=setTimeout(()=>{this._longPressFired=!0,this._dragCurveIdx=-1,this._dragPointIdx=-1,this.dispatchEvent(new CustomEvent("point-remove",{detail:{curveIndex:t,pointIndex:i},bubbles:!0,composed:!0}))},500)),this._svgRef?.setPointerCapture(e.pointerId),this._dragCurveIdx=t,this._dragPointIdx=i)}_clearLongPress(){this._longPressTimer&&(clearTimeout(this._longPressTimer),this._longPressTimer=null)}_onPointerMove(e){if(this._dragCurveIdx<0)return;e.preventDefault(),this._clearLongPress();const t=this._getSvgCoords(e);if(!t)return;const i=this.curves[this._dragCurveIdx],r=i?.controlPoints??[],n=this._dragPointIdx>0?r[this._dragPointIdx-1].lightener+1:1,o=this._dragPointIdx<r.length-1?r[this._dragPointIdx+1].lightener-1:100,s=0===this._dragPointIdx?this.curves[this._dragCurveIdx]?.controlPoints[0]?.lightener??0:Math.round(Ee(t.x,n,o)),a=Math.round(Ee(t.y,0,100));this.dispatchEvent(new CustomEvent("point-move",{detail:{curveIndex:this._dragCurveIdx,pointIndex:this._dragPointIdx,lightener:s,target:a},bubbles:!0,composed:!0}))}_onPointerUp(e){this._clearLongPress(),this._longPressFired||this._dragCurveIdx<0||(e.preventDefault(),this.dispatchEvent(new CustomEvent("point-drop",{detail:{curveIndex:this._dragCurveIdx,pointIndex:this._dragPointIdx},bubbles:!0,composed:!0})),this._dragCurveIdx=-1,this._dragPointIdx=-1,this._wasDragging=!0,setTimeout(()=>{this._wasDragging=!1},400))}_onPointContextMenu(e,t,i){e.preventDefault(),e.stopPropagation(),this.readOnly||this._isCurveInteractive(t)&&0!==i&&this.dispatchEvent(new CustomEvent("point-remove",{detail:{curveIndex:t,pointIndex:i},bubbles:!0,composed:!0}))}_onDblClick(e){if(this.readOnly)return;if(this._wasDragging)return;const t=this._getSvgCoords(e);if(!t)return;const i=Math.round(Ee(t.x,1,100)),r=Math.round(Ee(t.y,0,100));this._graphHintDismissed=!0,this.dispatchEvent(new CustomEvent("point-add",{detail:{lightener:i,target:r,entityId:this.selectedCurveId},bubbles:!0,composed:!0}))}_renderGrid(){return q`
      <defs>
        <clipPath id="graph-area-${this._uid}">
          <rect x="${14}" y="${-18}" width="${360}" height="${260}" />
        </clipPath>
      </defs>
      <!-- Diagonal reference line (1:1) -->
      <line class="diagonal-ref"
        x1="${Ce(0)}" y1="${Ae(0)}"
        x2="${Ce(100)}" y2="${Ae(100)}" />

      ${[0,25,50,75,100].map(e=>q`
        <!-- Vertical grid -->
        <line class="grid-line"
          x1="${Ce(e)}" y1="${Ae(0)}"
          x2="${Ce(e)}" y2="${Ae(100)}" />
        <!-- Horizontal grid -->
        <line class="grid-line"
          x1="${Ce(0)}" y1="${Ae(e)}"
          x2="${Ce(100)}" y2="${Ae(e)}" />
        <!-- X tick labels -->
        <text class="tick-label" text-anchor="middle"
          x="${Ce(e)}" y="${228}">${e}%</text>
        <!-- Y tick labels -->
        <text class="tick-label" text-anchor="end" dominant-baseline="middle"
          x="${38}" y="${Ae(e)}">${e}%</text>
      `)}

      <!-- Axis border lines -->
      <line class="axis-line"
        x1="${$e}" y1="${Ae(0)}"
        x2="${344}" y2="${Ae(0)}" />
      <line class="axis-line"
        x1="${$e}" y1="${Ae(0)}"
        x2="${$e}" y2="${Ae(100)}" />

      <!-- Axis labels -->
      <text class="axis-label" text-anchor="middle"
        x="${194}" y="${244}">Group brightness</text>
      <text class="axis-label" text-anchor="middle"
        transform="rotate(-90, 10, ${112})"
        x="10" y="${112}">Light brightness</text>
    `}_renderCrossHair(e){if(this._dragCurveIdx<0)return K;const t=e.controlPoints[this._dragPointIdx];if(!t)return K;const i=Ce(t.lightener),r=Ae(t.target);return q`
      <line class="crosshair"
        x1="${i}" y1="${r}"
        x2="${i}" y2="${Ae(0)}"
        stroke="${e.color}" opacity="0.5" />
      <line class="crosshair"
        x1="${i}" y1="${r}"
        x2="${$e}" y2="${r}"
        stroke="${e.color}" opacity="0.5" />
    `}_renderTooltip(e,t){const i=Ce(t.lightener),r=Ae(t.target),n=`${t.lightener}:${t.target}`,o=5*n.length,s=Ee(i-o/2-2,$e,344-o-8),a=Math.max(16,r-16);return q`
      <rect class="tooltip-bg"
        x="${s}" y="${a-8}"
        width="${o+8}" height="14" />
      <text class="tooltip-text" text-anchor="start"
        x="${s+4}" y="${a+2}">${n}</text>
    `}_renderScrubberIndicator(){if(null===this.scrubberPosition)return K;const e=this.scrubberPosition,t=Ce(e),i=q`
      <rect
        x="${t}" y="${Ae(100)}"
        width="${Ce(100)-t}" height="${Pe}"
        fill="var(--ha-card-background, var(--card-background-color, #fff))"
        fill-opacity="0.93"
        pointer-events="none"
      />
    `,r=q`
      <line class="scrubber-line"
        x1="${t}" y1="${Ae(0)}"
        x2="${t}" y2="${Ae(100)}" />
    `,n=this.curves.filter(e=>e.visible).map(i=>{const r=Ae(Me(i.controlPoints,e));return q`
          <circle
            class="scrubber-dot"
            cx="${t}" cy="${r}"
            r="4"
            fill="${i.color}"
            filter="url(#scrubber-glow-${i.color.replace("#","")}-${this._uid})"
            pointer-events="none"
          />
        `});return q`${i}${r}${n}`}_orderedCurves(){const e=this.selectedCurveId?this.curves.findIndex(e=>e.entityId===this.selectedCurveId):-1;return e>=0?[...this.curves.slice(0,e).map((e,t)=>({curve:e,idx:t})),...this.curves.slice(e+1).map((t,i)=>({curve:t,idx:e+1+i})),{curve:this.curves[e],idx:e}]:this.curves.map((e,t)=>({curve:e,idx:t}))}_renderCurvePaths(e,t){if(!e.visible||!e.controlPoints.length)return K;try{const i=null===this.selectedCurveId||e.entityId===this.selectedCurveId,r=this._dragCurveIdx===t,n=i?1:.2,o=ye(e.controlPoints),s=function(e){if(e.length<2)return"";if(2===e.length)return`M${e[0].x},${e[0].y} L${e[1].x},${e[1].y}`;const{dx:t,tangents:i}=Ie(e);let r=`M${e[0].x},${e[0].y}`;for(let n=0;n<e.length-1;n++){const o=t[n]/3;r+=` C${e[n].x+o},${e[n].y+i[n]*o} ${e[n+1].x-o},${e[n+1].y-i[n+1]*o} ${e[n+1].x},${e[n+1].y}`}return r}(o.map(e=>({x:Ce(e.lightener),y:Ae(e.target)}))),a=s+` L${Ce(o[o.length-1].lightener)},${Ae(0)}`+` L${Ce(0)},${Ae(0)} Z`,l=`grad-${t}-${this._uid}`,d=Le[t%Le.length];return q`
        <defs>
          <linearGradient id="${l}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${e.color}" stop-opacity="${i?.45:.06}" />
            <stop offset="100%" stop-color="${e.color}" stop-opacity="${i?.08:0}" />
          </linearGradient>
        </defs>
        ${r?this._renderCrossHair(e):K}
        <path
          d="${a}"
          fill="url(#${l})"
          style="opacity: ${n}"
          pointer-events="none"
        />
        <path
          class="curve-line"
          d="${s}"
          stroke="${e.color}"
          stroke-dasharray="${d}"
          style="opacity: ${n}"
          pointer-events="none"
        />
      `}catch{return K}}_renderCurvePoints(e,t){if(!e.visible||!e.controlPoints.length)return K;try{const i=this._isCurveInteractive(t);if(!(i&&!this.readOnly))return K;const r=this._dragCurveIdx===t,n=e.color+"33";let o=null;if(r&&this._dragPointIdx>=0)o=e.controlPoints[this._dragPointIdx];else if(this._hoveredPoint?.curve===t||this._focusedPoint?.curve===t){const i=this._focusedPoint?.curve===t?this._focusedPoint.point:this._hoveredPoint?.point??-1;o=e.controlPoints[i]??null}return q`
        ${e.controlPoints.map((i,o)=>{const s=0===o,a=r&&this._dragPointIdx===o,l=this._hoveredPoint?.curve===t&&this._hoveredPoint?.point===o;return q`
            <circle
              class="hit-circle ${s?"origin-hit":""}"
              data-curve="${t}"
              data-point="${o}"
              cx="${Ce(i.lightener)}"
              cy="${Ae(i.target)}"
              r="${this._isMobile?28:22}"
              fill="transparent"
              pointer-events="all"
              tabindex="0"
              role="button"
              aria-label="${e.friendlyName} point ${i.lightener}% group brightness to ${i.target}% light brightness. ${0===o?"Arrow Up/Down to adjust starting brightness. Cannot be moved horizontally.":"Arrow keys move, Enter adds a nearby point, Space removes."}"
              style="touch-action: none; -webkit-touch-callout: none"
              @pointerdown=${e=>this._onPointerDown(e,t,o)}
              @contextmenu=${e=>this._onPointContextMenu(e,t,o)}
              @pointerenter=${()=>this._hoveredPoint={curve:t,point:o}}
              @pointerleave=${()=>this._hoveredPoint=null}
              @focus=${()=>this._onPointFocus(t,o)}
              @blur=${()=>this._onPointBlur(t,o)}
              @keydown=${e=>this._onPointKeyDown(e,t,o)}
            />
            <circle
              class="control-point ${s?"origin":""} ${a?"dragging":""} ${l?"hovered":""} ${this._focusedPoint?.curve===t&&this._focusedPoint?.point===o?"focused":""}"
              cx="${Ce(i.lightener)}"
              cy="${Ae(i.target)}"
              r="6"
              fill="${n}"
              stroke="${e.color}"
              stroke-width="2"
              style="--glow-color: ${e.color}"
              pointer-events="none"
            />
          `})}
        ${null!==o?this._renderTooltip(e,o):K}
      `}catch{return K}}connectedCallback(){super.connectedCallback(),this._mql=window.matchMedia("(max-width: 500px)"),this._isMobile=this._mql.matches,this._mql.addEventListener("change",this._onMqlChange)}disconnectedCallback(){super.disconnectedCallback(),this._clearLongPress(),this._mql?.removeEventListener("change",this._onMqlChange),this._mql=null}_getSvgDescription(){const e=this.curves.filter(e=>e.visible);if(!e.length)return"No curves displayed";const t=e.map(e=>{const t=e.controlPoints[e.controlPoints.length-1];return`${e.friendlyName} (${e.controlPoints.length} points, max ${t?.target??0}%)`});return`${e.length} curve${1===e.length?"":"s"}: ${t.join(", ")}`}render(){return V`
      <svg
        viewBox="0 0 ${356} ${248}"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Brightness curve editor graph"
        @pointermove=${this._onPointerMove}
        @pointerup=${this._onPointerUp}
        @lostpointercapture=${this._onPointerUp}
        @dblclick=${this._onDblClick}
        @contextmenu=${e=>{this.readOnly||e.preventDefault()}}
      >
        <desc>${this._getSvgDescription()}</desc>
        ${this._renderGrid()}

        <!-- Invisible hit area for double-click -->
        ${this.readOnly?K:V`<rect
              class="hit-area"
              x="${$e}"
              y="${we}"
              width="${ke}"
              height="${Pe}"
              pointer-events="all"
              fill="transparent"
            />`}
        <!-- Phase 1: curve fills and lines (rendered before scrubber overlay) -->
        ${(()=>{const e=this._orderedCurves();return q`<g clip-path="url(#graph-area-${this._uid})">${e.map(({curve:e,idx:t})=>this._renderCurvePaths(e,t))}</g>`})()}
        <!-- Scrubber glow filters (only re-render when curves change, not on every position update) -->
        <defs>
          <clipPath id="editing-label-clip-${this._uid}">
            <rect x="${48}" y="${8}" width="${288}" height="24" />
          </clipPath>
          ${this.curves.filter(e=>e.visible).map(e=>{const t=`scrubber-glow-${e.color.replace("#","")}-${this._uid}`;return q`
              <filter id="${t}" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                <feFlood flood-color="${e.color}" flood-opacity="0.5" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>`})}
        </defs>
        ${this._renderScrubberIndicator()}
        <!-- Phase 3: control points rendered after scrubber overlay so they are always visible -->
        ${(()=>{const e=this._orderedCurves();return q`<g clip-path="url(#graph-area-${this._uid})">${e.map(({curve:e,idx:t})=>this._renderCurvePoints(e,t))}</g>`})()}
        ${(()=>{if(this.readOnly)return K;if(0===this.curves.length)return q`<text class="hint hint-select" text-anchor="middle"
                x="${194}" y="${112}"
                >Add a light below to get started</text>`;if(null===this.selectedCurveId&&this._dragCurveIdx<0){const e=this._isMobile?"double-tap":"double-click",t=this._graphHintDismissed?"Select a light to edit its curve":`Select a light, then ${e} its curve to add a control point`;return q`<text class="hint hint-select" text-anchor="middle"
                x="${194}" y="${112}"
                >${t}</text>`}const e=this.curves.find(e=>e.entityId===this.selectedCurveId),t=this._isMobile?"Double-tap add · Hold remove":"Double-click to add · Right-click to remove";return q`
              <text class="editing-label"
                x="${50}" y="${26}"
                fill="${e?.color??"currentColor"}"
                clip-path="url(#editing-label-clip-${this._uid})"
                >Editing ${e?.friendlyName??""}</text>
              <text class="hint" text-anchor="middle"
                x="${194}" y="${206}"
                >${t}</text>`})()}
      </svg>
    `}};ze.styles=s`
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
        font-size: 14px;
      }
      .editing-label {
        font-size: 14px;
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
  `,e([ue({type:Array})],ze.prototype,"curves",void 0),e([ue({type:String})],ze.prototype,"selectedCurveId",void 0),e([ue({type:String})],ze.prototype,"entityId",void 0),e([ue({type:Boolean})],ze.prototype,"readOnly",void 0),e([ue({type:Number})],ze.prototype,"scrubberPosition",void 0),e([ve()],ze.prototype,"_dragCurveIdx",void 0),e([ve()],ze.prototype,"_dragPointIdx",void 0),e([ve()],ze.prototype,"_hoveredPoint",void 0),e([ve()],ze.prototype,"_focusedPoint",void 0),e([ve()],ze.prototype,"_isMobile",void 0),e([ve()],ze.prototype,"_graphHintDismissed",void 0),e([function(e){return(t,i,r)=>((e,t,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof t&&Object.defineProperty(e,t,i),i))(t,i,{get(){return(t=>t.renderRoot?.querySelector(e)??null)(this)}})}("svg")],ze.prototype,"_svgRef",void 0),ze=e([he("curve-graph")],ze);let Oe=class extends de{constructor(){super(...arguments),this.curves=[],this.readOnly=!1,this.previewActive=!1,this.canPreview=!1,this._dragging=!1,this._position=50,this._trackRef=null}_onPointerDown(e){this.readOnly||(e.preventDefault(),this._dragging=!0,e.target.setPointerCapture(e.pointerId),this._updatePositionFromClient(e.clientX),this.dispatchEvent(new CustomEvent("scrubber-start",{bubbles:!0,composed:!0})))}_onPointerMove(e){this._dragging&&(e.preventDefault(),this._updatePositionFromClient(e.clientX))}_onPointerUp(){this._dragging&&(this._dragging=!1,this.dispatchEvent(new CustomEvent("scrubber-end",{bubbles:!0,composed:!0})))}_onTrackClick(e){this.readOnly||this._updatePositionFromClient(e.clientX)}_onKeyDown(e){if(this.readOnly)return;const t=e.shiftKey?10:1;if("ArrowRight"===e.key||"ArrowUp"===e.key)e.preventDefault(),this._position=Math.min(100,this._position+t);else if("ArrowLeft"===e.key||"ArrowDown"===e.key)e.preventDefault(),this._position=Math.max(0,this._position-t);else if("Home"===e.key)e.preventDefault(),this._position=0;else{if("End"!==e.key)return;e.preventDefault(),this._position=100}this._emitPosition()}_updatePositionFromClient(e){const t=this._trackRef;if(!t)return;const i=t.getBoundingClientRect(),r=(e-i.left)/i.width*100;this._position=Math.max(0,Math.min(100,r)),this._emitPosition()}_emitPosition(){this.dispatchEvent(new CustomEvent("scrubber-move",{detail:{position:this._position},bubbles:!0,composed:!0}))}_onPreviewToggle(){this.dispatchEvent(new CustomEvent("preview-toggle",{bubbles:!0,composed:!0}))}firstUpdated(){this._trackRef=this.renderRoot.querySelector(".track-area")}render(){const e=Math.round(this._position);return V`
      <div class="scrubber-panel">
        <div class="scrubber-header">
          <div class="scrubber-label">Group brightness</div>
          ${this.canPreview?this.previewActive?V`<button class="preview-toggle-btn active" @click=${this._onPreviewToggle}>
                  <span class="preview-live-dot"></span>
                  Previewing all lights &nbsp;·&nbsp;
                  <span class="preview-restore-text">Restore</span>
                </button>`:V`<button class="preview-toggle-btn" @click=${this._onPreviewToggle}>
                  Preview all lights
                </button>`:K}
        </div>
        <div
          class="track-area"
          role="slider"
          tabindex="${this.readOnly?-1:0}"
          aria-disabled="${this.readOnly}"
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
      </div>
    `}};var Ne;Oe.styles=s`
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
      margin-left: ${$e/356*100}%;
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
        font-size: 13px;
      }
      .preview-toggle-btn {
        font-size: 11px;
        padding: 0 12px;
        min-height: 44px;
      }
    }
  `,e([ue({type:Array})],Oe.prototype,"curves",void 0),e([ue({type:Boolean})],Oe.prototype,"readOnly",void 0),e([ue({type:Boolean})],Oe.prototype,"previewActive",void 0),e([ue({type:Boolean})],Oe.prototype,"canPreview",void 0),e([ve()],Oe.prototype,"_dragging",void 0),e([ve()],Oe.prototype,"_position",void 0),Oe=e([he("curve-scrubber")],Oe);const Be=[{value:"linear",label:"Linear"},{value:"dim_accent",label:"Dim accent"},{value:"late_starter",label:"Late starter"},{value:"night_mode",label:"Night mode"}];let He=Ne=class extends de{constructor(){super(...arguments),this.curves=[],this.selectedCurveId=null,this.scrubberPosition=null,this.canManage=!1,this.managing=!1,this.manageMode=!1,this.excludeEntityIds=[],this.presetOptions=Be,this.closeAddSignal=0,this.closeRemoveSignal=0,this.hass=null,this._addingLight=!1,this._pendingAddEntity="",this._pendingPreset=Be[0].value,this._confirmingRemove=null,this._confirmingDeleteGroup=!1,this._picker=new _e(()=>this.isConnected,()=>this.requestUpdate())}_select(e){this._confirmingRemove!==e&&this.dispatchEvent(new CustomEvent("select-curve",{detail:{entityId:e},bubbles:!0,composed:!0}))}_toggle(e,t){e.stopPropagation(),this.dispatchEvent(new CustomEvent("toggle-curve",{detail:{entityId:t},bubbles:!0,composed:!0}))}_clearSelection(e,t){e.stopPropagation(),this._select(t)}willUpdate(e){super.willUpdate(e),!e.has("canManage")&&!e.has("managing")||this.canManage&&!this.managing||(this._confirmingRemove=null,this._confirmingDeleteGroup=!1),e.has("manageMode")&&!this.manageMode&&(this._confirmingDeleteGroup=!1),e.has("closeAddSignal")&&this._cancelAdd(),e.has("closeRemoveSignal")&&(this._confirmingRemove=null)}_startRemove(e,t){e.stopPropagation(),this.canManage&&!this.managing&&(this.curves.length<=1||(this._cancelAdd(),this._confirmingRemove=t,this.dispatchEvent(new CustomEvent("remove-panel-open",{bubbles:!0,composed:!0}))))}_cancelRemove(e){e.stopPropagation(),this._confirmingRemove=null}_confirmRemove(e,t){e.stopPropagation(),this.canManage&&!this.managing?(this._confirmingRemove=null,this.dispatchEvent(new CustomEvent("remove-light",{detail:{entityId:t},bubbles:!0,composed:!0}))):this._confirmingRemove=null}_onItemKeyDown(e,t){if(this._confirmingRemove!==t&&e.target===e.currentTarget&&("Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._select(t)),"ArrowDown"===e.key||"ArrowUp"===e.key)){e.preventDefault();const t=[...this.renderRoot.querySelectorAll(".legend-item")],i=t.indexOf(e.currentTarget),r="ArrowDown"===e.key?i+1:i-1;t[r]?.focus()}}_onToggleKeyDown(e,t){"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._toggle(e,t))}connectedCallback(){super.connectedCallback(),this._picker.ensureLoaded()}updated(e){e.has("hass")&&this.hass&&this._picker.ensureLoaded()}_onFallbackAddEntityInput(e){this._pendingAddEntity=e.target.value.trim()}_startAdd(){this._confirmingRemove=null,this._confirmingDeleteGroup=!1,this._addingLight=!0,this._pendingAddEntity="",this._pendingPreset=this.presetOptions[0]?.value??"linear",this.dispatchEvent(new CustomEvent("add-panel-open",{bubbles:!0,composed:!0}))}_cancelAdd(){this._addingLight=!1,this._pendingAddEntity=""}_onAddEntityChange(e){this._pendingAddEntity=e.detail?.value??""}_onPresetSelect(e){this._pendingPreset=e}_confirmAdd(){const e=this._pendingAddEntity.trim();e&&(this.dispatchEvent(new CustomEvent("add-light",{detail:{entityId:e,preset:this._pendingPreset},bubbles:!0,composed:!0})),this._addingLight=!1,this._pendingAddEntity="")}_renderAddForm(){const e=[...this.curves.map(e=>e.entityId),...this.excludeEntityIds.filter(Boolean)];return V`
      <div class="add-form">
        ${this._picker.ready?V`<ha-entity-picker
              .hass=${this.hass}
              .value=${this._pendingAddEntity}
              .includeDomains=${["light"]}
              .excludeEntities=${e}
              allow-custom-entity
              @value-changed=${this._onAddEntityChange}
            ></ha-entity-picker>`:V`<input
              type="text"
              .value=${this._pendingAddEntity}
              placeholder="light.entity_id"
              @input=${this._onFallbackAddEntityInput}
            />`}
        <div class="preset-field">
          <label id="preset-grid-label">Starting curve</label>
          <div class="preset-grid" role="radiogroup" aria-labelledby="preset-grid-label">
            ${this.presetOptions.map(e=>{const t=Te.find(t=>t.id===e.value),i=e.value===this._pendingPreset;return V`
                <button
                  type="button"
                  class="preset-option ${i?"active":""}"
                  data-preset=${e.value}
                  role="radio"
                  aria-checked=${i?"true":"false"}
                  @click=${()=>this._onPresetSelect(e.value)}
                >
                  ${t?V`<svg viewBox="0 0 64 40" aria-hidden="true">
                        <polyline points=${Re(t)}></polyline>
                      </svg>`:K}
                  <span class="preset-name">${e.label}</span>
                </button>
              `})}
          </div>
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
    `}_renderConfirmRow(e){return V`
      <div class="confirm-row">
        <span class="confirm-text">Remove "${e.friendlyName}"?</span>
        <button type="button" class="confirm-btn" @click=${e=>this._cancelRemove(e)}>
          Cancel
        </button>
        <button
          type="button"
          class="confirm-btn danger"
          @click=${t=>this._confirmRemove(t,e.entityId)}
        >
          Remove
        </button>
      </div>
    `}render(){return V`
      <div class="legend-panel">
        <div class="legend-label">Lights</div>
        <div class="legend" role="listbox" aria-label="Light curves">
          ${this.curves.map((e,t)=>{const i=this.canManage&&!this.managing&&this._confirmingRemove===e.entityId;return V`
              <div
                class="legend-item ${e.visible?"":"hidden"} ${this.selectedCurveId===e.entityId?"selected":""} ${i?"confirming":""}"
                role="option"
                tabindex="0"
                aria-selected=${this.selectedCurveId===e.entityId}
                @click=${()=>this._select(e.entityId)}
                @keydown=${t=>this._onItemKeyDown(t,e.entityId)}
                style="--accent-color: ${e.color}"
              >
                <span
                  class="color-dot shape-${Ne._shapes[t%Ne._shapes.length]}"
                  style="background: ${e.color}; --dot-color: ${e.color}"
                ></span>
                ${i?this._renderConfirmRow(e):V`
                      <span class="name" title=${e.friendlyName}>${e.friendlyName}</span>
                      ${null!==this.scrubberPosition?V`<span class="brightness-value"
                            >${Math.round(Se(e.controlPoints,Math.round(this.scrubberPosition)))}%</span
                          >`:K}
                      ${this.selectedCurveId===e.entityId?V`
                            <span class="editing-chip">Editing</span>
                            <button
                              type="button"
                              class="clear-edit-icon"
                              aria-label="Stop editing ${e.friendlyName}"
                              title="Stop editing ${e.friendlyName}"
                              @click=${t=>this._clearSelection(t,e.entityId)}
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
                          `:K}
                      <button
                        type="button"
                        class="eye-btn"
                        aria-label="${e.visible?"Hide":"Show"} ${e.friendlyName}"
                        aria-pressed=${!e.visible}
                        @click=${t=>this._toggle(t,e.entityId)}
                        @keydown=${t=>this._onToggleKeyDown(t,e.entityId)}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        >
                          ${e.visible?V`
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
                      ${this.canManage&&this.manageMode&&this.curves.length>1?V`<button
                            type="button"
                            class="remove-icon"
                            aria-label="Remove ${e.friendlyName}"
                            title="Remove ${e.friendlyName}"
                            ?disabled=${this.managing}
                            @click=${t=>this._startRemove(t,e.entityId)}
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
                          </button>`:K}
                    `}
              </div>
            `})}
        </div>
        ${this.canManage||this.managing?V`
              <div class="add-divider"></div>
              ${this.managing?V`<div class="add-row">
                    <div class="managing-row" role="status" aria-live="polite">
                      <span class="spinner" aria-hidden="true"></span>
                      Updating lights…
                    </div>
                  </div>`:this.manageMode?V`
                      <div class="add-row">
                        ${this._addingLight?this._renderAddForm():V`<button
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
                    `:K}
              ${this.canManage?V`
                    <div class="manage-toggle-row">
                      <button
                        type="button"
                        class="manage-toggle-btn ${this.manageMode?"active":""}"
                        aria-pressed=${this.manageMode?"true":"false"}
                        ?disabled=${this.managing}
                        @click=${this._onManageToggleClick}
                      >
                        ${this.manageMode?"Done":"Manage lights"}
                      </button>
                    </div>
                    ${this.manageMode?V`
                          <div class="delete-group-row">
                            ${this._confirmingDeleteGroup?V`
                                  <div class="delete-group-confirm">
                                    <span class="delete-group-text">Delete this group?</span>
                                    <div class="delete-group-actions">
                                      <button
                                        type="button"
                                        class="delete-group-btn cancel"
                                        ?disabled=${this.managing}
                                        @click=${this._cancelDeleteGroup}
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        type="button"
                                        class="delete-group-btn danger"
                                        ?disabled=${this.managing}
                                        @click=${this._confirmDeleteGroup}
                                      >
                                        Delete group
                                      </button>
                                    </div>
                                  </div>
                                `:V`
                                  <button
                                    type="button"
                                    class="delete-group-btn link"
                                    ?disabled=${this.managing}
                                    @click=${this._startDeleteGroup}
                                  >
                                    Delete this group
                                  </button>
                                `}
                          </div>
                        `:K}
                  `:K}
            `:K}
      </div>
    `}_onManageToggleClick(){this.dispatchEvent(new CustomEvent("manage-toggle",{detail:{manageMode:!this.manageMode},bubbles:!0,composed:!0}))}_startDeleteGroup(){this.canManage&&!this.managing&&(this._cancelAdd(),this._confirmingRemove=null,this._confirmingDeleteGroup=!0)}_cancelDeleteGroup(){this._confirmingDeleteGroup=!1}_confirmDeleteGroup(){this.canManage&&!this.managing&&(this._confirmingDeleteGroup=!1,this.dispatchEvent(new CustomEvent("delete-group",{bubbles:!0,composed:!0})))}};He.styles=s`
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
      opacity: 0.7;
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
    .remove-icon:hover {
      opacity: 1;
      color: var(--error-color, #db4437);
    }
    /* Selected row is the active editing target — hide the trash to keep the
       row readable on mobile and avoid mis-tapping while editing. Deselect
       first (click the X), then delete. */
    .legend-item.selected .remove-icon {
      display: none;
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
    .manage-toggle-row {
      padding: 4px 10px 8px;
      display: flex;
      justify-content: flex-end;
    }
    .manage-toggle-btn {
      min-height: 32px;
      padding: 4px 12px;
      font-family: inherit;
      font-size: 12px;
      font-weight: 500;
      color: var(--secondary-text-color, #616161);
      background: transparent;
      border: 1px solid var(--divider);
      border-radius: 6px;
      cursor: pointer;
      transition:
        border-color 0.15s ease,
        color 0.15s ease,
        background 0.15s ease;
    }
    .manage-toggle-btn:hover:not(:disabled) {
      border-color: var(--primary-color, #2563eb);
      color: var(--primary-color, #2563eb);
    }
    .manage-toggle-btn:focus-visible {
      outline: 2px solid var(--primary-color, #2563eb);
      outline-offset: 2px;
    }
    .manage-toggle-btn.active {
      border-color: var(--primary-color, #2563eb);
      color: var(--primary-color, #2563eb);
      background: color-mix(in srgb, var(--primary-color, #2563eb) 10%, transparent);
    }
    .manage-toggle-btn:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
    .delete-group-row {
      padding: 4px 10px 10px;
      border-top: 1px dashed var(--divider);
      margin-top: 2px;
    }
    .delete-group-btn {
      font-family: inherit;
      font-size: 12px;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 6px;
    }
    .delete-group-btn:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
    .delete-group-btn.link {
      background: transparent;
      border: none;
      color: var(--error-color, #db4437);
      min-height: 44px;
      padding: 10px 0;
      text-align: left;
      width: 100%;
    }
    .delete-group-btn.link:hover:not(:disabled) {
      text-decoration: underline;
    }
    .delete-group-confirm {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
    }
    .delete-group-text {
      font-size: 12px;
      color: var(--primary-text-color, #212121);
      font-weight: 500;
    }
    .delete-group-actions {
      display: flex;
      gap: 6px;
    }
    .delete-group-btn.cancel {
      background: transparent;
      border: 1px solid var(--divider);
      color: var(--secondary-text-color, #616161);
    }
    .delete-group-btn.cancel:hover:not(:disabled) {
      border-color: var(--primary-color, #2563eb);
      color: var(--primary-color, #2563eb);
    }
    .delete-group-btn.danger {
      background: var(--error-color, #db4437);
      border: 1px solid var(--error-color, #db4437);
      color: #fff;
      font-weight: 600;
    }
    .delete-group-btn.danger:hover:not(:disabled) {
      opacity: 0.9;
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
      gap: 6px;
    }
    .preset-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }
    @media (max-width: 499px) {
      .preset-grid {
        grid-template-columns: 1fr;
      }
    }
    .preset-option {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 44px;
      padding: 6px 8px;
      border: 1px solid var(--divider);
      border-radius: 8px;
      background: var(--card-background-color, #fff);
      color: var(--primary-text-color, #212121);
      font-family: inherit;
      font-size: 12px;
      font-weight: 500;
      text-align: left;
      cursor: pointer;
      transition:
        border-color 0.15s ease,
        background 0.15s ease;
    }
    .preset-option:hover {
      border-color: var(--primary-color, #2563eb);
    }
    .preset-option:focus-visible {
      outline: none;
      border-color: var(--primary-color, #2563eb);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary-color, #2563eb) 40%, transparent);
    }
    .preset-option.active {
      border-color: var(--primary-color, #2563eb);
      background: color-mix(in srgb, var(--primary-color, #2563eb) 12%, transparent);
    }
    .preset-option svg {
      flex-shrink: 0;
      width: 64px;
      height: 40px;
    }
    .preset-option polyline {
      fill: none;
      stroke: var(--primary-color, #2563eb);
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
    }
    .preset-option .preset-name {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
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
  `,He._shapes=["circle","square","diamond","triangle","bar"],e([ue({type:Array})],He.prototype,"curves",void 0),e([ue({type:String})],He.prototype,"selectedCurveId",void 0),e([ue({type:Number})],He.prototype,"scrubberPosition",void 0),e([ue({type:Boolean})],He.prototype,"canManage",void 0),e([ue({type:Boolean})],He.prototype,"managing",void 0),e([ue({type:Boolean})],He.prototype,"manageMode",void 0),e([ue({type:Array})],He.prototype,"excludeEntityIds",void 0),e([ue({type:Array})],He.prototype,"presetOptions",void 0),e([ue({type:Number})],He.prototype,"closeAddSignal",void 0),e([ue({type:Number})],He.prototype,"closeRemoveSignal",void 0),e([ue({attribute:!1})],He.prototype,"hass",void 0),e([ve()],He.prototype,"_addingLight",void 0),e([ve()],He.prototype,"_pendingAddEntity",void 0),e([ve()],He.prototype,"_pendingPreset",void 0),e([ve()],He.prototype,"_confirmingRemove",void 0),e([ve()],He.prototype,"_confirmingDeleteGroup",void 0),He=Ne=e([he("curve-legend")],He);let je=class extends de{constructor(){super(...arguments),this.dirty=!1,this.readOnly=!1,this.saving=!1,this.canUndo=!1}_onSave(){this.dispatchEvent(new CustomEvent("save-curves",{bubbles:!0,composed:!0}))}_onCancel(){this.dispatchEvent(new CustomEvent("cancel-curves",{bubbles:!0,composed:!0}))}_onUndo(){this.dispatchEvent(new CustomEvent("undo-curves",{bubbles:!0,composed:!0}))}render(){return this.readOnly?V`
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
    `:V``}};je.styles=s`
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
  `,e([ue({type:Boolean})],je.prototype,"dirty",void 0),e([ue({type:Boolean})],je.prototype,"readOnly",void 0),e([ue({type:Boolean})],je.prototype,"saving",void 0),e([ue({type:Boolean})],je.prototype,"canUndo",void 0),je=e([he("curve-footer")],je);"undefined"!=typeof window&&(window.__LIGHTENER_CURVE_CARD_VERSION__="2.15.0-dev.5");const Fe=V`<svg
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
</svg>`;const Ve=["light"];let qe=class extends de{constructor(){super(...arguments),this._config={},this._hass=null,this._picker=new _e(()=>this.isConnected,()=>this.requestUpdate())}connectedCallback(){super.connectedCallback(),this._picker.ensureLoaded()}setConfig(e){this._config=e,this._picker.ensureLoaded()}set hass(e){this._hass=e,this._picker.ensureLoaded()}_fireConfigChanged(){this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config},bubbles:!0,composed:!0}))}_onEntityChange(e){const t=e.detail?.value??"";this._config={...this._config,entity:t||void 0},this._fireConfigChanged()}_onTitleChange(e){const t=e.target.value;this._config={...this._config,title:t||void 0},this._fireConfigChanged()}_onFallbackEntityInput(e){const t=e.target.value.trim();this._config={...this._config,entity:t||void 0},this._fireConfigChanged()}render(){const e=this._config.entity??"",t=this._config.title??"";return V`
      <div class="form">
        <div class="field">
          <label>Entity</label>
          ${this._picker.ready?V`
                <ha-entity-picker
                  .hass=${this._hass}
                  .value=${e}
                  .includeDomains=${Ve}
                  allow-custom-entity
                  @value-changed=${this._onEntityChange}
                ></ha-entity-picker>
                <span class="hint">Select a Lightener group to edit its brightness curves.</span>
              `:V`
                <input
                  type="text"
                  .value=${e}
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
            .value=${t}
            placeholder="Brightness Curves"
            @input=${this._onTitleChange}
          />
        </div>
      </div>
    `}};qe.styles=s`
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
  `,e([ve()],qe.prototype,"_config",void 0),e([ve()],qe.prototype,"_hass",void 0),qe=e([he("lightener-curve-card-editor")],qe);let Ge=class extends de{constructor(){super(...arguments),this._curves=[],this._originalCurves=[],this._config={},this._selectedCurveId=null,this._saveState=Ue,this._loadError=null,this._loading=!1,this._manageError=null,this._managingLights=!1,this._scrubberPosition=null,this._cancelAnimating=!1,this._hass=null,this._undoStack=[],this._dragUndoPushed=!1,this._loaded=!1,this._loadedEntityId=void 0,this._loadErrorEntityId=void 0,this._boundKeyHandler=null,this._boundBeforeUnload=null,this._saveSuccessTimer=null,this._cancelAnimFrame=null,this._previewActive=!1,this._showPresets=!1,this._legendCloseAddSignal=0,this._legendCloseRemoveSignal=0,this._manageMode=!1,this._previewRafPending=!1,this._previewTrailingTimer=null,this._lastPreviewTime=0,this._previewRestoreBrightness=new Map,this._lastPreviewBrightness=new Map,this._lastEmittedDirtyState=!1,this._dirtyVersion=0,this._cleanVersion=0,this._onPreviewToggle=()=>{this._previewActive?this._stopPreview():this._startPreview()},this._startPreview=()=>{if(this._hass&&!this._previewActive){this._previewActive=!0,null===this._scrubberPosition&&(this._scrubberPosition=50),this._previewRestoreBrightness.clear(),this._lastPreviewBrightness.clear();for(const e of this._curves){const t=this._hass.states[e.entityId];t&&this._previewRestoreBrightness.set(e.entityId,"off"===t.state?null:t.attributes.brightness??void 0)}this._previewLights(this._scrubberPosition)}},this._stopPreview=()=>{if(this._previewActive&&this._hass){this._previewActive=!1,this._previewRafPending=!1,this._previewTrailingTimer&&(clearTimeout(this._previewTrailingTimer),this._previewTrailingTimer=null);for(const[e,t]of this._previewRestoreBrightness)null===t?this._hass.callService("light","turn_off",{entity_id:e}).catch(()=>{}):void 0===t?this._hass.callService("light","turn_on",{entity_id:e}).catch(()=>{}):this._hass.callService("light","turn_on",{entity_id:e,brightness:t}).catch(()=>{});this._previewRestoreBrightness.clear(),this._lastPreviewBrightness.clear()}},this._PREVIEW_INTERVAL_MS=300,this._pendingPreviewPosition=null}get _saving(){return"saving"===this._saveState.phase}get _saveSuccess(){return"saved"===this._saveState.phase}get _saveError(){return"error"===(e=this._saveState).phase?e.message:null;var e}_dispatchSave(e){this._saveState=function(e,t){switch(t.type){case"reset":return{phase:"idle"};case"dirty":return"idle"===e.phase?{phase:"dirty"}:e;case"save-start":return"saving"===e.phase?e:{phase:"saving"};case"save-success":return"saving"!==e.phase?e:{phase:"saved"};case"save-error":return"saving"!==e.phase?e:{phase:"error",message:t.message};case"save-clear":return"saved"===e.phase||"error"===e.phase?{phase:"idle"}:e}}(this._saveState,e)}get _embedded(){return!0===this._config.embedded}static getConfigElement(){return document.createElement("lightener-curve-card-editor")}static getStubConfig(){return{type:"custom:lightener-curve-card"}}setConfig(e){const t=e.entity!==this._config.entity;this._config=e,t&&(this._previewActive&&this._stopPreview(),this._loaded=!1,this._loadedEntityId=void 0,this._loadErrorEntityId=void 0,this._showPresets=!1,this._tryLoadCurves())}set hass(e){const t=!!this._hass;this._hass=e,t&&this._loaded||this._tryLoadCurves()}getCardSize(){return 4}getGridOptions(){return{columns:12,rows:9,min_columns:6,min_rows:6}}get _isAdmin(){return this._hass?.user?.is_admin??!1}get _entityId(){return this._config.entity}get _isDirty(){return this._dirtyVersion!==this._cleanVersion}get _canManageLights(){return this._isAdmin&&!!this._hass&&!!this._entityId&&!this._isDirty&&!this._saving&&!this._cancelAnimating&&!this._loading&&!this._managingLights&&!this._loadError}get dirty(){return this._isDirty}connectedCallback(){super.connectedCallback(),this._loadErrorEntityId!==this._entityId&&(this._loaded=!1,this._loadedEntityId=void 0),this._tryLoadCurves(),this._boundKeyHandler=this._onKeyDown.bind(this),this._boundBeforeUnload=this._onBeforeUnload.bind(this),window.addEventListener("keydown",this._boundKeyHandler),window.addEventListener("beforeunload",this._boundBeforeUnload)}disconnectedCallback(){super.disconnectedCallback(),this._previewActive&&this._stopPreview(),this._boundKeyHandler&&window.removeEventListener("keydown",this._boundKeyHandler),this._boundBeforeUnload&&window.removeEventListener("beforeunload",this._boundBeforeUnload),this._saveSuccessTimer&&(clearTimeout(this._saveSuccessTimer),this._saveSuccessTimer=null),this._cancelAnimFrame&&(cancelAnimationFrame(this._cancelAnimFrame),this._cancelAnimFrame=null,this._cancelAnimating=!1)}updated(e){if(super.updated(e),e.has("_curves")||e.has("_originalCurves")||e.has("_cancelAnimating")){const e=this._isDirty;e!==this._lastEmittedDirtyState&&(this._lastEmittedDirtyState=e,this.dispatchEvent(new CustomEvent("curve-dirty-state",{detail:{dirty:e},bubbles:!0,composed:!0})),e&&this._dispatchSave({type:"dirty"}))}}_togglePresets(){if(this._managingLights)return;if(0===this._curves.length)return;const e=!this._showPresets;this._showPresets=e,e&&(this._legendCloseAddSignal++,this._legendCloseRemoveSignal++)}_onLegendPanelOpen(){this._showPresets=!1}_applyPreset(e){if(this._cancelAnimating||this._saving||this._managingLights)return;if(0===this._curves.length)return;this._pushUndo();const t=e.controlPoints.map(e=>({...e}));null!==this._selectedCurveId?this._curves=this._curves.map(e=>e.entityId===this._selectedCurveId?{...e,controlPoints:t}:e):this._curves=this._curves.map(e=>({...e,controlPoints:t})),this._dirtyVersion++,this._showPresets=!1}_renderPresetsPanel(){const e=null!==this._selectedCurveId?`Applying to ${this._curves.find(e=>e.entityId===this._selectedCurveId)?.friendlyName??"selected light"}`:"Applying to all lights";return V`
      <div class="presets-panel">
        <div class="presets-header">${e}</div>
        ${Te.map(e=>V`
            <button class="preset-option" @click=${()=>this._applyPreset(e)}>
              <svg
                class="preset-preview"
                viewBox="0 0 64 40"
                width="64"
                height="40"
                aria-hidden="true"
              >
                <polyline
                  points="${Re(e)}"
                  fill="none"
                  stroke="var(--accent, #2563eb)"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <div class="preset-name">${e.name}</div>
              <div class="preset-desc">${e.description}</div>
            </button>
          `)}
      </div>
    `}_onKeyDown(e){const t=document.activeElement;t&&t!==this&&t!==document.body&&!this.contains(t)||((e.ctrlKey||e.metaKey)&&"s"===e.key&&this._isDirty&&this._isAdmin&&!this._saving&&!this._managingLights&&(e.preventDefault(),this._onSave()),!e.ctrlKey&&!e.metaKey||"z"!==e.key||e.shiftKey||!this._saving&&!this._cancelAnimating&&!this._managingLights&&this._undoStack.length>0&&(e.preventDefault(),this._undo()),"Escape"===e.key&&(this._showPresets?(e.preventDefault(),this._showPresets=!1):!this._isDirty||this._saving||this._cancelAnimating||this._managingLights||(e.preventDefault(),this._onCancel())))}_onBeforeUnload(e){this._isDirty&&(e.preventDefault(),e.returnValue="")}async _tryLoadCurves(){if(this._loaded&&this._loadedEntityId===this._entityId)return;if(this._loading)return;if(!this._hass||!this._entityId){if(0===this._curves.length){const e=[{entityId:"light.ceiling_light",friendlyName:"Ceiling Light",controlPoints:[{lightener:0,target:0},{lightener:20,target:0},{lightener:60,target:80},{lightener:100,target:100}],visible:!0,color:De[0]},{entityId:"light.sofa_lamp",friendlyName:"Sofa Lamp",controlPoints:[{lightener:0,target:0},{lightener:10,target:50},{lightener:40,target:100},{lightener:70,target:100},{lightener:100,target:60}],visible:!0,color:De[1]},{entityId:"light.led_strip",friendlyName:"LED Strip",controlPoints:[{lightener:0,target:0},{lightener:1,target:1},{lightener:100,target:100}],visible:!0,color:De[2]}];this._curves=e,this._originalCurves=me(e),this._cleanVersion=this._dirtyVersion}return}this._loadError=null,this._loading=!0;const e=this._entityId;try{const n=await this._hass.callWS({type:"lightener/get_curves",entity_id:e});if(this._entityId!==e)return;const o=(t=n.entities,i=this._hass.states,r=De,Object.keys(t).map((e,n)=>{const o=t[e]?.brightness??{},s=new Map([[0,0]]);for(const[e,t]of Object.entries(o)){const i=Number(e),r=Number(t);Number.isFinite(i)&&Number.isFinite(r)&&(i<0||i>100||r<0||r>100||s.set(i,r))}const a=[...s].map(([e,t])=>({lightener:e,target:t}));a.sort((e,t)=>e.lightener-t.lightener);const l=i[e]?.attributes?.friendly_name??e.replace("light.","");return{entityId:e,friendlyName:l,controlPoints:a,visible:!0,color:r[n%r.length]}}));this._curves=o,this._originalCurves=me(o),this._cleanVersion=this._dirtyVersion,this._loaded=!0,this._loadedEntityId=e,this._loadErrorEntityId=void 0}catch(t){if(this._entityId!==e)return;console.error("[Lightener] Failed to load curves:",t),this._loadError=String(t),this._loaded=!0,this._loadedEntityId=e,this._loadErrorEntityId=e}finally{this._loading=!1,this._entityId!==e&&this._tryLoadCurves()}var t,i,r}_onScrubberMove(e){this._scrubberPosition=e.detail.position,this._previewActive&&this._previewLights(e.detail.position)}_onScrubberStart(){}_onScrubberEnd(){}_previewLights(e){if(!this._previewActive||!this._hass)return;this._pendingPreviewPosition=e;const t=Date.now()-this._lastPreviewTime;t<this._PREVIEW_INTERVAL_MS?this._previewTrailingTimer||(this._previewTrailingTimer=setTimeout(()=>{this._previewTrailingTimer=null,null!==this._pendingPreviewPosition&&this._previewLights(this._pendingPreviewPosition)},this._PREVIEW_INTERVAL_MS-t)):this._previewRafPending||(this._previewTrailingTimer&&(clearTimeout(this._previewTrailingTimer),this._previewTrailingTimer=null),this._previewRafPending=!0,requestAnimationFrame(()=>{if(this._previewRafPending=!1,this._previewActive&&this._hass){this._lastPreviewTime=Date.now();for(const t of this._curves){if(!t.visible)continue;const i=Math.round(Se(t.controlPoints,e)),r=Math.round(i/100*255);if(0===r){if("off"===this._lastPreviewBrightness.get(t.entityId))continue;this._lastPreviewBrightness.set(t.entityId,"off"),this._hass.callService("light","turn_off",{entity_id:t.entityId}).catch(()=>{})}else{if(this._lastPreviewBrightness.get(t.entityId)===r)continue;this._lastPreviewBrightness.set(t.entityId,r),this._hass.callService("light","turn_on",{entity_id:t.entityId,brightness:r}).catch(()=>{})}}}}))}_onSelectCurve(e){if(this._cancelAnimating)return;const{entityId:t}=e.detail,i=this._curves.find(e=>e.entityId===t);i&&!i.visible||(this._selectedCurveId=this._selectedCurveId===t?null:t)}_onFocusCurve(e){if(this._cancelAnimating)return;const{entityId:t}=e.detail,i=this._curves.find(e=>e.entityId===t);i&&i.visible&&(this._selectedCurveId=t)}_pushUndo(){this._undoStack.push(me(this._curves)),this._undoStack.length>50&&this._undoStack.shift()}_undo(){0!==this._undoStack.length&&null===this._cancelAnimFrame&&this._animateCurvesTo(this._undoStack.pop())}_animateCurvesTo(e,t){const i=me(this._curves);this._cancelAnimating=!0;const r=performance.now(),n=o=>{const s=o-r,a=Math.min(s/300,1),l=function(e){return 1-Math.pow(1-e,3)}(a),d=e.map((e,t)=>{const r=i[t];if(!r)return e;const n=r.controlPoints,o=e.controlPoints,s=Math.min(n.length,o.length),d=[];for(let e=0;e<s;e++)d.push({lightener:Math.round(n[e].lightener+(o[e].lightener-n[e].lightener)*l),target:Math.round(n[e].target+(o[e].target-n[e].target)*l)});if(o.length>s&&a>=1)for(let e=s;e<o.length;e++)d.push({...o[e]});if(n.length>s&&a<1)for(let e=s;e<n.length;e++)d.push({...n[e]});return d.sort((e,t)=>e.lightener-t.lightener),{...e,controlPoints:d,visible:r.visible}});this._curves=d,a<1?this._cancelAnimFrame=requestAnimationFrame(n):(this._curves=e.map((e,t)=>({...e,visible:i[t]?.visible??e.visible})),this._cancelAnimating=!1,this._cancelAnimFrame=null,function(e,t){if(e.length!==t.length)return!1;for(let i=0;i<e.length;i++){const r=e[i].controlPoints,n=t[i].controlPoints;if(r.length!==n.length)return!1;for(let e=0;e<r.length;e++){if(r[e].lightener!==n[e].lightener)return!1;if(r[e].target!==n[e].target)return!1}}return!0}(this._curves,this._originalCurves)&&(this._cleanVersion=this._dirtyVersion),t?.())};this._cancelAnimFrame=requestAnimationFrame(n)}_onPointMove(e){if(this._cancelAnimating)return;this._showPresets=!1,this._dragUndoPushed||(this._pushUndo(),this._dragUndoPushed=!0);const{curveIndex:t,pointIndex:i,lightener:r,target:n}=e.detail,o=this._curves[t];o&&this._selectedCurveId!==o.entityId&&(this._selectedCurveId=o.entityId);const s=[...this._curves],a={...s[t]},l=[...a.controlPoints];l[i]={lightener:r,target:n},a.controlPoints=l,s[t]=a,this._curves=s,this._dirtyVersion++}_onPointDrop(e){this._dragUndoPushed=!1}_onPointAdd(e){if(this._cancelAnimating)return;const{lightener:t,target:i,entityId:r}=e.detail,n=r??this._selectedCurveId;if(!n)return;const o=this._curves.findIndex(e=>e.entityId===n);if(o<0)return;if(this._curves[o].controlPoints.some(e=>e.lightener===t))return;this._pushUndo();const s=[...this._curves],a={...s[o]},l=[...a.controlPoints,{lightener:t,target:i}];l.sort((e,t)=>e.lightener-t.lightener),a.controlPoints=l,s[o]=a,this._curves=s,this._dirtyVersion++}_onPointRemove(e){if(this._cancelAnimating)return;this._dragUndoPushed=!1;const{curveIndex:t,pointIndex:i}=e.detail,r=this._curves[t];if(!r)return;if(r.controlPoints.length<=2)return;if(0===i)return;this._pushUndo();const n=[...this._curves],o={...n[t]};o.controlPoints=o.controlPoints.filter((e,t)=>t!==i),n[t]=o,this._curves=n,this._dirtyVersion++}_onToggleCurve(e){if(this._cancelAnimating)return;const{entityId:t}=e.detail,i=this._curves.map(e=>e.entityId===t?{...e,visible:!e.visible}:e);if(this._curves=i,this._selectedCurveId===t){const e=i.find(e=>e.entityId===t);e&&!e.visible&&(this._selectedCurveId=null)}}async _onAddLight(e){if(!this._hass||!this._entityId||this._managingLights)return;const{entityId:t,preset:i}=e.detail;if(t){this._previewActive&&this._stopPreview(),this._manageError=null,this._managingLights=!0;try{const e={type:"lightener/add_light",entity_id:this._entityId,controlled_entity_id:t};i&&(e.preset=i),await this._hass.callWS(e),this._undoStack=[],this._loaded=!1,await this._tryLoadCurves(),this._manageMode=!1,this._legendCloseAddSignal++}catch(e){console.error("[Lightener] Failed to add light:",e),this._manageError=this._formatManageError(e,"Could not add light.")}finally{this._managingLights=!1}}}_onManageToggle(e){const t=e.detail,i=t&&"boolean"==typeof t.manageMode?t.manageMode:!this._manageMode;this._manageMode=i,i||(this._legendCloseAddSignal++,this._legendCloseRemoveSignal++)}async _onDeleteGroup(){if(!this._hass||!this._entityId||this._managingLights)return;this._previewActive&&this._stopPreview();const e=this._entityId;this._manageError=null,this._managingLights=!0;try{const t=await this._hass.callWS({type:"config/entity_registry/get",entity_id:e});if("lightener"!==t?.platform)throw new Error("Entity is not a Lightener group — cannot delete from this card.");const i=t?.config_entry_id;if(!i)throw new Error("Group is not backed by a config entry — cannot delete from the card.");await this._hass.callWS({type:"config_entries/remove",entry_id:i}),this._curves=[],this._originalCurves=[],this._undoStack=[],this._loaded=!1,this._loadedEntityId=void 0,this._selectedCurveId=null,this._loadError="This Lightener group was deleted.",this._loadErrorEntityId=e,this.dispatchEvent(new CustomEvent("lightener-group-deleted",{detail:{entityId:e,configEntryId:i},bubbles:!0,composed:!0}))}catch(e){console.error("[Lightener] Failed to delete group:",e),this._manageError=this._formatManageError(e,"Could not delete group.")}finally{this._managingLights=!1}}async _onRemoveLight(e){if(!this._hass||!this._entityId||this._managingLights)return;const{entityId:t}=e.detail;if(t){this._previewActive&&this._stopPreview(),this._manageError=null,this._managingLights=!0;try{await this._hass.callWS({type:"lightener/remove_light",entity_id:this._entityId,controlled_entity_id:t}),this._selectedCurveId===t&&(this._selectedCurveId=null),this._undoStack=[],this._loaded=!1,await this._tryLoadCurves()}catch(e){console.error("[Lightener] Failed to remove light:",e),this._manageError=this._formatManageError(e,"Could not remove light.")}finally{this._managingLights=!1}}}_formatManageError(e,t){const i=e;return i?.message?i.message:t}async saveCurves(){return this._onSave()}async _onSave(){if(!this._hass||!this._entityId||this._saving||this._cancelAnimating||this._managingLights)return!1;this._previewActive&&this._stopPreview();const e=this._entityId;this._dispatchSave({type:"save-start"});try{const t=function(e){const t={};for(const i of e){const e={};let r=-1,n=0;for(const t of i.controlPoints)0===t.lightener&&0===t.target||(e[String(t.lightener)]=String(t.target),t.lightener>r&&(r=t.lightener,n=t.target));!("100"in e)&&r>=0&&(e[100]=String(n)),t[i.entityId]={brightness:e}}return t}(this._curves);return await this._hass.callWS({type:"lightener/save_curves",entity_id:e,curves:t}),this._entityId!==e?(this._previewActive&&this._stopPreview(),this._undoStack=[],this._dispatchSave({type:"reset"}),!1):(this._originalCurves=me(this._curves),this._cleanVersion=this._dirtyVersion,this._undoStack=[],this._loaded=!1,this._tryLoadCurves(),this._dispatchSave({type:"save-success"}),this._saveSuccessTimer&&clearTimeout(this._saveSuccessTimer),this._saveSuccessTimer=setTimeout(()=>{this._dispatchSave({type:"save-clear"}),this._saveSuccessTimer=null},2e3),!0)}catch(e){return console.error("[Lightener] Failed to save curves:",e),this._dispatchSave({type:"save-error",message:"Save failed. Check connection."}),!1}}_retryLoad(){this._loaded=!1,this._loadError=null,this._loadErrorEntityId=void 0,this._tryLoadCurves()}_onCancel(){this._cancelAnimating||(this._previewActive&&this._stopPreview(),this._showPresets=!1,this._undoStack=[],this._animateCurvesTo(me(this._originalCurves),()=>{this._selectedCurveId=null,this._dispatchSave({type:"reset"})}))}_renderLoadingSkeleton(){return V`
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
              </button>`:K}
        </div>

        ${this._showPresets?this._renderPresetsPanel():K}

        <div class="workspace">
          <div class="main-stack">
            ${this._loading?this._renderLoadingSkeleton():V`<div class="graph-panel">
                  <curve-graph
                    .curves=${this._curves}
                    .selectedCurveId=${this._selectedCurveId}
                    .entityId=${this._entityId??null}
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
                ></curve-scrubber>`:K}
          </div>

          <div class="side-rail">
            <curve-legend
              .curves=${this._curves}
              .selectedCurveId=${this._selectedCurveId}
              .scrubberPosition=${this._scrubberPosition}
              .canManage=${this._canManageLights}
              .managing=${this._managingLights}
              .manageMode=${this._manageMode}
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
              @manage-toggle=${this._onManageToggle}
              @delete-group=${this._onDeleteGroup}
            ></curve-legend>
            ${this._manageError?V`<div class="error" role="alert">${Fe} ${this._manageError}</div>`:K}
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
              </div>`:K}
          ${this._loadError?V`<div class="error" role="alert">
                ${Fe} Failed to load curves
                <button type="button" class="retry-link" @click=${this._retryLoad}>Retry</button>
              </div>`:K}
          ${this._saveError?V`<div class="error" role="alert">
                ${Fe} Save failed
                <button type="button" class="retry-link" @click=${this._onSave}>Retry</button>
              </div>`:K}
        </div>
      </div>
    `}};Ge.styles=s`
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
  `,e([ve()],Ge.prototype,"_curves",void 0),e([ve()],Ge.prototype,"_originalCurves",void 0),e([ve()],Ge.prototype,"_config",void 0),e([ve()],Ge.prototype,"_selectedCurveId",void 0),e([ve()],Ge.prototype,"_saveState",void 0),e([ve()],Ge.prototype,"_loadError",void 0),e([ve()],Ge.prototype,"_loading",void 0),e([ve()],Ge.prototype,"_manageError",void 0),e([ve()],Ge.prototype,"_managingLights",void 0),e([ve()],Ge.prototype,"_scrubberPosition",void 0),e([ve()],Ge.prototype,"_cancelAnimating",void 0),e([ve()],Ge.prototype,"_hass",void 0),e([ve()],Ge.prototype,"_previewActive",void 0),e([ve()],Ge.prototype,"_showPresets",void 0),e([ve()],Ge.prototype,"_legendCloseAddSignal",void 0),e([ve()],Ge.prototype,"_legendCloseRemoveSignal",void 0),e([ve()],Ge.prototype,"_manageMode",void 0),Ge=e([he("lightener-curve-card")],Ge);export{Ge as LightenerCurveCard,qe as LightenerCurveCardEditor};
