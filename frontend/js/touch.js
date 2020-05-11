
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
    let origin_rotate = 0;
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
            origin_rotate = getCurrentRotation(element);
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
            else if (currentResizer.classList.contains('rotate')) {
                let rad2deg = 180/Math.PI;
                let deg2rad = Math.PI/180;

                const toCenter = ((original_height) / 2 + 30) * scale /* 30 - height rotateLine */;
                const toCenterX = Math.sin((origin_rotate) * deg2rad) * toCenter;
                const centerX = original_mouse_x - toCenterX;
                const toCenterY = Math.cos((origin_rotate) * deg2rad) * toCenter;
                const centerY = original_mouse_y + toCenterY;
                self.$.rotateCenter.style.display = 'block';
                self.rotateCenterX = centerX;
                self.rotateCenterY = centerY;

                const xDiff = x - centerX;
                const yDiff = centerY - y;

                let radians = Math.atan2(xDiff, yDiff);
                const deg = radians * rad2deg;
                element.style.transform = `rotate(${deg}deg)`;
                //self.rotateInfo = `origin: ${origin_rotate} | def: ${deg} | xDiff ${xDiff} | yDiff ${yDiff} | to center x ${toCenterX} | to center y ${toCenterY}`;
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
            self.$.rotateCenter.style.display = 'none';
            window.removeEventListener('mousemove', resize)
        }
    }
}

function getCurrentRotation(el) {
    var st = window.getComputedStyle(el, null);
    var tm = st.getPropertyValue("transform") || "none";
    if (tm !== "none") {
        var values = tm.split('(')[1].split(')')[0].split(',');
        var angle = Math.round(Math.atan2(values[1],values[0]) * (180/Math.PI));
        return (angle < 0 ? angle + 360 : angle);
    }
    return 0;
}

window.makeResizableDiv = makeResizableDiv;
