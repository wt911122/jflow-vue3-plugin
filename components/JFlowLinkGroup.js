import { inject, watch, onMounted, onUpdated, onUnmounted, toRaw } from 'vue';
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
        data() {
            return {
                renderLinks: [],
            }
        },
        setup(props, { attrs }) {
            const addToBelongStack = inject('addToStack');
            const removeFromBelongStack = inject('removeFromStack');
            const _jflowInstance =  new builder(props.configs);
            useStack(_jflowInstance);
            bindEvent(_jflowInstance, attrs);
            addToBelongStack(_jflowInstance, toRaw(props.source));

            const genLinks = () => {
                this.renderLinks = _jflowInstance._layout.flowLinkStack.slice();
            }

            genLinks();
            const stop1 = watch(() => props.visible, (val) => {
                _jflowInstance.visible = val;
            });

            const stop2 = watch(() => props.source, (val) => {
                _jflowInstance._jflow.setRenderNodeBySource(val, _jflowInstance);
            });

            onMounted(() => {
                _jflowInstance.recalculate()
            });
            onUpdated(() => {
                _jflowInstance.recalculateUp()
            });
            onUnmounted(() => {
                stop1();
                stop2();
                _jflowInstance.destroy();
                removeFromBelongStack(_jflowInstance);
            });

           
        },
        methods: {
            genLinkVueComponentKey(meta) {
                const k1 = this.genVueComponentKey(meta.from.source);
                const k2 = this.genVueComponentKey(meta.to.source);
                const k3 = meta.part;
                return `${k1}-${k2}-${k3}`
            },
            
        },
        template: `
            <jflow-group>
                <slot></slot>
                <template v-for="link in renderLinks" :key="genLinkVueComponentKey(link)">
                    <slot :name="link.type || 'plainlink'" 
                        :configs="link">
                    </slot>
                </template>
            </jflow-group>
        ` 
    }
}