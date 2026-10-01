// ============ 3D WIREFRAME CYBORG HEAD ============
class CyborgHead {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.offsetWidth;
        this.height = this.canvas.offsetHeight;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        this.scale = Math.min(this.width, this.height) * 0.35;
        this.time = 0;
        this.vertices = [];
        this.edges = [];
        this.initGeometry();
        this.animate();
    }

    initGeometry() {
        // Head wireframe - polygon points
        const headVertices = [];
        
        // Front face
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            headVertices.push({
                x: Math.cos(angle) * 0.4,
                y: Math.sin(angle) * 0.5,
                z: 0.3
            });
        }

        // Back face
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            headVertices.push({
                x: Math.cos(angle) * 0.35,
                y: Math.sin(angle) * 0.45,
                z: -0.3
            });
        }

        // Chin
        headVertices.push({ x: 0, y: 0.6, z: 0 });
        headVertices.push({ x: 0, y: 0.55, z: -0.2 });

        this.vertices = headVertices.map((v, i) => ({ ...v, id: i }));

        // Define edges (which vertices connect)
        this.edges = [
            // Front ring
            [0,1], [1,2], [2,3], [3,4], [4,5], [5,6], [6,7], [7,0],
            // Back ring
            [8,9], [9,10], [10,11], [11,12], [12,13], [13,14], [14,15], [15,8],
            // Connect front to back
            [0,8], [1,9], [2,10], [3,11], [4,12], [5,13], [6,14], [7,15],
            // Chin connections
            [4,16], [12,16], [16,17], [17,4], [17,12]
        ];
    }

    rotateVertex(v, rotX, rotY) {
        let x = v.x;
        let y = v.y;
        let z = v.z;

        // Rotate Y
        let cosY = Math.cos(rotY);
        let sinY = Math.sin(rotY);
        let x1 = x * cosY - z * sinY;
        let z1 = x * sinY + z * cosY;

        // Rotate X
        let cosX = Math.cos(rotX);
        let sinX = Math.sin(rotX);
        let y1 = y * cosX - z1 * sinX;
        let z2 = y * sinX + z1 * cosX;

        return { x: x1, y: y1, z: z2 };
    }

    project(v) {
        const scale = 1 / (1 + v.z * 0.5);
        return {
            x: this.centerX + v.x * this.scale * scale,
            y: this.centerY + v.y * this.scale * scale,
            z: v.z,
            depth: scale
        };
    }

    animate() {
        const draw = () => {
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;

            // Clear
            this.ctx.fillStyle = 'rgba(10, 15, 27, 0.1)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Rotation
            const rotX = Math.sin(this.time * 0.003) * 0.3;
            const rotY = this.time * 0.002;

            // Transform vertices
            const projectedVertices = this.vertices.map(v => {
                const rotated = this.rotateVertex(v, rotX, rotY);
                return this.project(rotated);
            });

            // Draw edges
            this.edges.forEach(edge => {
                const v1 = projectedVertices[edge[0]];
                const v2 = projectedVertices[edge[1]];

                // Depth-based color
                const avgDepth = (v1.depth + v2.depth) / 2;
                const alpha = Math.max(0.2, avgDepth * 0.6);
                
                this.ctx.strokeStyle = `rgba(100, 180, 255, ${alpha})`;
                this.ctx.lineWidth = 1.5;
                this.ctx.beginPath();
                this.ctx.moveTo(v1.x, v1.y);
                this.ctx.lineTo(v2.x, v2.y);
                this.ctx.stroke();
            });

            // Draw vertices
            projectedVertices.forEach(v => {
                const size = 2 * v.depth;
                this.ctx.fillStyle = `rgba(100, 180, 255, ${0.4 + v.depth * 0.4})`;
                this.ctx.beginPath();
                this.ctx.arc(v.x, v.y, size, 0, Math.PI * 2);
                this.ctx.fill();
            });

            this.time++;
            requestAnimationFrame(() => this.animate());
        };
        draw();
    }
}

// ============ CCTV STREAMER ============
class CCTVStreamer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.currentCam = 0;
        this.cameras = ['ENTRY', 'OFFICE', 'STORAGE', 'SERVER'];
        this.scanlinePos = 0;
        this.animate();
    }

    setCamera(index) {
        this.currentCam = index;
    }

    animate() {
        const draw = () => {
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;

            // Background
            this.ctx.fillStyle = '#0a0f1b';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Grid pattern
            this.ctx.strokeStyle = 'rgba(100, 180, 255, 0.08)';
            this.ctx.lineWidth = 0.5;

            for (let i = 0; i < this.canvas.width; i += 15) {
                this.ctx.beginPath();
                this.ctx.moveTo(i, 0);
                this.ctx.lineTo(i, this.canvas.height);
                this.ctx.stroke();
            }

            for (let i = 0; i < this.canvas.height; i += 15) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, i);
                this.ctx.lineTo(this.canvas.width, i);
                this.ctx.stroke();
            }

            // Animated particles
            for (let i = 0; i < 20; i++) {
                const x = Math.sin(this.scanlinePos * 0.05 + i) * (this.canvas.width / 2) + this.canvas.width / 2;
                const y = Math.cos(this.scanlinePos * 0.03 + i) * (this.canvas.height / 2) + this.canvas.height / 2;
                const alpha = 0.3 + Math.sin(this.scanlinePos * 0.01 + i) * 0.2;

                this.ctx.fillStyle = `rgba(100, 180, 255, ${alpha})`;
                this.ctx.fillRect(x - 1, y - 1, 2, 2);
            }

            // Scanline effect
            this.ctx.fillStyle = 'rgba(100, 180, 255, 0.03)';
            this.ctx.fillRect(0, (this.scanlinePos % this.canvas.height), this.canvas.width, 2);

            // Info text
            this.ctx.fillStyle = 'rgba(100, 180, 255, 0.6)';
            this.ctx.font = '10px Courier New';
            this.ctx.fillText(`CAM_${this.currentCam + 1} - ${this.cameras[this.currentCam]}`, 6, 12);
            
            const time = new Date().toLocaleTimeString('de-DE');
            this.ctx.fillText(time, this.canvas.width - 65, 12);

            this.scanlinePos += 2;
            requestAnimationFrame(() => this.animate());
        };
        draw();
    }
}

// ============ DATA MANAGEMENT ============
class Database {
    constructor() {
        this.data = [];
        this.loaded = false;
    }

    async load() {
        try {
            const response = await fetch('data/files.json');
            if (!response.ok) throw new Error('Failed to load database');
            this.data = await response.json();
            this.loaded = true;
        } catch (error) {
            console.error('Database load error:', error);
        }
    }

    search(query) {
        if (!query.trim()) return [];

        const q = query.toLowerCase();
        return this.data.filter(item =>
            item.name.toLowerCase().includes(q) ||
            item.nachname.toLowerCase().includes(q) ||
            item.telefonnummer.includes(q)
        );
    }

    getById(id) {
        return this.data.find(item => item.id === id);
    }
}

// ============ UI MANAGER ============
class UIManager {
    constructor() {
        this.db = new Database();
        this.resultsGrid = document.getElementById('resultsGrid');
        this.searchInput = document.getElementById('searchInput');
        this.modal = document.getElementById('detailModal');
        this.modalHeader = this.modal.querySelector('.modal-header');
        this.modalBody = this.modal.querySelector('.modal-body');
        this.modalClose = this.modal.querySelector('.modal-close');
        this.cctvSelect = document.getElementById('cctvSelect');
        this.cctvStreamer = null;
    }

    async init() {
        await this.db.load();
        this.setupEventListeners();
        this.initCCTV();
        this.renderEmpty();
    }

    setupEventListeners() {
        this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        this.modalClose.addEventListener('click', () => this.closeModal());
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
        this.cctvSelect.addEventListener('change', (e) => {
            if (this.cctvStreamer) {
                this.cctvStreamer.setCamera(parseInt(e.target.value));
            }
        });
    }

    initCCTV() {
        this.cctvStreamer = new CCTVStreamer('cctvCanvas');
    }

    renderEmpty() {
        this.resultsGrid.innerHTML = '<div class="loading">>>> Enter search query...</div>';
    }

    handleSearch(query) {
        if (!this.db.loaded) return;

        if (!query.trim()) {
            this.renderEmpty();
            return;
        }

        const results = this.db.search(query);

        if (results.length === 0) {
            this.resultsGrid.innerHTML = '<div class="loading">>>> No results found</div>';
            return;
        }

        this.renderResults(results);
    }

    renderResults(results) {
        this.resultsGrid.innerHTML = results.map(item => `
            <div class="file-card" onclick="ui.showDetails(${item.id})">
                <div class="file-number">FILE_#${String(item.id).padStart(2, '0')}</div>
                <div class="file-name">${item.name} ${item.nachname}</div>
                <div class="file-info">
                    <div class="file-info-line">
                        <div class="file-info-label">Phone</div>
                        <div class="file-info-value">${item.telefonnummer}</div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    showDetails(id) {
        const item = this.db.getById(id);
        if (!item) return;

        this.modalHeader.innerHTML = `FILE_#${String(id).padStart(2, '0')}`;
        this.modalBody.innerHTML = `
            <div class="modal-item">
                <div class="modal-item-label">Vorname</div>
                <div class="modal-item-value">${item.name}</div>
            </div>
            <div class="modal-item">
                <div class="modal-item-label">Nachname</div>
                <div class="modal-item-value">${item.nachname}</div>
            </div>
            <div class="modal-item">
                <div class="modal-item-label">Telefonnummer</div>
                <div class="modal-item-value">${item.telefonnummer}</div>
            </div>
        `;

        this.modal.classList.add('active');
    }

    closeModal() {
        this.modal.classList.remove('active');
    }
}

// ============ INIT ============
let ui;
window.addEventListener('DOMContentLoaded', () => {
    // Init cyborg head
    new CyborgHead('bgCanvas');

    // Init UI
    ui = new UIManager();
    ui.init();
});

// Handle resize
window.addEventListener('resize', () => {
    const bgCanvas = document.getElementById('bgCanvas');
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
});
