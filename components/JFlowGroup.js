import * as JFlowInstance from '@joskii/jflow-core';
import { inject, watch, h, onMounted, onUpdated, onUnmounted, toRaw } from 'vue';
import useStack from './useStack';
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
            visible: {
                type: Boolean,
                default: true,
            },
            source: {
                type: Object,
            }
        },
        setup(props, { slots, attrs, expose }) {
            const addToBelongStack = inject('addToStack');
            const removeFromBelongStack = inject('removeFromStack');
            const renderJFlow = inject('renderJFlow');
            const _jflowInstance =  new builder(toRaw(props.configs));
            useStack(_jflowInstance);
            bindEvent(_jflowInstance, attrs);
            addToBelongStack(_jflowInstance, toRaw(props.source));
            
            const setVisible = (val) => {
                _jflowInstance.visible = val;
                renderJFlow();
            }
            const stop0 = watch(() => props.configs, (val, oldVal) => {
                if(JSON.stringify(val) === JSON.stringify(oldVal)){
                    return;
                }
                _jflowInstance.setConfig(val);
                renderJFlow();
            });

            const stop1 = watch(() => props.visible, setVisible);

            const stop2 = watch(() => props.source, (val) => {
                _jflowInstance._jflow.setRenderNodeBySource(toRaw(val), _jflowInstance);
            });

            setVisible(props.visible)

            onMounted(() => {
                _jflowInstance.recalculate()
            });
            onUpdated(() => {
                _jflowInstance.recalculateUp()
            });
            onUnmounted(() => {
                stop0();
                stop1();
                stop2();
                _jflowInstance.destroy();
                removeFromBelongStack(_jflowInstance);
            })

            expose({
                _jflowInstance,
            });
            
            return () => h('jflow-group', slots.default())
        }
    }
}