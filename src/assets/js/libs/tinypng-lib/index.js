var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/index.ts
import { ImagequantImage, Imagequant } from "tinypng-lib-wasm";
import CompressorJpeg from "compressorjs";
var canvastoFile = (canvas, type, quality) => {
  return new Promise(
    (resolve) => canvas.toBlob((blob) => resolve(blob), type, quality)
  );
};
var dataURLToImage = (dataURL) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.src = dataURL;
  });
};
function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      if (reader.result && typeof reader.result == "string") {
        resolve(reader.result);
      }
    };
    reader.onerror = function(e) {
      reject(e);
    };
    reader.readAsDataURL(file);
  });
}
var getImageData = (file) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("\u65E0\u6CD5\u83B7\u53D6 canvas \u4E0A\u4E0B\u6587"));
        return;
      }
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const data = imageData.data;
      const buffer = new Uint8Array(data).buffer;
      const expectedLength = img.width * img.height * 4;
      if (buffer.byteLength !== expectedLength) {
        reject(new Error(`\u7F13\u51B2\u533A\u957F\u5EA6\u4E0D\u5339\u914D\uFF1A\u671F\u671B ${expectedLength} \u5B57\u8282\uFF0C\u4F46\u5F97\u5230 ${buffer.byteLength} \u5B57\u8282`));
        return;
      }
      resolve({
        buffer,
        width: img.width,
        height: img.height,
        size: file.size,
        name: file.name,
        type: file.type
      });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => {
      reject(new Error("\u56FE\u7247\u52A0\u8F7D\u5931\u8D25"));
      URL.revokeObjectURL(img.src);
    };
  });
};
var uint8ArrayToFile = (uint8Array, fileName) => {
  const blob = new Blob([uint8Array], { type: "image/png" });
  return {
    file: new File([blob], fileName || `${Date.now()}.png`, { type: "image/png", lastModified: Date.now() }),
    blob
  };
};
var blobToFile = (blob, fileName) => {
  return new File([blob], fileName || `${Date.now()}.png`, { type: "image/png", lastModified: Date.now() });
};
function fileToBlob(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const arrayBuffer = reader.result;
      const blob = new Blob([arrayBuffer], { type: file.type });
      resolve(blob);
    };
    reader.onerror = () => {
      reject(new Error("File reading failed"));
    };
    reader.readAsArrayBuffer(file);
  });
}
var compressJpeg = (_0, ..._1) => __async(void 0, [_0, ..._1], function* (file, options = {}) {
  return new Promise((resolve) => __async(void 0, null, function* () {
    new CompressorJpeg(file, {
      quality: options.quality,
      convertSize: Number.MAX_SAFE_INTEGER,
      // The compression process is asynchronous,
      // which means you have to access the `result` in the `success` hook function.
      success(result) {
        resolve({
          blob: result
        });
      },
      error(err) {
        resolve({
          blob: file
        });
      }
    });
  }));
});
var TinyPNG = class {
  constructor() {
    /**
     * 获取图片信息
     */
    this.getImage = getImageData;
    this.fileToBlob = fileToBlob;
  }
  /**
   *  压缩图片(jpeg、jpg)
   * @param file 文件
   * @param { {quality: number}} options 
   * @returns 
   */
  _compressJpegImage(file, options) {
    return __async(this, null, function* () {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      const base64 = yield fileToDataURL(file);
      const img = yield dataURLToImage(base64);
      canvas.width = img.width;
      canvas.height = img.height;
      const blob = yield canvastoFile(
        canvas,
        file.type,
        ((options == null ? void 0 : options.quality) || 50) / 100
      );
      return {
        file: new File([blob], options.fileName || file.name, {
          type: file.type
        }),
        blob
      };
    });
  }
  /**
   * 
   * @param file 图片文件
   * @param options 
   * @returns 
   */
  compressJpegImage(_0) {
    return __async(this, arguments, function* (file, options = {}) {
      if (!file) throw new Error("file can not be null");
      if (!["image/jpeg", "image/jpg"].includes(file.type)) {
        throw new Error("file must be jpeg or jpg");
      }
      const quality = ((options == null ? void 0 : options.quality) || 88) / 100;
      const {
        blob
      } = yield compressJpeg(file, {
        quality
      });
      if (blob instanceof File) {
        return {
          success: true,
          file: blob,
          originalSize: file.size,
          compressedSize: blob.size,
          rate: blob.size / file.size,
          rateString: `${(blob.size / file.size * 100).toFixed(2)}%`,
          blob: yield fileToBlob(blob),
          options
        };
      }
      const compressFile = blobToFile(blob, options.fileName || file.name);
      return {
        success: true,
        file: compressFile,
        originalSize: file.size,
        compressedSize: compressFile.size,
        rate: compressFile.size / file.size,
        rateString: `${(compressFile.size / file.size * 100).toFixed(2)}%`,
        blob,
        options
      };
    });
  }
  /**
   *  压缩图片
   * @param file 文件
   * @param {{
   *   minimumQuality: number,
   *   quality: number
   * }} options
   * @returns 
   */
  compress(_0) {
    return __async(this, arguments, function* (file, options = {}) {
      if (!file) throw new Error("file can not be null");
      if (!file.type.includes("image/")) throw new Error("file must be image");
      try {
        if (["image/jpeg", "image/jpg"].includes(file.type)) {
          return yield this.compressJpegImage(file, options);
        } else {
          return this.compressPngImage(yield getImageData(file), __spreadProps(__spreadValues({}, options), {
            fileName: options.fileName || file.name
          }));
        }
      } catch (error) {
        return {
          success: false,
          error
        };
      }
    });
  }
  compressPngImage(imageData, options) {
    return __async(this, null, function* () {
      if (!imageData) throw new Error("imageData can not be null");
      if (!imageData.type.includes("image/png")) throw new Error("imageData must be png");
      const {
        buffer,
        width: imageDataWidth,
        height: imageDataHeight,
        size: originalSize
      } = imageData;
      const uint8Array = new Uint8Array(buffer);
      const imagequant = new ImagequantImage(uint8Array, imageDataWidth, imageDataHeight, 0);
      const imagequantnstance = new Imagequant();
      imagequantnstance.set_quality((options == null ? void 0 : options.minimumQuality) || 0, (options == null ? void 0 : options.quality) || 88);
      const output = imagequantnstance.process(imagequant);
      const { file: outputFile, blob } = uint8ArrayToFile(output, (options == null ? void 0 : options.fileName) || "compressed.png");
      const rate = outputFile.size / originalSize;
      return {
        success: true,
        file: outputFile,
        // output,
        originalSize,
        compressedSize: outputFile.size,
        rate,
        blob,
        rateString: `${(rate * 100).toFixed(2)}%`,
        options
      };
    });
  }
  /**
   *  压缩png图片
   * @param image 图片对象
   * @param options 
   * @returns 
   */
  compressWorkerImage(image, options) {
    return __async(this, null, function* () {
      if (image.type !== "image/png") {
        throw new Error("\u53EA\u652F\u6301png\u683C\u5F0F, jpeg\uFF0Cjpg\u8BF7\u5728\u4E3B\u7EBF\u7A0B\u4F7F\u7528compressJpegImage\u65B9\u6CD5");
      }
      return this.compressPngImage(image, __spreadProps(__spreadValues({}, options), {
        fileName: options.fileName || image.name
      }));
    });
  }
};
var src_default = new TinyPNG();
export {
  compressJpeg,
  src_default as default
};
