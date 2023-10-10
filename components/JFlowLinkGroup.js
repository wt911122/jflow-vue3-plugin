import { inject, watch, onMounted, onUpdated, onUnmounted, toRaw, ref, h } from 'vue';
import useStack from './useStack';
import { bindEvent } from './event-utils'

export default function (builder) {
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
            },
            genVueComponentKey: {
                type: Function,
            }
        },
        setup(props, { attrs, slots, expose }) {
            const addToBelongStack = inject('addToStack');
            const removeFromBelongStack = inject('removeFromStack');
            const renderJFlow = inject('renderJFlow');
            const _jflowInstance =  new builder(props.configs);
            useStack(_jflowInstance);
            bindEvent(_jflowInstance, attrs);
            addToBelongStack(_jflowInstance, toRaw(props.source));
            const renderLinks = ref([]);
            const genLinks = () => {
                renderLinks.value = _jflowInstance._layout.flowLinkStack.slice();
            }
            genLinks();
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
            const stop1 = watch(() => props.visible, setVisible)

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
            });
            const getLinkName = (link) => {
                const type = link.type
                if(!slots[type]) {
                    return 'plainlink'
                }
                return type;
            }
            const genLinkVueComponentKey = (meta) => {
                const k1 = props.genVueComponentKey(meta.from.source);
                const k2 = props.genVueComponentKey(meta.to.source);
                const k3 = meta.part;
                return `${k1}-${k2}-${k3}`
            }

            expose({
                genLinks,
                _jflowInstance,
            });

            return () => h('jflow-group', [
                ...slots.default(),
                ...renderLinks.value.map(meta => {
                    const type = getLinkName(meta);
                    if(!slots[type]) {
                        return null;
                    }
                    const vnode = slots[type]({ 
                        configs: meta 
                    });
                    vnode.key = genLinkVueComponentKey(meta);
                    return vnode;
                })
            ])
        }
    }
}