function lowerFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
}

export function bindEvent(_jflowInstance, attrs) {
    Object.keys(attrs).map(key => {
        if(/^on[A-Z]/.test(key)) {
            // TODO 整理固定的 Event
            let func = attrs[key];
            if(Array.isArray(func)) {
                func = func.filter(f => typeof f === 'function')
                const reg = /^on(.*)/.exec(key);
                if(reg[1]) {
                    const eventName = lowerFirstLetter(reg[1]);
                    func.forEach(f => {
                        _jflowInstance.addEventListener(eventName, f);
                    });
                }
            } else if(func && typeof func === 'function') {
                const reg = /^on(.*)/.exec(key);
                if(reg[1]) {
                    _jflowInstance.addEventListener(lowerFirstLetter(reg[1]), func);
                }
            }
        }
    })
}