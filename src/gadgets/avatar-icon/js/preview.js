// Avatar图标预览器 - 主脚本

class AvatarPreviewer {
    constructor() {
        this.canvas = document.getElementById('preview-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvasWidth = 500;
        this.canvasHeight = 500;
        
        // 图片数据
        this.imageA = null;
        this.imageB = null;
        this.bodyImage = null;
        this.imageAFileName = '';
        
        // 图片状态
        this.imageAState = { x: 0, y: 0, scale: 1 };
        this.imageBState = { x: 0, y: 0, scale: 1 };
        this.bodyImageState = { x: 0, y: 0, scale: 1 };
        
        // UI状态
        this.currentBodyType = 'none';
        this.currentBgColor = '#F7F7F7';
        this.isDragging = false;
        this.dragTarget = null;
        this.lastX = 0;
        this.lastY = 0;
        
        // 初始化
        this.init();
    }
    
    init() {
        this.setupCanvas();
        this.bindEvents();
        this.drawCanvas();
    }
    
    setupCanvas() {
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
    }
    
    bindEvents() {
        console.log('开始绑定事件');
        
        // 按钮A上传
        const uploadBtnA = document.getElementById('upload-btn-a');
        console.log('upload-btn-a:', uploadBtnA);
        if (uploadBtnA) {
            uploadBtnA.addEventListener('click', () => {
                document.getElementById('file-input-a').click();
            });
            
            // 添加拖放功能
            uploadBtnA.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadBtnA.style.backgroundColor = '#2980b9';
            });
            
            uploadBtnA.addEventListener('dragleave', () => {
                uploadBtnA.style.backgroundColor = '#333333';
            });
            
            uploadBtnA.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadBtnA.style.backgroundColor = '#333333';
                
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
        console.log('file-input-a:', fileInputA);
        if (fileInputA) {
            fileInputA.addEventListener('change', (e) => {
                this.handleFileUpload(e, 'A');
            });
        }
        
        // 按钮B上传
        const uploadBtnB = document.getElementById('upload-btn-b');
        console.log('upload-btn-b:', uploadBtnB);
        if (uploadBtnB) {
            uploadBtnB.addEventListener('click', () => {
                document.getElementById('file-input-b').click();
            });
            
            // 添加拖放功能
            uploadBtnB.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadBtnB.style.backgroundColor = '#2980b9';
            });
            
            uploadBtnB.addEventListener('dragleave', () => {
                uploadBtnB.style.backgroundColor = '#333333';
            });
            
            uploadBtnB.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadBtnB.style.backgroundColor = '#333333';
                
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
        console.log('file-input-b:', fileInputB);
        if (fileInputB) {
            fileInputB.addEventListener('change', (e) => {
                this.handleFileUpload(e, 'B');
            });
        }
        
        // 按钮A恢复
        const resetBtnA = document.getElementById('reset-btn-a');
        console.log('reset-btn-a:', resetBtnA);
        if (resetBtnA) {
            resetBtnA.addEventListener('click', () => {
                this.resetImageA();
            });
        }
        
        // 按钮B恢复
        const resetBtnB = document.getElementById('reset-btn-b');
        console.log('reset-btn-b:', resetBtnB);
        if (resetBtnB) {
            resetBtnB.addEventListener('click', () => {
                this.resetImageB();
            });
        }
        
        // 预览区恢复
        const canvasResetBtn = document.getElementById('canvas-reset-btn');
        console.log('canvas-reset-btn:', canvasResetBtn);
        if (canvasResetBtn) {
            canvasResetBtn.addEventListener('click', () => {
                this.resetCanvas();
            });
        }
        
        // 身体图片选择
        const bodyBtns = document.querySelectorAll('.body-btn');
        console.log('body-btn数量:', bodyBtns.length);
        bodyBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectBodyType(e.target.id.replace('body-', ''));
            });
        });
        
        // 底色选择
        const bgBtns = document.querySelectorAll('.bg-btn');
        console.log('bg-btn数量:', bgBtns.length);
        bgBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectBgColor(e.target.id.replace('bg-', ''));
            });
        });
        
        // 生成图标
        const generateBtn = document.getElementById('generate-btn');
        console.log('generate-btn:', generateBtn);
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                console.log('点击生成图标按钮');
                this.generateIcon();
            });
        } else {
            console.error('找不到generate-btn按钮');
        }
        
        // Canvas鼠标事件
        this.canvas.addEventListener('mousedown', (e) => {
            this.handleMouseDown(e);
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.handleMouseUp();
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.handleMouseUp();
        });
        
        // 滚轮缩放
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.handleWheelZoom(e);
        });
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
                    this.imageA = img;
                    this.imageAFileName = file.name;
                    document.getElementById('reset-btn-a').style.display = 'inline-block';
                } else {
                    this.imageB = img;
                    document.getElementById('reset-btn-b').style.display = 'inline-block';
                }
                this.drawCanvas();
            };
            img.src = event.target.result;
        };
        
        reader.readAsDataURL(file);
    }
    
    resetImageA() {
        this.imageA = null;
        this.imageAFileName = '';
        this.imageAState = { x: 0, y: 0, scale: 1 };
        document.getElementById('reset-btn-a').style.display = 'none';
        this.drawCanvas();
    }
    
    resetImageB() {
        this.imageB = null;
        this.imageBState = { x: 0, y: 0, scale: 1 };
        document.getElementById('reset-btn-b').style.display = 'none';
        this.drawCanvas();
    }
    
    resetCanvas() {
        this.imageAState = { x: 0, y: 0, scale: 1 };
        this.imageBState = { x: 0, y: 0, scale: 1 };
        this.bodyImageState = { x: 0, y: 0, scale: 1 };
        document.getElementById('canvas-reset-btn').style.display = 'none';
        this.drawCanvas();
    }
    
    selectBodyType(type) {
        this.currentBodyType = type;
        
        // 更新按钮状态
        document.querySelectorAll('.body-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`body-${type}`).classList.add('active');
        
        // 加载身体图片
        if (type !== 'none') {
            this.bodyImage = new Image();
            this.bodyImage.crossOrigin = 'anonymous';
            // 使用本地图片
            this.bodyImage.src = `img/${type === 'male' ? 'nan' : 'nv'}.png`;
            this.bodyImage.onload = () => {
                this.drawCanvas();
            };
        } else {
            this.bodyImage = null;
            this.drawCanvas();
        }
    }
    
    selectBgColor(colorType) {
        this.currentBgColor = colorType === 'default' ? '#F7F7F7' : '#FFDAB9';
        
        // 更新按钮状态
        document.querySelectorAll('.bg-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`bg-${colorType}`).classList.add('active');
        
        this.drawCanvas();
    }
    
    drawCanvas() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // 绘制背景
        this.ctx.fillStyle = this.currentBgColor;
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // 绘制底层图片（按钮B）
        if (this.imageB) {
            this.drawImageWithTransform(this.ctx, this.imageB, this.imageBState);
        }
        
        // 绘制身体图片
        if (this.bodyImage) {
            this.drawImageWithTransform(this.ctx, this.bodyImage, this.bodyImageState);
        }
        
        // 绘制顶层图片（按钮A）
        if (this.imageA) {
            this.drawImageWithTransform(this.ctx, this.imageA, this.imageAState);
        }
    }
    
    drawImageWithTransform(ctx, image, state) {
        ctx.save();
        
        // 根据目标canvas的尺寸调整绘制
        const targetWidth = ctx.canvas.width;
        const targetHeight = ctx.canvas.height;
        
        ctx.translate(targetWidth / 2 + state.x * (targetWidth / this.canvasWidth), targetHeight / 2 + state.y * (targetHeight / this.canvasHeight));
        ctx.scale(state.scale, state.scale);
        ctx.drawImage(image, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
        
        ctx.restore();
    }
    
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
        this.isDragging = true;
        
        // 确定拖动目标（优先顶层图片）
        if (this.imageA) {
            this.dragTarget = 'A';
        } else if (this.bodyImage) {
            this.dragTarget = 'body';
        } else if (this.imageB) {
            this.dragTarget = 'B';
        }
    }
    
    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        const deltaX = currentX - this.lastX;
        const deltaY = currentY - this.lastY;
        
        // 更新所有图片的位置（保持对齐）
        this.imageAState.x += deltaX;
        this.imageAState.y += deltaY;
        this.bodyImageState.x += deltaX;
        this.bodyImageState.y += deltaY;
        this.imageBState.x += deltaX;
        this.imageBState.y += deltaY;
        
        this.lastX = currentX;
        this.lastY = currentY;
        
        // 显示恢复按钮
        document.getElementById('canvas-reset-btn').style.display = 'block';
        
        this.drawCanvas();
    }
    
    handleMouseUp() {
        this.isDragging = false;
        this.dragTarget = null;
    }
    
    handleWheelZoom(e) {
        // 检查是否有任何图片
        if (!this.imageA && !this.bodyImage && !this.imageB) return;
        
        const delta = e.deltaY > 0 ? -0.05 : 0.05; // 缩放步进5%
        
        // 更新所有图片的缩放比例（保持对齐）
        this.imageAState.scale = Math.max(0.1, Math.min(5, this.imageAState.scale + delta));
        this.bodyImageState.scale = Math.max(0.1, Math.min(5, this.bodyImageState.scale + delta));
        this.imageBState.scale = Math.max(0.1, Math.min(5, this.imageBState.scale + delta));
        
        // 显示恢复按钮
        document.getElementById('canvas-reset-btn').style.display = 'block';
        
        this.drawCanvas();
    }
    
    generateIcon() {
        console.log('开始生成图标');
        console.log('imageA:', this.imageA);
        console.log('imageAFileName:', this.imageAFileName);
        
        if (!this.imageA) {
            console.log('没有上传按钮A的图片');
            alert('请先上传按钮A的图片');
            return;
        }
        
        // 创建临时canvas用于生成图标
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 198;
        tempCanvas.height = 198;
        const tempCtx = tempCanvas.getContext('2d');
        
        // 绘制背景
        tempCtx.fillStyle = this.currentBgColor;
        tempCtx.fillRect(0, 0, 198, 198);
        
        // 绘制底层图片（按钮B）
        if (this.imageB && this.imageB.complete) {
            this.drawImageWithTransform(tempCtx, this.imageB, this.imageBState);
        }
        
        // 绘制身体图片
        if (this.bodyImage && this.bodyImage.complete) {
            this.drawImageWithTransform(tempCtx, this.bodyImage, this.bodyImageState);
        }
        
        // 绘制顶层图片（按钮A）
        if (this.imageA && this.imageA.complete) {
            this.drawImageWithTransform(tempCtx, this.imageA, this.imageAState);
        }
        
        // 生成文件名
        const baseName = this.imageAFileName.replace(/\.[^/.]+$/, '');
        const fileName = 'btn_' + baseName + '.png';
        
        // 下载图片
        try {
            const dataURL = tempCanvas.toDataURL('image/png');
            console.log('生成的dataURL长度:', dataURL.length);
            
            const link = document.createElement('a');
            link.download = fileName;
            link.href = dataURL;
            
            // 添加到DOM并触发点击
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('图片下载成功');
        } catch (error) {
            console.error('下载图片失败:', error);
            alert('生成图标失败，请重试');
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new AvatarPreviewer();
});