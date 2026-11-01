import{a as e,f as t}from"./emotes-DExsxOis.js";import{V as n,it as r,st as i}from"./catalogue-DbzzNBmk.js";import{$ as a,$n as o,An as s,B as c,C as l,Ct as u,D as d,Dn as f,E as p,Et as m,F as h,Fn as g,H as _,I as v,In as y,J as b,Jn as x,Ln as S,M as ee,Mn as C,Mt as w,N as T,Nn as E,Nt as te,O as D,On as ne,Ot as O,P as re,Pn as k,Q as ie,Qn as ae,R as oe,Rn as se,S as ce,Sn as le,St as A,T as ue,Tt as de,U as fe,Un as pe,V as me,Vn as he,Xn as ge,Y as _e,Yn as ve,Z as ye,Zn as be,_ as xe,_t as Se,a as j,ar as M,at as N,bn as Ce,bt as we,cr as Te,ct as P,d as Ee,er as F,et as De,f as Oe,ft as ke,g as Ae,gt as je,h as Me,hn as Ne,ht as Pe,i as Fe,ir as Ie,it as I,j as L,jn as Le,kn as Re,kt as ze,l as Be,lt as Ve,mt as He,n as Ue,nr as We,nt as Ge,o as Ke,or as qe,ot as Je,p as Ye,qn as R,r as Xe,rr as Ze,rt as Qe,s as $e,sr as et,st as tt,tr as nt,tt as rt,u as it,ut as at,v as ot,wn as st,wt as ct,x as lt,xn as ut,yn as dt,yt as ft,zn as pt}from"./three.core-BII6B-pa.js";import{Bn as mt,Gn as ht,Hn as gt,In as z,Kn as _t,Ln as vt,Rn as yt,Un as bt,Wn as xt,kn as B,zn as St}from"./layout-CJLALjC_.js";import{$ as V,A as Ct,B as wt,C as Tt,D as Et,E as Dt,F as Ot,G as kt,H as At,I as jt,J as Mt,K as H,L as Nt,M as Pt,N as Ft,O as It,P as Lt,Q as Rt,R as zt,S as Bt,T as Vt,U as Ht,V as Ut,W as Wt,X as Gt,Y as Kt,Z as qt,_ as Jt,a as Yt,at as Xt,b as Zt,c as Qt,ct as $t,d as en,dt as tn,et as nn,f as rn,ft as an,g as on,h as sn,i as cn,it as ln,j as un,k as dn,l as fn,lt as pn,m as mn,mt as hn,n as U,nt as gn,o as _n,ot as vn,p as yn,pt as bn,q as xn,r as Sn,rt as Cn,s as wn,st as Tn,t as En,tt as Dn,u as On,ut as kn,v as An,w as jn,x as Mn,y as W,z as Nn}from"./pets-BQZesqFn.js";function Pn(){let e=null,t=!1,n=null,r=null;function i(t,a){n(t,a),r=e.requestAnimationFrame(i)}return{start:function(){t!==!0&&n!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function Fn(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var In={alphahash_fragment:`#ifdef USE_ALPHAHASH
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
}`},G={common:{diffuse:{value:new Me(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Qe},alphaMap:{value:null},alphaMapTransform:{value:new Qe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Qe}},envmap:{envMap:{value:null},envMapRotation:{value:new Qe},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Qe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Qe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Qe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Qe},normalScale:{value:new R(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Qe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Qe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Qe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Qe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Me(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Me(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Qe},alphaTest:{value:0},uvTransform:{value:new Qe}},sprite:{diffuse:{value:new Me(16777215)},opacity:{value:1},center:{value:new R(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Qe},alphaMap:{value:null},alphaMapTransform:{value:new Qe},alphaTest:{value:0}}},Ln={basic:{uniforms:qe([G.common,G.specularmap,G.envmap,G.aomap,G.lightmap,G.fog]),vertexShader:In.meshbasic_vert,fragmentShader:In.meshbasic_frag},lambert:{uniforms:qe([G.common,G.specularmap,G.envmap,G.aomap,G.lightmap,G.emissivemap,G.bumpmap,G.normalmap,G.displacementmap,G.fog,G.lights,{emissive:{value:new Me(0)}}]),vertexShader:In.meshlambert_vert,fragmentShader:In.meshlambert_frag},phong:{uniforms:qe([G.common,G.specularmap,G.envmap,G.aomap,G.lightmap,G.emissivemap,G.bumpmap,G.normalmap,G.displacementmap,G.fog,G.lights,{emissive:{value:new Me(0)},specular:{value:new Me(1118481)},shininess:{value:30}}]),vertexShader:In.meshphong_vert,fragmentShader:In.meshphong_frag},standard:{uniforms:qe([G.common,G.envmap,G.aomap,G.lightmap,G.emissivemap,G.bumpmap,G.normalmap,G.displacementmap,G.roughnessmap,G.metalnessmap,G.fog,G.lights,{emissive:{value:new Me(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:In.meshphysical_vert,fragmentShader:In.meshphysical_frag},toon:{uniforms:qe([G.common,G.aomap,G.lightmap,G.emissivemap,G.bumpmap,G.normalmap,G.displacementmap,G.gradientmap,G.fog,G.lights,{emissive:{value:new Me(0)}}]),vertexShader:In.meshtoon_vert,fragmentShader:In.meshtoon_frag},matcap:{uniforms:qe([G.common,G.bumpmap,G.normalmap,G.displacementmap,G.fog,{matcap:{value:null}}]),vertexShader:In.meshmatcap_vert,fragmentShader:In.meshmatcap_frag},points:{uniforms:qe([G.points,G.fog]),vertexShader:In.points_vert,fragmentShader:In.points_frag},dashed:{uniforms:qe([G.common,G.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:In.linedashed_vert,fragmentShader:In.linedashed_frag},depth:{uniforms:qe([G.common,G.displacementmap]),vertexShader:In.depth_vert,fragmentShader:In.depth_frag},normal:{uniforms:qe([G.common,G.bumpmap,G.normalmap,G.displacementmap,{opacity:{value:1}}]),vertexShader:In.meshnormal_vert,fragmentShader:In.meshnormal_frag},sprite:{uniforms:qe([G.sprite,G.fog]),vertexShader:In.sprite_vert,fragmentShader:In.sprite_frag},background:{uniforms:{uvTransform:{value:new Qe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:In.background_vert,fragmentShader:In.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Qe}},vertexShader:In.backgroundCube_vert,fragmentShader:In.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:In.cube_vert,fragmentShader:In.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:In.equirect_vert,fragmentShader:In.equirect_frag},distanceRGBA:{uniforms:qe([G.common,G.displacementmap,{referencePosition:{value:new x},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:In.distanceRGBA_vert,fragmentShader:In.distanceRGBA_frag},shadow:{uniforms:qe([G.lights,G.fog,{color:{value:new Me(0)},opacity:{value:1}}]),vertexShader:In.shadow_vert,fragmentShader:In.shadow_frag}};Ln.physical={uniforms:qe([Ln.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Qe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Qe},clearcoatNormalScale:{value:new R(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Qe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Qe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Qe},sheen:{value:0},sheenColor:{value:new Me(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Qe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Qe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Qe},transmissionSamplerSize:{value:new R},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Qe},attenuationDistance:{value:0},attenuationColor:{value:new Me(0)},specularColor:{value:new Me(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Qe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Qe},anisotropyVector:{value:new R},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Qe}}]),vertexShader:In.meshphysical_vert,fragmentShader:In.meshphysical_frag};var Rn={r:0,b:0,g:0},zn=new L,Bn=new I;function Vn(e,t,n,r,i,a,o){let s=new Me(0),c=a===!0?0:1,l,u,d=null,f=0,p=null;function m(e){let r=e.isScene===!0?e.background:null;return r&&r.isTexture&&(r=(e.backgroundBlurriness>0?n:t).get(r)),r}function h(t){let n=!1,i=m(t);i===null?_(s,c):i&&i.isColor&&(_(i,1),n=!0);let a=e.xr.getEnvironmentBlendMode();a===`additive`?r.buffers.color.setClear(0,0,0,1,o):a===`alpha-blend`&&r.buffers.color.setClear(0,0,0,0,o),(e.autoClear||n)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function g(t,n){let r=m(n);r&&(r.isCubeTexture||r.mapping===306)?(u===void 0&&(u=new N(new j(1,1,1),new le({name:`BackgroundCubeMaterial`,uniforms:nt(Ln.backgroundCube.uniforms),vertexShader:Ln.backgroundCube.vertexShader,fragmentShader:Ln.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute(`normal`),u.geometry.deleteAttribute(`uv`),u.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(u)),zn.copy(n.backgroundRotation),zn.x*=-1,zn.y*=-1,zn.z*=-1,r.isCubeTexture&&r.isRenderTargetTexture===!1&&(zn.y*=-1,zn.z*=-1),u.material.uniforms.envMap.value=r,u.material.uniforms.flipEnvMap.value=r.isCubeTexture&&r.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Bn.makeRotationFromEuler(zn)),u.material.toneMapped=Ae.getTransfer(r.colorSpace)!==Ce,(d!==r||f!==r.version||p!==e.toneMapping)&&(u.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),u.layers.enableAll(),t.unshift(u,u.geometry,u.material,0,0,null)):r&&r.isTexture&&(l===void 0&&(l=new N(new ct(2,2),new le({name:`BackgroundMaterial`,uniforms:nt(Ln.background.uniforms),vertexShader:Ln.background.vertexShader,fragmentShader:Ln.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=r,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.toneMapped=Ae.getTransfer(r.colorSpace)!==Ce,r.matrixAutoUpdate===!0&&r.updateMatrix(),l.material.uniforms.uvTransform.value.copy(r.matrix),(d!==r||f!==r.version||p!==e.toneMapping)&&(l.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null))}function _(t,n){t.getRGB(Rn,M(e)),r.buffers.color.setClear(Rn.r,Rn.g,Rn.b,n,o)}function v(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return s},setClearColor:function(e,t=1){s.set(e),c=t,_(s,c)},getClearAlpha:function(){return c},setClearAlpha:function(e){c=e,_(s,c)},render:h,addToRenderList:g,dispose:v}}function Hn(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n){let i=n.wireframe===!0,a=r[e.id];a===void 0&&(a={},r[e.id]=a);let o=a[t.id];o===void 0&&(o={},a[t.id]=o);let s=o[i];return s===void 0&&(s=f(c()),o[i]=s),s}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){C();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e.id]}function ee(e){for(let t in r){let n=r[t];if(n[e.id]===void 0)continue;let i=n[e.id];for(let e in i)u(i[e].object),delete i[e];delete n[e.id]}}function C(){w(),o=!0,a!==i&&(a=i,l(a.object))}function w(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:C,resetDefaultState:w,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfProgram:ee,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function Un(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}function c(e,i,a,s){if(a===0)return;let c=t.get(`WEBGL_multi_draw`);if(c===null)for(let t=0;t<e.length;t++)o(e[t],i[t],s[t]);else{c.multiDrawArraysInstancedWEBGL(r,e,0,i,0,s,0,a);let t=0;for(let e=0;e<a;e++)t+=i[e]*s[e];n.update(t,r,1)}}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s,this.renderMultiDrawInstances=c}function Wn(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&n!==1015&&!i)}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(console.warn(`THREE.WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=m>0,S=e.getParameter(e.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,vertexTextures:x,maxSamples:S}}function Gn(e){let t=this,n=null,r=0,i=!1,a=!1,o=new u,s=new Qe,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,d(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=d(e,t,0)},this.setState=function(t,o,s){let u=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||u===null||u.length===0||a&&!p)a?d(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=d(u,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function d(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}function Kn(e){let t=new WeakMap;function n(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function r(r){if(r&&r.isTexture){let a=r.mapping;if(a===303||a===304){if(t.has(r)){let e=t.get(r).texture;return n(e,r.mapping)}{let a=r.image;if(a&&a.height>0){let o=new be(a.height);return o.fromEquirectangularTexture(e,r),t.set(r,o),r.addEventListener(`dispose`,i),n(o.texture,r.mapping)}return null}}}return r}function i(e){let n=e.target;n.removeEventListener(`dispose`,i);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function a(){t=new WeakMap}return{get:r,dispose:a}}var qn=4,Jn=[.125,.215,.35,.446,.526,.582],Yn=20,Xn=new we,Zn=new Me,Qn=null,$n=0,er=0,tr=!1,nr=(1+Math.sqrt(5))/2,rr=1/nr,ir=[new x(-nr,rr,0),new x(nr,rr,0),new x(-rr,0,nr),new x(rr,0,nr),new x(0,nr,-rr),new x(0,nr,rr),new x(-1,1,-1),new x(1,1,-1),new x(-1,1,1),new x(1,1,1)],ar=new x,or=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=ar}=i;Qn=this._renderer.getRenderTarget(),$n=this._renderer.getActiveCubeFace(),er=this._renderer.getActiveMipmapLevel(),tr=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=fr(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=dr(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Qn,$n,er),this._renderer.xr.enabled=tr,e.scissorTest=!1,lr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Qn=this._renderer.getRenderTarget(),$n=this._renderer.getActiveCubeFace(),er=this._renderer.getActiveMipmapLevel(),tr=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:ye,minFilter:ye,generateMipmaps:!1,type:me,format:te,colorSpace:De,depthBuffer:!1},r=cr(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=cr(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=sr(r)),this._blurMaterial=ur(r,e,t)}return r}_compileMaterial(e){let t=new N(this._lodPlanes[0],e);this._renderer.compile(t,Xn)}_sceneToCubeUV(e,t,n,r,i){let a=new A(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(Zn),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null));let d=new Je({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1}),f=new N(new j,d),p=!1,m=e.background;m?m.isColor&&(d.color.copy(m),e.background=null,p=!0):(d.color.copy(Zn),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;lr(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(f,a),c.render(e,a)}f.geometry.dispose(),f.material.dispose(),c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=fr()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=dr());let i=r?this._cubemapMaterial:this._equirectMaterial,a=new N(this._lodPlanes[0],i),o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;lr(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,Xn)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodPlanes.length;for(let t=1;t<r;t++){let n=Math.sqrt(this._sigmas[t]*this._sigmas[t]-this._sigmas[t-1]*this._sigmas[t-1]),i=ir[(r-t-1)%ir.length];this._blur(e,t-1,t,n,i)}t.autoClear=n}_blur(e,t,n,r,i){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,r,`latitudinal`,i),this._halfBlur(a,e,n,n,r,`longitudinal`,i)}_halfBlur(e,t,n,r,i,a,o){let s=this._renderer,c=this._blurMaterial;a!==`latitudinal`&&a!==`longitudinal`&&console.error(`blur direction must be either latitudinal or longitudinal!`);let l=new N(this._lodPlanes[r],c),u=c.uniforms,d=this._sizeLods[n]-1,f=isFinite(i)?Math.PI/(2*d):2*Math.PI/39,p=i/f,m=isFinite(i)?1+Math.floor(3*p):Yn;m>Yn&&console.warn(`sigmaRadians, ${i}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Yn}`);let h=[],g=0;for(let e=0;e<Yn;++e){let t=e/p,n=Math.exp(-t*t/2);h.push(n),e===0?g+=n:e<m&&(g+=2*n)}for(let e=0;e<h.length;e++)h[e]=h[e]/g;u.envMap.value=e.texture,u.samples.value=m,u.weights.value=h,u.latitudinal.value=a===`latitudinal`,o&&(u.poleAxis.value=o);let{_lodMax:_}=this;u.dTheta.value=f,u.mipInt.value=_-n;let v=this._sizeLods[r];lr(t,3*v*(r>_-qn?r-_+qn:0),4*(this._cubeSize-v),3*v,2*v),s.setRenderTarget(t),s.render(l,Xn)}};function sr(e){let t=[],n=[],r=[],i=e,a=e-qn+1+Jn.length;for(let o=0;o<a;o++){let a=2**i;n.push(a);let s=1/a;o>e-qn?s=Jn[o-e+qn-1]:o===0&&(s=0),r.push(s);let c=1/(a-2),l=-c,u=1+c,d=[l,l,u,l,u,u,l,l,u,u,l,u],f=new Float32Array(108),p=new Float32Array(72),m=new Float32Array(36);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];f.set(r,18*e),p.set(d,12*e);let i=[e,e,e,e,e,e];m.set(i,6*e)}let h=new $e;h.setAttribute(`position`,new Ke(f,3)),h.setAttribute(`uv`,new Ke(p,2)),h.setAttribute(`faceIndex`,new Ke(m,1)),t.push(h),i>qn&&i--}return{lodPlanes:t,sizeLods:n,sigmas:r}}function cr(e,t,n){let r=new ae(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function lr(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function ur(e,t,n){let r=new Float32Array(Yn),i=new x(0,1,0);return new le({name:`SphericalGaussianBlur`,defines:{n:Yn,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:pr(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function dr(){return new le({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:pr(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function fr(){return new le({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:pr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function pr(){return`

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
	`}function mr(e){let t=new WeakMap,n=null;function r(r){if(r&&r.isTexture){let o=r.mapping,s=o===303||o===304,c=o===301||o===302;if(s||c){let o=t.get(r),l=o===void 0?0:o.texture.pmremVersion;if(r.isRenderTargetTexture&&r.pmremVersion!==l)return n===null&&(n=new or(e)),o=s?n.fromEquirectangular(r,o):n.fromCubemap(r,o),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),o.texture;if(o!==void 0)return o.texture;{let l=r.image;return s&&l&&l.height>0||c&&l&&i(l)?(n===null&&(n=new or(e)),o=s?n.fromEquirectangular(r):n.fromCubemap(r),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),r.addEventListener(`dispose`,a),o.texture):null}}}return r}function i(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function a(e){let n=e.target;n.removeEventListener(`dispose`,a);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function o(){t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:r,dispose:o}}function hr(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r;switch(n){case`WEBGL_depth_texture`:r=e.getExtension(`WEBGL_depth_texture`)||e.getExtension(`MOZ_WEBGL_depth_texture`)||e.getExtension(`WEBKIT_WEBGL_depth_texture`);break;case`EXT_texture_filter_anisotropic`:r=e.getExtension(`EXT_texture_filter_anisotropic`)||e.getExtension(`MOZ_EXT_texture_filter_anisotropic`)||e.getExtension(`WEBKIT_EXT_texture_filter_anisotropic`);break;case`WEBGL_compressed_texture_s3tc`:r=e.getExtension(`WEBGL_compressed_texture_s3tc`)||e.getExtension(`MOZ_WEBGL_compressed_texture_s3tc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_s3tc`);break;case`WEBGL_compressed_texture_pvrtc`:r=e.getExtension(`WEBGL_compressed_texture_pvrtc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_pvrtc`);break;default:r=e.getExtension(n)}return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&Te(`THREE.WebGLRenderer: `+e+` extension not supported.`),t}}}function gr(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0||(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++),t}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else if(i!==void 0){let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}else return;let s=new(F(n)?S:y)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function _r(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}function d(e,i,s,c){if(s===0)return;let u=t.get(`WEBGL_multi_draw`);if(u===null)for(let t=0;t<e.length;t++)l(e[t]/o,i[t],c[t]);else{u.multiDrawElementsInstancedWEBGL(r,i,0,a,e,0,c,0,s);let t=0;for(let e=0;e<s;e++)t+=i[e]*c[e];n.update(t,r,1)}}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function vr(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:console.error(`THREE.WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function yr(e,t,n){let r=new WeakMap,i=new ve;function a(a,o,s){let c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=u===void 0?0:u.length,f=r.get(o);if(f===void 0||f.count!==d){f!==void 0&&f.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],u=o.morphAttributes.color||[],p=0;e===!0&&(p=1),n===!0&&(p=2),a===!0&&(p=3);let m=o.attributes.position.count*p,h=1;m>t.maxTextureSize&&(h=Math.ceil(m/t.maxTextureSize),m=t.maxTextureSize);let g=new Float32Array(m*h*4*d),_=new l(g,m,h,d);_.type=v,_.needsUpdate=!0;let y=p*4;for(let t=0;t<d;t++){let r=s[t],o=c[t],l=u[t],d=m*h*4*t;for(let t=0;t<r.count;t++){let s=t*y;e===!0&&(i.fromBufferAttribute(r,t),g[d+s+0]=i.x,g[d+s+1]=i.y,g[d+s+2]=i.z,g[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),g[d+s+4]=i.x,g[d+s+5]=i.y,g[d+s+6]=i.z,g[d+s+7]=0),a===!0&&(i.fromBufferAttribute(l,t),g[d+s+8]=i.x,g[d+s+9]=i.y,g[d+s+10]=i.z,g[d+s+11]=l.itemSize===4?i.w:1)}}f={count:d,texture:_,size:new R(m,h)},r.set(o,f);function b(){_.dispose(),r.delete(o),o.removeEventListener(`dispose`,b)}o.addEventListener(`dispose`,b)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,f.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,f.size)}return{update:a}}function br(e,t,n,r){let i=new WeakMap;function a(a){let o=r.render.frame,c=a.geometry,l=t.get(a,c);if(i.get(l)!==o&&(t.update(l),i.set(l,o)),a.isInstancedMesh&&(a.hasEventListener(`dispose`,s)===!1&&a.addEventListener(`dispose`,s),i.get(a)!==o&&(n.update(a.instanceMatrix,e.ARRAY_BUFFER),a.instanceColor!==null&&n.update(a.instanceColor,e.ARRAY_BUFFER),i.set(a,o))),a.isSkinnedMesh){let e=a.skeleton;i.get(e)!==o&&(e.update(),i.set(e,o))}return l}function o(){i=new WeakMap}function s(e){let t=e.target;t.removeEventListener(`dispose`,s),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:a,dispose:o}}var xr=new E,Sr=new d(1,1),Cr=new l,wr=new ce,Tr=new ot,Er=[],Dr=[],Or=new Float32Array(16),kr=new Float32Array(9),Ar=new Float32Array(4);function jr(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=Er[i];if(a===void 0&&(a=new Float32Array(i),Er[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function Mr(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function Nr(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function Pr(e,t){let n=Dr[t];n===void 0&&(n=new Int32Array(t),Dr[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function Fr(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function Ir(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Mr(n,t))return;e.uniform2fv(this.addr,t),Nr(n,t)}}function Lr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(Mr(n,t))return;e.uniform3fv(this.addr,t),Nr(n,t)}}function Rr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Mr(n,t))return;e.uniform4fv(this.addr,t),Nr(n,t)}}function zr(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Mr(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),Nr(n,t)}else{if(Mr(n,r))return;Ar.set(r),e.uniformMatrix2fv(this.addr,!1,Ar),Nr(n,r)}}function Br(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Mr(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),Nr(n,t)}else{if(Mr(n,r))return;kr.set(r),e.uniformMatrix3fv(this.addr,!1,kr),Nr(n,r)}}function Vr(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(Mr(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),Nr(n,t)}else{if(Mr(n,r))return;Or.set(r),e.uniformMatrix4fv(this.addr,!1,Or),Nr(n,r)}}function Hr(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function Ur(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Mr(n,t))return;e.uniform2iv(this.addr,t),Nr(n,t)}}function Wr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Mr(n,t))return;e.uniform3iv(this.addr,t),Nr(n,t)}}function Gr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Mr(n,t))return;e.uniform4iv(this.addr,t),Nr(n,t)}}function Kr(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function qr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(Mr(n,t))return;e.uniform2uiv(this.addr,t),Nr(n,t)}}function Jr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(Mr(n,t))return;e.uniform3uiv(this.addr,t),Nr(n,t)}}function Yr(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(Mr(n,t))return;e.uniform4uiv(this.addr,t),Nr(n,t)}}function Xr(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(Sr.compareFunction=515,a=Sr):a=xr,n.setTexture2D(t||a,i)}function Zr(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||wr,i)}function Qr(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||Tr,i)}function $r(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||Cr,i)}function ei(e){switch(e){case 5126:return Fr;case 35664:return Ir;case 35665:return Lr;case 35666:return Rr;case 35674:return zr;case 35675:return Br;case 35676:return Vr;case 5124:case 35670:return Hr;case 35667:case 35671:return Ur;case 35668:case 35672:return Wr;case 35669:case 35673:return Gr;case 5125:return Kr;case 36294:return qr;case 36295:return Jr;case 36296:return Yr;case 35678:case 36198:case 36298:case 36306:case 35682:return Xr;case 35679:case 36299:case 36307:return Zr;case 35680:case 36300:case 36308:case 36293:return Qr;case 36289:case 36303:case 36311:case 36292:return $r}}function ti(e,t){e.uniform1fv(this.addr,t)}function ni(e,t){let n=jr(t,this.size,2);e.uniform2fv(this.addr,n)}function ri(e,t){let n=jr(t,this.size,3);e.uniform3fv(this.addr,n)}function ii(e,t){let n=jr(t,this.size,4);e.uniform4fv(this.addr,n)}function ai(e,t){let n=jr(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function oi(e,t){let n=jr(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function si(e,t){let n=jr(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function ci(e,t){e.uniform1iv(this.addr,t)}function li(e,t){e.uniform2iv(this.addr,t)}function ui(e,t){e.uniform3iv(this.addr,t)}function di(e,t){e.uniform4iv(this.addr,t)}function fi(e,t){e.uniform1uiv(this.addr,t)}function pi(e,t){e.uniform2uiv(this.addr,t)}function mi(e,t){e.uniform3uiv(this.addr,t)}function hi(e,t){e.uniform4uiv(this.addr,t)}function gi(e,t,n){let r=this.cache,i=t.length,a=Pr(n,i);Mr(r,a)||(e.uniform1iv(this.addr,a),Nr(r,a));for(let e=0;e!==i;++e)n.setTexture2D(t[e]||xr,a[e])}function _i(e,t,n){let r=this.cache,i=t.length,a=Pr(n,i);Mr(r,a)||(e.uniform1iv(this.addr,a),Nr(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||wr,a[e])}function vi(e,t,n){let r=this.cache,i=t.length,a=Pr(n,i);Mr(r,a)||(e.uniform1iv(this.addr,a),Nr(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||Tr,a[e])}function yi(e,t,n){let r=this.cache,i=t.length,a=Pr(n,i);Mr(r,a)||(e.uniform1iv(this.addr,a),Nr(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||Cr,a[e])}function bi(e){switch(e){case 5126:return ti;case 35664:return ni;case 35665:return ri;case 35666:return ii;case 35674:return ai;case 35675:return oi;case 35676:return si;case 5124:case 35670:return ci;case 35667:case 35671:return li;case 35668:case 35672:return ui;case 35669:case 35673:return di;case 5125:return fi;case 36294:return pi;case 36295:return mi;case 36296:return hi;case 35678:case 36198:case 36298:case 36306:case 35682:return gi;case 35679:case 36299:case 36307:return _i;case 35680:case 36300:case 36308:case 36293:return vi;case 36289:case 36303:case 36311:case 36292:return yi}}var xi=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=ei(t.type)}},Si=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=bi(t.type)}},Ci=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},wi=/(\w+)(\])?(\[|\.)?/g;function Ti(e,t){e.seq.push(t),e.map[t.id]=t}function Ei(e,t,n){let r=e.name,i=r.length;for(wi.lastIndex=0;;){let a=wi.exec(r),o=wi.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){Ti(n,l===void 0?new xi(s,e,t):new Si(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new Ci(s),Ti(n,e)),n=e}}}var Di=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);Ei(n,e.getUniformLocation(t,n.name),this)}}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function Oi(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var ki=37297,Ai=0;function ji(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var Mi=new Qe;function Ni(e){Ae._getMatrix(Mi,Ae.workingColorSpace,e);let t=`mat3( ${Mi.elements.map(e=>e.toFixed(4))} )`;switch(Ae.getTransfer(e)){case rt:return[t,`LinearTransferOETF`];case Ce:return[t,`sRGBTransferOETF`];default:return console.warn(`THREE.WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function Pi(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+ji(e.getShaderSource(t),r)}return i}function Fi(e,t){let n=Ni(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}function Ii(e,t){let n;switch(t){case 1:n=`Linear`;break;case 2:n=`Reinhard`;break;case 3:n=`Cineon`;break;case 4:n=`ACESFilmic`;break;case 6:n=`AgX`;break;case 7:n=`Neutral`;break;case 5:n=`Custom`;break;default:console.warn(`THREE.WebGLProgram: Unsupported toneMapping:`,t),n=`Linear`}return`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var Li=new x;function Ri(){return Ae.getLuminanceCoefficients(Li),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${Li.x.toFixed(4)}, ${Li.y.toFixed(4)}, ${Li.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function zi(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(Hi).join(`
`)}function Bi(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function Vi(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function Hi(e){return e!==``}function Ui(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Wi(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Gi=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ki(e){return e.replace(Gi,Ji)}var qi=new Map;function Ji(e,t){let n=In[t];if(n===void 0){let e=qi.get(t);if(e!==void 0)n=In[e],console.warn(`THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`Can not resolve #include <`+t+`>`)}return Ki(n)}var Yi=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Xi(e){return e.replace(Yi,Zi)}function Zi(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function Qi(e){let t=`precision ${e.precision} float;
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
#define LOW_PRECISION`),t}function $i(e){let t=`SHADOWMAP_TYPE_BASIC`;return e.shadowMapType===1?t=`SHADOWMAP_TYPE_PCF`:e.shadowMapType===2?t=`SHADOWMAP_TYPE_PCF_SOFT`:e.shadowMapType===3&&(t=`SHADOWMAP_TYPE_VSM`),t}function ea(e){let t=`ENVMAP_TYPE_CUBE`;if(e.envMap)switch(e.envMapMode){case 301:case 302:t=`ENVMAP_TYPE_CUBE`;break;case 306:t=`ENVMAP_TYPE_CUBE_UV`}return t}function ta(e){let t=`ENVMAP_MODE_REFLECTION`;if(e.envMap)switch(e.envMapMode){case 302:t=`ENVMAP_MODE_REFRACTION`}return t}function na(e){let t=`ENVMAP_BLENDING_NONE`;if(e.envMap)switch(e.combine){case 0:t=`ENVMAP_BLENDING_MULTIPLY`;break;case 1:t=`ENVMAP_BLENDING_MIX`;break;case 2:t=`ENVMAP_BLENDING_ADD`}return t}function ra(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function ia(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=$i(n),l=ea(n),u=ta(n),d=na(n),f=ra(n),p=zi(n),m=Bi(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(Hi).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(Hi).join(`
`),_.length>0&&(_+=`
`)):(g=[Qi(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(Hi).join(`
`),_=[Qi(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor||n.batchingColor?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:In.tonemapping_pars_fragment,n.toneMapping===0?``:Ii(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,In.colorspace_pars_fragment,Fi(`linearToOutputTexel`,n.outputColorSpace),Ri(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(Hi).join(`
`)),o=Ki(o),o=Ui(o,n),o=Wi(o,n),s=Ki(s),s=Ui(s,n),s=Wi(s,n),o=Xi(o),s=Xi(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=Oi(i,i.VERTEX_SHADER,y),S=Oi(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.morphTargets===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function ee(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=Pi(i,x,`vertex`),n=Pi(i,S,`fragment`);console.error(`THREE.WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):console.warn(`THREE.WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),C=new Di(i,h),w=Vi(i,h)}let C;this.getUniforms=function(){return C===void 0&&ee(this),C};let w;this.getAttributes=function(){return w===void 0&&ee(this),w};let T=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return T===!1&&(T=i.getProgramParameter(h,ki)),T},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=Ai++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var aa=0,oa=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),i=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(i)===!1&&(a.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new sa(e),t.set(e,n)),n}},sa=class{constructor(e){this.id=aa++,this.code=e,this.usedTimes=0}};function ca(e,t,n,r,i,a,o){let s=new _e,c=new oa,l=new Set,u=[],d=i.logarithmicDepthBuffer,f=i.vertexTextures,p=i.precision,m={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distanceRGBA`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function h(e){return l.add(e),e===0?`uv`:`uv${e}`}function g(a,s,u,g,_){let v=g.fog,y=_.geometry,b=a.isMeshStandardMaterial?g.environment:null,x=(a.isMeshStandardMaterial?n:t).get(a.envMap||b),S=x&&x.mapping===306?x.image.height:null,ee=m[a.type];a.precision!==null&&(p=i.getMaxPrecision(a.precision),p!==a.precision&&console.warn(`THREE.WebGLProgram.getParameters:`,a.precision,`not supported, using`,p,`instead.`));let C=y.morphAttributes.position||y.morphAttributes.normal||y.morphAttributes.color,w=C===void 0?0:C.length,T=0;y.morphAttributes.position!==void 0&&(T=1),y.morphAttributes.normal!==void 0&&(T=2),y.morphAttributes.color!==void 0&&(T=3);let E,te,D,ne;if(ee){let e=Ln[ee];E=e.vertexShader,te=e.fragmentShader}else E=a.vertexShader,te=a.fragmentShader,c.update(a),D=c.getVertexShaderID(a),ne=c.getFragmentShaderID(a);let O=e.getRenderTarget(),re=e.state.buffers.depth.getReversed(),k=_.isInstancedMesh===!0,ie=_.isBatchedMesh===!0,ae=!!a.map,oe=!!a.matcap,se=!!x,ce=!!a.aoMap,le=!!a.lightMap,A=!!a.bumpMap,ue=!!a.normalMap,de=!!a.displacementMap,fe=!!a.emissiveMap,pe=!!a.metalnessMap,me=!!a.roughnessMap,he=a.anisotropy>0,ge=a.clearcoat>0,_e=a.dispersion>0,ve=a.iridescence>0,ye=a.sheen>0,be=a.transmission>0,xe=he&&!!a.anisotropyMap,Se=ge&&!!a.clearcoatMap,j=ge&&!!a.clearcoatNormalMap,M=ge&&!!a.clearcoatRoughnessMap,N=ve&&!!a.iridescenceMap,Ce=ve&&!!a.iridescenceThicknessMap,we=ye&&!!a.sheenColorMap,Te=ye&&!!a.sheenRoughnessMap,P=!!a.specularMap,Ee=!!a.specularColorMap,F=!!a.specularIntensityMap,Oe=be&&!!a.transmissionMap,ke=be&&!!a.thicknessMap,je=!!a.gradientMap,Me=!!a.alphaMap,Ne=a.alphaTest>0,Pe=!!a.alphaHash,Fe=!!a.extensions,Ie=0;a.toneMapped&&(O===null||O.isXRRenderTarget===!0)&&(Ie=e.toneMapping);let I={shaderID:ee,shaderType:a.type,shaderName:a.name,vertexShader:E,fragmentShader:te,defines:a.defines,customVertexShaderID:D,customFragmentShaderID:ne,isRawShaderMaterial:a.isRawShaderMaterial===!0,glslVersion:a.glslVersion,precision:p,batching:ie,batchingColor:ie&&_._colorsTexture!==null,instancing:k,instancingColor:k&&_.instanceColor!==null,instancingMorph:k&&_.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:O===null?e.outputColorSpace:O.isXRRenderTarget===!0?O.texture.colorSpace:De,alphaToCoverage:!!a.alphaToCoverage,map:ae,matcap:oe,envMap:se,envMapMode:se&&x.mapping,envMapCubeUVHeight:S,aoMap:ce,lightMap:le,bumpMap:A,normalMap:ue,displacementMap:f&&de,emissiveMap:fe,normalMapObjectSpace:ue&&a.normalMapType===1,normalMapTangentSpace:ue&&a.normalMapType===0,metalnessMap:pe,roughnessMap:me,anisotropy:he,anisotropyMap:xe,clearcoat:ge,clearcoatMap:Se,clearcoatNormalMap:j,clearcoatRoughnessMap:M,dispersion:_e,iridescence:ve,iridescenceMap:N,iridescenceThicknessMap:Ce,sheen:ye,sheenColorMap:we,sheenRoughnessMap:Te,specularMap:P,specularColorMap:Ee,specularIntensityMap:F,transmission:be,transmissionMap:Oe,thicknessMap:ke,gradientMap:je,opaque:a.transparent===!1&&a.blending===1&&a.alphaToCoverage===!1,alphaMap:Me,alphaTest:Ne,alphaHash:Pe,combine:a.combine,mapUv:ae&&h(a.map.channel),aoMapUv:ce&&h(a.aoMap.channel),lightMapUv:le&&h(a.lightMap.channel),bumpMapUv:A&&h(a.bumpMap.channel),normalMapUv:ue&&h(a.normalMap.channel),displacementMapUv:de&&h(a.displacementMap.channel),emissiveMapUv:fe&&h(a.emissiveMap.channel),metalnessMapUv:pe&&h(a.metalnessMap.channel),roughnessMapUv:me&&h(a.roughnessMap.channel),anisotropyMapUv:xe&&h(a.anisotropyMap.channel),clearcoatMapUv:Se&&h(a.clearcoatMap.channel),clearcoatNormalMapUv:j&&h(a.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:M&&h(a.clearcoatRoughnessMap.channel),iridescenceMapUv:N&&h(a.iridescenceMap.channel),iridescenceThicknessMapUv:Ce&&h(a.iridescenceThicknessMap.channel),sheenColorMapUv:we&&h(a.sheenColorMap.channel),sheenRoughnessMapUv:Te&&h(a.sheenRoughnessMap.channel),specularMapUv:P&&h(a.specularMap.channel),specularColorMapUv:Ee&&h(a.specularColorMap.channel),specularIntensityMapUv:F&&h(a.specularIntensityMap.channel),transmissionMapUv:Oe&&h(a.transmissionMap.channel),thicknessMapUv:ke&&h(a.thicknessMap.channel),alphaMapUv:Me&&h(a.alphaMap.channel),vertexTangents:!!y.attributes.tangent&&(ue||he),vertexColors:a.vertexColors,vertexAlphas:a.vertexColors===!0&&!!y.attributes.color&&y.attributes.color.itemSize===4,pointsUvs:_.isPoints===!0&&!!y.attributes.uv&&(ae||Me),fog:!!v,useFog:a.fog===!0,fogExp2:!!v&&v.isFogExp2,flatShading:a.flatShading===!0&&a.wireframe===!1,sizeAttenuation:a.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:re,skinning:_.isSkinnedMesh===!0,morphTargets:y.morphAttributes.position!==void 0,morphNormals:y.morphAttributes.normal!==void 0,morphColors:y.morphAttributes.color!==void 0,morphTargetsCount:w,morphTextureStride:T,numDirLights:s.directional.length,numPointLights:s.point.length,numSpotLights:s.spot.length,numSpotLightMaps:s.spotLightMap.length,numRectAreaLights:s.rectArea.length,numHemiLights:s.hemi.length,numDirLightShadows:s.directionalShadowMap.length,numPointLightShadows:s.pointShadowMap.length,numSpotLightShadows:s.spotShadowMap.length,numSpotLightShadowsWithMaps:s.numSpotLightShadowsWithMaps,numLightProbes:s.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:a.dithering,shadowMapEnabled:e.shadowMap.enabled&&u.length>0,shadowMapType:e.shadowMap.type,toneMapping:Ie,decodeVideoTexture:ae&&a.map.isVideoTexture===!0&&Ae.getTransfer(a.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:fe&&a.emissiveMap.isVideoTexture===!0&&Ae.getTransfer(a.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:a.premultipliedAlpha,doubleSided:a.side===2,flipSided:a.side===1,useDepthPacking:a.depthPacking>=0,depthPacking:a.depthPacking||0,index0AttributeName:a.index0AttributeName,extensionClipCullDistance:Fe&&a.extensions.clipCullDistance===!0&&r.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Fe&&a.extensions.multiDraw===!0||ie)&&r.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:r.has(`KHR_parallel_shader_compile`),customProgramCacheKey:a.customProgramCacheKey()};return I.vertexUv1s=l.has(1),I.vertexUv2s=l.has(2),I.vertexUv3s=l.has(3),l.clear(),I}function _(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(v(n,t),y(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function v(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function y(e,t){s.disableAll(),t.supportsVertexTextures&&s.enable(0),t.instancing&&s.enable(1),t.instancingColor&&s.enable(2),t.instancingMorph&&s.enable(3),t.matcap&&s.enable(4),t.envMap&&s.enable(5),t.normalMapObjectSpace&&s.enable(6),t.normalMapTangentSpace&&s.enable(7),t.clearcoat&&s.enable(8),t.iridescence&&s.enable(9),t.alphaTest&&s.enable(10),t.vertexColors&&s.enable(11),t.vertexAlphas&&s.enable(12),t.vertexUv1s&&s.enable(13),t.vertexUv2s&&s.enable(14),t.vertexUv3s&&s.enable(15),t.vertexTangents&&s.enable(16),t.anisotropy&&s.enable(17),t.alphaHash&&s.enable(18),t.batching&&s.enable(19),t.dispersion&&s.enable(20),t.batchingColor&&s.enable(21),t.gradientMap&&s.enable(22),e.push(s.mask),s.disableAll(),t.fog&&s.enable(0),t.useFog&&s.enable(1),t.flatShading&&s.enable(2),t.logarithmicDepthBuffer&&s.enable(3),t.reversedDepthBuffer&&s.enable(4),t.skinning&&s.enable(5),t.morphTargets&&s.enable(6),t.morphNormals&&s.enable(7),t.morphColors&&s.enable(8),t.premultipliedAlpha&&s.enable(9),t.shadowMapEnabled&&s.enable(10),t.doubleSided&&s.enable(11),t.flipSided&&s.enable(12),t.useDepthPacking&&s.enable(13),t.dithering&&s.enable(14),t.transmission&&s.enable(15),t.sheen&&s.enable(16),t.opaque&&s.enable(17),t.pointsUvs&&s.enable(18),t.decodeVideoTexture&&s.enable(19),t.decodeVideoTextureEmissive&&s.enable(20),t.alphaToCoverage&&s.enable(21),e.push(s.mask)}function b(e){let t=m[e.type],n;if(t){let e=Ln[t];n=se.clone(e.uniforms)}else n=e.uniforms;return n}function x(t,n){let r;for(let e=0,t=u.length;e<t;e++){let t=u[e];if(t.cacheKey===n){r=t,++r.usedTimes;break}}return r===void 0&&(r=new ia(e,n,t,a),u.push(r)),r}function S(e){if(--e.usedTimes===0){let t=u.indexOf(e);u[t]=u[u.length-1],u.pop(),e.destroy()}}function ee(e){c.remove(e)}function C(){c.dispose()}return{getParameters:g,getProgramCacheKey:_,getUniforms:b,acquireProgram:x,releaseProgram:S,releaseShaderCache:ee,programs:u,dispose:C}}function la(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function ua(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.z===t.z?e.id-t.id:e.z-t.z:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function da(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function fa(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(n,r,i,a,o,s){let c=e[t];return c===void 0?(c={id:n.id,object:n,geometry:r,material:i,groupOrder:a,renderOrder:n.renderOrder,z:o,group:s},e[t]=c):(c.id=n.id,c.object=n,c.geometry=r,c.material=i,c.groupOrder=a,c.renderOrder=n.renderOrder,c.z=o,c.group=s),t++,c}function s(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.push(u):a.transparent===!0?i.push(u):n.push(u)}function c(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function l(e,t){n.length>1&&n.sort(e||ua),r.length>1&&r.sort(t||da),i.length>1&&i.sort(t||da)}function u(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:s,unshift:c,finish:u,sort:l}}function pa(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new fa,e.set(t,[i])):n>=r.length?(i=new fa,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function ma(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={direction:new x,color:new Me};break;case`SpotLight`:n={position:new x,direction:new x,color:new Me,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new x,color:new Me,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new x,skyColor:new Me,groundColor:new Me};break;case`RectAreaLight`:n={color:new Me,position:new x,halfWidth:new x,halfHeight:new x}}return e[t.id]=n,n}}}function ha(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new R};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new R};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new R,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var ga=0;function _a(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function va(e){let t=new ma,n=ha(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new x);let i=new x,a=new I,o=new I;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0;i.sort(_a);for(let e=0,y=i.length;e<y;e++){let y=i[e],b=y.color,x=y.intensity,S=y.distance,ee=y.shadow&&y.shadow.map?y.shadow.map.texture:null;if(y.isAmbientLight)a+=b.r*x,o+=b.g*x,s+=b.b*x;else if(y.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(y.sh.coefficients[e],x);v++}else if(y.isDirectionalLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[c]=t,r.directionalShadowMap[c]=ee,r.directionalShadowMatrix[c]=y.shadow.matrix,p++}r.directional[c]=e,c++}else if(y.isSpotLight){let e=t.get(y);e.position.setFromMatrixPosition(y.matrixWorld),e.color.copy(b).multiplyScalar(x),e.distance=S,e.coneCos=Math.cos(y.angle),e.penumbraCos=Math.cos(y.angle*(1-y.penumbra)),e.decay=y.decay,r.spot[u]=e;let i=y.shadow;if(y.map&&(r.spotLightMap[g]=y.map,g++,i.updateMatrices(y),y.castShadow&&_++),r.spotLightMatrix[u]=i.matrix,y.castShadow){let e=n.get(y);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[u]=e,r.spotShadowMap[u]=ee,h++}u++}else if(y.isRectAreaLight){let e=t.get(y);e.color.copy(b).multiplyScalar(x),e.halfWidth.set(y.width*.5,0,0),e.halfHeight.set(0,y.height*.5,0),r.rectArea[d]=e,d++}else if(y.isPointLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),e.distance=y.distance,e.decay=y.decay,y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[l]=t,r.pointShadowMap[l]=ee,r.pointShadowMatrix[l]=y.shadow.matrix,m++}r.point[l]=e,l++}else if(y.isHemisphereLight){let e=t.get(y);e.skyColor.copy(y.color).multiplyScalar(x),e.groundColor.copy(y.groundColor).multiplyScalar(x),r.hemi[f]=e,f++}}d>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=G.LTC_FLOAT_1,r.rectAreaLTC2=G.LTC_FLOAT_2):(r.rectAreaLTC1=G.LTC_HALF_1,r.rectAreaLTC2=G.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let y=r.hash;(y.directionalLength!==c||y.pointLength!==l||y.spotLength!==u||y.rectAreaLength!==d||y.hemiLength!==f||y.numDirectionalShadows!==p||y.numPointShadows!==m||y.numSpotShadows!==h||y.numSpotMaps!==g||y.numLightProbes!==v)&&(r.directional.length=c,r.spot.length=u,r.rectArea.length=d,r.point.length=l,r.hemi.length=f,r.directionalShadow.length=p,r.directionalShadowMap.length=p,r.pointShadow.length=m,r.pointShadowMap.length=m,r.spotShadow.length=h,r.spotShadowMap.length=h,r.directionalShadowMatrix.length=p,r.pointShadowMatrix.length=m,r.spotLightMatrix.length=h+g-_,r.spotLightMap.length=g,r.numSpotLightShadowsWithMaps=_,r.numLightProbes=v,y.directionalLength=c,y.pointLength=l,y.spotLength=u,y.rectAreaLength=d,y.hemiLength=f,y.numDirectionalShadows=p,y.numPointShadows=m,y.numSpotShadows=h,y.numSpotMaps=g,y.numLightProbes=v,r.version=ga++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=t.matrixWorldInverse;for(let t=0,f=e.length;t<f;t++){let f=e[t];if(f.isDirectionalLight){let e=r.directional[n];e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),n++}else if(f.isSpotLight){let e=r.spot[c];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),c++}else if(f.isRectAreaLight){let e=r.rectArea[l];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),o.identity(),a.copy(f.matrixWorld),a.premultiply(d),o.extractRotation(a),e.halfWidth.set(f.width*.5,0,0),e.halfHeight.set(0,f.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),l++}else if(f.isPointLight){let e=r.point[s];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),s++}else if(f.isHemisphereLight){let e=r.hemi[u];e.direction.setFromMatrixPosition(f.matrixWorld),e.direction.transformDirection(d),u++}}}return{setup:s,setupView:c,state:r}}function ya(e){let t=new va(e),n=[],r=[];function i(e){l.camera=e,n.length=0,r.length=0}function a(e){n.push(e)}function o(e){r.push(e)}function s(){t.setup(n)}function c(e){t.setupView(n,e)}let l={lightsArray:n,shadowsArray:r,camera:null,lights:t,transmissionRenderTarget:{}};return{init:i,state:l,setupLights:s,setupLightsView:c,pushLight:a,pushShadow:o}}function ba(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new ya(e),t.set(n,[a])):r>=i.length?(a=new ya(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var xa=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Sa=`uniform sampler2D shadow_pass;
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
}`;function Ca(e,t,n){let r=new oe,i=new R,a=new R,o=new ve,s=new tt({depthPacking:w}),c=new P,l={},u=n.maxTextureSize,d={0:1,1:0,2:2},f=new le({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new R},radius:{value:4}},vertexShader:xa,fragmentShader:Sa}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let m=new $e;m.setAttribute(`position`,new Ke(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let h=new N(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let _=this.type;this.render=function(t,n,s){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||t.length===0)return;let c=e.getRenderTarget(),l=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),f=e.state;f.setBlending(0),f.buffers.depth.getReversed()===!0?f.buffers.color.setClear(0,0,0,0):f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);let p=_!==3&&this.type===3,m=_===3&&this.type!==3;for(let c=0,l=t.length;c<l;c++){let l=t[c],d=l.shadow;if(d===void 0){console.warn(`THREE.WebGLShadowMap:`,l,`has no shadow.`);continue}if(d.autoUpdate===!1&&d.needsUpdate===!1)continue;i.copy(d.mapSize);let h=d.getFrameExtents();if(i.multiply(h),a.copy(d.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(a.x=Math.floor(u/h.x),i.x=a.x*h.x,d.mapSize.x=a.x),i.y>u&&(a.y=Math.floor(u/h.y),i.y=a.y*h.y,d.mapSize.y=a.y)),d.map===null||p===!0||m===!0){let e=this.type===3?{}:{minFilter:Pe,magFilter:Pe};d.map!==null&&d.map.dispose(),d.map=new ae(i.x,i.y,e),d.map.texture.name=l.name+`.shadowMap`,d.camera.updateProjectionMatrix()}e.setRenderTarget(d.map),e.clear();let g=d.getViewportCount();for(let e=0;e<g;e++){let t=d.getViewport(e);o.set(a.x*t.x,a.y*t.y,a.x*t.z,a.y*t.w),f.viewport(o),d.updateMatrices(l,e),r=d.getFrustum(),b(n,s,d.camera,l,this.type)}d.isPointLightShadow!==!0&&this.type===3&&v(d,s),d.needsUpdate=!1}_=this.type,g.needsUpdate=!1,e.setRenderTarget(c,l,d)};function v(n,r){let a=t.update(h);f.defines.VSM_SAMPLES!==n.blurSamples&&(f.defines.VSM_SAMPLES=n.blurSamples,p.defines.VSM_SAMPLES=n.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),n.mapPass===null&&(n.mapPass=new ae(i.x,i.y)),f.uniforms.shadow_pass.value=n.map.texture,f.uniforms.resolution.value=n.mapSize,f.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,f,h,null),p.uniforms.shadow_pass.value=n.mapPass.texture,p.uniforms.resolution.value=n.mapSize,p.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,p,h,null)}function y(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?c:s,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=l[e];r===void 0&&(r={},l[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,x)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?d[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function b(n,i,a,o,s){if(n.visible===!1)return;if(n.layers.test(i.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||r.intersectsObject(n))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),c=n.material;if(Array.isArray(c)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=y(n,d,o,s);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(c.visible){let t=y(n,c,o,s);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)b(c[e],i,a,o,s)}function x(e){e.target.removeEventListener(`dispose`,x);for(let t in l){let n=l[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}var wa={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3};function Ta(e,t){function n(){let t=!1,n=new ve,r=null,i=new ve(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?fe(e.DEPTH_TEST):pe(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=wa[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(r&&(t=1-t),e.clearDepth(t),o=t)},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?fe(e.STENCIL_TEST):pe(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,ee=new Me(0,0,0),C=0,w=!1,T=null,E=null,te=null,D=null,ne=null,O=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),re=!1,k=0,ie=e.getParameter(e.VERSION);ie.indexOf(`WebGL`)===-1?ie.indexOf(`OpenGL ES`)!==-1&&(k=parseFloat(/^OpenGL ES (\d)/.exec(ie)[1]),re=k>=2):(k=parseFloat(/^WebGL (\d)/.exec(ie)[1]),re=k>=1);let ae=null,oe={},se=e.getParameter(e.SCISSOR_BOX),ce=e.getParameter(e.VIEWPORT),le=new ve().fromArray(se),A=new ve().fromArray(ce);function ue(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let de={};de[e.TEXTURE_2D]=ue(e.TEXTURE_2D,e.TEXTURE_2D,1),de[e.TEXTURE_CUBE_MAP]=ue(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),de[e.TEXTURE_2D_ARRAY]=ue(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),de[e.TEXTURE_3D]=ue(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),fe(e.DEPTH_TEST),o.setFunc(3),Se(!1),j(1),fe(e.CULL_FACE),be(0);function fe(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function pe(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function me(t,n){return d[t]!==n&&(e.bindFramebuffer(t,n),d[t]=n,t===e.DRAW_FRAMEBUFFER&&(d[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(d[e.DRAW_FRAMEBUFFER]=n),!0)}function he(t,n){let r=p,i=!1;if(t){r=f.get(n),r===void 0&&(r=[],f.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function ge(t){return m!==t&&(e.useProgram(t),m=t,!0)}let _e={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};_e[103]=e.MIN,_e[104]=e.MAX;let ye={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function be(t,n,r,i,a,o,s,c,l,u){if(t===0)h===!0&&(pe(e.BLEND),h=!1);else if(h===!1&&(fe(e.BLEND),h=!0),t!==5){if(t!==g||u!==w){if((_!==100||b!==100)&&(e.blendEquation(e.FUNC_ADD),_=100,b=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:console.error(`THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:console.error(`THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}v=null,y=null,x=null,S=null,ee.set(0,0,0),C=0,g=t,w=u}}else a||=n,o||=r,s||=i,(n!==_||a!==b)&&(e.blendEquationSeparate(_e[n],_e[a]),_=n,b=a),(r!==v||i!==y||o!==x||s!==S)&&(e.blendFuncSeparate(ye[r],ye[i],ye[o],ye[s]),v=r,y=i,x=o,S=s),(c.equals(ee)===!1||l!==C)&&(e.blendColor(c.r,c.g,c.b,l),ee.copy(c),C=l),g=t,w=!1}function xe(t,n){t.side===2?pe(e.CULL_FACE):fe(e.CULL_FACE);let r=t.side===1;n&&(r=!r),Se(r),t.blending===1&&t.transparent===!1?be(0):be(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),N(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?fe(e.SAMPLE_ALPHA_TO_COVERAGE):pe(e.SAMPLE_ALPHA_TO_COVERAGE)}function Se(t){T!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),T=t)}function j(t){t===0?pe(e.CULL_FACE):(fe(e.CULL_FACE),t!==E&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),E=t}function M(t){t!==te&&(re&&e.lineWidth(t),te=t)}function N(t,n,r){t?(fe(e.POLYGON_OFFSET_FILL),(D!==n||ne!==r)&&(e.polygonOffset(n,r),D=n,ne=r)):pe(e.POLYGON_OFFSET_FILL)}function Ce(t){t?fe(e.SCISSOR_TEST):pe(e.SCISSOR_TEST)}function we(t){t===void 0&&(t=e.TEXTURE0+O-1),ae!==t&&(e.activeTexture(t),ae=t)}function Te(t,n,r){r===void 0&&(r=ae===null?e.TEXTURE0+O-1:ae);let i=oe[r];i===void 0&&(i={type:void 0,texture:void 0},oe[r]=i),(i.type!==t||i.texture!==n)&&(ae!==r&&(e.activeTexture(r),ae=r),e.bindTexture(t,n||de[t]),i.type=t,i.texture=n)}function P(){let t=oe[ae];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function Ee(){try{e.compressedTexImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function F(){try{e.compressedTexImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function De(){try{e.texSubImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Oe(){try{e.texSubImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function ke(){try{e.compressedTexSubImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ae(){try{e.compressedTexSubImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function je(){try{e.texStorage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ne(){try{e.texStorage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Pe(){try{e.texImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Fe(){try{e.texImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ie(t){le.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),le.copy(t))}function I(t){A.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),A.copy(t))}function L(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function Le(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function Re(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),u={},ae=null,oe={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,ee=new Me(0,0,0),C=0,w=!1,T=null,E=null,te=null,D=null,ne=null,le.set(0,0,e.canvas.width,e.canvas.height),A.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:fe,disable:pe,bindFramebuffer:me,drawBuffers:he,useProgram:ge,setBlending:be,setMaterial:xe,setFlipSided:Se,setCullFace:j,setLineWidth:M,setPolygonOffset:N,setScissorTest:Ce,activeTexture:we,bindTexture:Te,unbindTexture:P,compressedTexImage2D:Ee,compressedTexImage3D:F,texImage2D:Pe,texImage3D:Fe,updateUBOMapping:L,uniformBlockBinding:Le,texStorage2D:je,texStorage3D:Ne,texSubImage2D:De,texSubImage3D:Oe,compressedTexSubImage2D:ke,compressedTexSubImage3D:Ae,scissor:Ie,viewport:I,reset:Re}}function Ea(e,t,n,r,i,o,s){let c=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,l=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),u=new R,d=new WeakMap,f,m=new WeakMap,h=!1;try{h=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function g(e,t){return h?new OffscreenCanvas(e,t):Ze(`canvas`)}function _(e,t,n){let r=1,i=De(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);f===void 0&&(f=g(n,a));let o=t?g(n,a):f;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),console.warn(`THREE.WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&console.warn(`THREE.WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function v(e){return e.generateMipmaps}function y(t){e.generateMipmap(t)}function b(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function x(n,r,i,a,o=!1){if(n!==null){if(e[n]!==void 0)return e[n];console.warn(`THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let s=r;if(r===e.RED&&(i===e.FLOAT&&(s=e.R32F),i===e.HALF_FLOAT&&(s=e.R16F),i===e.UNSIGNED_BYTE&&(s=e.R8)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.R8UI),i===e.UNSIGNED_SHORT&&(s=e.R16UI),i===e.UNSIGNED_INT&&(s=e.R32UI),i===e.BYTE&&(s=e.R8I),i===e.SHORT&&(s=e.R16I),i===e.INT&&(s=e.R32I)),r===e.RG&&(i===e.FLOAT&&(s=e.RG32F),i===e.HALF_FLOAT&&(s=e.RG16F),i===e.UNSIGNED_BYTE&&(s=e.RG8)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RG8UI),i===e.UNSIGNED_SHORT&&(s=e.RG16UI),i===e.UNSIGNED_INT&&(s=e.RG32UI),i===e.BYTE&&(s=e.RG8I),i===e.SHORT&&(s=e.RG16I),i===e.INT&&(s=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RGB8UI),i===e.UNSIGNED_SHORT&&(s=e.RGB16UI),i===e.UNSIGNED_INT&&(s=e.RGB32UI),i===e.BYTE&&(s=e.RGB8I),i===e.SHORT&&(s=e.RGB16I),i===e.INT&&(s=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(s=e.RGBA16UI),i===e.UNSIGNED_INT&&(s=e.RGBA32UI),i===e.BYTE&&(s=e.RGBA8I),i===e.SHORT&&(s=e.RGBA16I),i===e.INT&&(s=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_INT_5_9_9_9_REV&&(s=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(s=e.R11F_G11F_B10F)),r===e.RGBA){let t=o?rt:Ae.getTransfer(a);i===e.FLOAT&&(s=e.RGBA32F),i===e.HALF_FLOAT&&(s=e.RGBA16F),i===e.UNSIGNED_BYTE&&(s=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT_4_4_4_4&&(s=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(s=e.RGB5_A1)}return(s===e.R16F||s===e.R32F||s===e.RG16F||s===e.RG32F||s===e.RGBA16F||s===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),s}function S(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,console.warn(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function ee(e,t){return v(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function C(e){let t=e.target;t.removeEventListener(`dispose`,C),T(t),t.isVideoTexture&&d.delete(t)}function w(e){let t=e.target;t.removeEventListener(`dispose`,w),te(t)}function T(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=m.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&E(e),Object.keys(i).length===0&&m.delete(n)}r.remove(e)}function E(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=m.get(i);delete a[n.__cacheKey],s.memory.textures--}function te(t){let n=r.get(t);if(t.depthTexture&&(t.depthTexture.dispose(),r.remove(t.depthTexture)),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let i=t.textures;for(let t=0,n=i.length;t<n;t++){let n=r.get(i[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),s.memory.textures--),r.remove(i[t])}r.remove(t)}let D=0;function ne(){D=0}function O(){let e=D;return e>=i.maxTextures&&console.warn(`THREE.WebGLTextures: Trying to use `+e+` texture units while this GPU supports only `+i.maxTextures),D+=1,e}function re(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function k(t,i){let a=r.get(t);if(t.isVideoTexture&&Ee(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)console.warn(`THREE.WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)console.warn(`THREE.WebGLRenderer: Texture marked for update but image is incomplete`);else{me(a,t,i);return}}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function ae(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?me(a,t,i):n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i)}function oe(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?me(a,t,i):n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function se(t,i){let a=r.get(t);t.version>0&&a.__version!==t.version?he(a,t,i):n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let ce={[Ne]:e.REPEAT,[Ye]:e.CLAMP_TO_EDGE,[He]:e.MIRRORED_REPEAT},le={[Pe]:e.NEAREST,[Se]:e.NEAREST_MIPMAP_NEAREST,[je]:e.NEAREST_MIPMAP_LINEAR,[ye]:e.LINEAR,[a]:e.LINEAR_MIPMAP_NEAREST,[ie]:e.LINEAR_MIPMAP_LINEAR},A={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function ue(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&console.warn(`THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,ce[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,ce[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,ce[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,le[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,le[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,A[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function de(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,C));let i=n.source,a=m.get(i);a===void 0&&(a={},m.set(i,a));let o=re(n);if(o!==t.__cacheKey){a[o]===void 0&&(a[o]={texture:e.createTexture(),usedTimes:0},s.memory.textures++,r=!0),a[o].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&E(n)),t.__cacheKey=o,t.__webglTexture=a[o].texture}return r}function fe(e,t,n){return Math.floor(Math.floor(e/n)/t)}function pe(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=fe(n.start,r.width,4),c=fe(t.start,r.width,4);n.start<=i+1&&a===c&&fe(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=e.getParameter(e.UNPACK_ROW_LENGTH),l=e.getParameter(e.UNPACK_SKIP_PIXELS),u=e.getParameter(e.UNPACK_SKIP_ROWS);e.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;e.pixelStorei(e.UNPACK_SKIP_PIXELS,u),e.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),e.pixelStorei(e.UNPACK_ROW_LENGTH,c),e.pixelStorei(e.UNPACK_SKIP_PIXELS,l),e.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function me(t,a,s){let c=e.TEXTURE_2D;(a.isDataArrayTexture||a.isCompressedArrayTexture)&&(c=e.TEXTURE_2D_ARRAY),a.isData3DTexture&&(c=e.TEXTURE_3D);let l=de(t,a),u=a.source;n.bindTexture(c,t.__webglTexture,e.TEXTURE0+s);let d=r.get(u);if(u.version!==d.__version||l===!0){n.activeTexture(e.TEXTURE0+s);let t=Ae.getPrimaries(Ae.workingColorSpace),r=a.colorSpace===``?null:Ae.getPrimaries(a.colorSpace),f=a.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,a.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,a.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,a.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,f);let m=_(a.image,!1,i.maxTextureSize);m=F(a,m);let h=o.convert(a.format,a.colorSpace),g=o.convert(a.type),b=x(a.internalFormat,h,g,a.colorSpace,a.isVideoTexture);ue(c,a);let C,w=a.mipmaps,T=a.isVideoTexture!==!0,E=d.__version===void 0||l===!0,te=u.dataReady,D=ee(a,m);if(a.isDepthTexture)b=S(a.format===p,a.type),E&&(T?n.texStorage2D(e.TEXTURE_2D,1,b,m.width,m.height):n.texImage2D(e.TEXTURE_2D,0,b,m.width,m.height,0,h,g,null));else if(a.isDataTexture){if(w.length>0){T&&E&&n.texStorage2D(e.TEXTURE_2D,D,b,w[0].width,w[0].height);for(let t=0,r=w.length;t<r;t++)C=w[t],T?te&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,h,g,C.data):n.texImage2D(e.TEXTURE_2D,t,b,C.width,C.height,0,h,g,C.data);a.generateMipmaps=!1}else T?(E&&n.texStorage2D(e.TEXTURE_2D,D,b,m.width,m.height),te&&pe(a,m,h,g)):n.texImage2D(e.TEXTURE_2D,0,b,m.width,m.height,0,h,g,m.data)}else if(a.isCompressedTexture){if(a.isCompressedArrayTexture){T&&E&&n.texStorage3D(e.TEXTURE_2D_ARRAY,D,b,w[0].width,w[0].height,m.depth);for(let t=0,r=w.length;t<r;t++)if(C=w[t],a.format!==1023){if(h!==null){if(T){if(te){if(a.layerUpdates.size>0){let r=Ie(C.width,C.height,a.format,a.type);for(let i of a.layerUpdates){let a=C.data.subarray(i*r/C.data.BYTES_PER_ELEMENT,(i+1)*r/C.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,i,C.width,C.height,1,h,a)}a.clearLayerUpdates()}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,C.width,C.height,m.depth,h,C.data)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,t,b,C.width,C.height,m.depth,0,C.data,0,0)}else console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else T?te&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,C.width,C.height,m.depth,h,g,C.data):n.texImage3D(e.TEXTURE_2D_ARRAY,t,b,C.width,C.height,m.depth,0,h,g,C.data)}else{T&&E&&n.texStorage2D(e.TEXTURE_2D,D,b,w[0].width,w[0].height);for(let t=0,r=w.length;t<r;t++)C=w[t],a.format===1023?T?te&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,h,g,C.data):n.texImage2D(e.TEXTURE_2D,t,b,C.width,C.height,0,h,g,C.data):h===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):T?te&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,h,C.data):n.compressedTexImage2D(e.TEXTURE_2D,t,b,C.width,C.height,0,C.data)}}else if(a.isDataArrayTexture){if(T){if(E&&n.texStorage3D(e.TEXTURE_2D_ARRAY,D,b,m.width,m.height,m.depth),te){if(a.layerUpdates.size>0){let t=Ie(m.width,m.height,a.format,a.type);for(let r of a.layerUpdates){let i=m.data.subarray(r*t/m.data.BYTES_PER_ELEMENT,(r+1)*t/m.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,r,m.width,m.height,1,h,g,i)}a.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,m.width,m.height,m.depth,h,g,m.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,b,m.width,m.height,m.depth,0,h,g,m.data)}else if(a.isData3DTexture)T?(E&&n.texStorage3D(e.TEXTURE_3D,D,b,m.width,m.height,m.depth),te&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,m.width,m.height,m.depth,h,g,m.data)):n.texImage3D(e.TEXTURE_3D,0,b,m.width,m.height,m.depth,0,h,g,m.data);else if(a.isFramebufferTexture){if(E){if(T)n.texStorage2D(e.TEXTURE_2D,D,b,m.width,m.height);else{let t=m.width,r=m.height;for(let i=0;i<D;i++)n.texImage2D(e.TEXTURE_2D,i,b,t,r,0,h,g,null),t>>=1,r>>=1}}}else if(w.length>0){if(T&&E){let t=De(w[0]);n.texStorage2D(e.TEXTURE_2D,D,b,t.width,t.height)}for(let t=0,r=w.length;t<r;t++)C=w[t],T?te&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,h,g,C):n.texImage2D(e.TEXTURE_2D,t,b,h,g,C);a.generateMipmaps=!1}else if(T){if(E){let t=De(m);n.texStorage2D(e.TEXTURE_2D,D,b,t.width,t.height)}te&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,h,g,m)}else n.texImage2D(e.TEXTURE_2D,0,b,h,g,m);v(a)&&y(c),d.__version=u.version,a.onUpdate&&a.onUpdate(a)}t.__version=a.version}function he(t,a,s){if(a.image.length!==6)return;let c=de(t,a),l=a.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+s);let u=r.get(l);if(l.version!==u.__version||c===!0){n.activeTexture(e.TEXTURE0+s);let t=Ae.getPrimaries(Ae.workingColorSpace),r=a.colorSpace===``?null:Ae.getPrimaries(a.colorSpace),d=a.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,a.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,a.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,a.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=a.isCompressedTexture||a.image[0].isCompressedTexture,p=a.image[0]&&a.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=_(a.image[e],!0,i.maxCubemapSize):m[e]=p?a.image[e].image:a.image[e],m[e]=F(a,m[e]);let h=m[0],g=o.convert(a.format,a.colorSpace),b=o.convert(a.type),S=x(a.internalFormat,g,b,a.colorSpace),C=a.isVideoTexture!==!0,w=u.__version===void 0||c===!0,T=l.dataReady,E=ee(a,h);ue(e.TEXTURE_CUBE_MAP,a);let te;if(f){C&&w&&n.texStorage2D(e.TEXTURE_CUBE_MAP,E,S,h.width,h.height);for(let t=0;t<6;t++){te=m[t].mipmaps;for(let r=0;r<te.length;r++){let i=te[r];a.format===1023?C?T&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,b,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,S,i.width,i.height,0,g,b,i.data):g===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):C?T&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,g,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,S,i.width,i.height,0,i.data)}}}else{if(te=a.mipmaps,C&&w){te.length>0&&E++;let t=De(m[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,E,S,t.width,t.height)}for(let t=0;t<6;t++)if(p){C?T&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,m[t].width,m[t].height,g,b,m[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,S,m[t].width,m[t].height,0,g,b,m[t].data);for(let r=0;r<te.length;r++){let i=te[r].image[t].image;C?T&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,g,b,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,S,i.width,i.height,0,g,b,i.data)}}else{C?T&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,g,b,m[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,S,g,b,m[t]);for(let r=0;r<te.length;r++){let i=te[r];C?T&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,g,b,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,S,g,b,i.image[t])}}}v(a)&&y(e.TEXTURE_CUBE_MAP),u.__version=l.version,a.onUpdate&&a.onUpdate(a)}t.__version=a.version}function ge(t,i,a,s,l,u){let d=o.convert(a.format,a.colorSpace),f=o.convert(a.type),p=x(a.internalFormat,d,f,a.colorSpace),m=r.get(i),h=r.get(a);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);l===e.TEXTURE_3D||l===e.TEXTURE_2D_ARRAY?n.texImage3D(l,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(l,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),P(i)?c.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,s,l,h.__webglTexture,0,Te(i)):(l===e.TEXTURE_2D||l>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,s,l,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function _e(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=S(n.stencilBuffer,a),s=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,l=Te(n);P(n)?c.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,l,o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,l,o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,s,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let a=t[i],s=o.convert(a.format,a.colorSpace),l=o.convert(a.type),u=x(a.internalFormat,s,l,a.colorSpace),d=Te(n);r&&P(n)===!1?e.renderbufferStorageMultisample(e.RENDERBUFFER,d,u,n.width,n.height):P(n)?c.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,d,u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function ve(t,i){if(i&&i.isWebGLCubeRenderTarget)throw Error(`Depth Texture with cube render targets is not supported`);if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`renderTarget.depthTexture must be an instance of THREE.DepthTexture`);let a=r.get(i.depthTexture);a.__renderTarget=i,(!a.__webglTexture||i.depthTexture.image.width!==i.width||i.depthTexture.image.height!==i.height)&&(i.depthTexture.image.width=i.width,i.depthTexture.image.height=i.height,i.depthTexture.needsUpdate=!0),k(i.depthTexture,0);let o=a.__webglTexture,s=Te(i);if(i.depthTexture.format===1026)P(i)?c.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,o,0,s):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,o,0);else if(i.depthTexture.format===1027)P(i)?c.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,o,0,s):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,o,0);else throw Error(`Unknown depthTexture format`)}function be(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)throw Error(`target.depthTexture not supported in Cube render targets`);let e=t.texture.mipmaps;e&&e.length>0?ve(i.__webglFramebuffer[0],t):ve(i.__webglFramebuffer,t)}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),_e(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else{let r=t.texture.mipmaps;if(r&&r.length>0?n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),_e(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function xe(t,n,i){let a=r.get(t);n!==void 0&&ge(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&be(t)}function j(t){let i=t.texture,a=r.get(t),c=r.get(i);t.addEventListener(`dispose`,w);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=e.createTexture()),c.__version=i.version,s.memory.textures++),u){a.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps&&i.mipmaps.length>0){a.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)a.__webglFramebuffer[t][n]=e.createFramebuffer()}else a.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps&&i.mipmaps.length>0){a.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)a.__webglFramebuffer[t]=e.createFramebuffer()}else a.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),s.memory.textures++)}if(t.samples>0&&P(t)===!1){a.__webglMultisampledFramebuffer=e.createFramebuffer(),a.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,a.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];a.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,a.__webglColorRenderbuffer[n]);let i=o.convert(r.format,r.colorSpace),s=o.convert(r.type),c=x(r.internalFormat,i,s,r.colorSpace,t.isXRRenderTarget===!0),u=Te(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,a.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(a.__webglDepthRenderbuffer=e.createRenderbuffer(),_e(a.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,c.__webglTexture),ue(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps&&i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)ge(a.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else ge(a.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);v(i)&&y(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(d){for(let i=0,o=l.length;i<o;i++){let o=l[i],s=r.get(o),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,s.__webglTexture),ue(c,o),ge(a.__webglFramebuffer,t,o,e.COLOR_ATTACHMENT0+i,c,0),v(o)&&y(c)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,c.__webglTexture),ue(r,i),i.mipmaps&&i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)ge(a.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else ge(a.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);v(i)&&y(r),n.unbindTexture()}t.depthBuffer&&be(t)}function M(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(v(a)){let t=b(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),y(t),n.unbindTexture()}}}let N=[],Ce=[];function we(t){if(t.samples>0){if(P(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,c=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,u=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer);let f=t.texture.mipmaps;f&&f.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),l===!0&&(N.length=0,Ce.length=0,N.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.resolveDepthBuffer===!1&&(N.push(c),Ce.push(c),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,Ce)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,N))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,u.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.resolveDepthBuffer===!1&&l){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function Te(e){return Math.min(i.maxSamples,e.samples)}function P(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function Ee(e){let t=s.render.frame;d.get(e)!==t&&(d.set(e,t),e.update())}function F(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(Ae.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&console.warn(`THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):console.error(`THREE.WebGLTextures: Unsupported texture color space:`,n)),t}function De(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(u.width=e.naturalWidth||e.width,u.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(u.width=e.displayWidth,u.height=e.displayHeight):(u.width=e.width,u.height=e.height),u}this.allocateTextureUnit=O,this.resetTextureUnits=ne,this.setTexture2D=k,this.setTexture2DArray=ae,this.setTexture3D=oe,this.setTextureCube=se,this.rebindTextures=xe,this.setupRenderTarget=j,this.updateRenderTargetMipmap=M,this.updateMultisampleRenderTarget=we,this.setupDepthRenderbuffer=be,this.setupFrameBufferTexture=ge,this.useMultisampledRTT=P}function Da(e,t){function n(n,r=``){let i,a=Ae.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var Oa=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,ka=`
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

}`,Aa=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new T(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new le({vertexShader:Oa,fragmentShader:ka,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new N(new ct(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ja=class extends ee{constructor(e,t){super();let n=this,r=null,i=1,a=null,s=`local-floor`,c=1,l=null,u=null,f=null,m=null,h=null,g=null,_=typeof XRWebGLBinding<`u`,v=new Aa,y={},b=t.getContextAttributes(),S=null,ee=null,C=[],w=[],E=new R,D=null,ne=new A;ne.viewport=new ve;let O=new A;O.viewport=new ve;let re=[ne,O],k=new Ue,ie=null,oe=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=C[e];return t===void 0&&(t=new o,C[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=C[e];return t===void 0&&(t=new o,C[e]=t),t.getGripSpace()},this.getHand=function(e){let t=C[e];return t===void 0&&(t=new o,C[e]=t),t.getHandSpace()};function se(e){let t=w.indexOf(e.inputSource);if(t===-1)return;let n=C[t];n!==void 0&&(n.update(e.inputSource,e.frame,l||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function ce(){r.removeEventListener(`select`,se),r.removeEventListener(`selectstart`,se),r.removeEventListener(`selectend`,se),r.removeEventListener(`squeeze`,se),r.removeEventListener(`squeezestart`,se),r.removeEventListener(`squeezeend`,se),r.removeEventListener(`end`,ce),r.removeEventListener(`inputsourceschange`,le);for(let e=0;e<C.length;e++){let t=w[e];t!==null&&(w[e]=null,C[e].disconnect(t))}ie=null,oe=null,v.reset();for(let e in y)delete y[e];e.setRenderTarget(S),h=null,m=null,f=null,r=null,ee=null,xe.stop(),n.isPresenting=!1,e.setPixelRatio(D),e.setSize(E.width,E.height,!1),n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){s=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(e){l=e},this.getBaseLayer=function(){return m===null?h:m},this.getBinding=function(){return f===null&&_&&(f=new XRWebGLBinding(r,t)),f},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(o){if(r=o,r!==null){if(S=e.getRenderTarget(),r.addEventListener(`select`,se),r.addEventListener(`selectstart`,se),r.addEventListener(`selectend`,se),r.addEventListener(`squeeze`,se),r.addEventListener(`squeezestart`,se),r.addEventListener(`squeezeend`,se),r.addEventListener(`end`,ce),r.addEventListener(`inputsourceschange`,le),b.xrCompatible!==!0&&await t.makeXRCompatible(),D=e.getPixelRatio(),e.getSize(E),_&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;b.depth&&(o=b.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=b.stencil?p:ue,a=b.stencil?he:pe);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};f=this.getBinding(),m=f.createProjectionLayer(s),r.updateRenderState({layers:[m]}),e.setPixelRatio(1),e.setSize(m.textureWidth,m.textureHeight,!1),ee=new ae(m.textureWidth,m.textureHeight,{format:te,type:pt,depthTexture:new d(m.textureWidth,m.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:b.stencil,colorSpace:e.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:m.ignoreDepthValues===!1,resolveStencilBuffer:m.ignoreDepthValues===!1})}else{let n={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:i};h=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:h}),e.setPixelRatio(1),e.setSize(h.framebufferWidth,h.framebufferHeight,!1),ee=new ae(h.framebufferWidth,h.framebufferHeight,{format:te,type:pt,colorSpace:e.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1})}ee.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await r.requestReferenceSpace(s),xe.setContext(r),xe.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function le(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=w.indexOf(n);r>=0&&(w[r]=null,C[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=w.indexOf(n);if(r===-1){for(let e=0;e<C.length;e++)if(e>=w.length){w.push(n),r=e;break}else if(w[e]===null){w[e]=n,r=e;break}if(r===-1)break}let i=C[r];i&&i.connect(n)}}let de=new x,fe=new x;function me(e,t,n){de.setFromMatrixPosition(t.matrixWorld),fe.setFromMatrixPosition(n.matrixWorld);let r=de.distanceTo(fe),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function ge(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;v.texture!==null&&(v.depthNear>0&&(t=v.depthNear),v.depthFar>0&&(n=v.depthFar)),k.near=O.near=ne.near=t,k.far=O.far=ne.far=n,(ie!==k.near||oe!==k.far)&&(r.updateRenderState({depthNear:k.near,depthFar:k.far}),ie=k.near,oe=k.far),k.layers.mask=e.layers.mask|6,ne.layers.mask=k.layers.mask&3,O.layers.mask=k.layers.mask&5;let i=e.parent,a=k.cameras;ge(k,i);for(let e=0;e<a.length;e++)ge(a[e],i);a.length===2?me(k,ne,O):k.projectionMatrix.copy(ne.projectionMatrix),_e(e,k,i)};function _e(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=ze*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return k},this.getFoveation=function(){if(m!==null||h!==null)return c},this.setFoveation=function(e){c=e,m!==null&&(m.fixedFoveation=e),h!==null&&h.fixedFoveation!==void 0&&(h.fixedFoveation=e)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(k)},this.getCameraTexture=function(e){return y[e]};let ye=null;function be(t,i){if(u=i.getViewerPose(l||a),g=i,u!==null){let t=u.views;h!==null&&(e.setRenderTargetFramebuffer(ee,h.framebuffer),e.setRenderTarget(ee));let i=!1;t.length!==k.cameras.length&&(k.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(h!==null)a=h.getViewport(r);else{let t=f.getViewSubImage(m,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(ee,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(ee))}let o=re[n];o===void 0&&(o=new A,o.layers.enable(n),o.viewport=new ve,re[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(k.matrix.copy(o.matrix),k.matrix.decompose(k.position,k.quaternion,k.scale)),i===!0&&k.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&_){f=n.getBinding();let e=f.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&v.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&_){e.state.unbindTexture(),f=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=y[n];e||(e=new T,y[n]=e);let t=f.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<C.length;e++){let t=w[e],n=C[e];t!==null&&n!==void 0&&n.update(t,i,l||a)}ye&&ye(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),g=null}let xe=new Pn;xe.setAnimationLoop(be),this.setAnimationLoop=function(e){ye=e},this.dispose=function(){}}},Ma=new L,Na=new I;function Pa(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,M(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isMeshBasicMaterial||t.isMeshLambertMaterial?a(e,t):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,Ma.copy(o),Ma.x*=-1,Ma.y*=-1,Ma.z*=-1,a.isCubeTexture&&a.isRenderTargetTexture===!1&&(Ma.y*=-1,Ma.z*=-1),e.envMapRotation.value.setFromMatrix4(Na.makeRotationFromEuler(Ma)),e.flipEnvMap.value=a.isCubeTexture&&a.isRenderTargetTexture===!1?-1:1,e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function Fa(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(m(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return console.error(`THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let t=0,n=r.length;t<n;t++){let n=Array.isArray(r[t])?r[t]:[r[t]];for(let r=0,i=n.length;r<i;r++){let i=n[r];if(p(i,t,r,a)===!0){let t=i.__offset,n=Array.isArray(i.value)?i.value:[i.value],r=0;for(let a=0;a<n.length;a++){let o=n[a],s=h(o);typeof o==`number`||typeof o==`boolean`?(i.__data[0]=o,e.bufferSubData(e.UNIFORM_BUFFER,t+r,i.__data)):o.isMatrix3?(i.__data[0]=o.elements[0],i.__data[1]=o.elements[1],i.__data[2]=o.elements[2],i.__data[3]=0,i.__data[4]=o.elements[3],i.__data[5]=o.elements[4],i.__data[6]=o.elements[5],i.__data[7]=0,i.__data[8]=o.elements[6],i.__data[9]=o.elements[7],i.__data[10]=o.elements[8],i.__data[11]=0):(o.toArray(i.__data,r),r+=s.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,t,i.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=h(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?console.warn(`THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.`):console.warn(`THREE.WebGLRenderer: Unsupported uniform value type.`,e),t}function g(t){let n=t.target;n.removeEventListener(`dispose`,g);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:_}}var Ia=class{constructor(e={}){let{canvas:t=We(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);f=n.getContextAttributes().alpha}else f=a;let p=new Uint32Array(4),m=new Int32Array(4),h=null,g=null,_=[],v=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let y=this,b=!1;this._outputColorSpace=dt;let S=0,ee=0,C=null,w=-1,T=null,E=new ve,te=new ve,D=null,ne=new Me(0),O=0,re=t.width,k=t.height,se=1,ce=null,le=null,A=new ve(0,0,re,k),ue=new ve(0,0,re,k),de=!1,fe=new oe,pe=!1,he=!1,_e=new I,ye=new x,be=new ve,xe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Se=!1;function j(){return C===null?se:1}let M=n;function N(e,n){return t.getContext(e,n)}try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r180`),t.addEventListener(`webglcontextlost`,Xe,!1),t.addEventListener(`webglcontextrestored`,Ze,!1),t.addEventListener(`webglcontextcreationerror`,Qe,!1),M===null){let t=`webgl2`;if(M=N(t,e),M===null)throw N(t)?Error(`Error creating WebGL context with your selected attributes.`):Error(`Error creating WebGL context.`)}}catch(e){throw console.error(`THREE.WebGLRenderer: `+e.message),e}let Ce,we,P,Ee,F,Oe,ke,je,Ne,Pe,Fe,Ie,L,Le,Re,ze,Be,Ve,He,Ue,Ge,Ke,qe,Je;function Ye(){Ce=new hr(M),Ce.init(),Ke=new Da(M,Ce),we=new Wn(M,Ce,e,Ke),P=new Ta(M,Ce),we.reversedDepthBuffer&&d&&P.buffers.depth.setReversed(!0),Ee=new vr(M),F=new la,Oe=new Ea(M,Ce,P,F,we,Ke,Ee),ke=new Kn(y),je=new mr(y),Ne=new Fn(M),qe=new Hn(M,Ne),Pe=new gr(M,Ne,Ee,qe),Fe=new br(M,Pe,Ne,Ee),He=new yr(M,we,Oe),ze=new Gn(F),Ie=new ca(y,ke,je,Ce,we,qe,ze),L=new Pa(y,F),Le=new pa,Re=new ba(Ce),Ve=new Vn(y,ke,je,P,Fe,f,s),Be=new Ca(y,Fe,we),Je=new Fa(M,Ee,we,P),Ue=new Un(M,Ce,Ee),Ge=new _r(M,Ce,Ee),Ee.programs=Ie.programs,y.capabilities=we,y.extensions=Ce,y.properties=F,y.renderLists=Le,y.shadowMap=Be,y.state=P,y.info=Ee}Ye();let R=new ja(y,M);this.xr=R,this.getContext=function(){return M},this.getContextAttributes=function(){return M.getContextAttributes()},this.forceContextLoss=function(){let e=Ce.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=Ce.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return se},this.setPixelRatio=function(e){e!==void 0&&(se=e,this.setSize(re,k,!1))},this.getSize=function(e){return e.set(re,k)},this.setSize=function(e,n,r=!0){R.isPresenting?console.warn(`THREE.WebGLRenderer: Can't change size while VR device is presenting.`):(re=e,k=n,t.width=Math.floor(e*se),t.height=Math.floor(n*se),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),this.setViewport(0,0,e,n))},this.getDrawingBufferSize=function(e){return e.set(re*se,k*se).floor()},this.setDrawingBufferSize=function(e,n,r){re=e,k=n,se=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.getCurrentViewport=function(e){return e.copy(E)},this.getViewport=function(e){return e.copy(A)},this.setViewport=function(e,t,n,r){e.isVector4?A.set(e.x,e.y,e.z,e.w):A.set(e,t,n,r),P.viewport(E.copy(A).multiplyScalar(se).round())},this.getScissor=function(e){return e.copy(ue)},this.setScissor=function(e,t,n,r){e.isVector4?ue.set(e.x,e.y,e.z,e.w):ue.set(e,t,n,r),P.scissor(te.copy(ue).multiplyScalar(se).round())},this.getScissorTest=function(){return de},this.setScissorTest=function(e){P.setScissorTest(de=e)},this.setOpaqueSort=function(e){ce=e},this.setTransparentSort=function(e){le=e},this.getClearColor=function(e){return e.copy(Ve.getClearColor())},this.setClearColor=function(){Ve.setClearColor(...arguments)},this.getClearAlpha=function(){return Ve.getClearAlpha()},this.setClearAlpha=function(){Ve.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(C!==null){let t=C.texture.format;e=t===1033||t===1031||t===1029}if(e){let e=C.texture.type,t=e===1009||e===1014||e===1012||e===1020||e===1017||e===1018,n=Ve.getClearColor(),r=Ve.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(p[0]=i,p[1]=a,p[2]=o,p[3]=r,M.clearBufferuiv(M.COLOR,0,p)):(m[0]=i,m[1]=a,m[2]=o,m[3]=r,M.clearBufferiv(M.COLOR,0,m))}else r|=M.COLOR_BUFFER_BIT}t&&(r|=M.DEPTH_BUFFER_BIT),n&&(r|=M.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),M.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener(`webglcontextlost`,Xe,!1),t.removeEventListener(`webglcontextrestored`,Ze,!1),t.removeEventListener(`webglcontextcreationerror`,Qe,!1),Ve.dispose(),Le.dispose(),Re.dispose(),F.dispose(),ke.dispose(),je.dispose(),Fe.dispose(),qe.dispose(),Je.dispose(),Ie.dispose(),R.dispose(),R.removeEventListener(`sessionstart`,ot),R.removeEventListener(`sessionend`,st),ct.stop()};function Xe(e){e.preventDefault(),console.log(`THREE.WebGLRenderer: Context Lost.`),b=!0}function Ze(){console.log(`THREE.WebGLRenderer: Context Restored.`),b=!1;let e=Ee.autoReset,t=Be.enabled,n=Be.autoUpdate,r=Be.needsUpdate,i=Be.type;Ye(),Ee.autoReset=e,Be.enabled=t,Be.autoUpdate=n,Be.needsUpdate=r,Be.type=i}function Qe(e){console.error(`THREE.WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function $e(e){let t=e.target;t.removeEventListener(`dispose`,$e),tt(t)}function tt(e){nt(e),F.remove(e)}function nt(e){let t=F.get(e).programs;t!==void 0&&(t.forEach(function(e){Ie.releaseProgram(e)}),e.isShaderMaterial&&Ie.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=xe);let o=i.isMesh&&i.matrixWorld.determinant()<0,s=vt(e,t,n,r,i);P.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=Pe.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;qe.setup(i,r,s,n,c);let h,g=Ue;if(c!==null&&(h=Ne.get(c),g=Ge,g.setIndex(h)),i.isMesh)r.wireframe===!0?(P.setLineWidth(r.wireframeLinewidth*j()),g.setMode(M.LINES)):g.setMode(M.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),P.setLineWidth(e*j()),i.isLineSegments?g.setMode(M.LINES):i.isLineLoop?g.setMode(M.LINE_LOOP):g.setMode(M.LINE_STRIP)}else i.isPoints?g.setMode(M.POINTS):i.isSprite&&g.setMode(M.TRIANGLES);if(i.isBatchedMesh){if(i._multiDrawInstances!==null)Te(`THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection.`),g.renderMultiDrawInstances(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount,i._multiDrawInstances);else if(Ce.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?Ne.get(c).bytesPerElement:1,o=F.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(M,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function rt(e,t,n){e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,gt(e,t,n),e.side=0,e.needsUpdate=!0,gt(e,t,n),e.side=2):gt(e,t,n)}this.compile=function(e,t,n=null){n===null&&(n=e),g=Re.get(n),g.init(t),v.push(g),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(g.pushLight(e),e.castShadow&&g.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(g.pushLight(e),e.castShadow&&g.pushShadow(e))}),g.setupLights();let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let t=e.material;if(t){if(Array.isArray(t))for(let i=0;i<t.length;i++){let a=t[i];rt(a,n,e),r.add(a)}else rt(t,n,e),r.add(t)}}),g=v.pop(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){r.forEach(function(e){F.get(e).currentProgram.isReady()&&r.delete(e)}),r.size===0?t(e):setTimeout(n,10)}Ce.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let it=null;function at(e){it&&it(e)}function ot(){ct.stop()}function st(){ct.start()}let ct=new Pn;ct.setAnimationLoop(at),typeof self<`u`&&ct.setContext(self),this.setAnimationLoop=function(e){it=e,R.setAnimationLoop(e),e===null?ct.stop():ct.start()},R.addEventListener(`sessionstart`,ot),R.addEventListener(`sessionend`,st),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){console.error(`THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(b===!0)return;if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),R.enabled===!0&&R.isPresenting===!0&&(R.cameraAutoUpdate===!0&&R.updateCamera(t),t=R.getCamera()),e.isScene===!0&&e.onBeforeRender(y,e,t,C),g=Re.get(e,v.length),g.init(t),v.push(g),_e.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),fe.setFromProjectionMatrix(_e,ge,t.reversedDepth),he=this.localClippingEnabled,pe=ze.init(this.clippingPlanes,he),h=Le.get(e,_.length),h.init(),_.push(h),R.enabled===!0&&R.isPresenting===!0){let e=y.xr.getDepthSensingMesh();e!==null&&lt(e,t,-1/0,y.sortObjects)}lt(e,t,0,y.sortObjects),h.finish(),y.sortObjects===!0&&h.sort(ce,le),Se=R.enabled===!1||R.isPresenting===!1||R.hasDepthSensing()===!1,Se&&Ve.addToRenderList(h,e),this.info.render.frame++,pe===!0&&ze.beginShadows();let n=g.state.shadowsArray;Be.render(n,e,t),pe===!0&&ze.endShadows(),this.info.autoReset===!0&&this.info.reset();let r=h.opaque,i=h.transmissive;if(g.setupLights(),t.isArrayCamera){let n=t.cameras;if(i.length>0)for(let t=0,a=n.length;t<a;t++){let a=n[t];ft(r,i,e,a)}Se&&Ve.render(e);for(let t=0,r=n.length;t<r;t++){let r=n[t];ut(h,e,r,r.viewport)}}else i.length>0&&ft(r,i,e,t),Se&&Ve.render(e),ut(h,e,t);C!==null&&ee===0&&(Oe.updateMultisampleRenderTarget(C),Oe.updateRenderTargetMipmap(C)),e.isScene===!0&&e.onAfterRender(y,e,t),qe.resetDefaultState(),w=-1,T=null,v.pop(),v.length>0?(g=v[v.length-1],pe===!0&&ze.setGlobalState(y.clippingPlanes,g.state.camera)):g=null,_.pop(),h=_.length>0?_[_.length-1]:null};function lt(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)g.pushLight(e),e.castShadow&&g.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||fe.intersectsSprite(e)){r&&be.setFromMatrixPosition(e.matrixWorld).applyMatrix4(_e);let t=Fe.update(e),i=e.material;i.visible&&h.push(e,t,i,n,be.z,null)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||fe.intersectsObject(e))){let t=Fe.update(e),i=e.material;if(r&&(e.boundingSphere===void 0?(t.boundingSphere===null&&t.computeBoundingSphere(),be.copy(t.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),be.copy(e.boundingSphere.center)),be.applyMatrix4(e.matrixWorld).applyMatrix4(_e)),Array.isArray(i)){let r=t.groups;for(let a=0,o=r.length;a<o;a++){let o=r[a],s=i[o.materialIndex];s&&s.visible&&h.push(e,t,s,n,be.z,o)}}else i.visible&&h.push(e,t,i,n,be.z,null)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)lt(i[e],t,n,r)}function ut(e,t,n,r){let i=e.opaque,a=e.transmissive,o=e.transparent;g.setupLightsView(n),pe===!0&&ze.setGlobalState(y.clippingPlanes,n),r&&P.viewport(E.copy(r)),i.length>0&&mt(i,t,n),a.length>0&&mt(a,t,n),o.length>0&&mt(o,t,n),P.buffers.depth.setTest(!0),P.buffers.depth.setMask(!0),P.buffers.color.setMask(!0),P.setPolygonOffset(!1)}function ft(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;g.state.transmissionRenderTarget[r.id]===void 0&&(g.state.transmissionRenderTarget[r.id]=new ae(1,1,{generateMipmaps:!0,type:Ce.has(`EXT_color_buffer_half_float`)||Ce.has(`EXT_color_buffer_float`)?me:pt,minFilter:ie,samples:4,stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ae.workingColorSpace}));let a=g.state.transmissionRenderTarget[r.id],o=r.viewport||E;a.setSize(o.z*y.transmissionResolutionScale,o.w*y.transmissionResolutionScale);let s=y.getRenderTarget(),c=y.getActiveCubeFace(),l=y.getActiveMipmapLevel();y.setRenderTarget(a),y.getClearColor(ne),O=y.getClearAlpha(),O<1&&y.setClearColor(16777215,.5),y.clear(),Se&&Ve.render(n);let u=y.toneMapping;y.toneMapping=0;let d=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),g.setupLightsView(r),pe===!0&&ze.setGlobalState(y.clippingPlanes,r),mt(e,n,r),Oe.updateMultisampleRenderTarget(a),Oe.updateRenderTargetMipmap(a),Ce.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let a=t[i],o=a.object,s=a.geometry,c=a.material,l=a.group;if(c.side===2&&o.layers.test(r.layers)){let t=c.side;c.side=1,c.needsUpdate=!0,ht(o,n,r,s,c,l),c.side=t,c.needsUpdate=!0,e=!0}}e===!0&&(Oe.updateMultisampleRenderTarget(a),Oe.updateRenderTargetMipmap(a))}y.setRenderTarget(s,c,l),y.setClearColor(ne,O),d!==void 0&&(r.viewport=d),y.toneMapping=u}function mt(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],o=a.object,s=a.geometry,c=a.group,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&ht(o,t,n,s,l,c)}}function ht(e,t,n,r,i,a){e.onBeforeRender(y,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(y,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,y.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,y.renderBufferDirect(n,t,r,i,e,a),i.side=2):y.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(y,t,n,r,i,a)}function gt(e,t,n){t.isScene!==!0&&(t=xe);let r=F.get(e),i=g.state.lights,a=g.state.shadowsArray,o=i.state.version,s=Ie.getParameters(e,i.state,a,t,n),c=Ie.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial?t.environment:null,r.fog=t.fog,r.envMap=(e.isMeshStandardMaterial?je:ke).get(e.envMap||r.environment),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,$e),l=new Map,r.programs=l);let u=l.get(c);if(u!==void 0){if(r.currentProgram===u&&r.lightsStateVersion===o)return _t(e,s),u}else s.uniforms=Ie.getUniforms(e),e.onBeforeCompile(s,y),u=Ie.acquireProgram(s,c),l.set(c,u),r.uniforms=s.uniforms;let d=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(d.clippingPlanes=ze.uniform),_t(e,s),r.needsLights=bt(e),r.lightsStateVersion=o,r.needsLights&&(d.ambientLightColor.value=i.state.ambient,d.lightProbe.value=i.state.probe,d.directionalLights.value=i.state.directional,d.directionalLightShadows.value=i.state.directionalShadow,d.spotLights.value=i.state.spot,d.spotLightShadows.value=i.state.spotShadow,d.rectAreaLights.value=i.state.rectArea,d.ltc_1.value=i.state.rectAreaLTC1,d.ltc_2.value=i.state.rectAreaLTC2,d.pointLights.value=i.state.point,d.pointLightShadows.value=i.state.pointShadow,d.hemisphereLights.value=i.state.hemi,d.directionalShadowMap.value=i.state.directionalShadowMap,d.directionalShadowMatrix.value=i.state.directionalShadowMatrix,d.spotShadowMap.value=i.state.spotShadowMap,d.spotLightMatrix.value=i.state.spotLightMatrix,d.spotLightMap.value=i.state.spotLightMap,d.pointShadowMap.value=i.state.pointShadowMap,d.pointShadowMatrix.value=i.state.pointShadowMatrix),r.currentProgram=u,r.uniformsList=null,u}function z(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=Di.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function _t(e,t){let n=F.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function vt(e,t,n,r,i){t.isScene!==!0&&(t=xe),Oe.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial?t.environment:null,s=C===null?y.outputColorSpace:C.isXRRenderTarget===!0?C.texture.colorSpace:De,c=(r.isMeshStandardMaterial?je:ke).get(r.envMap||o),l=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,u=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),d=!!n.morphAttributes.position,f=!!n.morphAttributes.normal,p=!!n.morphAttributes.color,m=0;r.toneMapped&&(C===null||C.isXRRenderTarget===!0)&&(m=y.toneMapping);let h=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=h===void 0?0:h.length,v=F.get(r),b=g.state.lights;if(pe===!0&&(he===!0||e!==T)){let t=e===T&&r.id===w;ze.setState(r,e,t)}let x=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==b.state.version?x=!0:v.outputColorSpace===s?i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i.colorTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i.colorTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?x=!0:v.envMap===c?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==ze.numPlanes||v.numIntersection!==ze.numIntersection)?x=!0:v.vertexAlphas===l&&v.vertexTangents===u&&v.morphTargets===d&&v.morphNormals===f&&v.morphColors===p&&v.toneMapping===m?v.morphTargetsCount!==_&&(x=!0):x=!0:x=!0:x=!0:(x=!0,v.__version=r.version);let S=v.currentProgram;x===!0&&(S=gt(r,t,i));let ee=!1,E=!1,te=!1,D=S.getUniforms(),ne=v.uniforms;if(P.useProgram(S.program)&&(ee=!0,E=!0,te=!0),r.id!==w&&(w=r.id,E=!0),ee||T!==e){P.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),D.setValue(M,`projectionMatrix`,e.projectionMatrix),D.setValue(M,`viewMatrix`,e.matrixWorldInverse);let t=D.map.cameraPosition;t!==void 0&&t.setValue(M,ye.setFromMatrixPosition(e.matrixWorld)),we.logarithmicDepthBuffer&&D.setValue(M,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&D.setValue(M,`isOrthographic`,e.isOrthographicCamera===!0),T!==e&&(T=e,E=!0,te=!0)}if(i.isSkinnedMesh){D.setOptional(M,i,`bindMatrix`),D.setOptional(M,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),D.setValue(M,`boneTexture`,e.boneTexture,Oe))}i.isBatchedMesh&&(D.setOptional(M,i,`batchingTexture`),D.setValue(M,`batchingTexture`,i._matricesTexture,Oe),D.setOptional(M,i,`batchingIdTexture`),D.setValue(M,`batchingIdTexture`,i._indirectTexture,Oe),D.setOptional(M,i,`batchingColorTexture`),i._colorsTexture!==null&&D.setValue(M,`batchingColorTexture`,i._colorsTexture,Oe));let O=n.morphAttributes;if((O.position!==void 0||O.normal!==void 0||O.color!==void 0)&&He.update(i,n,S),(E||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,D.setValue(M,`receiveShadow`,i.receiveShadow)),r.isMeshGouraudMaterial&&r.envMap!==null&&(ne.envMap.value=c,ne.flipEnvMap.value=c.isCubeTexture&&c.isRenderTargetTexture===!1?-1:1),r.isMeshStandardMaterial&&r.envMap===null&&t.environment!==null&&(ne.envMapIntensity.value=t.environmentIntensity),E&&(D.setValue(M,`toneMappingExposure`,y.toneMappingExposure),v.needsLights&&yt(ne,te),a&&r.fog===!0&&L.refreshFogUniforms(ne,a),L.refreshMaterialUniforms(ne,r,se,k,g.state.transmissionRenderTarget[e.id]),Di.upload(M,z(v),ne,Oe)),r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(Di.upload(M,z(v),ne,Oe),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&D.setValue(M,`center`,i.center),D.setValue(M,`modelViewMatrix`,i.modelViewMatrix),D.setValue(M,`normalMatrix`,i.normalMatrix),D.setValue(M,`modelMatrix`,i.matrixWorld),r.isShaderMaterial||r.isRawShaderMaterial){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];Je.update(n,S),Je.bind(n,S)}}return S}function yt(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function bt(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return S},this.getActiveMipmapLevel=function(){return ee},this.getRenderTarget=function(){return C},this.setRenderTargetTextures=function(e,t,n){let r=F.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),F.get(e.texture).__webglTexture=t,F.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=F.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0};let xt=M.createFramebuffer();this.setRenderTarget=function(e,t=0,n=0){C=e,S=t,ee=n;let r=!0,i=null,a=!1,o=!1;if(e){let s=F.get(e);if(s.__useDefaultFramebuffer!==void 0)P.bindFramebuffer(M.FRAMEBUFFER,null),r=!1;else if(s.__webglFramebuffer===void 0)Oe.setupRenderTarget(e);else if(s.__hasExternalTextures)Oe.rebindTextures(e,F.get(e.texture).__webglTexture,F.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(s.__boundDepthTexture!==t){if(t!==null&&F.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.`);Oe.setupDepthRenderbuffer(e)}}let c=e.texture;(c.isData3DTexture||c.isDataArrayTexture||c.isCompressedArrayTexture)&&(o=!0);let l=F.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(i=Array.isArray(l[t])?l[t][n]:l[t],a=!0):i=e.samples>0&&Oe.useMultisampledRTT(e)===!1?F.get(e).__webglMultisampledFramebuffer:Array.isArray(l)?l[n]:l,E.copy(e.viewport),te.copy(e.scissor),D=e.scissorTest}else E.copy(A).multiplyScalar(se).floor(),te.copy(ue).multiplyScalar(se).floor(),D=de;if(n!==0&&(i=xt),P.bindFramebuffer(M.FRAMEBUFFER,i)&&r&&P.drawBuffers(e,i),P.viewport(E),P.scissor(te),P.setScissorTest(D),a){let r=F.get(e.texture);M.framebufferTexture2D(M.FRAMEBUFFER,M.COLOR_ATTACHMENT0,M.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(o){let r=t;for(let t=0;t<e.textures.length;t++){let i=F.get(e.textures[t]);M.framebufferTextureLayer(M.FRAMEBUFFER,M.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=F.get(e.texture);M.framebufferTexture2D(M.FRAMEBUFFER,M.COLOR_ATTACHMENT0,M.TEXTURE_2D,t.__webglTexture,n)}w=-1},this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=F.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){P.bindFramebuffer(M.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;if(!we.textureFormatReadable(c)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(!we.textureTypeReadable(l)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&(e.textures.length>1&&M.readBuffer(M.COLOR_ATTACHMENT0+s),M.readPixels(t,n,r,i,Ke.convert(c),Ke.convert(l),a))}finally{let e=C===null?null:F.get(C).__webglFramebuffer;P.bindFramebuffer(M.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=F.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){P.bindFramebuffer(M.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;if(!we.textureFormatReadable(l))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(!we.textureTypeReadable(u))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let d=M.createBuffer();M.bindBuffer(M.PIXEL_PACK_BUFFER,d),M.bufferData(M.PIXEL_PACK_BUFFER,a.byteLength,M.STREAM_READ),e.textures.length>1&&M.readBuffer(M.COLOR_ATTACHMENT0+s),M.readPixels(t,n,r,i,Ke.convert(l),Ke.convert(u),0);let f=C===null?null:F.get(C).__webglFramebuffer;P.bindFramebuffer(M.FRAMEBUFFER,f);let p=M.fenceSync(M.SYNC_GPU_COMMANDS_COMPLETE,0);return M.flush(),await et(M,p,4),M.bindBuffer(M.PIXEL_PACK_BUFFER,d),M.getBufferSubData(M.PIXEL_PACK_BUFFER,0,a),M.deleteBuffer(d),M.deleteSync(p),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;Oe.setTexture2D(e,0),M.copyTexSubImage2D(M.TEXTURE_2D,n,0,0,o,s,i,a),P.unbindTexture()};let B=M.createFramebuffer(),St=M.createFramebuffer();this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=null){a===null&&(i===0?a=0:(Te(`WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels.`),a=i,i=0));let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=Ke.convert(t.format),_=Ke.convert(t.type),v;t.isData3DTexture?(Oe.setTexture3D(t,0),v=M.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(Oe.setTexture2DArray(t,0),v=M.TEXTURE_2D_ARRAY):(Oe.setTexture2D(t,0),v=M.TEXTURE_2D),M.pixelStorei(M.UNPACK_FLIP_Y_WEBGL,t.flipY),M.pixelStorei(M.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),M.pixelStorei(M.UNPACK_ALIGNMENT,t.unpackAlignment);let y=M.getParameter(M.UNPACK_ROW_LENGTH),b=M.getParameter(M.UNPACK_IMAGE_HEIGHT),x=M.getParameter(M.UNPACK_SKIP_PIXELS),S=M.getParameter(M.UNPACK_SKIP_ROWS),ee=M.getParameter(M.UNPACK_SKIP_IMAGES);M.pixelStorei(M.UNPACK_ROW_LENGTH,h.width),M.pixelStorei(M.UNPACK_IMAGE_HEIGHT,h.height),M.pixelStorei(M.UNPACK_SKIP_PIXELS,l),M.pixelStorei(M.UNPACK_SKIP_ROWS,u),M.pixelStorei(M.UNPACK_SKIP_IMAGES,d);let C=e.isDataArrayTexture||e.isData3DTexture,w=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=F.get(e),r=F.get(t),h=F.get(n.__renderTarget),g=F.get(r.__renderTarget);P.bindFramebuffer(M.READ_FRAMEBUFFER,h.__webglFramebuffer),P.bindFramebuffer(M.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)C&&(M.framebufferTextureLayer(M.READ_FRAMEBUFFER,M.COLOR_ATTACHMENT0,F.get(e).__webglTexture,i,d+n),M.framebufferTextureLayer(M.DRAW_FRAMEBUFFER,M.COLOR_ATTACHMENT0,F.get(t).__webglTexture,a,m+n)),M.blitFramebuffer(l,u,o,s,f,p,o,s,M.DEPTH_BUFFER_BIT,M.NEAREST);P.bindFramebuffer(M.READ_FRAMEBUFFER,null),P.bindFramebuffer(M.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||F.has(e)){let n=F.get(e),r=F.get(t);P.bindFramebuffer(M.READ_FRAMEBUFFER,B),P.bindFramebuffer(M.DRAW_FRAMEBUFFER,St);for(let e=0;e<c;e++)C?M.framebufferTextureLayer(M.READ_FRAMEBUFFER,M.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):M.framebufferTexture2D(M.READ_FRAMEBUFFER,M.COLOR_ATTACHMENT0,M.TEXTURE_2D,n.__webglTexture,i),w?M.framebufferTextureLayer(M.DRAW_FRAMEBUFFER,M.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):M.framebufferTexture2D(M.DRAW_FRAMEBUFFER,M.COLOR_ATTACHMENT0,M.TEXTURE_2D,r.__webglTexture,a),i===0?w?M.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):M.copyTexSubImage2D(v,a,f,p,l,u,o,s):M.blitFramebuffer(l,u,o,s,f,p,o,s,M.COLOR_BUFFER_BIT,M.NEAREST);P.bindFramebuffer(M.READ_FRAMEBUFFER,null),P.bindFramebuffer(M.DRAW_FRAMEBUFFER,null)}else w?e.isDataTexture||e.isData3DTexture?M.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?M.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):M.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?M.texSubImage2D(M.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?M.compressedTexSubImage2D(M.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):M.texSubImage2D(M.TEXTURE_2D,a,f,p,o,s,g,_,h);M.pixelStorei(M.UNPACK_ROW_LENGTH,y),M.pixelStorei(M.UNPACK_IMAGE_HEIGHT,b),M.pixelStorei(M.UNPACK_SKIP_PIXELS,x),M.pixelStorei(M.UNPACK_SKIP_ROWS,S),M.pixelStorei(M.UNPACK_SKIP_IMAGES,ee),a===0&&t.generateMipmaps&&M.generateMipmap(v),P.unbindTexture()},this.initRenderTarget=function(e){F.get(e).__webglFramebuffer===void 0&&Oe.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?Oe.setTextureCube(e,0):e.isData3DTexture?Oe.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?Oe.setTexture2DArray(e,0):Oe.setTexture2D(e,0),P.unbindTexture()},this.resetState=function(){S=0,ee=0,C=null,P.reset(),qe.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return ge}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Ae._getDrawingBufferColorSpace(e),t.unpackColorSpace=Ae._getUnpackColorSpace()}},La=()=>new j(1,1,1);function Ra(e,t,n,r,i,a,o,s,c,l){let u=[],d=[],f=n.clone(),p=r.clone().normalize(),m=o/s,h=new x(0,1,0);for(let n=0;n<s;n++){let r=i+(a-i)*n/s,o=i+(a-i)*(n+1)/s,g=new lt(o,r,m*1.1,10,1,!0);e.add(g,t(n),new I().compose(f.clone().addScaledVector(p,m/2),new O().setFromUnitVectors(h,p),new x(1,1,1))),g.dispose(),e.add(K(8,6),t(n),{pos:f.toArray(),scale:r}),f=f.clone().addScaledVector(p,m),p=p.clone().applyAxisAngle(l,c/s).normalize(),u.push(f.clone()),d.push(p.clone())}return e.add(K(8,6),t(s-1),{pos:f.toArray(),scale:a}),{at:u,dirs:d}}function za(e,t,n,r=`#fffbe8`){let i=new Je({color:r,transparent:!0,depthWrite:!1,blending:2}),a=Lo(1,.22),o=t.map((t,n)=>{let r=new N(a,i);return r.position.set(...t),r.castShadow=!1,r.userData.phase=n*2.39,e.group.add(r),r});return e.materials.push(i),e=>{for(let t of o){let r=Math.max(0,Math.sin(e*1.7+t.userData.phase))**6;t.scale.setScalar(n*(.05+r)),t.rotation.z=e*.6+t.userData.phase,t.visible=r>.02}}}function Ba(){let e=new z,t=`#f4c430`,n=[0,-.13,-.01],r=[.27,.22,.285];Ns(e,n,r,0,1,t),Ns(e,n,r,1,Math.PI/2,`#e2ad1e`);for(let i of[-.09,0,.09]){let a=Math.sqrt(1-(i/r[0])**2),o=new k(1,i?.05:.08,5,24,Math.PI).rotateY(Math.PI/2);e.add(o,t,{pos:[i,n[1],n[2]],scale:[.2,r[1]*a+.004,r[2]*a+.004]}),o.dispose()}let i=ss(bs(.262,.312,.016,44,(e,t,n)=>-.018*n),e=>{let t=Math.hypot(e.x,e.z),n=Ge.clamp((t-.262)/.05,0,1),r=1+.075*Math.max(0,e.z/t)**2*n/t;return e.set(e.x*r,e.y,e.z*r)});e.add(i,t,{pos:[0,n[1]+.004,n[2]],scale:[1,1,r[2]/r[0]]}),i.dispose();let{p:a,n:o}=Jo(r[0],r[1],r[2],.42,.42,n[1]);a.z+=n[2];let s=new O().setFromUnitVectors(new x(0,0,1),o);e.add(La(),`#2f9a4c`,new I().compose(a.clone().addScaledVector(o,.002),s,new x(.05,.05,.006)));for(let[t,n]of[[.034,.011],[.011,.034]])e.add(La(),`#f8f6f0`,new I().compose(a.clone().addScaledVector(o,.005),s,new x(t,n,.004)));return Y(e,{top:.1,sit:{kind:`snug`,rim:[-.13,.27,.285]}},_t())}function Va(){let e=new z,t=[`#7a4e2a`,`#8a5a32`,`#9a6a3c`,`#aa7a48`,`#ba8a56`,`#c89c66`],n=new k(1,.06,5,20,Math.PI*.56).rotateZ(Math.PI*.22);e.add(n,`#8a2a26`,{pos:[0,-.22,.03],rot:[.55,0,0],scale:[.268,.205,.2]}),n.dispose();let r=new x(-1,0,0);for(let n of[-1,1]){let i=new x(n*.1,-.06,.13),a=Ra(e,e=>t[e],i,new x(n*.6,1,.15),.036,.018,.34,6,.9,r);Ra(e,e=>t[e+2],a.at[1],new x(n*.3,.65,.8),.022,.013,.12,3,-.5,r),Ra(e,e=>t[e+3],a.at[3],new x(n*.65,.8,.55),.019,.011,.1,3,-.4,r),e.add(K(10,5),t[0],{pos:[i.x,i.y-.004,i.z],scale:[.055,.02,.045]});let o=[i.x+n*.02,i.y+.012,i.z+.03];e.add(K(8,6),`#d42a2e`,{pos:o,scale:[.016,.016,.012]});for(let t of[-1,1])e.add(K(8,6),`#e03a3c`,{pos:[o[0]+t*.026,o[1]+.006,o[2]],rot:[0,0,t*.4],scale:[.026,.016,.009]});e.add(K(10,8),`#f0c040`,{pos:[o[0],o[1]-.03,o[2]+.004],scale:.016}),e.add(J(.3,4,10),`#c8962a`,{pos:[o[0],o[1]-.042,o[2]+.004],rot:[Math.PI/2,0,0],scale:[.016,.016,.02]})}return Y(e,{top:.32,sit:{kind:`perch`,rim:[-.06,.16],among:!0}})}function Ha(){let e=new z,t=`#f6f2ea`,n=[0,-.13,-.01],r=[.27,.215,.285];Ns(e,n,r,0,.55,t),Ns(e,n,r,.55,Math.PI/2,`#d8342c`),e.add(J(.18,6,36),t,{pos:[0,n[1]+.006,n[2]],rot:[Math.PI/2,0,0],scale:[r[0]+.004,r[2]+.004,.14]});for(let n of[-1,1]){let r=new x(n*.33,-.07,-.02);e.add(q(10),t,{pos:[n*.285,r.y,r.z],rot:[0,0,Math.PI/2],scale:[.018,.05,.018]}),e.add(J(.18,5,22),t,{pos:[r.x,r.y,r.z],rot:[Math.PI/2,0,0],scale:[.058,.058,.08]}),e.add(q(18),`#e8b83a`,{pos:r.toArray(),scale:[.05,.12,.05]}),e.add(q(18),`#2a6a3c`,{pos:[r.x,r.y+.008,r.z],scale:[.0505,.05,.0505]}),e.add(q(18),`#d8dce2`,{pos:[r.x,r.y+.063,r.z],scale:[.044,.008,.044]}),e.add(q(18),`#d8dce2`,{pos:[r.x,r.y-.063,r.z],scale:[.044,.008,.044]});let i=new Ee([[r.x,r.y+.05,r.z],[r.x+n*.01,r.y+.12,r.z+.03],[r.x+n*.03,r.y+.06,r.z+.1],[n*.3,-.2,.15],[n*.25,-.27,.2]].map(([e,t,n])=>new x(e,t,n)));for(let n=0;n<12;n++){let r=new g(new Ee([0,.5,1].map(e=>i.getPoint(Math.min(1,(n+e*1.05)/12)))),4,.009,6,!1);e.add(r,n%2?`#e0383a`:t),r.dispose()}}return Y(e,{top:.09,sit:{kind:`snug`,rim:[-.13,.27,.285]}},_t())}function Ua(){let e=new z,t=`#7d93a8`,n=[0,-.14,-.02],r=[.28,.23,.3];Ns(e,n,r,0,1.25,t),Ns(e,n,r,1.25,Math.PI/2,`#e6edf2`),e.add(K(18,10),t,{pos:[0,-.04,.13],scale:[.2,.13,.18]}),e.add(J(.22,6,40),`#e87a8a`,{pos:[0,n[1]+.004,n[2]],rot:[Math.PI/2,0,0],scale:[r[0]+.004,r[2]+.004,.1]});for(let t=-7;t<=7;t++){let i=t*.21;e.add(new xe(1,1,6),`#fbfaf6`,{pos:[Math.sin(i)*(r[0]-.004),n[1]-.012,n[2]+Math.cos(i)*(r[2]-.004)],rot:[Math.PI,0,0],scale:[.016,.03,.016]})}for(let t of[-1,1]){let{p:i,n:a}=Jo(r[0],r[1],r[2],t*1.05,.34,n[1]);i.z+=n[2],e.add(K(12,9),`#1c1e24`,{pos:i.addScaledVector(a,.004).toArray(),scale:.03}),e.add(K(8,6),`#ffffff`,{pos:i.clone().addScaledVector(a,.024).add(new x(0,.01,.006)).toArray(),scale:.008});for(let i=0;i<3;i++){let a=Jo(r[0],r[1],r[2],t*(1.55+i*.17),.22,n[1]);a.p.z+=n[2];let o=new O().setFromUnitVectors(new x(0,0,1),a.n);e.add(La(),`#56687a`,new I().compose(a.p.addScaledVector(a.n,.002),o,new x(.008,.07,.006)))}}let i=new st;i.moveTo(-.07,0),i.quadraticCurveTo(0,.06,.07,.16),i.quadraticCurveTo(.06,.06,.1,0),i.closePath();let a=new re(i,{depth:.03,bevelEnabled:!0,bevelSize:.012,bevelThickness:.012,bevelSegments:2,curveSegments:8});a.translate(0,0,-.015),e.add(a,t,{pos:[0,n[1]+r[1]-.02,-.02],rot:[0,Math.PI/2,0]});for(let[n,r]of[[.55,.15],[2.3,.1]])e.add(K(10,6),t,{pos:[0,-.07+Math.cos(n)*r*.5,-.31-Math.sin(n)*r*.5],rot:[-n,0,0],scale:[.016,r*.55,.04]});return e.add(K(10,6),t,{pos:[0,-.07,-.3],scale:[.03,.035,.035]}),a.dispose(),Y(e,{top:.22,sit:{kind:`snug`,rim:[-.14,.28,.3]}})}function Wa(){let e=new z,t=`#fff6ee`;e.add(q(36),`#e8c050`,{pos:[0,-.036,0],scale:[.175,.012,.175]}),e.add(q(36),`#f4a2bc`,{pos:[0,.02,0],scale:[.14,.1,.14]}),e.add(q(36),`#e88aa6`,{pos:[0,.02,0],scale:[.1405,.012,.1405]}),e.add(q(36),t,{pos:[0,.072,0],scale:[.138,.008,.138]});for(let n=0;n<16;n++){let r=n/16*Math.PI*2;e.add(K(8,6),t,{pos:[Math.sin(r)*.128,.078,Math.cos(r)*.128],scale:[.022,.018,.022]});let i=.014+n*7%5*.006;e.add(K(8,6),t,{pos:[Math.sin(r+.2)*.141,.068-i,Math.cos(r+.2)*.141],scale:[.013,i,.008],rot:[0,r+.2,0]})}for(let t=0;t<26;t++){let n=t*2.4,r=.03+t*37%9*.009;e.add(La(),[`#f04a4a`,`#4aa8f0`,`#f6d23a`,`#5ac85a`,`#b86af0`][t%5],{pos:[Math.sin(n)*r,.078,Math.cos(n)*r],rot:[0,n*1.7,0],scale:[.012,.004,.004]})}e.add(K(12,9),`#c81830`,{pos:[0,.098,0],scale:.022}),e.add(q(5),`#4a7a2a`,{pos:[.006,.124,0],rot:[0,0,-.4],scale:[.003,.03,.003]});let n=[0,1,2].map(e=>{let t=e/3*Math.PI*2+.5;return[Math.sin(t)*.075,.076,Math.cos(t)*.075]});for(let[t,r,i]of n){for(let n=0;n<4;n++)e.add(q(10),n%2?`#fbf8f2`:`#5aa8e8`,{pos:[t,r+.009+n*.016,i],scale:[.011,.017,.011]});e.add(q(4),`#2a2220`,{pos:[t,r+.076,i],scale:[.003,.014,.003]})}let r=Y(e,{top:.22,sit:{kind:`brim`,rim:[-.036,.15]}}),i=new Je({color:`#ffc04a`}),a=new Je({color:`#ff9a40`,transparent:!0,opacity:.22,depthWrite:!1,blending:2}),o=new s(1,8,6),c=n.map(([e,t,n])=>{let s=new N(o,i);s.position.set(e,t+.098,n),s.scale.set(.011,.022,.011);let c=new N(o,a);return c.position.copy(s.position),c.scale.setScalar(.03),s.castShadow=c.castShadow=!1,r.group.add(s,c),s});return r.materials.push(i,a),r.update=e=>{c.forEach((t,n)=>{let r=1+Math.sin(e*11+n*2)*.12+Math.sin(e*17.3+n)*.06;t.scale.set(.011/Math.sqrt(r),.022*r,.011/Math.sqrt(r)),t.rotation.z=Math.sin(e*3.7+n)*.12}),a.opacity=.18+Math.sin(e*13)*.05},r}function Ga(){let e=new z,t=`#1e1b22`,n=`#e2b23a`,r=e=>{let t=[];for(let n=0;n<=24;n++){let r=Math.PI-n/24*Math.PI;t.push(new R(Math.cos(r)*.27*e,Math.sin(r)**1.25*.17*e))}return t},i=new st(r(1));i.quadraticCurveTo(0,.03,-.27,0);let a=new re(i,{depth:.018,bevelEnabled:!0,bevelSize:.006,bevelThickness:.006,bevelSegments:2,curveSegments:12});a.translate(0,0,-.009);let o=new g(new Ee(r(1).map(e=>new x(e.x,e.y,0))),48,.009,5,!1);for(let r of[-1,1]){let i=new I().compose(new x(0,-.045,r*.075),new O().setFromEuler(new L(-r*.36,0,0)),new x(1,1,1));e.add(a,t,i),e.add(o,n,i.clone().multiply(new I().makeTranslation(0,0,r*.012)))}a.dispose(),o.dispose(),e.add(Io(24,8),t,{pos:[0,-.045,0],scale:[.2,.15,.1]});let s=new I().compose(new x(-.13,.06,.06),new O().setFromEuler(new L(-.36,0,0)),new x(1,1,1));for(let[t,n,r]of[[.05,`#d02a34`,.012],[.034,`#f8f6f0`,.016],[.018,`#2a4aa8`,.02]])e.add(q(20),n,{pos:[0,0,r],rot:[Math.PI/2,0,0],scale:[t,.006,t]},s);return e.add(La(),n,{pos:[0,.01,.025],scale:[.016,.1,.006]},s),e.add(K(8,6),n,{pos:[0,-.04,.026],scale:.01},s),Y(e,{top:.15,sit:{kind:`brim`,rim:[-.045,.18,.1]}})}function Ka(){let e=new z,t=[[.287,-.17],[.298,-.06],[.305,.08],[.293,.2],[.262,.3],[.2,.37],[.11,.405],[.001,.415]].map(([e,t])=>new R(e,t)),n=mt(new b(t,28,Math.PI+.1),.022,7);e.add(n,`#25212a`,{scale:[1,1,1.03]}),n.dispose();for(let t=0;t<40;t++){let n=t*2.39996,r=-.12+t*53%40*.0125,i=Ge.clamp((r+.17)/.585,0,1),a=.3*Math.sqrt(Math.max(.05,1-Math.max(0,(i-.4)/.6)**2));e.add(K(6,4),t%3?`#242026`:`#1a171c`,{pos:[Math.sin(n)*a*.97,r,Math.cos(n)*a*.97*1.03],rot:[0,n,0],scale:[.045,.034,.016]})}e.add(q(10),`#d8a838`,{pos:[.296,-.06,-.03],scale:[.016,.03,.016]});for(let t=0;t<6;t++){let n=-.03+t*.05;e.add(K(10,6),t%2?`#c41e2a`:`#e0303a`,{pos:[.31-t*.004,n,-.03-t*.004],rot:[.15,0,-.08],scale:[.03,.06,.026]})}for(let t=0;t<=18;t++){let n=-.95+t/18*1.9,r=Math.cos(n/.95*(Math.PI/2));e.add(J(.35,4,8),`#e8b83a`,{pos:[Math.sin(n)*.31,-.1-r*.045,Math.cos(n)*.32],rot:[0,n+(t%2?Math.PI/2:0),0],scale:.011})}return Y(e,{top:.42,sit:{kind:`snug`,rim:[-.17,.287,.296]}})}function qa(){let e=new z,t=[`#e2b25a`,`#c8913a`,`#a8762c`],n=[0,-.14,-.01],r=[.275,.22,.285];Ns(e,n,r,0,.6,t[0]),Ns(e,n,r,.6,1.15,t[1]),Ns(e,n,r,1.15,Math.PI/2,t[2]),e.add(J(.2,6,36),t[0],{pos:[0,n[1]+.004,n[2]],rot:[Math.PI/2,0,0],scale:[r[0]+.006,r[2]+.006,.16]});for(let t=0;t<14;t++){let i=t/14*Math.PI*2;e.add(K(6,4),`#f2d080`,{pos:[Math.sin(i)*(r[0]+.012),n[1]+.03,n[2]+Math.cos(i)*(r[2]+.012)],scale:.01})}let i=ss(new lt(1,1,1,24,1,!1,Math.PI/2+.25,Math.PI-.5),e=>e.set(e.x*.335,e.y*.014-.05*Math.max(0,-e.z),e.z*.35));e.add(i,t[1],{pos:[0,n[1]+.006,n[2]]}),i.dispose();let a=new k(1,.06,5,24,Math.PI);e.add(a,t[2],{pos:n,scale:[r[0]+.008,r[1]+.008,.25]}),a.dispose();let o=new x(0,1,0);for(let t=0;t<=26;t++){let i=.12+t/26*(Math.PI-.24),a=new x(Math.cos(i)*(r[0]+.01),n[1]+Math.sin(i)*(r[1]+.01),n[2]),s=new x(Math.cos(i)*.8,Math.sin(i),0).normalize(),c=.12+Math.sin(i)*.04,l=new I().compose(a.clone().addScaledVector(s,c/2),new O().setFromUnitVectors(o,s),new x(.035,c,.055-t%2*.01));e.add(La(),t%3?`#c41e2a`:`#a8141e`,l)}return Y(e,{top:.24,sit:{kind:`snug`,rim:[-.14,.275,.285]}},_t())}function Ja(){let e=new z,t=`#e2e6ee`,n=-.075,r=.222,i=(e,t,i=0)=>new x(Math.sin(e)*(r+i),n+t,Math.cos(e)*(r+i)),a=new k(1,.035,5,40,3.3).rotateZ(Math.PI/2-1.65);e.add(a,t,{pos:[0,n,0],rot:[Math.PI/2,0,0],scale:[r,r,.18]}),a.dispose();for(let t of[-1,1])e.add(K(8,6),`#fbf6ec`,{pos:i(t*1.65,0).toArray(),scale:.011});let o=e=>.035+.08*Math.cos(Math.min(1,Math.abs(e)/1)*(Math.PI/2))**2,s=[];for(let n=-5;n<=5;n++){let r=n*.19,a=o(r),c=new O().setFromEuler(new L(-.15,r,0,`YXZ`)),l=new x(0,1,0).applyQuaternion(c),u=i(r,0);e.add(new xe(1,1,6),t,new I().compose(u.clone().addScaledVector(l,a/2),c,new x(.009,a,.006)));let d=u.clone().addScaledVector(l,a+(n?.008:.02));if(e.add(new ft(1),n?`#f6fcff`:`#bfe4ff`,new I().compose(d,c,new x(n?.012:.026,n?.016:.034,n?.01:.016))),Math.abs(n)<=4&&n%2==0&&s.push([d.x*1.06,d.y+.004,d.z*1.06]),n<5){let n=Math.min(a,o(r+.19))*.5,s=i(r+.095,0).addScaledVector(l,n*.9);e.add(J(.18,4,14),t,new I().compose(s,c,new x(.021,n,.021))),e.add(K(8,6),`#fbf6ec`,{pos:i(r+.095,-.004,.004).toArray(),scale:.0085})}}let c=Y(e,{top:.04,sit:{kind:`ring`,rim:[-.14,r],tilt:.05}},_t());return c.update=za(c,s,.03),c}function Ya(){let e=new z,t=`#2e1a34`,n=`#e2b23a`;e.add(q(36),t,{pos:[0,-.035,0],scale:[.22,.016,.22]}),e.add(J(.35,6,36),t,{pos:[0,-.03,0],rot:[Math.PI/2,0,0],scale:[.22,.22,.045]}),e.add(q(32,1.06,1),t,{pos:[0,.125,0],scale:[.135,.32,.135]}),e.add(q(32),`#4a2c52`,{pos:[0,.287,0],scale:[.145,.006,.145]}),e.add(q(32),n,{pos:[0,.008,0],scale:[.14,.055,.14]}),e.add(q(32),`#1a1018`,{pos:[0,.03,0],scale:[.1405,.008,.1405]});let r=new x(.065,.018,.134),i=new O().setFromEuler(new L(.05,.42,.3));e.add(J(.16,6,24),n,new I().compose(r,i,new x(.042,.042,.034))),e.add(q(24),`#cfe8f4`,new I().compose(r,i.clone().multiply(new O().setFromEuler(new L(Math.PI/2,0,0))),new x(.039,.003,.039)));let a=new Ee([[.09,-.004,.122],[.13,-.02,.105],[.16,-.022,.05],[.155,-.012,-.02]].map(([e,t,n])=>new x(e,t,n)));for(let t=0;t<=16;t++){let r=a.getPoint(t/16),i=new O().setFromUnitVectors(new x(1,0,0),a.getTangent(t/16));t%2&&i.multiply(new O().setFromEuler(new L(Math.PI/2,0,0))),e.add(J(.3,4,8),n,new I().compose(r,i,new x(.007,.0045,.0045)))}return Y(e,{top:.3,sit:{kind:`brim`,rim:[-.035,.135]}},_t())}function Xa(){let e=new z,t=[`#f6d04a`,`#e8b83a`,`#d49a24`],n=.175;e.add(Io(18,7),`#6e1430`,{pos:[0,-.03,0],scale:[n*.96,.19,n*.96]});let r=new b([[.16299999999999998,-.045],[.183,-.045],[.191,0],[.187,.05],[.17099999999999999,.05],[.16299999999999998,-.045]].map(([e,t])=>new R(e,t)),36);e.add(r,t[1]),r.dispose(),e.add(J(.25,5,36),t[0],{pos:[0,.052,0],rot:[Math.PI/2,0,0],scale:[.181,.181,.05]}),e.add(J(.3,8,36),`#fbf8f2`,{pos:[0,-.048,0],rot:[Math.PI/2,0,0],scale:[.191,.191,.1]});for(let t=0;t<12;t++){let n=t/12*Math.PI*2+.13;e.add(K(6,4),`#1c1a1e`,{pos:[Math.sin(n)*.215,-.046,Math.cos(n)*.215],rot:[0,n,0],scale:[.008,.012,.005]})}let i=[`#d8203a`,`#2a5ae0`,`#20b060`,`#d8203a`,`#8a3ae0`,`#20b060`,`#d8203a`,`#2a5ae0`];for(let n=0;n<8;n++){let r=n/8*Math.PI*2,a=Math.sin(r),o=Math.cos(r),s=n%2==0;e.add(new xe(1,1,10),t[0],{pos:[a*.179,s?.11:.085,o*.179],scale:[.04,s?.12:.07,.03],rot:[0,r,0]}),e.add(K(8,6),`#fbf8f2`,{pos:[a*.179,s?.176:.126,o*.179],scale:.019}),e.add(K(10,8),i[n],{pos:[a*.19299999999999998,.004,o*.19299999999999998],rot:[0,r,0],scale:[.026,.03,.014]}),e.add(J(.25,4,16),t[2],{pos:[a*.192,.004,o*.192],rot:[0,r,0],scale:[.03,.034,.03]})}let a=.24;for(let n of[0,Math.PI/2]){let r=new k(1,.1,6,28,Math.PI);e.add(r,t[1],{pos:[0,.05,0],rot:[0,n,0],scale:[.17099999999999999,a,.24]}),r.dispose();for(let t=1;t<8;t++){let r=t/8*Math.PI,i=new x(Math.cos(r)*.17099999999999999,.05+Math.sin(r)*a+.012,0).applyAxisAngle(new x(0,1,0),n);e.add(K(6,4),`#fbf8f2`,{pos:i.toArray(),scale:.009})}}e.add(K(16,12),t[0],{pos:[0,.31999999999999995,0],scale:.035}),e.add(J(.18,4,20),t[2],{pos:[0,.31999999999999995,0],rot:[Math.PI/2,0,0],scale:.036});let o=Y(e,{top:.42,sit:{kind:`brim`,rim:[-.045,.191]}},_t()),s=new ke({color:`#eaf8ff`,emissive:`#bfe8ff`,emissiveIntensity:.6,roughness:.15,metalness:.1,flatShading:!0}),c=new N(new ft(1,0),s);c.scale.set(.034,.05,.034),c.position.set(0,.39999999999999997,0),c.castShadow=!1,o.group.add(c),o.materials.push(s);let l=za(o,[[0,.42,.03],[.205,.03,.02],[-.185,.12,.05],[.06,.16,n],[-.08,-.01,.215],[.1,.2,-.06],[-.175,0,-.08]],.045);return o.update=e=>{c.rotation.y=e*.7,s.emissiveIntensity=.5+Math.max(0,Math.sin(e*1.3))**8*.9,l(e)},o}var Za=()=>new j(1,1,1),Qa=(e=16)=>new xe(1,1,e);function $a(){let e=new z,t=new I().makeRotationZ(-.14);return e.add(q(22,.62,1),`#d8302a`,{pos:[0,.035,0],scale:[.115,.075,.115]},t),e.add(Io(22,6),`#c8261f`,{pos:[0,.07,0],scale:[.072,.04,.072]},t),e.add(J(.18,6,24),`#b01e18`,{pos:[0,0,0],rot:[Math.PI/2,0,0],scale:[.115,.115,.08]},t),e.add(q(10),`#c49a6c`,{pos:[0,.27,0],scale:[.018,.42,.018]},t),e.add(K(10,6),`#b08a58`,{pos:[0,.48,0],scale:[.022,.012,.022]},t),Y(e,{top:.48,sit:{kind:`perch`,rim:[-.005,.11]}})}function eo(){let e=new z,t=`#ffd23a`;e.add(K(16,10),t,{pos:[0,.055,-.01],scale:[.11,.075,.135]}),e.add(K(14,10),t,{pos:[0,.15,.06],scale:.068}),e.add(K(10,6),`#f08a24`,{pos:[0,.14,.128],scale:[.04,.014,.035]}),e.add(Qa(8),t,{pos:[0,.1,-.14],rot:[-1,0,0],scale:[.035,.07,.035]});for(let t of[-1,1])e.add(K(8,6),`#1d1d24`,{pos:[t*.033,.168,.112],scale:.012}),e.add(K(8,6),`#f6c41a`,{pos:[t*.1,.07,-.01],rot:[0,0,t*.4],scale:[.025,.04,.07]});return Y(e,{top:.22,sit:{kind:`perch`,rim:[-.01,.1]}})}function to(){let e=new z,t=`#e2b23a`;e.add(q(28,.62,1),`#f2a6b8`,{pos:[0,.05,0],scale:[.2,.22,.2]}),e.add(J(.12,5,28),t,{pos:[0,-.06,0],rot:[Math.PI/2,0,0],scale:[.2,.2,.12]}),e.add(J(.12,5,28),t,{pos:[0,.16,0],rot:[Math.PI/2,0,0],scale:[.124,.124,.12]});for(let n=0;n<16;n++){let r=n/16*Math.PI*2;e.add(q(5),t,{pos:[Math.sin(r)*.205,-.085,Math.cos(r)*.205],scale:[.004,.04,.004]}),e.add(K(6,4),t,{pos:[Math.sin(r)*.205,-.11,Math.cos(r)*.205],scale:[.012,.016,.012]})}return Y(e,{top:.17,sit:{kind:`brim`,rim:[-.06,.19]}})}function no(){let e=new z,t=new I().makeRotationY(.45);e.add(K(16,10),`#fbf8f0`,{pos:[0,.04,0],scale:[.16,.06,.095]},t);for(let n=0;n<9;n++)e.add(K(6,4),`#f2eee2`,{pos:[-.12+n*.03,.02+n%2*.02,n%3*.03-.03],scale:.022},t);e.add(K(18,8),`#f2804a`,{pos:[0,.085,0],scale:[.185,.032,.11]},t);for(let n=-2;n<=2;n++)e.add(Za(),`#fbd2b8`,{pos:[n*.055,.115,0],rot:[0,.5,0],scale:[.012,.004,.18]},t);return e.add(q(18),`#1e2a1e`,{pos:[0,.055,0],rot:[0,0,Math.PI/2],scale:[.105,.06,.11]},t),Y(e,{top:.13,sit:{kind:`perch`,rim:[-.005,.13]}})}function ro(){let e=new z;e.add(q(24,1.25,1),`#c86a3a`,{pos:[0,.06,0],scale:[.14,.15,.14]}),e.add(q(24),`#b85a2e`,{pos:[0,.145,0],scale:[.185,.04,.185]}),e.add(q(24),`#4a3424`,{pos:[0,.16,0],scale:[.16,.01,.16]}),e.add(q(8),`#4e8a34`,{pos:[0,.29,.02],rot:[.12,0,0],scale:[.012,.26,.012]});for(let t of[-1,1])e.add(K(8,4),`#5a9a3a`,{pos:[t*.05,.25,.015],rot:[0,0,-t*.5],scale:[.055,.012,.03]});let t=new I().compose(new x(0,.43,.05),new O().setFromEuler(new L(Math.PI/2-.35,0,0)),new x(1,1,1));for(let n=0;n<12;n++){let r=n/12*Math.PI*2;e.add(K(8,4),n%2?`#ffd23a`:`#f6c42a`,{pos:[Math.sin(r)*.075,0,Math.cos(r)*.075],rot:[0,r,0],scale:[.025,.008,.05]},t)}return e.add(q(16),`#6a4220`,{pos:[0,.006,0],scale:[.05,.016,.05]},t),Y(e,{top:.5,sit:{kind:`brim`,rim:[-.015,.115]}})}function io(){let e=new z;e.add(Io(24,8),`#f4a2bc`,{pos:[0,-.06,0],scale:[.21,.13,.21]});for(let t=0;t<10;t++){let n=t/10*Math.PI*2+.2,r=.03+t*7%4*.012;e.add(K(8,6),`#f4a2bc`,{pos:[Math.sin(n)*.2,-.06-r*.6,Math.cos(n)*.2],rot:[0,n,0],scale:[.03,r,.02]})}e.add(Qa(18),`#d8a050`,{pos:[0,.2,0],scale:[.1,.24,.1]});for(let t=0;t<4;t++){let n=.11+t*.045,r=.1*(1-(n-.08)/.24)+.002;e.add(J(.05,4,18),`#b8803a`,{pos:[0,n,0],rot:[Math.PI/2,0,0],scale:[r,r,.4]})}for(let t=0;t<14;t++){let n=t*2.39996,{p:r,n:i}=Jo(.21,.13,.21,n,.25+t*.37%1*.6,-.06),a=new O().setFromUnitVectors(new x(0,1,0),i);e.add(Za(),[`#ffffff`,`#4ab8f0`,`#ffd23a`,`#6ad06a`][t%4],new I().compose(r,a.multiply(new O().setFromAxisAngle(new x(0,1,0),n)),new x(.026,.008,.008)))}return Y(e,{top:.33,sit:{kind:`brim`,rim:[-.06,.2]}})}function ao(){let e=new z,t=`#5ab84a`,n=[0,-.13,-.01],r=[.27,.22,.285];Ns(e,n,r,0,1.25,t),Ns(e,n,r,1.25,Math.PI/2,`#a8dc8a`);for(let i of[-1,1]){e.add(K(16,12),t,{pos:[i*.11,.04,.08],scale:.075}),e.add(K(12,10),`#fbfbf6`,{pos:[i*.11,.055,.125],scale:.05}),e.add(K(10,8),`#1d1d24`,{pos:[i*.11,.06,.165],scale:.025});let{p:a,n:o}=Jo(r[0],r[1],r[2],i*.75,.55,n[1]);a.z+=n[2],e.add(K(8,6),`#f28a9a`,{pos:a.addScaledVector(o,.002).toArray(),scale:[.03,.018,.01]})}return e.add(new k(1,.06,5,16,Math.PI*.5),`#2a4a22`,{pos:[0,.05,.155],rot:[-.5,0,Math.PI*1.25],scale:[.1,.1,.1]}),Y(e,{top:.12,sit:{kind:`snug`,rim:[-.13,.27,.285]}})}function oo(){let e=new z;e.add(K(24,14),`#1e2a4a`,{pos:[0,.03,-.01],scale:[.2,.26,.225]}),e.add(q(28),`#16203a`,{pos:[0,-.03,-.01],scale:[.205,.05,.23]}),e.add(J(.18,5,28),`#16203a`,{pos:[0,-.055,-.01],rot:[Math.PI/2,0,0],scale:[.215,.24,.1]}),e.add(q(12),`#c8ccd2`,{pos:[0,.29,-.01],scale:[.025,.03,.025]}),e.add(K(10,6),`#d8dce2`,{pos:[0,.31,-.01],scale:.028});let t=new st;for(let e=0;e<16;e++){let n=e%2?.026:.05,r=e/16*Math.PI*2;e===0?t.moveTo(Math.sin(r)*n,Math.cos(r)*n):t.lineTo(Math.sin(r)*n,Math.cos(r)*n)}let n=new re(t,{depth:.01,bevelEnabled:!1});return e.add(n,`#d8dce2`,{pos:[0,.07,.2],rot:[-.35,0,0]}),n.dispose(),e.add(q(14),`#2a4a9a`,{pos:[0,.07,.21],rot:[Math.PI/2-.35,0,0],scale:[.018,.006,.018]}),Y(e,{top:.33,sit:{kind:`brim`,rim:[-.06,.2,.225]}})}function so(){let e=new z,t=`#e2b23a`,n=`#2a4aa8`,r=[0,-.13,-.01],i=[.275,.225,.29];for(let a=0;a<18;a++){let o=new s(1,3,7,a/18*Math.PI*2,Math.PI*2/18,0,Math.PI/2);e.add(o,a%2?t:n,{pos:r,scale:i}),o.dispose()}e.add(K(12,6),t,{pos:[0,r[1]+i[1]-.005,r[2]],scale:[.05,.012,.05]}),e.add(q(36),t,{pos:[0,r[1]-.005,r[2]],scale:[i[0]+.008,.03,i[2]+.008]});for(let i of[-1,1])for(let a=0;a<5;a++)e.add(Za(),a%2?t:n,{pos:[i*.255,r[1]-.04-a*.04,-.09-a*.006],rot:[.1,0,i*.12],scale:[.03,.04,.16+a*.012]});return e.add(Za(),n,{pos:[0,r[1]-.06,-.27],rot:[.2,0,0],scale:[.14,.14,.03]}),e.add(K(10,8),t,{pos:[0,r[1]+.06,.28],scale:[.025,.05,.02]}),e.add(K(10,8),`#f2c84a`,{pos:[0,r[1]+.12,.29],scale:[.035,.04,.012]}),e.add(K(8,6),t,{pos:[0,r[1]+.15,.3],scale:[.016,.014,.022]}),Y(e,{top:.12,sit:{kind:`snug`,rim:[-.13,.275,.29]}})}function co(){let e=new z;e.add(K(28,10),`#c8ccd6`,{pos:[0,0,0],scale:[.2,.04,.2]}),e.add(J(.1,5,32),`#9aa0ae`,{pos:[0,-.005,0],rot:[Math.PI/2,0,0],scale:[.195,.195,.2]}),e.add(q(20,.7,1),`#8a909e`,{pos:[0,-.04,0],scale:[.08,.03,.08]}),e.add(K(12,10),`#6ad06a`,{pos:[0,.055,0],scale:[.04,.045,.04]});for(let t of[-1,1])e.add(K(8,6),`#1d1d24`,{pos:[t*.017,.065,.032],scale:[.012,.016,.008]});let t=Y(e,{top:.32,sit:{kind:`float`,rim:[0,.17]}}),n=t.group.children[0],r=new c;r.position.y=.18,t.group.remove(n),r.add(n),t.group.add(r);let i=new ke({color:`#bfe8ff`,transparent:!0,opacity:.4,roughness:.1,depthWrite:!1}),a=new N(new s(.075,18,8,0,Math.PI*2,0,Math.PI/2),i);a.position.y=.025,a.castShadow=!1,r.add(a);let o=new s(.014,8,6),l=Array.from({length:8},(e,n)=>{let i=new Je({color:[`#ff5a5a`,`#ffd23a`,`#5ad0ff`,`#7aff7a`][n%4]}),a=new N(o,i),s=n/8*Math.PI*2;return a.position.set(Math.sin(s)*.17,.012,Math.cos(s)*.17),a.castShadow=!1,r.add(a),t.materials.push(i),a}),u=new Je({color:`#c8ffd8`,transparent:!0,opacity:.1,depthWrite:!1,blending:2,side:2}),d=new N(new lt(.03,.13,.16,20,1,!0),u);return d.position.y=-.12,d.castShadow=!1,r.add(d),t.materials.push(i,u),t.update=e=>{r.position.y=.18+Math.sin(e*1.9)*.015,r.rotation.y=e*.8,r.rotation.z=Math.sin(e*1.3)*.05,l.forEach((t,n)=>t.scale.setScalar(Math.floor(e*8)%8===n?1.5:.8)),u.opacity=.08+Math.sin(e*4.1)*.03},t}var lo=()=>new j(1,1,1),uo=(e=16)=>new xe(1,1,e),fo=(e,t,n)=>new I().compose(e,new O().setFromUnitVectors(new x(0,1,0),t.clone().normalize()),new x(...n));function po(e,t,n=ht()){let r=t.mesh(n,{cast:!0,receive:!1});return e.group.add(r),e.solid.push({mesh:r,material:n}),e.materials.push(n),r}function mo(e,t,n,r,i=e.group){let a=new at({color:n,specular:`#ffffff`,shininess:100,transparent:!0,opacity:r,depthWrite:!1}),o=new N(t,a);return o.castShadow=!1,o.renderOrder=2,i.add(o),e.materials.push(a),o}function ho(e,t,n,r,i,a,o,c,l=.06){let u=new O().setFromEuler(new L(Math.PI/2+i,0,0)),d=e=>{let r=e.clone().normalize().clone().multiply(n).multiplyScalar(e.length()),i=-.3;return r.y+t.y<i&&(r.y=i-t.y+(r.y+t.y-i)*.3),e.copy(r.add(t))};for(let[t,n,i]of[[1,a,!1],[.94,o,!0]]){let a=new s(t,26,14,0,Math.PI*2,r,Math.PI-r).applyQuaternion(u);e.add(ss(i?os(a):a,d),n),a.dispose()}let f=new k(Math.sin(r)*.97,l,7,40).rotateX(Math.PI/2).translate(0,Math.cos(r)*.97,0).applyQuaternion(u);return l>.08&&mt(f,.05,7),e.add(ss(f,d),c),f.dispose(),{open:[0,Math.cos(Math.PI/2+i),Math.sin(Math.PI/2+i),Math.cos(r)+.04],at:(e,t=1)=>d(new x(...e).normalize().multiplyScalar(t))}}function go(){let e=new z,t=`#3f9a3a`,n=[0,-.13,-.01],r=[.27,.21,.285];Ns(e,n,r,0,Math.PI/2,t),e.add(J(.07,5,32),`#2f7a2c`,{pos:[0,n[1]+.01,n[2]],rot:[Math.PI/2,0,0],scale:[r[0]+.004,r[2]+.004,.2]});let{geo:i}=zo([0,-.05,-.08],.2,.52,12,3.3,[-1,0,0],[0,1,-.8]);return e.add(i,t),i.dispose(),Y(e,{top:.2,sit:{kind:`snug`,rim:[-.13,.27,.285]}})}function _o(){let e=new z,t=`#d8282c`,n=[0,-.12,-.01],r=[.268,.215,.28];Ns(e,n,r,0,Math.PI/2,t),e.add(J(.04,4,32),`#b82024`,{pos:[n[0],n[1]+.012,n[2]],rot:[Math.PI/2,0,0],scale:[r[0],r[2],.25]}),e.add(q(14),t,{pos:[n[0],n[1]+r[1]+.004,n[2]],scale:[.03,.02,.03]});let i=ss(new lt(1,1,1,22,1,!1,-Math.PI/2,Math.PI),e=>e.set(e.x*.225,e.y*.018-.05*e.x*e.x,e.z*.3));e.add(i,`#c42226`,{pos:[0,n[1]+.012,.11],rot:[.12,0,0]}),i.dispose();let{p:a,n:o}=Jo(r[0],r[1],r[2],0,.5,n[1]);a.z+=n[2];let s=new O().setFromUnitVectors(new x(0,0,1),o),c=new lt(1,1,1,24).rotateX(Math.PI/2);e.add(c,`#fbf8f2`,new I().compose(a.clone().addScaledVector(o,.003),s,new x(.075,.075,.01))),c.dispose();let l=Lo(.055,.42);return e.add(l,t,new I().compose(a.clone().addScaledVector(o,.01),s,new x(1,1,.3))),l.dispose(),Y(e,{top:.1,sit:{kind:`snug`,rim:[-.12,.268,.28]}})}function vo(){let e=new z,t=`#b8282c`,n=[0,-.13,-.01],r=[.272,.21,.287];Ns(e,n,r,0,Math.PI/2,t);for(let t=0;t<16;t++){let i=t*2.39996,{p:a,n:o}=Jo(r[0]+.002,r[1]+.002,r[2]+.002,i,.04+t*.41%1*.2,n[1]);a.z+=n[2],e.add(K(6,4),`#f4eadc`,new I().compose(a,new O().setFromUnitVectors(new x(0,0,1),o),new x(.016,.016,.004)))}e.add(K(10,6),`#a02024`,{pos:[0,n[1]+.03,-.29],scale:[.04,.035,.03]});for(let r of[-1,1])e.add(lo(),t,{pos:[r*.03,n[1]-.04,-.305],rot:[.25,0,r*.3],scale:[.04,.12,.008]});e.add(Io(24,8),`#5a3a24`,{pos:[0,-.065,-.01],scale:[.262,.2,.276]}),e.add(q(24),`#3e2818`,{pos:[0,-.05,-.01],scale:[.264,.03,.278]});let i=ss(bs(.24,.4,.02,60,(e,t,n)=>n*n*.12),e=>{let t=Math.atan2(e.x,e.z),n=1-.34*(1-Math.cos(3*t))*.5*Math.min(1,Math.max(0,(Math.hypot(e.x,e.z)-.24)/.16));return e.set(e.x*n,e.y,e.z*n)});e.add(mt(i,.008,3),`#4e321e`,{pos:[0,-.065,-.01]}),i.dispose();for(let t=0;t<3;t++){let n=t/3*Math.PI*2;e.add(K(8,6),`#e8c26a`,{pos:[Math.sin(n)*.405,.06,-.01+Math.cos(n)*.405],scale:.016})}return e.add(q(5),`#3a2a1e`,{pos:[.29,-.12,.1],rot:[0,0,.1],scale:[.004,.13,.004]}),[`#c84a2a`,`#e8d8a8`,`#3a7ab8`,`#e8c26a`].forEach((t,n)=>e.add(K(8,6),t,{pos:[.295-n*.003,-.08-n*.03,.1],scale:[.016,.014,.016]})),Y(e,{top:.14,sit:{kind:`snug`,rim:[-.13,.272,.287]}})}function yo(){let e=new z,t=`#8ab83a`;Ns(e,[0,-.14,-.01],[.275,.215,.29],0,Math.PI/2,t);for(let n of[-1,1]){let r=new x(n*.24,-.08,.03),i=new x(n*.9,.42,.1).normalize();e.add(K(10,7),t,{pos:r.toArray(),scale:[.05,.06,.06]}),e.add(q(16,1,.38),t,fo(r.clone().addScaledVector(i,.1),i,[.085,.2,.085])),e.add(J(.16,6,18),`#7aa82e`,fo(r.clone().addScaledVector(i,.2),i,[.083,.083,.083]).multiply(new I().makeRotationX(Math.PI/2))),e.add(q(16),`#3a4a1a`,fo(r.clone().addScaledVector(i,.196),i,[.072,.004,.072]))}return Y(e,{top:.12,sit:{kind:`snug`,rim:[-.14,.275,.29]}})}function bo(){let e=new z,t=`#5a3a22`,n=`#462c18`,r=[0,-.15,-.01],i=[.28,.22,.295];Ns(e,r,i,0,Math.PI/2,t),e.add(lo(),n,{pos:[0,r[1]+i[1]+.002,.08],rot:[.5,0,0],scale:[.008,.004,.18]});for(let r of[-1,1]){let i=new x(r*.3,-.15,-.02),a=new x(r,0,0);e.add(K(18,12),t,{pos:i.toArray(),scale:[.075,.145,.145]});for(let r=0;r<4;r++){let o=.128-r*.03;e.add(J(.13,6,28),r%2?t:n,fo(i.clone().addScaledVector(a,.04+r*.008),a,[o,o,o]).multiply(new I().makeRotationX(Math.PI/2)))}}return Y(e,{top:.08,sit:{kind:`snug`,rim:[-.15,.28,.295]}})}function xo(){let e=new z,t=new x(0,-.2,.005),n=[.305,.3,.32],r=new s(1,32,18,0,Math.PI*2,0,2.3);e.add(r,`#c4cad4`,{pos:t.toArray(),scale:n}),r.dispose();let i=new s(1.02,30,8,Math.PI/2-1,2,1.2,.62);e.add(i,`#16161c`,{pos:t.toArray(),scale:n}),i.dispose(),e.add(J(.08,6,36),`#8a8e98`,{pos:[0,t.y+Math.cos(2.3)*n[1],t.z],rot:[Math.PI/2,0,0],scale:[Math.sin(2.3)*n[0],Math.sin(2.3)*n[2],.2]});for(let r of[-1,1])e.add(q(20),`#22222a`,{pos:[r*(n[0]+.005),t.y,t.z-.02],rot:[0,0,Math.PI/2],scale:[.08,.02,.08]});let a=Y(e,{top:.1,sit:{kind:`hood`,rim:[-.2,.305,.32],clear:!0}},_t()),o=new Je({color:`#ff3a3a`}),c=new Je({color:`#4a1218`});a.materials.push(o,c);let l=new j(.03,.022,.008),u=Array.from({length:9},(e,r)=>{let i=(r-4)*.17,o=new x(Math.sin(i)*n[0]*1.03,Math.cos(1.52)*n[1],Math.cos(i)*n[2]*1.03).add(t),s=new N(l,c);return s.position.copy(o),s.rotation.y=i,s.castShadow=!1,a.group.add(s),s});return a.update=e=>{let t=4+Math.sin(e*2.4)*4.4;u.forEach((e,n)=>e.material=Math.abs(n-t)<1.2?o:c)},a}function So(){let e=new z,t=new x(0,-.2,-.015),n=new x(.315,.285,.31),r=ho(e,t,n,1.1,.15,`#f08a24`,`#c86418`,`#7a5a3a`,.16),i=new k(1,.025,4,20,Math.PI*.62).rotateY(Math.PI/2).rotateX(-.2);e.add(i,`#d8761a`,{pos:t.toArray(),scale:[1,n.y+.004,n.z+.004]}),i.dispose();for(let t of[-1,1]){let n=r.at([t*.35,-.75,.6],1.02);e.add(q(5),`#e8e2d4`,{pos:[n.x,n.y-.05,n.z+.01],scale:[.006,.1,.006]}),e.add(K(8,6),`#e8e2d4`,{pos:[n.x,n.y-.105,n.z+.01],scale:[.014,.018,.014]})}return Y(e,{top:.1,sit:{kind:`hood`,rim:[-.2,.315,.31],open:r.open,clear:!0}})}function Co(){let e=new z,t=new st([new R(-.19,0),new R(.23,0),new R(-.19,.19)]),n=new re(t,{depth:.34,bevelEnabled:!0,bevelSize:.008,bevelThickness:.008,bevelSegments:1}).rotateY(-Math.PI/2).translate(.17,-.025,0);e.add(n,`#f6c83a`),n.dispose();let r=`#d8a020`,i=bt(11);for(let t of[-1,1])for(let n=0;n<4;n++){let n=-.15+i()*.24,a=-.01+i()*Math.max(.02,(.23-n)*.42);e.add(K(10,6),r,{pos:[t*.179,a,n],scale:[.006,.012+i()*.014,.012+i()*.014]})}let a=Math.atan2(.19,.42);for(let t=0;t<5;t++){let t=.15+i()*.7;e.add(K(10,6),r,{pos:[-.12+i()*.24,-.025+.19*(1-t)+.008,-.19+.42*t],rot:[-a,0,0],scale:[.018+i()*.012,.005,.015+i()*.01]})}for(let t=0;t<3;t++)e.add(K(10,6),r,{pos:[-.1+t*.1,.03+t%2*.07,-.2],scale:[.016,.014,.006]});return Y(e,{top:.17,sit:{kind:`brim`,rim:[-.02,.17]}})}function wo(){let e=new z,t=[0,-.13,-.01],n=[.268,.2,.28];Ns(e,t,n,0,Math.PI/2,`#2a3a6a`),e.add(q(32),`#e2b23a`,{pos:[0,t[1]+.02,t[2]],scale:[n[0]+.006,.04,n[2]+.006]});for(let r=0;r<6;r++){let i=r/6*Math.PI*2+.3,a=new x(Math.sin(i)*(n[0]+.008),t[1]+.02,t[2]+Math.cos(i)*(n[2]+.008)),o=new I().compose(a,new O().setFromEuler(new L(Math.PI/2,0,-i,`YXZ`)).premultiply(new O().setFromAxisAngle(new x(0,1,0),i)),new x(1,1,1));e.add(q(10),`#c8962a`,{scale:[.03,.012,.03]},o);for(let t=0;t<8;t++)e.add(lo(),`#c8962a`,{pos:[Math.sin(t/8*Math.PI*2)*.032,0,Math.cos(t/8*Math.PI*2)*.032],rot:[0,t/8*Math.PI*2,0],scale:[.01,.012,.012]},o)}e.add(q(14),`#2a3a6a`,{pos:[0,.075,-.01],scale:[.03,.02,.03]});let r=Y(e,{top:.38,sit:{kind:`snug`,rim:[-.13,.268,.28]}}),i=new c;i.position.set(0,.08,-.01),r.group.add(i);let a=new z,o=[];for(let e=0;e<=80;e++)o.push(new x(Math.sin(e*.47)*.018,e*.0015,Math.cos(e*.47)*.018));let l=new g(new Ee(o),120,.004,4,!1);a.add(l,`#b8bcc4`),l.dispose(),a.add(q(14),`#9aa0aa`,{pos:[0,.135,0],scale:[.032,.035,.032]});for(let e=0;e<3;e++)a.add(J(.18,4,16),`#c8ccd4`,{pos:[0,.125+e*.01,0],rot:[Math.PI/2,0,0],scale:[.033,.033,.02]});i.add(po(r,a));let u=new ke({color:`#fff8d8`,emissive:`#ffd84a`,emissiveIntensity:.1,transparent:!0,opacity:.85,roughness:.2}),d=new N(new s(.07,18,14),u);return d.scale.set(1,1.15,1),d.position.y=.215,d.castShadow=!1,i.add(d),r.materials.push(u),r.update=e=>{i.rotation.z=Math.sin(e*2.3)*.12,i.rotation.x=Math.sin(e*1.7+1)*.08;let t=e%5.2,n=t>3.6?t<3.8?Math.floor(t*40)%2?1:.2:1:.08;u.emissiveIntensity=n*2.2,d.scale.setScalar(n>.5?1.08:1).y*=1.15},r}function To(){let e=new z,t=.36,n=t/2-.02;e.add(lo(),`#e8821e`,{pos:[0,n,0],scale:t});for(let[r,i]of[[0,1],[0,-1],[2,1],[2,-1]])for(let a=0;a<4;a++){let o=-.36/2+t*(.125+a*.25),s=r===0?[i*.182,n,o]:[o,n,i*.182],c=r===0?[.004,t,.03]:[.03,t,.004];(r!==2||i!==1)&&e.add(lo(),`#c86a14`,{pos:s,scale:c})}e.add(lo(),`#f29a34`,{pos:[0,.34199999999999997,0],scale:[t*.7,.004,t*.7]}),e.add(lo(),`#5a7a2a`,{pos:[0,.365,0],scale:[.05,.05,.05]});let r=.183,i=`#2a1606`;for(let t of[-1,1])e.add(lo(),i,{pos:[t*.09,.23,r],scale:[.07,.055,.004]});e.add(lo(),i,{pos:[0,.175,r],scale:[.04,.03,.004]}),e.add(lo(),i,{pos:[0,.09,r],scale:[.22,.045,.004]});for(let t of[-.08,0,.08])e.add(lo(),i,{pos:[t,.125,r],scale:[.04,.03,.004]});for(let t of[-.11,.11])e.add(lo(),i,{pos:[t,.125,r],scale:[.03,.035,.004]});return Y(e,{top:.39,sit:{kind:`brim`,rim:[-.015,.18]}})}function Eo(){let e=new z,t=`#8a8a96`;e.add(K(14,10),t,{pos:[0,.035,-.01],scale:[.1,.055,.12]});let n=new g(new Ee([[0,.03,-.11],[.02,0,-.17],[.05,-.07,-.22],[.04,-.14,-.25],[0,-.17,-.24]].map(([e,t,n])=>new x(e,t,n))),20,.008,5,!1);e.add(n,`#e0a0a8`),n.dispose(),e.add(q(26),`#f6f4ee`,{pos:[0,.115,0],scale:[.13,.11,.13]}),e.add(q(26),`#e2ded4`,{pos:[0,.064,0],scale:[.133,.012,.133]});for(let t=0;t<14;t++){let n=t/14*Math.PI*2;e.add(q(4),`#e6e2d8`,{pos:[Math.sin(n)*.131,.12,Math.cos(n)*.131],scale:[.004,.1,.004]})}e.add(K(18,12),`#fbfaf6`,{pos:[0,.27,0],scale:[.16,.1,.16]});for(let t=0;t<7;t++){let n=t/7*Math.PI*2;e.add(K(12,8),`#f6f4ee`,{pos:[Math.sin(n)*.1,.235,Math.cos(n)*.1],scale:[.075,.07,.075]})}for(let t of[-1,1])e.add(K(8,6),`#e8a8b0`,{pos:[t*.04,.07,.13],scale:[.016,.012,.014]});let r=1.45,i=Y(e,{top:.37*r,sit:{kind:`brim`,rim:[-.01*r,.12*r]}});i.group.children[0].scale.setScalar(r);let a=new z;a.add(K(14,10),t,{pos:[0,0,.03],scale:[.05,.045,.055]}),a.add(uo(12),t,{pos:[0,-.008,.085],rot:[Math.PI/2,0,0],scale:[.032,.06,.028]}),a.add(K(8,6),`#e87890`,{pos:[0,-.008,.115],scale:.011});for(let e of[-1,1]){a.add(K(8,6),`#121218`,{pos:[e*.026,.014,.068],scale:.009}),a.add(K(12,8),t,{pos:[e*.04,.038,.01],rot:[0,0,-e*.4],scale:[.03,.03,.008]}),a.add(K(12,8),`#e8a8b0`,{pos:[e*.04,.037,.016],rot:[0,0,-e*.4],scale:[.021,.021,.004]});for(let t of[-.004,.004])a.add(q(4),`#d8d8e0`,{pos:[e*.035,-.01+t,.098],rot:[0,0,e*(Math.PI/2-t*20)],scale:[.0016,.06,.0016]})}let o=po(i,a);return o.scale.setScalar(r),o.position.set(0,.05*r,.08*r),i.update=e=>{o.rotation.y=Math.sin(e*.7)*.45+Math.sin(e*2.9)*.05,o.rotation.x=Math.sin(e*1.3)*.08-.05,o.position.z=(.08+Math.max(0,Math.sin(e*.45))*.015)*r},i}function Do(){let e=new z,t=[`#6e5032`,`#74563a`],n=bs(.15,.31,.025,44,(e,t,n)=>-n*n*.06+.02*Math.sin(5*Math.atan2(e,t))*n);e.add(n,`#6a4c30`),n.dispose();let r=zo([0,0,0],.18,.62,12,2.1,[-1,0,0],[0,1,.08]);e.add(mt(r.geo,.012,4),t[1]),r.geo.dispose(),e.add(J(.1,5,26),`#5a3e26`,{pos:[0,.02,0],rot:[Math.PI/2,0,0],scale:[.165,.165,.2]}),e.add(lo(),`#9a7a50`,{pos:[-.1,.12,-.06],rot:[.2,-1,.25],scale:[.06,.05,.006]}),e.add(lo(),`#5a4a3a`,{pos:[.09,.2,-.04],rot:[.3,1.1,-.2],scale:[.045,.04,.006]});for(let t of[-1,1])e.add(K(10,6),`#4e3420`,{pos:[t*.05,.17,.13],rot:[-.33,0,t*-.35],scale:[.055,.016,.024]});e.add(K(10,8),`#5e4228`,{pos:[0,.11,.16],rot:[-.33,0,0],scale:[.03,.045,.028]});let i=Y(e,{top:.5,sit:{kind:`brim`,rim:[-.03,.165]}}),a=new z;for(let e of[-1,1])a.add(K(10,6),`#1e140c`,{pos:[e*.05,0,0],rot:[0,0,e*.25],scale:[.04,.016,.014]});let o=po(i,a);o.position.set(0,.14,.148),o.rotation.x=-.33;let s=new z;s.add(K(12,6),`#1e140c`,{scale:[.075,.016,.016]});let c=po(i,s);return c.position.set(0,.06,.168),c.rotation.x=-.33,i.update=e=>{o.scale.y=e%3.7<.15?.15:1;let t=Math.sin(e*.8)>.2?Math.abs(Math.sin(e*11)*Math.sin(e*4.3)):0;c.scale.y=1+t*2.2,c.scale.x=1-t*.2},i}function Oo(){let e=new z,t=`#d8282c`;e.add(new lt(.16,.135,1,28,1,!0),t,{pos:[0,.06,0],scale:[1,.14,1]}),e.add(q(28),`#b82024`,{pos:[0,-.008,0],scale:[.137,.006,.137]}),e.add(q(26),`#f6d070`,{pos:[0,.1,0],scale:[.15,.01,.15]});for(let n=0;n<7;n++){let r=n/7*Math.PI*2;e.add(uo(4),t,{pos:[Math.sin(r)*.158,.16,Math.cos(r)*.158],rot:[0,r+Math.PI/4,0],scale:[.05,.06,.012]}),e.add(K(8,6),`#ffd23a`,{pos:[Math.sin(r)*.165,.11,Math.cos(r)*.165],scale:.014})}let n=bt(5);for(let t=0;t<26;t++){let r=n()*Math.PI*2,i=Math.sqrt(n())*.12,a=.14+n()*.14,o=new L((n()-.5)*.5+Math.cos(r)*i*2.5,n()*Math.PI,(n()-.5)*.5-Math.sin(r)*i*2.5);e.add(lo(),t%5?`#f2c040`:`#e0a830`,new I().compose(new x(Math.sin(r)*i,.08+a/2,Math.cos(r)*i),new O().setFromEuler(o),new x(.024,a,.024)))}let r=1.25,i=Y(e,{top:.3*r,sit:{kind:`brim`,rim:[-.01*r,.137*r]}});return i.group.children[0].scale.setScalar(r),i}function ko(){let e=new z;e.add(q(28),`#f8f6f0`,{pos:[0,.055,0],scale:[.1,.13,.1]});for(let t of[0,.04,.08])e.add(J(.04,3,28),`#e8e4da`,{pos:[0,t,0],rot:[Math.PI/2,0,0],scale:[.1,.1,.12]});e.add(q(18),`#b88a5a`,{pos:[0,.056,0],scale:[.036,.132,.036]}),e.add(q(18),`#3a2a1e`,{pos:[0,.06,0],scale:[.03,.13,.03]});let t=1.3,n=Y(e,{top:.13*t,sit:{kind:`brim`,rim:[-.005*t,.1*t]}});n.group.children[0].scale.setScalar(t);let r=new Ee([[0,0,0],[0,-.01,-.03],[0,-.08,-.06],[.01,-.18,-.1],[.02,-.3,-.13]].map(([e,t,n])=>new x(e,t,n))),i=new z;for(let e=0;e<16;e++){let t=r.getPoint((e+.5)/16),n=r.getTangent((e+.5)/16);i.add(lo(),`#f8f6f0`,new I().compose(t,new O().setFromUnitVectors(new x(0,1,0),n),new x(.085,r.getLength()/16+.003,.004))),e%4==3&&i.add(lo(),`#dcd8ce`,new I().compose(t,new O().setFromUnitVectors(new x(0,1,0),n),new x(.086,.003,.005)))}let a=po(n,i);return a.scale.setScalar(t),a.position.set(0,.11*t,-.1*t),n.update=e=>{a.rotation.z=Math.sin(e*1.4)*.12,a.rotation.x=Math.sin(e*1.1+1)*.06},n}function Ao(){let e=new z,t=`#f6f4ee`,n=`#f08a24`;e.add(K(18,12),t,{pos:[0,.06,-.03],scale:[.11,.08,.15]});for(let t of[-1,1])e.add(K(14,8),`#e6e4de`,{pos:[t*.085,.075,-.05],rot:[.15,0,t*.25],scale:[.04,.06,.13]}),e.add(K(10,6),`#a8acb4`,{pos:[t*.09,.09,-.15],rot:[.4,0,t*.25],scale:[.03,.035,.05]}),e.add(K(10,6),n,{pos:[t*.05,0,.08],scale:[.03,.01,.04]});e.add(uo(10),t,{pos:[0,.11,-.18],rot:[-1,0,0],scale:[.05,.08,.035]});let r=1.45,i=Y(e,{top:.32*r,sit:{kind:`brim`,rim:[-.01*r,.12*r]}});i.group.children[0].scale.setScalar(r);let a=new z,o=new g(new Ee([[0,0,0],[0,.06,.025],[0,.13,0],[0,.19,.02]].map(([e,t,n])=>new x(e,t,n))),14,.026,10,!1);a.add(o,t),o.dispose(),a.add(K(14,10),t,{pos:[0,.205,.035],scale:[.036,.036,.048]}),a.add(uo(10),n,{pos:[0,.198,.1],rot:[Math.PI/2,0,0],scale:[.02,.05,.014]}),a.add(K(8,6),`#d0601a`,{pos:[0,.2,.12],scale:[.008,.007,.008]});for(let e of[-1,1])a.add(K(8,6),`#121218`,{pos:[e*.03,.214,.052],scale:.008});let s=po(i,a);return s.scale.setScalar(r),s.position.set(0,.09*r,.08*r),i.update=e=>{let t=e%6,n=t>5?Math.sin((t-5)/1*Math.PI):0;s.rotation.x=Math.sin(e*1.1)*.12+n*.7,s.rotation.y=Math.sin(e*.6)*.5*(1-n)+n*Math.sin(e*30)*.08},i}function jo(){let e=new z;Ns(e,[0,-.13,-.01],[.28,.2,.29],0,Math.PI/2,`#d83a8a`);for(let[t,n,r]of[[.2,-.1,`#f4a020`],[-.16,-.07,`#f6c030`]])e.add(J(.12,6,36),r,{pos:[0,n,-.01],rot:[Math.PI/2+t,0,0],scale:[.262,.27,.2]});let t=new I().makeTranslation(0,.06,0);e.add(K(16,12),`#d8a030`,{pos:[0,.14,-.06],scale:[.07,.1,.07]},t);for(let n=0;n<18;n++){let r=n*2.39996,i=-.8+n*.37%1*1.6;e.add(K(6,4),`#a8701a`,{pos:[Math.sin(r)*Math.cos(i)*.071,.14+Math.sin(i)*.1,-.06+Math.cos(r)*Math.cos(i)*.071],scale:.009},t)}for(let n=0;n<7;n++){let r=n/7*Math.PI*2;e.add(uo(6),n%2?`#3a8a2a`:`#4ea03a`,fo(new x(Math.sin(r)*.015,.25,-.06+Math.cos(r)*.015),new x(Math.sin(r)*.5,1,Math.cos(r)*.5),[.018,.13,.008]).multiply(new I().makeTranslation(0,.5,0)),t)}for(let[t,n,r]of[[-1,.03,.9],[1,.02,.9],[-1,-.04,.6]]){let i=Ro(e,e=>e<5?`#f6d23a`:`#e8c22a`,[t*.04,.1,n],.028,.2,6,.9,[0,0,-t],[t*r,1,.1]);e.add(K(6,4),`#5a4020`,{pos:i,scale:.008})}let n=bt(9);for(let r=0;r<11;r++)e.add(K(10,8),r%3?`#7a3a9a`:`#8a4aaa`,{pos:[.19+n()*.05,.03-r/11*.12+n()*.02,.06+n()*.06],scale:.024},t);e.add(K(16,12),`#f08a20`,{pos:[-.11,.06,.1],scale:.055},t),e.add(K(8,6),`#4ea03a`,{pos:[-.11,.115,.1],scale:[.015,.006,.01]},t);for(let n of[-1,1])e.add(K(12,10),`#d81e2a`,{pos:[.04+n*.025,.05,.16],scale:.022},t),e.add(q(4),`#4e7a2a`,{pos:[.04+n*.012,.09,.15],rot:[.2,0,n*-.35],scale:[.003,.08,.003]},t);return Y(e,{top:.38,sit:{kind:`snug`,rim:[-.13,.28,.29]}})}function Mo(){let e=new z,t=`#26262c`,n=new b([[.238,-.14],[.252,-.14],[.252,-.08],[.238,-.08],[.238,-.14]].map(([e,t])=>new R(e,t)),40);e.add(n,t),n.dispose();for(let t of[-1,1])e.add(q(14),`#5a5e66`,{pos:[t*.255,-.11,0],rot:[0,0,Math.PI/2],scale:[.03,.02,.03]}),e.add(lo(),`#5a5e66`,new I().compose(new x(t*.2,0,.1),new O().setFromEuler(new L(-.95,t*.4,0)),new x(.012,.012,.25)));let r=new I().compose(new x(0,.07,.17),new O().setFromEuler(new L(-1.05,0,0)),new x(1.45,1.45,1.45));e.add(lo(),`#3a3e46`,{scale:[.2,.03,.05]},r);for(let t of[-1,1])e.add(q(18),`#4a4e56`,{pos:[t*.06,0,.035],rot:[Math.PI/2,0,0],scale:[.04,.07,.04]},r),e.add(q(18),`#c8302a`,{pos:[t*.06,0,.072],rot:[Math.PI/2,0,0],scale:[.032,.006,.032]},r),e.add(J(.18,5,18),`#8a8e98`,{pos:[t*.06,0,.07],scale:[.038,.038,.03]},r);e.add(lo(),`#e8c22a`,{pos:[-.27,-.06,-.03],scale:[.03,.06,.07]}),e.add(lo(),t,{pos:[-.272,-.06,-.03],scale:[.032,.02,.072]}),e.add(q(5),`#9aa0aa`,{pos:[-.275,.06,-.06],rot:[-.2,0,.1],scale:[.004,.2,.004]}),e.add(K(6,4),`#9aa0aa`,{pos:[-.285,.16,-.08],scale:.009});let i=Y(e,{top:.16,sit:{kind:`band`,rim:[-.14,.238]}}),a=new Je({color:`#ff3a2a`}),o=new N(new s(.012,8,6),a);return o.position.set(-.29,-.03,0),o.castShadow=!1,i.group.add(o),i.materials.push(a),i.update=e=>{o.visible=Math.floor(e*2.5)%3!=0},i}function No(){let e=new z,t=`#f8d030`,n=new x(0,-.2,-.015),r=ho(e,n,new x(.315,.285,.31),1.05,.15,t,`#e0b020`,`#f0c428`,.07);for(let i of[-1,1]){let a=r.at([i*.45,.85,-.05],.97);Ro(e,e=>e<5?t:`#1e1e22`,[a.x,a.y,a.z],.065,.44,7,.35,[0,0,i],[i*.5,1,-.05]);let o=r.at([i*.72,-.35,.62],1.005),s=o.clone().sub(n).normalize();e.add(new lt(1,1,1,20),`#e83a2a`,fo(o,s,[.05,.006,.05]))}for(let[t,i]of[[.5,.12],[.15,.1]]){let a=r.at([0,t,-1],1.005);e.add(K(12,6),`#7a4a1a`,fo(a,a.clone().sub(n).normalize(),[i,.006,.035]))}return Y(e,{top:.45,sit:{kind:`hood`,rim:[-.2,.315,.31],open:r.open}})}function Po(){let e=new z,t=`#c0c6d0`;e.add(q(24,.6,1),t,{pos:[0,.035,0],scale:[.075,.08,.075]}),e.add(J(.12,4,24),`#9aa0aa`,{pos:[0,.075,0],rot:[Math.PI/2,0,0],scale:[.046,.046,.05]}),e.add(q(20,.5,1),t,{pos:[0,.325,0],scale:[.05,.05,.05]});let n=1.4,r=Y(e,{top:.36*n,sit:{kind:`brim`,rim:[-.005*n,.075*n]}});r.group.scale.setScalar(n);let i=e=>.044+Math.sin((e-.078)/.226*Math.PI)*.018-(e-.078)/.226*.02,a=[];for(let e=0;e<=12;e++){let t=.078+e/12*.226;a.push(new R(i(t),t))}mo(r,new b(a,24),`#9a4ae0`,.5);let o=St(`#ff8a2a`,.9);r.materials.push(o);let c=new s(1,12,10),l=[0,1,2,3].map(e=>{let t=new N(c,o);return t.castShadow=!1,r.group.add(t),{m:t,speed:.35+e*.13,phase:e*1.7,size:.016+e%2*.008}});return r.update=e=>{for(let{m:t,speed:n,phase:r,size:a}of l){let o=.1+(Math.sin(e*n+r)+1)/2*.18,s=i(o)-a-.004;t.position.set(Math.sin(e*.3+r)*s*.5,o,Math.cos(e*.4+r)*s*.5);let c=Math.abs(Math.cos(e*n+r));t.scale.set(a*(1-c*.2),a*(1+c*.5),a*(1-c*.2))}},r}function Fo(){let e=new z,t=.165,n=.15,r=bt(13);for(let t=0;t<26;t++){let n=r()*Math.PI*2,i=Math.sqrt(r())*.075;e.add(K(6,4),[`#e8c86a`,`#c86a4a`,`#6a9ad8`,`#f4f0e8`][t%4],{pos:[Math.sin(n)*i,.012+r()*.012,Math.cos(n)*i],scale:.014})}e.add(q(24),`#d8c8a0`,{pos:[0,.008,0],scale:[.078,.012,.078]});for(let t=0;t<3;t++)Ro(e,()=>t%2?`#3a9a4a`:`#4eb05a`,[-.04+t*.012,.015,-.03+t*.01],.012,.13-t*.02,5,.8*(t%2?1:-1),[0,0,1]);e.add(J(.12,6,32),`#d8eef8`,{pos:[0,n+Math.cos(.6)*t,0],rot:[Math.PI/2,0,0],scale:[Math.sin(.6)*t,Math.sin(.6)*t,.15]}),e.add(q(24),`#cfe6f2`,{pos:[0,0,0],scale:[.072,.008,.072]});let i=Y(e,{top:.315,sit:{kind:`brim`,rim:[-.005,.075]}}),a=mo(i,new s(t,30,16,0,Math.PI*2,.6,Math.PI-.6-.45),`#e0f2ff`,.25);a.position.y=n;let o=mo(i,new s(.161,30,14,0,Math.PI*2,.95,Math.PI-.95-.45),`#5aaee8`,.38);o.position.y=n;let l=mo(i,new Oe(Math.sin(.95)*.161,30).rotateX(-Math.PI/2),`#8ad0f4`,.35);l.position.y=n+Math.cos(.95)*.161;let u=new z;u.add(K(14,10),`#f4821e`,{scale:[.03,.04,.06]}),u.add(uo(8),`#f8a040`,{pos:[0,0,-.075],rot:[-Math.PI/2,0,0],scale:[.005,.035,.045]}),u.add(K(8,6),`#f8a040`,{pos:[0,.04,-.005],scale:[.005,.022,.026]});for(let e of[-1,1])u.add(K(8,6),`#121218`,{pos:[e*.022,.01,.04],scale:.008}),u.add(K(8,6),`#f8a040`,{pos:[e*.03,-.015,.015],rot:[0,e*.6,0],scale:[.005,.015,.02]});let d=new c;i.group.add(d);let f=po(i,u,_t());return d.add(f),i.update=e=>{let t=e*.9;d.position.set(Math.sin(t)*.07,.13999999999999999+Math.sin(e*1.3)*.02,Math.cos(t)*.07),d.rotation.y=t+Math.PI/2,f.rotation.y=Math.sin(e*9)*.15},i}var K=(e,t)=>new s(1,e,t),Io=(e,t)=>new s(1,e,t,0,Math.PI*2,0,Math.PI/2),q=(e,t=1,n=1)=>new lt(t,n,1,e),J=(e,t,n)=>new k(1,e,t,n);function Lo(e=1,t=.45){let n=new st;for(let r=0;r<10;r++){let i=r%2==0?e:e*t,a=r/10*Math.PI*2+Math.PI/2;r===0?n.moveTo(Math.cos(a)*i,Math.sin(a)*i):n.lineTo(Math.cos(a)*i,Math.sin(a)*i)}n.closePath();let r=new re(n,{depth:.25*e,bevelEnabled:!1});return r.translate(0,0,-.125*e),r}function Ro(e,t,n,r,i,a,o,s=[-1,0,0],c=[0,1,0]){let l=new x(...n),u=new x(...c).normalize(),d=new x(...s).normalize(),f=i/a;for(let n=0;n<a;n++){let i=r*(1-n/a),s=r*(1-(n+1)/a),c=new O().setFromUnitVectors(new x(0,1,0),u),p=l.clone().addScaledVector(u,f/2),m=new lt(Math.max(s,.004),i,f*1.08,20,1,n<a-1);e.add(m,t(n),new I().compose(p,c,new x(1,1,1))),m.dispose(),l=l.addScaledVector(u,f),u=u.applyAxisAngle(d,o/a).normalize()}return[l.x,l.y,l.z]}function zo(e,t,n,r,i,a,o,s=28){let c=[],l=new x(...e),u=new x(...o).normalize(),d=new x(...a).normalize(),f=new x(0,1,0),p=e=>(e+.5)**1.6,m=0;for(let e=0;e<r;e++)m+=p(e);for(let e=0;e<=r;e++)c.push({at:l.clone(),q:new O().setFromUnitVectors(f,u)}),l=l.clone().addScaledVector(u,n/r),u=u.clone().applyAxisAngle(d,i*p(e)/m).normalize();let h=ss(new lt(0,1,1,s,r,!0),e=>{let n=Math.round((e.y+.5)*r),i=c[n];return e.set(e.x*t,0,e.z*t).applyQuaternion(i.q).add(i.at)}),g=c[r].at;return{geo:h,tip:[g.x,g.y,g.z]}}function Y(e,t,n=ht()){let r=new c,i=e.mesh(n,{cast:!0,receive:!1});return r.add(i),{group:r,solid:[{mesh:i,material:n}],materials:[n],...t,top:t.top,sit:t.sit}}function Bo(){let e=new z,t=`#f6ead8`;e.add(Io(22,9),`#d8504a`,{pos:[0,-.13,-.01],scale:[.3,.2,.3]}),e.add(q(28),`#b83c38`,{pos:[0,-.13,-.01],scale:[.305,.085,.305]});for(let t=0;t<18;t++){let n=t/18*Math.PI*2;e.add(q(5),`#c8443f`,{pos:[Math.sin(n)*.307,-.13,-.01+Math.cos(n)*.307],scale:[.012,.08,.012]})}e.add(J(.12,5,28),t,{pos:[0,-.04,-.01],rot:[Math.PI/2,0,0],scale:[.278,.278,.12]}),e.add(K(12,9),t,{pos:[0,.095,-.01],scale:.075});for(let n=0;n<5;n++){let r=n/5*Math.PI*2;e.add(K(7,5),t,{pos:[Math.cos(r)*.04,.1+n%2*.02,-.01+Math.sin(r)*.04],scale:.045})}return Y(e,{top:.17,sit:{kind:`snug`,rim:[-.17,.3]}})}function Vo(){let e=new z,t=[`#f39ab5`,`#fbf8f2`,`#f6d55c`,`#c7a3e8`,`#f39ab5`,`#fbf8f2`],n=.215,r=-.07;e.add(J(.1,6,28),`#5f9e47`,{pos:[0,r,0],rot:[Math.PI/2+.12,0,0],scale:[n,n,.2]});let i=.12;for(let a=0;a<6;a++){let o=a/6*Math.PI*2+.3,s=Math.sin(o)*n,c=Math.cos(o)*n,l=r+Math.cos(o)*Math.sin(i)*n*.9+.02,u=new x(Math.sin(o),.6,Math.cos(o)).normalize(),d=new O().setFromUnitVectors(new x(0,0,1),u),f=new x(1,0,0).applyQuaternion(d),p=new x(0,1,0).applyQuaternion(d);for(let n=0;n<5;n++){let r=n/5*Math.PI*2,i=new x(s,l,c).addScaledVector(f,Math.cos(r)*.03).addScaledVector(p,Math.sin(r)*.03);e.add(K(6,4),t[a],new I().compose(i,d,new x(.026,.026,.01)))}e.add(K(6,4),`#f2b234`,new I().compose(new x(s,l,c).addScaledVector(u,.008),d,new x(.016,.016,.012)));let m=o+Math.PI/6,h=new O().setFromEuler(new L(.3,m,.6));e.add(K(6,4),`#78b85a`,new I().compose(new x(Math.sin(m)*.225,r+Math.cos(m)*Math.sin(i)*n*.9+.005,Math.cos(m)*.225),h,new x(.038,.012,.02)))}return Y(e,{top:.04,sit:{kind:`ring`,rim:[-.07,.215]}})}function Ho(){let e=new z,t=[`#f06a9a`,`#5ec4c8`,`#f6d55c`,`#f06a9a`,`#5ec4c8`,`#f6d55c`],n=.32,r=.12,i=t.length;for(let a=0;a<i;a++){let o=r*(1-a/i),s=r*(1-(a+1)/i);e.add(new lt(Math.max(s,.004),o,n/i,22,1,a<i-1),t[a],{pos:[0,-.03+n/i*(a+.5),0]})}e.add(J(.18,6,28),`#fbf8f2`,{pos:[0,-.03,0],rot:[Math.PI/2,0,0],scale:[r,r,.16]}),e.add(K(12,9),`#fbf8f2`,{pos:[0,.31000000000000005,0],scale:.04});for(let t=0;t<5;t++)e.add(K(8,6),`#fbf8f2`,{pos:[Math.sin(t*1.9)*.025,.31000000000000005+Math.cos(t*1.3)*.02,Math.cos(t*1.9)*.025],scale:.025});for(let t of[-1,1])e.add(q(6),`#e8e0d0`,{pos:[t*.13,-.11,.02],rot:[0,0,t*.12],scale:[.004,.16,.004]});return Y(e,{top:.35,sit:{kind:`perch`,rim:[-.03,.12]}})}function Uo(){let e=new z,t=`#3a4ab0`;e.add(q(32),t,{pos:[0,-.04,0],scale:[.27,.018,.27]}),e.add(J(.4,6,36),`#2e3b94`,{pos:[0,-.04,0],rot:[Math.PI/2,0,0],scale:[.27,.27,.03]}),e.add(q(28),`#e8c26a`,{pos:[0,-.005,0],scale:[.165,.045,.165]}),Ro(e,e=>e%2?t:`#3646a6`,[0,-.03,0],.16,.46,7,1.1,[1,0,0]);let n=Lo(1);for(let[t,r,i,a]of[[.06,.08,.12,.03],[-.08,.15,.08,.022],[.03,.22,.07,.018],[-.1,.04,.08,.02]]){let o=new O().setFromUnitVectors(new x(0,0,1),new x(t,.2,i).normalize());e.add(n,`#f6d55c`,new I().compose(new x(t,r,i),o,new x(a,a,a)))}return n.dispose(),e.add(J(.28,6,18),`#f6d55c`,{pos:[.11,.03,.06],rot:[0,1,.6],scale:[.03,.03,.03]}),Y(e,{top:.4,sit:{kind:`brim`,rim:[-.03,.165]}})}function Wo(){let e=new z,t=`#26222a`;e.add(q(36),t,{pos:[0,-.035,0],scale:[.21,.016,.21]}),e.add(J(.35,6,36),t,{pos:[0,-.03,0],rot:[Math.PI/2,0,0],scale:[.21,.21,.04]}),e.add(q(32,1.08,1),t,{pos:[0,.085,0],scale:[.13,.24,.13]}),e.add(q(32),`#3a3540`,{pos:[0,.207,0],scale:[.14,.006,.14]}),e.add(q(32),`#a8303a`,{pos:[0,-.002,0],scale:[.134,.05,.134]});let n=[.1,0,.09];for(let t of[-1,1])e.add(K(10,7),`#a8303a`,{pos:[n[0]+t*.022,n[1],n[2]],rot:[0,.8,t*.4],scale:[.026,.017,.012]});return e.add(K(8,6),`#8a2430`,{pos:n,scale:.012}),Y(e,{top:.22,sit:{kind:`brim`,rim:[-.035,.13]}})}function Go(){let e=new z,t=`#e8b83a`,n=.17;e.add(Io(16,6),`#8a2030`,{pos:[0,-.04,0],scale:[n*.95,.09,n*.95]});let r=[new R(.158,-.05),new R(.17600000000000002,-.05),new R(.18200000000000002,.025),new R(.164,.025),new R(.158,-.05)],i=new b(r,30);e.add(i,t),i.dispose(),e.add(J(.3,4,30),`#f2c94a`,{pos:[0,-.05,0],rot:[Math.PI/2,0,0],scale:[.17400000000000002,.17400000000000002,.04]});let a=[`#d8303c`,`#3a6ad8`,`#3aa860`];for(let n=0;n<6;n++){let r=n/6*Math.PI*2,i=Math.sin(r)*.17200000000000001,o=Math.cos(r)*.17200000000000001;e.add(new xe(1,1,12),t,{pos:[i,.06,o],scale:[.034,.075,.03]}),e.add(K(7,5),`#fbf8f2`,{pos:[Math.sin(r)*.17400000000000002,.105,Math.cos(r)*.17400000000000002],scale:.016});let s=r+Math.PI/6;e.add(K(8,6),a[n%3],{pos:[Math.sin(s)*.18200000000000002,-.015,Math.cos(s)*.18200000000000002],scale:[.02,.022,.012],rot:[0,s,0]})}return Y(e,{top:.13,sit:{kind:`perch`,rim:[-.05,.17]}})}function Ko(){let e=new z,t=`#2e2438`,n=new b([new R(.001,-.03),new R(.18,-.03),new R(.3,-.05),new R(.34,-.07),new R(.345,-.06),new R(.3,-.035),new R(.18,-.015),new R(.001,-.015)],40);e.add(n,t),n.dispose(),Ro(e,e=>e%2?t:`#342a40`,[0,-.02,0],.15,.42,7,1.4,[0,0,1]),e.add(q(30),`#7a4ab0`,{pos:[0,.02,0],scale:[.143,.05,.143]});for(let[t,n,r,i]of[[0,.042,.06,.01],[0,-.002,.06,.01],[-.026,.02,.01,.054],[.026,.02,.01,.054]])e.add(new j(1,1,1),`#e8c26a`,{pos:[t,n,.145],scale:[r,i,.012]});return Y(e,{top:.38,sit:{kind:`brim`,rim:[-.02,.15]}})}function qo(){let e=new c,t=new ke({color:`#ffe9a0`,emissive:`#ffd85a`,emissiveIntensity:1.4,roughness:.3,metalness:.2}),n=new Je({color:`#fff2b8`,transparent:!0,opacity:.28,depthWrite:!1,blending:2}),r=new N(new k(.17,.022,10,40),t),i=new N(new k(.17,.055,8,40),n);for(let e of[r,i])e.rotation.x=Math.PI/2;r.castShadow=!1,i.castShadow=!1;let a=new c;return a.position.y=.13,a.rotation.x=-.15,a.add(r,i),e.add(a),{group:e,solid:[],materials:[t,n],top:.19,sit:{kind:`float`,rim:[0,.17]},update:e=>{a.position.y=.13+Math.sin(e*2.1)*.018,a.rotation.z=Math.sin(e*1.3)*.06,n.opacity=.24+Math.sin(e*3.2)*.06}}}function Jo(e,t,n,r,i,a){let o=new x(Math.sin(r)*Math.cos(i)*e,a+Math.sin(i)*t,Math.cos(r)*Math.cos(i)*n);return{p:o,n:new x(o.x/(e*e),(o.y-a)/(t*t),o.z/(n*n)).normalize()}}function Yo(){let e=new z,t=`#c8302c`,n=`#221c20`;e.add(Io(24,10),t,{pos:[0,-.13,-.01],scale:[.3,.2,.3]});for(let t=0;t<8;t++){let r=new s(1,3,10,t/8*Math.PI*2,Math.PI/8,0,Math.PI/2);e.add(r,n,{pos:[0,-.13,-.01],scale:[.303,.203,.303]}),r.dispose()}for(let[t,r]of[[-.075,.287],[-.01,.235]])e.add(J(.09,5,32),n,{pos:[0,t,-.01],rot:[Math.PI/2,0,0],scale:[r,r,.12]});e.add(q(30),n,{pos:[0,-.13,-.01],scale:[.307,.085,.307]});for(let t=0;t<20;t++){let n=t/20*Math.PI*2;e.add(q(5),`#3a3036`,{pos:[Math.sin(n)*.309,-.13,-.01+Math.cos(n)*.309],scale:[.011,.08,.011]})}e.add(K(12,9),t,{pos:[0,.095,-.01],scale:.07});for(let r=0;r<6;r++){let i=r/6*Math.PI*2;e.add(K(7,5),r%2?t:n,{pos:[Math.cos(i)*.042,.1+r%2*.02,-.01+Math.sin(i)*.042],scale:.042})}return Y(e,{top:.17,sit:{kind:`snug`,rim:[-.17,.3]}})}function Xo(){let e=new z,t=`#f2c230`,n=`#d6a41c`;e.add(Io(24,10),t,{pos:[0,-.07,-.005],scale:[.2,.17,.21]});for(let t=0;t<4;t++)e.add(J(.05,4,24),n,{pos:[0,-.07,-.005],rot:[0,t*Math.PI/4,0],scale:[.2,.171,.05]});e.add(q(26),n,{pos:[0,-.06,-.005],scale:[.203,.02,.213]});let r=new b([new R(.001,-.06),new R(.19,-.06),new R(.28,-.1),new R(.32,-.13),new R(.322,-.115),new R(.28,-.085),new R(.19,-.045),new R(.001,-.045)],40);e.add(r,t,{pos:[0,0,-.03],scale:[1,1,1.18]}),r.dispose(),e.add(J(.25,5,40),n,{pos:[0,-.125,-.03],rot:[Math.PI/2,0,0],scale:[.318,.318*1.18,.03]});for(let t of[-1,1])e.add(q(6),`#8a6a1a`,{pos:[t*.19,-.15,.02],rot:[0,0,t*.1],scale:[.006,.18,.006]});return Y(e,{top:.11,sit:{kind:`brim`,rim:[-.07,.2,.21],tilt:.35}})}function Zo(){let e=new z,t=`#fbf8f2`,n=`#e2b23a`,r=new st;r.moveTo(-.16,0),r.lineTo(-.16,.14),r.quadraticCurveTo(-.15,.3,0,.44),r.quadraticCurveTo(.15,.3,.16,.14),r.lineTo(.16,0),r.closePath();let i=new re(r,{depth:.22,bevelEnabled:!0,bevelThickness:.015,bevelSize:.012,bevelSegments:2,curveSegments:14});i.translate(0,0,-.11),e.add(i,t,{pos:[0,-.09,0]}),i.dispose(),e.add(new j(1,1,1),n,{pos:[0,-.06,0],scale:[.35,.06,.255]}),e.add(new j(1,1,1),n,{pos:[0,.1,.122],scale:[.05,.3,.012]}),e.add(new j(1,1,1),n,{pos:[0,.1,-.122],scale:[.05,.3,.012]}),e.add(new j(1,1,1),`#c8302c`,{pos:[0,.2,.13],scale:[.016,.09,.006]}),e.add(new j(1,1,1),`#c8302c`,{pos:[0,.215,.13],scale:[.06,.016,.006]});for(let r of[-1,1])e.add(new j(1,1,1),t,{pos:[r*.07,-.2,-.13],rot:[.1,0,0],scale:[.05,.22,.01]}),e.add(new j(1,1,1),n,{pos:[r*.07,-.31,-.141],rot:[.1,0,0],scale:[.056,.025,.012]});return Y(e,{top:.36,sit:{kind:`brim`,rim:[-.06,.175,.13]}})}function Qo(){let e=new z,t=`#fdfbf6`;e.add(q(30),t,{pos:[0,0,0],scale:[.17,.13,.17]});for(let t=0;t<16;t++){let n=t/16*Math.PI*2;e.add(q(5),`#e9e4da`,{pos:[Math.sin(n)*.17,0,Math.cos(n)*.17],scale:[.008,.125,.008]})}e.add(K(20,12),t,{pos:[0,.14,0],scale:[.22,.12,.22]});for(let n=0;n<7;n++){let r=n/7*Math.PI*2;e.add(K(12,8),n%2?t:`#f6f2ea`,{pos:[Math.sin(r)*.13,.16+n%3*.01,Math.cos(r)*.13],scale:[.11,.09,.11]})}return Y(e,{top:.25,sit:{kind:`brim`,rim:[-.065,.17]}})}function $o(){let e=new z,t=`#2a2428`;e.add(Io(24,10),t,{pos:[0,-.04,0],scale:[.155,.16,.165]}),e.add(q(36),t,{pos:[0,-.04,0],scale:[.21,.014,.22]}),e.add(J(.3,6,36),t,{pos:[0,-.035,0],rot:[Math.PI/2,0,0],scale:[.21,.22,.05]}),e.add(q(30),`#4a3a32`,{pos:[0,-.012,0],scale:[.158,.035,.168]});for(let t of[-1,1])e.add(K(10,7),`#4a3a32`,{pos:[-.15+t*0,-.01,.04+t*.018],rot:[.4,0,0],scale:[.012,.014,.022]});return Y(e,{top:.13,sit:{kind:`brim`,rim:[-.04,.155,.165]}})}function es(){let e=new z,t=`#e8c97a`,n=`#cfa95a`,r=new b([new R(.001,-.05),new R(.17,-.05),new R(.3,-.07),new R(.38,-.1),new R(.385,-.085),new R(.3,-.055),new R(.17,-.035),new R(.001,-.035)],44);e.add(r,t),r.dispose();for(let t of[.22,.28,.34])e.add(J(.08,4,40),n,{pos:[0,-.052-(t-.2)*.25,0],rot:[Math.PI/2,0,0],scale:[t,t,.1]});e.add(Io(22,9),t,{pos:[0,-.04,0],scale:[.165,.13,.165]});for(let t=0;t<3;t++)e.add(J(.06,4,28),n,{pos:[0,0+t*.03,0],rot:[Math.PI/2,0,0],scale:[.16-t*.025,.16-t*.025,.1]});e.add(q(28),`#f08aa8`,{pos:[0,-.02,0],scale:[.168,.035,.168]});let i=.12;for(let t=0;t<10;t++){let n=t/10*Math.PI*2;e.add(K(6,4),`#f6c42c`,{pos:[i+Math.cos(n)*.035,0+Math.sin(n)*.035,.11],rot:[0,.8,n],scale:[.026,.011,.008]})}return e.add(K(8,6),`#6a4224`,{pos:[i,0,.115],scale:[.022,.022,.012]}),Y(e,{top:.1,sit:{kind:`brim`,rim:[-.04,.165]}})}function ts(){let e=new z,t=`#4a78b8`,n=[.3,.2,.31],r=new I().compose(new x(0,-.14,-.01),new O().setFromEuler(new L(-.12,0,0)),new x(1,1,1)),i=(e,t=new O,n=new x(1,1,1))=>r.clone().multiply(new I().compose(e,t,n)),a=(e,t,n)=>new O().setFromEuler(new L(e,t,n));e.add(Io(24,10),t,i(new x,void 0,new x(...n)));for(let t=0;t<30;t++){let r=Math.asin(Math.sin(.12)+(t+.5)/30*(Math.sin(1.35)-Math.sin(.12))),{p:a,n:o}=Jo(n[0]+.002,n[1]+.002,n[2]+.002,t*2.39996,r,0);e.add(K(7,5),`#fbf6ee`,i(a,new O().setFromUnitVectors(new x(0,0,1),o),new x(.019,.019,.005)))}e.add(new xe(1,1,3),t,i(new x(0,-.06,-.29),a(Math.PI+.3,Math.PI/6,0),new x(.12,.13,.03)));let{p:o}=Jo(n[0],n[1],n[2],Math.PI,.3,0);e.add(K(10,8),t,i(o.clone().add(new x(0,0,-.012)),void 0,new x(.042,.036,.034)));for(let n of[-1,1])e.add(K(10,8),t,i(o.clone().add(new x(n*.045,-.045,-.02)),a(.25,0,n*.55),new x(.026,.07,.02)));return Y(e,{top:.08,sit:{kind:`snug`,rim:[-.14,.3,.31]}})}function ns(){let e=new z,t=`#3f8a46`;e.add(K(22,12),t,{pos:[0,-.03,.01],scale:[.17,.11,.24]}),e.add(new xe(1,1,18),t,{pos:[0,-.01,.25],rot:[Math.PI/2,0,0],scale:[.07,.12,.05]}),e.add(K(18,8),`#2f6e36`,{pos:[0,-.06,-.16],rot:[.6,0,0],scale:[.17,.05,.12]}),e.add(J(.12,5,30),`#2f6e36`,{pos:[0,-.07,.01],rot:[Math.PI/2,0,0],scale:[.172,.242,.12]});let n=new O().setFromEuler(new L(-.9,0,-.35));return e.add(K(12,6),`#d8343a`,new I().compose(new x(.15,.07,-.06),n,new x(.024,.2,.006))),e.add(q(5),`#f6efe0`,new I().compose(new x(.15,.07,-.06),n,new x(.004,.36,.004))),Y(e,{top:.2,sit:{kind:`brim`,rim:[-.03,.17,.24]}})}function rs(){let e=new z,t=`#f8f6f0`;e.add(q(32),`#1f2d4f`,{pos:[0,-.02,0],scale:[.17,.07,.17]}),e.add(q(36,1,.82),t,{pos:[0,.035,-.01],scale:[.22,.045,.23]}),e.add(q(36),t,{pos:[0,.06,-.01],scale:[.222,.012,.232]}),e.add(J(.2,5,32),`#e2b23a`,{pos:[0,.008,0],rot:[Math.PI/2,0,0],scale:[.172,.172,.06]});let n=new lt(1,1,1,24,1,!1,-Math.PI/2,Math.PI);e.add(n,`#14141a`,{pos:[0,-.055,.1],rot:[.35,0,0],scale:[.16,.012,.13]}),n.dispose();let r=.172;return e.add(J(.25,4,14),`#e2b23a`,{pos:[0,0,r],scale:[.018,.018,.02]}),e.add(new j(1,1,1),`#e2b23a`,{pos:[0,-.025,r],scale:[.007,.04,.006]}),e.add(new j(1,1,1),`#e2b23a`,{pos:[0,-.045,r],scale:[.034,.007,.006]}),Y(e,{top:.08,sit:{kind:`brim`,rim:[-.055,.17]}})}function is(){let e=new z,t=`#2f9a4a`;e.add(q(36),t,{pos:[0,-.035,0],scale:[.23,.016,.23]}),e.add(J(.3,6,36),t,{pos:[0,-.03,0],rot:[Math.PI/2,0,0],scale:[.23,.23,.04]}),e.add(q(32,1.12,1),t,{pos:[0,.08,0],scale:[.135,.22,.135]}),e.add(q(32),`#257a3a`,{pos:[0,.19,0],scale:[.15,.006,.15]}),e.add(q(32),`#1e1a1e`,{pos:[0,0,0],scale:[.14,.055,.14]});for(let[t,n,r,i]of[[0,.024,.07,.012],[0,-.024,.07,.012],[-.03,0,.012,.06],[.03,0,.012,.06]])e.add(new j(1,1,1),`#f2c94c`,{pos:[t,n,.142],scale:[r,i,.012]});for(let t=0;t<3;t++){let n=t/3*Math.PI*2+Math.PI/2;e.add(K(8,6),`#4cc35a`,{pos:[.1+Math.cos(n)*.022,.06+Math.sin(n)*.022,.1],rot:[0,.8,0],scale:[.022,.022,.007]})}return e.add(q(5),`#3a8a3a`,{pos:[.1,.03,.1],rot:[0,0,.3],scale:[.004,.04,.004]}),Y(e,{top:.2,sit:{kind:`brim`,rim:[-.035,.135]}})}function as(){let e=new z,t=`#3e4a45`,n=`#c9a24f`,r=`#24282a`;e.add(q(36),t,{pos:[0,-.035,0],scale:[.21,.016,.21]}),e.add(J(.3,6,36),t,{pos:[0,-.03,0],rot:[Math.PI/2,0,0],scale:[.21,.21,.04]}),e.add(q(32,1.06,1),t,{pos:[0,.045,0],scale:[.14,.16,.14]}),e.add(q(32),`#48554f`,{pos:[0,.126,0],scale:[.149,.006,.149]}),e.add(q(32),n,{pos:[0,-.008,0],scale:[.143,.04,.143]});let i=[0,.068,.149],a=(e,t,n=0)=>[i[0]+e,i[1]+t,i[2]+n];e.add(q(26),`#f6efe0`,{pos:i,rot:[Math.PI/2,0,0],scale:[.046,.01,.046]}),e.add(J(.18,5,26),n,{pos:a(0,0,.004),scale:[.048,.048,.035]});for(let t=0;t<12;t++){let n=t/12*Math.PI*2;e.add(new j(1,1,1),r,{pos:a(Math.sin(n)*.036,Math.cos(n)*.036,.006),rot:[0,0,-n],scale:[.004,t%3?.006:.011,.004]})}for(let[t,n]of[[Math.PI/3,.034],[-Math.PI/3,.024]])e.add(new j(1,1,1),r,{pos:a(Math.sin(t)*n/2,Math.cos(t)*n/2,.008),rot:[0,0,-t],scale:[.005,n,.004]});e.add(K(8,6),n,{pos:a(0,0,.009),scale:.006});let o=[-.148,.06,-.01];e.add(q(24),n,{pos:o,rot:[0,0,Math.PI/2],scale:[.045,.012,.045]});for(let t=0;t<10;t++){let r=t/10*Math.PI*2;e.add(new j(1,1,1),n,{pos:[o[0],o[1]+Math.cos(r)*.05,o[2]+Math.sin(r)*.05],rot:[r,0,0],scale:[.012,.016,.014]})}e.add(q(14),`#8a6a2a`,{pos:[o[0]-.004,o[1],o[2]],rot:[0,0,Math.PI/2],scale:[.016,.012,.016]});let s=new O().setFromUnitVectors(new x(0,1,0),new x(.55,.35,.75).normalize());return e.add(q(14,1,1.25),r,new I().compose(new x(.15,-.005,.12),s,new x(.022,.04,.022))),e.add(q(14),`#bfe3f0`,new I().compose(new x(.15,-.005,.12).addScaledVector(new x(.55,.35,.75).normalize(),.021),s,new x(.023,.004,.023))),e.add(q(12),n,{pos:[0,.14,0],scale:[.022,.026,.022]}),e.add(q(12),`#e2c06a`,{pos:[0,.155,0],scale:[.026,.008,.026]}),e.add(J(.18,6,22),n,{pos:[0,.185,0],scale:[.027,.027,.035]}),Y(e,{top:.21,sit:{kind:`brim`,rim:[-.035,.14]}})}function os(e){let t=e.getIndex();for(let e=0;e<t.count;e+=3){let n=t.getX(e+1);t.setX(e+1,t.getX(e+2)),t.setX(e+2,n)}return e}function ss(e,t){let n=e.getAttribute(`position`),r=new x;for(let e=0;e<n.count;e++){let i=t(r.fromBufferAttribute(n,e));n.setXYZ(e,i.x,i.y,i.z)}return e}function cs(){let e=new z,t=[`#e2423c`,`#f4c430`,`#3a78d8`,`#4cae4c`],n=`#fbf8f2`;for(let n=0;n<4;n++){let r=new s(1,7,9,Math.PI/4+n*Math.PI/2,Math.PI/2,0,Math.PI/2);e.add(r,t[n],{pos:[0,-.12,-.01],scale:[.27,.19,.28]}),r.dispose()}let r=new k(1,.035,4,20,Math.PI);for(let t of[Math.PI/4,3*Math.PI/4])e.add(r,n,{pos:[0,-.12,-.01],rot:[0,Math.PI+t,0],scale:[.274,.193,.28]});r.dispose(),e.add(J(.08,5,32),n,{pos:[0,-.12,-.01],rot:[Math.PI/2,0,0],scale:[.272,.282,.25]}),e.add(q(14),n,{pos:[0,.074,-.01],scale:[.032,.02,.032]}),e.add(q(8),`#c8c2b8`,{pos:[0,.1,-.01],scale:[.009,.05,.009]});let i=new z;i.add(K(10,7),t[0],{scale:[.026,.02,.026]});for(let e of[-1,1])i.add(K(12,6),e<0?t[2]:t[1],{pos:[e*.092,0,0],rot:[e*.4,0,0],scale:[.085,.013,.036]});let a=Y(e,{top:.15,sit:{kind:`snug`,rim:[-.12,.27,.28]}}),o=ht(),c=i.mesh(o,{cast:!0,receive:!1});return c.position.set(0,.128,-.01),a.group.add(c),a.solid.push({mesh:c,material:o}),a.materials.push(o),a.update=e=>{c.rotation.y=e*7+Math.sin(e*.9)*1.6},a}function ls(){let e=new z,t=new x(0,-.2,-.015),n=new x(.31,.27,.3),r=1.28,i=new O().setFromEuler(new L(Math.PI/2+.55,0,0)),a=new x(0,.8,-.6).normalize(),o=new x(0,.5,-.85).normalize(),c=e=>{let r=e.clone().normalize(),i=r.clone().multiply(n).multiplyScalar(e.length()),s=Math.max(0,(r.dot(a)-.5)/.5);i.addScaledVector(o,.22*s*s);let c=Math.max(0,-r.y)**2*(.5-.5*r.z);i.x*=1+.12*c,i.z*=1+.12*c,i.y-=.08*c;let l=-.3;return i.y<l&&(i.y=l+(i.y-l)*.3),e.copy(i.add(t))};for(let[t,n,a]of[[1,`#2f2a38`,!1],[.93,`#141118`,!0]]){let o=new s(t,24,12,0,Math.PI*2,r,Math.PI-r).applyQuaternion(i);e.add(ss(a?os(o):o,c),n),o.dispose()}let l=new k(Math.sin(r)*.965,.06,6,36).rotateX(Math.PI/2).translate(0,Math.cos(r)*.965,0).applyQuaternion(i);return e.add(ss(l,c),`#3d3648`),l.dispose(),Y(e,{top:.15,sit:{kind:`hood`,rim:[-.2,.31,.3],open:[0,-.52,.85,.35]}})}function us(){let e=new z,t=[`#6e1420`,`#8a1a26`,`#a8202c`,`#c42834`,`#d8343c`,`#e84a4c`],n=new k(1,.06,5,20,Math.PI*.56).rotateZ(Math.PI*.22);e.add(n,`#2a2026`,{pos:[0,-.22,.03],rot:[.55,0,0],scale:[.268,.205,.2]}),n.dispose();for(let n of[-1,1]){let r=[n*.064,-.06,.145];e.add(K(12,7),t[0],{pos:[r[0],r[1]+.016,r[2]],scale:[.06,.026,.06]}),Ro(e,e=>t[e],r,.053,.18,6,1.2,[0,0,n],[n*.65,1,.3])}return Y(e,{top:.12,sit:{kind:`perch`,rim:[-.06,.16],among:!0}},_t())}function ds(){let e=new z,t=[`#e8b83a`,`#d49a24`,`#f4cd5c`],n=`#c8302c`,r=.222,i=e=>new x(Math.sin(e)*r,-.075-Math.cos(e)*.02,Math.cos(e)*r),a=K(5,4);for(let n of[-1,1]){let r=[];for(let o=0;o<=8;o++){let s=n*(Math.PI-.1-o/8*(Math.PI-.1-.32)),c=i(s);r.push(c);let l=i(s-n*.01).sub(c).normalize(),u=new x(Math.sin(s),0,Math.cos(s)),d=o===8?[0]:[.62,-.62];for(let[n,r]of d.entries()){let i=l.clone().multiplyScalar(Math.cos(r)).add(new x(0,Math.sin(r),0)).addScaledVector(u,.22).normalize(),s=u.clone().addScaledVector(i,-u.dot(i)).normalize(),d=new I().makeBasis(new x().crossVectors(i,s),i,s);d.setPosition(c.clone().addScaledVector(i,.036)),e.add(a,t[(o+n)%3],d.multiply(new I().makeScale(.025,.048,.007)))}}let o=new Ee(r),s=new g(o,18,.008,4,!1);e.add(s,`#a8741c`),s.dispose()}a.dispose();let o=i(Math.PI).add(new x(0,0,-.012));e.add(K(8,6),n,{pos:o.toArray(),scale:[.018,.018,.014]});for(let t of[-1,1])e.add(K(8,6),n,{pos:[o.x+t*.03,o.y+.008,o.z],rot:[0,0,t*.35],scale:[.028,.017,.01]}),e.add(new j(1,1,1),`#a82424`,{pos:[o.x+t*.018,o.y-.042,o.z-.004],rot:[.15,0,t*.3],scale:[.016,.066,.004]});return Y(e,{top:.04,sit:{kind:`ring`,rim:[-.075,.222]}})}function fs(){let e=new z,t=`#25212b`,n=`#f6f0e2`,r=e=>((1+Math.cos(3*e))/2)**2,i=e=>{let t=Math.atan2(e.x,e.z),n=r(t),i=Math.hypot(e.x,e.z),a=i<=.16?i:.16+(i-.16)*(.5+1*n),o=e.y<=-.035?e.y:-.035+(e.y+.035)*(1-.5*n);return e.set(Math.sin(t)*a,o,Math.cos(t)*a)},a=[[.15,-.05],[.235,-.052],[.258,-.04],[.268,0],[.277,.08],[.272,.093],[.26,.087],[.25,0],[.24,-.032],[.15,-.035]].map(([e,t])=>new R(e,t)),o=new b(a,48);e.add(ss(o,i),t),o.dispose();let s=[];for(let e=0;e<48;e++){let t=e/48*Math.PI*2;s.push(i(new x(Math.sin(t)*.268,.093,Math.cos(t)*.268)))}let c=new g(new Ee(s,!0,`catmullrom`,.3),72,.011,4,!0);e.add(c,`#e2b23a`),c.dispose(),e.add(Io(22,8),t,{pos:[0,-.04,0],scale:[.168,.15,.172]}),e.add(q(28),`#1a171e`,{pos:[0,-.03,0],scale:[.17,.02,.174]});let l=new I().compose(new x(0,.055,.142),new O().setFromUnitVectors(new x(0,0,1),new x(0,.45,1).normalize()),new x(1.3,1.3,1.3));for(let t of[-1,1]){let r=t*.8,i=new x(-Math.sin(r),Math.cos(r),0),a=new x(Math.cos(r),Math.sin(r),0);e.add(q(6),n,{pos:[0,0,.004],rot:[0,0,r],scale:[.0055,.07,.0055]},l);for(let t of[-1,1])for(let r of[-1,1]){let o=i.clone().multiplyScalar(t*.035).addScaledVector(a,r*.0055);e.add(K(5,4),n,{pos:[o.x,o.y,.004],scale:.0075},l)}}e.add(K(10,8),n,{pos:[0,.006,.008],scale:[.024,.022,.012]},l),e.add(K(8,6),n,{pos:[0,-.013,.008],scale:[.014,.011,.01]},l);for(let t of[-1,1])e.add(K(6,4),`#1a1618`,{pos:[t*.009,.004,.018],scale:[.0065,.0075,.004]},l);return Y(e,{top:.11,sit:{kind:`brim`,rim:[-.04,.168,.172]}})}function ps(){let e=new z;e.add(q(28,.93,1),`#f2e8d4`,{pos:[0,-.075,0],scale:[.215,.09,.215]}),e.add(J(.22,5,24),`#e8dcc4`,{pos:[0,-.115,0],rot:[Math.PI/2,0,0],scale:[.222,.222,.12]});let t=.345,n=.215,r=e=>new R(t*Math.sin(e),-.035+n*Math.cos(e)),i=[];for(let e=0;e<=10;e++)i.push(r(1.72*(1-e/10)));i[i.length-1].x=.001;let a=new b(i,36);e.add(a,`#d8343a`),a.dispose();let o=r(1.72),s=new b([new R(.19,-.03),new R(.27,-.05),o],36);e.add(s,`#ecdcbc`),s.dispose();for(let t=0;t<18;t++){let n=t/18*Math.PI*2;e.add(new j(1,1,1),`#d2bf98`,{pos:[Math.sin(n)*.265,-.05,Math.cos(n)*.265],rot:[0,n,0],scale:[.004,.006,.13]})}let c=K(6,4);for(let i=0;i<15;i++){let a=Math.acos(Math.cos(.1)-(i+.5)/15*(Math.cos(.1)-Math.cos(1.45))),o=i*2.39996,s=r(a),l=new x(Math.sin(a)/t*Math.sin(o),Math.cos(a)/n,Math.sin(a)/t*Math.cos(o)).normalize(),u=.03+i*7%5*.006,d=new x(Math.sin(o)*s.x,s.y,Math.cos(o)*s.x).addScaledVector(l,.002);e.add(c,`#fbf8f2`,new I().compose(d,new O().setFromUnitVectors(new x(0,0,1),l),new x(u,u,u*.3)))}return c.dispose(),Y(e,{top:.19,sit:{kind:`brim`,rim:[-.12,.215]}})}function ms(){let e=new z,t=new I().makeRotationX(.16),n=new b([[.236,-.136],[.25,-.143],[.263,-.13],[.268,-.1],[.258,-.068],[.242,-.06],[.224,-.066],[.236,-.136]].map(([e,t])=>new R(e,t)),40);e.add(n,`#1fb3a6`,{},t),n.dispose();for(let n=0;n<30;n++){let r=n/30*Math.PI*2;e.add(q(4),`#189e93`,{pos:[Math.sin(r)*.262,-.1,Math.cos(r)*.262],rot:[0,r,0],scale:[.006,.06,.006]},t)}return e.add(new lt(1,1,1,40,1,!0),`#fbf8f2`,{pos:[0,-.1,0],scale:[.272,.024,.272]},t),Y(e,{top:0,sit:{kind:`band`,rim:[-.14,.236]}})}function hs(){let e=new z,t=`#e0b44e`,n=`#f6ecd2`,r=new b([[.001,-.03],[.12,-.03],[.146,-.016],[.154,.008],[.142,.012],[.13,-.01],[.001,-.014]].map(([e,t])=>new R(e,t)),32);e.add(r,t),r.dispose(),e.add(J(.25,5,32),`#f0c862`,{pos:[0,.01,0],rot:[Math.PI/2,0,0],scale:[.149,.149,.04]}),e.add(J(.28,5,20),`#f0c862`,{pos:[.19,0,0],scale:[.042,.042,.036]}),e.add(q(16),`#c0923e`,{pos:[0,.018,0],scale:[.056,.064,.056]}),e.add(J(.25,5,18),t,{pos:[0,.05,0],rot:[Math.PI/2,0,0],scale:[.058,.058,.07]}),e.add(q(16),n,{pos:[0,.12,0],scale:[.042,.18,.042]}),e.add(J(.3,4,16),`#fbf4e2`,{pos:[0,.207,0],rot:[Math.PI/2,0,0],scale:[.04,.04,.035]}),e.add(q(5),`#2a2220`,{pos:[0,.222,0],scale:[.005,.028,.005]});let i=new x(Math.sin(.5),0,Math.cos(.5));e.add(K(8,6),n,{pos:[i.x*.041,.18,i.z*.041],rot:[0,.5,0],scale:[.013,.035,.009]}),e.add(K(8,6),n,{pos:[i.x*.045,.145,i.z*.045],scale:.013});let a=Y(e,{top:.36,sit:{kind:`perch`,rim:[-.03,.12]}}),o=new z,l=new b([[.001,0],[.022,.012],[.031,.036],[.026,.066],[.013,.094],[.001,.12]].map(([e,t])=>new R(e,t)),12);o.add(l,`#ffa23a`),l.dispose(),o.add(K(10,7),`#fff2a8`,{pos:[0,.033,0],scale:[.032,.034,.032]});let u=new Je({vertexColors:!0}),d=o.mesh(u,{cast:!1,receive:!1}),f=new Je({color:`#ff9a40`,transparent:!0,opacity:.2,depthWrite:!1,blending:2}),p=new N(new s(.052,12,9),f);p.position.y=.045,p.castShadow=!1;let m=new c;return m.position.y=.232,m.add(d,p),a.group.add(m),a.materials.push(u,f),a.update=e=>{let t=1+Math.sin(e*11)*.07+Math.sin(e*17.3)*.04;d.scale.set(1/Math.sqrt(t),t,1/Math.sqrt(t)),d.rotation.z=Math.sin(e*3.7)*.08+Math.sin(e*9.1)*.03,f.opacity=.17+Math.sin(e*13)*.04},a}function gs(){let e=new z,t=`#24365f`,n=`#c8302c`;e.add(q(32),n,{pos:[0,-.03,0],scale:[.19,.055,.195]}),e.add(q(36,1,.9),t,{pos:[0,.03,-.004],scale:[.225,.065,.231]}),e.add(Io(28,5),t,{pos:[0,.0625,-.004],scale:[.225,.03,.231]}),e.add(J(.035,5,36),n,{pos:[0,.0625,-.004],rot:[Math.PI/2,0,0],scale:[.226,.232,.226]});let r=new lt(1,1,1,24,1,!1,-Math.PI/2,Math.PI);e.add(r,`#15151a`,{pos:[0,-.055,.12],rot:[.22,0,0],scale:[.18,.014,.15]}),r.dispose();let i=new k(1,.04,4,18,Math.PI*2/3).rotateZ(Math.PI/6);e.add(i,`#1e1e24`,{pos:[0,-.042,0],rot:[Math.PI/2,0,0],scale:[.194,.199,.16]}),i.dispose();for(let t of[-1,1])e.add(K(8,6),`#e2b23a`,{pos:[t*.168,-.042,.1],scale:.011});let a=new I().compose(new x(0,.03,.217),new O().setFromEuler(new L(.2,0,0)),new x(1,1,1));e.add(q(20),n,{rot:[Math.PI/2,0,0],scale:[.03,.008,.03]},a),e.add(q(20),`#fbf8f2`,{pos:[0,0,.002],rot:[Math.PI/2,0,0],scale:[.024,.008,.024]},a),e.add(new j(1,1,1),n,{pos:[0,0,.006],scale:[.028,.019,.004]},a),e.add(new j(1,1,1),`#fbf8f2`,{pos:[0,0,.008],scale:[.022,.013,.003]},a);for(let t of[-1,1])e.add(new j(1,1,1),n,{pos:[t*.0055,.002,.0098],rot:[0,0,t*.6],scale:[.014,.0028,.002]},a);return Y(e,{top:.1,sit:{kind:`brim`,rim:[-.0575,.19,.195]}})}function _s(){let e=new z,t=`#7a3eb0`,n=`#eebc3a`,r=`#d4343c`;for(let[n,i]of[[-Math.PI/2,t],[Math.PI/2,r]]){let t=new s(1,12,9,n,Math.PI,0,Math.PI/2);e.add(t,i,{pos:[0,-.12,-.01],scale:[.28,.18,.29]}),t.dispose()}e.add(q(30),n,{pos:[0,-.12,-.01],scale:[.287,.05,.297]}),e.add(J(.12,5,30),`#d8a42e`,{pos:[0,-.095,-.01],rot:[Math.PI/2,0,0],scale:[.287,.297,.1]});let i=[[[-.09,0,0],[-.7,1,0],[0,0,1],t,`#6a34a0`],[[.09,0,0],[.7,1,0],[0,0,-1],r,`#bc2c36`],[[0,0,-.09],[0,1,-.7],[-1,0,0],n,`#d8a42e`]];for(let[t,n,r,a,o]of i){let i=Ro(e,e=>e%2?o:a,t,.085,.42,7,2.2,r,n);e.add(J(.3,3,8),`#c8962a`,{pos:[i[0],i[1]-.012,i[2]],scale:[.012,.012,.012]}),e.add(K(9,7),`#f4c94a`,{pos:[i[0],i[1]-.04,i[2]],scale:.03}),e.add(J(.2,3,12),`#b8862a`,{pos:[i[0],i[1]-.046,i[2]],rot:[Math.PI/2,0,0],scale:[.026,.026,.02]})}return Y(e,{top:.14,sit:{kind:`snug`,rim:[-.145,.287,.297]}})}function vs(e,t){let n=e.index?e.toNonIndexed():e,r=n.getAttribute(`position`),i=new $e;i.setAttribute(`position`,r.clone());let a=new Float32Array(r.count*3),o=new Me,s=new x,c=new x;for(let e=0;e+2<r.count;e+=3){s.set(0,0,0);for(let t=0;t<3;t++)s.add(c.fromBufferAttribute(r,e+t));o.set(t(e/3,s.divideScalar(3)));for(let t=0;t<3;t++)a.set([o.r,o.g,o.b],(e+t)*3)}return i.setAttribute(`color`,new Ke(a,3)),n!==e&&n.dispose(),i}function ys(e,t,n){let r=new O().setFromUnitVectors(new x(0,1,0),t.clone().sub(e).normalize());return new I().compose(e.clone().add(t).multiplyScalar(.5),r,new x(n,e.distanceTo(t),n))}function bs(e,t,n,r,i,a=1){let o=[];for(let r=0;r<=6;r++)o.push(new R(e+(t-e)*r/6,-n/2));o.push(new R(t+n*.45,0));for(let r=6;r>=0;r--)o.push(new R(e+(t-e)*r/6,n/2));return ss(new b(o,r),n=>{let r=Ge.clamp((Math.hypot(n.x,n.z)-e)/(t-e),0,1.05);return n.y+=i(n.x,n.z,r),n.z*=a,n})}function xs(e,t,n,r,i,a){let o=new z;o.add(q(6),n,{pos:[0,-i/2,0],scale:[.0055,i+.004,.0055]}),o.add(K(10,7),r,{pos:[0,-i-a*.1,0],scale:[a*.2,a*.22,a*.2]}),o.add(q(16,.45,1),n,{pos:[0,-i-a*.62,0],scale:[a*.3,a,a*.3]});for(let e=0;e<6;e++){let t=e/6*Math.PI*2;o.add(q(4),n,{pos:[Math.sin(t)*a*.2,-i-a*1.12,Math.cos(t)*a*.2],rot:[Math.cos(t)*.2,0,-Math.sin(t)*.2],scale:[a*.05,a*.16,a*.05]})}let s=ht(),l=o.mesh(s,{cast:!0,receive:!1}),u=new c;return u.position.set(...t),u.add(l),e.group.add(u),e.solid.push({mesh:l,material:s}),e.materials.push(s),u}var Ss=(e,t,n=1)=>{e.rotation.z=(Math.sin(t*1.9)*.12+Math.sin(t*3.1)*.04)*n,e.rotation.x=Math.sin(t*1.4+1)*.08*n};function Cs(){let e=new z,t=`#1b191d`,n=new I().compose(new x(.03,-.07,.02),new O().setFromEuler(new L(-.1,0,-.3)),new x(1,1,1)),r=.27,i=.152;e.add(q(30,.12/i,1),`#b51d2f`,{pos:[0,r/2,0],scale:[i,r,i]},n);let a=new k(.11499999999999999,.006,4,30).rotateX(Math.PI/2);e.add(a,`#a01a2a`,{pos:[0,.269,0]},n),a.dispose(),e.add(q(14),t,{pos:[0,.278,0],scale:[.026,.018,.026]},n);let o=new x(.088,.276,.075);e.add(q(6),t,ys(new x(0,.28400000000000003,0),o,.0065),n);let s=Y(e,{top:.2,sit:{kind:`perch`,rim:[-.07,.152]}}),c=xs(s,o.clone().add(new x(.006,0,.006)).applyMatrix4(n).toArray(),t,`#2c282e`,.05,.085);return s.update=e=>Ss(c,e),s}function ws(){let e=new z,t=[`#c4a578`,`#94744c`,`#5c4430`],n=[`#dcc39a`,`#b08e62`,`#7a5c40`],r=[0,-.11,-.005],i=[.262,.205,.275],a=e=>gt({pos:r,scale:[i[0]*e,i[1]*e,i[2]*e]}),o=(e,n,r,i=0,a=0,o=t)=>{let s=Math.atan2(e.x,e.z)+Math.PI-i,c=Math.acos(Ge.clamp(e.y/e.length(),-1,1))-a,l=Math.floor(s/n+1e3),u=Math.floor(c/r+1e3);return o[l%2+u%2]},c=new s(1,32,10,0,Math.PI*2,0,Math.PI/2);e.addColored(vs(c,(e,t)=>o(t,Math.PI/8,Math.PI/10)),a(1)),c.dispose(),e.add(J(.03,4,36),t[2],{pos:r,rot:[Math.PI/2,0,0],scale:[i[0]+.002,i[2]+.002,.25]});for(let[n,i]of[[1,.29],[-1,.26]]){let a=ss(new lt(1,1,1,20,1,!1,-Math.PI/2,Math.PI),e=>e.set(e.x*.215,e.y*.014-.035*e.z*e.z-.012*e.x*e.x,e.z*i)),o={pos:[0,r[1]+.008,r[2]+n*.12],rot:[n*.12,n>0?0:Math.PI,0]};e.add(a,t[1],o),a.dispose();let s=new Ee(Array.from({length:11},(e,t)=>{let n=-Math.PI/2+t/10*Math.PI,r=Math.sin(n),a=Math.cos(n);return new x(r*.215,-.035*a*a-.012*r*r,a*i)})),c=new g(s,20,.008,4,!1);e.add(c,t[2],o),c.dispose()}let l=.6,u=[.34,1.5];for(let c of[-1,1]){let d=c>0?Math.PI:0,f=new s(1,6,8,d-l,l*2,u[0],u[1]-u[0]);e.addColored(vs(f,(e,t)=>o(t,l*2/3,(u[1]-u[0])/4,d-l+Math.PI/2+.001,u[0]+.001,n)),a(1.06)),f.dispose();let p=1.065,m=(e,t)=>new x(-Math.cos(e)*Math.sin(t)*i[0]*p,r[1]+Math.cos(t)*i[1]*p,r[2]+Math.sin(e)*Math.sin(t)*i[2]*p),h=[];for(let e=0;e<5;e++)h.push(m(d-l+e/4*l*2,u[0]));for(let e=1;e<5;e++)h.push(m(d+l,u[0]+e/4*(u[1]-u[0])));for(let e=1;e<5;e++)h.push(m(d+l-e/4*l*2,u[1]));for(let e=1;e<4;e++)h.push(m(d-l,u[1]-e/4*(u[1]-u[0])));let _=new g(new Ee(h,!0,`catmullrom`,.2),36,.0075,4,!0);e.add(_,t[2]),_.dispose(),e.add(q(5),t[2],ys(m(d,u[0]+.05),new x(c*.02,r[1]+i[1]*1.06+.008,r[2]),.006))}let d=new x(0,r[1]+i[1]*1.06+.012,r[2]);e.add(K(8,6),t[2],{pos:d.toArray(),scale:[.02,.017,.02]});for(let n of[-1,1])e.add(K(10,6),t[2],{pos:[n*.034,d.y+.008,d.z],rot:[0,0,n*.45],scale:[.038,.019,.017]}),e.add(new j(1,1,1),t[2],{pos:[n*.012,d.y-.008,d.z+n*.03],rot:[n*.9,n*.4,0],scale:[.012,.004,.05]});return Y(e,{top:.12,sit:{kind:`snug`,rim:[-.11,.262,.275]}})}function Ts(){let e=new z,t=[`#f4f6f8`,`#dde2e7`,`#c3cad1`,`#e9edf0`,`#a9b2bb`,`#cfd5db`],n=bt(11),r=()=>t[Math.floor(n()*t.length)],i=e=>{let t=Math.max(0,(e.y+.07)/.34);return e.x+=.05*t*t,e.z-=.015*t,e},a=[[.198,-.07],[.186,-.03],[.165,.025],[.14,.08],[.11,.135],[.078,.185],[.047,.228],[.02,.258],[0,.27]].map(([e,t])=>new R(e,t)),o=ss(new b(a,15),i);mt(o,.032,5),e.addColored(vs(o,r)),o.dispose();let s=new k(.2,.024,5,22).rotateX(Math.PI/2).translate(0,-.066,0);mt(s,.03,9),e.addColored(vs(s,r)),s.dispose();let l=i(new x(0,.255,0));for(let t of[0,Math.PI]){let n=[];for(let e=0;e<=8;e++){let r=t+e*1.1;n.push(new x(l.x+Math.sin(r)*.01+e*.002,l.y+e*.011,l.z+Math.cos(r)*.01))}let i=new g(new Ee(n),16,.0065,4,!1);e.addColored(vs(i,r)),i.dispose()}let u=new fe(.024,1).translate(l.x+.018,l.y+.098,l.z);mt(u,.012,3),e.addColored(vs(u,r)),u.dispose();let d=new at({vertexColors:!0,flatShading:!0,specular:`#ffffff`,shininess:70,emissive:`#3a4048`}),f=new c,p=e.mesh(d,{cast:!0,receive:!1,crease:0});return f.add(p),{group:f,solid:[{mesh:p,material:d}],materials:[d],top:.36,sit:{kind:`brim`,rim:[-.07,.198]}}}function Es(){let e=new z,t=`#d9302c`,n=`#f8f6f0`,r=[0,-.12,-.01],i=[.265,.2,.278];for(let[a,o]of[[0,t],[Math.PI,n]]){let t=new s(1,14,9,a,Math.PI,0,Math.PI/2);e.add(t,o,{pos:r,scale:i}),t.dispose()}let a=new k(1,.03,4,20,Math.PI);e.add(a,`#c22a26`,{pos:r,scale:[i[0]+.003,i[1]+.003,.28]}),a.dispose(),e.add(J(.04,4,32),`#c22a26`,{pos:[r[0],r[1]+.012,r[2]],rot:[Math.PI/2,0,0],scale:[i[0],i[2],.25]}),e.add(q(14),t,{pos:[r[0],r[1]+i[1]+.004,r[2]],scale:[.03,.022,.03]});let o=ss(new lt(1,1,1,22,1,!1,-Math.PI/2,Math.PI),e=>e.set(e.x*.215,e.y*.016-.05*e.x*e.x,e.z*.29));e.add(o,t,{pos:[0,r[1]+.012,.105],rot:[.1,0,0]}),o.dispose();let{p:c,n:l}=Jo(i[0],i[1],i[2],0,.52,r[1]);c.z+=r[2];let u=new O().setFromUnitVectors(new x(0,0,1),l),d=(e,t)=>new lt(1,1,1,22,1,!1,e,t).rotateX(Math.PI/2),f=d(0,Math.PI*2);e.add(f,n,new I().compose(c.clone().addScaledVector(l,.002),u,new x(.062,.062,.01))),f.dispose();let p=d(Math.PI/2,Math.PI);return e.add(p,`#2fa84f`,new I().compose(c.clone().addScaledVector(l,.006).addScaledVector(new x(0,1,0).applyQuaternion(u),-.012),u,new x(.046,.046,.01))),p.dispose(),Y(e,{top:.09,sit:{kind:`snug`,rim:[-.12,.265,.278]}})}function Ds(){let e=new z,t=`#4c7656`,n=`#2b2328`,r=.44,i=-.04,a=e=>.128+.068*Math.max(0,(e-i)/r)**1.3,o=e=>{let t=Math.max(0,(e.y-i)/r),n=Math.atan2(e.x,e.z),a=1+.03*Math.sin(3*n+t*7)*t;return e.x*=a,e.z*=a,e.x+=.085*t*t-.02*Math.sin(t*Math.PI),e.z-=.025*t,e.y+=.04*t*t*(e.x/.2),e},s=bs(.1,.225,.016,44,(e,t,n)=>-.035+.055*n*n*(e*e)/(e*e+t*t+1e-6)-.006*n);e.add(s,t),s.dispose();let c=[];for(let e=0;e<=10;e++){let t=i+r*e/10;c.push(new R(a(t),t))}c.push(new R(a(.4)-.012,.406),new R(.001,.394));let l=ss(new b(c,32),o);e.add(l,t),l.dispose();let u=.085,d=ss(new b([[a(-.03)+.004,-.03],[a(-.02)+.011,-.02],[a(.07500000000000001)+.011,.07500000000000001],[a(u)+.003,u]].map(([e,t])=>new R(e,t)),32),o);e.add(d,`#df8a35`),d.dispose();for(let[t,n,r,i]of[[-.95,.21,`#8a4f8f`,.25],[2.5,.28,`#d8b456`,-.3]]){let s=o(new x(Math.sin(t)*(a(n)+.003),n,Math.cos(t)*(a(n)+.003))),c=new I().compose(s,new O().setFromEuler(new L(-.05,t,i,`YXZ`)),new x(1,1,1));e.add(new j(1,1,1),r,{scale:[.07,.065,.006]},c);for(let t=0;t<4;t++){let n=-.024+t*.016;for(let[t,r,i]of[[n,.03,0],[n,-.03,0],[.033,n,Math.PI/2],[-.033,n,Math.PI/2]])e.add(new j(1,1,1),`#f2e8d2`,{pos:[t,r,.004],rot:[0,0,i+.5],scale:[.009,.0028,.003]},c)}}let f=.22,p=o(new x(Math.sin(f)*(a(.03)+.0015),.03,Math.cos(f)*(a(.03)+.0015))),m=new I().compose(p,new O().setFromEuler(new L(.22,f,-.2,`YXZ`)),new x(1,1,1));e.add(new j(1,1,1),`#f6eedb`,{pos:[0,.07,0],scale:[.095,.14,.003]},m);let h=.016,g=.03,_=.0046,v={a:[0,g/2,!0],b:[h/2,g/4,!1],c:[h/2,-.03/4,!1],d:[0,-.03/2,!0],e:[-.016/2,-.03/4,!1],f:[-.016/2,g/4,!1],g:[0,0,!0]},y=.095;for(let[t,r]of[[-.039,`bc`],[-.016,`abcdef`],[.028,`acdefg`]])for(let i of r){let[r,a,o]=v[i];e.add(new j(1,1,1),n,{pos:[t+r,y+a,.002],scale:o?[.01876,_,.002]:[_,.017759999999999998,.002]},m)}e.add(new j(1,1,1),n,{pos:[.006,y,.002],rot:[0,0,-.45],scale:[_,.036,.002]},m);for(let[t,n]of[[.128,.06],[.12,.044]])e.add(new j(1,1,1),`#8a7e74`,{pos:[0,t,.002],scale:[n,.0022,.002]},m);return Y(e,{top:.44,sit:{kind:`brim`,rim:[-.04,.128]}})}function Os(){let e=new z,t=`#8a5a34`,n=`#3e2618`,r=[[.152,-.04],[.156,0],[.156,.04],[.152,.08],[.143,.115],[.128,.145],[.105,.165],[.07,.178],[.035,.183],[.001,.184]].map(([e,t])=>new R(e,t)),i=ss(new b(r,40),e=>{let t=Ge.smoothstep(e.y,.03,.17);e.y-=.06*t*Math.exp(-((e.x/.055)**2))*(.75+.25*(e.z/.16))+.02*t*Math.max(0,e.z/.16);let n=Math.max(0,e.z/.156);return e.x*=1-.3*n*n*t,e.x*=.95,e.z*=1.1,e});e.add(i,t),i.dispose(),e.add(q(40,1.01,1),n,{pos:[0,-.005,0],scale:[.15125,.04,.1756]}),e.add(new j(1,1,1),`#d8b45a`,{pos:[.153,-.005,.03],rot:[0,1.4,0],scale:[.03,.03,.006]}),e.add(new j(1,1,1),n,{pos:[.155,-.005,.03],rot:[0,1.4,0],scale:[.018,.018,.007]});let a=(e,t,n)=>{let r=e*e/(e*e+t*t+1e-6);return-.035+.15*n*n*r*r-.03*n*n*(1-r)},o=bs(.12,.33,.016,48,a,1.12);e.add(o,t),o.dispose();let s=[];for(let e=0;e<40;e++){let t=e/40*Math.PI*2,n=Math.sin(t)*.336,r=Math.cos(t)*.336;s.push(new x(n,a(n,r,1.03),r*1.12))}let c=new g(new Ee(s,!0),64,.008,4,!0);return e.add(c,`#6e4426`),c.dispose(),Y(e,{top:.17,sit:{kind:`brim`,rim:[-.04,.148,.172]}})}function ks(){let e=new z,t=new x(0,-.15,-.01),n=new x(.29,.235,.3),r=15*Math.PI/36,i=[.94,1.3],a=[Math.PI/2-r,r*2],o=[Math.PI/2+r,Math.PI*2-r*2],c=(r,i,a,o,c=1,l=36)=>{let u=new s(1,Math.max(4,Math.round(l*r[1]/(Math.PI*2))),Math.max(2,Math.round((a-i)*7)),r[0],r[1],i,a-i);e.add(u,o,{pos:t.toArray(),scale:[n.x*c,n.y*c,n.z*c]}),u.dispose()},l=[a[0],Math.PI*2];c(l,0,.5,`#e6eaf0`),c(l,.5,i[0],`#c0c8d2`),c(o,i[0],1.28,`#8e99a6`),c(o,1.28,1.66,`#b8c1cc`),c(a,i[0]-.02,i[1],`#15171d`,1.025);for(let r of[-1,1]){let i=Math.PI/2-1.22,a=new x(r*Math.cos(i)*n.x,t.y+Math.sin(i)*n.y,t.z-.03);e.add(q(22),`#8c96a2`,{pos:a.toArray(),rot:[0,0,Math.PI/2],scale:[.058,.03,.058]}),e.add(q(22),`#2a2e36`,{pos:[a.x+r*.016,a.y,a.z],rot:[0,0,Math.PI/2],scale:[.034,.004,.034]})}let u=Y(e,{top:.1,sit:{kind:`snug`,rim:[-.17,.29,.3]}},new at({vertexColors:!0,specular:`#ffffff`,shininess:90})),d=(i[0]+i[1])/2-.02,f=new s(1,24,1,a[0]+.12,a[1]-.24,d-.022,.044),p=new Je({color:`#ff3c46`}),m=new N(f,p);m.position.copy(t),m.scale.copy(n).multiplyScalar(1.032),m.castShadow=!1;let h=new Je({color:`#fff0e8`}),g=new N(new s(.014,10,7),h),_=new Je({color:`#ff5a5a`,transparent:!0,opacity:.35,depthWrite:!1,blending:2}),v=new N(new s(.032,10,7),_);g.add(v),g.castShadow=!1,v.castShadow=!1,g.scale.set(1.6,.8,.8),u.group.add(m,g),u.materials.push(p,h,_);let y=e=>{let r=1.04;g.position.set(-Math.cos(e)*Math.sin(d)*n.x*r+t.x,Math.cos(d)*n.y*r+t.y,Math.sin(e)*Math.sin(d)*n.z*r+t.z),g.rotation.y=e-Math.PI/2};return y(Math.PI/2),u.update=e=>y(Math.PI/2+Math.sin(e*2.2)*(r-.22)),u}function As(){let e=new z,t=`#f2661c`,n=`#f7f7f2`,r=.43,i=.15,a=.032,o=[[0,t],[.36,n],[.53,t],[.66,n],[.77,t],[1,t]];for(let t=0;t<o.length-1;t++){let[n,a]=o[t],s=o[t+1][0],c=new lt(i+-.118*s,i+-.118*n,r*(s-n),28,1,!0);e.add(c,a,{pos:[0,-.032+r*(n+s)/2,0]}),c.dispose()}e.add(J(.22,4,18),`#e85a14`,{pos:[0,.398,0],rot:[Math.PI/2,0,0],scale:[a,a,.03]}),e.add(q(16),`#4a1e08`,{pos:[0,.394,0],scale:[a*.95,.004,a*.95]});let s=e=>-.42*Math.max(0,e-.13)**1.3,c=[],l=[.001,.13,.19,.25,.3];for(let e of l)c.push(new R(e,-.044+s(e)));c.push(new R(.31,-.034+s(.31)));for(let e of[...l].reverse())c.push(new R(e,-.022+s(e)));let u=new b(c,4).rotateY(Math.PI/4);return e.add(u,`#1f1f24`),u.dispose(),e.add(q(28,1,1.12),`#2a2a30`,{pos:[0,-.012,0],scale:[.162,.02,.162]}),Y(e,{top:.4,sit:{kind:`brim`,rim:[-.032,.15]}})}function js(){let e=new z,t=`#f2bc3c`;e.add(Io(26,7),`#25242c`,{pos:[0,-.1,-.005],scale:[.232,.14,.242]}),e.add(J(.12,4,32),`#1c1b22`,{pos:[0,-.095,-.005],rot:[Math.PI/2,0,0],scale:[.233,.243,.15]});let n=.46;e.add(new j(1,1,1),`#2b2a33`,{pos:[0,.045,0],rot:[0,Math.PI/4,0],scale:[n,.018,n]}),e.add(new j(1,1,1),`#34333d`,{pos:[0,.0545,0],rot:[0,Math.PI/4,0],scale:[.43000000000000005,.002,.43000000000000005]}),e.add(q(14),t,{pos:[0,.061,0],scale:[.022,.012,.022]});let r=n/2*Math.SQRT2,i=new x(r-.004,.055999999999999994,0);e.add(q(6),t,ys(new x(0,.061,0),i,.006));let a=Y(e,{top:.07,sit:{kind:`snug`,rim:[-.1,.232,.242]}}),o=xs(a,[r+.006,.053,0],t,`#d8a028`,.05,.085);return a.update=e=>Ss(o,e+2,.8),a}function Ms(){let e=new z,t=e=>.9+.1*Math.sqrt(Math.abs(Math.cos(5*e))),n=(e,t)=>t>0?.045*Math.max(0,1-e/.4)**2:0,r=(e,r,i=0)=>{let a=Math.cos(r),o=.215*t(e)+i;return new x(Math.sin(e)*a*o,.08+Math.sin(r)*(.165+i)-n(a,r),Math.cos(e)*a*o)};for(let t=0;t<10;t++){let n=new s(1,3,10,Math.PI/2-Math.PI/10+t*Math.PI*2/10,Math.PI*2/10);e.add(ss(n,e=>r(Math.atan2(e.x,e.z),Math.asin(Ge.clamp(e.y,-1,1)))),t%2?`#ec7a1e`:`#f58c2a`),n.dispose()}let i=new Ee([[0,-.06,0],[.002,-.025,0],[.01,.008,-.004],[.03,.03,-.008],[.057,.036,-.01],[.076,.022,-.008]].map(([e,t,n])=>new x(e,.245+t,n))),a=new g(i,10,.024,7,!1);e.add(a,`#6b7a36`),a.dispose();let o=i.getPoint(1),c=i.getTangent(1);e.add(q(9),`#c8b47a`,new I().compose(o,new O().setFromUnitVectors(new x(0,1,0),c),new x(.022,.006,.022)));let l=-.75,u=r(l,1,.008),d=new O().setFromEuler(new L(.15,l-Math.PI/2,-.5,`YXZ`));e.add(K(10,6),`#4f9a3a`,new I().compose(u,d,new x(.075,.01,.045))),e.add(new j(1,1,1),`#3c7c2c`,new I().compose(u.clone().add(new x(0,.007,0)),d,new x(.12,.004,.004)));let f=[];for(let e=0;e<=14;e++){let t=e/14,n=t*Math.PI*3.2;f.push(new x(.02+.03*t+Math.cos(n)*.018*(1-t*.4),.225+Math.sin(n)*.018+t*.02,.02+t*.05))}let p=new g(new Ee(f),24,.0045,4,!1);e.add(p,`#5aa040`),p.dispose();let m=Y(e,{top:.29,sit:{kind:`perch`,rim:[-.04,.147]}}),_=[],v=e=>{let[t,n,r]=e,[i,a]=(n[0]-t[0])*(r[1]-t[1])-(n[1]-t[1])*(r[0]-t[0])>0?[n,r]:[r,n],o=(e,t)=>[(e[0]+t[0])/2,(e[1]+t[1])/2];_.push([t,o(t,i),o(t,a)],[o(t,i),i,o(i,a)],[o(t,a),o(i,a),a],[o(t,i),o(i,a),o(t,a)])},y=(e,t,n,r)=>{v([e,t,n]),v([e,n,r])},b=[];for(let e of[-1,1])b.push({pts:[[e*.13,.12],[e*.5,.1],[e*.3,.42]],centre:[e*.31,.21]});b.push({pts:[[-.08,-.06],[.08,-.06],[0,.08]],centre:[0,-.01]});let S=e=>{let t=[-1,-.8,-.6,-.46,-.26,-.1,.1,.26,.46,.6,.8,1],n=.66+e;for(let r=0;r<t.length-1;r++){let i=t[r],a=t[r+1],o=(i+a)/2,s=Math.abs(o)>.26&&Math.abs(o)<.46?.09:0,c=Math.abs(o)<.1?.09:0,l=t=>-.2+.13*t*t-(e?0:s)+e,u=t=>-.48+.4*t*t+(e?0:c)-e,d=i*n,f=a*n;y([d,u(i)],[f,u(a)],[f,l(a)],[d,l(i)])}};for(let e of b)v(e.pts.map(([t,n])=>[e.centre[0]+(t-e.centre[0])*1.22,e.centre[1]+(n-e.centre[1])*1.22]));S(.035);let ee=_.length;for(let e of b)v(e.pts);S(0);let C=(e,t)=>{let n=[];for(let i of e)for(let[e,a]of i)n.push(...r(e,a,t).toArray());let i=new $e;return i.setAttribute(`position`,new h(n,3)),i},w=new z,T=C(_.slice(0,ee),.003);w.add(T,`#8a3410`),T.dispose();let E=C(_.slice(ee),.0055);w.add(E,`#ffcf4a`),E.dispose();let te=new Je({vertexColors:!0}),D=w.mesh(te,{cast:!1,receive:!1,crease:0});return m.group.add(D),m.materials.push(te),m.update=e=>{let t=.86+Math.sin(e*9.3)*.06+Math.sin(e*15.1)*.05+Math.sin(e*2.3)*.03;te.color.setRGB(t,t*.96,t*.9)},m}function Ns(e,t,n,r,i,a,o=32){let c=new s(1,o,Math.max(2,Math.round((i-r)*7)),0,Math.PI*2,r,i-r);e.add(c,a,{pos:t,scale:n}),c.dispose()}function Ps(){let e=new z,t=[`#e2e6ea`,`#c2c8d0`,`#9aa2ae`],n=`#c8913a`,r=[`#a88a58`,`#c4a874`,`#d8c294`,`#e6d6b0`,`#efe4c8`,`#f6eedc`,`#fbf6ea`],i=[0,-.14,-.01],a=[.272,.215,.282];Ns(e,i,a,0,.62,t[0]),Ns(e,i,a,.62,1.12,t[1]),Ns(e,i,a,1.12,Math.PI/2,t[2]),e.add(q(36),n,{pos:[0,-.142,-.01],scale:[a[0]+.012,.055,a[2]+.012]});for(let t=0;t<16;t++){let n=t/16*Math.PI*2;e.add(K(6,4),`#e8b860`,{pos:[Math.sin(n)*(a[0]+.014),-.142,-.01+Math.cos(n)*(a[2]+.014)],scale:.011})}let o=new k(1,.07,5,24,Math.PI).rotateY(Math.PI/2);e.add(o,n,{pos:i,scale:[.2,a[1]+.006,a[2]+.006]}),o.dispose();for(let t of[-1,1]){let i=[t*.235,-.06,-.02];e.add(J(.3,6,18),n,{pos:i,rot:[0,0,t*1.25],scale:[.058,.058,.05]}),Ro(e,e=>r[e],i,.056,.27,7,1.7,[0,0,t],[t,.25,.12])}return Y(e,{top:.16,sit:{kind:`snug`,rim:[-.17,.284,.294]}},_t())}function Fs(){let e=new z,t=`#e8c46a`,n=`#d0a84a`,r=[`#d8343c`,`#2f9a4a`,`#f6d55c`,`#f8f6f0`],i=new b([[.152,-.04],[.15,.05],[.14,.14],[.122,.21],[.096,.26],[.064,.292],[.03,.31],[.001,.314]].map(([e,t])=>new R(e,t)),32);e.add(i,t),i.dispose(),e.add(q(32,.97,1),r[0],{pos:[0,.005,0],scale:[.153,.05,.153]});for(let[t,n,i]of[[.035,.149,r[3]],[.05,.146,r[1]]])e.add(J(.14,3,28),i,{pos:[0,t,0],rot:[Math.PI/2,0,0],scale:[n,n,.08]});e.add(J(.07,3,26),n,{pos:[0,.16,0],rot:[Math.PI/2,0,0],scale:[.136,.136,.1]});let a=(e,t,n)=>-.04-.025*n+.15*n**3.5,o=bs(.13,.42,.016,36,a);e.add(o,t),o.dispose();let s=.27;e.add(J(.1,3,32),n,{pos:[0,a(0,0,.14/.29)+.008,0],rot:[Math.PI/2,0,0],scale:[s,s,.08]});let c=[];for(let e=0;e<40;e++){let t=e/40*Math.PI*2;c.push(new x(Math.sin(t)*.426,a(0,0,1.02),Math.cos(t)*.426))}let l=new g(new Ee(c,!0),48,.012,4,!0);e.add(l,r[0]),l.dispose();for(let t=0;t<12;t++){let n=t/12*Math.PI*2,i=.185;e.add(K(5,3),r[t%3],{pos:[Math.sin(n)*i,a(0,0,.05499999999999999/.29)+.012,Math.cos(n)*i],scale:[.014,.006,.014]})}for(let t=0;t<12;t++){let n=(t+.5)/12*Math.PI*2,i=Math.sin(n)*.432,o=Math.cos(n)*.432,s=a(0,0,1.02);e.add(q(3),`#3a2a1a`,{pos:[i,s-.022,o],scale:[.003,.04,.003]}),e.add(K(6,4),r[(t+1)%3],{pos:[i,s-.05,o],scale:.018})}return Y(e,{top:.31,sit:{kind:`brim`,rim:[-.04,.152]}})}function Is(){let e=new z,t=`#6c1e36`;e.add(q(32),t,{pos:[0,-.095,-.005],scale:[.262,.032,.272]});let n=new L(.04,0,-.17),r=[.04,-.02,-.01];e.add(K(28,12),`#8a2a48`,{pos:r,rot:[n.x,n.y,n.z],scale:[.33,.092,.335]});let i=(e,t,i=0)=>{let a=1-e*e/(.33*.33)-t*t/(.335*.335);return new x(e,Math.sqrt(Math.max(0,a))*.092+i,t).applyEuler(n).add(new x(...r))};e.add(q(8,.7,1),t,{pos:i(0,0,.012).toArray(),rot:[0,0,-.17],scale:[.012,.028,.012]});for(let[t,r,a,o]of[[.14,.08,.034,`#3a7bd5`],[-.09,.15,.026,`#f6d55c`],[.05,-.17,.03,`#f8f6f0`],[-.16,-.06,.022,`#4cb860`]])e.add(K(8,4),o,{pos:i(t,r,-.006).toArray(),rot:[n.x,t*3,n.z],scale:[a,.009,a*.8]});let a=new x(-.27,-.12,.05),o=new x(-.245,.11,-.13),s=o.clone().sub(a).normalize(),c=o.clone().addScaledVector(s,.03);return e.add(q(8),`#c8343a`,ys(a,o,.011)),e.add(q(8),`#c8ccd4`,ys(o,c,.013)),e.add(q(8,.4,1),`#e8d8b0`,ys(c,c.clone().addScaledVector(s,.03),.012)),e.add(q(8,.1,1),`#3a7bd5`,ys(c.clone().addScaledVector(s,.03),c.clone().addScaledVector(s,.05),.0055)),Y(e,{top:.12,sit:{kind:`snug`,rim:[-.11,.262,.272]}})}function Ls(){let e=new z,t=`#a8b0bc`,n=new x(0,-.23,.015),r=.37,i=2.42,a=n.y+Math.cos(i)*r,o=Math.sin(i)*r;e.add(J(.22,8,36),`#f4f4f0`,{pos:[0,a-.02,n.z],rot:[Math.PI/2,0,0],scale:[o+.02,o+.02,.2]}),e.add(J(.16,6,36),t,{pos:[0,a+.012,n.z],rot:[Math.PI/2,0,0],scale:[o-.004,o-.004,.12]}),e.add(q(14),t,{pos:[.15,a-.03,n.z+o*.82],rot:[Math.PI/2-.3,0,0],scale:[.02,.04,.02]}),e.add(q(14),`#3a3e48`,{pos:[.15,a-.026,n.z+o*.82+.022],rot:[Math.PI/2-.3,0,0],scale:[.012,.008,.012]});for(let[t,r]of[[-.12,`#ff5a4a`],[-.07,`#5ad87a`]])e.add(K(8,6),r,{pos:[t,a-.03,n.z+o*.92+.028],scale:.013});for(let[t,r,i,a]of[[-.55,.62,.06,.02],[-.3,.38,.018,.018]]){let o=new x(Math.sin(t)*Math.cos(r),Math.sin(r),Math.cos(t)*Math.cos(r)),s=new O().setFromUnitVectors(new x(0,0,1),o);e.add(K(10,6),`#ffffff`,new I().compose(n.clone().addScaledVector(o,.372),s,new x(i,a,.004)))}let c=Y(e,{top:.15,sit:{kind:`hood`,rim:[-.2,.31,.31],clear:!0}}),l=new at({color:`#d8ecff`,specular:`#ffffff`,shininess:110,transparent:!0,opacity:.22,depthWrite:!1}),u=new N(new s(r,30,16,0,Math.PI*2,0,i),l);return u.position.copy(n),u.castShadow=!1,u.renderOrder=2,c.group.add(u),c.materials.push(l),c}function Rs(){let e=new z,t=[`#a07a56`,`#94704e`,`#ac8660`,`#9a7452`],n=bt(7),r=[0,-.12,-.005],i=[.272,.2,.282];e.add(Io(24,9),`#5a4436`,{pos:r,scale:i});for(let t=0;t<4;t++)e.add(J(.04,4,24),`#4c3a2e`,{pos:r,rot:[0,t*Math.PI/4,0],scale:[i[0]+.002,i[1]+.002,.05]});for(let[r,a,o,s]of[[-1.15,2.3,-.1,.1],[Math.PI-1.35,2.7,-.115,.075]]){let c=mt(new lt(1,1.03,1,22,2,!1,r,a),.025,5);e.addColored(vs(c,()=>t[Math.floor(n()*t.length)]),gt({pos:[0,o,-.005],scale:[i[0]+.035,s,i[2]+.035]})),c.dispose();let l=Math.round(a*7);for(let n=0;n<l;n++){let c=r+(n+.5)/l*a,u=mt(new fe(1,0),.25,20+n);e.add(u,t[n%t.length],{pos:[Math.sin(c)*(i[0]+.03),o+s/2,-.005+Math.cos(c)*(i[2]+.03)],rot:[n,c,0],scale:[.036,.026,.036]}),u.dispose()}}for(let a of[-1,1]){let o=mt(new s(1,12,8),.04,a>0?9:11);e.addColored(vs(o,()=>t[Math.floor(n()*t.length)]),gt({pos:[a*.268,-.08,-.02],rot:[0,0,a*.32],scale:[.045,.11,.13]})),o.dispose(),e.add(q(5),`#4a3424`,ys(new x(a*.275,-.02,-.02),new x(a*.03,r[1]+i[1]+.012,-.02),.005))}let a=r[1]+i[1]+.018;e.add(K(8,6),`#4a3424`,{pos:[0,a,-.02],scale:[.016,.013,.016]});for(let t of[-1,1])e.add(K(8,5),`#4a3424`,{pos:[t*.026,a+.004,-.02],rot:[0,0,t*.4],scale:[.028,.013,.012]});let o=Lo(1);return e.add(o,`#e2b23a`,{pos:[0,-.055,i[2]+.04],rot:[-.25,0,0],scale:.03}),o.dispose(),Y(e,{top:.1,sit:{kind:`snug`,rim:[-.15,.272,.282]}})}function zs(){let e=new z,t=`#fbf8f2`,{geo:n,tip:r}=zo([0,-.12,-.01],.27,.5,12,2,[.25,0,1],[0,1,-.1]);e.add(n,`#d6302f`),n.dispose();let i=mt(new k(1,.13,8,36),.03,2).rotateX(Math.PI/2);e.add(i,t,{pos:[0,-.13,-.01],scale:[.285,.3,.295]}),i.dispose();let a=mt(new fe(1,2),.18,4);e.add(a,t,{pos:[r[0],r[1]-.02,r[2]],scale:.065}),a.dispose();for(let t of[-1,1])e.add(K(8,4),`#2f7a3a`,{pos:[-.1+t*.035,-.11,.29],rot:[-.3,0,t*.5],scale:[.042,.018,.008]});for(let t=0;t<3;t++)e.add(K(8,6),`#c81e2a`,{pos:[-.1+(t-1)*.014,-.098+t%2*.012,.3],scale:.012});return Y(e,{top:.22,sit:{kind:`snug`,rim:[-.17,.285,.295]}})}function Bs(){let e=new z,t=`#2e2832`,n=new k(1,.06,5,20,Math.PI*.56).rotateZ(Math.PI*.22);e.add(n,t,{pos:[0,-.22,.03],rot:[.55,0,0],scale:[.268,.205,.2]}),n.dispose();for(let n of[-1,1]){let r=new x(n*.085,-.055,.14),i=new O().setFromEuler(new L(-.2,n*-.25,n*-.32)),a=(t,n,a,o=0)=>e.add(new xe(1,1,10),a,new I().compose(r.clone().add(new x(0,n[1]/2+o,t).applyQuaternion(i)),i,new x(...n)));a(0,[.065,.13,.026],t),a(.016,[.042,.09,.012],`#f29ab4`,-.005),e.add(K(6,4),`#fbf8f2`,new I().compose(r.clone().add(new x(0,.022,.026).applyQuaternion(i)),i,new x(.02,.012,.006))),e.add(K(10,5),t,{pos:[r.x,r.y+.005,r.z],scale:[.06,.018,.03]})}return Y(e,{top:.1,sit:{kind:`perch`,rim:[-.06,.16],among:!0}},_t())}function Vs(){let e=new z,t=`#25356a`,n=new I().makeRotationX(.16),r=new b([[.236,-.134],[.25,-.138],[.256,-.12],[.256,-.084],[.25,-.068],[.236,-.064],[.236,-.134]].map(([e,t])=>new R(e,t)),40);e.add(r,t,{},n),r.dispose();let i=new lt(.266,.266,.056,14,1,!0,-.42,.84);e.add(i,`#c4cad4`,{pos:[0,-.1,0]},n),i.dispose();for(let[t,r]of[[-.36,-.08],[.36,-.08],[-.36,-.12],[.36,-.12]])e.add(K(6,4),`#8a92a0`,{pos:[Math.sin(t)*.268,r,Math.cos(t)*.268],scale:.0065},n);let a=new k(1,.2,4,18,Math.PI*1.6);e.add(a,`#3a4250`,{pos:[0,-.1,.27],rot:[0,0,.6],scale:[.016,.016,.02]},n),a.dispose(),e.add(K(6,4),`#3a4250`,{pos:[0,-.1,.271],scale:.006},n),e.add(new xe(1,1,4),`#3a4250`,{pos:[.018,-.087,.27],rot:[0,0,-.8],scale:[.006,.026,.004]},n);let o=new x(0,-.1,-.255).applyMatrix4(n);e.add(K(10,7),t,{pos:o.toArray(),scale:[.03,.026,.022]});let s=Y(e,{top:0,sit:{kind:`band`,rim:[-.14,.236]}}),l=[];for(let e of[-1,1]){let n=new z,r=new x,i=new x(e*.35,-.55,-.75).normalize();for(let e=0;e<4;e++){let a=.06,o=new O().setFromUnitVectors(new x(0,-1,0),i);n.add(new j(1,1,1),e%2?`#2a3c76`:t,new I().compose(r.clone().addScaledVector(i,a/2),o,new x(.036-e*.003,a*1.06,.006))),r=r.addScaledVector(i,a),i=i.add(new x(0,-.35,0)).normalize()}let a=ht(),u=n.mesh(a,{cast:!0,receive:!1}),d=new c;d.position.copy(o),d.add(u),s.group.add(d),s.solid.push({mesh:u,material:a}),s.materials.push(a),l.push(d)}return s.update=e=>{l.forEach((t,n)=>{t.rotation.x=Math.sin(e*2.3+n*1.7)*.12+Math.sin(e*5.1+n)*.04,t.rotation.z=Math.sin(e*1.7+n*2.1)*.08})},s}function Hs(){let e=new z,t=[`#e6eaee`,`#c8ced6`,`#a4acb8`,`#7e8694`],n=[0,-.14,-.01],r=[.275,.225,.285];Ns(e,n,r,0,.55,t[0]),Ns(e,n,r,.55,1.1,t[1]),Ns(e,n,r,1.1,Math.PI/2,t[2]),e.add(J(.18,6,36),t[3],{pos:[0,-.15,-.01],rot:[Math.PI/2,0,0],scale:[r[0]+.006,r[2]+.006,.15]});let i=new k(1,.05,4,24,Math.PI).rotateY(Math.PI/2);e.add(i,t[1],{pos:n,scale:[.4,r[1]+.012,r[2]+.012]}),i.dispose();let a=[r[0]*1.06,r[1]*1.06,r[2]*1.06],o=new s(1,14,5,Math.PI/2-1.05,2.1,.32,.78);e.add(o,t[1],{pos:n,scale:a}),e.add(os(o),t[3],{pos:n,scale:[a[0]-.004,a[1]-.004,a[2]-.004]}),o.dispose();let c=new k(1,.035,4,10,.78).rotateZ(Math.PI/2-.32-.78).rotateY(-Math.PI/2);e.add(c,t[0],{pos:n,scale:[.4,a[1]+.006,a[2]+.006]}),c.dispose();let l=(e,t)=>{let{p:r,n:i}=Jo(a[0],a[1],a[2],e,t,n[1]);return r.z+=n[2],{p:r.addScaledVector(i,.003),q:new O().setFromUnitVectors(new x(0,0,1),i)}};for(let n of[-1,1]){let{p:r,q:i}=l(n*.3,.6);e.add(new j(1,1,1),`#2a2e36`,new I().compose(r,i,new x(.075,.012,.008))),e.add(q(14),t[3],{pos:[n*(a[0]+.004),-.1,0],rot:[0,0,Math.PI/2],scale:[.03,.02,.03]})}for(let t=0;t<4;t++){let{p:n}=l(.55+t%2*.13,.62+Math.floor(t/2)*.13);e.add(K(6,4),`#2a2e36`,{pos:n.toArray(),scale:.008})}let u=new x(0,n[1]+r[1]-.01,-.07);e.add(q(10),t[2],{pos:u.toArray(),rot:[-.4,0,0],scale:[.022,.05,.022]});for(let t=0;t<7;t++){let n=(t-3)*.16,r=new O().setFromEuler(new L(-.75-Math.abs(t-3)*.08,0,n)),i=.2-Math.abs(t-3)*.02,a=u.clone().add(new x(0,i*.9,0).applyQuaternion(r));e.add(K(10,7),t%2?`#f6efe4`:`#d02a34`,new I().compose(a,r,new x(.03,i,.022)))}return Y(e,{top:.24,sit:{kind:`snug`,rim:[-.17,.281,.291]}},_t())}function Us(){let e=new z,{geo:t}=zo([0,-.13,-.01],.278,.6,12,.75,[-1,0,0],[0,1,-.18]);e.add(t,`#d23a2e`),t.dispose(),e.add(J(.12,6,36),`#b02e24`,{pos:[0,-.13,-.01],rot:[Math.PI/2,0,0],scale:[.282,.292,.22]});let{p:n,n:r}=Jo(.24,.3,.25,1.15,.45,-.13),i=new O().setFromUnitVectors(new x(0,0,1),r);e.add(new j(1,1,1),`#7a5a3a`,new I().compose(n.clone().addScaledVector(r,.002),i.clone().multiply(new O().setFromEuler(new L(0,0,.2))),new x(.06,.055,.008)));for(let t=0;t<4;t++){let r=t/4*Math.PI*2+.2,a=new x(Math.cos(r)*.03,Math.sin(r)*.028,.005).applyQuaternion(i);e.add(new j(1,1,1),`#f2e6c8`,new I().compose(n.clone().add(a),i.clone().multiply(new O().setFromEuler(new L(0,0,r))),new x(.016,.004,.004)))}return Y(e,{top:.42,sit:{kind:`snug`,rim:[-.16,.278,.288]}})}function Ws(){let e=new z,t=`#86613e`,n=`#3a2618`,r=[[.15,-.04],[.153,0],[.152,.05],[.146,.09],[.132,.12],[.105,.138],[.07,.146],[.035,.149],[.001,.15]].map(([e,t])=>new R(e,t)),i=ss(new b(r,40),e=>{let t=Ge.smoothstep(e.y,.03,.14);e.y-=.05*t*Math.exp(-((e.x/.05)**2))*(.8+.2*(e.z/.15))+.015*t*Math.max(0,e.z/.15);let n=Math.max(0,e.z/.153);return e.x*=(1-.32*n*n*t)*.95,e.z*=1.1,e});e.add(i,t),i.dispose(),e.add(q(40,1.01,1),n,{pos:[0,-.008,0],scale:[.153*.95+.004,.036,.1723]});for(let t of[-1,1])e.add(K(8,5),n,{pos:[-.148,-.006,-.02+t*.016],rot:[0,0,.2],scale:[.006,.018,.014]});let a=(e,t,n)=>{let r=Math.hypot(e,t)+1e-6,i=e*e/(r*r);return-.035+n*n*(.02*i-.045*Math.max(0,t/r)**1.5+.03*Math.max(0,-t/r)**2)},o=bs(.12,.28,.014,48,a,1.1);e.add(o,t),o.dispose();let s=[];for(let e=0;e<40;e++){let t=e/40*Math.PI*2,n=Math.sin(t)*.28500000000000003,r=Math.cos(t)*.28500000000000003;s.push(new x(n,a(n,r,1.02),r*1.1))}let c=new g(new Ee(s,!0),60,.006,4,!0);return e.add(c,`#6e4e30`),c.dispose(),Y(e,{top:.15,sit:{kind:`brim`,rim:[-.04,.145,.168]}})}function Gs(){let e=new z,t=[`#ffc8de`,`#e4c8ff`,`#c4dcff`,`#c8f2e0`,`#fff0b8`],n=.34,r=3.6,i=ss(new lt(.003,.062,n,16,22,!1),e=>{let t=(e.y+n/2)/n,i=Math.atan2(e.x,e.z),a=.84+.16*Math.cos(2*(i-t*r*Math.PI*2));return e.x*=a,e.z*=a,e}),a=vs(i,(e,i)=>{let a=(i.y+n/2)/n,o=Math.atan2(i.x,i.z);return Math.cos(2*(o-a*r*Math.PI*2))>.2?`#fffaf0`:t[Math.min(t.length-1,Math.floor(a*t.length))]});i.dispose();let o=new x(0,-.035,.1),s=new O().setFromEuler(new L(.42,0,0)),c=new x(0,1,0).applyQuaternion(s);e.addColored(a,new I().compose(o.clone().addScaledVector(c,.18000000000000002),s,new x(1,1,1))),a.dispose(),e.add(J(.3,6,22),`#e8b83a`,new I().compose(o.clone().addScaledVector(c,.012),s.clone().multiply(new O().setFromEuler(new L(Math.PI/2,0,0))),new x(.068,.068,.05))),e.add(K(14,6),`#e8b83a`,new I().compose(o,s,new x(.074,.02,.074)));for(let[n,r]of[[-1.1,t[0]],[1.2,t[1]],[Math.PI,t[2]]]){let t=o.clone().add(new x(Math.sin(n)*.085,.006,Math.cos(n)*.065-.012)),i=new O().setFromEuler(new L(-.5,n,0));for(let n=0;n<5;n++){let a=n/5*Math.PI*2,o=t.clone().add(new x(Math.cos(a)*.018,Math.sin(a)*.018,0).applyQuaternion(i));e.add(K(6,4),r,new I().compose(o,i,new x(.016,.016,.007)))}e.add(K(6,4),`#f6c42c`,new I().compose(t.clone().add(new x(0,0,.005).applyQuaternion(i)),i,new x(.01,.01,.008))),e.add(K(6,4),`#78b85a`,{pos:[t.x+Math.sin(n+.5)*.03,t.y-.006,t.z+Math.cos(n+.5)*.025],rot:[.3,n+.5,.5],scale:[.026,.008,.012]})}let l=Y(e,{top:.32,sit:{kind:`brim`,rim:[-.035,.11,.13]}}),u=new Je({color:`#fffbe8`}),d=new N(Lo(.022,.35),u);return d.position.copy(o.clone().addScaledVector(c,.375)),d.castShadow=!1,l.group.add(d),l.materials.push(u),l.update=e=>{let t=.75+.25*Math.sin(e*3.7)*Math.sin(e*1.3+1);d.scale.setScalar(t),d.rotation.z=e*.8},l}var Ks={beanie:Bo,flower:Vo,party:Ho,wizard:Uo,tophat:Wo,crown:Go,halo:qo,witch:Ko,lumberjack:Yo,souwester:Xo,mitre:Zo,chef:Qo,bowler:$o,sunhat:es,headscarf:ts,feathercap:ns,sailor:rs,leprechaun:is,clockmaker:as,propeller:cs,reaper:ls,horns:us,laurel:ds,tricorn:fs,toadstool:ps,headband:ms,candle:hs,postie:gs,jester:_s,fez:Cs,deerstalker:ws,tinfoil:Ts,trainer:Es,madhatter:Ds,cowboy:Os,robot:ks,cone:As,mortarboard:js,pumpkin:Ms,viking:Ps,sombrero:Fs,beret:Is,astronaut:Ls,ushanka:Rs,santa:zs,catears:Bs,ninja:Vs,knight:Hs,gnome:Us,fedora:Ws,unicorn:Gs,hardhat:Ba,reindeer:Va,beerhat:Ha,sharkhat:Ua,birthday:Wa,bicorne:Ga,bearskin:Ka,centurion:qa,tiara:Ja,topper:Ya,plunger:$a,duck:eo,lampshade:to,sushi:no,flowerpot:ro,icecream:io,frog:ao,bobby:oo,pharaoh:so,ufo:co,hero:go,plumber:_o,captain:vo,ogre:yo,buns:bo,duo:xo,parka:So,cheese:Co,thinking:wo,blocky:To,ratchef:Eo,talking:Do,fries:Oo,loo:ko,goose:Ao,fruit:jo,ghosthunter:Mo,sparky:No,lavalamp:Po,fishbowl:Fo,trophy:Xa};function qs(e){let t=Ks[e];return t?t():null}var Js=130,Ys=-.6,Xs=.01,Zs=32,Qs=60,$s=-.6,ec=.02,tc=(e,t)=>Math.floor((Math.atan2(e,t)+Math.PI)/(Math.PI*2)*Zs)%Zs,nc=class{out=new Float32Array(4160).fill(-1);in=new Float32Array(4160).fill(9);over=new Float32Array(3600).fill(-9);constructor(e){e.updateMatrixWorld(!0);let t=e.matrixWorld.clone().invert(),n=new x,r=new x,i=new x,a=new x,o=new Float32Array(4160).fill(-1),s=new Float32Array(4160).fill(9),c=new Float32Array(3600).fill(-9),l=e=>{let t=Math.floor((e.y-Ys)/Xs);if(t<0||t>=Js)return;let n=Math.hypot(e.x,e.z),r=t*Zs+tc(e.x,e.z);n>o[r]&&(o[r]=n),n<s[r]&&(s[r]=n);let i=Math.floor((e.x-$s)/ec),a=Math.floor((e.z-$s)/ec);i>=0&&i<Qs&&a>=0&&a<Qs&&e.y>c[a*Qs+i]&&(c[a*Qs+i]=e.y)};e.traverse(e=>{let o=e;if(!o.isMesh)return;let s=o.matrixWorld.clone().premultiply(t),c=o.geometry.getAttribute(`position`),u=o.geometry.getIndex(),d=u?u.count:c.count;for(let e=0;e+2<d;e+=3){n.fromBufferAttribute(c,u?u.getX(e):e).applyMatrix4(s),r.fromBufferAttribute(c,u?u.getX(e+1):e+1).applyMatrix4(s).sub(n),i.fromBufferAttribute(c,u?u.getX(e+2):e+2).applyMatrix4(s).sub(n);let t=Math.min(30,Math.ceil(Math.max(r.length(),i.length(),r.distanceTo(i))/.012));for(let e=0;e<=t;e++)for(let o=0;e+o<=t;o++)l(a.copy(n).addScaledVector(r,e/t).addScaledVector(i,o/t))}});for(let e=1;e<129;e++)for(let t=0;t<Zs;t++){let n=-1,r=9;for(let i=-1;i<=1;i++)for(let a=-1;a<=1;a++){let c=(e+i)*Zs+(t+a+Zs)%Zs;n=Math.max(n,o[c]),r=Math.min(r,s[c])}this.out[e*Zs+t]=n,this.in[e*Zs+t]=r}for(let e=0;e<Qs;e++)for(let t=0;t<Qs;t++){let n=-9;for(let r=-1;r<=1;r++)for(let i=-1;i<=1;i++)t+i>=0&&t+i<Qs&&e+r>=0&&e+r<Qs&&(n=Math.max(n,c[(e+r)*Qs+t+i]));this.over[e*Qs+t]=n}}across(e,t,n){let r=Math.floor((t-Ys)/Xs);if(r<1||r>=129)return 0;let i=r*Zs+tc(e,n);if(this.out[i]<0)return 0;let a=Math.sqrt(e*e+n*n);return a>this.out[i]+.004?3:a>this.in[i]-.004?2:1}reach(e,t,n,r){let i=-1,a=tc(e,t);for(let e=Math.max(0,Math.floor((n-Ys)/Xs));e<=Math.min(129,Math.floor((r-Ys)/Xs));e++)i=Math.max(i,this.out[e*Zs+a]);return i}inside(e,t,n,r=!1){let i=Math.floor((t-Ys)/Xs);if(i<1||i>=129)return!1;let a=Math.sqrt(e*e+n*n),o=i*Zs+tc(e,n);if(a>this.out[o]+.006)return!1;if(r)return a>this.in[o]-.006;let s=Math.floor((e-$s)/ec),c=Math.floor((n-$s)/ec);return s>=0&&s<Qs&&c>=0&&c<Qs&&t<this.over[c*Qs+s]+.006}},rc=new Map,ic=[[.78,5],[.95,2]];function ac(e,t,n,r={}){let{kind:i,rim:a}=t.sit,[o,s,c=s]=a,[l,u,d]=n.c,[f,p,m]=n.r,h=u+p,g=rc.get(e);g||rc.set(e,g=new nc(t.group));let _=g,v=n.eye,y=n.brow??Math.min(v.at[1]+v.r*.9+.012,h-p*.4),b=e=>{let t=Ge.clamp((e-u)/p,-.95,.95),n=Math.sqrt(1-t*t);return[f*n,m*n]},S=i===`snug`||i===`band`||i===`ring`,ee=i===`ring`||i===`band`||i===`float`,C=r.tilt??t.sit.tilt??(i===`snug`||i===`band`?.15:i===`float`||i===`hood`?0:.12),w=n.size*(r.scale??1),T=new x(r.dx??0,r.dy??0,r.dz??0),E=1,te=(e,t=0)=>{if(S){let n=i===`ring`?Math.max(y,h+o*w)+t:y,r=1,a=1;for(let t=0;t<3;t++){let[t,o]=b(n);r=(t*1.04+.006)/s*e,a=(o*1.04+.006)/c*e,i!==`ring`&&(n=y-c*a*Math.sin(C))}r*=E,a*=E;let u=(r+a)/2,f=i===`snug`?Ge.clamp((h+.006-n)/-o,u*.8,u*1.25):u,p=new O().setFromEuler(new L(-C,0,0));return{pos:new x(l,n,d).sub(new x(0,o*f,0).applyQuaternion(p)).add(T),scale:new x(r,f,a)}}if(i===`hood`){let t=f*1.08/s*e*E,n=m*1.08/c*e*E,r=(t+n)/2,i=new O().setFromEuler(new L(-C,0,0));return{pos:new x(l,u,d).sub(new x(0,o*r,0).applyQuaternion(i)).add(T),scale:new x(t,r,n)}}let n=w*e;if(i===`float`)return{pos:new x(l,h,d).add(T),scale:new x(n,n,n)};let r=(e,t)=>p*(1-Math.sqrt(1-Math.min(.98,e*n/t)**2)),a=h-Math.min(r(s,f),r(c,m));return{pos:new x(l,a-o*n,d).add(T),scale:new x(n,n,n)}},D=n.bits.filter(e=>e.is===`fold`&&e.bone.startsWith(`crest`)&&i!==`float`).map(e=>e.bone),ne=t.sit.among||i===`ring`||i===`band`?[]:n.bits.filter(e=>e.is===`fold`&&!D.includes(e.bone)),re=n.bits.filter(e=>e.is===`head`).flatMap(e=>e.pts),k=n.bits.filter(e=>e.is===`eye`).flatMap(e=>e.pts),ie=n.bits.filter(e=>e.is===`solid`),ae=[],oe=new Qe().setFromMatrix4(new I().makeRotationX(-(n.droop??0)));for(let e of i===`band`||t.sit.clear?[]:[1,-1]){let t=new x(e*v.at[0],v.at[1]+(S?v.r*.3:v.r+.015),v.at[2]+.01);for(let[n,r]of ic)for(let i of[0,e*.6])ae.push([t,new x(Math.sin(i)*Math.cos(n),Math.sin(n),Math.cos(i)*Math.cos(n)).applyMatrix3(oe),r]);ae.push([t,new x(0,.15,1).normalize().applyMatrix3(oe),5])}let se=new I,ce=new I,le=new Qe,A=new x,ue=new x,de=new O,fe=new L,pe=(e,t,n)=>{se.compose(e,de.setFromEuler(fe.set(-n,0,0)),t),ce.copy(se).invert(),le.setFromMatrix4(ce)},me=e=>(A.copy(e).applyMatrix4(ce),_.inside(A.x,A.y,A.z,ee)),he=e=>(A.copy(e).applyMatrix4(ce),_.inside(A.x,A.y,A.z,ee)||Math.hypot(A.x,A.z)<_.reach(A.x,A.z,A.y-.02,A.y+.02)),[ge,_e,ve,ye]=t.sit.open??[0,0,1,1],be=Object.assign(new x(ge,_e,ve).normalize(),{w:ye}),xe=(e=1/0)=>{let t=0;if(i===`float`)return 0;for(let n of re)if(A.copy(n).applyMatrix4(ce),(ee?_.across(A.x,A.y,A.z)>2:i===`hood`?new x(A.x,A.y-o,A.z).normalize().dot(be)<be.w&&!_.inside(A.x,A.y,A.z):A.y>o+.02&&Math.hypot(A.x,A.z)<_.reach(A.x,A.z,o-.03,o+.03)&&!_.inside(A.x,A.y,A.z))&&++t>e)return t;return t},Se=i===`perch`||i===`ring`||i===`band`?25:i===`float`?60:.5,j=(e,t,n,r)=>(t-C)*5+Math.abs(n)*70+r*50+(1-e)*(i===`perch`?7:25),M=e=>{let n=0;if(!t.sit.clear){for(let t of k)if(me(t)&&(n+=12)>e)return n}for(let t of ie){let r=0;for(let e of t.pts)he(e)&&r++;if(r&&r<t.pts.length&&(n+=8+Math.min(r,t.pts.length-r))>e)return n}if((n+=xe((e-n)/1.5)*1.5)>e)return n;for(let[t,r,i]of ae){A.copy(t).applyMatrix4(ce),ue.copy(r).applyMatrix3(le);for(let t=.02;t<.5;t+=.012)if(_.inside(A.x+ue.x*t,A.y+ue.y*t,A.z+ue.z*t,ee)){if((n+=i)>e)return n;break}}for(let t of ne){let r=t.bone.startsWith(`antler`)&&i!==`snug`&&i!==`hood`;if((r?t.pts.some(he):t.pts.some(me))&&(n+=r?25:Se)>e)return n}return n};if(S||i===`hood`){let e=()=>{let e=xe();for(let t of ie){let n=t.pts.filter(me).length;n>=(i===`hood`?1:t.pts.length/2)&&(e+=t.pts.length-n)}return e};for(;E<1.3;E+=.025){let t=te(1);if(pe(t.pos,t.scale,C),!e())break}E=Math.min(1.3,E+.025)}let N=i===`perch`?[1,.9,.8,.7,.6,.5]:i===`ring`||i===`hood`?[1]:i===`brim`?[1,.92,.84,.76,.68,.6]:[1,.92,.84,.76],Ce=i===`float`?[0,.02,.04,.07,.1,.14,.19,.25]:i===`ring`?[0,-.01,-.02,-.03,.01,.02,.035,.05]:[0,.01,.02,.035,.05,.07],we=i===`float`?[0]:[0,.1,.2,.3,.4],Te=[];for(let e of N)for(let t of we)for(let n of Ce)for(let r of[0,.02,.04,.06])Te.push({k:e,tilt:C+t,lift:n,back:r,cost:j(e,C+t,n,r)});Te.sort((e,t)=>e.cost-t.cost);let P=new Map,Ee=(e,t,n,r)=>{let a=i===`ring`?`${e} ${n}`:`${e}`,o=P.get(a);o||P.set(a,o=i===`ring`?te(e,n):te(e));let s=new x(o.pos.x,o.pos.y+(i===`ring`?0:n),o.pos.z-r);return pe(s,o.scale,t),{pos:s,scale:o.scale}},F=Te[0],De=1/0;r.fixed&&(De=0);for(let e of Te){if(e.cost>=De)break;Ee(e.k,e.tilt,e.lift,e.back);let t=e.cost+M(De-e.cost);t<De&&(F=e,De=t)}let Oe=Ee(F.k,F.tilt,F.lift,F.back);return{pos:[Oe.pos.x,Oe.pos.y,Oe.pos.z],rot:[-F.tilt,0,0],scale:[Oe.scale.x,Oe.scale.y,Oe.scale.z],fold:[...D,...ne.filter(e=>e.pts.some(e.bone.startsWith(`antler`)?he:me)).map(e=>e.bone)]}}var oc={trophy:`a golden glow and drifting gold sparkles`,topper:`a magician’s swirl of silver sparkles`,tiara:`a sprinkle of diamond glitter`,centurion:`a glowing ripple of glory at your feet`,crown:`a ring of little gold stars`,witch:`moons and stars drifting round you`,mortarboard:`a whizzing atom, for the brainy`,knight:`rose petals falling for the hero`,pumpkin:`spooky embers and a few bats`,astronaut:`a little planet in orbit`},sc=new URLSearchParams(location.search).get(`fx`)===`low`;function cc(e){sc=e}var lc={dot:0,twinkle:1,star:2,moon:3,petal:4,ember:5,gem:6,planet:7,bat:8},uc=null;function dc(){if(uc)return uc;let e=document.createElement(`canvas`);e.width=e.height=256;let t=e.getContext(`2d`),n=(e,n,r=6)=>{t.save(),t.translate(e%4*64+32,Math.floor(e/4)*64+32),t.fillStyle=t.strokeStyle=`#fff`,t.shadowColor=`rgba(255,255,255,0.9)`,t.shadowBlur=r,n(),t.restore()},r=e=>{t.beginPath(),e.forEach(([e,n],r)=>r?t.lineTo(e,n):t.moveTo(e,n)),t.closePath(),t.fill()},i=(e,t,n,r=-Math.PI/2)=>Array.from({length:e*2},(i,a)=>{let o=a/(e*2)*Math.PI*2+r,s=a%2?n:t;return[Math.cos(o)*s,Math.sin(o)*s]});n(lc.dot,()=>{let e=t.createRadialGradient(0,0,0,0,0,28);e.addColorStop(0,`rgba(255,255,255,1)`),e.addColorStop(.25,`rgba(255,255,255,0.8)`),e.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=e,t.fillRect(-32,-32,64,64)},0),n(lc.twinkle,()=>r(i(4,28,5)),8),n(lc.star,()=>r(i(5,25,11)),6),n(lc.moon,()=>{t.beginPath(),t.arc(0,0,22,0,Math.PI*2),t.fill(),t.globalCompositeOperation=`destination-out`,t.shadowBlur=0,t.beginPath(),t.arc(10,-7,19,0,Math.PI*2),t.fill()}),n(lc.petal,()=>{t.beginPath(),t.moveTo(0,-24),t.bezierCurveTo(20,-12,16,16,0,24),t.bezierCurveTo(-16,16,-20,-12,0,-24),t.fill(),t.shadowBlur=0,t.fillStyle=`rgba(0,0,0,0.18)`,t.fillRect(-1.5,-16,3,34)},2),n(lc.ember,()=>{let e=t.createRadialGradient(0,6,0,0,4,22);e.addColorStop(0,`rgba(255,255,255,1)`),e.addColorStop(.5,`rgba(255,255,255,0.75)`),e.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=e,t.beginPath(),t.moveTo(0,-26),t.bezierCurveTo(14,-6,18,10,0,22),t.bezierCurveTo(-18,10,-14,-6,0,-26),t.fill()},0),n(lc.gem,()=>{r([[0,-26],[15,0],[0,26],[-15,0]])},8),n(lc.planet,()=>{t.beginPath(),t.arc(0,0,15,0,Math.PI*2),t.fill(),t.lineWidth=4.5,t.beginPath(),t.ellipse(0,0,28,8,-.35,.15,Math.PI-.15),t.stroke(),t.globalAlpha=.6,t.beginPath(),t.ellipse(0,0,28,8,-.35,Math.PI+.55,Math.PI*2-.55),t.stroke()}),n(lc.bat,()=>{t.beginPath(),t.moveTo(0,-6),t.quadraticCurveTo(-10,-16,-28,-10),t.quadraticCurveTo(-22,-4,-24,4),t.quadraticCurveTo(-16,-2,-12,6),t.quadraticCurveTo(-6,0,0,10),t.quadraticCurveTo(6,0,12,6),t.quadraticCurveTo(16,-2,24,4),t.quadraticCurveTo(22,-4,28,-10),t.quadraticCurveTo(10,-16,0,-6),t.fill(),r([[-5,-6],[-4,-14],[-1,-8],[1,-8],[4,-14],[5,-6]])},0);let a=new Be(e);return a.colorSpace=dt,a.generateMipmaps=!0,a.minFilter=ie,uc=a,a}var fc={trophy:[{kind:`aura`,color:`#ffd458`,strength:.6},{kind:`pool`,color:`#ffd65a`,strength:.6},{kind:`motes`,mode:`rise`,n:24,glyphs:[`twinkle`,`twinkle`,`dot`],colors:[`#ffd84a`,`#fff0a0`,`#ffb52a`],size:[.12,.21],period:[2.6,4.2],out:[.95,1.35],y:.05,y1:1.2,swirl:.9,drift:.04,spin:1.2,twinkle:.7}],topper:[{kind:`motes`,mode:`rise`,n:22,glyphs:[`twinkle`,`star`,`dot`],colors:[`#f4f0ff`,`#c29cff`,`#9cd0ff`],size:[.1,.18],period:[2.8,3.6],out:[1.15,1.3],y:.02,y1:1.15,swirl:7.5,taper:.55,spin:2,twinkle:.6}],tiara:[{kind:`motes`,mode:`rise`,n:24,glyphs:[`gem`,`twinkle`,`gem`],colors:[`#ffffff`,`#ffb4e4`,`#aeeaff`],size:[.08,.14],period:[3.4,5],out:[.85,1.3],y:1.25,y1:.02,swirl:.6,drift:.06,spin:2.5,twinkle:.85}],centurion:[{kind:`pool`,color:`#ff8a3a`,strength:.3,ring:{color:`#ffc84a`,every:2.4}},{kind:`motes`,mode:`rise`,n:10,glyphs:[`ember`],colors:[`#ffb84a`,`#ff7a2a`],size:[.09,.13],period:[1.8,2.6],out:[.7,1.1],y:0,y1:.6,drift:.03,twinkle:.3}],crown:[{kind:`motes`,mode:`orbit`,n:7,glyphs:[`star`],colors:[`#ffd23f`,`#ffe27a`],size:[.18,.2],period:[9,9],out:[1.35,1.35],y:.62,tilt:[[.12,.05]],bob:.03,spin:1.2,twinkle:.25}],witch:[{kind:`pool`,color:`#a07aff`,strength:.25},{kind:`motes`,mode:`rise`,n:14,glyphs:[`moon`,`star`,`twinkle`],colors:[`#d0b2ff`,`#a8ffd0`,`#fff2a8`],size:[.13,.2],period:[4,6],out:[1,1.35],y:.1,y1:1.15,swirl:1.6,drift:.05,spin:.6,twinkle:.4}],mortarboard:[{kind:`motes`,mode:`orbit`,n:3,glyphs:[`dot`],colors:[`#8ae8ff`,`#b8f4ff`,`#8ae8ff`],size:[.21,.21],period:[1.4,1.8],out:[1.3,1.3],y:.6,tilt:[[.8,.45],[-.8,.45],[.1,-.6]],trail:6,twinkle:.15}],knight:[{kind:`motes`,mode:`rise`,n:16,glyphs:[`petal`],colors:[`#ff4a62`,`#ff7f96`,`#e02a48`,`#ffd1da`],size:[.12,.17],period:[3.6,5.5],out:[.8,1.35],y:1.3,y1:0,swirl:1.2,drift:.12,spin:2.2,blend:`normal`,strength:.95}],pumpkin:[{kind:`motes`,mode:`rise`,n:18,glyphs:[`ember`,`ember`,`dot`],colors:[`#ff8a1f`,`#ffc23a`,`#ff6a10`,`#9cff5a`],size:[.09,.17],period:[1.8,3],out:[.7,1.15],y:.05,y1:1.05,swirl:.8,drift:.05,twinkle:.5},{kind:`motes`,mode:`orbit`,n:3,glyphs:[`bat`],colors:[`#3a2a4a`],size:[.18,.22],period:[4.5,5.5],out:[1.5,1.75],y:.95,tilt:[[.15,0],[-.1,.12],[.05,-.15]],bob:.08,blend:`normal`,strength:1}],astronaut:[{kind:`motes`,mode:`orbit`,n:1,glyphs:[`planet`],colors:[`#ffc98a`],size:[.3,.3],period:[7,7],out:[1.45,1.45],y:.7,tilt:[[.25,.1]],bob:.03},{kind:`motes`,mode:`orbit`,n:14,glyphs:[`twinkle`,`dot`],colors:[`#ffffff`,`#bcd6ff`,`#e4d4ff`],size:[.065,.13],period:[-14,-18],out:[1.2,1.7],y:.45,tilt:[[.35,.2]],bob:.2,spin:.8,twinkle:.9}]},pc=`
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
`,mc=`
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
`,hc=`
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
  ${mc}
}
`,gc=`
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
`,_c=`
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
  ${mc}
}
`,vc=`
uniform float uR;
varying vec2 vUv;
#include <fog_pars_vertex>
void main() {
  vUv = uv * 2.0 - 1.0;
  vec4 mvPosition = modelViewMatrix * vec4(position.x * uR * 2.6, 0.03, -position.y * uR * 2.6, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`,yc=`
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
  ${mc}
}
`,bc=new Map,xc=null;function Sc(e,t){let n=bc.get(e);if(n)return n;let r=t.mode===`orbit`?t.trail??0:0,i=t.n*(1+r),a=new Float32Array(i*4),o=new Float32Array(i*4),s=new Float32Array(i*3),c=new Float32Array(i*3),l=(()=>{let t=0;for(let n of e)t=t*31+n.charCodeAt(0)|0;return()=>(t=t*1103515245+12345&2147483647)/2147483647})(),u=([e,t],n)=>e+(t-e)*n,d=new Me,f=0;for(let e=0;e<t.n;e++){let n=t.mode===`orbit`?e/t.n*Math.PI*2:l()*Math.PI*2,i=u(t.out,l()),p=u(t.period,l()),m=lc[t.glyphs[e%t.glyphs.length]],h=u(t.size,l()),g=(l()<.5?-1:1)*(.5+l()),_=2+l()*3,v=t.tilt?.[e%t.tilt.length]??[0,0];d.set(t.colors[e%t.colors.length]);for(let u=0;u<=r;u++,f++)a.set([n,i,t.mode===`orbit`?t.y:(e+l()*.5)/t.n,p],f*4),o.set([m,h*(1-u*.17),g,_],f*4),s.set([v[0],v[1],u*.1],f*3),c.set([d.r,d.g,d.b],f*3)}let p=new $e;return p.setAttribute(`position`,new Ke(new Float32Array(i*3),3)),p.setAttribute(`aA`,new Ke(a,4)),p.setAttribute(`aB`,new Ke(o,4)),p.setAttribute(`aC`,new Ke(s,3)),p.setAttribute(`aCol`,new Ke(c,3)),p.boundingSphere=new Re(new x(0,1,0),2.6),bc.set(e,p),p}var Cc={blending:5,blendSrc:201,blendDst:205},wc={motes:.55,aura:.5,pool:.8},Tc=()=>se.clone(G.fog);function Ec(e,t,n){let r=fc[e];if(!r)return null;let i=new c,a=new c;i.name=a.name=`hatFx`;let o=[],s=[],l=[],u=[],d={value:400},f=new R,p=e=>{e.getDrawingBufferSize(f),d.value=f.y/2};return r.forEach((r,c)=>{let f={uTime:{value:0},uH:{value:t},uR:{value:n},uFade:{value:1},uCover:{value:r.kind===`motes`&&r.blend===`normal`?1:wc[r.kind]}};if(r.kind===`motes`){let t=Sc(`${e}:${c}`,r),n=r.mode===`rise`,a=new le({uniforms:{...Tc(),...f,uHalfH:d,uAtlas:{value:dc()},uY0:{value:r.y},uY1:{value:r.y1??r.y},uSwirl:{value:r.swirl??0},uTaper:{value:r.taper??1},uDrift:{value:r.drift??0},uSpin:{value:r.spin??0},uTwinkle:{value:r.twinkle??0},uBob:{value:r.bob??0}},vertexShader:pc,fragmentShader:hc,defines:{...n?{}:{ORBIT:``},BRIGHT:r.blend===`normal`?`0.0`:`1.0`},transparent:!0,depthWrite:!1,...Cc,fog:!0});a.uniforms.uFade.value=r.strength??1,a.userData.strength=r.strength??1;let l=new m(t,a);l.onBeforeRender=p,l.renderOrder=2,i.add(l),o.push(a),s.push({pts:l,full:t.getAttribute(`position`).count})}else{xc??=new ct(1,1);let e=r.kind===`aura`,t=new le({uniforms:{...Tc(),...f,uColor:{value:new Me(r.color)},uStrength:{value:r.strength},uRing:{value:new Me(r.kind===`pool`?r.ring?.color??r.color:r.color)},uEvery:{value:r.kind===`pool`?r.ring?.every??0:0}},vertexShader:e?gc:vc,fragmentShader:e?_c:yc,transparent:!0,depthWrite:!1,...Cc,fog:!0});t.userData.strength=1;let n=new N(xc,t);n.frustumCulled=!1,n.userData.noBake=!0,n.renderOrder=+!e,(e?i:a).add(n),(e?l:u).push(n),o.push(t)}}),{group:i,ground:a,update(e,t,n){let r=e%1800,i=n?.55:1;for(let e of o)e.uniforms.uTime.value=r,e.uniforms.uFade.value=i*e.userData.strength;for(let{pts:e,full:t}of s)e.geometry.setDrawRange(0,sc?Math.ceil(t*.4):t);for(let e of l)e.visible=!sc;let a=t!==`sit`&&t!==`sleep`&&!n;for(let e of u)e.visible=!sc&&a},dispose(){i.removeFromParent(),a.removeFromParent();for(let e of o)e.dispose()}}}var Dc={heart:0,z:1,q:2,drop:3,flame:4,note:5,sparkle:6,puff:7,anger:8,dot:9,plus:10,times:11,divide:12,pi:13,root:14,swirl:15,shh:16,star:17},Oc=8,kc=3,Ac=64,jc=`#3b2a20`,Mc=null;function Nc(){if(Mc)return Mc;let e=document.createElement(`canvas`);e.width=512,e.height=192;let t=e.getContext(`2d`),n=(e,n)=>{t.save(),t.translate(e%Oc*Ac+Ac/2,Math.floor(e/Oc)*Ac+Ac/2),t.fillStyle=`#fff`,t.strokeStyle=jc,t.lineWidth=4,t.lineJoin=`round`,n(),t.restore()},r=()=>{t.stroke(),t.fill()},i=(e,n)=>{t.font=`900 ${n}px "Arial Black", Arial, sans-serif`,t.textAlign=`center`,t.textBaseline=`middle`,t.lineWidth=6,t.strokeText(e,0,2),t.fillText(e,0,2)};n(Dc.heart,()=>{t.beginPath(),t.moveTo(0,22),t.bezierCurveTo(-30,2,-22,-26,0,-10),t.bezierCurveTo(22,-26,30,2,0,22),r()}),n(Dc.z,()=>i(`Z`,46)),n(Dc.q,()=>i(`?`,50)),n(Dc.drop,()=>{t.beginPath(),t.moveTo(0,-24),t.bezierCurveTo(8,-8,18,4,16,12),t.arc(0,10,16,.1,Math.PI-.1),t.bezierCurveTo(-18,4,-8,-8,0,-24),r(),t.fillStyle=`rgba(255,255,255,0.9)`,t.beginPath(),t.ellipse(-6,8,3,6,.4,0,Math.PI*2),t.fill()}),n(Dc.flame,()=>{t.beginPath(),t.moveTo(0,-28),t.bezierCurveTo(10,-14,22,-2,18,12),t.bezierCurveTo(14,26,-14,26,-18,12),t.bezierCurveTo(-20,0,-8,-6,-6,-16),t.bezierCurveTo(-2,-10,2,-18,0,-28),r(),t.fillStyle=`rgba(255,255,220,0.9)`,t.beginPath(),t.moveTo(0,-4),t.bezierCurveTo(8,4,10,16,0,18),t.bezierCurveTo(-10,16,-8,4,0,-4),t.fill()}),n(Dc.note,()=>{t.beginPath(),t.ellipse(-8,14,11,8,-.4,0,Math.PI*2),r(),t.fillRect(0,-22,5,36),t.strokeRect(0,-22,5,36),t.beginPath(),t.moveTo(3,-22),t.quadraticCurveTo(22,-16,18,0),t.lineWidth=6,t.strokeStyle=`#fff`,t.stroke()}),n(Dc.sparkle,()=>{t.beginPath();for(let e=0;e<8;e++){let n=e/8*Math.PI*2-Math.PI/2,r=e%2?7:26;t.lineTo(Math.cos(n)*r,Math.sin(n)*r)}t.closePath(),r()}),n(Dc.puff,()=>{t.beginPath();for(let[e,n,r]of[[-12,4,13],[6,-6,15],[14,8,11],[0,10,12]])t.moveTo(e+r,n),t.arc(e,n,r,0,Math.PI*2);t.lineWidth=3,t.strokeStyle=`rgba(59,42,32,0.35)`,r()}),n(Dc.anger,()=>{t.lineWidth=9,t.lineCap=`round`;for(let[e,n]of[[1,1],[-1,1],[1,-1],[-1,-1]])t.beginPath(),t.moveTo(e*6,n*20),t.quadraticCurveTo(e*6,n*6,e*20,n*6),t.strokeStyle=`#fff`,t.stroke()}),n(Dc.dot,()=>{t.beginPath(),t.arc(0,0,14,0,Math.PI*2),r()}),n(Dc.plus,()=>i(`+`,54)),n(Dc.times,()=>i(`×`,50)),n(Dc.divide,()=>i(`÷`,50)),n(Dc.pi,()=>i(`π`,46)),n(Dc.root,()=>i(`√`,46)),n(Dc.swirl,()=>{t.lineWidth=7,t.lineCap=`round`,t.beginPath(),t.arc(0,0,18,-.4,Math.PI*1.55),t.strokeStyle=`#fff`,t.stroke(),t.beginPath(),t.moveTo(16,-18),t.lineTo(18,-6),t.lineTo(6,-8),t.stroke()}),n(Dc.shh,()=>i(`shh`,28)),n(Dc.star,()=>{t.beginPath();for(let e=0;e<10;e++){let n=e/10*Math.PI*2-Math.PI/2,r=e%2?10:24;t.lineTo(Math.cos(n)*r,Math.sin(n)*r)}t.closePath(),r()});let a=new Be(e);return a.colorSpace=dt,Mc=Object.values(Dc).map(e=>{let t=a.clone();return t.repeat.set(1/Oc,1/kc),t.offset.set(e%Oc/Oc,1-(Math.floor(e/Oc)+1)/kc),t.needsUpdate=!0,t}),Mc}var Pc=(e,t={})=>new ke({color:e,roughness:.6,flatShading:!0,...t});function Fc(e,t,n=.016){let r=new N(new it(n,t,3,6),e);return r.userData.skin=!0,r.geometry.translate(0,t/2+n,0),r}function Ic(e,t,n){let r=n*.7,i=(e,t,n,r,i=0,a=0)=>(e.position.set(t,n,r),e.rotation.set(i,0,a),e),a=(...e)=>{let t=new c;return t.add(...e),t};switch(e){case`thumbsup`:return{r:a(i(Fc(t,.035,.018),0,r,.01))};case`shush`:return{r:a(i(Fc(t,.04),0,r,.02))};case`peace`:return{r:a(i(Fc(t,.05),.012,r,0,0,-.32),i(Fc(t,.05),-.012,r,0,0,.32))};case`loser`:return{r:a(i(Fc(t,.06),0,r,.03),i(Fc(t,.045),.005,r*.6,.03,0,-Math.PI/2))};case`fingerguns`:{let e=()=>a(i(Fc(t,.05),0,0,n*.6,Math.PI/2),i(Fc(t,.02),0,r,0));return{r:e(),l:e()}}case`micdrop`:{let e=a(i(new N(new lt(.014,.01,.12,8),Pc(`#2b2b30`)),0,0,0),i(new N(new s(.03,10,8),Pc(`#8d9096`,{metalness:.6,roughness:.35})),0,.075,0));return e.name=`mic`,{r:e}}case`teasip`:case`thisisfine`:{let t=new N(new lt(.04,.03,.055,12,1,!0),Pc(e===`teasip`?`#f4f1ea`:`#e9e2d0`,{side:2})),n=new N(new Oe(.037,12),Pc(`#8a5a2b`));n.rotation.x=-Math.PI/2,n.position.y=.018;let r=new N(new Oe(.03,12),t.material);r.rotation.x=Math.PI/2,r.position.y=-.027;let o=new N(new k(.016,.005,5,10),t.material);return o.position.set(-.045,0,0),o.rotation.y=Math.PI/2,{r:i(a(t,n,r,o),0,.03,.05)}}case`doot`:{let e=Pc(`#e2b33c`,{metalness:.7,roughness:.3}),t=i(new N(new lt(.009,.009,.16,6),e),0,0,.08,Math.PI/2),n=i(new N(new lt(.045,.01,.07,12,1,!0),e),0,0,.19,Math.PI/2);return n.material=e.clone(),n.material.side=2,{r:a(t,n,i(new N(new j(.03,.035,.05),e),0,.022,.07))}}case`hearthands`:{let e=new st;e.moveTo(0,-.04),e.bezierCurveTo(-.055,-.005,-.04,.045,0,.022),e.bezierCurveTo(.04,.045,.055,-.005,0,-.04);let t=new re(e,{depth:.02,bevelEnabled:!0,bevelSize:.006,bevelThickness:.006,bevelSegments:1});t.translate(0,.01,-.01);let n=new N(t,Pc(`#ff5a8a`,{emissive:`#ff2f6b`,emissiveIntensity:.35}));return n.name=`heart`,{r:n}}}return{}}var Lc=Ge.smoothstep,Rc=e=>e-Math.floor(e),zc=(e,t,n)=>e<t||e>n?0:Math.min(1,(e-t)/.12)*Math.min(1,(n-e)/.25);function Bc(e,t,n,r,i,a){let o=r.size;switch(e){case`slowclap`:{let e=Rc(t/1-.5);if(e<.3){let t=(r.hand.x+r.handL.x)/2,n=(r.hand.y+r.handL.y)/2,a=(r.hand.z+r.handL.z)/2+.04;for(let r=0;r<3;r++){let o=r/3*Math.PI*2+.6;i(`sparkle`,`#fff3a6`,t+Math.cos(o)*e*.4,n+Math.sin(o)*e*.4,a,.06,1-e/.3)}}break}case`thumbsup`:case`peace`:{let e=zc(t,.35,n-.2);i(`sparkle`,`#fff3a6`,r.hand.x-.05,r.hand.y+.12+Math.sin(t*6)*.01,r.hand.z+.03,.06+Math.sin(t*9)*.015,e),i(`sparkle`,`#ffffff`,r.hand.x+.06,r.hand.y+.06,r.hand.z+.05,.04+Math.sin(t*11+1)*.012,e);break}case`blowkiss`:{let e=(t-.75)/(n-.75);e>0&&i(`heart`,`#ff5a8a`,r.mouth.x+Math.sin(e*7)*.03,r.mouth.y+e*.25,r.mouth.z+.06+e*.7,.07+e*.08,1-Lc(e,.7,1));break}case`micdrop`:if(a.dropMic(t,r),t>1.72&&t<2.3){let e=(t-1.72)/.58,n=a.dropAt;for(let t=0;t<4;t++){let r=t/4*Math.PI*2+.4;i(`star`,`#ffd23f`,n.x+Math.cos(r)*e*.22,.03+Math.sin(e*Math.PI)*.12,n.z+Math.sin(r)*e*.22,.05,1-e)}}break;case`think`:for(let e=0;e<3;e++){let a=+(Rc(t/1.2)*4>e+.5);i(`dot`,`#ffffff`,r.head.x-.12-e*.06,r.top+.04+e*.07,r.head.z,.04+e*.02,a*zc(t,.3,n-.1))}break;case`shush`:{let e=Rc(t/1.1);i(`shh`,`#bfe3ff`,r.mouth.x-.1-e*.15,r.mouth.y+.05+e*.12,r.mouth.z+.05,.12,zc(t,.4,n)*(1-e));break}case`ragequit`:{let e=1+Math.abs(Math.sin(t*10))*.25;i(`anger`,`#e8302a`,r.head.x-o*.55,r.top-.02,r.head.z+.05,.11*e,zc(t,.15,n));for(let e of[-1,1])for(let a=0;a<2;a++){let s=Rc(t*1.6+a*.5);i(`puff`,`#f2f2f2`,r.head.x+e*(o*.6+s*.12),r.head.y+s*.25,r.head.z-.02,.06+s*.08,(1-s)*zc(t,.2,n))}break}case`yawn`:for(let e=0;e<3;e++){let n=Rc((t-1.1)/1.2+e/3);t<1.1+e/3*1.2||i(`z`,`#bcd0ff`,r.head.x-.08-n*.15+Math.sin(n*6)*.03,r.top+.02+n*.32,r.head.z,.06+n*.07,Math.min(1,n*5)*(1-Lc(n,.7,1)))}break;case`sneeze`:{let e=(t-1.12)/.8;if(e>0&&e<1){i(`puff`,`#ffffff`,r.mouth.x,r.mouth.y,r.mouth.z+.06+e*.25,.08+e*.18,.9*(1-e));for(let t=0;t<6;t++){let n=(t/6-.5)*1.6;i(`drop`,`#9fe0ff`,r.mouth.x+Math.sin(n)*e*.35,r.mouth.y+.04-e*e*.35+Math.cos(t*3)*.04,r.mouth.z+.05+Math.cos(n)*e*.45,.035,1-e)}}break}case`hearthands`:for(let e=0;e<3;e++){let n=Rc(t/1.3+e/3);t<.4+e/3*1.3||i(`heart`,e===1?`#ff8fb1`:`#ff5a8a`,r.hand.x*.3+Math.sin(n*5+e)*.08,r.hand.y+.08+n*.45,r.hand.z+.06,.05+n*.05,1-Lc(n,.6,1))}break;case`flex`:for(let e=0;e<5;e++){let a=e/5*Math.PI*2+t*1.5,s=Math.max(0,Math.sin(t*7+e*2.1));i(`sparkle`,e%2?`#fff3a6`:`#ffffff`,r.head.x+Math.cos(a)*(o+.22),r.head.y-.05+Math.sin(a*2)*.12,r.head.z+Math.sin(a)*.15,.03+s*.05,s*zc(t,.25,n))}break;case`eyeroll`:i(`swirl`,`#ffffff`,r.head.x,r.top+.1,r.head.z,.1,zc(t,.2,1.4));break;case`fingerguns`:for(let e of[.45,1.05,1.6]){let n=(t-e)/.25;if(!(n<0||n>1))for(let e of[r.hand,r.handL])i(`sparkle`,`#ffe27a`,e.x,e.y+.02,e.z+.12+n*.08,.05+n*.03,1-n)}break;case`thisisfine`:for(let e=0;e<9;e++){let r=e/9*Math.PI*2+.3,a=.85+Math.sin(t*13+e*2.7)*.15,o=.55+e%3*.12;i(`flame`,e%3==0?`#ffb02e`:`#ff6a1f`,Math.cos(r)*o,.06*a,Math.sin(r)*o,.13*a,zc(t,.05,n))}i(`puff`,`#ffffff`,r.hand.x,r.hand.y+.1+Rc(t)*.12,r.hand.z+.05,.04+Rc(t)*.04,.6*(1-Rc(t)));break;case`teasip`:for(let e=0;e<2;e++){let n=Rc(t*.8+e*.5);i(`puff`,`#ffffff`,r.hand.x+Math.sin(n*6+e)*.02,r.hand.y+.08+n*.16,r.hand.z+.05,.03+n*.04,.55*(1-n))}break;case`sweat`:{let e=Rc(t/1.4);i(`drop`,`#7fd0ff`,r.head.x-o*.45,r.head.y+o*.4-e*o*.5,r.head.z+o*.75,.05,zc(t,.1,n));for(let e of[-1,1]){let a=Rc(t*1.3+(e>0?.5:0));i(`drop`,`#9fe0ff`,r.head.x+e*(o*.7+a*.25),r.head.y+o*.3+a*.15-a*a*.35,r.head.z,.04,(1-a)*zc(t,.2,n))}break}case`confused`:{let e=[[`q`,`#ffd23f`],[`plus`,`#9be37a`],[`q`,`#ffd23f`],[`times`,`#ff8a8a`],[`pi`,`#8fc8ff`],[`divide`,`#d6a6ff`],[`root`,`#ffb86b`]];e.forEach(([a,s],c)=>{let l=c/e.length*Math.PI*2+t*1.1;i(a,s,r.head.x+Math.cos(l)*(o+.2),r.head.y+.05+Math.sin(t*3+c)*.05+c%2*.08,r.head.z+Math.sin(l)*(o+.2),a===`q`?.1:.08,zc(t,.1+c*.08,n))});break}case`sigh`:{let e=(t-.85)/1.3;e>0&&e<1&&i(`puff`,`#ffffff`,r.mouth.x,r.mouth.y-e*.08,r.mouth.z+.08+e*.3,.06+e*.14,.8*(1-e));break}case`crylaugh`:for(let[e,a]of[[r.eyeL,1],[r.eyeR,-1]])for(let r=0;r<3;r++){let o=Rc(t*2.2+r/3);i(`drop`,`#7fd0ff`,e.x+a*o*.3,e.y+o*.12-o*o*.3,e.z+.02,.035,(1-o)*zc(t,.25,n))}break;case`doot`:for(let e of[.3,.9,1.45]){let n=(t-e)/.9;n<0||n>1||i(`note`,e===.9?`#ffd23f`:`#c48cff`,r.hand.x+Math.sin(n*8)*.04,r.hand.y+.05+n*.3,r.hand.z+.24+n*.25,.07+n*.03,1-Lc(n,.7,1))}}}var Vc=[`facepalm`,`shrug`,`salute`,`bow`,`dab`,`loser`],Hc=class{anim;group=new c;props;sprites=[];used=0;T;dropped=null;dropFrom=new x;dropAt=new x;constructor(t,n,r){this.anim=t,this.T=e(t)?.time??2.5,this.props=Ic(t,n,r),this.group.name=`emoteFx`}static wanted(e){return!Vc.includes(e)}update(e,t){this.used=0;let n=Nc();Bc(this.anim,e,this.T,t,(e,t,r,i,a,o,s=1)=>{if(s<=.01)return;let c=this.sprites[this.used];c||(c=new Le(new C({transparent:!0,depthWrite:!1})),this.sprites.push(c),this.group.add(c)),this.used++;let l=c.material;l.map!==n[Dc[e]]&&(l.map=n[Dc[e]],l.needsUpdate=!0),l.color.set(t),l.opacity=s,c.position.set(r,i,a),c.scale.setScalar(o*2),c.visible=!0},this);for(let e=this.used;e<this.sprites.length;e++)this.sprites[e].visible=!1}dropMic(e,t){let n=1.35,r=this.props.r;if(!r)return;if(e<n){r.visible=!0,this.dropped&&(this.dropped.visible=!1);return}r.visible=!1,this.dropped||(this.dropped=r.clone(),this.group.add(this.dropped)),this.dropped.visible||(this.dropped.visible=!0,this.dropFrom.copy(t.hand),this.dropAt.set(t.hand.x,.02,t.hand.z));let i=e-n,a=4.9*i*i,o=this.dropFrom.y-.02,s=this.dropFrom.y-a,c=Math.min(1,i*4)*.6;if(s<=.02){let e=i-Math.sqrt(2*o/9.8);s=.02+Math.max(0,.06*Math.sin(Math.min(1,e/.22)*Math.PI)),c=.6+Math.min(1,e/.2)*(Math.PI/2-.6)}this.dropped.position.set(this.dropFrom.x,s+.015,this.dropFrom.z),this.dropped.rotation.set(c,0,.3)}dispose(){for(let e of this.sprites)e.material.dispose();let e=e=>e.traverse(e=>{let t=e;t.isMesh&&(t.geometry.dispose(),t.userData.skin||t.material.dispose())});this.props.r&&e(this.props.r),this.props.l&&e(this.props.l),this.props.r?.removeFromParent(),this.props.l?.removeFromParent(),this.group.removeFromParent()}},Uc=new s(1,10,7),Wc=new s(1,6,4),Gc=new lt(1,1,1,10),Kc=new lt(1,1,1,6),qc=new xe(1,1,8),Jc=new j(1,1,1),Yc=new k(1,.28,5,12),Xc=new k(1,.1,3,12),Zc=new lt(1,.8,1,10),Qc=new fe(1,0);function $c(e,t,n){let r=n.scale??1,i=typeof r==`number`?r:Math.max(...r);e.add(i<.035?Wc:Uc,t,n)}var el={ale:{cup:`#a8743f`,band:`#5d5a5a`,top:`#d98c2b`,foam:`#fbf3df`},cider:{cup:`#cfe6e4`,band:`#b6d3d0`,top:`#f0c040`},milk:{cup:`#8fc1e8`,band:`#6fa6d1`,top:`#fbfaf5`},cocoa:{cup:`#e0605a`,band:`#c24b47`,top:`#6b3d26`}};function tl(e,t){let n=el[t]??el.ale,r=[0,.02,.07];if(e.add(Zc,n.cup,{pos:[r[0],r[1]+.07,r[2]],scale:[.068,.14,.068]}),e.add(Gc,n.band,{pos:[r[0],r[1]+.02,r[2]],scale:[.06,.018,.06]}),e.add(Gc,n.band,{pos:[r[0],r[1]+.12,r[2]],scale:[.07,.016,.07]}),e.add(Xc,n.band,{pos:[r[0],r[1]+.141,r[2]],rot:[Math.PI/2,0,0],scale:.068}),e.add(Gc,n.top,{pos:[r[0],r[1]+.138,r[2]],scale:[.062,.004,.062]}),e.add(Yc,n.cup,{pos:[r[0],r[1]+.075,r[2]-.07],rot:[0,Math.PI/2,0],scale:.035}),n.foam){$c(e,n.foam,{pos:[r[0],r[1]+.15,r[2]],scale:[.068,.035,.068]}),$c(e,n.foam,{pos:[r[0]+.045,r[1]+.13,r[2]+.03],scale:[.025,.04,.025]});for(let[t,n,i]of[[-.03,.03,.018],[.02,-.035,.014],[-.01,-.01,.012]])$c(e,`#ffffff`,{pos:[r[0]+t,r[1]+.175,r[2]+n],scale:i});$c(e,n.foam,{pos:[r[0]-.05,r[1]+.105,r[2]-.02],scale:[.018,.045,.018]})}t===`cocoa`&&(e.add(Jc,`#fffaf2`,{pos:[r[0]+.015,r[1]+.15,r[2]],rot:[.3,.5,.2],scale:.028}),e.add(Jc,`#fffaf2`,{pos:[r[0]-.02,r[1]+.148,r[2]+.015],rot:[.1,.9,.4],scale:.025}))}function nl(e,t){let n=[0,.03,.08];if(t===`loaf`){$c(e,`#c98a45`,{pos:n,scale:[.07,.06,.13]});for(let t of[-.06,0,.06])e.add(Jc,`#f0cf8e`,{pos:[n[0],n[1]+.055,n[2]+t],rot:[0,.6,0],scale:[.07,.012,.016]})}else if(t===`pie`){e.add(Gc,`#d9d4cc`,{pos:[n[0],n[1],n[2]],scale:[.13,.02,.13]}),e.add(Gc,`#d9a050`,{pos:[n[0],n[1]+.025,n[2]],scale:[.115,.04,.115]});for(let t of[-.05,0,.05])e.add(Jc,`#f0c878`,{pos:[n[0]+t,n[1]+.05,n[2]],scale:[.016,.01,.2]}),e.add(Jc,`#f0c878`,{pos:[n[0],n[1]+.052,n[2]+t],scale:[.2,.01,.016]});$c(e,`#8a2a3a`,{pos:[n[0]+.025,n[1]+.048,n[2]+.025],scale:.018})}else $c(e,`#d18b46`,{pos:n,scale:[.08,.06,.08]}),$c(e,`#e9a85a`,{pos:[n[0],n[1]+.025,n[2]],scale:[.065,.04,.065]}),e.add(Jc,`#fffaf2`,{pos:[n[0],n[1]+.062,n[2]],scale:[.09,.01,.018]}),e.add(Jc,`#fffaf2`,{pos:[n[0],n[1]+.062,n[2]],scale:[.018,.01,.09]})}function rl(e){let t=[0,.08,.08];$c(e,`#7fa8c8`,{pos:t,scale:[.045,.07,.15]}),$c(e,`#dfe8ee`,{pos:[t[0],t[1]-.02,t[2]+.01],scale:[.038,.045,.12]});for(let n of[-1,1])e.add(qc,`#5f86a8`,{pos:[t[0],t[1]+n*.03,t[2]-.18],rot:[-Math.PI/2+n*.5,0,0],scale:[.045,.07,.012]});e.add(qc,`#5f86a8`,{pos:[t[0],t[1]+.07,t[2]-.01],scale:[.04,.05,.01]}),e.add(qc,`#5f86a8`,{pos:[t[0],t[1]+.055,t[2]-.07],rot:[-.5,0,0],scale:[.025,.035,.008]});for(let n of[-1,1]){e.add(qc,`#6f98b8`,{pos:[t[0]+n*.045,t[1]-.01,t[2]+.03],rot:[.6,0,n*1.3],scale:[.02,.05,.008]}),e.add(Xc,`#6a90ae`,{pos:[t[0]+n*.04,t[1],t[2]+.07],rot:[0,Math.PI/2,0],scale:[.035,.035,.02]}),$c(e,`#f6f1e6`,{pos:[t[0]+n*.036,t[1]+.02,t[2]+.1],scale:[.009,.013,.013]}),$c(e,`#1d1a1c`,{pos:[t[0]+n*.042,t[1]+.02,t[2]+.102],scale:[.005,.008,.008]});for(let r=0;r<3;r++)e.add(Xc,`#6f98b8`,{pos:[t[0]+n*.044,t[1]+.01+r%2*.02,t[2]-.02-r*.018],rot:[0,Math.PI/2,0],scale:[.012,.012,.01]})}$c(e,`#d86a5a`,{pos:[t[0],t[1]-.01,t[2]+.148],scale:[.02,.012,.008]})}function il(e,t){let n=[0,0,.06];e.add(Kc,`#4f9a4a`,{pos:[n[0],n[1]+.13,n[2]],scale:[.008,.26,.008]});for(let[t,r,i]of[[1,.12,-.6],[-1,.07,.5]])$c(e,`#5fae55`,{pos:[n[0]+t*.03,n[1]+r,n[2]],rot:[0,0,i],scale:[.014,.04,.022]}),e.add(Jc,`#4f9a4a`,{pos:[n[0]+t*.03,n[1]+r,n[2]+.02],rot:[0,0,i],scale:[.003,.06,.002]});let r=[n[0],n[1]+.27,n[2]];for(let n=0;n<8;n++){let i=n/8*Math.PI*2;$c(e,t,{pos:[r[0]+Math.cos(i)*.04,r[1]+Math.sin(i)*.04,r[2]],rot:[0,0,i],scale:[.03,.018,.012]})}for(let n=0;n<6;n++){let i=n/6*Math.PI*2+.4;$c(e,t,{pos:[r[0]+Math.cos(i)*.022,r[1]+Math.sin(i)*.022,r[2]+.008],rot:[0,0,i],scale:[.02,.014,.01]})}$c(e,`#f6d04d`,{pos:[r[0],r[1],r[2]+.012],scale:.018});for(let t=0;t<5;t++){let n=t/5*Math.PI*2;$c(e,`#c9a020`,{pos:[r[0]+Math.cos(n)*.01,r[1]+Math.sin(n)*.01,r[2]+.028],scale:.004})}}function al(e){let t=1.4,n=.9,r=new x(-Math.sin(.32)*Math.cos(n),Math.cos(n),Math.sin(n)).normalize(),i=new O().setFromUnitVectors(new x(0,1,0),r),a=new L().setFromQuaternion(i),o=r.clone().multiplyScalar(t/2);e.add(Kc,`#8a5a36`,{pos:[o.x,o.y,o.z],rot:[a.x,a.y,a.z],scale:[.012,t,.012]});let s=r.clone().multiplyScalar(.02);e.add(Kc,`#4d3528`,{pos:[s.x,s.y+.01,s.z+.01],rot:[a.x,a.y,a.z],scale:[.02,.18,.02]}),e.add(Yc,`#9aa0a8`,{pos:[.025,.12,.08],rot:[0,Math.PI/2,0],scale:.025});let c=r.clone().multiplyScalar(t);e.add(Kc,`#f4efe6`,{pos:[c.x,c.y-.35,c.z],scale:[.003,.7,.003]}),$c(e,`#e0605a`,{pos:[c.x,c.y-.71,c.z],scale:[.03,.025,.03]}),$c(e,`#fbfaf5`,{pos:[c.x,c.y-.685,c.z],scale:[.026,.018,.026]})}function ol(e){let t=[0,.02,.1];e.add(Gc,`#6fa88a`,{pos:[t[0],t[1]+.07,t[2]],scale:[.075,.14,.075]}),e.add(Xc,`#5a8f73`,{pos:[t[0],t[1]+.142,t[2]],rot:[Math.PI/2,0,0],scale:.078}),e.add(Xc,`#5a8f73`,{pos:[t[0],t[1]+.005,t[2]],rot:[Math.PI/2,0,0],scale:.078}),e.add(Gc,`#5a8f73`,{pos:[t[0],t[1]+.142,t[2]],scale:[.07,.008,.07]}),e.add(Gc,`#4a4a52`,{pos:[t[0],t[1]+.146,t[2]-.02],scale:[.035,.006,.035]}),e.add(Kc,`#6fa88a`,{pos:[t[0],t[1]+.1,t[2]+.12],rot:[.9,0,0],scale:[.016,.16,.016]}),e.add(qc,`#5a8f73`,{pos:[t[0],t[1]+.155,t[2]+.18],rot:[-2.25,0,0],scale:[.03,.04,.03]}),e.add(Gc,`#4a7a62`,{pos:[t[0],t[1]+.17,t[2]+.192],rot:[-2.25,0,0],scale:[.03,.006,.03]});for(let n=0;n<7;n++){let r=n/7*Math.PI*2,i=n===0?0:.018;$c(e,`#2a2a30`,{pos:[t[0]+Math.cos(r)*i,t[1]+.172+Math.sin(r)*i*.62,t[2]+.196+Math.sin(r)*i*.78],scale:.004})}e.add(Yc,`#5a8f73`,{pos:[t[0],t[1]+.16,t[2]-.02],rot:[0,Math.PI/2,0],scale:[.06,.06,.06]}),e.add(Kc,`#8a5a36`,{pos:[t[0],t[1]+.22,t[2]-.02],rot:[0,0,Math.PI/2],scale:[.012,.05,.012]})}function sl(e,t){let n=[0,.02,.12];e.add(Zc,`#c9a46a`,{pos:[n[0],n[1]+.06,n[2]],scale:[.14,.12,.11]});for(let t=0;t<14;t++){let r=t/14*Math.PI*2;e.add(Jc,t%2?`#b8924f`:`#d6b47a`,{pos:[n[0]+Math.cos(r)*.14,n[1]+.06,n[2]+Math.sin(r)*.11],rot:[0,-r,0],scale:[.012,.11,.025]})}for(let t of[.035,.085])e.add(Xc,`#a8834f`,{pos:[n[0],n[1]+t,n[2]],rot:[Math.PI/2,0,0],scale:[.143,.112,.08]});e.add(Yc,`#a8834f`,{pos:[n[0],n[1]+.12,n[2]],rot:[Math.PI/2,0,0],scale:[.14,.11,.05]}),$c(e,t,{pos:[n[0]-.05,n[1]+.14,n[2]],scale:[.07,.04,.06]}),$c(e,`#f4efe6`,{pos:[n[0]+.05,n[1]+.145,n[2]+.02],scale:[.06,.035,.055]}),$c(e,`#8fc1e8`,{pos:[n[0]+.01,n[1]+.155,n[2]-.04],scale:[.05,.03,.04]})}function cl(e){let t=new c,n=.19,r=.28,i=.035,a=`#3b2a36`,o=`#c9a24f`,s=`#2a1d12`,l=e=>{let t=new z,o=e*n/2;t.add(Jc,a,{pos:[o,-.006,r/2],scale:[.202,.012,.29600000000000004]}),t.add(Jc,`#efe3c6`,{pos:[o,i/2,r/2],scale:[.184,i,.27]}),t.add(Yc,s,{pos:[o,.037000000000000005,r/2],rot:[Math.PI/2,0,0],scale:[.055,.055,.004]});for(let n=0;n<4;n++){let i=n/4*Math.PI*2+(e>0?.4:1.1);t.add(Kc,s,{pos:[o+Math.cos(i)*.055,.038000000000000006,r/2+Math.sin(i)*.055],scale:[.009,.003,.009]})}for(let e of[.05,.08,.2,.23])t.add(Jc,s,{pos:[o,.037000000000000005,e],scale:[n*.6,.002,.004]});return t.mesh(ht(),{cast:!0,receive:!1})},u=l(1),d=new c;d.add(l(-1)),d.position.y=i;let f=new z;f.add(Jc,o,{pos:[-.19/2,-.015,r/2],scale:[n*.72,.004,r*.78]}),f.add(Jc,a,{pos:[-.19/2,-.018,r/2],scale:[n*.62,.004,r*.68]}),f.add(Uc,o,{pos:[-.19/2,-.02,r/2],scale:[.03,.004,.022]}),f.add(Jc,o,{pos:[-.18,0,r/2],scale:[.03,.05500000000000001,.05]}),d.add(f.mesh(ht(),{cast:!0,receive:!1}));let p=new z;p.add(Jc,a,{pos:[0,i/2,r/2],scale:[.03,.05500000000000001,.29600000000000004]}),t.add(u,d,p.mesh(ht(),{cast:!0,receive:!1})),t.position.set(0,.02,.04),t.scale.setScalar(1.35);let m=e=>{let t=Math.max(0,Math.min(1,e));d.rotation.z=Math.PI*(1-t)};return m(+!!e),t.userData.setOpen=m,t.name=`item:grimoire`,t}function ll(e){let t=[0,-.25,.02];e.add(Zc,`#8a6a4a`,{pos:[t[0],t[1]+.07,t[2]],scale:[.09,.14,.09]}),e.add(Gc,`#5a4030`,{pos:[t[0],t[1]+.13,t[2]],scale:[.095,.015,.095]}),e.add(Gc,`#5a4030`,{pos:[t[0],t[1]+.03,t[2]],scale:[.08,.015,.08]}),e.add(Gc,`#6fb0e0`,{pos:[t[0],t[1]+.125,t[2]],scale:[.078,.006,.078]}),e.add(Yc,`#9aa0a8`,{pos:[t[0],t[1]+.16,t[2]],rot:[0,0,0],scale:[.08,.08,.03]})}function ul(e){let t=[0,.02,.08];e.add(Gc,`#c9a24f`,{pos:[t[0],t[1]+.01,t[2]],scale:[.05,.02,.05]}),e.add(Xc,`#e0bf6a`,{pos:[t[0],t[1]+.02,t[2]],rot:[Math.PI/2,0,0],scale:.045}),e.add(Kc,`#c9a24f`,{pos:[t[0],t[1]+.06,t[2]],scale:[.012,.08,.012]}),$c(e,`#c9a24f`,{pos:[t[0],t[1]+.06,t[2]],scale:.02}),e.add(Zc,`#c9a24f`,{pos:[t[0],t[1]+.14,t[2]],scale:[.055,.09,.055]}),e.add(Xc,`#e0bf6a`,{pos:[t[0],t[1]+.185,t[2]],rot:[Math.PI/2,0,0],scale:.055});for(let n=0;n<4;n++){let r=n/4*Math.PI*2;e.add(Qc,`#a8463f`,{pos:[t[0]+Math.cos(r)*.052,t[1]+.13,t[2]+Math.sin(r)*.052],scale:.008})}e.add(Gc,`#7a1f2e`,{pos:[t[0],t[1]+.175,t[2]],scale:[.048,.006,.048]})}function dl(e){let t=[0,.03,.1];for(let[n,r]of[[-.03,0],[.03,0],[0,.05]])e.add(Kc,`#9a6a43`,{pos:[t[0]+n,t[1]+r,t[2]],rot:[Math.PI/2,0,0],scale:[.028,.22,.028]});e.add(Yc,`#d8c8a0`,{pos:[t[0],t[1]+.02,t[2]],rot:[Math.PI/2,0,0],scale:[.06,.06,.02]})}function fl(e){if(e.k===`grimoire`)return cl(e.c===`open`);let t=new z;switch(e.k){case`ale`:case`cider`:case`milk`:case`cocoa`:tl(t,e.k);break;case`loaf`:case`pie`:case`bun`:nl(t,e.k);break;case`fish`:rl(t);break;case`flower`:il(t,e.c??`#f39ab5`);break;case`rod`:al(t);break;case`can`:ol(t);break;case`washing`:sl(t,e.c??`#e0605a`);break;case`water`:ll(t);break;case`wine`:ul(t);break;case`firewood`:dl(t)}let n=t.mesh(ht(),{cast:!0,receive:!1});return n.name=`item:${e.k}`,n}function pl(e){e.traverse(e=>{if(e.userData.onDispose?.(),e.userData.shared)return;let t=e;t.geometry&&t.geometry.dispose();let n=t.material;Array.isArray(n)?n.forEach(e=>e.dispose()):n?.dispose()})}var ml=(e,t)=>{let n=t*(e.length-1),r=Math.min(e.length-2,Math.floor(n));return e[r]+(e[r+1]-e[r])*(n-r)};function hl(e,t,n,r,i,a=9){let o=Tn([0,0,.02],t,a,e/a,[n[0]/a,n[1]/a,n[2]/a]);return{pts:o,radii:o.map((e,t)=>r*ml(i,t/a))}}var gl=(e,t,n=.005)=>V(e.surface?e.surface(new x(...t),-n):new x(...t)),_l=(e,t)=>{let n=H(t.coat,Ft,.88),r=H(t.coat,`#2b211d`,.8);e.joints.neck=[0,.62,.05],e.joints.shoulder=[.1,.5,.14],e.joints.hip=[.1,.2,-.06],e.joints.tail=[0,.22,-.17],Et(e,{belly:[[0,.33,-.095],[.185,.22,.17]],chest:[[0,.47,.045],[.14,.15,.14]],haunch:[[.11,.2,-.09],[.095,.12,.14]],ruff:[[0,.58,.045],[.13,.08,.12]],melt:.2}),mn(e,{r:[.185,.155,.175],at:[0,.14,.06],cheeks:[[.13,-.06,0],[.085,.07,.09]]});let i=Mn(e,{dy:-.28,len:.13,ra:.072,rb:.04,drop:.045,squash:[1,.85,1],thin:!0});On(e,{x:.58,y:.7,w:.085,h:.22,d:.045,splay:.18,rake:.08,cup:.5,notch:!0}),cn(e,{len:.3,r0:.052,r1:.044,paw:[.048,.036,.058],fwd:.36,out:.16}),sn(e,{r0:.062,r1:.047,foot:[.05,.036,.08]});let a=Vt(e,hl(.62,[0,-.3,-1],[.7,-.75,0],.125,[.3,.7,.95,1,.95,.8,.5]));dn(e),Ut(e,{x:.4,y:.12,size:.9,wide:1.5,slant:.32,color:`#1a1412`}),Kt(e,Lt,gl(e,i.nose),.026,.019),Ct(e,t.coat,{len:.1,back:.03});let o=[`earL`,`earR`].map(t=>en(e,t)),s=W(e,`head`,`cheekL`,`cheekR`),c=It(e,`head`);return e.marks={base:t.coat,marks:[{color:n,f:Sn(...o.map(e=>e.inner))},{color:r,f:Sn(...o.map(e=>e.back))},{color:n,f:U(W(e,`muzzle`),e=>e.p.y-(i.mid(e.p)+i.r*.15))},{color:n,f:U(s,e=>{let t=c(e),n=Math.abs(t.x);return Math.max(-.2-t.z,t.y-(-.1-.12*n+.3*n*n))})},{color:n,f:U(W(e,`cheekL`,`cheekR`),e=>c(e).y-.05)},{color:n,f:U(W(e,`chest`,`ruff`,`belly`),e=>-e.p.z,e=>Rt(e.p.x,e.p.y,0,.36,0,.62).d-.075)},{color:r,f:Sn(Bt(e,`L`,.5),Bt(e,`R`,.5))},{color:r,f:U(W(e,/^leg/),e=>e.p.y-.14)},{color:n,f:U(W(e,/^tail\d/),e=>.8-a(e.p))}]},{}},vl=`#2c2a27`,yl=`#e6dac0`,bl=(e,t)=>{let n=H(t.coat,vl,.8),r=H(t.coat,yl,.85),i=H(t.coat,`#2f2d28`,.5);e.joints.neck=[0,.585,.045],e.joints.shoulder=[.12,.47,.115],e.joints.hip=[.11,.17,-.03],e.joints.tail=[0,.19,-.17],Et(e,{belly:[[0,.255,-.05],[.235,.25,.195]],chest:[[0,.45,.03],[.165,.15,.15]],haunch:[[.13,.15,-.05],[.11,.12,.15]],ruff:[[0,.56,.035],[.15,.08,.13]]}),mn(e,{r:[.225,.178,.19],at:[0,.15,.065],cheeks:[[.15,-.07,.03],[.105,.09,.1]]});let a=Mn(e,{dy:-.36,len:.07,ra:.085,rb:.06,drop:.02,squash:[1.05,.8,1]});On(e,{x:.66,y:.64,w:.09,h:.15,d:.045,splay:.3,rake:.1,cup:.5,notch:!0}),cn(e,{len:.24,r0:.062,r1:.052,paw:[.056,.042,.064],fwd:.85}),sn(e,{r0:.07,r1:.058,foot:[.075,.048,.11],fwd:.075});let o=Vt(e,hl(.44,[0,-.3,-1],[.5,-.9,0],.12,[.55,.9,1,1,.9,.6]));dn(e),Ut(e,{x:.38,y:.06,size:.85,wide:1.3,slant:.18,color:`#121010`,out:.006,blush:!1}),Kt(e,`#2a2624`,gl(e,a.nose),.03,.022,!0),Ct(e,t.coat,{len:.11});let s=[`earL`,`earR`].map(t=>en(e,t)),c=W(e,`head`,`cheekL`,`cheekR`),l=It(e,`head`),u=(e,t,n,r,i,a)=>o=>{let s=l(o),c=Rt(Math.abs(s.x),s.y,e,t,n,r);return s.z<-.1?1:c.d-(i+(a-i)*c.t)};return e.marks={base:t.coat,marks:[{color:n,f:Sn(...s.map(e=>e.inner))},{color:r,f:Sn(...s.map(e=>e.front))},{color:r,f:W(e,`muzzle`)},{color:n,f:U(c,e=>.075-Math.abs(l(e).x),u(.08,.13,.86,-.22,.2,.13))},{color:r,f:U(c,e=>.07-Math.abs(l(e).x),u(.1,.36,.7,.26,.075,.06))},{color:r,f:Sn(W(e,`cheekL`,`cheekR`),U(c,e=>l(e).y+.5,e=>-.1-l(e).z))},{color:i,f:Sn(Bt(e,`L`,.45),Bt(e,`R`,.45))},{color:i,f:U(W(e,/^leg/),e=>e.p.y-.11)},{color:n,f:U(W(e,/^tail\d/),e=>{let t=o(e.p);return t>.875?-1:Math.sin(Math.PI*8*t)})},{color:H(t.coat,r,.14),f:U(W(e,`belly`,`chest`),e=>-e.p.z,e=>Math.hypot(e.p.x/.12,(e.p.y-.27)/.14)-1)}]},{}},xl=(e,t,n)=>{let r=H(`#cdbf98`,n,.12),i=H(r,Ft,.45),a=t.coat,o=H(t.coat,Pt,.34),s=H(t.coat,Pt,.65);e.joints.neck=[0,.27,.36],e.joints.shoulder=[.085,.18,.37],e.joints.tail=[0,.05,-.3],Nt(e,`rear`,`body`,[0,.06,-.22]);let c=Zt(e);c.add(ln(`body`,[0,.07,-.1],[0,.07,.15],.14,.135,{squash:[1,.5,1],name:`foot`})),c.add(ln(`rear`,[0,.065,-.38],[0,.07,-.1],.06,.14,{squash:[1,.5,1],k:.06,anchor:[0,.07,-.14],reach:.2,name:`tailFoot`})),c.add(ln(`body`,[0,.1,.2],[0,.25,.355],.1,.085,{k:.08,anchor:[0,.1,.18],reach:.18,name:`neck`}));let l=Xt(`body`,[0,.36,-.1],{R0:.2,b:.14,a0:.15,turns:1.85,c:.45,sx:1.2,k:.06,anchor:[0,.16,-.02],reach:.3,name:`shell`});c.add(l,gn(`body`,[0,.36,-.1],[.08,.072,.072],{k:.03,name:`shellCore`})),e.seat=0,mn(e,{r:[.112,.106,.108],at:[0,.07,.03],melt:.06}),dn(e),xn(e,{w:.24,y:-.4,curve:.13,r:.0055});let u=Gt(e,0,-.18,.004);bn(e.head,e.rnd,{base:`ico1`,r:[.022,.016,.016],pos:V(u),jitter:.02,color:H(r,Pt,.15)}),e.nose=[u.x,u.y,u.z+.012];let d=new x(0,.17,.03);for(let t of[-1,1]){let n=t>0?`L`:`R`,i=Gt(e,t*.32,.72,-.015);Nt(e,`stalk${n}`,`neck`,V(i));let a=d.clone().add(new x(t*.025,0,0));Nt(e,`blink${n}`,`stalk${n}`,V(a));let o=qt(e,`stalk${n}`,`stalk${n}`);kn(o,e.rnd,[0,0,0],V(a),.02,.015,r,{base:`limb5`}),bn(o,e.rnd,{base:`ico1`,r:.032,pos:V(a),jitter:.04,color:r});let s=qt(e,`eye${n}`,`stalk${n}`,{bone:`blink${n}`,eyes:!0}),c=At(a.clone().add(new x(0,.004,.024)));bn(s,e.rnd,{base:`ico1`,r:[.02,.022,.013],matrix:c,jitter:.02,color:Lt,tone:.1}),bn(s,e.rnd,{base:`ico0`,r:.0065,matrix:Wt(c,[.006,.008,.011]),jitter:.01,color:`#fbf6ec`,tone:0})}e.blink=[`blinkL`,`blinkR`];let f=Gt(e,.32,.72).add(d);e.eyeY=f.y,e.eyeX=f.x+.025,e.eyeR=.032,e.eyeZ=f.z+.035,jt(e,{color:r,len:.12,r:.03,rightOnly:!0}),e.front=.47;let p=l.unit,m=W(e,`shell`);return e.marks={base:r,marks:[{color:s,f:U(m,e=>.72-p(e.p).z,e=>.3-Math.abs(p(e.p).x))},{color:o,f:W(e,`shellCore`)},{color:o,f:U(m,e=>Math.sin(Math.PI*13*p(e.p).y))},{color:a,f:m},{color:i,f:U(W(e,`foot`,`tailFoot`,`neck`),e=>e.p.y-.02)}]},{legs:`none`,tendril:!0}},Sl=(e,t,n)=>{let r=It(e,t),i=Math.PI/180,a=n.map(([e,t,n])=>[Math.sin(e*i)*Math.sin(t*i),Math.cos(e*i),Math.sin(e*i)*Math.cos(t*i),n]);return U(W(e,t),e=>{let t=r(e).normalize(),n=1/0;for(let[e,r,i,o]of a)n=Math.min(n,Math.hypot(t.x-e,t.y-r,t.z-i)-o);return n})},Cl=(e,t,n,r,i,a)=>U(W(e,...t),e=>-e.p.z,e=>Math.hypot((e.p.x-n)/i,(e.p.y-r)/a)-1),wl=(e,t,n,r,i={})=>{let a=new x(...e.joints.neck),o=a.clone().add(new x(...e.shape.hc));t.forEach(([t,s,c],l)=>{for(let u of t?[-1,1]:[1]){let d=Gt(e,u*t,s).add(a),f=i.along&&new x(u*i.along[0],i.along[1],i.along[2]);wn(e,{bone:`neck`,from:o,dir:d.sub(o),r:c,color:n,stretch:i.stretch,along:f,sides:i.sides,name:`${r}${l}${u>0?`L`:`R`}`})}})},Tl=(e,t,n,r,i,a,o={})=>{r.forEach(([r,s,c],l)=>{for(let u of r?[-1,1]:[1]){let d=new x(u*Math.sin(r)*Math.cos(s),Math.sin(s),-Math.cos(r)*Math.cos(s)),f=o.along&&new x(u*o.along[0],o.along[1],o.along[2]);wn(e,{bone:t,from:new x(...n),dir:d,r:c,color:i,stretch:o.stretch,along:f,sides:o.sides,name:`${a}${l}${u>0?`L`:`R`}`})}})},El=(e,t,n,r,i,a=`#fbf8f1`,o=`fang`)=>{let s=new x(...e.joints.neck);for(let c of[-1,1]){let l=Gt(e,c*t,n),u=Ht(e,c*t,n),d=new x(0,-1,0).addScaledVector(u,.45).normalize();l.add(s);let f=[l.clone().addScaledVector(u,-.01),l.clone().addScaledVector(d,r*.45),l.clone().addScaledVector(d,r)];An(e,{bone:`neck`,pts:f,w:[i,i*.8,0],t:[i*.7,i*.55,0],across:new x(1,0,0),colors:[a,a],name:`${o}${c>0?`L`:`R`}`})}},Dl=(e,t,n,r,i,a,o,s,c,l=7)=>Ll(i).forEach((i,u)=>{a(i)&&wn(e,{bone:t,from:new x(...n),dir:new x(i.x*r[0],i.y*r[1],i.z*r[2]),r:o*(.8+u*7%5*.1),color:s,sides:l,name:`${c}${u}`})}),Ol=(e,t)=>{let n=new x(...e.joints.neck),r=new x(0,-Math.sin(t.drop),Math.cos(t.drop)),i=Gt(e,0,t.dy,-.01).add(n).addScaledVector(r,t.len*t.at);for(let n of[-1,1])wn(e,{bone:`neck`,from:i.clone().add(new x(n*t.gap,0,0)),dir:new x(0,1,0),r:t.r,stretch:1.6,along:r,color:t.color,sides:7,name:`nostril${n>0?`L`:`R`}`})},kl=(e,t)=>{let n=H(t.coat,`#f2efe8`,.85),r=H(t.coat,Pt,.4);e.joints.neck=[0,.5,.05],e.joints.shoulder=[.19,.4,.08],e.joints.hip=[.1,.15,-.02],e.joints.tail=[0,.22,-.18],Et(e,{belly:[[0,.28,-.02],[.23,.26,.21]],chest:[[0,.44,.03],[.2,.16,.19]],melt:.2}),mn(e,{r:[.24,.21,.25],at:[0,.15,.05],melt:.18});let i=Mn(e,{dy:-.02,len:.08,ra:.15,rb:.1,drop:.01,squash:[1.1,.72,1],melt:.08});rn(e,`body`,[0,.47,-.14],{len:.21,w:.04,d:.1,rot:[-.95,0,0],name:`dorsal`,melt:.05}),un(e,{len:.3,w:.09,d:.04,taper:.7,fwd:.3,out:.58}),sn(e,{r0:.06,r1:.05,foot:[.06,.035,.08]});let a=hl(.3,[0,-.05,-1],[.35,0,0],.1,[1,.8,.55,.4]),o=Vt(e,a),s=a.pts[a.pts.length-1],c=[e.joints.tail[0]+s[0],e.joints.tail[1]+s[1],e.joints.tail[2]+s[2]];rn(e,`tail2`,c,{len:.2,w:.04,d:.065,rot:[-.75,0,0],name:`tailFinUp`}),rn(e,`tail2`,c,{len:.12,w:.04,d:.055,rot:[-2.3,0,0],name:`tailFinDown`}),dn(e),Ut(e,{x:.45,y:.15,size:.9,wide:1.1,slant:.1,color:`#141018`}),xn(e,{w:.4,y:-.42,curve:.12,r:.008,out:.004}),El(e,.08,-.41,.03,.012,`#fbf8f1`,`tooth`),El(e,.2,-.385,.025,.0105,`#fbf8f1`,`toothB`);for(let n of[-1,1])[-.03,.035,.1].forEach((r,i)=>{wn(e,{bone:`body`,from:new x(0,.49,r),dir:new x(n,-.1,0),r:.011,stretch:3.6,along:new x(0,1,.3),color:H(t.coat,Pt,.7),sides:8,name:`gill${n>0?`L`:`R`}${i}`})});e.nose=i.nose;let l=It(e,`head`);return e.marks={base:t.coat,marks:[{color:n,f:U(W(e,`muzzle`),e=>e.p.y-(i.mid(e.p)-i.r*.15))},{color:n,f:U(W(e,`head`),e=>l(e).y+.12-l(e).z*.38,e=>-l(e).z-.25)},{color:n,f:Cl(e,[`belly`,`chest`],0,.3,.17,.27)},{color:r,f:W(e,`dorsal`,`tailFinUp`,`tailFinDown`)},{color:n,f:U(W(e,/^leg/),e=>e.p.y-.03)},{color:n,f:U(W(e,/^tail\d/),e=>-.02-(e.p.y-.22)+ +(o(e.p)>2))}]},{aquatic:!0}},Al=(e,t)=>{let n=H(t.coat,`#ffffff`,.5),r=H(t.coat,`#3a2a60`,.35);e.joints.neck=[0,.42,0],e.joints.shoulder=[.05,.32,.06],e.joints.hip=[.1,.36,0],e.joints.tail=[0,.4,-.1],Et(e,{belly:[[0,.4,0],[.13,.07,.13]],chest:[[0,.43,0],[.1,.05,.1]]}),mn(e,{r:[.33,.29,.33],at:[0,.14,0],melt:.06});let i=Zt(e),a=[0,e.joints.neck[1]+.14,0];for(let e=0;e<12;e++){let t=e/12*Math.PI*2;i.add(gn(`neck`,[Math.cos(t)*.31,a[1]-.06,Math.sin(t)*.31],[.055,.04,.055],{k:.03,name:`rim`}))}cn(e,{len:.22,r0:.05,r1:.035,paw:[.04,.035,.04],fwd:.25,out:.08}),Dt(e,{count:3,len:.4,r0:.05,r1:.04,root:[0,.38,0],rim:.23,spread:2.6,hang:.85,curl:.12,wave:.03,melt:.03}),dn(e),e.front=.28,e.sipLow=!0,Ut(e,{x:.3,y:-.12,size:1.1,wide:1,slant:0,color:`#1c1428`}),xn(e,{w:.14,y:-.32,curve:.08,r:.006,color:r});let o=e.shape.hr,s=Math.PI/180;return[[18,150,.06],[45,45,.048],[45,-45,.048],[52,115,.054],[52,-115,.054],[58,180,.058],[82,80,.042],[82,-80,.042],[86,145,.045],[86,-145,.045]].forEach(([n,r,i],c)=>{let l=new x(Math.sin(n*s)*Math.sin(r*s)*o[0],Math.cos(n*s)*o[1],Math.sin(n*s)*Math.cos(r*s)*o[2]);wn(e,{bone:`neck`,from:new x(0,a[1],0),dir:l,r:i,color:H(t.coat,`#ffffff`,.55),sides:12,name:`dome${c}`})}),e.marks={base:t.coat,marks:[{color:n,f:W(e,`rim`)},{color:n,f:W(e,/^arm/,/^fore/)},{color:H(t.coat,n,.5),f:U(W(e,/^leg/),e=>e.p.y-.12)}]},{aquatic:!0,legs:`tentacles`,hover:.3,jelly:!0}},jl=(e,t)=>{e.joints.neck=[0,.3,0],e.joints.shoulder=[.13,.26,.12],e.joints.hip=[.1,.18,-.02],e.joints.tail=[0,.25,-.18],Et(e,{belly:[[0,.22,0],[.22,.14,.2]],chest:[[0,.3,.02],[.2,.1,.18]]}),mn(e,{r:[.29,.31,.27],at:[0,.22,-.03],melt:.12});let n={len:.24,r0:.055,r1:.032,paw:[.035,.03,.04],fwd:.45,out:.35},r={count:3,len:.46,r0:.064,r1:.034,root:[.12,.15,-.02],spread:2.4,hang:.4,coil:2.7};return cn(e,n),Dt(e,r),Zt(e).add(gn(`body`,[0,.12,-.02],[.25,.045,.23],{k:.06,name:`skirt`})),dn(e),Tt(e,r,n,H(t.coat,`#fff3ec`,.55)),Ut(e,{x:.34,y:-.12,size:1.35,wide:1.05,slant:.05,color:`#1c1420`}),xn(e,{w:.16,y:-.42,curve:.08,r:.006}),Tl(e,`neck`,Il(e.joints.neck,[0,.22,-.03]),[[0,1.15,.05],[.55,.6,.045],[0,.3,.05],[1.05,.2,.04],[1.25,.8,.042],[.5,-.1,.038],[1.85,.55,.036],[.15,-.45,.034]],H(t.coat,`#fff3ec`,.4),`freckle`),e.marks={base:t.coat,marks:[]},{aquatic:!0,legs:`tentacles`}},Ml=(e,t)=>{let n=`#f2efe6`,r=H(t.coat,`#121419`,.22);e.joints.neck=[0,.6,.03],e.joints.shoulder=[.185,.5,0],e.joints.hip=[.085,.12,.03],e.joints.tail=[0,.14,-.15],Et(e,{belly:[[0,.31,.02],[.225,.3,.2]],chest:[[0,.5,.02],[.185,.16,.165]],melt:.18}),mn(e,{r:[.2,.19,.19],at:[0,.13,.02],melt:.14});let i=Yt(e,{dy:-.08,len:.1,w:.03,h:.028,drop:.25});un(e,{len:.32,w:.08,d:.027,taper:.75,fwd:-.06,out:.26}),sn(e,{r0:.05,r1:.04,foot:[.068,.024,.09],fwd:.07}),Zt(e).add(gn(`tail`,Il(e.joints.tail,[0,-.05,-.03]),[.05,.024,.052],{rot:[-.95,0,0],k:.05,anchor:e.joints.tail,reach:.12,name:`tailFan`})),dn(e),Ut(e,{x:.38,y:.14,size:.9,wide:1,slant:0,color:`#141018`,ring:n,ringSize:1.55}),e.nose=i;let a=It(e,`head`),o=e.joints.neck,s=[1.05,1.3,1.32,1.2,1,.9];return e.marks={base:t.coat,marks:[{color:`#e8892e`,f:W(e,`beak`,/^leg/)},{color:r,f:W(e,`armL`,`armLPaw`,`armR`,`armRPaw`)},{color:`#f2c14e`,f:e=>{if(Math.abs(e.p.x)<.1)return 1;let t=Rt(e.p.z,e.p.y,o[2]+.01,o[1]+.1,o[2]+.09,o[1]-.02);return t.d-(.045-.025*t.t)}},{color:n,f:U(W(e,`head`,`belly`,`chest`),e=>Math.atan2(Math.abs(e.p.x),e.p.z+.02)-ml(s,Ge.clamp(e.p.y/.66,0,1)),e=>{let t=a(e);return t.y+.1+.42*Math.abs(t.x)})}]},{aquatic:!0}},Nl=(e,t)=>{let n=`#e8892e`,r=H(t.coat,`#ffffff`,.35);e.joints.neck=[0,.56,.05],e.joints.shoulder=[.19,.45,-.02],e.joints.hip=[.08,.12,.02],e.joints.tail=[0,.22,-.2],Et(e,{belly:[[0,.3,-.02],[.24,.28,.22]],chest:[[0,.46,.05],[.19,.14,.17]],melt:.18}),mn(e,{r:[.2,.19,.19],at:[0,.16,.03],melt:.14});let i=Yt(e,{dy:-.12,len:.13,w:.075,h:.028,drop:.12,flat:!0}),a={dy:-.12,len:.13,drop:.12};rn(e,`neck`,V(Gt(e,0,.92,-.02).add(new x(...e.joints.neck))),{len:.08,w:.025,d:.015,rot:[-.5,0,0],name:`tuft`,melt:.02}),un(e,{len:.4,w:.14,d:.04,fwd:-.05,out:.18}),sn(e,{r0:.045,r1:.04,foot:[.065,.025,.09],fwd:.06}),rn(e,`tail`,e.joints.tail,{len:.13,w:.08,d:.024,rot:[-.65,0,0],name:`tailFan`}),dn(e),Ut(e,{x:.38,y:.18,size:.9,wide:1,slant:0,color:`#141018`}),Ol(e,{...a,at:.42,gap:.022,r:.0095,color:H(n,`#5a2a10`,.55)});let o=H(t.coat,Pt,.32);for(let t of[`L`,`R`]){let n=Zt(e).named(`arm${t}Paw`).c;[-.5,0,.5].forEach((r,i)=>{let a=new x((t===`L`?1:-1)*(.25+r*.3),-.55+r*.35,-1).normalize(),s=jn(e,n,a);if(!s)return;let c=.085-Math.abs(r)*.03;An(e,{bone:`fore${t}`,pts:[s.p.clone().addScaledVector(a,-.02),s.p.clone().addScaledVector(a,c*.5),s.p.clone().addScaledVector(a,c)],w:[.024,.02,0],t:[.006,.005,0],across:new x(1,0,0).cross(a).normalize(),colors:[o,o],name:`quill${t}${i}`})})}return e.nose=i,e.marks={base:t.coat,marks:[{color:n,f:W(e,`beak`,/^leg/)},{color:H(t.coat,Pt,.12),f:W(e,`armL`,`armLPaw`,`armR`,`armRPaw`)},{color:r,f:Cl(e,[`belly`,`chest`],0,.3,.17,.22)}]},{aquatic:!0}},Pl=(e,t)=>{let n=H(t.coat,`#c98593`,.42),r=H(t.coat,`#c8a890`,.45),i=H(t.coat,Ot,.6);e.joints.neck=[0,.5,.02],e.joints.shoulder=[.12,.45,0],e.joints.hip=[.07,.2,-.01],e.joints.tail=[0,.2,-.12],Et(e,{belly:[[0,.33,0],[.17,.2,.15]],chest:[[0,.44,.02],[.15,.1,.14]]}),mn(e,{r:[.22,.2,.2],at:[0,.15,.03],cheeks:[[.1,-.08,.03],[.08,.07,.08]]});let a=Mn(e,{dy:-.3,len:.04,ra:.075,rb:.06,drop:0,squash:[1.1,.85,1]});On(e,{x:.5,y:.62,w:.095,h:.22,d:.035,splay:.42,rake:.05,cup:.5,notch:!0}),Jt(e,{len:.46,span:.3,d:.022,fingers:[.4,.66,.9],elbow:.34}),sn(e,{r0:.032,r1:.026,foot:[.035,.02,.05]}),dn(e),Ut(e,{x:.36,y:.08,size:1.1,wide:1,slant:.05,color:`#140c10`}),Kt(e,`#3a2a30`,gl(e,a.nose,.004),.02,.016),xn(e,{w:.18,y:-.55,curve:.08,r:.006}),El(e,.075,-.535,.03,.0085);let o=[`earL`,`earR`].map(t=>en(e,t));return e.marks={base:t.coat,marks:[{color:i,f:Sn(...o.map(e=>e.inner))},{color:n,f:W(e,`armLWeb`,`armRWeb`,`armLHand`,`armRHand`)},{color:r,f:W(e,`muzzle`)},{color:r,f:Cl(e,[`belly`,`chest`],0,.36,.11,.15)}]},{hover:.22,flaps:!0}},Fl=(e,t)=>{let n=H(t.coat,`#fff6c8`,.6),r=H(t.coat,Pt,.36);e.joints.neck=[0,.34,.08],e.joints.shoulder=[.15,.3,.12],e.joints.hip=[.14,.14,-.06],e.joints.tail=[0,.15,-.2],Et(e,{belly:[[0,.2,-.04],[.24,.19,.22]],chest:[[0,.3,.04],[.2,.12,.18]],haunch:[[.15,.14,-.08],[.1,.1,.15]]}),mn(e,{r:[.27,.16,.22],at:[0,.1,.05],melt:.12});let i=Zt(e),a=new x(...e.joints.neck).add(new x(0,.1,.05));for(let e of[-1,1])i.add(gn(`neck`,[e*.14,a.y+.12,a.z+.05],[.075,.07,.07],{k:.05,name:e>0?`moundL`:`moundR`}));return Nt(e,`throat`,`neck`,[0,-.02,.15]),i.add(gn(`throat`,[0,e.joints.neck[1]-.02,e.joints.neck[2]+.15],[.13,.06,.08],{k:.04,anchor:[0,e.joints.neck[1]-.02,e.joints.neck[2]+.15],reach:.12,name:`throat`})),cn(e,{len:.2,r0:.045,r1:.035,paw:[.045,.02,.05],fwd:.5,out:.25}),sn(e,{r0:.055,r1:.045,foot:[.07,.024,.11],fwd:.06}),dn(e),Ut(e,{x:.52,y:.62,size:1.05,wide:1.05,slant:0,color:`#141018`}),xn(e,{w:.6,y:-.25,curve:.08,r:.0075}),wl(e,[[.9,.2,.034]],H(t.coat,`#4a3a20`,.4),`drum`),Tl(e,`body`,[0,.22,-.02],[[0,.55,.038],[.42,.2,.033],[.5,.85,.03],[.95,.5,.03],[.85,-.05,.028],[1.35,.22,.025]],r,`spot`),Tl(e,`neck`,Il(e.joints.neck,[0,.1,.05]),[[0,.75,.03],[.55,.45,.024]],r,`headSpot`),e.marks={base:t.coat,marks:[{color:n,f:W(e,`throat`)},{color:n,f:Cl(e,[`belly`,`chest`],0,.2,.17,.16)}]},{aquatic:!0}},Il=(e,t)=>[e[0]+t[0],e[1]+t[1],e[2]+t[2]];function Ll(e){return Array.from({length:e},(t,n)=>{let r=1-2*(n+.5)/e,i=Math.sqrt(1-r*r),a=n*Math.PI*(3-Math.sqrt(5));return new x(Math.cos(a)*i,r,Math.sin(a)*i)})}function Rl(e,t,n,r,i,a=.03){let o=Zt(e);for(let e=0;e+1<n.length;e++)o.add(ln(t,n[e],n[e+1],r[e],r[e+1],{k:e===0?a:.02,anchor:n[0],reach:.08,name:`${i}${e}`,thin:!0}))}var zl=(e,t)=>{let n=H(t.coat,`#ffffff`,.45),r=H(t.coat,`#5a2a4a`,.38);e.joints.neck=[0,.36,.02],e.joints.shoulder=[.13,.33,.1],e.joints.hip=[.1,.18,-.02],e.joints.tail=[0,.3,-.15],Et(e,{belly:[[0,.25,0],[.17,.11,.16]],chest:[[0,.33,.02],[.16,.08,.15]]}),mn(e,{r:[.21,.17,.19],at:[0,.1,.03],melt:.1});let i=Zt(e),a=e.joints.neck;return i.add(gn(`neck`,[0,a[1]+.31,a[2]-.05],[.145,.27,.135],{k:.08,name:`mantle`})),i.add(ln(`neck`,[0,a[1]+.45,a[2]-.05],[0,a[1]+.68,a[2]-.06],.105,.025,{k:.06,name:`mantleTip`})),rn(e,`neck`,[.07,a[1]+.5,a[2]-.05],{len:.14,w:.08,d:.034,rot:[0,0,-.8],name:`finL`,melt:.04}),rn(e,`neck`,[-.07,a[1]+.5,a[2]-.05],{len:.14,w:.08,d:.034,rot:[0,0,.8],name:`finR`,melt:.04}),cn(e,{len:.24,r0:.045,r1:.034,paw:[.036,.03,.045],fwd:.75,out:.3}),e.lift=.12,Dt(e,{count:3,len:.24,r0:.042,r1:.03,root:[.08,.15,-.01],rim:.08,spread:2.3,hang:.7,curl:.06,melt:.09}),dn(e),Ut(e,{x:.5,y:.02,size:1.35,wide:1,slant:0,color:`#141018`,ring:n,ringSize:1.4}),xn(e,{w:.12,y:-.42,curve:.06,r:.006}),Dl(e,`neck`,[0,a[1]+.31,a[2]-.05],[.145,.27,.135],44,e=>Math.abs(e.y-.19)>.2&&e.y<.5&&e.y>(e.z>0?-.15:-.45),.023,r,`spot`),e.marks={base:t.coat,marks:[{color:r,f:W(e,`finL`,`finR`,`mantleTip`)},{color:r,f:U(W(e,`mantle`),e=>Math.abs(e.p.y-(a[1]+.36))-.035)},{color:n,f:U(W(e,/^leg/,/^fore/,`armLPaw`,`armRPaw`),e=>e.p.y-.05)}]},{aquatic:!0,legs:`tentacles`}},Bl=(e,t)=>{let n=H(t.coat,Ft,.72),r=H(t.coat,`#2e2016`,.5),i=H(r,Ft,.42);e.joints.neck=[0,.44,.07],e.joints.shoulder=[.14,.34,.13],e.joints.hip=[.1,.13,-.02],e.joints.tail=[0,.15,-.2];let a=[0,.28,-.03],o=[.23,.21,.2];Et(e,{belly:[a,o],chest:[[0,.38,.05],[.17,.12,.16]],melt:.18});let s=[0,.1,.07],c=[.17,.15,.16];mn(e,{r:c,at:s,melt:.12});let l=Mn(e,{dy:-.22,len:.1,ra:.065,rb:.03,drop:.03,squash:[1,.9,1],thin:!0});On(e,{x:.62,y:.42,w:.05,h:.06,d:.03,round:!0,splay:.3,rake:.1,cup:.5}),cn(e,{len:.13,r0:.04,r1:.035,paw:[.036,.026,.042],fwd:.7,out:.2}),sn(e,{r0:.046,r1:.04,foot:[.046,.026,.07],fwd:.04}),dn(e);let u=Il(e.joints.neck,s),d=(e,t=0)=>Math.max(e.z-.3-t,-.15-t-e.y),f=(e,t=0)=>Math.max(e.z+.05-e.y*.4-t,-.2-t-e.y),p=new x(0,u[1]+.06,u[2]+.2),m=0,h=(t,n,a,o,s)=>{for(let c of Ll(o)){if(s(c)>-.04)continue;let o=jn(e,new x(...n),new x(c.x*a[0],c.y*a[1],c.z*a[2]));if(!o)continue;let{p:l,n:u}=o,d=l.clone().sub(p);d.addScaledVector(u,-d.dot(u)).normalize();let f=d.multiplyScalar(Math.cos(.6)).addScaledVector(u,Math.sin(.6)).normalize(),h=.15+m*7%5*.008,g=[l.clone().addScaledVector(u,-.03),l.clone().addScaledVector(f,h*.55),l.clone().addScaledVector(f,h)],_=m%3==0;An(e,{bone:t,pts:g,w:[.036,.02,0],t:[.017,.011,0],across:new x().crossVectors(u,f),colors:[r,_?i:r],name:`spike${m++}`})}};h(`body`,a,o,90,d),h(`neck`,u,c,50,f),Ut(e,{x:.4,y:.06,size:.85,wide:1,slant:.05,color:`#140e0c`}),Kt(e,Lt,gl(e,l.nose),.024,.018);let g=[`earL`,`earR`].map(t=>en(e,t)),_=(e,t,n)=>new x((e.p.x-t[0])/n[0],(e.p.y-t[1])/n[1],(e.p.z-t[2])/n[2]).normalize();return e.marks={base:n,marks:[{color:H(t.coat,`#e8a0a0`,.6),f:Sn(...g.map(e=>e.inner))},{color:H(n,r,.6),f:W(e,`armLPaw`,`armRPaw`)},{color:H(n,r,.6),f:U(W(e,/^leg/),e=>e.p.y-.045)},{color:r,f:U(W(e,`belly`,`chest`),e=>d(_(e,a,o),.06)*.2)},{color:r,f:U(W(e,`head`),e=>f(_(e,u,c),.06)*.15)}]},{}},Vl=(e,t)=>{let n=H(t.coat,`#c0306a`,.55),r=H(n,`#d02060`,.3),i=H(t.coat,`#ffffff`,.4);e.joints.neck=[0,.5,.06],e.joints.shoulder=[.15,.4,.1],e.joints.hip=[.1,.15,-.04],e.joints.tail=[0,.2,-.18],Et(e,{belly:[[0,.28,-.02],[.19,.22,.18]],chest:[[0,.42,.04],[.16,.12,.15]]});let a=[0,.1,.05];mn(e,{r:[.25,.155,.2],at:a,melt:.12});let o=Il(e.joints.neck,a);for(let t of[-1,1])for(let n=0;n<3;n++){let i=.35+n*.5,a=[t*.2,o[1]-.03+n*.045,o[2]-.06],s=[t*(.2+Math.cos(i)*.08),a[1]+Math.sin(i)*.08,a[2]-.035],c=[t*(.2+Math.cos(i+.25)*.15),a[1]+Math.sin(i+.25)*.15,a[2]-.06];Rl(e,`neck`,[a,s,c],[.032,.03,.028],`gill${t>0?`L`:`R`}${n}_`);let l=new x(...a),u=new x(...c).sub(l),d=u.length();u.normalize();let f=new x(-u.y,u.x,0).normalize();[.32,.52,.72,.92].forEach((i,a)=>{let o=l.clone().addScaledVector(u,d*i),s=f.clone().multiplyScalar(a%2?1:-1).addScaledVector(u,.75).add(new x(0,0,.35)).normalize();An(e,{bone:`neck`,pts:[o,o.clone().addScaledVector(s,.046),o.clone().addScaledVector(s,.072)],w:[.008,.0065,0],t:[.0055,.0045,0],across:new x(0,0,1),colors:[r,r],name:`frill${t>0?`L`:`R`}${n}_${a}`})})}cn(e,{len:.17,r0:.04,r1:.033,paw:[.042,.02,.045],fwd:.5,out:.3}),sn(e,{r0:.05,r1:.042,foot:[.05,.022,.07]});let s=hl(.46,[0,-.35,-1],[.25,.2,0],.085,[1,.85,.7,.5,.3]),c=Vt(e,s),l=s.pts[Math.round(s.pts.length*.55)];return rn(e,`tail1`,Il(e.joints.tail,l),{len:.07,w:.04,d:.12,rot:[.25,0,0],name:`tailFin`,melt:.04}),dn(e),Ut(e,{x:.55,y:.18,size:.7,wide:1,slant:0,color:`#141018`}),xn(e,{w:.55,y:-.32,curve:.1,r:.0065}),e.marks={base:t.coat,marks:[{color:n,f:W(e,/^gill/)},{color:i,f:W(e,`tailFin`)},{color:i,f:Cl(e,[`belly`,`chest`],0,.3,.14,.2)},{color:i,f:U(W(e,/^tail\d/),e=>.12-c(e.p)+ +(e.p.y>.2))}]},{aquatic:!0}},Hl=(e,t)=>{let n=H(t.coat,Ft,.6),r=H(t.coat,`#5a3424`,.5);e.joints.neck=[0,.5,.06],e.joints.shoulder=[.12,.42,.08],e.joints.hip=[.09,.16,-.03],e.joints.tail=[0,.19,-.15],Et(e,{belly:[[0,.28,-.02],[.16,.2,.15]],chest:[[0,.42,.03],[.13,.11,.12]]}),mn(e,{r:[.2,.15,.19],at:[0,.12,.06],melt:.1}),Mn(e,{dy:-.2,len:.06,ra:.12,rb:.085,drop:.02,squash:[1.2,.62,1]}),cn(e,{len:.2,r0:.035,r1:.03,paw:[.052,.02,.05],fwd:.45,out:.35}),sn(e,{r0:.045,r1:.036,foot:[.06,.02,.07]});let i=Vt(e,hl(.6,[0,-.45,-1],[.9,.35,0],.08,[1,.92,.8,.62,.45,.32]));return dn(e),Ut(e,{x:.5,y:.3,size:1.5,wide:1,slant:0,color:`#1a1410`,ring:`#e2b040`,ringSize:1.3}),xn(e,{w:.6,y:-.3,curve:.1,r:.006}),Dl(e,`neck`,Il(e.joints.neck,[0,.12,.06]),[.2,.15,.19],40,e=>e.z<.3&&e.y>-.1,.017,r,`headSpot`),Dl(e,`body`,[0,.3,-.02],[.16,.22,.15],44,e=>e.z<.15&&e.y>(Math.abs(e.x)<.5?-.25:-.6)&&e.y<.85,.018,r,`spot`),e.marks={base:t.coat,marks:[{color:n,f:Cl(e,[`belly`,`chest`],0,.3,.12,.2)},{color:r,f:U(W(e,/^tail\d/),e=>.55-Math.sin(i(e.p)*Math.PI*7))}]},{}},Ul=(e,t)=>{let n=H(t.coat,`#e8b8a8`,.65),r=H(t.coat,Pt,.75),i=[H(t.coat,`#f2c890`,.22),t.coat,H(t.coat,`#6a2e12`,.2)];e.joints.neck=[0,.6,.08],e.joints.shoulder=[.17,.48,.13],e.joints.hip=[.12,.2,-.05],e.joints.tail=[0,.32,-.24];let a=[0,.36,-.04],o=[.25,.24,.24],s=[.13,.22,-.08];Et(e,{belly:[a,o],chest:[[0,.5,.05],[.2,.15,.19]],haunch:[s,[.11,.13,.16]],melt:.2});let c=[0,.11,.08];mn(e,{r:[.2,.165,.175],at:c,melt:.12});let l=Mn(e,{dy:-.36,len:.08,ra:.12,rb:.105,drop:.03,squash:[1.15,.8,1]});On(e,{x:.85,y:.15,w:.065,h:.11,d:.03,splay:1.35,rake:.1,cup:.5,round:!0});let u=Zt(e),d=Il(e.joints.neck,c);for(let t of[-1,1])Rl(e,`neck`,[[t*.13,d[1]+.12,d[2]-.02],[t*.26,d[1]+.13,d[2]-.01],[t*.36,d[1]+.2,d[2]],[t*.39,d[1]+.3,d[2]+.02]],[.042,.036,.029,.021],`horn${t>0?`L`:`R`}_`,.04);u.add(gn(`neck`,[0,d[1]+.11,d[2]+.06],[.17,.08,.13],{k:.06,name:`forelock`})),cn(e,{len:.3,r0:.07,r1:.06,paw:[.06,.048,.065],fwd:.3,out:.16}),sn(e,{r0:.08,r1:.066,foot:[.066,.048,.08]});let f=Vt(e,hl(.3,[0,-.85,-.5],[0,0,0],.035,[1,.9,.9,1.5,1.9]));dn(e);let p=0,m=(t,n,r,a,o=.036,s=new x(0,-1,0))=>{let c=jn(e,n,r);if(!c)return;let{p:l,n:u}=c,d=new x(u.x,0,u.z).normalize(),f=s.clone().addScaledVector(d,.45).normalize(),m=[l.clone().addScaledVector(u,-.025),l.clone().addScaledVector(f,a*.55).addScaledVector(d,.012),l.clone().addScaledVector(f,a).addScaledVector(d,.03)],h=i[(p*5+1)%3];An(e,{bone:t,pts:m,w:[o,o*.75,0],t:[.014,.011,0],across:new x().crossVectors(f,d),colors:[h,h],name:`lock${p++}`})},h=new x(...a);[.5,.12,-.25].forEach((e,t)=>{let n=12+t;for(let r=0;r<n;r++){let i=(r+t%2*.5)/n*Math.PI*2,a=new x(Math.sin(i)*o[0],e*o[1],Math.cos(i)*o[2]);m(`body`,h,a,t===0?.15:.17,.04)}});for(let e of[-1,1]){let t=new x(e*s[0],s[1],s[2]);for(let n=0;n<3;n++)m(`body`,t,new x(e,.3-n*.3,-.4+n*.35),.13,.036)}let g=new x(...d),_=(e,t,n)=>m(`neck`,g.clone().add(new x(0,t,0)),new x(e,.25,1),n,.034,new x(e*.4,-1,.25));for(let e of[-.95,-.6,-.15,.15,.6,.95])_(e,.08,.19);for(let e of[-.8,-.38,.38,.8])_(e,.1,.12);for(let e of[-1,1])for(let t=0;t<3;t++)m(`neck`,g,new x(e,-.25-t*.25,.55-t*.2),.12,.032);return Ut(e,{x:.38,y:-.2,size:.8,wide:1.15,slant:.05,color:`#1a1412`}),Kt(e,H(n,Pt,.45),gl(e,l.nose),.04,.022),e.marks={base:t.coat,marks:[{color:`#4a3e34`,f:U(W(e,/^horn/),e=>d[1]+.25-e.p.y)},{color:`#ece0c4`,f:W(e,/^horn/)},{color:n,f:U(W(e,`muzzle`),e=>-e.p.z+d[2]+.2)},{color:i[0],f:W(e,`forelock`)},{color:r,f:U(W(e,/^leg/),e=>e.p.y-.06)},{color:r,f:U(W(e,`armLPaw`,`armRPaw`),t=>t.p.y-(e.joints.shoulder[1]-.36))},{color:i[2],f:U(W(e,/^tail\d/),e=>.75-f(e.p))}]},{}},Wl=(e,t)=>{let n=H(t.coat,Ft,.85),r=H(t.coat,`#2b211d`,.72);e.joints.neck=[0,.66,.07],e.joints.shoulder=[.11,.52,.12],e.joints.hip=[.09,.24,-.06],e.joints.tail=[0,.36,-.2],Et(e,{belly:[[0,.39,-.06],[.17,.2,.17]],chest:[[0,.52,.04],[.14,.14,.13]],haunch:[[.1,.28,-.08],[.09,.11,.13]],ruff:[[0,.62,.06],[.09,.09,.09]],melt:.2});let i=[0,.15,.06];mn(e,{r:[.15,.145,.155],at:i});let a=Mn(e,{dy:-.3,len:.11,ra:.075,rb:.052,drop:.045,squash:[1,.85,1],thin:!0});On(e,{x:.8,y:.3,w:.065,h:.17,d:.035,splay:1.05,rake:.12,cup:.55,long:!0});let o=Il(e.joints.neck,i);for(let t of[-1,1]){let n=t>0?`antlerL`:`antlerR`,r=[t*.07,o[1]+.12,o[2]-.02],i=[t*.12,o[1]+.22,o[2]-.04];Nt(e,n,`neck`,[r[0]-e.joints.neck[0],r[1]-e.joints.neck[1],r[2]-e.joints.neck[2]]),Rl(e,n,[r,i,[t*.17,o[1]+.31,o[2]-.07]],[.027,.024,.021],`${n}_`),Rl(e,n,[i,[t*.13,o[1]+.28,o[2]+.04]],[.024,.021],`${n}T`)}cn(e,{len:.32,r0:.045,r1:.036,paw:[.036,.032,.045],fwd:.3,out:.12}),sn(e,{r0:.05,r1:.036,foot:[.036,.032,.05]});let s=e.joints.tail;Zt(e).add(gn(`tail`,[s[0],s[1]+.02,s[2]-.03],[.05,.065,.04],{k:.025,anchor:s,reach:.07,name:`bob`})),dn(e),Ut(e,{x:.45,y:.1,size:1.1,wide:1.15,slant:.12,color:`#1a1210`}),Kt(e,Lt,gl(e,a.nose),.026,.02);let c=[`earL`,`earR`].map(t=>en(e,t)),l=[{a:.3,top:.6,n:5,r:.028},{a:.72,top:.565,n:4,r:.027},{a:1.12,top:.53,n:3,r:.022},{a:1.5,top:.5,n:3,r:.02}];for(let t of[-1,1])l.forEach(({a:r,top:i,n:a,r:o},s)=>{for(let c=0;c<a;c++){let a=i-c*.07,l=r+c%2*.06-.03;wn(e,{bone:`body`,from:new x(0,a,-.03),dir:new x(t*Math.sin(l),0,-Math.cos(l)),r:o,stretch:1.15,color:n,name:`spot${t>0?`L`:`R`}${s}_${c}`})}});let u=s[1]+.02;return e.marks={base:t.coat,marks:[{color:`#e4d6b8`,f:W(e,/^antler/)},{color:n,f:Sn(...c.map(e=>e.inner))},{color:r,f:Sn(...c.map(e=>e.back))},{color:n,f:U(W(e,`muzzle`),e=>e.p.y-(a.mid(e.p)-a.r*.2))},{color:n,f:U(W(e,`chest`,`ruff`),e=>-e.p.z,e=>Math.hypot(e.p.x/.07,(e.p.y-.6)/.06)-1)},{color:n,f:Cl(e,[`belly`],0,.3,.1,.12)},{color:n,f:U(W(e,`bob`),e=>e.p.y-u+(e.p.z-s[2])*.6)},{color:n,f:U(W(e,`belly`,`haunchL`,`haunchR`),e=>e.p.z+.17,e=>Math.hypot(e.p.x/.075,(e.p.y-.33)/.075)-1)},{color:r,f:U(W(e,/^leg/),e=>e.p.y-.06)},{color:r,f:U(W(e,`armLPaw`,`armRPaw`),t=>t.p.y-(e.joints.shoulder[1]-.37))}]},{}},Gl=(e,t)=>{let n=H(t.coat,Ft,.7),r=H(t.coat,`#33241a`,.68);e.joints.neck=[0,.56,.05],e.joints.shoulder=[.17,.47,.06],e.joints.hip=[.1,.16,-.03],e.joints.tail=[0,.2,-.18],Et(e,{belly:[[0,.32,-.03],[.21,.23,.19]],chest:[[0,.46,.03],[.18,.13,.16]],melt:.2}),mn(e,{r:[.19,.17,.17],at:[0,.12,.06],melt:.12});let i=Mn(e,{dy:-.26,len:.04,ra:.075,rb:.065,drop:.01,squash:[1.2,.85,1]});cn(e,{len:.36,r0:.05,r1:.042,paw:[.045,.035,.05],fwd:.3,out:.32});let a=Zt(e);for(let t of[`L`,`R`]){let n=a.named(`arm${t}Paw`).c;for(let r=-1;r<=1;r++){let i=[n.x+r*.025,n.y-.015,n.z+.025];Rl(e,`fore${t}`,[i,[i[0],i[1]-.05,i[2]+.025],[i[0],i[1]-.085,i[2]+.005]],[.018,.016,.014],`claw${t}${r+1}_`,.02)}}sn(e,{r0:.055,r1:.046,foot:[.05,.03,.07]}),dn(e),Ut(e,{x:.36,y:.08,size:.8,wide:1,slant:0,color:`#140e0c`}),Kt(e,H(t.coat,`#1a1210`,.85),gl(e,i.nose),.03,.022),xn(e,{w:.24,y:-.48,curve:.08,r:.006}),wl(e,[[.55,.04,.025]],r,`stripe`,{stretch:2.9,along:[1,-.22,0],sides:12});let o=It(e,`head`),s=W(e,`head`,`muzzle`);return e.marks={base:t.coat,marks:[{color:`#ece2c8`,f:W(e,/^claw/)},{color:n,f:U(s,e=>.05-o(e).z)},{color:n,f:W(e,`muzzle`)}]},{sleepy:!0}},Kl=(e,t)=>{let n=H(t.coat,`#f2eee6`,.55),r=H(t.coat,Pt,.35);e.joints.neck=[0,.56,.05],e.joints.shoulder=[.18,.44,.06],e.joints.hip=[.08,.1,-.02],e.joints.tail=[0,.12,-.18],Et(e,{belly:[[0,.3,-.02],[.22,.28,.21]],chest:[[0,.46,.03],[.18,.15,.17]],melt:.2}),mn(e,{r:[.18,.165,.17],at:[0,.13,.04],melt:.14});let i=Mn(e,{dy:-.28,len:.05,ra:.085,rb:.07,drop:.015,squash:[1.25,.8,1]});un(e,{len:.28,w:.09,d:.03,taper:.75,fwd:.15,out:.32}),sn(e,{r0:.05,r1:.045,foot:[.075,.024,.1],fwd:.02}),dn(e),Ut(e,{x:.4,y:.1,size:1.25,wide:1,slant:0,color:`#120e10`}),Kt(e,`#2a2224`,gl(e,i.nose),.028,.02),Ct(e,t.coat,{len:.1,sweep:.15,color:`#e8e0d4`}),xn(e,{w:.18,y:-.52,curve:.06,r:.006});let a=H(t.coat,Pt,.42);return Dl(e,`body`,[0,.33,-.02],[.22,.28,.21],46,e=>e.z<.25&&e.y<.75&&e.y>-.55,.017,a,`speck`),Dl(e,`neck`,Il(e.joints.neck,[0,.13,.04]),[.18,.165,.17],22,e=>e.z<.1&&e.y>-.1,.014,a,`headSpeck`),e.marks={base:t.coat,marks:[{color:n,f:W(e,`muzzle`)},{color:n,f:Cl(e,[`belly`,`chest`],0,.32,.16,.26)},{color:r,f:U(W(e,/^leg/),e=>e.p.y-.05)}]},{aquatic:!0}},ql=(e,t)=>{let n=H(t.coat,`#e8c8a0`,.45),r=H(t.coat,`#3a3034`,.6);e.joints.neck=[0,.52,.06],e.joints.shoulder=[.16,.42,.08],e.joints.hip=[.1,.14,-.03],e.joints.tail=[0,.2,-.2],Et(e,{belly:[[0,.29,-.03],[.2,.25,.2]],chest:[[0,.43,.03],[.17,.13,.16]],melt:.2}),mn(e,{r:[.17,.15,.16],at:[0,.12,.05],melt:.12});let i=Yt(e,{dy:-.18,len:.16,w:.09,h:.028,flat:!0,drop:.12}),a={dy:-.18,len:.16,drop:.12};cn(e,{len:.18,r0:.045,r1:.036,paw:[.05,.02,.05],fwd:.5,out:.3}),sn(e,{r0:.05,r1:.042,foot:[.06,.022,.08]});let o=e.joints.tail;return Zt(e).add(gn(`tail`,[o[0],o[1]-.06,o[2]-.13],[.12,.045,.16],{rot:[-.4,0,0],k:.05,anchor:o,reach:.12,name:`paddle`})),dn(e),Ut(e,{x:.5,y:.25,size:.75,wide:1,slant:0,color:`#120e10`}),Ol(e,{...a,at:.78,gap:.02,r:.0085,color:`#1c181a`}),wl(e,[[.6,.12,.024]],n,`cheek`,{stretch:1.3,along:[1,.3,0]}),e.nose=i,e.marks={base:t.coat,marks:[{color:`#4a4448`,f:W(e,`beak`)},{color:r,f:W(e,`armLPaw`,`armRPaw`)},{color:r,f:U(W(e,/^leg/),e=>e.p.y-.045)},{color:n,f:Cl(e,[`belly`,`chest`],0,.3,.15,.24)}]},{aquatic:!0}},Jl=(e,t)=>{let n=`#26242a`;e.joints.neck=[0,.58,.05],e.joints.shoulder=[.17,.48,.1],e.joints.hip=[.11,.17,-.04],e.joints.tail=[0,.2,-.22],Et(e,{belly:[[0,.32,-.04],[.24,.26,.23]],chest:[[0,.48,.03],[.2,.15,.18]],haunch:[[.13,.18,-.06],[.11,.12,.15]],melt:.2}),mn(e,{r:[.2,.18,.18],at:[0,.13,.06],cheeks:[[.12,-.06,.04],[.09,.08,.09]]});let r=Mn(e,{dy:-.28,len:.05,ra:.08,rb:.065,drop:.02,squash:[1.15,.85,1]});On(e,{x:.62,y:.68,w:.065,h:.075,d:.035,round:!0,splay:.3,rake:.1}),cn(e,{len:.27,r0:.07,r1:.06,paw:[.06,.045,.065],fwd:.35,out:.15}),sn(e,{r0:.075,r1:.065,foot:[.065,.045,.085]});let i=e.joints.tail;Zt(e).add(gn(`tail`,[i[0],i[1]+.01,i[2]-.02],[.05,.05,.04],{k:.025,anchor:i,reach:.07,name:`puff`})),dn(e),Ut(e,{x:.38,y:.1,size:.85,wide:1,slant:.1,color:`#120e10`,ring:n,ringSize:1.8,out:.006}),Kt(e,n,gl(e,r.nose),.032,.022);let a=It(e,`head`);return e.marks={base:t.coat,marks:[{color:n,f:W(e,`earL`,`earR`)},{color:n,f:U(W(e,`head`,`cheekL`,`cheekR`),e=>{let t=a(e),n=Math.abs(t.x)-.38,r=t.y-.08,i=.5,o=n*Math.cos(i)+r*Math.sin(i),s=-n*Math.sin(i)+r*Math.cos(i);return Math.max(Math.hypot(o/.2,s/.29)-1,.2-t.z)})},{color:n,f:W(e,`armL`,`armR`,`foreL`,`foreR`,`armLPaw`,`armRPaw`)},{color:n,f:U(W(e,`chest`,`belly`),e=>Math.abs(e.p.y-.54-e.p.z*.25)-.075,e=>-Math.max(.05-e.p.z,Math.abs(e.p.x)-.13))},{color:n,f:W(e,/^leg/,`haunchL`,`haunchR`)}]},{}},Yl=(e,t)=>{let n=H(t.coat,`#e8d4b4`,.6),r=H(t.coat,Pt,.3);e.joints.neck=[0,.66,.07],e.joints.shoulder=[.12,.54,.1],e.joints.hip=[.09,.16,-.03],e.joints.tail=[0,.18,-.16],Et(e,{belly:[[0,.32,-.03],[.17,.28,.17]],chest:[[0,.53,.04],[.14,.15,.14]],melt:.22}),mn(e,{r:[.15,.13,.15],at:[0,.11,.06]});let i=Mn(e,{dy:-.22,len:.06,ra:.075,rb:.065,drop:.015,squash:[1.25,.82,1]});On(e,{x:.78,y:.5,w:.035,h:.04,d:.025,round:!0,splay:.6,rake:.1}),cn(e,{len:.18,r0:.04,r1:.034,paw:[.04,.03,.045],fwd:.8,out:.15}),sn(e,{r0:.05,r1:.042,foot:[.05,.024,.085]});let a=Vt(e,hl(.5,[0,-.6,-1],[.3,.45,0],.075,[1,.9,.75,.55,.35]));dn(e),Ut(e,{x:.42,y:.12,size:.85,wide:1,slant:.05,color:`#120e10`}),Kt(e,`#2a1e1a`,gl(e,i.nose),.028,.02),Ct(e,t.coat,{len:.09,color:`#e8ddd0`}),xn(e,{w:.16,y:-.5,curve:.06,r:.006});let o=It(e,`head`);return e.marks={base:t.coat,marks:[{color:n,f:W(e,`muzzle`)},{color:n,f:U(W(e,`head`),e=>o(e).y+.1,e=>.1-o(e).z)},{color:n,f:U(W(e,`chest`,`belly`),e=>-e.p.z,e=>Math.hypot(e.p.x/.09,(e.p.y-.6)/.09)-1)},{color:r,f:W(e,`armLPaw`,`armRPaw`)},{color:r,f:U(W(e,/^leg/),e=>e.p.y-.045)},{color:r,f:U(W(e,/^tail\d/),e=>.55-a(e.p))}]},{aquatic:!0}},Xl=(e,t)=>{let n=H(t.coat,Pt,.45);e.joints.neck=[0,.58,.07],e.joints.shoulder=[.17,.46,.11],e.joints.hip=[.12,.18,-.05],e.joints.tail=[0,.24,-.25],Et(e,{belly:[[0,.33,-.05],[.24,.27,.25]],chest:[[0,.47,.04],[.2,.15,.19]],haunch:[[.13,.2,-.08],[.11,.13,.16]],melt:.22}),mn(e,{r:[.17,.17,.19],at:[0,.13,.08]});let r=Mn(e,{dy:-.12,len:.12,ra:.13,rb:.12,drop:.05,squash:[.95,1.05,1]});On(e,{x:.55,y:.8,w:.045,h:.05,d:.03,round:!0,splay:.3,rake:.1}),cn(e,{len:.27,r0:.065,r1:.055,paw:[.055,.04,.065],fwd:.3,out:.15}),sn(e,{r0:.07,r1:.06,foot:[.06,.04,.08]}),dn(e),Ut(e,{x:.5,y:.35,size:.7,wide:1,slant:0,color:`#140e0c`}),Kt(e,n,gl(e,r.nose),.04,.02);let i=new x(...e.joints.neck),a=Gt(e,0,-.12).add(i).clone().lerp(new x(...r.nose).add(i),.4);return wn(e,{bone:`neck`,from:a.add(new x(0,-.03,0)),dir:new x(0,1,.15),r:.032,stretch:1.45,along:new x(0,-.3,1),color:H(t.coat,Pt,.5),name:`ridge`}),e.marks={base:t.coat,marks:[{color:n,f:W(e,`earL`,`earR`)},{color:n,f:U(W(e,/^leg/),e=>e.p.y-.05)}]},{}},Zl=(e,t)=>{let n=H(t.coat,Ft,.75),r=H(t.coat,Pt,.45),i=H(t.coat,Pt,.3);e.joints.neck=[0,.66,.05],e.joints.shoulder=[.11,.53,.13],e.joints.hip=[.1,.22,-.07],e.joints.tail=[0,.25,-.18],Et(e,{belly:[[0,.36,-.1],[.18,.22,.18]],chest:[[0,.5,.04],[.16,.16,.15]],haunch:[[.11,.22,-.1],[.1,.13,.15]],ruff:[[0,.61,.04],[.16,.1,.14]],melt:.2}),mn(e,{r:[.18,.155,.175],at:[0,.14,.06],cheeks:[[.13,-.05,-.01],[.09,.08,.09]]});let a=Mn(e,{dy:-.27,len:.15,ra:.078,rb:.048,drop:.04,squash:[1,.85,1],thin:!0});On(e,{x:.55,y:.72,w:.08,h:.19,d:.045,splay:.15,rake:.08,cup:.5,notch:!0}),cn(e,{len:.33,r0:.056,r1:.047,paw:[.05,.038,.06],fwd:.33,out:.15}),sn(e,{r0:.066,r1:.05,foot:[.052,.038,.082]});let o=Vt(e,hl(.55,[0,-.65,-1],[.2,-.25,0],.11,[.35,.75,.95,1,.9,.7,.4]));dn(e),Ut(e,{x:.4,y:.14,size:.85,wide:1.4,slant:.28,color:`#1a1410`,ring:`#c8963a`,ringSize:1.25}),Kt(e,Lt,gl(e,a.nose),.028,.02),Ct(e,t.coat,{len:.1,back:.035}),wl(e,[[.27,.43,.024]],n,`brow`,{stretch:1.3,along:[1,.35,0]});let s=[`earL`,`earR`].map(t=>en(e,t)),c=It(e,`head`);return e.marks={base:t.coat,marks:[{color:n,f:Sn(...s.map(e=>e.inner))},{color:r,f:Sn(...s.map(e=>e.back))},{color:n,f:U(W(e,`muzzle`),e=>e.p.y-(a.mid(e.p)+a.r*.2))},{color:n,f:U(W(e,`head`,`cheekL`,`cheekR`),e=>c(e).y+.12+Math.abs(c(e).x)*.15,e=>-.2-c(e).z)},{color:n,f:U(W(e,`chest`,`ruff`,`belly`),e=>-e.p.z,e=>Rt(e.p.x,e.p.y,0,.32,0,.62).d-.09)},{color:i,f:U(W(e,`belly`,`chest`,`ruff`,`haunchL`,`haunchR`),e=>Math.atan2(Math.abs(e.p.x),-.06-e.p.z)-.55-(e.p.y-.3)*1.7,e=>.3-e.p.y)},{color:r,f:U(W(e,/^tail\d/),e=>.85-o(e.p))}]},{}},Ql=(e,t)=>{let n=H(t.coat,`#e2c8a0`,.55),r=H(t.coat,Pt,.35);e.joints.neck=[0,.6,.05],e.joints.shoulder=[.18,.49,.1],e.joints.hip=[.12,.18,-.04],e.joints.tail=[0,.22,-.23],Et(e,{belly:[[0,.33,-.04],[.25,.27,.24]],chest:[[0,.5,.03],[.21,.16,.19]],haunch:[[.14,.19,-.06],[.11,.12,.15]],melt:.2}),mn(e,{r:[.2,.18,.18],at:[0,.13,.06],cheeks:[[.12,-.06,.03],[.09,.08,.09]]});let i=Mn(e,{dy:-.26,len:.08,ra:.085,rb:.07,drop:.02,squash:[1.1,.85,1]});On(e,{x:.62,y:.68,w:.06,h:.07,d:.035,round:!0,splay:.3,rake:.1,cup:.5}),cn(e,{len:.28,r0:.075,r1:.064,paw:[.064,.048,.07],fwd:.35,out:.22}),sn(e,{r0:.08,r1:.068,foot:[.068,.046,.09]});let a=e.joints.tail;Zt(e).add(gn(`tail`,[a[0],a[1]+.01,a[2]-.02],[.045,.045,.04],{k:.025,anchor:a,reach:.07,name:`stub`})),dn(e),Ut(e,{x:.36,y:.12,size:.8,wide:1,slant:.05,color:`#120e0c`}),Kt(e,Lt,gl(e,i.nose),.036,.026),xn(e,{w:.14,y:-.56,curve:.06,r:.006,out:.004});let o=[`earL`,`earR`].map(t=>en(e,t));return e.marks={base:t.coat,marks:[{color:n,f:Sn(...o.map(e=>e.inner))},{color:n,f:W(e,`muzzle`)},{color:H(t.coat,n,.35),f:Cl(e,[`belly`,`chest`],0,.33,.15,.22)},{color:r,f:Sn(Bt(e,`L`,.55),Bt(e,`R`,.55))},{color:r,f:U(W(e,/^leg/),e=>e.p.y-.11)}]},{}},$l=(e,t)=>{let n=`#f4efe6`,r=H(t.coat,`#2a1612`,.72),i=H(t.coat,`#f0c890`,.5);e.joints.neck=[0,.54,.05],e.joints.shoulder=[.14,.43,.11],e.joints.hip=[.1,.17,-.05],e.joints.tail=[0,.2,-.18],Et(e,{belly:[[0,.3,-.05],[.2,.23,.19]],chest:[[0,.43,.03],[.16,.13,.15]],melt:.2}),mn(e,{r:[.2,.165,.17],at:[0,.13,.05],cheeks:[[.12,-.06,.03],[.09,.08,.09]]});let a=Mn(e,{dy:-.28,len:.06,ra:.07,rb:.055,drop:.02,squash:[1.1,.85,1]});On(e,{x:.62,y:.66,w:.07,h:.1,d:.035,round:!0,splay:.35,rake:.1,cup:.5}),cn(e,{len:.26,r0:.05,r1:.042,paw:[.046,.035,.054],fwd:.35,out:.15}),sn(e,{r0:.058,r1:.048,foot:[.05,.035,.072]});let o=Vt(e,hl(.6,[0,-.3,-1],[.5,.9,0],.1,[.6,.9,1,1,.95,.85,.65]));dn(e),Ut(e,{x:.38,y:.08,size:.9,wide:1,slant:.1,color:`#140e0c`}),Kt(e,Lt,gl(e,a.nose),.026,.019),Ct(e,t.coat,{len:.09,color:`#f0e6da`}),wl(e,[[.33,.43,.026]],n,`brow`,{stretch:1.55,along:[1,.3,0]});let s=[`earL`,`earR`].map(t=>en(e,t)),c=It(e,`head`);return e.marks={base:t.coat,marks:[{color:n,f:Sn(...s.map(e=>e.inner))},{color:r,f:U(W(e,`head`,`cheekL`,`cheekR`),e=>Math.abs(Math.abs(c(e).x)-.4)-.07,e=>c(e).y-0,e=>-.35-c(e).y,e=>.2-c(e).z)},{color:n,f:W(e,`muzzle`)},{color:n,f:U(W(e,`cheekL`,`cheekR`,`head`),e=>c(e).y+.05,e=>.25-c(e).z)},{color:r,f:W(e,`armL`,`armR`,`foreL`,`foreR`,`armLPaw`,`armRPaw`,/^leg/)},{color:r,f:Cl(e,[`belly`,`chest`],0,.28,.14,.2)},{color:i,f:U(W(e,/^tail\d/),e=>.4-Math.sin(o(e.p)*Math.PI*7))}]},{}},eu=(e,t)=>{let n=H(t.coat,Ft,.55),r=H(t.coat,Pt,.55);e.joints.neck=[0,.52,.05],e.joints.shoulder=[.12,.42,.12],e.joints.hip=[.1,.15,-.04],e.joints.tail=[0,.17,-.19],Et(e,{belly:[[0,.27,-.04],[.2,.23,.19]],chest:[[0,.41,.03],[.15,.13,.14]],haunch:[[.12,.15,-.06],[.1,.11,.15]],melt:.2}),mn(e,{r:[.18,.16,.16],at:[0,.13,.05],cheeks:[[.1,-.07,.05],[.08,.075,.08]]});let i=Mn(e,{dy:-.26,len:.025,ra:.08,rb:.068,drop:.01,squash:[1.15,.85,1]});On(e,{x:.66,y:.62,w:.048,h:.055,d:.028,round:!0,splay:.4,rake:.1,cup:.5}),cn(e,{len:.17,r0:.042,r1:.035,paw:[.038,.03,.045],fwd:.9,out:.1}),sn(e,{r0:.06,r1:.05,foot:[.05,.035,.12],fwd:.07}),Vt(e,hl(.3,[0,-.7,-1],[0,.2,0],.06,[1,.85,.65,.45])),dn(e),Ut(e,{x:.38,y:.12,size:.85,wide:1,slant:.05,color:`#140e0c`}),Kt(e,r,gl(e,i.nose),.026,.018),Ct(e,t.coat,{len:.07}),xn(e,{w:.42,y:-.42,curve:.2,r:.011,out:.004});let a=[`earL`,`earR`].map(t=>en(e,t));return e.marks={base:t.coat,marks:[{color:H(t.coat,`#e0a0a0`,.5),f:Sn(...a.map(e=>e.inner))},{color:n,f:W(e,`muzzle`)},{color:n,f:Cl(e,[`belly`,`chest`],0,.3,.13,.2)},{color:r,f:U(W(e,/^leg/),e=>e.p.y-.04)}]},{}},tu=(e,t)=>{let n=H(t.coat,`#fbf4e6`,.7),r=H(t.coat,`#3a2a20`,.72);e.joints.neck=[0,.68,.06],e.joints.shoulder=[.11,.56,.09],e.joints.hip=[.085,.16,-.03],e.joints.tail=[0,.18,-.15],Et(e,{belly:[[0,.32,-.03],[.15,.28,.15]],chest:[[0,.55,.03],[.125,.15,.13]],melt:.22}),mn(e,{r:[.14,.12,.145],at:[0,.1,.06]});let i=Mn(e,{dy:-.2,len:.08,ra:.07,rb:.05,drop:.02,squash:[1.15,.85,1]});On(e,{x:.74,y:.55,w:.042,h:.046,d:.026,round:!0,splay:.5,rake:.1,cup:.5}),cn(e,{len:.17,r0:.036,r1:.03,paw:[.036,.026,.04],fwd:.7,out:.15}),sn(e,{r0:.045,r1:.038,foot:[.045,.022,.075]});let a=Vt(e,hl(.46,[0,-.6,-1],[.3,.42,0],.058,[1,.95,.85,.72,.55]));dn(e),Ut(e,{x:.4,y:.12,size:.85,wide:1,slant:.08,color:`#120e10`}),Kt(e,`#d9878a`,gl(e,i.nose),.024,.018),Ct(e,t.coat,{len:.09,color:`#e8ddd0`}),xn(e,{w:.14,y:-.5,curve:.06,r:.006});let o=It(e,`head`),s=[`earL`,`earR`].map(t=>en(e,t));return e.marks={base:t.coat,marks:[{color:H(n,`#e8a0a0`,.25),f:Sn(...s.map(e=>e.inner))},{color:r,f:U(W(e,`head`,`muzzle`),e=>Math.abs(o(e).y-.14)-.17,e=>.13-Math.abs(o(e).x),e=>.1-o(e).z)},{color:n,f:W(e,`muzzle`)},{color:n,f:U(W(e,`head`),e=>.3-o(e).z)},{color:n,f:W(e,`earL`,`earR`)},{color:r,f:W(e,/^arm/,/^fore/)},{color:r,f:W(e,/^leg/)},{color:r,f:U(W(e,/^tail\d/),e=>.2-a(e.p))}]},{}},nu=(e,t)=>{let n=H(t.coat,`#f4ebe0`,.5),r=H(t.coat,Pt,.25);e.joints.neck=[0,.55,.06],e.joints.shoulder=[.2,.42,.07],e.joints.hip=[.07,.1,-.05],e.joints.tail=[0,.12,-.2],Et(e,{belly:[[0,.3,-.02],[.255,.29,.235]],chest:[[0,.47,.03],[.2,.15,.19]],melt:.2}),mn(e,{r:[.19,.17,.175],at:[0,.14,.04],melt:.18});let i=Mn(e,{dy:-.3,len:.06,ra:.095,rb:.09,drop:.06,squash:[1.12,.92,1]}),a=e.joints.neck,o=Il(a,i.nose),s=[o[0],o[1]-.04,o[2]-.035];Zt(e).add(gn(`neck`,s,[.092,.068,.064],{rot:[.4,0,0],k:.04,name:`lip`})),un(e,{len:.22,w:.085,d:.036,taper:.85,fwd:.25,out:.4}),sn(e,{r0:.06,r1:.055,foot:[.12,.024,.08],fwd:-.08}),dn(e),Ut(e,{x:.46,y:.24,size:1.2,wide:1,slant:-.06,color:`#120e10`,blush:!1});for(let t of[-1,1]){let n=Gt(e,t*.6,-.12).add(new x(...a));(e.blush??=[]).push({at:V(n),n:V(Ht(e,t*.6,-.12)),r:.05})}for(let n of[-1,1])wn(e,{bone:`neck`,from:new x(...o).add(new x(0,-.04,-.05)),dir:new x(n*.45,1,.6),r:.011,stretch:1.7,along:new x(1,0,-.4*n),color:H(t.coat,`#2a2224`,.65),sides:8,name:`nostril${n>0?`L`:`R`}`});e.nose=V(new x(...i.nose).add(new x(0,-.02,.01))),Ct(e,t.coat,{len:.04,sweep:.05,drop:.035,color:H(t.coat,`#f2ece2`,.6)});let c=new x(...s),l=[-1,-.6,-.2,.2,.6,1].map(t=>jn(e,c,new x(t*.75,-.62+.3*t*t,1))?.p);return l.every(Boolean)&&Qt(e,{bone:`neck`,pts:l,w:.0055,color:`#2a2224`}),e.marks={base:t.coat,marks:[{color:H(n,t.coat,.35),f:W(e,`lip`)},{color:n,f:Cl(e,[`belly`,`chest`],0,.3,.18,.27)},{color:H(t.coat,Pt,.12),f:W(e,`armL`,`armR`,`armLPaw`,`armRPaw`)},{color:r,f:W(e,/^leg/)}]},{aquatic:!0}},ru=(e,t)=>{let n=H(t.coat,`#f2dcc0`,.5),r=H(t.coat,`#ffb040`,.6),i=H(t.coat,`#2a1410`,.25);e.joints.neck=[0,.25,.3],e.joints.shoulder=[.08,.17,.33],e.joints.tail=[0,.1,-.38],Nt(e,`rear`,`body`,[0,.1,-.12]);let a=Zt(e);a.add(ln(`body`,[0,.14,-.12],[0,.16,.14],.15,.14,{squash:[1,.9,1],name:`trunk`})),a.add(ln(`rear`,[0,.1,-.42],[0,.14,-.12],.09,.15,{squash:[1,.9,1],k:.07,anchor:[0,.13,-.15],reach:.22,name:`tailEnd`})),a.add(ln(`body`,[0,.17,.12],[0,.24,.28],.14,.125,{k:.08,anchor:[0,.16,.12],reach:.18,name:`neck`})),e.seat=0,mn(e,{r:[.13,.12,.12],at:[0,.04,.05],melt:.1}),dn(e),Ut(e,{x:.36,y:.2,size:.95,wide:1,slant:0,color:`#1a1214`}),xn(e,{w:.18,y:-.25,curve:.08,r:.006}),jt(e,{color:t.coat,len:.12,r:.03,rightOnly:!0}),e.front=.47;let o=e=>{if(e<-.12){let t=(e+.42)/.3;return{y:.1+.04*t,r:.09+.06*t,bone:`rear`}}return e<.14?{y:.14+.02*(e+.12)/.26,r:.15-.01*(e+.12)/.26,bone:`body`}:{y:.17+.07*(e-.14)/.14,r:.14,bone:`body`}},s=0;for(let n=-.36;n<=.18;n+=.075){let i=Math.round((n+.36)/.075),{y:a,r:c,bone:l}=o(n),u=c>.12?7:5;for(let o=0;o<u;o++){let d=-1.75+3.5*(o+(i%2?.5:0)+.25)/u;if(Math.abs(d)>1.75)continue;let f=new x(Math.sin(d),Math.cos(d),0).normalize(),p=jn(e,new x(0,a,n),f);if(!p)continue;let m=(.06+s*37%10*.004)*(c/.15)+.015,h=p.p.clone().addScaledVector(p.n,-.02),g=p.p.clone().addScaledVector(p.n,m*.45),_=p.p.clone().addScaledVector(p.n,m);An(e,{bone:l,pts:[h,g,_],w:[.026,.017,0],t:[.026,.017,0],across:new x(0,0,1),colors:[t.coat,r],name:`spike${s++}`})}}return e.marks={base:t.coat,marks:[{color:n,f:U(W(e,`trunk`,`tailEnd`,`neck`,`head`),e=>e.p.y-.055)},{color:i,f:U(W(e,`trunk`,`tailEnd`),e=>.24-e.p.y)}]},{aquatic:!0,legs:`none`,tendril:!0}},iu=(e,t)=>{let n=`#1f1d22`,r=`#26242a`;e.step=.03,e.joints.neck=[0,.86,.1],e.joints.shoulder=[.14,.6,0],e.joints.hip=[.065,.34,-.02],e.joints.tail=[0,.4,-.2],Et(e,{belly:[[0,.47,-.04],[.165,.16,.2]],chest:[[0,.66,.06],[.09,.18,.09]],melt:.18}),mn(e,{r:[.105,.1,.115],at:[0,.07,.04],melt:.12});let i=e.joints.neck,a=Gt(e,0,-.08,-.02),o=[[0,0,-.02],[0,-.008,.07],[0,-.03,.15],[0,-.07,.225],[0,-.125,.285],[0,-.19,.32]].map(e=>Il(Il(i,V(a)),e));return Rl(e,`neck`,o,[.03,.026,.022,.019,.016,.013],`beak`),un(e,{len:.34,w:.13,d:.035,fwd:-.05,out:.2}),sn(e,{r0:.028,r1:.022,foot:[.045,.018,.08],fwd:.04}),rn(e,`tail`,e.joints.tail,{len:.14,w:.09,d:.034,rot:[-(Math.PI/2+.5),0,0],name:`tailFan`}),dn(e),Nt(e,`backPlates`,`body`,[0,.48,-.16]),[-.05,-.025,0,.025,.05].forEach((t,n)=>{let i=1-Math.abs(t)*3+n%2*.08,a=[new x(t,.49,-.17),new x(t*1.3,.46,-.27),new x(t*1.6,.46-.08*i,-.27-.07*i),new x(t*1.8,.46-.17*i,-.28-.1*i)];An(e,{bone:`backPlates`,pts:a,w:[.02,.022,.015,0],t:[.008,.007,.005,0],across:new x(1,0,0),colors:[r,r,r],name:`plume${n}`})}),Ut(e,{x:.42,y:.12,size:.8,wide:1,slant:0,color:`#120e10`,ring:`#9a9aa4`,ringSize:1.45,out:.005}),e.nose=V(new x(...o[o.length-1]).sub(new x(...i))),e.marks={base:t.coat,marks:[{color:n,f:W(e,/^beak/)},{color:n,f:W(e,`head`)},{color:n,f:U(W(e,`chest`),e=>.74-e.p.y)},{color:n,f:W(e,/^leg/)},{color:r,f:U(W(e,`armLPaw`,`armRPaw`),e=>e.p.y-.37)}]},{}},au=(e,t)=>{let n=H(t.coat,`#fbeee0`,.6),r=H(t.coat,Pt,.55),i=H(t.coat,`#f4e2d0`,.25);e.step=.036,e.joints.neck=[0,.46,.06],e.joints.shoulder=[.22,.34,.08],e.joints.hip=[.1,.13,0],e.joints.tail=[0,.15,-.14],Et(e,{belly:[[0,.28,0],[.27,.19,.17]],chest:[[0,.38,.02],[.24,.12,.15]],melt:.14}),mn(e,{r:[.13,.085,.11],at:[0,0,.03],melt:.12});let a=Zt(e);cn(e,{len:.16,r0:.045,r1:.04,paw:[.07,.06,.075],fwd:.55,out:.42});for(let t of e.paws??[]){let e=new O().setFromEuler(new L(...t.rot)),n=new x(...t.at),r=new x(0,0,1).applyQuaternion(e),i=new x(0,1,0).applyQuaternion(e);for(let[e,o,s]of[[.025,-.35,`Top`],[-.025,.3,`Low`]]){let c=n.clone().addScaledVector(r,t.r[2]*.75).addScaledVector(i,e);a.add(Cn(t.bone,V(c),.042,.1,.042,{rot:[Math.PI/2+t.rot[0]+o,0,t.rot[2]],k:.04,round:.02,anchor:V(c),reach:.05,name:`pincer${s}${t.bone}`,thin:!0}))}}sn(e,{r0:.04,r1:.032,foot:[.035,.02,.05],fwd:.02});let o=H(t.coat,Pt,.12);for(let n of[-1,1]){let r=n>0?`legL`:`legR`;[.07,0,-.07].forEach((i,a)=>{let s=[new x(n*.17,.22+a*.02,i),new x(n*.35,.19+a*.015,i*1.6),new x(n*.44,.015,i*2)];An(e,{bone:r,pts:s,w:[.03,.026,0],t:[.028,.022,0],across:new x(0,0,1),colors:[t.coat,o],name:`side${r}${a}`})})}dn(e),xn(e,{w:.2,y:-.45,curve:.09,r:.006});let s=new x(0,.12,.02);for(let t of[-1,1]){let n=t>0?`L`:`R`,r=Gt(e,t*.4,.62,-.015);Nt(e,`stalk${n}`,`neck`,V(r));let a=s.clone().add(new x(t*.02,0,0));Nt(e,`blink${n}`,`stalk${n}`,V(a));let o=qt(e,`stalk${n}`,`stalk${n}`);kn(o,e.rnd,[0,0,0],V(a),.018,.015,i,{base:`limb5`}),bn(o,e.rnd,{base:`ico1`,r:.034,pos:V(a),jitter:.04,color:i});let c=qt(e,`eye${n}`,`stalk${n}`,{bone:`blink${n}`,eyes:!0}),l=At(a.clone().add(new x(0,.004,.026)));bn(c,e.rnd,{base:`ico1`,r:[.021,.023,.014],matrix:l,jitter:.02,color:Lt,tone:.1}),bn(c,e.rnd,{base:`ico0`,r:.007,matrix:Wt(l,[.006,.008,.011]),jitter:.01,color:`#fbf6ec`,tone:0})}e.blink=[`blinkL`,`blinkR`],Dl(e,`body`,[0,.3,0],[.27,.2,.17],48,e=>e.y>.1&&e.z<.25,.016,H(t.coat,`#fbeee0`,.42),`freckle`);let c=Gt(e,.4,.62).add(s);return e.eyeY=c.y,e.eyeX=c.x+.02,e.eyeR=.034,e.eyeZ=c.z+.035,e.marks={base:t.coat,marks:[{color:r,f:W(e,/^pincer/)},{color:n,f:Cl(e,[`belly`],0,.2,.17,.12)},{color:H(t.coat,Pt,.2),f:U(W(e,/^leg/),e=>e.p.y-.06)}]},{aquatic:!0}},ou=[[0,.62,-.78],[0,.02,-1],[0,-.6,-.8],[.66,.52,-.54],[-.66,.52,-.54],[.74,-.04,-.67],[-.74,-.04,-.67],[.64,-.58,-.5],[-.64,-.58,-.5]],su=(e,t)=>{let n=H(t.coat,`#b8c488`,.4),r=H(t.coat,`#2a2014`,.55),i=H(t.coat,`#e8c87a`,.18);e.joints.neck=[0,.56,.08],e.joints.shoulder=[.17,.44,.07],e.joints.hip=[.09,.13,-.01],e.joints.tail=[0,.14,-.2],Et(e,{belly:[[0,.3,.01],[.2,.27,.17]],chest:[[0,.47,.04],[.16,.13,.14]],melt:.18});let a=Zt(e),o=new x(0,.35,-.07),s=new x(.27,.31,.19);a.add(gn(`body`,V(o),V(s),{k:.03,name:`shell`})),a.add(gn(`body`,[0,.35,.01],[.275,.315,.07],{k:.02,name:`shellRim`})),ou.forEach(([e,t,n],r)=>{let i=new x(e,t,n).normalize(),c=o.clone().add(new x(i.x*s.x,i.y*s.y,i.z*s.z)),l=new x(i.x/s.x,i.y/s.y,i.z/s.z).normalize(),u=new L().setFromQuaternion(new O().setFromUnitVectors(new x(0,0,1),l));a.add(gn(`body`,V(c.addScaledVector(l,-.006)),[.112,.112,.032],{rot:[u.x,u.y,u.z],k:.012,name:`scute${r}`}))});let c=a.shapes.flatMap((e,t)=>/^scute/.test(e.name??``)?[t]:[]);return mn(e,{r:[.15,.135,.155],at:[0,.12,.08],melt:.1}),un(e,{len:.3,w:.1,d:.03,taper:.7,fwd:.3,out:.38}),sn(e,{r0:.055,r1:.05,foot:[.07,.022,.09]}),Vt(e,hl(.08,[0,-.5,-1],[0,0,0],.035,[1,.6])),dn(e),Ut(e,{x:.42,y:.14,size:1.1,wide:1,slant:.05,color:`#120e10`,out:.006}),xn(e,{w:.26,y:-.36,curve:.07,r:.006}),e.marks={base:n,marks:[{color:H(n,`#3a3020`,.22),f:Sl(e,`head`,[[12,0,.17],[38,38,.15],[38,-38,.15],[55,95,.14],[55,-95,.14],[42,180,.2]])},{color:r,f:U(W(e,/^scute/),e=>{let t=1/0,n=1/0;for(let r of c){let i=e.dist(r);i<t?(n=t,t=i):i<n&&(n=i)}return n-t-.012})},{color:i,f:W(e,/^scute/)},{color:H(i,r,.45),f:W(e,`shell`)},{color:r,f:W(e,`shellRim`)},{color:`#eadcb0`,f:Cl(e,[`belly`,`chest`],0,.32,.15,.24)}]},{aquatic:!0}},cu=(e,t)=>{let n=H(t.coat,`#e8dcc0`,.45),r=H(t.coat,Pt,.3),i=H(t.coat,Pt,.15),a=H(t.coat,`#bdf2ff`,.7);e.joints.neck=[0,.62,.08],e.joints.shoulder=[.15,.5,.1],e.joints.hip=[.12,.2,-.03],e.joints.tail=[0,.24,-.19],Et(e,{belly:[[0,.34,-.02],[.22,.25,.21]],chest:[[0,.51,.05],[.17,.15,.16]],haunch:[[.13,.21,-.05],[.105,.14,.15]],melt:.18}),mn(e,{r:[.15,.13,.16],at:[0,.1,.06],melt:.13});let o=Mn(e,{dy:-.22,len:.09,ra:.115,rb:.088,drop:.015,squash:[1.08,.72,1]}),s=Zt(e),c=new x(...e.joints.neck).add(new x(...e.shape.hc));for(let e of[-1,1])s.add(gn(`neck`,[e*.07,c.y+.06,c.z+.1],[.065,.03,.05],{k:.04,rot:[0,0,e*.32],name:e>0?`browL`:`browR`}));cn(e,{len:.17,r0:.05,r1:.04,paw:[.042,.03,.045],fwd:.7,out:.32}),sn(e,{r0:.085,r1:.07,foot:[.078,.034,.1]});let l=hl(.74,[0,-.42,-1],[.18,.5,0],.13,[1,.86,.7,.52,.34,.16]),u=Vt(e,l);dn(e),Ut(e,{x:.46,y:.24,size:.75,wide:1.25,slant:.2,color:`#1a1210`,ring:`#f2c84a`,ringSize:1.35}),xn(e,{w:.5,y:-.36,curve:.06,r:.006});let d=new x(...e.joints.neck);for(let t of[-1,1]){let n=new x(...o.nose).add(d).add(new x(t*.034,-.01,-.04)),r=jn(e,n,new x(t*.2,-1,.25));if(!r)continue;let i=new x(0,-1,.15).normalize();An(e,{bone:`neck`,pts:[r.p.clone().addScaledVector(i,-.012),r.p.clone().addScaledVector(i,.01),r.p.clone().addScaledVector(i,.027)],w:[.01,.008,0],t:[.007,.006,0],across:new x(1,0,0),colors:[`#fbf8f1`,`#fbf8f1`],name:`fang${t>0?`L`:`R`}`})}let f=[];Nt(e,`backPlates`,`body`,[0,.42,-.06]);for(let e=.6;e>.3;e-=.065){let t=new x(0,.35*(e-.3),-1).normalize();f.push({at:new x(0,e,-.02),up:t,along:new x(0,1,.3),bone:`backPlates`,size:.75+(.6-e)*1.2})}let p=new x(...e.joints.tail),m=l.pts.length-1,h=Math.max(1,Math.round(m/3)),g=Math.max(h+1,Math.round(m*2/3));for(let e=1;e<m-1;e++){let t=new x(...l.pts[e]).add(p),n=new x(...l.pts[e+1]).add(p).clone().sub(t).normalize(),r=new x(0,1,0).addScaledVector(n,-n.y).normalize();f.push({at:t,up:r,along:n,bone:e<h?`tail`:e<g?`tail1`:`tail2`,size:.85*(1-e/m)+.3})}let _=0;f.forEach((t,n)=>{let r=new x().crossVectors(t.along,t.up).normalize();for(let o of[{off:0,tilt:0,scale:1},{off:-1,tilt:-.42,scale:.68},{off:1,tilt:.42,scale:.68}]){if(o.off&&n%2)continue;let s=t.up.clone().applyAxisAngle(t.along,o.tilt).normalize(),c=jn(e,t.at,s);if(!c)continue;let l=.13*t.size*o.scale*(1+_*7%5*.04),u=.055*t.size*o.scale,d=c.p.clone().addScaledVector(s,-.02),f=c.p.clone().addScaledVector(s,l*.35),p=c.p.clone().addScaledVector(s,l*.62),m=c.p.clone().addScaledVector(s,l).addScaledVector(t.along,-l*.18);An(e,{bone:t.bone,pts:[d,f,p,m],w:[u*.8,u,u*.62,0],t:[.013,.011,.008,0],across:t.along.clone().addScaledVector(r,o.off*.2),colors:[i,i,a],name:`plate${_++}`})}});let v=It(e,`head`);return e.marks={base:t.coat,marks:[{color:n,f:Cl(e,[`belly`,`chest`],0,.38,.13,.25)},{color:n,f:U(W(e,`head`,`muzzle`),e=>-v(e).y-.35,e=>-e.p.z+.5)},{color:r,f:U(W(e,`belly`,`chest`,`haunchL`,`haunchR`),e=>e.p.z+.06)},{color:r,f:U(W(e,/^tail\d/),e=>.04-(e.p.y-(p.y-.32*u(e.p))))},{color:r,f:W(e,`browL`,`browR`)}]},{}},lu=(e,t,n,r,i)=>{let a=Math.abs(e)-n+i,o=Math.abs(t)-r+i;return Math.hypot(Math.max(a,0),Math.max(o,0))+Math.min(Math.max(a,o),0)-i};function uu(){let e=new st;e.moveTo(0,-.95),e.bezierCurveTo(-.25,-.62,-1,-.28,-1,.28),e.bezierCurveTo(-1,.82,-.36,1.02,0,.6),e.bezierCurveTo(.36,1.02,1,.82,1,.28),e.bezierCurveTo(1,-.28,.25,-.62,0,-.95);let t=$t(),n=new re(e,{depth:.3,curveSegments:t?2:4,bevelEnabled:!0,bevelThickness:.25,bevelSize:.16,bevelSegments:t?1:2});return n.translate(0,-.05,-.15),n.deleteAttribute(`uv`),n.deleteAttribute(`normal`),n}function du(e,t,n,r,i,a,o){let s=new O().setFromUnitVectors(new x(0,1,0),i.clone().normalize()),c=new I().compose(r.clone().sub(_n(e,n)),s,new x(1,1,1));bn(t,e.rnd,{base:`disc`,r:[a,a*.55,a],matrix:c,color:o})}var fu=(e,t)=>{let n={h:0,s:0,l:0};t.coat.getHSL(n,dt);let r=n.s<.22&&n.l>.45||n.l>.76?H(t.coat,`#2c3036`,.52):H(`#d8d2c6`,t.coat,.08),i=H(r,Pt,.4),a=`#8cf0ff`,o=(n.h<.05||n.h>.9)&&n.s>.35?`#f6cf4a`:`#e8443a`;e.step=.03,e.joints.neck=[0,.52,0],e.joints.shoulder=[.212,.41,0],e.joints.hip=[.085,.15,0],e.joints.tail=[0,.22,-.14];let s=Zt(e),c=[0,.3,0],l=[.18,.16,.145];s.add(Dn(`body`,c,l,{round:.085,name:`chassis`})),e.shape.tc=c,e.shape.tr=l,e.shape.pear=0,e.front=l[2],e.seat=c[1]-l[1];let u=e.joints.neck,d=[0,.15,.01],f=[.2,.155,.165];e.shape.hr=f,e.shape.hc=d,e.headBend=void 0;let p=Il(u,d);s.add(Dn(`neck`,p,f,{round:.08,name:`head`})),s.add(ln(`neck`,[0,u[1]-.08,0],[0,u[1]+.03,0],.068,.068,{name:`post`}));for(let e of[-1,1])s.add(ln(`neck`,[e*(f[0]-.02),p[1]-.005,p[2]-.01],[e*(f[0]+.022),p[1]-.005,p[2]-.01],.056,.05,{k:.01,name:e>0?`discL`:`discR`}));s.add(gn(`neck`,[0,p[1]+f[1]-.004,p[2]],[.042,.024,.042],{k:.012,name:`socket`})),cn(e,{len:.16,r0:.036,r1:.032,paw:[.047,.045,.047],fwd:.2,out:.14});for(let e of[`armL`,`armR`])s.named(e).k=.015;for(let t of[-1,1]){let n=e.joints.shoulder;s.add(gn(t>0?`armL`:`armR`,[t*(n[0]-.008),n[1],n[2]],[.054,.054,.054],{k:.012,name:t>0?`shoulderL`:`shoulderR`}))}for(let t of[-1,1]){let n=t>0?`legL`:`legR`,r=t*e.joints.hip[0];s.add(ln(n,[r,.19,0],[r,.07,.005],.042,.04,{k:.015,anchor:[r,.15,0],reach:.08,name:n})),s.add(Dn(n,[r,.039,.025],[.064,.039,.09],{round:.032,k:.02,anchor:[r,.07,.005],reach:.07,name:`${n}Foot`}))}dn(e);for(let t of e.paws??[]){let n=new O().setFromEuler(new L(...t.rot)),r=new x(...t.at),a=(e,t,i)=>r.clone().add(new x(e,t,i).applyQuaternion(n));for(let r of[-1,1])An(e,{bone:t.bone,pts:[a(r*.016,-.018,.012),a(r*.034,-.052,.018),a(r*.012,-.08,.016)],w:[.013,.011,0],t:[.009,.008,0],across:new x(0,0,1).applyQuaternion(n),colors:[i,i],name:`prong${t.bone}${r}`})}Nt(e,`crest`,`neck`,[0,d[1]+f[1]-.03,d[2]]);let m=qt(e,`crest`,`crest`);kn(m,e.rnd,[0,0,0],[0,.15,0],.011,.009,r,{base:`limb5`}),bn(m,e.rnd,{base:`ico2`,r:.034,pos:[0,.163,0],color:o}),Ut(e,{x:.4,y:.14,size:1.45,wide:1,slant:0,color:a,blush:!1}),xn(e,{w:.2,y:-.4,curve:.13,r:.0075,color:a});for(let t of[-1,1]){let n=Gt(e,t*.6,-.3,.001),r=new I().compose(n,new O().setFromUnitVectors(new x(0,0,1),Ht(e,t*.6,-.3)),new x(1,1,1));bn(e.head,e.rnd,{base:`ico1`,r:[.028,.016,.005],matrix:r,color:`#ff8fb0`})}let h=.315;bn(e.torso,e.rnd,{base:uu(),r:[.036,.036,.024],pos:[0,h,l[2]+.003],color:o});for(let[t,n]of[[-.072,.255],[.072,.255],[-.072,.375],[.072,.375]]){let r=jn(e,new x(t,n,0),new x(0,0,1));r&&du(e,e.torso,`body`,r.p,r.n,.013,i)}for(let t of[-1,1]){let n=jn(e,new x(t*.15,p[1]-.005,p[2]-.01),new x(t,0,0));n&&du(e,e.head,`neck`,n.p,n.n,.018,i)}let g=t=>It(e,`arm${t}Axis`),[_,v]=[g(`L`),g(`R`)];return e.marks={base:t.coat,marks:[{color:`#1a232e`,f:U(W(e,`head`),e=>p[2]+f[2]-.035-e.p.z,e=>lu(e.p.x,e.p.y-p[1]+.008,.152,.112,.045))},{color:r,f:W(e,`discL`,`discR`,`socket`)},{color:i,f:W(e,`post`)},{color:r,f:U(W(e,`chassis`),e=>l[2]-.035-e.p.z,e=>lu(e.p.x,e.p.y-h,.1,.088,.03))},{color:r,f:U(W(e,`chassis`),e=>Math.abs(e.p.y-.19)-.022)},{color:i,f:Sn(U(W(e,`armL`,`foreL`),e=>Math.abs(_(e).y-.52)-.07),U(W(e,`armR`,`foreR`),e=>Math.abs(v(e).y-.52)-.07))},{color:r,f:W(e,`armL`,`foreL`,`armR`,`foreR`,`shoulderL`,`shoulderR`)},{color:r,f:W(e,`legL`,`legR`)},{color:i,f:U(W(e,`legLFoot`,`legRFoot`),e=>e.p.y-.016)}]},{}},pu=(e,t)=>{let n=H(t.coat,`#f8e8d6`,.2),r=H(t.coat,`#e0707e`,.38),i=H(t.coat,`#d8606a`,.2),a=H(t.coat,`#3a1e1a`,.6),o=`#8cc65c`,s=`#5f9c48`;e.joints.neck=[0,.5,.02],e.joints.shoulder=[.105,.445,0],e.joints.hip=[.065,.2,0],e.joints.tail=[0,.2,-.13],e.step=.036,Et(e,{belly:[[0,.31,.02],[.145,.145,.145]],chest:[[0,.43,-.005],[.1,.085,.085]],melt:.14}),mn(e,{r:[.215,.195,.195],at:[0,.17,.03],melt:.1});let c=Mn(e,{dy:-.2,len:.012,ra:.044,rb:.042,drop:.01});On(e,{x:.88,y:.2,w:.05,h:.21,d:.034,splay:1.05,rake:.2,cup:.5,notch:!0}),cn(e,{len:.21,r0:.03,r1:.026,paw:[.036,.07,.062],fwd:.12,out:.4});let l=Zt(e),u=(e.paws??[]).map(e=>{let t=e.at[0]>0?1:-1,n=new O().setFromEuler(new L(...e.rot)),r=new x(...e.at);return{...e,side:t,q:n,at:r,L:(e,t,i)=>r.clone().add(new x(e,t,i).applyQuaternion(n))}});for(let e of u){let t=[e.rot[0]-.5,0,e.rot[2]-e.side*.35];l.add(gn(e.bone,V(e.L(-e.side*.012,.012,.055)),[.022,.034,.021],{rot:t,k:.025,anchor:V(e.at),reach:.09,name:`thumb${e.side>0?`L`:`R`}`}))}sn(e,{r0:.038,r1:.032,foot:[.074,.04,.13],fwd:.075}),dn(e),Ut(e,{x:.4,y:.04,size:1.45,wide:1,slant:0,color:`#1a1210`,ring:`#e2a93c`,ringSize:1.32}),xn(e,{w:.32,y:-.52,curve:.13,r:.0065});let d=H(t.coat,`#5a3020`,.32);xn(e,{w:.15,y:.44,curve:-.05,r:.0042,color:d}),xn(e,{w:.1,y:.53,curve:-.04,r:.0038,color:d}),e.nose=c.nose;let f=new x(...e.joints.neck),p=Gt(e,.06,.97,-.02);Nt(e,`crest`,`neck`,V(p));let m=p.clone().add(f),h=new x(.15,1,.1).normalize(),g=m.clone().addScaledVector(h,.11);An(e,{bone:`crest`,pts:[m.clone().addScaledVector(h,-.01),m.clone().addScaledVector(h,.06),g],w:[.009,.007,0],t:[.009,.007,0],across:new x(1,0,0),colors:[s,s],name:`sprout`});for(let t of[-1,1]){let n=new x(t,.3,-.1*t).normalize(),r=g.clone().addScaledVector(h,-.014),i=new x(-n.z,0,n.x).normalize();An(e,{bone:`crest`,pts:[r,r.clone().addScaledVector(n,.042).add(new x(0,.006,0)),r.clone().addScaledVector(n,.085).add(new x(0,.024,0))],w:[0,.025,0],t:[0,.006,0],across:i,colors:[o,o],name:`leaf${t}`})}let _=[],v=[];for(let t=0;t<=6;t++){let n=t/6,r=.3+.36*n,i=.74-.48*n+.08*Math.sin(n*Math.PI);_.push(Gt(e,r,i).add(f)),v.push(Ht(e,r,i))}An(e,{bone:`neck`,pts:_.map((e,t)=>e.clone().addScaledVector(v[t],t===0||t===_.length-1?-.002:.0014)),w:_.map((e,t)=>t===0||t===_.length-1?0:.0032),t:_.map((e,t)=>t===0||t===_.length-1?0:.0022),across:new x(1,0,0),colors:_.slice(1).map(()=>a),name:`seam`});for(let t of[1,2,3,4,5]){let n=_[t],r=v[t],i=_[t+1].clone().sub(_[t-1]).normalize(),o=new x().crossVectors(r,i).normalize(),s=n.clone().addScaledVector(o,-.016),c=n.clone().addScaledVector(o,.016);An(e,{bone:`neck`,pts:[s.addScaledVector(r,-.002),n.clone().addScaledVector(r,.002),c.addScaledVector(r,-.002)],w:[0,.003,0],t:[0,.0022,0],across:i,colors:[a,a],name:`stitch${t}`})}wn(e,{bone:`body`,from:new x(0,.32,.02),dir:new x(0,0,1),r:.011,stretch:1.3,color:H(t.coat,`#5a3020`,.38),sides:8,name:`navel`});for(let n of u)for(let r of[-.026,0,.026]){let i=[1.02,.8,.58,.4].map(t=>jn(e,n.at,new x(n.side*.02,-t*.07,r).applyQuaternion(n.q)));if(i.some(e=>!e))continue;let a=H(t.coat,Pt,.38),o=i.map((e,t)=>e.p.clone().addScaledVector(e.n.normalize(),t===0||t===i.length-1?-.002:.0014));An(e,{bone:n.bone,pts:o,w:[0,.0032,.0032,0],t:[0,.0022,.0022,0],across:new x(0,0,1).applyQuaternion(n.q),colors:[a,a,a],name:`finger${n.bone}${r}`})}let y=[`earL`,`earR`].map(t=>en(e,t));return e.marks={base:t.coat,marks:[{color:r,f:Sn(...y.map(e=>e.inner))},{color:i,f:W(e,`muzzle`)},{color:n,f:Cl(e,[`belly`,`chest`],0,.31,.09,.09)}]},{}},mu=(e,t)=>{let n=H(t.coat,`#f4ecdc`,.86),r=kt(t.coat)>.68?H(t.coat,`#7a5a40`,.32):H(t.coat,`#fffcf4`,.9),i=H(n,t.coat,.4),a=H(n,t.coat,.14);e.joints.neck=[0,.43,.02],e.joints.shoulder=[.13,.34,.06],e.joints.hip=[.075,.13,0],e.joints.tail=[0,.15,-.14];let o=Zt(e),s=e.joints.neck,c=[-.14,0,0],l=new O().setFromEuler(new L(...c)),u=new x(0,s[1]+.28,s[2]-.04),d=[.34,.21,.32],f=gn(`neck`,V(u),d,{rot:c,name:`cap`}),p=gn(`neck`,V(u.clone().add(new x(0,-.14,0).applyQuaternion(l))),[.305,.13,.285],{rot:c,k:.05,carve:!0,name:`hollow`});o.add(f,p),Et(e,{belly:[[0,.22,0],[.175,.2,.165]],chest:[[0,.36,.01],[.14,.11,.135]],melt:.2}),mn(e,{r:[.165,.14,.155],at:[0,.08,.03],melt:.12}),o.add(ln(`neck`,[0,s[1]+.1,s[2]-.01],V(u.clone().add(new x(0,-.02,0).applyQuaternion(l))),.13,.1,{k:.06,name:`stemTop`})),cn(e,{len:.15,r0:.04,r1:.034,paw:[.042,.036,.045],fwd:.4,out:.25}),sn(e,{r0:.05,r1:.045,foot:[.062,.036,.08]}),dn(e),Ut(e,{x:.4,y:0,size:1.15,wide:1,slant:0,color:`#1a1210`}),xn(e,{w:.22,y:-.42,curve:.12,r:.006});let m=(e,t,n)=>u.clone().add(new x(e,t,n).applyQuaternion(l)),h=new x(0,-1,0).applyQuaternion(l);for(let t=0;t<24&&!$t();t++){let n=(t+.5)/24*Math.PI*2,r=[.13,.2,.275].map(t=>{let r=t*Math.sin(n),i=t*Math.cos(n),a=-.14+.13*Math.sqrt(Math.max(0,1-(r/.305)**2-(i/.285)**2)),o=d[1]*Math.sqrt(Math.max(0,1-(r/d[0])**2-(i/d[2])**2));return jn(e,m(r,(a+o)/2,i),h)});if(r.some(e=>!e))continue;let i=r.reduce((e,t)=>e.add(t.n.normalize()),new x).normalize();An(e,{bone:`neck`,pts:r.map(e=>e.p.clone().addScaledVector(e.n,.004)),w:[0,.011,0],t:[0,.003,0],across:i,colors:[a,a],name:`gill${t}`})}let g=e=>Math.abs(p.d(e.p.x,e.p.y,e.p.z))-.012,_=e=>-p.d(e.p.x,e.p.y,e.p.z),v=W(e,`cap`);return e.marks={base:n,marks:[{color:i,f:U(v,g)},{color:r,f:Sl(e,`cap`,[[0,0,.27],[40,0,.21],[44,72,.2],[44,-72,.2],[46,144,.21],[46,-144,.21],[74,36,.17],[74,-36,.17],[76,108,.17],[76,-108,.17],[76,180,.17]])},{color:t.coat,f:U(v,_)},{color:H(n,t.coat,.14),f:U(W(e,/^leg/),e=>e.p.y-.05)}]},{}};function hu(e,t,n){let r=t.clone().normalize(),i=n.clone().addScaledVector(r,-n.dot(r)).normalize(),a=new x().crossVectors(r,i);return a.z>0&&a.negate(),{U:r,V:i,N:a,at:(t,n,o=0)=>e.clone().addScaledVector(r,t).addScaledVector(i,n).addScaledVector(a,o)}}var gu=(e,t)=>{let n=H(t.coat,`#f8e4a8`,.66),r=H(n,t.coat,.4),i=H(t.coat,`#f4c860`,.55),a=`#f3e6c8`,o=H(t.coat,`#f8dca0`,.42);e.joints.neck=[0,.56,.05],e.joints.shoulder=[.16,.44,.13],e.joints.hip=[.11,.17,-.01],e.joints.tail=[0,.2,-.2],Et(e,{belly:[[0,.3,-.01],[.25,.26,.23]],chest:[[0,.47,.04],[.18,.13,.16]],haunch:[[.13,.17,-.03],[.1,.1,.13]],melt:.2}),e.front+=.035,mn(e,{r:[.2,.175,.185],at:[0,.13,.05],melt:.14});let s=Mn(e,{dy:-.26,len:.08,ra:.11,rb:.085,drop:.02,squash:[1.15,.78,1]});On(e,{x:.8,y:.32,w:.04,h:.085,d:.024,splay:1.2,rake:.25,notch:!0}),cn(e,{len:.16,r0:.05,r1:.044,paw:[.046,.034,.048],fwd:.55,out:.32}),sn(e,{r0:.072,r1:.062,foot:[.068,.034,.088]});let c=hl(.5,[0,-.45,-1],[.55,.3,0],.11,[1,.8,.6,.45,.32,.24]);Vt(e,c),dn(e),Ut(e,{x:.42,y:.1,size:1.15,wide:1.1,slant:.12,color:`#1a1216`}),xn(e,{w:.42,y:-.42,curve:.1,r:.0065}),e.nose=s.nose;let l=new x(...e.joints.neck);for(let n of[-1,1]){let r=gl(e,[n*.032,s.nose[1]-.004,s.nose[2]-.01],.002);bn(e.head,e.rnd,{base:`ico1`,r:[.011,.008,.006],pos:r,rot:[-.4,n*.4,0],color:H(t.coat,Pt,.65)})}for(let t of[-1,1]){let n=Gt(e,t*.4,.78,-.012).add(l),r=new x(t*.3,.8,-.5).normalize(),i=new x(0,-.3,-1).normalize(),o=[n.clone().addScaledVector(r,-.02),n.clone().addScaledVector(r,.035),n.clone().addScaledVector(r,.065).addScaledVector(i,.02),n.clone().addScaledVector(r,.078).addScaledVector(i,.058)];An(e,{bone:`neck`,pts:o,w:[.024,.02,.013,0],t:[.024,.02,.013,0],across:new x(1,0,0),colors:[a,a,a],name:`horn${t>0?`L`:`R`}`})}let u=[],d=l.clone().add(new x(...e.shape.hc));for(let e of[1,1.4,1.8]){let t=new x(0,Math.cos(e),-Math.sin(e));u.push({from:d,dir:t,along:new x(0,-Math.sin(e),-Math.cos(e)),bone:`neck`,size:.8})}Nt(e,`backPlates`,`body`,[0,.4,-.08]);for(let e=.52;e>.28;e-=.07){let t=new x(0,.45*(e-.28),-1).normalize();u.push({from:new x(0,e,0),dir:t,along:new x(0,1,.2).normalize(),bone:`backPlates`,size:.9})}let f=new x(...e.joints.tail),p=c.pts.length-1,m=Math.max(1,Math.round(p/3)),h=Math.max(m+1,Math.round(p*2/3));for(let e=1;e<p-1;e++){let t=new x(...c.pts[e]).add(f),n=new x(...c.pts[e+1]).add(f).clone().sub(t).normalize(),r=new x(0,1,0).addScaledVector(n,-n.y).normalize();u.push({from:t,dir:r,along:n.negate(),bone:e<m?`tail`:e<h?`tail1`:`tail2`,size:.85-e/p*.45})}u.forEach((t,n)=>{let r=jn(e,t.from,t.dir);if(!r)return;let a=.075*t.size,o=.032*t.size,s=[r.p.clone().addScaledVector(t.dir,-.014),r.p.clone().addScaledVector(t.dir,a*.45),r.p.clone().addScaledVector(t.dir,a).addScaledVector(t.along,a*.3)];An(e,{bone:t.bone,pts:s,w:[o,o*.8,0],t:[.012,.01,0],across:t.along,colors:[i,i],name:`ridge${n}`})});{let t=new x(...c.pts[p]).add(f),n=t.clone().sub(new x(...c.pts[p-1]).add(f)).normalize(),r=new x(0,1,0).cross(n).normalize(),a=[-.012,.012,.035,.058,.08,.105].map(e=>t.clone().addScaledVector(n,e));An(e,{bone:`tail2`,pts:a,w:[.018,.04,.056,.05,.03,0],t:[.016,.014,.013,.012,.009,0],across:r,colors:[i,i,i,i,i],name:`spade`})}for(let n of[-1,1]){let r=n>0?`wingL`:`wingR`,i=jn(e,new x(n*.06,.47,0),new x(n*.45,.15,-1));if(!i)continue;let s=i.n.clone().normalize();Nt(e,r,`body`,V(i.p.clone().addScaledVector(s,-.02)));let c=hu(i.p.clone().addScaledVector(s,-.006),new x(n*.5,.82,-.22),new x(n*.85,-.5,-.15)),l=c.at(.1,0),u=[c.at(.175,.035),c.at(.15,.1),c.at(.085,.135)],d=[c.at(0,0),c.at(.05,-.004),l,u[0],c.at(.13,.062),u[1],c.at(.088,.09),u[2],c.at(.03,.082),c.at(-.004,.06)];on(e,{bone:r,centre:c.at(.07,.05),rim:d,up:c.N,cup:.008,color:o,edge:H(o,t.coat,.45)}),[[[c.at(-.012,0),c.at(.05,-.002),l,u[0]],.011],[[l,c.at(.13,.05),u[1]],.007],[[l,c.at(.095,.07),u[2]],.007]].forEach(([n,i],a)=>{let o=n.length-1;An(e,{bone:r,pts:n,w:n.map((e,t)=>t===o?0:i*(1-t/o*.4)),t:n.map((e,t)=>t===o?0:i*.8),across:c.N,colors:n.slice(1).map(()=>t.coat),name:`${r}Bone${a}`})}),An(e,{bone:r,pts:[l,l.clone().addScaledVector(c.U,.008).addScaledVector(c.V,-.025)],w:[.006,0],t:[.005,0],across:c.N,colors:[a],name:`${r}Claw`})}let g=Cl(e,[`belly`,`chest`],0,.3,.165,.235),_=.075;return e.marks={base:t.coat,marks:[{color:r,f:U(g,e=>{let t=(e.p.y-.09)/_;return Math.abs(t-Math.round(t))*_-.013},e=>e.p.y-.43)},{color:n,f:g},{color:n,f:U(W(e,`muzzle`),e=>e.p.y-s.mid(e.p))}]},{wings:`flutter`}},_u=(e,t,n)=>{let r=`#2a2326`,i=kt(n)<.2?H(t.coat,`#f6e6b8`,.7):r,a=H(t.coat,`#fff6dc`,.5);e.joints.neck=[0,.47,.04],e.joints.shoulder=[.15,.4,.11],e.joints.hip=[.08,.15,0],e.joints.tail=[0,.16,-.2],Et(e,{belly:[[0,.27,-.03],[.22,.22,.21]],chest:[[0,.42,.01],[.17,.1,.16]],melt:.16});let o=Zt(e);for(let e=0;e<10;e++){let t=e/10*Math.PI*2;o.add(gn(`body`,[Math.sin(t)*.15,.445+e%2*.012,.02+Math.cos(t)*.145],[.058,.048,.058],{k:.04,name:`fluff${e}`}))}e.front+=.035,mn(e,{r:[.205,.185,.185],at:[0,.15,.05],melt:.12}),cn(e,{len:.14,r0:.034,r1:.03,paw:[.034,.028,.036],fwd:.5,out:.3}),sn(e,{r0:.028,r1:.024,foot:[.031,.02,.04]}),dn(e),Ut(e,{x:.42,y:.02,size:1.45,wide:1,slant:.05,color:`#1a1418`}),xn(e,{w:.2,y:-.5,curve:.1,r:.006});let s=new x(...e.joints.neck);for(let t of[-1,1]){let n=t>0?`earL`:`earR`,i=Gt(e,t*.3,.86,-.012);Nt(e,n,`neck`,V(i));let a=i.clone().add(s),o=[a.clone().add(new x(0,-.012,0)),a.clone().add(new x(t*.018,.06,.004)),a.clone().add(new x(t*.045,.115,.02)),a.clone().add(new x(t*.07,.15,.05))];An(e,{bone:n,pts:o,w:[.009,.008,.007,.006],t:[.009,.008,.007,.006],across:new x(1,0,0),colors:[r,r,r],name:`antenna${t>0?`L`:`R`}`}),bn(qt(e,`knob${t>0?`L`:`R`}`,n),e.rnd,{base:`ico2`,r:.024,pos:V(o[3].clone().sub(_n(e,n))),color:r})}{let t=jn(e,new x(0,.2,-.05),new x(0,-.45,-1));if(t){let n=new x(0,-.35,-1).normalize(),i=[t.p.clone().addScaledVector(n,-.014),t.p.clone().addScaledVector(n,.03),t.p.clone().addScaledVector(n,.058)];An(e,{bone:`tail`,pts:i,w:[.017,.009,0],t:[.017,.009,0],across:new x(1,0,0),colors:[r,r],name:`stinger`})}}for(let t of[-1,1]){let n=t>0?`wingL`:`wingR`,r=jn(e,new x(t*.04,.42,-.02),new x(t*.35,.3,-1));if(!r)continue;let i=r.n.clone().normalize();Nt(e,n,`body`,V(r.p.clone().addScaledVector(i,-.012)));let a=r.p.clone().addScaledVector(i,-.004),o=[[new x(t*.6,.78,-.15),.115,.004,.115,.05,0],[new x(t*.95,.15,-.2),.08,.004,.08,.034,.01]];for(let[r,i,s,c,l,u]of o){let o=hu(a,r,new x(t*.4,-1,-.1)),d=[];for(let e=0;e<14;e++){let t=e/14*Math.PI*2;d.push(o.at(i+Math.cos(t)*c,s+Math.sin(t)*l,u))}on(e,{bone:n,centre:o.at(i,s,u),rim:d,up:o.N,cup:.004,color:`#f6fbff`,edge:`#a9c0dc`,glass:!0})}}let c=$t()?[[-1,.1],[.19,.29]]:[[-1,.09],[.15,.21],[.27,.33]];return e.marks={base:t.coat,marks:[{color:a,f:W(e,/^fluff/)},{color:i,f:U(W(e,`belly`,`chest`),e=>Math.min(...c.map(([t,n])=>Math.max(t-e.p.y,e.p.y-n))))},{color:r,f:W(e,/^arm/,/^fore/,/^leg/)}]},{hover:.22,wings:`buzz`}},vu=(e,t)=>{let n=H(t.coat,`#f6f2d6`,.58),r=H(t.coat,`#1e2a18`,.28),i=H(t.coat,`#fbf8e8`,.72);e.joints.neck=[0,.5,.07],e.joints.shoulder=[.13,.41,.09],e.joints.hip=[.1,.16,-.04],e.joints.tail=[0,.2,-.17],Et(e,{belly:[[0,.29,-.03],[.175,.215,.19]],chest:[[0,.42,.03],[.135,.12,.14]],melt:.18});let a=[0,.1,.07];mn(e,{r:[.165,.15,.18],at:a,melt:.12});let o=Mn(e,{dy:-.18,len:.07,ra:.1,rb:.07,drop:.02,squash:[1,.85,1]}),s=Zt(e),c=Il(e.joints.neck,a),l=[0,c[1]+.06,c[2]-.08];s.add(Cn(`neck`,l,.06,.2,.085,{rot:[-.5,0,0],k:.035,anchor:l,reach:.12,round:.045,name:`casque`})),cn(e,{len:.18,r0:.04,r1:.034,paw:[.046,.026,.046],fwd:.45,out:.32}),sn(e,{r0:.05,r1:.04,foot:[.054,.028,.066]});let u=[[0,0,.02],[0,-.004,-.07]],d=[.062,.052],f=1.55*Math.PI;for(let e=0;e<=9;e++){let t=e/9*f,n=.1*Math.exp(-.18*t);u.push([t/Math.PI*.012,-.1+n*Math.cos(t),-.16-n*Math.sin(t)]),d.push(.044-e/9*.027)}let p=Vt(e,{pts:u,radii:d});dn(e),xn(e,{w:.5,y:-.36,curve:.08,r:.006}),e.nose=o.nose;let m=new x(0,0,1),h=new x;for(let n of[-1,1]){let r=n>0?`L`:`R`,i=Gt(e,n*.6,.16),a=Ht(e,n*.6,.16).add(new x(0,.12,.3)).normalize();Nt(e,`turret${r}`,`neck`,V(i.clone().addScaledVector(a,-.02)));let o=new O().setFromUnitVectors(m,a),s=new x(1,1,1);bn(qt(e,`turret${r}`,`turret${r}`),e.rnd,{base:`ico2`,r:[.064,.064,.054],matrix:new I().compose(a.clone().multiplyScalar(.02),o,s),bend:e=>{e.z>0&&(e.x*=1-.2*e.z,e.y*=1-.2*e.z)},color:t.coat});let c=a.clone().multiplyScalar(.074);Nt(e,`blink${r}`,`turret${r}`,V(c));let l=qt(e,`eye${r}`,`turret${r}`,{bone:`blink${r}`,eyes:!0}),u=new I().compose(c.clone().addScaledVector(a,-.004),o,s);bn(l,e.rnd,{base:`ico2`,r:[.03,.03,.01],matrix:Wt(u,[0,0,-.004]),color:`#d8ac3a`,tone:.05}),bn(l,e.rnd,{base:`ico2`,r:[.021,.021,.012],matrix:u,color:Lt,tone:.1}),bn(l,e.rnd,{base:`ico1`,r:[.007,.007,.004],matrix:Wt(u,[.007,.008,.01]),color:`#fffdf8`,tone:0}),h=i.clone().addScaledVector(a,.05)}return e.blink=[`blinkL`,`blinkR`],e.eyeY=h.y,e.eyeX=Math.abs(h.x),e.eyeR=.04,e.eyeZ=h.z+.02,Tl(e,`body`,[0,.3,-.03],[[2,.35,.02],[1.7,.1,.022],[1.4,.45,.018],[1.1,.15,.022],[.8,.42,.017]],i,`spot`),e.marks={base:t.coat,marks:[{color:n,f:Cl(e,[`belly`,`chest`],0,.3,.12,.22)},{color:r,f:U(W(e,/^tail\d/),e=>.6-Math.sin(p(e.p)*Math.PI*7))},{color:n,f:U(W(e,`muzzle`,`head`),e=>e.p.y-(o.mid(e.p)-.01),e=>-e.p.z+c[2]+.05)}]},{swivel:!0,shifts:!0}},yu=(e,t)=>{let n=H(t.coat,`#f2eee6`,.86),r=kt(t.coat)>.6?H(t.coat,`#6a7a90`,.3):H(t.coat,`#f6f3ec`,.8),i=H(t.coat,`#1a2236`,.28),a=H(t.coat,`#1a2236`,.1);e.joints.neck=[0,.52,.05],e.joints.shoulder=[.21,.42,.07],e.joints.hip=[.11,.15,-.02],e.joints.tail=[0,.2,-.19];let o=[0,.29,-.02];Et(e,{belly:[o,[.25,.27,.22]],chest:[[0,.46,.03],[.225,.16,.2]],melt:.2});let s=[0,.11,.06],c=[.3,.165,.25];mn(e,{r:c,at:s,melt:.2});let l=Il(e.joints.neck,s),u=Zt(e);u.add(gn(`neck`,[0,l[1]-.035,l[2]+.1],[.27,.12,.17],{k:.08,name:`jaw`})),un(e,{len:.3,w:.1,d:.04,taper:.62,fwd:.25,out:.62}),sn(e,{r0:.065,r1:.055,foot:[.065,.035,.085]});let d=hl(.3,[0,-.15,-1],[.3,0,0],.11,[1,.8,.58,.42]),f=Vt(e,d),p=new x(...e.joints.tail),m=Il(e.joints.tail,d.pts[d.pts.length-1]),h=(e,t,n)=>{for(let r=0;r+1<e.length;r++)u.add(ln(`tail2`,Il(m,e[r]),Il(m,e[r+1]),t[r],t[r+1],{k:r===0?.04:.02,anchor:m,reach:.1,name:`${n}${r}`,squash:[.34,1,1],thin:!0}))};h([[0,0,0],[0,.1,-.035],[0,.19,-.09],[0,.26,-.17]],[.07,.06,.042,.014],`finUp`),h([[0,0,0],[0,-.06,-.05],[0,-.095,-.12]],[.06,.042,.014],`finDown`),Nt(e,`backPlates`,`body`,[0,.36,-.2]),rn(e,`backPlates`,[0,.36,-.2],{len:.13,w:.028,d:.07,rot:[-1.6,0,0],name:`dorsal`,melt:.05});let g=(t,n)=>jn(e,new x(0,n,o[2]),new x(Math.sin(t),0,-Math.cos(t)));dn(e),Ut(e,{x:.62,y:.1,size:.62,wide:1,slant:0,color:`#141018`}),xn(e,{w:.68,y:-.3,curve:.12,r:.009}),e.nose=V(Gt(e,0,-.12));let _=new nn(u),v=W(e,`belly`,`chest`),y=(e,t=.005)=>v(_.set(e.x,e.y,e.z))<-t;for(let t of[-1.1,-.55,.55,1.1]){let n=[];for(let e=.55;e>.17;e-=.055){let r=g(t,e);r&&y(r.p)&&n.push(r.p)}let r=n.map((e,t)=>t===0||t===n.length-1?0:.022);An(e,{bone:`body`,pts:n,w:r,t:r.map(e=>e*.55),across:new x(Math.cos(t),0,Math.sin(t)),colors:n.slice(1).map(()=>a),name:`ridge${t>0?`L`:`R`}${+(Math.abs(t)>.8)}`})}for(let t of[.25,.35,.45]){let n=[[]];for(let e=-1.45;e<1.5;e+=.1){let r=g(e,t);r&&y(r.p)?n[n.length-1].push(r.p):n.push([])}for(let t of n)Qt(e,{bone:`body`,pts:t,w:.0075,color:r})}[.2,.3,.4,.5].forEach((t,n)=>{for(let i of[-1.36,-.83,-.27,.27,.83,1.36]){let a=g(i,t);a&&y(a.p,.03)&&wn(e,{bone:`body`,from:new x(0,t,o[2]),dir:new x(Math.sin(i),0,-Math.cos(i)),r:.028,color:r,sides:9,name:`spot${n}_${i}`})}}),Dl(e,`neck`,l,c,80,e=>e.y>.28&&e.z<.82,.022,r,`headSpot`,9);let b=[];if($t()){for(let t of Ll(26)){let n=t.y>.3&&t.z<.8&&jn(e,new x(...l),new x(t.x*c[0],t.y*c[1],t.z*c[2]));n&&b.push(n.p)}for(let e of[.25,.43])for(let t of[-1.2,-.45,.45,1.2]){let n=g(t,e);n&&b.push(n.p)}}let S=It(e,`head`);return e.marks={base:t.coat,marks:[{color:n,f:Cl(e,[`belly`,`chest`],0,.3,.19,.29)},{color:n,f:U(W(e,`head`,`jaw`),e=>-S(e).z,e=>S(e).y-(-.34+.12*S(e).x**2))},{color:n,f:U(W(e,/^leg/),e=>e.p.y-.03)},{color:n,f:U(W(e,/^tail\d/),e=>e.p.y-(p.y+(m[1]-p.y)*f(e.p))+.02)},{color:i,f:W(e,`dorsal`,/^finUp/,/^finDown/)},{color:r,f:e=>Math.min(...b.map(t=>e.p.distanceTo(t)))-.045}]},{aquatic:!0}};function bu(e,t){let n=e.clone().normalize(),r=new x().crossVectors(n,t).normalize(),i=new x().crossVectors(r,n),a=new L().setFromRotationMatrix(new I().makeBasis(r,n,i));return[a.x,a.y,a.z]}var xu=[[.47,.035,.15,.14],[.4,.01,.162,.152],[.33,-.015,.168,.158],[.26,-.03,.165,.155],[.19,-.036,.152,.142]];function Su(e,t,n){let r=t.map(t=>It(e,t));return e=>{let t=1/0;for(let n=0;n+1<r.length;n++){let i=r[n](e).y,a=r[n+1](e).y;i*a<.04&&(t=Math.min(t,Math.abs(i+a)*.5))}return t-n}}var Cu={raccoon:bl,fox:_l,snail:xl,wolf:Zl,bear:Ql,deer:Wl,hedgehog:Bl,panda:Jl,penguin:Ml,otter:Yl,frog:Fl,axolotl:Vl,shark:kl,octopus:jl,duck:Nl,platypus:ql,capybara:Xl,redpanda:$l,quokka:eu,sloth:Gl,seal:Kl,highland:Ul,squid:zl,bat:Pl,jellyfish:Al,gecko:Hl,ferret:tu,dugong:nu,seacucumber:ru,ibis:iu,crab:au,turtle:su,kaiju:cu,robot:fu,homunculus:pu,fungi:mu,dragon:gu,bee:_u,chameleon:vu,whaleshark:yu,prawn:(e,t)=>{let n=H(t.coat,`#fff3e8`,.3),r=H(t.coat,`#4a2028`,.3);e.step=.034,e.joints.neck=[0,.5,.04],e.joints.shoulder=[.13,.43,.07],e.joints.hip=[.075,.13,0],e.joints.tail=[0,.17,-.12],Et(e,{belly:[[0,.27,-.03],[.13,.17,.12]],chest:[[0,.42,.015],[.125,.11,.115]],melt:.14});let i=Zt(e),a=xu.map(([e,t,n,r],a)=>(i.add(gn(`body`,[0,e,t],[n,.05,r],{rot:[.06*a,0,0],k:.012,name:`band${a}`})),`band${a}`));e.shape.tr=[.168,e.shape.tr[1],.165],e.front=(e.front??0)+.03,mn(e,{r:[.19,.165,.185],at:[0,.12,.04],melt:.1}),cn(e,{len:.19,r0:.034,r1:.03,paw:[.036,.032,.046],fwd:.55,out:.32}),sn(e,{r0:.04,r1:.034,foot:[.042,.022,.06],fwd:.025});let o=hl(.2,[0,-.35,-1],[.85,0,0],.075,[1,.86,.72,.6]);Vt(e,o);let s=new x(...e.joints.tail),c=o.pts.length-1,l=e=>new x(...o.pts[Math.min(c,Math.floor(e))]).lerp(new x(...o.pts[Math.min(c,Math.floor(e)+1)]),e%1).add(s),u=new x(1,0,0),d=[1.8,5.2].map((e,t)=>{let n=l(e+.5).sub(l(e-.5)).normalize(),r=.09-t*.014;return i.add(gn(e<c/3?`tail`:e<c*2/3?`tail1`:`tail2`,V(l(e)),[r,.034,r*.9],{rot:bu(n,new x(0,1,0)),k:.012,name:`ring${t}`})),`ring${t}`}),f=l(c),p=l(c).sub(l(c-1)).normalize(),m=new x().crossVectors(u,p).normalize();for(let e of[-1.1,-.55,0,.55,1.1]){let t=u.clone().multiplyScalar(Math.cos(.45)).addScaledVector(m,Math.sin(.45)*Math.sign(e)),n=p.clone().multiplyScalar(Math.cos(e)).addScaledVector(t,Math.sin(e)),r=f.clone().addScaledVector(n,-.02);e===0?i.add(Cn(`tail2`,V(r),.055,.19,.022,{rot:bu(n,m),k:.02,anchor:V(f),reach:.06,round:.012,name:`fan0`,thin:!0})):i.add(gn(`tail2`,V(r.addScaledVector(n,.105)),[.056,.11,.024],{rot:bu(n,new x().crossVectors(t,p)),k:.02,anchor:V(f),reach:.06,name:`fan${e>0?`L`:`R`}${Math.abs(e)>.7?2:1}`,thin:!0}))}dn(e),xn(e,{w:.22,y:-.4,curve:.08,r:.006}),e.nose=V(Gt(e,0,-.2));let h=new x(0,.06,.05);for(let n of[-1,1]){let r=n>0?`L`:`R`,i=Gt(e,n*.4,.3,-.015);Nt(e,`stalk${r}`,`neck`,V(i));let a=h.clone().add(new x(n*.035,0,0));Nt(e,`blink${r}`,`stalk${r}`,V(a));let o=qt(e,`stalk${r}`,`stalk${r}`);kn(o,e.rnd,[0,0,0],V(a),.021,.018,t.coat,{base:`limb5`});let s=qt(e,`eye${r}`,`stalk${r}`,{bone:`blink${r}`,eyes:!0}),c=At(a);bn(s,e.rnd,{base:`ico2`,r:[.036,.038,.034],matrix:c,color:Lt,tone:.1}),bn(s,e.rnd,{base:`ico1`,r:[.012,.012,.006],matrix:Wt(c,[.011,.015,.029]),color:`#fffdf8`,tone:0}),bn(s,e.rnd,{base:`ico1`,r:[.005,.005,.003],matrix:Wt(c,[-.012,-.011,.031]),color:`#fffdf8`,tone:0})}e.blink=[`blinkL`,`blinkR`];let g=Gt(e,.4,.3).add(h);e.eyeY=g.y,e.eyeX=g.x+.035,e.eyeR=.038,e.eyeZ=g.z+.034;let _=new x(...e.joints.neck),v=Gt(e,0,.38,-.02).add(_),y=[v,v.clone().add(new x(0,.028,.065)),v.clone().add(new x(0,.05,.135)),v.clone().add(new x(0,.07,.2))];An(e,{bone:`neck`,pts:y,w:[.016,.013,.008,0],t:[.03,.022,.012,0],across:u,colors:[t.coat,t.coat,r],name:`rostrum`}),[.35,.6,.82].forEach((n,r)=>{let i=y[0].clone().lerp(y[3],n),a=.03*(1-n)+.004;An(e,{bone:`neck`,pts:[i.clone().add(new x(0,a-.01,-.01)),i.clone().add(new x(0,a+.013,.008))],w:[.005,0],t:[.008,0],across:u,colors:[t.coat],name:`rostrumTooth${r}`})});let b=[[0,0,0],[.04,.005,.02],[.11,.035,.005],[.19,.075,-.05],[.265,.08,-.16],[.32,.03,-.3],[.355,-.09,-.45],[.365,-.26,-.56],[.36,-.45,-.61]];for(let n of[-1,1]){let r=`feeler${n>0?`L`:`R`}`,i=Gt(e,n*.58,.14,-.015);Nt(e,r,`neck`,V(i));let a=i.add(_),o=new Ee(b.map(([e,t,r])=>a.clone().add(new x(n*e,t,r)))).getSpacedPoints(16),s=o.map((e,t)=>t===16?0:.0075-t/16*.0045);for(let n=0;n<4;n++){let i=n*4;An(e,{bone:r,pts:o.slice(i,i+5),w:s.slice(i,i+5),t:s.slice(i,i+5),across:new x(0,1,0),colors:[t.coat,t.coat,t.coat,t.coat],name:`${r}${n}`})}}for(let n of e.paws??[]){let i=new O().setFromEuler(new L(...n.rot)),a=new x(...n.at),o=new x(0,0,1).applyQuaternion(i),s=new x(0,1,0).applyQuaternion(i),c=new x(1,0,0).applyQuaternion(i);for(let i of[1,-1]){let l=(e,t)=>a.clone().addScaledVector(o,e).addScaledVector(s,t*i);An(e,{bone:n.bone,pts:[l(.005,.012),l(.045,.02),l(.075,.016),l(.095,.004)],w:[.017,.015,.011,0],t:[.014,.012,.009,0],across:c,colors:[t.coat,t.coat,r],name:`claw${n.bone}${i>0?`Top`:`Low`}`})}}for(let n=0;n<4;n++){let r=.43-n*.07;for(let i of[-1,1]){let a=jn(e,new x(i*.05,r,0),new x(i*.4,-.1,1));if(!a)continue;let o=a.p.clone().addScaledVector(a.n,-.015),s=a.p.clone().add(new x(i*.025,.012,.035)),c=s.clone().add(new x(i*.008,-.055,.01)),l=c.clone().add(new x(0,-.008,.004));An(e,{bone:`body`,pts:[o,s,c,l],w:[.012,.011,.009,0],t:[.011,.01,.008,0],across:u,colors:[t.coat,t.coat,t.coat],name:`walker${i>0?`L`:`R`}${n}`})}}return e.marks={base:t.coat,marks:[{color:r,f:U(W(e,...a,`belly`,`chest`),Su(e,a,.2))},{color:r,f:U(W(e,...d,/^tail\d/),Su(e,d,.16))},{color:n,f:Cl(e,a,0,.3,.1,.2)},{color:r,f:W(e,/^fan/)}]},{aquatic:!0}},meerkat:(e,t)=>{let n=H(t.coat,`#f7ecd6`,.62),r=H(t.coat,`#2c2019`,.8),i=H(t.coat,`#3a2a1e`,.22);e.joints.neck=[0,.66,.05],e.joints.shoulder=[.1,.55,.07],e.joints.hip=[.08,.16,-.02],e.joints.tail=[0,.17,-.14],Et(e,{belly:[[0,.3,-.01],[.165,.27,.155]],chest:[[0,.53,.03],[.12,.15,.12]],melt:.22}),mn(e,{r:[.15,.135,.15],at:[0,.11,.05],melt:.1});let a=Mn(e,{dy:-.24,len:.1,ra:.075,rb:.03,drop:.035,squash:[1.05,.85,1],thin:!0});On(e,{x:.86,y:.3,w:.042,h:.05,d:.022,round:!0,splay:1.1,rake:.05,turn:.3}),cn(e,{len:.17,r0:.034,r1:.028,paw:[.032,.026,.036],fwd:.6,out:.12}),sn(e,{r0:.05,r1:.04,foot:[.045,.024,.08]});let o=Vt(e,hl(.44,[0,-.75,-1],[.6,0,0],.045,[1,.85,.7,.55,.4]));dn(e),Ut(e,{x:.42,y:.14,size:.95,wide:1,slant:.05,color:`#120d0b`}),Kt(e,`#2a1f1a`,gl(e,a.nose),.02,.016),Ct(e,t.coat,{len:.07}),xn(e,{w:.12,y:-.52,curve:.06,r:.0055});let s=It(e,`head`);return e.marks={base:t.coat,marks:[{color:r,f:W(e,`earL`,`earR`)},{color:r,f:U(W(e,`head`,`muzzle`),e=>{let t=s(e);return Rt(Math.abs(t.x),t.y,.42,.18,.62,-.14).d-.2+ +(t.z<.1)})},{color:n,f:W(e,`muzzle`)},{color:n,f:U(W(e,`head`),e=>.25-s(e).z)},{color:n,f:Cl(e,[`belly`,`chest`],0,.36,.12,.34)},{color:i,f:U(W(e,`belly`,`chest`),e=>{let t=(e.p.y+.015*Math.sin(e.p.x*30))/.065;return Math.max(Math.abs(t-Math.round(t))-.2,e.p.z+.05,Math.abs(e.p.y-.32)-.15)*.1})},{color:H(t.coat,r,.35),f:W(e,`armLPaw`,`armRPaw`,`legLFoot`,`legRFoot`)},{color:r,f:U(W(e,/^tail\d/),e=>.78-o(e.p))}]},{}},skeleton:(e,t)=>{let n=kt(t.coat)<.08,r=n?H(t.coat,`#efe8f4`,.62):H(t.coat,`#1c1522`,.86),i=n?H(t.coat,`#efe8f4`,.42):H(t.coat,`#3a3040`,.84),a=n?H(t.coat,`#efe8f4`,.32):H(t.coat,`#3c3048`,.62);e.joints.neck=[0,.56,0],e.joints.shoulder=[.15,.5,0],e.joints.hip=[.075,.17,0],e.joints.tail=[0,.2,-.1],e.step=.03;let o=Zt(e),s=e.joints.neck;o.add(gn(`body`,[0,.42,.01],[.15,.135,.125],{name:`ribs`})),o.add(ln(`body`,[0,.33,-.03],[0,.21,-.03],.042,.042,{k:.03,name:`spine`})),o.add(gn(`body`,[0,.205,-.005],[.115,.052,.08],{k:.035,name:`pelvis`})),o.add(ln(`neck`,[0,s[1]-.09,-.02],[0,s[1]+.04,-.01],.036,.036,{k:.03,name:`neckBone`})),e.shape.tc=[0,.36,0],e.shape.tr=[.15,.2,.125],e.shape.pear=0,e.front=.135,e.seat=.14,mn(e,{r:[.205,.19,.19],at:[0,.18,.01],melt:.05});let c=Il(s,e.shape.hc);for(let e of[-1,1])o.add(gn(`neck`,[e*.11,c[1]-.09,c[2]+.1],[.06,.045,.06],{k:.04,name:e>0?`cheekL`:`cheekR`}));o.add(gn(`neck`,[0,c[1]-.14,c[2]+.06],[.12,.07,.11],{k:.05,name:`jaw`})),cn(e,{len:.2,r0:.026,r1:.022,paw:[.03,.034,.028],fwd:.2,out:.2});for(let e of[`armL`,`armR`])o.named(e).k=.015;sn(e,{r0:.03,r1:.026,foot:[.045,.026,.075],fwd:.04});let l=e.elbow??.1;for(let t of[-1,1]){let n=t>0?`L`:`R`,r=[t*e.joints.shoulder[0],e.joints.shoulder[1],e.joints.shoulder[2]];o.add(gn(`arm${n}`,r,[.04,.04,.04],{k:.015,name:`shoulder${n}`}));let i=new O().setFromEuler(new L(...e.bind.armL.map((e,n)=>n===2?e*t:e))),a=new x(0,-l,0).applyQuaternion(i).add(new x(...r));o.add(gn(`fore${n}`,V(a),[.032,.032,.032],{k:.02,name:`elbow${n}`})),o.add(gn(`leg${n}`,[t*e.joints.hip[0],.1,e.joints.hip[2]+.005],[.035,.035,.035],{k:.02,name:`knee${n}`}))}dn(e),Ut(e,{x:.36,y:.04,size:1.45,wide:1,slant:0,color:`#120e16`}),xn(e,{w:.28,y:-.5,curve:.1,r:.0055,color:r});let u=new x(...s);for(let t=-3;t<=3;t++){let n=t/3.5*.28,i=-.5+.1*(n/.28)**2,a=Gt(e,n,i).add(u),o=Ht(e,n,i);An(e,{bone:`neck`,pts:[a.clone().add(new x(0,.022,0)).addScaledVector(o,-.002),a.clone().addScaledVector(o,.002),a.clone().add(new x(0,-.022,0)).addScaledVector(o,-.002)],w:[0,.0032,0],t:[0,.0022,0],across:new x(1,0,0),colors:[r,r],name:`tooth${t}`})}for(let n of e.paws??[]){let r=new O().setFromEuler(new L(...n.rot)),i=new x(...n.at),a=(e,t,n)=>i.clone().add(new x(e,t,n).applyQuaternion(r));for(let i of[-1,0,1])An(e,{bone:n.bone,pts:[a(0,-.015,i*.016),a(.004,-.045,i*.02+.006),a(0,-.068,i*.022+.012)],w:[.008,.007,0],t:[.008,.007,0],across:new x(0,0,1).applyQuaternion(r),colors:[t.coat,t.coat],name:`finger${n.bone}${i}`})}for(let t of[.345,.4,.455])for(let n of[-1,1]){let r=[.28,.6,.95,1.3,1.65,2,2.35,2.7].map(r=>jn(e,new x(0,t,.01),new x(n*Math.sin(r),-.28*Math.sin(r),Math.cos(r)))?.p);r.every(Boolean)&&Qt(e,{bone:`body`,pts:r,w:.0095,color:a})}let d=e=>{let t=(e.p.y-.33+.9*e.p.x*e.p.x)/.06;return Math.max(Math.abs(t-Math.floor(t)-.5)-.18,.03-Math.abs(e.p.x),e.p.y-.48)},f=It(e,`head`),p=t=>U(W(e,`head`),e=>{let n=f(e);return n.z<0?1:t(n)});return e.marks={base:t.coat,marks:[{color:i,f:p(e=>Math.hypot(Math.abs(e.x)-.36,e.y-.04)-.33)},{color:r,f:p(e=>Math.hypot(Math.abs(e.x)-.045,e.y+.2)-.06+Math.max(0,e.y+.2)*.4)},...$t()?[{color:a,f:U(W(e,`ribs`),d)}]:[]]},{}}},wu={fox:{lean:-.03,head:-.07,gait:`trot`,cadence:1.25,stride:.9,sit:`wrap`,idles:[`earSwivel`,`tailSwish`,`headTilt`],tailSway:.3},raccoon:{lean:.14,head:-.05,paws:.2,gait:`amble`,cadence:.85,sit:`tuck`,idles:[`rubPaws`,`sniff`,`lookAround`],tailSway:.18},snail:{gait:`slither`,cadence:.55,sit:`settle`,idles:[`stalks`,`stretch`,`stalks`],tailSway:0},shark:{lean:.04,head:-.02,gait:`waddle`,cadence:1,stride:.7,sit:`settle`,bed:`side`,idles:[`tailSwish`,`headTilt`,`chill`],tailSway:.25},jellyfish:{gait:`float`,cadence:.6,sit:`settle`,idles:[`sway`,`chill`,`sway`],tailSway:0},octopus:{gait:`scuttle`,cadence:1.1,sit:`settle`,bed:`upright`,idles:[`sway`,`stretch`,`chill`],tailSway:0},penguin:{lean:-.02,head:-.04,gait:`waddle`,cadence:1.2,stride:.55,sit:`settle`,idles:[`flap`,`headTilt`,`chill`],tailSway:.1},duck:{lean:.04,head:-.03,gait:`waddle`,cadence:1.15,stride:.6,sit:`settle`,idles:[`flap`,`headTilt`,`wag`],tailSway:.2},bat:{gait:`flap`,cadence:1.2,sit:`settle`,idles:[`wingStretch`,`scratch`,`lookAround`],tailSway:0},squid:{gait:`scuttle`,cadence:1,sit:`settle`,idles:[`sway`,`chill`,`stretch`],tailSway:0},hedgehog:{lean:.04,head:-.04,paws:.1,gait:`trot`,cadence:1.5,stride:.6,sit:`tuck`,bed:`side`,idles:[`sniff`,`noseWiggle`,`lookAround`],tailSway:0},axolotl:{lean:.02,head:-.02,gait:`waddle`,cadence:.9,stride:.7,sit:`settle`,idles:[`headTilt`,`tailSwish`,`chill`],tailSway:.3},gecko:{lean:.05,head:-.04,gait:`trot`,cadence:1.3,stride:.8,sit:`tuck`,idles:[`lookAround`,`tailCurl`,`headTilt`],tailSway:.3},highland:{lean:.04,head:-.02,gait:`amble`,cadence:.75,stride:.9,sit:`tuck`,idles:[`chill`,`headTilt`,`tailSwish`],tailSway:.2},deer:{lean:-.02,head:-.06,gait:`trot`,cadence:1.1,stride:1,sit:`tuck`,idles:[`earTwitch`,`lookAround`,`headTilt`],tailSway:.1},sloth:{lean:.06,head:-.04,gait:`amble`,cadence:.5,stride:.8,sit:`tuck`,idles:[`slowBlink`,`stretch`,`headTilt`],tailSway:0},seal:{lean:.02,head:-.02,gait:`waddle`,cadence:.9,stride:.6,sit:`settle`,idles:[`headTilt`,`chill`,`flap`],tailSway:0},platypus:{lean:.05,head:-.03,gait:`waddle`,cadence:1,stride:.7,sit:`settle`,idles:[`sniff`,`tailSwish`,`chill`],tailSway:.2},panda:{lean:.06,head:-.03,gait:`amble`,cadence:.8,stride:.9,sit:`feet`,idles:[`chill`,`headTilt`,`scratch`],tailSway:.05},otter:{lean:-.03,head:-.05,paws:.14,gait:`trot`,cadence:1.3,stride:.85,sit:`tuck`,idles:[`rubPaws`,`lookAround`,`headTilt`],tailSway:.3},capybara:{lean:.04,head:0,gait:`amble`,cadence:.7,stride:.8,sit:`tuck`,idles:[`chill`,`slowBlink`,`lookAround`],tailSway:0},wolf:{lean:-.02,head:-.05,gait:`trot`,cadence:1.1,stride:1,sit:`wrap`,idles:[`earSwivel`,`lookAround`,`pant`],tailSway:.2},bear:{lean:.06,head:-.03,gait:`amble`,cadence:.8,stride:.9,sit:`feet`,idles:[`scratch`,`sniff`,`chill`],tailSway:.05},redpanda:{lean:.03,head:-.04,gait:`amble`,cadence:1,stride:.85,sit:`wrap`,idles:[`lookAround`,`tailSwish`,`rubPaws`],tailSway:.25},quokka:{lean:.02,head:-.03,paws:.12,gait:`hop`,cadence:1,sit:`feet`,idles:[`headTilt`,`sniff`,`chill`],tailSway:.05},frog:{lean:.05,head:-.06,gait:`hop`,cadence:1,sit:`settle`,idles:[`throat`,`slowBlink`,`hop`],tailSway:0},ferret:{lean:-.02,head:-.05,paws:.1,gait:`trot`,cadence:1.45,stride:.85,sit:`tuck`,idles:[`sniff`,`hop`,`lookAround`],tailSway:.3},dugong:{lean:.03,head:-.02,gait:`waddle`,cadence:.75,stride:.5,sit:`settle`,idles:[`chill`,`slowBlink`,`flap`],tailSway:0},seacucumber:{gait:`slither`,cadence:.5,sit:`settle`,idles:[`stretch`,`sway`,`chill`],tailSway:0},ibis:{lean:.1,head:-.02,gait:`trot`,cadence:.95,stride:.8,sit:`settle`,idles:[`sniff`,`headTilt`,`wingStretch`],tailSway:.08},crab:{lean:0,head:0,paws:.12,gait:`scuttle`,cadence:1.3,stride:.6,sit:`settle`,idles:[`stalks`,`rubPaws`,`lookAround`],tailSway:0},turtle:{lean:.03,head:-.02,gait:`waddle`,cadence:.6,stride:.55,sit:`settle`,idles:[`slowBlink`,`headTilt`,`chill`],tailSway:.05},kaiju:{lean:.06,head:-.03,paws:.1,gait:`amble`,cadence:.7,stride:.85,sit:`tuck`,bed:`side`,idles:[`lookAround`,`stretch`,`tailSwish`],tailSway:.15},robot:{lean:0,head:0,gait:`waddle`,cadence:1.3,stride:.5,sit:`feet`,idles:[`headSwivel`,`lookAround`,`headTilt`],tailSway:0},homunculus:{lean:.04,head:-.04,gait:`trot`,cadence:1.4,stride:.75,sit:`feet`,idles:[`rubPaws`,`earTwitch`,`headTilt`,`lookAround`],tailSway:0},fungi:{lean:0,head:-.02,gait:`hop`,cadence:1.05,sit:`feet`,idles:[`sway`,`headTilt`,`slowBlink`],tailSway:0},dragon:{lean:.03,head:-.04,paws:.12,gait:`waddle`,cadence:1.05,stride:.65,sit:`feet`,bed:`side`,idles:[`flutter`,`tailSwish`,`lookAround`,`flutter`],tailSway:.2},bee:{lean:.02,head:-.03,gait:`flap`,cadence:1.3,stride:.7,sit:`settle`,idles:[`rubPaws`,`earTwitch`,`lookAround`],tailSway:0},chameleon:{lean:.04,head:-.03,gait:`amble`,cadence:.6,stride:.75,sit:`feet`,idles:[`sway`,`headTilt`,`lookAround`],tailSway:.05},whaleshark:{lean:.03,head:-.02,gait:`waddle`,cadence:.75,stride:.6,sit:`settle`,bed:`side`,idles:[`slowBlink`,`tailSwish`,`chill`],tailSway:.22},prawn:{lean:.02,head:-.03,paws:.12,gait:`scuttle`,cadence:1.35,stride:.6,sit:`settle`,idles:[`stalks`,`rubPaws`,`tailSwish`],tailSway:.2},meerkat:{lean:-.04,head:-.06,paws:.17,gait:`trot`,cadence:1.55,stride:.75,sit:`feet`,idles:[`sentinel`,`lookAround`,`sniff`,`sentinel`],tailSway:.12},skeleton:{lean:0,head:-.03,gait:`trot`,cadence:1.2,stride:.85,sit:`feet`,idles:[`headTilt`,`lookAround`,`stretch`],tailSway:0}},Tu={fox:{toes:2,paws:2},penguin:{toes:2},wolf:{toes:2,paws:2},redpanda:{toes:2,paws:2},quokka:{toes:2},panda:{toes:2},raccoon:{toes:3},bear:{claws:3},gecko:{toes:3,paws:3},otter:{toes:3},ferret:{toes:2,paws:2},kaiju:{claws:3},homunculus:{toes:3},dragon:{claws:3},chameleon:{toes:1,paws:1},meerkat:{toes:2,claws:3},skeleton:{toes:2}};function Eu(e){return{...wt(),...wu[e]}}var Du=Ge.smoothstep,{sin:X,cos:Ou,abs:ku,max:Au,PI:ju}=Math,Mu=ju*2;function Nu(e,t){let n=e.get(t);return n||e.set(t,n=[0,0,0,0,0,0,1]),n}function Pu(e){[e.alx,e.arx]=[e.arx,e.alx],[e.alz,e.arz]=[-e.arz,-e.alz],[e.aly,e.ary]=[-e.ary,-e.aly],[e.sl,e.sr]=[e.sr,e.sl],[e.el,e.er]=[e.er,e.el],[e.llx,e.lrx]=[e.lrx,e.llx],[e.llz,e.lrz]=[-e.lrz,-e.llz],e.bx=-e.bx,e.bry=-e.bry,e.brz=-e.brz,e.hry=-e.hry,e.hrz=-e.hrz,e.try=-e.try}function Fu(e,t,n,r,i){let a=e.shoulder,o=e.headC.y+e.headR.y,s=e.sk.rest.get(`legL`)?.y??a.y*.5,c=i*2,l=e.prof.gait===`hop`?1.3:1,u=e=>a.x-e,d=(e,t)=>{Nu(n,`earL`)[0]=Nu(n,`earR`)[0]=e,Nu(n,`earL`)[2]=Nu(n,`earR`)[2]=t},f=e=>{t.brx=e,t.llx=t.lrx=-e,t.by+=s*(1-Ou(e)),t.bz+=-s*X(e)},p=n=>e.reach(t,n,s+.04,e.front*.4,.04,`paw`),m=(e=.78)=>{t.alz=ju*e,t.arz=-ju*e,t.alx=t.arx=-.12,t.el=t.er=0};switch(r){case`fistpump`:{let n=c%1,r=Au(0,X(n*Mu)),a=Au(0,-X(n*Mu));t.by=r*.1*l-a*.03,t.brx=a*.1,t.llx=t.lrx=-a*.25;let s=Math.floor(c)%3==2;e.raise(t,s?`both`:`r`,o+.06+r*.08,.01),s||(t.alz=e.armOut+.25,t.alx=-.5,t.el=1.3),t.hrx=-.12-r*.15,t.try=X(i*12)*.5,d(-.25,0);break}case`default`:if(c%8<6){let n=Math.floor(c)%2?1:-1,r=X(c%1*ju);t.by=r*.04,t.alx=-.4-n*.7*r,t.arx=-.4+n*.7*r,t.alz=e.armOut+.15,t.arz=-e.armOut-.15,t.el=t.er=1.2,n>0?t.llz=.45*r:t.lrz=-.45*r,t.brz=-n*.08*r,t.hrz=n*.12*r,t.try=n*.6}else{let n=ku(X(c*Mu));e.reach(t,`both`,a.y-.08-n*.08,e.front+e.pawR+.1,.02,`paw`),t.by=-n*.04,t.llx=t.lrx=-n*.3,t.brx=n*.12,t.hrx=.1}break;case`floss`:e.dance(t,n,`floss`,i*1.5),t.by+=ku(X(i*ju*3.3))*.05*l;break;case`takel`:{let n=e.eyePos.y+.07;e.reach(t,`r`,n,e.faceFront(n)+e.pawR+.03,u(-.01),`paw`),t.alz=e.armOut+.5,t.alx=-.2+X(c*ju)*.3,t.el=.8;let r=Math.floor(c)%2?1:-1,a=X(c%1*ju);t.by=a*.05*l,r>0?t.llx=-.7*a:t.lrx=-.7*a,t.bry=r*.15,t.hry=X(i*4)*.25,t.hrz=r*.08,t.try=r*.5;break}case`dab`:{let n=c%4,r=n<2?1:-1,i=Du(n%2,0,.25),a=ku(X(c*ju));if(i<.05||n%2>1.75)t.by=a*.05,t.alz=e.armOut+.2,t.arz=-e.armOut-.2,t.alx=t.arx=-.3,t.el=t.er=1,t.hrx=-.1;else{let n=e.eyePos.y+.02;e.reach(t,`r`,n,e.faceFront(n)+e.pawR+.08,u(e.headR.x+.08),`paw`),t.alz=2.2,t.alx=-.5,t.el=0,t.hrx=.38,t.hry=.45,t.hrz=.15,t.brz=-.06,t.bry=.15,t.by=-.01,t.llz=.12,t.lrz=-.12,r<0&&Pu(t)}d(-.1,0);break}case`gangnam`:{let n=i*4,r=ku(X(n*ju)),s=Math.floor(n/2)%2==0;t.by=r*.07*l,t.llx=s?-.6*r:.1,t.lrx=s?.1:-.6*r,t.bx=X(i*ju*.5)*.08,t.brx=-.05,e.reach(t,`both`,a.y-.02+r*.03,e.front+e.pawR+.08,u(.02),`paw`),c%16>=12?(e.raise(t,`r`,o+.14,.04+X(i*14)*.08),t.arx+=Ou(i*14)*.25,t.bz=X(i*8)*.04,t.hrx=-.15):t.hrx=r*.1-.05,t.hry=s?.12:-.12,t.try=(s?1:-1)*.5,d(-.2+r*.2,0);break}case`zombie`:{let n=c%8,r=n<4?1:-1,i=Au(0,X(n%1*Mu)),o=Du(n%4,3,4);e.reach(t,`both`,a.y+.08+i*.03,e.front+e.pawR+.12,.02,`paw`),t.alz+=r*.35,t.arz+=r*.35,t.el=t.er=Au(t.el,.6),t.bx=r*.05*(1-2*o),t.by=i*.02,t.brz=-r*.08,t.bry=r*.2,t.hrz=-r*.3,t.hry=r*.3,t.hrx=.12,t.llz=.12+(r>0?o*.3:0),t.lrz=-.12-(r<0?o*.3:0),t.try=r*.3,d(.3,0);break}case`carlton`:case`worm`:case`moonwalk`:case`ymca`:case`griddy`:case`macarena`:e.dance(t,n,r,i);break;case`pedro`:{let n=c%8,r=Math.floor(n/2),a=X(c%1*ju),o=Math.floor(c)%2?1:-1;if(r===0)t.by=a*.05,o>0?t.llx=-1*a:t.lrx=-1*a,t.alz=e.armOut+.3+a*.5,t.arz=-e.armOut-.3-a*.5,t.alx=t.arx=.2,t.hrx=-.1+a*.1;else if(r===1)t.bx=X((n-2)/2*ju)*.12,t.alz=e.armOut+.3+o*.9,t.arz=-e.armOut-.3+o*.9,t.alx=t.arx=-.3,t.llz=.2,t.lrz=-.05,t.brz=-.1,t.hry=-.4;else if(r===2){let r=X((n-4)/2*ju);t.by=r*.14*l,t.alz=e.armOut+r*1.6,t.arz=-e.armOut-r*1.6,t.llz=r*.5,t.lrz=-r*.5,t.hrx=-.3*r}else{let n=X(i*18);t.brz=n*.08,t.bry=n*.15,t.alx=t.arx=-.6,t.alz=e.armOut+.4+n*.2,t.arz=-e.armOut-.4+n*.2,t.el=t.er=1.4,t.hrx=ku(X(i*9))*.2-.05,t.hrz=-n*.1}t.try=o*.6;break}case`fever`:{let n=Math.floor(c)%2==0,r=Du(c%1,0,.3);n?(t.arz=-2.5,t.arx=-.35,t.er=0,t.brz=.12*r,t.bx=-.04*r,t.hry=-.35,t.hrx=-.2):(e.reach(t,`r`,s-.04,e.front+e.pawR+.06,u(-a.x*.9),`paw`),t.brz=-.08*r,t.bx=.04*r,t.hry=.2,t.hrx=.15),p(`l`),t.llx=n?0:-.25,t.lrz=n?-.18:-.05,t.by=ku(X(c*ju))*.015,t.try=n?-.5:.5;break}case`chestbeat`:{let n=c%8;if(t.llz=.3,t.lrz=-.3,t.by=-.04,n<6){let r=X(i*(4+n)*ju),o=a.y-.04,s=e.front+e.pawR;e.reach(t,`r`,o,s+Au(0,r)*.12,u(-.05),`paw`);let c=[t.arx,t.arz,t.sr,t.er];e.reach(t,`l`,o,s+Au(0,-r)*.12,u(-.05),`paw`),[t.arx,t.arz,t.sr,t.er]=c,t.brx=-.12,t.hrx=-.15,t.bry=r*.08,t.by+=ku(r)*.015}else{let e=Du(n-6,0,.3);m(.62+e*.1),t.brx=-.18*e,t.hrx=-.4*e+X(i*30)*.03,t.by+=e*.02}t.try=X(i*6)*.4,d(-.3,0);break}case`rocky`:{let n=i%6;if(n<3){t.by=ku(X(i*ju*4))*.035;let n=Math.floor(i*3)%2?`r`:`l`,r=Au(0,X(i*3*ju)),o=a.y+.02;e.reach(t,`both`,o,e.front+e.pawR+.05,u(-.02),`paw`);let s=n===`r`?[t.alx,t.alz,t.sl,t.el]:[t.arx,t.arz,t.sr,t.er];e.reach(t,n,o,e.front+e.pawR+.05+r*.3,u(-.04),`paw`),n===`r`?[t.alx,t.alz,t.sl,t.el]=s:[t.arx,t.arz,t.sr,t.er]=s,t.bry=(n===`r`?.25:-.25)*r,t.hrx=.12,t.llx=-.2,t.lrx=.15}else{let e=ku(X((n-3)*ju*2));m(.86),t.alz+=X(i*12)*.1,t.arz+=X(i*12)*.1,t.by=e*.1*l,t.hrx=-.35,t.bry=X((n-3)*1.5)*.5}t.try=X(i*8)*.5;break}case`landing`:{let n=i%4,r=n<.5?1-Du(n,0,.5):0,o=n<.5?Du(n,.35,.5):1-Du(n,3.3,3.9);t.by=r*.5-o*s*.45,e.hasLegs&&(t.llx=-1.3*o,t.lrx=1.1*o,t.llz=.12,t.lrz=-.1),t.brx=.35*o,e.reach(t,`r`,.03+(1-o)*(a.y-.1),e.front+e.pawR+.1,u(-.02),`paw`),t.alx=.7*o-.3*r,t.alz=e.armOut+.5+r*.8,t.el=.3,t.hrx=-.45*o,t.hry=.1*o,t.trx=.4*o,t.bx=n>.5&&n<.75?X(n*90)*.01:0,d(-.4*r+.1*o,0);break}case`bolt`:if(i%4<1){let e=Math.floor(i*8)%2==0,n=ku(X(i*8*ju));t.by=.02+n*.05,t.llx=e?-1*n:.3*n,t.lrx=e?.3*n:-1*n,t.alx=e?-.9:.5,t.arx=e?.5:-.9,t.el=t.er=1.4,t.brx=.15}else t.alz=2.35+X(i*2)*.02,t.alx=-.35,t.el=0,e.reach(t,`r`,a.y+.08,e.front+e.pawR+.08,u(-a.x*1.2),`paw`),t.brz=-.14,t.brx=-.1,t.bx=.02,t.bry=.25,t.hry=.45,t.hrx=-.25,t.lrz=-.25,t.llx=-.15;d(-.2,0);break;case`woo`:{let n=c%8;if(n<5){let n=Math.floor(c)%2==0,r=X(c%1*ju);t.llx=n?-.8*r:0,t.lrx=n?0:-.8*r,t.by=r*.03,t.brx=-.15,t.bry=(n?.15:-.15)*r,t.alx=t.arx=.35,t.alz=e.armOut+.45+r*.2,t.arz=-e.armOut-.45-r*.2,t.el=t.er=1.2,t.hrx=-.2,t.hry=(n?-.2:.2)*r}else if(n<6){let r=Du(n-5,.3,.6);e.raise(t,`r`,o+.1-r*.35,.02),t.arx-=r*.6,p(`l`),t.hrx=-.1}else{let r=Du(n-6,0,.3);t.alz=e.armOut+r*1.3,t.arz=-e.armOut-r*1.3,t.alx=t.arx=.2,t.brx=-.2*r,t.hrx=-.55*r+X(i*40)*.02,t.by=.02*r}t.try=X(i*9)*.5;break}case`hotline`:{let n=c%8;if(n<4){let n=X(c*ju*.5);t.bx=n*.05,t.brz=-n*.07,t.bry=n*.2,t.alx=t.arx=-.7,t.alz=e.armOut+.25+n*.25,t.arz=-e.armOut-.25+n*.25,t.el=t.er=1.5,t.hrz=n*.12,t.by=ku(n)*.015,t.llx=Au(0,n)*-.2,t.lrx=Au(0,-n)*-.2}else if(n<6){let r=Du((n-4)/2,.15,.6);t.bry=-.6+r*1.1,t.arz=-e.armOut-.6,t.arx=.6-r*1.8,t.er=.3,t.alx=-.6,t.el=1.2,t.hry=-.3+r*.5,t.lrx=-.2}else{let n=ku(X(c*ju));e.reach(t,`both`,a.y-.06,e.front+e.pawR+.08,u(-.03),`paw`),t.by=n*.03,t.llx=t.lrx=-n*.15,t.hrx=.1-n*.1,t.hry=X(i*3)*.25}t.try=X(i*4)*.4;break}case`lean`:{let n=i%6,r=Du(n,1.6,3)*(1-Du(n,4.4,5.6));if(n<1.4){let r=X(Du(n,.1,1.3)*ju);e.raise(t,`r`,o+.02,-.04+r*.02),t.hrx=.2*r}else t.arx=t.alx=0,t.arz=-e.armOut*.5,t.alz=e.armOut*.5;e.hasLegs&&!e.floats?(t.brx=.72*r,t.hrx-=.35*r):t.brx=.4*r,t.trx=-.4*r,d(-.2*r,0);break}case`moonpose`:{let n=i%4,r=Du(n,0,1.1);if(n<1.15)t.bry=r*Mu,t.alz=e.armOut+1.1,t.arz=-e.armOut-1.1,t.by=X(r*ju)*.06*l,t.lrx=-.5*X(r*ju);else{let n=e.eyePos.y;e.reach(t,`r`,n,e.faceFront(n)+e.pawR+.04,u(-ku(e.eyePos.x)),`paw`),t.alz=e.armOut+1.05,t.alx=-.45,t.el=0,t.brz=.1,t.bx=-.03,t.hrz=-.2,t.hry=.1,t.lrx=-.3,t.lrz=.12,t.by=X(i*3)*.006}d(-.15,0);break}case`ninjarun`:{let n=Math.floor(i*10)%2==0,r=ku(X(i*10*ju));t.brx=.45,t.bz=-.05,t.by=.01+r*.04,t.llx=(n?-1.1*r:.5*r)-.45,t.lrx=(n?.5*r:-1.1*r)-.45,t.alx=t.arx=1.25,t.alz=e.armOut+.15,t.arz=-e.armOut-.15,t.el=t.er=0,t.hrx=-.5,t.trx=-.3,t.try=X(i*20)*.3,d(.6,0);break}case`jojo`:{let n=Math.floor(i/1.5)%4,r=X(i*37)*.006;if(n===0){let n=e.headC.y+e.headR.y*.4;e.reach(t,`r`,n,e.faceFront(n)+e.pawR+.03,u(-e.headR.x*.4),`paw`),t.alx=-.5,t.alz=e.armOut+.6,t.el=.2,t.bry=.5,t.brz=-.16,t.bx=.05,t.hrz=.3,t.hry=-.35,t.llx=-.25,t.lrz=-.12}else n===1?(t.arx=-1.55,t.arz=-.08,t.er=0,p(`l`),t.brx=-.15,t.bry=-.35,t.hrx=-.12,t.hry=.3,t.llz=.2,t.lrz=-.2):n===2?(e.reach(t,`both`,e.eyePos.y-.02,e.faceFront(e.eyePos.y)+e.pawR+.08,u(a.x*.3),`paw`),t.brx=-.32,t.bz=.06,t.brz=.08,t.hrx=.1,t.hry=-.4,t.llx=-.35,t.lrx=.2):(e.raise(t,`both`,e.headC.y+.04,-.02),t.lrx=-1.1,t.lrz=.15,t.brz=.18,t.bx=-.04,t.bry=.3,t.hrz=-.25,t.by=.02);t.bx+=r,t.hrx+=r*4,d(-.2,0);break}case`powerup`:{let n=i%3,r=Du(n,0,2.2),a=Du(n,2.2,2.4)*(1-Du(n,2.8,3)),o=X(i*47)*(.004+r*.016);t.by=-.06+a*.08,t.llz=.32,t.lrz=-.32,t.llx=t.lrx=-.2,t.brx=.18-a*.35,t.alx=t.arx=.35-a*.3,t.alz=e.armOut+.35+a*1,t.arz=-e.armOut-.35-a*1,t.el=t.er=1.1*(1-a),t.bx=o,t.hrx=-.15-r*.2-a*.35,t.trx=-.3*r,d(-.5*r,o*4);break}case`pointing`:{let e=c%8,n=ku(X(c*ju*2))*.12;t.arz=-1.45-n*.5,t.arx=-.55,t.er=0,p(`l`),t.hry=-.55,t.hrx=-.08,t.bry=-.12,t.brx=-.05,t.by=n*.08,t.lrz=-.1,t.llz=.06,e>=4&&Pu(t),d(-.3,0);break}case`micdrop`:{let n=i%5;if(n<2){let n=e.mouth;e.reach(t,`r`,n.y,e.faceFront(n.y)+e.pawR+.07,u(-.03),`paw`);let r=X(i*9);t.alz=e.armOut+.4+r*.25,t.alx=-.8,t.el=1.2,t.hrx=ku(r)*.06-.04,t.hry=X(i*2)*.2,t.by=ku(X(i*4))*.01}else if(n<2.9){let r=Du(n,2,2.4);t.arz=-e.armOut-r*1.25,t.arx=-.4,t.er=0,t.alz=e.armOut,t.hry=-.4*r,t.hrx=-.1}else{let r=Du(n,2.9,3.3);e.reach(t,`both`,a.y-.06,e.front+e.pawR+.02,u(-a.x*.6),`paw`),t.hrx=-.25*r,t.hry=.2*r,t.brx=-.08*r}break}case`backflip`:{let n=i%3,r=o*.5;if(n<.6){let e=Du(n,.1,.55);t.by=-.06*e,t.brx=.25*e,t.llx=t.lrx=-.4*e,t.alx=t.arx=.8*e}else if(n<1.35){let i=(n-.6)/.75,a=-Mu*Du(i,0,1),s=4*i*(1-i)*o*.6;t.brx=a,t.by=r-r*Ou(a)+s,t.bz=-r*X(a);let c=X(i*ju);t.llx=t.lrx=-1.3*c,t.alx=t.arx=-1.2*c-.6*(1-c),t.alz=e.armOut+.2,t.arz=-e.armOut-.2,t.hrx=.3*c}else if(n<1.7){let r=X((n-1.35)/.35*ju);t.by=-.07*r,t.brx=.2*r,t.llx=t.lrx=-.4*r,t.alz=e.armOut+.8,t.arz=-e.armOut-.8}else{let e=Du(n,1.7,1.9);m(.5+e*.3),t.by=ku(X((n-1.7)*ju*2))*.02,t.hrx=-.25*e}break}case`bow`:{let n=i%4,r=Du(n,.9,1.5)*(1-Du(n,2.6,3.2));if(n<1.1){let r=Du(n,0,1.1),i=r*Mu*1.5;e.raise(t,`r`,o-r*.15,.06+X(i)*.05),t.arx+=Ou(i)*.3*(1-r)}else n<3.2?e.reach(t,`r`,a.y-.12,e.front+e.pawR+.03,u(0),`paw`):e.raise(t,`r`,e.headC.y+.02,.02+X(i*9)*.05);t.alx=.25+r*.5,t.alz=e.armOut+.35+r*.3,t.el=.2,e.hasLegs&&!e.floats?f(r*.75):t.brx=r*.5,t.hrx+=r*.2,t.lrx+=.25*r,d(.2*r,0);break}case`pirouette`:{let n=i%4;if(n<.5){let r=Du(n,0,.4);t.by=-.04*r,t.llx=t.lrx=-.25*r,t.llz=.15*r,t.lrz=-.15*r,t.alz=e.armOut+.9,t.arz=-e.armOut-.9,t.alx=t.arx=-.4,t.el=t.er=.4}else if(n<2.6)t.bry=Du(n,.5,2.6)*Mu*3,t.by=.04,t.lrx=-.9,t.lrz=.35,e.raise(t,`both`,o+.1,-.02),t.hrx=-.1;else{let r=Du(n,2.6,2.9);t.alz=e.armOut+1*r+.3,t.arz=-e.armOut-1*r-.3,t.alx=t.arx=-.25,t.lrx=-.3*r,t.lrz=.05,t.hrx=-.2*r,t.brx=-.06*r}d(-.15,0);break}}}var Iu={micdrop:{kind:`mic`,drop:2.9,loop:5}},Lu={powerup:!0},Ru=`bx.by.bz.brx.bry.brz.hrx.hry.hrz.alx.alz.arx.arz.aly.ary.wl.wr.llx.llz.lrx.lrz.trx.try.tilt.sl.sr.el.er.carry`.split(`.`),zu={x:.31,y:-2.575,z:-.455,el:2.4,w:.3},Bu=()=>({bx:0,by:0,bz:0,brx:0,bry:0,brz:0,hrx:0,hry:0,hrz:0,alx:-.14,alz:.16,arx:-.14,arz:-.16,aly:0,ary:0,wl:1,wr:1,llx:0,llz:0,lrx:0,lrz:0,trx:0,try:0,tilt:0,sl:1,sr:1,el:0,er:0,carry:0}),Vu=()=>[0,0,0,0,0,0,1];function Z(e,t){let n=e.get(t);return n||e.set(t,n=Vu()),n}var Hu={dy:-.06,dz:.07,out:.05,sip:[.14,0,.6]},Uu={ale:Hu,cider:Hu,milk:Hu,cocoa:Hu,wine:{dy:-.04,dz:.07,out:.05,sip:[.185,.03,.5]},bun:{dy:-.02,dz:.07,out:.04,sip:[.05,-.06,0]},loaf:{dy:-.08,dz:.07,out:0,both:!0,sip:[.04,-.1,0]},pie:{dy:-.08,dz:.07,out:0,both:!0,sip:[.06,-.1,0]},fish:{dy:.02,dz:.08,out:.16},flower:{dy:0,dz:.07,out:.12},rod:{dy:-.14,dz:.02,out:.1},can:{dy:-.18,dz:.05,out:0,both:!0,hang:.1},washing:{dy:-.2,dz:.1,out:.02,both:!0,hang:.12},water:{dy:-.06,dz:.02,out:.12,sip:[-.1,-.07,.4],hang:.32},firewood:{dy:-.08,dz:.03,out:0,both:!0,hang:.1},grimoire:{dy:-.12,dz:.12,out:0,both:!0}},Wu={earSwivel:2.4,earTwitch:1.1,tailSwish:2.4,headTilt:2.2,sniff:2.1,rubPaws:2.6,noseWiggle:1.5,hop:1.2,stalks:3.4,stretch:3.2,headSwivel:2.8,slowBlink:1.8,lickPaw:3,tailCurl:2.6,wag:2,pant:2.6,sway:3.2,scratch:2.2,flap:1.6,throat:2,chill:4.5,wingStretch:2.8,flutter:2.2,lookAround:3,sentinel:4.2},Gu=e=>Math.min(1,Math.max(0,e)),Ku=e=>{let t=Gu(Math.min(e/.2,(1-e)/.2));return t*t*(3-2*t)},qu=new Je({color:`#3a4a7a`,transparent:!0,opacity:.85}),Ju={buzz:{shut:[.95,-.5],open:[0,0],rate:70,beat:.5,ease:6},flutter:{shut:[0,0],open:[-.4,-.45],rate:21,beat:.5,ease:9}},Yu=[`foreL`,`foreR`,`wingL`,`wingR`,`turretL`,`turretR`],Xu=[`body`,`neck`,`eyes`,`armL`,`armR`,`legL`,`legR`,`tail`];function Zu(e){let t=e.joints,n=[[`body`,null,[0,0,0]],[`neck`,`body`,t.neck],[`eyes`,`neck`,[0,e.eyeY,0]],[`armL`,`body`,t.shoulder],[`armR`,`body`,[-t.shoulder[0],t.shoulder[1],t.shoulder[2]]],[`legL`,`body`,t.hip],[`legR`,`body`,[-t.hip[0],t.hip[1],t.hip[2]]],[`tail`,`body`,t.tail],...e.bones.map(e=>[e.name,e.parent,e.pos])],r={names:[],parent:new Map,local:new Map,rest:new Map};for(let[e,t,i]of n)r.names.push(e),r.parent.set(e,t),r.local.set(e,new x(...i)),r.rest.set(e,new x(...i).add(t?r.rest.get(t):new x));return r}function Qu(e,t){let n=new Map(t.names.map((e,t)=>[e,t])),r=[],i=[],a=[],o=[],s=[],c=e=>e.glass?2:+!!e.eyes;for(let l of[0,1,2]){let u=r.length/3;for(let s of e.parts.values()){if(c(s)!==l||s.fold.empty)continue;let u=t.rest.get(s.space)??new x,d=e.bind?.[s.space]?new O().setFromEuler(new L(...e.bind[s.space])):null,f=new x,p=n.get(s.bone)??0,m=s.chain?.map(e=>n.get(e)??p),h=s.fold,g=h.bones?.map(e=>n.get(e)??p);for(let e=0;e<h.pos.length/3;e++){f.fromArray(h.pos,e*3),d&&f.applyQuaternion(d),r.push(f.x+u.x,f.y+u.y,f.z+u.z),i.push(h.col[e*3],h.col[e*3+1],h.col[e*3+2]);let t=h.along[e];if(g)for(let t=0;t<4;t++)a.push(g[h.si[e*4+t]]),o.push(h.sw[e*4+t]);else if(m&&t>=0){let e=m.length,n=t*e,r=Math.min(e-1,Math.floor(n));r>=e-1?(a.push(m[e-1],0,0,0),o.push(1,0,0,0)):(a.push(m[r],m[r+1],0,0),o.push(1-(n-r),n-r,0,0))}else a.push(p,0,0,0),o.push(1,0,0,0)}}s.push([u,r.length/3-u])}let l=new $e;return l.setAttribute(`position`,new h(r,3)),l.setAttribute(`color`,new h(i,3)),l.setAttribute(`skinIndex`,new y(a,4)),l.setAttribute(`skinWeight`,new h(o,4)),l.addGroup(s[0][0],s[0][1],0),l.addGroup(s[1][0],s[1][1],1),s[2][1]&&l.addGroup(s[2][0],s[2][1],2),l.computeVertexNormals(),vt&&$u(l),l.computeBoundingSphere(),l}function $u(e){let t=e.getAttribute(`position`),n=e.getAttribute(`normal`),r=new x,i=new x,a=new x,o=[];for(let e=0;e<t.count/3;e++)r.fromBufferAttribute(t,e*3),i.fromBufferAttribute(t,e*3+1),a.fromBufferAttribute(t,e*3+2),o.push(a.sub(i).cross(r.sub(i)).clone());let s=new Map;for(let e=0;e<t.count;e++){let n=`${Math.round(t.getX(e)*1e5)},${Math.round(t.getY(e)*1e5)},${Math.round(t.getZ(e)*1e5)}`,r=s.get(n);r?r.push(e):s.set(n,[e])}let c=Math.cos(Ge.degToRad(60)),l=new x,u=new x;for(let e of s.values())for(let t of e){l.copy(o[Math.floor(t/3)]).normalize(),u.set(0,0,0);for(let t of e){let e=o[Math.floor(t/3)];e.dot(l)>=c*e.length()&&u.add(e)}u.lengthSq()>1e-20&&n.setXYZ(t,...u.normalize().toArray())}n.needsUpdate=!0}var ed=new Map,td=e=>Math.atan2(Math.sin(e),Math.cos(e)),nd=new x(1,0,0);function rd(e,t,n,r=1.3){let i=n.clone().sub(e),a=t.length(),o=Ge.clamp(i.length()/a,.7,r),s=i.normalize().multiplyScalar(a),c=Math.asin(Ge.clamp(s.x/-t.y,-1,1)),l=t.y*Math.cos(c);return{ax:td(Math.atan2(s.z,s.y)-Math.atan2(t.z,l)),az:c,s:o}}var id=-.012,ad=new x,od=new x,sd=new x,cd=new x,ld=new x(0,1,0),ud=new I,dd=new O,fd=new O,pd=new O,md=class{root=new c;lowPoints=null;headHeight=1;float=new c;bones=new Map;body;neck;armL;armR;legL;legR;tail;blinkers;extra;foreL;foreR;elbow;hand=new c;handTilt=new c;mesh;sk;material;eyeMaterial;ghostMaterial;wisp;item=null;itemKey=``;hold=null;ghost=!1;pose=Bu();auxNow=new Map;phase=0;animNow=`idle`;animStart=0;blinkAt=2+Math.random()*3;blinkT=-1;seed=Math.random()*100;footLift=0;bedLift=0;prof;clip=null;nextClip=1.5+Math.random()*3;shut=0;grow=0;floats;hover;flaps;tentacles;noLegs;sleepy;tendril;wings=null;flutter=0;turrets=[];shift;glassMaterial=null;owned=[];highGeo;detail=`high`;lowKit;lowKey;hatFit;hat=null;hatFx=null;emoteFx=null;handL=null;hatFxOn=!0;baseHeadHeight=1;shoulder;grip;paw;pawR;seat;sitLeg;sipLow;lift;armFwd;armOut;front;mouth;eyePos;neckPos;headC;headR;hasLegs;shape;v=new x;v2=new x;v3=new x;m4=new I;m5=new I;m6=new I;constructor(e){let t=e.kit,n=t.joints;this.prof=e.profile,this.floats=e.floats,this.hover=e.hover??.35,this.flaps=!!e.flaps,this.tentacles=e.tentacles,this.noLegs=!!e.noLegs,this.sleepy=!!e.sleepy,this.tendril=!!e.tendril,this.shift=e.shift??null,this.material=e.material,this.eyeMaterial=e.eyeMaterial??e.material,this.hatFit=e.hatFit,this.lowKit=e.lowKit,this.lowKey=e.lowKey,this.owned.push(e.material),e.eyeMaterial&&this.owned.push(e.eyeMaterial),this.shoulder=new x(-n.shoulder[0],n.shoulder[1],n.shoulder[2]),this.grip=new x(...n.hand),this.paw=new x(...n.paw??[n.hand[0],n.hand[1],n.hand[2]*.2]),this.pawR=Math.max(.03,(n.hand[2]-this.paw.z)*.9),this.seat=t.seat;let r=t.sculpt?.named(`legLFoot`),i=r?t.joints.hip[1]-r.c.y:0;this.sipLow=!!t.sipLow,this.lift=t.lift??0,this.sitLeg=r?-Math.acos(Ge.clamp((i-t.seat)/i,-1,1)):null;let a=t.bind?.armL;this.armFwd=a?-a[0]:.14,this.armOut=a?a[2]:.16,this.shape=t.shape;let o=t.shape;this.front=t.front??o.tc[2]+o.tr[2]*1.12,this.mouth=new x(...t.nose??[0,o.hc[1]-o.hr[1]*.4,o.hc[2]+o.hr[2]]).add(new x(...n.neck)),this.eyePos=new x(t.eyeX,t.eyeY,t.eyeZ).add(new x(...n.neck)),this.neckPos=new x(...n.neck),this.headC=new x(...o.hc).add(this.neckPos),this.headR=new x(o.hr[0]*1.15,o.hr[1],o.hr[2]),this.hasLegs=!t.legL.empty||!!t.sculpt?.shapes.some(e=>e.bone===`legL`),this.sk=Zu(t);for(let e of this.sk.names){let t=new Xe;t.name=e,t.position.copy(this.sk.local.get(e));let n=this.sk.parent.get(e);(n?this.bones.get(n):this.float).add(t),this.bones.set(e,t)}let s=e=>this.bones.get(e);this.body=s(`body`),this.neck=s(`neck`),this.armL=s(`armL`),this.armR=s(`armR`),this.legL=s(`legL`),this.legR=s(`legR`),this.tail=s(`tail`),this.blinkers=t.blink.map(s).filter(Boolean),this.foreL=this.bones.get(`foreL`)??null,this.foreR=this.bones.get(`foreR`)??null,this.elbow=this.foreR?t.elbow??0:0,this.extra=this.sk.names.filter(e=>!Xu.includes(e)&&!Yu.includes(e));let c=this.bones.get(`wingL`),l=this.bones.get(`wingR`);if(e.wings&&c&&l&&(this.wings={mode:e.wings,bones:[[c,1],[l,-1]],open:0,want:0,phase:0}),e.swivel)for(let[e,t]of[[`turretL`,1],[`turretR`,-1]]){let n=this.bones.get(e);n&&this.turrets.push({bone:n,side:t,yaw:0,pitch:0,toYaw:0,toPitch:0,next:0})}if(this.root.add(this.float),this.hand.matrixAutoUpdate=!1,(this.foreR??this.armR).add(this.hand),this.hand.add(this.handTilt),this.highGeo=Qu(t,this.sk),this.highGeo.groups.length>2){let e=ht();e.transparent=!0,e.opacity=.5,e.depthWrite=!1,this.glassMaterial=e,this.owned.push(e)}this.mesh=new ne(this.highGeo,this.skinMaterials()),this.mesh.castShadow=!0,this.mesh.receiveShadow=!1,this.float.add(this.mesh);for(let[e,n]of Object.entries(t.bind??{}))this.bones.get(e)?.rotation.set(...n);this.root.updateMatrixWorld(!0),this.mesh.bind(new f(this.sk.names.map(s)));{let e=this.highGeo.getAttribute(`position`),t=this.highGeo.getAttribute(`skinIndex`),n=new Set(this.chainOf(`tail`).map(e=>this.sk.names.indexOf(e))),r=0;for(let i=0;i<e.count;i++)n.has(t.getX(i))||(r=Math.min(r,e.getY(i)));this.footLift=Math.min(.05,-r)}this.mesh.boundingSphere=new Re(new x(0,.5,0),1.4),this.ghostMaterial=new ke({color:e.ghostColor,emissive:`#9fc4ff`,emissiveIntensity:.55,transparent:!0,opacity:.6,depthWrite:!0,roughness:1,flatShading:!0}),this.owned.push(this.ghostMaterial);let u=new vn;hn(u,an(7),{pts:[[0,.36,0],[0,.22,-.02],[.02,.08,-.07],[.05,-.02,-.15]],radii:[.17,.14,.08,.02],sides:7,jitter:.1,round:!1,color:`#ffffff`}),this.wisp=new N(u.geometry(),this.ghostMaterial),this.wisp.visible=!1,t.sculpt&&(this.wisp.scale.set(.8,1.6,.8),this.wisp.position.y=.36*(1-1.6)),this.body.add(this.wisp),e.extras?.(this.body,this.handTilt,this.armL),this.noLegs&&(this.wisp.visible=!t.sculpt,this.wisp.material=this.material),this.applyPose(1),this.root.updateMatrixWorld(!0),this.headHeight=this.measureHead()+(this.floats&&!this.flaps?this.hover:0),this.baseHeadHeight=this.headHeight,this.bedLift=this.measureBed()}measureBed(){let e={...this.pose},t=new Map([...this.auxNow].map(([e,t])=>[e,[...t]])),n=this.prof.bed===`upright`?[]:this.freeChains(),r=new Set(n.flatMap(e=>this.chainOf(e).map(e=>this.sk.names.indexOf(e)))),i=this.highGeo.getAttribute(`skinIndex`),a=this.highGeo.getAttribute(`skinWeight`),o=new x,s=1/0;for(let e of[0,1.4,2.8,4.2,5.6]){this.applyPose(1,this.target({anim:`sleep`,speed:0,dt:0,t:e-this.seed})),this.root.updateMatrixWorld(!0);let t=n.flatMap(e=>this.bones.get(e)?.getWorldPosition(new x)??[]);for(let e=0;e<i.count;e++){let n=0;for(let t=0;t<4;t++)r.has(i.getComponent(e,t))&&(n+=a.getComponent(e,t));this.mesh.getVertexPosition(e,o),!(n>.85&&t.every(e=>e.distanceTo(o)>.18))&&(s=Math.min(s,o.y))}}return Object.assign(this.pose,e),this.auxNow=t,this.clip=null,this.applyPose(1),this.root.updateMatrixWorld(!0),s===1/0?0:.032-this.footLift-s}measureHead(){let e=this.mesh.geometry.getAttribute(`position`),t=this.mesh.geometry.getAttribute(`skinIndex`),n=new Set;this.sk.names.forEach((e,t)=>{for(let r=e;r;r=this.sk.parent.get(r))if(r===`neck`){n.add(t);break}});let r=0;for(let i=0;i<e.count;i++)n.has(t.getX(i))&&(r=Math.max(r,e.getY(i)));return r}inspect(){return{mesh:this.mesh,bones:this.bones,shape:this.shape,item:this.item,body:this.body,neck:this.neck,profile:this.prof,hold:this.hold}}setHat(e){if(!this.hatFit||(this.hat?.id??null)===e)return;if(this.hat){this.hat.holder.removeFromParent(),this.hat.built.group.traverse(e=>e.isMesh&&e.geometry.dispose());for(let e of this.hat.built.materials)e.dispose();this.hat=null}if(this.hatFx?.dispose(),this.hatFx=null,this.headHeight=this.baseHeadHeight,!e)return;let t=qs(e);if(!t)return;let n=`${this.hatFit.id}:${e}`,r=_d.get(n);if(!r){let i=this.hatFit,a=this.prof.head+(this.sleepy?.2:0);r=ac(e,t,{...i.head,droop:a,bits:this.hatBits()},{...i.nudge,...i.nudge.hats?.[e]}),_d.set(n,r)}let i=new c;i.position.set(...r.pos),i.rotation.set(...r.rot),i.scale.set(...r.scale),i.add(t.group),this.neck.add(i),this.hat={id:e,built:t,holder:i,fold:r.fold},this.applyHatGhost();let a=this.floats&&!this.flaps?this.hover:0;this.hatFx=Ec(e,this.baseHeadHeight-a,this.girth()),this.hatFx&&(this.hatFx.group.visible=this.hatFx.ground.visible=!1,this.float.add(this.hatFx.group),this.root.add(this.hatFx.ground));let o=this.sk.rest.get(`neck`).y+r.pos[1]+t.top*r.scale[1]+(this.floats?this.hover:0);this.headHeight=Math.max(this.baseHeadHeight,o)}girth(){let e=this.highGeo;e.boundingBox||e.computeBoundingBox();let t=e.boundingBox;return Ge.clamp(Math.max(-t.min.x,t.max.x)+.1,.36,.8)}showHatFx(e){this.hatFxOn=e}hatBits(){let e=this.hatFit,t=this.highGeo.getAttribute(`position`),n=this.highGeo.getAttribute(`skinIndex`),[r,i,a]=e.neckAt,{c:o,r:s}=e.head,c=Math.min(e.head.eye.at[1]-e.head.eye.r,o[1]),l=e.nudge.bumps,u=new Map;for(let e=0;e<t.count;e++){let d=this.sk.names[n.getX(e)];if(!bd(d))continue;let f=new x(t.getX(e)-r,t.getY(e)-i,t.getZ(e)-a),p=d;if(d===`neck`){if(f.y<c)continue;let e=((f.x-o[0])/s[0])**2+((f.y-o[1])/s[1])**2+((f.z-o[2])/s[2])**2>1.25;if(e&&l===`none`)continue;p=e&&l!==`head`?`neck`:`skull`}(u.get(p)??u.set(p,[]).get(p)).push(f)}let d=[];for(let[e,t]of u){let n=e===`skull`?160:30,r=Math.max(1,Math.floor(t.length/n)),i=t.filter((e,t)=>t%r===0);if(e===`neck`)for(let n of yd(t,.03))d.push({bone:e,is:`solid`,pts:n.filter((e,t)=>t%Math.max(1,Math.floor(n.length/30))===0)});else d.push({bone:e,is:e===`skull`?`head`:bd(e),pts:i})}return d}applyHatGhost(){let e=this.hat?.built.solid??[];for(let{mesh:t,material:n}of e)t.material=this.ghost?this.ghostMaterial:n,t.castShadow=!this.ghost}setDetail(e){if(e!==this.detail){if(e===`low`){let e=this.prepareLow();if(!e)return;this.mesh.geometry=e}else this.mesh.geometry=this.highGeo;this.detail=e}}prepareLow(){if(!this.lowKit||!this.lowKey)return null;let e=ed.get(this.lowKey);return e||(e=Qu(pn(this.lowKit),this.sk),ed.set(this.lowKey,e)),e}setItem(e){let t=e?`${e.k}:${e.c??``}`:``;t!==this.itemKey&&(this.itemKey=t,this.item&&=(this.handTilt.remove(this.item),pl(this.item),null),this.hold=e?Uu[e.k]??Hu:null,e&&(this.item=fl(e),this.item.traverse(e=>e.castShadow=!this.ghost),this.handTilt.add(this.item)))}holdProp(e){for(let e of[...this.handTilt.children])e!==this.item&&this.handTilt.remove(e);e&&this.handTilt.add(e)}skinMaterials(){let e=this.glassMaterial?[this.ghost?this.ghostMaterial:this.glassMaterial]:[];return this.ghost?[this.ghostMaterial,qu,...e]:[this.material,this.eyeMaterial,...e]}setGhost(e){e!==this.ghost&&(this.ghost=e,this.mesh.material=this.skinMaterials(),this.mesh.castShadow=!e,!this.noLegs&&this.hasLegs&&(this.wisp.visible=e),this.wisp.material=e||!this.noLegs?this.ghostMaterial:this.material,this.item?.traverse(t=>t.castShadow=!e),this.applyHatGhost())}reach(e,t,n,r,i,a=`grip`){let o=this.shoulder,s=a===`paw`?this.paw:this.grip,c=new x(o.x-i,Math.max(.1,n),r),l=this.elbow?this.bendFor(s,c.distanceTo(o)):0,{ax:u,az:d,s:f}=rd(o,this.elbow?this.bent(s,l):s,c,this.tendril?2:this.elbow?1.15:1.3);t!==`l`&&(e.arx=u,e.arz=d,e.sr=f,e.er=l),t!==`r`&&(e.alx=u,e.alz=-d,e.sl=f,e.el=l)}bent(e,t){let n=new x(0,this.elbow,0);return e.clone().add(n).applyAxisAngle(nd,-t).sub(n)}bendFor(e,t){let n=0,r=2.6;if(this.bent(e,0).length()<=t)return 0;for(let i=0;i<14;i++){let i=(n+r)/2;this.bent(e,i).length()>t?n=i:r=i}return(n+r)/2}holdSpot(e){let t=this.shoulder.y-this.grip.length()*.8,n=Math.min(Math.max(t,this.shoulder.y+e.dy),this.sipLow?this.shoulder.y-.1:1/0);return{y:this.tendril?Math.max(n+.1,(e.hang??.08)+.18,.54):n+this.lift,z:Math.max(this.front+e.dz,this.front+this.pawR+(this.grip.z-this.paw.z)*.8)+(this.tendril?-.02:0)}}carryPose(e,t,n=!1){let r=this.hold;if(!r)return;let i=this.holdSpot(r),a=r.both&&!n;this.reach(e,a?`both`:`r`,i.y,i.z,a?r.out:Math.max(r.out,.04)),e.arx+=t,e.carry=0,a&&(e.alx+=t,e.carry=1)}headNow(e,t){return e.clone().sub(this.neckPos).applyAxisAngle(new x(1,0,0),t).add(this.neckPos)}reachLength(){return this.grip.length()}faceFront(e){let t=(e-this.headC.y)/this.headR.y;return this.headC.z+this.headR.z*Math.sqrt(Math.max(0,1-t*t))}besideHead(e=0){return this.headR.x+this.pawR+.03+e-Math.abs(this.shoulder.x)}raise(e,t,n,r=0){let i=this.besideHead(r)+(this.flaps?.22:0),a=this.shoulder,o=this.headC.z,s=this.paw.length()*1.25,c=s*s-i*i-(o-a.z)**2,l=a.y+Math.sqrt(Math.max(0,c));this.reach(e,t,Math.min(n,l),o,i,`paw`)}freePaw(e){if(!this.prof.paws)return;let t=this.rest();this.reach(t,`l`,this.shoulder.y-this.prof.paws,this.front+this.pawR+.01,-.035,`paw`),e.alx=t.alx,e.alz=t.alz,e.sl=t.sl,e.el=t.el}folded(e){return e.anim===`idle`||e.anim===`sit`||e.anim===`sleep`||e.anim===`drink`||e.anim===`fish`||e.anim===`laugh`||e.anim===`cry`}rest(){let e=Bu();return e.alx=e.arx=-this.armFwd,e.alz=this.armOut,e.arz=-this.armOut,e}gait(e,t,n){let r=n.anim===`run`,i=this.phase,a=Math.sin,o=this.prof,s=Ge.clamp(Math.max(n.speed,r?3:1.5)/3.6,.35,.95)*o.stride;switch(o.gait){case`hop`:{let n=Math.max(0,a(i)),s=Math.max(0,-a(i));e.by=n*(r?.13:.085),e.brx=.05+n*.14,e.llx=e.lrx=n*.6-s*.25,this.reach(e,`both`,this.shoulder.y-(o.paws||.1)+n*.02,this.front+this.pawR+.01,-.03,`paw`),e.alx-=n*.15,e.arx-=n*.15,e.hrx=-n*.12,Z(t,`earL`)[0]=Z(t,`earR`)[0]=-.2-n*.45;break}case`slither`:{let n=a(i);Z(t,`rear`)[5]=.08*n,e.hrx=-.14*Math.max(0,-n)+.05,e.hrz=a(i*.5)*.06,e.brx=0,e.by=Math.max(0,n)*.012,Z(t,`stalkL`)[0]=Z(t,`stalkR`)[0]=.18+.08*n,Z(t,`stalkL`)[2]=.06+a(i*.5)*.08,Z(t,`stalkR`)[2]=-.06+a(i*.5+1)*.08;break}case`waddle`:{e.llx=a(i)*s*.9,e.lrx=-a(i)*s*.9,e.brz=a(i)*.17,e.bry=a(i)*.06,e.by=Math.abs(a(i))*.03,e.brx=r?.12:.03,e.hrz=-e.brz*.7,e.hrx=-e.brx*.6;let t=.35+Math.abs(a(i))*.12;e.alz=this.armOut+t,e.arz=-this.armOut-t,e.alx=e.arx=-this.armFwd-.05,e.try=-a(i)*.45;break}case`float`:e.by=a(i*.5)*.03,e.brx=r?.25:.14,e.brz=a(i*.5)*.05,e.hrx=-e.brx*.4,e.alx=e.arx=-this.armFwd+.35+a(i-.8)*.15,e.alz=this.armOut+.1,e.arz=-this.armOut-.1,e.llx=e.lrx=.4+a(i-1.2)*.15;break;case`flap`:e.by=Math.abs(a(i))*.04,e.brx=r?.3:.18,e.hrx=-e.brx*.7,e.llx=e.lrx=.5,e.brz=a(i*.5)*.06;break;case`scuttle`:e.by=Math.abs(a(i*2))*.035,e.brz=a(i)*.1,e.bry=a(i)*.08,e.brx=r?.12:.04,e.hrz=-e.brz*.5,e.llx=a(i)*.3,e.lrx=-a(i)*.3,e.alx=-this.armFwd-.2-a(i)*.35,e.arx=-this.armFwd-.2+a(i)*.35,e.el=Math.max(0,a(i))*.6,e.er=Math.max(0,-a(i))*.6;break;case`amble`:{e.llx=a(i)*s*1.5,e.lrx=-a(i)*s*1.5;let n=r?Math.max(.58,this.armFwd+.25):Math.max(.34,this.armFwd+.08);e.alx=-n-a(i)*s*(r?.5:.55),e.arx=-n+a(i)*s*(r?.5:.55),e.el=Math.max(0,a(i))*.7,e.er=Math.max(0,-a(i))*.7,e.alz=.1,e.arz=-.1,e.brz=a(i)*.13,e.bry=a(i)*.09,e.by=Math.abs(a(i))*.04,e.brx=r?.18:.06,e.hrx=-e.brx*.6+a(i*2)*.05,e.hrz=-a(i)*.1,e.try=a(i-.6)*.4,e.trx=r?.2:.05,Z(t,`tail1`)[1]=a(i-1.2)*.3,Z(t,`tail2`)[1]=a(i-1.8)*.35;break}default:{e.llx=a(i)*s*1.4,e.lrx=-a(i)*s*1.4;let n=Math.max(.3,this.armFwd);e.alx=-n-a(i)*s*.55,e.arx=-n+a(i)*s*.55,e.el=Math.max(0,a(i))*.8,e.er=Math.max(0,-a(i))*.8,e.alz=.12,e.arz=-.12,e.by=Math.abs(a(i))*(r?.06:.045),e.brz=a(i)*.07,e.bry=a(i)*.05,e.brx=r?.14:.05,e.hrx=-e.brx*.6+Math.abs(a(i))*.04,e.try=a(i-.6)*.4,e.trx=r?.25:.08,Z(t,`tail1`)[1]=a(i-1.2)*.3,Z(t,`tail2`)[1]=a(i-1.8)*.35}}if(o.earsBack&&o.gait!==`hop`&&(Z(t,`earL`)[0]=Z(t,`earR`)[0]=-o.earsBack*(r?1:.5)),this.hold){let t=[e.alx,e.alz,e.sl,e.el];this.carryPose(e,o.gait===`hop`?0:a(i)*.06),this.hold.both||([e.alx,e.alz,e.sl,e.el]=t)}}sit(e,t,n){let r=this.shoulder,i=this.prof.sit;if(i===`settle`||!this.hasLegs)e.by=-.01,e.hrx=.12,Z(t,`rear`)[5]=.025,Z(t,`stalkL`)[0]=Z(t,`stalkR`)[0]=.3,Z(t,`stalkL`)[2]=.12,Z(t,`stalkR`)[2]=-.12,this.hold&&this.carryPose(e,0);else if(e.by=-this.seat+.004,i===`feet`?(e.brx=-.14,e.llx=e.lrx=this.sitLeg??-1.5,e.llz=.22,e.lrz=-.22,this.reach(e,`both`,r.y-Math.min(.2,this.grip.length()*.7),this.front+this.pawR+.005,-.05,`paw`),e.hrx=.1,e.trx=.4):(e.llx=e.lrx=this.sitLeg??-1.3,e.llz=.16,e.lrz=-.16,this.reach(e,`both`,this.seat+this.pawR*.8,this.front+this.pawR+.03,-.02,`paw`),i===`wrap`?(e.trx=.8,e.try=-.34,Z(t,`tail1`)[0]=-.8,Z(t,`tail1`)[1]=-1.6,Z(t,`tail2`)[0]=-.66,Z(t,`tail2`)[1]=-.85,e.hrz=.16,e.hry=.12+Math.sin(n*.3)*.08):(e.trx=.67,e.try=-.08,Z(t,`tail1`)[0]=-.79,Z(t,`tail1`)[1]=-1.08,Z(t,`tail2`)[0]=.29,Z(t,`tail2`)[1]=-1.21,e.hry=Math.sin(n*.35)*.2)),this.hold){let t=[e.alx,e.alz,e.sl,e.el];this.carryPose(e,0),this.hold.both||([e.alx,e.alz,e.sl,e.el]=t)}}dance(e,t,n,r){let i=Math.sin,a=Math.cos,o=this.shoulder,s=this.sk.rest.get(`legL`).y,c=r*2,l=(e,n)=>{Z(t,`earL`)[0]=Z(t,`earR`)[0]=e,Z(t,`earL`)[2]=Z(t,`earR`)[2]=n};switch(n){case`twerk`:{let n=Math.abs(i(r*13)),a=i(r*13),c=i(r*Math.PI);e.brx=.62+n*.16,e.bz=-.07,e.by=-.04+n*.035,e.bry=a*.15+c*.1,e.brz=a*.24,e.bx=o.y*i(e.brz),e.llx=e.lrx=-.6,e.llz=.32,e.lrz=-.32,this.reach(e,`both`,Math.max(s-.04,.12),this.front+this.pawR+.02,.06,`paw`);let u=Ge.smoothstep(i(r*1.3),.3,.8);e.hrx=-.55,e.hry=u*.9,e.hrz=u*.2,e.trx=.7,e.try=a*.9,Z(t,`tail1`)[1]=a*.5,Z(t,`tail2`)[1]=-a*.6,Z(t,`rear`)[3]=a*.04,l(0,a*.2);break}case`griddy`:{let t=c%8;if(t<6){let n=Math.floor(t)%2?1:-1,r=i(t%1*Math.PI);e.by=r*.06,e.brx=-.1,e.llx=n>0?-.75*r:.15*r,e.lrx=n<0?-.75*r:.15*r,e.bry=n*.2*r,e.brz=n*.05;let a=n*(.4+.6*r);e.alx=-.3-a,e.arx=-.3+a,e.alz=this.armOut+.25,e.arz=-this.armOut-.25,e.el=e.er=.7,e.hrz=-n*.1,e.try=n*.6}else{let t=this.headNow(this.eyePos,-.15);this.reach(e,`both`,t.y,t.z+this.pawR+.04,t.x-Math.abs(o.x)-.02,`paw`);let n=i(r*10);e.alx+=n*.06,e.arx-=n*.06,e.hrx=-.15,e.hry=i(r*3)*.3,e.by=Math.abs(i(r*Math.PI*2))*.03,e.brx=-.06,e.llz=.12,e.lrz=-.12}l(-.15,0);break}case`floss`:{let t=i(r*Math.PI*2.2);e.alz=this.armOut+.2+t*1.15,e.arz=-this.armOut-.2+t*1.15,e.alx=e.arx=-.15-t*.95,e.brz=t*.16,e.bry=-t*.22,e.hrz=-t*.22,e.by=Math.abs(a(r*Math.PI*2.2))*.025,e.llz=.1-t*.12,e.lrz=-.1-t*.12,e.try=-t*.6,l(0,t*.2);break}case`robot`:{let t=Math.floor(c)%8,n=Math.PI*.85,r=-1.5,[i,a,o,s,l,u,d,f]=[[r,.15,r,-.15,0,0,0,0],[r,.15,-.1,-n,0,-.55,0,0],[-.1,1.5,-.1,-1.5,0,0,.45,0],[-.1,1.5,-.1,-1.5,1.4,.4,.45,.15],[-.1,n,r,-.15,0,.55,-.4,0],[-.2,.2,-.2,-.2,1.5,0,-.4,.3],[-.1,2.3,-.1,-.7,.9,-.3,0,-.1],[-.1,.7,-.1,-2.3,.9,.3,0,-.1]][t];e.alx=i,e.alz=a,e.arx=o,e.arz=s,e.el=e.er=l,e.hry=u,e.bry=d,e.hrx=f,e.by=Math.max(0,1-c%1*6)*.025,e.llz=.08,e.lrz=-.08;break}case`moonwalk`:{let t=r%4;if(t<2.8){let n=t/2.8;e.bz=.13-.3*n;let r=i(n*Math.PI*4);e.llx=r*.35,e.lrx=-r*.35,e.by=Math.abs(r)*.015,e.brx=.06,e.alx=-.2+r*.3,e.arx=-.2-r*.3,e.el=e.er=.8,e.hrx=-.05+Math.abs(r)*.05,e.try=r*.3}else if(t<3.4){let n=Ge.smoothstep((t-2.8)/.6,0,1);e.bry=n*Math.PI*2,e.bz=-.17+.3*n,e.alz=this.armOut+.6,e.arz=-this.armOut-.6,e.llz=.05,e.lrz=-.05,e.try=.6}else e.bz=.13,e.by=.04,e.brx=-.08,this.raise(e,`r`,this.headC.y+this.headR.y+.1,0),e.alz=this.armOut+.3,e.hrz=.2,e.hrx=-.15,e.llz=.02,e.lrz=-.02,l(-.3,0);break}case`horse`:{let t=r*4,n=Math.abs(i(t*Math.PI)),s=Math.floor(t/2)%2==0;e.by=n*.06,e.llx=s?-.55*n:.05,e.lrx=s?.05:-.55*n,e.brx=-.06,e.bry=(s?1:-1)*.12,e.brz=(s?-1:1)*.05,this.reach(e,`both`,o.y-.04+n*.03,this.front+this.pawR+.08,o.x-.02,`paw`),c%16>=12?(this.raise(e,`r`,this.headC.y+this.headR.y+.14,.04+i(r*14)*.08),e.arx+=a(r*14)*.25,e.hrx=-.2):e.hrx=n*.12-.04,e.try=(s?1:-1)*.5,l(-.2+n*.2,0);break}case`macarena`:{let t=c%16,n=Math.floor(t/2),r=Math.floor((t+15)/2)%8,a=o.x*2-.02,u=this.shape.tc[2]-this.shape.tr[2]-this.pawR,d=(t,n)=>{switch(Math.min(n,5)){case 0:this.reach(e,t,o.y-.02,this.front+.4,-.02,`paw`);break;case 1:this.reach(e,t,o.y+.04,this.front+.4,-.02,`paw`);break;case 2:this.reach(e,t,o.y-.02,this.front+this.pawR,a,`paw`);break;case 3:this.reach(e,t,this.headC.y+.04,this.headC.z-this.headR.z*.2,this.besideHead(.01),`paw`);break;case 4:this.reach(e,t,s+.04,this.front+this.pawR,a*.6,`paw`);break;default:this.reach(e,t,s+.02,u,.02,`paw`)}};d(`r`,n),d(`l`,r);let f=t>=12&&t<15?i((t-12)*Math.PI*2):0;e.bry=f*.25,e.brz=-f*.08,e.try=f*.8;let p=Math.floor(c/16)+(t>=15?Ge.smoothstep(t-15,0,1):0);e.bry+=p%4*(Math.PI/2),e.by=t>=15?i((t-15)*Math.PI)*.12:Math.abs(i(c*Math.PI))*.015,e.hry=t<12?n%2?.15:-.15:0,e.hrz=i(c*Math.PI)*.06,l(0,i(c*Math.PI)*.15);break}default:this.boughtDance(e,t,n,r)}}boughtDance(e,t,n,r){let i=Math.sin,a=Math.cos,o=this.shoulder,s=r*2,c=Ge.smoothstep,l=e=>o.x+e,u=(e,n)=>{Z(t,`earL`)[0]=Z(t,`earR`)[0]=e,Z(t,`earL`)[2]=Z(t,`earR`)[2]=n};switch(n){case`chicken`:{let n=s%8,a=i(r*Math.PI*8);if(n<2)this.reach(e,`both`,o.y+.03,this.front+this.pawR+.1,l(this.pawR+(a>0?.06:.01)),`paw`),e.hrx=a>0?-.12:.05,e.by=Math.abs(a)*.01;else if(n<4){let t=Math.abs(a);e.alz=this.armOut+.25+t*.75,e.arz=-(this.armOut+.25+t*.75),e.alx=e.arx=-.15,e.el=e.er=1.7,e.hrx=-.1+t*.12,e.by=t*.02}else if(n<6){let r=i((n-4)/2*Math.PI);e.by=-.07*r,e.brx=.25*r,e.bry=a*.3,e.try=a*1.1,e.llz=.1+r*.15,e.lrz=-.1-r*.15,e.alz=this.armOut+.45,e.arz=-(this.armOut+.45),e.el=e.er=1.3,Z(t,`rear`)[3]=a*.05}else{let t=Math.abs(i(r*Math.PI*4));this.reach(e,`both`,o.y-.02,this.front+this.pawR+.08,l(this.pawR*.8+t*.08),`paw`),e.by=(1-t)*.015,e.hrx=-.08}u(-.1,a*.15);break}case`sprinkler`:{let t=s%6,n,r=0;if(t<4){let e=Math.floor(t*2),i=t*2%1;n=-.75+1.5*((e+Math.min(1,i*5))/8),r=Math.max(0,1-i*5)}else n=.75-1.5*c((t-4)/2,0,1);e.bry=n,this.reach(e,`l`,this.headC.y+.04,this.headC.z-this.headR.z*.2,this.besideHead(.01),`paw`),e.arx=-1.45+r*.06,e.arz=-this.armOut-.25,e.er=0,e.hry=n*.3,e.hrz=-.08,e.llx=-.25,e.lrx=.1,e.by=-.015-r*.012,e.try=n*.6,u(-.05,0);break}case`runningman`:{let t=Math.floor(s)%2==0,n=i(s%1*Math.PI);e.by=.015+n*.07,e.llx=t?-1*n:.4*n,e.lrx=t?.4*n:-1*n,e.brx=.1,e.el=e.er=1.4,e.alx=t?-.1+.4*n:-.5-.5*n,e.arx=t?-.5-.5*n:-.1+.4*n,e.alz=this.armOut+.1,e.arz=-this.armOut-.1,e.hrx=-.06+n*.06,e.bry=(t?1:-1)*.08*n,e.try=(t?1:-1)*.5,u(-.2+n*.2,0);break}case`ymca`:{let t=s%8,n=Math.floor(t/2),r=Math.max(0,1-t%2*4),a=this.headC.y+this.headR.y;e.by=Math.abs(i(s*Math.PI))*.015+r*.04,n===0?(e.alz=Math.PI*.78,e.arz=-Math.PI*.78,e.alx=e.arx=-.1,e.hrx=-.12):n===1?(this.raise(e,`both`,a,-.01),e.hrx=.1):n===2?(e.brz=.22,e.bx=o.y*i(.22)*.5,e.alz=2.3,e.alx=-.2,e.el=.9,this.reach(e,`r`,o.y-.06,this.front+this.pawR+.08,l(-o.x*.6),`paw`),e.hrz=.15):(e.alz=Math.PI*.94,e.arz=-Math.PI*.94,e.alx=e.arx=-.12,e.hrx=-.15),e.try=i(s*Math.PI)*.4,u(-.15,0);break}case`carlton`:{let t=s%8;if(t<6){let t=a(s*Math.PI),n=Math.abs(i(s*Math.PI));e.alz=this.armOut+.35+t*.8,e.arz=-(this.armOut+.35)+t*.8,e.alx=e.arx=-.55,e.el=e.er=1.1,e.bry=-t*.35,e.brz=-t*.07,e.bx=-t*.03,e.by=n*.03,e.llx=t>0?-.35*n:.05,e.lrx=t<0?-.35*n:.05,e.hry=t*.25,e.hrz=t*.1,e.try=-t*.7,u(0,t*.2)}else{let n=c(t-6,0,.3);e.alz=this.armOut+n*(Math.PI*.85-this.armOut),e.arz=-e.alz,e.alx=e.arx=-.2,e.hrx=-.3*n,e.by=i(Math.min(1,(t-6)/1.2)*Math.PI)*.06,e.brx=-.08*n,e.try=.8,u(-.3,0)}break}case`worm`:{let t=s%2/2,n=i(t*Math.PI*2),r=i(t*Math.PI*2-1.6);if(!this.hasLegs||this.floats){e.brx=.3-r*.25,e.by=Math.max(0,n)*.05,e.hrx=-.3-Math.max(0,r)*.3,e.trx=n*.5;break}e.brx=1.42-r*.22+n*.12,e.by=.15+Math.max(0,n)*.06+Math.max(0,r)*.05,e.bz=-.38+i(t*Math.PI)*.03,e.hrx=-1-Math.max(0,r)*.4,e.alx=e.arx=-2.4+Math.max(0,r)*.5,e.alz=this.armOut+.3,e.arz=-this.armOut-.3,e.el=e.er=.6+Math.max(0,-r)*.6,e.llx=e.lrx=.3+Math.max(0,n)*.6,e.llz=.08,e.lrz=-.08,e.trx=.5+n*.4,u(.25,0);break}default:this.moreDances(e,t,n,r)}}moreDances(e,t,n,r){let i=Math.sin,a=Math.cos,o=this.shoulder,s=this.sk.rest.get(`legL`).y,c=r*2,l=Ge.smoothstep,u=this.headC.y+this.headR.y,d=e=>o.x+e,f=(e,n)=>{Z(t,`earL`)[0]=Z(t,`earR`)[0]=e,Z(t,`earL`)[2]=Z(t,`earR`)[2]=n},p=(e,t)=>this.reach(e,t,s+.04,this.front*.4+this.pawR,.05,`paw`),m=(e,t,n=0)=>{let r=[e.arx,e.arz,e.sr,e.er];this.raise(e,`both`,t,n),[e.arx,e.arz,e.sr,e.er]=r},h=(t,n,r=.3)=>{let i=c/n,a=Math.floor(i),o=l(i-a,0,r),s=this.rest(),u=this.rest();t[(a+t.length-1)%t.length](s),t[a%t.length](u);for(let t of Ru)e[t]=s[t]+(u[t]-s[t])*o;return{i:a%t.length,u:o}};switch(n){case`dougie`:{let t=i(c*Math.PI/2),n=i(c*Math.PI*2)*.25;e.brz=t*.14,e.bx=-t*.03,e.by=-Math.abs(i(c*Math.PI))*.025,e.llz=.12+t*.08,e.lrz=-.12+t*.08,t>0?(this.raise(e,`r`,u+.04,-.02),e.arx+=n,e.alz=this.armOut+.35,e.el=.8):(m(e,u+.04,-.02),e.alx+=n,e.arz=-this.armOut-.35,e.er=.8),e.hry=-t*.25,e.hrz=t*.1,e.try=t*.6,f(0,t*.2);break}case`renegade`:{let t=this.armOut,{u:n}=h([e=>(e.alz=1.9,e.arz=-t-.3,e.brz=-.06),e=>(e.alz=t+.3,e.arz=-1.9,e.brz=.06),e=>(e.alx=e.arx=-1.3,e.alz=-.35,e.arz=.35,e.el=e.er=1.3,e.by=-.02),e=>(e.arz=-2.6,e.arx=-.3,p(e,`l`),e.bx=.03,e.brz=.1,e.hrx=-.2),e=>(p(e,`both`),e.by=-.03,e.hrz=.15),e=>(e.alx=e.arx=-1.4,e.bry=.35,e.el=e.er=.3,e.try=.6),e=>(e.alx=e.arx=-1.4,e.bry=-.35,e.el=e.er=.3,e.try=-.6),e=>(e.alx=e.arx=-.4,e.alz=-.25,e.arz=.25,e.by=-.06,e.brx=.2,e.llz=.2,e.lrz=-.2)],.5,.35);e.by+=(1-n)*.01,f(-.1,0);break}case`ladies`:{let t=i(c*Math.PI),n=Math.sign(t)*Math.sqrt(Math.abs(t));e.alz=Math.PI*.82,e.alx=-.25+i(r*Math.PI*4)*.3,e.el=.25+Math.max(0,i(r*Math.PI*4))*.35,p(e,`r`),e.bx=n*.035,e.brz=-n*.09,e.by=Math.abs(t)*.012,e.llx=n>0?-.2*n:0,e.lrx=n<0?.2*n:0,e.hrz=n*.12,e.hry=-.2,e.try=n*.7,f(0,n*.2);break}case`hustle`:{let t=c%8,n=i(c*Math.PI/2);if(e.bx=n*.05,e.llz=.08+Math.max(0,n)*.18,e.lrz=-.08+Math.min(0,n)*.18,e.by=Math.abs(i(c*Math.PI))*.015,t<6){let t=r*Math.PI*4,n=this.front+this.pawR+.06;this.reach(e,`r`,o.y-.06+i(t)*.04,n+a(t)*.04,d(this.pawR*.5),`paw`),this.reach(e,`l`,o.y-.06-i(t)*.04,n-a(t)*.04,d(this.pawR*.5),`paw`),e.hrx=i(t)*.05}else{let n=l(t-6,0,.25);e.arz=-this.armOut-n*2.1,e.arx=-.3*n,p(e,`l`),e.hrx=-.25*n,e.hrz=.1*n}e.try=n*.6,f(0,n*.15);break}case`chacha`:{let t=c%16,n=i(c*Math.PI);if(t<8){let r=t<4,a=l(t%4/4,0,.6);e.bx=r?-.06+.12*a:.06-.12*a;let o=i(t%4/4*Math.PI);r?e.llz=.1+o*.3:e.lrz=-.1-o*.3,e.alz=this.armOut+.25+(r?o*.5:0),e.arz=-this.armOut-.25-(r?0:o*.5),e.by=Math.abs(n)*.01,e.hry=r?.2:-.2}else if(t<12){let n=i((t-8)%2*Math.PI);e.by=Math.abs(i(c*Math.PI))*.05;let r=(t-8)%2<1;e.llz=r?-.18*n:.25*n,e.lrz=r?.18*n:-.25*n,e.alz=this.armOut+.6,e.arz=-this.armOut-.6,e.el=e.er=.6}else{let t=i(r*Math.PI*6);e.by=-.04,e.brx=.08,e.bry=t*.25,e.brz=t*.06,e.llz=.2,e.lrz=-.2,e.alx=e.arx=-.9,e.el=e.er=1.6,e.alz=this.armOut+.3+t*.2,e.arz=-this.armOut-.3+t*.2,e.try=t}f(0,n*.15);break}case`charleston`:{let t=i(c*Math.PI),n=i(c*Math.PI*2),r=Math.floor(c/4)%2==0,a=t*.65;r?(e.lrx=-a,e.llx=a*.15):(e.llx=-a,e.lrx=a*.15),e.bry=n*.15,e.brx=.12,e.by=Math.abs(n)*.015,e.alx=a*.9-.4,e.arx=-a*.9-.4,e.alz=this.armOut+.45,e.arz=-this.armOut-.45,e.el=e.er=.9+Math.abs(n)*.3,e.hry=-n*.12,e.hrz=t*.08,e.try=n*.6,f(-.1,n*.2);break}case`cabbage`:{let t=r*Math.PI*2;this.reach(e,`both`,o.y-.04+i(t)*.05,this.front+this.pawR+.07+a(t)*.04,d(this.pawR*.9),`paw`),e.by=Math.abs(i(t))*.02-.015,e.brz=a(t)*.06,e.bry=i(t)*.15,e.bx=a(t)*.02,e.hrx=i(t)*.08,e.llz=.12,e.lrz=-.12,e.try=a(t)*.6,f(0,a(t)*.15);break}case`cart`:{let t=c%8,n=i(c*Math.PI),r=s+(o.y-s)*.55,a=this.front+this.pawR+.12+Math.abs(n)*.03;if(e.llx=n*.3,e.lrx=-n*.3,e.by=Math.abs(n)*.015,e.brx=.1,this.reach(e,`both`,r,a,0,`paw`),t>=4&&t<6){let n=i((t-4)/2*Math.PI);this.raise(e,`r`,u+.05*n,.06*n),e.hry=-.5*n,e.hrx=-.25*n,e.bry=-.25*n}else if(t>=6){let n=i((t-6)/2*Math.PI);this.reach(e,`r`,r+.03-n*.04,a+.06*n,-.01,`paw`),e.hrx=.2*n}e.try=n*.4,f(-.1,0);break}case`twist`:{let t=c%8,n=i(c*Math.PI);if(e.bry=n*.4,e.try=-n*.9,e.by=-.035-Math.abs(n)*.015,e.brx=.06,e.llz=.14,e.lrz=-.14,e.llx=e.lrx=-.1,e.alx=e.arx=-.5,e.el=e.er=1.3,e.alz=this.armOut+.35-n*.25,e.arz=-this.armOut-.35-n*.25,t>=6){let n=l(t-6,.1,1.6),r=this.headC.y+.02;this.reach(e,`r`,r,this.faceFront(r)+this.pawR+.02,d(-.02)*(1-n)+this.besideHead(-.02)*n,`paw`),e.bry*=.3,e.hry=-.1}e.hrz=-n*.1,f(0,n*.2);break}case`eslide`:{let t=c%16,n=i(c*Math.PI);if(t<8){let a=t<4,s=t%4/4;e.bx=(a?-1:1)*(l(s,0,1)-.5)*.12;let c=i(s*Math.PI*2);e.llz=.08+c*.2*(a?-1:1),e.lrz=-.08+c*.2*(a?-1:1),e.by=Math.abs(i(s*Math.PI*4))*.012,t%4>=3?this.reach(e,`both`,o.y-.03,this.front+this.pawR+.06,d(this.pawR*(i(r*Math.PI*4)>0?.9:2.5)),`paw`):(e.alx=-.2+n*.3,e.arx=-.2-n*.3,e.el=e.er=.7)}else if(t<12){let n=i((t-8)/4*Math.PI*2);e.brx=n*.12,e.bz=n*.03,e.llx=-Math.max(0,n)*.3,e.lrx=Math.max(0,-n)*.3,e.alx=e.arx=-.3+n*.4,e.el=e.er=.8}else{let n=i((t-12)/2*Math.PI);e.llx=t<14?-.8*n:0,e.by=t<14?0:i((t-14)/2*Math.PI)*.06,e.alz=this.armOut+.5,e.arz=-this.armOut-.5}let a=Math.floor(c/16)+(t>=14?l(t-14,0,1.5):0);e.bry+=a%4*(Math.PI/2),e.try=n*.5,f(0,n*.15);break}case`pointer`:{let{i:t}=h([e=>{this.raise(e,`r`,u+.12,.08),e.hrx=-.3,e.hry=-.2,e.bx=.03,e.brz=.08,e.lrx=-.2,p(e,`l`)},e=>{this.reach(e,`r`,s-.02,this.front+this.pawR+.03,d(.04),`paw`),e.hrx=.15,e.hry=.2,e.bx=-.02,e.brz=-.05,e.by=-.02,p(e,`l`)}],1,.25);e.try=t?-.5:.5,f(t?.1:-.2,0);break}case`riverdance`:{let t=c%8;e.alz=this.armOut*.5,e.arz=-this.armOut*.5,e.alx=e.arx=0,e.brx=-.03,e.hrx=-.12;let n=c*2,r=i(n%1*Math.PI),a=Math.floor(n)%2==0;if(t<6){let t=Math.floor(n)%4<2?.45:-.35;e.llx=a?t*r:0,e.lrx=a?0:t*r,e.by=r*.03}else e.llx=a?-1.1*r:0,e.lrx=a?0:-1.1*r,e.by=r*.05,e.brx=-.08;e.trx=-.3,f(-.2,0);break}case`hokey`:{let t=c%16,n=Math.floor(c/16)%2==0,a=0,s=0;if(t<2?a=-.6*l(t,0,.4):t<4?[a,s]=[.3,.25]:t<6?a=-.6:t<8&&(a=-.5+i(r*30)*.2),n?(e.llx=a,e.llz=s):(e.lrx=a,e.lrz=-s),t<8)e.brx=-.06,e.alz=this.armOut+.4,e.arz=-this.armOut-.4,e.hrx=.15;else if(t<12){let t=i(r*20);e.alz=Math.PI*.8+t*.1,e.arz=-Math.PI*.8+t*.1,e.alx=e.arx=-.2,e.bry=i(c*Math.PI)*.3,e.by=Math.abs(i(c*Math.PI))*.02,e.try=t}else if(t<14)e.bry=l(t-12,0,2)*Math.PI*2,e.alz=this.armOut+.6,e.arz=-this.armOut-.6,e.by=Math.abs(i(c*Math.PI*2))*.02;else{let t=Math.abs(i(r*Math.PI*2));this.reach(e,`both`,o.y-.02,this.front+this.pawR+.06,d(this.pawR*.8+t*.08),`paw`),e.hrx=-.1}f(-.1,0);break}case`defaultdance`:{let t=c%4,n=Math.floor(c)%2==0,r=i(c%1*Math.PI),a=n?1:-1;if(t<2)e.by=r*.04,e.bx=a*.03,e.llz=.1+(n?.2:0)*r,e.lrz=-.1-(n?0:.2)*r,e.alx=n?-1.2:.5,e.alz=n?-.25:this.armOut+.2,e.el=n?1.4:.2,e.arx=n?.5:-1.2,e.arz=n?-this.armOut-.2:.25,e.er=n?.2:1.4,e.bry=-a*.2,e.hry=a*.15;else{let t=i(c*Math.PI*2);e.by=-Math.abs(t)*.03,e.llx=e.lrx=-.1,e.llz=.15,e.lrz=-.15,e.alx=-.7+t*.5,e.arx=-.7-t*.5,e.el=e.er=1.5,e.alz=this.armOut+.2,e.arz=-this.armOut-.2,e.hrx=Math.abs(t)*.12}e.try=a*.6,f(0,a*.15);break}case`orange`:{let t=i(c*Math.PI);e.alz=this.armOut+t*.85,e.arz=-this.armOut+t*.85,e.alx=e.arx=-.35,e.brz=-t*.1,e.bx=t*.03,e.llz=.14-t*.24,e.lrz=-.14-t*.24,e.llx=e.lrx=-.12,e.by=-.02+Math.abs(t)*.02,e.brx=.08,e.hrz=t*.12,e.hry=-t*.2,e.try=t*.8,f(0,t*.2);break}case`woah`:{let t=Math.floor(c/2)%2?1:-1,n=c%2/2,r=l(n,0,.1)*(1-l(n,.75,1)*.7);e.by=-.05*r,e.brz=-t*.15*r,e.bry=t*.3*r,e.alz=this.armOut+t*1*r+.2,e.arz=-this.armOut+t*1*r-.2,e.alx=e.arx=-.7*r-.14,e.el=e.er=.7*r,e.llz=.18*r,e.lrz=-.18*r,e.hrz=-t*.2*r,e.hrx=.15*r,e.try=t*r,f(-.2*r,0);break}case`windmill`:{let t=r*7;if(!this.hasLegs||this.floats){e.bry=t,e.alz=this.armOut+1.2,e.arz=-this.armOut-1.2,e.by=Math.abs(i(r*7))*.02;break}e.brz=1.15,e.bry=t;let n=i(1.15)*o.y*.5;e.bx=n*a(t),e.bz=-n*i(t),e.by=.1,e.llz=.9+i(t)*.15,e.lrz=-.9+i(t)*.15,e.llx=e.lrx=-.2,e.alz=this.armOut+.3,e.arz=-this.armOut-.3,e.el=e.er=1.2,e.alx=e.arx=-.8,e.hrz=-.4,e.trx=.4,f(.3,0);break}case`dabdance`:{let{i:t}=h([e=>(e.arx=-1.75,e.arz=.35,e.er=1.9,e.alz=2.25,e.alx=-.35,e.hrx=.45,e.hry=-.45,e.hrz=.2,e.bry=-.15,e.by=-.015),e=>(e.alx=-1.75,e.alz=-.35,e.el=1.9,e.arz=-2.25,e.arx=-.35,e.hrx=.45,e.hry=.45,e.hrz=-.2,e.bry=.15,e.by=-.015)],2,.08);e.try=t?.6:-.6,f(.15,0);break}case`vogue`:{let t=this.headC.y,n=this.faceFront(t)+this.pawR,{i:r}=h([e=>(this.reach(e,`both`,t,n-this.headR.z*.4,this.besideHead(-.03),`paw`),e.hrx=-.12,e.bx=.02,e.brz=.05),e=>(this.reach(e,`r`,t+this.headR.y*.4,n+.03,d(.02),`paw`),e.alz=1.5,e.alx=-.1,e.hry=.3,e.bx=-.02,e.brz=-.05),e=>(this.raise(e,`r`,u+.06,-.01),this.reach(e,`l`,o.y,this.front+this.pawR+.07,d(.02)),e.bry=-.3,e.hry=.25),e=>(this.reach(e,`r`,t-.04,n+.01,this.besideHead(-.04),`paw`),p(e,`l`),e.hrx=-.3,e.hrz=.15,e.bx=.03,e.brz=.07)],1,.2);e.try=(r%2?1:-1)*.6,f(-.1,0);break}case`cancan`:{let t=Math.floor(c)%2==0,n=i(c%1*Math.PI);t?e.llx=-1.5*n:e.lrx=-1.5*n,e.by=(1-n)*Math.abs(i(c*Math.PI*2))*.02+n*.02,e.brx=-.12*n;let a=i(r*Math.PI*2);e.alz=this.armOut+.7+a*.2,e.arz=-this.armOut-.7+a*.2,e.alx=e.arx=-.5,e.el=e.er=.9,e.hrx=-.1*n,e.hrz=a*.1,e.bry=a*.15,e.try=(t?1:-1)*.6,f(-.2*n,0);break}}}gesture(t,n,r,i,a){let o=Math.sin,s=Ge.smoothstep,c=this.shoulder,l=Math.abs(c.x),u=e(r)?.time??2.5,d=i%(u+.6),f=-l,p=(e,t)=>this.headNow(e,t+this.prof.head-this.prof.lean),m=e=>p(this.headC.clone().add(new x(0,this.headR.y*.35,this.headR.z*.8)),e),h=e=>{Z(n,`earL`)[0]=Z(n,`earR`)[0]=e,Z(n,`stalkL`)[0]=Z(n,`stalkR`)[0]=e};switch(r){case`facepalm`:{let e=.32+(d>.5?o(d*7)*.04:0);t.hrx=e,t.hry=d>.5?o(d*4.5)*.15:0;let n=p(this.eyePos,e);this.reach(t,`r`,n.y+.02,n.z+this.pawR+.02,f,`paw`),this.freePaw(t),t.brx=.06,t.by=-.01,this.shut=1,h(.3);break}case`shrug`:{let e=s(d,.1,.35)*(1-s(d,u-.45,u-.1));this.reach(t,`both`,c.y-.06+e*.05,this.front+this.pawR+.05,.08+e*.08,`paw`),t.by=e*.025,t.hrz=e*.22,t.hrx=-.06*e,t.brz=-.03*e,h(-.2*e);break}case`slowclap`:{let e=(.5+.5*Math.cos(d*Math.PI*2))**.7;this.reach(t,`both`,c.y-.06,this.front+this.pawR+.08,f+this.pawR+e*.09,`paw`),t.hrx=.05,t.by=-.005,this.shut=.4;break}case`thumbsup`:this.reach(t,`r`,c.y+.02,this.front+.14,.04),this.freePaw(t),t.hrz=-.14,t.hrx=-.06,t.by=Math.max(0,o(Math.min(d,.5)*Math.PI*2))*.025;break;case`salute`:{let e=m(-.06);t.hrx=-.06,t.brx=-.1,this.reach(t,`r`,e.y,e.z+this.pawR,f+this.headR.x*.45,`paw`),t.alx=-this.armFwd*.3,t.alz=this.armOut*.4,t.sl=1,t.llz=.02,t.lrz=-.02;break}case`bow`:{let e=s(d,.15,.6)*(1-s(d,u-.7,u-.15));t.brx=.75*e,t.hrx=.2*e,t.bz=-.03*e,this.reach(t,`r`,c.y-.18,this.front+this.pawR,-l*.7,`paw`),t.alx=.5*e-this.armFwd*(1-e),t.alz=this.armOut+.35*e;break}case`blowkiss`:if(d<.75){let e=p(this.mouth,0);this.reach(t,`r`,e.y,e.z+this.pawR+.01,f,`paw`),t.brx=.05,this.shut=.6*s(d,.3,.6)}else this.reach(t,`r`,c.y+.12,this.front+.22,.12,`paw`),t.hrx=-.1,t.hrz=.15,t.brx=-.04;this.freePaw(t);break;case`micdrop`:this.reach(t,`r`,c.y+.04,this.front+.16,.2),this.freePaw(t),t.hry=-.35,t.hrx=-.12,t.brx=-.06,t.bry=-.45*s(d,1.9,2.4);break;case`dab`:this.reach(t,`l`,this.headC.y+.18,this.front-.02,.32,`paw`),this.reach(t,`r`,this.headC.y+.06,this.front+.1,f*2-.1,`paw`),t.hrx=.38,t.hry=-.4,t.brz=.08,t.bry=.15,t.by=-.01;break;case`loser`:{let e=m(0);this.reach(t,`r`,e.y,e.z+this.pawR+.01,f+this.headR.x*.15,`paw`),this.freePaw(t),t.hrz=o(d*3)*.12,t.bry=o(d*3)*.1,t.by=Math.abs(o(d*3))*.01;break}case`think`:{let e=-.12;t.hrx=e,t.hrz=.15,t.hry=.2;let n=p(this.mouth,e),r=o(d*5)*.012;this.reach(t,`r`,n.y-.05+r,n.z+this.pawR*.6,f+r,`paw`),this.reach(t,`l`,c.y-.2,this.front+this.pawR,-l*.5,`paw`);break}case`shush`:{let e=.05;t.hrx=e,t.brx=.12;let n=p(this.mouth,e);this.reach(t,`r`,n.y-.05,n.z+this.pawR+.015,f),this.freePaw(t),t.by=-.01,this.shut=.3;break}case`ragequit`:{let e=o(d*11);t.llx=-.55*Math.max(0,e),t.lrx=-.55*Math.max(0,-e),t.by=Math.abs(e)*.03,t.brz=e*.06,t.brx=.12,this.reach(t,`both`,c.y-.18+Math.abs(e)*.05,this.front+this.pawR+.03,.06,`paw`),t.hrx=.18+o(d*23)*.03,t.hrz=o(d*17)*.05,t.try=e*.5,h(.4);break}case`yawn`:if(d<1.2){let e=s(d,.05,.5);this.raise(t,`both`,this.headC.y+this.headR.y+.15*e,.04),t.hrx=-.35*e,t.by=.02*e,t.brx=-.08*e,this.shut=e}else t.hrx=.28+o((d-1.2)*2.5)*.06,t.by=-.01,t.brx=.05,this.reach(t,`both`,c.y-.15,this.front+this.pawR,-.02,`paw`),this.shut=.8,h(.25);break;case`sneeze`:if(d<1.1){let e=s(d,.1,1.1),n=o(d*9)>.6?.05:0;t.hrx=-.12-.35*e-n,t.brx=-.12*e,t.by=.015*e,this.shut=e*.9,this.freePaw(t)}else{if(t.hrx=d<1.5?.45:.25,t.brx=d<1.5?.25:.1,t.by=-.02,this.shut=d<1.5?1:.4,d>1.5){let e=p(this.mouth,.25);this.reach(t,`r`,e.y+o(d*14)*.01,e.z+this.pawR,f+o(d*14)*.03,`paw`)}this.freePaw(t)}break;case`hearthands`:this.reach(t,`both`,c.y-.02,this.front+.14,f+this.pawR*.9,`paw`),t.hrz=o(d*2.5)*.12,t.brz=o(d*2.5)*.04,t.hrx=-.05,t.by=Math.abs(o(d*5))*.008;break;case`flex`:{let e=.5+.5*o(d*6);this.raise(t,`both`,this.headC.y+.02+e*.03,.1+e*.03),t.brx=-.1,t.by=.01+e*.01,t.hrx=-.05,t.hry=o(d*3)*.3,t.llz=.12,t.lrz=-.12;break}case`eyeroll`:{let e=s(d,.15,1.2)*Math.PI*2;d<1.25?(t.hrz=.22*o(e),t.hrx=-.15-.15*Math.cos(e)):(t.hrx=.1,t.hrz=-.1,t.by=-.01),this.reach(t,`l`,c.y-.22,this.front-.02,.1,`paw`),this.shut=.45;break}case`peace`:this.raise(t,`r`,this.headC.y+.04,.03+o(d*4)*.01),this.freePaw(t),t.hrz=-.2,t.brz=.05,t.by=Math.max(0,o(Math.min(d,.5)*Math.PI*2))*.03;break;case`fingerguns`:{let e=0;for(let t of[.45,1.05,1.6])d>t&&d<t+.25&&(e=Math.max(e,1-(d-t)/.25));this.reach(t,`both`,c.y-.02+e*.06,this.front+.2,.05),t.hrz=-.12,t.hry=.1,t.bry=o(d*3)*.1,t.by=e*.01;break}case`thisisfine`:{this.sit(t,n,a);let e=d>1&&d<1.9?o((d-1)/.9*Math.PI):0,r=p(this.mouth,.05),i=Ge.lerp;this.reach(t,`r`,i(c.y-.12,r.y-.07,e),i(this.front+.12,r.z+.06,e),i(.02,f+.03,e)),t.hrx=.05-e*.1,t.tilt=-.5*e;break}case`sweat`:{let e=o(d*9)*.015;this.reach(t,`r`,this.neckPos.y-.02,this.front+this.pawR+.02+e,-l*.7,`paw`),this.freePaw(t),t.hry=Math.floor(d*2.2)%2?.35:-.35,t.hrx=.05,t.by=o(d*40)*.003,t.brz=o(d*37)*.01,h(.3);break}case`teasip`:{let e=s(d,.35,.7)*(1-s(d,1.3,1.6)),n=p(this.mouth,0),r=Ge.lerp;this.reach(t,`r`,r(c.y-.1,n.y-.07,e),r(this.front+.12,n.z+.06,e),r(.02,f+.03,e)),this.freePaw(t),t.tilt=-.6*e,t.hry=.45*s(d,1.7,1.95),t.hrx=.04,this.shut=d>1.7?.4:0;break}case`confused`:t.hrz=o(d*2.2)*.25,t.hrx=-.1+o(d*1.3)*.05,t.hry=o(d*1.7)*.15,this.reach(t,`both`,c.y-.08,this.front+this.pawR+.08,.06,`paw`),this.shut=.25;break;case`sigh`:{let e=s(d,.05,.6)*(1-s(d,.75,1)),n=s(d,.8,1.4);t.by=e*.025-n*.025,t.brx=-.08*e+.2*n,t.hrx=-.15*e+.35*n,t.alz=this.armOut+e*.15-n*.08,t.arz=-t.alz,this.shut=.3+n*.4,h(.35*n);break}case`crylaugh`:t.hrx=-.4+o(d*16)*.07,t.brx=-.12,t.brz=o(d*18)*.04,t.by=Math.abs(o(d*9))*.03,this.reach(t,`both`,c.y-.2,this.front+this.pawR,0,`paw`),t.try=o(d*9)*.3,this.shut=.85;break;case`doot`:{let e=0;for(let t of[.3,.9,1.45])d>t&&d<t+.35&&(e=Math.max(e,o((d-t)/.35*Math.PI)));let n=-.1-e*.12;t.hrx=n;let r=p(this.mouth,n);this.reach(t,`r`,r.y-.01,r.z+.015,f),this.reach(t,`l`,r.y-.03,r.z+.08,f+.02,`paw`),t.by=e*.02,t.brx=-.05-e*.05,this.shut=e*.6;break}}}emoteExtras(n){let r=t(n.anim)?n.anim:null;if(this.emoteFx&&this.emoteFx.anim!==r&&(this.emoteFx.dispose(),this.emoteFx=null),this.item&&(this.item.visible=!r),!r)return;if(!this.emoteFx){let e=new Hc(r,this.material,this.pawR);e.props.r&&this.handTilt.add(e.props.r),e.props.l&&this.leftHand().add(e.props.l),this.float.add(e.group),this.emoteFx=e}if(!Hc.wanted(r))return;let i=e(r)?.time??2.5;this.emoteFx.update((n.t-this.animStart)%(i+.6),this.emoteSpots())}leftHand(){return this.handL||(this.handL=new c,this.handL.matrixAutoUpdate=!1,(this.foreL??this.armL).add(this.handL)),this.handL}emoteSpots(){this.float.updateMatrixWorld(!0);let e=this.m4.copy(this.float.matrixWorld).invert(),t=t=>this.neck.localToWorld(t.clone().sub(this.neckPos)).applyMatrix4(e),n=t(this.headC),r=t(this.eyePos),i=t(this.eyePos.clone().setX(-this.eyePos.x)),a=this.hand.getWorldPosition(new x).applyMatrix4(e),o=this.handL?this.handL.getWorldPosition(new x).applyMatrix4(e):a.clone().setX(-a.x);return{top:t(this.headC.clone().setY(this.headC.y+this.headR.y)).y,head:n,mouth:t(this.mouth),eyeL:r,eyeR:i,hand:a,handL:o,size:this.headR.x}}mannerism(e,t,n){if(!this.clip&&n>=this.nextClip&&this.prof.idles.length){let e=this.prof.idles[Math.floor(Math.random()*this.prof.idles.length)],t=()=>Math.random()*2-1;this.clip={name:e,t0:n,dur:Wu[e],side:Math.random()<.5?-1:1,data:[t(),t(),t(),t()]}}let r=this.clip;if(!r)return;let i=(n-r.t0)/r.dur;if(i>=1||i<0){this.clip=null,this.nextClip=n+2.5+Math.random()*4.5;return}let a=Ku(i),o=r.side,s=Math.sin,c=this.shoulder,l=(t,n)=>{for(let r of n)e[r]+=(t[r]-e[r])*a};switch(r.name){case`earSwivel`:{let n=Ku(Gu(i/.65)),r=Ku(Gu((i-.3)/.65));Z(t,o>0?`earL`:`earR`)[1]+=o*.7*n,Z(t,o>0?`earR`:`earL`)[1]+=-o*.7*r,Z(t,`earL`)[0]-=.1*Math.max(n,r),Z(t,`earR`)[0]-=.1*Math.max(n,r),e.hry+=o*.12*a;break}case`earTwitch`:{let e=s(i*Math.PI*4);Z(t,o>0?`earL`:`earR`)[0]-=.5*e*e*a,Z(t,o>0?`earL`:`earR`)[2]+=o*.15*e*a;break}case`tailSwish`:{let n=i*Math.PI*2*1.5;e.try+=s(n)*.6*a,Z(t,`tail1`)[1]+=s(n-.8)*.4*a,Z(t,`tail2`)[1]+=s(n-1.6)*.5*a;break}case`headTilt`:e.hrz+=o*.34*a,e.hry+=o*.14*a,e.hrx-=.06*a,Z(t,`earL`)[1]+=.2*a,Z(t,`earR`)[1]-=.2*a;break;case`sniff`:{e.hrx-=.22*a,e.hrx+=s(n*26)*.02*a;let r=Z(t,`nose`);r[0]+=s(n*30)*.18*a,r[6]=1+.15*Math.max(0,s(n*30))*a;break}case`rubPaws`:{let t=this.rest();this.reach(t,`both`,c.y-.1,this.front+this.pawR+.02,this.pawR*.9-Math.abs(c.x),`paw`),l(t,[`alx`,`arx`,`alz`,`arz`,`sl`,`sr`]);let r=s(n*13)*.09*a;e.alz+=r,e.arz+=r,e.alx+=s(n*13+1.5)*.05*a,e.arx-=s(n*13+1.5)*.05*a,e.hrx+=.12*a;break}case`noseWiggle`:{let r=Z(t,`nose`);r[0]+=s(n*26)*.25*a,r[1]+=s(n*19)*.18*a,r[6]=1+.12*s(n*26)*a,e.hrx+=s(n*13)*.02*a;break}case`hop`:{let n=Math.max(0,s(i*Math.PI*4))*a;e.by+=.075*n,e.llx+=.5*n,e.lrx+=.5*n,e.brx+=.08*n,Z(t,`earL`)[0]-=.35*n,Z(t,`earR`)[0]-=.35*n;break}case`stalks`:{let n=Ku(Gu(i/.7)),o=Ku(Gu((i-.25)/.7)),s=Z(t,`stalkL`),c=Z(t,`stalkR`);s[0]+=r.data[0]*.45*n,s[2]+=(.25+r.data[1]*.3)*n,c[0]+=r.data[2]*.45*o,c[2]-=(.25+r.data[3]*.3)*o,e.hry+=r.data[0]*.15*a;break}case`stretch`:Z(t,`rear`)[5]-=.045*a,e.hrx-=.28*a,e.by+=.012*a,Z(t,`stalkL`)[0]-=.25*a,Z(t,`stalkR`)[0]-=.25*a,Z(t,`stalkL`)[2]+=.12*a,Z(t,`stalkR`)[2]-=.12*a;break;case`headSwivel`:e.hry+=o*1.1*Ku(Gu(i/.8));break;case`slowBlink`:this.shut=Math.max(this.shut,a);break;case`chill`:this.shut=Math.max(this.shut,.55*a),e.hrx+=.06*a;break;case`lookAround`:e.hry+=s(i*Math.PI*2)*.55*a,e.hrx-=.05*a;break;case`sentinel`:{let n=i<.25?0:i<.5?o:i<.75?-o:0;e.by+=.015*a,e.brx-=.07*a,e.hrx-=.06*a,e.hry+=n*.75*a,Z(t,`earL`)[0]-=.15*a,Z(t,`earR`)[0]-=.15*a;break}case`tailCurl`:Z(t,`tail1`)[0]-=.6*a,Z(t,`tail2`)[0]-=.8*a;break;case`wag`:e.try=s(n*16)*.6*a+e.try*(1-a);break;case`pant`:e.hrx+=s(n*14)*.03*a-.05*a,e.by+=s(n*14)*.004*a;break;case`sway`:e.brz+=s(i*Math.PI*2)*.08*a,e.hrz-=s(i*Math.PI*2)*.05*a;break;case`scratch`:{let t=this.rest();this.reach(t,`r`,c.y-.18,this.front-.02,.03),l(t,[`arx`,`arz`,`sr`]),e.arz+=s(n*18)*.1*a,e.hrx+=.15*a;break}case`lickPaw`:{let t=this.rest();this.reach(t,`r`,this.mouth.y-.06,this.mouth.z+.02,.04-Math.abs(c.x)),l(t,[`arx`,`arz`,`sr`]),e.hrx+=(.18+s(n*9)*.05)*a,e.hry-=.15*a;break}case`flap`:case`wingStretch`:{let t=r.name===`flap`?s(n*14)*.4:0;e.alz+=(1.4+t)*a,e.arz-=(1.4+t)*a;break}case`throat`:Z(t,`throat`)[6]=1+Math.max(0,s(n*9))*.3*a;break;case`flutter`:this.flutter=Math.max(this.flutter,a),e.by+=Math.max(0,s(i*Math.PI*4))*.018*a,e.hrx-=.1*a}}target(e){let n=this.rest(),i=new Map,a=e.t+this.seed,o=Math.sin,s=this.shoulder,c=this.prof;if(e.anim!==`idle`&&(this.clip=null),e.anim!==this.animNow&&(this.animNow=e.anim,this.animStart=e.t),this.shut=0,this.flutter=0,t(e.anim))this.gesture(n,i,e.anim,e.t-this.animStart,a);else switch(e.anim){case`walk`:case`run`:this.gait(n,i,e);break;case`sit`:this.sit(n,i,a);break;case`sleep`:if(!this.hasLegs||this.floats){n.hrx=.35;for(let e of[`stalkL`,`stalkR`]){let t=Z(i,e);t[0]=.6,t[6]=.4}Z(i,`rear`)[5]=.03,this.hold&&this.carryPose(n,0);break}if(c.bed===`upright`){n.brx=-.45,n.bz=-.28,n.by=-.02,n.llx=n.lrx=.45,n.llz=.1,n.lrz=-.1,n.alz=.35,n.arz=-.35,n.hrx=.12;break}if(c.bed===`side`){n.brx=-Math.PI/2,n.bry=Math.PI/2,n.bz=.45,n.llx=n.lrx=.9,n.alx=n.arx=-.55,n.alz=.15,n.arz=-.15,n.hrx=.22,n.trx=.9,Z(i,`earL`)[0]=Z(i,`earR`)[0]=.3;break}n.brx=-Math.PI/2,n.by=.18,n.bz=.45,n.alz=.5,n.arz=-.5,n.alx=n.arx=-.3,n.llz=.15,n.lrz=-.15,n.hry=.25,n.trx=.6,Z(i,`earL`)[0]=Z(i,`earR`)[0]=.3;break;case`wave`:this.raise(n,`r`,this.headC.y+.02,.02+o(a*9)*.05),this.freePaw(n),n.hrz=.1,n.brz=.04,n.try=o(a*6)*.4,c.gait===`hop`&&(n.by=Math.max(0,o(a*4.5))*.03);break;case`hand`:this.raise(n,`r`,this.headC.y+this.headR.y+.12,-.02),this.freePaw(n),n.by=Math.abs(o(a*2.5))*.012,n.hrz=.06;break;case`cheer`:{let e=o(a*10)*.04;this.raise(n,`both`,this.headC.y+this.headR.y+.08+e,.03),n.by=Math.abs(o(a*5))*(c.gait===`hop`?.14:.1),n.hrx=-.18,n.try=o(a*10)*.5,Z(i,`earL`)[0]=Z(i,`earR`)[0]=-.25;break}case`dance`:{let e=o(a*5.5);n.by=Math.abs(e)*.09,n.bry=o(a*2.75)*.7,n.brz=e*.11,n.alz=1.2+e*.55,n.arz=-(1.2-e*.55),n.alx=n.arx=-.25,n.llx=Math.max(0,e)*-.55,n.lrx=Math.max(0,-e)*-.55,n.hrz=e*.15,n.try=e*.6,Z(i,`earL`)[2]=e*.25,Z(i,`earR`)[2]=e*.25,Z(i,`rear`)[3]=e*.04,Z(i,`stalkL`)[2]=.2+e*.25,Z(i,`stalkR`)[2]=-.2+e*.25;break}case`twerk`:case`griddy`:case`floss`:case`robot`:case`moonwalk`:case`horse`:case`macarena`:case`chicken`:case`sprinkler`:case`runningman`:case`ymca`:case`carlton`:case`worm`:case`dougie`:case`renegade`:case`ladies`:case`hustle`:case`chacha`:case`charleston`:case`cabbage`:case`cart`:case`twist`:case`eslide`:case`pointer`:case`riverdance`:case`hokey`:case`defaultdance`:case`orange`:case`woah`:case`windmill`:case`dabdance`:case`vogue`:case`cancan`:this.dance(n,i,e.anim,e.t-this.animStart);break;case`laugh`:n.hrx=-.32+o(a*16)*.06,n.brz=o(a*18)*.035,n.by=Math.abs(o(a*9))*.025,this.reach(n,`both`,s.y-.2,this.front+this.pawR,0,`paw`),n.try=o(a*9)*.3;break;case`point`:this.reach(n,`r`,s.y+this.reachLength()*.55,s.z+this.reachLength()*1.1,.01),this.freePaw(n),n.brx=.07,n.hrx=-.1,n.by=Math.abs(o(a*3))*.01,n.try=o(a*7)*.3;break;case`gasp`:{let e=this.headNow(this.mouth,-.22+c.head-c.lean);this.reach(n,`both`,e.y+.02,this.faceFront(e.y)-this.pawR-.04,this.besideHead(-.02),`paw`),n.hrx=-.22,n.brx=-.06,n.by=.01,Z(i,`earL`)[0]=Z(i,`earR`)[0]=-.3,Z(i,`stalkL`)[0]=Z(i,`stalkR`)[0]=-.3;break}case`cry`:n.hrx=.34+o(a*12)*.03;{let e=this.headNow(this.eyePos,.34+c.head-c.lean);if(this.reach(n,this.hold?`l`:`both`,e.y-.02,e.z+this.pawR+.025,e.x-Math.abs(s.x),`paw`),this.hold){let e=[n.alx,n.alz,n.sl,n.el];this.carryPose(n,0),this.hold.both||([n.alx,n.alz,n.sl,n.el]=e)}}n.brz=o(a*14)*.025,n.by=-.01,Z(i,`earL`)[0]=Z(i,`earR`)[0]=.35,Z(i,`stalkL`)[0]=Z(i,`stalkR`)[0]=.45;break;case`work`:{let e=o(a*7)*.05,t=s.y-this.grip.length()*(this.grip.length()<.22?.5:.8),r=Math.min(Math.max(t,s.y-.26),this.headC.y-this.headR.y-.16)+e,i=Math.max(this.front+.14+(this.hold?.hang??0),this.front+this.pawR+(this.grip.z-this.paw.z),this.mouth.z+.04);this.reach(n,`both`,r,i,-.03),n.alx+=e*2,n.arx-=e*2,n.hrx=this.grip.length()<.22?.06:.25,n.brx=.08,n.by=Math.abs(o(a*7))*.012,this.hold?.both&&(n.carry=1);break}case`fish`:{let e=o(a*.9)>.9?o(a*40)*.08:0,t=!!this.hold?.both;this.reach(n,`both`,s.y+(t?-.08:-.16),this.front+(t?.14:.1),t?-.02:.02),n.alx+=e,n.arx+=e,n.hrx=.12,n.hry=t?0:o(a*.3)*.1,t&&(n.carry=1);break}case`water`:this.reach(n,`r`,s.y-.16,this.front+.1,.05),n.alz=.2,n.hrx=.28,n.tilt=.75+o(a*3)*.1,this.freePaw(n);break;case`drink`:{let e=a%3.2,t=e<1.4?o(e/1.4*Math.PI):0,r=this.hold??Hu,{y:i,z:l}=this.holdSpot(r),[u,d,f]=r.sip??Hu.sip,p=-f,m=this.headNow(this.mouth,(f?-.15:.12)+c.head-c.lean),h=m.y-(u*Math.cos(p)-d*Math.sin(p)),g=Math.max(m.z+.015-(u*Math.sin(p)+d*Math.cos(p)),(e=>Math.max(this.faceFront(e)+this.pawR+.03,this.faceFront(e+u*Math.cos(p))+Math.max(0,u*Math.sin(f))+.07))(h)),_=h,v=this.sipLow||Math.hypot(.03-Math.abs(s.x),_-s.y,g-s.z)>this.reachLength()*1.05;v&&(_=i+.04,g=l+.02),this.reach(n,`r`,i+(_-i)*t,l+(g-l)*t,r.out*(1-t)+(v?r.out:.03-Math.abs(s.x))*t),n.hrx=v?t*.2:f?-t*.15:t*.12,n.tilt=p*t*(v?.35:1),n.try=o(a*2)*.2,this.freePaw(n);break}default:{if(e.anim.startsWith(`win:`)){Fu(this,n,i,e.anim.slice(4),e.t-this.animStart);break}let t=this.sleepy?.45:1;if(n.hry=o(a*.37*t)*.12*(o(a*.13)>0?1:.3),n.hrz=o(a*.29*t)*.04,n.try=o(a*1.6*t)*c.tailSway,Z(i,`tail1`)[1]=o(a*1.6*t-.7)*c.tailSway*.6,Z(i,`tail2`)[1]=o(a*1.6*t-1.4)*c.tailSway*.8,n.by=o(a*2.2*t)*.005,c.paws?this.reach(n,`both`,s.y-c.paws+o(a*2.2)*.005,this.front+this.pawR+.01,-.035,`paw`):(n.alx=n.arx=-this.armFwd,n.alz=this.armOut+o(a*2.2*t)*.02,n.arz=-this.armOut-o(a*2.2*t)*.02),c.gait===`slither`&&(Z(i,`rear`)[5]=o(a*.9)*.006,Z(i,`stalkL`)[2]=.08+o(a*.7)*.05,Z(i,`stalkR`)[2]=-.08+o(a*.8+1)*.05),this.sleepy&&(n.hrx=.2+o(a*.6)*.04,n.alz=.25,n.arz=-.25),this.mannerism(n,i,a),this.hold){let e=[n.alx,n.alz,n.sl,n.el];this.carryPose(n,o(a*2.2*t)*.02),this.hold.both||([n.alx,n.alz,n.sl,n.el]=e)}}}if(this.hold&&(e.anim===`wave`||e.anim===`hand`||e.anim===`cheer`||e.anim===`cry`||e.anim===`laugh`||r(e.anim))&&((e.anim===`wave`||e.anim===`hand`)&&!this.tendril&&(n.alx=n.arx,n.alz=-n.arz,n.sl=n.sr),this.carryPose(n,0,!0)),e.anim!==`sleep`){let t=c.lean*(e.anim===`sit`?.5:1);n.brx+=t,n.hrx+=c.head-t,n.hrz+=c.tilt}if(e.speaking&&(n.hrx+=o(a*13)*.04,n.hrz+=o(a*7)*.025),this.bones.has(`feelerL`)){let t=e.anim===`sleep`&&c.bed!==`upright`&&this.hasLegs&&!this.floats?-1:0;for(let[e,n]of[[`feelerL`,1],[`feelerR`,-1]]){let r=Z(i,e);r[0]+=t+o(a*.9+n)*.05,r[2]+=n*o(a*1.3+n*.7)*.04}}if(this.tentacles&&e.anim===`sleep`?(c.bed!==`upright`&&(n.llx=n.lrx=Math.PI/2-.12,n.llz=.12,n.lrz=-.12),n.llz+=o(a*.9)*.04,n.lrz-=o(a*.9+1)*.04):this.tentacles&&(e.anim===`idle`&&(n.brz+=o(a*1.3)*.05,n.hrz-=o(a*1.3)*.03),n.llz+=o(a*3)*.14,n.lrz-=o(a*3+1)*.14,n.llx*=.4,n.lrx*=.4),this.flaps&&this.folded(e)){let e=o(a*1.6)*.03;this.hold?.both||(n.alz=zu.z+e,n.alx=zu.x,n.aly=-zu.y,n.el=zu.el,n.wl=zu.w,n.sl=1),this.hold||(n.arz=-zu.z-e,n.arx=zu.x,n.ary=zu.y,n.er=zu.el,n.wr=zu.w,n.sr=1)}if(this.flaps&&(n.wl=Math.min(n.wl,Math.max(zu.w,1-n.el*.8)),n.wr=Math.min(n.wr,Math.max(zu.w,1-n.er*.8))),this.flaps&&(e.anim===`walk`||e.anim===`run`)){let t=e.anim===`run`?16:12,r=.45,i=o(a*t);n.alz=1.5+i*r,n.alx=-.1,n.sl=1,this.hold?n.arz-=i*r*.15:(n.arz=-(1.5+i*r),n.arx=-.1,n.sr=1),n.by+=Math.max(0,i)*.02}return this.wings&&(this.wings.want=this.wings.mode===`buzz`?e.anim===`sleep`?0:1:e.anim===`cheer`||r(e.anim)?1:this.flutter),{P:n,A:i}}applyPose(e,t){let n=this.pose;if(t){let r=n.bry+i(t.P.bry-n.bry)*e,a=n.brx+i(t.P.brx-n.brx)*e;for(let r of Ru)n[r]+=(t.P[r]-n[r])*e;n.bry=i(r),n.brx=i(a);for(let n of this.extra){let r=this.auxNow.get(n)??Vu(),i=t.A.get(n)??Vu();for(let t=0;t<7;t++)r[t]+=(i[t]-r[t])*e;this.auxNow.set(n,r)}}this.body.position.set(n.bx,n.by,n.bz),this.body.rotation.set(n.brx,n.bry,n.brz),this.neck.rotation.set(n.hrx,n.hry,n.hrz),this.armL.rotation.set(n.alx,n.aly,n.alz),this.armR.rotation.set(n.arx,n.ary,n.arz),this.armL.scale.set(n.wl,n.sl,1),this.armR.scale.set(n.wr,n.sr,1),this.foreL?.rotation.set(-n.el,0,0),this.foreR?.rotation.set(-n.er,0,0),this.legL.rotation.set(n.llx,0,n.llz),this.legR.rotation.set(n.lrx,0,n.lrz);let r=this.ghost?.001:1;this.legL.scale.setScalar(r),this.legR.scale.setScalar(r),this.tail.rotation.set(n.trx,n.try,0);for(let e of this.extra){let t=this.auxNow.get(e)??Vu(),n=this.bones.get(e),r=this.sk.local.get(e);n.rotation.set(t[0],t[1],t[2]),n.position.set(r.x+t[3],r.y+t[4],r.z+t[5]),n.scale.setScalar(t[6])}if(this.hat?.holder.visible)for(let e of this.hat.fold)this.bones.get(e)?.scale.setScalar(.001);let a=this.tendril?Math.max(.001,this.grow):1;this.tendril&&this.armR.scale.multiplyScalar(a),this.armR.updateMatrix();let o=this.m6.copy(this.armR.matrix),s=this.grip;this.foreR&&(this.foreR.updateMatrix(),o.multiply(this.foreR.matrix),s=this.v2.copy(this.grip).add(this.v3.set(0,this.elbow,0)));let c=this.v.copy(s).applyMatrix4(o);if(this.hand.matrix.copy(o).invert().multiply(this.m4.makeTranslation(c.x,c.y,c.z)).multiply(this.m5.makeScale(a,a,a)),this.hand.matrixWorldNeedsUpdate=!0,this.handTilt.rotation.set(n.tilt,0,0),this.item&&(this.item.position.x=-c.x*n.carry),this.emoteFx?.anim===`hearthands`&&this.emoteFx.props.r&&(this.emoteFx.props.r.position.x=-c.x),this.handL){this.armL.updateMatrix();let e=this.m6.copy(this.armL.matrix),t=this.v2.copy(this.grip).setX(-this.grip.x);this.foreL&&(this.foreL.updateMatrix(),e.multiply(this.foreL.matrix),t=t.add(this.v3.set(0,this.elbow,0)));let n=this.v.copy(t).applyMatrix4(e);this.handL.matrix.copy(e).invert().multiply(this.m4.makeTranslation(n.x,n.y,n.z)),this.handL.matrixWorldNeedsUpdate=!0}}update(e){let t=Math.min(Math.max(e.dt,0),.1);if(e.anim===`walk`||e.anim===`run`){let n=Ge.clamp(e.speed||(e.anim===`run`?4:2),.8,7);this.phase+=t*(5+n*1.6)*this.prof.cadence}if(this.tendril){let n=!!this.item||e.anim!==`idle`&&e.anim!==`walk`&&e.anim!==`run`&&e.anim!==`sit`&&e.anim!==`sleep`;this.grow+=(+!!n-this.grow)*(1-Math.exp(-t*8))}let n=this.target(e);e.anim===`sleep`&&(n.P.by+=this.bedLift),this.applyPose(1-Math.exp(-t*14),n);let r=this.floats&&!(this.flaps&&this.folded(e))||this.ghost,i=e.anim===`sleep`?.012:this.floats?this.hover:.35,a=(r?i+Math.sin(e.t*2+this.seed)*(e.anim===`sleep`?.012:.06):0)+this.footLift;this.float.position.y+=(a-this.float.position.y)*(1-Math.exp(-t*6)),r&&(this.wisp.rotation.z=Math.sin(e.t*3+this.seed)*.15),this.keepClearOfGround(e.anim===`sleep`?.028:id),this.blinkAt-=t,this.blinkAt<=0&&this.blinkT<0&&(this.blinkT=0);let o=1;if(this.blinkT>=0){this.blinkT+=t;let e=this.blinkT/.14;o=e<1?Math.max(.12,Math.abs(1-e*2)):1,e>=1&&(this.blinkT=-1,this.blinkAt=2+Math.random()*4)}o=Math.min(o,1-.88*this.shut),e.anim===`sleep`?o=.12:e.anim===`laugh`?o=.35:this.sleepy&&e.anim===`idle`&&(o=Math.min(o,.5));for(let e of this.blinkers)e.scale.y=o*e.scale.x;if(this.wings&&this.beatWings(t),this.turrets.length&&this.swivel(e,t),this.shift){let t=Math.sin(e.t/32*Math.PI*2);this.shift.hue.value=1.6*t,this.shift.wave.value=.1+.25*Math.abs(t),this.shift.time.value=e.t%(4*Math.PI),this.shift.tint.value=Math.abs(t)}if(this.hat?.built.update?.(e.t+this.seed),this.emoteExtras(e),this.hat&&(this.hat.holder.visible=e.anim!==`sleep`),this.hatFx){let t=this.hatFxOn&&e.anim!==`sleep`;this.hatFx.group.visible=this.hatFx.ground.visible=t,t&&this.hatFx.update(e.t+this.seed,e.anim,this.ghost)}}beatWings(e){let t=this.wings,n=Ju[t.mode];t.open+=(t.want-t.open)*(1-Math.exp(-e*n.ease)),t.phase=(t.phase+e*n.rate)%(Math.PI*2);let r=Math.sin(t.phase)*t.open*n.beat,i=n.shut[0]+(n.open[0]-n.shut[0])*t.open,a=n.shut[1]+(n.open[1]-n.shut[1])*t.open;for(let[e,n]of t.bones)e.rotation.set(0,n*i,n*(a+r))}swivel(e,t){let n=e.t;for(let r of this.turrets){if(e.anim===`sleep`)r.toYaw=.2,r.toPitch=0;else if(n>=r.next||r.next-n>6){if(Math.random()<.25)for(let e of this.turrets)e.toYaw=.55,e.toPitch=-.05,e.next=n+1.2+Math.random()*1.5;else r.toYaw=-.45+Math.random()*1.05,r.toPitch=-.3+Math.random()*.55,r.next=n+.5+Math.random()*2.2}let i=1-Math.exp(-t*16);r.yaw+=(r.toYaw-r.yaw)*i,r.pitch+=(r.toPitch-r.pitch)*i,r.bone.rotation.set(0,-r.side*r.yaw,r.side*r.pitch)}}freeChains(){return[`tail`,...this.prof.gait===`scuttle`?[`legL`,`legR`]:[]]}chainOf(e){let t=[e];for(let n of this.sk.names)for(let r=this.sk.parent.get(n);r;r=this.sk.parent.get(r))if(r===e){t.push(n);break}return t}findLowPoints(){let e=this.highGeo.getAttribute(`position`),t=this.highGeo.getAttribute(`skinIndex`),n=this.highGeo.getAttribute(`skinWeight`),r=this.mesh.skeleton.bones,i=this.mesh.skeleton.boneInverses,a=this.freeChains(),o=[];for(let s of a){let a=this.bones.get(s);if(!a)continue;let c=[];for(let a of this.chainOf(s)){let o=this.sk.names.indexOf(a),s=[];for(let r=0;r<e.count;r++){let e=0;for(let t=1;t<4;t++)n.getComponent(r,t)>n.getComponent(r,e)&&(e=t);t.getComponent(r,e)===o&&n.getComponent(r,e)>=.5&&s.push(r)}if(!s.length)continue;let l=Math.max(1,Math.ceil(s.length/120));for(let t=0;t<s.length;t+=l)c.push({bone:r[o],local:new x().fromBufferAttribute(e,s[t]).applyMatrix4(i[o])})}c.length&&o.push({pivot:a,points:c})}return o}keepClearOfGround(e){let t=this.lowPoints??=this.findLowPoints();if(t.length){this.root.updateMatrixWorld(!0),ud.copy(this.root.matrixWorld).invert();for(let n of t)for(let t=0;t<4;t++){let t=1/0;for(let e of n.points)ad.copy(e.local).applyMatrix4(e.bone.matrixWorld).applyMatrix4(ud),ad.y<t&&(t=ad.y,od.copy(ad));if(t>=e)break;sd.setFromMatrixPosition(n.pivot.matrixWorld).applyMatrix4(ud);let r=od.sub(sd),i=Math.max(.06,r.length());if(cd.crossVectors(r,ld),cd.lengthSq()<1e-8)break;cd.normalize(),this.root.getWorldQuaternion(fd),n.pivot.parent.getWorldQuaternion(pd),fd.invert().multiply(pd).invert(),cd.applyQuaternion(fd),n.pivot.quaternion.premultiply(dd.setFromAxisAngle(cd,(e-t+.004)/i)),n.pivot.updateMatrixWorld(!0)}}}dispose(){this.emoteFx?.dispose(),this.emoteFx=null,this.setItem(null),this.setHat(null),this.setDetail(`high`),this.highGeo.dispose(),this.mesh.skeleton.dispose(),this.wisp.geometry.dispose(),this.root.traverse(e=>{e!==this.mesh&&e!==this.wisp&&e.isMesh&&e.geometry.dispose()});for(let e of this.owned)e.dispose();this.root.removeFromParent()}};function hd(e){let t=n(e.animal),r=/^#[0-9a-f]{6}$/i.test(e.color)?e.color:t.colors[0],i=Mt(t.id),a=Cu[t.id](i,Nn(r,t.id),r);fn(i,Tu[t.id]??{}),yn(i,t.id,r);let o=a.aquatic??t.aquatic?_t():ht(),s=new md({kit:i,profile:Eu(t.id),material:o,shift:a.shifts?xt(o):void 0,wings:a.wings,swivel:a.swivel,eyeMaterial:yt(),ghostColor:H(r,`#e6f0ff`,.75),floats:!!a.hover,hover:a.hover,flaps:a.flaps,tentacles:a.legs===`tentacles`,sleepy:a.sleepy,tendril:a.tendril,hatFit:vd(t.id,i),lowKey:`${t.id}:${r}`,lowKit:()=>{let e=Mt(t.id);return Cu[t.id](e,Nn(r,t.id),r),yn(e,t.id,r),e}});return e.hat&&s.setHat(e.hat),s}var gd={fungi:{skull:{c:[0,.28,-.04],r:[.34,.21,.32]},brow:.45},squid:{skull:{c:[0,.52,-.055],r:[.11,.16,.1]},brow:.6},robot:{bumps:`head`},hedgehog:{bumps:`none`},snail:{dz:-.04},crab:{dz:-.04}},_d=new Map;function vd(e,t){let n=t.shape,r=gd[e]??{},i=r.skull?.c??n.hc,a=r.skull?.r??n.hr;return{id:e,head:{c:i,r:a,size:Ge.clamp(a[0]/.25,.45,1.2),eye:{at:[t.eyeX,t.eyeY,t.eyeZ],r:t.eyeR},brow:r.brow},nudge:r,neckAt:t.joints.neck}}function yd(e,t){let n=e=>`${Math.floor(e.x/t)},${Math.floor(e.y/t)},${Math.floor(e.z/t)}`,r=new Map;e.forEach((e,t)=>(r.get(n(e))??r.set(n(e),[]).get(n(e))).push(t));let i=new Uint8Array(e.length),a=[];for(let o=0;o<e.length;o++){if(i[o])continue;let s=[],c=[o];for(i[o]=1;c.length;){let a=e[c.pop()];s.push(a);let[o,l,u]=n(a).split(`,`).map(Number);for(let n=-1;n<=1;n++)for(let s=-1;s<=1;s++)for(let d=-1;d<=1;d++)for(let f of r.get(`${o+n},${l+s},${u+d}`)??[])!i[f]&&e[f].distanceTo(a)<t&&(i[f]=1,c.push(f))}a.push(s)}return a}function bd(e){return/^ear|^crest|^antler/.test(e)?`fold`:/^eyes$|^blink/.test(e)?`eye`:/^stalk|^turret|^neck$/.test(e)?`solid`:null}var xd=`#3b2a5a`,Sd=`#e8c26a`,Cd=`#0d0a14`;function wd(){let e=Mt(`storyteller`);e.joints.neck=[0,.6,0],e.joints.shoulder=[.19,.6,.02],e.shape.tc=[0,.4,0],e.shape.tr=[.28,.38,.26],e.shape.hc=[0,.27,0],e.shape.hr=[.25,.27,.25];let t=Zt(e),n=e.joints.neck;t.add(ln(`body`,[0,.06,0],[0,.6,0],.29,.16,{name:`robe`})),t.add(gn(`body`,[0,.07,0],[.31,.045,.29],{k:.05,name:`hem`})),t.add(gn(`body`,[0,-.5,0],[.9,.54,.9],{k:.02,carve:!0})),t.add(gn(`body`,[0,.6,0],[.22,.09,.18],{k:.08,name:`shoulders`})),t.add(gn(`neck`,[0,n[1]+.27,0],[.25,.27,.25],{k:.06,anchor:n,reach:.18,name:`hood`})),t.add(ln(`neck`,[0,n[1]+.42,-.1],[0,n[1]+.5,-.32],.12,.026,{k:.06,name:`hoodTip`}));let r=gn(`neck`,[0,n[1]+.28,.21],[.17,.19,.15],{k:.03,carve:!0,name:`hollow`});t.add(r),cn(e,{len:.25,r0:.06,r1:.085,paw:[.05,.05,.05],fwd:.2,out:.2,pawOut:.075}),dn(e),e.eyeY=.28,e.eyeX=.075,e.eyeR=.035,e.eyeZ=.09;for(let t of[-1,1])bn(e.eyes,e.rnd,{base:`ico0`,r:[.036,.02,.012],pos:[t*.075,.28,.09],rot:[0,t*.3,-t*.25],jitter:.03,color:`#ffe08a`,tone:0});let i=e=>r.d(e.p.x,e.p.y,e.p.z);e.marks={base:xd,marks:[{color:Cd,f:e=>i(e)-.012},{color:Sd,f:e=>i(e)-.045},{color:`#d8d0f0`,f:W(e,`armLPaw`,`armRPaw`)},{color:Sd,f:Sn(Bt(e,`L`,.8),Bt(e,`R`,.8))},{color:Cd,f:U(W(e,`robe`,`hem`,`shoulders`),e=>e.p.y-.035)},{color:Sd,f:U(W(e,`robe`,`hem`,`shoulders`),e=>e.p.y-.11)},{color:Sd,f:U(W(e,`robe`,`hem`,`shoulders`),e=>Math.abs(e.p.x)-.028,e=>.05-e.p.z)}]},yn(e,`storyteller`,xd),e.seat=0;let a=St(`#ffcf6a`,1.6),o=new Je({color:`#ffe08a`});return new md({kit:e,profile:{...Eu(`raccoon`),lean:0,head:0,paws:0,idles:[`lookAround`,`headTilt`],sit:`settle`,gait:`trot`,tailSway:0},material:ht(),eyeMaterial:o,ghostColor:zt(`#cbbcf0`),floats:!0,tentacles:!1,noLegs:!0,extras:(e,t,n)=>{let r=new c,i=new vn,o=an(tn(`lantern`)),s=`#4d3a2a`;bn(i,o,{base:`limb`,r:[.07,.03,.07],pos:[0,.12,0],jitter:.02,color:s}),bn(i,o,{base:`cone5`,r:[.075,.07,.075],pos:[0,.17,0],jitter:.03,color:s}),bn(i,o,{base:`ico0`,r:.02,pos:[0,.22,0],jitter:.02,color:s}),bn(i,o,{base:`limb`,r:[.075,.025,.075],pos:[0,-.05,0],jitter:.02,color:s});for(let e=0;e<5;e++){let t=e/5*Math.PI*2;bn(i,o,{base:`box`,r:[.012,.16,.012],pos:[Math.cos(t)*.06,.035,Math.sin(t)*.06],jitter:0,color:s})}let l=new N(i.geometry(),ht());l.castShadow=!0;let u=new N(new fe(.06,0),a);u.scale.set(.9,1.3,.9),u.position.y=.035;let d=new de(`#ffcf7a`,1.6,6,2);d.position.y=.04,r.add(l,u,d),r.position.set(.04,-.42,.06),r.name=`lantern`,n.add(r)}})}var Td=null,Ed=null;function Dd(){Td?.dispose(),Td?.forceContextLoss(),Td=null}var Od=null,kd=null,Ad=new Map,jd={squid:-.2,snail:.1};function Md(e){if(!Td){Td=new Ia({antialias:!0,alpha:!0,preserveDrawingBuffer:!0}),Td.setPixelRatio(1),Td.toneMapping=7,Td.toneMappingExposure=1.06,Od=new ut,Od.add(new _(`#cfe8ff`,`#a89a80`,1.35));let e=new D(`#fff1d2`,2.4);e.position.set(1.5,3,2.5),Od.add(e),kd=new A(30,1,.1,20)}return Td.setSize(e,e,!1),{renderer:Td,scene:Od,camera:kd}}function Nd(e,t,n){e.render(t,n);let r=e.getContext().isContextLost(),i=r?``:e.domElement.toDataURL(`image/png`);return Ed&&clearTimeout(Ed),Ed=setTimeout(Dd,r?0:4e3),i}var Pd=new x(.15,.25,1).normalize();function Fd(e){let t=new x(0,1,0).cross(Pd).normalize(),n=Pd.clone().cross(t),r=[],i=new x,a=new x,o=new x,s=new I,c=new I,l=e=>{for(let t=e;t;t=t.parent)if(!t.visible)return!1;return!0};if(e.updateMatrixWorld(!0),e.traverse(e=>{let u=e;if(!u.isMesh||!l(u))return;let d=u.geometry.getAttribute(`position`);if(!d)return;let f=u.geometry.index,p=(f?f.count:d.count)/3,m=u,h=m.isInstancedMesh?m.count:1;for(let e=0;e<h;e++){s.copy(u.matrixWorld),m.isInstancedMesh&&(m.getMatrixAt(e,c),s.multiply(c));for(let e=0;e<p;e++){let c=t=>f?f.getX(e*3+t):e*3+t;i.fromBufferAttribute(d,c(0)).applyMatrix4(s),a.fromBufferAttribute(d,c(1)).applyMatrix4(s),o.fromBufferAttribute(d,c(2)).applyMatrix4(s);let l=o.clone().sub(i).cross(a.clone().sub(i)).length()/2;if(l<=0)continue;let u=i.add(a).add(o).divideScalar(3);r.push({u:u.dot(t),v:u.dot(n),w:u.dot(Pd),a:l})}}}),!r.length)return{centre:new x,half:.1,depth:.1};let u=r.reduce((e,t)=>e+t.a,0),d=(e,t)=>{r.sort((t,n)=>t[e]-n[e]);let n=0;for(let i of r)if((n+=i.a)>=u*t)return i[e];return r[r.length-1][e]},f=.04,[p,m]=[d(`u`,f),d(`u`,.96)],[h,g]=[d(`v`,f),d(`v`,.96)],[_,v]=[d(`w`,f),d(`w`,.96)],y=t.multiplyScalar((p+m)/2).add(n.multiplyScalar((h+g)/2)).addScaledVector(Pd,(_+v)/2),b=Math.max(d(`u`,.99)-d(`u`,.01),d(`v`,.99)-d(`v`,.01))/2;return{centre:y,half:Math.max(.03,Math.max(m-p,g-h)/2*1.12,b*.8),depth:(v-_)/2}}function Id(e,t=96){let n=`pet2:${e}:${t}`,r=Ad.get(n);if(r)return r;try{let{renderer:r,scene:i,camera:a}=Md(t),o=En(e);for(let e=0;e<20;e++)o.update(.05,e*.05,!1);o.root.rotation.y=.45,i.add(o.root);let{centre:s,half:c,depth:l}=Fd(o.root),u=c*1.1/Math.tan(Ge.degToRad(15))+l;a.position.copy(s).addScaledVector(Pd,u),a.lookAt(s);let d=Nd(r,i,a);return i.remove(o.root),o.dispose(),d&&Ad.set(n,d),d}catch{return``}}function Ld(e,t=96){let n=`hat:${e}:${t}`,r=Ad.get(n);if(r)return r;try{let{renderer:r,scene:i,camera:a}=Md(t),o=qs(e);if(!o)return``;o.update?.(1.2),o.group.rotation.y=.5,i.add(o.group),o.group.updateMatrixWorld(!0);let s=new Fe().setFromObject(o.group),c=s.getCenter(new x),l=s.getSize(new x),u=Math.max(.05,Math.max(l.x,l.y,l.z)*.62)/Math.sin(Ge.degToRad(15));a.position.set(c.x,c.y+u*.42,c.z+u*.9),a.lookAt(c);let d=Nd(r,i,a);i.remove(o.group),o.group.traverse(e=>e.geometry?.dispose());for(let e of o.materials)e.dispose();return d&&Ad.set(n,d),d}catch{return``}}function Rd(e,t,n=96){let r=`obj:${e}:${n}`,i=Ad.get(r);if(i)return i;try{let{renderer:e,scene:i,camera:a}=Md(n),o=t();o.rotation.y=.5,i.add(o),o.updateMatrixWorld(!0);let s=new Fe().setFromObject(o),c=s.getCenter(new x),l=s.getSize(new x),u=Math.max(.05,Math.max(l.x,l.y,l.z)*.6)/Math.sin(Ge.degToRad(15));a.position.set(c.x,c.y+u*.42,c.z+u*.9),a.lookAt(c);let d=Nd(e,i,a);return i.remove(o),pl(o),d&&Ad.set(r,d),d}catch{return``}}function zd(e,t=128){let n=`${e.animal}:${e.color}:${e.hat??``}:${t}`,r=Ad.get(n);if(r)return r;try{let{renderer:r}=Md(t),i=hd(e);i.showHatFx(!1),i.update({anim:`idle`,speed:0,dt:.016,t:0});for(let e=0;e<30;e++)i.update({anim:`idle`,speed:0,dt:.05,t:0});i.root.rotation.y=.35,Od.add(i.root);let a=i.headHeight+.03+(jd[e.animal]??0),o=a-.64,s=(o+a)/2,c=(a-o)*1.12/(2*Math.tan(Ge.degToRad(15)));kd.position.set(c*.18,s+.08,c),kd.lookAt(0,s,0);let l=Nd(r,Od,kd);return Od.remove(i.root),i.dispose(),l&&Ad.set(n,l),l}catch{return``}}var Bd=`Fredoka, "Trebuchet MS", "Segoe UI", system-ui, sans-serif`,Vd=new Set,Hd=class{style;canvas;texture;lines=[];constructor(e,t=``){this.style=e,this.canvas=document.createElement(`canvas`),this.canvas.width=e.w,this.canvas.height=e.h,this.texture=new Be(this.canvas),this.texture.colorSpace=dt,this.texture.anisotropy=4,this.set(t),Vd.add(this)}set(e){let t=Array.isArray(e)?e:[e];t.join(`
`)===this.lines.join(`
`)&&this.lines.length||(this.lines=t,this.draw())}draw(){let{w:e,h:t,bg:n,fg:r,border:i,grain:a,round:o}=this.style,s=this.canvas.getContext(`2d`);s.clearRect(0,0,e,t),s.save();let c=o?Math.min(e,t)/2:Math.min(e,t)*.14;if(s.beginPath(),s.roundRect(4,4,e-8,t-8,c),s.fillStyle=n,s.fill(),s.clip(),a){s.strokeStyle=`rgba(70, 40, 20, 0.16)`,s.lineWidth=3;for(let n=14;n<t;n+=22)s.beginPath(),s.moveTo(0,n+Math.sin(n)*3),s.bezierCurveTo(e*.3,n-6,e*.7,n+6,e,n+Math.cos(n)*3),s.stroke()}s.restore(),i&&(s.beginPath(),s.roundRect(6,6,e-12,t-12,c),s.strokeStyle=i,s.lineWidth=8,s.stroke());let l=this.lines.filter(Boolean);if(!l.length){this.texture.needsUpdate=!0;return}s.fillStyle=r,s.textAlign=`center`,s.textBaseline=`middle`;let u=this.style.weight??600,d=this.style.italic?`italic `:``,f=this.style.size??t*.5,p=t*.78/l.length;l.forEach((n,r)=>{let i=Math.min(f*(r===0?1:.62),p*(r===0?.95:.7));for(s.font=`${d}${u} ${i}px ${Bd}`;s.measureText(n).width>e*.86&&i>10;)i-=2,s.font=`${d}${u} ${i}px ${Bd}`;let a=t/2+(r-(l.length-1)/2)*p;s.fillText(n,e/2,a+i*.04)}),this.texture.needsUpdate=!0}dispose(){Vd.delete(this),this.texture.dispose()}};if(typeof document<`u`&&document.fonts){let e=()=>Vd.forEach(e=>e.draw());document.fonts.ready.then(e).catch(()=>{}),document.fonts.addEventListener?.(`loadingdone`,e)}function Ud(e,t,n,r={}){let i=new Ve({map:e.texture,transparent:!0,alphaTest:.05,emissive:`#ffffff`,emissiveMap:e.texture,emissiveIntensity:r.lit?.35:.08}),a=new c,o=new ct(t,n),s=new N(o,i);s.position.z=.051;let l=new N(o,i);return l.rotation.y=Math.PI,l.position.z=-.051,a.add(s,l),{mesh:a,material:i}}var Wd=new x(0,1,0);function Q(e,t,n,r,i,a=6){let o=new x(...n),s=new x(...r).sub(o),c=s.length(),l=new I().compose(o.addScaledVector(s,.5),new O().setFromUnitVectors(Wd,s.normalize()),new x(i,c,i));e.add(B.cyl(a),t,l)}var Gd=new Map;function Kd(e,t,n=6,r=10){let i=`${e}:${t}:${n}:${r}`,a=Gd.get(i);return a||Gd.set(i,a=new k(1,e,n,r,t)),a}var qd=new Map;function Jd(e){let t=qd.get(e);if(!t){let n=[0,.25,.5,.75,1].map(t=>new R(e+(1-e)*Math.sin(t*Math.PI),t-.5));n.unshift(new R(0,-.5)),n.push(new R(0,.5)),qd.set(e,t=new b(n,14))}return t}var Yd=new lt(1,1,1,12,1,!1,-Math.PI/2,Math.PI),Xd=new lt(1,1,1,6),Zd=new xe(1,1,6);function Qd(e,t,n,r,i,a,o=1,s=.15){for(let c=0;c<i;c++){let i=c*2.39996+o,l=s+(1-s)*((c*.618+o*.31)%1*.85),u=Math.sqrt(1-l*l),d=new x(Math.cos(i)*u/r[0],l/r[1],Math.sin(i)*u/r[2]).normalize(),f=new x(n[0]+Math.cos(i)*u*r[0],n[1]+l*r[1],n[2]+Math.sin(i)*u*r[2]),p=new O().setFromUnitVectors(Wd,d);e.add(B.sphere(6,4),t,new I().compose(f,p,new x(a,a*.3,a)))}}var $d=new x(1,0,0),$=(e,t=[0,0,0],n=1)=>new I().compose(new x(...e),new O().setFromEuler(new L(...t)),new x(n,n,n));function ef(e,t,n,r,i=!0){let a=[$([e[0],e[1],e[2]+r/2]),$([e[0]+t/2,e[1],e[2]],[0,Math.PI/2,0]),$([e[0],e[1],e[2]-r/2],[0,Math.PI,0]),$([e[0]-t/2,e[1],e[2]],[0,-Math.PI/2,0])];return i&&a.push($([e[0],e[1]+n/2,e[2]],[-Math.PI/2,0,0])),a}function tf(e,t,n,r,i,a=r*.5){let o=Math.max(...t.map(e=>e.length));t.forEach((s,c)=>{for(let l=0;l<s.length;l++){if(s[l]!==`#`)continue;let u=l;for(;s[u+1]===`#`;)u++;e.add(B.box(),n,{pos:[((l+u)/2-(o-1)/2)*r,((t.length-1)/2-c)*r,a/2],scale:[(u-l+1)*r,r,a]},i),l=u}})}var nf={G:[`###`,`#..`,`#.#`,`#.#`,`###`],A:[`.#.`,`#.#`,`###`,`#.#`,`#.#`],M:[`#...#`,`##.##`,`#.#.#`,`#...#`,`#...#`],E:[`###`,`#..`,`##.`,`#..`,`###`],O:[`###`,`#.#`,`#.#`,`#.#`,`###`],V:[`#.#`,`#.#`,`#.#`,`#.#`,`.#.`],R:[`##.`,`#.#`,`##.`,`#.#`,`#.#`],2:[`###`,`..#`,`###`,`#..`,`###`],0:[`###`,`#.#`,`#.#`,`#.#`,`###`],1:[`.#`,`##`,`.#`,`.#`,`.#`],4:[`#.#`,`#.#`,`###`,`..#`,`..#`],5:[`###`,`#..`,`###`,`..#`,`###`],7:[`###`,`..#`,`.#.`,`.#.`,`.#.`],8:[`###`,`#.#`,`###`,`#.#`,`###`]," ":[`.`,`.`,`.`,`.`,`.`]};function rf(e,t,n,r,i){let a=[``,``,``,``,``];for(let e of t)nf[e].forEach((e,t)=>a[t]+=(a[t]?`.`:``)+e);tf(e,a,n,r,i)}function af(e,t,n,r,i=.01){e.add(B.box(),t,{pos:[0,-.12*n,i/2],rot:[0,0,Math.PI/4],scale:[.62*n,.62*n,i]},r);for(let a of[-1,1])e.add(B.cyl(12),t,{pos:[a*.22*n,.12*n,i/2],rot:[Math.PI/2,0,0],scale:[.3*n,i,.3*n]},r)}function of(e,t,n,r,i,a){e.add(B.cyl(16),t,{pos:[0,r+i/2,0],scale:[n,i,n]}),e.add(B.dome(16),t,{pos:[0,r+i,0],scale:[n,a,n]});for(let i=0;i<8;i++){let a=i/8*Math.PI*2;e.add(B.cone(6),t,{pos:[Math.sin(a)*n*.8,r-n*.12,Math.cos(a)*n*.8],rot:[Math.PI,0,0],scale:[n*.24,n*.26,n*.24]})}}function sf(e,t,n,r=.44,i=.2){e.add(B.box(),t,{pos:[0,.1,n],rot:[-.2,0,0],scale:[r,i,.05]})}var cf=(e,t,n,r=.44,i=.2)=>({y:.1,z:t+.032,w:r-.04,h:i-.03,bg:e,fg:n,tilt:.2}),lf=new Map;function uf(e,t,n,r=12){let i=lf.get(e);if(!i){let a=new st;n(a),i=new re(a,{depth:t,bevelEnabled:!1,curveSegments:r}),i.translate(0,0,-t/2),lf.set(e,i)}return i}function df(e,t,n,r){e.add(B.box(),n,{pos:[0,.2,0],scale:[.78,.24,.52]}),e.add(B.rbox(.25),t,{pos:[0,.37,.02],scale:[.62,.1,.46]}),e.add(B.rbox(.2),t,{pos:[0,.64,-.31],rot:[-.12,0,0],scale:[.78,.5,.14]});for(let i of[-1,1]){e.add(B.box(),n,{pos:[i*.36,.38,0],scale:[.1,.18,.5]}),e.add(B.cyl(12),t,{pos:[i*.36,.48,.01],rot:[Math.PI/2,0,0],scale:[.075,.52,.075]});for(let t of[-.2,.2])e.add(B.taper(.6,6),r,{pos:[i*.33,.04,t],scale:[.03,.08,.03]})}}function ff(e,t,n){let r=`#6e737c`;e.add(B.box(),`#c4c8ce`,{scale:t},n);for(let i of[-1,1])for(let a of[-1,1])for(let o of[-1,1])e.add(B.box(),r,{pos:[i*t/2.8,a*t/2.8,o*t/2.8],scale:t*.3},n);for(let i of ef([0,0,0],t*1.01,t*1.01,t*1.01))i.premultiply(n),e.add(B.cyl(16),r,{rot:[Math.PI/2,0,0],scale:[t*.24,.01,t*.24]},i),e.add(B.cyl(16),`#e4e6ea`,{pos:[0,0,.004],rot:[Math.PI/2,0,0],scale:[t*.19,.01,t*.19]},i),af(e,`#ec5aa8`,t*.26,new I().makeTranslation(0,0,.008).premultiply(i))}function pf(e,t,n,r=1){e.add(B.dome(16),`#e2302a`,{pos:n,scale:[t,t*r,t]}),e.add(B.dome(16),`#f6f4ee`,{pos:n,rot:[Math.PI,0,0],scale:[t,t*r,t]}),e.add(B.cyl(16),`#1e1e24`,{pos:n,scale:[t*1.01,t*.1,t*1.01]}),e.add(B.cyl(14),`#1e1e24`,{pos:[n[0],n[1],n[2]+t*.98],rot:[Math.PI/2,0,0],scale:[t*.3,t*.08,t*.3]}),e.add(B.cyl(14),`#f6f4ee`,{pos:[n[0],n[1],n[2]+t*1.02],rot:[Math.PI/2,0,0],scale:[t*.2,t*.06,t*.2]})}function mf(e,t,n){e.add(Jd(.7),`#e8b03a`,{pos:[0,n/2,0],scale:[t,n,t]});let r=Math.round(n/.1);for(let i=1;i<r;i++){let a=i/r*n,o=t*(.7+.3*Math.sin(i/r*Math.PI))+.005;for(let t=0;t<10;t++){let n=(t+i%2*.5)/10*Math.PI*2;e.add(B.box(),`#b8781a`,{pos:[Math.sin(n)*o,a,Math.cos(n)*o],rot:[0,n,Math.PI/4],scale:[.035,.035,.02]})}}}var hf=(e,t,n,r,i,a=[0,0,0])=>e.add(B.torus(i,6,18),t,{pos:n,rot:a,scale:r}),gf={lilypad(e){e.add(B.cyl(18),`#4a8a9a`,{pos:[0,.006,0],scale:[.4,.012,.4]}),hf(e,`#8cc4ce`,[0,.014,0],.43,.03,[Math.PI/2,0,0]);let t=uf(`lilypad`,.035,e=>{e.moveTo(0,0),e.absarc(0,0,1,.22,Math.PI*2-.22,!1),e.lineTo(0,0)},22);e.add(t,`#4f9a3e`,{pos:[0,.4,0],rot:[-Math.PI/2,0,.9],scale:[.42,.42,1]}),e.add(B.cyl(18),`#3c7a30`,{pos:[0,.378,0],scale:[.3,.012,.3]});for(let t=0;t<7;t++){let n=1.4+t/7*(Math.PI*2-1);e.add(B.box(),`#74be55`,{pos:[Math.cos(n)*.19,.42,-Math.sin(n)*.19],rot:[0,n,0],scale:[.36,.006,.012]})}let n=-.22,r=-.22;for(let t=0;t<8;t++){let i=t/8*Math.PI*2;e.add(B.sphere(8,5),t%2?`#f6a8c4`:`#f4bcd2`,{pos:[n+Math.sin(i)*.06,.47,r+Math.cos(i)*.06],rot:[Math.cos(i)*.9,0,-Math.sin(i)*.9],scale:[.035,.08,.02]})}for(let t=0;t<5;t++){let i=t/5*Math.PI*2+.3;e.add(B.sphere(8,5),`#fbe4ee`,{pos:[n+Math.sin(i)*.03,.49,r+Math.cos(i)*.03],rot:[Math.cos(i)*.4,0,-Math.sin(i)*.4],scale:[.025,.06,.016]})}e.add(B.sphere(8,5),`#f2c42a`,{pos:[n,.5,r],scale:[.025,.02,.025]});for(let[t,n,r]of[[.3,.3,.2],[.33,.16,.18],[-.36,.22,.05]])e.add(B.sphere(6,4),`#a8dcea`,{pos:[t,n,r],scale:[.018,.028,.018]})},grassblock(e){let t=.5;e.add(B.box(),`#8a5a36`,{pos:[0,.21,0],scale:[t,.42,t]}),e.add(B.box(),`#5aa83a`,{pos:[0,.39,0],scale:[.506,.06,.506]});let n=t/8;ef([0,.21,0],t,.42,t,!1).forEach((t,r)=>{for(let i=0;i<8;i++)(i*5+r*3)%4==0&&e.add(B.box(),`#4e9a32`,{pos:[(i-3.5)*n,.15-n/2,.002],scale:[n,n,.006]},t);for(let i=0;i<9;i++){let a=(i*3+r)%8-3.5,o=(i*5+r*2)%5-2.5;e.add(B.box(),i%3?`#6e4428`:`#a87a52`,{pos:[a*n,o*n-.02,.002],scale:[n,n,.006]},t)}});for(let t=0;t<6;t++)e.add(B.box(),`#6cc04a`,{pos:[(t*3%8-3.5)*n,.421,(t*5%8-3.5)*n],scale:[n,.004,n]})},rubik(e){let t=.42;e.add(B.rbox(.08),`#1a1a1e`,{pos:[0,t/2,0],scale:t});let n=[`#2aa84a`,`#d8282a`,`#2a5ad8`,`#f08a1a`,`#f6f6f2`];ef([0,t/2,0],t,t,t).forEach((t,r)=>{for(let i=-1;i<=1;i++)for(let a=-1;a<=1;a++)e.add(B.box(),n[(r+ +(i===1&&a===0)+(r===4&&i===-1&&a===1?3:0))%5],{pos:[i*.135,a*.135,.002],scale:[.12,.12,.006]},t)})},brick(e){let t=.16;e.add(B.box(),`#d8302a`,{pos:[0,.18,0],scale:[t*4,.36,t*2]});for(let n=0;n<4;n++)for(let r=0;r<2;r++)e.add(B.cyl(14),`#e2443a`,{pos:[(n-1.5)*t,.39,(r-.5)*t],scale:[.05,.06,.05]})},sharkbarrel(e){e.add(B.cyl(18),`#3a6a8a`,{pos:[0,.006,0],scale:[.44,.012,.44]}),hf(e,`#8ab8d0`,[0,.012,0],.46,.03,[Math.PI/2,0,0]),e.add(Jd(.84),`#f2c42a`,{pos:[0,.21,0],scale:[.27,.42,.27]}),e.add(B.cyl(),`#e0b020`,{pos:[0,.41,0],scale:[.23,.02,.23]});for(let t of[.1,.32])e.add(B.cyl(),`#c89a1a`,{pos:[0,t,0],scale:[.255,.025,.255]});hf(e,`#c8a878`,[0,.21,0],.275,.07,[Math.PI/2,0,0]),Q(e,`#c8a878`,[.25,.21,.08],[.42,.02,.18],.012,4),e.add(B.prism(),`#5a6a7a`,{pos:[.3,0,-.3],rot:[0,.6,0],scale:[.18,.16,.03]})},swampstump(e){e.add(B.cyl(16),`#4a5a2a`,{pos:[0,.008,0],scale:[.46,.016,.42]}),e.add(B.taper(.86),`#5a4a2e`,{pos:[0,.2,0],scale:[.36,.4,.36]}),e.add(B.cyl(),`#b89a68`,{pos:[0,.405,0],scale:[.31,.03,.31]}),hf(e,`#9a7a4a`,[0,.421,0],.16,.08,[Math.PI/2,0,0]);for(let t=0;t<6;t++){let n=t*1.1;e.add(B.sphere(6,4),`#7aa83a`,{pos:[Math.sin(n)*.34,.36-t%3*.04,Math.cos(n)*.34],scale:[.05,.1,.05]})}for(let[t,n]of[[.38,-.12],[.42,-.02],[-.4,.1]])Q(e,`#6a8a3a`,[t,0,n],[t*1.05,.5,n],.01,4),e.add(B.cyl(8),`#6a4a2a`,{pos:[t*1.05,.46,n],scale:[.02,.1,.02]});e.add(B.sphere(10,7),`#d8b070`,{pos:[-.32,.07,.24],scale:[.07,.065,.07]}),e.add(B.cone(6),`#8a9a4a`,{pos:[-.32,.15,.24],scale:[.02,.06,.02]}),Q(e,`#7a5a34`,[.12,0,-.36],[.14,.95,-.38],.025,5),e.add(B.box(),`#a07a4a`,{pos:[.1,.84,-.36],rot:[0,0,.12],scale:[.46,.2,.025]});for(let[t,n,r,i]of[[-.04,.88,.16,.1],[.16,.89,.14,-.05],[.02,.8,.2,.15],[.22,.81,.1,.1]])e.add(B.box(),`#b0201a`,{pos:[t,n,-.346],rot:[0,0,i],scale:[r,.025,.006]})},mushroom(e){e.add(B.taper(.9),`#f2e2c0`,{pos:[0,.13,0],scale:[.2,.26,.2]});for(let t of[-1,1])e.add(B.sphere(8,6),`#1e1a18`,{pos:[t*.06,.15,.182],scale:[.022,.05,.012]});e.add(B.cyl(16),`#f6ecd4`,{pos:[0,.24,0],scale:[.36,.02,.36]});let t=[0,.24,0],n=[.4,.18,.4];e.add(B.dome(16),`#e0282a`,{pos:t,scale:n}),Qd(e,`#fbf8f0`,t,n,5,.13,.5,.25),e.add(B.sphere(8,5),`#fbf8f0`,{pos:[0,.42,0],scale:[.11,.012,.11]})},qblock(e){let t=.46;e.add(B.box(),`#f2b22a`,{pos:[0,.21,0],scale:[t,.42,t]}),e.add(B.box(),`#d8901a`,{pos:[0,.02,0],scale:[.464,.04,.464]});let n=[`.###.`,`#...#`,`....#`,`...#.`,`..#..`,`.....`,`..#..`];ef([0,.21,0],t,.42,t).forEach((t,r)=>{for(let n of[-1,1])for(let i of[-1,1])e.add(B.box(),`#6a3a10`,{pos:[n*.18,i*(r===4?.18:.16),.002],scale:[.03,.03,.006]},t);r<4&&(tf(e,n,`#6a3a10`,.042,new I().makeTranslation(.006,-.006,0).premultiply(t),.006),tf(e,n,`#fbf2dc`,.042,new I().makeTranslation(0,0,.004).premultiply(t),.006))})},chocbar(e){e.add(B.box(),`#5a3420`,{pos:[0,.17,0],scale:[.68,.34,.44]});for(let t=0;t<2;t++)for(let n=0;n<2;n++)e.add(B.rbox(.25),`#6a4028`,{pos:[-.24+t*.17,.375,-.1+n*.2],scale:[.15,.08,.18]});e.add(B.box(),`#5a2a7a`,{pos:[.18,.205,0],scale:[.34,.43,.46]}),e.add(B.box(),`#f2e2a0`,{pos:[.18,.21,.232],scale:[.26,.1,.006]}),e.add(B.box(),`#c8302a`,{pos:[.18,.21,.236],scale:[.18,.04,.006]}),e.add(B.box(),`#d8c070`,{pos:[.005,.24,0],rot:[0,0,.3],scale:[.012,.46,.47]}),e.add(B.box(),`#f2d24a`,{pos:[.06,.47,.06],rot:[.2,.3,-.5],scale:[.2,.004,.11]})},tetris(e){let t=.14,n=[`TTTOO`,`ZTLOO`,`ZZLLL`],r={T:`#a03ad8`,O:`#f2d02a`,Z:`#e2302a`,L:`#f08a1a`,I:`#3ad0e8`};n.forEach((n,i)=>{for(let a=0;a<n.length;a++){let o=(a-2)*t,s=(2-i+.5)*t;e.add(B.box(),r[n[a]],{pos:[o,s,0],scale:[t*.98,t*.98,.38]}),e.add(B.box(),`#ffffff`,{pos:[o-t*.3,s+t*.3,.19],scale:[t*.2,t*.2,.006]})}});for(let n=0;n<4;n++)e.add(B.box(),r.I,{pos:[0,.42+(n+.5)*t,-.33],scale:[t*.98,t*.98,t*.98]})},pokeball(e){pf(e,.36,[0,.22,0],.56),e.add(B.sphere(12,6),`#c82420`,{pos:[0,.405,0],scale:[.22,.02,.22]})},d20(e){let t=.265,n=B.ico(0),r=n.getAttribute(`position`),i=e=>[0,1,2].map(t=>new x().fromBufferAttribute(r,e*3+t)),a=new O().setFromUnitVectors((e=>e[0].clone().add(e[1]).add(e[2]).normalize())(i(0)),new x(0,-1,0)),o=new I().compose(new x(0,.2105955,0),a,new x(t,t,t));e.add(n,`#6a3aa8`,o);let s=[`20`,`8`,`14`,`2`,`11`,`17`,`5`],c=0;for(let t=0;t<20&&c<s.length;t++){let n=i(t).map(e=>e.applyMatrix4(o)),r=n[0].clone().add(n[1]).add(n[2]).divideScalar(3),a=new x().subVectors(n[1],n[0]).cross(new x().subVectors(n[2],n[0])).normalize();if(a.y<.2||a.y>.99)continue;let l=new x().crossVectors(Wd,a).normalize(),u=new x().crossVectors(a,l),d=new I().makeBasis(l,u,a).setPosition(r),f=s[c++],p=[``,``,``,``,``];for(let e of f)nf[e].forEach((e,t)=>p[t]+=(p[t]?`.`:``)+e);tf(e,p,`#f6f2ff`,.018,d,.004)}},arcadeghost(e){of(e,`#e2302a`,.3,.06,.22,.14);for(let t of[-1,1])e.add(B.sphere(10,8),`#f8f8ff`,{pos:[t*.11,.24,.27],scale:[.07,.09,.04]}),e.add(B.sphere(8,6),`#2a3ad8`,{pos:[t*.11+.03,.23,.302],scale:[.035,.045,.02]})},companion(e){ff(e,.42,$([0,.21,0]))},pineapple(e){mf(e,.32,.4),e.add(B.cyl(),`#d8a030`,{pos:[0,.405,0],scale:[.22,.03,.22]}),e.add(B.cyl(14),`#8ac8e8`,{pos:[0,.2,.31],rot:[Math.PI/2,0,0],scale:[.07,.03,.07]}),hf(e,`#8a9aa8`,[0,.2,.32],.08,.2);for(let t=0;t<6;t++){let n=-.9+t/5*1.8;e.add(B.sphere(8,5),t%2?`#3e8a3a`:`#4e9e3e`,{pos:[Math.sin(n)*.2,.75-Math.abs(n)*.12,-.32-Math.cos(n)*.02],rot:[-.2,0,-n*.8],scale:[.06,.36,.025]})}},coffin(e){e.add(B.box(),`#7a7670`,{pos:[0,.05,0],scale:[.5,.1,.92]});let t=uf(`coffin`,1,e=>{e.moveTo(-.17,.46),e.lineTo(.17,.46),e.lineTo(.26,.24),e.lineTo(.18,-.44),e.lineTo(-.18,-.44),e.lineTo(-.26,.24),e.closePath()});e.add(t,`#3a2420`,{pos:[0,.23,0],rot:[-Math.PI/2,0,0],scale:[1,1,.26]}),e.add(t,`#a01a2a`,{pos:[0,.37,0],rot:[-Math.PI/2,0,0],scale:[.98,.98,.02]}),e.add(t,`#4a2e28`,{pos:[0,.4,0],rot:[-Math.PI/2,0,0],scale:[1.02,1.02,.045]});for(let t of[-1,1])for(let n of[-.2,.14])e.add(B.box(),`#c8a040`,{pos:[t*.235,.24,n],scale:[.02,.025,.12]});let n=$([0,.44,-.4]);e.add(B.sphere(8,6),`#2a2230`,{pos:[0,.04,0],scale:[.04,.05,.035]},n);for(let t of[-1,1])e.add(B.prism(),`#2a2230`,{pos:[t*.1,.04,0],rot:[0,0,t*-.3],scale:[.14,.06,.012]},n),e.add(B.cone(3),`#2a2230`,{pos:[t*.02,.1,0],scale:[.012,.03,.01]},n),e.add(B.sphere(6,4),`#e23a3a`,{pos:[t*.014,.06,.03],scale:.007})},familycouch(e){df(e,`#a07892`,`#8a6480`,`#4a3028`),e.add(B.box(),`#8a6a3a`,{pos:[0,1.12,-.45],scale:[.4,.26,.03]}),e.add(B.box(),`#8ac0e8`,{pos:[0,1.12,-.43],scale:[.34,.2,.01]}),e.add(B.box(),`#3a6a9a`,{pos:[0,1.04,-.424],scale:[.34,.05,.01]}),e.add(B.prism(),`#fbfbf6`,{pos:[0,1.065,-.42],rot:[Math.PI/2,0,0],scale:[.003,.012,.003]}),e.add(B.cone(3),`#fbfbf6`,{pos:[.01,1.13,-.42],rot:[0,0,0],scale:[.05,.12,.005]}),e.add(B.box(),`#6a3a2a`,{pos:[.01,1.07,-.42],scale:[.09,.02,.005]}),Q(e,`#6a5a4a`,[0,.78,-.42],[0,1,-.45],.008,4)},sortingstool(e){e.add(B.cyl(),`#8a6a44`,{pos:[0,.39,0],scale:[.27,.06,.27]});for(let t=0;t<3;t++){let n=t/3*Math.PI*2+.5;Q(e,`#6e4a2a`,[Math.sin(n)*.14,.37,Math.cos(n)*.14],[Math.sin(n)*.25,0,Math.cos(n)*.25],.03)}Q(e,`#6e4a2a`,[0,0,-.36],[0,.68,-.36],.03,6);let t=$([0,.7,-.36]),n=`#6a4e34`;e.add(B.cyl(16),n,{pos:[0,.01,0],scale:[.24,.02,.24]},t),e.add(B.taper(.7,12),n,{pos:[0,.1,0],rot:[.1,0,0],scale:[.14,.18,.14]},t),e.add(B.taper(.55,10),`#5e4430`,{pos:[.02,.25,-.01],rot:[-.2,0,-.25],scale:[.1,.16,.1]},t),e.add(B.cone(8),n,{pos:[.09,.36,0],rot:[0,0,-1.2],scale:[.055,.16,.055]},t);for(let n of[-1,1])e.add(B.box(),`#3a2818`,{pos:[n*.05,.16,.13],rot:[.1,0,n*.3],scale:[.06,.012,.01]},t);e.add(B.box(),`#2a1a10`,{pos:[0,.08,.145],rot:[.1,0,0],scale:[.14,.025,.01]},t),e.add(B.box(),`#a0905a`,{pos:[-.06,.12,.12],rot:[.1,.3,.2],scale:[.04,.04,.01]},t)},orangecouch(e){df(e,`#d8742a`,`#b85e1e`,`#3a2a20`),e.add(B.cyl(12),`#f4f0e6`,{pos:[.36,.6,.12],scale:[.065,.1,.065]}),e.add(B.cyl(12),`#6a3a1e`,{pos:[.36,.645,.12],scale:[.055,.012,.055]}),hf(e,`#f4f0e6`,[.43,.6,.12],.035,.25,[0,Math.PI/2,0])},jeepseat(e){e.add(B.box(),`#8a8670`,{pos:[0,.16,0],scale:[.6,.32,.5]}),e.add(B.box(),`#c8302a`,{pos:[0,.22,.003],scale:[.605,.05,.505]}),e.add(B.box(),`#f2c42a`,{pos:[0,.27,.003],scale:[.605,.03,.505]}),e.add(B.rbox(.25),`#5a5448`,{pos:[0,.37,.02],scale:[.46,.1,.42]}),e.add(B.rbox(.2),`#5a5448`,{pos:[0,.68,-.25],rot:[-.15,0,0],scale:[.44,.52,.1]});for(let t of[-1,1])Q(e,`#2a2a2e`,[t*.32,.3,-.36],[t*.32,1.05,-.36],.025,6);Q(e,`#2a2a2e`,[-.32,1.05,-.36],[.32,1.05,-.36],.025,6),hf(e,`#1e1e22`,[0,.72,-.45],.19,.4),e.add(B.cyl(16),`#c8302a`,{pos:[0,.72,-.43],rot:[Math.PI/2,0,0],scale:[.16,.06,.16]}),hf(e,`#f2c42a`,[0,.72,-.395],.11,.12),e.add(B.sphere(8,6),`#1e1e22`,{pos:[0,.73,-.395],scale:[.06,.04,.01]}),e.add(B.box(),`#1e1e22`,{pos:[.04,.705,-.395],rot:[0,0,-.2],scale:[.07,.02,.01]})},transporter(e){e.add(B.cyl(18),`#7a7e88`,{pos:[0,.19,0],scale:[.36,.38,.36]}),e.add(B.cyl(18),`#b8bcc8`,{pos:[0,.4,0],scale:[.34,.04,.34]}),hf(e,`#5a5e68`,[0,.42,0],.34,.06,[Math.PI/2,0,0]);for(let t=0;t<7;t++){let n=t/6*Math.PI*2,r=t===6?0:.2;e.add(B.cyl(12),`#fff2b0`,{pos:[Math.sin(n)*r,.421,Math.cos(n)*r],scale:[.06,.006,.06]})}for(let t=0;t<8;t++)e.add(B.box(),`#3a3e48`,{pos:[0,.2,0],rot:[0,t/8*Math.PI*2,0],scale:[.012,.3,.725]});for(let t=0;t<9;t++){let n=t*2.39996,r=.22+t%3*.05;e.add(B.ico(0),t%2?`#d8f0ff`:`#fff6c8`,{pos:[Math.sin(n)*r,.6+t*.37%1*.6,Math.cos(n)*r-.05],scale:[.025,.045,.025]})}},policebox(e){e.add(B.box(),`#1f3f7a`,{pos:[0,.2,0],scale:[.5,.4,.5]}),e.add(B.box(),`#1a3468`,{pos:[0,.41,0],scale:[.54,.03,.54]});for(let t of[-1,1])for(let n of[-1,1])e.add(B.box(),`#1a3468`,{pos:[t*.25,.2,n*.25],scale:[.05,.4,.05]});for(let t of ef([0,.2,0],.5,.4,.5,!1)){e.add(B.box(),`#121218`,{pos:[0,.15,.002],scale:[.42,.06,.006]},t),e.add(B.box(),`#e8ecf2`,{pos:[0,.15,.005],scale:[.3,.02,.004]},t);for(let n of[-1,1])e.add(B.box(),`#f2f4f6`,{pos:[n*.1,.05,.004],scale:[.15,.08,.006]},t),e.add(B.box(),`#2a4a88`,{pos:[n*.1,-.1,.004],scale:[.15,.14,.006]},t)}Q(e,`#1a3468`,[0,.3,-.33],[0,.85,-.33],.025),e.add(B.cyl(10),`#dfe8ff`,{pos:[0,.9,-.33],scale:[.045,.1,.045]}),e.add(B.cone(10),`#1a3468`,{pos:[0,.97,-.33],scale:[.06,.05,.06]})},protonpack(e){e.add(B.box(),`#5a6058`,{pos:[0,.2,0],scale:[.6,.4,.42]}),e.add(B.rbox(.2),`#3a3e3a`,{pos:[0,.405,0],scale:[.58,.04,.4]});let t=$([0,.42,-.36]);e.add(B.box(),`#2a2a2e`,{pos:[0,.32,0],scale:[.46,.64,.1]},t),e.add(B.box(),`#5a5e66`,{pos:[0,.32,-.06],scale:[.4,.6,.06]},t),e.add(B.cyl(16),`#3a3a40`,{pos:[0,.12,.06],rot:[Math.PI/2,0,0],scale:[.17,.08,.17]},t);for(let n=0;n<4;n++){let r=n/4*Math.PI*2+Math.PI/4;e.add(B.cyl(8),`#ff3a2a`,{pos:[Math.sin(r)*.12,.12+Math.cos(r)*.12,.1],rot:[Math.PI/2,0,0],scale:[.03,.02,.03]},t)}e.add(B.box(),`#9aa0a8`,{pos:[.12,.48,.06],scale:[.14,.2,.04]},t),e.add(B.box(),`#2ad86a`,{pos:[.08,.52,.082],scale:[.03,.03,.006]},t),e.add(B.box(),`#f2c42a`,{pos:[.15,.52,.082],scale:[.03,.03,.006]},t),e.add(B.cyl(10),`#9aa0a8`,{pos:[-.12,.5,.06],scale:[.05,.22,.05]},t);for(let n=0;n<5;n++)e.add(B.torus(.35,5,10),`#2a2a2e`,{pos:[-.2,.42-n*.07,.1],rot:[Math.PI/2,0,0],scale:.035},t);e.add(B.box(),`#2a2a2e`,{pos:[.33,.3,.02],scale:[.05,.08,.3]}),e.add(B.cyl(8),`#9aa0a8`,{pos:[.33,.31,.2],rot:[Math.PI/2,0,0],scale:[.02,.12,.02]}),e.add(B.box(),`#d8302a`,{pos:[.33,.33,-.05],scale:[.04,.03,.06]})},falcon(e){let t=`#b8b8b0`;e.add(B.cyl(20),t,{pos:[0,.06,0],scale:[.44,.12,.44]}),e.add(B.taper(.7,20),`#a8a8a0`,{pos:[0,.15,0],scale:[.4,.06,.4]});for(let n of[-1,1])e.add(B.box(),t,{pos:[n*.12,.08,.5],scale:[.14,.08,.3]});e.add(B.box(),`#8a8a84`,{pos:[0,.08,.5],scale:[.1,.06,.16]});for(let t=0;t<6;t++)e.add(B.box(),`#8a8a84`,{pos:[0,.122,0],rot:[0,t/6*Math.PI,0],scale:[.86,.004,.02]});e.add(B.cyl(10),t,{pos:[.42,.14,.2],rot:[Math.PI/2,0,0],scale:[.06,.26,.06]}),e.add(B.dome(10),`#3a4a5a`,{pos:[.42,.14,.33],rot:[Math.PI/2,0,0],scale:[.06,.04,.06]}),e.add(B.dome(10),`#9a9a94`,{pos:[-.24,.3,-.2],rot:[Math.PI,0,0],scale:[.1,.05,.1]}),Q(e,`#8a8a84`,[-.24,.15,-.2],[-.24,.26,-.2],.012,4),e.add(B.cyl(8),`#5a5a58`,{pos:[0,.26,0],scale:[.08,.2,.08]}),e.add(B.rbox(.3),`#d8c8a0`,{pos:[0,.38,.02],scale:[.44,.08,.4]}),e.add(B.rbox(.25),`#d8c8a0`,{pos:[0,.66,-.28],rot:[-.15,0,0],scale:[.42,.5,.08]});for(let t of[.56,.72])e.add(B.box(),`#b8a880`,{pos:[0,t,-.233-(t-.56)*.15],rot:[-.15,0,0],scale:[.38,.01,.01]})},lightcycle(e){let t=`#18181e`,n=`#5ae8ff`;for(let r of[-.36,.36])e.add(B.cyl(16),t,{pos:[0,.2,r],rot:[0,0,Math.PI/2],scale:[.2,.14,.2]}),hf(e,n,[0,.2,r],.17,.06,[0,Math.PI/2,0]),e.add(B.cyl(12),`#3a3a44`,{pos:[0,.2,r],rot:[0,0,Math.PI/2],scale:[.08,.15,.08]});e.add(B.sphere(16,8),t,{pos:[0,.3,0],scale:[.17,.14,.54]}),e.add(B.rbox(.3),`#24242c`,{pos:[0,.385,-.02],scale:[.26,.07,.36]});for(let t of[-1,1])e.add(B.box(),n,{pos:[t*.16,.3,0],rot:[0,0,t*.4],scale:[.006,.02,.8]}),e.add(B.box(),n,{pos:[t*.135,.37,.02],scale:[.006,.012,.36]});e.add(B.sphere(12,6),`#1e3a48`,{pos:[0,.42,.3],rot:[-.3,0,0],scale:[.1,.06,.18]})},timecar(e){let t=`#b8bcc0`;e.add(B.box(),t,{pos:[0,.15,0],scale:[.62,.3,.5]});for(let t=0;t<5;t++)e.add(B.box(),`#9a9ea4`,{pos:[0,.04+t*.05,.252],scale:[.6,.004,.004]});e.add(B.rbox(.25),`#2a2a2e`,{pos:[0,.37,.02],scale:[.44,.1,.42]});for(let t of[-1,1])e.add(B.rbox(.25),`#2a2a2e`,{pos:[t*.2,.42,.02],scale:[.06,.08,.4]});e.add(B.rbox(.2),`#2a2a2e`,{pos:[0,.68,-.27],rot:[-.15,0,0],scale:[.44,.52,.08]}),e.add(B.box(),t,{pos:[0,.6,-.4],scale:[.62,.6,.06]});let n=.72;e.add(B.box(),`#3a3a40`,{pos:[0,n,-.36],scale:[.26,.26,.04]});for(let t of[-Math.PI/3,Math.PI/3,Math.PI])e.add(B.box(),`#fff6b0`,{pos:[Math.sin(t)*.05,n+Math.cos(t)*.05,-.338],rot:[0,0,-t],scale:[.025,.1,.006]});let r=$([.31,.32,0],[0,0,1.2]);e.add(B.box(),t,{pos:[0,.22,0],scale:[.02,.44,.48]},r),e.add(B.box(),`#2a3a48`,{pos:[.012,.32,0],scale:[.006,.18,.36]},r);for(let t=0;t<5;t++)e.add(B.box(),`#2a2a2e`,{pos:[0,.36+t*.04,-.41],scale:[.4,.015,.03]})},command(e){let t=`#8a8e96`;e.add(B.cyl(18),`#3a3e46`,{pos:[0,.03,0],scale:[.32,.06,.32]}),e.add(B.taper(.6,14),t,{pos:[0,.18,0],scale:[.14,.26,.14]}),e.add(B.box(),t,{pos:[0,.32,0],scale:[.56,.06,.48]}),e.add(B.rbox(.3),`#24242a`,{pos:[0,.38,.01],scale:[.48,.08,.44]}),e.add(B.box(),t,{pos:[0,.68,-.31],rot:[-.12,0,0],scale:[.56,.68,.06]}),e.add(B.rbox(.25),`#24242a`,{pos:[0,.68,-.27],rot:[-.12,0,0],scale:[.46,.6,.06]});let n=[`#e2302a`,`#f2c42a`,`#2ad86a`,`#3a8af0`,`#f2f2f2`];for(let r of[-1,1]){e.add(B.box(),t,{pos:[r*.31,.48,0],scale:[.08,.26,.44]}),e.add(B.box(),`#3a3e46`,{pos:[r*.33,.62,.04],rot:[.1,0,0],scale:[.14,.04,.44]});for(let t=0;t<5;t++)e.add(B.box(),n[(t+(r>0?2:0))%5],{pos:[r*.33+(t%2?.03:-.03),.646,.14-t*.045],rot:[.1,0,0],scale:[.04,.012,.03]})}},oscar(e){let t=`#e8c048`;e.add(B.cyl(18),`#1e1e22`,{pos:[0,.19,0],scale:[.3,.38,.3]}),e.add(B.cyl(18),t,{pos:[0,.4,0],scale:[.31,.04,.31]}),e.add(B.cyl(18),`#1e1e22`,{pos:[0,.03,0],scale:[.33,.06,.33]}),e.add(B.cyl(14),`#1e1e22`,{pos:[0,.32,-.36],scale:[.1,.64,.1]}),e.add(B.cyl(14),t,{pos:[0,.665,-.36],scale:[.08,.05,.08]});let n=$([0,.69,-.36]);e.add(B.taper(1.4,10),t,{pos:[0,.2,0],scale:[.045,.4,.045]},n),e.add(B.sphere(10,8),t,{pos:[0,.38,0],scale:[.075,.06,.05]},n),e.add(B.sphere(10,8),t,{pos:[0,.46,0],scale:.04},n),e.add(B.box(),t,{pos:[0,.32,.04],scale:[.12,.03,.03]},n),Q(e,`#c8a030`,[0,.73,-.32],[0,1.03,-.32],.012,4)},catbus(e){let t=`#c8903a`;e.add(B.rbox(.35),t,{pos:[0,.27,0],scale:[.78,.3,.46]}),e.add(B.rbox(.35),`#d8a858`,{pos:[0,.39,0],scale:[.6,.06,.36]});for(let t=0;t<4;t++){let n=-.27+t*.18;for(let t of[-.15,.15])e.add(B.taper(.6,6),`#a87028`,{pos:[n,.07,t],scale:[.045,.14,.045]});e.add(B.box(),`#8a5a20`,{pos:[n-.04,.3,.232],rot:[0,0,.3],scale:[.03,.14,.006]})}let n=$([.42,.5,.04]);e.add(B.sphere(14,10),t,{scale:[.2,.18,.2]},n);for(let r of[-1,1])e.add(B.cone(4),t,{pos:[.03,.19,r*.1],rot:[r*-.3,0,0],scale:[.05,.12,.05]},n);for(let t of[-1,1])e.add(B.sphere(10,8),`#ffe060`,{pos:[.12,.06,t*.09+.06],scale:[.06,.06,.05]},n),e.add(B.sphere(6,4),`#2a2018`,{pos:[.165,.06,t*.09+.08],scale:[.02,.03,.02]},n);e.add(B.sphere(12,6),`#fbf8f0`,{pos:[.11,-.06,.08],rot:[0,-.5,0],scale:[.08,.035,.14]},n),e.add(B.box(),`#3a2418`,{pos:[.13,-.035,.09],rot:[0,-.5,0],scale:[.006,.006,.24]},n),Q(e,t,[-.38,.32,0],[-.46,.62,-.1],.05,6),e.add(B.sphere(8,6),`#d8a858`,{pos:[-.46,.64,-.1],scale:.06})},gauntlet(e){let t=`#e2b23a`,n=`#c08a24`;e.add(B.taper(1.15,14),n,{pos:[0,.16,0],scale:[.2,.32,.2]}),e.add(B.rbox(.3),t,{pos:[0,.37,0],scale:[.52,.1,.46]});let r=[`#a050e8`,`#3a7af0`,`#e2302a`,`#f08a1a`,`#2ab84a`,`#f2d82a`];e.add(B.sphere(10,8),r[5],{pos:[0,.2,.2],scale:[.05,.06,.03]});for(let i=0;i<4;i++){let a=-.18+i*.12,o=i===1||i===2?.34:.28;e.add(B.cyl(10),t,{pos:[a,.42+o/2,-.26],rot:[.12,0,0],scale:[.05,o,.05]}),e.add(B.cyl(10),n,{pos:[a,.42+o+.08,-.22],rot:[.7,0,0],scale:[.045,.18,.045]}),e.add(B.sphere(8,6),n,{pos:[a,.43,-.27],scale:.06}),e.add(B.sphere(8,6),r[i],{pos:[a,.48,-.32],scale:[.03,.035,.02]})}Q(e,t,[.26,.38,.04],[.36,.58,.02],.05,10),e.add(B.sphere(8,6),r[4],{pos:[.33,.48,.07],scale:[.025,.03,.02]})},swordthrone(e){let t=`#3c3e44`,n=`#a8aeb8`,r=`#6a5434`;e.add(B.box(),`#2e3034`,{pos:[0,.04,-.04],scale:[.78,.08,.66]}),e.add(B.box(),t,{pos:[0,.22,0],scale:[.62,.32,.52]}),e.add(B.box(),`#4a4c52`,{pos:[0,.4,.01],scale:[.58,.04,.5]}),e.add(B.box(),t,{pos:[0,.8,-.32],scale:[.6,.86,.1]});let i=(t,i,a)=>{let o=new x(...i).normalize(),s=new O().setFromUnitVectors(Wd,o),c=new I().compose(new x(...t),s,new x(1,1,1));e.add(B.box(),n,{pos:[0,a/2,0],scale:[.045,a,.012]},c),e.add(B.cone(4),n,{pos:[0,-.03,0],rot:[Math.PI,Math.PI/4,0],scale:[.032,.06,.009]},c),e.add(B.box(),r,{pos:[0,a,0],scale:[.12,.02,.025]},c),e.add(B.box(),r,{pos:[0,a+.05,0],scale:[.022,.09,.022]},c)};for(let e=0;e<15;e++){let t=-1.05+e/14*2.1,n=.36+e*.37%1*.22+(1-Math.abs(t)/1.05)*.3;i([Math.sin(t)*.15,.9+Math.cos(t)*.1,-.38-e%2*.03],[Math.sin(t),Math.cos(t),-.2],n)}for(let n of[-1,1]){e.add(B.box(),t,{pos:[n*.32,.5,-.02],scale:[.08,.2,.5]});for(let e=0;e<3;e++)i([n*(.3+e*.015),.56+e*.03,-.1+e*.07],[n*.25,.1+e*.05,1],.24+e*.03);i([n*.3,.3,.1],[n*1,-.2,.3],.2)}}},_f=`#8a8680`,vf={blockgrave:{paint(e){let t=.48,n=t/8;e.add(B.box(),`#8a8a8a`,{pos:[0,t/2,-.12],scale:t}),ef([0,t/2,-.12],t,t,t).forEach((t,r)=>{for(let i=0;i<14;i++){let a=(i*3+r*5)%8-3.5,o=(i*5+r)%8-3.5;e.add(B.box(),i%3==0?`#5a8a3a`:i%2?`#6e6e6e`:`#a0a0a0`,{pos:[a*n,o*n,.002],scale:[n,n,.006]},t)}}),e.add(B.box(),`#a07a4a`,{pos:[0,.22,.2],scale:[.04,.44,.04]}),e.add(B.box(),`#b08a52`,{pos:[0,.56,.2],scale:[.52,.28,.04]})},plate:{y:.56,z:.222,w:.48,h:.24,bg:`#b08a52`,fg:`#2a1a0a`}},volleyball:{paint(e){e.add(B.sphere(12,6),`#e2d0a0`,{pos:[0,0,.05],scale:[.42,.08,.42]}),e.add(B.box(),`#b8a07a`,{pos:[0,.42,-.12],rot:[-.05,0,.04],scale:[.5,.84,.06]}),e.add(B.box(),`#9a8462`,{pos:[0,.82,-.12],rot:[-.05,0,.04],scale:[.52,.06,.07]});let t=[.08,.2,.18];e.add(B.sphere(16,12),`#f6f2e8`,{pos:t,scale:.19});for(let n of[0,Math.PI/2])hf(e,`#b8b0a0`,t,.191,.03,[n,.4,0]);let n=$([t[0],t[1]+.02,t[2]+.185]);e.add(B.sphere(8,6),`#c8202a`,{pos:[0,-.02,0],scale:[.06,.06,.012]},n);for(let t=0;t<4;t++)e.add(B.box(),`#c8202a`,{pos:[-.045+t*.03,.06,-.004],rot:[0,0,(t-1.5)*.15],scale:[.02,.07,.012]},n);e.add(B.box(),`#c8202a`,{pos:[.07,-.02,-.006],rot:[0,0,-.9],scale:[.02,.06,.012]},n)},plate:{y:.6,z:-.085,w:.44,h:.24,bg:`#b8a07a`,fg:`#3a2a18`,roll:.04}},tblock:{paint(e){let t=.24;for(let[n,r]of[[-1,0],[0,0],[1,0],[0,1]])e.add(B.box(),`#a03ad8`,{pos:[n*t,(r+.5)*t,0],scale:t*.98}),e.add(B.box(),`#c06af0`,{pos:[n*t,(r+.5)*t+t*.47,0],scale:[t*.8,.008,t*.8]}),e.add(B.box(),`#7a28a8`,{pos:[n*t+t*.47,(r+.5)*t,0],scale:[.008,t*.8,t*.8]});e.add(B.box(),`#c06af0`,{pos:[0,1.5*t,.122],scale:[t*.7,t*.7,.006]})},plate:{y:.12,z:.124,w:.66,h:.17,bg:`#a03ad8`,fg:`#ffffff`}},orangehood:{paint(e){let t=`#f08a2a`;sf(e,`#8a8680`,.36),e.add(B.taper(.75,14),t,{pos:[0,.2,0],scale:[.24,.4,.2]}),e.add(B.sphere(14,10),t,{pos:[0,.56,0],scale:[.25,.24,.22]}),e.add(B.sphere(12,8),`#6a4a2a`,{pos:[0,.55,.15],scale:[.14,.15,.08]}),e.add(B.sphere(12,8),`#f2d0a8`,{pos:[0,.55,.17],scale:[.1,.1,.06]});for(let t of[-1,1])e.add(B.sphere(8,6),`#ffffff`,{pos:[t*.035,.57,.222],scale:[.03,.035,.01]}),e.add(B.sphere(6,4),`#1e1e1e`,{pos:[t*.03,.57,.23],scale:.01}),e.add(B.sphere(8,6),`#5a3a1a`,{pos:[t*.22,.12,.08],scale:[.06,.07,.06]}),Q(e,`#4a3420`,[t*.04,.42,.21],[t*.05,.32,.2],.008,4);e.add(B.box(),`#c86a1a`,{pos:[0,.22,.17],rot:[.25,0,0],scale:[.008,.34,.01]})},plate:cf(`#8a8680`,.36,`#1e1c1a`)},blueghost:{paint(e){sf(e,`#2a3ad8`,.34),of(e,`#2a46e8`,.26,.08,.36,.26);for(let t of[-1,1])e.add(B.box(),`#f4d0a8`,{pos:[t*.08,.56,.255],scale:[.05,.05,.012]});for(let t=0;t<6;t++)e.add(B.box(),`#f4d0a8`,{pos:[-.125+t*.05,.4+t%2*.03,.257],scale:[.04,.02,.01]})},plate:cf(`#2a3ad8`,.34,`#ffffff`)},pirateflag:{paint(e){Q(e,`#6a4a2e`,[-.34,0,0],[-.34,1.36,0],.025,6),e.add(B.sphere(6,4),`#c8a040`,{pos:[-.34,1.38,0],scale:.03}),e.add(B.box(),`#1a1a1e`,{pos:[0,1.06,0],scale:[.64,.58,.02]});let t=`#f2ece0`;e.add(B.sphere(10,8),t,{pos:[0,1.24,.012],scale:[.07,.065,.015]}),e.add(B.box(),t,{pos:[0,1.18,.012],scale:[.06,.03,.012]});for(let n of[-1,1])e.add(B.box(),t,{pos:[0,1.22,.008],rot:[0,0,n*.6],scale:[.26,.022,.01]});for(let t of[-1,1])e.add(B.sphere(6,4),`#1a1a1e`,{pos:[t*.025,1.25,.025],scale:[.018,.02,.008]});for(let t of[-1,1])e.add(B.box(),`#c8202a`,{pos:[0,.008,.3],rot:[0,t*.7,0],scale:[.36,.012,.05]});e.add(B.sphere(10,6),`#7a5a3a`,{pos:[0,0,.3],scale:[.3,.06,.22]})},plate:{y:.95,z:.061,w:.56,h:.2,bg:`#1a1a1e`,fg:`#f2ece0`}},catchball:{paint(e){e.add(B.box(),_f,{pos:[0,.11,0],scale:[.6,.22,.42]}),pf(e,.3,[0,.5,-.02])},plate:{y:.11,z:.212,w:.54,h:.17,bg:_f,fg:`#1e1c1a`}},pipe:{paint(e){let t=`#2aa83a`;e.add(B.box(),`#b8682a`,{pos:[0,.12,.02],scale:[.7,.24,.56]});for(let t of[.06,.18])e.add(B.box(),`#6a3a18`,{pos:[0,t,.02],scale:[.704,.008,.564]});e.add(B.cyl(16),t,{pos:[0,.48,-.02],scale:[.22,.5,.22]}),e.add(B.cyl(16),t,{pos:[0,.8,-.02],scale:[.28,.16,.28]}),e.add(B.cyl(16),`#0e2a12`,{pos:[0,.881,-.02],scale:[.22,.004,.22]}),e.add(B.box(),`#7ae88a`,{pos:[-.12,.48,.17],rot:[0,-.6,0],scale:[.04,.48,.01]}),e.add(B.box(),`#7ae88a`,{pos:[-.15,.8,.23],rot:[0,-.6,0],scale:[.05,.14,.01]})},plate:{y:.12,z:.302,w:.62,h:.18,bg:`#b8682a`,fg:`#2a1408`}},cubegrave:{paint(e){e.add(B.box(),_f,{pos:[0,.07,.04],scale:[.62,.14,.5]}),ff(e,.46,$([0,.36,-.04],[0,.25,.08]))},plate:{y:.07,z:.292,w:.56,h:.12,bg:_f,fg:`#1e1c1a`}},gameover:{paint(e,t){e.add(B.box(),`#2a2a44`,{pos:[0,.6,-.06],scale:[.5,1.2,.4]});for(let t of[-1,1])e.add(B.box(),`#e83a9a`,{pos:[t*.252,.6,-.06],scale:[.004,1.1,.06]}),e.add(B.box(),`#3ad0e8`,{pos:[t*.252,.4,-.06],rot:[.5,0,0],scale:[.004,.4,.05]});e.add(B.box(),`#121218`,{pos:[0,.8,.14],rot:[-.15,0,0],scale:[.44,.34,.02]}),e.add(B.box(),`#121220`,{pos:[0,1.1,.15],scale:[.48,.14,.02]}),rf(t,`GAME OVER`,`#ffd23a`,.011,$([0,1.1,.162])),e.add(B.box(),`#3a3a5a`,{pos:[0,.55,.2],rot:[.35,0,0],scale:[.5,.06,.2]}),Q(e,`#1e1e1e`,[-.1,.58,.22],[-.1,.66,.24],.01,4),e.add(B.sphere(8,6),`#e2302a`,{pos:[-.1,.67,.24],scale:.03});for(let[t,n]of[[.05,`#f2c42a`],[.12,`#2a8af0`],[.19,`#2ad86a`]])e.add(B.cyl(8),n,{pos:[t,.59,.22],rot:[.35,0,0],scale:[.02,.02,.02]});e.add(B.box(),`#1a1a2a`,{pos:[0,.25,.142],scale:[.2,.16,.01]});for(let t of[-.04,.04])e.add(B.box(),`#f08a1a`,{pos:[t,.27,.148],scale:[.025,.04,.004]})},plate:{y:.8,z:.2,w:.38,h:.28,bg:`#101418`,fg:`#6af06a`,tilt:.15}},noghost:{paint(e){e.add(B.box(),`#6a6e74`,{pos:[0,.6,-.04],scale:[.05,1.2,.05]}),e.add(B.box(),`#f2f2ee`,{pos:[0,.48,0],scale:[.48,.2,.03]});let t=$([0,1,0]);e.add(B.cyl(20),`#f8f8f6`,{rot:[Math.PI/2,0,0],scale:[.27,.02,.27]},t),e.add(B.torus(.14,6,24),`#d8202a`,{pos:[0,0,.012],scale:[.26,.26,.15]},t);let n=$([0,0,.014]).premultiply(t);e.add(B.sphere(10,8),`#e8eef8`,{pos:[0,.04,0],scale:[.09,.1,.01]},n),e.add(B.box(),`#e8eef8`,{pos:[0,-.06,0],scale:[.18,.14,.01]},n);for(let t of[-1,1])e.add(B.sphere(6,4),`#1e1e24`,{pos:[t*.035,.05,.006],scale:[.018,.026,.006]},n);e.add(B.sphere(6,4),`#1e1e24`,{pos:[0,-.01,.006],scale:[.025,.02,.006]},n),e.add(B.box(),`#d8202a`,{pos:[0,0,.03],rot:[0,0,-Math.PI/4],scale:[.5,.06,.01]},t)},plate:{y:.48,z:.016,w:.44,h:.17,bg:`#f2f2ee`,fg:`#b8202a`}},purpleshorts:{paint(e){let t=`#9a968e`;e.add(B.box(),t,{pos:[0,.38,0],scale:[.6,.76,.16]}),e.add(B.cyl(20),t,{pos:[0,.76,0],rot:[Math.PI/2,0,0],scale:[.3,.16,.3]});let n=`#7a3aa8`;e.add(B.box(),n,{pos:[0,.98,0],rot:[0,0,.08],scale:[.38,.08,.2]});for(let t of[-1,1]){for(let r of[-1,1])e.add(B.box(),n,{pos:[r*.09,.88,t*.1],rot:[t*.12,0,r*.1],scale:[.16,.2,.025]});for(let r=0;r<5;r++)e.add(B.cone(3),n,{pos:[-.16+r*.08,.76,t*.11],rot:[Math.PI,0,0],scale:[.03,.05,.01]})}let r=`#4aa83a`;for(let t=0;t<4;t++)Q(e,r,[.33,.5+t*.07,-.1],[.27,.5+t*.07,.1],.03,6);e.add(B.sphere(10,8),r,{pos:[.37,.58,-.06],scale:[.07,.16,.1]})},plate:{y:.4,z:.081,w:.48,h:.26,bg:`#9a968e`,fg:`#262420`}},pumpkinking:{paint(e,t){sf(e,`#5a5660`,.38);let n=`#2a2834`,r=[[.42,.02,-.1],[.3,.2,-.1]];for(let e=0;e<=24;e++){let t=e/24,n=-.6+t*Math.PI*2.6,i=.28*(1-t*.8);r.push([0+Math.cos(n)*i,.68+Math.sin(n)*i,-.1])}r.forEach((t,i)=>i&&Q(e,n,r[i-1],t,.06*(1-i/r.length*.65),6)),e.add(B.dome(10),n,{pos:[.4,0,-.1],scale:[.18,.16,.14]});let i=[-.2,.13,.12];for(let t=0;t<6;t++){let n=t/6*Math.PI*2;e.add(B.sphere(10,6),t%2?`#e8822a`:`#de7420`,{pos:[i[0]+Math.sin(n)*.07,i[1],i[2]+Math.cos(n)*.07],rot:[0,n,0],scale:[.08,.12,.1]})}e.add(B.cyl(6),`#5a7a2a`,{pos:[i[0],i[1]+.13,i[2]],scale:[.015,.06,.015]});let a=$([i[0],i[1],i[2]+.17]);for(let e of[-1,1])t.add(B.cone(3),`#ffd84a`,{pos:[e*.04,.03,0],rot:[Math.PI/2,0,0],scale:[.025,.01,.025]},a);t.add(B.box(),`#ffd84a`,{pos:[0,-.04,0],scale:[.1,.02,.01]},a)},plate:cf(`#5a5660`,.38,`#f2ece0`)},excalibur:{paint(e){sf(e,`#7a766e`,.36),e.add(B.blob(2),`#8e8a82`,{pos:[0,.18,-.04],scale:[.4,.3,.3]}),e.add(B.box(),`#9a968e`,{pos:[0,.36,-.04],scale:[.5,.16,.36]}),e.add(B.box(),`#c8ccd2`,{pos:[0,.56,-.04],scale:[.06,.3,.012]}),e.add(B.box(),`#c8a040`,{pos:[0,.72,-.04],scale:[.3,.035,.04]}),e.add(B.cyl(8),`#5a3a20`,{pos:[0,.82,-.04],scale:[.022,.16,.022]}),e.add(B.sphere(8,6),`#c8a040`,{pos:[0,.92,-.04],scale:.035}),e.add(B.sphere(6,4),`#3a8af0`,{pos:[0,.72,-.016],scale:[.02,.02,.008]})},plate:cf(`#7a766e`,.36,`#1e1c1a`)},staff:{paint(e,t){e.add(B.box(),`#6a6670`,{pos:[0,.12,0],scale:[.86,.24,.4]}),e.add(B.box(),`#5a5660`,{pos:[0,.02,0],scale:[.6,.04,.38]});for(let t of[-.2,.25])e.add(B.box(),`#3a3640`,{pos:[t,.243,.05],rot:[0,t*3,0],scale:[.18,.004,.012]});Q(e,`#8a8a8e`,[.02,.24,-.04],[-.02,1.2,-.06],.025,6),Q(e,`#8a8a8e`,[-.02,1.2,-.06],[.06,1.3,-.06],.022,6),Q(e,`#8a8a8e`,[.06,1.3,-.06],[.1,1.22,-.06],.02,6),t.add(B.ico(0),`#f4faff`,{pos:[.03,1.21,-.06],scale:[.06,.1,.06]})},plate:{y:.12,z:.202,w:.76,h:.18,bg:`#6a6670`,fg:`#f2f2f6`}},triforce:{paint(e){let t=`#8a92a0`;e.add(B.box(),`#7a8290`,{pos:[0,.06,0],scale:[.7,.12,.3]}),e.add(B.box(),t,{pos:[0,.52,0],scale:[.6,.84,.16]}),e.add(B.prism(),t,{pos:[0,.94,0],rot:[0,Math.PI/2,0],scale:[.16,.22,.6]});let n=.105,r=Math.sqrt(3)*n;for(let[t,i]of[[-r/2,0],[r/2,0],[0,.1575]])e.add(B.cyl(3),`#e8c040`,{pos:[t,.62+i,.09],rot:[-Math.PI/2,0,0],scale:[n,.02,n]})},plate:{y:.33,z:.081,w:.52,h:.2,bg:`#8a92a0`,fg:`#1e2430`}},llama:{paint(e){e.add(B.box(),_f,{pos:[0,.1,0],scale:[.7,.2,.36]});let t=`#6a7ae8`,n=`#9a5ad8`;e.add(B.rbox(.3),t,{pos:[-.04,.48,0],scale:[.46,.22,.24]});for(let t of[-.2,.12])for(let r of[-.08,.08])e.add(B.box(),n,{pos:[t,.29,r],scale:[.06,.2,.06]});e.add(B.box(),t,{pos:[.18,.7,0],rot:[0,0,-.15],scale:[.12,.34,.12]}),e.add(B.rbox(.3),n,{pos:[.24,.86,.03],scale:[.16,.12,.14]});for(let n of[-1,1])e.add(B.box(),t,{pos:[.2,.96,n*.04],rot:[n*.2,0,0],scale:[.03,.1,.03]});for(let t of[-1,1])e.add(B.sphere(6,4),`#1e1e2a`,{pos:[.26,.88,.03+t*.04+.04],scale:.016});e.add(B.box(),`#f26ab8`,{pos:[-.06,.6,0],scale:[.22,.03,.26]});for(let[t,n]of[[.42,`#f2d02a`],[.38,`#f26ab8`],[.34,`#5ad8f0`]])e.add(B.box(),n,{pos:[-.04,t,0],scale:[.47,.03,.25]})},plate:{y:.1,z:.182,w:.62,h:.16,bg:_f,fg:`#1e1c1a`}},pineapplehouse:{paint(e){sf(e,`#c8a86a`,.42),mf(e,.3,.8);for(let t=0;t<7;t++){let n=t/7*Math.PI*2;e.add(B.sphere(8,5),t%2?`#3e8a3a`:`#5aa848`,{pos:[Math.sin(n)*.1,.98,Math.cos(n)*.1],rot:[Math.cos(n)*.5,0,-Math.sin(n)*.5],scale:[.05,.24,.025]})}let t=uf(`archdoor`,.03,e=>{e.moveTo(-1,0),e.lineTo(1,0),e.lineTo(1,1),e.absarc(0,1,1,0,Math.PI,!1),e.closePath()},10);e.add(t,`#3a7a8a`,{pos:[0,.02,.27],scale:[.09,.14,1]});for(let[t,n]of[[-.17,.5],[.14,.62]]){let r=Math.sqrt(Math.max(0,.09-t*t))+.01,i=Math.asin(t/.3);e.add(B.cyl(12),`#8ac8e8`,{pos:[t,n,r],rot:[Math.PI/2,0,-i],scale:[.06,.02,.06]}),hf(e,`#8a9aa8`,[t,n,r+.005],.065,.2,[0,i,0])}},plate:cf(`#c8a86a`,.42,`#3a2410`)},priderock:{paint(e){let t=`#a08a6a`;e.add(B.blob(1),t,{pos:[-.12,.2,-.12],scale:[.36,.3,.3]}),e.add(B.blob(3),`#8e7a5c`,{pos:[-.22,.42,-.16],scale:[.18,.26,.18]}),e.add(B.box(),`#9a8464`,{pos:[0,.12,.19],rot:[-.1,0,0],scale:[.5,.24,.06]});let n=$([-.12,.42,-.08],[0,-.35,.32]);e.add(B.box(),`#b09a78`,{pos:[.3,0,0],scale:[.62,.06,.2]},n),e.add(B.prism(),t,{pos:[.24,-.03,0],rot:[Math.PI,0,0],scale:[.5,.2,.18]},n);let r=$([.5,.06,0],[0,.35,-.32]).premultiply(n);e.add(B.sphere(8,6),`#d8a050`,{pos:[0,.05,0],scale:[.08,.045,.04]},r);for(let t of[-.05,.05])e.add(B.box(),`#d8a050`,{pos:[t,.02,0],scale:[.02,.05,.05]},r);e.add(B.sphere(8,6),`#8a4a20`,{pos:[.07,.1,0],scale:[.045,.05,.045]},r),e.add(B.sphere(8,6),`#e2b060`,{pos:[.09,.1,0],scale:[.03,.03,.028]},r),Q(e,`#d8a050`,[-.08,.06,0],[-.12,.1,0],.008,4)},plate:{y:.13,z:.226,w:.44,h:.18,bg:`#9a8464`,fg:`#2a1e10`,tilt:-.1}},idol:{paint(e){e.add(B.box(),`#7a6a4a`,{pos:[0,.05,0],scale:[.56,.1,.46]}),e.add(B.box(),`#8a7a5a`,{pos:[0,.32,0],scale:[.44,.48,.36]}),e.add(B.box(),`#9a8a68`,{pos:[0,.58,0],scale:[.5,.06,.42]});let t=`#e2b23a`;e.add(B.taper(1.3,10),t,{pos:[0,.7,0],scale:[.08,.18,.07]}),e.add(B.sphere(12,8),t,{pos:[0,.86,0],scale:[.1,.1,.09]});for(let n of[-1,1])e.add(B.sphere(6,4),`#7a5a1a`,{pos:[n*.035,.88,.082],scale:[.02,.012,.008]}),e.add(B.sphere(8,6),t,{pos:[n*.1,.86,0],scale:[.025,.04,.025]}),e.add(B.sphere(8,6),t,{pos:[n*.06,.66,.04],scale:[.03,.04,.04]});e.add(B.box(),`#7a5a1a`,{pos:[0,.83,.088],scale:[.05,.008,.006]}),e.add(B.sphere(10,6),`#c8b080`,{pos:[.4,.08,.1],scale:[.08,.08,.07]}),e.add(B.cone(6),`#c8b080`,{pos:[.4,.17,.1],scale:[.03,.06,.03]})},plate:{y:.33,z:.182,w:.38,h:.2,bg:`#8a7a5a`,fg:`#2a2010`}},witchlegs:{paint(e){let t=new I().makeRotationZ(.12);e.add(B.box(),`#c8b08a`,{pos:[0,.3,-.1],scale:[.64,.5,.5]},t),e.add(B.prism(),`#8a4a3a`,{pos:[0,.55,-.1],scale:[.7,.3,.58]},t),e.add(B.box(),`#6a4a34`,{pos:[.2,.28,.152],scale:[.12,.26,.01]},t),e.add(B.box(),`#a8d0e0`,{pos:[-.2,.4,.152],scale:[.1,.1,.01]},t),e.add(B.box(),`#7a7a7a`,{pos:[.18,.78,-.2],scale:[.08,.16,.08]},t);for(let t of[-1,1]){let n=t*.07-.04;for(let t=0;t<5;t++)e.add(B.cyl(8),t%2?`#f6f2ec`:`#d8202a`,{pos:[n,.035,.18+t*.05],rot:[Math.PI/2,0,0],scale:[.025,.05,.025]});e.add(B.sphere(8,6),`#c81838`,{pos:[n,.04,.46],scale:[.035,.03,.05]}),e.add(B.sphere(6,4),`#ff6a8a`,{pos:[n,.07,.46],scale:.012})}},plate:{y:.24,z:.152,w:.26,h:.14,bg:`#c8b08a`,fg:`#3a2410`,roll:.12}},amber:{paint(e,t){e.add(B.box(),`#1e1e22`,{pos:[0,.1,0],scale:[.48,.2,.36]}),e.add(B.cyl(10),`#2a2a2e`,{pos:[0,.38,0],scale:[.04,.4,.04]}),e.add(B.cyl(10),`#c8a040`,{pos:[0,.58,0],scale:[.07,.04,.07]}),t.add(B.dodeca(),`#f0a030`,{pos:[0,.82,0],rot:[.3,.4,0],scale:[.22,.26,.19]});let n=$([0,.84,.2]);e.add(B.sphere(6,4),`#3a2010`,{pos:[0,0,0],scale:[.01,.04,.01]},n),e.add(B.sphere(6,4),`#3a2010`,{pos:[0,.045,0],scale:.012},n);for(let t=0;t<3;t++)for(let r of[-1,1])e.add(B.box(),`#3a2010`,{pos:[r*.025,.01-t*.015,0],rot:[0,0,r*(.6-t*.5)],scale:[.05,.004,.004]},n);for(let t of[-1,1])e.add(B.box(),`#8a6a4a`,{pos:[t*.02,.025,.004],rot:[0,0,t*.5],scale:[.03,.012,.002]},n)},plate:{y:.1,z:.182,w:.44,h:.16,bg:`#1e1e22`,fg:`#f0c060`}},hobbitdoor:{paint(e){sf(e,`#a07a4a`,.44),e.add(B.dome(18),`#5a9a3a`,{pos:[0,0,-.14],scale:[.56,.62,.4]}),hf(e,`#9a8a6a`,[0,.28,.2],.24,.12),e.add(B.cyl(18),`#2a7a3a`,{pos:[0,.28,.2],rot:[Math.PI/2,0,0],scale:[.23,.03,.23]}),e.add(B.sphere(8,6),`#e2b23a`,{pos:[0,.28,.225],scale:.025});for(let t=0;t<6;t++)e.add(B.box(),`#24683a`,{pos:[0,.28,.217],rot:[0,0,t/6*Math.PI],scale:[.44,.006,.004]});e.add(B.cyl(12),`#a8d0e0`,{pos:[.36,.34,.06],rot:[Math.PI/2,.8,0],scale:[.07,.02,.07]}),hf(e,`#6a4a2a`,[.365,.34,.065],.075,.2,[0,.8,0]);for(let[t,n]of[[-.32,`#f2c42a`],[-.26,`#e2302a`],[.28,`#f2f2f2`]])e.add(B.sphere(6,4),n,{pos:[t,.05,.22],scale:.03})},plate:cf(`#a07a4a`,.44,`#2a1a0a`)},lasersword:{paint(e,t){sf(e,`#5a5660`,.36),e.add(B.dodeca(),`#6a6670`,{pos:[0,.16,-.04],scale:[.34,.22,.28]});let n=$([.02,.32,-.04],[0,0,-.18]);e.add(B.cyl(10),`#c8ccd2`,{pos:[0,.04,0],scale:[.032,.18,.032]},n);for(let t=0;t<4;t++)e.add(B.cyl(10),`#1e1e22`,{pos:[0,0+t*.03,0],scale:[.035,.012,.035]},n);e.add(B.cyl(10),`#8a8e96`,{pos:[0,.14,0],scale:[.04,.03,.04]},n),t.add(B.cyl(10),`#9be7ff`,{pos:[0,.52,0],scale:[.03,.74,.03]},n),t.add(B.sphere(10,6),`#d8f8ff`,{pos:[0,.89,0],scale:.03},n)},plate:cf(`#5a5660`,.36,`#d8f4ff`)},thumbsup:{paint(e,t){e.add(B.torus(.25,6,20),`#3a3634`,{pos:[0,.03,-.02],rot:[Math.PI/2,0,0],scale:[.4,.4,.2]}),t.add(B.cyl(20),`#ff8a20`,{pos:[0,.03,-.02],scale:[.38,.03,.38]});for(let[e,n,r]of[[.12,.1,.08],[-.15,-.12,.06],[-.05,.16,.05]])t.add(B.sphere(8,4),`#ffd25a`,{pos:[e,.04,n],scale:[r,.012,r]});let n=`#a8acb4`;Q(e,n,[0,.02,-.04],[.02,.5,-.02],.065,10),e.add(B.rbox(.3),n,{pos:[.02,.57,-.02],scale:[.14,.13,.12]});for(let t=0;t<4;t++)e.add(B.box(),`#7a7e86`,{pos:[.02,.53+t*.03,.04],scale:[.12,.004,.004]});e.add(B.rbox(.3),n,{pos:[.03,.7,-.02],rot:[0,0,-.1],scale:[.05,.14,.05]}),t.add(B.sphere(8,6),`#ff6a2a`,{pos:[.02,.07,-.02],scale:[.1,.03,.1]}),sf(e,`#5a5452`,.48)},plate:cf(`#5a5452`,.48,`#f2c8a0`)},pepperpot:{paint(e,t){sf(e,`#4a4a4e`,.44),e.add(B.box(),`#2a2a2e`,{pos:[0,.04,0],scale:[.62,.08,.6]}),e.add(B.taper(.62,8),`#a8763a`,{pos:[0,.32,0],rot:[0,Math.PI/8,0],scale:[.3,.48,.3]});for(let t=0;t<6;t++){let n=-Math.PI/2+t/5*Math.PI;for(let t=0;t<3;t++){let r=.16+t*.13,i=.27-(r-.08)*.24+.005;e.add(B.sphere(8,5),`#d8a050`,{pos:[Math.sin(n)*i,r,Math.cos(n)*i],scale:.035})}}e.add(B.cyl(14),`#6a5030`,{pos:[0,.6,0],scale:[.2,.08,.2]}),e.add(B.cyl(8),`#c8c8cc`,{pos:[-.09,.6,.27],rot:[Math.PI/2,0,0],scale:[.015,.2,.015]}),e.add(B.dome(10),`#1e1e22`,{pos:[-.09,.6,.38],rot:[-Math.PI/2,0,0],scale:[.05,.025,.05]}),e.add(B.cyl(6),`#3a3a3e`,{pos:[.09,.6,.25],rot:[Math.PI/2,0,0],scale:[.01,.16,.01]});for(let t=0;t<3;t++)e.add(B.cyl(14),t%2?`#3a3a3e`:`#9a9aa0`,{pos:[0,.67+t*.03,0],scale:[.17-t*.005,.025,.17-t*.005]});e.add(B.dome(14),`#9a9aa0`,{pos:[0,.75,0],scale:[.16,.15,.16]}),Q(e,`#3a3a3e`,[0,.8,.12],[0,.82,.26],.01,4),e.add(B.cyl(10),`#3a6ae8`,{pos:[0,.82,.27],rot:[Math.PI/2,0,0],scale:[.025,.01,.025]});for(let e of[-1,1])t.add(B.cyl(8),`#ffe880`,{pos:[e*.1,.9,0],rot:[0,0,e*-.5],scale:[.02,.05,.02]})},plate:cf(`#4a4a4e`,.44,`#f2e2a0`)},onering:{paint(e,t){e.add(B.box(),`#3a3434`,{pos:[0,.24,0],scale:[.46,.48,.36]}),e.add(B.box(),`#2a2626`,{pos:[0,.05,0],scale:[.54,.1,.44]}),e.add(B.cyl(14),`#4a4444`,{pos:[0,.5,0],scale:[.12,.04,.12]}),e.add(B.torus(.14,8,24),`#f2c440`,{pos:[0,.72,0],scale:.18});for(let[e,n,r]of[[-.17,.42,.8],[.15,.4,-.6],[.2,.22,.2]])t.add(B.box(),`#ff7a20`,{pos:[e,n,.181],rot:[0,0,r],scale:[.09,.008,.004]});t.add(B.torus(.04,4,24),`#ffb040`,{pos:[0,.72,.02],scale:.18})},plate:{y:.27,z:.181,w:.4,h:.2,bg:`#3a3434`,fg:`#f0c060`}},darkhelm:{paint(e){let t=`#18181c`;e.add(B.box(),`#3a3a40`,{pos:[0,.2,0],scale:[.48,.4,.38]}),e.add(B.box(),`#2a2a30`,{pos:[0,.42,0],scale:[.52,.04,.42]}),e.add(B.taper(.62,14),t,{pos:[0,.56,-.04],scale:[.27,.24,.25]}),e.add(B.sphere(14,10),t,{pos:[0,.7,-.03],scale:[.2,.2,.21]}),e.add(B.box(),t,{pos:[0,.74,.14],rot:[.35,0,0],scale:[.3,.05,.1]});let n=`#34343c`;e.add(B.box(),n,{pos:[0,.6,.17],rot:[.1,0,0],scale:[.24,.2,.08]});for(let t of[-1,1])e.add(B.box(),`#0c0c10`,{pos:[t*.06,.66,.215],rot:[.1,t*.15,t*-.25],scale:[.1,.055,.02]}),e.add(B.box(),`#8a8a9a`,{pos:[t*.06-.02,.672,.226],rot:[.1,0,t*-.25],scale:[.02,.008,.004]}),e.add(B.box(),n,{pos:[t*.1,.5,.18],rot:[.2,0,t*.5],scale:[.08,.05,.06]});e.add(B.box(),n,{pos:[0,.64,.22],rot:[.1,0,0],scale:[.025,.08,.02]}),e.add(B.cone(3),`#9a9aa4`,{pos:[0,.54,.215],rot:[Math.PI,0,0],scale:[.075,.1,.02]});for(let t=0;t<3;t++)e.add(B.box(),`#1e1e22`,{pos:[-.02+t*.02,.555,.226],scale:[.006,.05,.004]})},plate:{y:.2,z:.192,w:.42,h:.18,bg:`#3a3a40`,fg:`#e8e8f0`}},deathstar:{paint(e){e.add(B.box(),`#2a2a30`,{pos:[0,.1,0],scale:[.5,.2,.4]}),e.add(B.taper(.5,10),`#3a3a40`,{pos:[0,.27,0],scale:[.08,.16,.08]});let t=[0,.66,-.02];e.add(B.sphere(18,12),`#9a9ea6`,{pos:t,scale:.32}),e.add(B.cyl(24),`#4a4e56`,{pos:t,scale:[.322,.025,.322]});let n=new x(.45,.5,.74).normalize(),r=new O().setFromUnitVectors(Wd,n),i=new x(...t).addScaledVector(n,.3);e.add(B.cyl(16),`#6a6e76`,new I().compose(i,r,new x(.1,.03,.1))),e.add(B.dome(12),`#7a7e86`,new I().compose(i.clone().addScaledVector(n,-.005),r.clone().multiply(new O().setFromAxisAngle($d,Math.PI)),new x(.08,.02,.08))),e.add(B.sphere(6,4),`#3a3e46`,new I().compose(i.clone().addScaledVector(n,.012),r,new x(.015,.015,.015)));for(let n=0;n<10;n++){let r=n*2.39996,i=n*.37%1*1.4-.7,a=Math.sqrt(1-i*i),o=new x(Math.sin(r)*a,i,Math.cos(r)*a),s=new O().setFromUnitVectors(Wd,o);e.add(B.box(),`#82868e`,new I().compose(o.multiplyScalar(.322).add(new x(...t)),s,new x(.06,.006,.03)))}},plate:{y:.1,z:.202,w:.44,h:.16,bg:`#2a2a30`,fg:`#d8dce4`}},phonebox:{paint(e,t){let n=`#1a3468`;e.add(B.box(),n,{pos:[0,.03,0],scale:[.62,.06,.62]}),e.add(B.box(),`#1f3f7a`,{pos:[0,.6,0],scale:[.52,1.1,.52]});for(let t of[-1,1])for(let r of[-1,1])e.add(B.box(),n,{pos:[t*.27,.62,r*.27],scale:[.07,1.16,.07]});e.add(B.box(),n,{pos:[0,1.22,0],scale:[.6,.06,.6]}),e.add(B.box(),n,{pos:[0,1.28,0],scale:[.48,.06,.48]}),e.add(B.cyl(10),`#2a2a30`,{pos:[0,1.33,0],scale:[.05,.04,.05]}),t.add(B.cyl(10),`#eaf2ff`,{pos:[0,1.39,0],scale:[.04,.09,.04]}),e.add(B.cone(10),n,{pos:[0,1.46,0],scale:[.05,.05,.05]});for(let r of ef([0,.6,0],.52,1.1,.52,!1)){e.add(B.box(),`#121218`,{pos:[0,.52,.004],scale:[.48,.09,.008]},r),e.add(B.box(),n,{pos:[0,0,.003],scale:[.02,1,.006]},r);for(let n of[-1,1]){for(let t of[0,1,2])e.add(B.box(),`#2a4a88`,{pos:[n*.115,-.38+t*.22,.003],scale:[.18,.18,.006]},r);for(let e of[-1,0,1])for(let i of[-1,1])t.add(B.box(),`#f2f4ee`,{pos:[n*.115+e*.055,.3+i*.04,.006],scale:[.045,.035,.004]},r)}}e.add(B.box(),`#f2f2ee`,{pos:[-.115,.08,.265],scale:[.12,.12,.006]})},plate:{y:1.12,z:.268,w:.46,h:.085,bg:`#121218`,fg:`#f2f4f6`}}},yf={...nf,F:[`###`,`#..`,`##.`,`#..`,`#..`],Y:[`#.#`,`#.#`,`.#.`,`.#.`,`.#.`],U:[`#.#`,`#.#`,`#.#`,`#.#`,`###`],D:[`##.`,`#.#`,`#.#`,`#.#`,`##.`],I:[`###`,`.#.`,`.#.`,`.#.`,`###`],W:[`#...#`,`#...#`,`#.#.#`,`##.##`,`#...#`],S:[`###`,`#..`,`###`,`..#`,`###`],T:[`###`,`.#.`,`.#.`,`.#.`,`.#.`],N:[`#..#`,`##.#`,`#.##`,`#..#`,`#..#`],9:[`###`,`#.#`,`###`,`..#`,`###`],"%":[`##..#`,`##.#.`,`..#..`,`.#.##`,`#..##`],":":[`.`,`#`,`.`,`#`,`.`],"(":[`.#`,`#.`,`#.`,`#.`,`.#`],Z:[`###`,`..#`,`.#.`,`#..`,`###`]};function bf(e,t,n,r,i,a=r*.5){let o=[``,``,``,``,``];for(let e of t)yf[e].forEach((e,t)=>o[t]+=(o[t]?`.`:``)+e);tf(e,o,n,r,i,a)}function xf(e,t,n){let r=`#1e1e26`,i=$([0,0,0],[0,0,n]).premultiply(t);for(let t of[-1,1])e.add(B.box(),r,{pos:[t*.035,.13,t*n*.1],rot:[t*.25,0,0],scale:[.045,.26,.05]},i),e.add(B.box(),`#0e0e10`,{pos:[t*.035,.01,.02+t*n*.1],scale:[.05,.025,.09]},i);e.add(B.box(),r,{pos:[0,.36,0],scale:[.13,.22,.08]},i),e.add(B.box(),`#f4f4f0`,{pos:[0,.4,.041],scale:[.03,.12,.004]},i),e.add(B.sphere(8,6),`#6a4430`,{pos:[0,.53,0],scale:[.05,.06,.05]},i),e.add(B.box(),`#0e0e10`,{pos:[0,.54,.042],scale:[.07,.016,.01]},i),e.add(B.cyl(10),r,{pos:[0,.6,0],scale:[.05,.04,.05]},i),e.add(B.cyl(10),r,{pos:[0,.582,0],scale:[.075,.008,.075]},i);for(let t of[-1,1])e.add(B.box(),r,{pos:[t*.08,.5,0],rot:[0,0,t*-.2],scale:[.035,.16,.04]},i),e.add(B.sphere(6,4),`#f6f6f2`,{pos:[t*.095,.585,0],scale:.022},i)}function Sf(e,t,n,r,i=0,a=.14){e.add(B.box(),t,{pos:[0,r/2,i],scale:[n,r,a]}),e.add(B.cyl(20),t,{pos:[0,r,i],rot:[Math.PI/2,0,0],scale:[n/2,a,n/2]})}var Cf=`#9a968e`,wf=`#8a8680`,Tf=`#1e1c1a`,Ef={whoopee(e){let t=`#e86a9a`;e.add(B.sphere(18,10),t,{pos:[0,.21,0],scale:[.38,.21,.36]}),hf(e,`#c8487a`,[0,.21,0],.37,.04,[Math.PI/2,0,0]),e.add(B.taper(.55,12),t,{pos:[0,.1,.4],rot:[Math.PI/2+.3,0,0],scale:[.07,.16,.05]}),e.add(B.cyl(12),`#c8487a`,{pos:[0,.08,.48],rot:[Math.PI/2+.3,0,0],scale:[.045,.02,.035]});for(let[t,n,r,i]of[[.04,.1,.6,.05],[-.03,.14,.68,.04],[.05,.17,.75,.03]])e.add(B.sphere(8,6),`#c8e0a8`,{pos:[t,n,r],scale:i})},paintcan(e){e.add(B.cyl(18),`#b8bcc4`,{pos:[0,.2,0],scale:[.27,.4,.27]}),e.add(B.cyl(18),`#d0d4da`,{pos:[0,.405,0],scale:[.275,.03,.275]});for(let t of[.04,.38])e.add(B.cyl(18),`#9aa0a8`,{pos:[0,t,0],scale:[.278,.03,.278]});e.add(B.cyl(18),`#f4f0e6`,{pos:[0,.2,0],scale:[.274,.2,.274]}),e.add(B.box(),`#2a5ad8`,{pos:[0,.2,.26],rot:[0,0,0],scale:[.2,.12,.03]});for(let t=0;t<9;t++){let n=.3+t*.7,r=.06+t*.37%1*.16;e.add(B.box(),`#2a5ad8`,{pos:[Math.sin(n)*.278,.42-r/2,Math.cos(n)*.278],rot:[0,n,0],scale:[.05,r,.012]}),e.add(B.sphere(6,4),`#2a5ad8`,{pos:[Math.sin(n)*.278,.42-r,Math.cos(n)*.278],scale:[.028,.03,.02]})}e.add(Kd(.03,Math.PI,6,12),`#6a6e74`,{pos:[0,.4,0],rot:[-2.2,0,0],scale:.27}),Q(e,`#c8a878`,[0,.52,-.24],[0,1.24,-.42],.012,4),Q(e,`#6e4a2a`,[0,0,-.44],[0,1.3,-.44],.035,6),e.add(B.box(),`#6e4a2a`,{pos:[0,1.28,-.4],scale:[.06,.06,.14]}),e.add(B.cyl(16),`#2a5ad8`,{pos:[.24,.004,.3],scale:[.16,.008,.12]})},lawnchair(e){let t=`#c4c8ce`,n=[`#3a9a5a`,`#f4f4ee`];for(let n of[-1,1])Q(e,t,[n*.27,.4,-.26],[n*.27,.4,.26],.015),Q(e,t,[n*.27,.4,.24],[n*.27,0,-.18],.015),Q(e,t,[n*.27,.4,-.24],[n*.27,0,.2],.015),Q(e,t,[n*.27,.4,-.26],[n*.27,1,-.42],.015),Q(e,t,[n*.29,.62,.2],[n*.29,.62,-.32],.015),Q(e,t,[n*.29,.62,.2],[n*.27,.4,.22],.015);for(let t=0;t<6;t++)e.add(B.box(),n[t%2],{pos:[0,.41,-.22+t*.09],scale:[.54,.012,.075]});for(let t=0;t<6;t++){let r=(t+.5)/6;e.add(B.box(),n[t%2],{pos:[0,.42+r*.58,-.26-r*.16],rot:[-.27,0,0],scale:[.54,.08,.012]})}for(let t of[-1,1])e.add(B.cyl(12),`#1a1a22`,{pos:[t*.07,.98,-.4],rot:[Math.PI/2-.27,0,0],scale:[.055,.012,.045]});e.add(B.box(),`#1a1a22`,{pos:[0,.99,-.4],scale:[.04,.01,.01]}),e.add(B.taper(1.2,10),`#f2a83a`,{pos:[.29,.69,.08],scale:[.04,.12,.04]}),Q(e,`#e8e8e8`,[.29,.7,.08],[.31,.86,.08],.004,4),e.add(B.cone(8),`#e83a6a`,{pos:[.31,.87,.08],scale:[.07,.035,.07]})},cheese(e){let t=uf(`cheesewedge`,.4,e=>{e.moveTo(0,.38),e.absarc(0,.38,.74,-Math.PI/2-.42,-Math.PI/2+.42,!1),e.lineTo(0,.38)},10);e.add(t,`#f6c83a`,{pos:[0,.2,0],rot:[-Math.PI/2,0,0]});let n=`#d89a1a`;for(let[t,r,i]of[[.1,.12,.05],[-.12,.2,.04],[.02,-.12,.035],[-.06,.02,.03]])e.add(B.cyl(12),n,{pos:[t,.4,r],scale:[i,.004,i]});for(let t=0;t<6;t++){let r=-.36+t*.15;e.add(B.sphere(10,6),n,{pos:[Math.sin(r)*.37,.1+t*.53%1*.22,-.36+Math.cos(r)*.74-.01],scale:[.04,.04,.02]})}let r=$([.08,0,-.42],[0,.7,0]);e.add(B.sphere(10,8),`#9a9aa4`,{pos:[0,.07,0],scale:[.06,.06,.09]},r),e.add(B.sphere(10,8),`#9a9aa4`,{pos:[0,.1,.08],scale:[.04,.04,.05]},r);for(let t of[-1,1])e.add(B.cyl(10),`#e8a8b8`,{pos:[t*.035,.15,.07],rot:[Math.PI/2,0,0],scale:[.025,.006,.025]},r);e.add(B.sphere(6,4),`#e86a8a`,{pos:[0,.1,.13],scale:.01},r),Q(e,`#c88a9a`,[.08-.08*Math.sin(.7),.05,-.42-.08*Math.cos(.7)],[-.02,.1,-.6],.006,4)},couchpotato(e){e.add(B.sphere(16,10),`#b88a52`,{pos:[0,.2,0],scale:[.4,.22,.32]}),Qd(e,`#7a5a30`,[0,.18,0],[.4,.22,.32],8,.03,2,.05),e.add(B.rbox(.3),`#c83a3a`,{pos:[0,.41,0],scale:[.4,.06,.34]});for(let t of[-1,1])e.add(B.box(),`#e8d040`,{pos:[t*.1,.442,0],scale:[.02,.004,.34]});e.add(B.cone(5),`#9ac04a`,{pos:[-.36,.3,.1],rot:[0,0,.9],scale:[.02,.07,.02]}),e.add(B.rbox(.3),`#2a2a30`,{pos:[.32,.02,.32],rot:[0,.5,0],scale:[.07,.03,.2]});for(let t=0;t<4;t++)e.add(B.cyl(6),t?`#9a9aa8`:`#d82a2a`,{pos:[.32+Math.sin(.5)*(.07-t*.04),.04,.32+Math.cos(.5)*(.07-t*.04)],scale:[.012,.01,.012]});e.add(B.taper(1.5,14),`#e8e8f0`,{pos:[-.32,.04,.3],scale:[.08,.08,.08]});for(let t=0;t<6;t++)e.add(B.cyl(8),`#f2c84a`,{pos:[-.32+Math.sin(t*2.4)*.05,.09,.3+Math.cos(t*2.4)*.05],rot:[t*.5,0,t*.3],scale:[.035,.005,.03]})},rubberduck(e){let t=`#f6d22a`;e.add(B.sphere(18,12),t,{pos:[0,.2,0],scale:[.42,.22,.32]}),e.add(B.cone(10),t,{pos:[-.4,.34,0],rot:[0,0,1.1],scale:[.12,.2,.1]}),e.add(B.sphere(14,10),t,{pos:[.3,.6,0],scale:[.17,.17,.16]}),e.add(B.cyl(12),t,{pos:[.3,.42,0],scale:[.12,.12,.12]}),e.add(B.sphere(10,6),`#f08a1a`,{pos:[.47,.56,0],scale:[.1,.035,.08]}),e.add(B.sphere(10,6),`#e0701a`,{pos:[.45,.53,0],scale:[.08,.025,.065]});for(let t of[-1,1])e.add(B.sphere(8,6),`#ffffff`,{pos:[.4,.66,t*.08],scale:[.035,.04,.03]}),e.add(B.sphere(6,4),`#1a1a1a`,{pos:[.43,.66,t*.09],scale:[.018,.022,.016]}),e.add(B.sphere(10,6),`#e8be1a`,{pos:[-.04,.24,t*.29],rot:[t*.3,0,.3],scale:[.2,.08,.05]})},cupcake(e){e.add(B.taper(1.25,18),`#f08ab0`,{pos:[0,.13,0],scale:[.26,.26,.26]});for(let t=0;t<18;t++){let n=t/18*Math.PI*2;Q(e,`#d86a94`,[Math.sin(n)*.262,.005,Math.cos(n)*.262],[Math.sin(n)*.327,.26,Math.cos(n)*.327],.012,4)}e.add(B.sphere(18,10),`#c88a52`,{pos:[0,.26,0],scale:[.33,.05,.33]}),e.add(B.dome(18),`#fbe4ee`,{pos:[0,.27,0],scale:[.34,.15,.34]}),hf(e,`#f6d0e0`,[0,.29,0],.32,.12,[Math.PI/2,0,0]);let t=[`#e83a3a`,`#3ab8e8`,`#f2d02a`,`#5ad06a`,`#a05ae8`];for(let n=0;n<22;n++){let r=n*2.39996,i=.06+n*.618%1*.24,a=.27+.15*Math.sqrt(Math.max(0,1-(i/.34)**2))+.004;e.add(B.box(),t[n%5],{pos:[Math.sin(r)*i,a,Math.cos(r)*i],rot:[0,r*1.7,0],scale:[.04,.012,.012]})}e.add(B.sphere(12,8),`#d8102a`,{pos:[0,.44,-.25],scale:.07}),Q(e,`#5a8a2a`,[0,.5,-.25],[.04,.62,-.3],.008,4)},pancakes(e){e.add(B.cyl(20),`#f4f4f0`,{pos:[0,.015,0],scale:[.38,.03,.38]});for(let t=0;t<6;t++){let n=Math.sin(t*2.1)*.015,r=Math.cos(t*1.7)*.015;e.add(B.cyl(18),`#c8823a`,{pos:[n,.06+t*.062,r],scale:[.31,.058,.31]}),e.add(B.cyl(18),`#e8b060`,{pos:[n,.06+t*.062+.026,r],scale:[.3,.008,.3]})}let t=`#8a3a10`;e.add(B.cyl(18),t,{pos:[0,.405,0],scale:[.26,.012,.26]});for(let n=0;n<8;n++){let r=n*.8+.2,i=.08+n*.41%1*.22;e.add(B.box(),t,{pos:[Math.sin(r)*.312,.41-i/2,Math.cos(r)*.312],rot:[0,r,0],scale:[.05,i,.01]}),e.add(B.sphere(6,4),t,{pos:[Math.sin(r)*.312,.41-i,Math.cos(r)*.312],scale:[.028,.03,.02]})}e.add(B.box(),`#f8e07a`,{pos:[.08,.43,-.16],rot:[0,.4,0],scale:[.1,.04,.08]}),Q(e,`#c8ccd2`,[-.12,.3,-.2],[-.16,.66,-.3],.012,4);for(let t=-1;t<=1;t++)Q(e,`#c8ccd2`,[-.16+t*.015,.64,-.3],[-.17+t*.015,.76,-.32],.005,4)},lava(e){e.add(B.cyl(20),`#e2501a`,{pos:[0,.008,0],scale:[.5,.016,.5]});for(let t=0;t<9;t++){let n=t*2.2,r=.3+t*.37%1*.16;e.add(B.sphere(8,5),t%3?`#f6a01a`:`#ffd84a`,{pos:[Math.sin(n)*r,.016,Math.cos(n)*r],scale:[.06,.01,.04]})}for(let[t,n]of[[.38,.22],[-.4,-.18]])e.add(B.sphere(8,5),`#3a3434`,{pos:[t,.02,n],scale:[.08,.04,.07]});for(let[t,n]of[[.2,.38],[-.3,.3]])e.add(B.dome(10),`#ffb02a`,{pos:[t,.012,n],scale:[.03,.03,.03]});let t=[`#5a7ab8`,`#6a8ac8`,`#4a6aa8`];for(let n=0;n<3;n++)e.add(B.rbox(.35),t[n],{pos:[Math.sin(n*2)*.02,.07+n*.13,Math.cos(n*2)*.02],rot:[0,n*.3-.3,0],scale:[.5,.13,.42]}),e.add(B.box(),`#8aa8e0`,{pos:[Math.sin(n*2)*.02,.07+n*.13,Math.cos(n*2)*.02],rot:[0,n*.3-.3,0],scale:[.51,.012,.43]})},trolley(e){let t=`#b8bec6`;for(let[n,r]of[[-.22,-.26],[.22,-.26],[-.2,.3],[.2,.3]])e.add(B.cyl(10),`#2a2a30`,{pos:[n,.05,r],rot:[0,0,Math.PI/2],scale:[.05,.03,.05]}),Q(e,t,[n,.05,r],[n,.42,r],.012,4);for(let n of[-1,1])Q(e,t,[n*.22,.1,-.26],[n*.2,.1,.3],.012,4);e.add(B.box(),`#8a9098`,{pos:[0,.405,.02],scale:[.5,.03,.64]});let n=e=>.62+(e+.3)*.15;for(let r of[-1,1]){Q(e,t,[r*.25,n(-.3),-.3],[r*.25,n(.34),.34],.01,4);for(let i=0;i<=8;i++){let a=-.3+i/8*.64;Q(e,t,[r*.25,.42,a],[r*.25,n(a),a],.005,3)}}Q(e,t,[-.25,n(.34),.34],[.25,n(.34),.34],.01,4);for(let r=0;r<=6;r++)Q(e,t,[-.25+r/6*.5,.42,.34],[-.25+r/6*.5,n(.34),.34],.005,3);Q(e,t,[-.25,n(-.3),-.3],[.25,n(-.3),-.3],.01,4);for(let r=0;r<=6;r++)Q(e,t,[-.25+r/6*.5,.42,-.3],[-.25+r/6*.5,n(-.3),-.3],.005,3);for(let r of[-1,1])Q(e,t,[r*.25,n(-.3),-.3],[r*.25,.78,-.44],.012,4);Q(e,`#d82a2a`,[-.27,.78,-.44],[.27,.78,-.44],.025,8)},hamster(e){let t=.88,n=.46;for(let r of[-1,1]){hf(e,`#4ab0e8`,[r*.28,t,0],n,.04,[0,Math.PI/2,0]),Q(e,`#3a8ac0`,[r*.32,t,0],[r*.36,0,.32],.025),Q(e,`#3a8ac0`,[r*.32,t,0],[r*.36,0,-.32],.025);for(let i=0;i<3;i++){let a=i/3*Math.PI*2+.5;Q(e,`#3a8ac0`,[r*.28,t,0],[r*.28,t+Math.sin(a)*n,Math.cos(a)*n],.01,4)}}Q(e,`#3a8ac0`,[-.34,t,0],[.34,t,0],.03);for(let r=0;r<26;r++){let i=r/26*Math.PI*2;Q(e,`#d8dce2`,[-.28,t+Math.sin(i)*n,Math.cos(i)*n],[.28,t+Math.sin(i)*n,Math.cos(i)*n],.014,4)}let r=$([.32,0,.36],[0,-.4,0]);e.add(B.sphere(12,8),`#e8a85a`,{pos:[0,.08,0],scale:[.08,.075,.1]},r),e.add(B.sphere(10,6),`#fbf0e0`,{pos:[0,.06,.04],scale:[.06,.05,.07]},r);for(let t of[-1,1])e.add(B.sphere(6,4),`#e89aa8`,{pos:[t*.045,.15,.04],scale:[.025,.025,.012]},r),e.add(B.sphere(6,4),`#1a1a1a`,{pos:[t*.03,.1,.09],scale:.01},r)},tnt(e){e.add(B.box(),`#b8884a`,{pos:[0,.21,0],scale:[.52,.42,.46]}),ef([0,.21,0],.52,.42,.46,!1).forEach(t=>{for(let n of[-.17,.17])e.add(B.box(),`#8a6230`,{pos:[0,n,.006],scale:[.52,.05,.012]},t);e.add(B.box(),`#9a7038`,{pos:[0,0,.004],rot:[0,0,.6],scale:[.5,.04,.008]},t)}),bf(e,`TNT`,`#c8202a`,.03,$([0,.21,.236]),.006);for(let t=0;t<3;t++)e.add(B.cyl(10),`#d8302a`,{pos:[-.06+t*.06,.6,-.3],scale:[.03,.36,.03]});e.add(B.box(),`#2a2a2a`,{pos:[0,.62,-.3],scale:[.2,.03,.07]}),Q(e,`#2a2a2a`,[0,.78,-.3],[.06,.88,-.28],.005,4),e.add(B.sphere(6,4),`#ffd84a`,{pos:[.06,.89,-.28],scale:.02});let t=$([.4,0,.12]);e.add(B.box(),`#a03a2a`,{pos:[0,.08,0],scale:[.14,.16,.12]},t),Q(e,`#5a5a5a`,[0,.16,0],[0,.32,0],.012,4),e.add(B.box(),`#3a3a3a`,{pos:[0,.32,0],scale:[.14,.025,.025]},t),Q(e,`#2a2a2a`,[.35,.02,.12],[.2,.01,.3],.006,3)},meltclock(e){e.add(B.taper(.85,14),`#c8b08a`,{pos:[0,.19,0],scale:[.27,.38,.27]});let t=`#d8a83a`,n=`#e8e2c8`;e.add(B.cyl(20),t,{pos:[0,.395,0],scale:[.33,.03,.33]}),e.add(B.cyl(20),n,{pos:[0,.41,0],scale:[.3,.008,.3]});for(let t=0;t<12;t++){let n=t/12*Math.PI*2;e.add(B.box(),`#3a3020`,{pos:[Math.sin(n)*.25,.415,Math.cos(n)*.25],rot:[0,n,0],scale:[.01,.004,.035]})}for(let r=0;r<4;r++){let i=r/3,a=.37-i*.2,o=.3+Math.sin(i*1.2)*.04;e.add(B.box(),t,{pos:[0,a,o],rot:[.3+i*1.1,0,0],scale:[.36-i*.12,.03,.1]}),e.add(B.box(),n,{pos:[0,a+.012,o+.008],rot:[.3+i*1.1,0,0],scale:[.32-i*.12,.01,.09]})}e.add(B.sphere(10,6),t,{pos:[0,.13,.36],scale:[.08,.06,.04]}),Q(e,`#a8906a`,[-.18,.3,-.18],[-.24,1,-.36],.03,6),Q(e,`#a8906a`,[-.24,1,-.36],[.02,1.12,-.38],.02,6),e.add(B.box(),t,{pos:[0,1.13,-.38],rot:[0,0,.1],scale:[.18,.02,.12]});for(let n=0;n<3;n++)e.add(B.box(),t,{pos:[.1+n*.012,1.08-n*.07,-.38],rot:[0,0,1.4-n*.15],scale:[.08,.02,.12]});e.add(B.box(),n,{pos:[.115,1.03,-.31],rot:[0,0,1.4],scale:[.18,.06,.006]});for(let[t,n]of[[.1,.08],[.14,.12],[.08,.14]])e.add(B.sphere(6,4),`#1a1a1a`,{pos:[t,.418,n],scale:[.018,.008,.012]})},massage(e){let t=`#3a3436`;e.add(B.box(),`#2a2628`,{pos:[0,.18,-.02],scale:[.56,.36,.56]}),e.add(B.rbox(.25),t,{pos:[0,.38,0],scale:[.48,.1,.5]}),e.add(B.rbox(.25),t,{pos:[0,.82,-.34],rot:[-.2,0,0],scale:[.5,.86,.16]});for(let t=0;t<4;t++)for(let n of[-1,1])e.add(B.sphere(10,6),`#4a4446`,{pos:[n*.09,.56+t*.16,-.25+t*.033],scale:[.07,.06,.04]});e.add(B.rbox(.3),t,{pos:[0,1.28,-.4],rot:[-.2,0,0],scale:[.36,.16,.14]});for(let n of[-1,1])e.add(B.rbox(.25),t,{pos:[n*.31,.46,-.04],scale:[.14,.3,.6]}),e.add(B.box(),`#c8ccd2`,{pos:[n*.31,.32,-.04],scale:[.145,.02,.605]});for(let t=0;t<3;t++)e.add(B.cyl(8),[`#3ad06a`,`#f2c42a`,`#d83a3a`][t],{pos:[.31,.615,.12+t*.05],scale:[.016,.01,.016]});e.add(B.box(),`#1a1a1e`,{pos:[.31,.612,.02],scale:[.08,.004,.06]}),e.add(B.rbox(.25),t,{pos:[0,.18,.36],rot:[.35,0,0],scale:[.4,.34,.14]});for(let t of[-1,1])e.add(B.box(),`#2a2628`,{pos:[t*.1,.2,.4],rot:[.35,0,0],scale:[.012,.3,.1]})},kart(e){let t=`#d82a2a`;for(let[t,n,r]of[[-.3,-.26,.12],[.3,-.26,.12],[-.28,.3,.1],[.28,.3,.1]])e.add(B.cyl(14),`#1e1e22`,{pos:[t,r,n],rot:[0,0,Math.PI/2],scale:[r,.12,r]}),e.add(B.cyl(10),`#d8dce2`,{pos:[t+Math.sign(t)*.062,r,n],rot:[0,0,Math.PI/2],scale:[r*.5,.01,r*.5]});e.add(B.box(),`#3a3a40`,{pos:[0,.1,.02],scale:[.5,.04,.76]}),e.add(B.rbox(.2),t,{pos:[0,.18,.28],scale:[.36,.14,.3]}),e.add(B.box(),`#f2f2ee`,{pos:[0,.2,.432],scale:[.14,.08,.01]}),e.add(B.rbox(.3),t,{pos:[0,.3,-.06],scale:[.4,.22,.36]}),e.add(B.rbox(.25),`#2a2a30`,{pos:[0,.4,-.06],scale:[.34,.04,.3]}),e.add(B.rbox(.25),`#2a2a30`,{pos:[0,.64,-.24],rot:[-.25,0,0],scale:[.36,.48,.06]}),Q(e,`#6a6a70`,[0,.18,.28],[0,.5,.2],.014,4),e.add(B.torus(.12,6,16),`#1e1e22`,{pos:[0,.52,.19],rot:[-.9,0,0],scale:.09}),Q(e,`#8a8a90`,[-.1,.16,-.36],[-.1,.12,-.44],.02,6);let n=$([.12,0,-.54]);e.add(B.sphere(8,5),`#f2d84a`,{pos:[0,.03,0],scale:[.05,.03,.05]},n);for(let t=0;t<3;t++){let r=t/3*Math.PI*2;e.add(B.sphere(8,5),`#f2d84a`,{pos:[Math.sin(r)*.06,.012,Math.cos(r)*.06],rot:[0,r,0],scale:[.025,.01,.07]},n)}e.add(B.cyl(6),`#6a4a2a`,{pos:[0,.07,0],scale:[.012,.03,.012]},n)},ejector(e){e.add(B.cyl(16),`#4a4e54`,{pos:[0,.03,0],scale:[.3,.06,.3]});for(let t=0;t<5;t++)hf(e,`#c8ccd2`,[0,.08+t*.05,0],.18,.12,[Math.PI/2+.12,0,0]);let t=`#5a6a3a`;e.add(B.rbox(.2),t,{pos:[0,.37,0],scale:[.48,.1,.46]}),e.add(B.rbox(.2),`#3a3a3e`,{pos:[0,.43,.02],scale:[.4,.04,.4]}),e.add(B.rbox(.2),t,{pos:[0,.85,-.27],rot:[-.08,0,0],scale:[.48,.86,.1]}),e.add(B.rbox(.2),`#3a3a3e`,{pos:[0,.8,-.215],rot:[-.08,0,0],scale:[.36,.56,.03]}),e.add(B.box(),`#7a7a6a`,{pos:[0,.98,-.37],scale:[.36,.42,.12]});for(let n of[-1,1])e.add(B.box(),t,{pos:[n*.24,.52,0],scale:[.04,.16,.42]});for(let t=0;t<6;t++)e.add(Kd(.08,Math.PI/6,6,3),t%2?`#1a1a1a`:`#f2c42a`,{pos:[0,1.28,-.24],rot:[0,0,t*Math.PI/6],scale:.14});Q(e,`#5a5e64`,[.4,0,.1],[.4,.46,.1],.025,6),e.add(B.box(),`#3a3a40`,{pos:[.4,.48,.1],scale:[.12,.04,.12]}),e.add(B.cyl(14),`#e2202a`,{pos:[.4,.51,.1],scale:[.04,.03,.04]}),e.add(B.box(),`#c8d8e0`,{pos:[.4,.56,.04],rot:[-1.2,0,0],scale:[.11,.008,.1]})},sleepybelly(e){let t=`#2a5a6a`,n=`#f2e2c4`;e.add(B.sphere(18,12),t,{pos:[0,.06,0],scale:[.48,.32,.4]}),e.add(B.sphere(18,12),n,{pos:[0,.1,.02],scale:[.4,.32,.34]});let r=$([-.5,.2,0],[0,0,.5]);e.add(B.sphere(14,10),t,{scale:[.2,.18,.2]},r),e.add(B.sphere(12,8),n,{pos:[.04,.03,.06],scale:[.14,.13,.14]},r);for(let n of[-1,1])e.add(B.cone(4),t,{pos:[-.08,.17,n*.09],rot:[n*.3,0,.4],scale:[.04,.08,.04]},r),e.add(B.box(),`#1a2a30`,{pos:[.1,.11,n*.06],rot:[0,0,-.6],scale:[.004,.012,.05]},r);e.add(B.box(),`#1a2a30`,{pos:[.16,0,0],rot:[0,0,-1.2],scale:[.004,.08,.012]},r);for(let t of[-1,1])e.add(B.cone(4),`#ffffff`,{pos:[.165,.015,t*.03],rot:[0,0,-1.3],scale:[.012,.025,.012]},r);for(let r of[-1,1]){e.add(B.sphere(10,8),n,{pos:[.48,.2,r*.18],rot:[0,0,-.6],scale:[.1,.13,.09]});for(let t=-1;t<=1;t++)e.add(B.cone(4),`#f8f4ec`,{pos:[.6,.3,r*.18+t*.04],rot:[0,0,-.9],scale:[.012,.04,.012]});e.add(B.sphere(10,8),t,{pos:[.02,.18,r*.4],rot:[r*.5,0,0],scale:[.16,.08,.08]})}for(let[t,n,r]of[[-.62,.52,.02],[-.7,.68,.026],[-.6,.86,.032]])bf(e,`Z`,`#cfe4ff`,r,$([t,n,.06],[0,0,.2]),.01)},forestspirit(e){let t=`#8a8c90`,n=`#f0ead6`;e.add(B.sphere(18,12),t,{pos:[0,.6,-.22],scale:[.46,.6,.38]}),e.add(B.sphere(18,12),n,{pos:[0,.48,-.06],scale:[.38,.44,.26]}),e.add(B.sphere(16,8),n,{pos:[0,.3,.02],scale:[.38,.12,.3]});for(let t=0;t<5;t++)e.add(B.prism(),`#6a6c70`,{pos:[-.16+t*.08,.76-t%2*.02,.17],rot:[Math.PI/2-.3,0,Math.PI],scale:[.05,.03,.02]});for(let n of[-1,1]){e.add(B.cone(8),t,{pos:[n*.16,1.24,-.24],rot:[0,0,n*-.15],scale:[.06,.2,.05]}),e.add(B.sphere(10,8),`#ffffff`,{pos:[n*.17,1,.07],scale:[.065,.065,.03]}),e.add(B.sphere(8,6),`#1a1a1a`,{pos:[n*.16,1,.095],scale:[.03,.03,.015]});for(let t of[-.15,0,.15])e.add(B.box(),`#3a3a3a`,{pos:[n*.3,.92+t*.2,.06],rot:[0,-n*.4,t*n],scale:[.16,.006,.006]});e.add(B.sphere(10,8),t,{pos:[n*.42,.5,-.14],rot:[0,0,n*.3],scale:[.09,.22,.1]}),e.add(B.sphere(10,6),t,{pos:[n*.24,.07,.24],scale:[.11,.07,.14]})}e.add(B.sphere(8,6),`#2a2a2a`,{pos:[0,.95,.12],scale:[.04,.02,.02]}),Q(e,`#5a7a2a`,[.44,.6,-.12],[.5,1.5,-.14],.018,5),e.add(B.dome(14),`#4a9a3a`,{pos:[.48,1.46,-.1],scale:[.36,.12,.3]});for(let t=0;t<6;t++)e.add(B.box(),`#3a7a2a`,{pos:[.48,1.5,-.1],rot:[0,t/6*Math.PI,.25],scale:[.6,.006,.01]})},hoard(e){let t=`#e8b83a`,n=[0,0,0],r=[.46,.42,.44];e.add(B.dome(18),`#d8a42a`,{pos:n,scale:r}),Qd(e,`#f6d25a`,n,r,40,.07,1,.05),Qd(e,`#c8901a`,n,r,24,.06,4,.05),Qd(e,`#d8202a`,n,r,4,.04,7,.1),Qd(e,`#2ab86a`,n,r,4,.04,9,.1);for(let n=0;n<9;n++){let r=n*.7+.3;e.add(B.cyl(12),t,{pos:[Math.sin(r)*(.5+n%3*.04),.01,Math.cos(r)*(.5+n%3*.04)],rot:[n*.2,0,0],scale:[.04,.012,.04]})}let i=$([.3,.2,.22],[.4,0,-.5]);e.add(B.cyl(12),t,{scale:[.08,.05,.08]},i);for(let n=0;n<5;n++){let r=n/5*Math.PI*2;e.add(B.cone(4),t,{pos:[Math.sin(r)*.07,.05,Math.cos(r)*.07],scale:[.02,.05,.02]},i)}e.add(B.taper(1.6,10),`#c8c8d0`,{pos:[-.3,.32,-.12],scale:[.04,.08,.04]}),Q(e,`#c8c8d0`,[-.3,.2,-.12],[-.3,.28,-.12],.01,4),Q(e,`#d8dce2`,[.06,.3,-.34],[.12,.84,-.44],.02,4),e.add(B.box(),t,{pos:[.115,.8,-.435],rot:[.18,0,-.11],scale:[.18,.025,.025]}),e.add(B.sphere(6,4),`#d8202a`,{pos:[.125,.94,-.455],scale:.025}),Q(e,`#5a3a20`,[.12,.82,-.44],[.125,.92,-.455],.014,4),e.add(Kd(.12,Math.PI*1.1,6,14),`#3a7a3a`,{pos:[0,.05,0],rot:[Math.PI/2,0,.3],scale:.52});for(let t=0;t<7;t++){let n=.3+t/7*Math.PI*1.1;e.add(B.cone(4),`#2a5a2a`,{pos:[Math.cos(n)*.52,.11,-Math.sin(n)*.52],scale:[.025,.07,.025]})}let a=.3+Math.PI*1.1;e.add(B.cone(4),`#2a5a2a`,{pos:[Math.cos(a)*.52+.03,.05,-Math.sin(a)*.52+.06],rot:[Math.PI/2,0,-.5],scale:[.06,.12,.02]})},armourthrone(e){let t=`#b81e28`,n=`#e8b84a`,r=`#bff4ff`;e.add(B.box(),`#4a1418`,{pos:[0,.18,0],scale:[.56,.36,.5]}),e.add(B.rbox(.2),t,{pos:[0,.38,0],scale:[.5,.08,.48]}),e.add(B.box(),n,{pos:[0,.18,.252],scale:[.4,.16,.01]}),e.add(B.rbox(.25),t,{pos:[0,.86,-.32],scale:[.6,.9,.14]});for(let t of[-1,1])e.add(B.box(),n,{pos:[t*.16,.86,-.248],rot:[0,0,t*.25],scale:[.14,.5,.012]});e.add(B.cyl(16),`#5a6a70`,{pos:[0,.98,-.245],rot:[Math.PI/2,0,0],scale:[.09,.02,.09]}),e.add(B.cyl(16),r,{pos:[0,.98,-.235],rot:[Math.PI/2,0,0],scale:[.065,.02,.065]});let i=$([0,1.42,-.32]);e.add(B.sphere(16,10),t,{scale:[.2,.22,.17]},i),e.add(B.rbox(.3),n,{pos:[0,-.02,.1],scale:[.26,.3,.1]},i);for(let t of[-1,1])e.add(B.box(),r,{pos:[t*.06,.03,.152],rot:[0,0,t*-.15],scale:[.07,.022,.01]},i);e.add(B.box(),`#9a7a2a`,{pos:[0,-.1,.152],scale:[.1,.008,.008]},i);for(let i of[-1,1])e.add(B.rbox(.3),t,{pos:[i*.32,.56,-.04],scale:[.12,.12,.5]}),e.add(B.box(),n,{pos:[i*.32,.56,-.04],scale:[.125,.04,.4]}),e.add(B.rbox(.3),t,{pos:[i*.32,.36,.14],scale:[.1,.32,.1]}),e.add(B.rbox(.3),t,{pos:[i*.32,.6,.27],scale:[.14,.12,.08]}),e.add(B.cyl(12),r,{pos:[i*.32,.6,.312],rot:[Math.PI/2,0,0],scale:[.035,.01,.035]})}},Df={petrock:{paint(e){let t=`#c8a070`;e.add(B.box(),t,{pos:[0,.12,0],scale:[.5,.24,.36]}),e.add(B.box(),`#e2c48a`,{pos:[0,.236,0],scale:[.46,.01,.32]});for(let n of[-1,1])e.add(B.box(),t,{pos:[0,.3,n*.22],rot:[n*.7,0,0],scale:[.5,.012,.16]});e.add(B.sphere(12,8),`#7a7670`,{pos:[0,.3,-.01],scale:[.16,.1,.12]});for(let t of[-1,1])e.add(B.cyl(12),`#ffffff`,{pos:[t*.05,.34,.1],rot:[Math.PI/2-.4,0,0],scale:[.035,.01,.035]}),e.add(B.sphere(6,4),`#1a1a1a`,{pos:[t*.05+.01,.335,.11],scale:[.016,.016,.01]});for(let t=0;t<10;t++)e.add(B.box(),`#e8cc6a`,{pos:[-.2+t*.045,.25,.12-t%3*.1],rot:[0,t*.9,.2],scale:[.1,.006,.006]})},plate:{y:.12,z:.182,w:.44,h:.16,bg:`#c8a070`,fg:`#3a2410`}},sock:{paint(e){for(let t of[-1,1])Q(e,`#8a6a44`,[t*.38,0,0],[t*.38,1,0],.025,6);Q(e,`#e8e8e8`,[-.38,.96,0],[.38,.96,0],.005,4);let t=$([.06,.96,.01]),n=[`#d8302a`,`#f4f0e6`,`#2a6ad8`];for(let r=0;r<5;r++)e.add(B.box(),n[r%3],{pos:[0,-.03-r*.05,0],scale:[.1,.05,.03]},t);e.add(B.box(),n[0],{pos:[.05,-.29,0],rot:[0,0,.1],scale:[.18,.08,.03]},t),e.add(B.sphere(8,5),`#f4f0e6`,{pos:[.13,-.29,0],scale:[.04,.04,.016]},t);for(let n of[-.04,.04])e.add(B.box(),`#c8a060`,{pos:[n,.01,.018],scale:[.012,.06,.012]},t);for(let t of[-.2,-.12])e.add(B.box(),`#c8a060`,{pos:[t,.95,.008],scale:[.012,.06,.012]});Q(e,`#c8a878`,[-.34,.96,0],[-.24,.62,.02],.004,3),Q(e,`#c8a878`,[.34,.96,0],[.24,.62,.02],.004,3),e.add(B.box(),`#b08a52`,{pos:[0,.52,.02],scale:[.52,.22,.03]})},plate:{y:.52,z:.036,w:.48,h:.18,bg:`#b08a52`,fg:`#2a1a0a`}},notfound:{paint(e){for(let t of[-1,1])e.add(B.box(),`#5a5e64`,{pos:[t*.26,.15,-.02],scale:[.04,.3,.04]});e.add(B.box(),`#f4f6f8`,{pos:[0,.6,0],scale:[.7,.66,.05]}),e.add(B.box(),`#c4cad2`,{pos:[0,.9,.002],scale:[.7,.07,.052]});for(let[t,n]of[[-.3,`#e8584a`],[-.26,`#f2c03a`],[-.22,`#4ac05a`]])e.add(B.cyl(10),n,{pos:[t,.9,.03],rot:[Math.PI/2,0,0],scale:[.013,.006,.013]});bf(e,`404`,`#8a96a6`,.034,$([0,.66,.026]),.01)},plate:{y:.39,z:.027,w:.56,h:.15,bg:`#f4f6f8`,fg:`#4a5666`}},pressf:{paint(e){e.add(B.box(),`#2a2c30`,{pos:[0,.1,0],scale:[.68,.2,.5]}),e.add(B.taper(.78,4),`#5a5e66`,{pos:[0,.32,-.04],rot:[0,Math.PI/4,0],scale:[.3,.24,.3]}),e.add(B.taper(.86,4),`#e8eaee`,{pos:[0,.35,-.04],rot:[0,Math.PI/4,0],scale:[.27,.26,.27]}),bf(e,`F`,`#2a2c30`,.04,$([0,.482,-.04],[-Math.PI/2,0,0]),.006);for(let[t,n]of[[.24,`#e8584a`],[.28,`#f2d04a`],[.21,`#f4f4f4`]])Q(e,`#4a8a3a`,[t,.2,.18],[t+.06,.21,-.02],.006,3),e.add(B.sphere(8,5),n,{pos:[t,.215,.19],scale:[.03,.02,.03]})},plate:{y:.1,z:.252,w:.6,h:.15,bg:`#2a2c30`,fg:`#e8eaee`}},ragequit:{paint(e){Sf(e,Cf,.5,.42,-.12,.12);for(let[t,n]of[[-.12,.5],[.14,-.4]]){let r=$([t,.05,.2],[0,n,t>0?.3:-.2],1.5);e.add(B.rbox(.3),`#2a2a30`,{pos:[0,0,0],scale:[.14,.05,.1]},r),e.add(B.sphere(10,6),`#2a2a30`,{pos:[Math.sign(t)*.07,-.01,.05],scale:[.05,.035,.07]},r),e.add(B.cyl(8),`#4a4a50`,{pos:[0,.03,0],scale:[.025,.02,.025]},r)}for(let[t,n,r]of[[0,.32,`#e2302a`],[.06,.38,`#2ad06a`],[-.2,.36,`#2a8af0`],[.28,.3,`#f2c42a`]])e.add(B.cyl(8),r,{pos:[t,.01,n],scale:[.02,.015,.02]});Q(e,`#1a1a1a`,[-.14,.03,.12],[-.3,.01,0],.008,4),Q(e,`#1a1a1a`,[-.3,.01,0],[-.34,.01,.22],.008,4);for(let t=0;t<4;t++)e.add(B.box(),`#4a4640`,{pos:[-.06+t*.05,.56-t*.04,-.058],rot:[0,0,.6-t*.5],scale:[.08,.008,.004]})},plate:{y:.22,z:-.058,w:.42,h:.18,bg:Cf,fg:Tf}},floppy:{paint(e){e.add(B.box(),wf,{pos:[0,.05,0],scale:[.66,.1,.24]});let t=uf(`floppy`,.06,e=>{e.moveTo(-.3,-.3),e.lineTo(.3,-.3),e.lineTo(.3,.25),e.lineTo(.25,.3),e.lineTo(-.3,.3),e.closePath()});e.add(t,`#1e2a4a`,{pos:[0,.4,0]}),e.add(B.box(),`#b8bec6`,{pos:[.03,.6,0],scale:[.3,.2,.064]}),e.add(B.box(),`#2a2e36`,{pos:[.08,.6,0],scale:[.07,.14,.066]}),e.add(B.box(),`#f4f2ea`,{pos:[0,.3,0],scale:[.48,.24,.062]}),e.add(B.box(),`#1a1a22`,{pos:[-.25,.14,0],scale:[.04,.04,.066]})},plate:{y:.3,z:.032,w:.44,h:.2,bg:`#f4f2ea`,fg:`#1e2a4a`}},snowman:{paint(e){e.add(B.cyl(18),`#bcd8ea`,{pos:[0,.006,.02],scale:[.42,.012,.36]}),e.add(B.sphere(12,8),`#f4f8fc`,{pos:[-.04,.05,-.06],scale:[.24,.1,.2]}),e.add(B.sphere(10,6),`#eef4fa`,{pos:[.12,.04,.04],scale:[.12,.06,.1]}),e.add(B.cone(8),`#f08a1a`,{pos:[.14,.03,.22],rot:[0,0,Math.PI/2-.1],scale:[.03,.14,.03]});for(let[t,n]of[[-.04,.12],[.03,.15],[-.2,.18],[-.12,.25]])e.add(B.sphere(6,4),`#1a1a1a`,{pos:[t,.03,n],scale:.025});let t=$([-.18,.12,-.12],[0,0,1.3]);e.add(B.cyl(14),`#1a1a1e`,{scale:[.1,.18,.1]},t),e.add(B.cyl(14),`#1a1a1e`,{pos:[0,-.09,0],scale:[.16,.012,.16]},t),e.add(B.cyl(14),`#c8202a`,{pos:[0,-.06,0],scale:[.102,.03,.102]},t),e.add(B.box(),`#2a8a4a`,{pos:[.1,.11,-.06],rot:[0,.5,.2],scale:[.36,.03,.08]}),e.add(B.box(),`#2a8a4a`,{pos:[.26,.04,0],rot:[0,.9,-.6],scale:[.16,.025,.07]});for(let[t,n]of[[.4,-.3],[-.3,.28]])Q(e,`#5a3a20`,[n,.03,-.1],[n+Math.sin(t)*.2,.02,-.1+Math.cos(t)*.2],.008,4);sf(e,wf,.36,.4,.18)},plate:cf(wf,.36,Tf,.4,.18)},brickphone:{paint(e){e.add(B.box(),wf,{pos:[0,.05,0],scale:[.6,.1,.36]});for(let t=0;t<4;t++)e.add(B.box(),`#4a4640`,{pos:[-.18+t*.1,.101,.1-t%2*.05],rot:[0,.7-t*.5,0],scale:[.12,.004,.008]});e.add(B.rbox(.15),`#4a5260`,{pos:[0,.54,0],scale:[.38,.88,.16]}),e.add(B.box(),`#2a2e36`,{pos:[0,.74,.08],scale:[.32,.26,.01]});for(let t=0;t<4;t++)for(let n=0;n<3;n++)e.add(B.box(),`#c8ccd2`,{pos:[(n-1)*.09,.44-t*.07,.085],scale:[.065,.045,.02]});e.add(B.rbox(.3),`#3ab04a`,{pos:[-.09,.53,.085],scale:[.07,.04,.02]}),e.add(B.rbox(.3),`#d83a3a`,{pos:[.09,.53,.085],scale:[.07,.04,.02]}),e.add(B.cyl(8),`#2a2e36`,{pos:[.12,1.06,0],scale:[.025,.2,.025]})},plate:{y:.74,z:.086,w:.28,h:.2,bg:`#9ab84a`,fg:`#1a2a10`}},loading:{paint(e,t){for(let t of[-1,1])e.add(B.box(),`#3a3e46`,{pos:[t*.26,.2,-.02],scale:[.04,.4,.04]});e.add(B.box(),`#1a1e26`,{pos:[0,.68,0],scale:[.74,.58,.06]}),e.add(B.box(),`#3a404c`,{pos:[0,.78,.032],scale:[.6,.08,.004]}),t.add(B.box(),`#3ad86a`,{pos:[-.004,.78,.036],scale:[.584,.06,.004]}),bf(t,`99%`,`#f4f4f4`,.02,$([.18,.89,.034]),.004);for(let e=0;e<8;e++){let n=e/8*Math.PI*2;t.add(B.sphere(6,4),e<3?`#f4f4f4`:`#6a7080`,{pos:[-.22+Math.sin(n)*.04,.89+Math.cos(n)*.04,.034],scale:.012})}},plate:{y:.55,z:.032,w:.6,h:.16,bg:`#1a1e26`,fg:`#e8ecf4`}},cakelie:{paint(e,t){e.add(B.cyl(14),`#f4f4f0`,{pos:[0,.12,-.04],scale:[.06,.24,.06]}),e.add(B.cyl(18),`#f4f4f0`,{pos:[0,.02,-.04],scale:[.16,.04,.16]}),e.add(B.cyl(20),`#f4f4f0`,{pos:[0,.25,-.04],scale:[.3,.02,.3]}),e.add(B.cyl(20),`#4a2618`,{pos:[0,.38,-.04],scale:[.25,.24,.25]}),e.add(B.cyl(20),`#f4eee4`,{pos:[0,.38,-.04],scale:[.252,.025,.252]}),e.add(B.cyl(20),`#f8f4ec`,{pos:[0,.5,-.04],scale:[.255,.02,.255]});for(let t=0;t<10;t++){let n=t/10*Math.PI*2,r=.04+t%3*.03;e.add(B.box(),`#f8f4ec`,{pos:[Math.sin(n)*.252,.5-r/2,-.04+Math.cos(n)*.252],rot:[0,n,0],scale:[.04,r,.01]}),e.add(B.sphere(8,5),`#d8202a`,{pos:[Math.sin(n)*.2,.52,-.04+Math.cos(n)*.2],scale:.025})}e.add(B.cyl(8),`#f4f4f0`,{pos:[0,.57,-.04],scale:[.015,.12,.015]});for(let t=0;t<3;t++)e.add(B.box(),`#e85a8a`,{pos:[0,.53+t*.04,-.04],rot:[0,0,.4],scale:[.032,.008,.032]});t.add(B.sphere(8,6),`#ffd25a`,{pos:[0,.66,-.04],scale:[.02,.035,.02]}),sf(e,wf,.32,.44,.2)},plate:cf(wf,.32,Tf)},hourglass:{paint(e){e.add(B.box(),wf,{pos:[0,.1,0],scale:[.5,.2,.4]});let t=`#7a4a2a`;for(let n of[.23,.97])e.add(B.cyl(16),t,{pos:[0,n,0],scale:[.2,.05,.2]});for(let n=0;n<3;n++){let r=n/3*Math.PI*2+.3;e.add(B.cyl(8),t,{pos:[Math.sin(r)*.17,.6,Math.cos(r)*.17],scale:[.016,.72,.016]})}e.add(B.cone(16),`#e8c87a`,{pos:[0,.34,0],scale:[.12,.17,.12]}),e.add(B.cyl(16),`#e8c87a`,{pos:[0,.27,0],scale:[.12,.04,.12]});for(let t=0;t<8;t++){let n=t/8*Math.PI*2;for(let t of[-1,1]){let r=t<0?.255:.945;Q(e,`#d8eef6`,[Math.sin(n)*.13,r,Math.cos(n)*.13],[Math.sin(n)*.14,.6+t*.2,Math.cos(n)*.14],.004,3),Q(e,`#d8eef6`,[Math.sin(n)*.14,.6+t*.2,Math.cos(n)*.14],[Math.sin(n)*.018,.6,Math.cos(n)*.018],.004,3)}}},plate:{y:.1,z:.202,w:.44,h:.15,bg:wf,fg:Tf}},jenga:{paint(e){let t=[`#e2c08a`,`#d8b47a`,`#ecca94`],n=.075,r=.24,i=.045,a=new Set([`2:1`,`4:0`,`5:2`,`7:1`,`8:0`]);for(let o=0;o<10;o++)for(let s=0;s<3;s++){if(a.has(`${o}:${s}`))continue;let c=(s-1)*n,l=(o+.5)*i;e.add(B.box(),t[(o+s)%3],o%2?{pos:[c,l,-.1],scale:[n*.97,i*.96,r]}:{pos:[0,l,-.1+c],scale:[r,i*.96,n*.97]})}for(let a=0;a<9;a++){let o=a*2.3,s=.2+a*.37%1*.15;e.add(B.box(),t[a%3],{pos:[Math.sin(o)*s,i/2+(a===4?i:0),-.05+Math.cos(o)*s*.6],rot:[0,o*1.3,a===2?.3:0],scale:[r,i*.96,n*.97]})}sf(e,wf,.34)},plate:cf(wf,.34,Tf)},anvildrop:{paint(e){e.add(B.cyl(18),`#6a5a42`,{pos:[0,.006,0],scale:[.4,.012,.34]}),hf(e,`#8a7a5a`,[0,.02,0],.4,.08,[Math.PI/2,0,0]);let t=`#3a3c42`;e.add(B.box(),t,{pos:[0,.06,-.04],scale:[.36,.12,.26]}),e.add(B.box(),t,{pos:[0,.18,-.04],scale:[.18,.14,.16]}),e.add(B.box(),t,{pos:[-.04,.3,-.04],scale:[.44,.1,.2]}),e.add(B.cone(10),t,{pos:[.26,.3,-.04],rot:[0,0,-Math.PI/2],scale:[.07,.18,.05]}),e.add(B.box(),`#5a5c64`,{pos:[-.04,.352,-.04],scale:[.42,.004,.18]});for(let t=0;t<5;t++){let n=t/5*Math.PI*2,r=$([Math.sin(n)*.2,.62+Math.cos(n*2)*.02,-.04+Math.cos(n)*.14],[0,n,0]);e.add(B.cone(5),`#ffd23a`,{pos:[0,0,0],rot:[Math.PI/2,0,0],scale:[.04,.012,.04]},r)}Q(e,`#8a6a44`,[-.16,.02,.1],[-.24,.24,.14],.006,4),e.add(B.box(),`#f8f8f4`,{pos:[-.2,.2,.14],rot:[0,0,-.35],scale:[.09,.06,.004]}),sf(e,wf,.38,.42,.18)},plate:cf(wf,.38,Tf,.42,.18)},bluescreen:{paint(e,t){e.add(B.box(),wf,{pos:[0,.2,0],scale:[.66,.4,.44]}),e.add(B.box(),`#d8d4c8`,{pos:[0,.42,-.02],scale:[.3,.04,.2]}),e.add(B.box(),`#d8d4c8`,{pos:[0,.48,-.02],scale:[.06,.08,.06]}),e.add(B.box(),`#d8d4c8`,{pos:[0,.75,-.04],scale:[.6,.46,.12]}),e.add(B.box(),`#c4c0b4`,{pos:[0,.75,-.14],scale:[.4,.3,.12]}),t.add(B.box(),`#1a5ad8`,{pos:[0,.76,.022],scale:[.52,.38,.004]}),bf(t,`:(`,`#ffffff`,.024,$([-.18,.86,.026]),.004),e.add(B.box(),`#c8c4b8`,{pos:[0,.41,.15],rot:[.1,0,0],scale:[.4,.02,.12]})},plate:{y:.71,z:.028,w:.46,h:.15,bg:`#1a5ad8`,fg:`#ffffff`}},pocketpet:{paint(e,t){e.add(B.sphere(18,12),`#b86ad8`,{pos:[0,.48,-.06],scale:[.3,.42,.16]}),Qd(e,`#e8a8f4`,[0,.48,-.06],[.3,.42,.16],10,.03,3,-.6),e.add(B.rbox(.2),`#3a2a4a`,{pos:[0,.54,.07],scale:[.3,.28,.04]}),t.add(B.box(),`#c8d8a8`,{pos:[0,.54,.092],scale:[.24,.22,.004]}),tf(t,[`..###..`,`.#####.`,`.#.#.#.`,`.#####.`,`.#####.`,`.#.#.#.`],`#3a4a2a`,.022,$([0,.55,.094]),.004);for(let t=0;t<3;t++)e.add(B.cyl(10),`#f2d04a`,{pos:[(t-1)*.08,.3,.07-Math.abs(t-1)*.01],rot:[Math.PI/2-.4,0,0],scale:[.03,.02,.03]});hf(e,`#c8ccd2`,[0,.92,-.06],.07,.15,[0,Math.PI/2,0]),sf(e,wf,.32)},plate:cf(wf,.32,Tf)},youdied:{paint(e,t){e.add(B.box(),`#2a2828`,{pos:[0,.3,-.06],scale:[.72,.6,.12]}),e.add(B.box(),`#121010`,{pos:[0,.46,.002],scale:[.72,.13,.002]}),bf(t,`YOU DIED`,`#b81a1a`,.014,$([0,.46,.006]),.004);let n=$([.24,0,.26]);e.add(B.cyl(12),`#3a3430`,{pos:[0,.02,0],scale:[.12,.04,.12]},n);for(let t=0;t<6;t++){let r=t/6*Math.PI*2;e.add(B.box(),`#5a5048`,{pos:[Math.sin(r)*.08,.05,Math.cos(r)*.08],rot:[0,r,.6],scale:[.02,.1,.02]},n)}Q(e,`#6a6a70`,[.24,.04,.26],[.22,.34,.24],.012,4);for(let t=0;t<3;t++)e.add(B.torus(.2,4,10),`#8a8a90`,{pos:[0,.1+t*.06,0],rot:[Math.PI/2,0,0],scale:.02},n);e.add(B.box(),`#3a3a40`,{pos:[-.01,.34,0],scale:[.08,.012,.012]},n),t.add(B.cone(6),`#f08a1a`,{pos:[0,.1,0],scale:[.06,.14,.06]},n),t.add(B.cone(6),`#ffd25a`,{pos:[.01,.08,.01],scale:[.035,.09,.035]},n)},plate:{y:.24,z:.002,w:.6,h:.16,bg:`#2a2828`,fg:`#d8d0c0`}},wasted:{paint(e,t){Sf(e,`#8a8a8a`,.62,.66,0,.14),e.add(B.box(),`#121212`,{pos:[0,.6,.002],scale:[.62,.14,.142]}),bf(t,`WASTED`,`#e2302a`,.017,$([0,.6,.074]),.004);let n=$([.34,.08,.2],[0,.4,Math.PI/2]);e.add(B.cone(12),`#f0701a`,{pos:[0,0,0],scale:[.07,.2,.07]},n),e.add(B.cyl(12),`#f4f4f0`,{pos:[0,.02,0],scale:[.046,.03,.046]},n),e.add(B.box(),`#f0701a`,{pos:[0,-.1,0],scale:[.14,.015,.14]},n)},plate:{y:.36,z:.072,w:.52,h:.18,bg:`#8a8a8a`,fg:Tf}},grumpycat:{paint(e){e.add(B.box(),wf,{pos:[0,.12,0],scale:[.5,.24,.4]});let t=`#f0e6d6`,n=`#8a6a4e`;e.add(B.sphere(14,10),t,{pos:[0,.42,-.04],scale:[.16,.2,.14]});for(let n of[-1,1])e.add(B.sphere(10,6),t,{pos:[n*.08,.27,.08],scale:[.05,.04,.07]});e.add(B.sphere(10,6),n,{pos:[-.13,.28,-.12],rot:[0,.6,.4],scale:[.04,.04,.14]});let r=$([0,.66,0]);e.add(B.sphere(16,12),t,{scale:[.17,.14,.15]},r),e.add(B.sphere(12,8),n,{pos:[0,.01,.08],scale:[.12,.08,.08]},r);for(let i of[-1,1])e.add(B.cone(4),n,{pos:[i*.1,.14,-.02],rot:[0,Math.PI/4,i*-.3],scale:[.06,.08,.05]},r),e.add(B.sphere(8,6),`#4a7ab8`,{pos:[i*.055,.03,.138],scale:[.03,.022,.02]},r),e.add(B.box(),n,{pos:[i*.055,.05,.15],rot:[0,0,i*.25],scale:[.065,.014,.012]},r),e.add(B.sphere(8,6),t,{pos:[i*.035,-.045,.13],scale:[.04,.03,.03]},r);e.add(B.sphere(6,4),`#d88a9a`,{pos:[0,-.015,.152],scale:[.018,.012,.01]},r),e.add(Kd(.12,Math.PI,6,8),`#3a2a1e`,{pos:[0,-.085,.146],scale:[.045,.03,.03]},r)},plate:{y:.12,z:.202,w:.44,h:.16,bg:wf,fg:Tf}},tpose:{paint(e){Sf(e,Cf,.56,.62,-.06,.14);let t=$([.08,0,.1],[.2,.3,-.18]),n=`#c8c8cc`;for(let r of[-1,1])e.add(B.box(),n,{pos:[r*.05,.2,0],scale:[.07,.4,.08]},t);e.add(B.box(),n,{pos:[0,.54,0],scale:[.2,.3,.1]},t),e.add(B.box(),n,{pos:[0,.66,0],scale:[.66,.06,.07]},t),e.add(B.sphere(10,8),n,{pos:[0,.78,0],scale:[.07,.08,.07]},t);let r=$([-.3,.9,0],[.4,.6,.2]);for(let t=0;t<2;t++)for(let n=0;n<2;n++)for(let i=0;i<2;i++)e.add(B.box(),(t+n+i)%2?`#1a1a1a`:`#f02af0`,{pos:[(t-.5)*.06,(n-.5)*.06,(i-.5)*.06],scale:.06},r)},plate:{y:.3,z:.012,w:.46,h:.16,bg:Cf,fg:Tf}},coffindance:{paint(e){e.add(B.box(),`#6a8a4a`,{pos:[0,.01,0],scale:[.86,.02,.46]});for(let t=0;t<3;t++)for(let n of[-1,1])xf(e,$([(t-1)*.26,0,n*.15],[0,n>0?0:Math.PI,0]),(t+(n>0?0:1))%2?.14:-.14);e.add(B.box(),`#5a3424`,{pos:[0,.68,0],scale:[.86,.12,.3]}),e.add(B.box(),`#6a4030`,{pos:[0,.76,0],scale:[.88,.04,.32]});for(let t of[-1,1])for(let n of[-1,1])e.add(B.box(),`#c8a040`,{pos:[t*.36,.68,n*.152],scale:[.08,.02,.01]})},plate:{y:.68,z:.151,w:.5,h:.1,bg:`#5a3424`,fg:`#e8c870`}}},Of={log(e){e.add(B.cyl(24),`#7a5236`,{pos:[0,.2,0],scale:[.4,.4,.4]}),e.add(B.cyl(24),`#c49a6c`,{pos:[0,.41,0],scale:[.4,.03,.4]}),e.add(B.torus(.18,8,24),`#a3794f`,{pos:[0,.425,0],rot:[Math.PI/2,0,0],scale:[.24,.24,.24]})},milking(e){e.add(B.cyl(),`#9a6a3e`,{pos:[0,.39,0],scale:[.3,.06,.3]}),e.add(B.torus(.2,5,16),`#7e5430`,{pos:[0,.395,0],rot:[Math.PI/2,0,0],scale:.3});for(let t=0;t<3;t++){let n=t/3*Math.PI*2+.5;Q(e,`#6e4a2a`,[Math.sin(n)*.15,.37,Math.cos(n)*.15],[Math.sin(n)*.3,0,Math.cos(n)*.3],.035)}},hay(e){e.add(B.rbox(.1),`#e2c25a`,{pos:[0,.21,0],scale:[.78,.42,.54]}),e.add(B.box(),`#d2ae44`,{pos:[0,.1,0],scale:[.79,.04,.55]});for(let t of[-.2,.2])e.add(B.box(),`#8a5a2a`,{pos:[t,.21,0],scale:[.03,.43,.555]});for(let[t,n,r]of[[-.3,.27,.6],[.34,-.24,-.5],[.1,.28,-.3]])e.add(B.box(),`#ecd27a`,{pos:[t,.2,n],rot:[.3,r,.5],scale:[.015,.16,.015]})},bucket(e){e.add(B.taper(.8),`#a9b3ba`,{pos:[0,.21,0],scale:[.32,.42,.32]}),e.add(B.cyl(),`#c2cad0`,{pos:[0,.415,0],scale:[.255,.012,.255]}),e.add(B.torus(.12,5,18),`#8e989f`,{pos:[0,.02,0],rot:[Math.PI/2,0,0],scale:.32});for(let t of[.15,.3])e.add(B.torus(.06,4,18),`#949ea5`,{pos:[0,t,0],rot:[Math.PI/2,0,0],scale:.32-t*.15});for(let t of[-1,1])e.add(B.sphere(6,4),`#7c858b`,{pos:[t*.3,.08,0],scale:.035})},crate(e){let t=`#d1a468`;for(let n of[-.17,0,.17])e.add(B.box(),t,{pos:[0,.405,n],scale:[.64,.03,.14]});for(let t of[-1,1])for(let n of[-1,1])e.add(B.box(),`#a87a42`,{pos:[t*.29,.2,n*.21],scale:[.06,.4,.06]});for(let n of[.08,.27]){for(let r of[-1,1])e.add(B.box(),t,{pos:[0,n,r*.225],scale:[.62,.12,.02]});for(let r of[-1,1])e.add(B.box(),t,{pos:[r*.31,n,0],scale:[.02,.12,.44]})}e.add(B.box(),`#3d7a3a`,{pos:[0,.27,.238],scale:[.2,.1,.01]}),e.add(B.sphere(8,6),`#f08a24`,{pos:[0,.27,.245],scale:[.035,.035,.012]})},stump(e){e.add(B.taper(.86),`#6b4a2e`,{pos:[0,.2,0],scale:[.38,.4,.38]}),e.add(B.cyl(),`#cfa874`,{pos:[0,.405,0],scale:[.325,.03,.325]});for(let t of[.11,.22])e.add(B.torus(.08,4,16),`#b08a58`,{pos:[0,.421,0],rot:[Math.PI/2,0,0],scale:t});for(let t=0;t<5;t++){let n=t*1.3+.4;e.add(B.cone(5),`#5e3f26`,{pos:[Math.sin(n)*.38,.06,Math.cos(n)*.38],rot:[Math.cos(n)*1.2,0,-Math.sin(n)*1.2],scale:[.08,.22,.08]})}for(let[t,n,r]of[[2.4,.33,.16],[3,.22,.14],[1.9,.1,.12],[2.7,.405,.13]])e.add(B.sphere(8,5),`#6aa84a`,{pos:[Math.sin(t)*.32,n,Math.cos(t)*.32],scale:[r,r*.45,r]});e.add(B.cyl(6),`#f3ead8`,{pos:[.36,.06,-.24],scale:[.015,.1,.015]}),e.add(B.dome(10),`#d8433a`,{pos:[.36,.11,-.24],scale:[.05,.035,.05]})},ring(e){e.add(B.torus(.62,8,18),`#ffd23a`,{pos:[0,.22,0],rot:[Math.PI/2,0,0],scale:[.3,.3,.33]}),e.add(B.sphere(10,8),`#ffd23a`,{pos:[.42,.42,.04],scale:.13}),e.add(B.sphere(8,5),`#f08a24`,{pos:[.54,.4,.06],scale:[.07,.03,.06]});for(let t of[-.06,.12])e.add(B.sphere(6,4),`#1d1d24`,{pos:[.48,.47,t],scale:.02})},barrel(e){e.add(Jd(.84),`#9a6638`,{pos:[0,.21,0],scale:[.32,.42,.32]}),e.add(B.cyl(),`#b88350`,{pos:[0,.41,0],scale:[.275,.02,.275]});for(let[t,n]of[[.05,.29],[.37,.29],[.21,.322]])e.add(B.cyl(),`#3e3a38`,{pos:[0,t,0],scale:[n,.035,n]});for(let t=0;t<8;t++){let n=t/8*Math.PI*2;e.add(B.box(),`#7e5230`,{pos:[Math.sin(n)*.318,.13,Math.cos(n)*.318],rot:[0,n,0],scale:[.008,.1,.01]})}},tyres(e){for(let t of[.1,.29])e.add(B.torus(.42,6,18),`#2a2a2e`,{pos:[0,t,0],rot:[Math.PI/2,0,0],scale:[.27,.27,.24]}),e.add(B.cyl(),`#3a3a40`,{pos:[0,t,0],scale:[.17,.12,.17]});e.add(B.sphere(12,6),`#d8443a`,{pos:[0,.39,0],scale:[.27,.04,.27]})},pouffe(e){e.add(B.cyl(),`#d9a43a`,{pos:[0,.18,0],scale:[.36,.36,.36]}),e.add(B.sphere(14,6),`#e2b048`,{pos:[0,.36,0],scale:[.36,.065,.36]});for(let t=0;t<12;t++){let n=t/12*Math.PI*2;e.add(B.box(),`#c08c28`,{pos:[Math.sin(n)*.36,.18,Math.cos(n)*.36],rot:[0,n,0],scale:[.05,.34,.025]})}e.add(B.sphere(8,5),`#c08c28`,{pos:[0,.42,0],scale:[.04,.012,.04]})},pumpkin(e){for(let t=0;t<8;t++){let n=t/8*Math.PI*2;e.add(B.sphere(10,6),t%2?`#e8822a`:`#de7420`,{pos:[Math.sin(n)*.17,.2,Math.cos(n)*.17],rot:[0,n,0],scale:[.17,.2,.22]})}e.add(B.cyl(),`#e8822a`,{pos:[0,.3,0],scale:[.26,.24,.26]}),e.add(B.cyl(6),`#5a7a2a`,{pos:[0,.4,-.3],rot:[-.5,0,0],scale:[.03,.14,.03]}),e.add(B.sphere(8,4),`#4e8a34`,{pos:[.12,.38,-.32],rot:[0,.6,.3],scale:[.11,.015,.07]})},books(e){let t=[`#8a2a2a`,`#2a4a7a`,`#3a6a3a`,`#7a5a2a`,`#5a3a6a`],n=[[.6,.44],[.56,.42],[.58,.4],[.52,.4],[.5,.36]];t.forEach((t,r)=>{let[i,a]=n[r],o=.042+r*.084,s=new I().compose(new x(r%2?.02:-.015,o,r%3?.01:-.01),new O().setFromAxisAngle(Wd,(r-2)*.12),new x(1,1,1)),c=(t,n,r)=>e.add(B.box(),t,new I().compose(new x(...n),new O,new x(...r)),s);c(`#f2ead2`,[.01,0,0],[i-.03,.06,a-.03]),c(t,[0,.036,0],[i,.012,a]),c(t,[0,-.036,0],[i,.012,a]),c(t,[-i/2+.006,0,0],[.012,.084,a]),c(`#e2c25a`,[-i/2-.001,0,0],[.012,.012,a*.7])})},beanbag(e){e.add(B.sphere(14,8),`#7a4ab8`,{pos:[0,.2,.02],scale:[.44,.23,.4]}),e.add(B.sphere(12,8),`#6e40a8`,{pos:[0,.38,-.26],rot:[.4,0,0],scale:[.36,.26,.17]}),e.add(B.sphere(8,5),`#8a5ac8`,{pos:[0,.405,.02],scale:[.2,.03,.16]})},toadstool(e){e.add(B.taper(.8),`#efe6d2`,{pos:[0,.15,0],scale:[.15,.3,.15]}),e.add(B.torus(.35,5,14),`#e6dcc4`,{pos:[0,.22,0],rot:[Math.PI/2,0,0],scale:[.13,.13,.08]}),e.add(B.dome(16),`#d8343a`,{pos:[0,.28,0],scale:[.42,.14,.42]}),e.add(B.cyl(),`#f2e8d4`,{pos:[0,.28,0],scale:[.4,.01,.4]}),Qd(e,`#fbf6ea`,[0,.28,0],[.42,.14,.42],9,.06,2,.2)},tractor(e){e.add(B.cyl(),`#2a2a2e`,{pos:[0,.015,0],scale:[.24,.03,.24]}),e.add(B.cyl(8),`#2a2a2e`,{pos:[0,.16,-.04],scale:[.04,.3,.04]});for(let t of[.29,.32,.35])e.add(B.torus(.25,4,12),`#9aa0a6`,{pos:[0,t,-.02],rot:[Math.PI/2,0,0],scale:.07});e.add(B.cyl(),`#d8302a`,{pos:[0,.395,0],scale:[.29,.04,.26]});let t=Kd(.1,Math.PI*1.1,4,12);e.add(t,`#c0281f`,{pos:[0,.42,0],rot:[Math.PI/2,0,Math.PI*.95],scale:[.28,.25,.4]});for(let[t,n]of[[0,.12],[-.12,.05],[.12,.05],[-.06,-.08],[.06,-.08],[0,0]])e.add(B.cyl(6),`#5a1410`,{pos:[t,.416,n],scale:[.025,.004,.025]})},iceblock(e){e.add(B.cyl(),`#9fd0e8`,{pos:[0,.006,0],scale:[.44,.012,.38]}),e.add(B.rbox(.08),`#bfe6f5`,{pos:[0,.21,0],scale:[.62,.42,.52]}),e.add(B.box(),`#eaf8ff`,{pos:[0,.418,0],scale:[.54,.008,.44]}),e.add(B.box(),`#f4fcff`,{pos:[-.1,.24,.262],rot:[0,0,.6],scale:[.16,.012,.005]}),e.add(B.box(),`#f4fcff`,{pos:[-.02,.19,.262],rot:[0,0,-.4],scale:[.1,.012,.005]}),e.add(B.box(),`#f4fcff`,{pos:[.312,.2,.05],rot:[.5,0,0],scale:[.005,.012,.18]})},barstool(e){let t=`#c8ccd2`;e.add(B.taper(.4),t,{pos:[0,.03,0],scale:[.26,.06,.26]}),e.add(B.cyl(8),t,{pos:[0,.2,0],scale:[.035,.32,.035]}),e.add(B.torus(.08,4,18),`#b4b8c0`,{pos:[0,.17,0],rot:[Math.PI/2,0,0],scale:.2});for(let t=0;t<3;t++){let n=t/3*Math.PI*2;Q(e,`#b4b8c0`,[0,.2,0],[Math.sin(n)*.2,.17,Math.cos(n)*.2],.012,4)}e.add(B.cyl(),t,{pos:[0,.35,0],scale:[.3,.04,.3]}),e.add(B.cyl(),`#c8242c`,{pos:[0,.385,0],scale:[.29,.05,.29]}),e.add(B.sphere(14,5),`#d8303a`,{pos:[0,.405,0],scale:[.285,.022,.285]}),e.add(B.sphere(6,4),`#8a1018`,{pos:[0,.426,0],scale:[.025,.006,.025]})},drum(e){e.add(B.cyl(),`#c8302e`,{pos:[0,.21,0],scale:[.33,.38,.33]}),e.add(B.cyl(),`#f4efe4`,{pos:[0,.405,0],scale:[.31,.02,.31]});for(let t of[.02,.4])e.add(B.torus(.09,4,18),`#e0b040`,{pos:[0,t,0],rot:[Math.PI/2,0,0],scale:.335});for(let t=0;t<8;t++){let n=t/8*Math.PI*2;e.add(B.cyl(4),`#d8d8d0`,{pos:[Math.sin(n)*.345,.21,Math.cos(n)*.345],scale:[.012,.36,.012]})}e.add(B.cyl(),`#f4efe4`,{pos:[0,.21,.32],rot:[Math.PI/2,0,0],scale:[.09,.03,.09]})},anvil(e){let t=`#4a4e56`;e.add(B.cyl(),`#8a6a44`,{pos:[0,.12,0],scale:[.22,.24,.22]}),e.add(B.cyl(),`#b08a5a`,{pos:[0,.241,0],scale:[.2,.004,.2]}),e.add(B.box(),t,{pos:[0,.27,0],scale:[.3,.06,.24]}),e.add(B.box(),t,{pos:[0,.33,0],scale:[.18,.08,.16]}),e.add(B.box(),`#5a5e68`,{pos:[-.02,.39,0],scale:[.48,.07,.24]}),e.add(B.box(),`#7a808a`,{pos:[-.02,.4255,0],scale:[.46,.002,.22]}),e.add(B.cone(8),`#5a5e68`,{pos:[.34,.39,0],rot:[0,0,-Math.PI/2],scale:[.07,.24,.07]})},donut(e){e.add(B.cyl(),`#f4f0e8`,{pos:[0,.025,0],scale:[.44,.05,.44]}),e.add(B.torus(.6,8,20),`#d89a52`,{pos:[0,.24,0],rot:[Math.PI/2,0,0],scale:[.27,.27,.29]}),e.add(B.torus(.62,8,20),`#f28ab8`,{pos:[0,.28,0],rot:[Math.PI/2,0,0],scale:[.27,.27,.23]});let t=[`#ffffff`,`#4ab8f0`,`#ffd23a`,`#6ad06a`,`#e8442a`];for(let n=0;n<16;n++){let r=n*2.39996,i=.2+n*.37%1*.14;e.add(B.box(),t[n%t.length],{pos:[Math.sin(r)*i,.405,Math.cos(r)*i],rot:[0,r*1.7,0],scale:[.045,.014,.014]})}},loo(e){e.add(B.taper(1.4),`#f4f4f0`,{pos:[0,.18,.02],scale:[.18,.36,.22]}),e.add(B.sphere(12,6),`#f4f4f0`,{pos:[0,.33,.04],scale:[.24,.07,.29]}),e.add(B.torus(.3,6,20),`#b07a48`,{pos:[0,.4,.04],rot:[Math.PI/2,0,0],scale:[.22,.27,.15]}),e.add(B.cyl(),`#e6e8e4`,{pos:[0,.395,.04],scale:[.16,.01,.2]}),e.add(B.rbox(.2),`#b07a48`,{pos:[0,.62,-.29],rot:[-.12,0,0],scale:[.4,.42,.03]}),e.add(B.rbox(.12),`#f4f4f0`,{pos:[0,.6,-.38],scale:[.46,.4,.16]}),e.add(B.box(),`#c8ccd2`,{pos:[.16,.8,-.38],scale:[.06,.02,.04]}),e.add(B.cyl(),`#fbfbf6`,{pos:[.38,.08,.1],scale:[.07,.16,.07]})},teacup(e){e.add(B.cyl(),`#f6f2ec`,{pos:[0,.03,0],scale:[.46,.04,.46]}),e.add(B.torus(.1,4,20),`#e2b84a`,{pos:[0,.05,0],rot:[Math.PI/2,0,0],scale:.455}),e.add(B.taper(1.5),`#f8f6f2`,{pos:[0,.24,0],scale:[.25,.38,.25]}),e.add(B.taper(1.08),`#f2a0b0`,{pos:[0,.3,0],scale:[.31,.08,.31]}),e.add(B.torus(.06,4,20),`#e2b84a`,{pos:[0,.43,0],rot:[Math.PI/2,0,0],scale:.375}),e.add(B.cyl(),`#9a5a2a`,{pos:[0,.405,0],scale:[.35,.03,.35]}),e.add(B.torus(.2,5,14),`#f8f6f2`,{pos:[.4,.27,0],scale:[.1,.1,.1]})},cake(e){for(let[t,n,r,i]of[[.41,0,.18,`#f2a8c0`],[.34,.18,.13,`#f6ecd8`],[.27,.31,.11,`#7a4a2a`]]){e.add(B.cyl(),i,{pos:[0,n+r/2,0],scale:[t,r,t]}),e.add(B.torus(.07,4,18),`#fffaf2`,{pos:[0,n+r,0],rot:[Math.PI/2,0,0],scale:t});for(let i=0;i<8;i++){let a=i/8*Math.PI*2+n*9;e.add(B.sphere(6,4),`#fffaf2`,{pos:[Math.sin(a)*t,n+r-.025,Math.cos(a)*t],scale:[.025,.035,.018]})}}for(let t=0;t<6;t++){let n=t/6*Math.PI*2+.3;e.add(B.sphere(6,5),`#d8202a`,{pos:[Math.sin(n)*.3,.335,Math.cos(n)*.3],scale:.03})}},swing(e){let t=`#8a5a34`;for(let n of[-.46,.46])for(let r of[-.3,.3])Q(e,t,[n,0,r],[n*.98,1.5,0],.04,5);e.add(B.cyl(8),t,{pos:[0,1.5,0],rot:[0,0,Math.PI/2],scale:[.05,1,.05]});for(let t of[-.27,.27])e.add(B.cyl(4),`#d8c8a0`,{pos:[t,.96,0],scale:[.012,1.08,.012]});e.add(B.rbox(.2),`#b07a48`,{pos:[0,.4,0],scale:[.66,.045,.28]})},rocking(e){let t=`#7a4e2c`,n=`#94603a`;for(let n of[-.25,.25]){e.add(Kd(.03,.9,4,8),t,{pos:[n,1,-.03],rot:[0,Math.PI/2,Math.PI*1.5-.45],scale:.98});for(let r of[-.18,.18])Q(e,t,[n,.05,r],[n,.38,r],.025,5);Q(e,t,[n*1.08,.4,-.22],[n*1.08,1,-.3],.028,5),Q(e,t,[n*1.1,.62,.18],[n*1.1,.62,-.26],.025,5),Q(e,t,[n*1.1,.4,.17],[n*1.1,.62,.18],.02,5)}e.add(B.rbox(.15),n,{pos:[0,.4,0],scale:[.56,.04,.46]}),e.add(B.box(),n,{pos:[0,.98,-.3],rot:[-.13,0,0],scale:[.6,.08,.04]});for(let n of[-.14,0,.14])Q(e,t,[n,.42,-.24],[n,.95,-.3],.015,4)},clam(e){e.add(B.cyl(),`#e8d4a8`,{pos:[0,.05,0],scale:[.2,.1,.2]}),e.add(B.dome(14),`#f2b8c0`,{pos:[0,.4,0],rot:[Math.PI,0,0],scale:[.42,.3,.36]}),e.add(B.cyl(),`#fbe3e6`,{pos:[0,.405,0],scale:[.38,.012,.32]});let t=new I().compose(new x(0,.4,-.3),new O().setFromAxisAngle(new x(1,0,0),-.25),new x(1,1,1));e.add(Yd,`#f2b8c0`,{rot:[-Math.PI/2,0,0],scale:[.44,.05,.5]},t);for(let n=0;n<7;n++){let r=-1.2+n/6*2.4;e.add(B.box(),`#e49aa8`,{pos:[Math.sin(r)*.22,Math.cos(r)*.24,.03],rot:[0,0,-r],scale:[.03,.42,.03]},t)}e.add(B.sphere(12,8),`#fbf6f0`,{pos:[.36,.44,.1],scale:.07})},chest(e){let t=`#e8b830`;e.add(B.box(),`#7a4a26`,{pos:[0,.16,0],scale:[.66,.32,.46]}),e.add(B.cyl(),`#8a5630`,{pos:[0,.32,0],rot:[0,0,Math.PI/2],scale:[.23,.66,.1]}),e.add(B.box(),`#6a3e1e`,{pos:[0,.32,0],scale:[.665,.02,.465]});for(let n of[-.24,.24])e.add(B.box(),t,{pos:[n,.16,0],scale:[.05,.33,.47]}),e.add(B.cyl(),t,{pos:[n,.32,0],rot:[0,0,Math.PI/2],scale:[.235,.05,.105]});e.add(B.box(),t,{pos:[0,.29,.24],scale:[.09,.11,.025]}),e.add(B.box(),`#2a1a0a`,{pos:[0,.28,.254],scale:[.015,.035,.005]});for(let[n,r,i]of[[-.1,.33,0],[.06,.36,.3],[.18,.31,0]])e.add(B.cyl(8),t,{pos:[n,.008,r],rot:[i,0,0],scale:[.045,.012,.045]})},gaming(e){let t=`#22222a`,n=`#d82a36`;for(let n=0;n<5;n++){let r=n/5*Math.PI*2;Q(e,t,[0,.1,0],[Math.sin(r)*.3,.06,Math.cos(r)*.3],.025,4),e.add(B.sphere(6,4),`#3a3a44`,{pos:[Math.sin(r)*.3,.035,Math.cos(r)*.3],scale:.035})}e.add(B.cyl(8),`#9aa0a8`,{pos:[0,.22,0],scale:[.035,.24,.035]}),e.add(B.rbox(.25),t,{pos:[0,.37,0],scale:[.54,.09,.5]});for(let t of[-1,1])e.add(B.box(),n,{pos:[t*.24,.4,.01],scale:[.08,.07,.46]});e.add(B.box(),t,{pos:[0,.86,-.32],rot:[-.12,0,0],scale:[.52,.9,.1]});for(let r of[-1,1])e.add(B.box(),n,{pos:[r*.24,.86,-.3],rot:[-.12,r*.4,0],scale:[.08,.86,.1]}),Q(e,t,[r*.29,.38,0],[r*.29,.6,0],.025,4),e.add(B.box(),`#3a3a44`,{pos:[r*.29,.62,0],scale:[.07,.04,.3]});e.add(B.box(),n,{pos:[0,.6,-.31],rot:[-.12,0,0],scale:[.3,.06,.06]}),e.add(B.rbox(.3),n,{pos:[0,1.17,-.32],rot:[-.12,0,0],scale:[.26,.1,.1]})},cloud(e){for(let t=0;t<7;t++){let n=t/7*Math.PI*2;e.add(B.sphere(9,6),t%2?`#e2ecf6`:`#d6e4f2`,{pos:[Math.sin(n)*.28,.2,Math.cos(n)*.26],scale:[.19,.16,.19]})}e.add(B.sphere(14,8),`#fbfdff`,{pos:[0,.3,0],scale:[.38,.12,.34]});for(let[t,n,r,i]of[[0,.56,-.32,.2],[-.2,.48,-.3,.17],[.2,.48,-.3,.17],[-.33,.36,-.16,.13],[.33,.36,-.16,.13]])e.add(B.sphere(9,6),`#fbfdff`,{pos:[t,n,r],scale:i})},egg(e){e.add(B.torus(.3,6,16),`#7a5a34`,{pos:[0,.07,0],rot:[Math.PI/2,0,0],scale:[.36,.36,.25]});for(let t=0;t<9;t++){let n=t/9*Math.PI*2;e.add(B.box(),t%2?`#6a4a28`:`#8a6a3e`,{pos:[Math.sin(n)*.36,.1,Math.cos(n)*.36],rot:[.3,n+1.2,.2],scale:[.26,.018,.018]})}let t=[0,.22,0],n=[.26,.2,.34];e.add(B.sphere(14,9),`#2e7a6a`,{pos:t,scale:n}),Qd(e,`#e2b84a`,t,n,12,.045,1,.1),Qd(e,`#1e5a4e`,t,n,10,.05,4.2,.05),e.add(B.cone(6),`#e2c86a`,{pos:[0,.27,-.35],rot:[-1.3,0,0],scale:[.04,.1,.04]})},throne(e){let t=`#e3b23c`,n=`#c8962a`,r=`#a8202a`;e.add(B.box(),n,{pos:[0,.03,0],scale:[.7,.06,.58]}),e.add(B.box(),t,{pos:[0,.2,.01],scale:[.62,.3,.5]}),e.add(B.rbox(.3),r,{pos:[0,.385,.03],scale:[.56,.08,.46]}),e.add(B.box(),t,{pos:[0,.82,-.3],scale:[.62,.9,.08]}),e.add(B.rbox(.2),r,{pos:[0,.82,-.255],scale:[.48,.76,.03]}),e.add(B.prism(),t,{pos:[0,1.27,-.3],scale:[.62,.2,.08]});for(let r of[-1,1])e.add(B.box(),t,{pos:[r*.33,.55,-.02],scale:[.07,.3,.48]}),e.add(B.sphere(8,6),n,{pos:[r*.33,.73,.22],scale:.055}),e.add(B.sphere(8,6),n,{pos:[r*.33,1.3,-.3],scale:.06});e.add(B.cyl(),t,{pos:[0,1.48,-.3],scale:[.1,.06,.1]});for(let n=0;n<5;n++){let r=n/5*Math.PI*2;e.add(B.cone(4),t,{pos:[Math.sin(r)*.085,1.54,-.3+Math.cos(r)*.085],scale:[.025,.07,.025]})}e.add(B.sphere(6,4),`#d8202a`,{pos:[0,1.48,-.195],scale:.025})},...gf,...Ef},kf=new Map;function Af(e){let t=e&&Of[e]?e:`log`,n=kf.get(t);if(!n){let e=new z;Of[t](e),kf.set(t,n=e.geometry())}return n}var jf=`#a8a196`,Mf={plain:{paint(e){e.add(B.box(),jf,{pos:[0,.4,0],scale:[.6,.8,.14]}),e.add(B.cyl(20),jf,{pos:[0,.8,0],rot:[Math.PI/2,0,0],scale:[.3,.14,.3]})},plate:{y:.5,z:.075,w:.5,h:.25,bg:jf,fg:`#3a3630`}},cartoon:{paint(e){let t=new I().makeRotationZ(.1);e.add(B.rbox(.25),`#b8b8c8`,{pos:[0,.22,0],scale:[.44,.44,.16]},t),e.add(B.cyl(16),`#b8b8c8`,{pos:[0,.44,0],rot:[Math.PI/2,0,0],scale:[.22,.16,.22]},t),e.add(B.box(),`#6a6a7a`,{pos:[.1,.52,.082],rot:[0,0,.7],scale:[.09,.015,.004]},t),e.add(B.box(),`#6a6a7a`,{pos:[.14,.47,.082],rot:[0,0,-.5],scale:[.07,.015,.004]},t),e.add(B.cyl(4),`#4e8a34`,{pos:[-.3,.1,.1],scale:[.01,.2,.01]});for(let t=0;t<5;t++){let n=t/5*Math.PI*2;e.add(B.sphere(6,4),`#fbfbf2`,{pos:[-.3+Math.sin(n)*.035,.21+Math.cos(n)*.035,.1],scale:[.025,.025,.01]})}e.add(B.sphere(6,4),`#f2c42a`,{pos:[-.3,.21,.105],scale:.02})},plate:{y:.3,z:.084,w:.36,h:.18,bg:`#b8b8c8`,fg:`#2a2a3a`,roll:.1}},skull:{paint(e){let t=`#ece6d6`;e.add(B.box(),`#8a8680`,{pos:[0,.22,0],scale:[.54,.44,.22]}),e.add(B.box(),`#7a766e`,{pos:[0,.46,0],scale:[.58,.04,.26]});for(let n of[-1,1]){Q(e,t,[-.22,.5+(n>0?0:.2),-.02],[.22,.5+(n>0?.2:0),-.02],.025,5);for(let r of[-.22,.22])e.add(B.sphere(6,4),t,{pos:[r,.5+(r>0==n>0?.2:0),-.02],scale:.035})}e.add(B.sphere(12,8),t,{pos:[0,.64,.02],scale:[.13,.12,.12]}),e.add(B.box(),t,{pos:[0,.53,.05],scale:[.12,.06,.1]});for(let t of[-.05,.05])e.add(B.sphere(6,4),`#2a2622`,{pos:[t,.64,.12],scale:[.035,.04,.03]});e.add(B.cone(3),`#2a2622`,{pos:[0,.585,.128],rot:[Math.PI/2,0,Math.PI],scale:[.018,.01,.02]})},plate:{y:.22,z:.112,w:.46,h:.22,bg:`#8a8680`,fg:`#1e1c1a`}},catstone:{paint(e){let t=`#9a96a6`;e.add(B.rbox(.35),t,{pos:[0,.26,0],scale:[.44,.52,.16]}),e.add(B.sphere(14,8),t,{pos:[0,.62,0],scale:[.2,.17,.08]});for(let n of[-1,1])e.add(B.cone(3),t,{pos:[n*.12,.79,0],rot:[0,0,-n*.25],scale:[.07,.12,.05]});e.add(Kd(.18,Math.PI*1.2,5,10),t,{pos:[.24,.14,0],rot:[0,0,-.4],scale:[.14,.14,.14]});for(let t of[-.07,.07])e.add(B.sphere(6,4),`#5a5666`,{pos:[t,.64,.07],scale:[.025,.035,.012]});e.add(B.cone(3),`#c48a96`,{pos:[0,.6,.078],rot:[Math.PI/2,0,Math.PI],scale:[.018,.01,.015]})},plate:{y:.27,z:.085,w:.36,h:.2,bg:`#9a96a6`,fg:`#2a2832`}},obelisk:{paint(e){let t=`#c9c3b6`;e.add(B.box(),`#b0aa9c`,{pos:[0,.06,0],scale:[.56,.12,.56]}),e.add(B.box(),t,{pos:[0,.17,0],scale:[.44,.1,.44]}),e.add(B.taper(.7,4),t,{pos:[0,.72,0],rot:[0,Math.PI/4,0],scale:[.24,1,.24]}),e.add(B.cone(4),`#d8d2c4`,{pos:[0,1.29,0],rot:[0,Math.PI/4,0],scale:[.12,.14,.12]})},plate:{y:.42,z:.163,w:.26,h:.16,bg:`#c9c3b6`,fg:`#3a3630`,tilt:.04}},celtic:{paint(e){let t=`#8e9a8a`;e.add(B.box(),`#7e8a7a`,{pos:[0,.1,0],scale:[.46,.2,.26]}),e.add(B.box(),t,{pos:[0,.68,0],scale:[.16,1,.12]}),e.add(B.box(),t,{pos:[0,.92,0],scale:[.62,.15,.12]}),e.add(B.torus(.14,5,20),t,{pos:[0,.92,0],scale:[.21,.21,.4]}),e.add(B.sphere(6,4),`#6a8a4a`,{pos:[-.15,.2,.08],scale:[.09,.03,.06]});for(let[t,n]of[[0,.92],[0,.6]])e.add(B.sphere(6,4),`#a8b4a4`,{pos:[t,n,.06],scale:[.035,.035,.015]})},plate:{y:.1,z:.132,w:.4,h:.16,bg:`#7e8a7a`,fg:`#1e261c`}},tablet:{paint(e){let t=`#ddd8cc`;e.add(B.box(),`#c4beb0`,{pos:[0,.07,0],scale:[.96,.14,.34]}),e.add(B.box(),`#bdb6a8`,{pos:[0,.6,-.005],scale:[.82,.92,.16]}),e.add(B.cyl(20),`#bdb6a8`,{pos:[0,1.06,-.005],rot:[Math.PI/2,0,0],scale:[.41,.16,.41]}),e.add(B.box(),t,{pos:[0,.6,0],scale:[.72,.84,.17]}),e.add(B.cyl(20),t,{pos:[0,1.04,0],rot:[Math.PI/2,0,0],scale:[.35,.17,.35]}),e.add(B.cone(4),`#bdb6a8`,{pos:[0,1.18,.088],rot:[Math.PI/2,Math.PI/4,0],scale:[.05,.005,.05]})},plate:{y:.66,z:.087,w:.64,h:.5,bg:`#ddd8cc`,fg:`#2e2a24`}},pyramid:{paint(e){e.add(B.box(),`#c49a52`,{pos:[0,.03,-.1],scale:[.82,.06,.82]}),e.add(B.cone(4),`#d9b26a`,{pos:[0,.46,-.1],rot:[0,Math.PI/4,0],scale:[.56,.8,.56]});for(let t=1;t<4;t++)e.add(B.taper(.98,4),`#c8a05a`,{pos:[0,.06+t*.2,-.1],rot:[0,Math.PI/4,0],scale:[.56*(1-t*.2/.8)+.005,.01,.56*(1-t*.2/.8)+.005]});e.add(B.box(),`#3a2a1a`,{pos:[0,.16,.18],rot:[.45,0,0],scale:[.12,.18,.04]}),e.add(B.box(),`#c49a52`,{pos:[0,.13,.42],rot:[-.2,0,0],scale:[.42,.24,.05]})},plate:{y:.13,z:.452,w:.38,h:.2,bg:`#c49a52`,fg:`#3a2410`,tilt:.2}},angel:{paint(e){let t=`#cfcfd2`;e.add(B.box(),`#b8b8bc`,{pos:[0,.18,0],scale:[.56,.36,.42]}),e.add(B.box(),`#a8a8ae`,{pos:[0,.37,0],scale:[.6,.04,.46]}),e.add(B.taper(.42),t,{pos:[0,.66,0],scale:[.2,.56,.18]}),e.add(B.sphere(10,8),t,{pos:[0,.98,.04],scale:[.085,.095,.09]});for(let n of[-1,1])e.add(B.sphere(8,6),t,{pos:[n*.04,.96,.12],scale:[.035,.05,.03]}),Q(e,t,[n*.13,.9,0],[n*.05,.93,.11],.03,5),e.add(B.sphere(10,8),`#dcdce0`,{pos:[n*.12,.84,-.13],rot:[.35,n*.3,-n*.2],scale:[.045,.26,.13]})},plate:{y:.19,z:.212,w:.48,h:.24,bg:`#b8b8bc`,fg:`#2a2a30`}},crystal:{paint(e,t){e.add(B.dodeca(),`#4a4652`,{pos:[0,.14,-.06],scale:[.36,.2,.3]});for(let[e,n,r,i,a,o]of[[0,-.06,.1,.7,0,`#9be7ff`],[-.17,-.02,.07,.42,.35,`#c7a6ff`],[.16,-.08,.07,.5,-.3,`#a6c8ff`],[.06,.08,.05,.3,-.5,`#c7a6ff`],[-.08,-.18,.06,.36,.4,`#9be7ff`]]){let s=new I().compose(new x(e,.2,n),new O().setFromEuler(new L(a*.4,0,-a)),new x(1,1,1));t.add(Xd,o,{pos:[0,i/2,0],scale:[r,i,r]},s),t.add(Zd,`#eafaff`,{pos:[0,i+r*.8,0],scale:[r,r*1.6,r]},s)}e.add(B.box(),`#5a5662`,{pos:[0,.1,.3],rot:[-.2,0,0],scale:[.4,.2,.05]})},plate:{y:.1,z:.332,w:.36,h:.17,bg:`#5a5662`,fg:`#d8f4ff`,tilt:.2}},mausoleum:{paint(e){let t=`#e2ddd2`,n=`#c8c2b4`;e.add(B.box(),n,{pos:[0,.06,0],scale:[1,.12,.84]}),e.add(B.box(),t,{pos:[0,.16,0],scale:[.9,.08,.74]}),e.add(B.box(),t,{pos:[0,.55,-.1],scale:[.76,.72,.5]}),e.add(B.box(),`#2a2622`,{pos:[0,.46,.155],scale:[.26,.5,.02]});for(let r of[-.33,-.18,.18,.33])e.add(B.cyl(10),t,{pos:[r,.55,.28],scale:[.045,.72,.045]}),e.add(B.box(),n,{pos:[r,.215,.28],scale:[.1,.03,.1]});e.add(B.box(),n,{pos:[0,.98,.04],scale:[.86,.16,.62]}),e.add(B.prism(),t,{pos:[0,1.06,.04],rot:[0,Math.PI/2,0],scale:[.64,.24,.88]})},plate:{y:.98,z:.355,w:.74,h:.13,bg:`#c8c2b4`,fg:`#3a3630`}},...vf,...Df},Nf=new Map;function Pf(e){let t=e&&Mf[e]?e:`plain`,n=Nf.get(t);if(!n){let e=new z,r=new z;Mf[t].paint(e,r),n={main:e.geometry(),glow:r.empty?null:r.geometry(0)},n.main.computeBoundingBox(),Nf.set(t,n)}return{...n,plate:Mf[t].plate}}var Ff=new Map;function If(e){let t=e??`plain`,n=Ff.get(t);if(!n){let r=new z;r.add(B.rbox(.12),`#8f8a82`,{pos:[0,.2,0],scale:[.6,.4,.46]}),r.add(B.box(),`#a29c92`,{pos:[0,.405,0],scale:[.54,.03,.4]}),r.add(B.sphere(8,5),`#6a8a4a`,{pos:[.2,.05,.2],scale:[.12,.05,.08]});let i=Pf(e).main.boundingBox,a=Math.min(.9,.85/Math.max(.1,i.max.y),.62/Math.max(.1,i.max.x-i.min.x)),o=new Lf(r,new I().compose(new x(0,0,-.24-i.max.z*a),new O,new x(a,a,a)));Mf[e??`plain`].paint(o,o),Ff.set(t,n=r.geometry())}return n}var Lf=class extends z{outer;m;constructor(e,t){super(),this.outer=e,this.m=t}add(e,t,n={},r){let i=n instanceof I?n.clone():gt(n);return r&&i.premultiply(r),this.outer.add(e,t,i.premultiply(this.m)),this}};function Rf(){let e=new z;e.add(B.sphere(12,8),`#f4f8ff`,{pos:[0,.1,0],scale:[.1,.1,.09]}),e.add(B.taper(.8),`#f4f8ff`,{pos:[0,.03,0],scale:[.1,.14,.09]});for(let t=0;t<5;t++){let n=t/5*Math.PI*2;e.add(B.cone(5),`#e6eefc`,{pos:[Math.sin(n)*.08,-.06,Math.cos(n)*.07],rot:[Math.PI,0,0],scale:[.035,.05,.035]})}for(let t of[-.035,.035])e.add(B.sphere(6,4),`#2a3050`,{pos:[t,.12,.085],scale:[.018,.026,.01]});return e.geometry()}var zf=new Ve({vertexColors:!0}),Bf=new Je({vertexColors:!0});function Vf(e){let t=new N(Af(e),zf);return t.userData.shared=!0,t}function Hf(e,t,n=``){let r=new c,{main:i,glow:a,plate:o}=Pf(e),s=(e,t)=>{let n=new N(e,t);n.castShadow=!0,n.userData.shared=!0,r.add(n)};s(i,zf),a&&s(a,Bf);let l=512/Math.max(o.w,o.h),u=new Hd({w:Math.round(o.w*l),h:Math.round(o.h*l),bg:o.bg,fg:o.fg,size:Math.min(o.h*l*.42,110)},n?[t,n]:t),{mesh:d}=Ud(u,o.w,o.h);r.userData.onDispose=()=>u.dispose(),d.position.set(0,o.y,o.z-.05),d.rotation.x=-(o.tilt??0);let f=new c;return f.rotation.z=o.roll??0,f.add(d),r.add(f),r}export{Ia as S,fl as _,zf as a,cc as b,Ud as c,wd as d,Ld as f,Iu as g,Lu as h,Af as i,zd as l,Id as m,Hf as n,Vf as o,Rd as p,If as r,Hd as s,Rf as t,hd as u,pl as v,G as x,oc as y};