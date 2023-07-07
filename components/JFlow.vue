<script setup>
    import { 
        ref, h, provide, 
        onUnmounted, 
        useAttrs, 
        nextTick, toRefs,
        toRaw
    } from "vue";
    import useStack from "./useStack";
    import useLinkStack from './useLinkStack';
    import { bindEvent } from './event-utils'
    import JFlow from '@joskii/jflow-core';
    
    const props = defineProps({
        configs: {
            type: Object,
            default: function () {
                return {};
            },
        },
        loading: Boolean,
        genVueComponentKey: {
            type: Function,
        }
    });
    defineOptions({
        inheritAttrs: false
    })
    const { genVueComponentKey } = toRefs(props);
    const genLinkVueComponentKey = (meta) => {
        const k1 = props.genVueComponentKey(meta.from.source);
        const k2 = props.genVueComponentKey(meta.to.source);
        const k3 = meta.part;
        return `${k1}-${k2}-${k3}`
    }
    const attrs = useAttrs();
    const className = attrs.class;
    const style = attrs.style;
    const emit = defineEmits(['update:loading'])
    const root = ref(null);
    
  
    const renderNodes = ref([]);
    const renderLinks = ref([]);

    const _jflowInstance = new JFlow(toRaw(props.configs));
    useStack(_jflowInstance);
    useLinkStack(_jflowInstance);

    const genNodeLinkMeta = () => {
        const nodes = _jflowInstance._layout.flowStack.map(meta => {
            const { type, layoutNode, source } = meta;
            const map = _jflowInstance.source_Layout_Render_NodeMap;
            let obj;
            if(map.has(source)) {
                obj = map.get(source);
            } else {
                obj = map.set(source);
            }
            obj.layoutNode = layoutNode;
            return meta;
        });
        const links = _jflowInstance._layout.flowLinkStack.slice();
        return [ nodes, links ];
    }

    const mountJFlow = () => {
        console.log(renderNodes)
        _jflowInstance.$mount(root.value);
        bindEvent(_jflowInstance, attrs);
        emit('update:loading', false)
    }

    onUnmounted(() => {
        _jflowInstance?.destroy();
    })

    const syncNodeLink = (nodes, links) => {
        renderNodes.value = nodes.slice();
        renderLinks.value = links.slice();
    }

    syncNodeLink(...genNodeLinkMeta());
    nextTick(() => {
        mountJFlow();
    })
    

    const reflow = (preCallback, afterCallback) => {
        syncNodeLink(...genNodeLinkMeta());
        nextTick(() => {
            if(preCallback) {
                preCallback();
            }
            _jflowInstance.recalculate();
            _jflowInstance.scheduleRender(() => {
                if(afterCallback) {
                    afterCallback();
                }
            });
            
        })
    }

    const getInstance = () => {
        return _jflowInstance;
    }

    
    const renderJFlow = (() => {
        let __renderInSchedule__ = false;
        return () => {
            if(__renderInSchedule__) {
                return;
            }
            __renderInSchedule__= true;
            nextTick(() => {
                _jflowInstance._render();
                __renderInSchedule__ = false;
            });
        }
    })();

    provide('getJFlow', getInstance);
    provide('renderJFlow', renderJFlow);

    defineExpose({
        reflow,
        renderJFlow,
        getInstance,
    });

</script>

<template>
    <div ref="root" :class="className" :style="style">
        <slot v-if="!renderNodes.length"></slot>
        <template v-else>
            <div>
                <template v-for="node in renderNodes" :key="genVueComponentKey(node.source)">
                    <slot 
                        :name="node.type" 
                        :source="node.source"
                        :layoutNode="node.layoutNode">
                    </slot>
                </template>
                <template v-for="link in renderLinks"  :key="genLinkVueComponentKey(link)">
                    <slot 
                        :name="link.type || 'plainlink'" 
                        :configs="link">
                    </slot>
                </template>
            </div>
        </template> 
    </div>
</template>