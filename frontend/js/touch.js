
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
            //original_x = (element.getBoundingClientRect().x - container.x) / scale;
            //original_y = (element.getBoundingClientRect().y - container.y) / scale;
            original_x = parseFloat(element.style.left);
            original_y = parseFloat(element.style.top);
            original_mouse_x = x;
            original_mouse_y = y;
            origin_rotate = getCurrentRotation(element);
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResize);
        }

        function resize(e) {
            let scale = self.$.mainContentWrapper.scale;
            let rad2deg = 180/Math.PI;
            let deg2rad = Math.PI/180;

            const x = e.pageX;
            const y = e.pageY;


            const xDiff = (x - original_mouse_x) / scale;
            const yDiff = (y - original_mouse_y) / scale;

            let g = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
            let sign = 1;
            if (yDiff < 0) sign = -1;
            let a = Math.acos(xDiff / g) * rad2deg * sign;
            let wDiff = Math.cos((a - origin_rotate) * deg2rad) * g;
            let hDiff = Math.sin((a - origin_rotate) * deg2rad) * g;

            if (currentResizer.classList.contains('bottom-right')) {

                const width = original_width + wDiff;
                const height = original_height + hDiff;

                // TODO add check to min wigth and height
                element.style.width = width + 'px';
                element.style.height = height + 'px';
                const correction = getRotateCorrection(original_width, original_height, wDiff, hDiff, origin_rotate);
                element.style.left = original_x - correction.left + 'px';
                element.style.top = original_y + correction.top + 'px';
            }
            else if (currentResizer.classList.contains('bottom-left')) {
                const height = original_height + hDiff;
                const width = original_width - wDiff;

                const correction = getRotateCorrection(original_width, original_height, wDiff, hDiff, origin_rotate);

                element.style.height = height + 'px';
                element.style.width = width + 'px';

                element.style.top = original_y + correction.top + 'px';
                element.style.left = original_x + wDiff - correction.left + 'px';
            }
            else if (currentResizer.classList.contains('top-right')) {
                const width = original_width + wDiff;
                const height = original_height - hDiff;

                const correction = getRotateCorrection(original_width, original_height, wDiff, hDiff, origin_rotate);

                element.style.width = width + 'px';
                element.style.height = height + 'px';
                element.style.left = original_x - correction.left + 'px';
                element.style.top = original_y + hDiff + correction.top + 'px';
            }
            else if (currentResizer.classList.contains('rotate')) {

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
                //self.rotateInfo = `origin: ${origin_rotate} | deg: ${deg}` /*+ `| xDiff ${xDiff} | yDiff ${yDiff} | to center x ${toCenterX} | to center y ${toCenterY}`*/;
            }
            else {
                const width = original_width - wDiff;
                const height = original_height - hDiff;

                const correction = getRotateCorrection(original_width, original_height, wDiff, hDiff, origin_rotate);

                element.style.width = width + 'px';
                element.style.height = height + 'px';

                element.style.left = original_x + wDiff - correction.left + 'px';
                element.style.top = original_y + hDiff + correction.top + 'px';
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

function getRotateCorrection(init_w, init_h, delta_w, delta_h, angle){
    //Convert angle from degrees to radians
    angle = angle * Math.PI / 180;

    //Get position after rotation with original size
    let x = -init_w/2;
    let y = init_h/2;
    let new_x = y * Math.sin(angle) + x * Math.cos(angle);
    let new_y = y * Math.cos(angle) - x * Math.sin(angle);
    let diff1 = {left: new_x - x, top: new_y - y};

    let new_width = init_w + delta_w;
    let new_height = init_h + delta_h;

    //Get position after rotation with new size
    x = -new_width/2;
    y = new_height/2;
    new_x = y * Math.sin(angle) + x * Math.cos(angle);
    new_y = y * Math.cos(angle) - x * Math.sin(angle);
    let diff2 = {left: new_x - x, top: new_y - y};

    //Get the difference between the two positions
    let offset = {left: diff2.left - diff1.left, top: diff2.top - diff1.top};
    return offset;
}

window.getCurrentRotation = getCurrentRotation;
window.getRotateCorrection = getRotateCorrection;
window.makeResizableDiv = makeResizableDiv;
