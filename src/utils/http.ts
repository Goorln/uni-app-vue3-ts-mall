import { useMemberStore } from '@/stores'

// 请求基地址
const baseURL = 'https://pcapi-xiaotuxian-front-devtest.itheima.net'

// 添加拦截器
const httpInterceptor = {
  // 拦截前触发
  invoke(options: UniApp.RequestOptions) {
    // 1.非http开头需要拼接地址
    if (!options.url.startsWith('http')) {
      options.url = baseURL + options.url
    }
    // 2.请求超时，
    options.timeout = 10000
    // 3.添加小程序端请求的标识
    options.header = {
      // 如果有传过来header，要保留
      ...options.header,
      'source-client': 'miniapp',
    }
    // 4.添加token请求标识
    const memberStore = useMemberStore()
    const token = memberStore.profile?.token
    if (token) {
      options.header.Authorization = token
    }
  },
}
uni.addInterceptor('request', httpInterceptor)
uni.addInterceptor('request', httpInterceptor)

// 请求函数
interface Data<T> {
  code: string
  msg: string
  result: T
}
// 2.2 添加类型 支持泛型
export const http = <T>(options: UniApp.RequestOptions) => {
  // 1. 返回promise对象
  return new Promise<Data<T>>((resolve, reject) => {
    uni.request({
      ...options,
      // 2.响应成功
      success(res) {
        // 状态码 2xx 表示成功请求到数据
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 2.1 提取核心数据 res.data
          resolve(res.data as Data<T>)
        } else if (res.statusCode === 401) {
          // 401错误 -> 清理用户信息，跳转到登录页面
          const memberStore = useMemberStore()
          memberStore.clearProfile()
          uni.navigateTo({ url: '/pages/login/login' })
          // 标记失败，回传失败数据
          reject(res)
        } else {
          // 其他错误 -> 根据后端错误轻提示
          uni.showToast({
            icon: 'none',
            title: (res.data as Data<T>).msg || '请求错误！',
          })
          // 标记失败，回传失败数据
          reject(res)
        }
      },
      // 响应失败
      fail(err) {
        uni.showToast({
          icon: 'none',
          title: '网络错误，换个网络试试！',
        })
        reject(err)
      },
    })
  })
}
