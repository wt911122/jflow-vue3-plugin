import JFlowComponent from './components/JFlow.js';
import JFlowInstance from './components/JFlowInstance';
import JFlowLink from './components/JFlowLink';
import JFlowGroup from './components/JFlowGroup';
import JFlowTextGroup from './components/JFlowTextGroup';

const JFLOW_NODES = [
    'Point',
    'Rectangle',
    'Capsule',
    'Diamond',
    'Rhombus',
    'Text',
    'Icon',
    'ShadowDom',
    'TextEditor',
];
const JFLOW_LINKS = [
    'Link',
    'PolyLink',
    'BezierLink'
]
const JFLOW_GROUPS = [
    'CapsuleGroup',
    'CapsuleVerticalGroup',
    'DiamondGroup',
    'DiamondVerticalGroup',
    'RhombusGroup',
    'PointGroup',
    'ScrollGroup',
]

const components = [
    {
        name: 'Jflow',
        component: JFlowComponent,
    },
    {
        name: 'Group',
        component: JFlowGroup('Group'),
    }, 
    ...JFLOW_GROUPS.map(name => ({
        name,
        component: JFlowGroup(name)
    })),
    ...JFLOW_NODES.map(name => ({
        name,
        component: JFlowInstance(name)
    })),
    ...JFLOW_LINKS.map(name => ({
        name,
        component: JFlowLink(name)
    })),
    {
        name: 'TextGroup',
        component: JFlowTextGroup
    }
];
const componentPrefix = 'j';
customElements.define('jflow-group', class extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: 'open'});
    }
});
/**
 * @module JFlowVuePlugin 
 */
export const JFlowVuePlugin = {
    /**
     * 安装 JFlowVuePlugin
     * @function
     * @param {Vue} Vue - Vue
     * @param {Object} options - Vue plugin 配置
     * @param {string} options.prefix - 组件前缀，默认是 j
     * @param {Object} options.custom - 自定义组件，形式为 { key: {@link:Instance} }
     */
    install: (Vue, options = {}) => {
        let prefixToUse = componentPrefix;
        if(options && options.prefix){
            prefixToUse = options.prefix;
        };
        components.forEach(k => {
            Vue.component(`${prefixToUse}${k.name}`, k.component);
        });

        if(options.customInstance) {
            Object.keys(options.customInstance).forEach(name => {
                Vue.component(`${prefixToUse}${name}`, JFlowInstance(options.customInstance[name]));
            })
        }
        if(options.customGroups) {
            Object.keys(options.customGroups).forEach(name => {
                Vue.component(`${prefixToUse}${name}`, JFlowGroup(options.customGroups[name]));
            })
        }
        if(options.customLink) {
            Object.keys(options.customLink).forEach(name => {
                Vue.component(`${prefixToUse}${name}`, JFlowLink(options.customLink[name]));
            })
        }
    }
}

export { default as JFlowLinkGroup } from './components/JFlowLinkGroup';
