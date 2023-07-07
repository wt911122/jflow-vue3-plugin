import * as JFlowInstance from '@joskii/jflow-core';
import { inject, watch, onUnmounted, toRaw } from 'vue';
import { bindEvent } from './event-utils'
import diff from 'object-diff';

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
            visible: {
                type: Boolean,
                default: true,
            },
            source: {
                type: Object,
            }
        },
        setup(props, { attrs }) {
            const addToBelongStack = inject('addToStack');
            const removeFromBelongStack = inject('removeFromStack');
            
            const _jflowInstance =  new builder(props.configs);
            bindEvent(_jflowInstance, attrs);
            addToBelongStack(_jflowInstance, toRaw(props.source));
            
            watch(() => props.configs, (val, oldVal) => {
                const diffed = diff(val, oldVal);
                if(Object.keys(diffed).length === 0){
                    return;
                }
                _jflowInstance.setConfig(val);
            });

            watch(() => props.visible, (val) => {
                _jflowInstance.visible = val;
            });

            watch(() => props.source, (val) => {
                _jflowInstance._jflow.setRenderNodeBySource(val, _jflowInstance);
            });

            onUnmounted(() => {
                _jflowInstance.destroy();
                removeFromBelongStack(_jflowInstance);
            })
            return () => null;
        }
    }
}