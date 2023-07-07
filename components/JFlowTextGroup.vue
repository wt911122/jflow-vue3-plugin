<script setup>
    import {
        ref, h, provide,
        useAttrs,
        nextTick, toRefs,
        toRaw,
        inject,
        watch,
        onMounted,
        onUpdated,
        onUnmounted,
    } from "vue";
    import * as jflow from '@joskii/jflow-core';
    import useStack from "./useStack";
    import { bindEvent } from './event-utils'

    const props = defineProps({
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
    });
    defineOptions({
        inheritAttrs: false
    })
    const { genVueComponentKey } = toRefs(props);
    const nodes = ref([]);
    const attrs = useAttrs();

    const addToBelongStack = inject('addToStack');
    const removeFromBelongStack = inject('removeFromStack');

    const _jflowInstance = new TextGroup(toRaw(props.configs));
    useStack(_jflowInstance);
    bindEvent(_jflowInstance, attrs);
    addToBelongStack(_jflowInstance, toRaw(props.source));
    
    const genTextElementMeta = () => {
        nodes.value = _jflowInstance._flattenTxtElem.filter(elem => elem.type !== 'text');
    }

    genTextElementMeta();

    const stop0 = watch(() => props.configs, (val, oldVal) => {
        if (JSON.stringify(val) === JSON.stringify(oldVal)) {
            return;
        }
        _jflowInstance.setConfig(val);
    });

    const stop1 = watch(() => props.visible, (val) => {
        _jflowInstance.visible = val;
    });

    const stop2 = watch(() => props.source, (val) => {
        _jflowInstance._jflow.setRenderNodeBySource(val, _jflowInstance);
    });

    

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
    });

    const getInstance = () => {
        return _jflowInstance;
    }

    defineExpose({
        reflow,
        getInstance
    });

</script>
<template>
    <jflow-group>
        <template v-for="node in nodes" :key="genVueComponentKey(node.source)">
            <slot :name="node.type || 'jflowcommon'" :source="node.source" :textElement="node">
            </slot>
        </template>
    </jflow-group>
</template>