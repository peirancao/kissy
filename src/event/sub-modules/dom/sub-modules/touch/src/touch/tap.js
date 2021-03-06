/**
 * @ignore
 * gesture tap
 * @author yiminghe@gmail.com
 */
KISSY.add(function (S, require) {
    var eventHandleMap = require('./handle-map');
    var DomEvent = require('event/dom/base');
    var SingleTouch = require('./single-touch');

    function preventDefault(e) {
        e.preventDefault();
    }

    var sensitivity = 5;
    var event = 'tap';
    var DomEventObject = DomEvent.Object;

    function Tap() {
        Tap.superclass.constructor.apply(this, arguments);
    }

    S.extend(Tap, SingleTouch, {
        onTouchMove: function (e) {
            var firstTouchXY = this.lastXY;
            var currentTouch = e.changedTouches[0];
            // some sensitivity
            // android browser will trigger touchmove event finger is not moved ...
            // ie10 will has no touch when mouse
            if (!currentTouch ||
                Math.abs(currentTouch.pageX - firstTouchXY.pageX) > sensitivity ||
                Math.abs(currentTouch.pageY - firstTouchXY.pageY) > sensitivity) {
                return false;
            }
            return undefined;
        },

        onTouchEnd: function (e) {
            var touch = e.changedTouches[0];
            var target = e.target;
            var eventObject = new DomEventObject({
                type: event,
                target: target,
                currentTarget: target
            });
            S.mix(eventObject, {
                pageX: touch.pageX,
                pageY: touch.pageY,
                // call e.preventDefault on tap event to prevent tap penetration
                originalEvent: e.originalEvent,
                which: 1,
                touch: touch
            });
            DomEvent.fire(target, event, eventObject);
            if (eventObject.isDefaultPrevented()) {
                DomEvent.on(target, 'click', {
                    fn: preventDefault,
                    once: 1
                });
            }
        }
    });

    eventHandleMap[event] = {
        handle: new Tap()
    };

    return Tap;
});
/**
 * @ignore
 *
 * yiminghe@gmail.com 2012-10-31
 *
 * 页面改动必须先用桌面 chrome 刷新下，再用 ios 刷新，否则很可能不生效??
 *
 * why to implement tap:
 * 1.   click 造成 clickable element 有 -webkit-tap-highlight-color 其内不能选择文字
 * 2.   touchstart touchdown 时间间隔非常短不会触发 click (touchstart)
 * 3.   click 在touchmove 到其他地方后仍然会触发（如果没有组织touchmove默认行为导致的屏幕移动）
 *
 * tap:
 * 1.   长按可以选择文字，
 *      可以选择阻止 document 的 touchstart 来阻止整个程序的文字选择功能:
 *      同时阻止了touch 的 mouse/click 相关事件触发
 * 2.   反应更灵敏
 *
 * https://developers.google.com/mobile/articles/fast_buttons
 */