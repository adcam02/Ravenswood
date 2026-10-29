import{a as e,n as t,t as n}from"./jsx-runtime-Wy9s6hX0.js";import{$n as r,A as i,En as a,Fn as o,Mn as s,On as c,Pn as l,i as u,jn as d,k as f,kn as p,l as m,n as h,r as g,t as _,w as v,x as y,xn as b}from"./client-oxhiQsVj.js";import{M as x,O as S,P as C,c as w,d as T,f as E,h as D,k as ee,l as te,n as ne,u as re,w as ie}from"./types-CzLo7Yy_.js";import{F as ae,R as oe,b as se,l as ce,x as le}from"./view-BHt1TEXT.js";import"./layout-BsYFVeU-.js";import{$ as O,$n as ue,A as de,At as fe,Bn as pe,Bt as me,C as he,Cr as ge,Ct as k,D as _e,Dt as ve,E as A,Et as ye,Ft as be,G as xe,Gn as j,H as Se,Hn as M,Ht as N,I as Ce,J as we,Jn as Te,K as Ee,Kn as De,Kt as P,L as Oe,Ln as ke,Lt as Ae,M as je,Mt as Me,N as Ne,Nn as Pe,Nt as Fe,O as Ie,Ot as Le,P as Re,Pt as ze,Q as Be,Qn as Ve,R as He,Rn as Ue,Rt as We,Sr as Ge,St as Ke,T as qe,Tt as Je,U as Ye,Ut as Xe,Vn as Ze,Vt as Qe,W as $e,Wt as et,Xn as tt,Xt as nt,Yn as rt,Z as F,Zn as it,Zt as at,_ as ot,_r as st,_t as ct,ar as lt,br as ut,bt as dt,c as I,ct as ft,d as pt,dr as mt,er as ht,et as gt,f as _t,fr as vt,g as yt,gr as bt,h as xt,hr as St,ht as Ct,it as wt,jt as Tt,l as Et,lr as L,lt as Dt,m as Ot,mr as kt,mt as At,nt as jt,ot as Mt,pr as Nt,q as Pt,qn as Ft,qt as It,rr as Lt,st as Rt,tr as zt,tt as Bt,u as Vt,ur as R,v as Ht,vr as Ut,vt as Wt,w as Gt,wr as Kt,wt as z,xr as qt,xt as Jt,yr as Yt,yt as Xt,z as Zt,zn as Qt}from"./kit-d4GMmfw7.js";import{n as $t,r as en}from"./notes-BJNBg6OA.js";import{$ as tn,A as nn,At as rn,B as an,Ct as on,D as B,Dt as sn,E as cn,Et as ln,F as un,Ft as dn,G as fn,H as pn,I as mn,It as hn,J as gn,K as _n,L as vn,Lt as yn,M as bn,Mt as xn,N as Sn,Nt as Cn,O as wn,Ot as Tn,P as En,Pt as Dn,Q as On,R as kn,Rt as An,St as jn,Tt as Mn,U as Nn,V as Pn,W as V,X as Fn,Y as In,Z as Ln,_t as H,at as Rn,bt as zn,ct as Bn,dt as Vn,et as U,ft as Hn,gt as Un,ht as Wn,it as Gn,j as Kn,jt as qn,k as Jn,kt as Yn,lt as Xn,mt as Zn,nt as Qn,ot as $n,pt as er,q as tr,rt as nr,st as rr,tt as ir,ut as ar,vt as or,wt as W,xt as sr,yt as cr,z as G,zt as lr}from"./audio-ByRscAfQ.js";import{n as ur,t as dr}from"./items-DveasJVp.js";var K=e(t(),1);function fr(){let e=null,t=!1,n=null,r=null;function i(t,a){n(t,a),r=e.requestAnimationFrame(i)}return{start:function(){t!==!0&&n!==null&&(r=e.requestAnimationFrame(i),t=!0)},stop:function(){e.cancelAnimationFrame(r),t=!1},setAnimationLoop:function(e){n=e},setContext:function(t){e=t}}}function pr(e){let t=new WeakMap;function n(t,n){let r=t.array,i=t.usage,a=r.byteLength,o=e.createBuffer();e.bindBuffer(n,o),e.bufferData(n,r,i),t.onUploadCallback();let s;if(r instanceof Float32Array)s=e.FLOAT;else if(typeof Float16Array<`u`&&r instanceof Float16Array)s=e.HALF_FLOAT;else if(r instanceof Uint16Array)s=t.isFloat16BufferAttribute?e.HALF_FLOAT:e.UNSIGNED_SHORT;else if(r instanceof Int16Array)s=e.SHORT;else if(r instanceof Uint32Array)s=e.UNSIGNED_INT;else if(r instanceof Int32Array)s=e.INT;else if(r instanceof Int8Array)s=e.BYTE;else if(r instanceof Uint8Array)s=e.UNSIGNED_BYTE;else if(r instanceof Uint8ClampedArray)s=e.UNSIGNED_BYTE;else throw Error(`THREE.WebGLAttributes: Unsupported buffer data format: `+r);return{buffer:o,type:s,bytesPerElement:r.BYTES_PER_ELEMENT,version:t.version,size:a}}function r(t,n,r){let i=n.array,a=n.updateRanges;if(e.bindBuffer(r,t),a.length===0)e.bufferSubData(r,0,i);else{a.sort((e,t)=>e.start-t.start);let t=0;for(let e=1;e<a.length;e++){let n=a[t],r=a[e];r.start<=n.start+n.count+1?n.count=Math.max(n.count,r.start+r.count-n.start):(++t,a[t]=r)}a.length=t+1;for(let t=0,n=a.length;t<n;t++){let n=a[t];e.bufferSubData(r,n.start*i.BYTES_PER_ELEMENT,i,n.start,n.count)}n.clearUpdateRanges()}n.onUploadCallback()}function i(e){return e.isInterleavedBufferAttribute&&(e=e.data),t.get(e)}function a(n){n.isInterleavedBufferAttribute&&(n=n.data);let r=t.get(n);r&&(e.deleteBuffer(r.buffer),t.delete(n))}function o(e,i){if(e.isInterleavedBufferAttribute&&(e=e.data),e.isGLBufferAttribute){let n=t.get(e);(!n||n.version<e.version)&&t.set(e,{buffer:e.buffer,type:e.type,bytesPerElement:e.elementSize,version:e.version});return}let a=t.get(e);if(a===void 0)t.set(e,n(e,i));else if(a.version<e.version){if(a.size!==e.array.byteLength)throw Error(`THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.`);r(a.buffer,e,i),a.version=e.version}}return{get:i,remove:a,update:o}}var mr={alphahash_fragment:`#ifdef USE_ALPHAHASH
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
}`},q={common:{diffuse:{value:new Ce(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new k},alphaMap:{value:null},alphaMapTransform:{value:new k},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new k}},envmap:{envMap:{value:null},envMapRotation:{value:new k},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new k}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new k}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new k},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new k},normalScale:{value:new L(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new k},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new k}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new k}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new k}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ce(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ce(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new k},alphaTest:{value:0},uvTransform:{value:new k}},sprite:{diffuse:{value:new Ce(16777215)},opacity:{value:1},center:{value:new L(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new k},alphaMap:{value:null},alphaMapTransform:{value:new k},alphaTest:{value:0}}},hr={basic:{uniforms:Ge([q.common,q.specularmap,q.envmap,q.aomap,q.lightmap,q.fog]),vertexShader:mr.meshbasic_vert,fragmentShader:mr.meshbasic_frag},lambert:{uniforms:Ge([q.common,q.specularmap,q.envmap,q.aomap,q.lightmap,q.emissivemap,q.bumpmap,q.normalmap,q.displacementmap,q.fog,q.lights,{emissive:{value:new Ce(0)}}]),vertexShader:mr.meshlambert_vert,fragmentShader:mr.meshlambert_frag},phong:{uniforms:Ge([q.common,q.specularmap,q.envmap,q.aomap,q.lightmap,q.emissivemap,q.bumpmap,q.normalmap,q.displacementmap,q.fog,q.lights,{emissive:{value:new Ce(0)},specular:{value:new Ce(1118481)},shininess:{value:30}}]),vertexShader:mr.meshphong_vert,fragmentShader:mr.meshphong_frag},standard:{uniforms:Ge([q.common,q.envmap,q.aomap,q.lightmap,q.emissivemap,q.bumpmap,q.normalmap,q.displacementmap,q.roughnessmap,q.metalnessmap,q.fog,q.lights,{emissive:{value:new Ce(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:mr.meshphysical_vert,fragmentShader:mr.meshphysical_frag},toon:{uniforms:Ge([q.common,q.aomap,q.lightmap,q.emissivemap,q.bumpmap,q.normalmap,q.displacementmap,q.gradientmap,q.fog,q.lights,{emissive:{value:new Ce(0)}}]),vertexShader:mr.meshtoon_vert,fragmentShader:mr.meshtoon_frag},matcap:{uniforms:Ge([q.common,q.bumpmap,q.normalmap,q.displacementmap,q.fog,{matcap:{value:null}}]),vertexShader:mr.meshmatcap_vert,fragmentShader:mr.meshmatcap_frag},points:{uniforms:Ge([q.points,q.fog]),vertexShader:mr.points_vert,fragmentShader:mr.points_frag},dashed:{uniforms:Ge([q.common,q.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:mr.linedashed_vert,fragmentShader:mr.linedashed_frag},depth:{uniforms:Ge([q.common,q.displacementmap]),vertexShader:mr.depth_vert,fragmentShader:mr.depth_frag},normal:{uniforms:Ge([q.common,q.bumpmap,q.normalmap,q.displacementmap,{opacity:{value:1}}]),vertexShader:mr.meshnormal_vert,fragmentShader:mr.meshnormal_frag},sprite:{uniforms:Ge([q.sprite,q.fog]),vertexShader:mr.sprite_vert,fragmentShader:mr.sprite_frag},background:{uniforms:{uvTransform:{value:new k},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:mr.background_vert,fragmentShader:mr.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new k}},vertexShader:mr.backgroundCube_vert,fragmentShader:mr.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:mr.cube_vert,fragmentShader:mr.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:mr.equirect_vert,fragmentShader:mr.equirect_frag},distanceRGBA:{uniforms:Ge([q.common,q.displacementmap,{referencePosition:{value:new R},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:mr.distanceRGBA_vert,fragmentShader:mr.distanceRGBA_frag},shadow:{uniforms:Ge([q.lights,q.fog,{color:{value:new Ce(0)},opacity:{value:1}}]),vertexShader:mr.shadow_vert,fragmentShader:mr.shadow_frag}};hr.physical={uniforms:Ge([hr.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new k},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new k},clearcoatNormalScale:{value:new L(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new k},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new k},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new k},sheen:{value:0},sheenColor:{value:new Ce(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new k},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new k},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new k},transmissionSamplerSize:{value:new L},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new k},attenuationDistance:{value:0},attenuationColor:{value:new Ce(0)},specularColor:{value:new Ce(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new k},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new k},anisotropyVector:{value:new L},anisotropyMap:{value:null},anisotropyMapTransform:{value:new k}}]),vertexShader:mr.meshphysical_vert,fragmentShader:mr.meshphysical_frag};var gr={r:0,b:0,g:0},_r=new F,vr=new z;function yr(e,t,n,r,i,a,o){let s=new Ce(0),c=a===!0?0:1,l,u,d=null,f=0,p=null;function m(e){let r=e.isScene===!0?e.background:null;return r&&r.isTexture&&(r=(e.backgroundBlurriness>0?n:t).get(r)),r}function h(t){let n=!1,i=m(t);i===null?_(s,c):i&&i.isColor&&(_(i,1),n=!0);let a=e.xr.getEnvironmentBlendMode();a===`additive`?r.buffers.color.setClear(0,0,0,1,o):a===`alpha-blend`&&r.buffers.color.setClear(0,0,0,0,o),(e.autoClear||n)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil))}function g(t,n){let r=m(n);r&&(r.isCubeTexture||r.mapping===306)?(u===void 0&&(u=new Je(new A(1,1,1),new pe({name:`BackgroundCubeMaterial`,uniforms:st(hr.backgroundCube.uniforms),vertexShader:hr.backgroundCube.vertexShader,fragmentShader:hr.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute(`normal`),u.geometry.deleteAttribute(`uv`),u.onBeforeRender=function(e,t,n){this.matrixWorld.copyPosition(n.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(u)),_r.copy(n.backgroundRotation),_r.x*=-1,_r.y*=-1,_r.z*=-1,r.isCubeTexture&&r.isRenderTargetTexture===!1&&(_r.y*=-1,_r.z*=-1),u.material.uniforms.envMap.value=r,u.material.uniforms.flipEnvMap.value=r.isCubeTexture&&r.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=n.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(vr.makeRotationFromEuler(_r)),u.material.toneMapped=Oe.getTransfer(r.colorSpace)!==Ue,(d!==r||f!==r.version||p!==e.toneMapping)&&(u.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),u.layers.enableAll(),t.unshift(u,u.geometry,u.material,0,0,null)):r&&r.isTexture&&(l===void 0&&(l=new Je(new N(2,2),new pe({name:`BackgroundMaterial`,uniforms:st(hr.background.uniforms),vertexShader:hr.background.vertexShader,fragmentShader:hr.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute(`normal`),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=r,l.material.uniforms.backgroundIntensity.value=n.backgroundIntensity,l.material.toneMapped=Oe.getTransfer(r.colorSpace)!==Ue,r.matrixAutoUpdate===!0&&r.updateMatrix(),l.material.uniforms.uvTransform.value.copy(r.matrix),(d!==r||f!==r.version||p!==e.toneMapping)&&(l.material.needsUpdate=!0,d=r,f=r.version,p=e.toneMapping),l.layers.enableAll(),t.unshift(l,l.geometry,l.material,0,0,null))}function _(t,n){t.getRGB(gr,qt(e)),r.buffers.color.setClear(gr.r,gr.g,gr.b,n,o)}function v(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return s},setClearColor:function(e,t=1){s.set(e),c=t,_(s,c)},getClearAlpha:function(){return c},setClearAlpha:function(e){c=e,_(s,c)},render:h,addToRenderList:g,dispose:v}}function br(e,t){let n=e.getParameter(e.MAX_VERTEX_ATTRIBS),r={},i=f(null),a=i,o=!1;function s(n,r,i,s,c){let u=!1,f=d(s,i,r);a!==f&&(a=f,l(a.object)),u=p(n,s,i,c),u&&m(n,s,i,c),c!==null&&t.update(c,e.ELEMENT_ARRAY_BUFFER),(u||o)&&(o=!1,b(n,r,i,s),c!==null&&e.bindBuffer(e.ELEMENT_ARRAY_BUFFER,t.get(c).buffer))}function c(){return e.createVertexArray()}function l(t){return e.bindVertexArray(t)}function u(t){return e.deleteVertexArray(t)}function d(e,t,n){let i=n.wireframe===!0,a=r[e.id];a===void 0&&(a={},r[e.id]=a);let o=a[t.id];o===void 0&&(o={},a[t.id]=o);let s=o[i];return s===void 0&&(s=f(c()),o[i]=s),s}function f(e){let t=[],r=[],i=[];for(let e=0;e<n;e++)t[e]=0,r[e]=0,i[e]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:t,enabledAttributes:r,attributeDivisors:i,object:e,attributes:{},index:null}}function p(e,t,n,r){let i=a.attributes,o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=i[t],r=o[t];if(r===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(r=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(r=e.instanceColor)),n===void 0||n.attribute!==r||r&&n.data!==r.data)return!0;s++}return a.attributesNum!==s||a.index!==r}function m(e,t,n,r){let i={},o=t.attributes,s=0,c=n.getAttributes();for(let t in c)if(c[t].location>=0){let n=o[t];n===void 0&&(t===`instanceMatrix`&&e.instanceMatrix&&(n=e.instanceMatrix),t===`instanceColor`&&e.instanceColor&&(n=e.instanceColor));let r={};r.attribute=n,n&&n.data&&(r.data=n.data),i[t]=r,s++}a.attributes=i,a.attributesNum=s,a.index=r}function h(){let e=a.newAttributes;for(let t=0,n=e.length;t<n;t++)e[t]=0}function g(e){_(e,0)}function _(t,n){let r=a.newAttributes,i=a.enabledAttributes,o=a.attributeDivisors;r[t]=1,i[t]===0&&(e.enableVertexAttribArray(t),i[t]=1),o[t]!==n&&(e.vertexAttribDivisor(t,n),o[t]=n)}function v(){let t=a.newAttributes,n=a.enabledAttributes;for(let r=0,i=n.length;r<i;r++)n[r]!==t[r]&&(e.disableVertexAttribArray(r),n[r]=0)}function y(t,n,r,i,a,o,s){s===!0?e.vertexAttribIPointer(t,n,r,a,o):e.vertexAttribPointer(t,n,r,i,a,o)}function b(n,r,i,a){h();let o=a.attributes,s=i.getAttributes(),c=r.defaultAttributeValues;for(let r in s){let i=s[r];if(i.location>=0){let s=o[r];if(s===void 0&&(r===`instanceMatrix`&&n.instanceMatrix&&(s=n.instanceMatrix),r===`instanceColor`&&n.instanceColor&&(s=n.instanceColor)),s!==void 0){let r=s.normalized,o=s.itemSize,c=t.get(s);if(c===void 0)continue;let l=c.buffer,u=c.type,d=c.bytesPerElement,f=u===e.INT||u===e.UNSIGNED_INT||s.gpuType===1013;if(s.isInterleavedBufferAttribute){let t=s.data,c=t.stride,p=s.offset;if(t.isInstancedInterleavedBuffer){for(let e=0;e<i.locationSize;e++)_(i.location+e,t.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=t.meshPerAttribute*t.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,c*d,(p+o/i.locationSize*e)*d,f)}else{if(s.isInstancedBufferAttribute){for(let e=0;e<i.locationSize;e++)_(i.location+e,s.meshPerAttribute);n.isInstancedMesh!==!0&&a._maxInstanceCount===void 0&&(a._maxInstanceCount=s.meshPerAttribute*s.count)}else for(let e=0;e<i.locationSize;e++)g(i.location+e);e.bindBuffer(e.ARRAY_BUFFER,l);for(let e=0;e<i.locationSize;e++)y(i.location+e,o/i.locationSize,u,r,o*d,o/i.locationSize*e*d,f)}}else if(c!==void 0){let t=c[r];if(t!==void 0)switch(t.length){case 2:e.vertexAttrib2fv(i.location,t);break;case 3:e.vertexAttrib3fv(i.location,t);break;case 4:e.vertexAttrib4fv(i.location,t);break;default:e.vertexAttrib1fv(i.location,t)}}}}v()}function x(){w();for(let e in r){let t=r[e];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e]}}function S(e){if(r[e.id]===void 0)return;let t=r[e.id];for(let e in t){let n=t[e];for(let e in n)u(n[e].object),delete n[e];delete t[e]}delete r[e.id]}function C(e){for(let t in r){let n=r[t];if(n[e.id]===void 0)continue;let i=n[e.id];for(let e in i)u(i[e].object),delete i[e];delete n[e.id]}}function w(){T(),o=!0,a!==i&&(a=i,l(a.object))}function T(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:s,reset:w,resetDefaultState:T,dispose:x,releaseStatesOfGeometry:S,releaseStatesOfProgram:C,initAttributes:h,enableAttribute:g,disableUnusedAttributes:v}}function xr(e,t,n){let r;function i(e){r=e}function a(t,i){e.drawArrays(r,t,i),n.update(i,r,1)}function o(t,i,a){a!==0&&(e.drawArraysInstanced(r,t,i,a),n.update(i,r,a))}function s(e,i,a){if(a===0)return;t.get(`WEBGL_multi_draw`).multiDrawArraysWEBGL(r,e,0,i,0,a);let o=0;for(let e=0;e<a;e++)o+=i[e];n.update(o,r,1)}function c(e,i,a,s){if(a===0)return;let c=t.get(`WEBGL_multi_draw`);if(c===null)for(let t=0;t<e.length;t++)o(e[t],i[t],s[t]);else{c.multiDrawArraysInstancedWEBGL(r,e,0,i,0,s,0,a);let t=0;for(let e=0;e<a;e++)t+=i[e]*s[e];n.update(t,r,1)}}this.setMode=i,this.render=a,this.renderInstances=o,this.renderMultiDraw=s,this.renderMultiDrawInstances=c}function Sr(e,t,n,r){let i;function a(){if(i!==void 0)return i;if(t.has(`EXT_texture_filter_anisotropic`)===!0){let n=t.get(`EXT_texture_filter_anisotropic`);i=e.getParameter(n.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(t){return t===1023||r.convert(t)===e.getParameter(e.IMPLEMENTATION_COLOR_READ_FORMAT)}function s(n){let i=n===1016&&(t.has(`EXT_color_buffer_half_float`)||t.has(`EXT_color_buffer_float`));return!(n!==1009&&r.convert(n)!==e.getParameter(e.IMPLEMENTATION_COLOR_READ_TYPE)&&n!==1015&&!i)}function c(t){if(t===`highp`){if(e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.HIGH_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.HIGH_FLOAT).precision>0)return`highp`;t=`mediump`}return t===`mediump`&&e.getShaderPrecisionFormat(e.VERTEX_SHADER,e.MEDIUM_FLOAT).precision>0&&e.getShaderPrecisionFormat(e.FRAGMENT_SHADER,e.MEDIUM_FLOAT).precision>0?`mediump`:`lowp`}let l=n.precision===void 0?`highp`:n.precision,u=c(l);u!==l&&(console.warn(`THREE.WebGLRenderer:`,l,`not supported, using`,u,`instead.`),l=u);let d=n.logarithmicDepthBuffer===!0,f=n.reversedDepthBuffer===!0&&t.has(`EXT_clip_control`),p=e.getParameter(e.MAX_TEXTURE_IMAGE_UNITS),m=e.getParameter(e.MAX_VERTEX_TEXTURE_IMAGE_UNITS),h=e.getParameter(e.MAX_TEXTURE_SIZE),g=e.getParameter(e.MAX_CUBE_MAP_TEXTURE_SIZE),_=e.getParameter(e.MAX_VERTEX_ATTRIBS),v=e.getParameter(e.MAX_VERTEX_UNIFORM_VECTORS),y=e.getParameter(e.MAX_VARYING_VECTORS),b=e.getParameter(e.MAX_FRAGMENT_UNIFORM_VECTORS),x=m>0,S=e.getParameter(e.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:a,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:s,precision:l,logarithmicDepthBuffer:d,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:m,maxTextureSize:h,maxCubemapSize:g,maxAttributes:_,maxVertexUniforms:v,maxVaryings:y,maxFragmentUniforms:b,vertexTextures:x,maxSamples:S}}function Cr(e){let t=this,n=null,r=0,i=!1,a=!1,o=new Qe,s=new k,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(e,t){let n=e.length!==0||t||r!==0||i;return i=t,r=e.length,n},this.beginShadows=function(){a=!0,u(null)},this.endShadows=function(){a=!1},this.setGlobalState=function(e,t){n=u(e,t,0)},this.setState=function(t,o,s){let d=t.clippingPlanes,f=t.clipIntersection,p=t.clipShadows,m=e.get(t);if(!i||d===null||d.length===0||a&&!p)a?u(null):l();else{let e=a?0:r,t=e*4,i=m.clippingState||null;c.value=i,i=u(d,o,t,s);for(let e=0;e!==t;++e)i[e]=n[e];m.clippingState=i,this.numIntersection=f?this.numPlanes:0,this.numPlanes+=e}};function l(){c.value!==n&&(c.value=n,c.needsUpdate=r>0),t.numPlanes=r,t.numIntersection=0}function u(e,n,r,i){let a=e===null?0:e.length,l=null;if(a!==0){if(l=c.value,i!==!0||l===null){let t=r+a*4,i=n.matrixWorldInverse;s.getNormalMatrix(i),(l===null||l.length<t)&&(l=new Float32Array(t));for(let t=0,n=r;t!==a;++t,n+=4)o.copy(e[t]).applyMatrix4(i,s),o.normal.toArray(l,n),l[n+3]=o.constant}c.value=l,c.needsUpdate=!0}return t.numPlanes=a,t.numIntersection=0,l}}function wr(e){let t=new WeakMap;function n(e,t){return t===303?e.mapping=301:t===304&&(e.mapping=302),e}function r(r){if(r&&r.isTexture){let a=r.mapping;if(a===303||a===304){if(t.has(r)){let e=t.get(r).texture;return n(e,r.mapping)}{let a=r.image;if(a&&a.height>0){let o=new Nt(a.height);return o.fromEquirectangularTexture(e,r),t.set(r,o),r.addEventListener(`dispose`,i),n(o.texture,r.mapping)}return null}}}return r}function i(e){let n=e.target;n.removeEventListener(`dispose`,i);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function a(){t=new WeakMap}return{get:r,dispose:a}}var Tr=4,Er=[.125,.215,.35,.446,.526,.582],Dr=20,Or=new We,kr=new Ce,Ar=null,jr=0,Mr=0,Nr=!1,Pr=(1+Math.sqrt(5))/2,Fr=1/Pr,Ir=[new R(-Pr,Fr,0),new R(Pr,Fr,0),new R(-Fr,0,Pr),new R(Fr,0,Pr),new R(0,Pr,-Fr),new R(0,Pr,Fr),new R(-1,1,-1),new R(1,1,-1),new R(-1,1,1),new R(1,1,1)],Lr=new R,Rr=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,r=100,i={}){let{size:a=256,position:o=Lr}=i;Ar=this._renderer.getRenderTarget(),jr=this._renderer.getActiveCubeFace(),Mr=this._renderer.getActiveMipmapLevel(),Nr=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,n,r,s,o),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Wr(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ur(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=2**this._lodMax}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Ar,jr,Mr),this._renderer.xr.enabled=Nr,e.scissorTest=!1,Vr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Ar=this._renderer.getRenderTarget(),jr=this._renderer.getActiveCubeFace(),Mr=this._renderer.getActiveMipmapLevel(),Nr=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:ct,minFilter:ct,generateMipmaps:!1,type:Rt,format:at,colorSpace:dt,depthBuffer:!1},r=Br(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Br(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=zr(r)),this._blurMaterial=Hr(r,e,t)}return r}_compileMaterial(e){let t=new Je(this._lodPlanes[0],e);this._renderer.compile(t,Or)}_sceneToCubeUV(e,t,n,r,i){let a=new me(90,1,t,n),o=[1,-1,1,1,1,1],s=[1,1,1,-1,-1,-1],c=this._renderer,l=c.autoClear,u=c.toneMapping;c.getClearColor(kr),c.toneMapping=0,c.autoClear=!1,c.state.buffers.depth.getReversed()&&(c.setRenderTarget(r),c.clearDepth(),c.setRenderTarget(null));let d=new ye({name:`PMREM.Background`,side:1,depthWrite:!1,depthTest:!1}),f=new Je(new A,d),p=!1,m=e.background;m?m.isColor&&(d.color.copy(m),e.background=null,p=!0):(d.color.copy(kr),p=!0);for(let t=0;t<6;t++){let n=t%3;n===0?(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x+s[t],i.y,i.z)):n===1?(a.up.set(0,0,o[t]),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y+s[t],i.z)):(a.up.set(0,o[t],0),a.position.set(i.x,i.y,i.z),a.lookAt(i.x,i.y,i.z+s[t]));let l=this._cubeSize;Vr(r,n*l,t>2?l:0,l,l),c.setRenderTarget(r),p&&c.render(f,a),c.render(e,a)}f.geometry.dispose(),f.material.dispose(),c.toneMapping=u,c.autoClear=l,e.background=m}_textureToCubeUV(e,t){let n=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Wr()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Ur());let i=r?this._cubemapMaterial:this._equirectMaterial,a=new Je(this._lodPlanes[0],i),o=i.uniforms;o.envMap.value=e;let s=this._cubeSize;Vr(t,0,0,3*s,2*s),n.setRenderTarget(t),n.render(a,Or)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let r=this._lodPlanes.length;for(let t=1;t<r;t++){let n=Math.sqrt(this._sigmas[t]*this._sigmas[t]-this._sigmas[t-1]*this._sigmas[t-1]),i=Ir[(r-t-1)%Ir.length];this._blur(e,t-1,t,n,i)}t.autoClear=n}_blur(e,t,n,r,i){let a=this._pingPongRenderTarget;this._halfBlur(e,a,t,n,r,`latitudinal`,i),this._halfBlur(a,e,n,n,r,`longitudinal`,i)}_halfBlur(e,t,n,r,i,a,o){let s=this._renderer,c=this._blurMaterial;a!==`latitudinal`&&a!==`longitudinal`&&console.error(`blur direction must be either latitudinal or longitudinal!`);let l=new Je(this._lodPlanes[r],c),u=c.uniforms,d=this._sizeLods[n]-1,f=isFinite(i)?Math.PI/(2*d):2*Math.PI/39,p=i/f,m=isFinite(i)?1+Math.floor(3*p):Dr;m>Dr&&console.warn(`sigmaRadians, ${i}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Dr}`);let h=[],g=0;for(let e=0;e<Dr;++e){let t=e/p,n=Math.exp(-t*t/2);h.push(n),e===0?g+=n:e<m&&(g+=2*n)}for(let e=0;e<h.length;e++)h[e]=h[e]/g;u.envMap.value=e.texture,u.samples.value=m,u.weights.value=h,u.latitudinal.value=a===`latitudinal`,o&&(u.poleAxis.value=o);let{_lodMax:_}=this;u.dTheta.value=f,u.mipInt.value=_-n;let v=this._sizeLods[r];Vr(t,3*v*(r>_-Tr?r-_+Tr:0),4*(this._cubeSize-v),3*v,2*v),s.setRenderTarget(t),s.render(l,Or)}};function zr(e){let t=[],n=[],r=[],i=e,a=e-Tr+1+Er.length;for(let o=0;o<a;o++){let a=2**i;n.push(a);let s=1/a;o>e-Tr?s=Er[o-e+Tr-1]:o===0&&(s=0),r.push(s);let c=1/(a-2),l=-c,u=1+c,d=[l,l,u,l,u,u,l,l,u,u,l,u],f=new Float32Array(108),p=new Float32Array(72),m=new Float32Array(36);for(let e=0;e<6;e++){let t=e%3*2/3-1,n=e>2?0:-1,r=[t,n,0,t+2/3,n,0,t+2/3,n+1,0,t,n,0,t+2/3,n+1,0,t,n+1,0];f.set(r,18*e),p.set(d,12*e);let i=[e,e,e,e,e,e];m.set(i,6*e)}let h=new Ie;h.setAttribute(`position`,new _e(f,3)),h.setAttribute(`uv`,new _e(p,2)),h.setAttribute(`faceIndex`,new _e(m,1)),t.push(h),i>Tr&&i--}return{lodPlanes:t,sizeLods:n,sigmas:r}}function Br(e,t,n){let r=new kt(e,t,n);return r.texture.mapping=306,r.texture.name=`PMREM.cubeUv`,r.scissorTest=!0,r}function Vr(e,t,n,r,i){e.viewport.set(t,n,r,i),e.scissor.set(t,n,r,i)}function Hr(e,t,n){let r=new Float32Array(Dr),i=new R(0,1,0);return new pe({name:`SphericalGaussianBlur`,defines:{n:Dr,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${e}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Gr(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function Ur(){return new pe({name:`EquirectangularToCubeUV`,uniforms:{envMap:{value:null}},vertexShader:Gr(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function Wr(){return new pe({name:`CubemapToCubeUV`,uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Gr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Gr(){return`

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
	`}function Kr(e){let t=new WeakMap,n=null;function r(r){if(r&&r.isTexture){let o=r.mapping,s=o===303||o===304,c=o===301||o===302;if(s||c){let o=t.get(r),l=o===void 0?0:o.texture.pmremVersion;if(r.isRenderTargetTexture&&r.pmremVersion!==l)return n===null&&(n=new Rr(e)),o=s?n.fromEquirectangular(r,o):n.fromCubemap(r,o),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),o.texture;if(o!==void 0)return o.texture;{let l=r.image;return s&&l&&l.height>0||c&&l&&i(l)?(n===null&&(n=new Rr(e)),o=s?n.fromEquirectangular(r):n.fromCubemap(r),o.texture.pmremVersion=r.pmremVersion,t.set(r,o),r.addEventListener(`dispose`,a),o.texture):null}}}return r}function i(e){let t=0;for(let n=0;n<6;n++)e[n]!==void 0&&t++;return t===6}function a(e){let n=e.target;n.removeEventListener(`dispose`,a);let r=t.get(n);r!==void 0&&(t.delete(n),r.dispose())}function o(){t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:r,dispose:o}}function qr(e){let t={};function n(n){if(t[n]!==void 0)return t[n];let r;switch(n){case`WEBGL_depth_texture`:r=e.getExtension(`WEBGL_depth_texture`)||e.getExtension(`MOZ_WEBGL_depth_texture`)||e.getExtension(`WEBKIT_WEBGL_depth_texture`);break;case`EXT_texture_filter_anisotropic`:r=e.getExtension(`EXT_texture_filter_anisotropic`)||e.getExtension(`MOZ_EXT_texture_filter_anisotropic`)||e.getExtension(`WEBKIT_EXT_texture_filter_anisotropic`);break;case`WEBGL_compressed_texture_s3tc`:r=e.getExtension(`WEBGL_compressed_texture_s3tc`)||e.getExtension(`MOZ_WEBGL_compressed_texture_s3tc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_s3tc`);break;case`WEBGL_compressed_texture_pvrtc`:r=e.getExtension(`WEBGL_compressed_texture_pvrtc`)||e.getExtension(`WEBKIT_WEBGL_compressed_texture_pvrtc`);break;default:r=e.getExtension(n)}return t[n]=r,r}return{has:function(e){return n(e)!==null},init:function(){n(`EXT_color_buffer_float`),n(`WEBGL_clip_cull_distance`),n(`OES_texture_float_linear`),n(`EXT_color_buffer_half_float`),n(`WEBGL_multisampled_render_to_texture`),n(`WEBGL_render_shared_exponent`)},get:function(e){let t=n(e);return t===null&&Kt(`THREE.WebGLRenderer: `+e+` extension not supported.`),t}}}function Jr(e,t,n,r){let i={},a=new WeakMap;function o(e){let s=e.target;s.index!==null&&t.remove(s.index);for(let e in s.attributes)t.remove(s.attributes[e]);s.removeEventListener(`dispose`,o),delete i[s.id];let c=a.get(s);c&&(t.remove(c),a.delete(s)),r.releaseStatesOfGeometry(s),s.isInstancedBufferGeometry===!0&&delete s._maxInstanceCount,n.memory.geometries--}function s(e,t){return i[t.id]===!0||(t.addEventListener(`dispose`,o),i[t.id]=!0,n.memory.geometries++),t}function c(n){let r=n.attributes;for(let n in r)t.update(r[n],e.ARRAY_BUFFER)}function l(e){let n=[],r=e.index,i=e.attributes.position,o=0;if(r!==null){let e=r.array;o=r.version;for(let t=0,r=e.length;t<r;t+=3){let r=e[t+0],i=e[t+1],a=e[t+2];n.push(r,i,i,a,a,r)}}else if(i!==void 0){let e=i.array;o=i.version;for(let t=0,r=e.length/3-1;t<r;t+=3){let e=t+0,r=t+1,i=t+2;n.push(e,r,r,i,i,e)}}else return;let s=new(bt(n)?ue:Ve)(n,1);s.version=o;let c=a.get(e);c&&t.remove(c),a.set(e,s)}function u(e){let t=a.get(e);if(t){let n=e.index;n!==null&&t.version<n.version&&l(e)}else l(e);return a.get(e)}return{get:s,update:c,getWireframeAttribute:u}}function Yr(e,t,n){let r;function i(e){r=e}let a,o;function s(e){a=e.type,o=e.bytesPerElement}function c(t,i){e.drawElements(r,i,a,t*o),n.update(i,r,1)}function l(t,i,s){s!==0&&(e.drawElementsInstanced(r,i,a,t*o,s),n.update(i,r,s))}function u(e,i,o){if(o===0)return;t.get(`WEBGL_multi_draw`).multiDrawElementsWEBGL(r,i,0,a,e,0,o);let s=0;for(let e=0;e<o;e++)s+=i[e];n.update(s,r,1)}function d(e,i,s,c){if(s===0)return;let u=t.get(`WEBGL_multi_draw`);if(u===null)for(let t=0;t<e.length;t++)l(e[t]/o,i[t],c[t]);else{u.multiDrawElementsInstancedWEBGL(r,i,0,a,e,0,c,0,s);let t=0;for(let e=0;e<s;e++)t+=i[e]*c[e];n.update(t,r,1)}}this.setMode=i,this.setIndex=s,this.render=c,this.renderInstances=l,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function Xr(e){let t={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(t,r,i){switch(n.calls++,r){case e.TRIANGLES:n.triangles+=t/3*i;break;case e.LINES:n.lines+=t/2*i;break;case e.LINE_STRIP:n.lines+=i*(t-1);break;case e.LINE_LOOP:n.lines+=i*t;break;case e.POINTS:n.points+=i*t;break;default:console.error(`THREE.WebGLInfo: Unknown draw mode:`,r)}}function i(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:t,render:n,programs:null,autoReset:!0,reset:i,update:r}}function Zr(e,t,n){let r=new WeakMap,i=new mt;function a(a,o,s){let c=a.morphTargetInfluences,l=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=l===void 0?0:l.length,d=r.get(o);if(d===void 0||d.count!==u){d!==void 0&&d.texture.dispose();let e=o.morphAttributes.position!==void 0,n=o.morphAttributes.normal!==void 0,a=o.morphAttributes.color!==void 0,s=o.morphAttributes.position||[],c=o.morphAttributes.normal||[],l=o.morphAttributes.color||[],f=0;e===!0&&(f=1),n===!0&&(f=2),a===!0&&(f=3);let p=o.attributes.position.count*f,m=1;p>t.maxTextureSize&&(m=Math.ceil(p/t.maxTextureSize),p=t.maxTextureSize);let h=new Float32Array(p*m*4*u),g=new $e(h,p,m,u);g.type=jt,g.needsUpdate=!0;let _=f*4;for(let t=0;t<u;t++){let r=s[t],o=c[t],u=l[t],d=p*m*4*t;for(let t=0;t<r.count;t++){let s=t*_;e===!0&&(i.fromBufferAttribute(r,t),h[d+s+0]=i.x,h[d+s+1]=i.y,h[d+s+2]=i.z,h[d+s+3]=0),n===!0&&(i.fromBufferAttribute(o,t),h[d+s+4]=i.x,h[d+s+5]=i.y,h[d+s+6]=i.z,h[d+s+7]=0),a===!0&&(i.fromBufferAttribute(u,t),h[d+s+8]=i.x,h[d+s+9]=i.y,h[d+s+10]=i.z,h[d+s+11]=u.itemSize===4?i.w:1)}}d={count:u,texture:g,size:new L(p,m)},r.set(o,d);function v(){g.dispose(),r.delete(o),o.removeEventListener(`dispose`,v)}o.addEventListener(`dispose`,v)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)s.getUniforms().setValue(e,`morphTexture`,a.morphTexture,n);else{let t=0;for(let e=0;e<c.length;e++)t+=c[e];let n=o.morphTargetsRelative?1:1-t;s.getUniforms().setValue(e,`morphTargetBaseInfluence`,n),s.getUniforms().setValue(e,`morphTargetInfluences`,c)}s.getUniforms().setValue(e,`morphTargetsTexture`,d.texture,n),s.getUniforms().setValue(e,`morphTargetsTextureSize`,d.size)}return{update:a}}function Qr(e,t,n,r){let i=new WeakMap;function a(a){let o=r.render.frame,c=a.geometry,l=t.get(a,c);if(i.get(l)!==o&&(t.update(l),i.set(l,o)),a.isInstancedMesh&&(a.hasEventListener(`dispose`,s)===!1&&a.addEventListener(`dispose`,s),i.get(a)!==o&&(n.update(a.instanceMatrix,e.ARRAY_BUFFER),a.instanceColor!==null&&n.update(a.instanceColor,e.ARRAY_BUFFER),i.set(a,o))),a.isSkinnedMesh){let e=a.skeleton;i.get(e)!==o&&(e.update(),i.set(e,o))}return l}function o(){i=new WeakMap}function s(e){let t=e.target;t.removeEventListener(`dispose`,s),n.remove(t.instanceMatrix),t.instanceColor!==null&&n.remove(t.instanceColor)}return{update:a,dispose:o}}var $r=new rt,ei=new Pt(1,1),ti=new $e,ni=new Ye,ri=new Zt,ii=[],ai=[],oi=new Float32Array(16),si=new Float32Array(9),ci=new Float32Array(4);function li(e,t,n){let r=e[0];if(r<=0||r>0)return e;let i=t*n,a=ii[i];if(a===void 0&&(a=new Float32Array(i),ii[i]=a),t!==0){r.toArray(a,0);for(let r=1,i=0;r!==t;++r)i+=n,e[r].toArray(a,i)}return a}function ui(e,t){if(e.length!==t.length)return!1;for(let n=0,r=e.length;n<r;n++)if(e[n]!==t[n])return!1;return!0}function di(e,t){for(let n=0,r=t.length;n<r;n++)e[n]=t[n]}function fi(e,t){let n=ai[t];n===void 0&&(n=new Int32Array(t),ai[t]=n);for(let r=0;r!==t;++r)n[r]=e.allocateTextureUnit();return n}function pi(e,t){let n=this.cache;n[0]!==t&&(e.uniform1f(this.addr,t),n[0]=t)}function mi(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2f(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(ui(n,t))return;e.uniform2fv(this.addr,t),di(n,t)}}function hi(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3f(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else if(t.r!==void 0)(n[0]!==t.r||n[1]!==t.g||n[2]!==t.b)&&(e.uniform3f(this.addr,t.r,t.g,t.b),n[0]=t.r,n[1]=t.g,n[2]=t.b);else{if(ui(n,t))return;e.uniform3fv(this.addr,t),di(n,t)}}function gi(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4f(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(ui(n,t))return;e.uniform4fv(this.addr,t),di(n,t)}}function _i(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(ui(n,t))return;e.uniformMatrix2fv(this.addr,!1,t),di(n,t)}else{if(ui(n,r))return;ci.set(r),e.uniformMatrix2fv(this.addr,!1,ci),di(n,r)}}function vi(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(ui(n,t))return;e.uniformMatrix3fv(this.addr,!1,t),di(n,t)}else{if(ui(n,r))return;si.set(r),e.uniformMatrix3fv(this.addr,!1,si),di(n,r)}}function yi(e,t){let n=this.cache,r=t.elements;if(r===void 0){if(ui(n,t))return;e.uniformMatrix4fv(this.addr,!1,t),di(n,t)}else{if(ui(n,r))return;oi.set(r),e.uniformMatrix4fv(this.addr,!1,oi),di(n,r)}}function bi(e,t){let n=this.cache;n[0]!==t&&(e.uniform1i(this.addr,t),n[0]=t)}function xi(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2i(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(ui(n,t))return;e.uniform2iv(this.addr,t),di(n,t)}}function Si(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3i(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(ui(n,t))return;e.uniform3iv(this.addr,t),di(n,t)}}function Ci(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4i(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(ui(n,t))return;e.uniform4iv(this.addr,t),di(n,t)}}function wi(e,t){let n=this.cache;n[0]!==t&&(e.uniform1ui(this.addr,t),n[0]=t)}function Ti(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y)&&(e.uniform2ui(this.addr,t.x,t.y),n[0]=t.x,n[1]=t.y);else{if(ui(n,t))return;e.uniform2uiv(this.addr,t),di(n,t)}}function Ei(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z)&&(e.uniform3ui(this.addr,t.x,t.y,t.z),n[0]=t.x,n[1]=t.y,n[2]=t.z);else{if(ui(n,t))return;e.uniform3uiv(this.addr,t),di(n,t)}}function Di(e,t){let n=this.cache;if(t.x!==void 0)(n[0]!==t.x||n[1]!==t.y||n[2]!==t.z||n[3]!==t.w)&&(e.uniform4ui(this.addr,t.x,t.y,t.z,t.w),n[0]=t.x,n[1]=t.y,n[2]=t.z,n[3]=t.w);else{if(ui(n,t))return;e.uniform4uiv(this.addr,t),di(n,t)}}function Oi(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i);let a;this.type===e.SAMPLER_2D_SHADOW?(ei.compareFunction=515,a=ei):a=$r,n.setTexture2D(t||a,i)}function ki(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture3D(t||ni,i)}function Ai(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTextureCube(t||ri,i)}function ji(e,t,n){let r=this.cache,i=n.allocateTextureUnit();r[0]!==i&&(e.uniform1i(this.addr,i),r[0]=i),n.setTexture2DArray(t||ti,i)}function Mi(e){switch(e){case 5126:return pi;case 35664:return mi;case 35665:return hi;case 35666:return gi;case 35674:return _i;case 35675:return vi;case 35676:return yi;case 5124:case 35670:return bi;case 35667:case 35671:return xi;case 35668:case 35672:return Si;case 35669:case 35673:return Ci;case 5125:return wi;case 36294:return Ti;case 36295:return Ei;case 36296:return Di;case 35678:case 36198:case 36298:case 36306:case 35682:return Oi;case 35679:case 36299:case 36307:return ki;case 35680:case 36300:case 36308:case 36293:return Ai;case 36289:case 36303:case 36311:case 36292:return ji}}function Ni(e,t){e.uniform1fv(this.addr,t)}function Pi(e,t){let n=li(t,this.size,2);e.uniform2fv(this.addr,n)}function Fi(e,t){let n=li(t,this.size,3);e.uniform3fv(this.addr,n)}function Ii(e,t){let n=li(t,this.size,4);e.uniform4fv(this.addr,n)}function Li(e,t){let n=li(t,this.size,4);e.uniformMatrix2fv(this.addr,!1,n)}function Ri(e,t){let n=li(t,this.size,9);e.uniformMatrix3fv(this.addr,!1,n)}function zi(e,t){let n=li(t,this.size,16);e.uniformMatrix4fv(this.addr,!1,n)}function Bi(e,t){e.uniform1iv(this.addr,t)}function Vi(e,t){e.uniform2iv(this.addr,t)}function Hi(e,t){e.uniform3iv(this.addr,t)}function Ui(e,t){e.uniform4iv(this.addr,t)}function Wi(e,t){e.uniform1uiv(this.addr,t)}function Gi(e,t){e.uniform2uiv(this.addr,t)}function Ki(e,t){e.uniform3uiv(this.addr,t)}function qi(e,t){e.uniform4uiv(this.addr,t)}function Ji(e,t,n){let r=this.cache,i=t.length,a=fi(n,i);ui(r,a)||(e.uniform1iv(this.addr,a),di(r,a));for(let e=0;e!==i;++e)n.setTexture2D(t[e]||$r,a[e])}function Yi(e,t,n){let r=this.cache,i=t.length,a=fi(n,i);ui(r,a)||(e.uniform1iv(this.addr,a),di(r,a));for(let e=0;e!==i;++e)n.setTexture3D(t[e]||ni,a[e])}function Xi(e,t,n){let r=this.cache,i=t.length,a=fi(n,i);ui(r,a)||(e.uniform1iv(this.addr,a),di(r,a));for(let e=0;e!==i;++e)n.setTextureCube(t[e]||ri,a[e])}function Zi(e,t,n){let r=this.cache,i=t.length,a=fi(n,i);ui(r,a)||(e.uniform1iv(this.addr,a),di(r,a));for(let e=0;e!==i;++e)n.setTexture2DArray(t[e]||ti,a[e])}function Qi(e){switch(e){case 5126:return Ni;case 35664:return Pi;case 35665:return Fi;case 35666:return Ii;case 35674:return Li;case 35675:return Ri;case 35676:return zi;case 5124:case 35670:return Bi;case 35667:case 35671:return Vi;case 35668:case 35672:return Hi;case 35669:case 35673:return Ui;case 5125:return Wi;case 36294:return Gi;case 36295:return Ki;case 36296:return qi;case 35678:case 36198:case 36298:case 36306:case 35682:return Ji;case 35679:case 36299:case 36307:return Yi;case 35680:case 36300:case 36308:case 36293:return Xi;case 36289:case 36303:case 36311:case 36292:return Zi}}var $i=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Mi(t.type)}},ea=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Qi(t.type)}},ta=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let r=this.seq;for(let i=0,a=r.length;i!==a;++i){let a=r[i];a.setValue(e,t[a.id],n)}}},na=/(\w+)(\])?(\[|\.)?/g;function ra(e,t){e.seq.push(t),e.map[t.id]=t}function ia(e,t,n){let r=e.name,i=r.length;for(na.lastIndex=0;;){let a=na.exec(r),o=na.lastIndex,s=a[1],c=a[2]===`]`,l=a[3];if(c&&(s|=0),l===void 0||l===`[`&&o+2===i){ra(n,l===void 0?new $i(s,e,t):new ea(s,e,t));break}{let e=n.map[s];e===void 0&&(e=new ta(s),ra(n,e)),n=e}}}var aa=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){let n=e.getActiveUniform(t,r);ia(n,e.getUniformLocation(t,n.name),this)}}setValue(e,t,n,r){let i=this.map[t];i!==void 0&&i.setValue(e,n,r)}setOptional(e,t,n){let r=t[n];r!==void 0&&this.setValue(e,n,r)}static upload(e,t,n,r){for(let i=0,a=t.length;i!==a;++i){let a=t[i],o=n[a.id];o.needsUpdate!==!1&&a.setValue(e,o.value,r)}}static seqWithValue(e,t){let n=[];for(let r=0,i=e.length;r!==i;++r){let i=e[r];i.id in t&&n.push(i)}return n}};function oa(e,t,n){let r=e.createShader(t);return e.shaderSource(r,n),e.compileShader(r),r}var sa=37297,ca=0;function la(e,t){let n=e.split(`
`),r=[],i=Math.max(t-6,0),a=Math.min(t+6,n.length);for(let e=i;e<a;e++){let i=e+1;r.push(`${i===t?`>`:` `} ${i}: ${n[e]}`)}return r.join(`
`)}var ua=new k;function da(e){Oe._getMatrix(ua,Oe.workingColorSpace,e);let t=`mat3( ${ua.elements.map(e=>e.toFixed(4))} )`;switch(Oe.getTransfer(e)){case Jt:return[t,`LinearTransferOETF`];case Ue:return[t,`sRGBTransferOETF`];default:return console.warn(`THREE.WebGLProgram: Unsupported color space: `,e),[t,`LinearTransferOETF`]}}function fa(e,t,n){let r=e.getShaderParameter(t,e.COMPILE_STATUS),i=(e.getShaderInfoLog(t)||``).trim();if(r&&i===``)return``;let a=/ERROR: 0:(\d+)/.exec(i);if(a){let r=parseInt(a[1]);return n.toUpperCase()+`

`+i+`

`+la(e.getShaderSource(t),r)}return i}function pa(e,t){let n=da(t);return[`vec4 ${e}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,`}`].join(`
`)}function ma(e,t){let n;switch(t){case 1:n=`Linear`;break;case 2:n=`Reinhard`;break;case 3:n=`Cineon`;break;case 4:n=`ACESFilmic`;break;case 6:n=`AgX`;break;case 7:n=`Neutral`;break;case 5:n=`Custom`;break;default:console.warn(`THREE.WebGLProgram: Unsupported toneMapping:`,t),n=`Linear`}return`vec3 `+e+`( vec3 color ) { return `+n+`ToneMapping( color ); }`}var ha=new R;function ga(){return Oe.getLuminanceCoefficients(ha),[`float luminance( const in vec3 rgb ) {`,`	const vec3 weights = vec3( ${ha.x.toFixed(4)}, ${ha.y.toFixed(4)}, ${ha.z.toFixed(4)} );`,`	return dot( weights, rgb );`,`}`].join(`
`)}function _a(e){return[e.extensionClipCullDistance?`#extension GL_ANGLE_clip_cull_distance : require`:``,e.extensionMultiDraw?`#extension GL_ANGLE_multi_draw : require`:``].filter(ba).join(`
`)}function va(e){let t=[];for(let n in e){let r=e[n];r!==!1&&t.push(`#define `+n+` `+r)}return t.join(`
`)}function ya(e,t){let n={},r=e.getProgramParameter(t,e.ACTIVE_ATTRIBUTES);for(let i=0;i<r;i++){let r=e.getActiveAttrib(t,i),a=r.name,o=1;r.type===e.FLOAT_MAT2&&(o=2),r.type===e.FLOAT_MAT3&&(o=3),r.type===e.FLOAT_MAT4&&(o=4),n[a]={type:r.type,location:e.getAttribLocation(t,a),locationSize:o}}return n}function ba(e){return e!==``}function xa(e,t){let n=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return e.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Sa(e,t){return e.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Ca=/^[ \t]*#include +<([\w\d./]+)>/gm;function wa(e){return e.replace(Ca,Ea)}var Ta=new Map;function Ea(e,t){let n=mr[t];if(n===void 0){let e=Ta.get(t);if(e!==void 0)n=mr[e],console.warn(`THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.`,t,e);else throw Error(`Can not resolve #include <`+t+`>`)}return wa(n)}var Da=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Oa(e){return e.replace(Da,ka)}function ka(e,t,n,r){let i=``;for(let e=parseInt(t);e<parseInt(n);e++)i+=r.replace(/\[\s*i\s*\]/g,`[ `+e+` ]`).replace(/UNROLLED_LOOP_INDEX/g,e);return i}function Aa(e){let t=`precision ${e.precision} float;
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
#define LOW_PRECISION`),t}function ja(e){let t=`SHADOWMAP_TYPE_BASIC`;return e.shadowMapType===1?t=`SHADOWMAP_TYPE_PCF`:e.shadowMapType===2?t=`SHADOWMAP_TYPE_PCF_SOFT`:e.shadowMapType===3&&(t=`SHADOWMAP_TYPE_VSM`),t}function Ma(e){let t=`ENVMAP_TYPE_CUBE`;if(e.envMap)switch(e.envMapMode){case 301:case 302:t=`ENVMAP_TYPE_CUBE`;break;case 306:t=`ENVMAP_TYPE_CUBE_UV`}return t}function Na(e){let t=`ENVMAP_MODE_REFLECTION`;if(e.envMap)switch(e.envMapMode){case 302:t=`ENVMAP_MODE_REFRACTION`}return t}function Pa(e){let t=`ENVMAP_BLENDING_NONE`;if(e.envMap)switch(e.combine){case 0:t=`ENVMAP_BLENDING_MULTIPLY`;break;case 1:t=`ENVMAP_BLENDING_MIX`;break;case 2:t=`ENVMAP_BLENDING_ADD`}return t}function Fa(e){let t=e.envMapCubeUVHeight;if(t===null)return null;let n=Math.log2(t)-2,r=1/t;return{texelWidth:1/(3*Math.max(2**n,112)),texelHeight:r,maxMip:n}}function Ia(e,t,n,r){let i=e.getContext(),a=n.defines,o=n.vertexShader,s=n.fragmentShader,c=ja(n),l=Ma(n),u=Na(n),d=Pa(n),f=Fa(n),p=_a(n),m=va(a),h=i.createProgram(),g,_,v=n.glslVersion?`#version `+n.glslVersion+`
`:``;n.isRawShaderMaterial?(g=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(ba).join(`
`),g.length>0&&(g+=`
`),_=[`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m].filter(ba).join(`
`),_.length>0&&(_+=`
`)):(g=[Aa(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.extensionClipCullDistance?`#define USE_CLIP_DISTANCE`:``,n.batching?`#define USE_BATCHING`:``,n.batchingColor?`#define USE_BATCHING_COLOR`:``,n.instancing?`#define USE_INSTANCING`:``,n.instancingColor?`#define USE_INSTANCING_COLOR`:``,n.instancingMorph?`#define USE_INSTANCING_MORPH`:``,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.map?`#define USE_MAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+u:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.displacementMap?`#define USE_DISPLACEMENTMAP`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.mapUv?`#define MAP_UV `+n.mapUv:``,n.alphaMapUv?`#define ALPHAMAP_UV `+n.alphaMapUv:``,n.lightMapUv?`#define LIGHTMAP_UV `+n.lightMapUv:``,n.aoMapUv?`#define AOMAP_UV `+n.aoMapUv:``,n.emissiveMapUv?`#define EMISSIVEMAP_UV `+n.emissiveMapUv:``,n.bumpMapUv?`#define BUMPMAP_UV `+n.bumpMapUv:``,n.normalMapUv?`#define NORMALMAP_UV `+n.normalMapUv:``,n.displacementMapUv?`#define DISPLACEMENTMAP_UV `+n.displacementMapUv:``,n.metalnessMapUv?`#define METALNESSMAP_UV `+n.metalnessMapUv:``,n.roughnessMapUv?`#define ROUGHNESSMAP_UV `+n.roughnessMapUv:``,n.anisotropyMapUv?`#define ANISOTROPYMAP_UV `+n.anisotropyMapUv:``,n.clearcoatMapUv?`#define CLEARCOATMAP_UV `+n.clearcoatMapUv:``,n.clearcoatNormalMapUv?`#define CLEARCOAT_NORMALMAP_UV `+n.clearcoatNormalMapUv:``,n.clearcoatRoughnessMapUv?`#define CLEARCOAT_ROUGHNESSMAP_UV `+n.clearcoatRoughnessMapUv:``,n.iridescenceMapUv?`#define IRIDESCENCEMAP_UV `+n.iridescenceMapUv:``,n.iridescenceThicknessMapUv?`#define IRIDESCENCE_THICKNESSMAP_UV `+n.iridescenceThicknessMapUv:``,n.sheenColorMapUv?`#define SHEEN_COLORMAP_UV `+n.sheenColorMapUv:``,n.sheenRoughnessMapUv?`#define SHEEN_ROUGHNESSMAP_UV `+n.sheenRoughnessMapUv:``,n.specularMapUv?`#define SPECULARMAP_UV `+n.specularMapUv:``,n.specularColorMapUv?`#define SPECULAR_COLORMAP_UV `+n.specularColorMapUv:``,n.specularIntensityMapUv?`#define SPECULAR_INTENSITYMAP_UV `+n.specularIntensityMapUv:``,n.transmissionMapUv?`#define TRANSMISSIONMAP_UV `+n.transmissionMapUv:``,n.thicknessMapUv?`#define THICKNESSMAP_UV `+n.thicknessMapUv:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.flatShading?`#define FLAT_SHADED`:``,n.skinning?`#define USE_SKINNING`:``,n.morphTargets?`#define USE_MORPHTARGETS`:``,n.morphNormals&&n.flatShading===!1?`#define USE_MORPHNORMALS`:``,n.morphColors?`#define USE_MORPHCOLORS`:``,n.morphTargetsCount>0?`#define MORPHTARGETS_TEXTURE_STRIDE `+n.morphTextureStride:``,n.morphTargetsCount>0?`#define MORPHTARGETS_COUNT `+n.morphTargetsCount:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.sizeAttenuation?`#define USE_SIZEATTENUATION`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 modelMatrix;`,`uniform mat4 modelViewMatrix;`,`uniform mat4 projectionMatrix;`,`uniform mat4 viewMatrix;`,`uniform mat3 normalMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,`#ifdef USE_INSTANCING`,`	attribute mat4 instanceMatrix;`,`#endif`,`#ifdef USE_INSTANCING_COLOR`,`	attribute vec3 instanceColor;`,`#endif`,`#ifdef USE_INSTANCING_MORPH`,`	uniform sampler2D morphTexture;`,`#endif`,`attribute vec3 position;`,`attribute vec3 normal;`,`attribute vec2 uv;`,`#ifdef USE_UV1`,`	attribute vec2 uv1;`,`#endif`,`#ifdef USE_UV2`,`	attribute vec2 uv2;`,`#endif`,`#ifdef USE_UV3`,`	attribute vec2 uv3;`,`#endif`,`#ifdef USE_TANGENT`,`	attribute vec4 tangent;`,`#endif`,`#if defined( USE_COLOR_ALPHA )`,`	attribute vec4 color;`,`#elif defined( USE_COLOR )`,`	attribute vec3 color;`,`#endif`,`#ifdef USE_SKINNING`,`	attribute vec4 skinIndex;`,`	attribute vec4 skinWeight;`,`#endif`,`
`].filter(ba).join(`
`),_=[Aa(n),`#define SHADER_TYPE `+n.shaderType,`#define SHADER_NAME `+n.shaderName,m,n.useFog&&n.fog?`#define USE_FOG`:``,n.useFog&&n.fogExp2?`#define FOG_EXP2`:``,n.alphaToCoverage?`#define ALPHA_TO_COVERAGE`:``,n.map?`#define USE_MAP`:``,n.matcap?`#define USE_MATCAP`:``,n.envMap?`#define USE_ENVMAP`:``,n.envMap?`#define `+l:``,n.envMap?`#define `+u:``,n.envMap?`#define `+d:``,f?`#define CUBEUV_TEXEL_WIDTH `+f.texelWidth:``,f?`#define CUBEUV_TEXEL_HEIGHT `+f.texelHeight:``,f?`#define CUBEUV_MAX_MIP `+f.maxMip+`.0`:``,n.lightMap?`#define USE_LIGHTMAP`:``,n.aoMap?`#define USE_AOMAP`:``,n.bumpMap?`#define USE_BUMPMAP`:``,n.normalMap?`#define USE_NORMALMAP`:``,n.normalMapObjectSpace?`#define USE_NORMALMAP_OBJECTSPACE`:``,n.normalMapTangentSpace?`#define USE_NORMALMAP_TANGENTSPACE`:``,n.emissiveMap?`#define USE_EMISSIVEMAP`:``,n.anisotropy?`#define USE_ANISOTROPY`:``,n.anisotropyMap?`#define USE_ANISOTROPYMAP`:``,n.clearcoat?`#define USE_CLEARCOAT`:``,n.clearcoatMap?`#define USE_CLEARCOATMAP`:``,n.clearcoatRoughnessMap?`#define USE_CLEARCOAT_ROUGHNESSMAP`:``,n.clearcoatNormalMap?`#define USE_CLEARCOAT_NORMALMAP`:``,n.dispersion?`#define USE_DISPERSION`:``,n.iridescence?`#define USE_IRIDESCENCE`:``,n.iridescenceMap?`#define USE_IRIDESCENCEMAP`:``,n.iridescenceThicknessMap?`#define USE_IRIDESCENCE_THICKNESSMAP`:``,n.specularMap?`#define USE_SPECULARMAP`:``,n.specularColorMap?`#define USE_SPECULAR_COLORMAP`:``,n.specularIntensityMap?`#define USE_SPECULAR_INTENSITYMAP`:``,n.roughnessMap?`#define USE_ROUGHNESSMAP`:``,n.metalnessMap?`#define USE_METALNESSMAP`:``,n.alphaMap?`#define USE_ALPHAMAP`:``,n.alphaTest?`#define USE_ALPHATEST`:``,n.alphaHash?`#define USE_ALPHAHASH`:``,n.sheen?`#define USE_SHEEN`:``,n.sheenColorMap?`#define USE_SHEEN_COLORMAP`:``,n.sheenRoughnessMap?`#define USE_SHEEN_ROUGHNESSMAP`:``,n.transmission?`#define USE_TRANSMISSION`:``,n.transmissionMap?`#define USE_TRANSMISSIONMAP`:``,n.thicknessMap?`#define USE_THICKNESSMAP`:``,n.vertexTangents&&n.flatShading===!1?`#define USE_TANGENT`:``,n.vertexColors||n.instancingColor||n.batchingColor?`#define USE_COLOR`:``,n.vertexAlphas?`#define USE_COLOR_ALPHA`:``,n.vertexUv1s?`#define USE_UV1`:``,n.vertexUv2s?`#define USE_UV2`:``,n.vertexUv3s?`#define USE_UV3`:``,n.pointsUvs?`#define USE_POINTS_UV`:``,n.gradientMap?`#define USE_GRADIENTMAP`:``,n.flatShading?`#define FLAT_SHADED`:``,n.doubleSided?`#define DOUBLE_SIDED`:``,n.flipSided?`#define FLIP_SIDED`:``,n.shadowMapEnabled?`#define USE_SHADOWMAP`:``,n.shadowMapEnabled?`#define `+c:``,n.premultipliedAlpha?`#define PREMULTIPLIED_ALPHA`:``,n.numLightProbes>0?`#define USE_LIGHT_PROBES`:``,n.decodeVideoTexture?`#define DECODE_VIDEO_TEXTURE`:``,n.decodeVideoTextureEmissive?`#define DECODE_VIDEO_TEXTURE_EMISSIVE`:``,n.logarithmicDepthBuffer?`#define USE_LOGARITHMIC_DEPTH_BUFFER`:``,n.reversedDepthBuffer?`#define USE_REVERSED_DEPTH_BUFFER`:``,`uniform mat4 viewMatrix;`,`uniform vec3 cameraPosition;`,`uniform bool isOrthographic;`,n.toneMapping===0?``:`#define TONE_MAPPING`,n.toneMapping===0?``:mr.tonemapping_pars_fragment,n.toneMapping===0?``:ma(`toneMapping`,n.toneMapping),n.dithering?`#define DITHERING`:``,n.opaque?`#define OPAQUE`:``,mr.colorspace_pars_fragment,pa(`linearToOutputTexel`,n.outputColorSpace),ga(),n.useDepthPacking?`#define DEPTH_PACKING `+n.depthPacking:``,`
`].filter(ba).join(`
`)),o=wa(o),o=xa(o,n),o=Sa(o,n),s=wa(s),s=xa(s,n),s=Sa(s,n),o=Oa(o),s=Oa(s),n.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,g=[p,`#define attribute in`,`#define varying out`,`#define texture2D texture`].join(`
`)+`
`+g,_=[`#define varying in`,n.glslVersion===`300 es`?``:`layout(location = 0) out highp vec4 pc_fragColor;`,n.glslVersion===`300 es`?``:`#define gl_FragColor pc_fragColor`,`#define gl_FragDepthEXT gl_FragDepth`,`#define texture2D texture`,`#define textureCube texture`,`#define texture2DProj textureProj`,`#define texture2DLodEXT textureLod`,`#define texture2DProjLodEXT textureProjLod`,`#define textureCubeLodEXT textureLod`,`#define texture2DGradEXT textureGrad`,`#define texture2DProjGradEXT textureProjGrad`,`#define textureCubeGradEXT textureGrad`].join(`
`)+`
`+_);let y=v+g+o,b=v+_+s,x=oa(i,i.VERTEX_SHADER,y),S=oa(i,i.FRAGMENT_SHADER,b);i.attachShader(h,x),i.attachShader(h,S),n.index0AttributeName===void 0?n.morphTargets===!0&&i.bindAttribLocation(h,0,`position`):i.bindAttribLocation(h,0,n.index0AttributeName),i.linkProgram(h);function C(t){if(e.debug.checkShaderErrors){let n=i.getProgramInfoLog(h)||``,r=i.getShaderInfoLog(x)||``,a=i.getShaderInfoLog(S)||``,o=n.trim(),s=r.trim(),c=a.trim(),l=!0,u=!0;if(i.getProgramParameter(h,i.LINK_STATUS)===!1){if(l=!1,typeof e.debug.onShaderError==`function`)e.debug.onShaderError(i,h,x,S);else{let e=fa(i,x,`vertex`),n=fa(i,S,`fragment`);console.error(`THREE.WebGLProgram: Shader Error `+i.getError()+` - VALIDATE_STATUS `+i.getProgramParameter(h,i.VALIDATE_STATUS)+`

Material Name: `+t.name+`
Material Type: `+t.type+`

Program Info Log: `+o+`
`+e+`
`+n)}}else o===``?(s===``||c===``)&&(u=!1):console.warn(`THREE.WebGLProgram: Program Info Log:`,o);u&&(t.diagnostics={runnable:l,programLog:o,vertexShader:{log:s,prefix:g},fragmentShader:{log:c,prefix:_}})}i.deleteShader(x),i.deleteShader(S),w=new aa(i,h),T=ya(i,h)}let w;this.getUniforms=function(){return w===void 0&&C(this),w};let T;this.getAttributes=function(){return T===void 0&&C(this),T};let E=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=i.getProgramParameter(h,sa)),E},this.destroy=function(){r.releaseStatesOfProgram(this),i.deleteProgram(h),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=ca++,this.cacheKey=t,this.usedTimes=1,this.program=h,this.vertexShader=x,this.fragmentShader=S,this}var La=0,Ra=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,r=this._getShaderStage(t),i=this._getShaderStage(n),a=this._getShaderCacheForMaterial(e);return a.has(r)===!1&&(a.add(r),r.usedTimes++),a.has(i)===!1&&(a.add(i),i.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let e of t)e.usedTimes--,e.usedTimes===0&&this.shaderCache.delete(e.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new za(e),t.set(e,n)),n}},za=class{constructor(e){this.id=La++,this.code=e,this.usedTimes=0}};function Ba(e,t,n,r,i,a,o){let s=new Ct,c=new Ra,l=new Set,u=[],d=i.logarithmicDepthBuffer,f=i.vertexTextures,p=i.precision,m={MeshDepthMaterial:`depth`,MeshDistanceMaterial:`distanceRGBA`,MeshNormalMaterial:`normal`,MeshBasicMaterial:`basic`,MeshLambertMaterial:`lambert`,MeshPhongMaterial:`phong`,MeshToonMaterial:`toon`,MeshStandardMaterial:`physical`,MeshPhysicalMaterial:`physical`,MeshMatcapMaterial:`matcap`,LineBasicMaterial:`basic`,LineDashedMaterial:`dashed`,PointsMaterial:`points`,ShadowMaterial:`shadow`,SpriteMaterial:`sprite`};function h(e){return l.add(e),e===0?`uv`:`uv${e}`}function g(a,s,u,g,_){let v=g.fog,y=_.geometry,b=a.isMeshStandardMaterial?g.environment:null,x=(a.isMeshStandardMaterial?n:t).get(a.envMap||b),S=x&&x.mapping===306?x.image.height:null,C=m[a.type];a.precision!==null&&(p=i.getMaxPrecision(a.precision),p!==a.precision&&console.warn(`THREE.WebGLProgram.getParameters:`,a.precision,`not supported, using`,p,`instead.`));let w=y.morphAttributes.position||y.morphAttributes.normal||y.morphAttributes.color,T=w===void 0?0:w.length,E=0;y.morphAttributes.position!==void 0&&(E=1),y.morphAttributes.normal!==void 0&&(E=2),y.morphAttributes.color!==void 0&&(E=3);let D,ee,te,ne;if(C){let e=hr[C];D=e.vertexShader,ee=e.fragmentShader}else D=a.vertexShader,ee=a.fragmentShader,c.update(a),te=c.getVertexShaderID(a),ne=c.getFragmentShaderID(a);let re=e.getRenderTarget(),ie=e.state.buffers.depth.getReversed(),ae=_.isInstancedMesh===!0,oe=_.isBatchedMesh===!0,se=!!a.map,ce=!!a.matcap,le=!!x,O=!!a.aoMap,ue=!!a.lightMap,de=!!a.bumpMap,fe=!!a.normalMap,pe=!!a.displacementMap,me=!!a.emissiveMap,he=!!a.metalnessMap,ge=!!a.roughnessMap,k=a.anisotropy>0,_e=a.clearcoat>0,ve=a.dispersion>0,A=a.iridescence>0,ye=a.sheen>0,be=a.transmission>0,xe=k&&!!a.anisotropyMap,j=_e&&!!a.clearcoatMap,Se=_e&&!!a.clearcoatNormalMap,M=_e&&!!a.clearcoatRoughnessMap,N=A&&!!a.iridescenceMap,Ce=A&&!!a.iridescenceThicknessMap,we=ye&&!!a.sheenColorMap,Te=ye&&!!a.sheenRoughnessMap,Ee=!!a.specularMap,De=!!a.specularColorMap,P=!!a.specularIntensityMap,ke=be&&!!a.transmissionMap,Ae=be&&!!a.thicknessMap,je=!!a.gradientMap,Me=!!a.alphaMap,Ne=a.alphaTest>0,Pe=!!a.alphaHash,Fe=!!a.extensions,Ie=0;a.toneMapped&&(re===null||re.isXRRenderTarget===!0)&&(Ie=e.toneMapping);let Le={shaderID:C,shaderType:a.type,shaderName:a.name,vertexShader:D,fragmentShader:ee,defines:a.defines,customVertexShaderID:te,customFragmentShaderID:ne,isRawShaderMaterial:a.isRawShaderMaterial===!0,glslVersion:a.glslVersion,precision:p,batching:oe,batchingColor:oe&&_._colorsTexture!==null,instancing:ae,instancingColor:ae&&_.instanceColor!==null,instancingMorph:ae&&_.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:re===null?e.outputColorSpace:re.isXRRenderTarget===!0?re.texture.colorSpace:dt,alphaToCoverage:!!a.alphaToCoverage,map:se,matcap:ce,envMap:le,envMapMode:le&&x.mapping,envMapCubeUVHeight:S,aoMap:O,lightMap:ue,bumpMap:de,normalMap:fe,displacementMap:f&&pe,emissiveMap:me,normalMapObjectSpace:fe&&a.normalMapType===1,normalMapTangentSpace:fe&&a.normalMapType===0,metalnessMap:he,roughnessMap:ge,anisotropy:k,anisotropyMap:xe,clearcoat:_e,clearcoatMap:j,clearcoatNormalMap:Se,clearcoatRoughnessMap:M,dispersion:ve,iridescence:A,iridescenceMap:N,iridescenceThicknessMap:Ce,sheen:ye,sheenColorMap:we,sheenRoughnessMap:Te,specularMap:Ee,specularColorMap:De,specularIntensityMap:P,transmission:be,transmissionMap:ke,thicknessMap:Ae,gradientMap:je,opaque:a.transparent===!1&&a.blending===1&&a.alphaToCoverage===!1,alphaMap:Me,alphaTest:Ne,alphaHash:Pe,combine:a.combine,mapUv:se&&h(a.map.channel),aoMapUv:O&&h(a.aoMap.channel),lightMapUv:ue&&h(a.lightMap.channel),bumpMapUv:de&&h(a.bumpMap.channel),normalMapUv:fe&&h(a.normalMap.channel),displacementMapUv:pe&&h(a.displacementMap.channel),emissiveMapUv:me&&h(a.emissiveMap.channel),metalnessMapUv:he&&h(a.metalnessMap.channel),roughnessMapUv:ge&&h(a.roughnessMap.channel),anisotropyMapUv:xe&&h(a.anisotropyMap.channel),clearcoatMapUv:j&&h(a.clearcoatMap.channel),clearcoatNormalMapUv:Se&&h(a.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:M&&h(a.clearcoatRoughnessMap.channel),iridescenceMapUv:N&&h(a.iridescenceMap.channel),iridescenceThicknessMapUv:Ce&&h(a.iridescenceThicknessMap.channel),sheenColorMapUv:we&&h(a.sheenColorMap.channel),sheenRoughnessMapUv:Te&&h(a.sheenRoughnessMap.channel),specularMapUv:Ee&&h(a.specularMap.channel),specularColorMapUv:De&&h(a.specularColorMap.channel),specularIntensityMapUv:P&&h(a.specularIntensityMap.channel),transmissionMapUv:ke&&h(a.transmissionMap.channel),thicknessMapUv:Ae&&h(a.thicknessMap.channel),alphaMapUv:Me&&h(a.alphaMap.channel),vertexTangents:!!y.attributes.tangent&&(fe||k),vertexColors:a.vertexColors,vertexAlphas:a.vertexColors===!0&&!!y.attributes.color&&y.attributes.color.itemSize===4,pointsUvs:_.isPoints===!0&&!!y.attributes.uv&&(se||Me),fog:!!v,useFog:a.fog===!0,fogExp2:!!v&&v.isFogExp2,flatShading:a.flatShading===!0&&a.wireframe===!1,sizeAttenuation:a.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:ie,skinning:_.isSkinnedMesh===!0,morphTargets:y.morphAttributes.position!==void 0,morphNormals:y.morphAttributes.normal!==void 0,morphColors:y.morphAttributes.color!==void 0,morphTargetsCount:T,morphTextureStride:E,numDirLights:s.directional.length,numPointLights:s.point.length,numSpotLights:s.spot.length,numSpotLightMaps:s.spotLightMap.length,numRectAreaLights:s.rectArea.length,numHemiLights:s.hemi.length,numDirLightShadows:s.directionalShadowMap.length,numPointLightShadows:s.pointShadowMap.length,numSpotLightShadows:s.spotShadowMap.length,numSpotLightShadowsWithMaps:s.numSpotLightShadowsWithMaps,numLightProbes:s.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:a.dithering,shadowMapEnabled:e.shadowMap.enabled&&u.length>0,shadowMapType:e.shadowMap.type,toneMapping:Ie,decodeVideoTexture:se&&a.map.isVideoTexture===!0&&Oe.getTransfer(a.map.colorSpace)===`srgb`,decodeVideoTextureEmissive:me&&a.emissiveMap.isVideoTexture===!0&&Oe.getTransfer(a.emissiveMap.colorSpace)===`srgb`,premultipliedAlpha:a.premultipliedAlpha,doubleSided:a.side===2,flipSided:a.side===1,useDepthPacking:a.depthPacking>=0,depthPacking:a.depthPacking||0,index0AttributeName:a.index0AttributeName,extensionClipCullDistance:Fe&&a.extensions.clipCullDistance===!0&&r.has(`WEBGL_clip_cull_distance`),extensionMultiDraw:(Fe&&a.extensions.multiDraw===!0||oe)&&r.has(`WEBGL_multi_draw`),rendererExtensionParallelShaderCompile:r.has(`KHR_parallel_shader_compile`),customProgramCacheKey:a.customProgramCacheKey()};return Le.vertexUv1s=l.has(1),Le.vertexUv2s=l.has(2),Le.vertexUv3s=l.has(3),l.clear(),Le}function _(t){let n=[];if(t.shaderID?n.push(t.shaderID):(n.push(t.customVertexShaderID),n.push(t.customFragmentShaderID)),t.defines!==void 0)for(let e in t.defines)n.push(e),n.push(t.defines[e]);return t.isRawShaderMaterial===!1&&(v(n,t),y(n,t),n.push(e.outputColorSpace)),n.push(t.customProgramCacheKey),n.join()}function v(e,t){e.push(t.precision),e.push(t.outputColorSpace),e.push(t.envMapMode),e.push(t.envMapCubeUVHeight),e.push(t.mapUv),e.push(t.alphaMapUv),e.push(t.lightMapUv),e.push(t.aoMapUv),e.push(t.bumpMapUv),e.push(t.normalMapUv),e.push(t.displacementMapUv),e.push(t.emissiveMapUv),e.push(t.metalnessMapUv),e.push(t.roughnessMapUv),e.push(t.anisotropyMapUv),e.push(t.clearcoatMapUv),e.push(t.clearcoatNormalMapUv),e.push(t.clearcoatRoughnessMapUv),e.push(t.iridescenceMapUv),e.push(t.iridescenceThicknessMapUv),e.push(t.sheenColorMapUv),e.push(t.sheenRoughnessMapUv),e.push(t.specularMapUv),e.push(t.specularColorMapUv),e.push(t.specularIntensityMapUv),e.push(t.transmissionMapUv),e.push(t.thicknessMapUv),e.push(t.combine),e.push(t.fogExp2),e.push(t.sizeAttenuation),e.push(t.morphTargetsCount),e.push(t.morphAttributeCount),e.push(t.numDirLights),e.push(t.numPointLights),e.push(t.numSpotLights),e.push(t.numSpotLightMaps),e.push(t.numHemiLights),e.push(t.numRectAreaLights),e.push(t.numDirLightShadows),e.push(t.numPointLightShadows),e.push(t.numSpotLightShadows),e.push(t.numSpotLightShadowsWithMaps),e.push(t.numLightProbes),e.push(t.shadowMapType),e.push(t.toneMapping),e.push(t.numClippingPlanes),e.push(t.numClipIntersection),e.push(t.depthPacking)}function y(e,t){s.disableAll(),t.supportsVertexTextures&&s.enable(0),t.instancing&&s.enable(1),t.instancingColor&&s.enable(2),t.instancingMorph&&s.enable(3),t.matcap&&s.enable(4),t.envMap&&s.enable(5),t.normalMapObjectSpace&&s.enable(6),t.normalMapTangentSpace&&s.enable(7),t.clearcoat&&s.enable(8),t.iridescence&&s.enable(9),t.alphaTest&&s.enable(10),t.vertexColors&&s.enable(11),t.vertexAlphas&&s.enable(12),t.vertexUv1s&&s.enable(13),t.vertexUv2s&&s.enable(14),t.vertexUv3s&&s.enable(15),t.vertexTangents&&s.enable(16),t.anisotropy&&s.enable(17),t.alphaHash&&s.enable(18),t.batching&&s.enable(19),t.dispersion&&s.enable(20),t.batchingColor&&s.enable(21),t.gradientMap&&s.enable(22),e.push(s.mask),s.disableAll(),t.fog&&s.enable(0),t.useFog&&s.enable(1),t.flatShading&&s.enable(2),t.logarithmicDepthBuffer&&s.enable(3),t.reversedDepthBuffer&&s.enable(4),t.skinning&&s.enable(5),t.morphTargets&&s.enable(6),t.morphNormals&&s.enable(7),t.morphColors&&s.enable(8),t.premultipliedAlpha&&s.enable(9),t.shadowMapEnabled&&s.enable(10),t.doubleSided&&s.enable(11),t.flipSided&&s.enable(12),t.useDepthPacking&&s.enable(13),t.dithering&&s.enable(14),t.transmission&&s.enable(15),t.sheen&&s.enable(16),t.opaque&&s.enable(17),t.pointsUvs&&s.enable(18),t.decodeVideoTexture&&s.enable(19),t.decodeVideoTextureEmissive&&s.enable(20),t.alphaToCoverage&&s.enable(21),e.push(s.mask)}function b(e){let t=m[e.type],n;if(t){let e=hr[t];n=ht.clone(e.uniforms)}else n=e.uniforms;return n}function x(t,n){let r;for(let e=0,t=u.length;e<t;e++){let t=u[e];if(t.cacheKey===n){r=t,++r.usedTimes;break}}return r===void 0&&(r=new Ia(e,n,t,a),u.push(r)),r}function S(e){if(--e.usedTimes===0){let t=u.indexOf(e);u[t]=u[u.length-1],u.pop(),e.destroy()}}function C(e){c.remove(e)}function w(){c.dispose()}return{getParameters:g,getProgramCacheKey:_,getUniforms:b,acquireProgram:x,releaseProgram:S,releaseShaderCache:C,programs:u,dispose:w}}function Va(){let e=new WeakMap;function t(t){return e.has(t)}function n(t){let n=e.get(t);return n===void 0&&(n={},e.set(t,n)),n}function r(t){e.delete(t)}function i(t,n,r){e.get(t)[n]=r}function a(){e=new WeakMap}return{has:t,get:n,remove:r,update:i,dispose:a}}function Ha(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.material.id===t.material.id?e.z===t.z?e.id-t.id:e.z-t.z:e.material.id-t.material.id:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Ua(e,t){return e.groupOrder===t.groupOrder?e.renderOrder===t.renderOrder?e.z===t.z?e.id-t.id:t.z-e.z:e.renderOrder-t.renderOrder:e.groupOrder-t.groupOrder}function Wa(){let e=[],t=0,n=[],r=[],i=[];function a(){t=0,n.length=0,r.length=0,i.length=0}function o(n,r,i,a,o,s){let c=e[t];return c===void 0?(c={id:n.id,object:n,geometry:r,material:i,groupOrder:a,renderOrder:n.renderOrder,z:o,group:s},e[t]=c):(c.id=n.id,c.object=n,c.geometry=r,c.material=i,c.groupOrder=a,c.renderOrder=n.renderOrder,c.z=o,c.group=s),t++,c}function s(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.push(u):a.transparent===!0?i.push(u):n.push(u)}function c(e,t,a,s,c,l){let u=o(e,t,a,s,c,l);a.transmission>0?r.unshift(u):a.transparent===!0?i.unshift(u):n.unshift(u)}function l(e,t){n.length>1&&n.sort(e||Ha),r.length>1&&r.sort(t||Ua),i.length>1&&i.sort(t||Ua)}function u(){for(let n=t,r=e.length;n<r;n++){let t=e[n];if(t.id===null)break;t.id=null,t.object=null,t.geometry=null,t.material=null,t.group=null}}return{opaque:n,transmissive:r,transparent:i,init:a,push:s,unshift:c,finish:u,sort:l}}function Ga(){let e=new WeakMap;function t(t,n){let r=e.get(t),i;return r===void 0?(i=new Wa,e.set(t,[i])):n>=r.length?(i=new Wa,r.push(i)):i=r[n],i}function n(){e=new WeakMap}return{get:t,dispose:n}}function Ka(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={direction:new R,color:new Ce};break;case`SpotLight`:n={position:new R,direction:new R,color:new Ce,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case`PointLight`:n={position:new R,color:new Ce,distance:0,decay:0};break;case`HemisphereLight`:n={direction:new R,skyColor:new Ce,groundColor:new Ce};break;case`RectAreaLight`:n={color:new Ce,position:new R,halfWidth:new R,halfHeight:new R}}return e[t.id]=n,n}}}function qa(){let e={};return{get:function(t){if(e[t.id]!==void 0)return e[t.id];let n;switch(t.type){case`DirectionalLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new L};break;case`SpotLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new L};break;case`PointLight`:n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new L,shadowCameraNear:1,shadowCameraFar:1e3}}return e[t.id]=n,n}}}var Ja=0;function Ya(e,t){return(t.castShadow?2:0)-(e.castShadow?2:0)+ +!!t.map-!!e.map}function Xa(e){let t=new Ka,n=qa(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let e=0;e<9;e++)r.probe.push(new R);let i=new R,a=new z,o=new z;function s(i){let a=0,o=0,s=0;for(let e=0;e<9;e++)r.probe[e].set(0,0,0);let c=0,l=0,u=0,d=0,f=0,p=0,m=0,h=0,g=0,_=0,v=0;i.sort(Ya);for(let e=0,y=i.length;e<y;e++){let y=i[e],b=y.color,x=y.intensity,S=y.distance,C=y.shadow&&y.shadow.map?y.shadow.map.texture:null;if(y.isAmbientLight)a+=b.r*x,o+=b.g*x,s+=b.b*x;else if(y.isLightProbe){for(let e=0;e<9;e++)r.probe[e].addScaledVector(y.sh.coefficients[e],x);v++}else if(y.isDirectionalLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,r.directionalShadow[c]=t,r.directionalShadowMap[c]=C,r.directionalShadowMatrix[c]=y.shadow.matrix,p++}r.directional[c]=e,c++}else if(y.isSpotLight){let e=t.get(y);e.position.setFromMatrixPosition(y.matrixWorld),e.color.copy(b).multiplyScalar(x),e.distance=S,e.coneCos=Math.cos(y.angle),e.penumbraCos=Math.cos(y.angle*(1-y.penumbra)),e.decay=y.decay,r.spot[u]=e;let i=y.shadow;if(y.map&&(r.spotLightMap[g]=y.map,g++,i.updateMatrices(y),y.castShadow&&_++),r.spotLightMatrix[u]=i.matrix,y.castShadow){let e=n.get(y);e.shadowIntensity=i.intensity,e.shadowBias=i.bias,e.shadowNormalBias=i.normalBias,e.shadowRadius=i.radius,e.shadowMapSize=i.mapSize,r.spotShadow[u]=e,r.spotShadowMap[u]=C,h++}u++}else if(y.isRectAreaLight){let e=t.get(y);e.color.copy(b).multiplyScalar(x),e.halfWidth.set(y.width*.5,0,0),e.halfHeight.set(0,y.height*.5,0),r.rectArea[d]=e,d++}else if(y.isPointLight){let e=t.get(y);if(e.color.copy(y.color).multiplyScalar(y.intensity),e.distance=y.distance,e.decay=y.decay,y.castShadow){let e=y.shadow,t=n.get(y);t.shadowIntensity=e.intensity,t.shadowBias=e.bias,t.shadowNormalBias=e.normalBias,t.shadowRadius=e.radius,t.shadowMapSize=e.mapSize,t.shadowCameraNear=e.camera.near,t.shadowCameraFar=e.camera.far,r.pointShadow[l]=t,r.pointShadowMap[l]=C,r.pointShadowMatrix[l]=y.shadow.matrix,m++}r.point[l]=e,l++}else if(y.isHemisphereLight){let e=t.get(y);e.skyColor.copy(y.color).multiplyScalar(x),e.groundColor.copy(y.groundColor).multiplyScalar(x),r.hemi[f]=e,f++}}d>0&&(e.has(`OES_texture_float_linear`)===!0?(r.rectAreaLTC1=q.LTC_FLOAT_1,r.rectAreaLTC2=q.LTC_FLOAT_2):(r.rectAreaLTC1=q.LTC_HALF_1,r.rectAreaLTC2=q.LTC_HALF_2)),r.ambient[0]=a,r.ambient[1]=o,r.ambient[2]=s;let y=r.hash;(y.directionalLength!==c||y.pointLength!==l||y.spotLength!==u||y.rectAreaLength!==d||y.hemiLength!==f||y.numDirectionalShadows!==p||y.numPointShadows!==m||y.numSpotShadows!==h||y.numSpotMaps!==g||y.numLightProbes!==v)&&(r.directional.length=c,r.spot.length=u,r.rectArea.length=d,r.point.length=l,r.hemi.length=f,r.directionalShadow.length=p,r.directionalShadowMap.length=p,r.pointShadow.length=m,r.pointShadowMap.length=m,r.spotShadow.length=h,r.spotShadowMap.length=h,r.directionalShadowMatrix.length=p,r.pointShadowMatrix.length=m,r.spotLightMatrix.length=h+g-_,r.spotLightMap.length=g,r.numSpotLightShadowsWithMaps=_,r.numLightProbes=v,y.directionalLength=c,y.pointLength=l,y.spotLength=u,y.rectAreaLength=d,y.hemiLength=f,y.numDirectionalShadows=p,y.numPointShadows=m,y.numSpotShadows=h,y.numSpotMaps=g,y.numLightProbes=v,r.version=Ja++)}function c(e,t){let n=0,s=0,c=0,l=0,u=0,d=t.matrixWorldInverse;for(let t=0,f=e.length;t<f;t++){let f=e[t];if(f.isDirectionalLight){let e=r.directional[n];e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),n++}else if(f.isSpotLight){let e=r.spot[c];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),e.direction.setFromMatrixPosition(f.matrixWorld),i.setFromMatrixPosition(f.target.matrixWorld),e.direction.sub(i),e.direction.transformDirection(d),c++}else if(f.isRectAreaLight){let e=r.rectArea[l];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),o.identity(),a.copy(f.matrixWorld),a.premultiply(d),o.extractRotation(a),e.halfWidth.set(f.width*.5,0,0),e.halfHeight.set(0,f.height*.5,0),e.halfWidth.applyMatrix4(o),e.halfHeight.applyMatrix4(o),l++}else if(f.isPointLight){let e=r.point[s];e.position.setFromMatrixPosition(f.matrixWorld),e.position.applyMatrix4(d),s++}else if(f.isHemisphereLight){let e=r.hemi[u];e.direction.setFromMatrixPosition(f.matrixWorld),e.direction.transformDirection(d),u++}}}return{setup:s,setupView:c,state:r}}function Za(e){let t=new Xa(e),n=[],r=[];function i(e){l.camera=e,n.length=0,r.length=0}function a(e){n.push(e)}function o(e){r.push(e)}function s(){t.setup(n)}function c(e){t.setupView(n,e)}let l={lightsArray:n,shadowsArray:r,camera:null,lights:t,transmissionRenderTarget:{}};return{init:i,state:l,setupLights:s,setupLightsView:c,pushLight:a,pushShadow:o}}function Qa(e){let t=new WeakMap;function n(n,r=0){let i=t.get(n),a;return i===void 0?(a=new Za(e),t.set(n,[a])):r>=i.length?(a=new Za(e),i.push(a)):a=i[r],a}function r(){t=new WeakMap}return{get:n,dispose:r}}var $a=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,eo=`uniform sampler2D shadow_pass;
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
}`;function to(e,t,n){let r=new wt,i=new L,a=new L,o=new mt,s=new ve({depthPacking:nt}),c=new Le,l={},u=n.maxTextureSize,d={0:1,1:0,2:2},f=new pe({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new L},radius:{value:4}},vertexShader:$a,fragmentShader:eo}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let m=new Ie;m.setAttribute(`position`,new _e(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let h=new Je(m,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let _=this.type;this.render=function(t,n,s){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||t.length===0)return;let c=e.getRenderTarget(),l=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),f=e.state;f.setBlending(0),f.buffers.depth.getReversed()===!0?f.buffers.color.setClear(0,0,0,0):f.buffers.color.setClear(1,1,1,1),f.buffers.depth.setTest(!0),f.setScissorTest(!1);let p=_!==3&&this.type===3,m=_===3&&this.type!==3;for(let c=0,l=t.length;c<l;c++){let l=t[c],d=l.shadow;if(d===void 0){console.warn(`THREE.WebGLShadowMap:`,l,`has no shadow.`);continue}if(d.autoUpdate===!1&&d.needsUpdate===!1)continue;i.copy(d.mapSize);let h=d.getFrameExtents();if(i.multiply(h),a.copy(d.mapSize),(i.x>u||i.y>u)&&(i.x>u&&(a.x=Math.floor(u/h.x),i.x=a.x*h.x,d.mapSize.x=a.x),i.y>u&&(a.y=Math.floor(u/h.y),i.y=a.y*h.y,d.mapSize.y=a.y)),d.map===null||p===!0||m===!0){let e=this.type===3?{}:{minFilter:Fe,magFilter:Fe};d.map!==null&&d.map.dispose(),d.map=new kt(i.x,i.y,e),d.map.texture.name=l.name+`.shadowMap`,d.camera.updateProjectionMatrix()}e.setRenderTarget(d.map),e.clear();let g=d.getViewportCount();for(let e=0;e<g;e++){let t=d.getViewport(e);o.set(a.x*t.x,a.y*t.y,a.x*t.z,a.y*t.w),f.viewport(o),d.updateMatrices(l,e),r=d.getFrustum(),b(n,s,d.camera,l,this.type)}d.isPointLightShadow!==!0&&this.type===3&&v(d,s),d.needsUpdate=!1}_=this.type,g.needsUpdate=!1,e.setRenderTarget(c,l,d)};function v(n,r){let a=t.update(h);f.defines.VSM_SAMPLES!==n.blurSamples&&(f.defines.VSM_SAMPLES=n.blurSamples,p.defines.VSM_SAMPLES=n.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),n.mapPass===null&&(n.mapPass=new kt(i.x,i.y)),f.uniforms.shadow_pass.value=n.map.texture,f.uniforms.resolution.value=n.mapSize,f.uniforms.radius.value=n.radius,e.setRenderTarget(n.mapPass),e.clear(),e.renderBufferDirect(r,null,a,f,h,null),p.uniforms.shadow_pass.value=n.mapPass.texture,p.uniforms.resolution.value=n.mapSize,p.uniforms.radius.value=n.radius,e.setRenderTarget(n.map),e.clear(),e.renderBufferDirect(r,null,a,p,h,null)}function y(t,n,r,i){let a=null,o=r.isPointLight===!0?t.customDistanceMaterial:t.customDepthMaterial;if(o!==void 0)a=o;else if(a=r.isPointLight===!0?c:s,e.localClippingEnabled&&n.clipShadows===!0&&Array.isArray(n.clippingPlanes)&&n.clippingPlanes.length!==0||n.displacementMap&&n.displacementScale!==0||n.alphaMap&&n.alphaTest>0||n.map&&n.alphaTest>0||n.alphaToCoverage===!0){let e=a.uuid,t=n.uuid,r=l[e];r===void 0&&(r={},l[e]=r);let i=r[t];i===void 0&&(i=a.clone(),r[t]=i,n.addEventListener(`dispose`,x)),a=i}if(a.visible=n.visible,a.wireframe=n.wireframe,i===3?a.side=n.shadowSide===null?n.side:n.shadowSide:a.side=n.shadowSide===null?d[n.side]:n.shadowSide,a.alphaMap=n.alphaMap,a.alphaTest=n.alphaToCoverage===!0?.5:n.alphaTest,a.map=n.map,a.clipShadows=n.clipShadows,a.clippingPlanes=n.clippingPlanes,a.clipIntersection=n.clipIntersection,a.displacementMap=n.displacementMap,a.displacementScale=n.displacementScale,a.displacementBias=n.displacementBias,a.wireframeLinewidth=n.wireframeLinewidth,a.linewidth=n.linewidth,r.isPointLight===!0&&a.isMeshDistanceMaterial===!0){let t=e.properties.get(a);t.light=r}return a}function b(n,i,a,o,s){if(n.visible===!1)return;if(n.layers.test(i.layers)&&(n.isMesh||n.isLine||n.isPoints)&&(n.castShadow||n.receiveShadow&&s===3)&&(!n.frustumCulled||r.intersectsObject(n))){n.modelViewMatrix.multiplyMatrices(a.matrixWorldInverse,n.matrixWorld);let r=t.update(n),c=n.material;if(Array.isArray(c)){let t=r.groups;for(let l=0,u=t.length;l<u;l++){let u=t[l],d=c[u.materialIndex];if(d&&d.visible){let t=y(n,d,o,s);n.onBeforeShadow(e,n,i,a,r,t,u),e.renderBufferDirect(a,null,r,t,n,u),n.onAfterShadow(e,n,i,a,r,t,u)}}}else if(c.visible){let t=y(n,c,o,s);n.onBeforeShadow(e,n,i,a,r,t,null),e.renderBufferDirect(a,null,r,t,n,null),n.onAfterShadow(e,n,i,a,r,t,null)}}let c=n.children;for(let e=0,t=c.length;e<t;e++)b(c[e],i,a,o,s)}function x(e){e.target.removeEventListener(`dispose`,x);for(let t in l){let n=l[t],r=e.target.uuid;r in n&&(n[r].dispose(),delete n[r])}}}var no={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3};function ro(e,t){function n(){let t=!1,n=new mt,r=null,i=new mt(0,0,0,0);return{setMask:function(n){r!==n&&!t&&(e.colorMask(n,n,n,n),r=n)},setLocked:function(e){t=e},setClear:function(t,r,a,o,s){s===!0&&(t*=o,r*=o,a*=o),n.set(t,r,a,o),i.equals(n)===!1&&(e.clearColor(t,r,a,o),i.copy(n))},reset:function(){t=!1,r=null,i.set(-1,0,0,0)}}}function r(){let n=!1,r=!1,i=null,a=null,o=null;return{setReversed:function(e){if(r!==e){let n=t.get(`EXT_clip_control`);e?n.clipControlEXT(n.LOWER_LEFT_EXT,n.ZERO_TO_ONE_EXT):n.clipControlEXT(n.LOWER_LEFT_EXT,n.NEGATIVE_ONE_TO_ONE_EXT),r=e;let i=o;o=null,this.setClear(i)}},getReversed:function(){return r},setTest:function(t){t?me(e.DEPTH_TEST):he(e.DEPTH_TEST)},setMask:function(t){i!==t&&!n&&(e.depthMask(t),i=t)},setFunc:function(t){if(r&&(t=no[t]),a!==t){switch(t){case 0:e.depthFunc(e.NEVER);break;case 1:e.depthFunc(e.ALWAYS);break;case 2:e.depthFunc(e.LESS);break;case 3:e.depthFunc(e.LEQUAL);break;case 4:e.depthFunc(e.EQUAL);break;case 5:e.depthFunc(e.GEQUAL);break;case 6:e.depthFunc(e.GREATER);break;case 7:e.depthFunc(e.NOTEQUAL);break;default:e.depthFunc(e.LEQUAL)}a=t}},setLocked:function(e){n=e},setClear:function(t){o!==t&&(r&&(t=1-t),e.clearDepth(t),o=t)},reset:function(){n=!1,i=null,a=null,o=null,r=!1}}}function i(){let t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null;return{setTest:function(n){t||(n?me(e.STENCIL_TEST):he(e.STENCIL_TEST))},setMask:function(r){n!==r&&!t&&(e.stencilMask(r),n=r)},setFunc:function(t,n,o){(r!==t||i!==n||a!==o)&&(e.stencilFunc(t,n,o),r=t,i=n,a=o)},setOp:function(t,n,r){(o!==t||s!==n||c!==r)&&(e.stencilOp(t,n,r),o=t,s=n,c=r)},setLocked:function(e){t=e},setClear:function(t){l!==t&&(e.clearStencil(t),l=t)},reset:function(){t=!1,n=null,r=null,i=null,a=null,o=null,s=null,c=null,l=null}}}let a=new n,o=new r,s=new i,c=new WeakMap,l=new WeakMap,u={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new Ce(0,0,0),w=0,T=!1,E=null,D=null,ee=null,te=null,ne=null,re=e.getParameter(e.MAX_COMBINED_TEXTURE_IMAGE_UNITS),ie=!1,ae=0,oe=e.getParameter(e.VERSION);oe.indexOf(`WebGL`)===-1?oe.indexOf(`OpenGL ES`)!==-1&&(ae=parseFloat(/^OpenGL ES (\d)/.exec(oe)[1]),ie=ae>=2):(ae=parseFloat(/^WebGL (\d)/.exec(oe)[1]),ie=ae>=1);let se=null,ce={},le=e.getParameter(e.SCISSOR_BOX),O=e.getParameter(e.VIEWPORT),ue=new mt().fromArray(le),de=new mt().fromArray(O);function fe(t,n,r,i){let a=new Uint8Array(4),o=e.createTexture();e.bindTexture(t,o),e.texParameteri(t,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(t,e.TEXTURE_MAG_FILTER,e.NEAREST);for(let o=0;o<r;o++)t===e.TEXTURE_3D||t===e.TEXTURE_2D_ARRAY?e.texImage3D(n,0,e.RGBA,1,1,i,0,e.RGBA,e.UNSIGNED_BYTE,a):e.texImage2D(n+o,0,e.RGBA,1,1,0,e.RGBA,e.UNSIGNED_BYTE,a);return o}let pe={};pe[e.TEXTURE_2D]=fe(e.TEXTURE_2D,e.TEXTURE_2D,1),pe[e.TEXTURE_CUBE_MAP]=fe(e.TEXTURE_CUBE_MAP,e.TEXTURE_CUBE_MAP_POSITIVE_X,6),pe[e.TEXTURE_2D_ARRAY]=fe(e.TEXTURE_2D_ARRAY,e.TEXTURE_2D_ARRAY,1,1),pe[e.TEXTURE_3D]=fe(e.TEXTURE_3D,e.TEXTURE_3D,1,1),a.setClear(0,0,0,1),o.setClear(1),s.setClear(0),me(e.DEPTH_TEST),o.setFunc(3),xe(!1),j(1),me(e.CULL_FACE),ye(0);function me(t){u[t]!==!0&&(e.enable(t),u[t]=!0)}function he(t){u[t]!==!1&&(e.disable(t),u[t]=!1)}function ge(t,n){return d[t]!==n&&(e.bindFramebuffer(t,n),d[t]=n,t===e.DRAW_FRAMEBUFFER&&(d[e.FRAMEBUFFER]=n),t===e.FRAMEBUFFER&&(d[e.DRAW_FRAMEBUFFER]=n),!0)}function k(t,n){let r=p,i=!1;if(t){r=f.get(n),r===void 0&&(r=[],f.set(n,r));let a=t.textures;if(r.length!==a.length||r[0]!==e.COLOR_ATTACHMENT0){for(let t=0,n=a.length;t<n;t++)r[t]=e.COLOR_ATTACHMENT0+t;r.length=a.length,i=!0}}else r[0]!==e.BACK&&(r[0]=e.BACK,i=!0);i&&e.drawBuffers(r)}function _e(t){return m!==t&&(e.useProgram(t),m=t,!0)}let ve={100:e.FUNC_ADD,101:e.FUNC_SUBTRACT,102:e.FUNC_REVERSE_SUBTRACT};ve[103]=e.MIN,ve[104]=e.MAX;let A={200:e.ZERO,201:e.ONE,202:e.SRC_COLOR,204:e.SRC_ALPHA,210:e.SRC_ALPHA_SATURATE,208:e.DST_COLOR,206:e.DST_ALPHA,203:e.ONE_MINUS_SRC_COLOR,205:e.ONE_MINUS_SRC_ALPHA,209:e.ONE_MINUS_DST_COLOR,207:e.ONE_MINUS_DST_ALPHA,211:e.CONSTANT_COLOR,212:e.ONE_MINUS_CONSTANT_COLOR,213:e.CONSTANT_ALPHA,214:e.ONE_MINUS_CONSTANT_ALPHA};function ye(t,n,r,i,a,o,s,c,l,u){if(t===0)h===!0&&(he(e.BLEND),h=!1);else if(h===!1&&(me(e.BLEND),h=!0),t!==5){if(t!==g||u!==T){if((_!==100||b!==100)&&(e.blendEquation(e.FUNC_ADD),_=100,b=100),u)switch(t){case 1:e.blendFuncSeparate(e.ONE,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFunc(e.ONE,e.ONE);break;case 3:e.blendFuncSeparate(e.ZERO,e.ONE_MINUS_SRC_COLOR,e.ZERO,e.ONE);break;case 4:e.blendFuncSeparate(e.DST_COLOR,e.ONE_MINUS_SRC_ALPHA,e.ZERO,e.ONE);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}else switch(t){case 1:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE_MINUS_SRC_ALPHA,e.ONE,e.ONE_MINUS_SRC_ALPHA);break;case 2:e.blendFuncSeparate(e.SRC_ALPHA,e.ONE,e.ONE,e.ONE);break;case 3:console.error(`THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true`);break;case 4:console.error(`THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true`);break;default:console.error(`THREE.WebGLState: Invalid blending: `,t)}v=null,y=null,x=null,S=null,C.set(0,0,0),w=0,g=t,T=u}}else a||=n,o||=r,s||=i,(n!==_||a!==b)&&(e.blendEquationSeparate(ve[n],ve[a]),_=n,b=a),(r!==v||i!==y||o!==x||s!==S)&&(e.blendFuncSeparate(A[r],A[i],A[o],A[s]),v=r,y=i,x=o,S=s),(c.equals(C)===!1||l!==w)&&(e.blendColor(c.r,c.g,c.b,l),C.copy(c),w=l),g=t,T=!1}function be(t,n){t.side===2?he(e.CULL_FACE):me(e.CULL_FACE);let r=t.side===1;n&&(r=!r),xe(r),t.blending===1&&t.transparent===!1?ye(0):ye(t.blending,t.blendEquation,t.blendSrc,t.blendDst,t.blendEquationAlpha,t.blendSrcAlpha,t.blendDstAlpha,t.blendColor,t.blendAlpha,t.premultipliedAlpha),o.setFunc(t.depthFunc),o.setTest(t.depthTest),o.setMask(t.depthWrite),a.setMask(t.colorWrite);let i=t.stencilWrite;s.setTest(i),i&&(s.setMask(t.stencilWriteMask),s.setFunc(t.stencilFunc,t.stencilRef,t.stencilFuncMask),s.setOp(t.stencilFail,t.stencilZFail,t.stencilZPass)),M(t.polygonOffset,t.polygonOffsetFactor,t.polygonOffsetUnits),t.alphaToCoverage===!0?me(e.SAMPLE_ALPHA_TO_COVERAGE):he(e.SAMPLE_ALPHA_TO_COVERAGE)}function xe(t){E!==t&&(t?e.frontFace(e.CW):e.frontFace(e.CCW),E=t)}function j(t){t===0?he(e.CULL_FACE):(me(e.CULL_FACE),t!==D&&(t===1?e.cullFace(e.BACK):t===2?e.cullFace(e.FRONT):e.cullFace(e.FRONT_AND_BACK))),D=t}function Se(t){t!==ee&&(ie&&e.lineWidth(t),ee=t)}function M(t,n,r){t?(me(e.POLYGON_OFFSET_FILL),(te!==n||ne!==r)&&(e.polygonOffset(n,r),te=n,ne=r)):he(e.POLYGON_OFFSET_FILL)}function N(t){t?me(e.SCISSOR_TEST):he(e.SCISSOR_TEST)}function we(t){t===void 0&&(t=e.TEXTURE0+re-1),se!==t&&(e.activeTexture(t),se=t)}function Te(t,n,r){r===void 0&&(r=se===null?e.TEXTURE0+re-1:se);let i=ce[r];i===void 0&&(i={type:void 0,texture:void 0},ce[r]=i),(i.type!==t||i.texture!==n)&&(se!==r&&(e.activeTexture(r),se=r),e.bindTexture(t,n||pe[t]),i.type=t,i.texture=n)}function Ee(){let t=ce[se];t!==void 0&&t.type!==void 0&&(e.bindTexture(t.type,null),t.type=void 0,t.texture=void 0)}function De(){try{e.compressedTexImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function P(){try{e.compressedTexImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Oe(){try{e.texSubImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function ke(){try{e.texSubImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ae(){try{e.compressedTexSubImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function je(){try{e.compressedTexSubImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Me(){try{e.texStorage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ne(){try{e.texStorage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Pe(){try{e.texImage2D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Fe(){try{e.texImage3D(...arguments)}catch(e){console.error(`THREE.WebGLState:`,e)}}function Ie(t){ue.equals(t)===!1&&(e.scissor(t.x,t.y,t.z,t.w),ue.copy(t))}function Le(t){de.equals(t)===!1&&(e.viewport(t.x,t.y,t.z,t.w),de.copy(t))}function Re(t,n){let r=l.get(n);r===void 0&&(r=new WeakMap,l.set(n,r));let i=r.get(t);i===void 0&&(i=e.getUniformBlockIndex(n,t.name),r.set(t,i))}function ze(t,n){let r=l.get(n).get(t);c.get(n)!==r&&(e.uniformBlockBinding(n,r,t.__bindingPointIndex),c.set(n,r))}function Be(){e.disable(e.BLEND),e.disable(e.CULL_FACE),e.disable(e.DEPTH_TEST),e.disable(e.POLYGON_OFFSET_FILL),e.disable(e.SCISSOR_TEST),e.disable(e.STENCIL_TEST),e.disable(e.SAMPLE_ALPHA_TO_COVERAGE),e.blendEquation(e.FUNC_ADD),e.blendFunc(e.ONE,e.ZERO),e.blendFuncSeparate(e.ONE,e.ZERO,e.ONE,e.ZERO),e.blendColor(0,0,0,0),e.colorMask(!0,!0,!0,!0),e.clearColor(0,0,0,0),e.depthMask(!0),e.depthFunc(e.LESS),o.setReversed(!1),e.clearDepth(1),e.stencilMask(4294967295),e.stencilFunc(e.ALWAYS,0,4294967295),e.stencilOp(e.KEEP,e.KEEP,e.KEEP),e.clearStencil(0),e.cullFace(e.BACK),e.frontFace(e.CCW),e.polygonOffset(0,0),e.activeTexture(e.TEXTURE0),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),e.bindFramebuffer(e.READ_FRAMEBUFFER,null),e.useProgram(null),e.lineWidth(1),e.scissor(0,0,e.canvas.width,e.canvas.height),e.viewport(0,0,e.canvas.width,e.canvas.height),u={},se=null,ce={},d={},f=new WeakMap,p=[],m=null,h=!1,g=null,_=null,v=null,y=null,b=null,x=null,S=null,C=new Ce(0,0,0),w=0,T=!1,E=null,D=null,ee=null,te=null,ne=null,ue.set(0,0,e.canvas.width,e.canvas.height),de.set(0,0,e.canvas.width,e.canvas.height),a.reset(),o.reset(),s.reset()}return{buffers:{color:a,depth:o,stencil:s},enable:me,disable:he,bindFramebuffer:ge,drawBuffers:k,useProgram:_e,setBlending:ye,setMaterial:be,setFlipSided:xe,setCullFace:j,setLineWidth:Se,setPolygonOffset:M,setScissorTest:N,activeTexture:we,bindTexture:Te,unbindTexture:Ee,compressedTexImage2D:De,compressedTexImage3D:P,texImage2D:Pe,texImage3D:Fe,updateUBOMapping:Re,uniformBlockBinding:ze,texStorage2D:Me,texStorage3D:Ne,texSubImage2D:Oe,texSubImage3D:ke,compressedTexSubImage2D:Ae,compressedTexSubImage3D:je,scissor:Ie,viewport:Le,reset:Be}}function io(e,t,n,r,i,a,o){let s=t.has(`WEBGL_multisampled_render_to_texture`)?t.get(`WEBGL_multisampled_render_to_texture`):null,c=typeof navigator>`u`?!1:/OculusBrowser/g.test(navigator.userAgent),l=new L,u=new WeakMap,d,f=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<`u`&&new OffscreenCanvas(1,1).getContext(`2d`)!==null}catch{}function m(e,t){return p?new OffscreenCanvas(e,t):Yt(`canvas`)}function h(e,t,n){let r=1,i=Te(e);if((i.width>n||i.height>n)&&(r=n/Math.max(i.width,i.height)),r<1){if(typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<`u`&&e instanceof HTMLCanvasElement||typeof ImageBitmap<`u`&&e instanceof ImageBitmap||typeof VideoFrame<`u`&&e instanceof VideoFrame){let n=Math.floor(r*i.width),a=Math.floor(r*i.height);d===void 0&&(d=m(n,a));let o=t?m(n,a):d;return o.width=n,o.height=a,o.getContext(`2d`).drawImage(e,0,0,n,a),console.warn(`THREE.WebGLRenderer: Texture has been resized from (`+i.width+`x`+i.height+`) to (`+n+`x`+a+`).`),o}return`data`in e&&console.warn(`THREE.WebGLRenderer: Image in DataTexture is too big (`+i.width+`x`+i.height+`).`),e}return e}function g(e){return e.generateMipmaps}function _(t){e.generateMipmap(t)}function v(t){return t.isWebGLCubeRenderTarget?e.TEXTURE_CUBE_MAP:t.isWebGL3DRenderTarget?e.TEXTURE_3D:t.isWebGLArrayRenderTarget||t.isCompressedArrayTexture?e.TEXTURE_2D_ARRAY:e.TEXTURE_2D}function y(n,r,i,a,o=!1){if(n!==null){if(e[n]!==void 0)return e[n];console.warn(`THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '`+n+`'`)}let s=r;if(r===e.RED&&(i===e.FLOAT&&(s=e.R32F),i===e.HALF_FLOAT&&(s=e.R16F),i===e.UNSIGNED_BYTE&&(s=e.R8)),r===e.RED_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.R8UI),i===e.UNSIGNED_SHORT&&(s=e.R16UI),i===e.UNSIGNED_INT&&(s=e.R32UI),i===e.BYTE&&(s=e.R8I),i===e.SHORT&&(s=e.R16I),i===e.INT&&(s=e.R32I)),r===e.RG&&(i===e.FLOAT&&(s=e.RG32F),i===e.HALF_FLOAT&&(s=e.RG16F),i===e.UNSIGNED_BYTE&&(s=e.RG8)),r===e.RG_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RG8UI),i===e.UNSIGNED_SHORT&&(s=e.RG16UI),i===e.UNSIGNED_INT&&(s=e.RG32UI),i===e.BYTE&&(s=e.RG8I),i===e.SHORT&&(s=e.RG16I),i===e.INT&&(s=e.RG32I)),r===e.RGB_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RGB8UI),i===e.UNSIGNED_SHORT&&(s=e.RGB16UI),i===e.UNSIGNED_INT&&(s=e.RGB32UI),i===e.BYTE&&(s=e.RGB8I),i===e.SHORT&&(s=e.RGB16I),i===e.INT&&(s=e.RGB32I)),r===e.RGBA_INTEGER&&(i===e.UNSIGNED_BYTE&&(s=e.RGBA8UI),i===e.UNSIGNED_SHORT&&(s=e.RGBA16UI),i===e.UNSIGNED_INT&&(s=e.RGBA32UI),i===e.BYTE&&(s=e.RGBA8I),i===e.SHORT&&(s=e.RGBA16I),i===e.INT&&(s=e.RGBA32I)),r===e.RGB&&(i===e.UNSIGNED_INT_5_9_9_9_REV&&(s=e.RGB9_E5),i===e.UNSIGNED_INT_10F_11F_11F_REV&&(s=e.R11F_G11F_B10F)),r===e.RGBA){let t=o?Jt:Oe.getTransfer(a);i===e.FLOAT&&(s=e.RGBA32F),i===e.HALF_FLOAT&&(s=e.RGBA16F),i===e.UNSIGNED_BYTE&&(s=t===`srgb`?e.SRGB8_ALPHA8:e.RGBA8),i===e.UNSIGNED_SHORT_4_4_4_4&&(s=e.RGBA4),i===e.UNSIGNED_SHORT_5_5_5_1&&(s=e.RGB5_A1)}return(s===e.R16F||s===e.R32F||s===e.RG16F||s===e.RG32F||s===e.RGBA16F||s===e.RGBA32F)&&t.get(`EXT_color_buffer_float`),s}function b(t,n){let r;return t?n===null||n===1014||n===1020?r=e.DEPTH24_STENCIL8:n===1015?r=e.DEPTH32F_STENCIL8:n===1012&&(r=e.DEPTH24_STENCIL8,console.warn(`DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.`)):n===null||n===1014||n===1020?r=e.DEPTH_COMPONENT24:n===1015?r=e.DEPTH_COMPONENT32F:n===1012&&(r=e.DEPTH_COMPONENT16),r}function x(e,t){return g(e)===!0||e.isFramebufferTexture&&e.minFilter!==1003&&e.minFilter!==1006?Math.log2(Math.max(t.width,t.height))+1:e.mipmaps!==void 0&&e.mipmaps.length>0?e.mipmaps.length:e.isCompressedTexture&&Array.isArray(e.image)?t.mipmaps.length:1}function S(e){let t=e.target;t.removeEventListener(`dispose`,S),w(t),t.isVideoTexture&&u.delete(t)}function C(e){let t=e.target;t.removeEventListener(`dispose`,C),E(t)}function w(e){let t=r.get(e);if(t.__webglInit===void 0)return;let n=e.source,i=f.get(n);if(i){let r=i[t.__cacheKey];r.usedTimes--,r.usedTimes===0&&T(e),Object.keys(i).length===0&&f.delete(n)}r.remove(e)}function T(t){let n=r.get(t);e.deleteTexture(n.__webglTexture);let i=t.source,a=f.get(i);delete a[n.__cacheKey],o.memory.textures--}function E(t){let n=r.get(t);if(t.depthTexture&&(t.depthTexture.dispose(),r.remove(t.depthTexture)),t.isWebGLCubeRenderTarget)for(let t=0;t<6;t++){if(Array.isArray(n.__webglFramebuffer[t]))for(let r=0;r<n.__webglFramebuffer[t].length;r++)e.deleteFramebuffer(n.__webglFramebuffer[t][r]);else e.deleteFramebuffer(n.__webglFramebuffer[t]);n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer[t])}else{if(Array.isArray(n.__webglFramebuffer))for(let t=0;t<n.__webglFramebuffer.length;t++)e.deleteFramebuffer(n.__webglFramebuffer[t]);else e.deleteFramebuffer(n.__webglFramebuffer);if(n.__webglDepthbuffer&&e.deleteRenderbuffer(n.__webglDepthbuffer),n.__webglMultisampledFramebuffer&&e.deleteFramebuffer(n.__webglMultisampledFramebuffer),n.__webglColorRenderbuffer)for(let t=0;t<n.__webglColorRenderbuffer.length;t++)n.__webglColorRenderbuffer[t]&&e.deleteRenderbuffer(n.__webglColorRenderbuffer[t]);n.__webglDepthRenderbuffer&&e.deleteRenderbuffer(n.__webglDepthRenderbuffer)}let i=t.textures;for(let t=0,n=i.length;t<n;t++){let n=r.get(i[t]);n.__webglTexture&&(e.deleteTexture(n.__webglTexture),o.memory.textures--),r.remove(i[t])}r.remove(t)}let D=0;function ee(){D=0}function te(){let e=D;return e>=i.maxTextures&&console.warn(`THREE.WebGLTextures: Trying to use `+e+` texture units while this GPU supports only `+i.maxTextures),D+=1,e}function ne(e){let t=[];return t.push(e.wrapS),t.push(e.wrapT),t.push(e.wrapR||0),t.push(e.magFilter),t.push(e.minFilter),t.push(e.anisotropy),t.push(e.internalFormat),t.push(e.format),t.push(e.type),t.push(e.generateMipmaps),t.push(e.premultiplyAlpha),t.push(e.flipY),t.push(e.unpackAlignment),t.push(e.colorSpace),t.join()}function re(t,i){let a=r.get(t);if(t.isVideoTexture&&Ce(t),t.isRenderTargetTexture===!1&&t.isExternalTexture!==!0&&t.version>0&&a.__version!==t.version){let e=t.image;if(e===null)console.warn(`THREE.WebGLRenderer: Texture marked for update but no image data found.`);else if(e.complete===!1)console.warn(`THREE.WebGLRenderer: Texture marked for update but image is incomplete`);else{pe(a,t,i);return}}else t.isExternalTexture&&(a.__webglTexture=t.sourceTexture?t.sourceTexture:null);n.bindTexture(e.TEXTURE_2D,a.__webglTexture,e.TEXTURE0+i)}function ie(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?pe(a,t,i):n.bindTexture(e.TEXTURE_2D_ARRAY,a.__webglTexture,e.TEXTURE0+i)}function ae(t,i){let a=r.get(t);t.isRenderTargetTexture===!1&&t.version>0&&a.__version!==t.version?pe(a,t,i):n.bindTexture(e.TEXTURE_3D,a.__webglTexture,e.TEXTURE0+i)}function oe(t,i){let a=r.get(t);t.version>0&&a.__version!==t.version?me(a,t,i):n.bindTexture(e.TEXTURE_CUBE_MAP,a.__webglTexture,e.TEXTURE0+i)}let se={[Pe]:e.REPEAT,[Re]:e.CLAMP_TO_EDGE,[Me]:e.MIRRORED_REPEAT},ce={[Fe]:e.NEAREST,[be]:e.NEAREST_MIPMAP_NEAREST,[ze]:e.NEAREST_MIPMAP_LINEAR,[ct]:e.LINEAR,[Xt]:e.LINEAR_MIPMAP_NEAREST,[Wt]:e.LINEAR_MIPMAP_LINEAR},le={512:e.NEVER,519:e.ALWAYS,513:e.LESS,515:e.LEQUAL,514:e.EQUAL,518:e.GEQUAL,516:e.GREATER,517:e.NOTEQUAL};function O(n,a){if(a.type===1015&&t.has(`OES_texture_float_linear`)===!1&&(a.magFilter===1006||a.magFilter===1007||a.magFilter===1005||a.magFilter===1008||a.minFilter===1006||a.minFilter===1007||a.minFilter===1005||a.minFilter===1008)&&console.warn(`THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device.`),e.texParameteri(n,e.TEXTURE_WRAP_S,se[a.wrapS]),e.texParameteri(n,e.TEXTURE_WRAP_T,se[a.wrapT]),(n===e.TEXTURE_3D||n===e.TEXTURE_2D_ARRAY)&&e.texParameteri(n,e.TEXTURE_WRAP_R,se[a.wrapR]),e.texParameteri(n,e.TEXTURE_MAG_FILTER,ce[a.magFilter]),e.texParameteri(n,e.TEXTURE_MIN_FILTER,ce[a.minFilter]),a.compareFunction&&(e.texParameteri(n,e.TEXTURE_COMPARE_MODE,e.COMPARE_REF_TO_TEXTURE),e.texParameteri(n,e.TEXTURE_COMPARE_FUNC,le[a.compareFunction])),t.has(`EXT_texture_filter_anisotropic`)===!0){if(a.magFilter===1003||a.minFilter!==1005&&a.minFilter!==1008||a.type===1015&&t.has(`OES_texture_float_linear`)===!1)return;if(a.anisotropy>1||r.get(a).__currentAnisotropy){let o=t.get(`EXT_texture_filter_anisotropic`);e.texParameterf(n,o.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(a.anisotropy,i.getMaxAnisotropy())),r.get(a).__currentAnisotropy=a.anisotropy}}}function ue(t,n){let r=!1;t.__webglInit===void 0&&(t.__webglInit=!0,n.addEventListener(`dispose`,S));let i=n.source,a=f.get(i);a===void 0&&(a={},f.set(i,a));let s=ne(n);if(s!==t.__cacheKey){a[s]===void 0&&(a[s]={texture:e.createTexture(),usedTimes:0},o.memory.textures++,r=!0),a[s].usedTimes++;let i=a[t.__cacheKey];i!==void 0&&(a[t.__cacheKey].usedTimes--,i.usedTimes===0&&T(n)),t.__cacheKey=s,t.__webglTexture=a[s].texture}return r}function de(e,t,n){return Math.floor(Math.floor(e/n)/t)}function fe(t,r,i,a){let o=t.updateRanges;if(o.length===0)n.texSubImage2D(e.TEXTURE_2D,0,0,0,r.width,r.height,i,a,r.data);else{o.sort((e,t)=>e.start-t.start);let s=0;for(let e=1;e<o.length;e++){let t=o[s],n=o[e],i=t.start+t.count,a=de(n.start,r.width,4),c=de(t.start,r.width,4);n.start<=i+1&&a===c&&de(n.start+n.count-1,r.width,4)===a?t.count=Math.max(t.count,n.start+n.count-t.start):(++s,o[s]=n)}o.length=s+1;let c=e.getParameter(e.UNPACK_ROW_LENGTH),l=e.getParameter(e.UNPACK_SKIP_PIXELS),u=e.getParameter(e.UNPACK_SKIP_ROWS);e.pixelStorei(e.UNPACK_ROW_LENGTH,r.width);for(let t=0,s=o.length;t<s;t++){let s=o[t],c=Math.floor(s.start/4),l=Math.ceil(s.count/4),u=c%r.width,d=Math.floor(c/r.width),f=l;e.pixelStorei(e.UNPACK_SKIP_PIXELS,u),e.pixelStorei(e.UNPACK_SKIP_ROWS,d),n.texSubImage2D(e.TEXTURE_2D,0,u,d,f,1,i,a,r.data)}t.clearUpdateRanges(),e.pixelStorei(e.UNPACK_ROW_LENGTH,c),e.pixelStorei(e.UNPACK_SKIP_PIXELS,l),e.pixelStorei(e.UNPACK_SKIP_ROWS,u)}}function pe(t,o,s){let c=e.TEXTURE_2D;(o.isDataArrayTexture||o.isCompressedArrayTexture)&&(c=e.TEXTURE_2D_ARRAY),o.isData3DTexture&&(c=e.TEXTURE_3D);let l=ue(t,o),u=o.source;n.bindTexture(c,t.__webglTexture,e.TEXTURE0+s);let d=r.get(u);if(u.version!==d.__version||l===!0){n.activeTexture(e.TEXTURE0+s);let t=Oe.getPrimaries(Oe.workingColorSpace),r=o.colorSpace===``?null:Oe.getPrimaries(o.colorSpace),f=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,f);let p=h(o.image,!1,i.maxTextureSize);p=we(o,p);let m=a.convert(o.format,o.colorSpace),v=a.convert(o.type),S=y(o.internalFormat,m,v,o.colorSpace,o.isVideoTexture);O(c,o);let C,w=o.mipmaps,T=o.isVideoTexture!==!0,E=d.__version===void 0||l===!0,D=u.dataReady,ee=x(o,p);if(o.isDepthTexture)S=b(o.format===Ee,o.type),E&&(T?n.texStorage2D(e.TEXTURE_2D,1,S,p.width,p.height):n.texImage2D(e.TEXTURE_2D,0,S,p.width,p.height,0,m,v,null));else if(o.isDataTexture){if(w.length>0){T&&E&&n.texStorage2D(e.TEXTURE_2D,ee,S,w[0].width,w[0].height);for(let t=0,r=w.length;t<r;t++)C=w[t],T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,v,C.data):n.texImage2D(e.TEXTURE_2D,t,S,C.width,C.height,0,m,v,C.data);o.generateMipmaps=!1}else T?(E&&n.texStorage2D(e.TEXTURE_2D,ee,S,p.width,p.height),D&&fe(o,p,m,v)):n.texImage2D(e.TEXTURE_2D,0,S,p.width,p.height,0,m,v,p.data)}else if(o.isCompressedTexture){if(o.isCompressedArrayTexture){T&&E&&n.texStorage3D(e.TEXTURE_2D_ARRAY,ee,S,w[0].width,w[0].height,p.depth);for(let t=0,r=w.length;t<r;t++)if(C=w[t],o.format!==1023){if(m!==null){if(T){if(D){if(o.layerUpdates.size>0){let r=ut(C.width,C.height,o.format,o.type);for(let i of o.layerUpdates){let a=C.data.subarray(i*r/C.data.BYTES_PER_ELEMENT,(i+1)*r/C.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,i,C.width,C.height,1,m,a)}o.clearLayerUpdates()}else n.compressedTexSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,C.width,C.height,p.depth,m,C.data)}}else n.compressedTexImage3D(e.TEXTURE_2D_ARRAY,t,S,C.width,C.height,p.depth,0,C.data,0,0)}else console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`)}else T?D&&n.texSubImage3D(e.TEXTURE_2D_ARRAY,t,0,0,0,C.width,C.height,p.depth,m,v,C.data):n.texImage3D(e.TEXTURE_2D_ARRAY,t,S,C.width,C.height,p.depth,0,m,v,C.data)}else{T&&E&&n.texStorage2D(e.TEXTURE_2D,ee,S,w[0].width,w[0].height);for(let t=0,r=w.length;t<r;t++)C=w[t],o.format===1023?T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,v,C.data):n.texImage2D(e.TEXTURE_2D,t,S,C.width,C.height,0,m,v,C.data):m===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()`):T?D&&n.compressedTexSubImage2D(e.TEXTURE_2D,t,0,0,C.width,C.height,m,C.data):n.compressedTexImage2D(e.TEXTURE_2D,t,S,C.width,C.height,0,C.data)}}else if(o.isDataArrayTexture){if(T){if(E&&n.texStorage3D(e.TEXTURE_2D_ARRAY,ee,S,p.width,p.height,p.depth),D){if(o.layerUpdates.size>0){let t=ut(p.width,p.height,o.format,o.type);for(let r of o.layerUpdates){let i=p.data.subarray(r*t/p.data.BYTES_PER_ELEMENT,(r+1)*t/p.data.BYTES_PER_ELEMENT);n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,r,p.width,p.height,1,m,v,i)}o.clearLayerUpdates()}else n.texSubImage3D(e.TEXTURE_2D_ARRAY,0,0,0,0,p.width,p.height,p.depth,m,v,p.data)}}else n.texImage3D(e.TEXTURE_2D_ARRAY,0,S,p.width,p.height,p.depth,0,m,v,p.data)}else if(o.isData3DTexture)T?(E&&n.texStorage3D(e.TEXTURE_3D,ee,S,p.width,p.height,p.depth),D&&n.texSubImage3D(e.TEXTURE_3D,0,0,0,0,p.width,p.height,p.depth,m,v,p.data)):n.texImage3D(e.TEXTURE_3D,0,S,p.width,p.height,p.depth,0,m,v,p.data);else if(o.isFramebufferTexture){if(E){if(T)n.texStorage2D(e.TEXTURE_2D,ee,S,p.width,p.height);else{let t=p.width,r=p.height;for(let i=0;i<ee;i++)n.texImage2D(e.TEXTURE_2D,i,S,t,r,0,m,v,null),t>>=1,r>>=1}}}else if(w.length>0){if(T&&E){let t=Te(w[0]);n.texStorage2D(e.TEXTURE_2D,ee,S,t.width,t.height)}for(let t=0,r=w.length;t<r;t++)C=w[t],T?D&&n.texSubImage2D(e.TEXTURE_2D,t,0,0,m,v,C):n.texImage2D(e.TEXTURE_2D,t,S,m,v,C);o.generateMipmaps=!1}else if(T){if(E){let t=Te(p);n.texStorage2D(e.TEXTURE_2D,ee,S,t.width,t.height)}D&&n.texSubImage2D(e.TEXTURE_2D,0,0,0,m,v,p)}else n.texImage2D(e.TEXTURE_2D,0,S,m,v,p);g(o)&&_(c),d.__version=u.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function me(t,o,s){if(o.image.length!==6)return;let c=ue(t,o),l=o.source;n.bindTexture(e.TEXTURE_CUBE_MAP,t.__webglTexture,e.TEXTURE0+s);let u=r.get(l);if(l.version!==u.__version||c===!0){n.activeTexture(e.TEXTURE0+s);let t=Oe.getPrimaries(Oe.workingColorSpace),r=o.colorSpace===``?null:Oe.getPrimaries(o.colorSpace),d=o.colorSpace===``||t===r?e.NONE:e.BROWSER_DEFAULT_WEBGL;e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL,o.flipY),e.pixelStorei(e.UNPACK_PREMULTIPLY_ALPHA_WEBGL,o.premultiplyAlpha),e.pixelStorei(e.UNPACK_ALIGNMENT,o.unpackAlignment),e.pixelStorei(e.UNPACK_COLORSPACE_CONVERSION_WEBGL,d);let f=o.isCompressedTexture||o.image[0].isCompressedTexture,p=o.image[0]&&o.image[0].isDataTexture,m=[];for(let e=0;e<6;e++)!f&&!p?m[e]=h(o.image[e],!0,i.maxCubemapSize):m[e]=p?o.image[e].image:o.image[e],m[e]=we(o,m[e]);let v=m[0],b=a.convert(o.format,o.colorSpace),S=a.convert(o.type),C=y(o.internalFormat,b,S,o.colorSpace),w=o.isVideoTexture!==!0,T=u.__version===void 0||c===!0,E=l.dataReady,D=x(o,v);O(e.TEXTURE_CUBE_MAP,o);let ee;if(f){w&&T&&n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,v.width,v.height);for(let t=0;t<6;t++){ee=m[t].mipmaps;for(let r=0;r<ee.length;r++){let i=ee[r];o.format===1023?w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,b,S,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,b,S,i.data):b===null?console.warn(`THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()`):w?E&&n.compressedTexSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,0,0,i.width,i.height,b,i.data):n.compressedTexImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r,C,i.width,i.height,0,i.data)}}}else{if(ee=o.mipmaps,w&&T){ee.length>0&&D++;let t=Te(m[0]);n.texStorage2D(e.TEXTURE_CUBE_MAP,D,C,t.width,t.height)}for(let t=0;t<6;t++)if(p){w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,m[t].width,m[t].height,b,S,m[t].data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,m[t].width,m[t].height,0,b,S,m[t].data);for(let r=0;r<ee.length;r++){let i=ee[r].image[t].image;w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,i.width,i.height,b,S,i.data):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,i.width,i.height,0,b,S,i.data)}}else{w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,0,0,b,S,m[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,0,C,b,S,m[t]);for(let r=0;r<ee.length;r++){let i=ee[r];w?E&&n.texSubImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,0,0,b,S,i.image[t]):n.texImage2D(e.TEXTURE_CUBE_MAP_POSITIVE_X+t,r+1,C,b,S,i.image[t])}}}g(o)&&_(e.TEXTURE_CUBE_MAP),u.__version=l.version,o.onUpdate&&o.onUpdate(o)}t.__version=o.version}function he(t,i,o,c,l,u){let d=a.convert(o.format,o.colorSpace),f=a.convert(o.type),p=y(o.internalFormat,d,f,o.colorSpace),m=r.get(i),h=r.get(o);if(h.__renderTarget=i,!m.__hasExternalTextures){let t=Math.max(1,i.width>>u),r=Math.max(1,i.height>>u);l===e.TEXTURE_3D||l===e.TEXTURE_2D_ARRAY?n.texImage3D(l,u,p,t,r,i.depth,0,d,f,null):n.texImage2D(l,u,p,t,r,0,d,f,null)}n.bindFramebuffer(e.FRAMEBUFFER,t),N(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,c,l,h.__webglTexture,0,M(i)):(l===e.TEXTURE_2D||l>=e.TEXTURE_CUBE_MAP_POSITIVE_X&&l<=e.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&e.framebufferTexture2D(e.FRAMEBUFFER,c,l,h.__webglTexture,u),n.bindFramebuffer(e.FRAMEBUFFER,null)}function ge(t,n,r){if(e.bindRenderbuffer(e.RENDERBUFFER,t),n.depthBuffer){let i=n.depthTexture,a=i&&i.isDepthTexture?i.type:null,o=b(n.stencilBuffer,a),c=n.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,l=M(n);N(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,l,o,n.width,n.height):r?e.renderbufferStorageMultisample(e.RENDERBUFFER,l,o,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,o,n.width,n.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,c,e.RENDERBUFFER,t)}else{let t=n.textures;for(let i=0;i<t.length;i++){let o=t[i],c=a.convert(o.format,o.colorSpace),l=a.convert(o.type),u=y(o.internalFormat,c,l,o.colorSpace),d=M(n);r&&N(n)===!1?e.renderbufferStorageMultisample(e.RENDERBUFFER,d,u,n.width,n.height):N(n)?s.renderbufferStorageMultisampleEXT(e.RENDERBUFFER,d,u,n.width,n.height):e.renderbufferStorage(e.RENDERBUFFER,u,n.width,n.height)}}e.bindRenderbuffer(e.RENDERBUFFER,null)}function k(t,i){if(i&&i.isWebGLCubeRenderTarget)throw Error(`Depth Texture with cube render targets is not supported`);if(n.bindFramebuffer(e.FRAMEBUFFER,t),!(i.depthTexture&&i.depthTexture.isDepthTexture))throw Error(`renderTarget.depthTexture must be an instance of THREE.DepthTexture`);let a=r.get(i.depthTexture);a.__renderTarget=i,(!a.__webglTexture||i.depthTexture.image.width!==i.width||i.depthTexture.image.height!==i.height)&&(i.depthTexture.image.width=i.width,i.depthTexture.image.height=i.height,i.depthTexture.needsUpdate=!0),re(i.depthTexture,0);let o=a.__webglTexture,c=M(i);if(i.depthTexture.format===1026)N(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,o,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_ATTACHMENT,e.TEXTURE_2D,o,0);else if(i.depthTexture.format===1027)N(i)?s.framebufferTexture2DMultisampleEXT(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,o,0,c):e.framebufferTexture2D(e.FRAMEBUFFER,e.DEPTH_STENCIL_ATTACHMENT,e.TEXTURE_2D,o,0);else throw Error(`Unknown depthTexture format`)}function _e(t){let i=r.get(t),a=t.isWebGLCubeRenderTarget===!0;if(i.__boundDepthTexture!==t.depthTexture){let e=t.depthTexture;if(i.__depthDisposeCallback&&i.__depthDisposeCallback(),e){let t=()=>{delete i.__boundDepthTexture,delete i.__depthDisposeCallback,e.removeEventListener(`dispose`,t)};e.addEventListener(`dispose`,t),i.__depthDisposeCallback=t}i.__boundDepthTexture=e}if(t.depthTexture&&!i.__autoAllocateDepthBuffer){if(a)throw Error(`target.depthTexture not supported in Cube render targets`);let e=t.texture.mipmaps;e&&e.length>0?k(i.__webglFramebuffer[0],t):k(i.__webglFramebuffer,t)}else if(a){i.__webglDepthbuffer=[];for(let r=0;r<6;r++)if(n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[r]),i.__webglDepthbuffer[r]===void 0)i.__webglDepthbuffer[r]=e.createRenderbuffer(),ge(i.__webglDepthbuffer[r],t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,a=i.__webglDepthbuffer[r];e.bindRenderbuffer(e.RENDERBUFFER,a),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,a)}}else{let r=t.texture.mipmaps;if(r&&r.length>0?n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer[0]):n.bindFramebuffer(e.FRAMEBUFFER,i.__webglFramebuffer),i.__webglDepthbuffer===void 0)i.__webglDepthbuffer=e.createRenderbuffer(),ge(i.__webglDepthbuffer,t,!1);else{let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,r=i.__webglDepthbuffer;e.bindRenderbuffer(e.RENDERBUFFER,r),e.framebufferRenderbuffer(e.FRAMEBUFFER,n,e.RENDERBUFFER,r)}}n.bindFramebuffer(e.FRAMEBUFFER,null)}function ve(t,n,i){let a=r.get(t);n!==void 0&&he(a.__webglFramebuffer,t,t.texture,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,0),i!==void 0&&_e(t)}function A(t){let i=t.texture,s=r.get(t),c=r.get(i);t.addEventListener(`dispose`,C);let l=t.textures,u=t.isWebGLCubeRenderTarget===!0,d=l.length>1;if(d||(c.__webglTexture===void 0&&(c.__webglTexture=e.createTexture()),c.__version=i.version,o.memory.textures++),u){s.__webglFramebuffer=[];for(let t=0;t<6;t++)if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer[t]=[];for(let n=0;n<i.mipmaps.length;n++)s.__webglFramebuffer[t][n]=e.createFramebuffer()}else s.__webglFramebuffer[t]=e.createFramebuffer()}else{if(i.mipmaps&&i.mipmaps.length>0){s.__webglFramebuffer=[];for(let t=0;t<i.mipmaps.length;t++)s.__webglFramebuffer[t]=e.createFramebuffer()}else s.__webglFramebuffer=e.createFramebuffer();if(d)for(let t=0,n=l.length;t<n;t++){let n=r.get(l[t]);n.__webglTexture===void 0&&(n.__webglTexture=e.createTexture(),o.memory.textures++)}if(t.samples>0&&N(t)===!1){s.__webglMultisampledFramebuffer=e.createFramebuffer(),s.__webglColorRenderbuffer=[],n.bindFramebuffer(e.FRAMEBUFFER,s.__webglMultisampledFramebuffer);for(let n=0;n<l.length;n++){let r=l[n];s.__webglColorRenderbuffer[n]=e.createRenderbuffer(),e.bindRenderbuffer(e.RENDERBUFFER,s.__webglColorRenderbuffer[n]);let i=a.convert(r.format,r.colorSpace),o=a.convert(r.type),c=y(r.internalFormat,i,o,r.colorSpace,t.isXRRenderTarget===!0),u=M(t);e.renderbufferStorageMultisample(e.RENDERBUFFER,u,c,t.width,t.height),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+n,e.RENDERBUFFER,s.__webglColorRenderbuffer[n])}e.bindRenderbuffer(e.RENDERBUFFER,null),t.depthBuffer&&(s.__webglDepthRenderbuffer=e.createRenderbuffer(),ge(s.__webglDepthRenderbuffer,t,!0)),n.bindFramebuffer(e.FRAMEBUFFER,null)}}if(u){n.bindTexture(e.TEXTURE_CUBE_MAP,c.__webglTexture),O(e.TEXTURE_CUBE_MAP,i);for(let n=0;n<6;n++)if(i.mipmaps&&i.mipmaps.length>0)for(let r=0;r<i.mipmaps.length;r++)he(s.__webglFramebuffer[n][r],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,r);else he(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,e.TEXTURE_CUBE_MAP_POSITIVE_X+n,0);g(i)&&_(e.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(d){for(let i=0,a=l.length;i<a;i++){let a=l[i],o=r.get(a),c=e.TEXTURE_2D;(t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(c=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(c,o.__webglTexture),O(c,a),he(s.__webglFramebuffer,t,a,e.COLOR_ATTACHMENT0+i,c,0),g(a)&&_(c)}n.unbindTexture()}else{let r=e.TEXTURE_2D;if((t.isWebGL3DRenderTarget||t.isWebGLArrayRenderTarget)&&(r=t.isWebGL3DRenderTarget?e.TEXTURE_3D:e.TEXTURE_2D_ARRAY),n.bindTexture(r,c.__webglTexture),O(r,i),i.mipmaps&&i.mipmaps.length>0)for(let n=0;n<i.mipmaps.length;n++)he(s.__webglFramebuffer[n],t,i,e.COLOR_ATTACHMENT0,r,n);else he(s.__webglFramebuffer,t,i,e.COLOR_ATTACHMENT0,r,0);g(i)&&_(r),n.unbindTexture()}t.depthBuffer&&_e(t)}function ye(e){let t=e.textures;for(let i=0,a=t.length;i<a;i++){let a=t[i];if(g(a)){let t=v(e),i=r.get(a).__webglTexture;n.bindTexture(t,i),_(t),n.unbindTexture()}}}let xe=[],j=[];function Se(t){if(t.samples>0){if(N(t)===!1){let i=t.textures,a=t.width,o=t.height,s=e.COLOR_BUFFER_BIT,l=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT,u=r.get(t),d=i.length>1;if(d)for(let t=0;t<i.length;t++)n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,null),n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,null,0);n.bindFramebuffer(e.READ_FRAMEBUFFER,u.__webglMultisampledFramebuffer);let f=t.texture.mipmaps;f&&f.length>0?n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer[0]):n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglFramebuffer);for(let n=0;n<i.length;n++){if(t.resolveDepthBuffer&&(t.depthBuffer&&(s|=e.DEPTH_BUFFER_BIT),t.stencilBuffer&&t.resolveStencilBuffer&&(s|=e.STENCIL_BUFFER_BIT)),d){e.framebufferRenderbuffer(e.READ_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.RENDERBUFFER,u.__webglColorRenderbuffer[n]);let t=r.get(i[n]).__webglTexture;e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0)}e.blitFramebuffer(0,0,a,o,0,0,a,o,s,e.NEAREST),c===!0&&(xe.length=0,j.length=0,xe.push(e.COLOR_ATTACHMENT0+n),t.depthBuffer&&t.resolveDepthBuffer===!1&&(xe.push(l),j.push(l),e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,j)),e.invalidateFramebuffer(e.READ_FRAMEBUFFER,xe))}if(n.bindFramebuffer(e.READ_FRAMEBUFFER,null),n.bindFramebuffer(e.DRAW_FRAMEBUFFER,null),d)for(let t=0;t<i.length;t++){n.bindFramebuffer(e.FRAMEBUFFER,u.__webglMultisampledFramebuffer),e.framebufferRenderbuffer(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.RENDERBUFFER,u.__webglColorRenderbuffer[t]);let a=r.get(i[t]).__webglTexture;n.bindFramebuffer(e.FRAMEBUFFER,u.__webglFramebuffer),e.framebufferTexture2D(e.DRAW_FRAMEBUFFER,e.COLOR_ATTACHMENT0+t,e.TEXTURE_2D,a,0)}n.bindFramebuffer(e.DRAW_FRAMEBUFFER,u.__webglMultisampledFramebuffer)}else if(t.depthBuffer&&t.resolveDepthBuffer===!1&&c){let n=t.stencilBuffer?e.DEPTH_STENCIL_ATTACHMENT:e.DEPTH_ATTACHMENT;e.invalidateFramebuffer(e.DRAW_FRAMEBUFFER,[n])}}}function M(e){return Math.min(i.maxSamples,e.samples)}function N(e){let n=r.get(e);return e.samples>0&&t.has(`WEBGL_multisampled_render_to_texture`)===!0&&n.__useRenderToTexture!==!1}function Ce(e){let t=o.render.frame;u.get(e)!==t&&(u.set(e,t),e.update())}function we(e,t){let n=e.colorSpace,r=e.format,i=e.type;return e.isCompressedTexture===!0||e.isVideoTexture===!0||n!==`srgb-linear`&&n!==``&&(Oe.getTransfer(n)===`srgb`?(r!==1023||i!==1009)&&console.warn(`THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.`):console.error(`THREE.WebGLTextures: Unsupported texture color space:`,n)),t}function Te(e){return typeof HTMLImageElement<`u`&&e instanceof HTMLImageElement?(l.width=e.naturalWidth||e.width,l.height=e.naturalHeight||e.height):typeof VideoFrame<`u`&&e instanceof VideoFrame?(l.width=e.displayWidth,l.height=e.displayHeight):(l.width=e.width,l.height=e.height),l}this.allocateTextureUnit=te,this.resetTextureUnits=ee,this.setTexture2D=re,this.setTexture2DArray=ie,this.setTexture3D=ae,this.setTextureCube=oe,this.rebindTextures=ve,this.setupRenderTarget=A,this.updateRenderTargetMipmap=ye,this.updateMultisampleRenderTarget=Se,this.setupDepthRenderbuffer=_e,this.setupFrameBufferTexture=he,this.useMultisampledRTT=N}function ao(e,t){function n(n,r=``){let i,a=Oe.getTransfer(r);if(n===1009)return e.UNSIGNED_BYTE;if(n===1017)return e.UNSIGNED_SHORT_4_4_4_4;if(n===1018)return e.UNSIGNED_SHORT_5_5_5_1;if(n===35902)return e.UNSIGNED_INT_5_9_9_9_REV;if(n===35899)return e.UNSIGNED_INT_10F_11F_11F_REV;if(n===1010)return e.BYTE;if(n===1011)return e.SHORT;if(n===1012)return e.UNSIGNED_SHORT;if(n===1013)return e.INT;if(n===1014)return e.UNSIGNED_INT;if(n===1015)return e.FLOAT;if(n===1016)return e.HALF_FLOAT;if(n===1021)return e.ALPHA;if(n===1022)return e.RGB;if(n===1023)return e.RGBA;if(n===1026)return e.DEPTH_COMPONENT;if(n===1027)return e.DEPTH_STENCIL;if(n===1028)return e.RED;if(n===1029)return e.RED_INTEGER;if(n===1030)return e.RG;if(n===1031)return e.RG_INTEGER;if(n===1033)return e.RGBA_INTEGER;if(n===33776||n===33777||n===33778||n===33779){if(a===`srgb`){if(i=t.get(`WEBGL_compressed_texture_s3tc_srgb`),i!==null){if(n===33776)return i.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null}else if(i=t.get(`WEBGL_compressed_texture_s3tc`),i!==null){if(n===33776)return i.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===33777)return i.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===33778)return i.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===33779)return i.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null}if(n===35840||n===35841||n===35842||n===35843){if(i=t.get(`WEBGL_compressed_texture_pvrtc`),i!==null){if(n===35840)return i.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===35841)return i.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===35842)return i.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===35843)return i.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null}if(n===36196||n===37492||n===37496){if(i=t.get(`WEBGL_compressed_texture_etc`),i!==null){if(n===36196||n===37492)return a===`srgb`?i.COMPRESSED_SRGB8_ETC2:i.COMPRESSED_RGB8_ETC2;if(n===37496)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:i.COMPRESSED_RGBA8_ETC2_EAC}else return null}if(n===37808||n===37809||n===37810||n===37811||n===37812||n===37813||n===37814||n===37815||n===37816||n===37817||n===37818||n===37819||n===37820||n===37821){if(i=t.get(`WEBGL_compressed_texture_astc`),i!==null){if(n===37808)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:i.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===37809)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:i.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===37810)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:i.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===37811)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:i.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===37812)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:i.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===37813)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:i.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===37814)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:i.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===37815)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:i.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===37816)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:i.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===37817)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:i.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===37818)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:i.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===37819)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:i.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===37820)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:i.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===37821)return a===`srgb`?i.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:i.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null}if(n===36492||n===36494||n===36495){if(i=t.get(`EXT_texture_compression_bptc`),i!==null){if(n===36492)return a===`srgb`?i.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:i.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===36494)return i.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===36495)return i.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null}if(n===36283||n===36284||n===36285||n===36286){if(i=t.get(`EXT_texture_compression_rgtc`),i!==null){if(n===36283)return i.COMPRESSED_RED_RGTC1_EXT;if(n===36284)return i.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===36285)return i.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===36286)return i.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null}return n===1020?e.UNSIGNED_INT_24_8:e[n]===void 0?null:e[n]}return{convert:n}}var oo=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,so=`
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

}`,co=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new O(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new pe({vertexShader:oo,fragmentShader:so,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Je(new N(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},lo=class extends Be{constructor(e,t){super();let n=this,r=null,i=1,a=null,o=`local-floor`,s=1,c=null,l=null,u=null,d=null,f=null,p=null,m=typeof XRWebGLBinding<`u`,h=new co,g={},_=t.getContextAttributes(),v=null,y=null,b=[],x=[],S=new L,C=null,w=new me;w.viewport=new mt;let T=new me;T.viewport=new mt;let E=[w,T],D=new he,ee=null,te=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(e){let t=b[e];return t===void 0&&(t=new St,b[e]=t),t.getTargetRaySpace()},this.getControllerGrip=function(e){let t=b[e];return t===void 0&&(t=new St,b[e]=t),t.getGripSpace()},this.getHand=function(e){let t=b[e];return t===void 0&&(t=new St,b[e]=t),t.getHandSpace()};function ne(e){let t=x.indexOf(e.inputSource);if(t===-1)return;let n=b[t];n!==void 0&&(n.update(e.inputSource,e.frame,c||a),n.dispatchEvent({type:e.type,data:e.inputSource}))}function re(){r.removeEventListener(`select`,ne),r.removeEventListener(`selectstart`,ne),r.removeEventListener(`selectend`,ne),r.removeEventListener(`squeeze`,ne),r.removeEventListener(`squeezestart`,ne),r.removeEventListener(`squeezeend`,ne),r.removeEventListener(`end`,re),r.removeEventListener(`inputsourceschange`,ie);for(let e=0;e<b.length;e++){let t=x[e];t!==null&&(x[e]=null,b[e].disconnect(t))}ee=null,te=null,h.reset();for(let e in g)delete g[e];e.setRenderTarget(v),f=null,d=null,u=null,r=null,y=null,fe.stop(),n.isPresenting=!1,e.setPixelRatio(C),e.setSize(S.width,S.height,!1),n.dispatchEvent({type:`sessionend`})}this.setFramebufferScaleFactor=function(e){i=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change framebuffer scale while presenting.`)},this.setReferenceSpaceType=function(e){o=e,n.isPresenting===!0&&console.warn(`THREE.WebXRManager: Cannot change reference space type while presenting.`)},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(e){c=e},this.getBaseLayer=function(){return d===null?f:d},this.getBinding=function(){return u===null&&m&&(u=new XRWebGLBinding(r,t)),u},this.getFrame=function(){return p},this.getSession=function(){return r},this.setSession=async function(l){if(r=l,r!==null){if(v=e.getRenderTarget(),r.addEventListener(`select`,ne),r.addEventListener(`selectstart`,ne),r.addEventListener(`selectend`,ne),r.addEventListener(`squeeze`,ne),r.addEventListener(`squeezestart`,ne),r.addEventListener(`squeezeend`,ne),r.addEventListener(`end`,re),r.addEventListener(`inputsourceschange`,ie),_.xrCompatible!==!0&&await t.makeXRCompatible(),C=e.getPixelRatio(),e.getSize(S),m&&`createProjectionLayer`in XRWebGLBinding.prototype){let n=null,a=null,o=null;_.depth&&(o=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,n=_.stencil?Ee:xe,a=_.stencil?Lt:lt);let s={colorFormat:t.RGBA8,depthFormat:o,scaleFactor:i};u=this.getBinding(),d=u.createProjectionLayer(s),r.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),y=new kt(d.textureWidth,d.textureHeight,{format:at,type:zt,depthTexture:new Pt(d.textureWidth,d.textureHeight,a,void 0,void 0,void 0,void 0,void 0,void 0,n),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{let n={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:i};f=new XRWebGLLayer(r,t,n),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new kt(f.framebufferWidth,f.framebufferHeight,{format:at,type:zt,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(s),c=null,a=await r.requestReferenceSpace(o),fe.setContext(r),fe.start(),n.isPresenting=!0,n.dispatchEvent({type:`sessionstart`})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return h.getDepthTexture()};function ie(e){for(let t=0;t<e.removed.length;t++){let n=e.removed[t],r=x.indexOf(n);r>=0&&(x[r]=null,b[r].disconnect(n))}for(let t=0;t<e.added.length;t++){let n=e.added[t],r=x.indexOf(n);if(r===-1){for(let e=0;e<b.length;e++)if(e>=x.length){x.push(n),r=e;break}else if(x[e]===null){x[e]=n,r=e;break}if(r===-1)break}let i=b[r];i&&i.connect(n)}}let ae=new R,oe=new R;function se(e,t,n){ae.setFromMatrixPosition(t.matrixWorld),oe.setFromMatrixPosition(n.matrixWorld);let r=ae.distanceTo(oe),i=t.projectionMatrix.elements,a=n.projectionMatrix.elements,o=i[14]/(i[10]-1),s=i[14]/(i[10]+1),c=(i[9]+1)/i[5],l=(i[9]-1)/i[5],u=(i[8]-1)/i[0],d=(a[8]+1)/a[0],f=o*u,p=o*d,m=r/(-u+d),h=m*-u;if(t.matrixWorld.decompose(e.position,e.quaternion,e.scale),e.translateX(h),e.translateZ(m),e.matrixWorld.compose(e.position,e.quaternion,e.scale),e.matrixWorldInverse.copy(e.matrixWorld).invert(),i[10]===-1)e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse);else{let t=o+m,n=s+m,i=f-h,a=p+(r-h),u=c*s/n*t,d=l*s/n*t;e.projectionMatrix.makePerspective(i,a,u,d,t,n),e.projectionMatrixInverse.copy(e.projectionMatrix).invert()}}function ce(e,t){t===null?e.matrixWorld.copy(e.matrix):e.matrixWorld.multiplyMatrices(t.matrixWorld,e.matrix),e.matrixWorldInverse.copy(e.matrixWorld).invert()}this.updateCamera=function(e){if(r===null)return;let t=e.near,n=e.far;h.texture!==null&&(h.depthNear>0&&(t=h.depthNear),h.depthFar>0&&(n=h.depthFar)),D.near=T.near=w.near=t,D.far=T.far=w.far=n,(ee!==D.near||te!==D.far)&&(r.updateRenderState({depthNear:D.near,depthFar:D.far}),ee=D.near,te=D.far),D.layers.mask=e.layers.mask|6,w.layers.mask=D.layers.mask&3,T.layers.mask=D.layers.mask&5;let i=e.parent,a=D.cameras;ce(D,i);for(let e=0;e<a.length;e++)ce(a[e],i);a.length===2?se(D,w,T):D.projectionMatrix.copy(w.projectionMatrix),le(e,D,i)};function le(e,t,n){n===null?e.matrix.copy(t.matrixWorld):(e.matrix.copy(n.matrixWorld),e.matrix.invert(),e.matrix.multiply(t.matrixWorld)),e.matrix.decompose(e.position,e.quaternion,e.scale),e.updateMatrixWorld(!0),e.projectionMatrix.copy(t.projectionMatrix),e.projectionMatrixInverse.copy(t.projectionMatrixInverse),e.isPerspectiveCamera&&(e.fov=It*2*Math.atan(1/e.projectionMatrix.elements[5]),e.zoom=1)}this.getCamera=function(){return D},this.getFoveation=function(){if(d!==null||f!==null)return s},this.setFoveation=function(e){s=e,d!==null&&(d.fixedFoveation=e),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=e)},this.hasDepthSensing=function(){return h.texture!==null},this.getDepthSensingMesh=function(){return h.getMesh(D)},this.getCameraTexture=function(e){return g[e]};let ue=null;function de(t,i){if(l=i.getViewerPose(c||a),p=i,l!==null){let t=l.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let i=!1;t.length!==D.cameras.length&&(D.cameras.length=0,i=!0);for(let n=0;n<t.length;n++){let r=t[n],a=null;if(f!==null)a=f.getViewport(r);else{let t=u.getViewSubImage(d,r);a=t.viewport,n===0&&(e.setRenderTargetTextures(y,t.colorTexture,t.depthStencilTexture),e.setRenderTarget(y))}let o=E[n];o===void 0&&(o=new me,o.layers.enable(n),o.viewport=new mt,E[n]=o),o.matrix.fromArray(r.transform.matrix),o.matrix.decompose(o.position,o.quaternion,o.scale),o.projectionMatrix.fromArray(r.projectionMatrix),o.projectionMatrixInverse.copy(o.projectionMatrix).invert(),o.viewport.set(a.x,a.y,a.width,a.height),n===0&&(D.matrix.copy(o.matrix),D.matrix.decompose(D.position,D.quaternion,D.scale)),i===!0&&D.cameras.push(o)}let a=r.enabledFeatures;if(a&&a.includes(`depth-sensing`)&&r.depthUsage==`gpu-optimized`&&m){u=n.getBinding();let e=u.getDepthInformation(t[0]);e&&e.isValid&&e.texture&&h.init(e,r.renderState)}if(a&&a.includes(`camera-access`)&&m){e.state.unbindTexture(),u=n.getBinding();for(let e=0;e<t.length;e++){let n=t[e].camera;if(n){let e=g[n];e||(e=new O,g[n]=e);let t=u.getCameraImage(n);e.sourceTexture=t}}}}for(let e=0;e<b.length;e++){let t=x[e],n=b[e];t!==null&&n!==void 0&&n.update(t,i,c||a)}ue&&ue(t,i),i.detectedPlanes&&n.dispatchEvent({type:`planesdetected`,data:i}),p=null}let fe=new fr;fe.setAnimationLoop(de),this.setAnimationLoop=function(e){ue=e},this.dispose=function(){}}},uo=new F,fo=new z;function po(e,t){function n(e,t){e.matrixAutoUpdate===!0&&e.updateMatrix(),t.value.copy(e.matrix)}function r(t,n){n.color.getRGB(t.fogColor.value,qt(e)),n.isFog?(t.fogNear.value=n.near,t.fogFar.value=n.far):n.isFogExp2&&(t.fogDensity.value=n.density)}function i(e,t,n,r,i){t.isMeshBasicMaterial||t.isMeshLambertMaterial?a(e,t):t.isMeshToonMaterial?(a(e,t),d(e,t)):t.isMeshPhongMaterial?(a(e,t),u(e,t)):t.isMeshStandardMaterial?(a(e,t),f(e,t),t.isMeshPhysicalMaterial&&p(e,t,i)):t.isMeshMatcapMaterial?(a(e,t),m(e,t)):t.isMeshDepthMaterial?a(e,t):t.isMeshDistanceMaterial?(a(e,t),h(e,t)):t.isMeshNormalMaterial?a(e,t):t.isLineBasicMaterial?(o(e,t),t.isLineDashedMaterial&&s(e,t)):t.isPointsMaterial?c(e,t,n,r):t.isSpriteMaterial?l(e,t):t.isShadowMaterial?(e.color.value.copy(t.color),e.opacity.value=t.opacity):t.isShaderMaterial&&(t.uniformsNeedUpdate=!1)}function a(e,r){e.opacity.value=r.opacity,r.color&&e.diffuse.value.copy(r.color),r.emissive&&e.emissive.value.copy(r.emissive).multiplyScalar(r.emissiveIntensity),r.map&&(e.map.value=r.map,n(r.map,e.mapTransform)),r.alphaMap&&(e.alphaMap.value=r.alphaMap,n(r.alphaMap,e.alphaMapTransform)),r.bumpMap&&(e.bumpMap.value=r.bumpMap,n(r.bumpMap,e.bumpMapTransform),e.bumpScale.value=r.bumpScale,r.side===1&&(e.bumpScale.value*=-1)),r.normalMap&&(e.normalMap.value=r.normalMap,n(r.normalMap,e.normalMapTransform),e.normalScale.value.copy(r.normalScale),r.side===1&&e.normalScale.value.negate()),r.displacementMap&&(e.displacementMap.value=r.displacementMap,n(r.displacementMap,e.displacementMapTransform),e.displacementScale.value=r.displacementScale,e.displacementBias.value=r.displacementBias),r.emissiveMap&&(e.emissiveMap.value=r.emissiveMap,n(r.emissiveMap,e.emissiveMapTransform)),r.specularMap&&(e.specularMap.value=r.specularMap,n(r.specularMap,e.specularMapTransform)),r.alphaTest>0&&(e.alphaTest.value=r.alphaTest);let i=t.get(r),a=i.envMap,o=i.envMapRotation;a&&(e.envMap.value=a,uo.copy(o),uo.x*=-1,uo.y*=-1,uo.z*=-1,a.isCubeTexture&&a.isRenderTargetTexture===!1&&(uo.y*=-1,uo.z*=-1),e.envMapRotation.value.setFromMatrix4(fo.makeRotationFromEuler(uo)),e.flipEnvMap.value=a.isCubeTexture&&a.isRenderTargetTexture===!1?-1:1,e.reflectivity.value=r.reflectivity,e.ior.value=r.ior,e.refractionRatio.value=r.refractionRatio),r.lightMap&&(e.lightMap.value=r.lightMap,e.lightMapIntensity.value=r.lightMapIntensity,n(r.lightMap,e.lightMapTransform)),r.aoMap&&(e.aoMap.value=r.aoMap,e.aoMapIntensity.value=r.aoMapIntensity,n(r.aoMap,e.aoMapTransform))}function o(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform))}function s(e,t){e.dashSize.value=t.dashSize,e.totalSize.value=t.dashSize+t.gapSize,e.scale.value=t.scale}function c(e,t,r,i){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.size.value=t.size*r,e.scale.value=i*.5,t.map&&(e.map.value=t.map,n(t.map,e.uvTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function l(e,t){e.diffuse.value.copy(t.color),e.opacity.value=t.opacity,e.rotation.value=t.rotation,t.map&&(e.map.value=t.map,n(t.map,e.mapTransform)),t.alphaMap&&(e.alphaMap.value=t.alphaMap,n(t.alphaMap,e.alphaMapTransform)),t.alphaTest>0&&(e.alphaTest.value=t.alphaTest)}function u(e,t){e.specular.value.copy(t.specular),e.shininess.value=Math.max(t.shininess,1e-4)}function d(e,t){t.gradientMap&&(e.gradientMap.value=t.gradientMap)}function f(e,t){e.metalness.value=t.metalness,t.metalnessMap&&(e.metalnessMap.value=t.metalnessMap,n(t.metalnessMap,e.metalnessMapTransform)),e.roughness.value=t.roughness,t.roughnessMap&&(e.roughnessMap.value=t.roughnessMap,n(t.roughnessMap,e.roughnessMapTransform)),t.envMap&&(e.envMapIntensity.value=t.envMapIntensity)}function p(e,t,r){e.ior.value=t.ior,t.sheen>0&&(e.sheenColor.value.copy(t.sheenColor).multiplyScalar(t.sheen),e.sheenRoughness.value=t.sheenRoughness,t.sheenColorMap&&(e.sheenColorMap.value=t.sheenColorMap,n(t.sheenColorMap,e.sheenColorMapTransform)),t.sheenRoughnessMap&&(e.sheenRoughnessMap.value=t.sheenRoughnessMap,n(t.sheenRoughnessMap,e.sheenRoughnessMapTransform))),t.clearcoat>0&&(e.clearcoat.value=t.clearcoat,e.clearcoatRoughness.value=t.clearcoatRoughness,t.clearcoatMap&&(e.clearcoatMap.value=t.clearcoatMap,n(t.clearcoatMap,e.clearcoatMapTransform)),t.clearcoatRoughnessMap&&(e.clearcoatRoughnessMap.value=t.clearcoatRoughnessMap,n(t.clearcoatRoughnessMap,e.clearcoatRoughnessMapTransform)),t.clearcoatNormalMap&&(e.clearcoatNormalMap.value=t.clearcoatNormalMap,n(t.clearcoatNormalMap,e.clearcoatNormalMapTransform),e.clearcoatNormalScale.value.copy(t.clearcoatNormalScale),t.side===1&&e.clearcoatNormalScale.value.negate())),t.dispersion>0&&(e.dispersion.value=t.dispersion),t.iridescence>0&&(e.iridescence.value=t.iridescence,e.iridescenceIOR.value=t.iridescenceIOR,e.iridescenceThicknessMinimum.value=t.iridescenceThicknessRange[0],e.iridescenceThicknessMaximum.value=t.iridescenceThicknessRange[1],t.iridescenceMap&&(e.iridescenceMap.value=t.iridescenceMap,n(t.iridescenceMap,e.iridescenceMapTransform)),t.iridescenceThicknessMap&&(e.iridescenceThicknessMap.value=t.iridescenceThicknessMap,n(t.iridescenceThicknessMap,e.iridescenceThicknessMapTransform))),t.transmission>0&&(e.transmission.value=t.transmission,e.transmissionSamplerMap.value=r.texture,e.transmissionSamplerSize.value.set(r.width,r.height),t.transmissionMap&&(e.transmissionMap.value=t.transmissionMap,n(t.transmissionMap,e.transmissionMapTransform)),e.thickness.value=t.thickness,t.thicknessMap&&(e.thicknessMap.value=t.thicknessMap,n(t.thicknessMap,e.thicknessMapTransform)),e.attenuationDistance.value=t.attenuationDistance,e.attenuationColor.value.copy(t.attenuationColor)),t.anisotropy>0&&(e.anisotropyVector.value.set(t.anisotropy*Math.cos(t.anisotropyRotation),t.anisotropy*Math.sin(t.anisotropyRotation)),t.anisotropyMap&&(e.anisotropyMap.value=t.anisotropyMap,n(t.anisotropyMap,e.anisotropyMapTransform))),e.specularIntensity.value=t.specularIntensity,e.specularColor.value.copy(t.specularColor),t.specularColorMap&&(e.specularColorMap.value=t.specularColorMap,n(t.specularColorMap,e.specularColorMapTransform)),t.specularIntensityMap&&(e.specularIntensityMap.value=t.specularIntensityMap,n(t.specularIntensityMap,e.specularIntensityMapTransform))}function m(e,t){t.matcap&&(e.matcap.value=t.matcap)}function h(e,n){let r=t.get(n).light;e.referencePosition.value.setFromMatrixPosition(r.matrixWorld),e.nearDistance.value=r.shadow.camera.near,e.farDistance.value=r.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:i}}function mo(e,t,n,r){let i={},a={},o=[],s=e.getParameter(e.MAX_UNIFORM_BUFFER_BINDINGS);function c(e,t){let n=t.program;r.uniformBlockBinding(e,n)}function l(e,n){let o=i[e.id];o===void 0&&(m(e),o=u(e),i[e.id]=o,e.addEventListener(`dispose`,g));let s=n.program;r.updateUBOMapping(e,s);let c=t.render.frame;a[e.id]!==c&&(f(e),a[e.id]=c)}function u(t){let n=d();t.__bindingPointIndex=n;let r=e.createBuffer(),i=t.__size,a=t.usage;return e.bindBuffer(e.UNIFORM_BUFFER,r),e.bufferData(e.UNIFORM_BUFFER,i,a),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,n,r),r}function d(){for(let e=0;e<s;e++)if(o.indexOf(e)===-1)return o.push(e),e;return console.error(`THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached.`),0}function f(t){let n=i[t.id],r=t.uniforms,a=t.__cache;e.bindBuffer(e.UNIFORM_BUFFER,n);for(let t=0,n=r.length;t<n;t++){let n=Array.isArray(r[t])?r[t]:[r[t]];for(let r=0,i=n.length;r<i;r++){let i=n[r];if(p(i,t,r,a)===!0){let t=i.__offset,n=Array.isArray(i.value)?i.value:[i.value],r=0;for(let a=0;a<n.length;a++){let o=n[a],s=h(o);typeof o==`number`||typeof o==`boolean`?(i.__data[0]=o,e.bufferSubData(e.UNIFORM_BUFFER,t+r,i.__data)):o.isMatrix3?(i.__data[0]=o.elements[0],i.__data[1]=o.elements[1],i.__data[2]=o.elements[2],i.__data[3]=0,i.__data[4]=o.elements[3],i.__data[5]=o.elements[4],i.__data[6]=o.elements[5],i.__data[7]=0,i.__data[8]=o.elements[6],i.__data[9]=o.elements[7],i.__data[10]=o.elements[8],i.__data[11]=0):(o.toArray(i.__data,r),r+=s.storage/Float32Array.BYTES_PER_ELEMENT)}e.bufferSubData(e.UNIFORM_BUFFER,t,i.__data)}}}e.bindBuffer(e.UNIFORM_BUFFER,null)}function p(e,t,n,r){let i=e.value,a=t+`_`+n;if(r[a]===void 0)return r[a]=typeof i==`number`||typeof i==`boolean`?i:i.clone(),!0;{let e=r[a];if(typeof i==`number`||typeof i==`boolean`){if(e!==i)return r[a]=i,!0}else if(e.equals(i)===!1)return e.copy(i),!0}return!1}function m(e){let t=e.uniforms,n=0;for(let e=0,r=t.length;e<r;e++){let r=Array.isArray(t[e])?t[e]:[t[e]];for(let e=0,t=r.length;e<t;e++){let t=r[e],i=Array.isArray(t.value)?t.value:[t.value];for(let e=0,r=i.length;e<r;e++){let r=i[e],a=h(r),o=n%16,s=o%a.boundary,c=o+s;n+=s,c!==0&&16-c<a.storage&&(n+=16-c),t.__data=new Float32Array(a.storage/Float32Array.BYTES_PER_ELEMENT),t.__offset=n,n+=a.storage}}}let r=n%16;return r>0&&(n+=16-r),e.__size=n,e.__cache={},this}function h(e){let t={boundary:0,storage:0};return typeof e==`number`||typeof e==`boolean`?(t.boundary=4,t.storage=4):e.isVector2?(t.boundary=8,t.storage=8):e.isVector3||e.isColor?(t.boundary=16,t.storage=12):e.isVector4?(t.boundary=16,t.storage=16):e.isMatrix3?(t.boundary=48,t.storage=48):e.isMatrix4?(t.boundary=64,t.storage=64):e.isTexture?console.warn(`THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.`):console.warn(`THREE.WebGLRenderer: Unsupported uniform value type.`,e),t}function g(t){let n=t.target;n.removeEventListener(`dispose`,g);let r=o.indexOf(n.__bindingPointIndex);o.splice(r,1),e.deleteBuffer(i[n.id]),delete i[n.id],delete a[n.id]}function _(){for(let t in i)e.deleteBuffer(i[t]);o=[],i={},a={}}return{bind:c,update:l,dispose:_}}var ho=class{constructor(e={}){let{canvas:t=Ut(),context:n=null,depth:r=!0,stencil:i=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:s=!0,preserveDrawingBuffer:c=!1,powerPreference:l=`default`,failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<`u`&&n instanceof WebGLRenderingContext)throw Error(`THREE.WebGLRenderer: WebGL 1 is not supported since r163.`);f=n.getContextAttributes().alpha}else f=a;let p=new Uint32Array(4),m=new Int32Array(4),h=null,g=null,_=[],v=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=0,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let y=this,b=!1;this._outputColorSpace=ke;let x=0,S=0,C=null,w=-1,T=null,E=new mt,D=new mt,ee=null,te=new Ce(0),ne=0,re=t.width,ie=t.height,ae=1,oe=null,se=null,ce=new mt(0,0,re,ie),le=new mt(0,0,re,ie),O=!1,ue=new wt,de=!1,fe=!1,pe=new z,me=new R,he=new mt,k={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},_e=!1;function ve(){return C===null?ae:1}let A=n;function ye(e,n){return t.getContext(e,n)}try{let e={alpha:!0,depth:r,stencil:i,antialias:o,premultipliedAlpha:s,preserveDrawingBuffer:c,powerPreference:l,failIfMajorPerformanceCaveat:u};if(`setAttribute`in t&&t.setAttribute(`data-engine`,`three.js r180`),t.addEventListener(`webglcontextlost`,Ge,!1),t.addEventListener(`webglcontextrestored`,Ke,!1),t.addEventListener(`webglcontextcreationerror`,qe,!1),A===null){let t=`webgl2`;if(A=ye(t,e),A===null)throw ye(t)?Error(`Error creating WebGL context with your selected attributes.`):Error(`Error creating WebGL context.`)}}catch(e){throw console.error(`THREE.WebGLRenderer: `+e.message),e}let be,xe,j,Se,M,N,we,Te,Ee,De,P,Ae,je,Me,Ne,Pe,Fe,Ie,Le,Re,ze,Be,Ve,He;function Ue(){be=new qr(A),be.init(),Be=new ao(A,be),xe=new Sr(A,be,e,Be),j=new ro(A,be),xe.reversedDepthBuffer&&d&&j.buffers.depth.setReversed(!0),Se=new Xr(A),M=new Va,N=new io(A,be,j,M,xe,Be,Se),we=new wr(y),Te=new Kr(y),Ee=new pr(A),Ve=new br(A,Ee),De=new Jr(A,Ee,Se,Ve),P=new Qr(A,De,Ee,Se),Le=new Zr(A,xe,N),Pe=new Cr(M),Ae=new Ba(y,we,Te,be,xe,Ve,Pe),je=new po(y,M),Me=new Ga,Ne=new Qa(be),Ie=new yr(y,we,Te,j,P,f,s),Fe=new to(y,P,xe),He=new mo(A,Se,xe,j),Re=new xr(A,be,Se),ze=new Yr(A,be,Se),Se.programs=Ae.programs,y.capabilities=xe,y.extensions=be,y.properties=M,y.renderLists=Me,y.shadowMap=Fe,y.state=j,y.info=Se}Ue();let We=new lo(y,A);this.xr=We,this.getContext=function(){return A},this.getContextAttributes=function(){return A.getContextAttributes()},this.forceContextLoss=function(){let e=be.get(`WEBGL_lose_context`);e&&e.loseContext()},this.forceContextRestore=function(){let e=be.get(`WEBGL_lose_context`);e&&e.restoreContext()},this.getPixelRatio=function(){return ae},this.setPixelRatio=function(e){e!==void 0&&(ae=e,this.setSize(re,ie,!1))},this.getSize=function(e){return e.set(re,ie)},this.setSize=function(e,n,r=!0){We.isPresenting?console.warn(`THREE.WebGLRenderer: Can't change size while VR device is presenting.`):(re=e,ie=n,t.width=Math.floor(e*ae),t.height=Math.floor(n*ae),r===!0&&(t.style.width=e+`px`,t.style.height=n+`px`),this.setViewport(0,0,e,n))},this.getDrawingBufferSize=function(e){return e.set(re*ae,ie*ae).floor()},this.setDrawingBufferSize=function(e,n,r){re=e,ie=n,ae=r,t.width=Math.floor(e*r),t.height=Math.floor(n*r),this.setViewport(0,0,e,n)},this.getCurrentViewport=function(e){return e.copy(E)},this.getViewport=function(e){return e.copy(ce)},this.setViewport=function(e,t,n,r){e.isVector4?ce.set(e.x,e.y,e.z,e.w):ce.set(e,t,n,r),j.viewport(E.copy(ce).multiplyScalar(ae).round())},this.getScissor=function(e){return e.copy(le)},this.setScissor=function(e,t,n,r){e.isVector4?le.set(e.x,e.y,e.z,e.w):le.set(e,t,n,r),j.scissor(D.copy(le).multiplyScalar(ae).round())},this.getScissorTest=function(){return O},this.setScissorTest=function(e){j.setScissorTest(O=e)},this.setOpaqueSort=function(e){oe=e},this.setTransparentSort=function(e){se=e},this.getClearColor=function(e){return e.copy(Ie.getClearColor())},this.setClearColor=function(){Ie.setClearColor(...arguments)},this.getClearAlpha=function(){return Ie.getClearAlpha()},this.setClearAlpha=function(){Ie.setClearAlpha(...arguments)},this.clear=function(e=!0,t=!0,n=!0){let r=0;if(e){let e=!1;if(C!==null){let t=C.texture.format;e=t===1033||t===1031||t===1029}if(e){let e=C.texture.type,t=e===1009||e===1014||e===1012||e===1020||e===1017||e===1018,n=Ie.getClearColor(),r=Ie.getClearAlpha(),i=n.r,a=n.g,o=n.b;t?(p[0]=i,p[1]=a,p[2]=o,p[3]=r,A.clearBufferuiv(A.COLOR,0,p)):(m[0]=i,m[1]=a,m[2]=o,m[3]=r,A.clearBufferiv(A.COLOR,0,m))}else r|=A.COLOR_BUFFER_BIT}t&&(r|=A.DEPTH_BUFFER_BIT),n&&(r|=A.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),A.clear(r)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener(`webglcontextlost`,Ge,!1),t.removeEventListener(`webglcontextrestored`,Ke,!1),t.removeEventListener(`webglcontextcreationerror`,qe,!1),Ie.dispose(),Me.dispose(),Ne.dispose(),M.dispose(),we.dispose(),Te.dispose(),P.dispose(),Ve.dispose(),He.dispose(),Ae.dispose(),We.dispose(),We.removeEventListener(`sessionstart`,et),We.removeEventListener(`sessionend`,tt),nt.stop()};function Ge(e){e.preventDefault(),console.log(`THREE.WebGLRenderer: Context Lost.`),b=!0}function Ke(){console.log(`THREE.WebGLRenderer: Context Restored.`),b=!1;let e=Se.autoReset,t=Fe.enabled,n=Fe.autoUpdate,r=Fe.needsUpdate,i=Fe.type;Ue(),Se.autoReset=e,Fe.enabled=t,Fe.autoUpdate=n,Fe.needsUpdate=r,Fe.type=i}function qe(e){console.error(`THREE.WebGLRenderer: A WebGL context could not be created. Reason: `,e.statusMessage)}function Je(e){let t=e.target;t.removeEventListener(`dispose`,Je),Ye(t)}function Ye(e){Xe(e),M.remove(e)}function Xe(e){let t=M.get(e).programs;t!==void 0&&(t.forEach(function(e){Ae.releaseProgram(e)}),e.isShaderMaterial&&Ae.releaseShaderCache(e))}this.renderBufferDirect=function(e,t,n,r,i,a){t===null&&(t=k);let o=i.isMesh&&i.matrixWorld.determinant()<0,s=ut(e,t,n,r,i);j.setMaterial(r,o);let c=n.index,l=1;if(r.wireframe===!0){if(c=De.getWireframeAttribute(n),c===void 0)return;l=2}let u=n.drawRange,d=n.attributes.position,f=u.start*l,p=(u.start+u.count)*l;a!==null&&(f=Math.max(f,a.start*l),p=Math.min(p,(a.start+a.count)*l)),c===null?d!=null&&(f=Math.max(f,0),p=Math.min(p,d.count)):(f=Math.max(f,0),p=Math.min(p,c.count));let m=p-f;if(m<0||m===1/0)return;Ve.setup(i,r,s,n,c);let h,g=Re;if(c!==null&&(h=Ee.get(c),g=ze,g.setIndex(h)),i.isMesh)r.wireframe===!0?(j.setLineWidth(r.wireframeLinewidth*ve()),g.setMode(A.LINES)):g.setMode(A.TRIANGLES);else if(i.isLine){let e=r.linewidth;e===void 0&&(e=1),j.setLineWidth(e*ve()),i.isLineSegments?g.setMode(A.LINES):i.isLineLoop?g.setMode(A.LINE_LOOP):g.setMode(A.LINE_STRIP)}else i.isPoints?g.setMode(A.POINTS):i.isSprite&&g.setMode(A.TRIANGLES);if(i.isBatchedMesh){if(i._multiDrawInstances!==null)Kt(`THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection.`),g.renderMultiDrawInstances(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount,i._multiDrawInstances);else if(be.get(`WEBGL_multi_draw`))g.renderMultiDraw(i._multiDrawStarts,i._multiDrawCounts,i._multiDrawCount);else{let e=i._multiDrawStarts,t=i._multiDrawCounts,n=i._multiDrawCount,a=c?Ee.get(c).bytesPerElement:1,o=M.get(r).currentProgram.getUniforms();for(let r=0;r<n;r++)o.setValue(A,`_gl_DrawID`,r),g.render(e[r]/a,t[r])}}else if(i.isInstancedMesh)g.renderInstances(f,m,i.count);else if(n.isInstancedBufferGeometry){let e=n._maxInstanceCount===void 0?1/0:n._maxInstanceCount,t=Math.min(n.instanceCount,e);g.renderInstances(f,m,t)}else g.render(f,m)};function Ze(e,t,n){e.transparent===!0&&e.side===2&&e.forceSinglePass===!1?(e.side=1,e.needsUpdate=!0,st(e,t,n),e.side=0,e.needsUpdate=!0,st(e,t,n),e.side=2):st(e,t,n)}this.compile=function(e,t,n=null){n===null&&(n=e),g=Ne.get(n),g.init(t),v.push(g),n.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(g.pushLight(e),e.castShadow&&g.pushShadow(e))}),e!==n&&e.traverseVisible(function(e){e.isLight&&e.layers.test(t.layers)&&(g.pushLight(e),e.castShadow&&g.pushShadow(e))}),g.setupLights();let r=new Set;return e.traverse(function(e){if(!(e.isMesh||e.isPoints||e.isLine||e.isSprite))return;let t=e.material;if(t){if(Array.isArray(t))for(let i=0;i<t.length;i++){let a=t[i];Ze(a,n,e),r.add(a)}else Ze(t,n,e),r.add(t)}}),g=v.pop(),r},this.compileAsync=function(e,t,n=null){let r=this.compile(e,t,n);return new Promise(t=>{function n(){r.forEach(function(e){M.get(e).currentProgram.isReady()&&r.delete(e)}),r.size===0?t(e):setTimeout(n,10)}be.get(`KHR_parallel_shader_compile`)===null?setTimeout(n,10):n()})};let Qe=null;function $e(e){Qe&&Qe(e)}function et(){nt.stop()}function tt(){nt.start()}let nt=new fr;nt.setAnimationLoop($e),typeof self<`u`&&nt.setContext(self),this.setAnimationLoop=function(e){Qe=e,We.setAnimationLoop(e),e===null?nt.stop():nt.start()},We.addEventListener(`sessionstart`,et),We.addEventListener(`sessionend`,tt),this.render=function(e,t){if(t!==void 0&&t.isCamera!==!0){console.error(`THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.`);return}if(b===!0)return;if(e.matrixWorldAutoUpdate===!0&&e.updateMatrixWorld(),t.parent===null&&t.matrixWorldAutoUpdate===!0&&t.updateMatrixWorld(),We.enabled===!0&&We.isPresenting===!0&&(We.cameraAutoUpdate===!0&&We.updateCamera(t),t=We.getCamera()),e.isScene===!0&&e.onBeforeRender(y,e,t,C),g=Ne.get(e,v.length),g.init(t),v.push(g),pe.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),ue.setFromProjectionMatrix(pe,vt,t.reversedDepth),fe=this.localClippingEnabled,de=Pe.init(this.clippingPlanes,fe),h=Me.get(e,_.length),h.init(),_.push(h),We.enabled===!0&&We.isPresenting===!0){let e=y.xr.getDepthSensingMesh();e!==null&&rt(e,t,-1/0,y.sortObjects)}rt(e,t,0,y.sortObjects),h.finish(),y.sortObjects===!0&&h.sort(oe,se),_e=We.enabled===!1||We.isPresenting===!1||We.hasDepthSensing()===!1,_e&&Ie.addToRenderList(h,e),this.info.render.frame++,de===!0&&Pe.beginShadows();let n=g.state.shadowsArray;Fe.render(n,e,t),de===!0&&Pe.endShadows(),this.info.autoReset===!0&&this.info.reset();let r=h.opaque,i=h.transmissive;if(g.setupLights(),t.isArrayCamera){let n=t.cameras;if(i.length>0)for(let t=0,a=n.length;t<a;t++){let a=n[t];it(r,i,e,a)}_e&&Ie.render(e);for(let t=0,r=n.length;t<r;t++){let r=n[t];F(h,e,r,r.viewport)}}else i.length>0&&it(r,i,e,t),_e&&Ie.render(e),F(h,e,t);C!==null&&S===0&&(N.updateMultisampleRenderTarget(C),N.updateRenderTargetMipmap(C)),e.isScene===!0&&e.onAfterRender(y,e,t),Ve.resetDefaultState(),w=-1,T=null,v.pop(),v.length>0?(g=v[v.length-1],de===!0&&Pe.setGlobalState(y.clippingPlanes,g.state.camera)):g=null,_.pop(),h=_.length>0?_[_.length-1]:null};function rt(e,t,n,r){if(e.visible===!1)return;if(e.layers.test(t.layers)){if(e.isGroup)n=e.renderOrder;else if(e.isLOD)e.autoUpdate===!0&&e.update(t);else if(e.isLight)g.pushLight(e),e.castShadow&&g.pushShadow(e);else if(e.isSprite){if(!e.frustumCulled||ue.intersectsSprite(e)){r&&he.setFromMatrixPosition(e.matrixWorld).applyMatrix4(pe);let t=P.update(e),i=e.material;i.visible&&h.push(e,t,i,n,he.z,null)}}else if((e.isMesh||e.isLine||e.isPoints)&&(!e.frustumCulled||ue.intersectsObject(e))){let t=P.update(e),i=e.material;if(r&&(e.boundingSphere===void 0?(t.boundingSphere===null&&t.computeBoundingSphere(),he.copy(t.boundingSphere.center)):(e.boundingSphere===null&&e.computeBoundingSphere(),he.copy(e.boundingSphere.center)),he.applyMatrix4(e.matrixWorld).applyMatrix4(pe)),Array.isArray(i)){let r=t.groups;for(let a=0,o=r.length;a<o;a++){let o=r[a],s=i[o.materialIndex];s&&s.visible&&h.push(e,t,s,n,he.z,o)}}else i.visible&&h.push(e,t,i,n,he.z,null)}}let i=e.children;for(let e=0,a=i.length;e<a;e++)rt(i[e],t,n,r)}function F(e,t,n,r){let i=e.opaque,a=e.transmissive,o=e.transparent;g.setupLightsView(n),de===!0&&Pe.setGlobalState(y.clippingPlanes,n),r&&j.viewport(E.copy(r)),i.length>0&&at(i,t,n),a.length>0&&at(a,t,n),o.length>0&&at(o,t,n),j.buffers.depth.setTest(!0),j.buffers.depth.setMask(!0),j.buffers.color.setMask(!0),j.setPolygonOffset(!1)}function it(e,t,n,r){if((n.isScene===!0?n.overrideMaterial:null)!==null)return;g.state.transmissionRenderTarget[r.id]===void 0&&(g.state.transmissionRenderTarget[r.id]=new kt(1,1,{generateMipmaps:!0,type:be.has(`EXT_color_buffer_half_float`)||be.has(`EXT_color_buffer_float`)?Rt:zt,minFilter:Wt,samples:4,stencilBuffer:i,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Oe.workingColorSpace}));let a=g.state.transmissionRenderTarget[r.id],o=r.viewport||E;a.setSize(o.z*y.transmissionResolutionScale,o.w*y.transmissionResolutionScale);let s=y.getRenderTarget(),c=y.getActiveCubeFace(),l=y.getActiveMipmapLevel();y.setRenderTarget(a),y.getClearColor(te),ne=y.getClearAlpha(),ne<1&&y.setClearColor(16777215,.5),y.clear(),_e&&Ie.render(n);let u=y.toneMapping;y.toneMapping=0;let d=r.viewport;if(r.viewport!==void 0&&(r.viewport=void 0),g.setupLightsView(r),de===!0&&Pe.setGlobalState(y.clippingPlanes,r),at(e,n,r),N.updateMultisampleRenderTarget(a),N.updateRenderTargetMipmap(a),be.has(`WEBGL_multisampled_render_to_texture`)===!1){let e=!1;for(let i=0,a=t.length;i<a;i++){let a=t[i],o=a.object,s=a.geometry,c=a.material,l=a.group;if(c.side===2&&o.layers.test(r.layers)){let t=c.side;c.side=1,c.needsUpdate=!0,ot(o,n,r,s,c,l),c.side=t,c.needsUpdate=!0,e=!0}}e===!0&&(N.updateMultisampleRenderTarget(a),N.updateRenderTargetMipmap(a))}y.setRenderTarget(s,c,l),y.setClearColor(te,ne),d!==void 0&&(r.viewport=d),y.toneMapping=u}function at(e,t,n){let r=t.isScene===!0?t.overrideMaterial:null;for(let i=0,a=e.length;i<a;i++){let a=e[i],o=a.object,s=a.geometry,c=a.group,l=a.material;l.allowOverride===!0&&r!==null&&(l=r),o.layers.test(n.layers)&&ot(o,t,n,s,l,c)}}function ot(e,t,n,r,i,a){e.onBeforeRender(y,t,n,r,i,a),e.modelViewMatrix.multiplyMatrices(n.matrixWorldInverse,e.matrixWorld),e.normalMatrix.getNormalMatrix(e.modelViewMatrix),i.onBeforeRender(y,t,n,r,e,a),i.transparent===!0&&i.side===2&&i.forceSinglePass===!1?(i.side=1,i.needsUpdate=!0,y.renderBufferDirect(n,t,r,i,e,a),i.side=0,i.needsUpdate=!0,y.renderBufferDirect(n,t,r,i,e,a),i.side=2):y.renderBufferDirect(n,t,r,i,e,a),e.onAfterRender(y,t,n,r,i,a)}function st(e,t,n){t.isScene!==!0&&(t=k);let r=M.get(e),i=g.state.lights,a=g.state.shadowsArray,o=i.state.version,s=Ae.getParameters(e,i.state,a,t,n),c=Ae.getProgramCacheKey(s),l=r.programs;r.environment=e.isMeshStandardMaterial?t.environment:null,r.fog=t.fog,r.envMap=(e.isMeshStandardMaterial?Te:we).get(e.envMap||r.environment),r.envMapRotation=r.environment!==null&&e.envMap===null?t.environmentRotation:e.envMapRotation,l===void 0&&(e.addEventListener(`dispose`,Je),l=new Map,r.programs=l);let u=l.get(c);if(u!==void 0){if(r.currentProgram===u&&r.lightsStateVersion===o)return lt(e,s),u}else s.uniforms=Ae.getUniforms(e),e.onBeforeCompile(s,y),u=Ae.acquireProgram(s,c),l.set(c,u),r.uniforms=s.uniforms;let d=r.uniforms;return(!e.isShaderMaterial&&!e.isRawShaderMaterial||e.clipping===!0)&&(d.clippingPlanes=Pe.uniform),lt(e,s),r.needsLights=ft(e),r.lightsStateVersion=o,r.needsLights&&(d.ambientLightColor.value=i.state.ambient,d.lightProbe.value=i.state.probe,d.directionalLights.value=i.state.directional,d.directionalLightShadows.value=i.state.directionalShadow,d.spotLights.value=i.state.spot,d.spotLightShadows.value=i.state.spotShadow,d.rectAreaLights.value=i.state.rectArea,d.ltc_1.value=i.state.rectAreaLTC1,d.ltc_2.value=i.state.rectAreaLTC2,d.pointLights.value=i.state.point,d.pointLightShadows.value=i.state.pointShadow,d.hemisphereLights.value=i.state.hemi,d.directionalShadowMap.value=i.state.directionalShadowMap,d.directionalShadowMatrix.value=i.state.directionalShadowMatrix,d.spotShadowMap.value=i.state.spotShadowMap,d.spotLightMatrix.value=i.state.spotLightMatrix,d.spotLightMap.value=i.state.spotLightMap,d.pointShadowMap.value=i.state.pointShadowMap,d.pointShadowMatrix.value=i.state.pointShadowMatrix),r.currentProgram=u,r.uniformsList=null,u}function ct(e){if(e.uniformsList===null){let t=e.currentProgram.getUniforms();e.uniformsList=aa.seqWithValue(t.seq,e.uniforms)}return e.uniformsList}function lt(e,t){let n=M.get(e);n.outputColorSpace=t.outputColorSpace,n.batching=t.batching,n.batchingColor=t.batchingColor,n.instancing=t.instancing,n.instancingColor=t.instancingColor,n.instancingMorph=t.instancingMorph,n.skinning=t.skinning,n.morphTargets=t.morphTargets,n.morphNormals=t.morphNormals,n.morphColors=t.morphColors,n.morphTargetsCount=t.morphTargetsCount,n.numClippingPlanes=t.numClippingPlanes,n.numIntersection=t.numClipIntersection,n.vertexAlphas=t.vertexAlphas,n.vertexTangents=t.vertexTangents,n.toneMapping=t.toneMapping}function ut(e,t,n,r,i){t.isScene!==!0&&(t=k),N.resetTextureUnits();let a=t.fog,o=r.isMeshStandardMaterial?t.environment:null,s=C===null?y.outputColorSpace:C.isXRRenderTarget===!0?C.texture.colorSpace:dt,c=(r.isMeshStandardMaterial?Te:we).get(r.envMap||o),l=r.vertexColors===!0&&!!n.attributes.color&&n.attributes.color.itemSize===4,u=!!n.attributes.tangent&&(!!r.normalMap||r.anisotropy>0),d=!!n.morphAttributes.position,f=!!n.morphAttributes.normal,p=!!n.morphAttributes.color,m=0;r.toneMapped&&(C===null||C.isXRRenderTarget===!0)&&(m=y.toneMapping);let h=n.morphAttributes.position||n.morphAttributes.normal||n.morphAttributes.color,_=h===void 0?0:h.length,v=M.get(r),b=g.state.lights;if(de===!0&&(fe===!0||e!==T)){let t=e===T&&r.id===w;Pe.setState(r,e,t)}let x=!1;r.version===v.__version?v.needsLights&&v.lightsStateVersion!==b.state.version?x=!0:v.outputColorSpace===s?i.isBatchedMesh&&v.batching===!1||!i.isBatchedMesh&&v.batching===!0||i.isBatchedMesh&&v.batchingColor===!0&&i.colorTexture===null||i.isBatchedMesh&&v.batchingColor===!1&&i.colorTexture!==null||i.isInstancedMesh&&v.instancing===!1||!i.isInstancedMesh&&v.instancing===!0||i.isSkinnedMesh&&v.skinning===!1||!i.isSkinnedMesh&&v.skinning===!0||i.isInstancedMesh&&v.instancingColor===!0&&i.instanceColor===null||i.isInstancedMesh&&v.instancingColor===!1&&i.instanceColor!==null||i.isInstancedMesh&&v.instancingMorph===!0&&i.morphTexture===null||i.isInstancedMesh&&v.instancingMorph===!1&&i.morphTexture!==null?x=!0:v.envMap===c?r.fog===!0&&v.fog!==a||v.numClippingPlanes!==void 0&&(v.numClippingPlanes!==Pe.numPlanes||v.numIntersection!==Pe.numIntersection)?x=!0:v.vertexAlphas===l&&v.vertexTangents===u&&v.morphTargets===d&&v.morphNormals===f&&v.morphColors===p&&v.toneMapping===m?v.morphTargetsCount!==_&&(x=!0):x=!0:x=!0:x=!0:(x=!0,v.__version=r.version);let S=v.currentProgram;x===!0&&(S=st(r,t,i));let E=!1,D=!1,ee=!1,te=S.getUniforms(),ne=v.uniforms;if(j.useProgram(S.program)&&(E=!0,D=!0,ee=!0),r.id!==w&&(w=r.id,D=!0),E||T!==e){j.buffers.depth.getReversed()&&e.reversedDepth!==!0&&(e._reversedDepth=!0,e.updateProjectionMatrix()),te.setValue(A,`projectionMatrix`,e.projectionMatrix),te.setValue(A,`viewMatrix`,e.matrixWorldInverse);let t=te.map.cameraPosition;t!==void 0&&t.setValue(A,me.setFromMatrixPosition(e.matrixWorld)),xe.logarithmicDepthBuffer&&te.setValue(A,`logDepthBufFC`,2/(Math.log(e.far+1)/Math.LN2)),(r.isMeshPhongMaterial||r.isMeshToonMaterial||r.isMeshLambertMaterial||r.isMeshBasicMaterial||r.isMeshStandardMaterial||r.isShaderMaterial)&&te.setValue(A,`isOrthographic`,e.isOrthographicCamera===!0),T!==e&&(T=e,D=!0,ee=!0)}if(i.isSkinnedMesh){te.setOptional(A,i,`bindMatrix`),te.setOptional(A,i,`bindMatrixInverse`);let e=i.skeleton;e&&(e.boneTexture===null&&e.computeBoneTexture(),te.setValue(A,`boneTexture`,e.boneTexture,N))}i.isBatchedMesh&&(te.setOptional(A,i,`batchingTexture`),te.setValue(A,`batchingTexture`,i._matricesTexture,N),te.setOptional(A,i,`batchingIdTexture`),te.setValue(A,`batchingIdTexture`,i._indirectTexture,N),te.setOptional(A,i,`batchingColorTexture`),i._colorsTexture!==null&&te.setValue(A,`batchingColorTexture`,i._colorsTexture,N));let re=n.morphAttributes;if((re.position!==void 0||re.normal!==void 0||re.color!==void 0)&&Le.update(i,n,S),(D||v.receiveShadow!==i.receiveShadow)&&(v.receiveShadow=i.receiveShadow,te.setValue(A,`receiveShadow`,i.receiveShadow)),r.isMeshGouraudMaterial&&r.envMap!==null&&(ne.envMap.value=c,ne.flipEnvMap.value=c.isCubeTexture&&c.isRenderTargetTexture===!1?-1:1),r.isMeshStandardMaterial&&r.envMap===null&&t.environment!==null&&(ne.envMapIntensity.value=t.environmentIntensity),D&&(te.setValue(A,`toneMappingExposure`,y.toneMappingExposure),v.needsLights&&I(ne,ee),a&&r.fog===!0&&je.refreshFogUniforms(ne,a),je.refreshMaterialUniforms(ne,r,ae,ie,g.state.transmissionRenderTarget[e.id]),aa.upload(A,ct(v),ne,N)),r.isShaderMaterial&&r.uniformsNeedUpdate===!0&&(aa.upload(A,ct(v),ne,N),r.uniformsNeedUpdate=!1),r.isSpriteMaterial&&te.setValue(A,`center`,i.center),te.setValue(A,`modelViewMatrix`,i.modelViewMatrix),te.setValue(A,`normalMatrix`,i.normalMatrix),te.setValue(A,`modelMatrix`,i.matrixWorld),r.isShaderMaterial||r.isRawShaderMaterial){let e=r.uniformsGroups;for(let t=0,n=e.length;t<n;t++){let n=e[t];He.update(n,S),He.bind(n,S)}}return S}function I(e,t){e.ambientLightColor.needsUpdate=t,e.lightProbe.needsUpdate=t,e.directionalLights.needsUpdate=t,e.directionalLightShadows.needsUpdate=t,e.pointLights.needsUpdate=t,e.pointLightShadows.needsUpdate=t,e.spotLights.needsUpdate=t,e.spotLightShadows.needsUpdate=t,e.rectAreaLights.needsUpdate=t,e.hemisphereLights.needsUpdate=t}function ft(e){return e.isMeshLambertMaterial||e.isMeshToonMaterial||e.isMeshPhongMaterial||e.isMeshStandardMaterial||e.isShadowMaterial||e.isShaderMaterial&&e.lights===!0}this.getActiveCubeFace=function(){return x},this.getActiveMipmapLevel=function(){return S},this.getRenderTarget=function(){return C},this.setRenderTargetTextures=function(e,t,n){let r=M.get(e);r.__autoAllocateDepthBuffer=e.resolveDepthBuffer===!1,r.__autoAllocateDepthBuffer===!1&&(r.__useRenderToTexture=!1),M.get(e.texture).__webglTexture=t,M.get(e.depthTexture).__webglTexture=r.__autoAllocateDepthBuffer?void 0:n,r.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(e,t){let n=M.get(e);n.__webglFramebuffer=t,n.__useDefaultFramebuffer=t===void 0};let pt=A.createFramebuffer();this.setRenderTarget=function(e,t=0,n=0){C=e,x=t,S=n;let r=!0,i=null,a=!1,o=!1;if(e){let s=M.get(e);if(s.__useDefaultFramebuffer!==void 0)j.bindFramebuffer(A.FRAMEBUFFER,null),r=!1;else if(s.__webglFramebuffer===void 0)N.setupRenderTarget(e);else if(s.__hasExternalTextures)N.rebindTextures(e,M.get(e.texture).__webglTexture,M.get(e.depthTexture).__webglTexture);else if(e.depthBuffer){let t=e.depthTexture;if(s.__boundDepthTexture!==t){if(t!==null&&M.has(t)&&(e.width!==t.image.width||e.height!==t.image.height))throw Error(`WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.`);N.setupDepthRenderbuffer(e)}}let c=e.texture;(c.isData3DTexture||c.isDataArrayTexture||c.isCompressedArrayTexture)&&(o=!0);let l=M.get(e).__webglFramebuffer;e.isWebGLCubeRenderTarget?(i=Array.isArray(l[t])?l[t][n]:l[t],a=!0):i=e.samples>0&&N.useMultisampledRTT(e)===!1?M.get(e).__webglMultisampledFramebuffer:Array.isArray(l)?l[n]:l,E.copy(e.viewport),D.copy(e.scissor),ee=e.scissorTest}else E.copy(ce).multiplyScalar(ae).floor(),D.copy(le).multiplyScalar(ae).floor(),ee=O;if(n!==0&&(i=pt),j.bindFramebuffer(A.FRAMEBUFFER,i)&&r&&j.drawBuffers(e,i),j.viewport(E),j.scissor(D),j.setScissorTest(ee),a){let r=M.get(e.texture);A.framebufferTexture2D(A.FRAMEBUFFER,A.COLOR_ATTACHMENT0,A.TEXTURE_CUBE_MAP_POSITIVE_X+t,r.__webglTexture,n)}else if(o){let r=t;for(let t=0;t<e.textures.length;t++){let i=M.get(e.textures[t]);A.framebufferTextureLayer(A.FRAMEBUFFER,A.COLOR_ATTACHMENT0+t,i.__webglTexture,n,r)}}else if(e!==null&&n!==0){let t=M.get(e.texture);A.framebufferTexture2D(A.FRAMEBUFFER,A.COLOR_ATTACHMENT0,A.TEXTURE_2D,t.__webglTexture,n)}w=-1},this.readRenderTargetPixels=function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);return}let c=M.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){j.bindFramebuffer(A.FRAMEBUFFER,c);try{let o=e.textures[s],c=o.format,l=o.type;if(!xe.textureFormatReadable(c)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.`);return}if(!xe.textureTypeReadable(l)){console.error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.`);return}t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i&&(e.textures.length>1&&A.readBuffer(A.COLOR_ATTACHMENT0+s),A.readPixels(t,n,r,i,Be.convert(c),Be.convert(l),a))}finally{let e=C===null?null:M.get(C).__webglFramebuffer;j.bindFramebuffer(A.FRAMEBUFFER,e)}}},this.readRenderTargetPixelsAsync=async function(e,t,n,r,i,a,o,s=0){if(!(e&&e.isWebGLRenderTarget))throw Error(`THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.`);let c=M.get(e).__webglFramebuffer;if(e.isWebGLCubeRenderTarget&&o!==void 0&&(c=c[o]),c){if(t>=0&&t<=e.width-r&&n>=0&&n<=e.height-i){j.bindFramebuffer(A.FRAMEBUFFER,c);let o=e.textures[s],l=o.format,u=o.type;if(!xe.textureFormatReadable(l))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.`);if(!xe.textureTypeReadable(u))throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.`);let d=A.createBuffer();A.bindBuffer(A.PIXEL_PACK_BUFFER,d),A.bufferData(A.PIXEL_PACK_BUFFER,a.byteLength,A.STREAM_READ),e.textures.length>1&&A.readBuffer(A.COLOR_ATTACHMENT0+s),A.readPixels(t,n,r,i,Be.convert(l),Be.convert(u),0);let f=C===null?null:M.get(C).__webglFramebuffer;j.bindFramebuffer(A.FRAMEBUFFER,f);let p=A.fenceSync(A.SYNC_GPU_COMMANDS_COMPLETE,0);return A.flush(),await ge(A,p,4),A.bindBuffer(A.PIXEL_PACK_BUFFER,d),A.getBufferSubData(A.PIXEL_PACK_BUFFER,0,a),A.deleteBuffer(d),A.deleteSync(p),a}throw Error(`THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.`)}},this.copyFramebufferToTexture=function(e,t=null,n=0){let r=2**-n,i=Math.floor(e.image.width*r),a=Math.floor(e.image.height*r),o=t===null?0:t.x,s=t===null?0:t.y;N.setTexture2D(e,0),A.copyTexSubImage2D(A.TEXTURE_2D,n,0,0,o,s,i,a),j.unbindTexture()};let ht=A.createFramebuffer(),gt=A.createFramebuffer();this.copyTextureToTexture=function(e,t,n=null,r=null,i=0,a=null){a===null&&(i===0?a=0:(Kt(`WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels.`),a=i,i=0));let o,s,c,l,u,d,f,p,m,h=e.isCompressedTexture?e.mipmaps[a]:e.image;if(n!==null)o=n.max.x-n.min.x,s=n.max.y-n.min.y,c=n.isBox3?n.max.z-n.min.z:1,l=n.min.x,u=n.min.y,d=n.isBox3?n.min.z:0;else{let t=2**-i;o=Math.floor(h.width*t),s=Math.floor(h.height*t),c=e.isDataArrayTexture?h.depth:e.isData3DTexture?Math.floor(h.depth*t):1,l=0,u=0,d=0}r===null?(f=0,p=0,m=0):(f=r.x,p=r.y,m=r.z);let g=Be.convert(t.format),_=Be.convert(t.type),v;t.isData3DTexture?(N.setTexture3D(t,0),v=A.TEXTURE_3D):t.isDataArrayTexture||t.isCompressedArrayTexture?(N.setTexture2DArray(t,0),v=A.TEXTURE_2D_ARRAY):(N.setTexture2D(t,0),v=A.TEXTURE_2D),A.pixelStorei(A.UNPACK_FLIP_Y_WEBGL,t.flipY),A.pixelStorei(A.UNPACK_PREMULTIPLY_ALPHA_WEBGL,t.premultiplyAlpha),A.pixelStorei(A.UNPACK_ALIGNMENT,t.unpackAlignment);let y=A.getParameter(A.UNPACK_ROW_LENGTH),b=A.getParameter(A.UNPACK_IMAGE_HEIGHT),x=A.getParameter(A.UNPACK_SKIP_PIXELS),S=A.getParameter(A.UNPACK_SKIP_ROWS),C=A.getParameter(A.UNPACK_SKIP_IMAGES);A.pixelStorei(A.UNPACK_ROW_LENGTH,h.width),A.pixelStorei(A.UNPACK_IMAGE_HEIGHT,h.height),A.pixelStorei(A.UNPACK_SKIP_PIXELS,l),A.pixelStorei(A.UNPACK_SKIP_ROWS,u),A.pixelStorei(A.UNPACK_SKIP_IMAGES,d);let w=e.isDataArrayTexture||e.isData3DTexture,T=t.isDataArrayTexture||t.isData3DTexture;if(e.isDepthTexture){let n=M.get(e),r=M.get(t),h=M.get(n.__renderTarget),g=M.get(r.__renderTarget);j.bindFramebuffer(A.READ_FRAMEBUFFER,h.__webglFramebuffer),j.bindFramebuffer(A.DRAW_FRAMEBUFFER,g.__webglFramebuffer);for(let n=0;n<c;n++)w&&(A.framebufferTextureLayer(A.READ_FRAMEBUFFER,A.COLOR_ATTACHMENT0,M.get(e).__webglTexture,i,d+n),A.framebufferTextureLayer(A.DRAW_FRAMEBUFFER,A.COLOR_ATTACHMENT0,M.get(t).__webglTexture,a,m+n)),A.blitFramebuffer(l,u,o,s,f,p,o,s,A.DEPTH_BUFFER_BIT,A.NEAREST);j.bindFramebuffer(A.READ_FRAMEBUFFER,null),j.bindFramebuffer(A.DRAW_FRAMEBUFFER,null)}else if(i!==0||e.isRenderTargetTexture||M.has(e)){let n=M.get(e),r=M.get(t);j.bindFramebuffer(A.READ_FRAMEBUFFER,ht),j.bindFramebuffer(A.DRAW_FRAMEBUFFER,gt);for(let e=0;e<c;e++)w?A.framebufferTextureLayer(A.READ_FRAMEBUFFER,A.COLOR_ATTACHMENT0,n.__webglTexture,i,d+e):A.framebufferTexture2D(A.READ_FRAMEBUFFER,A.COLOR_ATTACHMENT0,A.TEXTURE_2D,n.__webglTexture,i),T?A.framebufferTextureLayer(A.DRAW_FRAMEBUFFER,A.COLOR_ATTACHMENT0,r.__webglTexture,a,m+e):A.framebufferTexture2D(A.DRAW_FRAMEBUFFER,A.COLOR_ATTACHMENT0,A.TEXTURE_2D,r.__webglTexture,a),i===0?T?A.copyTexSubImage3D(v,a,f,p,m+e,l,u,o,s):A.copyTexSubImage2D(v,a,f,p,l,u,o,s):A.blitFramebuffer(l,u,o,s,f,p,o,s,A.COLOR_BUFFER_BIT,A.NEAREST);j.bindFramebuffer(A.READ_FRAMEBUFFER,null),j.bindFramebuffer(A.DRAW_FRAMEBUFFER,null)}else T?e.isDataTexture||e.isData3DTexture?A.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h.data):t.isCompressedArrayTexture?A.compressedTexSubImage3D(v,a,f,p,m,o,s,c,g,h.data):A.texSubImage3D(v,a,f,p,m,o,s,c,g,_,h):e.isDataTexture?A.texSubImage2D(A.TEXTURE_2D,a,f,p,o,s,g,_,h.data):e.isCompressedTexture?A.compressedTexSubImage2D(A.TEXTURE_2D,a,f,p,h.width,h.height,g,h.data):A.texSubImage2D(A.TEXTURE_2D,a,f,p,o,s,g,_,h);A.pixelStorei(A.UNPACK_ROW_LENGTH,y),A.pixelStorei(A.UNPACK_IMAGE_HEIGHT,b),A.pixelStorei(A.UNPACK_SKIP_PIXELS,x),A.pixelStorei(A.UNPACK_SKIP_ROWS,S),A.pixelStorei(A.UNPACK_SKIP_IMAGES,C),a===0&&t.generateMipmaps&&A.generateMipmap(v),j.unbindTexture()},this.initRenderTarget=function(e){M.get(e).__webglFramebuffer===void 0&&N.setupRenderTarget(e)},this.initTexture=function(e){e.isCubeTexture?N.setTextureCube(e,0):e.isData3DTexture?N.setTexture3D(e,0):e.isDataArrayTexture||e.isCompressedArrayTexture?N.setTexture2DArray(e,0):N.setTexture2D(e,0),j.unbindTexture()},this.resetState=function(){x=0,S=0,C=null,j.reset(),Ve.reset()},typeof __THREE_DEVTOOLS__<`u`&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent(`observe`,{detail:this}))}get coordinateSystem(){return vt}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=Oe._getDrawingBufferColorSpace(e),t.unpackColorSpace=Oe._getUnpackColorSpace()}},J=n(),go=`ravenswood:progress`;function _o(){let e=null;try{e=JSON.parse(localStorage.getItem(go)??`null`)}catch{}let t=(e,t)=>Array.isArray(e)?e.slice(-t):[];return{...v(e),seen:t(e?.seen,400).filter(e=>typeof e==`string`),coins:Math.max(0,Math.floor(Number(e?.coins)||0)),pets:t(e?.pets,40).filter(e=>E.some(t=>t.id===e)),items:t(e?.items,200).filter(e=>typeof e==`string`),owner:typeof e?.owner==`string`?e.owner:null,merged:t(e?.merged,20).filter(e=>typeof e==`string`),pending:t(e?.pending,300).filter(e=>e&&typeof e==`object`&&typeof e.k==`string`)}}var vo=_o(),yo=null,bo=e=>({stars:e.stars,records:e.records,ghosts:e.ghosts,nights:e.nights,perfect:e.perfect,feats:e.feats,tally:e.tally,coins:e.coins,pets:e.pets,items:e.items??[]});function xo(){if(!yo)return vo;let e={...vo,...bo(yo)};return vo.owner===null||vo.owner===yo.key?f(e,vo):e}var So=o(()=>vo),Co=()=>So(e=>e.coins),wo=()=>So(e=>e.pets),To=()=>So(e=>e.items),Eo=o(()=>({pay:[]}));function Do(e){vo=e;try{localStorage.setItem(go,JSON.stringify(e))}catch{}So.setState(xo(),!0)}var Oo=e=>re.filter(t=>t.unlocked(e)).map(e=>e.id);function ko(e,t){let n=Oo(So.getState());Do(y({...vo,seen:t?[...vo.seen,t].slice(-400):vo.seen,pending:[...vo.pending,e].slice(-300)},e));let r=So.getState();for(let e of re)e.unlocked(r)&&!n.includes(e.id)&&Wo?.(e.id);zo(400)}function Ao(e,t){vo.seen.includes(t)||ko({k:t,e:`count`,kind:e},t)}function jo(e){So.getState().perfect.includes(e)||ko({k:`perfect:${e}:${l()}`,e:`perfect`,job:e})}function Mo(e){ko({k:`top:${e}:${l()}`,e:`top`,job:e})}function No(e){!So.getState().feats.includes(e)&&te.some(t=>t.id===e)&&(ko({k:`feat:${e}:${l()}`,e:`feat`,id:e}),Ko?.(e))}var Po={fish:[10,`angler`],kinds:[8,`trainer`],wishes:[10,`lucky`],snacks:[20,`peckish`],votes:[10,`voter`],letters:[5,`postie`],games:[5,`regular`],talk:[600,`chatterbox`],gifts:[5,`generous`],cottages:[2,`nosy`],pigeons:[5,`pigeons`],buckets:[10,`bucket`],jobs:[12,`allrounder`],flowers:[15,`gnomed`],seats:[9,`sits`]};function Fo(e,t=1,n){if(n&&vo.seen.includes(n))return;ko({k:n??`~${l()}`,e:`tally`,kind:e,by:t},n);let[r,i]=Po[e];(So.getState().tally[e]??0)>=r&&No(i)}var Io=()=>!!g.getState().priv?.seatId,Lo=null,Ro=0;function zo(e){Lo||=setTimeout(()=>{Lo=null,Bo()},e)}function Bo(){Io()&&vo.pending.length&&(Ro=Date.now(),_.send({t:`progress`,events:vo.pending.slice(0,60)}))}var Vo=null,Ho=``;function Uo(e){let t=e?.profile,n=t?`${e?.seatId??``}${JSON.stringify(t)}`:``;if(n===Ho)return;if(Ho=n,!t||!e?.seatId){yo=t??null,So.setState(xo(),!0);return}yo=null,Vo??=setInterval(()=>vo.pending.length&&Date.now()-Ro>5e3&&Bo(),5e3);let r=`${t.book}:${t.key}`,i=vo.pending.filter(e=>!t.acks.includes(e.k));if((vo.owner===null||vo.owner===t.key)&&!vo.merged.includes(r)){let{stars:e,records:t,ghosts:n,nights:r,perfect:a,feats:o,tally:s}=vo;i=[...i,{k:`merge:${l()}`,e:`merge`,p:{stars:e,records:t,ghosts:n,nights:r,perfect:a,feats:o,tally:s}}]}let a=t.news.filter(e=>!vo.seen.includes(`news:${e.id}`)),o=a.length?[...vo.seen,...a.map(e=>`news:${e.id}`)].slice(-400):vo.seen,s=vo.merged.includes(r)?vo.merged:[...vo.merged,r].slice(-20);Do(i.reduce((e,t)=>y(e,t),{...vo,...bo(t),owner:t.key,merged:s,pending:i,seen:o}));for(let e of a)Yo(e.feat);Eo.setState({pay:t.pay}),vo.coins>=100&&No(`moneybags`),i.length&&zo(50)}g.subscribe((e,t)=>e.priv!==t.priv&&Uo(e.priv));var Wo=null;function Go(e){Wo=e}var Ko=null,qo=[];function Jo(e){Ko=e;for(let e of qo.splice(0))e()}function Yo(e){let t=te.find(t=>t.id===e)?.hat,n=()=>t?Wo?.(t):Ko?.(e);Ko&&Wo?n():qo.push(n)}var Xo=null,Zo=1;function Qo(){let e=So.getState();return e!==Xo&&(Xo=e,Zo=1+ee(e)*T),Zo}var $o=[`arrowup`,`arrowup`,`arrowdown`,`arrowdown`,`arrowleft`,`arrowright`,`arrowleft`,`arrowright`,`b`,`a`];function es(e){(0,K.useEffect)(()=>{if(!e)return;let t=0,n=e=>{let n=document.activeElement;if(n&&(n.tagName===`INPUT`||n.tagName===`TEXTAREA`||n.isContentEditable))return;let r=e.key.toLowerCase();t=r===$o[t]?t+1:+(r===$o[0]),t===$o.length&&(t=0,No(`konami`))};return window.addEventListener(`keydown`,n),()=>window.removeEventListener(`keydown`,n)},[e])}function ts(e){let t=e?.mode===`player`;es(t);let n=e?.seats.find(e=>e.isMe),i=e?.ended,a=e?.history,o=e?.nomination,s=e?.execution,c=e?.deaths,l=e?.day??0;(0,K.useEffect)(()=>{if(!t||!n)return;let u=e?.room??``,d=a??[];o?.nomineeId===n.id&&No(`nominated`),o?.nominatorId===n.id&&No(`nominator`),s?.seatId===n.id&&No(s.survives?`spared`:`gallows`);for(let e of d)e.voters.includes(n.id)&&Fo(`votes`,1,`vote:${u}:${e.id}`);n.dead&&!n.ghostVote&&No(`ghostvote`);let f=new Set(d.filter(e=>e.nominatorId===n.id).map(e=>e.nomineeId));o?.nominatorId===n.id&&f.add(o.nomineeId),f.size>=3&&No(`conspiracy`),(o?.nominatorId===n.id&&o.nomineeId===n.id||d.some(e=>e.nominatorId===n.id&&e.nomineeId===n.id))&&No(`pickme`),d.some(e=>e.nomineeId===n.id&&e.votes<e.majority)&&No(`offhook`);let p=new Set(d.filter(e=>e.nomineeId===n.id).map(e=>e.day));[...p].some(e=>p.has(e+1)&&p.has(e+2))&&No(`suspect`),d.some(e=>e.voters.length===1&&e.voters[0]===n.id)&&No(`lonevoice`);let m=new Map;for(let e of d)m.set(e.day,[...m.get(e.day)??[],e]);for(let[e,t]of m)(e<l||i)&&t.length>=3&&t.every(e=>e.voters.includes(n.id))&&No(`everyvote`);if(i){Fo(`games`,1,`game:${u}:${i.at}`);let t=e?.seats??[],a=$t.getState().notes;t.filter(e=>!e.isMe&&e.roleId&&a[e.id]?.guess===e.roleId).length>=3&&No(`detective`),n.dead||No(`survivor`);let o=!!(n.alignment&&n.alignment===i.winner);o&&No(i.winner===`good`?`goodwin`:`evilwin`),o&&n.dead&&No(`ghostwin`);let s=t.filter(e=>e.roleId&&n.alignment&&e.alignment===n.alignment);!n.dead&&s.length>=2&&s.filter(e=>!e.dead).length===1&&No(`lastone`);let l=e=>r(t.find(t=>t.id===e)?.roleId)?.team===`demon`;d.some(e=>e.nominatorId===n.id&&l(e.nomineeId))&&No(`gutfeel`),c?.[0]?.seatId===n.id&&No(`firstgo`),!n.dead&&d.filter(e=>e.nomineeId===n.id).length>=3&&No(`scratch`)}},[t,n,i,a,o,s,c,l,e?.room,e?.seats]);let u=$t(e=>e.notes),d=e?.seats;(0,K.useEffect)(()=>{if(!t||!d)return;let e=d.filter(e=>!e.isMe&&e.claimed);e.length>=5&&e.every(e=>u[e.id]?.claim&&u[e.id]?.guess)&&No(`nicelist`)},[t,d,u]);let f=e?.townHall;(0,K.useEffect)(()=>{t&&n&&f&&f.back[0]===n.id&&f.back.length>=2&&No(`earlybird`)},[t,n,f]);let p=e?.seats.find(e=>e.isMe),m=e?.room??``,h=e?.day??0,g=e?.phase,_=!!p?.star,v=!!p?.dead,y=p?.name??``,b=e?.town.records;(0,K.useEffect)(()=>{if(p&&e?.mode===`player`&&(_&&Ao(`stars`,`star:${m}:${h}:${p.id}`),v&&Ao(`ghosts`,`ghost:${m}:${p.id}`),g===`night`&&h>0&&Ao(`nights`,`night:${m}:${h}:${p.id}`),b&&y))for(let[e,t]of Object.entries(b))t.by===y&&Ao(`records`,`record:${m}:${e}:${t.at}`)},[p,e?.mode,_,v,g,h,m,b,y])}var ns=`./`;function rs(){return typeof window<`u`&&`Notification`in window}function is(){rs()&&Notification.permission==="default"&&Notification.requestPermission().catch(()=>{})}function as(e,t,n){if(!(document.visibilityState===`visible`&&document.hasFocus())&&rs()&&Notification.permission===`granted`)try{let r=new Notification(e,{body:t,tag:n,icon:`${ns}favicon.svg`});r.onclick=()=>{window.focus(),r.close()}}catch{}}var os=()=>new A(1,1,1);function ss(e,t,n,r,i,a,o,s,c,l){let u=[],d=[],f=n.clone(),p=r.clone().normalize(),m=o/s,h=new R(0,1,0);for(let n=0;n<s;n++){let r=i+(a-i)*n/s,o=i+(a-i)*(n+1)/s,g=new Se(o,r,m*1.1,10,1,!0);e.add(g,t(n),new z().compose(f.clone().addScaledVector(p,m/2),new P().setFromUnitVectors(h,p),new R(1,1,1))),g.dispose(),e.add(Y(8,6),t(n),{pos:f.toArray(),scale:r}),f=f.clone().addScaledVector(p,m),p=p.clone().applyAxisAngle(l,c/s).normalize(),u.push(f.clone()),d.push(p.clone())}return e.add(Y(8,6),t(s-1),{pos:f.toArray(),scale:a}),{at:u,dirs:d}}function cs(e,t,n,r=`#fffbe8`){let i=new ye({color:r,transparent:!0,depthWrite:!1,blending:2}),a=xs(1,.22),o=t.map((t,n)=>{let r=new Je(a,i);return r.position.set(...t),r.castShadow=!1,r.userData.phase=n*2.39,e.group.add(r),r});return e.materials.push(i),e=>{for(let t of o){let r=Math.max(0,Math.sin(e*1.7+t.userData.phase))**6;t.scale.setScalar(n*(.05+r)),t.rotation.z=e*.6+t.userData.phase,t.visible=r>.02}}}function ls(){let e=new I,t=`#f4c430`,n=[0,-.13,-.01],r=[.27,.22,.285];_c(e,n,r,0,1,t),_c(e,n,r,1,Math.PI/2,`#e2ad1e`);for(let i of[-.09,0,.09]){let a=Math.sqrt(1-(i/r[0])**2),o=new tt(1,i?.05:.08,5,24,Math.PI).rotateY(Math.PI/2);e.add(o,t,{pos:[i,n[1],n[2]],scale:[.2,r[1]*a+.004,r[2]*a+.004]}),o.dispose()}let i=Gs(ic(.262,.312,.016,44,(e,t,n)=>-.018*n),e=>{let t=Math.hypot(e.x,e.z),n=Ke.clamp((t-.262)/.05,0,1),r=1+.075*Math.max(0,e.z/t)**2*n/t;return e.set(e.x*r,e.y,e.z*r)});e.add(i,t,{pos:[0,n[1]+.004,n[2]],scale:[1,1,r[2]/r[0]]}),i.dispose();let{p:a,n:o}=Ms(r[0],r[1],r[2],.42,.42,n[1]);a.z+=n[2];let s=new P().setFromUnitVectors(new R(0,0,1),o);e.add(os(),`#2f9a4c`,new z().compose(a.clone().addScaledVector(o,.002),s,new R(.05,.05,.006)));for(let[t,n]of[[.034,.011],[.011,.034]])e.add(os(),`#f8f6f0`,new z().compose(a.clone().addScaledVector(o,.005),s,new R(t,n,.004)));return Q(e,{top:.1,sit:{kind:`snug`,rim:[-.13,.27,.285]}},Ht())}function us(){let e=new I,t=[`#7a4e2a`,`#8a5a32`,`#9a6a3c`,`#aa7a48`,`#ba8a56`,`#c89c66`],n=new tt(1,.06,5,20,Math.PI*.56).rotateZ(Math.PI*.22);e.add(n,`#8a2a26`,{pos:[0,-.22,.03],rot:[.55,0,0],scale:[.268,.205,.2]}),n.dispose();let r=new R(-1,0,0);for(let n of[-1,1]){let i=new R(n*.1,-.06,.13),a=ss(e,e=>t[e],i,new R(n*.6,1,.15),.036,.018,.34,6,.9,r);ss(e,e=>t[e+2],a.at[1],new R(n*.3,.65,.8),.022,.013,.12,3,-.5,r),ss(e,e=>t[e+3],a.at[3],new R(n*.65,.8,.55),.019,.011,.1,3,-.4,r),e.add(Y(10,5),t[0],{pos:[i.x,i.y-.004,i.z],scale:[.055,.02,.045]});let o=[i.x+n*.02,i.y+.012,i.z+.03];e.add(Y(8,6),`#d42a2e`,{pos:o,scale:[.016,.016,.012]});for(let t of[-1,1])e.add(Y(8,6),`#e03a3c`,{pos:[o[0]+t*.026,o[1]+.006,o[2]],rot:[0,0,t*.4],scale:[.026,.016,.009]});e.add(Y(10,8),`#f0c040`,{pos:[o[0],o[1]-.03,o[2]+.004],scale:.016}),e.add(Z(.3,4,10),`#c8962a`,{pos:[o[0],o[1]-.042,o[2]+.004],rot:[Math.PI/2,0,0],scale:[.016,.016,.02]})}return Q(e,{top:.32,sit:{kind:`perch`,rim:[-.06,.16],among:!0}})}function ds(){let e=new I,t=`#f6f2ea`,n=[0,-.13,-.01],r=[.27,.215,.285];_c(e,n,r,0,.55,t),_c(e,n,r,.55,Math.PI/2,`#d8342c`),e.add(Z(.18,6,36),t,{pos:[0,n[1]+.006,n[2]],rot:[Math.PI/2,0,0],scale:[r[0]+.004,r[2]+.004,.14]});for(let n of[-1,1]){let r=new R(n*.33,-.07,-.02);e.add(X(10),t,{pos:[n*.285,r.y,r.z],rot:[0,0,Math.PI/2],scale:[.018,.05,.018]}),e.add(Z(.18,5,22),t,{pos:[r.x,r.y,r.z],rot:[Math.PI/2,0,0],scale:[.058,.058,.08]}),e.add(X(18),`#e8b83a`,{pos:r.toArray(),scale:[.05,.12,.05]}),e.add(X(18),`#2a6a3c`,{pos:[r.x,r.y+.008,r.z],scale:[.0505,.05,.0505]}),e.add(X(18),`#d8dce2`,{pos:[r.x,r.y+.063,r.z],scale:[.044,.008,.044]}),e.add(X(18),`#d8dce2`,{pos:[r.x,r.y-.063,r.z],scale:[.044,.008,.044]});let i=new je([[r.x,r.y+.05,r.z],[r.x+n*.01,r.y+.12,r.z+.03],[r.x+n*.03,r.y+.06,r.z+.1],[n*.3,-.2,.15],[n*.25,-.27,.2]].map(([e,t,n])=>new R(e,t,n)));for(let n=0;n<12;n++){let r=new it(new je([0,.5,1].map(e=>i.getPoint(Math.min(1,(n+e*1.05)/12)))),4,.009,6,!1);e.add(r,n%2?`#e0383a`:t),r.dispose()}}return Q(e,{top:.09,sit:{kind:`snug`,rim:[-.13,.27,.285]}},Ht())}function fs(){let e=new I,t=`#7d93a8`,n=[0,-.14,-.02],r=[.28,.23,.3];_c(e,n,r,0,1.25,t),_c(e,n,r,1.25,Math.PI/2,`#e6edf2`),e.add(Y(18,10),t,{pos:[0,-.04,.13],scale:[.2,.13,.18]}),e.add(Z(.22,6,40),`#e87a8a`,{pos:[0,n[1]+.004,n[2]],rot:[Math.PI/2,0,0],scale:[r[0]+.004,r[2]+.004,.1]});for(let t=-7;t<=7;t++){let i=t*.21;e.add(new He(1,1,6),`#fbfaf6`,{pos:[Math.sin(i)*(r[0]-.004),n[1]-.012,n[2]+Math.cos(i)*(r[2]-.004)],rot:[Math.PI,0,0],scale:[.016,.03,.016]})}for(let t of[-1,1]){let{p:i,n:a}=Ms(r[0],r[1],r[2],t*1.05,.34,n[1]);i.z+=n[2],e.add(Y(12,9),`#1c1e24`,{pos:i.addScaledVector(a,.004).toArray(),scale:.03}),e.add(Y(8,6),`#ffffff`,{pos:i.clone().addScaledVector(a,.024).add(new R(0,.01,.006)).toArray(),scale:.008});for(let i=0;i<3;i++){let a=Ms(r[0],r[1],r[2],t*(1.55+i*.17),.22,n[1]);a.p.z+=n[2];let o=new P().setFromUnitVectors(new R(0,0,1),a.n);e.add(os(),`#56687a`,new z().compose(a.p.addScaledVector(a.n,.002),o,new R(.008,.07,.006)))}}let i=new M;i.moveTo(-.07,0),i.quadraticCurveTo(0,.06,.07,.16),i.quadraticCurveTo(.06,.06,.1,0),i.closePath();let a=new gt(i,{depth:.03,bevelEnabled:!0,bevelSize:.012,bevelThickness:.012,bevelSegments:2,curveSegments:8});a.translate(0,0,-.015),e.add(a,t,{pos:[0,n[1]+r[1]-.02,-.02],rot:[0,Math.PI/2,0]});for(let[n,r]of[[.55,.15],[2.3,.1]])e.add(Y(10,6),t,{pos:[0,-.07+Math.cos(n)*r*.5,-.31-Math.sin(n)*r*.5],rot:[-n,0,0],scale:[.016,r*.55,.04]});return e.add(Y(10,6),t,{pos:[0,-.07,-.3],scale:[.03,.035,.035]}),a.dispose(),Q(e,{top:.22,sit:{kind:`snug`,rim:[-.14,.28,.3]}})}function ps(){let e=new I,t=`#fff6ee`;e.add(X(36),`#e8c050`,{pos:[0,-.036,0],scale:[.175,.012,.175]}),e.add(X(36),`#f4a2bc`,{pos:[0,.02,0],scale:[.14,.1,.14]}),e.add(X(36),`#e88aa6`,{pos:[0,.02,0],scale:[.1405,.012,.1405]}),e.add(X(36),t,{pos:[0,.072,0],scale:[.138,.008,.138]});for(let n=0;n<16;n++){let r=n/16*Math.PI*2;e.add(Y(8,6),t,{pos:[Math.sin(r)*.128,.078,Math.cos(r)*.128],scale:[.022,.018,.022]});let i=.014+n*7%5*.006;e.add(Y(8,6),t,{pos:[Math.sin(r+.2)*.141,.068-i,Math.cos(r+.2)*.141],scale:[.013,i,.008],rot:[0,r+.2,0]})}for(let t=0;t<26;t++){let n=t*2.4,r=.03+t*37%9*.009;e.add(os(),[`#f04a4a`,`#4aa8f0`,`#f6d23a`,`#5ac85a`,`#b86af0`][t%5],{pos:[Math.sin(n)*r,.078,Math.cos(n)*r],rot:[0,n*1.7,0],scale:[.012,.004,.004]})}e.add(Y(12,9),`#c81830`,{pos:[0,.098,0],scale:.022}),e.add(X(5),`#4a7a2a`,{pos:[.006,.124,0],rot:[0,0,-.4],scale:[.003,.03,.003]});let n=[0,1,2].map(e=>{let t=e/3*Math.PI*2+.5;return[Math.sin(t)*.075,.076,Math.cos(t)*.075]});for(let[t,r,i]of n){for(let n=0;n<4;n++)e.add(X(10),n%2?`#fbf8f2`:`#5aa8e8`,{pos:[t,r+.009+n*.016,i],scale:[.011,.017,.011]});e.add(X(4),`#2a2220`,{pos:[t,r+.076,i],scale:[.003,.014,.003]})}let r=Q(e,{top:.22,sit:{kind:`brim`,rim:[-.036,.15]}}),i=new ye({color:`#ffc04a`}),a=new ye({color:`#ff9a40`,transparent:!0,opacity:.22,depthWrite:!1,blending:2}),o=new Te(1,8,6),s=n.map(([e,t,n])=>{let s=new Je(o,i);s.position.set(e,t+.098,n),s.scale.set(.011,.022,.011);let c=new Je(o,a);return c.position.copy(s.position),c.scale.setScalar(.03),s.castShadow=c.castShadow=!1,r.group.add(s,c),s});return r.materials.push(i,a),r.update=e=>{s.forEach((t,n)=>{let r=1+Math.sin(e*11+n*2)*.12+Math.sin(e*17.3+n)*.06;t.scale.set(.011/Math.sqrt(r),.022*r,.011/Math.sqrt(r)),t.rotation.z=Math.sin(e*3.7+n)*.12}),a.opacity=.18+Math.sin(e*13)*.05},r}function ms(){let e=new I,t=`#1e1b22`,n=`#e2b23a`,r=e=>{let t=[];for(let n=0;n<=24;n++){let r=Math.PI-n/24*Math.PI;t.push(new L(Math.cos(r)*.27*e,Math.sin(r)**1.25*.17*e))}return t},i=new M(r(1));i.quadraticCurveTo(0,.03,-.27,0);let a=new gt(i,{depth:.018,bevelEnabled:!0,bevelSize:.006,bevelThickness:.006,bevelSegments:2,curveSegments:12});a.translate(0,0,-.009);let o=new it(new je(r(1).map(e=>new R(e.x,e.y,0))),48,.009,5,!1);for(let r of[-1,1]){let i=new z().compose(new R(0,-.045,r*.075),new P().setFromEuler(new F(-r*.36,0,0)),new R(1,1,1));e.add(a,t,i),e.add(o,n,i.clone().multiply(new z().makeTranslation(0,0,r*.012)))}a.dispose(),o.dispose(),e.add(bs(24,8),t,{pos:[0,-.045,0],scale:[.2,.15,.1]});let s=new z().compose(new R(-.13,.06,.06),new P().setFromEuler(new F(-.36,0,0)),new R(1,1,1));for(let[t,n,r]of[[.05,`#d02a34`,.012],[.034,`#f8f6f0`,.016],[.018,`#2a4aa8`,.02]])e.add(X(20),n,{pos:[0,0,r],rot:[Math.PI/2,0,0],scale:[t,.006,t]},s);return e.add(os(),n,{pos:[0,.01,.025],scale:[.016,.1,.006]},s),e.add(Y(8,6),n,{pos:[0,-.04,.026],scale:.01},s),Q(e,{top:.15,sit:{kind:`brim`,rim:[-.045,.18,.1]}})}function hs(){let e=new I,t=[[.287,-.17],[.298,-.06],[.305,.08],[.293,.2],[.262,.3],[.2,.37],[.11,.405],[.001,.415]].map(([e,t])=>new L(e,t)),n=_t(new At(t,28,Math.PI+.1),.022,7);e.add(n,`#25212a`,{scale:[1,1,1.03]}),n.dispose();for(let t=0;t<40;t++){let n=t*2.39996,r=-.12+t*53%40*.0125,i=Ke.clamp((r+.17)/.585,0,1),a=.3*Math.sqrt(Math.max(.05,1-Math.max(0,(i-.4)/.6)**2));e.add(Y(6,4),t%3?`#242026`:`#1a171c`,{pos:[Math.sin(n)*a*.97,r,Math.cos(n)*a*.97*1.03],rot:[0,n,0],scale:[.045,.034,.016]})}e.add(X(10),`#d8a838`,{pos:[.296,-.06,-.03],scale:[.016,.03,.016]});for(let t=0;t<6;t++){let n=-.03+t*.05;e.add(Y(10,6),t%2?`#c41e2a`:`#e0303a`,{pos:[.31-t*.004,n,-.03-t*.004],rot:[.15,0,-.08],scale:[.03,.06,.026]})}for(let t=0;t<=18;t++){let n=-.95+t/18*1.9,r=Math.cos(n/.95*(Math.PI/2));e.add(Z(.35,4,8),`#e8b83a`,{pos:[Math.sin(n)*.31,-.1-r*.045,Math.cos(n)*.32],rot:[0,n+(t%2?Math.PI/2:0),0],scale:.011})}return Q(e,{top:.42,sit:{kind:`snug`,rim:[-.17,.287,.296]}})}function gs(){let e=new I,t=[`#e2b25a`,`#c8913a`,`#a8762c`],n=[0,-.14,-.01],r=[.275,.22,.285];_c(e,n,r,0,.6,t[0]),_c(e,n,r,.6,1.15,t[1]),_c(e,n,r,1.15,Math.PI/2,t[2]),e.add(Z(.2,6,36),t[0],{pos:[0,n[1]+.004,n[2]],rot:[Math.PI/2,0,0],scale:[r[0]+.006,r[2]+.006,.16]});for(let t=0;t<14;t++){let i=t/14*Math.PI*2;e.add(Y(6,4),`#f2d080`,{pos:[Math.sin(i)*(r[0]+.012),n[1]+.03,n[2]+Math.cos(i)*(r[2]+.012)],scale:.01})}let i=Gs(new Se(1,1,1,24,1,!1,Math.PI/2+.25,Math.PI-.5),e=>e.set(e.x*.335,e.y*.014-.05*Math.max(0,-e.z),e.z*.35));e.add(i,t[1],{pos:[0,n[1]+.006,n[2]]}),i.dispose();let a=new tt(1,.06,5,24,Math.PI);e.add(a,t[2],{pos:n,scale:[r[0]+.008,r[1]+.008,.25]}),a.dispose();let o=new R(0,1,0);for(let t=0;t<=26;t++){let i=.12+t/26*(Math.PI-.24),a=new R(Math.cos(i)*(r[0]+.01),n[1]+Math.sin(i)*(r[1]+.01),n[2]),s=new R(Math.cos(i)*.8,Math.sin(i),0).normalize(),c=.12+Math.sin(i)*.04,l=new z().compose(a.clone().addScaledVector(s,c/2),new P().setFromUnitVectors(o,s),new R(.035,c,.055-t%2*.01));e.add(os(),t%3?`#c41e2a`:`#a8141e`,l)}return Q(e,{top:.24,sit:{kind:`snug`,rim:[-.14,.275,.285]}},Ht())}function _s(){let e=new I,t=`#e2e6ee`,n=-.075,r=.222,i=(e,t,i=0)=>new R(Math.sin(e)*(r+i),n+t,Math.cos(e)*(r+i)),a=new tt(1,.035,5,40,3.3).rotateZ(Math.PI/2-1.65);e.add(a,t,{pos:[0,n,0],rot:[Math.PI/2,0,0],scale:[r,r,.18]}),a.dispose();for(let t of[-1,1])e.add(Y(8,6),`#fbf6ec`,{pos:i(t*1.65,0).toArray(),scale:.011});let o=e=>.035+.08*Math.cos(Math.min(1,Math.abs(e)/1)*(Math.PI/2))**2,s=[];for(let n=-5;n<=5;n++){let r=n*.19,a=o(r),c=new P().setFromEuler(new F(-.15,r,0,`YXZ`)),l=new R(0,1,0).applyQuaternion(c),u=i(r,0);e.add(new He(1,1,6),t,new z().compose(u.clone().addScaledVector(l,a/2),c,new R(.009,a,.006)));let d=u.clone().addScaledVector(l,a+(n?.008:.02));if(e.add(new Ae(1),n?`#f6fcff`:`#bfe4ff`,new z().compose(d,c,new R(n?.012:.026,n?.016:.034,n?.01:.016))),Math.abs(n)<=4&&n%2==0&&s.push([d.x*1.06,d.y+.004,d.z*1.06]),n<5){let n=Math.min(a,o(r+.19))*.5,s=i(r+.095,0).addScaledVector(l,n*.9);e.add(Z(.18,4,14),t,new z().compose(s,c,new R(.021,n,.021))),e.add(Y(8,6),`#fbf6ec`,{pos:i(r+.095,-.004,.004).toArray(),scale:.0085})}}let c=Q(e,{top:.04,sit:{kind:`ring`,rim:[-.14,r],tilt:.05}},Ht());return c.update=cs(c,s,.03),c}function vs(){let e=new I,t=`#2e1a34`,n=`#e2b23a`;e.add(X(36),t,{pos:[0,-.035,0],scale:[.22,.016,.22]}),e.add(Z(.35,6,36),t,{pos:[0,-.03,0],rot:[Math.PI/2,0,0],scale:[.22,.22,.045]}),e.add(X(32,1.06,1),t,{pos:[0,.125,0],scale:[.135,.32,.135]}),e.add(X(32),`#4a2c52`,{pos:[0,.287,0],scale:[.145,.006,.145]}),e.add(X(32),n,{pos:[0,.008,0],scale:[.14,.055,.14]}),e.add(X(32),`#1a1018`,{pos:[0,.03,0],scale:[.1405,.008,.1405]});let r=new R(.065,.018,.134),i=new P().setFromEuler(new F(.05,.42,.3));e.add(Z(.16,6,24),n,new z().compose(r,i,new R(.042,.042,.034))),e.add(X(24),`#cfe8f4`,new z().compose(r,i.clone().multiply(new P().setFromEuler(new F(Math.PI/2,0,0))),new R(.039,.003,.039)));let a=new je([[.09,-.004,.122],[.13,-.02,.105],[.16,-.022,.05],[.155,-.012,-.02]].map(([e,t,n])=>new R(e,t,n)));for(let t=0;t<=16;t++){let r=a.getPoint(t/16),i=new P().setFromUnitVectors(new R(1,0,0),a.getTangent(t/16));t%2&&i.multiply(new P().setFromEuler(new F(Math.PI/2,0,0))),e.add(Z(.3,4,8),n,new z().compose(r,i,new R(.007,.0045,.0045)))}return Q(e,{top:.3,sit:{kind:`brim`,rim:[-.035,.135]}},Ht())}function ys(){let e=new I,t=[`#f6d04a`,`#e8b83a`,`#d49a24`],n=.175;e.add(bs(18,7),`#6e1430`,{pos:[0,-.03,0],scale:[n*.96,.19,n*.96]});let r=new At([[.16299999999999998,-.045],[.183,-.045],[.191,0],[.187,.05],[.17099999999999999,.05],[.16299999999999998,-.045]].map(([e,t])=>new L(e,t)),36);e.add(r,t[1]),r.dispose(),e.add(Z(.25,5,36),t[0],{pos:[0,.052,0],rot:[Math.PI/2,0,0],scale:[.181,.181,.05]}),e.add(Z(.3,8,36),`#fbf8f2`,{pos:[0,-.048,0],rot:[Math.PI/2,0,0],scale:[.191,.191,.1]});for(let t=0;t<12;t++){let n=t/12*Math.PI*2+.13;e.add(Y(6,4),`#1c1a1e`,{pos:[Math.sin(n)*.215,-.046,Math.cos(n)*.215],rot:[0,n,0],scale:[.008,.012,.005]})}let i=[`#d8203a`,`#2a5ae0`,`#20b060`,`#d8203a`,`#8a3ae0`,`#20b060`,`#d8203a`,`#2a5ae0`];for(let n=0;n<8;n++){let r=n/8*Math.PI*2,a=Math.sin(r),o=Math.cos(r),s=n%2==0;e.add(new He(1,1,10),t[0],{pos:[a*.179,s?.11:.085,o*.179],scale:[.04,s?.12:.07,.03],rot:[0,r,0]}),e.add(Y(8,6),`#fbf8f2`,{pos:[a*.179,s?.176:.126,o*.179],scale:.019}),e.add(Y(10,8),i[n],{pos:[a*.19299999999999998,.004,o*.19299999999999998],rot:[0,r,0],scale:[.026,.03,.014]}),e.add(Z(.25,4,16),t[2],{pos:[a*.192,.004,o*.192],rot:[0,r,0],scale:[.03,.034,.03]})}let a=.24;for(let n of[0,Math.PI/2]){let r=new tt(1,.1,6,28,Math.PI);e.add(r,t[1],{pos:[0,.05,0],rot:[0,n,0],scale:[.17099999999999999,a,.24]}),r.dispose();for(let t=1;t<8;t++){let r=t/8*Math.PI,i=new R(Math.cos(r)*.17099999999999999,.05+Math.sin(r)*a+.012,0).applyAxisAngle(new R(0,1,0),n);e.add(Y(6,4),`#fbf8f2`,{pos:i.toArray(),scale:.009})}}e.add(Y(16,12),t[0],{pos:[0,.31999999999999995,0],scale:.035}),e.add(Z(.18,4,20),t[2],{pos:[0,.31999999999999995,0],rot:[Math.PI/2,0,0],scale:.036});let o=Q(e,{top:.42,sit:{kind:`brim`,rim:[-.045,.191]}},Ht()),s=new Tt({color:`#eaf8ff`,emissive:`#bfe8ff`,emissiveIntensity:.6,roughness:.15,metalness:.1,flatShading:!0}),c=new Je(new Ae(1,0),s);c.scale.set(.034,.05,.034),c.position.set(0,.39999999999999997,0),c.castShadow=!1,o.group.add(c),o.materials.push(s);let l=cs(o,[[0,.42,.03],[.205,.03,.02],[-.185,.12,.05],[.06,.16,n],[-.08,-.01,.215],[.1,.2,-.06],[-.175,0,-.08]],.045);return o.update=e=>{c.rotation.y=e*.7,s.emissiveIntensity=.5+Math.max(0,Math.sin(e*1.3))**8*.9,l(e)},o}var Y=(e,t)=>new Te(1,e,t),bs=(e,t)=>new Te(1,e,t,0,Math.PI*2,0,Math.PI/2),X=(e,t=1,n=1)=>new Se(t,n,1,e),Z=(e,t,n)=>new tt(1,e,t,n);function xs(e=1,t=.45){let n=new M;for(let r=0;r<10;r++){let i=r%2==0?e:e*t,a=r/10*Math.PI*2+Math.PI/2;r===0?n.moveTo(Math.cos(a)*i,Math.sin(a)*i):n.lineTo(Math.cos(a)*i,Math.sin(a)*i)}n.closePath();let r=new gt(n,{depth:.25*e,bevelEnabled:!1});return r.translate(0,0,-.125*e),r}function Ss(e,t,n,r,i,a,o,s=[-1,0,0],c=[0,1,0]){let l=new R(...n),u=new R(...c).normalize(),d=new R(...s).normalize(),f=i/a;for(let n=0;n<a;n++){let i=r*(1-n/a),s=r*(1-(n+1)/a),c=new P().setFromUnitVectors(new R(0,1,0),u),p=l.clone().addScaledVector(u,f/2),m=new Se(Math.max(s,.004),i,f*1.08,20,1,n<a-1);e.add(m,t(n),new z().compose(p,c,new R(1,1,1))),m.dispose(),l=l.addScaledVector(u,f),u=u.applyAxisAngle(d,o/a).normalize()}return[l.x,l.y,l.z]}function Cs(e,t,n,r,i,a,o,s=28){let c=[],l=new R(...e),u=new R(...o).normalize(),d=new R(...a).normalize(),f=new R(0,1,0),p=e=>(e+.5)**1.6,m=0;for(let e=0;e<r;e++)m+=p(e);for(let e=0;e<=r;e++)c.push({at:l.clone(),q:new P().setFromUnitVectors(f,u)}),l=l.clone().addScaledVector(u,n/r),u=u.clone().applyAxisAngle(d,i*p(e)/m).normalize();let h=Gs(new Se(0,1,1,s,r,!0),e=>{let n=Math.round((e.y+.5)*r),i=c[n];return e.set(e.x*t,0,e.z*t).applyQuaternion(i.q).add(i.at)}),g=c[r].at;return{geo:h,tip:[g.x,g.y,g.z]}}function Q(e,t,n=ot()){let r=new Mt,i=e.mesh(n,{cast:!0,receive:!1});return r.add(i),{group:r,solid:[{mesh:i,material:n}],materials:[n],...t,top:t.top,sit:t.sit}}function ws(){let e=new I,t=`#f6ead8`;e.add(bs(22,9),`#d8504a`,{pos:[0,-.13,-.01],scale:[.3,.2,.3]}),e.add(X(28),`#b83c38`,{pos:[0,-.13,-.01],scale:[.305,.085,.305]});for(let t=0;t<18;t++){let n=t/18*Math.PI*2;e.add(X(5),`#c8443f`,{pos:[Math.sin(n)*.307,-.13,-.01+Math.cos(n)*.307],scale:[.012,.08,.012]})}e.add(Z(.12,5,28),t,{pos:[0,-.04,-.01],rot:[Math.PI/2,0,0],scale:[.278,.278,.12]}),e.add(Y(12,9),t,{pos:[0,.095,-.01],scale:.075});for(let n=0;n<5;n++){let r=n/5*Math.PI*2;e.add(Y(7,5),t,{pos:[Math.cos(r)*.04,.1+n%2*.02,-.01+Math.sin(r)*.04],scale:.045})}return Q(e,{top:.17,sit:{kind:`snug`,rim:[-.17,.3]}})}function Ts(){let e=new I,t=[`#f39ab5`,`#fbf8f2`,`#f6d55c`,`#c7a3e8`,`#f39ab5`,`#fbf8f2`],n=.215,r=-.07;e.add(Z(.1,6,28),`#5f9e47`,{pos:[0,r,0],rot:[Math.PI/2+.12,0,0],scale:[n,n,.2]});let i=.12;for(let a=0;a<6;a++){let o=a/6*Math.PI*2+.3,s=Math.sin(o)*n,c=Math.cos(o)*n,l=r+Math.cos(o)*Math.sin(i)*n*.9+.02,u=new R(Math.sin(o),.6,Math.cos(o)).normalize(),d=new P().setFromUnitVectors(new R(0,0,1),u),f=new R(1,0,0).applyQuaternion(d),p=new R(0,1,0).applyQuaternion(d);for(let n=0;n<5;n++){let r=n/5*Math.PI*2,i=new R(s,l,c).addScaledVector(f,Math.cos(r)*.03).addScaledVector(p,Math.sin(r)*.03);e.add(Y(6,4),t[a],new z().compose(i,d,new R(.026,.026,.01)))}e.add(Y(6,4),`#f2b234`,new z().compose(new R(s,l,c).addScaledVector(u,.008),d,new R(.016,.016,.012)));let m=o+Math.PI/6,h=new P().setFromEuler(new F(.3,m,.6));e.add(Y(6,4),`#78b85a`,new z().compose(new R(Math.sin(m)*.225,r+Math.cos(m)*Math.sin(i)*n*.9+.005,Math.cos(m)*.225),h,new R(.038,.012,.02)))}return Q(e,{top:.04,sit:{kind:`ring`,rim:[-.07,.215]}})}function Es(){let e=new I,t=[`#f06a9a`,`#5ec4c8`,`#f6d55c`,`#f06a9a`,`#5ec4c8`,`#f6d55c`],n=.32,r=.12,i=t.length;for(let a=0;a<i;a++){let o=r*(1-a/i),s=r*(1-(a+1)/i);e.add(new Se(Math.max(s,.004),o,n/i,22,1,a<i-1),t[a],{pos:[0,-.03+n/i*(a+.5),0]})}e.add(Z(.18,6,28),`#fbf8f2`,{pos:[0,-.03,0],rot:[Math.PI/2,0,0],scale:[r,r,.16]}),e.add(Y(12,9),`#fbf8f2`,{pos:[0,.31000000000000005,0],scale:.04});for(let t=0;t<5;t++)e.add(Y(8,6),`#fbf8f2`,{pos:[Math.sin(t*1.9)*.025,.31000000000000005+Math.cos(t*1.3)*.02,Math.cos(t*1.9)*.025],scale:.025});for(let t of[-1,1])e.add(X(6),`#e8e0d0`,{pos:[t*.13,-.11,.02],rot:[0,0,t*.12],scale:[.004,.16,.004]});return Q(e,{top:.35,sit:{kind:`perch`,rim:[-.03,.12]}})}function Ds(){let e=new I,t=`#3a4ab0`;e.add(X(32),t,{pos:[0,-.04,0],scale:[.27,.018,.27]}),e.add(Z(.4,6,36),`#2e3b94`,{pos:[0,-.04,0],rot:[Math.PI/2,0,0],scale:[.27,.27,.03]}),e.add(X(28),`#e8c26a`,{pos:[0,-.005,0],scale:[.165,.045,.165]}),Ss(e,e=>e%2?t:`#3646a6`,[0,-.03,0],.16,.46,7,1.1,[1,0,0]);let n=xs(1);for(let[t,r,i,a]of[[.06,.08,.12,.03],[-.08,.15,.08,.022],[.03,.22,.07,.018],[-.1,.04,.08,.02]]){let o=new P().setFromUnitVectors(new R(0,0,1),new R(t,.2,i).normalize());e.add(n,`#f6d55c`,new z().compose(new R(t,r,i),o,new R(a,a,a)))}return n.dispose(),e.add(Z(.28,6,18),`#f6d55c`,{pos:[.11,.03,.06],rot:[0,1,.6],scale:[.03,.03,.03]}),Q(e,{top:.4,sit:{kind:`brim`,rim:[-.03,.165]}})}function Os(){let e=new I,t=`#26222a`;e.add(X(36),t,{pos:[0,-.035,0],scale:[.21,.016,.21]}),e.add(Z(.35,6,36),t,{pos:[0,-.03,0],rot:[Math.PI/2,0,0],scale:[.21,.21,.04]}),e.add(X(32,1.08,1),t,{pos:[0,.085,0],scale:[.13,.24,.13]}),e.add(X(32),`#3a3540`,{pos:[0,.207,0],scale:[.14,.006,.14]}),e.add(X(32),`#a8303a`,{pos:[0,-.002,0],scale:[.134,.05,.134]});let n=[.1,0,.09];for(let t of[-1,1])e.add(Y(10,7),`#a8303a`,{pos:[n[0]+t*.022,n[1],n[2]],rot:[0,.8,t*.4],scale:[.026,.017,.012]});return e.add(Y(8,6),`#8a2430`,{pos:n,scale:.012}),Q(e,{top:.22,sit:{kind:`brim`,rim:[-.035,.13]}})}function ks(){let e=new I,t=`#e8b83a`,n=.17;e.add(bs(16,6),`#8a2030`,{pos:[0,-.04,0],scale:[n*.95,.09,n*.95]});let r=[new L(.158,-.05),new L(.17600000000000002,-.05),new L(.18200000000000002,.025),new L(.164,.025),new L(.158,-.05)],i=new At(r,30);e.add(i,t),i.dispose(),e.add(Z(.3,4,30),`#f2c94a`,{pos:[0,-.05,0],rot:[Math.PI/2,0,0],scale:[.17400000000000002,.17400000000000002,.04]});let a=[`#d8303c`,`#3a6ad8`,`#3aa860`];for(let n=0;n<6;n++){let r=n/6*Math.PI*2,i=Math.sin(r)*.17200000000000001,o=Math.cos(r)*.17200000000000001;e.add(new He(1,1,12),t,{pos:[i,.06,o],scale:[.034,.075,.03]}),e.add(Y(7,5),`#fbf8f2`,{pos:[Math.sin(r)*.17400000000000002,.105,Math.cos(r)*.17400000000000002],scale:.016});let s=r+Math.PI/6;e.add(Y(8,6),a[n%3],{pos:[Math.sin(s)*.18200000000000002,-.015,Math.cos(s)*.18200000000000002],scale:[.02,.022,.012],rot:[0,s,0]})}return Q(e,{top:.13,sit:{kind:`perch`,rim:[-.05,.17]}})}function As(){let e=new I,t=`#2e2438`,n=new At([new L(.001,-.03),new L(.18,-.03),new L(.3,-.05),new L(.34,-.07),new L(.345,-.06),new L(.3,-.035),new L(.18,-.015),new L(.001,-.015)],40);e.add(n,t),n.dispose(),Ss(e,e=>e%2?t:`#342a40`,[0,-.02,0],.15,.42,7,1.4,[0,0,1]),e.add(X(30),`#7a4ab0`,{pos:[0,.02,0],scale:[.143,.05,.143]});for(let[t,n,r,i]of[[0,.042,.06,.01],[0,-.002,.06,.01],[-.026,.02,.01,.054],[.026,.02,.01,.054]])e.add(new A(1,1,1),`#e8c26a`,{pos:[t,n,.145],scale:[r,i,.012]});return Q(e,{top:.38,sit:{kind:`brim`,rim:[-.02,.15]}})}function js(){let e=new Mt,t=new Tt({color:`#ffe9a0`,emissive:`#ffd85a`,emissiveIntensity:1.4,roughness:.3,metalness:.2}),n=new ye({color:`#fff2b8`,transparent:!0,opacity:.28,depthWrite:!1,blending:2}),r=new Je(new tt(.17,.022,10,40),t),i=new Je(new tt(.17,.055,8,40),n);for(let e of[r,i])e.rotation.x=Math.PI/2;r.castShadow=!1,i.castShadow=!1;let a=new Mt;return a.position.y=.13,a.rotation.x=-.15,a.add(r,i),e.add(a),{group:e,solid:[],materials:[t,n],top:.19,sit:{kind:`float`,rim:[0,.17]},update:e=>{a.position.y=.13+Math.sin(e*2.1)*.018,a.rotation.z=Math.sin(e*1.3)*.06,n.opacity=.24+Math.sin(e*3.2)*.06}}}function Ms(e,t,n,r,i,a){let o=new R(Math.sin(r)*Math.cos(i)*e,a+Math.sin(i)*t,Math.cos(r)*Math.cos(i)*n);return{p:o,n:new R(o.x/(e*e),(o.y-a)/(t*t),o.z/(n*n)).normalize()}}function Ns(){let e=new I,t=`#c8302c`,n=`#221c20`;e.add(bs(24,10),t,{pos:[0,-.13,-.01],scale:[.3,.2,.3]});for(let t=0;t<8;t++){let r=new Te(1,3,10,t/8*Math.PI*2,Math.PI/8,0,Math.PI/2);e.add(r,n,{pos:[0,-.13,-.01],scale:[.303,.203,.303]}),r.dispose()}for(let[t,r]of[[-.075,.287],[-.01,.235]])e.add(Z(.09,5,32),n,{pos:[0,t,-.01],rot:[Math.PI/2,0,0],scale:[r,r,.12]});e.add(X(30),n,{pos:[0,-.13,-.01],scale:[.307,.085,.307]});for(let t=0;t<20;t++){let n=t/20*Math.PI*2;e.add(X(5),`#3a3036`,{pos:[Math.sin(n)*.309,-.13,-.01+Math.cos(n)*.309],scale:[.011,.08,.011]})}e.add(Y(12,9),t,{pos:[0,.095,-.01],scale:.07});for(let r=0;r<6;r++){let i=r/6*Math.PI*2;e.add(Y(7,5),r%2?t:n,{pos:[Math.cos(i)*.042,.1+r%2*.02,-.01+Math.sin(i)*.042],scale:.042})}return Q(e,{top:.17,sit:{kind:`snug`,rim:[-.17,.3]}})}function Ps(){let e=new I,t=`#f2c230`,n=`#d6a41c`;e.add(bs(24,10),t,{pos:[0,-.07,-.005],scale:[.2,.17,.21]});for(let t=0;t<4;t++)e.add(Z(.05,4,24),n,{pos:[0,-.07,-.005],rot:[0,t*Math.PI/4,0],scale:[.2,.171,.05]});e.add(X(26),n,{pos:[0,-.06,-.005],scale:[.203,.02,.213]});let r=new At([new L(.001,-.06),new L(.19,-.06),new L(.28,-.1),new L(.32,-.13),new L(.322,-.115),new L(.28,-.085),new L(.19,-.045),new L(.001,-.045)],40);e.add(r,t,{pos:[0,0,-.03],scale:[1,1,1.18]}),r.dispose(),e.add(Z(.25,5,40),n,{pos:[0,-.125,-.03],rot:[Math.PI/2,0,0],scale:[.318,.318*1.18,.03]});for(let t of[-1,1])e.add(X(6),`#8a6a1a`,{pos:[t*.19,-.15,.02],rot:[0,0,t*.1],scale:[.006,.18,.006]});return Q(e,{top:.11,sit:{kind:`brim`,rim:[-.07,.2,.21],tilt:.35}})}function Fs(){let e=new I,t=`#fbf8f2`,n=`#e2b23a`,r=new M;r.moveTo(-.16,0),r.lineTo(-.16,.14),r.quadraticCurveTo(-.15,.3,0,.44),r.quadraticCurveTo(.15,.3,.16,.14),r.lineTo(.16,0),r.closePath();let i=new gt(r,{depth:.22,bevelEnabled:!0,bevelThickness:.015,bevelSize:.012,bevelSegments:2,curveSegments:14});i.translate(0,0,-.11),e.add(i,t,{pos:[0,-.09,0]}),i.dispose(),e.add(new A(1,1,1),n,{pos:[0,-.06,0],scale:[.35,.06,.255]}),e.add(new A(1,1,1),n,{pos:[0,.1,.122],scale:[.05,.3,.012]}),e.add(new A(1,1,1),n,{pos:[0,.1,-.122],scale:[.05,.3,.012]}),e.add(new A(1,1,1),`#c8302c`,{pos:[0,.2,.13],scale:[.016,.09,.006]}),e.add(new A(1,1,1),`#c8302c`,{pos:[0,.215,.13],scale:[.06,.016,.006]});for(let r of[-1,1])e.add(new A(1,1,1),t,{pos:[r*.07,-.2,-.13],rot:[.1,0,0],scale:[.05,.22,.01]}),e.add(new A(1,1,1),n,{pos:[r*.07,-.31,-.141],rot:[.1,0,0],scale:[.056,.025,.012]});return Q(e,{top:.36,sit:{kind:`brim`,rim:[-.06,.175,.13]}})}function Is(){let e=new I,t=`#fdfbf6`;e.add(X(30),t,{pos:[0,0,0],scale:[.17,.13,.17]});for(let t=0;t<16;t++){let n=t/16*Math.PI*2;e.add(X(5),`#e9e4da`,{pos:[Math.sin(n)*.17,0,Math.cos(n)*.17],scale:[.008,.125,.008]})}e.add(Y(20,12),t,{pos:[0,.14,0],scale:[.22,.12,.22]});for(let n=0;n<7;n++){let r=n/7*Math.PI*2;e.add(Y(12,8),n%2?t:`#f6f2ea`,{pos:[Math.sin(r)*.13,.16+n%3*.01,Math.cos(r)*.13],scale:[.11,.09,.11]})}return Q(e,{top:.25,sit:{kind:`brim`,rim:[-.065,.17]}})}function Ls(){let e=new I,t=`#2a2428`;e.add(bs(24,10),t,{pos:[0,-.04,0],scale:[.155,.16,.165]}),e.add(X(36),t,{pos:[0,-.04,0],scale:[.21,.014,.22]}),e.add(Z(.3,6,36),t,{pos:[0,-.035,0],rot:[Math.PI/2,0,0],scale:[.21,.22,.05]}),e.add(X(30),`#4a3a32`,{pos:[0,-.012,0],scale:[.158,.035,.168]});for(let t of[-1,1])e.add(Y(10,7),`#4a3a32`,{pos:[-.15+t*0,-.01,.04+t*.018],rot:[.4,0,0],scale:[.012,.014,.022]});return Q(e,{top:.13,sit:{kind:`brim`,rim:[-.04,.155,.165]}})}function Rs(){let e=new I,t=`#e8c97a`,n=`#cfa95a`,r=new At([new L(.001,-.05),new L(.17,-.05),new L(.3,-.07),new L(.38,-.1),new L(.385,-.085),new L(.3,-.055),new L(.17,-.035),new L(.001,-.035)],44);e.add(r,t),r.dispose();for(let t of[.22,.28,.34])e.add(Z(.08,4,40),n,{pos:[0,-.052-(t-.2)*.25,0],rot:[Math.PI/2,0,0],scale:[t,t,.1]});e.add(bs(22,9),t,{pos:[0,-.04,0],scale:[.165,.13,.165]});for(let t=0;t<3;t++)e.add(Z(.06,4,28),n,{pos:[0,0+t*.03,0],rot:[Math.PI/2,0,0],scale:[.16-t*.025,.16-t*.025,.1]});e.add(X(28),`#f08aa8`,{pos:[0,-.02,0],scale:[.168,.035,.168]});let i=.12;for(let t=0;t<10;t++){let n=t/10*Math.PI*2;e.add(Y(6,4),`#f6c42c`,{pos:[i+Math.cos(n)*.035,0+Math.sin(n)*.035,.11],rot:[0,.8,n],scale:[.026,.011,.008]})}return e.add(Y(8,6),`#6a4224`,{pos:[i,0,.115],scale:[.022,.022,.012]}),Q(e,{top:.1,sit:{kind:`brim`,rim:[-.04,.165]}})}function zs(){let e=new I,t=`#4a78b8`,n=[.3,.2,.31],r=new z().compose(new R(0,-.14,-.01),new P().setFromEuler(new F(-.12,0,0)),new R(1,1,1)),i=(e,t=new P,n=new R(1,1,1))=>r.clone().multiply(new z().compose(e,t,n)),a=(e,t,n)=>new P().setFromEuler(new F(e,t,n));e.add(bs(24,10),t,i(new R,void 0,new R(...n)));for(let t=0;t<30;t++){let r=Math.asin(Math.sin(.12)+(t+.5)/30*(Math.sin(1.35)-Math.sin(.12))),{p:a,n:o}=Ms(n[0]+.002,n[1]+.002,n[2]+.002,t*2.39996,r,0);e.add(Y(7,5),`#fbf6ee`,i(a,new P().setFromUnitVectors(new R(0,0,1),o),new R(.019,.019,.005)))}e.add(new He(1,1,3),t,i(new R(0,-.06,-.29),a(Math.PI+.3,Math.PI/6,0),new R(.12,.13,.03)));let{p:o}=Ms(n[0],n[1],n[2],Math.PI,.3,0);e.add(Y(10,8),t,i(o.clone().add(new R(0,0,-.012)),void 0,new R(.042,.036,.034)));for(let n of[-1,1])e.add(Y(10,8),t,i(o.clone().add(new R(n*.045,-.045,-.02)),a(.25,0,n*.55),new R(.026,.07,.02)));return Q(e,{top:.08,sit:{kind:`snug`,rim:[-.14,.3,.31]}})}function Bs(){let e=new I,t=`#3f8a46`;e.add(Y(22,12),t,{pos:[0,-.03,.01],scale:[.17,.11,.24]}),e.add(new He(1,1,18),t,{pos:[0,-.01,.25],rot:[Math.PI/2,0,0],scale:[.07,.12,.05]}),e.add(Y(18,8),`#2f6e36`,{pos:[0,-.06,-.16],rot:[.6,0,0],scale:[.17,.05,.12]}),e.add(Z(.12,5,30),`#2f6e36`,{pos:[0,-.07,.01],rot:[Math.PI/2,0,0],scale:[.172,.242,.12]});let n=new P().setFromEuler(new F(-.9,0,-.35));return e.add(Y(12,6),`#d8343a`,new z().compose(new R(.15,.07,-.06),n,new R(.024,.2,.006))),e.add(X(5),`#f6efe0`,new z().compose(new R(.15,.07,-.06),n,new R(.004,.36,.004))),Q(e,{top:.2,sit:{kind:`brim`,rim:[-.03,.17,.24]}})}function Vs(){let e=new I,t=`#f8f6f0`;e.add(X(32),`#1f2d4f`,{pos:[0,-.02,0],scale:[.17,.07,.17]}),e.add(X(36,1,.82),t,{pos:[0,.035,-.01],scale:[.22,.045,.23]}),e.add(X(36),t,{pos:[0,.06,-.01],scale:[.222,.012,.232]}),e.add(Z(.2,5,32),`#e2b23a`,{pos:[0,.008,0],rot:[Math.PI/2,0,0],scale:[.172,.172,.06]});let n=new Se(1,1,1,24,1,!1,-Math.PI/2,Math.PI);e.add(n,`#14141a`,{pos:[0,-.055,.1],rot:[.35,0,0],scale:[.16,.012,.13]}),n.dispose();let r=.172;return e.add(Z(.25,4,14),`#e2b23a`,{pos:[0,0,r],scale:[.018,.018,.02]}),e.add(new A(1,1,1),`#e2b23a`,{pos:[0,-.025,r],scale:[.007,.04,.006]}),e.add(new A(1,1,1),`#e2b23a`,{pos:[0,-.045,r],scale:[.034,.007,.006]}),Q(e,{top:.08,sit:{kind:`brim`,rim:[-.055,.17]}})}function Hs(){let e=new I,t=`#2f9a4a`;e.add(X(36),t,{pos:[0,-.035,0],scale:[.23,.016,.23]}),e.add(Z(.3,6,36),t,{pos:[0,-.03,0],rot:[Math.PI/2,0,0],scale:[.23,.23,.04]}),e.add(X(32,1.12,1),t,{pos:[0,.08,0],scale:[.135,.22,.135]}),e.add(X(32),`#257a3a`,{pos:[0,.19,0],scale:[.15,.006,.15]}),e.add(X(32),`#1e1a1e`,{pos:[0,0,0],scale:[.14,.055,.14]});for(let[t,n,r,i]of[[0,.024,.07,.012],[0,-.024,.07,.012],[-.03,0,.012,.06],[.03,0,.012,.06]])e.add(new A(1,1,1),`#f2c94c`,{pos:[t,n,.142],scale:[r,i,.012]});for(let t=0;t<3;t++){let n=t/3*Math.PI*2+Math.PI/2;e.add(Y(8,6),`#4cc35a`,{pos:[.1+Math.cos(n)*.022,.06+Math.sin(n)*.022,.1],rot:[0,.8,0],scale:[.022,.022,.007]})}return e.add(X(5),`#3a8a3a`,{pos:[.1,.03,.1],rot:[0,0,.3],scale:[.004,.04,.004]}),Q(e,{top:.2,sit:{kind:`brim`,rim:[-.035,.135]}})}function Us(){let e=new I,t=`#3e4a45`,n=`#c9a24f`,r=`#24282a`;e.add(X(36),t,{pos:[0,-.035,0],scale:[.21,.016,.21]}),e.add(Z(.3,6,36),t,{pos:[0,-.03,0],rot:[Math.PI/2,0,0],scale:[.21,.21,.04]}),e.add(X(32,1.06,1),t,{pos:[0,.045,0],scale:[.14,.16,.14]}),e.add(X(32),`#48554f`,{pos:[0,.126,0],scale:[.149,.006,.149]}),e.add(X(32),n,{pos:[0,-.008,0],scale:[.143,.04,.143]});let i=[0,.068,.149],a=(e,t,n=0)=>[i[0]+e,i[1]+t,i[2]+n];e.add(X(26),`#f6efe0`,{pos:i,rot:[Math.PI/2,0,0],scale:[.046,.01,.046]}),e.add(Z(.18,5,26),n,{pos:a(0,0,.004),scale:[.048,.048,.035]});for(let t=0;t<12;t++){let n=t/12*Math.PI*2;e.add(new A(1,1,1),r,{pos:a(Math.sin(n)*.036,Math.cos(n)*.036,.006),rot:[0,0,-n],scale:[.004,t%3?.006:.011,.004]})}for(let[t,n]of[[Math.PI/3,.034],[-Math.PI/3,.024]])e.add(new A(1,1,1),r,{pos:a(Math.sin(t)*n/2,Math.cos(t)*n/2,.008),rot:[0,0,-t],scale:[.005,n,.004]});e.add(Y(8,6),n,{pos:a(0,0,.009),scale:.006});let o=[-.148,.06,-.01];e.add(X(24),n,{pos:o,rot:[0,0,Math.PI/2],scale:[.045,.012,.045]});for(let t=0;t<10;t++){let r=t/10*Math.PI*2;e.add(new A(1,1,1),n,{pos:[o[0],o[1]+Math.cos(r)*.05,o[2]+Math.sin(r)*.05],rot:[r,0,0],scale:[.012,.016,.014]})}e.add(X(14),`#8a6a2a`,{pos:[o[0]-.004,o[1],o[2]],rot:[0,0,Math.PI/2],scale:[.016,.012,.016]});let s=new P().setFromUnitVectors(new R(0,1,0),new R(.55,.35,.75).normalize());return e.add(X(14,1,1.25),r,new z().compose(new R(.15,-.005,.12),s,new R(.022,.04,.022))),e.add(X(14),`#bfe3f0`,new z().compose(new R(.15,-.005,.12).addScaledVector(new R(.55,.35,.75).normalize(),.021),s,new R(.023,.004,.023))),e.add(X(12),n,{pos:[0,.14,0],scale:[.022,.026,.022]}),e.add(X(12),`#e2c06a`,{pos:[0,.155,0],scale:[.026,.008,.026]}),e.add(Z(.18,6,22),n,{pos:[0,.185,0],scale:[.027,.027,.035]}),Q(e,{top:.21,sit:{kind:`brim`,rim:[-.035,.14]}})}function Ws(e){let t=e.getIndex();for(let e=0;e<t.count;e+=3){let n=t.getX(e+1);t.setX(e+1,t.getX(e+2)),t.setX(e+2,n)}return e}function Gs(e,t){let n=e.getAttribute(`position`),r=new R;for(let e=0;e<n.count;e++){let i=t(r.fromBufferAttribute(n,e));n.setXYZ(e,i.x,i.y,i.z)}return e}function Ks(){let e=new I,t=[`#e2423c`,`#f4c430`,`#3a78d8`,`#4cae4c`],n=`#fbf8f2`;for(let n=0;n<4;n++){let r=new Te(1,7,9,Math.PI/4+n*Math.PI/2,Math.PI/2,0,Math.PI/2);e.add(r,t[n],{pos:[0,-.12,-.01],scale:[.27,.19,.28]}),r.dispose()}let r=new tt(1,.035,4,20,Math.PI);for(let t of[Math.PI/4,3*Math.PI/4])e.add(r,n,{pos:[0,-.12,-.01],rot:[0,Math.PI+t,0],scale:[.274,.193,.28]});r.dispose(),e.add(Z(.08,5,32),n,{pos:[0,-.12,-.01],rot:[Math.PI/2,0,0],scale:[.272,.282,.25]}),e.add(X(14),n,{pos:[0,.074,-.01],scale:[.032,.02,.032]}),e.add(X(8),`#c8c2b8`,{pos:[0,.1,-.01],scale:[.009,.05,.009]});let i=new I;i.add(Y(10,7),t[0],{scale:[.026,.02,.026]});for(let e of[-1,1])i.add(Y(12,6),e<0?t[2]:t[1],{pos:[e*.092,0,0],rot:[e*.4,0,0],scale:[.085,.013,.036]});let a=Q(e,{top:.15,sit:{kind:`snug`,rim:[-.12,.27,.28]}}),o=ot(),s=i.mesh(o,{cast:!0,receive:!1});return s.position.set(0,.128,-.01),a.group.add(s),a.solid.push({mesh:s,material:o}),a.materials.push(o),a.update=e=>{s.rotation.y=e*7+Math.sin(e*.9)*1.6},a}function qs(){let e=new I,t=new R(0,-.2,-.015),n=new R(.31,.27,.3),r=1.28,i=new P().setFromEuler(new F(Math.PI/2+.55,0,0)),a=new R(0,.8,-.6).normalize(),o=new R(0,.5,-.85).normalize(),s=e=>{let r=e.clone().normalize(),i=r.clone().multiply(n).multiplyScalar(e.length()),s=Math.max(0,(r.dot(a)-.5)/.5);i.addScaledVector(o,.22*s*s);let c=Math.max(0,-r.y)**2*(.5-.5*r.z);i.x*=1+.12*c,i.z*=1+.12*c,i.y-=.08*c;let l=-.3;return i.y<l&&(i.y=l+(i.y-l)*.3),e.copy(i.add(t))};for(let[t,n,a]of[[1,`#2f2a38`,!1],[.93,`#141118`,!0]]){let o=new Te(t,24,12,0,Math.PI*2,r,Math.PI-r).applyQuaternion(i);e.add(Gs(a?Ws(o):o,s),n),o.dispose()}let c=new tt(Math.sin(r)*.965,.06,6,36).rotateX(Math.PI/2).translate(0,Math.cos(r)*.965,0).applyQuaternion(i);return e.add(Gs(c,s),`#3d3648`),c.dispose(),Q(e,{top:.15,sit:{kind:`hood`,rim:[-.2,.31,.3],open:[0,-.52,.85,.35]}})}function Js(){let e=new I,t=[`#6e1420`,`#8a1a26`,`#a8202c`,`#c42834`,`#d8343c`,`#e84a4c`],n=new tt(1,.06,5,20,Math.PI*.56).rotateZ(Math.PI*.22);e.add(n,`#2a2026`,{pos:[0,-.22,.03],rot:[.55,0,0],scale:[.268,.205,.2]}),n.dispose();for(let n of[-1,1]){let r=[n*.064,-.06,.145];e.add(Y(12,7),t[0],{pos:[r[0],r[1]+.016,r[2]],scale:[.06,.026,.06]}),Ss(e,e=>t[e],r,.053,.18,6,1.2,[0,0,n],[n*.65,1,.3])}return Q(e,{top:.12,sit:{kind:`perch`,rim:[-.06,.16],among:!0}},Ht())}function Ys(){let e=new I,t=[`#e8b83a`,`#d49a24`,`#f4cd5c`],n=`#c8302c`,r=.222,i=e=>new R(Math.sin(e)*r,-.075-Math.cos(e)*.02,Math.cos(e)*r),a=Y(5,4);for(let n of[-1,1]){let r=[];for(let o=0;o<=8;o++){let s=n*(Math.PI-.1-o/8*(Math.PI-.1-.32)),c=i(s);r.push(c);let l=i(s-n*.01).sub(c).normalize(),u=new R(Math.sin(s),0,Math.cos(s)),d=o===8?[0]:[.62,-.62];for(let[n,r]of d.entries()){let i=l.clone().multiplyScalar(Math.cos(r)).add(new R(0,Math.sin(r),0)).addScaledVector(u,.22).normalize(),s=u.clone().addScaledVector(i,-u.dot(i)).normalize(),d=new z().makeBasis(new R().crossVectors(i,s),i,s);d.setPosition(c.clone().addScaledVector(i,.036)),e.add(a,t[(o+n)%3],d.multiply(new z().makeScale(.025,.048,.007)))}}let o=new je(r),s=new it(o,18,.008,4,!1);e.add(s,`#a8741c`),s.dispose()}a.dispose();let o=i(Math.PI).add(new R(0,0,-.012));e.add(Y(8,6),n,{pos:o.toArray(),scale:[.018,.018,.014]});for(let t of[-1,1])e.add(Y(8,6),n,{pos:[o.x+t*.03,o.y+.008,o.z],rot:[0,0,t*.35],scale:[.028,.017,.01]}),e.add(new A(1,1,1),`#a82424`,{pos:[o.x+t*.018,o.y-.042,o.z-.004],rot:[.15,0,t*.3],scale:[.016,.066,.004]});return Q(e,{top:.04,sit:{kind:`ring`,rim:[-.075,.222]}})}function Xs(){let e=new I,t=`#25212b`,n=`#f6f0e2`,r=e=>((1+Math.cos(3*e))/2)**2,i=e=>{let t=Math.atan2(e.x,e.z),n=r(t),i=Math.hypot(e.x,e.z),a=i<=.16?i:.16+(i-.16)*(.5+1*n),o=e.y<=-.035?e.y:-.035+(e.y+.035)*(1-.5*n);return e.set(Math.sin(t)*a,o,Math.cos(t)*a)},a=[[.15,-.05],[.235,-.052],[.258,-.04],[.268,0],[.277,.08],[.272,.093],[.26,.087],[.25,0],[.24,-.032],[.15,-.035]].map(([e,t])=>new L(e,t)),o=new At(a,48);e.add(Gs(o,i),t),o.dispose();let s=[];for(let e=0;e<48;e++){let t=e/48*Math.PI*2;s.push(i(new R(Math.sin(t)*.268,.093,Math.cos(t)*.268)))}let c=new it(new je(s,!0,`catmullrom`,.3),72,.011,4,!0);e.add(c,`#e2b23a`),c.dispose(),e.add(bs(22,8),t,{pos:[0,-.04,0],scale:[.168,.15,.172]}),e.add(X(28),`#1a171e`,{pos:[0,-.03,0],scale:[.17,.02,.174]});let l=new z().compose(new R(0,.055,.142),new P().setFromUnitVectors(new R(0,0,1),new R(0,.45,1).normalize()),new R(1.3,1.3,1.3));for(let t of[-1,1]){let r=t*.8,i=new R(-Math.sin(r),Math.cos(r),0),a=new R(Math.cos(r),Math.sin(r),0);e.add(X(6),n,{pos:[0,0,.004],rot:[0,0,r],scale:[.0055,.07,.0055]},l);for(let t of[-1,1])for(let r of[-1,1]){let o=i.clone().multiplyScalar(t*.035).addScaledVector(a,r*.0055);e.add(Y(5,4),n,{pos:[o.x,o.y,.004],scale:.0075},l)}}e.add(Y(10,8),n,{pos:[0,.006,.008],scale:[.024,.022,.012]},l),e.add(Y(8,6),n,{pos:[0,-.013,.008],scale:[.014,.011,.01]},l);for(let t of[-1,1])e.add(Y(6,4),`#1a1618`,{pos:[t*.009,.004,.018],scale:[.0065,.0075,.004]},l);return Q(e,{top:.11,sit:{kind:`brim`,rim:[-.04,.168,.172]}})}function Zs(){let e=new I;e.add(X(28,.93,1),`#f2e8d4`,{pos:[0,-.075,0],scale:[.215,.09,.215]}),e.add(Z(.22,5,24),`#e8dcc4`,{pos:[0,-.115,0],rot:[Math.PI/2,0,0],scale:[.222,.222,.12]});let t=.345,n=.215,r=e=>new L(t*Math.sin(e),-.035+n*Math.cos(e)),i=[];for(let e=0;e<=10;e++)i.push(r(1.72*(1-e/10)));i[i.length-1].x=.001;let a=new At(i,36);e.add(a,`#d8343a`),a.dispose();let o=r(1.72),s=new At([new L(.19,-.03),new L(.27,-.05),o],36);e.add(s,`#ecdcbc`),s.dispose();for(let t=0;t<18;t++){let n=t/18*Math.PI*2;e.add(new A(1,1,1),`#d2bf98`,{pos:[Math.sin(n)*.265,-.05,Math.cos(n)*.265],rot:[0,n,0],scale:[.004,.006,.13]})}let c=Y(6,4);for(let i=0;i<15;i++){let a=Math.acos(Math.cos(.1)-(i+.5)/15*(Math.cos(.1)-Math.cos(1.45))),o=i*2.39996,s=r(a),l=new R(Math.sin(a)/t*Math.sin(o),Math.cos(a)/n,Math.sin(a)/t*Math.cos(o)).normalize(),u=.03+i*7%5*.006,d=new R(Math.sin(o)*s.x,s.y,Math.cos(o)*s.x).addScaledVector(l,.002);e.add(c,`#fbf8f2`,new z().compose(d,new P().setFromUnitVectors(new R(0,0,1),l),new R(u,u,u*.3)))}return c.dispose(),Q(e,{top:.19,sit:{kind:`brim`,rim:[-.12,.215]}})}function Qs(){let e=new I,t=new z().makeRotationX(.16),n=new At([[.236,-.136],[.25,-.143],[.263,-.13],[.268,-.1],[.258,-.068],[.242,-.06],[.224,-.066],[.236,-.136]].map(([e,t])=>new L(e,t)),40);e.add(n,`#1fb3a6`,{},t),n.dispose();for(let n=0;n<30;n++){let r=n/30*Math.PI*2;e.add(X(4),`#189e93`,{pos:[Math.sin(r)*.262,-.1,Math.cos(r)*.262],rot:[0,r,0],scale:[.006,.06,.006]},t)}return e.add(new Se(1,1,1,40,1,!0),`#fbf8f2`,{pos:[0,-.1,0],scale:[.272,.024,.272]},t),Q(e,{top:0,sit:{kind:`band`,rim:[-.14,.236]}})}function $s(){let e=new I,t=`#e0b44e`,n=`#f6ecd2`,r=new At([[.001,-.03],[.12,-.03],[.146,-.016],[.154,.008],[.142,.012],[.13,-.01],[.001,-.014]].map(([e,t])=>new L(e,t)),32);e.add(r,t),r.dispose(),e.add(Z(.25,5,32),`#f0c862`,{pos:[0,.01,0],rot:[Math.PI/2,0,0],scale:[.149,.149,.04]}),e.add(Z(.28,5,20),`#f0c862`,{pos:[.19,0,0],scale:[.042,.042,.036]}),e.add(X(16),`#c0923e`,{pos:[0,.018,0],scale:[.056,.064,.056]}),e.add(Z(.25,5,18),t,{pos:[0,.05,0],rot:[Math.PI/2,0,0],scale:[.058,.058,.07]}),e.add(X(16),n,{pos:[0,.12,0],scale:[.042,.18,.042]}),e.add(Z(.3,4,16),`#fbf4e2`,{pos:[0,.207,0],rot:[Math.PI/2,0,0],scale:[.04,.04,.035]}),e.add(X(5),`#2a2220`,{pos:[0,.222,0],scale:[.005,.028,.005]});let i=new R(Math.sin(.5),0,Math.cos(.5));e.add(Y(8,6),n,{pos:[i.x*.041,.18,i.z*.041],rot:[0,.5,0],scale:[.013,.035,.009]}),e.add(Y(8,6),n,{pos:[i.x*.045,.145,i.z*.045],scale:.013});let a=Q(e,{top:.36,sit:{kind:`perch`,rim:[-.03,.12]}}),o=new I,s=new At([[.001,0],[.022,.012],[.031,.036],[.026,.066],[.013,.094],[.001,.12]].map(([e,t])=>new L(e,t)),12);o.add(s,`#ffa23a`),s.dispose(),o.add(Y(10,7),`#fff2a8`,{pos:[0,.033,0],scale:[.032,.034,.032]});let c=new ye({vertexColors:!0}),l=o.mesh(c,{cast:!1,receive:!1}),u=new ye({color:`#ff9a40`,transparent:!0,opacity:.2,depthWrite:!1,blending:2}),d=new Je(new Te(.052,12,9),u);d.position.y=.045,d.castShadow=!1;let f=new Mt;return f.position.y=.232,f.add(l,d),a.group.add(f),a.materials.push(c,u),a.update=e=>{let t=1+Math.sin(e*11)*.07+Math.sin(e*17.3)*.04;l.scale.set(1/Math.sqrt(t),t,1/Math.sqrt(t)),l.rotation.z=Math.sin(e*3.7)*.08+Math.sin(e*9.1)*.03,u.opacity=.17+Math.sin(e*13)*.04},a}function ec(){let e=new I,t=`#24365f`,n=`#c8302c`;e.add(X(32),n,{pos:[0,-.03,0],scale:[.19,.055,.195]}),e.add(X(36,1,.9),t,{pos:[0,.03,-.004],scale:[.225,.065,.231]}),e.add(bs(28,5),t,{pos:[0,.0625,-.004],scale:[.225,.03,.231]}),e.add(Z(.035,5,36),n,{pos:[0,.0625,-.004],rot:[Math.PI/2,0,0],scale:[.226,.232,.226]});let r=new Se(1,1,1,24,1,!1,-Math.PI/2,Math.PI);e.add(r,`#15151a`,{pos:[0,-.055,.12],rot:[.22,0,0],scale:[.18,.014,.15]}),r.dispose();let i=new tt(1,.04,4,18,Math.PI*2/3).rotateZ(Math.PI/6);e.add(i,`#1e1e24`,{pos:[0,-.042,0],rot:[Math.PI/2,0,0],scale:[.194,.199,.16]}),i.dispose();for(let t of[-1,1])e.add(Y(8,6),`#e2b23a`,{pos:[t*.168,-.042,.1],scale:.011});let a=new z().compose(new R(0,.03,.217),new P().setFromEuler(new F(.2,0,0)),new R(1,1,1));e.add(X(20),n,{rot:[Math.PI/2,0,0],scale:[.03,.008,.03]},a),e.add(X(20),`#fbf8f2`,{pos:[0,0,.002],rot:[Math.PI/2,0,0],scale:[.024,.008,.024]},a),e.add(new A(1,1,1),n,{pos:[0,0,.006],scale:[.028,.019,.004]},a),e.add(new A(1,1,1),`#fbf8f2`,{pos:[0,0,.008],scale:[.022,.013,.003]},a);for(let t of[-1,1])e.add(new A(1,1,1),n,{pos:[t*.0055,.002,.0098],rot:[0,0,t*.6],scale:[.014,.0028,.002]},a);return Q(e,{top:.1,sit:{kind:`brim`,rim:[-.0575,.19,.195]}})}function tc(){let e=new I,t=`#7a3eb0`,n=`#eebc3a`,r=`#d4343c`;for(let[n,i]of[[-Math.PI/2,t],[Math.PI/2,r]]){let t=new Te(1,12,9,n,Math.PI,0,Math.PI/2);e.add(t,i,{pos:[0,-.12,-.01],scale:[.28,.18,.29]}),t.dispose()}e.add(X(30),n,{pos:[0,-.12,-.01],scale:[.287,.05,.297]}),e.add(Z(.12,5,30),`#d8a42e`,{pos:[0,-.095,-.01],rot:[Math.PI/2,0,0],scale:[.287,.297,.1]});let i=[[[-.09,0,0],[-.7,1,0],[0,0,1],t,`#6a34a0`],[[.09,0,0],[.7,1,0],[0,0,-1],r,`#bc2c36`],[[0,0,-.09],[0,1,-.7],[-1,0,0],n,`#d8a42e`]];for(let[t,n,r,a,o]of i){let i=Ss(e,e=>e%2?o:a,t,.085,.42,7,2.2,r,n);e.add(Z(.3,3,8),`#c8962a`,{pos:[i[0],i[1]-.012,i[2]],scale:[.012,.012,.012]}),e.add(Y(9,7),`#f4c94a`,{pos:[i[0],i[1]-.04,i[2]],scale:.03}),e.add(Z(.2,3,12),`#b8862a`,{pos:[i[0],i[1]-.046,i[2]],rot:[Math.PI/2,0,0],scale:[.026,.026,.02]})}return Q(e,{top:.14,sit:{kind:`snug`,rim:[-.145,.287,.297]}})}function nc(e,t){let n=e.index?e.toNonIndexed():e,r=n.getAttribute(`position`),i=new Ie;i.setAttribute(`position`,r.clone());let a=new Float32Array(r.count*3),o=new Ce,s=new R,c=new R;for(let e=0;e+2<r.count;e+=3){s.set(0,0,0);for(let t=0;t<3;t++)s.add(c.fromBufferAttribute(r,e+t));o.set(t(e/3,s.divideScalar(3)));for(let t=0;t<3;t++)a.set([o.r,o.g,o.b],(e+t)*3)}return i.setAttribute(`color`,new _e(a,3)),n!==e&&n.dispose(),i}function rc(e,t,n){let r=new P().setFromUnitVectors(new R(0,1,0),t.clone().sub(e).normalize());return new z().compose(e.clone().add(t).multiplyScalar(.5),r,new R(n,e.distanceTo(t),n))}function ic(e,t,n,r,i,a=1){let o=[];for(let r=0;r<=6;r++)o.push(new L(e+(t-e)*r/6,-n/2));o.push(new L(t+n*.45,0));for(let r=6;r>=0;r--)o.push(new L(e+(t-e)*r/6,n/2));return Gs(new At(o,r),n=>{let r=Ke.clamp((Math.hypot(n.x,n.z)-e)/(t-e),0,1.05);return n.y+=i(n.x,n.z,r),n.z*=a,n})}function ac(e,t,n,r,i,a){let o=new I;o.add(X(6),n,{pos:[0,-i/2,0],scale:[.0055,i+.004,.0055]}),o.add(Y(10,7),r,{pos:[0,-i-a*.1,0],scale:[a*.2,a*.22,a*.2]}),o.add(X(16,.45,1),n,{pos:[0,-i-a*.62,0],scale:[a*.3,a,a*.3]});for(let e=0;e<6;e++){let t=e/6*Math.PI*2;o.add(X(4),n,{pos:[Math.sin(t)*a*.2,-i-a*1.12,Math.cos(t)*a*.2],rot:[Math.cos(t)*.2,0,-Math.sin(t)*.2],scale:[a*.05,a*.16,a*.05]})}let s=ot(),c=o.mesh(s,{cast:!0,receive:!1}),l=new Mt;return l.position.set(...t),l.add(c),e.group.add(l),e.solid.push({mesh:c,material:s}),e.materials.push(s),l}var oc=(e,t,n=1)=>{e.rotation.z=(Math.sin(t*1.9)*.12+Math.sin(t*3.1)*.04)*n,e.rotation.x=Math.sin(t*1.4+1)*.08*n};function sc(){let e=new I,t=`#1b191d`,n=new z().compose(new R(.03,-.07,.02),new P().setFromEuler(new F(-.1,0,-.3)),new R(1,1,1)),r=.27,i=.152;e.add(X(30,.12/i,1),`#b51d2f`,{pos:[0,r/2,0],scale:[i,r,i]},n);let a=new tt(.11499999999999999,.006,4,30).rotateX(Math.PI/2);e.add(a,`#a01a2a`,{pos:[0,.269,0]},n),a.dispose(),e.add(X(14),t,{pos:[0,.278,0],scale:[.026,.018,.026]},n);let o=new R(.088,.276,.075);e.add(X(6),t,rc(new R(0,.28400000000000003,0),o,.0065),n);let s=Q(e,{top:.2,sit:{kind:`perch`,rim:[-.07,.152]}}),c=ac(s,o.clone().add(new R(.006,0,.006)).applyMatrix4(n).toArray(),t,`#2c282e`,.05,.085);return s.update=e=>oc(c,e),s}function cc(){let e=new I,t=[`#c4a578`,`#94744c`,`#5c4430`],n=[`#dcc39a`,`#b08e62`,`#7a5c40`],r=[0,-.11,-.005],i=[.262,.205,.275],a=e=>Ot({pos:r,scale:[i[0]*e,i[1]*e,i[2]*e]}),o=(e,n,r,i=0,a=0,o=t)=>{let s=Math.atan2(e.x,e.z)+Math.PI-i,c=Math.acos(Ke.clamp(e.y/e.length(),-1,1))-a,l=Math.floor(s/n+1e3),u=Math.floor(c/r+1e3);return o[l%2+u%2]},s=new Te(1,32,10,0,Math.PI*2,0,Math.PI/2);e.addColored(nc(s,(e,t)=>o(t,Math.PI/8,Math.PI/10)),a(1)),s.dispose(),e.add(Z(.03,4,36),t[2],{pos:r,rot:[Math.PI/2,0,0],scale:[i[0]+.002,i[2]+.002,.25]});for(let[n,i]of[[1,.29],[-1,.26]]){let a=Gs(new Se(1,1,1,20,1,!1,-Math.PI/2,Math.PI),e=>e.set(e.x*.215,e.y*.014-.035*e.z*e.z-.012*e.x*e.x,e.z*i)),o={pos:[0,r[1]+.008,r[2]+n*.12],rot:[n*.12,n>0?0:Math.PI,0]};e.add(a,t[1],o),a.dispose();let s=new je(Array.from({length:11},(e,t)=>{let n=-Math.PI/2+t/10*Math.PI,r=Math.sin(n),a=Math.cos(n);return new R(r*.215,-.035*a*a-.012*r*r,a*i)})),c=new it(s,20,.008,4,!1);e.add(c,t[2],o),c.dispose()}let c=.6,l=[.34,1.5];for(let s of[-1,1]){let u=s>0?Math.PI:0,d=new Te(1,6,8,u-c,c*2,l[0],l[1]-l[0]);e.addColored(nc(d,(e,t)=>o(t,c*2/3,(l[1]-l[0])/4,u-c+Math.PI/2+.001,l[0]+.001,n)),a(1.06)),d.dispose();let f=1.065,p=(e,t)=>new R(-Math.cos(e)*Math.sin(t)*i[0]*f,r[1]+Math.cos(t)*i[1]*f,r[2]+Math.sin(e)*Math.sin(t)*i[2]*f),m=[];for(let e=0;e<5;e++)m.push(p(u-c+e/4*c*2,l[0]));for(let e=1;e<5;e++)m.push(p(u+c,l[0]+e/4*(l[1]-l[0])));for(let e=1;e<5;e++)m.push(p(u+c-e/4*c*2,l[1]));for(let e=1;e<4;e++)m.push(p(u-c,l[1]-e/4*(l[1]-l[0])));let h=new it(new je(m,!0,`catmullrom`,.2),36,.0075,4,!0);e.add(h,t[2]),h.dispose(),e.add(X(5),t[2],rc(p(u,l[0]+.05),new R(s*.02,r[1]+i[1]*1.06+.008,r[2]),.006))}let u=new R(0,r[1]+i[1]*1.06+.012,r[2]);e.add(Y(8,6),t[2],{pos:u.toArray(),scale:[.02,.017,.02]});for(let n of[-1,1])e.add(Y(10,6),t[2],{pos:[n*.034,u.y+.008,u.z],rot:[0,0,n*.45],scale:[.038,.019,.017]}),e.add(new A(1,1,1),t[2],{pos:[n*.012,u.y-.008,u.z+n*.03],rot:[n*.9,n*.4,0],scale:[.012,.004,.05]});return Q(e,{top:.12,sit:{kind:`snug`,rim:[-.11,.262,.275]}})}function lc(){let e=new I,t=[`#f4f6f8`,`#dde2e7`,`#c3cad1`,`#e9edf0`,`#a9b2bb`,`#cfd5db`],n=xt(11),r=()=>t[Math.floor(n()*t.length)],i=e=>{let t=Math.max(0,(e.y+.07)/.34);return e.x+=.05*t*t,e.z-=.015*t,e},a=[[.198,-.07],[.186,-.03],[.165,.025],[.14,.08],[.11,.135],[.078,.185],[.047,.228],[.02,.258],[0,.27]].map(([e,t])=>new L(e,t)),o=Gs(new At(a,15),i);_t(o,.032,5),e.addColored(nc(o,r)),o.dispose();let s=new tt(.2,.024,5,22).rotateX(Math.PI/2).translate(0,-.066,0);_t(s,.03,9),e.addColored(nc(s,r)),s.dispose();let c=i(new R(0,.255,0));for(let t of[0,Math.PI]){let n=[];for(let e=0;e<=8;e++){let r=t+e*1.1;n.push(new R(c.x+Math.sin(r)*.01+e*.002,c.y+e*.011,c.z+Math.cos(r)*.01))}let i=new it(new je(n),16,.0065,4,!1);e.addColored(nc(i,r)),i.dispose()}let l=new Dt(.024,1).translate(c.x+.018,c.y+.098,c.z);_t(l,.012,3),e.addColored(nc(l,r)),l.dispose();let u=new fe({vertexColors:!0,flatShading:!0,specular:`#ffffff`,shininess:70,emissive:`#3a4048`}),d=new Mt,f=e.mesh(u,{cast:!0,receive:!1,crease:0});return d.add(f),{group:d,solid:[{mesh:f,material:u}],materials:[u],top:.36,sit:{kind:`brim`,rim:[-.07,.198]}}}function uc(){let e=new I,t=`#d9302c`,n=`#f8f6f0`,r=[0,-.12,-.01],i=[.265,.2,.278];for(let[a,o]of[[0,t],[Math.PI,n]]){let t=new Te(1,14,9,a,Math.PI,0,Math.PI/2);e.add(t,o,{pos:r,scale:i}),t.dispose()}let a=new tt(1,.03,4,20,Math.PI);e.add(a,`#c22a26`,{pos:r,scale:[i[0]+.003,i[1]+.003,.28]}),a.dispose(),e.add(Z(.04,4,32),`#c22a26`,{pos:[r[0],r[1]+.012,r[2]],rot:[Math.PI/2,0,0],scale:[i[0],i[2],.25]}),e.add(X(14),t,{pos:[r[0],r[1]+i[1]+.004,r[2]],scale:[.03,.022,.03]});let o=Gs(new Se(1,1,1,22,1,!1,-Math.PI/2,Math.PI),e=>e.set(e.x*.215,e.y*.016-.05*e.x*e.x,e.z*.29));e.add(o,t,{pos:[0,r[1]+.012,.105],rot:[.1,0,0]}),o.dispose();let{p:s,n:c}=Ms(i[0],i[1],i[2],0,.52,r[1]);s.z+=r[2];let l=new P().setFromUnitVectors(new R(0,0,1),c),u=(e,t)=>new Se(1,1,1,22,1,!1,e,t).rotateX(Math.PI/2),d=u(0,Math.PI*2);e.add(d,n,new z().compose(s.clone().addScaledVector(c,.002),l,new R(.062,.062,.01))),d.dispose();let f=u(Math.PI/2,Math.PI);return e.add(f,`#2fa84f`,new z().compose(s.clone().addScaledVector(c,.006).addScaledVector(new R(0,1,0).applyQuaternion(l),-.012),l,new R(.046,.046,.01))),f.dispose(),Q(e,{top:.09,sit:{kind:`snug`,rim:[-.12,.265,.278]}})}function dc(){let e=new I,t=`#4c7656`,n=`#2b2328`,r=.44,i=-.04,a=e=>.128+.068*Math.max(0,(e-i)/r)**1.3,o=e=>{let t=Math.max(0,(e.y-i)/r),n=Math.atan2(e.x,e.z),a=1+.03*Math.sin(3*n+t*7)*t;return e.x*=a,e.z*=a,e.x+=.085*t*t-.02*Math.sin(t*Math.PI),e.z-=.025*t,e.y+=.04*t*t*(e.x/.2),e},s=ic(.1,.225,.016,44,(e,t,n)=>-.035+.055*n*n*(e*e)/(e*e+t*t+1e-6)-.006*n);e.add(s,t),s.dispose();let c=[];for(let e=0;e<=10;e++){let t=i+r*e/10;c.push(new L(a(t),t))}c.push(new L(a(.4)-.012,.406),new L(.001,.394));let l=Gs(new At(c,32),o);e.add(l,t),l.dispose();let u=.085,d=Gs(new At([[a(-.03)+.004,-.03],[a(-.02)+.011,-.02],[a(.07500000000000001)+.011,.07500000000000001],[a(u)+.003,u]].map(([e,t])=>new L(e,t)),32),o);e.add(d,`#df8a35`),d.dispose();for(let[t,n,r,i]of[[-.95,.21,`#8a4f8f`,.25],[2.5,.28,`#d8b456`,-.3]]){let s=o(new R(Math.sin(t)*(a(n)+.003),n,Math.cos(t)*(a(n)+.003))),c=new z().compose(s,new P().setFromEuler(new F(-.05,t,i,`YXZ`)),new R(1,1,1));e.add(new A(1,1,1),r,{scale:[.07,.065,.006]},c);for(let t=0;t<4;t++){let n=-.024+t*.016;for(let[t,r,i]of[[n,.03,0],[n,-.03,0],[.033,n,Math.PI/2],[-.033,n,Math.PI/2]])e.add(new A(1,1,1),`#f2e8d2`,{pos:[t,r,.004],rot:[0,0,i+.5],scale:[.009,.0028,.003]},c)}}let f=.22,p=o(new R(Math.sin(f)*(a(.03)+.0015),.03,Math.cos(f)*(a(.03)+.0015))),m=new z().compose(p,new P().setFromEuler(new F(.22,f,-.2,`YXZ`)),new R(1,1,1));e.add(new A(1,1,1),`#f6eedb`,{pos:[0,.07,0],scale:[.095,.14,.003]},m);let h=.016,g=.03,_=.0046,v={a:[0,g/2,!0],b:[h/2,g/4,!1],c:[h/2,-.03/4,!1],d:[0,-.03/2,!0],e:[-.016/2,-.03/4,!1],f:[-.016/2,g/4,!1],g:[0,0,!0]},y=.095;for(let[t,r]of[[-.039,`bc`],[-.016,`abcdef`],[.028,`acdefg`]])for(let i of r){let[r,a,o]=v[i];e.add(new A(1,1,1),n,{pos:[t+r,y+a,.002],scale:o?[.01876,_,.002]:[_,.017759999999999998,.002]},m)}e.add(new A(1,1,1),n,{pos:[.006,y,.002],rot:[0,0,-.45],scale:[_,.036,.002]},m);for(let[t,n]of[[.128,.06],[.12,.044]])e.add(new A(1,1,1),`#8a7e74`,{pos:[0,t,.002],scale:[n,.0022,.002]},m);return Q(e,{top:.44,sit:{kind:`brim`,rim:[-.04,.128]}})}function fc(){let e=new I,t=`#8a5a34`,n=`#3e2618`,r=[[.152,-.04],[.156,0],[.156,.04],[.152,.08],[.143,.115],[.128,.145],[.105,.165],[.07,.178],[.035,.183],[.001,.184]].map(([e,t])=>new L(e,t)),i=Gs(new At(r,40),e=>{let t=Ke.smoothstep(e.y,.03,.17);e.y-=.06*t*Math.exp(-((e.x/.055)**2))*(.75+.25*(e.z/.16))+.02*t*Math.max(0,e.z/.16);let n=Math.max(0,e.z/.156);return e.x*=1-.3*n*n*t,e.x*=.95,e.z*=1.1,e});e.add(i,t),i.dispose(),e.add(X(40,1.01,1),n,{pos:[0,-.005,0],scale:[.15125,.04,.1756]}),e.add(new A(1,1,1),`#d8b45a`,{pos:[.153,-.005,.03],rot:[0,1.4,0],scale:[.03,.03,.006]}),e.add(new A(1,1,1),n,{pos:[.155,-.005,.03],rot:[0,1.4,0],scale:[.018,.018,.007]});let a=(e,t,n)=>{let r=e*e/(e*e+t*t+1e-6);return-.035+.15*n*n*r*r-.03*n*n*(1-r)},o=ic(.12,.33,.016,48,a,1.12);e.add(o,t),o.dispose();let s=[];for(let e=0;e<40;e++){let t=e/40*Math.PI*2,n=Math.sin(t)*.336,r=Math.cos(t)*.336;s.push(new R(n,a(n,r,1.03),r*1.12))}let c=new it(new je(s,!0),64,.008,4,!0);return e.add(c,`#6e4426`),c.dispose(),Q(e,{top:.17,sit:{kind:`brim`,rim:[-.04,.148,.172]}})}function pc(){let e=new I,t=new R(0,-.15,-.01),n=new R(.29,.235,.3),r=15*Math.PI/36,i=[.94,1.3],a=[Math.PI/2-r,r*2],o=[Math.PI/2+r,Math.PI*2-r*2],s=(r,i,a,o,s=1,c=36)=>{let l=new Te(1,Math.max(4,Math.round(c*r[1]/(Math.PI*2))),Math.max(2,Math.round((a-i)*7)),r[0],r[1],i,a-i);e.add(l,o,{pos:t.toArray(),scale:[n.x*s,n.y*s,n.z*s]}),l.dispose()},c=[a[0],Math.PI*2];s(c,0,.5,`#e6eaf0`),s(c,.5,i[0],`#c0c8d2`),s(o,i[0],1.28,`#8e99a6`),s(o,1.28,1.66,`#b8c1cc`),s(a,i[0]-.02,i[1],`#15171d`,1.025);for(let r of[-1,1]){let i=Math.PI/2-1.22,a=new R(r*Math.cos(i)*n.x,t.y+Math.sin(i)*n.y,t.z-.03);e.add(X(22),`#8c96a2`,{pos:a.toArray(),rot:[0,0,Math.PI/2],scale:[.058,.03,.058]}),e.add(X(22),`#2a2e36`,{pos:[a.x+r*.016,a.y,a.z],rot:[0,0,Math.PI/2],scale:[.034,.004,.034]})}let l=Q(e,{top:.1,sit:{kind:`snug`,rim:[-.17,.29,.3]}},new fe({vertexColors:!0,specular:`#ffffff`,shininess:90})),u=(i[0]+i[1])/2-.02,d=new Te(1,24,1,a[0]+.12,a[1]-.24,u-.022,.044),f=new ye({color:`#ff3c46`}),p=new Je(d,f);p.position.copy(t),p.scale.copy(n).multiplyScalar(1.032),p.castShadow=!1;let m=new ye({color:`#fff0e8`}),h=new Je(new Te(.014,10,7),m),g=new ye({color:`#ff5a5a`,transparent:!0,opacity:.35,depthWrite:!1,blending:2}),_=new Je(new Te(.032,10,7),g);h.add(_),h.castShadow=!1,_.castShadow=!1,h.scale.set(1.6,.8,.8),l.group.add(p,h),l.materials.push(f,m,g);let v=e=>{let r=1.04;h.position.set(-Math.cos(e)*Math.sin(u)*n.x*r+t.x,Math.cos(u)*n.y*r+t.y,Math.sin(e)*Math.sin(u)*n.z*r+t.z),h.rotation.y=e-Math.PI/2};return v(Math.PI/2),l.update=e=>v(Math.PI/2+Math.sin(e*2.2)*(r-.22)),l}function mc(){let e=new I,t=`#f2661c`,n=`#f7f7f2`,r=.43,i=.15,a=.032,o=[[0,t],[.36,n],[.53,t],[.66,n],[.77,t],[1,t]];for(let t=0;t<o.length-1;t++){let[n,a]=o[t],s=o[t+1][0],c=new Se(i+-.118*s,i+-.118*n,r*(s-n),28,1,!0);e.add(c,a,{pos:[0,-.032+r*(n+s)/2,0]}),c.dispose()}e.add(Z(.22,4,18),`#e85a14`,{pos:[0,.398,0],rot:[Math.PI/2,0,0],scale:[a,a,.03]}),e.add(X(16),`#4a1e08`,{pos:[0,.394,0],scale:[a*.95,.004,a*.95]});let s=e=>-.42*Math.max(0,e-.13)**1.3,c=[],l=[.001,.13,.19,.25,.3];for(let e of l)c.push(new L(e,-.044+s(e)));c.push(new L(.31,-.034+s(.31)));for(let e of[...l].reverse())c.push(new L(e,-.022+s(e)));let u=new At(c,4).rotateY(Math.PI/4);return e.add(u,`#1f1f24`),u.dispose(),e.add(X(28,1,1.12),`#2a2a30`,{pos:[0,-.012,0],scale:[.162,.02,.162]}),Q(e,{top:.4,sit:{kind:`brim`,rim:[-.032,.15]}})}function hc(){let e=new I,t=`#f2bc3c`;e.add(bs(26,7),`#25242c`,{pos:[0,-.1,-.005],scale:[.232,.14,.242]}),e.add(Z(.12,4,32),`#1c1b22`,{pos:[0,-.095,-.005],rot:[Math.PI/2,0,0],scale:[.233,.243,.15]});let n=.46;e.add(new A(1,1,1),`#2b2a33`,{pos:[0,.045,0],rot:[0,Math.PI/4,0],scale:[n,.018,n]}),e.add(new A(1,1,1),`#34333d`,{pos:[0,.0545,0],rot:[0,Math.PI/4,0],scale:[.43000000000000005,.002,.43000000000000005]}),e.add(X(14),t,{pos:[0,.061,0],scale:[.022,.012,.022]});let r=n/2*Math.SQRT2,i=new R(r-.004,.055999999999999994,0);e.add(X(6),t,rc(new R(0,.061,0),i,.006));let a=Q(e,{top:.07,sit:{kind:`snug`,rim:[-.1,.232,.242]}}),o=ac(a,[r+.006,.053,0],t,`#d8a028`,.05,.085);return a.update=e=>oc(o,e+2,.8),a}function gc(){let e=new I,t=e=>.9+.1*Math.sqrt(Math.abs(Math.cos(5*e))),n=(e,t)=>t>0?.045*Math.max(0,1-e/.4)**2:0,r=(e,r,i=0)=>{let a=Math.cos(r),o=.215*t(e)+i;return new R(Math.sin(e)*a*o,.08+Math.sin(r)*(.165+i)-n(a,r),Math.cos(e)*a*o)};for(let t=0;t<10;t++){let n=new Te(1,3,10,Math.PI/2-Math.PI/10+t*Math.PI*2/10,Math.PI*2/10);e.add(Gs(n,e=>r(Math.atan2(e.x,e.z),Math.asin(Ke.clamp(e.y,-1,1)))),t%2?`#ec7a1e`:`#f58c2a`),n.dispose()}let i=new je([[0,-.06,0],[.002,-.025,0],[.01,.008,-.004],[.03,.03,-.008],[.057,.036,-.01],[.076,.022,-.008]].map(([e,t,n])=>new R(e,.245+t,n))),a=new it(i,10,.024,7,!1);e.add(a,`#6b7a36`),a.dispose();let o=i.getPoint(1),s=i.getTangent(1);e.add(X(9),`#c8b47a`,new z().compose(o,new P().setFromUnitVectors(new R(0,1,0),s),new R(.022,.006,.022)));let c=-.75,l=r(c,1,.008),u=new P().setFromEuler(new F(.15,c-Math.PI/2,-.5,`YXZ`));e.add(Y(10,6),`#4f9a3a`,new z().compose(l,u,new R(.075,.01,.045))),e.add(new A(1,1,1),`#3c7c2c`,new z().compose(l.clone().add(new R(0,.007,0)),u,new R(.12,.004,.004)));let d=[];for(let e=0;e<=14;e++){let t=e/14,n=t*Math.PI*3.2;d.push(new R(.02+.03*t+Math.cos(n)*.018*(1-t*.4),.225+Math.sin(n)*.018+t*.02,.02+t*.05))}let f=new it(new je(d),24,.0045,4,!1);e.add(f,`#5aa040`),f.dispose();let p=Q(e,{top:.29,sit:{kind:`perch`,rim:[-.04,.147]}}),m=[],h=e=>{let[t,n,r]=e,[i,a]=(n[0]-t[0])*(r[1]-t[1])-(n[1]-t[1])*(r[0]-t[0])>0?[n,r]:[r,n],o=(e,t)=>[(e[0]+t[0])/2,(e[1]+t[1])/2];m.push([t,o(t,i),o(t,a)],[o(t,i),i,o(i,a)],[o(t,a),o(i,a),a],[o(t,i),o(i,a),o(t,a)])},g=(e,t,n,r)=>{h([e,t,n]),h([e,n,r])},_=[];for(let e of[-1,1])_.push({pts:[[e*.13,.12],[e*.5,.1],[e*.3,.42]],centre:[e*.31,.21]});_.push({pts:[[-.08,-.06],[.08,-.06],[0,.08]],centre:[0,-.01]});let v=e=>{let t=[-1,-.8,-.6,-.46,-.26,-.1,.1,.26,.46,.6,.8,1],n=.66+e;for(let r=0;r<t.length-1;r++){let i=t[r],a=t[r+1],o=(i+a)/2,s=Math.abs(o)>.26&&Math.abs(o)<.46?.09:0,c=Math.abs(o)<.1?.09:0,l=t=>-.2+.13*t*t-(e?0:s)+e,u=t=>-.48+.4*t*t+(e?0:c)-e,d=i*n,f=a*n;g([d,u(i)],[f,u(a)],[f,l(a)],[d,l(i)])}};for(let e of _)h(e.pts.map(([t,n])=>[e.centre[0]+(t-e.centre[0])*1.22,e.centre[1]+(n-e.centre[1])*1.22]));v(.035);let y=m.length;for(let e of _)h(e.pts);v(0);let b=(e,t)=>{let n=[];for(let i of e)for(let[e,a]of i)n.push(...r(e,a,t).toArray());let i=new Ie;return i.setAttribute(`position`,new Bt(n,3)),i},x=new I,S=b(m.slice(0,y),.003);x.add(S,`#8a3410`),S.dispose();let C=b(m.slice(y),.0055);x.add(C,`#ffcf4a`),C.dispose();let w=new ye({vertexColors:!0}),T=x.mesh(w,{cast:!1,receive:!1,crease:0});return p.group.add(T),p.materials.push(w),p.update=e=>{let t=.86+Math.sin(e*9.3)*.06+Math.sin(e*15.1)*.05+Math.sin(e*2.3)*.03;w.color.setRGB(t,t*.96,t*.9)},p}function _c(e,t,n,r,i,a,o=32){let s=new Te(1,o,Math.max(2,Math.round((i-r)*7)),0,Math.PI*2,r,i-r);e.add(s,a,{pos:t,scale:n}),s.dispose()}function vc(){let e=new I,t=[`#e2e6ea`,`#c2c8d0`,`#9aa2ae`],n=`#c8913a`,r=[`#a88a58`,`#c4a874`,`#d8c294`,`#e6d6b0`,`#efe4c8`,`#f6eedc`,`#fbf6ea`],i=[0,-.14,-.01],a=[.272,.215,.282];_c(e,i,a,0,.62,t[0]),_c(e,i,a,.62,1.12,t[1]),_c(e,i,a,1.12,Math.PI/2,t[2]),e.add(X(36),n,{pos:[0,-.142,-.01],scale:[a[0]+.012,.055,a[2]+.012]});for(let t=0;t<16;t++){let n=t/16*Math.PI*2;e.add(Y(6,4),`#e8b860`,{pos:[Math.sin(n)*(a[0]+.014),-.142,-.01+Math.cos(n)*(a[2]+.014)],scale:.011})}let o=new tt(1,.07,5,24,Math.PI).rotateY(Math.PI/2);e.add(o,n,{pos:i,scale:[.2,a[1]+.006,a[2]+.006]}),o.dispose();for(let t of[-1,1]){let i=[t*.235,-.06,-.02];e.add(Z(.3,6,18),n,{pos:i,rot:[0,0,t*1.25],scale:[.058,.058,.05]}),Ss(e,e=>r[e],i,.056,.27,7,1.7,[0,0,t],[t,.25,.12])}return Q(e,{top:.16,sit:{kind:`snug`,rim:[-.17,.284,.294]}},Ht())}function yc(){let e=new I,t=`#e8c46a`,n=`#d0a84a`,r=[`#d8343c`,`#2f9a4a`,`#f6d55c`,`#f8f6f0`],i=new At([[.152,-.04],[.15,.05],[.14,.14],[.122,.21],[.096,.26],[.064,.292],[.03,.31],[.001,.314]].map(([e,t])=>new L(e,t)),32);e.add(i,t),i.dispose(),e.add(X(32,.97,1),r[0],{pos:[0,.005,0],scale:[.153,.05,.153]});for(let[t,n,i]of[[.035,.149,r[3]],[.05,.146,r[1]]])e.add(Z(.14,3,28),i,{pos:[0,t,0],rot:[Math.PI/2,0,0],scale:[n,n,.08]});e.add(Z(.07,3,26),n,{pos:[0,.16,0],rot:[Math.PI/2,0,0],scale:[.136,.136,.1]});let a=(e,t,n)=>-.04-.025*n+.15*n**3.5,o=ic(.13,.42,.016,36,a);e.add(o,t),o.dispose();let s=.27;e.add(Z(.1,3,32),n,{pos:[0,a(0,0,.14/.29)+.008,0],rot:[Math.PI/2,0,0],scale:[s,s,.08]});let c=[];for(let e=0;e<40;e++){let t=e/40*Math.PI*2;c.push(new R(Math.sin(t)*.426,a(0,0,1.02),Math.cos(t)*.426))}let l=new it(new je(c,!0),48,.012,4,!0);e.add(l,r[0]),l.dispose();for(let t=0;t<12;t++){let n=t/12*Math.PI*2,i=.185;e.add(Y(5,3),r[t%3],{pos:[Math.sin(n)*i,a(0,0,.05499999999999999/.29)+.012,Math.cos(n)*i],scale:[.014,.006,.014]})}for(let t=0;t<12;t++){let n=(t+.5)/12*Math.PI*2,i=Math.sin(n)*.432,o=Math.cos(n)*.432,s=a(0,0,1.02);e.add(X(3),`#3a2a1a`,{pos:[i,s-.022,o],scale:[.003,.04,.003]}),e.add(Y(6,4),r[(t+1)%3],{pos:[i,s-.05,o],scale:.018})}return Q(e,{top:.31,sit:{kind:`brim`,rim:[-.04,.152]}})}function bc(){let e=new I,t=`#6c1e36`;e.add(X(32),t,{pos:[0,-.095,-.005],scale:[.262,.032,.272]});let n=new F(.04,0,-.17),r=[.04,-.02,-.01];e.add(Y(28,12),`#8a2a48`,{pos:r,rot:[n.x,n.y,n.z],scale:[.33,.092,.335]});let i=(e,t,i=0)=>{let a=1-e*e/(.33*.33)-t*t/(.335*.335);return new R(e,Math.sqrt(Math.max(0,a))*.092+i,t).applyEuler(n).add(new R(...r))};e.add(X(8,.7,1),t,{pos:i(0,0,.012).toArray(),rot:[0,0,-.17],scale:[.012,.028,.012]});for(let[t,r,a,o]of[[.14,.08,.034,`#3a7bd5`],[-.09,.15,.026,`#f6d55c`],[.05,-.17,.03,`#f8f6f0`],[-.16,-.06,.022,`#4cb860`]])e.add(Y(8,4),o,{pos:i(t,r,-.006).toArray(),rot:[n.x,t*3,n.z],scale:[a,.009,a*.8]});let a=new R(-.27,-.12,.05),o=new R(-.245,.11,-.13),s=o.clone().sub(a).normalize(),c=o.clone().addScaledVector(s,.03);return e.add(X(8),`#c8343a`,rc(a,o,.011)),e.add(X(8),`#c8ccd4`,rc(o,c,.013)),e.add(X(8,.4,1),`#e8d8b0`,rc(c,c.clone().addScaledVector(s,.03),.012)),e.add(X(8,.1,1),`#3a7bd5`,rc(c.clone().addScaledVector(s,.03),c.clone().addScaledVector(s,.05),.0055)),Q(e,{top:.12,sit:{kind:`snug`,rim:[-.11,.262,.272]}})}function xc(){let e=new I,t=`#a8b0bc`,n=new R(0,-.23,.015),r=.37,i=2.42,a=n.y+Math.cos(i)*r,o=Math.sin(i)*r;e.add(Z(.22,8,36),`#f4f4f0`,{pos:[0,a-.02,n.z],rot:[Math.PI/2,0,0],scale:[o+.02,o+.02,.2]}),e.add(Z(.16,6,36),t,{pos:[0,a+.012,n.z],rot:[Math.PI/2,0,0],scale:[o-.004,o-.004,.12]}),e.add(X(14),t,{pos:[.15,a-.03,n.z+o*.82],rot:[Math.PI/2-.3,0,0],scale:[.02,.04,.02]}),e.add(X(14),`#3a3e48`,{pos:[.15,a-.026,n.z+o*.82+.022],rot:[Math.PI/2-.3,0,0],scale:[.012,.008,.012]});for(let[t,r]of[[-.12,`#ff5a4a`],[-.07,`#5ad87a`]])e.add(Y(8,6),r,{pos:[t,a-.03,n.z+o*.92+.028],scale:.013});for(let[t,r,i,a]of[[-.55,.62,.06,.02],[-.3,.38,.018,.018]]){let o=new R(Math.sin(t)*Math.cos(r),Math.sin(r),Math.cos(t)*Math.cos(r)),s=new P().setFromUnitVectors(new R(0,0,1),o);e.add(Y(10,6),`#ffffff`,new z().compose(n.clone().addScaledVector(o,.372),s,new R(i,a,.004)))}let s=Q(e,{top:.15,sit:{kind:`hood`,rim:[-.2,.31,.31],clear:!0}}),c=new fe({color:`#d8ecff`,specular:`#ffffff`,shininess:110,transparent:!0,opacity:.22,depthWrite:!1}),l=new Je(new Te(r,30,16,0,Math.PI*2,0,i),c);return l.position.copy(n),l.castShadow=!1,l.renderOrder=2,s.group.add(l),s.materials.push(c),s}function Sc(){let e=new I,t=[`#a07a56`,`#94704e`,`#ac8660`,`#9a7452`],n=xt(7),r=[0,-.12,-.005],i=[.272,.2,.282];e.add(bs(24,9),`#5a4436`,{pos:r,scale:i});for(let t=0;t<4;t++)e.add(Z(.04,4,24),`#4c3a2e`,{pos:r,rot:[0,t*Math.PI/4,0],scale:[i[0]+.002,i[1]+.002,.05]});for(let[r,a,o,s]of[[-1.15,2.3,-.1,.1],[Math.PI-1.35,2.7,-.115,.075]]){let c=_t(new Se(1,1.03,1,22,2,!1,r,a),.025,5);e.addColored(nc(c,()=>t[Math.floor(n()*t.length)]),Ot({pos:[0,o,-.005],scale:[i[0]+.035,s,i[2]+.035]})),c.dispose();let l=Math.round(a*7);for(let n=0;n<l;n++){let c=r+(n+.5)/l*a,u=_t(new Dt(1,0),.25,20+n);e.add(u,t[n%t.length],{pos:[Math.sin(c)*(i[0]+.03),o+s/2,-.005+Math.cos(c)*(i[2]+.03)],rot:[n,c,0],scale:[.036,.026,.036]}),u.dispose()}}for(let a of[-1,1]){let o=_t(new Te(1,12,8),.04,a>0?9:11);e.addColored(nc(o,()=>t[Math.floor(n()*t.length)]),Ot({pos:[a*.268,-.08,-.02],rot:[0,0,a*.32],scale:[.045,.11,.13]})),o.dispose(),e.add(X(5),`#4a3424`,rc(new R(a*.275,-.02,-.02),new R(a*.03,r[1]+i[1]+.012,-.02),.005))}let a=r[1]+i[1]+.018;e.add(Y(8,6),`#4a3424`,{pos:[0,a,-.02],scale:[.016,.013,.016]});for(let t of[-1,1])e.add(Y(8,5),`#4a3424`,{pos:[t*.026,a+.004,-.02],rot:[0,0,t*.4],scale:[.028,.013,.012]});let o=xs(1);return e.add(o,`#e2b23a`,{pos:[0,-.055,i[2]+.04],rot:[-.25,0,0],scale:.03}),o.dispose(),Q(e,{top:.1,sit:{kind:`snug`,rim:[-.15,.272,.282]}})}function Cc(){let e=new I,t=`#fbf8f2`,{geo:n,tip:r}=Cs([0,-.12,-.01],.27,.5,12,2,[.25,0,1],[0,1,-.1]);e.add(n,`#d6302f`),n.dispose();let i=_t(new tt(1,.13,8,36),.03,2).rotateX(Math.PI/2);e.add(i,t,{pos:[0,-.13,-.01],scale:[.285,.3,.295]}),i.dispose();let a=_t(new Dt(1,2),.18,4);e.add(a,t,{pos:[r[0],r[1]-.02,r[2]],scale:.065}),a.dispose();for(let t of[-1,1])e.add(Y(8,4),`#2f7a3a`,{pos:[-.1+t*.035,-.11,.29],rot:[-.3,0,t*.5],scale:[.042,.018,.008]});for(let t=0;t<3;t++)e.add(Y(8,6),`#c81e2a`,{pos:[-.1+(t-1)*.014,-.098+t%2*.012,.3],scale:.012});return Q(e,{top:.22,sit:{kind:`snug`,rim:[-.17,.285,.295]}})}function wc(){let e=new I,t=`#2e2832`,n=new tt(1,.06,5,20,Math.PI*.56).rotateZ(Math.PI*.22);e.add(n,t,{pos:[0,-.22,.03],rot:[.55,0,0],scale:[.268,.205,.2]}),n.dispose();for(let n of[-1,1]){let r=new R(n*.085,-.055,.14),i=new P().setFromEuler(new F(-.2,n*-.25,n*-.32)),a=(t,n,a,o=0)=>e.add(new He(1,1,10),a,new z().compose(r.clone().add(new R(0,n[1]/2+o,t).applyQuaternion(i)),i,new R(...n)));a(0,[.065,.13,.026],t),a(.016,[.042,.09,.012],`#f29ab4`,-.005),e.add(Y(6,4),`#fbf8f2`,new z().compose(r.clone().add(new R(0,.022,.026).applyQuaternion(i)),i,new R(.02,.012,.006))),e.add(Y(10,5),t,{pos:[r.x,r.y+.005,r.z],scale:[.06,.018,.03]})}return Q(e,{top:.1,sit:{kind:`perch`,rim:[-.06,.16],among:!0}},Ht())}function Tc(){let e=new I,t=`#25356a`,n=new z().makeRotationX(.16),r=new At([[.236,-.134],[.25,-.138],[.256,-.12],[.256,-.084],[.25,-.068],[.236,-.064],[.236,-.134]].map(([e,t])=>new L(e,t)),40);e.add(r,t,{},n),r.dispose();let i=new Se(.266,.266,.056,14,1,!0,-.42,.84);e.add(i,`#c4cad4`,{pos:[0,-.1,0]},n),i.dispose();for(let[t,r]of[[-.36,-.08],[.36,-.08],[-.36,-.12],[.36,-.12]])e.add(Y(6,4),`#8a92a0`,{pos:[Math.sin(t)*.268,r,Math.cos(t)*.268],scale:.0065},n);let a=new tt(1,.2,4,18,Math.PI*1.6);e.add(a,`#3a4250`,{pos:[0,-.1,.27],rot:[0,0,.6],scale:[.016,.016,.02]},n),a.dispose(),e.add(Y(6,4),`#3a4250`,{pos:[0,-.1,.271],scale:.006},n),e.add(new He(1,1,4),`#3a4250`,{pos:[.018,-.087,.27],rot:[0,0,-.8],scale:[.006,.026,.004]},n);let o=new R(0,-.1,-.255).applyMatrix4(n);e.add(Y(10,7),t,{pos:o.toArray(),scale:[.03,.026,.022]});let s=Q(e,{top:0,sit:{kind:`band`,rim:[-.14,.236]}}),c=[];for(let e of[-1,1]){let n=new I,r=new R,i=new R(e*.35,-.55,-.75).normalize();for(let e=0;e<4;e++){let a=.06,o=new P().setFromUnitVectors(new R(0,-1,0),i);n.add(new A(1,1,1),e%2?`#2a3c76`:t,new z().compose(r.clone().addScaledVector(i,a/2),o,new R(.036-e*.003,a*1.06,.006))),r=r.addScaledVector(i,a),i=i.add(new R(0,-.35,0)).normalize()}let a=ot(),l=n.mesh(a,{cast:!0,receive:!1}),u=new Mt;u.position.copy(o),u.add(l),s.group.add(u),s.solid.push({mesh:l,material:a}),s.materials.push(a),c.push(u)}return s.update=e=>{c.forEach((t,n)=>{t.rotation.x=Math.sin(e*2.3+n*1.7)*.12+Math.sin(e*5.1+n)*.04,t.rotation.z=Math.sin(e*1.7+n*2.1)*.08})},s}function Ec(){let e=new I,t=[`#e6eaee`,`#c8ced6`,`#a4acb8`,`#7e8694`],n=[0,-.14,-.01],r=[.275,.225,.285];_c(e,n,r,0,.55,t[0]),_c(e,n,r,.55,1.1,t[1]),_c(e,n,r,1.1,Math.PI/2,t[2]),e.add(Z(.18,6,36),t[3],{pos:[0,-.15,-.01],rot:[Math.PI/2,0,0],scale:[r[0]+.006,r[2]+.006,.15]});let i=new tt(1,.05,4,24,Math.PI).rotateY(Math.PI/2);e.add(i,t[1],{pos:n,scale:[.4,r[1]+.012,r[2]+.012]}),i.dispose();let a=[r[0]*1.06,r[1]*1.06,r[2]*1.06],o=new Te(1,14,5,Math.PI/2-1.05,2.1,.32,.78);e.add(o,t[1],{pos:n,scale:a}),e.add(Ws(o),t[3],{pos:n,scale:[a[0]-.004,a[1]-.004,a[2]-.004]}),o.dispose();let s=new tt(1,.035,4,10,.78).rotateZ(Math.PI/2-.32-.78).rotateY(-Math.PI/2);e.add(s,t[0],{pos:n,scale:[.4,a[1]+.006,a[2]+.006]}),s.dispose();let c=(e,t)=>{let{p:r,n:i}=Ms(a[0],a[1],a[2],e,t,n[1]);return r.z+=n[2],{p:r.addScaledVector(i,.003),q:new P().setFromUnitVectors(new R(0,0,1),i)}};for(let n of[-1,1]){let{p:r,q:i}=c(n*.3,.6);e.add(new A(1,1,1),`#2a2e36`,new z().compose(r,i,new R(.075,.012,.008))),e.add(X(14),t[3],{pos:[n*(a[0]+.004),-.1,0],rot:[0,0,Math.PI/2],scale:[.03,.02,.03]})}for(let t=0;t<4;t++){let{p:n}=c(.55+t%2*.13,.62+Math.floor(t/2)*.13);e.add(Y(6,4),`#2a2e36`,{pos:n.toArray(),scale:.008})}let l=new R(0,n[1]+r[1]-.01,-.07);e.add(X(10),t[2],{pos:l.toArray(),rot:[-.4,0,0],scale:[.022,.05,.022]});for(let t=0;t<7;t++){let n=(t-3)*.16,r=new P().setFromEuler(new F(-.75-Math.abs(t-3)*.08,0,n)),i=.2-Math.abs(t-3)*.02,a=l.clone().add(new R(0,i*.9,0).applyQuaternion(r));e.add(Y(10,7),t%2?`#f6efe4`:`#d02a34`,new z().compose(a,r,new R(.03,i,.022)))}return Q(e,{top:.24,sit:{kind:`snug`,rim:[-.17,.281,.291]}},Ht())}function Dc(){let e=new I,{geo:t}=Cs([0,-.13,-.01],.278,.6,12,.75,[-1,0,0],[0,1,-.18]);e.add(t,`#d23a2e`),t.dispose(),e.add(Z(.12,6,36),`#b02e24`,{pos:[0,-.13,-.01],rot:[Math.PI/2,0,0],scale:[.282,.292,.22]});let{p:n,n:r}=Ms(.24,.3,.25,1.15,.45,-.13),i=new P().setFromUnitVectors(new R(0,0,1),r);e.add(new A(1,1,1),`#7a5a3a`,new z().compose(n.clone().addScaledVector(r,.002),i.clone().multiply(new P().setFromEuler(new F(0,0,.2))),new R(.06,.055,.008)));for(let t=0;t<4;t++){let r=t/4*Math.PI*2+.2,a=new R(Math.cos(r)*.03,Math.sin(r)*.028,.005).applyQuaternion(i);e.add(new A(1,1,1),`#f2e6c8`,new z().compose(n.clone().add(a),i.clone().multiply(new P().setFromEuler(new F(0,0,r))),new R(.016,.004,.004)))}return Q(e,{top:.42,sit:{kind:`snug`,rim:[-.16,.278,.288]}})}function Oc(){let e=new I,t=`#86613e`,n=`#3a2618`,r=[[.15,-.04],[.153,0],[.152,.05],[.146,.09],[.132,.12],[.105,.138],[.07,.146],[.035,.149],[.001,.15]].map(([e,t])=>new L(e,t)),i=Gs(new At(r,40),e=>{let t=Ke.smoothstep(e.y,.03,.14);e.y-=.05*t*Math.exp(-((e.x/.05)**2))*(.8+.2*(e.z/.15))+.015*t*Math.max(0,e.z/.15);let n=Math.max(0,e.z/.153);return e.x*=(1-.32*n*n*t)*.95,e.z*=1.1,e});e.add(i,t),i.dispose(),e.add(X(40,1.01,1),n,{pos:[0,-.008,0],scale:[.153*.95+.004,.036,.1723]});for(let t of[-1,1])e.add(Y(8,5),n,{pos:[-.148,-.006,-.02+t*.016],rot:[0,0,.2],scale:[.006,.018,.014]});let a=(e,t,n)=>{let r=Math.hypot(e,t)+1e-6,i=e*e/(r*r);return-.035+n*n*(.02*i-.045*Math.max(0,t/r)**1.5+.03*Math.max(0,-t/r)**2)},o=ic(.12,.28,.014,48,a,1.1);e.add(o,t),o.dispose();let s=[];for(let e=0;e<40;e++){let t=e/40*Math.PI*2,n=Math.sin(t)*.28500000000000003,r=Math.cos(t)*.28500000000000003;s.push(new R(n,a(n,r,1.02),r*1.1))}let c=new it(new je(s,!0),60,.006,4,!0);return e.add(c,`#6e4e30`),c.dispose(),Q(e,{top:.15,sit:{kind:`brim`,rim:[-.04,.145,.168]}})}function kc(){let e=new I,t=[`#ffc8de`,`#e4c8ff`,`#c4dcff`,`#c8f2e0`,`#fff0b8`],n=.34,r=3.6,i=Gs(new Se(.003,.062,n,16,22,!1),e=>{let t=(e.y+n/2)/n,i=Math.atan2(e.x,e.z),a=.84+.16*Math.cos(2*(i-t*r*Math.PI*2));return e.x*=a,e.z*=a,e}),a=nc(i,(e,i)=>{let a=(i.y+n/2)/n,o=Math.atan2(i.x,i.z);return Math.cos(2*(o-a*r*Math.PI*2))>.2?`#fffaf0`:t[Math.min(t.length-1,Math.floor(a*t.length))]});i.dispose();let o=new R(0,-.035,.1),s=new P().setFromEuler(new F(.42,0,0)),c=new R(0,1,0).applyQuaternion(s);e.addColored(a,new z().compose(o.clone().addScaledVector(c,.18000000000000002),s,new R(1,1,1))),a.dispose(),e.add(Z(.3,6,22),`#e8b83a`,new z().compose(o.clone().addScaledVector(c,.012),s.clone().multiply(new P().setFromEuler(new F(Math.PI/2,0,0))),new R(.068,.068,.05))),e.add(Y(14,6),`#e8b83a`,new z().compose(o,s,new R(.074,.02,.074)));for(let[n,r]of[[-1.1,t[0]],[1.2,t[1]],[Math.PI,t[2]]]){let t=o.clone().add(new R(Math.sin(n)*.085,.006,Math.cos(n)*.065-.012)),i=new P().setFromEuler(new F(-.5,n,0));for(let n=0;n<5;n++){let a=n/5*Math.PI*2,o=t.clone().add(new R(Math.cos(a)*.018,Math.sin(a)*.018,0).applyQuaternion(i));e.add(Y(6,4),r,new z().compose(o,i,new R(.016,.016,.007)))}e.add(Y(6,4),`#f6c42c`,new z().compose(t.clone().add(new R(0,0,.005).applyQuaternion(i)),i,new R(.01,.01,.008))),e.add(Y(6,4),`#78b85a`,{pos:[t.x+Math.sin(n+.5)*.03,t.y-.006,t.z+Math.cos(n+.5)*.025],rot:[.3,n+.5,.5],scale:[.026,.008,.012]})}let l=Q(e,{top:.32,sit:{kind:`brim`,rim:[-.035,.11,.13]}}),u=new ye({color:`#fffbe8`}),d=new Je(xs(.022,.35),u);return d.position.copy(o.clone().addScaledVector(c,.375)),d.castShadow=!1,l.group.add(d),l.materials.push(u),l.update=e=>{let t=.75+.25*Math.sin(e*3.7)*Math.sin(e*1.3+1);d.scale.setScalar(t),d.rotation.z=e*.8},l}var Ac={beanie:ws,flower:Ts,party:Es,wizard:Ds,tophat:Os,crown:ks,halo:js,witch:As,lumberjack:Ns,souwester:Ps,mitre:Fs,chef:Is,bowler:Ls,sunhat:Rs,headscarf:zs,feathercap:Bs,sailor:Vs,leprechaun:Hs,clockmaker:Us,propeller:Ks,reaper:qs,horns:Js,laurel:Ys,tricorn:Xs,toadstool:Zs,headband:Qs,candle:$s,postie:ec,jester:tc,fez:sc,deerstalker:cc,tinfoil:lc,trainer:uc,madhatter:dc,cowboy:fc,robot:pc,cone:mc,mortarboard:hc,pumpkin:gc,viking:vc,sombrero:yc,beret:bc,astronaut:xc,ushanka:Sc,santa:Cc,catears:wc,ninja:Tc,knight:Ec,gnome:Dc,fedora:Oc,unicorn:kc,hardhat:ls,reindeer:us,beerhat:ds,sharkhat:fs,birthday:ps,bicorne:ms,bearskin:hs,centurion:gs,tiara:_s,topper:vs,trophy:ys};function jc(e){let t=Ac[e];return t?t():null}var Mc=130,Nc=-.6,Pc=.01,Fc=32,Ic=60,Lc=-.6,Rc=.02,zc=(e,t)=>Math.floor((Math.atan2(e,t)+Math.PI)/(Math.PI*2)*Fc)%Fc,Bc=class{out=new Float32Array(4160).fill(-1);in=new Float32Array(4160).fill(9);over=new Float32Array(3600).fill(-9);constructor(e){e.updateMatrixWorld(!0);let t=e.matrixWorld.clone().invert(),n=new R,r=new R,i=new R,a=new R,o=new Float32Array(4160).fill(-1),s=new Float32Array(4160).fill(9),c=new Float32Array(3600).fill(-9),l=e=>{let t=Math.floor((e.y-Nc)/Pc);if(t<0||t>=Mc)return;let n=Math.hypot(e.x,e.z),r=t*Fc+zc(e.x,e.z);n>o[r]&&(o[r]=n),n<s[r]&&(s[r]=n);let i=Math.floor((e.x-Lc)/Rc),a=Math.floor((e.z-Lc)/Rc);i>=0&&i<Ic&&a>=0&&a<Ic&&e.y>c[a*Ic+i]&&(c[a*Ic+i]=e.y)};e.traverse(e=>{let o=e;if(!o.isMesh)return;let s=o.matrixWorld.clone().premultiply(t),c=o.geometry.getAttribute(`position`),u=o.geometry.getIndex(),d=u?u.count:c.count;for(let e=0;e+2<d;e+=3){n.fromBufferAttribute(c,u?u.getX(e):e).applyMatrix4(s),r.fromBufferAttribute(c,u?u.getX(e+1):e+1).applyMatrix4(s).sub(n),i.fromBufferAttribute(c,u?u.getX(e+2):e+2).applyMatrix4(s).sub(n);let t=Math.min(30,Math.ceil(Math.max(r.length(),i.length(),r.distanceTo(i))/.012));for(let e=0;e<=t;e++)for(let o=0;e+o<=t;o++)l(a.copy(n).addScaledVector(r,e/t).addScaledVector(i,o/t))}});for(let e=1;e<129;e++)for(let t=0;t<Fc;t++){let n=-1,r=9;for(let i=-1;i<=1;i++)for(let a=-1;a<=1;a++){let c=(e+i)*Fc+(t+a+Fc)%Fc;n=Math.max(n,o[c]),r=Math.min(r,s[c])}this.out[e*Fc+t]=n,this.in[e*Fc+t]=r}for(let e=0;e<Ic;e++)for(let t=0;t<Ic;t++){let n=-9;for(let r=-1;r<=1;r++)for(let i=-1;i<=1;i++)t+i>=0&&t+i<Ic&&e+r>=0&&e+r<Ic&&(n=Math.max(n,c[(e+r)*Ic+t+i]));this.over[e*Ic+t]=n}}across(e,t,n){let r=Math.floor((t-Nc)/Pc);if(r<1||r>=129)return 0;let i=r*Fc+zc(e,n);if(this.out[i]<0)return 0;let a=Math.sqrt(e*e+n*n);return a>this.out[i]+.004?3:a>this.in[i]-.004?2:1}reach(e,t,n,r){let i=-1,a=zc(e,t);for(let e=Math.max(0,Math.floor((n-Nc)/Pc));e<=Math.min(129,Math.floor((r-Nc)/Pc));e++)i=Math.max(i,this.out[e*Fc+a]);return i}inside(e,t,n,r=!1){let i=Math.floor((t-Nc)/Pc);if(i<1||i>=129)return!1;let a=Math.sqrt(e*e+n*n),o=i*Fc+zc(e,n);if(a>this.out[o]+.006)return!1;if(r)return a>this.in[o]-.006;let s=Math.floor((e-Lc)/Rc),c=Math.floor((n-Lc)/Rc);return s>=0&&s<Ic&&c>=0&&c<Ic&&t<this.over[c*Ic+s]+.006}},Vc=new Map,Hc=[[.78,5],[.95,2]];function Uc(e,t,n,r={}){let{kind:i,rim:a}=t.sit,[o,s,c=s]=a,[l,u,d]=n.c,[f,p,m]=n.r,h=u+p,g=Vc.get(e);g||Vc.set(e,g=new Bc(t.group));let _=g,v=n.eye,y=n.brow??Math.min(v.at[1]+v.r*.9+.012,h-p*.4),b=e=>{let t=Ke.clamp((e-u)/p,-.95,.95),n=Math.sqrt(1-t*t);return[f*n,m*n]},x=i===`snug`||i===`band`||i===`ring`,S=i===`ring`||i===`band`||i===`float`,C=r.tilt??t.sit.tilt??(i===`snug`||i===`band`?.15:i===`float`||i===`hood`?0:.12),w=n.size*(r.scale??1),T=new R(r.dx??0,r.dy??0,r.dz??0),E=1,D=(e,t=0)=>{if(x){let n=i===`ring`?Math.max(y,h+o*w)+t:y,r=1,a=1;for(let t=0;t<3;t++){let[t,o]=b(n);r=(t*1.04+.006)/s*e,a=(o*1.04+.006)/c*e,i!==`ring`&&(n=y-c*a*Math.sin(C))}r*=E,a*=E;let u=(r+a)/2,f=i===`snug`?Ke.clamp((h+.006-n)/-o,u*.8,u*1.25):u,p=new P().setFromEuler(new F(-C,0,0));return{pos:new R(l,n,d).sub(new R(0,o*f,0).applyQuaternion(p)).add(T),scale:new R(r,f,a)}}if(i===`hood`){let t=f*1.08/s*e*E,n=m*1.08/c*e*E,r=(t+n)/2,i=new P().setFromEuler(new F(-C,0,0));return{pos:new R(l,u,d).sub(new R(0,o*r,0).applyQuaternion(i)).add(T),scale:new R(t,r,n)}}let n=w*e;if(i===`float`)return{pos:new R(l,h,d).add(T),scale:new R(n,n,n)};let r=(e,t)=>p*(1-Math.sqrt(1-Math.min(.98,e*n/t)**2)),a=h-Math.min(r(s,f),r(c,m));return{pos:new R(l,a-o*n,d).add(T),scale:new R(n,n,n)}},ee=n.bits.filter(e=>e.is===`fold`&&e.bone.startsWith(`crest`)&&i!==`float`).map(e=>e.bone),te=t.sit.among||i===`ring`||i===`band`?[]:n.bits.filter(e=>e.is===`fold`&&!ee.includes(e.bone)),ne=n.bits.filter(e=>e.is===`head`).flatMap(e=>e.pts),re=n.bits.filter(e=>e.is===`eye`).flatMap(e=>e.pts),ie=n.bits.filter(e=>e.is===`solid`),ae=[],oe=new k().setFromMatrix4(new z().makeRotationX(-(n.droop??0)));for(let e of i===`band`||t.sit.clear?[]:[1,-1]){let t=new R(e*v.at[0],v.at[1]+(x?v.r*.3:v.r+.015),v.at[2]+.01);for(let[n,r]of Hc)for(let i of[0,e*.6])ae.push([t,new R(Math.sin(i)*Math.cos(n),Math.sin(n),Math.cos(i)*Math.cos(n)).applyMatrix3(oe),r]);ae.push([t,new R(0,.15,1).normalize().applyMatrix3(oe),5])}let se=new z,ce=new z,le=new k,O=new R,ue=new R,de=new P,fe=new F,pe=(e,t,n)=>{se.compose(e,de.setFromEuler(fe.set(-n,0,0)),t),ce.copy(se).invert(),le.setFromMatrix4(ce)},me=e=>(O.copy(e).applyMatrix4(ce),_.inside(O.x,O.y,O.z,S)),he=e=>(O.copy(e).applyMatrix4(ce),_.inside(O.x,O.y,O.z,S)||Math.hypot(O.x,O.z)<_.reach(O.x,O.z,O.y-.02,O.y+.02)),[ge,_e,ve,A]=t.sit.open??[0,0,1,1],ye=Object.assign(new R(ge,_e,ve).normalize(),{w:A}),be=(e=1/0)=>{let t=0;if(i===`float`)return 0;for(let n of ne)if(O.copy(n).applyMatrix4(ce),(S?_.across(O.x,O.y,O.z)>2:i===`hood`?new R(O.x,O.y-o,O.z).normalize().dot(ye)<ye.w&&!_.inside(O.x,O.y,O.z):O.y>o+.02&&Math.hypot(O.x,O.z)<_.reach(O.x,O.z,o-.03,o+.03)&&!_.inside(O.x,O.y,O.z))&&++t>e)return t;return t},xe=i===`perch`||i===`ring`||i===`band`?25:i===`float`?60:.5,j=(e,t,n,r)=>(t-C)*5+Math.abs(n)*70+r*50+(1-e)*(i===`perch`?7:25),Se=e=>{let n=0;if(!t.sit.clear){for(let t of re)if(me(t)&&(n+=12)>e)return n}for(let t of ie){let r=0;for(let e of t.pts)he(e)&&r++;if(r&&r<t.pts.length&&(n+=8+Math.min(r,t.pts.length-r))>e)return n}if((n+=be((e-n)/1.5)*1.5)>e)return n;for(let[t,r,i]of ae){O.copy(t).applyMatrix4(ce),ue.copy(r).applyMatrix3(le);for(let t=.02;t<.5;t+=.012)if(_.inside(O.x+ue.x*t,O.y+ue.y*t,O.z+ue.z*t,S)){if((n+=i)>e)return n;break}}for(let t of te){let r=t.bone.startsWith(`antler`)&&i!==`snug`&&i!==`hood`;if((r?t.pts.some(he):t.pts.some(me))&&(n+=r?25:xe)>e)return n}return n};if(x||i===`hood`){let e=()=>{let e=be();for(let t of ie){let n=t.pts.filter(me).length;n>=(i===`hood`?1:t.pts.length/2)&&(e+=t.pts.length-n)}return e};for(;E<1.3;E+=.025){let t=D(1);if(pe(t.pos,t.scale,C),!e())break}E=Math.min(1.3,E+.025)}let M=i===`perch`?[1,.9,.8,.7,.6,.5]:i===`ring`||i===`hood`?[1]:i===`brim`?[1,.92,.84,.76,.68,.6]:[1,.92,.84,.76],N=i===`float`?[0,.02,.04,.07,.1,.14,.19,.25]:i===`ring`?[0,-.01,-.02,-.03,.01,.02,.035,.05]:[0,.01,.02,.035,.05,.07],Ce=i===`float`?[0]:[0,.1,.2,.3,.4],we=[];for(let e of M)for(let t of Ce)for(let n of N)for(let r of[0,.02,.04,.06])we.push({k:e,tilt:C+t,lift:n,back:r,cost:j(e,C+t,n,r)});we.sort((e,t)=>e.cost-t.cost);let Te=new Map,Ee=(e,t,n,r)=>{let a=i===`ring`?`${e} ${n}`:`${e}`,o=Te.get(a);o||Te.set(a,o=i===`ring`?D(e,n):D(e));let s=new R(o.pos.x,o.pos.y+(i===`ring`?0:n),o.pos.z-r);return pe(s,o.scale,t),{pos:s,scale:o.scale}},De=we[0],Oe=1/0;r.fixed&&(Oe=0);for(let e of we){if(e.cost>=Oe)break;Ee(e.k,e.tilt,e.lift,e.back);let t=e.cost+Se(Oe-e.cost);t<Oe&&(De=e,Oe=t)}let ke=Ee(De.k,De.tilt,De.lift,De.back);return{pos:[ke.pos.x,ke.pos.y,ke.pos.z],rot:[-De.tilt,0,0],scale:[ke.scale.x,ke.scale.y,ke.scale.z],fold:[...ee,...te.filter(e=>e.pts.some(e.bone.startsWith(`antler`)?he:me)).map(e=>e.bone)]}}var Wc={trophy:`a golden glow and drifting gold sparkles`,topper:`a magician’s swirl of silver sparkles`,tiara:`a sprinkle of diamond glitter`,centurion:`a glowing ripple of glory at your feet`,crown:`a ring of little gold stars`,witch:`moons and stars drifting round you`,mortarboard:`a whizzing atom, for the brainy`,knight:`rose petals falling for the hero`,pumpkin:`spooky embers and a few bats`,astronaut:`a little planet in orbit`},Gc=new URLSearchParams(location.search).get(`fx`)===`low`;function Kc(e){Gc=e}var qc={dot:0,twinkle:1,star:2,moon:3,petal:4,ember:5,gem:6,planet:7,bat:8},Jc=null;function Yc(){if(Jc)return Jc;let e=document.createElement(`canvas`);e.width=e.height=256;let t=e.getContext(`2d`),n=(e,n,r=6)=>{t.save(),t.translate(e%4*64+32,Math.floor(e/4)*64+32),t.fillStyle=t.strokeStyle=`#fff`,t.shadowColor=`rgba(255,255,255,0.9)`,t.shadowBlur=r,n(),t.restore()},r=e=>{t.beginPath(),e.forEach(([e,n],r)=>r?t.lineTo(e,n):t.moveTo(e,n)),t.closePath(),t.fill()},i=(e,t,n,r=-Math.PI/2)=>Array.from({length:e*2},(i,a)=>{let o=a/(e*2)*Math.PI*2+r,s=a%2?n:t;return[Math.cos(o)*s,Math.sin(o)*s]});n(qc.dot,()=>{let e=t.createRadialGradient(0,0,0,0,0,28);e.addColorStop(0,`rgba(255,255,255,1)`),e.addColorStop(.25,`rgba(255,255,255,0.8)`),e.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=e,t.fillRect(-32,-32,64,64)},0),n(qc.twinkle,()=>r(i(4,28,5)),8),n(qc.star,()=>r(i(5,25,11)),6),n(qc.moon,()=>{t.beginPath(),t.arc(0,0,22,0,Math.PI*2),t.fill(),t.globalCompositeOperation=`destination-out`,t.shadowBlur=0,t.beginPath(),t.arc(10,-7,19,0,Math.PI*2),t.fill()}),n(qc.petal,()=>{t.beginPath(),t.moveTo(0,-24),t.bezierCurveTo(20,-12,16,16,0,24),t.bezierCurveTo(-16,16,-20,-12,0,-24),t.fill(),t.shadowBlur=0,t.fillStyle=`rgba(0,0,0,0.18)`,t.fillRect(-1.5,-16,3,34)},2),n(qc.ember,()=>{let e=t.createRadialGradient(0,6,0,0,4,22);e.addColorStop(0,`rgba(255,255,255,1)`),e.addColorStop(.5,`rgba(255,255,255,0.75)`),e.addColorStop(1,`rgba(255,255,255,0)`),t.fillStyle=e,t.beginPath(),t.moveTo(0,-26),t.bezierCurveTo(14,-6,18,10,0,22),t.bezierCurveTo(-18,10,-14,-6,0,-26),t.fill()},0),n(qc.gem,()=>{r([[0,-26],[15,0],[0,26],[-15,0]])},8),n(qc.planet,()=>{t.beginPath(),t.arc(0,0,15,0,Math.PI*2),t.fill(),t.lineWidth=4.5,t.beginPath(),t.ellipse(0,0,28,8,-.35,.15,Math.PI-.15),t.stroke(),t.globalAlpha=.6,t.beginPath(),t.ellipse(0,0,28,8,-.35,Math.PI+.55,Math.PI*2-.55),t.stroke()}),n(qc.bat,()=>{t.beginPath(),t.moveTo(0,-6),t.quadraticCurveTo(-10,-16,-28,-10),t.quadraticCurveTo(-22,-4,-24,4),t.quadraticCurveTo(-16,-2,-12,6),t.quadraticCurveTo(-6,0,0,10),t.quadraticCurveTo(6,0,12,6),t.quadraticCurveTo(16,-2,24,4),t.quadraticCurveTo(22,-4,28,-10),t.quadraticCurveTo(10,-16,0,-6),t.fill(),r([[-5,-6],[-4,-14],[-1,-8],[1,-8],[4,-14],[5,-6]])},0);let a=new de(e);return a.colorSpace=ke,a.generateMipmaps=!0,a.minFilter=Wt,Jc=a,a}var Xc={trophy:[{kind:`aura`,color:`#ffd458`,strength:.6},{kind:`pool`,color:`#ffd65a`,strength:.6},{kind:`motes`,mode:`rise`,n:24,glyphs:[`twinkle`,`twinkle`,`dot`],colors:[`#ffd84a`,`#fff0a0`,`#ffb52a`],size:[.12,.21],period:[2.6,4.2],out:[.95,1.35],y:.05,y1:1.2,swirl:.9,drift:.04,spin:1.2,twinkle:.7}],topper:[{kind:`motes`,mode:`rise`,n:22,glyphs:[`twinkle`,`star`,`dot`],colors:[`#f4f0ff`,`#c29cff`,`#9cd0ff`],size:[.1,.18],period:[2.8,3.6],out:[1.15,1.3],y:.02,y1:1.15,swirl:7.5,taper:.55,spin:2,twinkle:.6}],tiara:[{kind:`motes`,mode:`rise`,n:24,glyphs:[`gem`,`twinkle`,`gem`],colors:[`#ffffff`,`#ffb4e4`,`#aeeaff`],size:[.08,.14],period:[3.4,5],out:[.85,1.3],y:1.25,y1:.02,swirl:.6,drift:.06,spin:2.5,twinkle:.85}],centurion:[{kind:`pool`,color:`#ff8a3a`,strength:.3,ring:{color:`#ffc84a`,every:2.4}},{kind:`motes`,mode:`rise`,n:10,glyphs:[`ember`],colors:[`#ffb84a`,`#ff7a2a`],size:[.09,.13],period:[1.8,2.6],out:[.7,1.1],y:0,y1:.6,drift:.03,twinkle:.3}],crown:[{kind:`motes`,mode:`orbit`,n:7,glyphs:[`star`],colors:[`#ffd23f`,`#ffe27a`],size:[.18,.2],period:[9,9],out:[1.35,1.35],y:.62,tilt:[[.12,.05]],bob:.03,spin:1.2,twinkle:.25}],witch:[{kind:`pool`,color:`#a07aff`,strength:.25},{kind:`motes`,mode:`rise`,n:14,glyphs:[`moon`,`star`,`twinkle`],colors:[`#d0b2ff`,`#a8ffd0`,`#fff2a8`],size:[.13,.2],period:[4,6],out:[1,1.35],y:.1,y1:1.15,swirl:1.6,drift:.05,spin:.6,twinkle:.4}],mortarboard:[{kind:`motes`,mode:`orbit`,n:3,glyphs:[`dot`],colors:[`#8ae8ff`,`#b8f4ff`,`#8ae8ff`],size:[.21,.21],period:[1.4,1.8],out:[1.3,1.3],y:.6,tilt:[[.8,.45],[-.8,.45],[.1,-.6]],trail:6,twinkle:.15}],knight:[{kind:`motes`,mode:`rise`,n:16,glyphs:[`petal`],colors:[`#ff4a62`,`#ff7f96`,`#e02a48`,`#ffd1da`],size:[.12,.17],period:[3.6,5.5],out:[.8,1.35],y:1.3,y1:0,swirl:1.2,drift:.12,spin:2.2,blend:`normal`,strength:.95}],pumpkin:[{kind:`motes`,mode:`rise`,n:18,glyphs:[`ember`,`ember`,`dot`],colors:[`#ff8a1f`,`#ffc23a`,`#ff6a10`,`#9cff5a`],size:[.09,.17],period:[1.8,3],out:[.7,1.15],y:.05,y1:1.05,swirl:.8,drift:.05,twinkle:.5},{kind:`motes`,mode:`orbit`,n:3,glyphs:[`bat`],colors:[`#3a2a4a`],size:[.18,.22],period:[4.5,5.5],out:[1.5,1.75],y:.95,tilt:[[.15,0],[-.1,.12],[.05,-.15]],bob:.08,blend:`normal`,strength:1}],astronaut:[{kind:`motes`,mode:`orbit`,n:1,glyphs:[`planet`],colors:[`#ffc98a`],size:[.3,.3],period:[7,7],out:[1.45,1.45],y:.7,tilt:[[.25,.1]],bob:.03},{kind:`motes`,mode:`orbit`,n:14,glyphs:[`twinkle`,`dot`],colors:[`#ffffff`,`#bcd6ff`,`#e4d4ff`],size:[.065,.13],period:[-14,-18],out:[1.2,1.7],y:.45,tilt:[[.35,.2]],bob:.2,spin:.8,twinkle:.9}]},Zc=`
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
`,Qc=`
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
`,$c=`
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
  ${Qc}
}
`,el=`
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
`,tl=`
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
  ${Qc}
}
`,nl=`
uniform float uR;
varying vec2 vUv;
#include <fog_pars_vertex>
void main() {
  vUv = uv * 2.0 - 1.0;
  vec4 mvPosition = modelViewMatrix * vec4(position.x * uR * 2.6, 0.03, -position.y * uR * 2.6, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`,rl=`
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
  ${Qc}
}
`,il=new Map,al=null;function ol(e,t){let n=il.get(e);if(n)return n;let r=t.mode===`orbit`?t.trail??0:0,i=t.n*(1+r),a=new Float32Array(i*4),o=new Float32Array(i*4),s=new Float32Array(i*3),c=new Float32Array(i*3),l=(()=>{let t=0;for(let n of e)t=t*31+n.charCodeAt(0)|0;return()=>(t=t*1103515245+12345&2147483647)/2147483647})(),u=([e,t],n)=>e+(t-e)*n,d=new Ce,f=0;for(let e=0;e<t.n;e++){let n=t.mode===`orbit`?e/t.n*Math.PI*2:l()*Math.PI*2,i=u(t.out,l()),p=u(t.period,l()),m=qc[t.glyphs[e%t.glyphs.length]],h=u(t.size,l()),g=(l()<.5?-1:1)*(.5+l()),_=2+l()*3,v=t.tilt?.[e%t.tilt.length]??[0,0];d.set(t.colors[e%t.colors.length]);for(let u=0;u<=r;u++,f++)a.set([n,i,t.mode===`orbit`?t.y:(e+l()*.5)/t.n,p],f*4),o.set([m,h*(1-u*.17),g,_],f*4),s.set([v[0],v[1],u*.1],f*3),c.set([d.r,d.g,d.b],f*3)}let p=new Ie;return p.setAttribute(`position`,new _e(new Float32Array(i*3),3)),p.setAttribute(`aA`,new _e(a,4)),p.setAttribute(`aB`,new _e(o,4)),p.setAttribute(`aC`,new _e(s,3)),p.setAttribute(`aCol`,new _e(c,3)),p.boundingSphere=new Ft(new R(0,1,0),2.6),il.set(e,p),p}var sl={blending:5,blendSrc:201,blendDst:205},cl={motes:.55,aura:.5,pool:.8},ll=()=>ht.clone(q.fog);function ul(e,t,n){let r=Xc[e];if(!r)return null;let i=new Mt,a=new Mt;i.name=a.name=`hatFx`;let o=[],s=[],c=[],l=[],u={value:400},d=new L,f=e=>{e.getDrawingBufferSize(d),u.value=d.y/2};return r.forEach((r,d)=>{let p={uTime:{value:0},uH:{value:t},uR:{value:n},uFade:{value:1},uCover:{value:r.kind===`motes`&&r.blend===`normal`?1:cl[r.kind]}};if(r.kind===`motes`){let t=ol(`${e}:${d}`,r),n=r.mode===`rise`,a=new pe({uniforms:{...ll(),...p,uHalfH:u,uAtlas:{value:Yc()},uY0:{value:r.y},uY1:{value:r.y1??r.y},uSwirl:{value:r.swirl??0},uTaper:{value:r.taper??1},uDrift:{value:r.drift??0},uSpin:{value:r.spin??0},uTwinkle:{value:r.twinkle??0},uBob:{value:r.bob??0}},vertexShader:Zc,fragmentShader:$c,defines:{...n?{}:{ORBIT:``},BRIGHT:r.blend===`normal`?`0.0`:`1.0`},transparent:!0,depthWrite:!1,...sl,fog:!0});a.uniforms.uFade.value=r.strength??1,a.userData.strength=r.strength??1;let c=new et(t,a);c.onBeforeRender=f,c.renderOrder=2,i.add(c),o.push(a),s.push({pts:c,full:t.getAttribute(`position`).count})}else{al??=new N(1,1);let e=r.kind===`aura`,t=new pe({uniforms:{...ll(),...p,uColor:{value:new Ce(r.color)},uStrength:{value:r.strength},uRing:{value:new Ce(r.kind===`pool`?r.ring?.color??r.color:r.color)},uEvery:{value:r.kind===`pool`?r.ring?.every??0:0}},vertexShader:e?el:nl,fragmentShader:e?tl:rl,transparent:!0,depthWrite:!1,...sl,fog:!0});t.userData.strength=1;let n=new Je(al,t);n.frustumCulled=!1,n.userData.noBake=!0,n.renderOrder=+!e,(e?i:a).add(n),(e?c:l).push(n),o.push(t)}}),{group:i,ground:a,update(e,t,n){let r=e%1800,i=n?.55:1;for(let e of o)e.uniforms.uTime.value=r,e.uniforms.uFade.value=i*e.userData.strength;for(let{pts:e,full:t}of s)e.geometry.setDrawRange(0,Gc?Math.ceil(t*.4):t);for(let e of c)e.visible=!Gc;let a=t!==`sit`&&t!==`sleep`&&!n;for(let e of l)e.visible=!Gc&&a},dispose(){i.removeFromParent(),a.removeFromParent();for(let e of o)e.dispose()}}}var dl=(e,t)=>{let n=t*(e.length-1),r=Math.min(e.length-2,Math.floor(n));return e[r]+(e[r+1]-e[r])*(n-r)};function fl(e,t,n,r,i,a=9){let o=xn([0,0,.02],t,a,e/a,[n[0]/a,n[1]/a,n[2]/a]);return{pts:o,radii:o.map((e,t)=>r*dl(i,t/a))}}var pl=(e,t,n=.005)=>W(e.surface?e.surface(new R(...t),-n):new R(...t)),ml=(e,t)=>{let n=H(t.coat,Gn,.88),r=H(t.coat,`#2b211d`,.8);e.joints.neck=[0,.62,.05],e.joints.shoulder=[.1,.5,.14],e.joints.hip=[.1,.2,-.06],e.joints.tail=[0,.22,-.17],On(e,{belly:[[0,.33,-.095],[.185,.22,.17]],chest:[[0,.47,.045],[.14,.15,.14]],haunch:[[.11,.2,-.09],[.095,.12,.14]],ruff:[[0,.58,.045],[.13,.08,.12]],melt:.2}),G(e,{r:[.185,.155,.175],at:[0,.14,.06],cheeks:[[.13,-.06,0],[.085,.07,.09]]});let i=_n(e,{dy:-.28,len:.13,ra:.072,rb:.04,drop:.045,squash:[1,.85,1],thin:!0});un(e,{x:.58,y:.7,w:.085,h:.22,d:.045,splay:.18,rake:.08,cup:.5,notch:!0}),Jn(e,{len:.3,r0:.052,r1:.044,paw:[.048,.036,.058],fwd:.36,out:.16}),an(e,{r0:.062,r1:.047,foot:[.05,.036,.08]});let a=Fn(e,fl(.62,[0,-.3,-1],[.7,-.75,0],.125,[.3,.7,.95,1,.95,.8,.5]));U(e),Hn(e,{x:.4,y:.12,size:.9,wide:1.5,slant:.32,color:`#1a1412`}),zn(e,Rn,pl(e,i.nose),.026,.019),ir(e,t.coat,{len:.1,back:.03});let o=[`earL`,`earR`].map(t=>mn(e,t)),s=V(e,`head`,`cheekL`,`cheekR`),c=tn(e,`head`);return e.marks={base:t.coat,marks:[{color:n,f:wn(...o.map(e=>e.inner))},{color:r,f:wn(...o.map(e=>e.back))},{color:n,f:B(V(e,`muzzle`),e=>e.p.y-(i.mid(e.p)+i.r*.15))},{color:n,f:B(s,e=>{let t=c(e),n=Math.abs(t.x);return Math.max(-.2-t.z,t.y-(-.1-.12*n+.3*n*n))})},{color:n,f:B(V(e,`cheekL`,`cheekR`),e=>c(e).y-.05)},{color:n,f:B(V(e,`chest`,`ruff`,`belly`),e=>-e.p.z,e=>on(e.p.x,e.p.y,0,.36,0,.62).d-.075)},{color:r,f:wn(tr(e,`L`,.5),tr(e,`R`,.5))},{color:r,f:B(V(e,/^leg/),e=>e.p.y-.14)},{color:n,f:B(V(e,/^tail\d/),e=>.8-a(e.p))}]},{}},hl=`#2c2a27`,gl=`#e6dac0`,_l=(e,t)=>{let n=H(t.coat,hl,.8),r=H(t.coat,gl,.85),i=H(t.coat,`#2f2d28`,.5);e.joints.neck=[0,.585,.045],e.joints.shoulder=[.12,.47,.115],e.joints.hip=[.11,.17,-.03],e.joints.tail=[0,.19,-.17],On(e,{belly:[[0,.255,-.05],[.235,.25,.195]],chest:[[0,.45,.03],[.165,.15,.15]],haunch:[[.13,.15,-.05],[.11,.12,.15]],ruff:[[0,.56,.035],[.15,.08,.13]]}),G(e,{r:[.225,.178,.19],at:[0,.15,.065],cheeks:[[.15,-.07,.03],[.105,.09,.1]]});let a=_n(e,{dy:-.36,len:.07,ra:.085,rb:.06,drop:.02,squash:[1.05,.8,1]});un(e,{x:.66,y:.64,w:.09,h:.15,d:.045,splay:.3,rake:.1,cup:.5,notch:!0}),Jn(e,{len:.24,r0:.062,r1:.052,paw:[.056,.042,.064],fwd:.85}),an(e,{r0:.07,r1:.058,foot:[.075,.048,.11],fwd:.075});let o=Fn(e,fl(.44,[0,-.3,-1],[.5,-.9,0],.12,[.55,.9,1,1,.9,.6]));U(e),Hn(e,{x:.38,y:.06,size:.85,wide:1.3,slant:.18,color:`#121010`,out:.006,blush:!1}),zn(e,`#2a2624`,pl(e,a.nose),.03,.022,!0),ir(e,t.coat,{len:.11});let s=[`earL`,`earR`].map(t=>mn(e,t)),c=V(e,`head`,`cheekL`,`cheekR`),l=tn(e,`head`),u=(e,t,n,r,i,a)=>o=>{let s=l(o),c=on(Math.abs(s.x),s.y,e,t,n,r);return s.z<-.1?1:c.d-(i+(a-i)*c.t)};return e.marks={base:t.coat,marks:[{color:n,f:wn(...s.map(e=>e.inner))},{color:r,f:wn(...s.map(e=>e.front))},{color:r,f:V(e,`muzzle`)},{color:n,f:B(c,e=>.075-Math.abs(l(e).x),u(.08,.13,.86,-.22,.2,.13))},{color:r,f:B(c,e=>.07-Math.abs(l(e).x),u(.1,.36,.7,.26,.075,.06))},{color:r,f:wn(V(e,`cheekL`,`cheekR`),B(c,e=>l(e).y+.5,e=>-.1-l(e).z))},{color:i,f:wn(tr(e,`L`,.45),tr(e,`R`,.45))},{color:i,f:B(V(e,/^leg/),e=>e.p.y-.11)},{color:n,f:B(V(e,/^tail\d/),e=>{let t=o(e.p);return t>.875?-1:Math.sin(Math.PI*8*t)})},{color:H(t.coat,r,.14),f:B(V(e,`belly`,`chest`),e=>-e.p.z,e=>Math.hypot(e.p.x/.12,(e.p.y-.27)/.14)-1)}]},{}},vl=(e,t,n)=>{let r=H(`#cdbf98`,n,.12),i=H(r,Gn,.45),a=t.coat,o=H(t.coat,nr,.34),s=H(t.coat,nr,.65);e.joints.neck=[0,.27,.36],e.joints.shoulder=[.085,.18,.37],e.joints.tail=[0,.05,-.3],Bn(e,`rear`,`body`,[0,.06,-.22]);let c=fn(e);c.add(Yn(`body`,[0,.07,-.1],[0,.07,.15],.14,.135,{squash:[1,.5,1],name:`foot`})),c.add(Yn(`rear`,[0,.065,-.38],[0,.07,-.1],.06,.14,{squash:[1,.5,1],k:.06,anchor:[0,.07,-.14],reach:.2,name:`tailFoot`})),c.add(Yn(`body`,[0,.1,.2],[0,.25,.355],.1,.085,{k:.08,anchor:[0,.1,.18],reach:.18,name:`neck`}));let l=rn(`body`,[0,.36,-.1],{R0:.2,b:.14,a0:.15,turns:1.85,c:.45,sx:1.2,k:.06,anchor:[0,.16,-.02],reach:.3,name:`shell`});c.add(l,sn(`body`,[0,.36,-.1],[.08,.072,.072],{k:.03,name:`shellCore`})),e.seat=0,G(e,{r:[.112,.106,.108],at:[0,.07,.03],melt:.06}),U(e),or(e,{w:.24,y:-.4,curve:.13,r:.0055});let u=sr(e,0,-.18,.004);An(e.head,e.rnd,{base:`ico1`,r:[.022,.016,.016],pos:W(u),jitter:.02,color:H(r,nr,.15)}),e.nose=[u.x,u.y,u.z+.012];let d=new R(0,.17,.03);for(let t of[-1,1]){let n=t>0?`L`:`R`,i=sr(e,t*.32,.72,-.015);Bn(e,`stalk${n}`,`neck`,W(i));let a=d.clone().add(new R(t*.025,0,0));Bn(e,`blink${n}`,`stalk${n}`,W(a));let o=jn(e,`stalk${n}`,`stalk${n}`);dn(o,e.rnd,[0,0,0],W(a),.02,.015,r,{base:`limb5`}),An(o,e.rnd,{base:`ico1`,r:.032,pos:W(a),jitter:.04,color:r});let s=jn(e,`eye${n}`,`stalk${n}`,{bone:`blink${n}`,eyes:!0}),c=er(a.clone().add(new R(0,.004,.024)));An(s,e.rnd,{base:`ico1`,r:[.02,.022,.013],matrix:c,jitter:.02,color:Rn,tone:.1}),An(s,e.rnd,{base:`ico0`,r:.0065,matrix:Wn(c,[.006,.008,.011]),jitter:.01,color:`#fbf6ec`,tone:0})}e.blink=[`blinkL`,`blinkR`];let f=sr(e,.32,.72).add(d);e.eyeY=f.y,e.eyeX=f.x+.025,e.eyeR=.032,e.eyeZ=f.z+.035,rr(e,{color:r,len:.12,r:.03,rightOnly:!0}),e.front=.47;let p=l.unit,m=V(e,`shell`);return e.marks={base:r,marks:[{color:s,f:B(m,e=>.72-p(e.p).z,e=>.3-Math.abs(p(e.p).x))},{color:o,f:V(e,`shellCore`)},{color:o,f:B(m,e=>Math.sin(Math.PI*13*p(e.p).y))},{color:a,f:m},{color:i,f:B(V(e,`foot`,`tailFoot`,`neck`),e=>e.p.y-.02)}]},{legs:`none`,tendril:!0}},yl=(e,t,n)=>{let r=tn(e,t),i=Math.PI/180,a=n.map(([e,t,n])=>[Math.sin(e*i)*Math.sin(t*i),Math.cos(e*i),Math.sin(e*i)*Math.cos(t*i),n]);return B(V(e,t),e=>{let t=r(e).normalize(),n=1/0;for(let[e,r,i,o]of a)n=Math.min(n,Math.hypot(t.x-e,t.y-r,t.z-i)-o);return n})},bl=(e,t,n,r,i,a)=>B(V(e,...t),e=>-e.p.z,e=>Math.hypot((e.p.x-n)/i,(e.p.y-r)/a)-1),xl=(e,t,n,r,i={})=>{let a=new R(...e.joints.neck),o=a.clone().add(new R(...e.shape.hc));t.forEach(([t,s,c],l)=>{for(let u of t?[-1,1]:[1]){let d=sr(e,u*t,s).add(a),f=i.along&&new R(u*i.along[0],i.along[1],i.along[2]);bn(e,{bone:`neck`,from:o,dir:d.sub(o),r:c,color:n,stretch:i.stretch,along:f,sides:i.sides,name:`${r}${l}${u>0?`L`:`R`}`})}})},Sl=(e,t,n,r,i,a,o={})=>{r.forEach(([r,s,c],l)=>{for(let u of r?[-1,1]:[1]){let d=new R(u*Math.sin(r)*Math.cos(s),Math.sin(s),-Math.cos(r)*Math.cos(s)),f=o.along&&new R(u*o.along[0],o.along[1],o.along[2]);bn(e,{bone:t,from:new R(...n),dir:d,r:c,color:i,stretch:o.stretch,along:f,sides:o.sides,name:`${a}${l}${u>0?`L`:`R`}`})}})},Cl=(e,t,n,r,i,a=`#fbf8f1`,o=`fang`)=>{let s=new R(...e.joints.neck);for(let c of[-1,1]){let l=sr(e,c*t,n),u=Zn(e,c*t,n),d=new R(0,-1,0).addScaledVector(u,.45).normalize();l.add(s);let f=[l.clone().addScaledVector(u,-.01),l.clone().addScaledVector(d,r*.45),l.clone().addScaledVector(d,r)];Nn(e,{bone:`neck`,pts:f,w:[i,i*.8,0],t:[i*.7,i*.55,0],across:new R(1,0,0),colors:[a,a],name:`${o}${c>0?`L`:`R`}`})}},wl=(e,t,n,r,i,a,o,s,c,l=7)=>Pl(i).forEach((i,u)=>{a(i)&&bn(e,{bone:t,from:new R(...n),dir:new R(i.x*r[0],i.y*r[1],i.z*r[2]),r:o*(.8+u*7%5*.1),color:s,sides:l,name:`${c}${u}`})}),Tl=(e,t)=>{let n=new R(...e.joints.neck),r=new R(0,-Math.sin(t.drop),Math.cos(t.drop)),i=sr(e,0,t.dy,-.01).add(n).addScaledVector(r,t.len*t.at);for(let n of[-1,1])bn(e,{bone:`neck`,from:i.clone().add(new R(n*t.gap,0,0)),dir:new R(0,1,0),r:t.r,stretch:1.6,along:r,color:t.color,sides:7,name:`nostril${n>0?`L`:`R`}`})},El=(e,t)=>{let n=H(t.coat,`#f2efe8`,.85),r=H(t.coat,nr,.4);e.joints.neck=[0,.5,.05],e.joints.shoulder=[.19,.4,.08],e.joints.hip=[.1,.15,-.02],e.joints.tail=[0,.22,-.18],On(e,{belly:[[0,.28,-.02],[.23,.26,.21]],chest:[[0,.44,.03],[.2,.16,.19]],melt:.2}),G(e,{r:[.24,.21,.25],at:[0,.15,.05],melt:.18});let i=_n(e,{dy:-.02,len:.08,ra:.15,rb:.1,drop:.01,squash:[1.1,.72,1],melt:.08});vn(e,`body`,[0,.47,-.14],{len:.21,w:.04,d:.1,rot:[-.95,0,0],name:`dorsal`,melt:.05}),Qn(e,{len:.3,w:.09,d:.04,taper:.7,fwd:.3,out:.58}),an(e,{r0:.06,r1:.05,foot:[.06,.035,.08]});let a=fl(.3,[0,-.05,-1],[.35,0,0],.1,[1,.8,.55,.4]),o=Fn(e,a),s=a.pts[a.pts.length-1],c=[e.joints.tail[0]+s[0],e.joints.tail[1]+s[1],e.joints.tail[2]+s[2]];vn(e,`tail2`,c,{len:.2,w:.04,d:.065,rot:[-.75,0,0],name:`tailFinUp`}),vn(e,`tail2`,c,{len:.12,w:.04,d:.055,rot:[-2.3,0,0],name:`tailFinDown`}),U(e),Hn(e,{x:.45,y:.15,size:.9,wide:1.1,slant:.1,color:`#141018`}),or(e,{w:.4,y:-.42,curve:.12,r:.008,out:.004}),Cl(e,.08,-.41,.03,.012,`#fbf8f1`,`tooth`),Cl(e,.2,-.385,.025,.0105,`#fbf8f1`,`toothB`);for(let n of[-1,1])[-.03,.035,.1].forEach((r,i)=>{bn(e,{bone:`body`,from:new R(0,.49,r),dir:new R(n,-.1,0),r:.011,stretch:3.6,along:new R(0,1,.3),color:H(t.coat,nr,.7),sides:8,name:`gill${n>0?`L`:`R`}${i}`})});e.nose=i.nose;let l=tn(e,`head`);return e.marks={base:t.coat,marks:[{color:n,f:B(V(e,`muzzle`),e=>e.p.y-(i.mid(e.p)-i.r*.15))},{color:n,f:B(V(e,`head`),e=>l(e).y+.12-l(e).z*.38,e=>-l(e).z-.25)},{color:n,f:bl(e,[`belly`,`chest`],0,.3,.17,.27)},{color:r,f:V(e,`dorsal`,`tailFinUp`,`tailFinDown`)},{color:n,f:B(V(e,/^leg/),e=>e.p.y-.03)},{color:n,f:B(V(e,/^tail\d/),e=>-.02-(e.p.y-.22)+ +(o(e.p)>2))}]},{aquatic:!0}},Dl=(e,t)=>{let n=H(t.coat,`#ffffff`,.5),r=H(t.coat,`#3a2a60`,.35);e.joints.neck=[0,.42,0],e.joints.shoulder=[.05,.32,.06],e.joints.hip=[.1,.36,0],e.joints.tail=[0,.4,-.1],On(e,{belly:[[0,.4,0],[.13,.07,.13]],chest:[[0,.43,0],[.1,.05,.1]]}),G(e,{r:[.33,.29,.33],at:[0,.14,0],melt:.06});let i=fn(e),a=[0,e.joints.neck[1]+.14,0];for(let e=0;e<12;e++){let t=e/12*Math.PI*2;i.add(sn(`neck`,[Math.cos(t)*.31,a[1]-.06,Math.sin(t)*.31],[.055,.04,.055],{k:.03,name:`rim`}))}Jn(e,{len:.22,r0:.05,r1:.035,paw:[.04,.035,.04],fwd:.25,out:.08}),Ln(e,{count:3,len:.4,r0:.05,r1:.04,root:[0,.38,0],rim:.23,spread:2.6,hang:.85,curl:.12,wave:.03,melt:.03}),U(e),e.front=.28,e.sipLow=!0,Hn(e,{x:.3,y:-.12,size:1.1,wide:1,slant:0,color:`#1c1428`}),or(e,{w:.14,y:-.32,curve:.08,r:.006,color:r});let o=e.shape.hr,s=Math.PI/180;return[[18,150,.06],[45,45,.048],[45,-45,.048],[52,115,.054],[52,-115,.054],[58,180,.058],[82,80,.042],[82,-80,.042],[86,145,.045],[86,-145,.045]].forEach(([n,r,i],c)=>{let l=new R(Math.sin(n*s)*Math.sin(r*s)*o[0],Math.cos(n*s)*o[1],Math.sin(n*s)*Math.cos(r*s)*o[2]);bn(e,{bone:`neck`,from:new R(0,a[1],0),dir:l,r:i,color:H(t.coat,`#ffffff`,.55),sides:12,name:`dome${c}`})}),e.marks={base:t.coat,marks:[{color:n,f:V(e,`rim`)},{color:n,f:V(e,/^arm/,/^fore/)},{color:H(t.coat,n,.5),f:B(V(e,/^leg/),e=>e.p.y-.12)}]},{aquatic:!0,legs:`tentacles`,hover:.3,jelly:!0}},Ol=(e,t)=>{e.joints.neck=[0,.3,0],e.joints.shoulder=[.13,.26,.12],e.joints.hip=[.1,.18,-.02],e.joints.tail=[0,.25,-.18],On(e,{belly:[[0,.22,0],[.22,.14,.2]],chest:[[0,.3,.02],[.2,.1,.18]]}),G(e,{r:[.29,.31,.27],at:[0,.22,-.03],melt:.12});let n={len:.24,r0:.055,r1:.032,paw:[.035,.03,.04],fwd:.45,out:.35},r={count:3,len:.46,r0:.064,r1:.034,root:[.12,.15,-.02],spread:2.4,hang:.4,coil:2.7};return Jn(e,n),Ln(e,r),fn(e).add(sn(`body`,[0,.12,-.02],[.25,.045,.23],{k:.06,name:`skirt`})),U(e),gn(e,r,n,H(t.coat,`#fff3ec`,.55)),Hn(e,{x:.34,y:-.12,size:1.35,wide:1.05,slant:.05,color:`#1c1420`}),or(e,{w:.16,y:-.42,curve:.08,r:.006}),Sl(e,`neck`,Nl(e.joints.neck,[0,.22,-.03]),[[0,1.15,.05],[.55,.6,.045],[0,.3,.05],[1.05,.2,.04],[1.25,.8,.042],[.5,-.1,.038],[1.85,.55,.036],[.15,-.45,.034]],H(t.coat,`#fff3ec`,.4),`freckle`),e.marks={base:t.coat,marks:[]},{aquatic:!0,legs:`tentacles`}},kl=(e,t)=>{let n=`#f2efe6`,r=H(t.coat,`#121419`,.22);e.joints.neck=[0,.6,.03],e.joints.shoulder=[.185,.5,0],e.joints.hip=[.085,.12,.03],e.joints.tail=[0,.14,-.15],On(e,{belly:[[0,.31,.02],[.225,.3,.2]],chest:[[0,.5,.02],[.185,.16,.165]],melt:.18}),G(e,{r:[.2,.19,.19],at:[0,.13,.02],melt:.14});let i=nn(e,{dy:-.08,len:.1,w:.03,h:.028,drop:.25});Qn(e,{len:.32,w:.08,d:.027,taper:.75,fwd:-.06,out:.26}),an(e,{r0:.05,r1:.04,foot:[.068,.024,.09],fwd:.07}),fn(e).add(sn(`tail`,Nl(e.joints.tail,[0,-.05,-.03]),[.05,.024,.052],{rot:[-.95,0,0],k:.05,anchor:e.joints.tail,reach:.12,name:`tailFan`})),U(e),Hn(e,{x:.38,y:.14,size:.9,wide:1,slant:0,color:`#141018`,ring:n,ringSize:1.55}),e.nose=i;let a=tn(e,`head`),o=e.joints.neck,s=[1.05,1.3,1.32,1.2,1,.9];return e.marks={base:t.coat,marks:[{color:`#e8892e`,f:V(e,`beak`,/^leg/)},{color:r,f:V(e,`armL`,`armLPaw`,`armR`,`armRPaw`)},{color:`#f2c14e`,f:e=>{if(Math.abs(e.p.x)<.1)return 1;let t=on(e.p.z,e.p.y,o[2]+.01,o[1]+.1,o[2]+.09,o[1]-.02);return t.d-(.045-.025*t.t)}},{color:n,f:B(V(e,`head`,`belly`,`chest`),e=>Math.atan2(Math.abs(e.p.x),e.p.z+.02)-dl(s,Ke.clamp(e.p.y/.66,0,1)),e=>{let t=a(e);return t.y+.1+.42*Math.abs(t.x)})}]},{aquatic:!0}},Al=(e,t)=>{let n=`#e8892e`,r=H(t.coat,`#ffffff`,.35);e.joints.neck=[0,.56,.05],e.joints.shoulder=[.19,.45,-.02],e.joints.hip=[.08,.12,.02],e.joints.tail=[0,.22,-.2],On(e,{belly:[[0,.3,-.02],[.24,.28,.22]],chest:[[0,.46,.05],[.19,.14,.17]],melt:.18}),G(e,{r:[.2,.19,.19],at:[0,.16,.03],melt:.14});let i=nn(e,{dy:-.12,len:.13,w:.075,h:.028,drop:.12,flat:!0}),a={dy:-.12,len:.13,drop:.12};vn(e,`neck`,W(sr(e,0,.92,-.02).add(new R(...e.joints.neck))),{len:.08,w:.025,d:.015,rot:[-.5,0,0],name:`tuft`,melt:.02}),Qn(e,{len:.4,w:.14,d:.04,fwd:-.05,out:.18}),an(e,{r0:.045,r1:.04,foot:[.065,.025,.09],fwd:.06}),vn(e,`tail`,e.joints.tail,{len:.13,w:.08,d:.024,rot:[-.65,0,0],name:`tailFan`}),U(e),Hn(e,{x:.38,y:.18,size:.9,wide:1,slant:0,color:`#141018`}),Tl(e,{...a,at:.42,gap:.022,r:.0095,color:H(n,`#5a2a10`,.55)});let o=H(t.coat,nr,.32);for(let t of[`L`,`R`]){let n=fn(e).named(`arm${t}Paw`).c;[-.5,0,.5].forEach((r,i)=>{let a=new R((t===`L`?1:-1)*(.25+r*.3),-.55+r*.35,-1).normalize(),s=In(e,n,a);if(!s)return;let c=.085-Math.abs(r)*.03;Nn(e,{bone:`fore${t}`,pts:[s.p.clone().addScaledVector(a,-.02),s.p.clone().addScaledVector(a,c*.5),s.p.clone().addScaledVector(a,c)],w:[.024,.02,0],t:[.006,.005,0],across:new R(1,0,0).cross(a).normalize(),colors:[o,o],name:`quill${t}${i}`})})}return e.nose=i,e.marks={base:t.coat,marks:[{color:n,f:V(e,`beak`,/^leg/)},{color:H(t.coat,nr,.12),f:V(e,`armL`,`armLPaw`,`armR`,`armRPaw`)},{color:r,f:bl(e,[`belly`,`chest`],0,.3,.17,.22)}]},{aquatic:!0}},jl=(e,t)=>{let n=H(t.coat,`#c98593`,.42),r=H(t.coat,`#c8a890`,.45),i=H(t.coat,$n,.6);e.joints.neck=[0,.5,.02],e.joints.shoulder=[.12,.45,0],e.joints.hip=[.07,.2,-.01],e.joints.tail=[0,.2,-.12],On(e,{belly:[[0,.33,0],[.17,.2,.15]],chest:[[0,.44,.02],[.15,.1,.14]]}),G(e,{r:[.22,.2,.2],at:[0,.15,.03],cheeks:[[.1,-.08,.03],[.08,.07,.08]]});let a=_n(e,{dy:-.3,len:.04,ra:.075,rb:.06,drop:0,squash:[1.1,.85,1]});un(e,{x:.5,y:.62,w:.095,h:.22,d:.035,splay:.42,rake:.05,cup:.5,notch:!0}),pn(e,{len:.46,span:.3,d:.022,fingers:[.4,.66,.9],elbow:.34}),an(e,{r0:.032,r1:.026,foot:[.035,.02,.05]}),U(e),Hn(e,{x:.36,y:.08,size:1.1,wide:1,slant:.05,color:`#140c10`}),zn(e,`#3a2a30`,pl(e,a.nose,.004),.02,.016),or(e,{w:.18,y:-.55,curve:.08,r:.006}),Cl(e,.075,-.535,.03,.0085);let o=[`earL`,`earR`].map(t=>mn(e,t));return e.marks={base:t.coat,marks:[{color:i,f:wn(...o.map(e=>e.inner))},{color:n,f:V(e,`armLWeb`,`armRWeb`,`armLHand`,`armRHand`)},{color:r,f:V(e,`muzzle`)},{color:r,f:bl(e,[`belly`,`chest`],0,.36,.11,.15)}]},{hover:.22,flaps:!0}},Ml=(e,t)=>{let n=H(t.coat,`#fff6c8`,.6),r=H(t.coat,nr,.36);e.joints.neck=[0,.34,.08],e.joints.shoulder=[.15,.3,.12],e.joints.hip=[.14,.14,-.06],e.joints.tail=[0,.15,-.2],On(e,{belly:[[0,.2,-.04],[.24,.19,.22]],chest:[[0,.3,.04],[.2,.12,.18]],haunch:[[.15,.14,-.08],[.1,.1,.15]]}),G(e,{r:[.27,.16,.22],at:[0,.1,.05],melt:.12});let i=fn(e),a=new R(...e.joints.neck).add(new R(0,.1,.05));for(let e of[-1,1])i.add(sn(`neck`,[e*.14,a.y+.12,a.z+.05],[.075,.07,.07],{k:.05,name:e>0?`moundL`:`moundR`}));return Bn(e,`throat`,`neck`,[0,-.02,.15]),i.add(sn(`throat`,[0,e.joints.neck[1]-.02,e.joints.neck[2]+.15],[.13,.06,.08],{k:.04,anchor:[0,e.joints.neck[1]-.02,e.joints.neck[2]+.15],reach:.12,name:`throat`})),Jn(e,{len:.2,r0:.045,r1:.035,paw:[.045,.02,.05],fwd:.5,out:.25}),an(e,{r0:.055,r1:.045,foot:[.07,.024,.11],fwd:.06}),U(e),Hn(e,{x:.52,y:.62,size:1.05,wide:1.05,slant:0,color:`#141018`}),or(e,{w:.6,y:-.25,curve:.08,r:.0075}),xl(e,[[.9,.2,.034]],H(t.coat,`#4a3a20`,.4),`drum`),Sl(e,`body`,[0,.22,-.02],[[0,.55,.038],[.42,.2,.033],[.5,.85,.03],[.95,.5,.03],[.85,-.05,.028],[1.35,.22,.025]],r,`spot`),Sl(e,`neck`,Nl(e.joints.neck,[0,.1,.05]),[[0,.75,.03],[.55,.45,.024]],r,`headSpot`),e.marks={base:t.coat,marks:[{color:n,f:V(e,`throat`)},{color:n,f:bl(e,[`belly`,`chest`],0,.2,.17,.16)}]},{aquatic:!0}},Nl=(e,t)=>[e[0]+t[0],e[1]+t[1],e[2]+t[2]];function Pl(e){return Array.from({length:e},(t,n)=>{let r=1-2*(n+.5)/e,i=Math.sqrt(1-r*r),a=n*Math.PI*(3-Math.sqrt(5));return new R(Math.cos(a)*i,r,Math.sin(a)*i)})}function Fl(e,t,n,r,i,a=.03){let o=fn(e);for(let e=0;e+1<n.length;e++)o.add(Yn(t,n[e],n[e+1],r[e],r[e+1],{k:e===0?a:.02,anchor:n[0],reach:.08,name:`${i}${e}`,thin:!0}))}var Il=(e,t)=>{let n=H(t.coat,`#ffffff`,.45),r=H(t.coat,`#5a2a4a`,.38);e.joints.neck=[0,.36,.02],e.joints.shoulder=[.13,.33,.1],e.joints.hip=[.1,.18,-.02],e.joints.tail=[0,.3,-.15],On(e,{belly:[[0,.25,0],[.17,.11,.16]],chest:[[0,.33,.02],[.16,.08,.15]]}),G(e,{r:[.21,.17,.19],at:[0,.1,.03],melt:.1});let i=fn(e),a=e.joints.neck;return i.add(sn(`neck`,[0,a[1]+.31,a[2]-.05],[.145,.27,.135],{k:.08,name:`mantle`})),i.add(Yn(`neck`,[0,a[1]+.45,a[2]-.05],[0,a[1]+.68,a[2]-.06],.105,.025,{k:.06,name:`mantleTip`})),vn(e,`neck`,[.07,a[1]+.5,a[2]-.05],{len:.14,w:.08,d:.034,rot:[0,0,-.8],name:`finL`,melt:.04}),vn(e,`neck`,[-.07,a[1]+.5,a[2]-.05],{len:.14,w:.08,d:.034,rot:[0,0,.8],name:`finR`,melt:.04}),Jn(e,{len:.24,r0:.045,r1:.034,paw:[.036,.03,.045],fwd:.75,out:.3}),e.lift=.12,Ln(e,{count:3,len:.24,r0:.042,r1:.03,root:[.08,.15,-.01],rim:.08,spread:2.3,hang:.7,curl:.06,melt:.09}),U(e),Hn(e,{x:.5,y:.02,size:1.35,wide:1,slant:0,color:`#141018`,ring:n,ringSize:1.4}),or(e,{w:.12,y:-.42,curve:.06,r:.006}),wl(e,`neck`,[0,a[1]+.31,a[2]-.05],[.145,.27,.135],44,e=>Math.abs(e.y-.19)>.2&&e.y<.5&&e.y>(e.z>0?-.15:-.45),.023,r,`spot`),e.marks={base:t.coat,marks:[{color:r,f:V(e,`finL`,`finR`,`mantleTip`)},{color:r,f:B(V(e,`mantle`),e=>Math.abs(e.p.y-(a[1]+.36))-.035)},{color:n,f:B(V(e,/^leg/,/^fore/,`armLPaw`,`armRPaw`),e=>e.p.y-.05)}]},{aquatic:!0,legs:`tentacles`}},Ll=(e,t)=>{let n=H(t.coat,Gn,.72),r=H(t.coat,`#2e2016`,.5),i=H(r,Gn,.42);e.joints.neck=[0,.44,.07],e.joints.shoulder=[.14,.34,.13],e.joints.hip=[.1,.13,-.02],e.joints.tail=[0,.15,-.2];let a=[0,.28,-.03],o=[.23,.21,.2];On(e,{belly:[a,o],chest:[[0,.38,.05],[.17,.12,.16]],melt:.18});let s=[0,.1,.07],c=[.17,.15,.16];G(e,{r:c,at:s,melt:.12});let l=_n(e,{dy:-.22,len:.1,ra:.065,rb:.03,drop:.03,squash:[1,.9,1],thin:!0});un(e,{x:.62,y:.42,w:.05,h:.06,d:.03,round:!0,splay:.3,rake:.1,cup:.5}),Jn(e,{len:.13,r0:.04,r1:.035,paw:[.036,.026,.042],fwd:.7,out:.2}),an(e,{r0:.046,r1:.04,foot:[.046,.026,.07],fwd:.04}),U(e);let u=Nl(e.joints.neck,s),d=(e,t=0)=>Math.max(e.z-.3-t,-.15-t-e.y),f=(e,t=0)=>Math.max(e.z+.05-e.y*.4-t,-.2-t-e.y),p=new R(0,u[1]+.06,u[2]+.2),m=0,h=(t,n,a,o,s)=>{for(let c of Pl(o)){if(s(c)>-.04)continue;let o=In(e,new R(...n),new R(c.x*a[0],c.y*a[1],c.z*a[2]));if(!o)continue;let{p:l,n:u}=o,d=l.clone().sub(p);d.addScaledVector(u,-d.dot(u)).normalize();let f=d.multiplyScalar(Math.cos(.6)).addScaledVector(u,Math.sin(.6)).normalize(),h=.15+m*7%5*.008,g=[l.clone().addScaledVector(u,-.03),l.clone().addScaledVector(f,h*.55),l.clone().addScaledVector(f,h)],_=m%3==0;Nn(e,{bone:t,pts:g,w:[.036,.02,0],t:[.017,.011,0],across:new R().crossVectors(u,f),colors:[r,_?i:r],name:`spike${m++}`})}};h(`body`,a,o,90,d),h(`neck`,u,c,50,f),Hn(e,{x:.4,y:.06,size:.85,wide:1,slant:.05,color:`#140e0c`}),zn(e,Rn,pl(e,l.nose),.024,.018);let g=[`earL`,`earR`].map(t=>mn(e,t)),_=(e,t,n)=>new R((e.p.x-t[0])/n[0],(e.p.y-t[1])/n[1],(e.p.z-t[2])/n[2]).normalize();return e.marks={base:n,marks:[{color:H(t.coat,`#e8a0a0`,.6),f:wn(...g.map(e=>e.inner))},{color:H(n,r,.6),f:V(e,`armLPaw`,`armRPaw`)},{color:H(n,r,.6),f:B(V(e,/^leg/),e=>e.p.y-.045)},{color:r,f:B(V(e,`belly`,`chest`),e=>d(_(e,a,o),.06)*.2)},{color:r,f:B(V(e,`head`),e=>f(_(e,u,c),.06)*.15)}]},{}},Rl=(e,t)=>{let n=H(t.coat,`#c0306a`,.55),r=H(n,`#d02060`,.3),i=H(t.coat,`#ffffff`,.4);e.joints.neck=[0,.5,.06],e.joints.shoulder=[.15,.4,.1],e.joints.hip=[.1,.15,-.04],e.joints.tail=[0,.2,-.18],On(e,{belly:[[0,.28,-.02],[.19,.22,.18]],chest:[[0,.42,.04],[.16,.12,.15]]});let a=[0,.1,.05];G(e,{r:[.25,.155,.2],at:a,melt:.12});let o=Nl(e.joints.neck,a);for(let t of[-1,1])for(let n=0;n<3;n++){let i=.35+n*.5,a=[t*.2,o[1]-.03+n*.045,o[2]-.06],s=[t*(.2+Math.cos(i)*.08),a[1]+Math.sin(i)*.08,a[2]-.035],c=[t*(.2+Math.cos(i+.25)*.15),a[1]+Math.sin(i+.25)*.15,a[2]-.06];Fl(e,`neck`,[a,s,c],[.032,.03,.028],`gill${t>0?`L`:`R`}${n}_`);let l=new R(...a),u=new R(...c).sub(l),d=u.length();u.normalize();let f=new R(-u.y,u.x,0).normalize();[.32,.52,.72,.92].forEach((i,a)=>{let o=l.clone().addScaledVector(u,d*i),s=f.clone().multiplyScalar(a%2?1:-1).addScaledVector(u,.75).add(new R(0,0,.35)).normalize();Nn(e,{bone:`neck`,pts:[o,o.clone().addScaledVector(s,.046),o.clone().addScaledVector(s,.072)],w:[.008,.0065,0],t:[.0055,.0045,0],across:new R(0,0,1),colors:[r,r],name:`frill${t>0?`L`:`R`}${n}_${a}`})})}Jn(e,{len:.17,r0:.04,r1:.033,paw:[.042,.02,.045],fwd:.5,out:.3}),an(e,{r0:.05,r1:.042,foot:[.05,.022,.07]});let s=fl(.46,[0,-.35,-1],[.25,.2,0],.085,[1,.85,.7,.5,.3]),c=Fn(e,s),l=s.pts[Math.round(s.pts.length*.55)];return vn(e,`tail1`,Nl(e.joints.tail,l),{len:.07,w:.04,d:.12,rot:[.25,0,0],name:`tailFin`,melt:.04}),U(e),Hn(e,{x:.55,y:.18,size:.7,wide:1,slant:0,color:`#141018`}),or(e,{w:.55,y:-.32,curve:.1,r:.0065}),e.marks={base:t.coat,marks:[{color:n,f:V(e,/^gill/)},{color:i,f:V(e,`tailFin`)},{color:i,f:bl(e,[`belly`,`chest`],0,.3,.14,.2)},{color:i,f:B(V(e,/^tail\d/),e=>.12-c(e.p)+ +(e.p.y>.2))}]},{aquatic:!0}},zl=(e,t)=>{let n=H(t.coat,Gn,.6),r=H(t.coat,`#5a3424`,.5);e.joints.neck=[0,.5,.06],e.joints.shoulder=[.12,.42,.08],e.joints.hip=[.09,.16,-.03],e.joints.tail=[0,.19,-.15],On(e,{belly:[[0,.28,-.02],[.16,.2,.15]],chest:[[0,.42,.03],[.13,.11,.12]]}),G(e,{r:[.2,.15,.19],at:[0,.12,.06],melt:.1}),_n(e,{dy:-.2,len:.06,ra:.12,rb:.085,drop:.02,squash:[1.2,.62,1]}),Jn(e,{len:.2,r0:.035,r1:.03,paw:[.052,.02,.05],fwd:.45,out:.35}),an(e,{r0:.045,r1:.036,foot:[.06,.02,.07]});let i=Fn(e,fl(.6,[0,-.45,-1],[.9,.35,0],.08,[1,.92,.8,.62,.45,.32]));return U(e),Hn(e,{x:.5,y:.3,size:1.5,wide:1,slant:0,color:`#1a1410`,ring:`#e2b040`,ringSize:1.3}),or(e,{w:.6,y:-.3,curve:.1,r:.006}),wl(e,`neck`,Nl(e.joints.neck,[0,.12,.06]),[.2,.15,.19],40,e=>e.z<.3&&e.y>-.1,.017,r,`headSpot`),wl(e,`body`,[0,.3,-.02],[.16,.22,.15],44,e=>e.z<.15&&e.y>(Math.abs(e.x)<.5?-.25:-.6)&&e.y<.85,.018,r,`spot`),e.marks={base:t.coat,marks:[{color:n,f:bl(e,[`belly`,`chest`],0,.3,.12,.2)},{color:r,f:B(V(e,/^tail\d/),e=>.55-Math.sin(i(e.p)*Math.PI*7))}]},{}},Bl=(e,t)=>{let n=H(t.coat,`#e8b8a8`,.65),r=H(t.coat,nr,.75),i=[H(t.coat,`#f2c890`,.22),t.coat,H(t.coat,`#6a2e12`,.2)];e.joints.neck=[0,.6,.08],e.joints.shoulder=[.17,.48,.13],e.joints.hip=[.12,.2,-.05],e.joints.tail=[0,.32,-.24];let a=[0,.36,-.04],o=[.25,.24,.24],s=[.13,.22,-.08];On(e,{belly:[a,o],chest:[[0,.5,.05],[.2,.15,.19]],haunch:[s,[.11,.13,.16]],melt:.2});let c=[0,.11,.08];G(e,{r:[.2,.165,.175],at:c,melt:.12});let l=_n(e,{dy:-.36,len:.08,ra:.12,rb:.105,drop:.03,squash:[1.15,.8,1]});un(e,{x:.85,y:.15,w:.065,h:.11,d:.03,splay:1.35,rake:.1,cup:.5,round:!0});let u=fn(e),d=Nl(e.joints.neck,c);for(let t of[-1,1])Fl(e,`neck`,[[t*.13,d[1]+.12,d[2]-.02],[t*.26,d[1]+.13,d[2]-.01],[t*.36,d[1]+.2,d[2]],[t*.39,d[1]+.3,d[2]+.02]],[.042,.036,.029,.021],`horn${t>0?`L`:`R`}_`,.04);u.add(sn(`neck`,[0,d[1]+.11,d[2]+.06],[.17,.08,.13],{k:.06,name:`forelock`})),Jn(e,{len:.3,r0:.07,r1:.06,paw:[.06,.048,.065],fwd:.3,out:.16}),an(e,{r0:.08,r1:.066,foot:[.066,.048,.08]});let f=Fn(e,fl(.3,[0,-.85,-.5],[0,0,0],.035,[1,.9,.9,1.5,1.9]));U(e);let p=0,m=(t,n,r,a,o=.036,s=new R(0,-1,0))=>{let c=In(e,n,r);if(!c)return;let{p:l,n:u}=c,d=new R(u.x,0,u.z).normalize(),f=s.clone().addScaledVector(d,.45).normalize(),m=[l.clone().addScaledVector(u,-.025),l.clone().addScaledVector(f,a*.55).addScaledVector(d,.012),l.clone().addScaledVector(f,a).addScaledVector(d,.03)],h=i[(p*5+1)%3];Nn(e,{bone:t,pts:m,w:[o,o*.75,0],t:[.014,.011,0],across:new R().crossVectors(f,d),colors:[h,h],name:`lock${p++}`})},h=new R(...a);[.5,.12,-.25].forEach((e,t)=>{let n=12+t;for(let r=0;r<n;r++){let i=(r+t%2*.5)/n*Math.PI*2,a=new R(Math.sin(i)*o[0],e*o[1],Math.cos(i)*o[2]);m(`body`,h,a,t===0?.15:.17,.04)}});for(let e of[-1,1]){let t=new R(e*s[0],s[1],s[2]);for(let n=0;n<3;n++)m(`body`,t,new R(e,.3-n*.3,-.4+n*.35),.13,.036)}let g=new R(...d),_=(e,t,n)=>m(`neck`,g.clone().add(new R(0,t,0)),new R(e,.25,1),n,.034,new R(e*.4,-1,.25));for(let e of[-.95,-.6,-.15,.15,.6,.95])_(e,.08,.19);for(let e of[-.8,-.38,.38,.8])_(e,.1,.12);for(let e of[-1,1])for(let t=0;t<3;t++)m(`neck`,g,new R(e,-.25-t*.25,.55-t*.2),.12,.032);return Hn(e,{x:.38,y:-.2,size:.8,wide:1.15,slant:.05,color:`#1a1412`}),zn(e,H(n,nr,.45),pl(e,l.nose),.04,.022),e.marks={base:t.coat,marks:[{color:`#4a3e34`,f:B(V(e,/^horn/),e=>d[1]+.25-e.p.y)},{color:`#ece0c4`,f:V(e,/^horn/)},{color:n,f:B(V(e,`muzzle`),e=>-e.p.z+d[2]+.2)},{color:i[0],f:V(e,`forelock`)},{color:r,f:B(V(e,/^leg/),e=>e.p.y-.06)},{color:r,f:B(V(e,`armLPaw`,`armRPaw`),t=>t.p.y-(e.joints.shoulder[1]-.36))},{color:i[2],f:B(V(e,/^tail\d/),e=>.75-f(e.p))}]},{}},Vl=(e,t)=>{let n=H(t.coat,Gn,.85),r=H(t.coat,`#2b211d`,.72);e.joints.neck=[0,.66,.07],e.joints.shoulder=[.11,.52,.12],e.joints.hip=[.09,.24,-.06],e.joints.tail=[0,.36,-.2],On(e,{belly:[[0,.39,-.06],[.17,.2,.17]],chest:[[0,.52,.04],[.14,.14,.13]],haunch:[[.1,.28,-.08],[.09,.11,.13]],ruff:[[0,.62,.06],[.09,.09,.09]],melt:.2});let i=[0,.15,.06];G(e,{r:[.15,.145,.155],at:i});let a=_n(e,{dy:-.3,len:.11,ra:.075,rb:.052,drop:.045,squash:[1,.85,1],thin:!0});un(e,{x:.8,y:.3,w:.065,h:.17,d:.035,splay:1.05,rake:.12,cup:.55,long:!0});let o=Nl(e.joints.neck,i);for(let t of[-1,1]){let n=t>0?`antlerL`:`antlerR`,r=[t*.07,o[1]+.12,o[2]-.02],i=[t*.12,o[1]+.22,o[2]-.04];Bn(e,n,`neck`,[r[0]-e.joints.neck[0],r[1]-e.joints.neck[1],r[2]-e.joints.neck[2]]),Fl(e,n,[r,i,[t*.17,o[1]+.31,o[2]-.07]],[.027,.024,.021],`${n}_`),Fl(e,n,[i,[t*.13,o[1]+.28,o[2]+.04]],[.024,.021],`${n}T`)}Jn(e,{len:.32,r0:.045,r1:.036,paw:[.036,.032,.045],fwd:.3,out:.12}),an(e,{r0:.05,r1:.036,foot:[.036,.032,.05]});let s=e.joints.tail;fn(e).add(sn(`tail`,[s[0],s[1]+.02,s[2]-.03],[.05,.065,.04],{k:.025,anchor:s,reach:.07,name:`bob`})),U(e),Hn(e,{x:.45,y:.1,size:1.1,wide:1.15,slant:.12,color:`#1a1210`}),zn(e,Rn,pl(e,a.nose),.026,.02);let c=[`earL`,`earR`].map(t=>mn(e,t)),l=[{a:.3,top:.6,n:5,r:.028},{a:.72,top:.565,n:4,r:.027},{a:1.12,top:.53,n:3,r:.022},{a:1.5,top:.5,n:3,r:.02}];for(let t of[-1,1])l.forEach(({a:r,top:i,n:a,r:o},s)=>{for(let c=0;c<a;c++){let a=i-c*.07,l=r+c%2*.06-.03;bn(e,{bone:`body`,from:new R(0,a,-.03),dir:new R(t*Math.sin(l),0,-Math.cos(l)),r:o,stretch:1.15,color:n,name:`spot${t>0?`L`:`R`}${s}_${c}`})}});let u=s[1]+.02;return e.marks={base:t.coat,marks:[{color:`#e4d6b8`,f:V(e,/^antler/)},{color:n,f:wn(...c.map(e=>e.inner))},{color:r,f:wn(...c.map(e=>e.back))},{color:n,f:B(V(e,`muzzle`),e=>e.p.y-(a.mid(e.p)-a.r*.2))},{color:n,f:B(V(e,`chest`,`ruff`),e=>-e.p.z,e=>Math.hypot(e.p.x/.07,(e.p.y-.6)/.06)-1)},{color:n,f:bl(e,[`belly`],0,.3,.1,.12)},{color:n,f:B(V(e,`bob`),e=>e.p.y-u+(e.p.z-s[2])*.6)},{color:n,f:B(V(e,`belly`,`haunchL`,`haunchR`),e=>e.p.z+.17,e=>Math.hypot(e.p.x/.075,(e.p.y-.33)/.075)-1)},{color:r,f:B(V(e,/^leg/),e=>e.p.y-.06)},{color:r,f:B(V(e,`armLPaw`,`armRPaw`),t=>t.p.y-(e.joints.shoulder[1]-.37))}]},{}},Hl=(e,t)=>{let n=H(t.coat,Gn,.7),r=H(t.coat,`#33241a`,.68);e.joints.neck=[0,.56,.05],e.joints.shoulder=[.17,.47,.06],e.joints.hip=[.1,.16,-.03],e.joints.tail=[0,.2,-.18],On(e,{belly:[[0,.32,-.03],[.21,.23,.19]],chest:[[0,.46,.03],[.18,.13,.16]],melt:.2}),G(e,{r:[.19,.17,.17],at:[0,.12,.06],melt:.12});let i=_n(e,{dy:-.26,len:.04,ra:.075,rb:.065,drop:.01,squash:[1.2,.85,1]});Jn(e,{len:.36,r0:.05,r1:.042,paw:[.045,.035,.05],fwd:.3,out:.32});let a=fn(e);for(let t of[`L`,`R`]){let n=a.named(`arm${t}Paw`).c;for(let r=-1;r<=1;r++){let i=[n.x+r*.025,n.y-.015,n.z+.025];Fl(e,`fore${t}`,[i,[i[0],i[1]-.05,i[2]+.025],[i[0],i[1]-.085,i[2]+.005]],[.018,.016,.014],`claw${t}${r+1}_`,.02)}}an(e,{r0:.055,r1:.046,foot:[.05,.03,.07]}),U(e),Hn(e,{x:.36,y:.08,size:.8,wide:1,slant:0,color:`#140e0c`}),zn(e,H(t.coat,`#1a1210`,.85),pl(e,i.nose),.03,.022),or(e,{w:.24,y:-.48,curve:.08,r:.006}),xl(e,[[.55,.04,.025]],r,`stripe`,{stretch:2.9,along:[1,-.22,0],sides:12});let o=tn(e,`head`),s=V(e,`head`,`muzzle`);return e.marks={base:t.coat,marks:[{color:`#ece2c8`,f:V(e,/^claw/)},{color:n,f:B(s,e=>.05-o(e).z)},{color:n,f:V(e,`muzzle`)}]},{sleepy:!0}},Ul=(e,t)=>{let n=H(t.coat,`#f2eee6`,.55),r=H(t.coat,nr,.35);e.joints.neck=[0,.56,.05],e.joints.shoulder=[.18,.44,.06],e.joints.hip=[.08,.1,-.02],e.joints.tail=[0,.12,-.18],On(e,{belly:[[0,.3,-.02],[.22,.28,.21]],chest:[[0,.46,.03],[.18,.15,.17]],melt:.2}),G(e,{r:[.18,.165,.17],at:[0,.13,.04],melt:.14});let i=_n(e,{dy:-.28,len:.05,ra:.085,rb:.07,drop:.015,squash:[1.25,.8,1]});Qn(e,{len:.28,w:.09,d:.03,taper:.75,fwd:.15,out:.32}),an(e,{r0:.05,r1:.045,foot:[.075,.024,.1],fwd:.02}),U(e),Hn(e,{x:.4,y:.1,size:1.25,wide:1,slant:0,color:`#120e10`}),zn(e,`#2a2224`,pl(e,i.nose),.028,.02),ir(e,t.coat,{len:.1,sweep:.15,color:`#e8e0d4`}),or(e,{w:.18,y:-.52,curve:.06,r:.006});let a=H(t.coat,nr,.42);return wl(e,`body`,[0,.33,-.02],[.22,.28,.21],46,e=>e.z<.25&&e.y<.75&&e.y>-.55,.017,a,`speck`),wl(e,`neck`,Nl(e.joints.neck,[0,.13,.04]),[.18,.165,.17],22,e=>e.z<.1&&e.y>-.1,.014,a,`headSpeck`),e.marks={base:t.coat,marks:[{color:n,f:V(e,`muzzle`)},{color:n,f:bl(e,[`belly`,`chest`],0,.32,.16,.26)},{color:r,f:B(V(e,/^leg/),e=>e.p.y-.05)}]},{aquatic:!0}},Wl=(e,t)=>{let n=H(t.coat,`#e8c8a0`,.45),r=H(t.coat,`#3a3034`,.6);e.joints.neck=[0,.52,.06],e.joints.shoulder=[.16,.42,.08],e.joints.hip=[.1,.14,-.03],e.joints.tail=[0,.2,-.2],On(e,{belly:[[0,.29,-.03],[.2,.25,.2]],chest:[[0,.43,.03],[.17,.13,.16]],melt:.2}),G(e,{r:[.17,.15,.16],at:[0,.12,.05],melt:.12});let i=nn(e,{dy:-.18,len:.16,w:.09,h:.028,flat:!0,drop:.12}),a={dy:-.18,len:.16,drop:.12};Jn(e,{len:.18,r0:.045,r1:.036,paw:[.05,.02,.05],fwd:.5,out:.3}),an(e,{r0:.05,r1:.042,foot:[.06,.022,.08]});let o=e.joints.tail;return fn(e).add(sn(`tail`,[o[0],o[1]-.06,o[2]-.13],[.12,.045,.16],{rot:[-.4,0,0],k:.05,anchor:o,reach:.12,name:`paddle`})),U(e),Hn(e,{x:.5,y:.25,size:.75,wide:1,slant:0,color:`#120e10`}),Tl(e,{...a,at:.78,gap:.02,r:.0085,color:`#1c181a`}),xl(e,[[.6,.12,.024]],n,`cheek`,{stretch:1.3,along:[1,.3,0]}),e.nose=i,e.marks={base:t.coat,marks:[{color:`#4a4448`,f:V(e,`beak`)},{color:r,f:V(e,`armLPaw`,`armRPaw`)},{color:r,f:B(V(e,/^leg/),e=>e.p.y-.045)},{color:n,f:bl(e,[`belly`,`chest`],0,.3,.15,.24)}]},{aquatic:!0}},Gl=(e,t)=>{let n=`#26242a`;e.joints.neck=[0,.58,.05],e.joints.shoulder=[.17,.48,.1],e.joints.hip=[.11,.17,-.04],e.joints.tail=[0,.2,-.22],On(e,{belly:[[0,.32,-.04],[.24,.26,.23]],chest:[[0,.48,.03],[.2,.15,.18]],haunch:[[.13,.18,-.06],[.11,.12,.15]],melt:.2}),G(e,{r:[.2,.18,.18],at:[0,.13,.06],cheeks:[[.12,-.06,.04],[.09,.08,.09]]});let r=_n(e,{dy:-.28,len:.05,ra:.08,rb:.065,drop:.02,squash:[1.15,.85,1]});un(e,{x:.62,y:.68,w:.065,h:.075,d:.035,round:!0,splay:.3,rake:.1}),Jn(e,{len:.27,r0:.07,r1:.06,paw:[.06,.045,.065],fwd:.35,out:.15}),an(e,{r0:.075,r1:.065,foot:[.065,.045,.085]});let i=e.joints.tail;fn(e).add(sn(`tail`,[i[0],i[1]+.01,i[2]-.02],[.05,.05,.04],{k:.025,anchor:i,reach:.07,name:`puff`})),U(e),Hn(e,{x:.38,y:.1,size:.85,wide:1,slant:.1,color:`#120e10`,ring:n,ringSize:1.8,out:.006}),zn(e,n,pl(e,r.nose),.032,.022);let a=tn(e,`head`);return e.marks={base:t.coat,marks:[{color:n,f:V(e,`earL`,`earR`)},{color:n,f:B(V(e,`head`,`cheekL`,`cheekR`),e=>{let t=a(e),n=Math.abs(t.x)-.38,r=t.y-.08,i=.5,o=n*Math.cos(i)+r*Math.sin(i),s=-n*Math.sin(i)+r*Math.cos(i);return Math.max(Math.hypot(o/.2,s/.29)-1,.2-t.z)})},{color:n,f:V(e,`armL`,`armR`,`foreL`,`foreR`,`armLPaw`,`armRPaw`)},{color:n,f:B(V(e,`chest`,`belly`),e=>Math.abs(e.p.y-.54-e.p.z*.25)-.075,e=>-Math.max(.05-e.p.z,Math.abs(e.p.x)-.13))},{color:n,f:V(e,/^leg/,`haunchL`,`haunchR`)}]},{}},Kl=(e,t)=>{let n=H(t.coat,`#e8d4b4`,.6),r=H(t.coat,nr,.3);e.joints.neck=[0,.66,.07],e.joints.shoulder=[.12,.54,.1],e.joints.hip=[.09,.16,-.03],e.joints.tail=[0,.18,-.16],On(e,{belly:[[0,.32,-.03],[.17,.28,.17]],chest:[[0,.53,.04],[.14,.15,.14]],melt:.22}),G(e,{r:[.15,.13,.15],at:[0,.11,.06]});let i=_n(e,{dy:-.22,len:.06,ra:.075,rb:.065,drop:.015,squash:[1.25,.82,1]});un(e,{x:.78,y:.5,w:.035,h:.04,d:.025,round:!0,splay:.6,rake:.1}),Jn(e,{len:.18,r0:.04,r1:.034,paw:[.04,.03,.045],fwd:.8,out:.15}),an(e,{r0:.05,r1:.042,foot:[.05,.024,.085]});let a=Fn(e,fl(.5,[0,-.6,-1],[.3,.45,0],.075,[1,.9,.75,.55,.35]));U(e),Hn(e,{x:.42,y:.12,size:.85,wide:1,slant:.05,color:`#120e10`}),zn(e,`#2a1e1a`,pl(e,i.nose),.028,.02),ir(e,t.coat,{len:.09,color:`#e8ddd0`}),or(e,{w:.16,y:-.5,curve:.06,r:.006});let o=tn(e,`head`);return e.marks={base:t.coat,marks:[{color:n,f:V(e,`muzzle`)},{color:n,f:B(V(e,`head`),e=>o(e).y+.1,e=>.1-o(e).z)},{color:n,f:B(V(e,`chest`,`belly`),e=>-e.p.z,e=>Math.hypot(e.p.x/.09,(e.p.y-.6)/.09)-1)},{color:r,f:V(e,`armLPaw`,`armRPaw`)},{color:r,f:B(V(e,/^leg/),e=>e.p.y-.045)},{color:r,f:B(V(e,/^tail\d/),e=>.55-a(e.p))}]},{aquatic:!0}},ql=(e,t)=>{let n=H(t.coat,nr,.45);e.joints.neck=[0,.58,.07],e.joints.shoulder=[.17,.46,.11],e.joints.hip=[.12,.18,-.05],e.joints.tail=[0,.24,-.25],On(e,{belly:[[0,.33,-.05],[.24,.27,.25]],chest:[[0,.47,.04],[.2,.15,.19]],haunch:[[.13,.2,-.08],[.11,.13,.16]],melt:.22}),G(e,{r:[.17,.17,.19],at:[0,.13,.08]});let r=_n(e,{dy:-.12,len:.12,ra:.13,rb:.12,drop:.05,squash:[.95,1.05,1]});un(e,{x:.55,y:.8,w:.045,h:.05,d:.03,round:!0,splay:.3,rake:.1}),Jn(e,{len:.27,r0:.065,r1:.055,paw:[.055,.04,.065],fwd:.3,out:.15}),an(e,{r0:.07,r1:.06,foot:[.06,.04,.08]}),U(e),Hn(e,{x:.5,y:.35,size:.7,wide:1,slant:0,color:`#140e0c`}),zn(e,n,pl(e,r.nose),.04,.02);let i=new R(...e.joints.neck),a=sr(e,0,-.12).add(i).clone().lerp(new R(...r.nose).add(i),.4);return bn(e,{bone:`neck`,from:a.add(new R(0,-.03,0)),dir:new R(0,1,.15),r:.032,stretch:1.45,along:new R(0,-.3,1),color:H(t.coat,nr,.5),name:`ridge`}),e.marks={base:t.coat,marks:[{color:n,f:V(e,`earL`,`earR`)},{color:n,f:B(V(e,/^leg/),e=>e.p.y-.05)}]},{}},Jl=(e,t)=>{let n=H(t.coat,Gn,.75),r=H(t.coat,nr,.45),i=H(t.coat,nr,.3);e.joints.neck=[0,.66,.05],e.joints.shoulder=[.11,.53,.13],e.joints.hip=[.1,.22,-.07],e.joints.tail=[0,.25,-.18],On(e,{belly:[[0,.36,-.1],[.18,.22,.18]],chest:[[0,.5,.04],[.16,.16,.15]],haunch:[[.11,.22,-.1],[.1,.13,.15]],ruff:[[0,.61,.04],[.16,.1,.14]],melt:.2}),G(e,{r:[.18,.155,.175],at:[0,.14,.06],cheeks:[[.13,-.05,-.01],[.09,.08,.09]]});let a=_n(e,{dy:-.27,len:.15,ra:.078,rb:.048,drop:.04,squash:[1,.85,1],thin:!0});un(e,{x:.55,y:.72,w:.08,h:.19,d:.045,splay:.15,rake:.08,cup:.5,notch:!0}),Jn(e,{len:.33,r0:.056,r1:.047,paw:[.05,.038,.06],fwd:.33,out:.15}),an(e,{r0:.066,r1:.05,foot:[.052,.038,.082]});let o=Fn(e,fl(.55,[0,-.65,-1],[.2,-.25,0],.11,[.35,.75,.95,1,.9,.7,.4]));U(e),Hn(e,{x:.4,y:.14,size:.85,wide:1.4,slant:.28,color:`#1a1410`,ring:`#c8963a`,ringSize:1.25}),zn(e,Rn,pl(e,a.nose),.028,.02),ir(e,t.coat,{len:.1,back:.035}),xl(e,[[.27,.43,.024]],n,`brow`,{stretch:1.3,along:[1,.35,0]});let s=[`earL`,`earR`].map(t=>mn(e,t)),c=tn(e,`head`);return e.marks={base:t.coat,marks:[{color:n,f:wn(...s.map(e=>e.inner))},{color:r,f:wn(...s.map(e=>e.back))},{color:n,f:B(V(e,`muzzle`),e=>e.p.y-(a.mid(e.p)+a.r*.2))},{color:n,f:B(V(e,`head`,`cheekL`,`cheekR`),e=>c(e).y+.12+Math.abs(c(e).x)*.15,e=>-.2-c(e).z)},{color:n,f:B(V(e,`chest`,`ruff`,`belly`),e=>-e.p.z,e=>on(e.p.x,e.p.y,0,.32,0,.62).d-.09)},{color:i,f:B(V(e,`belly`,`chest`,`ruff`,`haunchL`,`haunchR`),e=>Math.atan2(Math.abs(e.p.x),-.06-e.p.z)-.55-(e.p.y-.3)*1.7,e=>.3-e.p.y)},{color:r,f:B(V(e,/^tail\d/),e=>.85-o(e.p))}]},{}},Yl=(e,t)=>{let n=H(t.coat,`#e2c8a0`,.55),r=H(t.coat,nr,.35);e.joints.neck=[0,.6,.05],e.joints.shoulder=[.18,.49,.1],e.joints.hip=[.12,.18,-.04],e.joints.tail=[0,.22,-.23],On(e,{belly:[[0,.33,-.04],[.25,.27,.24]],chest:[[0,.5,.03],[.21,.16,.19]],haunch:[[.14,.19,-.06],[.11,.12,.15]],melt:.2}),G(e,{r:[.2,.18,.18],at:[0,.13,.06],cheeks:[[.12,-.06,.03],[.09,.08,.09]]});let i=_n(e,{dy:-.26,len:.08,ra:.085,rb:.07,drop:.02,squash:[1.1,.85,1]});un(e,{x:.62,y:.68,w:.06,h:.07,d:.035,round:!0,splay:.3,rake:.1,cup:.5}),Jn(e,{len:.28,r0:.075,r1:.064,paw:[.064,.048,.07],fwd:.35,out:.22}),an(e,{r0:.08,r1:.068,foot:[.068,.046,.09]});let a=e.joints.tail;fn(e).add(sn(`tail`,[a[0],a[1]+.01,a[2]-.02],[.045,.045,.04],{k:.025,anchor:a,reach:.07,name:`stub`})),U(e),Hn(e,{x:.36,y:.12,size:.8,wide:1,slant:.05,color:`#120e0c`}),zn(e,Rn,pl(e,i.nose),.036,.026),or(e,{w:.14,y:-.56,curve:.06,r:.006,out:.004});let o=[`earL`,`earR`].map(t=>mn(e,t));return e.marks={base:t.coat,marks:[{color:n,f:wn(...o.map(e=>e.inner))},{color:n,f:V(e,`muzzle`)},{color:H(t.coat,n,.35),f:bl(e,[`belly`,`chest`],0,.33,.15,.22)},{color:r,f:wn(tr(e,`L`,.55),tr(e,`R`,.55))},{color:r,f:B(V(e,/^leg/),e=>e.p.y-.11)}]},{}},Xl=(e,t)=>{let n=`#f4efe6`,r=H(t.coat,`#2a1612`,.72),i=H(t.coat,`#f0c890`,.5);e.joints.neck=[0,.54,.05],e.joints.shoulder=[.14,.43,.11],e.joints.hip=[.1,.17,-.05],e.joints.tail=[0,.2,-.18],On(e,{belly:[[0,.3,-.05],[.2,.23,.19]],chest:[[0,.43,.03],[.16,.13,.15]],melt:.2}),G(e,{r:[.2,.165,.17],at:[0,.13,.05],cheeks:[[.12,-.06,.03],[.09,.08,.09]]});let a=_n(e,{dy:-.28,len:.06,ra:.07,rb:.055,drop:.02,squash:[1.1,.85,1]});un(e,{x:.62,y:.66,w:.07,h:.1,d:.035,round:!0,splay:.35,rake:.1,cup:.5}),Jn(e,{len:.26,r0:.05,r1:.042,paw:[.046,.035,.054],fwd:.35,out:.15}),an(e,{r0:.058,r1:.048,foot:[.05,.035,.072]});let o=Fn(e,fl(.6,[0,-.3,-1],[.5,.9,0],.1,[.6,.9,1,1,.95,.85,.65]));U(e),Hn(e,{x:.38,y:.08,size:.9,wide:1,slant:.1,color:`#140e0c`}),zn(e,Rn,pl(e,a.nose),.026,.019),ir(e,t.coat,{len:.09,color:`#f0e6da`}),xl(e,[[.33,.43,.026]],n,`brow`,{stretch:1.55,along:[1,.3,0]});let s=[`earL`,`earR`].map(t=>mn(e,t)),c=tn(e,`head`);return e.marks={base:t.coat,marks:[{color:n,f:wn(...s.map(e=>e.inner))},{color:r,f:B(V(e,`head`,`cheekL`,`cheekR`),e=>Math.abs(Math.abs(c(e).x)-.4)-.07,e=>c(e).y-0,e=>-.35-c(e).y,e=>.2-c(e).z)},{color:n,f:V(e,`muzzle`)},{color:n,f:B(V(e,`cheekL`,`cheekR`,`head`),e=>c(e).y+.05,e=>.25-c(e).z)},{color:r,f:V(e,`armL`,`armR`,`foreL`,`foreR`,`armLPaw`,`armRPaw`,/^leg/)},{color:r,f:bl(e,[`belly`,`chest`],0,.28,.14,.2)},{color:i,f:B(V(e,/^tail\d/),e=>.4-Math.sin(o(e.p)*Math.PI*7))}]},{}},Zl=(e,t)=>{let n=H(t.coat,Gn,.55),r=H(t.coat,nr,.55);e.joints.neck=[0,.52,.05],e.joints.shoulder=[.12,.42,.12],e.joints.hip=[.1,.15,-.04],e.joints.tail=[0,.17,-.19],On(e,{belly:[[0,.27,-.04],[.2,.23,.19]],chest:[[0,.41,.03],[.15,.13,.14]],haunch:[[.12,.15,-.06],[.1,.11,.15]],melt:.2}),G(e,{r:[.18,.16,.16],at:[0,.13,.05],cheeks:[[.1,-.07,.05],[.08,.075,.08]]});let i=_n(e,{dy:-.26,len:.025,ra:.08,rb:.068,drop:.01,squash:[1.15,.85,1]});un(e,{x:.66,y:.62,w:.048,h:.055,d:.028,round:!0,splay:.4,rake:.1,cup:.5}),Jn(e,{len:.17,r0:.042,r1:.035,paw:[.038,.03,.045],fwd:.9,out:.1}),an(e,{r0:.06,r1:.05,foot:[.05,.035,.12],fwd:.07}),Fn(e,fl(.3,[0,-.7,-1],[0,.2,0],.06,[1,.85,.65,.45])),U(e),Hn(e,{x:.38,y:.12,size:.85,wide:1,slant:.05,color:`#140e0c`}),zn(e,r,pl(e,i.nose),.026,.018),ir(e,t.coat,{len:.07}),or(e,{w:.42,y:-.42,curve:.2,r:.011,out:.004});let a=[`earL`,`earR`].map(t=>mn(e,t));return e.marks={base:t.coat,marks:[{color:H(t.coat,`#e0a0a0`,.5),f:wn(...a.map(e=>e.inner))},{color:n,f:V(e,`muzzle`)},{color:n,f:bl(e,[`belly`,`chest`],0,.3,.13,.2)},{color:r,f:B(V(e,/^leg/),e=>e.p.y-.04)}]},{}},Ql=(e,t)=>{let n=H(t.coat,`#fbf4e6`,.7),r=H(t.coat,`#3a2a20`,.72);e.joints.neck=[0,.68,.06],e.joints.shoulder=[.11,.56,.09],e.joints.hip=[.085,.16,-.03],e.joints.tail=[0,.18,-.15],On(e,{belly:[[0,.32,-.03],[.15,.28,.15]],chest:[[0,.55,.03],[.125,.15,.13]],melt:.22}),G(e,{r:[.14,.12,.145],at:[0,.1,.06]});let i=_n(e,{dy:-.2,len:.08,ra:.07,rb:.05,drop:.02,squash:[1.15,.85,1]});un(e,{x:.74,y:.55,w:.042,h:.046,d:.026,round:!0,splay:.5,rake:.1,cup:.5}),Jn(e,{len:.17,r0:.036,r1:.03,paw:[.036,.026,.04],fwd:.7,out:.15}),an(e,{r0:.045,r1:.038,foot:[.045,.022,.075]});let a=Fn(e,fl(.46,[0,-.6,-1],[.3,.42,0],.058,[1,.95,.85,.72,.55]));U(e),Hn(e,{x:.4,y:.12,size:.85,wide:1,slant:.08,color:`#120e10`}),zn(e,`#d9878a`,pl(e,i.nose),.024,.018),ir(e,t.coat,{len:.09,color:`#e8ddd0`}),or(e,{w:.14,y:-.5,curve:.06,r:.006});let o=tn(e,`head`),s=[`earL`,`earR`].map(t=>mn(e,t));return e.marks={base:t.coat,marks:[{color:H(n,`#e8a0a0`,.25),f:wn(...s.map(e=>e.inner))},{color:r,f:B(V(e,`head`,`muzzle`),e=>Math.abs(o(e).y-.14)-.17,e=>.13-Math.abs(o(e).x),e=>.1-o(e).z)},{color:n,f:V(e,`muzzle`)},{color:n,f:B(V(e,`head`),e=>.3-o(e).z)},{color:n,f:V(e,`earL`,`earR`)},{color:r,f:V(e,/^arm/,/^fore/)},{color:r,f:V(e,/^leg/)},{color:r,f:B(V(e,/^tail\d/),e=>.2-a(e.p))}]},{}},$l=(e,t)=>{let n=H(t.coat,`#f4ebe0`,.5),r=H(t.coat,nr,.25);e.joints.neck=[0,.55,.06],e.joints.shoulder=[.2,.42,.07],e.joints.hip=[.07,.1,-.05],e.joints.tail=[0,.12,-.2],On(e,{belly:[[0,.3,-.02],[.255,.29,.235]],chest:[[0,.47,.03],[.2,.15,.19]],melt:.2}),G(e,{r:[.19,.17,.175],at:[0,.14,.04],melt:.18});let i=_n(e,{dy:-.3,len:.06,ra:.095,rb:.09,drop:.06,squash:[1.12,.92,1]}),a=e.joints.neck,o=Nl(a,i.nose),s=[o[0],o[1]-.04,o[2]-.035];fn(e).add(sn(`neck`,s,[.092,.068,.064],{rot:[.4,0,0],k:.04,name:`lip`})),Qn(e,{len:.22,w:.085,d:.036,taper:.85,fwd:.25,out:.4}),an(e,{r0:.06,r1:.055,foot:[.12,.024,.08],fwd:-.08}),U(e),Hn(e,{x:.46,y:.24,size:1.2,wide:1,slant:-.06,color:`#120e10`,blush:!1});for(let t of[-1,1]){let n=sr(e,t*.6,-.12).add(new R(...a));(e.blush??=[]).push({at:W(n),n:W(Zn(e,t*.6,-.12)),r:.05})}for(let n of[-1,1])bn(e,{bone:`neck`,from:new R(...o).add(new R(0,-.04,-.05)),dir:new R(n*.45,1,.6),r:.011,stretch:1.7,along:new R(1,0,-.4*n),color:H(t.coat,`#2a2224`,.65),sides:8,name:`nostril${n>0?`L`:`R`}`});e.nose=W(new R(...i.nose).add(new R(0,-.02,.01))),ir(e,t.coat,{len:.04,sweep:.05,drop:.035,color:H(t.coat,`#f2ece2`,.6)});let c=new R(...s),l=[-1,-.6,-.2,.2,.6,1].map(t=>In(e,c,new R(t*.75,-.62+.3*t*t,1))?.p);return l.every(Boolean)&&Sn(e,{bone:`neck`,pts:l,w:.0055,color:`#2a2224`}),e.marks={base:t.coat,marks:[{color:H(n,t.coat,.35),f:V(e,`lip`)},{color:n,f:bl(e,[`belly`,`chest`],0,.3,.18,.27)},{color:H(t.coat,nr,.12),f:V(e,`armL`,`armR`,`armLPaw`,`armRPaw`)},{color:r,f:V(e,/^leg/)}]},{aquatic:!0}},eu=(e,t)=>{let n=H(t.coat,`#f2dcc0`,.5),r=H(t.coat,`#ffb040`,.6),i=H(t.coat,`#2a1410`,.25);e.joints.neck=[0,.25,.3],e.joints.shoulder=[.08,.17,.33],e.joints.tail=[0,.1,-.38],Bn(e,`rear`,`body`,[0,.1,-.12]);let a=fn(e);a.add(Yn(`body`,[0,.14,-.12],[0,.16,.14],.15,.14,{squash:[1,.9,1],name:`trunk`})),a.add(Yn(`rear`,[0,.1,-.42],[0,.14,-.12],.09,.15,{squash:[1,.9,1],k:.07,anchor:[0,.13,-.15],reach:.22,name:`tailEnd`})),a.add(Yn(`body`,[0,.17,.12],[0,.24,.28],.14,.125,{k:.08,anchor:[0,.16,.12],reach:.18,name:`neck`})),e.seat=0,G(e,{r:[.13,.12,.12],at:[0,.04,.05],melt:.1}),U(e),Hn(e,{x:.36,y:.2,size:.95,wide:1,slant:0,color:`#1a1214`}),or(e,{w:.18,y:-.25,curve:.08,r:.006}),rr(e,{color:t.coat,len:.12,r:.03,rightOnly:!0}),e.front=.47;let o=e=>{if(e<-.12){let t=(e+.42)/.3;return{y:.1+.04*t,r:.09+.06*t,bone:`rear`}}return e<.14?{y:.14+.02*(e+.12)/.26,r:.15-.01*(e+.12)/.26,bone:`body`}:{y:.17+.07*(e-.14)/.14,r:.14,bone:`body`}},s=0;for(let n=-.36;n<=.18;n+=.075){let i=Math.round((n+.36)/.075),{y:a,r:c,bone:l}=o(n),u=c>.12?7:5;for(let o=0;o<u;o++){let d=-1.75+3.5*(o+(i%2?.5:0)+.25)/u;if(Math.abs(d)>1.75)continue;let f=new R(Math.sin(d),Math.cos(d),0).normalize(),p=In(e,new R(0,a,n),f);if(!p)continue;let m=(.06+s*37%10*.004)*(c/.15)+.015,h=p.p.clone().addScaledVector(p.n,-.02),g=p.p.clone().addScaledVector(p.n,m*.45),_=p.p.clone().addScaledVector(p.n,m);Nn(e,{bone:l,pts:[h,g,_],w:[.026,.017,0],t:[.026,.017,0],across:new R(0,0,1),colors:[t.coat,r],name:`spike${s++}`})}}return e.marks={base:t.coat,marks:[{color:n,f:B(V(e,`trunk`,`tailEnd`,`neck`,`head`),e=>e.p.y-.055)},{color:i,f:B(V(e,`trunk`,`tailEnd`),e=>.24-e.p.y)}]},{aquatic:!0,legs:`none`,tendril:!0}},tu=(e,t)=>{let n=`#1f1d22`,r=`#26242a`;e.step=.03,e.joints.neck=[0,.86,.1],e.joints.shoulder=[.14,.6,0],e.joints.hip=[.065,.34,-.02],e.joints.tail=[0,.4,-.2],On(e,{belly:[[0,.47,-.04],[.165,.16,.2]],chest:[[0,.66,.06],[.09,.18,.09]],melt:.18}),G(e,{r:[.105,.1,.115],at:[0,.07,.04],melt:.12});let i=e.joints.neck,a=sr(e,0,-.08,-.02),o=[[0,0,-.02],[0,-.008,.07],[0,-.03,.15],[0,-.07,.225],[0,-.125,.285],[0,-.19,.32]].map(e=>Nl(Nl(i,W(a)),e));return Fl(e,`neck`,o,[.03,.026,.022,.019,.016,.013],`beak`),Qn(e,{len:.34,w:.13,d:.035,fwd:-.05,out:.2}),an(e,{r0:.028,r1:.022,foot:[.045,.018,.08],fwd:.04}),vn(e,`tail`,e.joints.tail,{len:.14,w:.09,d:.034,rot:[-(Math.PI/2+.5),0,0],name:`tailFan`}),U(e),Bn(e,`backPlates`,`body`,[0,.48,-.16]),[-.05,-.025,0,.025,.05].forEach((t,n)=>{let i=1-Math.abs(t)*3+n%2*.08,a=[new R(t,.49,-.17),new R(t*1.3,.46,-.27),new R(t*1.6,.46-.08*i,-.27-.07*i),new R(t*1.8,.46-.17*i,-.28-.1*i)];Nn(e,{bone:`backPlates`,pts:a,w:[.02,.022,.015,0],t:[.008,.007,.005,0],across:new R(1,0,0),colors:[r,r,r],name:`plume${n}`})}),Hn(e,{x:.42,y:.12,size:.8,wide:1,slant:0,color:`#120e10`,ring:`#9a9aa4`,ringSize:1.45,out:.005}),e.nose=W(new R(...o[o.length-1]).sub(new R(...i))),e.marks={base:t.coat,marks:[{color:n,f:V(e,/^beak/)},{color:n,f:V(e,`head`)},{color:n,f:B(V(e,`chest`),e=>.74-e.p.y)},{color:n,f:V(e,/^leg/)},{color:r,f:B(V(e,`armLPaw`,`armRPaw`),e=>e.p.y-.37)}]},{}},nu=(e,t)=>{let n=H(t.coat,`#fbeee0`,.6),r=H(t.coat,nr,.55),i=H(t.coat,`#f4e2d0`,.25);e.step=.036,e.joints.neck=[0,.46,.06],e.joints.shoulder=[.22,.34,.08],e.joints.hip=[.1,.13,0],e.joints.tail=[0,.15,-.14],On(e,{belly:[[0,.28,0],[.27,.19,.17]],chest:[[0,.38,.02],[.24,.12,.15]],melt:.14}),G(e,{r:[.13,.085,.11],at:[0,0,.03],melt:.12});let a=fn(e);Jn(e,{len:.16,r0:.045,r1:.04,paw:[.07,.06,.075],fwd:.55,out:.42});for(let t of e.paws??[]){let e=new P().setFromEuler(new F(...t.rot)),n=new R(...t.at),r=new R(0,0,1).applyQuaternion(e),i=new R(0,1,0).applyQuaternion(e);for(let[e,o,s]of[[.025,-.35,`Top`],[-.025,.3,`Low`]]){let c=n.clone().addScaledVector(r,t.r[2]*.75).addScaledVector(i,e);a.add(Tn(t.bone,W(c),.042,.1,.042,{rot:[Math.PI/2+t.rot[0]+o,0,t.rot[2]],k:.04,round:.02,anchor:W(c),reach:.05,name:`pincer${s}${t.bone}`,thin:!0}))}}an(e,{r0:.04,r1:.032,foot:[.035,.02,.05],fwd:.02});let o=H(t.coat,nr,.12);for(let n of[-1,1]){let r=n>0?`legL`:`legR`;[.07,0,-.07].forEach((i,a)=>{let s=[new R(n*.17,.22+a*.02,i),new R(n*.35,.19+a*.015,i*1.6),new R(n*.44,.015,i*2)];Nn(e,{bone:r,pts:s,w:[.03,.026,0],t:[.028,.022,0],across:new R(0,0,1),colors:[t.coat,o],name:`side${r}${a}`})})}U(e),or(e,{w:.2,y:-.45,curve:.09,r:.006});let s=new R(0,.12,.02);for(let t of[-1,1]){let n=t>0?`L`:`R`,r=sr(e,t*.4,.62,-.015);Bn(e,`stalk${n}`,`neck`,W(r));let a=s.clone().add(new R(t*.02,0,0));Bn(e,`blink${n}`,`stalk${n}`,W(a));let o=jn(e,`stalk${n}`,`stalk${n}`);dn(o,e.rnd,[0,0,0],W(a),.018,.015,i,{base:`limb5`}),An(o,e.rnd,{base:`ico1`,r:.034,pos:W(a),jitter:.04,color:i});let c=jn(e,`eye${n}`,`stalk${n}`,{bone:`blink${n}`,eyes:!0}),l=er(a.clone().add(new R(0,.004,.026)));An(c,e.rnd,{base:`ico1`,r:[.021,.023,.014],matrix:l,jitter:.02,color:Rn,tone:.1}),An(c,e.rnd,{base:`ico0`,r:.007,matrix:Wn(l,[.006,.008,.011]),jitter:.01,color:`#fbf6ec`,tone:0})}e.blink=[`blinkL`,`blinkR`],wl(e,`body`,[0,.3,0],[.27,.2,.17],48,e=>e.y>.1&&e.z<.25,.016,H(t.coat,`#fbeee0`,.42),`freckle`);let c=sr(e,.4,.62).add(s);return e.eyeY=c.y,e.eyeX=c.x+.02,e.eyeR=.034,e.eyeZ=c.z+.035,e.marks={base:t.coat,marks:[{color:r,f:V(e,/^pincer/)},{color:n,f:bl(e,[`belly`],0,.2,.17,.12)},{color:H(t.coat,nr,.2),f:B(V(e,/^leg/),e=>e.p.y-.06)}]},{aquatic:!0}},ru=[[0,.62,-.78],[0,.02,-1],[0,-.6,-.8],[.66,.52,-.54],[-.66,.52,-.54],[.74,-.04,-.67],[-.74,-.04,-.67],[.64,-.58,-.5],[-.64,-.58,-.5]],iu=(e,t)=>{let n=H(t.coat,`#b8c488`,.4),r=H(t.coat,`#2a2014`,.55),i=H(t.coat,`#e8c87a`,.18);e.joints.neck=[0,.56,.08],e.joints.shoulder=[.17,.44,.07],e.joints.hip=[.09,.13,-.01],e.joints.tail=[0,.14,-.2],On(e,{belly:[[0,.3,.01],[.2,.27,.17]],chest:[[0,.47,.04],[.16,.13,.14]],melt:.18});let a=fn(e),o=new R(0,.35,-.07),s=new R(.27,.31,.19);a.add(sn(`body`,W(o),W(s),{k:.03,name:`shell`})),a.add(sn(`body`,[0,.35,.01],[.275,.315,.07],{k:.02,name:`shellRim`})),ru.forEach(([e,t,n],r)=>{let i=new R(e,t,n).normalize(),c=o.clone().add(new R(i.x*s.x,i.y*s.y,i.z*s.z)),l=new R(i.x/s.x,i.y/s.y,i.z/s.z).normalize(),u=new F().setFromQuaternion(new P().setFromUnitVectors(new R(0,0,1),l));a.add(sn(`body`,W(c.addScaledVector(l,-.006)),[.112,.112,.032],{rot:[u.x,u.y,u.z],k:.012,name:`scute${r}`}))});let c=a.shapes.flatMap((e,t)=>/^scute/.test(e.name??``)?[t]:[]);return G(e,{r:[.15,.135,.155],at:[0,.12,.08],melt:.1}),Qn(e,{len:.3,w:.1,d:.03,taper:.7,fwd:.3,out:.38}),an(e,{r0:.055,r1:.05,foot:[.07,.022,.09]}),Fn(e,fl(.08,[0,-.5,-1],[0,0,0],.035,[1,.6])),U(e),Hn(e,{x:.42,y:.14,size:1.1,wide:1,slant:.05,color:`#120e10`,out:.006}),or(e,{w:.26,y:-.36,curve:.07,r:.006}),e.marks={base:n,marks:[{color:H(n,`#3a3020`,.22),f:yl(e,`head`,[[12,0,.17],[38,38,.15],[38,-38,.15],[55,95,.14],[55,-95,.14],[42,180,.2]])},{color:r,f:B(V(e,/^scute/),e=>{let t=1/0,n=1/0;for(let r of c){let i=e.dist(r);i<t?(n=t,t=i):i<n&&(n=i)}return n-t-.012})},{color:i,f:V(e,/^scute/)},{color:H(i,r,.45),f:V(e,`shell`)},{color:r,f:V(e,`shellRim`)},{color:`#eadcb0`,f:bl(e,[`belly`,`chest`],0,.32,.15,.24)}]},{aquatic:!0}},au=(e,t)=>{let n=H(t.coat,`#e8dcc0`,.45),r=H(t.coat,nr,.3),i=H(t.coat,nr,.15),a=H(t.coat,`#bdf2ff`,.7);e.joints.neck=[0,.62,.08],e.joints.shoulder=[.15,.5,.1],e.joints.hip=[.12,.2,-.03],e.joints.tail=[0,.24,-.19],On(e,{belly:[[0,.34,-.02],[.22,.25,.21]],chest:[[0,.51,.05],[.17,.15,.16]],haunch:[[.13,.21,-.05],[.105,.14,.15]],melt:.18}),G(e,{r:[.15,.13,.16],at:[0,.1,.06],melt:.13});let o=_n(e,{dy:-.22,len:.09,ra:.115,rb:.088,drop:.015,squash:[1.08,.72,1]}),s=fn(e),c=new R(...e.joints.neck).add(new R(...e.shape.hc));for(let e of[-1,1])s.add(sn(`neck`,[e*.07,c.y+.06,c.z+.1],[.065,.03,.05],{k:.04,rot:[0,0,e*.32],name:e>0?`browL`:`browR`}));Jn(e,{len:.17,r0:.05,r1:.04,paw:[.042,.03,.045],fwd:.7,out:.32}),an(e,{r0:.085,r1:.07,foot:[.078,.034,.1]});let l=fl(.74,[0,-.42,-1],[.18,.5,0],.13,[1,.86,.7,.52,.34,.16]),u=Fn(e,l);U(e),Hn(e,{x:.46,y:.24,size:.75,wide:1.25,slant:.2,color:`#1a1210`,ring:`#f2c84a`,ringSize:1.35}),or(e,{w:.5,y:-.36,curve:.06,r:.006});let d=new R(...e.joints.neck);for(let t of[-1,1]){let n=new R(...o.nose).add(d).add(new R(t*.034,-.01,-.04)),r=In(e,n,new R(t*.2,-1,.25));if(!r)continue;let i=new R(0,-1,.15).normalize();Nn(e,{bone:`neck`,pts:[r.p.clone().addScaledVector(i,-.012),r.p.clone().addScaledVector(i,.01),r.p.clone().addScaledVector(i,.027)],w:[.01,.008,0],t:[.007,.006,0],across:new R(1,0,0),colors:[`#fbf8f1`,`#fbf8f1`],name:`fang${t>0?`L`:`R`}`})}let f=[];Bn(e,`backPlates`,`body`,[0,.42,-.06]);for(let e=.6;e>.3;e-=.065){let t=new R(0,.35*(e-.3),-1).normalize();f.push({at:new R(0,e,-.02),up:t,along:new R(0,1,.3),bone:`backPlates`,size:.75+(.6-e)*1.2})}let p=new R(...e.joints.tail),m=l.pts.length-1,h=Math.max(1,Math.round(m/3)),g=Math.max(h+1,Math.round(m*2/3));for(let e=1;e<m-1;e++){let t=new R(...l.pts[e]).add(p),n=new R(...l.pts[e+1]).add(p).clone().sub(t).normalize(),r=new R(0,1,0).addScaledVector(n,-n.y).normalize();f.push({at:t,up:r,along:n,bone:e<h?`tail`:e<g?`tail1`:`tail2`,size:.85*(1-e/m)+.3})}let _=0;f.forEach((t,n)=>{let r=new R().crossVectors(t.along,t.up).normalize();for(let o of[{off:0,tilt:0,scale:1},{off:-1,tilt:-.42,scale:.68},{off:1,tilt:.42,scale:.68}]){if(o.off&&n%2)continue;let s=t.up.clone().applyAxisAngle(t.along,o.tilt).normalize(),c=In(e,t.at,s);if(!c)continue;let l=.13*t.size*o.scale*(1+_*7%5*.04),u=.055*t.size*o.scale,d=c.p.clone().addScaledVector(s,-.02),f=c.p.clone().addScaledVector(s,l*.35),p=c.p.clone().addScaledVector(s,l*.62),m=c.p.clone().addScaledVector(s,l).addScaledVector(t.along,-l*.18);Nn(e,{bone:t.bone,pts:[d,f,p,m],w:[u*.8,u,u*.62,0],t:[.013,.011,.008,0],across:t.along.clone().addScaledVector(r,o.off*.2),colors:[i,i,a],name:`plate${_++}`})}});let v=tn(e,`head`);return e.marks={base:t.coat,marks:[{color:n,f:bl(e,[`belly`,`chest`],0,.38,.13,.25)},{color:n,f:B(V(e,`head`,`muzzle`),e=>-v(e).y-.35,e=>-e.p.z+.5)},{color:r,f:B(V(e,`belly`,`chest`,`haunchL`,`haunchR`),e=>e.p.z+.06)},{color:r,f:B(V(e,/^tail\d/),e=>.04-(e.p.y-(p.y-.32*u(e.p))))},{color:r,f:V(e,`browL`,`browR`)}]},{}},ou=(e,t,n,r,i)=>{let a=Math.abs(e)-n+i,o=Math.abs(t)-r+i;return Math.hypot(Math.max(a,0),Math.max(o,0))+Math.min(Math.max(a,o),0)-i};function su(){let e=new M;e.moveTo(0,-.95),e.bezierCurveTo(-.25,-.62,-1,-.28,-1,.28),e.bezierCurveTo(-1,.82,-.36,1.02,0,.6),e.bezierCurveTo(.36,1.02,1,.82,1,.28),e.bezierCurveTo(1,-.28,.25,-.62,0,-.95);let t=Cn(),n=new gt(e,{depth:.3,curveSegments:t?2:4,bevelEnabled:!0,bevelThickness:.25,bevelSize:.16,bevelSegments:t?1:2});return n.translate(0,-.05,-.15),n.deleteAttribute(`uv`),n.deleteAttribute(`normal`),n}function cu(e,t,n,r,i,a,o){let s=new P().setFromUnitVectors(new R(0,1,0),i.clone().normalize()),c=new z().compose(r.clone().sub(Kn(e,n)),s,new R(1,1,1));An(t,e.rnd,{base:`disc`,r:[a,a*.55,a],matrix:c,color:o})}var lu=(e,t)=>{let n={h:0,s:0,l:0};t.coat.getHSL(n,ke);let r=n.s<.22&&n.l>.45||n.l>.76?H(t.coat,`#2c3036`,.52):H(`#d8d2c6`,t.coat,.08),i=H(r,nr,.4),a=`#8cf0ff`,o=(n.h<.05||n.h>.9)&&n.s>.35?`#f6cf4a`:`#e8443a`;e.step=.03,e.joints.neck=[0,.52,0],e.joints.shoulder=[.212,.41,0],e.joints.hip=[.085,.15,0],e.joints.tail=[0,.22,-.14];let s=fn(e),c=[0,.3,0],l=[.18,.16,.145];s.add(ln(`body`,c,l,{round:.085,name:`chassis`})),e.shape.tc=c,e.shape.tr=l,e.shape.pear=0,e.front=l[2],e.seat=c[1]-l[1];let u=e.joints.neck,d=[0,.15,.01],f=[.2,.155,.165];e.shape.hr=f,e.shape.hc=d,e.headBend=void 0;let p=Nl(u,d);s.add(ln(`neck`,p,f,{round:.08,name:`head`})),s.add(Yn(`neck`,[0,u[1]-.08,0],[0,u[1]+.03,0],.068,.068,{name:`post`}));for(let e of[-1,1])s.add(Yn(`neck`,[e*(f[0]-.02),p[1]-.005,p[2]-.01],[e*(f[0]+.022),p[1]-.005,p[2]-.01],.056,.05,{k:.01,name:e>0?`discL`:`discR`}));s.add(sn(`neck`,[0,p[1]+f[1]-.004,p[2]],[.042,.024,.042],{k:.012,name:`socket`})),Jn(e,{len:.16,r0:.036,r1:.032,paw:[.047,.045,.047],fwd:.2,out:.14});for(let e of[`armL`,`armR`])s.named(e).k=.015;for(let t of[-1,1]){let n=e.joints.shoulder;s.add(sn(t>0?`armL`:`armR`,[t*(n[0]-.008),n[1],n[2]],[.054,.054,.054],{k:.012,name:t>0?`shoulderL`:`shoulderR`}))}for(let t of[-1,1]){let n=t>0?`legL`:`legR`,r=t*e.joints.hip[0];s.add(Yn(n,[r,.19,0],[r,.07,.005],.042,.04,{k:.015,anchor:[r,.15,0],reach:.08,name:n})),s.add(ln(n,[r,.039,.025],[.064,.039,.09],{round:.032,k:.02,anchor:[r,.07,.005],reach:.07,name:`${n}Foot`}))}U(e);for(let t of e.paws??[]){let n=new P().setFromEuler(new F(...t.rot)),r=new R(...t.at),a=(e,t,i)=>r.clone().add(new R(e,t,i).applyQuaternion(n));for(let r of[-1,1])Nn(e,{bone:t.bone,pts:[a(r*.016,-.018,.012),a(r*.034,-.052,.018),a(r*.012,-.08,.016)],w:[.013,.011,0],t:[.009,.008,0],across:new R(0,0,1).applyQuaternion(n),colors:[i,i],name:`prong${t.bone}${r}`})}Bn(e,`crest`,`neck`,[0,d[1]+f[1]-.03,d[2]]);let m=jn(e,`crest`,`crest`);dn(m,e.rnd,[0,0,0],[0,.15,0],.011,.009,r,{base:`limb5`}),An(m,e.rnd,{base:`ico2`,r:.034,pos:[0,.163,0],color:o}),Hn(e,{x:.4,y:.14,size:1.45,wide:1,slant:0,color:a,blush:!1}),or(e,{w:.2,y:-.4,curve:.13,r:.0075,color:a});for(let t of[-1,1]){let n=sr(e,t*.6,-.3,.001),r=new z().compose(n,new P().setFromUnitVectors(new R(0,0,1),Zn(e,t*.6,-.3)),new R(1,1,1));An(e.head,e.rnd,{base:`ico1`,r:[.028,.016,.005],matrix:r,color:`#ff8fb0`})}let h=.315;An(e.torso,e.rnd,{base:su(),r:[.036,.036,.024],pos:[0,h,l[2]+.003],color:o});for(let[t,n]of[[-.072,.255],[.072,.255],[-.072,.375],[.072,.375]]){let r=In(e,new R(t,n,0),new R(0,0,1));r&&cu(e,e.torso,`body`,r.p,r.n,.013,i)}for(let t of[-1,1]){let n=In(e,new R(t*.15,p[1]-.005,p[2]-.01),new R(t,0,0));n&&cu(e,e.head,`neck`,n.p,n.n,.018,i)}let g=t=>tn(e,`arm${t}Axis`),[_,v]=[g(`L`),g(`R`)];return e.marks={base:t.coat,marks:[{color:`#1a232e`,f:B(V(e,`head`),e=>p[2]+f[2]-.035-e.p.z,e=>ou(e.p.x,e.p.y-p[1]+.008,.152,.112,.045))},{color:r,f:V(e,`discL`,`discR`,`socket`)},{color:i,f:V(e,`post`)},{color:r,f:B(V(e,`chassis`),e=>l[2]-.035-e.p.z,e=>ou(e.p.x,e.p.y-h,.1,.088,.03))},{color:r,f:B(V(e,`chassis`),e=>Math.abs(e.p.y-.19)-.022)},{color:i,f:wn(B(V(e,`armL`,`foreL`),e=>Math.abs(_(e).y-.52)-.07),B(V(e,`armR`,`foreR`),e=>Math.abs(v(e).y-.52)-.07))},{color:r,f:V(e,`armL`,`foreL`,`armR`,`foreR`,`shoulderL`,`shoulderR`)},{color:r,f:V(e,`legL`,`legR`)},{color:i,f:B(V(e,`legLFoot`,`legRFoot`),e=>e.p.y-.016)}]},{}},uu=(e,t)=>{let n=H(t.coat,`#f8e8d6`,.2),r=H(t.coat,`#e0707e`,.38),i=H(t.coat,`#d8606a`,.2),a=H(t.coat,`#3a1e1a`,.6),o=`#8cc65c`,s=`#5f9c48`;e.joints.neck=[0,.5,.02],e.joints.shoulder=[.105,.445,0],e.joints.hip=[.065,.2,0],e.joints.tail=[0,.2,-.13],e.step=.036,On(e,{belly:[[0,.31,.02],[.145,.145,.145]],chest:[[0,.43,-.005],[.1,.085,.085]],melt:.14}),G(e,{r:[.215,.195,.195],at:[0,.17,.03],melt:.1});let c=_n(e,{dy:-.2,len:.012,ra:.044,rb:.042,drop:.01});un(e,{x:.88,y:.2,w:.05,h:.21,d:.034,splay:1.05,rake:.2,cup:.5,notch:!0}),Jn(e,{len:.21,r0:.03,r1:.026,paw:[.036,.07,.062],fwd:.12,out:.4});let l=fn(e),u=(e.paws??[]).map(e=>{let t=e.at[0]>0?1:-1,n=new P().setFromEuler(new F(...e.rot)),r=new R(...e.at);return{...e,side:t,q:n,at:r,L:(e,t,i)=>r.clone().add(new R(e,t,i).applyQuaternion(n))}});for(let e of u){let t=[e.rot[0]-.5,0,e.rot[2]-e.side*.35];l.add(sn(e.bone,W(e.L(-e.side*.012,.012,.055)),[.022,.034,.021],{rot:t,k:.025,anchor:W(e.at),reach:.09,name:`thumb${e.side>0?`L`:`R`}`}))}an(e,{r0:.038,r1:.032,foot:[.074,.04,.13],fwd:.075}),U(e),Hn(e,{x:.4,y:.04,size:1.45,wide:1,slant:0,color:`#1a1210`,ring:`#e2a93c`,ringSize:1.32}),or(e,{w:.32,y:-.52,curve:.13,r:.0065});let d=H(t.coat,`#5a3020`,.32);or(e,{w:.15,y:.44,curve:-.05,r:.0042,color:d}),or(e,{w:.1,y:.53,curve:-.04,r:.0038,color:d}),e.nose=c.nose;let f=new R(...e.joints.neck),p=sr(e,.06,.97,-.02);Bn(e,`crest`,`neck`,W(p));let m=p.clone().add(f),h=new R(.15,1,.1).normalize(),g=m.clone().addScaledVector(h,.11);Nn(e,{bone:`crest`,pts:[m.clone().addScaledVector(h,-.01),m.clone().addScaledVector(h,.06),g],w:[.009,.007,0],t:[.009,.007,0],across:new R(1,0,0),colors:[s,s],name:`sprout`});for(let t of[-1,1]){let n=new R(t,.3,-.1*t).normalize(),r=g.clone().addScaledVector(h,-.014),i=new R(-n.z,0,n.x).normalize();Nn(e,{bone:`crest`,pts:[r,r.clone().addScaledVector(n,.042).add(new R(0,.006,0)),r.clone().addScaledVector(n,.085).add(new R(0,.024,0))],w:[0,.025,0],t:[0,.006,0],across:i,colors:[o,o],name:`leaf${t}`})}let _=[],v=[];for(let t=0;t<=6;t++){let n=t/6,r=.3+.36*n,i=.74-.48*n+.08*Math.sin(n*Math.PI);_.push(sr(e,r,i).add(f)),v.push(Zn(e,r,i))}Nn(e,{bone:`neck`,pts:_.map((e,t)=>e.clone().addScaledVector(v[t],t===0||t===_.length-1?-.002:.0014)),w:_.map((e,t)=>t===0||t===_.length-1?0:.0032),t:_.map((e,t)=>t===0||t===_.length-1?0:.0022),across:new R(1,0,0),colors:_.slice(1).map(()=>a),name:`seam`});for(let t of[1,2,3,4,5]){let n=_[t],r=v[t],i=_[t+1].clone().sub(_[t-1]).normalize(),o=new R().crossVectors(r,i).normalize(),s=n.clone().addScaledVector(o,-.016),c=n.clone().addScaledVector(o,.016);Nn(e,{bone:`neck`,pts:[s.addScaledVector(r,-.002),n.clone().addScaledVector(r,.002),c.addScaledVector(r,-.002)],w:[0,.003,0],t:[0,.0022,0],across:i,colors:[a,a],name:`stitch${t}`})}bn(e,{bone:`body`,from:new R(0,.32,.02),dir:new R(0,0,1),r:.011,stretch:1.3,color:H(t.coat,`#5a3020`,.38),sides:8,name:`navel`});for(let n of u)for(let r of[-.026,0,.026]){let i=[1.02,.8,.58,.4].map(t=>In(e,n.at,new R(n.side*.02,-t*.07,r).applyQuaternion(n.q)));if(i.some(e=>!e))continue;let a=H(t.coat,nr,.38),o=i.map((e,t)=>e.p.clone().addScaledVector(e.n.normalize(),t===0||t===i.length-1?-.002:.0014));Nn(e,{bone:n.bone,pts:o,w:[0,.0032,.0032,0],t:[0,.0022,.0022,0],across:new R(0,0,1).applyQuaternion(n.q),colors:[a,a,a],name:`finger${n.bone}${r}`})}let y=[`earL`,`earR`].map(t=>mn(e,t));return e.marks={base:t.coat,marks:[{color:r,f:wn(...y.map(e=>e.inner))},{color:i,f:V(e,`muzzle`)},{color:n,f:bl(e,[`belly`,`chest`],0,.31,.09,.09)}]},{}},du=(e,t)=>{let n=H(t.coat,`#f4ecdc`,.86),r=Un(t.coat)>.68?H(t.coat,`#7a5a40`,.32):H(t.coat,`#fffcf4`,.9),i=H(n,t.coat,.4),a=H(n,t.coat,.14);e.joints.neck=[0,.43,.02],e.joints.shoulder=[.13,.34,.06],e.joints.hip=[.075,.13,0],e.joints.tail=[0,.15,-.14];let o=fn(e),s=e.joints.neck,c=[-.14,0,0],l=new P().setFromEuler(new F(...c)),u=new R(0,s[1]+.28,s[2]-.04),d=[.34,.21,.32],f=sn(`neck`,W(u),d,{rot:c,name:`cap`}),p=sn(`neck`,W(u.clone().add(new R(0,-.14,0).applyQuaternion(l))),[.305,.13,.285],{rot:c,k:.05,carve:!0,name:`hollow`});o.add(f,p),On(e,{belly:[[0,.22,0],[.175,.2,.165]],chest:[[0,.36,.01],[.14,.11,.135]],melt:.2}),G(e,{r:[.165,.14,.155],at:[0,.08,.03],melt:.12}),o.add(Yn(`neck`,[0,s[1]+.1,s[2]-.01],W(u.clone().add(new R(0,-.02,0).applyQuaternion(l))),.13,.1,{k:.06,name:`stemTop`})),Jn(e,{len:.15,r0:.04,r1:.034,paw:[.042,.036,.045],fwd:.4,out:.25}),an(e,{r0:.05,r1:.045,foot:[.062,.036,.08]}),U(e),Hn(e,{x:.4,y:0,size:1.15,wide:1,slant:0,color:`#1a1210`}),or(e,{w:.22,y:-.42,curve:.12,r:.006});let m=(e,t,n)=>u.clone().add(new R(e,t,n).applyQuaternion(l)),h=new R(0,-1,0).applyQuaternion(l);for(let t=0;t<24&&!Cn();t++){let n=(t+.5)/24*Math.PI*2,r=[.13,.2,.275].map(t=>{let r=t*Math.sin(n),i=t*Math.cos(n),a=-.14+.13*Math.sqrt(Math.max(0,1-(r/.305)**2-(i/.285)**2)),o=d[1]*Math.sqrt(Math.max(0,1-(r/d[0])**2-(i/d[2])**2));return In(e,m(r,(a+o)/2,i),h)});if(r.some(e=>!e))continue;let i=r.reduce((e,t)=>e.add(t.n.normalize()),new R).normalize();Nn(e,{bone:`neck`,pts:r.map(e=>e.p.clone().addScaledVector(e.n,.004)),w:[0,.011,0],t:[0,.003,0],across:i,colors:[a,a],name:`gill${t}`})}let g=e=>Math.abs(p.d(e.p.x,e.p.y,e.p.z))-.012,_=e=>-p.d(e.p.x,e.p.y,e.p.z),v=V(e,`cap`);return e.marks={base:n,marks:[{color:i,f:B(v,g)},{color:r,f:yl(e,`cap`,[[0,0,.27],[40,0,.21],[44,72,.2],[44,-72,.2],[46,144,.21],[46,-144,.21],[74,36,.17],[74,-36,.17],[76,108,.17],[76,-108,.17],[76,180,.17]])},{color:t.coat,f:B(v,_)},{color:H(n,t.coat,.14),f:B(V(e,/^leg/),e=>e.p.y-.05)}]},{}};function fu(e,t,n){let r=t.clone().normalize(),i=n.clone().addScaledVector(r,-n.dot(r)).normalize(),a=new R().crossVectors(r,i);return a.z>0&&a.negate(),{U:r,V:i,N:a,at:(t,n,o=0)=>e.clone().addScaledVector(r,t).addScaledVector(i,n).addScaledVector(a,o)}}var pu=(e,t)=>{let n=H(t.coat,`#f8e4a8`,.66),r=H(n,t.coat,.4),i=H(t.coat,`#f4c860`,.55),a=`#f3e6c8`,o=H(t.coat,`#f8dca0`,.42);e.joints.neck=[0,.56,.05],e.joints.shoulder=[.16,.44,.13],e.joints.hip=[.11,.17,-.01],e.joints.tail=[0,.2,-.2],On(e,{belly:[[0,.3,-.01],[.25,.26,.23]],chest:[[0,.47,.04],[.18,.13,.16]],haunch:[[.13,.17,-.03],[.1,.1,.13]],melt:.2}),e.front+=.035,G(e,{r:[.2,.175,.185],at:[0,.13,.05],melt:.14});let s=_n(e,{dy:-.26,len:.08,ra:.11,rb:.085,drop:.02,squash:[1.15,.78,1]});un(e,{x:.8,y:.32,w:.04,h:.085,d:.024,splay:1.2,rake:.25,notch:!0}),Jn(e,{len:.16,r0:.05,r1:.044,paw:[.046,.034,.048],fwd:.55,out:.32}),an(e,{r0:.072,r1:.062,foot:[.068,.034,.088]});let c=fl(.5,[0,-.45,-1],[.55,.3,0],.11,[1,.8,.6,.45,.32,.24]);Fn(e,c),U(e),Hn(e,{x:.42,y:.1,size:1.15,wide:1.1,slant:.12,color:`#1a1216`}),or(e,{w:.42,y:-.42,curve:.1,r:.0065}),e.nose=s.nose;let l=new R(...e.joints.neck);for(let n of[-1,1]){let r=pl(e,[n*.032,s.nose[1]-.004,s.nose[2]-.01],.002);An(e.head,e.rnd,{base:`ico1`,r:[.011,.008,.006],pos:r,rot:[-.4,n*.4,0],color:H(t.coat,nr,.65)})}for(let t of[-1,1]){let n=sr(e,t*.4,.78,-.012).add(l),r=new R(t*.3,.8,-.5).normalize(),i=new R(0,-.3,-1).normalize(),o=[n.clone().addScaledVector(r,-.02),n.clone().addScaledVector(r,.035),n.clone().addScaledVector(r,.065).addScaledVector(i,.02),n.clone().addScaledVector(r,.078).addScaledVector(i,.058)];Nn(e,{bone:`neck`,pts:o,w:[.024,.02,.013,0],t:[.024,.02,.013,0],across:new R(1,0,0),colors:[a,a,a],name:`horn${t>0?`L`:`R`}`})}let u=[],d=l.clone().add(new R(...e.shape.hc));for(let e of[1,1.4,1.8]){let t=new R(0,Math.cos(e),-Math.sin(e));u.push({from:d,dir:t,along:new R(0,-Math.sin(e),-Math.cos(e)),bone:`neck`,size:.8})}Bn(e,`backPlates`,`body`,[0,.4,-.08]);for(let e=.52;e>.28;e-=.07){let t=new R(0,.45*(e-.28),-1).normalize();u.push({from:new R(0,e,0),dir:t,along:new R(0,1,.2).normalize(),bone:`backPlates`,size:.9})}let f=new R(...e.joints.tail),p=c.pts.length-1,m=Math.max(1,Math.round(p/3)),h=Math.max(m+1,Math.round(p*2/3));for(let e=1;e<p-1;e++){let t=new R(...c.pts[e]).add(f),n=new R(...c.pts[e+1]).add(f).clone().sub(t).normalize(),r=new R(0,1,0).addScaledVector(n,-n.y).normalize();u.push({from:t,dir:r,along:n.negate(),bone:e<m?`tail`:e<h?`tail1`:`tail2`,size:.85-e/p*.45})}u.forEach((t,n)=>{let r=In(e,t.from,t.dir);if(!r)return;let a=.075*t.size,o=.032*t.size,s=[r.p.clone().addScaledVector(t.dir,-.014),r.p.clone().addScaledVector(t.dir,a*.45),r.p.clone().addScaledVector(t.dir,a).addScaledVector(t.along,a*.3)];Nn(e,{bone:t.bone,pts:s,w:[o,o*.8,0],t:[.012,.01,0],across:t.along,colors:[i,i],name:`ridge${n}`})});{let t=new R(...c.pts[p]).add(f),n=t.clone().sub(new R(...c.pts[p-1]).add(f)).normalize(),r=new R(0,1,0).cross(n).normalize(),a=[-.012,.012,.035,.058,.08,.105].map(e=>t.clone().addScaledVector(n,e));Nn(e,{bone:`tail2`,pts:a,w:[.018,.04,.056,.05,.03,0],t:[.016,.014,.013,.012,.009,0],across:r,colors:[i,i,i,i,i],name:`spade`})}for(let n of[-1,1]){let r=n>0?`wingL`:`wingR`,i=In(e,new R(n*.06,.47,0),new R(n*.45,.15,-1));if(!i)continue;let s=i.n.clone().normalize();Bn(e,r,`body`,W(i.p.clone().addScaledVector(s,-.02)));let c=fu(i.p.clone().addScaledVector(s,-.006),new R(n*.5,.82,-.22),new R(n*.85,-.5,-.15)),l=c.at(.1,0),u=[c.at(.175,.035),c.at(.15,.1),c.at(.085,.135)],d=[c.at(0,0),c.at(.05,-.004),l,u[0],c.at(.13,.062),u[1],c.at(.088,.09),u[2],c.at(.03,.082),c.at(-.004,.06)];Pn(e,{bone:r,centre:c.at(.07,.05),rim:d,up:c.N,cup:.008,color:o,edge:H(o,t.coat,.45)}),[[[c.at(-.012,0),c.at(.05,-.002),l,u[0]],.011],[[l,c.at(.13,.05),u[1]],.007],[[l,c.at(.095,.07),u[2]],.007]].forEach(([n,i],a)=>{let o=n.length-1;Nn(e,{bone:r,pts:n,w:n.map((e,t)=>t===o?0:i*(1-t/o*.4)),t:n.map((e,t)=>t===o?0:i*.8),across:c.N,colors:n.slice(1).map(()=>t.coat),name:`${r}Bone${a}`})}),Nn(e,{bone:r,pts:[l,l.clone().addScaledVector(c.U,.008).addScaledVector(c.V,-.025)],w:[.006,0],t:[.005,0],across:c.N,colors:[a],name:`${r}Claw`})}let g=bl(e,[`belly`,`chest`],0,.3,.165,.235),_=.075;return e.marks={base:t.coat,marks:[{color:r,f:B(g,e=>{let t=(e.p.y-.09)/_;return Math.abs(t-Math.round(t))*_-.013},e=>e.p.y-.43)},{color:n,f:g},{color:n,f:B(V(e,`muzzle`),e=>e.p.y-s.mid(e.p))}]},{wings:`flutter`}},mu=(e,t,n)=>{let r=`#2a2326`,i=Un(n)<.2?H(t.coat,`#f6e6b8`,.7):r,a=H(t.coat,`#fff6dc`,.5);e.joints.neck=[0,.47,.04],e.joints.shoulder=[.15,.4,.11],e.joints.hip=[.08,.15,0],e.joints.tail=[0,.16,-.2],On(e,{belly:[[0,.27,-.03],[.22,.22,.21]],chest:[[0,.42,.01],[.17,.1,.16]],melt:.16});let o=fn(e);for(let e=0;e<10;e++){let t=e/10*Math.PI*2;o.add(sn(`body`,[Math.sin(t)*.15,.445+e%2*.012,.02+Math.cos(t)*.145],[.058,.048,.058],{k:.04,name:`fluff${e}`}))}e.front+=.035,G(e,{r:[.205,.185,.185],at:[0,.15,.05],melt:.12}),Jn(e,{len:.14,r0:.034,r1:.03,paw:[.034,.028,.036],fwd:.5,out:.3}),an(e,{r0:.028,r1:.024,foot:[.031,.02,.04]}),U(e),Hn(e,{x:.42,y:.02,size:1.45,wide:1,slant:.05,color:`#1a1418`}),or(e,{w:.2,y:-.5,curve:.1,r:.006});let s=new R(...e.joints.neck);for(let t of[-1,1]){let n=t>0?`earL`:`earR`,i=sr(e,t*.3,.86,-.012);Bn(e,n,`neck`,W(i));let a=i.clone().add(s),o=[a.clone().add(new R(0,-.012,0)),a.clone().add(new R(t*.018,.06,.004)),a.clone().add(new R(t*.045,.115,.02)),a.clone().add(new R(t*.07,.15,.05))];Nn(e,{bone:n,pts:o,w:[.009,.008,.007,.006],t:[.009,.008,.007,.006],across:new R(1,0,0),colors:[r,r,r],name:`antenna${t>0?`L`:`R`}`}),An(jn(e,`knob${t>0?`L`:`R`}`,n),e.rnd,{base:`ico2`,r:.024,pos:W(o[3].clone().sub(Kn(e,n))),color:r})}{let t=In(e,new R(0,.2,-.05),new R(0,-.45,-1));if(t){let n=new R(0,-.35,-1).normalize(),i=[t.p.clone().addScaledVector(n,-.014),t.p.clone().addScaledVector(n,.03),t.p.clone().addScaledVector(n,.058)];Nn(e,{bone:`tail`,pts:i,w:[.017,.009,0],t:[.017,.009,0],across:new R(1,0,0),colors:[r,r],name:`stinger`})}}for(let t of[-1,1]){let n=t>0?`wingL`:`wingR`,r=In(e,new R(t*.04,.42,-.02),new R(t*.35,.3,-1));if(!r)continue;let i=r.n.clone().normalize();Bn(e,n,`body`,W(r.p.clone().addScaledVector(i,-.012)));let a=r.p.clone().addScaledVector(i,-.004),o=[[new R(t*.6,.78,-.15),.115,.004,.115,.05,0],[new R(t*.95,.15,-.2),.08,.004,.08,.034,.01]];for(let[r,i,s,c,l,u]of o){let o=fu(a,r,new R(t*.4,-1,-.1)),d=[];for(let e=0;e<14;e++){let t=e/14*Math.PI*2;d.push(o.at(i+Math.cos(t)*c,s+Math.sin(t)*l,u))}Pn(e,{bone:n,centre:o.at(i,s,u),rim:d,up:o.N,cup:.004,color:`#f6fbff`,edge:`#a9c0dc`,glass:!0})}}let c=Cn()?[[-1,.1],[.19,.29]]:[[-1,.09],[.15,.21],[.27,.33]];return e.marks={base:t.coat,marks:[{color:a,f:V(e,/^fluff/)},{color:i,f:B(V(e,`belly`,`chest`),e=>Math.min(...c.map(([t,n])=>Math.max(t-e.p.y,e.p.y-n))))},{color:r,f:V(e,/^arm/,/^fore/,/^leg/)}]},{hover:.22,wings:`buzz`}},hu=(e,t)=>{let n=H(t.coat,`#f6f2d6`,.58),r=H(t.coat,`#1e2a18`,.28),i=H(t.coat,`#fbf8e8`,.72);e.joints.neck=[0,.5,.07],e.joints.shoulder=[.13,.41,.09],e.joints.hip=[.1,.16,-.04],e.joints.tail=[0,.2,-.17],On(e,{belly:[[0,.29,-.03],[.175,.215,.19]],chest:[[0,.42,.03],[.135,.12,.14]],melt:.18});let a=[0,.1,.07];G(e,{r:[.165,.15,.18],at:a,melt:.12});let o=_n(e,{dy:-.18,len:.07,ra:.1,rb:.07,drop:.02,squash:[1,.85,1]}),s=fn(e),c=Nl(e.joints.neck,a),l=[0,c[1]+.06,c[2]-.08];s.add(Tn(`neck`,l,.06,.2,.085,{rot:[-.5,0,0],k:.035,anchor:l,reach:.12,round:.045,name:`casque`})),Jn(e,{len:.18,r0:.04,r1:.034,paw:[.046,.026,.046],fwd:.45,out:.32}),an(e,{r0:.05,r1:.04,foot:[.054,.028,.066]});let u=[[0,0,.02],[0,-.004,-.07]],d=[.062,.052],f=1.55*Math.PI;for(let e=0;e<=9;e++){let t=e/9*f,n=.1*Math.exp(-.18*t);u.push([t/Math.PI*.012,-.1+n*Math.cos(t),-.16-n*Math.sin(t)]),d.push(.044-e/9*.027)}let p=Fn(e,{pts:u,radii:d});U(e),or(e,{w:.5,y:-.36,curve:.08,r:.006}),e.nose=o.nose;let m=new R(0,0,1),h=new R;for(let n of[-1,1]){let r=n>0?`L`:`R`,i=sr(e,n*.6,.16),a=Zn(e,n*.6,.16).add(new R(0,.12,.3)).normalize();Bn(e,`turret${r}`,`neck`,W(i.clone().addScaledVector(a,-.02)));let o=new P().setFromUnitVectors(m,a),s=new R(1,1,1);An(jn(e,`turret${r}`,`turret${r}`),e.rnd,{base:`ico2`,r:[.064,.064,.054],matrix:new z().compose(a.clone().multiplyScalar(.02),o,s),bend:e=>{e.z>0&&(e.x*=1-.2*e.z,e.y*=1-.2*e.z)},color:t.coat});let c=a.clone().multiplyScalar(.074);Bn(e,`blink${r}`,`turret${r}`,W(c));let l=jn(e,`eye${r}`,`turret${r}`,{bone:`blink${r}`,eyes:!0}),u=new z().compose(c.clone().addScaledVector(a,-.004),o,s);An(l,e.rnd,{base:`ico2`,r:[.03,.03,.01],matrix:Wn(u,[0,0,-.004]),color:`#d8ac3a`,tone:.05}),An(l,e.rnd,{base:`ico2`,r:[.021,.021,.012],matrix:u,color:Rn,tone:.1}),An(l,e.rnd,{base:`ico1`,r:[.007,.007,.004],matrix:Wn(u,[.007,.008,.01]),color:`#fffdf8`,tone:0}),h=i.clone().addScaledVector(a,.05)}return e.blink=[`blinkL`,`blinkR`],e.eyeY=h.y,e.eyeX=Math.abs(h.x),e.eyeR=.04,e.eyeZ=h.z+.02,Sl(e,`body`,[0,.3,-.03],[[2,.35,.02],[1.7,.1,.022],[1.4,.45,.018],[1.1,.15,.022],[.8,.42,.017]],i,`spot`),e.marks={base:t.coat,marks:[{color:n,f:bl(e,[`belly`,`chest`],0,.3,.12,.22)},{color:r,f:B(V(e,/^tail\d/),e=>.6-Math.sin(p(e.p)*Math.PI*7))},{color:n,f:B(V(e,`muzzle`,`head`),e=>e.p.y-(o.mid(e.p)-.01),e=>-e.p.z+c[2]+.05)}]},{swivel:!0,shifts:!0}},gu=(e,t)=>{let n=H(t.coat,`#f2eee6`,.86),r=Un(t.coat)>.6?H(t.coat,`#6a7a90`,.3):H(t.coat,`#f6f3ec`,.8),i=H(t.coat,`#1a2236`,.28),a=H(t.coat,`#1a2236`,.1);e.joints.neck=[0,.52,.05],e.joints.shoulder=[.21,.42,.07],e.joints.hip=[.11,.15,-.02],e.joints.tail=[0,.2,-.19];let o=[0,.29,-.02];On(e,{belly:[o,[.25,.27,.22]],chest:[[0,.46,.03],[.225,.16,.2]],melt:.2});let s=[0,.11,.06],c=[.3,.165,.25];G(e,{r:c,at:s,melt:.2});let l=Nl(e.joints.neck,s),u=fn(e);u.add(sn(`neck`,[0,l[1]-.035,l[2]+.1],[.27,.12,.17],{k:.08,name:`jaw`})),Qn(e,{len:.3,w:.1,d:.04,taper:.62,fwd:.25,out:.62}),an(e,{r0:.065,r1:.055,foot:[.065,.035,.085]});let d=fl(.3,[0,-.15,-1],[.3,0,0],.11,[1,.8,.58,.42]),f=Fn(e,d),p=new R(...e.joints.tail),m=Nl(e.joints.tail,d.pts[d.pts.length-1]),h=(e,t,n)=>{for(let r=0;r+1<e.length;r++)u.add(Yn(`tail2`,Nl(m,e[r]),Nl(m,e[r+1]),t[r],t[r+1],{k:r===0?.04:.02,anchor:m,reach:.1,name:`${n}${r}`,squash:[.34,1,1],thin:!0}))};h([[0,0,0],[0,.1,-.035],[0,.19,-.09],[0,.26,-.17]],[.07,.06,.042,.014],`finUp`),h([[0,0,0],[0,-.06,-.05],[0,-.095,-.12]],[.06,.042,.014],`finDown`),Bn(e,`backPlates`,`body`,[0,.36,-.2]),vn(e,`backPlates`,[0,.36,-.2],{len:.13,w:.028,d:.07,rot:[-1.6,0,0],name:`dorsal`,melt:.05});let g=(t,n)=>In(e,new R(0,n,o[2]),new R(Math.sin(t),0,-Math.cos(t)));U(e),Hn(e,{x:.62,y:.1,size:.62,wide:1,slant:0,color:`#141018`}),or(e,{w:.68,y:-.3,curve:.12,r:.009}),e.nose=W(sr(e,0,-.12));let _=new Mn(u),v=V(e,`belly`,`chest`),y=(e,t=.005)=>v(_.set(e.x,e.y,e.z))<-t;for(let t of[-1.1,-.55,.55,1.1]){let n=[];for(let e=.55;e>.17;e-=.055){let r=g(t,e);r&&y(r.p)&&n.push(r.p)}let r=n.map((e,t)=>t===0||t===n.length-1?0:.022);Nn(e,{bone:`body`,pts:n,w:r,t:r.map(e=>e*.55),across:new R(Math.cos(t),0,Math.sin(t)),colors:n.slice(1).map(()=>a),name:`ridge${t>0?`L`:`R`}${+(Math.abs(t)>.8)}`})}for(let t of[.25,.35,.45]){let n=[[]];for(let e=-1.45;e<1.5;e+=.1){let r=g(e,t);r&&y(r.p)?n[n.length-1].push(r.p):n.push([])}for(let t of n)Sn(e,{bone:`body`,pts:t,w:.0075,color:r})}[.2,.3,.4,.5].forEach((t,n)=>{for(let i of[-1.36,-.83,-.27,.27,.83,1.36]){let a=g(i,t);a&&y(a.p,.03)&&bn(e,{bone:`body`,from:new R(0,t,o[2]),dir:new R(Math.sin(i),0,-Math.cos(i)),r:.028,color:r,sides:9,name:`spot${n}_${i}`})}}),wl(e,`neck`,l,c,80,e=>e.y>.28&&e.z<.82,.022,r,`headSpot`,9);let b=[];if(Cn()){for(let t of Pl(26)){let n=t.y>.3&&t.z<.8&&In(e,new R(...l),new R(t.x*c[0],t.y*c[1],t.z*c[2]));n&&b.push(n.p)}for(let e of[.25,.43])for(let t of[-1.2,-.45,.45,1.2]){let n=g(t,e);n&&b.push(n.p)}}let x=tn(e,`head`);return e.marks={base:t.coat,marks:[{color:n,f:bl(e,[`belly`,`chest`],0,.3,.19,.29)},{color:n,f:B(V(e,`head`,`jaw`),e=>-x(e).z,e=>x(e).y-(-.34+.12*x(e).x**2))},{color:n,f:B(V(e,/^leg/),e=>e.p.y-.03)},{color:n,f:B(V(e,/^tail\d/),e=>e.p.y-(p.y+(m[1]-p.y)*f(e.p))+.02)},{color:i,f:V(e,`dorsal`,/^finUp/,/^finDown/)},{color:r,f:e=>Math.min(...b.map(t=>e.p.distanceTo(t)))-.045}]},{aquatic:!0}};function _u(e,t){let n=e.clone().normalize(),r=new R().crossVectors(n,t).normalize(),i=new R().crossVectors(r,n),a=new F().setFromRotationMatrix(new z().makeBasis(r,n,i));return[a.x,a.y,a.z]}var vu=[[.47,.035,.15,.14],[.4,.01,.162,.152],[.33,-.015,.168,.158],[.26,-.03,.165,.155],[.19,-.036,.152,.142]];function yu(e,t,n){let r=t.map(t=>tn(e,t));return e=>{let t=1/0;for(let n=0;n+1<r.length;n++){let i=r[n](e).y,a=r[n+1](e).y;i*a<.04&&(t=Math.min(t,Math.abs(i+a)*.5))}return t-n}}var bu={raccoon:_l,fox:ml,snail:vl,wolf:Jl,bear:Yl,deer:Vl,hedgehog:Ll,panda:Gl,penguin:kl,otter:Kl,frog:Ml,axolotl:Rl,shark:El,octopus:Ol,duck:Al,platypus:Wl,capybara:ql,redpanda:Xl,quokka:Zl,sloth:Hl,seal:Ul,highland:Bl,squid:Il,bat:jl,jellyfish:Dl,gecko:zl,ferret:Ql,dugong:$l,seacucumber:eu,ibis:tu,crab:nu,turtle:iu,kaiju:au,robot:lu,homunculus:uu,fungi:du,dragon:pu,bee:mu,chameleon:hu,whaleshark:gu,prawn:(e,t)=>{let n=H(t.coat,`#fff3e8`,.3),r=H(t.coat,`#4a2028`,.3);e.step=.034,e.joints.neck=[0,.5,.04],e.joints.shoulder=[.13,.43,.07],e.joints.hip=[.075,.13,0],e.joints.tail=[0,.17,-.12],On(e,{belly:[[0,.27,-.03],[.13,.17,.12]],chest:[[0,.42,.015],[.125,.11,.115]],melt:.14});let i=fn(e),a=vu.map(([e,t,n,r],a)=>(i.add(sn(`body`,[0,e,t],[n,.05,r],{rot:[.06*a,0,0],k:.012,name:`band${a}`})),`band${a}`));e.shape.tr=[.168,e.shape.tr[1],.165],e.front=(e.front??0)+.03,G(e,{r:[.19,.165,.185],at:[0,.12,.04],melt:.1}),Jn(e,{len:.19,r0:.034,r1:.03,paw:[.036,.032,.046],fwd:.55,out:.32}),an(e,{r0:.04,r1:.034,foot:[.042,.022,.06],fwd:.025});let o=fl(.2,[0,-.35,-1],[.85,0,0],.075,[1,.86,.72,.6]);Fn(e,o);let s=new R(...e.joints.tail),c=o.pts.length-1,l=e=>new R(...o.pts[Math.min(c,Math.floor(e))]).lerp(new R(...o.pts[Math.min(c,Math.floor(e)+1)]),e%1).add(s),u=new R(1,0,0),d=[1.8,5.2].map((e,t)=>{let n=l(e+.5).sub(l(e-.5)).normalize(),r=.09-t*.014;return i.add(sn(e<c/3?`tail`:e<c*2/3?`tail1`:`tail2`,W(l(e)),[r,.034,r*.9],{rot:_u(n,new R(0,1,0)),k:.012,name:`ring${t}`})),`ring${t}`}),f=l(c),p=l(c).sub(l(c-1)).normalize(),m=new R().crossVectors(u,p).normalize();for(let e of[-1.1,-.55,0,.55,1.1]){let t=u.clone().multiplyScalar(Math.cos(.45)).addScaledVector(m,Math.sin(.45)*Math.sign(e)),n=p.clone().multiplyScalar(Math.cos(e)).addScaledVector(t,Math.sin(e)),r=f.clone().addScaledVector(n,-.02);e===0?i.add(Tn(`tail2`,W(r),.055,.19,.022,{rot:_u(n,m),k:.02,anchor:W(f),reach:.06,round:.012,name:`fan0`,thin:!0})):i.add(sn(`tail2`,W(r.addScaledVector(n,.105)),[.056,.11,.024],{rot:_u(n,new R().crossVectors(t,p)),k:.02,anchor:W(f),reach:.06,name:`fan${e>0?`L`:`R`}${Math.abs(e)>.7?2:1}`,thin:!0}))}U(e),or(e,{w:.22,y:-.4,curve:.08,r:.006}),e.nose=W(sr(e,0,-.2));let h=new R(0,.06,.05);for(let n of[-1,1]){let r=n>0?`L`:`R`,i=sr(e,n*.4,.3,-.015);Bn(e,`stalk${r}`,`neck`,W(i));let a=h.clone().add(new R(n*.035,0,0));Bn(e,`blink${r}`,`stalk${r}`,W(a));let o=jn(e,`stalk${r}`,`stalk${r}`);dn(o,e.rnd,[0,0,0],W(a),.021,.018,t.coat,{base:`limb5`});let s=jn(e,`eye${r}`,`stalk${r}`,{bone:`blink${r}`,eyes:!0}),c=er(a);An(s,e.rnd,{base:`ico2`,r:[.036,.038,.034],matrix:c,color:Rn,tone:.1}),An(s,e.rnd,{base:`ico1`,r:[.012,.012,.006],matrix:Wn(c,[.011,.015,.029]),color:`#fffdf8`,tone:0}),An(s,e.rnd,{base:`ico1`,r:[.005,.005,.003],matrix:Wn(c,[-.012,-.011,.031]),color:`#fffdf8`,tone:0})}e.blink=[`blinkL`,`blinkR`];let g=sr(e,.4,.3).add(h);e.eyeY=g.y,e.eyeX=g.x+.035,e.eyeR=.038,e.eyeZ=g.z+.034;let _=new R(...e.joints.neck),v=sr(e,0,.38,-.02).add(_),y=[v,v.clone().add(new R(0,.028,.065)),v.clone().add(new R(0,.05,.135)),v.clone().add(new R(0,.07,.2))];Nn(e,{bone:`neck`,pts:y,w:[.016,.013,.008,0],t:[.03,.022,.012,0],across:u,colors:[t.coat,t.coat,r],name:`rostrum`}),[.35,.6,.82].forEach((n,r)=>{let i=y[0].clone().lerp(y[3],n),a=.03*(1-n)+.004;Nn(e,{bone:`neck`,pts:[i.clone().add(new R(0,a-.01,-.01)),i.clone().add(new R(0,a+.013,.008))],w:[.005,0],t:[.008,0],across:u,colors:[t.coat],name:`rostrumTooth${r}`})});let b=[[0,0,0],[.04,.005,.02],[.11,.035,.005],[.19,.075,-.05],[.265,.08,-.16],[.32,.03,-.3],[.355,-.09,-.45],[.365,-.26,-.56],[.36,-.45,-.61]];for(let n of[-1,1]){let r=`feeler${n>0?`L`:`R`}`,i=sr(e,n*.58,.14,-.015);Bn(e,r,`neck`,W(i));let a=i.add(_),o=new je(b.map(([e,t,r])=>a.clone().add(new R(n*e,t,r)))).getSpacedPoints(16),s=o.map((e,t)=>t===16?0:.0075-t/16*.0045);for(let n=0;n<4;n++){let i=n*4;Nn(e,{bone:r,pts:o.slice(i,i+5),w:s.slice(i,i+5),t:s.slice(i,i+5),across:new R(0,1,0),colors:[t.coat,t.coat,t.coat,t.coat],name:`${r}${n}`})}}for(let n of e.paws??[]){let i=new P().setFromEuler(new F(...n.rot)),a=new R(...n.at),o=new R(0,0,1).applyQuaternion(i),s=new R(0,1,0).applyQuaternion(i),c=new R(1,0,0).applyQuaternion(i);for(let i of[1,-1]){let l=(e,t)=>a.clone().addScaledVector(o,e).addScaledVector(s,t*i);Nn(e,{bone:n.bone,pts:[l(.005,.012),l(.045,.02),l(.075,.016),l(.095,.004)],w:[.017,.015,.011,0],t:[.014,.012,.009,0],across:c,colors:[t.coat,t.coat,r],name:`claw${n.bone}${i>0?`Top`:`Low`}`})}}for(let n=0;n<4;n++){let r=.43-n*.07;for(let i of[-1,1]){let a=In(e,new R(i*.05,r,0),new R(i*.4,-.1,1));if(!a)continue;let o=a.p.clone().addScaledVector(a.n,-.015),s=a.p.clone().add(new R(i*.025,.012,.035)),c=s.clone().add(new R(i*.008,-.055,.01)),l=c.clone().add(new R(0,-.008,.004));Nn(e,{bone:`body`,pts:[o,s,c,l],w:[.012,.011,.009,0],t:[.011,.01,.008,0],across:u,colors:[t.coat,t.coat,t.coat],name:`walker${i>0?`L`:`R`}${n}`})}}return e.marks={base:t.coat,marks:[{color:r,f:B(V(e,...a,`belly`,`chest`),yu(e,a,.2))},{color:r,f:B(V(e,...d,/^tail\d/),yu(e,d,.16))},{color:n,f:bl(e,a,0,.3,.1,.2)},{color:r,f:V(e,/^fan/)}]},{aquatic:!0}},meerkat:(e,t)=>{let n=H(t.coat,`#f7ecd6`,.62),r=H(t.coat,`#2c2019`,.8),i=H(t.coat,`#3a2a1e`,.22);e.joints.neck=[0,.66,.05],e.joints.shoulder=[.1,.55,.07],e.joints.hip=[.08,.16,-.02],e.joints.tail=[0,.17,-.14],On(e,{belly:[[0,.3,-.01],[.165,.27,.155]],chest:[[0,.53,.03],[.12,.15,.12]],melt:.22}),G(e,{r:[.15,.135,.15],at:[0,.11,.05],melt:.1});let a=_n(e,{dy:-.24,len:.1,ra:.075,rb:.03,drop:.035,squash:[1.05,.85,1],thin:!0});un(e,{x:.86,y:.3,w:.042,h:.05,d:.022,round:!0,splay:1.1,rake:.05,turn:.3}),Jn(e,{len:.17,r0:.034,r1:.028,paw:[.032,.026,.036],fwd:.6,out:.12}),an(e,{r0:.05,r1:.04,foot:[.045,.024,.08]});let o=Fn(e,fl(.44,[0,-.75,-1],[.6,0,0],.045,[1,.85,.7,.55,.4]));U(e),Hn(e,{x:.42,y:.14,size:.95,wide:1,slant:.05,color:`#120d0b`}),zn(e,`#2a1f1a`,pl(e,a.nose),.02,.016),ir(e,t.coat,{len:.07}),or(e,{w:.12,y:-.52,curve:.06,r:.0055});let s=tn(e,`head`);return e.marks={base:t.coat,marks:[{color:r,f:V(e,`earL`,`earR`)},{color:r,f:B(V(e,`head`,`muzzle`),e=>{let t=s(e);return on(Math.abs(t.x),t.y,.42,.18,.62,-.14).d-.2+ +(t.z<.1)})},{color:n,f:V(e,`muzzle`)},{color:n,f:B(V(e,`head`),e=>.25-s(e).z)},{color:n,f:bl(e,[`belly`,`chest`],0,.36,.12,.34)},{color:i,f:B(V(e,`belly`,`chest`),e=>{let t=(e.p.y+.015*Math.sin(e.p.x*30))/.065;return Math.max(Math.abs(t-Math.round(t))-.2,e.p.z+.05,Math.abs(e.p.y-.32)-.15)*.1})},{color:H(t.coat,r,.35),f:V(e,`armLPaw`,`armRPaw`,`legLFoot`,`legRFoot`)},{color:r,f:B(V(e,/^tail\d/),e=>.78-o(e.p))}]},{}},skeleton:(e,t)=>{let n=Un(t.coat)<.08,r=n?H(t.coat,`#efe8f4`,.62):H(t.coat,`#1c1522`,.86),i=n?H(t.coat,`#efe8f4`,.42):H(t.coat,`#3a3040`,.84),a=n?H(t.coat,`#efe8f4`,.32):H(t.coat,`#3c3048`,.62);e.joints.neck=[0,.56,0],e.joints.shoulder=[.15,.5,0],e.joints.hip=[.075,.17,0],e.joints.tail=[0,.2,-.1],e.step=.03;let o=fn(e),s=e.joints.neck;o.add(sn(`body`,[0,.42,.01],[.15,.135,.125],{name:`ribs`})),o.add(Yn(`body`,[0,.33,-.03],[0,.21,-.03],.042,.042,{k:.03,name:`spine`})),o.add(sn(`body`,[0,.205,-.005],[.115,.052,.08],{k:.035,name:`pelvis`})),o.add(Yn(`neck`,[0,s[1]-.09,-.02],[0,s[1]+.04,-.01],.036,.036,{k:.03,name:`neckBone`})),e.shape.tc=[0,.36,0],e.shape.tr=[.15,.2,.125],e.shape.pear=0,e.front=.135,e.seat=.14,G(e,{r:[.205,.19,.19],at:[0,.18,.01],melt:.05});let c=Nl(s,e.shape.hc);for(let e of[-1,1])o.add(sn(`neck`,[e*.11,c[1]-.09,c[2]+.1],[.06,.045,.06],{k:.04,name:e>0?`cheekL`:`cheekR`}));o.add(sn(`neck`,[0,c[1]-.14,c[2]+.06],[.12,.07,.11],{k:.05,name:`jaw`})),Jn(e,{len:.2,r0:.026,r1:.022,paw:[.03,.034,.028],fwd:.2,out:.2});for(let e of[`armL`,`armR`])o.named(e).k=.015;an(e,{r0:.03,r1:.026,foot:[.045,.026,.075],fwd:.04});let l=e.elbow??.1;for(let t of[-1,1]){let n=t>0?`L`:`R`,r=[t*e.joints.shoulder[0],e.joints.shoulder[1],e.joints.shoulder[2]];o.add(sn(`arm${n}`,r,[.04,.04,.04],{k:.015,name:`shoulder${n}`}));let i=new P().setFromEuler(new F(...e.bind.armL.map((e,n)=>n===2?e*t:e))),a=new R(0,-l,0).applyQuaternion(i).add(new R(...r));o.add(sn(`fore${n}`,W(a),[.032,.032,.032],{k:.02,name:`elbow${n}`})),o.add(sn(`leg${n}`,[t*e.joints.hip[0],.1,e.joints.hip[2]+.005],[.035,.035,.035],{k:.02,name:`knee${n}`}))}U(e),Hn(e,{x:.36,y:.04,size:1.45,wide:1,slant:0,color:`#120e16`}),or(e,{w:.28,y:-.5,curve:.1,r:.0055,color:r});let u=new R(...s);for(let t=-3;t<=3;t++){let n=t/3.5*.28,i=-.5+.1*(n/.28)**2,a=sr(e,n,i).add(u),o=Zn(e,n,i);Nn(e,{bone:`neck`,pts:[a.clone().add(new R(0,.022,0)).addScaledVector(o,-.002),a.clone().addScaledVector(o,.002),a.clone().add(new R(0,-.022,0)).addScaledVector(o,-.002)],w:[0,.0032,0],t:[0,.0022,0],across:new R(1,0,0),colors:[r,r],name:`tooth${t}`})}for(let n of e.paws??[]){let r=new P().setFromEuler(new F(...n.rot)),i=new R(...n.at),a=(e,t,n)=>i.clone().add(new R(e,t,n).applyQuaternion(r));for(let i of[-1,0,1])Nn(e,{bone:n.bone,pts:[a(0,-.015,i*.016),a(.004,-.045,i*.02+.006),a(0,-.068,i*.022+.012)],w:[.008,.007,0],t:[.008,.007,0],across:new R(0,0,1).applyQuaternion(r),colors:[t.coat,t.coat],name:`finger${n.bone}${i}`})}for(let t of[.345,.4,.455])for(let n of[-1,1]){let r=[.28,.6,.95,1.3,1.65,2,2.35,2.7].map(r=>In(e,new R(0,t,.01),new R(n*Math.sin(r),-.28*Math.sin(r),Math.cos(r)))?.p);r.every(Boolean)&&Sn(e,{bone:`body`,pts:r,w:.0095,color:a})}let d=e=>{let t=(e.p.y-.33+.9*e.p.x*e.p.x)/.06;return Math.max(Math.abs(t-Math.floor(t)-.5)-.18,.03-Math.abs(e.p.x),e.p.y-.48)},f=tn(e,`head`),p=t=>B(V(e,`head`),e=>{let n=f(e);return n.z<0?1:t(n)});return e.marks={base:t.coat,marks:[{color:i,f:p(e=>Math.hypot(Math.abs(e.x)-.36,e.y-.04)-.33)},{color:r,f:p(e=>Math.hypot(Math.abs(e.x)-.045,e.y+.2)-.06+Math.max(0,e.y+.2)*.4)},...Cn()?[{color:a,f:B(V(e,`ribs`),d)}]:[]]},{}}},xu={fox:{lean:-.03,head:-.07,gait:`trot`,cadence:1.25,stride:.9,sit:`wrap`,idles:[`earSwivel`,`tailSwish`,`headTilt`],tailSway:.3},raccoon:{lean:.14,head:-.05,paws:.2,gait:`amble`,cadence:.85,sit:`tuck`,idles:[`rubPaws`,`sniff`,`lookAround`],tailSway:.18},snail:{gait:`slither`,cadence:.55,sit:`settle`,idles:[`stalks`,`stretch`,`stalks`],tailSway:0},shark:{lean:.04,head:-.02,gait:`waddle`,cadence:1,stride:.7,sit:`settle`,bed:`side`,idles:[`tailSwish`,`headTilt`,`chill`],tailSway:.25},jellyfish:{gait:`float`,cadence:.6,sit:`settle`,idles:[`sway`,`chill`,`sway`],tailSway:0},octopus:{gait:`scuttle`,cadence:1.1,sit:`settle`,bed:`upright`,idles:[`sway`,`stretch`,`chill`],tailSway:0},penguin:{lean:-.02,head:-.04,gait:`waddle`,cadence:1.2,stride:.55,sit:`settle`,idles:[`flap`,`headTilt`,`chill`],tailSway:.1},duck:{lean:.04,head:-.03,gait:`waddle`,cadence:1.15,stride:.6,sit:`settle`,idles:[`flap`,`headTilt`,`wag`],tailSway:.2},bat:{gait:`flap`,cadence:1.2,sit:`settle`,idles:[`wingStretch`,`scratch`,`lookAround`],tailSway:0},squid:{gait:`scuttle`,cadence:1,sit:`settle`,idles:[`sway`,`chill`,`stretch`],tailSway:0},hedgehog:{lean:.04,head:-.04,paws:.1,gait:`trot`,cadence:1.5,stride:.6,sit:`tuck`,bed:`side`,idles:[`sniff`,`noseWiggle`,`lookAround`],tailSway:0},axolotl:{lean:.02,head:-.02,gait:`waddle`,cadence:.9,stride:.7,sit:`settle`,idles:[`headTilt`,`tailSwish`,`chill`],tailSway:.3},gecko:{lean:.05,head:-.04,gait:`trot`,cadence:1.3,stride:.8,sit:`tuck`,idles:[`lookAround`,`tailCurl`,`headTilt`],tailSway:.3},highland:{lean:.04,head:-.02,gait:`amble`,cadence:.75,stride:.9,sit:`tuck`,idles:[`chill`,`headTilt`,`tailSwish`],tailSway:.2},deer:{lean:-.02,head:-.06,gait:`trot`,cadence:1.1,stride:1,sit:`tuck`,idles:[`earTwitch`,`lookAround`,`headTilt`],tailSway:.1},sloth:{lean:.06,head:-.04,gait:`amble`,cadence:.5,stride:.8,sit:`tuck`,idles:[`slowBlink`,`stretch`,`headTilt`],tailSway:0},seal:{lean:.02,head:-.02,gait:`waddle`,cadence:.9,stride:.6,sit:`settle`,idles:[`headTilt`,`chill`,`flap`],tailSway:0},platypus:{lean:.05,head:-.03,gait:`waddle`,cadence:1,stride:.7,sit:`settle`,idles:[`sniff`,`tailSwish`,`chill`],tailSway:.2},panda:{lean:.06,head:-.03,gait:`amble`,cadence:.8,stride:.9,sit:`feet`,idles:[`chill`,`headTilt`,`scratch`],tailSway:.05},otter:{lean:-.03,head:-.05,paws:.14,gait:`trot`,cadence:1.3,stride:.85,sit:`tuck`,idles:[`rubPaws`,`lookAround`,`headTilt`],tailSway:.3},capybara:{lean:.04,head:0,gait:`amble`,cadence:.7,stride:.8,sit:`tuck`,idles:[`chill`,`slowBlink`,`lookAround`],tailSway:0},wolf:{lean:-.02,head:-.05,gait:`trot`,cadence:1.1,stride:1,sit:`wrap`,idles:[`earSwivel`,`lookAround`,`pant`],tailSway:.2},bear:{lean:.06,head:-.03,gait:`amble`,cadence:.8,stride:.9,sit:`feet`,idles:[`scratch`,`sniff`,`chill`],tailSway:.05},redpanda:{lean:.03,head:-.04,gait:`amble`,cadence:1,stride:.85,sit:`wrap`,idles:[`lookAround`,`tailSwish`,`rubPaws`],tailSway:.25},quokka:{lean:.02,head:-.03,paws:.12,gait:`hop`,cadence:1,sit:`feet`,idles:[`headTilt`,`sniff`,`chill`],tailSway:.05},frog:{lean:.05,head:-.06,gait:`hop`,cadence:1,sit:`settle`,idles:[`throat`,`slowBlink`,`hop`],tailSway:0},ferret:{lean:-.02,head:-.05,paws:.1,gait:`trot`,cadence:1.45,stride:.85,sit:`tuck`,idles:[`sniff`,`hop`,`lookAround`],tailSway:.3},dugong:{lean:.03,head:-.02,gait:`waddle`,cadence:.75,stride:.5,sit:`settle`,idles:[`chill`,`slowBlink`,`flap`],tailSway:0},seacucumber:{gait:`slither`,cadence:.5,sit:`settle`,idles:[`stretch`,`sway`,`chill`],tailSway:0},ibis:{lean:.1,head:-.02,gait:`trot`,cadence:.95,stride:.8,sit:`settle`,idles:[`sniff`,`headTilt`,`wingStretch`],tailSway:.08},crab:{lean:0,head:0,paws:.12,gait:`scuttle`,cadence:1.3,stride:.6,sit:`settle`,idles:[`stalks`,`rubPaws`,`lookAround`],tailSway:0},turtle:{lean:.03,head:-.02,gait:`waddle`,cadence:.6,stride:.55,sit:`settle`,idles:[`slowBlink`,`headTilt`,`chill`],tailSway:.05},kaiju:{lean:.06,head:-.03,paws:.1,gait:`amble`,cadence:.7,stride:.85,sit:`tuck`,bed:`side`,idles:[`lookAround`,`stretch`,`tailSwish`],tailSway:.15},robot:{lean:0,head:0,gait:`waddle`,cadence:1.3,stride:.5,sit:`feet`,idles:[`headSwivel`,`lookAround`,`headTilt`],tailSway:0},homunculus:{lean:.04,head:-.04,gait:`trot`,cadence:1.4,stride:.75,sit:`feet`,idles:[`rubPaws`,`earTwitch`,`headTilt`,`lookAround`],tailSway:0},fungi:{lean:0,head:-.02,gait:`hop`,cadence:1.05,sit:`feet`,idles:[`sway`,`headTilt`,`slowBlink`],tailSway:0},dragon:{lean:.03,head:-.04,paws:.12,gait:`waddle`,cadence:1.05,stride:.65,sit:`feet`,bed:`side`,idles:[`flutter`,`tailSwish`,`lookAround`,`flutter`],tailSway:.2},bee:{lean:.02,head:-.03,gait:`flap`,cadence:1.3,stride:.7,sit:`settle`,idles:[`rubPaws`,`earTwitch`,`lookAround`],tailSway:0},chameleon:{lean:.04,head:-.03,gait:`amble`,cadence:.6,stride:.75,sit:`feet`,idles:[`sway`,`headTilt`,`lookAround`],tailSway:.05},whaleshark:{lean:.03,head:-.02,gait:`waddle`,cadence:.75,stride:.6,sit:`settle`,bed:`side`,idles:[`slowBlink`,`tailSwish`,`chill`],tailSway:.22},prawn:{lean:.02,head:-.03,paws:.12,gait:`scuttle`,cadence:1.35,stride:.6,sit:`settle`,idles:[`stalks`,`rubPaws`,`tailSwish`],tailSway:.2},meerkat:{lean:-.04,head:-.06,paws:.17,gait:`trot`,cadence:1.55,stride:.75,sit:`feet`,idles:[`sentinel`,`lookAround`,`sniff`,`sentinel`],tailSway:.12},skeleton:{lean:0,head:-.03,gait:`trot`,cadence:1.2,stride:.85,sit:`feet`,idles:[`headTilt`,`lookAround`,`stretch`],tailSway:0}},Su={fox:{toes:2,paws:2},penguin:{toes:2},wolf:{toes:2,paws:2},redpanda:{toes:2,paws:2},quokka:{toes:2},panda:{toes:2},raccoon:{toes:3},bear:{claws:3},gecko:{toes:3,paws:3},otter:{toes:3},ferret:{toes:2,paws:2},kaiju:{claws:3},homunculus:{toes:3},dragon:{claws:3},chameleon:{toes:1,paws:1},meerkat:{toes:2,claws:3},skeleton:{toes:2}};function Cu(e){return{...Vn(),...xu[e]}}var wu=`bx.by.bz.brx.bry.brz.hrx.hry.hrz.alx.alz.arx.arz.aly.ary.wl.wr.llx.llz.lrx.lrz.trx.try.tilt.sl.sr.el.er.carry`.split(`.`),Tu={x:.31,y:-2.575,z:-.455,el:2.4,w:.3},Eu=()=>({bx:0,by:0,bz:0,brx:0,bry:0,brz:0,hrx:0,hry:0,hrz:0,alx:-.14,alz:.16,arx:-.14,arz:-.16,aly:0,ary:0,wl:1,wr:1,llx:0,llz:0,lrx:0,lrz:0,trx:0,try:0,tilt:0,sl:1,sr:1,el:0,er:0,carry:0}),Du=()=>[0,0,0,0,0,0,1];function $(e,t){let n=e.get(t);return n||e.set(t,n=Du()),n}var Ou={dy:-.06,dz:.07,out:.05,sip:[.14,0,.6]},ku={ale:Ou,cider:Ou,milk:Ou,cocoa:Ou,wine:{dy:-.04,dz:.07,out:.05,sip:[.185,.03,.5]},bun:{dy:-.02,dz:.07,out:.04,sip:[.05,-.06,0]},loaf:{dy:-.08,dz:.07,out:0,both:!0,sip:[.04,-.1,0]},pie:{dy:-.08,dz:.07,out:0,both:!0,sip:[.06,-.1,0]},fish:{dy:.02,dz:.08,out:.16},flower:{dy:0,dz:.07,out:.12},rod:{dy:-.14,dz:.02,out:.1},can:{dy:-.18,dz:.05,out:0,both:!0,hang:.1},washing:{dy:-.2,dz:.1,out:.02,both:!0,hang:.12},water:{dy:-.06,dz:.02,out:.12,sip:[-.1,-.07,.4],hang:.32},firewood:{dy:-.08,dz:.03,out:0,both:!0,hang:.1},grimoire:{dy:-.12,dz:.12,out:0,both:!0}},Au={earSwivel:2.4,earTwitch:1.1,tailSwish:2.4,headTilt:2.2,sniff:2.1,rubPaws:2.6,noseWiggle:1.5,hop:1.2,stalks:3.4,stretch:3.2,headSwivel:2.8,slowBlink:1.8,lickPaw:3,tailCurl:2.6,wag:2,pant:2.6,sway:3.2,scratch:2.2,flap:1.6,throat:2,chill:4.5,wingStretch:2.8,flutter:2.2,lookAround:3,sentinel:4.2},ju=e=>Math.min(1,Math.max(0,e)),Mu=e=>{let t=ju(Math.min(e/.2,(1-e)/.2));return t*t*(3-2*t)},Nu=new ye({color:`#3a4a7a`,transparent:!0,opacity:.85}),Pu={buzz:{shut:[.95,-.5],open:[0,0],rate:70,beat:.5,ease:6},flutter:{shut:[0,0],open:[-.4,-.45],rate:21,beat:.5,ease:9}},Fu=[`foreL`,`foreR`,`wingL`,`wingR`,`turretL`,`turretR`],Iu=[`body`,`neck`,`eyes`,`armL`,`armR`,`legL`,`legR`,`tail`];function Lu(e){let t=e.joints,n=[[`body`,null,[0,0,0]],[`neck`,`body`,t.neck],[`eyes`,`neck`,[0,e.eyeY,0]],[`armL`,`body`,t.shoulder],[`armR`,`body`,[-t.shoulder[0],t.shoulder[1],t.shoulder[2]]],[`legL`,`body`,t.hip],[`legR`,`body`,[-t.hip[0],t.hip[1],t.hip[2]]],[`tail`,`body`,t.tail],...e.bones.map(e=>[e.name,e.parent,e.pos])],r={names:[],parent:new Map,local:new Map,rest:new Map};for(let[e,t,i]of n)r.names.push(e),r.parent.set(e,t),r.local.set(e,new R(...i)),r.rest.set(e,new R(...i).add(t?r.rest.get(t):new R));return r}function Ru(e,t){let n=new Map(t.names.map((e,t)=>[e,t])),r=[],i=[],a=[],o=[],s=[],c=e=>e.glass?2:+!!e.eyes;for(let l of[0,1,2]){let u=r.length/3;for(let s of e.parts.values()){if(c(s)!==l||s.fold.empty)continue;let u=t.rest.get(s.space)??new R,d=e.bind?.[s.space]?new P().setFromEuler(new F(...e.bind[s.space])):null,f=new R,p=n.get(s.bone)??0,m=s.chain?.map(e=>n.get(e)??p),h=s.fold,g=h.bones?.map(e=>n.get(e)??p);for(let e=0;e<h.pos.length/3;e++){f.fromArray(h.pos,e*3),d&&f.applyQuaternion(d),r.push(f.x+u.x,f.y+u.y,f.z+u.z),i.push(h.col[e*3],h.col[e*3+1],h.col[e*3+2]);let t=h.along[e];if(g)for(let t=0;t<4;t++)a.push(g[h.si[e*4+t]]),o.push(h.sw[e*4+t]);else if(m&&t>=0){let e=m.length,n=t*e,r=Math.min(e-1,Math.floor(n));r>=e-1?(a.push(m[e-1],0,0,0),o.push(1,0,0,0)):(a.push(m[r],m[r+1],0,0),o.push(1-(n-r),n-r,0,0))}else a.push(p,0,0,0),o.push(1,0,0,0)}}s.push([u,r.length/3-u])}let l=new Ie;return l.setAttribute(`position`,new Bt(r,3)),l.setAttribute(`color`,new Bt(i,3)),l.setAttribute(`skinIndex`,new Ve(a,4)),l.setAttribute(`skinWeight`,new Bt(o,4)),l.addGroup(s[0][0],s[0][1],0),l.addGroup(s[1][0],s[1][1],1),s[2][1]&&l.addGroup(s[2][0],s[2][1],2),l.computeVertexNormals(),Et&&zu(l),l.computeBoundingSphere(),l}function zu(e){let t=e.getAttribute(`position`),n=e.getAttribute(`normal`),r=new R,i=new R,a=new R,o=[];for(let e=0;e<t.count/3;e++)r.fromBufferAttribute(t,e*3),i.fromBufferAttribute(t,e*3+1),a.fromBufferAttribute(t,e*3+2),o.push(a.sub(i).cross(r.sub(i)).clone());let s=new Map;for(let e=0;e<t.count;e++){let n=`${Math.round(t.getX(e)*1e5)},${Math.round(t.getY(e)*1e5)},${Math.round(t.getZ(e)*1e5)}`,r=s.get(n);r?r.push(e):s.set(n,[e])}let c=Math.cos(Ke.degToRad(60)),l=new R,u=new R;for(let e of s.values())for(let t of e){l.copy(o[Math.floor(t/3)]).normalize(),u.set(0,0,0);for(let t of e){let e=o[Math.floor(t/3)];e.dot(l)>=c*e.length()&&u.add(e)}u.lengthSq()>1e-20&&n.setXYZ(t,...u.normalize().toArray())}n.needsUpdate=!0}var Bu=new Map,Vu=e=>Math.atan2(Math.sin(e),Math.cos(e)),Hu=new R(1,0,0);function Uu(e,t,n,r=1.3){let i=n.clone().sub(e),a=t.length(),o=Ke.clamp(i.length()/a,.7,r),s=i.normalize().multiplyScalar(a),c=Math.asin(Ke.clamp(s.x/-t.y,-1,1)),l=t.y*Math.cos(c);return{ax:Vu(Math.atan2(s.z,s.y)-Math.atan2(t.z,l)),az:c,s:o}}var Wu=-.012,Gu=new R,Ku=new R,qu=new R,Ju=new R,Yu=new R(0,1,0),Xu=new z,Zu=new P,Qu=new P,$u=new P,ed=class{root=new Mt;lowPoints=null;headHeight=1;float=new Mt;bones=new Map;body;neck;armL;armR;legL;legR;tail;blinkers;extra;foreL;foreR;elbow;hand=new Mt;handTilt=new Mt;mesh;sk;material;eyeMaterial;ghostMaterial;wisp;item=null;itemKey=``;hold=null;ghost=!1;pose=Eu();auxNow=new Map;phase=0;animNow=`idle`;animStart=0;blinkAt=2+Math.random()*3;blinkT=-1;seed=Math.random()*100;footLift=0;bedLift=0;prof;clip=null;nextClip=1.5+Math.random()*3;shut=0;grow=0;floats;hover;flaps;tentacles;noLegs;sleepy;tendril;wings=null;flutter=0;turrets=[];shift;glassMaterial=null;owned=[];highGeo;detail=`high`;lowKit;lowKey;hatFit;hat=null;hatFx=null;hatFxOn=!0;baseHeadHeight=1;shoulder;grip;paw;pawR;seat;sitLeg;sipLow;lift;armFwd;armOut;front;mouth;eyePos;neckPos;headC;headR;hasLegs;shape;v=new R;v2=new R;v3=new R;m4=new z;m5=new z;m6=new z;constructor(e){let t=e.kit,n=t.joints;this.prof=e.profile,this.floats=e.floats,this.hover=e.hover??.35,this.flaps=!!e.flaps,this.tentacles=e.tentacles,this.noLegs=!!e.noLegs,this.sleepy=!!e.sleepy,this.tendril=!!e.tendril,this.shift=e.shift??null,this.material=e.material,this.eyeMaterial=e.eyeMaterial??e.material,this.hatFit=e.hatFit,this.lowKit=e.lowKit,this.lowKey=e.lowKey,this.owned.push(e.material),e.eyeMaterial&&this.owned.push(e.eyeMaterial),this.shoulder=new R(-n.shoulder[0],n.shoulder[1],n.shoulder[2]),this.grip=new R(...n.hand),this.paw=new R(...n.paw??[n.hand[0],n.hand[1],n.hand[2]*.2]),this.pawR=Math.max(.03,(n.hand[2]-this.paw.z)*.9),this.seat=t.seat;let r=t.sculpt?.named(`legLFoot`),i=r?t.joints.hip[1]-r.c.y:0;this.sipLow=!!t.sipLow,this.lift=t.lift??0,this.sitLeg=r?-Math.acos(Ke.clamp((i-t.seat)/i,-1,1)):null;let a=t.bind?.armL;this.armFwd=a?-a[0]:.14,this.armOut=a?a[2]:.16,this.shape=t.shape;let o=t.shape;this.front=t.front??o.tc[2]+o.tr[2]*1.12,this.mouth=new R(...t.nose??[0,o.hc[1]-o.hr[1]*.4,o.hc[2]+o.hr[2]]).add(new R(...n.neck)),this.eyePos=new R(t.eyeX,t.eyeY,t.eyeZ).add(new R(...n.neck)),this.neckPos=new R(...n.neck),this.headC=new R(...o.hc).add(this.neckPos),this.headR=new R(o.hr[0]*1.15,o.hr[1],o.hr[2]),this.hasLegs=!t.legL.empty||!!t.sculpt?.shapes.some(e=>e.bone===`legL`),this.sk=Lu(t);for(let e of this.sk.names){let t=new Gt;t.name=e,t.position.copy(this.sk.local.get(e));let n=this.sk.parent.get(e);(n?this.bones.get(n):this.float).add(t),this.bones.set(e,t)}let s=e=>this.bones.get(e);this.body=s(`body`),this.neck=s(`neck`),this.armL=s(`armL`),this.armR=s(`armR`),this.legL=s(`legL`),this.legR=s(`legR`),this.tail=s(`tail`),this.blinkers=t.blink.map(s).filter(Boolean),this.foreL=this.bones.get(`foreL`)??null,this.foreR=this.bones.get(`foreR`)??null,this.elbow=this.foreR?t.elbow??0:0,this.extra=this.sk.names.filter(e=>!Iu.includes(e)&&!Fu.includes(e));let c=this.bones.get(`wingL`),l=this.bones.get(`wingR`);if(e.wings&&c&&l&&(this.wings={mode:e.wings,bones:[[c,1],[l,-1]],open:0,want:0,phase:0}),e.swivel)for(let[e,t]of[[`turretL`,1],[`turretR`,-1]]){let n=this.bones.get(e);n&&this.turrets.push({bone:n,side:t,yaw:0,pitch:0,toYaw:0,toPitch:0,next:0})}if(this.root.add(this.float),this.hand.matrixAutoUpdate=!1,(this.foreR??this.armR).add(this.hand),this.hand.add(this.handTilt),this.highGeo=Ru(t,this.sk),this.highGeo.groups.length>2){let e=ot();e.transparent=!0,e.opacity=.5,e.depthWrite=!1,this.glassMaterial=e,this.owned.push(e)}this.mesh=new De(this.highGeo,this.skinMaterials()),this.mesh.castShadow=!0,this.mesh.receiveShadow=!1,this.float.add(this.mesh);for(let[e,n]of Object.entries(t.bind??{}))this.bones.get(e)?.rotation.set(...n);this.root.updateMatrixWorld(!0),this.mesh.bind(new j(this.sk.names.map(s)));{let e=this.highGeo.getAttribute(`position`),t=this.highGeo.getAttribute(`skinIndex`),n=new Set(this.chainOf(`tail`).map(e=>this.sk.names.indexOf(e))),r=0;for(let i=0;i<e.count;i++)n.has(t.getX(i))||(r=Math.min(r,e.getY(i)));this.footLift=Math.min(.05,-r)}this.mesh.boundingSphere=new Ft(new R(0,.5,0),1.4),this.ghostMaterial=new Tt({color:e.ghostColor,emissive:`#9fc4ff`,emissiveIntensity:.55,transparent:!0,opacity:.6,depthWrite:!0,roughness:1,flatShading:!0}),this.owned.push(this.ghostMaterial);let u=new qn;lr(u,yn(7),{pts:[[0,.36,0],[0,.22,-.02],[.02,.08,-.07],[.05,-.02,-.15]],radii:[.17,.14,.08,.02],sides:7,jitter:.1,round:!1,color:`#ffffff`}),this.wisp=new Je(u.geometry(),this.ghostMaterial),this.wisp.visible=!1,t.sculpt&&(this.wisp.scale.set(.8,1.6,.8),this.wisp.position.y=.36*(1-1.6)),this.body.add(this.wisp),e.extras?.(this.body,this.handTilt,this.armL),this.noLegs&&(this.wisp.visible=!t.sculpt,this.wisp.material=this.material),this.applyPose(1),this.root.updateMatrixWorld(!0),this.headHeight=this.measureHead()+(this.floats&&!this.flaps?this.hover:0),this.baseHeadHeight=this.headHeight,this.bedLift=this.measureBed()}measureBed(){let e={...this.pose},t=new Map([...this.auxNow].map(([e,t])=>[e,[...t]])),n=this.prof.bed===`upright`?[]:this.freeChains(),r=new Set(n.flatMap(e=>this.chainOf(e).map(e=>this.sk.names.indexOf(e)))),i=this.highGeo.getAttribute(`skinIndex`),a=this.highGeo.getAttribute(`skinWeight`),o=new R,s=1/0;for(let e of[0,1.4,2.8,4.2,5.6]){this.applyPose(1,this.target({anim:`sleep`,speed:0,dt:0,t:e-this.seed})),this.root.updateMatrixWorld(!0);let t=n.flatMap(e=>this.bones.get(e)?.getWorldPosition(new R)??[]);for(let e=0;e<i.count;e++){let n=0;for(let t=0;t<4;t++)r.has(i.getComponent(e,t))&&(n+=a.getComponent(e,t));this.mesh.getVertexPosition(e,o),!(n>.85&&t.every(e=>e.distanceTo(o)>.18))&&(s=Math.min(s,o.y))}}return Object.assign(this.pose,e),this.auxNow=t,this.clip=null,this.applyPose(1),this.root.updateMatrixWorld(!0),s===1/0?0:.032-this.footLift-s}measureHead(){let e=this.mesh.geometry.getAttribute(`position`),t=this.mesh.geometry.getAttribute(`skinIndex`),n=new Set;this.sk.names.forEach((e,t)=>{for(let r=e;r;r=this.sk.parent.get(r))if(r===`neck`){n.add(t);break}});let r=0;for(let i=0;i<e.count;i++)n.has(t.getX(i))&&(r=Math.max(r,e.getY(i)));return r}inspect(){return{mesh:this.mesh,bones:this.bones,shape:this.shape,item:this.item,body:this.body,neck:this.neck,profile:this.prof,hold:this.hold}}setHat(e){if(!this.hatFit||(this.hat?.id??null)===e)return;if(this.hat){this.hat.holder.removeFromParent(),this.hat.built.group.traverse(e=>e.isMesh&&e.geometry.dispose());for(let e of this.hat.built.materials)e.dispose();this.hat=null}if(this.hatFx?.dispose(),this.hatFx=null,this.headHeight=this.baseHeadHeight,!e)return;let t=jc(e);if(!t)return;let n=`${this.hatFit.id}:${e}`,r=rd.get(n);if(!r){let i=this.hatFit,a=this.prof.head+(this.sleepy?.2:0);r=Uc(e,t,{...i.head,droop:a,bits:this.hatBits()},{...i.nudge,...i.nudge.hats?.[e]}),rd.set(n,r)}let i=new Mt;i.position.set(...r.pos),i.rotation.set(...r.rot),i.scale.set(...r.scale),i.add(t.group),this.neck.add(i),this.hat={id:e,built:t,holder:i,fold:r.fold},this.applyHatGhost();let a=this.floats&&!this.flaps?this.hover:0;this.hatFx=ul(e,this.baseHeadHeight-a,this.girth()),this.hatFx&&(this.hatFx.group.visible=this.hatFx.ground.visible=!1,this.float.add(this.hatFx.group),this.root.add(this.hatFx.ground));let o=this.sk.rest.get(`neck`).y+r.pos[1]+t.top*r.scale[1]+(this.floats?this.hover:0);this.headHeight=Math.max(this.baseHeadHeight,o)}girth(){let e=this.highGeo;e.boundingBox||e.computeBoundingBox();let t=e.boundingBox;return Ke.clamp(Math.max(-t.min.x,t.max.x)+.1,.36,.8)}showHatFx(e){this.hatFxOn=e}hatBits(){let e=this.hatFit,t=this.highGeo.getAttribute(`position`),n=this.highGeo.getAttribute(`skinIndex`),[r,i,a]=e.neckAt,{c:o,r:s}=e.head,c=Math.min(e.head.eye.at[1]-e.head.eye.r,o[1]),l=e.nudge.bumps,u=new Map;for(let e=0;e<t.count;e++){let d=this.sk.names[n.getX(e)];if(!od(d))continue;let f=new R(t.getX(e)-r,t.getY(e)-i,t.getZ(e)-a),p=d;if(d===`neck`){if(f.y<c)continue;let e=((f.x-o[0])/s[0])**2+((f.y-o[1])/s[1])**2+((f.z-o[2])/s[2])**2>1.25;if(e&&l===`none`)continue;p=e&&l!==`head`?`neck`:`skull`}(u.get(p)??u.set(p,[]).get(p)).push(f)}let d=[];for(let[e,t]of u){let n=e===`skull`?160:30,r=Math.max(1,Math.floor(t.length/n)),i=t.filter((e,t)=>t%r===0);if(e===`neck`)for(let n of ad(t,.03))d.push({bone:e,is:`solid`,pts:n.filter((e,t)=>t%Math.max(1,Math.floor(n.length/30))===0)});else d.push({bone:e,is:e===`skull`?`head`:od(e),pts:i})}return d}applyHatGhost(){let e=this.hat?.built.solid??[];for(let{mesh:t,material:n}of e)t.material=this.ghost?this.ghostMaterial:n,t.castShadow=!this.ghost}setDetail(e){if(e!==this.detail){if(e===`low`){let e=this.prepareLow();if(!e)return;this.mesh.geometry=e}else this.mesh.geometry=this.highGeo;this.detail=e}}prepareLow(){if(!this.lowKit||!this.lowKey)return null;let e=Bu.get(this.lowKey);return e||(e=Ru(Dn(this.lowKit),this.sk),Bu.set(this.lowKey,e)),e}setItem(e){let t=e?`${e.k}:${e.c??``}`:``;t!==this.itemKey&&(this.itemKey=t,this.item&&=(this.handTilt.remove(this.item),ur(this.item),null),this.hold=e?ku[e.k]??Ou:null,e&&(this.item=dr(e),this.item.traverse(e=>e.castShadow=!this.ghost),this.handTilt.add(this.item)))}skinMaterials(){let e=this.glassMaterial?[this.ghost?this.ghostMaterial:this.glassMaterial]:[];return this.ghost?[this.ghostMaterial,Nu,...e]:[this.material,this.eyeMaterial,...e]}setGhost(e){e!==this.ghost&&(this.ghost=e,this.mesh.material=this.skinMaterials(),this.mesh.castShadow=!e,!this.noLegs&&this.hasLegs&&(this.wisp.visible=e),this.wisp.material=e||!this.noLegs?this.ghostMaterial:this.material,this.item?.traverse(t=>t.castShadow=!e),this.applyHatGhost())}reach(e,t,n,r,i,a=`grip`){let o=this.shoulder,s=a===`paw`?this.paw:this.grip,c=new R(o.x-i,Math.max(.1,n),r),l=this.elbow?this.bendFor(s,c.distanceTo(o)):0,{ax:u,az:d,s:f}=Uu(o,this.elbow?this.bent(s,l):s,c,this.tendril?2:this.elbow?1.15:1.3);t!==`l`&&(e.arx=u,e.arz=d,e.sr=f,e.er=l),t!==`r`&&(e.alx=u,e.alz=-d,e.sl=f,e.el=l)}bent(e,t){let n=new R(0,this.elbow,0);return e.clone().add(n).applyAxisAngle(Hu,-t).sub(n)}bendFor(e,t){let n=0,r=2.6;if(this.bent(e,0).length()<=t)return 0;for(let i=0;i<14;i++){let i=(n+r)/2;this.bent(e,i).length()>t?n=i:r=i}return(n+r)/2}holdSpot(e){let t=this.shoulder.y-this.grip.length()*.8,n=Math.min(Math.max(t,this.shoulder.y+e.dy),this.sipLow?this.shoulder.y-.1:1/0);return{y:this.tendril?Math.max(n+.1,(e.hang??.08)+.18,.54):n+this.lift,z:Math.max(this.front+e.dz,this.front+this.pawR+(this.grip.z-this.paw.z)*.8)+(this.tendril?-.02:0)}}carryPose(e,t,n=!1){let r=this.hold;if(!r)return;let i=this.holdSpot(r),a=r.both&&!n;this.reach(e,a?`both`:`r`,i.y,i.z,a?r.out:Math.max(r.out,.04)),e.arx+=t,e.carry=0,a&&(e.alx+=t,e.carry=1)}headNow(e,t){return e.clone().sub(this.neckPos).applyAxisAngle(new R(1,0,0),t).add(this.neckPos)}reachLength(){return this.grip.length()}faceFront(e){let t=(e-this.headC.y)/this.headR.y;return this.headC.z+this.headR.z*Math.sqrt(Math.max(0,1-t*t))}besideHead(e=0){return this.headR.x+this.pawR+.03+e-Math.abs(this.shoulder.x)}raise(e,t,n,r=0){let i=this.besideHead(r)+(this.flaps?.22:0),a=this.shoulder,o=this.headC.z,s=this.paw.length()*1.25,c=s*s-i*i-(o-a.z)**2,l=a.y+Math.sqrt(Math.max(0,c));this.reach(e,t,Math.min(n,l),o,i,`paw`)}freePaw(e){if(!this.prof.paws)return;let t=this.rest();this.reach(t,`l`,this.shoulder.y-this.prof.paws,this.front+this.pawR+.01,-.035,`paw`),e.alx=t.alx,e.alz=t.alz,e.sl=t.sl,e.el=t.el}folded(e){return e.anim===`idle`||e.anim===`sit`||e.anim===`sleep`||e.anim===`drink`||e.anim===`fish`||e.anim===`laugh`||e.anim===`cry`}rest(){let e=Eu();return e.alx=e.arx=-this.armFwd,e.alz=this.armOut,e.arz=-this.armOut,e}gait(e,t,n){let r=n.anim===`run`,i=this.phase,a=Math.sin,o=this.prof,s=Ke.clamp(Math.max(n.speed,r?3:1.5)/3.6,.35,.95)*o.stride;switch(o.gait){case`hop`:{let n=Math.max(0,a(i)),s=Math.max(0,-a(i));e.by=n*(r?.13:.085),e.brx=.05+n*.14,e.llx=e.lrx=n*.6-s*.25,this.reach(e,`both`,this.shoulder.y-(o.paws||.1)+n*.02,this.front+this.pawR+.01,-.03,`paw`),e.alx-=n*.15,e.arx-=n*.15,e.hrx=-n*.12,$(t,`earL`)[0]=$(t,`earR`)[0]=-.2-n*.45;break}case`slither`:{let n=a(i);$(t,`rear`)[5]=.08*n,e.hrx=-.14*Math.max(0,-n)+.05,e.hrz=a(i*.5)*.06,e.brx=0,e.by=Math.max(0,n)*.012,$(t,`stalkL`)[0]=$(t,`stalkR`)[0]=.18+.08*n,$(t,`stalkL`)[2]=.06+a(i*.5)*.08,$(t,`stalkR`)[2]=-.06+a(i*.5+1)*.08;break}case`waddle`:{e.llx=a(i)*s*.9,e.lrx=-a(i)*s*.9,e.brz=a(i)*.17,e.bry=a(i)*.06,e.by=Math.abs(a(i))*.03,e.brx=r?.12:.03,e.hrz=-e.brz*.7,e.hrx=-e.brx*.6;let t=.35+Math.abs(a(i))*.12;e.alz=this.armOut+t,e.arz=-this.armOut-t,e.alx=e.arx=-this.armFwd-.05,e.try=-a(i)*.45;break}case`float`:e.by=a(i*.5)*.03,e.brx=r?.25:.14,e.brz=a(i*.5)*.05,e.hrx=-e.brx*.4,e.alx=e.arx=-this.armFwd+.35+a(i-.8)*.15,e.alz=this.armOut+.1,e.arz=-this.armOut-.1,e.llx=e.lrx=.4+a(i-1.2)*.15;break;case`flap`:e.by=Math.abs(a(i))*.04,e.brx=r?.3:.18,e.hrx=-e.brx*.7,e.llx=e.lrx=.5,e.brz=a(i*.5)*.06;break;case`scuttle`:e.by=Math.abs(a(i*2))*.035,e.brz=a(i)*.1,e.bry=a(i)*.08,e.brx=r?.12:.04,e.hrz=-e.brz*.5,e.llx=a(i)*.3,e.lrx=-a(i)*.3,e.alx=-this.armFwd-.2-a(i)*.35,e.arx=-this.armFwd-.2+a(i)*.35,e.el=Math.max(0,a(i))*.6,e.er=Math.max(0,-a(i))*.6;break;case`amble`:{e.llx=a(i)*s*1.5,e.lrx=-a(i)*s*1.5;let n=r?Math.max(.58,this.armFwd+.25):Math.max(.34,this.armFwd+.08);e.alx=-n-a(i)*s*(r?.5:.55),e.arx=-n+a(i)*s*(r?.5:.55),e.el=Math.max(0,a(i))*.7,e.er=Math.max(0,-a(i))*.7,e.alz=.1,e.arz=-.1,e.brz=a(i)*.13,e.bry=a(i)*.09,e.by=Math.abs(a(i))*.04,e.brx=r?.18:.06,e.hrx=-e.brx*.6+a(i*2)*.05,e.hrz=-a(i)*.1,e.try=a(i-.6)*.4,e.trx=r?.2:.05,$(t,`tail1`)[1]=a(i-1.2)*.3,$(t,`tail2`)[1]=a(i-1.8)*.35;break}default:{e.llx=a(i)*s*1.4,e.lrx=-a(i)*s*1.4;let n=Math.max(.3,this.armFwd);e.alx=-n-a(i)*s*.55,e.arx=-n+a(i)*s*.55,e.el=Math.max(0,a(i))*.8,e.er=Math.max(0,-a(i))*.8,e.alz=.12,e.arz=-.12,e.by=Math.abs(a(i))*(r?.06:.045),e.brz=a(i)*.07,e.bry=a(i)*.05,e.brx=r?.14:.05,e.hrx=-e.brx*.6+Math.abs(a(i))*.04,e.try=a(i-.6)*.4,e.trx=r?.25:.08,$(t,`tail1`)[1]=a(i-1.2)*.3,$(t,`tail2`)[1]=a(i-1.8)*.35}}if(o.earsBack&&o.gait!==`hop`&&($(t,`earL`)[0]=$(t,`earR`)[0]=-o.earsBack*(r?1:.5)),this.hold){let t=[e.alx,e.alz,e.sl,e.el];this.carryPose(e,o.gait===`hop`?0:a(i)*.06),this.hold.both||([e.alx,e.alz,e.sl,e.el]=t)}}sit(e,t,n){let r=this.shoulder,i=this.prof.sit;if(i===`settle`||!this.hasLegs)e.by=-.01,e.hrx=.12,$(t,`rear`)[5]=.025,$(t,`stalkL`)[0]=$(t,`stalkR`)[0]=.3,$(t,`stalkL`)[2]=.12,$(t,`stalkR`)[2]=-.12,this.hold&&this.carryPose(e,0);else if(e.by=-this.seat+.004,i===`feet`?(e.brx=-.14,e.llx=e.lrx=this.sitLeg??-1.5,e.llz=.22,e.lrz=-.22,this.reach(e,`both`,r.y-Math.min(.2,this.grip.length()*.7),this.front+this.pawR+.005,-.05,`paw`),e.hrx=.1,e.trx=.4):(e.llx=e.lrx=this.sitLeg??-1.3,e.llz=.16,e.lrz=-.16,this.reach(e,`both`,this.seat+this.pawR*.8,this.front+this.pawR+.03,-.02,`paw`),i===`wrap`?(e.trx=.8,e.try=-.34,$(t,`tail1`)[0]=-.8,$(t,`tail1`)[1]=-1.6,$(t,`tail2`)[0]=-.66,$(t,`tail2`)[1]=-.85,e.hrz=.16,e.hry=.12+Math.sin(n*.3)*.08):(e.trx=.67,e.try=-.08,$(t,`tail1`)[0]=-.79,$(t,`tail1`)[1]=-1.08,$(t,`tail2`)[0]=.29,$(t,`tail2`)[1]=-1.21,e.hry=Math.sin(n*.35)*.2)),this.hold){let t=[e.alx,e.alz,e.sl,e.el];this.carryPose(e,0),this.hold.both||([e.alx,e.alz,e.sl,e.el]=t)}}dance(e,t,n,r){let i=Math.sin,a=Math.cos,o=this.shoulder,s=this.sk.rest.get(`legL`).y,c=r*2,l=(e,n)=>{$(t,`earL`)[0]=$(t,`earR`)[0]=e,$(t,`earL`)[2]=$(t,`earR`)[2]=n};switch(n){case`twerk`:{let n=Math.abs(i(r*13)),a=i(r*13),c=i(r*Math.PI);e.brx=.62+n*.16,e.bz=-.07,e.by=-.04+n*.035,e.bry=a*.15+c*.1,e.brz=a*.24,e.bx=o.y*i(e.brz),e.llx=e.lrx=-.6,e.llz=.32,e.lrz=-.32,this.reach(e,`both`,Math.max(s-.04,.12),this.front+this.pawR+.02,.06,`paw`);let u=Ke.smoothstep(i(r*1.3),.3,.8);e.hrx=-.55,e.hry=u*.9,e.hrz=u*.2,e.trx=.7,e.try=a*.9,$(t,`tail1`)[1]=a*.5,$(t,`tail2`)[1]=-a*.6,$(t,`rear`)[3]=a*.04,l(0,a*.2);break}case`griddy`:{let t=c%8;if(t<6){let n=Math.floor(t)%2?1:-1,r=i(t%1*Math.PI);e.by=r*.06,e.brx=-.1,e.llx=n>0?-.75*r:.15*r,e.lrx=n<0?-.75*r:.15*r,e.bry=n*.2*r,e.brz=n*.05;let a=n*(.4+.6*r);e.alx=-.3-a,e.arx=-.3+a,e.alz=this.armOut+.25,e.arz=-this.armOut-.25,e.el=e.er=.7,e.hrz=-n*.1,e.try=n*.6}else{let t=this.headNow(this.eyePos,-.15);this.reach(e,`both`,t.y,t.z+this.pawR+.04,t.x-Math.abs(o.x)-.02,`paw`);let n=i(r*10);e.alx+=n*.06,e.arx-=n*.06,e.hrx=-.15,e.hry=i(r*3)*.3,e.by=Math.abs(i(r*Math.PI*2))*.03,e.brx=-.06,e.llz=.12,e.lrz=-.12}l(-.15,0);break}case`floss`:{let t=i(r*Math.PI*2.2);e.alz=this.armOut+.2+t*1.15,e.arz=-this.armOut-.2+t*1.15,e.alx=e.arx=-.15-t*.95,e.brz=t*.16,e.bry=-t*.22,e.hrz=-t*.22,e.by=Math.abs(a(r*Math.PI*2.2))*.025,e.llz=.1-t*.12,e.lrz=-.1-t*.12,e.try=-t*.6,l(0,t*.2);break}case`robot`:{let t=Math.floor(c)%8,n=Math.PI*.85,r=-1.5,[i,a,o,s,l,u,d,f]=[[r,.15,r,-.15,0,0,0,0],[r,.15,-.1,-n,0,-.55,0,0],[-.1,1.5,-.1,-1.5,0,0,.45,0],[-.1,1.5,-.1,-1.5,1.4,.4,.45,.15],[-.1,n,r,-.15,0,.55,-.4,0],[-.2,.2,-.2,-.2,1.5,0,-.4,.3],[-.1,2.3,-.1,-.7,.9,-.3,0,-.1],[-.1,.7,-.1,-2.3,.9,.3,0,-.1]][t];e.alx=i,e.alz=a,e.arx=o,e.arz=s,e.el=e.er=l,e.hry=u,e.bry=d,e.hrx=f,e.by=Math.max(0,1-c%1*6)*.025,e.llz=.08,e.lrz=-.08;break}case`moonwalk`:{let t=r%4;if(t<2.8){let n=t/2.8;e.bz=.13-.3*n;let r=i(n*Math.PI*4);e.llx=r*.35,e.lrx=-r*.35,e.by=Math.abs(r)*.015,e.brx=.06,e.alx=-.2+r*.3,e.arx=-.2-r*.3,e.el=e.er=.8,e.hrx=-.05+Math.abs(r)*.05,e.try=r*.3}else if(t<3.4){let n=Ke.smoothstep((t-2.8)/.6,0,1);e.bry=n*Math.PI*2,e.bz=-.17+.3*n,e.alz=this.armOut+.6,e.arz=-this.armOut-.6,e.llz=.05,e.lrz=-.05,e.try=.6}else e.bz=.13,e.by=.04,e.brx=-.08,this.raise(e,`r`,this.headC.y+this.headR.y+.1,0),e.alz=this.armOut+.3,e.hrz=.2,e.hrx=-.15,e.llz=.02,e.lrz=-.02,l(-.3,0);break}case`horse`:{let t=r*4,n=Math.abs(i(t*Math.PI)),s=Math.floor(t/2)%2==0;e.by=n*.06,e.llx=s?-.55*n:.05,e.lrx=s?.05:-.55*n,e.brx=-.06,e.bry=(s?1:-1)*.12,e.brz=(s?-1:1)*.05,this.reach(e,`both`,o.y-.04+n*.03,this.front+this.pawR+.08,o.x-.02,`paw`),c%16>=12?(this.raise(e,`r`,this.headC.y+this.headR.y+.14,.04+i(r*14)*.08),e.arx+=a(r*14)*.25,e.hrx=-.2):e.hrx=n*.12-.04,e.try=(s?1:-1)*.5,l(-.2+n*.2,0);break}case`macarena`:{let t=c%16,n=Math.floor(t/2),r=Math.floor((t+15)/2)%8,a=o.x*2-.02,u=this.shape.tc[2]-this.shape.tr[2]-this.pawR,d=(t,n)=>{switch(Math.min(n,5)){case 0:this.reach(e,t,o.y-.02,this.front+.4,-.02,`paw`);break;case 1:this.reach(e,t,o.y+.04,this.front+.4,-.02,`paw`);break;case 2:this.reach(e,t,o.y-.02,this.front+this.pawR,a,`paw`);break;case 3:this.reach(e,t,this.headC.y+.04,this.headC.z-this.headR.z*.2,this.besideHead(.01),`paw`);break;case 4:this.reach(e,t,s+.04,this.front+this.pawR,a*.6,`paw`);break;default:this.reach(e,t,s+.02,u,.02,`paw`)}};d(`r`,n),d(`l`,r);let f=t>=12&&t<15?i((t-12)*Math.PI*2):0;e.bry=f*.25,e.brz=-f*.08,e.try=f*.8;let p=Math.floor(c/16)+(t>=15?Ke.smoothstep(t-15,0,1):0);e.bry+=p%4*(Math.PI/2),e.by=t>=15?i((t-15)*Math.PI)*.12:Math.abs(i(c*Math.PI))*.015,e.hry=t<12?n%2?.15:-.15:0,e.hrz=i(c*Math.PI)*.06,l(0,i(c*Math.PI)*.15);break}default:this.boughtDance(e,t,n,r)}}boughtDance(e,t,n,r){let i=Math.sin,a=Math.cos,o=this.shoulder,s=r*2,c=Ke.smoothstep,l=e=>o.x+e,u=(e,n)=>{$(t,`earL`)[0]=$(t,`earR`)[0]=e,$(t,`earL`)[2]=$(t,`earR`)[2]=n};switch(n){case`chicken`:{let n=s%8,a=i(r*Math.PI*8);if(n<2)this.reach(e,`both`,o.y+.03,this.front+this.pawR+.1,l(this.pawR+(a>0?.06:.01)),`paw`),e.hrx=a>0?-.12:.05,e.by=Math.abs(a)*.01;else if(n<4){let t=Math.abs(a);e.alz=this.armOut+.25+t*.75,e.arz=-(this.armOut+.25+t*.75),e.alx=e.arx=-.15,e.el=e.er=1.7,e.hrx=-.1+t*.12,e.by=t*.02}else if(n<6){let r=i((n-4)/2*Math.PI);e.by=-.07*r,e.brx=.25*r,e.bry=a*.3,e.try=a*1.1,e.llz=.1+r*.15,e.lrz=-.1-r*.15,e.alz=this.armOut+.45,e.arz=-(this.armOut+.45),e.el=e.er=1.3,$(t,`rear`)[3]=a*.05}else{let t=Math.abs(i(r*Math.PI*4));this.reach(e,`both`,o.y-.02,this.front+this.pawR+.08,l(this.pawR*.8+t*.08),`paw`),e.by=(1-t)*.015,e.hrx=-.08}u(-.1,a*.15);break}case`sprinkler`:{let t=s%6,n,r=0;if(t<4){let e=Math.floor(t*2),i=t*2%1;n=-.75+1.5*((e+Math.min(1,i*5))/8),r=Math.max(0,1-i*5)}else n=.75-1.5*c((t-4)/2,0,1);e.bry=n,this.reach(e,`l`,this.headC.y+.04,this.headC.z-this.headR.z*.2,this.besideHead(.01),`paw`),e.arx=-1.45+r*.06,e.arz=-this.armOut-.25,e.er=0,e.hry=n*.3,e.hrz=-.08,e.llx=-.25,e.lrx=.1,e.by=-.015-r*.012,e.try=n*.6,u(-.05,0);break}case`runningman`:{let t=Math.floor(s)%2==0,n=i(s%1*Math.PI);e.by=.015+n*.07,e.llx=t?-1*n:.4*n,e.lrx=t?.4*n:-1*n,e.brx=.1,e.el=e.er=1.4,e.alx=t?-.1+.4*n:-.5-.5*n,e.arx=t?-.5-.5*n:-.1+.4*n,e.alz=this.armOut+.1,e.arz=-this.armOut-.1,e.hrx=-.06+n*.06,e.bry=(t?1:-1)*.08*n,e.try=(t?1:-1)*.5,u(-.2+n*.2,0);break}case`ymca`:{let t=s%8,n=Math.floor(t/2),r=Math.max(0,1-t%2*4),a=this.headC.y+this.headR.y;e.by=Math.abs(i(s*Math.PI))*.015+r*.04,n===0?(e.alz=Math.PI*.78,e.arz=-Math.PI*.78,e.alx=e.arx=-.1,e.hrx=-.12):n===1?(this.raise(e,`both`,a,-.01),e.hrx=.1):n===2?(e.brz=.22,e.bx=o.y*i(.22)*.5,e.alz=2.3,e.alx=-.2,e.el=.9,this.reach(e,`r`,o.y-.06,this.front+this.pawR+.08,l(-o.x*.6),`paw`),e.hrz=.15):(e.alz=Math.PI*.94,e.arz=-Math.PI*.94,e.alx=e.arx=-.12,e.hrx=-.15),e.try=i(s*Math.PI)*.4,u(-.15,0);break}case`carlton`:{let t=s%8;if(t<6){let t=a(s*Math.PI),n=Math.abs(i(s*Math.PI));e.alz=this.armOut+.35+t*.8,e.arz=-(this.armOut+.35)+t*.8,e.alx=e.arx=-.55,e.el=e.er=1.1,e.bry=-t*.35,e.brz=-t*.07,e.bx=-t*.03,e.by=n*.03,e.llx=t>0?-.35*n:.05,e.lrx=t<0?-.35*n:.05,e.hry=t*.25,e.hrz=t*.1,e.try=-t*.7,u(0,t*.2)}else{let n=c(t-6,0,.3);e.alz=this.armOut+n*(Math.PI*.85-this.armOut),e.arz=-e.alz,e.alx=e.arx=-.2,e.hrx=-.3*n,e.by=i(Math.min(1,(t-6)/1.2)*Math.PI)*.06,e.brx=-.08*n,e.try=.8,u(-.3,0)}break}case`worm`:{let t=s%2/2,n=i(t*Math.PI*2),r=i(t*Math.PI*2-1.6);if(!this.hasLegs||this.floats){e.brx=.3-r*.25,e.by=Math.max(0,n)*.05,e.hrx=-.3-Math.max(0,r)*.3,e.trx=n*.5;break}e.brx=1.42-r*.22+n*.12,e.by=.15+Math.max(0,n)*.06+Math.max(0,r)*.05,e.bz=-.38+i(t*Math.PI)*.03,e.hrx=-1-Math.max(0,r)*.4,e.alx=e.arx=-2.4+Math.max(0,r)*.5,e.alz=this.armOut+.3,e.arz=-this.armOut-.3,e.el=e.er=.6+Math.max(0,-r)*.6,e.llx=e.lrx=.3+Math.max(0,n)*.6,e.llz=.08,e.lrz=-.08,e.trx=.5+n*.4,u(.25,0);break}}}mannerism(e,t,n){if(!this.clip&&n>=this.nextClip&&this.prof.idles.length){let e=this.prof.idles[Math.floor(Math.random()*this.prof.idles.length)],t=()=>Math.random()*2-1;this.clip={name:e,t0:n,dur:Au[e],side:Math.random()<.5?-1:1,data:[t(),t(),t(),t()]}}let r=this.clip;if(!r)return;let i=(n-r.t0)/r.dur;if(i>=1||i<0){this.clip=null,this.nextClip=n+2.5+Math.random()*4.5;return}let a=Mu(i),o=r.side,s=Math.sin,c=this.shoulder,l=(t,n)=>{for(let r of n)e[r]+=(t[r]-e[r])*a};switch(r.name){case`earSwivel`:{let n=Mu(ju(i/.65)),r=Mu(ju((i-.3)/.65));$(t,o>0?`earL`:`earR`)[1]+=o*.7*n,$(t,o>0?`earR`:`earL`)[1]+=-o*.7*r,$(t,`earL`)[0]-=.1*Math.max(n,r),$(t,`earR`)[0]-=.1*Math.max(n,r),e.hry+=o*.12*a;break}case`earTwitch`:{let e=s(i*Math.PI*4);$(t,o>0?`earL`:`earR`)[0]-=.5*e*e*a,$(t,o>0?`earL`:`earR`)[2]+=o*.15*e*a;break}case`tailSwish`:{let n=i*Math.PI*2*1.5;e.try+=s(n)*.6*a,$(t,`tail1`)[1]+=s(n-.8)*.4*a,$(t,`tail2`)[1]+=s(n-1.6)*.5*a;break}case`headTilt`:e.hrz+=o*.34*a,e.hry+=o*.14*a,e.hrx-=.06*a,$(t,`earL`)[1]+=.2*a,$(t,`earR`)[1]-=.2*a;break;case`sniff`:{e.hrx-=.22*a,e.hrx+=s(n*26)*.02*a;let r=$(t,`nose`);r[0]+=s(n*30)*.18*a,r[6]=1+.15*Math.max(0,s(n*30))*a;break}case`rubPaws`:{let t=this.rest();this.reach(t,`both`,c.y-.1,this.front+this.pawR+.02,this.pawR*.9-Math.abs(c.x),`paw`),l(t,[`alx`,`arx`,`alz`,`arz`,`sl`,`sr`]);let r=s(n*13)*.09*a;e.alz+=r,e.arz+=r,e.alx+=s(n*13+1.5)*.05*a,e.arx-=s(n*13+1.5)*.05*a,e.hrx+=.12*a;break}case`noseWiggle`:{let r=$(t,`nose`);r[0]+=s(n*26)*.25*a,r[1]+=s(n*19)*.18*a,r[6]=1+.12*s(n*26)*a,e.hrx+=s(n*13)*.02*a;break}case`hop`:{let n=Math.max(0,s(i*Math.PI*4))*a;e.by+=.075*n,e.llx+=.5*n,e.lrx+=.5*n,e.brx+=.08*n,$(t,`earL`)[0]-=.35*n,$(t,`earR`)[0]-=.35*n;break}case`stalks`:{let n=Mu(ju(i/.7)),o=Mu(ju((i-.25)/.7)),s=$(t,`stalkL`),c=$(t,`stalkR`);s[0]+=r.data[0]*.45*n,s[2]+=(.25+r.data[1]*.3)*n,c[0]+=r.data[2]*.45*o,c[2]-=(.25+r.data[3]*.3)*o,e.hry+=r.data[0]*.15*a;break}case`stretch`:$(t,`rear`)[5]-=.045*a,e.hrx-=.28*a,e.by+=.012*a,$(t,`stalkL`)[0]-=.25*a,$(t,`stalkR`)[0]-=.25*a,$(t,`stalkL`)[2]+=.12*a,$(t,`stalkR`)[2]-=.12*a;break;case`headSwivel`:e.hry+=o*1.1*Mu(ju(i/.8));break;case`slowBlink`:this.shut=Math.max(this.shut,a);break;case`chill`:this.shut=Math.max(this.shut,.55*a),e.hrx+=.06*a;break;case`lookAround`:e.hry+=s(i*Math.PI*2)*.55*a,e.hrx-=.05*a;break;case`sentinel`:{let n=i<.25?0:i<.5?o:i<.75?-o:0;e.by+=.015*a,e.brx-=.07*a,e.hrx-=.06*a,e.hry+=n*.75*a,$(t,`earL`)[0]-=.15*a,$(t,`earR`)[0]-=.15*a;break}case`tailCurl`:$(t,`tail1`)[0]-=.6*a,$(t,`tail2`)[0]-=.8*a;break;case`wag`:e.try=s(n*16)*.6*a+e.try*(1-a);break;case`pant`:e.hrx+=s(n*14)*.03*a-.05*a,e.by+=s(n*14)*.004*a;break;case`sway`:e.brz+=s(i*Math.PI*2)*.08*a,e.hrz-=s(i*Math.PI*2)*.05*a;break;case`scratch`:{let t=this.rest();this.reach(t,`r`,c.y-.18,this.front-.02,.03),l(t,[`arx`,`arz`,`sr`]),e.arz+=s(n*18)*.1*a,e.hrx+=.15*a;break}case`lickPaw`:{let t=this.rest();this.reach(t,`r`,this.mouth.y-.06,this.mouth.z+.02,.04-Math.abs(c.x)),l(t,[`arx`,`arz`,`sr`]),e.hrx+=(.18+s(n*9)*.05)*a,e.hry-=.15*a;break}case`flap`:case`wingStretch`:{let t=r.name===`flap`?s(n*14)*.4:0;e.alz+=(1.4+t)*a,e.arz-=(1.4+t)*a;break}case`throat`:$(t,`throat`)[6]=1+Math.max(0,s(n*9))*.3*a;break;case`flutter`:this.flutter=Math.max(this.flutter,a),e.by+=Math.max(0,s(i*Math.PI*4))*.018*a,e.hrx-=.1*a}}target(e){let t=this.rest(),n=new Map,r=e.t+this.seed,i=Math.sin,a=this.shoulder,o=this.prof;switch(e.anim!==`idle`&&(this.clip=null),e.anim!==this.animNow&&(this.animNow=e.anim,this.animStart=e.t),this.shut=0,this.flutter=0,e.anim){case`walk`:case`run`:this.gait(t,n,e);break;case`sit`:this.sit(t,n,r);break;case`sleep`:if(!this.hasLegs||this.floats){t.hrx=.35;for(let e of[`stalkL`,`stalkR`]){let t=$(n,e);t[0]=.6,t[6]=.4}$(n,`rear`)[5]=.03,this.hold&&this.carryPose(t,0);break}if(o.bed===`upright`){t.brx=-.45,t.bz=-.28,t.by=-.02,t.llx=t.lrx=.45,t.llz=.1,t.lrz=-.1,t.alz=.35,t.arz=-.35,t.hrx=.12;break}if(o.bed===`side`){t.brx=-Math.PI/2,t.bry=Math.PI/2,t.bz=.45,t.llx=t.lrx=.9,t.alx=t.arx=-.55,t.alz=.15,t.arz=-.15,t.hrx=.22,t.trx=.9,$(n,`earL`)[0]=$(n,`earR`)[0]=.3;break}t.brx=-Math.PI/2,t.by=.18,t.bz=.45,t.alz=.5,t.arz=-.5,t.alx=t.arx=-.3,t.llz=.15,t.lrz=-.15,t.hry=.25,t.trx=.6,$(n,`earL`)[0]=$(n,`earR`)[0]=.3;break;case`wave`:this.raise(t,`r`,this.headC.y+.02,.02+i(r*9)*.05),this.freePaw(t),t.hrz=.1,t.brz=.04,t.try=i(r*6)*.4,o.gait===`hop`&&(t.by=Math.max(0,i(r*4.5))*.03);break;case`hand`:this.raise(t,`r`,this.headC.y+this.headR.y+.12,-.02),this.freePaw(t),t.by=Math.abs(i(r*2.5))*.012,t.hrz=.06;break;case`cheer`:{let e=i(r*10)*.04;this.raise(t,`both`,this.headC.y+this.headR.y+.08+e,.03),t.by=Math.abs(i(r*5))*(o.gait===`hop`?.14:.1),t.hrx=-.18,t.try=i(r*10)*.5,$(n,`earL`)[0]=$(n,`earR`)[0]=-.25;break}case`dance`:{let e=i(r*5.5);t.by=Math.abs(e)*.09,t.bry=i(r*2.75)*.7,t.brz=e*.11,t.alz=1.2+e*.55,t.arz=-(1.2-e*.55),t.alx=t.arx=-.25,t.llx=Math.max(0,e)*-.55,t.lrx=Math.max(0,-e)*-.55,t.hrz=e*.15,t.try=e*.6,$(n,`earL`)[2]=e*.25,$(n,`earR`)[2]=e*.25,$(n,`rear`)[3]=e*.04,$(n,`stalkL`)[2]=.2+e*.25,$(n,`stalkR`)[2]=-.2+e*.25;break}case`twerk`:case`griddy`:case`floss`:case`robot`:case`moonwalk`:case`horse`:case`macarena`:case`chicken`:case`sprinkler`:case`runningman`:case`ymca`:case`carlton`:case`worm`:this.dance(t,n,e.anim,e.t-this.animStart);break;case`laugh`:t.hrx=-.32+i(r*16)*.06,t.brz=i(r*18)*.035,t.by=Math.abs(i(r*9))*.025,this.reach(t,`both`,a.y-.2,this.front+this.pawR,0,`paw`),t.try=i(r*9)*.3;break;case`cry`:t.hrx=.34+i(r*12)*.03;{let e=this.headNow(this.eyePos,.34+o.head-o.lean);if(this.reach(t,this.hold?`l`:`both`,e.y-.02,e.z+this.pawR+.025,e.x-Math.abs(a.x),`paw`),this.hold){let e=[t.alx,t.alz,t.sl,t.el];this.carryPose(t,0),this.hold.both||([t.alx,t.alz,t.sl,t.el]=e)}}t.brz=i(r*14)*.025,t.by=-.01,$(n,`earL`)[0]=$(n,`earR`)[0]=.35,$(n,`stalkL`)[0]=$(n,`stalkR`)[0]=.45;break;case`work`:{let e=i(r*7)*.05,n=a.y-this.grip.length()*(this.grip.length()<.22?.5:.8),o=Math.min(Math.max(n,a.y-.26),this.headC.y-this.headR.y-.16)+e,s=Math.max(this.front+.14+(this.hold?.hang??0),this.front+this.pawR+(this.grip.z-this.paw.z),this.mouth.z+.04);this.reach(t,`both`,o,s,-.03),t.alx+=e*2,t.arx-=e*2,t.hrx=this.grip.length()<.22?.06:.25,t.brx=.08,t.by=Math.abs(i(r*7))*.012,this.hold?.both&&(t.carry=1);break}case`fish`:{let e=i(r*.9)>.9?i(r*40)*.08:0,n=!!this.hold?.both;this.reach(t,`both`,a.y+(n?-.08:-.16),this.front+(n?.14:.1),n?-.02:.02),t.alx+=e,t.arx+=e,t.hrx=.12,t.hry=n?0:i(r*.3)*.1,n&&(t.carry=1);break}case`water`:this.reach(t,`r`,a.y-.16,this.front+.1,.05),t.alz=.2,t.hrx=.28,t.tilt=.75+i(r*3)*.1,this.freePaw(t);break;case`drink`:{let e=r%3.2,n=e<1.4?i(e/1.4*Math.PI):0,s=this.hold??Ou,{y:c,z:l}=this.holdSpot(s),[u,d,f]=s.sip??Ou.sip,p=-f,m=this.headNow(this.mouth,(f?-.15:.12)+o.head-o.lean),h=m.y-(u*Math.cos(p)-d*Math.sin(p)),g=Math.max(m.z+.015-(u*Math.sin(p)+d*Math.cos(p)),(e=>Math.max(this.faceFront(e)+this.pawR+.03,this.faceFront(e+u*Math.cos(p))+Math.max(0,u*Math.sin(f))+.07))(h)),_=h,v=this.sipLow||Math.hypot(.03-Math.abs(a.x),_-a.y,g-a.z)>this.reachLength()*1.05;v&&(_=c+.04,g=l+.02),this.reach(t,`r`,c+(_-c)*n,l+(g-l)*n,s.out*(1-n)+(v?s.out:.03-Math.abs(a.x))*n),t.hrx=v?n*.2:f?-n*.15:n*.12,t.tilt=p*n*(v?.35:1),t.try=i(r*2)*.2,this.freePaw(t);break}default:{let e=this.sleepy?.45:1;if(t.hry=i(r*.37*e)*.12*(i(r*.13)>0?1:.3),t.hrz=i(r*.29*e)*.04,t.try=i(r*1.6*e)*o.tailSway,$(n,`tail1`)[1]=i(r*1.6*e-.7)*o.tailSway*.6,$(n,`tail2`)[1]=i(r*1.6*e-1.4)*o.tailSway*.8,t.by=i(r*2.2*e)*.005,o.paws?this.reach(t,`both`,a.y-o.paws+i(r*2.2)*.005,this.front+this.pawR+.01,-.035,`paw`):(t.alx=t.arx=-this.armFwd,t.alz=this.armOut+i(r*2.2*e)*.02,t.arz=-this.armOut-i(r*2.2*e)*.02),o.gait===`slither`&&($(n,`rear`)[5]=i(r*.9)*.006,$(n,`stalkL`)[2]=.08+i(r*.7)*.05,$(n,`stalkR`)[2]=-.08+i(r*.8+1)*.05),this.sleepy&&(t.hrx=.2+i(r*.6)*.04,t.alz=.25,t.arz=-.25),this.mannerism(t,n,r),this.hold){let n=[t.alx,t.alz,t.sl,t.el];this.carryPose(t,i(r*2.2*e)*.02),this.hold.both||([t.alx,t.alz,t.sl,t.el]=n)}}}if(this.hold&&(e.anim===`wave`||e.anim===`hand`||e.anim===`cheer`||e.anim===`cry`||e.anim===`laugh`||x(e.anim))&&((e.anim===`wave`||e.anim===`hand`)&&!this.tendril&&(t.alx=t.arx,t.alz=-t.arz,t.sl=t.sr),this.carryPose(t,0,!0)),e.anim!==`sleep`){let n=o.lean*(e.anim===`sit`?.5:1);t.brx+=n,t.hrx+=o.head-n,t.hrz+=o.tilt}if(e.speaking&&(t.hrx+=i(r*13)*.04,t.hrz+=i(r*7)*.025),this.bones.has(`feelerL`)){let t=e.anim===`sleep`&&o.bed!==`upright`&&this.hasLegs&&!this.floats?-1:0;for(let[e,a]of[[`feelerL`,1],[`feelerR`,-1]]){let o=$(n,e);o[0]+=t+i(r*.9+a)*.05,o[2]+=a*i(r*1.3+a*.7)*.04}}if(this.tentacles&&e.anim===`sleep`?(o.bed!==`upright`&&(t.llx=t.lrx=Math.PI/2-.12,t.llz=.12,t.lrz=-.12),t.llz+=i(r*.9)*.04,t.lrz-=i(r*.9+1)*.04):this.tentacles&&(e.anim===`idle`&&(t.brz+=i(r*1.3)*.05,t.hrz-=i(r*1.3)*.03),t.llz+=i(r*3)*.14,t.lrz-=i(r*3+1)*.14,t.llx*=.4,t.lrx*=.4),this.flaps&&this.folded(e)){let e=i(r*1.6)*.03;this.hold?.both||(t.alz=Tu.z+e,t.alx=Tu.x,t.aly=-Tu.y,t.el=Tu.el,t.wl=Tu.w,t.sl=1),this.hold||(t.arz=-Tu.z-e,t.arx=Tu.x,t.ary=Tu.y,t.er=Tu.el,t.wr=Tu.w,t.sr=1)}if(this.flaps&&(t.wl=Math.min(t.wl,Math.max(Tu.w,1-t.el*.8)),t.wr=Math.min(t.wr,Math.max(Tu.w,1-t.er*.8))),this.flaps&&(e.anim===`walk`||e.anim===`run`)){let n=e.anim===`run`?16:12,a=.45,o=i(r*n);t.alz=1.5+o*a,t.alx=-.1,t.sl=1,this.hold?t.arz-=o*a*.15:(t.arz=-(1.5+o*a),t.arx=-.1,t.sr=1),t.by+=Math.max(0,o)*.02}return this.wings&&(this.wings.want=this.wings.mode===`buzz`?e.anim===`sleep`?0:1:e.anim===`cheer`||x(e.anim)?1:this.flutter),{P:t,A:n}}applyPose(e,t){let n=this.pose;if(t){let r=n.bry+C(t.P.bry-n.bry)*e;for(let r of wu)n[r]+=(t.P[r]-n[r])*e;n.bry=C(r);for(let n of this.extra){let r=this.auxNow.get(n)??Du(),i=t.A.get(n)??Du();for(let t=0;t<7;t++)r[t]+=(i[t]-r[t])*e;this.auxNow.set(n,r)}}this.body.position.set(n.bx,n.by,n.bz),this.body.rotation.set(n.brx,n.bry,n.brz),this.neck.rotation.set(n.hrx,n.hry,n.hrz),this.armL.rotation.set(n.alx,n.aly,n.alz),this.armR.rotation.set(n.arx,n.ary,n.arz),this.armL.scale.set(n.wl,n.sl,1),this.armR.scale.set(n.wr,n.sr,1),this.foreL?.rotation.set(-n.el,0,0),this.foreR?.rotation.set(-n.er,0,0),this.legL.rotation.set(n.llx,0,n.llz),this.legR.rotation.set(n.lrx,0,n.lrz);let r=this.ghost?.001:1;this.legL.scale.setScalar(r),this.legR.scale.setScalar(r),this.tail.rotation.set(n.trx,n.try,0);for(let e of this.extra){let t=this.auxNow.get(e)??Du(),n=this.bones.get(e),r=this.sk.local.get(e);n.rotation.set(t[0],t[1],t[2]),n.position.set(r.x+t[3],r.y+t[4],r.z+t[5]),n.scale.setScalar(t[6])}if(this.hat?.holder.visible)for(let e of this.hat.fold)this.bones.get(e)?.scale.setScalar(.001);let i=this.tendril?Math.max(.001,this.grow):1;this.tendril&&this.armR.scale.multiplyScalar(i),this.armR.updateMatrix();let a=this.m6.copy(this.armR.matrix),o=this.grip;this.foreR&&(this.foreR.updateMatrix(),a.multiply(this.foreR.matrix),o=this.v2.copy(this.grip).add(this.v3.set(0,this.elbow,0)));let s=this.v.copy(o).applyMatrix4(a);this.hand.matrix.copy(a).invert().multiply(this.m4.makeTranslation(s.x,s.y,s.z)).multiply(this.m5.makeScale(i,i,i)),this.hand.matrixWorldNeedsUpdate=!0,this.handTilt.rotation.set(n.tilt,0,0),this.item&&(this.item.position.x=-s.x*n.carry)}update(e){let t=Math.min(Math.max(e.dt,0),.1);if(e.anim===`walk`||e.anim===`run`){let n=Ke.clamp(e.speed||(e.anim===`run`?4:2),.8,7);this.phase+=t*(5+n*1.6)*this.prof.cadence}if(this.tendril){let n=!!this.item||e.anim!==`idle`&&e.anim!==`walk`&&e.anim!==`run`&&e.anim!==`sit`&&e.anim!==`sleep`;this.grow+=(+!!n-this.grow)*(1-Math.exp(-t*8))}let n=this.target(e);e.anim===`sleep`&&(n.P.by+=this.bedLift),this.applyPose(1-Math.exp(-t*14),n);let r=this.floats&&!(this.flaps&&this.folded(e))||this.ghost,i=e.anim===`sleep`?.012:this.floats?this.hover:.35,a=(r?i+Math.sin(e.t*2+this.seed)*(e.anim===`sleep`?.012:.06):0)+this.footLift;this.float.position.y+=(a-this.float.position.y)*(1-Math.exp(-t*6)),r&&(this.wisp.rotation.z=Math.sin(e.t*3+this.seed)*.15),this.keepClearOfGround(e.anim===`sleep`?.028:Wu),this.blinkAt-=t,this.blinkAt<=0&&this.blinkT<0&&(this.blinkT=0);let o=1;if(this.blinkT>=0){this.blinkT+=t;let e=this.blinkT/.14;o=e<1?Math.max(.12,Math.abs(1-e*2)):1,e>=1&&(this.blinkT=-1,this.blinkAt=2+Math.random()*4)}o=Math.min(o,1-.88*this.shut),e.anim===`sleep`?o=.12:e.anim===`laugh`?o=.35:this.sleepy&&e.anim===`idle`&&(o=Math.min(o,.5));for(let e of this.blinkers)e.scale.y=o*e.scale.x;if(this.wings&&this.beatWings(t),this.turrets.length&&this.swivel(e,t),this.shift){let t=Math.sin(e.t/32*Math.PI*2);this.shift.hue.value=1.6*t,this.shift.wave.value=.1+.25*Math.abs(t),this.shift.time.value=e.t%(4*Math.PI),this.shift.tint.value=Math.abs(t)}if(this.hat?.built.update?.(e.t+this.seed),this.hat&&(this.hat.holder.visible=e.anim!==`sleep`),this.hatFx){let t=this.hatFxOn&&e.anim!==`sleep`;this.hatFx.group.visible=this.hatFx.ground.visible=t,t&&this.hatFx.update(e.t+this.seed,e.anim,this.ghost)}}beatWings(e){let t=this.wings,n=Pu[t.mode];t.open+=(t.want-t.open)*(1-Math.exp(-e*n.ease)),t.phase=(t.phase+e*n.rate)%(Math.PI*2);let r=Math.sin(t.phase)*t.open*n.beat,i=n.shut[0]+(n.open[0]-n.shut[0])*t.open,a=n.shut[1]+(n.open[1]-n.shut[1])*t.open;for(let[e,n]of t.bones)e.rotation.set(0,n*i,n*(a+r))}swivel(e,t){let n=e.t;for(let r of this.turrets){if(e.anim===`sleep`)r.toYaw=.2,r.toPitch=0;else if(n>=r.next||r.next-n>6){if(Math.random()<.25)for(let e of this.turrets)e.toYaw=.55,e.toPitch=-.05,e.next=n+1.2+Math.random()*1.5;else r.toYaw=-.45+Math.random()*1.05,r.toPitch=-.3+Math.random()*.55,r.next=n+.5+Math.random()*2.2}let i=1-Math.exp(-t*16);r.yaw+=(r.toYaw-r.yaw)*i,r.pitch+=(r.toPitch-r.pitch)*i,r.bone.rotation.set(0,-r.side*r.yaw,r.side*r.pitch)}}freeChains(){return[`tail`,...this.prof.gait===`scuttle`?[`legL`,`legR`]:[]]}chainOf(e){let t=[e];for(let n of this.sk.names)for(let r=this.sk.parent.get(n);r;r=this.sk.parent.get(r))if(r===e){t.push(n);break}return t}findLowPoints(){let e=this.highGeo.getAttribute(`position`),t=this.highGeo.getAttribute(`skinIndex`),n=this.highGeo.getAttribute(`skinWeight`),r=this.mesh.skeleton.bones,i=this.mesh.skeleton.boneInverses,a=this.freeChains(),o=[];for(let s of a){let a=this.bones.get(s);if(!a)continue;let c=[];for(let a of this.chainOf(s)){let o=this.sk.names.indexOf(a),s=[];for(let r=0;r<e.count;r++){let e=0;for(let t=1;t<4;t++)n.getComponent(r,t)>n.getComponent(r,e)&&(e=t);t.getComponent(r,e)===o&&n.getComponent(r,e)>=.5&&s.push(r)}if(!s.length)continue;let l=Math.max(1,Math.ceil(s.length/120));for(let t=0;t<s.length;t+=l)c.push({bone:r[o],local:new R().fromBufferAttribute(e,s[t]).applyMatrix4(i[o])})}c.length&&o.push({pivot:a,points:c})}return o}keepClearOfGround(e){let t=this.lowPoints??=this.findLowPoints();if(t.length){this.root.updateMatrixWorld(!0),Xu.copy(this.root.matrixWorld).invert();for(let n of t)for(let t=0;t<4;t++){let t=1/0;for(let e of n.points)Gu.copy(e.local).applyMatrix4(e.bone.matrixWorld).applyMatrix4(Xu),Gu.y<t&&(t=Gu.y,Ku.copy(Gu));if(t>=e)break;qu.setFromMatrixPosition(n.pivot.matrixWorld).applyMatrix4(Xu);let r=Ku.sub(qu),i=Math.max(.06,r.length());if(Ju.crossVectors(r,Yu),Ju.lengthSq()<1e-8)break;Ju.normalize(),this.root.getWorldQuaternion(Qu),n.pivot.parent.getWorldQuaternion($u),Qu.invert().multiply($u).invert(),Ju.applyQuaternion(Qu),n.pivot.quaternion.premultiply(Zu.setFromAxisAngle(Ju,(e-t+.004)/i)),n.pivot.updateMatrixWorld(!0)}}}dispose(){this.setItem(null),this.setHat(null),this.setDetail(`high`),this.highGeo.dispose(),this.mesh.skeleton.dispose(),this.wisp.geometry.dispose(),this.root.traverse(e=>{e!==this.mesh&&e!==this.wisp&&e.isMesh&&e.geometry.dispose()});for(let e of this.owned)e.dispose();this.root.removeFromParent()}};function td(e){let t=D(e.animal),n=/^#[0-9a-f]{6}$/i.test(e.color)?e.color:t.colors[0],r=cr(t.id),i=bu[t.id](r,ar(n,t.id),n);En(r,Su[t.id]??{}),kn(r,t.id,n);let a=i.aquatic??t.aquatic?Ht():ot(),o=new ed({kit:r,profile:Cu(t.id),material:a,shift:i.shifts?yt(a):void 0,wings:i.wings,swivel:i.swivel,eyeMaterial:Vt(),ghostColor:H(n,`#e6f0ff`,.75),floats:!!i.hover,hover:i.hover,flaps:i.flaps,tentacles:i.legs===`tentacles`,sleepy:i.sleepy,tendril:i.tendril,hatFit:id(t.id,r),lowKey:`${t.id}:${n}`,lowKit:()=>{let e=cr(t.id);return bu[t.id](e,ar(n,t.id),n),kn(e,t.id,n),e}});return e.hat&&o.setHat(e.hat),o}var nd={fungi:{skull:{c:[0,.28,-.04],r:[.34,.21,.32]},brow:.45},squid:{skull:{c:[0,.52,-.055],r:[.11,.16,.1]},brow:.6},robot:{bumps:`head`},hedgehog:{bumps:`none`},snail:{dz:-.04},crab:{dz:-.04}},rd=new Map;function id(e,t){let n=t.shape,r=nd[e]??{},i=r.skull?.c??n.hc,a=r.skull?.r??n.hr;return{id:e,head:{c:i,r:a,size:Ke.clamp(a[0]/.25,.45,1.2),eye:{at:[t.eyeX,t.eyeY,t.eyeZ],r:t.eyeR},brow:r.brow},nudge:r,neckAt:t.joints.neck}}function ad(e,t){let n=e=>`${Math.floor(e.x/t)},${Math.floor(e.y/t)},${Math.floor(e.z/t)}`,r=new Map;e.forEach((e,t)=>(r.get(n(e))??r.set(n(e),[]).get(n(e))).push(t));let i=new Uint8Array(e.length),a=[];for(let o=0;o<e.length;o++){if(i[o])continue;let s=[],c=[o];for(i[o]=1;c.length;){let a=e[c.pop()];s.push(a);let[o,l,u]=n(a).split(`,`).map(Number);for(let n=-1;n<=1;n++)for(let s=-1;s<=1;s++)for(let d=-1;d<=1;d++)for(let f of r.get(`${o+n},${l+s},${u+d}`)??[])!i[f]&&e[f].distanceTo(a)<t&&(i[f]=1,c.push(f))}a.push(s)}return a}function od(e){return/^ear|^crest|^antler/.test(e)?`fold`:/^eyes$|^blink/.test(e)?`eye`:/^stalk|^turret|^neck$/.test(e)?`solid`:null}var sd=`#3b2a5a`,cd=`#e8c26a`,ld=`#0d0a14`;function ud(){let e=cr(`storyteller`);e.joints.neck=[0,.6,0],e.joints.shoulder=[.19,.6,.02],e.shape.tc=[0,.4,0],e.shape.tr=[.28,.38,.26],e.shape.hc=[0,.27,0],e.shape.hr=[.25,.27,.25];let t=fn(e),n=e.joints.neck;t.add(Yn(`body`,[0,.06,0],[0,.6,0],.29,.16,{name:`robe`})),t.add(sn(`body`,[0,.07,0],[.31,.045,.29],{k:.05,name:`hem`})),t.add(sn(`body`,[0,-.5,0],[.9,.54,.9],{k:.02,carve:!0})),t.add(sn(`body`,[0,.6,0],[.22,.09,.18],{k:.08,name:`shoulders`})),t.add(sn(`neck`,[0,n[1]+.27,0],[.25,.27,.25],{k:.06,anchor:n,reach:.18,name:`hood`})),t.add(Yn(`neck`,[0,n[1]+.42,-.1],[0,n[1]+.5,-.32],.12,.026,{k:.06,name:`hoodTip`}));let r=sn(`neck`,[0,n[1]+.28,.21],[.17,.19,.15],{k:.03,carve:!0,name:`hollow`});t.add(r),Jn(e,{len:.25,r0:.06,r1:.085,paw:[.05,.05,.05],fwd:.2,out:.2,pawOut:.075}),U(e),e.eyeY=.28,e.eyeX=.075,e.eyeR=.035,e.eyeZ=.09;for(let t of[-1,1])An(e.eyes,e.rnd,{base:`ico0`,r:[.036,.02,.012],pos:[t*.075,.28,.09],rot:[0,t*.3,-t*.25],jitter:.03,color:`#ffe08a`,tone:0});let i=e=>r.d(e.p.x,e.p.y,e.p.z);e.marks={base:sd,marks:[{color:ld,f:e=>i(e)-.012},{color:cd,f:e=>i(e)-.045},{color:`#d8d0f0`,f:V(e,`armLPaw`,`armRPaw`)},{color:cd,f:wn(tr(e,`L`,.8),tr(e,`R`,.8))},{color:ld,f:B(V(e,`robe`,`hem`,`shoulders`),e=>e.p.y-.035)},{color:cd,f:B(V(e,`robe`,`hem`,`shoulders`),e=>e.p.y-.11)},{color:cd,f:B(V(e,`robe`,`hem`,`shoulders`),e=>Math.abs(e.p.x)-.028,e=>.05-e.p.z)}]},kn(e,`storyteller`,sd),e.seat=0;let a=pt(`#ffcf6a`,1.6),o=new ye({color:`#ffe08a`});return new ed({kit:e,profile:{...Cu(`raccoon`),lean:0,head:0,paws:0,idles:[`lookAround`,`headTilt`],sit:`settle`,gait:`trot`,tailSway:0},material:ot(),eyeMaterial:o,ghostColor:Xn(`#cbbcf0`),floats:!0,tentacles:!1,noLegs:!0,extras:(e,t,n)=>{let r=new Mt,i=new qn,o=yn(hn(`lantern`)),s=`#4d3a2a`;An(i,o,{base:`limb`,r:[.07,.03,.07],pos:[0,.12,0],jitter:.02,color:s}),An(i,o,{base:`cone5`,r:[.075,.07,.075],pos:[0,.17,0],jitter:.03,color:s}),An(i,o,{base:`ico0`,r:.02,pos:[0,.22,0],jitter:.02,color:s}),An(i,o,{base:`limb`,r:[.075,.025,.075],pos:[0,-.05,0],jitter:.02,color:s});for(let e=0;e<5;e++){let t=e/5*Math.PI*2;An(i,o,{base:`box`,r:[.012,.16,.012],pos:[Math.cos(t)*.06,.035,Math.sin(t)*.06],jitter:0,color:s})}let c=new Je(i.geometry(),ot());c.castShadow=!0;let l=new Je(new Dt(.06,0),a);l.scale.set(.9,1.3,.9),l.position.y=.035;let u=new Xe(`#ffcf7a`,1.6,6,2);u.position.y=.04,r.add(c,l,u),r.position.set(.04,-.42,.06),r.name=`lantern`,n.add(r)}})}var dd=null,fd=null;function pd(){dd?.dispose(),dd?.forceContextLoss(),dd=null}var md=null,hd=null,gd=new Map,_d={squid:-.2,snail:.1};function vd(e){if(!dd){dd=new ho({antialias:!0,alpha:!0,preserveDrawingBuffer:!0}),dd.setPixelRatio(1),dd.toneMapping=7,dd.toneMappingExposure=1.06,md=new Qt,md.add(new ft(`#cfe8ff`,`#a89a80`,1.35));let e=new we(`#fff1d2`,2.4);e.position.set(1.5,3,2.5),md.add(e),hd=new me(30,1,.1,20)}return dd.setSize(e,e,!1),{renderer:dd,scene:md,camera:hd}}function yd(e,t,n){e.render(t,n);let r=e.getContext().isContextLost(),i=r?``:e.domElement.toDataURL(`image/png`);return fd&&clearTimeout(fd),fd=setTimeout(pd,r?0:4e3),i}var bd=new R(.15,.25,1).normalize();function xd(e){let t=new R(0,1,0).cross(bd).normalize(),n=bd.clone().cross(t),r=[],i=new R,a=new R,o=new R,s=new z,c=new z,l=e=>{for(let t=e;t;t=t.parent)if(!t.visible)return!1;return!0};if(e.updateMatrixWorld(!0),e.traverse(e=>{let u=e;if(!u.isMesh||!l(u))return;let d=u.geometry.getAttribute(`position`);if(!d)return;let f=u.geometry.index,p=(f?f.count:d.count)/3,m=u,h=m.isInstancedMesh?m.count:1;for(let e=0;e<h;e++){s.copy(u.matrixWorld),m.isInstancedMesh&&(m.getMatrixAt(e,c),s.multiply(c));for(let e=0;e<p;e++){let c=t=>f?f.getX(e*3+t):e*3+t;i.fromBufferAttribute(d,c(0)).applyMatrix4(s),a.fromBufferAttribute(d,c(1)).applyMatrix4(s),o.fromBufferAttribute(d,c(2)).applyMatrix4(s);let l=o.clone().sub(i).cross(a.clone().sub(i)).length()/2;if(l<=0)continue;let u=i.add(a).add(o).divideScalar(3);r.push({u:u.dot(t),v:u.dot(n),w:u.dot(bd),a:l})}}}),!r.length)return{centre:new R,half:.1,depth:.1};let u=r.reduce((e,t)=>e+t.a,0),d=(e,t)=>{r.sort((t,n)=>t[e]-n[e]);let n=0;for(let i of r)if((n+=i.a)>=u*t)return i[e];return r[r.length-1][e]},f=.04,[p,m]=[d(`u`,f),d(`u`,.96)],[h,g]=[d(`v`,f),d(`v`,.96)],[_,v]=[d(`w`,f),d(`w`,.96)],y=t.multiplyScalar((p+m)/2).add(n.multiplyScalar((h+g)/2)).addScaledVector(bd,(_+v)/2),b=Math.max(d(`u`,.99)-d(`u`,.01),d(`v`,.99)-d(`v`,.01))/2;return{centre:y,half:Math.max(.03,Math.max(m-p,g-h)/2*1.12,b*.8),depth:(v-_)/2}}function Sd(e,t=96){let n=`pet2:${e}:${t}`,r=gd.get(n);if(r)return r;try{let{renderer:r,scene:i,camera:a}=vd(t),o=cn(e);for(let e=0;e<20;e++)o.update(.05,e*.05,!1);o.root.rotation.y=.45,i.add(o.root);let{centre:s,half:c,depth:l}=xd(o.root),u=c*1.1/Math.tan(Ke.degToRad(15))+l;a.position.copy(s).addScaledVector(bd,u),a.lookAt(s);let d=yd(r,i,a);return i.remove(o.root),o.dispose(),d&&gd.set(n,d),d}catch{return``}}function Cd(e,t=96){let n=`hat:${e}:${t}`,r=gd.get(n);if(r)return r;try{let{renderer:r,scene:i,camera:a}=vd(t),o=jc(e);if(!o)return``;o.update?.(1.2),o.group.rotation.y=.5,i.add(o.group),o.group.updateMatrixWorld(!0);let s=new qe().setFromObject(o.group),c=s.getCenter(new R),l=s.getSize(new R),u=Math.max(.05,Math.max(l.x,l.y,l.z)*.62)/Math.sin(Ke.degToRad(15));a.position.set(c.x,c.y+u*.42,c.z+u*.9),a.lookAt(c);let d=yd(r,i,a);i.remove(o.group),o.group.traverse(e=>e.geometry?.dispose());for(let e of o.materials)e.dispose();return d&&gd.set(n,d),d}catch{return``}}function wd(e,t=128){let n=`${e.animal}:${e.color}:${e.hat??``}:${t}`,r=gd.get(n);if(r)return r;try{let{renderer:r}=vd(t),i=td(e);i.showHatFx(!1),i.update({anim:`idle`,speed:0,dt:.016,t:0});for(let e=0;e<30;e++)i.update({anim:`idle`,speed:0,dt:.05,t:0});i.root.rotation.y=.35,md.add(i.root);let a=i.headHeight+.03+(_d[e.animal]??0),o=a-.64,s=(o+a)/2,c=(a-o)*1.12/(2*Math.tan(Ke.degToRad(15)));hd.position.set(c*.18,s+.08,c),hd.lookAt(0,s,0);let l=yd(r,md,hd);return md.remove(i.root),i.dispose(),l&&gd.set(n,l),l}catch{return``}}var Td=new URLSearchParams(location.search).get(`fx`)===`low`,Ed=Td?125:1e3/30,Dd=2.2,Od=.35;function kd({look:e,size:t=260,spin:n=!0,anim:r=`idle`,className:i,turnable:a=!1}){let o=(0,K.useRef)(null),s=(0,K.useRef)(null),c=(0,K.useRef)(r),l=(0,K.useRef)(n),u=(0,K.useRef)({want:.4,hold:0,touched:!1,drag:null}),[d,f]=(0,K.useState)(null);if(c.current=r,l.current=n,(0,K.useEffect)(()=>{let n=o.current;if(!n||p())return;let r;try{r=new ho({canvas:n,antialias:!Td,alpha:!0,powerPreference:`low-power`})}catch{f(wd(e,t)||null);return}r.setPixelRatio(Td?1:Math.min(window.devicePixelRatio||1,1.5)),r.setSize(t,t,!1),r.shadowMap.enabled=!Td,r.shadowMap.type=2;let i=new Qt;i.add(new ft(`#fff8ee`,`#9a8a70`,2));let a=new we(`#fff2dc`,1.8);a.position.set(1.5,4,2.5),a.castShadow=!0,a.shadow.mapSize.set(512,512),a.shadow.camera.left=-1.5,a.shadow.camera.right=1.5,a.shadow.camera.top=1.5,a.shadow.camera.bottom=-1.5,i.add(a);let d=new Je(new Ne(.75,24),new Ze({opacity:.22}));d.rotation.x=-Math.PI/2,d.receiveShadow=!0,i.add(d);let m=new Mt;m.rotation.y=u.current.want,i.add(m);let h=new me(32,1,.1,30);h.position.set(0,1.25,3.1),h.lookAt(0,.62,0),s.current={renderer:r,scene:i,camera:h,table:m,rig:null,pet:null};let g=0,_=performance.now(),v=_,y=e=>{if(g=requestAnimationFrame(y),e-_<Ed)return;let t=Math.min((e-_)/1e3,.1),n=Math.min((e-_)/1e3,.3);_=e;let a=s.current;if(!a?.rig)return;let o=u.current;o.hold?o.want+=o.hold*n*Dd:l.current&&!o.touched&&(o.want+=t*.6),m.rotation.y+=(o.want-m.rotation.y)*(1-Math.exp(-t*12));let d=(e-v)/1e3;a.rig.update({anim:c.current,speed:c.current===`walk`?1.6:0,dt:t,t:d}),a.pet?.update(t,d,c.current===`walk`),r.render(i,h)};return g=requestAnimationFrame(y),()=>{cancelAnimationFrame(g),s.current?.rig?.dispose(),s.current?.pet?.dispose(),d.geometry.dispose(),d.material.dispose(),r.dispose(),r.forceContextLoss(),s.current=null}},[t]),(0,K.useEffect)(()=>{let t=s.current;if(!t)return;t.rig?.dispose();let n=td(e);t.table.add(n.root),t.rig=n;let r=Math.max(n.headHeight,1.1);t.camera.position.set(0,.55+r*.65,1.6+r*1.35),t.camera.lookAt(0,r*.52,0)},[e.animal,e.color,e.hat,t]),(0,K.useEffect)(()=>{let t=s.current;if(!t?.rig||(t.pet?.root.removeFromParent(),t.pet?.dispose(),t.pet=e.pet?cn(e.pet):null,!t.pet))return;let n=new qe().setFromObject(t.rig.root);t.pet.root.position.set(Math.min(Math.max(.5,n.max.x+.16),.75),0,.28),t.pet.root.rotation.y=-.45,t.pet.root.traverse(e=>e.castShadow=e.isMesh===!0),t.table.add(t.pet.root)},[e.pet,e.animal,t]),d)return(0,J.jsx)(`img`,{src:d,alt:``,className:i,width:t,height:t,style:{width:t,height:t}});let m=(0,J.jsx)(`canvas`,{ref:o,className:i,width:t,height:t,style:{width:t,height:t}});if(!a)return m;let h=e=>t=>{t.preventDefault(),t.currentTarget.setPointerCapture?.(t.pointerId);let n=u.current;n.touched=!0,n.hold=e,n.want+=e*Od},g=()=>u.current.hold=0,_=e=>{u.current.touched=!0,u.current.want+=e*Od*2};return(0,J.jsxs)(`div`,{className:`preview-turn`,onPointerDown:e=>{e.target.closest(`button`)||(e.currentTarget.setPointerCapture?.(e.pointerId),u.current.touched=!0,u.current.drag={x:e.clientX,want:u.current.want})},onPointerMove:e=>{let t=u.current.drag;t&&(u.current.want=t.want+(e.clientX-t.x)*.014)},onPointerUp:()=>u.current.drag=null,onPointerCancel:()=>u.current.drag=null,children:[m,(0,J.jsx)(`button`,{type:`button`,className:`preview-turn-btn left`,"aria-label":`Turn left`,title:`Turn left`,onPointerDown:h(-1),onPointerUp:g,onPointerCancel:g,onLostPointerCapture:g,onClick:e=>e.detail===0&&_(-1),children:(0,J.jsx)(en,{name:`turnLeft`})}),(0,J.jsx)(`button`,{type:`button`,className:`preview-turn-btn right`,"aria-label":`Turn right`,title:`Turn right`,onPointerDown:h(1),onPointerUp:g,onPointerCancel:g,onLostPointerCapture:g,onClick:e=>e.detail===0&&_(1),children:(0,J.jsx)(en,{name:`turnRight`})})]})}var Ad=a(),jd=d(`ravenswood:voice`,{}),Md=o(()=>({mic:`off`,muted:jd.muted??!1,pushToTalk:jd.pushToTalk??!1,holding:!1,shouting:!1,volume:jd.volume??1,people:jd.people??{},links:0,available:!0}));Md.subscribe((e,t)=>{(e.muted!==t.muted||e.pushToTalk!==t.pushToTalk||e.volume!==t.volume||e.people!==t.people)&&s(`ravenswood:voice`,{muted:e.muted,pushToTalk:e.pushToTalk,volume:e.volume,people:e.people})});var Nd=12e4,Pd=30,Fd=2,Id=24e3,Ld=16e3,Rd=6;function zd(e){let t=[...e.matchAll(/^a=rtpmap:(\d+) opus\/48000/gim)].map(e=>e[1]);if(!t.length)return e;let n={usedtx:`1`,maxaveragebitrate:String(Id),stereo:`0`,"sprop-stereo":`0`,useinbandfec:`1`},r=e.split(/\r?\n/);for(let e of t){let t=r.findIndex(t=>t.startsWith(`a=fmtp:${e} `));if(t>=0){let i=Object.fromEntries(r[t].slice(`a=fmtp:${e} `.length).split(`;`).map(e=>e.trim().split(`=`)).filter(([e])=>e));Object.assign(i,n),r[t]=`a=fmtp:${e} ${Object.entries(i).map(([e,t])=>`${e}=${t}`).join(`;`)}`}else{let t=r.findIndex(t=>t.startsWith(`a=rtpmap:${e} `));r.splice(t+1,0,`a=fmtp:${e} ${Object.entries(n).map(([e,t])=>`${e}=${t}`).join(`;`)}`)}}return r.join(`\r
`)}function Bd(e,t){Md.setState(n=>{let r={...n.people};return t>=.999?delete r[e]:r[e]=Math.max(0,t),{people:r}})}var Vd=new class{peer=null;links=new Map;lastTry=new Map;ctx=null;silent=null;mic=null;analyser=null;levels=null;loudUntil=0;sendStream=null;wanted=new Map;unwantedSince=new Map;answering=new WeakSet;attach(e){Md.setState({available:!!e}),e===this.peer?e?.id&&(b.voiceId=e.id):(this.closeAll(),this.peer=e,b.voiceId=e?.id??null,e&&!this.answering.has(e)&&(this.answering.add(e),e.on(`call`,t=>{this.peer===e&&(Ad?t.close():(this.links.get(t.peer)?.call.close(),t.answer(this.stream(),{sdpTransform:zd}),this.track(t)))})))}unlock(){try{this.ctx??=new AudioContext,this.ctx.resume()}catch{}for(let e of this.links.values())e.audio.play().catch(()=>{})}async resume(){let e=()=>{this.unlock(),window.removeEventListener(`pointerdown`,e,!0),window.removeEventListener(`keydown`,e,!0)};window.addEventListener(`pointerdown`,e,!0),window.addEventListener(`keydown`,e,!0);try{(await navigator.permissions.query({name:`microphone`})).state===`granted`&&await this.enableMic()}catch{}}async enableMic(){if(!this.mic){this.unlock(),Md.setState({mic:`asking`});try{let e=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0,autoGainControl:!0}});this.mic=e;let t=e.getAudioTracks()[0];for(let e of this.links.values())e.sending&&this.replaceTrack(e.call,t);if(this.sendStream){for(let e of this.sendStream.getAudioTracks())this.sendStream.removeTrack(e);this.sendStream.addTrack(t)}if(this.ctx){let t=this.ctx.createMediaStreamSource(e);this.analyser=this.ctx.createAnalyser(),this.analyser.fftSize=512,this.levels=new Float32Array(this.analyser.fftSize),t.connect(this.analyser)}t.addEventListener(`ended`,()=>this.micLost(e)),Md.setState({mic:`on`}),this.applyMute()}catch(e){let t=e.name;Md.setState({mic:t===`NotAllowedError`||t===`SecurityError`?`denied`:`error`})}}}micLost(e){if(this.mic!==e)return;this.mic=null,this.analyser=null,this.levels=null;let t=this.silentTrack();if(this.sendStream){for(let e of this.sendStream.getAudioTracks())this.sendStream.removeTrack(e);t&&this.sendStream.addTrack(t)}if(t)for(let e of this.links.values())e.sending&&this.replaceTrack(e.call,t);Md.setState({mic:`error`,shouting:!1}),this.applyMute()}setMuted(e){Md.setState(e?{muted:e,shouting:!1}:{muted:e}),this.applyMute()}setHolding(e){Md.getState().holding!==e&&(Md.setState({holding:e}),this.applyMute())}setPushToTalk(e){Md.setState({pushToTalk:e,holding:!1}),this.applyMute()}setShouting(e){e&&this.silenced||Md.getState().shouting!==e&&(Md.setState({shouting:e}),this.applyMute())}get live(){let e=Md.getState();return!!this.mic&&!e.muted&&(!e.pushToTalk||e.holding||e.shouting)}get silenced(){return!this.mic||Md.getState().muted}applyMute(){let e=this.live;for(let t of this.mic?.getAudioTracks()??[])t.enabled=e;b.muted=this.silenced,b.shout=Md.getState().shouting&&!b.muted}speaking(){if(!this.live||!this.analyser||!this.levels)return!1;this.analyser.getFloatTimeDomainData(this.levels);let e=0;for(let t of this.levels)e+=t*t;let t=Math.sqrt(e/this.levels.length),n=performance.now();return t>.02&&(this.loudUntil=n+280),n<this.loudUntil}sync(e){let t=this.peer;if(!t||t.destroyed)return;Ad&&(e=[]);let n=t.open,{volume:r,people:i}=Md.getState(),a=e=>e.gain*(i[e.key]??1);this.wanted=new Map(e.map(e=>[e.voiceId,a(e)]));let o=Date.now(),s=0;for(let i of[...e].sort((e,t)=>a(t)-a(e))){let{voiceId:e}=i,c=a(i);if(e===t.id)continue;let l=this.links.get(e);if(l)l.audio.volume=Math.max(0,Math.min(1,c*r)),this.setSending(l,!0);else if(!(!n||t.id>e)&&!(s>=Fd)&&!(o-(this.lastTry.get(e)??0)<6e3)){s+=1,this.lastTry.set(e,o);try{let n=t.call(e,this.stream(),{sdpTransform:zd});n&&this.track(n)}catch(e){console.warn(`Voice call failed`,e)}}}let c=[];for(let[e,t]of this.links){if(this.wanted.has(e)){this.unwantedSince.delete(e);continue}let n=this.unwantedSince.get(e)??o;this.unwantedSince.set(e,n),t.audio.volume=0,this.setSending(t,!1),c.push([e,n])}let l=this.links.size-Pd;for(let[e,t]of c.sort((e,t)=>e[1]-t[1])){if(o-t<=Nd&&l<=0)break;--l;let n=this.links.get(e);this.unwantedSince.delete(e),n.call.close(),this.drop(e,n)}this.capBitrate(),Md.setState({links:[...this.links.values()].filter(e=>e.open).length})}setSending(e,t){if(e.sending===t)return;e.sending=t;let n=e.call.peerConnection;if(!n)return;let r=t?this.stream().getAudioTracks()[0]??null:null;for(let e of n.getSenders())(!e.track||e.track.kind===`audio`)&&e.replaceTrack(r).catch(()=>{})}bitrateCap=0;capBitrate(){let e=[...this.links.keys()].filter(e=>this.wanted.has(e)).length>Rd?Ld:Id;if(e!==this.bitrateCap){this.bitrateCap=e;for(let t of this.links.values())this.applyBitrate(t,e)}}applyBitrate(e,t){let n=e.call.peerConnection;if(n){for(let e of n.getSenders())if(!(e.track&&e.track.kind!==`audio`))try{let n=e.getParameters();if(!n.encodings?.length)continue;n.encodings[0].maxBitrate=t,e.setParameters(n).catch(()=>{})}catch{}}}stream(){if(this.sendStream)return this.sendStream;let e=this.mic?.getAudioTracks()[0]??this.silentTrack();return this.sendStream=new MediaStream(e?[e]:[]),this.sendStream}silentTrack(){if(this.silent)return this.silent;try{this.ctx??=new AudioContext;let e=this.ctx.createMediaStreamDestination();this.silent=e.stream.getAudioTracks()[0]??null}catch{this.silent=null}return this.silent}replaceTrack(e,t){let n=e.peerConnection;if(n)for(let e of n.getSenders())(!e.track||e.track.kind===`audio`)&&e.replaceTrack(t).catch(()=>{})}track(e){let t=e.peer,n=new Audio;n.autoplay=!0;let r={call:e,audio:n,open:!1,sending:!0};this.links.set(t,r),e.on(`stream`,e=>{this.links.get(t)===r&&(n.srcObject=e,n.volume=Math.max(0,Math.min(1,(this.wanted.get(t)??0)*Md.getState().volume)),r.open=!0,this.bitrateCap&&this.applyBitrate(r,this.bitrateCap),n.play().catch(()=>{}))});let i=()=>this.drop(t,r);e.on(`close`,i),e.on(`error`,i);let a=setInterval(()=>{if(this.links.get(t)!==r)return clearInterval(a);let n=e.peerConnection?.iceConnectionState;(n===`failed`||n===`closed`)&&(e.close(),i())},3e3)}drop(e,t){this.links.get(e)===t&&(this.links.delete(e),t.audio.srcObject=null,t.audio.remove(),this.lastTry.set(e,Date.now()-3e3))}closeAll(){for(let[e,t]of this.links)t.call.close(),this.drop(e,t)}};c()&&Object.assign(window,{__voice:Vd,__voiceLinks:()=>[...Vd.links].map(([e,t])=>({id:e,volume:t.audio.volume,open:t.open}))});var Hd=null;function Ud(e){if(e===`st`){let e=le.getState().rev;return Hd?.rev!==e&&(Hd={rev:e,view:se(null)}),Hd.view}return g.getState().priv?.casino??null}function Wd(e){let t=g(t=>e===`player`?t.priv?.casino??null:null),n=le(t=>e===`st`?t.rev:0),[r,i]=(0,K.useState)(()=>e===`st`?se(null):null);return(0,K.useEffect)(()=>{e===`st`&&i(se(null))},[e,n]),e===`st`?r:t}var Gd=e=>h.casino(e),Kd=()=>Date.now()+(g.getState().clockOffset||0),qd=o(()=>({held:null}));function Jd(e,t){qd.getState().held!==t&&(qd.setState({held:t}),h.hold(e,t))}function Yd(e){qd.getState().held&&(qd.setState({held:null}),h.hold(e,null))}var Xd=`ravenswood:name`,Zd=`ravenswood:look`;function Qd(e,t){try{let n=localStorage.getItem(e);return n?JSON.parse(n):t}catch{return t}}function $d(e,t){try{localStorage.setItem(e,JSON.stringify(t))}catch{}}function ef(e,t){let n=e.trim();t.pet&&!So.getState().pets.includes(t.pet)&&(t={...t,pet:null}),$d(Xd,n),$d(Zd,t),h.join(n,ie(t))}var tf=()=>Qd(Zd,null);function nf({room:e,current:t}){let[n,r]=(0,K.useState)(`name`),[i,a]=(0,K.useState)(t?.name||Qd(Xd,``)),[o,s]=(0,K.useState)(()=>ie(t?.look??tf())),[c]=(0,K.useState)(()=>!!(t?.look??tf())),[l,d]=(0,K.useState)(`animal`),[f,p]=(0,K.useState)(null),g=m();(0,K.useEffect)(()=>{if(!g.animal||Date.now()-g.at>5e3)return;qd.getState().held===g.animal&&qd.setState({held:null});let e=D(g.animal)?.name??`that animal`;p(`${ce(g.by)} just took the ${e.toLowerCase()}. Pick another!`),d(`animal`),r(e=>e===`name`?e:`animal`)},[g.at,g.animal,g.by]);let _=u();(0,K.useEffect)(()=>{_?.ok===!1&&(p(`The Storyteller says ${_.name} is someone else. Please choose another name.`),r(`name`),u.setState(null,!0))},[_]);let v=()=>{h.leave(),u.setState(null,!0),p(null),r(`name`)},y=e=>{ef(i,e),is()},b=()=>{i.trim()&&(p(null),Vd.unlock(),s(e=>ie(e)),r(`animal`))};return(0,J.jsxs)(`div`,{className:`join cosy`,children:[(0,J.jsxs)(`div`,{className:`join-room`,children:[`Room `,e]}),_?.ok===null?(0,J.jsxs)(`div`,{className:`join-card cosy-panel join-door`,role:`status`,children:[(0,J.jsx)(kd,{look:o,size:170,spin:!1,anim:`idle`}),(0,J.jsxs)(`span`,{className:`join-eyebrow`,children:[`Hi `,_.name,`!`]}),(0,J.jsx)(`h1`,{children:`Just a moment…`}),(0,J.jsx)(`p`,{children:`This name belongs to a device we know. Asking the Storyteller to let you in…`}),(0,J.jsx)(`div`,{className:`spinner`}),(0,J.jsx)(`button`,{className:`cosy-btn`,onClick:v,children:`Choose another name`})]}):(0,J.jsxs)(J.Fragment,{children:[n===`name`&&(0,J.jsxs)(`form`,{className:`join-card cosy-panel join-name`,onSubmit:e=>{e.preventDefault(),b()},children:[(0,J.jsx)(`span`,{className:`join-eyebrow`,children:`Welcome to Ravenswood`}),(0,J.jsx)(`h1`,{children:`What’s your name?`}),f&&(0,J.jsx)(`p`,{className:`join-note`,children:f}),(0,J.jsx)(`input`,{className:`cosy-input`,value:i,onChange:e=>a(e.target.value),maxLength:24,autoFocus:!0,placeholder:`As your friends know you`}),(0,J.jsx)(`button`,{className:`cosy-btn primary big`,disabled:!i.trim(),children:`Next`})]}),n===`animal`&&(0,J.jsxs)(`div`,{className:`join-card cosy-panel join-animal`,children:[(0,J.jsxs)(`div`,{className:`join-animal-head`,children:[(0,J.jsxs)(`span`,{className:`join-eyebrow`,children:[`Hi `,i.trim(),`!`]}),(0,J.jsx)(`h1`,{children:`Choose your animal`}),f&&(0,J.jsx)(`p`,{className:`join-note`,children:f})]}),(0,J.jsx)(af,{name:i,look:o,setLook:s,locked:!1,tab:l,setTab:d,showMine:c,confirm:{label:`This is me!`,onClick:()=>{p(null),r(`mic`)}}}),(0,J.jsx)(`div`,{className:`join-actions`,children:(0,J.jsx)(`button`,{className:`cosy-btn`,onClick:()=>r(`name`),children:`Back`})})]}),n===`mic`&&(0,J.jsx)(vf,{name:i,look:o,onBack:()=>r(`animal`),onDone:()=>y(o)})]})]})}var rf=[{id:`animal`,label:`Animal`,icon:`🦊`},{id:`hat`,label:`Hats`,icon:`🎩`},{id:`pet`,label:`Pet`,icon:`🐾`}];function af({name:e,look:t,setLook:n,locked:r,tab:i,setTab:a,showMine:o=!0,confirm:s}){let c=sf(),l=e=>c.get(e),u=(0,K.useRef)(null);(0,K.useEffect)(()=>{i===`animal`&&o&&u.current?.querySelector(`.join-tile.on`)?.scrollIntoView({block:`nearest`})},[i,o]),(0,K.useEffect)(()=>{if(!r){if(l(t.animal)){let e=ne.find(e=>!l(e.id));e&&e.id!==t.animal&&n({...t,animal:e.id,color:e.colors[0]})}else Jd(e,t.animal)}});let d=D(t.animal),f=[...d.colors,...w.filter(e=>!d.colors.includes(e))],p=e=>{if(r||l(e))return;let i=D(e);n({...t,animal:e,color:i.colors[0]})};return(0,J.jsxs)(`div`,{className:`join-animal-body`,children:[(0,J.jsxs)(`div`,{className:`join-stage`,children:[(0,J.jsx)(kd,{look:t,size:260,spin:!1,turnable:!0,anim:`idle`}),(0,J.jsxs)(`strong`,{className:`join-animal-name`,children:[d.name,d.aquatic&&(0,J.jsx)(`span`,{className:`join-wet`,children:` · a little bit wet`})]}),(0,J.jsx)(`div`,{className:`join-colors ${r?`locked`:``}`,role:`radiogroup`,"aria-label":`Colour`,children:f.map(e=>(0,J.jsx)(`button`,{className:`join-color ${t.color.toLowerCase()===e.toLowerCase()?`on`:``}`,style:{background:e},onClick:()=>!r&&n({...t,color:e}),"aria-label":e,role:`radio`,"aria-checked":t.color.toLowerCase()===e.toLowerCase(),"aria-disabled":r,title:r?`Your animal and its colour stay the same until this game ends`:void 0},e))}),s&&(0,J.jsx)(`button`,{className:`cosy-btn primary big join-confirm`,onClick:s.onClick,children:s.label})]}),(0,J.jsxs)(`div`,{className:`join-picks`,children:[(0,J.jsx)(`div`,{className:`dress-tabs`,role:`tablist`,children:rf.map(e=>(0,J.jsxs)(`button`,{role:`tab`,"aria-selected":i===e.id,className:`dress-tab ${i===e.id?`on`:``} ${e.id!==`animal`&&t[e.id]?`has`:``}`,onClick:()=>a(e.id),children:[(0,J.jsx)(`span`,{children:e.icon}),` `,e.label]},e.id))}),i===`animal`?(0,J.jsxs)(J.Fragment,{children:[r&&(0,J.jsxs)(`p`,{className:`join-pick-note locked`,children:[`🔒 You’re the `,d.name.toLowerCase(),` until this game ends, so everyone can keep track of who’s who. Your hat and pet can change any time, and once the game is over you can choose a new animal.`]}),(0,J.jsx)(`div`,{ref:u,className:`join-grid ${r?`locked`:``}`,role:`radiogroup`,"aria-label":`Animal`,children:ne.map(e=>(0,J.jsx)(_f,{id:e.id,on:e.id===t.animal,owner:l(e.id),locked:r&&e.id!==t.animal,onPick:()=>p(e.id)},e.id))})]}):(0,J.jsx)(of,{tab:i,look:t,setLook:n})]})]})}function of({tab:e,look:t,setLook:n}){let r=So(),[a,o]=(0,K.useState)(null);(0,K.useEffect)(()=>o(null),[e]);let s=e===`hat`?re.map(e=>{let t=e.unlocked(r),n=Wc[e.id]&&`Comes with ${Wc[e.id]}.`;return t?{id:e.id,name:e.name,icon:e.icon,fx:n}:e.price?{id:e.id,name:e.name,icon:e.icon,price:e.price,fx:n,locked:`${i(e.price)} at the Lucky Raven’s shop`}:e.secret?{id:e.id,name:`A secret hat`,icon:`❓`,locked:`Keep exploring Ravenswood…`}:{id:e.id,name:e.name,icon:e.icon,fx:n,locked:e.how}}).sort((e,t)=>Number(!!e.locked)-Number(!!t.locked)):oe().map(e=>r.pets.includes(e.id)?{id:e.id,name:e.name,icon:e.icon}:{id:e.id,name:e.name,icon:e.icon,price:ae(e.id),locked:`${i(ae(e.id))} at the casino’s pet shop (the Lucky Raven)`}).sort((e,t)=>Number(!!e.locked)-Number(!!t.locked)),c=t[e]??null,l=r=>n({...t,[e]:r}),u=ee(r);return(0,J.jsxs)(J.Fragment,{children:[(0,J.jsx)(`p`,{className:`join-pick-note`,children:a??(e===`hat`?`Each hat you own: +0.1% speed. You have ${u}, so you’re ${S(u)} quicker about town.`:r.pets.length?`Your pet trots along beside you wherever you go. More at the casino’s pet shop.`:`Pets are bought with money from playing, at the casino’s pet shop (the Lucky Raven).`)}),(0,J.jsxs)(`div`,{className:`join-items`,role:`radiogroup`,"aria-label":e===`hat`?`Hat`:`Pet`,children:[(0,J.jsxs)(`button`,{className:`join-item ${c?``:`on`}`,onClick:()=>l(null),role:`radio`,"aria-checked":!c,children:[(0,J.jsx)(`span`,{className:`join-item-icon`,children:`🚫`}),(0,J.jsx)(`span`,{className:`join-item-name`,children:e===`hat`?`No hat`:`No pet`})]}),s.map(t=>(0,J.jsxs)(`button`,{className:`join-item ${c===t.id?`on`:``} ${t.locked?`locked`:``}`,onClick:()=>t.locked?o(`🔒 ${t.name}: ${t.locked}${t.fx?` ✨ ${t.fx}`:``}`):(o(t.fx?`✨ ${t.name}: ${t.fx}`:null),l(t.id)),role:`radio`,"aria-checked":c===t.id,"aria-disabled":!!t.locked,title:t.locked?`${t.name}: ${t.locked}`:t.name,children:[(0,J.jsx)(`span`,{className:`join-item-icon`,children:e===`pet`?(0,J.jsx)(mf,{id:t.id,icon:t.icon}):t.icon}),(0,J.jsx)(`span`,{className:`join-item-name`,children:t.name}),t.locked?(0,J.jsx)(`i`,{children:`🔒`}):t.fx&&(0,J.jsx)(`i`,{title:t.fx,children:`✨`}),t.price!==void 0&&(0,J.jsx)(`span`,{className:`join-item-price`,children:i(t.price)})]},t.id))]})]})}function sf(){let e=g(e=>e.pub),t=g(e=>e.priv?.seatId??null),n=qd(e=>e.held);return(0,K.useMemo)(()=>{let r=new Map;for(let n of e?.seats??[])n.claimed&&n.id!==t&&n.look?.animal&&r.set(n.look.animal,{by:ce(n.name),choosing:!1});for(let[t,i]of Object.entries(e?.picking??{}))t!==n&&!r.has(t)&&r.set(t,{by:ce(i),choosing:!0});return r},[e,t,n])}var cf=[],lf=0;function uf(e){cf.push(e);let t=()=>{lf=0;let e=cf.shift();e&&(e(),cf.length&&(lf=requestAnimationFrame(t)))};return lf||=requestAnimationFrame(t),()=>{let t=cf.indexOf(e);t>=0&&cf.splice(t,1)}}var df=(e,t)=>`ravenswood:thumb:2026-10-29T22:11:57.300Z:${e}:${t}`;function ff(e,t){try{return localStorage.getItem(df(e,t))}catch{return null}}function pf(e,t,n){try{if(!localStorage.getItem(`ravenswood:thumbs-for`)||localStorage.getItem(`ravenswood:thumbs-for`)!==`2026-10-29T22:11:57.300Z`){for(let e=localStorage.length-1;e>=0;e--){let t=localStorage.key(e);t?.startsWith(`ravenswood:thumb:`)&&!t.startsWith(`ravenswood:thumb:2026-10-29T22:11:57.300Z:`)&&localStorage.removeItem(t)}localStorage.setItem(`ravenswood:thumbs-for`,`2026-10-29T22:11:57.300Z`)}localStorage.setItem(df(e,t),n)}catch{}}function mf({id:e,icon:t}){let n=`pet2-${e}`,[r,i]=(0,K.useState)(()=>ff(n,``));return(0,K.useEffect)(()=>{if(r||p())return;let t=!0,a=uf(()=>{if(!t)return;let r=Sd(e,96)||null;i(r),r&&pf(n,``,r)});return()=>{t=!1,a()}},[e,n,r]),r?(0,J.jsx)(`img`,{className:`pet-picture`,src:r,alt:``}):(0,J.jsx)(J.Fragment,{children:t})}function hf({id:e,icon:t}){let n=`hat-${e}`,[r,i]=(0,K.useState)(()=>ff(n,``));return(0,K.useEffect)(()=>{if(r||p())return;let t=!0,a=uf(()=>{if(!t)return;let r=Cd(e,96)||null;i(r),r&&pf(n,``,r)});return()=>{t=!1,a()}},[e,n,r]),r?(0,J.jsx)(`img`,{className:`pet-picture`,src:r,alt:``}):(0,J.jsx)(J.Fragment,{children:t})}function gf({look:e,icon:t}){let[n,r]=(0,K.useState)(null),{animal:i,color:a,hat:o}=e,s=!!(o&&Wc[o])&&!p();return(0,K.useEffect)(()=>{if(p()||s)return;let e=!0,t=uf(()=>{e&&r(wd({animal:i,color:a,hat:o},160)||null)});return()=>{e=!1,t()}},[i,a,o,s]),s?(0,J.jsx)(kd,{look:{animal:i,color:a,hat:o},size:120,className:`try-on-picture try-on-live`}):n?(0,J.jsx)(`img`,{className:`try-on-picture`,src:n,alt:``}):(0,J.jsx)(`span`,{className:`try-on-picture`,children:t})}function _f({id:e,on:t,owner:n,locked:r,onPick:i}){let a=D(e),[o,s]=(0,K.useState)(()=>ff(e,a.colors[0]));return(0,K.useEffect)(()=>{if(o||p())return;let t=!0,n=uf(()=>{if(t)try{let t=wd({animal:e,color:a.colors[0]},96)||null;s(t),t&&pf(e,a.colors[0],t)}catch{s(null)}});return()=>{t=!1,n()}},[e,a.colors,o]),(0,J.jsxs)(`button`,{className:`join-tile ${t?`on`:``} ${a.aquatic?`wet`:``} ${n?`taken`:``} ${r?`locked`:``}`,onClick:i,role:`radio`,"aria-checked":t,"aria-disabled":!!n||r,title:n?`${a.name}: ${n.choosing?`${n.by} is choosing it`:`taken by ${n.by}`}`:a.name,children:[o?(0,J.jsx)(`img`,{src:o,alt:``}):(0,J.jsx)(`span`,{className:`join-tile-blank`}),(0,J.jsx)(`span`,{children:a.name}),n&&(0,J.jsx)(`em`,{className:`join-tile-owner`,children:n.choosing?`${n.by} is looking…`:n.by})]})}function vf({name:e,look:t,onBack:n,onDone:r}){let i=Md(e=>e.mic),[a,o]=(0,K.useState)(0);return(0,K.useEffect)(()=>{if(i!==`on`)return;let e=setInterval(()=>o(+!!Vd.speaking()),100);return()=>clearInterval(e)},[i]),(0,J.jsxs)(`div`,{className:`join-card cosy-panel join-mic`,children:[(0,J.jsx)(kd,{look:t,size:180,spin:!1,anim:a?`laugh`:`wave`}),(0,J.jsx)(`h1`,{children:`Can everyone hear you?`}),(0,J.jsx)(`p`,{children:`Ravenswood has proximity chat: people close to you hear you, people far away don’t, and buildings are private. Headphones stop echo.`}),i===`on`?(0,J.jsxs)(`div`,{className:`mic-meter ${a?`loud`:``}`,children:[(0,J.jsx)(`span`,{}),a?`We can hear you!`:`Say something…`]}):(0,J.jsxs)(`button`,{className:`cosy-btn big`,onClick:()=>void Vd.enableMic(),disabled:i===`asking`,children:[`🎙️ `,i===`asking`?`Waiting for your browser…`:`Turn on my microphone`]}),i===`denied`&&(0,J.jsx)(`p`,{className:`join-warn`,children:`Your browser blocked the mic. Click the padlock beside the address bar to allow it, or carry on and just listen.`}),i===`error`&&(0,J.jsx)(`p`,{className:`join-warn`,children:`We couldn’t find a microphone. You can still listen.`}),(0,J.jsxs)(`div`,{className:`join-actions`,children:[(0,J.jsx)(`button`,{className:`cosy-btn`,onClick:n,children:`Back`}),(0,J.jsx)(`button`,{className:`cosy-btn primary big`,onClick:r,children:i===`on`?`Into town, ${e.trim()}!`:`Just listen for now`})]})]})}export{Co as A,rs as C,jo as D,Qo as E,ts as F,Jo as I,Go as L,wo as M,Eo as N,Mo as O,So as P,q as R,is as S,No as T,kd as _,gf as a,Wc as b,qd as c,Ud as d,Kd as f,Vd as g,Md as h,mf as i,To as j,Fo as k,ef as l,Bd as m,nf as n,Yd as o,Wd as p,af as r,tf as s,hf as t,Gd as u,td as v,as as w,Kc as x,ud as y,ho as z};