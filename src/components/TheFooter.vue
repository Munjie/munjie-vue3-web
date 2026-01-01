<template>
    <footer class="site-footer glass-panel">
        <div class="container">
            <div class="footer-content">
                <div class="footer-brand">
                    <div class="logo">
<!--                        <el-icon :size="20" color="#6366f1"><Moon /></el-icon>-->
<!--                        <MetaLogo class="mlogo" size="20"  />-->
                        <el-icon :size="20">
                            <IconJCloud />
                        </el-icon>
                        <span>介云JCloud</span>
                    </div>
                    <p>记录代码与生活的数字碎片。</p>
                </div>

                <div class="footer-links">
                    <a href="#"><el-icon><Platform /></el-icon> GitHub</a>
                    <a href="#"><el-icon><ChatDotRound /></el-icon> Weibo</a>
                    <a href="#"><el-icon><Message /></el-icon> Email</a>
                </div>
            </div>

            <div class="footer-bottom">
                <p>
                    &copy;2020-2025 JCloud Blog.   <a href="https://beian.miit.gov.cn" target="_blank"> 沪ICP备19003704号</a>
                </p>
            </div>
        </div>
    </footer>
</template>

<style scoped lang="scss">
.site-footer {
  margin-top: 80px;
  border-left: none;
  border-right: none;
  border-bottom: none;
  padding: 60px 0 30px;

  .container {
    width: 90%;
    max-width: 1200px;
    margin: 0 auto;
  }
}

.footer-content {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 40px;
  margin-bottom: 40px;
}

.footer-brand {
  .logo {
    font-size: 1.2rem;
    font-weight: 800;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 15px;
    color: #fff;
  }
  p {
    color: var(--text-secondary);
    font-size: 0.9rem;
    max-width: 300px;
  }
}

.footer-links {
  display: flex;
  gap: 30px;

  a {
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: color 0.3s;

    &:hover {
      color: var(--accent-color);
    }
  }
}

.footer-bottom {
  border-top: 1px solid var(--glass-border);
  padding-top: 25px;
  text-align: center;
  p {
    color: #555;
    font-size: 0.8rem;
  }
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
    align-items: center;
  }
}
/* 浅色模式 */
.mlogo {
    color: #6366f1; /* 深科技蓝灰 */
}

.dark .mlogo {
    color: #6366f1;
}
</style>
<script setup>
import MetaLogo from "./icons/MetaLogo.vue";
import IconJCloud from "./icons/IconJCloud.vue";
</script>