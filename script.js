// Windows 95 Desktop Functionality
class Win95Desktop {
    constructor() {
        this.activeWindow = null;
        this.zIndex = 10;
        this.init();
    }

    init() {
        this.setupDesktopIcons();
        this.setupWindowControls();
        this.setupStartButton();
        this.setupClock();
        this.setupDragAndDrop();
    }

    setupDesktopIcons() {
        const icons = document.querySelectorAll('.desktop-icon');
        icons.forEach(icon => {
            icon.addEventListener('dblclick', (e) => {
                const windowId = icon.dataset.window;
                this.openWindow(windowId);
            });
            
            // Single click to select
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.selectIcon(icon);
            });
        });

        // Deselect icons when clicking on desktop
        document.querySelector('.desktop').addEventListener('click', () => {
            this.deselectAllIcons();
        });
    }

    selectIcon(icon) {
        this.deselectAllIcons();
        icon.style.background = 'rgba(0, 0, 128, 0.3)';
        icon.style.color = 'white';
    }

    deselectAllIcons() {
        const icons = document.querySelectorAll('.desktop-icon');
        icons.forEach(icon => {
            icon.style.background = 'transparent';
            icon.style.color = 'white';
        });
    }

    openWindow(windowId) {
        const window = document.getElementById(windowId);
        if (window) {
            window.style.display = 'block';
            window.style.zIndex = ++this.zIndex;
            this.activeWindow = window;
            this.addToTaskbar(windowId);
            
            // Special handling for trading calendar
            if (windowId === 'trading-calendar') {
                this.loadTradingCalendar();
            }
        }
    }

    loadTradingCalendar() {
        const loadingContainer = document.getElementById('trading-loading');
        const iframe = document.getElementById('trading-iframe');
        
        // Show loading animation
        loadingContainer.style.display = 'flex';
        iframe.style.display = 'none';
        
        // Simulate loading time with cool animation
        setTimeout(() => {
            iframe.src = '/laohuangli/index.html';
            
            // Wait for iframe to load
            iframe.onload = () => {
                setTimeout(() => {
                    loadingContainer.style.display = 'none';
                    iframe.style.display = 'block';
                }, 1000); // Extra delay for dramatic effect
            };
        }, 2000); // Initial loading animation time
    }

    setupWindowControls() {
        const windows = document.querySelectorAll('.window');
        windows.forEach(window => {
            const header = window.querySelector('.window-header');
            const closeBtn = window.querySelector('.close');
            const minimizeBtn = window.querySelector('.minimize');
            const maximizeBtn = window.querySelector('.maximize');

            // Close button
            closeBtn?.addEventListener('click', () => {
                this.closeWindow(window);
            });

            // Minimize button
            minimizeBtn?.addEventListener('click', () => {
                this.minimizeWindow(window);
            });

            // Maximize button (toggle)
            maximizeBtn?.addEventListener('click', () => {
                this.toggleMaximize(window);
            });

            // Bring window to front on click
            window.addEventListener('mousedown', () => {
                window.style.zIndex = ++this.zIndex;
                this.activeWindow = window;
            });
        });
    }

    closeWindow(window) {
        window.style.display = 'none';
        this.removeFromTaskbar(window.id);
        if (this.activeWindow === window) {
            this.activeWindow = null;
        }
    }

    minimizeWindow(window) {
        window.style.display = 'none';
        // Keep in taskbar for restore
    }

    toggleMaximize(window) {
        if (window.dataset.maximized === 'true') {
            // Restore
            window.style.width = window.dataset.originalWidth || '400px';
            window.style.height = window.dataset.originalHeight || '300px';
            window.style.left = window.dataset.originalLeft || '100px';
            window.style.top = window.dataset.originalTop || '100px';
            window.dataset.maximized = 'false';
        } else {
            // Maximize
            window.dataset.originalWidth = window.style.width || window.offsetWidth + 'px';
            window.dataset.originalHeight = window.style.height || window.offsetHeight + 'px';
            window.dataset.originalLeft = window.style.left || window.offsetLeft + 'px';
            window.dataset.originalTop = window.style.top || window.offsetTop + 'px';
            
            window.style.width = 'calc(100vw - 20px)';
            window.style.height = 'calc(100vh - 60px)';
            window.style.left = '10px';
            window.style.top = '10px';
            window.dataset.maximized = 'true';
        }
    }

    addToTaskbar(windowId) {
        const taskbarPrograms = document.getElementById('taskbar-programs');
        const existing = document.getElementById(`taskbar-${windowId}`);
        
        if (!existing) {
            const button = document.createElement('button');
            button.id = `taskbar-${windowId}`;
            button.className = 'taskbar-program';
            button.textContent = this.getWindowTitle(windowId);
            button.style.cssText = `
                background: #c0c0c0;
                border: 2px solid;
                border-color: #dfdfdf #808080 #808080 #dfdfdf;
                padding: 2px 8px;
                margin-right: 2px;
                font-family: 'MS Sans Serif', sans-serif;
                font-size: 11px;
                cursor: pointer;
                height: 22px;
            `;
            
            button.addEventListener('click', () => {
                const window = document.getElementById(windowId);
                if (window.style.display === 'none') {
                    window.style.display = 'block';
                    window.style.zIndex = ++this.zIndex;
                } else {
                    this.minimizeWindow(window);
                }
            });
            
            taskbarPrograms.appendChild(button);
        }
    }

    removeFromTaskbar(windowId) {
        const taskbarButton = document.getElementById(`taskbar-${windowId}`);
        if (taskbarButton) {
            taskbarButton.remove();
        }
    }

    getWindowTitle(windowId) {
        const titles = {
            'my-computer': 'My Computer',
            'about-me': 'About Me.txt',
            'projects': 'Projects',
            'contact': 'Contact',
            'trading-calendar': '交易老黄历'
        };
        return titles[windowId] || windowId;
    }

    setupStartButton() {
        const startBtn = document.getElementById('start-btn');
        const startMenu = document.getElementById('start-menu');
        
        startBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = startMenu.style.display === 'block';
            startMenu.style.display = isVisible ? 'none' : 'block';
        });

        // Close start menu when clicking elsewhere
        document.addEventListener('click', (e) => {
            if (!startMenu.contains(e.target) && e.target !== startBtn) {
                startMenu.style.display = 'none';
            }
        });

        // Start menu item interactions
        const menuItems = startMenu.querySelectorAll('.start-menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                startMenu.style.display = 'none';
                // Add functionality for menu items here if needed
            });
        });
    }

    setupClock() {
        const timeElement = document.getElementById('current-time');
        
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });
            timeElement.textContent = timeString;
        };

        updateTime();
        setInterval(updateTime, 1000);
    }

    setupDragAndDrop() {
        let isDragging = false;
        let currentWindow = null;
        let offset = { x: 0, y: 0 };

        const windows = document.querySelectorAll('.window');
        windows.forEach(window => {
            const header = window.querySelector('.window-header');
            
            header.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('control-button')) return;
                
                isDragging = true;
                currentWindow = window;
                
                const rect = window.getBoundingClientRect();
                offset.x = e.clientX - rect.left;
                offset.y = e.clientY - rect.top;
                
                header.style.cursor = 'grabbing';
                window.style.zIndex = ++this.zIndex;
                this.activeWindow = window;
                
                e.preventDefault();
            });
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging || !currentWindow) return;
            
            const x = e.clientX - offset.x;
            const y = e.clientY - offset.y;
            
            // Constrain to viewport
            const maxX = window.innerWidth - 100;
            const maxY = window.innerHeight - 100;
            
            currentWindow.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
            currentWindow.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging && currentWindow) {
                const header = currentWindow.querySelector('.window-header');
                header.style.cursor = 'move';
            }
            isDragging = false;
            currentWindow = null;
        });
    }
}

// Startup sound and effects
class Win95Effects {
    constructor() {
        this.init();
    }

    init() {
        this.addStartupEffect();
        this.addSoundEffects();
    }

    addStartupEffect() {
        // Ensure body is visible immediately for debugging
        document.body.style.opacity = '1';
        document.body.style.transition = 'none';
        
        // Optional: Add subtle animation later if needed
        // document.body.style.transition = 'opacity 1s ease-in';
    }

    addSoundEffects() {
        // Add click sounds to buttons (visual feedback only, no actual sound)
        const buttons = document.querySelectorAll('button, .desktop-icon, .file-item, .start-menu-item');
        
        buttons.forEach(button => {
            button.addEventListener('mousedown', () => {
                button.style.transform = 'scale(0.98)';
            });
            
            button.addEventListener('mouseup', () => {
                button.style.transform = 'scale(1)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'scale(1)';
            });
        });
    }
}

// Boot screen simulation
function showBootScreen() {
    const bootScreen = document.createElement('div');
    bootScreen.innerHTML = `
        <div style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: #000;
            color: #fff;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            padding: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        ">
            <div style="text-align: center; max-width: 600px;">
                <h1 style="color: #fff; margin-bottom: 20px; font-size: 24px;">Microsoft Windows 95</h1>
                <div style="margin: 20px 0;">Starting Windows 95...</div>
                <div style="width: 300px; height: 20px; border: 2px inset #c0c0c0; background: #c0c0c0; margin: 20px auto;">
                    <div id="progress-bar" style="height: 100%; background: #000080; width: 0%; transition: width 0.5s;"></div>
                </div>
                <div style="margin-top: 20px; font-size: 12px; color: #c0c0c0;">
                    Welcome to Midas's Digital Space
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(bootScreen);
    
    // Progress bar animation
    const progressBar = document.getElementById('progress-bar');
    let progress = 0;
    
    const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                bootScreen.remove();
            }, 500);
        }
        progressBar.style.width = progress + '%';
    }, 200);
}

// Initialize everything (simplified for debugging)
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing desktop...');
    
    // Simplified initialization - only basic functionality
    new Win95Desktop();
    
    // Disable effects temporarily
    // new Win95Effects();
    
    // Ensure icons are visible
    const icons = document.querySelectorAll('.desktop-icon');
    icons.forEach((icon, index) => {
        icon.style.display = 'block';
        icon.style.visibility = 'visible';
        icon.style.opacity = '1';
        console.log(`Icon ${index + 1}: ${icon.querySelector('.icon-label').textContent}`);
    });
});

// Easter eggs and hidden features (temporarily disabled for debugging)
document.addEventListener('keydown', (e) => {
    // Temporarily disabled: Ctrl+Alt+D to toggle desktop icons
    /*
    if (e.ctrlKey && e.altKey && e.key === 'd') {
        const icons = document.querySelectorAll('.desktop-icon');
        const isVisible = icons[0].style.display !== 'none';
        icons.forEach(icon => {
            icon.style.display = isVisible ? 'none' : 'block';
        });
    }
    */
    
    // F11 for fake fullscreen
    if (e.key === 'F11') {
        e.preventDefault();
        document.body.classList.toggle('fullscreen');
    }
});

// Add some retro cursor effects
document.addEventListener('mousemove', (e) => {
    // Optional: Add cursor trail effect for extra retro feel
    // Implementation would go here
});