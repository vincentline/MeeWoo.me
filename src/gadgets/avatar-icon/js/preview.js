/**
 * Avatar图标预览器 - Konva版本
 * 基于 Konva 实现的 750x750 画布编辑器
 */

import Konva from 'konva';

class AvatarPreviewer {
  constructor() {
    this.canvasWidth = 750;
    this.canvasHeight = 750;
    
    this.stage = null;
    this.layer = null;
    this.transformer = null;
    this.backgroundRect = null;
    this.bodyImage = null;
    this.imageA = null;
    this.imageB = null;
    
    this.imageAFileName = '';
    this.currentBodyType = 'none';
    this.currentBgColor = '#F7F7F7';
    
    this.selectedNode = null;
    this.activeUploadTarget = null;
    
    this.init();
  }
  
  init() {
    this.setupStage();
    this.bindEvents();
    this.bindPasteEvent();
  }
  
  setupStage() {
    this.stage = new Konva.Stage({
      container: 'konva-container',
      width: this.canvasWidth,
      height: this.canvasHeight,
      draggable: true
    });
    
    this.layer = new Konva.Layer();
    this.stage.add(this.layer);
    
    this.backgroundRect = new Konva.Rect({
      x: 0,
      y: 0,
      width: this.canvasWidth,
      height: this.canvasHeight,
      fill: this.currentBgColor
    });
    this.layer.add(this.backgroundRect);
    
    this.transformer = new Konva.Transformer({
      rotateEnabled: false,
      boundBoxFunc: (oldBox, newBox) => {
        if (newBox.width < 10 || newBox.height < 10) {
          return oldBox;
        }
        return newBox;
      }
    });
    this.layer.add(this.transformer);
    
    this.layer.draw();
    
    this.stage.on('mouseenter', () => {
      if (!this.selectedNode) {
        this.stage.draggable(true);
      }
    });
    
    this.stage.on('wheel', (e) => {
      e.evt.preventDefault();
      this.handleWheelZoom(e);
    });
    
    this.stage.on('click tap', (e) => {
      this.handleStageClick(e);
    });
  }
  
  handleWheelZoom(e) {
    const oldScale = this.stage.scaleX();
    const pointer = this.stage.getPointerPosition();
    
    const mousePointTo = {
      x: (pointer.x - this.stage.x()) / oldScale,
      y: (pointer.y - this.stage.y()) / oldScale
    };
    
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const newScale = direction > 0 ? oldScale * 1.05 : oldScale / 1.05;
    
    this.stage.scale({ x: newScale, y: newScale });
    
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale
    };
    this.stage.position(newPos);
    this.stage.batchDraw();
    
    document.getElementById('canvas-reset-btn').style.display = 'block';
  }
  
  handleStageClick(e) {
    if (e.target === this.stage || e.target === this.backgroundRect) {
      this.deselectNode();
    }
  }
  
  bindPasteEvent() {
    document.addEventListener('paste', (e) => {
      if (!this.activeUploadTarget) {
        return;
      }
      
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          e.preventDefault();
          const file = items[i].getAsFile();
          
          if (this.activeUploadTarget === 'A') {
            this.imageAFileName = 'pasted_image.png';
          }
          
          this.handleFileFromClipboard(file, this.activeUploadTarget);
          break;
        }
      }
    });
  }
  
  handleFileFromClipboard(file, type) {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (type === 'A') {
          if (!this.imageAFileName || this.imageAFileName === 'pasted_image.png') {
            this.imageAFileName = 'pasted_image.png';
          }
          document.getElementById('reset-btn-a').style.display = 'inline-block';
          document.getElementById('export-btn-a').style.display = 'inline-block';
          this.addImageToLayer(img, 'A');
        } else {
          document.getElementById('reset-btn-b').style.display = 'inline-block';
          document.getElementById('export-btn-b').style.display = 'inline-block';
          this.addImageToLayer(img, 'B');
        }
      };
      img.src = event.target.result;
    };
    
    reader.readAsDataURL(file);
  }
  
  bindEvents() {
    const uploadBtnA = document.getElementById('upload-btn-a');
    if (uploadBtnA) {
      uploadBtnA.addEventListener('click', () => {
        this.activeUploadTarget = 'A';
        document.getElementById('file-input-a').click();
      });
      
      uploadBtnA.addEventListener('mouseenter', () => {
        this.activeUploadTarget = 'A';
      });
      
      uploadBtnA.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBtnA.style.backgroundColor = '#2980b9';
        this.activeUploadTarget = 'A';
      });
      
      uploadBtnA.addEventListener('dragleave', () => {
        uploadBtnA.style.backgroundColor = '#333333';
      });
      
      uploadBtnA.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBtnA.style.backgroundColor = '#333333';
        this.activeUploadTarget = 'A';
        
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'image/png') {
          const fileInputA = document.getElementById('file-input-a');
          if (fileInputA) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInputA.files = dataTransfer.files;
            this.handleFileUpload({ target: fileInputA }, 'A');
          }
        }
      });
    }
    
    const fileInputA = document.getElementById('file-input-a');
    if (fileInputA) {
      fileInputA.addEventListener('change', (e) => {
        this.handleFileUpload(e, 'A');
      });
    }
    
    const uploadBtnB = document.getElementById('upload-btn-b');
    if (uploadBtnB) {
      uploadBtnB.addEventListener('click', () => {
        this.activeUploadTarget = 'B';
        document.getElementById('file-input-b').click();
      });
      
      uploadBtnB.addEventListener('mouseenter', () => {
        this.activeUploadTarget = 'B';
      });
      
      uploadBtnB.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBtnB.style.backgroundColor = '#2980b9';
        this.activeUploadTarget = 'B';
      });
      
      uploadBtnB.addEventListener('dragleave', () => {
        uploadBtnB.style.backgroundColor = '#333333';
      });
      
      uploadBtnB.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBtnB.style.backgroundColor = '#333333';
        this.activeUploadTarget = 'B';
        
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'image/png') {
          const fileInputB = document.getElementById('file-input-b');
          if (fileInputB) {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInputB.files = dataTransfer.files;
            this.handleFileUpload({ target: fileInputB }, 'B');
          }
        }
      });
    }
    
    const fileInputB = document.getElementById('file-input-b');
    if (fileInputB) {
      fileInputB.addEventListener('change', (e) => {
        this.handleFileUpload(e, 'B');
      });
    }
    
    const resetBtnA = document.getElementById('reset-btn-a');
    if (resetBtnA) {
      resetBtnA.addEventListener('click', () => {
        this.resetImageA();
      });
    }
    
    const resetBtnB = document.getElementById('reset-btn-b');
    if (resetBtnB) {
      resetBtnB.addEventListener('click', () => {
        this.resetImageB();
      });
    }
    
    const exportBtnA = document.getElementById('export-btn-a');
    if (exportBtnA) {
      exportBtnA.addEventListener('click', () => {
        this.exportSingleLayer('A');
      });
    }
    
    const exportBtnB = document.getElementById('export-btn-b');
    if (exportBtnB) {
      exportBtnB.addEventListener('click', () => {
        this.exportSingleLayer('B');
      });
    }
    
    const canvasResetBtn = document.getElementById('canvas-reset-btn');
    if (canvasResetBtn) {
      canvasResetBtn.addEventListener('click', () => {
        this.resetCanvas();
      });
    }
    
    const bodyBtns = document.querySelectorAll('.body-btn');
    bodyBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectBodyType(e.target.id.replace('body-', ''));
      });
    });
    
    const bgBtns = document.querySelectorAll('.bg-btn');
    bgBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectBgColor(e.target.id.replace('bg-', ''));
      });
    });
    
    const generateBtn = document.getElementById('generate-btn');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => {
        this.generateIcon();
      });
    }
  }
  
  handleFileUpload(e, type) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        if (type === 'A') {
          this.imageAFileName = file.name;
          document.getElementById('reset-btn-a').style.display = 'inline-block';
          document.getElementById('export-btn-a').style.display = 'inline-block';
          this.addImageToLayer(img, 'A');
        } else {
          document.getElementById('reset-btn-b').style.display = 'inline-block';
          document.getElementById('export-btn-b').style.display = 'inline-block';
          this.addImageToLayer(img, 'B');
        }
      };
      img.src = event.target.result;
    };
    
    reader.readAsDataURL(file);
  }
  
  addImageToLayer(img, type) {
    const scale = Math.min(
      this.canvasWidth / img.width,
      this.canvasHeight / img.height
    );
    
    const width = img.width * scale;
    const height = img.height * scale;
    
    const konvaImage = new Konva.Image({
      image: img,
      x: this.canvasWidth / 2,
      y: this.canvasHeight / 2,
      width: width,
      height: height,
      offsetX: width / 2,
      offsetY: height / 2,
      draggable: false
    });
    
    konvaImage.on('click tap', (e) => {
      if (this.selectedNode === konvaImage) {
        this.deselectNode();
      } else {
        this.selectNode(konvaImage);
      }
      e.cancelBubble = true;
    });
    
    if (type === 'A') {
      if (this.imageA) {
        this.imageA.destroy();
      }
      this.imageA = konvaImage;
      konvaImage.name('imageA');
    } else {
      if (this.imageB) {
        this.imageB.destroy();
      }
      this.imageB = konvaImage;
      konvaImage.name('imageB');
    }
    
    this.layer.add(konvaImage);
    this.updateLayerOrder();
    this.layer.draw();
  }
  
  selectNode(node) {
    if (this.selectedNode && this.selectedNode !== node) {
      this.selectedNode.draggable(false);
    }
    
    this.selectedNode = node;
    node.draggable(true);
    this.transformer.nodes([node]);
    this.stage.draggable(false);
    
    if (node.name() === 'imageA') {
      this.activeUploadTarget = 'A';
    } else if (node.name() === 'imageB') {
      this.activeUploadTarget = 'B';
    }
    
    this.layer.draw();
  }
  
  deselectNode() {
    if (this.selectedNode) {
      this.selectedNode.draggable(false);
    }
    this.transformer.nodes([]);
    this.selectedNode = null;
    this.stage.draggable(true);
    this.layer.draw();
  }
  
  updateLayerOrder() {
    this.backgroundRect.moveToBottom();
    
    if (this.imageB) {
      this.imageB.moveToTop();
    }
    
    if (this.bodyImage) {
      this.bodyImage.moveToTop();
    }
    
    if (this.imageA) {
      this.imageA.moveToTop();
    }
    
    this.transformer.moveToTop();
  }
  
  resetImageA() {
    if (this.imageA) {
      this.imageA.destroy();
      this.imageA = null;
    }
    this.imageAFileName = '';
    document.getElementById('reset-btn-a').style.display = 'none';
    document.getElementById('export-btn-a').style.display = 'none';
    this.transformer.nodes([]);
    this.selectedNode = null;
    this.layer.draw();
  }
  
  resetImageB() {
    if (this.imageB) {
      this.imageB.destroy();
      this.imageB = null;
    }
    document.getElementById('reset-btn-b').style.display = 'none';
    document.getElementById('export-btn-b').style.display = 'none';
    this.transformer.nodes([]);
    this.selectedNode = null;
    this.layer.draw();
  }
  
  resetCanvas() {
    this.stage.position({ x: 0, y: 0 });
    this.stage.scale({ x: 1, y: 1 });
    document.getElementById('canvas-reset-btn').style.display = 'none';
    this.stage.batchDraw();
  }
  
  selectBodyType(type) {
    this.currentBodyType = type;
    
    document.querySelectorAll('.body-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.getElementById(`body-${type}`).classList.add('active');
    
    if (this.bodyImage) {
      this.bodyImage.destroy();
      this.bodyImage = null;
    }
    
    if (type !== 'none') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = `img/${type === 'male' ? 'nan' : 'nv'}.png`;
      img.onload = () => {
        const scale = Math.min(
          this.canvasWidth / img.width,
          this.canvasHeight / img.height
        );
        
        const width = img.width * scale;
        const height = img.height * scale;
        
        this.bodyImage = new Konva.Image({
          image: img,
          x: this.canvasWidth / 2,
          y: this.canvasHeight / 2,
          width: width,
          height: height,
          offsetX: width / 2,
          offsetY: height / 2
        });
        
        this.bodyImage.name('bodyImage');
        this.layer.add(this.bodyImage);
        this.updateLayerOrder();
        this.layer.draw();
      };
    } else {
      this.layer.draw();
    }
  }
  
  selectBgColor(colorType) {
    this.currentBgColor = colorType === 'default' ? '#F7F7F7' : '#fff0e5';
    
    document.querySelectorAll('.bg-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.getElementById(`bg-${colorType}`).classList.add('active');
    
    this.backgroundRect.fill(this.currentBgColor);
    this.layer.draw();
  }
  
  generateIcon() {
    if (!this.imageA) {
      alert('请先上传按钮A的图片');
      return;
    }
    
    const exportStage = new Konva.Stage({
      container: document.createElement('div'),
      width: this.canvasWidth,
      height: this.canvasHeight
    });
    
    const exportLayer = new Konva.Layer();
    exportStage.add(exportLayer);
    
    const exportBg = new Konva.Rect({
      x: 0,
      y: 0,
      width: this.canvasWidth,
      height: this.canvasHeight,
      fill: this.currentBgColor
    });
    exportLayer.add(exportBg);
    
    if (this.imageB) {
      const cloneB = this.imageB.clone();
      exportLayer.add(cloneB);
    }
    
    if (this.bodyImage) {
      const cloneBody = this.bodyImage.clone();
      exportLayer.add(cloneBody);
    }
    
    if (this.imageA) {
      const cloneA = this.imageA.clone();
      exportLayer.add(cloneA);
    }
    
    exportLayer.draw();
    
    const dataURL = exportStage.toDataURL({ pixelRatio: 1 });
    
    const baseName = this.imageAFileName.replace(/\.[^/.]+$/, '');
    const fileName = 'btn_' + baseName + '.png';
    
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    exportStage.destroy();
  }
  
  exportSingleLayer(type) {
    const targetImage = type === 'A' ? this.imageA : this.imageB;
    
    if (!targetImage) {
      alert(`请先上传按钮${type}的图片`);
      return;
    }
    
    const exportStage = new Konva.Stage({
      container: document.createElement('div'),
      width: this.canvasWidth,
      height: this.canvasHeight
    });
    
    const exportLayer = new Konva.Layer();
    exportStage.add(exportLayer);
    
    const clone = targetImage.clone();
    exportLayer.add(clone);
    
    exportLayer.draw();
    
    const dataURL = exportStage.toDataURL({ pixelRatio: 1 });
    
    const baseName = type === 'A' 
      ? this.imageAFileName.replace(/\.[^/.]+$/, '')
      : 'layer_B';
    const fileName = `${baseName}_750x750.png`;
    
    const link = document.createElement('a');
    link.download = fileName;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    exportStage.destroy();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AvatarPreviewer();
});
