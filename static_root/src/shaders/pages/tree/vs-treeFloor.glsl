
uniform float timer;
uniform float bumpHeight;
uniform float bumpSize;
uniform float bumpSpeed;
uniform float bumpCutoff;

uniform vec3 cameraPos;
uniform vec3 lightPositions[7];
uniform float lightCutoff;
uniform float lightPower;

uniform vec3 lightPos;
varying vec3 vNorm;
varying vec3 vPos;
varying vec3 vMPos;
varying vec2 vUv;

varying vec3 vLightDir[7];
varying float vDistMultiplier[7];
varying vec3 vCamDir;
varying vec3 vManiDir;

$simplex

vec3 noisePos( vec3 pos , vec2 offset , float cutoff ){

  float multiplier = snoise( pos.xy * vec2( bumpSize , bumpSize * .7 ) + offset);

  vec3 p = pos + vec3( 0 , 0 , 1 ) *( multiplier+1.) * bumpHeight * cutoff;

  return p;

}

void main(){


  vec2 centerUV = abs( uv - vec2( .5 , .5 ) );
 
  float dCutoff = max( 0. , (1. - pow((length( centerUV )*3.), bumpCutoff )));

 // dCutoff = 1.;
  vec2 offset = vec2( timer , timer ) * vec2( bumpSpeed , bumpSpeed * .7 );

  vec3 fPos = noisePos( position, offset , dCutoff );

  vec3 pXUp = noisePos( position + vec3( 1.  , 0.  , 0. ) , offset , dCutoff );
  vec3 pXDo = noisePos( position + vec3( -1. , 0.  , 0. ) , offset , dCutoff );
  vec3 pYUp = noisePos( position + vec3( .0  , 1.  , 0. ) , offset , dCutoff );
  vec3 pYDo = noisePos( position + vec3( .0  , -1. , 0. ) , offset , dCutoff );


  vec3 dX = pXUp - pXDo;
  vec3 dY = pYUp - pYDo;

  vec3 norm = normalize( cross( dX , dY ));

  vNorm = ( modelMatrix * vec4( norm , 0. )).xyz;
  vUv   = uv;
  vPos  = position;
  vMPos  = ( modelMatrix * vec4( fPos , 1.  )).xyz;

  for( int i = 0; i < 7; i++ ){

    vec3 lightRay = vMPos - lightPositions[i];
    vLightDir[i] = normalize( lightRay );
    float dist = length( lightRay );

    float distMultiplier = clamp( lightCutoff / dist , 0. , 1. );
    vDistMultiplier[i] = pow( distMultiplier , lightPower );

  }


  vCamDir   = normalize( vMPos - cameraPos);
  vManiDir   = normalize( vMPos - lightPos);
 


  gl_Position = projectionMatrix * modelViewMatrix * vec4( fPos , 1. );

}
