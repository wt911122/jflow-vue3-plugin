import babel from 'rollup-plugin-babel';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import vue from 'rollup-plugin-vue'

export default [
    {
        input: 'index.js', // 入口文件
        output: {
            file: 'dist/jflow-vue3-plugin.es.min.js',
            format: 'esm',
            sourcemap: true,
            globals: {
                vue: 'vue',
                ['@joskii/jflow-core']: '@joskii/jflow-core'
            }
        },
        plugins: [
            resolve(),
            commonjs(),
            vue(),
            // terser(), 
        ], 
        external: ['vue', '@joskii/jflow-core']
    },
    {
        input: 'index.js', // 入口文件
        output: {
            exports: 'named',
            file: 'dist/jflow-vue3-plugin.min.js', // 输出文件
            format: 'umd', // 输出格式
            name: 'jflow-vue3-plugin', // 全局变量名称，用于在浏览器环境中使用.
            sourcemap: true,
            globals: {
                vue: 'vue',
                ['@joskii/jflow-core']: '@joskii/jflow-core'
            }
        },
        plugins: [
            resolve(),
            commonjs(),
            babel({
                exclude: 'node_modules/**' 
            }),
            vue(),
            // terser(), 
        ], 
        external: ['vue', '@joskii/jflow-core']
    },
    
];