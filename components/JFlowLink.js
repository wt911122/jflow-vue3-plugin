import * as JFlowInstance from '@joskii/jflow-core';
import { inject, watchEffect, toRaw, onUnmounted } from 'vue';
import { bindEvent } from './event-utils'
const isPrimitive = (val) => {
    if(val === null){
        return true
    }
        
    if(typeof val == "object" || typeof val == "function"){
        return false
    }else{
        return true
    }
}
export default function (nameNode) {
    const builder =  typeof nameNode === 'string'
        ? JFlowInstance[nameNode]
        : nameNode;
    return {
        inheritAttrs: false,
        props: {
            configs: {
                type: Object,
                default: function () {
                    return {};
                },
            },
            from: Object,
            to: Object,
        },
        setup(props, { attrs, expose }) {
            const addToLinkStack = inject('addToLinkStack');
            const removeFromLinkStack = inject('removeFromLinkStack');
            const getJFlow = inject('getJFlow');
            const renderJFlow = inject('renderJFlow');
            const jflow = getJFlow();
            const exposeObj = {
                _jflowInstance: null,
            }
            const createInstance = (fromInstance, toInstance) => {
                if(fromInstance && toInstance) {
                    const _jflowInstance = new builder({
                        ...props.configs,
                        from: fromInstance,
                        to: toInstance,
                    });
                    bindEvent(_jflowInstance, attrs);
                    addToLinkStack(_jflowInstance, toRaw(props.from), toRaw(props.to));   
                    exposeObj._jflowInstance = _jflowInstance
                }
            }
            

            const refresh = () => {
                const fromInstance = jflow.getRenderNodeBySource(toRaw(props.from));
                const toInstance = jflow.getRenderNodeBySource(toRaw(props.to));
                if(!exposeObj._jflowInstance) {
                    createInstance(fromInstance, toInstance);
                } else {
                    exposeObj._jflowInstance.setConfig({
                        ...props.configs,
                        from: fromInstance,
                        to: toInstance,
                    });
                }    
                renderJFlow();
            }

            refresh();
            const stop = watchEffect(() => {
                refresh();
            }, {
                flush: 'post',
            })
            onUnmounted(() => {
                stop();
                if(exposeObj._jflowInstance) {
                    exposeObj._jflowInstance.destroy();
                    removeFromLinkStack(exposeObj._jflowInstance, toRaw(props.from), toRaw(props.to));
                }
               
            })

            expose(exposeObj);
            return () => null;
        }
    }
}