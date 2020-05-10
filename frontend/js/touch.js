
function makeResizableDiv(self, div, resizeCallback) {
    const element = self.shadowRoot.querySelector(div);
    const resizedElements = self.resizedElements || {};
    if (element == null || resizedElements[element.id]) {
        return;
    }
    const resizers = self.shadowRoot.querySelectorAll('#' + element.id + ' .resizer');
    console.info('start to be resizable', element);
    resizedElements[element.id] = true;

    const minimum_size = 20;
    let original_width = 0;
    let original_height = 0;
    let original_x = 0;
    let original_y = 0;
    let original_mouse_x = 0;
    let original_mouse_y = 0;
    for (let i = 0;i < resizers.length; i++) {
        const currentResizer = resizers[i];
        currentResizer.addEventListener('mousedown', mouseDown);

        function mouseDown(e) {
            let scale = self.$.mainContentWrapper.scale;
            const x = e.pageX;
            const y = e.pageY;
            e.preventDefault();
            original_width = parseFloat(getComputedStyle(element, null).getPropertyValue('width').replace('px', ''));
            original_height = parseFloat(getComputedStyle(element, null).getPropertyValue('height').replace('px', ''));
            //original_x = element.getBoundingClientRect().left;
            //original_y = element.getBoundingClientRect().top;
            let container = self.$.mainContent.getBoundingClientRect();
            original_x = (element.getBoundingClientRect().x - container.x) / scale;
            original_y = (element.getBoundingClientRect().y - container.y) / scale;
            original_mouse_x = x;
            original_mouse_y = y;
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResize);
        }

        function resize(e) {
            let scale = self.$.mainContentWrapper.scale;

            const x = e.pageX;
            const y = e.pageY;

            if (currentResizer.classList.contains('bottom-right')) {
                const width = original_width + (x - original_mouse_x) / scale;
                const height = original_height + (y - original_mouse_y) / scale;
                if (width > minimum_size) {
                    element.style.width = width + 'px'
                }
                if (height > minimum_size) {
                    element.style.height = height + 'px'
                }
            }
            else if (currentResizer.classList.contains('bottom-left')) {
                const height = original_height + (y - original_mouse_y) / scale;
                const width = original_width - (x - original_mouse_x) / scale;
                if (height > minimum_size) {
                    element.style.height = height + 'px';
                }
                if (width > minimum_size) {
                    element.style.width = width + 'px';
                    element.style.left = original_x + (x - original_mouse_x) / scale + 'px';
                }
            }
            else if (currentResizer.classList.contains('top-right')) {
                const width = original_width + (x - original_mouse_x) / scale;
                const height = original_height - (y - original_mouse_y) / scale;
                if (width > minimum_size) {
                    element.style.width = width + 'px';
                }
                if (height > minimum_size) {
                    element.style.height = height + 'px';
                    element.style.top = original_y + (y - original_mouse_y) / scale + 'px';
                }
            }
            else {
                const width = original_width - (x - original_mouse_x) / scale;
                const height = original_height - (y - original_mouse_y) / scale;
                if (width > minimum_size) {
                    element.style.width = width + 'px';
                    element.style.left = original_x + (x - original_mouse_x) / scale + 'px';
                }
                if (height > minimum_size) {
                    element.style.height = height + 'px';
                    element.style.top = original_y + (y - original_mouse_y) / scale + 'px';
                }
            }
            if (resizeCallback) {
                resizeCallback(element);
            }
        }

        function stopResize() {
            window.removeEventListener('mousemove', resize)
        }
    }
}

window.makeResizableDiv = makeResizableDiv;
