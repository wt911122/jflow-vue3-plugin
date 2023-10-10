
import {
    ref, h, provide,
    onBeforeMount,
    onUnmounted,
    nextTick,
    toRaw
} from "vue";
import useStack from "./useStack";
import useLinkStack from './useLinkStack';
import { bindEvent } from './event-utils'
import JFlow from '@joskii/jflow-core';

export default {
    props: {
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
    },
    inheritAttrs: false,
    setup(props, { slots, attrs, emit, expose }) {
        const { genVueComponentKey } = props;
        const genLinkVueComponentKey = (meta) => {
            const k1 = genVueComponentKey(meta.from.source);
            const k2 = genVueComponentKey(meta.to.source);
            const k3 = meta.part;
            return `${k1}-${k2}-${k3}`
        }

        const className = attrs.class;
        const style = attrs.style;
        const divEl = ref();
        let stopLoading = false;
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
                const s = toRaw(source);
                const ly = toRaw(layoutNode);
                if(map.has(s)) {
                    obj = map.get(s);
                } else {
                    obj = map.set(s);
                }
                obj.layoutNode = ly;
                return meta;
            });
            const links = _jflowInstance._layout.flowLinkStack.slice();
            return [ nodes, links ];
        }

        const loadingNodes = (nodes, links) => {
            emit('update:loading', true);
            let i = 0;
            const tl = () => {
                if(stopLoading) {
                    return;
                }
                const end = i + 100;
                const linkPart = links.slice(i, end);
                if(linkPart.length) {
                    // this.renderLinks.splice(this.renderLinks.length,  0, ...linkPart);
                    renderLinks.value = renderLinks.value.concat(linkPart); // faster
                    i = end;
                    requestAnimationFrame(tl);
                } else {
                    requestAnimationFrame(mountJFlow.bind(this));
                }
            }
            const tn = () => {
                if(stopLoading) {
                    return;
                }
                const end = i + 100;
                const part = nodes.slice(i, end);
                if(part.length) {
                    // this.renderNodes.splice(this.renderNodes.length,  0, ...part);
                    renderNodes.value = renderNodes.value.concat(part);
                    i = end;
                    requestAnimationFrame(tn);
                } else {
                    i = 0;
                    requestAnimationFrame(tl)
                }
            }
            requestAnimationFrame(tn)
        };

        onBeforeMount(() => {
            loadingNodes(...genNodeLinkMeta());
        });



        const mountJFlow = () => {
            if(stopLoading) {
                return;
            }
            _jflowInstance.$mount(divEl.value);
            bindEvent(_jflowInstance, attrs);
            emit('update:loading', false)
        }

        onUnmounted(() => {
            if(_jflowInstance.destroy) {
                _jflowInstance.destroy(); 
            }
            stopLoading = true;
        })

        const syncNodeLink = (nodes, links) => {
            renderNodes.value = nodes.slice();
            renderLinks.value = links.slice();
        }

        // syncNodeLink(...genNodeLinkMeta());
        // nextTick(() => {
        //     mountJFlow();
        // })


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

        const syncLayout = () => {
            syncNodeLink(...genNodeLinkMeta());
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

        expose({
            reflow,
            renderJFlow,
            getInstance,
            syncLayout
        });


        return () => {
            return h('div', {
                class: className,
                style: style,
                ref: divEl 
            },
            !renderNodes.value.length ? null: h('div', [
                ...renderNodes.value.map(node => {
                    if(!node) {
                        return null
                    }
                    let { type, source, layoutNode } = node;
                    // layoutNode = toRaw(layoutNode);
                    if(!slots[type]) {
                        if(slots['jflowcommon']){
                            type = 'jflowcommon';
                        } else {
                            return null;
                        }
                    }
                    const [vnode] = slots[type]({ source, layoutNode });
                    vnode.key = genVueComponentKey(source);   
                    return vnode;
                }).filter(n => !!n),
                ...renderLinks.value.map(meta => {
                    let type = meta.type || 'plainlink'
                    if(!slots[type]) {
                        return null;
                    }
                    const [vnode] = slots[type]({ configs: meta });
                    vnode.key = genLinkVueComponentKey(meta);
                    return vnode
                })

            ]))
        };
    },
}