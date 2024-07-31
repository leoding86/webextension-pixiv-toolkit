/*
 * @Author: Leo Ding <leoding86@msn.com>
 * @Date: 2024-07-31 18:51:11
 * @LastEditors: Leo Ding <leoding86@msn.com>
 * @LastEditTime: 2024-07-31 23:34:36
 * @FilePath: \webextension-pixiv-toolkit\src\modules\Parser\PixivComic\ImageDecrypte.js
 */
import { decrypteKey } from './config';

export const decrypteImage = async (page, encryptedImageBlob, returnType = 'url') => {
  return new Promise((resolve, reject) => {
    const id = '#__PTK__pixiv-comic-episode-image-decrypte-canvas';

    /**
     * @type {HTMLCanvasElement}
     */
    let canvas = document.querySelector(id);

    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.setAttribute('id', id.substring(1));
      document.body.appendChild(canvas);
    }

    const c2d = canvas.getContext('2d');
    canvas.width = page.width;
    canvas.height = page.height;

    const image = new Image(canvas.width, canvas.height);
    image.onload = async () => {
      c2d.drawImage(image, 0, 0);
      const imageData = c2d.getImageData(0, 0, canvas.width, canvas.height);
      const decryptedImageData = await ImageDecrypte(
        imageData.data, 4, page.width, page.height, page.gridsize, page.gridsize, decrypteKey, page.key, true
      );
      const realImageData = new ImageData(decryptedImageData, page.width, page.height);
      c2d.putImageData(realImageData, 0, 0);
      canvas.toBlob((blob) => {
        if (returnType === 'blob') {
          resolve(blob);
          return;
        }
        const url = URL.createObjectURL(blob);
        resolve(url);
      });
    };
    image.src = URL.createObjectURL(encryptedImageBlob);
  });
};

class r {
  constructor(e) {
      this.compare = e,
      this.heapArray = [],
      this._limit = 0
  }
  static getChildrenIndexOf(e) {
      return [2 * e + 1, 2 * e + 2]
  }
  static getParentIndexOf(e) {
      return e <= 0 ? -1 : Math.floor((e - (e % 2 ? 1 : 2)) / 2)
  }
  push(e) {
      return this._sortNodeUp(this.heapArray.push(e) - 1),
      !0
  }
  length() {
      return this.heapArray.length
  }
  peek() {
      return this.heapArray[0]
  }
  pop() {
      let e = this.heapArray.pop();
      return this.length() > 0 && void 0 !== e ? this.replace(e) : e
  }
  replace(e) {
      let t = this.heapArray[0];
      return this.heapArray[0] = e,
      this._sortNodeDown(0),
      t
  }
  size() {
      return this.length()
  }
  _moveNode(e, t) {
      [this.heapArray[e],this.heapArray[t]] = [this.heapArray[t], this.heapArray[e]]
  }
  _sortNodeDown(e) {
      let t = e < this.heapArray.length - 1
        , n = this.heapArray[e]
        , i = (e,t)=>(this.heapArray.length > t && 0 > this.compare(this.heapArray[t], this.heapArray[e]) && (e = t),
      e);
      for (; t; ) {
          let s = r.getChildrenIndexOf(e)
            , o = s.reduce(i, s[0])
            , u = this.heapArray[o];
          void 0 !== u && this.compare(n, u) > 0 ? (this._moveNode(e, o),
          e = o) : t = !1
      }
  }
  _sortNodeUp(e) {
      let t = e > 0;
      for (; t; ) {
          let n = r.getParentIndexOf(e);
          n >= 0 && this.compare(this.heapArray[n], this.heapArray[e]) > 0 ? (this._moveNode(e, n),
          e = n) : t = !1
      }
  }
}

// let tE = r(62637);

function tC(e, t) {
  return (e << (t %= 32) >>> 0 | e >>> 32 - t) >>> 0
}

class tI {
  next() {
      let e = 9 * tC(5 * this.s[1] >>> 0, 7) >>> 0
        , t = this.s[1] << 9 >>> 0;
      return this.s[2] = (this.s[2] ^ this.s[0]) >>> 0,
      this.s[3] = (this.s[3] ^ this.s[1]) >>> 0,
      this.s[1] = (this.s[1] ^ this.s[2]) >>> 0,
      this.s[0] = (this.s[0] ^ this.s[3]) >>> 0,
      this.s[2] = (this.s[2] ^ t) >>> 0,
      this.s[3] = tC(this.s[3], 11),
      e
  }
  constructor(e) {
      if (4 !== e.length)
          throw Error("seed.length !== 4 (seed.length: ".concat(e.length, ")"));
      this.s = new Uint32Array(e),
      0 === this.s[0] && 0 === this.s[1] && 0 === this.s[2] && 0 === this.s[3] && (this.s[0] = 1)
  }
}

export const ImageDecrypte = async function (e, t, r, i, s, n, a, l, o) {
  if (t <= 0 || r <= 0 || i <= 0 || s <= 0 || n <= 0)
      throw Error("bytesPerElement <= 0 || width <= 0 || height <= 0 || blockSizeH <= 0 || blockSizeV <= 0 (bytesPerElement: ".concat(t, ", width: ").concat(r, ", height: ").concat(i, ", blockSizeH: ").concat(s, ", blockSizeV: ").concat(n, ")"));
  if (!Number.isSafeInteger(t) || !Number.isSafeInteger(r) || !Number.isSafeInteger(i) || !Number.isSafeInteger(s) || !Number.isSafeInteger(n))
      throw Error("!Number.isSafeInteger(bytesPerElement) || !Number.isSafeInteger(width) || !Number.isSafeInteger(height) || !Number.isSafeInteger(blockSizeH) || !Number.isSafeInteger(blockSizeV) (bytesPerElement: ".concat(t, ", width: ").concat(r, ", height: ").concat(i, ", blockSizeH: ").concat(s, ", blockSizeV: ").concat(n, ")"));
  if (e.length !== r * i * t)
      throw Error("data.length !== width * height * bytesPerElement (data.length: ".concat(e.length, ", width: ").concat(r, ", height: ").concat(i, ", bytesPerElement: ").concat(t, ")"));
  let d = Math.ceil(i / n)
    , c = Math.floor(r / s)
    , u = Array(d).fill(null).map(()=>Array.from(Array(c).keys()));
  {
      let e = new TextEncoder().encode(a + l)
        , t = await crypto.subtle.digest("SHA-256", e)
        , r = new Uint32Array(t,0,4)
        , i = new tI(r);
      for (let e = 0; e < 100; e++)
          i.next();
      for (let e = 0; e < d; e++) {
          let t = u[e];
          for (let e = c - 1; e >= 1; e--) {
              let r = i.next() % (e + 1)
                , s = t[e];
              t[e] = t[r],
              t[r] = s
          }
      }
  }
  if (o)
      for (let e = 0; e < d; e++) {
          let t = u[e]
            , r = t.map((e,r)=>t.indexOf(r));
          if (r.some(e=>e < 0))
              throw Error("Failed to reverse shuffle table");
          u[e] = r
      }
  let h = new Uint8ClampedArray(e.length);
  for (let a = 0; a < i; a++) {
      let i = Math.floor(a / n)
        , l = u[i];
      for (let i = 0; i < c; i++) {
          let n = l[i]
            , o = i * s
            , d = (a * r + o) * t
            , c = n * s
            , u = (a * r + c) * t
            , p = s * t;
          for (let t = 0; t < p; t++)
              h[d + t] = e[u + t]
      }
      {
          let i = c * s
            , n = (a * r + i) * t
            , l = (a * r + r) * t;
          for (let t = n; t < l; t++)
              h[t] = e[t]
      }
  }
  return h
}
