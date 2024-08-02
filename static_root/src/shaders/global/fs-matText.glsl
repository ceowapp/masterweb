vColor = customColor;
float xxx = mapRange(vPosition.x, uMin.x, uMax.x, -1., 1.0);
float prog = (position.x + 1.) / 2.;
float locprog = clamp((progress - 0.8 * prog) / 0.2, 0., 1.);
locprog = progress;
vec3 transformed = position + aCenterButton;
transformed += 3. * normal * aRandom * locprog;
transformed *= (1. - locprog);
transformed += aCenterButton;
transformed = rotate(transformed, vec3(0.0, 1.0, 0.0), aRandom * locprog * xxx * PI * 1.);
gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);