<template>
    <div class="a-view">
        <div class="from">
            <div class="lable">
                <span>屏幕方向：</span>
                <el-radio :label="1" v-model="viewer">横屏</el-radio>
                <el-radio :label="2" v-model="viewer">竖屏</el-radio>
            </div>

            <div class="lable">
                <span>背景颜色：</span>
                <div class="color-list">
                    <button
                        v-for="c in colors"
                        :key="c"
                        class="color-btn"
                        :style="{ backgroundColor: c }"
                        :aria-label="c"
                        :class="{ active: c === color }"
                        @click="setColor(c)"></button>
                </div>
            </div>
        </div>
        <div class="lable">
            <span>文件信息：</span>
            <span>{{file.name}}</span>
            &nbsp&nbsp
            <span>{{fileSize}}</span>
            <span v-if="file.fps">&nbsp&nbsp帧率：{{file.fps}}</span>
            <span v-if="file.width && file.height">&nbsp&nbsp尺寸：{{file.width}}*{{file.height}}</span>
        </div>

        <div :class="['viewer-box', { 'is-mobile': viewer === 2 }]">
            <div class="viewer-screen" :style="{ backgroundColor: color }">
                <div
                    class="viewer"
                    id="demoCanvas"
                    ref="viewer"></div>
            </div>

            <el-upload
                v-if="animationShow === false"
                class="viewer-upload"
                drag
                action=""
                :multiple="false"
                :show-file-list="false"
                :before-upload="handleBeforeUpload">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">
                    将文件拖到此处，或<em>点击上传</em>
                </div>
            </el-upload>
        </div>
    </div>
</template>

<script>
// 播放容器尺寸：基于文件尺寸，最大宽度 1500，等比缩放；同步设置父容器 viewer-screen 高度
function setContainerSize(container, w, h) {
    const maxW = 1500;
    if (!w || !h) { w = 200; h = 200; }
    const width = Math.min(w, maxW);
    const height = Math.round(h * (width / w));
    container.style.width = width + 'px';
    container.style.height = height + 'px';
    const parent = container.parentElement;
    if (parent && parent.classList.contains('viewer-screen')) {
        parent.style.height = height + 'px';
    }
}

class Player {
    constructor(file, container) {
        this.data = '';
        this.container = container;
        this.player = null;
    }
    load() {}
    init() {}
    create() {}
    destroy() {}
    changeSize() {}
}

class SvgaPlayer extends Player {
    constructor(file, container, onMeta) {
        super(file, container);
        this.onMeta = onMeta;
        this.url = null;
        this.init(file);
    }

    load(file) {
        return new Promise((resolve) => {
            // 预先生成 Blob URL，作为 load 的主要输入
            try { this.url = URL.createObjectURL(file); } catch (e) { this.url = null; }
            // 同时读取 ArrayBuffer，作为备用
            const reader = new FileReader();
            reader.onload = (evt) => {
                this.data = evt.target.result; // ArrayBuffer
                resolve(this.data);
            };
            reader.readAsArrayBuffer(file);
        });
    }

    init(file) {
        this.load(file).then(() => {
            this.create();
        });
    }

    create() {
        this.player = new SVGA.Player(this.container);
        const parser = new SVGA.Parser();
        const source = this.url || this.data; // 优先用 Blob URL，兼容 2.3.1
        parser.load(source, (videoItem) => {
            this.player.setVideoItem(videoItem);
            const sz = videoItem.videoSize || {};
            const fps = videoItem.FPS || videoItem.fps;

            setContainerSize(this.container, sz.width, sz.height);

            if (typeof this.onMeta === 'function') {
                this.onMeta({
                    type: 'svga',
                    fps,
                    width: sz.width,
                    height: sz.height
                });
            }
            this.player.startAnimation();
        });
    }

    destroy() {
        if (this.player) {
            this.player.stopAnimation();
            Array.from(this.container.children).forEach(el => el.remove());
        }
        if (this.url) {
            try { URL.revokeObjectURL(this.url); } catch (e) {}
            this.url = null;
        }
    }

    changeSize() {
        this.destroy();
        this.create();
    }
}

class LottiePlayer extends Player {
    constructor(file, container) {
        super(file, container);
        this.data = {};
        this.init(file);
    }

    load(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = evt => {
                this.data = JSON.parse(evt.target.result);
                resolve(this.data);
            };
            reader.readAsText(file);
        });
    }

    init(file) {
        this.load(file).then(() => {
            this.create();
        });
    }

    create() {
        const w = this.data.w || this.data.width;
        const h = this.data.h || this.data.height;
        setContainerSize(this.container, w, h);

        this.player = lottie.loadAnimation({
            container: this.container,
            renderer: 'canvas',
            loop: true,
            autoplay: true,
            animationData: this.data,
        });
    }

    destroy() {
        if (this.player) {
            this.player.stop();
            this.player.destroy();
        }
    }

    changeSize() {
        this.destroy();
        this.create();
    }
}

export default {
    name: 'Aview',
    data() {
        return {
            color: '#ffffff',
            fromShow: false,
            viewer: 1,
            $player: null,
            animationShow: false,
            file: {
                fps: null,
                width: null,
                height: null
            },
            colors: ['#000000', '#ffffff', '#00ff00', '#C0392B', '#F1C40D', '#00b4ff']
        };
    },
    mounted() {
        // 在播放区域继续拖入文件替换播放
        const screen = this.$el.querySelector('.viewer-screen');
        if (screen) {
            const onDragOver = (e) => { e.preventDefault(); };
            const onDrop = (e) => {
                e.preventDefault();
                const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
                if (f) { this.handleBeforeUpload(f); }
            };
            screen.addEventListener('dragover', onDragOver);
            screen.addEventListener('drop', onDrop);
            this._cleanupDragDrop = () => {
                screen.removeEventListener('dragover', onDragOver);
                screen.removeEventListener('drop', onDrop);
            };
        }
    },
    computed: {
        fileSize() {
            if (this.file.size) {
                return Math.ceil(this.file.size / 1024) + 'kb'
            }
            return ''
        },
    },
    methods: {
        setColor(c) { this.color = c; },

        updateSvgaMeta(meta) {
            this.file.fps = meta.fps || null;
            this.file.width = meta.width || null;
            this.file.height = meta.height || null;
        },
        handleBeforeUpload(file) {
            const name = (file && file.name) ? file.name : '';
            const dom = this.$refs.viewer

            console.log('[UPLOAD] receive file:', name, 'size=', file && file.size);

            this.file.name = file.name
            this.$set(this.file, 'size', file.size)

            if (this.$player) {
                this.$player.destroy();
                this.animationShow = false;
            }
            if (/\.svga$/i.test(name)) {
                console.log('[SVGA] start load');
                window.player = this.$player = new SvgaPlayer(file, dom, (meta) => {
                    console.log('[SVGA] meta:', meta);
                    this.updateSvgaMeta(meta)
                })
                this.animationShow = true;
            }

            if (/\.json$/i.test(name)) {
                console.log('[LOTTIE] start load');
                window.player = this.$player = new LottiePlayer(file, dom)
                this.file.fps = null;
                this.file.width = null;
                this.file.height = null;
                this.animationShow = true;
            }
            return false
        }
    },
    beforeDestroy() {
        if (this._cleanupDragDrop) this._cleanupDragDrop();
    }
}
</script>

<style scoped>
.viewer-box {
    padding: 12px 0;
    width: 100%;
    height: auto;
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    margin-top: 24px;
    border: 1px dashed #ccc;
}

.viewer-screen {
    width: 100%;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}

/* 新增：颜色按钮样式 */
.color-list {
    display: flex;
    gap: 8px;
    align-items: center;
}
.color-btn {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: 1px solid #ddd;
    cursor: pointer;
    padding: 0;
}
.color-btn.active {
    outline: 2px solid #409EFF;
    outline-offset: 2px;
}

.is-mobile {
    background: #333;
}

.is-mobile>.viewer-screen {
    width: 375px;
    height: auto;
    top: 0px;
}

.viewer-upload {
    position: absolute;
    width: 100%;
    height: 100%;
}

.input {
    width: 100px;
}

.from {
    display: flex;
    height: 40px;
}

.lable {
    margin-right: 12px;
    display: flex;
    align-items: center;
}

.lable::after {
    content: "";
    display: block;
    height: 50%;
    border-left: 1px solid #ccc;
    margin-left: 12px;
}
</style>

<style>
.el-radio {
    margin-right: 12px;
}

.el-input__suffix {
    line-height: 28px;
}

.el-upload {
    width: 100%;
    height: 100%;
}

.el-upload-dragger {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    background-color: transparent;
}

.el-upload-dragger .el-icon-upload {
    margin-top: 0px;
}
</style>
