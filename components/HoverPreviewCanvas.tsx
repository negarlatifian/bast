'use client';

import { useEffect, useRef } from 'react';

type HoverPreviewCanvasProps = {
  src: string | null;
  alt: string;
  title: string;
  artists: string[];
  onAspectChange?: (aspect: number) => void;
};

const VERTEX_SHADER = `
  attribute vec2 aPosition;
  varying vec2 vUv;

  void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

// Treats the photo like a screen print that hasn't come into register yet:
// the red (and, more faintly, blue) ink plate drifts off the shared
// registration point — with a slight hand-cranked wobble — and pulls into
// alignment as the card reveals, passing through the same red-dominant,
// halftone-dotted tone as the gallery cards' idle state on the way to full
// colour.
const FRAGMENT_SHADER = `
  precision mediump float;
  varying vec2 vUv;

  uniform sampler2D uTexture;
  uniform float uReveal;
  uniform float uTime;
  uniform vec2 uOrigin;
  uniform float uHasTexture;
  uniform float uImageAspect;
  uniform float uCanvasAspect;
  uniform float uDotSpacing;

  void main() {
    float ratioX = min(uCanvasAspect / uImageAspect, 1.0);
    float ratioY = min(uImageAspect / uCanvasAspect, 1.0);
    vec2 coverUv = vec2(
      vUv.x * ratioX + (1.0 - ratioX) * 0.5,
      vUv.y * ratioY + (1.0 - ratioY) * 0.5
    );

    float dist = distance(vUv, uOrigin);
    float mask = clamp(uReveal * 1.8 - dist * 0.7, 0.0, 1.0);

    float driftAmount = (1.0 - mask) * 0.022;
    float wobble = sin(uTime * 2.4 + vUv.y * 14.0) * 0.006 * (1.0 - mask);
    vec2 drift = vec2(0.72, 0.4) * (driftAmount + wobble);

    float r = texture2D(uTexture, coverUv + drift).r;
    float g = texture2D(uTexture, coverUv).g;
    float b = texture2D(uTexture, coverUv - drift * 0.6).b;
    vec3 color = vec3(r, g, b);
    color = mix(color * vec3(1.25, 0.72, 0.74), color, mask);

    // Same 4px-on-screen halftone grid used on the idle gallery cards —
    // doubles here as the print's screen mesh.
    vec2 cell = mod(gl_FragCoord.xy, uDotSpacing) - uDotSpacing * 0.5;
    float dotShade = 1.0 - smoothstep(uDotSpacing * 0.12, uDotSpacing * 0.3, length(cell));
    color -= dotShade * 0.4 * (1.0 - mask);

    float alpha = mask * uHasTexture;
    gl_FragColor = vec4(color, alpha);
  }
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);

  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  return shader;
}

export default function HoverPreviewCanvas({
  src,
  alt,
  title,
  artists,
  onAspectChange,
}: HoverPreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<{
    gl: WebGLRenderingContext;
    program: WebGLProgram;
    texture: WebGLTexture;
    uniforms: Record<string, WebGLUniformLocation | null>;
  } | null>(null);
  const animationRef = useRef<{
    reveal: number;
    target: number;
    origin: [number, number];
    hasTexture: number;
    textureTarget: number;
    start: number;
  }>({
    reveal: 0,
    target: 0,
    origin: [0.5, 0.15],
    hasTexture: 0,
    textureTarget: 0,
    start: performance.now(),
  });
  const textureCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const imageAspectRef = useRef(1);
  const dprRef = useRef(1);
  const onAspectChangeRef = useRef(onAspectChange);
  onAspectChangeRef.current = onAspectChange;

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const gl = canvas.getContext('webgl', { premultipliedAlpha: true, alpha: true });

    if (!gl) {
      return;
    }

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    const program = gl.createProgram();

    if (!vertexShader || !fragmentShader || !program) {
      return;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const quad = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 0])
    );

    if (!texture) {
      return;
    }

    stateRef.current = {
      gl,
      program,
      texture,
      uniforms: {
        uTexture: gl.getUniformLocation(program, 'uTexture'),
        uReveal: gl.getUniformLocation(program, 'uReveal'),
        uTime: gl.getUniformLocation(program, 'uTime'),
        uOrigin: gl.getUniformLocation(program, 'uOrigin'),
        uHasTexture: gl.getUniformLocation(program, 'uHasTexture'),
        uImageAspect: gl.getUniformLocation(program, 'uImageAspect'),
        uCanvasAspect: gl.getUniformLocation(program, 'uCanvasAspect'),
        uDotSpacing: gl.getUniformLocation(program, 'uDotSpacing'),
      },
    };

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let disposed = false;
    let frameId = 0;

    const resize = () => {
      const parent = canvas.parentElement;

      if (!parent) {
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      dprRef.current = dpr;
      const width = Math.round(parent.clientWidth * dpr);
      const height = Math.round(parent.clientHeight * dpr);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const draw = () => {
      if (disposed) {
        return;
      }

      resize();

      const anim = animationRef.current;
      anim.reveal += (anim.target - anim.reveal) * 0.12;
      anim.hasTexture += (anim.textureTarget - anim.hasTexture) * 0.12;
      const elapsed = (performance.now() - anim.start) / 1000;

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      const current = stateRef.current;

      if (current) {
        gl.useProgram(current.program);
        gl.uniform1f(current.uniforms.uReveal, anim.reveal);
        gl.uniform1f(current.uniforms.uTime, elapsed);
        gl.uniform2f(current.uniforms.uOrigin, anim.origin[0], anim.origin[1]);
        gl.uniform1f(current.uniforms.uHasTexture, anim.hasTexture);
        gl.uniform1f(current.uniforms.uImageAspect, imageAspectRef.current);
        gl.uniform1f(
          current.uniforms.uCanvasAspect,
          canvas.width / Math.max(canvas.height, 1)
        );
        gl.uniform1f(current.uniforms.uDotSpacing, 4 * dprRef.current);
        gl.uniform1i(current.uniforms.uTexture, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, current.texture);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }

      frameId = requestAnimationFrame(draw);
    };

    frameId = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteTexture(texture);
      gl.deleteBuffer(buffer);
    };
  }, []);

  useEffect(() => {
    const current = stateRef.current;
    const anim = animationRef.current;

    if (!current) {
      return;
    }

    if (!src) {
      anim.target = 0;
      anim.textureTarget = 0;
      return;
    }

    anim.origin = [0.5, 0.12];
    anim.target = 1;

    const cache = textureCache.current;
    const cached = cache.get(src);

    const applyImage = (image: HTMLImageElement) => {
      if (stateRef.current !== current) {
        return;
      }

      const { gl, texture } = current;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      const aspect = image.naturalWidth / Math.max(image.naturalHeight, 1);
      imageAspectRef.current = aspect;
      onAspectChangeRef.current?.(aspect);
      anim.textureTarget = 1;
    };

    if (cached) {
      applyImage(cached);
      return;
    }

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      cache.set(src, image);
      applyImage(image);
    };
    image.src = src;
  }, [src]);

  return (
    <div title={src ? alt : undefined} className='relative h-full w-full overflow-hidden bg-[#e9e3d6]'>
      <canvas ref={canvasRef} className='absolute inset-0 h-full w-full' />
      {!src && (
        <div className='absolute inset-0 flex items-center justify-center'>
          <span aria-hidden='true' className='text-2xl font-light text-[#a39a8d]'>+</span>
        </div>
      )}
      {src && (
        <div className='pointer-events-none absolute inset-0 flex flex-col justify-end gap-1 p-3'>
          <h3 className='text-[0.95rem] font-semibold leading-5 text-white'>{title}</h3>
          {artists.length > 0 && (
            <p className='truncate text-[0.78rem] leading-4 text-white/90'>
              {artists.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
