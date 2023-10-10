import { provide, toRaw } from 'vue'
export default function (_jflowInstance) {
    // const stack = ref([]);
    function addToStack(instance, source) {
        _jflowInstance.addToStack(instance);
        if(source) {
            source = toRaw(source);
            instance._jflow.setRenderNodeBySource(source, instance)
        }
    }
    function removeFromStack(instance) {
        _jflowInstance.removeFromStack(instance);
    }

    provide('addToStack', addToStack);
    provide('removeFromStack', removeFromStack);
}