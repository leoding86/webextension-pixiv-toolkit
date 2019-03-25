import commonjs from 'rollup-plugin-commonjs';

export default {
    input: ['./src/background/main.js'],
    output: {
        file: './dist/background.js',
        format: 'iife',
        name: 'background',
        globals: {
            browser: 'chrome'
        }
    },
    plugins: [
        commonjs({
            include: "./**"
        })
    ]
}