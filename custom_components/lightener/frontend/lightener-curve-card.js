function t(t,e,i,s){var r,o=arguments.length,n=o<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,s);else for(var a=t.length-1;a>=0;a--)(r=t[a])&&(n=(o<3?r(n):o>3?r(e,i,n):r(e,i))||n);return o>3&&n&&Object.defineProperty(e,i,n),n}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),r=new WeakMap;let o=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=r.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(e,t))}return t}toString(){return this.cssText}};const n=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new o(i,t,s)},a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new o("string"==typeof t?t:t+"",void 0,s))(e)})(t):t,{is:l,defineProperty:c,getOwnPropertyDescriptor:h,getOwnPropertyNames:d,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,g=globalThis,v=g.trustedTypes,_=v?v.emptyScript:"",f=g.reactiveElementPolyfillSupport,y=(t,e)=>t,$={toAttribute(t,e){switch(e){case Boolean:t=t?_:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},x=(t,e)=>!l(t,e),b={attribute:!0,type:String,converter:$,reflect:!1,useDefault:!1,hasChanged:x};Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;let m=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=b){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&c(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:r}=h(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const o=s?.call(this);r?.call(this,e),this.requestUpdate(t,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const t=this.properties,e=[...d(t),...p(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,s)=>{if(i)t.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of s){const s=document.createElement("style"),r=e.litNonce;void 0!==r&&s.setAttribute("nonce",r),s.textContent=i.cssText,t.appendChild(s)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:$).toAttribute(e,i.type);this._$Em=t,null==r?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),r="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:$;this._$Em=s;const o=r.fromAttribute(e,t.type);this[s]=o??this._$Ej?.get(s)??o,this._$Em=null}}requestUpdate(t,e,i,s=!1,r){if(void 0!==t){const o=this.constructor;if(!1===s&&(r=this[t]),i??=o.getPropertyOptions(t),!((i.hasChanged??x)(r,e)||i.useDefault&&i.reflect&&r===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:r},o){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),!0!==r||void 0!==o)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};m.elementStyles=[],m.shadowRootOptions={mode:"open"},m[y("elementProperties")]=new Map,m[y("finalized")]=new Map,f?.({ReactiveElement:m}),(g.reactiveElementVersions??=[]).push("2.1.2");const A=globalThis,C=t=>t,w=A.trustedTypes,E=w?w.createPolicy("lit-html",{createHTML:t=>t}):void 0,P="$lit$",S=`lit$${Math.random().toFixed(9).slice(2)}$`,I="?"+S,k=`<${I}>`,M=document,O=()=>M.createComment(""),U=t=>null===t||"object"!=typeof t&&"function"!=typeof t,R=Array.isArray,T="[ \t\n\f\r]",N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,H=/-->/g,D=/>/g,j=RegExp(`>|${T}(?:([^\\s"'>=/]+)(${T}*=${T}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),z=/'/g,L=/"/g,B=/^(?:script|style|textarea|title)$/i,V=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),W=V(1),q=V(2),F=Symbol.for("lit-noChange"),G=Symbol.for("lit-nothing"),Y=new WeakMap,X=M.createTreeWalker(M,129);function J(t,e){if(!R(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==E?E.createHTML(e):e}const K=(t,e)=>{const i=t.length-1,s=[];let r,o=2===e?"<svg>":3===e?"<math>":"",n=N;for(let e=0;e<i;e++){const i=t[e];let a,l,c=-1,h=0;for(;h<i.length&&(n.lastIndex=h,l=n.exec(i),null!==l);)h=n.lastIndex,n===N?"!--"===l[1]?n=H:void 0!==l[1]?n=D:void 0!==l[2]?(B.test(l[2])&&(r=RegExp("</"+l[2],"g")),n=j):void 0!==l[3]&&(n=j):n===j?">"===l[0]?(n=r??N,c=-1):void 0===l[1]?c=-2:(c=n.lastIndex-l[2].length,a=l[1],n=void 0===l[3]?j:'"'===l[3]?L:z):n===L||n===z?n=j:n===H||n===D?n=N:(n=j,r=void 0);const d=n===j&&t[e+1].startsWith("/>")?" ":"";o+=n===N?i+k:c>=0?(s.push(a),i.slice(0,c)+P+i.slice(c)+S+d):i+S+(-2===c?e:d)}return[J(t,o+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class Z{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let r=0,o=0;const n=t.length-1,a=this.parts,[l,c]=K(t,e);if(this.el=Z.createElement(l,i),X.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=X.nextNode())&&a.length<n;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(P)){const e=c[o++],i=s.getAttribute(t).split(S),n=/([.?@])?(.*)/.exec(e);a.push({type:1,index:r,name:n[2],strings:i,ctor:"."===n[1]?st:"?"===n[1]?rt:"@"===n[1]?ot:it}),s.removeAttribute(t)}else t.startsWith(S)&&(a.push({type:6,index:r}),s.removeAttribute(t));if(B.test(s.tagName)){const t=s.textContent.split(S),e=t.length-1;if(e>0){s.textContent=w?w.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],O()),X.nextNode(),a.push({type:2,index:++r});s.append(t[e],O())}}}else if(8===s.nodeType)if(s.data===I)a.push({type:2,index:r});else{let t=-1;for(;-1!==(t=s.data.indexOf(S,t+1));)a.push({type:7,index:r}),t+=S.length-1}r++}}static createElement(t,e){const i=M.createElement("template");return i.innerHTML=t,i}}function Q(t,e,i=t,s){if(e===F)return e;let r=void 0!==s?i._$Co?.[s]:i._$Cl;const o=U(e)?void 0:e._$litDirective$;return r?.constructor!==o&&(r?._$AO?.(!1),void 0===o?r=void 0:(r=new o(t),r._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=r:i._$Cl=r),void 0!==r&&(e=Q(t,r._$AS(t,e.values),r,s)),e}class tt{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??M).importNode(e,!0);X.currentNode=s;let r=X.nextNode(),o=0,n=0,a=i[0];for(;void 0!==a;){if(o===a.index){let e;2===a.type?e=new et(r,r.nextSibling,this,t):1===a.type?e=new a.ctor(r,a.name,a.strings,this,t):6===a.type&&(e=new nt(r,this,t)),this._$AV.push(e),a=i[++n]}o!==a?.index&&(r=X.nextNode(),o++)}return X.currentNode=M,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class et{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=G,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Q(this,t,e),U(t)?t===G||null==t||""===t?(this._$AH!==G&&this._$AR(),this._$AH=G):t!==this._$AH&&t!==F&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>R(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==G&&U(this._$AH)?this._$AA.nextSibling.data=t:this.T(M.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=Z.createElement(J(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new tt(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=Y.get(t.strings);return void 0===e&&Y.set(t.strings,e=new Z(t)),e}k(t){R(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const r of t)s===e.length?e.push(i=new et(this.O(O()),this.O(O()),this,this.options)):i=e[s],i._$AI(r),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=C(t).nextSibling;C(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class it{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,r){this.type=1,this._$AH=G,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=G}_$AI(t,e=this,i,s){const r=this.strings;let o=!1;if(void 0===r)t=Q(this,t,e,0),o=!U(t)||t!==this._$AH&&t!==F,o&&(this._$AH=t);else{const s=t;let n,a;for(t=r[0],n=0;n<r.length-1;n++)a=Q(this,s[i+n],e,n),a===F&&(a=this._$AH[n]),o||=!U(a)||a!==this._$AH[n],a===G?t=G:t!==G&&(t+=(a??"")+r[n+1]),this._$AH[n]=a}o&&!s&&this.j(t)}j(t){t===G?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class st extends it{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===G?void 0:t}}class rt extends it{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==G)}}class ot extends it{constructor(t,e,i,s,r){super(t,e,i,s,r),this.type=5}_$AI(t,e=this){if((t=Q(this,t,e,0)??G)===F)return;const i=this._$AH,s=t===G&&i!==G||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==G&&(i===G||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class nt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Q(this,t)}}const at=A.litHtmlPolyfillSupport;at?.(Z,et),(A.litHtmlVersions??=[]).push("3.3.2");const lt=globalThis;class ct extends m{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let r=s._$litPart$;if(void 0===r){const t=i?.renderBefore??null;s._$litPart$=r=new et(e.insertBefore(O(),t),t,void 0,i??{})}return r._$AI(t),r})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return F}}ct._$litElement$=!0,ct.finalized=!0,lt.litElementHydrateSupport?.({LitElement:ct});const ht=lt.litElementPolyfillSupport;ht?.({LitElement:ct}),(lt.litElementVersions??=[]).push("4.2.2");const dt=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},pt={attribute:!0,type:String,converter:$,reflect:!1,hasChanged:x},ut=(t=pt,e,i)=>{const{kind:s,metadata:r}=i;let o=globalThis.litPropertyMetadata.get(r);if(void 0===o&&globalThis.litPropertyMetadata.set(r,o=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),o.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const r=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,r,t,!0,i)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const r=this[s];e.call(this,i),this.requestUpdate(s,r,t,!0,i)}}throw Error("Unsupported decorator location: "+s)};function gt(t){return(e,i)=>"object"==typeof i?ut(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function vt(t){return gt({...t,state:!0,attribute:!1})}function _t(t){return t.map(t=>({...t,controlPoints:t.controlPoints.map(t=>({...t}))}))}function ft(t,e,i){const[s,r]=t,[o,n]=e,a=o+(i-s)*(n-o)/(r-s);return Math.round(a)}function yt(t){const e=function(t){const e=new Map;e.set(0,0);for(const i of t)e.set(i.lightener,i.target);e.has(100)||e.set(100,100);const i=[];for(const[t,s]of e)i.push({lightener:t,target:s});return i.sort((t,e)=>t.lightener-e.lightener),i}(t),i=new Array(101);i[0]=0;for(let t=1;t<e.length;t++){const s=e[t-1],r=e[t];for(let t=s.lightener+1;t<=r.lightener;t++)i[t]=ft([s.lightener,r.lightener],[s.target,r.target],t)}return i}const $t=44,xt=12,bt=300,mt=200;function At(t){return $t+t/100*bt}function Ct(t){return xt+(1-t/100)*mt}function wt(t){return(t-$t)/bt*100}function Et(t){return 100*(1-(t-xt)/mt)}function Pt(t,e,i){return Math.max(e,Math.min(i,t))}let St=class extends ct{constructor(){super(...arguments),this.curves=[],this.selectedCurveId=null,this.readOnly=!1,this._dragCurveIdx=-1,this._dragPointIdx=-1,this._hoveredPoint=null,this._wasDragging=!1,this._svgRef=null}_getSvgCoords(t){const e=this._svgRef;if(!e)return null;const i=e.getScreenCTM();if(!i)return null;const s=i.inverse(),r=e.createSVGPoint();r.x=t.clientX,r.y=t.clientY;const o=r.matrixTransform(s);return{x:wt(o.x),y:Et(o.y)}}_isCurveInteractive(t){return!this.readOnly&&(null===this.selectedCurveId||this.curves[t]?.entityId===this.selectedCurveId)}_onPointerDown(t,e,i){this._isCurveInteractive(e)&&0!==i&&(t.preventDefault(),this._svgRef?.setPointerCapture(t.pointerId),this._dragCurveIdx=e,this._dragPointIdx=i)}_onPointerMove(t){if(this._dragCurveIdx<0)return;t.preventDefault();const e=this._getSvgCoords(t);if(!e)return;const i=Math.round(Pt(e.x,1,100)),s=Math.round(Pt(e.y,0,100));this.dispatchEvent(new CustomEvent("point-move",{detail:{curveIndex:this._dragCurveIdx,pointIndex:this._dragPointIdx,lightener:i,target:s},bubbles:!0,composed:!0}))}_onPointerUp(t){this._dragCurveIdx<0||(t.preventDefault(),this.dispatchEvent(new CustomEvent("point-drop",{detail:{curveIndex:this._dragCurveIdx,pointIndex:this._dragPointIdx},bubbles:!0,composed:!0})),this._dragCurveIdx=-1,this._dragPointIdx=-1,this._wasDragging=!0,setTimeout(()=>{this._wasDragging=!1},400))}_onPointContextMenu(t,e,i){t.preventDefault(),this.readOnly||this._isCurveInteractive(e)&&0!==i&&this.dispatchEvent(new CustomEvent("point-remove",{detail:{curveIndex:e,pointIndex:i},bubbles:!0,composed:!0}))}_onDblClick(t){if(this.readOnly)return;if(this._wasDragging)return;const e=this._svgRef;if(!e)return;const i=e.getScreenCTM();if(!i)return;const s=i.inverse(),r=e.createSVGPoint();r.x=t.clientX,r.y=t.clientY;const o=r.matrixTransform(s),n=Math.round(Pt(wt(o.x),1,100)),a=Math.round(Pt(Et(o.y),0,100));this.dispatchEvent(new CustomEvent("point-add",{detail:{lightener:n,target:a,entityId:this.selectedCurveId},bubbles:!0,composed:!0}))}_renderGrid(){return q`
      <!-- Diagonal reference line (1:1) -->
      <line class="diagonal-ref"
        x1="${At(0)}" y1="${Ct(0)}"
        x2="${At(100)}" y2="${Ct(100)}" />

      ${[0,25,50,75,100].map(t=>q`
        <!-- Vertical grid -->
        <line class="grid-line"
          x1="${At(t)}" y1="${Ct(0)}"
          x2="${At(t)}" y2="${Ct(100)}" />
        <!-- Horizontal grid -->
        <line class="grid-line"
          x1="${At(0)}" y1="${Ct(t)}"
          x2="${At(100)}" y2="${Ct(t)}" />
        <!-- X tick labels -->
        <text class="tick-label" text-anchor="middle"
          x="${At(t)}" y="${228}">${t}</text>
        <!-- Y tick labels -->
        <text class="tick-label" text-anchor="end" dominant-baseline="middle"
          x="${38}" y="${Ct(t)}">${t}</text>
      `)}

      <!-- Axis border lines -->
      <line class="axis-line"
        x1="${$t}" y1="${Ct(0)}"
        x2="${344}" y2="${Ct(0)}" />
      <line class="axis-line"
        x1="${$t}" y1="${Ct(0)}"
        x2="${$t}" y2="${Ct(100)}" />

      <!-- Axis labels -->
      <text class="axis-label" text-anchor="middle"
        x="${194}" y="${244}">Lightener %</text>
      <text class="axis-label" text-anchor="middle"
        transform="rotate(-90, 10, ${112})"
        x="10" y="${112}">Light %</text>
    `}_renderCrossHair(t){if(this._dragCurveIdx<0)return G;const e=t.controlPoints[this._dragPointIdx];if(!e)return G;const i=At(e.lightener),s=Ct(e.target);return q`
      <line class="crosshair"
        x1="${i}" y1="${s}"
        x2="${i}" y2="${Ct(0)}"
        stroke="${t.color}" opacity="0.5" />
      <line class="crosshair"
        x1="${i}" y1="${s}"
        x2="${$t}" y2="${s}"
        stroke="${t.color}" opacity="0.5" />
    `}_renderTooltip(t,e){const i=At(e.lightener),s=Ct(e.target),r=`${e.lightener}:${e.target}`,o=5*r.length,n=Pt(i-o/2-2,$t,344-o-8),a=Math.max(16,s-16);return q`
      <rect class="tooltip-bg"
        x="${n}" y="${a-8}"
        width="${o+8}" height="14" />
      <text class="tooltip-text" text-anchor="start"
        x="${n+4}" y="${a+2}">${r}</text>
    `}_renderCurve(t,e){if(!t.visible||!t.controlPoints.length)return G;const i=null===this.selectedCurveId||t.entityId===this.selectedCurveId,s=i&&!this.readOnly,r=yt(t.controlPoints).map((t,e)=>`${At(e)},${Ct(t)}`).join(" "),o=this._dragCurveIdx===e,n=t.color+"33",a=i?1:.35;let l=null;return o&&this._dragPointIdx>=0?l=t.controlPoints[this._dragPointIdx]:this._hoveredPoint?.curve===e&&s&&(l=t.controlPoints[this._hoveredPoint.point]),q`
      ${o?this._renderCrossHair(t):G}
      <polyline
        class="curve-line"
        points="${r}"
        stroke="${t.color}"
        style="opacity: ${a}"
      />
      ${s?t.controlPoints.map((i,s)=>{const r=0===i.lightener,a=o&&this._dragPointIdx===s,l=this._hoveredPoint?.curve===e&&this._hoveredPoint?.point===s;return q`
              <circle
                class="control-point ${r?"fixed":""} ${a?"dragging":""} ${l?"hovered":""}"
                cx="${At(i.lightener)}"
                cy="${Ct(i.target)}"
                r="6"
                fill="${n}"
                stroke="${t.color}"
                stroke-width="2"
                style="--glow-color: ${t.color}"
                @pointerdown=${t=>this._onPointerDown(t,e,s)}
                @contextmenu=${t=>this._onPointContextMenu(t,e,s)}
                @pointerenter=${()=>this._hoveredPoint={curve:e,point:s}}
                @pointerleave=${()=>this._hoveredPoint=null}
              />
            `}):G}
      ${null!==l?this._renderTooltip(t,l):G}
    `}firstUpdated(t){this._svgRef=this.renderRoot.querySelector("svg")}render(){return W`
      <svg
        viewBox="0 0 ${356} ${248}"
        preserveAspectRatio="xMidYMid meet"
        @pointermove=${this._onPointerMove}
        @pointerup=${this._onPointerUp}
        @dblclick=${this._onDblClick}
      >
        ${this._renderGrid()}

        <!-- Invisible hit area for double-click -->
        ${this.readOnly?G:W`<rect
              class="hit-area"
              x="${$t}"
              y="${xt}"
              width="${bt}"
              height="${mt}"
              pointer-events="all"
              fill="transparent"
            />`}

        ${this.curves.map((t,e)=>this._renderCurve(t,e))}

        ${this.readOnly||null===this.selectedCurveId?G:q`<text class="hint" text-anchor="end"
              x="${344}" y="${240}"
              >Double-click to add · Right-click to remove</text>`}
      </svg>
    `}};St.styles=n`
    :host {
      display: block;
    }
    svg {
      width: 100%;
      height: auto;
      display: block;
      border-radius: 8px;
      background: var(--graph-bg, #252525);
    }
    .grid-line {
      stroke: var(--secondary-text, #9e9e9e);
      stroke-width: 0.5;
      opacity: 0.15;
    }
    .axis-line {
      stroke: var(--secondary-text, #9e9e9e);
      stroke-width: 0.75;
      opacity: 0.4;
    }
    .axis-label {
      fill: var(--secondary-text, #9e9e9e);
      font-size: 9px;
      font-family: inherit;
    }
    .tick-label {
      fill: var(--secondary-text, #9e9e9e);
      font-size: 7.5px;
      font-family: inherit;
    }
    .curve-line {
      fill: none;
      stroke-width: 2;
      stroke-linecap: round;
      stroke-linejoin: round;
      transition: opacity 0.3s ease;
    }
    .control-point {
      cursor: grab;
      transition: r 0.15s ease, filter 0.15s ease;
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
      fill: var(--secondary-text, #9e9e9e);
      font-size: 7px;
      font-family: inherit;
      opacity: 0.6;
    }
    .diagonal-ref {
      stroke: var(--secondary-text, #9e9e9e);
      stroke-width: 0.75;
      opacity: 0.12;
      stroke-dasharray: 4 3;
    }
    .crosshair {
      stroke-width: 0.75;
      stroke-dasharray: 3 3;
    }
    .tooltip-bg {
      fill: rgba(0, 0, 0, 0.7);
      rx: 3;
      ry: 3;
    }
    .tooltip-text {
      fill: #ffffff;
      font-size: 9.5px;
      font-family: inherit;
    }
  `,t([gt({type:Array})],St.prototype,"curves",void 0),t([gt({type:String})],St.prototype,"selectedCurveId",void 0),t([gt({type:Boolean})],St.prototype,"readOnly",void 0),t([vt()],St.prototype,"_dragCurveIdx",void 0),t([vt()],St.prototype,"_dragPointIdx",void 0),t([vt()],St.prototype,"_hoveredPoint",void 0),St=t([dt("curve-graph")],St);let It=class extends ct{constructor(){super(...arguments),this.curves=[],this.selectedCurveId=null}_select(t){this.dispatchEvent(new CustomEvent("select-curve",{detail:{entityId:t},bubbles:!0,composed:!0}))}_toggle(t,e){t.stopPropagation(),this.dispatchEvent(new CustomEvent("toggle-curve",{detail:{entityId:e},bubbles:!0,composed:!0}))}render(){return W`
      <div class="legend">
        ${this.curves.map(t=>W`
            <div
              class="legend-item ${t.visible?"":"hidden"} ${this.selectedCurveId===t.entityId?"selected":""}"
              @click=${()=>this._select(t.entityId)}
              title="${t.friendlyName}"
              style="${this.selectedCurveId===t.entityId?`--selection-bg: ${t.color}25; --selection-border: ${t.color}`:""}"
            >
              <span
                class="color-dot"
                style="background: ${t.color}"
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
                @click=${e=>this._toggle(e,t.entityId)}
              >
                ${t.visible?W`
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    `:W`
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    `}
              </svg>
            </div>
          `)}
      </div>
    `}};It.styles=n`
    :host {
      display: block;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 16px;
      padding: 8px 0 0;
      max-height: 120px;
      overflow-y: auto;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      user-select: none;
      padding: 4px 8px;
      border-radius: 6px;
      transition: background 0.15s ease, opacity 0.2s ease;
      font-size: 13px;
      color: var(--text-color, #e1e1e1);
    }
    .legend-item:hover {
      background: rgba(255, 255, 255, 0.06);
    }
    .legend-item.hidden {
      opacity: 0.4;
    }
    .legend-item.selected {
      background: var(--selection-bg, rgba(255, 255, 255, 0.1));
      border-left: 3px solid var(--selection-border, currentColor);
      padding-left: 5px;
    }
    .color-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .eye-icon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      opacity: 0.6;
      transition: opacity 0.15s ease;
      padding: 4px;
      box-sizing: content-box;
    }
    .legend-item:hover .eye-icon {
      opacity: 1;
    }
    .name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 160px;
    }
  `,t([gt({type:Array})],It.prototype,"curves",void 0),t([gt({type:String})],It.prototype,"selectedCurveId",void 0),It=t([dt("curve-legend")],It);let kt=class extends ct{constructor(){super(...arguments),this.dirty=!1,this.readOnly=!1,this.saving=!1}_onSave(){this.dispatchEvent(new CustomEvent("save-curves",{bubbles:!0,composed:!0}))}_onCancel(){this.dispatchEvent(new CustomEvent("cancel-curves",{bubbles:!0,composed:!0}))}render(){return this.readOnly?W`
        <div class="footer">
          <div class="read-only">
            <svg class="lock-icon" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            View only
          </div>
        </div>
      `:this.dirty?W`
      <div class="footer">
        <span class="dirty-dot"></span>
        <button class="btn-cancel"
          @click=${this._onCancel}
          ?disabled=${this.saving}>Cancel</button>
        <button class="btn-save"
          @click=${this._onSave}
          ?disabled=${this.saving}>
          ${this.saving?"Saving...":"Save"}
        </button>
      </div>
    `:G}};kt.styles=n`
    :host {
      display: block;
    }
    .footer {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      padding: 8px 0 0;
      min-height: 36px;
    }
    .read-only {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--secondary-text, #9e9e9e);
      margin-right: auto;
    }
    .lock-icon {
      width: 14px;
      height: 14px;
      opacity: 0.6;
    }
    .dirty-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #ffa726;
      flex-shrink: 0;
    }
    button {
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      border: none;
      border-radius: 6px;
      padding: 6px 16px;
      cursor: pointer;
      transition: background 0.15s ease, opacity 0.15s ease;
    }
    button:disabled {
      opacity: 0.5;
      cursor: default;
    }
    .btn-save {
      background: var(--primary-color, #03a9f4);
      color: #fff;
    }
    .btn-save:hover:not(:disabled) {
      opacity: 0.9;
    }
    .btn-cancel {
      background: transparent;
      color: var(--secondary-text, #9e9e9e);
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.12));
    }
    .btn-cancel:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.06);
    }
  `,t([gt({type:Boolean})],kt.prototype,"dirty",void 0),t([gt({type:Boolean})],kt.prototype,"readOnly",void 0),t([gt({type:Boolean})],kt.prototype,"saving",void 0),kt=t([dt("curve-footer")],kt);const Mt=["#42a5f5","#ef5350","#66bb6a","#ffa726","#ab47bc","#26c6da","#ec407a","#9ccc65","#ffca28","#7e57c2"];let Ot=class extends ct{constructor(){super(...arguments),this._curves=[],this._originalCurves=[],this._config={},this._selectedCurveId=null,this._saving=!1,this._loadError=null,this._saveError=null,this._hass=null,this._loaded=!1,this._loadedEntityId=void 0}setConfig(t){this._config=t,this._tryLoadCurves()}set hass(t){this._hass=t,this._tryLoadCurves()}getCardSize(){return 4}get _isAdmin(){return this._hass?.user?.is_admin??!1}get _entityId(){return this._config.entity}get _isDirty(){return!function(t,e){if(t.length!==e.length)return!1;for(let i=0;i<t.length;i++){const s=t[i].controlPoints,r=e[i].controlPoints;if(s.length!==r.length)return!1;for(let t=0;t<s.length;t++){if(s[t].lightener!==r[t].lightener)return!1;if(s[t].target!==r[t].target)return!1}}return!0}(this._curves,this._originalCurves)}connectedCallback(){super.connectedCallback(),this._loaded=!1,this._loadedEntityId=void 0,this._tryLoadCurves()}async _tryLoadCurves(){if(!this._loaded||this._loadedEntityId!==this._entityId)if(this._hass&&this._entityId){this._loadError=null;try{const s=await this._hass.callWS({type:"lightener/get_curves",entity_id:this._entityId}),r=(t=s.entities,e=this._hass.states,i=Mt,Object.keys(t).map((s,r)=>{const o=t[s]?.brightness??{},n=[{lightener:0,target:0}];for(const[t,e]of Object.entries(o)){const i=Number(t),s=Number(e);Number.isFinite(i)&&Number.isFinite(s)&&n.push({lightener:i,target:s})}n.sort((t,e)=>t.lightener-e.lightener);const a=e[s]?.attributes?.friendly_name??s.replace("light.","");return{entityId:s,friendlyName:a,controlPoints:n,visible:!0,color:i[r%i.length]}}));this._curves=r,this._originalCurves=_t(r),this._loaded=!0,this._loadedEntityId=this._entityId}catch(t){console.error("[Lightener] Failed to load curves:",t),this._loadError=String(t)}var t,e,i}else if(0===this._curves.length){const t=[{entityId:"light.ceiling_light",friendlyName:"Ceiling Light",controlPoints:[{lightener:0,target:0},{lightener:20,target:0},{lightener:60,target:80},{lightener:100,target:100}],visible:!0,color:Mt[0]},{entityId:"light.sofa_lamp",friendlyName:"Sofa Lamp",controlPoints:[{lightener:0,target:0},{lightener:10,target:50},{lightener:40,target:100},{lightener:70,target:100},{lightener:100,target:60}],visible:!0,color:Mt[1]},{entityId:"light.led_strip",friendlyName:"LED Strip",controlPoints:[{lightener:0,target:0},{lightener:1,target:1},{lightener:100,target:100}],visible:!0,color:Mt[2]}];this._curves=t,this._originalCurves=_t(t)}}_onSelectCurve(t){const{entityId:e}=t.detail,i=this._curves.find(t=>t.entityId===e);i&&!i.visible||(this._selectedCurveId=this._selectedCurveId===e?null:e)}_onPointMove(t){const{curveIndex:e,pointIndex:i,lightener:s,target:r}=t.detail,o=[...this._curves],n={...o[e]},a=[...n.controlPoints];a[i]={lightener:s,target:r},n.controlPoints=a,o[e]=n,this._curves=o}_onPointDrop(t){}_onPointAdd(t){const{lightener:e,target:i,entityId:s}=t.detail,r=s??this._selectedCurveId;if(!r)return;const o=this._curves.findIndex(t=>t.entityId===r);if(o<0)return;if(this._curves[o].controlPoints.some(t=>t.lightener===e))return;const n=[...this._curves],a={...n[o]},l=[...a.controlPoints,{lightener:e,target:i}];l.sort((t,e)=>t.lightener-e.lightener),a.controlPoints=l,n[o]=a,this._curves=n}_onPointRemove(t){const{curveIndex:e,pointIndex:i}=t.detail,s=this._curves[e];if(!s)return;if(s.controlPoints.length<=2)return;const r=[...this._curves],o={...r[e]};o.controlPoints=o.controlPoints.filter((t,e)=>e!==i),r[e]=o,this._curves=r}_onToggleCurve(t){const{entityId:e}=t.detail,i=this._curves.map(t=>t.entityId===e?{...t,visible:!t.visible}:t);if(this._curves=i,this._selectedCurveId===e){const t=i.find(t=>t.entityId===e);t&&!t.visible&&(this._selectedCurveId=null)}}async _onSave(){if(this._hass&&this._entityId&&!this._saving){this._saving=!0,this._saveError=null;try{const t=function(t){const e={};for(const i of t){const t={};for(const e of i.controlPoints)0!==e.lightener&&(t[String(e.lightener)]=String(e.target));e[i.entityId]={brightness:t}}return e}(this._curves);await this._hass.callWS({type:"lightener/save_curves",entity_id:this._entityId,curves:t}),this._originalCurves=_t(this._curves)}catch(t){console.error("[Lightener] Failed to save curves:",t),this._saveError="Save failed. Check connection."}finally{this._saving=!1}}}_onCancel(){this._curves=_t(this._originalCurves),this._selectedCurveId=null}render(){return W`
      <div class="card">
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
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
          <h2>Brightness Curves</h2>
        </div>

        <div class="graph-container">
          <curve-graph
            .curves=${this._curves}
            .selectedCurveId=${this._selectedCurveId}
            .readOnly=${!this._isAdmin}
            @point-move=${this._onPointMove}
            @point-drop=${this._onPointDrop}
            @point-add=${this._onPointAdd}
            @point-remove=${this._onPointRemove}
          ></curve-graph>
        </div>

        <div class="divider"></div>

        <curve-legend
          .curves=${this._curves}
          .selectedCurveId=${this._selectedCurveId}
          @select-curve=${this._onSelectCurve}
          @toggle-curve=${this._onToggleCurve}
        ></curve-legend>

        <curve-footer
          .dirty=${this._isDirty}
          .readOnly=${!this._isAdmin}
          .saving=${this._saving}
          @save-curves=${this._onSave}
          @cancel-curves=${this._onCancel}
        ></curve-footer>

        ${this._loadError?W`<div class="error">Failed to load curves</div>`:""}
        ${this._saveError?W`<div class="error">${this._saveError}</div>`:""}
      </div>
    `}};Ot.styles=n`
    :host {
      --card-bg: var(--ha-card-background, #1c1c1c);
      --text-color: var(--primary-text-color, #e1e1e1);
      --secondary-text: var(--secondary-text-color, #9e9e9e);
      --divider: var(--divider-color, rgba(255, 255, 255, 0.12));
      --graph-bg: var(--card-background-color, #252525);

      display: block;
      font-family: var(--paper-font-body1_-_font-family, "Roboto", sans-serif);
    }
    .card {
      background: var(--card-bg);
      border-radius: var(--ha-card-border-radius, 12px);
      box-shadow: var(
        --ha-card-box-shadow,
        0 2px 6px rgba(0, 0, 0, 0.3)
      );
      padding: 16px;
      color: var(--text-color);
    }
    .header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
    }
    .header-icon {
      width: 20px;
      height: 20px;
      opacity: 0.7;
    }
    h2 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      letter-spacing: 0.01em;
    }
    .graph-container {
      border-radius: 8px;
      overflow: hidden;
    }
    .divider {
      height: 1px;
      background: var(--divider);
      margin: 12px 0 4px;
    }
    .error {
      font-size: 12px;
      color: #ef5350;
      padding: 8px 0 0;
      text-align: center;
    }
  `,t([vt()],Ot.prototype,"_curves",void 0),t([vt()],Ot.prototype,"_originalCurves",void 0),t([vt()],Ot.prototype,"_config",void 0),t([vt()],Ot.prototype,"_selectedCurveId",void 0),t([vt()],Ot.prototype,"_saving",void 0),t([vt()],Ot.prototype,"_loadError",void 0),t([vt()],Ot.prototype,"_saveError",void 0),t([vt()],Ot.prototype,"_hass",void 0),Ot=t([dt("lightener-curve-card")],Ot);export{Ot as LightenerCurveCard};
