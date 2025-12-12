<!-- src/components/Footer.vue -->
<template>
    <el-footer class="footer">
        <div class="container">
            <p>© 2025 Zephyr Blog. Powered by Vue3 + Element Plus</p>
            <p>Beian <a href="https://beian.miit.gov.cn" target="_blank">粤ICP备xxxxxxx号</a></p>
        </div>
    </el-footer>
</template>

<style scoped>
.footer {
    text-align: center;
    padding: 40px 20px;
    background: #111;
    color: #666;
    font-size: 14px;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
}

a {
    color: #00d1b2;
}
</style>