<template>
  <div class="user-profile">
    <div class="breadcrumb">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>个人中心</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <div class="profile-container">
      <!-- 左侧个人信息卡片 -->
      <div class="profile-sidebar">
        <el-card class="user-card">
          <div class="user-info">
            <div class="avatar-section">
              <el-avatar :size="100" :src="userInfo.imageUrl || userInfo.avatar" />
              <div class="user-status">
                <span class="status-dot" :class="{ online: userInfo.isOnline }"></span>
                <span class="status-text">{{ userInfo.isOnline ? '在线' : '离线' }}</span>
              </div>
            </div>
            
            <div class="user-details">
              <h2 class="username">{{ userInfo.nickname || userInfo.username }}</h2>
              <p class="user-title">{{ getUserRoleText(userInfo.role) }}</p>
              <p class="user-bio" v-if="userInfo.bio">{{ userInfo.bio }}</p>
            </div>
          </div>

          <div class="user-actions">
            <el-button type="primary" @click="showSettingsDialog">
              <el-icon><Setting /></el-icon>
              账户设置
            </el-button>
          </div>

          <div class="user-meta">
            <div class="meta-item" v-if="userInfo.location">
              <el-icon><Location /></el-icon>
              <span>{{ userInfo.location }}</span>
            </div>
            <div class="meta-item" v-if="userInfo.email">
              <el-icon><Message /></el-icon>
              <span>{{ userInfo.email }}</span>
            </div>
            <div class="meta-item">
              <el-icon><Calendar /></el-icon>
              <span>加入于 {{ formatJoinDate(userInfo.joinDate) }}</span>
            </div>
          </div>
        </el-card>

        <!-- 技能标签 -->
        <el-card class="skills-card" v-if="userInfo.skills && userInfo.skills.length > 0">
          <template #header>
            <h3>技术方向</h3>
          </template>
          <div class="skills-list">
            <el-tag
              v-for="skill in userInfo.skills"
              :key="skill"
              type="info"
              size="small"
              class="skill-tag"
            >
              {{ getSkillLabel(skill) }}
            </el-tag>
          </div>
        </el-card>

        <!-- 最近活动 -->
        <el-card class="activity-card">
          <template #header>
            <h3>最近活动</h3>
          </template>
          <div class="activity-list">
            <div 
              v-for="activity in recentActivities" 
              :key="activity.id"
              class="activity-item"
            >
              <div class="activity-icon">
                <el-icon v-if="activity.type === 'question'"><QuestionFilled /></el-icon>
                <el-icon v-if="activity.type === 'answer'"><ChatDotRound /></el-icon>
                <el-icon v-if="activity.type === 'resource'"><Document /></el-icon>
              </div>
              <div class="activity-content">
                <p class="activity-title">{{ activity.title }}</p>
                <span class="activity-time">{{ formatTime(activity.time) }}</span>
              </div>
            </div>
            <div v-if="recentActivities.length === 0" class="no-activity">
              暂无活动记录
            </div>
          </div>
        </el-card>
      </div>

      <!-- 右侧内容区域 -->
      <div class="profile-content">
        <!-- 管理员界面 -->
        <div v-if="userInfo.role === 'admin'" class="admin-dashboard">
          <h2 class="admin-title">管理员控制台</h2>
          <div class="admin-grid">
            <div class="admin-item">
              <el-card class="admin-card" shadow="hover">
                <div class="admin-icon">
                  <el-icon><User /></el-icon>
                </div>
                <h3>用户管理</h3>
                <p>管理平台用户账户和权限</p>
                <el-button type="primary" size="small">进入管理</el-button>
              </el-card>
            </div>
            <div class="admin-item">
              <el-card class="admin-card" shadow="hover">
                <div class="admin-icon">
                  <el-icon><Document /></el-icon>
                </div>
                <h3>内容审核</h3>
                <p>审核用户发布的提问和资源</p>
                <el-button type="primary" size="small">进入审核</el-button>
              </el-card>
            </div>
            <div class="admin-item">
              <el-card class="admin-card" shadow="hover">
                <div class="admin-icon">
                  <el-icon><DataAnalysis /></el-icon>
                </div>
                <h3>数据统计</h3>
                <p>查看平台运营数据和分析</p>
                <el-button type="primary" size="small">查看统计</el-button>
              </el-card>
            </div>
            <div class="admin-item">
              <el-card class="admin-card" shadow="hover">
                <div class="admin-icon">
                  <el-icon><Setting /></el-icon>
                </div>
                <h3>系统设置</h3>
                <p>配置平台参数和功能设置</p>
                <el-button type="primary" size="small">系统设置</el-button>
              </el-card>
            </div>
          </div>
        </div>
        
        <!-- 教师用户界面 -->
        <el-tabs v-else-if="userInfo.role === 'teacher'" v-model="activeTab" type="card" class="profile-tabs">
          <!-- 我的回答 -->
          <el-tab-pane label="我的回答" name="answers">
            <div class="tab-content">
              <div class="content-header">
                <h3>我的回答</h3>
              </div>
              
              <div class="answers-list">
                <div 
                  v-for="answer in userAnswers" 
                  :key="answer.id"
                  class="answer-item"
                >
                  <div class="answer-main">
                    <div class="answer-question">
                      <h4 class="question-title">
                        <router-link :to="`/questions/${answer.questionId}`">
                          {{ answer.questionTitle }}
                        </router-link>
                      </h4>
                    </div>
                    <div class="answer-content">
                      <p class="answer-text">{{ answer.content }}</p>
                      <div class="answer-meta">
                        <span class="answer-time">{{ formatTime(answer.createTime) }}</span>
                        <span class="answer-votes">
                          <el-icon><CaretTop /></el-icon>
                          {{ answer.upvotes }} 赞同
                        </span>
                        <span class="answer-accepted" v-if="answer.isAccepted">
                          <el-icon><SuccessFilled /></el-icon>
                          已采纳
                        </span>
                      </div>
                    </div>
                  </div>
                  <div class="answer-actions">
                    <el-button size="small" @click="editAnswer(answer)">编辑</el-button>
                    <el-button size="small" type="danger" @click="deleteAnswer(answer)">
                      删除
                    </el-button>
                  </div>
                </div>
                
                <div v-if="userAnswers.length === 0" class="no-data">
                  <el-empty description="暂无回答记录" />
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 我的资源 -->
          <el-tab-pane label="我的资源" name="resources">
            <div class="tab-content">
              <div class="content-header">
                <h3>我的资源</h3>
                <el-button type="primary" @click="uploadResource">
                  <el-icon><Plus /></el-icon>
                  上传资源
                </el-button>
              </div>
              
              <!-- 资源搜索筛选 -->
              <div class="search-filter">
                <el-row :gutter="20">
                  <el-col :span="6">
                    <el-input
                      v-model="resourceSearchTitle"
                      placeholder="搜索资源标题..."
                      prefix-icon="Search"
                      clearable
                    />
                  </el-col>
                  <el-col :span="6">
                    <el-input
                      v-model="resourceSearchDescription"
                      placeholder="搜索资源描述..."
                      prefix-icon="Document"
                      clearable
                    />
                  </el-col>
                  <el-col :span="6">
                    <el-select v-model="resourceSelectedCategory" placeholder="选择分类" clearable>
                      <el-option
                        v-for="category in resourceCategories"
                        :key="category.id"
                        :label="category.name"
                        :value="category.name"
                      />
                    </el-select>
                  </el-col>
                  <el-col :span="6">
                    <el-button type="primary" @click="handleResourceQuery" class="query-btn">
                      <el-icon><Search /></el-icon>
                      查询
                    </el-button>
                    <el-button @click="resetResourceSearch">
                      重置
                    </el-button>
                  </el-col>
                </el-row>
              </div>
              
              <div class="resources-list">
                <div 
                  v-for="resource in userResources" 
                  :key="resource.id"
                  class="resource-item"
                >
                  <div class="resource-info">
                    <h4 class="resource-title">
                      <router-link :to="`/resources/${resource.id}`">
                        {{ resource.title }}
                      </router-link>
                    </h4>
                    <p class="resource-description">{{ resource.description }}</p>
                    <div class="resource-meta">
                      <span class="resource-type">
                        <el-icon><Document /></el-icon>
                        {{ getFileTypeLabel(resource.fileType) }}
                      </span>
                      <span class="resource-category">
                        <el-icon><Folder /></el-icon>
                        {{ resource.classBelong || resource.category }}
                      </span>
                      <span class="resource-upload-time">
                        <el-icon><Clock /></el-icon>
                        {{ formatTime(resource.createTime) }}
                      </span>
                      <span class="resource-downloads">
                        <el-icon><Download /></el-icon>
                        {{ resource.downloadCount || 0 }} 下载
                      </span>
                    </div>
                  </div>
                  <div class="resource-actions">
                    <el-button size="small" @click="editResource(resource)">编辑</el-button>
                    <el-button size="small" type="danger" @click="deleteResource(resource)">
                      删除
                    </el-button>
                  </div>
                </div>
                
                <div v-if="userResources.length === 0" class="no-data">
                  <el-empty description="暂无资源记录">
                    <el-button type="primary" @click="uploadResource">上传资源</el-button>
                  </el-empty>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
        
        <!-- 普通用户界面 -->
        <el-tabs v-else-if="!userInfo.role || userInfo.role === 'student'" v-model="activeTab" type="card" class="profile-tabs">
          <!-- 我的提问 -->
          <el-tab-pane label="我的提问" name="questions">
            <div class="tab-content">
              <div class="content-header">
                <h3>我的提问</h3>
                <el-button type="primary" @click="askQuestion">
                  <el-icon><Plus /></el-icon>
                  提问
                </el-button>
              </div>
              
              <!-- 提问搜索筛选 -->
              <div class="search-filter">
                <el-row :gutter="20">
                  <el-col :span="6">
                    <el-input
                      v-model="questionSearchTitle"
                      placeholder="搜索提问标题..."
                      prefix-icon="Search"
                      clearable
                    />
                  </el-col>
                  <el-col :span="6">
                    <el-input
                      v-model="questionSearchContent"
                      placeholder="搜索提问内容..."
                      prefix-icon="Document"
                      clearable
                    />
                  </el-col>
                  <el-col :span="6">
                    <el-select v-model="questionSelectedCourse" placeholder="选择课程" clearable>
                      <el-option
                        v-for="course in questionCourses"
                        :key="course.id"
                        :label="course.name"
                        :value="course.name"
                      />
                    </el-select>
                  </el-col>
                  <el-col :span="6">
                    <el-button type="primary" @click="handleQuestionQuery" class="query-btn">
                      <el-icon><Search /></el-icon>
                      查询
                    </el-button>
                    <el-button @click="resetQuestionSearch">
                      重置
                    </el-button>
                  </el-col>
                </el-row>
              </div>
              
              <div class="questions-list">
                <div 
                  v-for="question in userQuestions" 
                  :key="question.id"
                  class="question-item"
                >
                  <div class="question-main">
                    <h4 class="question-title">
                      <router-link :to="`/questions/${question.id}`">
                        {{ question.title || question.questionTitle || '无标题' }}
                      </router-link>
                    </h4>
                    <p class="question-description">{{ question.description || question.content || '无描述' }}</p>
                    <div class="question-meta">
                      <span class="question-author">
                        <el-icon><User /></el-icon>
                        {{ authStore.userInfo?.username || authStore.userInfo?.nickname || '匿名用户' }}
                      </span>
                      <span class="question-type">
                        <el-icon><Collection /></el-icon>
                        {{ question.questionType || '未分类' }}
                      </span>
                      <span class="question-course">
                        <el-icon><Reading /></el-icon>
                        {{ question.classBelong || '未分类' }}
                      </span>
                      <span class="question-solved">
                        <el-icon><SuccessFilled /></el-icon>
                        {{ question.isSolved === 1 ? '已解决' : '未解决' }}
                      </span>
                    </div>
                  </div>
                  <div class="question-actions">
                    <el-button size="small" @click="editQuestion(question)">编辑</el-button>
                    <el-button size="small" type="danger" @click="deleteQuestion(question)">
                      删除
                    </el-button>
                  </div>
                </div>
                
                <div v-if="userQuestions.length === 0" class="no-data">
                  <el-empty description="暂无提问记录">
                    <el-button type="primary" @click="askQuestion">去提问</el-button>
                  </el-empty>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 我的回答 -->
          <el-tab-pane label="我的回答" name="answers">
            <div class="tab-content">
              <div class="content-header">
                <h3>我的回答</h3>
              </div>
              
              <div class="answers-list">
                <div 
                  v-for="answer in userAnswers" 
                  :key="answer.id"
                  class="answer-item"
                >
                  <div class="answer-question">
                    <h4 class="question-title">
                      <router-link :to="`/questions/${answer.questionId}`">
                        {{ answer.questionTitle }}
                      </router-link>
                    </h4>
                  </div>
                  <div class="answer-content">
                    <p class="answer-text">{{ answer.content }}</p>
                    <div class="answer-meta">
                      <span class="answer-time">{{ formatTime(answer.createTime) }}</span>
                      <span class="answer-votes">
                        <el-icon><CaretTop /></el-icon>
                        {{ answer.upvotes }} 赞同
                      </span>
                      <span class="answer-accepted" v-if="answer.isAccepted">
                        <el-icon><SuccessFilled /></el-icon>
                        已采纳
                      </span>
                    </div>
                  </div>
                  <div class="answer-actions">
                    <el-button size="small" @click="editAnswer(answer)">编辑</el-button>
                    <el-button size="small" type="danger" @click="deleteAnswer(answer)">
                      删除
                    </el-button>
                  </div>
                </div>
                
                <div v-if="userAnswers.length === 0" class="no-data">
                  <el-empty description="暂无回答记录" />
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 我的资源 -->
          <el-tab-pane label="我的资源" name="resources">
            <div class="tab-content">
              <div class="content-header">
                <h3>我的资源</h3>
                <el-button type="primary" @click="uploadResource">
                  <el-icon><Plus /></el-icon>
                  上传资源
                </el-button>
              </div>
              
              <!-- 资源搜索筛选 -->
              <div class="search-filter">
                <el-row :gutter="20">
                  <el-col :span="6">
                    <el-input
                      v-model="resourceSearchTitle"
                      placeholder="搜索资源标题..."
                      prefix-icon="Search"
                      clearable
                    />
                  </el-col>
                  <el-col :span="6">
                    <el-input
                      v-model="resourceSearchDescription"
                      placeholder="搜索资源描述..."
                      prefix-icon="Document"
                      clearable
                    />
                  </el-col>
                  <el-col :span="6">
                    <el-select v-model="resourceSelectedCategory" placeholder="选择分类" clearable>
                      <el-option
                        v-for="category in resourceCategories"
                        :key="category.id"
                        :label="category.name"
                        :value="category.name"
                      />
                    </el-select>
                  </el-col>
                  <el-col :span="6">
                    <el-button type="primary" @click="handleResourceQuery" class="query-btn">
                      <el-icon><Search /></el-icon>
                      查询
                    </el-button>
                    <el-button @click="resetResourceSearch">
                      重置
                    </el-button>
                  </el-col>
                </el-row>
              </div>
               
               <div class="resources-list">
                 <!-- 加载状态 -->
                 <div v-if="loadingResources" class="loading-container">
                   <el-skeleton :rows="3" animated />
                 </div>
                 
                 <!-- 资源列表 -->
                 <template v-else>
                   <div 
                     v-for="resource in userResources" 
                     :key="resource.id"
                     class="resource-item"
                   >
                    <div class="resource-icon">
                      <el-icon><Document /></el-icon>
                    </div>
                    <div class="resource-info">
                      <h4 class="resource-title">
                        {{ resource.title }}
                      </h4>
                      <p class="resource-description">{{ resource.description }}</p>
                      <div class="resource-meta">
                        <span class="resource-time">
                          <el-icon><Clock /></el-icon>
                          {{ formatTime(resource.createTime || resource.createdAt) }}
                        </span>
                        <span class="resource-downloads">
                          <el-icon><Download /></el-icon>
                          {{ resource.downloadCount || 0 }} 下载
                        </span>
                        <el-tag size="small">{{ resource.classBelong || resource.category || '未分类' }}</el-tag>
                        <el-tag v-if="resource.fileType" size="small" type="info">{{ getFileTypeLabel(resource.fileType) }}</el-tag>
                      </div>
                    </div>
                    <div class="resource-actions">
                      <el-button size="small" @click="editResource(resource)">编辑</el-button>
                      <el-button size="small" type="danger" @click="deleteResource(resource)">
                        删除
                      </el-button>
                    </div>
                   </div>
                   
                   <div v-if="userResources.length === 0" class="no-data">
                     <el-empty description="暂无资源记录">
                       <el-button type="primary" @click="uploadResource">上传资源</el-button>
                     </el-empty>
                   </div>
                 </template>
               </div>
            </div>
          </el-tab-pane>


        </el-tabs>
      </div>
    </div>
    
    <!-- 账户设置对话框 -->
    <el-dialog
      v-model="settingsDialogVisible"
      title="账户设置"
      width="600px"
      :before-close="handleCloseDialog"
    >
      <el-form
        ref="settingsFormRef"
        :model="settingsForm"
        :rules="settingsRules"
        label-width="100px"
        label-position="left"
      >
        <el-form-item label="头像" prop="avatar">
          <div class="avatar-section">
            <el-avatar :size="80" :src="settingsForm.avatar" />
            <div class="avatar-actions">
              <el-upload
                action="/api/v1/Fileupload"
                :show-file-list="false"
                :before-upload="beforeAvatarUpload"
                :on-success="handleAvatarSuccess"
                :headers="uploadHeaders"
              >
                <el-button type="primary" size="small">更换头像</el-button>
              </el-upload>
              <el-button size="small" @click="resetAvatar">重置头像</el-button>
            </div>
          </div>
        </el-form-item>

        <el-form-item label="用户名" prop="username">
          <el-input v-model="settingsForm.username" placeholder="请输入用户名" />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="settingsForm.email" placeholder="请输入邮箱地址" />
        </el-form-item>

        <el-form-item label="手机号" prop="phonenumber">
          <el-input v-model="settingsForm.phonenumber" placeholder="请输入手机号" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input 
            v-model="settingsForm.password" 
            type="password" 
            placeholder="请输入密码" 
            show-password 
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="settingsForm.confirmPassword" 
            type="password" 
            placeholder="请确认密码" 
            show-password 
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseDialog">取消</el-button>
          <el-button type="primary" @click="saveSettings" :loading="savingSettings">
            保存
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 资源编辑对话框 -->
    <el-dialog
      v-model="editResourceDialogVisible"
      :title="editResourceForm.title ? '编辑资源：' + editResourceForm.title : '编辑资源'"
      width="700px"
      center
      :before-close="handleCloseEditDialog"
    >
      <div class="resource-edit-detail">
        <!-- 资源基本信息 -->
        <div class="detail-section">
          <h4>资源基本信息</h4>
          <el-form
            ref="editResourceFormRef"
            :model="editResourceForm"
            :rules="editResourceRules"
            label-width="100px"
            label-position="left"
          >
            <el-form-item label="资源标题" prop="title">
              <el-input v-model="editResourceForm.title" placeholder="请输入资源标题" />
            </el-form-item>

            <el-form-item label="资源描述" prop="description">
              <el-input 
                v-model="editResourceForm.description" 
                type="textarea" 
                :rows="3"
                placeholder="请输入资源描述" 
              />
            </el-form-item>

            <el-form-item label="所属课程" prop="classBelong">
              <el-select v-model="editResourceForm.classBelong" placeholder="请选择所属课程" clearable>
                <el-option
                  v-for="category in resourceCategories"
                  :key="category.id"
                  :label="category.name"
                  :value="category.name"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="文件类型" prop="fileType">
              <el-select v-model="editResourceForm.fileType" placeholder="请选择文件类型" clearable>
                <el-option label="PDF" value="pdf" />
                <el-option label="Word" value="doc" />
                <el-option label="PPT" value="ppt" />
                <el-option label="Excel" value="xls" />
                <el-option label="图片" value="image" />
                <el-option label="视频" value="video" />
                <el-option label="音频" value="audio" />
                <el-option label="压缩包" value="zip" />
                <el-option label="文本" value="txt" />
                <el-option label="其他" value="other" />
              </el-select>
            </el-form-item>

            <el-form-item label="标签" prop="tags">
              <el-input 
                v-model="editResourceForm.tags" 
                placeholder="请输入标签，多个标签用逗号分隔" 
              />
            </el-form-item>
          </el-form>
        </div>

        <!-- 文件上传区域 -->
        <div class="detail-section">
          <h4>文件管理</h4>
          <div class="file-management">
            <div class="current-file" v-if="editResourceForm.fileUrl">
              <div class="file-info">
                <span class="info-label">当前文件：</span>
                <span class="info-value">{{ editResourceForm.fileUrl }}</span>
              </div>
              <div class="file-actions">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="downloadCurrentFile"
                >
                  <el-icon><Download /></el-icon>
                  下载当前文件
                </el-button>
              </div>
            </div>
            
            <div class="upload-section">
              <p class="upload-tip">如需更新文件，请上传新文件（不选择文件则保留原文件）</p>
              <el-upload
                class="resource-upload"
                action="/api/v1/Fileupload"
                :show-file-list="false"
                :before-upload="beforeResourceUpload"
                :on-success="handleResourceUploadSuccess"
                :on-error="handleResourceUploadError"
                :headers="uploadHeaders"
              >
                <el-button type="success">
                  <el-icon><Upload /></el-icon>
                  上传新文件
                </el-button>
              </el-upload>
              <p class="upload-note">支持格式：PDF、Word、PPT、Excel、图片、视频、音频、压缩包等</p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseEditDialog">取消</el-button>
          <el-button type="primary" @click="saveResourceEdit" :loading="savingResource">
            保存修改
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 回答编辑对话框 -->
    <el-dialog
      v-model="editAnswerDialogVisible"
      title="编辑回答"
      width="700px"
      center
      :before-close="handleCloseAnswerDialog"
    >
      <div class="answer-edit-detail">
        <!-- 问题信息显示 -->
        <div class="detail-section">
          <h4>问题信息</h4>
          <div class="question-info">
            <div class="info-item">
              <label>问题标题：</label>
              <span class="question-title">{{ editAnswerForm.questionTitle }}</span>
            </div>
            <div class="info-item">
              <label>问题内容：</label>
              <div class="question-content">{{ editAnswerForm.questionContent }}</div>
            </div>
          </div>
        </div>

        <!-- 回答编辑表单 -->
        <div class="detail-section">
          <h4>回答内容</h4>
          <el-form
            ref="editAnswerFormRef"
            :model="editAnswerForm"
            :rules="answerRules"
            label-width="100px"
            label-position="left"
          >
            <el-form-item label="回答内容" prop="content">
              <el-input 
                v-model="editAnswerForm.content" 
                type="textarea" 
                :rows="6"
                placeholder="请输入您的回答内容" 
              />
            </el-form-item>
          </el-form>
        </div>

        <!-- 文件上传区域 -->
        <div class="detail-section">
          <h4>附件管理</h4>
          <div class="file-management">
            <div class="current-file" v-if="editAnswerForm.fileUrl">
              <div class="file-info">
                <span class="info-label">当前附件：</span>
                <span class="info-value">{{ editAnswerForm.fileUrl }}</span>
              </div>
              <div class="file-actions">
                <el-button 
                  type="primary" 
                  size="small" 
                  @click="downloadAnswerCurrentFile"
                >
                  <el-icon><Download /></el-icon>
                  下载当前附件
                </el-button>
              </div>
            </div>
            
            <div class="upload-section">
              <p class="upload-tip">如需更新附件，请上传新文件（不选择文件则保留原附件）</p>
              <el-upload
                class="answer-upload"
                action="/api/v1/Fileupload"
                :show-file-list="false"
                :before-upload="beforeAnswerFileUpload"
                :on-success="handleAnswerFileUploadSuccess"
                :on-error="handleAnswerFileUploadError"
                :headers="uploadHeaders"
              >
                <el-button type="success">
                  <el-icon><Upload /></el-icon>
                  上传新附件
                </el-button>
              </el-upload>
              <p class="upload-note">支持格式：PDF、Word、PPT、Excel、图片、视频、音频、压缩包等</p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseAnswerDialog">取消</el-button>
          <el-button type="primary" @click="saveAnswerEdit" :loading="savingAnswer">
            保存修改
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 提问编辑对话框 -->
    <el-dialog
      v-model="editQuestionDialogVisible"
      :title="editQuestionForm.title ? '编辑提问：' + editQuestionForm.title : '编辑提问'"
      width="700px"
      center
      :before-close="handleCloseQuestionDialog"
    >
      <div class="question-edit-detail">
        <!-- 问题基本信息 -->
        <div class="detail-section">
          <h4>问题基本信息</h4>
          <el-form
            ref="editQuestionFormRef"
            :model="editQuestionForm"
            :rules="editQuestionRules"
            label-width="100px"
            label-position="left"
          >
            <el-form-item label="问题标题" prop="title">
              <el-input v-model="editQuestionForm.title" placeholder="请输入问题标题" />
            </el-form-item>

            <el-form-item label="问题描述" prop="description">
              <el-input 
                v-model="editQuestionForm.description" 
                type="textarea" 
                :rows="4"
                placeholder="请输入问题描述" 
              />
            </el-form-item>

            <el-form-item label="问题类型" prop="questionType">
              <el-select v-model="editQuestionForm.questionType" placeholder="请选择问题类型" clearable>
                <el-option label="技术问题" value="技术问题" />
                <el-option label="学习疑问" value="学习疑问" />
                <el-option label="项目求助" value="项目求助" />
                <el-option label="bug调试" value="bug调试" />
                <el-option label="性能优化" value="性能优化" />
                <el-option label="架构设计" value="架构设计" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>

            <el-form-item label="所属课程" prop="classBelong">
              <el-select v-model="editQuestionForm.classBelong" placeholder="请选择所属课程" clearable>
                <el-option
                  v-for="course in questionCourses"
                  :key="course.id"
                  :label="course.name"
                  :value="course.name"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </div>

        <!-- 图片上传区域 -->
        <div class="detail-section">
          <h4>图片管理</h4>
          <div class="image-management">
            <div class="current-image" v-if="editQuestionForm.imageUrl">
              <div class="image-info">
                <span class="info-label">当前图片：</span>
                <span class="info-value">{{ editQuestionForm.imageUrl }}</span>
              </div>
              <div class="image-preview">
                <el-image 
                  :src="editQuestionForm.imageUrl" 
                  :preview-src-list="[editQuestionForm.imageUrl]"
                  fit="cover"
                  style="width: 100px; height: 100px;"
                >
                  <template #error>
                    <div class="image-error">图片加载失败</div>
                  </template>
                </el-image>
              </div>
            </div>
            
            <div class="upload-section">
              <p class="upload-tip">如需更新图片，请上传新图片（不选择图片则保留原图片）</p>
              <el-upload
                class="question-upload"
                action="/api/v1/Fileupload"
                :show-file-list="false"
                :before-upload="beforeQuestionImageUpload"
                :on-success="handleQuestionImageUploadSuccess"
                :on-error="handleQuestionImageUploadError"
                :headers="uploadHeaders"
              >
                <el-button type="success">
                  <el-icon><Upload /></el-icon>
                  上传新图片
                </el-button>
              </el-upload>
              <p class="upload-note">支持格式：JPG、PNG、GIF等图片格式</p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleCloseQuestionDialog">取消</el-button>
          <el-button type="primary" @click="saveQuestion" :loading="savingQuestion">
            保存修改
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
 import { ref, onMounted, computed } from 'vue'
 import { useRouter } from 'vue-router'
 import { useAuthStore } from '@/stores/auth'
 import { useResourcesStore } from '@/stores/resources'
 import apiService from '@/services/api'
 import { ElMessage, ElMessageBox } from 'element-plus'
 import { 
   Setting, Edit, Location, Message, Calendar, 
   QuestionFilled, ChatDotRound, Document, 
   Plus, View, Delete, Star, Collection, Search, Download, CaretTop, SuccessFilled, User, Reading, Clock,
   Folder, Upload, DataAnalysis
 } from '@element-plus/icons-vue'

 const router = useRouter()
 const authStore = useAuthStore()
 const resourcesStore = useResourcesStore()

 const activeTab = ref('questions')

 // 资源查询相关变量
 const resourceSearchTitle = ref('')
 const resourceSearchDescription = ref('')
 const resourceSelectedCategory = ref('')
 const resourceCategories = ref([])
 const loadingCourses = ref(false)
 const loadingResources = ref(false)

 // 资源编辑相关变量
 const editResourceDialogVisible = ref(false)
 const savingResource = ref(false)
 const editResourceFormRef = ref()
 const editResourceForm = ref({
   id: '',
   title: '',
   description: '',
   classBelong: '',
   fileType: '',
   tags: '',
   fileUrl: ''
 })
 const editResourceRules = ref({
   title: [
     { required: true, message: '请输入资源标题', trigger: 'blur' }
   ],
   description: [
     { required: true, message: '请输入资源描述', trigger: 'blur' }
   ],
   fileType: [
     { required: true, message: '请选择文件类型', trigger: 'change' }
   ],
   fileUrl: [
     // 移除必填验证，因为用户可以选择上传新文件
     { message: '请输入下载链接', trigger: 'blur' }
   ]
 })

 // 用户信息
 const userInfo = ref({
   username: '',
   nickname: '',
   avatar: '',
   bio: '',
   location: '',
   email: '',
   role: '',
   isOnline: false,
   joinDate: '',
   skills: []
 })

 // 用户统计数据
 const userStats = ref({
   questions: 0,
   resources: 0
 })

 // 用户内容数据
 const userQuestions = ref([])
 const userAnswers = ref([])
 const userResources = ref([])
 const recentActivities = ref([])
 
 // 提问查询相关数据
 const questionSearchTitle = ref('')
 const questionSearchContent = ref('')
 const questionSelectedCourse = ref('')
 const questionCourses = ref([
   { id: 1, name: '计算机科学' },
   { id: 2, name: '软件工程' },
   { id: 3, name: '人工智能' },
   { id: 4, name: '数据科学' },
   { id: 5, name: '网络安全' }
 ])
 const loadingQuestions = ref(false)

 // 提问编辑对话框
 const editQuestionDialogVisible = ref(false)
 const editQuestionFormRef = ref()
 const savingQuestion = ref(false)
 const editQuestionForm = ref({
   id: '',
   title: '',
   description: '',
   questionType: '',
   classBelong: '',
   imageUrl: ''
 })
 // 新上传的图片URL
 const newQuestionImageUrl = ref('')
 const editQuestionRules = ref({
   title: [
     { required: true, message: '请输入问题标题', trigger: 'blur' },
     { min: 5, max: 100, message: '标题长度在 5 到 100 个字符', trigger: 'blur' }
   ],
   description: [
     { required: true, message: '请输入问题描述', trigger: 'blur' },
     { min: 10, message: '问题描述不能少于 10 个字符', trigger: 'blur' }
   ],
   questionType: [
     { required: true, message: '请输入问题类型', trigger: 'blur' }
   ],
   classBelong: [
     { required: true, message: '请选择所属课程', trigger: 'change' }
   ]
 })

 // 账户设置对话框
 const settingsDialogVisible = ref(false)
 const settingsFormRef = ref()
 const savingSettings = ref(false)
 const settingsForm = ref({
   username: '',
   email: '',
   phonenumber: '',
   password: '',
   confirmPassword: '',
   avatar: ''
 })

 // 表单验证规则
 const settingsRules = ref({
   username: [
     { required: true, message: '请输入用户名', trigger: 'blur' },
     { min: 2, max: 20, message: '用户名长度在 2 到 20 个字符', trigger: 'blur' }
   ],
   email: [
     { required: true, message: '请输入邮箱地址', trigger: 'blur' },
     { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
   ],
   phonenumber: [
     { required: true, message: '请输入手机号', trigger: 'blur' },
     { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
   ],
   password: [
     { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
   ],
   confirmPassword: [
     {
       validator: (rule, value, callback) => {
         if (value && value !== settingsForm.value.password) {
           callback(new Error('两次输入密码不一致'))
         } else {
           callback()
         }
       },
       trigger: 'blur'
     }
   ]
 })

 // 上传配置
 const uploadHeaders = ref({
   Authorization: `Bearer ${localStorage.getItem('token')}`
 })
 
 // 新上传的文件URL
 const newFileUrl = ref('')
 
 // 回答编辑相关变量
 const editAnswerDialogVisible = ref(false)
 const editAnswerFormRef = ref()
 const savingAnswer = ref(false)
 const editAnswerForm = ref({
   id: '',
   content: '',
   questionTitle: '',
   questionContent: '',
   fileUrl: ''
 })
 
 // 新上传的文件URL（回答附件）
 const newAnswerFileUrl = ref('')
 
 // 回答表单验证规则
 const answerRules = ref({
   content: [
     { required: true, message: '请输入回答内容', trigger: 'blur' },
     { min: 10, message: '回答内容不能少于10个字符', trigger: 'blur' }
   ]
 })
 
 // 回答文件上传前验证
 const beforeAnswerFileUpload = (file) => {
   const allowedTypes = [
     'application/pdf',
     'application/msword',
     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
     'application/vnd.ms-powerpoint',
     'application/vnd.openxmlformats-officedocument.presentationml.presentation',
     'application/vnd.ms-excel',
     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
     'image/jpeg',
     'image/png',
     'image/gif',
     'video/mp4',
     'audio/mpeg',
     'application/zip',
     'application/x-rar-compressed',
     'text/plain'
   ]
   
   const isAllowed = allowedTypes.includes(file.type)
   const isLt10M = file.size / 1024 / 1024 < 10
   
   if (!isAllowed) {
     ElMessage.error('不支持的文件格式！')
     return false
   }
   if (!isLt10M) {
     ElMessage.error('文件大小不能超过 10MB！')
     return false
   }
   return true
 }
 
 // 回答文件上传成功处理
 const handleAnswerFileUploadSuccess = (response, file) => {
   ElMessage.success('附件上传成功！')
   newAnswerFileUrl.value = response.data || response.url || file.response?.url
 }
 
 // 回答文件上传失败处理
 const handleAnswerFileUploadError = (error, file) => {
   console.error('附件上传失败:', error)
   ElMessage.error('附件上传失败，请重试')
 }
 
 // 下载回答当前附件
 const downloadAnswerCurrentFile = () => {
   if (editAnswerForm.value.fileUrl) {
     const link = document.createElement('a')
     link.href = editAnswerForm.value.fileUrl
     link.download = `answer_attachment_${editAnswerForm.value.id}`
     link.click()
   } else {
     ElMessage.warning('没有可下载的附件')
   }
 }
 
 // 资源上传前验证
 const beforeResourceUpload = (file) => {
   const allowedTypes = [
     'application/pdf',
     'application/msword',
     'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
     'application/vnd.ms-powerpoint',
     'application/vnd.openxmlformats-officedocument.presentationml.presentation',
     'application/vnd.ms-excel',
     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
     'image/jpeg',
     'image/png',
     'image/gif',
     'video/mp4',
     'audio/mpeg',
     'application/zip',
     'application/x-rar-compressed',
     'text/plain'
   ]
   
   const isAllowed = allowedTypes.includes(file.type)
   const isLt10M = file.size / 1024 / 1024 < 10
   
   if (!isAllowed) {
     ElMessage.error('不支持的文件格式！')
     return false
   }
   if (!isLt10M) {
     ElMessage.error('文件大小不能超过 10MB！')
     return false
   }
   return true
 }
 
 // 资源上传成功处理
 const handleResourceUploadSuccess = (response, file) => {
   ElMessage.success('文件上传成功！')
   newFileUrl.value = response.data || response.url || file.response?.url
 }
 
 // 资源上传失败处理
 const handleResourceUploadError = (error, file) => {
   console.error('文件上传失败:', error)
   ElMessage.error('文件上传失败，请重试')
 }
 
 // 提问图片上传前验证
 const beforeQuestionImageUpload = (file) => {
   const allowedTypes = [
     'image/jpeg',
     'image/png',
     'image/gif',
     'image/webp'
   ]
   
   const isAllowed = allowedTypes.includes(file.type)
   const isLt5M = file.size / 1024 / 1024 < 5
   
   if (!isAllowed) {
     ElMessage.error('只支持JPG、PNG、GIF、WebP格式的图片！')
     return false
   }
   if (!isLt5M) {
     ElMessage.error('图片大小不能超过 5MB！')
     return false
   }
   return true
 }
 
 // 提问图片上传成功处理
 const handleQuestionImageUploadSuccess = (response, file) => {
   ElMessage.success('图片上传成功！')
   newQuestionImageUrl.value = response.data || response.url || file.response?.url
 }
 
 // 提问图片上传失败处理
 const handleQuestionImageUploadError = (error, file) => {
   console.error('图片上传失败:', error)
   ElMessage.error('图片上传失败，请重试')
 }
 
 // 下载当前文件
 const downloadCurrentFile = () => {
   if (editResourceForm.value.fileUrl) {
     const link = document.createElement('a')
     link.href = editResourceForm.value.fileUrl
     link.download = editResourceForm.value.title || 'resource'
     link.click()
   } else {
     ElMessage.warning('没有可下载的文件')
   }
 }
 
 // 获取用户角色显示文本
 const getUserRoleText = (role) => {
   const roleMap = {
     'student': '学生',
     'teacher': '教师', 
     'admin': '管理员'
   }
   return roleMap[role] || '社区成员'
 }

 // 格式化加入日期
 const formatJoinDate = (date) => {
   if (!date) return '未知'
   return new Date(date).toLocaleDateString('zh-CN')
 }

 // 获取文件类型标签
 const getFileTypeLabel = (fileType) => {
   const labels = {
     pdf: 'PDF',
     doc: 'Word',
     docx: 'Word',
     ppt: 'PPT',
     pptx: 'PPT',
     xls: 'Excel',
     xlsx: 'Excel',
     image: '图片',
     jpg: '图片',
     png: '图片',
     gif: '图片',
     video: '视频',
     mp4: '视频',
     audio: '音频',
     mp3: '音频',
     zip: '压缩包',
     rar: '压缩包',
     txt: '文本',
     other: '其他'
   }
   return labels[fileType.toLowerCase()] || fileType
 }

 // 获取问题状态类型（用于标签颜色）
 const getQuestionStatusType = (status) => {
   const typeMap = {
     'pending': 'warning',
     'answered': 'success',
     'resolved': 'info',
     'closed': 'danger'
   }
   return typeMap[status] || 'info'
 }

 // 获取问题状态标签文本
 const getQuestionStatusLabel = (status) => {
   const labelMap = {
     'pending': '待回答',
     'answered': '已回答',
     'resolved': '已解决',
     'closed': '已关闭'
   }
   return labelMap[status] || status
 }



 // 加载用户信息
 const loadUserInfo = async () => {
   try {
     console.log('开始加载用户信息...')
     
     // 使用认证存储中的用户信息
     if (authStore.userInfo) {
       userInfo.value = {
         ...authStore.userInfo,
         username: authStore.userInfo.username || '',
         nickname: authStore.userInfo.nickname || authStore.userInfo.username || '',
         avatar: authStore.userInfo.avatar || authStore.userInfo.imageUrl || '',
         bio: authStore.userInfo.bio || '',
         location: authStore.userInfo.location || '',
         email: authStore.userInfo.email || '',
         role: authStore.userInfo.role || 'student',
         isOnline: authStore.userInfo.isOnline || true,
         joinDate: authStore.userInfo.joinDate || authStore.userInfo.createTime || new Date().toISOString(),
         skills: authStore.userInfo.skills || []
       }
       console.log('从认证存储加载用户信息成功:', userInfo.value)
     } else {
       // 如果认证存储中没有用户信息，尝试从API获取
       try {
         const response = await fetch('/api/v1/user/findInfo', {
           method: 'GET',
           headers: {
             'Authorization': `Bearer ${localStorage.getItem('token')}`,
             'Content-Type': 'application/json'
           }
         })
         
         if (response.ok) {
           const result = await response.json()
           if (result.code === 1 && result.data) {
             userInfo.value = {
               ...result.data,
               username: result.data.username || '',
               nickname: result.data.nickname || result.data.username || '',
               avatar: result.data.avatar || result.data.imageUrl || '',
               bio: result.data.bio || '',
               location: result.data.location || '',
               email: result.data.email || '',
               role: result.data.role || 'student',
               isOnline: result.data.isOnline || true,
               joinDate: result.data.joinDate || result.data.createTime || new Date().toISOString(),
               skills: result.data.skills || []
             }
             console.log('从API加载用户信息成功:', userInfo.value)
           } else {
             console.warn('用户信息接口返回失败:', result.msg)
             // 使用默认数据
             userInfo.value = {
               username: '未知用户',
               nickname: '未知用户',
               avatar: '',
               bio: '',
               location: '',
               email: '',
               role: 'student',
               isOnline: true,
               joinDate: new Date().toISOString(),
               skills: []
             }
           }
         } else {
           throw new Error(`HTTP error! status: ${response.status}`)
         }
       } catch (error) {
         console.error('从API加载用户信息失败:', error)
         // 使用默认数据
         userInfo.value = {
           username: '未知用户',
           nickname: '未知用户',
           avatar: '',
           bio: '',
           location: '',
           email: '',
           role: 'student',
           isOnline: true,
           joinDate: new Date().toISOString(),
           skills: []
         }
       }
     }
   } catch (error) {
     console.error('加载用户信息失败:', error)
     ElMessage.error('加载用户信息失败，请重试')
   }
 }







 // 加载用户数据
 const loadUserData = async () => {
   try {
     console.log('开始加载用户数据...')
     
     // 按顺序加载数据
     await loadUserInfo()
     await loadUserQuestions()
     await loadUserResources()
     await loadUserAnswers()
     await fetchUserStats()
     await loadRecentActivities()
     
     console.log('用户数据加载完成')
   } catch (error) {
     console.error('加载用户数据失败:', error)
     ElMessage.error('加载用户数据失败，请重试')
   }
 }

 // 组件挂载时加载数据
 onMounted(() => {
   console.log('Profile组件挂载，开始加载数据...')
   loadUserData()
 })

 // 获取技能标签文本
 const getSkillLabel = (skill) => {
   const skillMap = {
     'frontend': '前端开发',
     'backend': '后端开发',
     'mobile': '移动开发',
     'database': '数据库',
     'devops': '运维部署',
     'ai': '人工智能',
     'bigdata': '大数据',
     'security': '网络安全',
     'design': 'UI设计',
     'testing': '软件测试'
   }
   return skillMap[skill] || skill
 }

 // 导航方法
 const askQuestion = () => {
   router.push('/questions/ask')
 }

 const uploadResource = () => {
   router.push('/resources/upload')
 }

 // 内容操作方法

 const deleteQuestion = async (question) => {
   try {
     await ElMessageBox.confirm('确定要删除这个问题吗？删除后无法恢复', '确认删除', {
       type: 'warning',
       confirmButtonText: '确定删除',
       cancelButtonText: '取消'
     })
     
     // 调用DELETE接口删除问题
     const response = await fetch(`/api/v1/question/${question.id}`, {
       method: 'DELETE',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${authStore.token}`
       }
     })
     
     const result = await response.json()
     
     if (result.code === 1) {
       ElMessage.success('问题删除成功')
       
       // 从列表中移除已删除的问题
       const index = userQuestions.value.findIndex(q => q.id === question.id)
       if (index !== -1) {
         userQuestions.value.splice(index, 1)
       }
       
       // 更新统计数据
       userStats.value.questions = Math.max(0, userStats.value.questions - 1)
     } else {
       ElMessage.error(result.message || '删除失败')
     }
   } catch (error) {
     console.error('删除问题失败:', error)
     ElMessage.error('删除失败，请稍后重试')
   }
 }

 // 编辑回答
 const editAnswer = async (answer) => {
   try {
     console.log('开始获取回答详情，回答ID:', answer.id)
     
     // 调用GET /api/v1/answer/{id}接口获取回答详情
     const response = await fetch(`/api/v1/answer/${answer.id}`)
     
     if (!response.ok) {
       throw new Error(`获取回答详情失败! status: ${response.status}`)
     }
     
     const result = await response.json()
     console.log('回答详情接口响应:', result)
     
     if (result.code === 1 && result.data) {
       const answerData = result.data
       
       // 填充编辑表单
       editAnswerForm.value = {
         id: answerData.id,
         content: answerData.content || '',
         questionTitle: answerData.questionTitle || '未命名问题',
         questionContent: answerData.questionContent || '暂无问题内容',
         fileUrl: answerData.fileUrl || ''
       }
       
       // 重置新上传的文件URL
       newAnswerFileUrl.value = ''
       
       // 如果回答详情中没有问题标题和内容，尝试通过questionId获取问题信息
       if (!answerData.questionTitle && answerData.questionId) {
         try {
           const questionResponse = await fetch(`/api/v1/question/${answerData.questionId}`)
           
           if (questionResponse.ok) {
             const questionResult = await questionResponse.json()
             
             if (questionResult.code === 1 && questionResult.data) {
               const questionData = questionResult.data
               editAnswerForm.value.questionTitle = questionData.title || questionData.questionTitle || '未命名问题'
               editAnswerForm.value.questionContent = questionData.content || questionData.questionContent || '暂无问题内容'
             }
           }
         } catch (error) {
           console.warn('获取问题信息失败:', error)
         }
       }
       
       // 显示编辑对话框
       editAnswerDialogVisible.value = true
       console.log('回答编辑表单已填充:', editAnswerForm.value)
     } else {
       ElMessage.error('获取回答详情失败: ' + (result.msg || '未知错误'))
     }
   } catch (error) {
     console.error('编辑回答失败:', error)
     ElMessage.error('获取回答详情失败，请重试')
   }
 }

 // 保存回答编辑
 const saveAnswerEdit = async () => {
   try {
     // 表单验证
     if (!editAnswerFormRef.value) return
     
     const valid = await editAnswerFormRef.value.validate()
     if (!valid) return
     
     savingAnswer.value = true
     
     // 构建更新数据，将数据写入请求体
     const updateData = {
       id: editAnswerForm.value.id,
       content: editAnswerForm.value.content,
       // 如果上传了新文件，使用新文件URL，否则保留原文件URL
       fileUrl: newAnswerFileUrl.value || editAnswerForm.value.fileUrl
       // 可以根据需要添加其他字段
     }
     
     console.log('发送回答更新请求:', updateData)
     
     // 调用PUT /api/v1/answer接口更新回答
     const response = await fetch('/api/v1/answer', {
       method: 'PUT',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${authStore.token}`
       },
       body: JSON.stringify(updateData)
     })
     
     console.log('回答更新响应:', response)
     
     if (!response.ok) {
       throw new Error(`回答更新失败! status: ${response.status}`)
     }
     
     const result = await response.json()
     console.log('回答更新接口响应:', result)
     
     if (result.code === 1) {
       ElMessage.success('回答更新成功')
       
       // 刷新回答列表
       await loadUserAnswers()
       
       // 关闭对话框
       handleCloseAnswerDialog()
     } else {
       ElMessage.error('回答更新失败: ' + (result.msg || '未知错误'))
     }
   } catch (error) {
     console.error('保存回答编辑失败:', error)
     ElMessage.error('保存失败，请重试')
   } finally {
     savingAnswer.value = false
   }
 }

 // 关闭回答编辑对话框
 const handleCloseAnswerDialog = () => {
   editAnswerDialogVisible.value = false
   editAnswerFormRef.value?.resetFields()
   // 重置表单数据
   editAnswerForm.value = {
     id: '',
     content: '',
     questionTitle: '',
     questionContent: '',
     fileUrl: ''
   }
   // 重置新上传的文件URL
   newAnswerFileUrl.value = ''
 }

 const deleteAnswer = async (answer) => {
   try {
     await ElMessageBox.confirm('确定要删除这个回答吗？删除后无法恢复', '确认删除', {
       type: 'warning',
       confirmButtonText: '确定删除',
       cancelButtonText: '取消'
     })
     
     // 调用DELETE /api/v1/answer/{id}接口删除回答
     const response = await fetch(`/api/v1/answer/${answer.id}`, {
       method: 'DELETE',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${authStore.token}`
       }
     })
     
     const result = await response.json()
     
     if (result.code === 1) {
       ElMessage.success('回答删除成功')
       
       // 从列表中移除已删除的回答
       const index = userAnswers.value.findIndex(a => a.id === answer.id)
       if (index !== -1) {
         userAnswers.value.splice(index, 1)
       }
       
       // 更新统计数据
       userStats.value.answers = Math.max(0, userStats.value.answers - 1)
     } else {
       ElMessage.error(result.message || '删除失败')
     }
   } catch (error) {
     console.error('删除回答失败:', error)
     ElMessage.error('删除失败，请稍后重试')
   }
 }

 const editResource = async (resource) => {
   try {
     // 先调用查询接口获取资源详情
     const response = await apiService.resources.get(resource.id)
     
     if (response.success && response.data?.code === 1) {
       const resourceData = response.data.data
       editResourceForm.value = {
         id: resourceData.id,
         title: resourceData.title,
         description: resourceData.description,
         classBelong: resourceData.classBelong,
         fileType: resourceData.fileType,
         tags: resourceData.tags,
         fileUrl: resourceData.fileUrl
       }
     } else {
       // 如果查询失败，使用传入的资源数据
       editResourceForm.value = {
         id: resource.id || '',
         title: resource.title || '',
         description: resource.description || '',
         classBelong: resource.classBelong || resource.category || '',
         fileType: resource.fileType || '',
         tags: resource.tags || '',
         fileUrl: resource.fileUrl || ''
       }
       ElMessage.warning('获取资源详情失败，使用现有数据')
     }
   } catch (error) {
     console.error('获取资源详情失败:', error)
     // 出错时使用传入的资源数据
     editResourceForm.value = {
       id: resource.id || '',
       title: resource.title || '',
       description: resource.description || '',
       classBelong: resource.classBelong || resource.category || '',
       fileType: resource.fileType || '',
       tags: resource.tags || '',
       fileUrl: resource.fileUrl || ''
     }
     ElMessage.error('获取资源详情失败')
   }
   
   // 显示编辑对话框
   editResourceDialogVisible.value = true
 }

 // 关闭编辑对话框
 const handleCloseEditDialog = () => {
   editResourceDialogVisible.value = false
   editResourceFormRef.value?.resetFields()
   // 重置新文件URL
   newFileUrl.value = ''
 }

 // 保存资源编辑
 const saveResourceEdit = async () => {
   try {
     // 表单验证
     if (!editResourceFormRef.value) return
     
     const valid = await editResourceFormRef.value.validate()
     if (!valid) return
     
     savingResource.value = true
     
     // 构建更新数据
     const updateData = {
       id: editResourceForm.value.id, // 添加ID到请求体
       title: editResourceForm.value.title,
       description: editResourceForm.value.description,
       classBelong: editResourceForm.value.classBelong,
       fileType: editResourceForm.value.fileType,
       tags: editResourceForm.value.tags,
       // 如果上传了新文件，使用新文件URL，否则保留原文件URL
       fileUrl: newFileUrl.value || editResourceForm.value.fileUrl
     }
     
     console.log('发送更新请求:', {
       id: editResourceForm.value.id,
       data: updateData
     })
     
     // 调用更新API - 正确的调用方式：传递包含ID的完整数据对象
    const response = await apiService.resources.update(updateData)
     
     console.log('更新响应:', response)
     
     if (response.success && response.data?.code === 1) {
       ElMessage.success('资源更新成功')
       
       // 重置新文件URL
       newFileUrl.value = ''
       
       // 刷新资源列表
       await loadUserResources()
       
       // 关闭对话框
       handleCloseEditDialog()
     } else {
       ElMessage.error('资源更新失败: ' + (response.data?.msg || '未知错误'))
     }
   } catch (error) {
     console.error('保存资源编辑失败:', error)
     ElMessage.error('保存失败，请重试')
   } finally {
     savingResource.value = false
   }
 }

 const deleteResource = async (resource) => {
   try {
     await ElMessageBox.confirm('确定要删除这个资源吗？', '确认删除', {
       type: 'warning'
     })
     
     // 调用API删除资源
     const result = await apiService.resources.delete(resource.id)
     
     if (result.success) {
       ElMessage.success('资源删除成功')
       // 从列表中移除已删除的资源
       userResources.value = userResources.value.filter(r => r.id !== resource.id)
       // 更新用户统计数据
       if (userStats.value.resources > 0) {
         userStats.value.resources--
       }
     } else {
       ElMessage.error('删除失败: ' + (result.error || '未知错误'))
     }
   } catch (error) {
     if (error !== 'cancel') {
       console.error('删除资源失败:', error)
       ElMessage.error('删除失败，请重试')
     }
   }
 }

 // 提问查询方法
 const handleQuestionQuery = async () => {
   loadingQuestions.value = true
   try {
     // 构建搜索参数
     const searchParams = {}
     
     // 默认包含当前用户的ID作为authorId字段
     if (authStore.userInfo?.id) {
       searchParams.authorId = authStore.userInfo.id
     }
     
     // 添加其他搜索条件
     if (questionSearchTitle.value) {
       searchParams.title = questionSearchTitle.value
     }
     if (questionSearchContent.value) {
       searchParams.content = questionSearchContent.value
     }
     if (questionSelectedCourse.value) {
       searchParams.classBelong = questionSelectedCourse.value
     }
     
     console.log('我的提问查询参数:', searchParams)
     
     // 调用提问查询API
     const response = await apiService.questions.findByItem(searchParams)
     console.log('我的提问查询响应:', response)
     
     // 与资源查询保持一致的处理逻辑
     if (response.success && response.data?.code === 1) {
       userQuestions.value = response.data.data || []
       console.log('设置userQuestions:', userQuestions.value)
       ElMessage.success(`查询到 ${userQuestions.value.length} 个提问`)
     } else {
       console.error('查询失败，响应:', response)
       ElMessage.error('查询提问失败')
       userQuestions.value = []
     }
   } catch (error) {
     console.error('查询我的提问失败:', error)
     ElMessage.error('查询提问失败')
     userQuestions.value = []
   } finally {
     loadingQuestions.value = false
   }
 }

 const resetQuestionSearch = () => {
   questionSearchTitle.value = ''
   questionSearchContent.value = ''
   questionSelectedCourse.value = ''
   handleQuestionQuery()
 }

 // 加载用户提问数据（默认查询当前用户的提问）
 const loadUserQuestions = async () => {
   loadingQuestions.value = true
   try {
     // 默认查询当前用户的提问
     const searchParams = {}
     if (authStore.userInfo?.id) {
       searchParams.authorId = authStore.userInfo.id
     }
     
     console.log('加载我的提问参数:', searchParams)
     
     const response = await apiService.questions.findByItem(searchParams)
     console.log('我的提问加载响应:', response)
     
     // 与loadUserResources保持一致的处理逻辑
     if (response.success && response.data?.code === 1) {
       userQuestions.value = response.data.data || []
     } else {
       console.warn('加载我的提问失败，使用默认数据')
       // 保持默认的模拟数据
     }
   } catch (error) {
     console.error('加载我的提问失败:', error)
     // 保持默认的模拟数据
   } finally {
     loadingQuestions.value = false
   }
 }

 // 资源查询方法
 const handleResourceQuery = async () => {
   loadingResources.value = true
   try {
     // 构建搜索参数，套用资源中心的查询功能
     const searchParams = {}
     
     // 默认包含当前用户的username作为uploaderName字段
     if (authStore.userInfo?.username) {
       searchParams.uploaderName = authStore.userInfo.username
     }
     
     // 添加其他搜索条件
     if (resourceSearchTitle.value) {
       searchParams.title = resourceSearchTitle.value
     }
     if (resourceSearchDescription.value) {
       searchParams.description = resourceSearchDescription.value
     }
     if (resourceSelectedCategory.value) {
       searchParams.classBelong = resourceSelectedCategory.value
     }
     
     console.log('我的资源查询参数:', searchParams)
     
     // 调用资源中心的查询API
     const response = await apiService.resources.findByItem(searchParams)
     console.log('我的资源查询响应:', response)
     
     if (response.success && response.data?.code === 1) {
       userResources.value = response.data.data || []
       ElMessage.success(`查询到 ${userResources.value.length} 个资源`)
     } else {
       ElMessage.error('查询资源失败')
       userResources.value = []
     }
   } catch (error) {
     console.error('查询我的资源失败:', error)
     ElMessage.error('查询资源失败')
     userResources.value = []
   } finally {
     loadingResources.value = false
   }
 }

 const resetResourceSearch = () => {
   resourceSearchTitle.value = ''
   resourceSearchDescription.value = ''
   resourceSelectedCategory.value = ''
   handleResourceQuery()
 }

 // 加载用户资源数据（默认查询当前用户的资源）
 const loadUserResources = async () => {
   loadingResources.value = true
   try {
     // 默认查询当前用户的资源
     const searchParams = {}
     if (authStore.userInfo?.username) {
       searchParams.uploaderName = authStore.userInfo.username
     }
     
     console.log('加载我的资源参数:', searchParams)
     
     const response = await apiService.resources.findByItem(searchParams)
     console.log('我的资源加载响应:', response)
     
     if (response.success && response.data?.code === 1) {
       userResources.value = response.data.data || []
     } else {
       console.warn('加载我的资源失败，使用默认数据')
       // 保持默认的模拟数据
     }
   } catch (error) {
     console.error('加载我的资源失败:', error)
     // 保持默认的模拟数据
   } finally {
     loadingResources.value = false
   }
 }

 // 显示账户设置对话框
 const showSettingsDialog = async () => {
   try {
     // 获取当前用户ID
     const currentUser = authStore.userInfo
     if (!currentUser || !currentUser.id) {
       ElMessage.error('用户信息获取失败')
       return
     }

     // 调用后端接口查询用户信息
     const response = await fetch(`/api/v1/user/findInfo/${currentUser.id}`)
     if (!response.ok) {
       throw new Error('获取用户信息失败')
     }

     const result = await response.json()
     if (result.code === 1) {
       // 填充表单数据
       settingsForm.value = {
         username: result.data.username || '',
         email: result.data.email || '',
         phonenumber: result.data.phonenumber || '',
         password: '',
         confirmPassword: '',
         avatar: result.data.imageUrl || ''
       }
       
       // 更新用户信息显示
       userInfo.value.avatar = result.data.imageUrl || ''
       userInfo.value.username = result.data.username || ''
       userInfo.value.email = result.data.email || ''
       
       settingsDialogVisible.value = true
     } else {
       ElMessage.error(result.msg || '获取用户信息失败')
     }
   } catch (error) {
     console.error('获取用户信息失败:', error)
     ElMessage.error('获取用户信息失败')
   }
 }

 // 关闭对话框
 const handleCloseDialog = () => {
   settingsDialogVisible.value = false
   settingsFormRef.value?.resetFields()
 }

 // 头像上传前验证
 const beforeAvatarUpload = (file) => {
   const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
   const isLt5M = file.size / 1024 / 1024 < 5

   if (!isJPG) {
     ElMessage.error('头像只能是 JPG 或 PNG 格式!')
     return false
   }
   if (!isLt5M) {
     ElMessage.error('头像大小不能超过 5MB!')
     return false
   }
   return true
 }

 // 头像上传成功处理
 const handleAvatarSuccess = (response) => {
   console.log('头像上传响应:', response) // 添加日志
   if (response && response.data) {
     // 尝试不同的数据结构
     const avatarUrl = response.data.url || response.data.imageUrl || response.data
     if (avatarUrl) {
       settingsForm.value.avatar = avatarUrl
       userInfo.value.avatar = avatarUrl
       ElMessage.success('头像上传成功!')
       console.log('设置头像URL:', avatarUrl)
     } else {
       ElMessage.error('头像URL获取失败')
     }
   } else {
     ElMessage.error('头像上传失败，响应数据为空')
   }
 }

 // 重置头像
 const resetAvatar = () => {
   settingsForm.value.avatar = ''
   userInfo.value.avatar = ''
   ElMessage.info('头像已重置')
 }

 // 保存设置
 const saveSettings = async () => {
   if (!settingsFormRef.value) return

   try {
     const valid = await settingsFormRef.value.validate()
     if (!valid) return

     savingSettings.value = true

     // 检查用户ID是否存在
     if (!authStore.userInfo?.id) {
       ElMessage.error('用户ID不存在，请重新登录')
       savingSettings.value = false
       return
     }

     // 构建更新数据
     const updateData = {
       id: authStore.userInfo.id,
       username: settingsForm.value.username,
       email: settingsForm.value.email,
       phonenumber: settingsForm.value.phonenumber
     }

     // 如果有密码，添加密码字段
     if (settingsForm.value.password) {
       updateData.password = settingsForm.value.password
     }

     // 如果有头像，添加头像字段
     if (settingsForm.value.avatar) {
       updateData.imageUrl = settingsForm.value.avatar
     }

     // 调试日志：打印请求体和用户信息
     console.log('发送更新请求，用户ID:', authStore.userInfo.id)
     console.log('请求体数据:', updateData)

     // 调用后端更新接口
     const response = await fetch('/api/v1/user', {
       method: 'PUT',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${localStorage.getItem('token')}`
       },
       body: JSON.stringify(updateData)
     })

     if (!response.ok) {
       throw new Error('更新用户信息失败')
     }

     const result = await response.json()
     if (result.code === 1) {
       ElMessage.success('用户信息更新成功!')
       
       // 更新本地存储的用户信息 - 直接更新authStore的user值
       const updatedUserInfo = {
         ...authStore.userInfo,
         username: updateData.username,
         email: updateData.email,
         imageUrl: updateData.imageUrl
       }
       
       // 直接更新store中的user值
       authStore.user = updatedUserInfo
       localStorage.setItem('user', JSON.stringify(updatedUserInfo))
       
       // 更新页面显示
       userInfo.value.username = updateData.username
       userInfo.value.email = updateData.email
       userInfo.value.avatar = updateData.imageUrl || ''
       
       handleCloseDialog()
     } else {
       ElMessage.error(result.msg || '更新用户信息失败')
     }
   } catch (error) {
     console.error('保存设置失败:', error)
     ElMessage.error('保存设置失败')
   } finally {
     savingSettings.value = false
   }
 }

 // 加载课程数据
 const loadCourses = async () => {
   loadingCourses.value = true
   try {
     const response = await apiService.courses.list()
     if (response.success && response.data?.code === 1) {
       // 将课程数据转换为分类选项格式
       const realCourses = (response.data.data || []).map(course => ({
         id: course.id,
         name: course.title
       }))
       resourceCategories.value = realCourses
       questionCourses.value = realCourses // 同时更新提问的课程列表
     } else {
       // 如果API调用失败，使用默认的课程列表
       const defaultCourses = [
         { id: 1, name: '高等数学' },
         { id: 2, name: '线性代数' },
         { id: 3, name: '概率论与数理统计' },
         { id: 4, name: '大学物理' },
         { id: 5, name: 'C语言程序设计' },
         { id: 6, name: '数据结构' },
         { id: 7, name: '操作系统' },
         { id: 8, name: '计算机网络' }
       ]
       resourceCategories.value = defaultCourses
       questionCourses.value = defaultCourses // 同时更新提问的课程列表
     }
   } catch (error) {
     console.error('加载课程数据失败:', error)
     // 使用默认的课程列表
     const defaultCourses = [
       { id: 1, name: '高等数学' },
       { id: 2, name: '线性代数' },
       { id: 3, name: '概率论与数理统计' },
       { id: 4, name: '大学物理' },
       { id: 5, name: 'C语言程序设计' },
       { id: 6, name: '数据结构' },
       { id: 7, name: '操作系统' },
       { id: 8, name: '计算机网络' }
     ]
     resourceCategories.value = defaultCourses
     questionCourses.value = defaultCourses // 同时更新提问的课程列表
   } finally {
     loadingCourses.value = false
   }
 }

 // 编辑问题
 const editQuestion = async (question) => {
   try {
     console.log('编辑问题:', question)
     
     // 重置新上传的图片URL
     newQuestionImageUrl.value = ''
     
     // 通过GET请求获取问题详情
     const response = await fetch(`/api/v1/question/${question.id}`)
     
     if (!response.ok) {
       throw new Error(`获取问题详情失败! status: ${response.status}`)
     }
     
     const result = await response.json()
     console.log('问题详情响应:', result)
     
     if (result.code === 1) {
       const questionData = result.data
       
       // 填充编辑表单
       editQuestionForm.value = {
         id: questionData.id,
         title: questionData.title || questionData.questionTitle || '',
         description: questionData.description || questionData.content || '',
         questionType: questionData.questionType || '',
         classBelong: questionData.classBelong || '',
         imageUrl: questionData.imageUrl || questionData.image || ''
       }
       
       // 显示编辑对话框
       editQuestionDialogVisible.value = true
       ElMessage.success('问题详情加载成功')
     } else {
       ElMessage.error(result.msg || '获取问题详情失败')
     }
   } catch (error) {
     console.error('编辑问题失败:', error)
     ElMessage.error('获取问题详情失败，请重试')
   }
 }

 // 保存编辑的问题
 const saveQuestion = async () => {
   if (!editQuestionFormRef.value) return

   try {
     const valid = await editQuestionFormRef.value.validate()
     if (!valid) return

     savingQuestion.value = true

     // 构建更新数据
     const updateData = {
       id: editQuestionForm.value.id,
       title: editQuestionForm.value.title,
       description: editQuestionForm.value.description,
       questionType: editQuestionForm.value.questionType,
       classBelong: editQuestionForm.value.classBelong,
       // 如果上传了新图片则使用新URL，否则保持原URL不变
       imageUrl: newQuestionImageUrl.value || editQuestionForm.value.imageUrl
     }

     console.log('发送更新问题请求:', updateData)

     // 调用后端更新接口
     const response = await fetch('/api/v1/question', {
       method: 'PUT',
       headers: {
         'Content-Type': 'application/json',
         'Authorization': `Bearer ${localStorage.getItem('token')}`
       },
       body: JSON.stringify(updateData)
     })

     if (!response.ok) {
       throw new Error('更新问题失败')
     }

     const result = await response.json()
     if (result.code === 1) {
       ElMessage.success('问题更新成功!')
       
       // 刷新问题列表
       await loadUserQuestions()
       
       // 关闭对话框
       editQuestionDialogVisible.value = false
       editQuestionFormRef.value?.resetFields()
       // 重置新上传的图片URL
       newQuestionImageUrl.value = ''
     } else {
       ElMessage.error(result.msg || '更新问题失败')
     }
   } catch (error) {
     console.error('保存问题失败:', error)
     ElMessage.error('保存问题失败，请重试')
   } finally {
     savingQuestion.value = false
   }
 }

 // 关闭问题编辑对话框
 const handleCloseQuestionDialog = () => {
   editQuestionDialogVisible.value = false
   editQuestionFormRef.value?.resetFields()
   // 重置新上传的图片URL
   newQuestionImageUrl.value = ''
 }

 // 加载用户统计数据
 const fetchUserStats = async () => {
   try {
     if (!authStore.userInfo?.username) {
       console.warn('用户信息不存在，使用默认统计数据')
       userStats.value = {
         questions: 0,
         resources: 0
       }
       return
     }

     // 调用后端API获取用户上传资源数量
     const resourceResponse = await fetch(`/api/v1/resource/findUploadCount/${authStore.userInfo.username}`)
     
     if (!resourceResponse.ok) {
       throw new Error(`获取上传资源数量失败! status: ${resourceResponse.status}`)
     }
     
     const resourceResult = await resourceResponse.json()
     
     // 调用后端API获取用户提问数量（使用用户ID作为路径参数）
     const questionResponse = await fetch(`/api/v1/question/findCountByUserId/${authStore.userInfo.id}`)
     
     if (!questionResponse.ok) {
       throw new Error(`获取提问数量失败! status: ${questionResponse.status}`)
     }
     
     const questionResult = await questionResponse.json()
     
     if (resourceResult.code === 1 && questionResult.code === 1) {
       // 使用真实的上传资源数量和提问数量
       userStats.value = {
         questions: questionResult.data || 0,
         resources: resourceResult.data || 0
       }
       console.log('成功获取用户统计数据:', {
         questions: questionResult.data,
         resources: resourceResult.data
       })
     } else {
       throw new Error(`API返回错误: 资源-${resourceResult.msg}, 提问-${questionResult.msg}`)
     }
   } catch (error) {
     console.error('获取统计数据失败:', error)
     // 失败时使用默认值
     userStats.value = {
       questions: 0,
       resources: 0
     }
   }
 }

 // 加载用户回答数据
 const loadUserAnswers = async () => {
   try {
     const currentUser = authStore.userInfo
     if (!currentUser?.id) {
       console.warn('用户ID不存在，无法加载回答数据')
       userAnswers.value = []
       return
     }

     // 调用查询当前用户回答问题的接口
     const response = await fetch(`/api/v1/answer/findAnswers/${currentUser.id}`)
     
     if (!response.ok) {
       throw new Error(`获取用户回答失败! status: ${response.status}`)
     }
     
     const result = await response.json()
     console.log('用户回答接口响应:', result)
     
     if (result.code === 1 && result.data) {
       // 处理回答数据，获取对应的问题信息
       const answersWithQuestions = await Promise.all(
         result.data.map(async (answer) => {
           try {
             // 使用questionId获取对应的问题信息
             const questionResponse = await fetch(`/api/v1/question/${answer.questionId}`)
             
             if (!questionResponse.ok) {
               throw new Error(`获取问题信息失败! status: ${questionResponse.status}`)
             }
             
             const questionResult = await questionResponse.json()
             
             if (questionResult.code === 1 && questionResult.data) {
               const questionData = questionResult.data
               return {
                 ...answer,
                 questionTitle: questionData.title || questionData.questionTitle || '未命名问题',
                 createTime: answer.createTime || answer.createdAt || new Date().toISOString(),
                 upvotes: answer.upvotes || 0,
                 isAccepted: answer.isAccepted || false
               }
             } else {
               console.warn(`获取问题${answer.questionId}信息失败:`, questionResult.msg)
               return {
                 ...answer,
                 questionTitle: '问题信息获取失败',
                 createTime: answer.createTime || answer.createdAt || new Date().toISOString(),
                 upvotes: answer.upvotes || 0,
                 isAccepted: answer.isAccepted || false
               }
             }
           } catch (error) {
             console.error(`获取问题${answer.questionId}信息失败:`, error)
             return {
               ...answer,
               questionTitle: '问题信息获取失败',
               createTime: answer.createTime || answer.createdAt || new Date().toISOString(),
               upvotes: answer.upvotes || 0,
               isAccepted: answer.isAccepted || false
             }
           }
         })
       )
       
       userAnswers.value = answersWithQuestions
       console.log('成功加载用户回答数据:', userAnswers.value)
     } else {
       console.warn('用户回答接口返回空数据或失败:', result.msg)
       userAnswers.value = []
     }
   } catch (error) {
     console.error('加载用户回答失败:', error)
     ElMessage.error('加载回答数据失败，请重试')
     // 失败时使用空数组
     userAnswers.value = []
   }
 }

 // 加载用户数据

 // 重新加载活动数据
 const reloadActivities = async () => {
   await loadRecentActivities()
 }

 // 时间格式化函数
 const formatTime = (timeStr) => {
   if (!timeStr) return '未知时间'
   
   try {
     const date = new Date(timeStr)
     const now = new Date()
     const diffMs = now - date
     const diffMins = Math.floor(diffMs / (1000 * 60))
     const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
     const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
     
     if (diffMins < 1) return '刚刚'
     if (diffMins < 60) return `${diffMins}分钟前`
     if (diffHours < 24) return `${diffHours}小时前`
     if (diffDays < 7) return `${diffDays}天前`
     
     // 超过一周显示具体日期
     return date.toLocaleDateString('zh-CN', {
       year: 'numeric',
       month: '2-digit',
       day: '2-digit'
     })
   } catch (error) {
     console.error('时间格式化失败:', error)
     return '时间格式错误'
   }
 }

 // 加载最近活动数据
 const loadRecentActivities = () => {
   try {
     const activities = []
     
     // 从用户提问数据生成活动记录
     userQuestions.value.forEach(question => {
       activities.push({
         id: `question_${question.id}`,
         type: 'question',
         title: `发布了新问题：${question.title || question.questionTitle || '未命名问题'}`,
         time: question.createTime || question.createdAt || new Date().toISOString(),
         originalData: question
       })
     })
     
     // 从用户回答数据生成活动记录
     userAnswers.value.forEach(answer => {
       activities.push({
         id: `answer_${answer.id}`,
         type: 'answer',
         title: `回答了问题：${answer.questionTitle || '未命名问题'}`,
         time: answer.createTime || answer.createdAt || new Date().toISOString(),
         originalData: answer
       })
     })
     
     // 从用户资源数据生成活动记录
     userResources.value.forEach(resource => {
       activities.push({
         id: `resource_${resource.id}`,
         type: 'resource',
         title: `上传了新资源：${resource.title || '未命名资源'}`,
         time: resource.createTime || resource.createdAt || new Date().toISOString(),
         originalData: resource
       })
     })
     
     // 按时间戳从近到远排序
     activities.sort((a, b) => new Date(b.time) - new Date(a.time))
     
     // 只保留最新的10条活动记录
     recentActivities.value = activities.slice(0, 10)
     
     console.log('加载最近活动成功，共', activities.length, '条记录')
   } catch (error) {
     console.error('加载最近活动失败:', error)
     // 如果加载失败，使用默认的模拟数据作为回退
     recentActivities.value = [
       {
         id: 1,
         type: 'question',
         title: '发布了新问题：Vue 3 响应式原理',
         time: '2024-01-15T10:30:00Z'
       },
       {
         id: 2,
         type: 'answer',
         title: '回答了问题：前端性能优化',
         time: '2024-01-12T16:45:00Z'
       }
     ]
   }
 }




</script>

<style scoped>
.user-profile {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.breadcrumb {
  margin-bottom: 20px;
}

.profile-container {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.profile-sidebar {
  flex: 0 0 300px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-content {
  flex: 1;
  min-width: 0;
}

.user-card {
  text-align: center;
}

.user-info {
  padding: 15px 0;
}

.avatar-section {
  margin-bottom: 20px;
}

.user-status {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ccc;
}

.status-dot.online {
  background-color: #67c23a;
}

.status-text {
  font-size: 12px;
  color: #666;
}

.user-details {
  margin-bottom: 20px;
}

.username {
  font-size: 24px;
  font-weight: 600;
  margin: 10px 0 5px;
  color: #303133;
}

.user-title {
  color: #909399;
  margin: 5px 0 10px;
  font-size: 14px;
}

.user-bio {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  margin: 10px 0;
}

.user-stats {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
}

.stat-item {
  background: white;
  padding: 12px;
  border-radius: 6px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  min-width: 80px;
}

.stat-number {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.user-actions {
  margin: 20px 0;
}

.user-meta {
  text-align: left;
  margin-top: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
  color: #606266;
  font-size: 14px;
}

.skills-card,
.activity-card {
  text-align: left;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-tag {
  margin: 2px;
}

.activity-list {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  color: #409eff;
}

.activity-content {
  flex: 1;
}

.activity-title {
  margin: 0 0 4px;
  font-size: 14px;
  color: #303133;
}

.activity-time {
  font-size: 12px;
  color: #909399;
}

.no-activity {
  text-align: center;
  color: #909399;
  padding: 20px;
}

/* 标签页样式 */
.profile-tabs {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.tab-content {
  padding: 20px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.content-header h3 {
  margin: 0;
  color: #303133;
}

/* 搜索筛选器样式 */
.search-filter {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.search-filter .el-row {
  align-items: center;
}

.query-btn {
  margin-right: 8px;
}

.loading-container {
  padding: 20px;
  text-align: center;
}

/* 列表项通用样式 */
.questions-list,
.answers-list,
.resources-list,
.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.question-item,
.answer-item,
.resource-item,
.favorite-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 16px 16px 16px 8px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.question-main,
.answer-main,
.resource-info,
.favorite-info {
  flex: 1;
}

.answer-main {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.question-title,
.favorite-title {
  margin: 0 0 8px;
  font-size: 16px;
  color: #303133;
}

.question-title a,
.favorite-title a {
  color: inherit;
  text-decoration: none;
}

.question-title a:hover,
.favorite-title a:hover {
  color: #409eff;
}

.question-description,
.answer-text,
.resource-description,
.favorite-description {
  margin: 0 0 12px;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.question-meta,
.answer-meta,
.resource-meta,
.favorite-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #909399;
  flex-wrap: wrap;
}

.question-author,
.question-type,
.question-course,
.question-solved {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  background: #fff;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.question-actions,
.answer-actions,
.resource-actions,
.favorite-actions {
  display: flex;
  gap: 8px;
}

.no-data {
  text-align: center;
  padding: 40px 20px;
}

/* 账户设置对话框样式 */
.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 资源编辑对话框样式 */
.resource-edit-detail {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 10px;
}

.detail-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.detail-section h4 {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  border-left: 4px solid #409eff;
  padding-left: 12px;
}

.file-management {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.current-file {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #fff;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-label {
  font-weight: 600;
  color: #303133;
}

.info-value {
  color: #606266;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-section {
  text-align: center;
  padding: 20px;
  background: #fff;
  border-radius: 6px;
  border: 2px dashed #e9ecef;
}

.upload-tip {
  margin-bottom: 12px;
  color: #606266;
  font-size: 14px;
}

.upload-note {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

.resource-upload {
  display: inline-block;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-container {
    flex-direction: column;
  }

  .profile-sidebar {
    flex: none;
    width: 100%;
  }

  .user-stats {
    gap: 20px;
  }

  .question-item,
  .answer-item,
  .resource-item,
  .favorite-item {
    flex-direction: column;
    gap: 12px;
  }

  .question-actions,
  .answer-actions,
  .resource-actions,
  .favorite-actions {
    justify-content: flex-end;
    width: 100%;
  }

  .current-file {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .info-value {
    max-width: 200px;
  }
}

/* 管理员控制台样式 */
.admin-dashboard {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.admin-title {
  text-align: center;
  margin-bottom: 32px;
  color: #303133;
  font-size: 24px;
  font-weight: 600;
}

.admin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.admin-item {
  transition: transform 0.2s ease;
}

.admin-item:hover {
  transform: translateY(-4px);
}

.admin-card {
  height: 100%;
  text-align: center;
  border: none;
  transition: all 0.3s ease;
}

.admin-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.admin-icon {
  font-size: 48px;
  color: #409eff;
  margin-bottom: 16px;
}

.admin-card h3 {
  margin: 0 0 12px;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
}

.admin-card p {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .admin-dashboard {
    padding: 16px;
  }
  
  .admin-title {
    font-size: 20px;
    margin-bottom: 24px;
  }
  
  .admin-icon {
    font-size: 36px;
  }
}
</style>