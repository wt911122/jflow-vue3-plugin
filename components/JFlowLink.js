import * as JFlowInstance from '@joskii/jflow-core';
import { inject, watch, toRaw, onUnmounted } from 'vue';
import { bindEvent } from './event-utils'

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
        setup(props, { attrs }) {
            const addToLinkStack = inject('addToLinkStack');
            const removeFromLinkStack = inject('removeFromLinkStack');
            const getJFlow = inject('getJFlow');
            const jflow = getJFlow();

            let _jflowInstance
            const createInstance = (fromInstance, toInstance) => {
                if(fromInstance && toInstance) {
                    _jflowInstance = new builder({
                        ...props.configs,
                        from: fromInstance,
                        to: toInstance,
                    });
                    bindEvent(_jflowInstance, attrs);
                    addToLinkStack(_jflowInstance, toRaw(props.from), toRaw(props.to));   
                }
            }
            

            const refresh = () => {
                const fromInstance = jflow.getRenderNodeBySource(toRaw(props.from));
                const toInstance = jflow.getRenderNodeBySource(toRaw(props.to));
                if(!_jflowInstance) {
                    createInstance(fromInstance, toInstance);
                } else {
                    _jflowInstance.setConfig({
                        ...props.configs,
                        from: fromInstance,
                        to: toInstance,
                    });
                }    
            }

            refresh();

            const stop = watch(() => [props.from, props.to, props.configs], () => {
                refresh();
            });

            onUnmounted(() => {
                stop()
                if(_jflowInstance) {
                    _jflowInstance.destroy();
                    removeFromLinkStack(_jflowInstance);
                }
               
            })
            return () => null;
        }
    }
}