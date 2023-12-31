<script setup lang="ts">
import { useMemberStore } from '@/stores'
import { getMemberProfileAPI, putMemberProfileAPI } from '@/services/profile'
import { onLoad } from '@dcloudio/uni-app'
import type { Gender, ProfileDetail } from '@/types/member'
import { ref } from 'vue'

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()
// 获取个人信息  // todo 修改用户信息需提供初始值 {} as ProfileDetail
const profile = ref<ProfileDetail>({} as ProfileDetail)
const getMemberProfile = async () => {
  const res = await getMemberProfileAPI()
  profile.value = res.result
}
onLoad(() => {
  getMemberProfile()
})

const memberStore = useMemberStore()
// 修改头像
const onAvatarChange = () => {
  /* #ifdef MP-WEIXIN */
  // 调用拍照/选择图片
  uni.chooseMedia({
    // 文件个数
    count: 1,
    // 文件类型
    mediaType: ['image'],
    success: (res) => {
      // console.log(res)
      // 文件路径
      const { tempFilePath } = res.tempFiles[0]
      // 上传图片
      uploadFile(tempFilePath)
    },
  })
  /* #endif */
  /* #ifdef APP-PLUS || H5 */
  uni.chooseImage({
    count: 1,
    success: (res) => {
      // 文件路径
      const tempFilePath = res.tempFilePaths[0]
      // 上传图片
      uploadFile(tempFilePath)
    },
  })
  /* #endif */
}

// 文件上传 （封装）
const uploadFile = (tempFilePath: string) => {
  // 文件上传
  uni.uploadFile({
    url: '/member/profile/avatar',
    name: 'file',
    filePath: tempFilePath,
    success: (res) => {
      console.log(res)
      if (res.statusCode === 200) {
        // 个人中心页面头像更新
        const avatar = JSON.parse(res.data).result.avatar
        // store中的个人头像更新
        memberStore.profile!.avatar = avatar
        profile.value!.avatar = avatar
        uni.showToast({ icons: 'success', title: '更新成功' })
      } else {
        uni.showToast({ icons: 'error', title: '出现错误' })
      }
    },
  })
}

// 修改用户性别
const onGenderChange: UniHelper.RadioGroupOnChange = (ev) => {
  profile.value.gender = ev.detail.value as Gender
}
// 修改出生日期
const onBirthdayChange: UniHelper.DatePickerOnChange = (ev) => {
  profile.value.birthday = ev.detail.value
}
// 修改城市信息
let fullLocationCode: [string, string, string] = ['', '', '']
const onPlaceChange: UniHelper.RegionPickerOnChange = (ev) => {
  // console.log(ev.detail)
  //修改前端界面
  profile.value.fullLocation = ev.detail.value.join(' ')
  // 提交后端更新
  fullLocationCode = ev.detail.code!
}

// 修改用户信息
const onSubmit = async () => {
  // console.log(profile, 'profile')
  const [provinceCode, cityCode, countyCode] = fullLocationCode
  const { nickname, gender, birthday, profession } = profile.value
  const params1 = { nickname, gender, birthday, profession }
  const params2 = { nickname, gender, birthday, profession, provinceCode, cityCode, countyCode }
  if (!fullLocationCode[0]) {
    // 只修改专业
    const res = await putMemberProfileAPI(params1)
    memberStore.profile!.nickname = res.result.nickname
  } else {
    const res = await putMemberProfileAPI(params2)
    memberStore.profile!.nickname = res.result.nickname
  }
  uni.showToast({ icons: 'success', title: '修改成功' })
  setTimeout(() => {
    uni.navigateBack()
  }, 500)
}

//! 遗留问题：当修改了专业之后，城市会为空 没走onPlaceChange事件，所以fullLocationCode为空，拿不到数据
</script>

<template>
  <view class="viewport">
    <!-- 导航栏 -->
    <view class="navbar" :style="{ paddingTop: safeAreaInsets?.top + 'px' }">
      <navigator open-type="navigateBack" class="back icon-left" hover-class="none"></navigator>
      <view class="title">个人信息</view>
    </view>
    <!-- 头像 -->
    <view class="avatar">
      <view class="avatar-content" @tap="onAvatarChange">
        <image class="image" :src="profile?.avatar" mode="aspectFill" />
        <text class="text">点击修改头像</text>
      </view>
    </view>
    <!-- 表单 -->
    <view class="form">
      <!-- 表单内容 -->
      <view class="form-content">
        <view class="form-item">
          <text class="label">账号</text>
          <text class="account">{{ profile?.account }}</text>
        </view>
        <view class="form-item">
          <text class="label">昵称</text>
          <input class="input" type="text" placeholder="请填写昵称" v-model="profile!.nickname" />
        </view>
        <view class="form-item">
          <text class="label">性别</text>
          <radio-group @change="onGenderChange">
            <label class="radio">
              <radio value="男" color="#27ba9b" :checked="profile?.gender === '男'" />
              男
            </label>
            <label class="radio">
              <radio value="女" color="#27ba9b" :checked="profile?.gender === '女'" />
              女
            </label>
          </radio-group>
        </view>
        <view class="form-item">
          <text class="label">生日</text>
          <picker
            class="picker"
            mode="date"
            start="1900-01-01"
            :end="new Date()"
            :value="profile?.birthday"
            @change="onBirthdayChange"
          >
            <view v-if="profile?.birthday">{{ profile?.birthday }}</view>
            <view class="placeholder" v-else>请选择日期</view>
          </picker>
        </view>
        <view class="form-item">
          <text class="label">城市</text>
          <picker
            class="picker"
            mode="region"
            :value="profile?.fullLocation?.split(' ')"
            @change="onPlaceChange"
          >
            <view v-if="profile?.fullLocation">{{ profile.fullLocation }}</view>
            <view class="placeholder" v-else>请选择城市</view>
          </picker>
        </view>
        <view class="form-item">
          <text class="label">职业</text>
          <input class="input" type="text" placeholder="请填写职业" v-model="profile!.profession" />
        </view>
      </view>
      <!-- 提交按钮 -->
      <button class="form-button" @tap="onSubmit">保 存</button>
    </view>
  </view>
</template>

<style lang="scss">
page {
  background-color: #f4f4f4;
}

.viewport {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-image: url(https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/order_bg.png);
  background-size: auto 420rpx;
  background-repeat: no-repeat;
}

// 导航栏
.navbar {
  position: relative;

  .title {
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    font-weight: 500;
    color: #fff;
  }

  .back {
    position: absolute;
    height: 40px;
    width: 40px;
    left: 0;
    font-size: 20px;
    color: #fff;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

// 头像
.avatar {
  text-align: center;
  width: 100%;
  height: 260rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .image {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    background-color: #eee;
  }

  .text {
    display: block;
    padding-top: 20rpx;
    line-height: 1;
    font-size: 26rpx;
    color: #fff;
  }
}

// 表单
.form {
  background-color: #f4f4f4;

  &-content {
    margin: 20rpx 20rpx 0;
    padding: 0 20rpx;
    border-radius: 10rpx;
    background-color: #fff;
  }

  &-item {
    display: flex;
    height: 96rpx;
    line-height: 46rpx;
    padding: 25rpx 10rpx;
    background-color: #fff;
    font-size: 28rpx;
    border-bottom: 1rpx solid #ddd;

    &:last-child {
      border: none;
    }

    .label {
      width: 180rpx;
      color: #333;
    }

    .account {
      color: #666;
    }

    .input {
      flex: 1;
      display: block;
      height: 46rpx;
    }

    .radio {
      margin-right: 20rpx;
    }

    .picker {
      flex: 1;
    }
    .placeholder {
      color: #808080;
    }
  }

  &-button {
    height: 80rpx;
    text-align: center;
    line-height: 80rpx;
    margin: 30rpx 20rpx;
    color: #fff;
    border-radius: 80rpx;
    font-size: 30rpx;
    background-color: #27ba9b;
  }
}
</style>
