import{F as e,V as t,_ as n}from"./types-DOsICeG5.js";import{a as r,f as i}from"./emotes-Do0S3dlX.js";import{$n as a,A as o,B as s,Bn as c,Bt as l,C as u,D as d,Dn as f,Dt as p,E as m,Et as h,F as g,Ft as _,G as v,Gn as y,Gt as b,H as x,Hn as S,I as C,In as w,It as T,J as ee,Jn as te,K as E,Kn as D,L as O,Lt as ne,M as re,Mn as k,Mt as ie,Nn as ae,Ot as oe,Pn as se,Pt as ce,Q as le,Rt as ue,St as de,T as fe,Tt as pe,Un as me,V as he,Vn as ge,Vt as _e,Wn as ve,Wt as ye,X as A,Xn as be,Y as j,Yn as xe,Zn as Se,_ as M,_r as Ce,_t as N,ar as P,b as we,br as Te,bt as Ee,cr as De,d as Oe,dr as ke,dt as Ae,et as je,fr as Me,ft as Ne,g as Pe,gr as Fe,gt as F,hr as Ie,ht as Le,i as Re,j as ze,jn as Be,k as Ve,kt as He,l as Ue,lr as We,lt as Ge,mr as Ke,mt as qe,n as Je,nt as Ye,or as I,pr as Xe,pt as Ze,q as Qe,r as $e,rt as et,sr as tt,t as nt,tr as rt,tt as it,u as at,ur as ot,v as st,vr as ct,vt as lt,w as ut,x as dt,xt as ft,y as pt,yr as mt,yt as ht,z as gt,zn as _t}from"./build-iDXz4vzK.js";import{r as vt,t as yt}from"./hats-BF0AU3zN.js";import{$ as L,A as bt,B as xt,C as St,D as R,E as Ct,F as wt,G as Tt,H as Et,I as Dt,J as Ot,K as z,L as kt,M as At,N as jt,O as Mt,P as Nt,Q as Pt,R as Ft,S as It,T as Lt,U as Rt,V as B,W as zt,X as Bt,Y as Vt,Z as Ht,_ as Ut,a as Wt,at as Gt,b as Kt,c as qt,ct as Jt,d as Yt,dt as Xt,et as Zt,f as Qt,ft as $t,g as en,h as V,i as H,it as tn,j as nn,k as U,l as rn,lt as an,m as W,mt as on,n as G,nt as K,o as sn,ot as cn,p as ln,pt as un,q,r as dn,rt as fn,s as pn,st as mn,t as hn,tt as gn,u as _n,ut as vn,v as J,w as yn,x as bn,y as Y,z as xn}from"./pets-iMI9hGut.js";function Sn(){let e=null,t=!1,n=null,r=null;function i(t,a){n(t,a),r=e.requestAnimationFrame(i)}return{start:function(){t!==!0&&n!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function Cn(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var X={alphahash_fragment:`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,alphahash_pars_fragment:`#ifdef USE_ALPHAHASH
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
#endif`,alphamap_fragment:`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,alphamap_pars_fragment:`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,alphatest_fragment:`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,alphatest_pars_fragment:`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,aomap_fragment:`#ifdef USE_AOMAP
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
#endif`,aomap_pars_fragment:`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,batching_pars_vertex:`#ifdef USE_BATCHING
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
#endif`,batching_vertex:`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,begin_vertex:`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,beginnormal_vertex:`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,bsdfs:`float G_BlinnPhong_Implicit( ) {
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
} // validated`,iridescence_fragment:`#ifdef USE_IRIDESCENCE
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
#endif`,bumpmap_pars_fragment:`#ifdef USE_BUMPMAP
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
#endif`,clipping_planes_fragment:`#if NUM_CLIPPING_PLANES > 0
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
#endif`,clipping_planes_pars_fragment:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,clipping_planes_pars_vertex:`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,clipping_planes_vertex:`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,color_fragment:`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,color_pars_fragment:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,color_pars_vertex:`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,color_vertex:`#if defined( USE_COLOR_ALPHA )
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
#endif`,common:`#define PI 3.141592653589793
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
} // validated`,cube_uv_reflection_fragment:`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,defaultnormal_vertex:`vec3 transformedNormal = objectNormal;
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
#endif`,displacementmap_pars_vertex:`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,displacementmap_vertex:`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,emissivemap_fragment:`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,emissivemap_pars_fragment:`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,colorspace_fragment:`gl_FragColor = linearToOutputTexel( gl_FragColor );`,colorspace_pars_fragment:`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,envmap_fragment:`#ifdef USE_ENVMAP
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
#endif`,envmap_common_pars_fragment:`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,envmap_pars_fragment:`#ifdef USE_ENVMAP
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
#endif`,envmap_pars_vertex:`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,envmap_physical_pars_fragment:`#ifdef USE_ENVMAP
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
#endif`,envmap_vertex:`#ifdef USE_ENVMAP
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
#endif`,fog_vertex:`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,fog_pars_vertex:`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fog_fragment:`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,fog_pars_fragment:`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,gradientmap_pars_fragment:`#ifdef USE_GRADIENTMAP
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
}`,lightmap_pars_fragment:`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,lights_lambert_fragment:`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,lights_lambert_pars_fragment:`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,lights_pars_begin:`uniform bool receiveShadow;
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
#endif`,lights_toon_fragment:`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,lights_toon_pars_fragment:`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lights_phong_fragment:`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,lights_phong_pars_fragment:`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,lights_physical_fragment:`PhysicalMaterial material;
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
#endif`,lights_physical_pars_fragment:`struct PhysicalMaterial {
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
}`,lights_fragment_begin:`
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
#endif`,lights_fragment_maps:`#if defined( RE_IndirectDiffuse )
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
#endif`,lights_fragment_end:`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,logdepthbuf_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,logdepthbuf_pars_fragment:`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_pars_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,logdepthbuf_vertex:`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,map_fragment:`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,map_pars_fragment:`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,map_particle_fragment:`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,map_particle_pars_fragment:`#if defined( USE_POINTS_UV )
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
#endif`,metalnessmap_fragment:`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,metalnessmap_pars_fragment:`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,morphinstance_vertex:`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,morphcolor_vertex:`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,morphnormal_vertex:`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,morphtarget_pars_vertex:`#ifdef USE_MORPHTARGETS
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
#endif`,morphtarget_vertex:`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,normal_fragment_begin:`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,normal_fragment_maps:`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,normal_pars_fragment:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_pars_vertex:`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,normal_vertex:`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,normalmap_pars_fragment:`#ifdef USE_NORMALMAP
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
#endif`,clearcoat_normal_fragment_begin:`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,clearcoat_normal_fragment_maps:`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,clearcoat_pars_fragment:`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,iridescence_pars_fragment:`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,opaque_fragment:`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,packing:`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,premultiplied_alpha_fragment:`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,project_vertex:`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,dithering_fragment:`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,dithering_pars_fragment:`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,roughnessmap_fragment:`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,roughnessmap_pars_fragment:`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,shadowmap_pars_fragment:`#if NUM_SPOT_LIGHT_COORDS > 0
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
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
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
#endif`,shadowmap_pars_vertex:`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,shadowmap_vertex:`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,shadowmask_pars_fragment:`float getShadowMask() {
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
}`,skinbase_vertex:`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,skinning_pars_vertex:`#ifdef USE_SKINNING
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
#endif`,skinning_vertex:`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,skinnormal_vertex:`#ifdef USE_SKINNING
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
#endif`,specularmap_fragment:`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,specularmap_pars_fragment:`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tonemapping_fragment:`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,tonemapping_pars_fragment:`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,transmission_fragment:`#ifdef USE_TRANSMISSION
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
#endif`,transmission_pars_fragment:`#ifdef USE_TRANSMISSION
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
#endif`,uv_pars_fragment:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,uv_pars_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,uv_vertex:`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,worldpos_vertex:`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,background_vert:`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,background_frag:`uniform sampler2D t2D;
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
}`,backgroundCube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,backgroundCube_frag:`#ifdef ENVMAP_TYPE_CUBE
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
}`,cube_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cube_frag:`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,depth_vert:`#include <common>
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
}`,depth_frag:`#if DEPTH_PACKING == 3200
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
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,distanceRGBA_vert:`#define DISTANCE
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
}`,distanceRGBA_frag:`#define DISTANCE
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
}`,equirect_vert:`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,equirect_frag:`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,linedashed_vert:`uniform float scale;
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
}`,linedashed_frag:`uniform vec3 diffuse;
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
}`,meshbasic_vert:`#include <common>
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
}`,meshbasic_frag:`uniform vec3 diffuse;
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
}`,meshlambert_vert:`#define LAMBERT
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
}`,meshlambert_frag:`#define LAMBERT
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
}`,meshmatcap_vert:`#define MATCAP
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
}`,meshmatcap_frag:`#define MATCAP
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
}`,meshnormal_vert:`#define NORMAL
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
}`,meshnormal_frag:`#define NORMAL
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
}`,meshphong_vert:`#define PHONG
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
}`,meshphong_frag:`#define PHONG
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
}`,meshphysical_vert:`#define STANDARD
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
}`,meshphysical_frag:`#define STANDARD
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
}`,meshtoon_vert:`#define TOON
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
}`,meshtoon_frag:`#define TOON
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
}`,points_vert:`uniform float size;
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
}`,points_frag:`uniform vec3 diffuse;
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
}`,shadow_vert:`#include <common>
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
}`,shadow_frag:`uniform vec3 color;
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
}`,sprite_vert:`uniform float rotation;
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
}`,sprite_frag:`uniform vec3 diffuse;
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
}`},Z={common:{diffuse:{value:new Ve(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new N},alphaMap:{value:null},alphaMapTransform:{value:new N},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new N}},envmap:{envMap:{value:null},envMapRotation:{value:new N},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new N}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new N}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new N},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new N},normalScale:{value:new P(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new N},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new N}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new N}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new N}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ve(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ve(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new N},alphaTest:{value:0},uvTransform:{value:new N}},sprite:{diffuse:{value:new Ve(16777215)},opacity:{value:1},center:{value:new P(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new N},alphaMap:{value:null},alphaMapTransform:{value:new N},alphaTest:{value:0}}},wn={basic:{uniforms:ct([Z.common,Z.specularmap,Z.envmap,Z.aomap,Z.lightmap,Z.fog]),vertexShader:X.meshbasic_vert,fragmentShader:X.meshbasic_frag},lambert:{uniforms:ct([Z.common,Z.specularmap,Z.envmap,Z.aomap,Z.lightmap,Z.emissivemap,Z.bumpmap,Z.normalmap,Z.displacementmap,Z.fog,Z.lights,{emissive:{value:new Ve(0)}}]),vertexShader:X.meshlambert_vert,fragmentShader:X.meshlambert_frag},phong:{uniforms:ct([Z.common,Z.specularmap,Z.envmap,Z.aomap,Z.lightmap,Z.emissivemap,Z.bumpmap,Z.normalmap,Z.displacementmap,Z.fog,Z.lights,{emissive:{value:new Ve(0)},specular:{value:new Ve(1118481)},shininess:{value:30}}]),vertexShader:X.meshphong_vert,fragmentShader:X.meshphong_frag},standard:{uniforms:ct([Z.common,Z.envmap,Z.aomap,Z.lightmap,Z.emissivemap,Z.bumpmap,Z.normalmap,Z.displacementmap,Z.roughnessmap,Z.metalnessmap,Z.fog,Z.lights,{emissive:{value:new Ve(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:X.meshphysical_vert,fragmentShader:X.meshphysical_frag},toon:{uniforms:ct([Z.common,Z.aomap,Z.lightmap,Z.emissivemap,Z.bumpmap,Z.normalmap,Z.displacementmap,Z.gradientmap,Z.fog,Z.lights,{emissive:{value:new Ve(0)}}]),vertexShader:X.meshtoon_vert,fragmentShader:X.meshtoon_frag},matcap:{uniforms:ct([Z.common,Z.bumpmap,Z.normalmap,Z.displacementmap,Z.fog,{matcap:{value:null}}]),vertexShader:X.meshmatcap_vert,fragmentShader:X.meshmatcap_frag},points:{uniforms:ct([Z.points,Z.fog]),vertexShader:X.points_vert,fragmentShader:X.points_frag},dashed:{uniforms:ct([Z.common,Z.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:X.linedashed_vert,fragmentShader:X.linedashed_frag},depth:{uniforms:ct([Z.common,Z.displacementmap]),vertexShader:X.depth_vert,fragmentShader:X.depth_frag},normal:{uniforms:ct([Z.common,Z.bumpmap,Z.normalmap,Z.displacementmap,{opacity:{value:1}}]),vertexShader:X.meshnormal_vert,fragmentShader:X.meshnormal_frag},sprite:{uniforms:ct([Z.sprite,Z.fog]),vertexShader:X.sprite_vert,fragmentShader:X.sprite_frag},background:{uniforms:{uvTransform:{value:new N},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:X.background_vert,fragmentShader:X.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new N}},vertexShader:X.backgroundCube_vert,fragmentShader:X.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:X.cube_vert,fragmentShader:X.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:X.equirect_vert,fragmentShader:X.equirect_frag},distanceRGBA:{uniforms:ct([Z.common,Z.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:X.distanceRGBA_vert,fragmentShader:X.distanceRGBA_frag},shadow:{uniforms:ct([Z.lights,Z.fog,{color:{value:new Ve(0)},opacity:{value:1}}]),vertexShader:X.shadow_vert,fragmentShader:X.shadow_frag}};wn.physical={uniforms:ct([wn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new N},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new N},clearcoatNormalScale:{value:new P(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new N},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new N},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new N},sheen:{value:0},sheenColor:{value:new Ve(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new N},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new N},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new N},transmissionSamplerSize:{value:new P},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new N},attenuationDistance:{value:0},attenuationColor:{value:new Ve(0)},specularColor:{value:new Ve(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new N},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new N},anisotropyVector:{value:new P},anisotropyMap:{value:null},anisotropyMapTransform:{value:new N}}]),vertexShader:X.meshphysical_vert,fragmentShader:X.meshphysical_frag};var Tn={r:0,b:0,g:0},En=new v,Dn=new lt;function On(e,t,n,r,i,a,s){let c=new Ve(0),l=a===!0?0:1,u,d,f=null,p=0,m=null;function h(e){let r=e.isScene===!0?e.background:null;return r&&r.isTexture&&(r=(e.backgroundBlurriness>0?n:t).get(r)),r}function g(t){let n=!1,i=h(t);i===null?v(c,l):i&&i.isColor&&(v(i,1),n=!0);let a=e.xr.getEnvironmentBlendMode();a===`additive`?r.buffers.color.setClear(0,0,0,1,s):a===`alpha-blend`&&r.buffers.color.setClear(0,0,0,0,s),(e.autoClear||n)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function _(t,n){let r=h(n);r&&(r.isCubeTexture||r.mapping===306)?(d===void 0&&(d=new ht(new pt(1,1,1),new se({name:`BackgroundCubeMaterial`,uniforms:Xe(wn.backgroundCube.uniforms),vertexShader:wn.backgroundCube.vertexShader,fragmentShader:wn.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),d.geometry.deleteAttribute(`normal`),d.geometry.deleteAttribute(`uv`),d.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(d.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(d)),En.copy(n.backgroundRotation),En.x*=-1,En.y*=-1,En.z*=-1,r.isCubeTexture&&r.isRenderTargetTexture===!1&&(En.y*=-1,En.z*=-1),d.material.uniforms.envMap.value=r,d.material.uniforms.flipEnvMap.value=r.isCubeTexture&&r.isRenderTargetTexture===!1?-1:1,d.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,d.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,d.material.uniforms.backgroundRotation.value.setFromMatrix4(Dn.makeRotationFromEuler(En)),d.material.toneMapped=o.getTransfer(r.colorSpace)!==k,(f!==r||p!==r.version||m!==e.toneMapping)&&(d.material.needsUpdate=!0,f=r,p=r.version,m=e.toneMapping),d.layers.enableAll(),t.unshift(d,d.geometry,d.material,0,0,null)):r&&r.isTexture&&(u===void 0&&(u=new ht(new T(2,2),new se({name:`BackgroundMaterial`,uniforms:Xe(wn.background.uniforms),vertexShader:wn.background.vertexShader,fragmentShader:wn.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute(`normal`),Object.defineProperty(u.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(u)),u.material.uniforms.t2D.value=r,u.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,u.material.toneMapped=o.getTransfer(r.colorSpace)!==k,r.matrixAutoUpdate===!0&&r.updateMatrix(),u.material.uniforms.uvTransform.value.copy(r.matrix),(f!==r||p!==r.version||m!==e.toneMapping)&&(u.material.needsUpdate=!0,f=r,p=r.version,m=e.toneMapping),u.layers.enableAll(),t.unshift(u,u.geometry,u.material,0,0,null))}function v(t,n){t.getRGB(Tn,Ce(e)),r.buffers.color.setClear(Tn.r,Tn.g,Tn.b,n,s)}function y(){d!==void 0&&(d.geometry.dispose(),d.material.dispose(),d=void 0),u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0)}return{getClearColor:function(){return c},setClearColor:function(e,t=1){c.set(e),l=t,v(c,l)},getClearAlpha:function(){return l},setClearAlpha:function(e){l=e,v(c,l)},render:g,addToRenderList:_,dispose:y}}function kn(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n){let i=n.wireframe===!0,a=r[e.id];a===void 0&&(a={},r[e.id]=a);let o=a[t.id];o===void 0&&(o={},a[t.id]=o);let s=o[i];return s===void 0&&(s=f(c()),o[i]=s),s}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){w();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e.id]}function C(e){for(let t in r){let n=r[t];if(n[e.id]===void 0)continue;let i=n[e.id];for(let e in i)u(i[e].object),delete i[e];delete n[e.id]}}function w(){T(),o=!0,a!==i&&(a=i,l(a.object))}function T(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:w,resetDefaultState:T,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function An(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}function c(e,i,a,s){if(a===0)return;let c=t.get(`WEBGL_multi_draw`);if(c===null)for(let t=0;t<e.length;t++)o(e[t],i[t],s[t]);else{c.multiDrawArraysInstancedWEBGL(r,e,0,i,0,s,0,a);let t=0;for(let e=0;e<a;e++)t+=i[e]*s[e];n.update(t,r,1)}}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s,this.renderMultiDrawInstances=c}function jn(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&n!==1015&&!i)}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(console.warn(`THREE.WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=m>0,S=e.getParameter(e.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,vertexTextures:x,maxSamples:S}}function Mn(e){let t=this,n=null,r=0,i=!1,a=!1,o=new _,s=new N,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}function Nn(e){let t=new WeakMap;function n(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function r(r){if(r&&r.isTexture){let a=r.mapping;if(a===303||a===304){if(t.has(r)){let e=t.get(r).texture;return n(e,r.mapping)}{let a=r.image;if(a&&a.height>0){let o=new We(a.height);return o.fromEquirectangularTexture(e,r),t.set(r,o),r.addEventListener(`dispose`,i),n(o.texture,r.mapping)}return null}}}return r}function i(e){let n=e.target;n.removeEventListener(`dispose`,i);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function a(){t=new WeakMap}return{get:r,dispose:a}}var Pn=4,Fn=[.125,.215,.35,.446,.526,.582],In=20,Ln=new ie,Rn=new Ve,zn=null,Bn=0,Vn=0,Hn=!1,Un=(1+Math.sqrt(5))/2,Wn=1/Un,Gn=[new I(-Un,Wn,0),new I(Un,Wn,0),new I(-Wn,0,Un),new I(Wn,0,Un),new I(0,Un,-Wn),new I(0,Un,Wn),new I(-1,1,-1),new I(1,1,-1),new I(-1,1,1),new I(1,1,1)],Kn=new I,qn=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=Kn}=i;zn=this._renderer.getRenderTarget(),Bn=this._renderer.getActiveCubeFace(),Vn=this._renderer.getActiveMipmapLevel(),Hn=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=$n(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Qn(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(zn,Bn,Vn),this._renderer.xr.enabled=Hn,e.scissorTest=!1,Xn(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),zn=this._renderer.getRenderTarget(),Bn=this._renderer.getActiveCubeFace(),Vn=this._renderer.getActiveMipmapLevel(),Hn=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Ae,minFilter:Ae,generateMipmaps:!1,type:it,format:b,colorSpace:qe,depthBuffer:!1},r=Yn(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Yn(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Jn(r)),this._blurMaterial=Zn(r,e,t)}return r}_compileMaterial(e){let t=new ht(this._lodPlanes[0],e);this._renderer.compile(t,Ln)}_sceneToCubeUV(e,t,n,r,i){let a=new ce(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(Rn),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null));let d=new Ee({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1}),f=new ht(new pt,d),p=!1,m=e.background;m?m.isColor&&(d.color.copy(m),e.background=null,p=!0):(d.color.copy(Rn),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;Xn(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(f,a),c.render(e,a)}f.geometry.dispose(),f.material.dispose(),c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=$n()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Qn());let i=r?this._cubemapMaterial:this._equirectMaterial,a=new ht(this._lodPlanes[0],i),o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;Xn(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,Ln)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodPlanes.length;for(let t=1;t<r;t++){let n=Math.sqrt(this._sigmas[t]*this._sigmas[t]-this._sigmas[t-1]*this._sigmas[t-1]),i=Gn[(r-t-1)%Gn.length];this._blur(e,t-1,t,n,i)}t.autoClear=n}_blur(e,t,n,r,i){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,r,`latitudinal`,i),this._halfBlur(a,e,n,n,r,`longitudinal`,i)}_halfBlur(e,t,n,r,i,a,o){let s=this._renderer,c=this._blurMaterial;a!==`latitudinal`&&a!==`longitudinal`&&console.error(`blur direction must be either latitudinal or longitudinal!`);let l=new ht(this._lodPlanes[r],c),u=c.uniforms,d=this._sizeLods[n]-1,f=isFinite(i)?Math.PI/(2*d):2*Math.PI/39,p=i/f,m=isFinite(i)?1+Math.floor(3*p):In;m>In&&console.warn(`sigmaRadians, ${i}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${In}`);let h=[],g=0;for(let e=0;e<In;++e){let t=e/p,n=Math.exp(-t*t/2);h.push(n),e===0?g+=n:e<m&&(g+=2*n)}for(let e=0;e<h.length;e++)h[e]=h[e]/g;u.envMap.value=e.texture,u.samples.value=m,u.weights.value=h,u.latitudinal.value=a===`latitudinal`,o&&(u.poleAxis.value=o);let{_lodMax:_}=this;u.dTheta.value=f,u.mipInt.value=_-n;let v=this._sizeLods[r];Xn(t,3*v*(r>_-Pn?r-_+Pn:0),4*(this._cubeSize-v),3*v,2*v),s.setRenderTarget(t),s.render(l,Ln)}};function Jn(e){let t=[],n=[],r=[],i=e,a=e-Pn+1+Fn.length;for(let o=0;o<a;o++){let a=2**i;n.push(a);let s=1/a;o>e-Pn?s=Fn[o-e+Pn-1]:o===0&&(s=0),r.push(s);let c=1/(a-2),l=-c,u=1+c,d=[l,l,u,l,u,u,l,l,u,u,l,u],f=new Float32Array(108),p=new Float32Array(72),m=new Float32Array(36);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];f.set(r,18*e),p.set(d,12*e);let i=[e,e,e,e,e,e];m.set(i,6*e)}let h=new dt;h.setAttribute(`position`,new we(f,3)),h.setAttribute(`uv`,new we(p,2)),h.setAttribute(`faceIndex`,new we(m,1)),t.push(h),i>Pn&&i--}return{lodPlanes:t,sizeLods:n,sigmas:r}}function Yn(e,t,n){let r=new ot(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function Xn(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function Zn(e,t,n){let r=new Float32Array(In),i=new I(0,1,0);return new se({name:`SphericalGaussianBlur`,defines:{n:In,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:er(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function Qn(){return new se({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:er(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function $n(){return new se({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:er(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function er(){return`

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
	`}function tr(e){let t=new WeakMap,n=null;function r(r){if(r&&r.isTexture){let o=r.mapping,s=o===303||o===304,c=o===301||o===302;if(s||c){let o=t.get(r),l=o===void 0?0:o.texture.pmremVersion;if(r.isRenderTargetTexture&&r.pmremVersion!==l)return n===null&&(n=new qn(e)),o=s?n.fromEquirectangular(r,o):n.fromCubemap(r,o),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),o.texture;if(o!==void 0)return o.texture;{let l=r.image;return s&&l&&l.height>0||c&&l&&i(l)?(n===null&&(n=new qn(e)),o=s?n.fromEquirectangular(r):n.fromCubemap(r),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),r.addEventListener(`dispose`,a),o.texture):null}}}return r}function i(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function a(e){let n=e.target;n.removeEventListener(`dispose`,a);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function o(){t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:r,dispose:o}}function nr(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r;switch(n){case`WEBGL_depth_texture`:r=e.getExtension(`WEBGL_depth_texture`)||e.getExtension(`MOZ_WEBGL_depth_texture`)||e.getExtension(`WEBKIT_WEBGL_depth_texture`);break;case`EXT_texture_filter_anisotropic`:r=e.getExtension(`EXT_texture_filter_anisotropic`)||e.getExtension(`MOZ_EXT_texture_filter_anisotropic`)||e.getExtension(`WEBKIT_EXT_texture_filter_anisotropic`);break;case`WEBGL_compressed_texture_s3tc`:r=e.getExtension(`WEBGL_compressed_texture_s3tc`)||e.getExtension(`MOZ_WEBGL_compressed_texture_s3tc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_s3tc`);break;case`WEBGL_compressed_texture_pvrtc`:r=e.getExtension(`WEBGL_compressed_texture_pvrtc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_pvrtc`);break;default:r=e.getExtension(n)}return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&Te(`THREE.WebGLRenderer: `+e+` extension not supported.`),t}}}function rr(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0||(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++),t}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else if(i!==void 0){let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}else return;let s=new(Me(n)?xe:te)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function ir(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}function d(e,i,s,c){if(s===0)return;let u=t.get(`WEBGL_multi_draw`);if(u===null)for(let t=0;t<e.length;t++)l(e[t]/o,i[t],c[t]);else{u.multiDrawElementsInstancedWEBGL(r,i,0,a,e,0,c,0,s);let t=0;for(let e=0;e<s;e++)t+=i[e]*c[e];n.update(t,r,1)}}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function ar(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:console.error(`THREE.WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function or(e,t,n){let r=new WeakMap,i=new tt;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new O(h,p,m,u);g.type=A,g.needsUpdate=!0;let _=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*_;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new P(p,m)},r.set(o,d);function v(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,v)}o.addEventListener(`dispose`,v)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function sr(e,t,n,r){let i=new WeakMap;function a(a){let o=r.render.frame,c=a.geometry,l=t.get(a,c);if(i.get(l)!==o&&(t.update(l),i.set(l,o)),a.isInstancedMesh&&(a.hasEventListener(`dispose`,s)===!1&&a.addEventListener(`dispose`,s),i.get(a)!==o&&(n.update(a.instanceMatrix,e.ARRAY_BUFFER),a.instanceColor!==null&&n.update(a.instanceColor,e.ARRAY_BUFFER),i.set(a,o))),a.isSkinnedMesh){let e=a.skeleton;i.get(e)!==o&&(e.update(),i.set(e,o))}return l}function o(){i=new WeakMap}function s(e){let t=e.target;t.removeEventListener(`dispose`,s),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:a,dispose:o}}var cr=new y,lr=new he(1,1),ur=new O,dr=new C,fr=new re,pr=[],mr=[],hr=new Float32Array(16),gr=new Float32Array(9),_r=new Float32Array(4);function vr(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=pr[i];if(a===void 0&&(a=new Float32Array(i),pr[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function yr(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function br(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function xr(e,t){let n=mr[t];n===void 0&&(n=new Int32Array(t),mr[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function Sr(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Cr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(yr(n,t))return;e.uniform2fv(this.addr,t),br(n,t)}}function wr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(yr(n,t))return;e.uniform3fv(this.addr,t),br(n,t)}}function Tr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(yr(n,t))return;e.uniform4fv(this.addr,t),br(n,t)}}function Er(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(yr(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),br(n,t)}else{if(yr(n,r))return;_r.set(r),e.uniformMatrix2fv(this.addr,!1,_r),br(n,r)}}function Dr(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(yr(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),br(n,t)}else{if(yr(n,r))return;gr.set(r),e.uniformMatrix3fv(this.addr,!1,gr),br(n,r)}}function Or(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(yr(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),br(n,t)}else{if(yr(n,r))return;hr.set(r),e.uniformMatrix4fv(this.addr,!1,hr),br(n,r)}}function kr(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function Ar(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(yr(n,t))return;e.uniform2iv(this.addr,t),br(n,t)}}function jr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(yr(n,t))return;e.uniform3iv(this.addr,t),br(n,t)}}function Mr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(yr(n,t))return;e.uniform4iv(this.addr,t),br(n,t)}}function Nr(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function Pr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(yr(n,t))return;e.uniform2uiv(this.addr,t),br(n,t)}}function Fr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(yr(n,t))return;e.uniform3uiv(this.addr,t),br(n,t)}}function Ir(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(yr(n,t))return;e.uniform4uiv(this.addr,t),br(n,t)}}function Lr(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(lr.compareFunction=515,a=lr):a=cr,n.setTexture2D(t||a,i)}function Rr(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||dr,i)}function zr(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||fr,i)}function Br(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||ur,i)}function Vr(e){switch(e){case 5126:return Sr;case 35664:return Cr;case 35665:return wr;case 35666:return Tr;case 35674:return Er;case 35675:return Dr;case 35676:return Or;case 5124:case 35670:return kr;case 35667:case 35671:return Ar;case 35668:case 35672:return jr;case 35669:case 35673:return Mr;case 5125:return Nr;case 36294:return Pr;case 36295:return Fr;case 36296:return Ir;case 35678:case 36198:case 36298:case 36306:case 35682:return Lr;case 35679:case 36299:case 36307:return Rr;case 35680:case 36300:case 36308:case 36293:return zr;case 36289:case 36303:case 36311:case 36292:return Br}}function Hr(e,t){e.uniform1fv(this.addr,t)}function Ur(e,t){let n=vr(t,this.size,2);e.uniform2fv(this.addr,n)}function Wr(e,t){let n=vr(t,this.size,3);e.uniform3fv(this.addr,n)}function Gr(e,t){let n=vr(t,this.size,4);e.uniform4fv(this.addr,n)}function Kr(e,t){let n=vr(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function qr(e,t){let n=vr(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function Jr(e,t){let n=vr(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function Yr(e,t){e.uniform1iv(this.addr,t)}function Xr(e,t){e.uniform2iv(this.addr,t)}function Zr(e,t){e.uniform3iv(this.addr,t)}function Qr(e,t){e.uniform4iv(this.addr,t)}function $r(e,t){e.uniform1uiv(this.addr,t)}function ei(e,t){e.uniform2uiv(this.addr,t)}function ti(e,t){e.uniform3uiv(this.addr,t)}function ni(e,t){e.uniform4uiv(this.addr,t)}function ri(e,t,n){let r=this.cache,i=t.length,a=xr(n,i);yr(r,a)||(e.uniform1iv(this.addr,a),br(r,a));for(let e=0;e!==i;++e)n.setTexture2D(t[e]||cr,a[e])}function ii(e,t,n){let r=this.cache,i=t.length,a=xr(n,i);yr(r,a)||(e.uniform1iv(this.addr,a),br(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||dr,a[e])}function ai(e,t,n){let r=this.cache,i=t.length,a=xr(n,i);yr(r,a)||(e.uniform1iv(this.addr,a),br(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||fr,a[e])}function oi(e,t,n){let r=this.cache,i=t.length,a=xr(n,i);yr(r,a)||(e.uniform1iv(this.addr,a),br(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||ur,a[e])}function si(e){switch(e){case 5126:return Hr;case 35664:return Ur;case 35665:return Wr;case 35666:return Gr;case 35674:return Kr;case 35675:return qr;case 35676:return Jr;case 5124:case 35670:return Yr;case 35667:case 35671:return Xr;case 35668:case 35672:return Zr;case 35669:case 35673:return Qr;case 5125:return $r;case 36294:return ei;case 36295:return ti;case 36296:return ni;case 35678:case 36198:case 36298:case 36306:case 35682:return ri;case 35679:case 36299:case 36307:return ii;case 35680:case 36300:case 36308:case 36293:return ai;case 36289:case 36303:case 36311:case 36292:return oi}}var ci=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Vr(t.type)}},li=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=si(t.type)}},ui=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},di=/(\w+)(\])?(\[|\.)?/g;function fi(e,t){e.seq.push(t),e.map[t.id]=t}function pi(e,t,n){let r=e.name,i=r.length;for(di.lastIndex=0;;){let a=di.exec(r),o=di.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){fi(n,l===void 0?new ci(s,e,t):new li(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new ui(s),fi(n,e)),n=e}}}var mi=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);pi(n,e.getUniformLocation(t,n.name),this)}}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function hi(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var gi=37297,_i=0;function vi(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var yi=new N;function bi(e){o._getMatrix(yi,o.workingColorSpace,e);let t=`mat3( ${yi.elements.map(e=>e.toFixed(4))} )`;switch(o.getTransfer(e)){case Le:return[t,`LinearTransferOETF`];case k:return[t,`sRGBTransferOETF`];default:return console.warn(`THREE.WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function xi(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+vi(e.getShaderSource(t),r)}return i}function Si(e,t){let n=bi(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}function Ci(e,t){let n;switch(t){case 1:n=`Linear`;break;case 2:n=`Reinhard`;break;case 3:n=`Cineon`;break;case 4:n=`ACESFilmic`;break;case 6:n=`AgX`;break;case 7:n=`Neutral`;break;case 5:n=`Custom`;break;default:console.warn(`THREE.WebGLProgram: Unsupported toneMapping:`,t),n=`Linear`}return`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var wi=new I;function Ti(){return o.getLuminanceCoefficients(wi),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${wi.x.toFixed(4)}, ${wi.y.toFixed(4)}, ${wi.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function Ei(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(ki).join(`
`)}function Di(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function Oi(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function ki(e){return e!==``}function Ai(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function ji(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Mi=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ni(e){return e.replace(Mi,Fi)}var Pi=new Map;function Fi(e,t){let n=X[t];if(n===void 0){let e=Pi.get(t);if(e!==void 0)n=X[e],console.warn(`THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`Can not resolve #include <`+t+`>`)}return Ni(n)}var Ii=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Li(e){return e.replace(Ii,Ri)}function Ri(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function zi(e){let t=`precision ${e.precision} float;
	precision ${e.precision} int;
	precision ${e.precision} sampler2D;
	precision ${e.precision} samplerCube;
	precision ${e.precision} sampler3D;
	precision ${e.precision} sampler2DArray;
	precision ${e.precision} sampler2DShadow;
	precision ${e.precision} samplerCubeShadow;
	precision ${e.precision} sampler2DArrayShadow;
	precision ${e.precision} isampler2D;
	precision ${e.precision} isampler3D;
	precision ${e.precision} isamplerCube;
	precision ${e.precision} isampler2DArray;
	precision ${e.precision} usampler2D;
	precision ${e.precision} usampler3D;
	precision ${e.precision} usamplerCube;
	precision ${e.precision} usampler2DArray;
	`;return e.precision===`highp`?t+=`
#define HIGH_PRECISION`:e.precision===`mediump`?t+=`
#define MEDIUM_PRECISION`:e.precision===`lowp`&&(t+=`
#define LOW_PRECISION`),t}function Bi(e){let t=`SHADOWMAP_TYPE_BASIC`;return e.shadowMapType===1?t=`SHADOWMAP_TYPE_PCF`:e.shadowMapType===2?t=`SHADOWMAP_TYPE_PCF_SOFT`:e.shadowMapType===3&&(t=`SHADOWMAP_TYPE_VSM`),t}function Vi(e){let t=`ENVMAP_TYPE_CUBE`;if(e.envMap)switch(e.envMapMode){case 301:case 302:t=`ENVMAP_TYPE_CUBE`;break;case 306:t=`ENVMAP_TYPE_CUBE_UV`}return t}function Hi(e){let t=`ENVMAP_MODE_REFLECTION`;if(e.envMap)switch(e.envMapMode){case 302:t=`ENVMAP_MODE_REFRACTION`}return t}function Ui(e){let t=`ENVMAP_BLENDING_NONE`;if(e.envMap)switch(e.combine){case 0:t=`ENVMAP_BLENDING_MULTIPLY`;break;case 1:t=`ENVMAP_BLENDING_MIX`;break;case 2:t=`ENVMAP_BLENDING_ADD`}return t}function Wi(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function Gi(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=Bi(n),l=Vi(n),u=Hi(n),d=Ui(n),f=Wi(n),p=Ei(n),m=Di(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(ki).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(ki).join(`
`),_.length>0&&(_+=`
`)):(g=[zi(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(ki).join(`
`),_=[zi(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor||n.batchingColor?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:X.tonemapping_pars_fragment,n.toneMapping===0?``:Ci(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,X.colorspace_pars_fragment,Si(`linearToOutputTexel`,n.outputColorSpace),Ti(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(ki).join(`
`)),o=Ni(o),o=Ai(o,n),o=ji(o,n),s=Ni(s),s=Ai(s,n),s=ji(s,n),o=Li(o),s=Li(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=hi(i,i.VERTEX_SHADER,y),S=hi(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.morphTargets===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=xi(i,x,`vertex`),n=xi(i,S,`fragment`);console.error(`THREE.WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):console.warn(`THREE.WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new mi(i,h),T=Oi(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let ee=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return ee===!1&&(ee=i.getProgramParameter(h,gi)),ee},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=_i++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var Ki=0,qi=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),i=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(i)===!1&&(a.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Ji(e),t.set(e,n)),n}},Ji=class{constructor(e){this.id=Ki++,this.code=e,this.usedTimes=0}};function Yi(e,t,n,r,i,a,s){let c=new Ge,l=new qi,u=new Set,d=[],f=i.logarithmicDepthBuffer,p=i.vertexTextures,m=i.precision,h={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distanceRGBA`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function g(e){return u.add(e),e===0?`uv`:`uv${e}`}function _(a,c,d,_,v){let y=_.fog,b=v.geometry,x=a.isMeshStandardMaterial?_.environment:null,S=(a.isMeshStandardMaterial?n:t).get(a.envMap||x),C=S&&S.mapping===306?S.image.height:null,w=h[a.type];a.precision!==null&&(m=i.getMaxPrecision(a.precision),m!==a.precision&&console.warn(`THREE.WebGLProgram.getParameters:`,a.precision,`not supported, using`,m,`instead.`));let T=b.morphAttributes.position||b.morphAttributes.normal||b.morphAttributes.color,ee=T===void 0?0:T.length,te=0;b.morphAttributes.position!==void 0&&(te=1),b.morphAttributes.normal!==void 0&&(te=2),b.morphAttributes.color!==void 0&&(te=3);let E,D,O,ne;if(w){let e=wn[w];E=e.vertexShader,D=e.fragmentShader}else E=a.vertexShader,D=a.fragmentShader,l.update(a),O=l.getVertexShaderID(a),ne=l.getFragmentShaderID(a);let re=e.getRenderTarget(),k=e.state.buffers.depth.getReversed(),ie=v.isInstancedMesh===!0,ae=v.isBatchedMesh===!0,oe=!!a.map,se=!!a.matcap,ce=!!S,le=!!a.aoMap,ue=!!a.lightMap,de=!!a.bumpMap,fe=!!a.normalMap,pe=!!a.displacementMap,me=!!a.emissiveMap,he=!!a.metalnessMap,ge=!!a.roughnessMap,_e=a.anisotropy>0,ve=a.clearcoat>0,ye=a.dispersion>0,A=a.iridescence>0,be=a.sheen>0,j=a.transmission>0,xe=_e&&!!a.anisotropyMap,Se=ve&&!!a.clearcoatMap,M=ve&&!!a.clearcoatNormalMap,Ce=ve&&!!a.clearcoatRoughnessMap,N=A&&!!a.iridescenceMap,P=A&&!!a.iridescenceThicknessMap,we=be&&!!a.sheenColorMap,Te=be&&!!a.sheenRoughnessMap,Ee=!!a.specularMap,De=!!a.specularColorMap,Oe=!!a.specularIntensityMap,ke=j&&!!a.transmissionMap,Ae=j&&!!a.thicknessMap,je=!!a.gradientMap,Me=!!a.alphaMap,Ne=a.alphaTest>0,Pe=!!a.alphaHash,Fe=!!a.extensions,F=0;a.toneMapped&&(re===null||re.isXRRenderTarget===!0)&&(F=e.toneMapping);let Ie={shaderID:w,shaderType:a.type,shaderName:a.name,vertexShader:E,fragmentShader:D,defines:a.defines,customVertexShaderID:O,customFragmentShaderID:ne,isRawShaderMaterial:a.isRawShaderMaterial===!0,glslVersion:a.glslVersion,precision:m,batching:ae,batchingColor:ae&&v._colorsTexture!==null,instancing:ie,instancingColor:ie&&v.instanceColor!==null,instancingMorph:ie&&v.morphTexture!==null,supportsVertexTextures:p,outputColorSpace:re===null?e.outputColorSpace:re.isXRRenderTarget===!0?re.texture.colorSpace:qe,alphaToCoverage:!!a.alphaToCoverage,map:oe,matcap:se,envMap:ce,envMapMode:ce&&S.mapping,envMapCubeUVHeight:C,aoMap:le,lightMap:ue,bumpMap:de,normalMap:fe,displacementMap:p&&pe,emissiveMap:me,normalMapObjectSpace:fe&&a.normalMapType===1,normalMapTangentSpace:fe&&a.normalMapType===0,metalnessMap:he,roughnessMap:ge,anisotropy:_e,anisotropyMap:xe,clearcoat:ve,clearcoatMap:Se,clearcoatNormalMap:M,clearcoatRoughnessMap:Ce,dispersion:ye,iridescence:A,iridescenceMap:N,iridescenceThicknessMap:P,sheen:be,sheenColorMap:we,sheenRoughnessMap:Te,specularMap:Ee,specularColorMap:De,specularIntensityMap:Oe,transmission:j,transmissionMap:ke,thicknessMap:Ae,gradientMap:je,opaque:a.transparent===!1&&a.blending===1&&a.alphaToCoverage===!1,alphaMap:Me,alphaTest:Ne,alphaHash:Pe,combine:a.combine,mapUv:oe&&g(a.map.channel),aoMapUv:le&&g(a.aoMap.channel),lightMapUv:ue&&g(a.lightMap.channel),bumpMapUv:de&&g(a.bumpMap.channel),normalMapUv:fe&&g(a.normalMap.channel),displacementMapUv:pe&&g(a.displacementMap.channel),emissiveMapUv:me&&g(a.emissiveMap.channel),metalnessMapUv:he&&g(a.metalnessMap.channel),roughnessMapUv:ge&&g(a.roughnessMap.channel),anisotropyMapUv:xe&&g(a.anisotropyMap.channel),clearcoatMapUv:Se&&g(a.clearcoatMap.channel),clearcoatNormalMapUv:M&&g(a.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Ce&&g(a.clearcoatRoughnessMap.channel),iridescenceMapUv:N&&g(a.iridescenceMap.channel),iridescenceThicknessMapUv:P&&g(a.iridescenceThicknessMap.channel),sheenColorMapUv:we&&g(a.sheenColorMap.channel),sheenRoughnessMapUv:Te&&g(a.sheenRoughnessMap.channel),specularMapUv:Ee&&g(a.specularMap.channel),specularColorMapUv:De&&g(a.specularColorMap.channel),specularIntensityMapUv:Oe&&g(a.specularIntensityMap.channel),transmissionMapUv:ke&&g(a.transmissionMap.channel),thicknessMapUv:Ae&&g(a.thicknessMap.channel),alphaMapUv:Me&&g(a.alphaMap.channel),vertexTangents:!!b.attributes.tangent&&(fe||_e),vertexColors:a.vertexColors,vertexAlphas:a.vertexColors===!0&&!!b.attributes.color&&b.attributes.color.itemSize===4,pointsUvs:v.isPoints===!0&&!!b.attributes.uv&&(oe||Me),fog:!!y,useFog:a.fog===!0,fogExp2:!!y&&y.isFogExp2,flatShading:a.flatShading===!0&&a.wireframe===!1,sizeAttenuation:a.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:k,skinning:v.isSkinnedMesh===!0,morphTargets:b.morphAttributes.position!==void 0,morphNormals:b.morphAttributes.normal!==void 0,morphColors:b.morphAttributes.color!==void 0,morphTargetsCount:ee,morphTextureStride:te,numDirLights:c.directional.length,numPointLights:c.point.length,numSpotLights:c.spot.length,numSpotLightMaps:c.spotLightMap.length,numRectAreaLights:c.rectArea.length,numHemiLights:c.hemi.length,numDirLightShadows:c.directionalShadowMap.length,numPointLightShadows:c.pointShadowMap.length,numSpotLightShadows:c.spotShadowMap.length,numSpotLightShadowsWithMaps:c.numSpotLightShadowsWithMaps,numLightProbes:c.numLightProbes,numClippingPlanes:s.numPlanes,numClipIntersection:s.numIntersection,dithering:a.dithering,shadowMapEnabled:e.shadowMap.enabled&&d.length>0,shadowMapType:e.shadowMap.type,toneMapping:F,decodeVideoTexture:oe&&a.map.isVideoTexture===!0&&o.getTransfer(a.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:me&&a.emissiveMap.isVideoTexture===!0&&o.getTransfer(a.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:a.premultipliedAlpha,doubleSided:a.side===2,flipSided:a.side===1,useDepthPacking:a.depthPacking>=0,depthPacking:a.depthPacking||0,index0AttributeName:a.index0AttributeName,extensionClipCullDistance:Fe&&a.extensions.clipCullDistance===!0&&r.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Fe&&a.extensions.multiDraw===!0||ae)&&r.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:r.has(`KHR_parallel_shader_compile`),customProgramCacheKey:a.customProgramCacheKey()};return Ie.vertexUv1s=u.has(1),Ie.vertexUv2s=u.has(2),Ie.vertexUv3s=u.has(3),u.clear(),Ie}function v(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(y(n,t),b(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function y(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function b(e,t){c.disableAll(),t.supportsVertexTextures&&c.enable(0),t.instancing&&c.enable(1),t.instancingColor&&c.enable(2),t.instancingMorph&&c.enable(3),t.matcap&&c.enable(4),t.envMap&&c.enable(5),t.normalMapObjectSpace&&c.enable(6),t.normalMapTangentSpace&&c.enable(7),t.clearcoat&&c.enable(8),t.iridescence&&c.enable(9),t.alphaTest&&c.enable(10),t.vertexColors&&c.enable(11),t.vertexAlphas&&c.enable(12),t.vertexUv1s&&c.enable(13),t.vertexUv2s&&c.enable(14),t.vertexUv3s&&c.enable(15),t.vertexTangents&&c.enable(16),t.anisotropy&&c.enable(17),t.alphaHash&&c.enable(18),t.batching&&c.enable(19),t.dispersion&&c.enable(20),t.batchingColor&&c.enable(21),t.gradientMap&&c.enable(22),e.push(c.mask),c.disableAll(),t.fog&&c.enable(0),t.useFog&&c.enable(1),t.flatShading&&c.enable(2),t.logarithmicDepthBuffer&&c.enable(3),t.reversedDepthBuffer&&c.enable(4),t.skinning&&c.enable(5),t.morphTargets&&c.enable(6),t.morphNormals&&c.enable(7),t.morphColors&&c.enable(8),t.premultipliedAlpha&&c.enable(9),t.shadowMapEnabled&&c.enable(10),t.doubleSided&&c.enable(11),t.flipSided&&c.enable(12),t.useDepthPacking&&c.enable(13),t.dithering&&c.enable(14),t.transmission&&c.enable(15),t.sheen&&c.enable(16),t.opaque&&c.enable(17),t.pointsUvs&&c.enable(18),t.decodeVideoTexture&&c.enable(19),t.decodeVideoTextureEmissive&&c.enable(20),t.alphaToCoverage&&c.enable(21),e.push(c.mask)}function x(e){let t=h[e.type],n;if(t){let e=wn[t];n=be.clone(e.uniforms)}else n=e.uniforms;return n}function S(t,n){let r;for(let e=0,t=d.length;e<t;e++){let t=d[e];if(t.cacheKey===n){r=t,++r.usedTimes;break}}return r===void 0&&(r=new Gi(e,n,t,a),d.push(r)),r}function C(e){if(--e.usedTimes===0){let t=d.indexOf(e);d[t]=d[d.length-1],d.pop(),e.destroy()}}function w(e){l.remove(e)}function T(){l.dispose()}return{getParameters:_,getProgramCacheKey:v,getUniforms:x,acquireProgram:S,releaseProgram:C,releaseShaderCache:w,programs:d,dispose:T}}function Xi(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function Zi(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.z===t.z?e.id-t.id:e.z-t.z:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Qi(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function $i(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(n,r,i,a,o,s){let c=e[t];return c===void 0?(c={id:n.id,object:n,geometry:r,material:i,groupOrder:a,renderOrder:n.renderOrder,z:o,group:s},e[t]=c):(c.id=n.id,c.object=n,c.geometry=r,c.material=i,c.groupOrder=a,c.renderOrder=n.renderOrder,c.z=o,c.group=s),t++,c}function s(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.push(u):a.transparent===!0?i.push(u):n.push(u)}function c(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function l(e,t){n.length>1&&n.sort(e||Zi),r.length>1&&r.sort(t||Qi),i.length>1&&i.sort(t||Qi)}function u(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:s,unshift:c,finish:u,sort:l}}function ea(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new $i,e.set(t,[i])):n>=r.length?(i=new $i,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function ta(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={direction:new I,color:new Ve};break;case`SpotLight`:n={position:new I,direction:new I,color:new Ve,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new I,color:new Ve,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new I,skyColor:new Ve,groundColor:new Ve};break;case`RectAreaLight`:n={color:new Ve,position:new I,halfWidth:new I,halfHeight:new I}}return e[t.id]=n,n}}}function na(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new P};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new P};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new P,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var ra=0;function ia(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function aa(e){let t=new ta,n=na(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new I);let i=new I,a=new lt,o=new lt;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0;i.sort(ia);for(let e=0,y=i.length;e<y;e++){let y=i[e],b=y.color,x=y.intensity,S=y.distance,C=y.shadow&&y.shadow.map?y.shadow.map.texture:null;if(y.isAmbientLight)a+=b.r*x,o+=b.g*x,s+=b.b*x;else if(y.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(y.sh.coefficients[e],x);v++}else if(y.isDirectionalLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[c]=t,r.directionalShadowMap[c]=C,r.directionalShadowMatrix[c]=y.shadow.matrix,p++}r.directional[c]=e,c++}else if(y.isSpotLight){let e=t.get(y);e.position.setFromMatrixPosition(y.matrixWorld),e.color.copy(b).multiplyScalar(x),e.distance=S,e.coneCos=Math.cos(y.angle),e.penumbraCos=Math.cos(y.angle*(1-y.penumbra)),e.decay=y.decay,r.spot[u]=e;let i=y.shadow;if(y.map&&(r.spotLightMap[g]=y.map,g++,i.updateMatrices(y),y.castShadow&&_++),r.spotLightMatrix[u]=i.matrix,y.castShadow){let e=n.get(y);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[u]=e,r.spotShadowMap[u]=C,h++}u++}else if(y.isRectAreaLight){let e=t.get(y);e.color.copy(b).multiplyScalar(x),e.halfWidth.set(y.width*.5,0,0),e.halfHeight.set(0,y.height*.5,0),r.rectArea[d]=e,d++}else if(y.isPointLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),e.distance=y.distance,e.decay=y.decay,y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[l]=t,r.pointShadowMap[l]=C,r.pointShadowMatrix[l]=y.shadow.matrix,m++}r.point[l]=e,l++}else if(y.isHemisphereLight){let e=t.get(y);e.skyColor.copy(y.color).multiplyScalar(x),e.groundColor.copy(y.groundColor).multiplyScalar(x),r.hemi[f]=e,f++}}d>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=Z.LTC_FLOAT_1,r.rectAreaLTC2=Z.LTC_FLOAT_2):(r.rectAreaLTC1=Z.LTC_HALF_1,r.rectAreaLTC2=Z.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let y=r.hash;(y.directionalLength!==c||y.pointLength!==l||y.spotLength!==u||y.rectAreaLength!==d||y.hemiLength!==f||y.numDirectionalShadows!==p||y.numPointShadows!==m||y.numSpotShadows!==h||y.numSpotMaps!==g||y.numLightProbes!==v)&&(r.directional.length=c,r.spot.length=u,r.rectArea.length=d,r.point.length=l,r.hemi.length=f,r.directionalShadow.length=p,r.directionalShadowMap.length=p,r.pointShadow.length=m,r.pointShadowMap.length=m,r.spotShadow.length=h,r.spotShadowMap.length=h,r.directionalShadowMatrix.length=p,r.pointShadowMatrix.length=m,r.spotLightMatrix.length=h+g-_,r.spotLightMap.length=g,r.numSpotLightShadowsWithMaps=_,r.numLightProbes=v,y.directionalLength=c,y.pointLength=l,y.spotLength=u,y.rectAreaLength=d,y.hemiLength=f,y.numDirectionalShadows=p,y.numPointShadows=m,y.numSpotShadows=h,y.numSpotMaps=g,y.numLightProbes=v,r.version=ra++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=t.matrixWorldInverse;for(let t=0,f=e.length;t<f;t++){let f=e[t];if(f.isDirectionalLight){let e=r.directional[n];e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),n++}else if(f.isSpotLight){let e=r.spot[c];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),c++}else if(f.isRectAreaLight){let e=r.rectArea[l];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),o.identity(),a.copy(f.matrixWorld),a.premultiply(d),o.extractRotation(a),e.halfWidth.set(f.width*.5,0,0),e.halfHeight.set(0,f.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),l++}else if(f.isPointLight){let e=r.point[s];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),s++}else if(f.isHemisphereLight){let e=r.hemi[u];e.direction.setFromMatrixPosition(f.matrixWorld),e.direction.transformDirection(d),u++}}}return{setup:s,setupView:c,state:r}}function oa(e){let t=new aa(e),n=[],r=[];function i(e){l.camera=e,n.length=0,r.length=0}function a(e){n.push(e)}function o(e){r.push(e)}function s(){t.setup(n)}function c(e){t.setupView(n,e)}let l={lightsArray:n,shadowsArray:r,camera:null,lights:t,transmissionRenderTarget:{}};return{init:i,state:l,setupLights:s,setupLightsView:c,pushLight:a,pushShadow:o}}function sa(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new oa(e),t.set(n,[a])):r>=i.length?(a=new oa(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var ca=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,la=`uniform sampler2D shadow_pass;
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
}`;function ua(e,t,n){let r=new le,i=new P,a=new P,o=new tt,s=new ft({depthPacking:ye}),c=new de,l={},u=n.maxTextureSize,d={0:1,1:0,2:2},f=new se({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new P},radius:{value:4}},vertexShader:ca,fragmentShader:la}),m=f.clone();m.defines.HORIZONTAL_PASS=1;let h=new dt;h.setAttribute(`position`,new we(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let g=new ht(h,f),_=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let v=this.type;this.render=function(t,n,s){if(_.enabled===!1||_.autoUpdate===!1&&_.needsUpdate===!1||t.length===0)return;let c=e.getRenderTarget(),l=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),f=e.state;f.setBlending(0),f.buffers.depth.getReversed()===!0?f.buffers.color.setClear(0,0,0,0):f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);let m=v!==3&&this.type===3,h=v===3&&this.type!==3;for(let c=0,l=t.length;c<l;c++){let l=t[c],d=l.shadow;if(d===void 0){console.warn(`THREE.WebGLShadowMap:`,l,`has no shadow.`);continue}if(d.autoUpdate===!1&&d.needsUpdate===!1)continue;i.copy(d.mapSize);let g=d.getFrameExtents();if(i.multiply(g),a.copy(d.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(a.x=Math.floor(u/g.x),i.x=a.x*g.x,d.mapSize.x=a.x),i.y>u&&(a.y=Math.floor(u/g.y),i.y=a.y*g.y,d.mapSize.y=a.y)),d.map===null||m===!0||h===!0){let e=this.type===3?{}:{minFilter:p,magFilter:p};d.map!==null&&d.map.dispose(),d.map=new ot(i.x,i.y,e),d.map.texture.name=l.name+`.shadowMap`,d.camera.updateProjectionMatrix()}e.setRenderTarget(d.map),e.clear();let _=d.getViewportCount();for(let e=0;e<_;e++){let t=d.getViewport(e);o.set(a.x*t.x,a.y*t.y,a.x*t.z,a.y*t.w),f.viewport(o),d.updateMatrices(l,e),r=d.getFrustum(),x(n,s,d.camera,l,this.type)}d.isPointLightShadow!==!0&&this.type===3&&y(d,s),d.needsUpdate=!1}v=this.type,_.needsUpdate=!1,e.setRenderTarget(c,l,d)};function y(n,r){let a=t.update(g);f.defines.VSM_SAMPLES!==n.blurSamples&&(f.defines.VSM_SAMPLES=n.blurSamples,m.defines.VSM_SAMPLES=n.blurSamples,f.needsUpdate=!0,m.needsUpdate=!0),n.mapPass===null&&(n.mapPass=new ot(i.x,i.y)),f.uniforms.shadow_pass.value=n.map.texture,f.uniforms.resolution.value=n.mapSize,f.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,f,g,null),m.uniforms.shadow_pass.value=n.mapPass.texture,m.uniforms.resolution.value=n.mapSize,m.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,m,g,null)}function b(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?c:s,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=l[e];r===void 0&&(r={},l[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,S)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?d[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function x(n,i,a,o,s){if(n.visible===!1)return;if(n.layers.test(i.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||r.intersectsObject(n))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),c=n.material;if(Array.isArray(c)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=b(n,d,o,s);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(c.visible){let t=b(n,c,o,s);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)x(c[e],i,a,o,s)}function S(e){e.target.removeEventListener(`dispose`,S);for(let t in l){let n=l[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}var da={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3};function fa(e,t){function n(){let t=!1,n=new tt,r=null,i=new tt(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?pe(e.DEPTH_TEST):me(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=da[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(r&&(t=1-t),e.clearDepth(t),o=t)},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?pe(e.STENCIL_TEST):me(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new Ve(0,0,0),w=0,T=!1,ee=null,te=null,E=null,D=null,O=null,ne=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),re=!1,k=0,ie=e.getParameter(e.VERSION);ie.indexOf(`WebGL`)===-1?ie.indexOf(`OpenGL ES`)!==-1&&(k=parseFloat(/^OpenGL ES (\d)/.exec(ie)[1]),re=k>=2):(k=parseFloat(/^WebGL (\d)/.exec(ie)[1]),re=k>=1);let ae=null,oe={},se=e.getParameter(e.SCISSOR_BOX),ce=e.getParameter(e.VIEWPORT),le=new tt().fromArray(se),ue=new tt().fromArray(ce);function de(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let fe={};fe[e.TEXTURE_2D]=de(e.TEXTURE_2D,e.TEXTURE_2D,1),fe[e.TEXTURE_CUBE_MAP]=de(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),fe[e.TEXTURE_2D_ARRAY]=de(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),fe[e.TEXTURE_3D]=de(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),pe(e.DEPTH_TEST),o.setFunc(3),j(!1),xe(1),pe(e.CULL_FACE),A(0);function pe(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function me(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function he(t,n){return d[t]!==n&&(e.bindFramebuffer(t,n),d[t]=n,t===e.DRAW_FRAMEBUFFER&&(d[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(d[e.DRAW_FRAMEBUFFER]=n),!0)}function ge(t,n){let r=p,i=!1;if(t){r=f.get(n),r===void 0&&(r=[],f.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function _e(t){return m!==t&&(e.useProgram(t),m=t,!0)}let ve={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};ve[103]=e.MIN,ve[104]=e.MAX;let ye={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function A(t,n,r,i,a,o,s,c,l,u){if(t===0)h===!0&&(me(e.BLEND),h=!1);else if(h===!1&&(pe(e.BLEND),h=!0),t!==5){if(t!==g||u!==T){if((_!==100||b!==100)&&(e.blendEquation(e.FUNC_ADD),_=100,b=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:console.error(`THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:console.error(`THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}v=null,y=null,x=null,S=null,C.set(0,0,0),w=0,g=t,T=u}}else a||=n,o||=r,s||=i,(n!==_||a!==b)&&(e.blendEquationSeparate(ve[n],ve[a]),_=n,b=a),(r!==v||i!==y||o!==x||s!==S)&&(e.blendFuncSeparate(ye[r],ye[i],ye[o],ye[s]),v=r,y=i,x=o,S=s),(c.equals(C)===!1||l!==w)&&(e.blendColor(c.r,c.g,c.b,l),C.copy(c),w=l),g=t,T=!1}function be(t,n){t.side===2?me(e.CULL_FACE):pe(e.CULL_FACE);let r=t.side===1;n&&(r=!r),j(r),t.blending===1&&t.transparent===!1?A(0):A(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),M(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?pe(e.SAMPLE_ALPHA_TO_COVERAGE):me(e.SAMPLE_ALPHA_TO_COVERAGE)}function j(t){ee!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),ee=t)}function xe(t){t===0?me(e.CULL_FACE):(pe(e.CULL_FACE),t!==te&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),te=t}function Se(t){t!==E&&(re&&e.lineWidth(t),E=t)}function M(t,n,r){t?(pe(e.POLYGON_OFFSET_FILL),(D!==n||O!==r)&&(e.polygonOffset(n,r),D=n,O=r)):me(e.POLYGON_OFFSET_FILL)}function Ce(t){t?pe(e.SCISSOR_TEST):me(e.SCISSOR_TEST)}function N(t){t===void 0&&(t=e.TEXTURE0+ne-1),ae!==t&&(e.activeTexture(t),ae=t)}function P(t,n,r){r===void 0&&(r=ae===null?e.TEXTURE0+ne-1:ae);let i=oe[r];i===void 0&&(i={type:void 0,texture:void 0},oe[r]=i),(i.type!==t||i.texture!==n)&&(ae!==r&&(e.activeTexture(r),ae=r),e.bindTexture(t,n||fe[t]),i.type=t,i.texture=n)}function we(){let t=oe[ae];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function Te(){try{e.compressedTexImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ee(){try{e.compressedTexImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function De(){try{e.texSubImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Oe(){try{e.texSubImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function ke(){try{e.compressedTexSubImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ae(){try{e.compressedTexSubImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function je(){try{e.texStorage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Me(){try{e.texStorage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ne(){try{e.texImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Pe(){try{e.texImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Fe(t){le.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),le.copy(t))}function F(t){ue.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),ue.copy(t))}function Ie(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function Le(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function Re(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),u={},ae=null,oe={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new Ve(0,0,0),w=0,T=!1,ee=null,te=null,E=null,D=null,O=null,le.set(0,0,e.canvas.width,e.canvas.height),ue.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:pe,disable:me,bindFramebuffer:he,drawBuffers:ge,useProgram:_e,setBlending:A,setMaterial:be,setFlipSided:j,setCullFace:xe,setLineWidth:Se,setPolygonOffset:M,setScissorTest:Ce,activeTexture:N,bindTexture:P,unbindTexture:we,compressedTexImage2D:Te,compressedTexImage3D:Ee,texImage2D:Ne,texImage3D:Pe,updateUBOMapping:Ie,uniformBlockBinding:Le,texStorage2D:je,texStorage3D:Me,texSubImage2D:De,texSubImage3D:Oe,compressedTexSubImage2D:ke,compressedTexSubImage3D:Ae,scissor:Fe,viewport:F,reset:Re}}function pa(e,t,n,r,i,a,c){let l=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,u=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),m=new P,g=new WeakMap,_,v=new WeakMap,y=!1;try{y=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function b(e,t){return y?new OffscreenCanvas(e,t):Ie(`canvas`)}function x(e,t,n){let r=1,i=Me(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);_===void 0&&(_=b(n,a));let o=t?b(n,a):_;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),console.warn(`THREE.WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&console.warn(`THREE.WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function S(e){return e.generateMipmaps}function C(t){e.generateMipmap(t)}function w(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function T(n,r,i,a,s=!1){if(n!==null){if(e[n]!==void 0)return e[n];console.warn(`THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let c=r;if(r===e.RED&&(i===e.FLOAT&&(c=e.R32F),i===e.HALF_FLOAT&&(c=e.R16F),i===e.UNSIGNED_BYTE&&(c=e.R8)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(c=e.R8UI),i===e.UNSIGNED_SHORT&&(c=e.R16UI),i===e.UNSIGNED_INT&&(c=e.R32UI),i===e.BYTE&&(c=e.R8I),i===e.SHORT&&(c=e.R16I),i===e.INT&&(c=e.R32I)),r===e.RG&&(i===e.FLOAT&&(c=e.RG32F),i===e.HALF_FLOAT&&(c=e.RG16F),i===e.UNSIGNED_BYTE&&(c=e.RG8)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(c=e.RG8UI),i===e.UNSIGNED_SHORT&&(c=e.RG16UI),i===e.UNSIGNED_INT&&(c=e.RG32UI),i===e.BYTE&&(c=e.RG8I),i===e.SHORT&&(c=e.RG16I),i===e.INT&&(c=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(c=e.RGB8UI),i===e.UNSIGNED_SHORT&&(c=e.RGB16UI),i===e.UNSIGNED_INT&&(c=e.RGB32UI),i===e.BYTE&&(c=e.RGB8I),i===e.SHORT&&(c=e.RGB16I),i===e.INT&&(c=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(c=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(c=e.RGBA16UI),i===e.UNSIGNED_INT&&(c=e.RGBA32UI),i===e.BYTE&&(c=e.RGBA8I),i===e.SHORT&&(c=e.RGBA16I),i===e.INT&&(c=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_INT_5_9_9_9_REV&&(c=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(c=e.R11F_G11F_B10F)),r===e.RGBA){let t=s?Le:o.getTransfer(a);i===e.FLOAT&&(c=e.RGBA32F),i===e.HALF_FLOAT&&(c=e.RGBA16F),i===e.UNSIGNED_BYTE&&(c=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT_4_4_4_4&&(c=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(c=e.RGB5_A1)}return(c===e.R16F||c===e.R32F||c===e.RG16F||c===e.RG32F||c===e.RGBA16F||c===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),c}function ee(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,console.warn(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function te(e,t){return S(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function E(e){let t=e.target;t.removeEventListener(`dispose`,E),O(t),t.isVideoTexture&&g.delete(t)}function D(e){let t=e.target;t.removeEventListener(`dispose`,D),re(t)}function O(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=v.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&ne(e),Object.keys(i).length===0&&v.delete(n)}r.remove(e)}function ne(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=v.get(i);delete a[n.__cacheKey],c.memory.textures--}function re(t){let n=r.get(t);if(t.depthTexture&&(t.depthTexture.dispose(),r.remove(t.depthTexture)),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let i=t.textures;for(let t=0,n=i.length;t<n;t++){let n=r.get(i[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),c.memory.textures--),r.remove(i[t])}r.remove(t)}let k=0;function ie(){k=0}function ae(){let e=k;return e>=i.maxTextures&&console.warn(`THREE.WebGLTextures: Trying to use `+e+` texture units while this GPU supports only `+i.maxTextures),k+=1,e}function se(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function ce(t,i){let a=r.get(t);if(t.isVideoTexture&&ke(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)console.warn(`THREE.WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)console.warn(`THREE.WebGLRenderer: Texture marked for update but image is incomplete`);else{ye(a,t,i);return}}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function le(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?ye(a,t,i):n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i)}function ue(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?ye(a,t,i):n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function de(t,i){let a=r.get(t);t.version>0&&a.__version!==t.version?A(a,t,i):n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let fe={[f]:e.REPEAT,[d]:e.CLAMP_TO_EDGE,[h]:e.MIRRORED_REPEAT},pe={[p]:e.NEAREST,[He]:e.NEAREST_MIPMAP_NEAREST,[oe]:e.NEAREST_MIPMAP_LINEAR,[Ae]:e.LINEAR,[Ze]:e.LINEAR_MIPMAP_NEAREST,[Ne]:e.LINEAR_MIPMAP_LINEAR},me={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function he(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&console.warn(`THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,fe[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,fe[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,fe[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,pe[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,pe[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,me[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function ge(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,E));let i=n.source,a=v.get(i);a===void 0&&(a={},v.set(i,a));let o=se(n);if(o!==t.__cacheKey){a[o]===void 0&&(a[o]={texture:e.createTexture(),usedTimes:0},c.memory.textures++,r=!0),a[o].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&ne(n)),t.__cacheKey=o,t.__webglTexture=a[o].texture}return r}function _e(e,t,n){return Math.floor(Math.floor(e/n)/t)}function ve(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=_e(n.start,r.width,4),c=_e(t.start,r.width,4);n.start<=i+1&&a===c&&_e(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=e.getParameter(e.UNPACK_ROW_LENGTH),l=e.getParameter(e.UNPACK_SKIP_PIXELS),u=e.getParameter(e.UNPACK_SKIP_ROWS);e.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;e.pixelStorei(e.UNPACK_SKIP_PIXELS,u),e.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),e.pixelStorei(e.UNPACK_ROW_LENGTH,c),e.pixelStorei(e.UNPACK_SKIP_PIXELS,l),e.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function ye(t,c,l){let u=e.TEXTURE_2D;(c.isDataArrayTexture||c.isCompressedArrayTexture)&&(u=e.TEXTURE_2D_ARRAY),c.isData3DTexture&&(u=e.TEXTURE_3D);let d=ge(t,c),f=c.source;n.bindTexture(u,t.__webglTexture,e.TEXTURE0+l);let p=r.get(f);if(f.version!==p.__version||d===!0){n.activeTexture(e.TEXTURE0+l);let t=o.getPrimaries(o.workingColorSpace),r=c.colorSpace===``?null:o.getPrimaries(c.colorSpace),m=c.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,c.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,c.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,c.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,m);let h=x(c.image,!1,i.maxTextureSize);h=je(c,h);let g=a.convert(c.format,c.colorSpace),_=a.convert(c.type),v=T(c.internalFormat,g,_,c.colorSpace,c.isVideoTexture);he(u,c);let y,b=c.mipmaps,w=c.isVideoTexture!==!0,E=p.__version===void 0||d===!0,D=f.dataReady,O=te(c,h);if(c.isDepthTexture)v=ee(c.format===s,c.type),E&&(w?n.texStorage2D(e.TEXTURE_2D,1,v,h.width,h.height):n.texImage2D(e.TEXTURE_2D,0,v,h.width,h.height,0,g,_,null));else if(c.isDataTexture){if(b.length>0){w&&E&&n.texStorage2D(e.TEXTURE_2D,O,v,b[0].width,b[0].height);for(let t=0,r=b.length;t<r;t++)y=b[t],w?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,y.width,y.height,g,_,y.data):n.texImage2D(e.TEXTURE_2D,t,v,y.width,y.height,0,g,_,y.data);c.generateMipmaps=!1}else w?(E&&n.texStorage2D(e.TEXTURE_2D,O,v,h.width,h.height),D&&ve(c,h,g,_)):n.texImage2D(e.TEXTURE_2D,0,v,h.width,h.height,0,g,_,h.data)}else if(c.isCompressedTexture){if(c.isCompressedArrayTexture){w&&E&&n.texStorage3D(e.TEXTURE_2D_ARRAY,O,v,b[0].width,b[0].height,h.depth);for(let t=0,r=b.length;t<r;t++)if(y=b[t],c.format!==1023){if(g!==null){if(w){if(D){if(c.layerUpdates.size>0){let r=Fe(y.width,y.height,c.format,c.type);for(let i of c.layerUpdates){let a=y.data.subarray(i*r/y.data.BYTES_PER_ELEMENT,(i+1)*r/y.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,i,y.width,y.height,1,g,a)}c.clearLayerUpdates()}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,y.width,y.height,h.depth,g,y.data)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,t,v,y.width,y.height,h.depth,0,y.data,0,0)}else console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else w?D&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,y.width,y.height,h.depth,g,_,y.data):n.texImage3D(e.TEXTURE_2D_ARRAY,t,v,y.width,y.height,h.depth,0,g,_,y.data)}else{w&&E&&n.texStorage2D(e.TEXTURE_2D,O,v,b[0].width,b[0].height);for(let t=0,r=b.length;t<r;t++)y=b[t],c.format===1023?w?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,y.width,y.height,g,_,y.data):n.texImage2D(e.TEXTURE_2D,t,v,y.width,y.height,0,g,_,y.data):g===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):w?D&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,y.width,y.height,g,y.data):n.compressedTexImage2D(e.TEXTURE_2D,t,v,y.width,y.height,0,y.data)}}else if(c.isDataArrayTexture){if(w){if(E&&n.texStorage3D(e.TEXTURE_2D_ARRAY,O,v,h.width,h.height,h.depth),D){if(c.layerUpdates.size>0){let t=Fe(h.width,h.height,c.format,c.type);for(let r of c.layerUpdates){let i=h.data.subarray(r*t/h.data.BYTES_PER_ELEMENT,(r+1)*t/h.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,r,h.width,h.height,1,g,_,i)}c.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,h.width,h.height,h.depth,g,_,h.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,v,h.width,h.height,h.depth,0,g,_,h.data)}else if(c.isData3DTexture)w?(E&&n.texStorage3D(e.TEXTURE_3D,O,v,h.width,h.height,h.depth),D&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,h.width,h.height,h.depth,g,_,h.data)):n.texImage3D(e.TEXTURE_3D,0,v,h.width,h.height,h.depth,0,g,_,h.data);else if(c.isFramebufferTexture){if(E){if(w)n.texStorage2D(e.TEXTURE_2D,O,v,h.width,h.height);else{let t=h.width,r=h.height;for(let i=0;i<O;i++)n.texImage2D(e.TEXTURE_2D,i,v,t,r,0,g,_,null),t>>=1,r>>=1}}}else if(b.length>0){if(w&&E){let t=Me(b[0]);n.texStorage2D(e.TEXTURE_2D,O,v,t.width,t.height)}for(let t=0,r=b.length;t<r;t++)y=b[t],w?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,g,_,y):n.texImage2D(e.TEXTURE_2D,t,v,g,_,y);c.generateMipmaps=!1}else if(w){if(E){let t=Me(h);n.texStorage2D(e.TEXTURE_2D,O,v,t.width,t.height)}D&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,g,_,h)}else n.texImage2D(e.TEXTURE_2D,0,v,g,_,h);S(c)&&C(u),p.__version=f.version,c.onUpdate&&c.onUpdate(c)}t.__version=c.version}function A(t,s,c){if(s.image.length!==6)return;let l=ge(t,s),u=s.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+c);let d=r.get(u);if(u.version!==d.__version||l===!0){n.activeTexture(e.TEXTURE0+c);let t=o.getPrimaries(o.workingColorSpace),r=s.colorSpace===``?null:o.getPrimaries(s.colorSpace),f=s.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,s.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,s.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,s.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,f);let p=s.isCompressedTexture||s.image[0].isCompressedTexture,m=s.image[0]&&s.image[0].isDataTexture,h=[];for(let e=0;e<6;e++)!p&&!m?h[e]=x(s.image[e],!0,i.maxCubemapSize):h[e]=m?s.image[e].image:s.image[e],h[e]=je(s,h[e]);let g=h[0],_=a.convert(s.format,s.colorSpace),v=a.convert(s.type),y=T(s.internalFormat,_,v,s.colorSpace),b=s.isVideoTexture!==!0,w=d.__version===void 0||l===!0,ee=u.dataReady,E=te(s,g);he(e.TEXTURE_CUBE_MAP,s);let D;if(p){b&&w&&n.texStorage2D(e.TEXTURE_CUBE_MAP,E,y,g.width,g.height);for(let t=0;t<6;t++){D=h[t].mipmaps;for(let r=0;r<D.length;r++){let i=D[r];s.format===1023?b?ee&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,_,v,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,y,i.width,i.height,0,_,v,i.data):_===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):b?ee&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,_,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,y,i.width,i.height,0,i.data)}}}else{if(D=s.mipmaps,b&&w){D.length>0&&E++;let t=Me(h[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,E,y,t.width,t.height)}for(let t=0;t<6;t++)if(m){b?ee&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,h[t].width,h[t].height,_,v,h[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,y,h[t].width,h[t].height,0,_,v,h[t].data);for(let r=0;r<D.length;r++){let i=D[r].image[t].image;b?ee&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,_,v,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,y,i.width,i.height,0,_,v,i.data)}}else{b?ee&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,_,v,h[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,y,_,v,h[t]);for(let r=0;r<D.length;r++){let i=D[r];b?ee&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,_,v,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,y,_,v,i.image[t])}}}S(s)&&C(e.TEXTURE_CUBE_MAP),d.__version=u.version,s.onUpdate&&s.onUpdate(s)}t.__version=s.version}function be(t,i,o,s,c,u){let d=a.convert(o.format,o.colorSpace),f=a.convert(o.type),p=T(o.internalFormat,d,f,o.colorSpace),m=r.get(i),h=r.get(o);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);c===e.TEXTURE_3D||c===e.TEXTURE_2D_ARRAY?n.texImage3D(c,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(c,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),Oe(i)?l.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,s,c,h.__webglTexture,0,De(i)):(c===e.TEXTURE_2D||c>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&c<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,s,c,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function j(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=ee(n.stencilBuffer,a),s=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,c=De(n);Oe(n)?l.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,c,o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,c,o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,s,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let o=t[i],s=a.convert(o.format,o.colorSpace),c=a.convert(o.type),u=T(o.internalFormat,s,c,o.colorSpace),d=De(n);r&&Oe(n)===!1?e.renderbufferStorageMultisample(e.RENDERBUFFER,d,u,n.width,n.height):Oe(n)?l.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,d,u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function xe(t,i){if(i&&i.isWebGLCubeRenderTarget)throw Error(`Depth Texture with cube render targets is not supported`);if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`renderTarget.depthTexture must be an instance of THREE.DepthTexture`);let a=r.get(i.depthTexture);a.__renderTarget=i,(!a.__webglTexture||i.depthTexture.image.width!==i.width||i.depthTexture.image.height!==i.height)&&(i.depthTexture.image.width=i.width,i.depthTexture.image.height=i.height,i.depthTexture.needsUpdate=!0),ce(i.depthTexture,0);let o=a.__webglTexture,s=De(i);if(i.depthTexture.format===1026)Oe(i)?l.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,o,0,s):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,o,0);else if(i.depthTexture.format===1027)Oe(i)?l.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,o,0,s):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,o,0);else throw Error(`Unknown depthTexture format`)}function Se(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)throw Error(`target.depthTexture not supported in Cube render targets`);let e=t.texture.mipmaps;e&&e.length>0?xe(i.__webglFramebuffer[0],t):xe(i.__webglFramebuffer,t)}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),j(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else{let r=t.texture.mipmaps;if(r&&r.length>0?n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),j(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function M(t,n,i){let a=r.get(t);n!==void 0&&be(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&Se(t)}function Ce(t){let i=t.texture,o=r.get(t),s=r.get(i);t.addEventListener(`dispose`,D);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(s.__webglTexture===void 0&&(s.__webglTexture=e.createTexture()),s.__version=i.version,c.memory.textures++),u){o.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps&&i.mipmaps.length>0){o.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)o.__webglFramebuffer[t][n]=e.createFramebuffer()}else o.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps&&i.mipmaps.length>0){o.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)o.__webglFramebuffer[t]=e.createFramebuffer()}else o.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),c.memory.textures++)}if(t.samples>0&&Oe(t)===!1){o.__webglMultisampledFramebuffer=e.createFramebuffer(),o.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,o.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];o.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,o.__webglColorRenderbuffer[n]);let i=a.convert(r.format,r.colorSpace),s=a.convert(r.type),c=T(r.internalFormat,i,s,r.colorSpace,t.isXRRenderTarget===!0),u=De(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,o.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(o.__webglDepthRenderbuffer=e.createRenderbuffer(),j(o.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,s.__webglTexture),he(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps&&i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)be(o.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else be(o.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);S(i)&&C(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(d){for(let i=0,a=l.length;i<a;i++){let a=l[i],s=r.get(a),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,s.__webglTexture),he(c,a),be(o.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+i,c,0),S(a)&&C(c)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,s.__webglTexture),he(r,i),i.mipmaps&&i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)be(o.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else be(o.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);S(i)&&C(r),n.unbindTexture()}t.depthBuffer&&Se(t)}function N(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(S(a)){let t=w(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),C(t),n.unbindTexture()}}}let we=[],Te=[];function Ee(t){if(t.samples>0){if(Oe(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,c=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,l=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,l.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,l.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,l.__webglMultisampledFramebuffer);let f=t.texture.mipmaps;f&&f.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,l.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,l.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,l.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),u===!0&&(we.length=0,Te.length=0,we.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.resolveDepthBuffer===!1&&(we.push(c),Te.push(c),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,Te)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,we))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,l.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,l.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,l.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,l.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.resolveDepthBuffer===!1&&u){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function De(e){return Math.min(i.maxSamples,e.samples)}function Oe(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function ke(e){let t=c.render.frame;g.get(e)!==t&&(g.set(e,t),e.update())}function je(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(o.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&console.warn(`THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):console.error(`THREE.WebGLTextures: Unsupported texture color space:`,n)),t}function Me(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(m.width=e.naturalWidth||e.width,m.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(m.width=e.displayWidth,m.height=e.displayHeight):(m.width=e.width,m.height=e.height),m}this.allocateTextureUnit=ae,this.resetTextureUnits=ie,this.setTexture2D=ce,this.setTexture2DArray=le,this.setTexture3D=ue,this.setTextureCube=de,this.rebindTextures=M,this.setupRenderTarget=Ce,this.updateRenderTargetMipmap=N,this.updateMultisampleRenderTarget=Ee,this.setupDepthRenderbuffer=Se,this.setupFrameBufferTexture=be,this.useMultisampledRTT=Oe}function ma(e,t){function n(n,r=``){let i,a=o.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var ha=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,ga=`
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

}`,_a=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Qe(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new se({vertexShader:ha,fragmentShader:ga,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ht(new T(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},va=class extends E{constructor(e,t){super();let n=this,r=null,i=1,o=null,c=`local-floor`,l=1,u=null,d=null,f=null,p=null,m=null,h=null,g=typeof XRWebGLBinding<`u`,_=new _a,v={},y=t.getContextAttributes(),x=null,S=null,C=[],w=[],T=new P,ee=null,te=new ce;te.viewport=new tt;let E=new ce;E.viewport=new tt;let D=[te,E],O=new Pe,ne=null,re=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=C[e];return t===void 0&&(t=new ke,C[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=C[e];return t===void 0&&(t=new ke,C[e]=t),t.getGripSpace()},this.getHand=function(e){let t=C[e];return t===void 0&&(t=new ke,C[e]=t),t.getHandSpace()};function k(e){let t=w.indexOf(e.inputSource);if(t===-1)return;let n=C[t];n!==void 0&&(n.update(e.inputSource,e.frame,u||o),n.dispatchEvent({type:e.type,data:e.inputSource}))}function ie(){r.removeEventListener(`select`,k),r.removeEventListener(`selectstart`,k),r.removeEventListener(`selectend`,k),r.removeEventListener(`squeeze`,k),r.removeEventListener(`squeezestart`,k),r.removeEventListener(`squeezeend`,k),r.removeEventListener(`end`,ie),r.removeEventListener(`inputsourceschange`,ae);for(let e=0;e<C.length;e++){let t=w[e];t!==null&&(w[e]=null,C[e].disconnect(t))}ne=null,re=null,_.reset();for(let e in v)delete v[e];e.setRenderTarget(x),m=null,p=null,f=null,r=null,S=null,me.stop(),n.isPresenting=!1,e.setPixelRatio(ee),e.setSize(T.width,T.height,!1),n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){c=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return u||o},this.setReferenceSpace=function(e){u=e},this.getBaseLayer=function(){return p===null?m:p},this.getBinding=function(){return f===null&&g&&(f=new XRWebGLBinding(r,t)),f},this.getFrame=function(){return h},this.getSession=function(){return r},this.setSession=async function(d){if(r=d,r!==null){if(x=e.getRenderTarget(),r.addEventListener(`select`,k),r.addEventListener(`selectstart`,k),r.addEventListener(`selectend`,k),r.addEventListener(`squeeze`,k),r.addEventListener(`squeezestart`,k),r.addEventListener(`squeezeend`,k),r.addEventListener(`end`,ie),r.addEventListener(`inputsourceschange`,ae),y.xrCompatible!==!0&&await t.makeXRCompatible(),ee=e.getPixelRatio(),e.getSize(T),g&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,o=null,c=null;y.depth&&(c=y.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=y.stencil?s:gt,o=y.stencil?a:rt);let l={colorFormat:t.RGBA8,depthFormat:c,scaleFactor:i};f=this.getBinding(),p=f.createProjectionLayer(l),r.updateRenderState({layers:[p]}),e.setPixelRatio(1),e.setSize(p.textureWidth,p.textureHeight,!1),S=new ot(p.textureWidth,p.textureHeight,{format:b,type:Se,depthTexture:new he(p.textureWidth,p.textureHeight,o,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:y.stencil,colorSpace:e.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}else{let n={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:i};m=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:m}),e.setPixelRatio(1),e.setSize(m.framebufferWidth,m.framebufferHeight,!1),S=new ot(m.framebufferWidth,m.framebufferHeight,{format:b,type:Se,colorSpace:e.outputColorSpace,stencilBuffer:y.stencil,resolveDepthBuffer:m.ignoreDepthValues===!1,resolveStencilBuffer:m.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(l),u=null,o=await r.requestReferenceSpace(c),me.setContext(r),me.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function ae(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=w.indexOf(n);r>=0&&(w[r]=null,C[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=w.indexOf(n);if(r===-1){for(let e=0;e<C.length;e++)if(e>=w.length){w.push(n),r=e;break}else if(w[e]===null){w[e]=n,r=e;break}if(r===-1)break}let i=C[r];i&&i.connect(n)}}let oe=new I,se=new I;function le(e,t,n){oe.setFromMatrixPosition(t.matrixWorld),se.setFromMatrixPosition(n.matrixWorld);let r=oe.distanceTo(se),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function ue(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;_.texture!==null&&(_.depthNear>0&&(t=_.depthNear),_.depthFar>0&&(n=_.depthFar)),O.near=E.near=te.near=t,O.far=E.far=te.far=n,(ne!==O.near||re!==O.far)&&(r.updateRenderState({depthNear:O.near,depthFar:O.far}),ne=O.near,re=O.far),O.layers.mask=e.layers.mask|6,te.layers.mask=O.layers.mask&3,E.layers.mask=O.layers.mask&5;let i=e.parent,a=O.cameras;ue(O,i);for(let e=0;e<a.length;e++)ue(a[e],i);a.length===2?le(O,te,E):O.projectionMatrix.copy(te.projectionMatrix),de(e,O,i)};function de(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=_e*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(p!==null||m!==null)return l},this.setFoveation=function(e){l=e,p!==null&&(p.fixedFoveation=e),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=e)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(O)},this.getCameraTexture=function(e){return v[e]};let fe=null;function pe(t,i){if(d=i.getViewerPose(u||o),h=i,d!==null){let t=d.views;m!==null&&(e.setRenderTargetFramebuffer(S,m.framebuffer),e.setRenderTarget(S));let i=!1;t.length!==O.cameras.length&&(O.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(m!==null)a=m.getViewport(r);else{let t=f.getViewSubImage(p,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(S,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(S))}let o=D[n];o===void 0&&(o=new ce,o.layers.enable(n),o.viewport=new tt,D[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(O.matrix.copy(o.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),i===!0&&O.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&g){f=n.getBinding();let e=f.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&_.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&g){e.state.unbindTexture(),f=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=v[n];e||(e=new Qe,v[n]=e);let t=f.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<C.length;e++){let t=w[e],n=C[e];t!==null&&n!==void 0&&n.update(t,i,u||o)}fe&&fe(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),h=null}let me=new Sn;me.setAnimationLoop(pe),this.setAnimationLoop=function(e){fe=e},this.dispose=function(){}}},ya=new v,ba=new lt;function xa(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,Ce(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isMeshBasicMaterial||t.isMeshLambertMaterial?a(e,t):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,ya.copy(o),ya.x*=-1,ya.y*=-1,ya.z*=-1,a.isCubeTexture&&a.isRenderTargetTexture===!1&&(ya.y*=-1,ya.z*=-1),e.envMapRotation.value.setFromMatrix4(ba.makeRotationFromEuler(ya)),e.flipEnvMap.value=a.isCubeTexture&&a.isRenderTargetTexture===!1?-1:1,e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function Sa(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(m(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return console.error(`THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let t=0,n=r.length;t<n;t++){let n=Array.isArray(r[t])?r[t]:[r[t]];for(let r=0,i=n.length;r<i;r++){let i=n[r];if(p(i,t,r,a)===!0){let t=i.__offset,n=Array.isArray(i.value)?i.value:[i.value],r=0;for(let a=0;a<n.length;a++){let o=n[a],s=h(o);typeof o==`number`||typeof o==`boolean`?(i.__data[0]=o,e.bufferSubData(e.UNIFORM_BUFFER,t+r,i.__data)):o.isMatrix3?(i.__data[0]=o.elements[0],i.__data[1]=o.elements[1],i.__data[2]=o.elements[2],i.__data[3]=0,i.__data[4]=o.elements[3],i.__data[5]=o.elements[4],i.__data[6]=o.elements[5],i.__data[7]=0,i.__data[8]=o.elements[6],i.__data[9]=o.elements[7],i.__data[10]=o.elements[8],i.__data[11]=0):(o.toArray(i.__data,r),r+=s.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,t,i.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=h(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?console.warn(`THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.`):console.warn(`THREE.WebGLRenderer: Unsupported uniform value type.`,e),t}function g(t){let n=t.target;n.removeEventListener(`dispose`,g);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:_}}var Ca=class{constructor(e={}){let{canvas:t=Ke(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:s=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:u=`default`,failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:f=!1}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);p=n.getContextAttributes().alpha}else p=a;let m=new Uint32Array(4),h=new Int32Array(4),g=null,_=null,v=[],y=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let b=this,x=!1;this._outputColorSpace=Be;let S=0,C=0,w=null,T=-1,ee=null,te=new tt,E=new tt,D=null,O=new Ve(0),ne=0,re=t.width,k=t.height,ie=1,ae=null,oe=null,se=new tt(0,0,re,k),ce=new tt(0,0,re,k),ue=!1,de=new le,fe=!1,pe=!1,me=new lt,he=new I,ge=new tt,_e={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ve=!1;function ye(){return w===null?ie:1}let A=n;function be(e,n){return t.getContext(e,n)}try{let e={alpha:!0,depth:r,stencil:i,antialias:s,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:u,failIfMajorPerformanceCaveat:d};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r180`),t.addEventListener(`webglcontextlost`,Xe,!1),t.addEventListener(`webglcontextrestored`,Ze,!1),t.addEventListener(`webglcontextcreationerror`,Qe,!1),A===null){let t=`webgl2`;if(A=be(t,e),A===null)throw be(t)?Error(`Error creating WebGL context with your selected attributes.`):Error(`Error creating WebGL context.`)}}catch(e){throw console.error(`THREE.WebGLRenderer: `+e.message),e}let j,xe,M,Ce,N,P,we,Ee,Oe,ke,Ae,je,Me,Pe,Fe,F,Ie,Le,Re,ze,He,Ue,We,Ge;function Je(){j=new nr(A),j.init(),Ue=new ma(A,j),xe=new jn(A,j,e,Ue),M=new fa(A,j),xe.reversedDepthBuffer&&f&&M.buffers.depth.setReversed(!0),Ce=new ar(A),N=new Xi,P=new pa(A,j,M,N,xe,Ue,Ce),we=new Nn(b),Ee=new tr(b),Oe=new Cn(A),We=new kn(A,Oe),ke=new rr(A,Oe,Ce,We),Ae=new sr(A,ke,Oe,Ce),Re=new or(A,xe,P),F=new Mn(N),je=new Yi(b,we,Ee,j,xe,We,F),Me=new xa(b,N),Pe=new ea,Fe=new sa(j),Le=new On(b,we,Ee,M,Ae,p,c),Ie=new ua(b,Ae,xe),Ge=new Sa(A,Ce,xe,M),ze=new An(A,j,Ce),He=new ir(A,j,Ce),Ce.programs=je.programs,b.capabilities=xe,b.extensions=j,b.properties=N,b.renderLists=Pe,b.shadowMap=Ie,b.state=M,b.info=Ce}Je();let Ye=new va(b,A);this.xr=Ye,this.getContext=function(){return A},this.getContextAttributes=function(){return A.getContextAttributes()},this.forceContextLoss=function(){let e=j.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=j.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return ie},this.setPixelRatio=function(e){e!==void 0&&(ie=e,this.setSize(re,k,!1))},this.getSize=function(e){return e.set(re,k)},this.setSize=function(e,n,r=!0){Ye.isPresenting?console.warn(`THREE.WebGLRenderer: Can't change size while VR device is presenting.`):(re=e,k=n,t.width=Math.floor(e*ie),t.height=Math.floor(n*ie),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),this.setViewport(0,0,e,n))},this.getDrawingBufferSize=function(e){return e.set(re*ie,k*ie).floor()},this.setDrawingBufferSize=function(e,n,r){re=e,k=n,ie=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.getCurrentViewport=function(e){return e.copy(te)},this.getViewport=function(e){return e.copy(se)},this.setViewport=function(e,t,n,r){e.isVector4?se.set(e.x,e.y,e.z,e.w):se.set(e,t,n,r),M.viewport(te.copy(se).multiplyScalar(ie).round())},this.getScissor=function(e){return e.copy(ce)},this.setScissor=function(e,t,n,r){e.isVector4?ce.set(e.x,e.y,e.z,e.w):ce.set(e,t,n,r),M.scissor(E.copy(ce).multiplyScalar(ie).round())},this.getScissorTest=function(){return ue},this.setScissorTest=function(e){M.setScissorTest(ue=e)},this.setOpaqueSort=function(e){ae=e},this.setTransparentSort=function(e){oe=e},this.getClearColor=function(e){return e.copy(Le.getClearColor())},this.setClearColor=function(){Le.setClearColor(...arguments)},this.getClearAlpha=function(){return Le.getClearAlpha()},this.setClearAlpha=function(){Le.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(w!==null){let t=w.texture.format;e=t===1033||t===1031||t===1029}if(e){let e=w.texture.type,t=e===1009||e===1014||e===1012||e===1020||e===1017||e===1018,n=Le.getClearColor(),r=Le.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(m[0]=i,m[1]=a,m[2]=o,m[3]=r,A.clearBufferuiv(A.COLOR,0,m)):(h[0]=i,h[1]=a,h[2]=o,h[3]=r,A.clearBufferiv(A.COLOR,0,h))}else r|=A.COLOR_BUFFER_BIT}t&&(r|=A.DEPTH_BUFFER_BIT),n&&(r|=A.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),A.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener(`webglcontextlost`,Xe,!1),t.removeEventListener(`webglcontextrestored`,Ze,!1),t.removeEventListener(`webglcontextcreationerror`,Qe,!1),Le.dispose(),Pe.dispose(),Fe.dispose(),N.dispose(),we.dispose(),Ee.dispose(),Ae.dispose(),We.dispose(),Ge.dispose(),je.dispose(),Ye.dispose(),Ye.removeEventListener(`sessionstart`,ct),Ye.removeEventListener(`sessionend`,ut),dt.stop()};function Xe(e){e.preventDefault(),console.log(`THREE.WebGLRenderer: Context Lost.`),x=!0}function Ze(){console.log(`THREE.WebGLRenderer: Context Restored.`),x=!1;let e=Ce.autoReset,t=Ie.enabled,n=Ie.autoUpdate,r=Ie.needsUpdate,i=Ie.type;Je(),Ce.autoReset=e,Ie.enabled=t,Ie.autoUpdate=n,Ie.needsUpdate=r,Ie.type=i}function Qe(e){console.error(`THREE.WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function $e(e){let t=e.target;t.removeEventListener(`dispose`,$e),et(t)}function et(e){nt(e),N.remove(e)}function nt(e){let t=N.get(e).programs;t!==void 0&&(t.forEach(function(e){je.releaseProgram(e)}),e.isShaderMaterial&&je.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=_e);let o=i.isMesh&&i.matrixWorld.determinant()<0,s=bt(e,t,n,r,i);M.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=ke.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;We.setup(i,r,s,n,c);let h,g=ze;if(c!==null&&(h=Oe.get(c),g=He,g.setIndex(h)),i.isMesh)r.wireframe===!0?(M.setLineWidth(r.wireframeLinewidth*ye()),g.setMode(A.LINES)):g.setMode(A.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),M.setLineWidth(e*ye()),i.isLineSegments?g.setMode(A.LINES):i.isLineLoop?g.setMode(A.LINE_LOOP):g.setMode(A.LINE_STRIP)}else i.isPoints?g.setMode(A.POINTS):i.isSprite&&g.setMode(A.TRIANGLES);if(i.isBatchedMesh){if(i._multiDrawInstances!==null)Te(`THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection.`),g.renderMultiDrawInstances(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount,i._multiDrawInstances);else if(j.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?Oe.get(c).bytesPerElement:1,o=N.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(A,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function rt(e,t,n){e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,vt(e,t,n),e.side=0,e.needsUpdate=!0,vt(e,t,n),e.side=2):vt(e,t,n)}this.compile=function(e,t,n=null){n===null&&(n=e),_=Fe.get(n),_.init(t),y.push(_),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(_.pushLight(e),e.castShadow&&_.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(_.pushLight(e),e.castShadow&&_.pushShadow(e))}),_.setupLights();let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let t=e.material;if(t){if(Array.isArray(t))for(let i=0;i<t.length;i++){let a=t[i];rt(a,n,e),r.add(a)}else rt(t,n,e),r.add(t)}}),_=y.pop(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){r.forEach(function(e){N.get(e).currentProgram.isReady()&&r.delete(e)}),r.size===0?t(e):setTimeout(n,10)}j.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let at=null;function st(e){at&&at(e)}function ct(){dt.stop()}function ut(){dt.start()}let dt=new Sn;dt.setAnimationLoop(st),typeof self<`u`&&dt.setContext(self),this.setAnimationLoop=function(e){at=e,Ye.setAnimationLoop(e),e===null?dt.stop():dt.start()},Ye.addEventListener(`sessionstart`,ct),Ye.addEventListener(`sessionend`,ut),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){console.error(`THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(x===!0)return;if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),Ye.enabled===!0&&Ye.isPresenting===!0&&(Ye.cameraAutoUpdate===!0&&Ye.updateCamera(t),t=Ye.getCamera()),e.isScene===!0&&e.onBeforeRender(b,e,t,w),_=Fe.get(e,y.length),_.init(t),y.push(_),me.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),de.setFromProjectionMatrix(me,De,t.reversedDepth),pe=this.localClippingEnabled,fe=F.init(this.clippingPlanes,pe),g=Pe.get(e,v.length),g.init(),v.push(g),Ye.enabled===!0&&Ye.isPresenting===!0){let e=b.xr.getDepthSensingMesh();e!==null&&ft(e,t,-1/0,b.sortObjects)}ft(e,t,0,b.sortObjects),g.finish(),b.sortObjects===!0&&g.sort(ae,oe),ve=Ye.enabled===!1||Ye.isPresenting===!1||Ye.hasDepthSensing()===!1,ve&&Le.addToRenderList(g,e),this.info.render.frame++,fe===!0&&F.beginShadows();let n=_.state.shadowsArray;Ie.render(n,e,t),fe===!0&&F.endShadows(),this.info.autoReset===!0&&this.info.reset();let r=g.opaque,i=g.transmissive;if(_.setupLights(),t.isArrayCamera){let n=t.cameras;if(i.length>0)for(let t=0,a=n.length;t<a;t++){let a=n[t];ht(r,i,e,a)}ve&&Le.render(e);for(let t=0,r=n.length;t<r;t++){let r=n[t];pt(g,e,r,r.viewport)}}else i.length>0&&ht(r,i,e,t),ve&&Le.render(e),pt(g,e,t);w!==null&&C===0&&(P.updateMultisampleRenderTarget(w),P.updateRenderTargetMipmap(w)),e.isScene===!0&&e.onAfterRender(b,e,t),We.resetDefaultState(),T=-1,ee=null,y.pop(),y.length>0?(_=y[y.length-1],fe===!0&&F.setGlobalState(b.clippingPlanes,_.state.camera)):_=null,v.pop(),g=v.length>0?v[v.length-1]:null};function ft(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)_.pushLight(e),e.castShadow&&_.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||de.intersectsSprite(e)){r&&ge.setFromMatrixPosition(e.matrixWorld).applyMatrix4(me);let t=Ae.update(e),i=e.material;i.visible&&g.push(e,t,i,n,ge.z,null)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||de.intersectsObject(e))){let t=Ae.update(e),i=e.material;if(r&&(e.boundingSphere===void 0?(t.boundingSphere===null&&t.computeBoundingSphere(),ge.copy(t.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),ge.copy(e.boundingSphere.center)),ge.applyMatrix4(e.matrixWorld).applyMatrix4(me)),Array.isArray(i)){let r=t.groups;for(let a=0,o=r.length;a<o;a++){let o=r[a],s=i[o.materialIndex];s&&s.visible&&g.push(e,t,s,n,ge.z,o)}}else i.visible&&g.push(e,t,i,n,ge.z,null)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)ft(i[e],t,n,r)}function pt(e,t,n,r){let i=e.opaque,a=e.transmissive,o=e.transparent;_.setupLightsView(n),fe===!0&&F.setGlobalState(b.clippingPlanes,n),r&&M.viewport(te.copy(r)),i.length>0&&gt(i,t,n),a.length>0&&gt(a,t,n),o.length>0&&gt(o,t,n),M.buffers.depth.setTest(!0),M.buffers.depth.setMask(!0),M.buffers.color.setMask(!0),M.setPolygonOffset(!1)}function ht(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;_.state.transmissionRenderTarget[r.id]===void 0&&(_.state.transmissionRenderTarget[r.id]=new ot(1,1,{generateMipmaps:!0,type:j.has(`EXT_color_buffer_half_float`)||j.has(`EXT_color_buffer_float`)?it:Se,minFilter:Ne,samples:4,stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:o.workingColorSpace}));let a=_.state.transmissionRenderTarget[r.id],s=r.viewport||te;a.setSize(s.z*b.transmissionResolutionScale,s.w*b.transmissionResolutionScale);let c=b.getRenderTarget(),l=b.getActiveCubeFace(),u=b.getActiveMipmapLevel();b.setRenderTarget(a),b.getClearColor(O),ne=b.getClearAlpha(),ne<1&&b.setClearColor(16777215,.5),b.clear(),ve&&Le.render(n);let d=b.toneMapping;b.toneMapping=0;let f=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),_.setupLightsView(r),fe===!0&&F.setGlobalState(b.clippingPlanes,r),gt(e,n,r),P.updateMultisampleRenderTarget(a),P.updateRenderTargetMipmap(a),j.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let a=t[i],o=a.object,s=a.geometry,c=a.material,l=a.group;if(c.side===2&&o.layers.test(r.layers)){let t=c.side;c.side=1,c.needsUpdate=!0,_t(o,n,r,s,c,l),c.side=t,c.needsUpdate=!0,e=!0}}e===!0&&(P.updateMultisampleRenderTarget(a),P.updateRenderTargetMipmap(a))}b.setRenderTarget(c,l,u),b.setClearColor(O,ne),f!==void 0&&(r.viewport=f),b.toneMapping=d}function gt(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],o=a.object,s=a.geometry,c=a.group,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&_t(o,t,n,s,l,c)}}function _t(e,t,n,r,i,a){e.onBeforeRender(b,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(b,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,b.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,b.renderBufferDirect(n,t,r,i,e,a),i.side=2):b.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(b,t,n,r,i,a)}function vt(e,t,n){t.isScene!==!0&&(t=_e);let r=N.get(e),i=_.state.lights,a=_.state.shadowsArray,o=i.state.version,s=je.getParameters(e,i.state,a,t,n),c=je.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial?t.environment:null,r.fog=t.fog,r.envMap=(e.isMeshStandardMaterial?Ee:we).get(e.envMap||r.environment),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,$e),l=new Map,r.programs=l);let u=l.get(c);if(u!==void 0){if(r.currentProgram===u&&r.lightsStateVersion===o)return L(e,s),u}else s.uniforms=je.getUniforms(e),e.onBeforeCompile(s,b),u=je.acquireProgram(s,c),l.set(c,u),r.uniforms=s.uniforms;let d=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(d.clippingPlanes=F.uniform),L(e,s),r.needsLights=St(e),r.lightsStateVersion=o,r.needsLights&&(d.ambientLightColor.value=i.state.ambient,d.lightProbe.value=i.state.probe,d.directionalLights.value=i.state.directional,d.directionalLightShadows.value=i.state.directionalShadow,d.spotLights.value=i.state.spot,d.spotLightShadows.value=i.state.spotShadow,d.rectAreaLights.value=i.state.rectArea,d.ltc_1.value=i.state.rectAreaLTC1,d.ltc_2.value=i.state.rectAreaLTC2,d.pointLights.value=i.state.point,d.pointLightShadows.value=i.state.pointShadow,d.hemisphereLights.value=i.state.hemi,d.directionalShadowMap.value=i.state.directionalShadowMap,d.directionalShadowMatrix.value=i.state.directionalShadowMatrix,d.spotShadowMap.value=i.state.spotShadowMap,d.spotLightMatrix.value=i.state.spotLightMatrix,d.spotLightMap.value=i.state.spotLightMap,d.pointShadowMap.value=i.state.pointShadowMap,d.pointShadowMatrix.value=i.state.pointShadowMatrix),r.currentProgram=u,r.uniformsList=null,u}function yt(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=mi.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function L(e,t){let n=N.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function bt(e,t,n,r,i){t.isScene!==!0&&(t=_e),P.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial?t.environment:null,s=w===null?b.outputColorSpace:w.isXRRenderTarget===!0?w.texture.colorSpace:qe,c=(r.isMeshStandardMaterial?Ee:we).get(r.envMap||o),l=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,u=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),d=!!n.morphAttributes.position,f=!!n.morphAttributes.normal,p=!!n.morphAttributes.color,m=0;r.toneMapped&&(w===null||w.isXRRenderTarget===!0)&&(m=b.toneMapping);let h=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,g=h===void 0?0:h.length,v=N.get(r),y=_.state.lights;if(fe===!0&&(pe===!0||e!==ee)){let t=e===ee&&r.id===T;F.setState(r,e,t)}let x=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==y.state.version?x=!0:v.outputColorSpace===s?i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i.colorTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i.colorTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?x=!0:v.envMap===c?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==F.numPlanes||v.numIntersection!==F.numIntersection)?x=!0:v.vertexAlphas===l&&v.vertexTangents===u&&v.morphTargets===d&&v.morphNormals===f&&v.morphColors===p&&v.toneMapping===m?v.morphTargetsCount!==g&&(x=!0):x=!0:x=!0:x=!0:(x=!0,v.__version=r.version);let S=v.currentProgram;x===!0&&(S=vt(r,t,i));let C=!1,te=!1,E=!1,D=S.getUniforms(),O=v.uniforms;if(M.useProgram(S.program)&&(C=!0,te=!0,E=!0),r.id!==T&&(T=r.id,te=!0),C||ee!==e){M.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),D.setValue(A,`projectionMatrix`,e.projectionMatrix),D.setValue(A,`viewMatrix`,e.matrixWorldInverse);let t=D.map.cameraPosition;t!==void 0&&t.setValue(A,he.setFromMatrixPosition(e.matrixWorld)),xe.logarithmicDepthBuffer&&D.setValue(A,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&D.setValue(A,`isOrthographic`,e.isOrthographicCamera===!0),ee!==e&&(ee=e,te=!0,E=!0)}if(i.isSkinnedMesh){D.setOptional(A,i,`bindMatrix`),D.setOptional(A,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),D.setValue(A,`boneTexture`,e.boneTexture,P))}i.isBatchedMesh&&(D.setOptional(A,i,`batchingTexture`),D.setValue(A,`batchingTexture`,i._matricesTexture,P),D.setOptional(A,i,`batchingIdTexture`),D.setValue(A,`batchingIdTexture`,i._indirectTexture,P),D.setOptional(A,i,`batchingColorTexture`),i._colorsTexture!==null&&D.setValue(A,`batchingColorTexture`,i._colorsTexture,P));let ne=n.morphAttributes;if((ne.position!==void 0||ne.normal!==void 0||ne.color!==void 0)&&Re.update(i,n,S),(te||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,D.setValue(A,`receiveShadow`,i.receiveShadow)),r.isMeshGouraudMaterial&&r.envMap!==null&&(O.envMap.value=c,O.flipEnvMap.value=c.isCubeTexture&&c.isRenderTargetTexture===!1?-1:1),r.isMeshStandardMaterial&&r.envMap===null&&t.environment!==null&&(O.envMapIntensity.value=t.environmentIntensity),te&&(D.setValue(A,`toneMappingExposure`,b.toneMappingExposure),v.needsLights&&xt(O,E),a&&r.fog===!0&&Me.refreshFogUniforms(O,a),Me.refreshMaterialUniforms(O,r,ie,k,_.state.transmissionRenderTarget[e.id]),mi.upload(A,yt(v),O,P)),r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(mi.upload(A,yt(v),O,P),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&D.setValue(A,`center`,i.center),D.setValue(A,`modelViewMatrix`,i.modelViewMatrix),D.setValue(A,`normalMatrix`,i.normalMatrix),D.setValue(A,`modelMatrix`,i.matrixWorld),r.isShaderMaterial||r.isRawShaderMaterial){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];Ge.update(n,S),Ge.bind(n,S)}}return S}function xt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function St(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return S},this.getActiveMipmapLevel=function(){return C},this.getRenderTarget=function(){return w},this.setRenderTargetTextures=function(e,t,n){let r=N.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),N.get(e.texture).__webglTexture=t,N.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=N.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0};let R=A.createFramebuffer();this.setRenderTarget=function(e,t=0,n=0){w=e,S=t,C=n;let r=!0,i=null,a=!1,o=!1;if(e){let s=N.get(e);if(s.__useDefaultFramebuffer!==void 0)M.bindFramebuffer(A.FRAMEBUFFER,null),r=!1;else if(s.__webglFramebuffer===void 0)P.setupRenderTarget(e);else if(s.__hasExternalTextures)P.rebindTextures(e,N.get(e.texture).__webglTexture,N.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(s.__boundDepthTexture!==t){if(t!==null&&N.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.`);P.setupDepthRenderbuffer(e)}}let c=e.texture;(c.isData3DTexture||c.isDataArrayTexture||c.isCompressedArrayTexture)&&(o=!0);let l=N.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(i=Array.isArray(l[t])?l[t][n]:l[t],a=!0):i=e.samples>0&&P.useMultisampledRTT(e)===!1?N.get(e).__webglMultisampledFramebuffer:Array.isArray(l)?l[n]:l,te.copy(e.viewport),E.copy(e.scissor),D=e.scissorTest}else te.copy(se).multiplyScalar(ie).floor(),E.copy(ce).multiplyScalar(ie).floor(),D=ue;if(n!==0&&(i=R),M.bindFramebuffer(A.FRAMEBUFFER,i)&&r&&M.drawBuffers(e,i),M.viewport(te),M.scissor(E),M.setScissorTest(D),a){let r=N.get(e.texture);A.framebufferTexture2D(A.FRAMEBUFFER,A.COLOR_ATTACHMENT0,A.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(o){let r=t;for(let t=0;t<e.textures.length;t++){let i=N.get(e.textures[t]);A.framebufferTextureLayer(A.FRAMEBUFFER,A.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=N.get(e.texture);A.framebufferTexture2D(A.FRAMEBUFFER,A.COLOR_ATTACHMENT0,A.TEXTURE_2D,t.__webglTexture,n)}T=-1},this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=N.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){M.bindFramebuffer(A.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;if(!xe.textureFormatReadable(c)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(!xe.textureTypeReadable(l)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&(e.textures.length>1&&A.readBuffer(A.COLOR_ATTACHMENT0+s),A.readPixels(t,n,r,i,Ue.convert(c),Ue.convert(l),a))}finally{let e=w===null?null:N.get(w).__webglFramebuffer;M.bindFramebuffer(A.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=N.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){M.bindFramebuffer(A.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;if(!xe.textureFormatReadable(l))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(!xe.textureTypeReadable(u))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let d=A.createBuffer();A.bindBuffer(A.PIXEL_PACK_BUFFER,d),A.bufferData(A.PIXEL_PACK_BUFFER,a.byteLength,A.STREAM_READ),e.textures.length>1&&A.readBuffer(A.COLOR_ATTACHMENT0+s),A.readPixels(t,n,r,i,Ue.convert(l),Ue.convert(u),0);let f=w===null?null:N.get(w).__webglFramebuffer;M.bindFramebuffer(A.FRAMEBUFFER,f);let p=A.fenceSync(A.SYNC_GPU_COMMANDS_COMPLETE,0);return A.flush(),await mt(A,p,4),A.bindBuffer(A.PIXEL_PACK_BUFFER,d),A.getBufferSubData(A.PIXEL_PACK_BUFFER,0,a),A.deleteBuffer(d),A.deleteSync(p),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;P.setTexture2D(e,0),A.copyTexSubImage2D(A.TEXTURE_2D,n,0,0,o,s,i,a),M.unbindTexture()};let Ct=A.createFramebuffer(),wt=A.createFramebuffer();this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=null){a===null&&(i===0?a=0:(Te(`WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels.`),a=i,i=0));let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=Ue.convert(t.format),_=Ue.convert(t.type),v;t.isData3DTexture?(P.setTexture3D(t,0),v=A.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(P.setTexture2DArray(t,0),v=A.TEXTURE_2D_ARRAY):(P.setTexture2D(t,0),v=A.TEXTURE_2D),A.pixelStorei(A.UNPACK_FLIP_Y_WEBGL,t.flipY),A.pixelStorei(A.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),A.pixelStorei(A.UNPACK_ALIGNMENT,t.unpackAlignment);let y=A.getParameter(A.UNPACK_ROW_LENGTH),b=A.getParameter(A.UNPACK_IMAGE_HEIGHT),x=A.getParameter(A.UNPACK_SKIP_PIXELS),S=A.getParameter(A.UNPACK_SKIP_ROWS),C=A.getParameter(A.UNPACK_SKIP_IMAGES);A.pixelStorei(A.UNPACK_ROW_LENGTH,h.width),A.pixelStorei(A.UNPACK_IMAGE_HEIGHT,h.height),A.pixelStorei(A.UNPACK_SKIP_PIXELS,l),A.pixelStorei(A.UNPACK_SKIP_ROWS,u),A.pixelStorei(A.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=N.get(e),r=N.get(t),h=N.get(n.__renderTarget),g=N.get(r.__renderTarget);M.bindFramebuffer(A.READ_FRAMEBUFFER,h.__webglFramebuffer),M.bindFramebuffer(A.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(A.framebufferTextureLayer(A.READ_FRAMEBUFFER,A.COLOR_ATTACHMENT0,N.get(e).__webglTexture,i,d+n),A.framebufferTextureLayer(A.DRAW_FRAMEBUFFER,A.COLOR_ATTACHMENT0,N.get(t).__webglTexture,a,m+n)),A.blitFramebuffer(l,u,o,s,f,p,o,s,A.DEPTH_BUFFER_BIT,A.NEAREST);M.bindFramebuffer(A.READ_FRAMEBUFFER,null),M.bindFramebuffer(A.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||N.has(e)){let n=N.get(e),r=N.get(t);M.bindFramebuffer(A.READ_FRAMEBUFFER,Ct),M.bindFramebuffer(A.DRAW_FRAMEBUFFER,wt);for(let e=0;e<c;e++)w?A.framebufferTextureLayer(A.READ_FRAMEBUFFER,A.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):A.framebufferTexture2D(A.READ_FRAMEBUFFER,A.COLOR_ATTACHMENT0,A.TEXTURE_2D,n.__webglTexture,i),T?A.framebufferTextureLayer(A.DRAW_FRAMEBUFFER,A.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):A.framebufferTexture2D(A.DRAW_FRAMEBUFFER,A.COLOR_ATTACHMENT0,A.TEXTURE_2D,r.__webglTexture,a),i===0?T?A.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):A.copyTexSubImage2D(v,a,f,p,l,u,o,s):A.blitFramebuffer(l,u,o,s,f,p,o,s,A.COLOR_BUFFER_BIT,A.NEAREST);M.bindFramebuffer(A.READ_FRAMEBUFFER,null),M.bindFramebuffer(A.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?A.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?A.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):A.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?A.texSubImage2D(A.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?A.compressedTexSubImage2D(A.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):A.texSubImage2D(A.TEXTURE_2D,a,f,p,o,s,g,_,h);A.pixelStorei(A.UNPACK_ROW_LENGTH,y),A.pixelStorei(A.UNPACK_IMAGE_HEIGHT,b),A.pixelStorei(A.UNPACK_SKIP_PIXELS,x),A.pixelStorei(A.UNPACK_SKIP_ROWS,S),A.pixelStorei(A.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&A.generateMipmap(v),M.unbindTexture()},this.initRenderTarget=function(e){N.get(e).__webglFramebuffer===void 0&&P.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?P.setTextureCube(e,0):e.isData3DTexture?P.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?P.setTexture2DArray(e,0):P.setTexture2D(e,0),M.unbindTexture()},this.resetState=function(){S=0,C=0,w=null,M.reset(),We.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return De}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=o._getDrawingBufferColorSpace(e),t.unpackColorSpace=o._getUnpackColorSpace()}},wa={trophy:`a golden glow and drifting gold sparkles`,topper:`a magician’s swirl of silver sparkles`,tiara:`a sprinkle of diamond glitter`,centurion:`a glowing ripple of glory at your feet`,crown:`a ring of little gold stars`,witch:`moons and stars drifting round you`,mortarboard:`a whizzing atom, for the brainy`,knight:`rose petals falling for the hero`,pumpkin:`spooky embers and a few bats`,astronaut:`a little planet in orbit`,domain:`a cold blue shimmer and drifting starlight`},Ta=new URLSearchParams(location.search).get(`fx`)===`low`;function Ea(e){Ta=e}var Da={dot:0,twinkle:1,star:2,moon:3,petal:4,ember:5,gem:6,planet:7,bat:8},Oa=null;function ka(){if(Oa)return Oa;let e=document.createElement(`canvas`);e.width=e.height=256;let t=e.getContext(`2d`),n=(e,n,r=6)=>{t.save(),t.translate(e%4*64+32,Math.floor(e/4)*64+32),t.fillStyle=t.strokeStyle=`#fff`,t.shadowColor=`rgba(255,255,255,0.9)`,t.shadowBlur=r,n(),t.restore()},r=e=>{t.beginPath(),e.forEach(([e,n],r)=>r?t.lineTo(e,n):t.moveTo(e,n)),t.closePath(),t.fill()},i=(e,t,n,r=-Math.PI/2)=>Array.from({length:e*2},(i,a)=>{let o=a/(e*2)*Math.PI*2+r,s=a%2?n:t;return[Math.cos(o)*s,Math.sin(o)*s]});n(Da.dot,()=>{let e=t.createRadialGradient(0,0,0,0,0,28);e.addColorStop(0,`rgba(255,255,255,1)`),e.addColorStop(.25,`rgba(255,255,255,0.8)`),e.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=e,t.fillRect(-32,-32,64,64)},0),n(Da.twinkle,()=>r(i(4,28,5)),8),n(Da.star,()=>r(i(5,25,11)),6),n(Da.moon,()=>{t.beginPath(),t.arc(0,0,22,0,Math.PI*2),t.fill(),t.globalCompositeOperation=`destination-out`,t.shadowBlur=0,t.beginPath(),t.arc(10,-7,19,0,Math.PI*2),t.fill()}),n(Da.petal,()=>{t.beginPath(),t.moveTo(0,-24),t.bezierCurveTo(20,-12,16,16,0,24),t.bezierCurveTo(-16,16,-20,-12,0,-24),t.fill(),t.shadowBlur=0,t.fillStyle=`rgba(0,0,0,0.18)`,t.fillRect(-1.5,-16,3,34)},2),n(Da.ember,()=>{let e=t.createRadialGradient(0,6,0,0,4,22);e.addColorStop(0,`rgba(255,255,255,1)`),e.addColorStop(.5,`rgba(255,255,255,0.75)`),e.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=e,t.beginPath(),t.moveTo(0,-26),t.bezierCurveTo(14,-6,18,10,0,22),t.bezierCurveTo(-18,10,-14,-6,0,-26),t.fill()},0),n(Da.gem,()=>{r([[0,-26],[15,0],[0,26],[-15,0]])},8),n(Da.planet,()=>{t.beginPath(),t.arc(0,0,15,0,Math.PI*2),t.fill(),t.lineWidth=4.5,t.beginPath(),t.ellipse(0,0,28,8,-.35,.15,Math.PI-.15),t.stroke(),t.globalAlpha=.6,t.beginPath(),t.ellipse(0,0,28,8,-.35,Math.PI+.55,Math.PI*2-.55),t.stroke()}),n(Da.bat,()=>{t.beginPath(),t.moveTo(0,-6),t.quadraticCurveTo(-10,-16,-28,-10),t.quadraticCurveTo(-22,-4,-24,4),t.quadraticCurveTo(-16,-2,-12,6),t.quadraticCurveTo(-6,0,0,10),t.quadraticCurveTo(6,0,12,6),t.quadraticCurveTo(16,-2,24,4),t.quadraticCurveTo(22,-4,28,-10),t.quadraticCurveTo(10,-16,0,-6),t.fill(),r([[-5,-6],[-4,-14],[-1,-8],[1,-8],[4,-14],[5,-6]])},0);let a=new u(e);return a.colorSpace=Be,a.generateMipmaps=!0,a.minFilter=Ne,Oa=a,a}var Aa={domain:[{kind:`aura`,color:`#7ab4ff`,strength:.4},{kind:`pool`,color:`#6a7aff`,strength:.3},{kind:`motes`,mode:`rise`,n:16,glyphs:[`twinkle`,`star`,`dot`],colors:[`#d4ecff`,`#9a8cff`,`#ffffff`],size:[.09,.16],period:[3.2,4.6],out:[1,1.3],y:.05,y1:1.2,swirl:3,spin:1.4,twinkle:.7}],trophy:[{kind:`aura`,color:`#ffd458`,strength:.6},{kind:`pool`,color:`#ffd65a`,strength:.6},{kind:`motes`,mode:`rise`,n:24,glyphs:[`twinkle`,`twinkle`,`dot`],colors:[`#ffd84a`,`#fff0a0`,`#ffb52a`],size:[.12,.21],period:[2.6,4.2],out:[.95,1.35],y:.05,y1:1.2,swirl:.9,drift:.04,spin:1.2,twinkle:.7}],topper:[{kind:`motes`,mode:`rise`,n:22,glyphs:[`twinkle`,`star`,`dot`],colors:[`#f4f0ff`,`#c29cff`,`#9cd0ff`],size:[.1,.18],period:[2.8,3.6],out:[1.15,1.3],y:.02,y1:1.15,swirl:7.5,taper:.55,spin:2,twinkle:.6}],tiara:[{kind:`motes`,mode:`rise`,n:24,glyphs:[`gem`,`twinkle`,`gem`],colors:[`#ffffff`,`#ffb4e4`,`#aeeaff`],size:[.08,.14],period:[3.4,5],out:[.85,1.3],y:1.25,y1:.02,swirl:.6,drift:.06,spin:2.5,twinkle:.85}],centurion:[{kind:`pool`,color:`#ff8a3a`,strength:.3,ring:{color:`#ffc84a`,every:2.4}},{kind:`motes`,mode:`rise`,n:10,glyphs:[`ember`],colors:[`#ffb84a`,`#ff7a2a`],size:[.09,.13],period:[1.8,2.6],out:[.7,1.1],y:0,y1:.6,drift:.03,twinkle:.3}],crown:[{kind:`motes`,mode:`orbit`,n:7,glyphs:[`star`],colors:[`#ffd23f`,`#ffe27a`],size:[.18,.2],period:[9,9],out:[1.35,1.35],y:.62,tilt:[[.12,.05]],bob:.03,spin:1.2,twinkle:.25}],witch:[{kind:`pool`,color:`#a07aff`,strength:.25},{kind:`motes`,mode:`rise`,n:14,glyphs:[`moon`,`star`,`twinkle`],colors:[`#d0b2ff`,`#a8ffd0`,`#fff2a8`],size:[.13,.2],period:[4,6],out:[1,1.35],y:.1,y1:1.15,swirl:1.6,drift:.05,spin:.6,twinkle:.4}],mortarboard:[{kind:`motes`,mode:`orbit`,n:3,glyphs:[`dot`],colors:[`#8ae8ff`,`#b8f4ff`,`#8ae8ff`],size:[.21,.21],period:[1.4,1.8],out:[1.3,1.3],y:.6,tilt:[[.8,.45],[-.8,.45],[.1,-.6]],trail:6,twinkle:.15}],knight:[{kind:`motes`,mode:`rise`,n:16,glyphs:[`petal`],colors:[`#ff4a62`,`#ff7f96`,`#e02a48`,`#ffd1da`],size:[.12,.17],period:[3.6,5.5],out:[.8,1.35],y:1.3,y1:0,swirl:1.2,drift:.12,spin:2.2,blend:`normal`,strength:.95}],pumpkin:[{kind:`motes`,mode:`rise`,n:18,glyphs:[`ember`,`ember`,`dot`],colors:[`#ff8a1f`,`#ffc23a`,`#ff6a10`,`#9cff5a`],size:[.09,.17],period:[1.8,3],out:[.7,1.15],y:.05,y1:1.05,swirl:.8,drift:.05,twinkle:.5},{kind:`motes`,mode:`orbit`,n:3,glyphs:[`bat`],colors:[`#3a2a4a`],size:[.18,.22],period:[4.5,5.5],out:[1.5,1.75],y:.95,tilt:[[.15,0],[-.1,.12],[.05,-.15]],bob:.08,blend:`normal`,strength:1}],astronaut:[{kind:`motes`,mode:`orbit`,n:1,glyphs:[`planet`],colors:[`#ffc98a`],size:[.3,.3],period:[7,7],out:[1.45,1.45],y:.7,tilt:[[.25,.1]],bob:.03},{kind:`motes`,mode:`orbit`,n:14,glyphs:[`twinkle`,`dot`],colors:[`#ffffff`,`#bcd6ff`,`#e4d4ff`],size:[.065,.13],period:[-14,-18],out:[1.2,1.7],y:.45,tilt:[[.35,.2]],bob:.2,spin:.8,twinkle:.9}]},ja=`
attribute vec4 aA;
attribute vec4 aB;
attribute vec3 aC;
attribute vec3 aCol;
uniform float uTime;
uniform float uH;
uniform float uR;
uniform float uHalfH;
uniform float uY0;
uniform float uY1;
uniform float uSwirl;
uniform float uTaper;
uniform float uDrift;
uniform float uSpin;
uniform float uTwinkle;
uniform float uBob;
varying vec3 vColor;
varying float vAlpha;
varying vec2 vCell;
varying float vSpin;
#include <fog_pars_vertex>
float hash(float n) { return fract(sin(n) * 43758.5453); }
void main() {
  float t = uTime;
  vec3 p;
  float alpha = 1.0;
#ifdef ORBIT
  // aA: angle, radii out, height (of the head's), seconds round. aC: tilt about x, about z, how far behind its leader.
  float a = aA.x + t * 6.2832 / aA.w - aC.z;
  vec3 q = vec3(cos(a), 0.0, sin(a)) * uR * aA.y;
  float cx = cos(aC.x), sx = sin(aC.x), cz = cos(aC.y), sz = sin(aC.y);
  q = vec3(q.x, q.y * cx - q.z * sx, q.y * sx + q.z * cx);
  q = vec3(q.x * cz - q.y * sz, q.x * sz + q.y * cz, q.z);
  p = q + vec3(0.0, aA.z * uH + sin(t * 1.3 + aA.x * 3.0) * uBob, 0.0);
  // (A trail fades behind its leader.)
  alpha = 1.0 - aC.z * 1.5;
#else
  // aA: angle, radii out, where it is in its trip to start with, seconds a trip. Born somewhere new each trip.
  float k = t / aA.w + aA.z;
  float u = fract(k);
  float n = floor(k);
  float a = aA.x + hash(n * 7.13 + aA.x) * 6.2832 + u * uSwirl;
  float r = uR * aA.y * (0.8 + 0.4 * hash(n * 3.71 + aA.z)) * mix(1.0, uTaper, u);
  float y = mix(uY0, uY1, u) * uH;
  // Kept further out passing in front of the face.
  float front = smoothstep(0.0, 0.7, sin(a));
  float face = 1.0 - smoothstep(0.0, 0.3 * uH, abs(y - 0.8 * uH));
  r *= 1.0 + 0.45 * front * face;
  p = vec3(cos(a) * r, y, sin(a) * r);
  p.x += sin(t * 1.3 + aA.x * 5.0) * uDrift;
  p.z += cos(t * 1.1 + aA.x * 3.0) * uDrift;
  alpha = smoothstep(0.0, 0.15, u) * (1.0 - smoothstep(0.65, 1.0, u));
#endif
  // aB: picture, size, turn rate, flicker rate.
  alpha *= 1.0 - uTwinkle + uTwinkle * (0.5 + 0.5 * sin(t * aB.w + aA.x * 11.0));
  vAlpha = alpha;
  vColor = aCol;
  vCell = vec2(mod(aB.x, 4.0), floor(aB.x / 4.0));
  vSpin = aB.z * uSpin * t + aA.x * 4.0;
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  // (The object's own scale, for a staged animal grown or shrunk.)
  float s = length(modelMatrix[0].xyz);
  gl_PointSize = aB.y * s * projectionMatrix[1][1] * uHalfH / max(0.1, -mvPosition.z);
  // (Never smaller than a few pixels, so they still read from across the square.)
  gl_PointSize = max(gl_PointSize, 4.0);
  #include <fog_vertex>
}
`,Ma=`
  #include <colorspace_fragment>
  float fade = 1.0;
#ifdef USE_FOG
  #ifdef FOG_EXP2
    fade = exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
  #else
    fade = 1.0 - smoothstep(fogNear, fogFar, vFogDepth);
  #endif
#endif
  gl_FragColor = vec4(gl_FragColor.rgb * a * fade, a * fade * uCover);
`,Na=`
uniform sampler2D uAtlas;
uniform float uFade;
uniform float uCover;
varying vec3 vColor;
varying float vAlpha;
varying vec2 vCell;
varying float vSpin;
#include <fog_pars_fragment>
void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float c = cos(vSpin), s = sin(vSpin);
  uv = mat2(c, -s, s, c) * uv * 1.06 + 0.5;
  if (uv.x < 0.0 || uv.y < 0.0 || uv.x > 1.0 || uv.y > 1.0) discard;
  vec4 tex = texture2D(uAtlas, (vec2(vCell.x, 3.0 - vCell.y) + vec2(uv.x, 1.0 - uv.y)) / 4.0);
  float a = tex.a * vAlpha * uFade;
  if (a < 0.004) discard;
  // A whiter heart where it's brightest, so a glint reads as light.
  vec3 col = mix(vColor, vec3(1.0), pow(tex.a, 4.0) * 0.35 * BRIGHT) * tex.rgb;
  gl_FragColor = vec4(col, 1.0);
  ${Ma}
}
`,Pa=`
uniform float uH;
uniform float uR;
varying vec2 vUv;
#include <fog_pars_vertex>
void main() {
  vUv = uv * 2.0 - 1.0;
  float s = length(modelMatrix[0].xyz);
  vec4 mvPosition = modelViewMatrix * vec4(0.0, uH * 0.52, 0.0, 1.0);
  // Back along the line from the camera (so it stays centred on them), grown to look the same size from there.
  float k = 1.0 + uR * 1.1 * s / max(0.5, length(mvPosition.xyz));
  mvPosition.xyz *= k;
  mvPosition.xy += position.xy * vec2(uR * 3.0, uH * 1.5) * s * k;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`,Fa=`
uniform vec3 uColor;
uniform float uStrength;
uniform float uTime;
uniform float uFade;
uniform float uCover;
varying vec2 vUv;
#include <fog_pars_fragment>
void main() {
  float d = length(vUv);
  float a = pow(smoothstep(1.0, 0.15, d), 1.5) * uStrength * uFade * (0.85 + 0.15 * sin(uTime * 1.6));
  gl_FragColor = vec4(uColor, 1.0);
  ${Ma}
}
`,Ia=`
uniform float uR;
varying vec2 vUv;
#include <fog_pars_vertex>
void main() {
  vUv = uv * 2.0 - 1.0;
  vec4 mvPosition = modelViewMatrix * vec4(position.x * uR * 2.6, 0.03, -position.y * uR * 2.6, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`,La=`
uniform vec3 uColor;
uniform vec3 uRing;
uniform float uStrength;
uniform float uEvery;
uniform float uTime;
uniform float uFade;
uniform float uCover;
varying vec2 vUv;
#include <fog_pars_fragment>
void main() {
  float d = length(vUv);
  float pool = pow(max(0.0, 1.0 - d / 0.62), 1.6) * uStrength;
  vec3 col = uColor * pool;
  float a = pool;
  if (uEvery > 0.0) {
    // The ripple: a bright band going out and fading as it goes.
    float u = fract(uTime / uEvery);
    float ring = exp(-pow((d - (0.2 + u * 0.78)) / 0.06, 2.0)) * (1.0 - u) * 1.3;
    col += uRing * ring;
    a += ring;
  }
  gl_FragColor = vec4(col / max(a, 0.001), 1.0);
  a *= uFade * (1.0 - smoothstep(0.92, 1.0, d));
  ${Ma}
}
`,Ra=new Map,za=null;function Ba(e,t){let n=Ra.get(e);if(n)return n;let r=t.mode===`orbit`?t.trail??0:0,i=t.n*(1+r),a=new Float32Array(i*4),o=new Float32Array(i*4),s=new Float32Array(i*3),c=new Float32Array(i*3),l=(()=>{let t=0;for(let n of e)t=t*31+n.charCodeAt(0)|0;return()=>(t=t*1103515245+12345&2147483647)/2147483647})(),u=([e,t],n)=>e+(t-e)*n,d=new Ve,f=0;for(let e=0;e<t.n;e++){let n=t.mode===`orbit`?e/t.n*Math.PI*2:l()*Math.PI*2,i=u(t.out,l()),p=u(t.period,l()),m=Da[t.glyphs[e%t.glyphs.length]],h=u(t.size,l()),g=(l()<.5?-1:1)*(.5+l()),_=2+l()*3,v=t.tilt?.[e%t.tilt.length]??[0,0];d.set(t.colors[e%t.colors.length]);for(let u=0;u<=r;u++,f++)a.set([n,i,t.mode===`orbit`?t.y:(e+l()*.5)/t.n,p],f*4),o.set([m,h*(1-u*.17),g,_],f*4),s.set([v[0],v[1],u*.1],f*3),c.set([d.r,d.g,d.b],f*3)}let p=new dt;return p.setAttribute(`position`,new we(new Float32Array(i*3),3)),p.setAttribute(`aA`,new we(a,4)),p.setAttribute(`aB`,new we(o,4)),p.setAttribute(`aC`,new we(s,3)),p.setAttribute(`aCol`,new we(c,3)),p.boundingSphere=new ge(new I(0,1,0),2.6),Ra.set(e,p),p}var Va={blending:5,blendSrc:201,blendDst:205},Ha={motes:.55,aura:.5,pool:.8},Ua=()=>be.clone(Z.fog);function Wa(e,t,n){let r=Aa[e];if(!r)return null;let i=new je,a=new je;i.name=a.name=`hatFx`;let o=[],s=[],c=[],l=[],u={value:400},d=new P,f=e=>{e.getDrawingBufferSize(d),u.value=d.y/2};return r.forEach((r,d)=>{let p={uTime:{value:0},uH:{value:t},uR:{value:n},uFade:{value:1},uCover:{value:r.kind===`motes`&&r.blend===`normal`?1:Ha[r.kind]}};if(r.kind===`motes`){let t=Ba(`${e}:${d}`,r),n=r.mode===`rise`,a=new se({uniforms:{...Ua(),...p,uHalfH:u,uAtlas:{value:ka()},uY0:{value:r.y},uY1:{value:r.y1??r.y},uSwirl:{value:r.swirl??0},uTaper:{value:r.taper??1},uDrift:{value:r.drift??0},uSpin:{value:r.spin??0},uTwinkle:{value:r.twinkle??0},uBob:{value:r.bob??0}},vertexShader:ja,fragmentShader:Na,defines:{...n?{}:{ORBIT:``},BRIGHT:r.blend===`normal`?`0.0`:`1.0`},transparent:!0,depthWrite:!1,...Va,fog:!0});a.uniforms.uFade.value=r.strength??1,a.userData.strength=r.strength??1;let c=new ue(t,a);c.onBeforeRender=f,c.renderOrder=2,i.add(c),o.push(a),s.push({pts:c,full:t.getAttribute(`position`).count})}else{za??=new T(1,1);let e=r.kind===`aura`,t=new se({uniforms:{...Ua(),...p,uColor:{value:new Ve(r.color)},uStrength:{value:r.strength},uRing:{value:new Ve(r.kind===`pool`?r.ring?.color??r.color:r.color)},uEvery:{value:r.kind===`pool`?r.ring?.every??0:0}},vertexShader:e?Pa:Ia,fragmentShader:e?Fa:La,transparent:!0,depthWrite:!1,...Va,fog:!0});t.userData.strength=1;let n=new ht(za,t);n.frustumCulled=!1,n.userData.noBake=!0,n.renderOrder=+!e,(e?i:a).add(n),(e?c:l).push(n),o.push(t)}}),{group:i,ground:a,update(e,t,n){let r=e%1800,i=n?.55:1;for(let e of o)e.uniforms.uTime.value=r,e.uniforms.uFade.value=i*e.userData.strength;for(let{pts:e,full:t}of s)e.geometry.setDrawRange(0,Ta?Math.ceil(t*.4):t);for(let e of c)e.visible=!Ta;let a=t!==`sit`&&t!==`sleep`&&!n;for(let e of l)e.visible=!Ta&&a},dispose(){i.removeFromParent(),a.removeFromParent();for(let e of o)e.dispose()}}}var Ga={heart:0,z:1,q:2,drop:3,flame:4,note:5,sparkle:6,puff:7,anger:8,dot:9,plus:10,times:11,divide:12,pi:13,root:14,swirl:15,shh:16,star:17},Ka=8,qa=3,Ja=64,Ya=`#3b2a20`,Xa=null;function Za(){if(Xa)return Xa;let e=document.createElement(`canvas`);e.width=512,e.height=192;let t=e.getContext(`2d`),n=(e,n)=>{t.save(),t.translate(e%Ka*Ja+Ja/2,Math.floor(e/Ka)*Ja+Ja/2),t.fillStyle=`#fff`,t.strokeStyle=Ya,t.lineWidth=4,t.lineJoin=`round`,n(),t.restore()},r=()=>{t.stroke(),t.fill()},i=(e,n)=>{t.font=`900 ${n}px "Arial Black", Arial, sans-serif`,t.textAlign=`center`,t.textBaseline=`middle`,t.lineWidth=6,t.strokeText(e,0,2),t.fillText(e,0,2)};n(Ga.heart,()=>{t.beginPath(),t.moveTo(0,22),t.bezierCurveTo(-30,2,-22,-26,0,-10),t.bezierCurveTo(22,-26,30,2,0,22),r()}),n(Ga.z,()=>i(`Z`,46)),n(Ga.q,()=>i(`?`,50)),n(Ga.drop,()=>{t.beginPath(),t.moveTo(0,-24),t.bezierCurveTo(8,-8,18,4,16,12),t.arc(0,10,16,.1,Math.PI-.1),t.bezierCurveTo(-18,4,-8,-8,0,-24),r(),t.fillStyle=`rgba(255,255,255,0.9)`,t.beginPath(),t.ellipse(-6,8,3,6,.4,0,Math.PI*2),t.fill()}),n(Ga.flame,()=>{t.beginPath(),t.moveTo(0,-28),t.bezierCurveTo(10,-14,22,-2,18,12),t.bezierCurveTo(14,26,-14,26,-18,12),t.bezierCurveTo(-20,0,-8,-6,-6,-16),t.bezierCurveTo(-2,-10,2,-18,0,-28),r(),t.fillStyle=`rgba(255,255,220,0.9)`,t.beginPath(),t.moveTo(0,-4),t.bezierCurveTo(8,4,10,16,0,18),t.bezierCurveTo(-10,16,-8,4,0,-4),t.fill()}),n(Ga.note,()=>{t.beginPath(),t.ellipse(-8,14,11,8,-.4,0,Math.PI*2),r(),t.fillRect(0,-22,5,36),t.strokeRect(0,-22,5,36),t.beginPath(),t.moveTo(3,-22),t.quadraticCurveTo(22,-16,18,0),t.lineWidth=6,t.strokeStyle=`#fff`,t.stroke()}),n(Ga.sparkle,()=>{t.beginPath();for(let e=0;e<8;e++){let n=e/8*Math.PI*2-Math.PI/2,r=e%2?7:26;t.lineTo(Math.cos(n)*r,Math.sin(n)*r)}t.closePath(),r()}),n(Ga.puff,()=>{t.beginPath();for(let[e,n,r]of[[-12,4,13],[6,-6,15],[14,8,11],[0,10,12]])t.moveTo(e+r,n),t.arc(e,n,r,0,Math.PI*2);t.lineWidth=3,t.strokeStyle=`rgba(59,42,32,0.35)`,r()}),n(Ga.anger,()=>{t.lineWidth=9,t.lineCap=`round`;for(let[e,n]of[[1,1],[-1,1],[1,-1],[-1,-1]])t.beginPath(),t.moveTo(e*6,n*20),t.quadraticCurveTo(e*6,n*6,e*20,n*6),t.strokeStyle=`#fff`,t.stroke()}),n(Ga.dot,()=>{t.beginPath(),t.arc(0,0,14,0,Math.PI*2),r()}),n(Ga.plus,()=>i(`+`,54)),n(Ga.times,()=>i(`×`,50)),n(Ga.divide,()=>i(`÷`,50)),n(Ga.pi,()=>i(`π`,46)),n(Ga.root,()=>i(`√`,46)),n(Ga.swirl,()=>{t.lineWidth=7,t.lineCap=`round`,t.beginPath(),t.arc(0,0,18,-.4,Math.PI*1.55),t.strokeStyle=`#fff`,t.stroke(),t.beginPath(),t.moveTo(16,-18),t.lineTo(18,-6),t.lineTo(6,-8),t.stroke()}),n(Ga.shh,()=>i(`shh`,28)),n(Ga.star,()=>{t.beginPath();for(let e=0;e<10;e++){let n=e/10*Math.PI*2-Math.PI/2,r=e%2?10:24;t.lineTo(Math.cos(n)*r,Math.sin(n)*r)}t.closePath(),r()});let a=new u(e);return a.colorSpace=Be,Xa=Object.values(Ga).map(e=>{let t=a.clone();return t.repeat.set(1/Ka,1/qa),t.offset.set(e%Ka/Ka,1-(Math.floor(e/Ka)+1)/qa),t.needsUpdate=!0,t}),Xa}var Qa=new Map,$a=new Set;function eo(e,t={}){let n=`${e}:${JSON.stringify(t)}`,r=Qa.get(n);return r||(r=new pe({color:e,roughness:.6,flatShading:!0,...t}),Qa.set(n,r),$a.add(r)),r}var to=[],no=96;function ro(e,t,n=.016){let r=new ht(new ut(n,t,3,6),e);return r.userData.skin=!0,r.geometry.translate(0,t/2+n,0),r}function io(e,t,n){let r=n*.7,i=(e,t,n,r,i=0,a=0)=>(e.position.set(t,n,r),e.rotation.set(i,0,a),e),a=(...e)=>{let t=new je;return t.add(...e),t};switch(e){case`thumbsup`:return{r:a(i(ro(t,.035,.018),0,r,.01))};case`shush`:return{r:a(i(ro(t,.04),0,r,.02))};case`peace`:return{r:a(i(ro(t,.05),.012,r,0,0,-.32),i(ro(t,.05),-.012,r,0,0,.32))};case`loser`:return{r:a(i(ro(t,.06),0,r,.03),i(ro(t,.045),.005,r*.6,.03,0,-Math.PI/2))};case`fingerguns`:{let e=()=>a(i(ro(t,.05),0,0,n*.6,Math.PI/2),i(ro(t,.02),0,r,0));return{r:e(),l:e()}}case`micdrop`:{let e=a(i(new ht(new g(.014,.01,.12,8),eo(`#2b2b30`)),0,0,0),i(new ht(new S(.03,10,8),eo(`#8d9096`,{metalness:.6,roughness:.35})),0,.075,0));return e.name=`mic`,{r:e}}case`teasip`:case`thisisfine`:{let t=new ht(new g(.04,.03,.055,12,1,!0),eo(e===`teasip`?`#f4f1ea`:`#e9e2d0`,{side:2})),n=new ht(new m(.037,12),eo(`#8a5a2b`));n.rotation.x=-Math.PI/2,n.position.y=.018;let r=new ht(new m(.03,12),t.material);r.rotation.x=Math.PI/2,r.position.y=-.027;let o=new ht(new D(.016,.005,5,10),t.material);return o.position.set(-.045,0,0),o.rotation.y=Math.PI/2,{r:i(a(t,n,r,o),0,.03,.05)}}case`doot`:{let e=eo(`#e2b33c`,{metalness:.7,roughness:.3}),t=i(new ht(new g(.009,.009,.16,6),e),0,0,.08,Math.PI/2),n=i(new ht(new g(.045,.01,.07,12,1,!0),e),0,0,.19,Math.PI/2);return n.material=eo(`#e2b33c`,{metalness:.7,roughness:.3,side:2}),{r:a(t,n,i(new ht(new pt(.03,.035,.05),e),0,.022,.07))}}case`hearthands`:{let e=new w;e.moveTo(0,-.04),e.bezierCurveTo(-.055,-.005,-.04,.045,0,.022),e.bezierCurveTo(.04,.045,.055,-.005,0,-.04);let t=new ee(e,{depth:.02,bevelEnabled:!0,bevelSize:.006,bevelThickness:.006,bevelSegments:1});t.translate(0,.01,-.01);let n=new ht(t,eo(`#ff5a8a`,{emissive:`#ff2f6b`,emissiveIntensity:.35}));return n.name=`heart`,{r:n}}}return{}}var ao=F.smoothstep,oo=e=>e-Math.floor(e),so=(e,t,n)=>e<t||e>n?0:Math.min(1,(e-t)/.12)*Math.min(1,(n-e)/.25);function co(e,t,n,r,i,a){let o=r.size;switch(e){case`slowclap`:{let e=oo(t/1-.5);if(e<.3){let t=(r.hand.x+r.handL.x)/2,n=(r.hand.y+r.handL.y)/2,a=(r.hand.z+r.handL.z)/2+.04;for(let r=0;r<3;r++){let o=r/3*Math.PI*2+.6;i(`sparkle`,`#fff3a6`,t+Math.cos(o)*e*.4,n+Math.sin(o)*e*.4,a,.06,1-e/.3)}}break}case`thumbsup`:case`peace`:{let e=so(t,.35,n-.2);i(`sparkle`,`#fff3a6`,r.hand.x-.05,r.hand.y+.12+Math.sin(t*6)*.01,r.hand.z+.03,.06+Math.sin(t*9)*.015,e),i(`sparkle`,`#ffffff`,r.hand.x+.06,r.hand.y+.06,r.hand.z+.05,.04+Math.sin(t*11+1)*.012,e);break}case`blowkiss`:{let e=(t-.75)/(n-.75);e>0&&i(`heart`,`#ff5a8a`,r.mouth.x+Math.sin(e*7)*.03,r.mouth.y+e*.25,r.mouth.z+.06+e*.7,.07+e*.08,1-ao(e,.7,1));break}case`micdrop`:if(a.dropMic(t,r),t>1.72&&t<2.3){let e=(t-1.72)/.58,n=a.dropAt;for(let t=0;t<4;t++){let r=t/4*Math.PI*2+.4;i(`star`,`#ffd23f`,n.x+Math.cos(r)*e*.22,.03+Math.sin(e*Math.PI)*.12,n.z+Math.sin(r)*e*.22,.05,1-e)}}break;case`think`:for(let e=0;e<3;e++){let a=+(oo(t/1.2)*4>e+.5);i(`dot`,`#ffffff`,r.head.x-.12-e*.06,r.top+.04+e*.07,r.head.z,.04+e*.02,a*so(t,.3,n-.1))}break;case`shush`:{let e=oo(t/1.1);i(`shh`,`#bfe3ff`,r.mouth.x-.1-e*.15,r.mouth.y+.05+e*.12,r.mouth.z+.05,.12,so(t,.4,n)*(1-e));break}case`ragequit`:{let e=1+Math.abs(Math.sin(t*10))*.25;i(`anger`,`#e8302a`,r.head.x-o*.55,r.top-.02,r.head.z+.05,.11*e,so(t,.15,n));for(let e of[-1,1])for(let a=0;a<2;a++){let s=oo(t*1.6+a*.5);i(`puff`,`#f2f2f2`,r.head.x+e*(o*.6+s*.12),r.head.y+s*.25,r.head.z-.02,.06+s*.08,(1-s)*so(t,.2,n))}break}case`yawn`:for(let e=0;e<3;e++){let n=oo((t-1.1)/1.2+e/3);t<1.1+e/3*1.2||i(`z`,`#bcd0ff`,r.head.x-.08-n*.15+Math.sin(n*6)*.03,r.top+.02+n*.32,r.head.z,.06+n*.07,Math.min(1,n*5)*(1-ao(n,.7,1)))}break;case`sneeze`:{let e=(t-1.12)/.8;if(e>0&&e<1){i(`puff`,`#ffffff`,r.mouth.x,r.mouth.y,r.mouth.z+.06+e*.25,.08+e*.18,.9*(1-e));for(let t=0;t<6;t++){let n=(t/6-.5)*1.6;i(`drop`,`#9fe0ff`,r.mouth.x+Math.sin(n)*e*.35,r.mouth.y+.04-e*e*.35+Math.cos(t*3)*.04,r.mouth.z+.05+Math.cos(n)*e*.45,.035,1-e)}}break}case`hearthands`:for(let e=0;e<3;e++){let n=oo(t/1.3+e/3);t<.4+e/3*1.3||i(`heart`,e===1?`#ff8fb1`:`#ff5a8a`,r.hand.x*.3+Math.sin(n*5+e)*.08,r.hand.y+.08+n*.45,r.hand.z+.06,.05+n*.05,1-ao(n,.6,1))}break;case`flex`:for(let e=0;e<5;e++){let a=e/5*Math.PI*2+t*1.5,s=Math.max(0,Math.sin(t*7+e*2.1));i(`sparkle`,e%2?`#fff3a6`:`#ffffff`,r.head.x+Math.cos(a)*(o+.22),r.head.y-.05+Math.sin(a*2)*.12,r.head.z+Math.sin(a)*.15,.03+s*.05,s*so(t,.25,n))}break;case`eyeroll`:i(`swirl`,`#ffffff`,r.head.x,r.top+.1,r.head.z,.1,so(t,.2,1.4));break;case`fingerguns`:for(let e of[.45,1.05,1.6]){let n=(t-e)/.25;if(!(n<0||n>1))for(let e of[r.hand,r.handL])i(`sparkle`,`#ffe27a`,e.x,e.y+.02,e.z+.12+n*.08,.05+n*.03,1-n)}break;case`thisisfine`:for(let e=0;e<9;e++){let r=e/9*Math.PI*2+.3,a=.85+Math.sin(t*13+e*2.7)*.15,o=.55+e%3*.12;i(`flame`,e%3==0?`#ffb02e`:`#ff6a1f`,Math.cos(r)*o,.06*a,Math.sin(r)*o,.13*a,so(t,.05,n))}i(`puff`,`#ffffff`,r.hand.x,r.hand.y+.1+oo(t)*.12,r.hand.z+.05,.04+oo(t)*.04,.6*(1-oo(t)));break;case`teasip`:for(let e=0;e<2;e++){let n=oo(t*.8+e*.5);i(`puff`,`#ffffff`,r.hand.x+Math.sin(n*6+e)*.02,r.hand.y+.08+n*.16,r.hand.z+.05,.03+n*.04,.55*(1-n))}break;case`sweat`:{let e=oo(t/1.4);i(`drop`,`#7fd0ff`,r.head.x-o*.45,r.head.y+o*.4-e*o*.5,r.head.z+o*.75,.05,so(t,.1,n));for(let e of[-1,1]){let a=oo(t*1.3+(e>0?.5:0));i(`drop`,`#9fe0ff`,r.head.x+e*(o*.7+a*.25),r.head.y+o*.3+a*.15-a*a*.35,r.head.z,.04,(1-a)*so(t,.2,n))}break}case`confused`:{let e=[[`q`,`#ffd23f`],[`plus`,`#9be37a`],[`q`,`#ffd23f`],[`times`,`#ff8a8a`],[`pi`,`#8fc8ff`],[`divide`,`#d6a6ff`],[`root`,`#ffb86b`]];e.forEach(([a,s],c)=>{let l=c/e.length*Math.PI*2+t*1.1;i(a,s,r.head.x+Math.cos(l)*(o+.2),r.head.y+.05+Math.sin(t*3+c)*.05+c%2*.08,r.head.z+Math.sin(l)*(o+.2),a===`q`?.1:.08,so(t,.1+c*.08,n))});break}case`sigh`:{let e=(t-.85)/1.3;e>0&&e<1&&i(`puff`,`#ffffff`,r.mouth.x,r.mouth.y-e*.08,r.mouth.z+.08+e*.3,.06+e*.14,.8*(1-e));break}case`crylaugh`:for(let[e,a]of[[r.eyeL,1],[r.eyeR,-1]])for(let r=0;r<3;r++){let o=oo(t*2.2+r/3);i(`drop`,`#7fd0ff`,e.x+a*o*.3,e.y+o*.12-o*o*.3,e.z+.02,.035,(1-o)*so(t,.25,n))}break;case`doot`:for(let e of[.3,.9,1.45]){let n=(t-e)/.9;n<0||n>1||i(`note`,e===.9?`#ffd23f`:`#c48cff`,r.hand.x+Math.sin(n*8)*.04,r.hand.y+.05+n*.3,r.hand.z+.24+n*.25,.07+n*.03,1-ao(n,.7,1))}}}function lo(e,t,n){let r=new pt(.01,.01,.01),i=new me(new ve({transparent:!0,depthWrite:!1,map:Za()[0]})),a=new je;a.add(new ht(r,eo(`#ffffff`)),new ht(r,eo(`#ffffff`,{side:2})),i);let o=()=>{for(let t of e.info.programs??[])t.getUniforms();a.clear(),r.dispose(),to.push(i)};try{e.compileAsync(a,n,t).then(o,o)}catch{o()}}var uo=[`facepalm`,`shrug`,`salute`,`bow`,`dab`,`loser`],fo=class{anim;group=new je;props;sprites=[];used=0;T;dropped=null;dropFrom=new I;dropAt=new I;constructor(e,t,n){this.anim=e,this.T=r(e)?.time??2.5,this.props=io(e,t,n),this.group.name=`emoteFx`}static wanted(e){return!uo.includes(e)}update(e,t){this.used=0;let n=Za();co(this.anim,e,this.T,t,(e,t,r,i,a,o,s=1)=>{if(s<=.01)return;let c=this.sprites[this.used];c||(c=to.pop()??new me(new ve({transparent:!0,depthWrite:!1})),this.sprites.push(c),this.group.add(c)),this.used++;let l=c.material;l.map!==n[Ga[e]]&&(l.map=n[Ga[e]],l.needsUpdate=!0),l.color.set(t),l.opacity=s,c.position.set(r,i,a),c.scale.setScalar(o*2),c.visible=!0},this);for(let e=this.used;e<this.sprites.length;e++)this.sprites[e].visible=!1}dropMic(e,t){let n=1.35,r=this.props.r;if(!r)return;if(e<n){r.visible=!0,this.dropped&&(this.dropped.visible=!1);return}r.visible=!1,this.dropped||(this.dropped=r.clone(),this.group.add(this.dropped)),this.dropped.visible||(this.dropped.visible=!0,this.dropFrom.copy(t.hand),this.dropAt.set(t.hand.x,.02,t.hand.z));let i=e-n,a=4.9*i*i,o=this.dropFrom.y-.02,s=this.dropFrom.y-a,c=Math.min(1,i*4)*.6;if(s<=.02){let e=i-Math.sqrt(2*o/9.8);s=.02+Math.max(0,.06*Math.sin(Math.min(1,e/.22)*Math.PI)),c=.6+Math.min(1,e/.2)*(Math.PI/2-.6)}this.dropped.position.set(this.dropFrom.x,s+.015,this.dropFrom.z),this.dropped.rotation.set(c,0,.3)}dispose(){for(let e of this.sprites)e.removeFromParent(),to.length<no?to.push(e):e.material.dispose();this.sprites=[];let e=e=>e.traverse(e=>{let t=e;t.isMesh&&(t.geometry.dispose(),!t.userData.skin&&!$a.has(t.material)&&t.material.dispose())});this.props.r&&e(this.props.r),this.props.l&&e(this.props.l),this.props.r?.removeFromParent(),this.props.l?.removeFromParent(),this.group.removeFromParent()}},po=new S(1,10,7),mo=new S(1,6,4),ho=new g(1,1,1,10),go=new g(1,1,1,6),_o=new ze(1,1,8),vo=new pt(1,1,1),yo=new D(1,.28,5,12),bo=new D(1,.1,3,12),xo=new g(1,.8,1,10),So=new et(1,0);function Co(e,t,n){let r=n.scale??1,i=typeof r==`number`?r:Math.max(...r);e.add(i<.035?mo:po,t,n)}var wo={ale:{cup:`#a8743f`,band:`#5d5a5a`,top:`#d98c2b`,foam:`#fbf3df`},cider:{cup:`#cfe6e4`,band:`#b6d3d0`,top:`#f0c040`},milk:{cup:`#8fc1e8`,band:`#6fa6d1`,top:`#fbfaf5`},cocoa:{cup:`#e0605a`,band:`#c24b47`,top:`#6b3d26`}};function To(e,t){let n=wo[t]??wo.ale,r=[0,.02,.07];if(e.add(xo,n.cup,{pos:[r[0],r[1]+.07,r[2]],scale:[.068,.14,.068]}),e.add(ho,n.band,{pos:[r[0],r[1]+.02,r[2]],scale:[.06,.018,.06]}),e.add(ho,n.band,{pos:[r[0],r[1]+.12,r[2]],scale:[.07,.016,.07]}),e.add(bo,n.band,{pos:[r[0],r[1]+.141,r[2]],rot:[Math.PI/2,0,0],scale:.068}),e.add(ho,n.top,{pos:[r[0],r[1]+.138,r[2]],scale:[.062,.004,.062]}),e.add(yo,n.cup,{pos:[r[0],r[1]+.075,r[2]-.07],rot:[0,Math.PI/2,0],scale:.035}),n.foam){Co(e,n.foam,{pos:[r[0],r[1]+.15,r[2]],scale:[.068,.035,.068]}),Co(e,n.foam,{pos:[r[0]+.045,r[1]+.13,r[2]+.03],scale:[.025,.04,.025]});for(let[t,n,i]of[[-.03,.03,.018],[.02,-.035,.014],[-.01,-.01,.012]])Co(e,`#ffffff`,{pos:[r[0]+t,r[1]+.175,r[2]+n],scale:i});Co(e,n.foam,{pos:[r[0]-.05,r[1]+.105,r[2]-.02],scale:[.018,.045,.018]})}t===`cocoa`&&(e.add(vo,`#fffaf2`,{pos:[r[0]+.015,r[1]+.15,r[2]],rot:[.3,.5,.2],scale:.028}),e.add(vo,`#fffaf2`,{pos:[r[0]-.02,r[1]+.148,r[2]+.015],rot:[.1,.9,.4],scale:.025}))}function Eo(e,t){let n=[0,.03,.08];if(t===`loaf`){Co(e,`#c98a45`,{pos:n,scale:[.07,.06,.13]});for(let t of[-.06,0,.06])e.add(vo,`#f0cf8e`,{pos:[n[0],n[1]+.055,n[2]+t],rot:[0,.6,0],scale:[.07,.012,.016]})}else if(t===`pie`){e.add(ho,`#d9d4cc`,{pos:[n[0],n[1],n[2]],scale:[.13,.02,.13]}),e.add(ho,`#d9a050`,{pos:[n[0],n[1]+.025,n[2]],scale:[.115,.04,.115]});for(let t of[-.05,0,.05])e.add(vo,`#f0c878`,{pos:[n[0]+t,n[1]+.05,n[2]],scale:[.016,.01,.2]}),e.add(vo,`#f0c878`,{pos:[n[0],n[1]+.052,n[2]+t],scale:[.2,.01,.016]});Co(e,`#8a2a3a`,{pos:[n[0]+.025,n[1]+.048,n[2]+.025],scale:.018})}else Co(e,`#d18b46`,{pos:n,scale:[.08,.06,.08]}),Co(e,`#e9a85a`,{pos:[n[0],n[1]+.025,n[2]],scale:[.065,.04,.065]}),e.add(vo,`#fffaf2`,{pos:[n[0],n[1]+.062,n[2]],scale:[.09,.01,.018]}),e.add(vo,`#fffaf2`,{pos:[n[0],n[1]+.062,n[2]],scale:[.018,.01,.09]})}function Do(e){let t=[0,.08,.08];Co(e,`#7fa8c8`,{pos:t,scale:[.045,.07,.15]}),Co(e,`#dfe8ee`,{pos:[t[0],t[1]-.02,t[2]+.01],scale:[.038,.045,.12]});for(let n of[-1,1])e.add(_o,`#5f86a8`,{pos:[t[0],t[1]+n*.03,t[2]-.18],rot:[-Math.PI/2+n*.5,0,0],scale:[.045,.07,.012]});e.add(_o,`#5f86a8`,{pos:[t[0],t[1]+.07,t[2]-.01],scale:[.04,.05,.01]}),e.add(_o,`#5f86a8`,{pos:[t[0],t[1]+.055,t[2]-.07],rot:[-.5,0,0],scale:[.025,.035,.008]});for(let n of[-1,1]){e.add(_o,`#6f98b8`,{pos:[t[0]+n*.045,t[1]-.01,t[2]+.03],rot:[.6,0,n*1.3],scale:[.02,.05,.008]}),e.add(bo,`#6a90ae`,{pos:[t[0]+n*.04,t[1],t[2]+.07],rot:[0,Math.PI/2,0],scale:[.035,.035,.02]}),Co(e,`#f6f1e6`,{pos:[t[0]+n*.036,t[1]+.02,t[2]+.1],scale:[.009,.013,.013]}),Co(e,`#1d1a1c`,{pos:[t[0]+n*.042,t[1]+.02,t[2]+.102],scale:[.005,.008,.008]});for(let r=0;r<3;r++)e.add(bo,`#6f98b8`,{pos:[t[0]+n*.044,t[1]+.01+r%2*.02,t[2]-.02-r*.018],rot:[0,Math.PI/2,0],scale:[.012,.012,.01]})}Co(e,`#d86a5a`,{pos:[t[0],t[1]-.01,t[2]+.148],scale:[.02,.012,.008]})}function Oo(e,t){let n=[0,0,.06];e.add(go,`#4f9a4a`,{pos:[n[0],n[1]+.13,n[2]],scale:[.008,.26,.008]});for(let[t,r,i]of[[1,.12,-.6],[-1,.07,.5]])Co(e,`#5fae55`,{pos:[n[0]+t*.03,n[1]+r,n[2]],rot:[0,0,i],scale:[.014,.04,.022]}),e.add(vo,`#4f9a4a`,{pos:[n[0]+t*.03,n[1]+r,n[2]+.02],rot:[0,0,i],scale:[.003,.06,.002]});let r=[n[0],n[1]+.27,n[2]];for(let n=0;n<8;n++){let i=n/8*Math.PI*2;Co(e,t,{pos:[r[0]+Math.cos(i)*.04,r[1]+Math.sin(i)*.04,r[2]],rot:[0,0,i],scale:[.03,.018,.012]})}for(let n=0;n<6;n++){let i=n/6*Math.PI*2+.4;Co(e,t,{pos:[r[0]+Math.cos(i)*.022,r[1]+Math.sin(i)*.022,r[2]+.008],rot:[0,0,i],scale:[.02,.014,.01]})}Co(e,`#f6d04d`,{pos:[r[0],r[1],r[2]+.012],scale:.018});for(let t=0;t<5;t++){let n=t/5*Math.PI*2;Co(e,`#c9a020`,{pos:[r[0]+Math.cos(n)*.01,r[1]+Math.sin(n)*.01,r[2]+.028],scale:.004})}}function ko(e){let t=1.4,n=.9,r=new I(-Math.sin(.32)*Math.cos(n),Math.cos(n),Math.sin(n)).normalize(),i=new l().setFromUnitVectors(new I(0,1,0),r),a=new v().setFromQuaternion(i),o=r.clone().multiplyScalar(t/2);e.add(go,`#8a5a36`,{pos:[o.x,o.y,o.z],rot:[a.x,a.y,a.z],scale:[.012,t,.012]});let s=r.clone().multiplyScalar(.02);e.add(go,`#4d3528`,{pos:[s.x,s.y+.01,s.z+.01],rot:[a.x,a.y,a.z],scale:[.02,.18,.02]}),e.add(yo,`#9aa0a8`,{pos:[.025,.12,.08],rot:[0,Math.PI/2,0],scale:.025});let c=r.clone().multiplyScalar(t);e.add(go,`#f4efe6`,{pos:[c.x,c.y-.35,c.z],scale:[.003,.7,.003]}),Co(e,`#e0605a`,{pos:[c.x,c.y-.71,c.z],scale:[.03,.025,.03]}),Co(e,`#fbfaf5`,{pos:[c.x,c.y-.685,c.z],scale:[.026,.018,.026]})}function Ao(e){let t=[0,.02,.1];e.add(ho,`#6fa88a`,{pos:[t[0],t[1]+.07,t[2]],scale:[.075,.14,.075]}),e.add(bo,`#5a8f73`,{pos:[t[0],t[1]+.142,t[2]],rot:[Math.PI/2,0,0],scale:.078}),e.add(bo,`#5a8f73`,{pos:[t[0],t[1]+.005,t[2]],rot:[Math.PI/2,0,0],scale:.078}),e.add(ho,`#5a8f73`,{pos:[t[0],t[1]+.142,t[2]],scale:[.07,.008,.07]}),e.add(ho,`#4a4a52`,{pos:[t[0],t[1]+.146,t[2]-.02],scale:[.035,.006,.035]}),e.add(go,`#6fa88a`,{pos:[t[0],t[1]+.1,t[2]+.12],rot:[.9,0,0],scale:[.016,.16,.016]}),e.add(_o,`#5a8f73`,{pos:[t[0],t[1]+.155,t[2]+.18],rot:[-2.25,0,0],scale:[.03,.04,.03]}),e.add(ho,`#4a7a62`,{pos:[t[0],t[1]+.17,t[2]+.192],rot:[-2.25,0,0],scale:[.03,.006,.03]});for(let n=0;n<7;n++){let r=n/7*Math.PI*2,i=n===0?0:.018;Co(e,`#2a2a30`,{pos:[t[0]+Math.cos(r)*i,t[1]+.172+Math.sin(r)*i*.62,t[2]+.196+Math.sin(r)*i*.78],scale:.004})}e.add(yo,`#5a8f73`,{pos:[t[0],t[1]+.16,t[2]-.02],rot:[0,Math.PI/2,0],scale:[.06,.06,.06]}),e.add(go,`#8a5a36`,{pos:[t[0],t[1]+.22,t[2]-.02],rot:[0,0,Math.PI/2],scale:[.012,.05,.012]})}function jo(e,t){let n=[0,.02,.12];e.add(xo,`#c9a46a`,{pos:[n[0],n[1]+.06,n[2]],scale:[.14,.12,.11]});for(let t=0;t<14;t++){let r=t/14*Math.PI*2;e.add(vo,t%2?`#b8924f`:`#d6b47a`,{pos:[n[0]+Math.cos(r)*.14,n[1]+.06,n[2]+Math.sin(r)*.11],rot:[0,-r,0],scale:[.012,.11,.025]})}for(let t of[.035,.085])e.add(bo,`#a8834f`,{pos:[n[0],n[1]+t,n[2]],rot:[Math.PI/2,0,0],scale:[.143,.112,.08]});e.add(yo,`#a8834f`,{pos:[n[0],n[1]+.12,n[2]],rot:[Math.PI/2,0,0],scale:[.14,.11,.05]}),Co(e,t,{pos:[n[0]-.05,n[1]+.14,n[2]],scale:[.07,.04,.06]}),Co(e,`#f4efe6`,{pos:[n[0]+.05,n[1]+.145,n[2]+.02],scale:[.06,.035,.055]}),Co(e,`#8fc1e8`,{pos:[n[0]+.01,n[1]+.155,n[2]-.04],scale:[.05,.03,.04]})}function Mo(e){let t=new je,n=.19,r=.28,i=.035,a=`#3b2a36`,o=`#c9a24f`,s=`#2a1d12`,c=e=>{let t=new nt,o=e*n/2;t.add(vo,a,{pos:[o,-.006,r/2],scale:[.202,.012,.29600000000000004]}),t.add(vo,`#efe3c6`,{pos:[o,i/2,r/2],scale:[.184,i,.27]}),t.add(yo,s,{pos:[o,.037000000000000005,r/2],rot:[Math.PI/2,0,0],scale:[.055,.055,.004]});for(let n=0;n<4;n++){let i=n/4*Math.PI*2+(e>0?.4:1.1);t.add(go,s,{pos:[o+Math.cos(i)*.055,.038000000000000006,r/2+Math.sin(i)*.055],scale:[.009,.003,.009]})}for(let e of[.05,.08,.2,.23])t.add(vo,s,{pos:[o,.037000000000000005,e],scale:[n*.6,.002,.004]});return t.mesh(at(),{cast:!0,receive:!1})},l=c(1),u=new je;u.add(c(-1)),u.position.y=i;let d=new nt;d.add(vo,o,{pos:[-.19/2,-.015,r/2],scale:[n*.72,.004,r*.78]}),d.add(vo,a,{pos:[-.19/2,-.018,r/2],scale:[n*.62,.004,r*.68]}),d.add(po,o,{pos:[-.19/2,-.02,r/2],scale:[.03,.004,.022]}),d.add(vo,o,{pos:[-.18,0,r/2],scale:[.03,.05500000000000001,.05]}),u.add(d.mesh(at(),{cast:!0,receive:!1}));let f=new nt;f.add(vo,a,{pos:[0,i/2,r/2],scale:[.03,.05500000000000001,.29600000000000004]}),t.add(l,u,f.mesh(at(),{cast:!0,receive:!1})),t.position.set(0,.02,.04),t.scale.setScalar(1.35);let p=e=>{let t=Math.max(0,Math.min(1,e));u.rotation.z=Math.PI*(1-t)};return p(+!!e),t.userData.setOpen=p,t.name=`item:grimoire`,t}function No(e){let t=[0,-.25,.02];e.add(xo,`#8a6a4a`,{pos:[t[0],t[1]+.07,t[2]],scale:[.09,.14,.09]}),e.add(ho,`#5a4030`,{pos:[t[0],t[1]+.13,t[2]],scale:[.095,.015,.095]}),e.add(ho,`#5a4030`,{pos:[t[0],t[1]+.03,t[2]],scale:[.08,.015,.08]}),e.add(ho,`#6fb0e0`,{pos:[t[0],t[1]+.125,t[2]],scale:[.078,.006,.078]}),e.add(yo,`#9aa0a8`,{pos:[t[0],t[1]+.16,t[2]],rot:[0,0,0],scale:[.08,.08,.03]})}function Po(e){let t=[0,.02,.08];e.add(ho,`#c9a24f`,{pos:[t[0],t[1]+.01,t[2]],scale:[.05,.02,.05]}),e.add(bo,`#e0bf6a`,{pos:[t[0],t[1]+.02,t[2]],rot:[Math.PI/2,0,0],scale:.045}),e.add(go,`#c9a24f`,{pos:[t[0],t[1]+.06,t[2]],scale:[.012,.08,.012]}),Co(e,`#c9a24f`,{pos:[t[0],t[1]+.06,t[2]],scale:.02}),e.add(xo,`#c9a24f`,{pos:[t[0],t[1]+.14,t[2]],scale:[.055,.09,.055]}),e.add(bo,`#e0bf6a`,{pos:[t[0],t[1]+.185,t[2]],rot:[Math.PI/2,0,0],scale:.055});for(let n=0;n<4;n++){let r=n/4*Math.PI*2;e.add(So,`#a8463f`,{pos:[t[0]+Math.cos(r)*.052,t[1]+.13,t[2]+Math.sin(r)*.052],scale:.008})}e.add(ho,`#7a1f2e`,{pos:[t[0],t[1]+.175,t[2]],scale:[.048,.006,.048]})}function Fo(e){let t=[0,.03,.1];for(let[n,r]of[[-.03,0],[.03,0],[0,.05]])e.add(go,`#9a6a43`,{pos:[t[0]+n,t[1]+r,t[2]],rot:[Math.PI/2,0,0],scale:[.028,.22,.028]});e.add(yo,`#d8c8a0`,{pos:[t[0],t[1]+.02,t[2]],rot:[Math.PI/2,0,0],scale:[.06,.06,.02]})}function Io(e){if(e.k===`grimoire`)return Mo(e.c===`open`);let t=new nt;switch(e.k){case`ale`:case`cider`:case`milk`:case`cocoa`:To(t,e.k);break;case`loaf`:case`pie`:case`bun`:Eo(t,e.k);break;case`fish`:Do(t);break;case`flower`:Oo(t,e.c??`#f39ab5`);break;case`rod`:ko(t);break;case`can`:Ao(t);break;case`washing`:jo(t,e.c??`#e0605a`);break;case`water`:No(t);break;case`wine`:Po(t);break;case`firewood`:Fo(t)}let n=t.mesh(at(),{cast:!0,receive:!1});return n.name=`item:${e.k}`,n}function Lo(e){e.traverse(e=>{if(e.userData.onDispose?.(),e.userData.shared)return;let t=e;t.geometry&&t.geometry.dispose();let n=t.material;Array.isArray(n)?n.forEach(e=>e.dispose()):n?.dispose()})}var Ro=(e,t)=>{let n=t*(e.length-1),r=Math.min(e.length-2,Math.floor(n));return e[r]+(e[r+1]-e[r])*(n-r)};function zo(e,t,n,r,i,a=9){let o=mn([0,0,.02],t,a,e/a,[n[0]/a,n[1]/a,n[2]/a]);return{pts:o,radii:o.map((e,t)=>r*Ro(i,t/a))}}var Bo=(e,t,n=.005)=>L(e.surface?e.surface(new I(...t),-n):new I(...t)),Vo=(e,t)=>{let n=z(t.coat,jt,.88),r=z(t.coat,`#2b211d`,.8);e.joints.neck=[0,.62,.05],e.joints.shoulder=[.1,.5,.14],e.joints.hip=[.1,.2,-.06],e.joints.tail=[0,.22,-.17],R(e,{belly:[[0,.33,-.095],[.185,.22,.17]],chest:[[0,.47,.045],[.14,.15,.14]],haunch:[[.11,.2,-.09],[.095,.12,.14]],ruff:[[0,.58,.045],[.13,.08,.12]],melt:.2}),W(e,{r:[.185,.155,.175],at:[0,.14,.06],cheeks:[[.13,-.06,0],[.085,.07,.09]]});let i=bn(e,{dy:-.28,len:.13,ra:.072,rb:.04,drop:.045,squash:[1,.85,1],thin:!0});_n(e,{x:.58,y:.7,w:.085,h:.22,d:.045,splay:.18,rake:.08,cup:.5,notch:!0}),H(e,{len:.3,r0:.052,r1:.044,paw:[.048,.036,.058],fwd:.36,out:.16}),V(e,{r0:.062,r1:.047,foot:[.05,.036,.08]});let a=Lt(e,zo(.62,[0,-.3,-1],[.7,-.75,0],.125,[.3,.7,.95,1,.95,.8,.5]));U(e),B(e,{x:.4,y:.12,size:.9,wide:1.5,slant:.32,color:`#1a1412`}),Vt(e,Nt,Bo(e,i.nose),.026,.019),bt(e,t.coat,{len:.1,back:.03});let o=[`earL`,`earR`].map(t=>Yt(e,t)),s=Y(e,`head`,`cheekL`,`cheekR`),c=Mt(e,`head`);return e.marks={base:t.coat,marks:[{color:n,f:dn(...o.map(e=>e.inner))},{color:r,f:dn(...o.map(e=>e.back))},{color:n,f:G(Y(e,`muzzle`),e=>e.p.y-(i.mid(e.p)+i.r*.15))},{color:n,f:G(s,e=>{let t=c(e),n=Math.abs(t.x);return Math.max(-.2-t.z,t.y-(-.1-.12*n+.3*n*n))})},{color:n,f:G(Y(e,`cheekL`,`cheekR`),e=>c(e).y-.05)},{color:n,f:G(Y(e,`chest`,`ruff`,`belly`),e=>-e.p.z,e=>Pt(e.p.x,e.p.y,0,.36,0,.62).d-.075)},{color:r,f:dn(It(e,`L`,.5),It(e,`R`,.5))},{color:r,f:G(Y(e,/^leg/),e=>e.p.y-.14)},{color:n,f:G(Y(e,/^tail\d/),e=>.8-a(e.p))}]},{}},Ho=`#2c2a27`,Uo=`#e6dac0`,Wo=(e,t)=>{let n=z(t.coat,Ho,.8),r=z(t.coat,Uo,.85),i=z(t.coat,`#2f2d28`,.5);e.joints.neck=[0,.585,.045],e.joints.shoulder=[.12,.47,.115],e.joints.hip=[.11,.17,-.03],e.joints.tail=[0,.19,-.17],R(e,{belly:[[0,.255,-.05],[.235,.25,.195]],chest:[[0,.45,.03],[.165,.15,.15]],haunch:[[.13,.15,-.05],[.11,.12,.15]],ruff:[[0,.56,.035],[.15,.08,.13]]}),W(e,{r:[.225,.178,.19],at:[0,.15,.065],cheeks:[[.15,-.07,.03],[.105,.09,.1]]});let a=bn(e,{dy:-.36,len:.07,ra:.085,rb:.06,drop:.02,squash:[1.05,.8,1]});_n(e,{x:.66,y:.64,w:.09,h:.15,d:.045,splay:.3,rake:.1,cup:.5,notch:!0}),H(e,{len:.24,r0:.062,r1:.052,paw:[.056,.042,.064],fwd:.85}),V(e,{r0:.07,r1:.058,foot:[.075,.048,.11],fwd:.075});let o=Lt(e,zo(.44,[0,-.3,-1],[.5,-.9,0],.12,[.55,.9,1,1,.9,.6]));U(e),B(e,{x:.38,y:.06,size:.85,wide:1.3,slant:.18,color:`#121010`,out:.006,blush:!1}),Vt(e,`#2a2624`,Bo(e,a.nose),.03,.022,!0),bt(e,t.coat,{len:.11});let s=[`earL`,`earR`].map(t=>Yt(e,t)),c=Y(e,`head`,`cheekL`,`cheekR`),l=Mt(e,`head`),u=(e,t,n,r,i,a)=>o=>{let s=l(o),c=Pt(Math.abs(s.x),s.y,e,t,n,r);return s.z<-.1?1:c.d-(i+(a-i)*c.t)};return e.marks={base:t.coat,marks:[{color:n,f:dn(...s.map(e=>e.inner))},{color:r,f:dn(...s.map(e=>e.front))},{color:r,f:Y(e,`muzzle`)},{color:n,f:G(c,e=>.075-Math.abs(l(e).x),u(.08,.13,.86,-.22,.2,.13))},{color:r,f:G(c,e=>.07-Math.abs(l(e).x),u(.1,.36,.7,.26,.075,.06))},{color:r,f:dn(Y(e,`cheekL`,`cheekR`),G(c,e=>l(e).y+.5,e=>-.1-l(e).z))},{color:i,f:dn(It(e,`L`,.45),It(e,`R`,.45))},{color:i,f:G(Y(e,/^leg/),e=>e.p.y-.11)},{color:n,f:G(Y(e,/^tail\d/),e=>{let t=o(e.p);return t>.875?-1:Math.sin(Math.PI*8*t)})},{color:z(t.coat,r,.14),f:G(Y(e,`belly`,`chest`),e=>-e.p.z,e=>Math.hypot(e.p.x/.12,(e.p.y-.27)/.14)-1)}]},{}},Go=(e,t,n)=>{let r=z(`#cdbf98`,n,.12),i=z(r,jt,.45),a=t.coat,o=z(t.coat,At,.34),s=z(t.coat,At,.65);e.joints.neck=[0,.27,.36],e.joints.shoulder=[.085,.18,.37],e.joints.tail=[0,.05,-.3],kt(e,`rear`,`body`,[0,.06,-.22]);let c=Kt(e);c.add(tn(`body`,[0,.07,-.1],[0,.07,.15],.14,.135,{squash:[1,.5,1],name:`foot`})),c.add(tn(`rear`,[0,.065,-.38],[0,.07,-.1],.06,.14,{squash:[1,.5,1],k:.06,anchor:[0,.07,-.14],reach:.2,name:`tailFoot`})),c.add(tn(`body`,[0,.1,.2],[0,.25,.355],.1,.085,{k:.08,anchor:[0,.1,.18],reach:.18,name:`neck`}));let l=Gt(`body`,[0,.36,-.1],{R0:.2,b:.14,a0:.15,turns:1.85,c:.45,sx:1.2,k:.06,anchor:[0,.16,-.02],reach:.3,name:`shell`});c.add(l,K(`body`,[0,.36,-.1],[.08,.072,.072],{k:.03,name:`shellCore`})),e.seat=0,W(e,{r:[.112,.106,.108],at:[0,.07,.03],melt:.06}),U(e),q(e,{w:.24,y:-.4,curve:.13,r:.0055});let u=Bt(e,0,-.18,.004);un(e.head,e.rnd,{base:`ico1`,r:[.022,.016,.016],pos:L(u),jitter:.02,color:z(r,At,.15)}),e.nose=[u.x,u.y,u.z+.012];let d=new I(0,.17,.03);for(let t of[-1,1]){let n=t>0?`L`:`R`,i=Bt(e,t*.32,.72,-.015);kt(e,`stalk${n}`,`neck`,L(i));let a=d.clone().add(new I(t*.025,0,0));kt(e,`blink${n}`,`stalk${n}`,L(a));let o=Ht(e,`stalk${n}`,`stalk${n}`);vn(o,e.rnd,[0,0,0],L(a),.02,.015,r,{base:`limb5`}),un(o,e.rnd,{base:`ico1`,r:.032,pos:L(a),jitter:.04,color:r});let s=Ht(e,`eye${n}`,`stalk${n}`,{bone:`blink${n}`,eyes:!0}),c=Et(a.clone().add(new I(0,.004,.024)));un(s,e.rnd,{base:`ico1`,r:[.02,.022,.013],matrix:c,jitter:.02,color:Nt,tone:.1}),un(s,e.rnd,{base:`ico0`,r:.0065,matrix:zt(c,[.006,.008,.011]),jitter:.01,color:`#fbf6ec`,tone:0})}e.blink=[`blinkL`,`blinkR`];let f=Bt(e,.32,.72).add(d);e.eyeY=f.y,e.eyeX=f.x+.025,e.eyeR=.032,e.eyeZ=f.z+.035,Dt(e,{color:r,len:.12,r:.03,rightOnly:!0}),e.front=.47;let p=l.unit,m=Y(e,`shell`);return e.marks={base:r,marks:[{color:s,f:G(m,e=>.72-p(e.p).z,e=>.3-Math.abs(p(e.p).x))},{color:o,f:Y(e,`shellCore`)},{color:o,f:G(m,e=>Math.sin(Math.PI*13*p(e.p).y))},{color:a,f:m},{color:i,f:G(Y(e,`foot`,`tailFoot`,`neck`),e=>e.p.y-.02)}]},{legs:`none`,tendril:!0}},Ko=(e,t,n)=>{let r=Mt(e,t),i=Math.PI/180,a=n.map(([e,t,n])=>[Math.sin(e*i)*Math.sin(t*i),Math.cos(e*i),Math.sin(e*i)*Math.cos(t*i),n]);return G(Y(e,t),e=>{let t=r(e).normalize(),n=1/0;for(let[e,r,i,o]of a)n=Math.min(n,Math.hypot(t.x-e,t.y-r,t.z-i)-o);return n})},qo=(e,t,n,r,i,a)=>G(Y(e,...t),e=>-e.p.z,e=>Math.hypot((e.p.x-n)/i,(e.p.y-r)/a)-1),Jo=(e,t,n,r,i={})=>{let a=new I(...e.joints.neck),o=a.clone().add(new I(...e.shape.hc));t.forEach(([t,s,c],l)=>{for(let u of t?[-1,1]:[1]){let d=Bt(e,u*t,s).add(a),f=i.along&&new I(u*i.along[0],i.along[1],i.along[2]);pn(e,{bone:`neck`,from:o,dir:d.sub(o),r:c,color:n,stretch:i.stretch,along:f,sides:i.sides,name:`${r}${l}${u>0?`L`:`R`}`})}})},Yo=(e,t,n,r,i,a,o={})=>{r.forEach(([r,s,c],l)=>{for(let u of r?[-1,1]:[1]){let d=new I(u*Math.sin(r)*Math.cos(s),Math.sin(s),-Math.cos(r)*Math.cos(s)),f=o.along&&new I(u*o.along[0],o.along[1],o.along[2]);pn(e,{bone:t,from:new I(...n),dir:d,r:c,color:i,stretch:o.stretch,along:f,sides:o.sides,name:`${a}${l}${u>0?`L`:`R`}`})}})},Xo=(e,t,n,r,i,a=`#fbf8f1`,o=`fang`)=>{let s=new I(...e.joints.neck);for(let c of[-1,1]){let l=Bt(e,c*t,n),u=Rt(e,c*t,n),d=new I(0,-1,0).addScaledVector(u,.45).normalize();l.add(s);let f=[l.clone().addScaledVector(u,-.01),l.clone().addScaledVector(d,r*.45),l.clone().addScaledVector(d,r)];J(e,{bone:`neck`,pts:f,w:[i,i*.8,0],t:[i*.7,i*.55,0],across:new I(1,0,0),colors:[a,a],name:`${o}${c>0?`L`:`R`}`})}},Zo=(e,t,n,r,i,a,o,s,c,l=7)=>ss(i).forEach((i,u)=>{a(i)&&pn(e,{bone:t,from:new I(...n),dir:new I(i.x*r[0],i.y*r[1],i.z*r[2]),r:o*(.8+u*7%5*.1),color:s,sides:l,name:`${c}${u}`})}),Qo=(e,t)=>{let n=new I(...e.joints.neck),r=new I(0,-Math.sin(t.drop),Math.cos(t.drop)),i=Bt(e,0,t.dy,-.01).add(n).addScaledVector(r,t.len*t.at);for(let n of[-1,1])pn(e,{bone:`neck`,from:i.clone().add(new I(n*t.gap,0,0)),dir:new I(0,1,0),r:t.r,stretch:1.6,along:r,color:t.color,sides:7,name:`nostril${n>0?`L`:`R`}`})},$o=(e,t)=>{let n=z(t.coat,`#f2efe8`,.85),r=z(t.coat,At,.4);e.joints.neck=[0,.5,.05],e.joints.shoulder=[.19,.4,.08],e.joints.hip=[.1,.15,-.02],e.joints.tail=[0,.22,-.18],R(e,{belly:[[0,.28,-.02],[.23,.26,.21]],chest:[[0,.44,.03],[.2,.16,.19]],melt:.2}),W(e,{r:[.24,.21,.25],at:[0,.15,.05],melt:.18});let i=bn(e,{dy:-.02,len:.08,ra:.15,rb:.1,drop:.01,squash:[1.1,.72,1],melt:.08});Qt(e,`body`,[0,.47,-.14],{len:.21,w:.04,d:.1,rot:[-.95,0,0],name:`dorsal`,melt:.05}),nn(e,{len:.3,w:.09,d:.04,taper:.7,fwd:.3,out:.58}),V(e,{r0:.06,r1:.05,foot:[.06,.035,.08]});let a=zo(.3,[0,-.05,-1],[.35,0,0],.1,[1,.8,.55,.4]),o=Lt(e,a),s=a.pts[a.pts.length-1],c=[e.joints.tail[0]+s[0],e.joints.tail[1]+s[1],e.joints.tail[2]+s[2]];Qt(e,`tail2`,c,{len:.2,w:.04,d:.065,rot:[-.75,0,0],name:`tailFinUp`}),Qt(e,`tail2`,c,{len:.12,w:.04,d:.055,rot:[-2.3,0,0],name:`tailFinDown`}),U(e),B(e,{x:.45,y:.15,size:.9,wide:1.1,slant:.1,color:`#141018`}),q(e,{w:.4,y:-.42,curve:.12,r:.008,out:.004}),Xo(e,.08,-.41,.03,.012,`#fbf8f1`,`tooth`),Xo(e,.2,-.385,.025,.0105,`#fbf8f1`,`toothB`);for(let n of[-1,1])[-.03,.035,.1].forEach((r,i)=>{pn(e,{bone:`body`,from:new I(0,.49,r),dir:new I(n,-.1,0),r:.011,stretch:3.6,along:new I(0,1,.3),color:z(t.coat,At,.7),sides:8,name:`gill${n>0?`L`:`R`}${i}`})});e.nose=i.nose;let l=Mt(e,`head`);return e.marks={base:t.coat,marks:[{color:n,f:G(Y(e,`muzzle`),e=>e.p.y-(i.mid(e.p)-i.r*.15))},{color:n,f:G(Y(e,`head`),e=>l(e).y+.12-l(e).z*.38,e=>-l(e).z-.25)},{color:n,f:qo(e,[`belly`,`chest`],0,.3,.17,.27)},{color:r,f:Y(e,`dorsal`,`tailFinUp`,`tailFinDown`)},{color:n,f:G(Y(e,/^leg/),e=>e.p.y-.03)},{color:n,f:G(Y(e,/^tail\d/),e=>-.02-(e.p.y-.22)+ +(o(e.p)>2))}]},{aquatic:!0}},es=(e,t)=>{let n=z(t.coat,`#ffffff`,.5),r=z(t.coat,`#3a2a60`,.35);e.joints.neck=[0,.42,0],e.joints.shoulder=[.05,.32,.06],e.joints.hip=[.1,.36,0],e.joints.tail=[0,.4,-.1],R(e,{belly:[[0,.4,0],[.13,.07,.13]],chest:[[0,.43,0],[.1,.05,.1]]}),W(e,{r:[.33,.29,.33],at:[0,.14,0],melt:.06});let i=Kt(e),a=[0,e.joints.neck[1]+.14,0];for(let e=0;e<12;e++){let t=e/12*Math.PI*2;i.add(K(`neck`,[Math.cos(t)*.31,a[1]-.06,Math.sin(t)*.31],[.055,.04,.055],{k:.03,name:`rim`}))}H(e,{len:.22,r0:.05,r1:.035,paw:[.04,.035,.04],fwd:.25,out:.08}),Ct(e,{count:3,len:.4,r0:.05,r1:.04,root:[0,.38,0],rim:.23,spread:2.6,hang:.85,curl:.12,wave:.03,melt:.03}),U(e),e.front=.28,e.sipLow=!0,B(e,{x:.3,y:-.12,size:1.1,wide:1,slant:0,color:`#1c1428`}),q(e,{w:.14,y:-.32,curve:.08,r:.006,color:r});let o=e.shape.hr,s=Math.PI/180;return[[18,150,.06],[45,45,.048],[45,-45,.048],[52,115,.054],[52,-115,.054],[58,180,.058],[82,80,.042],[82,-80,.042],[86,145,.045],[86,-145,.045]].forEach(([n,r,i],c)=>{let l=new I(Math.sin(n*s)*Math.sin(r*s)*o[0],Math.cos(n*s)*o[1],Math.sin(n*s)*Math.cos(r*s)*o[2]);pn(e,{bone:`neck`,from:new I(0,a[1],0),dir:l,r:i,color:z(t.coat,`#ffffff`,.55),sides:12,name:`dome${c}`})}),e.marks={base:t.coat,marks:[{color:n,f:Y(e,`rim`)},{color:n,f:Y(e,/^arm/,/^fore/)},{color:z(t.coat,n,.5),f:G(Y(e,/^leg/),e=>e.p.y-.12)}]},{aquatic:!0,legs:`tentacles`,hover:.3,jelly:!0}},ts=(e,t)=>{e.joints.neck=[0,.3,0],e.joints.shoulder=[.13,.26,.12],e.joints.hip=[.1,.18,-.02],e.joints.tail=[0,.25,-.18],R(e,{belly:[[0,.22,0],[.22,.14,.2]],chest:[[0,.3,.02],[.2,.1,.18]]}),W(e,{r:[.29,.31,.27],at:[0,.22,-.03],melt:.12});let n={len:.24,r0:.055,r1:.032,paw:[.035,.03,.04],fwd:.45,out:.35},r={count:3,len:.46,r0:.064,r1:.034,root:[.12,.15,-.02],spread:2.4,hang:.4,coil:2.7};return H(e,n),Ct(e,r),Kt(e).add(K(`body`,[0,.12,-.02],[.25,.045,.23],{k:.06,name:`skirt`})),U(e),St(e,r,n,z(t.coat,`#fff3ec`,.55)),B(e,{x:.34,y:-.12,size:1.35,wide:1.05,slant:.05,color:`#1c1420`}),q(e,{w:.16,y:-.42,curve:.08,r:.006}),Yo(e,`neck`,os(e.joints.neck,[0,.22,-.03]),[[0,1.15,.05],[.55,.6,.045],[0,.3,.05],[1.05,.2,.04],[1.25,.8,.042],[.5,-.1,.038],[1.85,.55,.036],[.15,-.45,.034]],z(t.coat,`#fff3ec`,.4),`freckle`),e.marks={base:t.coat,marks:[]},{aquatic:!0,legs:`tentacles`}},ns=(e,t)=>{let n=`#f2efe6`,r=z(t.coat,`#121419`,.22);e.joints.neck=[0,.6,.03],e.joints.shoulder=[.185,.5,0],e.joints.hip=[.085,.12,.03],e.joints.tail=[0,.14,-.15],R(e,{belly:[[0,.31,.02],[.225,.3,.2]],chest:[[0,.5,.02],[.185,.16,.165]],melt:.18}),W(e,{r:[.2,.19,.19],at:[0,.13,.02],melt:.14});let i=Wt(e,{dy:-.08,len:.1,w:.03,h:.028,drop:.25});nn(e,{len:.32,w:.08,d:.027,taper:.75,fwd:-.06,out:.26}),V(e,{r0:.05,r1:.04,foot:[.068,.024,.09],fwd:.07}),Kt(e).add(K(`tail`,os(e.joints.tail,[0,-.05,-.03]),[.05,.024,.052],{rot:[-.95,0,0],k:.05,anchor:e.joints.tail,reach:.12,name:`tailFan`})),U(e),B(e,{x:.38,y:.14,size:.9,wide:1,slant:0,color:`#141018`,ring:n,ringSize:1.55}),e.nose=i;let a=Mt(e,`head`),o=e.joints.neck,s=[1.05,1.3,1.32,1.2,1,.9];return e.marks={base:t.coat,marks:[{color:`#e8892e`,f:Y(e,`beak`,/^leg/)},{color:r,f:Y(e,`armL`,`armLPaw`,`armR`,`armRPaw`)},{color:`#f2c14e`,f:e=>{if(Math.abs(e.p.x)<.1)return 1;let t=Pt(e.p.z,e.p.y,o[2]+.01,o[1]+.1,o[2]+.09,o[1]-.02);return t.d-(.045-.025*t.t)}},{color:n,f:G(Y(e,`head`,`belly`,`chest`),e=>Math.atan2(Math.abs(e.p.x),e.p.z+.02)-Ro(s,F.clamp(e.p.y/.66,0,1)),e=>{let t=a(e);return t.y+.1+.42*Math.abs(t.x)})}]},{aquatic:!0}},rs=(e,t)=>{let n=`#e8892e`,r=z(t.coat,`#ffffff`,.35);e.joints.neck=[0,.56,.05],e.joints.shoulder=[.19,.45,-.02],e.joints.hip=[.08,.12,.02],e.joints.tail=[0,.22,-.2],R(e,{belly:[[0,.3,-.02],[.24,.28,.22]],chest:[[0,.46,.05],[.19,.14,.17]],melt:.18}),W(e,{r:[.2,.19,.19],at:[0,.16,.03],melt:.14});let i=Wt(e,{dy:-.12,len:.13,w:.075,h:.028,drop:.12,flat:!0}),a={dy:-.12,len:.13,drop:.12};Qt(e,`neck`,L(Bt(e,0,.92,-.02).add(new I(...e.joints.neck))),{len:.08,w:.025,d:.015,rot:[-.5,0,0],name:`tuft`,melt:.02}),nn(e,{len:.4,w:.14,d:.04,fwd:-.05,out:.18}),V(e,{r0:.045,r1:.04,foot:[.065,.025,.09],fwd:.06}),Qt(e,`tail`,e.joints.tail,{len:.13,w:.08,d:.024,rot:[-.65,0,0],name:`tailFan`}),U(e),B(e,{x:.38,y:.18,size:.9,wide:1,slant:0,color:`#141018`}),Qo(e,{...a,at:.42,gap:.022,r:.0095,color:z(n,`#5a2a10`,.55)});let o=z(t.coat,At,.32);for(let t of[`L`,`R`]){let n=Kt(e).named(`arm${t}Paw`).c;[-.5,0,.5].forEach((r,i)=>{let a=new I((t===`L`?1:-1)*(.25+r*.3),-.55+r*.35,-1).normalize(),s=yn(e,n,a);if(!s)return;let c=.085-Math.abs(r)*.03;J(e,{bone:`fore${t}`,pts:[s.p.clone().addScaledVector(a,-.02),s.p.clone().addScaledVector(a,c*.5),s.p.clone().addScaledVector(a,c)],w:[.024,.02,0],t:[.006,.005,0],across:new I(1,0,0).cross(a).normalize(),colors:[o,o],name:`quill${t}${i}`})})}return e.nose=i,e.marks={base:t.coat,marks:[{color:n,f:Y(e,`beak`,/^leg/)},{color:z(t.coat,At,.12),f:Y(e,`armL`,`armLPaw`,`armR`,`armRPaw`)},{color:r,f:qo(e,[`belly`,`chest`],0,.3,.17,.22)}]},{aquatic:!0}},is=(e,t)=>{let n=z(t.coat,`#c98593`,.42),r=z(t.coat,`#c8a890`,.45),i=z(t.coat,wt,.6);e.joints.neck=[0,.5,.02],e.joints.shoulder=[.12,.45,0],e.joints.hip=[.07,.2,-.01],e.joints.tail=[0,.2,-.12],R(e,{belly:[[0,.33,0],[.17,.2,.15]],chest:[[0,.44,.02],[.15,.1,.14]]}),W(e,{r:[.22,.2,.2],at:[0,.15,.03],cheeks:[[.1,-.08,.03],[.08,.07,.08]]});let a=bn(e,{dy:-.3,len:.04,ra:.075,rb:.06,drop:0,squash:[1.1,.85,1]});_n(e,{x:.5,y:.62,w:.095,h:.22,d:.035,splay:.42,rake:.05,cup:.5,notch:!0}),Ut(e,{len:.46,span:.3,d:.022,fingers:[.4,.66,.9],elbow:.34}),V(e,{r0:.032,r1:.026,foot:[.035,.02,.05]}),U(e),B(e,{x:.36,y:.08,size:1.1,wide:1,slant:.05,color:`#140c10`}),Vt(e,`#3a2a30`,Bo(e,a.nose,.004),.02,.016),q(e,{w:.18,y:-.55,curve:.08,r:.006}),Xo(e,.075,-.535,.03,.0085);let o=[`earL`,`earR`].map(t=>Yt(e,t));return e.marks={base:t.coat,marks:[{color:i,f:dn(...o.map(e=>e.inner))},{color:n,f:Y(e,`armLWeb`,`armRWeb`,`armLHand`,`armRHand`)},{color:r,f:Y(e,`muzzle`)},{color:r,f:qo(e,[`belly`,`chest`],0,.36,.11,.15)}]},{hover:.22,flaps:!0}},as=(e,t)=>{let n=z(t.coat,`#fff6c8`,.6),r=z(t.coat,At,.36);e.joints.neck=[0,.34,.08],e.joints.shoulder=[.15,.3,.12],e.joints.hip=[.14,.14,-.06],e.joints.tail=[0,.15,-.2],R(e,{belly:[[0,.2,-.04],[.24,.19,.22]],chest:[[0,.3,.04],[.2,.12,.18]],haunch:[[.15,.14,-.08],[.1,.1,.15]]}),W(e,{r:[.27,.16,.22],at:[0,.1,.05],melt:.12});let i=Kt(e),a=new I(...e.joints.neck).add(new I(0,.1,.05));for(let e of[-1,1])i.add(K(`neck`,[e*.14,a.y+.12,a.z+.05],[.075,.07,.07],{k:.05,name:e>0?`moundL`:`moundR`}));return kt(e,`throat`,`neck`,[0,-.02,.15]),i.add(K(`throat`,[0,e.joints.neck[1]-.02,e.joints.neck[2]+.15],[.13,.06,.08],{k:.04,anchor:[0,e.joints.neck[1]-.02,e.joints.neck[2]+.15],reach:.12,name:`throat`})),H(e,{len:.2,r0:.045,r1:.035,paw:[.045,.02,.05],fwd:.5,out:.25}),V(e,{r0:.055,r1:.045,foot:[.07,.024,.11],fwd:.06}),U(e),B(e,{x:.52,y:.62,size:1.05,wide:1.05,slant:0,color:`#141018`}),q(e,{w:.6,y:-.25,curve:.08,r:.0075}),Jo(e,[[.9,.2,.034]],z(t.coat,`#4a3a20`,.4),`drum`),Yo(e,`body`,[0,.22,-.02],[[0,.55,.038],[.42,.2,.033],[.5,.85,.03],[.95,.5,.03],[.85,-.05,.028],[1.35,.22,.025]],r,`spot`),Yo(e,`neck`,os(e.joints.neck,[0,.1,.05]),[[0,.75,.03],[.55,.45,.024]],r,`headSpot`),e.marks={base:t.coat,marks:[{color:n,f:Y(e,`throat`)},{color:n,f:qo(e,[`belly`,`chest`],0,.2,.17,.16)}]},{aquatic:!0}},os=(e,t)=>[e[0]+t[0],e[1]+t[1],e[2]+t[2]];function ss(e){return Array.from({length:e},(t,n)=>{let r=1-2*(n+.5)/e,i=Math.sqrt(1-r*r),a=n*Math.PI*(3-Math.sqrt(5));return new I(Math.cos(a)*i,r,Math.sin(a)*i)})}function cs(e,t,n,r,i,a=.03){let o=Kt(e);for(let e=0;e+1<n.length;e++)o.add(tn(t,n[e],n[e+1],r[e],r[e+1],{k:e===0?a:.02,anchor:n[0],reach:.08,name:`${i}${e}`,thin:!0}))}var ls=(e,t)=>{let n=z(t.coat,`#ffffff`,.45),r=z(t.coat,`#5a2a4a`,.38);e.joints.neck=[0,.36,.02],e.joints.shoulder=[.13,.33,.1],e.joints.hip=[.1,.18,-.02],e.joints.tail=[0,.3,-.15],R(e,{belly:[[0,.25,0],[.17,.11,.16]],chest:[[0,.33,.02],[.16,.08,.15]]}),W(e,{r:[.21,.17,.19],at:[0,.1,.03],melt:.1});let i=Kt(e),a=e.joints.neck;return i.add(K(`neck`,[0,a[1]+.31,a[2]-.05],[.145,.27,.135],{k:.08,name:`mantle`})),i.add(tn(`neck`,[0,a[1]+.45,a[2]-.05],[0,a[1]+.68,a[2]-.06],.105,.025,{k:.06,name:`mantleTip`})),Qt(e,`neck`,[.07,a[1]+.5,a[2]-.05],{len:.14,w:.08,d:.034,rot:[0,0,-.8],name:`finL`,melt:.04}),Qt(e,`neck`,[-.07,a[1]+.5,a[2]-.05],{len:.14,w:.08,d:.034,rot:[0,0,.8],name:`finR`,melt:.04}),H(e,{len:.24,r0:.045,r1:.034,paw:[.036,.03,.045],fwd:.75,out:.3}),e.lift=.12,Ct(e,{count:3,len:.24,r0:.042,r1:.03,root:[.08,.15,-.01],rim:.08,spread:2.3,hang:.7,curl:.06,melt:.09}),U(e),B(e,{x:.5,y:.02,size:1.35,wide:1,slant:0,color:`#141018`,ring:n,ringSize:1.4}),q(e,{w:.12,y:-.42,curve:.06,r:.006}),Zo(e,`neck`,[0,a[1]+.31,a[2]-.05],[.145,.27,.135],44,e=>Math.abs(e.y-.19)>.2&&e.y<.5&&e.y>(e.z>0?-.15:-.45),.023,r,`spot`),e.marks={base:t.coat,marks:[{color:r,f:Y(e,`finL`,`finR`,`mantleTip`)},{color:r,f:G(Y(e,`mantle`),e=>Math.abs(e.p.y-(a[1]+.36))-.035)},{color:n,f:G(Y(e,/^leg/,/^fore/,`armLPaw`,`armRPaw`),e=>e.p.y-.05)}]},{aquatic:!0,legs:`tentacles`}},us=(e,t)=>{let n=z(t.coat,jt,.72),r=z(t.coat,`#2e2016`,.5),i=z(r,jt,.42);e.joints.neck=[0,.44,.07],e.joints.shoulder=[.14,.34,.13],e.joints.hip=[.1,.13,-.02],e.joints.tail=[0,.15,-.2];let a=[0,.28,-.03],o=[.23,.21,.2];R(e,{belly:[a,o],chest:[[0,.38,.05],[.17,.12,.16]],melt:.18});let s=[0,.1,.07],c=[.17,.15,.16];W(e,{r:c,at:s,melt:.12});let l=bn(e,{dy:-.22,len:.1,ra:.065,rb:.03,drop:.03,squash:[1,.9,1],thin:!0});_n(e,{x:.62,y:.42,w:.05,h:.06,d:.03,round:!0,splay:.3,rake:.1,cup:.5}),H(e,{len:.13,r0:.04,r1:.035,paw:[.036,.026,.042],fwd:.7,out:.2}),V(e,{r0:.046,r1:.04,foot:[.046,.026,.07],fwd:.04}),U(e);let u=os(e.joints.neck,s),d=(e,t=0)=>Math.max(e.z-.3-t,-.15-t-e.y),f=(e,t=0)=>Math.max(e.z+.05-e.y*.4-t,-.2-t-e.y),p=new I(0,u[1]+.06,u[2]+.2),m=0,h=(t,n,a,o,s)=>{for(let c of ss(o)){if(s(c)>-.04)continue;let o=yn(e,new I(...n),new I(c.x*a[0],c.y*a[1],c.z*a[2]));if(!o)continue;let{p:l,n:u}=o,d=l.clone().sub(p);d.addScaledVector(u,-d.dot(u)).normalize();let f=d.multiplyScalar(Math.cos(.6)).addScaledVector(u,Math.sin(.6)).normalize(),h=.15+m*7%5*.008,g=[l.clone().addScaledVector(u,-.03),l.clone().addScaledVector(f,h*.55),l.clone().addScaledVector(f,h)],_=m%3==0;J(e,{bone:t,pts:g,w:[.036,.02,0],t:[.017,.011,0],across:new I().crossVectors(u,f),colors:[r,_?i:r],name:`spike${m++}`})}};h(`body`,a,o,90,d),h(`neck`,u,c,50,f),B(e,{x:.4,y:.06,size:.85,wide:1,slant:.05,color:`#140e0c`}),Vt(e,Nt,Bo(e,l.nose),.024,.018);let g=[`earL`,`earR`].map(t=>Yt(e,t)),_=(e,t,n)=>new I((e.p.x-t[0])/n[0],(e.p.y-t[1])/n[1],(e.p.z-t[2])/n[2]).normalize();return e.marks={base:n,marks:[{color:z(t.coat,`#e8a0a0`,.6),f:dn(...g.map(e=>e.inner))},{color:z(n,r,.6),f:Y(e,`armLPaw`,`armRPaw`)},{color:z(n,r,.6),f:G(Y(e,/^leg/),e=>e.p.y-.045)},{color:r,f:G(Y(e,`belly`,`chest`),e=>d(_(e,a,o),.06)*.2)},{color:r,f:G(Y(e,`head`),e=>f(_(e,u,c),.06)*.15)}]},{}},ds=(e,t)=>{let n=z(t.coat,`#c0306a`,.55),r=z(n,`#d02060`,.3),i=z(t.coat,`#ffffff`,.4);e.joints.neck=[0,.5,.06],e.joints.shoulder=[.15,.4,.1],e.joints.hip=[.1,.15,-.04],e.joints.tail=[0,.2,-.18],R(e,{belly:[[0,.28,-.02],[.19,.22,.18]],chest:[[0,.42,.04],[.16,.12,.15]]});let a=[0,.1,.05];W(e,{r:[.25,.155,.2],at:a,melt:.12});let o=os(e.joints.neck,a);for(let t of[-1,1])for(let n=0;n<3;n++){let i=.35+n*.5,a=[t*.2,o[1]-.03+n*.045,o[2]-.06],s=[t*(.2+Math.cos(i)*.08),a[1]+Math.sin(i)*.08,a[2]-.035],c=[t*(.2+Math.cos(i+.25)*.15),a[1]+Math.sin(i+.25)*.15,a[2]-.06];cs(e,`neck`,[a,s,c],[.032,.03,.028],`gill${t>0?`L`:`R`}${n}_`);let l=new I(...a),u=new I(...c).sub(l),d=u.length();u.normalize();let f=new I(-u.y,u.x,0).normalize();[.32,.52,.72,.92].forEach((i,a)=>{let o=l.clone().addScaledVector(u,d*i),s=f.clone().multiplyScalar(a%2?1:-1).addScaledVector(u,.75).add(new I(0,0,.35)).normalize();J(e,{bone:`neck`,pts:[o,o.clone().addScaledVector(s,.046),o.clone().addScaledVector(s,.072)],w:[.008,.0065,0],t:[.0055,.0045,0],across:new I(0,0,1),colors:[r,r],name:`frill${t>0?`L`:`R`}${n}_${a}`})})}H(e,{len:.17,r0:.04,r1:.033,paw:[.042,.02,.045],fwd:.5,out:.3}),V(e,{r0:.05,r1:.042,foot:[.05,.022,.07]});let s=zo(.46,[0,-.35,-1],[.25,.2,0],.085,[1,.85,.7,.5,.3]),c=Lt(e,s),l=s.pts[Math.round(s.pts.length*.55)];return Qt(e,`tail1`,os(e.joints.tail,l),{len:.07,w:.04,d:.12,rot:[.25,0,0],name:`tailFin`,melt:.04}),U(e),B(e,{x:.55,y:.18,size:.7,wide:1,slant:0,color:`#141018`}),q(e,{w:.55,y:-.32,curve:.1,r:.0065}),e.marks={base:t.coat,marks:[{color:n,f:Y(e,/^gill/)},{color:i,f:Y(e,`tailFin`)},{color:i,f:qo(e,[`belly`,`chest`],0,.3,.14,.2)},{color:i,f:G(Y(e,/^tail\d/),e=>.12-c(e.p)+ +(e.p.y>.2))}]},{aquatic:!0}},fs=(e,t)=>{let n=z(t.coat,jt,.6),r=z(t.coat,`#5a3424`,.5);e.joints.neck=[0,.5,.06],e.joints.shoulder=[.12,.42,.08],e.joints.hip=[.09,.16,-.03],e.joints.tail=[0,.19,-.15],R(e,{belly:[[0,.28,-.02],[.16,.2,.15]],chest:[[0,.42,.03],[.13,.11,.12]]}),W(e,{r:[.2,.15,.19],at:[0,.12,.06],melt:.1}),bn(e,{dy:-.2,len:.06,ra:.12,rb:.085,drop:.02,squash:[1.2,.62,1]}),H(e,{len:.2,r0:.035,r1:.03,paw:[.052,.02,.05],fwd:.45,out:.35}),V(e,{r0:.045,r1:.036,foot:[.06,.02,.07]});let i=Lt(e,zo(.6,[0,-.45,-1],[.9,.35,0],.08,[1,.92,.8,.62,.45,.32]));return U(e),B(e,{x:.5,y:.3,size:1.5,wide:1,slant:0,color:`#1a1410`,ring:`#e2b040`,ringSize:1.3}),q(e,{w:.6,y:-.3,curve:.1,r:.006}),Zo(e,`neck`,os(e.joints.neck,[0,.12,.06]),[.2,.15,.19],40,e=>e.z<.3&&e.y>-.1,.017,r,`headSpot`),Zo(e,`body`,[0,.3,-.02],[.16,.22,.15],44,e=>e.z<.15&&e.y>(Math.abs(e.x)<.5?-.25:-.6)&&e.y<.85,.018,r,`spot`),e.marks={base:t.coat,marks:[{color:n,f:qo(e,[`belly`,`chest`],0,.3,.12,.2)},{color:r,f:G(Y(e,/^tail\d/),e=>.55-Math.sin(i(e.p)*Math.PI*7))}]},{}},ps=(e,t)=>{let n=z(t.coat,`#e8b8a8`,.65),r=z(t.coat,At,.75),i=[z(t.coat,`#f2c890`,.22),t.coat,z(t.coat,`#6a2e12`,.2)];e.joints.neck=[0,.6,.08],e.joints.shoulder=[.17,.48,.13],e.joints.hip=[.12,.2,-.05],e.joints.tail=[0,.32,-.24];let a=[0,.36,-.04],o=[.25,.24,.24],s=[.13,.22,-.08];R(e,{belly:[a,o],chest:[[0,.5,.05],[.2,.15,.19]],haunch:[s,[.11,.13,.16]],melt:.2});let c=[0,.11,.08];W(e,{r:[.2,.165,.175],at:c,melt:.12});let l=bn(e,{dy:-.36,len:.08,ra:.12,rb:.105,drop:.03,squash:[1.15,.8,1]});_n(e,{x:.85,y:.15,w:.065,h:.11,d:.03,splay:1.35,rake:.1,cup:.5,round:!0});let u=Kt(e),d=os(e.joints.neck,c);for(let t of[-1,1])cs(e,`neck`,[[t*.13,d[1]+.12,d[2]-.02],[t*.26,d[1]+.13,d[2]-.01],[t*.36,d[1]+.2,d[2]],[t*.39,d[1]+.3,d[2]+.02]],[.042,.036,.029,.021],`horn${t>0?`L`:`R`}_`,.04);u.add(K(`neck`,[0,d[1]+.11,d[2]+.06],[.17,.08,.13],{k:.06,name:`forelock`})),H(e,{len:.3,r0:.07,r1:.06,paw:[.06,.048,.065],fwd:.3,out:.16}),V(e,{r0:.08,r1:.066,foot:[.066,.048,.08]});let f=Lt(e,zo(.3,[0,-.85,-.5],[0,0,0],.035,[1,.9,.9,1.5,1.9]));U(e);let p=0,m=(t,n,r,a,o=.036,s=new I(0,-1,0))=>{let c=yn(e,n,r);if(!c)return;let{p:l,n:u}=c,d=new I(u.x,0,u.z).normalize(),f=s.clone().addScaledVector(d,.45).normalize(),m=[l.clone().addScaledVector(u,-.025),l.clone().addScaledVector(f,a*.55).addScaledVector(d,.012),l.clone().addScaledVector(f,a).addScaledVector(d,.03)],h=i[(p*5+1)%3];J(e,{bone:t,pts:m,w:[o,o*.75,0],t:[.014,.011,0],across:new I().crossVectors(f,d),colors:[h,h],name:`lock${p++}`})},h=new I(...a);[.5,.12,-.25].forEach((e,t)=>{let n=12+t;for(let r=0;r<n;r++){let i=(r+t%2*.5)/n*Math.PI*2,a=new I(Math.sin(i)*o[0],e*o[1],Math.cos(i)*o[2]);m(`body`,h,a,t===0?.15:.17,.04)}});for(let e of[-1,1]){let t=new I(e*s[0],s[1],s[2]);for(let n=0;n<3;n++)m(`body`,t,new I(e,.3-n*.3,-.4+n*.35),.13,.036)}let g=new I(...d),_=(e,t,n)=>m(`neck`,g.clone().add(new I(0,t,0)),new I(e,.25,1),n,.034,new I(e*.4,-1,.25));for(let e of[-.95,-.6,-.15,.15,.6,.95])_(e,.08,.19);for(let e of[-.8,-.38,.38,.8])_(e,.1,.12);for(let e of[-1,1])for(let t=0;t<3;t++)m(`neck`,g,new I(e,-.25-t*.25,.55-t*.2),.12,.032);return B(e,{x:.38,y:-.2,size:.8,wide:1.15,slant:.05,color:`#1a1412`}),Vt(e,z(n,At,.45),Bo(e,l.nose),.04,.022),e.marks={base:t.coat,marks:[{color:`#4a3e34`,f:G(Y(e,/^horn/),e=>d[1]+.25-e.p.y)},{color:`#ece0c4`,f:Y(e,/^horn/)},{color:n,f:G(Y(e,`muzzle`),e=>-e.p.z+d[2]+.2)},{color:i[0],f:Y(e,`forelock`)},{color:r,f:G(Y(e,/^leg/),e=>e.p.y-.06)},{color:r,f:G(Y(e,`armLPaw`,`armRPaw`),t=>t.p.y-(e.joints.shoulder[1]-.36))},{color:i[2],f:G(Y(e,/^tail\d/),e=>.75-f(e.p))}]},{}},ms=(e,t)=>{let n=z(t.coat,jt,.85),r=z(t.coat,`#2b211d`,.72);e.joints.neck=[0,.66,.07],e.joints.shoulder=[.11,.52,.12],e.joints.hip=[.09,.24,-.06],e.joints.tail=[0,.36,-.2],R(e,{belly:[[0,.39,-.06],[.17,.2,.17]],chest:[[0,.52,.04],[.14,.14,.13]],haunch:[[.1,.28,-.08],[.09,.11,.13]],ruff:[[0,.62,.06],[.09,.09,.09]],melt:.2});let i=[0,.15,.06];W(e,{r:[.15,.145,.155],at:i});let a=bn(e,{dy:-.3,len:.11,ra:.075,rb:.052,drop:.045,squash:[1,.85,1],thin:!0});_n(e,{x:.8,y:.3,w:.065,h:.17,d:.035,splay:1.05,rake:.12,cup:.55,long:!0});let o=os(e.joints.neck,i);for(let t of[-1,1]){let n=t>0?`antlerL`:`antlerR`,r=[t*.07,o[1]+.12,o[2]-.02],i=[t*.12,o[1]+.22,o[2]-.04];kt(e,n,`neck`,[r[0]-e.joints.neck[0],r[1]-e.joints.neck[1],r[2]-e.joints.neck[2]]),cs(e,n,[r,i,[t*.17,o[1]+.31,o[2]-.07]],[.027,.024,.021],`${n}_`),cs(e,n,[i,[t*.13,o[1]+.28,o[2]+.04]],[.024,.021],`${n}T`)}H(e,{len:.32,r0:.045,r1:.036,paw:[.036,.032,.045],fwd:.3,out:.12}),V(e,{r0:.05,r1:.036,foot:[.036,.032,.05]});let s=e.joints.tail;Kt(e).add(K(`tail`,[s[0],s[1]+.02,s[2]-.03],[.05,.065,.04],{k:.025,anchor:s,reach:.07,name:`bob`})),U(e),B(e,{x:.45,y:.1,size:1.1,wide:1.15,slant:.12,color:`#1a1210`}),Vt(e,Nt,Bo(e,a.nose),.026,.02);let c=[`earL`,`earR`].map(t=>Yt(e,t)),l=[{a:.3,top:.6,n:5,r:.028},{a:.72,top:.565,n:4,r:.027},{a:1.12,top:.53,n:3,r:.022},{a:1.5,top:.5,n:3,r:.02}];for(let t of[-1,1])l.forEach(({a:r,top:i,n:a,r:o},s)=>{for(let c=0;c<a;c++){let a=i-c*.07,l=r+c%2*.06-.03;pn(e,{bone:`body`,from:new I(0,a,-.03),dir:new I(t*Math.sin(l),0,-Math.cos(l)),r:o,stretch:1.15,color:n,name:`spot${t>0?`L`:`R`}${s}_${c}`})}});let u=s[1]+.02;return e.marks={base:t.coat,marks:[{color:`#e4d6b8`,f:Y(e,/^antler/)},{color:n,f:dn(...c.map(e=>e.inner))},{color:r,f:dn(...c.map(e=>e.back))},{color:n,f:G(Y(e,`muzzle`),e=>e.p.y-(a.mid(e.p)-a.r*.2))},{color:n,f:G(Y(e,`chest`,`ruff`),e=>-e.p.z,e=>Math.hypot(e.p.x/.07,(e.p.y-.6)/.06)-1)},{color:n,f:qo(e,[`belly`],0,.3,.1,.12)},{color:n,f:G(Y(e,`bob`),e=>e.p.y-u+(e.p.z-s[2])*.6)},{color:n,f:G(Y(e,`belly`,`haunchL`,`haunchR`),e=>e.p.z+.17,e=>Math.hypot(e.p.x/.075,(e.p.y-.33)/.075)-1)},{color:r,f:G(Y(e,/^leg/),e=>e.p.y-.06)},{color:r,f:G(Y(e,`armLPaw`,`armRPaw`),t=>t.p.y-(e.joints.shoulder[1]-.37))}]},{}},hs=(e,t)=>{let n=z(t.coat,jt,.7),r=z(t.coat,`#33241a`,.68);e.joints.neck=[0,.56,.05],e.joints.shoulder=[.17,.47,.06],e.joints.hip=[.1,.16,-.03],e.joints.tail=[0,.2,-.18],R(e,{belly:[[0,.32,-.03],[.21,.23,.19]],chest:[[0,.46,.03],[.18,.13,.16]],melt:.2}),W(e,{r:[.19,.17,.17],at:[0,.12,.06],melt:.12});let i=bn(e,{dy:-.26,len:.04,ra:.075,rb:.065,drop:.01,squash:[1.2,.85,1]});H(e,{len:.36,r0:.05,r1:.042,paw:[.045,.035,.05],fwd:.3,out:.32});let a=Kt(e);for(let t of[`L`,`R`]){let n=a.named(`arm${t}Paw`).c;for(let r=-1;r<=1;r++){let i=[n.x+r*.025,n.y-.015,n.z+.025];cs(e,`fore${t}`,[i,[i[0],i[1]-.05,i[2]+.025],[i[0],i[1]-.085,i[2]+.005]],[.018,.016,.014],`claw${t}${r+1}_`,.02)}}V(e,{r0:.055,r1:.046,foot:[.05,.03,.07]}),U(e),B(e,{x:.36,y:.08,size:.8,wide:1,slant:0,color:`#140e0c`}),Vt(e,z(t.coat,`#1a1210`,.85),Bo(e,i.nose),.03,.022),q(e,{w:.24,y:-.48,curve:.08,r:.006}),Jo(e,[[.55,.04,.025]],r,`stripe`,{stretch:2.9,along:[1,-.22,0],sides:12});let o=Mt(e,`head`),s=Y(e,`head`,`muzzle`);return e.marks={base:t.coat,marks:[{color:`#ece2c8`,f:Y(e,/^claw/)},{color:n,f:G(s,e=>.05-o(e).z)},{color:n,f:Y(e,`muzzle`)}]},{sleepy:!0}},gs=(e,t)=>{let n=z(t.coat,`#f2eee6`,.55),r=z(t.coat,At,.35);e.joints.neck=[0,.56,.05],e.joints.shoulder=[.18,.44,.06],e.joints.hip=[.08,.1,-.02],e.joints.tail=[0,.12,-.18],R(e,{belly:[[0,.3,-.02],[.22,.28,.21]],chest:[[0,.46,.03],[.18,.15,.17]],melt:.2}),W(e,{r:[.18,.165,.17],at:[0,.13,.04],melt:.14});let i=bn(e,{dy:-.28,len:.05,ra:.085,rb:.07,drop:.015,squash:[1.25,.8,1]});nn(e,{len:.28,w:.09,d:.03,taper:.75,fwd:.15,out:.32}),V(e,{r0:.05,r1:.045,foot:[.075,.024,.1],fwd:.02}),U(e),B(e,{x:.4,y:.1,size:1.25,wide:1,slant:0,color:`#120e10`}),Vt(e,`#2a2224`,Bo(e,i.nose),.028,.02),bt(e,t.coat,{len:.1,sweep:.15,color:`#e8e0d4`}),q(e,{w:.18,y:-.52,curve:.06,r:.006});let a=z(t.coat,At,.42);return Zo(e,`body`,[0,.33,-.02],[.22,.28,.21],46,e=>e.z<.25&&e.y<.75&&e.y>-.55,.017,a,`speck`),Zo(e,`neck`,os(e.joints.neck,[0,.13,.04]),[.18,.165,.17],22,e=>e.z<.1&&e.y>-.1,.014,a,`headSpeck`),e.marks={base:t.coat,marks:[{color:n,f:Y(e,`muzzle`)},{color:n,f:qo(e,[`belly`,`chest`],0,.32,.16,.26)},{color:r,f:G(Y(e,/^leg/),e=>e.p.y-.05)}]},{aquatic:!0}},_s=(e,t)=>{let n=z(t.coat,`#e8c8a0`,.45),r=z(t.coat,`#3a3034`,.6);e.joints.neck=[0,.52,.06],e.joints.shoulder=[.16,.42,.08],e.joints.hip=[.1,.14,-.03],e.joints.tail=[0,.2,-.2],R(e,{belly:[[0,.29,-.03],[.2,.25,.2]],chest:[[0,.43,.03],[.17,.13,.16]],melt:.2}),W(e,{r:[.17,.15,.16],at:[0,.12,.05],melt:.12});let i=Wt(e,{dy:-.18,len:.16,w:.09,h:.028,flat:!0,drop:.12}),a={dy:-.18,len:.16,drop:.12};H(e,{len:.18,r0:.045,r1:.036,paw:[.05,.02,.05],fwd:.5,out:.3}),V(e,{r0:.05,r1:.042,foot:[.06,.022,.08]});let o=e.joints.tail;return Kt(e).add(K(`tail`,[o[0],o[1]-.06,o[2]-.13],[.12,.045,.16],{rot:[-.4,0,0],k:.05,anchor:o,reach:.12,name:`paddle`})),U(e),B(e,{x:.5,y:.25,size:.75,wide:1,slant:0,color:`#120e10`}),Qo(e,{...a,at:.78,gap:.02,r:.0085,color:`#1c181a`}),Jo(e,[[.6,.12,.024]],n,`cheek`,{stretch:1.3,along:[1,.3,0]}),e.nose=i,e.marks={base:t.coat,marks:[{color:`#4a4448`,f:Y(e,`beak`)},{color:r,f:Y(e,`armLPaw`,`armRPaw`)},{color:r,f:G(Y(e,/^leg/),e=>e.p.y-.045)},{color:n,f:qo(e,[`belly`,`chest`],0,.3,.15,.24)}]},{aquatic:!0}},vs=(e,t)=>{let n=`#26242a`;e.joints.neck=[0,.58,.05],e.joints.shoulder=[.17,.48,.1],e.joints.hip=[.11,.17,-.04],e.joints.tail=[0,.2,-.22],R(e,{belly:[[0,.32,-.04],[.24,.26,.23]],chest:[[0,.48,.03],[.2,.15,.18]],haunch:[[.13,.18,-.06],[.11,.12,.15]],melt:.2}),W(e,{r:[.2,.18,.18],at:[0,.13,.06],cheeks:[[.12,-.06,.04],[.09,.08,.09]]});let r=bn(e,{dy:-.28,len:.05,ra:.08,rb:.065,drop:.02,squash:[1.15,.85,1]});_n(e,{x:.62,y:.68,w:.065,h:.075,d:.035,round:!0,splay:.3,rake:.1}),H(e,{len:.27,r0:.07,r1:.06,paw:[.06,.045,.065],fwd:.35,out:.15}),V(e,{r0:.075,r1:.065,foot:[.065,.045,.085]});let i=e.joints.tail;Kt(e).add(K(`tail`,[i[0],i[1]+.01,i[2]-.02],[.05,.05,.04],{k:.025,anchor:i,reach:.07,name:`puff`})),U(e),B(e,{x:.38,y:.1,size:.85,wide:1,slant:.1,color:`#120e10`,ring:n,ringSize:1.8,out:.006}),Vt(e,n,Bo(e,r.nose),.032,.022);let a=Mt(e,`head`);return e.marks={base:t.coat,marks:[{color:n,f:Y(e,`earL`,`earR`)},{color:n,f:G(Y(e,`head`,`cheekL`,`cheekR`),e=>{let t=a(e),n=Math.abs(t.x)-.38,r=t.y-.08,i=.5,o=n*Math.cos(i)+r*Math.sin(i),s=-n*Math.sin(i)+r*Math.cos(i);return Math.max(Math.hypot(o/.2,s/.29)-1,.2-t.z)})},{color:n,f:Y(e,`armL`,`armR`,`foreL`,`foreR`,`armLPaw`,`armRPaw`)},{color:n,f:G(Y(e,`chest`,`belly`),e=>Math.abs(e.p.y-.54-e.p.z*.25)-.075,e=>-Math.max(.05-e.p.z,Math.abs(e.p.x)-.13))},{color:n,f:Y(e,/^leg/,`haunchL`,`haunchR`)}]},{}},ys=(e,t)=>{let n=z(t.coat,`#e8d4b4`,.6),r=z(t.coat,At,.3);e.joints.neck=[0,.66,.07],e.joints.shoulder=[.12,.54,.1],e.joints.hip=[.09,.16,-.03],e.joints.tail=[0,.18,-.16],R(e,{belly:[[0,.32,-.03],[.17,.28,.17]],chest:[[0,.53,.04],[.14,.15,.14]],melt:.22}),W(e,{r:[.15,.13,.15],at:[0,.11,.06]});let i=bn(e,{dy:-.22,len:.06,ra:.075,rb:.065,drop:.015,squash:[1.25,.82,1]});_n(e,{x:.78,y:.5,w:.035,h:.04,d:.025,round:!0,splay:.6,rake:.1}),H(e,{len:.18,r0:.04,r1:.034,paw:[.04,.03,.045],fwd:.8,out:.15}),V(e,{r0:.05,r1:.042,foot:[.05,.024,.085]});let a=Lt(e,zo(.5,[0,-.6,-1],[.3,.45,0],.075,[1,.9,.75,.55,.35]));U(e),B(e,{x:.42,y:.12,size:.85,wide:1,slant:.05,color:`#120e10`}),Vt(e,`#2a1e1a`,Bo(e,i.nose),.028,.02),bt(e,t.coat,{len:.09,color:`#e8ddd0`}),q(e,{w:.16,y:-.5,curve:.06,r:.006});let o=Mt(e,`head`);return e.marks={base:t.coat,marks:[{color:n,f:Y(e,`muzzle`)},{color:n,f:G(Y(e,`head`),e=>o(e).y+.1,e=>.1-o(e).z)},{color:n,f:G(Y(e,`chest`,`belly`),e=>-e.p.z,e=>Math.hypot(e.p.x/.09,(e.p.y-.6)/.09)-1)},{color:r,f:Y(e,`armLPaw`,`armRPaw`)},{color:r,f:G(Y(e,/^leg/),e=>e.p.y-.045)},{color:r,f:G(Y(e,/^tail\d/),e=>.55-a(e.p))}]},{aquatic:!0}},bs=(e,t)=>{let n=z(t.coat,At,.45);e.joints.neck=[0,.58,.07],e.joints.shoulder=[.17,.46,.11],e.joints.hip=[.12,.18,-.05],e.joints.tail=[0,.24,-.25],R(e,{belly:[[0,.33,-.05],[.24,.27,.25]],chest:[[0,.47,.04],[.2,.15,.19]],haunch:[[.13,.2,-.08],[.11,.13,.16]],melt:.22}),W(e,{r:[.17,.17,.19],at:[0,.13,.08]});let r=bn(e,{dy:-.12,len:.12,ra:.13,rb:.12,drop:.05,squash:[.95,1.05,1]});_n(e,{x:.55,y:.8,w:.045,h:.05,d:.03,round:!0,splay:.3,rake:.1}),H(e,{len:.27,r0:.065,r1:.055,paw:[.055,.04,.065],fwd:.3,out:.15}),V(e,{r0:.07,r1:.06,foot:[.06,.04,.08]}),U(e),B(e,{x:.5,y:.35,size:.7,wide:1,slant:0,color:`#140e0c`}),Vt(e,n,Bo(e,r.nose),.04,.02);let i=new I(...e.joints.neck),a=Bt(e,0,-.12).add(i).clone().lerp(new I(...r.nose).add(i),.4);return pn(e,{bone:`neck`,from:a.add(new I(0,-.03,0)),dir:new I(0,1,.15),r:.032,stretch:1.45,along:new I(0,-.3,1),color:z(t.coat,At,.5),name:`ridge`}),e.marks={base:t.coat,marks:[{color:n,f:Y(e,`earL`,`earR`)},{color:n,f:G(Y(e,/^leg/),e=>e.p.y-.05)}]},{}},xs=(e,t)=>{let n=z(t.coat,jt,.75),r=z(t.coat,At,.45),i=z(t.coat,At,.3);e.joints.neck=[0,.66,.05],e.joints.shoulder=[.11,.53,.13],e.joints.hip=[.1,.22,-.07],e.joints.tail=[0,.25,-.18],R(e,{belly:[[0,.36,-.1],[.18,.22,.18]],chest:[[0,.5,.04],[.16,.16,.15]],haunch:[[.11,.22,-.1],[.1,.13,.15]],ruff:[[0,.61,.04],[.16,.1,.14]],melt:.2}),W(e,{r:[.18,.155,.175],at:[0,.14,.06],cheeks:[[.13,-.05,-.01],[.09,.08,.09]]});let a=bn(e,{dy:-.27,len:.15,ra:.078,rb:.048,drop:.04,squash:[1,.85,1],thin:!0});_n(e,{x:.55,y:.72,w:.08,h:.19,d:.045,splay:.15,rake:.08,cup:.5,notch:!0}),H(e,{len:.33,r0:.056,r1:.047,paw:[.05,.038,.06],fwd:.33,out:.15}),V(e,{r0:.066,r1:.05,foot:[.052,.038,.082]});let o=Lt(e,zo(.55,[0,-.65,-1],[.2,-.25,0],.11,[.35,.75,.95,1,.9,.7,.4]));U(e),B(e,{x:.4,y:.14,size:.85,wide:1.4,slant:.28,color:`#1a1410`,ring:`#c8963a`,ringSize:1.25}),Vt(e,Nt,Bo(e,a.nose),.028,.02),bt(e,t.coat,{len:.1,back:.035}),Jo(e,[[.27,.43,.024]],n,`brow`,{stretch:1.3,along:[1,.35,0]});let s=[`earL`,`earR`].map(t=>Yt(e,t)),c=Mt(e,`head`);return e.marks={base:t.coat,marks:[{color:n,f:dn(...s.map(e=>e.inner))},{color:r,f:dn(...s.map(e=>e.back))},{color:n,f:G(Y(e,`muzzle`),e=>e.p.y-(a.mid(e.p)+a.r*.2))},{color:n,f:G(Y(e,`head`,`cheekL`,`cheekR`),e=>c(e).y+.12+Math.abs(c(e).x)*.15,e=>-.2-c(e).z)},{color:n,f:G(Y(e,`chest`,`ruff`,`belly`),e=>-e.p.z,e=>Pt(e.p.x,e.p.y,0,.32,0,.62).d-.09)},{color:i,f:G(Y(e,`belly`,`chest`,`ruff`,`haunchL`,`haunchR`),e=>Math.atan2(Math.abs(e.p.x),-.06-e.p.z)-.55-(e.p.y-.3)*1.7,e=>.3-e.p.y)},{color:r,f:G(Y(e,/^tail\d/),e=>.85-o(e.p))}]},{}},Ss=(e,t)=>{let n=z(t.coat,`#e2c8a0`,.55),r=z(t.coat,At,.35);e.joints.neck=[0,.6,.05],e.joints.shoulder=[.18,.49,.1],e.joints.hip=[.12,.18,-.04],e.joints.tail=[0,.22,-.23],R(e,{belly:[[0,.33,-.04],[.25,.27,.24]],chest:[[0,.5,.03],[.21,.16,.19]],haunch:[[.14,.19,-.06],[.11,.12,.15]],melt:.2}),W(e,{r:[.2,.18,.18],at:[0,.13,.06],cheeks:[[.12,-.06,.03],[.09,.08,.09]]});let i=bn(e,{dy:-.26,len:.08,ra:.085,rb:.07,drop:.02,squash:[1.1,.85,1]});_n(e,{x:.62,y:.68,w:.06,h:.07,d:.035,round:!0,splay:.3,rake:.1,cup:.5}),H(e,{len:.28,r0:.075,r1:.064,paw:[.064,.048,.07],fwd:.35,out:.22}),V(e,{r0:.08,r1:.068,foot:[.068,.046,.09]});let a=e.joints.tail;Kt(e).add(K(`tail`,[a[0],a[1]+.01,a[2]-.02],[.045,.045,.04],{k:.025,anchor:a,reach:.07,name:`stub`})),U(e),B(e,{x:.36,y:.12,size:.8,wide:1,slant:.05,color:`#120e0c`}),Vt(e,Nt,Bo(e,i.nose),.036,.026),q(e,{w:.14,y:-.56,curve:.06,r:.006,out:.004});let o=[`earL`,`earR`].map(t=>Yt(e,t));return e.marks={base:t.coat,marks:[{color:n,f:dn(...o.map(e=>e.inner))},{color:n,f:Y(e,`muzzle`)},{color:z(t.coat,n,.35),f:qo(e,[`belly`,`chest`],0,.33,.15,.22)},{color:r,f:dn(It(e,`L`,.55),It(e,`R`,.55))},{color:r,f:G(Y(e,/^leg/),e=>e.p.y-.11)}]},{}},Cs=(e,t)=>{let n=`#f4efe6`,r=z(t.coat,`#2a1612`,.72),i=z(t.coat,`#f0c890`,.5);e.joints.neck=[0,.54,.05],e.joints.shoulder=[.14,.43,.11],e.joints.hip=[.1,.17,-.05],e.joints.tail=[0,.2,-.18],R(e,{belly:[[0,.3,-.05],[.2,.23,.19]],chest:[[0,.43,.03],[.16,.13,.15]],melt:.2}),W(e,{r:[.2,.165,.17],at:[0,.13,.05],cheeks:[[.12,-.06,.03],[.09,.08,.09]]});let a=bn(e,{dy:-.28,len:.06,ra:.07,rb:.055,drop:.02,squash:[1.1,.85,1]});_n(e,{x:.62,y:.66,w:.07,h:.1,d:.035,round:!0,splay:.35,rake:.1,cup:.5}),H(e,{len:.26,r0:.05,r1:.042,paw:[.046,.035,.054],fwd:.35,out:.15}),V(e,{r0:.058,r1:.048,foot:[.05,.035,.072]});let o=Lt(e,zo(.6,[0,-.3,-1],[.5,.9,0],.1,[.6,.9,1,1,.95,.85,.65]));U(e),B(e,{x:.38,y:.08,size:.9,wide:1,slant:.1,color:`#140e0c`}),Vt(e,Nt,Bo(e,a.nose),.026,.019),bt(e,t.coat,{len:.09,color:`#f0e6da`}),Jo(e,[[.33,.43,.026]],n,`brow`,{stretch:1.55,along:[1,.3,0]});let s=[`earL`,`earR`].map(t=>Yt(e,t)),c=Mt(e,`head`);return e.marks={base:t.coat,marks:[{color:n,f:dn(...s.map(e=>e.inner))},{color:r,f:G(Y(e,`head`,`cheekL`,`cheekR`),e=>Math.abs(Math.abs(c(e).x)-.4)-.07,e=>c(e).y-0,e=>-.35-c(e).y,e=>.2-c(e).z)},{color:n,f:Y(e,`muzzle`)},{color:n,f:G(Y(e,`cheekL`,`cheekR`,`head`),e=>c(e).y+.05,e=>.25-c(e).z)},{color:r,f:Y(e,`armL`,`armR`,`foreL`,`foreR`,`armLPaw`,`armRPaw`,/^leg/)},{color:r,f:qo(e,[`belly`,`chest`],0,.28,.14,.2)},{color:i,f:G(Y(e,/^tail\d/),e=>.4-Math.sin(o(e.p)*Math.PI*7))}]},{}},ws=(e,t)=>{let n=z(t.coat,jt,.55),r=z(t.coat,At,.55);e.joints.neck=[0,.52,.05],e.joints.shoulder=[.12,.42,.12],e.joints.hip=[.1,.15,-.04],e.joints.tail=[0,.17,-.19],R(e,{belly:[[0,.27,-.04],[.2,.23,.19]],chest:[[0,.41,.03],[.15,.13,.14]],haunch:[[.12,.15,-.06],[.1,.11,.15]],melt:.2}),W(e,{r:[.18,.16,.16],at:[0,.13,.05],cheeks:[[.1,-.07,.05],[.08,.075,.08]]});let i=bn(e,{dy:-.26,len:.025,ra:.08,rb:.068,drop:.01,squash:[1.15,.85,1]});_n(e,{x:.66,y:.62,w:.048,h:.055,d:.028,round:!0,splay:.4,rake:.1,cup:.5}),H(e,{len:.17,r0:.042,r1:.035,paw:[.038,.03,.045],fwd:.9,out:.1}),V(e,{r0:.06,r1:.05,foot:[.05,.035,.12],fwd:.07}),Lt(e,zo(.3,[0,-.7,-1],[0,.2,0],.06,[1,.85,.65,.45])),U(e),B(e,{x:.38,y:.12,size:.85,wide:1,slant:.05,color:`#140e0c`}),Vt(e,r,Bo(e,i.nose),.026,.018),bt(e,t.coat,{len:.07}),q(e,{w:.42,y:-.42,curve:.2,r:.011,out:.004});let a=[`earL`,`earR`].map(t=>Yt(e,t));return e.marks={base:t.coat,marks:[{color:z(t.coat,`#e0a0a0`,.5),f:dn(...a.map(e=>e.inner))},{color:n,f:Y(e,`muzzle`)},{color:n,f:qo(e,[`belly`,`chest`],0,.3,.13,.2)},{color:r,f:G(Y(e,/^leg/),e=>e.p.y-.04)}]},{}},Ts=(e,t)=>{let n=z(t.coat,`#fbf4e6`,.7),r=z(t.coat,`#3a2a20`,.72);e.joints.neck=[0,.68,.06],e.joints.shoulder=[.11,.56,.09],e.joints.hip=[.085,.16,-.03],e.joints.tail=[0,.18,-.15],R(e,{belly:[[0,.32,-.03],[.15,.28,.15]],chest:[[0,.55,.03],[.125,.15,.13]],melt:.22}),W(e,{r:[.14,.12,.145],at:[0,.1,.06]});let i=bn(e,{dy:-.2,len:.08,ra:.07,rb:.05,drop:.02,squash:[1.15,.85,1]});_n(e,{x:.74,y:.55,w:.042,h:.046,d:.026,round:!0,splay:.5,rake:.1,cup:.5}),H(e,{len:.17,r0:.036,r1:.03,paw:[.036,.026,.04],fwd:.7,out:.15}),V(e,{r0:.045,r1:.038,foot:[.045,.022,.075]});let a=Lt(e,zo(.46,[0,-.6,-1],[.3,.42,0],.058,[1,.95,.85,.72,.55]));U(e),B(e,{x:.4,y:.12,size:.85,wide:1,slant:.08,color:`#120e10`}),Vt(e,`#d9878a`,Bo(e,i.nose),.024,.018),bt(e,t.coat,{len:.09,color:`#e8ddd0`}),q(e,{w:.14,y:-.5,curve:.06,r:.006});let o=Mt(e,`head`),s=[`earL`,`earR`].map(t=>Yt(e,t));return e.marks={base:t.coat,marks:[{color:z(n,`#e8a0a0`,.25),f:dn(...s.map(e=>e.inner))},{color:r,f:G(Y(e,`head`,`muzzle`),e=>Math.abs(o(e).y-.14)-.17,e=>.13-Math.abs(o(e).x),e=>.1-o(e).z)},{color:n,f:Y(e,`muzzle`)},{color:n,f:G(Y(e,`head`),e=>.3-o(e).z)},{color:n,f:Y(e,`earL`,`earR`)},{color:r,f:Y(e,/^arm/,/^fore/)},{color:r,f:Y(e,/^leg/)},{color:r,f:G(Y(e,/^tail\d/),e=>.2-a(e.p))}]},{}},Es=(e,t)=>{let n=z(t.coat,`#f4ebe0`,.5),r=z(t.coat,At,.25);e.joints.neck=[0,.55,.06],e.joints.shoulder=[.2,.42,.07],e.joints.hip=[.07,.1,-.05],e.joints.tail=[0,.12,-.2],R(e,{belly:[[0,.3,-.02],[.255,.29,.235]],chest:[[0,.47,.03],[.2,.15,.19]],melt:.2}),W(e,{r:[.19,.17,.175],at:[0,.14,.04],melt:.18});let i=bn(e,{dy:-.3,len:.06,ra:.095,rb:.09,drop:.06,squash:[1.12,.92,1]}),a=e.joints.neck,o=os(a,i.nose),s=[o[0],o[1]-.04,o[2]-.035];Kt(e).add(K(`neck`,s,[.092,.068,.064],{rot:[.4,0,0],k:.04,name:`lip`})),nn(e,{len:.22,w:.085,d:.036,taper:.85,fwd:.25,out:.4}),V(e,{r0:.06,r1:.055,foot:[.12,.024,.08],fwd:-.08}),U(e),B(e,{x:.46,y:.24,size:1.2,wide:1,slant:-.06,color:`#120e10`,blush:!1});for(let t of[-1,1]){let n=Bt(e,t*.6,-.12).add(new I(...a));(e.blush??=[]).push({at:L(n),n:L(Rt(e,t*.6,-.12)),r:.05})}for(let n of[-1,1])pn(e,{bone:`neck`,from:new I(...o).add(new I(0,-.04,-.05)),dir:new I(n*.45,1,.6),r:.011,stretch:1.7,along:new I(1,0,-.4*n),color:z(t.coat,`#2a2224`,.65),sides:8,name:`nostril${n>0?`L`:`R`}`});e.nose=L(new I(...i.nose).add(new I(0,-.02,.01))),bt(e,t.coat,{len:.04,sweep:.05,drop:.035,color:z(t.coat,`#f2ece2`,.6)});let c=new I(...s),l=[-1,-.6,-.2,.2,.6,1].map(t=>yn(e,c,new I(t*.75,-.62+.3*t*t,1))?.p);return l.every(Boolean)&&qt(e,{bone:`neck`,pts:l,w:.0055,color:`#2a2224`}),e.marks={base:t.coat,marks:[{color:z(n,t.coat,.35),f:Y(e,`lip`)},{color:n,f:qo(e,[`belly`,`chest`],0,.3,.18,.27)},{color:z(t.coat,At,.12),f:Y(e,`armL`,`armR`,`armLPaw`,`armRPaw`)},{color:r,f:Y(e,/^leg/)}]},{aquatic:!0}},Ds=(e,t)=>{let n=z(t.coat,`#f2dcc0`,.5),r=z(t.coat,`#ffb040`,.6),i=z(t.coat,`#2a1410`,.25);e.joints.neck=[0,.25,.3],e.joints.shoulder=[.08,.17,.33],e.joints.tail=[0,.1,-.38],kt(e,`rear`,`body`,[0,.1,-.12]);let a=Kt(e);a.add(tn(`body`,[0,.14,-.12],[0,.16,.14],.15,.14,{squash:[1,.9,1],name:`trunk`})),a.add(tn(`rear`,[0,.1,-.42],[0,.14,-.12],.09,.15,{squash:[1,.9,1],k:.07,anchor:[0,.13,-.15],reach:.22,name:`tailEnd`})),a.add(tn(`body`,[0,.17,.12],[0,.24,.28],.14,.125,{k:.08,anchor:[0,.16,.12],reach:.18,name:`neck`})),e.seat=0,W(e,{r:[.13,.12,.12],at:[0,.04,.05],melt:.1}),U(e),B(e,{x:.36,y:.2,size:.95,wide:1,slant:0,color:`#1a1214`}),q(e,{w:.18,y:-.25,curve:.08,r:.006}),Dt(e,{color:t.coat,len:.12,r:.03,rightOnly:!0}),e.front=.47;let o=e=>{if(e<-.12){let t=(e+.42)/.3;return{y:.1+.04*t,r:.09+.06*t,bone:`rear`}}return e<.14?{y:.14+.02*(e+.12)/.26,r:.15-.01*(e+.12)/.26,bone:`body`}:{y:.17+.07*(e-.14)/.14,r:.14,bone:`body`}},s=0;for(let n=-.36;n<=.18;n+=.075){let i=Math.round((n+.36)/.075),{y:a,r:c,bone:l}=o(n),u=c>.12?7:5;for(let o=0;o<u;o++){let d=-1.75+3.5*(o+(i%2?.5:0)+.25)/u;if(Math.abs(d)>1.75)continue;let f=new I(Math.sin(d),Math.cos(d),0).normalize(),p=yn(e,new I(0,a,n),f);if(!p)continue;let m=(.06+s*37%10*.004)*(c/.15)+.015,h=p.p.clone().addScaledVector(p.n,-.02),g=p.p.clone().addScaledVector(p.n,m*.45),_=p.p.clone().addScaledVector(p.n,m);J(e,{bone:l,pts:[h,g,_],w:[.026,.017,0],t:[.026,.017,0],across:new I(0,0,1),colors:[t.coat,r],name:`spike${s++}`})}}return e.marks={base:t.coat,marks:[{color:n,f:G(Y(e,`trunk`,`tailEnd`,`neck`,`head`),e=>e.p.y-.055)},{color:i,f:G(Y(e,`trunk`,`tailEnd`),e=>.24-e.p.y)}]},{aquatic:!0,legs:`none`,tendril:!0}},Os=(e,t)=>{let n=`#1f1d22`,r=`#26242a`;e.step=.03,e.joints.neck=[0,.86,.1],e.joints.shoulder=[.14,.6,0],e.joints.hip=[.065,.34,-.02],e.joints.tail=[0,.4,-.2],R(e,{belly:[[0,.47,-.04],[.165,.16,.2]],chest:[[0,.66,.06],[.09,.18,.09]],melt:.18}),W(e,{r:[.105,.1,.115],at:[0,.07,.04],melt:.12});let i=e.joints.neck,a=Bt(e,0,-.08,-.02),o=[[0,0,-.02],[0,-.008,.07],[0,-.03,.15],[0,-.07,.225],[0,-.125,.285],[0,-.19,.32]].map(e=>os(os(i,L(a)),e));return cs(e,`neck`,o,[.03,.026,.022,.019,.016,.013],`beak`),nn(e,{len:.34,w:.13,d:.035,fwd:-.05,out:.2}),V(e,{r0:.028,r1:.022,foot:[.045,.018,.08],fwd:.04}),Qt(e,`tail`,e.joints.tail,{len:.14,w:.09,d:.034,rot:[-(Math.PI/2+.5),0,0],name:`tailFan`}),U(e),kt(e,`backPlates`,`body`,[0,.48,-.16]),[-.05,-.025,0,.025,.05].forEach((t,n)=>{let i=1-Math.abs(t)*3+n%2*.08,a=[new I(t,.49,-.17),new I(t*1.3,.46,-.27),new I(t*1.6,.46-.08*i,-.27-.07*i),new I(t*1.8,.46-.17*i,-.28-.1*i)];J(e,{bone:`backPlates`,pts:a,w:[.02,.022,.015,0],t:[.008,.007,.005,0],across:new I(1,0,0),colors:[r,r,r],name:`plume${n}`})}),B(e,{x:.42,y:.12,size:.8,wide:1,slant:0,color:`#120e10`,ring:`#9a9aa4`,ringSize:1.45,out:.005}),e.nose=L(new I(...o[o.length-1]).sub(new I(...i))),e.marks={base:t.coat,marks:[{color:n,f:Y(e,/^beak/)},{color:n,f:Y(e,`head`)},{color:n,f:G(Y(e,`chest`),e=>.74-e.p.y)},{color:n,f:Y(e,/^leg/)},{color:r,f:G(Y(e,`armLPaw`,`armRPaw`),e=>e.p.y-.37)}]},{}},ks=(e,t)=>{let n=z(t.coat,`#fbeee0`,.6),r=z(t.coat,At,.55),i=z(t.coat,`#f4e2d0`,.25);e.step=.036,e.joints.neck=[0,.46,.06],e.joints.shoulder=[.22,.34,.08],e.joints.hip=[.1,.13,0],e.joints.tail=[0,.15,-.14],R(e,{belly:[[0,.28,0],[.27,.19,.17]],chest:[[0,.38,.02],[.24,.12,.15]],melt:.14}),W(e,{r:[.13,.085,.11],at:[0,0,.03],melt:.12});let a=Kt(e);H(e,{len:.16,r0:.045,r1:.04,paw:[.07,.06,.075],fwd:.55,out:.42});for(let t of e.paws??[]){let e=new l().setFromEuler(new v(...t.rot)),n=new I(...t.at),r=new I(0,0,1).applyQuaternion(e),i=new I(0,1,0).applyQuaternion(e);for(let[e,o,s]of[[.025,-.35,`Top`],[-.025,.3,`Low`]]){let c=n.clone().addScaledVector(r,t.r[2]*.75).addScaledVector(i,e);a.add(fn(t.bone,L(c),.042,.1,.042,{rot:[Math.PI/2+t.rot[0]+o,0,t.rot[2]],k:.04,round:.02,anchor:L(c),reach:.05,name:`pincer${s}${t.bone}`,thin:!0}))}}V(e,{r0:.04,r1:.032,foot:[.035,.02,.05],fwd:.02});let o=z(t.coat,At,.12);for(let n of[-1,1]){let r=n>0?`legL`:`legR`;[.07,0,-.07].forEach((i,a)=>{let s=[new I(n*.17,.22+a*.02,i),new I(n*.35,.19+a*.015,i*1.6),new I(n*.44,.015,i*2)];J(e,{bone:r,pts:s,w:[.03,.026,0],t:[.028,.022,0],across:new I(0,0,1),colors:[t.coat,o],name:`side${r}${a}`})})}U(e),q(e,{w:.2,y:-.45,curve:.09,r:.006});let s=new I(0,.12,.02);for(let t of[-1,1]){let n=t>0?`L`:`R`,r=Bt(e,t*.4,.62,-.015);kt(e,`stalk${n}`,`neck`,L(r));let a=s.clone().add(new I(t*.02,0,0));kt(e,`blink${n}`,`stalk${n}`,L(a));let o=Ht(e,`stalk${n}`,`stalk${n}`);vn(o,e.rnd,[0,0,0],L(a),.018,.015,i,{base:`limb5`}),un(o,e.rnd,{base:`ico1`,r:.034,pos:L(a),jitter:.04,color:i});let c=Ht(e,`eye${n}`,`stalk${n}`,{bone:`blink${n}`,eyes:!0}),l=Et(a.clone().add(new I(0,.004,.026)));un(c,e.rnd,{base:`ico1`,r:[.021,.023,.014],matrix:l,jitter:.02,color:Nt,tone:.1}),un(c,e.rnd,{base:`ico0`,r:.007,matrix:zt(l,[.006,.008,.011]),jitter:.01,color:`#fbf6ec`,tone:0})}e.blink=[`blinkL`,`blinkR`],Zo(e,`body`,[0,.3,0],[.27,.2,.17],48,e=>e.y>.1&&e.z<.25,.016,z(t.coat,`#fbeee0`,.42),`freckle`);let c=Bt(e,.4,.62).add(s);return e.eyeY=c.y,e.eyeX=c.x+.02,e.eyeR=.034,e.eyeZ=c.z+.035,e.marks={base:t.coat,marks:[{color:r,f:Y(e,/^pincer/)},{color:n,f:qo(e,[`belly`],0,.2,.17,.12)},{color:z(t.coat,At,.2),f:G(Y(e,/^leg/),e=>e.p.y-.06)}]},{aquatic:!0}},As=[[0,.62,-.78],[0,.02,-1],[0,-.6,-.8],[.66,.52,-.54],[-.66,.52,-.54],[.74,-.04,-.67],[-.74,-.04,-.67],[.64,-.58,-.5],[-.64,-.58,-.5]],js=(e,t)=>{let n=z(t.coat,`#b8c488`,.4),r=z(t.coat,`#2a2014`,.55),i=z(t.coat,`#e8c87a`,.18);e.joints.neck=[0,.56,.08],e.joints.shoulder=[.17,.44,.07],e.joints.hip=[.09,.13,-.01],e.joints.tail=[0,.14,-.2],R(e,{belly:[[0,.3,.01],[.2,.27,.17]],chest:[[0,.47,.04],[.16,.13,.14]],melt:.18});let a=Kt(e),o=new I(0,.35,-.07),s=new I(.27,.31,.19);a.add(K(`body`,L(o),L(s),{k:.03,name:`shell`})),a.add(K(`body`,[0,.35,.01],[.275,.315,.07],{k:.02,name:`shellRim`})),As.forEach(([e,t,n],r)=>{let i=new I(e,t,n).normalize(),c=o.clone().add(new I(i.x*s.x,i.y*s.y,i.z*s.z)),u=new I(i.x/s.x,i.y/s.y,i.z/s.z).normalize(),d=new v().setFromQuaternion(new l().setFromUnitVectors(new I(0,0,1),u));a.add(K(`body`,L(c.addScaledVector(u,-.006)),[.112,.112,.032],{rot:[d.x,d.y,d.z],k:.012,name:`scute${r}`}))});let c=a.shapes.flatMap((e,t)=>/^scute/.test(e.name??``)?[t]:[]);return W(e,{r:[.15,.135,.155],at:[0,.12,.08],melt:.1}),nn(e,{len:.3,w:.1,d:.03,taper:.7,fwd:.3,out:.38}),V(e,{r0:.055,r1:.05,foot:[.07,.022,.09]}),Lt(e,zo(.08,[0,-.5,-1],[0,0,0],.035,[1,.6])),U(e),B(e,{x:.42,y:.14,size:1.1,wide:1,slant:.05,color:`#120e10`,out:.006}),q(e,{w:.26,y:-.36,curve:.07,r:.006}),e.marks={base:n,marks:[{color:z(n,`#3a3020`,.22),f:Ko(e,`head`,[[12,0,.17],[38,38,.15],[38,-38,.15],[55,95,.14],[55,-95,.14],[42,180,.2]])},{color:r,f:G(Y(e,/^scute/),e=>{let t=1/0,n=1/0;for(let r of c){let i=e.dist(r);i<t?(n=t,t=i):i<n&&(n=i)}return n-t-.012})},{color:i,f:Y(e,/^scute/)},{color:z(i,r,.45),f:Y(e,`shell`)},{color:r,f:Y(e,`shellRim`)},{color:`#eadcb0`,f:qo(e,[`belly`,`chest`],0,.32,.15,.24)}]},{aquatic:!0}},Ms=(e,t)=>{let n=z(t.coat,`#e8dcc0`,.45),r=z(t.coat,At,.3),i=z(t.coat,At,.15),a=z(t.coat,`#bdf2ff`,.7);e.joints.neck=[0,.62,.08],e.joints.shoulder=[.15,.5,.1],e.joints.hip=[.12,.2,-.03],e.joints.tail=[0,.24,-.19],R(e,{belly:[[0,.34,-.02],[.22,.25,.21]],chest:[[0,.51,.05],[.17,.15,.16]],haunch:[[.13,.21,-.05],[.105,.14,.15]],melt:.18}),W(e,{r:[.15,.13,.16],at:[0,.1,.06],melt:.13});let o=bn(e,{dy:-.22,len:.09,ra:.115,rb:.088,drop:.015,squash:[1.08,.72,1]}),s=Kt(e),c=new I(...e.joints.neck).add(new I(...e.shape.hc));for(let e of[-1,1])s.add(K(`neck`,[e*.07,c.y+.06,c.z+.1],[.065,.03,.05],{k:.04,rot:[0,0,e*.32],name:e>0?`browL`:`browR`}));H(e,{len:.17,r0:.05,r1:.04,paw:[.042,.03,.045],fwd:.7,out:.32}),V(e,{r0:.085,r1:.07,foot:[.078,.034,.1]});let l=zo(.74,[0,-.42,-1],[.18,.5,0],.13,[1,.86,.7,.52,.34,.16]),u=Lt(e,l);U(e),B(e,{x:.46,y:.24,size:.75,wide:1.25,slant:.2,color:`#1a1210`,ring:`#f2c84a`,ringSize:1.35}),q(e,{w:.5,y:-.36,curve:.06,r:.006});let d=new I(...e.joints.neck);for(let t of[-1,1]){let n=new I(...o.nose).add(d).add(new I(t*.034,-.01,-.04)),r=yn(e,n,new I(t*.2,-1,.25));if(!r)continue;let i=new I(0,-1,.15).normalize();J(e,{bone:`neck`,pts:[r.p.clone().addScaledVector(i,-.012),r.p.clone().addScaledVector(i,.01),r.p.clone().addScaledVector(i,.027)],w:[.01,.008,0],t:[.007,.006,0],across:new I(1,0,0),colors:[`#fbf8f1`,`#fbf8f1`],name:`fang${t>0?`L`:`R`}`})}let f=[];kt(e,`backPlates`,`body`,[0,.42,-.06]);for(let e=.6;e>.3;e-=.065){let t=new I(0,.35*(e-.3),-1).normalize();f.push({at:new I(0,e,-.02),up:t,along:new I(0,1,.3),bone:`backPlates`,size:.75+(.6-e)*1.2})}let p=new I(...e.joints.tail),m=l.pts.length-1,h=Math.max(1,Math.round(m/3)),g=Math.max(h+1,Math.round(m*2/3));for(let e=1;e<m-1;e++){let t=new I(...l.pts[e]).add(p),n=new I(...l.pts[e+1]).add(p).clone().sub(t).normalize(),r=new I(0,1,0).addScaledVector(n,-n.y).normalize();f.push({at:t,up:r,along:n,bone:e<h?`tail`:e<g?`tail1`:`tail2`,size:.85*(1-e/m)+.3})}let _=0;f.forEach((t,n)=>{let r=new I().crossVectors(t.along,t.up).normalize();for(let o of[{off:0,tilt:0,scale:1},{off:-1,tilt:-.42,scale:.68},{off:1,tilt:.42,scale:.68}]){if(o.off&&n%2)continue;let s=t.up.clone().applyAxisAngle(t.along,o.tilt).normalize(),c=yn(e,t.at,s);if(!c)continue;let l=.13*t.size*o.scale*(1+_*7%5*.04),u=.055*t.size*o.scale,d=c.p.clone().addScaledVector(s,-.02),f=c.p.clone().addScaledVector(s,l*.35),p=c.p.clone().addScaledVector(s,l*.62),m=c.p.clone().addScaledVector(s,l).addScaledVector(t.along,-l*.18);J(e,{bone:t.bone,pts:[d,f,p,m],w:[u*.8,u,u*.62,0],t:[.013,.011,.008,0],across:t.along.clone().addScaledVector(r,o.off*.2),colors:[i,i,a],name:`plate${_++}`})}});let v=Mt(e,`head`);return e.marks={base:t.coat,marks:[{color:n,f:qo(e,[`belly`,`chest`],0,.38,.13,.25)},{color:n,f:G(Y(e,`head`,`muzzle`),e=>-v(e).y-.35,e=>-e.p.z+.5)},{color:r,f:G(Y(e,`belly`,`chest`,`haunchL`,`haunchR`),e=>e.p.z+.06)},{color:r,f:G(Y(e,/^tail\d/),e=>.04-(e.p.y-(p.y-.32*u(e.p))))},{color:r,f:Y(e,`browL`,`browR`)}]},{}},Ns=(e,t,n,r,i)=>{let a=Math.abs(e)-n+i,o=Math.abs(t)-r+i;return Math.hypot(Math.max(a,0),Math.max(o,0))+Math.min(Math.max(a,o),0)-i};function Ps(){let e=new w;e.moveTo(0,-.95),e.bezierCurveTo(-.25,-.62,-1,-.28,-1,.28),e.bezierCurveTo(-1,.82,-.36,1.02,0,.6),e.bezierCurveTo(.36,1.02,1,.82,1,.28),e.bezierCurveTo(1,-.28,.25,-.62,0,-.95);let t=Jt(),n=new ee(e,{depth:.3,curveSegments:t?2:4,bevelEnabled:!0,bevelThickness:.25,bevelSize:.16,bevelSegments:t?1:2});return n.translate(0,-.05,-.15),n.deleteAttribute(`uv`),n.deleteAttribute(`normal`),n}function Fs(e,t,n,r,i,a,o){let s=new l().setFromUnitVectors(new I(0,1,0),i.clone().normalize()),c=new lt().compose(r.clone().sub(sn(e,n)),s,new I(1,1,1));un(t,e.rnd,{base:`disc`,r:[a,a*.55,a],matrix:c,color:o})}var Is=(e,t)=>{let n={h:0,s:0,l:0};t.coat.getHSL(n,Be);let r=n.s<.22&&n.l>.45||n.l>.76?z(t.coat,`#2c3036`,.52):z(`#d8d2c6`,t.coat,.08),i=z(r,At,.4),a=`#8cf0ff`,o=(n.h<.05||n.h>.9)&&n.s>.35?`#f6cf4a`:`#e8443a`;e.step=.03,e.joints.neck=[0,.52,0],e.joints.shoulder=[.212,.41,0],e.joints.hip=[.085,.15,0],e.joints.tail=[0,.22,-.14];let s=Kt(e),c=[0,.3,0],u=[.18,.16,.145];s.add(gn(`body`,c,u,{round:.085,name:`chassis`})),e.shape.tc=c,e.shape.tr=u,e.shape.pear=0,e.front=u[2],e.seat=c[1]-u[1];let d=e.joints.neck,f=[0,.15,.01],p=[.2,.155,.165];e.shape.hr=p,e.shape.hc=f,e.headBend=void 0;let m=os(d,f);s.add(gn(`neck`,m,p,{round:.08,name:`head`})),s.add(tn(`neck`,[0,d[1]-.08,0],[0,d[1]+.03,0],.068,.068,{name:`post`}));for(let e of[-1,1])s.add(tn(`neck`,[e*(p[0]-.02),m[1]-.005,m[2]-.01],[e*(p[0]+.022),m[1]-.005,m[2]-.01],.056,.05,{k:.01,name:e>0?`discL`:`discR`}));s.add(K(`neck`,[0,m[1]+p[1]-.004,m[2]],[.042,.024,.042],{k:.012,name:`socket`})),H(e,{len:.16,r0:.036,r1:.032,paw:[.047,.045,.047],fwd:.2,out:.14});for(let e of[`armL`,`armR`])s.named(e).k=.015;for(let t of[-1,1]){let n=e.joints.shoulder;s.add(K(t>0?`armL`:`armR`,[t*(n[0]-.008),n[1],n[2]],[.054,.054,.054],{k:.012,name:t>0?`shoulderL`:`shoulderR`}))}for(let t of[-1,1]){let n=t>0?`legL`:`legR`,r=t*e.joints.hip[0];s.add(tn(n,[r,.19,0],[r,.07,.005],.042,.04,{k:.015,anchor:[r,.15,0],reach:.08,name:n})),s.add(gn(n,[r,.039,.025],[.064,.039,.09],{round:.032,k:.02,anchor:[r,.07,.005],reach:.07,name:`${n}Foot`}))}U(e);for(let t of e.paws??[]){let n=new l().setFromEuler(new v(...t.rot)),r=new I(...t.at),a=(e,t,i)=>r.clone().add(new I(e,t,i).applyQuaternion(n));for(let r of[-1,1])J(e,{bone:t.bone,pts:[a(r*.016,-.018,.012),a(r*.034,-.052,.018),a(r*.012,-.08,.016)],w:[.013,.011,0],t:[.009,.008,0],across:new I(0,0,1).applyQuaternion(n),colors:[i,i],name:`prong${t.bone}${r}`})}kt(e,`crest`,`neck`,[0,f[1]+p[1]-.03,f[2]]);let h=Ht(e,`crest`,`crest`);vn(h,e.rnd,[0,0,0],[0,.15,0],.011,.009,r,{base:`limb5`}),un(h,e.rnd,{base:`ico2`,r:.034,pos:[0,.163,0],color:o}),B(e,{x:.4,y:.14,size:1.45,wide:1,slant:0,color:a,blush:!1}),q(e,{w:.2,y:-.4,curve:.13,r:.0075,color:a});for(let t of[-1,1]){let n=Bt(e,t*.6,-.3,.001),r=new lt().compose(n,new l().setFromUnitVectors(new I(0,0,1),Rt(e,t*.6,-.3)),new I(1,1,1));un(e.head,e.rnd,{base:`ico1`,r:[.028,.016,.005],matrix:r,color:`#ff8fb0`})}let g=.315;un(e.torso,e.rnd,{base:Ps(),r:[.036,.036,.024],pos:[0,g,u[2]+.003],color:o});for(let[t,n]of[[-.072,.255],[.072,.255],[-.072,.375],[.072,.375]]){let r=yn(e,new I(t,n,0),new I(0,0,1));r&&Fs(e,e.torso,`body`,r.p,r.n,.013,i)}for(let t of[-1,1]){let n=yn(e,new I(t*.15,m[1]-.005,m[2]-.01),new I(t,0,0));n&&Fs(e,e.head,`neck`,n.p,n.n,.018,i)}let _=t=>Mt(e,`arm${t}Axis`),[y,b]=[_(`L`),_(`R`)];return e.marks={base:t.coat,marks:[{color:`#1a232e`,f:G(Y(e,`head`),e=>m[2]+p[2]-.035-e.p.z,e=>Ns(e.p.x,e.p.y-m[1]+.008,.152,.112,.045))},{color:r,f:Y(e,`discL`,`discR`,`socket`)},{color:i,f:Y(e,`post`)},{color:r,f:G(Y(e,`chassis`),e=>u[2]-.035-e.p.z,e=>Ns(e.p.x,e.p.y-g,.1,.088,.03))},{color:r,f:G(Y(e,`chassis`),e=>Math.abs(e.p.y-.19)-.022)},{color:i,f:dn(G(Y(e,`armL`,`foreL`),e=>Math.abs(y(e).y-.52)-.07),G(Y(e,`armR`,`foreR`),e=>Math.abs(b(e).y-.52)-.07))},{color:r,f:Y(e,`armL`,`foreL`,`armR`,`foreR`,`shoulderL`,`shoulderR`)},{color:r,f:Y(e,`legL`,`legR`)},{color:i,f:G(Y(e,`legLFoot`,`legRFoot`),e=>e.p.y-.016)}]},{}},Ls=(e,t)=>{let n=z(t.coat,`#f8e8d6`,.2),r=z(t.coat,`#e0707e`,.38),i=z(t.coat,`#d8606a`,.2),a=z(t.coat,`#3a1e1a`,.6),o=`#8cc65c`,s=`#5f9c48`;e.joints.neck=[0,.5,.02],e.joints.shoulder=[.105,.445,0],e.joints.hip=[.065,.2,0],e.joints.tail=[0,.2,-.13],e.step=.036,R(e,{belly:[[0,.31,.02],[.145,.145,.145]],chest:[[0,.43,-.005],[.1,.085,.085]],melt:.14}),W(e,{r:[.215,.195,.195],at:[0,.17,.03],melt:.1});let c=bn(e,{dy:-.2,len:.012,ra:.044,rb:.042,drop:.01});_n(e,{x:.88,y:.2,w:.05,h:.21,d:.034,splay:1.05,rake:.2,cup:.5,notch:!0}),H(e,{len:.21,r0:.03,r1:.026,paw:[.036,.07,.062],fwd:.12,out:.4});let u=Kt(e),d=(e.paws??[]).map(e=>{let t=e.at[0]>0?1:-1,n=new l().setFromEuler(new v(...e.rot)),r=new I(...e.at);return{...e,side:t,q:n,at:r,L:(e,t,i)=>r.clone().add(new I(e,t,i).applyQuaternion(n))}});for(let e of d){let t=[e.rot[0]-.5,0,e.rot[2]-e.side*.35];u.add(K(e.bone,L(e.L(-e.side*.012,.012,.055)),[.022,.034,.021],{rot:t,k:.025,anchor:L(e.at),reach:.09,name:`thumb${e.side>0?`L`:`R`}`}))}V(e,{r0:.038,r1:.032,foot:[.074,.04,.13],fwd:.075}),U(e),B(e,{x:.4,y:.04,size:1.45,wide:1,slant:0,color:`#1a1210`,ring:`#e2a93c`,ringSize:1.32}),q(e,{w:.32,y:-.52,curve:.13,r:.0065});let f=z(t.coat,`#5a3020`,.32);q(e,{w:.15,y:.44,curve:-.05,r:.0042,color:f}),q(e,{w:.1,y:.53,curve:-.04,r:.0038,color:f}),e.nose=c.nose;let p=new I(...e.joints.neck),m=Bt(e,.06,.97,-.02);kt(e,`crest`,`neck`,L(m));let h=m.clone().add(p),g=new I(.15,1,.1).normalize(),_=h.clone().addScaledVector(g,.11);J(e,{bone:`crest`,pts:[h.clone().addScaledVector(g,-.01),h.clone().addScaledVector(g,.06),_],w:[.009,.007,0],t:[.009,.007,0],across:new I(1,0,0),colors:[s,s],name:`sprout`});for(let t of[-1,1]){let n=new I(t,.3,-.1*t).normalize(),r=_.clone().addScaledVector(g,-.014),i=new I(-n.z,0,n.x).normalize();J(e,{bone:`crest`,pts:[r,r.clone().addScaledVector(n,.042).add(new I(0,.006,0)),r.clone().addScaledVector(n,.085).add(new I(0,.024,0))],w:[0,.025,0],t:[0,.006,0],across:i,colors:[o,o],name:`leaf${t}`})}let y=[],b=[];for(let t=0;t<=6;t++){let n=t/6,r=.3+.36*n,i=.74-.48*n+.08*Math.sin(n*Math.PI);y.push(Bt(e,r,i).add(p)),b.push(Rt(e,r,i))}J(e,{bone:`neck`,pts:y.map((e,t)=>e.clone().addScaledVector(b[t],t===0||t===y.length-1?-.002:.0014)),w:y.map((e,t)=>t===0||t===y.length-1?0:.0032),t:y.map((e,t)=>t===0||t===y.length-1?0:.0022),across:new I(1,0,0),colors:y.slice(1).map(()=>a),name:`seam`});for(let t of[1,2,3,4,5]){let n=y[t],r=b[t],i=y[t+1].clone().sub(y[t-1]).normalize(),o=new I().crossVectors(r,i).normalize(),s=n.clone().addScaledVector(o,-.016),c=n.clone().addScaledVector(o,.016);J(e,{bone:`neck`,pts:[s.addScaledVector(r,-.002),n.clone().addScaledVector(r,.002),c.addScaledVector(r,-.002)],w:[0,.003,0],t:[0,.0022,0],across:i,colors:[a,a],name:`stitch${t}`})}pn(e,{bone:`body`,from:new I(0,.32,.02),dir:new I(0,0,1),r:.011,stretch:1.3,color:z(t.coat,`#5a3020`,.38),sides:8,name:`navel`});for(let n of d)for(let r of[-.026,0,.026]){let i=[1.02,.8,.58,.4].map(t=>yn(e,n.at,new I(n.side*.02,-t*.07,r).applyQuaternion(n.q)));if(i.some(e=>!e))continue;let a=z(t.coat,At,.38),o=i.map((e,t)=>e.p.clone().addScaledVector(e.n.normalize(),t===0||t===i.length-1?-.002:.0014));J(e,{bone:n.bone,pts:o,w:[0,.0032,.0032,0],t:[0,.0022,.0022,0],across:new I(0,0,1).applyQuaternion(n.q),colors:[a,a,a],name:`finger${n.bone}${r}`})}let x=[`earL`,`earR`].map(t=>Yt(e,t));return e.marks={base:t.coat,marks:[{color:r,f:dn(...x.map(e=>e.inner))},{color:i,f:Y(e,`muzzle`)},{color:n,f:qo(e,[`belly`,`chest`],0,.31,.09,.09)}]},{}},Rs=(e,t)=>{let n=z(t.coat,`#f4ecdc`,.86),r=Tt(t.coat)>.68?z(t.coat,`#7a5a40`,.32):z(t.coat,`#fffcf4`,.9),i=z(n,t.coat,.4),a=z(n,t.coat,.14);e.joints.neck=[0,.43,.02],e.joints.shoulder=[.13,.34,.06],e.joints.hip=[.075,.13,0],e.joints.tail=[0,.15,-.14];let o=Kt(e),s=e.joints.neck,c=[-.14,0,0],u=new l().setFromEuler(new v(...c)),d=new I(0,s[1]+.28,s[2]-.04),f=[.34,.21,.32],p=K(`neck`,L(d),f,{rot:c,name:`cap`}),m=K(`neck`,L(d.clone().add(new I(0,-.14,0).applyQuaternion(u))),[.305,.13,.285],{rot:c,k:.05,carve:!0,name:`hollow`});o.add(p,m),R(e,{belly:[[0,.22,0],[.175,.2,.165]],chest:[[0,.36,.01],[.14,.11,.135]],melt:.2}),W(e,{r:[.165,.14,.155],at:[0,.08,.03],melt:.12}),o.add(tn(`neck`,[0,s[1]+.1,s[2]-.01],L(d.clone().add(new I(0,-.02,0).applyQuaternion(u))),.13,.1,{k:.06,name:`stemTop`})),H(e,{len:.15,r0:.04,r1:.034,paw:[.042,.036,.045],fwd:.4,out:.25}),V(e,{r0:.05,r1:.045,foot:[.062,.036,.08]}),U(e),B(e,{x:.4,y:0,size:1.15,wide:1,slant:0,color:`#1a1210`}),q(e,{w:.22,y:-.42,curve:.12,r:.006});let h=(e,t,n)=>d.clone().add(new I(e,t,n).applyQuaternion(u)),g=new I(0,-1,0).applyQuaternion(u);for(let t=0;t<24&&!Jt();t++){let n=(t+.5)/24*Math.PI*2,r=[.13,.2,.275].map(t=>{let r=t*Math.sin(n),i=t*Math.cos(n),a=-.14+.13*Math.sqrt(Math.max(0,1-(r/.305)**2-(i/.285)**2)),o=f[1]*Math.sqrt(Math.max(0,1-(r/f[0])**2-(i/f[2])**2));return yn(e,h(r,(a+o)/2,i),g)});if(r.some(e=>!e))continue;let i=r.reduce((e,t)=>e.add(t.n.normalize()),new I).normalize();J(e,{bone:`neck`,pts:r.map(e=>e.p.clone().addScaledVector(e.n,.004)),w:[0,.011,0],t:[0,.003,0],across:i,colors:[a,a],name:`gill${t}`})}let _=e=>Math.abs(m.d(e.p.x,e.p.y,e.p.z))-.012,y=e=>-m.d(e.p.x,e.p.y,e.p.z),b=Y(e,`cap`);return e.marks={base:n,marks:[{color:i,f:G(b,_)},{color:r,f:Ko(e,`cap`,[[0,0,.27],[40,0,.21],[44,72,.2],[44,-72,.2],[46,144,.21],[46,-144,.21],[74,36,.17],[74,-36,.17],[76,108,.17],[76,-108,.17],[76,180,.17]])},{color:t.coat,f:G(b,y)},{color:z(n,t.coat,.14),f:G(Y(e,/^leg/),e=>e.p.y-.05)}]},{}};function zs(e,t,n){let r=t.clone().normalize(),i=n.clone().addScaledVector(r,-n.dot(r)).normalize(),a=new I().crossVectors(r,i);return a.z>0&&a.negate(),{U:r,V:i,N:a,at:(t,n,o=0)=>e.clone().addScaledVector(r,t).addScaledVector(i,n).addScaledVector(a,o)}}var Bs=(e,t)=>{let n=z(t.coat,`#f8e4a8`,.66),r=z(n,t.coat,.4),i=z(t.coat,`#f4c860`,.55),a=`#f3e6c8`,o=z(t.coat,`#f8dca0`,.42);e.joints.neck=[0,.56,.05],e.joints.shoulder=[.16,.44,.13],e.joints.hip=[.11,.17,-.01],e.joints.tail=[0,.2,-.2],R(e,{belly:[[0,.3,-.01],[.25,.26,.23]],chest:[[0,.47,.04],[.18,.13,.16]],haunch:[[.13,.17,-.03],[.1,.1,.13]],melt:.2}),e.front+=.035,W(e,{r:[.2,.175,.185],at:[0,.13,.05],melt:.14});let s=bn(e,{dy:-.26,len:.08,ra:.11,rb:.085,drop:.02,squash:[1.15,.78,1]});_n(e,{x:.8,y:.32,w:.04,h:.085,d:.024,splay:1.2,rake:.25,notch:!0}),H(e,{len:.16,r0:.05,r1:.044,paw:[.046,.034,.048],fwd:.55,out:.32}),V(e,{r0:.072,r1:.062,foot:[.068,.034,.088]});let c=zo(.5,[0,-.45,-1],[.55,.3,0],.11,[1,.8,.6,.45,.32,.24]);Lt(e,c),U(e),B(e,{x:.42,y:.1,size:1.15,wide:1.1,slant:.12,color:`#1a1216`}),q(e,{w:.42,y:-.42,curve:.1,r:.0065}),e.nose=s.nose;let l=new I(...e.joints.neck);for(let n of[-1,1]){let r=Bo(e,[n*.032,s.nose[1]-.004,s.nose[2]-.01],.002);un(e.head,e.rnd,{base:`ico1`,r:[.011,.008,.006],pos:r,rot:[-.4,n*.4,0],color:z(t.coat,At,.65)})}for(let t of[-1,1]){let n=Bt(e,t*.4,.78,-.012).add(l),r=new I(t*.3,.8,-.5).normalize(),i=new I(0,-.3,-1).normalize(),o=[n.clone().addScaledVector(r,-.02),n.clone().addScaledVector(r,.035),n.clone().addScaledVector(r,.065).addScaledVector(i,.02),n.clone().addScaledVector(r,.078).addScaledVector(i,.058)];J(e,{bone:`neck`,pts:o,w:[.024,.02,.013,0],t:[.024,.02,.013,0],across:new I(1,0,0),colors:[a,a,a],name:`horn${t>0?`L`:`R`}`})}let u=[],d=l.clone().add(new I(...e.shape.hc));for(let e of[1,1.4,1.8]){let t=new I(0,Math.cos(e),-Math.sin(e));u.push({from:d,dir:t,along:new I(0,-Math.sin(e),-Math.cos(e)),bone:`neck`,size:.8})}kt(e,`backPlates`,`body`,[0,.4,-.08]);for(let e=.52;e>.28;e-=.07){let t=new I(0,.45*(e-.28),-1).normalize();u.push({from:new I(0,e,0),dir:t,along:new I(0,1,.2).normalize(),bone:`backPlates`,size:.9})}let f=new I(...e.joints.tail),p=c.pts.length-1,m=Math.max(1,Math.round(p/3)),h=Math.max(m+1,Math.round(p*2/3));for(let e=1;e<p-1;e++){let t=new I(...c.pts[e]).add(f),n=new I(...c.pts[e+1]).add(f).clone().sub(t).normalize(),r=new I(0,1,0).addScaledVector(n,-n.y).normalize();u.push({from:t,dir:r,along:n.negate(),bone:e<m?`tail`:e<h?`tail1`:`tail2`,size:.85-e/p*.45})}u.forEach((t,n)=>{let r=yn(e,t.from,t.dir);if(!r)return;let a=.075*t.size,o=.032*t.size,s=[r.p.clone().addScaledVector(t.dir,-.014),r.p.clone().addScaledVector(t.dir,a*.45),r.p.clone().addScaledVector(t.dir,a).addScaledVector(t.along,a*.3)];J(e,{bone:t.bone,pts:s,w:[o,o*.8,0],t:[.012,.01,0],across:t.along,colors:[i,i],name:`ridge${n}`})});{let t=new I(...c.pts[p]).add(f),n=t.clone().sub(new I(...c.pts[p-1]).add(f)).normalize(),r=new I(0,1,0).cross(n).normalize(),a=[-.012,.012,.035,.058,.08,.105].map(e=>t.clone().addScaledVector(n,e));J(e,{bone:`tail2`,pts:a,w:[.018,.04,.056,.05,.03,0],t:[.016,.014,.013,.012,.009,0],across:r,colors:[i,i,i,i,i],name:`spade`})}for(let n of[-1,1]){let r=n>0?`wingL`:`wingR`,i=yn(e,new I(n*.06,.47,0),new I(n*.45,.15,-1));if(!i)continue;let s=i.n.clone().normalize();kt(e,r,`body`,L(i.p.clone().addScaledVector(s,-.02)));let c=zs(i.p.clone().addScaledVector(s,-.006),new I(n*.5,.82,-.22),new I(n*.85,-.5,-.15)),l=c.at(.1,0),u=[c.at(.175,.035),c.at(.15,.1),c.at(.085,.135)],d=[c.at(0,0),c.at(.05,-.004),l,u[0],c.at(.13,.062),u[1],c.at(.088,.09),u[2],c.at(.03,.082),c.at(-.004,.06)];en(e,{bone:r,centre:c.at(.07,.05),rim:d,up:c.N,cup:.008,color:o,edge:z(o,t.coat,.45)}),[[[c.at(-.012,0),c.at(.05,-.002),l,u[0]],.011],[[l,c.at(.13,.05),u[1]],.007],[[l,c.at(.095,.07),u[2]],.007]].forEach(([n,i],a)=>{let o=n.length-1;J(e,{bone:r,pts:n,w:n.map((e,t)=>t===o?0:i*(1-t/o*.4)),t:n.map((e,t)=>t===o?0:i*.8),across:c.N,colors:n.slice(1).map(()=>t.coat),name:`${r}Bone${a}`})}),J(e,{bone:r,pts:[l,l.clone().addScaledVector(c.U,.008).addScaledVector(c.V,-.025)],w:[.006,0],t:[.005,0],across:c.N,colors:[a],name:`${r}Claw`})}let g=qo(e,[`belly`,`chest`],0,.3,.165,.235),_=.075;return e.marks={base:t.coat,marks:[{color:r,f:G(g,e=>{let t=(e.p.y-.09)/_;return Math.abs(t-Math.round(t))*_-.013},e=>e.p.y-.43)},{color:n,f:g},{color:n,f:G(Y(e,`muzzle`),e=>e.p.y-s.mid(e.p))}]},{wings:`flutter`}},Vs=(e,t,n)=>{let r=`#2a2326`,i=Tt(n)<.2?z(t.coat,`#f6e6b8`,.7):r,a=z(t.coat,`#fff6dc`,.5);e.joints.neck=[0,.47,.04],e.joints.shoulder=[.15,.4,.11],e.joints.hip=[.08,.15,0],e.joints.tail=[0,.16,-.2],R(e,{belly:[[0,.27,-.03],[.22,.22,.21]],chest:[[0,.42,.01],[.17,.1,.16]],melt:.16});let o=Kt(e);for(let e=0;e<10;e++){let t=e/10*Math.PI*2;o.add(K(`body`,[Math.sin(t)*.15,.445+e%2*.012,.02+Math.cos(t)*.145],[.058,.048,.058],{k:.04,name:`fluff${e}`}))}e.front+=.035,W(e,{r:[.205,.185,.185],at:[0,.15,.05],melt:.12}),H(e,{len:.14,r0:.034,r1:.03,paw:[.034,.028,.036],fwd:.5,out:.3}),V(e,{r0:.028,r1:.024,foot:[.031,.02,.04]}),U(e),B(e,{x:.42,y:.02,size:1.45,wide:1,slant:.05,color:`#1a1418`}),q(e,{w:.2,y:-.5,curve:.1,r:.006});let s=new I(...e.joints.neck);for(let t of[-1,1]){let n=t>0?`earL`:`earR`,i=Bt(e,t*.3,.86,-.012);kt(e,n,`neck`,L(i));let a=i.clone().add(s),o=[a.clone().add(new I(0,-.012,0)),a.clone().add(new I(t*.018,.06,.004)),a.clone().add(new I(t*.045,.115,.02)),a.clone().add(new I(t*.07,.15,.05))];J(e,{bone:n,pts:o,w:[.009,.008,.007,.006],t:[.009,.008,.007,.006],across:new I(1,0,0),colors:[r,r,r],name:`antenna${t>0?`L`:`R`}`}),un(Ht(e,`knob${t>0?`L`:`R`}`,n),e.rnd,{base:`ico2`,r:.024,pos:L(o[3].clone().sub(sn(e,n))),color:r})}{let t=yn(e,new I(0,.2,-.05),new I(0,-.45,-1));if(t){let n=new I(0,-.35,-1).normalize(),i=[t.p.clone().addScaledVector(n,-.014),t.p.clone().addScaledVector(n,.03),t.p.clone().addScaledVector(n,.058)];J(e,{bone:`tail`,pts:i,w:[.017,.009,0],t:[.017,.009,0],across:new I(1,0,0),colors:[r,r],name:`stinger`})}}for(let t of[-1,1]){let n=t>0?`wingL`:`wingR`,r=yn(e,new I(t*.04,.42,-.02),new I(t*.35,.3,-1));if(!r)continue;let i=r.n.clone().normalize();kt(e,n,`body`,L(r.p.clone().addScaledVector(i,-.012)));let a=r.p.clone().addScaledVector(i,-.004),o=[[new I(t*.6,.78,-.15),.115,.004,.115,.05,0],[new I(t*.95,.15,-.2),.08,.004,.08,.034,.01]];for(let[r,i,s,c,l,u]of o){let o=zs(a,r,new I(t*.4,-1,-.1)),d=[];for(let e=0;e<14;e++){let t=e/14*Math.PI*2;d.push(o.at(i+Math.cos(t)*c,s+Math.sin(t)*l,u))}en(e,{bone:n,centre:o.at(i,s,u),rim:d,up:o.N,cup:.004,color:`#f6fbff`,edge:`#a9c0dc`,glass:!0})}}let c=Jt()?[[-1,.1],[.19,.29]]:[[-1,.09],[.15,.21],[.27,.33]];return e.marks={base:t.coat,marks:[{color:a,f:Y(e,/^fluff/)},{color:i,f:G(Y(e,`belly`,`chest`),e=>Math.min(...c.map(([t,n])=>Math.max(t-e.p.y,e.p.y-n))))},{color:r,f:Y(e,/^arm/,/^fore/,/^leg/)}]},{hover:.22,wings:`buzz`}},Hs=(e,t)=>{let n=z(t.coat,`#f6f2d6`,.58),r=z(t.coat,`#1e2a18`,.28),i=z(t.coat,`#fbf8e8`,.72);e.joints.neck=[0,.5,.07],e.joints.shoulder=[.13,.41,.09],e.joints.hip=[.1,.16,-.04],e.joints.tail=[0,.2,-.17],R(e,{belly:[[0,.29,-.03],[.175,.215,.19]],chest:[[0,.42,.03],[.135,.12,.14]],melt:.18});let a=[0,.1,.07];W(e,{r:[.165,.15,.18],at:a,melt:.12});let o=bn(e,{dy:-.18,len:.07,ra:.1,rb:.07,drop:.02,squash:[1,.85,1]}),s=Kt(e),c=os(e.joints.neck,a),u=[0,c[1]+.06,c[2]-.08];s.add(fn(`neck`,u,.06,.2,.085,{rot:[-.5,0,0],k:.035,anchor:u,reach:.12,round:.045,name:`casque`})),H(e,{len:.18,r0:.04,r1:.034,paw:[.046,.026,.046],fwd:.45,out:.32}),V(e,{r0:.05,r1:.04,foot:[.054,.028,.066]});let d=[[0,0,.02],[0,-.004,-.07]],f=[.062,.052],p=1.55*Math.PI;for(let e=0;e<=9;e++){let t=e/9*p,n=.1*Math.exp(-.18*t);d.push([t/Math.PI*.012,-.1+n*Math.cos(t),-.16-n*Math.sin(t)]),f.push(.044-e/9*.027)}let m=Lt(e,{pts:d,radii:f});U(e),q(e,{w:.5,y:-.36,curve:.08,r:.006}),e.nose=o.nose;let h=new I(0,0,1),g=new I;for(let n of[-1,1]){let r=n>0?`L`:`R`,i=Bt(e,n*.6,.16),a=Rt(e,n*.6,.16).add(new I(0,.12,.3)).normalize();kt(e,`turret${r}`,`neck`,L(i.clone().addScaledVector(a,-.02)));let o=new l().setFromUnitVectors(h,a),s=new I(1,1,1);un(Ht(e,`turret${r}`,`turret${r}`),e.rnd,{base:`ico2`,r:[.064,.064,.054],matrix:new lt().compose(a.clone().multiplyScalar(.02),o,s),bend:e=>{e.z>0&&(e.x*=1-.2*e.z,e.y*=1-.2*e.z)},color:t.coat});let c=a.clone().multiplyScalar(.074);kt(e,`blink${r}`,`turret${r}`,L(c));let u=Ht(e,`eye${r}`,`turret${r}`,{bone:`blink${r}`,eyes:!0}),d=new lt().compose(c.clone().addScaledVector(a,-.004),o,s);un(u,e.rnd,{base:`ico2`,r:[.03,.03,.01],matrix:zt(d,[0,0,-.004]),color:`#d8ac3a`,tone:.05}),un(u,e.rnd,{base:`ico2`,r:[.021,.021,.012],matrix:d,color:Nt,tone:.1}),un(u,e.rnd,{base:`ico1`,r:[.007,.007,.004],matrix:zt(d,[.007,.008,.01]),color:`#fffdf8`,tone:0}),g=i.clone().addScaledVector(a,.05)}return e.blink=[`blinkL`,`blinkR`],e.eyeY=g.y,e.eyeX=Math.abs(g.x),e.eyeR=.04,e.eyeZ=g.z+.02,Yo(e,`body`,[0,.3,-.03],[[2,.35,.02],[1.7,.1,.022],[1.4,.45,.018],[1.1,.15,.022],[.8,.42,.017]],i,`spot`),e.marks={base:t.coat,marks:[{color:n,f:qo(e,[`belly`,`chest`],0,.3,.12,.22)},{color:r,f:G(Y(e,/^tail\d/),e=>.6-Math.sin(m(e.p)*Math.PI*7))},{color:n,f:G(Y(e,`muzzle`,`head`),e=>e.p.y-(o.mid(e.p)-.01),e=>-e.p.z+c[2]+.05)}]},{swivel:!0,shifts:!0}},Us=(e,t)=>{let n=z(t.coat,`#f2eee6`,.86),r=Tt(t.coat)>.6?z(t.coat,`#6a7a90`,.3):z(t.coat,`#f6f3ec`,.8),i=z(t.coat,`#1a2236`,.28),a=z(t.coat,`#1a2236`,.1);e.joints.neck=[0,.52,.05],e.joints.shoulder=[.21,.42,.07],e.joints.hip=[.11,.15,-.02],e.joints.tail=[0,.2,-.19];let o=[0,.29,-.02];R(e,{belly:[o,[.25,.27,.22]],chest:[[0,.46,.03],[.225,.16,.2]],melt:.2});let s=[0,.11,.06],c=[.3,.165,.25];W(e,{r:c,at:s,melt:.2});let l=os(e.joints.neck,s),u=Kt(e);u.add(K(`neck`,[0,l[1]-.035,l[2]+.1],[.27,.12,.17],{k:.08,name:`jaw`})),nn(e,{len:.3,w:.1,d:.04,taper:.62,fwd:.25,out:.62}),V(e,{r0:.065,r1:.055,foot:[.065,.035,.085]});let d=zo(.3,[0,-.15,-1],[.3,0,0],.11,[1,.8,.58,.42]),f=Lt(e,d),p=new I(...e.joints.tail),m=os(e.joints.tail,d.pts[d.pts.length-1]),h=(e,t,n)=>{for(let r=0;r+1<e.length;r++)u.add(tn(`tail2`,os(m,e[r]),os(m,e[r+1]),t[r],t[r+1],{k:r===0?.04:.02,anchor:m,reach:.1,name:`${n}${r}`,squash:[.34,1,1],thin:!0}))};h([[0,0,0],[0,.1,-.035],[0,.19,-.09],[0,.26,-.17]],[.07,.06,.042,.014],`finUp`),h([[0,0,0],[0,-.06,-.05],[0,-.095,-.12]],[.06,.042,.014],`finDown`),kt(e,`backPlates`,`body`,[0,.36,-.2]),Qt(e,`backPlates`,[0,.36,-.2],{len:.13,w:.028,d:.07,rot:[-1.6,0,0],name:`dorsal`,melt:.05});let g=(t,n)=>yn(e,new I(0,n,o[2]),new I(Math.sin(t),0,-Math.cos(t)));U(e),B(e,{x:.62,y:.1,size:.62,wide:1,slant:0,color:`#141018`}),q(e,{w:.68,y:-.3,curve:.12,r:.009}),e.nose=L(Bt(e,0,-.12));let _=new Zt(u),v=Y(e,`belly`,`chest`),y=(e,t=.005)=>v(_.set(e.x,e.y,e.z))<-t;for(let t of[-1.1,-.55,.55,1.1]){let n=[];for(let e=.55;e>.17;e-=.055){let r=g(t,e);r&&y(r.p)&&n.push(r.p)}let r=n.map((e,t)=>t===0||t===n.length-1?0:.022);J(e,{bone:`body`,pts:n,w:r,t:r.map(e=>e*.55),across:new I(Math.cos(t),0,Math.sin(t)),colors:n.slice(1).map(()=>a),name:`ridge${t>0?`L`:`R`}${+(Math.abs(t)>.8)}`})}for(let t of[.25,.35,.45]){let n=[[]];for(let e=-1.45;e<1.5;e+=.1){let r=g(e,t);r&&y(r.p)?n[n.length-1].push(r.p):n.push([])}for(let t of n)qt(e,{bone:`body`,pts:t,w:.0075,color:r})}[.2,.3,.4,.5].forEach((t,n)=>{for(let i of[-1.36,-.83,-.27,.27,.83,1.36]){let a=g(i,t);a&&y(a.p,.03)&&pn(e,{bone:`body`,from:new I(0,t,o[2]),dir:new I(Math.sin(i),0,-Math.cos(i)),r:.028,color:r,sides:9,name:`spot${n}_${i}`})}}),Zo(e,`neck`,l,c,80,e=>e.y>.28&&e.z<.82,.022,r,`headSpot`,9);let b=[];if(Jt()){for(let t of ss(26)){let n=t.y>.3&&t.z<.8&&yn(e,new I(...l),new I(t.x*c[0],t.y*c[1],t.z*c[2]));n&&b.push(n.p)}for(let e of[.25,.43])for(let t of[-1.2,-.45,.45,1.2]){let n=g(t,e);n&&b.push(n.p)}}let x=Mt(e,`head`);return e.marks={base:t.coat,marks:[{color:n,f:qo(e,[`belly`,`chest`],0,.3,.19,.29)},{color:n,f:G(Y(e,`head`,`jaw`),e=>-x(e).z,e=>x(e).y-(-.34+.12*x(e).x**2))},{color:n,f:G(Y(e,/^leg/),e=>e.p.y-.03)},{color:n,f:G(Y(e,/^tail\d/),e=>e.p.y-(p.y+(m[1]-p.y)*f(e.p))+.02)},{color:i,f:Y(e,`dorsal`,/^finUp/,/^finDown/)},{color:r,f:e=>Math.min(...b.map(t=>e.p.distanceTo(t)))-.045}]},{aquatic:!0}};function Ws(e,t){let n=e.clone().normalize(),r=new I().crossVectors(n,t).normalize(),i=new I().crossVectors(r,n),a=new v().setFromRotationMatrix(new lt().makeBasis(r,n,i));return[a.x,a.y,a.z]}var Gs=[[.47,.035,.15,.14],[.4,.01,.162,.152],[.33,-.015,.168,.158],[.26,-.03,.165,.155],[.19,-.036,.152,.142]];function Ks(e,t,n){let r=t.map(t=>Mt(e,t));return e=>{let t=1/0;for(let n=0;n+1<r.length;n++){let i=r[n](e).y,a=r[n+1](e).y;i*a<.04&&(t=Math.min(t,Math.abs(i+a)*.5))}return t-n}}var qs={raccoon:Wo,fox:Vo,snail:Go,wolf:xs,bear:Ss,deer:ms,hedgehog:us,panda:vs,penguin:ns,otter:ys,frog:as,axolotl:ds,shark:$o,octopus:ts,duck:rs,platypus:_s,capybara:bs,redpanda:Cs,quokka:ws,sloth:hs,seal:gs,highland:ps,squid:ls,bat:is,jellyfish:es,gecko:fs,ferret:Ts,dugong:Es,seacucumber:Ds,ibis:Os,crab:ks,turtle:js,kaiju:Ms,robot:Is,homunculus:Ls,fungi:Rs,dragon:Bs,bee:Vs,chameleon:Hs,whaleshark:Us,prawn:(e,t)=>{let n=z(t.coat,`#fff3e8`,.3),r=z(t.coat,`#4a2028`,.3);e.step=.034,e.joints.neck=[0,.5,.04],e.joints.shoulder=[.13,.43,.07],e.joints.hip=[.075,.13,0],e.joints.tail=[0,.17,-.12],R(e,{belly:[[0,.27,-.03],[.13,.17,.12]],chest:[[0,.42,.015],[.125,.11,.115]],melt:.14});let i=Kt(e),a=Gs.map(([e,t,n,r],a)=>(i.add(K(`body`,[0,e,t],[n,.05,r],{rot:[.06*a,0,0],k:.012,name:`band${a}`})),`band${a}`));e.shape.tr=[.168,e.shape.tr[1],.165],e.front=(e.front??0)+.03,W(e,{r:[.19,.165,.185],at:[0,.12,.04],melt:.1}),H(e,{len:.19,r0:.034,r1:.03,paw:[.036,.032,.046],fwd:.55,out:.32}),V(e,{r0:.04,r1:.034,foot:[.042,.022,.06],fwd:.025});let o=zo(.2,[0,-.35,-1],[.85,0,0],.075,[1,.86,.72,.6]);Lt(e,o);let s=new I(...e.joints.tail),c=o.pts.length-1,u=e=>new I(...o.pts[Math.min(c,Math.floor(e))]).lerp(new I(...o.pts[Math.min(c,Math.floor(e)+1)]),e%1).add(s),d=new I(1,0,0),f=[1.8,5.2].map((e,t)=>{let n=u(e+.5).sub(u(e-.5)).normalize(),r=.09-t*.014;return i.add(K(e<c/3?`tail`:e<c*2/3?`tail1`:`tail2`,L(u(e)),[r,.034,r*.9],{rot:Ws(n,new I(0,1,0)),k:.012,name:`ring${t}`})),`ring${t}`}),p=u(c),m=u(c).sub(u(c-1)).normalize(),h=new I().crossVectors(d,m).normalize();for(let e of[-1.1,-.55,0,.55,1.1]){let t=d.clone().multiplyScalar(Math.cos(.45)).addScaledVector(h,Math.sin(.45)*Math.sign(e)),n=m.clone().multiplyScalar(Math.cos(e)).addScaledVector(t,Math.sin(e)),r=p.clone().addScaledVector(n,-.02);e===0?i.add(fn(`tail2`,L(r),.055,.19,.022,{rot:Ws(n,h),k:.02,anchor:L(p),reach:.06,round:.012,name:`fan0`,thin:!0})):i.add(K(`tail2`,L(r.addScaledVector(n,.105)),[.056,.11,.024],{rot:Ws(n,new I().crossVectors(t,m)),k:.02,anchor:L(p),reach:.06,name:`fan${e>0?`L`:`R`}${Math.abs(e)>.7?2:1}`,thin:!0}))}U(e),q(e,{w:.22,y:-.4,curve:.08,r:.006}),e.nose=L(Bt(e,0,-.2));let g=new I(0,.06,.05);for(let n of[-1,1]){let r=n>0?`L`:`R`,i=Bt(e,n*.4,.3,-.015);kt(e,`stalk${r}`,`neck`,L(i));let a=g.clone().add(new I(n*.035,0,0));kt(e,`blink${r}`,`stalk${r}`,L(a));let o=Ht(e,`stalk${r}`,`stalk${r}`);vn(o,e.rnd,[0,0,0],L(a),.021,.018,t.coat,{base:`limb5`});let s=Ht(e,`eye${r}`,`stalk${r}`,{bone:`blink${r}`,eyes:!0}),c=Et(a);un(s,e.rnd,{base:`ico2`,r:[.036,.038,.034],matrix:c,color:Nt,tone:.1}),un(s,e.rnd,{base:`ico1`,r:[.012,.012,.006],matrix:zt(c,[.011,.015,.029]),color:`#fffdf8`,tone:0}),un(s,e.rnd,{base:`ico1`,r:[.005,.005,.003],matrix:zt(c,[-.012,-.011,.031]),color:`#fffdf8`,tone:0})}e.blink=[`blinkL`,`blinkR`];let _=Bt(e,.4,.3).add(g);e.eyeY=_.y,e.eyeX=_.x+.035,e.eyeR=.038,e.eyeZ=_.z+.034;let y=new I(...e.joints.neck),b=Bt(e,0,.38,-.02).add(y),x=[b,b.clone().add(new I(0,.028,.065)),b.clone().add(new I(0,.05,.135)),b.clone().add(new I(0,.07,.2))];J(e,{bone:`neck`,pts:x,w:[.016,.013,.008,0],t:[.03,.022,.012,0],across:d,colors:[t.coat,t.coat,r],name:`rostrum`}),[.35,.6,.82].forEach((n,r)=>{let i=x[0].clone().lerp(x[3],n),a=.03*(1-n)+.004;J(e,{bone:`neck`,pts:[i.clone().add(new I(0,a-.01,-.01)),i.clone().add(new I(0,a+.013,.008))],w:[.005,0],t:[.008,0],across:d,colors:[t.coat],name:`rostrumTooth${r}`})});let S=[[0,0,0],[.04,.005,.02],[.11,.035,.005],[.19,.075,-.05],[.265,.08,-.16],[.32,.03,-.3],[.355,-.09,-.45],[.365,-.26,-.56],[.36,-.45,-.61]];for(let n of[-1,1]){let r=`feeler${n>0?`L`:`R`}`,i=Bt(e,n*.58,.14,-.015);kt(e,r,`neck`,L(i));let a=i.add(y),o=new fe(S.map(([e,t,r])=>a.clone().add(new I(n*e,t,r)))).getSpacedPoints(16),s=o.map((e,t)=>t===16?0:.0075-t/16*.0045);for(let n=0;n<4;n++){let i=n*4;J(e,{bone:r,pts:o.slice(i,i+5),w:s.slice(i,i+5),t:s.slice(i,i+5),across:new I(0,1,0),colors:[t.coat,t.coat,t.coat,t.coat],name:`${r}${n}`})}}for(let n of e.paws??[]){let i=new l().setFromEuler(new v(...n.rot)),a=new I(...n.at),o=new I(0,0,1).applyQuaternion(i),s=new I(0,1,0).applyQuaternion(i),c=new I(1,0,0).applyQuaternion(i);for(let i of[1,-1]){let l=(e,t)=>a.clone().addScaledVector(o,e).addScaledVector(s,t*i);J(e,{bone:n.bone,pts:[l(.005,.012),l(.045,.02),l(.075,.016),l(.095,.004)],w:[.017,.015,.011,0],t:[.014,.012,.009,0],across:c,colors:[t.coat,t.coat,r],name:`claw${n.bone}${i>0?`Top`:`Low`}`})}}for(let n=0;n<4;n++){let r=.43-n*.07;for(let i of[-1,1]){let a=yn(e,new I(i*.05,r,0),new I(i*.4,-.1,1));if(!a)continue;let o=a.p.clone().addScaledVector(a.n,-.015),s=a.p.clone().add(new I(i*.025,.012,.035)),c=s.clone().add(new I(i*.008,-.055,.01)),l=c.clone().add(new I(0,-.008,.004));J(e,{bone:`body`,pts:[o,s,c,l],w:[.012,.011,.009,0],t:[.011,.01,.008,0],across:d,colors:[t.coat,t.coat,t.coat],name:`walker${i>0?`L`:`R`}${n}`})}}return e.marks={base:t.coat,marks:[{color:r,f:G(Y(e,...a,`belly`,`chest`),Ks(e,a,.2))},{color:r,f:G(Y(e,...f,/^tail\d/),Ks(e,f,.16))},{color:n,f:qo(e,a,0,.3,.1,.2)},{color:r,f:Y(e,/^fan/)}]},{aquatic:!0}},meerkat:(e,t)=>{let n=z(t.coat,`#f7ecd6`,.62),r=z(t.coat,`#2c2019`,.8),i=z(t.coat,`#3a2a1e`,.22);e.joints.neck=[0,.66,.05],e.joints.shoulder=[.1,.55,.07],e.joints.hip=[.08,.16,-.02],e.joints.tail=[0,.17,-.14],R(e,{belly:[[0,.3,-.01],[.165,.27,.155]],chest:[[0,.53,.03],[.12,.15,.12]],melt:.22}),W(e,{r:[.15,.135,.15],at:[0,.11,.05],melt:.1});let a=bn(e,{dy:-.24,len:.1,ra:.075,rb:.03,drop:.035,squash:[1.05,.85,1],thin:!0});_n(e,{x:.86,y:.3,w:.042,h:.05,d:.022,round:!0,splay:1.1,rake:.05,turn:.3}),H(e,{len:.17,r0:.034,r1:.028,paw:[.032,.026,.036],fwd:.6,out:.12}),V(e,{r0:.05,r1:.04,foot:[.045,.024,.08]});let o=Lt(e,zo(.44,[0,-.75,-1],[.6,0,0],.045,[1,.85,.7,.55,.4]));U(e),B(e,{x:.42,y:.14,size:.95,wide:1,slant:.05,color:`#120d0b`}),Vt(e,`#2a1f1a`,Bo(e,a.nose),.02,.016),bt(e,t.coat,{len:.07}),q(e,{w:.12,y:-.52,curve:.06,r:.0055});let s=Mt(e,`head`);return e.marks={base:t.coat,marks:[{color:r,f:Y(e,`earL`,`earR`)},{color:r,f:G(Y(e,`head`,`muzzle`),e=>{let t=s(e);return Pt(Math.abs(t.x),t.y,.42,.18,.62,-.14).d-.2+ +(t.z<.1)})},{color:n,f:Y(e,`muzzle`)},{color:n,f:G(Y(e,`head`),e=>.25-s(e).z)},{color:n,f:qo(e,[`belly`,`chest`],0,.36,.12,.34)},{color:i,f:G(Y(e,`belly`,`chest`),e=>{let t=(e.p.y+.015*Math.sin(e.p.x*30))/.065;return Math.max(Math.abs(t-Math.round(t))-.2,e.p.z+.05,Math.abs(e.p.y-.32)-.15)*.1})},{color:z(t.coat,r,.35),f:Y(e,`armLPaw`,`armRPaw`,`legLFoot`,`legRFoot`)},{color:r,f:G(Y(e,/^tail\d/),e=>.78-o(e.p))}]},{}},skeleton:(e,t)=>{let n=Tt(t.coat)<.08,r=n?z(t.coat,`#efe8f4`,.62):z(t.coat,`#1c1522`,.86),i=n?z(t.coat,`#efe8f4`,.42):z(t.coat,`#3a3040`,.84),a=n?z(t.coat,`#efe8f4`,.32):z(t.coat,`#3c3048`,.62);e.joints.neck=[0,.56,0],e.joints.shoulder=[.15,.5,0],e.joints.hip=[.075,.17,0],e.joints.tail=[0,.2,-.1],e.step=.03;let o=Kt(e),s=e.joints.neck;o.add(K(`body`,[0,.42,.01],[.15,.135,.125],{name:`ribs`})),o.add(tn(`body`,[0,.33,-.03],[0,.21,-.03],.042,.042,{k:.03,name:`spine`})),o.add(K(`body`,[0,.205,-.005],[.115,.052,.08],{k:.035,name:`pelvis`})),o.add(tn(`neck`,[0,s[1]-.09,-.02],[0,s[1]+.04,-.01],.036,.036,{k:.03,name:`neckBone`})),e.shape.tc=[0,.36,0],e.shape.tr=[.15,.2,.125],e.shape.pear=0,e.front=.135,e.seat=.14,W(e,{r:[.205,.19,.19],at:[0,.18,.01],melt:.05});let c=os(s,e.shape.hc);for(let e of[-1,1])o.add(K(`neck`,[e*.11,c[1]-.09,c[2]+.1],[.06,.045,.06],{k:.04,name:e>0?`cheekL`:`cheekR`}));o.add(K(`neck`,[0,c[1]-.14,c[2]+.06],[.12,.07,.11],{k:.05,name:`jaw`})),H(e,{len:.2,r0:.026,r1:.022,paw:[.03,.034,.028],fwd:.2,out:.2});for(let e of[`armL`,`armR`])o.named(e).k=.015;V(e,{r0:.03,r1:.026,foot:[.045,.026,.075],fwd:.04});let u=e.elbow??.1;for(let t of[-1,1]){let n=t>0?`L`:`R`,r=[t*e.joints.shoulder[0],e.joints.shoulder[1],e.joints.shoulder[2]];o.add(K(`arm${n}`,r,[.04,.04,.04],{k:.015,name:`shoulder${n}`}));let i=new l().setFromEuler(new v(...e.bind.armL.map((e,n)=>n===2?e*t:e))),a=new I(0,-u,0).applyQuaternion(i).add(new I(...r));o.add(K(`fore${n}`,L(a),[.032,.032,.032],{k:.02,name:`elbow${n}`})),o.add(K(`leg${n}`,[t*e.joints.hip[0],.1,e.joints.hip[2]+.005],[.035,.035,.035],{k:.02,name:`knee${n}`}))}U(e),B(e,{x:.36,y:.04,size:1.45,wide:1,slant:0,color:`#120e16`}),q(e,{w:.28,y:-.5,curve:.1,r:.0055,color:r});let d=new I(...s);for(let t=-3;t<=3;t++){let n=t/3.5*.28,i=-.5+.1*(n/.28)**2,a=Bt(e,n,i).add(d),o=Rt(e,n,i);J(e,{bone:`neck`,pts:[a.clone().add(new I(0,.022,0)).addScaledVector(o,-.002),a.clone().addScaledVector(o,.002),a.clone().add(new I(0,-.022,0)).addScaledVector(o,-.002)],w:[0,.0032,0],t:[0,.0022,0],across:new I(1,0,0),colors:[r,r],name:`tooth${t}`})}for(let n of e.paws??[]){let r=new l().setFromEuler(new v(...n.rot)),i=new I(...n.at),a=(e,t,n)=>i.clone().add(new I(e,t,n).applyQuaternion(r));for(let i of[-1,0,1])J(e,{bone:n.bone,pts:[a(0,-.015,i*.016),a(.004,-.045,i*.02+.006),a(0,-.068,i*.022+.012)],w:[.008,.007,0],t:[.008,.007,0],across:new I(0,0,1).applyQuaternion(r),colors:[t.coat,t.coat],name:`finger${n.bone}${i}`})}for(let t of[.345,.4,.455])for(let n of[-1,1]){let r=[.28,.6,.95,1.3,1.65,2,2.35,2.7].map(r=>yn(e,new I(0,t,.01),new I(n*Math.sin(r),-.28*Math.sin(r),Math.cos(r)))?.p);r.every(Boolean)&&qt(e,{bone:`body`,pts:r,w:.0095,color:a})}let f=e=>{let t=(e.p.y-.33+.9*e.p.x*e.p.x)/.06;return Math.max(Math.abs(t-Math.floor(t)-.5)-.18,.03-Math.abs(e.p.x),e.p.y-.48)},p=Mt(e,`head`),m=t=>G(Y(e,`head`),e=>{let n=p(e);return n.z<0?1:t(n)});return e.marks={base:t.coat,marks:[{color:i,f:m(e=>Math.hypot(Math.abs(e.x)-.36,e.y-.04)-.33)},{color:r,f:m(e=>Math.hypot(Math.abs(e.x)-.045,e.y+.2)-.06+Math.max(0,e.y+.2)*.4)},...Jt()?[{color:a,f:G(Y(e,`ribs`),f)}]:[]]},{}},pony:(e,t)=>{let n=z(t.coat,`#a07c66`,.32),r=z(t.coat,`#141010`,.6),i=Tt(t.coat)>.3,a=i?z(t.coat,`#4a3426`,.45):z(t.coat,`#0c0807`,.35),o=i?z(t.coat,`#6a4a32`,.3):z(t.coat,`#8a5a34`,.24);e.joints.neck=[0,.6,.07],e.joints.shoulder=[.13,.48,.12],e.joints.hip=[.1,.19,-.05],e.joints.tail=[0,.3,-.21],e.step=.03,R(e,{belly:[[0,.33,-.04],[.215,.215,.205]],chest:[[0,.48,.05],[.16,.14,.15]],haunch:[[.11,.21,-.07],[.1,.12,.14]],melt:.2});let s=[0,.12,.06],c=[.17,.155,.16];W(e,{r:c,at:s,melt:.1});let u=bn(e,{dy:-.3,len:.125,ra:.1,rb:.088,drop:.085,squash:[.94,1,1]});_n(e,{x:.56,y:.8,w:.052,h:.14,d:.03,splay:.4,rake:.05,cup:.5,notch:!0}),H(e,{len:.25,r0:.062,r1:.054,paw:[.052,.046,.056],fwd:.3,out:.14}),V(e,{r0:.072,r1:.062,foot:[.058,.048,.064]});let d=Kt(e),f=os(e.joints.neck,s),p=0,m=new I(0,1,0),h=(e,t,n,r,i=1.5,a=`hair`)=>{let o=new I(...n).normalize(),s=new v().setFromQuaternion(new l().setFromUnitVectors(m,o)),c=[s.x,s.y,s.z],u=p++,f=`${a}${u*37%7<2?`Hi`:``}${u}`;d.add(K(e,t,[r,r*i,r*.9],{rot:c,k:.012,name:f}));let h=new I().crossVectors(o,new I(.3,.2,1)).normalize().multiplyScalar(r*(u%2?.55:-.55)),g=new I(...t).addScaledVector(o,r*i*.55).add(h);d.add(K(e,L(g),[r*.62,r*.85,r*.62],{rot:c,k:.01,name:`${f}b`}))},g=(e,t,n,r=.9)=>{let i=new I(e,t,n).normalize();return[f[0]+i.x*c[0]*r,f[1]+i.y*c[1]*r,f[2]+i.z*c[2]*r]};for(let e of[-.32,0,.32]){let t=1-Math.abs(e)*2;h(`neck`,g(e,1,.2,1.02),[e*.4,.3,1],.06,1.1),h(`neck`,g(e*1.1,.8,.62,1.02),[e*.6,-1,.55],.055,1.25),h(`neck`,g(e*1.2,.52-.08*t,.85,1),[e*.8,-1,.3],.044+.006*t,1.2+.25*t)}for(let e of[-.58,.58])h(`neck`,g(e,.66,.5,1),[e*1.2,-1,.3],.045,1.25);[[.96,-.25],[.8,-.6],[.5,-.87],[.12,-.99]].forEach(([e,t],n)=>{h(`neck`,g(0,e,t,1.1),[0,.6-n*.4,-1],.065,1.3);for(let n of[-1,1])h(`neck`,g(n*.42,e*.9,t,1.03),[n*.9,-1,-.3],.056,1.4)});for(let e=0;e<3;e++){let t=.6-e*.055,n=-.03-e*.045;h(`body`,[0,t+.02,n-.02],[0,-.6,-1],.055-e*.006,1.3);for(let r of[-1,1])h(`body`,[r*.07,t,n],[r*.9,-1,-.3],.048-e*.006,1.35)}let _=zo(.28,[0,-1,-.6],[0,-.2,.5],.045,[1,1,.9,.8,.7]);Lt(e,_);let y=e.joints.tail,b=_.pts.length-1,x=Math.max(1,Math.round(b/3)),S=Math.max(x+1,Math.round(b*2/3));for(let e=1;e<=b;e++){let t=os(y,_.pts[e]),n=e<x?`tail`:e<S?`tail1`:`tail2`,r=e/b,i=.045+.028*Math.sin(r*Math.PI*.8),a=e%2?[0,2.1,4.2]:[1.05,3.15,5.25];for(let e of a)h(n,os(t,[Math.cos(e)*i*.7,Math.sin(e)*i*.45,Math.sin(e)*i*.3]),[Math.cos(e)*.4,-1,-.5],i,1.3,`tailHair`)}U(e),B(e,{x:.4,y:.06,size:1.05,wide:1,slant:.06,color:`#140e0c`,ring:`#7a4a2a`,ringSize:1.3});let C=new I(...os(e.joints.neck,u.nose));for(let t of[-1,1])pn(e,{bone:`neck`,from:C.clone().add(new I(0,0,-.06)),dir:new I(t*.55,.3,1),r:.015,stretch:1.5,along:new I(t*.4,1,0),color:z(n,`#140e0c`,.75),name:`nostril${t>0?`L`:`R`}`});q(e,{w:.1,y:-.62,curve:.05,r:.005,color:z(n,`#140e0c`,.7)});let w=[`earL`,`earR`].map(t=>Yt(e,t));return e.marks={base:t.coat,marks:[{color:o,f:Y(e,/^(hair|tailHair)Hi/)},{color:a,f:Y(e,/^(hair|tailHair)/,/^tail\d/)},{color:n,f:dn(...w.map(e=>e.inner))},{color:n,f:G(Y(e,`muzzle`),e=>-e.p.z+f[2]+.17)},{color:r,f:G(Y(e,/^leg/),e=>e.p.y-.055)},{color:r,f:G(Y(e,`armLPaw`,`armRPaw`),t=>t.p.y-(e.joints.shoulder[1]-.33))}]},{}}},Js={fox:{lean:-.03,head:-.07,gait:`trot`,cadence:1.25,stride:.9,sit:`wrap`,idles:[`earSwivel`,`tailSwish`,`headTilt`],tailSway:.3},raccoon:{lean:.14,head:-.05,paws:.2,gait:`amble`,cadence:.85,sit:`tuck`,idles:[`rubPaws`,`sniff`,`lookAround`],tailSway:.18},snail:{gait:`slither`,cadence:.55,sit:`settle`,idles:[`stalks`,`stretch`,`stalks`],tailSway:0},shark:{lean:.04,head:-.02,gait:`waddle`,cadence:1,stride:.7,sit:`settle`,bed:`side`,idles:[`tailSwish`,`headTilt`,`chill`],tailSway:.25},jellyfish:{gait:`float`,cadence:.6,sit:`settle`,idles:[`sway`,`chill`,`sway`],tailSway:0},octopus:{gait:`scuttle`,cadence:1.1,sit:`settle`,bed:`upright`,idles:[`sway`,`stretch`,`chill`],tailSway:0},penguin:{lean:-.02,head:-.04,gait:`waddle`,cadence:1.2,stride:.55,sit:`settle`,idles:[`flap`,`headTilt`,`chill`],tailSway:.1},duck:{lean:.04,head:-.03,gait:`waddle`,cadence:1.15,stride:.6,sit:`settle`,idles:[`flap`,`headTilt`,`wag`],tailSway:.2},bat:{gait:`flap`,cadence:1.2,sit:`settle`,idles:[`wingStretch`,`scratch`,`lookAround`],tailSway:0},squid:{gait:`scuttle`,cadence:1,sit:`settle`,idles:[`sway`,`chill`,`stretch`],tailSway:0},hedgehog:{lean:.04,head:-.04,paws:.1,gait:`trot`,cadence:1.5,stride:.6,sit:`tuck`,bed:`side`,idles:[`sniff`,`noseWiggle`,`lookAround`],tailSway:0},axolotl:{lean:.02,head:-.02,gait:`waddle`,cadence:.9,stride:.7,sit:`settle`,idles:[`headTilt`,`tailSwish`,`chill`],tailSway:.3},gecko:{lean:.05,head:-.04,gait:`trot`,cadence:1.3,stride:.8,sit:`tuck`,idles:[`lookAround`,`tailCurl`,`headTilt`],tailSway:.3},highland:{lean:.04,head:-.02,gait:`amble`,cadence:.75,stride:.9,sit:`tuck`,idles:[`chill`,`headTilt`,`tailSwish`],tailSway:.2},deer:{lean:-.02,head:-.06,gait:`trot`,cadence:1.1,stride:1,sit:`tuck`,idles:[`earTwitch`,`lookAround`,`headTilt`],tailSway:.1},sloth:{lean:.06,head:-.04,gait:`amble`,cadence:.5,stride:.8,sit:`tuck`,idles:[`slowBlink`,`stretch`,`headTilt`],tailSway:0},seal:{lean:.02,head:-.02,gait:`waddle`,cadence:.9,stride:.6,sit:`settle`,idles:[`headTilt`,`chill`,`flap`],tailSway:0},platypus:{lean:.05,head:-.03,gait:`waddle`,cadence:1,stride:.7,sit:`settle`,idles:[`sniff`,`tailSwish`,`chill`],tailSway:.2},panda:{lean:.06,head:-.03,gait:`amble`,cadence:.8,stride:.9,sit:`feet`,idles:[`chill`,`headTilt`,`scratch`],tailSway:.05},otter:{lean:-.03,head:-.05,paws:.14,gait:`trot`,cadence:1.3,stride:.85,sit:`tuck`,idles:[`rubPaws`,`lookAround`,`headTilt`],tailSway:.3},capybara:{lean:.04,head:0,gait:`amble`,cadence:.7,stride:.8,sit:`tuck`,idles:[`chill`,`slowBlink`,`lookAround`],tailSway:0},wolf:{lean:-.02,head:-.05,gait:`trot`,cadence:1.1,stride:1,sit:`wrap`,idles:[`earSwivel`,`lookAround`,`pant`],tailSway:.2},bear:{lean:.06,head:-.03,gait:`amble`,cadence:.8,stride:.9,sit:`feet`,idles:[`scratch`,`sniff`,`chill`],tailSway:.05},redpanda:{lean:.03,head:-.04,gait:`amble`,cadence:1,stride:.85,sit:`wrap`,idles:[`lookAround`,`tailSwish`,`rubPaws`],tailSway:.25},quokka:{lean:.02,head:-.03,paws:.12,gait:`hop`,cadence:1,sit:`feet`,idles:[`headTilt`,`sniff`,`chill`],tailSway:.05},frog:{lean:.05,head:-.06,gait:`hop`,cadence:1,sit:`settle`,idles:[`throat`,`slowBlink`,`hop`],tailSway:0},ferret:{lean:-.02,head:-.05,paws:.1,gait:`trot`,cadence:1.45,stride:.85,sit:`tuck`,idles:[`sniff`,`hop`,`lookAround`],tailSway:.3},dugong:{lean:.03,head:-.02,gait:`waddle`,cadence:.75,stride:.5,sit:`settle`,idles:[`chill`,`slowBlink`,`flap`],tailSway:0},seacucumber:{gait:`slither`,cadence:.5,sit:`settle`,idles:[`stretch`,`sway`,`chill`],tailSway:0},ibis:{lean:.1,head:-.02,gait:`trot`,cadence:.95,stride:.8,sit:`settle`,idles:[`sniff`,`headTilt`,`wingStretch`],tailSway:.08},crab:{lean:0,head:0,paws:.12,gait:`scuttle`,cadence:1.3,stride:.6,sit:`settle`,idles:[`stalks`,`rubPaws`,`lookAround`],tailSway:0},turtle:{lean:.03,head:-.02,gait:`waddle`,cadence:.6,stride:.55,sit:`settle`,idles:[`slowBlink`,`headTilt`,`chill`],tailSway:.05},kaiju:{lean:.06,head:-.03,paws:.1,gait:`amble`,cadence:.7,stride:.85,sit:`tuck`,bed:`side`,idles:[`lookAround`,`stretch`,`tailSwish`],tailSway:.15},robot:{lean:0,head:0,gait:`waddle`,cadence:1.3,stride:.5,sit:`feet`,idles:[`headSwivel`,`lookAround`,`headTilt`],tailSway:0},homunculus:{lean:.04,head:-.04,gait:`trot`,cadence:1.4,stride:.75,sit:`feet`,idles:[`rubPaws`,`earTwitch`,`headTilt`,`lookAround`],tailSway:0},fungi:{lean:0,head:-.02,gait:`hop`,cadence:1.05,sit:`feet`,idles:[`sway`,`headTilt`,`slowBlink`],tailSway:0},dragon:{lean:.03,head:-.04,paws:.12,gait:`waddle`,cadence:1.05,stride:.65,sit:`feet`,bed:`side`,idles:[`flutter`,`tailSwish`,`lookAround`,`flutter`],tailSway:.2},bee:{lean:.02,head:-.03,gait:`flap`,cadence:1.3,stride:.7,sit:`settle`,idles:[`rubPaws`,`earTwitch`,`lookAround`],tailSway:0},chameleon:{lean:.04,head:-.03,gait:`amble`,cadence:.6,stride:.75,sit:`feet`,idles:[`sway`,`headTilt`,`lookAround`],tailSway:.05},whaleshark:{lean:.03,head:-.02,gait:`waddle`,cadence:.75,stride:.6,sit:`settle`,bed:`side`,idles:[`slowBlink`,`tailSwish`,`chill`],tailSway:.22},prawn:{lean:.02,head:-.03,paws:.12,gait:`scuttle`,cadence:1.35,stride:.6,sit:`settle`,idles:[`stalks`,`rubPaws`,`tailSwish`],tailSway:.2},meerkat:{lean:-.04,head:-.06,paws:.17,gait:`trot`,cadence:1.55,stride:.75,sit:`feet`,idles:[`sentinel`,`lookAround`,`sniff`,`sentinel`],tailSway:.12},skeleton:{lean:0,head:-.03,gait:`trot`,cadence:1.2,stride:.85,sit:`feet`,idles:[`headTilt`,`lookAround`,`stretch`],tailSway:0},pony:{lean:.02,head:-.04,gait:`trot`,cadence:1.35,stride:.7,sit:`tuck`,bed:`side`,idles:[`headTilt`,`tailSwish`,`lookAround`],tailSway:.25}},Ys={fox:{toes:2,paws:2},penguin:{toes:2},wolf:{toes:2,paws:2},redpanda:{toes:2,paws:2},quokka:{toes:2},panda:{toes:2},raccoon:{toes:3},bear:{claws:3},gecko:{toes:3,paws:3},otter:{toes:3},ferret:{toes:2,paws:2},kaiju:{claws:3},homunculus:{toes:3},dragon:{claws:3},chameleon:{toes:1,paws:1},meerkat:{toes:2,claws:3},skeleton:{toes:2}};function Xs(e){return{...xt(),...Js[e]}}var Zs=F.smoothstep,{sin:Q,cos:Qs,abs:$s,max:ec,PI:tc}=Math,nc=tc*2;function rc(e,t){let n=e.get(t);return n||e.set(t,n=[0,0,0,0,0,0,1]),n}function ic(e){[e.alx,e.arx]=[e.arx,e.alx],[e.alz,e.arz]=[-e.arz,-e.alz],[e.aly,e.ary]=[-e.ary,-e.aly],[e.sl,e.sr]=[e.sr,e.sl],[e.el,e.er]=[e.er,e.el],[e.llx,e.lrx]=[e.lrx,e.llx],[e.llz,e.lrz]=[-e.lrz,-e.llz],e.bx=-e.bx,e.bry=-e.bry,e.brz=-e.brz,e.hry=-e.hry,e.hrz=-e.hrz,e.try=-e.try}function ac(e,t,n,r,i){let a=e.shoulder,o=e.headC.y+e.headR.y,s=e.sk.rest.get(`legL`)?.y??a.y*.5,c=i*2,l=e.prof.gait===`hop`?1.3:1,u=e=>a.x-e,d=(e,t)=>{rc(n,`earL`)[0]=rc(n,`earR`)[0]=e,rc(n,`earL`)[2]=rc(n,`earR`)[2]=t},f=e=>{t.brx=e,t.llx=t.lrx=-e,t.by+=s*(1-Qs(e)),t.bz+=-s*Q(e)},p=n=>e.reach(t,n,s+.04,e.front*.4,.04,`paw`),m=(e=.78)=>{t.alz=tc*e,t.arz=-tc*e,t.alx=t.arx=-.12,t.el=t.er=0};switch(r){case`fistpump`:{let n=c%1,r=ec(0,Q(n*nc)),a=ec(0,-Q(n*nc));t.by=r*.1*l-a*.03,t.brx=a*.1,t.llx=t.lrx=-a*.25;let s=Math.floor(c)%3==2;e.raise(t,s?`both`:`r`,o+.06+r*.08,.01),s||(t.alz=e.armOut+.25,t.alx=-.5,t.el=1.3),t.hrx=-.12-r*.15,t.try=Q(i*12)*.5,d(-.25,0);break}case`default`:if(c%8<6){let n=Math.floor(c)%2?1:-1,r=Q(c%1*tc);t.by=r*.04,t.alx=-.4-n*.7*r,t.arx=-.4+n*.7*r,t.alz=e.armOut+.15,t.arz=-e.armOut-.15,t.el=t.er=1.2,n>0?t.llz=.45*r:t.lrz=-.45*r,t.brz=-n*.08*r,t.hrz=n*.12*r,t.try=n*.6}else{let n=$s(Q(c*nc));e.reach(t,`both`,a.y-.08-n*.08,e.front+e.pawR+.1,.02,`paw`),t.by=-n*.04,t.llx=t.lrx=-n*.3,t.brx=n*.12,t.hrx=.1}break;case`floss`:e.dance(t,n,`floss`,i*1.5),t.by+=$s(Q(i*tc*3.3))*.05*l;break;case`takel`:{let n=e.eyePos.y+.07;e.reach(t,`r`,n,e.faceFront(n)+e.pawR+.03,u(-.01),`paw`),t.alz=e.armOut+.5,t.alx=-.2+Q(c*tc)*.3,t.el=.8;let r=Math.floor(c)%2?1:-1,a=Q(c%1*tc);t.by=a*.05*l,r>0?t.llx=-.7*a:t.lrx=-.7*a,t.bry=r*.15,t.hry=Q(i*4)*.25,t.hrz=r*.08,t.try=r*.5;break}case`dab`:{let n=c%4,r=n<2?1:-1,i=Zs(n%2,0,.25),a=$s(Q(c*tc));if(i<.05||n%2>1.75)t.by=a*.05,t.alz=e.armOut+.2,t.arz=-e.armOut-.2,t.alx=t.arx=-.3,t.el=t.er=1,t.hrx=-.1;else{let n=e.eyePos.y+.02;e.reach(t,`r`,n,e.faceFront(n)+e.pawR+.08,u(e.headR.x+.08),`paw`),t.alz=2.2,t.alx=-.5,t.el=0,t.hrx=.38,t.hry=.45,t.hrz=.15,t.brz=-.06,t.bry=.15,t.by=-.01,t.llz=.12,t.lrz=-.12,r<0&&ic(t)}d(-.1,0);break}case`gangnam`:{let n=i*4,r=$s(Q(n*tc)),s=Math.floor(n/2)%2==0;t.by=r*.07*l,t.llx=s?-.6*r:.1,t.lrx=s?.1:-.6*r,t.bx=Q(i*tc*.5)*.08,t.brx=-.05,e.reach(t,`both`,a.y-.02+r*.03,e.front+e.pawR+.08,u(.02),`paw`),c%16>=12?(e.raise(t,`r`,o+.14,.04+Q(i*14)*.08),t.arx+=Qs(i*14)*.25,t.bz=Q(i*8)*.04,t.hrx=-.15):t.hrx=r*.1-.05,t.hry=s?.12:-.12,t.try=(s?1:-1)*.5,d(-.2+r*.2,0);break}case`zombie`:{let n=c%8,r=n<4?1:-1,i=ec(0,Q(n%1*nc)),o=Zs(n%4,3,4);e.reach(t,`both`,a.y+.08+i*.03,e.front+e.pawR+.12,.02,`paw`),t.alz+=r*.35,t.arz+=r*.35,t.el=t.er=ec(t.el,.6),t.bx=r*.05*(1-2*o),t.by=i*.02,t.brz=-r*.08,t.bry=r*.2,t.hrz=-r*.3,t.hry=r*.3,t.hrx=.12,t.llz=.12+(r>0?o*.3:0),t.lrz=-.12-(r<0?o*.3:0),t.try=r*.3,d(.3,0);break}case`carlton`:case`worm`:case`moonwalk`:case`ymca`:case`griddy`:case`macarena`:e.dance(t,n,r,i);break;case`pedro`:{let n=c%8,r=Math.floor(n/2),a=Q(c%1*tc),o=Math.floor(c)%2?1:-1;if(r===0)t.by=a*.05,o>0?t.llx=-1*a:t.lrx=-1*a,t.alz=e.armOut+.3+a*.5,t.arz=-e.armOut-.3-a*.5,t.alx=t.arx=.2,t.hrx=-.1+a*.1;else if(r===1)t.bx=Q((n-2)/2*tc)*.12,t.alz=e.armOut+.3+o*.9,t.arz=-e.armOut-.3+o*.9,t.alx=t.arx=-.3,t.llz=.2,t.lrz=-.05,t.brz=-.1,t.hry=-.4;else if(r===2){let r=Q((n-4)/2*tc);t.by=r*.14*l,t.alz=e.armOut+r*1.6,t.arz=-e.armOut-r*1.6,t.llz=r*.5,t.lrz=-r*.5,t.hrx=-.3*r}else{let n=Q(i*18);t.brz=n*.08,t.bry=n*.15,t.alx=t.arx=-.6,t.alz=e.armOut+.4+n*.2,t.arz=-e.armOut-.4+n*.2,t.el=t.er=1.4,t.hrx=$s(Q(i*9))*.2-.05,t.hrz=-n*.1}t.try=o*.6;break}case`fever`:{let n=Math.floor(c)%2==0,r=Zs(c%1,0,.3);n?(t.arz=-2.5,t.arx=-.35,t.er=0,t.brz=.12*r,t.bx=-.04*r,t.hry=-.35,t.hrx=-.2):(e.reach(t,`r`,s-.04,e.front+e.pawR+.06,u(-a.x*.9),`paw`),t.brz=-.08*r,t.bx=.04*r,t.hry=.2,t.hrx=.15),p(`l`),t.llx=n?0:-.25,t.lrz=n?-.18:-.05,t.by=$s(Q(c*tc))*.015,t.try=n?-.5:.5;break}case`chestbeat`:{let n=c%8;if(t.llz=.3,t.lrz=-.3,t.by=-.04,n<6){let r=Q(i*(4+n)*tc),o=a.y-.04,s=e.front+e.pawR;e.reach(t,`r`,o,s+ec(0,r)*.12,u(-.05),`paw`);let c=[t.arx,t.arz,t.sr,t.er];e.reach(t,`l`,o,s+ec(0,-r)*.12,u(-.05),`paw`),[t.arx,t.arz,t.sr,t.er]=c,t.brx=-.12,t.hrx=-.15,t.bry=r*.08,t.by+=$s(r)*.015}else{let e=Zs(n-6,0,.3);m(.62+e*.1),t.brx=-.18*e,t.hrx=-.4*e+Q(i*30)*.03,t.by+=e*.02}t.try=Q(i*6)*.4,d(-.3,0);break}case`rocky`:{let n=i%6;if(n<3){t.by=$s(Q(i*tc*4))*.035;let n=Math.floor(i*3)%2?`r`:`l`,r=ec(0,Q(i*3*tc)),o=a.y+.02;e.reach(t,`both`,o,e.front+e.pawR+.05,u(-.02),`paw`);let s=n===`r`?[t.alx,t.alz,t.sl,t.el]:[t.arx,t.arz,t.sr,t.er];e.reach(t,n,o,e.front+e.pawR+.05+r*.3,u(-.04),`paw`),n===`r`?[t.alx,t.alz,t.sl,t.el]=s:[t.arx,t.arz,t.sr,t.er]=s,t.bry=(n===`r`?.25:-.25)*r,t.hrx=.12,t.llx=-.2,t.lrx=.15}else{let e=$s(Q((n-3)*tc*2));m(.86),t.alz+=Q(i*12)*.1,t.arz+=Q(i*12)*.1,t.by=e*.1*l,t.hrx=-.35,t.bry=Q((n-3)*1.5)*.5}t.try=Q(i*8)*.5;break}case`landing`:{let n=i%4,r=n<.5?1-Zs(n,0,.5):0,o=n<.5?Zs(n,.35,.5):1-Zs(n,3.3,3.9);t.by=r*.5-o*s*.45,e.hasLegs&&(t.llx=-1.3*o,t.lrx=1.1*o,t.llz=.12,t.lrz=-.1),t.brx=.35*o,e.reach(t,`r`,.03+(1-o)*(a.y-.1),e.front+e.pawR+.1,u(-.02),`paw`),t.alx=.7*o-.3*r,t.alz=e.armOut+.5+r*.8,t.el=.3,t.hrx=-.45*o,t.hry=.1*o,t.trx=.4*o,t.bx=n>.5&&n<.75?Q(n*90)*.01:0,d(-.4*r+.1*o,0);break}case`bolt`:if(i%4<1){let e=Math.floor(i*8)%2==0,n=$s(Q(i*8*tc));t.by=.02+n*.05,t.llx=e?-1*n:.3*n,t.lrx=e?.3*n:-1*n,t.alx=e?-.9:.5,t.arx=e?.5:-.9,t.el=t.er=1.4,t.brx=.15}else t.alz=2.35+Q(i*2)*.02,t.alx=-.35,t.el=0,e.reach(t,`r`,a.y+.08,e.front+e.pawR+.08,u(-a.x*1.2),`paw`),t.brz=-.14,t.brx=-.1,t.bx=.02,t.bry=.25,t.hry=.45,t.hrx=-.25,t.lrz=-.25,t.llx=-.15;d(-.2,0);break;case`woo`:{let n=c%8;if(n<5){let n=Math.floor(c)%2==0,r=Q(c%1*tc);t.llx=n?-.8*r:0,t.lrx=n?0:-.8*r,t.by=r*.03,t.brx=-.15,t.bry=(n?.15:-.15)*r,t.alx=t.arx=.35,t.alz=e.armOut+.45+r*.2,t.arz=-e.armOut-.45-r*.2,t.el=t.er=1.2,t.hrx=-.2,t.hry=(n?-.2:.2)*r}else if(n<6){let r=Zs(n-5,.3,.6);e.raise(t,`r`,o+.1-r*.35,.02),t.arx-=r*.6,p(`l`),t.hrx=-.1}else{let r=Zs(n-6,0,.3);t.alz=e.armOut+r*1.3,t.arz=-e.armOut-r*1.3,t.alx=t.arx=.2,t.brx=-.2*r,t.hrx=-.55*r+Q(i*40)*.02,t.by=.02*r}t.try=Q(i*9)*.5;break}case`hotline`:{let n=c%8;if(n<4){let n=Q(c*tc*.5);t.bx=n*.05,t.brz=-n*.07,t.bry=n*.2,t.alx=t.arx=-.7,t.alz=e.armOut+.25+n*.25,t.arz=-e.armOut-.25+n*.25,t.el=t.er=1.5,t.hrz=n*.12,t.by=$s(n)*.015,t.llx=ec(0,n)*-.2,t.lrx=ec(0,-n)*-.2}else if(n<6){let r=Zs((n-4)/2,.15,.6);t.bry=-.6+r*1.1,t.arz=-e.armOut-.6,t.arx=.6-r*1.8,t.er=.3,t.alx=-.6,t.el=1.2,t.hry=-.3+r*.5,t.lrx=-.2}else{let n=$s(Q(c*tc));e.reach(t,`both`,a.y-.06,e.front+e.pawR+.08,u(-.03),`paw`),t.by=n*.03,t.llx=t.lrx=-n*.15,t.hrx=.1-n*.1,t.hry=Q(i*3)*.25}t.try=Q(i*4)*.4;break}case`lean`:{let n=i%6,r=Zs(n,1.6,3)*(1-Zs(n,4.4,5.6));if(n<1.4){let r=Q(Zs(n,.1,1.3)*tc);e.raise(t,`r`,o+.02,-.04+r*.02),t.hrx=.2*r}else t.arx=t.alx=0,t.arz=-e.armOut*.5,t.alz=e.armOut*.5;e.hasLegs&&!e.floats?(t.brx=.72*r,t.hrx-=.35*r):t.brx=.4*r,t.trx=-.4*r,d(-.2*r,0);break}case`moonpose`:{let n=i%4,r=Zs(n,0,1.1);if(n<1.15)t.bry=r*nc,t.alz=e.armOut+1.1,t.arz=-e.armOut-1.1,t.by=Q(r*tc)*.06*l,t.lrx=-.5*Q(r*tc);else{let n=e.eyePos.y;e.reach(t,`r`,n,e.faceFront(n)+e.pawR+.04,u(-$s(e.eyePos.x)),`paw`),t.alz=e.armOut+1.05,t.alx=-.45,t.el=0,t.brz=.1,t.bx=-.03,t.hrz=-.2,t.hry=.1,t.lrx=-.3,t.lrz=.12,t.by=Q(i*3)*.006}d(-.15,0);break}case`ninjarun`:{let n=Math.floor(i*10)%2==0,r=$s(Q(i*10*tc));t.brx=.45,t.bz=-.05,t.by=.01+r*.04,t.llx=(n?-1.1*r:.5*r)-.45,t.lrx=(n?.5*r:-1.1*r)-.45,t.alx=t.arx=1.25,t.alz=e.armOut+.15,t.arz=-e.armOut-.15,t.el=t.er=0,t.hrx=-.5,t.trx=-.3,t.try=Q(i*20)*.3,d(.6,0);break}case`jojo`:{let n=Math.floor(i/1.5)%4,r=Q(i*37)*.006;if(n===0){let n=e.headC.y+e.headR.y*.4;e.reach(t,`r`,n,e.faceFront(n)+e.pawR+.03,u(-e.headR.x*.4),`paw`),t.alx=-.5,t.alz=e.armOut+.6,t.el=.2,t.bry=.5,t.brz=-.16,t.bx=.05,t.hrz=.3,t.hry=-.35,t.llx=-.25,t.lrz=-.12}else n===1?(t.arx=-1.55,t.arz=-.08,t.er=0,p(`l`),t.brx=-.15,t.bry=-.35,t.hrx=-.12,t.hry=.3,t.llz=.2,t.lrz=-.2):n===2?(e.reach(t,`both`,e.eyePos.y-.02,e.faceFront(e.eyePos.y)+e.pawR+.08,u(a.x*.3),`paw`),t.brx=-.32,t.bz=.06,t.brz=.08,t.hrx=.1,t.hry=-.4,t.llx=-.35,t.lrx=.2):(e.raise(t,`both`,e.headC.y+.04,-.02),t.lrx=-1.1,t.lrz=.15,t.brz=.18,t.bx=-.04,t.bry=.3,t.hrz=-.25,t.by=.02);t.bx+=r,t.hrx+=r*4,d(-.2,0);break}case`powerup`:{let n=i%3,r=Zs(n,0,2.2),a=Zs(n,2.2,2.4)*(1-Zs(n,2.8,3)),o=Q(i*47)*(.004+r*.016);t.by=-.06+a*.08,t.llz=.32,t.lrz=-.32,t.llx=t.lrx=-.2,t.brx=.18-a*.35,t.alx=t.arx=.35-a*.3,t.alz=e.armOut+.35+a*1,t.arz=-e.armOut-.35-a*1,t.el=t.er=1.1*(1-a),t.bx=o,t.hrx=-.15-r*.2-a*.35,t.trx=-.3*r,d(-.5*r,o*4);break}case`pointing`:{let e=c%8,n=$s(Q(c*tc*2))*.12;t.arz=-1.45-n*.5,t.arx=-.55,t.er=0,p(`l`),t.hry=-.55,t.hrx=-.08,t.bry=-.12,t.brx=-.05,t.by=n*.08,t.lrz=-.1,t.llz=.06,e>=4&&ic(t),d(-.3,0);break}case`micdrop`:{let n=i%5;if(n<2){let n=e.mouth;e.reach(t,`r`,n.y,e.faceFront(n.y)+e.pawR+.07,u(-.03),`paw`);let r=Q(i*9);t.alz=e.armOut+.4+r*.25,t.alx=-.8,t.el=1.2,t.hrx=$s(r)*.06-.04,t.hry=Q(i*2)*.2,t.by=$s(Q(i*4))*.01}else if(n<2.9){let r=Zs(n,2,2.4);t.arz=-e.armOut-r*1.25,t.arx=-.4,t.er=0,t.alz=e.armOut,t.hry=-.4*r,t.hrx=-.1}else{let r=Zs(n,2.9,3.3);e.reach(t,`both`,a.y-.06,e.front+e.pawR+.02,u(-a.x*.6),`paw`),t.hrx=-.25*r,t.hry=.2*r,t.brx=-.08*r}break}case`backflip`:{let n=i%3,r=o*.5;if(n<.6){let e=Zs(n,.1,.55);t.by=-.06*e,t.brx=.25*e,t.llx=t.lrx=-.4*e,t.alx=t.arx=.8*e}else if(n<1.35){let i=(n-.6)/.75,a=-nc*Zs(i,0,1),s=4*i*(1-i)*o*.6;t.brx=a,t.by=r-r*Qs(a)+s,t.bz=-r*Q(a);let c=Q(i*tc);t.llx=t.lrx=-1.3*c,t.alx=t.arx=-1.2*c-.6*(1-c),t.alz=e.armOut+.2,t.arz=-e.armOut-.2,t.hrx=.3*c}else if(n<1.7){let r=Q((n-1.35)/.35*tc);t.by=-.07*r,t.brx=.2*r,t.llx=t.lrx=-.4*r,t.alz=e.armOut+.8,t.arz=-e.armOut-.8}else{let e=Zs(n,1.7,1.9);m(.5+e*.3),t.by=$s(Q((n-1.7)*tc*2))*.02,t.hrx=-.25*e}break}case`bow`:{let n=i%4,r=Zs(n,.9,1.5)*(1-Zs(n,2.6,3.2));if(n<1.1){let r=Zs(n,0,1.1),i=r*nc*1.5;e.raise(t,`r`,o-r*.15,.06+Q(i)*.05),t.arx+=Qs(i)*.3*(1-r)}else n<3.2?e.reach(t,`r`,a.y-.12,e.front+e.pawR+.03,u(0),`paw`):e.raise(t,`r`,e.headC.y+.02,.02+Q(i*9)*.05);t.alx=.25+r*.5,t.alz=e.armOut+.35+r*.3,t.el=.2,e.hasLegs&&!e.floats?f(r*.75):t.brx=r*.5,t.hrx+=r*.2,t.lrx+=.25*r,d(.2*r,0);break}case`pirouette`:{let n=i%4;if(n<.5){let r=Zs(n,0,.4);t.by=-.04*r,t.llx=t.lrx=-.25*r,t.llz=.15*r,t.lrz=-.15*r,t.alz=e.armOut+.9,t.arz=-e.armOut-.9,t.alx=t.arx=-.4,t.el=t.er=.4}else if(n<2.6)t.bry=Zs(n,.5,2.6)*nc*3,t.by=.04,t.lrx=-.9,t.lrz=.35,e.raise(t,`both`,o+.1,-.02),t.hrx=-.1;else{let r=Zs(n,2.6,2.9);t.alz=e.armOut+1*r+.3,t.arz=-e.armOut-1*r-.3,t.alx=t.arx=-.25,t.lrx=-.3*r,t.lrz=.05,t.hrx=-.2*r,t.brx=-.06*r}d(-.15,0);break}}}var oc={micdrop:{kind:`mic`,drop:2.9,loop:5}},sc={powerup:!0},cc=`bx.by.bz.brx.bry.brz.hrx.hry.hrz.alx.alz.arx.arz.aly.ary.wl.wr.llx.llz.lrx.lrz.trx.try.tilt.sl.sr.el.er.carry`.split(`.`),lc={x:.31,y:-2.575,z:-.455,el:2.4,w:.3},uc=()=>({bx:0,by:0,bz:0,brx:0,bry:0,brz:0,hrx:0,hry:0,hrz:0,alx:-.14,alz:.16,arx:-.14,arz:-.16,aly:0,ary:0,wl:1,wr:1,llx:0,llz:0,lrx:0,lrz:0,trx:0,try:0,tilt:0,sl:1,sr:1,el:0,er:0,carry:0}),dc=()=>[0,0,0,0,0,0,1];function $(e,t){let n=e.get(t);return n||e.set(t,n=dc()),n}var fc={dy:-.06,dz:.07,out:.05,sip:[.14,0,.6]},pc={ale:fc,cider:fc,milk:fc,cocoa:fc,wine:{dy:-.04,dz:.07,out:.05,sip:[.185,.03,.5]},bun:{dy:-.02,dz:.07,out:.04,sip:[.05,-.06,0]},loaf:{dy:-.08,dz:.07,out:0,both:!0,sip:[.04,-.1,0]},pie:{dy:-.08,dz:.07,out:0,both:!0,sip:[.06,-.1,0]},fish:{dy:.02,dz:.08,out:.16},flower:{dy:0,dz:.07,out:.12},rod:{dy:-.14,dz:.02,out:.1},can:{dy:-.18,dz:.05,out:0,both:!0,hang:.1},washing:{dy:-.2,dz:.1,out:.02,both:!0,hang:.12},water:{dy:-.06,dz:.02,out:.12,sip:[-.1,-.07,.4],hang:.32},firewood:{dy:-.08,dz:.03,out:0,both:!0,hang:.1},grimoire:{dy:-.12,dz:.12,out:0,both:!0}},mc={earSwivel:2.4,earTwitch:1.1,tailSwish:2.4,headTilt:2.2,sniff:2.1,rubPaws:2.6,noseWiggle:1.5,hop:1.2,stalks:3.4,stretch:3.2,headSwivel:2.8,slowBlink:1.8,lickPaw:3,tailCurl:2.6,wag:2,pant:2.6,sway:3.2,scratch:2.2,flap:1.6,throat:2,chill:4.5,wingStretch:2.8,flutter:2.2,lookAround:3,sentinel:4.2},hc=e=>Math.min(1,Math.max(0,e)),gc=e=>{let t=hc(Math.min(e/.2,(1-e)/.2));return t*t*(3-2*t)},_c=new Ee({color:`#3a4a7a`,transparent:!0,opacity:.85}),vc={buzz:{shut:[.95,-.5],open:[0,0],rate:70,beat:.5,ease:6},flutter:{shut:[0,0],open:[-.4,-.45],rate:21,beat:.5,ease:9}},yc=[`foreL`,`foreR`,`wingL`,`wingR`,`turretL`,`turretR`],bc=[`body`,`neck`,`eyes`,`armL`,`armR`,`legL`,`legR`,`tail`];function xc(e){let t=e.joints,n=[[`body`,null,[0,0,0]],[`neck`,`body`,t.neck],[`eyes`,`neck`,[0,e.eyeY,0]],[`armL`,`body`,t.shoulder],[`armR`,`body`,[-t.shoulder[0],t.shoulder[1],t.shoulder[2]]],[`legL`,`body`,t.hip],[`legR`,`body`,[-t.hip[0],t.hip[1],t.hip[2]]],[`tail`,`body`,t.tail],...e.bones.map(e=>[e.name,e.parent,e.pos])],r={names:[],parent:new Map,local:new Map,rest:new Map};for(let[e,t,i]of n)r.names.push(e),r.parent.set(e,t),r.local.set(e,new I(...i)),r.rest.set(e,new I(...i).add(t?r.rest.get(t):new I));return r}function Sc(e,t){let n=new Map(t.names.map((e,t)=>[e,t])),r=[],i=[],a=[],o=[],s=[],c=e=>e.glass?2:+!!e.eyes;for(let u of[0,1,2]){let d=r.length/3;for(let s of e.parts.values()){if(c(s)!==u||s.fold.empty)continue;let d=t.rest.get(s.space)??new I,f=e.bind?.[s.space]?new l().setFromEuler(new v(...e.bind[s.space])):null,p=new I,m=n.get(s.bone)??0,h=s.chain?.map(e=>n.get(e)??m),g=s.fold,_=g.bones?.map(e=>n.get(e)??m);for(let e=0;e<g.pos.length/3;e++){p.fromArray(g.pos,e*3),f&&p.applyQuaternion(f),r.push(p.x+d.x,p.y+d.y,p.z+d.z),i.push(g.col[e*3],g.col[e*3+1],g.col[e*3+2]);let t=g.along[e];if(_)for(let t=0;t<4;t++)a.push(_[g.si[e*4+t]]),o.push(g.sw[e*4+t]);else if(h&&t>=0){let e=h.length,n=t*e,r=Math.min(e-1,Math.floor(n));r>=e-1?(a.push(h[e-1],0,0,0),o.push(1,0,0,0)):(a.push(h[r],h[r+1],0,0),o.push(1-(n-r),n-r,0,0))}else a.push(m,0,0,0),o.push(1,0,0,0)}}s.push([d,r.length/3-d])}let u=new dt;return u.setAttribute(`position`,new j(r,3)),u.setAttribute(`color`,new j(i,3)),u.setAttribute(`skinIndex`,new te(a,4)),u.setAttribute(`skinWeight`,new j(o,4)),u.addGroup(s[0][0],s[0][1],0),u.addGroup(s[1][0],s[1][1],1),s[2][1]&&u.addGroup(s[2][0],s[2][1],2),u.computeVertexNormals(),Je&&Cc(u),u.computeBoundingSphere(),u}function Cc(e){let t=e.getAttribute(`position`),n=e.getAttribute(`normal`),r=new I,i=new I,a=new I,o=[];for(let e=0;e<t.count/3;e++)r.fromBufferAttribute(t,e*3),i.fromBufferAttribute(t,e*3+1),a.fromBufferAttribute(t,e*3+2),o.push(a.sub(i).cross(r.sub(i)).clone());let s=new Map;for(let e=0;e<t.count;e++){let n=`${Math.round(t.getX(e)*1e5)},${Math.round(t.getY(e)*1e5)},${Math.round(t.getZ(e)*1e5)}`,r=s.get(n);r?r.push(e):s.set(n,[e])}let c=Math.cos(F.degToRad(60)),l=new I,u=new I;for(let e of s.values())for(let t of e){l.copy(o[Math.floor(t/3)]).normalize(),u.set(0,0,0);for(let t of e){let e=o[Math.floor(t/3)];e.dot(l)>=c*e.length()&&u.add(e)}u.lengthSq()>1e-20&&n.setXYZ(t,...u.normalize().toArray())}n.needsUpdate=!0}var wc=new Map,Tc=e=>Math.atan2(Math.sin(e),Math.cos(e)),Ec=new I(1,0,0);function Dc(e,t,n,r=1.3){let i=n.clone().sub(e),a=t.length(),o=F.clamp(i.length()/a,.7,r),s=i.normalize().multiplyScalar(a),c=Math.asin(F.clamp(s.x/-t.y,-1,1)),l=t.y*Math.cos(c);return{ax:Tc(Math.atan2(s.z,s.y)-Math.atan2(t.z,l)),az:c,s:o}}var Oc=-.012,kc=new I,Ac=new I,jc=new I,Mc=new I,Nc=new I(0,1,0),Pc=new lt,Fc=new l,Ic=new l,Lc=new l,Rc=class{root=new je;lowPoints=null;headHeight=1;float=new je;bones=new Map;body;neck;armL;armR;legL;legR;tail;blinkers;extra;foreL;foreR;elbow;hand=new je;handTilt=new je;mesh;sk;material;eyeMaterial;ghostMaterial;wisp;item=null;itemKey=``;hold=null;ghost=!1;pose=uc();auxNow=new Map;phase=0;animNow=`idle`;animStart=0;blinkAt=2+Math.random()*3;blinkT=-1;seed=Math.random()*100;footLift=0;bedLift=0;prof;clip=null;nextClip=1.5+Math.random()*3;shut=0;grow=0;floats;hover;flaps;tentacles;noLegs;sleepy;tendril;wings=null;flutter=0;turrets=[];shift;glassMaterial=null;owned=[];highGeo;detail=`high`;lowKit;lowKey;hatFit;hat=null;hatFx=null;emoteFx=null;handL=null;hatFxOn=!0;baseHeadHeight=1;shoulder;grip;paw;pawR;seat;sitLeg;sipLow;lift;armFwd;armOut;front;mouth;eyePos;neckPos;headC;headR;hasLegs;shape;v=new I;v2=new I;v3=new I;m4=new lt;m5=new lt;m6=new lt;constructor(e){let t=e.kit,n=t.joints;this.prof=e.profile,this.floats=e.floats,this.hover=e.hover??.35,this.flaps=!!e.flaps,this.tentacles=e.tentacles,this.noLegs=!!e.noLegs,this.sleepy=!!e.sleepy,this.tendril=!!e.tendril,this.shift=e.shift??null,this.material=e.material,this.eyeMaterial=e.eyeMaterial??e.material,this.hatFit=e.hatFit,this.lowKit=e.lowKit,this.lowKey=e.lowKey,this.owned.push(e.material),e.eyeMaterial&&this.owned.push(e.eyeMaterial),this.shoulder=new I(-n.shoulder[0],n.shoulder[1],n.shoulder[2]),this.grip=new I(...n.hand),this.paw=new I(...n.paw??[n.hand[0],n.hand[1],n.hand[2]*.2]),this.pawR=Math.max(.03,(n.hand[2]-this.paw.z)*.9),this.seat=t.seat;let r=t.sculpt?.named(`legLFoot`),i=r?t.joints.hip[1]-r.c.y:0;this.sipLow=!!t.sipLow,this.lift=t.lift??0,this.sitLeg=r?-Math.acos(F.clamp((i-t.seat)/i,-1,1)):null;let a=t.bind?.armL;this.armFwd=a?-a[0]:.14,this.armOut=a?a[2]:.16,this.shape=t.shape;let o=t.shape;this.front=t.front??o.tc[2]+o.tr[2]*1.12,this.mouth=new I(...t.nose??[0,o.hc[1]-o.hr[1]*.4,o.hc[2]+o.hr[2]]).add(new I(...n.neck)),this.eyePos=new I(t.eyeX,t.eyeY,t.eyeZ).add(new I(...n.neck)),this.neckPos=new I(...n.neck),this.headC=new I(...o.hc).add(this.neckPos),this.headR=new I(o.hr[0]*1.15,o.hr[1],o.hr[2]),this.hasLegs=!t.legL.empty||!!t.sculpt?.shapes.some(e=>e.bone===`legL`),this.sk=xc(t);for(let e of this.sk.names){let t=new M;t.name=e,t.position.copy(this.sk.local.get(e));let n=this.sk.parent.get(e);(n?this.bones.get(n):this.float).add(t),this.bones.set(e,t)}let s=e=>this.bones.get(e);this.body=s(`body`),this.neck=s(`neck`),this.armL=s(`armL`),this.armR=s(`armR`),this.legL=s(`legL`),this.legR=s(`legR`),this.tail=s(`tail`),this.blinkers=t.blink.map(s).filter(Boolean),this.foreL=this.bones.get(`foreL`)??null,this.foreR=this.bones.get(`foreR`)??null,this.elbow=this.foreR?t.elbow??0:0,this.extra=this.sk.names.filter(e=>!bc.includes(e)&&!yc.includes(e));let l=this.bones.get(`wingL`),u=this.bones.get(`wingR`);if(e.wings&&l&&u&&(this.wings={mode:e.wings,bones:[[l,1],[u,-1]],open:0,want:0,phase:0}),e.swivel)for(let[e,t]of[[`turretL`,1],[`turretR`,-1]]){let n=this.bones.get(e);n&&this.turrets.push({bone:n,side:t,yaw:0,pitch:0,toYaw:0,toPitch:0,next:0})}if(this.root.add(this.float),this.hand.matrixAutoUpdate=!1,(this.foreR??this.armR).add(this.hand),this.hand.add(this.handTilt),this.highGeo=Sc(t,this.sk),this.highGeo.groups.length>2){let e=at();e.transparent=!0,e.opacity=.5,e.depthWrite=!1,this.glassMaterial=e,this.owned.push(e)}this.mesh=new c(this.highGeo,this.skinMaterials()),this.mesh.castShadow=!0,this.mesh.receiveShadow=!1,this.float.add(this.mesh);for(let[e,n]of Object.entries(t.bind??{}))this.bones.get(e)?.rotation.set(...n);this.root.updateMatrixWorld(!0),this.mesh.bind(new _t(this.sk.names.map(s)));{let e=this.highGeo.getAttribute(`position`),t=this.highGeo.getAttribute(`skinIndex`),n=new Set(this.chainOf(`tail`).map(e=>this.sk.names.indexOf(e))),r=0;for(let i=0;i<e.count;i++)n.has(t.getX(i))||(r=Math.min(r,e.getY(i)));this.footLift=Math.min(.05,-r)}this.mesh.boundingSphere=new ge(new I(0,.5,0),1.4),this.ghostMaterial=new pe({color:e.ghostColor,emissive:`#9fc4ff`,emissiveIntensity:.55,transparent:!0,opacity:.6,depthWrite:!0,roughness:1,flatShading:!0}),this.owned.push(this.ghostMaterial);let d=new cn;on(d,$t(7),{pts:[[0,.36,0],[0,.22,-.02],[.02,.08,-.07],[.05,-.02,-.15]],radii:[.17,.14,.08,.02],sides:7,jitter:.1,round:!1,color:`#ffffff`}),this.wisp=new ht(d.geometry(),this.ghostMaterial),this.wisp.visible=!1,t.sculpt&&(this.wisp.scale.set(.8,1.6,.8),this.wisp.position.y=.36*(1-1.6)),this.body.add(this.wisp),e.extras?.(this.body,this.handTilt,this.armL),this.noLegs&&(this.wisp.visible=!t.sculpt,this.wisp.material=this.material),this.applyPose(1),this.root.updateMatrixWorld(!0),this.headHeight=this.measureHead()+(this.floats&&!this.flaps?this.hover:0),this.baseHeadHeight=this.headHeight,this.bedLift=this.measureBed()}measureBed(){let e={...this.pose},t=new Map([...this.auxNow].map(([e,t])=>[e,[...t]])),n=this.prof.bed===`upright`?[]:this.freeChains(),r=new Set(n.flatMap(e=>this.chainOf(e).map(e=>this.sk.names.indexOf(e)))),i=this.highGeo.getAttribute(`skinIndex`),a=this.highGeo.getAttribute(`skinWeight`),o=new I,s=1/0;for(let e of[0,1.4,2.8,4.2,5.6]){this.applyPose(1,this.target({anim:`sleep`,speed:0,dt:0,t:e-this.seed})),this.root.updateMatrixWorld(!0);let t=n.flatMap(e=>this.bones.get(e)?.getWorldPosition(new I)??[]);for(let e=0;e<i.count;e++){let n=0;for(let t=0;t<4;t++)r.has(i.getComponent(e,t))&&(n+=a.getComponent(e,t));this.mesh.getVertexPosition(e,o),!(n>.85&&t.every(e=>e.distanceTo(o)>.18))&&(s=Math.min(s,o.y))}}return Object.assign(this.pose,e),this.auxNow=t,this.clip=null,this.applyPose(1),this.root.updateMatrixWorld(!0),s===1/0?0:.032-this.footLift-s}measureHead(){let e=this.mesh.geometry.getAttribute(`position`),t=this.mesh.geometry.getAttribute(`skinIndex`),n=new Set;this.sk.names.forEach((e,t)=>{for(let r=e;r;r=this.sk.parent.get(r))if(r===`neck`){n.add(t);break}});let r=0;for(let i=0;i<e.count;i++)n.has(t.getX(i))&&(r=Math.max(r,e.getY(i)));return r}inspect(){return{mesh:this.mesh,bones:this.bones,shape:this.shape,item:this.item,body:this.body,neck:this.neck,profile:this.prof,hold:this.hold}}setHat(e){if(!this.hatFit||(this.hat?.id??null)===e)return;if(this.hat){this.hat.holder.removeFromParent(),this.hat.built.group.traverse(e=>e.isMesh&&e.geometry.dispose());for(let e of this.hat.built.materials)e.dispose();this.hat=null}if(this.hatFx?.dispose(),this.hatFx=null,this.headHeight=this.baseHeadHeight,!e)return;let t=yt(e);if(!t)return;let n=`${this.hatFit.id}:${e}`,r=Vc.get(n);if(!r){let i=this.hatFit,a=this.prof.head+(this.sleepy?.2:0);r=vt(e,t,{...i.head,droop:a,bits:this.hatBits()},{...i.nudge,...i.nudge.hats?.[e]}),Vc.set(n,r)}let i=new je;i.position.set(...r.pos),i.rotation.set(...r.rot),i.scale.set(...r.scale),i.add(t.group),this.neck.add(i),this.hat={id:e,built:t,holder:i,fold:r.fold},this.applyHatGhost();let a=this.floats&&!this.flaps?this.hover:0;this.hatFx=Wa(e,this.baseHeadHeight-a,this.girth()),this.hatFx&&(this.hatFx.group.visible=this.hatFx.ground.visible=!1,this.float.add(this.hatFx.group),this.root.add(this.hatFx.ground));let o=this.sk.rest.get(`neck`).y+r.pos[1]+t.top*r.scale[1]+(this.floats?this.hover:0);this.headHeight=Math.max(this.baseHeadHeight,o)}girth(){let e=this.highGeo;e.boundingBox||e.computeBoundingBox();let t=e.boundingBox;return F.clamp(Math.max(-t.min.x,t.max.x)+.1,.36,.8)}showHatFx(e){this.hatFxOn=e}hatBits(){let e=this.hatFit,t=this.highGeo.getAttribute(`position`),n=this.highGeo.getAttribute(`skinIndex`),[r,i,a]=e.neckAt,{c:o,r:s}=e.head,c=Math.min(e.head.eye.at[1]-e.head.eye.r,o[1]),l=e.nudge.bumps,u=new Map;for(let e=0;e<t.count;e++){let d=this.sk.names[n.getX(e)];if(!Wc(d))continue;let f=new I(t.getX(e)-r,t.getY(e)-i,t.getZ(e)-a),p=d;if(d===`neck`){if(f.y<c)continue;let e=((f.x-o[0])/s[0])**2+((f.y-o[1])/s[1])**2+((f.z-o[2])/s[2])**2>1.25;if(e&&l===`none`)continue;p=e&&l!==`head`?`neck`:`skull`}(u.get(p)??u.set(p,[]).get(p)).push(f)}let d=[];for(let[e,t]of u){let n=e===`skull`?160:30,r=Math.max(1,Math.floor(t.length/n)),i=t.filter((e,t)=>t%r===0);if(e===`neck`)for(let n of Uc(t,.03))d.push({bone:e,is:`solid`,pts:n.filter((e,t)=>t%Math.max(1,Math.floor(n.length/30))===0)});else d.push({bone:e,is:e===`skull`?`head`:Wc(e),pts:i})}return d}applyHatGhost(){let e=this.hat?.built.solid??[];for(let{mesh:t,material:n}of e)t.material=this.ghost?this.ghostMaterial:n,t.castShadow=!this.ghost}setDetail(e){if(e!==this.detail){if(e===`low`){let e=this.prepareLow();if(!e)return;this.mesh.geometry=e}else this.mesh.geometry=this.highGeo;this.detail=e}}prepareLow(){if(!this.lowKit||!this.lowKey)return null;let e=wc.get(this.lowKey);return e||(e=Sc(an(this.lowKit),this.sk),wc.set(this.lowKey,e)),e}setItem(e){let t=e?`${e.k}:${e.c??``}`:``;t!==this.itemKey&&(this.itemKey=t,this.item&&=(this.handTilt.remove(this.item),Lo(this.item),null),this.hold=e?pc[e.k]??fc:null,e&&(this.item=Io(e),this.item.traverse(e=>e.castShadow=!this.ghost),this.handTilt.add(this.item)))}holdProp(e){for(let e of[...this.handTilt.children])e!==this.item&&this.handTilt.remove(e);e&&this.handTilt.add(e)}skinMaterials(){let e=this.glassMaterial?[this.ghost?this.ghostMaterial:this.glassMaterial]:[];return this.ghost?[this.ghostMaterial,_c,...e]:[this.material,this.eyeMaterial,...e]}setGhost(e){e!==this.ghost&&(this.ghost=e,this.mesh.material=this.skinMaterials(),this.mesh.castShadow=!e,!this.noLegs&&this.hasLegs&&(this.wisp.visible=e),this.wisp.material=e||!this.noLegs?this.ghostMaterial:this.material,this.item?.traverse(t=>t.castShadow=!e),this.applyHatGhost())}reach(e,t,n,r,i,a=`grip`){let o=this.shoulder,s=a===`paw`?this.paw:this.grip,c=new I(o.x-i,Math.max(.1,n),r),l=this.elbow?this.bendFor(s,c.distanceTo(o)):0,{ax:u,az:d,s:f}=Dc(o,this.elbow?this.bent(s,l):s,c,this.tendril?2:this.elbow?1.15:1.3);t!==`l`&&(e.arx=u,e.arz=d,e.sr=f,e.er=l),t!==`r`&&(e.alx=u,e.alz=-d,e.sl=f,e.el=l)}bent(e,t){let n=new I(0,this.elbow,0);return e.clone().add(n).applyAxisAngle(Ec,-t).sub(n)}bendFor(e,t){let n=0,r=2.6;if(this.bent(e,0).length()<=t)return 0;for(let i=0;i<14;i++){let i=(n+r)/2;this.bent(e,i).length()>t?n=i:r=i}return(n+r)/2}holdSpot(e){let t=this.shoulder.y-this.grip.length()*.8,n=Math.min(Math.max(t,this.shoulder.y+e.dy),this.sipLow?this.shoulder.y-.1:1/0);return{y:this.tendril?Math.max(n+.1,(e.hang??.08)+.18,.54):n+this.lift,z:Math.max(this.front+e.dz,this.front+this.pawR+(this.grip.z-this.paw.z)*.8)+(this.tendril?-.02:0)}}carryPose(e,t,n=!1){let r=this.hold;if(!r)return;let i=this.holdSpot(r),a=r.both&&!n;this.reach(e,a?`both`:`r`,i.y,i.z,a?r.out:Math.max(r.out,.04)),e.arx+=t,e.carry=0,a&&(e.alx+=t,e.carry=1)}headNow(e,t){return e.clone().sub(this.neckPos).applyAxisAngle(new I(1,0,0),t).add(this.neckPos)}reachLength(){return this.grip.length()}faceFront(e){let t=(e-this.headC.y)/this.headR.y;return this.headC.z+this.headR.z*Math.sqrt(Math.max(0,1-t*t))}besideHead(e=0){return this.headR.x+this.pawR+.03+e-Math.abs(this.shoulder.x)}raise(e,t,n,r=0){let i=this.besideHead(r)+(this.flaps?.22:0),a=this.shoulder,o=this.headC.z,s=this.paw.length()*1.25,c=s*s-i*i-(o-a.z)**2,l=a.y+Math.sqrt(Math.max(0,c));this.reach(e,t,Math.min(n,l),o,i,`paw`)}freePaw(e){if(!this.prof.paws)return;let t=this.rest();this.reach(t,`l`,this.shoulder.y-this.prof.paws,this.front+this.pawR+.01,-.035,`paw`),e.alx=t.alx,e.alz=t.alz,e.sl=t.sl,e.el=t.el}folded(e){return e.anim===`idle`||e.anim===`sit`||e.anim===`sleep`||e.anim===`drink`||e.anim===`fish`||e.anim===`laugh`||e.anim===`cry`}rest(){let e=uc();return e.alx=e.arx=-this.armFwd,e.alz=this.armOut,e.arz=-this.armOut,e}gait(e,t,n){let r=n.anim===`run`,i=this.phase,a=Math.sin,o=this.prof,s=F.clamp(Math.max(n.speed,r?3:1.5)/3.6,.35,.95)*o.stride;switch(o.gait){case`hop`:{let n=Math.max(0,a(i)),s=Math.max(0,-a(i));e.by=n*(r?.13:.085),e.brx=.05+n*.14,e.llx=e.lrx=n*.6-s*.25,this.reach(e,`both`,this.shoulder.y-(o.paws||.1)+n*.02,this.front+this.pawR+.01,-.03,`paw`),e.alx-=n*.15,e.arx-=n*.15,e.hrx=-n*.12,$(t,`earL`)[0]=$(t,`earR`)[0]=-.2-n*.45;break}case`slither`:{let n=a(i);$(t,`rear`)[5]=.08*n,e.hrx=-.14*Math.max(0,-n)+.05,e.hrz=a(i*.5)*.06,e.brx=0,e.by=Math.max(0,n)*.012,$(t,`stalkL`)[0]=$(t,`stalkR`)[0]=.18+.08*n,$(t,`stalkL`)[2]=.06+a(i*.5)*.08,$(t,`stalkR`)[2]=-.06+a(i*.5+1)*.08;break}case`waddle`:{e.llx=a(i)*s*.9,e.lrx=-a(i)*s*.9,e.brz=a(i)*.17,e.bry=a(i)*.06,e.by=Math.abs(a(i))*.03,e.brx=r?.12:.03,e.hrz=-e.brz*.7,e.hrx=-e.brx*.6;let t=.35+Math.abs(a(i))*.12;e.alz=this.armOut+t,e.arz=-this.armOut-t,e.alx=e.arx=-this.armFwd-.05,e.try=-a(i)*.45;break}case`float`:e.by=a(i*.5)*.03,e.brx=r?.25:.14,e.brz=a(i*.5)*.05,e.hrx=-e.brx*.4,e.alx=e.arx=-this.armFwd+.35+a(i-.8)*.15,e.alz=this.armOut+.1,e.arz=-this.armOut-.1,e.llx=e.lrx=.4+a(i-1.2)*.15;break;case`flap`:e.by=Math.abs(a(i))*.04,e.brx=r?.3:.18,e.hrx=-e.brx*.7,e.llx=e.lrx=.5,e.brz=a(i*.5)*.06;break;case`scuttle`:e.by=Math.abs(a(i*2))*.035,e.brz=a(i)*.1,e.bry=a(i)*.08,e.brx=r?.12:.04,e.hrz=-e.brz*.5,e.llx=a(i)*.3,e.lrx=-a(i)*.3,e.alx=-this.armFwd-.2-a(i)*.35,e.arx=-this.armFwd-.2+a(i)*.35,e.el=Math.max(0,a(i))*.6,e.er=Math.max(0,-a(i))*.6;break;case`amble`:{e.llx=a(i)*s*1.5,e.lrx=-a(i)*s*1.5;let n=r?Math.max(.58,this.armFwd+.25):Math.max(.34,this.armFwd+.08);e.alx=-n-a(i)*s*(r?.5:.55),e.arx=-n+a(i)*s*(r?.5:.55),e.el=Math.max(0,a(i))*.7,e.er=Math.max(0,-a(i))*.7,e.alz=.1,e.arz=-.1,e.brz=a(i)*.13,e.bry=a(i)*.09,e.by=Math.abs(a(i))*.04,e.brx=r?.18:.06,e.hrx=-e.brx*.6+a(i*2)*.05,e.hrz=-a(i)*.1,e.try=a(i-.6)*.4,e.trx=r?.2:.05,$(t,`tail1`)[1]=a(i-1.2)*.3,$(t,`tail2`)[1]=a(i-1.8)*.35;break}default:{e.llx=a(i)*s*1.4,e.lrx=-a(i)*s*1.4;let n=Math.max(.3,this.armFwd);e.alx=-n-a(i)*s*.55,e.arx=-n+a(i)*s*.55,e.el=Math.max(0,a(i))*.8,e.er=Math.max(0,-a(i))*.8,e.alz=.12,e.arz=-.12,e.by=Math.abs(a(i))*(r?.06:.045),e.brz=a(i)*.07,e.bry=a(i)*.05,e.brx=r?.14:.05,e.hrx=-e.brx*.6+Math.abs(a(i))*.04,e.try=a(i-.6)*.4,e.trx=r?.25:.08,$(t,`tail1`)[1]=a(i-1.2)*.3,$(t,`tail2`)[1]=a(i-1.8)*.35}}if(o.earsBack&&o.gait!==`hop`&&($(t,`earL`)[0]=$(t,`earR`)[0]=-o.earsBack*(r?1:.5)),this.hold){let t=[e.alx,e.alz,e.sl,e.el];this.carryPose(e,o.gait===`hop`?0:a(i)*.06),this.hold.both||([e.alx,e.alz,e.sl,e.el]=t)}}sit(e,t,n){let r=this.shoulder,i=this.prof.sit;if(i===`settle`||!this.hasLegs)e.by=-.01,e.hrx=.12,$(t,`rear`)[5]=.025,$(t,`stalkL`)[0]=$(t,`stalkR`)[0]=.3,$(t,`stalkL`)[2]=.12,$(t,`stalkR`)[2]=-.12,this.hold&&this.carryPose(e,0);else if(e.by=-this.seat+.004,i===`feet`?(e.brx=-.14,e.llx=e.lrx=this.sitLeg??-1.5,e.llz=.22,e.lrz=-.22,this.reach(e,`both`,r.y-Math.min(.2,this.grip.length()*.7),this.front+this.pawR+.005,-.05,`paw`),e.hrx=.1,e.trx=.4):(e.llx=e.lrx=this.sitLeg??-1.3,e.llz=.16,e.lrz=-.16,this.reach(e,`both`,this.seat+this.pawR*.8,this.front+this.pawR+.03,-.02,`paw`),i===`wrap`?(e.trx=.8,e.try=-.34,$(t,`tail1`)[0]=-.8,$(t,`tail1`)[1]=-1.6,$(t,`tail2`)[0]=-.66,$(t,`tail2`)[1]=-.85,e.hrz=.16,e.hry=.12+Math.sin(n*.3)*.08):(e.trx=.67,e.try=-.08,$(t,`tail1`)[0]=-.79,$(t,`tail1`)[1]=-1.08,$(t,`tail2`)[0]=.29,$(t,`tail2`)[1]=-1.21,e.hry=Math.sin(n*.35)*.2)),this.hold){let t=[e.alx,e.alz,e.sl,e.el];this.carryPose(e,0),this.hold.both||([e.alx,e.alz,e.sl,e.el]=t)}}dance(e,t,n,r){let i=Math.sin,a=Math.cos,o=this.shoulder,s=this.sk.rest.get(`legL`).y,c=r*2,l=(e,n)=>{$(t,`earL`)[0]=$(t,`earR`)[0]=e,$(t,`earL`)[2]=$(t,`earR`)[2]=n};switch(n){case`twerk`:{let n=Math.abs(i(r*13)),a=i(r*13),c=i(r*Math.PI);e.brx=.62+n*.16,e.bz=-.07,e.by=-.04+n*.035,e.bry=a*.15+c*.1,e.brz=a*.24,e.bx=o.y*i(e.brz),e.llx=e.lrx=-.6,e.llz=.32,e.lrz=-.32,this.reach(e,`both`,Math.max(s-.04,.12),this.front+this.pawR+.02,.06,`paw`);let u=F.smoothstep(i(r*1.3),.3,.8);e.hrx=-.55,e.hry=u*.9,e.hrz=u*.2,e.trx=.7,e.try=a*.9,$(t,`tail1`)[1]=a*.5,$(t,`tail2`)[1]=-a*.6,$(t,`rear`)[3]=a*.04,l(0,a*.2);break}case`griddy`:{let t=c%8;if(t<6){let n=Math.floor(t)%2?1:-1,r=i(t%1*Math.PI);e.by=r*.06,e.brx=-.1,e.llx=n>0?-.75*r:.15*r,e.lrx=n<0?-.75*r:.15*r,e.bry=n*.2*r,e.brz=n*.05;let a=n*(.4+.6*r);e.alx=-.3-a,e.arx=-.3+a,e.alz=this.armOut+.25,e.arz=-this.armOut-.25,e.el=e.er=.7,e.hrz=-n*.1,e.try=n*.6}else{let t=this.headNow(this.eyePos,-.15);this.reach(e,`both`,t.y,t.z+this.pawR+.04,t.x-Math.abs(o.x)-.02,`paw`);let n=i(r*10);e.alx+=n*.06,e.arx-=n*.06,e.hrx=-.15,e.hry=i(r*3)*.3,e.by=Math.abs(i(r*Math.PI*2))*.03,e.brx=-.06,e.llz=.12,e.lrz=-.12}l(-.15,0);break}case`floss`:{let t=i(r*Math.PI*2.2);e.alz=this.armOut+.2+t*1.15,e.arz=-this.armOut-.2+t*1.15,e.alx=e.arx=-.15-t*.95,e.brz=t*.16,e.bry=-t*.22,e.hrz=-t*.22,e.by=Math.abs(a(r*Math.PI*2.2))*.025,e.llz=.1-t*.12,e.lrz=-.1-t*.12,e.try=-t*.6,l(0,t*.2);break}case`robot`:{let t=Math.floor(c)%8,n=Math.PI*.85,r=-1.5,[i,a,o,s,l,u,d,f]=[[r,.15,r,-.15,0,0,0,0],[r,.15,-.1,-n,0,-.55,0,0],[-.1,1.5,-.1,-1.5,0,0,.45,0],[-.1,1.5,-.1,-1.5,1.4,.4,.45,.15],[-.1,n,r,-.15,0,.55,-.4,0],[-.2,.2,-.2,-.2,1.5,0,-.4,.3],[-.1,2.3,-.1,-.7,.9,-.3,0,-.1],[-.1,.7,-.1,-2.3,.9,.3,0,-.1]][t];e.alx=i,e.alz=a,e.arx=o,e.arz=s,e.el=e.er=l,e.hry=u,e.bry=d,e.hrx=f,e.by=Math.max(0,1-c%1*6)*.025,e.llz=.08,e.lrz=-.08;break}case`moonwalk`:{let t=r%4;if(t<2.8){let n=t/2.8;e.bz=.13-.3*n;let r=i(n*Math.PI*4);e.llx=r*.35,e.lrx=-r*.35,e.by=Math.abs(r)*.015,e.brx=.06,e.alx=-.2+r*.3,e.arx=-.2-r*.3,e.el=e.er=.8,e.hrx=-.05+Math.abs(r)*.05,e.try=r*.3}else if(t<3.4){let n=F.smoothstep((t-2.8)/.6,0,1);e.bry=n*Math.PI*2,e.bz=-.17+.3*n,e.alz=this.armOut+.6,e.arz=-this.armOut-.6,e.llz=.05,e.lrz=-.05,e.try=.6}else e.bz=.13,e.by=.04,e.brx=-.08,this.raise(e,`r`,this.headC.y+this.headR.y+.1,0),e.alz=this.armOut+.3,e.hrz=.2,e.hrx=-.15,e.llz=.02,e.lrz=-.02,l(-.3,0);break}case`horse`:{let t=r*4,n=Math.abs(i(t*Math.PI)),s=Math.floor(t/2)%2==0;e.by=n*.06,e.llx=s?-.55*n:.05,e.lrx=s?.05:-.55*n,e.brx=-.06,e.bry=(s?1:-1)*.12,e.brz=(s?-1:1)*.05,this.reach(e,`both`,o.y-.04+n*.03,this.front+this.pawR+.08,o.x-.02,`paw`),c%16>=12?(this.raise(e,`r`,this.headC.y+this.headR.y+.14,.04+i(r*14)*.08),e.arx+=a(r*14)*.25,e.hrx=-.2):e.hrx=n*.12-.04,e.try=(s?1:-1)*.5,l(-.2+n*.2,0);break}case`macarena`:{let t=c%16,n=Math.floor(t/2),r=Math.floor((t+15)/2)%8,a=o.x*2-.02,u=this.shape.tc[2]-this.shape.tr[2]-this.pawR,d=(t,n)=>{switch(Math.min(n,5)){case 0:this.reach(e,t,o.y-.02,this.front+.4,-.02,`paw`);break;case 1:this.reach(e,t,o.y+.04,this.front+.4,-.02,`paw`);break;case 2:this.reach(e,t,o.y-.02,this.front+this.pawR,a,`paw`);break;case 3:this.reach(e,t,this.headC.y+.04,this.headC.z-this.headR.z*.2,this.besideHead(.01),`paw`);break;case 4:this.reach(e,t,s+.04,this.front+this.pawR,a*.6,`paw`);break;default:this.reach(e,t,s+.02,u,.02,`paw`)}};d(`r`,n),d(`l`,r);let f=t>=12&&t<15?i((t-12)*Math.PI*2):0;e.bry=f*.25,e.brz=-f*.08,e.try=f*.8;let p=Math.floor(c/16)+(t>=15?F.smoothstep(t-15,0,1):0);e.bry+=p%4*(Math.PI/2),e.by=t>=15?i((t-15)*Math.PI)*.12:Math.abs(i(c*Math.PI))*.015,e.hry=t<12?n%2?.15:-.15:0,e.hrz=i(c*Math.PI)*.06,l(0,i(c*Math.PI)*.15);break}default:this.boughtDance(e,t,n,r)}}boughtDance(e,t,n,r){let i=Math.sin,a=Math.cos,o=this.shoulder,s=r*2,c=F.smoothstep,l=e=>o.x+e,u=(e,n)=>{$(t,`earL`)[0]=$(t,`earR`)[0]=e,$(t,`earL`)[2]=$(t,`earR`)[2]=n};switch(n){case`chicken`:{let n=s%8,a=i(r*Math.PI*8);if(n<2)this.reach(e,`both`,o.y+.03,this.front+this.pawR+.1,l(this.pawR+(a>0?.06:.01)),`paw`),e.hrx=a>0?-.12:.05,e.by=Math.abs(a)*.01;else if(n<4){let t=Math.abs(a);e.alz=this.armOut+.25+t*.75,e.arz=-(this.armOut+.25+t*.75),e.alx=e.arx=-.15,e.el=e.er=1.7,e.hrx=-.1+t*.12,e.by=t*.02}else if(n<6){let r=i((n-4)/2*Math.PI);e.by=-.07*r,e.brx=.25*r,e.bry=a*.3,e.try=a*1.1,e.llz=.1+r*.15,e.lrz=-.1-r*.15,e.alz=this.armOut+.45,e.arz=-(this.armOut+.45),e.el=e.er=1.3,$(t,`rear`)[3]=a*.05}else{let t=Math.abs(i(r*Math.PI*4));this.reach(e,`both`,o.y-.02,this.front+this.pawR+.08,l(this.pawR*.8+t*.08),`paw`),e.by=(1-t)*.015,e.hrx=-.08}u(-.1,a*.15);break}case`sprinkler`:{let t=s%6,n,r=0;if(t<4){let e=Math.floor(t*2),i=t*2%1;n=-.75+1.5*((e+Math.min(1,i*5))/8),r=Math.max(0,1-i*5)}else n=.75-1.5*c((t-4)/2,0,1);e.bry=n,this.reach(e,`l`,this.headC.y+.04,this.headC.z-this.headR.z*.2,this.besideHead(.01),`paw`),e.arx=-1.45+r*.06,e.arz=-this.armOut-.25,e.er=0,e.hry=n*.3,e.hrz=-.08,e.llx=-.25,e.lrx=.1,e.by=-.015-r*.012,e.try=n*.6,u(-.05,0);break}case`runningman`:{let t=Math.floor(s)%2==0,n=i(s%1*Math.PI);e.by=.015+n*.07,e.llx=t?-1*n:.4*n,e.lrx=t?.4*n:-1*n,e.brx=.1,e.el=e.er=1.4,e.alx=t?-.1+.4*n:-.5-.5*n,e.arx=t?-.5-.5*n:-.1+.4*n,e.alz=this.armOut+.1,e.arz=-this.armOut-.1,e.hrx=-.06+n*.06,e.bry=(t?1:-1)*.08*n,e.try=(t?1:-1)*.5,u(-.2+n*.2,0);break}case`ymca`:{let t=s%8,n=Math.floor(t/2),r=Math.max(0,1-t%2*4),a=this.headC.y+this.headR.y;e.by=Math.abs(i(s*Math.PI))*.015+r*.04,n===0?(e.alz=Math.PI*.78,e.arz=-Math.PI*.78,e.alx=e.arx=-.1,e.hrx=-.12):n===1?(this.raise(e,`both`,a,-.01),e.hrx=.1):n===2?(e.brz=.22,e.bx=o.y*i(.22)*.5,e.alz=2.3,e.alx=-.2,e.el=.9,this.reach(e,`r`,o.y-.06,this.front+this.pawR+.08,l(-o.x*.6),`paw`),e.hrz=.15):(e.alz=Math.PI*.94,e.arz=-Math.PI*.94,e.alx=e.arx=-.12,e.hrx=-.15),e.try=i(s*Math.PI)*.4,u(-.15,0);break}case`carlton`:{let t=s%8;if(t<6){let t=a(s*Math.PI),n=Math.abs(i(s*Math.PI));e.alz=this.armOut+.35+t*.8,e.arz=-(this.armOut+.35)+t*.8,e.alx=e.arx=-.55,e.el=e.er=1.1,e.bry=-t*.35,e.brz=-t*.07,e.bx=-t*.03,e.by=n*.03,e.llx=t>0?-.35*n:.05,e.lrx=t<0?-.35*n:.05,e.hry=t*.25,e.hrz=t*.1,e.try=-t*.7,u(0,t*.2)}else{let n=c(t-6,0,.3);e.alz=this.armOut+n*(Math.PI*.85-this.armOut),e.arz=-e.alz,e.alx=e.arx=-.2,e.hrx=-.3*n,e.by=i(Math.min(1,(t-6)/1.2)*Math.PI)*.06,e.brx=-.08*n,e.try=.8,u(-.3,0)}break}case`worm`:{let t=s%2/2,n=i(t*Math.PI*2),r=i(t*Math.PI*2-1.6);if(!this.hasLegs||this.floats){e.brx=.3-r*.25,e.by=Math.max(0,n)*.05,e.hrx=-.3-Math.max(0,r)*.3,e.trx=n*.5;break}e.brx=1.42-r*.22+n*.12,e.by=.15+Math.max(0,n)*.06+Math.max(0,r)*.05,e.bz=-.38+i(t*Math.PI)*.03,e.hrx=-1-Math.max(0,r)*.4,e.alx=e.arx=-2.4+Math.max(0,r)*.5,e.alz=this.armOut+.3,e.arz=-this.armOut-.3,e.el=e.er=.6+Math.max(0,-r)*.6,e.llx=e.lrx=.3+Math.max(0,n)*.6,e.llz=.08,e.lrz=-.08,e.trx=.5+n*.4,u(.25,0);break}default:this.moreDances(e,t,n,r)}}moreDances(e,t,n,r){let i=Math.sin,a=Math.cos,o=this.shoulder,s=this.sk.rest.get(`legL`).y,c=r*2,l=F.smoothstep,u=this.headC.y+this.headR.y,d=e=>o.x+e,f=(e,n)=>{$(t,`earL`)[0]=$(t,`earR`)[0]=e,$(t,`earL`)[2]=$(t,`earR`)[2]=n},p=(e,t)=>this.reach(e,t,s+.04,this.front*.4+this.pawR,.05,`paw`),m=(e,t,n=0)=>{let r=[e.arx,e.arz,e.sr,e.er];this.raise(e,`both`,t,n),[e.arx,e.arz,e.sr,e.er]=r},h=(t,n,r=.3)=>{let i=c/n,a=Math.floor(i),o=l(i-a,0,r),s=this.rest(),u=this.rest();t[(a+t.length-1)%t.length](s),t[a%t.length](u);for(let t of cc)e[t]=s[t]+(u[t]-s[t])*o;return{i:a%t.length,u:o}};switch(n){case`dougie`:{let t=i(c*Math.PI/2),n=i(c*Math.PI*2)*.25;e.brz=t*.14,e.bx=-t*.03,e.by=-Math.abs(i(c*Math.PI))*.025,e.llz=.12+t*.08,e.lrz=-.12+t*.08,t>0?(this.raise(e,`r`,u+.04,-.02),e.arx+=n,e.alz=this.armOut+.35,e.el=.8):(m(e,u+.04,-.02),e.alx+=n,e.arz=-this.armOut-.35,e.er=.8),e.hry=-t*.25,e.hrz=t*.1,e.try=t*.6,f(0,t*.2);break}case`renegade`:{let t=this.armOut,{u:n}=h([e=>(e.alz=1.9,e.arz=-t-.3,e.brz=-.06),e=>(e.alz=t+.3,e.arz=-1.9,e.brz=.06),e=>(e.alx=e.arx=-1.3,e.alz=-.35,e.arz=.35,e.el=e.er=1.3,e.by=-.02),e=>(e.arz=-2.6,e.arx=-.3,p(e,`l`),e.bx=.03,e.brz=.1,e.hrx=-.2),e=>(p(e,`both`),e.by=-.03,e.hrz=.15),e=>(e.alx=e.arx=-1.4,e.bry=.35,e.el=e.er=.3,e.try=.6),e=>(e.alx=e.arx=-1.4,e.bry=-.35,e.el=e.er=.3,e.try=-.6),e=>(e.alx=e.arx=-.4,e.alz=-.25,e.arz=.25,e.by=-.06,e.brx=.2,e.llz=.2,e.lrz=-.2)],.5,.35);e.by+=(1-n)*.01,f(-.1,0);break}case`ladies`:{let t=i(c*Math.PI),n=Math.sign(t)*Math.sqrt(Math.abs(t));e.alz=Math.PI*.82,e.alx=-.25+i(r*Math.PI*4)*.3,e.el=.25+Math.max(0,i(r*Math.PI*4))*.35,p(e,`r`),e.bx=n*.035,e.brz=-n*.09,e.by=Math.abs(t)*.012,e.llx=n>0?-.2*n:0,e.lrx=n<0?.2*n:0,e.hrz=n*.12,e.hry=-.2,e.try=n*.7,f(0,n*.2);break}case`hustle`:{let t=c%8,n=i(c*Math.PI/2);if(e.bx=n*.05,e.llz=.08+Math.max(0,n)*.18,e.lrz=-.08+Math.min(0,n)*.18,e.by=Math.abs(i(c*Math.PI))*.015,t<6){let t=r*Math.PI*4,n=this.front+this.pawR+.06;this.reach(e,`r`,o.y-.06+i(t)*.04,n+a(t)*.04,d(this.pawR*.5),`paw`),this.reach(e,`l`,o.y-.06-i(t)*.04,n-a(t)*.04,d(this.pawR*.5),`paw`),e.hrx=i(t)*.05}else{let n=l(t-6,0,.25);e.arz=-this.armOut-n*2.1,e.arx=-.3*n,p(e,`l`),e.hrx=-.25*n,e.hrz=.1*n}e.try=n*.6,f(0,n*.15);break}case`chacha`:{let t=c%16,n=i(c*Math.PI);if(t<8){let r=t<4,a=l(t%4/4,0,.6);e.bx=r?-.06+.12*a:.06-.12*a;let o=i(t%4/4*Math.PI);r?e.llz=.1+o*.3:e.lrz=-.1-o*.3,e.alz=this.armOut+.25+(r?o*.5:0),e.arz=-this.armOut-.25-(r?0:o*.5),e.by=Math.abs(n)*.01,e.hry=r?.2:-.2}else if(t<12){let n=i((t-8)%2*Math.PI);e.by=Math.abs(i(c*Math.PI))*.05;let r=(t-8)%2<1;e.llz=r?-.18*n:.25*n,e.lrz=r?.18*n:-.25*n,e.alz=this.armOut+.6,e.arz=-this.armOut-.6,e.el=e.er=.6}else{let t=i(r*Math.PI*6);e.by=-.04,e.brx=.08,e.bry=t*.25,e.brz=t*.06,e.llz=.2,e.lrz=-.2,e.alx=e.arx=-.9,e.el=e.er=1.6,e.alz=this.armOut+.3+t*.2,e.arz=-this.armOut-.3+t*.2,e.try=t}f(0,n*.15);break}case`charleston`:{let t=i(c*Math.PI),n=i(c*Math.PI*2),r=Math.floor(c/4)%2==0,a=t*.65;r?(e.lrx=-a,e.llx=a*.15):(e.llx=-a,e.lrx=a*.15),e.bry=n*.15,e.brx=.12,e.by=Math.abs(n)*.015,e.alx=a*.9-.4,e.arx=-a*.9-.4,e.alz=this.armOut+.45,e.arz=-this.armOut-.45,e.el=e.er=.9+Math.abs(n)*.3,e.hry=-n*.12,e.hrz=t*.08,e.try=n*.6,f(-.1,n*.2);break}case`cabbage`:{let t=r*Math.PI*2;this.reach(e,`both`,o.y-.04+i(t)*.05,this.front+this.pawR+.07+a(t)*.04,d(this.pawR*.9),`paw`),e.by=Math.abs(i(t))*.02-.015,e.brz=a(t)*.06,e.bry=i(t)*.15,e.bx=a(t)*.02,e.hrx=i(t)*.08,e.llz=.12,e.lrz=-.12,e.try=a(t)*.6,f(0,a(t)*.15);break}case`cart`:{let t=c%8,n=i(c*Math.PI),r=s+(o.y-s)*.55,a=this.front+this.pawR+.12+Math.abs(n)*.03;if(e.llx=n*.3,e.lrx=-n*.3,e.by=Math.abs(n)*.015,e.brx=.1,this.reach(e,`both`,r,a,0,`paw`),t>=4&&t<6){let n=i((t-4)/2*Math.PI);this.raise(e,`r`,u+.05*n,.06*n),e.hry=-.5*n,e.hrx=-.25*n,e.bry=-.25*n}else if(t>=6){let n=i((t-6)/2*Math.PI);this.reach(e,`r`,r+.03-n*.04,a+.06*n,-.01,`paw`),e.hrx=.2*n}e.try=n*.4,f(-.1,0);break}case`twist`:{let t=c%8,n=i(c*Math.PI);if(e.bry=n*.4,e.try=-n*.9,e.by=-.035-Math.abs(n)*.015,e.brx=.06,e.llz=.14,e.lrz=-.14,e.llx=e.lrx=-.1,e.alx=e.arx=-.5,e.el=e.er=1.3,e.alz=this.armOut+.35-n*.25,e.arz=-this.armOut-.35-n*.25,t>=6){let n=l(t-6,.1,1.6),r=this.headC.y+.02;this.reach(e,`r`,r,this.faceFront(r)+this.pawR+.02,d(-.02)*(1-n)+this.besideHead(-.02)*n,`paw`),e.bry*=.3,e.hry=-.1}e.hrz=-n*.1,f(0,n*.2);break}case`eslide`:{let t=c%16,n=i(c*Math.PI);if(t<8){let a=t<4,s=t%4/4;e.bx=(a?-1:1)*(l(s,0,1)-.5)*.12;let c=i(s*Math.PI*2);e.llz=.08+c*.2*(a?-1:1),e.lrz=-.08+c*.2*(a?-1:1),e.by=Math.abs(i(s*Math.PI*4))*.012,t%4>=3?this.reach(e,`both`,o.y-.03,this.front+this.pawR+.06,d(this.pawR*(i(r*Math.PI*4)>0?.9:2.5)),`paw`):(e.alx=-.2+n*.3,e.arx=-.2-n*.3,e.el=e.er=.7)}else if(t<12){let n=i((t-8)/4*Math.PI*2);e.brx=n*.12,e.bz=n*.03,e.llx=-Math.max(0,n)*.3,e.lrx=Math.max(0,-n)*.3,e.alx=e.arx=-.3+n*.4,e.el=e.er=.8}else{let n=i((t-12)/2*Math.PI);e.llx=t<14?-.8*n:0,e.by=t<14?0:i((t-14)/2*Math.PI)*.06,e.alz=this.armOut+.5,e.arz=-this.armOut-.5}let a=Math.floor(c/16)+(t>=14?l(t-14,0,1.5):0);e.bry+=a%4*(Math.PI/2),e.try=n*.5,f(0,n*.15);break}case`pointer`:{let{i:t}=h([e=>{this.raise(e,`r`,u+.12,.08),e.hrx=-.3,e.hry=-.2,e.bx=.03,e.brz=.08,e.lrx=-.2,p(e,`l`)},e=>{this.reach(e,`r`,s-.02,this.front+this.pawR+.03,d(.04),`paw`),e.hrx=.15,e.hry=.2,e.bx=-.02,e.brz=-.05,e.by=-.02,p(e,`l`)}],1,.25);e.try=t?-.5:.5,f(t?.1:-.2,0);break}case`riverdance`:{let t=c%8;e.alz=this.armOut*.5,e.arz=-this.armOut*.5,e.alx=e.arx=0,e.brx=-.03,e.hrx=-.12;let n=c*2,r=i(n%1*Math.PI),a=Math.floor(n)%2==0;if(t<6){let t=Math.floor(n)%4<2?.45:-.35;e.llx=a?t*r:0,e.lrx=a?0:t*r,e.by=r*.03}else e.llx=a?-1.1*r:0,e.lrx=a?0:-1.1*r,e.by=r*.05,e.brx=-.08;e.trx=-.3,f(-.2,0);break}case`hokey`:{let t=c%16,n=Math.floor(c/16)%2==0,a=0,s=0;if(t<2?a=-.6*l(t,0,.4):t<4?[a,s]=[.3,.25]:t<6?a=-.6:t<8&&(a=-.5+i(r*30)*.2),n?(e.llx=a,e.llz=s):(e.lrx=a,e.lrz=-s),t<8)e.brx=-.06,e.alz=this.armOut+.4,e.arz=-this.armOut-.4,e.hrx=.15;else if(t<12){let t=i(r*20);e.alz=Math.PI*.8+t*.1,e.arz=-Math.PI*.8+t*.1,e.alx=e.arx=-.2,e.bry=i(c*Math.PI)*.3,e.by=Math.abs(i(c*Math.PI))*.02,e.try=t}else if(t<14)e.bry=l(t-12,0,2)*Math.PI*2,e.alz=this.armOut+.6,e.arz=-this.armOut-.6,e.by=Math.abs(i(c*Math.PI*2))*.02;else{let t=Math.abs(i(r*Math.PI*2));this.reach(e,`both`,o.y-.02,this.front+this.pawR+.06,d(this.pawR*.8+t*.08),`paw`),e.hrx=-.1}f(-.1,0);break}case`defaultdance`:{let t=c%4,n=Math.floor(c)%2==0,r=i(c%1*Math.PI),a=n?1:-1;if(t<2)e.by=r*.04,e.bx=a*.03,e.llz=.1+(n?.2:0)*r,e.lrz=-.1-(n?0:.2)*r,e.alx=n?-1.2:.5,e.alz=n?-.25:this.armOut+.2,e.el=n?1.4:.2,e.arx=n?.5:-1.2,e.arz=n?-this.armOut-.2:.25,e.er=n?.2:1.4,e.bry=-a*.2,e.hry=a*.15;else{let t=i(c*Math.PI*2);e.by=-Math.abs(t)*.03,e.llx=e.lrx=-.1,e.llz=.15,e.lrz=-.15,e.alx=-.7+t*.5,e.arx=-.7-t*.5,e.el=e.er=1.5,e.alz=this.armOut+.2,e.arz=-this.armOut-.2,e.hrx=Math.abs(t)*.12}e.try=a*.6,f(0,a*.15);break}case`orange`:{let t=i(c*Math.PI);e.alz=this.armOut+t*.85,e.arz=-this.armOut+t*.85,e.alx=e.arx=-.35,e.brz=-t*.1,e.bx=t*.03,e.llz=.14-t*.24,e.lrz=-.14-t*.24,e.llx=e.lrx=-.12,e.by=-.02+Math.abs(t)*.02,e.brx=.08,e.hrz=t*.12,e.hry=-t*.2,e.try=t*.8,f(0,t*.2);break}case`woah`:{let t=Math.floor(c/2)%2?1:-1,n=c%2/2,r=l(n,0,.1)*(1-l(n,.75,1)*.7);e.by=-.05*r,e.brz=-t*.15*r,e.bry=t*.3*r,e.alz=this.armOut+t*1*r+.2,e.arz=-this.armOut+t*1*r-.2,e.alx=e.arx=-.7*r-.14,e.el=e.er=.7*r,e.llz=.18*r,e.lrz=-.18*r,e.hrz=-t*.2*r,e.hrx=.15*r,e.try=t*r,f(-.2*r,0);break}case`windmill`:{let t=r*7;if(!this.hasLegs||this.floats){e.bry=t,e.alz=this.armOut+1.2,e.arz=-this.armOut-1.2,e.by=Math.abs(i(r*7))*.02;break}e.brz=1.15,e.bry=t;let n=i(1.15)*o.y*.5;e.bx=n*a(t),e.bz=-n*i(t),e.by=.1,e.llz=.9+i(t)*.15,e.lrz=-.9+i(t)*.15,e.llx=e.lrx=-.2,e.alz=this.armOut+.3,e.arz=-this.armOut-.3,e.el=e.er=1.2,e.alx=e.arx=-.8,e.hrz=-.4,e.trx=.4,f(.3,0);break}case`dabdance`:{let{i:t}=h([e=>(e.arx=-1.75,e.arz=.35,e.er=1.9,e.alz=2.25,e.alx=-.35,e.hrx=.45,e.hry=-.45,e.hrz=.2,e.bry=-.15,e.by=-.015),e=>(e.alx=-1.75,e.alz=-.35,e.el=1.9,e.arz=-2.25,e.arx=-.35,e.hrx=.45,e.hry=.45,e.hrz=-.2,e.bry=.15,e.by=-.015)],2,.08);e.try=t?.6:-.6,f(.15,0);break}case`vogue`:{let t=this.headC.y,n=this.faceFront(t)+this.pawR,{i:r}=h([e=>(this.reach(e,`both`,t,n-this.headR.z*.4,this.besideHead(-.03),`paw`),e.hrx=-.12,e.bx=.02,e.brz=.05),e=>(this.reach(e,`r`,t+this.headR.y*.4,n+.03,d(.02),`paw`),e.alz=1.5,e.alx=-.1,e.hry=.3,e.bx=-.02,e.brz=-.05),e=>(this.raise(e,`r`,u+.06,-.01),this.reach(e,`l`,o.y,this.front+this.pawR+.07,d(.02)),e.bry=-.3,e.hry=.25),e=>(this.reach(e,`r`,t-.04,n+.01,this.besideHead(-.04),`paw`),p(e,`l`),e.hrx=-.3,e.hrz=.15,e.bx=.03,e.brz=.07)],1,.2);e.try=(r%2?1:-1)*.6,f(-.1,0);break}case`cancan`:{let t=Math.floor(c)%2==0,n=i(c%1*Math.PI);t?e.llx=-1.5*n:e.lrx=-1.5*n,e.by=(1-n)*Math.abs(i(c*Math.PI*2))*.02+n*.02,e.brx=-.12*n;let a=i(r*Math.PI*2);e.alz=this.armOut+.7+a*.2,e.arz=-this.armOut-.7+a*.2,e.alx=e.arx=-.5,e.el=e.er=.9,e.hrx=-.1*n,e.hrz=a*.1,e.bry=a*.15,e.try=(t?1:-1)*.6,f(-.2*n,0);break}}}gesture(e,t,n,i,a){let o=Math.sin,s=F.smoothstep,c=this.shoulder,l=Math.abs(c.x),u=r(n)?.time??2.5,d=i%(u+.6),f=-l,p=(e,t)=>this.headNow(e,t+this.prof.head-this.prof.lean),m=e=>p(this.headC.clone().add(new I(0,this.headR.y*.35,this.headR.z*.8)),e),h=e=>{$(t,`earL`)[0]=$(t,`earR`)[0]=e,$(t,`stalkL`)[0]=$(t,`stalkR`)[0]=e};switch(n){case`facepalm`:{let t=.32+(d>.5?o(d*7)*.04:0);e.hrx=t,e.hry=d>.5?o(d*4.5)*.15:0;let n=p(this.eyePos,t);this.reach(e,`r`,n.y+.02,n.z+this.pawR+.02,f,`paw`),this.freePaw(e),e.brx=.06,e.by=-.01,this.shut=1,h(.3);break}case`shrug`:{let t=s(d,.1,.35)*(1-s(d,u-.45,u-.1));this.reach(e,`both`,c.y-.06+t*.05,this.front+this.pawR+.05,.08+t*.08,`paw`),e.by=t*.025,e.hrz=t*.22,e.hrx=-.06*t,e.brz=-.03*t,h(-.2*t);break}case`slowclap`:{let t=(.5+.5*Math.cos(d*Math.PI*2))**.7;this.reach(e,`both`,c.y-.06,this.front+this.pawR+.08,f+this.pawR+t*.09,`paw`),e.hrx=.05,e.by=-.005,this.shut=.4;break}case`thumbsup`:this.reach(e,`r`,c.y+.02,this.front+.14,.04),this.freePaw(e),e.hrz=-.14,e.hrx=-.06,e.by=Math.max(0,o(Math.min(d,.5)*Math.PI*2))*.025;break;case`salute`:{let t=m(-.06);e.hrx=-.06,e.brx=-.1,this.reach(e,`r`,t.y,t.z+this.pawR,f+this.headR.x*.45,`paw`),e.alx=-this.armFwd*.3,e.alz=this.armOut*.4,e.sl=1,e.llz=.02,e.lrz=-.02;break}case`bow`:{let t=s(d,.15,.6)*(1-s(d,u-.7,u-.15));e.brx=.75*t,e.hrx=.2*t,e.bz=-.03*t,this.reach(e,`r`,c.y-.18,this.front+this.pawR,-l*.7,`paw`),e.alx=.5*t-this.armFwd*(1-t),e.alz=this.armOut+.35*t;break}case`blowkiss`:if(d<.75){let t=p(this.mouth,0);this.reach(e,`r`,t.y,t.z+this.pawR+.01,f,`paw`),e.brx=.05,this.shut=.6*s(d,.3,.6)}else this.reach(e,`r`,c.y+.12,this.front+.22,.12,`paw`),e.hrx=-.1,e.hrz=.15,e.brx=-.04;this.freePaw(e);break;case`micdrop`:this.reach(e,`r`,c.y+.04,this.front+.16,.2),this.freePaw(e),e.hry=-.35,e.hrx=-.12,e.brx=-.06,e.bry=-.45*s(d,1.9,2.4);break;case`dab`:this.reach(e,`l`,this.headC.y+.18,this.front-.02,.32,`paw`),this.reach(e,`r`,this.headC.y+.06,this.front+.1,f*2-.1,`paw`),e.hrx=.38,e.hry=-.4,e.brz=.08,e.bry=.15,e.by=-.01;break;case`loser`:{let t=m(0);this.reach(e,`r`,t.y,t.z+this.pawR+.01,f+this.headR.x*.15,`paw`),this.freePaw(e),e.hrz=o(d*3)*.12,e.bry=o(d*3)*.1,e.by=Math.abs(o(d*3))*.01;break}case`think`:{let t=-.12;e.hrx=t,e.hrz=.15,e.hry=.2;let n=p(this.mouth,t),r=o(d*5)*.012;this.reach(e,`r`,n.y-.05+r,n.z+this.pawR*.6,f+r,`paw`),this.reach(e,`l`,c.y-.2,this.front+this.pawR,-l*.5,`paw`);break}case`shush`:{let t=.05;e.hrx=t,e.brx=.12;let n=p(this.mouth,t);this.reach(e,`r`,n.y-.05,n.z+this.pawR+.015,f),this.freePaw(e),e.by=-.01,this.shut=.3;break}case`ragequit`:{let t=o(d*11);e.llx=-.55*Math.max(0,t),e.lrx=-.55*Math.max(0,-t),e.by=Math.abs(t)*.03,e.brz=t*.06,e.brx=.12,this.reach(e,`both`,c.y-.18+Math.abs(t)*.05,this.front+this.pawR+.03,.06,`paw`),e.hrx=.18+o(d*23)*.03,e.hrz=o(d*17)*.05,e.try=t*.5,h(.4);break}case`yawn`:if(d<1.2){let t=s(d,.05,.5);this.raise(e,`both`,this.headC.y+this.headR.y+.15*t,.04),e.hrx=-.35*t,e.by=.02*t,e.brx=-.08*t,this.shut=t}else e.hrx=.28+o((d-1.2)*2.5)*.06,e.by=-.01,e.brx=.05,this.reach(e,`both`,c.y-.15,this.front+this.pawR,-.02,`paw`),this.shut=.8,h(.25);break;case`sneeze`:if(d<1.1){let t=s(d,.1,1.1),n=o(d*9)>.6?.05:0;e.hrx=-.12-.35*t-n,e.brx=-.12*t,e.by=.015*t,this.shut=t*.9,this.freePaw(e)}else{if(e.hrx=d<1.5?.45:.25,e.brx=d<1.5?.25:.1,e.by=-.02,this.shut=d<1.5?1:.4,d>1.5){let t=p(this.mouth,.25);this.reach(e,`r`,t.y+o(d*14)*.01,t.z+this.pawR,f+o(d*14)*.03,`paw`)}this.freePaw(e)}break;case`hearthands`:this.reach(e,`both`,c.y-.02,this.front+.14,f+this.pawR*.9,`paw`),e.hrz=o(d*2.5)*.12,e.brz=o(d*2.5)*.04,e.hrx=-.05,e.by=Math.abs(o(d*5))*.008;break;case`flex`:{let t=.5+.5*o(d*6);this.raise(e,`both`,this.headC.y+.02+t*.03,.1+t*.03),e.brx=-.1,e.by=.01+t*.01,e.hrx=-.05,e.hry=o(d*3)*.3,e.llz=.12,e.lrz=-.12;break}case`eyeroll`:{let t=s(d,.15,1.2)*Math.PI*2;d<1.25?(e.hrz=.22*o(t),e.hrx=-.15-.15*Math.cos(t)):(e.hrx=.1,e.hrz=-.1,e.by=-.01),this.reach(e,`l`,c.y-.22,this.front-.02,.1,`paw`),this.shut=.45;break}case`peace`:this.raise(e,`r`,this.headC.y+.04,.03+o(d*4)*.01),this.freePaw(e),e.hrz=-.2,e.brz=.05,e.by=Math.max(0,o(Math.min(d,.5)*Math.PI*2))*.03;break;case`fingerguns`:{let t=0;for(let e of[.45,1.05,1.6])d>e&&d<e+.25&&(t=Math.max(t,1-(d-e)/.25));this.reach(e,`both`,c.y-.02+t*.06,this.front+.2,.05),e.hrz=-.12,e.hry=.1,e.bry=o(d*3)*.1,e.by=t*.01;break}case`thisisfine`:{this.sit(e,t,a);let n=d>1&&d<1.9?o((d-1)/.9*Math.PI):0,r=p(this.mouth,.05),i=F.lerp;this.reach(e,`r`,i(c.y-.12,r.y-.07,n),i(this.front+.12,r.z+.06,n),i(.02,f+.03,n)),e.hrx=.05-n*.1,e.tilt=-.5*n;break}case`sweat`:{let t=o(d*9)*.015;this.reach(e,`r`,this.neckPos.y-.02,this.front+this.pawR+.02+t,-l*.7,`paw`),this.freePaw(e),e.hry=Math.floor(d*2.2)%2?.35:-.35,e.hrx=.05,e.by=o(d*40)*.003,e.brz=o(d*37)*.01,h(.3);break}case`teasip`:{let t=s(d,.35,.7)*(1-s(d,1.3,1.6)),n=p(this.mouth,0),r=F.lerp;this.reach(e,`r`,r(c.y-.1,n.y-.07,t),r(this.front+.12,n.z+.06,t),r(.02,f+.03,t)),this.freePaw(e),e.tilt=-.6*t,e.hry=.45*s(d,1.7,1.95),e.hrx=.04,this.shut=d>1.7?.4:0;break}case`confused`:e.hrz=o(d*2.2)*.25,e.hrx=-.1+o(d*1.3)*.05,e.hry=o(d*1.7)*.15,this.reach(e,`both`,c.y-.08,this.front+this.pawR+.08,.06,`paw`),this.shut=.25;break;case`sigh`:{let t=s(d,.05,.6)*(1-s(d,.75,1)),n=s(d,.8,1.4);e.by=t*.025-n*.025,e.brx=-.08*t+.2*n,e.hrx=-.15*t+.35*n,e.alz=this.armOut+t*.15-n*.08,e.arz=-e.alz,this.shut=.3+n*.4,h(.35*n);break}case`crylaugh`:e.hrx=-.4+o(d*16)*.07,e.brx=-.12,e.brz=o(d*18)*.04,e.by=Math.abs(o(d*9))*.03,this.reach(e,`both`,c.y-.2,this.front+this.pawR,0,`paw`),e.try=o(d*9)*.3,this.shut=.85;break;case`doot`:{let t=0;for(let e of[.3,.9,1.45])d>e&&d<e+.35&&(t=Math.max(t,o((d-e)/.35*Math.PI)));let n=-.1-t*.12;e.hrx=n;let r=p(this.mouth,n);this.reach(e,`r`,r.y-.01,r.z+.015,f),this.reach(e,`l`,r.y-.03,r.z+.08,f+.02,`paw`),e.by=t*.02,e.brx=-.05-t*.05,this.shut=t*.6;break}}}emoteExtras(e){let t=i(e.anim)?e.anim:null;if(this.emoteFx&&this.emoteFx.anim!==t&&(this.emoteFx.dispose(),this.emoteFx=null),this.item&&(this.item.visible=!t),!t)return;if(!this.emoteFx){let e=new fo(t,this.material,this.pawR);e.props.r&&this.handTilt.add(e.props.r),e.props.l&&this.leftHand().add(e.props.l),this.float.add(e.group),this.emoteFx=e}if(!fo.wanted(t))return;let n=r(t)?.time??2.5;this.emoteFx.update((e.t-this.animStart)%(n+.6),this.emoteSpots())}leftHand(){return this.handL||(this.handL=new je,this.handL.matrixAutoUpdate=!1,(this.foreL??this.armL).add(this.handL)),this.handL}emoteSpots(){this.float.updateMatrixWorld(!0);let e=this.m4.copy(this.float.matrixWorld).invert(),t=t=>this.neck.localToWorld(t.clone().sub(this.neckPos)).applyMatrix4(e),n=t(this.headC),r=t(this.eyePos),i=t(this.eyePos.clone().setX(-this.eyePos.x)),a=this.hand.getWorldPosition(new I).applyMatrix4(e),o=this.handL?this.handL.getWorldPosition(new I).applyMatrix4(e):a.clone().setX(-a.x);return{top:t(this.headC.clone().setY(this.headC.y+this.headR.y)).y,head:n,mouth:t(this.mouth),eyeL:r,eyeR:i,hand:a,handL:o,size:this.headR.x}}mannerism(e,t,n){if(!this.clip&&n>=this.nextClip&&this.prof.idles.length){let e=this.prof.idles[Math.floor(Math.random()*this.prof.idles.length)],t=()=>Math.random()*2-1;this.clip={name:e,t0:n,dur:mc[e],side:Math.random()<.5?-1:1,data:[t(),t(),t(),t()]}}let r=this.clip;if(!r)return;let i=(n-r.t0)/r.dur;if(i>=1||i<0){this.clip=null,this.nextClip=n+2.5+Math.random()*4.5;return}let a=gc(i),o=r.side,s=Math.sin,c=this.shoulder,l=(t,n)=>{for(let r of n)e[r]+=(t[r]-e[r])*a};switch(r.name){case`earSwivel`:{let n=gc(hc(i/.65)),r=gc(hc((i-.3)/.65));$(t,o>0?`earL`:`earR`)[1]+=o*.7*n,$(t,o>0?`earR`:`earL`)[1]+=-o*.7*r,$(t,`earL`)[0]-=.1*Math.max(n,r),$(t,`earR`)[0]-=.1*Math.max(n,r),e.hry+=o*.12*a;break}case`earTwitch`:{let e=s(i*Math.PI*4);$(t,o>0?`earL`:`earR`)[0]-=.5*e*e*a,$(t,o>0?`earL`:`earR`)[2]+=o*.15*e*a;break}case`tailSwish`:{let n=i*Math.PI*2*1.5;e.try+=s(n)*.6*a,$(t,`tail1`)[1]+=s(n-.8)*.4*a,$(t,`tail2`)[1]+=s(n-1.6)*.5*a;break}case`headTilt`:e.hrz+=o*.34*a,e.hry+=o*.14*a,e.hrx-=.06*a,$(t,`earL`)[1]+=.2*a,$(t,`earR`)[1]-=.2*a;break;case`sniff`:{e.hrx-=.22*a,e.hrx+=s(n*26)*.02*a;let r=$(t,`nose`);r[0]+=s(n*30)*.18*a,r[6]=1+.15*Math.max(0,s(n*30))*a;break}case`rubPaws`:{let t=this.rest();this.reach(t,`both`,c.y-.1,this.front+this.pawR+.02,this.pawR*.9-Math.abs(c.x),`paw`),l(t,[`alx`,`arx`,`alz`,`arz`,`sl`,`sr`]);let r=s(n*13)*.09*a;e.alz+=r,e.arz+=r,e.alx+=s(n*13+1.5)*.05*a,e.arx-=s(n*13+1.5)*.05*a,e.hrx+=.12*a;break}case`noseWiggle`:{let r=$(t,`nose`);r[0]+=s(n*26)*.25*a,r[1]+=s(n*19)*.18*a,r[6]=1+.12*s(n*26)*a,e.hrx+=s(n*13)*.02*a;break}case`hop`:{let n=Math.max(0,s(i*Math.PI*4))*a;e.by+=.075*n,e.llx+=.5*n,e.lrx+=.5*n,e.brx+=.08*n,$(t,`earL`)[0]-=.35*n,$(t,`earR`)[0]-=.35*n;break}case`stalks`:{let n=gc(hc(i/.7)),o=gc(hc((i-.25)/.7)),s=$(t,`stalkL`),c=$(t,`stalkR`);s[0]+=r.data[0]*.45*n,s[2]+=(.25+r.data[1]*.3)*n,c[0]+=r.data[2]*.45*o,c[2]-=(.25+r.data[3]*.3)*o,e.hry+=r.data[0]*.15*a;break}case`stretch`:$(t,`rear`)[5]-=.045*a,e.hrx-=.28*a,e.by+=.012*a,$(t,`stalkL`)[0]-=.25*a,$(t,`stalkR`)[0]-=.25*a,$(t,`stalkL`)[2]+=.12*a,$(t,`stalkR`)[2]-=.12*a;break;case`headSwivel`:e.hry+=o*1.1*gc(hc(i/.8));break;case`slowBlink`:this.shut=Math.max(this.shut,a);break;case`chill`:this.shut=Math.max(this.shut,.55*a),e.hrx+=.06*a;break;case`lookAround`:e.hry+=s(i*Math.PI*2)*.55*a,e.hrx-=.05*a;break;case`sentinel`:{let n=i<.25?0:i<.5?o:i<.75?-o:0;e.by+=.015*a,e.brx-=.07*a,e.hrx-=.06*a,e.hry+=n*.75*a,$(t,`earL`)[0]-=.15*a,$(t,`earR`)[0]-=.15*a;break}case`tailCurl`:$(t,`tail1`)[0]-=.6*a,$(t,`tail2`)[0]-=.8*a;break;case`wag`:e.try=s(n*16)*.6*a+e.try*(1-a);break;case`pant`:e.hrx+=s(n*14)*.03*a-.05*a,e.by+=s(n*14)*.004*a;break;case`sway`:e.brz+=s(i*Math.PI*2)*.08*a,e.hrz-=s(i*Math.PI*2)*.05*a;break;case`scratch`:{let t=this.rest();this.reach(t,`r`,c.y-.18,this.front-.02,.03),l(t,[`arx`,`arz`,`sr`]),e.arz+=s(n*18)*.1*a,e.hrx+=.15*a;break}case`lickPaw`:{let t=this.rest();this.reach(t,`r`,this.mouth.y-.06,this.mouth.z+.02,.04-Math.abs(c.x)),l(t,[`arx`,`arz`,`sr`]),e.hrx+=(.18+s(n*9)*.05)*a,e.hry-=.15*a;break}case`flap`:case`wingStretch`:{let t=r.name===`flap`?s(n*14)*.4:0;e.alz+=(1.4+t)*a,e.arz-=(1.4+t)*a;break}case`throat`:$(t,`throat`)[6]=1+Math.max(0,s(n*9))*.3*a;break;case`flutter`:this.flutter=Math.max(this.flutter,a),e.by+=Math.max(0,s(i*Math.PI*4))*.018*a,e.hrx-=.1*a}}target(t){let n=this.rest(),r=new Map,a=t.t+this.seed,o=Math.sin,s=this.shoulder,c=this.prof;if(t.anim!==`idle`&&(this.clip=null),t.anim!==this.animNow&&(this.animNow=t.anim,this.animStart=t.t),this.shut=0,this.flutter=0,i(t.anim))this.gesture(n,r,t.anim,t.t-this.animStart,a);else switch(t.anim){case`walk`:case`run`:this.gait(n,r,t);break;case`sit`:this.sit(n,r,a);break;case`sleep`:if(!this.hasLegs||this.floats){n.hrx=.35;for(let e of[`stalkL`,`stalkR`]){let t=$(r,e);t[0]=.6,t[6]=.4}$(r,`rear`)[5]=.03,this.hold&&this.carryPose(n,0);break}if(c.bed===`upright`){n.brx=-.45,n.bz=-.28,n.by=-.02,n.llx=n.lrx=.45,n.llz=.1,n.lrz=-.1,n.alz=.35,n.arz=-.35,n.hrx=.12;break}if(c.bed===`side`){n.brx=-Math.PI/2,n.bry=Math.PI/2,n.bz=.45,n.llx=n.lrx=.9,n.alx=n.arx=-.55,n.alz=.15,n.arz=-.15,n.hrx=.22,n.trx=.9,$(r,`earL`)[0]=$(r,`earR`)[0]=.3;break}n.brx=-Math.PI/2,n.by=.18,n.bz=.45,n.alz=.5,n.arz=-.5,n.alx=n.arx=-.3,n.llz=.15,n.lrz=-.15,n.hry=.25,n.trx=.6,$(r,`earL`)[0]=$(r,`earR`)[0]=.3;break;case`wave`:this.raise(n,`r`,this.headC.y+.02,.02+o(a*9)*.05),this.freePaw(n),n.hrz=.1,n.brz=.04,n.try=o(a*6)*.4,c.gait===`hop`&&(n.by=Math.max(0,o(a*4.5))*.03);break;case`hand`:this.raise(n,`r`,this.headC.y+this.headR.y+.12,-.02),this.freePaw(n),n.by=Math.abs(o(a*2.5))*.012,n.hrz=.06;break;case`cheer`:{let e=o(a*10)*.04;this.raise(n,`both`,this.headC.y+this.headR.y+.08+e,.03),n.by=Math.abs(o(a*5))*(c.gait===`hop`?.14:.1),n.hrx=-.18,n.try=o(a*10)*.5,$(r,`earL`)[0]=$(r,`earR`)[0]=-.25;break}case`dance`:{let e=o(a*5.5);n.by=Math.abs(e)*.09,n.bry=o(a*2.75)*.7,n.brz=e*.11,n.alz=1.2+e*.55,n.arz=-(1.2-e*.55),n.alx=n.arx=-.25,n.llx=Math.max(0,e)*-.55,n.lrx=Math.max(0,-e)*-.55,n.hrz=e*.15,n.try=e*.6,$(r,`earL`)[2]=e*.25,$(r,`earR`)[2]=e*.25,$(r,`rear`)[3]=e*.04,$(r,`stalkL`)[2]=.2+e*.25,$(r,`stalkR`)[2]=-.2+e*.25;break}case`twerk`:case`griddy`:case`floss`:case`robot`:case`moonwalk`:case`horse`:case`macarena`:case`chicken`:case`sprinkler`:case`runningman`:case`ymca`:case`carlton`:case`worm`:case`dougie`:case`renegade`:case`ladies`:case`hustle`:case`chacha`:case`charleston`:case`cabbage`:case`cart`:case`twist`:case`eslide`:case`pointer`:case`riverdance`:case`hokey`:case`defaultdance`:case`orange`:case`woah`:case`windmill`:case`dabdance`:case`vogue`:case`cancan`:this.dance(n,r,t.anim,t.t-this.animStart);break;case`laugh`:n.hrx=-.32+o(a*16)*.06,n.brz=o(a*18)*.035,n.by=Math.abs(o(a*9))*.025,this.reach(n,`both`,s.y-.2,this.front+this.pawR,0,`paw`),n.try=o(a*9)*.3;break;case`point`:this.reach(n,`r`,s.y+this.reachLength()*.55,s.z+this.reachLength()*1.1,.01),this.freePaw(n),n.brx=.07,n.hrx=-.1,n.by=Math.abs(o(a*3))*.01,n.try=o(a*7)*.3;break;case`gasp`:{let e=this.headNow(this.mouth,-.22+c.head-c.lean);this.reach(n,`both`,e.y+.02,this.faceFront(e.y)-this.pawR-.04,this.besideHead(-.02),`paw`),n.hrx=-.22,n.brx=-.06,n.by=.01,$(r,`earL`)[0]=$(r,`earR`)[0]=-.3,$(r,`stalkL`)[0]=$(r,`stalkR`)[0]=-.3;break}case`cry`:n.hrx=.34+o(a*12)*.03;{let e=this.headNow(this.eyePos,.34+c.head-c.lean);if(this.reach(n,this.hold?`l`:`both`,e.y-.02,e.z+this.pawR+.025,e.x-Math.abs(s.x),`paw`),this.hold){let e=[n.alx,n.alz,n.sl,n.el];this.carryPose(n,0),this.hold.both||([n.alx,n.alz,n.sl,n.el]=e)}}n.brz=o(a*14)*.025,n.by=-.01,$(r,`earL`)[0]=$(r,`earR`)[0]=.35,$(r,`stalkL`)[0]=$(r,`stalkR`)[0]=.45;break;case`work`:{let e=o(a*7)*.05,t=s.y-this.grip.length()*(this.grip.length()<.22?.5:.8),r=Math.min(Math.max(t,s.y-.26),this.headC.y-this.headR.y-.16)+e,i=Math.max(this.front+.14+(this.hold?.hang??0),this.front+this.pawR+(this.grip.z-this.paw.z),this.mouth.z+.04);this.reach(n,`both`,r,i,-.03),n.alx+=e*2,n.arx-=e*2,n.hrx=this.grip.length()<.22?.06:.25,n.brx=.08,n.by=Math.abs(o(a*7))*.012,this.hold?.both&&(n.carry=1);break}case`fish`:{let e=o(a*.9)>.9?o(a*40)*.08:0,t=!!this.hold?.both;this.reach(n,`both`,s.y+(t?-.08:-.16),this.front+(t?.14:.1),t?-.02:.02),n.alx+=e,n.arx+=e,n.hrx=.12,n.hry=t?0:o(a*.3)*.1,t&&(n.carry=1);break}case`water`:this.reach(n,`r`,s.y-.16,this.front+.1,.05),n.alz=.2,n.hrx=.28,n.tilt=.75+o(a*3)*.1,this.freePaw(n);break;case`drink`:{let e=a%3.2,t=e<1.4?o(e/1.4*Math.PI):0,r=this.hold??fc,{y:i,z:l}=this.holdSpot(r),[u,d,f]=r.sip??fc.sip,p=-f,m=this.headNow(this.mouth,(f?-.15:.12)+c.head-c.lean),h=m.y-(u*Math.cos(p)-d*Math.sin(p)),g=Math.max(m.z+.015-(u*Math.sin(p)+d*Math.cos(p)),(e=>Math.max(this.faceFront(e)+this.pawR+.03,this.faceFront(e+u*Math.cos(p))+Math.max(0,u*Math.sin(f))+.07))(h)),_=h,v=this.sipLow||Math.hypot(.03-Math.abs(s.x),_-s.y,g-s.z)>this.reachLength()*1.05;v&&(_=i+.04,g=l+.02),this.reach(n,`r`,i+(_-i)*t,l+(g-l)*t,r.out*(1-t)+(v?r.out:.03-Math.abs(s.x))*t),n.hrx=v?t*.2:f?-t*.15:t*.12,n.tilt=p*t*(v?.35:1),n.try=o(a*2)*.2,this.freePaw(n);break}default:{if(t.anim.startsWith(`win:`)){ac(this,n,r,t.anim.slice(4),t.t-this.animStart);break}let e=this.sleepy?.45:1;if(n.hry=o(a*.37*e)*.12*(o(a*.13)>0?1:.3),n.hrz=o(a*.29*e)*.04,n.try=o(a*1.6*e)*c.tailSway,$(r,`tail1`)[1]=o(a*1.6*e-.7)*c.tailSway*.6,$(r,`tail2`)[1]=o(a*1.6*e-1.4)*c.tailSway*.8,n.by=o(a*2.2*e)*.005,c.paws?this.reach(n,`both`,s.y-c.paws+o(a*2.2)*.005,this.front+this.pawR+.01,-.035,`paw`):(n.alx=n.arx=-this.armFwd,n.alz=this.armOut+o(a*2.2*e)*.02,n.arz=-this.armOut-o(a*2.2*e)*.02),c.gait===`slither`&&($(r,`rear`)[5]=o(a*.9)*.006,$(r,`stalkL`)[2]=.08+o(a*.7)*.05,$(r,`stalkR`)[2]=-.08+o(a*.8+1)*.05),this.sleepy&&(n.hrx=.2+o(a*.6)*.04,n.alz=.25,n.arz=-.25),this.mannerism(n,r,a),this.hold){let t=[n.alx,n.alz,n.sl,n.el];this.carryPose(n,o(a*2.2*e)*.02),this.hold.both||([n.alx,n.alz,n.sl,n.el]=t)}}}if(this.hold&&(t.anim===`wave`||t.anim===`hand`||t.anim===`cheer`||t.anim===`cry`||t.anim===`laugh`||e(t.anim))&&((t.anim===`wave`||t.anim===`hand`)&&!this.tendril&&(n.alx=n.arx,n.alz=-n.arz,n.sl=n.sr),this.carryPose(n,0,!0)),t.anim!==`sleep`){let e=c.lean*(t.anim===`sit`?.5:1);n.brx+=e,n.hrx+=c.head-e,n.hrz+=c.tilt}if(t.speaking&&(n.hrx+=o(a*13)*.04,n.hrz+=o(a*7)*.025),this.bones.has(`feelerL`)){let e=t.anim===`sleep`&&c.bed!==`upright`&&this.hasLegs&&!this.floats?-1:0;for(let[t,n]of[[`feelerL`,1],[`feelerR`,-1]]){let i=$(r,t);i[0]+=e+o(a*.9+n)*.05,i[2]+=n*o(a*1.3+n*.7)*.04}}if(this.tentacles&&t.anim===`sleep`?(c.bed!==`upright`&&(n.llx=n.lrx=Math.PI/2-.12,n.llz=.12,n.lrz=-.12),n.llz+=o(a*.9)*.04,n.lrz-=o(a*.9+1)*.04):this.tentacles&&(t.anim===`idle`&&(n.brz+=o(a*1.3)*.05,n.hrz-=o(a*1.3)*.03),n.llz+=o(a*3)*.14,n.lrz-=o(a*3+1)*.14,n.llx*=.4,n.lrx*=.4),this.flaps&&this.folded(t)){let e=o(a*1.6)*.03;this.hold?.both||(n.alz=lc.z+e,n.alx=lc.x,n.aly=-lc.y,n.el=lc.el,n.wl=lc.w,n.sl=1),this.hold||(n.arz=-lc.z-e,n.arx=lc.x,n.ary=lc.y,n.er=lc.el,n.wr=lc.w,n.sr=1)}if(this.flaps&&(n.wl=Math.min(n.wl,Math.max(lc.w,1-n.el*.8)),n.wr=Math.min(n.wr,Math.max(lc.w,1-n.er*.8))),this.flaps&&(t.anim===`walk`||t.anim===`run`)){let e=t.anim===`run`?16:12,r=.45,i=o(a*e);n.alz=1.5+i*r,n.alx=-.1,n.sl=1,this.hold?n.arz-=i*r*.15:(n.arz=-(1.5+i*r),n.arx=-.1,n.sr=1),n.by+=Math.max(0,i)*.02}return this.wings&&(this.wings.want=this.wings.mode===`buzz`?t.anim===`sleep`?0:1:t.anim===`cheer`||e(t.anim)?1:this.flutter),{P:n,A:r}}applyPose(e,n){let r=this.pose;if(n){let i=r.bry+t(n.P.bry-r.bry)*e,a=r.brx+t(n.P.brx-r.brx)*e;for(let t of cc)r[t]+=(n.P[t]-r[t])*e;r.bry=t(i),r.brx=t(a);for(let t of this.extra){let r=this.auxNow.get(t)??dc(),i=n.A.get(t)??dc();for(let t=0;t<7;t++)r[t]+=(i[t]-r[t])*e;this.auxNow.set(t,r)}}this.body.position.set(r.bx,r.by,r.bz),this.body.rotation.set(r.brx,r.bry,r.brz),this.neck.rotation.set(r.hrx,r.hry,r.hrz),this.armL.rotation.set(r.alx,r.aly,r.alz),this.armR.rotation.set(r.arx,r.ary,r.arz),this.armL.scale.set(r.wl,r.sl,1),this.armR.scale.set(r.wr,r.sr,1),this.foreL?.rotation.set(-r.el,0,0),this.foreR?.rotation.set(-r.er,0,0),this.legL.rotation.set(r.llx,0,r.llz),this.legR.rotation.set(r.lrx,0,r.lrz);let i=this.ghost?.001:1;this.legL.scale.setScalar(i),this.legR.scale.setScalar(i),this.tail.rotation.set(r.trx,r.try,0);for(let e of this.extra){let t=this.auxNow.get(e)??dc(),n=this.bones.get(e),r=this.sk.local.get(e);n.rotation.set(t[0],t[1],t[2]),n.position.set(r.x+t[3],r.y+t[4],r.z+t[5]),n.scale.setScalar(t[6])}if(this.hat?.holder.visible)for(let e of this.hat.fold)this.bones.get(e)?.scale.setScalar(.001);let a=this.tendril?Math.max(.001,this.grow):1;this.tendril&&this.armR.scale.multiplyScalar(a),this.armR.updateMatrix();let o=this.m6.copy(this.armR.matrix),s=this.grip;this.foreR&&(this.foreR.updateMatrix(),o.multiply(this.foreR.matrix),s=this.v2.copy(this.grip).add(this.v3.set(0,this.elbow,0)));let c=this.v.copy(s).applyMatrix4(o);if(this.hand.matrix.copy(o).invert().multiply(this.m4.makeTranslation(c.x,c.y,c.z)).multiply(this.m5.makeScale(a,a,a)),this.hand.matrixWorldNeedsUpdate=!0,this.handTilt.rotation.set(r.tilt,0,0),this.item&&(this.item.position.x=-c.x*r.carry),this.emoteFx?.anim===`hearthands`&&this.emoteFx.props.r&&(this.emoteFx.props.r.position.x=-c.x),this.handL){this.armL.updateMatrix();let e=this.m6.copy(this.armL.matrix),t=this.v2.copy(this.grip).setX(-this.grip.x);this.foreL&&(this.foreL.updateMatrix(),e.multiply(this.foreL.matrix),t=t.add(this.v3.set(0,this.elbow,0)));let n=this.v.copy(t).applyMatrix4(e);this.handL.matrix.copy(e).invert().multiply(this.m4.makeTranslation(n.x,n.y,n.z)),this.handL.matrixWorldNeedsUpdate=!0}}update(e){let t=Math.min(Math.max(e.dt,0),.1);if(e.anim===`walk`||e.anim===`run`){let n=F.clamp(e.speed||(e.anim===`run`?4:2),.8,7);this.phase+=t*(5+n*1.6)*this.prof.cadence}if(this.tendril){let n=!!this.item||e.anim!==`idle`&&e.anim!==`walk`&&e.anim!==`run`&&e.anim!==`sit`&&e.anim!==`sleep`;this.grow+=(+!!n-this.grow)*(1-Math.exp(-t*8))}let n=this.target(e);e.anim===`sleep`&&(n.P.by+=this.bedLift),this.applyPose(1-Math.exp(-t*14),n);let r=this.floats&&!(this.flaps&&this.folded(e))||this.ghost,i=e.anim===`sleep`?.012:this.floats?this.hover:.35,a=(r?i+Math.sin(e.t*2+this.seed)*(e.anim===`sleep`?.012:.06):0)+this.footLift;this.float.position.y+=(a-this.float.position.y)*(1-Math.exp(-t*6)),r&&(this.wisp.rotation.z=Math.sin(e.t*3+this.seed)*.15),this.keepClearOfGround(e.anim===`sleep`?.028:Oc),this.blinkAt-=t,this.blinkAt<=0&&this.blinkT<0&&(this.blinkT=0);let o=1;if(this.blinkT>=0){this.blinkT+=t;let e=this.blinkT/.14;o=e<1?Math.max(.12,Math.abs(1-e*2)):1,e>=1&&(this.blinkT=-1,this.blinkAt=2+Math.random()*4)}o=Math.min(o,1-.88*this.shut),e.anim===`sleep`?o=.12:e.anim===`laugh`?o=.35:this.sleepy&&e.anim===`idle`&&(o=Math.min(o,.5));for(let e of this.blinkers)e.scale.y=o*e.scale.x;if(this.wings&&this.beatWings(t),this.turrets.length&&this.swivel(e,t),this.shift){let t=Math.sin(e.t/32*Math.PI*2);this.shift.hue.value=1.6*t,this.shift.wave.value=.1+.25*Math.abs(t),this.shift.time.value=e.t%(4*Math.PI),this.shift.tint.value=Math.abs(t)}if(this.hat?.built.update?.(e.t+this.seed),this.emoteExtras(e),this.hat&&(this.hat.holder.visible=e.anim!==`sleep`),this.hatFx){let t=this.hatFxOn&&e.anim!==`sleep`;this.hatFx.group.visible=this.hatFx.ground.visible=t,t&&this.hatFx.update(e.t+this.seed,e.anim,this.ghost)}}beatWings(e){let t=this.wings,n=vc[t.mode];t.open+=(t.want-t.open)*(1-Math.exp(-e*n.ease)),t.phase=(t.phase+e*n.rate)%(Math.PI*2);let r=Math.sin(t.phase)*t.open*n.beat,i=n.shut[0]+(n.open[0]-n.shut[0])*t.open,a=n.shut[1]+(n.open[1]-n.shut[1])*t.open;for(let[e,n]of t.bones)e.rotation.set(0,n*i,n*(a+r))}swivel(e,t){let n=e.t;for(let r of this.turrets){if(e.anim===`sleep`)r.toYaw=.2,r.toPitch=0;else if(n>=r.next||r.next-n>6){if(Math.random()<.25)for(let e of this.turrets)e.toYaw=.55,e.toPitch=-.05,e.next=n+1.2+Math.random()*1.5;else r.toYaw=-.45+Math.random()*1.05,r.toPitch=-.3+Math.random()*.55,r.next=n+.5+Math.random()*2.2}let i=1-Math.exp(-t*16);r.yaw+=(r.toYaw-r.yaw)*i,r.pitch+=(r.toPitch-r.pitch)*i,r.bone.rotation.set(0,-r.side*r.yaw,r.side*r.pitch)}}freeChains(){return[`tail`,...this.prof.gait===`scuttle`?[`legL`,`legR`]:[]]}chainOf(e){let t=[e];for(let n of this.sk.names)for(let r=this.sk.parent.get(n);r;r=this.sk.parent.get(r))if(r===e){t.push(n);break}return t}findLowPoints(){let e=this.highGeo.getAttribute(`position`),t=this.highGeo.getAttribute(`skinIndex`),n=this.highGeo.getAttribute(`skinWeight`),r=this.mesh.skeleton.bones,i=this.mesh.skeleton.boneInverses,a=this.freeChains(),o=[];for(let s of a){let a=this.bones.get(s);if(!a)continue;let c=[];for(let a of this.chainOf(s)){let o=this.sk.names.indexOf(a),s=[];for(let r=0;r<e.count;r++){let e=0;for(let t=1;t<4;t++)n.getComponent(r,t)>n.getComponent(r,e)&&(e=t);t.getComponent(r,e)===o&&n.getComponent(r,e)>=.5&&s.push(r)}if(!s.length)continue;let l=Math.max(1,Math.ceil(s.length/120));for(let t=0;t<s.length;t+=l)c.push({bone:r[o],local:new I().fromBufferAttribute(e,s[t]).applyMatrix4(i[o])})}c.length&&o.push({pivot:a,points:c})}return o}keepClearOfGround(e){let t=this.lowPoints??=this.findLowPoints();if(t.length){this.root.updateMatrixWorld(!0),Pc.copy(this.root.matrixWorld).invert();for(let n of t)for(let t=0;t<4;t++){let t=1/0;for(let e of n.points)kc.copy(e.local).applyMatrix4(e.bone.matrixWorld).applyMatrix4(Pc),kc.y<t&&(t=kc.y,Ac.copy(kc));if(t>=e)break;jc.setFromMatrixPosition(n.pivot.matrixWorld).applyMatrix4(Pc);let r=Ac.sub(jc),i=Math.max(.06,r.length());if(Mc.crossVectors(r,Nc),Mc.lengthSq()<1e-8)break;Mc.normalize(),this.root.getWorldQuaternion(Ic),n.pivot.parent.getWorldQuaternion(Lc),Ic.invert().multiply(Lc).invert(),Mc.applyQuaternion(Ic),n.pivot.quaternion.premultiply(Fc.setFromAxisAngle(Mc,(e-t+.004)/i)),n.pivot.updateMatrixWorld(!0)}}}dispose(){this.emoteFx?.dispose(),this.emoteFx=null,this.setItem(null),this.setHat(null),this.setDetail(`high`),this.highGeo.dispose(),this.mesh.skeleton.dispose(),this.wisp.geometry.dispose(),this.root.traverse(e=>{e!==this.mesh&&e!==this.wisp&&e.isMesh&&e.geometry.dispose()});for(let e of this.owned)e.dispose();this.root.removeFromParent()}};function zc(e){let t=n(e.animal),r=/^#[0-9a-f]{6}$/i.test(e.color)?e.color:t.colors[0],i=Ot(t.id),a=qs[t.id](i,xn(r,t.id),r);rn(i,Ys[t.id]??{}),ln(i,t.id,r);let o=a.aquatic??t.aquatic?Oe():at(),s=new Rc({kit:i,profile:Xs(t.id),material:o,shift:a.shifts?Ue(o):void 0,wings:a.wings,swivel:a.swivel,eyeMaterial:$e(),ghostColor:z(r,`#e6f0ff`,.75),floats:!!a.hover,hover:a.hover,flaps:a.flaps,tentacles:a.legs===`tentacles`,sleepy:a.sleepy,tendril:a.tendril,hatFit:Hc(t.id,i),lowKey:`${t.id}:${r}`,lowKit:()=>{let e=Ot(t.id);return qs[t.id](e,xn(r,t.id),r),ln(e,t.id,r),e}});return e.hat&&s.setHat(e.hat),s}var Bc={fungi:{skull:{c:[0,.28,-.04],r:[.34,.21,.32]},brow:.45},squid:{skull:{c:[0,.52,-.055],r:[.11,.16,.1]},brow:.6},robot:{bumps:`head`},hedgehog:{bumps:`none`},pony:{bumps:`head`},snail:{dz:-.04},crab:{dz:-.04}},Vc=new Map;function Hc(e,t){let n=t.shape,r=Bc[e]??{},i=r.skull?.c??n.hc,a=r.skull?.r??n.hr;return{id:e,head:{c:i,r:a,size:F.clamp(a[0]/.25,.45,1.2),eye:{at:[t.eyeX,t.eyeY,t.eyeZ],r:t.eyeR},brow:r.brow},nudge:r,neckAt:t.joints.neck}}function Uc(e,t){let n=e=>`${Math.floor(e.x/t)},${Math.floor(e.y/t)},${Math.floor(e.z/t)}`,r=new Map;e.forEach((e,t)=>(r.get(n(e))??r.set(n(e),[]).get(n(e))).push(t));let i=new Uint8Array(e.length),a=[];for(let o=0;o<e.length;o++){if(i[o])continue;let s=[],c=[o];for(i[o]=1;c.length;){let a=e[c.pop()];s.push(a);let[o,l,u]=n(a).split(`,`).map(Number);for(let n=-1;n<=1;n++)for(let s=-1;s<=1;s++)for(let d=-1;d<=1;d++)for(let f of r.get(`${o+n},${l+s},${u+d}`)??[])!i[f]&&e[f].distanceTo(a)<t&&(i[f]=1,c.push(f))}a.push(s)}return a}function Wc(e){return/^ear|^crest|^antler/.test(e)?`fold`:/^eyes$|^blink/.test(e)?`eye`:/^stalk|^turret|^neck$/.test(e)?`solid`:null}var Gc=`#3b2a5a`,Kc=`#e8c26a`,qc=`#0d0a14`;function Jc(){let e=Ot(`storyteller`);e.joints.neck=[0,.6,0],e.joints.shoulder=[.19,.6,.02],e.shape.tc=[0,.4,0],e.shape.tr=[.28,.38,.26],e.shape.hc=[0,.27,0],e.shape.hr=[.25,.27,.25];let t=Kt(e),n=e.joints.neck;t.add(tn(`body`,[0,.06,0],[0,.6,0],.29,.16,{name:`robe`})),t.add(K(`body`,[0,.07,0],[.31,.045,.29],{k:.05,name:`hem`})),t.add(K(`body`,[0,-.5,0],[.9,.54,.9],{k:.02,carve:!0})),t.add(K(`body`,[0,.6,0],[.22,.09,.18],{k:.08,name:`shoulders`})),t.add(K(`neck`,[0,n[1]+.27,0],[.25,.27,.25],{k:.06,anchor:n,reach:.18,name:`hood`})),t.add(tn(`neck`,[0,n[1]+.42,-.1],[0,n[1]+.5,-.32],.12,.026,{k:.06,name:`hoodTip`}));let r=K(`neck`,[0,n[1]+.28,.21],[.17,.19,.15],{k:.03,carve:!0,name:`hollow`});t.add(r),H(e,{len:.25,r0:.06,r1:.085,paw:[.05,.05,.05],fwd:.2,out:.2,pawOut:.075}),U(e),e.eyeY=.28,e.eyeX=.075,e.eyeR=.035,e.eyeZ=.09;for(let t of[-1,1])un(e.eyes,e.rnd,{base:`ico0`,r:[.036,.02,.012],pos:[t*.075,.28,.09],rot:[0,t*.3,-t*.25],jitter:.03,color:`#ffe08a`,tone:0});let i=e=>r.d(e.p.x,e.p.y,e.p.z);e.marks={base:Gc,marks:[{color:qc,f:e=>i(e)-.012},{color:Kc,f:e=>i(e)-.045},{color:`#d8d0f0`,f:Y(e,`armLPaw`,`armRPaw`)},{color:Kc,f:dn(It(e,`L`,.8),It(e,`R`,.8))},{color:qc,f:G(Y(e,`robe`,`hem`,`shoulders`),e=>e.p.y-.035)},{color:Kc,f:G(Y(e,`robe`,`hem`,`shoulders`),e=>e.p.y-.11)},{color:Kc,f:G(Y(e,`robe`,`hem`,`shoulders`),e=>Math.abs(e.p.x)-.028,e=>.05-e.p.z)}]},ln(e,`storyteller`,Gc),e.seat=0;let a=Re(`#ffcf6a`,1.6),o=new Ee({color:`#ffe08a`});return new Rc({kit:e,profile:{...Xs(`raccoon`),lean:0,head:0,paws:0,idles:[`lookAround`,`headTilt`],sit:`settle`,gait:`trot`,tailSway:0},material:at(),eyeMaterial:o,ghostColor:Ft(`#cbbcf0`),floats:!0,tentacles:!1,noLegs:!0,extras:(e,t,n)=>{let r=new je,i=new cn,o=$t(Xt(`lantern`)),s=`#4d3a2a`;un(i,o,{base:`limb`,r:[.07,.03,.07],pos:[0,.12,0],jitter:.02,color:s}),un(i,o,{base:`cone5`,r:[.075,.07,.075],pos:[0,.17,0],jitter:.03,color:s}),un(i,o,{base:`ico0`,r:.02,pos:[0,.22,0],jitter:.02,color:s}),un(i,o,{base:`limb`,r:[.075,.025,.075],pos:[0,-.05,0],jitter:.02,color:s});for(let e=0;e<5;e++){let t=e/5*Math.PI*2;un(i,o,{base:`box`,r:[.012,.16,.012],pos:[Math.cos(t)*.06,.035,Math.sin(t)*.06],jitter:0,color:s})}let c=new ht(i.geometry(),at());c.castShadow=!0;let l=new ht(new et(.06,0),a);l.scale.set(.9,1.3,.9),l.position.y=.035;let u=new ne(`#ffcf7a`,1.6,6,2);u.position.y=.04,r.add(c,l,u),r.position.set(.04,-.42,.06),r.name=`lantern`,n.add(r)}})}var Yc=null,Xc=null;function Zc(){Yc?.dispose(),Yc?.forceContextLoss(),Yc=null}var Qc=null,$c=null,el=new Map,tl={squid:-.2,snail:.1};function nl(e){if(!Yc){Yc=new Ca({antialias:!0,alpha:!0,preserveDrawingBuffer:!0}),Yc.setPixelRatio(1),Yc.toneMapping=7,Yc.toneMappingExposure=1.06,Qc=new ae,Qc.add(new Ye(`#cfe8ff`,`#a89a80`,1.35));let e=new x(`#fff1d2`,2.4);e.position.set(1.5,3,2.5),Qc.add(e),$c=new ce(30,1,.1,20)}return Yc.setSize(e,e,!1),{renderer:Yc,scene:Qc,camera:$c}}function rl(e,t,n){e.render(t,n);let r=e.getContext().isContextLost(),i=r?``:e.domElement.toDataURL(`image/png`);return Xc&&clearTimeout(Xc),Xc=setTimeout(Zc,r?0:4e3),i}var il=new I(.15,.25,1).normalize();function al(e){let t=new I(0,1,0).cross(il).normalize(),n=il.clone().cross(t),r=[],i=new I,a=new I,o=new I,s=new lt,c=new lt,l=e=>{for(let t=e;t;t=t.parent)if(!t.visible)return!1;return!0};if(e.updateMatrixWorld(!0),e.traverse(e=>{let u=e;if(!u.isMesh||!l(u))return;let d=u.geometry.getAttribute(`position`);if(!d)return;let f=u.geometry.index,p=(f?f.count:d.count)/3,m=u,h=m.isInstancedMesh?m.count:1;for(let e=0;e<h;e++){s.copy(u.matrixWorld),m.isInstancedMesh&&(m.getMatrixAt(e,c),s.multiply(c));for(let e=0;e<p;e++){let c=t=>f?f.getX(e*3+t):e*3+t;i.fromBufferAttribute(d,c(0)).applyMatrix4(s),a.fromBufferAttribute(d,c(1)).applyMatrix4(s),o.fromBufferAttribute(d,c(2)).applyMatrix4(s);let l=o.clone().sub(i).cross(a.clone().sub(i)).length()/2;if(l<=0)continue;let u=i.add(a).add(o).divideScalar(3);r.push({u:u.dot(t),v:u.dot(n),w:u.dot(il),a:l})}}}),!r.length)return{centre:new I,half:.1,depth:.1};let u=r.reduce((e,t)=>e+t.a,0),d=(e,t)=>{r.sort((t,n)=>t[e]-n[e]);let n=0;for(let i of r)if((n+=i.a)>=u*t)return i[e];return r[r.length-1][e]},f=.04,[p,m]=[d(`u`,f),d(`u`,.96)],[h,g]=[d(`v`,f),d(`v`,.96)],[_,v]=[d(`w`,f),d(`w`,.96)],y=t.multiplyScalar((p+m)/2).add(n.multiplyScalar((h+g)/2)).addScaledVector(il,(_+v)/2),b=Math.max(d(`u`,.99)-d(`u`,.01),d(`v`,.99)-d(`v`,.01))/2;return{centre:y,half:Math.max(.03,Math.max(m-p,g-h)/2*1.12,b*.8),depth:(v-_)/2}}function ol(e,t=96){let n=`pet2:${e}:${t}`,r=el.get(n);if(r)return r;try{let{renderer:r,scene:i,camera:a}=nl(t),o=hn(e);for(let e=0;e<20;e++)o.update(.05,e*.05,!1);o.root.rotation.y=.45,i.add(o.root);let{centre:s,half:c,depth:l}=al(o.root),u=c*1.1/Math.tan(F.degToRad(15))+l;a.position.copy(s).addScaledVector(il,u),a.lookAt(s);let d=rl(r,i,a);return i.remove(o.root),o.dispose(),d&&el.set(n,d),d}catch{return``}}function sl(e,t=96){let n=`hat:${e}:${t}`,r=el.get(n);if(r)return r;try{let{renderer:r,scene:i,camera:a}=nl(t),o=yt(e);if(!o)return``;o.update?.(1.2),o.group.rotation.y=.5,i.add(o.group),o.group.updateMatrixWorld(!0);let s=new st().setFromObject(o.group),c=s.getCenter(new I),l=s.getSize(new I),u=Math.max(.05,Math.max(l.x,l.y,l.z)*.62)/Math.sin(F.degToRad(15));a.position.set(c.x,c.y+u*.42,c.z+u*.9),a.lookAt(c);let d=rl(r,i,a);i.remove(o.group),o.group.traverse(e=>e.geometry?.dispose());for(let e of o.materials)e.dispose();return d&&el.set(n,d),d}catch{return``}}function cl(e,t,n=96){let r=`obj:${e}:${n}`,i=el.get(r);if(i)return i;try{let{renderer:e,scene:i,camera:a}=nl(n),o=t();o.rotation.y=.5,i.add(o),o.updateMatrixWorld(!0);let s=new st().setFromObject(o),c=s.getCenter(new I),l=s.getSize(new I),u=Math.max(.05,Math.max(l.x,l.y,l.z)*.6)/Math.sin(F.degToRad(15));a.position.set(c.x,c.y+u*.42,c.z+u*.9),a.lookAt(c);let d=rl(e,i,a);return i.remove(o),Lo(o),d&&el.set(r,d),d}catch{return``}}function ll(e,t=128){let n=`${e.animal}:${e.color}:${e.hat??``}:${t}`,r=el.get(n);if(r)return r;try{let{renderer:r}=nl(t),i=zc(e);i.showHatFx(!1),i.update({anim:`idle`,speed:0,dt:.016,t:0});for(let e=0;e<30;e++)i.update({anim:`idle`,speed:0,dt:.05,t:0});i.root.rotation.y=.35,Qc.add(i.root);let a=i.headHeight+.03+(tl[e.animal]??0),o=a-.64,s=(o+a)/2,c=(a-o)*1.12/(2*Math.tan(F.degToRad(15)));$c.position.set(c*.18,s+.08,c),$c.lookAt(0,s,0);let l=rl(r,Qc,$c);return Qc.remove(i.root),i.dispose(),l&&el.set(n,l),l}catch{return``}}export{cl as a,oc as c,lo as d,wa as f,Ca as h,sl as i,Io as l,Z as m,zc as n,ol as o,Ea as p,Jc as r,sc as s,ll as t,Lo as u};