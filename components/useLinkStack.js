import { provide } from 'vue'
export default function (_jflowInstance) {
    // const stack = ref([]);
    function addToLinkStack(link, sourceFrom, sourceTo) {
        _jflowInstance.addToLinkStack(link);
        if(sourceFrom && sourceTo) {
            _jflowInstance.addLinkNodeBySource(sourceFrom, sourceTo, link);
        }
    }
    function removeFromLinkStack(link, sourceFrom, sourceTo) {
        _jflowInstance.removeFromLinkStack(link);
        if(sourceFrom && sourceTo) {
            _jflowInstance.removeLinkNodeBySource(sourceFrom, sourceTo, link);
        }
    }

    provide('addToLinkStack', addToLinkStack);
    provide('removeFromLinkStack', removeFromLinkStack);
}