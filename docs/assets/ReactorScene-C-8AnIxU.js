import{r as m,j as s,u as R}from"./index-C1RG7q3k.js";import{R as ie,e as oe,u as ne,M as ee,C as K,a as w,_ as ce,V as le,b as G,c as me,S as de,d as ue,f as Q,D as q,A as $,g as fe,O as he,h as pe,T as Me,i as ge,E as ve,j as _e,k as Se,l as xe,m as te,n as Z}from"./heatmap-BWaSiH5P.js";const Ae=()=>parseInt(ie.replace(/\D+/g,"")),ye=Ae();class Ee extends de{constructor(){super({uniforms:{time:{value:0},pixelRatio:{value:1}},vertexShader:`
        uniform float pixelRatio;
        uniform float time;
        attribute float size;  
        attribute float speed;  
        attribute float opacity;
        attribute vec3 noise;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vOpacity;

        void main() {
          vec4 modelPosition = modelMatrix * vec4(position, 1.0);
          modelPosition.y += sin(time * speed + modelPosition.x * noise.x * 100.0) * 0.2;
          modelPosition.z += cos(time * speed + modelPosition.x * noise.y * 100.0) * 0.2;
          modelPosition.x += cos(time * speed + modelPosition.x * noise.z * 100.0) * 0.2;
          vec4 viewPosition = viewMatrix * modelPosition;
          vec4 projectionPostion = projectionMatrix * viewPosition;
          gl_Position = projectionPostion;
          gl_PointSize = size * 25. * pixelRatio;
          gl_PointSize *= (1.0 / - viewPosition.z);
          vColor = color;
          vOpacity = opacity;
        }
      `,fragmentShader:`
        varying vec3 vColor;
        varying float vOpacity;
        void main() {
          float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
          float strength = 0.05 / distanceToCenter - 0.1;
          gl_FragColor = vec4(vColor, strength * vOpacity);
          #include <tonemapping_fragment>
          #include <${ye>=154?"colorspace_fragment":"encodings_fragment"}>
        }
      `})}get time(){return this.uniforms.time.value}set time(t){this.uniforms.time.value=t}get pixelRatio(){return this.uniforms.pixelRatio.value}set pixelRatio(t){this.uniforms.pixelRatio.value=t}}const se=e=>e&&e.constructor===Float32Array,Ie=e=>[e.r,e.g,e.b],ae=e=>e instanceof le||e instanceof G||e instanceof me,re=e=>Array.isArray(e)?e:ae(e)?e.toArray():[e,e,e];function B(e,t,a){return m.useMemo(()=>{if(t!==void 0){if(se(t))return t;if(t instanceof K){const r=Array.from({length:e*3},()=>Ie(t)).flat();return Float32Array.from(r)}else if(ae(t)||Array.isArray(t)){const r=Array.from({length:e*3},()=>re(t)).flat();return Float32Array.from(r)}return Float32Array.from({length:e},()=>t)}return Float32Array.from({length:e},a)},[t])}const Re=m.forwardRef(({noise:e=1,count:t=100,speed:a=1,opacity:r=1,scale:c=1,size:f,color:d,children:h,...o},l)=>{m.useMemo(()=>oe({SparklesImplMaterial:Ee}),[]);const M=m.useRef(null),y=ne(_=>_.viewport.dpr),n=re(c),p=m.useMemo(()=>Float32Array.from(Array.from({length:t},()=>n.map(ee.randFloatSpread)).flat()),[t,...n]),S=B(t,f,Math.random),g=B(t,r),I=B(t,a),u=B(t*3,e),x=B(d===void 0?t*3:t,se(d)?d:new K(d),()=>1);return w(_=>{M.current&&M.current.material&&(M.current.material.time=_.clock.elapsedTime)}),m.useImperativeHandle(l,()=>M.current,[]),m.createElement("points",ce({key:`particle-${t}-${JSON.stringify(c)}`},o,{ref:M}),m.createElement("bufferGeometry",null,m.createElement("bufferAttribute",{attach:"attributes-position",args:[p,3]}),m.createElement("bufferAttribute",{attach:"attributes-size",args:[S,1]}),m.createElement("bufferAttribute",{attach:"attributes-opacity",args:[g,1]}),m.createElement("bufferAttribute",{attach:"attributes-speed",args:[I,1]}),m.createElement("bufferAttribute",{attach:"attributes-color",args:[x,3]}),m.createElement("bufferAttribute",{attach:"attributes-noise",args:[u,3]})),h||m.createElement("sparklesImplMaterial",{transparent:!0,pixelRatio:y,depthWrite:!1}))}),Te=`
    
#ifdef IS_VERTEX
    vec3 csm_Position;
    vec4 csm_PositionRaw;
    vec3 csm_Normal;

    // csm_PointSize
    #ifdef IS_POINTSMATERIAL
        float csm_PointSize;
    #endif
#else
    vec4 csm_DiffuseColor;
    vec4 csm_FragColor;
    float csm_UnlitFac;

    // csm_Emissive, csm_Roughness, csm_Metalness
    #if defined IS_MESHSTANDARDMATERIAL || defined IS_MESHPHYSICALMATERIAL
        vec3 csm_Emissive;
        float csm_Roughness;
        float csm_Metalness;
        float csm_Iridescence;
        
        #if defined IS_MESHPHYSICALMATERIAL
            float csm_Clearcoat;
            float csm_ClearcoatRoughness;
            vec3 csm_ClearcoatNormal;
            float csm_Transmission;
            float csm_Thickness;
        #endif
    #endif

    // csm_AO
    #if defined IS_MESHSTANDARDMATERIAL || defined IS_MESHPHYSICALMATERIAL || defined IS_MESHBASICMATERIAL || defined IS_MESHLAMBERTMATERIAL || defined IS_MESHPHONGMATERIAL || defined IS_MESHTOONMATERIAL
        float csm_AO;
    #endif

    // csm_FragNormal
    #if defined IS_MESHLAMBERTMATERIAL || defined IS_MESHMATCAPMATERIAL || defined IS_MESHNORMALMATERIAL || defined IS_MESHPHONGMATERIAL || defined IS_MESHPHYSICALMATERIAL || defined IS_MESHSTANDARDMATERIAL || defined IS_MESHTOONMATERIAL || defined IS_SHADOWMATERIAL 
        vec3 csm_FragNormal;
    #endif

    float csm_DepthAlpha;
#endif
`,Ce=`

#ifdef IS_VERTEX
    // csm_Position & csm_PositionRaw
    #ifdef IS_UNKNOWN
        csm_Position = vec3(0.0);
        csm_PositionRaw = vec4(0.0);
        csm_Normal = vec3(0.0);
    #else
        csm_Position = position;
        csm_PositionRaw = projectionMatrix * modelViewMatrix * vec4(position, 1.);
        csm_Normal = normal;
    #endif

    // csm_PointSize
    #ifdef IS_POINTSMATERIAL
        csm_PointSize = size;
    #endif
#else
    csm_UnlitFac = 0.0;

    // csm_DiffuseColor & csm_FragColor
    #if defined IS_UNKNOWN || defined IS_SHADERMATERIAL || defined IS_MESHDEPTHMATERIAL || defined IS_MESHDISTANCEMATERIAL || defined IS_MESHNORMALMATERIAL || defined IS_SHADOWMATERIAL
        csm_DiffuseColor = vec4(1.0, 0.0, 1.0, 1.0);
        csm_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
    #else
        #ifdef USE_MAP
            vec4 _csm_sampledDiffuseColor = texture2D(map, vMapUv);

            #ifdef DECODE_VIDEO_TEXTURE
            // inline sRGB decode (TODO: Remove this code when https://crbug.com/1256340 is solved)
            _csm_sampledDiffuseColor = vec4(mix(pow(_csm_sampledDiffuseColor.rgb * 0.9478672986 + vec3(0.0521327014), vec3(2.4)), _csm_sampledDiffuseColor.rgb * 0.0773993808, vec3(lessThanEqual(_csm_sampledDiffuseColor.rgb, vec3(0.04045)))), _csm_sampledDiffuseColor.w);
            #endif

            csm_DiffuseColor = vec4(diffuse, opacity) * _csm_sampledDiffuseColor;
            csm_FragColor = vec4(diffuse, opacity) * _csm_sampledDiffuseColor;
        #else
            csm_DiffuseColor = vec4(diffuse, opacity);
            csm_FragColor = vec4(diffuse, opacity);
        #endif
    #endif

    // csm_Emissive, csm_Roughness, csm_Metalness
    #if defined IS_MESHSTANDARDMATERIAL || defined IS_MESHPHYSICALMATERIAL
        csm_Emissive = emissive;
        csm_Roughness = roughness;
        csm_Metalness = metalness;

        #ifdef USE_IRIDESCENCE
            csm_Iridescence = iridescence;
        #else
            csm_Iridescence = 0.0;
        #endif

        #if defined IS_MESHPHYSICALMATERIAL
            #ifdef USE_CLEARCOAT
                csm_Clearcoat = clearcoat;
                csm_ClearcoatRoughness = clearcoatRoughness;
            #else
                csm_Clearcoat = 0.0;
                csm_ClearcoatRoughness = 0.0;
            #endif

            #ifdef USE_TRANSMISSION
                csm_Transmission = transmission;
                csm_Thickness = thickness;
            #else
                csm_Transmission = 0.0;
                csm_Thickness = 0.0;
            #endif
        #endif
    #endif

    // csm_AO
    #if defined IS_MESHSTANDARDMATERIAL || defined IS_MESHPHYSICALMATERIAL || defined IS_MESHBASICMATERIAL || defined IS_MESHLAMBERTMATERIAL || defined IS_MESHPHONGMATERIAL || defined IS_MESHTOONMATERIAL
        csm_AO = 0.0;
    #endif

    #if defined IS_MESHLAMBERTMATERIAL || defined IS_MESHMATCAPMATERIAL || defined IS_MESHNORMALMATERIAL || defined IS_MESHPHONGMATERIAL || defined IS_MESHPHYSICALMATERIAL || defined IS_MESHSTANDARDMATERIAL || defined IS_MESHTOONMATERIAL || defined IS_SHADOWMATERIAL 
        #ifdef FLAT_SHADED
            vec3 fdx = dFdx( vViewPosition );
            vec3 fdy = dFdy( vViewPosition );
            csm_FragNormal = normalize( cross( fdx, fdy ) );
        #else
            csm_FragNormal = normalize(vNormal);
            #ifdef DOUBLE_SIDED
                csm_FragNormal *= gl_FrontFacing ? 1.0 : - 1.0;
            #endif
        #endif
    #endif

    csm_DepthAlpha = 1.0;
#endif
`,be=`
    varying mat4 csm_internal_vModelViewMatrix;
`,Pe=`
    csm_internal_vModelViewMatrix = modelViewMatrix;
`,je=`
    varying mat4 csm_internal_vModelViewMatrix;
`,Ne=`
    
`,i={diffuse:"csm_DiffuseColor",roughness:"csm_Roughness",metalness:"csm_Metalness",emissive:"csm_Emissive",ao:"csm_AO",fragNormal:"csm_FragNormal",clearcoat:"csm_Clearcoat",clearcoatRoughness:"csm_ClearcoatRoughness",clearcoatNormal:"csm_ClearcoatNormal",transmission:"csm_Transmission",thickness:"csm_Thickness",iridescence:"csm_Iridescence",pointSize:"csm_PointSize",fragColor:"csm_FragColor",depthAlpha:"csm_DepthAlpha",unlitFac:"csm_UnlitFac",position:"csm_Position",positionRaw:"csm_PositionRaw",normal:"csm_Normal"},we={[`${i.position}`]:"*",[`${i.positionRaw}`]:"*",[`${i.normal}`]:"*",[`${i.depthAlpha}`]:"*",[`${i.pointSize}`]:["PointsMaterial"],[`${i.diffuse}`]:"*",[`${i.fragColor}`]:"*",[`${i.fragNormal}`]:"*",[`${i.unlitFac}`]:"*",[`${i.emissive}`]:["MeshStandardMaterial","MeshPhysicalMaterial"],[`${i.roughness}`]:["MeshStandardMaterial","MeshPhysicalMaterial"],[`${i.metalness}`]:["MeshStandardMaterial","MeshPhysicalMaterial"],[`${i.iridescence}`]:["MeshStandardMaterial","MeshPhysicalMaterial"],[`${i.ao}`]:["MeshStandardMaterial","MeshPhysicalMaterial","MeshBasicMaterial","MeshLambertMaterial","MeshPhongMaterial","MeshToonMaterial"],[`${i.clearcoat}`]:["MeshPhysicalMaterial"],[`${i.clearcoatRoughness}`]:["MeshPhysicalMaterial"],[`${i.clearcoatNormal}`]:["MeshPhysicalMaterial"],[`${i.transmission}`]:["MeshPhysicalMaterial"],[`${i.thickness}`]:["MeshPhysicalMaterial"]},Fe={"*":{"#include <lights_physical_fragment>":Q.lights_physical_fragment,"#include <transmission_fragment>":Q.transmission_fragment},[`${i.normal}`]:{"#include <beginnormal_vertex>":`
    vec3 objectNormal = ${i.normal};
    #ifdef USE_TANGENT
	    vec3 objectTangent = vec3( tangent.xyz );
    #endif
    `},[`${i.position}`]:{"#include <begin_vertex>":`
    vec3 transformed = ${i.position};
  `},[`${i.positionRaw}`]:{"#include <project_vertex>":`
    #include <project_vertex>
    gl_Position = ${i.positionRaw};
  `},[`${i.pointSize}`]:{"gl_PointSize = size;":`
    gl_PointSize = ${i.pointSize};
    `},[`${i.diffuse}`]:{"#include <color_fragment>":`
    #include <color_fragment>
    diffuseColor = ${i.diffuse};
  `},[`${i.fragColor}`]:{"#include <opaque_fragment>":`
    #include <opaque_fragment>
    gl_FragColor = mix(gl_FragColor, ${i.fragColor}, ${i.unlitFac});
  `},[`${i.emissive}`]:{"vec3 totalEmissiveRadiance = emissive;":`
    vec3 totalEmissiveRadiance = ${i.emissive};
    `},[`${i.roughness}`]:{"#include <roughnessmap_fragment>":`
    #include <roughnessmap_fragment>
    roughnessFactor = ${i.roughness};
    `},[`${i.metalness}`]:{"#include <metalnessmap_fragment>":`
    #include <metalnessmap_fragment>
    metalnessFactor = ${i.metalness};
    `},[`${i.ao}`]:{"#include <aomap_fragment>":`
    #include <aomap_fragment>
    reflectedLight.indirectDiffuse *= 1. - ${i.ao};
    `},[`${i.fragNormal}`]:{"#include <normal_fragment_maps>":`
      #include <normal_fragment_maps>
      normal = ${i.fragNormal};
    `},[`${i.depthAlpha}`]:{"gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );":`
      gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity * 1.0 - ${i.depthAlpha} );
    `,"gl_FragColor = packDepthToRGBA( fragCoordZ );":`
      if(${i.depthAlpha} < 1.0) discard;
      gl_FragColor = packDepthToRGBA( dist );
    `,"gl_FragColor = packDepthToRGBA( dist );":`
      if(${i.depthAlpha} < 1.0) discard;
      gl_FragColor = packDepthToRGBA( dist );
    `},[`${i.clearcoat}`]:{"material.clearcoat = clearcoat;":`material.clearcoat = ${i.clearcoat};`},[`${i.clearcoatRoughness}`]:{"material.clearcoatRoughness = clearcoatRoughness;":`material.clearcoatRoughness = ${i.clearcoatRoughness};`},[`${i.clearcoatNormal}`]:{"#include <clearcoat_normal_fragment_begin>":`
      vec3 csm_coat_internal_orthogonal = csm_ClearcoatNormal - (dot(csm_ClearcoatNormal, nonPerturbedNormal) * nonPerturbedNormal);
      vec3 csm_coat_internal_projectedbump = mat3(csm_internal_vModelViewMatrix) * csm_coat_internal_orthogonal;
      vec3 clearcoatNormal = normalize(nonPerturbedNormal - csm_coat_internal_projectedbump);
    `},[`${i.transmission}`]:{"material.transmission = transmission;":`
      material.transmission = ${i.transmission};
    `},[`${i.thickness}`]:{"material.thickness = thickness;":`
      material.thickness = ${i.thickness};
    `},[`${i.iridescence}`]:{"material.iridescence = iridescence;":`
      material.iridescence = ${i.iridescence};
    `}},De={clearcoat:[i.clearcoat,i.clearcoatNormal,i.clearcoatRoughness],transmission:[i.transmission],iridescence:[i.iridescence]};function Le(e){let t=0;for(let r=0;r<e.length;r++)t=e.charCodeAt(r)+(t<<6)+(t<<16)-t;const a=t>>>0;return String(a)}function $e(e){try{new e}catch(t){if(t.message.indexOf("is not a constructor")>=0)return!1}return!0}function J(e){return e.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g,"")}let Oe=class extends ue{constructor({baseMaterial:t,vertexShader:a,fragmentShader:r,uniforms:c,patchMap:f,cacheKey:d,...h}){if(!t)throw new Error("CustomShaderMaterial: baseMaterial is required.");let o;if($e(t)){const n=Object.keys(h).length===0;o=new t(n?void 0:h)}else o=t,Object.assign(o,h);if(["ShaderMaterial","RawShaderMaterial"].includes(o.type))throw new Error(`CustomShaderMaterial does not support ${o.type} as a base material.`);super(),this.uniforms={},this.vertexShader="",this.fragmentShader="";const l=o;l.name=`CustomShaderMaterial<${o.name||o.type}>`,l.update=this.update,l.__csm={prevOnBeforeCompile:o.onBeforeCompile,baseMaterial:o,vertexShader:a,fragmentShader:r,uniforms:c,patchMap:f,cacheKey:d};const M={...l.uniforms||{},...c||{}};l.uniforms=this.uniforms=M,l.vertexShader=this.vertexShader=a||"",l.fragmentShader=this.fragmentShader=r||"",l.update({fragmentShader:l.fragmentShader,vertexShader:l.vertexShader,uniforms:l.uniforms,patchMap:f,cacheKey:d}),Object.assign(this,l);const y=Object.getOwnPropertyDescriptors(Object.getPrototypeOf(l));for(const n in y){const p=y[n];(p.get||p.set)&&Object.defineProperty(this,n,p)}return Object.defineProperty(this,"type",{get(){return o.type},set(n){o.type=n}}),this}update({fragmentShader:t,vertexShader:a,uniforms:r,cacheKey:c,patchMap:f}){const d=J(a||""),h=J(t||""),o=this;r&&(o.uniforms=r),a&&(o.vertexShader=a),t&&(o.fragmentShader=t),Object.entries(De).forEach(([n,p])=>{for(const S in p){const g=p[S];(h&&h.includes(g)||d&&d.includes(g))&&(o[n]||(o[n]=1))}});const l=o.__csm.prevOnBeforeCompile,M=(n,p,S)=>{let g,I="";if(p){const u=p.search(/void\s+main\s*\(\s*\)\s*{/);if(u!==-1){I=p.slice(0,u);let x=0,_=-1;for(let T=u;T<p.length;T++)if(p[T]==="{"&&x++,p[T]==="}"&&(x--,x===0)){_=T;break}if(_!==-1){const T=p.slice(u,_+1);g=T.slice(T.indexOf("{")+1,-1)}}else I=p}if(S&&p&&p.includes(i.fragColor)&&g&&(g=`csm_UnlitFac = 1.0;
`+g),n.includes("//~CSM_DEFAULTS")){n=n.replace("void main() {",`
          // THREE-CustomShaderMaterial by Faraz Shaikh: https://github.com/FarazzShaikh/THREE-CustomShaderMaterial
  
          ${I}
          
          void main() {
          `);const u=n.lastIndexOf("//~CSM_MAIN_END");if(u!==-1){const x=`
            ${g?`${g}`:""}
            //~CSM_MAIN_END
          `;n=n.slice(0,u)+x+n.slice(u)}}else{const u=/void\s*main\s*\(\s*\)\s*{/gm;n=n.replace(u,`
          // THREE-CustomShaderMaterial by Faraz Shaikh: https://github.com/FarazzShaikh/THREE-CustomShaderMaterial
  
          //~CSM_DEFAULTS
          ${S?je:be}
          ${Te}
  
          ${I}
          
          void main() {
            {
              ${Ce}
            }
            ${S?Ne:Pe}

            ${g?`${g}`:""}
            //~CSM_MAIN_END
          `)}return n};o.onBeforeCompile=(n,p)=>{l==null||l(n,p);const S=f||{},g=o.type,I=g?`#define IS_${g.toUpperCase()};
`:`#define IS_UNKNOWN;
`;n.vertexShader=I+`#define IS_VERTEX
`+n.vertexShader,n.fragmentShader=I+`#define IS_FRAGMENT
`+n.fragmentShader;const u=x=>{for(const _ in x){const T=_==="*"||d&&d.includes(_);if(_==="*"||h&&h.includes(_)||T){const F=we[_];if(F&&F!=="*"&&(Array.isArray(F)?!F.includes(g):F!==g)){console.error(`CustomShaderMaterial: ${_} is not available in ${g}. Shader cannot compile.`);return}const O=x[_];for(const P in O){const j=O[P];if(typeof j=="object"){const C=j.type,b=j.value;C==="fs"?n.fragmentShader=n.fragmentShader.replace(P,b):C==="vs"&&(n.vertexShader=n.vertexShader.replace(P,b))}else j&&(n.vertexShader=n.vertexShader.replace(P,j),n.fragmentShader=n.fragmentShader.replace(P,j))}}}};u(Fe),u(S),n.vertexShader=M(n.vertexShader,d,!1),n.fragmentShader=M(n.fragmentShader,h,!0),r&&(n.uniforms={...n.uniforms,...o.uniforms}),o.uniforms=n.uniforms};const y=o.customProgramCacheKey;o.customProgramCacheKey=()=>((c==null?void 0:c())||Le((d||"")+(h||"")))+(y==null?void 0:y.call(o)),o.needsUpdate=!0}clone(){const t=this;return new t.constructor({baseMaterial:t.__csm.baseMaterial.clone(),vertexShader:t.__csm.vertexShader,fragmentShader:t.__csm.fragmentShader,uniforms:t.__csm.uniforms,patchMap:t.__csm.patchMap,cacheKey:t.__csm.cacheKey})}};function He(e,t){const a=m.useRef(!1);m.useEffect(()=>{if(a.current)return e();a.current=!0},t)}function ke({baseMaterial:e,vertexShader:t,fragmentShader:a,uniforms:r,cacheKey:c,patchMap:f,attach:d,...h},o){const l=m.useMemo(()=>new Oe({baseMaterial:e,vertexShader:t,fragmentShader:a,uniforms:r,cacheKey:c,patchMap:f,...h}),[e]);return He(()=>{l.dispose(),l.update({vertexShader:t,fragmentShader:a,uniforms:r,patchMap:f,cacheKey:c})},[t,a,r,f,c]),m.useEffect(()=>()=>l.dispose(),[l]),s.jsx("primitive",{ref:o,attach:d??"material",object:l,...h})}const ze=m.forwardRef(ke),Be=`
  uniform float uTime;
  uniform float uWobble;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec3 p = position;
    float w = sin(p.x * 6.0 + uTime * 7.0) * sin(p.y * 7.0 - uTime * 5.0) * sin(p.z * 5.0 + uTime * 3.0);
    p += normal * w * uWobble * 0.13;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vView = -mv.xyz;
    gl_Position = projectionMatrix * mv;
  }
`,Ve=`
  uniform float uTemp;    // 0..1 normalized core temperature
  uniform float uIgnite;  // 1 when ignited
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec3 red    = vec3(0.55, 0.06, 0.02);
    vec3 orange = vec3(1.00, 0.42, 0.05);
    vec3 hot    = vec3(1.00, 0.85, 0.55);
    vec3 blue   = vec3(0.65, 0.82, 1.00);
    vec3 c = mix(red, orange, smoothstep(0.0, 0.35, uTemp));
    c = mix(c, hot,  smoothstep(0.3, 0.65, uTemp));
    c = mix(c, blue, smoothstep(0.6, 1.0, uTemp));
    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), normalize(vView))), 1.6);
    float brightness = 0.35 + uTemp * 1.5 + uIgnite * 0.6;
    float shimmer = 1.0 + 0.06 * sin(uTime * 11.0) * (0.3 + uTemp);
    vec3 col = c * brightness * shimmer * (0.55 + fresnel * 1.2);
    float alpha = 0.5 + 0.4 * fresnel + uTemp * 0.15;
    gl_FragColor = vec4(col, min(alpha, 0.95));
  }
`;function Ge({majorR:e,minorR:t}){const a=m.useRef(),r=m.useRef(),c=m.useRef(),f=m.useMemo(()=>new K,[]),d=m.useMemo(()=>({uTime:{value:0},uTemp:{value:0},uWobble:{value:0},uIgnite:{value:0}}),[]);return w((h,o)=>{const l=R.getState(),M=l.sim.physics,y=Math.min(M.T/25,1),n=Math.max(M.greenwaldFrac>.8?(M.greenwaldFrac-.8)*4:0,M.beta/M.betaLimit>.8?(M.beta/M.betaLimit-.8)*4:0),p=M.plasmaOn?Math.min(n,1):0,S=d;if(S.uTime.value+=o*(l.speed>0?1:.15),S.uTemp.value+=(y-S.uTemp.value)*Math.min(o*3,1),S.uWobble.value+=(p-S.uWobble.value)*Math.min(o*5,1),S.uIgnite.value=M.ignition?1:0,r.current&&(r.current.visible=l.viewMode==="normal"&&(M.plasmaOn||S.uTemp.value>.01)),c.current){f.setRGB(.9,.35+y*.5,.15+y*.85),c.current.color=f;const g=l.viewMode==="process"?.25:1;c.current.intensity=(M.plasmaOn?2+y*22:.2)*g}}),s.jsxs("group",{children:[s.jsxs("mesh",{ref:r,children:[s.jsx("torusGeometry",{args:[e,t,48,140]}),s.jsx("shaderMaterial",{ref:a,vertexShader:Be,fragmentShader:Ve,uniforms:d,transparent:!0,depthWrite:!1,blending:$,side:q})]}),s.jsx("pointLight",{ref:c,position:[0,0,0],distance:14,decay:1.6})]})}const Y=200,U=10,Ue=2.6,X=.42,V=(e,t)=>e+Math.random()*(t-e);function W(e,t,a,r,c=X,f=0,d=0){const h=r+a*Ue,o=c+f*Math.cos(d),l=t+o*Math.cos(h);return e.set(l*Math.cos(a),l*Math.sin(a),o*Math.sin(h)+f*Math.sin(d)*.6),e}function We(e,t){const a=[],r=new G;for(let f=0;f<=240;f++){const d=f/240*Math.PI*2;a.push(W(r,e,d,t).clone())}const c=new pe(a,!0);return new Me(c,220,.008,5,!0)}function Ke({majorR:e=2}){const t=m.useRef(),a=m.useRef(),r=m.useRef(),c=m.useRef(),f=m.useMemo(()=>new fe({color:"#38BDF8",transparent:!0,opacity:.12,blending:$,depthWrite:!1,toneMapped:!1}),[]),d=m.useMemo(()=>[0,Math.PI*2/3,Math.PI*4/3].map(l=>We(e,l)),[e]),h=m.useMemo(()=>({ions:Array.from({length:Y},()=>({phi:V(0,Math.PI*2),theta0:V(0,Math.PI*2),gyroPhase:V(0,Math.PI*2),jitter:V(.8,1.25),shell:V(.45,1.05)})),events:[],spawnAcc:0,dummy:new he,color:new K,v:new G}),[]);return w((l,M)=>{const y=R.getState();if(y.viewMode!=="process"||y.mode==="fission"){[t,a,r,c].forEach(E=>{E.current&&(E.current.count=0)}),f.opacity!==0&&(f.opacity=0);return}const n=y.sim.physics,p=y.sim.controls,S=Math.min(M,.06)*(y.speed>0?1:0),{ions:g,events:I,dummy:u,color:x,v:_}=h;f.opacity=.05+p.B/(p.bMax||12)*.25;const T=n.plasmaOn,F=Math.min(n.T/25,1),O=ee.clamp(.9/Math.max(p.B,1),.05,.28)*.35,P=T?Math.round(40+p.density/5*(Y-40)):0,j=p.fuelMix??.5;if(S>0&&T){for(const v of g)v.phi+=S*(.25+Math.sqrt(F)*.9)*v.jitter,v.gyroPhase+=S*(14+p.B*1.6);const E=Math.min(n.pFusionMW/30,10)+(n.pFusionMW>.5?.3:0);for(h.spawnAcc+=S*E;h.spawnAcc>=1&&I.length<U;){h.spawnAcc-=1;const v=g[Math.floor(Math.random()*g.length)],D=W(new G,e,v.phi,v.theta0),A=new G(Math.cos(v.phi),Math.sin(v.phi),0),L=D.clone().sub(A.multiplyScalar(e)).normalize();L.lengthSq()<.01&&L.set(0,0,1),I.push({t:0,pos:D,dir:L,phi0:v.phi,theta0:v.theta0})}for(let v=I.length-1;v>=0;v--)I[v].t+=S,I[v].t>1.4&&I.splice(v,1)}T||(I.length=0,h.spawnAcc=0);const C=t.current;if(C){for(let E=0;E<P;E++){const v=g[E];W(_,e,v.phi,v.theta0,X*v.shell,O,v.gyroPhase),u.position.copy(_),u.scale.setScalar(.022),u.updateMatrix(),C.setMatrixAt(E,u.matrix),E/Math.max(P,1)<j?x.set("#FCA5A5"):x.set("#7DD3FC"),C.setColorAt(E,x)}C.count=P,C.instanceMatrix.needsUpdate=!0,C.instanceColor&&(C.instanceColor.needsUpdate=!0)}const b=a.current,H=r.current,k=c.current;if(b&&H&&k){let E=0,v=0,D=0;for(const A of I){A.t<.35&&(u.position.copy(A.pos),u.scale.setScalar(.04+A.t*.5),u.updateMatrix(),b.setMatrixAt(E,u.matrix),x.set("#FDE68A").multiplyScalar(1-A.t/.35),b.setColorAt(E,x),E++);const L=A.t/1.4;W(_,e,A.phi0+A.t*2.2,A.theta0,X*(1-L*.4),O*2.2,A.t*26),u.position.copy(_),u.scale.setScalar(.034*(1-L)),u.updateMatrix(),H.setMatrixAt(v,u.matrix),x.set("#FB923C").multiplyScalar(1-L*.7),H.setColorAt(v,x),v++;const z=A.t*3.2;z<1.15?(_.copy(A.pos).addScaledVector(A.dir,z),u.position.copy(_),u.scale.set(.016,.016,.09),u.lookAt(_.clone().add(A.dir)),u.updateMatrix(),k.setMatrixAt(D,u.matrix),x.set("#F8FAFC"),k.setColorAt(D,x),D++):z<1.45&&(_.copy(A.pos).addScaledVector(A.dir,1.15),u.position.copy(_),u.scale.setScalar(.03+(z-1.15)*.3),u.updateMatrix(),b.setMatrixAt(E,u.matrix),x.set("#F59E0B").multiplyScalar(Math.max(1-(z-1.15)/.3,0)),b.setColorAt(E,x),E++)}b.count=E,H.count=v,k.count=D,[b,H,k].forEach(A=>{A.instanceMatrix.needsUpdate=!0,A.instanceColor&&(A.instanceColor.needsUpdate=!0)})}}),R(l=>l.viewMode)!=="process"?null:s.jsxs("group",{children:[s.jsxs("mesh",{children:[s.jsx("torusGeometry",{args:[e,.95,24,96]}),s.jsx("meshBasicMaterial",{color:"#7DA7C9",transparent:!0,opacity:.05,blending:$,depthWrite:!1,toneMapped:!1})]}),d.map((l,M)=>s.jsx("mesh",{geometry:l,material:f},M)),s.jsxs("instancedMesh",{ref:t,args:[void 0,void 0,Y],frustumCulled:!1,children:[s.jsx("sphereGeometry",{args:[1,6,6]}),s.jsx("meshBasicMaterial",{toneMapped:!1,transparent:!0,opacity:.9})]}),s.jsxs("instancedMesh",{ref:a,args:[void 0,void 0,U*2],frustumCulled:!1,children:[s.jsx("sphereGeometry",{args:[1,8,8]}),s.jsx("meshBasicMaterial",{toneMapped:!1,transparent:!0,opacity:.9,blending:$,depthWrite:!1})]}),s.jsxs("instancedMesh",{ref:r,args:[void 0,void 0,U],frustumCulled:!1,children:[s.jsx("sphereGeometry",{args:[1,8,8]}),s.jsx("meshBasicMaterial",{toneMapped:!1,transparent:!0,opacity:.95,blending:$,depthWrite:!1})]}),s.jsxs("instancedMesh",{ref:c,args:[void 0,void 0,U],frustumCulled:!1,children:[s.jsx("boxGeometry",{args:[1,1,1]}),s.jsx("meshBasicMaterial",{toneMapped:!1,transparent:!0,opacity:.9,blending:$,depthWrite:!1})]})]})}const N=2,Ye=.62;function qe(){const e=m.useRef(),t=m.useMemo(()=>Array.from({length:9},(a,r)=>r/9*Math.PI*2),[]);return w(a=>{var d;const r=R.getState();if(!e.current)return;const c=Math.max((r.sim.controls.B/r.sim.physics.magnetSafeB)**2*.85,1-r.sim.structure.magnets/100),f=te(a.clock.elapsedTime,((d=r.sim.hazards)==null?void 0:d.magnets)!==0);e.current.children.forEach(h=>{var l;const o=(l=h.children[0])==null?void 0:l.material;o&&(r.analysisView?(Z(o.color,c),o.emissive.copy(o.color).multiplyScalar(.4+f*.8)):(o.color.set("#64748B"),o.emissive.set("#000000")))})}),s.jsx("group",{ref:e,children:t.map((a,r)=>s.jsx("group",{"rotation-z":a,children:s.jsxs("mesh",{position:[N,0,0],"rotation-x":Math.PI/2,children:[s.jsx("torusGeometry",{args:[1.12,.09,12,40]}),s.jsx("meshStandardMaterial",{color:"#64748B",metalness:.85,roughness:.35})]})},r))})}function Xe(){return[{r:2.9,z:1.15},{r:2.9,z:-1.15},{r:1.35,z:1.5},{r:1.35,z:-1.5}].map((t,a)=>s.jsxs("mesh",{position:[0,0,t.z],children:[s.jsx("torusGeometry",{args:[t.r,.07,10,60]}),s.jsx("meshStandardMaterial",{color:"#7C8DA6",metalness:.8,roughness:.4})]},a))}const Ze=`
  uniform float uHeat;
  uniform float uTime;
  varying vec2 vHeatUv;
  void main() {
    vHeatUv = uv;
    // thermal swell: a readable cue, not a deformation (tube radius is 0.11)
    float w = sin(position.x * 9.0 + uTime * 2.0) * sin(position.y * 8.0 - uTime * 1.7);
    csm_Position = position + normal * w * uHeat * 0.008;
  }
`,Qe=`
  uniform float uHeat;      // divertor temperature against its limit, 0..1
  uniform float uPeaking;   // 1.0 L-mode, 1.15 once ELMs focus the exhaust
  uniform float uTime;
  uniform float uPattern;   // 0 in the stress view, which must read flat
  varying vec2 vHeatUv;
  void main() {
    // exhaust lands on a poloidal band; peaking narrows it and raises the peak
    float width = 6.0 * uPeaking;
    float band = exp(-pow((vHeatUv.y - 0.5) * width, 2.0));
    float ripple  = 0.85 + 0.15 * sin(vHeatUv.x * 18.0 + uTime * 1.5);
    float flicker = 0.92 + 0.08 * sin(uTime * 9.0 + vHeatUv.x * 30.0);
    float strike = band * ripple * flicker * uPeaking;
    // cold plant keeps its flat look; the pattern arrives with the heat
    float hot = mix(1.0, strike, uHeat * uPattern);
    csm_Emissive = emissive * hot;
  }
`;function Je(){const e=m.useRef(),t=R(r=>r.settings.reducedMotion),a=m.useMemo(()=>({uHeat:{value:0},uPeaking:{value:1},uTime:{value:0},uPattern:{value:1}}),[]);return w((r,c)=>{var l;const f=R.getState(),d=f.sim.physics;if(!e.current)return;const h=a;if(h.uTime.value+=c*(t?0:1),h.uPeaking.value=d.divertorPeaking??1,h.uHeat.value=Math.min(Math.max(d.divertorTempC/d.divertorLimitC,0),1),f.analysisView){h.uPattern.value=0;const M=Math.max(d.divertorTempC/d.divertorLimitC,1-f.sim.structure.divertor/100),y=te(r.clock.elapsedTime,((l=f.sim.hazards)==null?void 0:l.divertor)!==0);Z(e.current.emissive,M),e.current.color.copy(e.current.emissive),e.current.emissiveIntensity=.5+y*1.6;return}h.uPattern.value=1,e.current.color.set("#3F4B5F");const o=Math.min(Math.max((d.divertorTempC-500)/1800,0),1);e.current.emissive.setRGB(o*1,o*.55+o*o*.4,o*o*.5),e.current.emissiveIntensity=.2+o*2.2}),s.jsxs("mesh",{position:[0,0,-.66],children:[s.jsx("torusGeometry",{args:[N*.88,.11,10,90]}),s.jsx(ze,{ref:e,baseMaterial:xe,vertexShader:Ze,fragmentShader:Qe,uniforms:a,color:"#3F4B5F",metalness:.7,roughness:.5,emissive:"#000000"})]})}function et(){const e=m.useRef();return w(()=>{var c,f;const t=R.getState(),a=t.sim.structure;if(!e.current)return;if(t.analysisView){const d=Math.max(t.sim.physics.pFusionMW/3500,1-a.firstWall/100);Z(e.current.color,d),e.current.emissive.copy(e.current.color).multiplyScalar(.35);return}(f=(c=e.current.emissive)==null?void 0:c.set)==null||f.call(c,"#000000");const r=1-a.firstWall/100;e.current.color.setRGB(.16+r*.25,.2-r*.05,.26-r*.1)}),s.jsxs("group",{children:[s.jsxs("mesh",{"rotation-z":Math.PI*.25,children:[s.jsx("torusGeometry",{args:[N,.88,24,90,Math.PI*1.5]}),s.jsx("meshStandardMaterial",{ref:e,color:"#293445",metalness:.6,roughness:.55,side:q})]}),s.jsxs("mesh",{"rotation-z":Math.PI*.25,children:[s.jsx("torusGeometry",{args:[N,1,24,90,Math.PI*1.5]}),s.jsx("meshStandardMaterial",{color:"#1B2534",metalness:.75,roughness:.4,transparent:!0,opacity:.55,side:q})]})]})}function tt(){return[1.35,1.5].map((e,t)=>s.jsxs("mesh",{position:[0,0,t===0?.9:-.9],children:[s.jsx("torusGeometry",{args:[N+1.15,.035,8,80]}),s.jsx("meshStandardMaterial",{color:"#0E7490",metalness:.6,roughness:.4})]},t))}function st(){return s.jsxs("mesh",{"rotation-x":Math.PI/2,children:[s.jsx("cylinderGeometry",{args:[.42,.42,2.6,24,1,!1]}),s.jsx("meshStandardMaterial",{color:"#8A97AB",metalness:.9,roughness:.3})]})}function at(){return[.6,2.7].map((e,t)=>s.jsx("group",{"rotation-z":e,children:s.jsxs("mesh",{position:[N+1.7,.75,0],"rotation-z":-.42,children:[s.jsx("boxGeometry",{args:[1.5,.34,.34]}),s.jsx("meshStandardMaterial",{color:"#475569",metalness:.7,roughness:.45})]})},t))}function rt(){const[e,t]=m.useState(!1);return w(()=>{const a=R.getState(),r=a.sim.time.ticks-a.uiFx.shakeTick<25;r!==e&&t(r)}),e?s.jsx(Re,{count:140,scale:[5.5,5.5,2.5],size:7,speed:3.5,color:"#FFD9A0"}):null}function it(){const e=m.useRef(0);return w(({camera:t})=>{const a=R.getState();a.sim.time.ticks-a.uiFx.shakeTick<12&&!a.settings.reducedMotion&&(e.current=.06),e.current>.001&&(t.position.x+=(Math.random()-.5)*e.current,t.position.y+=(Math.random()-.5)*e.current,e.current*=.9)}),null}function ot(){const[e,t]=m.useState(0),a=m.useRef(-1);return m.useEffect(()=>R.subscribe(c=>{c.uiFx.flashTick!==a.current&&c.uiFx.flashTick>0&&(a.current=c.uiFx.flashTick,t(c.settings.reducedMotion?.25:.85))}),[]),m.useEffect(()=>{if(e<=0)return;const r=setTimeout(()=>t(c=>c>.05?c*.7:0),40);return()=>clearTimeout(r)},[e]),e===0?null:s.jsx("div",{className:"absolute inset-0 bg-white pointer-events-none z-10",style:{opacity:e}})}function nt(){const e=R(c=>c.sim.physics.T),t=R(c=>c.sim.physics.plasmaOn),a=R(c=>c.sim.physics.ignition),r=R(c=>c.sim.physics.stability);return s.jsxs("div",{className:"absolute top-2 left-2 z-10 text-[10px] font-mono pointer-events-none",children:[s.jsxs("div",{className:t?"text-safe":"text-slate-500",children:["● PLASMA ",t?"CONFINED":"OFFLINE"]}),a&&s.jsx("div",{className:"text-accent font-bold",children:"★ IGNITION: SELF-HEATING"}),s.jsxs("div",{className:"text-slate-400",children:["T = ",e.toFixed(1)," keV · stability ",r,"%"]})]})}function dt({bare:e=!1}){const t=R(r=>r.settings.reducedMotion),a=R(r=>r.viewMode==="process")&&!e;return s.jsxs("div",{className:"relative w-full h-full bg-base",children:[s.jsxs(ge,{camera:{position:[4.6,3.4,4.6],fov:45},dpr:[1,2],gl:{antialias:!0,preserveDrawingBuffer:!0},children:[s.jsx("ambientLight",{intensity:.35}),s.jsx("directionalLight",{position:[6,8,4],intensity:.7}),s.jsxs("group",{"rotation-x":-Math.PI/2,children:[s.jsx(Ge,{majorR:N,minorR:Ye}),s.jsx(Ke,{majorR:N}),!a&&s.jsx(et,{}),!a&&s.jsx(qe,{}),!a&&s.jsx(Xe,{}),!a&&s.jsx(st,{}),!a&&s.jsx(Je,{}),!a&&s.jsx(tt,{}),!a&&s.jsx(at,{}),s.jsx(rt,{})]}),s.jsx(it,{}),s.jsx(ve,{}),s.jsx(_e,{enablePan:!1,minDistance:3.2,maxDistance:12,maxPolarAngle:Math.PI*.85,autoRotate:!t,autoRotateSpeed:.35})]}),!e&&s.jsx(ot,{}),!e&&s.jsx(nt,{}),!e&&s.jsx(Se,{}),!e&&s.jsx("div",{className:"absolute bottom-1.5 left-2 label-mono text-[8px] text-slate-500 pointer-events-none",children:"drag to orbit / scroll to zoom"})]})}export{dt as default};
