<template>
    <div class="profile-container">
        <div class="profile-card glass-panel">
            <div class="avatar-section">
                <el-upload class="avatar-uploader"
                           :http-request="customUpload"
                           :on-success="handleAvatarSuccess"
                           :on-error="handleUploadError"
                           :before-upload="beforeAvatarUpload"
                           :show-file-list="false"
                           accept="image/*"
                >
                    <div class="avatar-wrapper">
                        <img :src="user.avatar" class="avatar-img"/>
                        <div class="avatar-hover-mask">
                            <el-icon>
                                <Camera/>
                            </el-icon>
                        </div>
                    </div>
                </el-upload>
            </div>

            <div class="info-section">
                <div
                        class="editable-item username-wrapper"
                        @mouseenter="hoverField = 'username'"
                        @mouseleave="hoverField = ''"
                >
                    <h2 v-if="activeField !== 'username'" @click="setEditable('username')">
                        {{ user.username }}
                        <el-icon v-show="hoverField === 'username' || isMobile" class="edit-icon">
                            <EditPen/>
                        </el-icon>
                    </h2>
                    <el-input
                            v-else
                            ref="usernameInput"
                            v-model="user.username"
                            @blur="saveField('username')"
                            @keyup.enter="saveField('username')"
                            class="edit-input"
                    />
                </div>

                <div
                        class="editable-item bio-wrapper"
                        @mouseenter="hoverField = 'bio'"
                        @mouseleave="hoverField = ''"
                >
                    <p v-if="activeField !== 'bio'" @click="setEditable('bio')" class="bio-text">
                        {{ user.bio || '暂无个性签名' }}
                        <el-icon v-show="hoverField === 'bio' || isMobile" class="edit-icon">
                            <EditPen/>
                        </el-icon>
                    </p>
                    <el-input
                            v-else
                            ref="bioInput"
                            v-model="user.bio"
                            type="textarea"
                            autosize
                            @blur="saveField('bio')"
                            class="edit-textarea"
                    />
                </div>
            </div>
            <div class="action-section">
                <div class="password-link" @click="showPasswordDialog = true">
                    <el-icon>
                        <Lock/>
                    </el-icon>
                    修改登录密码
                </div>
            </div>
            <div class="back-link" @click="router.back()">
                <el-icon>
                    <ArrowLeft/>
                </el-icon>
                返回
            </div>
        </div>
        <el-dialog
                v-model="showPasswordDialog"
                title="修改密码"
                width="360px"
                append-to-body
                class="dark-dialog"
                :close-on-click-modal="false"
        >
            <el-form :model="pwdForm" :rules="pwdRules" ref="pwdFormRef" label-position="top">
                <el-form-item label="新密码" prop="newPassword">
                    <el-input v-model="pwdForm.newPassword" type="password" show-password placeholder="请输入新密码"/>
                </el-form-item>
                <el-form-item label="确认新密码" prop="confirmPassword">
                    <el-input v-model="pwdForm.confirmPassword" type="password" show-password
                              placeholder="请再次输入新密码"/>
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="showPasswordDialog = false">取消</el-button>
                    <el-button type="primary" :loading="pwdLoading" @click="handleUpdatePassword">确认修改</el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>
<script setup lang="ts">
import {ref, nextTick} from 'vue'
import {useRouter} from 'vue-router'
import {Camera, EditPen, ArrowLeft, Lock} from '@element-plus/icons-vue'
import {useUserStore} from '../stores'
import axios from "axios";
import {ElMessage} from "element-plus";
import {updateName, updatePwd} from "../api/user.ts";

const userStore = useUserStore()
const router = useRouter()
const isMobile = ref(window.innerWidth <= 768)

interface UserInfo {
    username: string;
    bio: string;
    avatar: string;
}

const user = ref<UserInfo>({
    username: userStore.getUsername,
    bio: '',
    avatar: userStore.getAvatar
})

const activeField = ref<keyof UserInfo | ''>('')
const hoverField = ref<keyof UserInfo | ''>('')
// 引用 Input 实例用于自动聚焦
const usernameInput = ref<HTMLInputElement | null>(null)
const bioInput = ref<HTMLInputElement | null>(null)

const showPasswordDialog = ref(false)
const pwdLoading = ref(false)
const pwdFormRef = ref()

const pwdForm = ref({
    newPassword: '',
    confirmPassword: ''
})

const pwdRules = {
    newPassword: [
        {required: true, message: '请输入新密码', trigger: 'blur'},
        {min: 6, message: '密码长度至少为6位', trigger: 'blur'}
    ],
    confirmPassword: [
        {required: true, message: '请再次输入密码', trigger: 'blur'},
        {
            validator: (_rule: any, value: string, callback: any) => {
                if (value !== pwdForm.value.newPassword) {
                    callback(new Error('两次输入的密码不一致'))
                } else {
                    callback()
                }
            },
            trigger: 'blur'
        }
    ]
}

const handleUpdatePassword = async () => {
    await pwdFormRef.value.validate(async (valid: boolean) => {
        if (valid) {
            pwdLoading.value = true
            try {
                let pwdFor = {
                    id: userStore.getUserid,
                    password: pwdForm.value.confirmPassword
                }
                await updatePwd(pwdFor)
                ElMessage.success('密码修改成功，请重新登录')
                showPasswordDialog.value = false
                 userStore.resetStore()
                 await router.push('/login')
            } catch (e: any) {
                ElMessage.error(e.message || '修改失败')
            } finally {
                pwdLoading.value = false
            }
        }
    })
}
const setEditable = async (field: keyof UserInfo) => {
    activeField.value = field
    await nextTick()
    // 切换到编辑模式后自动获取焦点
    if (field === 'username') usernameInput.value?.focus()
    if (field === 'bio') bioInput.value?.focus()
}

const saveField = async (field: keyof UserInfo) => {
    try {
        activeField.value = ''
        let nameForm = {
            id: userStore.getUserid,
            userName: user.value[field],
        }
        const res = await updateName(nameForm);
        if (res.code === 200) {
            user.value.username = user.value[field];
            userStore.setUsername(user.value[field]);
        }
    } catch (e) {

    }
}


const beforeAvatarUpload = async (file: File) => {
    ElMessage.info('正在处理头像，请稍候...');
    // 限制最长边 500px，超过 200KB 压缩到约 100KB
    const newFile = await processImage(file, 100, 50, 200);
    // 手动调用你已有的 upload 方法
    await customUpload({file: newFile});

    return false; // 阻止 el-upload 默认提交
};


/**
 * 压缩 + 限制图片最大宽高
 * @param file 原始文件
 * @param maxSizeKB 超过此大小执行压缩
 * @param targetKB 压缩目标大小
 * @param maxWidthOrHeight 限制最长边像素，例如 500
 */
const processImage = (
    file: File,
    maxSizeKB = 50,
    targetKB = 50,
    maxWidthOrHeight = 200
): Promise<File> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(file);
        img.onload = () => {
            let {width, height} = img;
            // 限制最长边《关键逻辑》
            const maxSide = Math.max(width, height);
            if (maxSide > maxWidthOrHeight) {
                const scale = maxWidthOrHeight / maxSide;
                width = width * scale;
                height = height * scale;
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d')!;
            ctx.drawImage(img, 0, 0, width, height);
            const tryCompress = (q: number) => {
                return new Promise<File>((resolve2) => {
                    canvas.toBlob(
                        (blob) => {
                            resolve2(new File([blob!], file.name, {type: file.type}));
                        },
                        file.type,
                        q
                    );
                });
            };
            const fileKb = file.size / 1024;
            // 不超过阈值，无需压缩（但已做尺寸限制）
            if (fileKb <= maxSizeKB) {
                canvas.toBlob(
                    (blob) => {
                        resolve(new File([blob!], file.name, {type: file.type}));
                    },
                    file.type,
                    0.9
                );
                return;
            }

            // 超过阈值，开始压缩到 targetKB
            const tryCompressLoop = async () => {
                let quality = 0.8;
                let compressedFile = await tryCompress(quality);

                while (compressedFile.size / 1024 > targetKB && quality > 0.2) {
                    quality -= 0.1;
                    compressedFile = await tryCompress(quality);
                }
                resolve(compressedFile);
            };

            tryCompressLoop();
        };
    });
};


const customUpload = async (options: any) => {
    const formData = new FormData()
    formData.append('file', options.file)
    formData.append('userId', String(userStore.getUserid))
    try {
        const res = await axios.post('/api/system/upload-avatar', formData, {
            headers: {'Content-Type': 'multipart/form-data'}
        })
        if (res.data.code === 200) {
            user.value.avatar = res.data.data;
            userStore.setAvatar(res.data.data)
            return res.data.data;
        }
        return userStore.getAvatar;
    } catch (err) {
        throw err
    }
}

// 上传成功
const handleAvatarSuccess = (response: any) => {
    debugger
    user.value.avatar = response
    userStore.setAvatar(response)
}

// 上传失败
const handleUploadError = (err: any) => {
    ElMessage.error('上传失败：' + err.message)
}

</script>

<style scoped lang="scss">
.profile-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--bg-color);
}

.profile-card {
  width: 100%;
  max-width: 400px;
  padding: 50px 30px;
  border-radius: 32px;
  text-align: center;
  position: relative;

  .avatar-section {
    margin-bottom: 30px;
    display: flex;
    justify-content: center;

    .avatar-wrapper {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      overflow: hidden;
      position: relative;
      cursor: pointer;
      border: 2px solid rgba(255, 255, 255, 0.1);

      .avatar-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .avatar-hover-mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        justify-content: center;
        align-items: center;
        color: #fff;
        opacity: 0;
        transition: opacity 0.3s;
        font-size: 24px;
      }

      &:hover .avatar-hover-mask {
        opacity: 1;
      }
    }
  }
}

.editable-item {
  margin-bottom: 20px;
  position: relative;
  min-height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;

  h2, .bio-text {
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 8px;
    transition: background 0.2s;
    position: relative;
    display: inline-block;

    &:hover {
      background: rgba(255, 255, 255, 0.05);
    }
  }

  h2 {
    font-size: 24px;
    color: #fff;
    margin: 0;
  }

  .bio-text {
    font-size: 14px;
    color: #9aa0a6;
    line-height: 1.6;
  }

  .edit-icon {
    font-size: 16px;
    margin-left: 8px;
    color: var(--accent-color);
    vertical-align: middle;
  }

  /* 深度修改 Element Plus 输入框样式，使其看起来像纯文本编辑 */
  :deep(.el-input__wrapper), :deep(.el-textarea__inner) {
    background: rgba(255, 255, 255, 0.08) !important;
    box-shadow: none !important;
    border: 1px solid var(--accent-color) !important;
    text-align: center;
    color: #fff;
    font-size: inherit;
    font-family: inherit;
  }
}

.back-link {
  margin-top: 40px;
  font-size: 14px;
  color: #5f6368;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: color 0.2s;

  &:hover {
    color: var(--accent-color);
  }
}

@media (max-width: 768px) {
  .profile-card {
    border: none;
    background: transparent;
  }
}

/* 在已有的 SCSS 中添加 */

.action-section {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.password-link {
  font-size: 13px;
  color: var(--el-color-primary); // 使用主题色
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  opacity: 0.8;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
    text-decoration: underline;
  }
}

/* 深度定制暗黑对话框 */
:deep(.dark-dialog) {
  background: rgba(30, 30, 35, 0.9) !important;
  backdrop-filter: blur(10px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);

  .el-dialog__header {
    .el-dialog__title {
      color: #fff;
      font-size: 18px;
    }
  }

  .el-form-item__label {
    color: #9aa0a6 !important;
  }

  .el-input__wrapper {
    background: rgba(255, 255, 255, 0.05) !important;
    box-shadow: none !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;

    &.is-focus {
      border-color: var(--accent-color) !important;
    }
  }

  .el-input__inner {
    color: #fff !important;
  }

  .el-dialog__footer {
    padding-top: 0;
  }
}

.back-link {
  margin-top: 0; // 重置之前样式的 margin
}

</style>