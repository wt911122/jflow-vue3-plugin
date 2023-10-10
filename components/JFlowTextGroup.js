import {
    ref, h,
    nextTick,
    toRaw,
    inject,
    watch,
    onMounted,
    onUpdated,
    onUnmounted,
} from "vue";
import { TextGroup } from '@joskii/jflow-core';
import useStack from "./useStack";
import { bindEvent } from './event-utils'

export default {
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
        },
        genVueComponentKey: {
            type: Function,
        }
    },
    inheritAttrs: false,
    setup(props, { slots, attrs, emit, expose }) {
        const { genVueComponentKey } = props;

        const addToBelongStack = inject('addToStack');
        const removeFromBelongStack = inject('removeFromStack');
        const renderJFlow = inject('renderJFlow');
        const renderNodes = ref([]);

        const _jflowInstance = new TextGroup(toRaw(props.configs));
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
        setVisible(props.visible);

        const genTextElementMeta = () => {
            renderNodes.value = _jflowInstance._flattenTxtElem.filter(elem => elem.type !== 'text');
        }
        genTextElementMeta();

        const reflow = () => {
            _jflowInstance.refreshTextElements();
            genTextElementMeta();
            nextTick(() => {
                _jflowInstance.refresh();
            })
        }

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
            reflow,
        });
        
        return () => {
            if(renderNodes.value.length === 0) {
                return h('jflow-group');
            }
            return h('div', renderNodes.value.map(textElement => {
                let { type, source } = textElement;
                if(!slots[type]) {
                    if(slots['jflowcommon']){
                        type = 'jflowcommon';
                    } else {
                        return null;
                    }
                }
                const [vnode] = slots[type]({ source, textElement });
                vnode.key = genVueComponentKey(source);   
                return vnode;
            }).filter(n => !!n))
        }
    }
}