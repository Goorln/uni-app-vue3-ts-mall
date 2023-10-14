<script setup lang="ts">
import { getGuessLikeAPI } from '@/services/home'
import { ref, onMounted } from 'vue'
import type { GuessItem } from '@/types/home'
import type { PageParams } from '@/types/global'

// 分页参数  Required表示必须传这个数据
const pageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}

// 分页结束标记
const finish = ref(false)
const guessLikeList = ref<GuessItem[]>([])

// 获取猜你喜欢数据
const getGussLikeData = async () => {
  if (finish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据了' })
  }
  const res = await getGuessLikeAPI(pageParams)
  // guessLikeList.value = res.result.items
  // 数组追加
  guessLikeList.value.push(...res.result.items)
  if (pageParams.page < res.result.pages) {
    pageParams.page++
  } else {
    finish.value = true
  }
}

// 重置数据的方法
const resetData = () => {
  // 重置页码
  pageParams.page = 1
  // 重置数据
  guessLikeList.value = []
  // 重置结束标记
  finish.value = false
}

// 组件挂载完毕
onMounted(() => {
  getGussLikeData()
})

// 暴露方法
defineExpose({
  resetData,
  getMore: getGussLikeData,
})
</script>

<template>
  <!-- 猜你喜欢 -->
  <view class="caption">
    <text class="text">猜你喜欢</text>
  </view>
  <view class="guess">
    <navigator
      class="guess-item"
      v-for="item in guessLikeList"
      :key="item.id"
      :url="`/pages/goods/goods?id=${item.id}`"
    >
      <image class="image" mode="aspectFill" :src="item.picture"></image>
      <view class="name"> {{ item.desc }} </view>
      <view class="price">
        <text class="small">¥</text>
        <text>{{ item.price }}</text>
      </view>
    </navigator>
  </view>
  <view class="loading-text">{{ finish ? '' : ' 正在加载...' }} </view>
</template>

<style lang="scss">
/* 猜你喜欢 */
@import '@/components/styles/XtxGuess.scss';

:host {
  display: block;
}


</style>
