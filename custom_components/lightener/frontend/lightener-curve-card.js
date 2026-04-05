function t(t,e,i,r){var s,o=arguments.length,n=o<3?e:null===r?r=Object.getOwnPropertyDescriptor(e,i):r;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(t,e,i,r);else for(var a=t.length-1;a>=0;a--)(s=t[a])&&(n=(o<3?s(n):o>3?s(e,i,n):s(e,i))||n);return o>3&&n&&Object.defineProperty(e,i,n),n}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,r=Symbol(),s=new WeakMap;let o=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==r)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=s.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&s.set(e,t))}return t}toString(){return this.cssText}};const n=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,r)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[r+1],t[0]);return new o(i,t,r)},a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new o("string"==typeof t?t:t+"",void 0,r))(e)})(t):t,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,g=globalThis,v=g.trustedTypes,f=v?v.emptyScript:"",y=g.reactiveElementPolyfillSupport,_=(t,e)=>t,x={toAttribute(t,e){switch(e){case Boolean:t=t?f:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},b=(t,e)=>!l(t,e),$={attribute:!0,type:String,converter:x,reflect:!1,useDefault:!1,hasChanged:b};Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;let m=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=$){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),r=this.getPropertyDescriptor(t,i,e);void 0!==r&&d(this.prototype,t,r)}}static getPropertyDescriptor(t,e,i){const{get:r,set:s}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:r,set(e){const o=r?.call(this);s?.call(this,e),this.requestUpdate(t,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??$}static _$Ei(){if(this.hasOwnProperty(_("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(_("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(_("properties"))){const t=this.properties,e=[...h(t),...p(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,r)=>{if(i)t.adoptedStyleSheets=r.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of r){const r=document.createElement("style"),s=e.litNonce;void 0!==s&&r.setAttribute("nonce",s),r.textContent=i.cssText,t.appendChild(r)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),r=this.constructor._$Eu(t,i);if(void 0!==r&&!0===i.reflect){const s=(void 0!==i.converter?.toAttribute?i.converter:x).toAttribute(e,i.type);this._$Em=t,null==s?this.removeAttribute(r):this.setAttribute(r,s),this._$Em=null}}_$AK(t,e){const i=this.constructor,r=i._$Eh.get(t);if(void 0!==r&&this._$Em!==r){const t=i.getPropertyOptions(r),s="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:x;this._$Em=r;const o=s.fromAttribute(e,t.type);this[r]=o??this._$Ej?.get(r)??o,this._$Em=null}}requestUpdate(t,e,i,r=!1,s){if(void 0!==t){const o=this.constructor;if(!1===r&&(s=this[t]),i??=o.getPropertyOptions(t),!((i.hasChanged??b)(s,e)||i.useDefault&&i.reflect&&s===this._$Ej?.get(t)&&!this.hasAttribute(o._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:r,wrapped:s},o){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,o??e??this[t]),!0!==s||void 0!==o)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===r&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,r=this[e];!0!==t||this._$AL.has(e)||void 0===r||this.C(e,void 0,i,r)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};m.elementStyles=[],m.shadowRootOptions={mode:"open"},m[_("elementProperties")]=new Map,m[_("finalized")]=new Map,y?.({ReactiveElement:m}),(g.reactiveElementVersions??=[]).push("2.1.2");const w=globalThis,C=t=>t,k=w.trustedTypes,A=k?k.createPolicy("lit-html",{createHTML:t=>t}):void 0,P="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,S="?"+E,I=`<${S}>`,M=document,O=()=>M.createComment(""),D=t=>null===t||"object"!=typeof t&&"function"!=typeof t,U=Array.isArray,T="[ \t\n\f\r]",R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,H=/-->/g,N=/>/g,z=RegExp(`>|${T}(?:([^\\s"'>=/]+)(${T}*=${T}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),L=/'/g,B=/"/g,j=/^(?:script|style|textarea|title)$/i,K=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),V=K(1),q=K(2),W=Symbol.for("lit-noChange"),F=Symbol.for("lit-nothing"),G=new WeakMap,X=M.createTreeWalker(M,129);function Y(t,e){if(!U(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==A?A.createHTML(e):e}const Z=(t,e)=>{const i=t.length-1,r=[];let s,o=2===e?"<svg>":3===e?"<math>":"",n=R;for(let e=0;e<i;e++){const i=t[e];let a,l,d=-1,c=0;for(;c<i.length&&(n.lastIndex=c,l=n.exec(i),null!==l);)c=n.lastIndex,n===R?"!--"===l[1]?n=H:void 0!==l[1]?n=N:void 0!==l[2]?(j.test(l[2])&&(s=RegExp("</"+l[2],"g")),n=z):void 0!==l[3]&&(n=z):n===z?">"===l[0]?(n=s??R,d=-1):void 0===l[1]?d=-2:(d=n.lastIndex-l[2].length,a=l[1],n=void 0===l[3]?z:'"'===l[3]?B:L):n===B||n===L?n=z:n===H||n===N?n=R:(n=z,s=void 0);const h=n===z&&t[e+1].startsWith("/>")?" ":"";o+=n===R?i+I:d>=0?(r.push(a),i.slice(0,d)+P+i.slice(d)+E+h):i+E+(-2===d?e:h)}return[Y(t,o+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),r]};class J{constructor({strings:t,_$litType$:e},i){let r;this.parts=[];let s=0,o=0;const n=t.length-1,a=this.parts,[l,d]=Z(t,e);if(this.el=J.createElement(l,i),X.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(r=X.nextNode())&&a.length<n;){if(1===r.nodeType){if(r.hasAttributes())for(const t of r.getAttributeNames())if(t.endsWith(P)){const e=d[o++],i=r.getAttribute(t).split(E),n=/([.?@])?(.*)/.exec(e);a.push({type:1,index:s,name:n[2],strings:i,ctor:"."===n[1]?rt:"?"===n[1]?st:"@"===n[1]?ot:it}),r.removeAttribute(t)}else t.startsWith(E)&&(a.push({type:6,index:s}),r.removeAttribute(t));if(j.test(r.tagName)){const t=r.textContent.split(E),e=t.length-1;if(e>0){r.textContent=k?k.emptyScript:"";for(let i=0;i<e;i++)r.append(t[i],O()),X.nextNode(),a.push({type:2,index:++s});r.append(t[e],O())}}}else if(8===r.nodeType)if(r.data===S)a.push({type:2,index:s});else{let t=-1;for(;-1!==(t=r.data.indexOf(E,t+1));)a.push({type:7,index:s}),t+=E.length-1}s++}}static createElement(t,e){const i=M.createElement("template");return i.innerHTML=t,i}}function Q(t,e,i=t,r){if(e===W)return e;let s=void 0!==r?i._$Co?.[r]:i._$Cl;const o=D(e)?void 0:e._$litDirective$;return s?.constructor!==o&&(s?._$AO?.(!1),void 0===o?s=void 0:(s=new o(t),s._$AT(t,i,r)),void 0!==r?(i._$Co??=[])[r]=s:i._$Cl=s),void 0!==s&&(e=Q(t,s._$AS(t,e.values),s,r)),e}class tt{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,r=(t?.creationScope??M).importNode(e,!0);X.currentNode=r;let s=X.nextNode(),o=0,n=0,a=i[0];for(;void 0!==a;){if(o===a.index){let e;2===a.type?e=new et(s,s.nextSibling,this,t):1===a.type?e=new a.ctor(s,a.name,a.strings,this,t):6===a.type&&(e=new nt(s,this,t)),this._$AV.push(e),a=i[++n]}o!==a?.index&&(s=X.nextNode(),o++)}return X.currentNode=M,r}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class et{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,r){this.type=2,this._$AH=F,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=r,this._$Cv=r?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Q(this,t,e),D(t)?t===F||null==t||""===t?(this._$AH!==F&&this._$AR(),this._$AH=F):t!==this._$AH&&t!==W&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>U(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==F&&D(this._$AH)?this._$AA.nextSibling.data=t:this.T(M.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,r="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=J.createElement(Y(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===r)this._$AH.p(e);else{const t=new tt(r,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=G.get(t.strings);return void 0===e&&G.set(t.strings,e=new J(t)),e}k(t){U(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,r=0;for(const s of t)r===e.length?e.push(i=new et(this.O(O()),this.O(O()),this,this.options)):i=e[r],i._$AI(s),r++;r<e.length&&(this._$AR(i&&i._$AB.nextSibling,r),e.length=r)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=C(t).nextSibling;C(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class it{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,r,s){this.type=1,this._$AH=F,this._$AN=void 0,this.element=t,this.name=e,this._$AM=r,this.options=s,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=F}_$AI(t,e=this,i,r){const s=this.strings;let o=!1;if(void 0===s)t=Q(this,t,e,0),o=!D(t)||t!==this._$AH&&t!==W,o&&(this._$AH=t);else{const r=t;let n,a;for(t=s[0],n=0;n<s.length-1;n++)a=Q(this,r[i+n],e,n),a===W&&(a=this._$AH[n]),o||=!D(a)||a!==this._$AH[n],a===F?t=F:t!==F&&(t+=(a??"")+s[n+1]),this._$AH[n]=a}o&&!r&&this.j(t)}j(t){t===F?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class rt extends it{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===F?void 0:t}}class st extends it{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==F)}}class ot extends it{constructor(t,e,i,r,s){super(t,e,i,r,s),this.type=5}_$AI(t,e=this){if((t=Q(this,t,e,0)??F)===W)return;const i=this._$AH,r=t===F&&i!==F||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,s=t!==F&&(i===F||r);r&&this.element.removeEventListener(this.name,this,i),s&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class nt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Q(this,t)}}const at=w.litHtmlPolyfillSupport;at?.(J,et),(w.litHtmlVersions??=[]).push("3.3.2");const lt=globalThis;class dt extends m{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const r=i?.renderBefore??e;let s=r._$litPart$;if(void 0===s){const t=i?.renderBefore??null;r._$litPart$=s=new et(e.insertBefore(O(),t),t,void 0,i??{})}return s._$AI(t),s})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return W}}dt._$litElement$=!0,dt.finalized=!0,lt.litElementHydrateSupport?.({LitElement:dt});const ct=lt.litElementPolyfillSupport;ct?.({LitElement:dt}),(lt.litElementVersions??=[]).push("4.2.2");const ht=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},pt={attribute:!0,type:String,converter:x,reflect:!1,hasChanged:b},ut=(t=pt,e,i)=>{const{kind:r,metadata:s}=i;let o=globalThis.litPropertyMetadata.get(s);if(void 0===o&&globalThis.litPropertyMetadata.set(s,o=new Map),"setter"===r&&((t=Object.create(t)).wrapped=!0),o.set(i.name,t),"accessor"===r){const{name:r}=i;return{set(i){const s=e.get.call(this);e.set.call(this,i),this.requestUpdate(r,s,t,!0,i)},init(e){return void 0!==e&&this.C(r,void 0,t,e),e}}}if("setter"===r){const{name:r}=i;return function(i){const s=this[r];e.call(this,i),this.requestUpdate(r,s,t,!0,i)}}throw Error("Unsupported decorator location: "+r)};function gt(t){return(e,i)=>"object"==typeof i?ut(t,e,i):((t,e,i)=>{const r=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),r?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function vt(t){return gt({...t,state:!0,attribute:!1})}function ft(t){return t.map(t=>({...t,controlPoints:t.controlPoints.map(t=>({...t}))}))}const yt=44,_t=12,xt=300,bt=200;function $t(t){return yt+t/100*xt}function mt(t){return _t+(1-t/100)*bt}function wt(t){return(t-yt)/xt*100}function Ct(t){return 100*(1-(t-_t)/bt)}function kt(t,e,i){return Math.max(e,Math.min(i,t))}let At=class extends dt{constructor(){super(...arguments),this.curves=[],this.selectedCurveId=null,this.readOnly=!1,this._dragCurveIdx=-1,this._dragPointIdx=-1,this._hoveredPoint=null,this._wasDragging=!1,this._svgRef=null}_getSvgCoords(t){const e=this._svgRef;if(!e)return null;const i=e.getScreenCTM();if(!i)return null;const r=i.inverse(),s=e.createSVGPoint();s.x=t.clientX,s.y=t.clientY;const o=s.matrixTransform(r);return{x:wt(o.x),y:Ct(o.y)}}_isCurveInteractive(t){return!this.readOnly&&(null===this.selectedCurveId||this.curves[t]?.entityId===this.selectedCurveId)}_onPointerDown(t,e,i){0===t.button&&this._isCurveInteractive(e)&&0!==i&&(t.preventDefault(),this._svgRef?.setPointerCapture(t.pointerId),this._dragCurveIdx=e,this._dragPointIdx=i)}_onPointerMove(t){if(this._dragCurveIdx<0)return;t.preventDefault();const e=this._getSvgCoords(t);if(!e)return;const i=this.curves[this._dragCurveIdx],r=i?.controlPoints??[],s=this._dragPointIdx>0?r[this._dragPointIdx-1].lightener+1:1,o=this._dragPointIdx<r.length-1?r[this._dragPointIdx+1].lightener-1:100,n=Math.round(kt(e.x,s,o)),a=Math.round(kt(e.y,0,100));this.dispatchEvent(new CustomEvent("point-move",{detail:{curveIndex:this._dragCurveIdx,pointIndex:this._dragPointIdx,lightener:n,target:a},bubbles:!0,composed:!0}))}_onPointerUp(t){this._dragCurveIdx<0||(t.preventDefault(),this.dispatchEvent(new CustomEvent("point-drop",{detail:{curveIndex:this._dragCurveIdx,pointIndex:this._dragPointIdx},bubbles:!0,composed:!0})),this._dragCurveIdx=-1,this._dragPointIdx=-1,this._wasDragging=!0,setTimeout(()=>{this._wasDragging=!1},400))}_onPointContextMenu(t,e,i){t.preventDefault(),t.stopPropagation(),this.readOnly||this._isCurveInteractive(e)&&0!==i&&this.dispatchEvent(new CustomEvent("point-remove",{detail:{curveIndex:e,pointIndex:i},bubbles:!0,composed:!0}))}_onDblClick(t){if(this.readOnly)return;if(this._wasDragging)return;const e=this._svgRef;if(!e)return;const i=e.getScreenCTM();if(!i)return;const r=i.inverse(),s=e.createSVGPoint();s.x=t.clientX,s.y=t.clientY;const o=s.matrixTransform(r),n=Math.round(kt(wt(o.x),1,100)),a=Math.round(kt(Ct(o.y),0,100));this.dispatchEvent(new CustomEvent("point-add",{detail:{lightener:n,target:a,entityId:this.selectedCurveId},bubbles:!0,composed:!0}))}_renderGrid(){return q`
      <!-- Diagonal reference line (1:1) -->
      <line class="diagonal-ref"
        x1="${$t(0)}" y1="${mt(0)}"
        x2="${$t(100)}" y2="${mt(100)}" />

      ${[0,25,50,75,100].map(t=>q`
        <!-- Vertical grid -->
        <line class="grid-line"
          x1="${$t(t)}" y1="${mt(0)}"
          x2="${$t(t)}" y2="${mt(100)}" />
        <!-- Horizontal grid -->
        <line class="grid-line"
          x1="${$t(0)}" y1="${mt(t)}"
          x2="${$t(100)}" y2="${mt(t)}" />
        <!-- X tick labels -->
        <text class="tick-label" text-anchor="middle"
          x="${$t(t)}" y="${228}">${t}</text>
        <!-- Y tick labels -->
        <text class="tick-label" text-anchor="end" dominant-baseline="middle"
          x="${38}" y="${mt(t)}">${t}</text>
      `)}

      <!-- Axis border lines -->
      <line class="axis-line"
        x1="${yt}" y1="${mt(0)}"
        x2="${344}" y2="${mt(0)}" />
      <line class="axis-line"
        x1="${yt}" y1="${mt(0)}"
        x2="${yt}" y2="${mt(100)}" />

      <!-- Axis labels -->
      <text class="axis-label" text-anchor="middle"
        x="${194}" y="${244}">Group brightness</text>
      <text class="axis-label" text-anchor="middle"
        transform="rotate(-90, 10, ${112})"
        x="10" y="${112}">Light brightness</text>
    `}_renderCrossHair(t){if(this._dragCurveIdx<0)return F;const e=t.controlPoints[this._dragPointIdx];if(!e)return F;const i=$t(e.lightener),r=mt(e.target);return q`
      <line class="crosshair"
        x1="${i}" y1="${r}"
        x2="${i}" y2="${mt(0)}"
        stroke="${t.color}" opacity="0.5" />
      <line class="crosshair"
        x1="${i}" y1="${r}"
        x2="${yt}" y2="${r}"
        stroke="${t.color}" opacity="0.5" />
    `}_renderTooltip(t,e){const i=$t(e.lightener),r=mt(e.target),s=`${e.lightener}:${e.target}`,o=5*s.length,n=kt(i-o/2-2,yt,344-o-8),a=Math.max(16,r-16);return q`
      <rect class="tooltip-bg"
        x="${n}" y="${a-8}"
        width="${o+8}" height="14" />
      <text class="tooltip-text" text-anchor="start"
        x="${n+4}" y="${a+2}">${s}</text>
    `}_renderCurve(t,e){if(!t.visible||!t.controlPoints.length)return F;try{const i=null===this.selectedCurveId||t.entityId===this.selectedCurveId,r=this._isCurveInteractive(e)&&!this.readOnly,s=t.controlPoints.slice().sort((t,e)=>t.lightener-e.lightener);s.length&&0===s[0].lightener||s.unshift({lightener:0,target:0}),100!==s[s.length-1].lightener&&s.push({lightener:100,target:100});const o=function(t){if(t.length<2)return"";if(2===t.length)return`M${t[0].x},${t[0].y} L${t[1].x},${t[1].y}`;const e=t.length,i=[],r=[],s=[];for(let o=0;o<e-1;o++)i.push(t[o+1].x-t[o].x),r.push(t[o+1].y-t[o].y),s.push(r[o]/(i[o]||1));const o=new Array(e);o[0]=s[0],o[e-1]=s[e-2];for(let t=1;t<e-1;t++)o[t]=(s[t-1]+s[t])/2;let n=`M${t[0].x},${t[0].y}`;for(let r=0;r<e-1;r++){const e=i[r]/3;n+=` C${t[r].x+e},${t[r].y+o[r]*e} ${t[r+1].x-e},${t[r+1].y-o[r+1]*e} ${t[r+1].x},${t[r+1].y}`}return n}(s.map(t=>({x:$t(t.lightener),y:mt(t.target)}))),n=o+` L${$t(s[s.length-1].lightener)},${mt(0)}`+` L${$t(0)},${mt(0)} Z`,a=`grad-${e}`,l=["","8 4","4 4","12 4 4 4","2 4"],d=l[e%l.length],c=this._dragCurveIdx===e,h=t.color+"33",p=i?1:.35;let u=null;return c&&this._dragPointIdx>=0?u=t.controlPoints[this._dragPointIdx]:this._hoveredPoint?.curve===e&&r&&(u=t.controlPoints[this._hoveredPoint.point]),q`
      <defs>
        <linearGradient id="${a}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${t.color}" stop-opacity="${i?.25:.08}" />
          <stop offset="100%" stop-color="${t.color}" stop-opacity="0" />
        </linearGradient>
      </defs>
      ${c?this._renderCrossHair(t):F}
      <path
        d="${n}"
        fill="url(#${a})"
        style="opacity: ${p}"
        pointer-events="none"
      />
      <path
        class="curve-line"
        d="${o}"
        stroke="${t.color}"
        stroke-dasharray="${d}"
        style="opacity: ${p}"
        pointer-events="none"
      />
      ${r?t.controlPoints.map((i,r)=>{const s=0===i.lightener,o=c&&this._dragPointIdx===r,n=this._hoveredPoint?.curve===e&&this._hoveredPoint?.point===r;return q`
              <circle
                class="hit-circle"
                cx="${$t(i.lightener)}"
                cy="${mt(i.target)}"
                r="20"
                fill="transparent"
                pointer-events="all"
                @pointerdown=${t=>this._onPointerDown(t,e,r)}
                @contextmenu=${t=>this._onPointContextMenu(t,e,r)}
                @pointerenter=${()=>this._hoveredPoint={curve:e,point:r}}
                @pointerleave=${()=>this._hoveredPoint=null}
              />
              <circle
                class="control-point ${s?"fixed":""} ${o?"dragging":""} ${n?"hovered":""}"
                cx="${$t(i.lightener)}"
                cy="${mt(i.target)}"
                r="6"
                fill="${h}"
                stroke="${t.color}"
                stroke-width="2"
                style="--glow-color: ${t.color}"
                pointer-events="none"
              />
            `}):F}
      ${null!==u?this._renderTooltip(t,u):F}
    `}catch{return F}}firstUpdated(t){this._svgRef=this.renderRoot.querySelector("svg")}render(){return V`
      <svg
        viewBox="0 0 ${356} ${248}"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Brightness curve editor graph"
        @pointermove=${this._onPointerMove}
        @pointerup=${this._onPointerUp}
        @dblclick=${this._onDblClick}
        @contextmenu=${t=>{this.readOnly||t.preventDefault()}}
      >
        ${this._renderGrid()}

        <!-- Invisible hit area for double-click -->
        ${this.readOnly?F:V`<rect
              class="hit-area"
              x="${yt}"
              y="${_t}"
              width="${xt}"
              height="${bt}"
              pointer-events="all"
              fill="transparent"
            />`}
        ${(()=>{const t=this.selectedCurveId?this.curves.findIndex(t=>t.entityId===this.selectedCurveId):-1,e=t>0?[...this.curves.slice(0,t).map((t,e)=>({curve:t,idx:e})),...this.curves.slice(t+1).map((e,i)=>({curve:e,idx:t+1+i})),{curve:this.curves[t],idx:t}]:this.curves.map((t,e)=>({curve:t,idx:e}));return e.map(({curve:t,idx:e})=>this._renderCurve(t,e))})()}
        ${(()=>{if(this.readOnly)return F;if(null===this.selectedCurveId)return q`<text class="hint hint-select" text-anchor="middle"
                x="${194}" y="${112}"
                >Select a light below to start editing</text>`;const t=this.curves.find(t=>t.entityId===this.selectedCurveId);return q`
              <text class="editing-label"
                x="${50}" y="${26}"
                fill="${t?.color??"currentColor"}"
                >Editing: ${t?.friendlyName??""}</text>
              <text class="hint" text-anchor="end"
                x="${340}" y="${206}"
                >Double-click to add · Right-click to remove</text>`})()}
      </svg>
    `}};function Pt(t,e,i){const[r,s]=t,[o,n]=e;return o+(i-r)*(n-o)/(s-r)}function Et(t){const e=function(t){const e=new Map;e.set(0,0);for(const i of t)e.set(i.lightener,i.target);e.has(100)||e.set(100,100);const i=[];for(const[t,r]of e)i.push({lightener:t,target:r});return i.sort((t,e)=>t.lightener-e.lightener),i}(t),i=new Array(101).fill(0);i[0]=0;for(let t=1;t<e.length;t++){const r=e[t-1],s=e[t];for(let t=r.lightener+1;t<=s.lightener;t++)i[t]=Pt([r.lightener,s.lightener],[r.target,s.target],t)}return i}At.styles=n`
    :host {
      display: block;
    }
    svg {
      width: 100%;
      height: auto;
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
  `,t([gt({type:Array})],At.prototype,"curves",void 0),t([gt({type:String})],At.prototype,"selectedCurveId",void 0),t([gt({type:Boolean})],At.prototype,"readOnly",void 0),t([vt()],At.prototype,"_dragCurveIdx",void 0),t([vt()],At.prototype,"_dragPointIdx",void 0),t([vt()],At.prototype,"_hoveredPoint",void 0),At=t([ht("curve-graph")],At);let St=class extends dt{constructor(){super(...arguments),this.curves=[],this.readOnly=!1,this._position=50,this._dragging=!1,this._trackRef=null}_getInterpolatedValues(){const t=Math.round(this._position);return this.curves.filter(t=>t.visible).map(e=>{const i=Et(e.controlPoints);return{entityId:e.entityId,name:e.friendlyName,color:e.color,value:Math.round(i[t]??0)}})}_onPointerDown(t){this.readOnly||(t.preventDefault(),this._dragging=!0,t.target.setPointerCapture(t.pointerId),this._updatePosition(t))}_onPointerMove(t){this._dragging&&(t.preventDefault(),this._updatePosition(t))}_onPointerUp(){this._dragging=!1}_onTrackClick(t){this.readOnly||this._updatePositionFromClient(t.clientX)}_onKeyDown(t){if(this.readOnly)return;const e=t.shiftKey?10:1;"ArrowRight"===t.key||"ArrowUp"===t.key?(t.preventDefault(),this._position=Math.min(100,this._position+e)):"ArrowLeft"===t.key||"ArrowDown"===t.key?(t.preventDefault(),this._position=Math.max(0,this._position-e)):"Home"===t.key?(t.preventDefault(),this._position=0):"End"===t.key&&(t.preventDefault(),this._position=100)}_updatePosition(t){this._updatePositionFromClient(t.clientX)}_updatePositionFromClient(t){const e=this._trackRef;if(!e)return;const i=e.getBoundingClientRect(),r=(t-i.left)/i.width*100;this._position=Math.max(0,Math.min(100,r))}firstUpdated(){this._trackRef=this.renderRoot.querySelector(".track-area")}render(){const t=this._getInterpolatedValues(),e=Math.round(this._position);return V`
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
          ${t.map(t=>V`
              <div class="badge">
                <span class="badge-dot" style="background: ${t.color}"></span>
                <span style="color: ${t.color}">${t.value}%</span>
                <span class="badge-name">${t.name}</span>
              </div>
            `)}
        </div>
      </div>
    `}};var It;St.styles=n`
    :host {
      display: block;
    }
    .scrubber-panel {
      border-radius: 12px;
      padding: 14px 16px 12px;
      margin-bottom: 12px;
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
    }
    .track-bg {
      position: absolute;
      top: 12px;
      left: 0;
      right: 0;
      height: 4px;
      border-radius: 2px;
      background: var(--divider-color, rgba(127, 127, 127, 0.15));
    }
    .track-fill {
      position: absolute;
      top: 12px;
      left: 0;
      height: 4px;
      border-radius: 2px;
      background: linear-gradient(90deg, rgba(37, 99, 235, 0.15), #2563eb);
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
  `,t([gt({type:Array})],St.prototype,"curves",void 0),t([gt({type:Boolean})],St.prototype,"readOnly",void 0),t([vt()],St.prototype,"_position",void 0),St=t([ht("curve-scrubber")],St);let Mt=It=class extends dt{constructor(){super(...arguments),this.curves=[],this.selectedCurveId=null}_select(t){this.dispatchEvent(new CustomEvent("select-curve",{detail:{entityId:t},bubbles:!0,composed:!0}))}_toggle(t,e){t.stopPropagation(),this.dispatchEvent(new CustomEvent("toggle-curve",{detail:{entityId:e},bubbles:!0,composed:!0}))}_onItemKeyDown(t,e){if("Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._select(e)),"ArrowDown"===t.key||"ArrowUp"===t.key){t.preventDefault();const e=[...this.renderRoot.querySelectorAll(".legend-item")],i=e.indexOf(t.currentTarget),r="ArrowDown"===t.key?i+1:i-1;e[r]?.focus()}}_onToggleKeyDown(t,e){"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._toggle(t,e))}render(){return V`
      <div class="legend-panel">
        <div class="legend" role="listbox" aria-label="Light curves">
          ${this.curves.map((t,e)=>V`
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
                  class="color-dot shape-${It._shapes[e%It._shapes.length]}"
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
                  @click=${e=>this._toggle(e,t.entityId)}
                  @keydown=${e=>this._onToggleKeyDown(e,t.entityId)}
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
              </div>
            `)}
        </div>
      </div>
    `}};Mt.styles=n`
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
      max-height: 140px;
      overflow-y: auto;
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
      .legend {
        max-height: 160px;
      }
    }
  `,Mt._shapes=["circle","square","diamond","triangle","bar"],t([gt({type:Array})],Mt.prototype,"curves",void 0),t([gt({type:String})],Mt.prototype,"selectedCurveId",void 0),Mt=It=t([ht("curve-legend")],Mt);let Ot=class extends dt{constructor(){super(...arguments),this.dirty=!1,this.readOnly=!1,this.saving=!1}_onSave(){this.dispatchEvent(new CustomEvent("save-curves",{bubbles:!0,composed:!0}))}_onCancel(){this.dispatchEvent(new CustomEvent("cancel-curves",{bubbles:!0,composed:!0}))}render(){return this.readOnly?V`
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
      `:this.dirty?V`
      <div class="footer">
        <span class="unsaved-label">Unsaved changes</span>
        <button
          class="btn-cancel"
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
    `:V`<div class="footer"></div>`}};Ot.styles=n`
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
    .btn-cancel {
      background: transparent;
      color: var(--secondary-text, #616161);
      border: 1px solid var(--divider, rgba(127, 127, 127, 0.2));
    }
    .btn-cancel:hover:not(:disabled) {
      background: rgba(128, 128, 128, 0.08);
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
  `,t([gt({type:Boolean})],Ot.prototype,"dirty",void 0),t([gt({type:Boolean})],Ot.prototype,"readOnly",void 0),t([gt({type:Boolean})],Ot.prototype,"saving",void 0),Ot=t([ht("curve-footer")],Ot);const Dt=V`<svg
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
</svg>`,Ut=["#42a5f5","#ef5350","#5c6bc0","#ffa726","#ab47bc","#26c6da","#ec407a","#8d6e63","#ffca28","#7e57c2"];let Tt=class extends dt{constructor(){super(...arguments),this._curves=[],this._originalCurves=[],this._config={},this._selectedCurveId=null,this._saving=!1,this._loadError=null,this._saveError=null,this._saveSuccess=!1,this._loading=!1,this._hass=null,this._loaded=!1,this._loadedEntityId=void 0,this._boundKeyHandler=null,this._boundBeforeUnload=null,this._saveSuccessTimer=null}setConfig(t){this._config=t,this._tryLoadCurves()}set hass(t){this._hass=t,this._tryLoadCurves()}getCardSize(){return 4}get _isAdmin(){return this._hass?.user?.is_admin??!1}get _entityId(){return this._config.entity}get _isDirty(){return!function(t,e){if(t.length!==e.length)return!1;for(let i=0;i<t.length;i++){const r=t[i].controlPoints,s=e[i].controlPoints;if(r.length!==s.length)return!1;for(let t=0;t<r.length;t++){if(r[t].lightener!==s[t].lightener)return!1;if(r[t].target!==s[t].target)return!1}}return!0}(this._curves,this._originalCurves)}connectedCallback(){super.connectedCallback(),this._loaded=!1,this._loadedEntityId=void 0,this._tryLoadCurves(),this._boundKeyHandler=this._onKeyDown.bind(this),this._boundBeforeUnload=this._onBeforeUnload.bind(this),window.addEventListener("keydown",this._boundKeyHandler),window.addEventListener("beforeunload",this._boundBeforeUnload)}disconnectedCallback(){super.disconnectedCallback(),this._boundKeyHandler&&window.removeEventListener("keydown",this._boundKeyHandler),this._boundBeforeUnload&&window.removeEventListener("beforeunload",this._boundBeforeUnload),this._saveSuccessTimer&&(clearTimeout(this._saveSuccessTimer),this._saveSuccessTimer=null)}_onKeyDown(t){(t.ctrlKey||t.metaKey)&&"s"===t.key&&this._isDirty&&this._isAdmin&&!this._saving&&(t.preventDefault(),this._onSave()),"Escape"===t.key&&this._isDirty&&!this._saving&&(t.preventDefault(),this._onCancel())}_onBeforeUnload(t){this._isDirty&&t.preventDefault()}async _tryLoadCurves(){if(!(this._loaded&&this._loadedEntityId===this._entityId||this._loading))if(this._hass&&this._entityId){this._loadError=null,this._loading=!0;try{const r=await this._hass.callWS({type:"lightener/get_curves",entity_id:this._entityId}),s=(t=r.entities,e=this._hass.states,i=Ut,Object.keys(t).map((r,s)=>{const o=t[r]?.brightness??{},n=[{lightener:0,target:0}];for(const[t,e]of Object.entries(o)){const i=Number(t),r=Number(e);Number.isFinite(i)&&Number.isFinite(r)&&n.push({lightener:i,target:r})}n.sort((t,e)=>t.lightener-e.lightener);const a=e[r]?.attributes?.friendly_name??r.replace("light.","");return{entityId:r,friendlyName:a,controlPoints:n,visible:!0,color:i[s%i.length]}}));this._curves=s,this._originalCurves=ft(s),this._loaded=!0,this._loadedEntityId=this._entityId}catch(t){console.error("[Lightener] Failed to load curves:",t),this._loadError=String(t)}finally{this._loading=!1}var t,e,i}else if(0===this._curves.length){const t=[{entityId:"light.ceiling_light",friendlyName:"Ceiling Light",controlPoints:[{lightener:0,target:0},{lightener:20,target:0},{lightener:60,target:80},{lightener:100,target:100}],visible:!0,color:Ut[0]},{entityId:"light.sofa_lamp",friendlyName:"Sofa Lamp",controlPoints:[{lightener:0,target:0},{lightener:10,target:50},{lightener:40,target:100},{lightener:70,target:100},{lightener:100,target:60}],visible:!0,color:Ut[1]},{entityId:"light.led_strip",friendlyName:"LED Strip",controlPoints:[{lightener:0,target:0},{lightener:1,target:1},{lightener:100,target:100}],visible:!0,color:Ut[2]}];this._curves=t,this._originalCurves=ft(t)}}_onSelectCurve(t){const{entityId:e}=t.detail,i=this._curves.find(t=>t.entityId===e);i&&!i.visible||(this._selectedCurveId=this._selectedCurveId===e?null:e)}_onPointMove(t){const{curveIndex:e,pointIndex:i,lightener:r,target:s}=t.detail,o=[...this._curves],n={...o[e]},a=[...n.controlPoints];a[i]={lightener:r,target:s},n.controlPoints=a,o[e]=n,this._curves=o}_onPointDrop(t){}_onPointAdd(t){const{lightener:e,target:i,entityId:r}=t.detail,s=r??this._selectedCurveId;if(!s)return;const o=this._curves.findIndex(t=>t.entityId===s);if(o<0)return;if(this._curves[o].controlPoints.some(t=>t.lightener===e))return;const n=[...this._curves],a={...n[o]},l=[...a.controlPoints,{lightener:e,target:i}];l.sort((t,e)=>t.lightener-e.lightener),a.controlPoints=l,n[o]=a,this._curves=n}_onPointRemove(t){const{curveIndex:e,pointIndex:i}=t.detail,r=this._curves[e];if(!r)return;if(r.controlPoints.length<=2)return;const s=[...this._curves],o={...s[e]};o.controlPoints=o.controlPoints.filter((t,e)=>e!==i),s[e]=o,this._curves=s}_onToggleCurve(t){const{entityId:e}=t.detail,i=this._curves.map(t=>t.entityId===e?{...t,visible:!t.visible}:t);if(this._curves=i,this._selectedCurveId===e){const t=i.find(t=>t.entityId===e);t&&!t.visible&&(this._selectedCurveId=null)}}async _onSave(){if(this._hass&&this._entityId&&!this._saving){this._saving=!0,this._saveError=null;try{const t=function(t){const e={};for(const i of t){const t={};for(const e of i.controlPoints)0!==e.lightener&&(t[String(e.lightener)]=String(e.target));e[i.entityId]={brightness:t}}return e}(this._curves);await this._hass.callWS({type:"lightener/save_curves",entity_id:this._entityId,curves:t}),this._originalCurves=ft(this._curves),this._loaded=!1,this._tryLoadCurves(),this._saveSuccess=!0,this._saveSuccessTimer=setTimeout(()=>{this._saveSuccess=!1,this._saveSuccessTimer=null},2e3)}catch(t){console.error("[Lightener] Failed to save curves:",t),this._saveError="Save failed. Check connection."}finally{this._saving=!1}}}_retryLoad(){this._loaded=!1,this._loadError=null,this._tryLoadCurves()}_onCancel(){this._curves=ft(this._originalCurves),this._selectedCurveId=null}render(){return V`
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
          <h2>Brightness Curves</h2>
        </div>

        ${this._loading?V`<div class="loading-indicator" role="status" aria-live="polite">
              Loading curves...
            </div>`:V`<div class="graph-panel">
              <curve-graph
                .curves=${this._curves}
                .selectedCurveId=${this._selectedCurveId}
                .readOnly=${!this._isAdmin}
                @point-move=${this._onPointMove}
                @point-drop=${this._onPointDrop}
                @point-add=${this._onPointAdd}
                @point-remove=${this._onPointRemove}
              ></curve-graph>
            </div>`}

        <curve-scrubber .curves=${this._curves} .readOnly=${!this._isAdmin}></curve-scrubber>

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
            </div>`:F}
        ${this._loadError?V`<div class="error" role="alert">
              ${Dt} Failed to load curves
              <button type="button" class="retry-link" @click=${this._retryLoad}>
                Tap to retry
              </button>
            </div>`:F}
        ${this._saveError?V`<div class="error" role="alert">
              ${Dt} Save failed
              <button type="button" class="retry-link" @click=${this._onSave}>
                Tap to retry
              </button>
            </div>`:F}
      </div>
    `}};Tt.styles=n`
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
      animation: fade-in 0.2s ease;
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
  `,t([vt()],Tt.prototype,"_curves",void 0),t([vt()],Tt.prototype,"_originalCurves",void 0),t([vt()],Tt.prototype,"_config",void 0),t([vt()],Tt.prototype,"_selectedCurveId",void 0),t([vt()],Tt.prototype,"_saving",void 0),t([vt()],Tt.prototype,"_loadError",void 0),t([vt()],Tt.prototype,"_saveError",void 0),t([vt()],Tt.prototype,"_saveSuccess",void 0),t([vt()],Tt.prototype,"_loading",void 0),t([vt()],Tt.prototype,"_hass",void 0),Tt=t([ht("lightener-curve-card")],Tt);export{Tt as LightenerCurveCard};
