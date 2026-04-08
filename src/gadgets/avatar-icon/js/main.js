// Avatar图标生成器 - 主脚本

class AvatarGenerator {
    constructor() {
        this.currentCropper = null;
        this.currentFile = null;
        this.filesQueue = [];
        this.processingIndex = 0;
        this.canvasList = [];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
    }
    
    bindEvents() {
        // 上传按钮点击事件
        document.getElementById('upload-btn').addEventListener('click', () => {
            document.getElementById('file-input').click();
        });
        
        // 文件选择事件
        document.getElementById('file-input').addEventListener('change', (e) => {
            this.handleFileSelect(e);
        });
        
        // 关闭弹窗事件
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeCropModal();
        });
        
        // 取消裁剪事件
        document.getElementById('cancel-crop').addEventListener('click', () => {
            this.closeCropModal();
        });
        
        // 确定裁剪事件
        document.getElementById('confirm-crop').addEventListener('click', () => {
            this.confirmCrop();
        });
        
        // 返回按钮事件
        document.getElementById('back-btn').addEventListener('click', () => {
            this.resetState();
        });
        
        // 批量下载按钮事件
        document.getElementById('batch-download-btn').addEventListener('click', () => {
            this.batchDownload();
        });
        
        // 点击弹窗外部关闭
        document.getElementById('crop-modal').addEventListener('click', (e) => {
            if (e.target.id === 'crop-modal') {
                this.closeCropModal();
            }
        });
    }
    
    handleFileSelect(e) {
        const files = Array.from(e.target.files);
        
        if (files.length === 0) return;
        
        // 验证文件格式
        const validFiles = files.filter(file => file.type === 'image/png');
        
        if (validFiles.length === 0) {
            alert('请选择PNG格式的图片文件');
            return;
        }
        
        // 显示返回按钮和Canvas容器
        document.getElementById('back-btn').style.display = 'block';
        document.getElementById('upload-section').style.display = 'none';
        document.getElementById('canvas-container').style.display = 'block';
        
        // 清空之前的Canvas列表
        this.canvasList = [];
        document.getElementById('canvas-list').innerHTML = '';
        document.getElementById('batch-download-btn').style.display = 'none';
        
        // 设置文件队列
        this.filesQueue = validFiles;
        this.processingIndex = 0;
        
        // 开始处理第一个文件
        this.processNextFile();
    }
    
    processNextFile() {
        if (this.processingIndex >= this.filesQueue.length) {
            // 所有文件处理完成
            if (this.canvasList.length > 1) {
                document.getElementById('batch-download-btn').style.display = 'block';
            }
            return;
        }
        
        this.currentFile = this.filesQueue[this.processingIndex];
        this.showCropModal(this.currentFile);
    }
    
    showCropModal(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = document.getElementById('crop-image');
            img.src = e.target.result;
            
            // 初始化Cropper
            setTimeout(() => {
                if (this.currentCropper) {
                    this.currentCropper.destroy();
                }
                
                this.currentCropper = new Cropper(img, {
                    aspectRatio: 1,
                    viewMode: 0, // 设置为0允许图片缩放到裁剪框外
                    autoCropArea: 1, // 设置为1让图片填满裁剪框
                    zoomable: true,
                    zoomOnWheel: true,
                    wheelZoomRatio: 0.04, // 缩放步进4%
                    movable: true,
                    cropBoxResizable: false,
                    cropBoxMovable: false,
                    autoCrop: true, // 自动裁剪
                    restore: false, // 不恢复上次的裁剪状态
                    guides: true, // 显示裁剪框的辅助线
                    center: true, // 显示裁剪框的中心点
                    highlight: true, // 显示裁剪框的高亮区域
                    cropBoxData: null, // 使用默认的裁剪框位置
                    dragMode: 'move', // 设置拖动模式为移动图片
                    minZoom: 0.1 // 设置最小缩放比例，允许图片缩放到很小
                });
                
                // 显示弹窗
                document.getElementById('crop-modal').style.display = 'flex';
            }, 100);
        };
        
        reader.readAsDataURL(file);
    }
    
    confirmCrop() {
        if (!this.currentCropper) return;
        
        // 获取裁剪后的图片数据
        const canvas = this.currentCropper.getCroppedCanvas({
            width: 198,
            height: 198
        });
        
        // 创建显示用的Canvas
        this.createDisplayCanvas(canvas);
        
        // 关闭弹窗
        this.closeCropModal();
        
        // 处理下一个文件
        this.processingIndex++;
        this.processNextFile();
    }
    
    createDisplayCanvas(croppedCanvas) {
        const canvasList = document.getElementById('canvas-list');
        
        // 创建Canvas项
        const canvasItem = document.createElement('div');
        canvasItem.className = 'canvas-item';
        
        // 创建显示用的Canvas
        const displayCanvas = document.createElement('canvas');
        displayCanvas.width = 198;
        displayCanvas.height = 198;
        
        // 设置背景色#F7F7F7
        const ctx = displayCanvas.getContext('2d');
        ctx.fillStyle = '#F7F7F7';
        ctx.fillRect(0, 0, displayCanvas.width, displayCanvas.height);
        
        // 绘制裁剪后的图片
        ctx.drawImage(croppedCanvas, 0, 0);
        
        // 创建下载按钮
        const downloadBtn = document.createElement('button');
        downloadBtn.textContent = '下载';
        downloadBtn.addEventListener('click', () => {
            this.downloadImage(displayCanvas, this.currentFile.name);
        });
        
        // 添加到DOM
        canvasItem.appendChild(displayCanvas);
        canvasItem.appendChild(downloadBtn);
        canvasList.appendChild(canvasItem);
        
        // 保存到Canvas列表
        this.canvasList.push({
            canvas: displayCanvas,
            filename: this.currentFile.name
        });
    }
    
    downloadImage(canvas, filename) {
        const link = document.createElement('a');
        const baseName = filename.replace(/\.[^/.]+$/, '');
        link.download = 'btn_' + baseName + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
    
    batchDownload() {
        if (this.canvasList.length === 0) return;
        
        const zip = new JSZip();
        
        // 添加所有图片到ZIP
        this.canvasList.forEach((item, index) => {
            const baseName = item.filename.replace(/\.[^/.]+$/, '');
            const filename = 'btn_' + baseName + '.png';
            zip.file(filename, item.canvas.toDataURL('image/png').split(',')[1], {
                base64: true
            });
        });
        
        // 生成ZIP文件并下载
        zip.generateAsync({ type: 'blob' }).then((blob) => {
            const link = document.createElement('a');
            link.download = 'avatars.zip';
            link.href = URL.createObjectURL(blob);
            link.click();
        });
    }
    
    closeCropModal() {
        if (this.currentCropper) {
            this.currentCropper.destroy();
            this.currentCropper = null;
        }
        
        document.getElementById('crop-modal').style.display = 'none';
        document.getElementById('crop-image').src = '';
    }
    
    resetState() {
        // 关闭弹窗（如果打开）
        this.closeCropModal();
        
        // 重置状态
        this.currentCropper = null;
        this.currentFile = null;
        this.filesQueue = [];
        this.processingIndex = 0;
        this.canvasList = [];
        
        // 清空文件输入
        document.getElementById('file-input').value = '';
        
        // 隐藏返回按钮和Canvas容器
        document.getElementById('back-btn').style.display = 'none';
        document.getElementById('canvas-container').style.display = 'none';
        
        // 显示上传区域
        document.getElementById('upload-section').style.display = 'block';
        
        // 清空Canvas列表
        document.getElementById('canvas-list').innerHTML = '';
        document.getElementById('batch-download-btn').style.display = 'none';
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new AvatarGenerator();
});